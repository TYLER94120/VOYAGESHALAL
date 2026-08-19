'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'
import HotelFilter from '@/components/villes/HotelFilter'
import { coordsOf, distanceKm, type HotelLike, type LatLng } from '@/lib/hotelFilter'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { fuseauDe, formaterHeureVille } from '@/lib/fuseaux.mjs'
import { estLatinLisible } from '@/lib/latin.mjs'

// 🏙 LA PAGE VILLE, REPARTIE DE ZÉRO (itération 7).
//
// Rôle : PRÉPARER le voyage — on la lit chez soi. Sur place, c'est
// « Autour de moi ». Cinq sections, dans l'ordre des questions du
// voyageur : Verdict → Dormir → Manger → Mes journées → À savoir.
// Le CSS (classes pv-*, globals.css) est le CONTRAT VISUEL de
// maquette-page-ville.html — aucune liberté sur couleurs/tailles/ordre.
//
// Règle B — données vraies ou absentes : chaque champ affiché vient de
// la base (base_vh), d'une API réelle ou du cache IA (/api/ville-ia,
// ia_cache). Un champ absent ne s'affiche pas : pas de prix inventé,
// pas de note inventée, pas de nom illisible. Les horaires de prière
// sont formatés dans le FUSEAU DE LA VILLE (lib/fuseaux) — jamais celui
// du lecteur — avec garde-fou : Dhuhr hors 11 h–14 h locale = planning
// masqué + erreur console.

interface Resto { nom?: string; lat?: number; lng?: number; type?: string; halalConfidence?: string }
interface Activite { nom?: string; lat?: number; lng?: number; categorie?: string; prix?: string; duree?: string }
interface Mosquee { nom?: string; lat?: number; lng?: number }
interface VilleData {
  nom: string; pays?: string; slug?: string; halalScore?: number
  restaurants?: Resto[]; restaurantsTotal?: number
  hotels?: HotelLike[]; mosqueesPrincipales?: Mosquee[]; activites?: Activite[]
}
interface Ia {
  faits?: { avant: string; nuance?: string; ton: 'vert' | 'orange' }[]
  quartier?: string; strategie?: string
  savoir?: { monnaie?: string; transport?: string; piege?: string; mots?: string }
  noms?: Record<string, string>
}
interface Etape { t: string; type: 'prayer' | 'visit' | 'meal'; title: string; sub?: string; lat?: number; lng?: number }

function Ic({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'inline-block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}
const D_LIT = 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2'
const D_REPAS = 'M7 3v7a2.5 2.5 0 0 0 2.5 2.5V21M4.5 3v5M9.5 3v5M17 3c-1.7 1.5-2.5 3.4-2.5 5.5S15.8 12 17.5 12V21'
const D_MOSQUEE = 'M12 3c3.2 2.4 5 4.7 5 7.2V20H7v-9.8C7 7.7 8.8 5.4 12 3zM4 20h16M10 20v-3.4a2 2 0 0 1 4 0V20'
const D_AGENDA = 'M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
const D_AMPOULE = 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z'
const D_MARCHE = 'M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM10 22l2-6-2.5-2 1-5 3 1 2 3h2M9 13l-2 2 1 4'
const D_VOITURE = 'M5 16l1.5-5h11L19 16M5 16h14M5 16v3h2v-2h10v2h2v-3M8 8h8'
const D_ETINCELLE = 'M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'
const D_BILLET = 'M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5'
const D_METRO = 'M6 4h12a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2zM4 11h16M8 18l-2 3M16 18l2 3'
const D_ALERTE = 'M12 3l10 18H2zM12 10v4M12 17.5v.5'
const D_BULLE = 'M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z'
const D_LOUPE = 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16 16l5 5'

const t2 = (en: boolean) => (fr: string, an: string) => (en ? an : fr)

/** Nom affichable : lisible tel quel, sinon romanisé par le cache IA
 *  (« Roman (local) »), sinon PAS affiché du tout. */
function nomLisible(nom: string | undefined, noms?: Record<string, string>): { principal: string; local?: string } | null {
  if (!nom) return null
  if (estLatinLisible(nom)) return { principal: nom }
  const rom = noms?.[nom]
  if (rom) return { principal: rom, local: nom }
  return null
}

const cuisineMot = (type?: string) => {
  const m = String(type ?? '').split(',')[0].trim()
  return m ? m.charAt(0).toUpperCase() + m.slice(1) : null
}

export default function PageVille({ ville, en = false }: { ville: VilleData; en?: boolean }) {
  const t = t2(en)
  const [ia, setIa] = useState<Ia | null>(null)
  useEffect(() => {
    const ac = new AbortController()
    fetch(`/api/ville-ia?slug=${encodeURIComponent(ville.slug ?? '')}&lang=${en ? 'en' : 'fr'}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null)).then((j) => setIa(j)).catch(() => setIa(null))
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── VERDICT — HalalScore réel (base_vh), validé 0–10 sinon absent. ──
  const score = typeof ville.halalScore === 'number' && ville.halalScore > 0 && ville.halalScore <= 10 ? ville.halalScore : null
  const ton = score == null ? null : score >= 9 ? 'vert-fonce' : score >= 8 ? 'vert' : score >= 7 ? 'orange' : 'gris'
  const niveau = score == null ? null
    : score >= 9 ? t('Excellent — tout est simple sur place', 'Excellent — everything is easy there')
    : score >= 8 ? t('Très bon — voyage confortable', 'Very good — a comfortable trip')
    : score >= 7 ? t('Acceptable — voyage possible, un peu de préparation', 'Acceptable — doable with a little planning')
    : t('Exigeant — bien préparer chaque journée', 'Demanding — plan each day carefully')

  const restos = (ville.restaurants ?? []).filter((r) => r.nom)
  const mosquees = (ville.mosqueesPrincipales ?? []).filter((m) => m.nom)
  const nbRestos = ville.restaurantsTotal ?? restos.length
  const noms = ia?.noms

  // ── DORMIR — 2 hôtels : le mieux situé (mosquée réelle la plus proche)
  //    et le second choix ; raison dorée = fait CALCULÉ, prix seulement
  //    si la base en a un (15–2000 €). Nom illisible = exclu. ──
  const hotelsChoisis = useMemo(() => {
    const mPts = mosquees.filter((m): m is Mosquee & LatLng => typeof m.lat === 'number' && typeof m.lng === 'number')
    const rPts = restos.filter((r): r is Resto & LatLng => typeof r.lat === 'number' && typeof r.lng === 'number')
    const H = (ville.hotels ?? [])
      .map((h) => ({ h, aff: nomLisible((h as any).nom, noms), c: coordsOf(h) }))
      .filter((x) => x.aff && x.c)
      .map((x) => {
        const dm = mPts.length ? Math.min(...mPts.map((m) => distanceKm(x.c!, m))) : Infinity
        const rn = rPts.filter((r) => distanceKm(x.c!, r) <= 1).length
        const prixBrut = (x.h as any).prixNuitEur
        const prix = typeof prixBrut === 'number' && prixBrut >= 15 && prixBrut <= 2000 ? prixBrut : null
        return { ...x, dm, rn, prix }
      })
      .sort((a, b) => a.dm - b.dm || b.rn - a.rn)
    const meilleur = H[0]
    const budget = H.slice(1).sort((a, b) => (a.prix ?? Infinity) - (b.prix ?? Infinity) || b.rn - a.rn)[0]
    return { meilleur, budget }
  }, [ville.hotels, mosquees, restos, noms])

  const km = (v: number) => (v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(1).replace('.', ',')} km`)

  // ── MANGER — 2 tables : vérifiées d'abord, nom lisible obligatoire. ──
  const tables = useMemo(() => {
    const ordre = (r: Resto) => (r.halalConfidence === 'verified' ? 0 : 1)
    return restos
      .map((r) => ({ r, aff: nomLisible(r.nom, noms) }))
      .filter((x) => x.aff)
      .sort((a, b) => ordre(a.r) - ordre(b.r))
      .slice(0, 2)
  }, [restos, noms])

  const badgeHalal = (r: Resto) =>
    r.halalConfidence === 'verified' ? t('vérifié', 'verified')
    : r.halalConfidence === 'likely' ? t('signalé halal', 'reported halal')
    : t('à vérifier', 'to check')

  return (
    <div className="pv">
      {/* ===== 1. LE VERDICT ===== */}
      <div className="pv-verdict">
        <span className="pv-sur-titre">{t('Guide halal', 'Halal guide')}</span>
        <h1>{ville.nom}</h1>
        {score != null && (
          <div className="pv-v-ligne1">
            <span className="pv-score-grand" data-ton={ton}>✦ {score.toLocaleString(en ? 'en-GB' : 'fr-FR')}</span>
            <span className="pv-v-niveau">{niveau}</span>
          </div>
        )}
        {(ia?.faits?.length ?? 0) > 0 && (
          <div className="pv-v-faits">
            {ia!.faits!.slice(0, 3).map((f, i) => (
              <div key={i} className="pv-fait pv-monte" style={i ? { animationDelay: `${i * 0.05}s` } : undefined}>
                <span className={`pv-pt ${f.ton}`} />
                <span><b>{f.avant.split(':')[0]} :</b>{f.avant.split(':').slice(1).join(':')}{f.nuance ? ` — ${f.nuance}` : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== sommaire sticky ===== */}
      <nav className="pv-sommaire">
        <a className="pv-som" href="#dormir"><Ic d={D_LIT} size={17} /> {t('Dormir', 'Sleep')}</a>
        <a className="pv-som" href="#manger"><Ic d={D_REPAS} size={17} /> {t('Manger', 'Eat')}</a>
        <a className="pv-som" href="#planning"><Ic d={D_AGENDA} size={17} /> {t('Mes journées', 'My days')}</a>
        <a className="pv-som" href="#savoir"><Ic d={D_AMPOULE} size={17} /> {t('À savoir', 'Good to know')}</a>
      </nav>

      {/* ===== 2. OÙ DORMIR ===== */}
      <section className="pv-sec" id="dormir">
        <div className="pv-sec-titre">
          <h2>{t('Où dormir', 'Where to sleep')}</h2>
          {(ville.hotels?.length ?? 0) > 0 && <a href="#hotels">{t(`Les ${ville.hotels!.length} hôtels →`, `All ${ville.hotels!.length} hotels →`)}</a>}
        </div>
        {ia?.quartier && <p className="pv-sec-sous" dangerouslySetInnerHTML={{ __html: ia.quartier.replace(/:\s*([^—]+)—/, ': <b>$1</b>—') }} />}
        {[{ x: hotelsChoisis.meilleur, premier: true }, { x: hotelsChoisis.budget, premier: false }].map(({ x, premier }, i) => x ? (
          <a key={i} className={`pv-ligne${premier ? ' premier' : ''}`} href={(x.h as any).bookingUrl ?? (x.h as any).mapsUrl ?? '#hotels'}
            target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="pv-vign"><Ic d={D_LIT} /></span>
            <span className="pv-l-txt">
              <span className="pv-l-nom">{x.aff!.principal}{x.aff!.local && <small> ({x.aff!.local})</small>}</span>
              <span className="pv-l-sous">
                {x.dm !== Infinity && <b>{t('Mosquée à', 'Mosque at')} {km(x.dm)}</b>}
                {x.dm !== Infinity && x.rn > 0 && ' · '}
                {x.rn > 0 && t(`${x.rn} restos halal à pied`, `${x.rn} halal spots on foot`)}
              </span>
            </span>
            {x.prix != null && <span className="pv-l-prix">{x.prix} €<br /><small>{t('/nuit', '/night')}</small></span>}
          </a>
        ) : null)}
        {!hotelsChoisis.meilleur && (
          <p className="pv-sec-sous">{t('Pas encore d’hôtel au nom lisible relevé ici.', 'No hotel with a readable name listed here yet.')}</p>
        )}
      </section>

      {/* ===== 3. MANGER HALAL ===== */}
      <section className="pv-sec" id="manger">
        <div className="pv-sec-titre">
          <h2>{t('Manger halal', 'Eating halal')}</h2>
          {nbRestos > 0 && <a href="#adresses">{t(`Les ${nbRestos} adresses →`, `All ${nbRestos} places →`)}</a>}
        </div>
        {ia?.strategie && <p className="pv-sec-sous">{ia.strategie}</p>}
        {tables.map(({ r, aff }, i) => (
          <a key={i} className={`pv-ligne${i === 0 ? ' premier' : ''}`} href={r.lat != null && r.lng != null ? `https://maps.google.com/?q=${r.lat},${r.lng}` : '#adresses'}
            target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="pv-vign"><Ic d={D_REPAS} /></span>
            <span className="pv-l-txt">
              <span className="pv-l-nom">{aff!.principal}{aff!.local && <small> ({aff!.local})</small>}</span>
              <span className="pv-l-sous">
                {cuisineMot(r.type) && <b>{cuisineMot(r.type)}</b>}
                {cuisineMot(r.type) && ' · '}✓ {badgeHalal(r)}
              </span>
            </span>
          </a>
        ))}
        {!tables.length && (
          <p className="pv-sec-sous">{t('Pas encore d’adresse au nom lisible relevée ici.', 'No place with a readable name listed here yet.')}</p>
        )}
      </section>

      {/* ===== 4. MES JOURNÉES ===== */}
      <section className="pv-sec" id="planning">
        <div className="pv-sec-titre"><h2>{t('Mes journées', 'My days')}</h2></div>
        <Planning ville={ville} en={en} noms={noms} />
      </section>

      {/* ===== 5. À SAVOIR ===== */}
      <section className="pv-sec" id="savoir">
        <div className="pv-sec-titre"><h2>{t('À savoir avant de partir', 'Before you land')}</h2></div>
        <div className="pv-savoir" style={{ marginTop: 12 }}>
          {ia?.savoir?.monnaie && <div className="pv-sav"><div className="t"><Ic d={D_BILLET} size={15} /> {t('Monnaie', 'Currency')}</div><div className="v">{ia.savoir.monnaie}</div></div>}
          {ia?.savoir?.transport && <div className="pv-sav"><div className="t"><Ic d={D_METRO} size={15} /> {t('Transport', 'Transit')}</div><div className="v">{ia.savoir.transport}</div></div>}
          {ia?.savoir?.piege && <div className="pv-sav"><div className="t"><Ic d={D_ALERTE} size={15} /> Halal</div><div className="v">{ia.savoir.piege}</div></div>}
          {ia?.savoir?.mots && <div className="pv-sav"><div className="t"><Ic d={D_BULLE} size={15} /> {t('Mots utiles', 'Useful words')}</div><div className="v">{ia.savoir.mots}</div></div>}
        </div>
        {!en && (
          <a href="/blog/restaurant-vraiment-halal-verifier" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, marginTop: 12, fontSize: 13.5, fontWeight: 700, color: '#E9D9A6', textDecoration: 'none' }}>
            <Ic d={D_LOUPE} size={16} /> Vérifier qu&apos;un restaurant est vraiment halal : 7 contrôles →
          </a>
        )}
      </section>

      {/* ===== annexes : les destinations des liens « Les N → » ===== */}
      {(ville.hotels?.length ?? 0) > 0 && (
        <section className="pv-sec" id="hotels">
          <div className="pv-sec-titre"><h2>{t('Choisir parmi les hôtels', 'Choose among the hotels')}</h2></div>
          <div style={{ marginTop: 12 }}>
            <HotelFilter
              hotels={ville.hotels!} en={en} villeNom={ville.nom} villeSlug={ville.slug}
              mosques={mosquees.filter((m): m is Mosquee & LatLng => m.lat != null && m.lng != null)}
              restos={restos.filter((r): r is Resto & LatLng => r.lat != null && r.lng != null)}
              center={null}
            />
          </div>
        </section>
      )}
      {restos.length > 0 && <AnnuaireManger restos={restos} noms={noms} en={en} badge={badgeHalal} />}

      <div className="pv-credit">{t('Sources : base VoyagesHalal · Google · OpenStreetMap', 'Sources: VoyagesHalal base · Google · OpenStreetMap')}</div>
    </div>
  )
}

/** L'annuaire replié des adresses — la destination du lien « Les N adresses → ». */
function AnnuaireManger({ restos, noms, en, badge }: { restos: Resto[]; noms?: Record<string, string>; en: boolean; badge: (r: Resto) => string }) {
  const t = t2(en)
  const [ouvert, setOuvert] = useState(false)
  const lisibles = restos.map((r) => ({ r, aff: nomLisible(r.nom, noms) })).filter((x) => x.aff)
  if (!lisibles.length) return null
  const vus = ouvert ? lisibles : lisibles.slice(0, 6)
  return (
    <section className="pv-sec" id="adresses">
      <div className="pv-sec-titre"><h2>{t('Toutes les adresses halal', 'All halal places')}</h2></div>
      <div style={{ marginTop: 12 }}>
        {vus.map(({ r, aff }, i) => (
          <a key={i} className="pv-ligne" href={r.lat != null && r.lng != null ? `https://maps.google.com/?q=${r.lat},${r.lng}` : undefined}
            target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="pv-vign"><Ic d={D_REPAS} /></span>
            <span className="pv-l-txt">
              <span className="pv-l-nom">{aff!.principal}{aff!.local && <small> ({aff!.local})</small>}</span>
              <span className="pv-l-sous">{cuisineMot(r.type) ? <b>{cuisineMot(r.type)}</b> : null}{cuisineMot(r.type) ? ' · ' : ''}✓ {badge(r)}</span>
            </span>
          </a>
        ))}
      </div>
      {lisibles.length > 6 && (
        <button onClick={() => setOuvert(!ouvert)} className="pv-ligne" style={{ justifyContent: 'center', fontWeight: 700, color: '#E9D9A6' }}>
          {ouvert ? t('Replier', 'Fold') : t(`Voir les ${lisibles.length} adresses`, `See all ${lisibles.length} places`)}
        </button>
      )}
    </section>
  )
}

/** ===== LE PLANNING RÉPARÉ =====
 * - horaires de prière calculés aux coordonnées de la ville et formatés
 *   dans SON fuseau (lib/fuseaux) — garde-fou Dhuhr 11 h–14 h locale ;
 * - noms lisibles obligatoires ; repas pris dans nos adresses halal ;
 * - temps réels entre étapes via /api/trajets-etapes (service partagé) ;
 * - « Réorganiser » (/api/sejour) ne déplace jamais les prières. */
function Planning({ ville, en, noms }: { ville: VilleData; en: boolean; noms?: Record<string, string> }) {
  const t = t2(en)
  const [jour, setJour] = useState(0)
  const [demande, setDemande] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState('')
  const [plans, setPlans] = useState<Etape[][] | null>(null)
  const [trajets, setTrajets] = useState<Record<string, { marcheMin?: number; voitureMin?: number }>>({})

  const coords = useMemo(() => {
    const a = (ville.activites ?? []).find((x) => x.lat != null)
    const m = (ville.mosqueesPrincipales ?? []).find((x) => x.lat != null)
    const r = (ville.restaurants ?? []).find((x) => x.lat != null)
    const p = a ?? m ?? r
    return p ? { lat: p.lat as number, lng: p.lng as number } : null
  }, [ville])

  const tz = fuseauDe(ville.pays, ville.slug)

  // Les prières de LA VILLE, dans SON fuseau — sinon pas de planning.
  const prieres = useMemo(() => {
    if (!coords || !tz) return null
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const p = computePrayerTimesFull(coords.lat, coords.lng, meth, ecole, new Date())
      const f = (d: Date) => formaterHeureVille(d, tz)
      const dhuhr = f(p.Dhuhr)
      const hD = Number(dhuhr.split(':')[0]) + Number(dhuhr.split(':')[1]) / 60
      if (hD < 11 || hD > 14) {
        console.error(`[planning] Dhuhr ${dhuhr} hors 11h–14h locale à ${ville.nom} (${tz}) — planning masqué`)
        return null
      }
      return { Dhuhr: dhuhr, Asr: f(p.Asr), Maghrib: f(p.Maghrib) }
    } catch (e) { console.error('[planning] calcul prières échoué :', e); return null }
  }, [coords, tz, ville.nom])

  // Journées types depuis les DONNÉES : activités + repas halal + mosquée
  // proche de l'activité précédente. Nom illisible = lieu exclu.
  const defauts = useMemo<Etape[][]>(() => {
    if (!prieres) return []
    const acts = (ville.activites ?? []).map((a) => ({ a, aff: nomLisible(a.nom, noms) })).filter((x) => x.aff)
    const reps = (ville.restaurants ?? []).map((r) => ({ r, aff: nomLisible(r.nom, noms) })).filter((x) => x.aff)
    const mosqs = (ville.mosqueesPrincipales ?? []).map((m) => ({ m, aff: nomLisible(m.nom, noms) })).filter((x) => x.aff && x.m.lat != null)
    const procheDe = (p?: { lat?: number; lng?: number }) => {
      if (!mosqs.length) return null
      if (!p || p.lat == null) return mosqs[0]
      return [...mosqs].sort((x, y) =>
        distanceKm({ lat: p.lat!, lng: p.lng! }, { lat: x.m.lat!, lng: x.m.lng! }) -
        distanceKm({ lat: p.lat!, lng: p.lng! }, { lat: y.m.lat!, lng: y.m.lng! }))[0]
    }
    const nomDe = (aff: { principal: string; local?: string }) => aff.local ? `${aff.principal} (${aff.local})` : aff.principal
    const jours: Etape[][] = []
    for (let j = 0; j < 3; j++) {
      const [a1, a2, a3] = [acts[j * 3], acts[j * 3 + 1], acts[j * 3 + 2]]
      const [dej, din] = [reps[j * 2], reps[j * 2 + 1]]
      const e: Etape[] = []
      if (a1) e.push({ t: '09:30', type: 'visit', title: nomDe(a1.aff!), sub: [a1.a.categorie, a1.a.prix, a1.a.duree].filter(Boolean).join(' · ') || undefined, lat: a1.a.lat, lng: a1.a.lng })
      const m1 = procheDe(a1?.a)
      if (m1) e.push({ t: prieres.Dhuhr, type: 'prayer', title: `Dhuhr — ${nomDe(m1.aff!)}`, sub: t('Mosquée relevée dans la ville', 'Mosque listed in the city'), lat: m1.m.lat, lng: m1.m.lng })
      if (dej) e.push({ t: '13:00', type: 'meal', title: `${nomDe(dej.aff!)} — ${t('déjeuner', 'lunch')}`, sub: `${cuisineMot(dej.r.type) ?? 'Table'} · ✓ ${dej.r.halalConfidence === 'verified' ? t('vérifié', 'verified') : t('signalé halal', 'reported halal')}`, lat: dej.r.lat, lng: dej.r.lng })
      if (a2) e.push({ t: '15:00', type: 'visit', title: nomDe(a2.aff!), sub: [a2.a.categorie, a2.a.prix, a2.a.duree].filter(Boolean).join(' · ') || undefined, lat: a2.a.lat, lng: a2.a.lng })
      const m2 = procheDe(a2?.a ?? a1?.a)
      if (m2) e.push({ t: prieres.Asr, type: 'prayer', title: `ʿAsr — ${nomDe(m2.aff!)}`, sub: t('Mosquée relevée dans la ville', 'Mosque listed in the city'), lat: m2.m.lat, lng: m2.m.lng })
      if (m2) e.push({ t: prieres.Maghrib, type: 'prayer', title: `Maghrib — ${nomDe(m2.aff!)}`, sub: t('Mosquée relevée dans la ville', 'Mosque listed in the city'), lat: m2.m.lat, lng: m2.m.lng })
      if (din) e.push({ t: '20:00', type: 'meal', title: `${nomDe(din.aff!)} — ${t('dîner', 'dinner')}`, sub: `${cuisineMot(din.r.type) ?? 'Table'} · ✓ ${din.r.halalConfidence === 'verified' ? t('vérifié', 'verified') : t('signalé halal', 'reported halal')}`, lat: din.r.lat, lng: din.r.lng })
      else if (a3) e.push({ t: '20:30', type: 'visit', title: nomDe(a3.aff!), sub: [a3.a.categorie, a3.a.prix, a3.a.duree].filter(Boolean).join(' · ') || undefined, lat: a3.a.lat, lng: a3.a.lng })
      jours.push(e.sort((x, y) => x.t.localeCompare(y.t)))
    }
    return jours
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ville, prieres, noms])

  const planning = plans ?? defauts
  const etapes = planning[jour] ?? []

  // Temps RÉELS entre étapes consécutives (service partagé) — absent si
  // le service ne répond pas, jamais estimé.
  const demandes = useRef(new Set<string>())
  useEffect(() => {
    const paires: { a: LatLng; b: LatLng; cle: string }[] = []
    for (let i = 1; i < etapes.length; i++) {
      const a = etapes[i - 1], b = etapes[i]
      if (a.lat == null || b.lat == null) continue
      const cle = `${a.lat},${a.lng}>${b.lat},${b.lng}`
      if (demandes.current.has(cle)) continue
      demandes.current.add(cle)
      paires.push({ a: { lat: a.lat, lng: a.lng! }, b: { lat: b.lat!, lng: b.lng! }, cle })
    }
    if (!paires.length) return
    const ac = new AbortController()
    fetch('/api/trajets-etapes', {
      method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paires: paires.map(({ a, b }) => ({ a, b })) }),
    }).then((r) => (r.ok ? r.json() : null)).then((j: { temps?: { marcheMin?: number; voitureMin?: number }[] } | null) => {
      if (!j?.temps) return
      setTrajets((prev) => {
        const n = { ...prev }
        paires.forEach((p, i) => { if (j.temps![i]) n[p.cle] = j.temps![i] })
        return n
      })
    }).catch(() => {})
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapes])

  async function reorganiser() {
    if (!demande.trim() || enCours) return
    setEnCours(true); setMessage('')
    try {
      const ac = new AbortController()
      const to = setTimeout(() => ac.abort(), 15000)
      const r = await fetch('/api/sejour', {
        method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ville: ville.nom, demande: demande.trim(), planning: planning.map((jr) => jr.map(({ t: h, type, title, sub }) => ({ t: h, type, title, sub }))), lang: en ? 'en' : 'fr' }),
      })
      clearTimeout(to)
      const j = await r.json() as { plans?: Etape[][] }
      if (r.ok && Array.isArray(j.plans) && j.plans.length === 3) {
        // On regreffe les coordonnées connues (le serveur ne rend que des titres du planning).
        const parTitre = new Map(planning.flat().map((e) => [e.title, e]))
        setPlans(j.plans.map((jr) => jr.map((e) => ({ ...e, lat: parTitre.get(e.title)?.lat, lng: parTitre.get(e.title)?.lng }))))
        setDemande('')
      } else setMessage(t('La réorganisation est indisponible — les journées types restent.', 'Reorganizing is unavailable — the default days remain.'))
    } catch {
      setMessage(t('La réorganisation est indisponible — les journées types restent.', 'Reorganizing is unavailable — the default days remain.'))
    } finally { setEnCours(false) }
  }

  if (!tz || !prieres) {
    return <p className="pv-sec-sous">{t('Le planning est indisponible pour cette ville — les horaires de prière ne peuvent pas être établis avec certitude.', 'The planner is unavailable for this city — prayer times cannot be established reliably.')}</p>
  }
  if (!etapes.length) {
    return <p className="pv-sec-sous">{t('Pas encore assez de données locales pour un planning honnête ici.', 'Not enough local data for an honest itinerary here yet.')}</p>
  }

  return (
    <div>
      <p className="pv-sec-sous">
        {t('Construites autour des ', 'Built around the ')}<b>{t('5 prières', '5 prayers')}</b>
        {t(` — horaires réels de ${ville.nom}. Tout est en français.`, ` — ${ville.nom}’s real times.`)}
      </p>
      <div className="pv-jours">
        {[0, 1, 2].map((i) => (
          <button key={i} className={`pv-jour${jour === i ? ' on' : ''}`} onClick={() => setJour(i)} aria-pressed={jour === i}>
            {t(`Jour ${i + 1}`, `Day ${i + 1}`)}
          </button>
        ))}
      </div>
      <div className="pv-tl">
        {etapes.map((e, i) => {
          const prev = etapes[i - 1]
          const cle = prev && prev.lat != null && e.lat != null ? `${prev.lat},${prev.lng}>${e.lat},${e.lng}` : null
          const tr = cle ? trajets[cle] : undefined
          return (
            <div key={`${jour}-${i}`}>
              {tr && (tr.marcheMin != null || tr.voitureMin != null) && (
                <div className="pv-tl-lien">
                  <Ic d={tr.marcheMin != null && tr.marcheMin <= 20 ? D_MARCHE : D_VOITURE} size={14} />
                  {tr.marcheMin != null && tr.marcheMin <= 20 ? `${tr.marcheMin} min` : `${tr.voitureMin ?? tr.marcheMin} min`}
                </div>
              )}
              <div className="pv-tl-item">
                <span className={`pv-tl-h${e.type === 'prayer' ? ' or' : ''}`}>{e.t}</span>
                <div className={`pv-tl-card${e.type === 'prayer' ? ' priere' : ''}`}>
                  <div className="pv-tl-nom">{e.title}</div>
                  {e.sub && <div className="pv-tl-sous">{e.sub}</div>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <input className="pv-reorg-champ" value={demande} onChange={(e) => setDemande(e.target.value)}
        placeholder={t('« plutôt shopping le jour 2, et un hammam »', '“more shopping on day 2, and a hammam”')}
        aria-label={t('Réorganiser mes journées', 'Reorganize my days')}
        onKeyDown={(e) => { if (e.key === 'Enter') void reorganiser() }} />
      <button className="pv-reorg" onClick={() => void reorganiser()} disabled={enCours || !demande.trim()} style={enCours ? { opacity: 0.6 } : undefined}>
        <Ic d={D_ETINCELLE} size={18} /> {enCours ? t('Je réorganise…', 'Reorganizing…') : t('Réorganiser mes journées', 'Reorganize my days')}
      </button>
      {message && <p className="pv-reorg-note">{message}</p>}
      <p className="pv-reorg-note">{t('Les 5 prières restent fixes — la réorganisation ne les déplace jamais.', 'The 5 prayers stay fixed — reorganizing never moves them.')}</p>
    </div>
  )
}
