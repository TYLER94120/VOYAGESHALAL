import { getRamadanInfo, getDaysUntilRamadan } from '@/lib/ramadan'

export function RamadanBanner() {
  const info = getRamadanInfo()
  const daysUntil = getDaysUntilRamadan()

  if (info.isActive) {
    return (
      <div className="ramadan-banner ramadan-active">
        <div className="ramadan-crescent">🌙</div>
        <div className="ramadan-content">
          <strong>Ramadan Mubarak رمضان مبارك</strong>
          <span>Mode Ramadan activé — Horaires Iftar &amp; Suhoor disponibles pour chaque ville</span>
        </div>
        <div className="ramadan-days">{info.daysRemaining} jours restants</div>
      </div>
    )
  }

  if (daysUntil > 0 && daysUntil <= 60) {
    return (
      <div className="ramadan-banner ramadan-countdown">
        <div className="ramadan-crescent">🌙</div>
        <div className="ramadan-content">
          <strong>Ramadan dans {daysUntil} jours</strong>
          <span>Préparez votre voyage Ramadan — guides et destinations disponibles</span>
        </div>
      </div>
    )
  }

  return null
}
