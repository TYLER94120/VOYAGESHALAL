'use client'
import { useState } from 'react'

// ❓ LES PETITES QUESTIONS FACULTATIVES — le même principe que « t'as payé
// combien ? », étendu aux informations qui nous manquent le plus.
//
// POURQUOI CELLES-LÀ. Chaque question correspond à un trou mesuré dans nos
// données, pas à une curiosité :
//
//  · L'ALCOOL. « non alcoholic hotels dubai » est la requête n°1 de notre
//    site anglais, et sur nos 222 hôtels d'Istanbul et Dubaï nous n'avons
//    l'information pour AUCUN. Personne ne peut nous la donner, sauf
//    quelqu'un qui y est allé.
//  · COMMENT LE HALAL A ÉTÉ SU. Nous écrivons « signalé halal · à vérifier »
//    faute de mieux. Un certificat vu de ses yeux vaut mieux qu'un logo.
//  · UN ENDROIT POUR PRIER. Personne ne recense ça, et c'est exactement ce
//    que cherche un voyageur musulman.
//  · LES ABLUTIONS et l'espace femmes, sur un coin prière : les deux
//    questions qu'on se pose avant de s'y rendre.
//
// LES RÈGLES DE CONCEPTION, apprises du bouton prix :
//  1. Une seule question à l'écran. Un formulaire de six champs ne se
//     remplit jamais debout dans un café.
//  2. Tout est FACULTATIF : « je ne sais pas » est une réponse offerte, et
//     on peut fermer à tout moment. On ne bloque rien.
//  3. Une réponse = un tap. Jamais de saisie au clavier.
//  4. « Je ne sais pas » n'écrit RIEN dans la base. Pas de faux négatif :
//     ne pas savoir n'est pas répondre non.

interface Question {
  cle: string        // clé stockée (doit exister dans INFOS_VALIDES côté serveur)
  emoji: string
  fr: string
  en: string
  /** libellé du choix qui vaut « oui » (donc `true` en base) */
  ouiFr: string; ouiEn: string
  /** libellé du choix qui vaut « non » */
  nonFr: string; nonEn: string
  /** catégories de spot concernées */
  pour: string[]
}

const QUESTIONS: Question[] = [
  {
    cle: 'sans_alcool', emoji: '🍷',
    fr: 'De l’alcool est servi sur place ?', en: 'Is alcohol served there?',
    ouiFr: 'Non, aucun', ouiEn: 'No, none',
    nonFr: 'Oui, il y en a', nonEn: 'Yes, there is',
    pour: ['resto', 'pepite', 'autre'],
  },
  {
    cle: 'halal_signale', emoji: '✅',
    fr: 'Le halal est affiché sur place ?', en: 'Is halal displayed on site?',
    ouiFr: 'Oui, un certificat', ouiEn: 'Yes, a certificate',
    nonFr: 'Non, rien d’affiché', nonEn: 'No, nothing shown',
    pour: ['resto', 'boucherie'],
  },
  {
    cle: 'coin_priere_sur_place', emoji: '🕌',
    fr: 'Un endroit pour prier sur place ?', en: 'Somewhere to pray on site?',
    ouiFr: 'Oui', ouiEn: 'Yes',
    nonFr: 'Non', nonEn: 'No',
    pour: ['resto', 'pepite', 'autre'],
  },
  {
    cle: 'menu_enfant', emoji: '👨‍👩‍👧',
    fr: 'C’est adapté aux familles ?', en: 'Is it family-friendly?',
    ouiFr: 'Oui, avec enfants', ouiEn: 'Yes, with children',
    nonFr: 'Plutôt adultes', nonEn: 'Rather adults',
    pour: ['resto', 'pepite'],
  },
  {
    cle: 'ablutions_dispo', emoji: '💧',
    fr: 'On peut faire ses ablutions ?', en: 'Can you do wudu there?',
    ouiFr: 'Oui', ouiEn: 'Yes',
    nonFr: 'Non', nonEn: 'No',
    pour: ['coin_priere'],
  },
  {
    cle: 'hommes_femmes_separes', emoji: '🚻',
    fr: 'Espace femmes séparé ?', en: 'Separate women’s area?',
    ouiFr: 'Oui', ouiEn: 'Yes',
    nonFr: 'Non', nonEn: 'No',
    pour: ['coin_priere'],
  },
  {
    cle: 'tapis_propres', emoji: '🧎',
    fr: 'Des tapis sont fournis ?', en: 'Are prayer mats provided?',
    ouiFr: 'Oui', ouiEn: 'Yes',
    nonFr: 'Non, apporte le tien', nonEn: 'No, bring your own',
    pour: ['coin_priere'],
  },
]

export default function QcmSpot({
  spotId, categorie, en = false, dark = false, onFini,
}: { spotId: string; categorie?: string; en?: boolean; dark?: boolean; onFini?: () => void }) {
  const liste = QUESTIONS.filter((q) => !categorie || q.pour.includes(categorie))
  const [index, setIndex] = useState(0)
  const [repondues, setRepondues] = useState(0)
  const [ferme, setFerme] = useState(false)

  if (ferme || !liste.length || index >= liste.length) {
    if (repondues > 0 && (ferme || index >= liste.length)) {
      return (
        <p style={{ fontSize: 13, fontWeight: 700, color: dark ? 'var(--or-clair)' : 'var(--halal-tx)', margin: '10px 0 0' }}>
          ✓ {en
            ? `Thank you — ${repondues} answer${repondues > 1 ? 's' : ''} added to this place.`
            : `Merci — ${repondues} réponse${repondues > 1 ? 's' : ''} ajoutée${repondues > 1 ? 's' : ''} à ce lieu.`}
        </p>
      )
    }
    return null
  }

  const q = liste[index]
  const suivante = () => {
    if (index + 1 >= liste.length) onFini?.()
    setIndex((i) => i + 1)
  }

  const repondre = async (valeur: boolean) => {
    setRepondues((n) => n + 1)
    suivante()
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vh_token') : null
      // Écriture : volontairement sans délai maximum (voir lib/fetchCourt).
      await fetch('/api/community/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ spotId, infos: { [q.cle]: valeur } }),
      })
    } catch { /* la réponse suivante s'affiche quand même */ }
  }

  const fg = dark ? '#fdfaf3' : 'var(--foret)'
  const sub = dark ? 'rgba(253,250,243,0.6)' : 'var(--texte-2)'
  const bord = dark ? 'rgba(201,168,76,0.4)' : 'rgba(27,67,50,0.25)'
  const bouton: React.CSSProperties = {
    minHeight: 44, padding: '0 15px', borderRadius: 999, cursor: 'pointer',
    border: `1.5px solid ${bord}`, background: 'transparent', color: fg,
    fontWeight: 800, fontSize: 13.5,
  }

  return (
    <div style={{ margin: '12px 0 0', padding: '12px 14px', borderRadius: 14, border: `1px solid ${bord}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <p style={{ fontWeight: 800, fontSize: 14.5, color: fg, margin: 0 }}>{q.emoji} {en ? q.en : q.fr}</p>
        <span style={{ fontSize: 11.5, color: sub, whiteSpace: 'nowrap' }}>{index + 1}/{liste.length}</span>
      </div>
      <p style={{ fontSize: 12, color: sub, margin: '3px 0 9px' }}>
        {en ? 'Optional — helps the next traveller.' : 'Facultatif — ça aide le prochain voyageur.'}
      </p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        <button onClick={() => repondre(true)} style={bouton}>{en ? q.ouiEn : q.ouiFr}</button>
        <button onClick={() => repondre(false)} style={bouton}>{en ? q.nonEn : q.nonFr}</button>
        {/* « Je ne sais pas » n'écrit rien : ne pas savoir n'est pas répondre non. */}
        <button onClick={suivante} style={{ ...bouton, border: 'none', color: sub, fontWeight: 700 }}>
          {en ? 'I don’t know' : 'Je ne sais pas'}
        </button>
        <button onClick={() => setFerme(true)} style={{ ...bouton, border: 'none', color: sub, fontWeight: 700 }}>
          {en ? 'Stop' : 'Arrêter'}
        </button>
      </div>
    </div>
  )
}
