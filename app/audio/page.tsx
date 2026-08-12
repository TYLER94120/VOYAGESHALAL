import type { Metadata } from 'next'
import AudioSpirituel from '@/components/audio/AudioSpirituel'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'

// 🎧 Audio / Spirituel — dou'as du voyageur (Hisn al-Muslim) + sourates de
// protection (audio libre via l'API alquran.cloud). Même slug FR/EN : /audio.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const title = isEN
    ? 'Audio & Spiritual — traveler duas and protection surahs'
    : 'Sourates de protection et dou\'as du voyageur — audio'
  const description = isEN
    ? 'Protection surahs (Al-Fatiha, Ayat al-Kursi, Al-Mulk, Ya-Sin) in audio, plus the traveller\'s duas: Arabic, transliteration, translation. Works offline.'
    : 'Sourates de protection (Al-Fâtiha, Âyat al-Kursî, Al-Mulk, Yâ-Sîn) en audio et dou\'as du voyageur : arabe, phonétique, traduction. Écoute hors ligne.'
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/audio`, languages: { fr: `${FR_URL}/audio`, en: `${EN_URL}/audio` } },
    openGraph: { title, description, url: `${siteUrl}/audio` },
  }
}

export default function AudioPage() {
  return <AudioSpirituel />
}
