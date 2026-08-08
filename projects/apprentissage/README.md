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
| `lecon-al-fatiha.html` | Lecon 1 : sourate Al-Fatiha verset par verset (7 versets) |
| `lecon-invocations-matin.html` | Lecon 2 : trois invocations pour commencer la journee |
| `chemin.html` | La progression : compteur, calendrier des jours, parcours, revisions a venir |
| `style.css` | Toute la mise en forme (charte de la famille) |
| `app.js` | Catalogue, niveau, progression, revisions, et le lecteur de lecon commun |
| `outils/faire-apercu.py` | Genere `apercu.html`, un apercu en un seul fichier (pour relecture) |
| `apercu.html` | **Fichier genere.** Ne pas modifier a la main, relancer le script |

Deux lecons publiees : il y a donc de quoi revenir le lendemain, ce qui est
tout l'objet du site. Le lecteur de lecon (`ippDemarrerLecon`) est ecrit une
seule fois dans `app.js` et partage par toutes les lecons.

## Les trois questions d'accueil

A la premiere visite, l'accueil pose trois questions — la priere, Al-Fatiha,
les sourates memorisees — puis demarre au bon endroit. Quinze secondes,
aucun compte, et on peut passer a tout moment. Le resultat est garde sous la
cle `ipp.niveau.v1`.

Le principe : **ne pas faire apprendre a quelqu'un ce qu'il sait deja.** Un
converti d'hier et quelqu'un qui prie depuis vingt ans n'ont pas besoin de la
meme premiere lecon.

Ce n'est pas decoratif, cela change vraiment ce qui est propose :
`ordreLecons()` recule Al-Fatiha pour qui la connait deja par coeur, et
l'accueil dit pourquoi (« Al-Fatiha passe apres : tu la connais deja »).

Trois regles de ton, a ne pas casser en ajoutant des questions :

- **aucune reponse n'est mauvaise.** Les trois options ont le meme poids
  visuel, il n'y a ni score, ni barre de niveau, ni felicitations ;
- **celui qui repond « non » partout est accueilli, pas juge** — c'est
  peut-etre un converti d'hier, et c'est exactement pour lui que le site
  existe ;
- **on reste honnete avec celui qui est en avance.** Plutot que de lui servir
  une lecon qu'il connait, on lui dit qu'il n'y a que deux lecons aujourd'hui.

Le point de depart est rappele sur « Mon chemin », avec un lien pour le
refaire quand le niveau change.

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
