'use client'
import { useEffect } from 'react'

// 🛟 LE FILET — PARCE QU'UN ÉCRAN BLANC N'EST JAMAIS UNE RÉPONSE.
//
// Mohamed, 21 août, capture à l'appui : un tap sur « Sushi » et l'écran
// devient vide. Pas un message, pas un bouton : du blanc, avec la barre du
// haut et celle du bas restées en place.
//
// La cause profonde est un défaut à corriger, et il le sera. Mais la cause
// de l'ÉCRAN BLANC, elle, était l'absence de ce fichier : sans limite
// d'erreur, la moindre exception dans un composant vide la page et laisse
// la personne devant rien. Quelqu'un qui cherche où prier ou où manger, à
// l'étranger, avec une barre de batterie qui descend, mérite au minimum de
// savoir qu'il peut réessayer.
//
// Ce que ce filet fait, dans l'ordre :
//   1. il affiche quelque chose d'honnête, dans le noir du site ;
//   2. il donne deux issues réelles — réessayer, ou revenir à l'accueil ;
//   3. il envoie l'erreur au serveur pour qu'on puisse la LIRE. Un défaut
//      qu'on ne voit pas est un défaut qui reste.
export default function Erreur({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Jamais bloquant, jamais bruyant : si le signalement échoue, la page
    // reste utilisable.
    try {
      fetch('/api/erreur-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: String(error?.message ?? '').slice(0, 300),
          digest: error?.digest ?? null,
          chemin: typeof window !== 'undefined' ? window.location.pathname + window.location.search : null,
          pile: String(error?.stack ?? '').split('\n').slice(0, 6).join(' | ').slice(0, 600),
        }),
        keepalive: true,
      }).catch(() => {})
    } catch { /* on n'ajoute pas une erreur à une erreur */ }
  }, [error])

  return (
    <div style={{
      minHeight: '70svh', background: '#060E08', color: '#FDFAF3',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '32px 20px', textAlign: 'center',
    }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, margin: 0 }}>
        Cet écran n&apos;a pas pu s&apos;afficher
      </h1>
      <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'rgba(253,250,243,0.8)', margin: 0, maxWidth: 380 }}>
        Le défaut vient de nous, pas de toi. Il est enregistré et il sera corrigé.
        En attendant, réessaie — le reste du site fonctionne.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
        <button onClick={() => reset()} style={{
          minHeight: 56, padding: '0 22px', borderRadius: 999, border: 'none',
          background: 'linear-gradient(135deg,#D9BE6C,#C9A84C)', color: '#0A1509',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>Réessayer</button>
        <a href="/" style={{
          minHeight: 56, padding: '0 22px', borderRadius: 999, display: 'inline-flex', alignItems: 'center',
          border: '1px solid rgba(201,168,76,0.4)', color: '#FDFAF3', fontSize: 16, fontWeight: 600, textDecoration: 'none',
        }}>Retour à l&apos;accueil</a>
      </div>
    </div>
  )
}
