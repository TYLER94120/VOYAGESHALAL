'use client'
import { useRouter } from 'next/navigation'

// ‹ RETOUR — la pile de navigation RÉELLE (correction 5 du 18 août :
// « pour revenir à la section précédente il faut retaper Accueil »).
//
// Le bouton suit l'historique du navigateur (router.back()), donc le geste
// de retour du téléphone et ce bouton font exactement la même chose — pas
// un retour codé en dur vers l'accueil. Deux exceptions honnêtes :
// - arrivée directe sur la page (lien partagé, Google) : il n'y a rien
//   derrière, on va à l'accueil plutôt que de sortir du site ;
// - un panneau/tiroir ouvert se ferme d'abord — c'est le panneau Outils
//   qui pousse sa propre entrée d'historique, donc back() le ferme seul.
export default function BoutonRetour({ libelle = 'Retour', clair = false }: { libelle?: string; clair?: boolean }) {
  const router = useRouter()
  return (
    <button
      type="button"
      aria-label={`Revenir : ${libelle}`}
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back()
        else router.push('/')
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2, minWidth: 56, minHeight: 56,
        padding: '0 10px', border: 'none', background: 'none', cursor: 'pointer',
        color: clair ? 'var(--foret, #1B4332)' : 'var(--or, #C9A84C)', fontSize: 15, fontWeight: 600, borderRadius: 14,
      }}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 19 8 12l7-7" />
      </svg>
      {libelle}
    </button>
  )
}
