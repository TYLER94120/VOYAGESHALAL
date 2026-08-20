import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'
import { titreSeo } from '@/lib/titre-seo'
import { computePrayerTimes } from '@/lib/prayerCalc'
import { getDomainSEO, EN_URL } from '@/lib/domain'
import cityCoords from '@/lib/cityCoords.json'

// ✈️ PRAYER ROOM AT {AIRPORT} — la stratégie anglaise du 20 août.
//
// « Halal travel guide » est hors de portée (HalalBooking, HalalTrip,
// CrescentRating y sont depuis dix ans). L'hyper-précis est vide, et un
// aéroport est cherché EN ANGLAIS par tous les musulmans du monde : un
// Malaisien à Heathrow, un Turc à Schiphol, un Marocain à JFK.
//
// CE QUE CETTE PAGE PROMET, ET RIEN DE PLUS. Le brief demandait le
// terminal, le niveau et le temps de marche depuis les portes. Ces trois
// champs n'existent que s'ils sont RELEVÉS dans OpenStreetMap
// (scripts/osm-aeroports.mjs). Quand ils manquent, la page le dit — « not
// recorded in the map data » — au lieu d'envoyer quelqu'un chercher une
// salle au mauvais étage avec un avion à prendre. On n'invente jamais une
// salle de prière.
//
// Ce qui est TOUJOURS juste, parce que calculé : les horaires de prière du
// jour aux coordonnées de l'aéroport, et la direction de la Qibla.
//
// Aucun aéroport relevé = aucune page publiée, aucun lien mort.

export const dynamicParams = false
export const revalidate = 3600

interface Salle {
  id: string; lat: number; lng: number; nom?: string; niveau?: string; terminal?: string
  horaires?: string; acces?: string; mixite?: string; ablutions?: string
  type: 'prayer_room' | 'multifaith_room' | 'mosque'; indoor?: boolean
}
interface Aeroport {
  iata: string; slug: string; nom: string; lat: number; lng: number
  pays?: string | null; osmId?: string; lieux: Salle[]; releve?: string
}

function lireBase(): Aeroport[] {
  try {
    const j = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'airports', 'prayer-rooms.json'), 'utf8'))
    return ((j.aeroports ?? []) as Aeroport[]).filter(estPubliable)
  } catch { return [] }
}

/** 🚧 LE SEUIL DE PUBLICATION — mesuré le 20 août, après le premier relevé.
 *  OpenStreetMap ne connaît AUCUNE salle de prière à l'intérieur des dix
 *  terminaux ciblés : le lieu le plus proche est à 1,3 km (Dubaï, KLIA),
 *  et Changi, JFK et Schiphol n'ont rien à moins de 3 km. Une page qui
 *  s'appelle « prayer room » sans savoir où prier dans l'aéroport ne
 *  répond pas à la question posée — elle ne doit pas exister.
 *
 *  Une page n'est donc publiée que si elle a de quoi répondre : une salle
 *  relevée dans l'enceinte, ou au moins un lieu de prière à 3 km. Le jour
 *  où un contributeur cartographie la salle du Terminal 2, le relevé
 *  mensuel la ramasse et la page se remplit toute seule. */
export function estPubliable(a: Aeroport): boolean {
  if (a.lieux.some((l) => l.type !== 'mosque')) return true
  return a.lieux.some((l) => distM(a.lat, a.lng, l.lat, l.lng) <= 3000)
}
const lire = (slug: string) => lireBase().find((a) => a.slug === slug) ?? null

export async function generateStaticParams() {
  return lireBase().map((a) => ({ airport: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ airport: string }> }): Promise<Metadata> {
  const { airport } = await params
  const a = lire(airport)
  if (!a) return {}
  const salles = a.lieux.filter((l) => l.type !== 'mosque').length
  // Le besoin d'abord, un chiffre compté, moins de 60 caractères.
  // Le titre ne promet une salle que s'il y en a une de relevée. Sans
  // salle, la page répond quand même à la question — « où prier » — avec
  // les lieux les plus proches, les horaires et la Qibla.
  const proches = a.lieux.filter((l) => distM(a.lat, a.lng, l.lat, l.lng) <= 3000).length
  const title = salles > 0
    ? titreSeo([
        `Prayer room ${a.nom}: ${salles} rooms and prayer times`,
        `Prayer room ${a.nom}: ${salles} rooms`,
        `Prayer room ${a.nom} (${a.iata})`,
        `Prayer room ${a.iata}`,
      ])
    : titreSeo([
        `Where to pray at ${a.nom}: ${proches} place${proches > 1 ? 's' : ''} within 3 km`,
        `Where to pray at ${a.nom} (${a.iata})`,
        `Where to pray at ${a.iata}`,
      ])
  return {
    title: { absolute: title },
    description: (salles > 0
      ? `Prayer facilities recorded at ${a.nom} (${a.iata}), today's prayer times and the Qibla. Source shown. Free, no account.`
      : `Prayer places closest to ${a.nom} (${a.iata}), today's prayer times for the airport and the Qibla. Source shown. Free, no account.`).slice(0, 155),
    alternates: { canonical: `${EN_URL}/prayer-room/${a.slug}` },
    openGraph: { title, url: `${EN_URL}/prayer-room/${a.slug}` },
  }
}

/** Direction de la Qibla, en degrés depuis le nord — formule du grand
 *  cercle vers la Kaaba (21,4225 N / 39,8262 E). */
function qibla(lat: number, lng: number): number {
  const r = Math.PI / 180
  const dL = (39.8262 - lng) * r
  const y = Math.sin(dL)
  const x = Math.cos(lat * r) * Math.tan(21.4225 * r) - Math.sin(lat * r) * Math.cos(dL)
  return Math.round(((Math.atan2(y, x) / r) + 360) % 360)
}

const distM = (a: number, b: number, c: number, d: number) => {
  const dx = (d - b) * Math.cos(((a + c) / 2 * Math.PI) / 180) * 111320
  const dy = (c - a) * 110570
  return Math.round(Math.sqrt(dx * dx + dy * dy))
}

export default async function PrayerRoomPage({ params }: { params: Promise<{ airport: string }> }) {
  const { airport } = await params
  const a = lire(airport)
  if (!a) notFound()
  const { siteUrl } = await getDomainSEO()

  // Les horaires du jour AUX COORDONNÉES DE L'AÉROPORT (méthode Ligue
  // islamique mondiale, école Shafi) — calculés, donc jamais faux d'un
  // fuseau. Affichés en UTC : un voyageur en transit lit l'heure locale
  // sur son billet, et une heure fausse serait pire que pas d'heure.
  const t = computePrayerTimes(a.lat, a.lng, 3, 0)
  const heure = (d: Date) => d.toISOString().slice(11, 16)

  const salles = a.lieux.filter((l) => l.type !== 'mosque')
  const mosquees = a.lieux.filter((l) => l.type === 'mosque')
  const villeProche = (cityCoords as { slug: string; nom: string; lat?: number; lng?: number }[])
    .filter((c) => c.lat != null && c.lng != null)
    .map((c) => ({ ...c, d: distM(a.lat, a.lng, c.lat!, c.lng!) }))
    .sort((x, y) => x.d - y.d)[0]

  const label = (s: Salle) =>
    s.type === 'prayer_room' ? 'Prayer room' : s.type === 'multifaith_room' ? 'Multi-faith room' : 'Mosque'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Airport',
        name: a.nom,
        iataCode: a.iata,
        url: `${siteUrl}/prayer-room/${a.slug}`,
        geo: { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng },
        // Le balisage ne décrit que ce que la page affiche vraiment.
        ...(salles.length ? { amenityFeature: salles.map((s) => ({
          '@type': 'LocationFeatureSpecification', name: s.nom ?? label(s), value: true,
        })) } : {}),
      }) }} />

      <section className="sv">
        <div className="sv-in">
          <h1 className="sv-h1">
            {salles.length > 0 ? `Prayer room at ${a.nom} (${a.iata})` : `Where to pray at ${a.nom} (${a.iata})`}
          </h1>

          <p className="sv-p">
            {salles.length > 0
              ? `${salles.length} prayer facilit${salles.length > 1 ? 'ies are' : 'y is'} recorded inside ${a.nom}. Each entry below shows only what the map data actually says — where a terminal or a floor is missing, it is missing because nobody has recorded it, not because we guessed.`
              : `Open map data records no prayer room inside the terminals at ${a.nom}. That does not mean there is none — airports rarely map their own quiet rooms — it means we will not describe one we cannot show you, with a plane to catch. What follows is what we can stand behind: the prayer places closest to the airport, today's prayer times computed for its coordinates, and the Qibla.`}
          </p>

          {salles.length > 0 && (
            <>
              <h2 className="sv-h2">Where the rooms are</h2>
              <ul className="sv-liste">
                {salles.map((s) => (
                  <li key={s.id}>
                    <strong>{s.nom ?? label(s)}</strong>
                    <span className="sv-gris">
                      {' · '}{label(s)}
                      {s.terminal ? ` · Terminal ${s.terminal}` : ''}
                      {s.niveau ? ` · Level ${s.niveau}` : ''}
                      {s.horaires ? ` · ${s.horaires}` : ''}
                      {s.acces ? ` · access: ${s.acces}` : ''}
                      {s.ablutions ? ' · wudu facilities recorded' : ''}
                      {!s.terminal && !s.niveau ? ' · terminal and floor not recorded — ask at the information desk' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="sv-h2">Prayer times at {a.iata} today</h2>
          <p className="sv-p">
            Computed for the airport&apos;s own coordinates (Muslim World League method), shown in UTC —
            check your boarding pass for local time.
          </p>
          <dl className="sv-faits">
            <dt>Fajr</dt><dd>{heure(t.Fajr)} UTC</dd>
            <dt>Dhuhr</dt><dd>{heure(t.Dhuhr)} UTC</dd>
            <dt>Asr</dt><dd>{heure(t.Asr)} UTC</dd>
            <dt>Maghrib</dt><dd>{heure(t.Maghrib)} UTC</dd>
            <dt>Isha</dt><dd>{heure(t.Isha)} UTC</dd>
            <dt>Qibla</dt><dd>{qibla(a.lat, a.lng)}° from true north</dd>
          </dl>

          {mosquees.length > 0 && (
            <>
              <h2 className="sv-h2">Prayer places closest to the airport</h2>
              <p className="sv-p">Distances are straight-line from the airport centre — not walking distance.</p>
              <ul className="sv-liste">
                {mosquees.slice(0, 10).map((m) => (
                  <li key={m.id}>
                    {m.nom ?? 'Place of worship (name not recorded)'}
                    <span className="sv-gris"> · {(distM(a.lat, a.lng, m.lat, m.lng) / 1000).toFixed(1)} km as the crow flies</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="sv-h2">Keep going</h2>
          <ul className="sv-liens">
            <li><Link href="/autour-de-moi">Prayer places around me</Link></li>
            <li><Link href="/qibla">Qibla direction from where you stand</Link></li>
            <li><Link href="/prayer-times">Prayer times anywhere</Link></li>
            {villeProche && <li><Link href={`/destinations/${villeProche.slug}`}>Where to pray in {villeProche.nom}</Link></li>}
          </ul>

          <p className="sv-source">
            Prayer facilities: data © OpenStreetMap contributors (ODbL){a.releve ? `, recorded ${a.releve}` : ''}.
            Prayer times and Qibla: computed from the airport coordinates.
          </p>
        </div>
      </section>
    </>
  )
}
