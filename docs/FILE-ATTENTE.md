# File d'attente — islampasapas.fr

Un element par ligne, avec **ce qui le justifie**. Une idee sans preuve n'entre
pas ici : elle attend dans `POUR-LE-RESPONSABLE.md`.

A chaque cycle : on prend le premier element qu'on peut finir, on le finit, on le
deplace en bas avec sa mesure. S'il reste moins de trois elements, le cycle sert
a auditer pour remplir la file — jamais a inventer un chantier.

**Mesure de succes, inchangee : Mohamed ouvre le site sept jours d'affilee.**

---

## A faire

> **Etat au cycle 5 : les trois elements ci-dessous sont tous bloques**, et pas
> par du travail — l'un attend un arbitrage, les deux autres attendent le
> deploiement. Le prochain cycle doit donc **auditer le site pour remplir la
> file**, pas forcer un de ces trois. Ne pas inventer de chantier : un element
> entre ici avec sa preuve mesuree.

1. **Le rappel quotidien n'existe pas, et il est bloque par une regle du site.**
   *Preuve :* c'est la piece la plus puissante de la liste du responsable, et
   elle est la seule non commencee. Le blocage est reel et non technique : une
   notification calee sur une heure de priere suppose de **connaitre** cette
   heure, alors que le site s'interdit de calculer les horaires (« les inventer
   serait une faute »). Trois issues sont posees dans la boite aux lettres ;
   celle que je recommande est de **demander l'heure a la personne**. S'y
   ajoutent deux verrous techniques : un service worker, et sur iPhone une
   notification n'existe que si le site a ete **ajoute a l'ecran d'accueil**.
   **N'entre pas en travaux avant arbitrage** — c'est une decision, pas un
   chantier.

2. **Aucune mesure d'entree, et un traceur est interdit ici.**
   *Preuve :* `grep -ril "gtag\|analytics\|plausible\|matomo\|umami"` sur toutes
   les pages et les trois fichiers JavaScript ne rend **rien**. Or le pied de
   page promet « Ta progression reste sur ton telephone. Aucun compte, aucun
   envoi » : je ne peux donc pas poser un script tiers sans casser une promesse
   affichee. La voie est une mesure **cote hebergeur** (statistiques du projet ou
   journaux). Bloque jusqu'au deploiement — question posee aux trois autres
   agents dans le brainstorm des passerelles.

3. **La recitation n'a jamais ete entendue par personne.**
   *Preuve :* `halalgpt.fr:443` et `cdn.islamic.network:443` sont refuses par la
   politique reseau de l'atelier (403 au CONNECT, journalise par le proxy,
   verifie trois fois). Le mecanisme est teste avec un recitateur simule — 7
   boutons, credit, bascule Husary, boucle de repetition — mais **quelle source
   repond reellement et en combien de temps reste inconnu**. `?son=diag` affiche
   la reponse sur un telephone avec du vrai reseau. Attend une capture d'ecran de
   Mohamed, ou le deploiement.

---

## Fait

- **Les six lecons finissent sur la meme deuxieme action, et c'est la mesure qui
  l'a choisie** *(10 aout, cycle 5)* — **avant : 4 lecons vers « Mon chemin », 2
  vers « Tout le programme ». Apres : 6 sur 6 vers « Mon chemin ».**
  L'incoherence etait le defaut consigne, mais uniformiser vers la mauvaise page
  aurait ete pire. Alors j'ai compte, apres avoir joue une lecon en entier, les
  signaux qui donnent une raison de revenir sur chaque destination :
  **`chemin.html` 7, `parcours.html` 1, l'accueil 2.** `chemin.html` porte la
  serie, le record, la collection, le calendrier, la prochaine revision, le
  rendez-vous et le chemin des lecons ; le catalogue ne porte que le chemin des
  lecons — et montre surtout qu'il n'y en a que six. Le catalogue reste atteignable
  depuis l'accueil et depuis la page des sourates : rien n'est devenu orphelin.
  *Deux fois, la mesure elle-meme etait fausse, et elle a failli me faire ecrire
  un chiffre faux.* Premier jet : l'accueil marquait **0** — mon selecteur de la
  serie n'existait que sur `chemin.html`. Deuxieme jet : l'anneau du jour
  marquait absent sur l'accueil — je comptais un signal comme present s'il
  contenait du **texte**, et l'anneau est un dessin. Corrige : visible **et**
  porteur de texte ou d'un dessin. Une comparaison ou chaque page est jugee avec
  le selecteur d'une autre ne compare rien.

- **Un lien sortant enfin pose la ou la question nait** *(10 aout, cycle 4)* —
  **avant : 48 liens sortants, 48 en pied de page, 0 dans le contenu des pages
  servies. Apres : 6 dans le contenu**, un par lecon, sur l'ecran de fin. 11
  controles au navigateur a 414x690, la lecon jouee en entier a chaque fois —
  **un lien qu'on n'atteint pas ne compte pas** :
  - **atteint dans les 6 lecons**, chacun avec **sa propre campagne**
    (`fin-lecon-<lecon>`), donc mesurable lecon par lecon ;
  - **16 px et la couleur d'un lien de contenu** (`#c9a84c`), pas les 14 px en
    gris `--texte-2` du pied — c'est ecrit dans le CSS du pied de page, la
    couleur du lien y est volontairement eteinte ;
  - **le rendez-vous quotidien et « Continuer » passent avant lui** (positions
    mesurees 4 < 5 < 7). La seule mesure du site est qu'on revienne, pas qu'on
    sorte : un lien sortant ne double jamais le retour.
  *Un defaut trouve et corrige en mesurant.* Pose dans le fil de la phrase, le
  lien ne faisait que **19 px de haut** — sous le minimum WCAG de 24, tres loin
  des 56 px de la charte. Un lien qu'un doigt rate n'est pas mieux place qu'un
  lien de pied de page. Il prend maintenant sa propre ligne : **51 px**. Le seuil
  du test est passe de 24 a 44.
  *Deux choix contraires a l'intitule de l'element, assumes.* (1) La phrase
  **reste aussi dans le pied**, avec `utm_medium=pied` : la prediction ecrite
  d'avance etait « le pied, proche de zero ». En la retirant, la prediction
  devenait intestable. Deux emplacements, deux campagnes, la comparaison se fera
  au deploiement. (2) **halalcheck.fr et gohalaltravel.com n'ont recu aucun lien
  de contenu** : aucun moment d'une lecon d'apprentissage ne rend utile un
  scanner de produits ou un guide de voyage. Leur inventer un moment, c'est
  refaire la decoration qu'on corrige ici.
  *Et un endroit ou j'ai refuse de le poser.* Les cartes `.prudence` disent
  « demande a un savant, **pas a un site** ». Y ajouter un lien vers une IA
  contredirait la phrase d'a cote, sur le seul point ou le site s'engage a ne pas
  trancher. Le bloc de fin garde donc les deux moities : la question personnelle
  vers halalgpt.fr, **et** le cas qui engage vers un savant — cette derniere
  ligne dans la meme taille que le reste, jamais plus petite.

- **La seance est devenue gagnable : une carte manquee revient** *(10 aout,
  cycle 3)* — **avant : 0 carte manquee ne revenait, une erreur restait une
  erreur, le score plafonnait a 2 sur 3. Apres : la carte revient 8 cartes plus
  loin et la seance se termine a 3 sur 3.** 18 controles au navigateur a
  414x690, trois scenes :
  1. *une question ratee* — la carte revient une fois, marquee « ON LA REVOIT »,
     **8 cartes plus loin** (jamais juste apres : une question posee juste apres
     sa reponse ne fait rien retenir, defaut corrige au cycle 2) ; fin affichee
     **« 3 sur 3, dont 1 rattrapee a la reprise »**.
  2. *les trois questions ratees deux fois* — **aucune carte jouee plus de deux
     fois** (maxi mesure : 2). Une carte qui reviendrait sans fin serait une
     cage, et une cage est une pression. La lecon va quand meme jusqu'a la fin,
     affiche « 0 sur 3 », et **aucun mot de reproche n'apparait a l'ecran** —
     verrou mecanique, pas consigne de ton.
  3. *tout juste du premier coup* — **11 cartes, 0 reprise, « 3 sur 3 — sans
     faute »** : le chemin d'origine est intact.
  *Deux choix de fond.* La barre de progression **ne recule jamais** (mesure :
  0 1 2 … 11, strictement croissante) — elle s'allonge d'un point quand une
  carte est remise, car voir une barre reculer, c'est perdre quelque chose. Et
  « sans faute » reste **reserve au premier essai** : le chiffre annonce l'etat
  final, donc une reprise reussie compte, mais elle est **dite**. Un compteur
  enonce le fait exact, il n'embellit pas.
  *Au passage, le lecteur de lecon ne compte plus, il joue une liste.* Le
  compteur `courante` qui montait de 1 a N ne pouvait pas revenir en arriere
  sans faire reculer la barre ; les cartes sont maintenant une liste ou l'on
  ajoute au bout. Aucune erreur JavaScript, aucun debordement a 414 px, les 6
  lecons vont toujours jusqu'a l'ecran de fin.

- **La question de `prophetes-coran` arrive maintenant a l'heure** *(10 aout,
  cycle 2)* — **avant : apres 4 tapes. Apres : apres 3 tapes.** La regle « une
  question dans les trois premieres cartes » vaut desormais pour les **six**
  lecons : 3, 3, 3, 3, 2, 3 tapes. L'exception que le test nommait a ete retiree,
  il verifie la regle partout.
  *Et le correctif a reglé un defaut plus grave que celui qui etait consigne.* La
  question « quel passage nomme dix-sept prophetes d'affilee ? » venait **juste
  apres** la carte recapitulative titree « Nommes dans Al-An'am, 84 a 86 » : la
  reponse etait ecrite a l'ecran precedent, la question ne faisait donc rien
  retenir. En echangeant les deux cartes, elle devient un vrai rappel — les
  cartes 2 et 3 citent la sourate, la recapitulation qui suit sert de
  renforcement. Nombre de cartes inchange (12), aucune erreur JavaScript, aucun
  debordement, les 6 lecons vont jusqu'a l'ecran de fin.

- **Les quatre lecons muettes posent enfin des questions** *(10 aout)* —
  **avant : 2 lecons sur 6 avaient une question. Apres : 6 sur 6.** 11 questions
  ajoutees (3 dans `six-piliers-foi`, 3 dans `priere-gestes`, 2 dans
  `invocations-matin`, 3 dans `alphabet-arabe`). Mesure au navigateur a 414x690 :
  la premiere question tombe apres 2 ou 3 tapes dans les cinq lecons conformes,
  **11 questions sur 11 bloquent le bouton Suivant**, **11 sur 11 affichent une
  explication**, les 6 lecons vont jusqu'a l'ecran de fin et affichent leur
  score. Aucune erreur JavaScript, aucun debordement.
  *Regle tenue :* chaque question porte sur une information **deja ecrite et deja
  sourcee dans sa propre lecon**. Aucune affirmation religieuse nouvelle, aucune
  reference ajoutee. Les compteurs de cartes ont ete corriges en meme temps
  (11→14, 12→15, 8→10, 12→15) : le site aurait sinon annonce un faux nombre.

- **Une passerelle cassee a la deuxieme visite** *(10 aout)* — l'arrivee directe
  sur une lecon depuis un autre site de la famille est parfaite, mais en ouvrant
  l'accueil ensuite, les trois questions de bienvenue **s'imposaient et
  masquaient la serie et l'anneau du jour**. Le site traitait en inconnue
  quelqu'un qui venait de travailler six minutes. Mesure avant/apres au
  navigateur : questions imposees `true` → `false`, progression affichee
  `(masquee)` → `1 jour.`

- **50 liens sortants balises** *(10 aout)* — **0 avant, 50 apres**, 0 non
  balise. Sans balise, aucun agent recevant ne pouvait savoir que le clic venait
  de moi.

- **La prononciation en lettres latines etait le plus petit texte de la carte**
  *(10 aout)* — 15 px, gris pale, italique, sous un arabe a 34 px. C'est la seule
  ligne utilisable par qui ne lit pas l'arabe. Passee a **21 px**, sans italique.
  Cinq autres endroits corriges (nom transcrit d'une sourate 15→17, nom francais
  d'un prophete 15→17, son d'une lettre 15→17, reponse a retenir 15→17,
  reference 15→16).

- **Une ligne de texte tranchee par le bouton Suivant** *(10 aout)* — invisible a
  414x896, reproduite exactement a **414x690**, la hauteur reelle de l'ecran de
  Mohamed dans Safari. Le fond de la barre devient opaque des 16 px, ce qui laisse
  une bande pleine de 30 px — la hauteur d'une ligne — avant le bouton.

- **Le chemin a la place de la liste** *(10 aout)* — 6 etapes, 6 medaillons, 5
  courbes, une seule etape en cours, verifie dans 4 scenes. Et un chemin troue
  corrige : « Mon chemin » affichait une etape faite **apres** deux etapes a
  venir, parce que cette page listait dans l'ordre du catalogue et non dans
  l'ordre conseille.

- **Le jour de grace, le record et l'anneau du jour** *(10 aout)* — 20 controles
  de logique pure hors navigateur, 7 etats verifies au navigateur. Un test echoue
  si un mot de reproche apparait quand une serie se casse.

- **La boucle ecouter / repeter / reecouter** *(10 aout)* — verset de 3,0 s,
  silences mesures a **3,61 s et 3,56 s**. Le compteur de repetitions a revele un
  defaut : la boucle finissait sur une ecoute, donc 3 ecoutes pour 2 repetitions.
  Corrige a 3 et 3.

- **Les parcours vides retires, l'accueil ramene a une carte et un bouton**
  *(10 aout)* — de 18 parcours annonces dont 12 vides, a 6 lecons reelles. Zero
  occurrence de « En preparation », avec et sans JavaScript.
