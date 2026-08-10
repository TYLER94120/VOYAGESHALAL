'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'

// Position INSTANTANÉE partagée par tous les outils géolocalisés
// (horaires, qibla, mosquée proche, autour de moi). Principe « Muslim Pro » :
// un résultat utile s'affiche tout de suite, le GPS ne bloque JAMAIS.
//
// Ordre de résolution (du plus rapide) :
//   1. dernière position utilisée (localStorage, partagée entre les outils)
//   2. ville mémorisée du site (LocationProvider)
//   3. Paris par défaut — affiché immédiatement
//   4. géoloc IP (/api/geoip) en arrière-plan → transition douce
//   5. GPS en arrière-plan UNIQUEMENT si la permission est déjà accordée
// + refineGps() : affinage GPS à la demande (bouton), avec états d'erreur.

export type PosSource = 'last' | 'city' | 'default' | 'ip' | 'gps' | 'manual'

export interface InstantPos {
  lat: number
  lng: number
  label: string
  pays?: string
}

const LAST_KEY = 'vh_last_pos'
const LEGACY_KEYS = ['vh_prayer_last_pos']
export const DEFAULT_POS: InstantPos = { lat: 48.8566, lng: 2.3522, label: 'Paris', pays: 'France' }

// ─── UNE SEULE POSITION POUR TOUTE LA PAGE ───────────────────────────────
// Constaté sur une capture (page Qibla) : le bandeau du haut affichait
// « 📍 Ma position » (GPS obtenu) pendant que la carte Qibla juste en dessous
// affichait « ⚠️ Position approximative (Rabat) ». Même écran, deux réponses.
//
// La cause : chaque composant qui appelle ce hook mène sa propre enquête
// (mémoire, IP, GPS) et arrive au but à des moments différents. Aucun ne
// prévient les autres. C'est le même défaut que les deux horaires de prière.
//
// La correction : les instances se parlent. Dès qu'une trouve mieux, elle le
// diffuse ; les autres s'alignent — jamais l'inverse, une position moins sûre
// n'écrase jamais une position plus sûre.

/** Du moins fiable au plus fiable. Une diffusion n'est acceptée que si elle
 *  vaut au moins ce qu'on affiche déjà. */
const RANG: Record<PosSource, number> = { default: 0, last: 1, city: 2, ip: 3, gps: 4, manual: 5 }

let partagee: { pos: InstantPos; source: PosSource } | null = null
const abonnes = new Set<(v: { pos: InstantPos; source: PosSource }) => void>()

function diffuser(pos: InstantPos, source: PosSource) {
  if (partagee && RANG[source] < RANG[partagee.source]) return
  partagee = { pos, source }
  abonnes.forEach((f) => f({ pos, source }))
}

export function useInstantPosition(en = false) {
  const { city } = useLocation()
  const [pos, setPosState] = useState<InstantPos | null>(null)
  const [source, setSource] = useState<PosSource>('default')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const resolved = useRef(false)
  const rangCourant = useRef<PosSource>('default')

  const setPos = useCallback((p: InstantPos, s: PosSource) => {
    // Un autre outil de la page a peut-être déjà trouvé mieux (le GPS pendant
    // qu'on partait sur la ville mémorisée) : on ne redescend pas.
    if (RANG[s] < RANG[rangCourant.current]) return
    rangCourant.current = s
    setPosState(p); setSource(s)
    if (s !== 'default') {
      try { localStorage.setItem(LAST_KEY, JSON.stringify(p)) } catch { /* stockage privé */ }
    }
    diffuser(p, s)
  }, [])

  // On écoute ce que trouvent les autres outils de la page, et on ne descend
  // jamais en fiabilité (le GPS ne se fait pas écraser par une position IP).
  useEffect(() => {
    const surMieux = (v: { pos: InstantPos; source: PosSource }) => {
      if (RANG[v.source] < RANG[rangCourant.current]) return
      rangCourant.current = v.source
      setPosState(v.pos)
      setSource(v.source)
    }
    abonnes.add(surMieux)
    if (partagee) surMieux(partagee)
    return () => { abonnes.delete(surMieux) }
  }, [])

  useEffect(() => {
    if (resolved.current) return
    resolved.current = true

    let initial: InstantPos | null = null
    let s: PosSource = 'default'

    // 0) Lieu explicitement demandé dans l'URL (?lat&lng&lieu) — c'est le cas
    // quand on arrive depuis une fiche ville : on connaît déjà la ville, il
    // serait absurde de redemander la géolocalisation. Ce choix prime sur
    // tout le reste, et rien (ni IP ni GPS) ne vient l'écraser ensuite.
    try {
      const q = new URLSearchParams(window.location.search)
      const lat = parseFloat(q.get('lat') || ''), lng = parseFloat(q.get('lng') || '')
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setPos({ lat, lng, label: q.get('lieu') || (en ? 'Selected city' : 'Ville choisie') }, 'manual')
        return
      }
    } catch { /* noop */ }

    // 1) Dernière position (clé partagée, avec reprise des anciennes clés)
    try {
      for (const k of [LAST_KEY, ...LEGACY_KEYS]) {
        const saved = JSON.parse(localStorage.getItem(k) || 'null')
        if (saved && typeof saved.lat === 'number' && typeof saved.lng === 'number') {
          initial = { lat: saved.lat, lng: saved.lng, label: saved.label || (en ? 'Last position' : 'Dernière position'), pays: saved.pays }
          s = 'last'
          break
        }
      }
    } catch { /* noop */ }
    // 2) Ville mémorisée du site
    if (!initial && city && city.lat != null && city.lng != null) {
      initial = { lat: city.lat, lng: city.lng, label: city.nom, pays: city.pays }
      s = 'city'
    }
    // 3) Défaut immédiat — l'outil affiche un résultat TOUT DE SUITE
    if (!initial) { initial = DEFAULT_POS; s = 'default' }
    setPos(initial, s)

    // 4) Géoloc IP en arrière-plan — écrase le défaut, ET une position
    // mémorisée devenue périmée (> 100 km = l'utilisateur a voyagé :
    // il atterrit à Berkane, sa dernière position était Paris → on bascule)
    {
      const base = initial
      fetch('/api/geoip')
        .then((r) => r.json())
        .then((j) => {
          if (!(j?.ok && typeof j.lat === 'number')) return
          const p = Math.PI / 180
          const a = Math.sin(((j.lat - base.lat) * p) / 2) ** 2 + Math.cos(base.lat * p) * Math.cos(j.lat * p) * Math.sin(((j.lng - base.lng) * p) / 2) ** 2
          const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          if (s === 'default' || distKm > 100) {
            setPos({ lat: j.lat, lng: j.lng, label: j.city || (en ? 'Around you' : 'Autour de vous') }, 'ip')
          }
        })
        .catch(() => { /* on garde la position courante */ })
    }

    // 5) GPS silencieux si (et seulement si) la permission est déjà accordée
    try {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((st) => {
        if (st.state === 'granted') {
          getPosition().then(({ lat, lng }) => {
            setPos({ lat, lng, label: en ? 'My position' : 'Ma position' }, 'gps')
          }).catch(() => { /* silencieux */ })
        }
      }).catch(() => { /* Safari sans permissions API */ })
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Affinage GPS à la demande (bouton « Ma position exacte ») — 8-12 s max
  const refineGps = useCallback(async () => {
    setGeoLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      setPos({ lat, lng, label: en ? 'My exact location' : 'Ma position exacte' }, 'gps')
      return true
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
      return false
    } finally {
      setGeoLoading(false)
    }
  }, [en, setPos])

  const setManual = useCallback((p: InstantPos) => setPos(p, 'manual'), [setPos])

  return { pos, source, geoLoading, geoErr, refineGps, setManual }
}
