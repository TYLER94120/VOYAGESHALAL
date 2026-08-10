# File d'attente — islampasapas.fr

Un element par ligne, avec **ce qui le justifie**. Une idee sans preuve n'entre
pas ici : elle attend dans `POUR-LE-RESPONSABLE.md`.

A chaque cycle : on prend le premier element qu'on peut finir, on le finit, on le
deplace en bas avec sa mesure. S'il reste moins de trois elements, le cycle sert
a auditer pour remplir la file — jamais a inventer un chantier.

**Mesure de succes, inchangee : Mohamed ouvre le site sept jours d'affilee.**

---

## A faire

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

2. **La session n'est pas toujours gagnable.**
   *Preuve :* mesure du 10 aout — une mauvaise reponse ne bloque pas la
   progression (elle montre la bonne et explique), mais **la carte ne revient
   pas** plus loin dans la seance. Tant qu'elle ne revient pas, une erreur reste
   une erreur au lieu de devenir un apprentissage. C'est la piece 3 de la liste
   « addictif » du responsable, et la seule de cette liste encore ouverte.

3. **Aucune mesure d'entree, et un traceur est interdit ici.**
   *Preuve :* `grep -ril "gtag\|analytics\|plausible\|matomo\|umami"` sur toutes
   les pages et les trois fichiers JavaScript ne rend **rien**. Or le pied de
   page promet « Ta progression reste sur ton telephone. Aucun compte, aucun
   envoi » : je ne peux donc pas poser un script tiers sans casser une promesse
   affichee. La voie est une mesure **cote hebergeur** (statistiques du projet ou
   journaux). Bloque jusqu'au deploiement — question posee aux trois autres
   agents dans le brainstorm des passerelles.

4. **La recitation n'a jamais ete entendue par personne.**
   *Preuve :* `halalgpt.fr:443` et `cdn.islamic.network:443` sont refuses par la
   politique reseau de l'atelier (403 au CONNECT, journalise par le proxy,
   verifie trois fois). Le mecanisme est teste avec un recitateur simule — 7
   boutons, credit, bascule Husary, boucle de repetition — mais **quelle source
   repond reellement et en combien de temps reste inconnu**. `?son=diag` affiche
   la reponse sur un telephone avec du vrai reseau. Attend une capture d'ecran de
   Mohamed, ou le deploiement.

5. **Les liens sortants sont tous au mauvais endroit.**
   *Preuve :* mesure du 10 aout — **48 liens sortants, 48 en pied de page, 0 dans
   le contenu**. Les 8 qui sont des phrases utiles (« Une question personnelle ?
   Pose-la sur halalgpt.fr ») sont elles aussi enfermees dans le pied. Ils sont
   maintenant balises, donc mesurables, mais un lien de pied de page ne se clique
   pas. Prediction ecrite d'avance : proche de zero. A deplacer dans le contenu
   apres confirmation par HalalGPT.

---

## Fait

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
