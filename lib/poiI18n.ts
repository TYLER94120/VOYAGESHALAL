// Traduction EN des micro-textes DATA-DRIVEN (catégories, types, valeurs
// répétitives) affichés sur gohalaltravel.com. Dictionnaire à l'affichage :
// aucune donnée dupliquée. Si un libellé n'est pas connu, on renvoie tel quel
// (les types OSM sont déjà en anglais : kebab, turkish…).

const MAP: Record<string, string> = {
  // Catégories de l'annuaire
  'Traditionnel local': 'Local traditional', 'Libanais & Levant': 'Lebanese & Levant',
  'Indien & Pakistani': 'Indian & Pakistani', 'Pizza & Italien': 'Pizza & Italian',
  'Japonais & Asiatique': 'Japanese & Asian', 'Burgers & Fast-food': 'Burgers & Fast food',
  Gastronomique: 'Fine dining', 'Végétarien & Healthy': 'Vegetarian & Healthy',
  'Pâtisserie & Café': 'Pastry & Coffee',
  Luxe: 'Luxury', Standard: 'Standard', 'Riad & Boutique': 'Riad & Boutique',
  Budget: 'Budget', 'Resort & Spa': 'Resort & Spa',
  'Religieux & Spirituel': 'Religious & Spiritual', 'Histoire & Culture': 'History & Culture',
  'Shopping & Souks': 'Shopping & Souks', Gastronomie: 'Food', 'Nature & Plein air': 'Nature & Outdoors',
  Famille: 'Family', 'Hammam & Bien-être': 'Hammam & Wellness',
  // Types de POI fréquents
  Restaurant: 'Restaurant', 'Boucherie halal': 'Halal butcher', Mosquée: 'Mosque',
  'Lieu de prière': 'Prayer space', Hôtel: 'Hotel',
  Culture: 'Culture', Histoire: 'History', Panorama: 'Viewpoint', Nature: 'Nature',
  'À voir': 'Must-see', Spirituel: 'Spiritual', Gratuit: 'Free',
}

export function enLabel(fr: string | undefined, en: boolean): string | undefined {
  if (!fr || !en) return fr
  return MAP[fr] ?? fr
}
