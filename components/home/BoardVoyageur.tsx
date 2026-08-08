'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { ENVIES, envieById, niveauHalal } from '@/lib/envies'

// 🎛️ BOARD VOYAGEUR (bento) — l'accueil devient un tableau de bord contextuel :
// des REPONSES deja calculees, jamais des menus. Il absorbe le Radar Priere
// (meme calcul local, memes couleurs de statut, meme honnetete « signale halal
// · a verifier ») et ajoute : la pepite du moment (meilleur spot communautaire
// avec media), le resto le plus proche, le compteur de spots autour, la bande
// de reels de la ville. Rendu 100 % client : le HTML indexe par Google (hero,
// sections serveur) ne change pas — SEO intact. Sans position : rien (repli =
// accueil classique).

interface Lieu { nom: string; lat: number; lng: number; source: 'osm' | 'communaute' | 'annuaire'; distM: number; spotId?: string; cuisine?: string; force?: number; halal?: string; mapsUrl?: string; avis?: number; id?: string }
interface FeedSpot {
  id: string; nom: string; villeNom: string; villeSlug: string; categorie?: string
  lat?: number; lng?: number; photos?: string[]; video?: string; villeImage?: string
  confirmations?: number; utiles?: number
}

function hav(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, p = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * p) / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(((lng2 - lng1) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? String(m % 60).padStart(2, '0') : ''}`.trim() : `${m} min`)
const walk = (distM: number) => Math.max(1, Math.round(distM / 80)) // ~4,8 km/h
const slugifyVille = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const lieuId = (lat: number, lng: number) => `a_${lat.toFixed(5)}_${lng.toFixed(5)}`
const itin = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

export interface BoardVedette { slug: string; nom: string; score: number; restaurants: number; mosquees: number; image: string | null }

export default function BoardVoyageur({ vedettes = [] }: { vedettes?: BoardVedette[] }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos, source, geoLoading, refineGps } = useInstantPosition(en)
  const [now, setNow] = useState(() => Date.now())
  const [mosquee, setMosquee] = useState<Lieu | null | undefined>(undefined)
  const [resto, setResto] = useState<Lieu | null | undefined>(undefined)
  const [spots, setSpots] = useState<FeedSpot[] | null>(null)
  // La recherche OSM a-t-elle abouti ? Sans elle on ne peut PAS affirmer
  // « aucun lieu connu » — on dit qu'on n'a pas pu chercher (honnetete).
  const [osmOk, setOsmOk] = useState(true)
  // Guide de la ville OU L'ON EST (compteurs reels), pour proposer mieux
  // qu'une vedette generique quand il n'y a pas encore de pepite autour.
  const [villeGuide, setVilleGuide] = useState<BoardVedette | null>(null)
  // Ville la plus proche selon l'annuaire : fiable meme quand le GPS ne
  // donne pas de nom (« Ma position ») ou quand le libelle est inconnu.
  const [villeProche, setVilleProche] = useState<string | null>(null)
  // 🍔 « J'ai envie de… » : l'envie du moment et le lieu correspondant le
  // plus proche (undefined = pas encore cherche, null = rien trouve).
  const [envie, setEnvie] = useState<string | null>(null)
  const [restoEnvie, setRestoEnvie] = useState<Lieu | null | undefined>(undefined)
  // Deux facons de choisir, demandees par les voyageurs : le plus PROCHE
  // (« je ne veux pas me prendre la tete ») ou le MEILLEUR compromis.
  const [mode, setMode] = useState<'proche' | 'meilleur'>('proche')
  const [avisEnvoye, setAvisEnvoye] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Fenetre de priere (identique au Radar : calcul local, zero reseau) ──
  const fenetre = useMemo(() => {
    if (!pos) return null
    try {
      const today = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now))
      const tomorrow = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now + 86_400_000))
      const seq: { key: string; start: Date; end: Date }[] = [
        { key: 'Fajr', start: today.Fajr, end: today.Sunrise },
        { key: 'Dhuhr', start: today.Dhuhr, end: today.Asr },
        { key: 'Asr', start: today.Asr, end: today.Maghrib },
        { key: 'Maghrib', start: today.Maghrib, end: today.Isha },
        { key: 'Isha', start: today.Isha, end: tomorrow.Fajr },
      ]
      const cur = seq.find((s) => now >= s.start.getTime() && now < s.end.getTime())
      const fallback = { key: 'Fajr', start: tomorrow.Fajr, end: tomorrow.Sunrise }
      const nextIdx = seq.findIndex((s) => now < s.start.getTime())
      const next = nextIdx >= 0 ? seq[nextIdx] : fallback
      if (cur) return { ...cur, mode: 'current' as const, next }
      const after = nextIdx >= 0 ? (seq[nextIdx + 1] ?? fallback) : { key: 'Dhuhr', start: tomorrow.Dhuhr, end: tomorrow.Asr }
      return { ...next, mode: 'upcoming' as const, next: after }
    } catch { return null }
  }, [pos, now])

  // ── Mosquee + resto les plus proches (OSM Overpass + spots communaute) ──
  useEffect(() => {
    if (!pos) return
    let cancelled = false
    let osmDone = false
    const mc: Lieu[] = [], rc: Lieu[] = []
    const q = `[out:json][timeout:12];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng});node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng}););out center 40;`
    const p1 = fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(q)}` })
      .then((r) => r.json())
      .then((d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const el of (d.elements as any[]) ?? []) {
          const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
          if (!la || !lo || !el.tags?.name) continue
          const lieu: Lieu = { nom: el.tags.name, lat: la, lng: lo, source: 'osm', distM: hav(pos.lat, pos.lng, la, lo) }
          if (el.tags.amenity === 'place_of_worship') mc.push(lieu)
          else rc.push(lieu)
        }
        osmDone = true
      }).catch(() => {})
    const p2 = fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=5`)
      .then((r) => r.json())
      .then((j) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const s of (j.spots as any[]) ?? []) {
          if (!s.lat || !s.lng) continue
          const lieu: Lieu = { nom: s.nom, lat: s.lat, lng: s.lng, source: 'communaute', distM: hav(pos.lat, pos.lng, s.lat, s.lng), spotId: s.id }
          if (!s.categorie || s.categorie === 'coin_priere') mc.push(lieu)
          else if (s.categorie === 'resto') rc.push(lieu)
        }
      }).catch(() => {})
    // 3e source : NOTRE annuaire (lieux deja documentes dans les fiches
    // villes). Il rend la tuile « ou prier » fiable meme si Overpass est
    // lent ou indisponible. Etiquete « referencé · à vérifier » : ce sont
    // des donnees OpenStreetMap, pas des temoignages ni des verifications.
    const p3 = fetch(`/api/annuaire?lat=${pos.lat}&lng=${pos.lng}&rayon=8&limit=40`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ville?.slug) setVilleProche(j.ville.slug as string)
        for (const l of (j.lieux as { nom: string; lat: number; lng: number; type: string }[]) ?? []) {
          const lieu: Lieu = { nom: l.nom, lat: l.lat, lng: l.lng, source: 'annuaire', distM: hav(pos.lat, pos.lng, l.lat, l.lng) }
          if (l.type === 'priere') mc.push(lieu)
          else if (l.type === 'resto') rc.push(lieu)
        }
      }).catch(() => {})

    Promise.allSettled([p1, p2, p3]).then(() => {
      if (cancelled) return
      const dedupe = (arr: Lieu[]) => {
        const vus = new Set<string>()
        return arr.filter((l) => {
          const k = `${l.nom.toLowerCase()}|${l.lat.toFixed(3)}|${l.lng.toFixed(3)}`
          if (vus.has(k)) return false
          vus.add(k); return true
        })
      }
      // La tuile annonce « X min a pied » : c'est donc la DISTANCE qui
      // classe. A distance egale, un spot vecu par un voyageur passe devant.
      const rang = (l: Lieu) => (l.source === 'communaute' ? 0 : 1)
      const parDistance = (a: Lieu, b: Lieu) => a.distM - b.distM || rang(a) - rang(b)
      mc.splice(0, mc.length, ...dedupe(mc).sort(parDistance))
      rc.splice(0, rc.length, ...dedupe(rc).sort(parDistance))
      setOsmOk(osmDone || mc.length > 0 || rc.length > 0)
      setMosquee(mc[0] ?? null); setResto(rc[0] ?? null)
    })
    return () => { cancelled = true }
  }, [pos])

  useEffect(() => {
    const slug = villeProche || (pos ? slugifyVille(pos.label) : '')
    if (!slug || slug.length < 3) { setVilleGuide(null); return }
    let off = false
    fetch(`/api/ville-counts?slug=${encodeURIComponent(slug)}${en ? '&en=1' : ''}`)
      .then((r) => r.json())
      .then((j) => { if (!off) setVilleGuide(j.ville ?? null) })
      .catch(() => {})
    return () => { off = true }
  }, [pos?.label, villeProche, en]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!pos || !envie) { setRestoEnvie(undefined); return }
    let off = false
    setRestoEnvie(undefined); setAvisEnvoye(false)
    type Cand = { nom: string; lat: number; lng: number; cuisine?: string; force?: number; halal?: string }
    fetch(`/api/annuaire?lat=${pos.lat}&lng=${pos.lng}&rayon=12&type=resto&envie=${envie}&limit=25`)
      .then((r) => r.json())
      .then(async (j) => {
        if (off) return
        const cands = ((j.lieux as Cand[] | undefined) ?? []).map((l) => ({
          ...l, distM: hav(pos.lat, pos.lng, l.lat, l.lng), id: lieuId(l.lat, l.lng),
          // Un lieu etiquete « pizza, burger, italian, kebab, sandwich… » est
          // un generaliste : il ressortait pour TOUTES les envies. On compte
          // ses etiquettes pour lui preferer une adresse specialisee.
          nbTags: (l.cuisine ?? '').split(/[,;/]+/).filter(Boolean).length || 1,
        }))
        if (!cands.length) { setRestoEnvie(null); return }
        // Regle commune aux deux modes : on ne sert un « peut-etre » que si
        // AUCUNE correspondance sure n'existe dans le rayon. Sinon le meme
        // generaliste du coin sortait pour chaque envie.
        const surs = cands.filter((c) => c.force === 2)
        const pool = surs.length ? surs : cands
        // Avis communautaires (les notres — aucune note inventee)
        let avis: Record<string, number> = {}
        if (mode === 'meilleur') {
          try {
            const a = await fetch(`/api/avis?ids=${pool.slice(0, 20).map((c) => c.id).join(',')}`).then((r) => r.json())
            avis = (a.avis as Record<string, number>) ?? {}
          } catch { /* pas d'avis : on retombe sur les criteres objectifs */ }
        }
        const halalPoids = (h?: string) => (h === 'only' ? 2 : h === 'yes' || h === 'high' || h === 'certified' ? 1 : 0)
        const choisi = mode === 'proche'
          ? [...pool].sort((a, b) => a.distM - b.distM || a.nbTags - b.nbTags)[0]
          : [...pool].sort((a, b) => {
              const sc = (c: typeof a) =>
                Math.min(avis[c.id] ?? 0, 3) * 2   // nos avis, plafonnes
                + (c.force === 2 ? 3 : 0)          // le plat est bien celui-la
                + halalPoids(c.halal)              // niveau halal signale
                - (c.nbTags - 1) * 0.6             // penalise les generalistes
                - c.distM / 1500                   // et la distance
              return sc(b) - sc(a)
            })[0]
        setRestoEnvie({
          nom: choisi.nom, lat: choisi.lat, lng: choisi.lng, source: 'annuaire',
          distM: choisi.distM, cuisine: choisi.cuisine, force: choisi.force, halal: choisi.halal,
          avis: avis[choisi.id] ?? 0, id: choisi.id,
        })
      })
      .catch(() => { if (!off) setRestoEnvie(null) })
    return () => { off = true }
  }, [pos, envie, mode])

  // ── Spots communautaires (pepite + bande de reels + compteur) ──
  useEffect(() => {
    fetch('/api/community/spots?limit=30')
      .then((r) => r.json())
      .then((j) => setSpots((j.spots as FeedSpot[]) ?? []))
      .catch(() => setSpots([]))
  }, [])

  const pres = useMemo(() => {
    if (!pos || !spots) return null
    const withDist = spots
      .filter((s) => s.lat && s.lng)
      .map((s) => ({ ...s, distM: hav(pos.lat, pos.lng, s.lat!, s.lng!) }))
    const autour = withDist.filter((s) => s.distM < 30_000).sort((a, b) => a.distM - b.distM)
    const avecMedia = autour.filter((s) => (s.photos?.length || s.video))
    // La pepite : le spot avec media le plus confirme/utile pres de toi
    const pepite = [...avecMedia].sort((a, b) =>
      ((b.confirmations ?? 0) * 3 + (b.utiles ?? 0)) - ((a.confirmations ?? 0) * 3 + (a.utiles ?? 0)))[0]
      ?? avecMedia[0] ?? null
    // Bande de reels sans la pepite (deja en grande tuile) ; compteur : les
    // spots vraiment proches (<3 km), sinon ceux de la zone (honnete : on
    // change le libelle, pas le chiffre)
    const reels = avecMedia.filter((s) => s.id !== pepite?.id).slice(0, 10)
    const proches = autour.filter((s) => s.distM < 3000)
    const restoCom = autour.find((s) => s.categorie === 'resto' && s.distM < 5000) ?? null
    return { autour, reels, pepite, proches, restoCom, total: spots.length }
  }, [pos, spots])

  if (!pos || !fenetre) return null

  // ── Cadrans locaux supplementaires (zero reseau, zero invention) ──
  // Qibla : cap vers la Kaaba depuis la position
  const qibla = (() => {
    const p = Math.PI / 180, kLat = 21.4225 * p, kLng = 39.8262 * p
    const la = pos.lat * p, lo = pos.lng * p
    const y = Math.sin(kLng - lo)
    const x = Math.cos(la) * Math.tan(kLat) - Math.sin(la) * Math.cos(kLng - lo)
    const deg = Math.round(((Math.atan2(y, x) / p) + 360) % 360)
    const dirs = en
      ? ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
    return { deg, dir: dirs[Math.round(deg / 22.5) % 16] }
  })()
  // Date hegirienne du jour (calendrier islamique du telephone)
  const hijri = (() => {
    try {
      return new Intl.DateTimeFormat(en ? 'en-u-ca-islamic-umalqura' : 'fr-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(now))
    } catch { return null }
  })()
  // Les 5 prieres du jour (meme calcul local que la tuile maitre)
  const journee = (() => {
    try {
      const t = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now))
      return (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((k) => ({ k, d: t[k] }))
    } catch { return null }
  })()

  const boundary = fenetre.mode === 'current' ? fenetre.end.getTime() : fenetre.start.getTime()
  const minLeft = Math.max(0, Math.round((boundary - now) / 60000))
  const walkMin = mosquee ? walk(mosquee.distM) : null
  const statut = fenetre.mode === 'current' && walkMin != null
    ? (minLeft > walkMin + 25 ? 'vert' : minLeft > walkMin + 5 ? 'orange' : 'rouge')
    : null
  const C = { vert: '#3BD17A', orange: '#F2A93B', rouge: '#E5484D' } as const
  const accent = statut ? C[statut] : 'var(--or)'
  const fmtClock = (d: Date) => d.toLocaleTimeString(en ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })

  const pepite = pres?.pepite ?? null
  // Guide vedette propose quand il n'y a pas encore de pepite autour
  const vedette = villeGuide ?? vedettes.find((v) => v.slug !== pres?.autour[0]?.villeSlug) ?? vedettes[0] ?? null
  const pepiteImg = pepite?.photos?.[0]?.startsWith('http') ? pepite.photos[0] : pepite?.villeImage

  // Meilleur resto : OSM/spots < 3 km, sinon resto communautaire < 5 km
  const rc = pres?.restoCom
  const restoProche = resto ?? (rc && rc.lat && rc.lng
    ? { nom: rc.nom, lat: rc.lat, lng: rc.lng, source: 'communaute' as const, distM: (rc as unknown as { distM: number }).distM }
    : null)
  // Une envie choisie prime sur « le plus proche »
  const envieActive = envieById(envie)
  const bestResto = envie ? (restoEnvie ?? null) : restoProche

  // ── Etape 3 : le board vit avec l'heure — la bonne tuile grossit au bon
  // moment. La priere garde toujours la priorite quand elle approche. ──
  const heure = new Date(now).getHours()
  const prayerUrgent = minLeft <= 45 || (statut != null && statut !== 'vert')
  const repas = (heure >= 11 && heure < 14) || (heure >= 19 && heure < 22)
  const soiree = heure >= 21 || heure < 5
  const focus: 'priere' | 'manger' | 'soiree' =
    prayerUrgent ? 'priere'
    // Une envie exprimee est un signal fort : la tuile manger passe devant
    // (sauf priere imminente, qui garde toujours la priorite).
    : envie ? 'manger'
    : repas && bestResto ? 'manger'
    : soiree && pepite ? 'soiree'
    : 'priere'

  const T = {
    lab: { fontSize: 10.5, fontWeight: 800 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--or)', margin: 0 },
    tile: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(253,250,243,0.1)', borderRadius: 18, padding: '13px 14px' },
    meta: { fontSize: 12, color: 'rgba(253,250,243,0.6)', margin: 0 },
  }

  return (
    <section style={{ background: 'var(--nuit)', padding: '14px 14px 6px' }} aria-label={en ? 'Your travel board' : 'Ton tableau de bord voyage'}>
      <div className="board-wrap" style={{ margin: '0 auto' }}>
        {/* Barre ville : 1 tap = GPS exact (le roaming fausse la geoloc IP) */}
        <div className="board-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            onClick={() => { refineGps().then((ok) => { if (!ok) window.location.href = '/horaires-priere' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 48, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.4)', background: 'transparent', color: 'var(--creme)', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}
          >
            {geoLoading ? (en ? '📡 Locating…' : '📡 Localisation…')
              : source === 'gps' ? `📍 ${pos.label}`
              : `📍 ${pos.label} · ${en ? 'not you? Tap' : 'pas toi ? Appuie'}`}
          </button>
          <Link href="/spots" style={{ color: 'var(--or)', fontSize: 13.5, fontWeight: 800, textDecoration: 'none', minHeight: 48, padding: '0 8px', display: 'flex', alignItems: 'center' }}>
            {en ? 'See all →' : 'Tout voir →'}
          </Link>
        </div>

        {/* ── Tuiles composables : la taille suit le moment (focus) ── */}
        {(() => {
          const priereWide = (
            <div className="board-hero" role="link" tabIndex={0} onClick={() => { window.location.href = '/horaires-priere' }} onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = '/horaires-priere' }}
              style={{ ...T.tile, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ ...T.lab, color: accent }}>
                  🕌 {fenetre.mode === 'current' ? (en ? 'Now' : 'Maintenant') : (en ? 'Next prayer' : 'Prochaine prière')} · {fenetre.key}
                </p>
                <p style={{ ...T.meta, fontWeight: 700 }}>{fmtClock(fenetre.start)}</p>
              </div>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 30, fontWeight: 900, margin: '2px 0 0', lineHeight: 1.05 }}>
                {fenetre.mode === 'current'
                  ? (en ? `ends in ${fmtMin(minLeft)}` : `se termine dans ${fmtMin(minLeft)}`)
                  : (en ? `in ${fmtMin(minLeft)}` : `dans ${fmtMin(minLeft)}`)}
              </p>
              {statut && (
                <p style={{ fontSize: 13, fontWeight: 800, color: accent, margin: '4px 0 0' }}>
                  {statut === 'vert' ? (en ? '🟢 You have time to reach the mosque' : '🟢 Tu as le temps d\'arriver à la mosquée')
                    : statut === 'orange' ? (en ? '🟠 Leave now' : '🟠 Pars maintenant')
                    : (en ? '🔴 Pray where you can' : '🔴 Prie où tu peux')}
                </p>
              )}
              {mosquee === undefined && <p style={{ ...T.meta, marginTop: 8 }}>{en ? 'Finding the nearest prayer place…' : 'Recherche du lieu de prière le plus proche…'}</p>}
              {mosquee && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <p style={{ flex: 1, minWidth: 170, color: '#fdfaf3', fontSize: 14, margin: 0, lineHeight: 1.45 }}>
                    {mosquee.source === 'communaute' ? '🤝' : mosquee.source === 'annuaire' ? '📒' : '🕌'} <strong><bdi>{mosquee.nom}</bdi></strong>
                    <span style={{ color: 'rgba(253,250,243,0.6)' }}> · {walkMin} {en ? 'min walk' : 'min à pied'} · {
                      mosquee.source === 'communaute' ? (en ? 'shared by a traveler' : 'partagé par un voyageur')
                        : (en ? 'listed · to verify' : 'référencé · à vérifier')
                    }</span>
                  </p>
                  <a href={itin(mosquee.lat, mosquee.lng)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                    🚶 {en ? 'Directions' : 'Itinéraire'}
                  </a>
                </div>
              )}
              {mosquee === null && (
                <p style={{ ...T.meta, marginTop: 8 }}>
                  {osmOk
                    ? (en ? 'No known prayer place within 5 km — ' : 'Aucun lieu de prière connu à moins de 5 km — ')
                    : (en ? 'Could not search nearby places (no connection) — ' : 'Recherche des lieux impossible (pas de connexion) — ')}
                  <Link href="/qibla" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--or)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 10px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.4)' }}>🧭 Qibla</Link>
                </p>
              )}
            </div>
          )
          // Bandeau priere compact : tout tient sur une ligne quand la priere
          // n'est pas le moment dominant
          const priereSlim = (
            <Link className="board-slim" href="/horaires-priere" style={{ ...T.tile, marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '11px 14px' }}>
              <span style={{ fontSize: 18 }} aria-hidden>🕌</span>
              <p style={{ flex: 1, color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, margin: 0, lineHeight: 1.35 }}>
                {fenetre.key} {fenetre.mode === 'current' ? (en ? 'ends in' : 'se termine dans') : (en ? 'in' : 'dans')} <strong style={{ color: 'var(--or)' }}>{fmtMin(minLeft)}</strong>
                {mosquee ? <span style={{ color: 'rgba(253,250,243,0.6)' }}> · <bdi>{mosquee.nom}</bdi> ({walkMin} min)</span> : null}
              </p>
              <span style={{ color: 'var(--or)', fontWeight: 800, fontSize: 13 }}>→</span>
            </Link>
          )
          const mangerWide = bestResto && (
            <div className="board-hero" role="link" tabIndex={0} onClick={() => window.open(itin(bestResto.lat, bestResto.lng), '_blank', 'noopener')} onKeyDown={(e) => { if (e.key === 'Enter') window.open(itin(bestResto.lat, bestResto.lng), '_blank', 'noopener') }}
              style={{ ...T.tile, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)', cursor: 'pointer' }}>
              <p style={T.lab}>{envieActive
                ? [
                    `${envieActive.emoji} ${envieActive[en ? 'en' : 'fr']}`,
                    bestResto?.force === 1 ? (en ? 'maybe' : 'peut-être') : null,
                    mode === 'meilleur' ? (en ? 'best pick' : 'meilleur choix') : (en ? 'closest' : 'le plus proche'),
                  ].filter(Boolean).join(' · ')
                : `🍽 ${en ? 'Time to eat — nearest halal' : 'C\'est l\'heure de manger — le plus proche'}`}</p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 24, fontWeight: 900, margin: '4px 0 0', lineHeight: 1.15 }}>
                <bdi>{bestResto.nom}</bdi>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                <p style={{ flex: 1, minWidth: 160, ...T.meta, fontSize: 13 }}>
                  {bestResto.distM > 2000
                    ? `${(bestResto.distM / 1000).toFixed(1)} km${en ? ' away' : ''}`
                    : `${walk(bestResto.distM)} ${en ? 'min walk' : 'min à pied'}`}
                  {bestResto.cuisine ? <> · <span style={{ color: 'rgba(253,250,243,0.75)' }}>{bestResto.cuisine}</span></> : null}
                  {bestResto.force === 1 ? <> · <span style={{ color: 'var(--or)' }}>{en ? 'not certain for this dish' : 'pas sûr pour ce plat'}</span></> : null}
                  {' · '}
                  {(() => {
                    if (bestResto.source === 'communaute') return en ? 'shared by a traveler · to confirm' : 'partagé par un voyageur · à confirmer'
                    const n = niveauHalal(bestResto.halal, en)
                    return n ? <span style={{ color: n.fort ? 'var(--or)' : undefined }}>{n.texte}</span> : (en ? 'listed halal · to verify' : 'signalé halal · à vérifier')
                  })()}
                </p>
                <a href={itin(bestResto.lat, bestResto.lng)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                  🚶 {en ? 'Directions' : 'Itinéraire'}
                </a>
              </div>
              {/* Photos et notes : on n'en invente aucune. Celles qui existent
                  vraiment sont chez Google — un tap. Et si le voyageur y est,
                  sa photo enrichit NOTRE site pour le suivant. */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(bestResto.nom)}/@${bestResto.lat},${bestResto.lng},18z`}
                  target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.25)', color: 'var(--creme)', fontWeight: 700, fontSize: 12.5, textDecoration: 'none' }}
                >
                  ⭐ {en ? 'Photos & reviews' : 'Photos & avis'}
                </a>
                <Link
                  href="/communaute/ajouter" onClick={(e) => e.stopPropagation()}
                  style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.25)', color: 'var(--creme)', fontWeight: 700, fontSize: 12.5, textDecoration: 'none' }}
                >
                  📷 {en ? 'You are there? Add a photo' : 'Tu y es ? Ajoute ta photo'}
                </Link>
                {bestResto.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (avisEnvoye) return
                      setAvisEnvoye(true)
                      setRestoEnvie((r) => (r ? { ...r, avis: (r.avis ?? 0) + 1 } : r))
                      fetch('/api/avis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: bestResto.id, nom: bestResto.nom }) }).catch(() => {})
                    }}
                    style={{ minHeight: 44, padding: '0 12px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.25)', background: avisEnvoye ? 'rgba(201,168,76,0.18)' : 'transparent', color: avisEnvoye ? 'var(--or)' : 'var(--creme)', fontWeight: 700, fontSize: 12.5, cursor: avisEnvoye ? 'default' : 'pointer' }}
                  >
                    👍 {avisEnvoye ? (en ? 'Thanks!' : 'Merci !') : (en ? 'I liked it' : 'J\'ai aimé')}
                    {(bestResto.avis ?? 0) > 0 ? ` · ${bestResto.avis}` : ''}
                  </button>
                )}
              </div>
              {/* Pourquoi ce lieu : on montre nos criteres, on ne cache rien.
                  Nous n'avons pas les notes Google — on le dit. */}
              {envieActive && (
                <p style={{ ...T.meta, fontSize: 11.5, marginTop: 7, lineHeight: 1.45 }}>
                  {mode === 'meilleur'
                    ? (en
                      ? `Best pick = travelers' likes${(bestResto.avis ?? 0) > 0 ? ` (${bestResto.avis})` : ' (none yet here)'}, sure match, reported halal, then distance. Google ratings are not available to us yet.`
                      : `Meilleur choix = avis des voyageurs${(bestResto.avis ?? 0) > 0 ? ` (${bestResto.avis})` : ' (aucun ici pour l\'instant)'}, correspondance sûre, halal signalé, puis distance. Les notes Google ne nous sont pas encore accessibles.`)
                    : (en ? 'Closest first — nothing else considered.' : 'Le plus proche d\'abord — rien d\'autre n\'entre en compte.')}
                </p>
              )}
            </div>
          )
          // Envie exprimee mais aucun resultat : on l'assume et on ouvre des
          // portes (guide de la ville, HalalGPT) au lieu de revenir en
          // silence sur la mosquee — le voyageur a pose une question.
          const mangerVide = envieActive && (
            <div style={{ ...T.tile, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)' }}>
              <p style={T.lab}>{envieActive.emoji} {envieActive[en ? 'en' : 'fr']}</p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 20, fontWeight: 900, margin: '4px 0 0', lineHeight: 1.2 }}>
                {en ? `No ${envieActive.en.toLowerCase()} listed within 12 km` : `Aucun ${envieActive.fr.toLowerCase()} signalé à moins de 12 km`}
              </p>
              <p style={{ ...T.meta, marginTop: 4 }}>
                {en ? 'Our directory does not list one here — we would rather say so than send you somewhere wrong.' : 'Notre annuaire n\'en référence pas ici — on préfère te le dire plutôt que t\'envoyer au mauvais endroit.'}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setEnvie(null)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', background: 'transparent', color: 'var(--creme)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  🍽 {en ? 'Nearest halal instead' : 'Le plus proche à la place'}
                </button>
                {villeProche && (
                  <Link href={`/destinations/${villeProche}`} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: 'var(--creme)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    📖 {en ? 'All restos in the city' : 'Tous les restos de la ville'}
                  </Link>
                )}
                <a href={en ? '/halalgpt' : 'https://halalgpt.fr'} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                  🌙 {en ? 'Ask HalalGPT' : 'Demander à HalalGPT'}
                </a>
              </div>
            </div>
          )
          const mangerSmall = (
            <div role="link" tabIndex={0}
              onClick={() => { if (bestResto) window.open(itin(bestResto.lat, bestResto.lng), '_blank', 'noopener'); else window.location.href = '/autour-de-moi' }}
              onKeyDown={(e) => { if (e.key !== 'Enter') return; if (bestResto) window.open(itin(bestResto.lat, bestResto.lng), '_blank', 'noopener'); else window.location.href = '/autour-de-moi' }}
              style={{ ...T.tile, flex: 1, cursor: 'pointer' }}>
              <p style={T.lab}>{envieActive ? `${envieActive.emoji} ${envieActive[en ? 'en' : 'fr']}` : `🍽 ${en ? 'Eat halal' : 'Manger halal'}`}</p>
              {(envie ? restoEnvie === undefined : resto === undefined && !bestResto) ? <p style={{ ...T.meta, marginTop: 4 }}>…</p>
                : !bestResto ? <p style={{ ...T.meta, marginTop: 4 }}>{
                    envieActive ? (en ? `No halal ${envieActive.en.toLowerCase()} listed within 12 km` : `Aucun ${envieActive.fr.toLowerCase()} signalé halal à moins de 12 km`)
                      : osmOk ? (en ? 'None reported nearby' : 'Aucun signalé à proximité')
                      : (en ? 'Search unavailable (no connection)' : 'Recherche indisponible (pas de connexion)')
                  }</p>
                : (
                  <>
                    <a href={itin(bestResto.lat, bestResto.lng)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 13.5, textDecoration: 'none', display: 'block', margin: '3px 0 1px', lineHeight: 1.3 }}>
                      <bdi>{bestResto.nom}</bdi> →
                    </a>
                    <p style={T.meta}>
                      {walk(bestResto.distM)} {en ? 'min walk' : 'min à pied'} · {bestResto.source === 'communaute' ? (en ? 'community · to confirm' : 'communauté · à confirmer') : (en ? 'reported halal · verify' : 'signalé halal · à vérifier')}
                    </p>
                  </>
                )}
            </div>
          )
          const pepiteTile = (minH: number, wide = false) => pepite ? (
            <Link href={`/spot/${pepite.id}`} style={{ ...T.tile, padding: 0, overflow: 'hidden', position: 'relative', minHeight: minH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textDecoration: 'none', backgroundImage: pepiteImg ? `linear-gradient(180deg, rgba(11,26,15,0.05) 30%, rgba(11,26,15,0.9)), url(${pepiteImg})` : 'linear-gradient(160deg, #1d4a35, #0e2013)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ padding: '10px 12px' }}>
                <p style={T.lab}>💎 {wide ? (en ? 'Tonight\'s gem' : 'La pépite du soir') : (en ? 'The gem' : 'La pépite')}{pepite.video ? ' · 🎬' : ''}</p>
                <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: wide ? 17 : 14.5, margin: '2px 0 0', lineHeight: 1.25 }}>{pepite.nom}</p>
                <p style={T.meta}>{pepite.villeNom}{(pepite.confirmations ?? 0) > 0 ? ` · ${en ? 'confirmed by' : 'confirmé par'} ${pepite.confirmations}` : ''}</p>
              </div>
            </Link>
          ) : (
            // Etat vide = porte, jamais cul-de-sac : on propose un guide deja
            // rempli (chiffres reels) plutot que de demander de contribuer.
            vedette ? (
              <Link href={`/destinations/${vedette.slug}`} style={{ ...T.tile, padding: 0, overflow: 'hidden', minHeight: minH, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textDecoration: 'none', backgroundImage: vedette.image ? `linear-gradient(180deg, rgba(11,26,15,0.1) 25%, rgba(11,26,15,0.92)), url(${vedette.image})` : 'linear-gradient(160deg, #1d4a35, #0e2013)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ padding: '10px 12px' }}>
                  <p style={T.lab}>📖 {villeGuide && vedette.slug === villeGuide.slug ? (en ? 'Your city guide' : 'Le guide de ta ville') : (en ? 'Ready-made guide' : 'Guide déjà prêt')}</p>
                  <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 15, margin: '2px 0 0', lineHeight: 1.25 }}>{vedette.nom} <span style={{ color: 'var(--or)' }}>✦ {vedette.score}</span></p>
                  <p style={T.meta}>
                    {vedette.restaurants > 0 && `${vedette.restaurants} ${en ? 'halal restos' : 'restos halal'}`}
                    {vedette.restaurants > 0 && vedette.mosquees > 0 && ' · '}
                    {vedette.mosquees > 0 && `${vedette.mosquees} ${en ? 'mosques' : 'mosquées'}`}
                  </p>
                </div>
              </Link>
            ) : (
            <Link href="/destinations" style={{ ...T.tile, minHeight: minH, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', textDecoration: 'none' }}>
              <p style={{ fontSize: 26, margin: 0 }}>📖</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 13.5, margin: '6px 0 2px' }}>{en ? 'Browse the guides' : 'Parcourir les guides'}</p>
              <p style={T.meta}>{en ? 'Mosques, halal restos, city by city' : 'Mosquées, restos halal, ville par ville'}</p>
            </Link>
            )
          )
          const spotsTile = (
            <Link href={pres && !pres.proches.length && !pres.autour.length ? '/spots' : '/autour-de-moi'} style={{ ...T.tile, flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {(() => {
                const proches = pres?.proches.length ?? 0
                const zone = pres?.autour.length ?? 0
                const total = pres?.total ?? 0
                const n = pres ? (proches || zone || total) : null
                const villeNom = pres?.autour[0]?.villeNom
                const lab = !pres ? (en ? 'spots around you' : 'spots autour de toi')
                  : proches ? (en ? 'spots around you' : 'spots autour de toi')
                  : zone && villeNom ? (en ? `spots in ${villeNom}` : `spots à ${villeNom}`)
                  : (en ? 'spots shared by travelers' : 'spots partagés par des voyageurs')
                return (
                  <p style={{ margin: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--or)', fontSize: 26, fontWeight: 700 }}>{n ?? '…'}</span>
                    <span style={{ ...T.meta, marginLeft: 6 }}>{lab}</span>
                  </p>
                )
              })()}
              <p style={{ ...T.meta, color: 'var(--or)', fontWeight: 700 }}>
                {pres && !pres.proches.length && !pres.autour.length ? (en ? 'See the feed →' : 'Voir le fil →') : (en ? 'Open the map →' : 'Ouvrir la carte →')}
              </p>
            </Link>
          )

          if (focus === 'manger' && (mangerWide || mangerVide)) {
            return (
              <>
                {mangerWide || mangerVide}
                {priereSlim}
                <div className="board-duo" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10, marginTop: 10 }}>
                  {pepiteTile(150)}
                  {spotsTile}
                </div>
              </>
            )
          }
          if (focus === 'soiree') {
            return (
              <>
                {pepiteTile(200, true)}
                {priereSlim}
                <div className="board-duo" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  {mangerSmall}
                  {spotsTile}
                </div>
              </>
            )
          }
          return (
            <>
              {priereWide}
              <div className="board-duo" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10, marginTop: 10 }}>
                {pepiteTile(172)}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mangerSmall}
                  {spotsTile}
                </div>
              </div>
            </>
          )
        })()}


        {/* 🍔 « J'ai envie de… » — l'envie du moment, pas seulement le plus
            proche. Filtre le TYPE de cuisine ; le statut halal ne change pas
            (« signalé halal · à vérifier » dans tous les cas). */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
            <span style={{ flex: 'none', alignSelf: 'center', ...T.lab, paddingRight: 2 }}>
              {en ? 'I feel like' : 'J\'ai envie de'}
            </span>
            {envie && (
              <button
                onClick={() => setEnvie(null)}
                style={{ flex: 'none', minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.25)', background: 'transparent', color: 'rgba(253,250,243,0.75)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
              >
                ✕ {en ? 'Any' : 'Tout'}
              </button>
            )}
            {ENVIES.map((e) => {
              const on = envie === e.id
              return (
                <button
                  key={e.id}
                  onClick={() => setEnvie(on ? null : e.id)}
                  aria-pressed={on}
                  style={{
                    flex: 'none', minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                    border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.18)',
                    background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                    color: on ? 'var(--or)' : 'var(--creme)',
                    fontWeight: on ? 800 : 700, fontSize: 13.5, whiteSpace: 'nowrap',
                  }}
                >
                  {e.emoji} {e[en ? 'en' : 'fr']}
                </button>
              )
            })}
          </div>
        </div>


          {envie && (
            <div style={{ display: 'flex', gap: 7, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {([['proche', '📍', en ? 'Closest' : 'Le plus proche'], ['meilleur', '⭐', en ? 'Best pick' : 'Le meilleur choix']] as const).map(([m, ic, lab]) => {
                const on = mode === m
                return (
                  <button
                    key={m} onClick={() => setMode(m)} aria-pressed={on}
                    style={{
                      minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                      border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.18)',
                      background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                      color: on ? 'var(--or)' : 'var(--creme)', fontWeight: on ? 800 : 700, fontSize: 13,
                    }}
                  >
                    {ic} {lab}
                  </button>
                )
              })}
            </div>
          )}

        {/* ── Bande de reels de la ville ── */}
        {pres && pres.reels.length > 0 && (
          <div className="board-reels" style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
            {pres.reels.map((s) => {
              const img = s.photos?.[0]?.startsWith('http') ? s.photos[0] : s.villeImage
              return (
                <Link key={s.id} href={`/spot/${s.id}`} style={{ flex: 'none', width: 92, height: 128, borderRadius: 14, overflow: 'hidden', position: 'relative', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.25)', backgroundImage: img ? `linear-gradient(180deg, rgba(11,26,15,0) 40%, rgba(11,26,15,0.9)), url(${img})` : 'linear-gradient(180deg, #1d4a35, #0e2013)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {s.video && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 13 }}>🎬</span>}
                  <span style={{ padding: '5px 7px', color: '#fdfaf3', fontSize: 10.5, fontWeight: 700, lineHeight: 1.25 }}>{s.nom.slice(0, 34)}</span>
                </Link>
              )
            })}
            <Link href="/spots" style={{ flex: 'none', width: 92, height: 128, borderRadius: 14, border: '1.5px dashed rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', fontWeight: 800, fontSize: 12.5, textDecoration: 'none', textAlign: 'center' }}>
              {en ? 'All spots →' : 'Tous les spots →'}
            </Link>
          </div>
        )}

        {/* ── Rangee : Qibla + date hegirienne (calcul local) ── */}
        <div className="board-smalls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <Link href="/qibla" style={{ ...T.tile, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26, transform: `rotate(${qibla.deg}deg)`, display: 'inline-block', lineHeight: 1 }} aria-hidden>🧭</span>
            <span>
              <p style={T.lab}>{en ? 'Qibla' : 'Qibla'}</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 15, margin: '2px 0 0' }}>{qibla.deg}° · {qibla.dir}</p>
              <p style={{ ...T.meta, color: 'var(--or)', fontWeight: 700 }}>{en ? 'Compass →' : 'Boussole →'}</p>
            </span>
          </Link>
          <Link href="/horaires-priere" style={{ ...T.tile, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <span style={{ fontSize: 24 }} aria-hidden>🌙</span>
            <span>
              <p style={T.lab}>{en ? 'Hijri date' : 'Date hégirienne'}</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 14, margin: '2px 0 0', lineHeight: 1.3 }}>{hijri ?? '—'}</p>
            </span>
          </Link>
        </div>

        {/* ── Bande : les 5 prieres du jour, la prochaine en or ── */}
        {journee && (
          <Link className="board-strip" href="/horaires-priere" style={{ ...T.tile, marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 6, padding: '11px 12px', textDecoration: 'none' }}>
            {journee.map(({ k, d }) => {
              const active = fenetre.key === k
              return (
                <div key={k} style={{ textAlign: 'center', flex: 1, borderRadius: 10, padding: '5px 2px', background: active ? 'rgba(201,168,76,0.16)' : 'transparent' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: active ? 'var(--or)' : 'rgba(253,250,243,0.55)', margin: 0 }}>{k}</p>
                  <p style={{ color: active ? '#fdfaf3' : 'rgba(253,250,243,0.75)', fontWeight: active ? 800 : 600, fontSize: 12.5, margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' }}>{fmtClock(d)}</p>
                </div>
              )
            })}
          </Link>
        )}
      </div>
    </section>
  )
}
