// 🌅 L'HEURE FAIT L'ÉCRAN — la couleur suit la course du soleil.
//
// Ordre de Mohamed, 16 août : « Les cinq prières suivent le soleil. Le
// rythme d'une journée musulmane est déjà un dégradé de lumière.
// L'interface le suit : à chaque moment sa teinte. Le vert et or actuel est
// le code de TOUS les sites halal — il dit "halal" mais ne dit rien de
// nous, et rien du voyage. Le ciel dit les deux. »
//
// ════════ LA RÈGLE QUI REND ÇA POSSIBLE ════════
//
// L'ÉCRAN RESTE TOUJOURS SOMBRE. Seule la TEINTE du sombre change. Jamais
// de fond clair, jamais de texte sur une couleur trop lumineuse. Le
// contraste reste AA à toutes les heures — la lisibilité ne se sacrifie
// pas à l'ambiance, et scripts/test-ciel.mjs casse le build si elle l'est.
//
// ════════ CE QUI NE SUIT JAMAIS LE SOLEIL ════════
//
// Le vert du halal vérifié est une CONSTANTE D'IDENTITÉ et un code
// sémantique : si sa teinte changeait avec l'heure, « vérifié » ne voudrait
// plus dire la même chose le matin et le soir. Idem pour l'orange du
// « signalé » et le rouge d'alerte.

// ════════ COMMENT LA COULEUR PORTE DU SENS SANS CASSER LE CONTRASTE ════
//
// Mesuré sur les cinq ciels : le vert #1FA06A écrit EN TEXTE sur le bas du
// dégradé ne donne que 2,74 à 3,25 — sous AA. Écrit en PASTILLE (fond plein,
// texte sombre dessus), il donne 5,54 partout, à toutes les heures.
//
// D'où la règle, et elle vaut pour toute couleur porteuse de sens :
//   · le texte courant est clair sur le ciel — 8,17 au pire des cinq ;
//   · une couleur qui VEUT DIRE quelque chose (halal vérifié, signalé,
//     alerte, accent de l'heure) se pose en PASTILLE avec du texte sombre.
// Ainsi la teinte du ciel peut changer sans qu'aucun statut ne devienne
// illisible — l'ambiance ne coûte jamais une information.
export const TEXTE_SUR_PASTILLE = '#0B1327'

// Nouvelle tentative de déploiement : le commit précédent a été refusé par
// Vercel (« Deployment rate limited »), donc les cinq ciels n'ont jamais
// atteint la production.
/** Les couleurs qui ne bougent à aucune heure. */
export const CONSTANTES = {
  texte: '#F5F2EC',
  texteFort: '#FFFFFF',
  halalVerifie: '#1FA06A',
  halalSignale: '#E0A340',
  alerte: '#D6544A',
  carteFond: 'rgba(255,255,255,0.09)',
  carteBord: 'rgba(255,255,255,0.16)',
}

/**
 * Les cinq ciels. `fond` est un dégradé vertical en trois arrêts, du plus
 * sombre (en haut) au plus lumineux (en bas) — le texte principal vit sur
 * le haut, la zone la plus contrastée.
 */
export const CIELS = {
  fajr: {
    nom: 'Fajr', libelle: 'aube',
    arrets: ['#0B1327', '#1C2B52', '#3B3C63'], accent: '#E3A88F',
  },
  dhuhr: {
    nom: 'Dhuhr', libelle: 'plein jour',
    arrets: ['#0A1F35', '#12324F', '#1B4266'], accent: '#8FC4E8',
  },
  asr: {
    nom: 'Asr', libelle: 'après-midi',
    arrets: ['#1B1430', '#3A2440', '#6B3A3E'], accent: '#E8A85C',
  },
  maghrib: {
    nom: 'Maghrib', libelle: 'couchant',
    arrets: ['#1B0A20', '#3E1430', '#6B2438'], accent: '#EE8449',
  },
  isha: {
    nom: 'Isha', libelle: 'nuit',
    arrets: ['#0A0F24', '#181139', '#281B4E'], accent: '#9B87D4',
  },
}

/** Le dégradé CSS d'un ciel. */
export function degrade(cle) {
  const c = CIELS[cle] ?? CIELS.isha
  return `linear-gradient(180deg, ${c.arrets[0]} 0%, ${c.arrets[1]} 55%, ${c.arrets[2]} 100%)`
}

/**
 * Quel ciel, à cet instant ? On lit les VRAIS horaires de prière du lieu —
 * jamais une heure d'horloge arbitraire : à Oslo en juin et à Dakar, le
 * même « 20 h » n'est pas le même moment de la journée.
 *
 * `horaires` : { Fajr, Dhuhr, Asr, Maghrib, Isha } en Date, pour aujourd'hui.
 * Fajr commence une heure avant Dhuhr… non : Fajr court de Fajr jusqu'à
 * Dhuhr, et la nuit (Isha) enveloppe tout ce qui précède Fajr.
 */
export function cielA(maintenant, horaires) {
  if (!horaires) return 'isha'
  const t = maintenant instanceof Date ? maintenant.getTime() : Number(maintenant)
  const h = (k) => (horaires[k] instanceof Date ? horaires[k].getTime() : Number(horaires[k]))
  const fajr = h('Fajr'), dhuhr = h('Dhuhr'), asr = h('Asr'), maghrib = h('Maghrib'), isha = h('Isha')
  if (![fajr, dhuhr, asr, maghrib, isha].every(Number.isFinite)) return 'isha'
  if (t >= isha || t < fajr) return 'isha'      // la nuit enveloppe minuit
  if (t < dhuhr) return 'fajr'
  if (t < asr) return 'dhuhr'
  if (t < maghrib) return 'asr'
  return 'maghrib'
}

// ════════ LE CONTRASTE SE CALCULE, IL NE S'ESPÈRE PAS ════════

function canal(v) {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
/** Luminance relative WCAG d'un #rrggbb. */
export function luminance(hex) {
  const m = String(hex).replace('#', '')
  const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16)
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}
/** Le rapport de contraste entre deux couleurs opaques, de 1 à 21. */
export function contraste(a, b) {
  const la = luminance(a), lb = luminance(b)
  const [haut, bas] = la > lb ? [la, lb] : [lb, la]
  return Math.round(((haut + 0.05) / (bas + 0.05)) * 100) / 100
}
