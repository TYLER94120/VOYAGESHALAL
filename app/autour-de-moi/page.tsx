'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import SurMesure, { type Fiche } from '@/components/lieux/SurMesure'

// 🗺️ « AUTOUR DE MOI » — LA MÊME RECHERCHE, EN VUE CARTE.
//
// ════════ CE QUI A ÉTÉ SUPPRIMÉ, ET POURQUOI ════════
//
// Ordre de Mohamed, 15 août : « Ce que je vois sur "Que faire" : Mahatma
// Gandhi · Memorial · 4,3 km, De Woelige Stal · Zoo, des noms tronqués,
// des catégories en anglais brut, aucune note, aucun avis, aucune photo,
// aucune phrase d'IA — et "Voir plus (35 autres)", soit QUARANTE
// résultats. C'est l'ancienne liste OpenStreetMap. Elle ignore Google
// Places, l'IA, la règle des TROIS fiches, le tri sur mesure, les
// critères, le profil, les distances chirurgicales. Tout ce qu'on a
// construit cette nuit n'existe pas sur cette page. »
//
// Il avait raison, et le défaut était structurel : cette page avait son
// PROPRE moteur. Six cents lignes qui appelaient /api/nearby, /api/osm et
// /api/spots, fusionnaient, dédoublonnaient, filtraient, classaient — un
// deuxième cerveau qui ne connaissait ni le filtre alcool, ni le profil
// alimentaire, ni les rayons chirurgicaux, ni l'IA.
//
// Tout cela est parti. Il ne reste RIEN qui cherche des lieux ici : la
// page monte <SurMesure>, qui interroge /api/lieux comme partout ailleurs,
// et se contente de poser une épingle par fiche trouvée. Une source de
// vérité, aucun chemin parallèle.
//
// ════════ CE QUI RESTE ICI, ET SEULEMENT ÇA ════════
//
//   · le fond de carte OpenStreetMap — gratuit, et Google ne sert QU'AUX
//     DONNÉES des lieux : une carte Google se facture à chaque chargement ;
//   · la feuille tirable au pouce, trois positions ;
//   · le lien à double sens entre les épingles et les fiches ;
//   · les mosquées visibles en permanence, notre signature.

const OR = '#c9a84c'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function epingle(L: any, rang: number, choisie: boolean) {
  const taille = choisie ? 40 : 34
  return L.divIcon({
    html: `<div style="width:${taille}px;height:${taille}px;background:${OR};border:3px solid ${choisie ? '#0B1A0F' : '#fff'};border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;transform:scale(${choisie ? 1.15 : 1})"><span style="font-size:15px;font-weight:900;color:#0B1A0F;font-family:system-ui">${rang}</span></div>`,
    className: '', iconAnchor: [taille / 2, taille / 2],
  })
}

type Feuille = 'repliee' | 'moitie' | 'pleine'
// 📏 « Soit la carte est assez grande pour servir, soit elle cède la place
// à la liste » (Mohamed). En ouverture, la liste prend les deux tiers : ce
// sont les ADRESSES qu'on vient chercher, la carte dit seulement où elles
// sont. Un bouton la rend pleine quand on veut la regarder.
const HAUTEUR: Record<Feuille, string> = { repliee: '148px', moitie: '68dvh', pleine: '92dvh' }

export default function AutourDeMoiPage() {
  const etatPos = useInstantPosition()
  const { pos } = etatPos

  const [fiches, setFiches] = useState<Fiche[]>([])
  const [choisie, setChoisie] = useState<string | null>(null)
  const [feuille, setFeuille] = useState<Feuille>('moitie')
  const [carteDeplacee, setCarteDeplacee] = useState(false)
  const [phraseVenue, setPhraseVenue] = useState('')

  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)
  const marqueurs = useRef<{ id: string; marker: Marker; rang: number }[]>([])
  const moiRef = useRef<Marker | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mosqueesFond = useRef<any[]>([])
  const glisse = useRef<{ y0: number; h0: Feuille } | null>(null)
  const plein = useRef<HTMLElement | null>(null)

  // 📏 LA HAUTEUR DISPONIBLE SE MESURE, ELLE NE SE DEVINE PAS. Un
  // « calc(100dvh - 59px) » écrit en dur serait faux sur le premier
  // appareil qui ne ressemble pas au mien.
  const [hautDispo, setHautDispo] = useState<number | null>(null)
  useEffect(() => {
    const lire = () => {
      const el = plein.current
      if (!el) return
      const haut = el.getBoundingClientRect().top
      const nav = document.querySelector('.bottom-nav')
      const r = nav?.getBoundingClientRect()
      const bas = r && nav && getComputedStyle(nav).position === 'fixed' && r.height ? r.top : window.innerHeight
      setHautDispo(Math.max(320, Math.round(Math.min(bas, window.innerHeight) - haut)))
    }
    lire()
    window.addEventListener('resize', lire)
    const id = setTimeout(lire, 400)
    return () => { window.removeEventListener('resize', lire); clearTimeout(id) }
  }, [])

  // 🔗 §2.5 — LA RECHERCHE VOYAGE ENTRE LES DEUX VUES. L'accueil envoie
  // ?q=… ; la carte s'ouvre avec la recherche déjà lancée, rien à retaper.
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search)
      const q = p.get('q')
      if (q) setPhraseVenue(q)
    } catch { /* ouverture normale */ }
  }, [])

  // ⏱️ L'OUVERTURE RÉPOND AU MOMENT, PAS À UN RÉGLAGE FIGÉ.
  //
  // Mohamed, 15 août : « J'ouvre "Autour de moi" : on me montre des
  // restaurants alors que je n'ai rien demandé. » L'onglet Manger était
  // imposé en dur — un choix arbitraire présenté comme une réponse.
  //
  // Le site connaît l'heure et la position : il sait donc si la prière
  // approche. Moins de 30 minutes → on ouvre sur PRIER, parce que c'est le
  // besoin du moment. Sinon on n'impose RIEN : la recherche part sur les
  // lieux proches, toutes catégories, et les trois boutons restent là.
  const [ouvertureSur, setOuvertureSur] = useState<'mosquee' | 'aucune' | null>(null)
  /** Pourquoi la page s'est ouverte sur Prier — on ne l'impose jamais en
   *  silence. */
  const [raisonOuverture, setRaisonOuverture] = useState<'priere' | null>(null)
  useEffect(() => {
    if (!pos || ouvertureSur) return
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const t = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date())
      const maintenant = Date.now()
      const proche = ([t.Fajr, t.Dhuhr, t.Asr, t.Maghrib, t.Isha] as Date[])
        .some((d) => d.getTime() > maintenant && d.getTime() - maintenant < 30 * 60 * 1000)
      // 🔴 AUCUNE CATÉGORIE IMPOSÉE. Mohamed, deux fois de suite : « Hier
      // les restaurants, aujourd'hui les mosquées, alors qu'Asr était dans
      // 3 h 42. Rien ne le justifie. » J'avais remplacé un choix arbitraire
      // par un autre choix arbitraire, un peu plus habillé.
      //
      // La seule exception qu'il accorde est la prière imminente — moins de
      // 30 minutes — et elle DIT pourquoi elle s'impose. Hors de ce cas, la
      // page n'ouvre RIEN : elle laisse les trois boutons, et ils sont la
      // réponse à « qu'est-ce que je cherche ».
      setOuvertureSur(proche ? 'mosquee' : 'aucune')
      setRaisonOuverture(proche ? 'priere' : null)
    } catch {
      setOuvertureSur('aucune')
      setRaisonOuverture(null)
    }
  }, [pos, ouvertureSur])

  // ── La carte, une fois, et recentrée quand la position change ────────
  useEffect(() => {
    if (!pos || !mapEl.current) return
    let annule = false
    ;(async () => {
      const L = LRef.current || (await import('leaflet')).default
      if (annule) return
      LRef.current = L
      if (!mapRef.current) {
        const m = L.map(mapEl.current!, { center: [pos.lat, pos.lng], zoom: 14, zoomControl: false })
        mapRef.current = m
        L.control.zoom({ position: 'bottomright' }).addTo(m)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(m)
        // « Rechercher dans cette zone » n'apparaît QU'APRÈS un déplacement
        // volontaire — jamais en permanence.
        m.on('dragend zoomend', () => setCarteDeplacee(true))
      } else {
        mapRef.current.setView([pos.lat, pos.lng], 14)
      }
      const icone = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:26px;height:26px;background:#fff;border:3px solid #2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(37,99,235,.18);font-size:14px">🧍</div></div>`,
        className: '', iconAnchor: [13, 13],
      })
      if (moiRef.current) moiRef.current.setLatLng([pos.lat, pos.lng])
      else moiRef.current = L.marker([pos.lat, pos.lng], { icon: icone, zIndexOffset: 1000 }).addTo(mapRef.current)
    })()
    return () => { annule = true }
  }, [pos])

  // ── Une épingle par fiche. Rien d'autre ne peuple la carte ───────────
  useEffect(() => {
    const L = LRef.current
    if (!L || !mapRef.current) return
    marqueurs.current.forEach(({ marker }) => marker.remove())
    marqueurs.current = []
    fiches.forEach((f, i) => {
      if (!f.id) return
      const mk = L.marker([f.lat, f.lng], { icon: epingle(L, i + 1, false), zIndexOffset: 500 - i }).addTo(mapRef.current)
      // 🔗 Toucher une épingle → sa fiche remonte dans la feuille (§2.2).
      mk.on('click', () => {
        setChoisie(f.id!)
        setFeuille((v) => (v === 'repliee' ? 'moitie' : v))
        setTimeout(() => document.querySelector(`[data-fiche="${f.id}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 260)
      })
      marqueurs.current.push({ id: f.id, marker: mk, rang: i + 1 })
    })
    if (fiches.length) {
      try {
        mapRef.current.fitBounds(L.latLngBounds(fiches.map((f) => [f.lat, f.lng])), { padding: [60, 60], maxZoom: 16, animate: true })
      } catch { /* une seule fiche : le cadrage automatique n'a pas de sens */ }
    }
  }, [fiches])

  // ── La sélection, vue des deux côtés ────────────────────────────────
  useEffect(() => {
    const L = LRef.current
    if (!L) return
    marqueurs.current.forEach(({ id, marker, rang }) => marker.setIcon(epingle(L, rang, id === choisie)))
    const f = fiches.find((x) => x.id === choisie)
    if (f) mapRef.current?.setView([f.lat, f.lng], Math.max(mapRef.current.getZoom(), 15), { animate: true })
  }, [choisie, fiches])

  // 🕌 NOTRE SIGNATURE : les mosquées restent visibles en épingles
  // discrètes, même quand je cherche à manger. Peintes APRÈS les
  // résultats — elles ne retardent jamais la réponse à la question posée.
  const peindreMosquees = useCallback(async (lat: number, lng: number) => {
    const L = LRef.current
    if (!L || !mapRef.current) return
    mosqueesFond.current.forEach((m) => m.remove())
    mosqueesFond.current = []
    let liste: { nom: string; lat: number; lng: number }[] = []
    try {
      const r = await fetch(`/api/osm-restos?lat=${lat}&lng=${lng}&rayon=4000&quoi=tout`)
      if (r.ok) liste = ((await r.json()).mosquees ?? []).slice(0, 25)
    } catch { return /* la carte vit très bien sans cette couche */ }
    if (!mapRef.current) return
    for (const m of liste) {
      const ic = L.divIcon({
        html: `<div style="width:20px;height:20px;background:rgba(45,106,79,.88);border:2px solid rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px">🕌</div>`,
        className: '', iconSize: [20, 20], iconAnchor: [10, 10],
      })
      mosqueesFond.current.push(
        L.marker([m.lat, m.lng], { icon: ic, zIndexOffset: -400, opacity: 0.85 }).addTo(mapRef.current).bindTooltip(m.nom, { direction: 'top' }),
      )
    }
  }, [])

  useEffect(() => {
    if (!pos) return
    let annule = false
    const t = setTimeout(() => { if (!annule) peindreMosquees(pos.lat, pos.lng) }, 900)
    return () => { annule = true; clearTimeout(t) }
  }, [pos, peindreMosquees])

  const recentrer = () => {
    // §1.5 : le bouton ramène à MA position réelle, pas au centre affiché.
    etatPos.refineGps().then(() => setCarteDeplacee(false))
  }

  return (
    <main ref={plein} className="autour-plein" style={hautDispo ? { height: hautDispo } : { height: '100dvh' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}>
        Mosquées, restaurants halal et spots autour de moi
      </h1>

      {/* Le fond de carte : OpenStreetMap, gratuit. Google ne sert qu'aux
          DONNÉES des lieux (la clé est d'ailleurs restreinte aux Places). */}
      <div ref={mapEl} className="autour-carte" style={{ background: '#dfe6e2' }} />

      {/* 🏠 LE RETOUR, ÉVIDENT ET PERMANENT.
          Mohamed, 15 août : « Une fois sur la carte, aucun moyen visible de
          rentrer à l'accueil. On est prisonnier de l'écran. » Sur cette
          page la carte occupe tout, y compris la place où vit d'habitude
          l'en-tête du site : il n'y avait donc plus aucune porte de sortie.
          Ce bouton flotte au-dessus de la carte, au-dessus de la feuille de
          résultats, et il ne bouge jamais. */}
      <a href="/" className="autour-retour" aria-label="Revenir à l'accueil">‹ Accueil</a>

      {/* 🧹 15 août — LA POSITION N'EST PLUS AFFICHÉE ICI.
          Mohamed : « une pastille de position TRONQUÉE : "📍 · ex…" — on ne
          lit même pas le nom de la ville — et DEDANS, une deuxième fois
          "Fontenay-sous-Bois · exacte ✓". La même information deux fois à
          3 cm d'écart. » Le bandeau fin du haut la porte déjà, en entier,
          sur toutes les pages du site. Une seule mention, jamais tronquée. */}

      <button onClick={recentrer} className="autour-recentrer" aria-label="Revenir à ma position exacte">
        {etatPos.geoLoading ? '…' : '🎯'}
      </button>

      {carteDeplacee && (
        <button onClick={() => { setCarteDeplacee(false); if (pos) mapRef.current?.setView([pos.lat, pos.lng], 14) }}
          className="autour-zone">
          🔄 Revenir sur ma zone
        </button>
      )}

      {/* 📄 LA FEUILLE — les résultats, et RIEN QUE le moteur commun.
          Elle est lisible avant que le fond de carte soit chargé : dehors,
          en 4G faible, on ne fait pas attendre quelqu'un qui a faim devant
          une carte qui tourne (§2.4). */}
      <section className="autour-feuille" style={{ height: HAUTEUR[feuille] }} aria-label="Résultats">
        <div
          className="autour-poignee" role="button" tabIndex={0}
          aria-label={`Résultats — ${feuille === 'pleine' ? 'liste complète' : feuille === 'moitie' ? 'aperçu' : 'replié'}. Tirer pour agrandir.`}
          onClick={() => setFeuille((f) => (f === 'pleine' ? 'moitie' : f === 'moitie' ? 'pleine' : 'moitie'))}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeuille((f) => (f === 'pleine' ? 'moitie' : 'pleine')) } }}
          onTouchStart={(e) => { glisse.current = { y0: e.touches[0].clientY, h0: feuille } }}
          onTouchMove={(e) => {
            const g = glisse.current; if (!g) return
            const d = g.y0 - e.touches[0].clientY
            if (Math.abs(d) < 34) return
            const ordre: Feuille[] = ['repliee', 'moitie', 'pleine']
            const i = ordre.indexOf(g.h0)
            setFeuille(ordre[Math.min(2, Math.max(0, i + (d > 0 ? 1 : -1)))])
            glisse.current = null
          }}
          onTouchEnd={() => { glisse.current = null }}
        >
          <span className="autour-trait" aria-hidden />
          {/* 🧹 « tire pour voir » disparaît : c'est un geste que personne
              ne devine. Le bandeau dit ce qu'il CONTIENT, et le bouton dit
              ce qu'il FAIT. */}
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, fontSize: 14, color: 'var(--foret)' }}>
            <span>{fiches.length ? `${fiches.length} adresse${fiches.length > 1 ? 's' : ''} autour de toi` : 'Recherche autour de toi…'}</span>
            <span style={{ color: 'var(--or)', fontWeight: 800 }}>{feuille === 'pleine' ? '▾ Réduire' : '▴ Tout voir'}</span>
          </p>
        </div>
        <div className="autour-liste">
          <div className="autour-moteur">
            {/* On n'impose une catégorie que pour la prière imminente, et on
                dit pourquoi : un écran qui décide à notre place sans
                s'expliquer, c'est ce que Mohamed a reproché deux fois. */}
            {raisonOuverture === 'priere' && (
              <p style={{ margin: '0 0 10px', padding: '9px 12px', borderRadius: 12, background: 'rgba(201,168,76,0.16)', border: '1px solid var(--or)', color: 'var(--creme)', fontSize: 13.5, fontWeight: 700 }}>
                ⏱️ La prière approche — je te montre d’abord où prier.
              </p>
            )}
            {/* ⭐ LE MÊME MOTEUR QUE PARTOUT : trois fiches complètes,
                photos, note et nombre d'avis, prix, trajet avec son mode,
                statut halal honnête, filtre alcool dans le code, profil
                alimentaire, et les phrases d'IA. Aucun chemin parallèle. */}
            <SurMesure
              fondu
              posInitiale={pos ? { lat: pos.lat, lng: pos.lng, ville: pos.label } : null}
              phraseInitiale={phraseVenue}
              // ► On répond avant qu'on demande : la recherche part dès que
              // la position est connue, sans rien taper ni rien tirer.
              chercheDesLOuverture={phraseVenue || !ouvertureSur || ouvertureSur === 'aucune' ? undefined : ouvertureSur}
              onResultats={setFiches}
              selectionId={choisie}
              onSelection={setChoisie}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
