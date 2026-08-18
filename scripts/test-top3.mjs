// 🧪 Le podium de la carte tient ses promesses (correction 4).
import { POIDS, noteBayes, top3 } from '../lib/top3.mjs'
let ko = 0
const check = (ok, msg) => { if (!ok) { console.error(`❌ ${msg}`); ko++ } }

// Les poids somment à 1 — un barème qui ne somme pas à 1 ment sur ses parts.
for (const [mode, p] of Object.entries(POIDS)) {
  check(Math.abs(p.note + p.proximite + p.prix - 1) < 1e-9, `poids ${mode} : somme ≠ 1`)
}
// 4,9 avec 3 avis ne bat pas 4,5 avec 500 avis.
check(noteBayes(4.9, 3) < noteBayes(4.5, 500), 'la moyenne bayésienne doit pondérer par le volume d’avis')

const F = [
  { id: 'a', lat: 1, lng: 1, distanceM: 300, note: 4.2, nbAvis: 388, prix: 1 }, // proche + pas cher
  { id: 'b', lat: 1, lng: 1, distanceM: 900, note: 4.6, nbAvis: 212, prix: 3 }, // mieux noté
  { id: 'c', lat: 1, lng: 1, distanceM: 1500, note: 4.4, nbAvis: 531, prix: 2 },
  { id: 'd', lat: 1, lng: 1, distanceM: 2500, note: 4.9, nbAvis: 3, prix: 4 },  // 3 avis : jamais devant
]
const r = top3(F, 'manger')
check(r.length === 3, 'exactement 3 adresses')
check(r[0].etiquette === 'equilibre', 'la n°1 porte « Meilleur équilibre »')
check(!r.some((f) => f.id === 'd' && f.etiquette === 'mieux-note'), 'un 4,9/3 avis ne prend pas « Mieux noté »')
const proche = r.find((f) => f.etiquette === 'plus-proche')
check(!proche || proche.distanceM === Math.min(...r.map((x) => x.distanceM)), '« Le plus proche » dit vrai')

// Prier : la salle fermée ne monte pas sur le podium quand trois sont ouvertes.
const M = [
  { id: 'm1', lat: 1, lng: 1, distanceM: 200, ouvert: false },
  { id: 'm2', lat: 1, lng: 1, distanceM: 400, ouvert: true },
  { id: 'm3', lat: 1, lng: 1, distanceM: 600, ouvert: true },
  { id: 'm4', lat: 1, lng: 1, distanceM: 800, ouvert: true },
]
check(top3(M, 'mosquee')[0].id === 'm2', 'Prier : la fermée toute proche ne bat pas l’ouverte')

if (ko) { console.error(`${ko} promesse(s) du podium cassée(s)`); process.exit(1) }
console.log('✅ top 3 : l’équilibre se calcule, 3 avis ne font pas une vérité, la fermée ne prie pour personne.')
