'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { localizedHref } from '@/lib/slugs'
import { ENVIES, envieById, niveauHalal } from '@/lib/envies'
import { mentionPaysMusulman } from '@/lib/paysHalalDefaut'
import { fetchCourt } from '@/lib/fetchCourt'
import { photoLargeur } from '@/lib/imageLargeur'
import PositionBadge from '@/components/location/PositionBadge'
import { meteoInstantanee, emojiMeteo, type Meteo } from '@/lib/meteo'

// 🎛️ BOARD VOYAGEUR (bento) — l'accueil devient un tableau de bord contextuel :
// des REPONSES deja calculees, jamais des menus. Il absorbe le Radar Priere
// (meme calcul local, memes couleurs de statut, meme honnetete « signale halal
// · a verifier ») et ajoute : la pepite du moment (meilleur spot communautaire
// avec media), le resto le plus proche, le compteur de spots autour, la bande
// de reels de la ville. Rendu 100 % client : le HTML indexe par Google (hero,
// sections serveur) ne change pas — SEO intact. Sans position : rien (repli =
// accueil classique).

interface Lieu { nom: string; lat: number; lng: number; source: 'osm' | 'communaute' | 'annuaire'; distM: number; spotId?: string; cuisine?: string; force?: number; halal?: string; mapsUrl?: string; avis?: number; id?: string
  /** montré sans étiquette halal, uniquement parce que le pays l'autorise */
  sansEtiquette?: boolean }
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
const itin = (lat: number, lng: number, mode: 'walking' | 'driving' = 'walking') =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`
/** Au-delà, « à pied » n'est plus une réponse : c'est une plaisanterie.
 *  25 min ≈ 2 km. Constaté sur une capture de Mohamed : la tuile annonçait
 *  « 81 min à pied » alors que Dhuhr se terminait dans 12 minutes, et
 *  proposait quand même un itinéraire piéton. */
const MARCHE_MAX = 25
/** ~50 km/h en ville et sur route, marges comprises. */
const routeMin = (distM: number) => Math.max(1, Math.round(distM / 833))

export interface BoardVedette { slug: string; nom: string; score: number; restaurants: number; mosquees: number; image: string | null }

export default function BoardVoyageur({
  vedettes = [],
  posInitiale = null,
  recherche = null,
}: {
  vedettes?: BoardVedette[]
  /** Le titre + la barre de recherche de la page, rendus PAR LE SERVEUR et
   *  glissés ici pour que l'accueil soit UN SEUL écran — Mohamed, 15 août :
   *  « les 2 premières pages doivent fusionner, garde le meilleur des 2 ».
   *  Le meilleur de l'ancienne page, c'est la recherche ; le meilleur de la
   *  nouvelle, c'est le tableau de bord. Ils vivent désormais ensemble. */
  recherche?: React.ReactNode
  /** Position approximative fournie par le serveur (adresse IP), pour que
   *  l'écran soit utile AVANT que le navigateur ait donné sa position.
   *  Voir lib/positionServeur.ts : c'est ce qui supprime l'attente et le
   *  saut de mise en page à l'ouverture. */
  posInitiale?: { lat: number; lng: number; ville: string | null } | null
}) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  // Un seul état de position pour tout l'écran, partagé avec le badge.
  const etatPos = useInstantPosition(en)
  // Tant que rien de mieux n'est arrivé, on part de ce que le serveur savait
  // déjà. Dès que le navigateur donne mieux — ville mémorisée, puis GPS —
  // `etatPos.pos` prend le relais et l'affichage s'affine sans rien casser.
  const pos = etatPos.pos ?? (posInitiale
    ? { lat: posInitiale.lat, lng: posInitiale.lng, label: posInitiale.ville ?? (en ? 'Your area' : 'Votre zone') }
    : null)
  const source = etatPos.pos ? etatPos.source : ('ip' as typeof etatPos.source)
  const [now, setNow] = useState(() => Date.now())
  const [mosquee, setMosquee] = useState<Lieu | null | undefined>(undefined)
  const [resto, setResto] = useState<Lieu | null | undefined>(undefined)
  const [spots, setSpots] = useState<FeedSpot[] | null>(null)
  // ⚠️ AVONS-NOUS PU CHERCHER ? Sans réponse d'AUCUNE source on ne peut pas
  // affirmer « aucun lieu connu ». Mais on ne peut pas non plus accuser la
  // connexion : Mohamed a photographié « Recherche impossible (pas de
  // connexion) » alors qu'il était en 4G et que le compteur « 23 spots
  // partagés » — servi par notre propre API — s'affichait juste à côté.
  // C'était OpenStreetMap qui n'avait pas répondu à temps, rien d'autre.
  // On ne parle donc plus de connexion : on dit ce qu'on sait.
  const [osmOk, setOsmOk] = useState(true)
  // Guide de la ville OU L'ON EST (compteurs reels), pour proposer mieux
  // qu'une vedette generique quand il n'y a pas encore de pepite autour.
  const [villeGuide, setVilleGuide] = useState<BoardVedette | null>(null)
  // Ville la plus proche selon l'annuaire : fiable meme quand le GPS ne
  // donne pas de nom (« Ma position ») ou quand le libelle est inconnu.
  const [villeProche, setVilleProche] = useState<string | null>(null)
  // 🇲🇦 SOMMES-NOUS DANS UN PAYS OÙ LA VIANDE EST HALAL PAR DÉFAUT ?
  // Notre annuaire le dit d'après la ville la plus proche. Ça ne rend aucun
  // restaurant « halal » : ça décide seulement si un lieu SANS étiquette
  // OpenStreetMap a le droit d'être montré, avec la mention honnête qui va
  // avec. Sans cette question, l'accueil annonçait « aucun kebab signalé
  // halal à moins de 12 km » à quelqu'un qui se tenait à Berkane.
  const [paysDefaut, setPaysDefaut] = useState(false)
  // 🍔 « J'ai envie de… » : l'envie du moment et le lieu correspondant le
  // plus proche (undefined = pas encore cherche, null = rien trouve).
  const [envie, setEnvie] = useState<string | null>(null)
  const [restoEnvie, setRestoEnvie] = useState<Lieu | null | undefined>(undefined)
  // Deux facons de choisir, demandees par les voyageurs : le plus PROCHE
  // (« je ne veux pas me prendre la tete ») ou le MEILLEUR compromis.
  const [mode, setMode] = useState<'proche' | 'meilleur'>('proche')
  const [avisEnvoye, setAvisEnvoye] = useState(false)
  // 🪗 L'ACCORDÉON — Mohamed, 15 août : « au début épuré, on voit le
  // minimum ; quand on clique sur un widget, il grossit et on travaille
  // dessus ». Au repos, chaque widget est une ligne fine. Un tap l'ouvre
  // SUR PLACE (animation courte), et c'est là que vivent ses filtres.
  const [ouvert, setOuvert] = useState<'priere' | 'manger' | null>(null)
  // 🌤 Météo — demandée par Mohamed : « en voyage, la température de la
  // position et pouvoir anticiper ». Elle ne bloque RIEN : la tuile n'existe
  // que si la réponse arrive, et son absence ne se voit pas.
  const [meteo, setMeteo] = useState<Meteo | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // La météo arrive quand elle arrive. Ce qui est gardé sur l'appareil
  // s'affiche tout de suite ; le réseau rafraîchit en silence derrière.
  useEffect(() => {
    if (!pos) return
    const gardee = meteoInstantanee(pos.lat, pos.lng, setMeteo)
    if (gardee) setMeteo(gardee)
  }, [pos])

  // ── Fenetre de priere (calcul local, zero reseau) ──
  // La méthode et l'école viennent du choix de l'utilisateur, comme dans le
  // bandeau du haut : forcer 3 en dur ici donnait deux horaires différents
  // sur le même écran quand la personne avait choisi une autre méthode.
  const fenetre = useMemo(() => {
    if (!pos) return null
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const today = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date(now))
      const tomorrow = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date(now + 86_400_000))
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
    // Notre propre annuaire : s'il répond, même avec zéro résultat, la
    // recherche A EU LIEU. C'est lui qui fait foi pour « aucun lieu connu ».
    let annuaireDone = false
    const mc: Lieu[] = [], rc: Lieu[] = []
    // ⚠️ PLUS AUCUN APPEL DIRECT À OPENSTREETMAP DEPUIS LE TÉLÉPHONE.
    // C'est ce que Mohamed a photographié deux fois à Berkane : les tuiles
    // qui dépendaient d'Overpass restaient vides ou en « … » pendant que
    // celles servies par nos propres API s'affichaient. Notre serveur essaie
    // trois miroirs et garde la réponse 30 minutes (/api/osm-restos).
    const p1 = fetchCourt(`/api/osm-restos?lat=${pos.lat}&lng=${pos.lng}&rayon=3000&quoi=tout`, { delai: 9000 })
      .then((r) => r.json())
      .then((d) => {
        if (d.erreur) return
        for (const m of (d.mosquees as { nom: string; lat: number; lng: number }[]) ?? []) {
          mc.push({ nom: m.nom, lat: m.lat, lng: m.lng, source: 'osm', distM: hav(pos.lat, pos.lng, m.lat, m.lng) })
        }
        for (const r of (d.restos as { nom: string; lat: number; lng: number; cuisine?: string; halal?: string }[]) ?? []) {
          // Cette tuile-ci reste sur la règle stricte : sans étiquette halal,
          // le lieu n'y entre pas. Le rattrapage « pays musulman » a sa
          // propre tuile et sa propre mention.
          if (!r.halal) continue
          rc.push({ nom: r.nom, lat: r.lat, lng: r.lng, source: 'osm', distM: hav(pos.lat, pos.lng, r.lat, r.lng), cuisine: r.cuisine, halal: r.halal })
        }
        osmDone = true
      }).catch(() => {})
    const p2 = fetchCourt(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=5`)
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
    const p3 = fetchCourt(`/api/annuaire?lat=${pos.lat}&lng=${pos.lng}&rayon=8&limit=40`)
      .then((r) => r.json())
      .then((j) => {
        annuaireDone = true
        if (j.ville?.slug) setVilleProche(j.ville.slug as string)
        setPaysDefaut(!!j.ville?.halalParDefaut)
        for (const l of (j.lieux as { nom: string; lat: number; lng: number; type: string; cuisine?: string; halal?: string }[]) ?? []) {
          // on garde cuisine et niveau halal : sans eux, la tuile n'affiche
          // qu'un nom (« Orangeraie »), qui ne dit rien au voyageur
          const lieu: Lieu = { nom: l.nom, lat: l.lat, lng: l.lng, source: 'annuaire', distM: hav(pos.lat, pos.lng, l.lat, l.lng), cuisine: l.cuisine, halal: l.halal }
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
      setOsmOk(osmDone || annuaireDone || mc.length > 0 || rc.length > 0)
      setMosquee(mc[0] ?? null); setResto(rc[0] ?? null)

      // 🔁 UNE SECONDE CHANCE, avec plus de patience.
      // 9 secondes suffisent en ville, pas toujours dans un village : notre
      // annuaire n'y a rien, et OpenStreetMap — la seule source qui
      // connaisse la mosquée du coin — est justement la plus lente.
      // On ne relance QUE si la première tentative a échoué ET qu'on n'a
      // rien à montrer : jamais de deuxième appel quand le premier a servi.
      if (!osmDone && mc.length === 0 && rc.length === 0) {
        fetchCourt(`/api/osm-restos?lat=${pos.lat}&lng=${pos.lng}&rayon=3000&quoi=tout`, { delai: 20000 })
          .then((r) => r.json())
          .then((d) => {
            if (cancelled || d.erreur) return
            const m2: Lieu[] = [], r2: Lieu[] = []
            for (const m of (d.mosquees as { nom: string; lat: number; lng: number }[]) ?? []) {
              m2.push({ nom: m.nom, lat: m.lat, lng: m.lng, source: 'osm', distM: hav(pos.lat, pos.lng, m.lat, m.lng) })
            }
            for (const r of (d.restos as { nom: string; lat: number; lng: number; cuisine?: string; halal?: string }[]) ?? []) {
              if (!r.halal) continue
              r2.push({ nom: r.nom, lat: r.lat, lng: r.lng, source: 'osm', distM: hav(pos.lat, pos.lng, r.lat, r.lng), cuisine: r.cuisine, halal: r.halal })
            }
            m2.sort(parDistance); r2.sort(parDistance)
            if (m2[0]) setMosquee(m2[0])
            if (r2[0]) setResto(r2[0])
            setOsmOk(true)
          })
          .catch(() => { /* on garde le message honnête déjà affiché */ })
      }
    })
    return () => { cancelled = true }
  }, [pos])

  useEffect(() => {
    const slug = villeProche || (pos ? slugifyVille(pos.label) : '')
    if (!slug || slug.length < 3) { setVilleGuide(null); return }
    let off = false
    fetchCourt(`/api/ville-counts?slug=${encodeURIComponent(slug)}${en ? '&en=1' : ''}`)
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
    fetchCourt(`/api/annuaire?lat=${pos.lat}&lng=${pos.lng}&rayon=12&type=resto&envie=${envie}&limit=25`)
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
            const a = await fetchCourt(`/api/avis?ids=${pool.slice(0, 20).map((c) => c.id).join(',')}`).then((r) => r.json())
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

  // ── 🇲🇦 LE RATTRAPAGE DES PAYS MUSULMANS ────────────────────────────────
  // Mesuré sur nos propres fiches : 19 villes sur 354 n'ont AUCUN restaurant,
  // et ce sont presque toutes des villes de pays musulmans (Berkane, Saïdia,
  // Taza, Larache, Kairouan, Peshawar, Abha, Homs…). Ce n'est pas qu'il n'y a
  // rien à manger là-bas : c'est que le tag OpenStreetMap `diet:halal` sert à
  // signaler une exception, et qu'à Berkane il ne distingue rien. Personne ne
  // l'écrit. Notre filtre était donc aveugle là où tout convient.
  //
  // On ne relâche le filtre QUE dans ces pays, QUE si les sources normales
  // n'ont rien donné, et JAMAIS en promettant du halal : la mention affichée
  // dit exactement ce qu'on sait — statut non renseigné, à vérifier sur place.
  // Le filtre de conformité du LIEU (bar, chicha, porc dans le nom) continue
  // de s'appliquer, lui, et les cuisines où le porc est la norme restent
  // écartées faute d'étiquette (voir lib/conformite.ts).
  const [restoPays, setRestoPays] = useState<Lieu | null | undefined>(undefined)
  const manqueResto = envie ? restoEnvie === null : resto === null
  useEffect(() => {
    if (!pos || !paysDefaut || !manqueResto) { setRestoPays(undefined); return }
    let off = false
    // ⚠️ ON N'APPELLE PLUS OPENSTREETMAP DEPUIS LE TÉLÉPHONE.
    // Deuxième capture de Mohamed à Berkane, en 4G : la tuile « KEBAB … »
    // tournait indéfiniment pendant que la mosquée s'affichait — et elle
    // vient de NOTRE annuaire. Overpass ne répondait tout simplement pas
    // depuis son appareil. Notre serveur, lui, essaie trois miroirs et
    // garde la réponse 30 minutes pour tout le quartier (/api/osm-restos).
    fetchCourt(`/api/osm-restos?lat=${pos.lat}&lng=${pos.lng}&rayon=4000${envie ? `&envie=${envie}` : ''}`, { delai: 12000 })
      .then((r) => r.json())
      .then((d) => {
        if (off) return
        const cands: Lieu[] = []
        for (const el of (d.restos as { nom: string; lat: number; lng: number; cuisine?: string; halal?: string; force?: number }[]) ?? []) {
          cands.push({
            nom: el.nom, lat: el.lat, lng: el.lng, source: 'osm',
            distM: hav(pos.lat, pos.lng, el.lat, el.lng),
            cuisine: el.cuisine, halal: el.halal, force: el.force || undefined,
            sansEtiquette: !el.halal, id: lieuId(el.lat, el.lng),
          })
        }
        // Une correspondance sûre passe devant un peut-être ; sinon distance.
        cands.sort((a, b) => (b.force ?? 0) - (a.force ?? 0) || a.distM - b.distM)
        setRestoPays(cands[0] ?? null)
      })
      .catch(() => { if (!off) setRestoPays(null) })
    return () => { off = true }
  }, [pos, paysDefaut, manqueResto, envie])

  // ── Spots communautaires (pepite + bande de reels + compteur) ──
  useEffect(() => {
    fetchCourt('/api/community/spots?limit=30')
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

  // Sans position (robot d'indexation, IP inconnue), on ne rend pas les
  // tuiles — mais JAMAIS une page sans titre ni recherche : le meilleur de
  // l'ancienne page reste servi, et Google voit toujours le H1.
  if (!pos || !fenetre) {
    return recherche ? (
      <section style={{ background: 'var(--nuit)', padding: '14px 14px 6px' }}>
        <div className="board-wrap" style={{ margin: '0 auto' }}>{recherche}</div>
      </section>
    ) : null
  }

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
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const t = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date(now))
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
  // Le rattrapage « pays musulman » ne passe qu'en DERNIER : un lieu signalé
  // halal, ou partagé par un voyageur, vaut toujours mieux qu'un lieu montré
  // sur la seule foi du pays.
  const bestResto = (envie ? restoEnvie : restoProche) ?? restoPays ?? null
  /** le rattrapage cherche encore : on ne dit surtout pas « aucun » */
  const rattrapageEnCours = paysDefaut && manqueResto && restoPays === undefined

  // (l'ancien « focus » automatique — la tuile qui grossissait selon
  // l'heure — a disparu : c'est l'utilisateur qui ouvre le widget qu'il
  // veut travailler. L'accordéon remplace la devinette.)

  // ☀️ LISIBILITÉ EN PLEIN JOUR.
  // Mesuré sur une capture du premier écran : 84 % des pixels étaient très
  // sombres, luminosité moyenne 38 sur 255, à peine 2 % de pixels clairs.
  // Dans une voiture au soleil, avec les reflets sur l'écran, les tuiles se
  // confondaient avec le fond — elles « ne ressortaient pas ».
  //
  // On ne change pas la palette (nuit + or, c'est l'identité). On augmente
  // l'ÉCART entre la tuile et le fond : fond de tuile trois fois plus clair,
  // bordure deux fois plus marquée, et texte secondaire remonté de 0,6 à
  // 0,78 d'opacité. La différence se voit au soleil, pas dans le noir.
  const T = {
    lab: { fontSize: 11, fontWeight: 800 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--or)', margin: 0 },
    tile: { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(253,250,243,0.22)', borderRadius: 18, padding: '13px 14px' },
    meta: { fontSize: 12.5, color: 'rgba(253,250,243,0.78)', margin: 0 },
  }

  return (
    <section style={{ background: 'var(--nuit)', padding: '14px 14px 6px' }} aria-label={en ? 'Your travel board' : 'Ton tableau de bord voyage'}>
      <div className="board-wrap" style={{ margin: '0 auto' }}>
        {/* Barre ville : 1 tap = GPS exact (le roaming fausse la geoloc IP) */}
        <div className="board-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <PositionBadge compact etat={etatPos} en={en} apresRefus={() => { window.location.href = '/horaires-priere' }} />
          {/* 🌤 LA TEMPÉRATURE SE MET LÀ OÙ L'ŒIL EST DÉJÀ.
              Je l'avais glissée dans la petite ligne Qibla, six tuiles plus
              bas : Mohamed ne l'a pas vue, et il avait raison de ne pas la
              chercher. Elle est maintenant collée à la position — même ligne,
              même regard : « Rabat · exacte ✓  ☀️ 30° ». */}
          {meteo?.maintenant && (
            <Link href="/meteo" aria-label={en ? 'Weather' : 'Météo'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minHeight: 44, padding: '0 10px', borderRadius: 999, textDecoration: 'none', border: '1px solid rgba(201,168,76,0.35)', flexShrink: 0 }}>
              <span style={{ fontSize: 17 }} aria-hidden>{emojiMeteo(meteo.maintenant.code)}</span>
              <span style={{ color: '#fdfaf3', fontWeight: 900, fontSize: 15 }}>{meteo.maintenant.temp}°</span>
            </Link>
          )}
          {/* 🧹 15 août : « Tout voir → » retiré — il menait à /spots, déjà
              servi par la tuile Spots ET l'onglet Spots de la barre du bas.
              Trois portes vers la même pièce, deux de trop. */}
        </div>

        {/* 🔎 Le titre et la recherche de l'ancienne page d'accueil, fondus
            DANS le tableau de bord : un seul écran, plus deux empilés. */}
        {recherche && <div style={{ marginBottom: 10 }}>{recherche}</div>}

        {/* ── Tuiles composables : la taille suit le moment (focus) ── */}
        {(() => {
          // 📿 TOUT LE RELIGIEUX DANS UNE SEULE ZONE — l'équation « épurée »
          // demandée par Mohamed le 15 août. Avant, la prière vivait à trois
          // endroits de l'écran : la grande tuile en haut, la ligne
          // Qibla + date hégirienne six tuiles plus bas, et la bande des
          // cinq horaires tout en bas. L'œil devait recoller les morceaux.
          // Les cinq horaires viennent maintenant SOUS la tuile prière,
          // dans la même zone visuelle : une question, une carte.
          // Rendu en simple <div> quand il vit DANS la carte prière (elle
          // navigue déjà vers /horaires-priere : pas de lien dans un lien),
          // en <Link> quand il est seul (bandeau prière compact).
          const horairesLigne = journee && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
              {journee.map(({ k, d }) => {
                const active = fenetre.key === k
                return (
                  <div key={k} style={{ textAlign: 'center', flex: 1, borderRadius: 12, padding: '6px 2px', background: active ? 'rgba(201,168,76,0.18)' : 'transparent', border: active ? '1px solid rgba(201,168,76,0.45)' : '1px solid transparent' }}>
                    <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: active ? 'var(--or)' : 'rgba(253,250,243,0.78)', margin: 0 }}>{k}</p>
                    <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: active ? '#fdfaf3' : 'rgba(253,250,243,0.9)', fontWeight: active ? 900 : 700, fontSize: 17, margin: '3px 0 0', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{fmtClock(d)}</p>
                  </div>
                )
              })}
            </div>
          )
          // Dans la carte prière : même contenu, séparé par un filet — UNE
          // seule boîte pour toute la question « où prier ».
          const horairesDansCarte = horairesLigne && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(253,250,243,0.12)' }}>
              {horairesLigne}
            </div>
          )
          const priereWide = (
            // Ouvert : un tap sur le fond REFERME (l'accordéon se replie là où
            // il s'est ouvert). Les actions vivent sur leurs propres boutons.
            <div className="board-hero board-pousse" role="button" tabIndex={0} aria-expanded onClick={() => setOuvert(null)} onKeyDown={(e) => { if (e.key === 'Enter') setOuvert(null) }}
              style={{ ...T.tile, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ ...T.lab, color: accent }}>
                  🕌 {fenetre.mode === 'current' ? (en ? 'Now' : 'Maintenant') : (en ? 'Next prayer' : 'Prochaine prière')} · {fenetre.key}
                </p>
                <p style={{ ...T.meta, fontWeight: 700 }}>{fmtClock(fenetre.start)} <span style={{ color: 'var(--or)' }} aria-hidden>▴</span></p>
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
              {/* ⚠️ « 81 MIN À PIED » N'EST PAS UNE RÉPONSE.
                  Capture de Mohamed, à Fezouane : la tuile proposait une
                  mosquée à 81 minutes de marche — avec un itinéraire piéton —
                  alors que Dhuhr se terminait dans 12 minutes. Le bandeau
                  disait pourtant « 🔴 Prie où tu peux » juste au-dessus :
                  l'écran se contredisait tout seul.
                  Au-delà de 25 minutes de marche, on ne fait pas semblant :
                  on dit la distance en voiture, on donne l'itinéraire en
                  voiture, et on met en avant la Qibla — parce que la vraie
                  réponse, à cette distance, c'est de prier sur place. */}
              {mosquee && (walkMin === null || walkMin <= MARCHE_MAX) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
                  <p style={{ flex: 1, minWidth: 170, color: '#fdfaf3', fontSize: 14, margin: 0, lineHeight: 1.45 }}>
                    {mosquee.source === 'communaute' ? '🤝' : mosquee.source === 'annuaire' ? '📒' : '🕌'} <strong><bdi>{mosquee.nom}</bdi></strong>
                    <span style={{ color: 'rgba(253,250,243,0.78)' }}> · {walkMin} {en ? 'min walk' : 'min à pied'} · {
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

              {mosquee && walkMin !== null && walkMin > MARCHE_MAX && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ color: '#fdfaf3', fontSize: 14, margin: 0, lineHeight: 1.45 }}>
                    {en
                      ? <>No mosque within walking distance. <span style={{ color: 'rgba(253,250,243,0.78)' }}>The nearest we know is <strong><bdi>{mosquee.nom}</bdi></strong>, {(mosquee.distM / 1000).toFixed(1)} km — about {routeMin(mosquee.distM)} min by car.</span></>
                      : <>Aucune mosquée à distance de marche. <span style={{ color: 'rgba(253,250,243,0.78)' }}>La plus proche que nous connaissons est <strong><bdi>{mosquee.nom}</bdi></strong>, à {(mosquee.distM / 1000).toFixed(1)} km — environ {routeMin(mosquee.distM)} min en voiture.</span></>}
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                    <Link href="/qibla" onClick={(e) => e.stopPropagation()}
                      style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 13.5, textDecoration: 'none' }}>
                      🧭 {en ? 'Pray here — Qibla' : 'Prier ici — Qibla'}
                    </Link>
                    <a href={itin(mosquee.lat, mosquee.lng, 'driving')} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.5)', color: 'var(--or)', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                      🚗 {en ? 'Directions' : 'Itinéraire'}
                    </a>
                  </div>
                </div>
              )}
              {mosquee === null && (
                <p style={{ ...T.meta, marginTop: 8 }}>
                  {/* Pas de lien Qibla ici : le grand bouton doré vit trois
                      cartes plus bas — deux Qibla sur un écran épuré, c'est
                      une de trop. */}
                  {osmOk
                    ? (en ? 'No known prayer place within 5 km — pray where you are.' : 'Aucun lieu de prière connu à moins de 5 km — prie où tu es.')
                    : (en ? 'Could not finish the search — try again in a moment.' : 'Recherche non terminée — réessaie dans un instant.')}
                </p>
              )}
              {horairesDansCarte}
            </div>
          )
          // Bandeau priere compact : tout tient sur une ligne quand la priere
          // n'est pas le moment dominant
          // Fermé : une ligne fine. Le tap OUVRE sur place — il ne navigue
          // plus : « quand on clique sur un widget, il grossit et on
          // travaille dessus » (Mohamed, 15 août).
          const priereSlim = (
            <button className="board-slim" onClick={() => setOuvert('priere')} aria-expanded={false}
              style={{ ...T.tile, width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 18 }} aria-hidden>🕌</span>
              <p style={{ flex: 1, color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, margin: 0, lineHeight: 1.35 }}>
                {fenetre.key} {fenetre.mode === 'current' ? (en ? 'ends in' : 'se termine dans') : (en ? 'in' : 'dans')} <strong style={{ color: 'var(--or)' }}>{fmtMin(minLeft)}</strong>
                {mosquee ? <span style={{ color: 'rgba(253,250,243,0.78)' }}> · <bdi>{mosquee.nom}</bdi> ({walkMin} min)</span> : null}
              </p>
              <span style={{ color: 'var(--or)', fontWeight: 800, fontSize: 13 }} aria-hidden>▾</span>
            </button>
          )
          // 🧠 L'ENVIE VIT DANS LA TUILE MANGER — Mohamed, 15 août : « manger
          // le plus proche, il faut que ça serve à quelque chose… je suis à
          // Noisy, j'aimerais une pizza bien notée et la plus proche ». La
          // question a trois curseurs : QUOI (pizza), COMMENT (bien notée ou
          // proche), OÙ (déjà connu). Les deux premiers se règlent ICI, dans
          // la tuile — pas dans une rangée de boutons flottante (retirée le
          // même jour au nom de la cohérence). Aujourd'hui « bien notée »
          // s'appuie sur les avis des voyageurs du site ; quand l'API Google
          // Maps sera débloquée, les notes Google se brancheront sur ces
          // mêmes curseurs sans rien changer à l'écran.
          const enviesChips = (compact: boolean) => (
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, marginTop: compact ? 8 : 10, WebkitOverflowScrolling: 'touch' }}>
              {envie && (
                <button onClick={() => setEnvie(null)}
                  style={{ flex: 'none', minHeight: 44, padding: '0 11px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.25)', background: 'transparent', color: 'rgba(253,250,243,0.75)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                  ✕ {en ? 'Any' : 'Tout'}
                </button>
              )}
              {ENVIES.map((e) => {
                const on = envie === e.id
                return (
                  <button key={e.id} onClick={() => setEnvie(on ? null : e.id)} aria-pressed={on}
                    style={{
                      flex: 'none', minHeight: 44, padding: compact ? '0 10px' : '0 13px', borderRadius: 999, cursor: 'pointer',
                      border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.28)',
                      background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                      color: on ? 'var(--or)' : 'var(--creme)',
                      fontWeight: on ? 800 : 700, fontSize: compact ? 12.5 : 13, whiteSpace: 'nowrap',
                    }}>
                    {e.emoji}{compact ? '' : ` ${e[en ? 'en' : 'fr']}`}
                  </button>
                )
              })}
            </div>
          )
          const modeChips = (
            <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 7, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {([['proche', '📍', en ? 'Closest' : 'La plus proche'], ['meilleur', '⭐', en ? 'Best rated' : 'La mieux aimée']] as const).map(([m, ic, lab]) => {
                const on = mode === m
                return (
                  <button key={m} onClick={() => setMode(m)} aria-pressed={on}
                    style={{
                      minHeight: 44, padding: '0 13px', borderRadius: 999, cursor: 'pointer',
                      border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.28)',
                      background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                      color: on ? 'var(--or)' : 'var(--creme)', fontWeight: on ? 800 : 700, fontSize: 13,
                    }}>
                    {ic} {lab}
                  </button>
                )
              })}
            </div>
          )
          const mangerWide = bestResto && (
            <div className="board-hero board-pousse" role="button" tabIndex={0} aria-expanded onClick={() => setOuvert(null)} onKeyDown={(e) => { if (e.key === 'Enter') setOuvert(null) }}
              style={{ ...T.tile, marginTop: 10, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <p style={T.lab}>{envieActive
                  ? [
                      `${envieActive.emoji} ${envieActive[en ? 'en' : 'fr']}`,
                      bestResto?.force === 1 ? (en ? 'maybe' : 'peut-être') : null,
                      mode === 'meilleur' ? (en ? 'best pick' : 'meilleur choix') : (en ? 'closest' : 'le plus proche'),
                    ].filter(Boolean).join(' · ')
                  : `🍽 ${en ? 'Eat' : 'Manger'}`}</p>
                <span style={{ color: 'var(--or)', fontWeight: 800 }} aria-hidden>▴</span>
              </div>
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
                    // Montré parce que le pays l'autorise : on le DIT.
                    if (bestResto.sansEtiquette) return mentionPaysMusulman(en)
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
                      // ÉCRITURE : volontairement sans délai maximum.
                      // Abandonner côté navigateur n'annulerait rien côté
                      // serveur, et l'avis partirait peut-être deux fois.
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
              {/* Les curseurs de la question : QUOI, puis COMMENT. */}
              {enviesChips(false)}
              {envieActive && modeChips}
            </div>
          )
          // Envie exprimee mais aucun resultat : on l'assume et on ouvre des
          // portes (guide de la ville, HalalGPT) au lieu de revenir en
          // silence sur la mosquee — le voyageur a pose une question.
          // Tant que le rattrapage « pays musulman » cherche encore, on ne
          // dit pas « aucun » : on n'en sait rien. Le vide ne s'affiche
          // qu'une fois TOUTES les sources revenues.
          const mangerVide = envieActive && !rattrapageEnCours && (
            <div className="board-pousse" style={{ ...T.tile, marginTop: 10, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)' }}>
              <p style={T.lab}>{envieActive.emoji} {envieActive[en ? 'en' : 'fr']}</p>
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 20, fontWeight: 900, margin: '4px 0 0', lineHeight: 1.2 }}>
                {/* ✍️ « Aucun pizza signalé » — photographié par Mohamed.
                    Le gabarit accordait au masculin pour les onze envies.
                    On met l'envie en apposition entre guillemets : plus
                    aucun accord à faire, et ça marche pour « Pizza » comme
                    pour « Café · petit-déj ». */}
                {en ? `No “${envieActive.en}” spot within 12 km` : `Aucune adresse « ${envieActive.fr} » à moins de 12 km`}
              </p>
              <p style={{ ...T.meta, marginTop: 4 }}>
                {en ? 'Our directory does not list one here — we would rather say so than send you somewhere wrong.' : 'Notre annuaire n\'en référence pas ici — on préfère te le dire plutôt que t\'envoyer au mauvais endroit.'}
              </p>
              {/* Changer d'envie sans quitter la carte : la question reste ouverte. */}
              {enviesChips(false)}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setEnvie(null)} style={{ minHeight: 44, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', background: 'transparent', color: 'var(--creme)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  🍽 {en ? 'Nearest halal instead' : 'Le plus proche à la place'}
                </button>
                {villeProche && (
                  <Link href={`/destinations/${villeProche}`} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: 'var(--creme)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    📖 {en ? 'All restos in the city' : 'Tous les restos de la ville'}
                  </Link>
                )}
                <a href={en ? '/halalgpt' : 'https://halalgpt.fr?utm_source=voyageshalal&utm_medium=passerelle&utm_campaign=board-accueil'} style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
                  🌙 {en ? 'Ask HalalGPT' : 'Demander à HalalGPT'}
                </a>
              </div>
            </div>
          )
          // Fermé : UNE ligne — l'essentiel (le plus proche, sa distance) et
          // rien d'autre. Les filtres n'apparaissent qu'à l'ouverture.
          // (La rangée d'emojis qui vivait ici a été vue par Mohamed :
          // « des ronds avec bout de pizza, on ne comprend rien, le widget
          // dépasse ». Il avait raison — des pictogrammes sans étiquette,
          // interdits par nos propres règles.)
          const mangerSlim = (
            <button className="board-slim" onClick={() => setOuvert('manger')} aria-expanded={false}
              style={{ ...T.tile, width: '100%', marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 18 }} aria-hidden>🍽</span>
              <p style={{ flex: 1, color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, margin: 0, lineHeight: 1.35 }}>
                {en ? 'Eat' : 'Manger'}
                {bestResto
                  ? <span style={{ color: 'rgba(253,250,243,0.78)' }}> · <bdi>{bestResto.nom}</bdi> ({bestResto.distM > 2000 ? `${(bestResto.distM / 1000).toFixed(1)} km` : `${walk(bestResto.distM)} min`})</span>
                  : (rattrapageEnCours || resto === undefined)
                    ? <span style={{ color: 'rgba(253,250,243,0.6)' }}> · …</span>
                    : <span style={{ color: 'rgba(253,250,243,0.6)' }}> · {osmOk ? (en ? 'none reported nearby' : 'aucun signalé à proximité') : (en ? 'search not finished' : 'recherche non terminée')}</span>}
              </p>
              <span style={{ color: 'var(--or)', fontWeight: 800, fontSize: 13 }} aria-hidden>▾</span>
            </button>
          )
          // Ouvert sans résultat : la carte reste un lieu de travail — on
          // choisit son envie ici, la recherche part aussitôt.
          const mangerOuvertVide = (
            <div className="board-pousse" style={{ ...T.tile, marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <p style={T.lab}>🍽 {en ? 'Eat' : 'Manger'}</p>
                <button onClick={() => setOuvert(null)} aria-label={en ? 'Close' : 'Fermer'} style={{ background: 'none', border: 'none', color: 'var(--or)', fontWeight: 800, cursor: 'pointer', minHeight: 44, padding: '0 6px' }}>▴</button>
              </div>
              <p style={{ ...T.meta, marginTop: 2 }}>
                {(rattrapageEnCours || resto === undefined) ? '…'
                  : osmOk ? (en ? 'None reported nearby — pick a craving, we search right away.' : 'Aucun signalé à proximité — choisis une envie, on cherche aussitôt.')
                  : (en ? 'Search not finished — try again in a moment.' : 'Recherche non terminée — réessaie dans un instant.')}
              </p>
              {enviesChips(false)}
            </div>
          )

          // UN SEUL widget pour les spots : le compte, un apercu legende,
          // une porte. Avant, trois zones differentes parlaient de spots
          // (grande photo, compteur, bande de vignettes) sans qu'on comprenne
          // ce qu'on regardait.
          const apercus = (pres?.pepite ? [pres.pepite, ...(pres?.reels ?? [])] : (pres?.reels ?? [])).slice(0, 3)
          const nSpots = pres ? (pres.proches.length || pres.autour.length || pres.total) : null
          const villeNom = pres?.autour[0]?.villeNom
          const spotsWidget = (
            <Link href={pres && !pres.proches.length && !pres.autour.length ? '/spots' : '/autour-de-moi'}
              style={{ ...T.tile, textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* 📐 COHÉRENCE (Mohamed, 15 août : « tous les éléments doivent
                  être cohérents ») : chaque carte suit la MÊME anatomie —
                  étiquette dorée en capitales, contenu, porte « → ». Cette
                  tuile était la seule à ouvrir sur un chiffre sans étiquette. */}
              <p style={T.lab}>💎 {en ? 'Spots' : 'Spots'}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--or)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{nSpots ?? '…'}</span>
                <span style={{ ...T.meta, fontSize: 13 }}>
                  {villeNom ? (en ? `in ${villeNom}` : `à ${villeNom}`) : (en ? 'shared by travelers' : 'partagés par des voyageurs')}
                </span>
              </div>
              {apercus.length > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {apercus.map((sp) => {
                    const img = sp.photos?.[0]?.startsWith('http') ? sp.photos[0] : sp.villeImage
                    return (
                      <span key={sp.id} style={{
                        flex: 1, height: 62, borderRadius: 10, overflow: 'hidden', position: 'relative',
                        // Aperçus de 62 px de haut, trois par ligne : 260 px
                        // de large suffisent largement.
                        backgroundImage: img ? `linear-gradient(180deg, rgba(11,26,15,0) 35%, rgba(11,26,15,0.92)), url(${photoLargeur(img, 130)})` : 'linear-gradient(180deg, #1d4a35, #0e2013)',
                        backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'flex-end',
                      }}>
                        {sp.video && <span style={{ position: 'absolute', top: 3, left: 4, fontSize: 10 }}>🎬</span>}
                        <span style={{ padding: '2px 4px', color: '#fdfaf3', fontSize: 8.5, fontWeight: 700, lineHeight: 1.2 }}>{sp.nom.slice(0, 22)}</span>
                      </span>
                    )
                  })}
                </div>
              )}
              {/* Une seule phrase : « spots partagés par des voyageurs » au-dessus
                  disait déjà qui les a vécus. Ici, juste la porte. */}
              <p style={{ ...T.meta, color: 'var(--or)', fontWeight: 800 }}>
                {en ? 'Explore →' : 'Explorer →'}
              </p>
            </Link>
          )

          // 🪗 L'ACCORDÉON : chaque widget est une ligne fine tant qu'on ne
          // lui a rien demandé. Un tap l'ouvre sur place ; un tap sur le
          // fond ouvert le referme. Un seul ouvert à la fois : l'écran
          // reste épuré même en travaillant.
          return (
            <>
              {ouvert === 'priere' ? priereWide : priereSlim}
              {ouvert === 'manger'
                ? (mangerWide || mangerVide || mangerOuvertVide)
                : mangerSlim}
              <div style={{ marginTop: 10 }}>
                {spotsWidget}
              </div>
            </>
          )
        })()}

        {/* 🧭 LA QIBLA, seule sur sa ligne — en doré plein (demandé par
            Mohamed : « mets le bouton de la Qibla plus visible »). La date
            hégirienne qui partageait cette ligne part sur /horaires-priere :
            belle information, mais pas une action — et l'écran épuré ne
            garde que ce qu'on vient y FAIRE. Les cinq horaires ont rejoint
            la carte prière, plus haut : le religieux vit dans UNE zone. */}
        {/* 📐 COHÉRENCE : l'aplat or plein est réservé à UNE action par
            écran — le bouton Rechercher. Cette ligne rejoint la famille des
            cartes (même fond, même rayon) avec la bordure or la plus
            marquée de l'écran : toujours la plus visible de sa rangée,
            sans crier plus fort que l'action principale. */}
        <Link href="/qibla" aria-label={en ? 'Qibla compass' : 'Boussole Qibla'}
          style={{
            ...T.tile, marginTop: 10, minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, textDecoration: 'none',
            border: '1.5px solid rgba(201,168,76,0.65)',
          }}>
          <span style={{ fontSize: 19, transform: `rotate(${qibla.deg}deg)`, display: 'inline-block', lineHeight: 1 }} aria-hidden>🧭</span>
          <span style={{ color: 'var(--or)', fontWeight: 900, fontSize: 14.5 }}>
            {qibla.deg}° · {qibla.dir}
            <span style={{ fontWeight: 800, fontSize: 12.5, marginLeft: 6, opacity: 0.85 }}>Qibla</span>
          </span>
          <span style={{ color: 'var(--or)', fontWeight: 800, marginLeft: 4 }} aria-hidden>→</span>
        </Link>

      </div>
    </section>
  )
}
