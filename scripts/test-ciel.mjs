// 🌅 LA LISIBILITÉ NE SE SACRIFIE JAMAIS À L'AMBIANCE.
//
// « L'ÉCRAN RESTE TOUJOURS SOMBRE. Seule la TEINTE du sombre change selon
// l'heure. Le contraste reste WCAG AA à TOUTES les heures, sans exception. »
//
// Ce test casse le build si :
//   A. le texte principal descend sous AA (4,5) sur l'un des cinq ciels ;
//   B. le vert du halal vérifié n'est plus #1FA06A, ou change avec l'heure ;
//   C. une couleur porteuse de sens devient illisible en pastille ;
//   D. un ciel cesse d'être sombre — un fond clair rendrait tout le reste
//      faux d'un coup.

import { CIELS, CONSTANTES, TEXTE_SUR_PASTILLE, contraste, luminance, cielA, degrade } from '../lib/cielDuMoment.mjs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }
const AA = 4.5

// ── A. Le texte, sur les trois arrêts de chacun des cinq ciels ─────────
for (const [cle, ciel] of Object.entries(CIELS)) {
  for (const arret of ciel.arrets) {
    const c = contraste(CONSTANTES.texte, arret)
    if (c < AA) casse(`${cle} : le texte ${CONSTANTES.texte} sur ${arret} ne fait que ${c} (AA = ${AA})`)
    // D. Un ciel doit rester un ciel de nuit : jamais un fond clair.
    if (luminance(arret) > 0.25) casse(`${cle} : l'arrêt ${arret} est trop lumineux — l'écran doit rester sombre à toutes les heures`)
  }
  // C. L'accent de l'heure ne s'emploie qu'en pastille : on le vérifie ainsi.
  const p = contraste(ciel.accent, TEXTE_SUR_PASTILLE)
  if (p < AA) casse(`${cle} : l'accent ${ciel.accent} en pastille ne fait que ${p}`)
}

// ── B. Les couleurs de sens ne suivent pas le soleil ───────────────────
if (CONSTANTES.halalVerifie !== '#1FA06A') casse(`le vert du halal vérifié a changé : ${CONSTANTES.halalVerifie} au lieu de #1FA06A`)
if (CONSTANTES.halalSignale !== '#E0A340') casse(`l'orange du « signalé » a changé : ${CONSTANTES.halalSignale}`)
if (CONSTANTES.alerte !== '#D6544A') casse(`le rouge d'alerte a changé : ${CONSTANTES.alerte}`)
for (const [nom, couleur] of [['halal vérifié', CONSTANTES.halalVerifie], ['signalé', CONSTANTES.halalSignale], ['alerte', CONSTANTES.alerte]]) {
  const c = contraste(couleur, TEXTE_SUR_PASTILLE)
  if (c < AA) casse(`la pastille « ${nom} » (${couleur}) ne fait que ${c} avec son texte sombre`)
}

// ── Le bon ciel au bon moment, y compris de part et d'autre de minuit ──
const j = (h, m = 0) => new Date(2026, 7, 16, h, m)
const horaires = { Fajr: j(5, 10), Dhuhr: j(13, 50), Asr: j(17, 45), Maghrib: j(21, 5), Isha: j(22, 40) }
for (const [heure, attendu] of [
  [j(3, 0), 'isha'],    // avant l'aube : c'est encore la nuit
  [j(5, 30), 'fajr'],
  [j(12, 0), 'fajr'],   // Fajr court jusqu'à Dhuhr
  [j(14, 30), 'dhuhr'],
  [j(18, 0), 'asr'],
  [j(21, 30), 'maghrib'],
  [j(23, 30), 'isha'],
]) {
  const r = cielA(heure, horaires)
  if (r !== attendu) casse(`à ${heure.getHours()} h on affiche le ciel « ${r} » au lieu de « ${attendu} »`)
}
// Sans horaires connus, on ne devine pas : la nuit, sobre, par défaut.
if (cielA(new Date(), null) !== 'isha') casse('sans horaires de prière, le ciel par défaut n\'est plus la nuit')

// Le dégradé se construit pour les cinq.
for (const cle of Object.keys(CIELS)) {
  if (!/^linear-gradient\(180deg, #[0-9A-F]{6} 0%, #[0-9A-F]{6} 55%, #[0-9A-F]{6} 100%\)$/i.test(degrade(cle))) {
    casse(`le dégradé de ${cle} n'est pas un dégradé vertical à trois arrêts`)
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ ciel : cinq teintes, toutes sombres, toutes AA, et le vert du halal ne bouge jamais.')
