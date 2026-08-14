'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { localizedHref } from '@/lib/slugs'
import PositionBadge from '@/components/location/PositionBadge'
import { meteoInstantanee, emojiMeteo, type Meteo } from '@/lib/meteo'

const KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
const LABELS: Record<string, string> = { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'ʿAsr', Maghrib: 'Maghrib', Isha: 'ʿIshâ' }

// Bandeau fin, sticky, présent sur toutes les pages : prochaine prière + compte à rebours
// (+ accès langue sur mobile, où le header est masqué).
// ⚠️ UNE SEULE SOURCE D'HORAIRES POUR TOUT LE SITE.
// Mohamed a photographié l'accueil : le bandeau annonçait Dhuhr à 13h37 et
// la tuile du tableau de bord 13h24, sur le même écran. Quatorze minutes
// d'écart, sur un produit de prière.
//
// La cause n'était pas un mauvais calcul — vérifié par un calcul solaire
// indépendant, 13h37 est juste pour Marrakech ce jour-là — mais DEUX
// SOURCES : ce bandeau partait de la ville mémorisée, le tableau de bord
// de la position réelle. Deux points différents donnent deux horaires
// différents, et l'utilisateur n'a aucun moyen de savoir lequel croire.
//
// Les deux lisent désormais la MÊME position (useInstantPosition, la même
// que le board) et la même méthode de calcul.
//
// ════════ 16 AOÛT — UN SEUL BANDEAU, PAS TROIS LIGNES EMPILÉES ════════
//
// Ordre de Mohamed : « La pastille "Paris · exacte" et la météo remontent
// dans la fine barre du haut, avec la langue. » Elles vivaient sur une
// deuxième ligne, dans le tableau de bord, juste en dessous de celle-ci :
// deux bandeaux qui parlaient du même endroit.
//
// ET SUR L'ACCUEIL, CE BANDEAU NE COMPTE PLUS LES MINUTES. Le bloc prière
// est là, quatre centimètres plus bas, avec le même compte à rebours en
// bien plus lisible. Deux comptes à rebours sur un écran, c'est celui du
// haut qui devient du bruit. Il garde donc son décompte PARTOUT AILLEURS
// — sur une fiche ville, un guide, un article, il est la seule réponse à
// « c'est dans combien de temps ? ».
export default function PrayerCountdownBar() {
  const etatPos = useInstantPosition()
  const { pos } = etatPos
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [now, setNow] = useState(Date.now())
  const chemin = usePathname()
  const surAccueil = chemin === '/' || chemin === '/en'
  const [meteo, setMeteo] = useState<Meteo | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // La météo est un CONFORT : elle arrive quand elle arrive, et si elle
  // n'arrive pas la barre ne montre rien plutôt qu'un rond qui tourne.
  useEffect(() => {
    if (!pos) return
    const gardee = meteoInstantanee(pos.lat, pos.lng, setMeteo)
    if (gardee) setMeteo(gardee)
  }, [pos?.lat, pos?.lng]) // eslint-disable-line react-hooks/exhaustive-deps

  // ⚠️ CALCUL LOCAL, comme le tableau de bord de l'accueil.
  //
  // Ce bandeau interrogeait api.aladhan.com pendant que le board calculait
  // lui-même. Deux moteurs pour un même horaire, et deux défauts :
  //   · sans réseau (avion, métro, étranger), le bandeau restait bloqué sur
  //     « Chargement des horaires… » — vu sur nos propres captures ;
  //   · l'objet `city` était reconstruit à chaque rendu, donc l'effet qui en
  //     dépendait relançait un appel réseau CHAQUE SECONDE (le compte à
  //     rebours provoque un rendu par seconde).
  // Le calcul local ne peut ni échouer ni diverger.
  const timings = useMemo(() => {
    if (!pos) return null
    try {
      const method = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const school = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const t = computePrayerTimesFull(pos.lat, pos.lng, method, school, new Date())
      const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      const out: Record<string, string> = {}
      for (const k of KEYS) out[k] = hhmm(t[k])
      return out
    } catch { return null }
    // Recalculé quand la position change ou qu'on passe un jour — pas à
    // chaque tic du compte à rebours.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos?.lat, pos?.lng, new Date(now).getDate()])

  const city = pos ? { nom: pos.label, lat: pos.lat, lng: pos.lng } : null

  let inner: React.ReactNode
  if (!city) {
    inner = <Link href={localizedHref('/horaires-priere', en)} className="prayer-bar-main"><span style={{ opacity: 0.85 }}>🕌 {en ? 'Choose your city for prayer times' : 'Choisissez votre ville pour les horaires'}</span></Link>
  } else if (!timings) {
    inner = <span className="prayer-bar-main">🕌 <span style={{ opacity: 0.7 }}>{en ? 'Loading prayer times…' : 'Chargement des horaires…'}</span></span>
  } else {
    const d = new Date(now)
    let nextKey = 'Fajr'
    let target: Date | null = null
    for (const k of KEYS) {
      const [h, m] = timings[k].split(':').map(Number)
      const when = new Date(d); when.setHours(h, m, 0, 0)
      if (when.getTime() > now) { nextKey = k; target = when; break }
    }
    if (!target) {
      const [h, m] = timings.Fajr.split(':').map(Number)
      target = new Date(d); target.setDate(target.getDate() + 1); target.setHours(h, m, 0, 0)
      nextKey = 'Fajr'
    }
    const diff = Math.max(0, target.getTime() - now)
    const hh = Math.floor(diff / 3600000)
    const mm = Math.floor((diff % 3600000) / 60000)
    const ss = Math.floor((diff % 60000) / 1000)
    const remaining = hh > 0 ? `${hh}h ${String(mm).padStart(2, '0')}min` : `${mm}min ${String(ss).padStart(2, '0')}s`
    inner = (
      <Link href={localizedHref('/horaires-priere', en)} className="prayer-bar-main">
        <span>🕌 <strong style={{ color: 'var(--or)' }}>{LABELS[nextKey]}</strong> {timings[nextKey]}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>{en ? 'in' : 'dans'} <strong>{remaining}</strong></span>
        <span style={{ opacity: 0.55, fontSize: 11 }}>📍 {city.nom}</span>
      </Link>
    )
  }

  // 📍 LA POSITION EN PASTILLE, ET NON EN TEXTE MORT. Elle garde son appui
  // « ma position exacte » : le roaming fausse la géolocalisation par IP, et
  // une position fausse ne donne pas un site imprécis, elle donne un site faux.
  const positionEtMeteo = (
    <span className="prayer-bar-lieu">
      <PositionBadge compact etat={etatPos} en={en}
        apresRefus={() => { window.location.href = localizedHref('/horaires-priere', en) }} />
      {meteo?.maintenant && (
        <Link href="/meteo" aria-label={en ? 'Weather' : 'Météo'} className="prayer-bar-meteo">
          <span style={{ fontSize: 15 }} aria-hidden>{emojiMeteo(meteo.maintenant.code)}</span>
          <span style={{ color: '#fdfaf3', fontWeight: 900, fontSize: 13.5 }}>{meteo.maintenant.temp}°</span>
        </Link>
      )}
    </span>
  )

  return (
    <div className="prayer-bar">
      {surAccueil ? positionEtMeteo : <>{inner}{positionEtMeteo}</>}
      {/* Accès langue (surtout utile sur mobile où le header est masqué) */}
      <span className="prayer-bar-lang"><LanguageSwitcher /></span>
    </div>
  )
}
