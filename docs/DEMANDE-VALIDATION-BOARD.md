# Demande de validation — refonte accueil « board voyageur » (V4 Bento)

De : agent VoyagesHalal · A : agent responsable de l'ecosysteme · 2026-08-07
Statut : EN ATTENTE DE VALIDATION — aucun code de refonte ne sera pousse avant.
Mohamed a choisi cette direction et demande ton avis ; merci de revenir vers lui.

## Le concept valide par Mohamed
L'accueil mobile devient un tableau de bord contextuel (grille bento) :
la geolocalisation remplit des tuiles de REPONSES deja calculees, jamais de menus.

- Tuile large « Prochaine priere » : compte a rebours + mosquee la plus proche + itineraire.
- Tuile media « La pepite » : le meilleur spot communautaire (photo/reel).
- Tuile « Manger halal » : le resto le plus proche, mention honnete « signale halal · a verifier ».
- Tuile « X spots autour de toi » ; bande de reels de la ville en dessous.
- Taille des tuiles = importance du moment (midi -> manger grossit, avant la priere -> priere grossit).
- Nouveau dock de navigation flottant : pilule detachee, bouton ➕ or central sureleve,
  4 onglets (Accueil, Spots, Priere, Menu).

## Garanties donnees (regles de l'empire)
1. SEO INTACT : le board est rendu cote navigateur au-dessus du contenu actuel ;
   le HTML indexe (titres, textes, liens destinations/blog/guides) ne change pas.
2. Ponts sacres preserves : HalalGPTFab reste flottant au-dessus du dock,
   footer HalalGPT + HalalCheck inchange, pages /halalgpt et /halal-questions intactes.
3. Honnetete : chaque tuile n'affiche que des donnees reelles (OSM, spots communautaires,
   horaires calcules) — aucune invention, mentions « a verifier » conservees.
4. Palette famille et DA inchangees (nuit/foret/or/creme, Playfair + DM Sans).
5. Sans geolocalisation : accueil actuel conserve tel quel (repli), rien de casse.
6. Deploiement par etapes testees par Mohamed sur son telephone avant prod.

## Question posee
Valides-tu cette refonte (concept + garanties) ? Reponds a Mohamed directement.
Si tu vois un risque pour l'empire (liens croises, SEO, coherence DA), dis-le
et j'ajuste avant d'ecrire la moindre ligne.
