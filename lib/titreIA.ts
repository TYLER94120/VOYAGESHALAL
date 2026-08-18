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
  conseilIA?: string
  cuisine?: string
  cuisineSource?: 'base' | 'places' | 'ia' | 'generique'
}

// v2 : la valeur devient un JSON { t: titre, c: cuisine } — la cuisine est
// le niveau 3 de la chaîne de fiabilité (itération 3, correction 2) : l'IA
// ne la nomme que si le même plat/cuisine revient dans PLUSIEURS avis.
const CLE = (id: string) => `vh:titreia:v2:${id}`

/** Les seuls mots que l'IA a le droit de rendre — un mot hors liste est
 *  jeté. « Halal » n'y figure pas : ce n'est pas une cuisine, c'est un
 *  statut, et il a ses propres règles. */
export const CUISINES_VALIDES = new Set([
  'Libanais', 'Turc', 'Marocain', 'Algérien', 'Tunisien', 'Somalien', 'Sénégalais', 'Éthiopien',
  'Indien', 'Pakistanais', 'Afghan', 'Iranien', 'Syrien', 'Yéménite', 'Égyptien', 'Oriental',
  'Sushi', 'Japonais', 'Chinois', 'Thaï', 'Vietnamien', 'Coréen', 'Indonésien', 'Malaisien', 'Asiatique',
  'Burger', 'Pizza', 'Kebab', 'Tacos', 'Poulet', 'Grillades', 'Sandwichs',
  'Brésilien', 'Grec', 'Méditerranéen', 'Africain', 'Traiteur', 'Pâtisserie', 'Dessert', 'Café',
])
const SEPT_JOURS_S = 7 * 86400

/** Attache titres ET cuisines déjà en cache. Ne génère RIEN — lecture seule. */
export async function attacherTitres(fiches: FichePourTitre[], r: Redis | null): Promise<void> {
  if (!r) return
  const avecId = fiches.filter((f) => f.id)
  if (!avecId.length) return
  try {
    const vals = await r.mget<({ t?: string; c?: string } | null)[]>(...avecId.map((f) => CLE(f.id!)))
    avecId.forEach((f, i) => {
      const v = vals[i]
      if (v && typeof v === 'object') {
        if (v.t) f.titreIA = v.t
        if (v.c && CUISINES_VALIDES.has(v.c) && !f.cuisine) { f.cuisine = v.c; f.cuisineSource = 'ia' }
        if ((v as { a?: string }).a) f.conseilIA = (v as { a?: string }).a
      }
    })
  } catch { /* pas de titre vaut mieux qu'une réponse lente */ }
}

const PROMPT = `Tu écris un TITRE COURT pour une adresse, à partir des seules données fournies (nom, type, note, extraits d'avis).
Règles :
- 6 mots MAXIMUM, en français, sans ponctuation finale, sans guillemets.
- Uniquement ce que les avis ou les données DISENT vraiment (plats, ambiance, rapidité, familles…). Rien d'inventé, rien de déduit du nom seul.
- INTERDITS : « halal », « certifié », toute promesse d'hygiène ou d'allergène, tout superlatif non appuyé par les avis.
- Si les données ne permettent pas un titre honnête, mets null.
Exemples de forme : « Grillades généreuses, service rapide » · « Parc calme pour les enfants ».

Tu identifies AUSSI la cuisine, en UN mot, UNIQUEMENT si le même type de plats/cuisine revient dans PLUSIEURS avis (deux minimum). Un seul avis, ou un doute = null — jamais un type deviné présenté comme un fait, et jamais déduit du nom seul.

Tu donnes AUSSI un CONSEIL DE TIMING très court (5 mots max, ex. « mieux le matin », « évite 12h–14h »), UNIQUEMENT si plusieurs avis parlent d'affluence ou du meilleur moment. Sinon null — jamais un conseil inventé.

Réponds UNIQUEMENT ce JSON : {"titre": "..." | null, "cuisine": "..." | null, "conseil": "..." | null}`

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
  const aFaire = fiches.filter((f) => f.id && !f.titreIA && !f.cuisine && !f.conseilIA && ((f.avis?.length ?? 0) > 0 || f.resume))
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
          model: 'claude-haiku-4-5-20251001', max_tokens: 90, temperature: 0,
          messages: [{ role: 'user', content: `${PROMPT}\n\n${donnees}` }],
        })
        const brut = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
        let t = '', cui = '', cons = ''
        try {
          const j = JSON.parse(brut.match(/\{[\s\S]*\}/)?.[0] ?? '{}') as { titre?: unknown; cuisine?: unknown; conseil?: unknown }
          if (typeof j.titre === 'string' && valide(j.titre)) t = j.titre
          // La liste blanche refait le travail du prompt : un mot hors
          // liste (ou « Halal ») n'entre jamais dans le cache.
          if (typeof j.cuisine === 'string' && CUISINES_VALIDES.has(j.cuisine)) cui = j.cuisine
          const jc = (j as { conseil?: unknown }).conseil
          if (typeof jc === 'string' && jc.length <= 40 && !/[.!?]$/.test(jc) && !/halal|certifi/i.test(jc)) cons = jc
        } catch { /* sortie illisible = rien */ }
        // Le vide aussi se mémorise (24 h) : inutile de redemander à
        // chaque recherche ce que les avis ne diront pas mieux demain.
        await r.set(CLE(f.id!), { ...(t ? { t } : {}), ...(cui ? { c: cui } : {}), ...(cons ? { a: cons } : {}) }, { ex: t || cui || cons ? SEPT_JOURS_S : 86400 })
      } catch { return /* quota/panne : on arrête la série, sans bruit */ }
    }
  } catch { /* SDK absent : silencieux */ }
}
