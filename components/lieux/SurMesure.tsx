'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CRITERES_DEFAUT, lireDemande, relance, resumerCriteres, type Categorie, type Criteres } from '@/lib/criteres'
import { lireIntention } from '@/lib/villesIndex'
import type { VilleLue } from '@/lib/lireVille.mjs'
import { trajet, type Mode } from '@/lib/trajet'
import { ligneAlcool, mentionPermanente } from '@/lib/alcool.mjs'
import { trisDisponibles, appliquer } from '@/lib/propositions.mjs'
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

// 🗺️ Les exemples APPRENNENT la barre unique : deux besoins autour de
// soi, une ville seule, un besoin dans une ville. C'est ainsi que le
// visiteur découvre qu'il n'a plus qu'un seul champ à remplir.
const EXEMPLES_FR = ['un kebab pas cher pas loin', 'Istanbul', 'une pâtisserie à Tirana', 'un endroit calme pour dîner en famille']
const EXEMPLES_EN = ['a cheap kebab nearby', 'Istanbul', 'a bakery in Tirana', 'a quiet place for a family dinner']

// Ordre voulu par Mohamed : la prière d'abord, comme sur l'accueil.
// « Où dormir » n'est pas ici : ce n'est pas un besoin de l'instant, il
// reste dans les tuiles « Explorer <Ville> ».
const CAT_OPTS = [
  ['mosquee', 'Prier', 'Pray'], ['manger', 'Manger', 'Eat'], ['activite', 'Que faire', 'Things to do'],
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

/** « Guide d'Istanbul », pas « Guide de Istanbul ». Une élision ratée se
 *  voit immédiatement — et tout ce que Mohamed lit est en français. */
const deVille = (nom: string) => (/^[aeiouyàâäéèêëîïôöûüh]/i.test(nom) ? `d'${nom}` : `de ${nom}`)

/**
 * Les icônes des tris, tracées en SVG. Le brief demandait Material Symbols :
 * c'est une police distante de plus, qui peut échouer en silence — ces trois
 * tracés font le même dessin pour zéro octet réseau. Aucun emoji au rendu.
 */
function IconeTri({ id }: { id: string }) {
  const c = { width: 17, height: 17, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (id === 'billet') return <svg {...c} viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="11" rx="2.5" /><circle cx="12" cy="12" r="2.6" /></svg>
  if (id === 'fleche') return <svg {...c} viewBox="0 0 24 24"><path d="M21 3 10.5 13.5M21 3l-6.5 18-3-7.5L3 10z" /></svg>
  return <svg {...c} viewBox="0 0 24 24"><path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.8 6.4 20l1.3-6.2L3 9.5l6.3-.7z" /></svg>
}

/* Les trois segments, mêmes règles : SVG en ligne, aucun emoji au rendu. */
function IconeCat({ id }: { id: string }) {
  const c = { width: 17, height: 17, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (id === 'mosquee') return <svg {...c} viewBox="0 0 24 24"><path d="M12 3c3.2 2.4 5 4.7 5 7.2V20H7v-9.8C7 7.7 8.8 5.4 12 3z" /><path d="M4 20h16M10 20v-3.4a2 2 0 0 1 4 0V20" /></svg>
  if (id === 'manger') return <svg {...c} viewBox="0 0 24 24"><path d="M7 3v7a2.5 2.5 0 0 1-2.5-2.5V3M4.5 3v18M7 3v18" transform="translate(1.5 0)" /><path d="M17 3c-1.7 1.5-2.5 3.4-2.5 5.5S15.3 12 17 12v9" /></svg>
  return <svg {...c} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z" /></svg>
}

export default function SurMesure({ posInitiale, destination: destinationProp, en = false, fondu = false, titrePage = false, onResultats, selectionId, onSelection, phraseInitiale, chercheDesLOuverture }: {
  posInitiale?: { lat: number; lng: number; ville?: string | null } | null
  destination?: { lat: number; lng: number; nom: string } | null
  en?: boolean
  /** 🔗 Sur une fiche ville, le parcours se FOND dans la zone « Explorer »
   *  déjà en place : ni cadre, ni bandeau de titre — la zone en a un.
   *  « On n'empile pas, on intègre » (Mohamed, 15 août). */
  fondu?: boolean
  /** 🏠 Sur l'accueil SEULEMENT : « Où prier, où manger halal — partout où
   *  tu voyages » devient le SOUS-TITRE de cette barre, plus une section
   *  séparée (Mohamed, 16 août). Le H1 reste donc rendu — Google le voit
   *  toujours — mais il ne coûte plus un écran entier. */
  titrePage?: boolean
  /** 🗺️ LA VUE CARTE — même moteur, autre affichage.
   *  Ordre de Mohamed, 15 août : « cette page appelle LE MÊME MOTEUR que
   *  partout ailleurs, une seule source de vérité, aucun chemin
   *  parallèle. » La page carte ne refait donc pas de recherche : elle
   *  écoute les fiches que ce composant vient de trouver, et pose une
   *  épingle par fiche. Rien d'autre ne peuple la carte. */
  onResultats?: (f: Fiche[]) => void
  /** L'épingle touchée sur la carte : la fiche correspondante se met en
   *  avant ici. C'est l'autre sens du lien. */
  selectionId?: string | null
  onSelection?: (id: string | null) => void
  /** La phrase apportée par l'accueil (?q=…) : on la lance toute seule. */
  phraseInitiale?: string
  /** ► SI ON SAIT OÙ JE SUIS, ON RÉPOND AVANT QUE JE DEMANDE.
   *  Ordre de Mohamed, 15 août : « On ouvre la page, on ne voit AUCUN
   *  résultat, et on nous demande de taper quelque chose. Alors que le
   *  site SAIT déjà où je suis. » Quand cette catégorie est fournie, la
   *  recherche part toute seule dès que la position est là — le champ ne
   *  sert plus qu'à PRÉCISER. */
  chercheDesLOuverture?: Categorie
}) {
  const router = useRouter()
  const [phrase, setPhrase] = useState('')
  // 🗺️ UNE SEULE BARRE. Quand la phrase désigne une ville, c'est elle qui
  // devient le point de départ de la recherche — sans que le visiteur
  // ait à changer de champ ni à retaper quoi que ce soit.
  const [villeChoisie, setVilleChoisie] = useState<{ lat: number; lng: number; nom: string } | null>(null)
  // Quand les deux lectures se défendent (« kebab Istanbul »), on ne
  // tranche pas : on propose les deux en un appui.
  const [ambigu, setAmbigu] = useState<VilleLue | null>(null)
  const destination = destinationProp ?? villeChoisie
  const [crit, setCrit] = useState<Criteres>(CRITERES_DEFAUT)
  const [etape, setEtape] = useState<Etape>('question')
  const [ouvrirQcm, setOuvrirQcm] = useState(false)
  const [ouvrirPlus, setOuvrirPlus] = useState(false)
  const [fiches, setFiches] = useState<Fiche[]>([])
  const [autres, setAutres] = useState<Fiche[]>([])
  const [voirAutres, setVoirAutres] = useState(false)
  const [source, setSource] = useState('')
  // 🔌 L'ÉTAT DE GOOGLE MAPS — « le widget le dit sobrement » (ordre du
  // 14 août, §2). L'API le renvoyait déjà ; personne ne le lisait. Sans
  // lui, un écran vide accusait la DISTANCE (« aucune adresse à moins de
  // 15 min ») alors que la vraie raison était qu'on n'avait pas pu
  // interroger Google. Dire « il n'y a rien » quand on veut dire « nous
  // n'avons pas pu demander » est un mensonge par raccourci.
  const [etatGoogle, setEtatGoogle] = useState<'ok' | 'vide' | 'muet' | 'sans-cle' | ''>('')
  /**
   * 🔴🔴 CHAQUE PANNE NOMME SA VRAIE CAUSE.
   *
   * Défaut du 15 août, et il a coûté une demi-journée : sur un 429 de NOTRE
   * serveur — notre propre limiteur anti-robot —, l'écran affichait
   * « Nous n'avons pas pu interroger Google Maps ». C'était faux : Google
   * n'avait jamais été appelé. On est allé fouiller la console Google pour
   * rien.
   *
   * « Un message d'erreur faux est pire qu'une panne : il envoie chercher
   * au mauvais endroit. » Donc : quota ≠ Google muet ≠ position refusée ≠
   * réseau coupé. Un état par cause, un message par état.
   */
  const [panne, setPanne] = useState<{ quoi: 'quota' | 'reseau'; secondes?: number } | null>(null)
  const [mode, setMode] = useState<Mode>('voiture')
  const [plafond, setPlafond] = useState(15)
  const [rayonKm, setRayonKm] = useState(20)
  const [posUtilisee, setPosUtilisee] = useState<'gps' | 'ip' | 'ville' | null>(null)
  const [prose, setProse] = useState('')
  const [aEcrit, setAEcrit] = useState(false)
  // ✨ L'aide au choix : quelle catégorie est ouverte, et les pistes du
  // moment. `null` = zone fermée, on n'a encore rien demandé.
  const [aide, setAide] = useState<{ cat: 'manger' | 'mosquee' | 'activite' } | null>(null)
  /**
   * ✨ LA PROPOSITION ACTIVE. Elle ne relance rien : elle trie les adresses
   * qu'on a déjà en main. Le clic est donc instantané, il ne consomme aucun
   * quota, et il ne peut PAS aboutir sur une liste vide — le filtre a été
   * appliqué avant même que le bouton n'apparaisse.
   */
  /**
   * 💶 📍 ⭐ LE TRI ACTIF — un seul à la fois, re-tap = retirer.
   * Brief du 17 août. La veille c'étaient des filtres cumulables : le
   * changement est voulu, un tri réordonne au lieu de cacher.
   */
  const [triActif, setTriActif] = useState<string | null>(null)
  /** Qui a compris la phrase : Claude, le parseur local, ou personne (rien
   *  tapé). C'est ce qui distingue « Claude a compris : hammam » de la
   *  simple mention « Recherche : hammam » — on ne signe pas l'IA quand
   *  c'est le repli local qui a travaillé. */
  const [parseSource, setParseSource] = useState<'claude' | 'local' | null>(null)
  const [raisonIA, setRaisonIA] = useState('')
  // 👤 Le profil vit dans le TÉLÉPHONE. On le lit après le montage : le
  // serveur ne le connaît pas, et le HTML servi ne doit pas en dépendre.
  const [profil, setProfil] = useState<Profil>(PROFIL_VIDE)
  const [ouvrirProfil, setOuvrirProfil] = useState(false)
  const [proposerMemoire, setProposerMemoire] = useState<Partial<Profil> | null>(null)
  const [relaches, setRelaches] = useState<string[]>([])
  /** Le mot demandé qu'aucune fiche ne porte — on le dit, on ne fait pas
   *  passer autre chose pour la réponse. */
  const [motManquant, setMotManquant] = useState<string | null>(null)
  /** ⏱️ Le temps qui reste avant la prière, au moment de la recherche.
   *  « Dhuhr dans 19 min : voici ce que tu peux atteindre avant. » */
  const [urgence, setUrgence] = useState<{ nom: string; minutes: number } | null>(null)
  /** La prochaine prière, quelle que soit la catégorie : les propositions
   *  doivent en tenir compte même quand on cherche où manger. */
  const [prochainePriere, setProchainePriere] = useState<{ nom: string; minutes: number } | null>(null)
  useEffect(() => { setProfil(lireProfil()) }, [])
  // 🔗 La recherche apportée par l'accueil part toute seule : « rien à
  // retaper » (§2.5). Une seule fois, au montage.
  const lancee = useRef(false)
  useEffect(() => {
    if (lancee.current || !phraseInitiale?.trim()) return
    lancee.current = true
    setPhrase(phraseInitiale)
    comprendre(phraseInitiale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseInitiale])

  // ► ON RÉPOND AVANT QU'ON DEMANDE. Dès que la position est connue et
  // qu'aucune phrase n'est venue de l'accueil, on lance la recherche de la
  // catégorie voulue. « Zéro vide : si un tiers de l'écran est noir et
  // muet, c'est que la page n'a pas fait son travail. »
  useEffect(() => {
    if (lancee.current || !chercheDesLOuverture) return
    // 🔴 ON N'ATTEND PLUS QU'UNE POSITION SOIT DÉJÀ LÀ. Au montage de
    // l'accueil, `posInitiale` (géoloc par adresse IP, calculée côté
    // serveur) est souvent nulle — et cette condition empêchait la
    // recherche d'ouverture de partir, donc aucune adresse sans clic.
    // `lancer` sait demander le GPS lui-même, et sait dire honnêtement
    // « je ne connais pas ta position » si on la lui refuse.
    if (phraseInitiale?.trim()) return
    lancee.current = true
    const c: Criteres = { ...CRITERES_DEFAUT, categorie: chercheDesLOuverture, mode: 'pied' }
    setCrit(c)
    // ⚠️ On n'ouvre PAS la zone de suggestions ici. Mohamed veut des
    // RÉSULTATS à l'ouverture, pas une liste de propositions à lire : « on
    // ouvre la page, on ne voit AUCUN résultat, et on nous demande de taper
    // quelque chose ». Les pistes restent accessibles par les trois
    // boutons — elles ne prennent pas la place de la réponse.
    lancer(c, false, false, null, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chercheDesLOuverture, posInitiale, destinationProp])
  const [ex, setEx] = useState(0)
  const enCours = useRef(false)
  /** 📍 OÙ LA RÉPONSE APPARAÎT. Mohamed, 15 août : « Je clique sur Trouver
   *  et rien ne semble se passer. Il faut que je descende tout en bas de la
   *  page pour trouver la réponse. » Un clic sans effet visible, c'est un
   *  clic qu'on croit perdu — et on réappuie, ou on part. */
  const zoneResultats = useRef<HTMLDivElement | null>(null)
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

  /**
   * 🗺️ ÉTAPE 0 — LA BARRE UNIQUE : de quoi parle cette phrase ?
   *
   * Ordre de Mohamed, 16 août : « UNE SEULE BARRE désormais. J'écris "un
   * kebab pas loin" → recherche autour de moi. J'écris "Istanbul" → ouvre
   * le guide de la ville. J'écris "une pâtisserie à Tirana" → recherche
   * dans cette ville. Si c'est ambigu, elle propose les deux en un appui. »
   *
   * Rend `true` quand la phrase a été entièrement traitée ici (guide
   * ouvert, ou question posée) et qu'il n'y a plus rien à chercher.
   */
  function aiguiller(txt: string): boolean {
    if (destinationProp) return false // sur une fiche ville, le lieu est déjà fixé
    const i = lireIntention(txt)
    if (i.quoi === 'guide') {
      // Rien d'autre que le nom d'une ville : c'est un guide qu'on veut.
      router.push(`/destinations/${i.ville.slug}`)
      return true
    }
    if (i.quoi === 'ambigu') { setAmbigu(i.ville); return true }
    if (i.quoi === 'dans-ville') {
      const v = { lat: i.ville.lat, lng: i.ville.lng, nom: i.ville.nom }
      setVilleChoisie(v)
      setAmbigu(null)
      comprendre(i.ville.reste, v)
      return true
    }
    // Aucune ville : on repart de la position du visiteur.
    if (villeChoisie) setVilleChoisie(null)
    setAmbigu(null)
    return false
  }

  /**
   * ✳️ LE TEXTE LIBRE PASSE PAR CLAUDE — ET PAR LUI SEUL.
   *
   * Brief du 17 août : « Claude n'est appelé QUE pour le texte libre.
   * Chips et segments = requête directe, 0 latence, 0 coût. » Et :
   * « Fallback si Claude échoue ou dépasse 3 s : matching mots-clés local —
   * la recherche ne doit JAMAIS être bloquée par l'API. »
   *
   * Le parseur local (lireDemande) tourne D'ABORD, dans tous les cas :
   * c'est lui le filet, et il donne une base même si le réseau meurt au
   * milieu. Claude ne fait qu'AFFINER par-dessus. Le résultat rejoint le
   * même pipeline que les boutons — aucun chemin parallèle.
   */
  async function parseClaude(txt: string): Promise<{ intent: string; categorie: string | null; tri: string | null; budget_max: number | null; contraintes: string[] } | null> {
    // Cache de session : la même phrase ne se re-parse pas, et le retour
    // arrière redevient instantané.
    const cle = `vh_parse:${txt.toLowerCase()}`
    try { const c = sessionStorage.getItem(cle); if (c) return JSON.parse(c) } catch { /* stockage privé */ }
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 3000)
    try {
      const r = await fetch('/api/lieux/comprendre', {
        method: 'POST', signal: ac.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte: txt }),
      })
      if (!r.ok) return null
      const j = await r.json()
      try { sessionStorage.setItem(cle, JSON.stringify(j)) } catch { /* plein */ }
      return j
    } catch { return null } finally { clearTimeout(t) }
  }

  async function comprendre(txt: string, ville?: { lat: number; lng: number; nom: string } | null) {
    if (ville === undefined && aiguiller(txt)) return
    // 1. Le parseur LOCAL d'abord — le filet qui ne peut pas casser.
    const c = lireDemande(txt)
    let parClaude = false
    // Le tri demandé dans la phrase (« pas cher ») doit SURVIVRE au départ de
    // la recherche : il est passé à `lancer`, qui l'aurait sinon remis à
    // zéro en réinitialisant l'écran.
    let triVoulu: string | null = null
    // 2. Claude affine, seulement s'il y a du texte, et sans jamais bloquer.
    if (txt.trim()) {
      const p = await parseClaude(txt)
      if (p) {
        parClaude = true
        if (p.intent === 'mosque') c.categorie = 'mosquee'
        else if (p.intent === 'activity') c.categorie = 'activite'
        else if (p.intent === 'food') c.categorie = 'manger'
        // ⚠️ La catégorie parsée remplace les mots SEULEMENT si elle existe :
        // et elle part chez Google TELLE QUELLE — jamais « halal » accolé,
        // c'est la règle « le type d'abord, le halal ensuite » et le test
        // test-requete la verrouille. Le brief suggérait « sushi halal » ;
        // on a déjà mesuré que ce collage ramène des traiteurs.
        if (p.categorie) c.motsCles = p.categorie
        if (p.budget_max === 1) c.budget = 'petit'
        else if (p.budget_max === 2) c.budget = 'moyen'
        if (p.contraintes?.some((x: string) => /ouvert/i.test(x))) c.ouvertMaintenant = true
        triVoulu = p.tri === 'cheap' ? 'pas-cher' : p.tri === 'near' ? 'proche' : p.tri === 'rating' ? 'bien-note' : null
      }
    }
    setParseSource(txt.trim() ? (parClaude ? 'claude' : 'local') : null)
    setCrit(c)
    setAEcrit(txt.trim().length > 0)
    const trouve = besoinDansLaPhrase(txt)
    // On ne propose de retenir que ce qui n'est pas DÉJÀ dans le profil.
    if (trouve && Object.entries(trouve).some(([k, v]) => (profil as unknown as Record<string, unknown>)[k] !== v)) {
      setProposerMemoire(trouve)
    }
    // 🔴 AUCUNE QUESTION INTERMÉDIAIRE. JAMAIS. (Brief du 17 août — et déjà
    // le reproche du 15 : « seul ou en famille ? » bloquait le visiteur
    // devant un écran qu'il croyait en panne.) La relance est morte : on
    // cherche tout de suite, et les tris affinent après.
    const r = null as ReturnType<typeof relance> | null
    if (r) {
      setEtape('relance')
      // 🔴 « Je clique sur Trouver, RIEN ne se passe. » La cause : quand
      // une relance était nécessaire, la question s'affichait plus bas
      // dans la page et la vue ne bougeait pas. Le clic AVAIT été pris,
      // mais rien ne le montrait — donc rien ne s'était passé, du point de
      // vue du seul qui compte. La vue descend maintenant sur la réponse
      // dans TOUS les cas, question comprise.
      requestAnimationFrame(() => zoneResultats.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } else lancer(c, txt.trim().length > 0, false, ville, false, triVoulu)
  }

  async function lancer(c: Criteres, ecrit: boolean, forcerGPS = false, ville?: { lat: number; lng: number; nom: string } | null, silencieux = false, triInitial: string | null = null) {
    if (enCours.current) return
    enCours.current = true
    setProse(''); setFiches([]); setAutres([]); setVoirAutres(false); setPanne(null); setTriActif(triInitial); setEtape('cherche')
    // Dès le clic, la vue descend sur la zone de réponse : le squelette y
    // est déjà, donc le visiteur SAIT que son geste a été pris en compte.
    //
    // 🔴 SAUF À L'OUVERTURE. Mesuré le 16 août : la recherche automatique
    // faisait défiler la page toute seule, et la carte-réponse se
    // retrouvait 894 px AU-DESSUS de l'écran — le visiteur arrivait sur du
    // vide. On ne déplace la vue que sur un geste : personne n'a demandé à
    // descendre.
    if (!silencieux) requestAnimationFrame(() => zoneResultats.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    try {
      // `ville` est passée quand la barre unique vient de reconnaître une
      // ville dans la phrase : l'état React n'est pas encore à jour.
      const lieu = ville ?? destination
      const exacte = lieu ? null : await gps(forcerGPS ? 25_000 : 20_000)
      const pos = lieu ?? exacte ?? posInitiale
      if (!pos) { setEtape('sans-position'); return }
      setPosUtilisee(lieu ? 'ville' : exacte ? 'gps' : 'ip')

      const ac = new AbortController()
      const to = setTimeout(() => ac.abort(), 20_000)
      let corps: { fiches?: Fiche[]; autres?: Fiche[]; source?: string; etatGoogle?: 'ok' | 'vide' | 'muet' | 'sans-cle'; mode?: Mode; plafondMin?: number; rayonKm?: number; relaches?: string[]; motManquant?: string | null } = {}
      try {
        const r = await fetch('/api/lieux', {
          method: 'POST', signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.lat, lng: pos.lng, criteres: c, lang: en ? 'en' : 'fr', ecrit, profil }),
        })
        if (r.status === 429) {
          // NOTRE plafond, pas celui de Google. On le dit tel quel, avec le
          // délai réel renvoyé par le serveur.
          const j = await r.json().catch(() => ({})) as { secondes?: number }
          const dEntete = Number(r.headers.get('Retry-After') ?? 0)
          setPanne({ quoi: 'quota', secondes: j.secondes || dEntete || 0 })
          setEtape('resultat')
          return
        }
        corps = r.ok ? await r.json() : {}
      } catch {
        // Réseau coupé, requête abandonnée : c'est NOUS qui n'avons pas pu
        // partir, pas Google qui n'a pas répondu.
        setPanne({ quoi: 'reseau' })
        setEtape('resultat')
        return
      } finally { clearTimeout(to) }

      const trois = corps.fiches ?? []
      setFiches(trois); setAutres(corps.autres ?? []); setSource(corps.source ?? ''); setEtatGoogle(corps.etatGoogle ?? '')
      // La carte se peuple d'ici, et de nulle part ailleurs.
      onResultats?.(trois)
      setMode(corps.mode ?? 'voiture'); setPlafond(corps.plafondMin ?? 15); setRayonKm(corps.rayonKm ?? 20); setRelaches(corps.relaches ?? []); setMotManquant(corps.motManquant ?? null)
      setEtape('resultat')
      // La vue se place sur la réponse, sans que le visiteur ait à la
      // chercher. `requestAnimationFrame` : on attend que les fiches soient
      // réellement dessinées, sinon on défile vers du vide.
      if (!silencieux) requestAnimationFrame(() => {
        setTimeout(() => zoneResultats.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      })
      // Calculée dans tous les cas : c'est elle qui permet de proposer
      // « atteignable avant Maghrib » sur une recherche de restaurant.
      const prTous = avantPriere(pos)
      setProchainePriere(prTous)
      const pr = c.categorie === 'mosquee' ? prTous : null
      // Moins de 30 minutes : on le DIT, et on met en avant ce qui est
      // atteignable à temps. Rater une prière parce qu'on a suivi notre
      // conseil serait le pire service qu'on puisse rendre.
      setUrgence(pr && pr.minutes <= 30 ? pr : null)
      if (trois.length) redigerIA(trois, c, corps.mode ?? 'voiture', pr, !!lieu)
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
  async function redigerIA(trois: Fiche[], c: Criteres, corpsMode: Mode, priere: { nom: string; minutes: number } | null, depuisVille: boolean) {
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
        trajet(f.distanceM, corpsMode, false, depuisVille),
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
    color: on ? 'var(--or)' : 'var(--creme)', fontWeight: on ? 800 : 700, fontSize: 14,
  })
  const rangee: React.CSSProperties = { display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }
  // ✨ Ce qu'on a en main, et ce qu'on peut honnêtement en proposer.
  // `autres` compte : une proposition qui ne trierait que trois adresses
  // n'aurait presque jamais de quoi exister.
  const toutes = useMemo(() => [...fiches, ...autres], [fiches, autres])
  const lesTris = useMemo(() => trisDisponibles(toutes), [toutes])
  /** La liste affichée : réordonnée par le tri actif — jamais amputée. Un
   *  tri qui ferait disparaître des adresses redeviendrait un filtre. */
  const aVoir = useMemo(() => (triActif ? appliquer(toutes, triActif).slice(0, 6) : fiches), [triActif, toutes, fiches])

  /** Le délai, écrit comme on le dirait. Zéro seconde connue → « bientôt ». */
  function attente(secondes: number | undefined, anglais: boolean): string {
    const s = Number(secondes ?? 0)
    if (!s) return anglais ? 'shortly' : 'dans un instant'
    if (s < 90) return anglais ? `in ${s} seconds` : `dans ${s} secondes`
    const m = Math.ceil(s / 60)
    return anglais ? `in ${m} minutes` : `dans ${m} minutes`
  }

  const label: React.CSSProperties = { color: 'rgba(253,250,243,0.6)', fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '12px 0 0' }

  return (
    <Cadre fondu={fondu} titre={destination ? `${t('À', 'In')} ${destination.nom}` : t('Près de moi', 'Near me')}>
        {/* ── 1. LA QUESTION OUVERTE ──────────────────────────────
            🧹 16 août — le chapeau « 📍 PRÈS DE MOI » ne s'affiche plus
            sur l'accueil : la pastille de position est maintenant dans la
            barre fine du haut, et le titre juste en dessous dit déjà la
            même chose. Trois façons d'annoncer « ici », c'est deux de
            trop, et c'était 25 px pris sur le premier écran. Il reste
            partout ailleurs, où il n'y a pas de barre de position. */}
        {!fondu && !titrePage && (
          <p style={{ color: 'var(--or)', fontSize: 13, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            {destination ? `${t('À', 'In')} ${destination.nom}` : t('Près de moi', 'Near me')}
          </p>
        )}
        {/* 🏠 UN SEUL TITRE AU-DESSUS DE LA BARRE, PAS DEUX.
            Mohamed, 16 août : « Le titre "Où prier, où manger halal —
            partout où tu voyages" devient le sous-titre de CETTE barre. »
            Sur l'accueil, il y avait « Dis-moi ce que tu cherches. », puis
            ce titre, puis le champ dont l'exemple en filigrane dit encore
            « un kebab pas cher pas loin » : trois phrases pour dire
            « écris ici ». Le H1 prend la place du h3 — il garde son texte
            entier pour Google et devient ce qu'on lit vraiment. Ailleurs
            (fiche ville, autour de moi), le h3 reste : il n'y a pas de H1
            à lui donner, et la page a déjà son titre. */}
        {/* 🧹 LE SLOGAN QUITTE L'ÉCRAN, PAS LE CODE — Mohamed, 16 août :
            « il sert une fois puis coûte deux lignes à chaque visite. Une
            adresse à 300 m prouve la promesse mieux que la promesse. »
            Le H1 reste dans la page pour Google, en lecture d'écran
            seulement : le supprimer vraiment coûterait le référencement de
            l'accueil, ce que personne n'a demandé. */}
        {titrePage && !destination ? (
          <h1 className="sr-slogan" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}>
            {t('Où prier, où ', 'Where to pray, where to ')}
            <span className="gold-em">{t('manger halal', 'eat halal')}</span>
            {t(' — partout où tu voyages.', ' — anywhere you travel.')}
          </h1>
        ) : (
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 20, fontWeight: 900, margin: '2px 0 0', lineHeight: 1.2 }}>
            {destination
              ? t(`Que cherches-tu à ${destination.nom} ?`, `What are you looking for in ${destination.nom}?`)
              : t('Dis-moi ce que tu cherches.', 'Tell me what you are looking for.')}
          </h3>
        )}

        <form onSubmit={(e) => { e.preventDefault(); comprendre(phrase) }} style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <input
            value={phrase} onChange={(e) => setPhrase(e.target.value)}
            placeholder={`« ${EXEMPLES[ex]} »`}
            aria-label={t('Décris ta recherche', 'Describe what you want')}
            style={{ flex: 1, minWidth: 200, minHeight: 52, borderRadius: 14, border: '1px solid rgba(253,250,243,0.25)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', padding: '0 14px', fontSize: 16 }}
          />
          <button type="submit" disabled={etape === 'cherche'}
                        /* Le bouton dominant prend l'ACCENT DE L'HEURE, pas l'or de
               tous les annuaires halal du monde. C'est la seule audace de
               l'écran, et elle porte une information : la couleur dit
               quel moment de la journée on est en train de vivre. */
            style={{ minHeight: 56, padding: '0 20px', borderRadius: 16, border: 'none', background: 'var(--ciel-accent, var(--or))', color: '#141018', fontWeight: 900, fontSize: 16, cursor: 'pointer', opacity: etape === 'cherche' ? 0.6 : 1 }}>
            {/* Le bouton DIT qu'il travaille : « … » ne se lit pas comme
                un travail en cours, ça se lit comme un bouton cassé. */}
            {etape === 'cherche' ? t('Je cherche…', 'Searching…') : t('Trouver', 'Find')}
          </button>
        </form>

        {/* 🗺️ QUAND LES DEUX LECTURES SE DÉFENDENT, C'EST LE VISITEUR QUI
            TRANCHE — en un appui, sans retaper.
            « kebab Istanbul » : cherche-t-il un kebab autour de lui, ou à
            Istanbul ? Nous ne le savons pas, donc nous ne le devinons
            pas. La même prudence que partout ailleurs sur ce site. */}
        {ambigu && (
          <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 14, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)' }}>
            <p style={{ color: 'var(--creme)', fontSize: 14, fontWeight: 700, margin: 0 }}>
              {t(`Tu cherches autour de toi, ou à ${ambigu.nom} ?`, `Around you, or in ${ambigu.nom}?`)}
            </p>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
              <button style={puce(false)} onClick={() => {
                const v = { lat: ambigu.lat, lng: ambigu.lng, nom: ambigu.nom }
                setVilleChoisie(v); setAmbigu(null); compter('barre-ville'); comprendre(ambigu.reste, v)
              }}>
                {t('À', 'In')} {ambigu.nom}
              </button>
              <button style={puce(false)} onClick={() => {
                const reste = ambigu.reste
                setVilleChoisie(null); setAmbigu(null); compter('barre-autour'); comprendre(reste, null)
              }}>
                {t('Autour de moi', 'Around me')}
              </button>
              <a href={`/destinations/${ambigu.slug}`} style={{ ...puce(false), display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
                {t(`Guide ${deVille(ambigu.nom)}`, `${ambigu.nom} guide`)} →
              </a>
            </div>
          </div>
        )}

        {/* 📍 Une ville reconnue dans la phrase : on le DIT, et on laisse
            revenir autour de soi en un appui. Un point de départ changé
            en silence serait exactement le genre de devinette qu'on
            s'interdit. */}
        {villeChoisie && !destinationProp && (
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(253,250,243,0.72)' }}>
            {t('Recherche à', 'Searching in')} <strong style={{ color: 'var(--or)' }}>{villeChoisie.nom}</strong>
            {' · '}
            <button onClick={() => { setVilleChoisie(null); setEtape('question') }}
              style={{ background: 'none', border: 'none', color: 'var(--creme)', textDecoration: 'underline', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              {t('revenir autour de moi', 'back to around me')}
            </button>
          </p>
        )}

        {/* §B.2 — « suggestions d'un appui : Manger · Mosquée · Que faire ».
            Elles lancent la recherche immédiatement : celui qui ne veut
            pas écrire est servi en un geste. Pour la mosquée, la relance
            porte sur le TEMPS (prier maintenant ?), pas sur le budget.

            📏 16 août — LES TROIS TIENNENT SUR UNE SEULE LIGNE. Ils
            passaient à la ligne sur un téléphone de 390 px : 95 px pour
            trois boutons, soit une rangée entière perdue sur le premier
            écran. Chacun prend un tiers de la largeur, le texte se serre
            plutôt que de sauter — et les 44 px de cible tactile sont
            intacts, c'est la règle qui ne se négocie pas. */}
        <div style={{ display: 'flex', gap: 7, marginTop: 7, flexWrap: 'nowrap' }}>
          {CAT_OPTS.map(([v, fr, an]) => (
            <button key={v}
              className="surmesure-cat"
              // 🔴 LE CLIC CHERCHE, TOUT DE SUITE. Il ouvrait auparavant un
              // bloc de pistes à lire — et ces pistes ont été supprimées
              // faute de filtre réel derrière. Un bouton qui n'ouvre plus
              // rien serait un bouton mort : il lance donc la recherche de
              // sa catégorie, et les trois filtres apparaissent sous les
              // adresses trouvées. Un geste du visiteur = un appel.
              onClick={() => {
                const c = { ...crit, categorie: v } as Criteres
                setCrit(c)
                setAide({ cat: v })
                setRaisonIA('')
                compter(`cat-${v}`)
                lancer(c, false)
              }}
              aria-pressed={aide?.cat === v} style={{ ...puce(aide?.cat === v), flex: '1 1 0', minWidth: 0, padding: '0 6px', whiteSpace: 'nowrap' }}>
              <IconeCat id={v} /> {t(fr, an)}
            </button>
          ))}
        </div>

        {/* 📍 UN VRAI BOUTON, AVEC DU TEXTE.
            Mohamed, 15 août : « Sur l'accueil, c'est un petit rond avec une
            épingle, à côté d'un autre petit rond. On ne le voit pas, on ne
            sait pas ce qu'il fait, personne ne cliquera dessus. » Il avait
            raison : une icône seule que personne ne comprend ne mérite pas
            sa place sur l'écran le plus précieux du site.
            Il dit maintenant ce qu'il fait, en pleine largeur, et il EMPORTE
            la recherche déjà tapée — la carte s'ouvre avec les kebabs. */}
        {/* 🔴 SUR L'ACCUEIL, CES DEUX BOUTONS SORTENT — décision du 15 août
            au soir : « si ce n'est pas ① la recherche, ② les trois onglets,
            ③ la bande de prière, ça sort. » « Voir sur la carte » double le
            raccourci Carte, et « Profil » demande un effort avant qu'on ait
            rendu le moindre service. Ils restent partout ailleurs. */}
        {false && titrePage && (
          <div style={{ display: 'flex', gap: 7, marginTop: 6 }}>
            <button onClick={() => {
              compter('vue-carte')
              const p = new URLSearchParams()
              if (phrase.trim()) p.set('q', phrase.trim())
              if (aide?.cat) p.set('cat', aide.cat)
              router.push(`/autour-de-moi${p.toString() ? `?${p}` : ''}`)
            }}
              style={{ flex: '1 1 auto', minHeight: 44, borderRadius: 999, cursor: 'pointer',
                border: '1.5px solid rgba(201,168,76,0.55)', background: 'rgba(201,168,76,0.14)',
                color: 'var(--or)', fontWeight: 800, fontSize: 14 }}>
              {t('Voir sur la carte', 'See on the map')}
            </button>
            {/* Le profil reste à un appui, mais il DIT ce qu'il est. */}
            <button onClick={() => setOuvrirProfil((o) => !o)} aria-expanded={ouvrirProfil}
              style={{ ...puce(!profilVide(profil)), flex: '0 0 auto', padding: '0 13px' }}>
              👤 {t('Profil', 'Profile')}
            </button>
          </div>
        )}

        {/* ── 👤 MON PROFIL — replié, accessible d'un appui ─────────
            « Un sur mesure qu'il faut retaper à chaque fois n'est pas du
            sur mesure. » Le profil vit dans le téléphone : aucun compte,
            rien sur nos serveurs, et « oublier tout » efface vraiment. */}
        {/* 📏 16 août — LES DEUX LIENS SECONDAIRES PARTAGENT UNE LIGNE.
            « 👤 Mon profil » et « ou choisis dans une liste » occupaient
            chacun leur rangée de 44 px, l'une sous l'autre. Ce sont deux
            portes de côté, pas deux étapes : elles tiennent sur la même
            ligne et rendent 54 px au premier écran. */}
        <div style={{ marginTop: titrePage ? 0 : 10 }}>
          {/* Ailleurs que sur l'accueil, le profil garde son lien en toutes
              lettres : la place ne manque pas et le libellé se lit mieux.
              🧹 « ou choisis dans une liste » est supprimé — les trois
              boutons Prier · Manger · Que faire SONT la liste, et ils sont
              juste au-dessus : « c'est le seul point d'entrée de recherche
              de la page » (Mohamed). Le QCM reste sous chaque catégorie. */}
          {/* 🧹 17 août — « Mon profil » QUITTE L'ÉCRAN DE RECHERCHE (brief :
              il partait déjà de l'accueil le 16). Il ne s'ouvre plus que
              depuis « modifier », là où l'on affine sa demande : c'est le
              seul moment où le régime alimentaire a sa place. Un profil qui
              s'affiche AVANT la première réponse, c'est demander un effort
              avant d'avoir rendu un service. */}
          {ouvrirQcm && (
            <button onClick={() => setOuvrirProfil((o) => !o)}
              style={{ width: '100%', background: 'none', border: 'none', color: profilVide(profil) ? 'rgba(253,250,243,0.6)' : 'var(--or)', textDecoration: 'underline', fontWeight: 800, cursor: 'pointer', minHeight: 44, padding: 0, textAlign: 'left', fontSize: 14 }}>
              {profilVide(profil)
                ? t('Mon profil', 'My profile')
                : `${t('Mon profil', 'My profile')} : ${resumerProfil(profil, en).join(' · ')}`}
            </button>
          )}

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

        {/* 🔴 CE BLOC A ÉTÉ VIDÉ, et c'est voulu.
            Les cinq pistes écrites en dur — « à l'abri s'il pleut », « avec
            un espace pour les femmes », « sans rien dépenser », « en deux
            heures à pied », « en famille pour s'asseoir » — n'avaient aucun
            filtre Google derrière : des coquilles vides.
            « Je ne sais pas — choisis pour moi » les suit : il ne faisait
            que relancer la même recherche avec une phrase par-dessus, et
            « toute proposition affichée est un engagement ».
            Ce qui reste tient dans une ligne, sous les résultats : trois
            filtres — prix, distance, note — qui trient les adresses déjà
            trouvées. Voir lib/propositions.mjs. */}

        {/* 📍 L'ANCRE DE LA RÉPONSE. Elle est placée ICI, avant « ce qu'on
            a compris », avant la relance et avant les fiches : quelle que
            soit l'issue du clic — une question, un squelette ou trois
            adresses —, le visiteur la voit. « Je clique sur Trouver, RIEN
            ne se passe » venait de là : le clic était pris, mais rien ne
            le montrait, et c'est la même chose. */}
        <div ref={zoneResultats} style={{ scrollMarginTop: 12 }} />

        {/* ── 2. CE QU'ON A COMPRIS, CORRIGEABLE ────────────────── */}
        {(aEcrit || ouvrirQcm) && etape !== 'cherche' && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(253,250,243,0.12)' }}>
            {/* ✳️ Le retour de lecture signe son auteur : « Claude a
                compris » seulement quand c'est vraiment lui — quand le repli
                local a travaillé, on écrit « Recherche : … » sans signature.
                S'attribuer une compréhension qu'on n'a pas eue, c'est le
                même mensonge en petit que la coche verte imméritée. */}
            {aEcrit && !ouvrirQcm && (
              <p style={{ color: parseSource === 'claude' ? '#7FBF8F' : 'rgba(253,250,243,0.85)', fontSize: 13.5, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                {parseSource === 'claude' && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ verticalAlign: '-2px', marginRight: 5 }}>
                    <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6zM19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9z" />
                  </svg>
                )}
                {parseSource === 'claude' ? t('Claude a compris', 'Claude understood') : t('Recherche', 'Search')} : <strong style={{ color: parseSource === 'claude' ? '#7FBF8F' : 'var(--or)' }}>{[...new Set([crit.motsCles, ...resumerCriteres(crit, en)].filter(Boolean))].join(' · ') || t('tout', 'anything')}</strong>
                {parseSource === 'claude' && ' ✓'}
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
              {t('Position approximative', 'Approximate location')}{posInitiale?.ville ? ` : ${posInitiale.ville}` : ''} {t('(adresse IP)', '(IP address)')}
            </p>
            <button onClick={() => lancer(crit, aEcrit, true)} style={{ ...puce(false), fontSize: 12.5, fontWeight: 800, borderColor: 'rgba(201,168,76,0.55)', color: 'var(--or)' }}>
              {t('Ma position exacte', 'My exact location')}
            </button>
          </div>
        )}

        {/* §5.5 — ON ANNONCE LE NOMBRE AVANT D'ÉLARGIR. Le visiteur décide,
            au lieu de subir une liste qui s'allonge toute seule. Et §5.4 :
            deux adresses valent mieux que trois dont une absurde — on le
            dit quand on n'en a trouvé que deux. */}

        {/* 🔴 LE QUOTA D'ABORD, ET IL DIT SON NOM. C'est NOTRE limiteur qui
            a refusé : Google n'a pas été appelé, on n'a donc pas le droit
            de l'accuser. Le délai affiché est celui que le serveur nous a
            réellement renvoyé. */}
        {etape === 'resultat' && panne?.quoi === 'quota' && (
          <div style={{ marginTop: 14, border: '1px solid rgba(201,168,76,0.45)', borderRadius: 14, padding: '13px 14px' }}>
            <p style={{ color: 'rgba(253,250,243,0.9)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
              {t(`Tu as fait beaucoup de recherches d'affilée. C'est notre propre limite, pas une panne : réessaie ${attente(panne.secondes, false)}.`,
                 `You have run a lot of searches in a row. That is our own limit, not an outage: try again ${attente(panne.secondes, true)}.`)}
            </p>
            <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 12.5, lineHeight: 1.5, margin: '7px 0 0' }}>
              {t('En attendant, tes adresses enregistrées et les guides restent accessibles.',
                 'Meanwhile, your saved places and the guides stay available.')}
            </p>
          </div>
        )}

        {/* Réseau : la requête n'est jamais partie. Là encore, ce n'est pas
            Google qui est muet — c'est nous qui n'avons pas pu parler. */}
        {etape === 'resultat' && panne?.quoi === 'reseau' && (
          <div style={{ marginTop: 14, border: '1px solid rgba(253,250,243,0.2)', borderRadius: 14, padding: '13px 14px' }}>
            <p style={{ color: 'rgba(253,250,243,0.9)', fontSize: 14, lineHeight: 1.55, margin: 0 }}>
              {t(`La connexion n'a pas tenu jusqu'au bout — la recherche n'est pas partie. Réessaie dans un instant.`,
                 `The connection dropped before the search left — try again in a moment.`)}
            </p>
            <button onClick={() => lancer(crit, aEcrit)} style={{ ...puce(false), marginTop: 10 }}>{t('Réessayer', 'Try again')}</button>
          </div>
        )}

        {etape === 'resultat' && !panne && fiches.length === 0 && (
          <div style={{ marginTop: 14 }}>
            {/* 🔌 DEUX RAISONS TRÈS DIFFÉRENTES D'AVOIR UN ÉCRAN VIDE, et
                on ne dit pas l'une pour l'autre. Soit Google a répondu et
                il n'y a réellement rien dans le rayon — alors on parle de
                distance et on propose d'élargir. Soit on n'a PAS PU
                demander (clé absente, appel muet) — et là, annoncer
                « aucune adresse à moins de 15 min » serait faux : on ne
                sait pas. On dit ce qu'on a interrogé, et rien de plus. */}
            <p style={{ color: 'rgba(253,250,243,0.8)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              {etatGoogle === 'muet' || etatGoogle === 'sans-cle'
                ? t(`Nous n'avons pas pu interroger Google Maps à l'instant. Nos propres adresses et OpenStreetMap n'en donnent aucune ici — ça ne veut pas dire qu'il n'y a rien.`,
                    `We could not reach Google Maps just now. Our own listings and OpenStreetMap show none here — that does not mean there is nothing.`)
                : crit.categorie === 'mosquee'
                  ? t(`Aucun lieu de prière trouvé jusqu'à ${rayonKm} km — on préfère te le dire plutôt que d'inventer.`,
                      `No prayer place found within ${rayonKm} km — we would rather say so than invent one.`)
                  : t(`Aucune adresse trouvée jusqu'à ${rayonKm} km — on préfère te le dire plutôt que d'inventer.`,
                      `Nothing found within ${rayonKm} km — we would rather say so than invent an address.`)}
            </p>
            <div style={rangee}>
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
          <p style={{ color: 'var(--or)', fontSize: 13.5, fontWeight: 700, marginTop: 12, lineHeight: 1.5 }}>{raisonIA}</p>
        )}

        {/* TROIS TRIS, UNE SEULE LIGNE, AUCUNE IA — et UN SEUL à la fois.
            Brief du 17 août : un tri réordonne, il n'exclut jamais ; re-taper
            le retire. La liste se retrie en direct, sans le moindre appel
            réseau. « Ouvert maintenant » n'est pas un bouton : c'est le tri
            par défaut, les fermés derrière. */}
        {etape === 'resultat' && lesTris.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {lesTris.map((f) => {
                const actif = triActif === f.id
                return (
                  <button key={f.id} aria-pressed={actif}
                    onClick={() => { setTriActif(actif ? null : f.id); compter('piste') }}
                    style={{ ...puce(actif), flex: '1 1 0', minWidth: 0, whiteSpace: 'nowrap', justifyContent: 'center', minHeight: 48 }}>
                    <IconeTri id={f.icone} /> {en ? f.en : f.fr}
                  </button>
                )
              })}
            </div>
            {/* Le choix unique se DIT, sinon il se découvre en s'énervant. */}
            <p style={{ margin: '7px 0 0', textAlign: 'center', fontSize: 12, color: 'rgba(253,250,243,0.35)' }}>
              {t('un seul tri à la fois — re-taper pour retirer', 'one sort at a time — tap again to remove')}
            </p>
          </div>
        )}

        {/* 🔴 SUR L'ACCUEIL, LES FICHES SONT RENDUES PAR L'ÉCRAN DES CIELS.
            Elles s'affichaient DEUX FOIS : une liste ici, la même adresse en
            carte dominante juste en dessous. Une réponse donnée deux fois
            n'est pas deux fois plus utile — elle fait douter d'avoir compris. */}
        {!titrePage && aVoir.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aVoir.map((f, i) => (
              <Carte key={f.id ?? i} f={f} en={en} mode={mode} destination={!!destination}
                allergie={mentionneAllergie(profil)}
                choisie={!!f.id && f.id === selectionId}
                onChoisir={() => { onSelection?.(f.id ?? null); compter('fiches-ouvertes') }}
                onItineraire={() => compter('itineraires')} />
            ))}
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

        {/* ⏱️ LA PRIÈRE EST DANS MOINS DE 30 MINUTES : on le dit AVANT les
            fiches, et on rappelle que le temps de trajet de chacune est
            écrit dessus. Le visiteur compare lui-même — il n'y a rien de
            plus honnête que de lui donner les deux nombres. */}
        {urgence && fiches.length > 0 && etape === 'resultat' && (
          <p style={{ marginTop: 12, padding: '9px 12px', borderRadius: 12, background: 'rgba(201,168,76,0.16)', border: '1px solid var(--or)', color: 'var(--creme)', fontSize: 13.5, fontWeight: 700, lineHeight: 1.45 }}>
            ⏱️ {t(`${urgence.nom} dans ${urgence.minutes} min — le temps de trajet est écrit sur chaque adresse.`,
                  `${urgence.nom} in ${urgence.minutes} min — travel time is written on each place.`)}
          </p>
        )}

        {/* 🔴 « On ne sert pas un poulet rôti en faisant semblant que c'est
            la réponse. » Quand le mot demandé ne se retrouve nulle part, on
            le dit avant les fiches — elles restent utiles, mais elles ne
            sont pas ce qui a été demandé. */}
        {motManquant && fiches.length > 0 && etape === 'resultat' && (
          <p style={{ marginTop: 12, padding: '9px 12px', borderRadius: 12, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: 'var(--creme)', fontSize: 13.5, lineHeight: 1.45 }}>
            {t(`Aucun « ${motManquant} » trouvé jusqu'à ${rayonKm} km — voici ce qui s'en rapproche le plus.`,
               `No “${motManquant}” found within ${rayonKm} km — here is the closest match.`)}
          </p>
        )}

        {/* 🔴 §6 — la phrase permanente, sobre, sous les résultats. */}
        {fiches.length > 0 && (
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 11.5, marginTop: 12, lineHeight: 1.5 }}>
            {mentionPermanente(en)}
          </p>
        )}

        {/* Sobre, une ligne, sous les résultats : d'où ils viennent. On ne
            promet plus « les fiches Google arrivent bientôt » quand Google
            n'a simplement pas répondu — c'est une panne du moment, pas une
            fonctionnalité à venir. */}
        {source === 'osm' && fiches.length > 0 && (
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 12, marginTop: 10 }}>
            {etatGoogle === 'muet' || etatGoogle === 'sans-cle'
              ? t('Google Maps n’a pas répondu — ces adresses viennent d’OpenStreetMap.', 'Google Maps did not respond — these come from OpenStreetMap.')
              : t('Résultats OpenStreetMap — les fiches Google Maps arrivent bientôt.', 'OpenStreetMap results — Google Maps details coming soon.')}
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
    <section style={{ background: 'var(--nuit)' }} className="pt-0 pb-1 px-4" aria-label={titre}>
      {/* 📏 16 août : pb-8 → pb-4 et padding 16 → 13. Trente pixels de
          marge basse sous une carte déjà posée sur un fond de la même
          couleur ne se voient pas — ils repoussent seulement ce qui suit
          sous la ligne de flottaison. */}
      <div className="max-w-3xl mx-auto" style={{ background: 'linear-gradient(150deg, rgba(27,67,50,0.5), rgba(255,255,255,0.05))', border: '1.5px solid rgba(201,168,76,0.55)', borderRadius: 18, padding: 10, boxShadow: '0 4px 22px rgba(0,0,0,0.25)' }}>
        {children}
      </div>
    </section>
  )
}

/**
 * Les photos d'une fiche, qui disparaissent proprement quand elles ne
 * chargent pas. En 4G, une image lente ne doit pas laisser un rectangle
 * béant : tant qu'elle n'est pas arrivée, le fond du site tient la place ;
 * si elle échoue, elle s'efface et la fiche se referme sur son texte.
 */
function Photos({ photos, nom }: { photos?: string[]; nom: string }) {
  const [mortes, setMortes] = useState<Set<number>>(new Set())
  const vivantes = (photos ?? []).slice(0, 2).map((src, i) => ({ src, i })).filter(({ i }) => !mortes.has(i))
  if (!vivantes.length) return null
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {vivantes.map(({ src, i }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={src} alt={nom} loading="lazy"
          onError={() => setMortes((m) => new Set(m).add(i))}
          style={{ flex: 1, width: '100%', height: 150, objectFit: 'cover', display: 'block', background: 'linear-gradient(150deg, rgba(27,67,50,0.55), rgba(11,26,15,0.85))' }} />
      ))}
    </div>
  )
}

/** UNE FICHE = une carte qui respire, la photo la porte (§2 et §6). */
function Carte({ f, en, mode, destination, allergie, choisie = false, onChoisir, onItineraire }: { f: Fiche; en: boolean; mode: Mode; destination: boolean; allergie: boolean; choisie?: boolean; onChoisir?: () => void; onItineraire: () => void }) {
  const t = (fr: string, an: string) => (en ? an : fr)
  // §5.1 et §5.2 : le temps est TOUJOURS accompagné de son mode, et
  // jamais « 91 min à pied » — au-delà de 20 minutes, on bascule sur la
  // voiture. §5.6 : sur une fiche ville, le repère est le centre.
  const dist = trajet(f.distanceM, mode, en, destination)
  return (
    // 🔗 La fiche choisie porte le même liseré doré que son épingle
    // grossit sur la carte : c'est une seule sélection, vue des deux côtés.
    <article onClick={onChoisir} aria-current={choisie || undefined} data-fiche={f.id}
      style={{ borderRadius: 16, border: `1px solid ${choisie ? 'var(--or)' : 'rgba(253,250,243,0.16)'}`, boxShadow: choisie ? '0 0 0 3px rgba(201,168,76,0.28)' : 'none', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', cursor: onChoisir ? 'pointer' : 'default', scrollMarginTop: 8 }}>
      {/* 🖼️ UNE IMAGE QUI NE CHARGE PAS NE LAISSE JAMAIS UN TROU.
          Mohamed, 15 août : « des rectangles vides avec un "?" bleu, le nom
          du lieu s'affiche en gris derrière le trou. » Un trou dans la page
          fait plus de dégâts qu'une absence assumée : la photo qui échoue
          se retire, et la fiche se réorganise sans elle. */}
      <Photos photos={f.photos} nom={f.nom} />
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
