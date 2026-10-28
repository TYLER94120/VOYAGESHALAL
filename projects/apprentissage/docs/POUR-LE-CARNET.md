# Pour le carnet de mesures — islampasapas.fr

## Pourquoi ce fichier existe, et ce que tu dois en faire

`docs/MESURES.md`, le carnet de l'empire, dit aux agents, point 6 :

> **« Notez vos changements majeurs dans la section du mois : sans ça, aucune
> variation n'est attribuable à une cause. »**

Je ne l'avais jamais fait. Depuis le relevé du 21 août, le carnet ne contient
**rien** sur islampasapas.fr, alors que les rondes des autres sites y sont
toutes — 25, 27, 28, 29 août et la suite. Cinquante nuits de travail sur ce
site n'existent que dans les messages de commit de sa branche.

Ce fichier-ci est le texte à **recopier dans `docs/MESURES.md`**, prêt à
coller. Il n'est pas écrit directement dans le carnet pour une raison simple :
le carnet vit sur `main`, et la consigne de ce projet est de ne jamais pousser
sur `main` — tu promeus toi-même. Un carnet modifié sur ma branche ne serait
lu par personne et entrerait en conflit à la première fusion.

**Dis-moi si tu préfères que je l'écrive directement**, et sur quelle branche.

---

## À COLLER DANS LE CARNET, À PARTIR D'ICI

# 📖 islampasapas.fr — RONDES DU 26 SEPTEMBRE AU 22 OCTOBRE 2026

> Le corps de cette note a été écrit le 14 octobre. Les ajouts datés des
> 21 et 22 octobre sont signalés à leur place : deux lignes dans le tableau
> des décisions, et la dernière section. Le reste n'a pas été revérifié
> depuis le 14, sauf le nombre de contrôles.

**Aucune donnée nouvelle.** Le dernier relevé de ce site reste celui du
21 août : 12 impressions, 0 clic, position 38,8, quatre pages visibles.
Search Console n'est pas accessible depuis l'environnement des rondes, et le
carnet n'a aucune table Requêtes pour ce site.

## ⚠️ CE QUI A CHANGÉ N'EST PAS EN LIGNE

**Rien de ce qui suit n'a été publié.** Tout est sur la branche
`claude/islamic-learning-platform-l7o7to`, en attente de promotion. Google
n'a donc rien pu voir, et **aucune variation du prochain relevé ne sera
attribuable à ces changements.** C'est l'inverse de ce que le point 6
cherche, et il faut le dire avant de lire le prochain relevé.

État de la production : **non vérifié.** Le site n'est pas joignable depuis
le conteneur des rondes (code 000). Mon propre registre dit que la
production datait du 28 septembre, mais je ne peux pas le confirmer d'ici.

## CE QUI TOUCHE À CE QUE GOOGLE VOIT, DATÉ

| date | changement | surface |
|---|---|---|
| 1ᵉʳ oct. | la page 404 renvoie enfin le code 404, et pas 200 | signal d'indexation |
| 7 oct. | les 38 titres de leçon prennent leur nombre de versets — « Sourate Al-Ikhlas : traduction, texte arabe, 4 versets » | titres |
| 7 oct. | description de l'accueil réécrite, 132 → 153 caractères, deux nombres comptés | description |
| 8 oct. | une date `lastmod` **par page** dans le sitemap, au lieu de la même pour les 53 | signal de recrawl |
| 9 oct. | un `<h2>` sur le bloc des versets des 38 leçons ; le seul titre de la page était « Continuer » | structure |
| 10 oct. | `educationalLevel` des 11 pages de section : les niveaux réellement présents au lieu de « debutant » pour toutes | données structurées |

Le reste des rondes — une vingtaine — porte sur des fautes que Google ne voit
pas : écrans de jeu, mémoire du téléphone, contrôles. Elles ne peuvent
expliquer aucune variation.

## 🔴 DEUX MESURES QUI CHANGENT LA LECTURE DE CE SITE

**1. Les 11 couvertures de section ne sortiront jamais, et aucun titre n'y
changera rien.** Classement de la tête des 53 titres — ce que Google met en
gras — le 13 octobre :

| | pages | lesquelles |
|---|---|---|
| nomme une chose précise | 39 | les 38 leçons + `/sourates.html` |
| vise un sujet large | 14 | l'accueil, `sections.html`, les 11 couvertures, `plus.html` |

Les quatre pages visibles totalisent les 12 impressions du site : il ne reste
rien pour les 49 autres. Les 11 couvertures — « La prière », « Le
pèlerinage », « Vocabulaire arabe » — visent toutes une requête large. La loi
de la précision l'avait prédit. Soigner ces titres serait du travail propre
sans effet.

**2. `/sourates.html` montre que précis ne suffit pas.** « Les 114 sourates
du Coran » est précis, et la page est en position 49 avec 7 impressions — le
maximum du site. La requête est déjà tenue par tous les sites du Coran. Même
constat que la page d'hôtels d'Istanbul du carnet : « perdu d'avance ».

➡️ **Précis ET pas déjà tenu.** Les deux, sinon rien.

## CE QUE LA PROPRIÉTÉ SEARCH CONSOLE BLOQUE, ET ÇA COMPTE DOUBLE

La propriété est en « préfixe d'URL » et pas en « Domaine ». Elle bloque :

- **le levier 1** — les titres des pages en position 5-15. Le point 4 du
  carnet en fait la priorité ; ici ce sont l'accueil (6,5) et al-Ikhlas (11).
  Sans les requêtes, « mettre les mots exacts de la requête en début » n'est
  pas applicable : on ne les connaît pas.
- **le levier 2** — le critère qui décide quelle sourate mérite une leçon.
  Le juz 'Amma est complet depuis le 16 septembre ; aller plus loin demande
  un critère écrit, et la loi de la précision en donne la forme : une leçon
  vaut d'être faite quand sa requête est précise et pas déjà tenue. Il manque
  un chiffre par sourate — combien de gens tapent « sourate al-mulk ». Il est
  dans Search Console.

## CE QUI ATTEND UNE DÉCISION D'ÉDITEUR

| sujet | la mesure | ce qu'il faut trancher |
|---|---|---|
| **juz 29** (sourates 67 à 77) | 11 sourates, 431 versets. Les 38 leçons actuelles en font 571. +29 % de pages pour +75 % de versets. Leçon médiane : de 11 versets à 40. Texte arabe et traduction Hamidullah présents pour les onze, sans trou. | ouvrir ou non une nouvelle unité du mushaf |
| **ou neuf sourates courtes** (22 oct.) | Le levier 2 dit « une leçon par sourate **courte** ». Mesuré : **9 sourates hors du lot ont 20 versets ou moins** — Al-Jumu'a 11, Al-Munafiqun 11, At-Talaq 12, At-Tahrim 12, Al-Mumtahana 13, As-Saff 14, Al-Hujurat 18, At-Taghabun 18, Al-Muzzammil 20. **129 versets en tout**, contre 431 pour le juz 29 : +24 % de pages pour +23 % de versets, au lieu de +29 % pour +75 %. Les deux jeux de données (arabe et Hamidullah) concordent sur les neuf, sans trou. Une seule, Al-Muzzammil, appartient au juz 29 : les deux options ne se recouvrent presque pas. | **Le coût n'est pas le même, et la cohérence non plus.** Le lot actuel a un nom — Al-Fatiha et le juz Amma, une unité reconnue. Neuf sourates dispersées (49, 60-66, 73) n'en forment aucune : un lecteur verrait un ensemble arbitraire. C'est ce choix-là qui est à toi, pas le volume |
| **taille du texte** | 102 `font-size` en px, 27 à 12 px ou moins, zéro en rem. Le réglage du téléphone n'a aucun effet. Passer en rem ne suffirait pas : à 320 px, 2 651 cartes sur 2 701 sont déjà à la plus petite échelle et 96 % demandent de faire glisser. Il faudrait que les cartes s'allongent au lieu de se réduire. | une refonte de la façon dont une carte répond à un débordement |
| **deux titres de section** | « Le comportement » (64 car.) et « Vocabulaire arabe » (65) dépassent 60 et retombent sur le nom seul. Raccourcir leur champ `quoi` de 5 caractères les ferait tenir. `quoi` est une valeur du cahier V2. | raccourcir ou non deux phrases du cahier |
| **« 2 701 questions »** | 65 versets produisent une carte dans deux ou trois sections — la prière et l'aumône, que le Coran associe sans cesse. 138 cartes, 5,1 % du paquet. En comptant chaque verset une fois : 2 628. | garder 2 701, qui est le nombre de cartes, ou annoncer 2 628 |
| **quatre sections sous le plancher** (21 oct.) | Le cahier demande 100 questions par section. Piliers 89, comportement 11, jeûne 8, pèlerinage 7 — et elles sont en ligne. Mesure par la méthode du projet (un verset n'entre dans un domaine que si l'arabe **et** le français le désignent) : le Coran entier porte **9 versets sur le jeûne et 18 sur le pèlerinage**. Avec les deux formes de carte du site, plafond 26 et 41. **Ces deux-là ne peuvent pas atteindre 100.** Piliers (106) et comportement (115) peuvent, mais en devenant des sections d'exercices de traduction. | garder petites ou refermer — et, pour deux d'entre elles, accepter de changer leur nature |
| **une traduction de hadiths** (21 oct.) | Ces quatre sections sont celles qui devaient reposer sur des hadiths. Le dépôt en contient 20 426 en français (Boukhari 7 589, Mouslim 7 563, Abou Dawoud 5 274) et **aucun n'est citable** : leurs métadonnées ne nomment aucun traducteur, et leurs titres de chapitres sont restés en anglais — « Revelation », « Belief », « Knowledge ». Traduction de traduction. | acheter ou obtenir une traduction française de hadiths **avec un traducteur nommé**. C'est le seul blocage du site qui se lève par une décision et non par du travail |

## LA QUESTION QUE LE CARNET POSAIT LE 21 AOÛT

> « À vérifier au prochain relevé : Indexation → Pages, pour distinguer
> "peu de pages au total" de "pages découvertes mais non indexées". »

Toujours sans réponse. De ce côté-ci, tout est vérifié : 53 adresses
indexables, `robots.txt` qui n'interdit rien, sitemap à jour avec une date
par page, `noindex` sur les seuls écrans de jeu. La distinction se lit dans
Search Console.

## L'ÉTAT DES CONTRÔLES

39 contrôles, tous verts : 9 en Python, 30 de navigateur. Chacun a été vu
échouer volontairement avant d'être gardé.

Deux ont été trouvés **menteurs** pendant la période, et c'est le genre de
chose que ce carnet doit retenir :

- `document.fonts.check('16px Amiri')` répondait **vrai avec zéro police
  chargée**. Le contrôle de cadrage affichait « on mesure sur la vraie
  police » depuis des semaines sans pouvoir échouer. Les polices du site
  viennent de Google, et tous les contrôles coupent le réseau : **aucune
  mesure de mise en page n'avait jamais été prise avec les vraies polices.**
  Conséquence directe : une faute annoncée à 39 exemplaires le 4 octobre en
  avait **une** sur un vrai téléphone.
- une ligne de bilan qui disait « aucune section ne désigne sa bonne
  réponse » **même quand le contrôle venait d'en trouver une**.

## 🔴 UNE LEÇON DU 22 OCTOBRE QUI VAUT POUR LES CINQ SITES

**Une liste de formulations de repli préfère silencieusement celles qui
disent le moins.**

`faire-lecon-sourate.py` écrit cinq descriptions possibles par page, toutes
vraies, et retient **la première qui tient dans la fenêtre de 150 à 160
caractères**. Le mécanisme est bon. Mais deux des cinq ne disaient pas le
**numéro de la sourate**, et elles étaient en tête de liste : elles
gagnaient donc dès que leur longueur tombait dans la fenêtre.

Mesuré sur les 38 pages servies en local : **20 descriptions sur 38 ne
portaient pas le numéro de leur sourate** — dont celle d'**al-Ikhlas**, la
seule page de ce site qui ressorte en **position 11**, celle dont le relevé
du 21 août dit « le format qui marche ».

Or « sourate 112 » est exactement ce que la loi de la précision désigne
comme notre terrain. Une page qui n'écrit jamais « 112 » dans sa description
ne peut pas y répondre, et la description est la seule ligne que Google
affiche sous le titre. Le titre, lui, ne pouvait pas le prendre : celui
d'al-Mutaffifin fait déjà 59 caractères pour une règle à 60.

**Correction :** les trois formulations qui portent le numéro passent
devant, les deux autres restent en secours. Résultat mesuré : **38 sur 38**,
et aucune ne sort de la fenêtre. Vingt pages changent d'une seule ligne, en
trois endroits chacune (meta, og, JSON-LD), rien d'autre.

**Ce qu'il faut en retenir ailleurs :** partout où un générateur choisit
« la première variante qui tient », l'ordre de la liste est une décision de
référencement, pas une commodité. Les formulations les plus courtes sont
celles qui laissent tomber un fait — et ce sont elles qui gagnent.

Un contrôle le tient maintenant : la description de chaque leçon doit porter
le numéro que la page revendique **dans la référence de son premier verset**.
Un numéro présent mais faux est donc attrapé aussi. Et il n'y a aucune
ambiguïté possible avec le nombre de versets, qui figure dans la même
phrase : **aucune des 114 sourates du Coran n'a un nombre de versets égal à
son numéro** — vérifié sur les 114.

## 🔴 UNE LEÇON DU 23 OCTOBRE, DE LA MÊME FAMILLE

**La page qui explique ta méthode est celle que personne ne contrôle.**

Sur les 53 adresses indexables d'islampasapas, **52 sortent d'un
générateur** — leurs titres et leurs descriptions sont tenus par un
`sys.exit` et par deux contrôles. **Une seule est écrite à la main :
`plus.html`, la page « À propos ».** C'est-à-dire précisément la page où un
lecteur attentif va voir si le site est sérieux.

Et c'est la seule qui portait une affirmation que le site ne tient pas :

> « Chaque question sort d'une source vérifiable : un verset avec sa sourate
> et son numéro, **ou un hadith avec son recueil, son rapporteur et son
> numéro.** »

Compte le même soir : sur **2 701 questions, zéro** cite un hadith, un
recueil ou un rapporteur — et depuis le 21 octobre un contrôle **interdit**
d'en citer un, faute de traduction française sourcée. La page annonçait donc
une pratique que le projet avait formellement écartée. Même défaut que les
quatre titres de voyageshalal qui promettaient une salle de prière que
l'article déclarait inexistante : **la description était honnête, c'est la
promesse qui ne l'était pas.**

La clause a été retirée ; ce qui reste est mesuré vrai pour les 2 701. Et le
contrôle ne surveille pas un mot, il **lie la page aux banques** : si aucune
question ne cite de hadith, aucune page indexable ne doit en parler ; si des
questions en citent un jour, le contrôle se tait de lui-même.

**À emporter sur les cinq sites :** faire la liste des pages indexables qui
ne sortent pas d'un générateur. Elles sont peu nombreuses, elles sont
souvent les plus anciennes, et ce sont elles qui portent les promesses que
plus personne ne vérifie.

*(Le piège, pour mémoire : un contrôle sur le mot « recueil » accuse un
verset du Coran — Hamidullah écrit « Et par ceux qui recueillent avec
douceur », sur la page d'An-Nazi'at. On cherche « recueil de ».)*

## 🔴 LA LEÇON DU 24 OCTOBRE — LA PLUS IMPORTANTE DES TROIS

**Un contrôle qui sait s'éteindre proprement cache sa propre panne.**

Le carnet retient déjà deux contrôles **menteurs**. En voici un troisième
cas, et il est différent : **celui-là disait la vérité, et personne ne la
lisait.**

Le 19 octobre, `lexique.json` a été déplacé de `data/` vers `outils/` — une
bonne réparation : 19 Ko ne partaient plus en production pour rien. Les
trois générateurs qui le lisent ont suivi. **Le contrôle, non.** Il
cherchait l'ancien chemin, ne trouvait rien, et se désactivait proprement.

**Pendant cinq nuits, 1 246 cartes de vocabulaire — celles qui affirment
« ce mot arabe signifie ceci » — n'ont plus été confrontées au corpus
morphologique du Coran.**

Et le contrôle l'imprimait chaque soir, exactement :

> `687 désignent un mot du verset, 0 confrontées au corpus morphologique.`

Zéro. La ligne était juste. Elle a été lue cinq fois sans être vue. Le
contrôle avait même été écrit pour ça : son commentaire dit « sans corpus
sous la main on ne peut rien affirmer : on le **dit** plutôt que de laisser
croire que c'est vérifié ». Il a tenu parole ; le lecteur non.

**Réparé, et la mesure est bonne : 1 246 cartes confrontées, zéro faute.**
Les cinq nuits aveugles n'ont rien laissé passer. Le trou était dans la
vérification, pas dans le site — mais personne ne pouvait le savoir avant de
regarder.

**La règle qui en sort, et elle vaut pour les cinq sites :**

> Une dégradation silencieuse se remarque quand elle fait **rougir** le lot,
> pas quand elle imprime un zéro. Partout où un contrôle peut se désactiver
> faute de données, **sa désactivation doit être une faute**, pas une
> information. On ne perd pas l'honnêteté du message : on la rend impossible
> à ignorer.

Corollaire pour ce carnet : « imprime le chiffre, pas un verdict » reste la
bonne règle — mais un chiffre n'est honnête que si quelqu'un le lit. Les
deux doivent aller ensemble.

*(Détail à garder : les deux manques ne se signalent pas pareil. Lexique
absent → le contrôle nomme la faute. `morphologie.txt` absent →
`faire-questions-claude.py` le lit dès son import, sans garde, et le
contrôle s'arrête sur une pile d'appels. Le lot est refusé dans les deux
cas, mais l'un donne une phrase et l'autre un plantage.)*

## 🔴 LE 25 OCTOBRE : LA RÈGLE APPLIQUÉE À TOUT, ET CE QU'ELLE A SORTI

La règle de la veille a été passée sur la suite entière. **Méthode : écarter
un fichier, relancer les 39 contrôles, le remettre, recommencer.** Onze
fichiers. Pas lire le code — le lancer : un audit qui ne visite pas tout
mesure son propre parcours.

Dix des onze font rougir au moins un contrôle. `data/images.json` n'est vu
par aucun des neuf contrôles Python, mais `controler-donnees.mjs` le
rattrape. **Un seul ne fait rougir personne :**

> **`robots.txt` écarté → 9 contrôles Python verts, 30 de navigateur verts.**

**Et c'est le pire endroit possible pour un trou.** `robots.txt` est le seul
fichier d'un site dont **une ligne** peut faire disparaître toutes ses
adresses de Google — `Disallow: /` suffit — et c'est lui qui dit où se
trouve le sitemap.

**Il est écrit à la main.** Comme `plus.html`, qui portait la seule
affirmation fausse du site deux jours plus tôt. **Deux sur deux :** la liste
des fichiers écrits à la main est courte, et c'est elle qui porte les
accidents. C'est la leçon du 23 octobre, confirmée par un autre chemin.

Quatre règles posées, chacune cassée séparément pour vérifier qu'elle
répond : fichier absent · `Disallow: /` · une interdiction qui **couvre une
adresse annoncée au sitemap** (la contradiction qui tue l'indexation sans
rien casser de visible — on montre la page à Google et on lui défend de la
lire) · le sitemap déclaré sur une autre adresse que la canonique.

**À emporter sur les cinq sites :** le même audit, fichier par fichier. Il
se fait en une soirée et il ne demande aucune donnée extérieure. Commencer
par `robots.txt`.

## 🔴🔴 LE 26 OCTOBRE — DU CONTENU FAUX, EN LIGNE, ET LE SEUL DE LA SÉRIE

Les quatre leçons précédentes portaient sur l'**appareil de vérification**.
Celle-ci porte sur le **site lui-même**, et c'est la première.

**Cinq cartes de « Vocabulaire arabe » surlignaient إِنس — *les hommes*, le
mot que le Coran met en face des djinns — et donnaient « djinns » pour bonne
réponse.** Sourate 51 verset 56 : « Je n'ai créé les djinns et les hommes
que pour qu'ils M'adorent » ; le mot en vert était « et les hommes ». Une
sixième affirmation, dans « Le sens des sourates », disait de ٱلْفَسَادَ — la
corruption — qu'Hamidullah « le rend par *terre* ».

En ligne depuis avant le 29 septembre.

**Le mécanisme, mesuré, sans aucun jugement de traduction.** Le lexique est
bâti en comptant le mot français qu'Hamidullah emploie dans les versets de
chaque mot arabe, avec quatre garde-fous. Pour إِنس :

| candidat | versets | p | lift |
|---|---|---|---|
| djinns | 15 / 17 | 0,88 | 204 |
| hommes | 10 / 17 | 0,59 | 34 |

marge retenue (15−10)/17 = **0,29 > 0,25 → accepté**.

Or « homme **ou** humain » est dans **17 / 17**. Hamidullah alterne les deux
formes, et le comptage se fait sur un radical de sept lettres : « hommes »
et « humains » deviennent deux mots. **Le bon sens est coupé en deux — 10 et
7 — chaque moitié perd, et « djinns », jamais divisé, gagne.** Les quatre
garde-fous ont tous fonctionné comme écrits ; c'est leur **interaction** qui
retourne le résultat. Formes réunies, la marge tomberait à 0,12 et le
garde-fou aurait refusé l'entrée — le bon résultat.

**La règle générale, et elle vaut partout :**

> Quand on mesure un gagnant par sa marge sur le second, **toute forme qui
> divise le vote d'un candidat le fait perdre au profit d'un rival qui n'est
> pas divisé.** Avant de croire une marge, vérifier que les candidats sont
> comptés sur la même unité.

**Ce qui a été fait, et ce qui a été refusé :** aucun sens n'a été corrigé —
choisir la traduction française d'un mot du Coran n'est pas le travail d'un
outil. La règle du projet dit « en cas de doute sur une source, on ne publie
pas » : les trois entrées ont été **retirées**. 2 701 → **2 658** questions.

Un cinquième garde-fou refuse désormais un lemme quand un autre porte le
même sens, figure dans ≥ 75 % de ses versets et tient sur plus de versets
que lui. Les dépendances mesurées sont 87, 82, 82, 71, 64 % : la ligne tombe
dans l'écart entre 82 et 71. **Un seuil posé dans un écart de onze points
sur cinq cas n'est pas une loi, c'est une borne prudente** — elle est dans
`faire-11-vocabulaire.py`, `DEPENDANCE_MAXI`.

**Et une découverte en chemin, qui aurait empoisonné toute vérification
future.** En voulant prouver que seuls ces trois mots avaient changé, trois
lancements du générateur sans rien toucher ont donné **trois banques
différentes** (1 217, 1 216, 1 216 cartes). Le lexique était stable : le
hasard était dans le choix des versets — cinq par mot, triés par longueur,
les ex æquo laissés dans l'ordre d'un `set`, lequel dépend du hachage des
chaînes et change à chaque processus. **Le nombre de questions annoncé sur
la page d'accueil bougeait donc à chaque régénération, sans qu'aucune donnée
n'ait changé.** Tri rendu total (longueur, sourate, verset) : trois
lancements, la même banque à l'octet.

**À emporter : un tri partiel sur un ensemble n'est pas reproductible.**
Partout où un générateur garde « les N premiers », le tri doit être total,
sinon la sortie change sans raison — et plus aucune vérification par
empreinte n'est possible.

## 🔴 LE 27 OCTOBRE — LA MÊME CAUSE, SOUS UNE AUTRE FORME

La leçon de la veille retournée contre les 140 entrées restantes.
**L'inversion :** pour chaque couple publié (mot arabe → sens français),
demander l'inverse — dans tout le Coran, quel mot arabe ce sens français
désigne-t-il le mieux ? **30 entrées sur 140 sont ressorties.**

Mais une alerte n'est pas une faute, et la plupart ne se tranchent pas sans
un avis de traducteur : « رَجُل = homme » sonne parce que إِنسان est plus
fréquent, et les deux veulent bien dire *homme*. **Ce crible sert à
regarder, pas à juger.** Dedans, une seule faute se prouve mécaniquement :

**L'attestation se mesurait sur les versets du mot ; la FORME AFFICHÉE était
prise dans un comptage fait sur le Coran entier.** Le mot publié pouvait
donc être une forme que le traducteur n'écrit jamais pour ce mot-là.

| mot | publiait | dans ses propres versets |
|---|---|---|
| شَفِيع | « intercession » | intercesseurs 6, intercesseur 5 — **« intercession » zéro** |
| ذُرِّيَّة | « descendre » | descendance 17, descendants 11 — **« descendre » zéro** |
| صاحِب | « compagnie » | compagnon 7 — **« compagnie » zéro** |
| مُحْسِن | « bienfaits » | bienfaisants 32 — **« bienfaits » zéro** |
| رَحْمَة | « miséricordieux » | miséricorde 108 contre miséricordieux 9 |

**La cause est celle du 26 octobre sous une autre forme :** « descendre » et
« descendance » partagent le radical de sept lettres, « intercession » et
« intercesseur » aussi. **Le radical sert à compter les versets ; il ne doit
pas servir à choisir le mot qu'on affiche.**

**20 sens corrigés sur 140**, aucune entrée ajoutée ni retirée, 57
explications de cartes mises à jour. Aucune traduction choisie : la forme se
prend désormais parmi les mots que le traducteur a écrits **pour ce mot-là**
— ce que la méthode annonçait depuis août.

**La règle générale :**

> Quand une mesure est faite sur un sous-ensemble, **tout ce qu'on en
> affiche doit venir du même sous-ensemble.** Mélanger une statistique
> locale et un libellé global produit une affirmation que rien n'atteste.

### Les 30 alertes, pour qui veut en regarder une

J est l'accord (intersection sur union) entre les versets du mot et ceux où
le sens apparaît. Une entrée sonne quand un autre mot fait mieux. **Rien
ici n'est déclaré faux** — c'est une liste à regarder, et seules les cinq du
tableau ci-dessus ont été corrigées.

| mot | sens publié | mieux porté par | J(l'autre) | J(publié) | versets |
|---|---|---|---|---|---|
| رِسالَة | messages | رَسُول | 0,78 | 0,03 | 10 |
| بَلاغ | message | رَسُول | 0,78 | 0,04 | 15 |
| مُؤْمِنَة | croyantes | مُؤْمِن | 0,63 | 0,10 | 24 |
| ذُرِّيَّة | descendance | أَنزَلَ | 0,57 | 0,10 | 30 |
| عَدْن | jardins | جَنَّة | 0,51 | 0,14 | 11 |
| مُنذِر | avertisseurs | نَذِير | 0,48 | 0,12 | 15 |
| رَجُل | homme | إِنسان | 0,46 | 0,15 | 25 |
| شَكُور | reconnaissant | شَكَرَ | 0,43 | 0,12 | 10 |
| شَرِيك | associés | أَشْرَكَ | 0,59 | 0,28 | 34 |
| رَحِمَ | miséricorde | رَحِيم | 0,39 | 0,09 | 28 |
| مِلَّة | religion | دِين | 0,47 | 0,20 | 15 |
| شاكِر | reconnaissants | شَكَرَ | 0,43 | 0,17 | 14 |
| لَقُ | rencontrent | لِقاء | 0,44 | 0,19 | 14 |
| أَنْعَمَ | bienfait | نِعْمَة | 0,32 | 0,09 | 16 |
| أَحْسَن | meilleur | خَيْر | 0,43 | 0,22 | 36 |
| هَواء | passion | أَهْواء | 0,53 | 0,33 | 11 |
| أَنذَرَ | avertis | نَذِير | 0,48 | 0,30 | 40 |
| أَصْحاب | gens | ناس | 0,30 | 0,12 | 70 |
| غَفَرَ | pardonne | غَفُور | 0,52 | 0,35 | 62 |
| دار | demeure | خالِد | 0,38 | 0,21 | 47 |
| فاكِهَة | fruits | ثَمَرَة | 0,32 | 0,24 | 11 |
| شَفِيع | intercesseurs | شَفاعَة | 0,48 | 0,40 | 10 |
| مُحْسِن | bienfaisants | نِعْمَة | 0,32 | 0,24 | 38 |
| ساجِد | prosternés | سَجَدَ | 0,48 | 0,41 | 23 |
| مَغْفِرَة | pardon | اسْتَغْفَرَ | 0,47 | 0,39 | 28 |
| أَجْمَع | tous | جَمِيع | 0,18 | 0,12 | 26 |
| أَقْرَب | plus | أَشَدّ | 0,10 | 0,05 | 18 |
| رَحْمَة | miséricorde | رَحِيم | 0,39 | 0,35 | 112 |
| كُلَّما | fois | مَرَّة | 0,21 | 0,19 | 15 |
| نَهَى | interdit | حَرَّمَ | 0,38 | 0,38 | 31 |

Les plus nettes sont les trois premières : رِسالَة et بَلاغ sont des
*messages*, et c'est رَسُول qui est le *messager*. Les deux publient
désormais « messages » et « message » — mais l'inversion continue de sonner,
parce que « message » apparaît surtout là où رَسُول apparaît. **C'est la
limite de la méthode, et elle doit rester écrite :** un lexique mesuré sur
une traduction ne distingue pas deux mots qui voyagent toujours ensemble.

## 🔴 LE 28 OCTOBRE — DONNER TORT À UNE BONNE RÉPONSE

Le fichier de contrôle portait depuis des semaines cette phrase : « **aucune
mauvaise réponse ne doit être juste aussi.** C'est le défaut le plus injuste
possible : la personne répond vrai et le jeu lui dit qu'elle s'est
trompée. » Elle ne cherchait ce défaut que dans les réponses **longues** —
des morceaux de traduction. Jamais du côté des mots arabes.

544 cartes demandent « dans ce verset, quel mot signifie X ? », et les
mauvaises réponses sont les autres mots du même verset — c'est voulu, il
faut lire le verset. Mais **un verset reprend souvent le même mot sous une
autre flexion, et la flexion change la forme écrite** :

| verset | on demande | bonne réponse | leurre |
|---|---|---|---|
| 54:46 | heure | السَّاعَةُ | وَالسَّاعَةُ — le même mot avec le « et » |
| 21:92 | communauté | أُمَّتُكُمْ | أُمَّةً |
| 61:8 | lumière | نُورَ | نُورِهِ |
| 4:49 | purifie | يُزَكُّونَ | يُزَكِّي |

Un garde-fou existait et son commentaire était juste — « deux mots ne
diffèrent parfois que par une voyelle : on écarte tout ce qui se confond
avec la bonne réponse ». Il comparait les **formes normalisées**. Or
السَّاعَةُ et وَالسَّاعَةُ ne se confondent pas : l'une a une lettre de plus.

**La bonne unité n'était pas la forme, c'était le lemme.** Toute forme du
mot demandé signifie ce qu'on demande. Après réparation : 544 cartes, zéro
leurre juste, et **aucune carte perdue** — seul change le mot tiré comme
leurre.

### Deux mesures fausses avant la bonne, et c'est la leçon

**Ma sonde a d'abord annoncé neuf fautes.** Elle comparait les mots par
sous-chaîne, et en arabe « جنوده » — *ses troupes* — contient « جن », le mot
pour *djinns*. Cinq fausses alertes. En comparant les formes entières à
l'identique : quatre.

**Puis le contrôle a annoncé 55 fautes.** Il comparait les lemmes de la
bonne réponse à ceux de chaque leurre — mais un mot arabe colle son article,
sa conjonction et son pronom au radical, et **chaque segment porte son
propre lemme**. Deux mots ayant tous deux un « et » devant partagent donc un
lemme. Restreint aux noms et aux verbes, comme le générateur : 55 → 4.

> **À emporter : sur une langue agglutinante, ni la sous-chaîne ni « tous les
> lemmes du mot » ne sont une unité de comparaison.** La première sur-détecte
> par hasard graphique, la seconde par les particules collées. L'unité est le
> lemme **du radical**.

Et un contrôle qui aurait crié 55 fois pour 4 fautes réelles aurait été
désactivé avant la fin du mois — c'est le même mécanisme que le piège de
« prophète », de « recueil » et de « récompense » : **un contrôle qui crie
finit par ne plus être lu.** Les deux chiffres faux sont écrits dans le
contrôle, avec leur raison.
