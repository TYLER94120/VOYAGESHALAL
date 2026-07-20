// Guides visuels « [Ville] pour un voyageur musulman » — 1 phrase forte,
// des chips (icône + 2-3 mots) et un carrousel « 3 jours » avec de vraies
// photos de monuments (Wikimedia Commons, revues à la planche-contact).
// RÈGLE : uniquement des lieux notoires vérifiables — jamais d'adresse inventée.

import guideImages from '@/data/guideImages.json'

export interface GuideChip { icon: string; fr: string; en: string }
export interface GuideEtape { icon: string; fr: string; en: string }
export interface GuideJour {
  titre: string      // « Jour 1 · Sultanahmet »
  titreEn: string
  photoKey: string   // clé dans data/guideImages.json
  maps: string       // requête Google Maps du lieu-phare du jour
  etapes: GuideEtape[] // 3 max, 4-6 mots
}
export interface CityGuide { hook: string; hookEn: string; chips: GuideChip[]; jours: GuideJour[] }

const IMG = guideImages as Record<string, { url: string; credit?: string }>
export function guidePhoto(key: string): { url: string; credit?: string } | null {
  return IMG[key] ?? null
}

export const CITY_GUIDES: Record<string, CityGuide> = {
  istanbul: {
    hook: 'La ville musulmane la plus facile au monde.',
    hookEn: 'The easiest Muslim city in the world.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏨', fr: 'Loger à Sultanahmet', en: 'Stay in Sultanahmet' },
      { icon: '🌅', fr: 'Sites dès l\'ouverture', en: 'Sites at opening' },
      { icon: '⛴', fr: 'Soirées sur le Bosphore', en: 'Evenings on the Bosphorus' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Sultanahmet', titreEn: 'Day 1 · Sultanahmet', photoKey: 'istanbul-j1', maps: 'Blue Mosque Istanbul',
        etapes: [
          { icon: '🕌', fr: 'Mosquée Bleue + Sainte-Sophie', en: 'Blue Mosque + Hagia Sophia' },
          { icon: '🏛', fr: 'Topkapı et citerne Basilique', en: 'Topkapı & Basilica Cistern' },
          { icon: '🍽', fr: 'Dîner halal au quartier', en: 'Halal dinner nearby' },
        ],
      },
      {
        titre: 'Jour 2 · Bazars & Süleymaniye', titreEn: 'Day 2 · Bazaars & Süleymaniye', photoKey: 'istanbul-j2', maps: 'Süleymaniye Mosque Istanbul',
        etapes: [
          { icon: '🛍', fr: 'Grand Bazar, Bazar égyptien', en: 'Grand & Spice Bazaars' },
          { icon: '🕌', fr: 'Dhuhr à la Süleymaniye', en: 'Dhuhr at Süleymaniye' },
          { icon: '⛴', fr: 'Ferry vers Üsküdar', en: 'Ferry to Üsküdar' },
        ],
      },
      {
        titre: 'Jour 3 · Bosphore', titreEn: 'Day 3 · Bosphorus', photoKey: 'istanbul-j3', maps: 'Eyüp Sultan Mosque Istanbul',
        etapes: [
          { icon: '📸', fr: 'Ruelles de Balat', en: 'Balat\'s colorful lanes' },
          { icon: '🕌', fr: 'Eyüp Sultan + Pierre Loti', en: 'Eyüp Sultan + Pierre Loti' },
          { icon: '🚢', fr: 'Croisière au couchant', en: 'Sunset cruise' },
        ],
      },
    ],
  },
  marrakech: {
    hook: 'La médina, les souks, le désert — tout halal.',
    hookEn: 'Medina, souks, desert — all halal.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏨', fr: 'Riad en médina', en: 'Riad in the medina' },
      { icon: '🤝', fr: 'Négocier souriant', en: 'Bargain with a smile' },
      { icon: '🌅', fr: 'Visites le matin', en: 'Sightsee mornings' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Médina', titreEn: 'Day 1 · Medina', photoKey: 'marrakech-j1', maps: 'Koutoubia Mosque Marrakech',
        etapes: [
          { icon: '🕌', fr: 'Koutoubia et ses jardins', en: 'Koutoubia & its gardens' },
          { icon: '🛍', fr: 'Souks au fil des ruelles', en: 'Souks lane by lane' },
          { icon: '🌙', fr: 'Jemaa el-Fna le soir', en: 'Jemaa el-Fna at night' },
        ],
      },
      {
        titre: 'Jour 2 · Palais & jardins', titreEn: 'Day 2 · Palaces & gardens', photoKey: 'marrakech-j2', maps: 'Bahia Palace Marrakech',
        etapes: [
          { icon: '🏛', fr: 'Ben Youssef + palais Bahia', en: 'Ben Youssef + Bahia Palace' },
          { icon: '🌿', fr: 'Jardin Majorelle (réserver)', en: 'Majorelle Garden (book)' },
          { icon: '🍽', fr: 'Tajine au coucher du soleil', en: 'Tagine at sunset' },
        ],
      },
      {
        titre: 'Jour 3 · Hors les murs', titreEn: 'Day 3 · Beyond the walls', photoKey: 'marrakech-j3', maps: 'Agafay desert',
        etapes: [
          { icon: '🏜', fr: 'Désert d\'Agafay ou Ourika', en: 'Agafay desert or Ourika' },
          { icon: '☕', fr: 'Thé en terrasse au retour', en: 'Rooftop mint tea back' },
        ],
      },
    ],
  },
  dubai: {
    hook: 'Le confort halal absolu, du souk au gratte-ciel.',
    hookEn: 'Peak halal comfort, souk to skyscraper.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏨', fr: 'Loger à Downtown', en: 'Stay Downtown' },
      { icon: '🚇', fr: 'Métro + VTC', en: 'Metro + ride-hailing' },
      { icon: '🌡', fr: 'Venir nov.–mars', en: 'Come Nov–Mar' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Downtown', titreEn: 'Day 1 · Downtown', photoKey: 'dubai-j1', maps: 'Burj Khalifa',
        etapes: [
          { icon: '🏙', fr: 'Burj Khalifa au couchant', en: 'Burj Khalifa at sunset' },
          { icon: '⛲', fr: 'Fontaines de Dubai Mall', en: 'Dubai Fountain shows' },
        ],
      },
      {
        titre: 'Jour 2 · Vieux Dubaï', titreEn: 'Day 2 · Old Dubai', photoKey: 'dubai-j2', maps: 'Al Fahidi Historical District',
        etapes: [
          { icon: '🛶', fr: 'Al Fahidi + abra sur la Creek', en: 'Al Fahidi + Creek abra' },
          { icon: '🛍', fr: 'Souks or et épices', en: 'Gold & spice souks' },
          { icon: '🕌', fr: 'Mosquée de Jumeirah', en: 'Jumeirah Mosque' },
        ],
      },
      {
        titre: 'Jour 3 · Marina & désert', titreEn: 'Day 3 · Marina & desert', photoKey: 'dubai-j3', maps: 'Dubai Marina',
        etapes: [
          { icon: '🏖', fr: 'Marina et plage JBR', en: 'Marina & JBR beach' },
          { icon: '🏜', fr: 'Safari désert au couchant', en: 'Sunset desert safari' },
        ],
      },
    ],
  },
  'kuala-lumpur': {
    hook: 'L\'Asie halal, certifiée et souriante.',
    hookEn: 'Halal Asia, certified and smiling.',
    chips: [
      { icon: '✅', fr: 'Certification JAKIM', en: 'JAKIM certification' },
      { icon: '🏨', fr: 'Loger à KLCC', en: 'Stay near KLCC' },
      { icon: '🕌', fr: 'Prière dans chaque mall', en: 'Prayer rooms in malls' },
      { icon: '🌧', fr: 'Pauses clim l\'après-midi', en: 'AC breaks afternoons' },
    ],
    jours: [
      {
        titre: 'Jour 1 · KLCC', titreEn: 'Day 1 · KLCC', photoKey: 'kuala-lumpur-j1', maps: 'Petronas Towers',
        etapes: [
          { icon: '🏙', fr: 'Tours Petronas (réserver)', en: 'Petronas Towers (book)' },
          { icon: '🕌', fr: 'As-Syakirin dans le parc', en: 'As-Syakirin in the park' },
          { icon: '🍜', fr: 'Street-food à Bukit Bintang', en: 'Bukit Bintang street-food' },
        ],
      },
      {
        titre: 'Jour 2 · Vieux centre', titreEn: 'Day 2 · Old center', photoKey: 'kuala-lumpur-j2', maps: 'Masjid Negara Kuala Lumpur',
        etapes: [
          { icon: '🕌', fr: 'Masjid Negara + Masjid Jamek', en: 'Masjid Negara + Masjid Jamek' },
          { icon: '🏛', fr: 'Musée d\'art islamique', en: 'Islamic Arts Museum' },
        ],
      },
      {
        titre: 'Jour 3 · Batu Caves', titreEn: 'Day 3 · Batu Caves', photoKey: 'kuala-lumpur-j3', maps: 'Batu Caves',
        etapes: [
          { icon: '⛰', fr: 'Batu Caves tôt le matin', en: 'Batu Caves early morning' },
          { icon: '🛍', fr: 'Malls et salles de prière', en: 'Malls with prayer rooms' },
        ],
      },
    ],
  },
  'le-caire': {
    hook: 'Intense, immense — et un patrimoine islamique unique.',
    hookEn: 'Intense, immense — unique Islamic heritage.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏨', fr: 'Loger à Zamalek', en: 'Stay in Zamalek' },
      { icon: '🚕', fr: 'VTC recommandés', en: 'Use ride-hailing' },
      { icon: '🐫', fr: 'Pyramides à l\'aube', en: 'Pyramids at dawn' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Guizeh', titreEn: 'Day 1 · Giza', photoKey: 'le-caire-j1', maps: 'Pyramids of Giza',
        etapes: [
          { icon: '🐫', fr: 'Pyramides dès l\'ouverture', en: 'Pyramids at opening' },
          { icon: '🏛', fr: 'Grand Musée égyptien', en: 'Grand Egyptian Museum' },
        ],
      },
      {
        titre: 'Jour 2 · Caire islamique', titreEn: 'Day 2 · Islamic Cairo', photoKey: 'le-caire-j2', maps: 'Al-Azhar Mosque Cairo',
        etapes: [
          { icon: '🕌', fr: 'Al-Azhar + rue al-Muizz', en: 'Al-Azhar + al-Muizz street' },
          { icon: '🛍', fr: 'Khan el-Khalili', en: 'Khan el-Khalili bazaar' },
          { icon: '🕌', fr: 'Citadelle au couchant', en: 'Citadel at sunset' },
        ],
      },
      {
        titre: 'Jour 3 · Le Nil', titreEn: 'Day 3 · The Nile', photoKey: 'le-caire-j3', maps: 'Ibn Tulun Mosque Cairo',
        etapes: [
          { icon: '⛵', fr: 'Felouque sur le Nil', en: 'Felucca on the Nile' },
          { icon: '🕌', fr: 'Ibn Touloun, la paisible', en: 'Peaceful Ibn Tulun' },
        ],
      },
    ],
  },
  casablanca: {
    hook: 'Une journée pour Hassan II, puis le Maroc s\'ouvre.',
    hookEn: 'One day for Hassan II, then Morocco opens up.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏨', fr: 'Loger au centre', en: 'Stay central' },
      { icon: '🚄', fr: 'Trains vers tout le Maroc', en: 'Trains to all Morocco' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Hassan II', titreEn: 'Day 1 · Hassan II', photoKey: 'casablanca-j1', maps: 'Hassan II Mosque',
        etapes: [
          { icon: '🕌', fr: 'Hassan II : prière + visite', en: 'Hassan II: prayer + tour' },
          { icon: '🏛', fr: 'Centre art déco, médina', en: 'Art-deco center, medina' },
          { icon: '🌊', fr: 'Corniche au couchant', en: 'Corniche at sunset' },
        ],
      },
      {
        titre: 'Jour 2 · Marché & départ', titreEn: 'Day 2 · Market & onward', photoKey: 'casablanca-j2', maps: 'Marché Central Casablanca',
        etapes: [
          { icon: '🐟', fr: 'Poisson grillé au Marché central', en: 'Grilled fish, Central Market' },
          { icon: '🚄', fr: 'Train vers Rabat ou Marrakech', en: 'Train to Rabat or Marrakech' },
        ],
      },
    ],
  },
  londres: {
    hook: 'Des centaines d\'adresses halal, sans effort.',
    hookEn: 'Hundreds of halal spots, effortlessly.',
    chips: [
      { icon: '🍽', fr: 'Halal signalé partout', en: 'Reported halal everywhere' },
      { icon: '🏨', fr: 'Loger près du métro', en: 'Stay near the Tube' },
      { icon: '🕌', fr: 'Grandes mosquées', en: 'Major mosques' },
      { icon: '💷', fr: 'Réserver tôt', en: 'Book early' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Westminster', titreEn: 'Day 1 · Westminster', photoKey: 'londres-j1', maps: 'Big Ben London',
        etapes: [
          { icon: '🏛', fr: 'Big Ben + Buckingham', en: 'Big Ben + Buckingham' },
          { icon: '🕌', fr: 'London Central Mosque', en: 'London Central Mosque' },
          { icon: '🥙', fr: 'Dîner sur Edgware Road', en: 'Dinner on Edgware Road' },
        ],
      },
      {
        titre: 'Jour 2 · La City & l\'Est', titreEn: 'Day 2 · The City & East', photoKey: 'londres-j2', maps: 'Tower Bridge London',
        etapes: [
          { icon: '🏰', fr: 'Tour de Londres + Tower Bridge', en: 'Tower of London + Bridge' },
          { icon: '🕌', fr: 'East London Mosque', en: 'East London Mosque' },
          { icon: '🍛', fr: 'Curry halal à Brick Lane', en: 'Halal curry, Brick Lane' },
        ],
      },
      {
        titre: 'Jour 3 · Musées', titreEn: 'Day 3 · Museums', photoKey: 'londres-j3', maps: 'British Museum',
        etapes: [
          { icon: '🏛', fr: 'British Museum (gratuit)', en: 'British Museum (free)' },
          { icon: '🛍', fr: 'Oxford Street, Harrods', en: 'Oxford Street, Harrods' },
        ],
      },
    ],
  },
  antalya: {
    hook: 'Soleil, vieille ville ottomane et plages femmes.',
    hookEn: 'Sun, Ottoman old town, ladies-only beaches.',
    chips: [
      { icon: '🕌', fr: 'Halal partout', en: 'Halal everywhere' },
      { icon: '🏊', fr: 'Resorts piscine femmes', en: 'Ladies-pool resorts' },
      { icon: '🏨', fr: 'Kaleiçi ou Lara', en: 'Kaleiçi or Lara' },
      { icon: '☀️', fr: 'Plage juin–sept.', en: 'Beach Jun–Sep' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Kaleiçi', titreEn: 'Day 1 · Kaleiçi', photoKey: 'antalya-j1', maps: 'Kaleici Antalya',
        etapes: [
          { icon: '🏛', fr: 'Porte d\'Hadrien, vieux port', en: 'Hadrian\'s Gate, old harbor' },
          { icon: '🕌', fr: 'Minaret cannelé Yivli', en: 'Fluted Yivli Minaret' },
          { icon: '🌅', fr: 'Couchant au parc Karaalioğlu', en: 'Sunset, Karaalioğlu Park' },
        ],
      },
      {
        titre: 'Jour 2 · Cascades & plages', titreEn: 'Day 2 · Falls & beaches', photoKey: 'antalya-j2', maps: 'Lower Duden Waterfalls',
        etapes: [
          { icon: '💦', fr: 'Cascades de Düden', en: 'Düden waterfalls' },
          { icon: '🏖', fr: 'Konyaaltı ou plage privée', en: 'Konyaaltı or private beach' },
        ],
      },
      {
        titre: 'Jour 3 · Ruines antiques', titreEn: 'Day 3 · Ancient ruins', photoKey: 'antalya-j3', maps: 'Aspendos',
        etapes: [
          { icon: '🏛', fr: 'Aspendos et Pergé', en: 'Aspendos & Perge' },
        ],
      },
    ],
  },
  paris: {
    hook: 'Les icônes, plus la Grande Mosquée en refuge.',
    hookEn: 'The icons, plus the Grand Mosque as refuge.',
    chips: [
      { icon: '🥙', fr: 'Halal au 11e, Belleville', en: 'Halal: 11th, Belleville' },
      { icon: '🏨', fr: 'Loger central (1er-11e)', en: 'Stay central (1st–11th)' },
      { icon: '🎟', fr: 'Billets en ligne', en: 'Book tickets online' },
      { icon: '🚇', fr: 'Tout en métro', en: 'Everything by metro' },
    ],
    jours: [
      {
        titre: 'Jour 1 · Les icônes', titreEn: 'Day 1 · The icons', photoKey: 'paris-j1', maps: 'Eiffel Tower',
        etapes: [
          { icon: '🗼', fr: 'Tour Eiffel + Trocadéro', en: 'Eiffel Tower + Trocadéro' },
          { icon: '🚶', fr: 'Champs-Élysées, Arc de Triomphe', en: 'Champs-Élysées, Arc de Triomphe' },
          { icon: '🥙', fr: 'Dîner halal au 11e', en: 'Halal dinner, 11th arr.' },
        ],
      },
      {
        titre: 'Jour 2 · Grande Mosquée', titreEn: 'Day 2 · Grand Mosque', photoKey: 'paris-j2', maps: 'Grande Mosquée de Paris',
        etapes: [
          { icon: '🏛', fr: 'Louvre à l\'ouverture', en: 'Louvre at opening' },
          { icon: '🕌', fr: 'Grande Mosquée : prière + thé', en: 'Grand Mosque: prayer + tea' },
          { icon: '🌿', fr: 'Jardin des Plantes', en: 'Jardin des Plantes' },
        ],
      },
      {
        titre: 'Jour 3 · Flânerie', titreEn: 'Day 3 · Wandering', photoKey: 'paris-j3', maps: 'Louvre Museum',
        etapes: [
          { icon: '📸', fr: 'Montmartre au matin', en: 'Montmartre in the morning' },
          { icon: '🛍', fr: 'Grands magasins, Marais', en: 'Department stores, Marais' },
        ],
      },
    ],
  },
}

export function getCityGuide(slug?: string): CityGuide | null {
  if (!slug) return null
  return CITY_GUIDES[slug] ?? null
}
