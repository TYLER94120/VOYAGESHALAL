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
        description: "Fondé en 1970, Hamdi est une institution istanbuliote. Cuisine turque traditionnelle avec une vue imprenable sur la Corne d'Or et le pont de Galata. Spécialité : kebab d'agneau au four.",
        rating: 4.7,
      },
      {
        name: 'Develi Bakliyat',
        address: 'Samatya, Fatih',
        description: "Spécialiste du kebab depuis 1912, entièrement halal. L'une des plus vieilles adresses de viande grillée d'Istanbul. Incontournable pour découvrir les saveurs anatoliennes authentiques.",
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
        description: "Chef-d'œuvre de l'architecture ottomane du XVIIe siècle. Ses 6 minarets et son immense dôme central en font l'une des mosquées les plus spectaculaires du monde. Ouverte aux visiteurs en dehors des heures de prière.",
        rating: 4.9,
      },
      {
        name: 'Mosquée Süleymaniye',
        address: 'Prof. Sıddık Sami Onar Cd., Fatih',
        description: "Commandée par Soliman le Magnifique et achevée en 1557, c'est la plus grande mosquée d'Istanbul. Son complexe comprend une medersa, un hammam et le tombeau du sultan. Vue panoramique sur la Corne d'Or depuis les jardins.",
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
        description: "L'un des plus anciens et des plus grands marchés couverts du monde avec plus de 4 000 boutiques. Épices, tapis, bijoux, céramiques et textiles. Un voyage sensoriel unique.",
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
    shortDescription: "La ville ocre, cœur de l'authenticité marocaine",
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
        address: '1 Derb Aarjan, Rahba Lakdima',
        description: "Restaurant contemporain sur le toit avec vue plongeante sur les souks. Cuisine marocaine revisitée avec des influences méditerranéennes. L'une des meilleures terrasses de la médina.",
        rating: 4.5,
      },
      {
        name: 'Café de France',
        address: 'Place Jemaa el-Fna',
        description: 'Terrasse iconique donnant sur la place Jemaa el-Fna. Idéal pour observer le spectacle permanent de la place tout en dégustant un thé à la menthe et une pastilla.',
        rating: 4.2,
      },
    ],
    mosques: [
      {
        name: 'Mosquée Koutoubia',
        address: 'Avenue Mohammed V',
        description: "Symbole absolu de Marrakech, la Koutoubia domine la ville de son minaret de 70 mètres depuis le XIIe siècle. Monument le plus photographié du Maroc, visible depuis presque tous les points de la médina. Les non-musulmans ne peuvent pas entrer mais peuvent admirer l'extérieur.",
        rating: 4.8,
      },
      {
        name: 'Mosquée Ben Youssef',
        address: 'Rue Assaba, Médina',
        description: "L'une des plus grandes et des plus anciennes mosquées de Marrakech, fondée au XIIe siècle. Sa médersa attenante (école coranique) est ouverte aux visiteurs et constitue un joyau d'architecture hispano-mauresque.",
        rating: 4.6,
      },
    ],
    activities: [
      {
        name: 'Médina et souks',
        description: 'Plonger dans le labyrinthe de la médina médiévale classée UNESCO : souk des tanneurs, souk des épices, souk des bijoutiers. Chaque artisan travaille selon des techniques transmises de génération en génération.',
        duration: 'Demi-journée',
      },
      {
        name: 'Jardins Majorelle',
        description: 'Oasis de verdure et de couleurs créée par le peintre Jacques Majorelle en 1924, restaurée par Yves Saint Laurent. Le musée berbère adjacent présente une collection exceptionnelle de bijoux et textiles berbères.',
        duration: '2 heures',
      },
      {
        name: 'Place Jemaa el-Fna',
        description: "Classée patrimoine immatériel de l'humanité par l'UNESCO, cette place est un spectacle vivant : conteurs, musiciens, herboristes, diseuses de bonne aventure s'y retrouvent chaque soir.",
        duration: 'Soirée',
      },
    ],
    relatedArticles: [
      { slug: 'lune-de-miel-halal', title: 'Lune de miel halal : 10 destinations romantiques', type: 'guide' },
      { slug: 'top-destinations-halal-2026', title: 'Top 10 destinations halal 2026', type: 'guide' },
    ],
    tips: [
      'Tout est halal au Maroc — aucune inquiétude alimentaire, y compris dans les restaurants d\'hôtels internationaux.',
      'Négocier est une pratique culturelle dans les souks. Le prix affiché est toujours le prix de départ, jamais le prix final.',
      'Se méfier des faux guides aux abords de la médina qui proposent de vous montrer les souks pour un "pourboire symbolique".',
      'Les riads offrent une expérience d\'hébergement authentique et souvent plus économique que les hôtels de chaîne.',
      'La place Jemaa el-Fna est à son meilleur au coucher du soleil — arriver vers 18h pour voir la transformation.',
    ],
  },
  {
    city: 'Dubaï',
    country: 'Émirats Arabes Unis',
    slug: 'dubai',
    shortDescription: 'Modernité et luxe au cœur du Golfe',
    description:
      "Dubaï incarne la vision la plus ambitieuse du monde halal contemporain. Émirat musulman à 100 %, la ville a développé une infrastructure halal d'une exhaustivité rare : certification obligatoire pour tous les restaurants, hôtels aux menus halal complets, plages et piscines avec horaires séparés sur demande, banque islamique, et même un label 'Muslim-Friendly Tourism' officiel. Gratte-ciels futuristes, désert à 45 minutes du centre, plages immaculées du Golfe et shopping de luxe se combinent dans une destination qui attire chaque année des millions de voyageurs musulmans du monde entier, notamment des familles françaises et maghrébines.",
    coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 700,
    restaurantHalalCount: 10000,
    population: '3.5 millions',
    bestTime: 'Novembre–avril',
    tags: ['Luxe', 'Shopping', 'Architecture', 'Désert'],
    restaurants: [
      {
        name: 'Nobu Dubai',
        address: 'Atlantis The Palm, Crescent Road',
        description: "Version halal du célèbre restaurant japonais de fusion du chef Nobu Matsuhisa. L'une des rares adresses gastronomiques de renommée mondiale à proposer une carte entièrement certifiée halal.",
        rating: 4.7,
      },
      {
        name: 'Al Fanar Restaurant & Café',
        address: 'Festival City Mall · Dubai Festival City',
        description: 'La référence pour la cuisine émiratie traditionnelle. Décor rétro inspiré des années 1960 à Dubaï, carte authentique : harees (porridge de viande), majboos (riz épicé), luqaimat (beignets au miel).',
        rating: 4.5,
      },
      {
        name: 'Logma',
        address: 'Box Park, Al Wasl Road, Jumeirah',
        description: 'Cuisine émiratie contemporaine dans un cadre décontracté. Idéal pour découvrir la gastronomie du Golfe avec une touche moderne. Le petit-déjeuner chausson balaleet (vermicelles sucrés) est une expérience unique.',
        rating: 4.4,
      },
    ],
    mosques: [
      {
        name: 'Grande Mosquée de Jumeirah (Jumeirah Mosque)',
        address: 'Jumeirah Beach Road, Al Jumeirah 1',
        description: 'La plus belle et la plus célèbre mosquée de Dubaï, construite dans le style fatimide égyptien. Remarquable par ses deux minarets et son grand dôme central éclairés la nuit. Unique à Dubaï à être ouverte aux visiteurs non-musulmans avec visites guidées organisées.',
        rating: 4.9,
      },
      {
        name: 'Mosquée Al Farooq Omar bin Al Khattab',
        address: 'Sheikh Khalifa Bin Zayed Road, Al Safa 1',
        description: 'Surnommée la "Mini-Mosquée du Prophète" pour son architecture inspirée de Médine, elle peut accueillir 2 000 fidèles. Son dôme central de 21 mètres et ses 21 dômes secondaires en font un monument architectural remarquable.',
        rating: 4.7,
      },
    ],
    activities: [
      {
        name: 'Burj Khalifa — At The Top',
        description: "Montée au sommet du plus haut bâtiment du monde (828 m) pour une vue à 360° sur Dubaï, le Golfe Persique et les Émirats. Réserver à l'avance en ligne pour bénéficier des meilleurs tarifs.",
        duration: '2–3 heures',
      },
      {
        name: 'Safari dans le désert',
        description: "Excursion incontournable dans les dunes de l'Erg Al Uhaymir. Au programme : montée en dune, balade à dos de chameau, sandboard, puis dîner traditionnel bédouin sous les étoiles avec spectacle de danse du ventre.",
        duration: 'Journée complète',
      },
      {
        name: 'Vieux Dubaï (Al Fahidi & Deira)',
        description: "Découverte de l'âme historique de Dubaï : le quartier Al Fahidi avec ses tours à vent en corail, la traversée en abra (barque traditionnelle) sur la Crique, et les souks aux épices et à l'or.",
        duration: 'Demi-journée',
      },
    ],
    relatedArticles: [
      { slug: 'hotel-halal-tout-savoir', title: "Hôtel halal : tout ce qu'il faut savoir avant de réserver", type: 'guide' },
      { slug: 'ramadan-voyage-guide', title: 'Voyager pendant le Ramadan : guide complet', type: 'guide' },
    ],
    tips: [
      "Tous les restaurants de Dubaï affichent leur certification halal — aucune inquiétude alimentaire même dans les enseignes internationales.",
      "L'alcool est disponible uniquement dans les hôtels licenciés et bars — il est très facile de l'éviter, ce n'est jamais imposé.",
      'Code vestimentaire : tenues couvrantes dans les espaces publics, les centres commerciaux et les mosquées. Les tenues de plage sont réservées aux zones balnéaires.',
      "Pendant le Ramadan, l'ambiance est incomparable. Horaires décalés, mais prix souvent réduits dans les hôtels.",
      'Les taxis sont fiables et économiques. Uber/Careem fonctionnent parfaitement. Éviter les taxis sans compteur.',
    ],
  },
  {
    city: 'Kuala Lumpur',
    country: 'Malaisie',
    slug: 'kuala-lumpur',
    shortDescription: 'La capitale mondiale du tourisme halal certifié',
    description:
      "Kuala Lumpur est régulièrement couronnée comme la meilleure destination du monde pour le tourisme halal par le Global Muslim Travel Index. La Malaisie dispose du système de certification halal le plus sophistiqué au monde, géré par JAKIM (Département des affaires islamiques) : chaque restaurant, chaque produit alimentaire, chaque hôtel doit obtenir et renouveler annuellement sa certification. Pour le voyageur musulman, c'est une liberté totale : manger n'importe où sans se poser de questions, trouver des salles de prière dans chaque centre commercial, bénéficier d'hôtels Muslim-friendly avec piscines séparées et cuisine halal certifiée. Tout cela dans une ville ultra-moderne, cosmopolite et à des prix très inférieurs à l'Europe.",
    coverImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 1000,
    restaurantHalalCount: 20000,
    population: '8 millions',
    bestTime: "Toute l'année · Éviter mousson (mai–octobre)",
    tags: ['Halal certifié', 'Modernité', 'Nature', 'Shopping'],
    restaurants: [
      {
        name: 'Nasi Kandar Pelita',
        address: 'Jalan Ampang (et plusieurs succursales)',
        description: "Institution malaisienne ouverte 24h/24, 7j/7. Le nasi kandar est un plat de riz avec une sélection de curries et de fritures posés dessus. Incontournable pour s'imprégner de la culture culinaire malaisienne.",
        rating: 4.4,
      },
      {
        name: 'Atmosphere 360°',
        address: 'Menara KL Tower, Jalan Punchak',
        description: 'Restaurant tournant au sommet de la tour KL avec vue panoramique sur la skyline de Kuala Lumpur. Buffet international halal certifié. Une expérience culinaire mémorable dans un cadre exceptionnel.',
        rating: 4.5,
      },
    ],
    mosques: [
      {
        name: 'Mosquée Nationale (Masjid Negara)',
        address: 'Jalan Perdana, Tasik Perdana',
        description: "La mosquée nationale de Malaisie, construite en 1965, symbole de l'indépendance du pays. Son toit en forme d'étoile à 18 branches et son minaret de 73 mètres sont devenus des icônes architecturales. Ouverte aux non-musulmans en dehors des heures de prière.",
        rating: 4.7,
      },
      {
        name: 'Mosquée de Cristal (Masjid Kristal)',
        address: 'Pulau Wan Man, Kuala Terengganu',
        description: 'À 5h de route de KL, cette mosquée construite en verre, acier et cristal au-dessus du lac Wan Man est l\'une des plus photogéniques de Malaisie. Vaut le détour pour un road trip.',
        rating: 4.8,
      },
    ],
    activities: [
      {
        name: 'Tours Petronas et KLCC',
        description: "Les tours jumelles Petronas (452 m) dominent la skyline de KL depuis 1998. La passerelle du 41e étage offre une vue époustouflante. Le parc KLCC attenant est idéal pour une promenade au coucher du soleil.",
        duration: '2–3 heures',
      },
      {
        name: 'Grottes de Batu',
        description: 'Site naturel et religieux hindou à 30 minutes du centre. Les impressionnantes cavernes calcaires abritent un temple et offrent une excursion nature et culture unique.',
        duration: '2 heures',
      },
      {
        name: 'Central Market et Chinatown',
        description: "Le Central Market est le meilleur endroit pour acheter de l'artisanat malaisien authentique à prix raisonnables. Chinatown (Petaling Street) offre un dépaysement culinaire et culturel total.",
        duration: 'Demi-journée',
      },
    ],
    relatedArticles: [
      { slug: 'hotel-halal-tout-savoir', title: "Hôtel halal : tout ce qu'il faut savoir avant de réserver", type: 'guide' as const },
      { slug: 'voyage-halal-debutant', title: 'Guide complet du voyage halal pour débutants', type: 'guide' as const },
    ],
    tips: [
      'Certification JAKIM = garantie absolue de halal. Si vous voyez ce logo, vous êtes sûr à 100 %.',
      "Les centres commerciaux (Pavilion, KLCC, Mid Valley) disposent tous de food courts avec des dizaines d'options halal certifiées.",
      "Les transports en commun (LRT, MRT, monorail) sont excellents et très économiques. La carte Touch 'n Go est indispensable.",
      "Grab (l'Uber local) est la référence pour les déplacements. Bien moins cher que les taxis traditionnels.",
      'La cuisine halal malaisienne est une fusion extraordinaire : influences malaises, chinoises et indiennes toutes certifiées halal.',
    ],
  },
  {
    city: 'Le Caire',
    country: 'Égypte',
    slug: 'le-caire',
    shortDescription: 'La mère du monde, entre pyramides et minarets',
    description:
      "Le Caire est une expérience de voyage sans équivalent dans le monde islamique. Capitale de l'islam sunnite avec la vénérable université Al-Azhar (fondée en 970), berceau d'une des plus grandes civilisations antiques avec les pyramides de Gizeh et les trésors du musée égyptien, la ville conjugue avec une rare intensité spiritualité islamique et histoire millénaire. Avec ses 3 000 mosquées, ses marchés débordants de vie et sa gastronomie généreuse et 100 % halal, Le Caire est une immersion totale dans l'âme du monde arabe. Une destination pour les voyageurs curieux et aventuriers qui cherchent une expérience authentique, loin des clichés touristiques.",
    coverImage: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 3000,
    restaurantHalalCount: 25000,
    population: '21 millions',
    bestTime: 'Octobre–avril',
    tags: ['Histoire', 'Archéologie', 'Islam', 'Culture'],
    restaurants: [
      {
        name: 'Koshary Abou Tarek',
        address: '16 Maarouf St, Downtown Cairo',
        description: "Institution cairote fondée en 1950, spécialisée dans le koshary — plat national égyptien à base de riz, lentilles, pâtes et sauce tomate épicée. File d'attente garantie mais prix dérisoires. Une expérience culinaire populaire et authentique.",
        rating: 4.5,
      },
      {
        name: 'Sequoia',
        address: '3 Abu El Feda St, Zamalek',
        description: 'Restaurant sur le Nil dans le quartier chic de Zamalek. Cuisine orientale et internationale dans un cadre élégant avec vue sur le fleuve. Idéal pour un dîner avec vue au coucher du soleil.',
        rating: 4.6,
      },
    ],
    mosques: [
      {
        name: 'Mosquée et université Al-Azhar',
        address: 'El-Darb El-Ahmar, Al-Azhar',
        description: "Fondée en 970 par la dynastie fatimide, Al-Azhar est à la fois la plus vieille université en activité au monde et l'une des mosquées les plus importantes de l'islam sunnite. Centre mondial de la pensée islamique, elle attire des étudiants de plus de 100 pays. Architecture fatimide magnifiquement préservée.",
        rating: 4.8,
      },
      {
        name: 'Mosquée Ibn Tulun',
        address: 'Tulun Square, El-Sayeda Zeinab',
        description: "La plus ancienne mosquée du Caire encore debout (879 après J.-C.) et l'une des mieux préservées au monde. Son minaret à rampe hélicoïdale unique est une référence architecturale islamique mondiale. Vue panoramique sur Le Caire depuis le minaret.",
        rating: 4.7,
      },
    ],
    activities: [
      {
        name: 'Pyramides de Gizeh et Sphinx',
        description: "La seule des Sept Merveilles du monde antique encore debout. Les trois pyramides de Khéops, Khéphren et Mykérinos avec le Grand Sphinx constituent un site archéologique d'une puissance émotionnelle incomparable. Préférer la visite tôt le matin ou en fin d'après-midi.",
        duration: 'Journée complète',
      },
      {
        name: 'Musée Égyptien',
        description: 'Le plus grand musée d\'antiquités égyptiennes au monde avec 120 000 pièces, dont le trésor de Toutankhamon (masque funéraire en or massif, sarcophages, bijoux). Incontournable pour comprendre 5 000 ans de civilisation.',
        duration: '3–4 heures',
      },
      {
        name: 'Khan el-Khalili',
        description: 'Grand souk historique fondé en 1382, véritable ville dans la ville. Orfèvres, marchands d\'épices, libraires de textes coraniques et cafés traditionnels comme le Fishawi (ouvert depuis 1773) s\'y succèdent dans un dédale de ruelles médiévales.',
        duration: 'Demi-journée',
      },
    ],
    relatedArticles: [
      { slug: 'ramadan-voyage-guide', title: 'Voyager pendant le Ramadan : guide complet', type: 'guide' as const },
      { slug: 'top-destinations-halal-2026', title: 'Top 10 destinations halal 2026', type: 'guide' as const },
    ],
    tips: [
      "L'Égypte est à 90 % musulmane — tout est halal sans exception, y compris les restaurants de chaînes internationales.",
      'Négocier est indispensable pour tout : taxis, calèches, entrées de sites, souvenirs. Toujours demander le prix avant.',
      "Boire exclusivement de l'eau en bouteille — éviter l'eau du robinet et les glaçons dans les établissements peu soignés.",
      'Le trafic cairote est légendaire. Prévoir le double du temps estimé pour tous les déplacements.',
      "Les sites archéologiques sont souvent mieux tôt le matin (avant 9h) ou en fin de journée (après 15h) pour éviter chaleur et foule.",
    ],
  },
  {
    city: 'Médine',
    country: 'Arabie Saoudite',
    slug: 'medine',
    shortDescription: "La ville du Prophète ﷺ, cœur spirituel de l'islam",
    description:
      "Médine (Al-Madinah Al-Munawwarah, 'la ville lumineuse') est la deuxième ville sainte de l'islam. C'est là que le Prophète Mohammed ﷺ se réfugia lors de l'Hégire en 622, qu'il fonda la première communauté islamique, et qu'il repose depuis sa mort en 632. Visiter Médine, c'est entreprendre un voyage spirituel d'une profondeur rare : se recueillir devant le tombeau du Prophète ﷺ dans la Mosquée an-Nabawi, prier dans la mosquée Quba (la première de l'histoire), marcher sur les lieux où l'islam a pris racine. L'infrastructure moderne de la ville (hôtels de luxe, transports, commodités) permet un séjour confortable, entièrement dédié à la spiritualité et au recueillement.",
    coverImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
    halalScore: 5,
    mosqueeCount: 2000,
    restaurantHalalCount: 5000,
    population: '1.5 million',
    bestTime: 'Septembre–avril · Éviter Hajj si non pèlerin',
    tags: ['Spiritualité', 'Pèlerinage', 'Islam', 'Umrah'],
    restaurants: [
      {
        name: 'Restaurants Al-Ansar',
        address: 'Quartier central, proximité Masjid an-Nabawi',
        description: 'Cuisine saoudienne et yéménite traditionnelle à deux pas de la mosquée du Prophète. Spécialités : mandi (riz et viande fumée), kabsa (riz aux épices), harees. Atmosphère de recueillement et de fraternité islamique.',
        rating: 4.3,
      },
      {
        name: 'Buffets des grands hôtels',
        address: 'Hilton, Anwar Al-Madinah Mövenpick, Pullman Zamzam',
        description: 'Les hôtels 5 étoiles autour de la mosquée proposent des buffets internationaux halal certifiés, idéaux pour les familles et les groupes. Pratique pour les nuits de Ramadan avec iftar et suhoor organisés.',
        rating: 4.5,
      },
    ],
    mosques: [
      {
        name: 'Masjid an-Nabawi (Mosquée du Prophète)',
        address: 'Centre-ville de Médine',
        description: "Deuxième site le plus saint de l'islam. La mosquée originelle fut construite par le Prophète Mohammed ﷺ lui-même en 622. Elle abrite aujourd'hui son tombeau (la Chambre Verte), ainsi que les tombeaux d'Abou Bakr et d'Omar. Avec une capacité d'accueil de plus d'un million de fidèles après ses agrandissements successifs, c'est l'une des plus grandes mosquées du monde.",
        rating: 5.0,
      },
      {
        name: 'Masjid Quba',
        address: 'Quartier de Quba, Médine',
        description: "La toute première mosquée construite dans l'histoire de l'islam, édifiée par le Prophète ﷺ lui-même lors de son arrivée à Médine en 622. Prier deux rakaat dans Masjid Quba équivaut à la récompense d'une Umrah selon un hadith authentique.",
        rating: 4.8,
      },
    ],
    activities: [
      {
        name: 'Visite de Masjid al-Qiblatayn',
        description: "La \"mosquée des deux Qiblas\" où le Prophète ﷺ reçut l'ordre divin de changer la direction de la prière de Jérusalem vers La Mecque. Monument historique islamique de première importance.",
        duration: '1 heure',
      },
      {
        name: 'Montagne Uhud',
        description: "Site de la célèbre bataille d'Uhud (625 après J.-C.). On peut visiter la tombe des martyrs, notamment celle de Hamza ibn Abd al-Muttalib (oncle du Prophète ﷺ). Un lieu de recueillement profond pour tout musulman.",
        duration: '2 heures',
      },
    ],
    relatedArticles: [
      { slug: 'omra-2026-guide-complet', title: 'Omra 2026 : guide complet pour préparer votre pèlerinage', type: 'guide' as const },
      { slug: 'ramadan-voyage-guide', title: 'Voyager pendant le Ramadan : guide complet', type: 'guide' as const },
    ],
    tips: [
      "Médine est accessible uniquement aux musulmans — aucun non-musulman n'est autorisé à entrer dans la ville sainte.",
      'Tenue islamique strictement obligatoire en tout temps. La modestie est une marque de respect envers les lieux saints.',
      'Réserver les hôtels 3 à 6 mois à l\'avance pendant Ramadan et la période du Hajj — les places sont rares et les prix triplent.',
      'Les horaires de prière à la Mosquée du Prophète sont l\'axe de la journée — tout le programme s\'organise autour d\'eux.',
      'Apporter un stock de chapelets (tasbih) et de livres de douas (invocations) pour profiter pleinement de la dimension spirituelle du séjour.',
    ],
  },
]

export const guides: Guide[] = [
  {
    slug: 'voyage-halal-debutant',
    title: 'Guide complet du voyage halal pour débutants',
    description:
      'Tout ce que vous devez savoir pour voyager halal en toute sérénité : alimentation certifiée, prière en voyage, hébergement halal-friendly et applications indispensables.',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
    category: 'Pratique',
    readTime: '8 min',
    publishedAt: '2026-01-10',
    tags: ['Débutant', 'Pratique', 'Conseils'],
    content: `<h2>Voyager halal : de quoi parle-t-on ?</h2>
<p>Voyager halal, c'est organiser son séjour en accord avec les préceptes islamiques, sans pour autant se priver d'explorer le monde. L'islam est une religion de facilité : de nombreuses règles sont allégées pour le voyageur. Ce guide vous donne toutes les clés pour voyager sereinement.</p>

<h2>1. L'alimentation halal en voyage</h2>
<p>La nourriture est la première préoccupation des voyageurs musulmans. Voici comment s'y retrouver selon les destinations :</p>
<ul>
<li><strong>Dans les pays à majorité musulmane</strong> (Maroc, Turquie, Émirats, Malaisie, Égypte) : tout est halal par défaut. Aucune vérification nécessaire.</li>
<li><strong>En Europe occidentale</strong> : chercher les restaurants certifiés halal. Le logo de certification (AVS, HMC, etc.) doit être affiché.</li>
<li><strong>Applications utiles</strong> : Zabihah, HalalTrip, Halal Navi permettent de localiser les restaurants halal certifiés dans le monde entier.</li>
<li><strong>En cas de doute</strong> : optez pour la cuisine végétarienne, les fruits de mer ou les œufs — des alternatives halal universelles.</li>
</ul>

<h2>2. La prière en voyage : les facilités islamiques</h2>
<p>L'islam facilite considérablement la prière pour le voyageur (mossafir) :</p>
<ul>
<li><strong>Qasr</strong> : raccourcissement des prières de 4 rakaat à 2 (Dhuhr, Asr, Isha).</li>
<li><strong>Jam'</strong> : regroupement de Dhuhr + Asr d'une part, et Maghrib + Isha d'autre part.</li>
<li><strong>Qibla</strong> : l'application Muslim Pro ou Qibla Compass indique instantanément la direction de La Mecque depuis n'importe quel endroit du globe.</li>
<li><strong>Salles de prière</strong> : disponibles dans la plupart des aéroports internationaux, centres commerciaux modernes et gares.</li>
</ul>

<h2>3. Choisir son hébergement halal-friendly</h2>
<p>Un hôtel halal-friendly n'est pas forcément un hôtel islamique. Les critères à rechercher :</p>
<ul>
<li>Absence de bar et de casino dans les parties communes</li>
<li>Présence d'un restaurant avec options halal certifiées</li>
<li>Disponibilité d'un tapis de prière et d'une indication Qibla en chambre</li>
<li>Piscine avec créneaux séparés hommes/femmes (critère optionnel selon les familles)</li>
</ul>
<p>Booking.com et HalalBooking.com permettent de filtrer sur ces critères.</p>

<h2>4. Applications indispensables pour voyager halal</h2>
<ul>
<li><strong>Muslim Pro</strong> : horaires de prière, Qibla, Coran, compteur de tasbih</li>
<li><strong>Zabihah</strong> : annuaire mondial des restaurants halal</li>
<li><strong>HalalTrip</strong> : guide de voyage halal complet</li>
<li><strong>Google Maps</strong> : chercher "halal restaurant" + ville</li>
</ul>`,
  },
  {
    slug: 'top-destinations-halal-2026',
    title: 'Top 10 destinations halal 2026 : notre classement',
    description:
      'Notre sélection des meilleures destinations de voyage halal pour 2026, de Istanbul à Kuala Lumpur. Classées par accessibilité, infrastructures halal et expérience globale.',
    coverImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
    category: 'Destinations',
    readTime: '6 min',
    publishedAt: '2026-01-15',
    tags: ['Top', '2026', 'Destinations'],
    content: `<h2>Pourquoi voyager halal est plus accessible que jamais en 2026</h2>
<p>Le tourisme halal représente désormais un marché de plus de 220 milliards de dollars et continue de croître à un rythme de 8 % par an. Les destinations du monde entier adaptent leurs infrastructures pour accueillir les voyageurs musulmans. Voici notre classement 2026.</p>

<h2>1. Istanbul, Turquie — La valeur sûre absolue</h2>
<p>Istanbul trône en tête de notre classement pour la 3e année consécutive. Cuisine 100 % halal, mosquées millénaires, histoire ottomane incomparable et prix abordables en font la destination préférée des Français musulmans.</p>

<h2>2. Kuala Lumpur, Malaisie — La capitale mondiale du halal</h2>
<p>Certifiée et organisée comme aucune autre ville au monde. La certification JAKIM garantit une tranquillité d'esprit totale pour tous les aspects du séjour.</p>

<h2>3. Dubaï, Émirats Arabes Unis — Le luxe halal</h2>
<p>La destination premium du voyage halal. Infrastructure irréprochable, modernité absolue et service 5 étoiles dans un cadre islamique assumé.</p>

<h2>4. Marrakech, Maroc — L'authenticité sans compromis</h2>
<p>La France a un lien particulier avec le Maroc. Marrakech reste la destination halal la plus prisée des voyageurs français musulmans pour son accessibilité, sa culture et sa gastronomie.</p>

<h2>5. Le Caire, Égypte — Histoire et spiritualité réunies</h2>
<p>Les pyramides + Al-Azhar = une combinaison unique au monde que seul Le Caire peut offrir.</p>

<h2>6. Médine, Arabie Saoudite — Le voyage spirituel ultime</h2>
<p>Pour les musulmans, un séjour à Médine transcende la notion de tourisme. C'est un voyage de l'âme.</p>`,
  },
  {
    slug: 'ramadan-voyage-guide',
    title: 'Voyager pendant le Ramadan : guide complet 2026',
    description:
      "Comment organiser et vivre pleinement un voyage pendant le mois de Ramadan ? Destinations idéales, conseils pour l'iftar en voyage, gestion du jeûne et ambiances inoubliables.",
    coverImage: 'https://images.unsplash.com/photo-1518730518541-d0843268c287?w=1200&q=80',
    category: 'Spiritualité',
    readTime: '7 min',
    publishedAt: '2026-02-01',
    tags: ['Ramadan', 'Spiritualité', 'Conseils'],
    content: `<h2>Faut-il jeûner en voyage pendant Ramadan ?</h2>
<p>L'islam accorde une facilité (rukhsa) au voyageur : il est permis de rompre le jeûne en voyage et de le rattraper ultérieurement (qada). Cette règle s'applique quand le voyage engendre une fatigue ou une difficulté notable. Consultez un érudit de confiance pour votre situation personnelle.</p>

<h2>Les destinations idéales pour vivre Ramadan intensément</h2>
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
    description: "Tout ce qu'il faut savoir pour préparer votre Omra en 2026 : visa, agences, budget, rituels, meilleure période et conseils pratiques.",
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
    description: "Applications, astuces et ressources pour localiser la mosquée la plus proche lors de vos voyages, dans n'importe quel pays du monde.",
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
    title: "Hôtel halal : tout ce qu'il faut savoir avant de réserver",
    description: "Qu'est-ce qu'un hôtel halal ? Critères, certifications, plateformes de réservation et notre sélection des meilleures adresses par destination.",
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
