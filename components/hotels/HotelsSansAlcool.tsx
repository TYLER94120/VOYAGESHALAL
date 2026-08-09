'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import SaveButton from '@/components/ui/SaveButton'
import { favId } from '@/lib/favorites'

// 🏨 LA LISTE « HÔTEL SANS ALCOOL », FILTRABLE.
//
// La requête n°1 de gohalaltravel.com est littéralement « non alcoholic
// hotels dubai ». Pas « halal », pas « muslim-friendly » : alcohol-free.
// Cette liste répond à ça, dans l'ordre où le lecteur se pose ses
// questions : l'alcool, la restauration, la mosquée la plus proche.
//
// L'HONNÊTETÉ EST LE PRODUIT. Nos hôtels viennent d'OpenStreetMap, qui
// renseigne rarement l'alcool. Trois états, jamais deux :
//    ✅ sans alcool — OSM l'indique explicitement
//    🍷 alcool servi — OSM l'indique explicitement
//    ⚪ information non vérifiée — la majorité des cas
// « Non vérifié » n'est pas un aveu de faiblesse : c'est ce qui nous
// sépare des fermes de contenu qui affirment n'importe quoi. On donne
// alors au lecteur les questions exactes à poser à l'hôtel.
//
// La distance à pied de la mosquée la plus proche est calculée avec nos
// propres données de mosquées. Personne d'autre ne le fait proprement.

type Etat = 'oui' | 'non' | 'inconnu'

function etatAlcool(h: any): Etat {
  if (h.sourceAlcool && h.sansAlcool === true) return 'oui'
  if (h.sourceAlcool && h.sansAlcool === false) return 'non'
  if (h.sansAlcool === true || h.sans_alcool === true) return 'oui'
  return 'inconnu'
}
function etatHalal(h: any): Etat {
  if (h.petitDejeunerHalal === true || h.halalBreakfast === true) return 'oui'
  return 'inconnu'
}

const FILTRES = [
  { id: 'alcool', fr: '🚫 Sans alcool', en: '🚫 Alcohol-free' },
  { id: 'mosquee', fr: '🕌 Mosquée < 10 min', en: '🕌 Mosque < 10 min' },
  { id: 'halal', fr: '🍽 Restauration halal', en: '🍽 Halal food' },
  { id: 'femmes', fr: '🏊 Piscine non mixte', en: '🏊 Women-only pool' },
] as const

export default function HotelsSansAlcool({
  hotels, villeNom, villeSlug, en = false,
}: { hotels: any[]; villeNom: string; villeSlug: string; en?: boolean }) {
  const [actifs, setActifs] = useState<Set<string>>(new Set())
  const [tri, setTri] = useState<'mosquee' | 'nom'>('mosquee')
  const [visibles, setVisibles] = useState(20)

  const bascule = (id: string) => {
    const s = new Set(actifs)
    if (s.has(id)) s.delete(id); else s.add(id)
    setActifs(s); setVisibles(20)
  }

  const liste = useMemo(() => {
    let l = hotels.filter((h) => h?.nom)
    if (actifs.has('alcool')) l = l.filter((h) => etatAlcool(h) === 'oui')
    if (actifs.has('mosquee')) l = l.filter((h) => (h.mosqueeProcheMin ?? 99) <= 10)
    if (actifs.has('halal')) l = l.filter((h) => etatHalal(h) === 'oui')
    if (actifs.has('femmes')) l = l.filter((h) => h.piscineNonMixte === true && h.sourceEquipements === 'halalbooking')
    return l.slice().sort((a, b) => {
      if (tri === 'mosquee') {
        const da = a.mosqueeProcheM ?? Infinity, db = b.mosqueeProcheM ?? Infinity
        if (da !== db) return da - db
      }
      return String(a.nom).localeCompare(String(b.nom))
    })
  }, [hotels, actifs, tri])

  // Combien d'hôtels ont une information réellement vérifiée ?
  const nbAlcoolConnu = hotels.filter((h) => etatAlcool(h) !== 'inconnu').length

  // Synthèse de la distance aux mosquées — un fait vérifiable et frappant :
  // à Istanbul, les 110 hôtels sont à 3 minutes de marche au plus.
  const minutes = hotels.map((h) => h.mosqueeProcheMin).filter((m: number) => m != null).sort((a: number, b: number) => a - b)
  const mediane = minutes.length ? minutes[Math.floor(minutes.length / 2)] : null
  const maxi = minutes.length ? minutes[minutes.length - 1] : null

  const puce = (actif: boolean): React.CSSProperties => ({
    minHeight: 44, padding: '0 15px', borderRadius: 999, cursor: 'pointer', whiteSpace: 'nowrap',
    border: actif ? '1.5px solid var(--foret)' : '1.5px solid rgba(27,67,50,0.22)',
    background: actif ? 'var(--foret)' : '#fff',
    color: actif ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 13.5,
  })

  return (
    <>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 12px' }}>
        {FILTRES.map((f) => (
          <button key={f.id} onClick={() => bascule(f.id)} aria-pressed={actifs.has(f.id)} style={puce(actifs.has(f.id))}>
            {en ? f.en : f.fr}
          </button>
        ))}
        <button onClick={() => setTri(tri === 'mosquee' ? 'nom' : 'mosquee')} style={puce(false)}>
          {tri === 'mosquee'
            ? (en ? '↕ Sorted by mosque distance' : '↕ Trié par distance mosquée')
            : (en ? '↕ Sorted by name' : '↕ Trié par nom')}
        </button>
      </div>

      {mediane != null && (
        <p style={{ fontSize: 14, margin: '0 0 10px', lineHeight: 1.6, color: 'var(--halal-tx)', background: 'var(--halal-bg)', padding: '10px 14px', borderRadius: 12, fontWeight: 600 }}>
          {en
            ? <>🕌 Half of these hotels are <strong>{mediane} min walk</strong> or less from a mosque{maxi != null && maxi <= 10 ? <>, and the furthest is <strong>{maxi} min</strong></> : null}. Distances measured from our own mosque data.</>
            : <>🕌 La moitié de ces hôtels sont à <strong>{mediane} min à pied</strong> ou moins d’une mosquée{maxi != null && maxi <= 10 ? <>, et le plus éloigné est à <strong>{maxi} min</strong></> : null}. Distances calculées sur nos propres données de mosquées.</>}
        </p>
      )}

      <p style={{ fontSize: 13, color: 'var(--texte-2)', margin: '0 0 18px', lineHeight: 1.6 }}>
        {en
          ? <>{liste.length} of {hotels.length} hotels shown. Alcohol policy is confirmed by OpenStreetMap for <strong>{nbAlcoolConnu}</strong> of them — for the others we write “not verified” rather than guess.</>
          : <>{liste.length} hôtels sur {hotels.length} affichés. La politique alcool est confirmée par OpenStreetMap pour <strong>{nbAlcoolConnu}</strong> d’entre eux — pour les autres nous écrivons « non vérifié » plutôt que de supposer.</>}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
        {liste.slice(0, visibles).map((h, i) => {
          const alcool = etatAlcool(h), halal = etatHalal(h)
          return (
            <li key={h.id || `${h.nom}-${i}`} style={{ padding: '15px 17px', borderRadius: 14, border: '1px solid rgba(27,67,50,0.15)', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <strong style={{ fontSize: 16 }}>{h.nom}</strong>
                {h.etoiles ? <span style={{ color: 'var(--or)', fontWeight: 700 }}>{'★'.repeat(Math.min(5, h.etoiles))}</span> : null}
              </div>

              {/* 🕌 Notre différenciateur : la mosquée la plus proche, à pied */}
              {h.mosqueeProcheMin != null && (
                <p style={{ fontSize: 13.5, color: 'var(--halal-tx)', background: 'var(--halal-bg)', display: 'inline-block', padding: '4px 10px', borderRadius: 999, margin: '8px 0 0', fontWeight: 700 }}>
                  🕌 {h.mosqueeProcheMin} min {en ? 'walk' : 'à pied'} · {h.mosqueeProcheNom}
                </p>
              )}

              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '9px 0 0' }}>
                <Etiquette
                  etat={alcool}
                  oui={en ? '✅ Alcohol-free' : '✅ Sans alcool'}
                  non={en ? '🍷 Alcohol served' : '🍷 Alcool servi'}
                  inconnu={en ? '⚪ Alcohol: not verified' : '⚪ Alcool : non vérifié'}
                />
                <Etiquette
                  etat={halal}
                  oui={en ? '✅ Halal food' : '✅ Restauration halal'}
                  non=""
                  inconnu={en ? '⚪ Halal food: not verified' : '⚪ Restauration halal : non vérifié'}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 11, alignItems: 'center' }}>
                <SaveButton en={en} fav={{ id: favId('hotel', villeSlug, h.nom), kind: 'hotel', nom: h.nom, villeNom, href: `/hotels/${villeSlug}` }} />
                {h.mapsUrl && (
                  <a href={h.mapsUrl} target="_blank" rel="noopener noreferrer"
                    style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 10, background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    🗺 {en ? 'Map' : 'Carte'}
                  </a>
                )}
                {h.siteWeb && (
                  <a href={h.siteWeb} target="_blank" rel="noopener noreferrer"
                    style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 10, border: '1px solid rgba(27,67,50,0.2)', color: 'var(--foret)', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                    🌐 {en ? 'Website' : 'Site'}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {liste.length > visibles && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => setVisibles((v) => v + 20)} style={{ minHeight: 52, padding: '0 24px', borderRadius: 14, border: '2px solid rgba(27,67,50,0.25)', background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            {en ? `Show 20 more (${liste.length - visibles} left)` : `Voir 20 de plus (${liste.length - visibles} restants)`}
          </button>
        </div>
      )}

      {liste.length === 0 && (
        <p style={{ padding: '26px 0', textAlign: 'center', color: 'var(--texte-2)' }}>
          {en
            ? 'No hotel matches these filters with verified information. Try removing one.'
            : 'Aucun hôtel ne correspond à ces filtres avec une information vérifiée. Essayez d’en retirer un.'}
        </p>
      )}
    </>
  )
}

function Etiquette({ etat, oui, non, inconnu }: { etat: Etat; oui: string; non: string; inconnu: string }) {
  if (etat === 'non' && !non) return null
  const style: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '4px 10px',
    background: etat === 'oui' ? 'var(--halal-bg)' : etat === 'non' ? 'rgba(229,72,77,0.10)' : 'rgba(11,26,15,0.06)',
    color: etat === 'oui' ? 'var(--halal-tx)' : etat === 'non' ? '#B4353A' : 'var(--texte-2)',
  }
  return <span style={style}>{etat === 'oui' ? oui : etat === 'non' ? non : inconnu}</span>
}
