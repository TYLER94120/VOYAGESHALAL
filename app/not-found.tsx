import type { Metadata } from 'next'
import Contenu404 from '@/components/erreur/Contenu404'

// 🚧 LA PAGE QUI N'EXISTE PAS — mais qui doit quand même mener quelque part.
//
// Mohamed, 22 août, capture à l'appui : gohalaltravel.com/accueil-gohalal-travel
// rend « 404 · This page could not be found. » — le 404 d'usine de Next.js.
// Une page blanche avec une barre verticale, en anglais sur les DEUX
// domaines, et aucun lien : ni retour, ni suggestion, ni recherche.
//
// Ce n'est pas un cas de bord. Vingt et une routes du site appellent
// `notFound()` : une ville inconnue, un spot retiré, un article renommé, un
// plan expiré. Chacune amenait ici, c'est-à-dire nulle part. C'est
// exactement la règle « un bouton sans destination n'existe pas », vue de
// l'autre côté : une adresse sans issue n'existe pas non plus.
//
// ⚠️ Ce que cette page ne fait PAS : deviner ce que la personne cherchait.
// L'adresse tapée peut être n'importe quoi ; proposer « vous vouliez sans
// doute Istanbul ? » serait inventer. On dit ce qu'on sait — la page
// n'existe pas — et on donne les vraies portes d'entrée du site.

export const metadata: Metadata = {
  title: { absolute: 'Page introuvable · Page not found' },
  robots: { index: false, follow: true },
}

// ⚠️ LE 404 GLOBAL — celui des adresses qui ne correspondent à AUCUN
// groupe de routes. Il appartient à l'arbre de TOUTES les routes du site :
// s'il lit l'en-tête « Host », les 117 routes redeviennent dynamiques et
// non cachables. Mesuré le 25 août, c'est ce fichier qui coûtait 10 Go
// d'Origin Transfer par mois.
//
// Il ne peut donc pas savoir, côté serveur, sur quel domaine il est servi.
// Plutôt que d'afficher du français à un anglophone — même une seconde,
// même sur une page en noindex — il rend les DEUX langues et un script
// court, exécuté AVANT le premier affichage, masque celle qui n'est pas la
// bonne. Sans JavaScript, le français reste : un contenu lisible vaut
// mieux qu'un écran vide.
//
// Les pages qui appartiennent à un groupe ont leur propre 404, avec
// l'habillage du site et la langue de leur route : app/(fr), app/en,
// app/(dyn).
export default function PageIntrouvable() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.dom=location.hostname.indexOf('gohalaltravel')>-1?'en':'fr'}catch(e){}" }} />
      <style dangerouslySetInnerHTML={{ __html: '.n404-en{display:none}[data-dom="en"] .n404-en{display:block}[data-dom="en"] .n404-fr{display:none}' }} />
      <div className="n404-fr"><Contenu404 lang="fr" /></div>
      <div className="n404-en"><Contenu404 lang="en" /></div>
    </>
  )
}
