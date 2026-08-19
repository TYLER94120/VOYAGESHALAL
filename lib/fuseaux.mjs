// 🕐 FUSEAU HORAIRE DE CHAQUE VILLE DU GUIDE.
//
// La cause du bug « Dhuhr 04:46 » : les horaires de prière sont des
// instants ABSOLUS corrects (prayerCalc), mais ils étaient formatés avec
// getHours() — le fuseau du NAVIGATEUR du lecteur, pas celui de la ville.
// Dhuhr 12:09 à Tokyo, lu depuis Paris, s'affichait 05:09.
//
// Ici : pays → fuseau IANA, avec exceptions PAR VILLE pour les pays qui
// en couvrent plusieurs. Un pays inconnu rend null — et un planning sans
// fuseau ne s'affiche pas (règle « données vraies ou absentes »).

const PAR_PAYS = {
  'Afrique du Sud': 'Africa/Johannesburg',
  'Albanie': 'Europe/Tirane',
  'Algérie': 'Africa/Algiers',
  'Allemagne': 'Europe/Berlin',
  'Arabie Saoudite': 'Asia/Riyadh',
  'Argentine': 'America/Argentina/Buenos_Aires',
  'Australie': 'Australia/Sydney',
  'Autriche': 'Europe/Vienna',
  'Azerbaïdjan': 'Asia/Baku',
  'Bahreïn': 'Asia/Bahrain',
  'Bangladesh': 'Asia/Dhaka',
  'Belgique': 'Europe/Brussels',
  'Birmanie': 'Asia/Yangon',
  'Bolivie': 'America/La_Paz',
  'Bosnie': 'Europe/Sarajevo',
  'Bosnie-Herzégovine': 'Europe/Sarajevo',
  'Brunei': 'Asia/Brunei',
  'Brésil': 'America/Sao_Paulo',
  'Bulgarie': 'Europe/Sofia',
  'Burkina Faso': 'Africa/Ouagadougou',
  'Cambodge': 'Asia/Phnom_Penh',
  'Cameroun': 'Africa/Douala',
  'Canada': 'America/Toronto',
  'Chili': 'America/Santiago',
  'Chine': 'Asia/Shanghai',
  'Colombie': 'America/Bogota',
  'Corée du Sud': 'Asia/Seoul',
  'Croatie': 'Europe/Zagreb',
  'Cuba': 'America/Havana',
  "Côte d'Ivoire": 'Africa/Abidjan',
  'Danemark': 'Europe/Copenhagen',
  'Djibouti': 'Africa/Djibouti',
  'Espagne': 'Europe/Madrid',
  'Finlande': 'Europe/Helsinki',
  'France': 'Europe/Paris',
  'Ghana': 'Africa/Accra',
  'Grèce': 'Europe/Athens',
  'Hongrie': 'Europe/Budapest',
  'Inde': 'Asia/Kolkata',
  'Indonésie': 'Asia/Jakarta',
  'Irak': 'Asia/Baghdad',
  'Iran': 'Asia/Tehran',
  'Irlande': 'Europe/Dublin',
  'Islande': 'Atlantic/Reykjavik',
  'Italie': 'Europe/Rome',
  'Japon': 'Asia/Tokyo',
  'Jordanie': 'Asia/Amman',
  'Kazakhstan': 'Asia/Almaty',
  'Kenya': 'Africa/Nairobi',
  'Kirghizistan': 'Asia/Bishkek',
  'Koweït': 'Asia/Kuwait',
  'Laos': 'Asia/Vientiane',
  'Liban': 'Asia/Beirut',
  'Luxembourg': 'Europe/Luxembourg',
  'Macédoine du Nord': 'Europe/Skopje',
  'Madagascar': 'Indian/Antananarivo',
  'Malaisie': 'Asia/Kuala_Lumpur',
  'Maldives': 'Indian/Maldives',
  'Mali': 'Africa/Bamako',
  'Maroc': 'Africa/Casablanca',
  'Maurice': 'Indian/Mauritius',
  'Mexique': 'America/Mexico_City',
  'Mozambique': 'Africa/Maputo',
  'Nigéria': 'Africa/Lagos',
  'Norvège': 'Europe/Oslo',
  'Nouvelle-Zélande': 'Pacific/Auckland',
  'Népal': 'Asia/Kathmandu',
  'Oman': 'Asia/Muscat',
  'Ouganda': 'Africa/Kampala',
  'Ouzbékistan': 'Asia/Tashkent',
  'Pakistan': 'Asia/Karachi',
  'Palestine': 'Asia/Hebron',
  'Panama': 'America/Panama',
  'Pays-Bas': 'Europe/Amsterdam',
  'Philippines': 'Asia/Manila',
  'Pologne': 'Europe/Warsaw',
  'Portugal': 'Europe/Lisbon',
  'Pérou': 'America/Lima',
  'Qatar': 'Asia/Qatar',
  'RD Congo': 'Africa/Kinshasa',
  'Roumanie': 'Europe/Bucharest',
  'Royaume-Uni': 'Europe/London',
  'Russie': 'Europe/Moscow',
  'Rwanda': 'Africa/Kigali',
  'Serbie': 'Europe/Belgrade',
  'Singapour': 'Asia/Singapore',
  'Slovaquie': 'Europe/Bratislava',
  'Slovénie': 'Europe/Ljubljana',
  'Soudan': 'Africa/Khartoum',
  'Sri Lanka': 'Asia/Colombo',
  'Suisse': 'Europe/Zurich',
  'Suède': 'Europe/Stockholm',
  'Syrie': 'Asia/Damascus',
  'Sénégal': 'Africa/Dakar',
  'Tadjikistan': 'Asia/Dushanbe',
  'Tanzanie': 'Africa/Dar_es_Salaam',
  'Taïwan': 'Asia/Taipei',
  'Tchéquie': 'Europe/Prague',
  'Thaïlande': 'Asia/Bangkok',
  'Tunisie': 'Africa/Tunis',
  'Turquie': 'Europe/Istanbul',
  'Uruguay': 'America/Montevideo',
  'Venezuela': 'America/Caracas',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Égypte': 'Africa/Cairo',
  'Émirats Arabes Unis': 'Asia/Dubai',
  'Équateur': 'America/Guayaquil',
  'États-Unis': 'America/New_York',
  'Éthiopie': 'Africa/Addis_Ababa',
}

// Les pays multi-fuseaux : la ville tranche (slug du guide).
const PAR_VILLE = {
  // États-Unis
  'chicago': 'America/Chicago',
  'houston': 'America/Chicago',
  'austin': 'America/Chicago',
  'san-antonio': 'America/Chicago',
  'minneapolis': 'America/Chicago',
  'nashville': 'America/Chicago',
  'new-orleans': 'America/Chicago',
  'denver': 'America/Denver',
  'phoenix': 'America/Phoenix',
  'los-angeles': 'America/Los_Angeles',
  'san-francisco': 'America/Los_Angeles',
  'san-diego': 'America/Los_Angeles',
  'seattle': 'America/Los_Angeles',
  'portland': 'America/Los_Angeles',
  'las-vegas': 'America/Los_Angeles',
  // Canada
  'calgary': 'America/Edmonton',
  'edmonton': 'America/Edmonton',
  'vancouver': 'America/Vancouver',
  // Australie (Sydney par défaut)
  'adelaide': 'Australia/Adelaide',
  'perth': 'Australia/Perth',
  'brisbane': 'Australia/Brisbane',
  'gold-coast': 'Australia/Brisbane',
  // Brésil (Sao_Paulo par défaut, tous nos slugs y sont)
  // Indonésie (Jakarta par défaut)
  'bali': 'Asia/Makassar',
  'lombok': 'Asia/Makassar',
  // Chine : un seul fuseau légal (Asia/Shanghai) — Hong Kong / Macao ont le
  // même décalage, on garde le défaut.
  // Kazakhstan : unifié UTC+5 depuis 2024 → Asia/Almaty pour les deux.
  // Russie : nos deux slugs sont à Moscou.
  // Mexique
  'cancun': 'America/Cancun',
  // Espagne / Portugal : Canaries et Madère absentes du guide — défaut ok.
  'palma': 'Europe/Madrid',
}

/** Fuseau IANA d'une ville du guide, ou null si inconnu. */
export function fuseauDe(pays, slug) {
  return PAR_VILLE[String(slug ?? '')] ?? PAR_PAYS[String(pays ?? '')] ?? null
}

/** « HH:MM » d'un instant, DANS le fuseau de la ville — jamais celui du lecteur. */
export function formaterHeureVille(date, tz) {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}
