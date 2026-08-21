import { NextResponse, after } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { attacherTitres, genererTitresManquants } from '@/lib/titreIA'
import { ajouterMinutes } from '@/lib/trajets'
import { motSpecifique } from '@/lib/typeMot.mjs'
import { Redis } from '@upstash/redis'
import { requeteGoogle } from '@/lib/requete.mjs'
import { forceEnvieGoogle, REQUETES_PLAT } from '@/lib/envies'
import { accepte, sertAManger } from '@/lib/categorie.mjs'
import { listAllSpots } from '@/lib/prayerSpots'
import { CRITERES_DEFAUT, type Criteres } from '@/lib/criteres'
import { minutes, plafondMin, rayonM, RAYON_KM, type Mode } from '@/lib/trajet'
import { verdictAlcool } from '@/lib/alcool.mjs'
import { PROFIL_VIDE, profilVide, requeteAvecProfil, criteresRelachables, type Profil } from '@/lib/profil'
import { prochesOsm, type LieuPriereOsm } from '@/lib/mosqueesOsm'
import { estLatinLisible } from '@/lib/latin.mjs'

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
/**
 * 🔴🔴 LE PLAFOND ANTI-ROBOT — ET LA DEMI-JOURNÉE QU'IL A COÛTÉE.
 *
 * Logs Vercel du 15 août : POST /api/lieux → 429 en rafale. Notre PROPRE
 * limiteur refusait, l'appel n'atteignait jamais Google — d'où zéro erreur
 * dans la console Google, et une demi-journée passée à chercher la panne
 * du mauvais côté.
 *
 * 20 par heure avait été calibré sur une page qui appelait UNE fois par
 * recherche. « Le quota protège du robot, pas du curieux » : quelqu'un qui
 * explore vingt minutes ne doit jamais le toucher. 120 par heure laisse
 * deux recherches par minute pendant une heure entière — un humain n'y
 * arrive pas, un robot le dépasse en dix secondes.
 */
const QUOTA_HEURE = 120
const CACHE_S = 24 * 3600

/**
 * 🔴 LA VERSION DU MOTEUR — ELLE FAIT PARTIE DE LA CLÉ DE CACHE.
 *
 * DÉFAUT CONSTATÉ PAR MOHAMED, 15 août à 13 h 55 : « Le tri est corrigé côté
 * code, mais les réponses mises en cache AVANT le correctif continuent
 * d'être servies. On corrige un moteur et on continue à distribuer les
 * vieilles réponses. » Il recevait encore Clichy-sous-Bois à 31 minutes,
 * avec Dhuhr dans 51 SECONDES, plusieurs heures après le déploiement.
 *
 * Il avait raison, et c'est un défaut de conception, pas un oubli : un cache
 * de 24 h rend TOUT correctif invisible pendant 24 h. Le code est juste, le
 * visiteur reçoit du faux, et personne ne comprend pourquoi.
 *
 * ════════ LA RÈGLE, DÉSORMAIS ════════
 *
 * Cette chaîne entre dans la clé de cache. Changer la logique de recherche
 * — le classement, le rayon, les champs demandés, les filtres — IMPOSE de
 * changer cette version. Toutes les entrées précédentes deviennent alors
 * inatteignables d'elles-mêmes : c'est une purge instantanée qui ne demande
 * ni accès à la base, ni intervention de Mohamed, ni attente.
 *
 * Les vieilles clés ne sont pas effacées : elles expirent seules au bout de
 * leurs 24 h. Ça ne coûte rien — Redis les oublie — et surtout ça évite un
 * balayage de clés en production, qui est lent et risqué.
 *
 * HISTORIQUE (garder la trace : elle explique pourquoi une version saute) :
 *   v1 — tri par pertinence Google, rayons serrés par nature de demande
 *   v2 — rankPreference DISTANCE, rayon 20 km, tri du plus proche au plus
 *        lointain, porte par catégorie (Prier n'accepte que des lieux de
 *        culte), mots du visiteur envoyés tels quels à Google
 *   v4 — le type demandé part seul chez Google (« café », plus « halal
 *        café » qui ramenait des traiteurs), rayon resserré 2 km d'abord
 *        même sur une demande écrite, et les fermés passent derrière.
 *   v3 — searchNearby (cercle + types + rayon progressif 2/5/10/20 km) pour
 *        les demandes géographiques ; searchText avec cercle pour les
 *        demandes écrites. C'est le correctif de la régression du 15 août :
 *        searchText ne sait pas faire « le plus proche »
 */
// v5 (20 août) : « il faut mettre le maximum » — le swipe d'Autour de
// moi montre TOUS les candidats déjà payés par la requête, plus
// seulement 3 + 4. RETENUS (fiches enrichies, payantes) ne bouge pas ;
// AUTRES passe de 4 à 17 : ces fiches sortent de la même réponse Google,
// zéro appel de plus — leurs photos ne se paient qu'au swipe.
const VERSION_MOTEUR = 'v6'
const CANDIDATS = 20
const RETENUS = 3
const AUTRES = 17
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
  /** ✒️ Titre court écrit par l'IA à partir des avis — cache 7 jours,
   *  jamais généré pendant la requête (lib/titreIA). Absent = rien. */
  titreIA?: string
  /** 🕐 Conseil de timing IA (« mieux le matin ») — seulement si plusieurs
   *  avis en parlent, même cache que les titres. */
  conseilIA?: string
  /** ⏱️ Minutes réelles (API Routes, lib/trajets) — absentes si Routes n'a
   *  pas répondu : le client affiche alors des mètres, jamais une estimation. */
  marcheMin?: number
  voitureMin?: number
  /** 🏷️ Type de cuisine en un mot — chaîne de fiabilité : base > types
   *  Google spécifiques > IA sur les avis (cache) > rien (le client écrit
   *  « Resto »). La source est stockée pour audit. */
  cuisine?: string
  cuisineSource?: 'base' | 'places' | 'ia' | 'generique'
  statut: string
  /** 🔴 Ce qu'on SAIT de l'alcool : jamais une supposition. */
  alcool: 'non' | 'inconnu'
  source: 'spot' | 'google' | 'osm'
  /** L'identifiant OpenStreetMap quand le lieu vient de (ou existe dans)
   *  notre base OSM — la déduplication le garde même sur une fiche Google. */
  osmId?: string
  /**
   * 🔴 LE TYPE PRINCIPAL RENDU PAR GOOGLE, tel quel (bakery, cafe,
   * meal_takeaway, restaurant, mosque, museum…). Il sert à construire les
   * propositions à partir de ce qui existe VRAIMENT autour — « s'il y a
   * trois kebabs et deux pâtisseries, on propose un kebab et une
   * pâtisserie ». Ce n'est jamais une devinette sur le nom : c'est le
   * classement de Google, recopié sans interprétation.
   */
  famille?: string
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
    // ⚠️ Ce statut n'est plus appliqué en bloc : voir statutManger() —
    // « signalé halal » exige une MENTION réelle (nom, résumé ou avis).
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
// Le journal de recherche : ce qui explique un résultat vide (itération 4).
interface Bilan {
  rayonAtteintM?: number
  ecartesAlcool?: number
  /** 🍣 Combien d'adresses Google a proposées SANS rapport avec l'envie —
   *  la différence entre « il n'y a rien ici » et « ce n'était pas le bon
   *  plat » (21 août, envie « Asiatique » à Noisy-le-Grand). */
  candidatsEnvie?: number
  ecartesEnvie?: number
}

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

/**
 * 🔴🔴 LE BON OUTIL POUR « LE PLUS PROCHE » : places:searchNearby.
 *
 * RÉGRESSION TROUVÉE PAR MOHAMED, 15 août, et son analyse était exacte :
 *   « searchText cherche PAR LE SENS : elle rend les lieux les plus
 *     pertinents du cadre, c'est-à-dire les plus connus. Dans un cadre
 *     serré, ça donnait par chance des lieux proches. Dans 20 km autour de
 *     Paris, elle remonte les célébrités : Villeneuve-la-Garenne, Clichy,
 *     Barbès. Les mosquées de Montreuil ne sont même pas dans les
 *     candidats — donc aucun tri ne peut les faire remonter. Élargir
 *     n'était pas l'erreur. Élargir SANS CHANGER D'OUTIL, si. »
 *
 * Le diff avec b79a34c le confirme : cette version-là cherchait dans un
 * rectangle de quelques minutes de trajet. Pertinence et proximité y
 * coïncidaient PAR ACCIDENT. Passer à 20 km a défait l'accident, et
 * `rankPreference: DISTANCE` triait une liste qui ne contenait déjà plus
 * les bonnes adresses.
 *
 * `searchNearby` est fait pour ça : un CERCLE (qui a un centre, contrairement
 * à un rectangle), des types demandés, et un classement par distance réelle.
 *
 * ⚠️ Il ne remplace pas `searchText` : quand on tape « pâtisserie
 * orientale », c'est le SENS qu'on cherche, et searchNearby ne sait pas
 * lire une phrase. Deux outils, deux usages — c'est `chercheGoogle` qui
 * arbitre.
 */
async function passeProximite(lat: number, lng: number, c: Criteres, cle: string, lang: string, rayon: number, journal?: Journal): Promise<Candidat[] | null> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST', signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_PASSE1 },
      body: JSON.stringify({
        languageCode: lang,
        maxResultCount: 20,
        includedTypes: TYPES_DEMANDES[c.categorie],
        ...(TYPES_EXCLUS[c.categorie].length ? { excludedTypes: TYPES_EXCLUS[c.categorie] } : {}),
        // Un CERCLE, pas un rectangle : Google mesure la distance depuis
        // son centre, donc depuis le visiteur.
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: rayon } },
        rankPreference: 'DISTANCE',
      }),
    })
    if (!r.ok) {
      const refus = await lireRefus(r)
      if (journal) journal.refus = refus
      console.error('[lieux] searchNearby refuse', refus.statut, refus.message)
      return null
    }
    const j = await r.json() as { places?: Record<string, unknown>[] }
    return lireCandidats(j.places ?? [], lat, lng, c)
  } catch (e) {
    const refus: Refus = ac.signal.aborted
      ? { statut: 0, message: `delai de ${DELAI} ms depasse` }
      : { statut: 0, message: String(e).slice(0, 140) }
    if (journal) journal.refus = refus
    return null
  } finally { clearTimeout(t) }
}

/**
 * 📏 LE RAYON PROGRESSIF, INVISIBLE POUR LE VISITEUR.
 *
 * « 2 km d'abord. Rien ou trop peu ? 5 km. Puis 10. Puis 20. On ne demande
 * JAMAIS "veux-tu élargir ?" — on élargit tout seul et on affiche le plus
 * proche d'abord. Le visiteur n'a rien à savoir de cette mécanique. »
 *
 * On s'arrête dès qu'on a de quoi remplir le vivier : chaque cran évité est
 * un appel non facturé, et un résultat rendu plus vite.
 */
const PALIERS_M = [2000, 5000, 10000, 20000]

/**
 * 📏 UNE ENVIE PRÉCISE NE SE CHERCHE PAS DANS LE QUARTIER (20 août).
 *
 * « Au lieu de 2 km élargis à 10, pour proposer plus d'offres. »
 * Les deux ordres de Mohamed ne se contredisent pas, ils portent sur deux
 * demandes différentes :
 *   · « Prier », « Manger », « Que faire » sans mot tapé → c'est une
 *     question de PROXIMITÉ : 2 km d'abord, le plus proche gagne (son
 *     retour du 16 août depuis Noisy-le-Grand).
 *   · « des sushi », « une pizza » → c'est une question d'OFFRE. Il n'y a
 *     pas un sushi de quartier à Fontenay-sous-Bois ; partir à 2 km, c'est
 *     rendre l'écran vide qu'il a photographié. On part donc à 10 km, et
 *     on classe au mérite : la meilleure note avec beaucoup d'avis.
 */
const PALIERS_ENVIE_M = [10000, 20000]

/**
 * 🔴 « LE PLUS PROCHE » VEUT DIRE LE PLUS PROCHE — même sur une demande
 * écrite. Mohamed, 16 août, depuis Noisy-le-Grand : « premier résultat à
 * 15 min à pied à Villiers-sur-Marne, deuxième à 19 min EN VOITURE et
 * FERMÉ. Il y a des adresses à cinq minutes. »
 *
 * La cause : la recherche textuelle partait d'emblée sur un cercle de
 * 20 km. Google, à qui l'on donne un grand cercle, remonte les
 * établissements les plus CONNUS du secteur — pas ceux du quartier.
 *
 * On resserre donc : 2 km d'abord, et on n'élargit que si le quartier ne
 * rend pas assez d'adresses. Le visiteur ne voit rien de cette mécanique ;
 * il voit seulement que la première adresse est à cinq minutes.
 */
async function chercheParTexte(lat: number, lng: number, c: Criteres, cle: string, lang: string, texte: string, journal?: Journal, bilan?: Bilan): Promise<Candidat[] | null> {
  let dernier: Candidat[] | null = null
  for (const rayon of (c.envieId ? PALIERS_ENVIE_M : PALIERS_M)) {
    const trouves = await passe1(lat, lng, c, cle, lang, rayon, texte, journal)
    if (bilan) bilan.rayonAtteintM = rayon
    if (trouves === null) return dernier
    dernier = trouves
    if (trouves.length >= RETENUS) break
  }
  return dernier
}

async function chercheParProximite(lat: number, lng: number, c: Criteres, cle: string, lang: string, journal?: Journal): Promise<Candidat[] | null> {
  let dernier: Candidat[] | null = null
  for (const rayon of PALIERS_M) {
    const trouves = await passeProximite(lat, lng, c, cle, lang, rayon, journal)
    if (trouves === null) return dernier   // Google muet : on garde ce qu'on avait
    dernier = trouves
    if (trouves.length >= POOL_ALCOOL) break
  }
  return dernier
}

/** La lecture d'une réponse Google — commune aux deux moteurs. */
function lireCandidats(places: Record<string, unknown>[], lat: number, lng: number, c: Criteres): Candidat[] {
  const PRIX: Record<string, number> = { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 }
  return places
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
        rang: i,
        primaryType: p.primaryType as string | undefined,
        types: p.types as string[] | undefined,
      } as Candidat
    })
    .filter((x): x is Candidat => x !== null)
    // 🔴🔴 LA PORTE PAR CATÉGORIE (lib/categorie.mjs).
    .filter((x) => accepte(c.categorie, x.primaryType, x.types))
    // 🔴 BARRAGE ALCOOL 1 — par le type, gratuit et immédiat.
    .filter((x) => verdictAlcool({ nom: x.nom, primaryType: x.primaryType, types: x.types }).garde
      || estRefusPourNomSeul(x))
}

/**
 * Les types demandés à `searchNearby`, par catégorie. Une demande
 * géographique ne se décrit pas par une phrase : elle se décrit par des
 * TYPES. C'est plus précis, et Google n'a plus à deviner.
 */
const TYPES_DEMANDES: Record<'manger' | 'mosquee' | 'activite', string[]> = {
  mosquee: ['mosque'],
  manger: ['restaurant', 'meal_takeaway', 'bakery'],
  // Des ACTIVITÉS, et rien qui serve à manger.
  activite: ['museum', 'park', 'tourist_attraction', 'art_gallery', 'aquarium', 'zoo', 'historical_landmark', 'garden'],
}
/** Ce qu'on refuse explicitement, en plus de la porte par catégorie. */
const TYPES_EXCLUS: Record<'manger' | 'mosquee' | 'activite', string[]> = {
  mosquee: [],
  manger: [],
  activite: ['restaurant', 'cafe', 'bar', 'meal_takeaway', 'bakery', 'coffee_shop'],
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
        // 🔵 UN CERCLE CENTRÉ SUR MOI, jamais un rectangle nu (Mohamed,
        // 15 août : « un cercle a un centre ; un rectangle n'en a pas pour
        // Google »). En biais et non en restriction : sur une demande
        // ÉCRITE (« pâtisserie orientale »), c'est le sens qui prime, et une
        // contrainte dure rendrait des écrans vides là où une adresse
        // parfaite existe deux rues plus loin que le cercle. Le filet de
        // sécurité en aval — recalcul de distance et tri — empêche de
        // toute façon l'absurde de sortir.
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: rayon } },
      }),
    })
    if (!r.ok) {
      const refus = await lireRefus(r)
      if (journal) journal.refus = refus
      console.error('[lieux] Google a refuse la recherche', refus.statut, refus.message)
      return null
    }
    const j = await r.json() as { places?: Record<string, unknown>[] }
    return lireCandidats(j.places ?? [], lat, lng, c)
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
async function verifierAlcool(cands: Candidat[], cle: string, bilan?: Bilan): Promise<Candidat[]> {
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
  const gardes = verifies.filter((x): x is Candidat => !!x && verdictAlcool(x).garde)
  const ecartes = verifies.filter((x) => x && !verdictAlcool(x).garde)
  if (bilan) bilan.ecartesAlcool = (bilan.ecartesAlcool ?? 0) + ecartes.length
  // 🔎 Itération 4, diagnostic : quand le barrage vide la liste, on veut le
  // VOIR — c'est la première cause suspecte d'un « aucune adresse » à tort.
  if (ecartes.length) console.warn(`[lieux] barrage alcool : ${ecartes.length}/${verifies.length} écarté(s) — ${ecartes.map((x) => { const v = verdictAlcool(x!); return `${x!.nom} (${'motif' in v ? v.motif : '?'})` }).join(' · ')}`)
  return gardes
}

/** Le tri : c'est lui qui rend le résultat « sur mesure ». */
function classer(cands: Candidat[], c: Criteres, rayon: number, bilan?: Bilan): Candidat[] {
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
  // 🍣 LE FILTRE D'ENVIE — la réponse de Google est RELUE. Sans lui, une
  // envie de sushi rendait les restaurants du quartier que Google avait
  // ajoutés pour compléter sa liste. Une adresse sans rapport n'est pas
  // reléguée : elle n'est pas montrée.
  const avecEnvie = c.envieId
    ? cands.map((x) => ({ x, f: forceEnvieGoogle(x.primaryType, x.types, x.nom, c.envieId!) })).filter((e) => e.f > 0)
    : cands.map((x) => ({ x, f: 2 as const }))
  const forces = new Map(avecEnvie.map((e) => [e.x.id, e.f]))
  if (c.envieId) {
    if (bilan) { bilan.candidatsEnvie = cands.length; bilan.ecartesEnvie = cands.length - avecEnvie.length }
    console.info(`[lieux] envie « ${c.envieId} » : ${cands.length} candidats Google → ${avecEnvie.length} du bon plat`)
  }

  return avecEnvie.map((e) => e.x)
    .filter((x) => x.distanceM <= rayon)
    .filter((x) => (c.budget === 'petit' ? (x.prix ?? 2) <= 2 : c.budget === 'moyen' ? (x.prix ?? 2) <= 3 : true))
    // « Ouvert maintenant » reste un filtre dur quand il est demandé : une
    // adresse fermée n'est pas une réponse à « je veux manger là, tout de
    // suite ».
    .filter((x) => !(c.ouvertMaintenant && x.ouvert === false))
    // 🔴 LES OUVERTS AVANT LES FERMÉS — Mohamed, 16 août : « premier
    // résultat à 15 min à pied, deuxième à 19 min EN VOITURE et FERMÉ ».
    // Un lieu fermé n'est jamais une réponse à « où je mange maintenant » :
    // il passe derrière, quelle que soit sa distance. On ne le supprime pas
    // pour autant — il peut rouvrir dans l'heure —, et sa fiche porte son
    // état. Ce qu'on ne sait pas (ouvert === undefined) se range avec les
    // ouverts : on ne rétrograde pas une adresse sur une ignorance.
    // Puis, à état égal : du plus proche au plus lointain.
    .sort((a, b) => {
      const fa = a.ouvert === false ? 1 : 0
      const fb = b.ouvert === false ? 1 : 0
      if (fa !== fb) return fa - fb
      // 🍣 SUR UNE ENVIE : le mérite avant la distance (20 août — « les
      // meilleurs notés avec beaucoup de commentaires »). Le plat exact
      // passe devant la famille voisine ; ensuite la note, ensuite le
      // nombre d'avis. Une note sur trois avis n'est pas une vérité : en
      // dessous de 20 avis, l'adresse est jugée sur sa distance.
      if (c.envieId) {
        const pa = forces.get(a.id) ?? 0, pb = forces.get(b.id) ?? 0
        if (pa !== pb) return pb - pa
        const sa = (a.nbAvis ?? 0) >= 20 ? (a.note ?? 0) : 0
        const sb = (b.nbAvis ?? 0) >= 20 ? (b.note ?? 0) : 0
        if (sa !== sb) return sb - sa
        if ((b.nbAvis ?? 0) !== (a.nbAvis ?? 0)) return (b.nbAvis ?? 0) - (a.nbAvis ?? 0)
      }
      return a.distanceM - b.distanceM
    })
}

/**
 * 🥅 LE FILET DE SÉCURITÉ — quel que soit le moteur, quelle que soit la
 * catégorie.
 *
 * Ordre de Mohamed, 15 août : « On recalcule NOUS-MÊMES la distance depuis
 * ma position, on trie dessus, et on écarte l'absurde. "Le plus proche" ne
 * peut jamais rendre 64 minutes de voiture quand il existe des adresses à
 * 5 minutes. »
 *
 * La distance est déjà recalculée chez nous (`distM`, jamais un chiffre de
 * Google) et le tri est déjà par distance. Ce filet couvre le dernier cas :
 * une liste qui contient à la fois du très proche et du très lointain. On
 * ne coupe PAS à un seuil fixe — un seuil fixe rendrait des écrans vides en
 * rase campagne, où 15 km est la réponse normale. On coupe RELATIVEMENT au
 * plus proche : si la première adresse est à 800 m, une adresse à 20 km n'a
 * rien à faire dans la même réponse ; si la première est à 12 km, c'est que
 * la zone est vide et tout le monde reste.
 */
function ecarterLAbsurde(tries: Candidat[]): Candidat[] {
  if (tries.length < 2) return tries
  const plusProche = tries[0].distanceM
  // Cinq fois le plus proche, et au moins 3 km de marge : en ville on
  // resserre fort, à la campagne on ne coupe rien.
  const plafond = Math.max(plusProche * 5, plusProche + 3000)
  return tries.filter((x) => x.distanceM <= plafond)
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
    famille: cand.primaryType,
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

// ─────────────── 🕌 découverte par NOTRE base OSM (17 août) ───────────────
//
// OpenStreetMap recense ~286 000 lieux de culte musulmans ; notre base
// locale (data/osm, lib/mosqueesOsm) rend « les plus proches » en
// millisecondes, gratuitement. Pour la catégorie mosquée en demande
// GÉOGRAPHIQUE : la DÉCOUVERTE ne coûte plus AUCUN appel Google — on ne
// paie que l'ENRICHISSEMENT des fiches réellement affichées (≤ 3 appels).
// Déduplication obligatoire : un correspondant Google à < 60 m avec un nom
// semblable REMPLACE la fiche OSM (plus riche), l'identifiant OSM noté à
// côté. Nos spots vérifiés restent au-dessus. Si la base est muette sur la
// zone, Google reprend son rôle normal.
// Licence ODbL : le crédit « © les contributeurs OpenStreetMap » est
// affiché par l'interface partout où source === 'osm'.

/** Jamais un champ vide : sans nom → « Lieu de prière (nom non
 *  renseigné) » ; nom en écriture non latine → gardé entre parenthèses. */
function nomOsmAffichable(o: LieuPriereOsm, lang: string): string {
  const generique = lang === 'en' ? 'Prayer place' : 'Lieu de prière'
  const brut = o.nom ?? o.nomAr
  if (!brut) return lang === 'en' ? `${generique} (name not listed)` : `${generique} (nom non renseigné)`
  if (!estLatinLisible(brut)) return `${generique} (${brut})`
  return brut
}

function ficheDepuisOsm(o: LieuPriereOsm & { distanceM: number }, lang: string): Fiche {
  return {
    id: `osm-${o.id}`, osmId: o.id,
    nom: nomOsmAffichable(o, lang),
    lat: o.lat, lng: o.lng, distanceM: o.distanceM,
    // `place_of_worship + muslim` couvre aussi salles de prière, mausolées,
    // zaouïas : on dit « lieu de prière », jamais « mosquée » sans preuve.
    statut: CATEGORIE.mosquee.statutOSM,
    alcool: 'inconnu',
    source: 'osm',
    famille: o.type,
  }
}

const normNom = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

/** Deux noms désignent-ils plausiblement le même lieu ? Inclusion après
 *  normalisation, ou moitié des mots en commun. */
function nomsSemblables(a?: string, b?: string): boolean {
  if (!a || !b) return true // sans nom des deux côtés, la distance décide
  const na = normNom(a), nb = normNom(b)
  if (!na || !nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  const ta = new Set(na.split(' ')), tb = new Set(nb.split(' '))
  const commun = [...ta].filter((m) => m.length > 2 && tb.has(m)).length
  return commun >= Math.ceil(Math.min(ta.size, tb.size) / 2)
}

/** UN appel Google par fiche affichée — pour la richesse (photos, note,
 *  horaires), jamais pour la découverte. Rend la fiche Google fusionnée
 *  (id OSM conservé) si le même lieu y existe, sinon null. */
async function enrichirOsmParGoogle(o: LieuPriereOsm & { distanceM: number }, cle: string, lang: string): Promise<Fiche | null> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const CHAMPS = ['id', 'displayName', 'location', 'formattedAddress', 'rating', 'userRatingCount', 'googleMapsUri', 'currentOpeningHours', 'photos']
      .map((ch) => `places.${ch}`).join(',')
    const r = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST', signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS },
      body: JSON.stringify({
        languageCode: lang, maxResultCount: 3,
        includedTypes: ['mosque'],
        locationRestriction: { circle: { center: { latitude: o.lat, longitude: o.lng }, radius: 60 } },
        rankPreference: 'DISTANCE',
      }),
    })
    if (!r.ok) { console.error('[lieux] enrichissement OSM→Google refusé', r.status); return null }
    const j = await r.json() as { places?: Record<string, unknown>[] }
    for (const p of j.places ?? []) {
      const nomG = (p.displayName as { text?: string } | undefined)?.text
      if (!nomsSemblables(o.nom, nomG)) continue
      const loc = p.location as { latitude?: number; longitude?: number } | undefined
      const oh = p.currentOpeningHours as { openNow?: boolean; weekdayDescriptions?: string[] } | undefined
      const photos = (p.photos as { name?: string }[] | undefined) ?? []
      return {
        id: p.id as string | undefined, osmId: o.id,
        nom: nomG && estLatinLisible(nomG) ? nomG : nomOsmAffichable(o, lang),
        lat: loc?.latitude ?? o.lat, lng: loc?.longitude ?? o.lng,
        distanceM: o.distanceM,
        note: p.rating as number | undefined,
        nbAvis: p.userRatingCount as number | undefined,
        adresse: p.formattedAddress as string | undefined,
        mapsUri: p.googleMapsUri as string | undefined,
        ouvert: oh?.openNow,
        fermeA: heureFermeture(oh?.weekdayDescriptions),
        photos: photos.slice(0, 2).map((ph) => `/api/lieux/photo?ref=${encodeURIComponent(ph.name ?? '')}`).filter((u) => !u.endsWith('ref=')),
        statut: CATEGORIE.mosquee.statut,
        alcool: 'inconnu',
        source: 'google',
      }
    }
    return null
  } catch { return null } finally { clearTimeout(t) }
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
  const empreinte = `${VERSION_MOTEUR}:${zone}:${c.categorie}:${c.quoi}:${(c.motsCles ?? '').toLowerCase()}:${c.envieId ?? ''}:${profil.regime}:${profil.sansGluten ? 1 : 0}:${profil.sansLactose ? 1 : 0}:${profil.objectif}:${c.mode}:${c.budget}:${c.exigence}:${c.ouvertMaintenant ? 1 : 0}:${lang}`
  if (r) {
    try {
      const cache = await r.get<{ fiches: Fiche[]; autres: Fiche[]; source: string }>(`surmesure:cache:${empreinte}`)
      if (cache) {
        await compter(cache.fiches.length ? 'surmesure:avec' : 'surmesure:vides')
        return NextResponse.json({ ...cache, cache: true })
      }
    } catch { /* cache muet = on cherche */ }
  }

  // ─────────────────── LE PLAFOND, APRÈS LE CACHE ───────────────────
  //
  // 🔴 Il était compté AVANT la lecture du cache : une réponse déjà en
  // mémoire, qui ne coûte rien et n'appelle personne, consommait du quota.
  // Désormais on ne compte que ce qui va réellement partir vers Google.
  //
  // 🔴 Et on ne réincrémente plus une fois le plafond franchi : chaque
  // nouvel essai repoussait la sortie de blocage d'un cran. On lit, on
  // compare, on n'incrémente que si on laisse passer.
  //
  // 🔴 L'administrateur ne se bloque pas lui-même : Mohamed teste son
  // propre site, il doit pouvoir enchaîner trente recherches.
  if (r && !checkAdmin(req)) {
    try {
      const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim()
      const k = `lieux:quota:${ip}:${new Date().toISOString().slice(0, 13)}`
      const dejaFait = Number((await r.get<number>(k)) ?? 0)
      if (dejaFait >= QUOTA_HEURE) {
        // ⏱️ Le délai RÉEL, pas une formule : on demande à Redis combien de
        // temps il reste à la clé. Un message qui dit « réessaie plus tard »
        // sans dire quand ne vaut pas mieux que le silence.
        let secondes = 0
        try { secondes = Math.max(0, Number(await r.ttl(k))) } catch { secondes = 0 }
        // ⚠️ Un 429 doit se VOIR dans les journaux. Le nôtre passait en
        // silence, et on a cherché la panne chez Google pendant une
        // demi-journée.
        console.warn(`[lieux] QUOTA INTERNE ATTEINT — ${dejaFait}/${QUOTA_HEURE} sur cette heure, ip ${ip}. Google n'a PAS été appelé. Nouvelle tentative possible dans ${Math.ceil(secondes / 60)} min.`)
        await compter('surmesure:quota-atteint')
        return NextResponse.json({ erreur: 'quota', secondes }, {
          status: 429,
          headers: { 'Retry-After': String(secondes || 60) },
        })
      }
      const n = await r.incr(k)
      if (n === 1) await r.expire(k, 3600)
    } catch { /* un compteur en panne ne ferme jamais le service */ }
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
  const bilan: Bilan = {}

  // ═══ 🕌 PRIÈRE : NOTRE BASE OSM D'ABORD (chantier du 17 août) ═══
  // Demande géographique (bouton, pas de mots tapés) → la découverte sort
  // de la base locale, gratuite et instantanée. Google ne sert qu'à
  // enrichir les fiches AFFICHÉES : au plus 3 appels, zéro pour trouver.
  let decouverteOsmFaite = false
  if (c.categorie === 'mosquee' && c.exigence !== 'verifies' && !(c.motsCles ?? '').trim()) {
    const candidatsOsm = prochesOsm(lat, lng, rayon, RETENUS + AUTRES + 10)
    if (candidatsOsm.length) {
      decouverteOsmFaite = true
      // Dédup 1 : nos spots vérifiés à la main restent au-dessus (< 60 m).
      const libres = candidatsOsm.filter((o) => !spots.some((s) => distM(s.lat, s.lng, o.lat, o.lng) < 60))
      const aAfficher = libres.slice(0, Math.max(0, RETENUS - spots.length))
      let appelsGoogle = 0
      const enrichies = await Promise.all(aAfficher.map(async (o) => {
        if (!cle) return ficheDepuisOsm(o, lang)
        appelsGoogle++
        // Dédup 2 : le correspondant Google (< 60 m + nom semblable)
        // REMPLACE la fiche OSM — jamais deux fois le même lieu.
        return (await enrichirOsmParGoogle(o, cle, lang)) ?? ficheDepuisOsm(o, lang)
      }))
      fiches = [...spots, ...enrichies].slice(0, RETENUS)
      autres = libres.slice(aAfficher.length, aAfficher.length + AUTRES).map((o) => ficheDepuisOsm(o, lang))
      source = 'osm'
      bilan.rayonAtteintM = rayon
      // 📊 La mesure exigée : zéro appel de découverte, ≤ 3 d'enrichissement.
      console.info(`[lieux] mosquée via base OSM : ${candidatsOsm.length} candidats locaux, ${appelsGoogle} appel(s) Google (enrichissement uniquement, 0 pour la découverte)`)
      await compter('surmesure:osm-base')
    }
  }

  // « Seulement les adresses vérifiées » : on n'interroge même pas Google.
  if (decouverteOsmFaite) {
    // La découverte est faite — rien d'autre à interroger.
  } else if (c.exigence === 'verifies') {
    fiches = spots.slice(0, RETENUS)
  } else if (cle) {
    // 👤 LE PROFIL AFFINE LA REQUÊTE — jamais les filtres de base. Google
    // ne connaît pas « protéiné » : on traduit en poke, grillades, bowls…
    const texteBase = requeteGoogle(c)
    const avecProfil = c.categorie === 'manger' ? requeteAvecProfil(texteBase, profil) : texteBase
    // 🔍 LA TRACE DEMANDÉE PAR MOHAMED, 16 août : « écris dans les journaux
    // le texte exactement envoyé à Google. Tape "café", puis "kebab",
    // compare les deux lignes. Ne devine pas : mesure. » Deux lignes
    // identiques pour deux mots différents = le défaut est prouvé, sans
    // avoir à supposer où il se cache.
    console.info(`[lieux] mots du visiteur « ${c.motsCles ?? ''} » → texte envoyé à Google « ${avecProfil} » (catégorie ${c.categorie})`)

    // ════════ 🔀 L'AIGUILLAGE : QUEL MOTEUR POUR QUELLE DEMANDE ════════
    //
    // Ordre de Mohamed, 15 août, et il vaut pour les TROIS catégories sans
    // exception :
    //   · DEMANDE GÉOGRAPHIQUE (bouton Prier / Manger / Que faire, « autour
    //     de moi », « le plus proche ») → searchNearby, cercle, types,
    //     rankPreference DISTANCE, rayon progressif.
    //   · DEMANDE LIBRE (« un kebab pas cher », « pâtisserie orientale »)
    //     → searchText, parce qu'elle seule sait lire une phrase — mais
    //     avec un cercle centré sur moi.
    //
    // Le critère d'aiguillage est simple et vérifiable : le visiteur
    // a-t-il ÉCRIT quelque chose d'exploitable ? Ses mots sont dans
    // `motsCles` ; s'ils sont vides, il a appuyé sur un bouton, et c'est
    // une demande purement géographique.
    const demandeEcrite = !!(c.motsCles ?? '').trim()
    let cands = demandeEcrite
      ? await chercheParTexte(lat, lng, c, cle, lang, avecProfil, journal, bilan)
      : await chercheParProximite(lat, lng, c, cle, lang, journal)
    if (!demandeEcrite) bilan.rayonAtteintM = rayon
    // 🔎 Le journal du diagnostic (itération 4) : la requête exacte et ce
    // que chaque étage a laissé passer — lisible dans les logs serveur.
    console.warn(`[lieux] «${avecProfil}» cat=${c.categorie ?? 'manger'} rayon=${bilan.rayonAtteintM ?? rayon}m → candidats=${cands?.length ?? 'aucune réponse'}`)

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

    // 🍣 LE REPLI PAR PLAT (21 août). « Il ne trouve jamais asiatique — le
    // mot clé choisi n'est pas bon je pense, là où je suis il y a plein de
    // sushi. » L'intuition était juste : « restaurant asiatique » est un
    // mot de CATÉGORIE, que personne ne met sur sa devanture ; « sushi »,
    // « chinois », « thaï » sont des mots de PLAT, et ce sont ceux que
    // Google indexe. On relance donc sur les mots du plat — mais SEULEMENT
    // si l'écran allait rester vide, et seulement pour compléter : les
    // adresses déjà trouvées restent, on ajoute celles qui manquaient.
    if (c.envieId && (cands?.length ?? 0) < RETENUS) {
      // ⏱ EN PARALLÈLE, PAS EN FILE (21 août : « le temps de recherche met
      // trois, quatre secondes »). Quatre requêtes enchaînées, c'est quatre
      // allers-retours ajoutés bout à bout ; lancées ensemble, c'est le
      // temps de la plus lente. Même nombre d'appels, même coût.
      const requetes = (REQUETES_PLAT[c.envieId] ?? []).slice(0, 4)
      const lots = await Promise.all(requetes.map((q) => passe1(lat, lng, c, cle, lang, PALIERS_ENVIE_M[0], q, journal)))
      const vus = new Set((cands ?? []).map((x) => x.id))
      const neufs = lots.flatMap((l) => l ?? []).filter((x) => (vus.has(x.id) ? false : (vus.add(x.id), true)))
      if (neufs.length) cands = [...(cands ?? []), ...neufs]
      console.info(`[lieux] repli envie « ${c.envieId} » : ${requetes.length} requêtes de plat en parallèle → +${neufs.length} candidat(s)`)
    }

    if (cands !== null) etatGoogle = cands.length ? 'ok' : 'vide'
    if (cands?.length) {
      const tries = ecarterLAbsurde(classer(cands, c, rayon, bilan)).filter((x) => !spots.some((s) => distM(s.lat, s.lng, x.lat, x.lng) < 60))
      // 🔴 BARRAGE 2 — on paie la vérification alcool sur un pool élargi
      // AVANT de choisir les trois. C'est l'ordre inverse qui avait laissé
      // passer un bistrot : on filtrait trop tard, ou pas du tout.
      // La catégorie « mosquée » n'a pas à passer par là.
      // Le barrage alcool ne concerne que ce qui SERT À MANGER : un parc
      // n'est ni halal ni pas halal (itération 4, correction 3) — et la
      // vérification payante sur des musées était de l'argent jeté.
      //
      // 🔴 21 août — LA FAILLE QUE MOHAMED A TROUVÉE SANS LA CHERCHER.
      // La condition portait sur la CATÉGORIE DEMANDÉE, pas sur la nature
      // du lieu : « le barrage alcool ne concerne que MANGER ». Résultat,
      // une pizzeria écartée en mode Manger ressortait en mode « Que
      // faire » — le filtre le plus important du site se contournait en
      // changeant d'onglet. Il porte désormais sur le LIEU : dès qu'un
      // résultat sert à manger, il est vérifié, quel que soit l'onglet.
      const aVerifier = c.categorie === 'manger'
        ? tries
        : tries.filter((x) => sertAManger(x.primaryType, x.types))
      let classes = tries
      if (aVerifier.length) {
        const verifies = await verifierAlcool(aVerifier, cle, bilan)
        const gardes = new Set(verifies.map((x) => x.id))
        // Les lieux qui ne servent pas à manger passent sans être payés.
        classes = c.categorie === 'manger'
          ? verifies
          : tries.filter((x) => !sertAManger(x.primaryType, x.types) || gardes.has(x.id))
      }

      // 🍶 QUAND L'ALCOOL A TOUT EMPORTÉ, ON CHERCHE PLUS LOIN (21 août).
      // Mesuré à Noisy-le-Grand sur l'envie « Asiatique » : Google trouvait
      // bien des adresses, et les trois servaient de l'alcool. Le barrage
      // fait son travail — il ne bougera pas —, mais abandonner à 10 km
      // n'est pas une réponse : dans une couronne un peu plus large, il y a
      // des tables sans alcool. On repart donc une fois, jusqu'à 20 km,
      // AVANT de rendre un écran vide.
      if (c.envieId && classes.length === 0 && (bilan.ecartesAlcool ?? 0) > 0 && (bilan.rayonAtteintM ?? 0) < PALIERS_ENVIE_M[1]) {
        const large = await passe1(lat, lng, c, cle, lang, PALIERS_ENVIE_M[1], avecProfil, journal)
        if (large?.length) {
          bilan.rayonAtteintM = PALIERS_ENVIE_M[1]
          const triesLarge = ecarterLAbsurde(classer(large, c, PALIERS_ENVIE_M[1], bilan))
            .filter((x) => !spots.some((sp) => distM(sp.lat, sp.lng, x.lat, x.lng) < 60))
          classes = c.categorie === 'manger' ? await verifierAlcool(triesLarge, cle, bilan) : triesLarge
          console.info(`[lieux] alcool a tout écarté à 10 km — seconde passe à 20 km : ${classes.length} retenue(s)`)
        }
      }

      const placesRetenues = classes.slice(0, Math.max(0, RETENUS - spots.length))
      // PASSE 2 : uniquement sur les retenues.
      const enrichies = await Promise.all(placesRetenues.map((x) => enrichir(x, cle, lang, origin, c.categorie)))
      // 🏅 COUCHE HALAL HONNÊTE (itération 4) : « signalé halal » exige une
      // MENTION réelle — dans le nom, le résumé Google ou un avis. Sans
      // mention : « à vérifier », franchement. Le badge vert reste réservé
      // à notre base vérifiée (spots), comme toujours.
      if (c.categorie === 'manger') {
        for (const f of enrichies) {
          const mention = /halal/i.test(f.nom) || /halal/i.test(f.resume ?? '') || (f.avis ?? []).some((a) => /halal/i.test(a.texte))
          f.statut = mention
            ? 'signalé halal sur Google Maps — à confirmer sur place'
            : 'à vérifier selon tes critères'
        }
      }
      source = 'google'
      fiches = [...spots, ...enrichies].slice(0, RETENUS)
      autres = classes.slice(placesRetenues.length, placesRetenues.length + AUTRES).map((x) => ({
        id: x.id, nom: x.nom, distanceM: x.distanceM, lat: x.lat, lng: x.lng,
        note: x.note, nbAvis: x.nbAvis, prix: x.prix, ouvert: x.ouvert, adresse: x.adresse,
        statut: CATEGORIE[c.categorie].statut,
        alcool: alcoolDe(x),
        source: 'google' as const,
        famille: x.primaryType,
      }))
    }
  }

  if (!decouverteOsmFaite && source !== 'google' && c.exigence !== 'verifies') {
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

  // ✒️ Les titres IA déjà en cache rejoignent les fiches (lecture seule) ;
  // les manquants se génèrent APRÈS la réponse, jamais pendant l'attente.
  // 🏷️ Niveau 2 de la chaîne de fiabilité : le primaryType Google quand il
  // est SPÉCIFIQUE (turkish_restaurant → Turc). Le niveau 3 (IA sur les
  // avis, en cache) ne parle que si les niveaux au-dessus se taisent.
  for (const f of fiches) {
    if (f.cuisine) continue
    const spec = motSpecifique(f.famille)
    if (spec) { f.cuisine = spec; f.cuisineSource = 'places' }
  }
  await attacherTitres(fiches, r)
  after(() => genererTitresManquants(fiches, r))
  // ⏱️ Les minutes réelles (règle actée : ≤ 15 min → marche, sinon voiture).
  // 1,5 s maximum, échec silencieux — et elles entrent dans le cache avec
  // les fiches : un cache-hit ne repaie jamais Routes.
  await ajouterMinutes(fiches, { lat, lng }, r)

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
    // 🔎 Itération 4 : le rayon RÉELLEMENT cherché, et ce que le barrage
    // alcool a écarté — pour qu'un écran vide dise la vérité.
    rayonAtteintKm: Math.round((bilan.rayonAtteintM ?? rayonM(c, mode)) / 1000),
    ...(bilan.ecartesAlcool ? { ecartesAlcool: bilan.ecartesAlcool } : {}),
    // Dire POURQUOI l'écran est vide : « rien ici » et « rien de ce plat »
    // ne se corrigent pas de la même façon.
    ...(bilan.ecartesEnvie ? { ecartesEnvie: bilan.ecartesEnvie, candidatsEnvie: bilan.candidatsEnvie } : {}),
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
