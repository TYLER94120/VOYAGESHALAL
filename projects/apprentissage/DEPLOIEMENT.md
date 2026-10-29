# Mettre le site en ligne — la marche a suivre

Pour Mohamed. Le site est **statique** : des fichiers, rien d'autre. Pas de
base de donnees, pas de serveur a regler, aucune cle a saisir.

> Ce fichier avait ete supprime lors de la refonte du 21 aout. C'etait une
> erreur : le cahier des charges demandait de repartir de zero sur
> l'arborescence, le HTML, le CSS et le JS — pas de jeter le mode d'emploi du
> deploiement. Il est remis ici, mis a jour.
>
> Il ne part pas en ligne : `.vercelignore` exclut tous les `.md`.

---

## Le reglage, en une ligne

| | |
|---|---|
| depot SERVI | **`TYLER94120/Islampasapas`**, branche `main` |
| depot SOURCE | `TYLER94120/VOYAGESHALAL`, `projects/apprentissage/` |
| adresse | **https://islampasapas.fr** |
| deploiement | automatique quand on pousse sur **Islampasapas** |

### Ce que je croyais, et qui etait faux

J'ai ecrit ici, le 21 aout au matin, que le projet Vercel ecoutait la branche
`claude/islamic-learning-platform-l7o7to` du depot `VOYAGESHALAL`. C'etait une
phrase recopiee d'une ancienne note, que je n'avais pas verifiee.

La verite, constatee en clonant le depot : **`islampasapas.fr` sert
`Islampasapas`**, qui etait fige au 14 aout avec neuf lecons. Tout le travail
d'une semaine partait dans `VOYAGESHALAL` et n'arrivait jamais en ligne. On a
cherche du cote de Vercel pendant une heure, alors que le probleme etait qu'on
poussait au mauvais endroit.

### Deux copies, une seule commande

Le site vit donc a deux endroits :

- `VOYAGESHALAL/projects/apprentissage/` — la SOURCE : les pages, mais aussi
  les generateurs de questions et les donnees brutes du Coran ;
- `Islampasapas` — ce qui est SERVI, et rien d'autre.

Deux copies recopiees a la main derivent toujours. On ne les recopie donc
jamais a la main :

```
python3 outils/publier.py
```

Il vide le clone, recopie, puis **verifie fichier par fichier** que les deux
copies se recoupent — et refuse de continuer sinon. Il n'envoie rien tout
seul : il affiche la commande de publication a lancer.

`outils/` et les `.md` ne traversent pas : ils ne servent qu'a fabriquer.

---

## Si le site ne change pas apres un push

A verifier dans cet ordre, du plus frequent au plus rare.

**1. Le navigateur montre l'ancienne page.**
C'est la cause la plus courante et la plus trompeuse : le site est a jour, le
telephone montre ce qu'il a garde. Ouvre une fenetre privee, ou vide le cache
du site. Si la fenetre privee montre la nouvelle page, il n'y a rien d'autre
a faire.

**2. Le deploiement n'a pas eu lieu.**
Sur vercel.com, projet du site, onglet **Deployments**. Il doit y avoir une
ligne recente avec le numero du dernier commit. Trois cas :

- *aucune ligne recente* : Vercel n'ecoute pas la bonne branche.
  ⚠️ **ATTENTION, CE DOCUMENT SE CONTREDIT ICI.** Le haut de la page dit —
  et dit l'avoir CONSTATE en clonant — que `islampasapas.fr` sert le depot
  **`Islampasapas`**, branche `main`, et que « le deploiement est automatique
  quand on pousse sur Islampasapas ». Cette ligne-ci disait l'inverse :
  qu'il faut regler la Production Branch sur
  `claude/islamic-learning-platform-l7o7to`, une branche de l'AUTRE depot.
  C'est exactement la croyance que la section « Ce que je croyais, et qui
  etait faux » raconte avoir coute une heure de recherche.
  Le reglage Vercel reel n'est pas verifiable depuis l'environnement des
  rondes : **non verifie**. Si le site ne se met pas a jour, regarde d'abord
  le projet qui ecoute `Islampasapas`.
- *ligne en rouge (Error)* : ouvre-la, le journal dit ce qui a echoue.
- *ligne « Skipped »* : le reglage **Ignored Build Step** annule la
  construction. Il doit etre vide, ou rendre `exit 1` pour construire.

**3. Le domaine ne pointe plus sur Vercel.**
Rare, mais deja arrive : `islampasapas.fr` doit resoudre vers Vercel
(`216.198.79.1`), pas vers la page vide d'OVH (`213.186.33.5`).

---

## Ce qu'il ne faut jamais supprimer

- `google460d2c815736f50e.html` — la cle de Search Console. Sans elle, la
  propriete se devalide et on perd les mesures.
- `vercel.json` — sans lui, Vercel construit le mauvais projet.
- `.vercelignore` — sans lui, les cinq megaoctets de donnees brutes du Coran
  dans `outils/` partent en ligne pour rien.

---

## L'etat du site — au 29 octobre 2026

> Ce qui suit remplace un paragraphe du 21 aout qui disait « une section
> remplie sur douze, 604 questions ». Il avait deux mois et il etait faux.
> Les chiffres du 20 octobre ont ete recomptes le 29.

Compte dans les banques ce soir :

| | |
|---|---|
| sections remplies | **11 sur 12** (`La vie du Prophete` est encore vide) |
| questions sourcees | **2 658** |
| lecons de sourate | **38** — Al-Fatiha, et le juz Amma complet (78 a 114) |
| adresses au sitemap | 53 |

**L'objectif des mille deux cents questions est depasse** : il y en a 2 658.

> **Pourquoi le nombre a BAISSE de 2 701 a 2 658.** Trois mots du lexique ont
> ete retires le 26 octobre, et leurs cartes avec : ils publiaient le sens de
> leur voisin. Cinq cartes disaient que إِنس — *les hommes*, le mot que le
> Coran met en face des djinns — signifie « djinns ». Un nombre qui baisse
> parce qu'on a retire du faux est une bonne nouvelle, pas une perte.

### Mais le plancher par section ne l'est pas

Le cahier demande **cent questions minimum par section**. Quatre sections
sont en dessous, et elles sont EN LIGNE, cliquables :

| section | questions |
|---|---|
| Les piliers de la foi | 89 |
| Le comportement | **11** |
| Le jeune et le Ramadan | **8** |
| Le pelerinage | **7** |

Rien ne ment : la couverture de chaque section annonce son nombre exact, et
l'ecran de reglages plafonne la partie a ce qu'elle contient. Mais une
section de sept questions ouverte au public n'est pas ce que le cahier
prevoyait. **C'est une decision d'editeur** : les ouvrir quand meme, ou les
refermer jusqu'a cent. Je ne la prends pas.

### Mesure du 21 octobre : deux d'entre elles ne POURRONT jamais atteindre cent

Le 20 octobre j'ai pose la question sans la mesurer. Mesure faite.

**La methode est celle du projet, pas une autre.** `faire-themes.py` definit un
domaine par des mots ARABES et des mots FRANCAIS, et un verset n'y entre que
si **les deux** le designent. C'est la lecon de la section des prophetes :
cherche sur l'arabe seul, « صالح » ramenait les versets sur les bonnes
oeuvres. Les deux jeux de donnees se controlent l'un l'autre. J'ai reutilise
sa fonction `versets_du_theme`, et sa fonction `couper` pour savoir quels
versets admettent la deuxieme forme de question.

Le site n'a que deux formes de carte tirees d'un verset : **A**, on montre
l'arabe et on demande la traduction du sens ; **B**, on montre le debut de la
traduction et on demande la suite. La forme A marche sur tout verset, la
forme B seulement sur ceux qui se coupent a une virgule sans devenir une
devinette. Le plafond d'un domaine est donc : *versets + versets coupables*.

| section | aujourd'hui | versets du domaine dans TOUT le Coran | dont forme B | plafond A+B | plafond total | plancher |
|---|---|---|---|---|---|---|
| Les piliers de la foi | 89 | 53 | 47 | 100 | **106** | 100 |
| Le comportement | 11 | 57 | 47 | 104 | **115** | 100 |
| Le jeune et le Ramadan | 8 | 9 | 9 | 18 | **26** | 100 |
| Le pelerinage | 7 | 18 | 16 | 34 | **41** | 100 |

Lecture, et elle coupe la decision en deux :

- **Le jeune et le Ramadan (26) et Le pelerinage (41) ne peuvent pas
  atteindre cent.** Pas « ne l'ont pas encore atteint » : ne peuvent pas. Il
  y a neuf versets sur le jeune et dix-huit sur le pelerinage dans le Coran
  entier. Aucun travail n'en fera cent. Le choix n'est donc pas « les remplir
  ou les refermer » : c'est **les garder petites, ou les refermer**.
- **Les piliers de la foi (106) et Le comportement (115) peuvent passer
  cent** — mais en CHANGEANT DE NATURE. Leurs cartes actuelles sont des
  questions de pratique ; les cent qui manquent seraient des cartes de
  reconnaissance de verset. « Le comportement » passerait de onze questions
  sur la conduite a onze questions sur la conduite plus cent exercices de
  traduction. C'est encore une decision d'editeur, et elle n'est pas la meme
  que la premiere.

**Ce que ce compte EST et N'EST PAS.** C'est une borne superieure sur la
matiere documentaire. Les quatre themes deja generes ecrivent chacun une
quinzaine de cartes de MOINS que leurs deux formes autorisent — les piliers
83 sur 100 possibles, la priere 115 sur 133, la zakat 111 sur 127, les
invocations 176 sur 193. Le plafond reel est donc un peu plus bas que le
chiffre du tableau, jamais plus haut.

**Et les quatre themes generes sont a leur plafond de versets** : ils ont
utilise 53 versets sur 53, 70 sur 72, 65 sur 67, 105 sur 105. **La voie
coranique est epuisee.** Ce qui reste a prendre, ce sont des cartes sur des
versets deja pris, pas des versets neufs.

> **Ce qui bouge dans ce tableau, et il faut le dire.** Les listes de mots
> des trois sections ecrites a la main sont de moi, posees ce soir ; celles
> des quatre themes generes sont dans `faire-themes.py` depuis aout. Pour
> « pelerinage » et « jeune » le domaine se nomme — Hajj, Omra, Kaaba,
> jeune, Ramadan — et le chiffre est solide : l'arabe seul ramenait 90 et 12
> versets, le francais seul 20 et 18, les deux 18 et 9. Pour
> « comportement » le domaine ne se nomme pas : **le francais seul ramene
> 349 versets, l'arabe seul 70, les deux 57.** Un comptage a une seule
> langue y gonfle le resultat de six fois. Le 57 depend donc de ma liste —
> parents, medire, mensonge, justice, depot, engagement, balance. Elargie,
> elle ramene « n'importe quoi », ce que `faire-themes.py` dit en toutes
> lettres. **Le plafond du comportement est editorial, pas documentaire.**

### Ce qui leverait le plancher, et pourquoi c'est ferme

Ces quatre sections sont exactement celles qui devaient reposer sur des
**hadiths**. Le depot en contient trois recueils en francais, et je les ai
regardes ce soir au lieu de recopier ce qu'on en dit depuis aout :

| `outils/coran/` | hadiths |
|---|---|
| `h-fra-bukhari.json` | 7 589 |
| `h-fra-muslim.json` | 7 563 |
| `h-fra-abudawud.json` | 5 274 |
| **total** | **20 426** |

Vingt mille hadiths en francais dorment dans le depot. Et **aucun n'est
citable**, pour une raison qui se mesure :

- leurs metadonnees ne contiennent que `name`, `sections`,
  `section_details` — **aucun champ ne nomme un traducteur**, nulle part ;
- leurs titres de chapitres sont **mot pour mot ceux du fichier anglais** :
  « Revelation », « Belief », « Knowledge ». Les textes ont ete traduits, les
  titres non.

C'est la preuve mesurable d'une traduction de traduction, sans traducteur
nomme. Publier cela comme « Sahih al-Boukhari n° X » donnerait pour sure une
parole du Prophete deux fois eloignee de l'arabe. La regle du site est
claire : en cas de doute sur une source, on ne publie pas.

**La seule chose qui ouvrirait ces quatre sections est donc un achat ou une
autorisation, pas du travail de nuit** : une traduction francaise de hadiths
avec un traducteur nomme. C'est la premiere fois que le blocage se formule
comme quelque chose que tu peux lever.

**Et la tentation est maintenant tenue par un controle.** Rien n'empechait un
generateur presse de citer « Boukhari n° 1513 » sous une carte :
`faire-05-prophetes.py` l'interdisait dans un commentaire, et un commentaire
n'arrete personne. `controler-questions.py` cherche desormais treize noms de
recueils dans les six champs de chaque carte, et huit formes d'attribution
dans la voix du site. Mesure du 21 octobre : **2 701 sources, 21 488 champs,
zero motif**.

---

## Ce qui attend d'etre publie — au 29 octobre 2026

**Derniere publication : le 29 septembre** (repere de version `386566f`,
commit `59e67ae`). Trente rondes depuis, aucune publiee : la consigne est que
tu promeus toi-meme.

> ⚠️ **CE QUI ATTEND N'EST PLUS SEULEMENT DU MIEUX.** Les rondes du 23, du
> 26, du 27 et du 28 octobre ont retire du site des affirmations fausses :
> une page qui annoncait des hadiths sources alors qu'il n'y en a aucun,
> cinq cartes qui donnaient « djinns » pour le sens de *les hommes*, une
> explication qui donnait « terre » pour *la corruption*, vingt mots dont la
> forme publiee n'etait pas celle qu'Hamidullah ecrit, et quatre cartes qui
> donnaient tort a une bonne reponse. **Tout cela est encore EN LIGNE** : la
> reparation est sur la branche, pas en production.

Ce qu'un `publier.py` enverrait, compte entre `59e67ae` et la branche :

| | fichiers |
|---|---|
| pages (`.html`) | 53 |
| donnees (`data/`) | 12 |
| JavaScript | 4 |
| CSS | 2 |
| sitemap | 1 |
| **total en ligne** | **72** |
| restent au depot (`outils/`, `.md`) | 51 |

Aucun fichier ajoute, aucun supprime : les 72 sont des modifications.

Les 39 controles sont verts. Le detail de ce que chaque ronde a change est
dans les messages de commit, et le resume dans `docs/POUR-LE-CARNET.md`.

### `publier.py` refuse maintenant un arbre rouge

Jusqu'au 29 octobre, l'outil garantissait **une** chose : que les deux copies
se recoupent fichier par fichier. Il ne garantissait pas que ce qu'on recopie
soit juste — on pouvait publier un arbre dont les controles echouent. Vu ce
que les quatre dernieres rondes ont trouve en ligne, c'etait le dernier trou
de la chaine.

Il lance donc d'abord les **six controles qui n'ont besoin que du disque** —
`controler-questions`, `controler-lecons`, `controler-liens`,
`controler-index`, `controler-allege`, `peser` — et s'arrete au premier qui
refuse, en montrant ses dernieres lignes.

Les trois autres — `controler-sections`, `controler-redirections`,
`controler-sitemap` — interrogent le serveur local. Une publication ne doit
pas dependre d'un serveur allume : **l'outil les NOMME comme non lances** au
lieu de laisser croire qu'il a tout verifie. Pour les passer aussi :

```
python3 outils/servir.py 8899 &
cd outils && python3 controler-sections.py && python3 controler-redirections.py \
  && python3 controler-sitemap.py
```

On peut essayer l'outil sans toucher au depot servi en lui passant un autre
clone en argument : `python3 outils/publier.py /un/clone/a/moi`.

`data/lexique.json` a ete retire de `data/` le 19 octobre : il ne servait
qu'aux generateurs. Il disparaitra bien de la production, parce que
`publier.py` VIDE le clone avant de recopier — il ne se contente pas
d'ecraser.
