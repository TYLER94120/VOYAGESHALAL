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
export interface GuideConseil { icon: string; titre: string; titreEn: string; fr: string; en: string }
export interface CityGuide { hook: string; hookEn: string; chips: GuideChip[]; jours: GuideJour[]; conseils?: GuideConseil[] }

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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Sultanahmet pour tout faire à pied, Eminönü/Sirkeci pour le Bazar et les ferries.", en: "Sultanahmet to walk everywhere, Eminönü/Sirkeci for the Bazaar and ferries." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Ville abordable pour l'Europe : comptez 40-80 €/jour hors hôtel, repas complets dès 5-10 €.", en: "Affordable for Europe: plan 40–80 €/day excl. hotel; full meals from 5–10 €." },
      { icon: "🚋", titre: "Se déplacer", titreEn: "Getting around", fr: "Istanbulkart (carte rechargeable) pour tram, métro et ferries — le tram T1 dessert les grands sites.", en: "Get an Istanbulkart for tram, metro and ferries — the T1 tram covers the main sites." },
      { icon: "🧕", titre: "Tenue", titreEn: "Dress code", fr: "Tenue libre en ville ; épaules et jambes couvertes pour les mosquées (foulard prêté à l'entrée).", en: "Dress freely in town; cover shoulders and legs in mosques (headscarves lent at the door)." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Destination très fréquentée par les voyageuses musulmanes ; évitez les ruelles désertes tard le soir, comme partout.", en: "Very popular with Muslim women travelers; avoid deserted lanes late at night, as anywhere." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Avril-juin et septembre-octobre : doux et moins de foule. L'été est chaud et bondé.", en: "April–June and September–October: mild and less crowded. Summer is hot and packed." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Riad dans la médina pour l'immersion (arrivée à pied), Guéliz/Hivernage pour le calme et les taxis.", en: "A medina riad for immersion (arrival on foot), Guéliz/Hivernage for calm and taxis." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Très doux : repas copieux 3-8 €, riads corrects dès 30-50 €/nuit.", en: "Very gentle: hearty meals 3–8 €, decent riads from 30–50 €/night." },
      { icon: "🚕", titre: "Se déplacer", titreEn: "Getting around", fr: "Petits taxis au compteur (exigez-le) ou course négociée AVANT de monter ; la médina se fait à pied.", en: "Petit taxis with the meter (insist) or a price agreed BEFORE boarding; the medina is walked." },
      { icon: "🤝", titre: "Souks", titreEn: "Souks", fr: "La négociation fait partie du jeu : souriez, divisez le premier prix par deux ou trois, sans jamais vous fâcher.", en: "Bargaining is part of the game: smile, halve or third the first price, never get angry." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Faisable et fréquent ; les sollicitations sont verbales surtout autour de Jemaa el-Fna — un « la choukran » ferme suffit.", en: "Doable and common; hassle is verbal, mostly around Jemaa el-Fna — a firm « la shukran » does it." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Mars-mai et octobre-novembre. L'été dépasse 40 °C : visites tôt le matin uniquement.", en: "March–May and October–November. Summer tops 40 °C: sightsee early morning only." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Downtown/Business Bay pour Burj Khalifa à pied, Deira/Bur Dubai pour les budgets plus doux et le vieux Dubaï.", en: "Downtown/Business Bay to walk to Burj Khalifa, Deira/Bur Dubai for gentler budgets and old Dubai." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Ville chère : 100-200 €/jour se dépensent vite. Les cafétérias de quartier (Deira, Karama) nourrissent bien pour 5-10 €.", en: "Expensive city: 100–200 €/day goes fast. Neighborhood cafeterias (Deira, Karama) feed you well for 5–10 €." },
      { icon: "🚇", titre: "Se déplacer", titreEn: "Getting around", fr: "Métro propre et ponctuel sur l'axe principal (carte Nol) ; VTC/taxis partout ailleurs — les distances sont énormes.", en: "Clean, punctual metro on the main axis (Nol card); ride-hailing everywhere else — distances are huge." },
      { icon: "🧕", titre: "Tenue", titreEn: "Dress code", fr: "Décontractée mais épaules/genoux couverts dans les malls et lieux publics ; maillot uniquement plage et piscine.", en: "Casual but shoulders/knees covered in malls and public places; swimwear only at beach and pool." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "L'une des villes les plus sûres au monde, métro avec voitures réservées femmes et enfants.", en: "One of the world's safest cities; the metro has women-and-children cars." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Novembre à mars. De juin à septembre, 45 °C : tout se vit en intérieur climatisé.", en: "November to March. June to September hits 45 °C: life moves indoors." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "KLCC pour les tours et le parc, Bukit Bintang pour manger et sortir — les deux sont reliés par une passerelle climatisée.", en: "KLCC for the towers and park, Bukit Bintang for food — linked by an air-conditioned walkway." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Excellent rapport qualité-prix : street-food 2-4 €, très bons hôtels dès 40-70 €.", en: "Excellent value: street-food 2–4 €, very good hotels from 40–70 €." },
      { icon: "🚝", titre: "Se déplacer", titreEn: "Getting around", fr: "LRT/MRT + Grab (VTC local, très bon marché) ; évitez les taxis sans compteur.", en: "LRT/MRT + Grab (local ride-hailing, very cheap); avoid meterless taxis." },
      { icon: "✅", titre: "Halal", titreEn: "Halal", fr: "Cherchez le logo JAKIM officiel — l'immense majorité des enseignes l'affiche, y compris les chaînes.", en: "Look for the official JAKIM logo — the vast majority of places display it, chains included." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Très sûre ; wagons femmes sur certaines lignes aux heures de pointe.", en: "Very safe; women-only cars on some lines at rush hour." },
      { icon: "🌧", titre: "Météo", titreEn: "Weather", fr: "Chaud et humide toute l'année avec averses quotidiennes brèves — parapluie toujours dans le sac.", en: "Hot and humid year-round with brief daily downpours — keep an umbrella in the bag." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Zamalek (île calme et verte) ou Downtown pour être central ; Guizeh seulement pour les pyramides à l'aube.", en: "Zamalek (calm, leafy island) or Downtown to be central; Giza only for dawn pyramids." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Très abordable : repas locaux 1-4 €, taxis/VTC quelques euros la course.", en: "Very affordable: local meals 1–4 €, taxi/ride-hailing rides a few euros." },
      { icon: "🚕", titre: "Se déplacer", titreEn: "Getting around", fr: "VTC (Uber/Careem) pour éviter toute négociation ; le métro est efficace avec voitures réservées femmes.", en: "Ride-hailing (Uber/Careem) to skip all haggling; the metro works well and has women-only cars." },
      { icon: "🤝", titre: "Pourboires", titreEn: "Tipping", fr: "Le bakchich est culturel : gardez de la petite monnaie pour gardiens, guides et services rendus.", en: "Baksheesh is cultural: keep small change for keepers, guides and small services." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Préférez les VTC le soir et une tenue couvrante ; le harcèlement verbal existe, restez dans les zones animées.", en: "Prefer ride-hailing at night and covering clothing; verbal harassment exists, stay in busy areas." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Octobre à avril. L'été est écrasant sur les sites découverts.", en: "October to April. Summer is crushing on open-air sites." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Centre-ville (Gauthier/Racine) pour tout faire facilement, corniche d'Aïn Diab pour l'océan.", en: "Downtown (Gauthier/Racine) for convenience, the Aïn Diab corniche for the ocean." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Repas 3-8 €, hôtels corrects dès 40 € ; la visite guidée de Hassan II se réserve sur place.", en: "Meals 3–8 €, decent hotels from 40 €; the Hassan II guided tour is booked on site." },
      { icon: "🚄", titre: "Se déplacer", titreEn: "Getting around", fr: "Petits taxis rouges au compteur en ville ; trains fréquents et fiables vers Rabat, Fès et Marrakech depuis Casa-Voyageurs.", en: "Red petit taxis on the meter in town; frequent, reliable trains to Rabat, Fez and Marrakech from Casa-Voyageurs." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Grande ville d'affaires plutôt tranquille ; les précautions urbaines habituelles suffisent.", en: "A business city, rather calm; usual urban precautions are enough." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Climat océanique doux toute l'année — avril-juin et septembre-octobre sont parfaits.", en: "Mild oceanic climate all year — April–June and September–October are perfect." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Près d'une station de métro zone 1-2 ; Paddington/Edgware Road combine centralité et restos halal en bas de l'hôtel.", en: "Near a Zone 1–2 Tube stop; Paddington/Edgware Road pairs centrality with halal food downstairs." },
      { icon: "💷", titre: "Budget", titreEn: "Budget", fr: "Ville chère : 120-200 €/jour vite atteints. Les musées majeurs sont gratuits, ça compense.", en: "Expensive: 120–200 €/day adds up fast. Major museums are free, which helps." },
      { icon: "🚇", titre: "Se déplacer", titreEn: "Getting around", fr: "Payez le métro et le bus directement en carte bancaire sans contact — plafond journalier automatique.", en: "Pay Tube and bus by contactless bank card — the daily cap applies automatically." },
      { icon: "🍽", titre: "Halal", titreEn: "Halal", fr: "L'affichage halal est la norme dans des quartiers entiers (Whitechapel, Edgware Road) — vérifiez l'enseigne, pas le quartier.", en: "Halal signage is the norm in whole districts (Whitechapel, Edgware Road) — check the shop, not the area." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Très habituée aux voyageuses ; transports sûrs, restez attentive à vos affaires dans les zones touristiques.", en: "Very used to women travelers; transit is safe, watch your belongings in tourist areas." },
      { icon: "🌦", titre: "Météo", titreEn: "Weather", fr: "Changeante toute l'année : superposez les couches et gardez un imperméable léger.", en: "Changeable year-round: layer up and keep a light raincoat." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Kaleiçi pour le charme ottoman, Lara pour les grands resorts — dont ceux à piscine et plage femmes (onglet Hôtels).", en: "Kaleiçi for Ottoman charm, Lara for big resorts — including ladies-pool/beach ones (Hotels tab)." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Repas 4-10 €, resorts tout-compris très compétitifs hors juillet-août.", en: "Meals 4–10 €; all-inclusive resorts very competitive outside July–August." },
      { icon: "🚌", titre: "Se déplacer", titreEn: "Getting around", fr: "Tram et bus AntalyaKart en ville ; navettes/transferts d'hôtel pour Lara et Belek.", en: "AntalyaKart tram and buses in town; hotel shuttles for Lara and Belek." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Station balnéaire familiale et tranquille, très habituée aux voyageuses musulmanes.", en: "A family seaside city, calm and very used to Muslim women travelers." },
      { icon: "🌡", titre: "Quand venir", titreEn: "When to come", fr: "Mai-juin et septembre : mer chaude sans la fournaise de juillet-août.", en: "May–June and September: warm sea without the July–August furnace." },
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
    conseils: [
      { icon: "🏨", titre: "Où loger", titreEn: "Where to stay", fr: "Central (1er-11e) pour limiter le métro ; le 11e met Belleville et la Bastille à pied.", en: "Stay central (1st–11th) to limit metro time; the 11th puts Belleville and Bastille on foot." },
      { icon: "💶", titre: "Budget", titreEn: "Budget", fr: "Comptez 100-180 €/jour. Les restos halal des quartiers (11e, Belleville, Barbès) cassent les prix du centre.", en: "Plan 100–180 €/day. Halal spots in the 11th, Belleville and Barbès undercut center prices." },
      { icon: "🚇", titre: "Se déplacer", titreEn: "Getting around", fr: "Passe Navigo Easy ou billets t+ ; tout se fait en métro, évitez la voiture.", en: "Navigo Easy pass or t+ tickets; everything works by metro, skip the car." },
      { icon: "🎟", titre: "Réservations", titreEn: "Bookings", fr: "Tour Eiffel, Louvre et Orsay : créneaux en ligne obligatoires en saison, sinon des heures de file.", en: "Eiffel Tower, Louvre, Orsay: online time slots are a must in season, or hours of queueing." },
      { icon: "👩", titre: "Femme seule", titreEn: "Solo women", fr: "Transports sûrs aux heures actives ; attention pickpockets dans le métro et sous la Tour Eiffel.", en: "Transit is safe at busy hours; mind pickpockets in the metro and under the Eiffel Tower." },
      { icon: "🌦", titre: "Quand venir", titreEn: "When to come", fr: "Mai-juin et septembre : lumière superbe, terrasses agréables, moins de foule qu'en été.", en: "May–June and September: superb light, pleasant terraces, fewer crowds than summer." },
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
