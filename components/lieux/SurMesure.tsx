'use client'

import { useEffect, useRef, useState } from 'react'
import { CRITERES_DEFAUT, lireDemande, relance, resumerCriteres, type Criteres } from '@/lib/criteres'
import { trajet, type Mode } from '@/lib/trajet'
import { ligneAlcool, mentionPermanente } from '@/lib/alcool.mjs'
import { choisirPourMoi, pistes as genererPistes, type Piste } from '@/lib/pistes'
import {
  PROFIL_VIDE, consigneProfilIA, ecrireProfil, lireProfil, ligneAllergie,
  mentionneAllergie, oublierProfil, profilVide, resumerProfil, type Profil,
} from '@/lib/profil'
import { computePrayerTimesFull } from '@/lib/prayerCalc'

// 🎯 LE SUR MESURE — « dis-moi ce que tu cherches ».
//
// Ordre de Mohamed, 15 août : « Pas un annuaire, pas une liste, pas dix
// adresses empilées. Le visiteur ne veut pas choisir parmi vingt
// restaurants : il veut qu'on lui dise où aller, ce soir, POUR LUI. »
//
// Ce composant REMPLACE l'ancien widget — il ne s'ajoute pas à côté.
//
// LE PARCOURS, dans l'ordre :
//   1. une vraie question, en grand, avec des exemples en filigrane ;
//   2. ce que nous avons compris, en boutons corrigeables d'un appui —
//      celui qui ne veut pas écrire clique directement, le QCM fait tout
//      le travail à lui seul ;
//   3. UNE relance ouverte au plus, courte et sautable, qui dit en trois
//      mots pourquoi elle demande (jamais un interrogatoire) ;
//   4. TROIS fiches complètes. Jamais plus. Un lien discret pour les
//      autres — la page ne se transforme pas en liste ;
//   5. le texte de l'IA, qui n'a le droit de dire QUE ce que les chiffres
//      ne disent pas, et qui s'écrit mot à mot.
//
// HONNÊTETÉ : chaque fiche porte la phrase que l'API lui a donnée. Le
// composant ne reformule jamais un statut halal, n'invente aucun plat,
// aucun horaire. Quand il n'y a rien, on le dit et on propose la sortie
// en un appui (§5) — jamais un écran vide, jamais une adresse inventée.

interface Avis { texte: string; note?: number; auteur?: string }
export interface Fiche {
  id?: string; nom: string; distanceM: number; lat: number; lng: number
  note?: number; nbAvis?: number; prix?: number; ouvert?: boolean; fermeA?: string
  adresse?: string; telephone?: string; mapsUri?: string
  photos?: string[]; attributionsPhotos?: string[]; avis?: Avis[]; resume?: string
  attributs?: Record<string, boolean | undefined>
  statut: string; alcool?: 'non' | 'inconnu'; source: 'spot' | 'google' | 'osm'
}

type Etape = 'question' | 'relance' | 'cherche' | 'resultat' | 'sans-position'

const EXEMPLES_FR = ['un kebab pas cher pas loin', 'un endroit calme pour dîner en famille', 'une pâtisserie ouverte après la prière']
const EXEMPLES_EN = ['a cheap kebab nearby', 'a quiet place for a family dinner', 'a bakery open after prayer']

// Ordre voulu par Mohamed : la prière d'abord, comme sur l'accueil.
// « Où dormir » n'est pas ici : ce n'est pas un besoin de l'instant, il
// reste dans les tuiles « Explorer <Ville> ».
const CAT_OPTS = [
  ['mosquee', '🕌 Prier', '🕌 Pray'], ['manger', '🍽️ Manger', '🍽️ Eat'], ['activite', '🎯 Que faire', '🎯 Things to do'],
] as const

const QUOI_OPTS = [
  ['pizza', 'Pizza', 'Pizza'], ['kebab', 'Kebab', 'Kebab'], ['burger', 'Burger', 'Burger'],
  ['oriental', 'Oriental', 'Middle Eastern'], ['asiatique', 'Asiatique', 'Asian'],
  ['petit-dejeuner', 'Petit-déj', 'Breakfast'], ['patisserie', 'Pâtisserie', 'Pastry'],
  ['peu-importe', 'Peu importe', 'Anything'],
] as const
// « COMMENT TU Y VAS ? » — et non « jusqu'où ? » : c'est le mode qui
// décide du rayon, pas l'inverse (§5.3).
const MODE_OPTS = [['pied', 'À pied', 'On foot'], ['voiture', 'En voiture', 'By car'], ['transports', 'En transports', 'By transit'], ['peu-importe', 'Peu importe', "Doesn't matter"]] as const
const BUDGET_OPTS = [['petit', 'Petit prix', 'Cheap'], ['moyen', 'Moyen', 'Mid-range'], ['peu-importe', 'Sans importance', "Doesn't matter"]] as const
const EXIG_OPTS = [['verifies', 'Vérifiées par la communauté', 'Community-verified only'], ['signales', 'Tout ce qui est signalé halal', 'Anything reported halal']] as const

/** Le mode écrit en toutes lettres — jamais un nombre de minutes seul. */
const LIB_MODE: Record<Mode, [string, string]> = {
  pied: ['à pied', 'on foot'], voiture: ['en voiture', 'by car'], transports: ['en transports', 'by transit'],
}

const euros = (p?: number) => (p ? '€'.repeat(Math.min(4, p)) : null)

export default function SurMesure({ posInitiale, destination, en = false, fondu = false }: {
  posInitiale?: { lat: number; lng: number; ville?: string | null } | null
  destination?: { lat: number; lng: number; nom: string } | null
  en?: boolean
  /** 🔗 Sur une fiche ville, le parcours se FOND dans la zone « Explorer »
   *  déjà en place : ni cadre, ni bandeau de titre — la zone en a un.
   *  « On n'empile pas, on intègre » (Mohamed, 15 août). */
  fondu?: boolean
}) {
  const [phrase, setPhrase] = useState('')
  const [crit, setCrit] = useState<Criteres>(CRITERES_DEFAUT)
  const [etape, setEtape] = useState<Etape>('question')
  const [ouvrirQcm, setOuvrirQcm] = useState(false)
  const [ouvrirPlus, setOuvrirPlus] = useState(false)
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [autres, setAutres] = useState<Fiche[]>([])
  const [voirAutres, setVoirAutres] = useState(false)
  const [source, setSource] = useState('')
  const [mode, setMode] = useState<Mode>('voiture')
  const [plafond, setPlafond] = useState(15)
  const [plusLoin, setPlusLoin] = useState<{ minutes: number; mode: Mode; nombre: number } | null>(null)
  const [posUtilisee, setPosUtilisee] = useState<'gps' | 'ip' | 'ville' | null>(null)
  const [prose, setProse] = useState('')
  const [aEcrit, setAEcrit] = useState(false)
  // ✨ L'aide au choix : quelle catégorie est ouverte, et les pistes du
  // moment. `null` = zone fermée, on n'a encore rien demandé.
  const [aide, setAide] = useState<{ cat: 'manger' | 'mosquee' | 'activite'; pistes: Piste[] } | null>(null)
  const [raisonIA, setRaisonIA] = useState('')
  // 👤 Le profil vit dans le TÉLÉPHONE. On le lit après le montage : le
  // serveur ne le connaît pas, et le HTML servi ne doit pas en dépendre.
  const [profil, setProfil] = useState<Profil>(PROFIL_VIDE)
  const [ouvrirProfil, setOuvrirProfil] = useState(false)
  const [proposerMemoire, setProposerMemoire] = useState<Partial<Profil> | null>(null)
  const [relaches, setRelaches] = useState<string[]>([])
  useEffect(() => { setProfil(lireProfil()) }, [])
  const [ex, setEx] = useState(0)
  const enCours = useRef(false)
  const EXEMPLES = en ? EXEMPLES_EN : EXEMPLES_FR

  // Les exemples défilent en filigrane : ils donnent envie de répondre —
  // « c'est la moitié de l'expérience » (§6).
  useEffect(() => {
    const id = setInterval(() => setEx((i) => (i + 1) % EXEMPLES.length), 3600)
    return () => clearInterval(id)
  }, [EXEMPLES.length])

  const t = (fr: string, an: string) => (en ? an : fr)

  function gps(delai: number): Promise<{ lat: number; lng: number } | null> {
    return new Promise((res) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return res(null)
      const to = setTimeout(() => res(null), delai)
      navigator.geolocation.getCurrentPosition(
        (p) => { clearTimeout(to); res({ lat: p.coords.latitude, lng: p.coords.longitude }) },
        () => { clearTimeout(to); res(null) },
        { timeout: delai - 500, maximumAge: 60_000 },
      )
    })
  }

  /** Le contexte réel : heure, jour, et prochaine prière quand on la sait.
   *  C'est lui qui fait qu'une piste à midi n'est pas celle de 23 h. */
  function contexte() {
    const d = new Date()
    const pos = destination ?? posInitiale
    return { heure: d.getHours(), jour: d.getDay(), priere: pos ? avantPriere(pos) : null }
  }

  function pistesDuMoment(cat: 'manger' | 'mosquee' | 'activite'): Piste[] {
    return genererPistes(cat, contexte(), en)
  }

  /** 👤 « Je retiens ? Tu n'auras plus à le redire. » On ne mémorise
   *  JAMAIS sans le demander : le profil appartient au visiteur. */
  function besoinDansLaPhrase(txt: string): Partial<Profil> | null {
    const t = txt.toLowerCase()
    const p: Partial<Profil> = {}
    if (/\bv[ée]gan|\bvegan\b/.test(t)) p.regime = 'vegane'
    else if (/\bv[ée]g[ée]tarien|\bvegetarian\b/.test(t)) p.regime = 'vegetarien'
    else if (/\bpesc[ée]tarien|\bpescatarian\b/.test(t)) p.regime = 'pescetarien'
    if (/sans gluten|gluten[- ]free|c[œoe]liaque|celiac/.test(t)) p.sansGluten = true
    if (/sans lactose|lactose[- ]free|sans produits laitiers/.test(t)) p.sansLactose = true
    if (/prot[ée]in|salle de sport|\bmuscu|\bgym\b|after (the )?gym|sportif/.test(t)) { p.objectif = 'proteine'; p.habitueSport = true }
    else if (/\bl[ée]ger\b|\blight\b/.test(t)) p.objectif = 'leger'
    return Object.keys(p).length ? p : null
  }

  /** Étape 1 → 2 : on lit la phrase, on montre ce qu'on a compris. */
  function comprendre(txt: string) {
    const c = lireDemande(txt)
    setCrit(c)
    setAEcrit(txt.trim().length > 0)
    const trouve = besoinDansLaPhrase(txt)
    // On ne propose de retenir que ce qui n'est pas DÉJÀ dans le profil.
    if (trouve && Object.entries(trouve).some(([k, v]) => (profil as unknown as Record<string, unknown>)[k] !== v)) {
      setProposerMemoire(trouve)
    }
    const r = relance(c, en)
    if (r) setEtape('relance')
    else lancer(c, txt.trim().length > 0)
  }

  async function lancer(c: Criteres, ecrit: boolean, forcerGPS = false) {
    if (enCours.current) return
    enCours.current = true
    setProse(''); setFiches([]); setAutres([]); setVoirAutres(false); setEtape('cherche')
    try {
      const exacte = destination ? null : await gps(forcerGPS ? 25_000 : 20_000)
      const pos = destination ?? exacte ?? posInitiale
      if (!pos) { setEtape('sans-position'); return }
      setPosUtilisee(destination ? 'ville' : exacte ? 'gps' : 'ip')

      const ac = new AbortController()
      const to = setTimeout(() => ac.abort(), 20_000)
      let corps: { fiches?: Fiche[]; autres?: Fiche[]; source?: string; mode?: Mode; plafondMin?: number; plusLoin?: { minutes: number; mode: Mode; nombre: number } | null; relaches?: string[] } = {}
      try {
        const r = await fetch('/api/lieux', {
          method: 'POST', signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.lat, lng: pos.lng, criteres: c, lang: en ? 'en' : 'fr', ecrit, profil }),
        })
        corps = r.ok ? await r.json() : {}
      } finally { clearTimeout(to) }

      const trois = corps.fiches ?? []
      setFiches(trois); setAutres(corps.autres ?? []); setSource(corps.source ?? '')
      setMode(corps.mode ?? 'voiture'); setPlafond(corps.plafondMin ?? 15); setPlusLoin(corps.plusLoin ?? null); setRelaches(corps.relaches ?? [])
      setEtape('resultat')
      if (trois.length) redigerIA(trois, c, corps.mode ?? 'voiture', c.categorie === 'mosquee' ? avantPriere(pos) : null)
    } finally { enCours.current = false }
  }

  /**
   * 🕌 LE TEMPS RESTANT AVANT LA PRIÈRE — « il te reste 23 minutes avant
   * Maghrib : celle-ci est à ≈ 6 minutes à pied, tu pries large ». C'est
   * ça qui n'existe nulle part ailleurs (§C de l'ordre du 15 août au
   * soir). Calculé sur place, zéro réseau ; `null` si on ne sait pas —
   * on ne devine jamais une heure de prière.
   */
  function avantPriere(pos: { lat: number; lng: number }): { nom: string; minutes: number } | null {
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const now = Date.now()
      const j = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date(now))
      const dem = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date(now + 86_400_000))
      const liste = (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((k) => ({ nom: k, d: j[k] as Date }))
      const suiv = liste.find((x) => x.d.getTime() > now) ?? { nom: 'Fajr', d: dem.Fajr as Date }
      return { nom: suiv.nom, minutes: Math.max(0, Math.round((suiv.d.getTime() - now) / 60_000)) }
    } catch { return null }
  }

  /** §3 — l'IA écrit CE QUE LES CHIFFRES NE DISENT PAS. */
  async function redigerIA(trois: Fiche[], c: Criteres, corpsMode: Mode, priere: { nom: string; minutes: number } | null) {
    // Le contexte contient les FAITS bruts : avis, attributs, horaires.
    // La porte refuse d'affirmer quoi que ce soit d'absent d'ici — la
    // qualité de la réponse EST la qualité de ces lignes.
    const contexte = trois.map((f, i) => {
      const at = f.attributs ?? {}
      const attrs = Object.entries({
        'sur place': at.surPlace, 'à emporter': at.aEmporter, livraison: at.livraison,
        'adapté aux familles': at.famille, terrasse: at.terrasse,
        'option végétarienne': at.vegetarien, 'réservation possible': at.reservation,
        accessible: at.accessible,
      }).filter(([, v]) => v === true).map(([k]) => k).join(', ')
      return [
        `LIEU ${i + 1} — ${f.nom}`,
        f.note != null ? `note ${f.note}/5 sur ${f.nbAvis ?? '?'} avis` : null,
        f.prix ? `niveau de prix ${f.prix}/4` : null,
        // §5.7 — « 1,4 km » ne veut rien dire à quelqu'un qui a faim.
        trajet(f.distanceM, corpsMode, false, !!destination),
        f.ouvert === true ? `ouvert${f.fermeA ? `, ferme à ${f.fermeA}` : ''}` : f.ouvert === false ? 'fermé actuellement' : null,
        attrs ? `attributs : ${attrs}` : null,
        f.resume ? `description : ${f.resume}` : null,
        f.avis?.length ? `avis de visiteurs : ${f.avis.map((a) => `« ${a.texte} »`).join(' ')}` : null,
        `statut halal : ${f.statut}`,
      ].filter(Boolean).join(' — ')
    })

    const demande = [
      en
        ? `The traveller asked: "${phrase || resumerCriteres(c, true).join(', ')}".`
        : `Le voyageur a demandé : « ${phrase || resumerCriteres(c, false).join(', ')} ».`,
      // 🕌 Pour la prière, la vraie question n'est pas « laquelle est la
      // mieux notée » mais « ai-je le temps d'y arriver ». On donne donc
      // le temps restant, et on demande de RAISONNER dessus.
      // 🔴 §7 — ce que l'IA n'a PAS le droit de faire. Le filtre est déjà
      // passé (elle ne voit que des lieux retenus), mais elle ne doit ni
      // minimiser, ni rassurer à tort, ni trancher une question
      // religieuse : elle signale un fait, elle n'arbitre pas.
      en
        ? 'Never minimise on alcohol or pork ("you can still go, just order the dish") and never issue a religious ruling — you are not a scholar. If information is missing, say so plainly instead of reassuring.'
        : "Ne minimise JAMAIS sur l'alcool ou le porc (pas de « tu peux y aller, prends juste le plat ») et ne tranche AUCUNE question religieuse — tu n'es pas un savant. Si une information manque, dis-le franchement au lieu de rassurer.",
      // 👤 §3 et §6 — ce que l'IA a le droit de dire du profil, et
      // surtout pas : on ne connaît pas les menus.
      consigneProfilIA(profil, en),
      priere
        ? (en
          ? `IMPORTANT: ${priere.minutes} minutes remain before ${priere.nom}. For EACH mosque, say plainly whether the traveller can get there in time given the travel time shown, and if not, say so. Never invent facilities (women's area, ablutions, parking): if they are not in the data, write that they are not documented.`
          : `IMPORTANT : il reste ${priere.minutes} minutes avant ${priere.nom}. Pour CHAQUE mosquée, dis franchement si le voyageur a le temps d'y arriver compte tenu du trajet affiché, et sinon dis-le. N'invente JAMAIS un équipement (espace femmes, ablutions, parking) : s'il n'est pas dans les données, écris qu'il n'est pas renseigné.`)
        : null,
      en
        ? `Write 2 to 4 short sentences PER PLACE. NEVER repeat what is already on screen (rating, distance, price, opening hours) — the traveller reads it above. Say only what the numbers do NOT say: the dish people mention in the reviews, the real atmosphere, the pitfall that avoids a wasted trip, the service. Then say in one sentence WHAT SETS THE THREE APART, so the traveller can choose. Every claim must come from the data below; when it comes from reviews, say "according to reviews". Never state a halal certification. Answer in English.`
        : `Écris 2 à 4 phrases courtes PAR LIEU. NE RÉPÈTE JAMAIS ce qui est déjà affiché (note, distance, prix, horaires) — le voyageur le lit au-dessus. Dis seulement ce que les chiffres ne disent pas : le plat que les gens citent dans les avis, l'ambiance réelle, le piège qui évite un déplacement raté, le service. Puis dis en une phrase CE QUI DISTINGUE LES TROIS, pour qu'il puisse choisir. Chaque affirmation doit venir des données ci-dessous ; quand ça vient des avis, dis « d'après les avis ». N'affirme jamais une certification halal. Réponds en français.`,
    ].filter(Boolean).join('\n')

    const ac = new AbortController()
    const to = setTimeout(() => ac.abort(), 35_000)
    try {
      const r = await fetch('/api/lieux/assistant', {
        method: 'POST', signal: ac.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: demande, contexte, site: en ? 'gohalaltravel' : 'voyageshalal' }),
      })
      if (r.ok && r.body) {
        const lec = r.body.getReader(); const dec = new TextDecoder()
        for (;;) {
          const { done, value } = await lec.read()
          if (done) break
          setProse((p) => p + dec.decode(value, { stream: true }))
        }
      }
    } catch { /* la liste suffit — la prose est un bonus */ } finally { clearTimeout(to) }
  }

  const compter = (cle: string) => {
    // Mesure §7 : le sur mesure se juge à un chiffre — les itinéraires.
    fetch('/api/lieux/mesure', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cle }) }).catch(() => {})
  }

  const maj = (p: Partial<Criteres>) => setCrit((c) => ({ ...c, ...p }))
  const majProfil = (p: Partial<Profil>) => setProfil((v) => { const n = { ...v, ...p }; ecrireProfil(n); return n })

  // ── styles partagés ──────────────────────────────────────────────
  const puce = (on: boolean): React.CSSProperties => ({
    minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
    border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.28)',
    background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
    color: on ? 'var(--or)' : 'var(--creme)', fontWeight: on ? 800 : 700, fontSize: 13.5,
  })
  const rangee: React.CSSProperties = { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }
  const label: React.CSSProperties = { color: 'rgba(253,250,243,0.6)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '12px 0 0' }

  return (
    <Cadre fondu={fondu} titre={destination ? `${t('À', 'In')} ${destination.nom}` : t('Près de moi', 'Near me')}>
        {/* ── 1. LA QUESTION OUVERTE ────────────────────────────── */}
        {!fondu && (
          <p style={{ color: 'var(--or)', fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            📍 {destination ? `${t('À', 'In')} ${destination.nom}` : t('Près de moi', 'Near me')}
          </p>
        )}
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 22, fontWeight: 900, margin: '6px 0 0', lineHeight: 1.25 }}>
          {destination
            ? t(`Que cherches-tu à ${destination.nom} ?`, `What are you looking for in ${destination.nom}?`)
            : t('Dis-moi ce que tu cherches.', 'Tell me what you are looking for.')}
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); comprendre(phrase) }} style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <input
            value={phrase} onChange={(e) => setPhrase(e.target.value)}
            placeholder={`« ${EXEMPLES[ex]} »`}
            aria-label={t('Décris ta recherche', 'Describe what you want')}
            style={{ flex: 1, minWidth: 200, minHeight: 52, borderRadius: 14, border: '1px solid rgba(253,250,243,0.25)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', padding: '0 14px', fontSize: 16 }}
          />
          <button type="submit" disabled={etape === 'cherche'}
            style={{ minHeight: 52, padding: '0 20px', borderRadius: 14, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 900, fontSize: 15, cursor: 'pointer', opacity: etape === 'cherche' ? 0.6 : 1 }}>
            {etape === 'cherche' ? '…' : t('Trouver', 'Find')}
          </button>
        </form>

        {/* §B.2 — « suggestions d'un appui : Manger · Mosquée · Que faire ».
            Elles lancent la recherche immédiatement : celui qui ne veut
            pas écrire est servi en un geste. Pour la mosquée, la relance
            porte sur le TEMPS (prier maintenant ?), pas sur le budget. */}
        <div style={{ display: 'flex', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
          {CAT_OPTS.map(([v, fr, an]) => (
            <button key={v}
              // TEMPS 1 : le bouton n'ouvre PAS une page et ne lance pas
              // encore la recherche — il ouvre l'aide au choix juste en
              // dessous. C'est ce qui le distingue des tuiles « Explorer »,
              // qui sont le catalogue et mènent aux pages du site.
              onClick={() => {
                setCrit((c) => ({ ...c, categorie: v }))
                setAide({ cat: v, pistes: pistesDuMoment(v) })
                setRaisonIA('')
                compter(`cat-${v}`)
              }}
              aria-pressed={aide?.cat === v} style={puce(aide?.cat === v)}>
              {t(fr, an)}
            </button>
          ))}
        </div>

        {/* ── 👤 MON PROFIL — replié, accessible d'un appui ─────────
            « Un sur mesure qu'il faut retaper à chaque fois n'est pas du
            sur mesure. » Le profil vit dans le téléphone : aucun compte,
            rien sur nos serveurs, et « oublier tout » efface vraiment. */}
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setOuvrirProfil((o) => !o)}
            style={{ background: 'none', border: 'none', color: profilVide(profil) ? 'rgba(253,250,243,0.6)' : 'var(--or)', textDecoration: 'underline', fontWeight: 800, fontSize: 13, cursor: 'pointer', minHeight: 44, padding: 0, textAlign: 'left' }}>
            👤 {profilVide(profil)
              ? t('Mon profil', 'My profile')
              : `${t('Mon profil', 'My profile')} : ${resumerProfil(profil, en).join(' · ')}`}
          </button>

          {ouvrirProfil && (
            <div className="board-pousse" style={{ marginTop: 8, padding: 12, borderRadius: 14, border: '1px solid rgba(253,250,243,0.16)' }}>
              <p style={label}>{t('Régime', 'Diet')}</p>
              <div style={rangee}>
                {([['aucun', 'Aucun', 'None'], ['vegane', 'Végane', 'Vegan'], ['vegetarien', 'Végétarien', 'Vegetarian'], ['pescetarien', 'Pescétarien', 'Pescatarian']] as const).map(([v, fr, an]) => (
                  <button key={v} onClick={() => majProfil({ regime: v })} aria-pressed={profil.regime === v} style={puce(profil.regime === v)}>{t(fr, an)}</button>
                ))}
              </div>
              <p style={label}>{t('Objectif', 'Goal')}</p>
              <div style={rangee}>
                {([['aucun', 'Peu importe', "Doesn't matter"], ['proteine', 'Protéiné / sportif', 'High-protein'], ['leger', 'Léger', 'Light'], ['pas-cher', 'Pas cher', 'Cheap']] as const).map(([v, fr, an]) => (
                  <button key={v} onClick={() => majProfil({ objectif: v })} aria-pressed={profil.objectif === v} style={puce(profil.objectif === v)}>{t(fr, an)}</button>
                ))}
              </div>
              <div style={rangee}>
                <button onClick={() => majProfil({ sansGluten: !profil.sansGluten })} aria-pressed={profil.sansGluten} style={puce(profil.sansGluten)}>{t('Sans gluten', 'Gluten-free')}</button>
                <button onClick={() => majProfil({ sansLactose: !profil.sansLactose })} aria-pressed={profil.sansLactose} style={puce(profil.sansLactose)}>{t('Sans lactose', 'Lactose-free')}</button>
                <button onClick={() => majProfil({ habitueSport: !profil.habitueSport })} aria-pressed={profil.habitueSport} style={puce(profil.habitueSport)}>{t('Je sors souvent de la salle', 'Often after the gym')}</button>
              </div>
              <p style={label}>{t('Ce que je ne mange pas', 'What I avoid')}</p>
              <input
                value={profil.exclusions}
                onChange={(e) => majProfil({ exclusions: e.target.value.slice(0, 120) })}
                placeholder={t('fruits de mer, arachide…', 'shellfish, peanuts…')}
                style={{ width: '100%', minHeight: 46, marginTop: 8, borderRadius: 12, border: '1px solid rgba(253,250,243,0.25)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', padding: '0 12px', fontSize: 15 }}
              />
              <p style={{ color: 'rgba(253,250,243,0.5)', fontSize: 11.5, margin: '10px 0 0', lineHeight: 1.5 }}>
                {t('Ce profil reste dans ton téléphone. Rien n’est envoyé sur nos serveurs, aucun compte n’est nécessaire.',
                   'This profile stays on your phone. Nothing is sent to our servers, no account needed.')}
              </p>
              <button onClick={() => { oublierProfil(); setProfil(PROFIL_VIDE); setProposerMemoire(null) }}
                style={{ marginTop: 8, background: 'none', border: 'none', color: 'rgba(253,250,243,0.65)', textDecoration: 'underline', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', minHeight: 44, padding: 0 }}>
                🗑 {t('Oublier tout', 'Forget everything')}
              </button>
            </div>
          )}

          {/* « Je retiens ? Tu n'auras plus à le redire. » */}
          {proposerMemoire && (
            <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <p style={{ flex: 1, minWidth: 170, color: 'rgba(253,250,243,0.9)', fontSize: 13, margin: 0 }}>
                {t('Je retiens ? Tu n’auras plus à le redire.', 'Shall I remember? You will not have to say it again.')}
              </p>
              <button onClick={() => { majProfil(proposerMemoire); setProposerMemoire(null); compter('profil-cree') }}
                style={{ ...puce(true), fontWeight: 900 }}>{t('Oui, retiens', 'Yes, remember')}</button>
              <button onClick={() => setProposerMemoire(null)}
                style={{ ...puce(false), border: 'none', background: 'none', color: 'rgba(253,250,243,0.6)', textDecoration: 'underline' }}>{t('non', 'no')}</button>
            </div>
          )}
        </div>

        {/* ── TEMPS 2 — L'IA AIDE À CHOISIR ─────────────────────────
            Les pistes viennent du CONTEXTE du moment : l'heure, la
            prochaine prière, le jour. À 23 h on ne propose pas « déjeuner
            en famille » ; 20 minutes avant Maghrib, on propose ce qui est
            atteignable à pied. Elles sont écrites dans lib/pistes.ts et
            non générées librement : une piste est du contenu comme un
            autre, et aucune ne peut mener à un lieu de boisson. */}
        {aide && etape !== 'cherche' && (
          <div className="board-pousse" style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid rgba(253,250,243,0.12)' }}>
            <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              {t('Je te propose', 'Suggestions')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
              {aide.pistes.map((pi) => (
                <button key={pi.id}
                  onClick={() => {
                    const c = { ...crit, ...pi.patch } as Criteres
                    setCrit(c); setAEcrit(false); setRaisonIA(''); compter('piste')
                    lancer(c, false)
                  }}
                  style={{ ...puce(false), justifyContent: 'flex-start', textAlign: 'left', minHeight: 48, padding: '0 14px', display: 'flex', alignItems: 'center', width: '100%' }}>
                  {t(pi.fr, pi.en)}
                </button>
              ))}
            </div>

            {/* ✨ Le bouton que Mohamed voulait retrouver. */}
            <button
              onClick={() => {
                const d = choisirPourMoi(contexte(), en)
                const c = { ...crit, ...d.criteres } as Criteres
                setCrit(c); setAEcrit(false); setRaisonIA(d.raison); compter('choisis-pour-moi')
                lancer(c, false)
              }}
              style={{ marginTop: 10, width: '100%', minHeight: 50, borderRadius: 14, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 900, fontSize: 14.5, cursor: 'pointer' }}>
              ✨ {t('Je ne sais pas — choisis pour moi', "I don't know — choose for me")}
            </button>
          </div>
        )}

        {/* ── 2. CE QU'ON A COMPRIS, CORRIGEABLE ────────────────── */}
        {(aEcrit || ouvrirQcm) && etape !== 'cherche' && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(253,250,243,0.12)' }}>
            {aEcrit && !ouvrirQcm && (
              <p style={{ color: 'rgba(253,250,243,0.85)', fontSize: 13.5, margin: 0, lineHeight: 1.5 }}>
                {t("J'ai compris", 'Understood')} : <strong style={{ color: 'var(--or)' }}>{resumerCriteres(crit, en).join(' · ') || t('tout', 'anything')}</strong>
                {' '}
                <button onClick={() => setOuvrirQcm(true)} style={{ background: 'none', border: 'none', color: 'var(--or)', textDecoration: 'underline', fontWeight: 800, fontSize: 13, cursor: 'pointer', minHeight: 44 }}>
                  {t('modifier', 'change')}
                </button>
              </p>
            )}
            {ouvrirQcm && (
              <>
                <p style={label}>{t('Quoi ?', 'What?')}</p>
                <div style={rangee}>
                  {QUOI_OPTS.map(([v, fr, an]) => (
                    <button key={v} onClick={() => maj({ quoi: v })} aria-pressed={crit.quoi === v} style={puce(crit.quoi === v)}>{t(fr, an)}</button>
                  ))}
                </div>
                <p style={label}>{t('Comment tu y vas ?', 'How are you getting there?')}</p>
                <div style={rangee}>
                  {MODE_OPTS.map(([v, fr, an]) => (
                    <button key={v} onClick={() => maj({ mode: v })} aria-pressed={crit.mode === v} style={puce(crit.mode === v)}>{t(fr, an)}</button>
                  ))}
                </div>
                <p style={label}>{t('Budget ?', 'Budget?')}</p>
                <div style={rangee}>
                  {BUDGET_OPTS.map(([v, fr, an]) => (
                    <button key={v} onClick={() => maj({ budget: v })} aria-pressed={crit.budget === v} style={puce(crit.budget === v)}>{t(fr, an)}</button>
                  ))}
                </div>
                <p style={label}>{t("L'exigence halal ?", 'Halal requirement?')}</p>
                <div style={rangee}>
                  {EXIG_OPTS.map(([v, fr, an]) => (
                    <button key={v} onClick={() => maj({ exigence: v })} aria-pressed={crit.exigence === v} style={puce(crit.exigence === v)}>{t(fr, an)}</button>
                  ))}
                </div>
                <button onClick={() => setOuvrirPlus((o) => !o)} style={{ ...puce(false), marginTop: 10, border: 'none', background: 'none', color: 'var(--or)', textDecoration: 'underline', padding: 0, fontSize: 13 }}>
                  {ouvrirPlus ? t('moins de critères', 'fewer filters') : t('plus de critères', 'more filters')}
                </button>
                {ouvrirPlus && (
                  <div style={rangee}>
                    {([['ouvertMaintenant', 'Ouvert maintenant', 'Open now'], ['sallePriere', 'Salle de prière à proximité', 'Prayer room nearby'],
                       ['sansAlcool', "Sans alcool servi", 'No alcohol served'], ['famille', 'Adapté aux familles', 'Family-friendly'],
                       ['vegetarien', 'Option végétarienne', 'Vegetarian option']] as const).map(([k, fr, an]) => (
                      <button key={k} onClick={() => maj({ [k]: !crit[k] } as Partial<Criteres>)} aria-pressed={!!crit[k]} style={puce(!!crit[k])}>{t(fr, an)}</button>
                    ))}
                  </div>
                )}
                <button onClick={() => lancer(crit, aEcrit)}
                  style={{ marginTop: 12, width: '100%', minHeight: 50, borderRadius: 14, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
                  {t('Trouver mes 3 adresses', 'Find my 3 places')}
                </button>
              </>
            )}
          </div>
        )}

        {!aEcrit && !ouvrirQcm && etape === 'question' && (
          <button onClick={() => setOuvrirQcm(true)}
            style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--or)', textDecoration: 'underline', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', minHeight: 44, padding: 0 }}>
            {t('ou choisis dans une liste', 'or pick from a list')}
          </button>
        )}

        {/* ── 3. LA RELANCE — une seule, sautable ───────────────── */}
        {etape === 'relance' && (() => {
          const r = relance(crit, en)
          if (!r) return null
          return (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(253,250,243,0.12)' }}>
              <p style={{ color: '#fdfaf3', fontSize: 14.5, fontWeight: 700, margin: 0, lineHeight: 1.45 }}>{r.question}</p>
              <div style={rangee}>
                {r.choix.map(([lib, patch]) => (
                  <button key={lib} onClick={() => { const c = { ...crit, ...patch }; setCrit(c); lancer(c, aEcrit) }} style={puce(false)}>{lib}</button>
                ))}
                <button onClick={() => lancer(crit, aEcrit)} style={{ ...puce(false), border: 'none', background: 'none', color: 'rgba(253,250,243,0.6)', textDecoration: 'underline' }}>
                  {t('passer', 'skip')}
                </button>
              </div>
            </div>
          )
        })()}

        {/* ── 4. CHARGEMENT : un squelette, jamais un blanc ─────── */}
        {etape === 'cherche' && (
          <div style={{ marginTop: 14 }} aria-live="polite">
            <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 13, margin: '0 0 10px' }}>
              {destination ? `${t('Recherche à', 'Searching in')} ${destination.nom}…` : t('Je cherche autour de toi…', 'Looking around you…')}
            </p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="squelette" style={{ height: 96, borderRadius: 14, marginBottom: 10, background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        )}

        {etape === 'sans-position' && (
          <p style={{ color: 'rgba(253,250,243,0.78)', fontSize: 13.5, marginTop: 12, lineHeight: 1.5 }}>
            {t('Je ne connais pas ta position — autorise-la, ou cherche ta ville dans la barre plus haut.',
               'I do not know where you are — allow location, or search your city in the bar above.')}
          </p>
        )}

        {/* ── 5. LES TROIS FICHES ───────────────────────────────── */}
        {etape === 'resultat' && posUtilisee === 'ip' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 12.5, margin: 0 }}>
              📍 {t('Position approximative', 'Approximate location')}{posInitiale?.ville ? ` : ${posInitiale.ville}` : ''} {t('(adresse IP)', '(IP address)')}
            </p>
            <button onClick={() => lancer(crit, aEcrit, true)} style={{ ...puce(false), fontSize: 12.5, fontWeight: 800, borderColor: 'rgba(201,168,76,0.55)', color: 'var(--or)' }}>
              🎯 {t('Ma position exacte', 'My exact location')}
            </button>
          </div>
        )}

        {/* §5.5 — ON ANNONCE LE NOMBRE AVANT D'ÉLARGIR. Le visiteur décide,
            au lieu de subir une liste qui s'allonge toute seule. Et §5.4 :
            deux adresses valent mieux que trois dont une absurde — on le
            dit quand on n'en a trouvé que deux. */}
        {etape === 'resultat' && fiches.length > 0 && fiches.length < 3 && plusLoin && (
          <p style={{ color: 'rgba(253,250,243,0.72)', fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
            {t(`Seulement ${fiches.length} adresse${fiches.length > 1 ? 's' : ''} à moins de ${plafond} min ${LIB_MODE[mode][0]} — on ne complète pas avec du lointain.`,
               `Only ${fiches.length} place${fiches.length > 1 ? 's' : ''} within ${plafond} min ${LIB_MODE[mode][1]} — we do not pad the list with far-away results.`)}
          </p>
        )}

        {etape === 'resultat' && fiches.length === 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ color: 'rgba(253,250,243,0.8)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              {t(`Aucune adresse à moins de ${plafond} min ${LIB_MODE[mode][0]} — on préfère te le dire plutôt que d'inventer.`,
                 `Nothing within ${plafond} min ${LIB_MODE[mode][1]} — we would rather say so than invent an address.`)}
            </p>
            <div style={rangee}>
              {plusLoin && (
                <button onClick={() => { const c = { ...crit, mode: plusLoin.mode }; setCrit(c); lancer(c, aEcrit) }} style={puce(false)}>
                  {t(`Élargir à ${plusLoin.minutes} min ${LIB_MODE[plusLoin.mode][0]} ? (${plusLoin.nombre} adresse${plusLoin.nombre > 1 ? 's' : ''})`,
                     `Widen to ${plusLoin.minutes} min ${LIB_MODE[plusLoin.mode][1]}? (${plusLoin.nombre} place${plusLoin.nombre > 1 ? 's' : ''})`)}
                </button>
              )}
              {crit.budget !== 'peu-importe' && (
                <button onClick={() => { const c = { ...crit, budget: 'peu-importe' as const }; setCrit(c); lancer(c, aEcrit) }} style={puce(false)}>
                  {t('Tous les budgets', 'Any budget')}
                </button>
              )}
              {crit.exigence === 'verifies' && (
                <button onClick={() => { const c = { ...crit, exigence: 'signales' as const }; setCrit(c); lancer(c, aEcrit) }} style={puce(false)}>
                  {t('Inclure les adresses signalées', 'Include reported places')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✨ Le raisonnement de « choisis pour moi » : ce qui distingue
            « on a deviné » de « on a choisi pour toi ». */}
        {raisonIA && etape === 'resultat' && (
          <p style={{ color: 'var(--or)', fontSize: 13.5, fontWeight: 700, marginTop: 12, lineHeight: 1.5 }}>✨ {raisonIA}</p>
        )}

        {fiches.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fiches.map((f, i) => <Carte key={f.id ?? i} f={f} en={en} mode={mode} destination={!!destination} allergie={mentionneAllergie(profil)} onItineraire={() => compter('itineraires')} />)}
          </div>
        )}

        {/* Un seul lien discret — la page ne devient pas une liste (§2). */}
        {autres.length > 0 && !voirAutres && (
          <button onClick={() => setVoirAutres(true)}
            style={{ marginTop: 12, background: 'none', border: 'none', color: 'rgba(253,250,243,0.6)', textDecoration: 'underline', fontSize: 13, cursor: 'pointer', minHeight: 44 }}>
            {t(`voir ${autres.length} autres adresses`, `see ${autres.length} more places`)}
          </button>
        )}
        {voirAutres && autres.map((f, i) => (
          <a key={f.id ?? i} href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer"
            onClick={() => compter('itineraires')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '10px 12px', borderRadius: 12, border: '1px solid rgba(253,250,243,0.14)', textDecoration: 'none' }}>
            <span style={{ flex: 1, color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, overflowWrap: 'anywhere' }}>{f.nom}</span>
            <span style={{ color: 'rgba(253,250,243,0.6)', fontSize: 12.5, whiteSpace: 'nowrap' }}>{trajet(f.distanceM, mode, en)}</span>
          </a>
        ))}

        {/* ── 6. CE QUE L'IA AJOUTE, mot à mot ──────────────────── */}
        {prose && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(253,250,243,0.14)' }}>
            <p style={{ color: 'rgba(253,250,243,0.9)', fontSize: 14, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>🌙 {prose}</p>
          </div>
        )}

        {/* §5 — ON DIT CE QU'ON A DÛ LÂCHER. « Un critère relâché en
            silence, c'est un mensonge. » */}
        {relaches.length > 0 && fiches.length > 0 && (
          <p style={{ color: 'var(--or)', fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
            ⚠ {t(`Aucune adresse ne cochait tout : j'ai dû laisser de côté ${relaches.join(', ')}.`,
                  `No place matched everything: I had to set aside ${relaches.join(', ')}.`)}
          </p>
        )}

        {/* 🔴 §6 — la phrase permanente, sobre, sous les résultats. */}
        {fiches.length > 0 && (
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 11.5, marginTop: 12, lineHeight: 1.5 }}>
            {mentionPermanente(en)}
          </p>
        )}

        {source === 'osm' && fiches.length > 0 && (
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 12, marginTop: 10 }}>
            {t('Résultats OpenStreetMap — les fiches Google Maps arrivent bientôt.', 'OpenStreetMap results — Google Maps details coming soon.')}
          </p>
        )}
    </Cadre>
  )
}

/** Le cadre : une carte mise en avant quand le parcours est autonome, un
 *  simple conteneur quand il se fond dans une zone qui a déjà son titre. */
function Cadre({ fondu, titre, children }: { fondu: boolean; titre: string; children: React.ReactNode }) {
  if (fondu) return <div style={{ margin: '0 auto', maxWidth: 700 }}>{children}</div>
  return (
    <section style={{ background: 'var(--nuit)' }} className="pt-2 pb-8 px-4" aria-label={titre}>
      <div className="max-w-3xl mx-auto" style={{ background: 'linear-gradient(150deg, rgba(27,67,50,0.5), rgba(255,255,255,0.05))', border: '1.5px solid rgba(201,168,76,0.55)', borderRadius: 18, padding: 16, boxShadow: '0 4px 22px rgba(0,0,0,0.25)' }}>
        {children}
      </div>
    </section>
  )
}

/** UNE FICHE = une carte qui respire, la photo la porte (§2 et §6). */
function Carte({ f, en, mode, destination, allergie, onItineraire }: { f: Fiche; en: boolean; mode: Mode; destination: boolean; allergie: boolean; onItineraire: () => void }) {
  const t = (fr: string, an: string) => (en ? an : fr)
  // §5.1 et §5.2 : le temps est TOUJOURS accompagné de son mode, et
  // jamais « 91 min à pied » — au-delà de 20 minutes, on bascule sur la
  // voiture. §5.6 : sur une fiche ville, le repère est le centre.
  const dist = trajet(f.distanceM, mode, en, destination)
  return (
    <article style={{ borderRadius: 16, border: '1px solid rgba(253,250,243,0.16)', overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
      {f.photos?.length ? (
        <div style={{ display: 'flex', gap: 2 }}>
          {f.photos.slice(0, 2).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt={f.nom} loading="lazy"
              style={{ flex: 1, width: '100%', height: 150, objectFit: 'cover', display: 'block', background: 'rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      ) : null}
      <div style={{ padding: 13 }}>
        {/* §2 — « les noms ne sont JAMAIS tronqués : la carte s'adapte au
            texte ». Pas de nowrap, pas d'ellipse : le nom passe à la ligne. */}
        <p style={{ color: '#fdfaf3', fontWeight: 900, fontSize: 16.5, margin: 0, lineHeight: 1.3, overflowWrap: 'anywhere' }}><bdi>{f.nom}</bdi></p>
        <p style={{ color: 'rgba(253,250,243,0.82)', fontSize: 13, margin: '5px 0 0', lineHeight: 1.5 }}>
          {/* Une note ne veut rien dire sans son nombre d'avis (§2). */}
          {f.note != null && <><strong style={{ color: 'var(--or)' }}>★ {f.note.toFixed(1)}</strong>{f.nbAvis != null && ` · ${f.nbAvis} ${t('avis', 'reviews')}`}{' · '}</>}
          {euros(f.prix) && <>{euros(f.prix)}{' · '}</>}
          {dist}
          {f.ouvert === true && <span style={{ color: '#7dd87d', fontWeight: 700 }}> · {t('ouvert', 'open')}{f.fermeA ? ` ${t("jusqu'à", 'until')} ${f.fermeA}` : ''}</span>}
          {f.ouvert === false && <span style={{ color: 'rgba(253,250,243,0.6)', fontWeight: 700 }}> · {t('fermé', 'closed')}</span>}
        </p>
        {f.adresse && <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 12.5, margin: '4px 0 0' }}>{f.adresse}</p>}
        <p style={{ color: 'var(--or)', fontSize: 12.5, fontWeight: 700, margin: '6px 0 0' }}>{f.statut}</p>
        {/* 🔴 §6 — une ligne alcool sur CHAQUE fiche, jamais optionnelle.
            Verte quand Google l'affirme, ambre quand on ne sait pas : on
            ne rassure jamais à tort. */}
        <p style={{ color: f.alcool === 'non' ? '#7dd87d' : 'rgba(253,250,243,0.72)', fontSize: 12.5, fontWeight: 700, margin: '3px 0 0' }}>
          {ligneAlcool(f.alcool ?? 'inconnu', en)}
        </p>
        {/* 🔴 LA LIGNE ALLERGIE — fixe, visible, jamais reformulée. Une
            allergie mal gérée peut tuer : nous ne connaissons pas la
            composition des plats, et nous le disons sur CHAQUE fiche. */}
        {allergie && (
          <p style={{ color: '#ffb4a2', fontSize: 12.5, fontWeight: 800, margin: '4px 0 0', lineHeight: 1.45 }}>
            ⚠ {ligneAllergie(en)}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`} target="_blank" rel="noopener noreferrer" onClick={onItineraire}
            style={{ minHeight: 46, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, background: 'var(--or)', color: 'var(--nuit)', fontWeight: 900, fontSize: 13.5, textDecoration: 'none' }}>
            🚶 {t('Itinéraire', 'Directions')}
          </a>
          {f.telephone && (
            <a href={`tel:${f.telephone.replace(/\s/g, '')}`}
              style={{ minHeight: 46, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.5)', color: 'var(--or)', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
              📞 {t('Appeler', 'Call')}
            </a>
          )}
        </div>

        {/* Attribution exigée par Google dès qu'on montre une photo. */}
        {f.attributionsPhotos?.length ? (
          <p style={{ color: 'rgba(253,250,243,0.45)', fontSize: 11, margin: '8px 0 0' }}>
            {t('Photos', 'Photos')} : {[...new Set(f.attributionsPhotos)].join(', ')} · Google
          </p>
        ) : null}
      </div>
    </article>
  )
}
