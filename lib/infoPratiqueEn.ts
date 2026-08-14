// 🌍 LES INFOS PRATIQUES, EN ANGLAIS SUR LE DOMAINE ANGLAIS.
//
// LE DÉFAUT, MESURÉ le 15 août : le bloc « infos pratiques » des fiches
// villes (visa, vaccins, transport, meilleure époque, prise électrique,
// décalage horaire, monnaie, langue) était écrit en français et servi tel
// quel sur gohalaltravel.com. 189 fiches sur 354 étaient concernées, et
// AUCUNE n'avait de version anglaise. C'est le défaut que la compétence
// « servir-deux-domaines » décrit comme le plus grave : il se voit tout
// de suite et il coûte le classement.
//
// POURQUOI UNE RÈGLE ET NON 189 CORRECTIONS À LA MAIN. Mesuré : les
// formulations sont massivement répétitives — 12 valeurs couvrent 82 à
// 100 % de chaque champ (« Selon la saison. » revient 126 fois, « Aucun
// obligatoire » 47 fois). Une règle traduit tout d'un coup, et elle
// traduit AUSSI la fiche qui sera écrite demain.
//
// LA RÈGLE D'HONNÊTETÉ : on ne traduit que ce qu'on reconnaît. Une valeur
// inconnue n'est PAS servie en anglais et n'est PAS devinée — la ligne
// disparaît de la fiche anglaise. Mieux vaut une ligne absente qu'une
// ligne en français, et infiniment mieux qu'une traduction inventée sur
// un fait pratique (un visa, un vaccin). C'est la même règle que partout
// ailleurs : on ne remplit pas un vide avec une supposition.
//
// CE QU'ON NE TRADUIT JAMAIS : les noms propres de lieux. « Mosquée
// Mohamed V » reste « Mosquée Mohamed V » sur les deux domaines — c'est
// le nom écrit sur le panneau, celui qu'on demande dans la rue. Ce
// fichier ne touche qu'aux phrases descriptives.

/** Traductions exactes, relevées sur les valeurs réellement présentes. */
const EXACT: Record<string, string> = {
  // — transport
  'Accessible par avion et transports locaux.': 'Reachable by plane and local transport.',
  'Accessible par avion et transports en commun locaux.': 'Reachable by plane and local public transport.',
  'Accessible par avion / transports locaux.': 'Reachable by plane / local transport.',
  'Accessible en bus (CTM/Supratours), grand taxi ou voiture.': 'Reachable by bus (CTM/Supratours), shared taxi or car.',
  // — meilleure époque
  'Selon la saison.': 'Depends on the season.',
  'Printemps et automne (climat tempéré).': 'Spring and autumn (mild climate).',
  'Printemps et automne.': 'Spring and autumn.',
  'Printemps et automne (climat doux).': 'Spring and autumn (gentle climate).',
  // — conseil halal
  "Repérez restaurants halal et mosquées via l'application.": 'Find halal restaurants and mosques through the app.',
  // — vaccins
  'Aucun obligatoire': 'None required',
  'Aucun obligatoire (vérifier recommandations)': 'None required (check current recommendations)',
  'Aucun obligatoire ; consulter les recommandations en vigueur': 'None required; check current recommendations',
  'Fièvre jaune obligatoire, paludisme': 'Yellow fever required, malaria risk',
  'Fièvre jaune recommandée': 'Yellow fever recommended',
  'Fièvre jaune recommandée, paludisme selon zones': 'Yellow fever recommended, malaria in some areas',
  // — visa
  'Espace Schengen — pas de visa pour les Français': 'Schengen Area — no visa for French citizens',
  'e-Visa turc ou exemption selon nationalité': 'Turkish e-Visa or exemption depending on nationality',
  'ESTA obligatoire pour les Français': 'ESTA required for French citizens',
  'e-Visa pakistanais disponible en ligne': 'Pakistani e-Visa available online',
  // — langue
  'Arabe, Tamazight, Français': 'Arabic, Tamazight, French',
  'Tamazight (Tarifit), Arabe': 'Tamazight (Tarifit), Arabic',
  'Arabe, Tamazight (Tarifit), Français': 'Arabic, Tamazight (Tarifit), French',
  // — monnaie
  'MAD (Dirham marocain)': 'MAD (Moroccan dirham)',
}


/** Adjectifs de nationalité — ils reviennent dans les visas et les monnaies. */
const NAT: Record<string, string> = {
  US: 'US', us: 'US', américain: 'American', canadien: 'Canadian', canadienne: 'Canadian',
  pakistanaise: 'Pakistani', égyptien: 'Egyptian', égyptienne: 'Egyptian', indien: 'Indian', indienne: 'Indian',
  éthiopien: 'Ethiopian', ghanéen: 'Ghanaian', kényan: 'Kenyan', kényane: 'Kenyan',
  nigérian: 'Nigerian', pakistanais: 'Pakistani', turc: 'Turkish', turque: 'Turkish',
  marocain: 'Moroccan', marocaine: 'Moroccan', thaïlandais: 'Thai', thaïlandaise: 'Thai',
  tunisien: 'Tunisian', tunisienne: 'Tunisian', jordanien: 'Jordanian', jordanienne: 'Jordanian',
  sénégalais: 'Senegalese', sénégalaise: 'Senegalese', omanais: 'Omani', omanaise: 'Omani',
  saoudien: 'Saudi', saoudienne: 'Saudi', qatari: 'Qatari', émirati: 'Emirati',
}

/** Unités monétaires courantes. */
const DEVISES: Record<string, string> = {
  livre: 'pound', dirham: 'dirham', dinar: 'dinar', riyal: 'riyal', rial: 'rial',
  roupie: 'rupee', pakistanaise: 'Pakistani', shilling: 'shilling', baht: 'baht', birr: 'birr', franc: 'franc',
  dollar: 'dollar', euro: 'euro', couronne: 'krona', peso: 'peso', naira: 'naira', ringgit: 'ringgit', rand: 'rand',
}

/** Motifs mécaniques : mêmes phrases, un nombre change. */
const MOTIFS: [RegExp, (m: RegExpMatchArray) => string][] = [
  // « e-Visa égyptien obligatoire », « Visa ghanéen obligatoire (e-Visa disponible) »
  [/^(e-Visa|Visa)\s+(?:touristique\s+)?(\p{L}+?)(?:\s+touristique)?\s+obligatoire(\s*\(e-Visa disponible\))?$/u,
    (m) => NAT[m[2].toLowerCase()] ? `${NAT[m[2].toLowerCase()]} ${m[1]} required${m[3] ? ' (e-Visa available)' : ''}` : ''],
  // « ESTA obligatoire pour les Français », « AVE (eTA) obligatoire pour les Français »
  [/^(.+?)\s+obligatoire pour les Français$/, (m) => `${m[1]} required for French citizens`],
  // « Visa à l'arrivée ou exemption selon durée »
  [/^Visa à l'arrivée ou exemption selon durée$/, () => 'Visa on arrival or exemption depending on length of stay'],
  [/^Visa à l'arrivée disponible pour de nombreuses nationalités$/, () => 'Visa on arrival available for many nationalities'],
  [/^e-Visa disponible pour de nombreuses nationalités$/, () => 'e-Visa available for many nationalities'],
  [/^e-Visa (\p{L}+) \(ASAN Visa\) en ligne$/u, (m) => NAT[m[1].toLowerCase()] ? `${NAT[m[1].toLowerCase()]} e-Visa (ASAN Visa) online` : ''],
  [/^e-Visa (\p{L}+)(?: en ligne)? ou (?:visa à l'arrivée|exemption selon nationalité)$/u,
    (m) => NAT[m[1].toLowerCase()] ? `${NAT[m[1].toLowerCase()]} e-Visa or exemption depending on nationality` : ''],
  [/^e-Visa (\p{L}+) ou visa à l'arrivée$/u, (m) => NAT[m[1].toLowerCase()] ? `${NAT[m[1].toLowerCase()]} e-Visa or visa on arrival` : ''],
  [/^Pas de visa requis pour les Français(?:\/Belges\/Suisses)?\s*\(?([^)]*)\)?$/,
    (m) => `No visa required for French citizens${m[1] ? ` (${m[1].replace('90 jours', '90 days').replace('séjour touristique', 'tourist stay')})` : ''}`],
  // « Livre égyptienne (EGP) », « Baht thaïlandais (THB) », « Shilling kényan (KES) »
  [/^(\p{L}+)\s+(\p{L}+)\s*\(([A-Z]{3})\)$/u, (m) => {
    const d = DEVISES[m[1].toLowerCase()], n = NAT[m[2].toLowerCase()]
    return d && n ? `${n} ${d} (${m[3]})` : ''
  }],
  // « Exemption de visa pour les Français (90 jours) »
  [/^Exemption de visa pour les Français \((\d+) jours\)$/,
    (m) => `Visa-free for French citizens (${m[1]} days)`],
  [/^Exemption de visa pour les Français \(court séjour\)$/,
    () => 'Visa-free for French citizens (short stay)'],
  // « Type C/F — 230V » : purement technique, aucun mot à traduire
  [/^Type [A-Z](\/[A-Z])*\s*[—-]\s*\d+\s*V$/i, (m) => m[0]],
  // « +2h par rapport à Paris (hiver) », « -6h par rapport à Paris »
  [/^([+-]\d+)\s*h par rapport à Paris(?:\s*\((hiver|été)\))?$/,
    (m) => `${m[1]}h vs Paris${m[2] ? ` (${m[2] === 'hiver' ? 'winter' : 'summer'})` : ''}`],
  [/^Même heure que Paris$/, () => 'Same time as Paris'],
  [/^Même heure que Paris \((?:variable(?: selon DST)?|hiver)\)$/, (m) => `Same time as Paris (${/hiver/.test(m[0]) ? 'winter' : 'varies'})`],
  // « +1h à +2h par rapport à Paris », « +4h30 par rapport à Paris (hiver) »
  [/^([+-]\d+h?\d*)\s*à\s*([+-]\d+h?\d*)\s*par rapport à Paris(?:\s*\((hiver|été)\))?$/,
    (m) => `${m[1].replace(/h$/, '')}h to ${m[2].replace(/h$/, '')}h vs Paris${m[3] ? ` (${m[3] === 'hiver' ? 'winter' : 'summer'})` : ''}`],
  [/^([+-]\d+)h(\d+)\s*par rapport à Paris(?:\s*\((hiver|été)\))?$/,
    (m) => `${m[1]}h${m[2]} vs Paris${m[3] ? ` (${m[3] === 'hiver' ? 'winter' : 'summer'})` : ''}`],
  // « 200-400 MAD/jour (30-50€) hébergement inclus »
  [/^([\d\s-]+[A-Z]{3})\/jour(.*)$/, (m) => `${m[1].trim()}/day${traduireSuffixeBudget(m[2])}`],
]

function traduireSuffixeBudget(s: string): string {
  return s
    .replace(/hébergement inclus/g, 'accommodation included')
    .replace(/selon hébergement/g, 'depending on accommodation')
}


/** 📖 VOCABULAIRE CONTRÔLÉ — pour les champs qui sont des LISTES de mots
 *  (transport, langue, meilleure époque). La traduction n'est rendue que
 *  si TOUS les mots sont connus ; un seul mot inconnu et l'on renvoie
 *  `null`, donc la ligne est masquée. Une demi-traduction sur un fait
 *  pratique serait pire que pas de ligne du tout. */
const MOTS: Record<string, string> = {
  // mois
  janvier: 'January', février: 'February', mars: 'March', avril: 'April', mai: 'May',
  juin: 'June', juillet: 'July', août: 'August', septembre: 'September',
  octobre: 'October', novembre: 'November', décembre: 'December',
  // saisons & durées
  printemps: 'spring', été: 'summer', automne: 'autumn', hiver: 'winter',
  "toute l'année": 'All year round', an: 'year', année: 'year',
  // transport
  métro: 'metro', bus: 'bus', taxi: 'taxi', taxis: 'taxis', tramway: 'tram',
  train: 'train', vélo: 'bike', marche: 'walking', voiture: 'car', ferry: 'ferry',
  aéroport: 'airport', 'aéroport international': 'international airport',
  'location de voiture': 'car rental', 'métro de bakou': 'Baku metro', historique: 'historic',
  'transports locaux': 'local transport', vers: 'to', navettes: 'shuttles', rickshaw: 'rickshaw', microbus: 'minibus',
  'à pied': 'on foot', 'transports en commun': 'public transport',
  // langues
  arabe: 'Arabic', français: 'French', anglais: 'English', espagnol: 'Spanish',
  néerlandais: 'Dutch', turc: 'Turkish', berbère: 'Berber', tamazight: 'Tamazight',
  thaï: 'Thai', ourdou: 'Urdu', hindi: 'Hindi', télougou: 'Telugu', malais: 'Malay', persan: 'Persian',
  // liants tolérés
  et: 'and', ou: 'or', depuis: 'from',
}

/** Découpe « Métro, bus, taxis » ou « Novembre à Février » en morceaux. */
function traduireListe(v: string): string | null {
  // ⚠️ `\bà\b` ne fonctionne pas : « à » n'est pas un caractère de mot
  // pour \b en JavaScript, le séparateur n'était jamais reconnu et
  // « Novembre à Février » repartait non traduit. On sépare sur les
  // espaces autour du mot.
  const morceaux = v.split(/\s*(,|\/|—|\s-\s|\sà\s|\set\s|\sou\s)\s*/).filter((x) => x && x.trim())
  const out: string[] = []
  for (const brut of morceaux) {
    const m = brut.trim()
    if (/^[,/—-]$/.test(m)) { out.push(m === 'à' ? 'to' : m); continue }
    if (m === 'à') { out.push('to'); continue }
    if (m === 'et') { out.push('and'); continue }
    if (m === 'ou') { out.push('or'); continue }
    const k = m.toLowerCase().replace(/\.$/, '')
    if (MOTS[k]) { out.push(MOTS[k]); continue }
    // nombre, sigle ou nom propre non accentué : on garde tel quel
    if (!contientDuFrancais(m)) { out.push(m); continue }
    return null // un mot inconnu → on ne rend rien
  }
  // recomposition lisible : « Metro, bus, taxis », « November to February »
  const phrase = out.join(' ').replace(/\s+([,/])/g, '$1').replace(/\s{2,}/g, ' ').trim()
  return phrase ? phrase[0].toUpperCase() + phrase.slice(1) : null
}

/**
 * Traduit une valeur d'info pratique pour le domaine anglais.
 * Renvoie `null` quand on ne reconnaît pas la valeur : l'appelant doit
 * alors NE PAS afficher la ligne — jamais la servir en français, jamais
 * la deviner.
 */
export function infoPratiqueEn(valeur: string): string | null {
  const v = valeur.trim()
  if (!v) return null
  if (EXACT[v]) return EXACT[v]
  for (const [motif, rendu] of MOTIFS) {
    const m = v.match(motif)
    if (m) {
      const r = rendu(m)
      // Un motif qui rend une chaîne vide dit : « je reconnais la forme,
      // mais pas le mot qu'elle contient ». On masque plutôt que de rendre
      // une phrase à trou.
      return r || null
    }
  }
  // Rien de français dedans (chiffres, noms propres, sigles) : on peut
  // servir tel quel — « CFA », « GMT+4 », « Wi-Fi partout ».
  if (!contientDuFrancais(v)) return v
  // Dernière chance : une liste de mots tous connus (transport, langues, mois).
  return traduireListe(v)
}

/** Mots qui n'existent qu'en français : leur présence interdit de servir tel quel. */
// ⚠️ UNIQUEMENT des mots qui N'EXISTENT PAS en anglais. Ma première
// version listait « transport », « bus », « taxi » : elle déclarait donc
// française la traduction « Reachable by plane and local transport. » —
// 300 fausses alertes d'un coup. Un détecteur qui crie sur du bon anglais
// finit par être ignoré, ce qui est pire que pas de détecteur du tout.
// ⚠️ DEUX RÈGLES SÉPARÉES, et c'est un correctif : la version précédente
// mettait tout dans un seul groupe avec une frontière \b au DÉBUT
// seulement. « du » matchait donc le début de « Dutch », et la traduction
// « French, Dutch » était déclarée française. Les mots exigent une
// frontière des DEUX côtés ; les lettres accentuées, elles, ne peuvent pas
// en avoir — elles vivent dans leur propre règle.
const MOTS_FR = /\b(le|la|les|des|du|une|et|avec|pour|dans|selon|aucun|aucune|obligatoire|recommandé|recommandée|prévoir|environ|jours?|saison|hiver|printemps|automne|heure|langue|monnaie|avion|voiture|pied|depuis|chez|très|beaucoup)\b/i
const ACCENTS_FR = /[éèêëàâùûôîïç]/i

export function contientDuFrancais(s: string): boolean {
  return MOTS_FR.test(s) || ACCENTS_FR.test(s)
}
