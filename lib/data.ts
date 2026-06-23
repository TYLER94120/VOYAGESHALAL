import type { Destination, Guide, BlogPost } from './types'

export const destinations: Destination[] = [
  {
    city: 'Istanbul',
    country: 'Turquie',
    slug: 'istanbul',
    shortDescription: 'La perle du Bosphore entre Orient et Occident',
    description:
      "Istanbul est l'une des destinations halal les plus accessibles au monde. Avec ses milliers de mosquées, ses restaurants 100% halal et son ambiance musulmane authentique, la ville offre une expérience unique mêlant histoire ottomane, culture islamique et modernité.",
    coverImage: '/images/istanbul.jpg',
    halalScore: 5,
    mosqueeCount: 3113,
    restaurantHalalCount: 15000,
    population: '15 millions',
    bestTime: 'Avril–juin, Septembre–novembre',
    tags: ['Culture', 'Histoire', 'Gastronomie', 'Architecture'],
    restaurants: [
      { name: 'Hamdi Restaurant', address: 'Kalçın Sk. No:17, Eminönü', description: "Cuisine turque traditionnelle avec vue sur la Corne d'Or", rating: 4.7 },
      { name: 'Develi Bakliyat', address: 'Samatya, Fatih', description: 'Spécialiste du kebab depuis 1912, entièrement halal', rating: 4.5 },
      { name: 'Sultanahmet Köftecisi', address: 'Divan Yolu Cad. No:12', description: "Le meilleur köfte d'Istanbul depuis 1920", rating: 4.6 },
    ],
    mosques: [
      { name: 'Mosquée Bleue (Sultan Ahmed)', address: 'Sultanahmet Meydanı No:7', description: "Chef-d'œuvre ottoman du XVIIe siècle, 6 minarets iconiques", rating: 4.9 },
      { name: 'Mosquée Süleymaniye', address: 'Prof. Sıddık Sami Onar Caddesi', description: 'La plus grande mosquée d\'Istanbul, construite par Soliman le Magnifique', rating: 4.8 },
    ],
    activities: [
      { name: 'Palais de Topkapi', description: 'Ancienne résidence des sultans ottomans avec reliques islamiques', duration: '3–4 heures' },
      { name: 'Grand Bazar', description: "L'un des plus anciens marchés couverts du monde", duration: '2–3 heures' },
      { name: 'Croisière sur le Bosphore', description: 'Vue panoramique sur les deux continents', duration: '2 heures' },
    ],
    tips: [
      'La plupart des restaurants sont halal, pas besoin de vérifier systématiquement',
      'L\'appel à la prière (ezan) rythme la journée — très dépaysant et spirituel',
      'Prévoir une tenue modeste pour visiter les mosquées',
      'La carte Istanbulkart est indispensable pour les transports',
    ],
  },
  {
    city: 'Marrakech',
    country: 'Maroc',
    slug: 'marrakech',
    shortDescription: "La ville ocre, cœur de l'authenticité marocaine",
    description:
      "Marrakech est une destination halal naturelle par essence. Pays à majorité musulmane, le Maroc offre une expérience de voyage où le halal est la norme. La médina classée UNESCO vous transporte dans un autre siècle.",
    coverImage: '/images/marrakech.jpg',
    halalScore: 5,
    mosqueeCount: 500,
    restaurantHalalCount: 3000,
    population: '1 million',
    bestTime: 'Mars–mai, Septembre–novembre',
    tags: ['Médina', 'Souks', 'Gastronomie', 'Riads'],
    restaurants: [
      { name: 'Le Jardin', address: '32 Souk Sidi Abdelaziz, Médina', description: 'Cuisine marocaine raffinée dans un jardin luxuriant', rating: 4.6 },
      { name: 'Nomad', address: '1 Derb Aarjan, Rahba Lakdima', description: 'Cuisine moderne marocaine avec vue sur les souks', rating: 4.5 },
    ],
    mosques: [
      { name: 'Mosquée Koutoubia', address: 'Avenue Mohammed V', description: 'Symbole de Marrakech, minaret du XIIe siècle visible de toute la ville', rating: 4.8 },
    ],
    activities: [
      { name: 'Médina et souks', description: 'Labyrinthe de ruelles artisanales classé UNESCO', duration: 'Demi-journée' },
      { name: 'Jardins Majorelle', description: 'Oasis de verdure et musée berbère', duration: '2 heures' },
    ],
    tips: [
      'Tout est halal au Maroc — aucune inquiétude alimentaire',
      "Négocier est de mise dans les souks, c'est culturel",
      'Se méfier des faux guides aux abords de la médina',
      'Les riads offrent une expérience authentique et souvent plus calme',
    ],
  },
  {
    city: 'Dubaï',
    country: 'Émirats Arabes Unis',
    slug: 'dubai',
    shortDescription: 'Modernité et luxe au cœur du Golfe',
    description:
      "Dubaï est la destination halal la plus moderne du monde. Certifiée halal sur tous les plans, la ville combine gratte-ciels futuristes, plages, désert et une scène gastronomique halal internationale de très haut niveau.",
    coverImage: '/images/dubai.jpg',
    halalScore: 5,
    mosqueeCount: 700,
    restaurantHalalCount: 10000,
    population: '3.5 millions',
    bestTime: 'Novembre–avril',
    tags: ['Luxe', 'Shopping', 'Architecture', 'Désert'],
    restaurants: [
      { name: 'Nobu Dubai', address: 'Atlantic, The Palm', description: 'Restaurant japonais halal de renommée mondiale', rating: 4.7 },
      { name: 'Al Fanar Restaurant', address: 'Festival City Mall', description: 'Cuisine émiratie traditionnelle authentique', rating: 4.5 },
    ],
    mosques: [
      { name: 'Grande Mosquée de Jumeirah', address: 'Jumeirah Beach Road', description: 'La plus belle mosquée de Dubaï, ouverte aux non-musulmans', rating: 4.9 },
    ],
    activities: [
      { name: 'Burj Khalifa', description: 'Plus haut bâtiment du monde, vue à 360°', duration: '2–3 heures' },
      { name: 'Safari dans le désert', description: 'Dunes, chameau, dîner sous les étoiles', duration: 'Journée complète' },
    ],
    tips: [
      'Tout est certifié halal — même les hôtels internationaux ont des menus halal',
      'Alcool disponible dans certains hôtels — facile à éviter',
      'Dress code modeste dans les espaces publics',
      'Ramadan : ambiance exceptionnelle mais horaires décalés',
    ],
  },
  {
    city: 'Kuala Lumpur',
    country: 'Malaisie',
    slug: 'kuala-lumpur',
    shortDescription: "La capitale halal de l'Asie du Sud-Est",
    description:
      "Kuala Lumpur est considérée comme la capitale mondiale du tourisme halal. La Malaisie est le pays le plus avancé au monde en matière de certification halal.",
    coverImage: '/images/kuala-lumpur.jpg',
    halalScore: 5,
    mosqueeCount: 1000,
    restaurantHalalCount: 20000,
    population: '8 millions',
    bestTime: 'Toute l\'année (éviter mousson mai–octobre)',
    tags: ['Halal certifié', 'Modernité', 'Nature', 'Shopping'],
    restaurants: [
      { name: 'Nasi Kandar Pelita', address: 'Multiple locations', description: 'Institution malaisienne, ouvert 24h/24, halal certifié', rating: 4.4 },
    ],
    mosques: [
      { name: 'Mosquée Nationale (Masjid Negara)', address: 'Jalan Perdana', description: 'Mosquée nationale de Malaisie, architecture contemporaine', rating: 4.7 },
    ],
    activities: [
      { name: 'Tours Petronas', description: 'Jumelles emblématiques, parmi les plus hautes du monde', duration: '2 heures' },
    ],
    tips: [
      'Certification halal JAKIM — la plus stricte du monde',
      'Melting pot islamique : Malais, Pakistanais, Moyen-Orientaux',
      'Prix très abordables comparé à l\'Europe',
    ],
  },
  {
    city: 'Le Caire',
    country: 'Égypte',
    slug: 'le-caire',
    shortDescription: 'La mère du monde, berceau de la civilisation',
    description:
      "Le Caire est une ville à part dans l'univers du voyage halal. Capitale de l'islam sunnite avec Al-Azhar, ville des pharaons avec les pyramides de Gizeh.",
    coverImage: '/images/le-caire.jpg',
    halalScore: 5,
    mosqueeCount: 3000,
    restaurantHalalCount: 25000,
    population: '21 millions',
    bestTime: 'Octobre–avril',
    tags: ['Histoire', 'Archéologie', 'Islam', 'Culture'],
    restaurants: [
      { name: 'Koshary Abou Tarek', address: '16 Maarouf St, Downtown', description: 'Le meilleur koshary du Caire, plat national égyptien', rating: 4.5 },
    ],
    mosques: [
      { name: 'Mosquée Al-Azhar', address: 'El-Darb El-Ahmar', description: "L'une des plus anciennes universités du monde islamique (970 ap. J.-C.)", rating: 4.8 },
    ],
    activities: [
      { name: 'Pyramides de Gizeh', description: "L'une des 7 merveilles du monde antique", duration: 'Journée complète' },
    ],
    tips: [
      'Tout est halal en Égypte — pays à majorité musulmane',
      'Négocier pour tout : taxis, souvenirs, visites guidées',
      'Eviter l\'eau du robinet — boire en bouteille',
    ],
  },
  {
    city: 'Médine',
    country: 'Arabie Saoudite',
    slug: 'medine',
    shortDescription: "La ville du Prophète, cœur spirituel de l'islam",
    description:
      "Médine est la deuxième ville sainte de l'islam. Visiter la Mosquée du Prophète (Masjid an-Nabawi) est une expérience spirituelle incomparable.",
    coverImage: '/images/medine.jpg',
    halalScore: 5,
    mosqueeCount: 2000,
    restaurantHalalCount: 5000,
    population: '1.5 million',
    bestTime: 'Toute l\'année (éviter pèlerinage Hajj si non pèlerin)',
    tags: ['Spiritualité', 'Pèlerinage', 'Islam', 'Umrah'],
    restaurants: [
      { name: 'Restaurants Al-Ansar', address: 'Quartier central', description: 'Cuisine saoudienne traditionnelle à côté de la mosquée', rating: 4.3 },
    ],
    mosques: [
      { name: 'Masjid an-Nabawi', address: 'Centre de Médine', description: "La mosquée du Prophète Mohammed ﷺ — deuxième site le plus saint de l'islam", rating: 5.0 },
    ],
    activities: [
      { name: 'Visite du Masjid Quba', description: "Première mosquée construite dans l'histoire de l'islam", duration: '1 heure' },
    ],
    tips: [
      'Accessible uniquement aux musulmans',
      'Tenue islamique obligatoire en tout temps',
      'Réserver longtemps à l\'avance pendant Ramadan',
    ],
  },
]

export const guides: Guide[] = [
  {
    slug: 'voyage-halal-debutant',
    title: 'Guide complet du voyage halal pour débutants',
    description: 'Tout ce que vous devez savoir pour voyager halal en toute sérénité : alimentation, prière, hébergement et conseils pratiques.',
    coverImage: '/images/guide-debutant.jpg',
    category: 'Pratique',
    readTime: '8 min',
    publishedAt: '2026-01-10',
    tags: ['Débutant', 'Pratique', 'Conseils'],
    content: `<h2>L'alimentation halal en voyage</h2><p>La première préoccupation des voyageurs musulmans est la nourriture. Dans les pays musulmans, tout est halal par défaut. En Europe, cherchez les restaurants certifiés halal.</p><h2>La prière en voyage</h2><p>L'islam facilite la prière pour les voyageurs : raccourcissement (qasr) et regroupement (jam') des prières sont permis.</p><h2>Choisir son hébergement</h2><p>Préférer les hôtels sans bar ni casino. Booking.com permet de filtrer sur halal-friendly.</p>`,
  },
  {
    slug: 'top-destinations-halal-2026',
    title: 'Top 10 destinations halal 2026',
    description: 'Notre sélection des meilleures destinations de voyage halal pour 2026 : de Istanbul à Kuala Lumpur.',
    coverImage: '/images/guide-top10.jpg',
    category: 'Destinations',
    readTime: '6 min',
    publishedAt: '2026-01-15',
    tags: ['Top', '2026', 'Destinations'],
    content: `<h2>1. Istanbul, Turquie</h2><p>La star incontestée du voyage halal. Histoire ottomane, gastronomie incroyable, ambiance islamique naturelle.</p><h2>2. Kuala Lumpur, Malaisie</h2><p>La capitale mondiale du halal certifié.</p><h2>3. Dubaï, EAU</h2><p>Modernité et luxe avec une infrastructure halal parfaite.</p>`,
  },
  {
    slug: 'ramadan-voyage-guide',
    title: 'Voyager pendant le Ramadan : guide complet',
    description: 'Comment voyager pendant le mois de Ramadan ? Destinations idéales, conseils pratiques, iftar en voyage.',
    coverImage: '/images/guide-ramadan.jpg',
    category: 'Spiritualité',
    readTime: '7 min',
    publishedAt: '2026-02-01',
    tags: ['Ramadan', 'Spiritualité', 'Conseils'],
    content: `<h2>Faut-il jeûner en voyage ?</h2><p>Selon les avis des savants, le voyageur peut rompre le jeûne et le rattraper plus tard. C'est une facilité accordée par l'islam.</p><h2>Les meilleures destinations pendant Ramadan</h2><p>Istanbul, Le Caire et Dubaï offrent une ambiance incomparable pendant ce mois béni.</p>`,
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'meilleurs-hotels-halal-istanbul',
    title: 'Les 10 meilleurs hôtels halal-friendly à Istanbul',
    description: 'Notre sélection des meilleurs hôtels à Istanbul pour les voyageurs musulmans : sans alcool, cuisine halal, emplacement idéal.',
    coverImage: '/images/hotels-istanbul.jpg',
    category: 'Hébergement',
    readTime: '5 min',
    publishedAt: '2026-01-20',
    tags: ['Istanbul', 'Hôtels', 'Halal-friendly'],
    content: 'Notre sélection complète des meilleurs hébergements halal à Istanbul, vérifiés par notre équipe.',
  },
  {
    slug: 'restaurants-halal-paris',
    title: 'Les meilleurs restaurants halal à Paris en 2026',
    description: 'Guide complet des restaurants halal à Paris : du kebab au gastronomique, tous les quartiers couverts.',
    coverImage: '/images/restaurants-paris.jpg',
    category: 'Gastronomie',
    readTime: '4 min',
    publishedAt: '2026-01-25',
    tags: ['Paris', 'Restaurants', 'France'],
    content: 'Paris compte des centaines de restaurants halal certifiés dans tous les arrondissements.',
  },
]

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find((d) => d.slug === slug)
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug)
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}
