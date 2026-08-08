# Islam pas a pas — premiere version

Plateforme pour apprendre l'islam etape par etape. Cinquieme site de la famille.
Une lecon courte par jour, une progression visible, des revisions espacees.

**Ce n'est pas un site de questions-reponses** (halalgpt.fr le fait deja).
C'est un parcours : on avance, on revient, on sait ou on en est.

---

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
| `parcours.html` | Le programme complet : 18 parcours dans 5 familles |
| `chemin.html` | La progression : compteur, calendrier des jours, parcours, revisions a venir |
| `style.css` | Toute la mise en forme (charte de la famille) |
| `app.js` | Catalogue, niveau, progression, revisions, et le lecteur de lecon commun |
| `robots.txt` | Ce que les robots peuvent lire, et l'adresse du sitemap |
| `sitemap.xml` | Les pages de contenu, pour Google |
| `partage.png` | L'image qui s'affiche quand on partage un lien (1200x630) |
| `outils/faire-apercu.py` | Genere `apercu.html`, un apercu en un seul fichier (pour relecture) |
| `apercu.html` | **Fichier genere.** Ne pas modifier a la main, relancer le script |

Quatre lecons publiees, dans quatre parcours differents : il y a de quoi
revenir plusieurs jours de suite, ce qui est tout l'objet du site.

## La carte des themes, et pourquoi elle est publiee en entier

Mohamed veut que le site couvre **tous les themes de l'islam**. La carte
complete est donc publiee des maintenant : **18 parcours dans 5 familles**
(la foi, la priere, le Coran, la langue arabe, le quotidien), sur
`parcours.html`.

Quatre parcours sont ouverts, quatorze annonces. C'est un choix, et voici le
raisonnement, parce qu'il faudra le retenir :

- **La seule autre facon d'avoir une grosse offre tout de suite serait de
  fabriquer des dizaines de pages faibles.** Google sanctionne cela, et
  surtout un contenu religieux non verifie engage la responsabilite de
  Mohamed. Le volume se paierait deux fois.
- **Une carte annoncee est honnete. Une page vide par theme ne l'est pas.**
  Il n'y a donc qu'**une seule page** pour toute la carte, jamais 18 pages
  creuses : ce serait exactement le schema que Google appelle des pages
  satellites.
- **Chaque parcours dit ce qu'il enseignera.** C'est une information reelle,
  verifiable, pas du texte de remplissage. Un lecteur sait ou il met les
  pieds ; c'est la difference entre une promesse et une facade.
- Et la page l'explique elle-meme au lecteur, en clair.

L'accueil, lui, ne liste **que les parcours ouverts** plus un lien vers la
carte : dix-huit lignes « en preparation » sur l'ecran du matin seraient
decourageantes.

### Absent volontairement

**La zakat et tout ce qui touche a l'argent.** Decision de Mohamed, sa
responsabilite est en jeu. Ne pas l'ajouter a `PARCOURS` sans son accord
explicite, meme si un theme semble le reclamer.

### Si la carte change

`PARCOURS` (dans `app.js`) et `parcours.html` doivent rester synchronises.
Un test le verifie automatiquement et signale tout parcours present d'un cote
et pas de l'autre. Le lecteur de lecon (`ippDemarrerLecon`) est ecrit une
seule fois dans `app.js` et partage par toutes les lecons.

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

1. Creer `lecon-<identifiant>.html` en copiant la structure de `lecon-al-fatiha.html`
   (chaque `<section class="etape" data-etape="N">` est une carte).
2. Ajouter l'entree correspondante dans `CATALOGUE`, dans `app.js` :
   `acquis` = nombre d'enseignements que la lecon apporte au compteur ;
   `publiee: false` tant que le texte n'est pas verifie.

Les parcours sans lecon publiee s'affichent honnetement comme « Bientot ».
On n'affiche jamais un contenu qui n'existe pas.

## Referencement

Le nom de domaine est **islampasapas.fr** (valide par Mohamed et l'agent
responsable). A ecrire toujours sans accent : l'accent de « pas a pas »
n'existe pas dans une adresse internet, et il ne faut jamais laisser croire
le contraire.

Ce que Google doit voir, et ce qu'il ne doit pas voir :

| Page | Etat | Pourquoi |
| --- | --- | --- |
| `index.html` | indexee, canonical `/` | l'accueil |
| `lecon-al-fatiha.html` | indexee | page de contenu |
| `lecon-invocations-matin.html` | indexee | page de contenu |
| `lecon-six-piliers-foi.html` | indexee | page de contenu |
| `lecon-priere-gestes.html` | indexee | page de contenu |
| `chemin.html` | **noindex, follow** | ecran personnel, vide pour un visiteur |
| `apercu.html` | **noindex** + bloque dans robots.txt | recopie tout le site : contenu duplique |

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

Testees au navigateur (Chromium, 375x780) :

- aucun debordement horizontal sur les quatre pages ;
- les trois questions d'accueil : elles s'imposent a la 1re visite, ne
  reviennent plus ensuite, se passent d'un clic, et le profil « avance »
  recoit bien une autre lecon en premier ;
- les options de reponse mesurent 64px de haut (charte : 56 minimum) ;
- l'apercu en un seul fichier se comporte comme le site (navigation, lecons,
  progression, diagnostic) ;
- les deux lecons se parcourent de bout en bout, la progression est enregistree ;
- le lendemain, l'accueil propose bien la lecon suivante, puis annonce honnetement
  « Tu es a jour » quand il n'y a plus rien ;
- la revision est bien programmee a J+2, puis J+7, J+21, J+60 ;
- le calendrier place correctement le premier jour du mois sur le bon jour de semaine ;
- sans JavaScript : les 18 cartes des deux lecons et leurs 12 blocs de source
  restent lisibles d'un seul tenant (c'est ce que Google indexe) ;
- etats vides honnetes (rien a revoir, aucun jour rempli, parcours « Bientot ») ;
- aucune erreur JavaScript.

## Liens croises de la famille

Presents dans le pied de page de chaque page :
halalgpt.fr, halalcheck.fr, voyageshalal.fr, gohalaltravel.com.
