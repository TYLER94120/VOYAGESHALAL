---
name: faire-revenir-sans-culpabiliser
description: >
  Methode de l'empire pour construire un retour quotidien sans jamais s'appuyer
  sur la culpabilite. A utiliser DES QU'ON PARLE DE FAIRE REVENIR QUELQU'UN :
  « rendre le site addictif », « serie de jours », « streak », « objectif
  quotidien », « badge », « recompense », « notification de rappel », « il ne
  revient pas », « gamification », « il abandonne apres deux jours ». Declenche
  aussi avant d'ecrire un message de relance ou de felicitation, avant
  d'afficher un compteur, et AVANT TOUT MECANISME POSE SUR UNE PRATIQUE
  RELIGIEUSE — priere, lecture du Coran, jeune, invocations — ou une phrase mal
  choisie fait fuir definitivement. Lis-la aussi avant de decider si une serie a
  un sens sur ton produit : sur la plupart, elle n'en a aucun.
---

# Faire revenir sans culpabiliser

## Pourquoi cette skill existe

Islam pas a pas n'a qu'une seule mesure : **Mohamed l'ouvre sept jours
d'affilee.** Pas le trafic, pas le nombre de pages.

La difficulte n'est pas technique — un compteur de jours, c'est vingt lignes.
Elle est que **les mecanismes de retour les plus efficaces du marche marchent a
la culpabilite** : la flamme qui s'eteint, le petit animal triste, « tu vas
perdre tes 40 jours ». Sur un produit religieux ce levier est indecent, et
surtout **contre-productif** : quelqu'un qui vient chercher de l'aide sur sa
pratique et qui recoit de la pression part, et ne revient pas.

Voici ce qui a marche sans ce levier, ce qui a casse, et ce qui manque encore.

## 1. Une serie nue est un piege : il faut un filet

Une serie sans filet se detruit elle-meme. Un jour manque, le compteur tombe a
zero, et la personne se dit « j'ai perdu mes 40 jours, j'arrete ». Le mecanisme
cense faire revenir devient la raison de partir.

**Le jour de grace**, tel qu'implemente : on en gagne **1 tous les 5 jours**,
**2 en stock maximum** (sinon un absent de trois semaines garde sa serie et le
compteur ne veut plus rien dire), il se consomme **tout seul**, et il est
**annonce apres coup** : « Ton jour de grace a sauve ta serie. »

Annoncer apres et jamais avant : afficher « il te reste 2 jours de grace »
transforme le filet en permission, et la permission en calcul. Decouvert apres,
il produit du soulagement — l'emotion exacte qui fait revenir demain.

**Ne stocke ni la serie, ni le stock de grace, ni le record.** Tout est
recalcule a chaque affichage depuis la seule liste des jours de visite. Un
compteur ecrit quelque part derive — un fuseau horaire, un double appel, une
navigation privee — et il affiche un chiffre faux sur le seul chiffre auquel la
personne fait confiance. Une valeur recalculee ne peut pas mentir, et elle se
teste hors navigateur : **20 controles de logique pure**, dont deux ont attrape
de vrais defauts :

- le trou entre la **derniere visite et aujourd'hui** (et non entre deux
  visites) : la journee en cours ne compte pas comme manquee, elle n'est pas
  finie ;
- le **record survit a la cassure**. Une serie de 7 cassee laisse un record de 7.
  C'est tout ce qui reste quand la chaine tombe, et c'est ce qui fait recommencer.

## 2. L'objectif du jour doit etre atteignable les mauvais jours

L'anneau du jour vaut **une lecon OU trois revisions**. Deux voies, la plus
courte prend cinq minutes.

**Si une journee peut etre ratee, les gens n'ouvrent plus le site les jours de
fatigue** — exactement les jours ou la serie a besoin d'eux. Un objectif qu'on
echoue une fois est un objectif qu'on n'affronte plus.

L'anneau est **visible avant d'avoir commence** : c'est son incompletude qui
donne envie de le fermer. Un anneau qui n'apparait qu'apres l'effort ne
recompense rien. Detail qui a demande deux essais : **a zero, ne dessine pas
l'arc du tout** — un trait arrondi de longueur nulle laisse un point dore qui
ressemble a une salissure.

## 3. Le chemin bat la liste, a contenu identique

Six lecons dans une liste disent « il n'y en a que six ». Les **memes** six sur
un trajet vertical qui serpente disent « voila ou tu en es ». Le trait se dore au
fur et a mesure, l'etape en cours est plus grande et respire, ce qui est fait
s'estompe.

Trois defauts trouves en le cassant :

1. **La decoration ne doit jamais dependre de la taille du contenu.** Les courbes
   ont une hauteur ET une largeur fixes. Un `<svg>` de 60 unites en `width: 100%`
   avec `preserveAspectRatio="none"` s'etirait sur tout l'ecran : le trait
   devenait un ruban.
2. **Ne fais pas serpenter les cartes elles-memes**, seulement le trait et les
   medaillons. Un retrait variable donne un bord gauche en dents de scie qui se
   lit comme un bug.
3. **L'ordre affiche doit etre l'ordre conseille**, pas l'ordre du catalogue. Une
   page montrait une etape faite **apres** deux etapes a venir : un chemin troue.
   Rien n'etait faux, et ca suffisait a detruire la lecture du trajet.

## 4. Le retour immediat : six sons, deux regles

**Le son de l'erreur decide de tout.** Il s'appelle `presque`, il est grave et
chaud, il ne punit pas. Un buzzer fait fermer l'onglet — et sur du contenu
religieux, fermer pour de bon. Ne le remplace jamais.

**Jamais trois sons a la suite.** En finissant la premiere lecon du jour, trois
evenements tombaient ensemble : lecon finie, serie augmentee, anneau ferme. Trois
sons ensemble n'en font plus qu'un. Regle retenue : `fin`, puis 900 ms plus tard
**soit** la serie si elle a monte, **soit** l'anneau s'il vient de se fermer.
Jamais les deux — un evenement rare doit rester audible comme rare.

## 5. Ou passe la limite avec le religieux

C'est la partie a ne pas improviser.

**Interdit, sans exception :** invoquer le divin comme levier (« Allah te
regarde ») ; confondre le compteur et le devoir (« tu as manque ta serie, donc tu
as manque ton devoir ») ; feliciter la piete (« tu es un bon musulman », « 7
jours, tu progresses spirituellement ») ; faire de la serie un merite religieux.
Gagner n'est pas etre pieux, et perdre n'est pas pecher.

**Permis :** le fait, sec et exact. « 6 jours d'affilee — c'est ton record. »
« Objectif du jour atteint. » « Ta serie commence aujourd'hui. »

La formule : **un compteur est un compteur, pas un jugement.** Il compte des
ouvertures de page. Il ne dit rien de la relation de quelqu'un a Dieu, et il ne
doit jamais faire semblant.

### Rends la regle mecanique, pas morale

Une consigne de ton se perd en trois semaines ; un test, non. Celui-ci echoue si
les mots **« perdu », « casse », « dommage », « rate », « echec »** apparaissent
a l'ecran dans l'etat « serie cassee » :

```js
v('aucun reproche affiche',
  !/perdu|casse|dommage|rate|echec/i.test(texteObjectif + ' ' + texteSerie));
```

Six lignes, et c'est ce qui empeche un futur agent presse de reintroduire la
honte par inadvertance. **Une serie cassee repart a 1 sans un mot**, et le
message affiche est une invitation, pas un constat de perte.

### Une recompense ne peut affirmer que ce qui a ete observe

L'etagere affiche « 7 versets d'Al-Fatiha · 28 lettres de l'alphabet · 25
prophetes du Coran ». On m'a demande d'ecrire « 3 sourates **par coeur** ».
**J'ai refuse, et c'etait le bon refus** : le site ne verifie a aucun moment
qu'une sourate est memorisee. Un compliment invente est un mensonge, et sur un
site dont tout l'argument est de ne rien affirmer sans source, c'est le premier
fil qu'on tire. Si tu veux ecrire « par coeur », construis d'abord le test de
restitution.

## 6. Quand tu simplifies, cherche ce que tu as rendu invisible

L'accueil montre **une carte et un bouton**, tout le reste derriere un lien
discret. Consequence imprevue : en retirant le bloc des revisions, la repetition
espacee devenait **invisible** six jours durant, puisqu'une lecon neuve passe
toujours devant.

La solution n'a pas ete de remettre le bloc, mais **une ligne** sous le bouton :
« Al-Fatiha revient aujourd'hui : la revoir en 8 min. » Remets la fonction perdue
sous sa forme la plus petite, jamais sous sa forme d'origine.

## QUAND NE PAS APPLIQUER CETTE SKILL

C'est la partie la plus importante pour les autres agents, parce qu'**une serie
n'a de sens que si la pratique quotidienne est elle-meme le but.**

- **Un guide de voyage** (voyageshalal.fr, gohalaltravel.com) : on prepare un
  voyage tous les six mois. Une serie y reprocherait a quelqu'un de ne pas partir
  en voyage, et un badge « 30 jours d'affilee » ne recompenserait qu'une insomnie.
- **Un scanner en magasin** (halalcheck.fr) : l'usage est declenche par un
  besoin — trois fois en dix minutes, puis rien pendant deux semaines. Le bon
  indicateur y est la **reussite du scan**, pas l'assiduite.
- **Un site de questions-reponses** (halalgpt.fr) : on vient quand on a une
  question. Faire revenir quelqu'un qui n'en a pas, c'est du bruit.

Le test : **« si la personne n'ouvre pas ce produit pendant deux semaines, est-ce
un probleme pour elle ? »** Si non, ne construis pas de serie. Compte autre
chose, ou ne compte rien.

Sur ces produits, restent transferables la **partie 4** (le son d'erreur qui ne
punit pas) et la **partie 5** (la limite religieuse, et l'interdiction d'affirmer
une recompense non observee).

**Deux verrous sur le rappel quotidien.** Une notification calee sur une heure de
priere suppose de **connaitre** cette heure : Islam pas a pas s'interdit de
calculer les horaires, donc la seule issue propre est de **demander l'heure a la
personne**. Et sur iPhone une notification web n'existe que si le site a ete
**ajoute a l'ecran d'accueil**. Ne promets pas de rappel avant d'avoir regle ces
deux points.

## Ce que je ferais differemment

1. **Ecrire le test de ton en premier**, avant la mecanique. Je l'ai ecrit apres,
   et j'ai eu de la chance qu'il passe du premier coup.
2. **Mesurer sur le vrai ecran plus tot.** Le telephone de Mohamed dans Safari
   fait **414 x 690** pixels CSS, pas 414 x 896 : les barres du navigateur en
   mangent 200. Deux defauts visuels n'apparaissaient qu'a cette hauteur, dont une
   ligne de texte tranchee en deux par le bouton du bas.
3. **La piece qui manque : la session toujours gagnable.** Une mauvaise reponse ne
   bloque pas, mais la carte ne **revient pas** plus loin dans la seance. Tant
   qu'elle ne revient pas, une erreur reste une erreur au lieu de devenir un
   apprentissage.
4. **Verifier ce que la personne peut lire.** La prononciation en lettres latines
   — la seule ligne utilisable par qui ne lit pas l'arabe — etait le plus petit
   texte de la carte : 15 px, gris pale, italique. Une boucle « repete avec moi »
   ne sert a rien si le texte a repeter est illisible.
