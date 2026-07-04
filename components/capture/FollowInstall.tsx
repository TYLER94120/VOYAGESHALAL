'use client'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { SOCIAL_LINKS } from '@/lib/seo'

// CTA « Suivre » (réseaux) + « Installer l'app ». Chaque interaction pose un
// événement analytics `follow` / `install` (relations captées, métrique Phase 1).
// App non publiée → le bouton bascule sur la liste d'attente (waitlist).

export default function FollowInstall({ source = 'home' }: { source?: string }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const hasSocials = SOCIAL_LINKS.length > 0

  const onFollow = (net: string) => { try { track('follow', { network: net, source }) } catch {} }
  const onInstall = async () => {
    try { track('install', { source, state: 'waitlist' }) } catch {}
  }

  return (
    <div className="fi-wrap">
      <div className="fi-block">
        <h3 className="fi-title">{en ? 'Follow the journey' : 'Suis l\'aventure'}</h3>
        <p className="fi-sub">{en ? 'Prayer spots & halal finds, shared as we travel.' : 'Coins prière & pépites halal, partagés au fil du voyage.'}</p>
        {hasSocials ? (
          <div className="fi-socials">
            {SOCIAL_LINKS.map((url) => {
              const net = url.split('/')[2]?.split('.')[1] || 'social'
              return (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="fi-social" onClick={() => onFollow(net)}>
                  {net}
                </a>
              )
            })}
          </div>
        ) : (
          <p className="fi-soon">{en ? 'Social channels coming soon.' : 'Comptes bientôt disponibles.'}</p>
        )}
      </div>

      <div className="fi-block">
        <h3 className="fi-title">{en ? 'Get the app' : 'Installe l\'app'}</h3>
        <p className="fi-sub">{en ? 'Qibla, prayer times & nearby — even offline.' : 'Qibla, horaires & autour de moi — même hors-ligne.'}</p>
        <a href="/application" className="fi-install" onClick={onInstall}>
          📲 {en ? 'Join the waitlist' : 'Rejoindre la liste d\'attente'}
        </a>
      </div>
    </div>
  )
}
