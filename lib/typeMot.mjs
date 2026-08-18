// 🏷️ LE TYPE EN UN SEUL MOT (itération 2, correction 3) : chaque ligne du
// tiroir commence par UN mot doré qui dit ce qu'est le lieu. La source est
// `primaryType` de Google (champ `famille` des fiches) — jamais une
// déduction depuis le nom. Un type inconnu retombe sur le mot générique du
// mode : générique mais vrai, plutôt que précis et deviné.
const MOTS = {
  mosque: ['Mosquée', 'Mosque'],
  hindu_temple: ['Temple', 'Temple'], church: ['Église', 'Church'], synagogue: ['Synagogue', 'Synagogue'],
  turkish_restaurant: ['Turc', 'Turkish'], lebanese_restaurant: ['Libanais', 'Lebanese'],
  moroccan_restaurant: ['Marocain', 'Moroccan'], indian_restaurant: ['Indien', 'Indian'],
  pakistani_restaurant: ['Pakistanais', 'Pakistani'], afghani_restaurant: ['Afghan', 'Afghan'],
  middle_eastern_restaurant: ['Oriental', 'Middle Eastern'], mediterranean_restaurant: ['Méditerranéen', 'Mediterranean'],
  african_restaurant: ['Africain', 'African'], ethiopian_restaurant: ['Éthiopien', 'Ethiopian'],
  indonesian_restaurant: ['Indonésien', 'Indonesian'], malaysian_restaurant: ['Malaisien', 'Malaysian'],
  thai_restaurant: ['Thaï', 'Thai'], vietnamese_restaurant: ['Vietnamien', 'Vietnamese'],
  chinese_restaurant: ['Chinois', 'Chinese'], japanese_restaurant: ['Japonais', 'Japanese'],
  korean_restaurant: ['Coréen', 'Korean'], brazilian_restaurant: ['Brésilien', 'Brazilian'],
  american_restaurant: ['Américain', 'American'], french_restaurant: ['Français', 'French'],
  italian_restaurant: ['Italien', 'Italian'], greek_restaurant: ['Grec', 'Greek'],
  pizza_restaurant: ['Pizza', 'Pizza'], hamburger_restaurant: ['Burger', 'Burger'],
  fast_food_restaurant: ['Rapide', 'Fast food'], sandwich_shop: ['Sandwichs', 'Sandwiches'],
  meal_takeaway: ['Traiteur', 'Takeaway'], meal_delivery: ['Livraison', 'Delivery'],
  bakery: ['Boulangerie', 'Bakery'], cafe: ['Café', 'Cafe'], coffee_shop: ['Café', 'Coffee'],
  dessert_shop: ['Desserts', 'Desserts'], ice_cream_shop: ['Glacier', 'Ice cream'],
  tea_house: ['Salon de thé', 'Tea house'], restaurant: ['Resto', 'Restaurant'],
  butcher_shop: ['Boucherie', 'Butcher'], grocery_store: ['Épicerie', 'Grocery'],
  supermarket: ['Supermarché', 'Supermarket'], market: ['Marché', 'Market'],
  park: ['Parc', 'Park'], national_park: ['Parc', 'Park'], garden: ['Jardin', 'Garden'],
  museum: ['Musée', 'Museum'], art_gallery: ['Galerie', 'Gallery'],
  swimming_pool: ['Piscine', 'Pool'], gym: ['Salle de sport', 'Gym'], spa: ['Hammam', 'Spa'],
  amusement_park: ['Parc d’attractions', 'Theme park'], zoo: ['Zoo', 'Zoo'],
  aquarium: ['Aquarium', 'Aquarium'], movie_theater: ['Cinéma', 'Cinema'],
  library: ['Bibliothèque', 'Library'], tourist_attraction: ['À voir', 'Sight'],
  shopping_mall: ['Centre commercial', 'Mall'], playground: ['Aire de jeux', 'Playground'],
  bowling_alley: ['Bowling', 'Bowling'], historical_landmark: ['Monument', 'Landmark'],
}
const DEFAUTS = { mosquee: ['Salle', 'Prayer room'], manger: ['Resto', 'Food'], activite: ['Lieu', 'Place'] }

/** Un mot pour un `primaryType` Google — ou le générique du mode. */
export function typeMot(famille, mode = 'manger', en = false) {
  const m = MOTS[famille]
  if (m) return m[en ? 1 : 0]
  const d = DEFAUTS[mode] ?? DEFAUTS.manger
  return d[en ? 1 : 0]
}
