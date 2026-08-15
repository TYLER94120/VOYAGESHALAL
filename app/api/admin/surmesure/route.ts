import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { checkAdmin } from '@/lib/adminAuth'

// 📊 GET /api/admin/surmesure?token=… → LES CHIFFRES DU SUR MESURE.
//
// « Un widget qu'on ne mesure pas n'existe pas » (§5 de l'ordre du 14 août
// au soir). Les compteurs étaient bien ÉCRITS à chaque recherche — mais
// personne ne les LISAIT. Un compteur qu'on ne peut pas ouvrir vaut
// exactement autant qu'un compteur absent : on ne saura jamais si le
// widget sert, ni s'il rend des écrans vides.
//
// Lecture seule, protégé par ADMIN_TOKEN — le même que /api/admin/leads,
// donc aucune nouvelle variable à poser dans Vercel : ça marche tout de
// suite. Ce ne sont que des totaux, aucune donnée personnelle : ni
// position, ni requête, ni profil. Le profil alimentaire, lui, ne quitte
// jamais le téléphone — il n'y a donc rien à en compter ici, sinon le
// nombre de recherches qui en ont bénéficié.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Les clés écrites par /api/lieux et /api/lieux/mesure, avec ce qu'elles
 *  veulent dire — un tableau de chiffres sans légende ne se lit pas. */
const COMPTEURS: [string, string][] = [
  ['surmesure:recherches', 'recherches lancées'],
  ['surmesure:ecrites', 'recherches où le visiteur a ÉCRIT sa demande'],
  ['surmesure:avec', 'recherches qui ont rendu au moins une adresse'],
  ['surmesure:vides', 'recherches qui n’ont rien rendu'],
  ['surmesure:relache', 'recherches où il a fallu relâcher un critère'],
  ['surmesure:avec-profil', 'recherches affinées par un profil alimentaire'],
  ['surmesure:itineraires', 'appuis sur « Itinéraire » — le geste qui compte'],
  ['surmesure:fiches-ouvertes', 'fiches ouvertes'],
  ['surmesure:appels', 'appuis sur « Appeler »'],
  ['surmesure:choisis-pour-moi', 'appuis sur ✨ « choisis pour moi »'],
  ['surmesure:piste', 'pistes suivies'],
  ['surmesure:barre-ville', 'barre unique : « à cette ville » choisi'],
  ['surmesure:barre-autour', 'barre unique : « autour de moi » choisi'],
  ['surmesure:cat-mosquee', 'bouton 🕌 Prier'],
  ['surmesure:cat-manger', 'bouton 🍽️ Manger'],
  ['surmesure:cat-activite', 'bouton 🎯 Que faire'],
  ['surmesure:relances-sautees', 'relances sautées (« passe »)'],
  ['surmesure:profil-cree', 'profils alimentaires créés'],
]

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const redis = getRedis()
  if (!redis) {
    // On ne rend pas des zéros : zéro voudrait dire « personne n'a cherché »,
    // alors que la vérité est « on ne sait pas ». La différence est tout.
    return NextResponse.json({ erreur: 'Base non configurée (UPSTASH manquant) — compteurs inconnus, pas nuls.' }, { status: 200 })
  }

  const cles = COMPTEURS.map(([k]) => k)
  let valeurs: (number | null)[] = []
  try { valeurs = await redis.mget<(number | null)[]>(...cles) } catch {
    return NextResponse.json({ erreur: 'Base injoignable — compteurs inconnus, pas nuls.' }, { status: 200 })
  }

  const n = (i: number) => Number(valeurs[i] ?? 0)
  const compteurs = COMPTEURS.map(([cle, libelle], i) => ({ cle, libelle, valeur: n(i) }))
  const recherches = n(0), avec = n(2), vides = n(3)
  const abouties = avec + vides

  // Les zones où l'on a dû élargir : c'est là qu'il manque des adresses,
  // donc là où le prochain travail de terrain rapporte le plus.
  let zonesRelache: { zone: string; fois: number }[] = []
  try {
    const z = await redis.zrange<(string | number)[]>('surmesure:relache:zones', 0, 9, { rev: true, withScores: true })
    for (let i = 0; i < z.length; i += 2) zonesRelache.push({ zone: String(z[i]), fois: Number(z[i + 1]) })
  } catch { zonesRelache = [] }

  return NextResponse.json({
    compteurs,
    // Les deux seuls ratios qui disent si le widget SERT. On ne les calcule
    // que s'il y a de quoi : un pourcentage sur trois recherches est du bruit.
    taux: abouties >= 20
      ? {
        avecResultat: Math.round((avec / abouties) * 100) + ' %',
        aVide: Math.round((vides / abouties) * 100) + ' %',
        ecrit: recherches ? Math.round((n(1) / recherches) * 100) + ' %' : null,
      }
      : { note: `Trop peu de recherches abouties (${abouties}) pour un pourcentage honnête.` },
    zonesRelache,
    lu: new Date().toISOString(),
  })
}
