// Quiz « Quelle destination halal pour toi ? » (P5) — base ÉDITORIALE.
// Caractérisations volontairement grossières (budget en 3 niveaux, durée de
// vol DEPUIS L'EUROPE, saisons conseillées) : ce sont des repères de guide de
// voyage, pas des données certifiées — le résultat renvoie vers la fiche
// ville où tout est détaillé et « à vérifier ».

export type QuizBudget = 1 | 2 | 3            // 1 = éco, 2 = moyen, 3 = confort
export type QuizCompagnie = 'famille' | 'couple' | 'solo' | 'amis'
export type QuizAmbiance = 'culture' | 'plage' | 'ville' | 'nature'
export type QuizVol = 'court' | 'moyen' | 'long' // depuis l'Europe : <3 h / 3-6 h / >6 h
export type QuizSaison = 'printemps' | 'ete' | 'automne' | 'hiver'

export interface QuizDest {
  slug: string
  nom: string
  nomEn?: string
  budget: QuizBudget
  compagnies: QuizCompagnie[]
  ambiances: QuizAmbiance[]
  vol: QuizVol
  saisons: QuizSaison[]
  atoutFr: string // une raison honnête, alignée sur nos guides
  atoutEn: string
}

export const QUIZ_DESTS: QuizDest[] = [
  { slug: 'istanbul', nom: 'Istanbul', budget: 2, compagnies: ['famille', 'couple', 'solo', 'amis'], ambiances: ['culture', 'ville'], vol: 'court', saisons: ['printemps', 'automne'], atoutFr: 'Mosquées majeures, quasi tout halal, vols directs fréquents', atoutEn: 'Major mosques, nearly everything halal, frequent direct flights' },
  { slug: 'marrakech', nom: 'Marrakech', budget: 1, compagnies: ['famille', 'couple', 'amis'], ambiances: ['culture', 'ville'], vol: 'court', saisons: ['printemps', 'automne', 'hiver'], atoutFr: 'Souks, riads, cuisine halal par défaut, petit budget possible', atoutEn: 'Souks, riads, halal food by default, budget-friendly' },
  { slug: 'agadir', nom: 'Agadir', budget: 1, compagnies: ['famille', 'couple'], ambiances: ['plage'], vol: 'court', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Plage + halal par défaut, idéal familles', atoutEn: 'Beach + halal by default, great for families' },
  { slug: 'antalya', nom: 'Antalya', budget: 2, compagnies: ['famille', 'couple'], ambiances: ['plage', 'nature'], vol: 'court', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Resorts avec espaces non mixtes signalés, mer turquoise', atoutEn: 'Resorts with reported ladies-only areas, turquoise sea' },
  { slug: 'cappadoce', nom: 'Cappadoce', budget: 2, compagnies: ['couple', 'amis'], ambiances: ['nature'], vol: 'moyen', saisons: ['printemps', 'automne'], atoutFr: 'Paysages uniques, montgolfières, Türkiye halal-friendly', atoutEn: 'Unique landscapes, hot-air balloons, halal-friendly Türkiye' },
  { slug: 'dubai', nom: 'Dubaï', budget: 3, compagnies: ['famille', 'couple'], ambiances: ['ville', 'plage'], vol: 'moyen', saisons: ['automne', 'hiver', 'printemps'], atoutFr: 'Infrastructure halal exemplaire, mosquées partout, plages', atoutEn: 'Outstanding halal infrastructure, mosques everywhere, beaches' },
  { slug: 'abu-dhabi', nom: 'Abu Dhabi', budget: 3, compagnies: ['famille', 'couple'], ambiances: ['ville', 'culture'], vol: 'moyen', saisons: ['automne', 'hiver'], atoutFr: 'Mosquée Cheikh Zayed, plus calme que Dubaï', atoutEn: 'Sheikh Zayed Mosque, calmer than Dubai' },
  { slug: 'doha', nom: 'Doha', budget: 3, compagnies: ['famille', 'couple'], ambiances: ['ville'], vol: 'moyen', saisons: ['hiver', 'automne'], atoutFr: 'Souq Waqif, musées, escale idéale', atoutEn: 'Souq Waqif, museums, ideal stopover' },
  { slug: 'kuala-lumpur', nom: 'Kuala Lumpur', budget: 1, compagnies: ['famille', 'solo', 'amis'], ambiances: ['ville', 'culture'], vol: 'long', saisons: ['printemps', 'ete', 'automne', 'hiver'], atoutFr: 'Labels JAKIM très répandus, street food halal, budget doux', atoutEn: 'Widespread JAKIM labels, halal street food, gentle budget' },
  { slug: 'singapour', nom: 'Singapour', budget: 3, compagnies: ['famille', 'couple'], ambiances: ['ville'], vol: 'long', saisons: ['printemps', 'ete', 'automne', 'hiver'], atoutFr: 'Labels MUIS fiables, propreté, quartier arabe', atoutEn: 'Reliable MUIS labels, cleanliness, Arab quarter' },
  { slug: 'bali', nom: 'Bali', budget: 2, compagnies: ['couple'], ambiances: ['plage', 'nature'], vol: 'long', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Nature spectaculaire ; restos halal à repérer (guide dédié)', atoutEn: 'Stunning nature; halal spots to plan ahead (see our guide)' },
  { slug: 'jakarta', nom: 'Jakarta', budget: 1, compagnies: ['solo', 'amis'], ambiances: ['ville'], vol: 'long', saisons: ['printemps', 'automne'], atoutFr: 'Plus grand pays musulman du monde, halal partout', atoutEn: 'World\'s largest Muslim country, halal everywhere' },
  { slug: 'bangkok', nom: 'Bangkok', budget: 1, compagnies: ['solo', 'amis'], ambiances: ['ville'], vol: 'long', saisons: ['hiver', 'automne'], atoutFr: 'Quartiers halal (CICOT), budget très doux', atoutEn: 'Halal districts (CICOT), very gentle budget' },
  { slug: 'tokyo', nom: 'Tokyo', budget: 3, compagnies: ['couple', 'solo'], ambiances: ['ville', 'culture'], vol: 'long', saisons: ['printemps', 'automne'], atoutFr: 'Dépaysement total ; réseau halal en croissance (voir guide Japon)', atoutEn: 'Total change of scenery; growing halal network (see Japan guide)' },
  { slug: 'le-caire', nom: 'Le Caire', budget: 1, compagnies: ['famille', 'amis'], ambiances: ['culture'], vol: 'moyen', saisons: ['automne', 'hiver', 'printemps'], atoutFr: 'Pyramides, Al-Azhar, koshari à 1-2 €', atoutEn: 'Pyramids, Al-Azhar, koshari for €1-2' },
  { slug: 'amman', nom: 'Amman', budget: 2, compagnies: ['famille', 'couple', 'solo'], ambiances: ['culture', 'nature'], vol: 'moyen', saisons: ['printemps', 'automne'], atoutFr: 'Petra + Wadi Rum, tout halal, très sûr', atoutEn: 'Petra + Wadi Rum, all halal, very safe' },
  { slug: 'tunis', nom: 'Tunis', budget: 1, compagnies: ['famille', 'couple'], ambiances: ['plage', 'culture'], vol: 'court', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Médina classée, plages, tout halal, petit budget', atoutEn: 'UNESCO medina, beaches, all halal, low budget' },
  { slug: 'fes', nom: 'Fès', budget: 1, compagnies: ['couple', 'solo'], ambiances: ['culture'], vol: 'court', saisons: ['printemps', 'automne'], atoutFr: 'Plus ancienne université du monde (Al Quaraouiyine), artisanat', atoutEn: 'World\'s oldest university (Al Quaraouiyine), crafts' },
  { slug: 'sarajevo', nom: 'Sarajevo', budget: 1, compagnies: ['solo', 'couple', 'amis'], ambiances: ['culture', 'nature'], vol: 'court', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Islam européen vivant, Baščaršija, très abordable', atoutEn: 'Living European Islam, Baščaršija, very affordable' },
  { slug: 'grenade', nom: 'Grenade', budget: 2, compagnies: ['couple', 'solo'], ambiances: ['culture'], vol: 'court', saisons: ['printemps', 'automne'], atoutFr: 'Alhambra, héritage d\'al-Andalus, Calderería Nueva', atoutEn: 'Alhambra, al-Andalus heritage, Calderería Nueva' },
  { slug: 'samarcande', nom: 'Samarcande', budget: 2, compagnies: ['couple', 'solo', 'amis'], ambiances: ['culture'], vol: 'moyen', saisons: ['printemps', 'automne'], atoutFr: 'Registan, route de la soie, patrimoine islamique majeur', atoutEn: 'Registan, Silk Road, major Islamic heritage' },
  { slug: 'mascate', nom: 'Mascate', budget: 3, compagnies: ['famille', 'couple'], ambiances: ['nature', 'plage'], vol: 'moyen', saisons: ['automne', 'hiver'], atoutFr: 'Oman authentique : fjords, wadis, grande mosquée Sultan Qaboos', atoutEn: 'Authentic Oman: fjords, wadis, Sultan Qaboos Grand Mosque' },
  { slug: 'maldives', nom: 'Maldives', budget: 3, compagnies: ['couple'], ambiances: ['plage'], vol: 'long', saisons: ['hiver', 'printemps'], atoutFr: 'Pays musulman, lagons ; resorts à choisir selon vos critères', atoutEn: 'Muslim country, lagoons; pick resorts matching your criteria' },
  { slug: 'zanzibar', nom: 'Zanzibar', budget: 2, compagnies: ['couple'], ambiances: ['plage', 'culture'], vol: 'long', saisons: ['ete', 'hiver'], atoutFr: 'Île à majorité musulmane, Stone Town, plages', atoutEn: 'Muslim-majority island, Stone Town, beaches' },
  { slug: 'londres', nom: 'Londres', budget: 3, compagnies: ['famille', 'solo', 'amis'], ambiances: ['ville'], vol: 'court', saisons: ['printemps', 'ete', 'automne', 'hiver'], atoutFr: 'Énorme scène halal (restos, boucheries), mosquées partout', atoutEn: 'Huge halal scene (restaurants, butchers), mosques everywhere' },
  { slug: 'paris', nom: 'Paris', budget: 3, compagnies: ['couple', 'solo', 'amis'], ambiances: ['ville', 'culture'], vol: 'court', saisons: ['printemps', 'ete', 'automne', 'hiver'], atoutFr: 'Grande Mosquée, milliers d\'adresses halal, week-end facile', atoutEn: 'Grand Mosque, thousands of halal spots, easy weekend' },
  { slug: 'casablanca', nom: 'Casablanca', budget: 1, compagnies: ['famille', 'solo'], ambiances: ['ville', 'plage'], vol: 'court', saisons: ['printemps', 'ete', 'automne', 'hiver'], atoutFr: 'Mosquée Hassan II, océan, vols directs low-cost', atoutEn: 'Hassan II Mosque, ocean, low-cost direct flights' },
  { slug: 'skopje', nom: 'Skopje', budget: 1, compagnies: ['solo', 'amis'], ambiances: ['culture'], vol: 'court', saisons: ['printemps', 'ete', 'automne'], atoutFr: 'Vieux bazar ottoman, Balkans musulmans méconnus, très abordable', atoutEn: 'Ottoman old bazaar, overlooked Muslim Balkans, very affordable' },
]
