import { NextResponse } from 'next/server'

// 📷 LES PHOTOS DES LIEUX, SERVIES SANS EXPOSER LA CLÉ.
//
// Une photo Google Places s'obtient avec une URL qui contient la clé
// d'API. La mettre dans la page reviendrait à la publier : une clé dans
// le navigateur est volée le jour même, et c'est le budget de Mohamed qui
// paie les appels du voleur. Le navigateur demande donc la photo À NOUS,
// et nous seuls parlons à Google.
//
// On ne renvoie pas l'image nous-mêmes : Google répond par une redirection
// vers son serveur d'images, et on la laisse passer. Le navigateur charge
// l'image directement chez eux — pas de bande passante consommée ici.
//
// ⚠️ ATTRIBUTION : les conditions de Google imposent d'afficher l'auteur
// de la photo. Le nom est renvoyé par /api/lieux dans `attributionsPhotos`
// et affiché sous la carte. On ne prend pas ce risque pour Mohamed.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DELAI = 4000
const LARGEUR_MAX = 800

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ref = searchParams.get('ref') ?? ''
  // La référence a toujours la forme « places/XXX/photos/YYY » : on refuse
  // tout le reste, pour ne pas devenir un relais vers n'importe quelle URL.
  if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(ref)) {
    return NextResponse.json({ erreur: 'référence invalide' }, { status: 400 })
  }
  const cle = process.env.GOOGLE_PLACES_KEY
  if (!cle) return NextResponse.json({ erreur: 'pas de clé' }, { status: 503 })

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch(
      `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${LARGEUR_MAX}&skipHttpRedirect=true&key=${cle}`,
      { signal: ac.signal },
    )
    if (!r.ok) return NextResponse.json({ erreur: 'photo indisponible' }, { status: 502 })
    const j = await r.json() as { photoUri?: string }
    if (!j.photoUri) return NextResponse.json({ erreur: 'photo indisponible' }, { status: 502 })
    // Une journée de cache : la photo d'un restaurant ne change pas d'heure
    // en heure, et chaque appel évité est un appel non facturé.
    return NextResponse.redirect(j.photoUri, {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=86400' },
    })
  } catch {
    return NextResponse.json({ erreur: 'photo indisponible' }, { status: 502 })
  } finally { clearTimeout(t) }
}
