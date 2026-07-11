import type { Ville } from '@/lib/villeTypes'

export interface FaqItem { q: string; a: string }

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
}

// Source UNIQUE des questions/réponses FAQ d'une ville : utilisée à la fois pour
// le JSON-LD FAQPage (SchemaOrg) ET pour la FAQ VISIBLE sur la page. Google exige
// que le contenu du schéma corresponde au contenu affiché → une seule fonction.
//
// Les compteurs proviennent des LISTES RÉELLEMENT AFFICHÉES (restaurants /
// mosqueesPrincipales), les mêmes que les onglets de l'en-tête → aucune
// contradiction en-tête ↔ FAQ. Pluriel géré (« 1 mosquée » / « X mosquées »).
export function buildVilleFaq(ville: Ville, en: boolean): FaqItem[] {
  const nom = ville.nom
  const score = ville.score_halal
  const mosqCount = ville.mosqueesPrincipales?.length ?? 0
  const restoCount = ville.restaurants?.length ?? 0
  const periode = ville.infos_pratiques?.meilleure_periode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodeEn = (ville as any).infos_pratiques_en?.meilleure_periode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const descEn = (ville as any).description_en as string | undefined
  const topRestos = (ville.restaurants ?? []).slice(0, 3).map((r) => r.nom).filter(Boolean)

  // « 1 mosque » / « 3 mosques » — « 1 restaurant » / « 15 restaurants »
  const plEn = (n: number, s: string) => `${n.toLocaleString('en-US')} ${s}${n > 1 ? 's' : ''}`
  const plFr = (n: number, s: string) => `${n.toLocaleString('fr-FR')} ${s}${n > 1 ? 's' : ''}`

  if (en) {
    const mosqTxt = mosqCount > 0 ? plEn(mosqCount, 'mosque') : 'several mosques'
    const items: FaqItem[] = [
      { q: `Is the food halal in ${nom}?`, a: `${nom} has a halal score of ${score}/5. ${(descEn ?? '').slice(0, 200)}`.trim() },
      { q: `Where can I find a mosque in ${nom}?`, a: `${nom} has ${mosqTxt}. Our guide lists the main ones with their addresses and prayer times.` },
      { q: `What are the prayer times in ${nom}?`, a: `Prayer times in ${nom} change with the season. Use the real-time widget on this page for Fajr, Dhuhr, Asr, Maghrib and Isha.` },
    ]
    if (restoCount > 0) items.push({ q: `Are there many halal restaurants in ${nom}?`, a: `We list ${restoCount.toLocaleString('en-US')} halal restaurant${restoCount > 1 ? 's' : ''}${topRestos.length ? `, including ${topRestos.join(', ')}` : ''}. Each listing shows its location and a halal-confidence level.` })
    if (periodeEn) items.push({ q: `When is the best time to visit ${nom}?`, a: `The best time to visit ${nom} is ${periodeEn}.` })
    return items
  }

  const mosqTxt = mosqCount > 0 ? plFr(mosqCount, 'mosquée') : 'plusieurs mosquées'
  const items: FaqItem[] = [
    { q: `La nourriture est-elle halal à ${nom} ?`, a: `${nom} affiche un score halal de ${score}/5. ${descText(ville).slice(0, 200)}`.trim() },
    { q: `Où trouver une mosquée à ${nom} ?`, a: `Notre guide recense ${mosqTxt} à ${nom}, avec leurs adresses et leurs horaires.` },
    { q: `Quelles sont les heures de prière à ${nom} ?`, a: `Les horaires de prière à ${nom} varient selon la saison. Utilisez le widget en temps réel sur cette page pour Fajr, Dhuhr, Asr, Maghrib et Isha.` },
  ]
  if (restoCount > 0) items.push({ q: `Y a-t-il beaucoup de restaurants halal à ${nom} ?`, a: `Nous listons ${restoCount.toLocaleString('fr-FR')} restaurant${restoCount > 1 ? 's' : ''} halal${topRestos.length ? `, dont ${topRestos.join(', ')}` : ''}. Chaque adresse indique sa localisation et un niveau de confiance halal.` })
  if (periode) items.push({ q: `Quelle est la meilleure période pour visiter ${nom} ?`, a: `La meilleure période pour visiter ${nom} est ${periode}.` })
  return items
}
