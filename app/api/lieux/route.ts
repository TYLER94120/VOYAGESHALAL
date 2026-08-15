import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { requeteGoogle } from '@/lib/requete.mjs'
import { accepte } from '@/lib/categorie.mjs'
import { listAllSpots } from '@/lib/prayerSpots'
import { CRITERES_DEFAUT, type Criteres } from '@/lib/criteres'
import { minutes, plafondMin, rayonM, RAYON_KM, type Mode } from '@/lib/trajet'
import { verdictAlcool } from '@/lib/alcool.mjs'
import { PROFIL_VIDE, profilVide, requeteAvecProfil, criteresRelachables, type Profil } from '@/lib/profil'

// 🍽 LE SUR MESURE — POST /api/lieux
//
// Ordre de Mohamed, 15 août : « Le visiteur ne veut pas choisir parmi
// vingt restaurants : il veut qu'on lui dise où aller, ce soir, pour lui.
// TROIS fiches. Jamais plus. »
//
// ════════ DEUX PASSES, ET C'EST TOUT L'ENJEU ════════
//
// PASSE 1 — chercher large avec les champs les MOINS chers.
//   Text Search (API New), FieldMask réduit au strict nécessaire pour
//   TRIER : nom, position, note, nombre d'avis, niveau de prix, ouvert,
//   adresse, identifiant. Une quinzaine de candidats. Aucune photo,
//   aucun avis — ce sont eux qui coûtent.
//
// PASSE 2 — choisir TROIS, puis enrichir SEULEMENT ces trois.
//   Place Details sur les trois retenus, avec les champs riches dont
//   l'IA a besoin pour écrire quelque chose d'intéressant : avis,
//   résumé, attributs (sur place / à emporter / livraison, familles,
//   terrasse, végétarien, réservation), horaires, photos, téléphone.
//
// POURQUOI CET ORDRE COÛTE DIX FOIS MOINS. Google facture par palier de
// champs : Essentials (position, nom) < Pro (note, ouverture) <
// Enterprise (avis, photos, attributs). Demander les champs riches sur
// quinze candidats au lieu de trois multiplie la facture pour un
// résultat identique — les douze autres ne sont jamais affichés.
//
// ════════ CE QUI NE SE NÉGOCIE PAS ════════
// · Nos spots vérifiés passent AU-DESSUS, toujours.
// · Chaque lieu porte sa phrase d'honnêteté : « vérifié par la
//   communauté » ou « signalé halal sur Google Maps — à confirmer sur
//   place ». Jamais une certification affirmée.
// · La clé reste côté serveur. Sans clé : repli spots + OpenStreetMap,
//   et la réponse le DIT (source: 'osm' / 'spots-seulement').
// · Délai 4 s par appel, cache Redis 24 h par zone + critères, quota
//   20/h par visiteur.
// · Attribution Google conservée et renvoyée au client (leurs conditions
//   l'exigent sur les photos et les avis).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DELAI = 4000
const DELAI_OSM = 8500
const QUOTA_HEURE = 20
const CACHE_S = 24 * 3600
const CANDIDATS = 15
const RETENUS = 3
const AUTRES = 4
/** Pool sur lequel on paie la vérification alcool (§3 de l'alerte). */
const POOL_ALCOOL = 9

let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export interface Avis {
  texte: string
  note?: number
  /** Auteur — l'attribution est exigée par Google dès qu'on montre un avis. */
  auteur?: string
}

export interface Fiche {
  id?: string
  nom: string
  distanceM: number
  lat: number
  lng: number
  note?: number
  nbAvis?: number
  /** 1 à 4, échelle Google. */
  prix?: number
  ouvert?: boolean
  fermeA?: string
  adresse?: string
  telephone?: string
  mapsUri?: string
  /** URL passant par notre proxy : la clé ne sort jamais du serveur. */
  photos?: string[]
  attributionsPhotos?: string[]
  avis?: Avis[]
  resume?: string
  attributs?: {
    surPlace?: boolean; aEmporter?: boolean; livraison?: boolean
    famille?: boolean; terrasse?: boolean; vegetarien?: boolean
    reservation?: boolean; accessible?: boolean
  }
  statut: string
  /** 🔴 Ce qu'on SAIT de l'alcool : jamais une supposition. */
  alcool: 'non' | 'inconnu'
  source: 'spot' | 'google' | 'osm'
}

/** L'état alcool d'un candidat, tel que le verdict l'a établi. */
function alcoolDe(x: { nom: string; primaryType?: string; types?: string[]; servesBeer?: boolean; servesWine?: boolean; servesCocktails?: boolean }): 'non' | 'inconnu' {
  const v = verdictAlcool(x)
  return v.garde ? v.alcool : 'inconnu'
}

function distM(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

/** Le mode effectif : « peu importe » devient la voiture, qui couvre le
 *  plus de cas sans jamais annoncer une marche absurde. */
function modeDe(c: Criteres): Mode {
  return c.mode === 'peu-importe' ? 'voiture' : c.mode
}

/** 🕌 Ce qu'on demande à Google selon la catégorie. Pour une mosquée, on
 *  ne dit JAMAIS « halal » : c'est absurde, et ça brouillerait la
 *  recherche. Chaque catégorie a aussi sa phrase d'honnêteté. */
const CATEGORIE: Record<'manger' | 'mosquee' | 'activite', { texte: (q: string) => string; statut: string; statutOSM: string; spots: string[] }> = {
  manger: {
    texte: (q) => q,
    statut: 'signalé halal sur Google Maps — à confirmer sur place',
    statutOSM: 'signalé halal sur OpenStreetMap — à confirmer sur place',
    spots: ['resto', 'boucherie'],
  },
  mosquee: {
    texte: () => 'mosque',
    // Pas d'étiquette halal ici, et surtout aucune supposition sur les
    // équipements : « une erreur envoie quelqu'un devant une porte fermée
    // à l'heure de la prière » (Mohamed).
    statut: 'référencée sur Google Maps — horaires et équipements à vérifier',
    statutOSM: 'référencée sur OpenStreetMap — horaires à vérifier',
    spots: ['coin_priere'],
  },
  activite: {
    texte: (q) => q.replace(/^halal /, ''),
    statut: 'trouvée sur Google Maps — à vérifier selon tes critères',
    statutOSM: '',
    spots: ['pepite', 'autre'],
  },
}

// La requête envoyée à Google vit dans lib/requete.mjs : source unique,
// vérifiée par scripts/test-requete.mjs avant chaque build.

// ─────────────────────── nos spots vérifiés ───────────────────────

async function nosSpots(lat: number, lng: number, c: Criteres, rayon: number): Promise<Fiche[]> {
  try {
    const tous = await listAllSpots()
    return tous
      .filter((s) => CATEGORIE[c.categorie].spots.includes(s.categorie ?? ''))
      .map((s) => ({ s, d: distM(lat, lng, s.lat, s.lng) }))
      .filter(({ d }) => d <= rayon)
      .sort((a, b) => a.d - b.d)
      .slice(0, RETENUS)
      .map(({ s, d }) => ({
        id: s.id, nom: s.nom, distanceM: d, lat: s.lat, lng: s.lng,
        adresse: s.adresse, note: s.note,
        statut: s.source === 'community'
          ? `vérifié par la communauté · ${s.confirmations || 0} confirmation${(s.confirmations ?? 0) > 1 ? 's' : ''}`
          : 'référencé par VoyagesHalal · à vérifier sur place',
        // Nos spots sont vérifiés par des voyageurs musulmans, mais nous ne
        // stockons pas encore l'information « sert de l'alcool » : on ne
        // l'invente donc pas.
        alcool: 'inconnu' as const,
        source: 'spot' as const,
      }))
  } catch { return [] }
}

// ─────────────────────── passe 1 : chercher large ───────────────────────

/** Champs de tri UNIQUEMENT — les moins chers de la grille Google. */
const CHAMPS_PASSE1 = [
  'places.id',
  'places.displayName',
  'places.location',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.currentOpeningHours.openNow',
  // 🔴 Le TYPE est dans les champs peu coûteux : le premier barrage anti
  // alcool s'applique donc dès la passe 1, avant de payer quoi que ce soit.
  'places.primaryType',
  'places.types',
].join(',')

interface Candidat {
  id: string; nom: string; lat: number; lng: number
  note?: number; nbAvis?: number; prix?: number; ouvert?: boolean; adresse?: string
  distanceM: number
  /** 🔴 LE RANG DE PERTINENCE RENDU PAR GOOGLE, 0 = le plus pertinent.
   *  Google classe déjà ses résultats selon la requête ; nous jetions ce
   *  classement pour tout re-trier à la distance. D'où « kebab → Master
   *  Poulet » : le plus proche gagnait toujours, quel que soit le mot tapé. */
  rang: number
  primaryType?: string; types?: string[]
  /** Renseigné par la passe intermédiaire. `undefined` = inconnu. */
  servesBeer?: boolean; servesWine?: boolean; servesCocktails?: boolean
}

/** Un rectangle englobant le cercle de rayon `m` — la forme attendue par
 *  `locationRestriction` du Text Search. */
function cadre(lat: number, lng: number, m: number) {
  const dLat = m / 111_320
  const dLng = m / (111_320 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)))
  return {
    low: { latitude: lat - dLat, longitude: lng - dLng },
    high: { latitude: lat + dLat, longitude: lng + dLng },
  }
}

/**
 * 🔎 POURQUOI GOOGLE A REFUSÉ — la question que personne ne pouvait poser.
 *
 * Constat de l'agent HalalGPT, nuit du 15 août : les trois appels Google
 * faisaient `if (!r.ok) return null` puis `catch { return null }`. Une clé
 * refusée, un quota dépassé, un masque de champs invalide et un délai
 * expiré rendaient donc EXACTEMENT le même résultat. Le widget disait
 * honnêtement « je n'ai pas pu interroger Google » — mais ni Mohamed ni
 * l'agent ne pouvaient savoir LAQUELLE des quatre causes s'appliquait, et
 * on ne répare pas ce qu'on ne peut pas nommer.
 *
 * Google, lui, le dit très précisément dans le corps de sa réponse :
 * « API keys with referer restrictions cannot be used with this API »,
 * « Requests to this API are blocked », « Invalid field mask ». Il suffit
 * de le lire.
 *
 * La clé est nettoyée avant journalisation : un secret ne doit jamais
 * pouvoir tomber dans un journal, même par accident.
 */
type Refus = { statut: number; message: string }

function sansSecret(texte: string): string {
  return texte.replace(/key=[^&\s"']+/gi, 'key=***').slice(0, 300)
}

async function lireRefus(r: Response): Promise<Refus> {
  let message = ''
  try {
    const brut = (await r.text()).slice(0, 600)
    try {
      const j = JSON.parse(brut) as { error?: { message?: string; status?: string } }
      message = j.error?.message ?? j.error?.status ?? brut
    } catch { message = brut }
  } catch { message = '(corps illisible)' }
  return { statut: r.status, message: sansSecret(message) }
}

/** Ce qu'on retient du dernier refus, pour le remonter jusqu'à la réponse. */
type Journal = { refus?: Refus }

// Les portes par catégorie vivent dans lib/categorie.mjs : source unique,
// vérifiée par scripts/test-categorie.mjs avant chaque build.

/**
 * Le mot précis demandé, s'il ne se retrouve dans AUCUNE des fiches.
 *
 * On ne compare que sur un mot unique et assez long : « kebab », « pizza »,
 * « couscous ». Une phrase entière (« un endroit calme pour dîner ») ne se
 * vérifie pas ainsi — et prétendre le contraire produirait de faux
 * avertissements, ce qui est pire que pas d'avertissement du tout.
 */
function motManquant(c: Criteres, fiches: Fiche[]): string | null {
  const mots = (c.motsCles ?? '').trim().split(/\s+/).filter((m) => m.length >= 5)
  if (mots.length !== 1 || !fiches.length) return null
  const mot = mots[0].toLowerCase()
  const present = fiches.some((f) =>
    f.nom.toLowerCase().includes(mot) ||
    (f.resume ?? '').toLowerCase().includes(mot) ||
    (f.avis ?? []).some((a) => a.texte.toLowerCase().includes(mot)))
  return present ? null : mots[0]
}

async function passe1(lat: number, lng: number, c: Criteres, cle: string, lang: string, rayon: number, texte: string, journal?: Journal): Promise<Candidat[] | null> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_PASSE1 },
      body: JSON.stringify({
        textQuery: texte,
        languageCode: lang,
        pageSize: CANDIDATS,
        // 🔴🔴 ON IMPOSE LE TRI PAR DISTANCE. Défaut du 15 août, et il
        // peut faire rater une prière : depuis Fontenay-sous-Bois, la
        // « mosquée la plus proche à pied » proposait Clichy-sous-Bois à
        // 31 min DE VOITURE et Ivry à 38 min, alors que Dhuhr était dans
        // 19 minutes — et qu'il y a des mosquées à Montreuil, Vincennes,
        // Nogent, Fontenay même.
        //
        // LA CAUSE : `searchText` classe par PERTINENCE. Dans un rectangle
        // de 20 km, Google remonte donc les mosquées les plus CONNUES, pas
        // les plus proches — et les quinze candidats qu'il nous rend ne
        // contiennent même pas les mosquées du quartier. Les retrier
        // nous-mêmes ne servait à rien : on triait les mauvais candidats.
        //
        // Élargir le rayon sans imposer le tri, c'est éparpiller.
        rankPreference: 'DISTANCE',
        openNow: c.ouvertMaintenant || undefined,
        // 🎯 locationRESTRICTION et non locationBias : la contrainte est DURE.
        // Avec un simple biais, Google renvoyait des adresses à 90 minutes
        // « parce qu'elles correspondaient bien » — c'est le défaut du
        // 15 août au soir. Ici, hors du rayon = hors de la réponse.
        locationRestriction: { rectangle: cadre(lat, lng, rayon) },
      }),
    })
    if (!r.ok) {
      const refus = await lireRefus(r)
      if (journal) journal.refus = refus
      console.error('[lieux] Google a refuse la recherche', refus.statut, refus.message)
      return null
    }
    const j = await r.json() as { places?: Record<string, unknown>[] }
    const PRIX: Record<string, number> = { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 }
    return (j.places ?? [])
      .map((p, i) => {
        const loc = p.location as { latitude: number; longitude: number } | undefined
        const nom = (p.displayName as { text?: string } | undefined)?.text
        if (!loc || !nom) return null
        return {
          id: String(p.id ?? ''), nom, lat: loc.latitude, lng: loc.longitude,
          note: p.rating as number | undefined,
          nbAvis: p.userRatingCount as number | undefined,
          prix: PRIX[String(p.priceLevel ?? '')],
          ouvert: (p.currentOpeningHours as { openNow?: boolean } | undefined)?.openNow,
          adresse: p.formattedAddress as string | undefined,
          distanceM: distM(lat, lng, loc.latitude, loc.longitude),
          // L'ordre de Google EST son jugement de pertinence : on le garde.
          rang: i,
          primaryType: p.primaryType as string | undefined,
          types: p.types as string[] | undefined,
        } as Candidat
      })
      .filter((x): x is Candidat => x !== null)
      // 🎯 « QUE FAIRE » : aucun lieu qui sert à manger. Musées, parcs,
      // monuments, jardins, aquariums — pas des restaurants déguisés en
      // sorties. Le barrage est ici, avant tout le reste : un lieu écarté
      // ne coûte pas un appel de détail.
      // 🔴🔴 LA PORTE PAR CATÉGORIE. En mode Prier, seuls des lieux de
      // culte DÉCLARÉS passent : liste d'admission, pas d'exclusion — une
      // liste d'exclusions oublie toujours un cas, et c'est ainsi qu'un
      // traiteur libanais est sorti pour « où prier ». Dans le doute, non.
      .filter((x) => accepte(c.categorie, x.primaryType, x.types))
      // 🔴 BARRAGE 1 — par le type, gratuit et immédiat : bar, pub,
      // wine_bar, night_club, liquor_store… ne franchissent jamais la
      // porte. Pas d'avertissement, pas de rétrogradation.
      .filter((x) => verdictAlcool({ nom: x.nom, primaryType: x.primaryType, types: x.types }).garde
        // Un signal dans le NOM n'écarte pas ici : le lieu part en
        // vérification d'attributs (barrage 2). C'est là qu'on tranchera.
        || estRefusPourNomSeul(x))
  } catch (e) {
    // Le délai dépassé et la panne réseau se ressemblent dans un `catch` —
    // ils ne se réparent pas pareil. On les distingue ici.
    const refus: Refus = ac.signal.aborted
      ? { statut: 0, message: `delai de ${DELAI} ms depasse` }
      : { statut: 0, message: sansSecret(String(e)) }
    if (journal) journal.refus = refus
    console.error('[lieux] recherche Google injoignable :', refus.message)
    return null
  } finally { clearTimeout(t) }
}

/** Vrai si le seul reproche est un mot du nom : ce cas mérite la
 *  vérification payante des attributs, pas un refus immédiat. */
function estRefusPourNomSeul(x: Candidat): boolean {
  const v = verdictAlcool({ nom: x.nom, primaryType: x.primaryType, types: x.types })
  return !v.garde && v.motif === 'doute-nom'
}

/** Champs STRICTEMENT nécessaires au barrage alcool — le masque le plus
 *  étroit possible, demandé sur un pool élargi. */
const CHAMPS_ALCOOL = ['id', 'displayName', 'primaryType', 'types', 'servesBeer', 'servesWine', 'servesCocktails'].join(',')

/**
 * 🔴 BARRAGE 2 — les attributs de service, sur un POOL ÉLARGI.
 *
 * « Comme ces champs coûtent plus cher, demande-les sur huit à dix
 * candidats et non sur les trois finalistes seulement — sinon tu
 * découvres trop tard qu'il ne t'en reste qu'un. C'est de l'argent bien
 * dépensé : c'est le filtre qui protège la promesse du site. » (Mohamed)
 */
async function verifierAlcool(cands: Candidat[], cle: string): Promise<Candidat[]> {
  const pool = cands.slice(0, POOL_ALCOOL)
  const verifies = await Promise.all(pool.map(async (x) => {
    if (!x.id) return null
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), DELAI)
    try {
      const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(x.id)}`, {
        signal: ac.signal,
        headers: { 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_ALCOOL },
      })
      // Appel muet = information INCONNUE. La règle d'or s'applique :
      // dans le doute, seul un lieu sans aucun signal peut passer.
      if (!r.ok) {
        const refus = await lireRefus(r)
        console.error('[lieux] verification alcool refusee', refus.statut, refus.message)
        return { ...x }
      }
      const p = await r.json() as Record<string, unknown>
      return {
        ...x,
        primaryType: (p.primaryType as string | undefined) ?? x.primaryType,
        types: (p.types as string[] | undefined) ?? x.types,
        servesBeer: p.servesBeer as boolean | undefined,
        servesWine: p.servesWine as boolean | undefined,
        servesCocktails: p.servesCocktails as boolean | undefined,
      }
    } catch { return { ...x } } finally { clearTimeout(t) }
  }))
  return verifies.filter((x): x is Candidat => !!x && verdictAlcool(x).garde)
}

/** Le tri : c'est lui qui rend le résultat « sur mesure ». */
function classer(cands: Candidat[], c: Criteres, rayon: number): Candidat[] {
  // ════════ QUI ENTRE, ET DANS QUEL ORDRE — deux questions distinctes ════
  //
  // Ordre de Mohamed, 15 août, en deux phrases qui semblent s'opposer :
  //   « La pertinence prime sur la distance : un vrai kebab à 3 km bat un
  //     poulet rôti à 300 m. »
  //   « On affiche du PLUS PROCHE au PLUS LOINTAIN, avec pour chacun sa
  //     distance ET son temps de trajet. »
  //
  // Elles ne s'opposent pas, elles répondent à deux questions différentes.
  // La PERTINENCE décide QUI entre dans la liste : c'est la recherche
  // textuelle de Google sur le mot tapé qui ne renvoie que des kebabs, et
  // c'est elle qui a été réparée. La DISTANCE décide de l'ORDRE : une fois
  // qu'on n'a que des kebabs, le plus proche d'abord est la seule réponse
  // sensée. Le poulet rôti à 300 m n'apparaît plus du tout — non parce
  // qu'on l'a relégué, mais parce qu'il n'est pas un kebab.
  //
  // ⚠️ LE GARDE-FOU DE PERTINENCE A ÉTÉ RETIRÉ, et c'est important.
  // Il écartait les rangs au-delà du douzième, ce qui avait du sens quand
  // Google classait par pertinence. Maintenant qu'il classe par DISTANCE,
  // le rang 13 est simplement le treizième plus proche — l'écarter
  // reviendrait à jeter des adresses parce qu'elles sont loin, alors que
  // c'est déjà le rôle du rayon.
  return [...cands]
    .filter((x) => x.distanceM <= rayon)
    .filter((x) => (c.budget === 'petit' ? (x.prix ?? 2) <= 2 : c.budget === 'moyen' ? (x.prix ?? 2) <= 3 : true))
    // « Ouvert maintenant » reste un filtre dur quand il est demandé : une
    // adresse fermée n'est pas une réponse à « je veux manger là, tout de
    // suite ».
    .filter((x) => !(c.ouvertMaintenant && x.ouvert === false))
    // Du plus proche au plus lointain. Le visiteur décide lui-même ce qui
    // est trop loin — chaque fiche porte sa distance et son temps de trajet.
    .sort((a, b) => a.distanceM - b.distanceM)
}

// ─────────────────────── passe 2 : enrichir les 3 ───────────────────────

/** Champs riches — demandés SEULEMENT sur les trois retenus. */
const CHAMPS_PASSE2 = [
  'id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount',
  'priceLevel', 'nationalPhoneNumber', 'googleMapsUri',
  'currentOpeningHours', 'editorialSummary', 'reviews', 'photos',
  'dineIn', 'takeout', 'delivery', 'goodForChildren', 'outdoorSeating',
  'servesVegetarianFood', 'reservable', 'accessibilityOptions',
].join(',')

async function enrichir(cand: Candidat, cle: string, lang: string, origin: string, cat: 'manger' | 'mosquee' | 'activite'): Promise<Fiche> {
  const base: Fiche = {
    id: cand.id, nom: cand.nom, distanceM: cand.distanceM, lat: cand.lat, lng: cand.lng,
    note: cand.note, nbAvis: cand.nbAvis, prix: cand.prix, ouvert: cand.ouvert, adresse: cand.adresse,
    statut: CATEGORIE[cat].statut,
    alcool: alcoolDe(cand),
    source: 'google',
  }
  if (!cand.id) return base
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(cand.id)}?languageCode=${lang}`, {
      signal: ac.signal,
      headers: { 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_PASSE2 },
    })
    if (!r.ok) {
      const refus = await lireRefus(r)
      console.error('[lieux] enrichissement refuse', refus.statut, refus.message)
      return base
    }
    const p = await r.json() as Record<string, unknown>
    const oh = p.currentOpeningHours as { openNow?: boolean; weekdayDescriptions?: string[] } | undefined
    const photos = (p.photos as { name?: string; authorAttributions?: { displayName?: string }[] }[] | undefined) ?? []
    const reviews = (p.reviews as { text?: { text?: string }; rating?: number; authorAttribution?: { displayName?: string } }[] | undefined) ?? []
    const acc = p.accessibilityOptions as Record<string, boolean> | undefined
    return {
      ...base,
      telephone: p.nationalPhoneNumber as string | undefined,
      mapsUri: p.googleMapsUri as string | undefined,
      ouvert: oh?.openNow ?? cand.ouvert,
      fermeA: heureFermeture(oh?.weekdayDescriptions),
      resume: (p.editorialSummary as { text?: string } | undefined)?.text,
      // Les photos passent par NOTRE proxy : la clé ne sort jamais.
      // 🔴 URL RELATIVE, JAMAIS `origin`. Défaut trouvé le 15 août :
      // Mohamed voyait des rectangles vides avec un « ? » à la place des
      // photos de restaurants, alors que les photos de mosquées (servies
      // par Wikimedia, en absolu) s'affichaient très bien.
      // La cause : `origin` était calculé depuis `req.url`, c'est-à-dire
      // l'URL INTERNE vue par le serveur derrière le proxy de Vercel —
      // pas l'adresse publique du site. Le navigateur recevait donc un
      // `src` pointant vers un hôte qu'il ne peut pas joindre.
      // Une URL relative est résolue par le navigateur contre la page
      // courante : elle est juste par construction, sur les deux domaines,
      // en préproduction comme en production.
      photos: photos.slice(0, 2).map((ph) => `/api/lieux/photo?ref=${encodeURIComponent(ph.name ?? '')}`).filter((u) => !u.endsWith('ref=')),
      attributionsPhotos: photos.slice(0, 2).flatMap((ph) => (ph.authorAttributions ?? []).map((a) => a.displayName ?? '').filter(Boolean)),
      avis: reviews.slice(0, 4).map((rv) => ({
        texte: (rv.text?.text ?? '').slice(0, 400),
        note: rv.rating,
        auteur: rv.authorAttribution?.displayName,
      })).filter((rv) => rv.texte),
      attributs: {
        surPlace: p.dineIn as boolean | undefined,
        aEmporter: p.takeout as boolean | undefined,
        livraison: p.delivery as boolean | undefined,
        famille: p.goodForChildren as boolean | undefined,
        terrasse: p.outdoorSeating as boolean | undefined,
        vegetarien: p.servesVegetarianFood as boolean | undefined,
        reservation: p.reservable as boolean | undefined,
        accessible: acc ? Object.values(acc).some(Boolean) : undefined,
      },
    }
  } catch { return base } finally { clearTimeout(t) }
}

/** « lundi : 11:00 – 23:00 » → « 23:00 ». Aucune heure inventée : si on ne
 *  sait pas lire la ligne du jour, on ne renvoie rien. */
function heureFermeture(desc?: string[]): string | undefined {
  if (!desc?.length) return undefined
  const jour = new Date().getDay() // 0 = dimanche
  const ligne = desc[(jour + 6) % 7] // Google commence au lundi
  const m = ligne?.match(/(\d{1,2}[:h]\d{2})\s*(?:–|-|—|to)\s*(\d{1,2}[:h]\d{2})/)
  return m?.[2]
}

// ─────────────────────── repli OpenStreetMap ───────────────────────

async function viaOSM(origin: string, lat: number, lng: number, rayon: number, cat: 'manger' | 'mosquee' | 'activite'): Promise<Fiche[]> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI_OSM)
  try {
    const r = await fetch(`${origin}/api/osm-restos?lat=${lat}&lng=${lng}`, { signal: ac.signal })
    if (!r.ok) return []
    const j = await r.json() as { restos?: { nom: string; lat: number; lng: number }[]; mosquees?: { nom: string; lat: number; lng: number }[] }
    if (cat === 'activite') return [] // rien de fiable à offrir — on le dit
    return ((cat === 'mosquee' ? j.mosquees : j.restos) ?? [])
      .map((x) => ({
        nom: x.nom, lat: x.lat, lng: x.lng,
        distanceM: distM(lat, lng, x.lat, x.lng),
        statut: CATEGORIE[cat].statutOSM,
        // OpenStreetMap ne nous dit rien de l'alcool : inconnu, et affiché
        // comme tel.
        alcool: 'inconnu' as const,
        source: 'osm' as const,
      }))
      .filter((x) => x.distanceM <= rayon)
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, RETENUS + AUTRES)
  } catch { return [] } finally { clearTimeout(t) }
}

// ─────────────────────── la route ───────────────────────

export async function POST(req: Request) {
  let corps: { lat?: number; lng?: number; criteres?: Partial<Criteres>; lang?: string; ecrit?: boolean; profil?: Partial<Profil> }
  try { corps = await req.json() } catch { return NextResponse.json({ erreur: 'corps invalide' }, { status: 400 }) }
  const lat = Number(corps.lat), lng = Number(corps.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ erreur: 'position invalide' }, { status: 400 })
  }
  const c: Criteres = { ...CRITERES_DEFAUT, ...(corps.criteres ?? {}) }
  const lang = corps.lang === 'en' ? 'en' : 'fr'
  // 👤 Le profil arrive du TÉLÉPHONE à chaque appel : il n'est jamais
  // stocké ici. Le serveur ne le retient pas, il s'en sert et l'oublie.
  const profil: Profil = { ...PROFIL_VIDE, ...(corps.profil ?? {}) }
  const r = getRedis()

  // Quota — Redis absent : on laisse passer (un compteur en panne ne doit
  // pas fermer le service).
  if (r) {
    try {
      const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim()
      const k = `lieux:quota:${ip}:${new Date().toISOString().slice(0, 13)}`
      const n = await r.incr(k)
      if (n === 1) await r.expire(k, 3600)
      if (n > QUOTA_HEURE) return NextResponse.json({ erreur: 'quota' }, { status: 429 })
    } catch { /* jamais bloquant */ }
  }

  // 📊 LA MESURE (§7) : sans elle, ça n'existe pas.
  const compter = async (...cles: string[]) => {
    if (!r) return
    try { await Promise.all(cles.map((k) => r.incr(k))) } catch { /* jamais bloquant */ }
  }
  await compter('surmesure:recherches', corps.ecrit ? 'surmesure:ecrites' : 'surmesure:cliquees')

  const zone = `${lat.toFixed(2)},${lng.toFixed(2)}`
  // ⚠️ Les mots tapés ENTRENT dans l'empreinte : sans eux, « pizza » se
  // faisait resservir le résultat de « kebab » — le cache reproduisait à
  // lui seul le défaut qu'on vient de corriger.
  const empreinte = `${zone}:${c.categorie}:${c.quoi}:${(c.motsCles ?? '').toLowerCase()}:${profil.regime}:${profil.sansGluten ? 1 : 0}:${profil.sansLactose ? 1 : 0}:${profil.objectif}:${c.mode}:${c.budget}:${c.exigence}:${c.ouvertMaintenant ? 1 : 0}:${lang}`
  if (r) {
    try {
      const cache = await r.get<{ fiches: Fiche[]; autres: Fiche[]; source: string }>(`surmesure:cache:${empreinte}`)
      if (cache) {
        await compter(cache.fiches.length ? 'surmesure:avec' : 'surmesure:vides')
        return NextResponse.json({ ...cache, cache: true })
      }
    } catch { /* cache muet = on cherche */ }
  }

  const origin = new URL(req.url).origin
  const cle = process.env.GOOGLE_PLACES_KEY

  // 📏 LE RAYON QUI A DU SENS — calculé une fois, appliqué partout : à
  // l'appel Google, à nos spots, au repli OSM, et au tri. C'est lui qui
  // interdit la pâtisserie à 90 minutes.
  const mode = modeDe(c)
  const rayon = rayonM(c, mode)
  const spots = await nosSpots(lat, lng, c, rayon)

  let fiches: Fiche[] = []
  let autres: Fiche[] = []
  let source: 'google' | 'osm' | 'spots-seulement' = 'spots-seulement'
  let etatGoogle: 'ok' | 'vide' | 'muet' | 'sans-cle' = cle ? 'muet' : 'sans-cle'
  // « muet » ne suffit pas à réparer : on garde CE QUE Google a répondu.
  const journal: Journal = {}
  /** Les critères de profil qu'on a dû relâcher — affichés tels quels. */
  const relaches: string[] = []

  // « Seulement les adresses vérifiées » : on n'interroge même pas Google.
  if (c.exigence === 'verifies') {
    fiches = spots.slice(0, RETENUS)
  } else if (cle) {
    // 👤 LE PROFIL AFFINE LA REQUÊTE — jamais les filtres de base. Google
    // ne connaît pas « protéiné » : on traduit en poke, grillades, bowls…
    const texteBase = requeteGoogle(c)
    const avecProfil = c.categorie === 'manger' ? requeteAvecProfil(texteBase, profil) : texteBase
    let cands = await passe1(lat, lng, c, cle, lang, rayon, avecProfil, journal)

    // §5 — QUAND TOUT NE PEUT PAS ÊTRE SATISFAIT, ON DIT CE QU'ON A LÂCHÉ.
    // On relâche du MOINS au PLUS essentiel, un cran à la fois, et jamais
    // en silence : « un critère relâché en silence, c'est un mensonge ».
    const aLacher = c.categorie === 'manger' ? criteresRelachables(profil, lang === 'en') : []
    let profilCourant: Profil = { ...profil }
    for (const critere of [...aLacher].reverse()) {
      if ((cands?.length ?? 0) >= RETENUS) break
      profilCourant = { ...profilCourant, [critere.cle]: critere.cle === 'regime' ? 'aucun' : critere.cle === 'objectif' ? 'aucun' : false } as Profil
      relaches.push(critere.libelle)
      const encore = await passe1(lat, lng, c, cle, lang, rayon, requeteAvecProfil(texteBase, profilCourant), journal)
      if (encore?.length) cands = encore
    }

    if (cands !== null) etatGoogle = cands.length ? 'ok' : 'vide'
    if (cands?.length) {
      const tries = classer(cands, c, rayon).filter((x) => !spots.some((s) => distM(s.lat, s.lng, x.lat, x.lng) < 60))
      // 🔴 BARRAGE 2 — on paie la vérification alcool sur un pool élargi
      // AVANT de choisir les trois. C'est l'ordre inverse qui avait laissé
      // passer un bistrot : on filtrait trop tard, ou pas du tout.
      // La catégorie « mosquée » n'a pas à passer par là.
      const classes = c.categorie === 'mosquee' ? tries : await verifierAlcool(tries, cle)
      const placesRetenues = classes.slice(0, Math.max(0, RETENUS - spots.length))
      // PASSE 2 : uniquement sur les retenues.
      const enrichies = await Promise.all(placesRetenues.map((x) => enrichir(x, cle, lang, origin, c.categorie)))
      source = 'google'
      fiches = [...spots, ...enrichies].slice(0, RETENUS)
      autres = classes.slice(placesRetenues.length, placesRetenues.length + AUTRES).map((x) => ({
        id: x.id, nom: x.nom, distanceM: x.distanceM, lat: x.lat, lng: x.lng,
        note: x.note, nbAvis: x.nbAvis, prix: x.prix, ouvert: x.ouvert, adresse: x.adresse,
        statut: CATEGORIE[c.categorie].statut,
        alcool: alcoolDe(x),
        source: 'google' as const,
      }))
    }
  }

  if (source !== 'google' && c.exigence !== 'verifies') {
    const osm = await viaOSM(origin, lat, lng, rayon, c.categorie)
    if (osm.length) {
      source = 'osm'
      const sansDoublon = osm.filter((o) => !spots.some((s) => distM(s.lat, s.lng, o.lat, o.lng) < 60))
      fiches = [...spots, ...sansDoublon].slice(0, RETENUS)
      autres = sansDoublon.slice(Math.max(0, RETENUS - spots.length)).slice(0, AUTRES)
    } else if (spots.length) {
      fiches = spots.slice(0, RETENUS)
    }
  }

  // 🚫 PLUS JAMAIS « VEUX-TU ÉLARGIR ? » (Mohamed, 15 août) : « Le visiteur
  // a déjà demandé — lui refaire payer un clic pour obtenir une réponse
  // évidente, c'est mauvais. » On cherche d'emblée à 20 km, donc le second
  // appel d'élargissement et sa question ont disparu.

  await compter(fiches.length ? 'surmesure:avec' : 'surmesure:vides')
  // §7 — « combien de recherches où un critère a dû être relâché, et sur
  // quelles villes. Cette mesure vaut de l'or : elle dira où l'offre
  // manque, donc quelles villes méritent nos propres relevés vérifiés. »
  if (r && relaches.length) {
    try {
      await r.incr('surmesure:relache')
      await r.zincrby('surmesure:relache:zones', 1, zone)
    } catch { /* jamais bloquant */ }
  }
  if (r && !profilVide(profil)) { try { await r.incr('surmesure:avec-profil') } catch { /* idem */ } }

  const reponse = {
    fiches, autres, source, etatGoogle,
    // 🔎 Présent UNIQUEMENT quand Google a refusé : le statut et sa phrase
    // exacte. Rien de secret (la clé est nettoyée), rien d'affiché au
    // visiteur — mais lisible d'un coup d'œil dans l'onglet Réseau, sans
    // avoir à ouvrir les journaux du serveur. C'est ce qui transforme
    // « ça ne marche pas » en « la clé refuse les appels serveur ».
    ...(etatGoogle === 'muet' && journal.refus ? { diagnostic: journal.refus } : {}),
    // 🔴 « On ne sert pas un poulet rôti en faisant semblant que c'est la
    // réponse » (Mohamed, 15 août). Si le visiteur a demandé quelque chose
    // de PRÉCIS et qu'aucune des trois fiches ne porte ce mot, on le DIT.
    // On ne retire rien — ce qui s'en rapproche reste utile — mais on
    // n'appelle pas « kebab » un endroit qui n'en est pas un.
    ...(motManquant(c, fiches) ? { motManquant: motManquant(c, fiches) } : {}),
    // Le client a besoin du mode pour ÉCRIRE le temps de trajet, et du
    // plafond pour dire « à moins de 10 minutes à pied ».
    mode, plafondMin: plafondMin(c, mode), rayonKm: RAYON_KM,
    // ⏱️ L'URGENCE PRIME QUAND LA PRIÈRE APPROCHE. Le composant connaît le
    // temps restant (il le calcule sur place, sans réseau) ; on lui donne
    // ici de quoi dire « atteignable avant » : chaque fiche porte déjà sa
    // distance, il suffit de la comparer aux minutes restantes.
    urgencePriere: c.categorie === 'mosquee',
    // §5 — ce qu'on a dû lâcher pour trouver quelque chose.
    relaches,
  }
  if (r && source === 'google') {
    try { await r.set(`surmesure:cache:${empreinte}`, reponse, { ex: CACHE_S }) } catch { /* jamais bloquant */ }
  }
  return NextResponse.json(reponse)
}
