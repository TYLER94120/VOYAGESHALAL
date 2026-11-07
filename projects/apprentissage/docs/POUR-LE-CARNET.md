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

# 📖 islampasapas.fr — RONDES DU 26 SEPTEMBRE AU 7 NOVEMBRE 2026

> **Comment lire cette note.** Son corps a été écrit le 14 octobre. Chaque
> ajout porte sa date, et **une mesure datée ne se rafraîchit pas : elle se
> date.** Rafraîchir un dénominateur sans relancer la mesure donnerait un
> chiffre que personne n'a mesuré.
>
> Ce qui a été ajouté depuis le 14 : deux lignes dans le tableau des
> décisions (21 oct.), et une section par leçon transférable — **22, 23, 24,
> 25, 26, 27 et 28 octobre**. Les trois dernières portent sur du contenu
> faux trouvé **en ligne**, et ce sont les plus importantes.
>
> Revérifié le 1er novembre : la date de la dernière publication, le nombre
> de contrôles, et les chiffres du tableau des décisions. Le reste du corps
> du 14 octobre n'a pas été repassé.

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

> ⚠️ **ET CE N'EST PLUS SEULEMENT DU MIEUX QUI ATTEND.** Les rondes du 23, du
> 26, du 27 et du 28 octobre ont retiré du site des **affirmations fausses** :
> une page qui annonçait des hadiths sourcés alors qu'il n'y en a aucun, cinq
> cartes donnant « djinns » pour le sens de *les hommes*, une explication
> donnant « terre » pour *la corruption*, vingt mots dont la forme publiée
> n'était pas celle qu'écrit le traducteur, et quatre cartes donnant tort à
> une bonne réponse. **Tout cela est encore en ligne.** La réparation est sur
> la branche, pas en production — c'est la seule chose de cette note qui soit
> urgente.

**Dernière publication : le 29 septembre à 00 h 32**, repère de version
`386566f`, commit `59e67ae`. Trouvé dans l'historique le 1er novembre, et
confirmé par le pied de page du site lui-même, qui affiche ce repère.

> Cette ligne disait « le 28 septembre, mais je ne peux pas le confirmer
> d'ici ». C'était faux d'un jour, et `DEPLOIEMENT.md` disait déjà 29 au
> même moment : **deux documents du même dépôt se contredisaient sur la date
> de la dernière mise en ligne.** Le commit porte sa date, il suffisait de la
> lire.

État de la production : **non vérifié** au-delà de cela. Le site n'est pas
joignable depuis le conteneur des rondes (code 000), donc je ne peux pas
confirmer que ce qui y est servi correspond bien à ce commit.

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
| **ou neuf sourates courtes** (22 oct., **argument corrigé le 2 nov.**) | Le levier 2 dit « une leçon par sourate **courte** ». Mesuré : **9 sourates hors du lot ont 20 versets ou moins** — Al-Jumu'a 11, Al-Munafiqun 11, At-Talaq 12, At-Tahrim 12, Al-Mumtahana 13, As-Saff 14, Al-Hujurat 18, At-Taghabun 18, Al-Muzzammil 20. **129 versets en tout**, contre 431 pour le juz 29 : +24 % de pages pour +23 % de versets, au lieu de +29 % pour +75 %. Les deux jeux de données (arabe et Hamidullah) concordent sur les neuf, sans trou. Une seule, Al-Muzzammil, appartient au juz 29. | **Le coût n'est pas le même. La cohérence, elle, n'était pas l'argument que je croyais** — voir la correction ci-dessous. Reste donc une question de volume et d'ordre, et elle est à toi |

> 🔴 **CE QUE J'AI ÉCRIT LE 22 OCTOBRE ET QUI ÉTAIT FAUX.** J'ai refusé d'agir
> en disant : « le lot actuel a un nom — Al-Fatiha et le juz Amma, une unité
> reconnue ; neuf sourates dispersées n'en forment aucune, un lecteur verrait
> un ensemble arbitraire. »
>
> Mesuré le 2 novembre, sur les 63 pages du site : **le mot « juz » n'y
> apparaît pas une seule fois.** `sourates.html` dit seulement « 38 d'entre
> elles sont expliquées verset par verset : leur nom est en vert ». **Le
> lecteur ne peut pas percevoir l'unité que je protégeais** — pour lui, les
> 38 sont déjà un sous-ensemble arbitraire de 114.
>
> Cette cohérence existait dans `DEPLOIEMENT.md`, pas sur le site. J'ai
> protégé une propriété de ma propre documentation et je te l'ai présentée
> comme une propriété du produit. **Ta décision est donc moins contrainte que
> ce que je t'ai dit** : il reste le coût et l'ordre, pas la cohérence.
>
> **Et nommer le juz sur le site n'est pas à ma portée non plus**, pour une
> raison de source : « juz amma » serait une requête précise, exactement le
> terrain que la loi de la précision désigne — mais **le dépôt n'a aucune
> donnée de découpage du mushaf**. Les fichiers du Coran ne portent que
> `chapter`, `verse`, `text` ; les fichiers de noms que `ar`, `n`, `tr`. Dire
> « les sourates 78 à 114 forment le juz 'Amma » serait l'écrire de mémoire,
> ce que la règle interdit. **Il faudrait une donnée de juz sourcée** — c'est
> une acquisition, comme la traduction de hadiths.
| **taille du texte** | 102 `font-size` en px, 27 à 12 px ou moins, zéro en rem. Le réglage du téléphone n'a aucun effet. Passer en rem ne suffirait pas : à 320 px, **2 651 cartes sur les 2 701 d'alors** (mesure du 5 octobre) étaient déjà à la plus petite échelle et 96 % demandaient de faire glisser. Il faudrait que les cartes s'allongent au lieu de se réduire. | une refonte de la façon dont une carte répond à un débordement |
| **deux titres de section** | « Le comportement » (64 car.) et « Vocabulaire arabe » (65) dépassent 60 et retombent sur le nom seul. Raccourcir leur champ `quoi` de 5 caractères les ferait tenir. `quoi` est une valeur du cahier V2. | raccourcir ou non deux phrases du cahier |
| **« 2 658 questions »** (recompté le 31 oct.) | 65 versets produisent une carte dans deux ou trois sections — la prière et l'aumône, que le Coran associe sans cesse. **138 cartes, 5,2 % du paquet** (57 versets dans deux sections, 8 dans trois). En comptant chaque verset une fois : **2 585**. | garder 2 658, qui est le nombre de cartes, ou annoncer 2 585. *La question posée jusqu'ici disait « 2 701 ou 2 628 » : les deux chiffres étaient périmés depuis le 26 octobre, et une décision ne se prend pas sur des chiffres faux.* |
| **quatre sections sous le plancher** (21 oct.) | Le cahier demande 100 questions par section. Piliers 89, comportement 11, jeûne 8, pèlerinage 7 — et elles sont en ligne. Mesure par la méthode du projet (un verset n'entre dans un domaine que si l'arabe **et** le français le désignent) : le Coran entier porte **9 versets sur le jeûne et 18 sur le pèlerinage**. Avec les deux formes de carte du site, plafond 26 et 41. **Ces deux-là ne peuvent pas atteindre 100.** Piliers (106) et comportement (115) peuvent, mais en devenant des sections d'exercices de traduction. | garder petites ou refermer — et, pour deux d'entre elles, accepter de changer leur nature |
| **enrichir les 38 leçons avec le lexique** (4 nov.) | La skill des titres dit que le levier, ici, est « des liens entrants, de la **profondeur**, du temps ». Mesuré : sur les **571 versets** publiés dans les 38 leçons, **186 (33 %)** portent au moins un des 138 mots **attestés** du lexique, et **64 mots distincts** y apparaissent — يَوْم « jour » dans 36 versets, إِنسان « homme » dans 16, كِتاب « livre » dans 11. La phrase existe déjà, mot pour mot, sur 1 197 cartes de QCM — même source, même mesure, déjà vérifiée par `controler-questions.py`. Rien à inventer, rien à traduire. | **Mais cela se heurte à une règle écrite de la page**, et c'est pour ça que je ne le fais pas : `faire-lecon-sourate.py` dit « le verset, sa traduction attribuée, sa référence. **Rien entre les deux.** » La règle a été écrite pour tenir l'exégèse dehors. Une note de vocabulaire mesurée n'est pas de l'exégèse — mais c'est toi qui as posé la barrière, et c'est à toi de dire si elle s'ouvre pour ça. Deux tiers des versets n'auraient aucune note : il faut aussi accepter cette irrégularité |
| **une traduction de hadiths** (21 oct.) | Ces quatre sections sont celles qui devaient reposer sur des hadiths. Le dépôt en contient 20 426 en français (Boukhari 7 589, Mouslim 7 563, Abou Dawoud 5 274) et **aucun n'est citable** : leurs métadonnées ne nomment aucun traducteur, et leurs titres de chapitres sont restés en anglais — « Revelation », « Belief », « Knowledge ». Traduction de traduction. | acheter ou obtenir une traduction française de hadiths **avec un traducteur nommé**. C'est le seul blocage du site qui se lève par une décision et non par du travail |

## LA QUESTION QUE LE CARNET POSAIT LE 21 AOÛT

> « À vérifier au prochain relevé : Indexation → Pages, pour distinguer
> "peu de pages au total" de "pages découvertes mais non indexées". »

Toujours sans réponse. De ce côté-ci, tout est vérifié : 53 adresses
indexables, `robots.txt` qui n'interdit rien, sitemap à jour avec une date
par page, `noindex` sur les seuls écrans de jeu. La distinction se lit dans
Search Console.

## 🔴 LE 3 NOVEMBRE — LE LEVIER DES TITRES EST ÉCARTÉ, ET C'EST MESURÉ

Pendant soixante-dix nuits, chaque compte rendu a fini par la même phrase :
« les titres — il faudrait les requêtes de Search Console pour les juger ».
C'était une attente, pas une décision.

La skill `ce-que-google-affiche` de l'empire porte une section **« Quand ne
PAS faire ce travail »** :

> « Une page à 88 impressions n'a pas un problème de titre, elle a un problème
> de **visibilité** : elle sort trop bas pour que quiconque la voie. Un beau
> titre à la position 22 reste invisible. Dans ce cas le levier est ailleurs —
> des liens entrants, de la profondeur, du temps. **Savoir que ce chantier ne
> sert à rien ici est aussi utile que savoir le mener ailleurs.** »

**islampasapas a 12 impressions en 28 jours** — sept fois moins que le seuil
donné en exemple. Les deux pages que la ronde désigne comme prioritaires,
l'accueil et al-Ikhlas, en ont **2 et 1**.

➡️ **Le levier 1 est écarté pour ce site, pas reporté.** Non pas « il manque
une donnée pour juger », mais « il n'y a personne à convaincre ». Les deux
phrases n'engagent pas la même suite : la première attend, la seconde libère
l'effort pour le levier qui compte ici — **le volume**.

**Et les trois causes que la skill chiffre sont absentes ici, vérifiées :**

| cause mesurée ailleurs dans l'empire | ici |
|---|---|
| un suffixe de marque fait **couper** le titre — 383 pages sur 809 | **0 titre sur 53** dépasse 60 caractères ; le plus long fait 59 |
| le mot reste dans la **mauvaise langue** — 34 fiches | sans objet : une langue, un domaine |
| la description annonce un **chiffre faux** | recompté par contrôle depuis le 5 octobre |

**À emporter sur les cinq sites :** avant de réécrire un titre, regarder le
nombre d'impressions de la page. Sous quelques dizaines, le titre n'est pas le
problème — et le temps passé là est du temps volé au seul levier qui agisse.

## L'ÉTAT DES CONTRÔLES — recompté le 1er novembre

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

## 🔴🔴 LE 4 NOVEMBRE — UN INDICATEUR PARFAIT SUR UNE MESURE VIDE

Dix-neuf cartes du site enseignaient que **أَشَدّ** et **أَقْرَب** signifient
**« plus »**. Trois explications d'autres sections le répétaient. Vingt-deux
endroits, **en ligne depuis le 22 août** — soit 74 jours.

La carte montre un verset, surligne le mot, demande « **Que signifie** le mot
en vert ? » et attend « plus » parmi « femme », « veau », « filles ». Une
carte surlignait **الْأَقْرَبِينَ** — *les proches parents* — et attendait
« plus ». L'élève qui répond juste a appris quelque chose de faux.

Ce sont deux élatifs : أَشَدّ est le comparatif de *fort*, أَقْرَب celui de
*proche*.

### Pourquoi les quatre garde-fous chiffrés ne pouvaient pas le voir

Le lexique de ce site n'invente aucune traduction : il **mesure** celles que
Hamidullah emploie, et quatre seuils chiffrés écartent les coïncidences. Le
mot n'est publié que s'il apparaît dans au moins 10 versets, si le mot
français revient dans au moins 75 % d'entre eux, s'il y est 10 fois plus
fréquent qu'ailleurs, et s'il se détache nettement du deuxième.

**أَشَدّ avait un accord de 1,000. Le maximum.** Hamidullah écrit bien
« plus » dans **tous** ses versets. L'alignement était parfait.

Ce que ces quatre seuils mesurent, c'est la **constance du traducteur**.
Aucun ne demande si le mot français porte un sens **à lui seul**. En français
le comparatif se fabrique avec « plus » devant un adjectif ; l'arabe le porte
dans la **forme** du mot. L'alignement ne pouvait donc capturer que le
marqueur — et un marqueur ne veut rien dire seul.

> **À emporter, et ça vaut pour les cinq sites : un indicateur au maximum ne
> prouve rien d'autre que ce qu'il mesure.** 1,000 sur 1,000 ne disait pas
> « cette glose est bonne », il disait « le traducteur est constant ». La
> question « constant sur quoi ? » n'était posée nulle part. **Quand un
> chiffre est parfait, demande ce qu'il mesure — pas s'il est bon.** Une
> mesure juste sur une grandeur vide reste vide.

Le contrôle des questions ne le voyait pas non plus, et pour une raison
voisine : il vérifiait que le sens annoncé appartient à un mot **présent dans
le verset**. Il l'était. La faute n'était pas dans le repérage du mot, elle
était dans la **nature de la glose** — une question que personne ne posait.

### La liste a été mesurée avant d'être écrite

La tentation était d'interdire les mots grammaticaux en bloc. Mesure faite
**avant** : أَجْمَع publie « tous », une entrée légitime qu'une liste de
déterminants aurait détruite ; بَيْن « entre » et بَعْد « après » sont des
**noms** dans le corpus, et une glose prépositionnelle serait pour eux un vrai
sens. La liste ne retient donc que les mots qui ne portent **aucun** sens
lexical seuls. Sur 140 entrées, elle en refuse **deux**.

Un sixième garde-fou dans le générateur, et la même règle dans le contrôle —
avec **sa propre** liste, parce qu'un générateur qui se trompe se trompe aussi
dans ses propres contrôles. Le contrôle relit en plus les **cartes servies** :
retirer une entrée du lexique ne retire pas la carte déjà écrite.

### Et un outil qui annonçait « 0 » en réécrivant trois fichiers

`enrichir-explications.py` a retiré les trois explications devenues fausses,
puis a affiché : « **0 explications enrichies, 0 mises à jour** ». Il comptait
les ajouts et les remplacements, **jamais les retraits**. J'ai vu le
changement au `git diff`, pas au compte rendu de l'outil.

> **À emporter : un chiffre qui ne bouge pas quand le fichier bouge est un
> mensonge.** Un outil qui ne compte que ce qu'il ajoute est aveugle à ce
> qu'il enlève — et c'est en enlevant qu'on casse.

Il imprime maintenant les trois : enrichies, mises à jour, **retirées**.

### Ce qui reste et qui demande un éditeur, pas un contrôle

La même mesure met en évidence **أَدْرَى**, glosé « dira ». Il tient
**6 cartes** et **17 explications** en ligne, et c'est le quatrième mot le plus
fréquent des 38 leçons (11 versets). Les cartes surlignent يُدْرِيكَ et
attendent « dira ».

Ce n'est **pas** un mot-outil : le sixième garde-fou ne le refuse pas, et son
accord de 0,765 passe le seuil de 0,75. Ce que je peux montrer **sans aucun
dictionnaire**, parce que c'est dans le dépôt :

- sur les **17 versets** du mot, **13** portent la même tournure, « et qui te
  **dira** ce qu'est… » — l'attestation vient donc d'une formule répétée ;
- dans les quatre autres, **le même traducteur écrit autre chose** :
  « Il ne vous l'aurait pas non plus **fait connaître** » (10:16), « **Qu'en
  sais-tu** ? » (33:63 et 42:17), « Qui te **dit** » (80:3).

Je **n'y touche pas**. Trancher demanderait de choisir une traduction, ce que
ce projet ne fait jamais, et une règle « une glose attestée surtout par une
formule répétée n'est pas un sens » devrait d'abord être mesurée contre les
138 entrées pour qu'on sache ce qu'elle détruirait. **Non vérifié, à toi de
dire.**

## 🔴 LE 5 NOVEMBRE — LA RÈGLE PROMISE, MESURÉE : ELLE TIENT

La veille, j'avais écrit qu'une règle « une glose attestée surtout par une
formule répétée n'est pas un sens » devait **d'abord être mesurée** contre les
138 entrées. Mesure faite, et c'est le résultat qui décide, pas moi.

### Le trou qui donne le seuil

Pour chaque entrée : les versets où le mot français de la glose apparaît, puis
les **trois mots qui le précèdent**. Si un même contexte revient dans la
plupart de ces versets, l'attestation tient à une tournure, pas au mot.

| part | lemme | glose | la formule |
|---|---|---|---|
| **100 %** | أَعْلَن | divulguent | 6/6 après « ce qu'ils » |
| **92 %** | أَدْرَى | dira | 12/13 après « et qui te » |
| | | | ← **le trou** |
| 57 % | وِزْر | fardeau | 4/7 |
| 51 % | صادِق | véridiques | 26/51 |
| 50 % | قَمَر | lune | 13/26 |

**Entre 92 % et 57 %, il n'y a rien.** Tout seuil posé dans ce trou refuse les
deux mêmes entrées — vérifié à 60, 75, 80 et 90 %. À 50 % on perdrait « lune »
et « véridiques », deux gloses manifestement justes : c'est la preuve que le
seuil ne doit pas descendre, et pas une opinion sur l'arabe.

> **À emporter : un seuil qui tombe dans un trou de la distribution n'est pas
> un choix, c'est une lecture.** Quand on doit en inventer un, la question
> n'est pas « quelle valeur me paraît juste » mais « où la distribution
> change-t-elle de régime ». Et si elle ne change nulle part, il n'y a pas de
> règle à écrire.

0,75 est pris parce qu'il est au milieu du trou, et parce que c'est déjà le
chiffre de deux autres seuils du générateur — un seuil de plus, pas une
troisième valeur à retenir.

### Ce que la règle ne dit pas

Elle ne dit pas que la glose est **fausse**. « divulguent » pour أَعْلَن est
probablement juste. Elle dit que **la mesure n'établit pas un sens de mot** :
si un mot n'apparaît que dans une tournure, on ne peut pas distinguer « ce mot
veut dire X » de « cette tournure se traduit comme ça ». C'est le troisième
état, *non vérifié*, et le projet ne publie pas ce qu'il n'a pas vérifié. On
refuse l'entrée, on ne la corrige pas — même règle que le cinquième garde-fou.

Coût mesuré : lexique 138 → 136, cartes 1 197 → 1 181, questions 2 639 →
2 623. Et **11 explications** d'autres sections ont perdu la phrase devenue
fausse — comptées par la ligne de bilan ajoutée la veille, qui aurait dit
« 0 » l'avant-veille.

### Une troisième mesure fausse avant la bonne

Ma première sonde gardait l'apostrophe à l'intérieur du mot. « l'enfer » ne
correspondait donc pas à « enfer », et **deux entrées sur 138 comptaient zéro
verset attestant** alors qu'elles en ont 77 et 9 (جَهَنَّم « enfer », طِين
« argile »). Corrigé : 137 entrées sur 138 mesurables, une seule hors de
portée.

> **À emporter : en français, l'apostrophe sépare deux mots.** Une
> tokenisation qui la garde fait disparaître tout mot que la langue élide —
> et ce sont les plus courants. C'est la troisième unité de comparaison fausse
> de ce projet, après la sous-chaîne arabe et « tous les lemmes du mot ».

## CE QUE LE 5 NOVEMBRE MET SUR TA TABLE, ET QUI N'EST PAS DE MON RESSORT

La carte de vocabulaire demande : « **Que signifie** le mot en vert ? »

Ta propre règle, celle que la ronde me répète chaque nuit, dit : *« Un sens ou
un commentaire s'**attribue** — il ne s'affirme jamais au nom du site. »*

Mesuré à l'écran, pas dans le code : au moment où l'élève lit la question,
**rien n'attribue ce sens à personne**. Le nom de Hamidullah et la référence
du verset sont dans le panneau de correction, qui n'apparaît qu'**après** la
réponse. La carte affirme donc un sens au nom du site, puis cite sa source une
fois la réponse donnée.

Deux formulations possibles, et c'est un choix d'éditeur :

| | aujourd'hui | attribué |
|---|---|---|
| forme A, 654 cartes | « Que signifie le mot en vert ? » | « Par quel mot Hamidullah traduit-il le mot en vert ? » |
| forme B, 527 cartes | « Dans ce verset, quel mot signifie « X » ? » | « Dans ce verset, quel mot Hamidullah rend-il par « X » ? » |

**Le gabarit n'est pas un obstacle, et c'est mesuré** : la plus longue question
servie aujourd'hui fait **485 caractères** et passe les trente contrôles de
navigateur à 320 px. La formulation attribuée la plus longue en ferait **68**.

Ce que ça change vraiment : l'exercice ne demande plus « que veut dire ce
mot » mais « comment ce traducteur le rend ». C'est plus honnête et c'est un
peu plus abstrait. **Je ne le fais pas de moi-même** — c'est la voix du site
sur 1 181 cartes, et la voix du site est à toi. Un mot de ta part suffit.

## 🔴🔴 LE 6 NOVEMBRE — UN CHOIX REPRODUCTIBLE N'EST PAS UN CHOIX JUSTIFIÉ

Deux trouvailles de la même famille : **comment la forme publiée était
décidée**. Et une règle écartée, parce que la mesure a dit non.

### 1. L'alphabet décidait, et la sortie était stable

Le générateur prend la forme française la plus fréquente avec
`max(sorted(...))`. Or `max` rend le **premier** maximum de la liste triée :
**à égalité, c'est l'ordre alphabétique qui choisit.**

Le tri a été ajouté le 26 octobre pour tuer un non-déterminisme — la banque
changeait à chaque passage — et il le fait parfaitement. Mais la stabilité
qu'il a achetée a été prise pour une décision.

| lemme | glose publiée | ex æquo | comptes |
|---|---|---|---|
| بَلاغ | « message » | « messager » | **10 = 10** |
| لَقُ | « rencontrent » | « rencontrez » | **3 = 3** |

Pour **بَلاغ**, de l'autre côté de l'alphabet ce lemme aurait publié
« messager » — **le sens de رسول, pas le sien**. La glose était juste par
chance. Deux entrées sur 136.

> **À emporter, et ça vaut partout : rendre un choix arbitraire reproductible
> ne le rend pas justifié.** Un `sorted()` posé pour stabiliser une sortie
> règle le symptôme — la sortie qui bouge — et laisse l'arbitraire intact,
> maintenant invisible parce que constant. Quand on ajoute un tri pour tuer
> un non-déterminisme, il faut regarder **ce que le tri tranche**.

Aucun seuil à choisir ici : l'égalité est l'égalité. On refuse l'entrée.

### 2. Une garantie écrite, commentée, et fausse pendant dix jours

La règle du 27 octobre dit : *la forme affichée se prend dans les versets du
mot, jamais dans un comptage global.* Elle est écrite, elle a son commentaire,
elle a sa mesure. **Elle ne tenait pas pour deux entrées**, et rien ne le
disait.

La cause est l'unité de comparaison, encore : les deux compteurs de forme
affichée relevaient les mots avec `[A-Za-zÀ-ÿ']{4,}` — **l'apostrophe dans le
mot**. « l'Enfer » formait un seul mot, de radical `l enfer` :

- **جَهَنَّم « enfer »** : compteur local **vide** sur ses 77 versets, donc
  repli silencieux sur le comptage **global**, ce que la règle interdit.
  Corrigé, Hamidullah écrit « l'Enfer » dans tous : la glose devient
  « **Enfer** » — ce que demandait aussi la règle du 3 octobre, suivre la
  capitalisation du traducteur.
- **أَعْمَى « aveugles »** : « aveugle » au singulier est la forme de ses
  propres versets, 13 contre 8. Le pluriel était publié.

L'**accord**, lui, n'était pas touché : son tokeniseur employait déjà
`[a-z]{4,}`. Vérifié avant de corriger, et c'est pour ça que les quatre
garde-fous chiffrés n'ont pas bougé. Sur 136 entrées, **deux** gloses
changent, aucune autre.

> **À emporter : une garantie qui ne se vérifie pas ne tient pas.** Celle-là
> était juste dans son intention, documentée dans le code, et fausse en
> pratique pour deux entrées. Un commentaire n'est pas un contrôle. Le
> contrôle relit maintenant l'invariante entière.

### 3. Et une règle ÉCARTÉE, parce que la distribution a dit non

J'ai aussi mesuré une troisième règle candidate : *la glose affichée est-elle
une forme minoritaire parmi les formes françaises du même radical ?*

```
25 %  سَجَدَ « prosternez »      27 %  لَقُ « rencontrent »
38 %  أَعْمَى « aveugles »        38 %  حَشَرَ « rassemblés »
41 %  مُصَدِّق  43 %  بَلاغ  44 %  مُؤْمِنَة  46 %  أَنذَرَ
50 %  شَفِيع  51 %  غَفَرَ  53 %  أَحْسَن  54 %  (quatre entrées)
```

**Aucun trou.** La distribution monte sans rupture — l'inverse exact de la
veille. Tout seuil y serait arbitraire, et détruirait des gloses justes :
سَجَدَ « prosternez » est à 25 % parce que le verset emploie huit formes du
même verbe, et أَعْمَى à 38 % parce que l'autre forme est le même mot au
singulier. **La règle est écartée, et c'est la mesure qui l'écarte, pas mon
avis.**

> C'est l'application de la leçon de la veille dans l'autre sens : si la
> distribution ne change nulle part de régime, **il n'y a pas de règle à
> écrire**. Savoir qu'un chantier n'en est pas un est un résultat.

### Les chiffres

Lexique 136 → **134**. Cartes 1 181 → **1 161**. Questions 2 623 → **2 603**.
Deux gloses corrigées, deux entrées refusées. 39 contrôles verts.

## 🔴🔴 LE 7 NOVEMBRE — TREIZE QUESTIONS AVAIENT DISPARU, ET MES PROPRES CHIFFRES LE CACHAIENT

Ce soir est le plus désagréable de la série, parce que la faute est la mienne
et que **mes comptes rendus l'ont masquée pendant douze jours**.

### Ce qui s'est passé le 26 octobre

`faire-questions-claude.py --lot` **ajoute** ses questions à une banque déjà
écrite — vingt questions « Le Coran en chiffres », écrites à la main et
vérifiées contre 266 faits calculés. Un générateur relancé **écrase** cette
banque.

Le 26 octobre, la ronde a relancé `faire-11-vocabulaire.py` sans relancer le
lot. La banque est passée de **1 259 à 1 216** cartes, et j'ai écrit que la
baisse venait du retrait de trois entrées du lexique.

La vraie arithmétique était **1 259 − 13 − 30**.

### Pourquoi aucun contrôle ne pouvait le voir — et c'est le pire

- `controler-index.py` compare l'index à la banque. **Les deux étaient refaits
  ensemble**, donc parfaitement d'accord entre eux.
- `controler-sections.py` recompte la table d'état de `DEPLOIEMENT.md`. **Et je
  mettais cette table à jour chaque soir** sur le nouveau total.

> **À emporter, et c'est la leçon la plus dure de ce carnet : un chiffre qu'on
> justifie est un chiffre qu'on ne vérifie plus.** Chaque soir j'écrivais
> « 1 259 → 1 216, voici pourquoi », et l'explication absorbait une perte que
> je n'avais pas vue. Un contrôle qui compare deux choses produites par le même
> passage ne contrôle rien : il constate qu'un outil est d'accord avec
> lui-même. Il faut une **source extérieure au passage** — ici, le fichier de
> lot.

### Ce qui est réparé

Les 13 questions sont revenues, **mêmes identifiants, même contenu** que dans
le lot publié le 29 septembre, à un leurre près qui suit la correction du
lexique du 27 octobre (« compagnie » → « compagnon »).

`controler-questions.py` relit maintenant les fichiers de lot et vérifie que
chaque question déclarée est **servie**. Le sabotage reproduit la faute
historique — relancer `faire-11-vocabulaire.py` seul — et le contrôle répond :
« 20 questions écrites à la main dans les lots, **13 absentes** des banques
servies ».

Et la consigne du mode d'emploi disait **« relancer un générateur, c'est
relancer les deux étapes d'après »**. Il y en a cinq. Corrigée, et
`classer-niveaux.py` passe désormais **après le lot** — l'ordre le mettait
avant, donc les questions du lot sortaient sans niveau.

> **Un pipeline dont une étape AJOUTE à ce qu'une autre ÉCRASE n'a pas d'ordre
> partiel.** Il faut tout rejouer depuis l'étape touchée, *et* vérifier que
> l'ajout est encore là.

## 🔴 LE MÊME SOIR — LE CORAN RÉPÈTE DES VERSETS, ET DEUX CARTES EN LIGNE DONNAIENT TORT

Une carte de *zakat-et-aumone* montrait l'arabe de **27:3** et demandait sa
traduction. Un de ses leurres était la traduction de **31:4** — dont l'arabe
est identique, caractère pour caractère :

```
bonne  : ... acquittent la Zakât et croient avec certitude en l'au-delà
leurre : ... acquittent la Zakât et qui croient avec certitude en l'au-delà
```

**Un mot d'écart, « qui ».** L'élève lit l'arabe, choisit le leurre, et le jeu
lui dit qu'il s'est trompé — alors qu'il vient de donner la traduction
qu'Hamidullah écrit pour ce même texte. Une seconde carte, dans *la-priere*,
faisait l'inverse sur la forme « continuer un verset ».

Le garde-fou existant refuse un leurre qui est un **morceau** de la bonne
réponse. Ici « qui » est inséré **au milieu** : aucune des deux chaînes n'est
contenue dans l'autre.

Et le vivier de leurres, ce sont les traductions des versets du **même
thème** : deux versets identiques parlent forcément du même sujet, donc ils
tombent dans le même vivier. **C'est le cas le plus probable, pas le plus
rare.**

Mesuré : **98 groupes** de versets à l'arabe identique, **279 versets**
concernés. Les plus gros sont des refrains — 31 fois dans la sourate 55, 11
fois dans la 77. Sur les 744 questions « Ce verset se traduit par : » et les
256 « Continuer un verset », **deux** étaient en faute. Deux seulement — mais
le vivier se retire à chaque passage du générateur, et rien n'empêchait les
autres.

> **À emporter : quand on fabrique des mauvaises réponses à partir de vrai
> texte, il faut savoir ce que le texte répète.** Le piège n'est pas la
> coïncidence rare, c'est la structure : ce qui se ressemble se range ensemble,
> et le vivier des leurres est précisément un paquet de choses qui se
> ressemblent.

Réparé dans `fabrique.py`, donc d'un seul endroit pour les deux générateurs qui
écrivent ce thème. Les chiffres : questions 2 603 → **2 616** (+13 restaurées,
et deux cartes dont les leurres changent). 39 contrôles verts.
