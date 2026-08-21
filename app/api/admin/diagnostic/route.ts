import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { CRITERES_DEFAUT, type Categorie } from '@/lib/criteres'
import { minutes } from '@/lib/trajet'

// 🔬 GET /api/admin/diagnostic?token=…&lieu=fontenay
//
// POURQUOI CETTE ROUTE EXISTE.
//
// Mohamed me demande depuis trois cycles les NOMS des adresses trouvées
// depuis Fontenay-sous-Bois. Je ne peux pas les lui donner : le bac à
// sable où je travaille n'a pas la clé Google, et le proxy me refuse
// voyageshalal.fr. Je ne vais pas inventer des noms — c'est exactement ce
// que ce site s'interdit.
//
// Il a proposé de m'envoyer la clé. J'ai refusé : une clé collée dans une
// conversation est une clé publiée (historique, journaux, résumés), et
// mes essais se factureraient sur son plafond de 200 €.
//
// Cette route est la réponse propre : elle tourne SUR LE SERVEUR, avec la
// vraie clé de production, lance les trois recherches, et rend les noms et
// les distances en clair. Mohamed ouvre une adresse, colle la réponse.
// Rien n'est exposé, et ce qui est vérifié est exactement ce qu'un
// visiteur voit — pas ce que verrait une clé de test.
//
// Elle interroge NOTRE PROPRE /api/lieux, jamais Google en direct : c'est
// le moteur complet qui est mis à l'épreuve, portes par catégorie et
// filtre alcool compris. Un diagnostic qui court-circuiterait le moteur ne
// diagnostiquerait rien.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Quelques points de départ connus, pour ne pas avoir à taper des
 *  coordonnées à la main sur un téléphone. */
const LIEUX: Record<string, { nom: string; lat: number; lng: number }> = {
  fontenay: { nom: 'Fontenay-sous-Bois', lat: 48.8514, lng: 2.4771 },
  paris: { nom: 'Paris centre', lat: 48.8566, lng: 2.3522 },
  tirana: { nom: 'Tirana', lat: 41.3275, lng: 19.8187 },
  berkane: { nom: 'Berkane', lat: 34.9218, lng: -2.3200 },
}

const CATEGORIES: Categorie[] = ['mosquee', 'manger', 'activite']

/**
 * 🍣 LE MODE ENVIE — « on a la clé, implémente-la pour la prévisualisation »
 * (Mohamed, 20 août).
 *
 * Le filtre d'envie (une envie de sushi ne rend jamais une pizza) ne peut
 * pas être éprouvé depuis l'atelier : il n'y a ni clé Google ni accès au
 * domaine. Cette route, elle, tourne SUR le déploiement — prévisualisation
 * comprise — avec la vraie clé, et rend en clair ce qu'il faut voir :
 * jusqu'où on a cherché, ce que Google a proposé, et ce qui a été retenu
 * avec son type. S'il reste une pizza dans une demande de sushi, elle est
 * visible ligne à ligne.
 *
 *   /api/admin/diagnostic?token=…&envie=sushi
 *   /api/admin/diagnostic?token=…&envie=toutes&lieu=paris
 */
const REQUETE_ENVIE: Record<string, string> = {
  sushi: 'sushi', pizza: 'pizza', burger: 'burger', kebab: 'kebab',
  poulet: 'poulet grillé', indien: 'restaurant indien', turc: 'restaurant turc',
  maghrebin: 'restaurant marocain', asiatique: 'restaurant asiatique', dessert: 'pâtisserie',
}

async function testerEnvie(origin: string, depart: { lat: number; lng: number }, envieId: string) {
  const r = await fetch(`${origin}/api/lieux`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: depart.lat, lng: depart.lng, lang: 'fr', ecrit: false,
      criteres: { ...CRITERES_DEFAUT, categorie: 'manger', motsCles: REQUETE_ENVIE[envieId] ?? envieId, envieId },
    }),
  })
  const j = await r.json()
  const toutes = [...(j.fiches ?? []), ...(j.autres ?? [])] as {
    nom: string; distanceM: number; note?: number; nbAvis?: number; cuisine?: string
  }[]
  return {
    envie: envieId,
    rayonAtteintKm: j.rayonAtteintKm ?? null,
    etatGoogle: j.etatGoogle,
    depuisLeCache: !!j.cache,
    // Chaque étage, en clair : c'est ce qui distingue « Google n'a rien »
    // de « tout a été écarté », et évite de corriger au jugé.
    candidatsGoogle: j.candidatsEnvie ?? null,
    ecartesCarPasLeBonPlat: j.ecartesEnvie ?? 0,
    ecartesCarAlcool: j.ecartesAlcool ?? 0,
    retenues: toutes.length,
    // Le contrôle qui compte : lire les noms. Une seule pizza ici sur une
    // demande de sushi, et le filtre est à revoir.
    adresses: toutes.slice(0, 20).map((f) => ({
      nom: f.nom,
      cuisine: f.cuisine ?? null,
      note: f.note != null ? `${f.note} · ${f.nbAvis ?? '?'} avis` : null,
      distance: f.distanceM < 1000 ? `${Math.round(f.distanceM)} m` : `${(f.distanceM / 1000).toFixed(1)} km`,
    })),
  }
}

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const u = new URL(req.url)
  const cle = (u.searchParams.get('lieu') ?? 'fontenay').toLowerCase()
  const lat = parseFloat(u.searchParams.get('lat') ?? '')
  const lng = parseFloat(u.searchParams.get('lng') ?? '')
  const depart = Number.isFinite(lat) && Number.isFinite(lng)
    ? { nom: `${lat},${lng}`, lat, lng }
    : LIEUX[cle]
  if (!depart) {
    return NextResponse.json({ erreur: `lieu inconnu — connus : ${Object.keys(LIEUX).join(', ')}` }, { status: 400 })
  }

  const origin = u.origin
  const resultats: Record<string, unknown> = {}

  // ── Mode envie : on éprouve la précision, pas la couverture ──
  const envie = (u.searchParams.get('envie') ?? '').toLowerCase()
  if (envie) {
    const ids = envie === 'toutes' ? Object.keys(REQUETE_ENVIE) : [envie]
    const essais = []
    for (const id of ids) {
      try { essais.push(await testerEnvie(origin, depart, id)) }
      catch (e) { essais.push({ envie: id, erreur: String(e).slice(0, 160) }) }
    }
    return NextResponse.json({
      depart: depart.nom,
      coordonnees: `${depart.lat}, ${depart.lng}`,
      lu: new Date().toISOString(),
      regle: 'Une envie part à 10 km. Seul le plat demandé est retenu — le reste n\'est pas montré.',
      essais,
      aide: 'Ajoute &envie=toutes pour les dix envies, &lieu=paris ou &lat=..&lng=.. pour un autre point.',
    })
  }

  for (const categorie of CATEGORIES) {
    try {
      const r = await fetch(`${origin}/api/lieux`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: depart.lat, lng: depart.lng, lang: 'fr', ecrit: false,
          criteres: { ...CRITERES_DEFAUT, categorie, mode: 'pied' },
        }),
      })
      const j = await r.json()
      const mode = j.mode ?? 'voiture'
      resultats[categorie] = {
        source: j.source, etatGoogle: j.etatGoogle,
        // La phrase EXACTE de Google quand il refuse — jamais reformulée.
        diagnostic: j.diagnostic ?? null,
        depuisLeCache: !!j.cache,
        adresses: (j.fiches ?? []).map((f: { nom: string; distanceM: number; note?: number; nbAvis?: number; statut: string }) => ({
          nom: f.nom,
          distance: f.distanceM < 1000 ? `${Math.round(f.distanceM)} m` : `${(f.distanceM / 1000).toFixed(1)} km`,
          trajet: `≈ ${minutes(f.distanceM, mode)} min ${mode === 'pied' ? 'à pied' : mode === 'voiture' ? 'en voiture' : 'en transports'}`,
          note: f.note != null ? `${f.note} · ${f.nbAvis ?? '?'} avis` : null,
          statut: f.statut,
        })),
      }
    } catch (e) {
      resultats[categorie] = { erreur: String(e).slice(0, 160) }
    }
  }

  return NextResponse.json({
    depart: depart.nom,
    coordonnees: `${depart.lat}, ${depart.lng}`,
    lu: new Date().toISOString(),
    resultats,
    aide: 'Ajoute &lieu=tirana, &lieu=paris, &lieu=berkane — ou &lat=..&lng=.. pour un point précis.',
  })
}
