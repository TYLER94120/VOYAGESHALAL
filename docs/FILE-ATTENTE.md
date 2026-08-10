# File d'attente — VoyagesHalal.fr et GoHalalTravel.com

Un élément entre ici **avec ce qui le justifie** : un chiffre, un défaut
constaté. Jamais une simple intention. On en prend un par cycle, on le
finit, on le descend dans « Fait » avec sa mesure d'arrivée.

Priorité permanente : **Istanbul et Dubaï** — 79 et 53 impressions sur les
requêtes d'hôtels, en quatre langues, sans que personne n'ait travaillé
dessus.

---

## Dates de référence (ne pas rejuger un travail sur des chiffres d'avant)

| Date | Correction | Remesurer à partir du |
|---|---|---|
| 9 août 2026, 12h32 | 383 titres tronqués, noms de villes en anglais, chiffres faux | **16-19 août** |
| 9 août 2026, soir | Pages hôtels Istanbul et Dubaï (filtres, distance mosquée) | 16-19 août |
| 10 août 2026 | Liens sortants balisés (19 liens, campagne par emplacement) | 24 août |
| 11 août 2026 | Vitesse (appels réseau bornés, images 1600 → 300 px) | 18-21 août |

Chiffres AVANT le 9 août, 7 jours : voyageshalal.fr 1 970 impressions /
29 clics / 1,5 % · gohalaltravel.com 441 / 3 / 0,7 %.

---

## À faire

### 1. Traduire les 6 guides pratiques qui n'ont pas de version anglaise
**Mesuré** : sur les 9 guides écrits cette semaine, **3 seulement** ont un
jumeau anglais. Les 6 autres — repas MOML en avion, ablutions, heure de
prière en vol, voile au contrôle, voyager voilée, toilettes sans douchette
— n'existent qu'en français. Or le domaine anglais ne compte que **22
contenus sur 108 (20 %)** et son marché est presque vide.
Traduire n'est pas créer : cela ne compte pas dans la limite de 2-3
contenus par jour. Chaque paire ajoute aussi un hreflang réciproque.

### 2. Les sections « manger » et « prier » manquent sur 344 fiches villes
**Mesuré** : sur 354 fiches, **10 ont une section « manger halal » rédigée
et 10 une section « où prier »**. Les 344 autres n'ont que des listes
d'adresses — donc peu de texte unique, et rien qui réponde à « manger halal
à X » en toutes lettres. Commencer par Istanbul et Dubaï.

### 3. Les hôtels d'Istanbul et Dubaï attendent le robot OSM
**Mesuré** : 41 mentions « information non vérifiée » par page, et
**0 hôtel avec une politique alcool connue**. Le script et le workflow
existent (`enrich-hotels-osm.mjs`, `.github/workflows/enrich-hotels.yml`)
mais n'ont jamais été lancés : le réseau externe est fermé depuis
l'environnement de l'agent. **Action pour Mohamed**, pas pour l'agent :
GitHub → Actions → « Enrichir les hôtels » → Run workflow.

### 4. L'accueil et le blog : 704 impressions, ZÉRO clic
**Mesuré** (7 jours avant le 9 août). Les titres ont été refaits le 9 août,
donc **ne rien conclure avant le 16**. Si le zéro persiste après cette
date, le problème n'est pas le titre : il faudra regarder sur quelles
requêtes ces pages sortent réellement.

### 5. Les 8 pages aéroport sont courtes
**Mesuré** : CDG 310 mots, Orly 265, Disneyland 228. Ce sont nos meilleures
portes d'entrée (22 des 29 clics du site viennent de Disneyland) et elles
sont plus courtes que nos guides récents (900 à 1 200 mots). Approfondir
vaut mieux que créer : ajouter le plan d'accès précis, les horaires
d'affluence, ce qu'on fait quand la salle est fermée.

### 6. `force-dynamic` : 8 pages à réexaminer
**Mesuré** : 37 fichiers, dont **29 routes /api** où le réglage n'a aucun
effet. Restent 8 pages. Vérification déjà faite pour le layout racine (il
est nécessaire au bi-domaine, voir la compétence `servir-deux-domaines`).
Les 7 autres n'ont pas été examinées une par une.

---

## Fait

### La position, dite en clair sur tout le site — 11 août
**Reproché par Mohamed** : « il y a écrit ma position, mais ce n'est pas
clair, on ne sait pas si ça l'a pris en compte, s'il faut rappuyer ».

Le fond du problème n'était pas l'affichage : « Ma position » décrit la
MÉTHODE et non le LIEU. Rien à vérifier, donc aucune confiance possible.
Le GPS donne maintenant un nom (`/api/reverse`, notre propre liste de 354
villes, Nominatim seulement au-delà de 60 km) : **« Ma position » → « Rabat »**.

Un composant unique (`components/location/PositionBadge`) répond partout aux
trois mêmes questions dans le même ordre : où · quelle qualité · quoi faire.
Trois qualités, pas deux : exacte, ville choisie, approximative.
**Mesuré sur 6 pages × 2 états** (GPS refusé / accordé) : même lieu, même
horaire, même formulation, zéro erreur JavaScript.

Trois défauts trouvés en chemin :
 · la page horaires avait sa **propre copie** de la résolution de position ;
 · le bandeau du haut rappelait api.aladhan.com **chaque seconde** ;
 · la page horaires affichait « indisponibles » dès qu'aladhan ne répondait
   pas, pendant que le bandeau donnait l'heure (calcul local en repli).

Et « Je suis ici (ma position exacte) », sur l'ajout d'un spot, enregistrait
la position estimée depuis la connexion quand le GPS n'avait pas répondu :
**un lieu faux publié sous l'étiquette « exact »**. Le bouton demande
désormais le GPS d'abord.

### Deux villes différentes affichées en même temps — 11 août
**Constaté sur une capture de Mohamed** : le bandeau annonçait « Marrakech »
pendant qu'une tuile annonçait « spots à Fès ».

Ce n'était pas un bug de calcul : **deux notions différentes portaient la
même épingle 📍** — la position réelle, et la ville qu'on consulte (mémorisée
par le site). L'épingle est maintenant réservée à « où tu es » ; la ville
consultée porte la loupe 🔎 et le mot « Ville consultée ».

### Deux horaires de prière différents sur le même écran — 11 août
**Constaté sur une capture de Mohamed** : le bandeau du haut annonçait
Dhuhr à **13h37**, la tuile du tableau de bord **13h24**. Quatorze minutes
d'écart, sur un produit de prière.

Vérifié par un calcul solaire indépendant (équation du temps + longitude) :
Dhuhr à Marrakech le 11 août = **13h37**. Le bandeau avait raison, et la
bibliothèque de calcul est juste elle aussi (13h38 en méthode Ligue
islamique mondiale).

La cause n'était donc pas un mauvais calcul mais **deux sources** : le
bandeau partait de la ville mémorisée, le tableau de bord de la position
réelle, et le board forçait la méthode 3 en dur alors que le bandeau lit
le choix de l'utilisateur. Les deux lisent désormais la même position et
la même méthode.
**Mesure après correction** : une seule heure affichée, **13:38**.

### Vitesse de la page d'accueil — 11 août
Un appel réseau restait **13,7 s** sans jamais se terminer (le serveur
répond en 4 ms) : `fetch` n'a aucun délai maximum. Les 7 lectures du
tableau de bord abandonnent maintenant à 4 s.
**Mesure** : avec toutes les API retardées de 20 s, la fenêtre de prière
s'affiche en **369 ms** (334 ms en réseau normal).
Images : les vignettes de 168 px chargeaient du 1600 px → **300 px**.

### Lisibilité en plein jour — 11 août
**Avant** : 84 % des pixels du premier écran très sombres, luminosité
moyenne 38/255. **Après** : 60 % et 44/255.
Rupture de fond entre le tableau de bord (26,45,29) et le hero (15,30,18) :
**écart de couleur 37 → 5**.

### Ce que Google affiche — 9 août
**383 titres sur 809** dépassaient 62 caractères et étaient coupés → **10**.
34 fiches villes sortaient leur nom français sur le domaine anglais
(« Dubaï Halal Travel Guide ») → corrigé.
93 fiches sur 354 annonçaient un nombre de restaurants faux → calculé sur
les données réelles.

### Hreflang dans les pages — 9 août
**777 des 802 pages** déclarent leur jumeau (les 25 restantes n'en ont pas,
et c'est voulu). Pages orphelines : **1 sur 802**, rattachée.

### Distance à la mosquée sur 222 hôtels — 9 août
Istanbul : les 110 hôtels sont à **3 minutes de marche au plus** d'une
mosquée (médiane 2 min). Dubaï : médiane 14 min, 37 hôtels sur 112 sous
les 10 minutes.
