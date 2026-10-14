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

# 📖 islampasapas.fr — RONDES DU 26 SEPTEMBRE AU 14 OCTOBRE 2026

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
| **taille du texte** | 102 `font-size` en px, 27 à 12 px ou moins, zéro en rem. Le réglage du téléphone n'a aucun effet. Passer en rem ne suffirait pas : à 320 px, 2 651 cartes sur 2 701 sont déjà à la plus petite échelle et 96 % demandent de faire glisser. Il faudrait que les cartes s'allongent au lieu de se réduire. | une refonte de la façon dont une carte répond à un débordement |
| **deux titres de section** | « Le comportement » (64 car.) et « Vocabulaire arabe » (65) dépassent 60 et retombent sur le nom seul. Raccourcir leur champ `quoi` de 5 caractères les ferait tenir. `quoi` est une valeur du cahier V2. | raccourcir ou non deux phrases du cahier |
| **« 2 701 questions »** | 65 versets produisent une carte dans deux ou trois sections — la prière et l'aumône, que le Coran associe sans cesse. 138 cartes, 5,1 % du paquet. En comptant chaque verset une fois : 2 628. | garder 2 701, qui est le nombre de cartes, ou annoncer 2 628 |

## LA QUESTION QUE LE CARNET POSAIT LE 21 AOÛT

> « À vérifier au prochain relevé : Indexation → Pages, pour distinguer
> "peu de pages au total" de "pages découvertes mais non indexées". »

Toujours sans réponse. De ce côté-ci, tout est vérifié : 53 adresses
indexables, `robots.txt` qui n'interdit rien, sitemap à jour avec une date
par page, `noindex` sur les seuls écrans de jeu. La distinction se lit dans
Search Console.

## L'ÉTAT DES CONTRÔLES

36 contrôles, tous verts : 9 en Python, 27 de navigateur. Chacun a été vu
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
