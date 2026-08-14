import { headers } from 'next/headers'

// 📍 LA POSITION CONNUE AVANT MÊME QUE LA PAGE S'AFFICHE.
//
// POURQUOI CE FICHIER EXISTE. Mohamed, 14 août : « on se plaint de la
// longueur d'attente d'ouverture du site », et « beaucoup de retours
// négatifs sur la première page ». Mesuré le jour même : le serveur répond
// en 26 ms — ce n'est pas lui. Le problème est ailleurs, et il est double.
//
// Le tableau de bord du voyageur (horaires de prière, mosquée la plus
// proche, où manger) ne s'affichait **pas du tout** tant que la position
// n'était pas connue : `if (!pos) return null`. Or la position arrivait du
// navigateur, donc après le chargement du JavaScript, donc une à trois
// secondes plus tard sur un téléphone en 4G. Pendant ce temps, le visiteur
// n'avait sous les yeux qu'un écran de présentation — et quand le tableau
// arrivait enfin, **il s'insérait au-dessus et faisait sauter la page sous
// le doigt**. C'est ce saut, plus encore que l'attente, que les gens
// ressentent comme « ça rame ».
//
// Vercel place la position approximative de l'adresse IP dans les en-têtes
// de la requête. Elle est donc disponible **avant le premier octet de
// HTML**, sans appel réseau et sans autorisation à demander. On s'en sert
// comme point de départ : l'écran est utile tout de suite, et le GPS ne
// fait plus qu'affiner ce qui est déjà là.
//
// Ce n'est PAS une position précise et on ne la présente jamais comme
// telle : c'est la ville, à quelques kilomètres près. Le badge de position
// continue d'afficher honnêtement d'où vient l'information.

export interface PositionServeur {
  lat: number
  lng: number
  /** Nom de ville tel que Vercel le fournit, jamais inventé. */
  ville: string | null
  pays: string | null
}

/**
 * Position approximative issue de l'adresse IP, ou `null` si l'hébergeur ne
 * la fournit pas (développement local, robot d'indexation, cache).
 * L'appel de `headers()` rend la page dynamique — elle l'est déjà toutes,
 * le site étant bi-domaine par en-tête `Host`.
 */
export async function positionServeur(): Promise<PositionServeur | null> {
  const h = await headers()
  const lat = parseFloat(h.get('x-vercel-ip-latitude') ?? '')
  const lng = parseFloat(h.get('x-vercel-ip-longitude') ?? '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  const brut = h.get('x-vercel-ip-city')
  let ville: string | null = null
  if (brut) {
    // L'en-tête est encodé pour le transport : « Le%20Caire ».
    try { ville = decodeURIComponent(brut) } catch { ville = brut }
  }
  return { lat, lng, ville, pays: h.get('x-vercel-ip-country') }
}
