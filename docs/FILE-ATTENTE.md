# File d'attente — islampasapas.fr

Un element par ligne, avec **ce qui le justifie**. Une idee sans preuve n'entre
pas ici : elle attend dans `POUR-LE-RESPONSABLE.md`.

A chaque cycle : on prend le premier element qu'on peut finir, on le finit, on le
deplace en bas avec sa mesure. S'il reste moins de trois elements, le cycle sert
a auditer pour remplir la file — jamais a inventer un chantier.

**Mesure de succes, inchangee : Mohamed ouvre le site sept jours d'affilee.**

---

## A faire

> **Cycles 6 et 10 : audits.** Quand les seuls elements restants sont bloques —
> un arbitrage, deux fois le deploiement — le cycle sert a mesurer, pas a forcer
> un blocage. Les cinq elements que ces deux audits ont produits sont
> **tous faits** (cycles 7, 8, 9, 11, 12). Les trois qui restent sont les trois
> bloques : le prochain cycle sera donc un audit.
>
> **Mesure aux cycles 6 et 10, et rien a corriger** — a ne pas re-mesurer sans
> raison :
> - **214 elements contiennent de l'arabe, 214 portent `lang="ar"` et
>   `dir="rtl"`**, zero nu.
> - **La page des 114 sourates est complete** : 114 lignes, numerotees 1 a 114
>   sans trou ni doublon, 114 noms arabes, 114 noms transcrits, aucune case vide.
> - **Une lecon se termine entierement au clavier**, sans souris (126
>   tabulations), et un style de focus visible est bien declare.

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

- **Chaque commande du site est atteignable au doigt** *(10 aout, cycle 12)* —
  **avant : 8 commandes autonomes sous 44 px de haut. Apres : 0**, sur les 114
  cibles des 10 pages, a 414x690, resultat identique sur deux passages.
  - `a.marque` « Islam pas a pas », **20 px → 44** — le retour a l'accueil, sur
    les 4 pages hors lecon. C'etait la moitie de ce qu'un doigt atteint sans
    viser, et c'est la commande la plus repetee du site.
  - `a.jeton` « Aujourd'hui », **40 px → 44** — l'autre commande de l'en-tete.
  - `a.s-lien` « La lecon », **42 px → 44** — sur la liste des 114 sourates, ou
    les lignes se suivent de pres et ou le doigt vise mal.
  *Aucun texte n'a grossi :* seule la zone cliquable change (`min-height`, et
  deux pixels de rembourrage sur le jeton). La mise en page ne bouge pas.
  *Correction d'un chiffre que j'avais publie.* Le cycle 10 annoncait **18**
  cibles trop petites. Deux erreurs : le harnais mesurait avant que la feuille
  de style soit analysee, et il comptait les liens **au fil d'une phrase**, que
  la norme exempte — on ne peut pas donner 44 px de haut a un mot souligne au
  milieu d'un paragraphe. Le harnais les exempte maintenant explicitement (**11
  liens**) et attend le CSS. Le chiffre juste est **8**, il remplace 18.
  *Verrou :* `test-cibles.mjs` echoue si une commande autonome repasse sous
  44 px.

- **Une lecon se lit vraiment sans JavaScript** *(10 aout, cycle 11)* —
  **avant : 52 commandes pressables qui ne repondent a rien, 0 question sur 17
  montrant sa bonne reponse, 0 sur 17 montrant son explication. Apres : 0, 17
  sur 17, 17 sur 17.** Mesure sur les 10 pages servies, JavaScript desactive, et
  **la version d'avant re-mesuree avec le meme harnais** pour que les deux
  chiffres se comparent.
  *Trois changements.* (1) L'explication quittait un attribut `data-explique`,
  invisible a la lecture ; elle est maintenant **ecrite dans la page**, une
  seule source, lisible par un humain comme par Google. (2) Sans JavaScript, une
  option n'est plus un bouton : elle devient une ligne de liste, et **la bonne
  reponse est dite** au lieu d'etre devinee. (3) « Voix lente » est cache par
  defaut et revele par le script — sans JavaScript il promettait un son qui
  n'arrivait jamais.
  *Et l'inverse est verifie :* avec JavaScript, **0 explication ne fuit avant la
  reponse** et **17 sur 17 apparaissent apres**. La carte redevient un test ;
  sinon on aurait repare la lecture en cassant l'apprentissage.
  *Correction d'un chiffre que j'avais publie.* Le cycle 10 annoncait **57**
  commandes mortes. Ce chiffre venait d'un harnais qui mesurait **avant que la
  feuille de style soit analysee** : deux passages de suite ont accuse des
  lecons differentes d'etre cassees, puis compte 37 puis 10 sur un site
  identique. Le harnais attend desormais que `style.css` soit reellement en
  place — condition neutre, qui ne presume pas du resultat — et donne **trois
  fois le meme resultat**. Le chiffre juste est **52**, il remplace 57.

- **Le site annonce le nombre de cartes qu'il montre vraiment** *(10 aout,
  cycle 9)* — **avant : 6 lecons sur 6 annoncaient un chiffre que la barre de
  progression contredisait. Apres : 0.** Al-Fatiha annoncait **14** cartes, la
  barre en dessinait **13** ; meme ecart partout (15/14, 10/9, 15/14, 12/11,
  14/13). **13 emplacements** corriges : 6 dans le catalogue de `app.js`, 6 dans
  le repli de `parcours.html`, 1 dans le repli de l'accueil.
  *Le chiffre retenu est celui du contenu, et ce n'est pas arbitraire.* Le
  chiffre annonce comptait l'ecran « Lecon terminee », qui n'est pas une carte
  qu'on apprend. Surtout, la barre se remplit **entierement au moment ou cet
  ecran apparait** : elle n'est coherente qu'avec le compte du contenu. Aucun
  calcul du site n'utilisait ce nombre — il n'est qu'affiche — donc rien d'autre
  ne bouge : ni la progression, ni la collection, ni les revisions.
  *Verrou :* `test-nombres.mjs` confronte les **trois copies** du chiffre au
  nombre reel de cartes de chaque lecon, et au nombre de points de la barre.
  Trois copies d'un meme nombre derivent toujours ; maintenant elles echouent au
  lieu de deriver. Verifie dans les deux sens — il **echoue** sur la version
  d'avant en affichant chaque ecart (14/13, 15/14, 10/9…), il passe sur celle
  d'apres.

- **Tout le texte du site atteint le seuil de lisibilite** *(10 aout, cycle 8)* —
  **avant : 36 couleurs de texte affichees, 8 sous le seuil AA. Apres : 36
  mesurees, 0 sous le seuil.** Le pire cas passe de **3,71 a 4,60** (il faut
  4,5), la pastille de **4,32 a 4,91**.
  *Deux changements, pas huit.* Six des huit cas etaient la meme variable :
  `--texte-3`, **`#6c8271` → `#7c9281`**, eclaircie a **teinte et saturation
  identiques** (133,6°, 9,2 %) — meme famille de couleur, la charte n'est pas
  touchee, et l'ecart avec `--texte-2` reste lisible comme une hierarchie. Le
  huitieme cas est la pastille « 5 min » : son fond dore passe de **0,17 a 0,10**
  d'opacite. J'ai assombri le fond plutot que d'eteindre le texte, parce que l'or
  `#c9a84c` **est** une couleur de la charte et n'avait pas a bouger.
  *La valeur n'a pas ete choisie a l'oeil ni calculee sur un fond suppose.* Un
  premier calcul hors navigateur donnait 4,34 pour `--texte-3` — faux : il
  supposait le fond nuit, alors que ce texte est le plus souvent sur la surface
  plus claire des cartes, ou le contraste tombe a 3,71. Six valeurs candidates
  ont donc ete **essayees dans les vraies pages**, les 10 re-mesurees a chaque
  essai ; `#7c9281` est la premiere qui passe partout.
  *Verrou :* `audit-contraste.mjs` **echoue** maintenant (code de sortie 1) des
  qu'une couleur repasse sous le seuil, au lieu d'imprimer un avertissement que
  personne ne lira. Il compose les fonds translucides — sans cela il mesurait de
  l'or sur de l'or et annoncait un texte invisible qui ne l'etait pas.

- **Les 28 ecrans qui citent un texte sacre portent tous leur source** *(10 aout,
  cycle 7)* — **avant : 26 sur 28. Apres : 28 sur 28.** Les deux ecrans nus :
  - `priere-gestes` carte 3 — la traduction complete du hadith des sept gestes.
    Ajoute : « Rapporte par al-Boukhari et Mouslim, d'apres Abou Hourayra. »
  - `invocations-matin` carte 2 — l'arabe entier de *sayyid al-istighfar*, avec
    « Le Prophete l'a appelee… ». Ajoute : « Rapporte par al-Boukhari (n°6306),
    d'apres Chaddad ibn Aws. »
  *Aucune reference n'a ete cherchee ni redigee.* Les deux existaient, exactes,
  sur la carte voisine de la meme lecon ; elles sont **recopiees a l'identique**.
  Zero affirmation religieuse nouvelle, zero traduction touchee. Le nombre de
  cartes est inchange : ce sont deux blocs de source, pas deux cartes.
  *Le verrou pose vaut plus que le correctif.* Une regle de ton se perd en trois
  semaines, un test non : `test-sources.mjs` echoue si un ecran porte du texte
  coranique ou une traduction du sens **sans sa source sur le meme ecran**.
  Verifie dans les deux sens — il **echoue** sur la version d'avant en nommant
  exactement les deux ecrans, il passe sur celle d'apres. Deux controles en
  prime, tous deux verts : **29 references, aucune vague** (chacune nomme un
  recueil ou une sourate), et **les 16 sources coraniques nomment la sourate ET
  le verset**.
  Regression : 6 suites, 0 echec.

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
