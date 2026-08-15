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
const abonnes = new Set<(v: { pos: InstantPos; source: PosSource; forcer?: boolean }) => void>()

// ─── OÙ L'ON EST VRAIMENT, MÊME QUAND ON AFFICHE AUTRE CHOSE ──────────────
// Mohamed a choisi une ville à la main ; l'accueil est resté dessus alors
// qu'il était à Berkane, sans jamais proposer de revenir. Un choix manuel
// doit primer — sinon il ne servirait à rien — mais le site ne doit pas
// faire SEMBLANT de ne pas savoir : quand la ville affichée et l'endroit
// détecté sont à des centaines de kilomètres, il faut poser la question.
//
// On garde donc de côté ce que l'IP ou le GPS ont trouvé, même quand ça ne
// remplace rien. C'est ce qui permet d'écrire « on te situe à Berkane »
// plutôt qu'un vague « me relocaliser ».
let detecteePartagee: InstantPos | null = null
const abonnesDetectee = new Set<(p: InstantPos) => void>()

function noterDetectee(p: InstantPos) {
  detecteePartagee = p
  abonnesDetectee.forEach((f) => f(p))
  // « On te situe à Ma position » ne veut rien dire : c'est la méthode, pas
  // le lieu. Même correction que pour la position affichée — on va chercher
  // le nom, puis on rediffuse. La question devient « on te situe à Berkane ».
  if (LIBELLES_SANS_LIEU.has(p.label)) {
    void nommerLeLieu(p.lat, p.lng).then((nom) => {
      if (!nom) return
      const nomme = { ...p, label: nom }
      detecteePartagee = nomme
      abonnesDetectee.forEach((f) => f(nomme))
    })
  }
}

/** Distance approximative en kilomètres. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = Math.PI / 180
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lng - a.lng) * r) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function diffuser(pos: InstantPos, source: PosSource, forcer = false) {
  if (!forcer && partagee && RANG[source] < RANG[partagee.source]) return
  partagee = { pos, source }
  abonnes.forEach((f) => f({ pos, source, forcer }))
}

// ─── NOMMER LE LIEU, PAS LA MÉTHODE ──────────────────────────────────────
// « Ma position » n'est pas une réponse : ça ne dit pas OÙ. L'utilisateur ne
// peut donc pas vérifier que sa position a été prise en compte, et il se
// demande s'il doit réappuyer. Dès que le GPS répond, on va chercher le nom
// du lieu (notre propre liste de villes d'abord) et on remplace le libellé.
// Le résultat se diffuse à toute la page par le mécanisme ci-dessus.
const nomsConnus = new Map<string, string>()

/** Libellés qui décrivent la MÉTHODE et non le LIEU : ceux-là, on les remplace. */
const LIBELLES_SANS_LIEU = new Set([
  'Ma position', 'Ma position exacte', 'My position', 'My exact location',
  'Autour de vous', 'Around you', 'Dernière position', 'Last position',
])

async function nommerLeLieu(lat: number, lng: number): Promise<string | null> {
  const cle = `${lat.toFixed(2)},${lng.toFixed(2)}`
  if (nomsConnus.has(cle)) return nomsConnus.get(cle)!
  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 4000)
    const r = await fetch(`/api/reverse?lat=${lat}&lng=${lng}`, { signal: ac.signal })
    clearTimeout(t)
    if (!r.ok) return null
    const j = await r.json()
    // On n'adopte le nom que s'il désigne VRAIMENT l'endroit : Google ou
    // OpenStreetMap donnent la commune. `source: 'ville'` veut dire « notre
    // ville la plus proche, à N km » — écrire « Paris » à quelqu'un qui est
    // à Fontenay-sous-Bois serait exactement le mensonge qu'on corrige.
    if (typeof j?.nom === 'string' && j.nom && (j.source === 'google' || j.source === 'nominatim')) {
      nomsConnus.set(cle, j.nom); return j.nom
    }
  } catch { /* on garde le libellé actuel */ }
  return null
}

export function useInstantPosition(en = false) {
  const { city } = useLocation()
  const [pos, setPosState] = useState<InstantPos | null>(null)
  const [source, setSource] = useState<PosSource>('default')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  /** Où l'appareil se croit, indépendamment de ce qu'on affiche. */
  const [detectee, setDetectee] = useState<InstantPos | null>(null)
  const resolved = useRef(false)
  const rangCourant = useRef<PosSource>('default')

  const setPos = useCallback((p: InstantPos, s: PosSource, forcer = false) => {
    // Un autre outil de la page a peut-être déjà trouvé mieux (le GPS pendant
    // qu'on partait sur la ville mémorisée) : on ne redescend pas.
    // `forcer` sert au seul cas où l'utilisateur DEMANDE explicitement de
    // quitter sa ville choisie (« Passer à Berkane ») : là, sa décision passe
    // avant tout classement de fiabilité.
    if (!forcer && RANG[s] < RANG[rangCourant.current]) return
    rangCourant.current = s
    setPosState(p); setSource(s)
    if (s !== 'default') {
      try { localStorage.setItem(LAST_KEY, JSON.stringify(p)) } catch { /* stockage privé */ }
    }
    diffuser(p, s, forcer)

    // Le GPS donne des coordonnées, pas un nom. On va chercher le nom, et on
    // rediffuse — l'écran passe de « Ma position » à « Rabat » tout seul.
    if (s === 'gps' && LIBELLES_SANS_LIEU.has(p.label)) {
      void nommerLeLieu(p.lat, p.lng).then((nom) => { if (nom) setPos({ ...p, label: nom }, s) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // On écoute ce que trouvent les autres outils de la page, et on ne descend
  // jamais en fiabilité (le GPS ne se fait pas écraser par une position IP).
  useEffect(() => {
    const surMieux = (v: { pos: InstantPos; source: PosSource; forcer?: boolean }) => {
      if (!v.forcer && RANG[v.source] < RANG[rangCourant.current]) return
      rangCourant.current = v.source
      setPosState(v.pos)
      setSource(v.source)
    }
    abonnes.add(surMieux)
    if (partagee) surMieux(partagee)
    const surDetectee = (p: InstantPos) => setDetectee(p)
    abonnesDetectee.add(surDetectee)
    if (detecteePartagee) surDetectee(detecteePartagee)
    return () => { abonnes.delete(surMieux); abonnesDetectee.delete(surDetectee) }
  }, [])

  useEffect(() => {
    if (resolved.current) return
    resolved.current = true

    let initial: InstantPos | null = null
    let s: PosSource = 'default'

    let choixExplicite = false

    // 0) Lieu explicitement demandé dans l'URL (?lat&lng&lieu) — on arrive
    // d'une fiche ville : le choix prime, et rien ne vient l'écraser.
    //
    // ⚠️ MAIS ON CONTINUE À REGARDER OÙ L'ON EST.
    // Avant, on sortait ici : le site cessait toute détection, donc il ne
    // pouvait plus savoir qu'on était ailleurs — c'est exactement ce que
    // Mohamed a constaté (ville choisie, lui à Berkane, et jamais la moindre
    // proposition de revenir). La détection continue en silence ; elle
    // n'écrase rien, elle sert uniquement à pouvoir POSER LA QUESTION.
    try {
      const q = new URLSearchParams(window.location.search)
      const lat = parseFloat(q.get('lat') || ''), lng = parseFloat(q.get('lng') || '')
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        initial = { lat, lng, label: q.get('lieu') || (en ? 'Selected city' : 'Ville choisie') }
        s = 'manual'
        choixExplicite = true
      }
    } catch { /* noop */ }

    // 1) Dernière position (clé partagée, avec reprise des anciennes clés)
    if (!choixExplicite) try {
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
    if (!choixExplicite && !initial && city && city.lat != null && city.lng != null) {
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
          const trouvee: InstantPos = { lat: j.lat, lng: j.lng, label: j.city || (en ? 'Around you' : 'Autour de vous') }
          // Notée dans tous les cas : c'est elle qui permettra de demander
          // « tu n'es plus à Marrakech ? » sans avoir à deviner.
          noterDetectee(trouvee)
          // Un choix explicite ne se fait JAMAIS écraser — on se contente de
          // l'avoir noté ci-dessus pour pouvoir demander.
          if (!choixExplicite && (s === 'default' || distanceKm(base, trouvee) > 100)) setPos(trouvee, 'ip')
        })
        .catch(() => { /* on garde la position courante */ })
    }

    // ════════ 5) ON DEMANDE LA POSITION AU NAVIGATEUR. FRANCHEMENT. ════════
    //
    // 🔴 LE DÉFAUT LE PLUS GRAVE QUE CE SITE AIT EU (Mohamed, 15 août) :
    // « Je suis à Fontenay-sous-Bois. Le site affiche Naaldwijk et la carte
    // me montre La Haye, aux Pays-Bas. » Quatre cents kilomètres.
    //
    // LA CAUSE ÉTAIT ICI. Ce bloc n'appelait le navigateur QUE si la
    // permission était DÉJÀ accordée. À la première visite elle ne l'est
    // jamais — donc on ne demandait rien, et on se rabattait sur l'adresse
    // internet, qui donne le datacenter de l'opérateur. Le site attendait
    // une permission qu'il ne demandait pas.
    //
    // Ce n'est pas un défaut d'affichage : une position fausse rend faux
    // l'horaire de la prière, la direction de la Qibla, toutes les
    // distances et la mosquée « la plus proche ». Un musulman qui s'y fie
    // prie à la mauvaise heure.
    //
    // Désormais : accordée → on prend, sans bruit. Pas encore répondu → ON
    // DEMANDE, en haute précision (le GPS sur téléphone, le Wi-Fi sur
    // ordinateur : la rue, pas le pays). Refusée → on n'insiste pas, et
    // l'écran DIT que la position est approximative.
    try {
      const demander = () => {
        getPosition({ highAccuracy: true })
          .then(({ lat, lng }) => {
            const p: InstantPos = { lat, lng, label: en ? 'My position' : 'Ma position' }
            noterDetectee(p)
            // Règle de Mohamed : « si la position par adresse internet est à
            // plus de 50 km de celle que le navigateur finit par donner,
            // c'est le navigateur qui gagne, toujours. » Le classement de
            // fiabilité (gps > ip) le garantit déjà ; `forcer` couvre le cas
            // d'une ville choisie à la main devenue absurde.
            if (!choixExplicite) setPos(p, 'gps')
          })
          .catch(() => { /* refus ou délai : l'écran le dira, on n'insiste pas */ })
      }
      const perm = navigator.permissions?.query({ name: 'geolocation' as PermissionName })
      if (perm) {
        perm.then((st) => {
          if (st.state === 'granted' || st.state === 'prompt') demander()
          // 'denied' : on ne redemande pas tout seul — c'est le bouton qui
          // sert à ça, et harceler quelqu'un qui a dit non est le meilleur
          // moyen qu'il ne revienne jamais.
        }).catch(() => demander())
      } else {
        // Safari sans l'API des permissions : on demande directement.
        demander()
      }
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Affinage GPS à la demande (bouton « Ma position exacte ») — 8-12 s max
  const refineGps = useCallback(async () => {
    setGeoLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      const p: InstantPos = { lat, lng, label: en ? 'My exact location' : 'Ma position exacte' }
      noterDetectee(p)
      setPos(p, 'gps')
      return true
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
      return false
    } finally {
      setGeoLoading(false)
    }
  }, [en, setPos])

  const setManual = useCallback((p: InstantPos) => setPos(p, 'manual'), [setPos])

  /** Adopter l'endroit détecté sans repasser par le GPS (il est déjà connu). */
  const adopterDetectee = useCallback(() => {
    // `forcer` : sans lui, le choix manuel (rang le plus haut) refusait la
    // bascule, la question disparaissait de l'écran mais le bandeau du haut
    // continuait d'afficher l'ancienne ville. Constaté au test.
    if (detectee) setPos(detectee, 'gps', true)
  }, [detectee, setPos])

  return { pos, source, geoLoading, geoErr, refineGps, setManual, detectee, adopterDetectee }
}
