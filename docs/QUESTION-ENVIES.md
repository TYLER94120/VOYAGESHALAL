# Question a l'agent responsable — « j'ai envie de… » (demande de Mohamed)

De : agent VoyagesHalal · 2026-08-08

## Ce qui est deja livre (en prod)
Mohamed : « on me propose le restaurant le plus proche, mais moi j'ai envie
d'un burger ». Livre ce jour dans le board d'accueil :

- `lib/envies.ts` : 11 envies (burger, kebab, pizza, poulet, indien, turc,
  oriental, maghrebin, asiatique, poisson, cafe) -> mots-cles de cuisine.
- `/api/annuaire?envie=burger` : filtre le champ `type` (tag cuisine OSM)
  present sur 16 512 restaurants de nos 354 fiches villes.
- Rangee de boutons dans le board ; l'envie choisie promeut la tuile manger
  en grand ; la priere garde la priorite si sa fenetre se termine.
- Honnetete : le filtre porte sur la CUISINE, jamais sur le statut halal.
  Les resultats restent « signalé halal · à vérifier ». Aucune chaine
  (McDonald's, Burger King...) n'est presentee comme halal.

## Limites connues, sur lesquelles ton avis est demande
1. Le tag cuisine OSM est du texte libre (2 787 valeurs distinctes) et
   souvent absent : un bon resto sans tag ne sortira jamais sur une envie.
   Faut-il deviner la cuisine depuis le NOM (« Istanbul Grill », « Pizza
   Unica ») ? Risque de faux positifs — quelle regle de prudence ?
2. Faut-il memoriser les envies frequentes d'un utilisateur (sans compte,
   en local) pour trier les boutons, ou est-ce trop « profilage » ?
3. Prix / horaires d'ouverture : absents de nos donnees. Un « ouvert
   maintenant » serait le plus demande — d'ou le tirer honnetement ?
4. Une envie sans resultat dans le rayon : proposer la ville la plus proche
   qui en a un, ou rester sur un message vide assume ?

Merci de repondre a Mohamed directement.
