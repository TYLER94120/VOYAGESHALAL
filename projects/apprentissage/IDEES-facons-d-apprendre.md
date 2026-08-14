# Plusieurs facons d'apprendre, pas une seule

Fichier de travail, demande par Mohamed le 14 aout. Ce n'est pas une page du
site. Rien ici n'est decide : chaque idee est posee avec **ce qu'elle coute**,
**ce qu'elle risque**, et **ce qu'il faudra mesurer** pour savoir si elle sert.

---

## Le constat qui commande tout le reste

Le site a **neuf lecons** et **une seule facon de les faire** : un paquet de
cartes, six minutes, deux mains, les yeux dessus, et le reseau pour la
recitation. Tout le reste s'adapte — le niveau, le moment, l'espacement des
revisions — mais **le geste, lui, ne change jamais**.

Ma mesure du cycle 28 disait : qui avance vite trouve **15 jours vides sur 18**.
Je l'avais lue comme « il manque du contenu ». **Elle dit autre chose.** Une
partie de ces jours ne sont pas vides de matiere : ils sont vides **de la seule
forme proposee**. Quelqu'un debout dans le RER n'a pas six minutes a deux
mains ; il a deux minutes a un pouce. Le site n'a rien pour lui, alors qu'il a
neuf lecons ecrites.

> **Une lecon n'est pas un contenu, c'est une matiere premiere.** La meme
> matiere peut se servir en plusieurs gestes. Neuf lecons x une forme = neuf
> choses a faire. Neuf lecons x cinq formes = quarante-cinq.

Et le point qui rend tout cela tenable : **aucune de ces formes ne demande
d'ecrire un seul texte religieux de plus.** Elles rejouent ce qui est deja
ecrit, relu et source. **Zero risque editorial ajoute** — c'est la raison
principale de les preferer a « ecrire plus vite ».

---

## Les formes, de la moins chere a la plus delicate

### 1. Le QCM libere — « deux minutes, n'importe ou »

*C'est celle que Mohamed a nommee, et c'est la moins chere de la liste.*

Il existe deja **27 questions** dans le site : trois par lecon, neuf lecons.
Elles sont ecrites, relues, sourcees — et **enfermees**. On ne peut en
rencontrer une qu'en refaisant la lecon entiere qui la contient.

Les liberer : une page qui tire des questions parmi **ce que la personne a deja
appris**, et rien d'autre. Pas de contenu neuf, pas de source neuve, pas de
relecture. Le travail est de la plomberie, pas de l'edition.

- **Ce que ca coute** : lire les questions depuis les pages de lecon, une page,
  aucune donnee nouvelle.
- **Ce que ca rapporte** : 27 questions, c'est beaucoup de jours qui cessent
  d'etre vides. Et ca marche debout, a une main, sans son.
- **La regle qui ne bouge pas** : **un score est un compteur, pas un jugement.**
  Jamais « tu as rate », jamais un pourcentage en rouge. On dit ce qui est su et
  ce qui reviendra, comme partout ailleurs sur le site.
- **A mesurer apres** : combien de jours vides en moins sur les 18 jours joues.
  C'est la meme mesure que d'habitude, elle se relance telle quelle.

### 2. Le mode hors ligne — « le tunnel »

Le RER passe sous terre. Aujourd'hui, **plus de reseau = plus de site du tout**.

Le site entier pese **529 Ko**. C'est assez petit pour tenir en entier dans le
telephone des la premiere visite. Un *service worker* le met en cache, et le
site s'ouvre a zero barre, sous terre, en avion.

- **Ce que ca coute** : un fichier de plus, et de la rigueur — un cache mal fait
  sert de vieilles pages pour toujours.
- **Ce que ca rapporte** : le RER, justement. Et c'est **la meme piece
  technique** que le rappel quotidien attend depuis l'element 4 de ma file : on
  la construit une fois, elle sert deux fois.
- **La limite, et elle est honnete** : **la recitation restera en ligne
  seulement.** Elle vient d'un recitateur exterieur, on ne l'heberge pas et on
  ne l'hebergera pas. Sous terre, le texte et les lecons marchent ; le son, non.
  Il faudra le dire a l'ecran, pas le laisser echouer en silence.

### 3. Le mode « une seule main » — debout, l'autre main sur la barre

Aujourd'hui, avancer demande de **viser un bouton**. Assis, c'est invisible ;
debout dans un train qui bouge, c'est un effort a chaque carte, quatorze fois.

La carte entiere devient la zone qui avance — sauf les liens et les reponses de
quiz, evidemment. Plus rien a viser.

- **Ce que ca coute** : peu.
- **Le risque, reel** : avancer par accident et sauter une carte. C'est pour ca
  que le bouton **reste** — on ajoute une zone, on ne retire pas la commande. Et
  le bouton Retour, repare au cycle 39, rattrape deja un pas de trop.
- **A mesurer avant de decider** : le taux de ratage a 414 px avec un doigt qui
  tremble. Ca se simule : des appuis decales de quelques millimetres autour de
  la cible, et on compte.

### 4. Le mode ecoute — les ecouteurs, le telephone dans la poche

Le navigateur sait lire un texte a voix haute, **sans reseau, sans installation,
sans compte, sans rien envoyer nulle part**. La lecon devient ecoutable les yeux
fermes.

C'est la forme qui change le plus de choses. C'est aussi la plus delicate, et je
ne la poserai pas sans que la regle suivante soit **dans le code**, pas seulement
dans un commentaire :

> **La machine ne lit que le francais.** Jamais un mot d'arabe, jamais un
> verset, jamais un hadith dans sa langue. Aucune voix de synthese ne recite le
> Coran sur ce site — c'est la ligne posee au premier jour et elle ne bouge pas.

Concretement : ce qui porte `lang="ar"` est **exclu a la source**, la voix passe
son chemin et annonce que le texte arabe est a l'ecran. Ce n'est pas une
consigne, c'est un filtre qui doit rendre la faute **impossible**, pas
seulement interdite.

- **Ce que ca coute** : moyen. Et il faudra tester sur un vrai telephone : la
  voix francaise n'est pas installee partout, et une voix absente doit se
  comporter comme une source absente — **pas de bouton si rien ne repond**,
  la meme regle que la recitation.
- **A mesurer** : sur combien de telephones une voix francaise existe. Je ne
  peux pas le savoir depuis l'atelier.

### 5. Le mode lecture — a la maison, sans taper

Une lecon, une page longue, tout visible, aucun bouton. Pour lire, relire, ou
montrer a quelqu'un.

- **Ce que ca coute** : presque rien. La machinerie existe deja : je genere
  `apercu.html` a chaque cycle, il est simplement **exclu du site en ligne**
  pour ne pas faire du contenu duplique. Une version par lecon, et une balise
  `noindex` pour la meme raison.
- **Ce que ca rapporte** : la personne qui veut comprendre au lieu d'avancer.

### 6. Les chemins selon le moment — ce que Mohamed appelle « differents chemins »

Le site demande deja **quand** revenir. Il ne demande jamais **comment**. Une
question de plus, une seule, posee une seule fois :

| La personne dit | La carte du jour propose |
|---|---|
| deux minutes, debout | le QCM, une main, sans son |
| six minutes, assis | la lecon du jour, comme aujourd'hui |
| j'ai mes ecouteurs | le mode ecoute |
| a la maison, tranquille | la lecon, la lecture longue, la recitation |

**Ce n'est pas le contenu qui change, c'est sa forme.** La meme lecon, le meme
texte, la meme source.

- **A ne faire qu'en dernier** : router n'a de sens que quand il y a deux ou
  trois formes vers lesquelles router. Avant, c'est une question posee pour rien
  — et une question de plus a l'accueil, c'est un obstacle de plus.
- **La regle habituelle s'applique** : le choix se change en un geste, et ne pas
  repondre ne bloque rien.

---

---

# Par niveau — ce que le site fait deja, et ce qu'il fait semblant de faire

Demande de Mohamed le 14 aout : *« un enfant n'est pas un adulte, une personne
qui connait 50 sourates est differente d'une personne qui n'en connait
aucune »*. Il a raison. Voici ce que le site fait **reellement** aujourd'hui,
mesure et non suppose.

## La mesure : cinq personnes, cinq profils, le meme site

| la personne | profil calcule | premiere lecon proposee |
|---|---|---|
| debutant complet | `debutant` | Les six piliers de la foi |
| prie parfois, Al-Fatiha incertaine | `intermediaire` | Al-Fatiha |
| prie les cinq, quelques sourates | `intermediaire` | Trois invocations du matin |
| prie les cinq, **plus de dix sourates** | `avance` | Trois invocations du matin |
| ne repond pas aux questions | `inconnu` | Al-Fatiha |

**Cinq profils, trois ordres distincts, trois premieres lecons distinctes.**
Le niveau n'est donc pas decoratif : il change bien quelque chose.

**Mais voici ce qu'il ne change pas, et c'est le point.**

1. **Tout le monde recoit les memes neuf lecons.** Le niveau change **l'ordre**,
   jamais le **contenu**. Personne ne recoit une lecon que les autres n'ont pas,
   personne n'en saute une.
2. **Deux profils sur cinq recoivent exactement la meme chose.** « prie les
   cinq, quelques sourates » et « plus de dix sourates par coeur » ont **le meme
   ordre, lecon pour lecon**. La troisieme question — *combien de sourates
   connais-tu par coeur* — ne deplace **aucune** lecon aujourd'hui. Elle ne
   change qu'**une phrase de bilan**.
3. Donc : on demande a quelqu'un qui connait cinquante sourates ou il en est, et
   on lui sert ensuite le meme parcours qu'a un debutant, dans un ordre a peine
   different. **C'est une promesse a moitie tenue**, et c'est mesurable.

## Ce qu'il faudrait vraiment, et ce que ca coute

**Pour le niveau avance — il manque du contenu, pas du code.** Quelqu'un qui
connait cinquante sourates n'a presque rien a apprendre dans les neuf lecons
actuelles, sauf peut-etre lire l'arabe. Le site est **un site de debutants** :
neuf lecons de debutant. Aucun reglage ne fera apparaitre ce qui n'est pas
ecrit. Ce qui lui servirait vraiment — le sens verset par verset de sourates
qu'il recite deja, le vocabulaire coranique, la memorisation methodique — **est
du contenu, et le contenu n'accelere jamais.**

**Pour l'enfant — ce n'est pas un reglage, c'est un deuxieme site.** Un enfant
n'est pas un adulte en plus petit : le vocabulaire change, la longueur des
phrases change, les exemples changent, le registre change. Un bouton « mode
enfant » qui servirait les memes textes serait un mensonge d'interface. Ecrire
une version enfant, c'est **reecrire les neuf lecons**. Je le pose ici pour que
ce soit dit clairement, et je ne le commence pas sans decision explicite :
c'est doubler le site, pas ajouter une option.

*Ce qui est cheap et honnete, en revanche : des cartes plus courtes.* Mais il
faut appeler ca **de la brievete**, pas de l'enfance.

## Ce que je recommande, dans l'ordre

1. **Faire servir la troisieme question a quelque chose, ou la retirer.**
   Aujourd'hui elle ne deplace aucune lecon. Une question posee pour rien est un
   appui de trop — et on vient d'en supprimer un pour cette raison exacte.
2. **Dire la verite au profil avance.** Le message le fait deja a moitie
   (« il n'y a que N lecons ici aujourd'hui »). Il pourrait aller plus loin :
   proposer d'emblee les lecons d'arabe, les seules qui lui apprennent quelque
   chose, et dire franchement que le reste viendra.
3. **Les formes avant les niveaux.** Un QCM tire de ce qu'on sait deja sert
   *toutes* les personnes ci-dessus sans ecrire une ligne de contenu. Un niveau
   avance demande d'ecrire des lecons avancees. **A cout egal, la forme rapporte
   plus que le niveau** — c'est le meme constat que plus haut, mesure deux fois.

---

## Une idee que je pose et que je ne recommande pas encore

**Le mode a deux.** Une page tenue entre deux personnes : l'un lit la question a
voix haute, l'autre repond. Un parent et un enfant, deux amis. Ca coute peu.
Mais **rien ne prouve que quelqu'un le veut**, et je n'ai aucune mesure
d'entree pour le savoir. Ca reste ici jusqu'a preuve.

---

## L'ordre que je recommande, et pourquoi

1. **Le QCM** — le moins cher, la matiere existe deja, et il repond directement
   aux jours vides.
2. **Le hors ligne** — le vrai deblocage du RER, et la piece dont le rappel
   quotidien a besoin de toute facon.
3. **Une seule main** — peu de travail, du confort immediat en transport.
4. **Le mode ecoute** — le plus transformant, le plus delicat. Apres les trois
   premiers, pas avant.
5. **La lecture longue** — presque gratuit.
6. **Les chemins** — en dernier, quand il y a de quoi router.

**Ce que je ne ferai pas** : inventer du contenu pour remplir une forme. Les six
idees ci-dessus rejouent ce qui est deja ecrit et source. C'est exactement ce qui
les rend acceptables au rythme demande — **la forme peut accelerer, le contenu
religieux non.**
