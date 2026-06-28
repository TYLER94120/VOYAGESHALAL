export type Lang = 'fr' | 'en' | 'ar' | 'id' | 'tr' | 'ur' | 'ms' | 'de' | 'nl' | 'es'

export const RTL_LANGS: Lang[] = ['ar', 'ur']

export interface LangOption {
  code: Lang
  flag: string
  short: string
  name: string
}

export const LANGS: LangOption[] = [
  { code: 'fr', flag: '🇫🇷', short: 'FR', name: 'Français' },
  { code: 'en', flag: '🇬🇧', short: 'EN', name: 'English' },
  { code: 'ar', flag: '🇸🇦', short: 'AR', name: 'العربية' },
  { code: 'id', flag: '🇮🇩', short: 'ID', name: 'Bahasa' },
  { code: 'tr', flag: '🇹🇷', short: 'TR', name: 'Türkçe' },
  { code: 'ur', flag: '🇵🇰', short: 'UR', name: 'اردو' },
  { code: 'ms', flag: '🇲🇾', short: 'MS', name: 'Melayu' },
  { code: 'de', flag: '🇩🇪', short: 'DE', name: 'Deutsch' },
  { code: 'nl', flag: '🇳🇱', short: 'NL', name: 'Nederlands' },
  { code: 'es', flag: '🇪🇸', short: 'ES', name: 'Español' },
]

type Keys =
  | 'nav.home' | 'nav.destinations' | 'nav.prayer' | 'nav.qibla' | 'nav.mosque' | 'nav.blog' | 'nav.app'
  | 'bottom.home' | 'bottom.destinations' | 'bottom.prayer' | 'bottom.qibla' | 'bottom.mosque'

export const dict: Record<Lang, Record<Keys, string>> = {
  fr: { 'nav.home': 'Accueil', 'nav.destinations': 'Destinations', 'nav.prayer': 'Horaires', 'nav.qibla': 'Qibla', 'nav.mosque': 'Mosquée', 'nav.blog': 'Blog', 'nav.app': "L'application", 'bottom.home': 'Accueil', 'bottom.destinations': 'Destins', 'bottom.prayer': 'Prière', 'bottom.qibla': 'Qibla', 'bottom.mosque': 'Mosquée' },
  en: { 'nav.home': 'Home', 'nav.destinations': 'Destinations', 'nav.prayer': 'Prayer Times', 'nav.qibla': 'Qibla', 'nav.mosque': 'Mosque', 'nav.blog': 'Blog', 'nav.app': 'The app', 'bottom.home': 'Home', 'bottom.destinations': 'Trips', 'bottom.prayer': 'Prayer', 'bottom.qibla': 'Qibla', 'bottom.mosque': 'Mosque' },
  ar: { 'nav.home': 'الرئيسية', 'nav.destinations': 'الوجهات', 'nav.prayer': 'مواقيت الصلاة', 'nav.qibla': 'القبلة', 'nav.mosque': 'مسجد', 'nav.blog': 'المدونة', 'nav.app': 'التطبيق', 'bottom.home': 'الرئيسية', 'bottom.destinations': 'الوجهات', 'bottom.prayer': 'الصلاة', 'bottom.qibla': 'القبلة', 'bottom.mosque': 'مسجد' },
  id: { 'nav.home': 'Beranda', 'nav.destinations': 'Destinasi', 'nav.prayer': 'Waktu Salat', 'nav.qibla': 'Kiblat', 'nav.mosque': 'Masjid', 'nav.blog': 'Blog', 'nav.app': 'Aplikasi', 'bottom.home': 'Beranda', 'bottom.destinations': 'Destinasi', 'bottom.prayer': 'Salat', 'bottom.qibla': 'Kiblat', 'bottom.mosque': 'Masjid' },
  tr: { 'nav.home': 'Anasayfa', 'nav.destinations': 'Rotalar', 'nav.prayer': 'Namaz Vakitleri', 'nav.qibla': 'Kıble', 'nav.mosque': 'Cami', 'nav.blog': 'Blog', 'nav.app': 'Uygulama', 'bottom.home': 'Anasayfa', 'bottom.destinations': 'Rotalar', 'bottom.prayer': 'Namaz', 'bottom.qibla': 'Kıble', 'bottom.mosque': 'Cami' },
  ur: { 'nav.home': 'ہوم', 'nav.destinations': 'مقامات', 'nav.prayer': 'نماز اوقات', 'nav.qibla': 'قبلہ', 'nav.mosque': 'مسجد', 'nav.blog': 'بلاگ', 'nav.app': 'ایپ', 'bottom.home': 'ہوم', 'bottom.destinations': 'مقامات', 'bottom.prayer': 'نماز', 'bottom.qibla': 'قبلہ', 'bottom.mosque': 'مسجد' },
  ms: { 'nav.home': 'Laman Utama', 'nav.destinations': 'Destinasi', 'nav.prayer': 'Waktu Solat', 'nav.qibla': 'Kiblat', 'nav.mosque': 'Masjid', 'nav.blog': 'Blog', 'nav.app': 'Aplikasi', 'bottom.home': 'Utama', 'bottom.destinations': 'Destinasi', 'bottom.prayer': 'Solat', 'bottom.qibla': 'Kiblat', 'bottom.mosque': 'Masjid' },
  de: { 'nav.home': 'Startseite', 'nav.destinations': 'Reiseziele', 'nav.prayer': 'Gebetszeiten', 'nav.qibla': 'Qibla', 'nav.mosque': 'Moschee', 'nav.blog': 'Blog', 'nav.app': 'Die App', 'bottom.home': 'Start', 'bottom.destinations': 'Ziele', 'bottom.prayer': 'Gebet', 'bottom.qibla': 'Qibla', 'bottom.mosque': 'Moschee' },
  nl: { 'nav.home': 'Home', 'nav.destinations': 'Bestemmingen', 'nav.prayer': 'Gebedstijden', 'nav.qibla': 'Qibla', 'nav.mosque': 'Moskee', 'nav.blog': 'Blog', 'nav.app': 'De app', 'bottom.home': 'Home', 'bottom.destinations': 'Reizen', 'bottom.prayer': 'Gebed', 'bottom.qibla': 'Qibla', 'bottom.mosque': 'Moskee' },
  es: { 'nav.home': 'Inicio', 'nav.destinations': 'Destinos', 'nav.prayer': 'Horarios', 'nav.qibla': 'Qibla', 'nav.mosque': 'Mezquita', 'nav.blog': 'Blog', 'nav.app': 'La app', 'bottom.home': 'Inicio', 'bottom.destinations': 'Destinos', 'bottom.prayer': 'Oración', 'bottom.qibla': 'Qibla', 'bottom.mosque': 'Mezquita' },
}

// ---- Strings d'interface additionnelles (accueil, géoloc) ----
export const moreDict: Record<Lang, Record<string, string>> = {
  fr: { 'home.greet': 'où allez-vous prier ?', 'home.next': 'Prochaine prière', 'home.allTimes': 'Touchez pour tous les horaires →', 'home.popular': 'Destinations populaires', 'home.seeAll': 'Voir toutes les destinations →', 'tile.destSub': 'villes halal', 'tile.praySub': 'Horaires du jour', 'tile.qiblaSub': 'Direction Mecque', 'tile.mosqueSub': 'La plus proche', 'geo.title': 'Tout le halal autour de vous', 'geo.sub': 'Mosquées, horaires de prière et Qibla — en un clic', 'geo.btn': '📍 Me géolocaliser maintenant' },
  en: { 'home.greet': 'where will you pray?', 'home.next': 'Next prayer', 'home.allTimes': 'Tap for all prayer times →', 'home.popular': 'Popular destinations', 'home.seeAll': 'See all destinations →', 'tile.destSub': 'halal cities', 'tile.praySub': "Today's times", 'tile.qiblaSub': 'Mecca direction', 'tile.mosqueSub': 'Nearest one', 'geo.title': 'All things halal around you', 'geo.sub': 'Mosques, prayer times and Qibla — in one tap', 'geo.btn': '📍 Locate me now' },
  ar: { 'home.greet': 'أين ستصلي؟', 'home.next': 'الصلاة القادمة', 'home.allTimes': 'اضغط لكل المواقيت ←', 'home.popular': 'وجهات شائعة', 'home.seeAll': 'كل الوجهات ←', 'tile.destSub': 'مدن حلال', 'tile.praySub': 'مواقيت اليوم', 'tile.qiblaSub': 'اتجاه مكة', 'tile.mosqueSub': 'الأقرب إليك', 'geo.title': 'كل ما هو حلال حولك', 'geo.sub': 'مساجد ومواقيت صلاة وقبلة — بنقرة واحدة', 'geo.btn': '📍 حدد موقعي الآن' },
  id: { 'home.greet': 'di mana Anda akan salat?', 'home.next': 'Salat berikutnya', 'home.allTimes': 'Ketuk untuk semua waktu →', 'home.popular': 'Destinasi populer', 'home.seeAll': 'Lihat semua destinasi →', 'tile.destSub': 'kota halal', 'tile.praySub': 'Waktu hari ini', 'tile.qiblaSub': 'Arah Mekah', 'tile.mosqueSub': 'Terdekat', 'geo.title': 'Semua yang halal di sekitar Anda', 'geo.sub': 'Masjid, waktu salat & kiblat — sekali ketuk', 'geo.btn': '📍 Lacak lokasi saya' },
  tr: { 'home.greet': 'nerede namaz kılacaksınız?', 'home.next': 'Sonraki namaz', 'home.allTimes': 'Tüm vakitler için dokunun →', 'home.popular': 'Popüler rotalar', 'home.seeAll': 'Tüm rotaları gör →', 'tile.destSub': 'helal şehir', 'tile.praySub': 'Bugünün vakitleri', 'tile.qiblaSub': 'Mekke yönü', 'tile.mosqueSub': 'En yakını', 'geo.title': 'Çevrenizdeki tüm helal', 'geo.sub': 'Cami, namaz vakitleri ve kıble — tek dokunuş', 'geo.btn': '📍 Beni şimdi konumla' },
  ur: { 'home.greet': 'آپ کہاں نماز پڑھیں گے؟', 'home.next': 'اگلی نماز', 'home.allTimes': 'تمام اوقات کے لیے ٹیپ کریں ←', 'home.popular': 'مقبول مقامات', 'home.seeAll': 'تمام مقامات دیکھیں ←', 'tile.destSub': 'حلال شہر', 'tile.praySub': 'آج کے اوقات', 'tile.qiblaSub': 'مکہ کی سمت', 'tile.mosqueSub': 'قریب ترین', 'geo.title': 'آپ کے اردگرد ہر حلال چیز', 'geo.sub': 'مساجد، نماز اوقات اور قبلہ — ایک کلک میں', 'geo.btn': '📍 ابھی میری لوکیشن' },
  ms: { 'home.greet': 'di mana anda akan solat?', 'home.next': 'Solat seterusnya', 'home.allTimes': 'Ketik untuk semua waktu →', 'home.popular': 'Destinasi popular', 'home.seeAll': 'Lihat semua destinasi →', 'tile.destSub': 'bandar halal', 'tile.praySub': 'Waktu hari ini', 'tile.qiblaSub': 'Arah Mekah', 'tile.mosqueSub': 'Terdekat', 'geo.title': 'Semua halal di sekeliling anda', 'geo.sub': 'Masjid, waktu solat & kiblat — satu ketikan', 'geo.btn': '📍 Kesan lokasi saya' },
  de: { 'home.greet': 'wo werden Sie beten?', 'home.next': 'Nächstes Gebet', 'home.allTimes': 'Für alle Zeiten tippen →', 'home.popular': 'Beliebte Reiseziele', 'home.seeAll': 'Alle Reiseziele ansehen →', 'tile.destSub': 'Halal-Städte', 'tile.praySub': 'Heutige Zeiten', 'tile.qiblaSub': 'Mekka-Richtung', 'tile.mosqueSub': 'Die nächste', 'geo.title': 'Alles Halal um Sie herum', 'geo.sub': 'Moscheen, Gebetszeiten & Qibla — mit einem Tipp', 'geo.btn': '📍 Mich jetzt orten' },
  nl: { 'home.greet': 'waar gaat u bidden?', 'home.next': 'Volgend gebed', 'home.allTimes': 'Tik voor alle tijden →', 'home.popular': 'Populaire bestemmingen', 'home.seeAll': 'Alle bestemmingen →', 'tile.destSub': 'halal steden', 'tile.praySub': 'Tijden van vandaag', 'tile.qiblaSub': 'Richting Mekka', 'tile.mosqueSub': 'Dichtstbijzijnd', 'geo.title': 'Alles halal om u heen', 'geo.sub': 'Moskeeën, gebedstijden & Qibla — met één tik', 'geo.btn': '📍 Lokaliseer mij nu' },
  es: { 'home.greet': '¿dónde va a rezar?', 'home.next': 'Próxima oración', 'home.allTimes': 'Toca para todos los horarios →', 'home.popular': 'Destinos populares', 'home.seeAll': 'Ver todos los destinos →', 'tile.destSub': 'ciudades halal', 'tile.praySub': 'Horarios de hoy', 'tile.qiblaSub': 'Dirección Meca', 'tile.mosqueSub': 'La más cercana', 'geo.title': 'Todo lo halal a tu alrededor', 'geo.sub': 'Mezquitas, horarios y Qibla — en un clic', 'geo.btn': '📍 Ubicarme ahora' },
}

export type TranslationKey = Keys
