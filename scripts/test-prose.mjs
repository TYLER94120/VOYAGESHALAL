// 🔢 AUCUN COMPTE NON SOURCÉ DANS LE TEXTE SERVI.
//
// Capture de Mohamed, 27 août, accueil anglais sur iPhone — panneau de La
// Mecque, trois nombres sur le même écran :
//
//   « Muslim travelers will find 76 halal restaurants listed, 400 mosques… »
//   « Saudi Arabia · 739 prayer places across the city »
//
// La fiche contient 26 restaurants et 60 mosquées ; le 739 vient
// d'OpenStreetMap. Deux des trois nombres ne sont comptables nulle part.
//
// Ce n'est pas un défaut d'affichage : ce texte est rendu par le SERVEUR
// dans le socle des 354 fiches, dans les deux langues. C'est ce que Google
// lit — et il lit alors trois comptes différents pour la même ville.
import { readFileSync, readdirSync } from 'node:fs'
import { sansChiffreNonSource, avanceUnCompte } from '../lib/prose.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. la règle elle-même ──
const CAS = [
  ['Muslim travelers will find 76 halal restaurants listed, 400 mosques, real-time prayer times.', false],
  ['Mecca is the holiest city of Islam.', true],
  ['La ville compte 120 mosquées et de nombreux hôtels.', false],
  ['Une ville où le voyage halal se prépare sans effort.', true],
  ['Home to 1,489 prayer places.', false],
]
for (const [phrase, doitRester] of CAS) {
  const reste = sansChiffreNonSource(phrase) !== ''
  if (reste !== doitRester) {
    casse(`« ${phrase.slice(0, 60)}… » : ${reste ? 'gardée' : 'retirée'}, attendu ${doitRester ? 'gardée' : 'retirée'}`)
  }
}
// 🔴 LE PIÈGE DU POINT DÉCIMAL. « Halal Trust Score of 4.9/5 » : un
// nettoyage qui s'arrête au premier point emporte « … of 4. » et laisse
// « with a 9/5 » — une note de 9 sur 5, servie à Google sur 172 fiches.
const marque = sansChiffreNonSource('Mecca, in Saudi Arabia, is a halal-friendly destination with a Halal Trust Score of 4.9/5.')
if (marque !== 'Mecca, in Saudi Arabia, is a halal-friendly destination.') {
  casse(`la phrase de la marque abandonnée est mal réparée : « ${marque} »`)
}
if (/\d\s*\/\s*5/.test(marque)) casse('une note « x/5 » survit au nettoyage')

// La phrase qui suit un compte n'est pas emportée avec lui.
const deux = sansChiffreNonSource('The city lists 76 halal restaurants. Prayer times follow the local time zone.')
if (deux !== 'Prayer times follow the local time zone.') {
  casse(`le retrait emporte la phrase voisine : « ${deux} »`)
}

// ── 2. le texte servi ne porte plus aucun compte ──
// Sur les 354 fiches, dans les deux langues.
let villes = 0, restants = 0, vides = 0
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  const v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
  villes++
  for (const champ of ['description', 'description_en']) {
    const brut = typeof v[champ] === 'string' ? v[champ] : ''
    if (!brut) continue
    const servi = sansChiffreNonSource(brut)
    if (avanceUnCompte(servi)) {
      casse(`${f} (${champ}) : un compte passe encore — « ${servi.slice(0, 70)}… »`)
      restants++
    }
    if (!servi.trim()) vides++
  }
}

// ── 3. les deux endroits qui affichent ce texte l'ont bien filtré ──
for (const [f, quoi] of [
  ['components/villes/SocleVille.tsx', 'le socle des 354 fiches'],
  ['app/(dyn)/world/page.tsx', 'l\'accueil anglais'],
]) {
  const s = readFileSync(f, 'utf8')
  if (!/sansChiffreNonSource/.test(s)) {
    casse(`${quoi} (${f}) affiche à nouveau le texte brut : les comptes démentis reviendraient`)
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ prose : ${villes} fiches × 2 langues, aucun compte non sourcé dans le texte servi (${vides} description(s) vidée(s), le chapeau est facultatif).`)
