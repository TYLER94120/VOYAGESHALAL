// 🍽 « MANGER » CHERCHE DU HALAL — il ne l'espère plus.
//
// Mohamed, 30 août, à Val d'Europe : « Le Brandy's est très connu là-bas,
// un restaurant halal, et il n'était pas affiché autour de moi. J'ai
// l'impression que ce qui me dérange, c'est les restaurants autour de moi.
// Je trouve ça moyen en termes de proposition. »
//
// Il avait raison, et le défaut était structurel — lu dans le code, pas
// supposé. La passe géographique demandait à Google les types
// `restaurant / meal_takeaway / bakery`, `maxResultCount: 20`,
// `rankPreference: DISTANCE` ; elle s'arrêtait au premier rayon donnant
// POOL_ALCOOL (9) survivants, et n'en gardait que RETENUS (3).
//
//   🔴 LE MOT « HALAL » N'ÉTAIT JAMAIS DANS LA QUESTION POSÉE.
//
// On demandait « les restaurants les plus proches » et on triait le halal
// APRÈS, sur une liste de vingt. Dans un centre commercial qui compte bien
// plus de vingt restaurants, une adresse halal un peu plus loin n'était pas
// écartée : elle n'était jamais candidate.
//
// La règle du 17 août — notre base trouve, Google enrichit ce qui est
// affiché — existait pour les mosquées et n'avait jamais été étendue à la
// nourriture. C'est fait. `/api/osm-restos` interroge OpenStreetMap en
// direct et filtre sur `diet:halal` : il CHERCHE du halal.
//
// ⚠️ CE QUI A ÉTÉ ESSAYÉ ET RETIRÉ. J'avais proposé, en repli, une recherche
// Google par TEXTE sur « halal » quand OSM ne trouve rien. Le dépôt dit non,
// et il a la mesure pour lui : règle du 16 août (lib/requete.mjs,
// scripts/test-requete.mjs) — « "café halal" ne cherche plus un café : le
// mot halal écrase le type et Google remonte tout ce qui est oriental. »
// Le repli Google reste donc inchangé : par type, halal qualifié sur les
// résultats. Ce fichier vérifie aussi que cette règle n'a pas été trahie
// par la porte de derrière.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const route = readFileSync('app/api/lieux/route.ts', 'utf8')
const osmRestos = readFileSync('app/api/osm-restos/route.ts', 'utf8')
const surMesure = readFileSync('components/lieux/SurMesure.tsx', 'utf8')

// ── 1. la découverte « manger » passe par OSM avant Google ──
if (!/c\.categorie === 'manger' && c\.exigence !== 'verifies'/.test(route)) {
  casse('la découverte OSM de « manger » a disparu : on redemanderait à Google les 20 restaurants les plus proches, halal ou non')
}
if (!/await viaOSM\(origin, lat, lng, rayon, 'manger'\)/.test(route)) {
  casse('« manger » n\'interroge plus OpenStreetMap pour DÉCOUVRIR — Google redeviendrait le moteur de recherche')
}
// Elle ne doit valoir que pour une demande GÉOGRAPHIQUE : dès que le
// visiteur écrit ses mots, c'est searchText qui sait les lire.
if (!/!\(c\.motsCles \?\? ''\)\.trim\(\) && !c\.envieId/.test(route)) {
  casse('la découverte OSM de « manger » ne vérifie plus que le visiteur n\'a rien écrit : elle écraserait sa demande libre')
}

// ── 2. OSM filtre bien sur l'étiquette halal ──
// C'est toute la valeur de cette voie : sans ce filtre, elle rendrait les
// restaurants les plus proches — exactement le défaut qu'on répare.
if (!/diet:halal/.test(osmRestos)) {
  casse('/api/osm-restos ne lit plus l\'étiquette diet:halal : la découverte rendrait des restaurants quelconques')
}

// ── 3. 🔴 LE BARRAGE ALCOOL S'APPLIQUE AUSSI À CETTE VOIE ──
// Une adresse étiquetée halal dans OSM dont le jumeau Google sert de la
// bière doit être ÉCARTÉE, pas affichée en « inconnu ». Le refus a sa
// propre valeur : `null` voudrait dire « Google ne l'a pas reconnue » et
// laisserait la fiche OSM s'afficher.
if (!/if \(!verdict\.garde\) return 'alcool'/.test(route)) {
  casse('l\'enrichissement OSM→Google ne peut plus signaler un refus alcool : le barrage se contournerait par la découverte OSM')
}
if (!/if \(e === 'alcool'\) \{ ecartesAlcool\+\+; continue \}/.test(route)) {
  casse('la découverte « manger » n\'écarte plus les adresses refusées par le barrage alcool')
}
if (!/servesBeer', 'servesWine', 'servesCocktails'/.test(route)) {
  casse('l\'enrichissement de « manger » ne demande plus les attributs de boisson : le barrage n\'aurait rien à lire')
}

// ── 4. Google enrichit, il ne découvre pas — et le nombre d'appels est borné ──
if (!/const MAX_ENRICHISSEMENTS = \d+/.test(route)) {
  casse('le plafond d\'appels d\'enrichissement a disparu : la découverte OSM pourrait coûter autant que la recherche Google')
}
if (!/appelsGoogle >= MAX_ENRICHISSEMENTS/.test(route)) {
  casse('le plafond d\'appels n\'est plus appliqué dans la découverte « manger »')
}

// ── 5. le statut reste celui de la SOURCE de l'affirmation ──
// Google a fourni la note et les horaires ; c'est OSM qui dit « halal ».
// Écrire « signalé halal sur Google Maps » serait attribuer l'affirmation
// à qui ne l'a pas faite.
if (!/statut: cat === 'manger' \? CATEGORIE\.manger\.statutOSM/.test(route)) {
  casse('une adresse trouvée dans OpenStreetMap serait annoncée comme signalée par Google : on ne change pas la source d\'une affirmation en enrichissant une fiche')
}

// ── 6. on n'annonce pas une panne qui n'a pas eu lieu ──
// Quand notre base répond, Google n'est PAS interrogé pour découvrir.
// L'interface écrivait alors « Google Maps n'a pas répondu » — faux : on ne
// lui avait rien demandé. L'état « non-sollicite » existe pour ça.
if (!/'non-sollicite'/.test(route)) {
  casse('l\'état « non-sollicite » a disparu : l\'interface annoncerait une panne de Google alors qu\'on ne l\'a pas interrogé')
}
if (!/'non-sollicite'/.test(surMesure)) {
  casse('l\'interface ne connaît plus l\'état « non-sollicite » : elle retomberait sur le message de panne')
}
// Le crédit ODbL, lui, doit rester affiché dans TOUS les cas où une donnée
// OpenStreetMap apparaît — c'est la licence, pas une préférence.
if (!/contributeurs OpenStreetMap/.test(surMesure)) {
  casse('le crédit ODbL a disparu de SurMesure alors que la découverte « manger » y fait maintenant apparaître des données OpenStreetMap')
}

// ── 7. la règle du 16 août n'est pas trahie par la porte de derrière ──
// « halal » ne se colle jamais au texte envoyé à Google.
if (/`halal \$\{/.test(route) || /'halal ' \+/.test(route)) {
  casse('« halal » est de nouveau collé à la requête Google — règle du 16 août : le mot halal écrase le type demandé')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ manger : découverte par OpenStreetMap (diet:halal), Google en enrichissement borné, barrage alcool appliqué, requête Google inchangée.')
