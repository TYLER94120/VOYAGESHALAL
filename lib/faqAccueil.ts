// ❓ LA FAQ DE L'ACCUEIL — une seule source pour l'écran ET pour Google.
//
// Le brief l'exige : « la FAQ du schéma doit correspondre MOT POUR MOT à la
// FAQ visible ». Deux listes qui se ressemblent finissent toujours par
// diverger — une correction d'un côté, oubliée de l'autre — et Google
// sanctionne les données structurées qui ne correspondent pas à la page.
// Il n'y a donc qu'un tableau, lu deux fois.
//
// ⚠️ LE MOT « CERTIFIÉ » N'APPARAÎT NULLE PART, et c'est délibéré.
// La maquette proposait « badge vert = certification halal officielle ».
// Nous ne certifions rien : nos trois états sont vérifié (contrôlé par
// nous), signalé (déclaré, à confirmer sur place) et non confirmé. Publier
// une « certification officielle » en données structurées serait une
// promesse invérifiable sur le sujet le plus sensible du site — Mohamed a
// tranché dans le même sens le 16 août : « on ne certifie pas un truc qui
// n'est pas sûr ».

export interface QuestionFaq { q: string; r: string }

export const FAQ_ACCUEIL: QuestionFaq[] = [
  {
    q: 'Comment trouver un restaurant halal près de moi ?',
    r: 'Appuyez sur « Autour de moi » : VoyagesHalal affiche les adresses les plus proches, avec leur distance, leur temps de trajet et l\'itinéraire. Chaque adresse porte son statut — vérifié par nous, signalé halal à confirmer sur place, ou non confirmé. Nous ne délivrons aucune certification.',
  },
  {
    q: 'Où prier quand on voyage ?',
    r: 'VoyagesHalal recense les mosquées, et aussi les salles de prière des aéroports, gares, centres commerciaux et aires d\'autoroute. Quand un équipement est renseigné — ablutions, espace pour les femmes — il est affiché ; quand il ne l\'est pas, nous le disons plutôt que de le supposer.',
  },
  {
    q: 'Qu\'est-ce que le HalalScore ?',
    r: 'Une note de 0 à 10 qui résume la facilité d\'un séjour pour un voyageur musulman : densité d\'adresses halal, accès aux mosquées, hébergements sans alcool. Elle vient de nos propres relevés et se décompose sur chaque page ville — elle n\'est jamais estimée pour combler un manque.',
  },
  {
    q: 'Comment connaître les horaires de prière et la direction de la Qibla ?',
    r: 'Les cinq horaires du jour et la direction de la Qibla sont calculés sur votre appareil, à partir de votre position exacte. Aucun compte n\'est nécessaire, et le calcul fonctionne même sans réseau.',
  },
  {
    q: 'Le service est-il gratuit ?',
    r: 'Oui. La recherche d\'adresses, les horaires de prière et la Qibla sont gratuits et accessibles sans créer de compte.',
  },
]
