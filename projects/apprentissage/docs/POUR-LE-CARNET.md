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

# 📖 islampasapas.fr — RONDES DU 26 SEPTEMBRE AU 26 NOVEMBRE 2026

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

## LE 8 NOVEMBRE — LA QUESTION À POSER D'UN CONTRÔLE

La leçon de la veille généralisée : *un contrôle qui compare deux choses
produites par le même passage ne contrôle rien.* Appliquée aux neuf contrôles
Python, et la question n'est pas **que compare-t-il** mais **contre quoi
s'ancre-t-il**.

| contrôle | son ancre, extérieure au pipeline |
|---|---|
| `controler-lecons` | le corpus coranique, les noms, Unicode |
| `controler-questions` | le corpus, la morphologie, le lexique, les fichiers de lot |
| `controler-sections` | le site servi, **git** |
| `controler-sitemap` | le site servi, Unicode, git |
| `controler-redirections` | le site servi |
| `controler-allege`, `peser` | git |
| `controler-liens` | le système de fichiers et `vercel.json` |
| `controler-index` | **aucune** |

`controler-index` est exactement celui qui était aveugle le 7 novembre. Il
reste utile, mais il ne peut pas voir une **omission commune**.

> **À emporter, et ça vaut pour les cinq sites : deux artefacts d'un même
> passage sont toujours d'accord sur ce qu'ils ont tous les deux oublié.** Un
> tableau de bord qui lit la même base que le script qui l'alimente ne
> surveille rien. Il faut au moins une référence que le passage ne produit
> pas : une source amont, un fichier écrit à la main, ou l'historique git.

### Ce que l'audit a trouvé : les valeurs de ton cahier n'étaient ancrées à rien

`data/sections.json` porte **tes** décisions — numéro d'ordre d'une section, sa
cible de questions, les branches et le ratio de sa géométrie. Ta consigne est
explicite : *« si tu penses qu'une valeur est mauvaise, tu la signales, tu ne la
changes pas. »* Ce fichier est lu par sept outils, cinq contrôles de navigateur
et neuf fichiers du site — et **rien ne vérifiait que ses valeurs étaient
encore les tiennes.**

`controler-sections.py` confronte maintenant les **48** valeurs de décision au
commit du 21 août qui les a posées. L'ancre est git.

Mesure : depuis le 21 août, les 12 sections sont les mêmes et **aucune valeur
chiffrée n'a bougé.** Un seul champ de texte a changé, et c'était moi, le
3 octobre : « De Adam à Muhammad. » est devenu « **D'Adam à Muhammad.** » —
l'élision que le contrôle des questions exige partout ailleurs. Je te le signale
parce que c'est une de tes phrases : ce n'était pas une décision ni un chiffre,
mais c'était ton texte.

### Quatre pistes ouvertes et refermées, mesurées

- **Le texte coranique des 38 leçons** : déjà vérifié caractère pour caractère
  contre le corpus, traductions comprises, **et le nombre de versets de chaque
  sourate**. Rien à ajouter.
- **Le défaut d'apostrophe** trouvé le 6 novembre dans le générateur du
  vocabulaire : aucun autre outil du dépôt ne garde l'apostrophe dans un mot.
  Vérifié sur tous les relevés de mots français. Piste close.
- **Les polices** : 62 pages sur 63 chargent les trois polices depuis Google.
  J'ai cru à une incohérence avec `outils/polices/`, qui contient les mêmes
  polices en local. Lu : ce dossier existe **uniquement pour que les contrôles
  de navigateur mesurent avec les vraies polices**, puisqu'ils coupent le
  réseau. C'est de l'outillage, pas un hébergement. Pas de défaut.
- **La 63ᵉ page**, la seule sans polices, est `google460d2c815736f50e.html` : le
  fichier de validation Search Console. Normal.

### Un petit mensonge dans un bilan, réparé

`controler-liens.py` annonçait « **4** domaine(s) externe(s) : *(vide)*,
fonts.googleapis.com, fonts.gstatic.com, islampasapas.fr ». Le premier était
vide : c'est le favicon, une image SVG posée en clair dans l'attribut, dont le
`//` de `xmlns=http://www.w3.org/2000/svg` tombait dans le découpage du
domaine. Le compte était faux de un et le bilan imprimait un domaine qui
n'existe pas. Il dit maintenant **3 domaines** et compte à part les **62** liens
embarqués.

### Et une information utile pour ta Search Console

Le dépôt contient `google460d2c815736f50e.html`, un fichier de validation par
upload HTML. **C'est pour ça que ta propriété est en « préfixe d'URL »** : une
propriété de type **Domaine** ne se valide pas par fichier, elle se valide par
un **enregistrement DNS TXT** chez ton registrar. Le fichier actuel ne suffira
pas — c'est une manipulation DNS, pas un fichier à déposer.

## 🔴🔴 LE 9 NOVEMBRE — UNE JAUGE QUI COMPTAIT MOITIÉ, ET UN PLAFOND DÉJÀ FRANCHI

Un contrôle surveillait depuis le 12 octobre les versets posés dans
**plusieurs** sections — le Coran associe sans cesse la prière et l'aumône, et
un même verset peut légitimement nourrir deux sections. Son commentaire disait
pourquoi : *« si un générateur se met à reposer des centaines de versets d'une
section à l'autre, cela doit se voir avant la publication, pas après. »*

**Il ne le voyait pas.**

### La cause : la jauge mesurait un substitut

Elle regroupait les questions par le **hachage au bout de l'identifiant**, en
s'appuyant sur une phrase de son propre commentaire : « l'identifiant d'une
question se termine par un hachage du verset. »

C'est faux. Le hachage est calculé **par générateur**. La sourate 1 verset 1 :

```
sens-des-sourates   sourates-777b4c5a
vocabulaire-arabe   vocab-625966c2
vocabulaire-arabe   vocab-9aeefb5d
```

Trois hachages pour un verset. La jauge voyait trois groupes sans rapport et
ne comptait rien. Elle ne repérait que les doublons produits par **un même**
générateur.

| | la jauge | la vérité |
|---|---|---|
| versets dans plusieurs sections | 65 | **133** |
| cartes portées | 138 | **409** |
| part du paquet | 5,1 % | **15,6 %** |

**Le plafond de 90 était donc comparé à un nombre valant la moitié du vrai.**
Avec la vraie mesure, il était déjà franchi — le contrôle était vert par
sous-comptage.

> **À emporter : une jauge bâtie sur un identifiant mesure l'identifiant, pas
> la chose.** Un hachage, un slug, une clé technique sont des commodités du
> producteur ; ils ne sont pas la grandeur. La référence du verset était là,
> en clair, dans le champ `source` de chaque carte. C'est la cinquième fois
> cette année que l'unité de comparaison est la faute de ce projet.

### Et le plafond lui-même était la mauvaise grandeur

Première réaction : desserrer le plafond à 160. Mesure faite ensuite, en
recopiant 40 cartes d'une section dans une autre — la dérive exacte que le
contrôle prétend surveiller :

```
l'ancienne jauge   65 -> 65    elle ne bouge PAS D'UN
la jauge réparée  133 -> 155   elle voit, mais reste sous 160
```

**Un compte absolu ne peut pas servir d'alarme ici**, parce qu'il monte aussi
quand on remplit légitimement une section : il faudrait alors le desserrer
encore, et il ne surveillerait plus rien.

Ce que la phrase du commentaire décrit vraiment, c'est une **paire** de
sections dont la petite est presque entièrement contenue dans la grande. Cette
grandeur-là sépare net :

```
état propre, pire recoupement légitime   47 %   (la prière et l'aumône)
puis 36 %, 16 %, 12 %, 12 %, 7 %...
avec 40 cartes recopiées                 91 %
```

Le plafond est désormais une **part**, 75 %, prise dans le trou entre 47 et
91 %. Une part ne dérive pas quand les sections grossissent. Une paire dont la
petite section a moins de 10 versets n'est pas jugée, et ce compte s'imprime.

> **À emporter : avant de desserrer un seuil, demander si c'est la bonne
> grandeur qu'on mesure.** Un seuil qu'il faut relâcher à chaque fois que le
> produit grandit n'est pas un seuil, c'est un retard à l'allumage. Le passage
> d'un compte à une **proportion** l'a réglé.

### Ce que ça change à ton nombre affiché

Le site annonce **2 616 questions**, et c'est la somme honnête des douze
banques. Mais une question posée dans deux sections y compte deux fois. Mesuré
ce soir, pour la première fois :

**2 479 questions distinctes** (énoncé + bonne réponse + source), soit **137
de moins** que le nombre affiché.

La note du 12 octobre le disait déjà — « en les comptant une seule fois, le
site aurait 2 628 questions distinctes » — avec un chiffre faux de 149, puisqu'
il venait de la jauge fausse. Le contrôle imprime maintenant les deux nombres
chaque soir. **C'est à toi de dire lequel la page d'accueil doit annoncer** :
je ne touche pas à ce que le site revendique.

## CE QUE J'AI MESURÉ POUR TES QUATRE SECTIONS SOUS LE PLANCHER

Elles attendent depuis des semaines dans ce carnet. Ce soir j'ai mesuré ce que
le **Coran seul** peut leur donner, en partant de tes propres mots dans le
cahier, et le résultat les sépare en deux.

| section | ce que tu en dis | versets du Coran | verdict |
|---|---|---|---|
| **le-comportement** (11) | « La parole, la colère, les parents, les voisins. » | **80** | **le Coran suffit** |
| jeune-et-ramadan (8) | « Le mois, ses règles, ses nuits. » | **10** | sous le seuil de 20 |
| le-pelerinage (7) | « Les **étapes** du hajj et de la 'umra. » | **11** | sous le seuil de 20 |

`faire-themes.py` refuse d'écrire une section sous **20 versets**, et le
plancher du cahier est de 100 questions.

- **Le jeûne et le pèlerinage ne peuvent pas venir du Coran** : 10 et 11
  versets. Et ta phrase sur le pèlerinage dit pourquoi — tu demandes « les
  **étapes** », et le Coran ne les expose pas en séquence. Ces deux sections
  reposent sur des hadiths, et c'est exactement le blocage que le carnet
  nomme depuis le 21 octobre : **aucune traduction française citable** dans le
  dépôt. Mesuré, écarté, la décision reste la tienne.
- **« Le comportement », en revanche, tient** : les quatre sujets que tu nommes
  ramènent **80 versets**, dont **65 que personne n'utilise encore**. C'est
  quatre fois le seuil du générateur. Je ne l'ai pas écrit ce soir : ajouter un
  thème, c'est écrire du contenu de section, et je préfère te donner le chiffre
  avant. **Dis-le et c'est fait.**

  > ⛔ **CECI EST RETIRÉ — voir la ronde du 12 novembre, plus bas.** Les 80
  > étaient un compte de correspondances de mots, pas de versets pertinents :
  > sur les 15 de « la colère », **treize parlent de la colère d'Allah**. Le
  > total pertinent est d'une quinzaine, sous le seuil. **Ne réponds pas
  > « vas-y » à cette phrase.**

### Une sixième unité de comparaison fausse, dans la même soirée

Pour compter les versets du pèlerinage, le squelette arabe « حج » seul en
ramène **41** — dont « pierres » (حجارة) et « le rocher » (الحجر), où « hj »
n'est qu'une sous-chaîne. Le double test du générateur, un mot arabe **et** un
mot français, le ramène à 11. C'est pour cette raison que ce double test
existe, et ce soir il a servi.

## LE 10 NOVEMBRE — LA PAGE QUE PERSONNE NE REGARDAIT

Les trente contrôles de navigateur ouvrent des pages du site et mesurent ce
qu'ils y voient. **Lesquelles ?** Personne ne le savait : certains lisent le
sitemap et parcourent ses 53 adresses, d'autres visent deux ou trois pages
écrites en dur. Une page qu'aucun contrôle n'ouvre n'a sa mise en page vérifiée
par personne, et rien ne le disait.

L'analyse du code ne répond pas — les adresses sont construites à l'exécution.
Il fallait regarder **ce qui est réellement demandé**, la même règle que pour
les titres. Le serveur local accepte donc maintenant un journal, à la demande,
et sans la variable d'environnement il se comporte exactement comme avant
(vérifié : 0 octet écrit).

Mesure sur les **3 702 requêtes** d'un passage complet :

| | |
|---|---|
| pages HTML du site | 63 |
| ouvertes par au moins un contrôle | **61** |
| adresses du sitemap jamais demandées | **0 sur 53** |
| contrôles qui n'ouvrent aucune page | 0 |

**La couverture est bonne** : tout ce qui est indexé est regardé. Deux pages ne
l'étaient jamais — le fichier de validation Search Console, qui n'a rien à
afficher, et **`404.html`**.

Celle-là compte : c'est une page que les visiteurs atteignent, et Google aussi.
Elle n'est pas dans le sitemap, et c'est juste — on n'indexe pas sa page
d'erreur. Mais **c'est précisément ce qui la rendait invisible** : tous les
balayages partent du sitemap.

Elle est maintenant dans trois contrôles — lecture d'écran, ponctuation,
contraste. Les trois passent : la page était bonne, elle n'était pas *vérifiée*.
Sabotage pour le prouver : un texte en `#cfd8d4` posé dessus, et le contrôle
répond « /404.html … **1.36 pour 4.5** ».

> **À emporter, et ça vaut pour les cinq sites : une liste de pages bâtie sur
> le sitemap couvre ce qui est indexé, pas ce qui est servi.** Les deux
> ensembles ne coïncident jamais tout à fait — page d'erreur, pages de
> réglages, écrans de jeu, fichiers de validation — et la différence est
> exactement là où personne ne regarde. La question à se poser n'est pas
> « est-ce que mes contrôles passent » mais « sur quoi passent-ils ».

### Deux fois où ma sonde s'est trompée avant de dire vrai

La première version annonçait **14 pages** non couvertes, dont les douze pages
de section. Elle rangeait `/section/x` sur un fichier `section.html` et
`x/qcm` sur `qcm.html`. Les deux étaient faux : le dépôt a **douze** pages
`section-*.html`, une par section, et `/section/:slug/qcm` mène à
`reglages.html`. Les règles se lisent dans `vercel.json`, et la sonde les lit
maintenant là.

Et un premier essai de vérification du journal a conclu « ÉCART » à tort : je
comparais la taille d'un fichier que les trente contrôles étaient en train de
remplir. Refait avec un fichier témoin distinct.

> C'est la même leçon que les cinq précédentes de ce carnet, sous une autre
> forme : **une sonde qui n'est pas elle-même vérifiée raconte ce qu'elle veut.**

## LE 11 NOVEMBRE — UNE GARANTIE QUI TENAIT PAR SOIN, ET MON CONTRÔLE QUI NE POUVAIT PAS ÉCHOUER

Ton site n'a pas de comptes : la progression d'un lecteur vit dans le
`localStorage` de son téléphone. J'ai regardé ce qui arrive quand cet état est
**abîmé** — un onglet fermé au mauvais moment, une version plus ancienne, un
stockage à moitié écrit.

`memoire.js` repose chaque champ sur un socle sain, mais `reprise` est accepté
**en bloc** dès qu'il est un objet : son contenu n'est pas vérifié, contrairement
à `jours` (filtré) et `parJour` (validé clé par clé). Il y avait donc une
question ouverte.

### Mesuré à l'écran, et la robustesse était là

Cinq états abîmés, injectés puis chargés dans un vrai navigateur :

| état | ce que le lecteur voit |
|---|---|
| `paquet` absent | pas de carte de reprise, l'accueil s'affiche |
| `pos` hors du paquet | pas de carte, une partie neuve si on force l'adresse |
| `reprise` = une chaîne | pas de carte, l'accueil s'affiche |
| section inexistante | « **Rien à jouer** — cette section n'est pas encore ouverte. Choisir une autre » |
| section vidée (`vie-du-prophete`) | le même message, avec une sortie |

**Aucune erreur JavaScript, dans aucun cas.** Et surtout : avec une progression
réelle à côté — questions vues, trois jours, record de 7 — **le reste survit
intact** quand la reprise est abîmée. Le lecteur perd l'offre de reprendre, pas
ses semaines.

**Rien n'était donc à réparer.** Mais cette garantie tenait par **soin** et pas
par contrôle : `controler-reprise.mjs` ne mesurait que le chemin heureux. Une
simplification de `charger()` la casserait en silence, et un lecteur perdrait
des semaines sans que rien ne l'avertisse. Le bloc est maintenant dans le
contrôle.

### Et mon propre contrôle ne pouvait pas échouer

Première version du bloc : elle relisait la progression **dans
`localStorage`**. J'ai saboté `charger()` pour qu'une reprise mal formée fasse
tout jeter — et le bloc a **passé**, en affichant « la progression survit ».

Évidemment : le sabotage ne réécrit pas le stockage. Mon assertion mesurait ce
que le stockage **contient**, pas ce que l'application **charge**. Elle ne
pouvait pas échouer.

Corrigé : le bloc lit `M.charger()`, par où passe l'application. Et il vérifie
d'abord que le module est joignable — sinon il le dit, au lieu de mesurer le
vide. Sous sabotage il nomme maintenant les cas : « **LA PROGRESSION EST
PERDUE — 0 question(s), 0 jour(s), record 0 ; attendu 1, 3 et 7** ».

Sa ligne de bilan disait aussi « la progression survit » quoi qu'il arrive. Sous
sabotage, elle l'affichait alors que trois cas sur quatre avaient perdu la
progression. Elle imprime désormais **le chiffre** : « 4 reprises abîmées :
4 où la progression est intacte, 4 sans erreur JavaScript ».

> **À emporter : un contrôle écrit pour une régression doit être essayé CONTRE
> cette régression, pas seulement sur l'état sain.** Le mien passait dans les
> deux cas, ce qui est pire qu'aucun contrôle — il aurait rassuré. Et la cause
> est la même que les six fois précédentes de ce carnet : **je mesurais à côté
> de la chose**, le stockage au lieu du chargement.

## 🔴🔴 LE 12 NOVEMBRE — JE RETIRE CE QUE JE T'AI DIT LE 9 NOVEMBRE

Le 9 novembre je t'ai écrit ceci, sur la section « le comportement » :

> « **Le comportement », en revanche, TIENT** : les quatre sujets que tu nommes
> ramènent **80 versets**, dont **65 que personne n'utilise encore**. C'est
> quatre fois le seuil du générateur. **Dis-le et c'est fait.**

**C'était faux, et il faut que tu saches exactement de quoi.** Les 80 étaient
un compte de **correspondances de mots**, pas un compte de versets qui parlent
de tes sujets. Je ne les avais pas lus.

Lecture faite ce soir, verset par verset :

| ton sujet | correspondances | ce qu'elles sont vraiment |
|---|---|---|
| **la colère** | 15 | **TREIZE parlent de la colère d'ALLAH.** Deux parlent de la colère d'un homme : 7:154, celle de Moïse qui se calme, et 42:37, « qui pardonnent après s'être mis en colère » |
| **la parole** | 37 | la plupart sont « dites » ou « parole » en contexte théologique ou juridique : un mot substitué (2:59), une proposition de mariage (2:235), l'héritage (4:9), la parole ferme d'Allah (14:27) |
| **les parents** | 31 | et l'arabe seul en ramenait **711** — « ام » est une sous-chaîne de dizaines de mots. Huit parlent de bonté ou d'obéissance ; les autres de parts d'héritage et de mariages interdits |
| **les voisins** | 1 | 4:36, et celle-là est juste |

Le total pertinent est de l'ordre de **quinze** versets — **sous le seuil de 20**
du générateur, et très loin de ton plancher de 100.

### Et le risque n'était pas un chiffre faux

Si tu m'avais répondu « vas-y », le site aurait publié une section
**« le comportement »** qui enseigne **« la colère »** à travers **treize
versets sur le courroux divin**. Dans ton nom, sur le site le plus exposé de
l'empire. C'est exactement ce que ta règle éditoriale existe pour empêcher, et
j'en étais à un mot.

> **À emporter, et c'est la septième fois dans ce carnet que c'est la même
> cause : j'ai mesuré le MOT-CLÉ, pas le SUJET.** Un compte de
> correspondances ressemble à une mesure, se calcule en une seconde, et ne dit
> rien de ce qu'on croit lui faire dire. Les six fois précédentes c'était la
> sous-chaîne arabe, « tous les lemmes du mot », l'apostrophe, le hachage de
> l'identifiant, le stockage au lieu du chargement. Ici c'est le mot au lieu
> du sens. **Le remède est toujours le même et il est bête : lire ce qu'on a
> compté.**

### Ce que ça règle, définitivement

Les trois sections sous ton plancher ne peuvent **pas** être nourries par un
balayage de mots-clés, et ce n'est plus une impression mais un compte :

- **le jeûne** (10 versets) et **le pèlerinage** (11) : le Coran n'en a pas
  assez, mesuré le 9 novembre et toujours vrai. Et pour le pèlerinage, ta
  phrase disait déjà pourquoi — tu demandes « les **étapes** », que le Coran
  n'expose pas en séquence.
- **le comportement** : le Coran en a, mais **son vocabulaire pour ces sujets
  ne sépare pas le comportement humain des attributs divins.** Aucune liste de
  mots ne fait cette distinction — il faut un lecteur.

Ces trois sections reposent donc sur des hadiths, et le seul blocage reste
celui que ce carnet nomme depuis le 21 octobre : **aucune traduction française
citable** dans le dépôt. Rien de ce que je peux faire ne le lève.

La leçon est écrite dans l'en-tête de `faire-themes.py`, à l'endroit où la
prochaine personne qui choisira des mots-clés la lira — avec la phrase qui
manquait : « mesurée » veut dire **relue**, pas **comptée**.

## 🔴 LE MÊME SOIR — J'AI REFAIT LA FAUTE DU 26 OCTOBRE, CINQ JOURS APRÈS AVOIR ÉCRIT COMMENT L'ÉVITER

Pour vérifier que le générateur des thèmes était déterministe, je l'ai relancé
seul. **Vingt-et-une questions de pratique ont disparu.**

`faire-pratique.py` **ajoute** ses 47 questions aux banques de thème, et
`faire-themes.py` **réécrit** ces banques en entier. C'est exactement le
mécanisme qui avait fait disparaître treize questions pendant douze jours, le
26 octobre. Le 7 novembre j'ai posé un garde-fou — **pour les fichiers de lot
seulement.** J'avais oublié que `faire-pratique.py` est additif de la même
façon.

### Et la suite ne l'a presque pas vu

Avec le pipeline complet **moins** `faire-pratique.py`, les contrôles ont rendu
**une seule faute** :

> `la-priere : la bonne reponse est la plus courte dans 11.3 % des 115 cartes
> (fourchette 12-40 %) — la longueur la designe`

Un hasard statistique, provoqué par l'absence des cartes — **pas la perte
elle-même**. Sans ce hasard, la suite était **verte**. Et un lecteur de ce
rapport serait parti chercher un problème de longueur de réponses.

La ligne de bilan, elle, affichait « **26** questions de pratique » au lieu de
47 — un nombre que **rien ne comparait à rien**.

### Le garde-fou, symétrique de celui du 7 novembre

La table de `faire-pratique.py` est la source, comme les fichiers de lot : ce
qu'elle déclare doit se retrouver servi. Le contrôle imprime maintenant les
deux côtés et nomme chaque manquante :

```
47 question(s) de pratique declarees dans la table, 21 absente(s)
   pratique : « Avant la Salât, que faut-il laver en premier ? »
              (sourate 5 verset 6) est declaree ... et ABSENTE
```

Après le pipeline complet : **47 déclarées, 0 absente**, et l'arbre revient
**exactement** à son état commité — les banques, les pages, le sitemap, à
l'octet. Le pipeline est donc bien reproductible ; ce qui ne l'était pas, c'est
ma façon de le lancer.

> **À emporter : quand on trouve un mécanisme de perte, il faut chercher TOUS
> ses exemplaires, pas réparer celui qu'on a sous les yeux.** Le 7 novembre
> j'avais le lot sous les yeux et j'ai écrit « un pipeline dont une étape
> AJOUTE à ce qu'une autre ÉCRASE n'a pas d'ordre partiel » — sans aller
> compter combien d'étapes ajoutent. Il y en avait deux. J'en ai gardé une.

Et la preuve que la leçon ne suffit pas à protéger : **c'est moi qui ai refait
la faute, cinq jours après l'avoir écrite**, en lançant un générateur seul pour
une raison parfaitement légitime. Un garde-fou vaut mieux qu'une phrase dans un
mode d'emploi.

---

## LE 13 NOVEMBRE — CE QUE LA CARTE MONTRE, ET CE QUE LE CONTRÔLE REGARDAIT

### La question de ce soir

Tous les contrôles de ce projet confrontent des **champs** au corpus : la
source dit sourate 2 verset 3, le texte arabe est-il bien celui de 2:3 ; la
glose dit « croyants », le corpus morphologique la confirme-t-il. Aucun ne
regardait **ce que la carte met sous les yeux du lecteur**.

Or `js/qcm.js` n'affiche que six choses : le surtitre, le verset, le mot en
vert, le glyphe, l'énoncé, les quatre réponses. **Ni la source, ni
l'explication, ni la section, ni l'identifiant** — tout ce sur quoi les
contrôles s'appuient est invisible au moment où la personne répond. Deux
fautes se cachent dans cet écart.

### A. LE VERT TOMBE-T-IL SUR LE BON MOT ?

Les 1 161 cartes de vocabulaire montrent un verset entier et surlignent le mot
dont on demande le sens. Le navigateur le pose ainsi :

```js
js/qcm.js:195     var i = t.indexOf(m);
```

`indexOf` cherche une **sous-chaîne**. Si le mot visé est une sous-chaîne d'un
mot plus long placé avant lui dans le verset, **le vert se pose sur un morceau
du mauvais mot**, et la carte demande le sens d'un fragment.

Et le contrôle qui existait depuis septembre écrit :

```python
if q['surligne'] not in (q.get('arabe') or ''):
```

**La même recherche de sous-chaîne.** Il ne pouvait pas voir cette faute. Un
générateur qui surlignerait le **radical** au lieu de la forme fléchie — et
`faire-11-vocabulaire.py` manipule des radicaux à longueur de code — les
produirait toutes d'un coup, la suite restant verte.

C'est la **huitième** fois que ce carnet trouve la même cause : une
correspondance approximative prise pour une identité. Les sept précédentes : la
sous-chaîne arabe « ام » qui ramenait 711 versets, « tous les lemmes du mot »,
l'apostrophe de « l'enfer », le hachage de l'identifiant, le stockage au lieu
du chargement, le sitemap au lieu du servi, le mot-clé au lieu du sujet.

**La règle de bord est mesurée, pas supposée.** J'ai compté les caractères du
corpus arabe de ce dépôt : le seul séparateur de mots est l'espace U+0020
(76 587 occurrences). Tous les autres caractères non-lettres sont des signes
combinants, qui s'attachent **à l'intérieur** d'un mot. Un signe combinant
juste après la correspondance prouve donc qu'elle a coupé un mot en deux.

**Résultat de la mesure : 644 mots en vert, 644 posés sur un mot entier.**
Rien à réparer. La garantie tenait — par le soin du générateur, pas par un
contrôle. Elle est maintenant tenue par un contrôle.

### B. DEUX CARTES QUI MONTRENT LA MÊME CHOSE

Le 7 novembre, deux cartes en ligne **donnaient tort à une bonne réponse** : le
Coran répète des versets, deux versets au même arabe tombaient dans le même
vivier de leurres, et la traduction de l'un servait de leurre à la question
posée sur l'autre. Réparé dans `faire-themes.py` et `faire-01-sourates.py` avec
`traductions_jumelles`, **indexé sur l'arabe identique**.

Mais la réparation vit dans **deux générateurs**, et son effet n'était mesuré
nulle part. Un troisième générateur, ou une forme de question dont l'énoncé ne
montre **pas** d'arabe — la forme B montre une moitié de traduction française —
refait la faute sans que rien ne la voie.

Le nouveau contrôle **ne regarde aucun générateur**. Il groupe les cartes
**servies** par ce qu'elles montrent, et couvre donc toutes les formes et tous
les générateurs, y compris ceux qui n'existent pas encore.

| Mesure | Chiffre |
|---|---|
| énoncés visibles partagés par plusieurs cartes | **90** |
| … dont les bonnes réponses diffèrent | **1** |
| cartes qui marquent faux une réponse juste | **0** |

Le zéro est la preuve indépendante que la réparation du 7 novembre tient sur ce
qui est servi — pas seulement dans le code des générateurs.

### Le cas unique, lu

Sourate 84, **versets 2 et 5, arabe identique** :

> « وَأَذِنَتْ لِرَبِّهَا وَحُقَّتْ »
>
> v. 2 — « et obéira à son Seigneur - et fera ce qu'il doit faire »
> v. 5 — « et qu'elle obéira à son Seigneur - et fera ce qu'elle doit faire »

La différence est **un pronom** : le verset 2 parle du **ciel**, le verset 5 de
la **terre**, et Hamidullah accorde au sujet. Les deux traductions sont justes,
chacune à sa place. Le lecteur n'est pas lésé : la jumelle n'est pas dans les
leurres, il répond sur le sens et il a juste.

**Ce n'est donc pas une faute, et je n'ai pas touché au texte traduit.** Mais
le nombre est figé dans le contrôle à 1 : un cas de plus devra être **lu** avant
d'être accepté. Un chiffre qui monte tout seul est un chiffre qui ne dit rien.

### Les trois sabotages

La leçon du 11 novembre — *un contrôle écrit pour une régression doit être
essayé contre cette régression* — appliquée avant de committer :

| Sabotage | Ce que le contrôle a fait |
|---|---|
| `surligne` tronqué de deux caractères (le radical au lieu de la forme) | **sortie 1**, carte nommée, bilan passé de 644 à **643** |
| la traduction de 84:5 remise dans les leurres de 84:2 | **sortie 1**, « cette carte marque FAUX une réponse JUSTE » |
| un arabe rendu identique à celui d'un autre verset | **sortie 1**, bilan passé de 1 à **2** ambigus, « à LIRE » |

Et dans le premier cas, **le contrôle d'origine est resté muet** : une seule
faute remontée, la mienne. La preuve qu'il ne pouvait pas la voir.

### Les chiffres

```
questions                2 616, inchangé
mots en vert             644 mesurés, 644 sur un mot entier
énoncés partagés         90, dont 1 à bonnes réponses différentes
réponses justes          0 marquée fausse
contrôles               39 verts (9 python + 30 navigateur)
```

### Ce que je n'ai pas fait

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.
Le levier 1 — les titres — reste écarté pour la raison mesurée du 21 octobre :
**12 impressions**, alors que la compétence de l'empire demande **88**
impressions avant de juger un titre. Et le site reste injoignable depuis ce
conteneur (`000` sur les trois adresses), donc tout ce qui précède est
**vérifié au dépôt, non vérifié en ligne**.

---

## LE 14 NOVEMBRE — LA RÈGLE LA PLUS IMPORTANTE DU SITE NE COUVRAIT QUE LA MOITIÉ DU SITE

### Ce que j'ai cherché

La règle éditoriale que tu as posée toi-même : **on ne promet aucun mérite**
(« celui qui la récite… », « elle protège de… », « les vertus de… ») et **on
n'attribue aucune parole au Prophète** au nom du site, parce que ce projet n'a
**aucune traduction française sourcée** de hadiths.

`controler-questions.py` la fait respecter depuis le 15 octobre. J'ai regardé
où elle s'applique :

| fichier | `MERITES` | `RECUEILS` | voix du site |
|---|---|---|---|
| `controler-questions.py` | ✅ | ✅ | ✅ |
| `controler-lecons.py` | — | — | — |
| `controler-sections.py` | — | — | — |
| `controler-index.py` | — | — | — |

**Elle ne s'appliquait qu'aux 2 616 questions. À aucune des 63 pages HTML.**

Et les pages sont la surface exposée : la **leçon de sourate est le seul format
qui classe** sur ce site — al-Ikhlas sort en position 11 — et les mots de mérite
sont précisément les plus cherchés. Une promesse posée là ferait venir des gens
sur une page qui ne répond pas, et t'engagerait sur un contenu qui n'existe pas.

C'est la **même forme de faute que les deux nuits précédentes** : un garde-fou
posé sur un chemin pendant que l'autre passe à côté. Le 12 novembre c'étaient
les lots et la pratique ; le 13, les générateurs et le servi ; ce soir, les
questions et les pages.

### Ce que la mesure a donné

```
63 pages, 4 089 morceaux de texte dans la voix du site
0 promesse de mérite, 0 attribution, 0 recueil nommé
```

**Rien à réparer.** La règle tenait — par soin, pas par contrôle.

### Et j'ai vérifié que la sonde pouvait trouver

Un zéro rendu par une sonde incapable de rendre autre chose ne mesure rien
(leçon du 11 novembre). J'ai donc planté à la main, dans la leçon d'al-Ikhlas :

> `<p class="lecon-quoi">Celui qui la recite trois fois a la recompense du
> Coran entier.</p>`

La sonde l'a nommée deux fois — sur « recompense » et sur « celui qui la
recite ». Le zéro est donc un vrai zéro.

### Le choix de conception qui porte tout le poids

La règle porte sur **qui parle**, pas sur les mots employés. Le site peut citer
« récompense » ; il ne peut pas en promettre une. Le contrôle écarte donc le
texte cité — les classes `verset-ar`, `verset-fr`, `verset-source`, `lecon-ar`,
et tout ce qui est entre guillemets.

**Ce n'est pas une précaution théorique.** Mesure :

```
571 traductions de versets publiées sur les pages
 12 contiennent un mot de la liste des mérites
```

Parmi elles, **« Dis: "Je cherche protection auprès du Seigneur de l'aube
naissante" »** — Al-Falaq, verset 1. Sans cette exclusion, le contrôle aurait
levé douze fautes **sur le Coran lui-même**, et la réparation évidente aurait
été d'affaiblir la liste des mots — c'est-à-dire de détruire le garde-fou pour
faire taire une fausse alerte.

### Une seule liste, pas deux

Les trois listes de mots étaient écrites **dans** `main()`. Un second endroit en
avait besoin, et la tentation était de les recopier. **C'est exactement la faute
du 12 novembre** — deux exemplaires d'une règle dérivent toujours. Elles sont
donc remontées au module, et les deux surfaces lisent **les mêmes tuples**.

### Ce que les pages disent à Google

54 des 63 pages portent un bloc `application/ld+json` : la déclaration que
Google lit sur la page elle-même. **Un seul contrôle le regardait** — celui
d'`index.html`. Les 53 autres n'étaient lus par personne.

Trois accords sont maintenant vérifiés, et seulement trois, parce que ce sont
les seuls qui rendent une page **menteuse** si on les casse : l'adresse déclarée
doit être l'adresse canonique, la description déclarée doit être la meta
description, la langue déclarée doit être le français.

| mesure | chiffre |
|---|---|
| blocs `ld+json` relus | **54** |
| JSON invalide | **0** |
| adresse déclarée ≠ canonique | **0** |
| description déclarée ≠ meta | **0** |
| pages sans bloc | **9** — les écrans non indexables et le fichier de vérification Google |

### Ce que j'ai failli te raconter, et qui était faux

Ma première version comparait aussi le `name` du bloc au `<title>` de la page,
et sortait **39 « écarts »** :

> `name` « Sourate Abasa, verset par verset » absent du `<title>` « Sourate
> Abasa : traduction, texte arabe, 42 versets »

**Ce n'étaient pas des fautes.** schema.org n'a jamais demandé que `name`
recopie le titre : le titre porte les mots de la requête, le nom porte celui de
la ressource. **Le critère était de moi, pas de la norme.** Trente-neuf lignes
rouges inventées — et si je les avais « réparées », j'aurais aligné 38 titres de
leçon sur un texte sans mots de requête, c'est-à-dire cassé le seul levier qui
marche ici. Il n'est pas dans le contrôle.

### Les quatre sabotages

| Sabotage | Ce que le contrôle a fait |
|---|---|
| une promesse de mérite plantée dans al-Ikhlas | **sortie 1**, 2 fautes, élément nommé |
| l'adresse `ld+json` d'al-Falaq pointée sur al-Fatiha | **sortie 1**, les deux adresses citées |
| un bloc `ld+json` rendu invalide | **sortie 1**, « Google ne lit alors RIEN » |
| la langue déclarée passée à `en` | **sortie 1**, langue citée |

### Ce que j'ai aussi vérifié, et laissé tel quel

- **Les titres réellement servis** (lever 1), mesurés sur le serveur local et
  non dans la source : 63 pages, **0 titre en double**, **0 description en
  double**, **0 titre de plus de 60 caractères**. Seuls `404.html` (qui porte
  `noindex` et n'est pas au sitemap) et le fichier de vérification Google n'ont
  pas de description — c'est correct.
- **Les commentaires du code** contiennent « merite », « recompense »,
  « vertu », « al-Bukhari » — tous lus un par un : ce sont **la règle
  elle-même**, écrite en commentaire (« FAIT, sec et exact, et jamais un
  merite »), et ils sont retirés par `alleger.py` avant la mise en ligne. Plus
  joli encore : **« couverture » contient « vertu »**. Une recherche de mots
  seule aurait rendu dix faux positifs. Il faut lire.
- **Les 55 scripts en ligne** des pages : ce sont les blocs `ld+json`, aucun mot
  interdit.
- **Pas de translittération** sur les leçons : la règle « translittération
  toujours vérifiée » n'a donc rien à mordre ici.

### Les chiffres

```
questions                2 616, inchangé
pages relues                63, 4 089 morceaux de la voix du site
promesses, attributions      0
blocs ld+json               54, 0 écart
traductions citées         571, dont 12 portant un mot de mérite — écartées
contrôles                   39 verts (9 python + 30 navigateur)
```

### Ce que je n'ai pas fait

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.
Le lever 1 reste écarté pour la raison mesurée du 21 octobre : **12
impressions**, contre les **88** que demande la compétence de l'empire avant de
juger un titre. Et le site reste injoignable depuis ce conteneur : **vérifié au
dépôt, non vérifié en ligne.**

### Une note sur le chiffre ci-dessus, ajoutée après coup

La ligne « **39 verts (9 python + 30 navigateur)** » a été écrite dans ce
fichier **pendant que les 30 contrôles navigateur tournaient encore**. Ils ont
rendu `30 verts, 0 rouges` quelques minutes plus tard, donc le chiffre est
exact — mais je l'avais posé **avant de l'avoir mesuré**.

C'est, en petit, exactement la faute que ce carnet passe son temps à trouver :
un nombre qui a l'air d'une mesure et qui est une attente. Il se trouve qu'il
était juste ; il aurait pu ne pas l'être, et rien dans la phrase ne l'aurait
signalé. Le message de commit, lui, dit ce qui était vrai à l'heure du commit :
« 9 python verts ; les 30 navigateur tournaient encore ».

> **À emporter : un chiffre s'écrit après la mesure, pas avant — même quand on
> est sûr, et surtout quand on est sûr.**

---

## LE 15 NOVEMBRE — LE CONTRÔLE DU MAILLAGE NE MESURAIT PAS LE MAILLAGE

### Ce que j'ai cherché

Le brief range « un maillage réparé » parmi les trois formes de bon petit
travail, à côté de « deux titres » et « une leçon enrichie ». J'ai donc ouvert
`controler-liens.py` pour voir ce qu'il mesure. Son propre en-tête dit :

> « Le maillage interne est justement le levier qu'on est en train de
> reconstruire — le mesurer coûte une minute. »

Il ne mesurait pas le maillage. Il mesurait les **liens morts** — ce qui n'est
pas la même question, c'est **la question inverse** :

| la question | ce qu'elle trouve |
|---|---|
| ce lien **arrive-t-il** quelque part ? | une flèche qui tombe à côté |
| un lien **arrive-t-il sur** cette page ? | une flèche qui manque |

Une page que personne ne lie a **zéro lien mort**. Elle est irréprochable pour
ce contrôle, et invisible pour un robot qui arrive sur le domaine et suit les
liens. Les 1 464 liens que ce contrôle vérifie chaque nuit ne disaient rien de
cela.

### Ce que la mesure a donné

```
63 pages, 451 liens <a> internes
53 pages déclarées dans sitemap.xml
53 atteintes depuis l'accueil — 1 à 0 clic, 14 à 1 clic, 38 à 2 clics
profondeur maximale                 2
page indexable orpheline            0
```

**RIEN À RÉPARER.** Les 38 leçons sont à deux clics, avec 3 ou 4 liens
entrants chacune : `sourates.html`, `section-sens-des-sourates.html`, et la
leçon précédente et suivante. Les deux extrémités de la chaîne — Al-Fatiha et
An-Nas — en ont 3 au lieu de 4, parce qu'une chaîne a deux bouts.

Huit pages ne reçoivent aucun lien : sept écrans internes en `noindex`, et
`google460d2c815736f50e.html`, qui **doit** rester sans lien — c'est un fichier
de vérification, pas une page du site. Faire rouge sur ces huit serait un rouge
permanent, et un rouge permanent ne se lit plus.

### Et j'ai vérifié que la sonde n'était pas aveugle au JavaScript

Mon graphe lit le HTML. Si un lien entrant n'existait qu'après exécution du
JavaScript, j'aurais annoncé orpheline une page que le robot atteint. Ce
fichier connaît déjà le piège : il lit les scripts des pages parce que l'ancre
de `section.html` est posée par `section.js`.

J'ai donc rendu les **63 pages dans Chromium** et comparé les `<a href>` du
HTML à ceux de la page rendue. **Une seule page ajoute un lien par
JavaScript** : `resultat.html` vers `sections.html` — une page en `noindex`,
hors sitemap, pointant vers une page déjà à 1 clic. Le graphe du HTML est donc
un plancher exact pour tout ce qui est indexable.

### LE CHOIX DE CONCEPTION QUI PORTE LE POIDS : LES LIENS ÉCRITS EN ABSOLU

Le contrôle des liens morts ne suit **pas** les liens absolus, et range
`islampasapas.fr` parmi ses trois domaines externes. C'est juste pour chercher
un lien mort — cette session n'a pas de réseau. C'est **faux** pour
l'atteignabilité : un `<a href="https://islampasapas.fr/...">` est un lien
interne, le robot arrive sur la page.

Mesuré : le site porte **55 href absolus vers lui-même, et les 55 sont des
`<link rel="canonical">`** — aucun n'est une navigation. La branche qui les
suit ne change donc rien aujourd'hui. Le sabotage 4 montre pourquoi elle est
là quand même : en passant les quatre liens vers al-Ikhlas en absolu, **le
compte des liens suivis tombe de 1 464 à 1 460** — le contrôle des liens morts
cesse de les voir — et le maillage les suit. Sans cette branche, un contrôle
réutilisant la même logique aurait déclaré **al-Ikhlas injoignable sur un site
correct** : la page qui sort en position 11, la seule preuve que ce format
marche.

### UNE SEULE COPIE, PAS DEUX

La résolution des chemins — fichier du dossier, réécriture de `vercel.json`,
`/` qui désigne l'index — était écrite **dans `main()`**. Il m'en fallait une
seconde utilisation, et la tentation était de la recopier. C'est la faute du
12 novembre. Je l'ai **sortie en fonction**, et les deux questions lisent la
même.

Preuve que l'extraction n'a rien changé : la version du dépôt et la version
modifiée impriment les mêmes trois lignes — **1 464 liens vérifiés, 62 liens
embarqués, 3 domaines externes**.

### LA RÈGLE QUE JE N'AI PAS ÉCRITE, ET POURQUOI

La profondeur est **mesurée et dite, jamais jugée**. J'ai failli poser « pas
plus de deux clics », parce que c'est ce que mesure le site aujourd'hui. Une
page à trois clics n'est pas un défaut. Et ce fichier porte, vingt lignes plus
bas que son en-tête, à propos du deux-points de `re.escape` :

> « Un contrôle qui se trompe est pire qu'un contrôle absent : on apprend à
> ignorer ce qu'il dit. »

La faute, elle, est posée là où elle est réelle et sans faux positif : **une
page que `sitemap.xml` déclare et qu'aucun lien interne n'atteint.** Dire à
Google « indexe cette page » sans lui donner un seul lien vers elle, c'est
envoyer deux signaux contraires.

### LES QUATRE SABOTAGES

| sabotage | attendu | obtenu |
|---|---|---|
| le sitemap déclare `motifs.html`, que rien ne lie | rouge | sortie 1, page nommée |
| al-Ikhlas perd ses 4 liens entrants (redirigés vers une page qui existe, donc aucun lien mort) | rouge | sortie 1, page nommée |
| un lien mort — la partie d'origine répond-elle encore après l'extraction ? | rouge | sortie 1, lien nommé |
| les 4 liens vers al-Ikhlas passés en absolu | **vert** | sortie 0, 53 pages atteintes |

### Ce que cette règle garde aussi

`controler-liens` est l'un des **six** contrôles que `publier.py` exige avant
d'expédier quoi que ce soit. La règle ne garde donc pas seulement la nuit : elle
garde la porte de sortie.

### Ce que j'ai vérifié et laissé tel quel

J'ai rouvert la question des hadiths, parce qu'un blocage majeur du site repose
sur « ce projet n'a aucune traduction française sourcée » alors que
`outils/coran/` contient trois recueils **en français** — Boukhari, Mouslim,
Abou Dawoud. Vérifié : leur `metadata` ne porte que `name`, `sections`,
`section_details`. **Aucun traducteur nommé.** Le carnet avait déjà tranché le
21 octobre, dans les mêmes termes et avec les mêmes chiffres : 20 426 hadiths,
aucun citable, « traduction de traduction ». La mesure n'a rien appris de neuf
— c'est exactement ce qu'on attend d'une prémisse qui tient.

### Ce que je n'ai pas fait

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.

- **Levier 1** écarté pour la raison mesurée du 21 octobre : **12 impressions**,
  contre les **88** que la compétence de l'empire demande avant de juger un
  titre. Et sans les requêtes, « mettre les mots exacts de la requête en début »
  n'est pas applicable : on ne les connaît pas.
- **Levier 2** reste bloqué par une mesure qui n'est pas dans ce dépôt. Le juz
  'Amma est complet depuis le 16 septembre — 37 sourates plus Al-Fatiha. Aller
  plus loin demande un chiffre par sourate, combien de gens tapent « sourate
  al-mulk », et il est dans Search Console. Le choix entre le **juz 29** et les
  **neuf sourates courtes** est à toi ; il est posé plus haut dans ce fichier,
  avec son coût mesuré.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 ont rendu leur réponse
après le commit, et le message de commit dit ce qui était vrai à son heure —
« 9 python verts ; les 30 navigateur tournaient encore ». Le chiffre est écrit
ici parce qu'il est maintenant mesuré, pas parce qu'il était attendu. C'est la
leçon de la veille, appliquée le lendemain.

---

## LE 16 NOVEMBRE — LA MOITIÉ DU RÉSULTAT DE RECHERCHE QUE PERSONNE NE TENAIT

### Ce que j'ai cherché, dans l'ordre du brief

Le levier 1 est le premier, et il demande deux choses : les mots de la requête
en début de titre — **impossible, les requêtes ne sont pas dans le carnet** —
et **moins de 60 caractères**, qui ne demande aucune requête. J'ai donc vérifié
celle-là d'abord.

Elle est tenue, et gardée : `controler-sitemap.py` relit les 53 titres servis
depuis le 3 novembre. **Rien à trouver de ce côté. C'est une confirmation, pas
une découverte**, et c'est ce qu'on attend d'une règle qui tient.

Alors j'ai regardé l'autre ligne. Google en affiche **deux** : le titre, et la
description sous lui. `controler-questions.py` l'écrit depuis longtemps — « le
`<title>` et la meta description y sont, et **ils comptent double** ». Une
seule des deux était tenue partout.

### La mesure

| règle | tenue par | pages |
|---|---|---|
| titre ≤ 60 car. | `controler-lecons`, `controler-sections`, **`controler-sitemap` (3 nov.)** | **53 / 53** |
| description 150–160 car. | `controler-lecons` (38 leçons), `controler-sections` (11 sections + l'accueil) | **50 / 53** |

Les descriptions servies, mesurées sur le site servi en local, jamais sur la
source :

| famille | pages | longueurs | hors fourchette |
|---|---|---|---|
| leçons | 38 | 150 à 157 | 0 |
| sections | 11 | 150 à 159 | 0 |
| **écrites à la main** | 4 | **91 à 159** | **1** |

### Les trois pages, et la preuve que personne ne les tenait

| sabotage, chiffres annoncés laissés exacts | résultat |
|---|---|
| `sections.html` 159 → 50 car., ses trois copies | **8 verts, 1 rouge** — et ce rouge était le `lastmod` |
| `sourates.html` 152 → 46 car., ses trois copies | **7 verts, 2 rouges** — le tableau de `DEPLOIEMENT.md` et le `lastmod` |
| `plus.html` : aucun sabotage nécessaire | il portait **91 caractères** avec les **neuf contrôles verts** |

Les chiffres annoncés ont été laissés exacts dans les deux sabotages — sinon
la règle des nombres aurait bronché à la place de celle de la longueur, et
j'aurais cru la description tenue. C'est le piège que la note du 3 novembre
nomme pour le `lastmod` : **un masquage donne un rouge, et un rouge est une
mauvaise preuve quand il parle d'autre chose.**

**Ce que ça coûtait.** `sourates.html` porte **7 des 12 impressions du site** —
la page la plus vue. La seule ligne que Google affiche sous son titre n'était
tenue par personne.

*Quatrième fois que les fichiers écrits à la main sont les seuls à échapper à
une règle : `plus.html` le 23 octobre, `robots.txt` le 25, les titres le
3 novembre, les descriptions ce soir.*

### La seule correction de contenu de la nuit

`plus.html`, la page « À propos » — celle où un lecteur attentif va voir si le
site est sérieux — portait 91 caractères quand la fourchette maison est 150 à
160. Ses **trois copies** (`<meta name="description">`, `og:description` et la
donnée structurée) ont reçu le même texte de **151 caractères** :

> Comment ce site est fait : chaque question avec sa source, la traduction du
> sens de Muhammad Hamidullah, aucun compte, aucune publicité, aucun traceur.

Chaque affirmation est dans le corps de la page, et vérifiable là :

| ce que la description dit | ce que la page dit |
|---|---|
| « comment ce site est fait » | son titre de section : « Comment c'est fait » |
| « chaque question avec sa source » | « Chaque question sort d'une source vérifiable » |
| « la traduction du sens de Muhammad Hamidullah » | « des traductions **du sens**, pas le Coran lui-même. Celle utilisée ici est celle de Muhammad Hamidullah » |
| « aucun compte » | « Il n'y a pas de compte, pas d'inscription, pas d'adresse e-mail » |
| « aucune publicité, aucun traceur » | « Aucune publicité, aucun traceur, aucun cookie de mesure » |

**La règle religieuse, appliquée à une meta description.** Le traducteur est
**nommé**, et la traduction est dite traduction **du sens** — pas le Coran.
Aucun mot de la liste que `controler-sitemap.py` interdit dans un titre ou une
description (`bienfait`, `mérite`, `vertu`, `récompense`, `protection`,
`baraka`…) : ce contrôle a relu les 53 titres et les 53 descriptions après la
correction et il est resté vert. Et **aucune promesse de hadith** : le site
n'en porte pas, et sa page « À propos » a déjà été corrigée le 23 octobre pour
avoir annoncé le contraire.

### La règle, écrite là où vit déjà celle des titres

Une seule boucle lit maintenant **les deux moitiés du même résultat** : un
`GET` par adresse, le titre et la description dans la même passe.

| branche | message |
|---|---|
| > 160 car. | « Google la coupera au milieu » |
| < 150 car. | « trop courte, Google écrira sa propre phrase à la place » |
| absente | « pas de meta description » |

**Le plancher compte autant que le plafond.** Un plafond seul — le miroir
exact de la règle des titres, qui n'a pas de plancher — aurait laissé passer
les deux sabotages ci-dessus. Trop longue, Google coupe ; trop courte, il
écrit sa propre phrase et on perd la main sur ce qui s'affiche.

### Les quatre sabotages contre la règle neuve

| sabotage | ce que le contrôle a dit |
|---|---|
| `sections.html` 159 → 50 | sortie 1, « description de 50 caractères, le minimum est 150 » |
| `sourates.html` 152 → 46 | sortie 1, « description de 46 caractères, le minimum est 150 » |
| `sourates.html` → 226 car. | sortie 1, « le maximum est 160 — Google la coupera au milieu » |
| description supprimée | sortie 1, « pas de meta description » |
| arbre restauré | **sortie 0, zéro ligne de description** |

### La borne est en double, et c'est voulu

La veille, la leçon était « une seule copie, pas deux ». Ici il y en a deux, et
ce n'est pas la même chose : `controler-lecons` et `controler-sections`
vérifient **ce qu'un générateur a produit**, page par page ; `controler-sitemap`
vérifie **ce que le serveur rend** pour les 53 adresses déclarées. Deux
questions différentes posées sur deux objets différents — pas un même code
recopié. Si un générateur change, ou si une page sort de son générateur, le
filet de derrière tient encore. C'est déjà la forme que la maison a donnée au
titre : le 60 vit dans trois fichiers depuis le 3 novembre.

### Ce que je n'ai pas écrit

La règle des **trois copies identiques** (`<meta>`, `og:description`, donnée
structurée) n'est vérifiée que sur l'accueil, depuis le 5 octobre. Elle ne
l'est pas sur les 52 autres. Je l'ai respectée à la main sur `plus.html` et je
ne l'ai **pas** transformée en contrôle ce soir : une règle par nuit, mesurée,
sabotée, documentée. C'est **non vérifié**, pas écarté — et c'est le candidat
le plus propre pour la prochaine ronde.

> ⚠️ **Ce paragraphe était faux, et c'est la ronde du 17 novembre qui l'a
> mesuré.** La paire ld+json ↔ meta description était **déjà tenue sur les
> 63 pages** depuis le 14 novembre, par `controler-questions.py`. Une seule
> des trois paires était libre : **og ↔ meta**. Je l'avais écrit par déduction
> — « le bloc 11 ne regarde que l'accueil, donc rien d'autre ne regarde » —
> sans ouvrir les autres contrôles. La correction est dans la section du
> 17 novembre, et la leçon est la même que celle du 14 et du 15 : **une
> affirmation sur l'état du dépôt se mesure, même quand elle paraît évidente.**

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.

- **Levier 1, les mots de la requête en début de titre** : il faut les
  requêtes, et le carnet n'a aucune table Requêtes pour ce site — vérifié à
  nouveau ce soir dans `docs/MESURES.md`, **toujours le relevé du 21 août, rien
  depuis.** Les **quatre** pages qui ont des impressions ont été remesurées
  servies, titre et description : accueil 55 / 153, al-Ikhlas 54 / 157,
  `sourates.html` 53 / 152, al-Falaq 53 / 154. **Les huit sont dans les
  règles** — il n'y a rien à corriger là, seulement des mots à mettre en tête
  quand on saura lesquels.
- **Levier 2, multiplier les leçons** : le juz 'Amma est complet depuis le
  16 septembre, et aller plus loin demande un chiffre par sourate qui est dans
  Search Console. Le choix entre le juz 29 et les neuf sourates courtes reste
  à Mohamed.
- **File de publication inchangée** : 141 fichiers modifiés depuis `59e67ae`,
  **72 en ligne, 69 au dépôt**. Les trois fichiers touchés ce soir y étaient
  déjà — et cette fois **deux partent en ligne** (`plus.html`, `sitemap.xml`),
  ce qui n'était pas arrivé depuis plusieurs nuits.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi — « 9 python verts ; les 30
navigateur TOURNENT ENCORE ». Le chiffre est écrit ici parce qu'il est
maintenant mesuré. Deuxième nuit de suite que l'ordre est respecté : la mesure,
puis le chiffre.

---

## LE 17 NOVEMBRE — LA RÈGLE RELIGIEUSE NE LISAIT PAS LE CHAMP PAR LEQUEL LE SITE SE PARTAGE

### Ce que j'ai cherché

Hier soir j'avais écrit que la règle des trois copies de la description
n'était tenue que sur l'accueil, et que c'était le candidat de cette nuit.
**C'était faux.** La paire ld+json ↔ meta était déjà tenue sur les 63 pages
depuis le 14 novembre. Je l'avais déduite au lieu de la mesurer. La mesure de
ce soir a donc commencé par corriger ma propre note — puis elle a trouvé
autre chose, et de plus grave.

| paire | tenue ? |
|---|---|
| meta ↔ ld+json | **oui, les 63 pages**, depuis le 14 novembre |
| les trois, ensemble | oui, **sur l'accueil seulement**, depuis le 5 octobre |
| **meta ↔ `og:description`** | **non. Nulle part.** |

### Ce que la mesure a donné d'abord

| mesuré sur les 53 pages servies | résultat |
|---|---|
| copies de la description (meta / og / ld+json) | **1 / 1 / 1 sur les 53** |
| les trois disent-elles la même chose ? | **oui, les 53** |
| `canonical` vs `og:url` | 0 écart |
| `og:image` | une seule valeur, le fichier existe |
| `lang` | `fr` sur les 53 |
| `<title>` vs `og:title` | 0 écart |

Rien à réparer. **Tout était vrai — et deux champs n'étaient tenus par
personne.**

### Le trou, et pourquoi il était invisible

`controler-sitemap.py` vérifie depuis le 17 septembre que les quatre balises
de partage sont **présentes**, et que `og:image` désigne un fichier qui
existe. Sa propre note dit pourquoi : « Partagées dans une conversation — et
c'est ainsi qu'un site comme celui-ci circule. »

**Présentes, jamais lues.** Et le lecteur qui recueille « la voix du site » —
le texte qu'une page affirme en son nom, sur lequel s'appliquent la règle du
mérite, celle des recueils de hadith et celle des attributions — ne regardait
que `name="description"`. Les balises de partage s'écrivent avec `property=`.
Elles passaient à travers.

**Trois sabotages isolés sur la leçon d'al-Ikhlas, la page en position 11 :**

| sabotage | résultat |
|---|---|
| `og:description` divergente, longueur valide | **8 verts** — l'unique rouge était le `lastmod` |
| `og:description` qui **PROMET UN MÉRITE** | **8 verts** — l'unique rouge était le `lastmod` |
| `og:title` divergent du `<title>` | **8 verts** — l'unique rouge était le `lastmod` |

Le texte planté au deuxième essai était : « Celui qui la récite dix fois
obtient la récompense d'une lecture entière du Coran, et une protection pour
la nuit entière. » **Trois des locutions que le site s'interdit**, dans le
champ qu'affiche WhatsApp, sur la seule page dont le brief dit qu'elle prouve
que le format marche. Zéro contrôle.

Le brief appelle la règle religieuse « LA RÈGLE QUI COMPTE LE PLUS ICI ». Elle
ne lisait pas le champ par lequel le site se partage.

### Mon premier sabotage ne prouvait rien, et je l'ai refait

Le premier essai a remplacé le texte d'`og:description` par un
`str.replace()` — or `og:description` porte **le même texte** que la meta
description, donc les deux ont changé d'un coup. Trois contrôles sont passés
au rouge et j'ai failli conclure que le champ était tenu : ils parlaient de
la **meta**. Refait avec une substitution ciblée sur la seule balise visée,
un remplacement, vérifié — et là, 8 verts.

*La même forme d'erreur que la veille, à l'envers : un rouge obtenu pour une
autre cause est une aussi mauvaise preuve qu'un vert obtenu par masquage.*

### La règle, écrite à UN seul endroit

Le lecteur de la voix du site voit maintenant `og:title` et
`og:description`. **Trois règles s'appliquent d'un coup**, et sur les
63 pages, pas sur 53 : le mérite promis, le recueil de hadith nommé, la
parole attribuée.

Effet mesuré, et c'est la preuve que le lecteur les voit vraiment :

> morceaux de la voix du site : **4 089 le 14 novembre → 4 197 ce soir.**
> Soit **+108 = 54 × 2**, les deux champs des 54 pages qui en portent.

Et une deuxième règle, à côté de celle qui lie déjà le ld+json : **`og:description` doit être la meta description.** 54 confrontées, 54 d'accord.

### Les quatre sabotages contre les règles neuves

| sabotage | attendu | obtenu |
|---|---|---|
| `og:description` divergente, honnête | nommée | sortie 1, « ne disent pas la même chose » |
| `og:description` qui promet un mérite | nommée **plusieurs fois** | sortie 1, **4 lignes** : `récompense`, `protection`, `celui qui la récite`, + la divergence |
| **`og:title` divergent mais honnête** | **reste vert** | **sortie 0** |
| `og:title` qui promet un mérite | nommée | sortie 1, « `vertu`, dans `<og:title>` » |

### La règle que je n'ai PAS écrite, et le dépôt l'avait déjà apprise

Je n'ai **pas** exigé `og:title` == `<title>`. OpenGraph ne le demande pas, et
`controler-questions.py` porte depuis le 14 novembre la trace d'exactement
cette erreur, sur le champ voisin :

> « J'ai d'abord comparé le `name` du bloc au `<title>` de la page, et obtenu
> **39 « écarts »** […] Ce n'étaient pas des fautes : schema.org n'a jamais
> demandé que `name` recopie le titre […] **Le critère était de moi, pas de la
> norme.** »

Mesuré ce soir : `"name"` diffère du `<title>` sur **50 pages sur 53**, et
c'est normal — « Sourate Al-Ikhlas » contre « Sourate Al-Ikhlas :
traduction, texte arabe, 4 versets ». Le titre porte les mots de la requête,
le nom porte celui de la ressource.

Donc : `og:title` est **lu** par la règle éditoriale, et **libre** quant à sa
forme. C'est le troisième sabotage, celui qui doit rester vert.

### Ce que j'ai mesuré et laissé tel quel

- Les **38 leçons** font de 252 à 1 566 mots, et la longueur suit le nombre de
  versets de la sourate — pas un défaut, une conséquence. Chacune a les mêmes
  deux sections, chaque verset portant son arabe, sa « traduction du sens » et
  sa référence exacte : « Coran, sourate Al-Ikhlas (112), verset 1.
  Traduction : Muhammad Hamidullah. »
- **Aucune translittération** sur le site. Ce n'est pas un manque caché : c'est
  un état, et il est noté ici pour qu'on ne le redécouvre pas.
- Les **12 pages de section** hors sitemap portent aussi leurs `og:`, et elles
  concordent. La règle neuve les couvre, parce qu'elle lit les 63 pages et non
  les 53 adresses.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.

- **Levier 1** : les titres sont dans les règles (remesuré hier, les huit
  champs des quatre pages vues). Mettre les mots de la requête en tête demande
  les requêtes, et `docs/MESURES.md` n'a **toujours rien depuis le 21 août** —
  revérifié ce soir sur `origin/main`.
- **Levier 2** : inchangé, et le choix reste à Mohamed.
- **File de publication** : les fichiers touchés ce soir
  (`outils/controler-questions.py` et la documentation) **restent tous au
  dépôt**. 72 en ligne / 69 au dépôt, inchangé.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. Troisième nuit de suite que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 18 NOVEMBRE — « NE PAS JUGER LA FORME » AVAIT ÉTÉ LU COMME « NE PAS LIRE »

### D'abord, les deux leviers, mesurés avant d'écrire une ligne

**Levier 1, remesuré sur les 53 titres réellement servis** — serveur local, pas
le code source. Le tableau complet :

| famille | nombre | longueurs | forme |
|---|---|---|---|
| leçons de sourate | 38 | 51 à 59 | `Sourate X : traduction, texte arabe, N versets` |
| sections | 11 | **15 à 55** | `Nom : ce qu'elle couvre` |
| accueil, sections.html, sourates.html | 3 | 51 à 55 | descriptif |
| plus.html | 1 | 26 | `À propos — Islam pas à pas` |

Les 38 leçons mettent **les mots de la requête en tête**, exactement comme la
ronde le demande : le nom de la sourate est le premier mot du titre. Rien à
réécrire.

Deux sections tombent à **15 et 17 caractères** — `/section/le-comportement`
(« Le comportement ») et `/section/vocabulaire-arabe` (« Vocabulaire arabe ») —
là où leurs neuf sœurs utilisent 42 à 55. J'ai cru avoir trouvé le travail de
la nuit. **C'était déjà écrit, daté et décidé** dans
`outils/faire-sections-pages.py` :

> « Mesure du 13 octobre : ces onze titres visent tous une requête LARGE […] et
> ces onze pages ont zéro impression. […] Soigner ces titres est du travail
> propre qui ne rapportera rien ; le savoir évite de le refaire. »

Et le repli sur le nom seul est **voulu** : l'assemblage complet ferait 64 et
65 caractères, `controler-sections.py` compte déjà ces deux-là et s'arrête si
ce ne sont plus exactement elles, et raccourcir leur champ `quoi` est **une
décision de rédaction, pas de générateur** — on la signale, on ne la change
pas. J'ai donc lu avant de corriger, et il n'y avait rien à corriger.

**Levier 2** : `docs/MESURES.md` relu sur `origin/main` — **toujours aucun
relevé depuis le 21 août**, dernière modification du fichier le 17 octobre.
Sans requêtes, pas de chiffre par sourate, donc pas de critère pour la leçon
suivante. Quatrième nuit que je l'écris.

**Maillage** : `controler-liens.py` rend 53 pages du sitemap toutes atteintes
depuis l'accueil — 1 à 0 clic, 14 à 1 clic, 38 à 2 clics. Rien à réparer.

### La phrase qui a créé le trou

Le 17 novembre, j'avais écrit dans `controler-questions.py` que la comparaison
`name` ↔ `<title>` n'y serait pas :

> « schema.org n'a jamais demandé que `name` recopie le titre […] Le critère
> était de moi, pas de la norme. Il n'est donc pas ici. »

C'est juste. Mais la même nuit, sur le champ voisin, j'avais tiré la
distinction qui manquait ici :

> « `og:title` est donc **LU** par la règle éditoriale et **LIBRE** quant à sa
> forme. »

**Écarter un critère de forme n'est pas renoncer à lire le fond.** Le champ est
reparti sans qu'aucune règle de fond ne le lise — et le lecteur de la voix du
site ne pouvait pas le rattraper, parce que `MUETTES` écarte `script` avec ce
motif : « ce n'est pas de la prose lue par quelqu'un ». Vrai d'un script. Faux
d'un bloc `application/ld+json`, qui **n'existe que pour être lu**.

Troisième fois de suite que le trou a cette forme : un garde-fou posé sur un
chemin, et le texte qui passe par l'autre.

### La mesure, avant la règle

| | |
|---|---|
| blocs `ld+json` | **54** sur 63 pages |
| valeurs de texte dedans | **472**, dont 256 hors identifiants de machine |
| champs de prose | `name` (54 valeurs, **54 distinctes**), `description` (54), `teaches` (38) |
| les trois règles éditoriales sur ces 256 valeurs | **ZÉRO touche** |

La règle tenait. Par soin, pas par contrôle.

### Le sabotage qui le prouve

Dans le `name` du bloc de la leçon d'al-Ikhlas — **la page qui classe le mieux
du site, position 11** :

> « Celui qui recite Al-Ikhlas dix fois obtient la recompense d'une lecture
> entiere du Coran »

**HUIT CONTRÔLES VERTS.** Le seul rouge était le `lastmod` du sitemap, cause
**lue** dans la sortie, pas déduite. Une promesse de mérite déclarée à Google,
sur la page la mieux classée, invisible aux neuf contrôles.

La substitution a visé le seul champ voulu, à l'intérieur du seul bloc, avec
vérification qu'il y avait **exactement un** remplacement — la leçon du
17 novembre, où un `str.replace()` avait touché deux champs portant le même
texte et où les rouges obtenus parlaient de l'autre.

### Pourquoi une liste de ce qu'on écarte, et pas de ce qu'on lit

Nommer `name`, `description` et `teaches` serait **la faute du 17 novembre à
l'envers** : ce soir-là, le lecteur regardait `name="description"` et les
balises de partage s'écrivaient `property=`. Un champ ajouté demain par un
générateur serait muet le jour de son ajout.

On lit donc **toutes** les valeurs de texte du bloc sauf quatre, chacune
écartée pour une raison dite : `@context` et `@type` sont des identifiants de
schema.org, `url` est une adresse, `inLanguage` un code de langue. Aucune n'est
une phrase, et les trois premières sont déjà confrontées ailleurs à ce que la
page déclare. C'est la forme que ce dépôt emploie déjà — `MUETTES`, `CITANTES` :
une liste d'exclusions, et tout le reste est lu.

`description` est relue ici alors que la meta l'est déjà au-dessus. C'est
volontaire : le jour où l'égalité des trois copies serait assouplie, le texte
resterait lu.

### Quatre sabotages, dont deux qui doivent rester verts

| sabotage | attendu | obtenu |
|---|---|---|
| mérite dans `name` | rouge | **sortie 1**, « promet un mérite (« recompense ») dans son champ `name` » |
| recueil de hadith dans `teaches` | rouge | **sortie 1**, et **trois** lignes : « boukhari », « rapporte par », « hadith » |
| `name` honnête, différent du `<title>` | **vert** | **sortie 0** — la forme reste libre |
| mérite **entre guillemets** dans `name` | **vert** | **sortie 0** — un sens cité reste cité |

Les deux derniers comptent autant que les deux premiers. Le troisième empêche
de réécrire le critère que ce dépôt a déjà retiré une fois — 39 faux écarts le
17 novembre. Le quatrième prouve que `voix_du_site` s'applique **ici aussi** :
la règle lit ce que le site affirme, pas ce qu'il rapporte.

### Preuve mesurée que le contrôle voit bien le champ

`256 valeur(s) de texte des blocs ld+json passees aux trois regles
editoriales, 0 touche(s)` — le chiffre du contrôle est exactement celui de la
sonde écrite avant la règle. Un contrôle qui rend zéro sans avoir pu rendre
autre chose ne mesure rien ; celui-ci a rendu autre chose quatre fois.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée,
**et aucun des deux titres courts corrigé** — la mesure du 13 octobre dit que
ce serait du travail propre sans effet, et le champ à raccourcir appartient au
cahier V2.

- **Levier 1** : les 53 titres sont dans les règles, les 38 leçons portent déjà
  les mots de la requête en tête. La suite demande les requêtes.
- **Levier 2** : inchangé, le choix reste à Mohamed — juz 29 ou les neuf
  sourates courtes.
- **File de publication** : le seul fichier de code touché ce soir
  (`outils/controler-questions.py`) et la documentation **restent tous au
  dépôt** — `.vercelignore` écarte `outils/` et `*.md`. 72 en ligne / 69 au
  dépôt, **inchangé**.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. Quatrième nuit de suite que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 19 NOVEMBRE — LA RÈGLE QUI COMPTE LE PLUS EXISTAIT EN DEUX EXEMPLAIRES QUI AVAIENT DIVERGÉ

### D'abord les deux leviers, et ils n'ont pas bougé

`docs/MESURES.md` relu sur `origin/main` : dernière modification **17 octobre**,
relevé islampasapas toujours celui du 21 août — 12 impressions, 4 jours de
données. **Cinquième nuit sans requêtes.** `main` n'a pas bougé non plus
(`f1623ba`).

### Ce que la mesure a trouvé, dans l'ordre

Je cherchais la surface suivante que les règles éditoriales ne lisaient pas.
J'en ai trouvé une — et, en route, **deux défauts dans la règle elle-même**.

#### 1. Les deux listes avaient dérivé, dans les deux sens

Le 14 novembre, `MERITES` est passé au niveau module de
`controler-questions.py`, avec ce motif écrit noir sur blanc :

> « les pages s'en servent aussi, et **deux copies d'une règle dérivent
> toujours.** »

La phrase était juste. Elle parlait de **deux** surfaces — les banques et les
pages. Il y en avait **trois** : `controler-sitemap.py` portait depuis le
13 octobre sa propre copie, pour les titres et descriptions servis. Mesure :

| | |
|---|---|
| dans `controler-questions` seul | `efface les peches` |
| dans `controler-sitemap` seul | `celle qui la recite`, `quiconque la recite` |
| communs | **14** |

Conséquence, **prouvée par deux sabotages, un dans chaque sens** :

- un `<title>` disant « Sourate Al-Ikhlas efface les peches » → avec la liste
  fondue, `controler-sitemap` **sortie 1**. Avec l'ancienne, le mot n'y était
  pas : il passait.
- un `<h1>` disant « Quiconque la recite sera comble. » → `controler-questions`
  **sortie 1**. Avec l'ancienne, le mot n'y était pas : il passait.

#### 2. « vertu » cherché comme sous-chaîne touche « COUVERTURE »

Les listes étaient partagées, **l'appariement ne l'était pas** : six
`if mot in plat` recopiés dans deux fichiers. Or une sous-chaîne ne sait pas où
commence un mot. Mesure sur **tout** le texte du site :

| mot | touches | dont |
|---|---|---|
| `vertu` | **40** | **35 dans « couverture » / « couvertures »** |
| `recompense` | 40 | 34 le mot lui-même, puis `recompensee`, `recompenses`, `recompensera` |
| `bienfait` | 47 | 43 le mot lui-même, puis `bienfaits`, `bienfaiteurs` |
| `protege` | 8 | `protegent`, `proteger`, `protege-nous`, `protege-les` |

`vertu` est **le mot le plus souvent touché de toute la règle, et c'est un
faux.** Il n'avait rougi nulle part **par chance** : « couverture »
n'apparaissait dans aucune surface déjà lue. Il apparaît **quatre fois** dans
`js/section.js` — dont deux dans un sélecteur CSS — c'est-à-dire précisément
dans le fichier que j'allais faire lire.

**Un faux rouge est pire qu'un trou : il apprend à ne plus lire les rouges.**

#### 3. Le site parle en JavaScript, et personne ne le lisait

Les règles lisaient les banques, la prose des 63 pages, `og:title`,
`og:description` et les blocs `ld+json`. **Pas une ligne des 18 fichiers de
`js/`** — et `MUETTES` écarte `script`, donc même le texte qu'un script
*insère* dans la page leur échappait.

Or `js/` **part en ligne** : `.vercelignore` n'écarte que `*.md` et `outils/`
(vérifié ce soir), et 4 fichiers `js/` sont déjà dans la file de publication.
Mesure : **435 phrases françaises** dans les littéraux, dont « Le réseau n'a
pas répondu : l'image de couverture et ton score… ». C'est le site qui parle,
en son nom, à quelqu'un en train d'apprendre.

### La frontière retenue, et ce qu'elle perd

**Début de mot, suffixes admis.** Pas de frontière à droite : c'est ce qui
garde `vertus`, `vertueux`, `recompensera`, `protegent`, `benedictions`,
`meritent` — tous mesurés présents — tout en refusant `couverture`. Une
frontière des deux côtés aurait perdu les six.

**Ce qu'elle perd est écrit :** `ahadith` ne touche plus `hadith`, le mot
commençant ailleurs. Mesure : `ahadith` n'apparaît nulle part sur le site
aujourd'hui. Il est donc **inscrit tel quel** dans `ATTRIBUTIONS` — 8 mots
deviennent 9 — plutôt que laissé à une sous-chaîne qui le rattrapait par
accident. *Ce qu'une règle attrape par accident, elle le lâche sans prévenir.*

### Un seul endroit : `outils/regles-editoriales.py`

Les trois listes **et** l'appariement **et** la boucle des trois familles. Les
deux contrôles le chargent par `importlib`, comme `controler-questions.py`
charge déjà `faire-questions-claude.py` depuis octobre, et pour la même raison
écrite au même endroit. `MERITES` y est **l'union exacte** des deux listes :
17 mots, aucun inventé, aucun retiré.

Mesure avant adoption : sur les **5 754 morceaux** de surface que les contrôles
lisent, l'union ne fait rougir **rien de plus** que chacune des deux listes
seules.

### Lire tous les littéraux, pas ce qu'on prend pour de la prose

Le premier jet triait les chaînes « qui ressemblent à du français ». C'était un
critère de moi, et un critère de moi devient aveugle sans prévenir — la leçon
du 18 novembre sur la liste des champs `ld+json`. Mesure : **1 661 littéraux
non vides, 1 661 relus, zéro touche.** Le tri ne servait qu'à pouvoir se
tromper.

### Sept sabotages, dont un qui doit rester vert

| sabotage | attendu | obtenu |
|---|---|---|
| mérite dans une chaîne de `js/section.js` | rouge | **sortie 1**, « promet un mérite (« recompense ») dans une chaîne de caractères » |
| recueil de hadith dans `js/section.js` | rouge | **sortie 1**, « boukhari » |
| **« couverture » et « couvertures » dans `js/`** | **vert** | **sortie 0** |
| « Les **vertus** de cette sourate » dans `ld+json name` | rouge | **sortie 1** |
| « Dieu te **recompensera** » dans la prose visible | rouge | **sortie 1** |
| `efface les peches` dans un `<title>` | rouge | **sortie 1** (sitemap) |
| `quiconque la recite` dans un `<h1>` | rouge | **sortie 1** (questions) |

Les deux sabotages à **suffixe** — « vertus », « recompensera » — sont la
preuve que la frontière garde les pluriels et les conjugaisons. Le troisième
est celui qui doit rester vert, et c'est le même mot qui faisait quatre faux
rouges une heure plus tôt.

### Ce que j'ai mesuré et laissé tel quel

`controler-sitemap.py` porte une **troisième** liste de noms de recueils,
`SOURCES_HADITH`. Je ne l'ai **pas** fondue : c'est une règle **différente**,
et sa note le dit — elle ne juge pas la voix du site, elle interdit à une page
d'**annoncer** des hadiths quand les banques n'en citent aucun, « la règle se
lie aux banques, pas à un mot ». Elle contient d'ailleurs `rapporteur` et
`sahih` nu, qui ne sont pas dans `RECUEILS`.

Vérifié quand même ce soir, puisque c'est la même famille de piège : **zéro
touche**, aucun faux positif latent. Sa propre note rappelle qu'elle en a déjà
eu un — `recueil` touchait « ceux qui recueillent avec douceur », un verset du
Coran — et qu'il a été corrigé en `recueil de`. **Vérifié, laissé tel quel.**

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.

- **Levier 1** : les 53 titres servis sont dans les règles (relus hier, 15 à
  59 caractères, les 38 leçons avec les mots de la requête en tête).
- **Levier 2** : inchangé, le choix reste à Mohamed — juz 29 ou les neuf
  sourates courtes.
- **File de publication** : les fichiers touchés ce soir sont tous sous
  `outils/` ou en `.md`, donc **tous au dépôt**. Remesuré : **142 fichiers
  modifiés, 72 en ligne, 70 au dépôt.** Le **72 est inchangé** — rien de ce
  qui part en ligne n'a bougé — mais le 69 devient **70**, parce que
  `outils/regles-editoriales.py` est un fichier **neuf**. J'avais d'abord
  écrit « 69, inchangé » ici : c'était faux, et c'est `git diff` qui l'a dit,
  pas moi. **Un fichier ajouté compte, même quand il ne part pas en ligne.**

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. Cinquième nuit de suite que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 20 NOVEMBRE — LE SITE PARLE À QUI NE LE VOIT PAS, ET PERSONNE NE RELISAIT CE QU'IL DIT

### Les deux leviers, remesurés d'abord

`docs/MESURES.md` relu sur `origin/main` : dernière modification le
**17 octobre**, relevé islampasapas toujours celui du **21 août**. **Sixième
nuit sans requêtes.** Le protocole du carnet dit « une fois par mois, le
premier du mois » : il manque septembre, octobre et novembre. `main` n'a pas
bougé non plus (`f1623ba`).

**Levier 1, vérifié sur le site servi en local, pas dans le code source** —
les quatre pages que Google voit :

| page servie | titre | car. |
|---|---|---|
| `/` | Islam pas à pas — apprendre l'islam par des QCM sourcés | 55 |
| `/lecon-sourate-al-ikhlas.html` | Sourate Al-Ikhlas : traduction, texte arabe, 4 versets | 54 |
| `/sourates.html` | Les 114 sourates du Coran : noms et nombre de versets | 53 |
| `/lecon-sourate-al-falaq.html` | Sourate Al-Falaq : traduction, texte arabe, 5 versets | 53 |

Les quatre sont sous 60 caractères et portent leurs mots en tête. **Rien à
corriger**, et sans table Requêtes il n'y a aucun mot exact à y mettre.

### Levier 2 : CE N'EST PAS LA DONNÉE QUI MANQUE, MOHAMED — C'EST TA DÉCISION

J'ai relu `outils/faire-lecon-sourate.py` avant de rien proposer, et il faut
que ce soit dit clairement parce que la liste des choses en attente le disait
mal :

- le **texte arabe des 114 sourates** est au dépôt
  (`outils/coran/ara-quransimple.json`), et il est confronté à chaque
  exécution aux sept versets d'Al-Fatiha **relus à la main** avant tout
  script — si le témoin tombe, rien ne s'écrit ;
- la **traduction de Muhammad Hamidullah** est au dépôt aussi, verset par
  verset, citée à son nom ;
- pour les onze sourates du **juz 29**, le texte et la traduction sont
  présents **sans un seul trou**.

**Techniquement, rien ne manque.** Ce qui manque est une décision d'éditeur,
et le fichier l'écrit lui-même : « *Ouvrir un juz, sur un site qui enseigne le
Coran, est une décision d'éditeur, et l'éditeur est Mohamed. […] Tant qu'il
n'a pas tranché, LOT ne bouge pas.* » Je ne l'ai pas touché.

**Et je corrige mes propres comptes rendus**, qui listaient « un jeu de
données du juz, sourcé » parmi les choses en attente de toi. C'était inexact :
les données sont au dépôt depuis le début, vérifiées contre un témoin relu à
la main. Il ne reste qu'**une** chose en attente sur ce levier, et c'est ta
décision — pas un fichier à trouver.

### Ce que j'ai trouvé en cherchant la surface suivante

Les trois règles éditoriales lisent les banques, la prose des 63 pages,
`og:title`, `og:description`, les blocs `ld+json` et, depuis hier, les
littéraux de `js/`. **Toutes ces surfaces ont une chose en commun : un être
humain peut les voir.** Un titre s'affiche dans Google, un `og:` dans une
conversation, un `ld+json` dans un résultat enrichi, une chaîne de `js/` sur
l'écran. Une faute y est rattrapable à l'œil.

Restait celle qui ne s'affiche **nulle part** : ce que la page dit à qui
l'**écoute**.

    aria-label sur les 63 pages        117, pour 10 valeurs distinctes
    <title> / <desc> de svg              0 aujourd'hui
    alt, title, placeholder              0 aujourd'hui

Un `aria-label` qui promettrait un mérite serait **dit** à quelqu'un qui
apprend et n'apparaîtrait sur **aucun écran**. Aucune relecture à l'œil ne
peut l'attraper — par construction.

### UN NOM QUI EXISTE N'EST PAS UN NOM QU'ON A LU

`aria-label` était déjà touché par un contrôle : `controler-lecture-ecran.mjs`,
point 4, « aucun lien ni bouton sans nom accessible ». Il demande si le nom
**existe**. Il ne lit pas ce que le nom **dit**.

C'est mot pour mot la distinction du 18 novembre — « ne pas juger la forme
d'un champ n'est pas ne pas lire ce qu'il dit » — tombée une case plus loin.
Et c'est la **deuxième fois** que `MUETTES` est en cause pour le même motif
trop largement appliqué : « *ce n'est pas de la prose lue par quelqu'un* » est
vrai du dessin d'un `svg`, **faux de son `<title>`**, exactement comme c'était
vrai d'un `script` et faux d'un `application/ld+json`. Le dessin reste muet ;
son titre en sort nommément.

### La liste de ce qu'on écarte a été bâtie par INVENTAIRE, pas de mémoire

Une liste de ce qu'on lit serait aveugle le jour où un générateur ajoute un
`aria-description` — la faute du 17 novembre, où le lecteur regardait `name=`
et les balises de partage s'écrivaient `property=`. J'ai donc listé les
**49 noms d'attributs réellement présents** sur le site, un exemple de valeur
sous les yeux pour chacun, et écarté les machines : adresses, identifiants,
géométrie des svg, codes de langue, états d'ARIA, bornes de curseur, `data-*`.

Cette liste **ne protège pas la règle** : un `d="M12 1.6l2.7…"` ne peut porter
aucun des 39 mots. Elle sert à ce que le **chiffre veuille dire quelque
chose** — relire les 463 chemins de svg donnerait un total de 17 135 qui ne
mesurerait plus rien.

**744 valeurs d'attribut relues, dont 117 que personne ne peut voir. Zéro
touche.**

### La moitié faible, et elle est écrite comme telle

`data/` contient quatre fichiers **hors des banques**, et `.vercelignore`
n'écarte que `*.md` et `outils/` : ils partent en ligne. Personne ne les
relisait. Mesure : 2 935 valeurs de texte, dont **2 616 identifiants** de
questions et **228 noms de sourates** ; restent 91, et la plupart sont déjà
lues ailleurs (le `nom` et le `quoi` des 12 sections repartent dans les titres
et les pages de section, les 35 libellés de thème viennent du champ `theme`
des banques).

Ce qui n'est lu nulle part ailleurs est petit et se nomme : **`images.json`**,
qui ne contient **aucune photo** à ce jour — seulement la description de la
forme d'une entrée, dont le champ `alt`. Le jour où une entrée sera complète,
ce `alt` s'écrira dans une page, et ce sera encore un texte dit à qui ne voit
pas l'image.

**293 valeurs relues, zéro touche.** Ce que ça apporte n'est pas une faute
trouvée : c'est qu'après ce soir, **plus aucun fichier qui part en ligne
n'échappe aux trois règles**.

### Sept sabotages, dont deux qui doivent rester verts

    promesse de mérite dans un aria-label        sortie 1
    « rapporté par Boukhari » dans un aria-label sortie 1
    promesse dans un <title> de svg              sortie 1  (la carve-out)
    promesse dans le « quoi » d'une section      sortie 1
    promesse dans le « alt » de images.json      sortie 1
    « couverture » et « couvertures » en aria    SORTIE 0 — DOIT RESTER VERT
    « les-merites-… » dans un href               SORTIE 0 — DOIT RESTER VERT

Le sixième est le mot qui faisait quatre faux rouges avant-hier : la surface
neuve hérite bien de la frontière de mot du 19 novembre au lieu de rouvrir le
piège. Le septième dit la limite assumée : **une adresse n'est pas une
phrase** — et la prose de la page, elle, est lue.

**Et le cinquième ne s'est pas posé du premier coup** : j'avais écrit le
chemin `_lisezmoi.alt` alors que le champ est sous `_lisezmoi.forme.alt`. Le
script a dit « sabotage raté » et s'est arrêté au lieu de laisser croire à un
vert. Chemin corrigé, sabotage reposé, sortie 1.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.

- **Levier 1** : les quatre titres servis sont dans les règles, mesurés ce
  soir sur le site servi.
- **Levier 2** : `LOT` ne bouge pas — c'est la décision de Mohamed, et la
  donnée est prête quand il tranchera.
- **File de publication** : le seul fichier de code touché ce soir est sous
  `outils/`. Remesuré : **142 modifiés, 72 en ligne, 70 au dépôt** — les
  **deux** chiffres inchangés, aucun fichier ajouté cette nuit.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Sixième nuit de suite** que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 21 NOVEMBRE — ON VÉRIFIAIT LA COPIE SUR LE BROUILLON

### Les deux leviers, remesurés d'abord

`docs/MESURES.md` relu sur `origin/main` : dernière modification le
**17 octobre**, relevé toujours celui du **21 août**. **Septième nuit sans
requêtes**, et il manque septembre, octobre et novembre au protocole mensuel.
`main` n'a pas bougé (`f1623ba`).

Levier 1 : les quatre titres servis sont ceux mesurés hier, inchangés et dans
les règles. Levier 2 : `LOT` ne bouge pas, c'est ta décision.

### Ce que j'ai cherché, et ce que j'ai trouvé à la place

Je suis allé voir si les trois recueils de hadiths du dépôt pouvaient enfin
servir — 20 426 hadiths en français qui y dorment. **Non, et c'était déjà
mesuré** : `DEPLOIEMENT.md` l'a écrit le 21 octobre. Aucun champ ne nomme un
traducteur, et leurs titres de chapitres sont mot pour mot ceux du fichier
anglais : c'est une traduction de traduction. **Rien à refaire, rien à
corriger.** La règle du site tient : une source qu'on ne peut pas citer
exactement ne se cite pas.

Mais en relisant `outils/coran/`, j'ai vu autre chose.

### `controler-lecons.py` ne faisait confiance à personne — sauf à ses sources

Ce contrôle est le plus sérieux du dépôt sur le texte coranique : il ouvre les
38 pages publiées et compare **571 versets** caractère pour caractère au jeu de
données, la traduction mot pour mot, les numéros, les comptes.

**Mais il ne vérifiait jamais le jeu de données lui-même.** Le seul témoin non
circulaire était Al-Fatiha : **sept versets relus à la main. Sept sur 571.**

Deux fautes graves pouvaient donc passer sans qu'aucun contrôle bronche, et
**aucune des deux ne se voit à l'œil** :

1. **Un sens sous le mauvais verset.** Une leçon apparie l'arabe et la
   traduction par la clef (sourate, verset). Si l'un des deux fichiers
   numérotait une sourate autrement que l'autre, la page afficherait le sens
   d'un verset sous le texte d'un autre — et **les deux moitiés seraient
   « conformes » à leur propre fichier**. C'est exactement ce que ce site
   s'interdit : attribuer un sens à la mauvaise parole. Et ce n'est pas
   théorique : il suffit de remplacer une traduction.
2. **La basmala.** Le générateur la retire du verset 1 de toutes les sourates
   sauf la première. S'y tromper donne un « verset 1 » **faux sur 112
   sourates**. Cette décision reposait sur un **raisonnement écrit dans un
   commentaire**.

### UN SECOND TÉMOIN DORMAIT DANS LE DÉPÔT

`outils/coran/morphologie.txt` — 6,3 Mo — vient d'une autre provenance et
porte une référence `sourate:verset:mot:segment` sur chacune de ses lignes.
Il servait au lexique depuis des mois. **Personne ne s'en était servi comme
témoin.**

Ce qu'il dit, mesuré ce soir :

| | sourates | versets |
|---|---|---|
| `ara-quransimple.json` | 114 | 6 236 |
| `fra-muhammadhamidul.json` | 114 | 6 236 |
| `morphologie.txt` | 114 | 6 236 |

**Les trois portent exactement les mêmes versets.** Aucune clef en double,
aucun trou, chaque sourate numérotée de 1 à n. Et sur la basmala :

- le verset 1 commence par elle dans **113 sourates sur 114** — la seule
  exception est la **sourate 9**, exactement ce que le dépôt affirme ;
- le témoin compte le verset 1 comme le texte publié pour **exactement deux
  sourates : la 1 et la 9** — la première parce que la basmala **est** son
  verset 1, la neuvième parce qu'elle n'en a pas.

**La décision la plus délicate de la chaîne cesse d'être un raisonnement : elle
est mesurée, par une source qui ne descend pas de l'autre.**

### Ce que j'ai mesuré puis ÉCARTÉ, pour que personne ne le retente

Le **compte de mots par verset**. C'était le critère évident, et il est faux :

    brut                          2 946 versets sur 6 236 en désaccord
    marques de pause filtrées       465 encore

La cause est **mesurée, pas supposée** : la morphologie écrit le vocatif en
**un** mot (`يَٰٓأَيُّهَا`) là où le texte publié en écrit deux (`يَا` `أَيُّهَا`).
C'est aussi ce qui explique les onze sourates où l'écart du verset 1 vaut 5 et
non 4. **Ce témoin vaut pour la structure, pas pour l'orthographe** — le dépôt
avait déjà mesuré que les deux textes ne notent pas l'alef de la même façon.

### CE QUI RESTE NON VÉRIFIÉ, ET LE RESTERA

**Que ces comptes soient les BONS.** Deux fichiers qui s'accordent valent mieux
qu'un seul ; ce n'est pas la même chose qu'une vérification contre le monde.
La seule ancre hors du dépôt reste Al-Fatiha, sept versets relus à la main.
Le contrôle **l'imprime à chaque exécution** au lieu de laisser croire que
tout est vérifié. Vérifié / écarté / **non vérifié** : le troisième est une
information, pas un échec.

### Sept sabotages dans les SOURCES, dont un qui doit rester vert

    un verset retiré de la traduction            sortie 1
    la sourate 112 décalée de +1                 sortie 1
    un trou dans la numérotation de l'arabe      sortie 1
    un verset effacé du témoin morphologique     sortie 1
    une basmala collée à la sourate 9            sortie 1
    la basmala retirée de la sourate 78          sortie 1
    une marque de pause ajoutée (sourate 50)     SORTIE 0 — DOIT RESTER VERT

**Le dernier a d'abord échoué, et pour une raison qui mérite d'être écrite.**
Je l'avais posé sur la sourate 78 : rouge. Ce n'était pas la règle de ce soir
qui criait, c'était la comparaison caractère pour caractère entre la page
publiée et le jeu de données — un **vrai** rouge, qui ne disait rien de la
nouvelle règle. Reposé sur la sourate **50**, qui n'a pas de leçon : vert.
Au passage, ça dit une bonne propriété du dépôt : **le texte des 38 sourates
publiées est épinglé deux fois.**

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit, aucune question touchée.
Rien de ce qui part en ligne n'a changé : le seul fichier de code touché est
sous `outils/`. Remesuré : **142 modifiés, 72 en ligne, 70 au dépôt** — les
deux chiffres inchangés.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Septième nuit de suite** que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 22 NOVEMBRE — CINQUANTE ET UNE CARTES MONTRAIENT UN SENS SANS L'ATTRIBUER

### Les deux leviers, remesurés d'abord

`docs/MESURES.md` relu sur `origin/main` : dernière modification le
**17 octobre**, relevé toujours celui du **21 août**. **Huitième nuit sans
requêtes.** `main` n'a pas bougé (`f1623ba`). Levier 1 : titres inchangés et
dans les règles. Levier 2 : `LOT` ne bouge pas, c'est ta décision.

### Ce soir, UN FICHIER QUI PART EN LIGNE A CHANGÉ

C'est la première fois depuis des semaines, et c'est une correction de fond.

La règle de la ronde dit : « **un sens ou un commentaire s'ATTRIBUE** — il ne
s'affirme jamais au nom du site. » Les leçons la tiennent, verset par verset,
et un contrôle le vérifie depuis le début. **Les cartes, non : rien ne
l'exigeait d'elles.**

Mesure du 22 novembre sur les 2 616 cartes :

| | cartes |
|---|---|
| nomment le traducteur | 2 340 |
| **affichent une traduction SANS le nommer** | **51** |

Les 51 disaient, par exemple : « C'est le verset 15 de la sourate An-Naba.
**Sa traduction** : « pour faire pousser par elle grains… » » — et pour seule
source, « Coran, sourate 78, verset 15. » **Le sens paraissait donc être celui
du site.**

### D'où ça venait : un oubli de recopie, mesurable

Les 51 venaient de **la même forme du même générateur**.
`faire-01-sourates.py` fabrique trois formes de carte ; sa **forme A** écrit
`source='Coran, sourate %d, verset %d. Traduction du sens : Muhammad
Hamidullah.'`, et sa **forme B**, vingt lignes plus bas dans le même fichier,
écrit `source='Coran, sourate %d, verset %d.'` — alors que son explication
affiche la traduction. Pas une décision : une ligne recopiée à moitié.

### Ce qui a été vérifié AVANT d'écrire un seul nom

**Les 51 traductions ont été confrontées une à une à
`fra-muhammadhamidul.json`** pour le verset que chaque carte référence :
**51 conformes mot pour mot, 0 divergente.** Le script refusait d'écrire si une
seule ne correspondait pas. Ajouter une attribution à un texte qu'on n'a pas
confronté serait exactement la faute qu'on prétend corriger.

Le nom qui manquait est donc **le bon, et il est vérifié** — pas supposé.

**Correction d'un chiffre que j'ai annoncé trop tôt** : ma première sonde
disait **49**. Elle exigeait une citation de 25 caractères au moins, seuil
arbitraire de ma part. Le critère juste — « la source ne nomme personne et
l'explication cite la traduction » — en trouve **51**. C'est 51.

### Le nom du traducteur existait en six copies

C'est la chaîne la plus engageante du site : **728 fois sur 40 pages**, et
maintenant 2 391 cartes. Elle était écrite **à la main dans six fichiers** —
quatre générateurs, une constante, et `controler-lecons.py`, **qui retapait la
valeur attendue au lieu de la lire**.

Ce dernier point est le plus parlant : ce même fichier lit `SEUIL_INDEX` chez
le générateur, en expliquant que « deux fois le même nombre dans deux
fichiers, c'est deux nombres ». **Le principe était appliqué au seuil d'un
index et pas au nom d'un traducteur.** Il vit maintenant dans
`outils/regles-editoriales.py`, à côté des trois familles de mots.

### Le critère du contrôle n'est pas une tournure, c'est le texte

On ne cherche pas le mot « traduction » : une tournure se contourne sans le
vouloir. Le contrôle regarde si **une citation entre guillemets de la carte se
retrouve dans la traduction du verset que la carte elle-même référence**. Si
oui, elle montre ce sens, et elle doit le nommer. **Aucun seuil de longueur**
— si la citation est dans ce verset-là, c'est ce verset-là qu'elle cite.

Mesure : **1 769 cartes affichent la traduction du verset qu'elles citent, les
2 391 qui nomment un traducteur nomment le seul que le site déclare.**

### Et ce que ces sources ne disent pas : `outils/coran/LISEZMOI.md`

En cherchant sur quoi l'attribution repose, j'ai trouvé qu'elle ne repose sur
**rien d'interne** : `fra-muhammadhamidul.json` ne contient **aucune
métadonnée** — ni traducteur, ni édition, ni source, ni licence. Rien que
`chapter`, `verse`, `text`. **Le seul élément qui porte le nom de Hamidullah
est le nom du fichier.** Aucun des fichiers de `outils/coran/` ne dit d'où il
vient ; ils sont entrés au dépôt le 14 août dans un commit qui parle d'autre
chose.

J'ai donc écrit `outils/coran/LISEZMOI.md` : ce qui est **vérifié** (la
structure, la basmala, les sept versets relus, les pages conformes), ce qui est
**écarté** et pourquoi (les 20 426 hadiths sans traducteur nommé ; le compte de
mots par verset), et ce qui est **non vérifié** — dont la provenance.

**Ce que tu peux faire et que je ne peux pas** : écrire d'où viennent ces
fichiers, quelle édition, quelle licence. Une ligne par fichier. **Je ne
l'invente pas** — une source qu'on ne peut pas citer exactement ne se cite
pas, et ça vaut aussi pour la source d'une source.

### Six sabotages, dont un qui doit rester vert

    l'attribution retirée d'une carte            sortie 1
    le nom mal orthographié sur une carte        sortie 1
    la constante changée → controler-questions   sortie 1
    la constante changée → controler-lecons      sortie 1
    un verset de leçon sans traducteur           sortie 1
    une citation ÉTRANGÈRE au verset, sans nom   SORTIE 0 — DOIT RESTER VERT

Le quatrième et le troisième comptent ensemble : changer **la seule
déclaration** fait rougir **les deux** contrôles. C'est la preuve qu'elle est
bien la seule source du nom. Le dernier prouve que la règle ne crie pas au
loup : une carte qui cite du français qui n'est pas la traduction de son
verset n'a rien à attribuer.

**Et une erreur de méthode de ma part, qui mérite d'être écrite.** Mon script
de sabotage restaurait les fichiers avec `git checkout --`, alors que mon
propre travail de la soirée n'était pas encore en réserve : il a **effacé
l'ajout de la constante** dans `regles-editoriales.py`. Trois verdicts de la
première série étaient donc faux — rouges pour une raison qui n'était pas
celle testée. Constante réécrite, **tout mis en réserve d'abord**, série
relancée : six sur six conformes. Un sabotage qui détruit ce qu'il teste ne
teste rien.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre réécrit. Remesuré : **143
modifiés, 72 en ligne, 71 au dépôt** — le 72 est **inchangé** mais son contenu
a changé (les 51 cartes), et le 70 devient **71** à cause du fichier neuf.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne** — les 51 cartes sont corrigées au dépôt et **encore fausses
en ligne** jusqu'à ce que tu promeuves.

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Huitième nuit de suite** que
l'ordre est respecté : la mesure, puis le chiffre. Et c'est la première de ces
huit nuits où un fichier qui part en ligne a changé : les 51 cartes ont donc
traversé les 39 contrôles, pas seulement le mien.

---

## LE 23 NOVEMBRE — LA QUATRIÈME RÈGLE DE LA RONDE N'AVAIT AUCUN INSTRUMENT

### Les deux leviers, remesurés d'abord

`docs/MESURES.md` relu sur `origin/main` : dernière modification le
**17 octobre**, relevé toujours celui du **21 août**. **Neuvième nuit sans
requêtes.** `main` n'a pas bougé (`f1623ba`). Levier 1 : titres inchangés.
Levier 2 : `LOT` ne bouge pas, c'est ta décision.

### La règle qui compte le plus a quatre points. Trois avaient un contrôle

    · texte coranique vérifié, jamais de mémoire     → controler-lecons.py
    · un sens s'ATTRIBUE                             → fait hier soir
    · une source non citable ne se cite pas          → les trois familles
    · JAMAIS DE FATWA PERSONNELLE                    → rien

Le quatrième est celui dont les conséquences sont les plus lourdes, et c'est
le seul que rien ne mesurait. Une carte qui dit « il faut faire X » ou « X est
interdit » **en son nom** tranche un cas — au nom de Mohamed. Une carte qui
dit « le Coran l'énonce en sourate 2, verset 173 : « … » » explique un
principe et le source.

### Ce que j'ai mesuré AVANT d'écrire la moindre liste

Sur les **20 808 champs** des cartes, voix du site seulement (le texte entre
guillemets reste du texte cité, comme pour les trois autres familles) :
**dix touches.** Toutes examinées une par une :

| ce qui est ressorti | combien | ce que c'était |
|---|---|---|
| « est interdit » | 6 | le **surtitre** « Ce qui est interdit », et les 6 cartes citent le verset qui l'énonce, référence exacte et traduction attribuée |
| « est nulle » | 4 | **FAUX** — « Votre compagnon n'est nullement fou », de Hamidullah |

Sur les **4 028 morceaux** de la voix du site des 63 pages : **quinze
touches** — treize fois « on peut », toutes dans « Tout ce qu'on peut
travailler sur le site » (du français ordinaire sur l'usage du site), et deux
fois le libellé de thème « Ce qui est interdit ».

**La règle était donc tenue — par soin, pas par contrôle.** Et deux des mots
que j'allais écrire étaient des faux : `est nulle` attrape « nullement »
exactement comme `vertu` attrapait « couverture » le 19 novembre, et
`on peut` / `tu peux` attrapent du français ordinaire. **Écartés, avec la
mesure écrite à côté.**

### La règle est CONDITIONNELLE, et c'est tout le point

Les trois premières familles sont des interdits **absolus** : aucune surface
de ce site ne doit promettre un mérite, nommer un recueil, attribuer une
parole. La quatrième ne peut pas l'être — **le site peut rapporter un
interdit, à condition de montrer qui l'énonce et où.**

C'est pourquoi `TRANCHANTES` **n'est pas dans `FAMILLES`** : y mettre ces mots
les ferait rougir partout, y compris là où ils sont légitimes. La règle
écrite est donc :

> **Si la voix du site tranche, la carte doit montrer le verset qui tranche** —
> référence exacte, et une citation qui est bien celle de ce verset-là.

Le second critère réutilise l'instrument d'hier soir : on ne cherche pas un
mot, on vérifie que la citation se retrouve dans la traduction du verset que
la carte elle-même référence.

**Mesure : 6 cartes emploient une tournure qui tranche (36 cherchées), 0 sans
montrer le verset.**

### Ce que la règle NE couvre pas, et c'est écrit

**La prose des pages.** Les deux seules occurrences y sont des libellés de
thème dont le verset vit dans la carte ; les faire rougir serait un faux
rouge. Une phrase normative ajoutée demain dans la prose d'une page **ne
serait pas attrapée**. Vérifié sur les cartes, **non vérifié sur les pages**,
et mesuré propre aujourd'hui.

### Les sabotages, et deux que j'avais mal conçus

    « il faut faire les ablutions », sans verset      sortie 1
    « Fumer est interdit », sans verset               sortie 1
    « est nulle » REMIS dans la liste                 sortie 1

Le troisième est le plus utile : il prouve que **l'exclusion était
nécessaire** et pas cosmétique. Avec `est nulle` dans la liste, une carte qui
porte la traduction de Hamidullah « n'est nullement fou » **rougit à tort**,
sur du contenu réel et publié. Retiré : vert.

**Et les deux cas « doivent rester verts » étaient mal conçus.** Je les avais
plantés dans une carte de la section *pratique* — or ces cartes sont déclarées
une par une dans une table de `faire-pratique.py`, et en réécrire une fait
rougir ce contrôle-là, pour une raison qui n'a rien à voir avec la règle de ce
soir. **Le cas vert n'avait pas besoin d'un sabotage : il est déjà dans le
dépôt.** Six cartes emploient une tournure qui tranche et montrent leur
verset ; quatre portent « n'est nullement fou ». La suite est verte avec elles
dedans. Du contenu réel vaut mieux qu'un sabotage.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre, **et aucune correction de
contenu : il n'y en avait pas à faire.** Les 10 touches mesurées sont 6
libellés correctement sourcés et 4 faux positifs de ma propre sonde. Un cycle
qui ne trouve rien à corriger et le dit est un cycle honnête.

Rien de ce qui part en ligne n'a changé : les deux fichiers touchés sont sous
`outils/`. Remesuré : **143 modifiés, 72 en ligne, 71 au dépôt** — inchangé.

Et le site reste injoignable depuis ce conteneur : **vérifié au dépôt, non
vérifié en ligne** — les 51 cartes d'hier sont toujours fausses en ligne.

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Neuvième nuit de suite** que
l'ordre est respecté : la mesure, puis le chiffre.

---

## LE 24 NOVEMBRE — LA LISTE BLANCHE QUE J'AVAIS DÉNONCÉE ÉTAIT ICI MÊME

### Les deux leviers, remesurés d'abord

`docs/MESURES.md` relu sur `origin/main` : dernière modification le
**17 octobre**, relevé toujours celui du **21 août**. **Dixième nuit sans
requêtes.** Titres servis inchangés et dans les règles ; `LOT` ne bouge pas.

**`main` A BOUGÉ, et il ne faut pas se tromper sur la raison.** Il passe de
`f1623ba` à `7bf5158f` — **un seul commit, de `github-actions[bot]`**, sur
`data/dates-contenu.json` **à la racine du dépôt**, c'est-à-dire le site
voyageshalal et pas le mien. Aucune promotion, aucun relevé neuf, rien qui
touche `projects/apprentissage/`. Je le dis parce qu'un `main` qui bouge après
dix nuits ressemble à une bonne nouvelle, et ce n'en est pas une.

### Je venais de fermer un trou en en nommant un autre

Hier soir, j'ai posé la quatrième règle sur les cartes et **pas** sur la prose
des pages, en écrivant pourquoi : les deux occurrences des pages sont des
libellés de thème dont le verset vit dans la carte. C'était un trou **nommé**,
donc un trou. Je suis allé le fermer.

**Il se ferme sans exception à la main.** L'exemption est tirée des données :
une tournure qui tranche dans la prose d'une page est une faute **sauf si ce
texte est, mot pour mot, un libellé que les banques portent** — et dans ce cas
la carte derrière ce libellé est déjà tenue par la règle d'hier.

Mesure : **132 libellés distincts dans les banques, un seul porte une tournure
qui tranche** (« Ce qui est interdit »), et les deux occurrences des pages sont
exactement celui-là. **Zéro tournure non couverte.**

### Et en mesurant ça, j'ai trouvé pire

Les banques portent ce libellé sur **douze** champs, alors que la règle d'hier
voyait **six** cartes. L'écart avait une cause : le champ **`theme` n'était lu
par personne.**

`CHAMPS_TOUS` était une **liste blanche de cinq champs**. Une carte en porte
**dix-sept**. C'est mot pour mot la faute que la note du 18 novembre dit de ne
pas commettre — « *un champ ajouté demain par un générateur serait muet le jour
de son ajout* » — et elle était **dans le même fichier**, sur la plus grande
surface du site.

| | champs lus | après |
|---|---|---|
| recueils de hadith, attributions, tournures qui tranchent | 5 | **17** |
| **promesses de mérite** | **2** | **15** |

**Le pire était la famille que la ronde place le plus haut.** Le bloc des
mérites ne lisait que `question` et `explication`. Un « Les bienfaits de
l'invocation du matin » écrit dans un `theme` — affiché sur la page de section
et dans le corrigé — passait devant elle sans rien déclencher.

    champs relus, trois familles      20 808  →  23 528
    champs relus, promesses de mérite  5 014  →  12 676
    fautes trouvées                        0  →   0

**Zéro faute dans les 2 720 valeurs qui n'étaient pas lues.** Rien ne s'y
cachait. Le trou était réel et sans conséquence aujourd'hui, et les six cartes
qui tranchent sont les mêmes qu'hier : elles portent « Ce qui est interdit »
**deux fois**, en `surtitre` et en `theme`.

### `reponses` reste écarté pour les mérites, et c'est mesuré

La note du 15 octobre prévoyait le piège ; voici son chiffre pour aujourd'hui.
En incluant les réponses, le contrôle des mérites rend **238 FAUTES, toutes
fausses** : dans une question « quelle est la traduction de ce verset ? », les
quatre propositions **sont** des traductions de Hamidullah — « Ô mon Seigneur !
[…] **exauce** ma prière » porte `exauce`, et ce n'est pas le site qui promet.

**Les trois autres familles, elles, lisent bien `reponses`** : un nom de
recueil est une faute où qu'il soit, même entre guillemets. **Les deux portées
sont différentes parce que les règles sont différentes** — ce n'est pas une
incohérence, et c'est maintenant écrit à côté des deux.

### Quatre sabotages, dont un qui doit rester vert

    une phrase normative dans la prose de plus.html   sortie 1
    un `theme` qui tranche, sur une carte sans verset  sortie 1
    un `theme` qui promet un mérite                    sortie 1
    « Ce qui est interdit » dans la prose de plus.html SORTIE 0 — RESTE VERT

Les deux sabotages sur `theme` **étaient verts avant ce soir** : c'est la
meilleure preuve que le champ n'était pas lu.

**Et le vert est le plus instructif** : la même tournure, au même endroit de la
même page, passe quand le texte est un libellé des banques et rougit quand il
n'en est pas un. C'est la règle conditionnelle qui fonctionne, pas une liste
d'exceptions.

**Un sabotage mal visé, encore une fois, et la leçon se répète.** J'avais
d'abord planté le `theme` normatif dans `les-invocations` : vert — non pas
parce que la règle est cassée, mais parce que cette carte **cite son verset**,
donc la règle conditionnelle est satisfaite. Reposé sur `lire-l-arabe`, dont
les cartes portent sur l'alphabet et ne citent aucun verset : rouge. **Pour
tester une règle conditionnelle, il faut choisir un cas où la condition ne peut
pas être remplie.**

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre, aucune correction de contenu —
les 2 720 valeurs nouvellement lues sont propres. Rien de ce qui part en ligne
n'a changé. Remesuré : **143 modifiés, 72 en ligne, 71 au dépôt** — inchangé.

Et les 51 cartes du 22 novembre sont toujours fausses **en ligne** :
**vérifié au dépôt, non vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Dixième nuit de suite** que
l'ordre est respecté : la mesure, puis le chiffre.

**Et une ligne du message de ce commit fait 80 caractères au lieu de 79.** Je
l'ai vue après le push. Je ne réécris pas de l'historique publié pour un
caractère : la correction coûterait plus que le défaut. C'est écrit ici plutôt
que caché.

---

## LE 25 NOVEMBRE — RONDE INTERROMPUE, ET IL FAUT LE DIRE

La ronde du 25 a tourné et **n'a rien produit** : le processus de la session a
redémarré pendant une sonde, et la soirée s'est arrêtée là. **Aucun commit,
aucun compte rendu.** Ce qu'elle avait mesuré avant de s'interrompre est
repris ci-dessous, parce qu'une mesure perdue est une mesure à refaire :

- **`main` n'avait pas bougé**, relevé toujours celui du 21 août.
- **Le rendu des 63 pages dans un vrai navigateur** : 4 573 morceaux de texte
  affiché, dont **112 ne figurent pas dans le HTML servi** — ils naissent à
  l'exécution. **Zéro touche** des trois familles, **zéro** tournure qui
  tranche. Ce sont des compteurs et des libellés : « 10 branches », « 1 174
  questions », « L'objectif du jour ». Leurs sources — littéraux de `js/`,
  valeurs de `data/` — sont déjà relues depuis le 19 et le 20 novembre ; seuls
  les assemblages « nombre + nom » sont neufs. **Surface mesurée, écartée pour
  l'instant, et la raison est écrite.**
- **La chaîne des chiffres est déjà fermée** : `controler-index.py`
  reconfronte l'index aux banques (compte, identifiants un à un, thèmes,
  niveaux) et `controler-meme-chiffre.mjs` vérifie que trois écrans annoncent
  le même nombre. Aucun chiffre affiché n'est annoncé : il est compté.

---

## LE 26 NOVEMBRE — « DIT LA MÊME CHOSE QUE LA FEUILLE » ÉTAIT FAUX

### Les deux leviers, remesurés d'abord

Relevé toujours celui du **21 août** : **douzième nuit sans requêtes.** `main`
immobile depuis le commit du robot. Titres servis inchangés, `LOT` ne bouge
pas.

### Ce que j'ai trouvé, en finissant la sonde de la veille

`js/qcm.js` porte cette phrase au-dessus de son annonce vocale :

> « Ce qui est annoncé à une synthèse vocale dit la même chose, et dans le même
> ordre, que ce qui est écrit sur la feuille. »

**C'était faux.** La feuille écrit l'explication, puis la divergence, **puis la
source**. L'annonce s'arrêtait à l'explication.

Et ça compte, parce que l'attribution vit dans `q.source` :

| | cartes |
|---|---|
| montrent la traduction de leur verset | 1 769 |
| dont l'explication nomme Hamidullah | 1 648 |
| **dont l'explication ne nomme personne** | **121** |

Ces 121 portent la formule d'attribution du site — « Traduction du sens :
« … » » — **tronquée, sans le nom**. À l'écran, le bloc `.f-source` juste en
dessous répare. **Dans l'annonce, rien ne réparait.**

**Mesuré en jouant une question dans un vrai navigateur, pas sur le code.**
L'écran recevait « Coran, sourate 91, verset 11. Traduction du sens : Muhammad
Hamidullah. » ; l'annonce s'arrêtait avant. La règle de la ronde — **un sens
s'attribue** — tenait pour l'œil et pas pour l'oreille.

### Ce qui a changé

L'annonce dit maintenant ce que la feuille dit, **dans son ordre** :
explication, divergence, source. La divergence y entre alors qu'elle est vide
sur les 2 616 cartes — le jour où une carte la portera, « les savants
divergent » est précisément ce qu'il ne faut pas taire à qui ne voit pas
l'écran.

**`js/qcm.js` part en ligne**, et il n'avait pas bougé depuis la publication du
29 septembre : la file passe de **72 à 73 en ligne**.

### Le contrôle ne recopie pas le nom du traducteur

`controler-lecture-ecran.mjs` gagne un septième point, et il compare **deux
choses de la même page** : ce que l'annonce dit, et ce que le bloc `.f-source`
affiche. Pas de constante à tenir d'accord, donc rien qui puisse dériver — la
leçon du 19 novembre.

### Deux sabotages

    l'annonce privée de la source       sortie 1
    l'annonce privée de la divergence   SORTIE 0 — et c'est une information

Le second est vert **parce que le champ `divergence` est vide sur les 2 616
cartes** : le contrôle ne peut pas le voir aujourd'hui. Ce n'est pas un défaut
du contrôle, c'est un trou **nommé** — vérifié pour la source, **non vérifié**
pour la divergence, jusqu'à ce qu'une carte en porte une.

### Et `controler-sections.py` m'a refusé le lot avant moi

La table de publication de `DEPLOIEMENT.md` annonçait encore 72 en ligne quand
`git` en comptait 73. **Le contrôle a rougi, et c'est son travail** :
c'est cette table qu'on lit pour décider d'une publication. Corrigée — 5
fichiers JavaScript au lieu de 4, total 73.

### Ce que je n'ai pas fait, et pourquoi

Aucune page neuve, aucune leçon, aucun titre. Remesuré : **144 modifiés, 73 en
ligne, 71 au dépôt.**

Et les 51 cartes du 22 novembre sont toujours fausses **en ligne**, comme cette
annonce : **vérifié au dépôt, non vérifié en ligne.**

### Le verdict des contrôles, écrit après la mesure

**39 verts : 9 python, 30 navigateur, 0 rouge.** Les 30 tournaient encore à
l'heure du commit, et son message le dit ainsi. **Onzième ronde de suite** que
l'ordre est respecté : la mesure, puis le chiffre.

Et ce soir les 30 ont relu un `js/qcm.js` modifié **et** un
`controler-lecture-ecran.mjs` d'un point plus long : le changement qui part en
ligne a traversé toute la suite, pas seulement le contrôle qui l'exige.
