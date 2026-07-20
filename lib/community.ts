// ═══ COMMUNAUTÉ VoyagesHalal — modèle de données partagé (web + app) ═══
// Vision : « le réseau où les voyageurs musulmans partagent le vrai savoir ».
// Chaque contribution = sadaqa jâriya. JAMAIS « certifié » : les spots sont
// « partagés par la communauté · à confirmer » puis « X voyageurs confirment ».
//
// Stockage Redis (Upstash) :
//   vh:u:<id>                 → profil contributeur
//   vh:u:email:<email>        → id            vh:u:pseudo:<pseudo> → id
//   vh:token:<token>          → id (session 180 j)
//   vh:otp:<email>            → code 6 chiffres (10 min)
//   vh:feed                   → LPUSH activité (LTRIM 200)
//   vh:lb:all / vh:lb:<YYYY-MM> / vh:lb:ville:<slug> → ZSET points
//   vh:spot:<id>:confirmers   → SET userIds     vh:spot:<id>:reports → SET
//   vh:rl:<clé>               → rate limit

import { getRedis } from '@/lib/pushStore'
import { saveSpot as saveSpotRaw } from '@/lib/prayerSpots'
import type {} from '@/lib/prayerSpots'
import type { PrayerSpot } from '@/lib/villeTypes'

export interface CommunityUser {
  id: string
  pseudo: string
  email: string
  ville?: string
  points: number
  nbSpots: number
  nbConfirmations: number // confirmations DONNÉES
  badges: string[]
  createdAt: string
}

export interface FeedItem {
  type: 'spot' | 'confirm'
  pseudo: string
  spotId: string
  spotNom: string
  spotSlug: string
  villeSlug: string
  villeNom: string
  categorie: string
  date: string
}

// ── Points, niveaux, badges (BLOC 4) ──
export const POINTS = { spot: 10, confirmDonnee: 2, confirmRecue: 5 } as const

export const NIVEAUX = [
  { id: 'voyageur', fr: 'Voyageur', en: 'Traveler', min: 0, icon: '🧳' },
  { id: 'explorateur', fr: 'Explorateur', en: 'Explorer', min: 50, icon: '🧭' },
  { id: 'guide', fr: 'Guide', en: 'Guide', min: 200, icon: '⭐' },
  { id: 'ambassadeur', fr: 'Ambassadeur', en: 'Ambassador', min: 500, icon: '👑' },
] as const
export function niveauOf(points: number) {
  return [...NIVEAUX].reverse().find((n) => points >= n.min) ?? NIVEAUX[0]
}
// Récompenses concrètes par niveau (affichées sur le profil)
export const RECOMPENSES: Record<string, { fr: string; en: string }[]> = {
  explorateur: [{ fr: 'Accès bêta aux nouvelles fonctionnalités', en: 'Beta access to new features' }],
  guide: [{ fr: 'App premium débloquée gratuitement', en: 'Premium app unlocked for free' }],
  ambassadeur: [{ fr: 'Spots mis en avant + avantages partenaires à venir', en: 'Featured spots + partner perks coming' }],
}

export const BADGES: Record<string, { fr: string; en: string; icon: string; desc: string }> = {
  'premier-spot': { fr: 'Premier spot', en: 'First spot', icon: '🌱', desc: 'Ta première contribution — qu\'Allah la fasse fructifier' },
  '10-spots': { fr: '10 spots', en: '10 spots', icon: '🌳', desc: '10 lieux partagés avec la oumma' },
  'sauveur-priere': { fr: 'Sauveur de prière', en: 'Prayer saver', icon: '🕌', desc: '5 coins prière partagés' },
  'decouvreur': { fr: 'Découvreur de pépites', en: 'Gem finder', icon: '💎', desc: '3 pépites partagées' },
  'confirmateur': { fr: 'Confirmateur fiable', en: 'Trusted confirmer', icon: '✅', desc: '25 spots confirmés pour les autres' },
}
export function ambassadeurBadge(villeNom: string) {
  return { fr: `Ambassadeur de ${villeNom}`, en: `${villeNom} Ambassador`, icon: '🏙️', desc: `10 spots partagés à ${villeNom}` }
}

export const CATEGORIES = [
  { id: 'coin_priere', fr: 'Coin prière', en: 'Prayer spot', icon: '🕌' },
  { id: 'resto', fr: 'Resto halal', en: 'Halal resto', icon: '🍽️' },
  { id: 'espace_femmes', fr: 'Espace femmes', en: 'Women space', icon: '🏊' },
  { id: 'boucherie', fr: 'Boucherie', en: 'Butcher', icon: '🥩' },
  { id: 'pepite', fr: 'Pépite', en: 'Hidden gem', icon: '💎' },
  { id: 'autre', fr: 'Autre', en: 'Other', icon: '📍' },
] as const

// ── Utilisateurs & sessions ──
const normEmail = (e: string) => e.toLowerCase().trim()
export const normPseudo = (p: string) => p.trim().slice(0, 24).replace(/[^\p{L}\p{N} _.-]/gu, '')

export async function getUserById(id: string): Promise<CommunityUser | null> {
  const r = getRedis(); if (!r) return null
  return ((await r.get(`vh:u:${id}`)) as CommunityUser | null) ?? null
}
export async function getUserByPseudo(pseudo: string): Promise<CommunityUser | null> {
  const r = getRedis(); if (!r) return null
  const id = (await r.get(`vh:u:pseudo:${normPseudo(pseudo).toLowerCase()}`)) as string | null
  return id ? getUserById(id) : null
}
export async function getUserByToken(token: string | null): Promise<CommunityUser | null> {
  if (!token || !/^[a-z0-9]{20,64}$/i.test(token)) return null
  const r = getRedis(); if (!r) return null
  const id = (await r.get(`vh:token:${token}`)) as string | null
  return id ? getUserById(id) : null
}
export function tokenFromRequest(req: Request): string | null {
  const a = req.headers.get('authorization') || ''
  return a.startsWith('Bearer ') ? a.slice(7) : null
}

export async function findOrCreateUser(email: string, pseudo: string): Promise<CommunityUser | null> {
  const r = getRedis(); if (!r) return null
  const em = normEmail(email)
  const existingId = (await r.get(`vh:u:email:${em}`)) as string | null
  if (existingId) return getUserById(existingId)
  let ps = normPseudo(pseudo) || `voyageur${Date.now().toString(36).slice(-4)}`
  if (await r.get(`vh:u:pseudo:${ps.toLowerCase()}`)) ps = `${ps}-${Date.now().toString(36).slice(-3)}`
  const user: CommunityUser = {
    id: `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    pseudo: ps, email: em, points: 0, nbSpots: 0, nbConfirmations: 0, badges: [],
    createdAt: new Date().toISOString(),
  }
  await r.set(`vh:u:${user.id}`, user)
  await r.set(`vh:u:email:${em}`, user.id)
  await r.set(`vh:u:pseudo:${ps.toLowerCase()}`, user.id)
  return user
}
export async function createSession(userId: string): Promise<string | null> {
  const r = getRedis(); if (!r) return null
  const tok = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 40)
  await r.set(`vh:token:${tok}`, userId, { ex: 60 * 60 * 24 * 180 })
  return tok
}

// ── Rate limit générique ──
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const r = getRedis(); if (!r) return true
  const k = `vh:rl:${key}`
  const n = await r.incr(k)
  if (n === 1) await r.expire(k, windowSec)
  return n <= max
}

// ── Impact : « grâce à toi, X musulmans ont trouvé… » (vues réelles + confirmations) ──
export async function impactOf(userId: string): Promise<number> {
  const r = getRedis(); if (!r) return 0
  return Number((await r.get(`vh:u:${userId}:impact`)) ?? 0)
}
export async function addImpact(userId: string, n = 1) {
  const r = getRedis(); if (!r) return
  await r.incrby(`vh:u:${userId}:impact`, n)
}

// ── Feed d'activité (BLOC 5) ──
export async function pushFeed(item: FeedItem) {
  const r = getRedis(); if (!r) return
  await r.lpush('vh:feed', JSON.stringify(item))
  await r.ltrim('vh:feed', 0, 199)
}
export async function getFeed(limit = 30): Promise<FeedItem[]> {
  const r = getRedis(); if (!r) return []
  const raw = (await r.lrange('vh:feed', 0, limit - 1)) as (string | FeedItem)[]
  return raw.map((x) => (typeof x === 'string' ? JSON.parse(x) : x)).filter(Boolean)
}

// ── Classements ──
const moisKey = () => new Date().toISOString().slice(0, 7)
export async function addPoints(user: CommunityUser, pts: number, villeSlug?: string) {
  const r = getRedis(); if (!r) return
  user.points += pts
  await r.set(`vh:u:${user.id}`, user)
  await r.zincrby('vh:lb:all', pts, user.pseudo)
  await r.zincrby(`vh:lb:${moisKey()}`, pts, user.pseudo)
  if (villeSlug) await r.zincrby(`vh:lb:ville:${villeSlug}`, pts, user.pseudo)
}
export async function topContributeurs(scope: 'all' | 'mois' | `ville:${string}`, limit = 10): Promise<{ pseudo: string; points: number }[]> {
  const r = getRedis(); if (!r) return []
  const key = scope === 'all' ? 'vh:lb:all' : scope === 'mois' ? `vh:lb:${moisKey()}` : `vh:lb:${scope}`
  const raw = (await r.zrange(key, 0, limit - 1, { rev: true, withScores: true })) as (string | number)[]
  const out: { pseudo: string; points: number }[] = []
  for (let i = 0; i < raw.length; i += 2) out.push({ pseudo: String(raw[i]), points: Number(raw[i + 1]) })
  return out
}

// ── Badges : recalcul après contribution ──
export async function checkBadges(user: CommunityUser, spot?: PrayerSpot): Promise<string[]> {
  const r = getRedis(); if (!r) return []
  const nouveaux: string[] = []
  const give = (b: string) => { if (!user.badges.includes(b)) { user.badges.push(b); nouveaux.push(b) } }
  if (user.nbSpots >= 1) give('premier-spot')
  if (user.nbSpots >= 10) give('10-spots')
  if (user.nbConfirmations >= 25) give('confirmateur')
  if (spot) {
    const catCount = Number(await r.incrby(`vh:u:${user.id}:cat:${spot.categorie}`, 1))
    if (spot.categorie === 'coin_priere' && catCount >= 5) give('sauveur-priere')
    if (spot.categorie === 'pepite' && catCount >= 3) give('decouvreur')
    const villeCount = Number(await r.incrby(`vh:u:${user.id}:ville:${spot.villeSlug}`, 1))
    if (villeCount >= 10) give(`ambassadeur:${spot.villeSlug}:${spot.villeNom}`)
  }
  if (nouveaux.length) await r.set(`vh:u:${user.id}`, user)
  return nouveaux
}


// Lecture directe d'un spot par id (les helpers existants lisent par ville+slug)
export async function getSpotById(spotId: string): Promise<PrayerSpot | null> {
  const r = getRedis(); if (!r) return null
  if (!/^[a-z0-9_-]+$/i.test(spotId)) return null
  return ((await r.get(`vh:spot:${spotId}`)) as PrayerSpot | null) ?? null
}

// ── Confirmations & signalements (BLOC 3/7) ──
export async function confirmSpot(spotId: string, user: CommunityUser): Promise<{ ok: boolean; confirmations?: number; deja?: boolean }> {
  const r = getRedis(); if (!r) return { ok: false }
  const spot = await getSpotById(spotId)
  if (!spot) return { ok: false }
  const added = await r.sadd(`vh:spot:${spotId}:confirmers`, user.id)
  if (!added) return { ok: true, deja: true, confirmations: spot.confirmations }
  spot.confirmations = (spot.confirmations ?? 0) + 1
  await r.set(`vh:spot:${spotId}`, spot)
  user.nbConfirmations += 1
  await addPoints(user, POINTS.confirmDonnee, spot.villeSlug)
  await checkBadges(user)
  // points + impact pour l'AUTEUR du spot
  if (spot.auteurId && spot.auteurId !== user.id) {
    const auteur = await getUserById(spot.auteurId)
    if (auteur) { await addPoints(auteur, POINTS.confirmRecue, spot.villeSlug); await addImpact(spot.auteurId, 1) }
  }
  await pushFeed({ type: 'confirm', pseudo: user.pseudo, spotId, spotNom: spot.nom, spotSlug: spot.slug, villeSlug: spot.villeSlug, villeNom: spot.villeNom, categorie: spot.categorie ?? 'coin_priere', date: new Date().toISOString() })
  return { ok: true, confirmations: spot.confirmations }
}

export async function reportSpot(spotId: string, userId: string): Promise<{ ok: boolean; hidden?: boolean }> {
  const r = getRedis(); if (!r) return { ok: false }
  const spot = await getSpotById(spotId)
  if (!spot) return { ok: false }
  await r.sadd(`vh:spot:${spotId}:reports`, userId)
  const n = Number(await r.scard(`vh:spot:${spotId}:reports`))
  if (n >= 3 && spot.status !== 'hidden') {
    spot.status = 'hidden'
    await r.set(`vh:spot:${spotId}`, spot)
    return { ok: true, hidden: true }
  }
  return { ok: true }
}

// ── Création d'un spot communautaire (BLOC 2) ──
export async function createCommunitySpot(
  user: CommunityUser,
  input: { categorie: string; nom: string; lat: number; lng: number; note?: string; photo?: string; villeSlug?: string; villeNom?: string; typeLieu?: string },
): Promise<{ spot: PrayerSpot; pointsGagnes: number; nouveauxBadges: string[] } | null> {
  const spot = await saveSpotRaw({
    nom: input.nom.slice(0, 80),
    typeLieu: (input.typeLieu as PrayerSpot['typeLieu']) ?? 'autre',
    villeSlug: input.villeSlug ?? '', villeNom: input.villeNom ?? '',
    lat: input.lat, lng: input.lng,
    description: input.note?.slice(0, 200),
    photo: input.photo?.slice(0, 300),
    source: 'community',
  } as Parameters<typeof saveSpotRaw>[0])
  if (!spot) return null
  const r = getRedis()!
  spot.categorie = (input.categorie as PrayerSpot['categorie']) ?? 'autre'
  spot.auteurId = user.id
  spot.auteurPseudo = user.pseudo
  await r.set(`vh:spot:${spot.id}`, spot)
  user.nbSpots += 1
  await addPoints(user, POINTS.spot, spot.villeSlug)
  const nouveauxBadges = await checkBadges(user, spot)
  await pushFeed({ type: 'spot', pseudo: user.pseudo, spotId: spot.id, spotNom: spot.nom, spotSlug: spot.slug, villeSlug: spot.villeSlug, villeNom: spot.villeNom, categorie: spot.categorie ?? 'autre', date: new Date().toISOString() })
  return { spot, pointsGagnes: POINTS.spot, nouveauxBadges }
}
