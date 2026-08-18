// 🚪 L'UNIQUE PORTE VERS /api/lieux.
//
// La règle architecturale de Mohamed (16 août) : « une seule source de
// vérité, aucun chemin parallèle ». Le test scripts/test-un-seul-chemin
// vérifie que la chaîne '/api/lieux' n'existe QUE dans ce fichier :
// SurMesure (la recherche) et SectionMagazine (le guide ville) passent
// tous les deux par cette porte — même corps, même moteur, mêmes règles.
export interface CorpsLieux {
  lat: number
  lng: number
  criteres: unknown
  lang: 'fr' | 'en'
  ecrit: boolean
  profil: unknown
}

export function appelerLieux(corps: CorpsLieux, signal?: AbortSignal): Promise<Response> {
  return fetch('/api/lieux', {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps),
  })
}
