# Islam pas a pas — premiere version

Plateforme pour apprendre l'islam etape par etape. Cinquieme site de la famille.
Une lecon courte par jour, une progression visible, des revisions espacees.

**Ce n'est pas un site de questions-reponses** (halalgpt.fr le fait deja).
C'est un parcours : on avance, on revient, on sait ou on en est.

---

## Comment parler a l'agent responsable

La communication ne marche que **dans un sens** : lui vers moi. Une session
declenchee par un de ses messages tourne sans les outils de la plateforme, donc
aucun canal direct n'est possible — sept tentatives perdues avant de le savoir.

Le protocole officiel est la **boite aux lettres** : on ecrit dans
`POUR-LE-RESPONSABLE.md`, on commit, on pousse. Il lit la branche a chaque
controle. Les entrees les plus recentes en haut, avec une date et un mot-cle
(BLOQUE / QUESTION / INFO / LIVRE).

En cas d'urgence bloquante, le dire aussi a Mohamed dans la conversation : il
relaie instantanement. **Ne plus jamais tenter de canal direct.**

## Statut

Version de travail, hebergee provisoirement dans le repo VOYAGESHALAL sur la branche
`claude/islamic-learning-platform-l7o7to`, dans ce dossier isole.

- **Aucun fichier existant du repo n'est modifie.** Ce dossier est autonome.
- **Ne jamais fusionner cette branche dans `main`** : `main` deploie voyageshalal.fr
  et gohalaltravel.com.
- Le repo definitif sera cree par Mohamed. Le demenagement se fera par simple
  copie de ce dossier : il n'y a rien a reecrire.

## Contenu du dossier

| Fichier | Role |
| --- | --- |
| `index.html` | Ecran d'accueil — les trois questions a la 1re visite, puis « Aujourd'hui » |
| `lecon-al-fatiha.html` | Lecon 1 : Al-Fatiha verset par verset, avec la prononciation |
| `lecon-invocations-matin.html` | Lecon 2 : trois invocations pour commencer la journee |
| `lecon-six-piliers-foi.html` | Lecon 3 : les six piliers de la foi (hadith de Jibril) |
| `lecon-priere-gestes.html` | Lecon 4 : les gestes de la priere, dans l'ordre |
| `lecon-alphabet-arabe.html` | Lecon 5 : les 28 lettres de l'alphabet arabe |
| `parcours.html` | Les lecons pretes, une carte par lecon (rien d'annonce) |
| `lecon-prophetes-coran.html` | Lecon 6 : les 25 prophetes nommes dans le Coran |
| `sourates.html` | Repere : la liste complete des 114 sourates |
| `POUR-LE-RESPONSABLE.md` | **Boite aux lettres** vers l'agent responsable |
| `chemin.html` | La progression : compteur, calendrier des jours, les lecons, revisions a venir |
| `style.css` | Toute la mise en forme (charte de la famille) |
| `app.js` | Catalogue, niveau, progression, revisions, et le lecteur de lecon commun |
| `robots.txt` | Ce que les robots peuvent lire, et l'adresse du sitemap |
| `sitemap.xml` | Les pages de contenu, pour Google |
| `partage.png` | L'image qui s'affiche quand on partage un lien (1200x630) |
| `outils/faire-apercu.py` | Genere `apercu.html`, un apercu en un seul fichier (pour relecture) |
| `apercu.html` | **Fichier genere.** Ne pas modifier a la main, relancer le script |

Six lecons publiees : il y a de quoi revenir plusieurs jours de suite, ce qui
est tout l'objet du site.

## La regle : on n'affiche que ce qui existe

`parcours.html` ne montre que des lecons **ecrites, relues et sourcees**. Une
carte par lecon, un lien qui ouvre vraiment quelque chose. Aucune case
« en preparation ».

### Ce qu'il y avait avant, et pourquoi ca a change

Le site a d'abord publie la carte complete : **18 parcours dans 5 familles**,
dont douze vides marques « En preparation ». Le raisonnement d'alors n'etait
pas absurde — annoncer valait mieux que fabriquer des dizaines de pages
faibles — mais il ratait le point&nbsp;: celui qui ouvre la page compte dix-huit
et en trouve six. C'est une promesse a credit, et elle se paie a la premiere
visite.

**Mieux vaut un site qui tient six promesses qu'un site qui en affiche
dix-huit et n'en tient que six.** Une case en moins ne coute rien ; une case
vide coute la confiance.

En pratique&nbsp;:

- `PARCOURS` (dans `app.js`) ne contient plus que les themes **qui ont au moins
  une lecon**. Il sert d'etiquette sous le titre d'une lecon, pas de vitrine.
- Les douze themes retires attendent dans `NOTES-lecons-a-venir.md`, avec pour
  chacun une note de preparation. Un theme y revient dans `PARCOURS` le jour ou
  sa premiere lecon est ecrite, **pas avant**.
- La seule promesse d'avenir affichee est une phrase&nbsp;: « De nouvelles lecons
  chaque semaine. » Ca suffit, et c'est tenable.
- Les chiffres de la page (lecons, minutes, choses a apprendre) sont
  **calcules depuis le catalogue**, jamais ecrits a la main. Deux faux chiffres
  se sont deja glisses dans ce site en les ecrivant a la main.

La notion de « famille » (la foi, la priere, le Coran, la langue arabe, le
quotidien) a disparu du code&nbsp;: cinq titres de famille pour six lecons, c'etait
du rangement pour du rangement. Elle reviendra quand il y aura assez de lecons
pour que grouper aide a lire.

### Absent volontairement

**La zakat et tout ce qui touche a l'argent.** Decision de Mohamed, sa
responsabilite est en jeu. Ne pas l'ajouter a `PARCOURS` sans son accord
explicite, meme si un theme semble le reclamer, et ne pas le mettre non plus
dans la file de `NOTES-lecons-a-venir.md` en attendant.

### Deux vitesses assumees

Tout le contenu ne porte pas le meme risque, et cela change le rythme
possible :

- **le contenu juridique** (le jeune, le pelerinage, la purification, le
  comportement) demande une verification lente. Une regle fausse engage
  Mohamed. Ces lecons ouvriront lentement ;
- **le contenu factuel et linguistique** (l'alphabet, les prophetes nommes
  dans le Coran, l'index des sourates, les mots frequents) ne comporte pas ce
  risque&nbsp;: ce sont des faits verifiables, pas des avis. Ces lecons
  peuvent ouvrir vite.

C'est par la qu'on etoffe le site sans rien sacrifier. La lecon sur l'alphabet
en est le premier exemple&nbsp;: 28 lettres, aucun avis religieux, rien a
trancher.

**Le rythme est desormais fixe : une nouvelle lecon tous les deux jours, jamais
plus.** L'objectif n'est pas un nombre de lecons, c'est que Mohamed ouvre le
site sept jours d'affilee.

### Les pages de repere

Mohamed veut un site **complet des le lancement**, et il l'a confirme. C'est sa
decision, elle est appliquee. La voie qui permet du volume sans jamais engager
sa responsabilite, ce sont les **pages de repere** : du contenu factuel,
verifiable, sans aucun avis religieux.

`sourates.html` en est la premiere : les 114 sourates dans l'ordre, avec le
numero, le nom arabe et le nom transcrit. C'est utile tous les jours, c'est
tres recherche sur Google, et il n'y a rien a trancher.

Deux precautions y sont ecrites au lecteur : sept sourates portent **deux noms**
selon les editions (ils sont signales, pas caches), et les transcriptions en
lettres latines varient d'un ouvrage a l'autre.

Prochaines pages de repere possibles, meme logique : les prophetes nommes dans
le Coran, les mots arabes les plus frequents, les formes des lettres selon leur
place dans le mot.

### Une formulation a ne pas reintroduire

La fin de lecon disait « N enseignements, chacun avec sa source ». C'est devenu
faux avec l'alphabet&nbsp;: une lettre n'est pas un texte rapporte. La phrase
dit maintenant « N choses apprises ». Les sources restent affichees carte par
carte, la ou elles existent vraiment — ne pas remettre une promesse globale
que tout le contenu ne peut pas tenir.

### Si la carte change

`PARCOURS` et `CATALOGUE` (dans `app.js`) et les cartes de `parcours.html`
doivent rester d'accord. La marche a suivre est listee plus bas, dans
« Ajouter une lecon ».

## Les trois questions d'accueil

A la premiere visite, l'accueil pose trois questions — la priere, Al-Fatiha,
les sourates memorisees — puis demarre au bon endroit. Quinze secondes,
aucun compte, et on peut passer a tout moment. Le resultat est garde sous la
cle `ipp.niveau.v1`.

Le principe : **ne pas faire apprendre a quelqu'un ce qu'il sait deja.** Un
converti d'hier et quelqu'un qui prie depuis vingt ans n'ont pas besoin de la
meme premiere lecon.

Ce n'est pas decoratif, cela change vraiment la premiere lecon servie.
`ordreLecons()` applique deux regles, verifiees par test :

| Reponses | Premiere lecon |
| --- | --- |
| Ne prie pas encore | Les six piliers de la foi, puis les gestes de la priere — commencer par une sourate serait commencer par le milieu |
| Prie, ne sait pas Al-Fatiha | Al-Fatiha, verset par verset |
| Connait Al-Fatiha par coeur | Les invocations ; Al-Fatiha passe en dernier, et l'accueil dit pourquoi |

Les priorites sont des poids dans `ordreLecons()` (negatif = servie plus tot).
Ajouter une regle, c'est ajouter une ligne.

Trois regles de ton, a ne pas casser en ajoutant des questions :

- **aucune reponse n'est mauvaise.** Les trois options ont le meme poids
  visuel, il n'y a ni score, ni barre de niveau, ni felicitations ;
- **celui qui repond « non » partout est accueilli, pas juge** — c'est
  peut-etre un converti d'hier, et c'est exactement pour lui que le site
  existe ;
- **on reste honnete avec celui qui est en avance.** Plutot que de lui servir
  une lecon qu'il connait, on lui dit combien il y en a reellement. Le nombre
  est calcule depuis le catalogue (`{n}` dans `IPP_BILANS`), jamais ecrit en
  dur : un chiffre fige devient faux des la lecon suivante.

Le point de depart est rappele sur « Mon chemin », avec un lien pour le
refaire quand le niveau change.

## La prononciation

Lire Al-Fatiha en lettres francaises seulement, c'est la moitie du produit :
sans savoir comment ca sonne, on n'ose pas reciter. Chaque verset est donc
decoupe en syllabes, chacune dans sa propre puce, et une carte de reference
explique les huit lettres qui posent probleme a un francophone.

Marquees `<b class="dur">` (en dore, soulignees) : `ayn`, `ha`, `qaf`, `sad`,
`ta`, `dad`, `ghayn`, `dhal`. On ne marque **que** ce qui n'existe pas en
francais ou qui trompe le lecteur francais — le `h` doux de la lettre `ha`
(ه) reste non marque, et la carte le precise.

Deux regles ici :

- **le texte ne remplace pas l'oreille**, et la lecon le dit clairement :
  il faut se faire corriger par quelqu'un qui recite bien ;
- **aucun fichier audio** ne sera ajoute tant que Mohamed n'a pas la licence
  ecrite d'un enregistrement. Une recitation prise en ligne sans licence
  claire engage sa responsabilite. Dans le doute, on s'abstient.

Al-Fatiha passe donc de 10 a 11 cartes, et de 5 a 6 minutes annoncees.

## Le rendez-vous quotidien

Une lecon « quand j'aurai le temps » est une lecon jamais faite. A la fin de
sa premiere lecon — le bon moment, juste apres l'effort — on demande un repere
dans la journee : apres le Fajr, dans la matinee, apres le Dhuhr, apres le
Maghreb, ou avant de dormir. Garde sous la cle `ipp.moment.v1`.

L'accueil parle alors en fonction :

| Situation | Message |
| --- | --- |
| Deja venu aujourd'hui | « Tu es venu aujourd'hui. Prochain rendez-vous : demain apres le Fajr. » |
| C'est le moment | « **C'est ton moment.** » (le seul cas ou l'on hausse le ton) |
| Avant le moment | « Ton rendez-vous : apres le Fajr. » |
| Moment passe | « Le moment est passe, mais la journee n'est pas finie. » |

Le dernier cas est le plus important : **un moment manque n'est jamais
presente comme un echec.** Meme regle de ton que les trois questions.

### Ce site ne calcule PAS les horaires de priere

C'est ecrit noir sur blanc a l'utilisateur, et c'est volontaire. Les horaires
dependent du lieu et de la date : les inventer serait une faute. L'utilisateur
choisit **un repere**, rien de plus. Aucune heure de priere n'est jamais
affichee, et l'on renvoie vers
[voyageshalal.fr/horaires-priere](https://voyageshalal.fr/horaires-priere)
pour les horaires reels.

Les plages d'heures dans `MOMENTS` (`de` / `a`) ne servent **qu'a choisir le
ton du message**. La plage « avant de dormir » passe minuit (21h -> 2h) et
`positionMoment()` gere ce cas.

Le rendez-vous est rappele sur « Mon chemin », avec un bouton pour le changer.

## Le test de fin de lecon

Mohamed voulait le site « plus addictif ». Le vrai probleme n'etait pas la
recompense, c'etait la **passivite** : lire onze cartes en appuyant sur
« Suivant » ne demande aucun effort, donc ne laisse aucune trace.

Chaque lecon peut donc finir par des cartes `data-quiz`. Le lecteur commun les
detecte, **bloque le bouton « Suivant » tant qu'on n'a pas repondu**, melange
les reponses a chaque affichage (sinon on apprend la position, pas le contenu),
et affiche le score en fin de lecon.

**Regle de ton, a ne pas casser** : jamais punitif. Pas de vies perdues, pas de
score qui humilie. Une mauvaise reponse allume la bonne en dore et explique
pourquoi, via l'attribut `data-explique` de la carte.

**Les questions sont entrelacees, pas groupees a la fin.** C'etait mon erreur
au premier essai : trois questions en fin de lecon demandaient neuf appuis sur
« Suivant » pour etre atteintes. Mohamed a ouvert le site et n'a vu aucune
difference — il avait raison, de la ou il etait il n'y en avait aucune.

Chaque question est donc placee **juste apres le contenu qu'elle verifie**. Sur
Al-Fatiha, la premiere arrive apres **trois** appuis. La lecon devient un
aller-retour au lieu d'un diaporama, et cela se sent tout de suite.

Regle a retenir en ajoutant une lecon : **une question dans les trois premieres
cartes.** Un mecanisme qu'on ne rencontre qu'a la fin n'existe pas.

Deja en place sur Al-Fatiha (questions en positions 4, 9, 11) et sur les
prophetes (5, 8, 10).

## Le son

**Aucun fichier audio n'est livre**, et c'est volontaire : la regle de l'empire
est qu'aucune recitation ne soit publiee sans licence ecrite. Une chaine qui se
declare « sans copyright » n'a aucun droit de liberer la recitation d'un autre.

**Ce que le site dit au lecteur, en attendant** — dans la lecon sur Al-Fatiha,
a l'endroit ou l'on parle de prononciation : « pour entendre la recitation,
ouvre ton application de Coran habituelle et suis les syllabes en meme temps ».
C'est honnete, c'est utile tout de suite, et ca ne promet rien.

**Le mecanisme reste pret** dans `app.js` : `ippBrancherAudio()` cherche un
attribut `data-audio` sur un bloc, verifie par une requete HEAD si
`audio/<valeur>.mp3` existe, et n'ajoute le bouton « Ecouter » que si le fichier
repond. Aujourd'hui **aucune lecon ne porte cet attribut** — il n'y a pas de
fichier a jouer, donc rien a brancher. Le jour ou un fichier licencie arrive, il
suffit de poser `data-audio` sur les blocs concernes.

Et une reserve qui reste : une **voix de synthese** qui recite le Coran n'est
pas une question de droits mais une question religieuse. Elle n'est pas tranchee
ici, et ce n'est pas a moi de la trancher.

**Le sujet est clos et hors du chemin critique.** Ne pas repartir en chasse de
fichiers audio.

## Technique

HTML + CSS + JavaScript purs. **Aucun build, aucune dependance, aucun serveur.**
Le dossier se deploie tel quel sur Vercel ou Netlify (glisser-deposer suffit).

Pour le voir en local :

```
cd projects/apprentissage
python3 -m http.server 8899
# puis ouvrir http://127.0.0.1:8899
```

La progression est stockee dans le `localStorage` du navigateur, sous la cle
`ipp.progression.v1`. Rien n'est envoye nulle part : pas de compte, pas de serveur,
pas de traceur.

Le contenu des lecons est ecrit **en dur dans le HTML**. Sans JavaScript, la lecon
entiere reste lisible d'un seul tenant — c'est ce que Google indexe. Avec JavaScript,
elle se transforme en parcours carte par carte.

### Ajouter une lecon

Cinq endroits, dans cet ordre :

1. Creer `lecon-<identifiant>.html` en copiant la structure de `lecon-al-fatiha.html`
   (chaque `<section class="etape" data-etape="N">` est une carte, la derniere
   porte la classe `fin`). **Une question dans les trois premieres cartes** :
   c'est la que se joue la difference entre apprendre et lire.
2. Ajouter l'entree dans `CATALOGUE` (`app.js`) : `acquis` = nombre de choses
   que la lecon apporte au compteur ; `publiee: false` tant que le texte n'est
   pas verifie. Si son theme n'est pas encore dans `PARCOURS`, l'y ajouter et le
   retirer de `NOTES-lecons-a-venir.md`.
3. Ajouter sa carte dans `parcours.html` (duree, resume, lien).
4. Ajouter son URL dans `sitemap.xml`.
5. Ajouter sa vue dans la liste `VUES` de `outils/faire-apercu.py`, puis
   relancer le script.

**On n'affiche jamais un contenu qui n'existe pas.** Ni carte vide, ni theme
« en preparation », ni compteur ecrit a la main.

## Referencement

Le nom de domaine est **islampasapas.fr** (valide par Mohamed et l'agent
responsable). A ecrire toujours sans accent : l'accent de « pas a pas »
n'existe pas dans une adresse internet, et il ne faut jamais laisser croire
le contraire.

Ce que Google doit voir, et ce qu'il ne doit pas voir :

| Page | Etat | Pourquoi |
| --- | --- | --- |
| `index.html` | indexee, canonical `/` | l'accueil |
| les six `lecon-*.html` | indexees | pages de contenu |
| `parcours.html` | indexee | la liste des lecons pretes |
| `sourates.html` | indexee | page de repere, tres recherchee |
| `chemin.html` | **noindex, follow** | ecran personnel, vide pour un visiteur |
| `apercu.html` | **noindex** + bloque dans robots.txt | recopie tout le site : contenu duplique |
| `apercu-hors-ligne.html` | **noindex** + bloque dans robots.txt | meme raison |

Le cas `apercu.html` etait un vrai piege : ce fichier genere contient
l'integralite des lecons. Indexe, il aurait fait concurrence aux vraies pages
sur leur propre contenu.

`chemin.html` est **volontairement laisse accessible** aux robots dans
`robots.txt`. Le bloquer empecherait de lire sa balise `noindex`, et Google
pourrait le garder dans son index sans jamais pouvoir constater qu'il doit
l'en retirer. On bloque l'indexation, pas la lecture.

Chaque page de contenu porte aussi ses balises de partage (Open Graph), avec
`partage.png` en visuel.

## Le cas de la priere

C'est le sujet le plus delicat du site, parce que c'est celui ou les ecoles
divergent le plus. La lecon 4 le traite ainsi :

- **on enseigne l'ordre des gestes**, qui fait l'unanimite, tire d'un seul
  hadith (celui de l'homme qui priait mal, al-Boukhari et Mouslim) ;
- **on liste les points de divergence** sur une carte a part : position des
  mains, lever les mains a chaque takbir, basmala a voix haute ou basse, facon
  de s'asseoir. Sans dire qui a raison ;
- **on ecrit que ce site ne peut pas apprendre a prier**. Le hadith dit
  « comme vous m'avez **vu** prier » : la priere s'apprend en regardant
  quelqu'un. C'est dit sur la premiere carte et repete en pied de page.

Le hadith dit aussi « recite ce que tu peux du Coran » quand un autre dit
« pas de priere sans la Fatiha ». La lecon **ne resume pas** le travail des
savants sur ce point : elle signale que les deux se rejoignent et renvoie.

## Regle editoriale — la plus importante

Enseigner la religion engage lourdement. Sur ce site :

- **chaque verset** est cite avec sa sourate et son numero ;
- **chaque hadith** avec son recueil, son numero et son rapporteur ;
- **aucun avis personnel**, aucune fatwa ;
- quand les ecoles divergent, on presente les avis **sans trancher** et on renvoie
  vers un savant (voir le verset 4 et le verset 7 de la lecon Al-Fatiha) ;
- **au moindre doute sur une source, on ne publie pas** ;
- **numeros de hadith** : on ne donne un numero que si l'on en est certain.
  Sinon on cite le recueil et le rapporteur, ce qui suffit a retrouver le hadith.
  La lecon 2 applique cette regle et l'explique au lecteur ;
- la lecon 2 ne cite que **al-Boukhari et Mouslim**, volontairement ;
- les traductions sont annoncees comme des traductions **du sens** ;
- **aucun contenu de finance islamique**, sur aucune page.

Texte coranique selon la lecture de Hafs d'apres 'Asim.

## Charte de la famille

Couleurs : nuit `#0b1a0f`, foret `#1b4332`, or `#c9a84c`, creme `#fdfaf3`.
Titres Playfair Display, texte DM Sans a 17px, arabe Scheherazade New.
Boutons d'au moins 56px de haut. Mobile d'abord, teste a 375px.

## Verifications faites

Testees au navigateur (Chromium pilote par Playwright, 375x780), sur les vrais
fichiers servis en HTTP :

**L'accueil, apres la simplification**

- **un seul bouton et une seule carte** dans le corps de l'accueil ;
- plus aucune trace des blocs retires (« A revoir aujourd'hui », « Tes
  parcours », « La regle de ce site » en titre) ;
- le bouton mesure 60px de haut (charte : 56 minimum) ;
- toujours un seul bouton le lendemain, quand la carte propose la lecon
  suivante.

**La page des lecons, apres le retrait des parcours vides**

- **zero occurrence de « En preparation »**, avec et sans JavaScript ;
- 7 cartes (6 lecons + la page de repere), 7 liens, et les 7 repondent en
  HTTP 200 ;
- les chiffres affiches sont calcules : 6 lecons, 39 minutes, 76 choses a
  apprendre.

**Le reste**

- les trois questions d'accueil s'imposent a la 1re visite, masquent le corps
  de la page pendant ce temps, et ne reviennent plus ensuite ;
- les **six** lecons se parcourent de bout en bout jusqu'a l'ecran de fin ;
- la serie apparait a 1 apres la premiere lecon ; la lecon faite est marquee
  « Deja faite » sur la page des lecons et sur « Mon chemin » ;
- la ou il y a une question, le bouton Suivant reste bloque tant qu'on n'a pas
  repondu ;
- **aucun debordement horizontal a 375px** sur les 9 pages ;
- sans JavaScript : l'accueil reste lisible (titre, resume, bouton, regle du
  site), les elements pilotes restent masques, les 7 cartes de la page des
  lecons sont dans le HTML, et `chemin.html` garde son `noindex,follow` ;
- aucune erreur JavaScript.

**Defaut connu, pas encore corrige** : quatre lecons sur six ne contiennent
**aucune question** (`priere-gestes`, `six-piliers-foi`, `invocations-matin`,
`alphabet-arabe`). Seules `al-fatiha` (question apres 3 tapes) et
`prophetes-coran` (apres 4) en ont. C'est note dans
`POUR-LE-RESPONSABLE.md`&nbsp;: la regle « une question dans les trois premieres
cartes » n'est donc pas tenue partout.

## Liens croises de la famille

Presents dans le pied de page de chaque page :
halalgpt.fr, halalcheck.fr, voyageshalal.fr, gohalaltravel.com.
