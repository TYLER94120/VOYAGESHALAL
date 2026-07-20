// Guides éditoriaux « [Ville] pour un voyageur musulman » — avis concret +
// mini-parcours 2-3 jours. RÈGLE : uniquement des lieux/faits notoires et
// vérifiables (monuments, quartiers, mosquées célèbres) ; jamais d'adresse
// précise inventée — pour les restos on renvoie vers nos listes sourcées.
// Rédigé main pour les grandes destinations ; les autres villes gardent leur
// description + données OSM (pas de texte généré artificiellement).

export interface GuideEtape { icon: string; fr: string; en: string }
export interface GuideJour { titre: string; titreEn: string; etapes: GuideEtape[] }
export interface CityGuide { avis: string; avisEn: string; jours: GuideJour[] }

export const CITY_GUIDES: Record<string, CityGuide> = {
  istanbul: {
    avis:
      "Istanbul est probablement la ville la plus facile au monde pour un voyageur musulman : l'adhan rythme la journée, presque tout est halal par défaut, et les mosquées historiques sont aussi des chefs-d'œuvre à visiter. Logez côté Sultanahmet pour les monuments à pied, ou à Eminönü/Sirkeci pour être entre le Bazar et le Bosphore. Attendez-vous à beaucoup de monde sur les sites majeurs — visez l'ouverture le matin, et gardez les soirées pour les rives du Bosphore.",
    avisEn:
      "Istanbul may be the easiest city in the world for a Muslim traveler: the adhan sets the rhythm of the day, nearly everything is halal by default, and the historic mosques are masterpieces you can actually pray in. Stay around Sultanahmet to walk to the monuments, or Eminönü/Sirkeci to sit between the Bazaar and the Bosphorus. Expect crowds at the big sites — go at opening time, and keep evenings for the Bosphorus shores.",
    jours: [
      {
        titre: 'Jour 1 — Sultanahmet, le cœur historique',
        titreEn: 'Day 1 — Sultanahmet, the historic heart',
        etapes: [
          { icon: '🕌', fr: 'Mosquée Bleue puis Sainte-Sophie (Ayasofya) dès l\'ouverture — priez-y, c\'est ouvert au culte', en: 'Blue Mosque then Hagia Sophia (Ayasofya) at opening — both are active mosques you can pray in' },
          { icon: '🏛', fr: 'Palais de Topkapı et la citerne Basilique l\'après-midi', en: 'Topkapı Palace and the Basilica Cistern in the afternoon' },
          { icon: '🍽', fr: 'Dîner côté Sultanahmet — tout est halal, voir nos adresses les mieux notées plus bas', en: 'Dinner around Sultanahmet — everything is halal; see our top-rated listings below' },
        ],
      },
      {
        titre: 'Jour 2 — Bazars, Süleymaniye et Corne d\'Or',
        titreEn: 'Day 2 — Bazaars, Süleymaniye and the Golden Horn',
        etapes: [
          { icon: '🛍', fr: 'Grand Bazar le matin, puis Bazar égyptien (aux épices) vers Eminönü', en: 'Grand Bazaar in the morning, then the Spice Bazaar down at Eminönü' },
          { icon: '🕌', fr: 'Prière de dhuhr à la Süleymaniye — la plus belle vue sur la Corne d\'Or', en: 'Dhuhr prayer at Süleymaniye Mosque — the best view over the Golden Horn' },
          { icon: '⛴', fr: 'Traversée en ferry vers Üsküdar (rive asiatique) au coucher du soleil', en: 'Ferry across to Üsküdar (Asian side) at sunset' },
        ],
      },
      {
        titre: 'Jour 3 — Balat, Eyüp et le Bosphore',
        titreEn: 'Day 3 — Balat, Eyüp and the Bosphorus',
        etapes: [
          { icon: '📸', fr: 'Ruelles colorées de Balat et Fener le matin', en: 'The colorful lanes of Balat and Fener in the morning' },
          { icon: '🕌', fr: 'Mosquée Eyüp Sultan puis téléphérique vers le café Pierre Loti (vue Corne d\'Or)', en: 'Eyüp Sultan Mosque, then the cable car up to Pierre Loti hill (Golden Horn view)' },
          { icon: '🚢', fr: 'Croisière sur le Bosphore en fin de journée — comptez 1 h 30 à 2 h', en: 'Bosphorus cruise late afternoon — allow 1.5 to 2 hours' },
        ],
      },
    ],
  },
  marrakech: {
    avis:
      "Marrakech est une valeur sûre du voyage halal : ville musulmane, cuisine halal partout, mosquées à chaque coin de médina. Le choix clé, c'est l'hébergement : un riad DANS la médina pour l'immersion (mais ruelles bruyantes et arrivée à pied), ou Guéliz/Hivernage pour le calme et les taxis faciles. Attendez-vous à la négociation dans les souks et à beaucoup de sollicitations autour de Jemaa el-Fna — un « la choukran » ferme et souriant suffit. L'hiver, les soirées sont fraîches ; l'été, visez les visites tôt le matin.",
    avisEn:
      "Marrakech is a safe bet for halal travel: a Muslim city, halal food everywhere, mosques at every corner of the medina. The key decision is where to stay: a riad INSIDE the medina for immersion (but noisy lanes and arrival on foot), or Guéliz/Hivernage for calm and easy taxis. Expect bargaining in the souks and persistent touts around Jemaa el-Fna — a firm, smiling « la shukran » does the job. Winter evenings are chilly; in summer, sightsee early morning.",
    jours: [
      {
        titre: 'Jour 1 — La médina et Jemaa el-Fna',
        titreEn: 'Day 1 — The medina and Jemaa el-Fna',
        etapes: [
          { icon: '🕌', fr: 'Koutoubia (extérieur + jardins), le minaret-repère de la ville — priez dans la mosquée', en: 'Koutoubia (exterior + gardens), the city\'s landmark minaret — pray inside the mosque' },
          { icon: '🛍', fr: 'Souks au fil des ruelles : tanneurs, dinandiers, tapis — négociez tranquillement', en: 'Wander the souks: tanners, coppersmiths, carpets — bargain calmly' },
          { icon: '🌙', fr: 'Jemaa el-Fna à la tombée de la nuit pour l\'ambiance (gardez vos affaires près de vous)', en: 'Jemaa el-Fna at nightfall for the atmosphere (keep your belongings close)' },
        ],
      },
      {
        titre: 'Jour 2 — Palais, medersa et jardins',
        titreEn: 'Day 2 — Palaces, madrasa and gardens',
        etapes: [
          { icon: '🏛', fr: 'Medersa Ben Youssef et palais Bahia le matin (billets sur place)', en: 'Ben Youssef Madrasa and Bahia Palace in the morning (tickets on site)' },
          { icon: '🌿', fr: 'Jardin Majorelle côté Guéliz l\'après-midi — réservez en ligne pour éviter la file', en: 'Majorelle Garden in Guéliz in the afternoon — book online to skip the queue' },
          { icon: '🍽', fr: 'Dîner tajine/couscous — voir nos adresses sourcées plus bas', en: 'Tagine/couscous dinner — see our sourced listings below' },
        ],
      },
      {
        titre: 'Jour 3 — Respiration hors médina',
        titreEn: 'Day 3 — A breather outside the medina',
        etapes: [
          { icon: '🏜', fr: 'Excursion à la journée : vallée de l\'Ourika ou désert d\'Agafay (réservez la veille)', en: 'Day trip: Ourika Valley or the Agafay desert (book the day before)' },
          { icon: '☕', fr: 'Retour en fin de journée : thé à la menthe en terrasse avec vue Koutoubia', en: 'Back late afternoon: mint tea on a terrace with a Koutoubia view' },
        ],
      },
    ],
  },
  dubai: {
    avis:
      "Dubaï est le confort halal absolu : mosquées dans chaque quartier, restauration halal quasi générale, salles de prière dans les malls et à l'aéroport. C'est aussi une ville chère et très étendue — le métro est propre et efficace sur l'axe principal, mais prévoyez des taxis/VTC ailleurs. Logez vers Downtown/Business Bay pour Burj Khalifa et Dubai Mall, ou à Deira/Bur Dubai pour l'ancien Dubaï et les budgets plus doux. De novembre à mars la météo est idéale ; l'été, vivez tôt le matin et le soir.",
    avisEn:
      "Dubai is peak halal comfort: mosques in every district, halal dining almost everywhere, prayer rooms in malls and at the airport. It's also expensive and very spread out — the metro is clean and efficient along the main axis, but plan taxis/ride-hailing elsewhere. Stay around Downtown/Business Bay for Burj Khalifa and Dubai Mall, or Deira/Bur Dubai for old Dubai and gentler budgets. November to March is ideal weather; in summer, live early mornings and evenings.",
    jours: [
      {
        titre: 'Jour 1 — Downtown et Dubai Mall',
        titreEn: 'Day 1 — Downtown and Dubai Mall',
        etapes: [
          { icon: '🏙', fr: 'Burj Khalifa (réservez le créneau coucher de soleil à l\'avance)', en: 'Burj Khalifa (book the sunset slot in advance)' },
          { icon: '⛲', fr: 'Dubai Fountain le soir — spectacles toutes les 30 min ; salles de prière dans le mall', en: 'Dubai Fountain in the evening — shows every 30 min; prayer rooms inside the mall' },
        ],
      },
      {
        titre: 'Jour 2 — Le vieux Dubaï',
        titreEn: 'Day 2 — Old Dubai',
        etapes: [
          { icon: '🛶', fr: 'Quartier historique Al Fahidi, traversée de la Creek en abra (bateau traditionnel)', en: 'Al Fahidi historic district, cross the Creek by abra (traditional boat)' },
          { icon: '🛍', fr: 'Souks de l\'or et des épices à Deira', en: 'Gold and spice souks in Deira' },
          { icon: '🕌', fr: 'Mosquée de Jumeirah (visites guidées ouvertes aux non-musulmans, prière possible)', en: 'Jumeirah Mosque (guided visits open to all, prayer possible)' },
        ],
      },
      {
        titre: 'Jour 3 — Marina ou désert',
        titreEn: 'Day 3 — Marina or the desert',
        etapes: [
          { icon: '🏖', fr: 'Dubai Marina et JBR (plage publique) — ou Palm Jumeirah', en: 'Dubai Marina and JBR public beach — or Palm Jumeirah' },
          { icon: '🏜', fr: 'Safari désert en fin de journée : dunes, coucher de soleil, dîner (option halal standard)', en: 'Desert safari late afternoon: dunes, sunset, dinner (halal is the standard option)' },
        ],
      },
    ],
  },
  'kuala-lumpur': {
    avis:
      "Kuala Lumpur est l'une des capitales les plus accueillantes d'Asie pour un musulman : certification halal officielle (JAKIM) très répandue, mosquées partout, salles de prière dans chaque mall. La ville se vit entre les malls climatisés, les tours Petronas et les quartiers de street-food. Logez vers KLCC ou Bukit Bintang pour tout faire à pied/métro. La chaleur humide fatigue : alternez visites matinales et pauses climatisées, et gardez les rooftops pour la nuit.",
    avisEn:
      "Kuala Lumpur is one of Asia's most welcoming capitals for Muslims: official halal certification (JAKIM) is widespread, mosques are everywhere, and every mall has prayer rooms. The city flows between air-conditioned malls, the Petronas Towers and street-food districts. Stay around KLCC or Bukit Bintang to do everything on foot/metro. The humid heat is tiring: alternate morning sightseeing with AC breaks, and save rooftops for night.",
    jours: [
      {
        titre: 'Jour 1 — KLCC et le centre',
        titreEn: 'Day 1 — KLCC and the center',
        etapes: [
          { icon: '🏙', fr: 'Tours Petronas (passerelle + observatoire — réservez en ligne) et parc KLCC', en: 'Petronas Towers (skybridge + observation deck — book online) and KLCC park' },
          { icon: '🕌', fr: 'Mosquée As-Syakirin dans le parc KLCC pour les prières de la journée', en: 'As-Syakirin Mosque in KLCC park for the day\'s prayers' },
          { icon: '🍜', fr: 'Soir street-food à Bukit Bintang (Jalan Alor : vérifiez les enseignes halal, très nombreuses)', en: 'Street-food evening in Bukit Bintang (Jalan Alor: check for halal signs, they are plentiful)' },
        ],
      },
      {
        titre: 'Jour 2 — Mosquées et vieux centre',
        titreEn: 'Day 2 — Mosques and the old center',
        etapes: [
          { icon: '🕌', fr: 'Masjid Negara (mosquée nationale) puis Masjid Jamek au confluent des rivières', en: 'Masjid Negara (National Mosque) then Masjid Jamek at the river confluence' },
          { icon: '🏛', fr: 'Place Merdeka et musée d\'art islamique (l\'un des plus beaux d\'Asie)', en: 'Merdeka Square and the Islamic Arts Museum (one of Asia\'s finest)' },
        ],
      },
      {
        titre: 'Jour 3 — Batu Caves et détente',
        titreEn: 'Day 3 — Batu Caves and downtime',
        etapes: [
          { icon: '⛰', fr: 'Batu Caves tôt le matin (site religieux hindou : tenue couvrante, visite respectueuse)', en: 'Batu Caves early morning (a Hindu religious site: dress modestly, visit respectfully)' },
          { icon: '🛍', fr: 'Après-midi malls (Pavilion, Suria KLCC) — salles de prière à chaque étage repérées', en: 'Mall afternoon (Pavilion, Suria KLCC) — prayer rooms clearly signposted' },
        ],
      },
    ],
  },
  'le-caire': {
    avis:
      "Le Caire est intense : circulation, bruit, foule — mais c'est une capitale musulmane majeure où prier et manger halal ne demandent aucun effort, et le patrimoine islamique y est parmi les plus riches du monde. Logez vers Zamalek (île calme) ou Downtown pour être central ; Guizeh seulement si vous privilégiez les pyramides à l'aube. Négociez les taxis ou utilisez les VTC, et acceptez un rythme plus lent que prévu : c'est la règle du Caire.",
    avisEn:
      "Cairo is intense: traffic, noise, crowds — but it's a major Muslim capital where praying and eating halal take zero effort, and its Islamic heritage is among the world's richest. Stay in Zamalek (a calm island) or Downtown to be central; Giza only if dawn pyramids are your priority. Negotiate taxis or use ride-hailing, and accept a slower pace than planned: that's Cairo's rule.",
    jours: [
      {
        titre: 'Jour 1 — Les pyramides de Guizeh',
        titreEn: 'Day 1 — The Pyramids of Giza',
        etapes: [
          { icon: '🐫', fr: 'Plateau de Guizeh à l\'ouverture (chaleur et foule ensuite), Sphinx compris', en: 'Giza plateau at opening (heat and crowds later), Sphinx included' },
          { icon: '🏛', fr: 'Grand Musée égyptien (GEM) l\'après-midi', en: 'Grand Egyptian Museum (GEM) in the afternoon' },
        ],
      },
      {
        titre: 'Jour 2 — Le Caire islamique',
        titreEn: 'Day 2 — Islamic Cairo',
        etapes: [
          { icon: '🕌', fr: 'Mosquée al-Azhar puis la rue al-Muizz : madrasas, sabils et palais mamelouks', en: 'Al-Azhar Mosque then al-Muizz street: madrasas, sabils and Mamluk palaces' },
          { icon: '🛍', fr: 'Souk Khan el-Khalili (thé au café Fishawi)', en: 'Khan el-Khalili bazaar (tea at Fishawi café)' },
          { icon: '🕌', fr: 'Citadelle de Saladin et mosquée de Muhammad Ali au coucher du soleil', en: 'Saladin Citadel and the Muhammad Ali Mosque at sunset' },
        ],
      },
      {
        titre: 'Jour 3 — Nil et respiration',
        titreEn: 'Day 3 — The Nile and a breather',
        etapes: [
          { icon: '⛵', fr: 'Felouque sur le Nil en fin d\'après-midi depuis la corniche', en: 'Felucca ride on the Nile late afternoon from the corniche' },
          { icon: '🕌', fr: 'Mosquée Ibn Touloun (IXe siècle, l\'une des plus anciennes et des plus paisibles)', en: 'Ibn Tulun Mosque (9th century, one of the oldest and most peaceful)' },
        ],
      },
    ],
  },
  casablanca: {
    avis:
      "Casablanca n'est pas une ville-musée : c'est la métropole économique du Maroc, et on y vient surtout pour la mosquée Hassan II — l'une des plus grandes du monde, posée sur l'océan. Une journée pleine suffit souvent avant de filer vers Rabat, Fès ou Marrakech en train (gare Casa-Voyageurs). Logez vers le centre (Gauthier/Racine) ou la corniche d'Aïn Diab. Tout est halal par défaut ; l'ambiance est plus business que touristique, et c'est aussi son charme.",
    avisEn:
      "Casablanca is not a museum city: it's Morocco's business capital, and the main reason to come is the Hassan II Mosque — one of the largest in the world, set over the ocean. One full day is often enough before taking the train on to Rabat, Fez or Marrakech (Casa-Voyageurs station). Stay around the center (Gauthier/Racine) or the Aïn Diab corniche. Everything is halal by default; the vibe is more business than touristy — that's part of its charm.",
    jours: [
      {
        titre: 'Jour 1 — Hassan II et le centre',
        titreEn: 'Day 1 — Hassan II and the center',
        etapes: [
          { icon: '🕌', fr: 'Mosquée Hassan II le matin : prière + visite guidée de l\'intérieur (horaires dédiés)', en: 'Hassan II Mosque in the morning: prayer + guided interior visit (set time slots)' },
          { icon: '🏛', fr: 'Centre-ville art déco et ancienne médina l\'après-midi', en: 'Art-deco downtown and the old medina in the afternoon' },
          { icon: '🌊', fr: 'Corniche d\'Aïn Diab au coucher du soleil', en: 'Aïn Diab corniche at sunset' },
        ],
      },
      {
        titre: 'Jour 2 — Marché central et départ',
        titreEn: 'Day 2 — Central market and onward',
        etapes: [
          { icon: '🐟', fr: 'Marché central le matin (poisson grillé sur place — halal et fameux)', en: 'Central market in the morning (grilled fish on the spot — halal and famous)' },
          { icon: '🚄', fr: 'Train vers Rabat (1 h) ou Marrakech (2 h 40) l\'après-midi', en: 'Train to Rabat (1 h) or Marrakech (2 h 40) in the afternoon' },
        ],
      },
    ],
  },
  londres: {
    avis:
      "Londres est l'une des capitales occidentales les plus simples pour un musulman : des centaines de restaurants halal signalés (Edgware Road, Whitechapel, Brick Lane…), de grandes mosquées (London Central Mosque à Regent's Park, East London Mosque), et des salles de prière dans plusieurs grands magasins. Le métro rend tout accessible mais le budget grimpe vite — réservez l'hébergement tôt et mangez halal sans effort dans les quartiers cités. Vérifiez le label halal affiché par chaque enseigne : c'est la norme locale, pas une exception.",
    avisEn:
      "London is one of the easiest Western capitals for Muslims: hundreds of reported halal restaurants (Edgware Road, Whitechapel, Brick Lane…), major mosques (London Central Mosque at Regent's Park, East London Mosque), and prayer rooms in several department stores. The Tube makes everything reachable but budgets climb fast — book accommodation early and eat halal effortlessly in the districts above. Check the halal signage each place displays: here it's the norm, not the exception.",
    jours: [
      {
        titre: 'Jour 1 — Westminster et les classiques',
        titreEn: 'Day 1 — Westminster and the classics',
        etapes: [
          { icon: '🏛', fr: 'Big Ben, Westminster, relève de la garde à Buckingham', en: 'Big Ben, Westminster, Changing of the Guard at Buckingham' },
          { icon: '🕌', fr: 'Prière à la London Central Mosque (Regent\'s Park), balade dans le parc', en: 'Prayer at the London Central Mosque (Regent\'s Park), stroll in the park' },
          { icon: '🍽', fr: 'Dîner halal sur Edgware Road (libanais, tout proche)', en: 'Halal dinner on Edgware Road (Lebanese, right nearby)' },
        ],
      },
      {
        titre: 'Jour 2 — City, Tower et l\'Est',
        titreEn: 'Day 2 — The City, the Tower and the East',
        etapes: [
          { icon: '🏰', fr: 'Tour de Londres et Tower Bridge le matin', en: 'Tower of London and Tower Bridge in the morning' },
          { icon: '🕌', fr: 'East London Mosque à Whitechapel, puis curry halal sur Brick Lane', en: 'East London Mosque in Whitechapel, then halal curry on Brick Lane' },
        ],
      },
      {
        titre: 'Jour 3 — Musées et marchés',
        titreEn: 'Day 3 — Museums and markets',
        etapes: [
          { icon: '🏛', fr: 'British Museum ou Natural History Museum (gratuits)', en: 'British Museum or Natural History Museum (free)' },
          { icon: '🛍', fr: 'Oxford Street / Knightsbridge — salle de prière chez Harrods', en: 'Oxford Street / Knightsbridge — prayer room at Harrods' },
        ],
      },
    ],
  },
  antalya: {
    avis:
      "Antalya est LA destination balnéaire halal-friendly par excellence : ville turque (tout est halal par défaut), vieille ville ottomane charmante (Kaleiçi), et surtout la plus grande concentration au monde d'hôtels avec piscines non mixtes et plages privées femmes — vérifiés via HalalBooking dans notre onglet Hôtels. Logez à Kaleiçi pour le charme, à Lara pour les resorts. Juin à septembre pour la plage ; le printemps et l'automne pour visiter sans la fournaise.",
    avisEn:
      "Antalya is THE halal-friendly beach destination: a Turkish city (everything halal by default), a charming Ottoman old town (Kaleiçi), and above all the world's largest concentration of hotels with ladies-only pools and private women's beaches — verified via HalalBooking in our Hotels tab. Stay in Kaleiçi for charm, Lara for resorts. June to September for the beach; spring and autumn to sightsee without the furnace.",
    jours: [
      {
        titre: 'Jour 1 — Kaleiçi, la vieille ville',
        titreEn: 'Day 1 — Kaleiçi, the old town',
        etapes: [
          { icon: '🏛', fr: 'Porte d\'Hadrien, ruelles ottomanes, vieux port', en: 'Hadrian\'s Gate, Ottoman lanes, the old harbor' },
          { icon: '🕌', fr: 'Minaret cannelé (Yivli Minare), symbole de la ville', en: 'The Fluted Minaret (Yivli Minare), the city\'s symbol' },
          { icon: '🌅', fr: 'Coucher de soleil depuis les falaises du parc Karaalioğlu', en: 'Sunset from the cliffs of Karaalioğlu Park' },
        ],
      },
      {
        titre: 'Jour 2 — Cascades et plages',
        titreEn: 'Day 2 — Waterfalls and beaches',
        etapes: [
          { icon: '💦', fr: 'Cascades de Düden (celles qui tombent dans la mer, côté Lara)', en: 'Düden waterfalls (the ones dropping into the sea, Lara side)' },
          { icon: '🏖', fr: 'Plage de Konyaaltı ou Lara — ou votre resort à plage privée femmes (voir onglet Hôtels)', en: 'Konyaaltı or Lara beach — or your resort with a private ladies\' beach (see Hotels tab)' },
        ],
      },
      {
        titre: 'Jour 3 — Ruines antiques',
        titreEn: 'Day 3 — Ancient ruins',
        etapes: [
          { icon: '🏛', fr: 'Excursion : théâtre d\'Aspendos et ruines de Pergé (une demi-journée suffit)', en: 'Day trip: Aspendos theater and the ruins of Perge (half a day is enough)' },
        ],
      },
    ],
  },
  paris: {
    avis:
      "Paris se visite très bien en tant que musulman avec un peu d'organisation : l'offre halal signalée est immense (Belleville, Barbès, le 11e…), la Grande Mosquée de Paris (5e) est un havre avec son salon de thé, et les distances se font en métro. Logez central (quartiers 1er-11e) pour limiter les trajets. Deux réflexes : vérifiez l'affichage halal de chaque restaurant (l'offre varie beaucoup d'une rue à l'autre), et réservez musées et Tour Eiffel en ligne pour éviter des heures de file.",
    avisEn:
      "Paris works very well for Muslim travelers with a bit of planning: the reported-halal scene is huge (Belleville, Barbès, the 11th arrondissement…), the Grande Mosquée de Paris (5th) is a haven with its tea room, and the metro covers all distances. Stay central (1st–11th) to limit transit. Two reflexes: check each restaurant's halal signage (the offer varies street by street), and book museums and the Eiffel Tower online to skip hours of queueing.",
    jours: [
      {
        titre: 'Jour 1 — Les icônes',
        titreEn: 'Day 1 — The icons',
        etapes: [
          { icon: '🗼', fr: 'Tour Eiffel le matin (billet coupe-file réservé), Trocadéro pour la photo', en: 'Eiffel Tower in the morning (skip-the-line ticket), Trocadéro for the photo' },
          { icon: '🚶', fr: 'Champs-Élysées et Arc de Triomphe l\'après-midi', en: 'Champs-Élysées and Arc de Triomphe in the afternoon' },
          { icon: '🍽', fr: 'Dîner halal dans le 11e ou vers Belleville — voir nos adresses plus bas', en: 'Halal dinner in the 11th or around Belleville — see our listings below' },
        ],
      },
      {
        titre: 'Jour 2 — Louvre et Grande Mosquée',
        titreEn: 'Day 2 — The Louvre and the Grand Mosque',
        etapes: [
          { icon: '🏛', fr: 'Louvre à l\'ouverture (réservez un créneau) — 3 h suffisent pour l\'essentiel', en: 'Louvre at opening (book a slot) — 3 hours covers the essentials' },
          { icon: '🕌', fr: 'Grande Mosquée de Paris : prière, jardins, thé à la menthe et pâtisseries', en: 'Grande Mosquée de Paris: prayer, gardens, mint tea and pastries' },
          { icon: '🌿', fr: 'Jardin des Plantes juste à côté, puis quais de Seine', en: 'Jardin des Plantes right next door, then the Seine banks' },
        ],
      },
      {
        titre: 'Jour 3 — Montmartre et flânerie',
        titreEn: 'Day 3 — Montmartre and wandering',
        etapes: [
          { icon: '⛪', fr: 'Butte Montmartre le matin (vue sur tout Paris depuis le parvis)', en: 'Montmartre hill in the morning (view over all Paris from the steps)' },
          { icon: '🛍', fr: 'Grands magasins boulevard Haussmann ou Marais l\'après-midi', en: 'Department stores on boulevard Haussmann or the Marais in the afternoon' },
        ],
      },
    ],
  },
}

export function getCityGuide(slug?: string): CityGuide | null {
  if (!slug) return null
  return CITY_GUIDES[slug] ?? null
}
