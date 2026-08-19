import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'

// 🕌 LA BASE LOCALE DES LIEUX DE PRIÈRE (source OpenStreetMap, ODbL).
//
// Chargée UNE fois par processus depuis data/osm/mosquees/*.json, indexée
// sur une grille de 0,1° : « les plus proches de ce point » répond en
// millisecondes, sans réseau, sans clé, sans quota. C'est la couche de
// DÉCOUVERTE du moteur — Google ne sert plus qu'à enrichir les fiches
// réellement affichées.
//
// ⚠️ Obligation ODbL : partout où ces données apparaissent, le crédit
// « © les contributeurs OpenStreetMap » doit être visible.

export interface LieuPriereOsm {
  id: string // n/w/r + id OSM
  lat: number
  lng: number
  pays: string
  nom?: string
  nomAr?: string
  ville?: string
  horaires?: string
  acces?: string
  type?: string // mosque / prayer_room / … — on ne promet jamais plus
}

interface Base {
  lieux: LieuPriereOsm[]
  grille: Map<string, number[]> // "lat10,lng10" → indices dans lieux
  parPays: Record<string, number>
  parVille: Record<string, number>
}

let base: Base | null | undefined

function cellule(lat: number, lng: number): string {
  return `${Math.floor(lat * 10)},${Math.floor(lng * 10)}`
}

function charger(): Base | null {
  if (base !== undefined) return base
  try {
    const dossier = path.join(process.cwd(), 'data', 'osm', 'mosquees')
    if (!existsSync(dossier)) { base = null; return base }
    const lieux: LieuPriereOsm[] = []
    for (const f of readdirSync(dossier)) {
      if (!f.endsWith('.json')) continue
      const j = JSON.parse(readFileSync(path.join(dossier, f), 'utf8')) as { lieux?: LieuPriereOsm[] }
      for (const l of j.lieux ?? []) lieux.push(l)
    }
    if (!lieux.length) { base = null; return base }
    const grille = new Map<string, number[]>()
    lieux.forEach((l, i) => {
      const c = cellule(l.lat, l.lng)
      const t = grille.get(c)
      if (t) t.push(i); else grille.set(c, [i])
    })
    let compteurs: { parPays?: Record<string, number>; parVille?: Record<string, number> } = {}
    try { compteurs = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'osm', 'compteurs.json'), 'utf8')) } catch { /* pas encore calculés */ }
    base = { lieux, grille, parPays: compteurs.parPays ?? {}, parVille: compteurs.parVille ?? {} }
    console.info(`[mosquees-osm] base chargée : ${lieux.length} lieux, ${grille.size} cellules`)
  } catch (e) {
    console.error('[mosquees-osm] base illisible :', e instanceof Error ? e.message : e)
    base = null
  }
  return base
}

const distM = (aLat: number, aLng: number, bLat: number, bLng: number): number => {
  const dx = (bLng - aLng) * Math.cos(((aLat + bLat) / 2 * Math.PI) / 180) * 111320
  const dy = (bLat - aLat) * 110570
  return Math.sqrt(dx * dx + dy * dy)
}

/** Vrai si la base couvre le PAYS de ce point (au moins une cellule à
 *  moins de ~50 km) : si non, elle est muette ici et Google prend le
 *  relais normalement. */
export function baseCouvre(lat: number, lng: number): boolean {
  const b = charger()
  if (!b) return false
  for (let dLat = -5; dLat <= 5; dLat++) {
    for (let dLng = -5; dLng <= 5; dLng++) {
      if (b.grille.has(`${Math.floor(lat * 10) + dLat},${Math.floor(lng * 10) + dLng}`)) return true
    }
  }
  return false
}

/** Les lieux de prière les plus proches d'un point, dans un rayon donné —
 *  triés par distance, avec la distance en mètres déjà posée. */
export function prochesOsm(lat: number, lng: number, rayonM: number, limite = 30): (LieuPriereOsm & { distanceM: number })[] {
  const b = charger()
  if (!b) return []
  const pas = Math.max(1, Math.ceil(rayonM / 11000)) // 0,1° ≈ 11 km
  const trouves: (LieuPriereOsm & { distanceM: number })[] = []
  for (let dLat = -pas; dLat <= pas; dLat++) {
    for (let dLng = -pas; dLng <= pas; dLng++) {
      const ids = b.grille.get(`${Math.floor(lat * 10) + dLat},${Math.floor(lng * 10) + dLng}`)
      if (!ids) continue
      for (const i of ids) {
        const l = b.lieux[i]
        const d = distM(lat, lng, l.lat, l.lng)
        if (d <= rayonM) trouves.push({ ...l, distanceM: Math.round(d) })
      }
    }
  }
  return trouves.sort((a, b2) => a.distanceM - b2.distanceM).slice(0, limite)
}

/** « X lieux de prière à Istanbul » — le compteur précalculé d'une ville
 *  du guide (rayon 15 km autour du centre), ou null si la base ne couvre
 *  pas encore ce pays. */
export function compteurVille(slug: string): number | null {
  const b = charger()
  return b?.parVille[slug] ?? null
}

/** Le total d'un pays (code ISO), ou null. */
export function compteurPays(cc: string): number | null {
  const b = charger()
  return b?.parPays[cc.toUpperCase()] ?? null
}
