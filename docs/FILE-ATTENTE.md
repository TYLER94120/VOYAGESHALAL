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
| **12 août 2026** | **14 titres et descriptions coupés par Google, dont /hotels (80 car.), la page qui mène à Istanbul et Dubaï** | **19-22 août** |
| **12 août 2026, soir** | **Description de repli (`lib/seo.ts`, 171 car.) et /destinations** | **19-22 août** |
| **13 août 2026** | **Gabarit des pages « où prier » : 73 titres coupés, 19 titres et 9 descriptions en français sur le domaine anglais** | **20-23 août** |
| **14 août 2026** | **Quatre gabarits voisins repliés : /spot/[id] (jusqu'à 123 car.), /guide-vivant, /priere/[ville], /communaute/[pseudo]** | **21-24 août** |

Chiffres AVANT le 9 août, 7 jours : voyageshalal.fr 1 970 impressions /
29 clics / 1,5 % · gohalaltravel.com 441 / 3 / 0,7 %.

---

## À faire

### 0. ⛔ CONTENU GELÉ JUSQU'AU 15 AOÛT AU SOIR — décision de Mohamed
Prise après le bilan référencement : **le SEO est le chantier principal et
prioritaire sur tout le reste**. Les éléments 1 à 3 ci-dessous touchent au
contenu : **ne pas les reprendre avant le 15 au soir**. Seuls les défauts
techniques et les corrections de gabarit peuvent avancer d'ici là.

### 1. Refondre les 22 guides : la maquette est faite, le contenu reste à écrire
**Demande de Mohamed, 12 août** : « Des beaux guides avec de belles photos,
pas un truc donné à la va-vite. Les personnes laissent leur mail pour avoir
un guide gratuit, je ne veux pas qu'elles soient déçues. »

**La cause racine, mesurée le jour même : ZÉRO image sur les 24 pages de
guide.** La photo de couverture existait dans les données depuis toujours,
mais la page ne l'affichait nulle part — les guides étaient des murs de
texte. **C'est fait : 42 pages de guide sur les deux domaines, 0 sans
image.** Avec couverture pleine largeur, sommaire automatique, typographie
soignée et format d'encadré. La maquette profite d'un coup à tous les
guides, présents et à venir.

**Ce qui reste, et c'est le gros du travail** :
1. **Les images.** Point de départ : **55 contenus pour seulement 18 images
   distinctes**, et **la même photo sur 19 pages**. Au 12 août au soir :
   **15 pages de guide sur 41 ont une photo qui leur est propre**, en
   français comme en anglais : Istanbul, Dubaï, Marrakech, Omra, Malaisie,
   Europe, prière en avion, petit budget. **Il reste 26 pages** à traiter,
   et une trentaine de photos encore inutilisées dans `public/guides/`
   (Antalya, Le Caire, Paris, Singapour, Tanger, New York, Casablanca,
   Amman, Doha, Abou Dabi, et les images de blog).
   Le dépôt contient pourtant **55 photos inutilisées** dans
   `public/guides/` (istanbul, dubai, marrakech, fès, antalya, doha, amman,
   le caire, londres, paris, sarajevo, singapour, kuala lumpur, médine…).
   Istanbul est fait et sert de modèle : couverture propre + 2 photos de
   section légendées, **chaque image ouverte et regardée avant d'être
   posée**. À dérouler ville par ville.
2. **Le fond.** Médiane à 574 mots quand nos fiches villes en font 1 300 —
   et surtout, chaque affirmation est à relire : c'est ce passage-là qui a
   fait tomber quatre restaurants inventés sur Istanbul et la promesse
   fausse de Dubaï, pas l'ajout de paragraphes.

### 2. « 100 % halal », « aucune vérification nécessaire » : 57 pages à trier
**Trouvé le 12 août en relisant Marrakech**, dont le premier paragraphe
disait « la totalité des restaurants respectent les préceptes halal par
défaut, aucune vérification n'est nécessaire, c'est la liberté totale du
voyageur musulman » — **en contradiction directe avec l'encadré placé juste
en dessous**. C'est la même famille de défaut que la promesse de Dubaï.

**Mesuré en balayant les deux sitemaps** : **32 pages côté français, 25
côté anglais**, portant « 100 % halal », « tout est halal », « la totalité
des restaurants », « liberté totale », « everything is halal », « entirely
halal ».

⚠️ **Ce chiffre est une borne haute, à trier une page à la fois** : dire
« 100 % halal » est légitime dans un article qui explique justement comment
vérifier qu'un restaurant l'est vraiment, et les pages de liste
(`/destinations`, `/guides`) ne font que reprendre des extraits. Le tri
fait partie du travail — pas de correction en masse à l'aveugle.

**Ordre** : les fiches des pays du Golfe et du Maghreb d'abord (ce sont
elles qui promettent le plus), puis les guides, puis le blog.

### 3. Les guides des deux mines sont les pages les plus maigres du site
**Demande directe de Mohamed, 12 août** : « Il faut retravailler les
guides, ils sont extrêmement génériques et très mal faits. » Mesuré plutôt
que discuté, et il a raison — mais le défaut n'est pas où on l'attendrait.

**La longueur, d'abord.** Médiane des 24 guides : **574 mots**. Or les
fiches villes que nous enrichissons depuis trois jours en font 1 300. Les
pages censées convertir nos deux meilleures requêtes sont les plus pauvres
du site :

| Guide | Mots |
|---|---|
| `voyage-halal-marrakech-guide-2026` | 343 |
| `marrakech-guide-halal` | 580 |
| ~~`dubai-guide-halal-2026`~~ | ~~574~~ → **699, fusionné le 12 août** |
| ~~`istanbul-guide-halal-complet`~~ | ~~751~~ → **1 136, fusionné le 12 août** |

**Les doublons.** Istanbul, Dubaï et Marrakech avaient chacune deux
guides. **Istanbul et Dubaï sont faits.** Reste **Marrakech** : même
méthode — garder le plus riche, rediriger l'autre en 301, reprendre ce
qu'il avait d'unique, et **relire chaque affirmation avant de la garder**.
C'est ce passage-là qui rapporte le plus, pas l'ajout de paragraphes.

**Les formules creuses, enfin**, mais c'est le moindre : 4 guides sur 24
en comptent au moins trois (« sereinement », « incontournable »,
« de plus en plus »). Densité de faits durs — noms propres et chiffres —
**14,9 pour 100 mots** en moyenne, avec un plancher à 4,0 sur
`priere-avion-train-guide`.

**L'ordre de traitement** : Istanbul d'abord (mine n°1), puis Dubaï, puis
Marrakech. Fusionner les doublons avant d'écrire une ligne, sinon on
enrichit une page qui sera redirigée.

### 4. Les sections « manger » et « prier » manquent sur 277 fiches villes
**Mesuré le 12 août, après huit séries** (Asie, Amérique du Nord, Balkans,
Europe du Nord, Amérique latine, Afrique subsaharienne, Turquie, Maghreb) :
**77 fiches sur 354** ont leurs quatre sections. Les 277 autres n'ont que
des listes d'adresses. 39 villes traitées, aucun restaurant nommé.

**Règle apprise le 12 août, à appliquer avant chaque série** : vérifier
fiche par fiche ce qui existe déjà. La série « Golfe et Levant » annoncée
aurait réécrit cinq fiches faites ; la série Maghreb annoncée en visait
cinq dont quatre étaient déjà faites (Casablanca, Marrakech, Alger, Tunis).

Prochaine série : **l'Asie du Sud** (Delhi, Bombay, Hyderabad, Lahore,
Colombo) — à vérifier fiche par fiche avant d'écrire. La question s'y pose
encore autrement : en Inde le halal est courant et signalé, mais la
question végétarienne et celle du bœuf s'y ajoutent.

### 5. Un seul guide français reste sans version anglaise, et c'est exprès
**Mesuré le 12 août sur les deux sitemaps servis** : le domaine anglais
est passé de **15 à 20 guides** (le français en a 24 ; l'écart restant
tient à trois doublons français qui pointent vers le même jumeau anglais).
Cinq traduits dans la journée : Japon, Thaïlande, Europe, petit budget,
Aïd en famille.

Reste **`priere-avion-train-guide`**, et il n'est pas oublié : ⚠️ **il est
à relire avant traduction, pas à traduire tel quel**. Il tranche une
question religieuse (qasr, jam'), ce que nos onze pages « où prier » ont
justement cessé de faire le 11 août. Le traduire en l'état propagerait en
anglais un défaut qu'on vient de corriger en français.

Le vrai gisement suivant est **le blog : 45 articles en français, 32 en
anglais**.

### 6. Les hôtels d'Istanbul et Dubaï attendent le robot OSM
**Mesuré** : 41 mentions « information non vérifiée » par page, et
**0 hôtel avec une politique alcool connue**. Le script et le workflow
existent (`enrich-hotels-osm.mjs`, `.github/workflows/enrich-hotels.yml`)
mais n'ont jamais été lancés : le réseau externe est fermé depuis
l'environnement de l'agent. **Action pour Mohamed**, pas pour l'agent :
GitHub → Actions → « Enrichir les hôtels » → Run workflow.

### 7. L'accueil et le blog : 704 impressions, ZÉRO clic
**Mesuré** (7 jours avant le 9 août). Les titres ont été refaits le 9 août,
donc **ne rien conclure avant le 16**. Si le zéro persiste après cette
date, le problème n'est pas le titre : il faudra regarder sur quelles
requêtes ces pages sortent réellement.

---

## Fait

### ⛔ « 37 fichiers en force-dynamic dont certains n'en ont pas besoin » : faux chantier, mesuré — 14 août
Ce point traînait dans les consignes de cycle depuis le 10 août. **Mesuré
plutôt que cru, et il n'y a rien à gagner.**

**L'état réel** : 41 directives `force-dynamic`, dont **32 sur des routes
API** — celles-là lisent Redis, la position ou la météo, elles sont
dynamiques par nature. Restent **9 pages**.

**Le test qui tranche** : j'ai retiré `force-dynamic` de `/destinations` et
reconstruit. **La page reste dynamique (`ƒ`).** Deux raisons, toutes deux
structurelles :
- `app/layout.tsx` est lui-même en `force-dynamic`, ce qui s'applique à
  toutes les routes ;
- surtout, **`getDomainSEO()` lit les en-têtes HTTP** pour savoir sur quel
  domaine on se trouve. Une page qui lit les en-têtes **ne peut pas** être
  statique. C'est le prix du bi-domaine par en-tête `Host`, pas un oubli.

**Chiffre de fin** : 97 routes, **3 statiques** (les icônes), 94
dynamiques — et ce serait 94 même en retirant les 9 directives. Les
supprimer ne rendrait aucune page statique ; ça ne ferait que retirer une
ceinture qui ne gêne personne.

**Ce qu'il faudrait pour vraiment gagner** : servir chaque langue depuis
son propre point d'entrée au lieu de lire l'en-tête à l'exécution. C'est un
changement d'architecture, pas un nettoyage — **à ne pas entreprendre sans
une raison mesurée**, et la vitesse a déjà été traitée le 11 août.

**Cet élément est clos. Il ne doit plus revenir dans les consignes.**

### La même cause frappait quatre autres gabarits — 14 août
**Le gabarit « où prier » corrigé hier n'était pas seul.** Après l'avoir
réparé, j'ai cherché si la cause — du décor placé devant une valeur qu'on
ne maîtrise pas — se retrouvait ailleurs. Elle s'y retrouvait.

**Mesuré sur les mêmes cas durs**, avant correction :

| Gabarit | Cas | Titres coupés | Français servi en anglais |
|---|---|---|---|
| `/spot/[id]` | 70 | **59** (jusqu'à **123 car.**) | **21** |
| `/guide-vivant/[ville]` | 14 | 11 (jusqu'à 77) | 0 |
| `/priere/[ville]` | 14 | 3 (jusqu'à 67) | 0 |
| `/communaute/[pseudo]` | 6 | 2 (jusqu'à 70) | 1 |
| **Total** | **104** | **75** | **22** |

`/spot/[id]` était le pire du site : le nom saisi, la catégorie, la ville et
« partagé par la communauté », tout avant que Google n'ait fini de lire.

**Ce qui a été fait** : la règle de repli de `lib/titreSpot.ts` est devenue
générale (`replier`, `contientDuFrancais`) et les quatre gabarits l'utilisent.
Sur `/spot/[id]`, la **description** aussi est traitée : elle est saisie en
français par l'auteur et partait telle quelle sur le domaine anglais ; elle
cède désormais la place à une description bâtie sur la catégorie, qui est
traduite.

**Mesure d'arrivée** : le garde-fou couvre maintenant **166 combinaisons**
au lieu de 70, et elles passent toutes. **75 titres coupés → 0, 22 titres
français en anglais → 0.**

⚠️ Même réserve qu'hier : spots et pseudos vivent dans Redis, hors
d'atteinte depuis mon environnement. **C'est la ronde qui confirmera sur
les pages réelles.**

### Le gabarit « où prier » ne peut plus déborder — 13 août
**Balayage complet du 13 août, 1 976 pages : 101 défauts, tous sur ces
pages-là.** Trois symptômes d'une seule cause — un gabarit qui mettait le
décor avant l'information :

- 73 titres coupés par Google (médiane 67 caractères, maximum 101) ;
- 19 titres en français sur le domaine anglais ;
- 9 descriptions en français sur le domaine anglais.

**La cause.** `Où prier à ${nom} — ${ville} | ${marque}` : 29 caractères de
décor plus la ville avant d'arriver au lieu. 35 en anglais. Sur
« Marrakech », il restait **22 caractères** pour nommer le lieu en
français, **16** en anglais. Et `nom` est saisi par la communauté, en
français : la même valeur partait telle quelle sur le domaine anglais, d'où
« Where to pray at Mosquée magnifique — Berkane ».

**Pourquoi c'était la priorité.** La loi du 11 août : le précis gagne.
« où prier au parc Astérix » convertit à 100 sur 100 ; « voyage halal »
fait 144 vues et zéro clic. Ces pages **sont** les pages précises — celles
qui gagnent déjà — et c'étaient exactement celles dont le titre était
cassé.

**Ce qui a été fait** : `lib/titreSpot.ts`. Le lieu d'abord, le reste
sacrifié dans l'ordre inverse de son utilité (marque, puis ville), et une
coupe sur un mot entier en dernier recours. **Ce n'est pas un test qui
alerte, c'est un gabarit qui ne peut pas dépasser.** Sur le domaine
anglais, un nom contenant des mots français bascule sur un titre bâti à
partir du type de lieu, qui est traduit : « Where to pray in a shopping
mall — Berkane ». Un titre générique honnête vaut mieux qu'un titre
bilingue accidentel.

**Mesuré sur 70 combinaisons nom × ville × langue**, avec les cas durs
relevés par la ronde :

| | Ancien gabarit | Nouveau |
|---|---|---|
| titres coupés | **41 / 70** (médiane 94, max 114) | **0** |
| français servi en anglais | **40** | **0** |

Les titres qui tenaient déjà ne bougent pas : « Où prier à Parc Astérix —
Paris | VoyagesHalal.fr » reste identique.

⚠️ **Ce que je n'ai PAS pu mesurer** : les spots vivent dans Redis, hors
d'atteinte depuis mon environnement. Je n'ai donc pas pu servir une vraie
page et compter les défauts réels. **C'est à la ronde de confirmer le
passage de 101 à 0** — et au plafond de `docs/ronde/plafond.json` de le
verrouiller.

**Le garde-fou** : `scripts/test-titres-spots.mjs`, branché sur
`npm run build`. Il n'éprouve pas les pages — impossible, le nom du lieu
n'existe pas à la construction — **il éprouve la règle**, en important le
vrai `lib/titreSpot.ts` plutôt qu'une copie qui finirait par diverger.

### Quatre guides de plus illustrés, et une photo remise à sa place — 12 août
**Avant** : 11 pages de guide avec une photo à elles. **Après : 15 sur 41.**

**Les choix du lot**, tous faits en ouvrant les images avant de les poser :
- « Prière en avion et en train » reçoit une aile d'avion au-dessus des
  nuages — le sujet même de la page ;
- « Voyage halal pas cher » reçoit un arc à muqarnas d'une médersa de Fès,
  le minaret au fond : le Maroc est la première destination que ce guide
  cite ;
- « Pays halal friendly en Europe » passe en couverture sur le portique
  ottoman de Sarajevo — c'est le premier pays de son classement, il mérite
  l'ouverture — et Londres, quatrième, illustre la section britannique.

**Le détail qui compte** : en promouvant Sarajevo en couverture, la même
image se retrouvait deux fois sur la page. Vérifié et retiré. Une photo en
double dans un guide, c'est le genre de négligence qui donne l'impression
que personne ne relit.

**Les versions anglaises reçoivent les mêmes photos**, y compris celle de
Londres dans le corps du texte.

**Mesuré** : 41 guides servis sur les deux domaines, **0 en erreur, 0 sans
image**, les 4 nouveaux fichiers photo vérifiés en 200.

### Omra, Malaisie, Europe illustrés — et deux photos écartées faute de certitude — 12 août
**Avant** : 0 guide avec une photo à lui. **Après : 11 pages de guide sur
41**, en français comme en anglais. Les couvertures anglaises reçoivent la
**même photo que leur jumeau français** : il n'y avait aucune raison que
l'anglophone hérite d'une image générique.

**La décision du cycle, et c'est elle qui compte** : deux photos ont été
**écartées faute de pouvoir nommer leur sujet**.
- `medine-j2` montre une mosquée blanche à quatre minarets avec des
  pèlerins. C'est très probablement Quba — « très probablement » ne se
  légende pas.
- `la-mecque-j2` montre une montagne avec une construction au sommet. Sans
  doute Jabal al-Nour, sans doute la grotte de Hira — encore « sans doute ».

Le guide Omra garde donc **une seule** image : la Mosquée du Prophète et son
Dôme Vert, que n'importe quel musulman reconnaît. **Sur une page de
pèlerinage, une légende approximative n'est pas une maladresse, c'est une
faute.** Mieux vaut une image sûre que trois dont deux au jugé.

**Ajouté au guide Omra** : un encadré qui dit ce que nous ne faisons pas —
nous ne tranchons aucune question religieuse, et nous renvoyons à HalalGPT
ou à l'imam. C'est la même règle que sur les onze pages « où prier ».

**Mesuré** : 41 guides servis sur les deux domaines, **0 en erreur, 0 sans
image**, les 10 fichiers photo vérifiés en 200, build sans erreur.

### Dubaï et Marrakech au modèle d'Istanbul : les trois doublons sont réglés — 12 août
**Les trois villes qui avaient deux guides en ont maintenant un seul.**
Six redirections vérifiées dans les deux langues : sur le domaine français
l'ancien slug renvoie au guide français, sur le domaine anglais il renvoie
au guide **anglais** — pas à la page française.

**Dubaï** reçoit sa couverture (vue aérienne, le Burj Khalifa au centre) et
une photo de section. ⚠️ **Le piège évité** : la seconde photo montre la
marina de nuit. Le réflexe aurait été de la poser sous « Old Dubai, l'âme
authentique » — la section qui appelle une image. Mais elle montre
exactement l'inverse : ce qu'il y a de plus récent dans la ville. Elle est
donc allée sur la section budget, où elle illustre son propos. **Une image
mal légendée ment aussi sûrement qu'une phrase fausse.**

**Marrakech** est fusionné, illustré (la Koutoubia, un plafond de cèdre
peint) et **nettoyé de trois adresses nommées** que personne chez nous n'a
vérifiées — même défaut que sur Istanbul. Le guide gagne au passage ce que
le doublon avait d'utile : où loger et ce que change un riad, et un guide
pratique en quatre points.

**Mesuré** : les 3 guides en 200 avec leurs images (3, 2 et 2), **0 adresse
nommée sans vérification**, 6 redirections correctes sur les deux domaines,
build sans erreur.

### Les guides n'avaient AUCUNE image, et l'email « guide gratuit » était cassé — 12 août
**Deux découvertes du même cycle, toutes deux parties de la même remarque
de Mohamed sur la qualité des guides.**

**1. L'email de bienvenue partait avec un lien mort dans chaque langue.**
Le tout premier message reçu par quelqu'un qui vient de nous confier son
adresse. Côté français, le **premier lien de la liste** renvoyait une 404
(`/guides/voyager-pendant-ramadan-guide-complet` : l'article est dans
`/blog`). Côté anglais, `/nearby-mosque` n'existe pas — le slug est
`/mosque-near-me`. **12 liens, 2 morts → 0**, et
`scripts/test-email-bienvenue.mjs` refuse désormais de construire le site
si l'un d'eux ne mène nulle part. Corrigé aussi la promesse « 20+ pages »
affichée sous le formulaire : ce qui part est une sélection de ressources.
Promettre plus que ce qu'on livre est la façon la plus sûre de décevoir.

**2. Les 24 pages de guide n'affichaient aucune image.** La couverture
existait dans les données mais n'était rendue nulle part. **42 pages de
guide sur les deux domaines, 0 sans image** désormais — couverture pleine
largeur avec titre en surimpression, **sommaire construit automatiquement
à partir des titres** (donc jamais désynchronisé), typographie de lecture,
puces dorées, format de figure légendée et d'encadré « à retenir ».

**Istanbul sert de modèle** : couverture remplacée par une photo à nous, et
deux photos de section — la cour de la Süleymaniye, Sainte-Sophie vue du
Bosphore — **chacune ouverte et regardée avant d'être posée**. On ne publie
pas une image dont on ignore ce qu'elle montre, c'est la même règle que
pour les faits.

### Le guide Dubaï disait « mangez partout sans vérifier ». C'était faux — 12 août
**Le défaut le plus grave trouvé depuis le début de ce chantier**, et il
était sur la mine n°2 (53 impressions). Le guide affirmait :

> « Tous les restaurants de Dubaï sont halal par obligation légale —
> manger partout sans vérifier. »
> « une garantie absolue que l'on ne trouve nulle part ailleurs »
> « vous pouvez manger dans n'importe quel restaurant sans la moindre
> inquiétude »

**C'est faux, et c'est le genre de faux qui fait manger du haram à
quelqu'un qui nous a fait confiance.** La viande du circuit courant est
bien encadrée aux Émirats — c'est vrai et ça reste écrit. Mais l'alcool y
est servi dans les établissements titulaires d'une licence, ce qui couvre
la plupart des bars et restaurants d'hôtel, et le porc est vendu dans des
rayons séparés et servi dans une minorité d'établissements autorisés.
Le repère juste n'est pas « est-ce halal » mais « quel type
d'établissement ».

**Corrigé dans les cinq endroits où la promesse vivait** : le guide
français, sa version anglaise, la fiche ville Dubaï dans les deux langues,
et un conseil pratique de la fiche. Au passage, le doublon
`voyage-halal-dubai-guide-2026` (381 mots) est supprimé et redirigé —
574 → 699 mots pour la page qui reste.

**Mesure d'arrivée** : **1 635 pages balayées sur les deux domaines
(811 + 824), 0 page portant encore la promesse.** Le balayage a aussi
rattrapé une phrase oubliée sur Berkane (« la viande servie est halal sans
exception »), nuancée elle aussi.

**Vérifié également** : ancien slug en 308 côté FR et en 301 vers le guide
anglais côté EN, guide conservé en 200 avec un temps de lecture exact,
slug supprimé absent des deux sitemaps, 27 liens internes tous en 200.

### Istanbul : deux guides moyens fusionnés en un, et quatre restaurants retirés — 12 août
**Istanbul est la mine n°1** (79 impressions) et se présentait avec **deux
guides qui se disputaient les mêmes requêtes** : 751 mots et 432 mots.

**Fait** : le plus riche absorbe ce que l'autre avait d'unique — où loger
quartier par quartier, la carte Istanbulkart, la saison, la monnaie — et
l'ancien slug part en 301. **751 → 1 136 mots**, une seule page au lieu
de deux.

**Le vrai défaut trouvé en chemin, et c'est celui que Mohamed sentait** :
le guide conservé listait **quatre restaurants sous « Les meilleurs
restaurants halal d'Istanbul — nos coups de cœur »**. Personne chez nous
n'y est allé, et nous n'avons vérifié le statut halal d'aucun. C'est
exactement ce que la règle interdit. La section est remplacée par ce que
nous pouvons réellement affirmer : à Istanbul la viande ne pose pas de
question, **c'est l'alcool qui change d'un quartier à l'autre** — présent à
Beyoğlu, Karaköy, Kadıköy et sur les quais, rare à Fatih et Üsküdar. Les
adresses restent sur la fiche ville, où chacune porte sa source.

**Un défaut de plus, trouvé parce que j'ai mesuré au lieu de conclure** :
la redirection s'appliquait AUSSI sur le domaine anglais et y envoyait
l'anglophone sur la page française. Corrigé avec `has: host` ; le domaine
anglais continue de passer par `GUIDES_FR_TO_EN`.

**Mesuré** : ancien slug en 308 vers le guide français côté FR, en 301
vers le guide **anglais** côté EN · guide conservé en 200, 1 136 mots,
temps affiché 5 min (exact) · aucun des quatre restaurants n'apparaît
plus · slug supprimé absent des deux sitemaps · 28 liens internes tous
en 200.

### « 10 min de lecture » pour quatre minutes de texte — 12 août
**Point de départ** : Mohamed trouve les guides « mal faits ». Première
chose mesurée, et la plus embarrassante : **16 guides sur 24 annonçaient
au moins 3 minutes de lecture de plus qu'il n'y a à lire**, jusqu'à
**4,5 fois trop** — « Voyage halal à Istanbul, le guide complet, 9 min »
pour 432 mots, soit deux minutes. Le lecteur ouvre, finit en un tiers du
temps promis, et en conclut que la page est bâclée. Il a raison, et
l'étiquette y est pour beaucoup.

**Réparé comme une règle, pas comme 24 retouches** : `lib/tempsLecture.ts`
calcule le temps à partir du texte réellement servi (200 mots/minute,
questions fréquentes comprises), et `lib/data.ts` l'applique à **tous** les
guides et articles au moment où ils sortent. Les valeurs écrites à la main
restent dans les entrées mais ne s'affichent plus nulle part. Retirer un
paragraphe fait désormais baisser le chiffre tout seul.

**Mesure d'arrivée** : **119 pages servies vérifiées sur les deux
domaines** — 44 guides et 75 articles — **0 temps de lecture faux de plus
d'une minute**. Avant : 16 guides faux sur 24.

### Le guide de l'Aïd en anglais, et le compte s'arrête là — 12 août
**Avant** : 19 guides listés côté anglais. **Après : 20** dans le sitemap
servi, contre 24 côté français — l'écart restant tient à trois doublons
français qui renvoient au même jumeau anglais.

**Ce que je n'ai pas fait, et c'est le point** : le guide français fait
507 mots, le plus court de la série. Je ne l'ai pas étoffé. Ajouter des
sections que personne n'a vérifiées pour « faire un vrai guide » serait
exactement ce qu'on reproche aux fermes de contenu.

**Mesuré** : page anglaise en 200 (592 mots, titre 47 caractères,
description 132), ancien slug français en 301 vers le slug anglais côté EN
et en 200 côté FR, **31 liens internes tous en 200**, sitemap anglais
seulement.

### Le guide « petit budget » en anglais — 12 août
**Avant** : 18 guides sur gohalaltravel.com. **Après : 19.**

**Le choix qui compte ici** : les montants sont recopiés **à l'identique,
en euros**. Les convertir en livres aurait produit des chiffres que
personne n'a relevés — et un prix inventé est un fait inventé, au même
titre qu'une salle de prière inventée.

**Mesuré** : page anglaise en 200 (1 266 mots, titre 49 caractères,
description 144), ancien slug français en 301 vers le slug anglais côté EN
et en 200 côté FR, **34 liens internes tous en 200**, sitemap anglais
seulement.

### Le guide Europe en anglais — 12 août
**Avant** : 17 guides sur gohalaltravel.com. **Après : 18.** Traduit, pas
réécrit : mêmes pays, mêmes mosquées (toutes des monuments publics),
mêmes réserves — « la viande halal est courante mais pas systématique »,
« demandez la composition ». Aucun restaurant nommé.

**Le lien traité plutôt que recopié** : la version française renvoie vers
`/blog/restaurants-halal-paris`, qui a un jumeau anglais déclaré. La
version anglaise pointe directement dessus, au lieu de laisser une 301 au
milieu du texte.

**Mesuré** : page anglaise en 200 (1 256 mots, titre 51 caractères,
description 148), ancien slug français en 301 vers le slug anglais côté EN
et en 200 côté FR, **37 liens internes tous en 200**, sitemap anglais
seulement.

### Le guide Thaïlande en anglais, et le piège des liens sans jumeau — 12 août
**Avant** : 16 guides sur gohalaltravel.com. **Après : 17.** Guide traduit,
pas réécrit : même label CICOT, mêmes quartiers, même réserve
(« adresses précises à vérifier sur place — l'offre évolue vite »).

**Le piège évité, et il valait le détour** : la version française renvoie
vers `/blog/manger-halal-bangkok` et `/guides/voyage-halal-petit-budget`,
qui n'ont **aucun jumeau anglais**. Traduits tels quels, ces deux liens
auraient créé des redirections au milieu du texte — exactement le défaut
réparé le 10 août sur six liens. Ils ont été remplacés par des cibles
anglaises qui existent, pas conservés.

**Mesuré** : page anglaise en 200 (1 251 mots, titre 44 caractères,
description 127), ancien slug français en 301 vers le slug anglais côté
EN et en 200 côté FR, **31 liens internes tous en 200**, sitemap anglais
seulement.

### Le guide Japon existe enfin en anglais — 12 août
**Avant** : 15 guides sur gohalaltravel.com contre 24 sur voyageshalal.fr.
**Après : 16.** Le guide Japon (1 246 mots en français) a été **traduit,
pas réécrit** : mêmes faits, mêmes mosquées, mêmes réserves — « présence à
vérifier avant visite », « adresses précises à vérifier ». Aucun
restaurant nommé n'a été ajouté ni retiré.

**Pourquoi le Japon d'abord** : c'est une destination très recherchée en
anglais, et le guide ne tranche aucune question religieuse — contrairement
au guide « prière en avion et en train », laissé de côté exprès.

**Mesuré après publication** : la page anglaise répond 200 (1 291 mots,
titre 47 caractères, description 134), l'ancien slug français fait bien
une 301 vers le slug anglais sur le domaine EN et reste intact en 200 sur
le domaine FR, **les 32 liens internes répondent tous 200 — aucune
redirection**, et le guide figure dans le sitemap anglais sans polluer le
français.

### Les 1 632 pages passées au crible, la description de repli était coupée — 12 août
**Pourquoi ce cycle** : le précédent n'avait audité que 20 pages et y avait
trouvé 14 défauts. Il fallait savoir ce que valait le reste.

**Mesuré sur l'intégralité des deux sitemaps** — 813 pages en français,
819 en anglais, servies avec l'en-tête `Host` réel : **2 descriptions
coupées, et rien d'autre**. Zéro titre trop long, zéro description
absente, zéro page sans H1, zéro page en erreur.

**Ce que les deux défauts avaient en commun** : ils échappaient au
garde-fou pour deux raisons distinctes, et les deux sont bouchées.
- `lib/seo.ts` portait la description de **repli**, servie à toute page qui
  n'en définit pas : 171 caractères, donc coupée partout à la fois. Le test
  ne lisait que les pages, jamais ce fichier.
- `/destinations` construit sa description avec `${VILLE_COUNT}` ; le test
  sautait toute valeur contenant une interpolation. Il mesure désormais le
  **texte fixe seul** — une borne inférieure, donc sans aucun faux positif.

**Mesure d'arrivée** : **2 → 0**, revérifié en servant les 1 632 pages
après correction. Le test refuse maintenant l'ancienne valeur : vérifié en
la remettant exprès, il crie.

### Le garde-fou des titres ne regardait pas les pages app/ — 12 août
**Trouvé en auditant les deux mines** : `/hotels`, la page qui mène à
Istanbul et Dubaï, servait un titre de **80 caractères** en français et 74
en anglais. Google en coupait vingt : « …souvent moins cher sur
HalalBooking » n'était jamais lu.

**La cause, et c'est la vraie trouvaille** : `scripts/test-titres.mjs` ne
lisait que les gabarits, `lib/data.ts` et `lib/guidesEn.ts`. Or beaucoup de
pages écrivent leur titre directement dans leur `generateMetadata()` — ce
pan-là n'était surveillé par personne. Le test a été étendu à
`app/**/{page,layout}.tsx`, en ne lisant que l'intérieur des
`generateMetadata()` / `export const metadata`.

**Deux erreurs commises et corrigées en chemin**, notées parce qu'elles se
reproduiront : un bloc de `title` qui avalait la `description` suivante
(106 fausses alertes), puis un scan de tout le fichier qui relevait les
`title:` des cartes d'accueil et des étapes de l'Omra (42 fausses alertes).
Un test qui crie à tort finit par ne plus être lu.

**Mesuré** : **14 titres ou descriptions coupés → 0**, vérifié en servant
les 20 pages sur les deux domaines avec l'en-tête Host réel. Le test
tourne à chaque `npm run build` : la page suivante ne peut plus
réintroduire le défaut. **Remesurer sur Search Console à partir du
19-22 août** (Google met 7 à 10 jours).

### Maghreb : la question n'est pas « est-ce halal » mais « quel type d'établissement » — 12 août
**Avant** : 72 fiches sur 354. **Après : 77.** **716 mots uniques en
français, 681 en anglais**, sur 10 pages (Tanger, Rabat, Oran, Agadir,
Djerba).

**Vérifié avant d'écrire** : Casablanca, Marrakech, Fès, Alger et Tunis
avaient déjà leurs quatre sections. La série annoncée les visait — elle
aurait réécrit du travail fait. Cinq autres villes ont été prises à la
place.

**Le fait régional**, qui est la même leçon qu'en Turquie : la viande ne
pose aucune question — porc absent du circuit courant, aucune
certification nécessaire ni existante. Ce qui varie, c'est la **station
balnéaire** : Agadir et Djerba sont bâties sur le « tout compris » avec
bars et plages mixtes, à des kilomètres de la ville marocaine ou
tunisienne ordinaire qu'on retrouve dès le souk. Oran est le cas le plus
simple, la réglementation algérienne sur l'alcool étant plus restrictive.

**Mesuré après publication** : les 5 fiches en 200 sur les deux domaines,
bonne langue dans le HTML visible, aucune trace de l'autre langue, aucune
balise brute, build sans erreur.

### Turquie hors Istanbul : la viande n'est pas le sujet, l'alcool si — 12 août
**Avant** : 67 fiches sur 354. **Après : 72.** **751 mots uniques en
français, 681 en anglais**, sur 10 pages (Ankara, Antalya, Bursa,
Cappadoce, Izmir).

**Pourquoi cette série et pas une autre** : Istanbul est l'une des deux
mines (79 impressions sur les requêtes d'hôtels). Ces cinq fiches sont ses
voisines directes — même pays, mêmes questions, maillage interne naturel.

**Le fait turc** : le porc est quasi absent du circuit courant, donc la
viande n'est pas le sujet — l'alcool l'est, et il est très inégal selon la
ville. Antalya vit du « tout compris » avec bar ouvert ; Bursa, ancienne
capitale ottomane, est à l'opposé ; Izmir est la plus laïque des grandes
villes. Fait vérifiable et rare, écrit sans aller plus loin : la Turquie a
un organisme **public** d'accréditation du halal depuis 2017, là où la
certification est privée partout ailleurs. Aucun hôtel, aucun restaurant,
aucune certification d'établissement n'est nommé.

**Mesuré après publication** : les 5 fiches en 200 sur les deux domaines,
bonne langue servie dans le HTML visible à chaque fois, **aucune trace de
l'autre langue dans le HTML visible**, aucune balise brute, build sans
erreur.

### Afrique subsaharienne : la question s'inverse d'une ville à l'autre — 12 août
**Avant** : 62 fiches sur 354. **Après : 67.** **733 mots uniques en
français, 660 en anglais**, sur 10 pages (Dakar, Abidjan, Lagos, Nairobi,
Le Cap).

**Le fait régional que le voyageur ignore** : ici le pays ne dit rien du
quartier. À Dakar, chercher un logo halal n'a aucun sens — il n'y en aura
pas, et la viande est halal par habitude. À Abidjan, Lagos et Nairobi, la
réponse dépend du quartier et pas du pays : le Nigéria a l'une des plus
grandes populations musulmanes du monde, mais elle est au nord, et Lagos
est au sud. Le Cap est le cas inverse du Brésil vu la veille : l'Afrique
du Sud certifie **pour son marché intérieur**, pas pour l'export — on y
voit des logos halal en supermarché, ce qui n'arrive presque nulle part
ailleurs sur le continent.

**Mesuré après publication** : les 5 fiches en 200 sur les deux domaines,
les quatre sections servies dans la bonne langue à chaque fois, aucune
balise HTML brute (les sections sont rendues en texte). Vérifié aussi : le
texte de l'autre langue voyage dans la charge RSC, mais **4,4 ko sur
934 ko, soit 0,5 %** — mesuré, jugé négligeable, pas de chantier ouvert.

### Amérique latine : la région la plus difficile, et on le dit — 11 août
**Avant** : 57 fiches sur 354. **Après : 62.** **613 mots uniques en
français, 544 en anglais**, sur 10 pages (Mexico, Buenos Aires, São Paulo,
Bogotá, Lima).

**Le choix éditorial du jour** : ne pas habiller le vide. Mexico, Bogotá et
Lima sont annoncées comme difficiles dès la première phrase — communautés
petites, certification quasi inexistante, et surtout **le porc invisible** :
le saindoux entre traditionnellement dans les haricots, les tamales,
certaines tortillas et les fritures colombiennes. Une page qui prétendrait
le contraire tromperait son lecteur.

**Deux exceptions, dites comme telles** :
· **Buenos Aires** — l'une des plus anciennes communautés arabes du
  continent, et un grand centre islamique à Palermo.
· **São Paulo** — le paradoxe brésilien : le pays est l'un des premiers
  exportateurs mondiaux de volaille halal, avec des organismes reconnus,
  **mais cette machine certifie pour l'export, pas pour ses propres
  restaurants**. C'est la nuance que personne n'écrit.

**Le repli est réel, pas un remplissage** : poisson et végétarien au
Mexique, ceviche et cuisine de la côte à Lima — l'une des plus riches du
monde en produits de la mer.

**Vérifié** : les 5 fiches répondent en 200 sur les deux domaines, chaque
repère attendu est présent dans la bonne langue, aucun texte français côté
anglais, et aucune balise HTML brute dans les sections (elles sont rendues
en texte, pas en HTML — piège évité avant publication).

### Europe du Nord : la latitude devient une difficulté réelle — 11 août
**Avant** : 52 fiches sur 354. **Après : 57.** **651 mots uniques en
français, 553 en anglais**, sur 10 pages (Stockholm, Copenhague, Oslo,
Helsinki, Dublin).

**Ce qu'aucune autre série n'a eu à dire : la LATITUDE.** À Oslo et
Helsinki, en juin, la nuit dure deux à trois heures — le créneau entre
Isha et Fajr devient minuscule. C'est un fait astronomique vérifiable, et
le voyageur le découvre sur place s'il n'a pas été prévenu. Les deux pages
le disent.

**Et nous ne tranchons pas ce qu'il faut en faire** : suivre l'horaire de
La Mecque, celui du pays musulman le plus proche, ou un autre avis, est une
question religieuse débattue. Même règle que sur les onze pages « où
prier » — on décrit, on renvoie à HalalGPT ou à l'imam. Vérifié : la
mention est présente des deux côtés, en français comme en anglais.

**Le reste est de la géographie utile** : le halal est dans les quartiers
(Rinkeby et Södertälje à Stockholm, Nørrebro à Copenhague, Grønland à Oslo,
South Circular Road et Clonskeagh à Dublin), pas dans les centres
touristiques. Aucun label d'État dans les cinq pays. Helsinki est présentée
franchement comme la plus difficile, avec des salles discrètes qu'il faut
repérer avant d'arriver. Dublin fait exception sur la latitude, et la page
le dit.

**Vérifié** : les 5 fiches répondent en 200 sur les deux domaines, chaque
repère attendu est présent dans la bonne langue, aucun texte français côté
anglais.

### Balkans et Europe centrale : deux mondes que le voyageur confond — 11 août
**Avant** : 47 fiches sur 354. **Après : 52.** **608 mots uniques en
français, 561 en anglais**, sur 10 pages (Sarajevo, Skopje, Tirana, Sofia,
Prague).

**Ce que ces cinq pages disent ensemble, et qu'aucune ne pouvait dire
seule** : la région se sépare en deux mondes.
· **Sarajevo, Skopje, Tirana** — communautés musulmanes **autochtones**,
  vieilles de plusieurs siècles. La viande y est souvent halal **par
  habitude, sans logo ni certificat**, parce que la question ne se pose pas
  localement. Chercher une étiquette est le mauvais réflexe : on demande.
· **Sofia, Prague** — le halal s'y cherche comme à Berlin, dans des
  adresses turques ou arabes, et le porc est central dans la cuisine.

**La nuance la plus utile de toute la région**, écrite sur Sarajevo et
Tirana : **viande halal ≠ sans alcool**. Beaucoup d'établissements servent
une viande qui convient tout en proposant de l'alcool ; ce sont deux
questions distinctes.

**Et l'histoire est dite** pour Tirana : l'Albanie a connu des décennies
d'athéisme d'État, donc la pratique et l'étiquetage y sont très inégaux.
Prague est présentée franchement comme l'une des villes les plus
difficiles, sans mosquée monumentale.

**Aucun restaurant nommé.** Mosquées historiques, quartiers, fonctionnement
réel du halal — rien d'autre.

**Vérifié** : les 5 fiches répondent en 200 sur les deux domaines, chaque
repère attendu est présent dans la bonne langue, et aucun texte français
n'apparaît côté anglais.

### Quatre villes d'Amérique du Nord ont leurs sections — 11 août
**Avant** : 43 fiches sur 354. **Après : 47.** **516 mots uniques en
français, 460 en anglais**, sur 8 pages (Toronto, Montréal, Chicago,
Los Angeles — New York avait déjà les siennes).

**La vérité nord-américaine que peu de guides écrivent**, et qui vaut plus
que dix adresses : **il n'existe aucun label d'État**, ni aux États-Unis ni
au Canada. La certification est privée et plusieurs organismes coexistent.
Et le vocabulaire courant y ajoute une nuance décisive : **« zabiha
halal » précise le mode d'abattage, « halal » seul ne le garantit pas**.
C'est écrit sur les trois villes concernées.

**La difficulté commune, dite franchement** : ce n'est pas de trouver une
mosquée ou un restaurant, c'est la DISTANCE. À Los Angeles une mosquée à
quinze kilomètres peut demander une heure ; à Toronto et Chicago les
quartiers concernés sont loin du centre. Montréal fait exception, et la
page le dit : ville compacte, métro suffisant.

**Aucun restaurant nommé** : quartiers, institutions publiques et
fonctionnement réel de la certification, rien d'autre.

**Vérifié** : les 4 fiches répondent en 200 sur les deux domaines, les
sections sortent dans la bonne langue, et aucun texte français n'apparaît
côté anglais.

### Cinq villes d'Asie non musulmane ont leurs sections — 11 août
**Avant** : 38 fiches sur 354 avec les quatre sections. **Après : 43.**
**671 mots uniques en français, 563 en anglais**, sur 10 pages
(5 villes × 2 domaines).

Villes traitées, choisies là où le voyageur doute vraiment : **Séoul,
Taipei, Hong Kong, Delhi, Colombo**. En pays musulman la réponse est « tout
est halal » et la page sert peu ; ici la question se pose à chaque repas.

**Aucun restaurant nommé.** Uniquement des institutions vérifiables par
n'importe qui — grandes mosquées, organismes de certification — et des
quartiers. Et les difficultés sont dites, pas gommées : à Séoul le porc et
l'alcool de cuisine sont partout et les bouillons contiennent souvent de
l'anchois ; à Hong Kong le saindoux est un ingrédient de base de la cuisine
cantonaise ; à Delhi beaucoup de cuisines mélangent halal et non-halal, le
végétarien restant le repli sûr ; à Colombo la vigilance porte sur les
hôtels de bord de mer.

**Ce qui distingue Taipei** : Taïwan a fait de l'accueil des voyageurs
musulmans une politique publique — c'est l'une des rares destinations
d'Asie de l'Est avec des espaces de prière hors des mosquées.

**Vérifié** : les 5 fiches répondent en 200 sur les deux domaines, les
sections sortent en français sur voyageshalal.fr et en anglais sur
gohalaltravel.com, et aucun texte français n'apparaît côté anglais.

### Les 11 pages « où prier » sont terminées : 2 853 → 10 270 mots — 11 août
**L'élément est clos.** Onzième et dernière page approfondie : **Nice**,
185 → 832 mots en français, 170 → 764 en anglais.

**Le total de la série** : 2 853 mots au départ, **10 270 aujourd'hui** en
français — moyenne **259 → 934 mots** par page. (Somme des onze corps
d'article ; les pages rendues, navigation et pied de page compris, pèsent
14 634 mots.) Trois versions anglaises ont été créées au passage — gares de Paris,
Marseille, Toulouse — sur un domaine presque vide.

**LE DÉFAUT DE FOND, trouvé en travaillant et corrigé sur huit pages** :
elles tranchaient une question religieuse (« la prière du voyageur
raccourcie et regroupée », « c'est prévu par la religion »), alors que le
site dit partout ailleurs qu'il ne tranche pas et renvoie à HalalGPT. Ce
n'était pas un accident isolé mais un réflexe de gabarit, présent dans le
guide-mère comme dans les fiches. Il a disparu de la série.

**Ce que chaque page dit maintenant qu'elle ne disait pas** : le côté des
contrôles (CDG), l'heure de fermeture (Orly), la salle côté ville (Lyon),
l'ouverture 24h/24 (Bruxelles), la pièce partagée (Genève), le 3ᵉ étage
(Toulouse), l'autre terminal (Nice), l'absence totale de salle (Marseille),
la règle des 45 minutes (gares de Paris).

**Aucun emplacement inventé.** Les emplacements existants ont reçu leur
provenance — informations publiques des aéroports et témoignages, jamais
une vérification de notre part — et les pages écrivent noir sur blanc ce
que nous ne savons pas : horaires, ablutions, et côté des contrôles.

**Vérifié sur les deux domaines pour les 11 paires** : bonne langue,
titres sous 60 caractères, descriptions sous 160, hreflang réciproque,
liens internes en 200.

### Toulouse : un espace au 3ᵉ étage, donc une question de temps — 11 août
Dixième page « où prier » approfondie, et **création de sa version
anglaise**, qui n'existait pas. **Avant** : 193 mots, aucun jumeau anglais.
**Après : 811 mots en français, 747 en anglais.**

**La contrainte que personne ne mentionne** : l'espace est au 3ᵉ étage du
Hall C. Il faut y monter, prier, et redescendre. La vraie question n'est
donc pas « où est-ce » mais « ai-je le temps ». La page donne la règle :
**plus de 40 minutes, on monte ; en dessous, un coin calme près de la
porte**, en rappelant que l'embarquement ferme 20 minutes avant le
décollage.

**Trois aveux au lieu de trois suppositions** : nous ne connaissons ni les
horaires, ni la présence d'un espace d'ablutions, **ni si l'espace est
avant ou après les contrôles** — et ce dernier point décide de tout. La
page dit de le demander au comptoir information, avec le mot qui obtient
une réponse (« espace de recueillement »).

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 54 et 50
caractères, descriptions à 146 et 144, hreflang réciproque, 11 liens
internes en 200 de chaque côté, page anglaise dans le sitemap EN et absente
du sitemap FR.

### Genève : ce n'est pas une salle de prière, c'est une pièce partagée — 11 août
Neuvième page « où prier » approfondie. **Avant** : 208 mots en français,
194 en anglais. **Après : 789 et 714.**

**Ce que la page ne disait pas franchement** : l'espace de Cointrin est un
**espace de recueillement multiconfessionnel**, pas une salle musulmane, et
il est **petit**. D'autres personnes peuvent l'occuper en silence pour tout
autre chose. La page le dit maintenant, avec les deux conséquences
pratiques : viser un moment creux, et prévoir un repli près de la porte
plutôt que d'attendre.

**Septième page de la série avec la même contradiction, réparée** : elle
tranchait une question religieuse (« Prière du voyageur raccourcie et
regroupée »). Le réflexe de gabarit est maintenant éliminé sur toute la
série.

**Provenance et prudence** : les tapis et le Coran viennent des
informations publiques de l'aéroport — c'est écrit — et la page conseille
de **garder son tapis de poche** plutôt que de compter dessus, une mise à
disposition pouvant disparaître sans annonce. Aucun horaire publié : nous
n'en avons pas de fiables.

**Vérifié sur les deux domaines** : 11 h2 de chaque côté, titres à 44
caractères, descriptions à 157 et 146, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Bruxelles : l'inverse exact de Lyon, et c'est une bonne nouvelle — 11 août
Huitième page « où prier » approfondie. **Avant** : 221 mots en français,
201 en anglais. **Après : 765 et 732.**

**Ce que la page ne disait pas, et qui la rend utile** : à Zaventem les
salles sont **après les contrôles** et **ouvertes 24h/24**. C'est l'exact
inverse de Lyon (salle côté ville) et la réponse au défaut n° 1 relevé à
Orly (fermeture vers 22h qui rend Fajr et Isha inaccessibles). Pour un vol
de nuit ou un premier vol du matin, c'est l'aéroport le plus simple de la
série — dit en tête, avec la conséquence : si tu es encore côté ville, tu
ne peux pas y aller, passe les contrôles d'abord.

**Sixième page de la série avec la même contradiction**, réparée : elle
tranchait une question religieuse (« Prière du voyageur raccourcie et
regroupée »).

**Ce que nous n'affirmons pas** : la présence d'un espace d'ablutions. Nous
n'en avons pas trace, donc nous ne l'écrivons pas — et c'est justement ce
que la page demande à la communauté.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 47 et 46
caractères, descriptions à 147 et 144, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Lyon : la salle existe, mais elle est côté ville — 11 août
Septième page « où prier » approfondie, la plus courte qui restait.
**Avant** : 224 mots en français, 207 en anglais. **Après : 850 et 759.**

**L'information qui manquait, et qui coûte cher** : le centre spirituel de
Saint-Exupéry est **entre les deux terminaux**, donc **côté ville**. Une
fois les contrôles passés, il est inaccessible — on ne repasse pas la
sécurité pour prier. Aucune page ne le disait, et c'est pourtant le seul
point qui décide de la journée du voyageur. Il est maintenant en tête, dans
le titre de section et dans la description.

**Cinquième page de la série où je trouve la même contradiction** : elle
tranchait une question religieuse (« prière du voyageur raccourcie et
regroupée »). C'était un réflexe de gabarit, pas un accident.

**Horaires** : nous ne les publions pas. Ils sont affichés sur place et
changent ; la page le dit au lieu d'inventer une plage.

**Vérifié sur les deux domaines** : 11 h2 de chaque côté, titres à 56
caractères, descriptions à 153 et 150, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Marseille : la seule page où la réponse est NON — 11 août
Sixième page « où prier » approfondie. **Avant** : 250 mots, aucun jumeau
anglais. **Après : 814 mots en français, 759 en anglais.**

**Trois défauts, pas un seul.** La page tranchait une question religieuse
(« en profitant des facilités du voyageur », « le tayammoum reste une
option ») — même correction que le guide aéroports, Orly et les gares. Elle
affirmait aussi que « plusieurs mosquées existent autour de Marignane »
sans que nous en ayons vérifié une seule : remplacé par l'outil, qui
s'appuie sur des données à jour. Et elle n'avait pas de version anglaise.

**Ce qui fait sa valeur** : c'est la seule page de la série où la réponse
est non. Une page qui dit franchement « il n'y a rien, voilà comment
faire » vaut mieux que dix pages qui promettent une salle. La vraie réponse
est écrite en clair : prier AVANT d'arriver à l'aéroport.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 56 et 51
caractères, descriptions à 159 et 134, hreflang réciproque, 10 liens
internes en 200 de chaque côté, page anglaise dans le sitemap EN et absente
du sitemap FR.

### Les gares de Paris : 322 → 940 mots, et une version anglaise créée — 11 août
Cinquième page « où prier » approfondie. **Avant** : 322 mots, et **aucun
jumeau anglais**. **Après : 940 mots en français, 843 en anglais** — une
page de plus sur un domaine presque vide. Traduire n'est pas créer.

**Même défaut que le guide aéroports, réparé** : la page tranchait une
question religieuse (« les facilités du voyageur existent pour ça :
raccourcir, regrouper », « c'est prévu par la religion »). Elle décrit
maintenant la question et renvoie à HalalGPT.

**Ce qui a été ajouté** : la règle des 45 minutes (sortir, rester, ou ne
pas bouger), les endroits qui marchent dans une gare et ceux qui ne
marchent pas, l'avertissement du bagage laissé sans surveillance, les
toilettes payantes pour les ablutions, et Maghrib comme prière difficile en
gare — créneau court au pic des départs du soir.

**Rien d'inventé** : aucune salle de quartier n'est nommée, précisément
parce que ce sont celles que nous n'avons pas vérifiées, et la page le dit.
Le seul lieu cité est la Grande Mosquée de Paris, institution publique,
avec une distance donnée comme ordre de grandeur.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 49 et 44
caractères, descriptions à 134 et 141, hreflang réciproque dans les deux
sens, 11 liens internes en 200 de chaque côté, page anglaise présente dans
le sitemap EN et dans /blog EN, absente du sitemap FR.

### Le domaine anglais renvoyait vers des adresses françaises — 11 août
**Mesuré** avec un outil neuf, `scripts/audit-liens-internes.mjs` : sur 189
liens internes distincts du domaine anglais, **6 faisaient une 301** — dont
`/horaires-priere`, présent dans la barre de prière, donc **sur les 816
pages**. Un lien interne qui redirige coûte un aller-retour au visiteur et
du budget d'exploration à Google, et affiche une adresse française à un
public anglophone.

En suivant les trois derniers, un défaut plus visible est apparu :
**l'accueil anglais affichait trois titres de guides en français**
(« Voyage halal pour débutants », « Pratique »), parce que
`guides.slice(0, 3)` prenait les trois premiers guides du fichier sans
regarder la langue. Sur la page la plus importante du domaine anglais, et
sous le radar de l'audit de langue : trois titres pèsent peu face à une
page entière.

**Après** : 187 liens sur le domaine anglais, **0 redirigé** ; 208 côté
français, **0 redirigé**. L'accueil anglais annonce « Halal Travel for
Beginners ». Réparé dans les composants partagés avec `localizedHref`, pas
lien par lien.

### Le guide aéroports tranchait une question religieuse — 11 août
Quatrième page « où prier » approfondie. **Avant** : 453 mots en français,
305 en anglais. **Après : 1 134 et 914.** Total des onze pages :
5 919 → 7 296 mots.

**Le vrai défaut n'était pas la longueur.** La page écrivait « le voyageur
peut raccourcir les prières de 4 à 2 rakats, et regrouper dhuhr avec asr »
comme une règle établie, alors que partout ailleurs nous disons que nous ne
tranchons pas les questions religieuses et renvoyons à HalalGPT. La
contradiction était dans le guide-mère de la série.

**Vérifié sur les deux domaines** : 12 h2 de chaque côté, titres à 58 et 49
caractères, descriptions à 145 et 123, 26 et 18 liens internes tous en 200.

### Audit de langue passé de 7 % à 100 % des pages — 11 août
L'échantillon de 120 pages avait trouvé le défaut de `/privacy` ; restait à
savoir s'il en cachait d'autres. **Mesuré maintenant sur la totalité des
deux sitemaps : 813 pages sur voyageshalal.fr et 816 sur gohalaltravel.com,
soit 1 629 pages — zéro défaut.**

Aucune page servie dans la mauvaise langue, aucune page sans H1, aucune
description absente, aucune page quasi vide sur les deux domaines.

**Non branché sur le build, volontairement** : la passe complète prend
plusieurs minutes et exige un serveur de production démarré. Le mode
échantillon (60 pages par domaine, quelques secondes) reste l'outil de
tous les jours ; la passe complète se relance à la main après tout
changement de gabarit ou de traduction.

### La politique de confidentialité était en français sur le domaine anglais — 11 août
**Trouvé en mesurant, pas en supposant.** Nouvel outil :
`scripts/audit-langue.mjs`, qui interroge les deux domaines depuis
l'extérieur (en-tête Host, donc `http.request` et non `fetch`, qui supprime
cet en-tête) et compte les MOTS OUTILS exclusifs à chaque langue plutôt
qu'un mot isolé.

**Avant** : 120 pages échantillonnées sur les 1 629 des deux sitemaps,
**1 défaut** — `gohalaltravel.com/privacy` : titre et description anglais,
mais **579 mots de corps en français** (51 mots outils français contre 11
anglais), et l'application s'y présentait sous le nom « VoyagesHalal ».
Seules les métadonnées avaient été traduites.

C'est le défaut le plus grave d'un site bi-domaine, sur la pire page
possible : celle qu'on lit précisément parce qu'on se méfie, et celle que
réclament les magasins d'applications. Elle passait sous le radar parce
qu'aucun lien de navigation ne la met en avant.

**Après** : 120 pages, **0 défaut**. `/privacy` sort en anglais sous le nom
GoHalalTravel, `/confidentialite` est inchangée en français. Rien
d'inventé : l'adresse de contact reste celle qui existe réellement.

### Orly : 263 → 1 249 mots, et le vrai piège est l'HEURE — 11 août
Troisième page « où prier » approfondie, après Disneyland et CDG. **Avant** :
263 mots en français, 257 en anglais. **Après : 1 249 et 1 168.** Total des
onze pages : 4 685 → 5 919 mots.

**Ce qui manquait, et qui est propre à Orly** : la salle ferme vers 22h dans
un aéroport qui fait décoller à 6h et atterrir après minuit. Le défaut n° 1
n'est donc pas de trouver la salle, c'est de la trouver ouverte — et
**Fajr** est structurellement hors plage une grande partie de l'année,
Isha l'étant en hiver. La page le dit maintenant en tête, avant tout
emplacement.

**Deuxième piège écrit** : les terminaux ont été renumérotés (Orly Sud et
Ouest → Orly 1 à 4), donc la plupart des repères qui circulent en ligne
sont dans l'ancien vocabulaire.

**Provenance qualifiée**, comme pour CDG : les emplacements viennent des
informations publiques de l'aéroport et de témoignages, pas d'une
vérification sur place. Aucun nouvel emplacement ajouté, et deux aveux
francs : Orly 3 (aucun lieu de culte connu de nous) et Orly 1-2 (nous ne
savons pas s'il y a un espace musulman distinct).

**Vérifié sur les deux domaines** : FR en `lang=fr`, EN en `lang=en`, 15 h2
de chaque côté, titres à 54 et 55 caractères, descriptions à 158 et 137,
hreflang réciproque, liens internes en 200. Temps de lecture 4 → 7 min.

### CDG : 308 → 1 207 mots, et le vrai piège enfin écrit — 11 août
Deuxième page « où prier » approfondie après Disneyland. **Avant** : 308
mots en français, 272 en anglais. **Après : 1 207 et 1 114.** Total des
onze pages : 3 506 → 4 685 mots.

**Une affirmation a été qualifiée**, comme pour Disneyland. La page donnait
les emplacements (Terminal 1 niveau 2, 2E côté portes L, 2F aux arrivées)
comme des faits établis. Ils viennent des informations publiques de
l'aéroport et de témoignages de voyageurs — c'est écrit maintenant, avec
la raison : un aéroport de cette taille est en travaux permanents.

**Ce qui manquait vraiment, et qui n'était nulle part** : le piège du côté
des contrôles. Un espace après la sécurité ne sert à rien quand on vient
d'atterrir, et on ne repasse pas un contrôle pour aller prier. C'est la
question à se poser AVANT de traverser le terminal.

Ajouté sans rien inventer : le mot qui obtient une réponse au comptoir
(« lieu de culte », pas « salle de prière »), les ablutions dans des
toilettes à capteurs, **Fajr** pour les vols matinaux et **Maghrib** en
hiver, la fermeture de l'embarquement 20 minutes avant le décollage comme
vraie heure limite, et l'aveu franc pour les terminaux 2A à 2D et 3 :
**nous ne savons pas**, et nous n'inventerons pas.

**Vérifié sur les deux domaines** : FR en `lang=fr`, EN en `lang=en`,
14 h2 de chaque côté, titres à 51 et 54 caractères, descriptions à 152 et
141, hreflang réciproque FR ↔ EN, et les 8 liens internes des deux versions
répondent en 200 sur le bon domaine. Temps de lecture corrigé (4 → 7 min).

### `force-dynamic` réexaminé — et un vrai défaut trouvé au passage — 11 août
**La prémisse de l'élément était fausse**, et c'est la mesure qui l'a dit :
sur les 39 fichiers concernés, 31 sont des routes /api où le réglage n'a
aucun effet sur le rendu, et **les 8 pages restantes lisent toutes le
domaine** (`getDomainSEO`). Aucune ne peut donc être rendue en statique :
il n'y avait rien à retirer.

**Vérification qui comptait vraiment** : aucune page HTML n'est rendue en
statique sur les deux domaines — donc zéro risque de servir la mauvaise
langue par mise en cache. Seuls quatre fichiers l'étaient : l'icône, l'audio
de l'adhan… **et le manifeste**.

**LE DÉFAUT** : le manifeste PWA était identique sur les deux domaines.
Qui installait l'application depuis gohalaltravel.com obtenait sur son
écran d'accueil une icône nommée « VoyagesHalal.fr — Guide Voyage Halal »,
une description en français, `lang: fr`, et des raccourcis vers
/horaires-priere au lieu de /prayer-times. Tous les jours, sur son
téléphone.

Il passait sous le radar parce qu'un manifeste ne s'affiche nulle part :
il ne se voit qu'au moment de l'installation.

**Mesuré après** : `GoHalalTravel — Halal Travel Guide`, `lang: en`, et les
raccourcis pointent vers `/notebook` et `/prayer-times` sur le domaine
anglais ; le français est inchangé.

### Disneyland Paris, notre meilleure page, était la plus courte — 11 août
22 des 29 clics du site sur 7 jours viennent d'elle. Elle faisait **226
mots**, la plus courte des onze pages « où prier », derrière le guide
aéroports (453).

**Après : 879 mots en français, 799 en anglais.** Total des onze pages :
2 853 → 3 506 mots.

**Et une affirmation a été qualifiée.** La page annonçait « le parc met à
disposition un espace calme, accessible sur simple demande » comme un
fait. Nous ne l'avons jamais vérifié — l'information vient de témoignages.
C'est écrit noir sur blanc maintenant : « nous ne l'avons pas vérifié
nous-mêmes », avec ce qui est établi (le City Hall est le point d'accueil,
donc le bon endroit où demander) et ce qui ne l'est pas (qu'un espace soit
libre à cette heure-là). Vérifié sur les deux domaines.

Ce qui a été ajouté sans rien inventer : quoi faire si on te dit non
(quatre solutions), les ablutions dans des toilettes très fréquentées,
**Maghrib** comme la seule prière vraiment problématique (été comme
hiver), et le tapis de poche au contrôle des sacs. Aucune adresse, aucun
lieu précis que nous n'aurions pas vérifié.

### 14 villes d'Europe ont leurs sections « manger » et « prier » — 11 août
**Avant** : 24 fiches sur 354. **Après** : **38**, soit **2 634 mots
uniques** de plus sur 28 pages (14 villes × 2 domaines).

Berlin, Amsterdam, Bruxelles, Vienne, Rome, Madrid, Milan, Munich, Genève,
Lyon, Marseille, Birmingham, Manchester, Rotterdam.

**Pourquoi l'Europe et pas le Golfe** : en pays musulman la réponse est
« tout est halal », la page est vite écrite et sert peu. En Europe, c'est
là que le voyageur doute — donc là que nous avons quelque chose à dire.

Deux vérités européennes que peu de guides écrivent franchement, et qui
valent plus que dix adresses :
 · **aucun label d'État n'existe en Europe** — la certification est privée
   et diffère d'un organisme et d'un pays à l'autre ;
 · **« viande halal » ne veut pas dire « sans alcool »** — beaucoup de
   restaurants à viande halal servent du vin. Deux questions distinctes.

Et les difficultés sont dites, pas gommées : à Madrid le jambon est partout
y compris là où on ne l'attend pas, à Munich la cuisine bavaroise tourne
autour du porc, à Milan il n'y a pas de grande mosquée visible, à Marseille
il n'y a pas de mosquée centrale — le projet n'a jamais abouti.

Vérifié : les sections sortent en français sur voyageshalal.fr et en anglais
sur gohalaltravel.com, et les 1 629 pages restent à zéro titre coupé, zéro
description coupée, zéro H1 manquant, zéro page lente.

### 14 villes ont leurs sections « manger » et « prier » — 11 août
**Avant** : 10 fiches sur 354 (Istanbul et Dubaï en faisaient déjà partie).
**Après** : **24 fiches**, soit **2 485 mots uniques** ajoutés sur 28 pages
(14 villes × 2 domaines).

Villes traitées, choisies sur la demande halal réelle et non sur le volume
de données : Kuala Lumpur, La Mecque, Médine, Londres, Casablanca, Fès,
Singapour, Doha, Abu Dhabi, Sharjah, Amman, Le Caire, Tunis, Alger.

**Rien d'inventé** : aucun restaurant nommé, aucune salle de prière que
nous n'aurions pas vérifiée. Uniquement des quartiers, des mosquées
majeures et les organismes de certification officiels (JAKIM en Malaisie,
MUIS à Singapour, HMC et HFA au Royaume-Uni) — tout est vérifiable par
n'importe qui. Là où la nuance compte, elle est écrite : « no pork » n'est
pas « halal » à Kuala Lumpur ; à Singapour le stand voisin du stand
certifié ne l'est pas ; Sharjah est le seul émirat entièrement sans alcool.

Vérifié sur les deux domaines : les sections sortent bien en français sur
voyageshalal.fr et en anglais sur gohalaltravel.com, et les 1 627 pages
restent à zéro titre coupé et zéro description coupée.

### Les 6 guides pratiques ont leur version anglaise — 11 août
Ils n'existaient qu'en français : repas MOML en avion, ablutions, heure de
prière en vol, voile au contrôle, voyager voilée, toilettes sans douchette.
Traduire n'est pas créer — cela ne consomme pas la limite de 2-3 contenus
par jour.

**Mesuré après** : 23 articles anglais (17 avant), **25 paires FR/EN
déclarées** (19 avant). Les 6 pages répondent en 200 sur le domaine
anglais, apparaissent dans /blog et dans le sitemap EN, et l'ancienne URL
française y fait bien une 301 vers le slug anglais.

**Réciprocité hreflang vérifiée dans les deux sens** sur les 6 paires :
chaque page FR déclare sa jumelle EN, et chaque page EN déclare sa jumelle
FR — jamais vers une URL qui redirige.

Titres tous sous 62 caractères (37 à 49), descriptions sous 160 (135 à
156). Les 14 liens internes des articles anglais pointent vers des pages
anglaises qui existent (`/prayer-times`, `/mosque-near-me`,
`/guides/halal-travel-checklist`…) — vérifié un par un.

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
