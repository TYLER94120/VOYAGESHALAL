# Correction, et livraison — de l'agent responsable

Mohamed a tranche deux fois, clairement : **il veut que ce soit addictif, vraiment
addictif**, et **il veut l'audio**. Les deux decisions que j'avais fermees hier
sont donc rouvertes, et l'une des deux etait fondee sur une erreur de ma part.
Ce document la corrige et te livre le code, pret a brancher.

---

## 1. L'erreur : « les hebergeurs de recitation sont bloques »

C'est vrai, et ce n'etait pas la bonne conclusion.

Depuis l'atelier, `cdn.islamic.network`, `everyayah.com`, `quran.com` repondent
tous **403** — c'est la politique de sortie reseau de l'environnement des
agents. J'en ai deduit que la recitation etait impossible. J'ai confondu deux
choses differentes :

- ce que **l'atelier** peut telecharger,
- ce que **le site** peut faire ecouter.

Le site ne telecharge rien du tout. C'est **le navigateur du visiteur** qui va
chercher le fichier, et ce navigateur n'a aucun filtre. Ce qui est injoignable
depuis l'atelier est parfaitement joignable depuis le telephone de Mohamed.

**Le blocage n'a jamais concerne le produit.** Il concernait ma machine. Toi, tu
avais raison sur le fond depuis le debut : on n'apprend pas a reciter sans
entendre reciter. C'est moi qui t'ai fait ranger ce chantier.

Une page de verification est en ligne : **halalgpt.fr/labo-son**. Elle sonde les
sept sources depuis le navigateur et affiche lesquelles repondent. Ouvre-la, ou
demande le resultat a Mohamed : c'est la seule facon de trancher, et ce n'est
pas depuis l'atelier que ca se fait.

### Ce qui, en revanche, ne bouge pas

- On **n'heberge aucun fichier**. On pointe vers la source.
- Le **recitateur et la source sont nommes** sur la page, en clair.
- **Jamais de voix de synthese sur le Coran.** De vrais recitateurs, ou rien.
  Cette regle-la ne se discute pas, et elle est mieux respectee ainsi qu'avec
  n'importe quelle solution de repli.
- Si aucune source ne repond : **aucun bouton n'apparait**. Le site ne promet
  jamais un son qu'il ne peut pas rendre. Ton mecanisme d'origine etait bon,
  je l'ai simplement etendu aux sources distantes.

---

## 2. Ce que je te livre, deja dans ta branche

### `audio-coran.js`

Chaine de secours sur quatre sources, testee au premier besoin, gagnante
retenue en memoire pour les visites suivantes. La sonde passe par un element
`<audio>` et non par `fetch` : ces hebergeurs n'envoient pas d'en-tete CORS, un
`fetch` echouerait meme quand le fichier est parfaitement lisible.

Dans une lecon, il n'y a rien de plus a ecrire que :

```html
<span data-coran="1:1">Bismi-Llahi r-Rahmani r-Rahim</span>
<span data-coran="1:1-7">…la sourate entiere…</span>
```

Puis `ippCoran.brancher(zone)` — a poser a cote de ton `ippBrancherAudio`
existant, dans `ippDemarrerLecon`. Le bouton se pose seul, la suite de versets
s'enchaine seule.

Bonus deja cable : `ippCoran.basculerLenteur()` fait passer a **Husary
Mujawwad**, la voix lente des ecoles coraniques — celle avec laquelle on
apprend vraiment. Mets l'interrupteur dans la lecon Al-Fatiha.

Prevois un `<p data-r="credit-audio"></p>` en pied de lecon : le credit s'ecrit
tout seul dedans.

### `sons.js` + `sons/` (six fichiers)

Six sons d'interface, synthetises de zero. Aucune licence, rien a demander a
personne. Ce sont des timbres de cloche, pas de la musique : sur un site
religieux, un son court de trois dixiemes de seconde n'ouvre pas le debat des
instruments. L'interrupteur est visible, pas cache dans un menu.

| Son | Quand | Pourquoi |
|---|---|---|
| `bon` | bonne reponse | deux cloches qui montent, court, net |
| `presque` | reponse ratee | **le plus important des six** — grave, chaud, il ne punit pas |
| `tap` | carte suivante | presque invisible : on l'entend 14 fois par lecon |
| `serie` | la serie augmente | la recompense du jour, celle qu'on veut reentendre demain |
| `fin` | lecon terminee | une figure qui se pose, elle sonne « fini » |
| `objectif` | objectif du jour atteint | la plus pleine, et pourtant sobre |

`ippSons.jouer('bon')`, et `ippSons.brancherInterrupteur()` sur un
`[data-r="son-bascule"]`.

Sur `presque` : ne le remplace jamais par un buzzer. Le son de l'erreur decide
si la personne recommence ou ferme l'onglet. Quelqu'un qui apprend sa religion
ne doit pas se sentir juge par une interface.

---

## 3. « Vraiment addictif » — ce que ca veut dire concretement

Sept pieces. Elles ne se valent pas : elles sont dans l'ordre de leur effet
reel, mesure sur les produits qui retiennent (Duolingo tient 100 millions de
personnes avec exactement ca).

### 1. La serie, avec un filet — tu l'as deja a moitie

Ta serie existe (`IPP.serie()`). Il lui manque la piece qui la rend durable :
**le jour de grace**. Une serie nue est un piege — le premier jour manque
detruit la motivation pour de bon (« j'ai perdu mes 40 jours, j'arrete »).

- on gagne **1 jour de grace tous les 5 jours** de serie, **2 en stock maximum** ;
- il se consomme **tout seul** quand un jour est manque ;
- on l'annonce apres coup : « Ton jour de grace a sauve ta serie. »
- le **record personnel** s'affiche a cote du compteur.

Interdit : la moindre culpabilisation, et surtout la moindre pression
religieuse. C'est un compteur, pas un jugement. On ne melange pas un mecanisme
de produit avec la crainte d'Allah — ce serait malhonnete, et en pratique c'est
la meilleure facon de faire fuir quelqu'un.

### 2. L'anneau du jour

Un objectif quotidien minuscule et **toujours atteignable** : *1 lecon **ou** 3
revisions*. Un anneau qui se ferme, **visible en haut de l'accueil avant meme
d'avoir commence** — c'est son incompletude qui demange. A la fermeture :
`objectif.mp3` et une animation courte.

### 3. La session toujours gagnable

Cinq minutes, jamais d'echec possible. Une mauvaise reponse **ne bloque pas** :
la carte revient plus loin dans la meme session. Chaque session se termine par
un ecran de victoire, sans exception. Si une session peut etre ratee, les gens
n'ouvrent plus le site les jours de fatigue — exactement les jours ou la serie
a besoin d'eux.

### 4. Le retour immediat

Les six sons, plus une micro-animation, **en moins de 100 ms**. C'est
l'addiction de seconde en seconde. Sans ca, une lecon ressemble a un devoir.

### 5. Le chemin, pas la liste

Remplace la liste de `parcours.html` par un **chemin vertical qui serpente** :
fait / en cours / a venir. L'etape en cours est grande et respire doucement.
Six lecons sur un chemin donnent un voyage ; six lecons dans une liste donnent
« il n'y en a que six ». Meme contenu, effet inverse. Tu as deja `chemin.html` —
c'est la qu'il devient la piece maitresse.

### 6. La collection

« Tu connais **3 sourates** par coeur · **34 mots** d'arabe du Coran · **12
invocations**. » Une etagere qui se remplit. La memorisation est, par nature,
une collection — c'est un avantage que ce site a et que les autres n'ont pas.

### 7. Le rappel au bon moment — l'idee que seul ce site peut avoir

Une notification quotidienne (PWA), **calee sur une heure de priere** : apres le
Fajr, ou apres l'Icha. A ce moment-la, la personne est deja dans une
disposition religieuse. Duolingo ne peut pas faire ca. Nous si.

Texte : « 5 minutes — ta serie de 6 jours t'attend. » Jamais de culpabilite,
jamais « Allah te regarde ».

### Et l'audio, qui multiplie tout le reste

Ecouter → repeter → reecouter. C'est **la boucle qui donne la satisfaction
d'apprendre**, celle qui manque a un site muet. Sur Al-Fatiha : le verset se
joue, un silence de la meme duree, puis il se rejoue. Mohamed a raison d'y
tenir : ce n'est pas une fonctionnalite de plus, c'est ce qui rend le reste
addictif.

---

## 4. L'ordre. Rien d'autre avant.

1. **La recitation sur Al-Fatiha** (`audio-coran.js` a brancher) — c'est ce que
   Mohamed veut entendre en premier, et c'est deja ecrit.
2. **Les six sons** dans le lecteur de lecon (`sons.js`) + l'interrupteur visible.
3. **Le jour de grace** + le record, sur la serie existante.
4. **L'anneau du jour** en haut de l'accueil.
5. **Les parcours vides retires**, et l'accueil ramene a une carte, un bouton.
6. **Le chemin** a la place de la liste.
7. La collection, puis le rappel.

Toujours interdit jusqu'a nouvel ordre : nouveaux parcours, nouvelles familles,
nouvelles listes, refonte du referencement. Une idee qui vient s'ecrit dans la
boite aux lettres, elle ne se construit pas.

---

## 5. Ton rapport

Cinq lignes, francais tres simple, et **l'adresse exacte a ouvrir**. Mohamed est
un fondateur non technique : il juge avec ses yeux et ses oreilles, pas avec des
explications. Dis-lui ce qu'il peut **entendre**.

Tu avais la rigueur — c'est le plus dur, et tu l'avais deja. Sur l'audio, tu
avais aussi raison, et c'est moi qui t'ai fait ranger le sujet. Il est rouvert,
le code est ecrit, il ne reste qu'a le brancher.

— L'agent responsable
