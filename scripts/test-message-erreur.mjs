// 🔴🔴 CHAQUE PANNE NOMME SA VRAIE CAUSE.
//
// Défaut du 15 août, et il a coûté une demi-journée de recherche au mauvais
// endroit : sur un 429 de NOTRE serveur — notre propre limiteur anti-robot,
// réglé à 20 recherches par heure — l'écran affichait « Nous n'avons pas pu
// interroger Google Maps ». Google n'avait jamais été appelé. Zéro erreur
// dans la console Google, zéro euro facturé, et une demi-journée passée à
// fouiller un service qui n'avait rien fait.
//
// « Un message d'erreur faux est pire qu'une panne : il envoie chercher au
// mauvais endroit. »
//
// Ce test casse le build si :
//   1. le composant ne distingue pas le 429 des autres échecs ;
//   2. le message « Google » n'est pas explicitement mis à l'écart quand
//      une panne interne est connue ;
//   3. le serveur cesse de renvoyer le délai d'attente réel ;
//   4. le serveur cesse d'écrire un AVERTISSEMENT dans les journaux ;
//   5. le plafond redescend à un niveau qui gêne un visiteur normal.

import { readFileSync } from 'fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

const composant = readFileSync(new URL('../components/lieux/SurMesure.tsx', import.meta.url), 'utf-8')
const route = readFileSync(new URL('../app/api/lieux/route.ts', import.meta.url), 'utf-8')

// ── 1. Le composant reconnaît le 429 et lui donne son propre état ──────
if (!/r\.status === 429/.test(composant)) {
  casse('le composant ne regarde plus le statut 429 : un refus de NOTRE serveur redeviendrait une panne « Google »')
}
if (!/setPanne\(\{\s*quoi:\s*'quota'/.test(composant)) {
  casse('le 429 ne déclenche plus l\'état « quota »')
}

// ── 2. Le message « Google » ne peut pas s'afficher sur une panne interne
const bloc = composant.match(/etape === 'resultat' && ([^&]*)&& fiches\.length === 0/)
if (!bloc || !/!panne/.test(bloc[1])) {
  casse('le message « Nous n\'avons pas pu interroger Google Maps » n\'est plus protégé par « !panne » : il peut de nouveau accuser Google à tort')
}

// La phrase du quota doit parler de NOTRE limite, et jamais de Google.
const phraseQuota = composant.match(/panne\?\.quoi === 'quota'[\s\S]{0,1200}?<\/div>/)
if (!phraseQuota) casse('le bloc d\'affichage du quota a disparu')
else {
  if (/Google/.test(phraseQuota[0])) casse('le message de quota mentionne Google — c\'est exactement le mensonge qu\'on corrige')
  if (!/notre propre limite/i.test(phraseQuota[0])) casse('le message de quota ne dit pas que la limite est la nôtre')
  if (!/attente\(/.test(phraseQuota[0])) casse('le message de quota n\'affiche plus de délai d\'attente')
}

// ── 3. Le serveur renvoie le délai réel ────────────────────────────────
if (!/'Retry-After'/.test(route)) casse('le serveur ne renvoie plus l\'en-tête Retry-After')
if (!/r\.ttl\(k\)/.test(route)) casse('le délai n\'est plus lu sur la vraie durée de vie du compteur : il serait inventé')

// ── 4. Le 429 se voit dans les journaux ────────────────────────────────
if (!/console\.warn\(`\[lieux\] QUOTA INTERNE ATTEINT/.test(route)) {
  casse('le 429 repasse en silence dans les journaux — c\'est ce silence qui a fait chercher du mauvais côté')
}

// ── 5. Le plafond protège du robot, pas du curieux ─────────────────────
const plafond = Number((route.match(/const QUOTA_HEURE = (\d+)/) ?? [])[1])
if (!(plafond >= 100)) casse(`le plafond est redescendu à ${plafond}/heure : un visiteur qui explore vingt minutes le toucherait`)

// ── 6. Le quota ne se compte pas sur une réponse déjà en cache ─────────
const iCache = route.indexOf('surmesure:cache:')
const iQuota = route.indexOf('QUOTA INTERNE ATTEINT')
if (iCache === -1 || iQuota === -1 || iQuota < iCache) {
  casse('le plafond est de nouveau compté AVANT la lecture du cache : une réponse gratuite consommerait du quota')
}

// ── 7. L'administrateur ne se bloque pas lui-même ──────────────────────
if (!/!checkAdmin\(req\)/.test(route)) casse('l\'exemption administrateur a disparu : Mohamed se bloquerait en testant son propre site')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ messages d\'erreur : un 429 dit « quota » avec son délai, jamais « Google ».')
