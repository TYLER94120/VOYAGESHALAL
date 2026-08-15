import { notFound } from 'next/navigation'

// 🔍 MON RENDU À GAUCHE, LE MODÈLE À DROITE.
//
// Mohamed, 16 août : « Crée une page de comparaison accessible en
// développement : ton rendu à gauche, la maquette à droite. Tu verras tes
// écarts au lieu de les deviner. C'est ce qui t'a manqué aujourd'hui. »
//
// Il a raison, et c'est la leçon la plus utile de la journée : j'ai passé
// l'après-midi à décrire des écarts au lieu de les REGARDER.
//
// 🔒 Jamais en production : `notFound()` si NODE_ENV vaut 'production'.
// Une page de travail qui fuit sur le site public, c'est une porte ouverte
// sur nos brouillons.
export const dynamic = 'force-dynamic'

export default function Comparaison() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <main style={{ height: '100dvh', display: 'flex', background: '#080D1A' }}>
      <section style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,.2)', display: 'flex', flexDirection: 'column' }}>
        <p style={{ margin: 0, padding: '8px 12px', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '.1em' }}>MON RENDU</p>
        <iframe src="/" title="Mon rendu" style={{ flex: 1, width: '100%', border: 0, background: '#000' }} />
      </section>
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ margin: 0, padding: '8px 12px', color: '#E3A88F', fontSize: 13, fontWeight: 700, letterSpacing: '.1em' }}>LE MODÈLE</p>
        <iframe src="/maquette-cinq-ciels.html" title="La maquette" style={{ flex: 1, width: '100%', border: 0, background: '#000' }} />
      </section>
    </main>
  )
}
