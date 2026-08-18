'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import SurMesure, { type Fiche } from '@/components/lieux/SurMesure'
import { top3 } from '@/lib/top3.mjs'
import { typeMot } from '@/lib/typeMot.mjs'
import TrajetMin from '@/components/lieux/TrajetMin'
import { lancerItineraire } from '@/lib/itineraire'

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

/**
 * 📱 SUR TÉLÉPHONE, LA LISTE GAGNE — Mohamed, 16 août :
 *
 *   « La page partage l'écran entre une bande de carte trop petite pour
 *     servir, un formulaire, et un grand vide noir. Ni carte utilisable,
 *     ni résultats visibles. »
 *
 * On tranche, et c'est assumé : deux écrans au lieu d'un compromis.
 *   · LISTE (par défaut) — les fiches prennent toute la largeur et toute la
 *     hauteur. Aucune bande de carte résiduelle, aucun vide noir.
 *   · CARTE — plein écran, avec un retour évident vers la liste.
 *
 * Sur ordinateur, rien ne change : deux colonnes ont la place, et ça
 * fonctionne. La bascule y est simplement ignorée (voir globals.css).
 *
 * Les trois positions coulissantes et le geste « tirer pour agrandir »
 * disparaissent : personne ne devine ce geste, et un écran qui exige d'être
 * deviné n'est pas un écran.
 */
type Vue = 'liste' | 'carte'
// 📏 « Soit la carte est assez grande pour servir, soit elle cède la place
// à la liste » (Mohamed). En ouverture, la liste prend les deux tiers : ce
// sont les ADRESSES qu'on vient chercher, la carte dit seulement où elles
// sont. Un bouton la rend pleine quand on veut la regarder.
// 📏 Plus de hauteurs intermédiaires : sur téléphone la liste occupe tout,
// et la carte occupe tout. Le partage d'écran ne servait ni l'une ni l'autre.

export default function AutourDeMoiPage() {
  const etatPos = useInstantPosition()
  const { pos } = etatPos

  const [fiches, setFiches] = useState<Fiche[]>([])
  const [choisie, setChoisie] = useState<string | null>(null)
  const [carteDeplacee, setCarteDeplacee] = useState(false)
  const [vue, setVue] = useState<Vue>('liste')
  // 🗺️ L'onglet actif de la VUE CARTE (correction 4). Il commande le même
  // moteur que la liste — aucun chemin parallèle.
  const [modeCarte, setModeCarte] = useState<'mosquee' | 'manger' | 'activite' | null>(null)
  const [phraseVenue, setPhraseVenue] = useState('')

  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)
  const marqueurs = useRef<{ id: string; marker: Marker; rang: number }[]>([])
  const moiRef = useRef<Marker | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mosqueesFond = useRef<any[]>([])
  const plein = useRef<HTMLElement | null>(null)
  // Vrai pendant un recadrage déclenché par le CODE : ces mouvements ne
  // doivent pas faire apparaître « Revenir sur ma zone ».
  const mouvementProgramme = useRef(false)
  const [tiroirReplie, setTiroirReplie] = useState(false)
  const [glisseTiroir, setGlisseTiroir] = useState<number | null>(null)

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
        // « Revenir sur ma zone » n'apparaît QU'APRÈS un déplacement
        // VOLONTAIRE (correction 5) : le cadrage automatique (fitBounds au
        // changement d'onglet) passe par mouvementProgramme et ne compte pas.
        m.on('dragend zoomend', () => { if (!mouvementProgramme.current) setCarteDeplacee(true) })
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

  // 🥇 Le podium de la carte : 3 épingles exactement, classées par le
  // meilleur équilibre (lib/top3.mjs — poids commentés, moyenne bayésienne).
  // Sans onglet choisi, l'ordre du moteur fait foi, sans étiquettes.
  const podium = modeCarte
    ? top3(fiches.filter((f): f is Fiche & { id: string } => !!f.id), modeCarte)
    : fiches.filter((f) => !!f.id).slice(0, 3).map((f) => ({ ...f, etiquette: null as string | null }))

  // ── Une épingle par fiche. Rien d'autre ne peuple la carte ───────────
  useEffect(() => {
    const L = LRef.current
    if (!L || !mapRef.current) return
    marqueurs.current.forEach(({ marker }) => marker.remove())
    marqueurs.current = []
    const aPeindre = vue === 'carte' ? podium : fiches
    aPeindre.forEach((f, i) => {
      if (!f.id) return
      const mk = L.marker([f.lat, f.lng], { icon: epingle(L, i + 1, false), zIndexOffset: 500 - i }).addTo(mapRef.current)
      // 🛵 Itération 2, correction 4 : toucher une épingle OUVRE
      // L'ITINÉRAIRE, directement — arrêté au bord de la route, la fiche
      // est une étape de trop. Elle reste accessible via ℹ sur la liste.
      mk.on('click', () => lancerItineraire(f.lat, f.lng))
      marqueurs.current.push({ id: f.id, marker: mk, rang: i + 1 })
    })
    if (aPeindre.length) {
      try {
        // 🎯 Correction 5 : le cadrage inclut MA POSITION + les épingles,
        // avec un padding qui laisse la pilule d'onglets (haut) et le
        // tiroir (bas) hors du cadre utile — le bonhomme reste au centre.
        const points = aPeindre.map((f) => [f.lat, f.lng] as [number, number])
        if (pos) points.push([pos.lat, pos.lng])
        mouvementProgramme.current = true
        mapRef.current.fitBounds(L.latLngBounds(points), { paddingTopLeft: [44, 215], paddingBottomRight: [44, 250], maxZoom: 16, animate: true })
        setTimeout(() => { mouvementProgramme.current = false }, 600)
      } catch { /* une seule fiche : le cadrage automatique n'a pas de sens */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fiches, vue, modeCarte])

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
    <main ref={plein} className="autour-plein" data-vue={vue} style={hautDispo ? { height: hautDispo } : { height: '100dvh' }}>
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
      {vue === 'carte' ? (
        <button onClick={() => setVue('liste')} className="autour-retour" aria-label="Revenir à la liste des adresses">‹ Liste</button>
      ) : (
        <button onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = '/' }}
          className="autour-retour" aria-label="Revenir à l'écran précédent">‹ Retour</button>
      )}

      {/* 🧹 15 août — LA POSITION N'EST PLUS AFFICHÉE ICI.
          Mohamed : « une pastille de position TRONQUÉE : "📍 · ex…" — on ne
          lit même pas le nom de la ville — et DEDANS, une deuxième fois
          "Fontenay-sous-Bois · exacte ✓". La même information deux fois à
          3 cm d'écart. » Le bandeau fin du haut la porte déjà, en entier,
          sur toutes les pages du site. Une seule mention, jamais tronquée. */}

      <button onClick={recentrer} className="autour-recentrer" aria-label="Recentrer sur ma position">
        {etatPos.geoLoading ? '…' : (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="7.5" /><circle cx="12" cy="12" r="2.4" />
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
          </svg>
        )}
      </button>

      {/* 🗂 CORRECTION 4 — trois onglets discrets dans une pilule flottante,
          et rien d'autre. Chaque onglet relance LE MÊME moteur ; le podium
          (3 épingles + tiroir) suit. */}
      {vue === 'carte' && (
        <div className="carte-tabs" role="tablist" aria-label="Que cherches-tu ?">
          {([['mosquee', 'Prier'], ['manger', 'Manger'], ['activite', 'Que faire']] as const).map(([m, label]) => (
            <button key={m} role="tab" aria-selected={modeCarte === m} className={`carte-tab${modeCarte === m ? ' on' : ''}`}
              onClick={() => setModeCarte(m)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {vue === 'carte' && podium.length > 0 && (
        <div className={`carte-tiroir${tiroirReplie ? ' replie' : ''}`} aria-label="Les 3 meilleurs"
          onTouchStart={(e) => setGlisseTiroir(e.touches[0].clientY)}
          onTouchMove={(e) => {
            if (glisseTiroir == null) return
            const d = e.touches[0].clientY - glisseTiroir
            if (d > 45 && !tiroirReplie) { setTiroirReplie(true); setGlisseTiroir(null) }
            if (d < -45 && tiroirReplie) { setTiroirReplie(false); setGlisseTiroir(null) }
          }}
          onTouchEnd={() => setGlisseTiroir(null)}>
          <button className="carte-poignee-zone" aria-label={tiroirReplie ? 'Ouvrir le tiroir' : 'Réduire le tiroir'}
            onClick={() => setTiroirReplie((v) => !v)}>
            <span className="carte-poignee" aria-hidden />
          </button>
          <p className="carte-tiroir-titre">
            {modeCarte === 'manger' ? 'Les 3 meilleurs — distance · note · prix' : 'Les 3 meilleurs'}
          </p>
          {podium.map((f, i) => (
            <button key={f.id} className="carte-tiroir-ligne"
              /* 🛵 Correction 4 : le tap OUVRE L'ITINÉRAIRE, directement —
                 la fiche détail vit sur l'écran liste, derrière ℹ. */
              onClick={() => lancerItineraire(f.lat, f.lng)}>
              <span className="carte-tiroir-rang">{i + 1}</span>
              <span className="carte-tiroir-txt">
                {/* Jamais tronqué au point d'être illisible : 24 caractères puis … */}
                <span className="carte-tiroir-nom">{f.nom.length > 24 ? `${f.nom.slice(0, 24)}…` : f.nom}</span>
                <span className="carte-tiroir-sous">
                  <b>{typeMot((f as { famille?: string }).famille, modeCarte ?? 'manger')}</b>
                  {typeof f.note === 'number' ? ` · ★ ${f.note.toLocaleString('fr-FR')}` : ''}
                  {typeof f.prix === 'number' && f.prix > 0 ? ` · ${'€'.repeat(f.prix)}` : ''}
                  {' · '}<TrajetMin f={f} />
                </span>
              </span>
              <span className="carte-tiroir-go" aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2.5 21 21.5 12 17l-9 4.5z" /></svg>
                Y aller
              </span>
            </button>
          ))}
        </div>
      )}

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
      <section className="autour-feuille" aria-label="Résultats">
        {/* 🧹 LE GESTE DISPARAÎT. « tire pour voir » n'existe plus : ni
            poignée, ni trois positions, ni glissement à deviner. Un
            en-tête qui DIT ce qu'il contient, et un bouton qui DIT ce
            qu'il fait — ouvrir la carte en plein écran. */}
        <div className="autour-poignee">
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontWeight: 800, fontSize: 14, color: 'var(--foret)' }}>
            <span>{fiches.length ? `${fiches.length} adresse${fiches.length > 1 ? 's' : ''} autour de toi` : 'Recherche autour de toi…'}</span>
            <button onClick={() => setVue('carte')} className="autour-vers-carte">📍 Voir sur la carte</button>
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
              scooter
              fondu
              posInitiale={pos ? { lat: pos.lat, lng: pos.lng, ville: pos.label } : null}
              phraseInitiale={phraseVenue}
              // ► On répond avant qu'on demande : la recherche part dès que
              // la position est connue, sans rien taper ni rien tirer.
              chercheDesLOuverture={phraseVenue || !ouvertureSur || ouvertureSur === 'aucune' ? undefined : ouvertureSur}
              modeDemande={modeCarte}
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
