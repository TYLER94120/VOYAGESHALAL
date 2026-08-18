import type { Redis } from '@upstash/redis'

// ✒️ LES TITRES COURTS DE L'IA — « l'essentiel en un coup d'œil ».
//
// Itération 2, correction 2 : chaque fiche porte un titre de 6 mots
// maximum, écrit à partir des AVIS et des données Places que la passe 2
// rapporte déjà (aucun champ Google supplémentaire, donc aucun coût en
// plus). Trois règles absolues :
//   1. CÔTÉ SERVEUR, EN CACHE (Redis, 7 jours par adresse) — jamais un
//      appel IA pendant que le visiteur attend : on sert ce qu'on a, on
//      régénère en arrière-plan via after().
//   2. RIEN D'INVENTÉ : le modèle n'écrit que ce que les avis fournis
//      disent ; s'ils ne disent rien d'utile, pas de titre du tout.
//   3. JAMAIS « halal », « certifié » ni une promesse d'allergène dans le
//      titre : le statut halal a sa propre pastille, avec ses propres
//      règles — un titre n'a pas le droit de certifier.

interface FichePourTitre {
  id?: string
  nom: string
  famille?: string
  note?: number
  nbAvis?: number
  prix?: number
  resume?: string
  avis?: { texte: string; note?: number }[]
  titreIA?: string
}

const CLE = (id: string) => `vh:titreia:v1:${id}`
const SEPT_JOURS_S = 7 * 86400

/** Attache les titres déjà en cache. Ne génère RIEN — lecture seule. */
export async function attacherTitres(fiches: FichePourTitre[], r: Redis | null): Promise<void> {
  if (!r) return
  const avecId = fiches.filter((f) => f.id)
  if (!avecId.length) return
  try {
    const vals = await r.mget<(string | null)[]>(...avecId.map((f) => CLE(f.id!)))
    avecId.forEach((f, i) => {
      const v = vals[i]
      if (typeof v === 'string' && v) f.titreIA = v
    })
  } catch { /* pas de titre vaut mieux qu'une réponse lente */ }
}

const PROMPT = `Tu écris un TITRE COURT pour une adresse, à partir des seules données fournies (nom, type, note, extraits d'avis).
Règles :
- 6 mots MAXIMUM, en français, sans ponctuation finale, sans guillemets.
- Uniquement ce que les avis ou les données DISENT vraiment (plats, ambiance, rapidité, familles…). Rien d'inventé, rien de déduit du nom seul.
- INTERDITS : « halal », « certifié », toute promesse d'hygiène ou d'allergène, tout superlatif non appuyé par les avis.
- Si les données ne permettent pas un titre honnête, réponds exactement RIEN.
Exemples de forme : « Grillades généreuses, service rapide » · « Parc calme pour les enfants ».
Réponds le titre seul.`

function valide(t: string): boolean {
  if (!t || /^RIEN\b/i.test(t)) return false
  if (t.length > 60 || t.split(/\s+/).length > 6) return false
  if (/[.!?]$/.test(t) || /["«»]/.test(t)) return false
  if (/halal|certifi|casher|allerg/i.test(t)) return false
  return true
}

/**
 * Génère les titres manquants et les met en cache — à appeler via
 * after() : jamais sur le chemin de la réponse. Silencieux en cas d'échec
 * (pas de clé, quota…) : le titre apparaîtra une autre fois, ou jamais.
 */
export async function genererTitresManquants(fiches: FichePourTitre[], r: Redis | null): Promise<void> {
  const cle = process.env.ANTHROPIC_API_KEY
  if (!r || !cle) return
  const aFaire = fiches.filter((f) => f.id && !f.titreIA && ((f.avis?.length ?? 0) > 0 || f.resume))
  if (!aFaire.length) return
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: cle })
    for (const f of aFaire.slice(0, 3)) {
      const donnees = [
        `Nom : ${f.nom}`,
        f.famille ? `Type Google : ${f.famille}` : '',
        typeof f.note === 'number' ? `Note : ${f.note} (${f.nbAvis ?? 0} avis)` : '',
        typeof f.prix === 'number' ? `Niveau de prix : ${'€'.repeat(f.prix)}` : '',
        f.resume ? `Résumé Google : ${f.resume}` : '',
        ...(f.avis ?? []).slice(0, 4).map((a, i) => `Avis ${i + 1}${a.note ? ` (${a.note}/5)` : ''} : ${a.texte.slice(0, 300)}`),
      ].filter(Boolean).join('\n')
      try {
        const rep = await client.messages.create({
          model: 'claude-haiku-4-5-20251001', max_tokens: 40, temperature: 0,
          messages: [{ role: 'user', content: `${PROMPT}\n\n${donnees}` }],
        })
        const t = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
        if (valide(t)) await r.set(CLE(f.id!), t, { ex: SEPT_JOURS_S })
        // « RIEN » aussi se mémorise (24 h) : inutile de redemander à
        // chaque recherche ce que les avis ne diront pas mieux demain.
        else await r.set(CLE(f.id!), '', { ex: 86400 })
      } catch { return /* quota/panne : on arrête la série, sans bruit */ }
    }
  } catch { /* SDK absent : silencieux */ }
}
