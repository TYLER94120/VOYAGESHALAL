// 🧭 UN TAP = L'ITINÉRAIRE, dans l'app de cartes du téléphone (itération 2,
// correction 4). On passe les COORDONNÉES, jamais le nom : la précision
// chirurgicale de la position vaut aussi pour la destination.
export function lancerItineraire(lat: number, lng: number): void {
  const web = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  try {
    const ua = navigator.userAgent
    const natif = /iPhone|iPad|iPod/.test(ua) ? `maps://?daddr=${lat},${lng}`
      : /Android/.test(ua) ? `google.navigation:q=${lat},${lng}` : null
    if (natif) {
      // Si l'app native ne s'ouvre pas (schéma inconnu), le repli web part
      // après un court délai — et il est annulé si la page a été masquée
      // (signe que l'app s'est bien ouverte).
      const t = setTimeout(() => { if (!document.hidden) window.open(web, '_blank', 'noopener') }, 900)
      window.addEventListener('pagehide', () => clearTimeout(t), { once: true })
      window.location.href = natif
      return
    }
  } catch { /* environnement sans navigator : repli web */ }
  window.open(web, '_blank', 'noopener')
}
