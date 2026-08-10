'use client'
import { fetchJsonCourt } from '@/lib/fetchCourt'

// 🌤 LIRE LA MÉTÉO SANS JAMAIS BLOQUER L'ÉCRAN.
//
// La météo est un CONFORT : aucune page ne doit l'attendre. Elle arrive quand
// elle arrive, et si elle n'arrive pas, l'écran ne montre rien plutôt qu'un
// rond qui tourne. C'est la règle de repondre-en-conditions-degradees :
// le repli est excellent (le reste de la page est déjà utile), donc le délai
// est court.
//
// La chaîne de replis, dans l'ordre :
//   1. la dernière météo gardée sur l'appareil, si elle concerne le même
//      endroit et date de moins de 3 h → affichée TOUT DE SUITE ;
//   2. le réseau, borné à 4 s, qui rafraîchit en silence ;
//   3. rien du tout — et rien du tout est une réponse acceptable ici.
//
// ⚠️ On n'invente jamais une température. Une valeur gardée en mémoire est
// affichée avec son âge, comme une fiche produit hors ligne.

export interface Heure { t: string; temp: number; code: string; pluieMm: number }
export interface Jour { date: string; min: number; max: number; code: string; pluieMm: number }
export interface Meteo {
  maintenant: { temp: number; code: string } | null
  heures: Heure[]
  jours: Jour[]
  releveA: number
  perime?: boolean
}

const CLE = 'vh_meteo'
/** Au-delà, une météo gardée n'est plus une information, c'est un souvenir. */
const AGE_MAX = 3 * 60 * 60 * 1000

interface Garde { lat: number; lng: number; v: Meteo }

function lireGarde(lat: number, lng: number): Meteo | null {
  try {
    const g = JSON.parse(localStorage.getItem(CLE) || 'null') as Garde | null
    if (!g?.v) return null
    // ~11 km : au-delà on a changé d'endroit, la météo gardée ne vaut plus.
    if (Math.abs(g.lat - lat) > 0.1 || Math.abs(g.lng - lng) > 0.1) return null
    if (Date.now() - g.v.releveA > AGE_MAX) return null
    return g.v
  } catch { return null }
}

function ecrireGarde(lat: number, lng: number, v: Meteo) {
  try { localStorage.setItem(CLE, JSON.stringify({ lat, lng, v } as Garde)) } catch { /* stockage plein ou privé */ }
}

/**
 * Renvoie ce qu'on sait tout de suite (peut être null), puis appelle
 * `surFrais` si le réseau apporte mieux. Ne lève jamais.
 */
export function meteoInstantanee(lat: number, lng: number, surFrais: (m: Meteo) => void): Meteo | null {
  const gardee = lireGarde(lat, lng)

  // `navigator.onLine === false` ne détecte que le mode avion — c'est le cas
  // le plus rare. On s'en sert seulement pour éviter une attente inutile.
  const coupe = typeof navigator !== 'undefined' && navigator.onLine === false
  if (!coupe) {
    void fetchJsonCourt<Meteo>(`/api/meteo?lat=${lat}&lng=${lng}`).then((m) => {
      if (m && m.maintenant) { ecrireGarde(lat, lng, m); surFrais(m) }
    })
  }
  return gardee
}

/** Âge affichable d'un relevé, en français simple. */
export function ageReleve(releveA: number, en = false): string | null {
  const min = Math.round((Date.now() - releveA) / 60000)
  if (min < 45) return null // assez frais pour ne rien dire
  if (min < 120) return en ? 'about an hour ago' : 'il y a environ une heure'
  return en ? `${Math.round(min / 60)} h ago` : `il y a ${Math.round(min / 60)} h`
}

// ── Traduire les codes de MET Norway en quelque chose de lisible ──────────
const EMOJIS: [RegExp, string][] = [
  [/thunder/, '⛈️'], [/sleet/, '🌨️'], [/snow/, '❄️'],
  [/heavyrain/, '🌧️'], [/rain/, '🌦️'], [/fog/, '🌫️'],
  [/cloudy/, '☁️'], [/partlycloudy_night|fair_night|clearsky_night/, '🌙'],
  [/partlycloudy/, '⛅'], [/fair/, '🌤️'], [/clearsky/, '☀️'],
]
export function emojiMeteo(code: string): string {
  for (const [re, e] of EMOJIS) if (re.test(code)) return e
  return '🌤️'
}

const MOTS: [RegExp, string, string][] = [
  [/thunder/, 'orage', 'thunder'],
  [/heavysnow/, 'neige forte', 'heavy snow'], [/snow/, 'neige', 'snow'],
  [/sleet/, 'neige fondue', 'sleet'],
  [/heavyrain/, 'forte pluie', 'heavy rain'], [/lightrain/, 'pluie faible', 'light rain'],
  [/rain/, 'pluie', 'rain'], [/fog/, 'brouillard', 'fog'],
  [/cloudy/, 'couvert', 'cloudy'], [/partlycloudy/, 'nuages', 'partly cloudy'],
  [/fair/, 'éclaircies', 'fair'], [/clearsky/, 'ciel dégagé', 'clear sky'],
]
export function motMeteo(code: string, en = false): string {
  for (const [re, fr, a] of MOTS) if (re.test(code)) return en ? a : fr
  return en ? 'clear' : 'dégagé'
}

/**
 * La phrase qui sert à ANTICIPER — la demande de Mohamed. On ne répète pas la
 * température affichée juste à côté : on dit ce qui va CHANGER dans la
 * journée, et seulement quand ça vaut la peine d'être dit.
 */
export function conseilDuJour(m: Meteo, en = false): string | null {
  const prochaines = m.heures.slice(0, 12)
  if (!prochaines.length) return null

  const pluie = prochaines.find((h) => h.pluieMm >= 0.3)
  if (pluie) {
    const h = new Date(pluie.t).getHours()
    return en ? `Rain expected around ${h}:00 — take something.` : `Pluie attendue vers ${h} h — prends de quoi te couvrir.`
  }
  const temps = prochaines.map((h) => h.temp)
  const max = Math.max(...temps), min = Math.min(...temps)
  if (max >= 33) {
    const hMax = prochaines[temps.indexOf(max)]
    const h = new Date(hMax.t).getHours()
    return en ? `Up to ${max}° around ${h}:00 — water and shade.` : `Jusqu'à ${max}° vers ${h} h — eau et ombre.`
  }
  if (max - min >= 10) {
    return en ? `From ${min}° to ${max}° today — dress in layers.` : `De ${min}° à ${max}° aujourd'hui — prévois une couche.`
  }
  if (min <= 4) return en ? `Down to ${min}° — it will be cold.` : `Jusqu'à ${min}° — il fera froid.`
  return null
}
