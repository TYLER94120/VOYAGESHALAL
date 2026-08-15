// ✨ LES PROPOSITIONS NAISSENT DE CE QUI EXISTE VRAIMENT AUTOUR.
//
// Ordre de Mohamed, 16 août : « Je clique. Il ne se passe RIEN, ou j'obtiens
// la même liste générique que partout ailleurs. Ce sont des coquilles vides.
// Et une coquille vide coûte plus cher qu'une absence : elle promet, puis
// elle déçoit. »
//
//        ► TOUTE PROPOSITION AFFICHÉE EST UN ENGAGEMENT. ◄
//
// ════════ LE RENVERSEMENT ════════
//
// Jusqu'ici, les propositions étaient ÉCRITES EN DUR dans lib/pistes.ts :
// on inventait des phrases qui sonnaient bien — « à l'abri s'il pleut »,
// « avec un espace pour les femmes », « sans rien dépenser » — en espérant
// que le moteur suive. Il ne suivait pas, parce que Google ne sait filtrer
// aucune de ces trois choses.
//
// On part désormais de l'autre bout : des ADRESSES QU'ON A DÉJÀ EN MAIN.
// Une proposition n'existe que si, en la calculant, on trouve au moins une
// adresse derrière elle. On affiche même le compte : « Encore ouvert (4) ».
// Impossible d'aboutir sur une liste vide — le filtre a été appliqué AVANT
// que le bouton n'apparaisse.
//
// Conséquence directe : le clic est instantané et ne coûte RIEN. Pas de
// nouvel appel à Google, pas de quota consommé, pas d'attente. Il ne peut
// pas « ne rien se passer » : la liste change sous les yeux.
//
// ════════ CE SUR QUOI ON A LE DROIT DE FILTRER ════════
//
// Uniquement des champs que Google nous rend, mesurés sur chaque fiche :
//
//   ouvert      ← currentOpeningHours.openNow
//   prix        ← priceLevel (1 à 4)
//   note/nbAvis ← rating / userRatingCount
//   famille     ← primaryType (bakery, meal_takeaway, mosque, museum…)
//   distanceM   ← calculée par nous depuis location
//
// SUPPRIMÉ faute de filtre réel — et c'est un bon signe, pas un échec :
//   · « à l'abri s'il pleut »   → Google n'expose rien sur le couvert.
//   · « avec un espace femmes » → aucun champ ; on ne devine pas un
//                                 équipement de mosquée.
//   · « sans rien dépenser »    → priceLevel absent sur la plupart des
//                                 activités : la promesse serait creuse.
//   · « en deux heures à pied » → aucune durée de visite chez Google.
//   · « en famille, pour s'asseoir » → goodForChildren n'existe que sur les
//                                 trois fiches enrichies : on ne peut pas
//                                 le garantir sur la liste entière.
//
// On ne bricole JAMAIS une devinette sur le nom de l'établissement pour
// faire semblant d'avoir un filtre.

/** Les familles qu'on sait nommer, d'après le primaryType rendu par Google. */
const FAMILLES = [
  ['bakery', 'Une pâtisserie, une boulangerie', 'A bakery'],
  ['cafe', 'Un café', 'A café'],
  ['coffee_shop', 'Un café', 'A café'],
  ['meal_takeaway', 'À emporter', 'Takeaway'],
  ['restaurant', 'Un vrai restaurant, pour s’asseoir', 'A sit-down restaurant'],
  ['mosque', 'Une mosquée', 'A mosque'],
  ['museum', 'Un musée', 'A museum'],
  ['park', 'Un parc', 'A park'],
  ['tourist_attraction', 'Un lieu à voir', 'A sight'],
  ['art_gallery', 'Une galerie', 'A gallery'],
  ['historical_landmark', 'Un lieu historique', 'A historical site'],
  ['zoo', 'Un zoo', 'A zoo'],
  ['aquarium', 'Un aquarium', 'An aquarium'],
]

/** Vitesse de marche retenue partout dans le site : 4,5 km/h. */
const M_PAR_MIN_A_PIED = 75

/**
 * Les propositions réellement honorables, calculées sur les adresses en
 * main. Chacune porte son compte ; aucune n'est rendue à zéro.
 *
 * `fiches` : tout ce qu'on a (les retenues ET les autres).
 * `ctx`    : { priere: { nom, minutes } | null }
 */
/** Le filtre d'une proposition, écrit UNE fois : l'affichage et le clic ne
 *  peuvent pas diverger, donc le compte annoncé est toujours le bon. */
function garde(id, f, ctx) {
  if (id === 'ouvert') return f.ouvert === true
  if (id === 'tout-pres') return f.distanceM <= 400
  if (id === 'petit-prix') return typeof f.prix === 'number' && f.prix > 0 && f.prix <= 2
  if (id === 'bien-note') return typeof f.note === 'number' && f.note >= 4.2 && (f.nbAvis ?? 0) >= 20
  if (id === 'avant-priere') {
    const m = ctx?.priere?.minutes ?? 0
    return f.distanceM <= Math.max(0, m - 10) * M_PAR_MIN_A_PIED
  }
  if (id.startsWith('fam:')) return f.famille === id.slice(4)
  return true
}

export function propositions(fiches, ctx, en = false) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  if (L.length < 2) return [] // une seule adresse : rien à trier, rien à proposer
  const out = []
  const ajoute = (id, fr, ang) => {
    const n = L.filter((f) => garde(id, f, ctx)).length
    // 🔴 LA RÈGLE : pas de résultat derrière, pas de proposition. Et pas
    // non plus si elle rend TOUTE la liste — elle ne trierait rien, et
    // « deux propositions qui donnent le même résultat, c'est une
    // proposition de trop ».
    if (n < 1 || n === L.length) return
    out.push({ id, libelle: `${en ? ang : fr} (${n})`, n })
  }

  // ⏱️ LE MOMENT — d'abord, parce que c'est ce qui périme le plus vite.
  const p = ctx?.priere
  if (p && p.minutes <= 75) {
    // On ne propose « avant la prière » que si des adresses sont VRAIMENT
    // atteignables à pied dans le temps restant, aller compris.
    ajoute('avant-priere',
      `Atteignable avant ${p.nom} (${p.minutes} min)`,
      `Reachable before ${p.nom} (${p.minutes} min)`)
  }

  ajoute('ouvert', 'Encore ouvert maintenant', 'Still open now')
  ajoute('tout-pres', 'À moins de 5 minutes à pied', 'Under a 5-minute walk')
  ajoute('petit-prix', 'Petit prix', 'Cheap')
  ajoute('bien-note', 'Les mieux notés', 'Best rated')

  // 🍽️ LES FAMILLES PRÉSENTES, et elles seules. « S'il y a trois kebabs et
  // deux pâtisseries dans le quartier, on propose un kebab et une
  // pâtisserie. Pas un restaurant japonais. »
  for (const [type, fr, ang] of FAMILLES) {
    ajoute(`fam:${type}`, fr, ang)
  }

  // 🔴 DEUX PROPOSITIONS QUI RENDENT LA MÊME LISTE, C'EST UNE PROPOSITION
  // DE TROP. « Petit prix » et « Les mieux notés » peuvent très bien
  // désigner exactement les trois mêmes adresses : la seconde ne servirait
  // alors qu'à faire nombre. On garde la première, on jette la doublure.
  const vues = new Set()
  const distinctes = []
  for (const pr of out) {
    const signature = L.filter((f) => garde(pr.id, f, ctx)).map((f) => f.nom ?? f.id).sort().join('|')
    if (vues.has(signature)) continue
    vues.add(signature)
    distinctes.push(pr)
  }

  // Les propositions issues de ce qu'il y a VRAIMENT autour (« une
  // pâtisserie », « un café ») passent devant les filtres généraux : c'est
  // elles qu'aucun annuaire ne sait produire, et c'est notre sur-mesure.
  const familles = distinctes.filter((x) => x.id.startsWith('fam:'))
  const autres = distinctes.filter((x) => !x.id.startsWith('fam:'))
  // Deux qui tiennent parole valent mieux que six qui font joli.
  return [...familles.slice(0, 2), ...autres].slice(0, 4)
}

/** Le filtre EXACT d'une proposition — la MÊME règle que celle qui a
 *  décidé de l'afficher. Un seul code : le compte annoncé ne peut pas
 *  mentir sur ce que le clic va rendre. */
export function filtrer(fiches, id, ctx) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  if (!id) return L
  return L.filter((f) => garde(id, f, ctx))
}
