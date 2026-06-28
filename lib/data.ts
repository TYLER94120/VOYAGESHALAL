import type { Destination, Guide, BlogPost } from './types'

export const destinations: Destination[] = [
  {
    city: 'Istanbul',
    country: 'Turquie',
    slug: 'istanbul',
    shortDescription: 'La perle du Bosphore entre Orient et Occident',
    description:
      "Istanbul est l'une des destinations halal les plus accessibles et les plus envoûtantes au monde. Ancienne capitale de l'Empire ottoman, la ville abrite plus de 3 000 mosquées, des quartiers historiques classés au patrimoine mondial de l'UNESCO et une gastronomie 100 % halal d'une richesse incomparable. Ici, l'appel à la prière (ezan) rythme naturellement les journées, les restaurants ne servent pas d'alcool dans les quartiers traditionnels, et chaque ruelle de la médina raconte des siècles d'histoire islamique. Istanbul est à la fois un voyage culturel, spirituel et gastronomique — un incontournable pour tout voyageur musulman.",
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 3113,
    restaurantHalalCount: 15000,
    population: '15 millions',
    bestTime: 'Avril–juin · Septembre–novembre',
    tags: ['Culture', 'Histoire', 'Gastronomie', 'Architecture'],
    restaurants: [
      {
        name: 'Hamdi Restaurant',
        address: 'Kalçın Sk. No:17, Eminönü',
        description: 'Fondé en 1970, Hamdi est une institution istanbuliote. Cuisine turque traditionnelle avec une vue imprenable sur la Corne d\'Or et le pont de Galata. Spécialité : kebab d\'agneau au four.',
        rating: 4.7,
      },
      {
        name: 'Develi Bakliyat',
        address: 'Samatya, Fatih',
        description: 'Spécialiste du kebab depuis 1912, entièrement halal. L\'une des plus vieilles adresses de viande grillée d\'Istanbul. Incontournable pour découvrir les saveurs anatoliennes authentiques.',
        rating: 4.5,
      },
      {
        name: 'Sultanahmet Köftecisi',
        address: 'Divan Yolu Cad. No:12, Sultanahmet',
        description: 'Depuis 1920, cette institution prépare les meilleurs köfte (boulettes de viande grillées) d\'Istanbul. Menu simple, qualité irréprochable, ambiance conviviale.',
        rating: 4.6,
      },
    ],
    mosques: [
      {
        name: 'Mosquée Bleue (Sultan Ahmed Camii)',
        address: 'Sultanahmet Meydanı No:7, Fatih',
        description: 'Chef-d\'œuvre de l\'architecture ottomane du XVIIe siècle. Ses 6 minarets et son immense dôme central en font l\'une des mosquées les plus spectaculaires du monde. Ouverte aux visiteurs en dehors des heures de prière.',
        rating: 4.9,
      },
      {
        name: 'Mosquée Süleymaniye',
        address: 'Prof. Sıddık Sami Onar Cd., Fatih',
        description: 'Commandée par Soliman le Magnifique et achevée en 1557, c\'est la plus grande mosquée d\'Istanbul. Son complexe comprend une medersa, un hammam et le tombeau du sultan. Vue panoramique sur la Corne d\'Or depuis les jardins.',
        rating: 4.8,
      },
    ],
    activities: [
      {
        name: 'Palais de Topkapi',
        description: 'Ancienne résidence des sultans ottomans pendant quatre siècles. Le trésor impérial abrite des reliques islamiques de première importance : le manteau et l\'épée du Prophète Mohammed ﷺ, des fragments du manteau de Moïse.',
        duration: '3–4 heures',
      },
      {
        name: 'Grand Bazar (Kapalıçarşı)',
        description: 'L\'un des plus anciens et des plus grands marchés couverts du monde avec plus de 4 000 boutiques. Épices, tapis, bijoux, céramiques et textiles. Un voyage sensoriel unique.',
        duration: '2–3 heures',
      },
      {
        name: 'Croisière sur le Bosphore',
        description: 'Navigation entre l\'Europe et l\'Asie sur ce détroit mythique. Vue sur les palais ottomans, les yalis (maisons de bois traditionnelles) et les minarets qui ponctuent les deux rives.',
        duration: '2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'meilleurs-hotels-halal-istanbul', title: 'Les 10 meilleurs hôtels halal-friendly à Istanbul', type: 'blog' },
      { slug: 'top-destinations-halal-2026', title: 'Top 10 destinations halal 2026', type: 'guide' },
    ],
    tips: [
      'La quasi-totalité des restaurants du centre historique (Sultanahmet, Fatih, Üsküdar) est halal — pas besoin de vérifier systématiquement.',
      'L\'appel à la prière (ezan) retentit 5 fois par jour depuis les minarets — prévoir d\'en profiter à Sultanahmet au coucher du soleil.',
      'Prévoir une tenue modeste (épaules et genoux couverts) pour entrer dans les mosquées. Des châles sont prêtés gratuitement à l\'entrée.',
      'La carte Istanbulkart (rechargeable) est indispensable pour les transports en commun : metro, tramway, ferry.',
      'Éviter les restaurants autour de Sultanahmet qui affichent des menus en 5 langues — ils sont souvent overpriced pour touristes.',
    ],
  },
  {
    city: 'Marrakech',
    country: 'Maroc',
    slug: 'marrakech',
    shortDescription: 'La ville ocre, cœur de l\'authenticité marocaine',
    description:
      "Marrakech est une destination halal naturelle par excellence. Dans ce pays à majorité musulmane, le halal n'est pas un filtre de recherche mais la norme absolue : chaque restaurant, chaque hôtel, chaque marché respecte les préceptes islamiques sans que vous ayez à le vérifier. La médina de Marrakech, classée au patrimoine mondial de l'UNESCO, vous plonge dans un labyrinthe de ruelles ocres où mosquées millénaires, souks d'artisans et riads somptueux se succèdent. Une destination idéale pour les familles, les couples et les voyageurs en quête d'authenticité islamique et de richesse culturelle.",
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 500,
    restaurantHalalCount: 3000,
    population: '1 million',
    bestTime: 'Mars–mai · Septembre–novembre',
    tags: ['Médina', 'Souks', 'Gastronomie', 'Riads'],
    restaurants: [
      {
        name: 'Le Jardin',
        address: '32 Souk Sidi Abdelaziz, Médina',
        description: 'Niché dans un riad du XVIe siècle reconverti, Le Jardin propose une cuisine marocaine raffinée dans un cadre végétal luxuriant. Tajines, pastillas et couscous préparés avec des produits locaux de saison.',
        rating: 4.6,
      },
      {
        name: 'Nomad',
        address: '1 Derb Aajane, Médina',
        description: 'Le restaurant contemporain de référence à Marrakech. Cuisine marocaine moderne sur une terrasse avec vue sur les toits de la médina. Parfait pour un déjeuner élégant.',
        rating: 4.5,
      },
      {
        name: 'Chez Lamine Hadj Mustapha',
        address: '304 Kennaria, Médina',
        description: 'Une institution familiale depuis 3 générations. Les meilleures tangia (agneau cuit au four de potier) de Marrakech, dans une ambiance authentiquement locale. Aucun touriste ne connaît cet endroit — c\'est ce qui en fait la magie.',
        rating: 4.8,
      },
    ],
    mosques: [
      {
        name: 'Mosquée Koutoubia',
        address: 'Avenue Mohammed V, Médina',
        description: 'L\'emblème de Marrakech — son minaret de 70 mètres domine toute la ville. Construite au XIIe siècle, elle est considérée comme le modèle de l\'architecture hispano-mauresque. Accès réservé aux musulmans pour la prière.',
        rating: 4.9,
      },
      {
        name: 'Médersa Ben Youssef',
        address: 'Kaat Benahid, Médina',
        description: 'L\'ancienne école coranique la plus grande du Maghreb. Son architecture intérieure est d\'une beauté époustouflante : zelliges multicolores, stuc sculpté et cèdre ouvragé. Ouverte aux visiteurs.',
        rating: 4.7,
      },
    ],
    activities: [
      {
        name: 'Place Jemaa el-Fna',
        description: 'Le cœur palpitant de Marrakech. Le jour : acrobates, charmeurs de serpents et conteurs. La nuit : les stands de restauration envahissent la place, créant le plus grand restaurant en plein air au monde. Classée au patrimoine culturel immatériel de l\'UNESCO.',
        duration: '2–4 heures (soir recommandé)',
      },
      {
        name: 'Jardins de la Majorelle',
        address: 'Rue Yves Saint Laurent',
        description: 'Oasis botanique de 2,5 hectares créée par le peintre Jacques Majorelle et restaurée par Yves Saint Laurent. Bambous géants, cactus centenaires et le bleu Majorelle emblématique.',
        duration: '1–2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'marrakech-guide-halal', title: 'Guide halal Marrakech 2026', type: 'guide' },
      { slug: 'lune-de-miel-halal', title: 'Lune de miel halal : destinations romantiques', type: 'guide' },
    ],
    tips: [
      'Dans la médina, tout est halal — ne pas perdre de temps à vérifier.',
      'Négocier est une pratique culturelle — ne jamais payer le premier prix dans les souks.',
      'Prendre un guide local pour la médina : cela évite de se perdre et enrichit la visite de récits historiques.',
      'Éviter les faux guides qui s\'approchent spontanément — opter pour les agences agréées.',
      'Le meilleur moment pour Jemaa el-Fna : au coucher du soleil, avec l\'appel à la prière de la Koutoubia en fond sonore.',
    ],
  },
  {
    city: 'Dubai',
    country: 'Émirats Arabes Unis',
    slug: 'dubai',
    shortDescription: 'Luxe, modernité et halal certifié dans la ville du futur',
    description:
      "Dubaï est la destination halal la plus sophistiquée de la planète. Dans cet État islamique, la certification halal est obligatoire pour tous les établissements de restauration — une garantie unique qui permet de manger en toute confiance dans n'importe quel restaurant. La ville combine des gratte-ciels futuristes, des plages de sable blanc, le shopping de luxe et des musées de classe mondiale dans un cadre entièrement conforme aux valeurs islamiques. La Mosquée Jumeirah, ouverte aux non-musulmans, est l'une des plus belles de la région. Pour les familles aisées et les couples cherchant l'excellence, Dubaï est une évidence.",
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 800,
    restaurantHalalCount: 12000,
    population: '3.5 millions',
    bestTime: 'Novembre–avril',
    tags: ['Luxe', 'Shopping', 'Architecture', 'Famille'],
    restaurants: [
      {
        name: 'Al Fanar Restaurant & Café',
        address: 'Festival City Mall, Ras Al Khor',
        description: 'Cuisine émiratie traditionnelle authentique dans un décor reconstituant le Dubaï des années 60. Harrisa, machboos et lukaimat — l\'endroit idéal pour découvrir la gastronomie locale certifiée halal.',
        rating: 4.5,
      },
      {
        name: 'Arabian Tea House',
        address: 'Al Fahidi, Bur Dubai',
        description: 'Niché dans le quartier historique d\'Al Fahidi, ce restaurant-café sert une cuisine émiratie traditionnelle dans une maison en corail du XIXe siècle. Petit-déjeuner balaleet (vermicelles sucrés) incontournable.',
        rating: 4.7,
      },
    ],
    mosques: [
      {
        name: 'Mosquée Jumeirah',
        address: 'Jumeirah Beach Road',
        description: 'L\'une des plus grandes et des plus belles mosquées de Dubaï. Particularité unique : elle est ouverte aux visiteurs non-musulmans avec des visites guidées organisées par le Centre pour la Compréhension Culturelle (SMCCU). Architecture néo-fatimide magnifique.',
        rating: 4.9,
      },
    ],
    activities: [
      {
        name: 'Burj Khalifa',
        description: 'La tour la plus haute du monde (828 mètres). Les plateformes d\'observation At the Top offrent une vue à 360° sur le désert, le Golfe Persique et la skyline de Dubaï. Réserver en ligne pour éviter les queues.',
        duration: '2–3 heures',
      },
      {
        name: 'Old Dubai — Al Fahidi & Deira',
        description: 'Le vieux Dubaï révèle son âme authentique : maisons en corail avec tours à vent (barjeel), abras (bateaux en bois) sur la Crique, souk de l\'or et souk des épices. Un contraste saisissant avec la modernité.',
        duration: '3–4 heures',
      },
    ],
    relatedArticles: [
      { slug: 'dubai-guide-halal-2026', title: 'Dubai halal : guide complet 2026', type: 'guide' },
      { slug: 'hotel-halal-tout-savoir', title: 'Hôtel halal : tout ce qu\'il faut savoir', type: 'guide' },
    ],
    tips: [
      'Tous les restaurants de Dubaï sont halal certifiés par obligation légale — manger partout sans vérifier.',
      'Le Ramadan à Dubaï est une expérience unique : iftar dans les grandes tentes des hôtels 5 étoiles, ambiance festive nocturne.',
      'Le Dubai Metro est propre, climatisé et économique — eviter les taxis en heure de pointe.',
      'Les plages publiques (Jumeirah Beach) sont gratuites et bien équipées.',
      'Le Dubai Frame offre une vue spectaculaire pour beaucoup moins cher que le Burj Khalifa.',
    ],
  },
  {
    city: 'Médine',
    country: 'Arabie Saoudite',
    slug: 'medine',
    shortDescription: 'La ville du Prophète ﷺ — deuxième lieu saint de l\'islam',
    description:
      "Médine (Al-Madinah Al-Munawwarah — la Ville Lumineuse) est la deuxième ville la plus sainte de l'islam, après La Mecque. C'est ici que le Prophète Mohammed ﷺ a émigré en 622, y a fondé la première communauté islamique et y repose pour l'éternité. La Mosquée du Prophète (Masjid an-Nabawi), avec son dôme vert caractéristique, est l'un des lieux les plus émouvants de la planète pour tout musulman. Chaque année, des millions de pèlerins viennent pour l'Omra et le Hajj, mais aussi pour le plaisir de prier dans cette mosquée bénie et de se recueillir sur la tombe du Prophète ﷺ.",
    coverImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 2000,
    restaurantHalalCount: 5000,
    population: '1.4 million',
    bestTime: 'Octobre–avril (éviter l\'été, 45°C)',
    tags: ['Spiritualité', 'Pèlerinage', 'Islam', 'Omra', 'Hajj'],
    restaurants: [
      {
        name: 'Restaurants de Qasr Al Diyafah',
        address: 'Abraj Al Bait, près de Masjid an-Nabawi',
        description: 'Complexe de restaurants proposant cuisine saoudienne et internationale halal certifiée, à quelques pas de la Mosquée du Prophète. Idéal pour les pèlerins souhaitant un repas entre les prières.',
        rating: 4.3,
      },
      {
        name: 'Kabab et Biryani Al Najd',
        address: 'Quartier central, Médine',
        description: 'Institution locale réputée pour ses brochettes d\'agneau et son biryani saoudien. Prix locaux, saveurs authentiques de la péninsule arabique.',
        rating: 4.5,
      },
    ],
    mosques: [
      {
        name: 'Masjid an-Nabawi (Mosquée du Prophète ﷺ)',
        address: 'Centre de Médine',
        description: 'La deuxième mosquée la plus importante de l\'islam. Construite par le Prophète ﷺ lui-même en 622, agrandie au fil des siècles, elle peut aujourd\'hui accueillir plus d\'un million de fidèles simultanément. Le dôme vert couvre le tombeau sacré du Prophète ﷺ.',
        rating: 5.0,
      },
      {
        name: 'Masjid Quba',
        address: 'Quartier de Quba, Médine',
        description: 'La toute première mosquée de l\'histoire de l\'islam, construite par le Prophète ﷺ à son arrivée à Médine en 622. Prier deux rakaat dans cette mosquée équivaut, selon un hadith, à la récompense d\'une Omra.',
        rating: 4.9,
      },
    ],
    activities: [
      {
        name: 'Montagne Uhud',
        description: 'Site de la bataille d\'Uhud (625 après J.-C.), où 70 compagnons du Prophète ﷺ ont été martyrisés. Le cimetière des martyrs est un lieu de pèlerinage profondément émouvant.',
        duration: '2–3 heures',
      },
      {
        name: 'Musée de Médine (Al-Madinah Museum)',
        description: 'Retraçant l\'histoire de la ville du Prophète ﷺ depuis les origines jusqu\'à nos jours. Maquettes, manuscrits et objets historiques exceptionnels.',
        duration: '1–2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'omra-2026-guide-complet', title: 'Guide complet de l\'Omra 2026', type: 'guide' },
      { slug: 'ramadan-voyage-guide', title: 'Voyager pendant le Ramadan', type: 'guide' },
    ],
    tips: [
      'Prière de la Fajr (aube) à Masjid an-Nabawi : une expérience spirituelle que les voyageurs décrivent comme la plus belle de leur vie.',
      'Envoyer des salawat sur le Prophète ﷺ en permanence lors des visites des lieux saints.',
      'S\'hydrater continuellement — la chaleur peut atteindre 45°C en été.',
      'L\'eau de Zamzam est disponible gratuitement dans la mosquée — en rapporter pour les proches est une tradition.',
      'Réserver l\'hôtel le plus proche de Masjid an-Nabawi pour minimiser les distances à pied entre les prières.',
    ],
  },
  {
    city: 'Kuala Lumpur',
    country: 'Malaisie',
    slug: 'kuala-lumpur',
    shortDescription: 'La capitale mondiale du tourisme halal certifié',
    description:
      "Kuala Lumpur est la capitale mondiale du tourisme halal. La Malaisie est régulièrement classée première destination halal mondiale par le Global Muslim Travel Index — et KL en est le cœur battant. Le système de certification halal JAKIM (le plus rigoureux du monde) garantit que chaque restaurant certifié respecte scrupuleusement les préceptes islamiques. Ajoutez à cela une gastronomie exceptionnelle (fusion malaise-chinoise-indienne), les tours Petronas iconiques, une nature luxuriante et des prix très accessibles — KL s'impose comme une destination halal de référence en Asie.",
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 500,
    restaurantHalalCount: 20000,
    population: '1.8 million (Grand KL : 8 millions)',
    bestTime: 'Toute l\'année (éviter mousson mai–octobre)',
    tags: ['Halal certifié', 'Gastronomie', 'Architecture', 'Shopping'],
    restaurants: [
      {
        name: 'Nasi Kandar Pelita',
        address: 'Jalan Ampang (plusieurs adresses)',
        description: 'L\'institution du nasi kandar malaisien, ouverte 24h/24. Riz basmati avec une vingtaine de currys et accompagnements halal certifiés JAKIM. Une expérience culinaire fondamentale à KL.',
        rating: 4.4,
      },
      {
        name: 'Syed Bistro',
        address: 'Jalan Tuanku Abdul Halim, Chow Kit',
        description: 'Le meilleur nasi lemak de KL selon beaucoup de locaux. Riz à la noix de coco, anchois frits, œuf, sambal et poulet — le plat national malaisien dans sa version la plus authentique.',
        rating: 4.6,
      },
    ],
    mosques: [
      {
        name: 'Masjid Negara (Mosquée Nationale)',
        address: 'Jalan Perdana, Tasik Perdana',
        description: 'La mosquée nationale de Malaisie, inaugurée en 1965. Son toit en forme d\'étoile à 18 branches et son minaret de 73 mètres sont des symboles architecturaux du pays. Capacité : 15 000 fidèles.',
        rating: 4.7,
      },
      {
        name: 'Masjid Jamek',
        address: 'Jalan Tun Perak',
        description: 'La plus ancienne mosquée de Kuala Lumpur (1909), construite à la confluence des rivières Klang et Gombak — le site où fut fondée la ville. Architecture moghole, briques roses, atmosphère sereine.',
        rating: 4.6,
      },
    ],
    activities: [
      {
        name: 'Tours Petronas',
        description: 'Les tours jumelles les plus hautes du monde de 1998 à 2004 (452 mètres). La passerelle Sky Bridge au 41e étage offre une vue saisissante. Le Suria KLCC en bas est un centre commercial de luxe avec des restaurants halal certifiés JAKIM.',
        duration: '2–3 heures',
      },
      {
        name: 'Batu Caves',
        description: 'Temple hindou monumental dans des grottes calcaires — l\'attraction touristique la plus visitée de Malaisie. Bien que hindou, c\'est un témoignage de la diversité religieuse harmonieuse de la Malaisie.',
        duration: '2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'malaisie-halal-destination', title: 'Malaisie : la destination n°1 mondiale pour les musulmans', type: 'guide' },
      { slug: 'hotel-halal-tout-savoir', title: 'Hôtel halal : tout ce qu\'il faut savoir', type: 'guide' },
    ],
    tips: [
      'La carte Touch\'n Go est indispensable pour les transports en commun (LRT, MRT, Monorail, bus).',
      'Grab est l\'application de transport de référence — fiable et moins cher que les taxis.',
      'Les food courts des centres commerciaux (Suria KLCC, Pavilion, Mid Valley) proposent des dizaines de cuisines halal certifiées.',
      'Visiter Batu Caves à l\'ouverture (6h30) pour éviter la chaleur et la foule.',
      'KL est une ville de shopping extraordinaire — les prix sont souvent 30 à 50% moins chers qu\'en Europe.',
    ],
  },
  {
    city: 'Bali',
    country: 'Indonésie',
    slug: 'bali',
    shortDescription: 'L\'île des dieux, une oasis halal inattendue',
    description:
      "Bali surprend agréablement les voyageurs musulmans. Cette île principalement hindoue d'Indonésie — le plus grand pays musulman du monde — dispose d'une infrastructure halal solide, notamment dans les zones touristiques de Seminyak, Kuta et Ubud. Les restaurants halal certifiés sont nombreux (kebab, nasi goreng halal, poulpe grillé halal) et facilement identifiables. L'île offre en plus des paysages d'une beauté incomparable : rizières en terrasse, temples sur l'océan, volcans et plages paradisiaques. Bali est la preuve qu'une destination non-musulmane peut être parfaitement accessible.",
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    halalScore: 3,
    mosqueeCount: 200,
    restaurantHalalCount: 500,
    population: '4.4 millions',
    bestTime: 'Avril–octobre (saison sèche)',
    tags: ['Nature', 'Temples', 'Plage', 'Rizières'],
    restaurants: [
      {
        name: 'Warung Halal Seminyak',
        address: 'Jalan Laksmana, Seminyak',
        description: 'Le meilleur restaurant halal de Seminyak, reconnaissable à son label halal MUI affiché en vitrine. Spécialités indonésiennes : nasi goreng, mie goreng, satay — saveurs locales authentiques.',
        rating: 4.3,
      },
    ],
    mosques: [
      {
        name: 'Masjid Raya Ukhuwah Islamiyah',
        address: 'Jalan Gunung Agung, Denpasar',
        description: 'La plus grande mosquée de Bali, dans le quartier de Denpasar. Capacité de plusieurs milliers de fidèles. Point de repère pour la communauté musulmane balinaise.',
        rating: 4.5,
      },
    ],
    activities: [
      {
        name: 'Rizières de Tegallalang',
        description: 'Les rizières en terrasse les plus photographiées de Bali. L\'ingénieux système d\'irrigation subak, classé au patrimoine UNESCO, crée des paysages à couper le souffle.',
        duration: '2 heures',
      },
      {
        name: 'Temple Tanah Lot',
        description: 'L\'un des temples balinais les plus emblématiques, perché sur un rocher en bord de mer. Le coucher du soleil depuis Tanah Lot est l\'un des plus beaux de Bali.',
        duration: '2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'top-destinations-halal-2026', title: 'Top 10 destinations halal 2026', type: 'guide' },
      { slug: 'checklist-voyage-halal', title: 'Checklist voyage halal : ne rien oublier', type: 'guide' },
    ],
    tips: [
      'Vérifier le label halal MUI (Majelis Ulama Indonesia) dans les restaurants — il est obligatoire et fiable.',
      'Grab fonctionne à Bali et est l\'option de transport la plus pratique.',
      'La saison des pluies (novembre–mars) rend certaines routes impraticables — eviter cette période.',
      'Location de scooter : solution économique mais attention aux routes de montagne sinueuses.',
      'Emporter une tenue couverte pour visiter les temples — sarong fourni à l\'entrée mais conserver une tenue modeste de base.',
    ],
  },
]

export const guides: Guide[] = [
  {
    slug: 'voyage-halal-debutant',
    title: 'Voyage halal pour débutants : tout ce qu\'il faut savoir avant de partir',
    description:
      'Premier voyage halal ? Ce guide complet vous explique les fondamentaux : nourriture, prière, hébergement, destinations et applications indispensables.',
    coverImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    category: 'Pratique',
    readTime: '8 min',
    publishedAt: '2026-01-01',
    tags: ['Débutant', 'Guide pratique', 'Conseils'],
    content: `<h2>Qu'est-ce que le voyage halal ?</h2>
<p>Le voyage halal désigne simplement un voyage organisé en tenant compte des préceptes islamiques. Pas d'alcool, nourriture halal, possibilité de prier, tenue modeste dans les lieux de culte — voici les quatre piliers d'un voyage halal réussi.</p>

<h2>Nourriture halal en voyage</h2>
<p>Dans les pays à majorité musulmane (Turquie, Maroc, EAU, Malaisie, Indonésie...), la quasi-totalité de la nourriture est halal. La certification halal est la norme et non l'exception. Dans les pays non-musulmans, cherchez les labels HMC (UK), JAKIM (Malaisie) ou les certificats nationaux équivalents.</p>
<ul>
<li>Téléchargez l'application <strong>HalalTrip</strong> ou <strong>Zabihah</strong> pour trouver des restaurants halal certifiés dans le monde entier.</li>
<li>Dans les supermarchés, cherchez le label halal ou optez pour les produits végétariens, le poisson et les fruits de mer.</li>
<li>Les fast-foods halal (Nando's, certains McDonald's en pays musulmans) peuvent dépanner.</li>
</ul>

<h2>Comment prier en voyage ?</h2>
<p>L'islam facilite la prière pour le voyageur :</p>
<ul>
<li><strong>Qasr</strong> : le voyageur peut raccourcir les prières de 4 rakaat à 2.</li>
<li><strong>Jam'</strong> : il peut regrouper Dhuhr + Asr ensemble, et Maghrib + Isha ensemble.</li>
<li>Utilisez <strong>Muslim Pro</strong> pour les horaires de prière et la direction de la Qibla.</li>
<li>Les aéroports internationaux disposent presque tous de salles de prière multireligieuses.</li>
</ul>

<h2>Hébergement halal</h2>
<p>Pour un hébergement halal-friendly, recherchez :</p>
<ul>
<li>Hôtels sans alcool (standard dans la plupart des pays musulmans)</li>
<li>Plateformes spécialisées : <strong>HalalBooking.com</strong> (18 000+ établissements), <strong>HalalTrip</strong></li>
<li>Les riads au Maroc et les pensions familiales en Turquie sont culturellement halal sans certification</li>
</ul>

<h2>Les meilleures destinations halal pour débuter</h2>
<ol>
<li><strong>Turquie</strong> — Facile d'accès, halal à 99%, culture islamique riche, prix accessibles</li>
<li><strong>Maroc</strong> — Proche de la France, halal naturel, gastronomie exceptionnelle</li>
<li><strong>Malaisie</strong> — Halal certifié JAKIM = garantie absolue, modernité et nature</li>
<li><strong>Émirats Arabes Unis</strong> — Luxe halal certifié, English spoken, sécurisé</li>
</ol>`,
  },
  {
    slug: 'top-destinations-halal-2026',
    title: 'Top 10 des destinations halal en 2026 : notre sélection',
    description:
      'Notre classement des 10 meilleures destinations pour les voyageurs musulmans en 2026, avec conseils pratiques et score halal.',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    category: 'Destinations',
    readTime: '6 min',
    publishedAt: '2026-01-15',
    tags: ['Top destinations', 'Classement', '2026'],
    content: `<h2>Comment nous classons les destinations halal</h2>
<p>Notre score halal repose sur 5 critères : disponibilité de nourriture halal, présence de mosquées, politique d'alcool, code vestimentaire, et accueil des voyageurs musulmans. Voici notre top 10 pour 2026.</p>

<h2>1. Malaisie — La référence mondiale</h2>
<p>La Malaisie conserve sa première place au Global Muslim Travel Index pour la 10e année consécutive. Certification JAKIM, gastronomie fusion extraordinaire, nature luxuriante et prix accessibles.</p>

<h2>2. Turquie — La destination préférée des Français</h2>
<p>Istanbul, Cappadoce, côte turquoise — la Turquie offre une diversité de paysages et une richesse culturelle islamique incomparable, le tout à 3h30 de vol.</p>

<h2>3. Émirats Arabes Unis — Le luxe halal absolu</h2>
<p>Halal certifié par l'État, infrastructure hôtelière 5 étoiles, sécurité exemplaire. Dubaï et Abu Dhabi restent la référence pour les voyageurs exigeants.</p>

<h2>4. Maroc — L'incontournable francophone</h2>
<p>Proche, halal naturellement, langue française parlée, gastronomie de renom. Le Maroc est la destination halal la plus accessible pour les Français.</p>

<h2>5. Arabie Saoudite — La destination spirituelle</h2>
<p>Depuis l'ouverture aux touristes en 2019, l'Arabie Saoudite révèle des merveilles au-delà des lieux saints : AlUla, Diriyah, Riyad moderne.</p>

<h2>6. Indonésie — La surprise du classement</h2>
<p>Plus grand pays musulman du monde, l'Indonésie avec Bali, Jakarta et Lombok offre une expérience halal riche dans un cadre naturel exceptionnel.</p>

<h2>7. Jordanie — Le joyau méconnu</h2>
<p>Pétra, Wadi Rum, la Mer Morte, Jerash — la Jordanie est une destination halal de très haute qualité, encore sous-visitée.</p>

<h2>8. Qatar — L'émergent</h2>
<p>Post-Coupe du Monde 2022, Doha a investi massivement dans le tourisme halal de qualité. Le Musée d'Art Islamique est l'un des meilleurs du monde.</p>

<h2>9. Bosnie-Herzégovine — L'Europe musulmane</h2>
<p>Sarajevo la multiconfessionnelle, les montagnes de Mostar, les saveurs ottomanes — la Bosnie est la destination halal européenne la plus attachante.</p>

<h2>10. Maldives — Le paradis halal</h2>
<p>État islamique à 100%, les Maldives offrent la quintessence du voyage de luxe halal : lagons turquoise, villas sur pilotis et intimité absolue.</p>`,
  },
  {
    slug: 'ramadan-voyage-guide',
    title: 'Voyager pendant le Ramadan : guide complet pour les musulmans',
    description:
      'Comment organiser et profiter de son voyage pendant le Ramadan ? Destinations, astuces pratiques et les meilleures expériences du mois sacré.',
    coverImage: 'https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=1200&q=80',
    category: 'Pratique',
    readTime: '7 min',
    publishedAt: '2026-02-01',
    tags: ['Ramadan', 'Jeûne', 'Spiritualité', 'Pratique'],
    content: `<h2>Voyager pendant le Ramadan : bonne ou mauvaise idée ?</h2>
<p>Le Ramadan est le mois le plus sacré de l'islam, et voyager pendant cette période peut être une expérience spirituellement intense et culturellement unique — à condition de bien choisir sa destination et de préparer son séjour en conséquence.</p>

<h2>Les destinations idéales pour le Ramadan</h2>
<ul>
<li><strong>Istanbul, Turquie</strong> : les tables d'iftar se multiplient dans les rues, les mosquées sont illuminées, et l'ambiance nocturne après la rupture du jeûne est magique.</li>
<li><strong>Marrakech, Maroc</strong> : la place Jemaa el-Fna devient un immense restaurant en plein air à l'iftar. La chaleur humaine est incomparable.</li>
<li><strong>Dubaï, EAU</strong> : les tentes Ramadan des grands hôtels offrent des expériences gastronomiques d'exception. Prix généralement réduits en journée.</li>
<li><strong>La Mecque / Médine</strong> : pour ceux qui souhaitent accomplir l'Omra du Ramadan — l'expérience spirituelle la plus intense qui soit.</li>
</ul>

<h2>Conseils pratiques pour voyager en jeûnant</h2>
<ul>
<li><strong>Planifier les visites le matin</strong> : énergie maximale avant la chaleur et la fatigue du jeûne. Réserver les visites intenses (sites archéologiques, musées) avant 13h.</li>
<li><strong>Préparer l'iftar à l'avance</strong> : identifier les restaurants ouverts à l'iftar dans votre destination. La plupart des restaurants dans les pays musulmans préparent des menus spéciaux Ramadan.</li>
<li><strong>Hydratation nocturne</strong> : entre l'iftar (coucher du soleil) et le suhoor (repas avant l'aube), boire au minimum 2 litres d'eau.</li>
<li><strong>Sieste stratégique</strong> : en pays chaud, la sieste après Dhuhr est culturellement normale et médicalement conseillée.</li>
</ul>

<h2>Les expériences Ramadan uniques dans le monde</h2>
<ul>
<li><strong>Istanbul</strong> : l'ambiance à Sultanahmet au moment de l'iftar est inoubliable. Les mosquées s'illuminent, les familles s'installent dans les rues pour rompre le jeûne ensemble.</li>
<li><strong>Le Caire</strong> : le Ramadan au Caire est une fête populaire géante. Lanternes (fanous), tables d'iftar géantes dans les rues, ambiance festive toute la nuit.</li>
<li><strong>Dubaï</strong> : tentes Ramadan luxueuses dans les grands hôtels, ambiance feutrée et soignée, iftar et suhoor gastronomiques.</li>
<li><strong>Médine et La Mecque</strong> : pour ceux qui souhaitent effectuer une Umrah pendant Ramadan — l'expérience spirituelle la plus intense qui soit.</li>
</ul>

<h2>Conseils pratiques pour voyager en Ramadan</h2>
<ul>
<li><strong>Réservations</strong> : prévoir 3 à 6 mois à l'avance, surtout pour les pays du Golfe et les villes saintes.</li>
<li><strong>Horaires</strong> : les restaurants ouvrent principalement après l'iftar (coucher du soleil). Adapter son programme en conséquence.</li>
<li><strong>Hydratation</strong> : en pays chaud, boire abondamment entre l'iftar et le suhoor (repas avant l'aube).</li>
<li><strong>Applications</strong> : Muslim Pro donne les horaires d'iftar et de suhoor pour n'importe quelle ville du monde.</li>
</ul>`,
  },
  {
    slug: 'omra-2026-guide-complet',
    title: 'Omra 2026 : guide complet pour préparer votre pèlerinage',
    description: 'Tout ce qu\'il faut savoir pour préparer votre Omra en 2026 : visa, agences, budget, rituels, meilleure période et conseils pratiques.',
    coverImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
    category: 'Spiritualité',
    readTime: '10 min',
    publishedAt: '2026-06-01',
    tags: ['Omra', 'Pèlerinage', 'Médine', 'La Mecque'],
    content: `<h2>L'Omra en 2026 : le moment idéal pour se lancer</h2>
<p>L'Omra (ou Oumra) est le petit pèlerinage islamique, accompli à tout moment de l'année contrairement au Hajj (réservé au mois de Dhul Hijja). En 2026, l'Arabie Saoudite a simplifié les procédures de visa et ouvert davantage de créneaux d'accès. Plus de 15 millions de pèlerins ont effectué l'Omra en 2025 — un record.</p>

<h2>Visa Omra : les démarches simplifiées</h2>
<ul>
<li><strong>E-Visa Omra</strong> : disponible en ligne via le portail officiel nusuk.sa. Délai d'obtention : 24 à 72 heures.</li>
<li><strong>Via une agence agréée</strong> : les agences françaises agréées par le Ministère des Affaires Religieuses gèrent l'intégralité des démarches visa + hébergement + transport.</li>
<li><strong>Documents requis</strong> : passeport valide 6 mois, photos d'identité, vaccination méningocoque ACWY obligatoire.</li>
</ul>

<h2>Meilleure période pour effectuer l'Omra</h2>
<ul>
<li><strong>Ramadan</strong> : l'expérience spirituelle la plus intense mais aussi la plus chargée. Réserver 4 à 6 mois à l'avance.</li>
<li><strong>Chaabane (mois précédant Ramadan)</strong> : moins de monde, prix plus bas, spiritualité préservée.</li>
<li><strong>Muharram / Safar</strong> : basse saison, idéal pour les familles avec enfants en bas âge.</li>
<li><strong>Éviter</strong> : période du Hajj (Dhul Hijja) — La Mecque est saturée et les prix triplent.</li>
</ul>

<h2>Budget Omra 2026 : ce qu'il faut prévoir</h2>
<ul>
<li><strong>Vol Paris–Djeddah ou Paris–Médine</strong> : 350 € à 700 € (aller-retour)</li>
<li><strong>Forfait Omra (vol + hôtel + transferts)</strong> : 1 200 € à 3 500 € selon standing</li>
<li><strong>Hôtels à La Mecque</strong> : 80 € à 500 €/nuit selon distance de la Kaaba</li>
<li><strong>Budget journalier (repas + déplacements)</strong> : 30 € à 80 €/jour</li>
</ul>

<h2>Les étapes clés des rituels de l'Omra</h2>
<ol>
<li><strong>Ihram</strong> : état de pureté rituel revêtu à la Miqat (point de limite). Tenue blanche pour les hommes, tenue modeste pour les femmes.</li>
<li><strong>Tawaf</strong> : 7 circumambulations autour de la Kaaba dans le sens antihoraire.</li>
<li><strong>Sa'y</strong> : 7 allers-retours entre les collines Safa et Marwa.</li>
<li><strong>Taqsir / Halq</strong> : coupe de cheveux symbolisant la fin de l'Ihram.</li>
</ol>

<h2>Conseils pratiques essentiels</h2>
<ul>
<li>Réserver l'hôtel le plus proche de la Masjid al-Haram pour minimiser la marche — surtout pour les personnes âgées et les femmes enceintes.</li>
<li>Emporter des chaussures de sport confortables — les distances à pied sont importantes.</li>
<li>S'hydrater constamment — la chaleur de La Mecque peut atteindre 45°C en été.</li>
<li>Télécharger l'application Nusuk (officielle) pour les réservations et les informations en temps réel.</li>
</ul>`,
  },
  {
    slug: 'lune-de-miel-halal',
    title: 'Lune de miel halal : 10 destinations romantiques pour les jeunes mariés musulmans',
    description: 'Notre sélection des meilleures destinations pour une lune de miel halal inoubliable : de Marrakech aux Maldives, en passant par Dubaï et Bali.',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    category: 'Destinations',
    readTime: '7 min',
    publishedAt: '2026-06-10',
    tags: ['Lune de miel', 'Couple', 'Romantique', 'Halal'],
    content: `<h2>Lune de miel halal : allier romantisme et valeurs islamiques</h2>
<p>La lune de miel est l'un des voyages les plus importants d'une vie. Pour les couples musulmans, il est tout à fait possible de combiner romantisme, luxe et respect des valeurs islamiques. Notre sélection couvre tous les budgets et tous les styles — des riads de Marrakech aux villas sur pilotis des Maldives.</p>

<h2>1. Marrakech, Maroc — Le romantisme à l'état pur</h2>
<p>Un riad privatif dans la médina, dîner aux chandelles sur la terrasse, hammam traditionnel pour deux... Marrakech est la destination lune de miel la plus accessible et la plus romantique pour un couple musulman. Budget moyen : 1 500 € pour 5 nuits tout compris.</p>

<h2>2. Dubaï, Émirats — Le luxe sans compromis</h2>
<p>Hôtels 5 étoiles avec piscines privées, plages immaculées du Golfe, dîner au sommet du Burj Khalifa — Dubaï permet de vivre le luxe absolu dans un cadre halal certifié. Idéal pour les couples qui ne veulent pas se priver de confort.</p>

<h2>3. Maldives — L'île privée de vos rêves</h2>
<p>Les Maldives offrent des resorts halal-friendly avec villas sur pilotis, plages privées et accès direct au lagon turquoise. Plusieurs resorts proposent des piscines privées en villa — parfait pour les couples souhaitant préserver leur intimité.</p>

<h2>4. Istanbul, Turquie — Culture et romantisme ottomans</h2>
<p>Croisière au coucher du soleil sur le Bosphore, dîner dans un restaurant en bord de mer à Üsküdar, visite de la Mosquée Bleue au lever du soleil — Istanbul offre un cadre romantique incomparable et historiquement islamique.</p>

<h2>5. Cappadoce, Turquie — Unique au monde</h2>
<p>Montgolfière au lever du soleil sur les cheminées de fées, séjour dans une cave-hôtel sculptée dans la roche, balade à cheval dans la vallée de l'Ihlara. La Cappadoce est la destination coup de cœur des couples pour son caractère absolument unique.</p>

<h2>Comment choisir votre destination lune de miel halal ?</h2>
<ul>
<li><strong>Budget limité (moins de 2 000 €)</strong> : Marrakech, Istanbul, Bosnie-Herzégovine</li>
<li><strong>Budget moyen (2 000–5 000 €)</strong> : Dubaï, Kuala Lumpur, Oman</li>
<li><strong>Budget luxe (5 000 €+)</strong> : Maldives, Seychelles, Zanzibar en lodge privé</li>
</ul>`,
  },
  {
    slug: 'trouver-mosquee-en-voyage',
    title: 'Trouver une mosquée partout dans le monde : le guide complet',
    description: 'Applications, astuces et ressources pour localiser la mosquée la plus proche lors de vos voyages, dans n\'importe quel pays du monde.',
    coverImage: 'https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=1200&q=80',
    category: 'Pratique',
    readTime: '5 min',
    publishedAt: '2026-06-15',
    tags: ['Mosquée', 'Pratique', 'Applications', 'Prière'],
    content: `<h2>Trouver une mosquée en voyage : plus facile qu'on ne le pense</h2>
<p>L'une des premières questions que se posent les voyageurs musulmans est : "Comment vais-je prier ?" La bonne nouvelle : en 2026, des dizaines d'outils permettent de localiser une mosquée en quelques secondes, quel que soit l'endroit du monde où vous vous trouvez.</p>

<h2>Les meilleures applications pour trouver une mosquée</h2>
<ul>
<li><strong>Muslim Pro</strong> (iOS / Android) : l'application de référence. Localise la mosquée la plus proche avec horaires de prière en temps réel, direction de la Qibla et carte interactive. Utilisée par plus de 100 millions de musulmans.</li>
<li><strong>Athan (Azan)</strong> : alternative solide avec alertes de prière personnalisables et carte des mosquées mondiales.</li>
<li><strong>Google Maps</strong> : tapez simplement "mosque" ou "mosquée" dans la barre de recherche — fonctionne dans presque tous les pays.</li>
<li><strong>HalalTrip</strong> : combine mosquées, restaurants halal et hôtels Muslim-friendly sur une seule carte.</li>
</ul>

<h2>Pays par pays : ce qu'il faut savoir</h2>
<ul>
<li><strong>Pays à majorité musulmane</strong> (Turquie, Maroc, EAU, Malaisie, Égypte) : les mosquées sont omniprésentes. L'appel à la prière vous guidera naturellement.</li>
<li><strong>Europe occidentale</strong> : mosquées dans les grandes villes, salles de prière dans la plupart des aéroports internationaux et certains centres commerciaux.</li>
<li><strong>Asie du Sud-Est</strong> (Thaïlande, Japon, Corée) : mosquées concentrées dans les quartiers à forte communauté musulmane. Les applications sont indispensables.</li>
<li><strong>Amérique du Nord</strong> : Islamic Society of North America (ISNA) répertorie toutes les mosquées des États-Unis et du Canada.</li>
</ul>

<h2>Prier en dehors des mosquées : les alternatives légales</h2>
<p>Islam est une religion de facilité pour le voyageur :</p>
<ul>
<li>Prier dans votre chambre d'hôtel (les hôtels Muslim-friendly fournissent un tapis de prière et l'indication de la Qibla)</li>
<li>Prier dans les aéroports (salles de prière disponibles dans la plupart des grands aéroports internationaux)</li>
<li>Prier dans les parcs ou espaces verts propres</li>
<li>Utiliser le Qasr (raccourcissement) et le Jam' (regroupement) en voyage</li>
</ul>`,
  },
  {
    slug: 'hotel-halal-tout-savoir',
    title: 'Hôtel halal : tout ce qu\'il faut savoir avant de réserver',
    description: 'Qu\'est-ce qu\'un hôtel halal ? Critères, certifications, plateformes de réservation et notre sélection des meilleures adresses par destination.',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    category: 'Hébergement',
    readTime: '6 min',
    publishedAt: '2026-06-20',
    tags: ['Hôtel', 'Hébergement', 'Halal', 'Réservation'],
    content: `<h2>Hôtel halal vs hôtel halal-friendly : quelle différence ?</h2>
<p>Un <strong>hôtel halal certifié</strong> répond à des critères stricts validés par un organisme de certification islamique : cuisine intégralement halal, absence d'alcool dans les espaces communs, pas de casino, service adapté aux femmes voilées. Un <strong>hôtel halal-friendly</strong> est plus souple : il propose des options halal et respecte certains critères sans pour autant avoir de certification officielle.</p>

<h2>Les 7 critères d'un bon hôtel halal</h2>
<ol>
<li><strong>Certification halal de la restauration</strong> : le restaurant de l'hôtel doit proposer une carte halal certifiée, notamment pour le petit-déjeuner.</li>
<li><strong>Absence d'alcool dans les espaces communs</strong> : pas de bar dans le lobby, pas d'alcool servi au restaurant.</li>
<li><strong>Tapis de prière et indication Qibla en chambre</strong> : les meilleurs hôtels Muslim-friendly les fournissent systématiquement.</li>
<li><strong>Piscine et salle de sport séparées</strong> : certains hôtels proposent des créneaux séparés pour hommes et femmes.</li>
<li><strong>Absence de casino et de divertissements illicites</strong> : critère fondamental pour les hôtels halal stricts.</li>
<li><strong>Personnel formé aux besoins des voyageurs musulmans</strong> : connaissance des horaires de prière, des restaurants halal environnants.</li>
<li><strong>Coran disponible en chambre</strong> : détail simple mais très apprécié.</li>
</ol>

<h2>Les meilleures plateformes pour réserver un hôtel halal</h2>
<ul>
<li><strong>HalalBooking.com</strong> : la référence mondiale avec plus de 18 000 établissements filtrés par critères islamiques (sans alcool, plage privée, piscine séparée...).</li>
<li><strong>Booking.com</strong> : filtrez par "sans alcool" dans les services de l'hôtel.</li>
<li><strong>HalalTrip</strong> : spécialisé Asie du Sud-Est, très pertinent pour Malaisie et Indonésie.</li>
</ul>

<h2>Notre recommandation par destination</h2>
<ul>
<li><strong>Istanbul</strong> : hôtels du quartier de Fatih et Sultanahmet — halal par tradition culturelle.</li>
<li><strong>Dubaï</strong> : tous les hôtels sont halal certifiés par obligation légale.</li>
<li><strong>Kuala Lumpur</strong> : certification JAKIM = garantie absolue sur tous les établissements certifiés.</li>
<li><strong>Marrakech</strong> : les riads de la médina sont halal par nature — un choix idéal pour les familles.</li>
</ul>`,
  },
  {
    slug: 'istanbul-guide-halal-complet',
    title: 'Istanbul halal : guide complet 2026 — restaurants, mosquées et conseils',
    description: 'Notre guide complet pour visiter Istanbul en respectant vos valeurs islamiques : les meilleurs restaurants halal, mosquées incontournables, quartiers à privilégier et astuces pratiques.',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    category: 'Destinations',
    readTime: '10 min',
    publishedAt: '2026-06-25',
    tags: ['Istanbul', 'Turquie', 'Guide', 'Restaurants halal', 'Mosquées'],
    content: `<h2>Istanbul, capitale mondiale du voyage halal</h2>
<p><strong>Istanbul</strong> est sans conteste la destination halal préférée des voyageurs musulmans francophones. Chaque année, des millions de touristes de France, de Belgique et du Maghreb choisissent cette ville unique qui enjambe deux continents pour une expérience halal totale. Et pour cause : dans cette mégapole à 99% musulmane, la question "où manger halal ?" ne se pose tout simplement pas.</p>

<h2>Pourquoi Istanbul est la destination halal idéale</h2>
<p>Istanbul offre une combinaison rare : 3 113 mosquées (dont les plus belles du monde islamique), une gastronomie 100% halal d'une richesse incomparable, une histoire ottomane millénaire et des prix parmi les plus accessibles d'Europe. À 3h30 de vol de Paris pour 150 à 300€ l'aller-retour, difficile de faire mieux.</p>
<ul>
<li><strong>Nourriture halal garantie</strong> : dans les quartiers historiques de Sultanahmet, Fatih et Üsküdar, la quasi-totalité des restaurants ne servent pas d'alcool et proposent de la viande halal.</li>
<li><strong>Appel à la prière 5 fois par jour</strong> : l'ézan rythme naturellement votre journée — un plaisir rare en dehors du monde islamique.</li>
<li><strong>Architecture islamique exceptionnelle</strong> : la Mosquée Bleue, Sainte-Sophie reconvertie en mosquée, la Mosquée Süleymaniye — des chefs-d'œuvre uniques au monde.</li>
</ul>

<h2>Les meilleurs quartiers halal d'Istanbul</h2>
<h3>Sultanahmet — Le cœur historique islamique</h3>
<p>C'est ici que bat le cœur spirituel d'Istanbul. La Mosquée Bleue, Sainte-Sophie et le Palais de Topkapi s'y côtoient dans un périmètre de quelques centaines de mètres. Les restaurants du quartier sont traditionnels et servent une cuisine turque authentiquement halal. Attention cependant aux établissements affichant des menus en 5 langues à l'entrée — ils sont souvent plus chers et moins bons.</p>

<h3>Fatih — Le quartier le plus islamique d'Istanbul</h3>
<p>Fatih est le cœur conservateur d'Istanbul. Mosquée Süleymaniye, Grand Bazar, marché de Beyazit — ici, vous vous sentirez dans une ville du monde islamique à part entière. Aucun alcool dans les restaurants, tenues modestes respectées.</p>

<h3>Üsküdar — L'âme anatolienne sur la rive asiatique</h3>
<p>Traversez le Bosphore en ferry (8 minutes depuis Eminönü) pour découvrir le vrai Istanbul résidentiel et conservateur. Mosquée Mihrimah Sultan, café surplombant le détroit, marchés locaux — une immersion authentique loin du tourisme de masse.</p>

<h2>Les mosquées incontournables d'Istanbul</h2>
<ul>
<li><strong>Mosquée Bleue (Sultan Ahmed Camii)</strong> : 6 minarets, dôme central de 43 mètres, 20 000 carreaux de faïence bleue Iznik. Construite entre 1609 et 1616, elle reste l'une des plus belles mosquées du monde.</li>
<li><strong>Sainte-Sophie (Ayasofya)</strong> : reconvertie en mosquée en 2020. Joyau architectural de 1 500 ans, elle combine art byzantin et art islamique dans un espace unique.</li>
<li><strong>Mosquée Süleymaniye</strong> : commandée par Soliman le Magnifique, achevée en 1557. Vue panoramique sur la Corne d'Or depuis les jardins.</li>
</ul>

<h2>Les meilleurs restaurants halal d'Istanbul</h2>
<p>Rappelons-le : dans les quartiers historiques, presque tout est halal. Voici nos coups de cœur :</p>
<ul>
<li><strong>Hamdi Restaurant (Eminönü)</strong> : institution depuis 1970, kebab d'agneau avec vue sur la Corne d'Or. Incontournable.</li>
<li><strong>Sultanahmet Köftecisi</strong> : depuis 1920, les meilleurs köfte d'Istanbul. Simplicité, qualité.</li>
<li><strong>Çiya Sofrası (Kadıköy)</strong> : la référence de la cuisine anatolienne authentique — plus de 50 plats régionaux différents chaque jour.</li>
<li><strong>Karaköy Güllüoğlu</strong> : la meilleure baklava d'Istanbul depuis 1949. À déguster chaud à la sortie du four.</li>
</ul>

<h2>Budget Istanbul 2026</h2>
<ul>
<li>Vol Paris–Istanbul (aller-retour) : 150–350 €</li>
<li>Hôtel 3* en centre historique : 60–100 €/nuit</li>
<li>Hôtel 4-5* avec vue Bosphore : 150–400 €/nuit</li>
<li>Repas local (restaurant de quartier) : 5–15 €</li>
<li>Repas restaurant touristique : 20–40 €</li>
<li>Billet Palais de Topkapi : 25 €</li>
<li>Transport Istanbulkart (journée) : 3–5 €</li>
</ul>`,
  },
  {
    slug: 'dubai-guide-halal-2026',
    title: 'Dubai halal : guide complet 2026 — tout savoir pour votre voyage',
    description: 'Guide complet Dubai 2026 pour les voyageurs musulmans : restaurants halal certifiés, mosquées, activités famille, budget et meilleures adresses.',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    category: 'Destinations',
    readTime: '9 min',
    publishedAt: '2026-06-22',
    tags: ['Dubai', 'EAU', 'Guide', 'Luxe', 'Famille'],
    content: `<h2>Dubai : la destination halal de luxe par excellence</h2>
<p>Dubai est unique au monde pour les voyageurs musulmans : <strong>tous les restaurants sont halal certifiés par obligation légale</strong>. La certification halal est imposée par le gouvernement des Émirats à l'ensemble des établissements de restauration — une garantie absolue que l'on ne trouve nulle part ailleurs.</p>

<h2>La certification halal aux EAU : une obligation légale</h2>
<p>Contrairement à la plupart des pays où la certification halal est volontaire, aux Émirats Arabes Unis, elle est <strong>obligatoire et gouvernementale</strong>. L'ESMA (Emirates Authority for Standardization and Metrology) supervise l'ensemble des certifications. Résultat : vous pouvez manger dans n'importe quel restaurant de Dubai sans la moindre inquiétude.</p>

<h2>La Mosquée Jumeirah — Une visite incontournable</h2>
<p>La Mosquée Jumeirah est l'une des rares mosquées de Dubai ouverte aux non-musulmans. Les visites guidées organisées par le SMCCU (Sheikh Mohammed Centre for Cultural Understanding) permettent aux touristes de toutes confessions de découvrir l'islam et l'architecture islamique.</p>
<ul>
<li>Visites guidées : samedi, dimanche, lundi, mardi et jeudi à 10h</li>
<li>Prix : 35 AED (environ 9€)</li>
<li>Tenue modeste obligatoire — abaya fournie sur place</li>
</ul>

<h2>Old Dubai : l'âme authentique de la ville</h2>
<p>Avant les gratte-ciels, Dubai était un village de pêcheurs et de commerçants. Le quartier d'Al Fahidi (Bur Dubai) et le souk de Deira préservent cette mémoire :</p>
<ul>
<li><strong>Abra (barque traditionnelle)</strong> : traversée de la Crique Dubai pour 1 AED — l'une des expériences les moins chères et les plus authentiques.</li>
<li><strong>Souk de l'or de Deira</strong> : plus de 300 bijouteries sur quelques rues.</li>
<li><strong>Souk des épices</strong> : safran, cardamome, encens — les arômes du Moyen-Orient.</li>
</ul>

<h2>Activités famille halal à Dubai</h2>
<ul>
<li><strong>Dubai Frame</strong> : moins cher que le Burj Khalifa, vue spectaculaire sur l'ancienne et la nouvelle ville.</li>
<li><strong>Safari dans le désert</strong> : dunes de sable rouge, balade à chameau, dîner sous les étoiles dans un camp bédouin.</li>
<li><strong>IMG Worlds of Adventure</strong> : le plus grand parc indoor du monde (Marvel, Cartoon Network).</li>
<li><strong>Dubai Aquarium & Underwater Zoo</strong> : l'un des plus grands aquariums du monde, au Dubai Mall.</li>
</ul>

<h2>Budget Dubai 2026</h2>
<ul>
<li>Vol Paris–Dubai (aller-retour) : 350–700 € (Emirates, Air France, Fly Dubai)</li>
<li>Hôtel 4* centralement situé : 100–200 €/nuit</li>
<li>Hôtel 5* luxe : 300–1 500 €/nuit</li>
<li>Repas restaurant local : 15–30 €</li>
<li>Repas restaurant gastronomique : 80–200 €</li>
<li>Dubai Metro (journée illimitée) : 6 AED (1,50€)</li>
<li>Safari désert tout compris : 70–120 €/personne</li>
</ul>`,
  },
  {
    slug: 'marrakech-guide-halal',
    title: 'Marrakech halal : guide complet 2026 — la ville ocre pour les voyageurs musulmans',
    description: 'Tout savoir pour visiter Marrakech en famille ou en couple : mosquées, restaurants halal, riads, souks et conseils pratiques pour un séjour parfait.',
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80',
    category: 'Destinations',
    readTime: '8 min',
    publishedAt: '2026-06-20',
    tags: ['Marrakech', 'Maroc', 'Guide', 'Famille', 'Médina'],
    content: `<h2>Marrakech : destination halal naturelle</h2>
<p>À Marrakech, la question "est-ce halal ?" n'existe tout simplement pas dans la médina. Le Maroc est un État islamique à 99% musulman — la totalité des restaurants, boucheries et étals alimentaires respectent les préceptes halal par défaut. Aucune vérification n'est nécessaire. C'est la liberté totale du voyageur musulman.</p>

<h2>La Mosquée Koutoubia — Le symbole de Marrakech</h2>
<p>Le minaret de la Koutoubia (70 mètres) est visible depuis presque toute la ville et constitue le modèle de l'architecture almohade qui influencera la Tour Hassan de Rabat et la Giralda de Séville. L'espace qui l'entoure est un jardin de roses, idéal pour une promenade au coucher du soleil avec le son de l'appel à la prière.</p>

<h2>La Médersa Ben Youssef</h2>
<p>Fondée au XIVe siècle, agrandie au XVIe, la Médersa Ben Youssef est l'une des plus grandes écoles coraniques du Maghreb. Son intérieur est d'une beauté stupéfiante : zelliges polychromes, stuc sculpté de formules coraniques, boiseries de cèdre odorantes. Elle accueillait jadis 900 étudiants islamiques. Aujourd'hui ouverte aux visiteurs.</p>

<h2>Les souks de Marrakech</h2>
<p>La médina de Marrakech est un labyrinthe de souks spécialisés :</p>
<ul>
<li><strong>Souk des tanneurs (Chouara)</strong> : spectacle unique des bacs de teinture colorés depuis les terrasses des maroquineries. À voir absolument.</li>
<li><strong>Souk des épices (Rahba Kedima)</strong> : safran, cumin, ras-el-hanout et plantes médicinales.</li>
<li><strong>Souk Semmarine</strong> : la rue principale des souks, artisanat en tous genres.</li>
<li><strong>Derb Dabachi</strong> : le souk des artisans du bois et du métal.</li>
</ul>

<h2>Restaurants halal incontournables de Marrakech</h2>
<ul>
<li><strong>Le Jardin (Médina)</strong> : cuisine marocaine raffinée dans un riad du XVIe siècle, cadre végétal luxuriant. Parfait pour un déjeuner élégant.</li>
<li><strong>Chez Lamine (Médina)</strong> : les meilleures tangia (agneau au four de potier) de Marrakech dans une ambiance 100% locale.</li>
<li><strong>Café de France (Jemaa el-Fna)</strong> : terrasse avec vue sur la place — l'endroit parfait pour observer l'animation.</li>
<li><strong>Jemaa el-Fna la nuit</strong> : les dizaines d'étals de restauration qui envahissent la place à partir du coucher du soleil — harira, méchoui, brochettes — sont une expérience en soi.</li>
</ul>

<h2>Budget Marrakech 2026</h2>
<ul>
<li>Vol Paris–Marrakech (aller-retour) : 80–250 € (Royal Air Maroc, EasyJet, Ryanair)</li>
<li>Riad médina 3* : 50–100 €/nuit</li>
<li>Riad de luxe 5* : 200–600 €/nuit</li>
<li>Repas restaurant local : 5–12 €</li>
<li>Repas restaurant touristique : 20–40 €</li>
<li>Entrée Médersa Ben Youssef : 7 €</li>
<li>Hammam traditionnel : 5–15 € (hammam public) / 30–80 € (hammam de riad)</li>
</ul>`,
  },
  {
    slug: 'vacances-halal-famille-2026',
    title: 'Vacances halal en famille 2026 : 5 idées pour des souvenirs inoubliables',
    description: 'Les meilleures destinations et conseils pour des vacances halal réussies en famille : sécurité, activités enfants, hébergement adapté et budget.',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    category: 'Famille',
    readTime: '7 min',
    publishedAt: '2026-06-18',
    tags: ['Famille', 'Enfants', 'Vacances', 'Halal', '2026'],
    content: `<h2>Choisir une destination familiale halal : les critères essentiels</h2>
<p>Voyager en famille avec des enfants demande une organisation particulière. Pour les familles musulmanes, s'y ajoutent les critères halal : nourriture accessible, mosquées pour la prière, environnement respectueux. Voici nos 5 meilleures recommandations 2026.</p>

<h2>1. Turquie — La destination famille numéro 1</h2>
<p>La Turquie réunit toutes les qualités pour une famille musulmane : nourriture halal partout, mosquées à chaque coin de rue, des activités pour tous les âges (Cappadoce, côte turquoise, parcs d'attractions à Istanbul), des prix très accessibles et une sécurité exemplaire. La Cappadoce avec ses montgolfières émerveille les enfants, les plages d'Antalya sont idéales pour les tout-petits.</p>

<h2>2. Maroc — Le dépaysement proche</h2>
<p>À 2h30 de vol, le Maroc est la destination familiale halal la plus accessible de France. Djerba (côté tunisie, mais Maroc aussi by extension), l'Atlas enneigé, les dunes du Sahara — des expériences inoubliables pour les enfants. Les riads de Marrakech avec leur architecture magique fascinent petits et grands.</p>

<h2>3. Djerba, Tunisie — La classique des familles</h2>
<p>Djerba reste la valeur sûre pour les familles françaises musulmanes : plages de sable blanc, eaux peu profondes et chaudes idéales pour les jeunes enfants, resorts familiaux bien équipés, gastronomie halal locale et prix très compétitifs (à partir de 500 € par personne vol + hôtel en demi-pension).</p>

<h2>4. Dubai — L'expérience luxe pour les familles</h2>
<p>Dubai est la Disneyland du monde réel : IMG Worlds of Adventure (le plus grand parc indoor du monde), Legoland, Dubai Aquarium, ski intérieur à Ski Dubai, safari en 4x4 dans les dunes — les activités pour enfants sont infinies dans un cadre halal certifié. Plus cher que les autres destinations, mais le rapport qualité-expérience est imbattable.</p>

<h2>5. Malaisie — La découverte en famille</h2>
<p>La Malaisie ouvre les yeux des enfants sur un monde différent : les tours Petronas qui touchent les nuages, les orangs-outans de Sepilok, les plages de Langkawi, les grottes de Batu Caves. Halal certifié JAKIM partout, anglais parlé facilement, prix très accessibles. Le long vol (12-13h) est le seul inconvénient.</p>

<h2>Checklist famille halal avant le départ</h2>
<ul>
<li>Vérifier les horaires de prière à destination (application Muslim Pro)</li>
<li>Identifier les mosquées à proximité de votre hébergement</li>
<li>Réserver un hôtel avec piscine privée ou familiale</li>
<li>Prévoir des snacks halal pour les longs trajets (surtout avion)</li>
<li>Télécharger les applications : Muslim Pro, HalalTrip, Grab ou Uber selon destination</li>
<li>Emporter un tapis de prière léger et pliable</li>
</ul>`,
  },
  {
    slug: 'malaisie-halal-destination',
    title: 'Malaisie : la destination n°1 mondiale pour les voyageurs musulmans',
    description: 'Pourquoi la Malaisie est régulièrement élue meilleure destination halal mondiale ? JAKIM, gastronomie, nature — notre guide complet.',
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80',
    category: 'Destinations',
    readTime: '8 min',
    publishedAt: '2026-06-15',
    tags: ['Malaisie', 'JAKIM', 'Halal certifié', 'Asie', 'Gastronomie'],
    content: `<h2>La Malaisie : 10 fois élue meilleure destination halal mondiale</h2>
<p>Le Global Muslim Travel Index (GMTI) couronne la Malaisie meilleure destination halal mondiale pour la 10e année consécutive. Ce n'est pas un hasard : la Malaisie a construit un écosystème halal complet, rigoureux et accessible qui n'a pas d'équivalent sur la planète.</p>

<h2>JAKIM : la certification halal la plus stricte du monde</h2>
<p>Le <strong>JAKIM</strong> (Jabatan Kemajuan Islam Malaysia — Département du Développement Islamique de Malaisie) est l'organisme gouvernemental qui certifie tous les établissements halal du pays. Sa certification est :</p>
<ul>
<li><strong>Annuellement renouvelée</strong> : pas de certification permanente — elle doit être re-validée chaque année</li>
<li><strong>Contrôlée aléatoirement</strong> : des inspecteurs effectuent des visites surprises</li>
<li><strong>Couvrant toute la chaîne</strong> : des abattoirs aux restaurants, en passant par les fournisseurs</li>
<li><strong>Reconnue mondialement</strong> : la certification JAKIM est acceptée comme référence internationale</li>
</ul>
<p>Résultat : voir le logo JAKIM affiché = certitude absolue halal.</p>

<h2>Kuala Lumpur : la capitale halal du monde</h2>
<p>KL est une métropole de 8 millions d'habitants où les food courts des centres commerciaux proposent 30 à 50 cuisines différentes — toutes halal certifiées JAKIM. La diversité gastronomique est époustouflante : malaise, chinoise halal, indienne, indonésienne, arabe, thaïe — sans jamais sacrifier la certification.</p>

<h2>Penang : paradis gastronomique halal</h2>
<p>Classée au patrimoine UNESCO, Penang est réputée pour avoir la meilleure cuisine de rue d'Asie du Sud-Est. Les marchés nocturnes (pasar malam) de Georgetown proposent des dizaines de spécialités halal : char kway teow, laksa asam, nasi kandar — des saveurs uniques au monde.</p>

<h2>Langkawi : plage et luxe halal</h2>
<p>L'archipel de Langkawi (99 îles) est exempt de taxes — alcool et cigarettes y sont taxés normalement, mais les hôtels premium proposent tous des options halal. Les plages de Pantai Cenang et les lagons de Kilim sont d'une beauté comparable aux Maldives, à un tiers du prix.</p>

<h2>Budget Malaisie 2026</h2>
<ul>
<li>Vol Paris–KL (aller-retour) : 500–900 € (Malaysia Airlines, Qatar Airways, Turkish Airlines)</li>
<li>Hôtel 4* central à KL : 50–100 €/nuit</li>
<li>Resort de luxe Langkawi : 150–400 €/nuit</li>
<li>Repas food court certifié JAKIM : 2–5 €</li>
<li>Repas restaurant gastronomique : 20–50 €</li>
<li>Tour Petronas (Sky Bridge) : 25 €</li>
</ul>`,
  },
  {
    slug: 'checklist-voyage-halal',
    title: 'Checklist voyage halal : ne rien oublier avant de partir',
    description: 'La liste complète de tout ce qu\'il faut préparer avant un voyage halal : documents, applications, vêtements, prière, nourriture et santé.',
    coverImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    category: 'Pratique',
    readTime: '5 min',
    publishedAt: '2026-06-12',
    tags: ['Checklist', 'Pratique', 'Organisation', 'Voyage halal'],
    content: `<h2>La checklist voyage halal ultime</h2>
<p>Que vous partiez pour un week-end à Istanbul ou 3 semaines en Malaisie, cette checklist complète vous assure de ne rien oublier pour un voyage halal serein.</p>

<h2>1. Documents essentiels</h2>
<ul>
<li>Passeport (validité min. 6 mois après retour)</li>
<li>Visa si nécessaire (vérifier sur France-Visas.gouv.fr)</li>
<li>Vaccinations : méningocoque ACWY (obligatoire pour Arabie Saoudite), selon destination</li>
<li>Assurance voyage avec rapatriement</li>
<li>Photocopies de tous les documents (email à soi-même)</li>
</ul>

<h2>2. Applications indispensables</h2>
<ul>
<li><strong>Muslim Pro</strong> : horaires de prière, Qibla, mosquées</li>
<li><strong>HalalTrip</strong> : restaurants et hôtels halal</li>
<li><strong>Zabihah.com</strong> : carte mondiale des restaurants halal</li>
<li><strong>Nusuk</strong> (si Omra/Arabie Saoudite)</li>
<li><strong>Grab</strong> (Asie du Sud-Est) ou <strong>Careem</strong> (Moyen-Orient) pour les transports</li>
</ul>

<h2>3. Nourriture halal</h2>
<ul>
<li>Identifier les restaurants halal certifiés à destination avant le départ</li>
<li>Emporter des snacks halal pour les longs trajets (barres de céréales, fruits secs, dattes)</li>
<li>Applications pour scanner les codes-barres et vérifier la composition (HalalCheck)</li>
<li>En pays non-musulman : contacter l'hôtel à l'avance pour le petit-déjeuner halal</li>
</ul>

<h2>4. Prière en voyage</h2>
<ul>
<li>Tapis de prière léger et pliable (existe en version compact 200g)</li>
<li>Boussole (ou utiliser l'application Qibla dans Muslim Pro)</li>
<li>Rappel : le voyageur peut raccourcir (Qasr) et regrouper (Jam') les prières</li>
<li>Identifier les salles de prière dans les aéroports de transit</li>
</ul>

<h2>5. Tenue vestimentaire</h2>
<ul>
<li>Tenues modestes pour les sites religieux (épaules et genoux couverts)</li>
<li>Hidjab / foulard (même si vous n'en portez pas habituellement, utile pour les mosquées)</li>
<li>Tenue d'ihram si Omra (hommes : 2 pièces blanches)</li>
<li>Chaussures confortables pour les longues marches (sites historiques, tawaf)</li>
</ul>

<h2>6. Santé</h2>
<ul>
<li>Médicaments personnels avec ordonnance traduite si nécessaire</li>
<li>Protection solaire forte (particulièrement pour pays du Golfe et Maghreb)</li>
<li>Solution de réhydratation pour pays chauds</li>
<li>Probiotiques pour prévenir les troubles digestifs liés au changement d'alimentation</li>
</ul>

<h2>7. Planification</h2>
<ul>
<li>Vérifier le calendrier islamique (éviter Hajj si non-pèlerin pour La Mecque)</li>
<li>Ramadan : restaurants fermés en journée dans les pays musulmans — adapter les horaires</li>
<li>Réserver l'hébergement halal certifié en avance (HalalBooking.com)</li>
<li>Informer la famille du plan de voyage</li>
</ul>`,
  },
  {
    slug: 'voyage-halal-solo-femme',
    title: 'Voyage halal en solo pour les femmes musulmanes : destinations sûres et conseils',
    description: 'Guide complet pour les femmes musulmanes souhaitant voyager seules : destinations les plus sûres, conseils de sécurité, question du mahram et communautés.',
    coverImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    category: 'Pratique',
    readTime: '8 min',
    publishedAt: '2026-06-08',
    tags: ['Femmes', 'Solo', 'Sécurité', 'Halal', 'Voyage'],
    content: `<h2>La femme musulmane voyageuse : une réalité croissante</h2>
<p>De plus en plus de femmes musulmanes voyagent seules — que ce soit pour des raisons professionnelles, pour explorer le monde ou pour accomplir l'Omra. L'industrie du tourisme halal répond à cette demande avec des offres spécifiques. Ce guide vous donne toutes les clés pour voyager seule en toute sérénité.</p>

<h2>La question du mahram</h2>
<p>La question du mahram (tuteur masculin) dans les voyages féminins fait l'objet de discussions entre érudits. L'avis le plus répandu dans les sociétés musulmanes contemporaines est que :</p>
<ul>
<li>L'Omra et le Hajj nécessitent un mahram selon l'avis majoritaire (mais certains érudits autorisent les voyages en groupe féminin organisé)</li>
<li>Les voyages touristiques ordinaires sont généralement autorisés pour une femme adulte capable de se protéger</li>
<li>Consultez un érudit de confiance pour votre situation personnelle</li>
</ul>

<h2>Les 4 destinations les plus sûres pour les femmes seules</h2>
<h3>1. Malaisie — Le choix numéro 1</h3>
<p>La Malaisie est régulièrement classée première destination mondiale pour les voyageuses solo, toutes confessions confondues. Pour les femmes musulmanes, c'est en plus la garantie d'un environnement halal total (JAKIM), d'une population accueillante (63% musulmane) et d'une infrastructure touristique excellente.</p>

<h3>2. Maroc — La proximité rassurante</h3>
<p>À 2h30 de Paris, le Maroc est familier culturellement pour de nombreuses femmes franco-marocaines. Les medinas de Fès et Marrakech sont très sûres dans leurs parties touristiques. Les femmes voilées sont pleinement respectées — aucun regard déplacé dans la plupart des contextes.</p>

<h3>3. Turquie — La modernité islamique</h3>
<p>Istanbul et les grandes villes turques sont très sûres pour les voyageuses solo. Les transports en commun (metro, tram) sont fiables et sécurisés. La Turquie combine modernité et valeurs islamiques — une femme voilée y est complètement normale et respectée.</p>

<h3>4. Émirats Arabes Unis — Le luxe sécurisé</h3>
<p>Dubai et Abu Dhabi ont l'un des taux de criminalité les plus bas du monde. Les femmes seules y sont en parfaite sécurité. Infrastructure hôtelière de classe mondiale avec services adaptés.</p>

<h2>7 conseils de sécurité pour voyager seule</h2>
<ul>
<li>Partager son itinéraire complet avec un proche de confiance</li>
<li>Utiliser uniquement des plateformes officielles pour les transports (Uber, Grab, Careem)</li>
<li>Éviter de montrer des objets de valeur (téléphone, bijoux) dans les zones touristiques</li>
<li>Rejoindre des groupes de voyageuses sur les réseaux sociaux (Facebook : "Femmes Musulmanes Voyageuses")</li>
<li>Préférer des hébergements avec avis récents positifs de femmes seules</li>
<li>Avoir le numéro de l'ambassade française à destination</li>
<li>Faire confiance à son instinct — si une situation met mal à l'aise, s'en éloigner</li>
</ul>

<h2>Communautés et ressources</h2>
<ul>
<li>Instagram : @musulmane_voyageuse, @halal_travel_sister</li>
<li>Facebook : "Sœurs Voyageuses" (groupe privé, vérification d'identité)</li>
<li>Blog : MuslimaTraveller.com (en anglais, la référence mondiale)</li>
</ul>`,
  },
  {
    slug: 'tourisme-halal-definition-2026',
    title: 'Tourisme halal : définition, critères et marché mondial en 2026',
    description: 'Qu\'est-ce que le tourisme halal exactement ? Définition complète, critères, marché mondial (240 milliards $) et tendances 2026.',
    coverImage: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80',
    category: 'Pratique',
    readTime: '6 min',
    publishedAt: '2026-06-05',
    tags: ['Définition', 'Tourisme halal', 'Marché', 'Tendances 2026'],
    content: `<h2>Tourisme halal : définition officielle</h2>
<p>Le tourisme halal (ou tourisme islamique, ou Muslim-friendly tourism) désigne l'ensemble des services touristiques — transport, hébergement, restauration, activités — organisés en conformité avec les préceptes islamiques. Il ne s'agit pas d'un tourisme religieux à proprement parler (comme le pèlerinage), mais d'un tourisme de loisirs accessible à tous, respectueux des valeurs musulmanes.</p>

<h2>Les critères du tourisme halal</h2>
<p>Un voyage peut être qualifié de "halal" lorsqu'il respecte au minimum ces critères :</p>
<ul>
<li><strong>Alimentation halal</strong> : viande abattue selon les rites islamiques, absence de porc et de ses dérivés</li>
<li><strong>Absence ou discrétion de l'alcool</strong> : dans les espaces communs à minima</li>
<li><strong>Accès à la prière</strong> : mosquées disponibles ou espace de prière fourni</li>
<li><strong>Respect de la pudeur</strong> : options de piscine/plage séparées ou privées si souhaitées</li>
<li><strong>Pas de divertissements illicites</strong> : pas de casino, pas de clubs de strip-tease dans l'hôtel</li>
</ul>

<h2>Le marché mondial du tourisme halal en 2026</h2>
<p>Le tourisme halal est l'un des marchés touristiques à la croissance la plus rapide au monde :</p>
<ul>
<li><strong>240 milliards de dollars</strong> : valeur estimée du marché en 2026 (source : DinarStandard)</li>
<li><strong>230 millions</strong> : nombre de voyageurs musulmans internationaux en 2025</li>
<li><strong>+8% par an</strong> : taux de croissance annuel moyen du secteur</li>
<li><strong>2030</strong> : le marché devrait atteindre 300 milliards de dollars</li>
</ul>

<h2>Les 5 pays leaders du tourisme halal réceptif</h2>
<ol>
<li><strong>Malaisie</strong> : 1ère au GMTI depuis 10 ans</li>
<li><strong>Turquie</strong> : la plus grande destination halal en volume</li>
<li><strong>Émirats Arabes Unis</strong> : leader du luxe halal</li>
<li><strong>Arabie Saoudite</strong> : tourisme spirituel + Vision 2030</li>
<li><strong>Indonésie</strong> : le géant émergent (280 millions d'habitants, 87% musulmans)</li>
</ol>

<h2>Tendances 2026 : vers un tourisme halal premium</h2>
<ul>
<li><strong>Tourisme spirituel</strong> : Omra, Hajj, visites des lieux saints historiques</li>
<li><strong>Éco-tourisme halal</strong> : voyages durables combinant valeurs islamiques et respect de l'environnement</li>
<li><strong>Halal Luxury</strong> : croissance du segment luxe (Maldives, Dubai, Marbella halal)</li>
<li><strong>Femmes voyageuses</strong> : forte croissance du segment féminin musulman solo</li>
</ul>

<h2>Comment VoyagesHalal.fr accompagne cette tendance</h2>
<p>VoyagesHalal.fr est la première plateforme francophone dédiée au voyage halal : guides de destinations, carte interactive des adresses halal, conseils pratiques et comparatif de forfaits Omra — tout ce dont vous avez besoin pour voyager en accord avec vos valeurs.</p>`,
  },
  {
    slug: 'voyage-halal-istanbul-guide-2026',
    title: 'Voyage halal à Istanbul : le guide complet 2026',
    description:
      'Restaurants halal, mosquées emblématiques, hôtels sans alcool et bons plans : tout pour préparer un voyage halal réussi à Istanbul en 2026.',
    coverImage: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80',
    category: 'Destinations',
    readTime: '9 min',
    publishedAt: '2026-06-20',
    tags: ['Istanbul', 'Turquie', 'Guide ville'],
    content: `<h2>Pourquoi Istanbul est la destination halal n°1</h2>
<p>À cheval entre l'Europe et l'Asie, Istanbul est sans doute la ville la plus accueillante au monde pour un voyageur musulman. Quasiment <strong>100% de la nourriture y est halal</strong>, l'appel à la prière rythme les journées, et les mosquées historiques font partie du décor quotidien. Notre <a href="/destinations/istanbul">guide complet d'Istanbul</a> recense des dizaines de restaurants certifiés, hôtels et activités.</p>

<h2>Les restaurants halal incontournables</h2>
<p>À Istanbul, le défi n'est pas de trouver du halal, mais de choisir ! Quelques institutions :</p>
<ul>
<li><strong>Hamdi Restaurant</strong> (Eminönü) — kebabs et baklavas avec vue sur la Corne d'Or.</li>
<li><strong>Sultanahmet Köftecisi</strong> — les köfte traditionnels depuis 1920.</li>
<li><strong>Karaköy Lokantası</strong> — cuisine turque raffinée près du Bosphore.</li>
</ul>

<h2>Mosquées à visiter</h2>
<p>La <strong>Mosquée Bleue</strong> et <strong>Sainte-Sophie</strong> sont des merveilles d'architecture islamique. N'oubliez pas la mosquée de <strong>Soliman le Magnifique</strong> (Süleymaniye) et la mosquée <strong>Fatih</strong>. Toutes sont ouvertes aux visiteurs en dehors des heures de prière.</p>

<h2>Où loger ?</h2>
<p>Le quartier de <strong>Sultanahmet</strong> est idéal pour un premier séjour : proche des sites, calme, nombreux hôtels sans alcool. Pour une ambiance plus moderne, optez pour <strong>Şişli</strong> ou <strong>Beşiktaş</strong>.</p>

<h2>Conseils pratiques</h2>
<ul>
<li><strong>Meilleure période</strong> : avril-juin et septembre-octobre (climat doux).</li>
<li><strong>Monnaie</strong> : livre turque (TRY) — le change est avantageux.</li>
<li><strong>Transport</strong> : carte Istanbulkart pour métro, tram et ferry.</li>
<li>Consultez les <a href="/horaires-priere">horaires de prière à Istanbul</a> et la <a href="/qibla">direction de la Qibla</a> directement sur VoyagesHalal.fr.</li>
</ul>

<p>Prêt à partir ? Découvrez toutes nos adresses sur le <a href="/destinations/istanbul">guide halal d'Istanbul</a>.</p>`,
  },
  {
    slug: 'voyage-halal-dubai-guide-2026',
    title: 'Voyage halal à Dubaï : le guide complet 2026',
    description:
      'Luxe, plages, gratte-ciel et halal certifié : le guide 2026 pour un voyage halal inoubliable à Dubaï — restaurants, hôtels, mosquées et activités.',
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    category: 'Destinations',
    readTime: '8 min',
    publishedAt: '2026-06-21',
    tags: ['Dubaï', 'Émirats', 'Guide ville'],
    content: `<h2>Dubaï, le luxe halal par excellence</h2>
<p>Dubaï combine modernité spectaculaire et valeurs islamiques. Toute la nourriture servie aux Émirats est <strong>halal par défaut</strong>, les hôtels proposent des options sans alcool, et la ville est l'une des plus sûres au monde. Explorez notre <a href="/destinations/dubai">guide complet de Dubaï</a>.</p>

<h2>Que faire à Dubaï en famille musulmane ?</h2>
<ul>
<li><strong>Burj Khalifa</strong> — la plus haute tour du monde et sa vue à 360°.</li>
<li><strong>Mosquée de Jumeirah</strong> — l'une des rares ouvertes aux visiteurs non-musulmans.</li>
<li><strong>Dubai Mall & fontaines</strong> — shopping, aquarium et spectacles.</li>
<li><strong>Désert</strong> — safari en 4x4 et dîner sous les étoiles (versions sans alcool disponibles).</li>
</ul>

<h2>Restaurants et hôtels halal</h2>
<p>Des tables gastronomiques aux food courts, tout est halal. Pour l'hébergement, de nombreux resorts proposent des étages familiaux, des piscines à horaires dédiés et une absence totale d'alcool sur demande. Comparez les adresses sur notre <a href="/destinations/dubai">page Dubaï</a>.</p>

<h2>Conseils pratiques</h2>
<ul>
<li><strong>Meilleure période</strong> : novembre à mars (éviter l'été très chaud).</li>
<li><strong>Tenue</strong> : décontractée en ville, modeste dans les lieux de culte.</li>
<li><strong>Prière</strong> : mosquées partout + salles de prière dans tous les malls. Voir les <a href="/horaires-priere">horaires de prière</a>.</li>
</ul>

<p>Planifiez votre séjour avec le <a href="/destinations/dubai">guide halal de Dubaï</a>.</p>`,
  },
  {
    slug: 'voyage-halal-marrakech-guide-2026',
    title: 'Voyage halal à Marrakech : le guide complet 2026',
    description:
      'Médina, riads, souks et gastronomie : le guide 2026 pour un voyage halal authentique à Marrakech. Restaurants, mosquées, hôtels et conseils pratiques.',
    coverImage: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=1200&q=80',
    category: 'Destinations',
    readTime: '8 min',
    publishedAt: '2026-06-22',
    tags: ['Marrakech', 'Maroc', 'Guide ville'],
    content: `<h2>Marrakech, l'authenticité halal à 3h de Paris</h2>
<p>La ville ocre est une destination de choix pour les voyageurs musulmans francophones : proximité, langue, et un cadre <strong>naturellement halal</strong>. Tout est sur notre <a href="/destinations/marrakech">guide complet de Marrakech</a>.</p>

<h2>Que voir et que faire ?</h2>
<ul>
<li><strong>Place Jemaa el-Fna</strong> — le cœur vibrant de la médina, classée UNESCO.</li>
<li><strong>Mosquée Koutoubia</strong> — le minaret emblématique du XIIe siècle.</li>
<li><strong>Jardin Majorelle</strong> et <strong>palais de la Bahia</strong>.</li>
<li><strong>Souks</strong> — épices, cuir, tapis et artisanat berbère.</li>
</ul>

<h2>Gastronomie halal</h2>
<p>Tajines, couscous, pastilla, thé à la menthe : la cuisine marocaine est un voyage à elle seule, et entièrement halal. Logez dans un <strong>riad</strong> traditionnel au cœur de la médina pour une expérience authentique et sans alcool.</p>

<h2>Conseils pratiques</h2>
<ul>
<li><strong>Meilleure période</strong> : mars-mai et septembre-novembre.</li>
<li><strong>Monnaie</strong> : dirham marocain (MAD).</li>
<li><strong>Prière</strong> : mosquées à chaque coin de rue. Voir les <a href="/horaires-priere">horaires de prière à Marrakech</a>.</li>
</ul>

<p>Préparez votre séjour avec le <a href="/destinations/marrakech">guide halal de Marrakech</a>.</p>`,
  },
]

export const blogPosts: BlogPost[] = [
  {
    slug: 'meilleurs-hotels-halal-istanbul',
    title: 'Les 10 meilleurs hôtels halal-friendly à Istanbul en 2026',
    description:
      'Notre sélection des meilleurs hôtels à Istanbul pour les voyageurs musulmans : sans alcool, cuisine halal certifiée, emplacement idéal près des mosquées et budget pour tous.',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    category: 'Hébergement',
    readTime: '5 min',
    publishedAt: '2026-01-20',
    tags: ['Istanbul', 'Hôtels', 'Halal-friendly'],
    content: `Istanbul dispose d'une offre hôtelière exceptionnelle pour les voyageurs musulmans, du riad traditionnel de la médina aux hôtels 5 étoiles en bord de Bosphore. Notre sélection couvre tous les budgets, tous situés à proximité des mosquées historiques et des transports en commun. Les hôtels du quartier de Sultanahmet et de Fatih sont particulièrement adaptés : sans alcool par choix culturel, cuisine turque traditionnelle halal au petit-déjeuner et service familial. Les hôtels du quartier de Beyoğlu offrent une expérience plus moderne, avec vue sur la Corne d'Or. Pour les familles nombreuses, les appartements de Üsküdar (côté asiatique) offrent plus d'espace à moindre coût, avec une atmosphère encore plus authentiquement islamique.`,
  },
  {
    slug: 'restaurants-halal-paris',
    title: 'Les meilleurs restaurants halal à Paris en 2026 : guide par arrondissement',
    description:
      'Guide complet et mis à jour des meilleurs restaurants halal certifiés à Paris : du kebab artisanal au gastronomique, des Grands Boulevards à la banlieue, tous les quartiers couverts.',
    coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    category: 'Gastronomie',
    readTime: '6 min',
    publishedAt: '2026-01-25',
    tags: ['Paris', 'Restaurants', 'France'],
    content: `Paris est l'une des villes les plus riches au monde en matière de restauration halal certifiée. Avec plus de 1 500 restaurants halal dans la capitale et sa proche banlieue, les voyageurs musulmans n'ont que l'embarras du choix. Des grandes tablées familiales de la rue de la Roquette (11e) aux adresses branchées de Pigalle (9e), en passant par les incontournables de Barbès (18e) et les restaurants gastronomiques du Triangle d'Or (8e), Paris offre un panorama culinaire halal d'une diversité inégalée : cuisine française halal, libanaise, turque, pakistanaise, sénégalaise, japonaise halal et bien plus encore. Notre guide recense les meilleures adresses par arrondissement, avec certification et spécialités.`,
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
