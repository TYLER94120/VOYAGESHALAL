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

/**
 * 🔄 21 AOÛT — MOHAMED CHANGE LA RÈGLE, EN CONNAISSANCE DE CAUSE.
 *
 *   « Tu peux marquer les restaurants et tu stipules qu'il y a de l'alcool.
 *     Comme ça on se décharge de notre responsabilité. Pour moi c'est
 *     clair. »
 *
 * Ce qui l'a motivé : à Noisy-le-Grand, trois adresses asiatiques
 * existaient et l'écran restait vide parce que toutes servaient de
 * l'alcool. Cacher revenait à ne pas répondre.
 *
 * CE QUI CHANGE : un RESTAURANT qui sert de l'alcool s'affiche désormais,
 * avec la mention, en bas de liste, jamais en tête.
 *
 * CE QUI NE CHANGE PAS, et c'est délibéré :
 *   · un BAR, un PUB, une BOÎTE DE NUIT ne sont pas des restaurants —
 *     l'ordre porte sur les restaurants, ils restent écartés ;
 *   · le PORC reste un barrage dur : c'est l'assiette, pas l'ambiance ;
 *   · un lieu sans information n'est jamais présenté comme sans alcool.
 *
 * Le choix revient à la personne, avec l'information sous les yeux. C'est
 * la différence entre décider pour quelqu'un et le renseigner.
 */
export function classerAlcool(l) {
  const v = verdictAlcool(l)
  if (v.garde) return { affichable: true, alcool: v.alcool ?? 'inconnu' }
  // Barrages qui restent durs : ce n'est pas un restaurant, ou c'est
  // l'assiette qui pose problème.
  if (v.motif === 'type-boisson' || v.motif === 'doute-porc') {
    return { affichable: false, alcool: 'oui', motif: v.motif }
  }
  // Restaurant qui sert de l'alcool (attribut Google) ou dont l'enseigne
  // l'annonce (bistrot, brasserie…) : affiché, et dit.
  return { affichable: true, alcool: 'oui', motif: v.motif }
}

/** La ligne affichée sur CHAQUE fiche — jamais optionnelle (§6). */
export function ligneAlcool(alcool, en) {
  if (alcool === 'oui') {
    return en
      ? '⚠ Serves alcohol — per Google. Your call.'
      : "⚠ Sert de l'alcool — d'après Google. À toi de voir."
  }
  return alcool === 'non'
    ? (en ? '✓ Does not serve alcohol — per Google' : "✓ Ne sert pas d'alcool — d'après Google")
    : (en ? '⚠ Information not available — check on site' : '⚠ Information non disponible — à vérifier sur place')
}

/** La phrase permanente sous les résultats (§6). */
export function mentionPermanente(en) {
  return en
    ? 'Bars and pubs are excluded. A restaurant that serves alcohol is shown, and said so — the choice is yours. When the information is missing, we say that too.'
    : "Les bars et pubs sont écartés. Un restaurant qui sert de l'alcool est affiché, et signalé comme tel — le choix te revient. Quand l'information manque, nous le disons aussi."
}
