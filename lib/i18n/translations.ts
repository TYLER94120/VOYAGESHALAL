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

export type TranslationKey = Keys
