// 🔀 UN GESTE N'EST JAMAIS IGNORÉ.
//
// 21 août, capture à l'appui. Mohamed : « je clique sur Que faire, ça me
// sort des pizzas. Je clique sur pizza, il ne trouve rien. C'est un peu le
// désordre. » Sur l'écran : pilule « Que faire » allumée, carte
// « AU FOUR A PIZZA » dessous.
//
// LA CAUSE TENAIT EN UNE LIGNE : `if (enCours.current) return` au début de
// la recherche. Pendant les deux à quatre secondes d'un appel à Google,
// TOUT nouveau geste était jeté en silence :
//   · la pilule s'allumait (l'interface, elle, répond tout de suite) ;
//   · la recherche correspondante ne partait pas ;
//   · l'ancienne se terminait et affichait ses résultats sous la NOUVELLE
//     pilule.
//
// Rien n'était « cassé » : les gestes étaient perdus. C'est pour ça que le
// défaut a résisté à trois corrections successives — on cherchait un bug
// dans le moteur alors que le problème était que le moteur n'était jamais
// appelé.
//
// LA RÈGLE : la nouvelle recherche annule la précédente et prend sa place ;
// une réponse qui revient d'une recherche abandonnée est JETÉE, jamais
// affichée. Ce test empêche le verrou de revenir.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('components/lieux/SurMesure.tsx', 'utf8')
const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')

// 1. le verrou qui jetait les gestes ne doit jamais revenir
if (/if\s*\(\s*enCours\.current\s*\)\s*return/.test(code)) {
  casse('la recherche refuse de nouveau un geste pendant qu\'une autre tourne — c\'est le désordre du 21 août')
}

// 2. le jeton de séquence est en place et il est VÉRIFIÉ
if (!/jetonRecherche/.test(code)) casse('le jeton de recherche a disparu')
if (!/const mien = \+\+jetonRecherche\.current/.test(code)) casse('la recherche ne prend plus de numéro : impossible de savoir si sa réponse est encore d\'actualité')
const verifs = (code.match(/encoreLaMienne\(\)/g) ?? []).length
if (verifs < 5) casse(`seulement ${verifs} vérifications du jeton : chaque écriture à l'écran doit en avoir une`)

// 3. l'écriture des résultats — celle qui affichait les pizzas — est gardée
if (!/if \(!encoreLaMienne\(\)\) return\s*\n\s*const trois = corps\.fiches/.test(code)) {
  casse('les résultats s\'affichent sans vérifier qu\'ils appartiennent à la recherche courante')
}

// 4. l'appel réseau précédent est bien coupé
if (!/acCourant\.current\?\.abort\(\)/.test(code)) casse('la recherche précédente n\'est plus annulée : elle continue de coûter et de répondre')

// 5. la relance après GPS ne réaffiche pas une recherche abandonnée
if (!/d > 300 && encoreLaMienne\(\)/.test(code)) {
  casse('la relance GPS peut réafficher la catégorie que la personne vient de quitter')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ concurrence : aucun geste jeté, ${verifs} gardes sur les écritures — ce qui s'affiche correspond toujours à ce qui est allumé.`)

// ═══ 🔀 CHANGER DE MODE, C'EST REPARTIR DE ZÉRO (21 août) ═══
//
// « Je mets pizza, il ne trouve rien. Je reviens dans Que faire et ça me
// met une pizzeria. » La deuxième moitié venait du changement de mode :
// on ne remplaçait QUE la catégorie, en gardant les mots de la recherche
// précédente. « Que faire » partait donc chercher des pizzas.
if (!/categorie: v, motsCles: '', envieId: undefined/.test(code)) {
  casse('changer de mode ne remet plus les mots de la recherche à zéro — « Que faire » chercherait encore la dernière envie')
}

// ═══ 🍶 LE BARRAGE ALCOOL SUIT LE LIEU, PAS L'ONGLET ═══
//
// Il portait sur la CATÉGORIE DEMANDÉE : une pizzeria écartée en mode
// Manger ressortait en mode « Que faire ». Le filtre le plus important du
// site se contournait en changeant d'onglet.
const moteurSrc = readFileSync('app/api/lieux/route.ts', 'utf8')
const moteurCode = moteurSrc.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')
if (/let classes = c\.categorie === 'manger' \? await verifierAlcool/.test(moteurCode)) {
  casse('le barrage alcool dépend de nouveau de l\'onglet : il se contournerait via « Que faire »')
}
if (!/sertAManger\(x\.primaryType, x\.types\)/.test(moteurCode)) {
  casse('le barrage alcool ne regarde plus si le LIEU sert à manger')
}
console.log('✅ modes : les mots ne débordent plus d\'un onglet à l\'autre, et le barrage alcool suit le lieu.')
