'use client'

// ⏱ UN APPEL RÉSEAU QUI ABANDONNE PLUTÔT QUE DE TRAÎNER.
//
// `fetch` n'a AUCUN délai maximum. Sans intervention, il attend celui du
// système — de trente secondes à plusieurs minutes. Sur un téléphone dans
// un café, dans un aéroport ou à l'étranger, c'est un écran qui paraît
// figé pendant une demi-minute.
//
// Mesuré sur notre accueil : un appel à /api/ville-counts est resté
// **13,7 secondes sans jamais se terminer**, pendant que le tableau de
// bord attendait sa réponse. Le premier pixel arrivait pourtant en 244 ms
// — le site n'était pas lent, il était bloqué.
//
// LE PRINCIPE : le réseau n'est presque jamais absent, il est LENT. Trois
// états, jamais deux — en ligne, lent, coupé. C'est le deuxième que tout
// le monde oublie, et c'est le plus fréquent.
//
// ⚠️ NE PAS UTILISER POUR UNE ÉCRITURE (POST d'un avis, envoi d'une photo,
// création d'un spot). Abandonner côté navigateur n'annule rien côté
// serveur : la requête peut aboutir quand même, et l'utilisateur qui
// réessaie enverrait deux fois. Sur une écriture, on attend et on affiche
// l'attente.

/** Délai par défaut : au-delà, l'utilisateur ne pense plus « ça charge »
 *  mais « ça ne marche pas ». Notre repli est bon (le board affiche ses
 *  tuiles sans ces données), donc on coupe court. */
export const DELAI_RESEAU = 4000

export async function fetchCourt(url: string, options?: RequestInit & { delai?: number }): Promise<Response> {
  const { delai = DELAI_RESEAU, ...reste } = options ?? {}
  const controleur = new AbortController()
  const minuteur = setTimeout(() => controleur.abort(), delai)
  try {
    return await fetch(url, { ...reste, signal: controleur.signal })
  } finally {
    // Sans ce finally, chaque appel réussi laisse un minuteur actif
    // jusqu'à son terme. Sur un board qui recharge à chaque déplacement,
    // ils s'empilent.
    clearTimeout(minuteur)
  }
}

/** Même chose, mais renvoie null au lieu de lever : pratique quand
 *  l'absence de réponse est un cas normal et non une erreur. */
export async function fetchJsonCourt<T>(url: string, delai = DELAI_RESEAU): Promise<T | null> {
  try {
    const r = await fetchCourt(url, { delai })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}
