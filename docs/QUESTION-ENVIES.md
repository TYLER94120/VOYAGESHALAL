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

## Mise a jour apres test terrain de Mohamed (meme jour)
Il a trouve deux defauts, corriges depuis :
- « asiatique » renvoyait un lieu qui n'est pas asiatique -> correspondance
  notee (2 = cuisine principale ou nom du lieu, 1 = tag secondaire), les
  correspondances sures d'abord, et le tag brut est AFFICHE pour que le
  voyageur juge. Un match faible est annonce « mention secondaire ».
- une envie sans resultat retombait en silence sur la mosquee -> la tuile
  manger reste, dit franchement qu'on ne reference rien dans 12 km, et
  ouvre 3 portes : le plus proche, le guide de la ville, HalalGPT.

## Demande explicite de Mohamed : la traction avec HalalGPT
« Peut-etre que HalalGPT peut nous aider en direct et creer une traction
entre les deux sites. » Premier pas fait de mon cote : un bouton
« 🌙 Demander a HalalGPT » dans l'etat vide (lien seul, aucun changement
dans ton repo). Ta vision pour la suite ? Pistes que je vois, a arbitrer
par toi puisque l'API HalalGPT est chez toi :
- une reponse HalalGPT en clair dans la tuile (« ou manger un burger halal
  a Paris ? ») — quel endpoint, quel cout, quel cache ?
- HalalGPT qui aide a NORMALISER nos 2 787 types de cuisine libres en
  categories propres (traitement hors ligne, une fois, pas par requete) ;
- l'inverse : HalalGPT qui renvoie vers nos guides ville quand on lui pose
  une question de voyage.
Contrainte que je m'impose : aucune reponse d'IA presentee comme une
verification halal, et aucun avis de finance.

## 2e demande de Mohamed : notes, photos, et le role de l'IA
« Il me manque des informations : la note, les etoiles, des photos.
Peut-etre que l'IA commune peut nous donner des images, des videos. »

Etat reel de nos donnees (verifie champ par champ, 16 512 restaurants) :
- `halalConfidence` : REEL et differencie -> desormais affiche honnetement.
- `priceRange` : present sur 8 750 fiches... et vaut « €€ » partout. Valeur
  par defaut, pas une donnee : NON affiche (afficher un faux prix serait
  pire que ne rien afficher).
- notes / etoiles : nous n'en avons AUCUNE (Google Places non active).
- photos des lieux : nous n'en avons aucune non plus.

Ce que j'ai livre en attendant : un tap vers les photos et avis REELS sur
Google Maps, et un tap pour que le voyageur sur place ajoute SA photo
(elle nourrit notre site pour le suivant).

⚠️ MA LIGNE ROUGE, a arbitrer par Mohamed si desaccord : une IA ne peut pas
fournir la photo d'un vrai restaurant. Generer une image d'un lieu reel et
l'afficher comme si c'etait lui, ce serait inventer — exactement ce que la
charte interdit, et le premier voyageur qui arrive devant le lieu perd
confiance dans tout le site. Je ne le ferai pas.

Ce que l'IA PEUT faire honnetement, et ou j'attends ton idee de genie :
1. Normaliser nos 2 787 types de cuisine libres en categories propres
   (traitement hors ligne, une fois) — c'est LE fond du probleme de
   fiabilite signale par Mohamed.
2. Rediger, a partir de faits verifiables uniquement, une phrase utile par
   lieu (« kebab, ouvert tard, quartier X ») sans rien inventer.
3. Illustrer une VILLE (photo libre de droits, deja fait, etiquetee
   « photo d'illustration »), jamais un etablissement precis.
4. Une reponse HalalGPT en direct dans la tuile quand on ne trouve rien.
Quelle piste, et avec quel garde-fou ?

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
