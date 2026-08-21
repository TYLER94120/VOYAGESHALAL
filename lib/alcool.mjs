// 🔴 AUCUN ÉTABLISSEMENT SERVANT DE L'ALCOOL NE DOIT ÊTRE PROPOSÉ.
//
// ALERTE DE MOHAMED, 16 août : « Le widget m'a proposé un BISTROT. En
// France, un bistrot sert de l'alcool. Sur un site halal, proposer ce lieu
// à un musulman engage ma responsabilité devant Dieu — c'est la faute la
// plus grave que ce site puisse commettre, plus grave qu'une panne, plus
// grave qu'un bug d'affichage. »
//
// ════════ POURQUOI CE FICHIER EXISTE, ET PAS UNE CONSIGNE AU MODÈLE ════
//
// Règle d'architecture, non négociable : les lieux servant de l'alcool
// sont écartés AVANT que l'IA ne voie quoi que ce soit. Le contexte
// envoyé au modèle ne contient que des lieux déjà filtrés.
//
// On ne compte JAMAIS sur un « ne recommande pas de bar » dans le prompt.
// Un modèle obéit presque toujours — et « presque » est inacceptable ici.
// Le code, lui, ne se trompe pas par lassitude.
//
// ════════ L'ALLER-RETOUR DU 21 AOÛT, ÉCRIT POUR NE PAS RECOMMENCER ════
//
// Un écran vide à Noisy-le-Grand (trois sushis, tous servant de l'alcool)
// a fait envisager l'inverse : afficher ces restaurants en les signalant,
// « pour se décharger de la responsabilité ». C'était implémenté, puis
// Mohamed a tranché en une phrase, après avoir posé la question du droit
// religieux de manger dans un lieu qui sert de l'alcool :
//
//   « NON JE VOULAIS DIRE PRENONS AUCUN RISQUE. »
//
// La règle reste donc celle du 16 août, et cette note existe pour que la
// prochaine idée d'ouverture parte de la décision, pas de zéro : les avis
// des savants divergent sur ce point précis, et devant une divergence, ce
// site ne parie pas à la place du croyant. Le manque à afficher se
// rattrape en cherchant plus loin — c'est ce que fait le moteur, jusqu'à
// 20 km. Le contraire ne se rattrape pas.
//
// ════════ LA RÈGLE D'OR ════════
//
// DANS LE DOUTE, ON N'AFFICHE PAS. Si l'information sur l'alcool est
// inconnue ET que le lieu porte un signal d'alerte, il ne passe pas.
// Mieux vaut UNE adresse sûre que trois dont une douteuse ; mieux vaut
// « je n'ai rien trouvé » qu'un bistrot présenté comme bonne adresse.
// Le manque à afficher se rattrape en élargissant le rayon. Une adresse
// inacceptable proposée à un croyant ne se rattrape pas.

/**
 * Types Google de lieux de boisson. Liste EXACTE : un motif large sur
 * « bar » écarterait `barbecue_restaurant`, qui n'a rien à se reprocher.
 */
const TYPES_BOISSON = new Set([
  'bar', 'pub', 'wine_bar', 'bar_and_grill', 'night_club', 'liquor_store',
  'casino', 'brewery', 'brewpub', 'beer_garden', 'beer_hall', 'cocktail_bar',
  'sports_bar', 'dive_bar', 'karaoke', 'nightclub', 'winery', 'distillery',
  'sake_bar', 'izakaya', 'tavern', 'gastropub', 'strip_club',
])

/** Filet de sécurité pour les types que Google ajouterait demain. */
const MOTIF_TYPE = /(^|_)(bar|pub|tavern|brewery|brewpub|winery|distillery|nightclub|night_club|casino|liquor)($|_)|wine_bar|beer_|cocktail|izakaya/i

/**
 * Signaux d'alerte dans le NOM. Ces lieux ne passent QUE si les attributs
 * de service confirment qu'ils ne servent pas d'alcool. Dans le doute,
 * ils ne passent pas.
 *
 * ⚠️ Les frontières de mot comptent : « Bar » seul est un signal,
 * « Barbès », « Baraka » ou « Barbecue » n'en sont pas.
 */
const MOTIF_NOM = new RegExp(
  [
    '\\bbistro(t|ts)?\\b', '\\bbrasserie\\b', '\\bbars?\\b', '\\bpubs?\\b',
    '\\btaverne?\\b', '\\bcaves?\\b', '\\bwinery\\b', '\\bwines?\\b',
    '\\bbeers?\\b', '\\bbi[èe]res?\\b', '\\bcocktails?\\b', '\\blounge\\b',
    '\\btapas\\b', '\\bizakaya\\b', '\\bgastropub\\b', '\\bbrewing\\b',
    '\\bbrewery\\b', '\\bsaloon\\b', '\\bcantina\\b', '\\bvinoth[èe]que\\b',
  ].join('|'),
  'i',
)

/**
 * Même logique pour le PORC : nom ou avis qui l'évoquent → vérification,
 * et dans le doute, on écarte.
 */
const MOTIF_PORC = /\bcharcuterie\b|\bjambons?\b|\blardons?\b|\bchoucroute\b|\bcochon\b|\bporc\b|\bpork\b|\bham\b|\bbacon\b|\bsausages?\b|\bsaucisson\b/i

/**
 * LA DÉCISION. Trois barrages successifs, du moins cher au plus cher :
 *   1. le TYPE (gratuit, disponible dès la passe 1) ;
 *   2. les ATTRIBUTS de service (servesBeer / Wine / Cocktails) ;
 *   3. le NOM, qui ne suffit jamais à condamner seul mais qui exige une
 *      confirmation explicite — sans elle, c'est le doute, donc non.
 */
export function verdictAlcool(l) {
  // ── 1. TYPE : barrage dur, sans appel ──────────────────────────────
  const tous = [l.primaryType, ...(l.types ?? [])].filter(Boolean)
  for (const t of tous) {
    const k = t.toLowerCase()
    if (TYPES_BOISSON.has(k) || MOTIF_TYPE.test(k)) return { garde: false, motif: 'type-boisson' }
  }

  // ── 2. ATTRIBUTS : un seul « vrai » suffit à écarter ───────────────
  // Quels que soient le nom, la note ou une étiquette « halal ».
  if (l.servesBeer === true || l.servesWine === true || l.servesCocktails === true) {
    return { garde: false, motif: 'sert-alcool' }
  }

  // Google a répondu explicitement « non » sur les trois : c'est un fait,
  // on peut l'écrire sur la fiche.
  const troisNon = l.servesBeer === false && l.servesWine === false && l.servesCocktails === false
  const auMoinsUnNon = l.servesBeer === false || l.servesWine === false || l.servesCocktails === false

  // ── 3. NOM : le doute ne profite jamais au lieu ────────────────────
  if (MOTIF_NOM.test(l.nom)) {
    // Un « Bistrot du Coin » ne passe que si Google confirme explicitement
    // qu'il ne sert ni bière, ni vin, ni cocktail. Silence = refus.
    if (!troisNon) return { garde: false, motif: 'doute-nom' }
  }

  // ── 4. PORC : même règle, nom et avis ──────────────────────────────
  if (MOTIF_PORC.test(l.nom)) return { garde: false, motif: 'doute-porc' }
  if (l.avis?.some((a) => MOTIF_PORC.test(a))) return { garde: false, motif: 'doute-porc' }

  return { garde: true, alcool: troisNon ? 'non' : auMoinsUnNon ? 'inconnu' : 'inconnu' }
}

/** La ligne affichée sur CHAQUE fiche — jamais optionnelle (§6). */
export function ligneAlcool(alcool, en) {
  return alcool === 'non'
    ? (en ? '✓ Does not serve alcohol — per Google' : "✓ Ne sert pas d'alcool — d'après Google")
    : (en ? '⚠ Information not available — check on site' : '⚠ Information non disponible — à vérifier sur place')
}

/** La phrase permanente sous les résultats (§6). */
export function mentionPermanente(en) {
  return en
    ? 'We exclude places identified as serving alcohol. When the information is missing, we say so — always check on site.'
    : "Nous écartons les établissements identifiés comme servant de l'alcool. Quand l'information manque, nous le disons — vérifie toujours sur place."
}
