import type { Ville } from '@/lib/villeTypes'

export interface FaqItem { q: string; a: string }

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
}

// Source UNIQUE des questions/réponses FAQ d'une ville : utilisée à la fois pour
// le JSON-LD FAQPage (SchemaOrg) ET pour la FAQ VISIBLE sur la page. Google exige
// que le contenu du schéma corresponde au contenu affiché → une seule fonction.
export function buildVilleFaq(ville: Ville, en: boolean): FaqItem[] {
  const nom = ville.nom
  const score = ville.score_halal
  const mosq = ville.statistiques?.mosquees
  const restos = ville.statistiques?.restaurants_halal ?? ville.restaurants?.length
  const periode = ville.infos_pratiques?.meilleure_periode
  const topRestos = (ville.restaurants ?? []).slice(0, 3).map((r) => r.nom).filter(Boolean)
  const nfEn = (n?: number) => (typeof n === 'number' ? n.toLocaleString('en-US') : null)
  const nfFr = (n?: number) => (typeof n === 'number' ? n.toLocaleString('fr-FR') : null)

  if (en) {
    const items: FaqItem[] = [
      { q: `Is the food halal in ${nom}?`, a: `${nom} has a halal score of ${score}/5. ${descText(ville).slice(0, 200)}`.trim() },
      { q: `Where can I find a mosque in ${nom}?`, a: `${nom} has ${nfEn(mosq) ?? 'several'} mosques. Our guide lists the main ones with their addresses and prayer times.` },
      { q: `What are the prayer times in ${nom}?`, a: `Prayer times in ${nom} change with the season. Use the real-time widget on this page for Fajr, Dhuhr, Asr, Maghrib and Isha.` },
    ]
    if (restos) items.push({ q: `Are there many halal restaurants in ${nom}?`, a: `Yes — ${nfEn(restos)}${topRestos.length ? `, including ${topRestos.join(', ')}` : ''}. Each listing shows its location and a halal-confidence level.` })
    if (periode) items.push({ q: `When is the best time to visit ${nom}?`, a: `The best time to visit ${nom} is ${periode}.` })
    return items
  }

  const items: FaqItem[] = [
    { q: `La nourriture est-elle halal à ${nom} ?`, a: `${nom} affiche un score halal de ${score}/5. ${descText(ville).slice(0, 200)}`.trim() },
    { q: `Où trouver une mosquée à ${nom} ?`, a: `${nom} compte ${nfFr(mosq) ?? 'plusieurs'} mosquées. Notre guide liste les principales avec leurs adresses et leurs horaires.` },
    { q: `Quelles sont les heures de prière à ${nom} ?`, a: `Les horaires de prière à ${nom} varient selon la saison. Utilisez le widget en temps réel sur cette page pour Fajr, Dhuhr, Asr, Maghrib et Isha.` },
  ]
  if (restos) items.push({ q: `Y a-t-il beaucoup de restaurants halal à ${nom} ?`, a: `Oui — ${nfFr(restos)}${topRestos.length ? `, dont ${topRestos.join(', ')}` : ''}. Chaque adresse indique sa localisation et un niveau de confiance halal.` })
  if (periode) items.push({ q: `Quelle est la meilleure période pour visiter ${nom} ?`, a: `La meilleure période pour visiter ${nom} est ${periode}.` })
  return items
}
