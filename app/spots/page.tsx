import { permanentRedirect } from 'next/navigation'

// « Un seul mot partout : Trouvailles » (correction du 18 août). L'ancienne
// URL /spots reste vivante pour les liens déjà partagés — redirection 308.
export default function AncienneRouteSpots() {
  permanentRedirect('/trouvailles')
}
