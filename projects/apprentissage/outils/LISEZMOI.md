# Les outils

Rien ici ne part sur le site : `publier.py` laisse tout ce dossier de côté.

## L'ordre compte

Les questions se fabriquent, puis se rangent par niveau, puis se contrôlent.
Sauter une étape ne casse rien bruyamment — elle laisse simplement le site
dans un état faux, ce qui est pire.

```
python3 outils/faire-01-sourates.py      # les banques, une par générateur
python3 outils/faire-02-lire-larabe.py
python3 outils/faire-05-prophetes.py
python3 outils/faire-themes.py
python3 outils/faire-11-vocabulaire.py   # écrit aussi outils/lexique.json
python3 outils/faire-pratique.py         # les bases de la pratique

python3 outils/enrichir-explications.py  # ← a besoin du lexique ci-dessus

python3 outils/faire-lecon-sourate.py    # les 38 leçons de sourate
python3 outils/faire-sourates.py         # l'index des 114 (après les leçons)
python3 outils/faire-questions-claude.py --lot outils/lots/lot-01-chiffres.json
python3 outils/classer-niveaux.py        # ← APRÈS TOUT CE QUI ÉCRIT (voir plus bas)

python3 outils/faire-index-sections.py   # l'index allégé des banques
python3 outils/faire-sections-pages.py   # les 12 pages de section
python3 outils/faire-sitemap.py          # ← EN DERNIER : il lit ce qui existe
python3 outils/controler-questions.py    # ← et le contrôle en dernier
```

`classer-niveaux.py` relit les banques et recalcule tout : on peut le
relancer autant de fois qu'on veut, il ne dépend pas de son propre passage
précédent.

### Un journal de requêtes, à la demande — ajouté le 10 novembre

`servir.py` accepte `JOURNAL_REQUETES=<fichier>` et écrit une ligne par requête,
code et chemin. **Sans la variable il se comporte exactement comme avant** :
vérifié, 0 octet écrit après quatre requêtes sur un serveur sans la variable,
deux lignes avec.

Il sert à répondre à une question que l'analyse statique ne peut pas trancher —
les adresses des contrôles sont construites à l'exécution : **quelles pages les
trente contrôles de navigateur ouvrent-ils réellement ?** Mesure du 10 novembre,
sur 3 702 requêtes : 61 des 63 pages, et les 53 adresses du sitemap toutes.
Détail dans `outils/controles/LISEZMOI.md`.

Aucun contrôle ne dépend de ce journal, et aucun ne doit en dépendre.

### Une jauge bâtie sur un identifiant — mesuré le 9 novembre

Le contrôle qui surveille les versets posés dans **plusieurs** sections
regroupait par le hachage au bout de l'identifiant, en s'appuyant sur une
phrase de son propre commentaire : « l'identifiant d'une question se termine
par un hachage du verset ». **C'est faux** — le hachage est calculé par
générateur. La sourate 1 verset 1 porte trois hachages différents.

```
par hachage d'identifiant    65 versets, 138 cartes,  5,1 %
par référence du verset     133 versets, 409 cartes, 15,6 %
```

Le plafond de 90 était donc comparé à la moitié du vrai : avec la bonne
mesure il était **déjà franchi**, et le contrôle était vert par sous-comptage.

> **Une jauge bâtie sur un identifiant mesure l'identifiant, pas la chose.**
> Un hachage, un slug, une clé technique sont des commodités du producteur. La
> référence du verset était en clair dans le champ `source` de chaque carte.

### Et un compte absolu ne pouvait pas servir d'alarme

Mesure faite en recopiant 40 cartes d'une section dans une autre — la dérive
que le contrôle prétend surveiller :

```
l'ancienne jauge   65 -> 65     elle ne bouge pas d'un
la jauge réparée  133 -> 155    elle voit, mais sous tout plafond vivable
```

Un compte absolu monte aussi quand on remplit légitimement une section : il
faudrait le desserrer, et il ne surveillerait plus rien. La vraie signature
d'une section recopiée est une **paire** dont la petite est presque
entièrement contenue dans la grande :

```
état propre, pire recoupement légitime   47 %   (la prière et l'aumône)
avec 40 cartes recopiées                 91 %
```

`PART_MAXI_PAIRE = 0.75`, pris dans ce trou. Une **part** ne dérive pas quand
les sections grossissent. Une paire dont la petite section a moins de 10
versets n'est pas jugée, et ce compte s'imprime.

> **Avant de desserrer un seuil, demander si c'est la bonne grandeur.** Un
> seuil qu'il faut relâcher chaque fois que le produit grandit n'est pas un
> seuil, c'est un retard à l'allumage.

### Ce que le Coran peut donner aux sections sous le plancher — 9 novembre

Mesuré depuis les mots du cahier, avec le double test du générateur :

```
le-comportement   « La parole, la colère, les parents, les voisins. »   80 versets
jeune-et-ramadan  « Le mois, ses règles, ses nuits. »                   10 versets
le-pelerinage     « Les étapes du hajj et de la 'umra. »                11 versets
```

`faire-themes.py` refuse une section sous **20 versets**. Le jeûne et le
pèlerinage ne peuvent donc pas venir du Coran — ils reposent sur des hadiths,
et le dépôt n'en a aucun de citable.

> ⛔ **La suite de ce paragraphe disait « Le comportement tient : 80 versets ».
> C'EST RETIRÉ, le 12 novembre.** Les 80 étaient des correspondances de mots,
> pas des versets pertinents : sur les 15 de « la colère », **treize parlent de
> la colère d'Allah**. Le total pertinent est d'une quinzaine, sous le seuil.
> Le détail et la leçon sont dans l'en-tête de `faire-themes.py`.

Et pour mémoire : le squelette arabe « حج » seul ramène **41** versets, dont
« pierres » et « le rocher ». Le double test — un mot arabe **et** un mot
français — le ramène à 11. C'est exactement pour ça qu'il existe.

### Contre quoi chaque contrôle s'ancre — audit du 8 novembre

La leçon du 7 novembre — *un contrôle qui compare deux choses produites par le
même passage ne contrôle rien* — appliquée aux neuf contrôles Python. Pour
chacun : **quelle source extérieure au pipeline** lui sert de référence.

| contrôle | son ancre |
|---|---|
| `controler-lecons` | le corpus coranique, les noms, Unicode |
| `controler-questions` | le corpus, la morphologie, le lexique, **les fichiers de lot** |
| `controler-sections` | le site servi, **git** (dates, delta de publication, valeurs du cahier) |
| `controler-sitemap` | le site servi, Unicode, git (lastmod) |
| `controler-redirections` | le site servi |
| `controler-allege`, `peser` | git |
| `controler-liens` | le système de fichiers et `vercel.json` — la résolution réelle du serveur |
| `controler-index` | **aucune.** Il compare l'index aux banques, deux artefacts du même passage |

`controler-index` est exactement celui qui était aveugle le 7 novembre. Il
reste utile — une divergence entre l'index et les banques est une vraie faute —
mais il ne peut pas voir une **omission commune**. C'est `controler-questions`
qui porte désormais l'ancre extérieure, par les fichiers de lot.

> **À retenir : la question à poser d'un contrôle n'est pas « que compare-t-il »
> mais « contre quoi s'ancre-t-il ».** Deux artefacts d'un même passage sont
> toujours d'accord sur ce qu'ils ont tous les deux oublié.

### Les valeurs du cahier sont ancrées à git — ajouté le 8 novembre

`data/sections.json` porte les décisions de Mohamed : numéro d'ordre, cible de
questions, branches et ratio de la géométrie. Sa consigne : *« si tu penses
qu'une valeur est mauvaise, tu la signales, tu ne la changes pas. »* Rien ne le
vérifiait, alors que ce fichier est lu par sept outils, cinq contrôles de
navigateur et neuf fichiers du site.

`controler-sections.py` confronte maintenant les **48** valeurs de décision
(12 sections × 4 champs) au commit `92b001a` du 21 août, celui où la couche V2
les a posées. L'ancre est **git**, donc hors du pipeline.

Mesure du 8 novembre : depuis le 21 août, les 12 slugs sont identiques et
**aucune valeur chiffrée n'a bougé**. Un seul champ de texte a changé, le
3 octobre — « De Adam à Muhammad. » est devenu « D'Adam à Muhammad. », l'élision
que `controler-questions.py` exige par ailleurs. Les champs de texte restent
donc libres ; une faute de français se corrige. **Les décisions, non.**

Si git ne connaît pas le commit — dépôt superficiel — le contrôle le **dit** et
refuse le lot, au lieu de passer en silence. Sa ligne de bilan tombe alors à
zéro valeur confrontée.

### « Les deux étapes d'après » était faux : c'est TOUT ce qui vient après

La phrase ci-dessous disait **« relancer un générateur, c'est relancer les deux
étapes d'après »**. Il y en a cinq, et la phrase a coûté treize questions
pendant douze jours.

`faire-questions-claude.py --lot` **ajoute** ses questions à une banque déjà
écrite. Un générateur relancé **écrase** cette banque. Le 26 octobre, la ronde
a relancé `faire-11-vocabulaire.py` sans relancer le lot :

```
1 259 cartes  ->  1 216
```

et j'ai attribué la baisse entière au retrait de trois entrées du lexique. La
vraie arithmétique était **1 259 − 13 − 30**.

**Aucun contrôle ne pouvait le voir**, et c'est le pire du défaut :
`controler-index.py` compare l'index à la banque — les deux étaient refaits
ensemble, donc d'accord entre eux. `controler-sections.py` recompte la table
d'état de `DEPLOIEMENT.md` — et je mettais cette table à jour chaque soir sur
le nouveau total. **Chaque chiffre que je « justifiais » absorbait une perte
que je n'avais pas vue.**

`controler-questions.py` relit maintenant les fichiers de lot et vérifie que
chaque question déclarée est **servie**. Sabotage : relancer
`faire-11-vocabulaire.py` seul, et le contrôle dit « 20 questions écrites à la
main dans les lots, **13 absentes** des banques servies ».

Et `classer-niveaux.py` passe désormais **après le lot** : l'ordre le mettait
avant, donc les questions du lot sortaient sans `niveau`.

> **À retenir : un pipeline dont une étape AJOUTE à ce qu'une autre ÉCRASE n'a
> pas d'ordre partiel.** Il faut tout rejouer depuis l'étape touchée, ou
> vérifier que l'ajout est encore là. Les deux, de préférence.

**IL Y A DEUX ÉTAPES ADDITIVES, PAS UNE — mesuré le 12 novembre.** Le garde-fou
ci-dessus ne couvrait que les fichiers de lot. `faire-pratique.py` ajoute aussi
ses **47** questions aux banques de thème, que `faire-themes.py` réécrit en
entier. Le 12 novembre j'ai relancé `faire-themes.py` seul pour tester son
déterminisme : **21 questions de pratique ont disparu**, et le lot de contrôles
n'a rendu qu'une faute sans rapport (un hasard sur la longueur des réponses).
Sans ce hasard, la suite était verte.

`controler-questions.py` confronte maintenant les deux sources — les lots **et**
la table de pratique — à ce qui est servi, et nomme chaque manquante.

> **Quand on trouve un mécanisme de perte, chercher tous ses exemplaires, pas
> réparer celui qu'on a sous les yeux.**

### Ce que « un état faux » veut dire, mesuré

Le 21 octobre j'ai relancé `faire-pratique.py` seul, pour vérifier qu'une
modification de son en-tête n'avait rien cassé. Il a affiché « 47 questions
écrites, toutes vérifiées contre leur verset », code de sortie 0 — et il
avait **réécrit six banques en les appauvrissant** :

- la phrase du lexique disparaissait des explications (« Dans ce verset,
  إِبْرَٰهِيمَ vient d'un mot qui revient 69 fois dans le Coran… ») ;
- **la clé `niveau` disparaissait de chaque carte.**

C'est normal et c'est le piège : un générateur écrit la carte nue.
`enrichir-explications.py` ajoute la phrase du lexique, `classer-niveaux.py`
ajoute le niveau, et **aucun des deux ne se relance tout seul**. Un
générateur lancé seul ne signale rien : il réussit, et il défait les deux
étapes suivantes. Repéré au `git status`, annulé au `git checkout`.

**Donc : relancer un générateur, c'est relancer TOUT CE QUI VIENT APRÈS.**
Cette phrase disait « les deux étapes d'après » — c'était faux, et ça a
coûté treize questions pendant douze jours. Voir la section ci-dessus.
Ou ne pas le relancer du tout, si on n'a touché qu'un commentaire.

### Un mot-outil n'est pas un sens — mesuré le 4 novembre

`faire-11-vocabulaire.py` n'invente aucune traduction : il **mesure** celles
qu'Hamidullah emploie, et quatre seuils chiffrés écartent les coïncidences
(10 versets, accord ≥ 0,75, lift ≥ 10, marge ≥ 0,25).

**Ces quatre seuils mesurent la constance du traducteur, et rien d'autre.**
Le 4 novembre, deux entrées glosaient « plus » : أَشَدّ et أَقْرَب, deux
élatifs. أَشَدّ avait un accord de **1,000** — le maximum. Hamidullah écrit
bien « plus » dans tous ses versets : l'alignement était parfait et la glose
était vide, parce que le comparatif français est un marqueur devant un
adjectif quand l'arabe le porte dans la forme du mot.

Dix-neuf cartes demandaient « que signifie le mot en vert ? » et attendaient
« plus », dont une sur الْأَقْرَبِينَ, *les proches parents*. Trois explications
d'autres sections le répétaient. **Vingt-deux endroits, en ligne depuis le
22 août.**

Un **sixième garde-fou** refuse donc une glose qui est un mot-outil du
français. La liste a été mesurée avant d'être écrite : bannir les
déterminants en bloc aurait détruit أَجْمَع « tous », et بَيْن « entre » comme
بَعْد « après » sont des **noms** dans le corpus, pour qui une glose
prépositionnelle serait un vrai sens. Sur 140 entrées, la liste en refuse
deux.

`controler-questions.py` porte la même règle avec **sa propre** liste — un
générateur qui se trompe se trompe aussi dans ses propres contrôles — et
relit en plus les **cartes servies** : retirer une entrée du lexique ne
retire pas la carte déjà écrite.

> **À retenir avant de faire confiance à un seuil : quand un indicateur est
> au maximum, demande ce qu'il mesure, pas s'il est bon.**

### Une glose attestée par une seule tournure — mesuré le 5 novembre

Le septième garde-fou. Si un mot n'apparaît que dans **une seule tournure**, on
ne peut pas distinguer « ce mot veut dire X » de « cette tournure se traduit
comme ça ». Les versets de أَدْرَى étaient tous « et qui te **dira** ce
qu'est… » : 6 cartes et 17 explications en ligne enseignaient « dira » pour
sens, et aucun des six garde-fous d'alors ne le voyait.

Mesure : les versets où le mot français de la glose apparaît, puis les **trois
mots qui le précèdent**. Sur les 138 entrées du 4 novembre :

```
100 %  أَعْلَن  « divulguent »   6/6  après « ce qu'ils »
 92 %  أَدْرَى  « dira »        12/13 après « et qui te »
       ------------------------------------------- le trou
 57 %  وِزْر    « fardeau »      4/7
 51 %  صادِق    « véridiques »  26/51
 50 %  قَمَر    « lune »        13/26
```

**Le seuil est lu dans le trou, pas choisi** : tout seuil entre 60 et 90 %
refuse les deux mêmes entrées. À 50 % on perdrait « lune » et « véridiques ».
`CONCENTRATION_MAXI = 0.75` est au milieu du trou, et c'est déjà le chiffre de
`MINI_P` et de `DEPENDANCE_MAXI`.

La règle ne dit pas que la glose est fausse — « divulguent » pour أَعْلَن est
probablement juste. Elle dit que la mesure n'établit pas un sens de mot : c'est
*non vérifié*, et on refuse l'entrée, on ne la corrige pas.

**Une entrée reste non mesurable** (moins de 5 versets attestent sa forme
affichée). Le générateur l'imprime sur sa propre ligne, « gardées, non
mesurables » : ce n'est pas un rejet, c'est le troisième état rendu visible.

### L'égalité ne décide pas — mesuré le 6 novembre

Le huitième garde-fou. `max(sorted(...))` rend le **premier** maximum de la
liste triée : à égalité, c'est **l'alphabet** qui choisissait la forme
publiée. Le tri a été ajouté le 26 octobre pour tuer un non-déterminisme, et
il le fait très bien — mais **rendre un choix arbitraire reproductible ne le
rend pas justifié.** La sortie était stable, et personne ne décidait.

Deux égalités sur 136 entrées :

```
بَلاغ  publiait « message »      10, à égalité avec « messager »   10
لَقُ   publiait « rencontrent »   3, à égalité avec « rencontrez »  3
```

Pour بَلاغ, de l'autre côté de l'alphabet ce lemme aurait publié **le sens de
رسول**. La glose était juste par chance. La marge du quatrième garde-fou
protège contre la co-occurrence **entre** radicaux ; elle ne voit rien à
l'intérieur d'un radical, où « message » et « messager » sont deux mots.

**Aucun seuil à choisir : l'égalité est l'égalité.** On refuse, on ne
départage pas.

### Ce que l'apostrophe cassait DANS LE GÉNÉRATEUR — mesuré le 6 novembre

La leçon de la veille portait sur ma sonde. Elle était aussi dans le
générateur : les deux compteurs de **forme affichée** relevaient les mots avec
`[A-Za-zÀ-ÿ']{4,}`, apostrophe comprise. « l'Enfer » formait donc un seul mot,
de radical `l enfer`. Deux garanties tombaient en silence :

- **جَهَنَّم « enfer »** : compteur local **vide** sur ses 77 versets, donc
  repli sur le comptage **global** — exactement ce que la règle du 27 octobre
  interdit, et rien ne le disait. Corrigé, Hamidullah écrit « l'Enfer » : la
  glose devient « **Enfer** », ce que veut aussi la règle du 3 octobre.
- **أَعْمَى « aveugles »** : « aveugle » au singulier est la forme de ses
  propres versets, 13 contre 8. Le pluriel était publié.

`mots_fr`, qui mesure l'**accord**, employait déjà `[a-z]{4,}` : l'apostrophe y
séparait. Les quatre garde-fous chiffrés n'étaient donc pas touchés, et c'est
vérifié. Mesure avant correction : sur 136 entrées, **deux** gloses changent,
aucune autre ne bouge.

> **À retenir : une garantie qui ne se vérifie pas ne tient pas.** Celle du
> 27 octobre était écrite, commentée, et fausse pour deux entrées pendant dix
> jours. `controler-questions.py` relit maintenant l'invariante entière — la
> glose est la forme **strictement** la plus fréquente des versets du lemme.

### L'apostrophe sépare deux mots, et c'est une mesure fausse de plus

Ma première sonde gardait l'apostrophe **dans** le mot : « l'enfer » ne
correspondait donc pas à « enfer », et deux entrées sur 138 comptaient **zéro**
verset attestant alors qu'elles en ont 77 et 9 (جَهَنَّم, طِين). Une
tokenisation qui garde l'apostrophe fait disparaître tout mot que le français
élide — et ce sont les plus courants.

### Un outil qui ne compte que ses ajouts est aveugle à ses retraits

Le même soir, `enrichir-explications.py` a retiré les trois explications
devenues fausses et affiché « **0 explications enrichies, 0 mises à jour** ».
Il comptait les ajouts et les remplacements, pas les retraits. Trois banques
réécrites, un compte rendu à zéro — repéré au `git diff`, pas à la ligne de
bilan. Il imprime maintenant les trois : enrichies, mises à jour, **retirées**.

## Ce que fait chacun

| outil | ce qu'il fait |
|---|---|
| `fabrique.py` | le module partagé : format d'une question, choix des leurres, écriture contrôlée d'un lot |
| `faire-01-sourates.py` | le sens des versets, à partir du Coran et de la traduction Hamidullah |
| `faire-02-lire-larabe.py` | les 28 lettres, leurs formes attachées, la vocalisation — formes lues dans Unicode |
| `faire-05-prophetes.py` | l'histoire des prophètes, arabe ET français exigés pour attribuer un verset |
| `faire-themes.py` | quatre sections thématiques, à partir de mots-clés coraniques |
| `faire-11-vocabulaire.py` | les mots du Coran : le lexique attesté, et les questions qui l'enseignent |
| `faire-pratique.py` | les bases de la pratique — ablutions, jeûne, aumône, pèlerinage — chaque affirmation confrontée mot-clé par mot-clé au verset qu'elle cite |
| `enrichir-explications.py` | ajoute un mot appris à l'explication des questions sur un verset |
| `faire-icones.py` | `js/icones.js` et le catalogue réduit `js/icones-qcm.js` |
| `classer-niveaux.py` | range chaque question en début / intermédiaire / expert |
| `faire-lecon-sourate.py` | les 20 leçons « une sourate, verset par verset » — pages qui se **lisent**, entrée SEO du site |
| `faire-sourates.py` | `sourates.html`, l'index des 114 et le pivot du maillage interne |
| `faire-sitemap.py` | `sitemap.xml`, lu sur le site réel : n'annonce jamais une section vide |
| `controler-questions.py` | confronte chaque question à sa source : le Coran, ou Unicode |
| `faire-questions-claude.py` | **Claude écrit les questions, sur des faits qu'il n'a pas le droit d'écrire.** Calcule une fiche de faits depuis le corpus ; Claude choisit parmi eux et formule ; le validateur refuse tout ce qui n'est pas dans la fiche. `--fiche` sort la fiche, `--lot` valide un lot écrit sans l'API |
| `controler-liens.py` | chaque lien interne de chaque page mène quelque part — fichier, réécriture `vercel.json`, ou ancre (y compris posée par le script de la page) |
| `controler-lecons.py` | rouvre les leçons **publiées** et reconfronte chaque verset au Coran, sans faire confiance au générateur |
| `alleger.py` | retire les commentaires du JS et du CSS **à la publication** : la source garde son cahier de bord, le visiteur ne le télécharge pas (−29 Ko compressés) |
| `essayer-allege.py` | lance les 30 contrôles de navigateur **contre la copie allégée**, celle que les gens téléchargent vraiment. Le port 8899 doit être libre : l'outil refuse plutôt que de mesurer l'autre site |
| `peser.py` | les budgets du cahier, mesurés page par page — sur ce qui est **servi**, donc allégé, des deux côtés de la comparaison |
| `poser-version.py` | le repère de version dans `plus.html` |
| `publier.py` | recopie le site vers le dépôt servi, et vérifie que les deux se recoupent |
| `servir.py` | le site en local, **avec** les réécritures de `vercel.json` |
| `controles/` | les contrôles de navigateur — voir leur propre LISEZMOI |

## Pour travailler

```
python3 outils/servir.py &
```

Pas `python3 -m http.server` : il ne connaît pas `/section/<slug>`, qui n'est
pas un fichier mais une réécriture. Tester avec lui, c'est tester un autre
site que celui qui est en ligne.

### `&` ne suffit pas toujours, et l'échec ressemble à une suite cassée

Le 25 octobre, dans le conteneur des rondes, un `nohup … &` lancé depuis un
appel d'outil **n'a pas survécu à la fin de cet appel**. Le serveur
répondait 200 pendant la commande qui l'avait lancé, et plus rien ensuite.

Conséquence : `controler-sections`, `controler-redirections` et
`controler-sitemap` — les trois qui interrogent le serveur — sont passés au
rouge **tous les trois à la fois**, sur un dépôt propre. Pendant une mesure,
ça ressemble à trois contrôles cassés ; j'ai failli en tirer des conclusions
sur onze fichiers avant de relancer la référence à vide.

À leur décharge, les trois le disent clairement :

```
ARRET : http://127.0.0.1:8899/ est injoignable (Connection refused).
        Lancer d'abord : python3 outils/servir.py 8899
```

**Donc : trois rouges d'un coup, et ces trois-là — regarder le serveur avant
de chercher ailleurs.** Et dans un conteneur où `&` ne tient pas, lancer le
serveur comme une tâche de fond propre, pas depuis la commande qui mesure.

### Servir autre chose que la source

`servir.py` prend un second argument : la racine à servir. Sans lui, c'est la
source — les contrôles mesurent donc le code **commenté**, qui n'est pas
celui qui part en ligne.

```
python3 outils/servir.py 8899                 # la source
python3 outils/servir.py 8899 /un/clone/pret  # ce qui part en ligne
python3 outils/essayer-allege.py              # les deux, enchaînés
```

Le dernier fabrique la copie allégée, la sert et lance les 30 contrôles
contre elle. **Mesure du 30 octobre : 30 verts, et les 3 contrôles Python qui
interrogent le serveur aussi.** `js/qcm.js` y fait 19 237 octets contre
35 189 à la source : 45 % de ce qu'on relit n'est pas ce qu'on sert.

### Un contrôle qui lit un champ ne mesure pas ce que la carte montre

Ajouté le 13 novembre. `js/qcm.js` n'affiche que **six** choses : le surtitre,
le verset, le mot en vert, le glyphe, l'énoncé, les quatre réponses. Ni la
source, ni l'explication, ni la section, ni l'identifiant — **tout ce sur quoi
les contrôles s'appuient est invisible** au moment où la personne répond.

Deux conséquences, vérifiées :

1. **`in` n'est pas « ce mot-là ».** Le contrôle disait
   `q['surligne'] not in q['arabe']` et le navigateur fait `t.indexOf(m)` : les
   deux cherchent une **sous-chaîne**. Un mot visé qui est une sous-chaîne d'un
   mot plus long placé avant lui fait tomber le vert sur un morceau du mauvais
   mot, et les deux restent muets. Le contrôle vérifie maintenant le **bord**
   du mot — espace ou bord de chaîne, la seule séparation qui existe dans ce
   corpus (76 587 espaces, tout le reste étant des signes combinants).
   Mesure : **644 mots en vert, 644 sur un mot entier**.

2. **Un garde-fou posé dans un générateur ne couvre que ce générateur.** La
   réparation des jumeaux du 7 novembre vit dans `faire-themes.py` et
   `faire-01-sourates.py`. Le contrôle ajouté le 13 novembre groupe les cartes
   **servies** par ce qu'elles montrent : il ne regarde aucun générateur, donc
   il couvre aussi ceux qui n'existent pas encore, et les formes de question
   dont l'énoncé ne montre pas d'arabe. Mesure : **90 énoncés visibles partagés
   par plusieurs cartes, 1 à bonnes réponses différentes** (sourate 84 versets
   2 et 5, arabe identique, le pronom accordé au ciel puis à la terre — juste
   des deux côtés, et lu), **0 carte qui marque faux une réponse juste**.

> **La règle : écrire le contrôle sur ce que le lecteur VOIT, et le poser sur
> les banques servies plutôt que dans le générateur.** Un contrôle placé dans
> le générateur protège un chemin ; un contrôle placé sur le servi protège
> tous les chemins, présents et futurs.

### La règle éditoriale s'applique aux PAGES autant qu'aux questions

Ajouté le 14 novembre. `controler-questions.py` ne s'appelle plus ainsi par
hasard : il porte la règle éditoriale, et il la fait respecter sur **deux**
surfaces, pas une.

1. **Les 2 616 questions** (`data/questions/*.json`), depuis le 15 octobre.
2. **Les 63 pages HTML**, depuis le 14 novembre. Elles n'étaient couvertes par
   aucun contrôle — ni mérite, ni attribution de hadith — alors que ce sont
   elles que Google montre, et que la leçon de sourate est le seul format qui
   classe ici. Mesure : **4 089 morceaux de texte dans la voix du site, 0
   promesse, 0 attribution.**

**Les listes `MERITES`, `RECUEILS` et `ATTRIBUTIONS` sont au niveau du module,
pas dans `main()`.** Elles y sont remontées le 14 novembre précisément parce
qu'un deuxième endroit en avait besoin : deux copies d'une règle dérivent
toujours, et c'est la faute du 12 novembre. **Ne les recopie pas ailleurs — si
une troisième surface en a besoin, importe-les.**

> **La règle porte sur QUI PARLE, pas sur les mots.** Le contrôle écarte le
> texte cité — classes `verset-ar`, `verset-fr`, `verset-source`, `lecon-ar`,
> et tout ce qui est entre guillemets. Ce n'est pas une précaution théorique :
> **571 traductions de versets sont publiées sur les pages, et 12 contiennent
> un mot de la liste**, dont « Je cherche protection auprès du Seigneur de
> l'aube naissante » (Al-Falaq 1). Sans cette exclusion, le contrôle lèverait
> douze fautes sur le Coran — et la réparation évidente serait d'affaiblir la
> liste, c'est-à-dire de détruire le garde-fou.

Le même bloc relit les **54 blocs `application/ld+json`** : adresse déclarée =
canonique, description déclarée = meta description, langue = français. Rien
d'autre. En particulier **le `name` du bloc n'a pas à recopier le `<title>`** :
j'ai écrit ce critère, il a sorti 39 faux écarts, et l'« aligner » aurait cassé
les titres qui portent les mots de la requête.

## Un lien mort et une page orpheline sont deux défauts opposés

`controler-liens.py` posait une seule question : **« ce lien arrive-t-il
quelque part ? »** Depuis le 15 novembre il pose aussi l'inverse : **« un lien
arrive-t-il SUR cette page ? »** Ce ne sont pas deux degrés d'une même mesure,
ce sont deux sens d'une flèche — une page que personne ne lie a **zéro lien
mort** et reste invisible pour un robot qui suit les liens.

La faute est posée là où elle est réelle et sans faux positif : **une page que
`sitemap.xml` déclare et qu'aucun lien interne n'atteint depuis l'accueil.**
Déclarer une page à Google sans lui donner un lien vers elle, c'est envoyer
deux signaux contraires.

**La profondeur est mesurée et dite, jamais jugée.** 53 pages du sitemap, 2
clics au plus. Une page à trois clics n'est pas un défaut, et ce fichier-là
porte sa propre mise en garde : « un contrôle qui se trompe est pire qu'un
contrôle absent ». Si tu veux un plafond, c'est une décision d'éditeur, pas une
réparation.

Trois choses à ne pas défaire :

- **La résolution des chemins est une fonction, `servi()`, pas du code recopié.**
  Les deux questions doivent répondre pareil : si l'une résout un chemin que
  l'autre ignore, la seconde déclare injoignable une page qui répond 200. Sortie
  de `main()` le 15 novembre, pour la raison du 12 novembre.
- **Le maillage suit les `<a>` écrits en absolu, le contrôle des liens morts
  non.** Mesuré : 55 href absolus sur le site, **tous des
  `<link rel="canonical">`**, aucun n'est une navigation. Sabotage : les quatre
  liens vers al-Ikhlas passés en absolu font tomber le compte des liens suivis
  de 1 464 à 1 460, et sans cette branche la page en position 11 serait
  annoncée injoignable **sur un site correct**.
- **Les pages hors sitemap sans lien entrant ne sont pas une faute.** Sept
  écrans internes en `noindex`, et `google460d2c815736f50e.html` qui doit
  rester sans lien. Un rouge permanent ne se lit plus.

## Avant d'écrire un titre : la loi de précision

**Lue le 12 octobre 2026 dans `docs/MESURES.md` du dépôt VOYAGESHALAL**, le
carnet de mesures de l'empire. La ronde nocturne dit de le lire depuis des
semaines ; je ne l'avais jamais ouvert. Il contient une loi mesurée sur les
deux sites qui fonctionnent, et elle change la façon de juger un titre :

> **Plus une requête est précise, plus le clic nous appartient.**
>
> | requête large | position | clics | | requête précise | position | taux |
> |---|---|---|---|---|---|---|
> | voyage halal | 54,8 | **0** | | salle de prière orly | 12,0 | **12,5 %** |
> | vacances islam | 69,8 | **0** | | mentos halal ou pas | 7,3 | **33,3 %** |
> | hôtel pour musulman | 37,1 | **0** | | levure de bière halal | 5,0 | **16,7 %** |
>
> ➡️ **Ne jamais viser une requête large.**

La règle maison sur les titres — moins de 60 caractères, les mots de la
requête en début, un nombre — dit comment ÉCRIRE un titre. Celle-ci dit
quelle requête VISER, et c'est elle qui décide si la page sortira un jour.
Un titre impeccable sur une requête large reste en page 5.

### Ce que ça donne ici, mesuré le 13 octobre

La tête du titre — ce que Google met en gras — sur les 53 pages :

| | pages | ce qu'on mesure |
|---|---|---|
| **nomme une chose précise** | 39 | les 38 leçons de sourate + `/sourates.html` |
| **vise un sujet large** | 14 | l'accueil, `sections.html`, les 11 couvertures, `plus.html` |

Et le relevé colle :

- **les 38 leçons** — « Sourate Al-Ikhlas », précis : c'est la seule page du
  site bien placée quand elle paraît (**position 11**). C'est aussi, dit le
  carnet, « le format qui marche ».
- **les 11 couvertures de section** — « La prière », « Le pèlerinage » : zéro
  impression. La loi l'avait prédit, et **aucune réécriture de titre n'y
  changera rien** : le défaut n'est pas le libellé, c'est la requête visée.
- **`/sourates.html`** — « Les 114 sourates du Coran » : précis, et pourtant
  **position 49** avec 7 impressions, le maximum du site. Précis ne suffit
  pas : il faut aussi que la requête ne soit pas déjà tenue. Le carnet dit la
  même chose d'une page d'hôtels à Istanbul — « 181 impressions en position
  49,6 face aux sites turcs installés. Perdu d'avance. »

**Donc : précis ET pas déjà tenu.** Les deux, sinon rien.

### Et une troisième condition, lue le 3 novembre : AVOIR DES IMPRESSIONS

La skill `ce-que-google-affiche` de l'empire — que je n'avais jamais ouverte —
porte une section « Quand ne PAS faire ce travail », et elle tranche la
question que je reposais tous les soirs :

> « Une page à 88 impressions n'a pas un problème de titre, elle a un problème
> de visibilité : elle sort trop bas pour que quiconque la voie. Un beau titre
> à la position 22 reste invisible. Dans ce cas le levier est ailleurs — des
> liens entrants, de la profondeur, du temps.
>
> **Savoir que ce chantier ne sert à rien ici est aussi utile que savoir le
> mener ailleurs.** »

**islampasapas a 12 impressions en 28 jours.** Le seuil que la skill donne en
exemple — 88 impressions, « pas un problème de titre » — est **sept fois
plus haut**. Les deux pages que la ronde désigne comme à traiter en premier,
l'accueil et al-Ikhlas, en ont **2 et 1**.

Donc, pour ce site et à cette date : **le levier des titres est ÉCARTÉ, pas
reporté.** Ce n'est plus « il faudrait les requêtes de Search Console pour
juger » — c'est « il n'y a personne à convaincre ». La nuance compte : la
première phrase attend une donnée, la seconde dit que la donnée ne changerait
pas la décision.

### Les trois causes que la skill chiffre, confrontées à ce site

| cause mesurée ailleurs | ici |
|---|---|
| un gabarit ajoute un suffixe de marque et **Google coupe** — 383 pages sur 809 chez gohalaltravel | **0 titre sur 53 dépasse 60 caractères** ; le plus long fait 59 (Al-Mutaffifin). Aucun gabarit n'ajoute de suffixe |
| **le mot reste dans la mauvaise langue** — 34 fiches « Dubaï » sur le domaine anglais | sans objet : une langue, un domaine |
| **la description annonce un chiffre faux** — « 40+ adresses » pour douze | recompté par contrôle depuis le 5 octobre (accueil, sections) et le 22 (les 38 leçons) |

La marque est dans **2 titres sur 53** : l'accueil (55 car., c'est sa propre
page) et `plus.html` (« À propos — Islam pas à pas », 26 car.). La skill dit
de l'enlever ; `plus.html` a **zéro impression**, donc la même section « quand
ne pas faire ce travail » s'applique. **Mesuré, écarté, pas touché.**

**Ce qui a été fait, en revanche :** la règle des 60 caractères ne tenait que
les 38 leçons et les 12 pages de section. Les **quatre pages écrites à la
main** — accueil, `sections.html`, `sourates.html`, `plus.html` — n'étaient
tenues par personne. Sabotage isolé du 3 novembre : un titre de 82 caractères
sur `plus.html`, le sitemap remis à jour pour que la règle du `lastmod` ne
masque pas le résultat, **aucun des neuf contrôles Python ne bronchait**.
`controler-sitemap.py` relit maintenant les 53 titres servis.

*Troisième fois que les fichiers écrits à la main sont les seuls à échapper à
une règle : `plus.html` le 23 octobre, `robots.txt` le 25, les titres ce soir.*

### La description est l'autre moitié du même résultat — 16 novembre

Google affiche **deux** lignes : le titre, et la description sous lui. Le
3 novembre, la règle des 60 caractères a été étendue aux 53 titres servis.
**Sa jumelle ne l'avait pas été.**

| | tenue par | pages |
|---|---|---|
| titre ≤ 60 car. | `controler-lecons`, `controler-sections`, **`controler-sitemap` depuis le 3 nov.** | 53 / 53 |
| description 150–160 car. | `controler-lecons` (38 leçons), `controler-sections` (11 sections + l'accueil) | **50 / 53** |

Les trois qui échappaient sont, encore, des pages **écrites à la main** :
`sections.html`, `sourates.html`, `plus.html`. Mesuré par sabotage, les
chiffres annoncés laissés exacts pour que la règle des nombres ne masque pas
celle de la longueur :

| sabotage | résultat |
|---|---|
| `sections.html` 159 → 50 car., ses trois copies | 8 verts, 1 rouge — et c'était le `lastmod` |
| `sourates.html` 152 → 46 car., ses trois copies | 7 verts, 2 rouges — le tableau de `DEPLOIEMENT.md` et le `lastmod` |
| `plus.html` : aucun sabotage nécessaire | il portait **91 caractères** avec les neuf contrôles verts |

**Ce que ça coûtait.** `sourates.html` porte 7 des 12 impressions du site —
la page la plus vue. La seule ligne que Google affiche sous son titre
n'était tenue par personne.

*Quatrième fois que les fichiers écrits à la main sont les seuls à échapper à
une règle : `plus.html` le 23 octobre, `robots.txt` le 25, les titres le
3 novembre, les descriptions ce soir.*

**Deux choses à ne pas défaire.**

1. **La borne est volontairement en double, et ce n'est pas la faute du
   12 novembre.** `controler-lecons` et `controler-sections` vérifient ce
   qu'un **générateur a produit** ; `controler-sitemap` vérifie ce que le
   **serveur rend** pour les 53 adresses déclarées. Deux questions
   différentes sur deux objets différents — pas un même code recopié. Si un
   générateur change, ou si une page sort de son générateur, le filet de
   derrière tient encore.
2. **La règle a un plancher ET un plafond, et les deux comptent.** Trop
   longue, Google coupe au milieu ; trop courte, il écrit sa propre phrase à
   la place et on perd la main sur ce qui s'affiche. Un plafond seul aurait
   laissé passer les deux sabotages ci-dessus.

### Les balises de partage étaient présentes, jamais lues — 17 novembre

`controler-sitemap.py` vérifie depuis le 17 septembre que les quatre `og:`
existent et que `og:image` désigne un fichier réel. **Présentes, jamais
lues.** Et le lecteur de « la voix du site » — celui sur lequel reposent la
règle du mérite, celle des recueils de hadith et celle des attributions — ne
regardait que `name="description"`. Les balises de partage s'écrivent avec
`property=` : elles passaient à travers.

| sabotage isolé sur la leçon d'al-Ikhlas | résultat |
|---|---|
| `og:description` divergente | 8 verts, l'unique rouge était le `lastmod` |
| `og:description` qui **promet un mérite** | 8 verts, l'unique rouge était le `lastmod` |
| `og:title` divergent du `<title>` | 8 verts, l'unique rouge était le `lastmod` |

Ce que Google affiche était tenu. **Ce qu'une conversation affiche ne l'était
pas** — et c'est par là que ce site circule, comme le dit la note du
17 septembre.

**Trois choses à ne pas défaire.**

1. **Le lecteur de la voix du site voit `og:title` et `og:description`.** Trois
   règles éditoriales s'appliquent d'un coup, sur les 63 pages. Preuve que le
   lecteur les voit : les morceaux relus passent de **4 089 à 4 197**, soit
   **+108 = 54 × 2**.
2. **`og:description` doit être la meta description.** C'est la troisième
   paire ; les deux autres étaient déjà tenues (ld+json ↔ meta sur les
   63 pages depuis le 14 novembre, les trois ensemble sur l'accueil depuis le
   5 octobre).
3. **`og:title` n'est PAS obligé d'égaler le `<title>`.** OpenGraph ne le
   demande pas, et le dépôt a déjà payé cette erreur sur le champ voisin : la
   comparaison `name` ↔ `<title>` avait rendu **39 faux écarts**. `"name"`
   diffère du titre sur 50 pages sur 53, et c'est normal. `og:title` est
   **lu** par la règle éditoriale et **libre** quant à sa forme. Un sabotage
   le vérifie en exigeant qu'il reste **vert**.

*Un sabotage qui doit rester vert vaut autant que les trois qui doivent rougir :
c'est lui qui empêche d'écrire une règle qui n'est que de nous.*

### « Ne pas juger la forme » n'est pas « ne pas lire » — 18 novembre

Le point 3 ci-dessus dit la bonne chose de `og:title` : **lu** quant au fond,
**libre** quant à la forme. La même nuit, la note jumelle de
`controler-questions.py` a écarté la comparaison `name` ↔ `<title>` par
« le critère était de moi, pas de la norme » — exact — **et le champ est
reparti sans qu'aucune règle de fond ne le lise.**

Le lecteur de la voix du site ne pouvait pas le rattraper : `MUETTES` écarte
`script`, au motif que « ce n'est pas de la prose lue par quelqu'un ». Vrai
d'un script. **Faux d'un bloc `application/ld+json`, qui n'existe que pour
être lu.** 54 blocs, 92 valeurs de prose (`name` 54, `teaches` 38) déclarées à
Google et lues par personne.

Preuve, dans le `name` de la leçon d'al-Ikhlas — la page la mieux classée du
site, position 11 : « Celui qui recite Al-Ikhlas dix fois obtient la
recompense d'une lecture entiere du Coran » → **8 verts**, l'unique rouge étant
le `lastmod`.

**Trois choses à ne pas défaire.**

1. **Les trois règles éditoriales lisent les valeurs de texte des blocs
   `ld+json`.** Chiffre du contrôle : **256 valeurs relues, 0 touche** — le
   même que la sonde écrite avant la règle.
2. **La portée est une liste d'EXCLUSIONS, pas une liste de champs.** Quatre
   écartés, chacun pour une raison dite : `@context`, `@type`, `url`,
   `inLanguage`. Nommer `name`, `description` et `teaches` serait la faute du
   17 novembre à l'envers — un champ ajouté demain serait muet le jour de son
   ajout. C'est la forme que ce dépôt emploie déjà : `MUETTES`, `CITANTES`.
3. **`voix_du_site` s'applique ici aussi.** Un mérite **entre guillemets** dans
   `name` doit rester **vert** : la règle lit ce que le site affirme, pas ce
   qu'il rapporte. Et le `name` reste **libre** de différer du `<title>` — un
   second sabotage l'exige vert.

*Deux sabotages verts sur quatre, cette fois. Ils ne gardent pas la règle : ils
gardent la frontière de la règle.*

### La règle existait en deux exemplaires, et son mot le plus large visait « couverture » — 19 novembre

Trois choses d'un coup, parce qu'elles se tenaient : on ne pouvait pas pointer
la règle vers une surface neuve sans d'abord réparer la règle.

**1. Les deux listes avaient dérivé, dans les deux sens.** La note du
14 novembre disait « deux copies d'une règle dérivent toujours » et parlait de
**deux** surfaces. Il y en avait **trois** : `controler-sitemap.py` portait sa
propre copie de `MERITES` depuis le 13 octobre.

| | |
|---|---|
| dans `controler-questions` seul | `efface les peches` |
| dans `controler-sitemap` seul | `celle qui la recite`, `quiconque la recite` |

Un `<title>` promettant d'« effacer les péchés » passait. Un `<h1>` disant
« quiconque la récite » passait. **Deux sabotages, un dans chaque sens, le
prouvent — sortie 1 des deux côtés maintenant.**

**2. « vertu » cherché comme sous-chaîne touche « COUVERTURE » — 35 fois sur
ce site.** C'est le mot le plus souvent touché de toute la règle, et c'est un
faux. Il n'avait rougi nulle part par chance. *Un faux rouge est pire qu'un
trou : il apprend à ne plus lire les rouges.*

**3. Le site parle en JavaScript**, et `js/` **part en ligne** —
`.vercelignore` n'écarte que `*.md` et `outils/`. **435 phrases françaises**
dans 18 fichiers, lues par aucune règle. Et `MUETTES` écarte `script`, donc
même le texte qu'un script *insère* dans la page échappait au lecteur.

**Quatre choses à ne pas défaire.**

1. **Un seul fichier : `outils/regles-editoriales.py`.** Les trois listes,
   l'appariement, et la boucle des trois familles. Chargé par `importlib`
   depuis les deux contrôles, comme `faire-questions-claude.py` l'est depuis
   octobre, et pour la raison écrite au même endroit. Ne pas recopier une
   liste « juste pour ce contrôle-ci ».
2. **La frontière est à GAUCHE seulement : début de mot, suffixes admis.**
   C'est ce qui garde `vertus`, `vertueux`, `recompensera`, `protegent`,
   `benedictions`, `meritent` — tous mesurés présents — tout en refusant
   `couverture`. Une frontière des deux côtés perd les six. Deux sabotages à
   suffixe l'exigent rouges, un sabotage « couverture » l'exige **vert**.
3. **`ahadith` est inscrit en clair.** La sous-chaîne le rattrapait par
   accident ; la frontière ne le rattrape plus. *Ce qu'une règle attrape par
   accident, elle le lâche sans prévenir.*
4. **On lit TOUS les littéraux de `js/`, pas ceux qui « ressemblent à du
   français ».** 1 661 littéraux non vides, 1 661 relus, zéro touche. Le tri
   par ressemblance était un critère de nous, et un critère de nous devient
   aveugle sans prévenir.

**Pas fondue, et c'est voulu** : `SOURCES_HADITH` dans `controler-sitemap.py`
est une règle **différente** — elle ne juge pas la voix du site, elle interdit
à une page d'**annoncer** des hadiths quand les banques n'en citent aucun.
Vérifiée ce soir : zéro touche, aucun faux positif latent.

*Une règle partagée à moitié — les mots oui, l'appariement non — n'est pas
partagée. C'est deux règles qui se ressemblent.*

### Un nom accessible qui existe n'est pas un nom qu'on a lu — 20 novembre

Toutes les surfaces que la règle éditoriale lisait au 19 novembre ont une
propriété commune : **un être humain peut les voir.** Le titre dans Google,
l'`og:` dans une conversation, le `ld+json` dans un résultat enrichi, la
chaîne de `js/` sur l'écran. Une faute y est rattrapable à l'œil.

Restait la surface qui ne s'affiche nulle part : **ce que la page dit à qui
l'écoute.** 117 `aria-label` sur les 63 pages, pour 10 valeurs distinctes ;
aucun `alt`, `title`, `placeholder` ni `<title>` de svg aujourd'hui. Un
`aria-label` qui promettrait un mérite serait **dit** à quelqu'un qui apprend
et n'apparaîtrait sur aucun écran.

Quatre choses à ne pas défaire :

1. **`aria-label` était déjà touché par un contrôle, et ça ne suffisait pas.**
   `controler-lecture-ecran.mjs`, point 4, demande si le nom **existe** ; il
   ne lit pas ce qu'il **dit**. C'est la distinction du 18 novembre une case
   plus loin.
2. **Le `<title>` d'un svg sort du silence nommément, et le dessin y reste.**
   `MUETTES` écarte `svg` au motif que « ce n'est pas de la prose lue par
   quelqu'un » : vrai du dessin, faux de son titre, qui n'existe que pour être
   dit. **Deuxième fois** que ce motif est trop largement appliqué — la
   première était `script` et `application/ld+json`.
3. **`ATTR_MACHINE` est une liste de ce qu'on ÉCARTE, bâtie par inventaire.**
   Les 49 noms d'attributs réellement présents sur le site ont été listés, un
   exemple de valeur sous les yeux, avant d'écarter les machines. Une liste de
   ce qu'on lit serait muette le jour où un générateur ajoute un
   `aria-description`.
4. **Elle ne protège pas la règle, elle protège le CHIFFRE.** Un
   `d="M12 1.6l2.7…"` ne peut porter aucun des 39 mots : relire la géométrie
   serait inoffensif, mais « 17 135 valeurs relues » ne mesurerait plus rien.
   **744 relues, dont 117 que personne ne peut voir, zéro touche.**

**Et les quatre `data/*.json` hors des banques** partent en ligne eux aussi.
293 valeurs relues, zéro touche. La plupart sont déjà lues ailleurs ; ce qui
ne l'est nulle part est `images.json`, qui ne contient aucune photo à ce jour
— seulement la forme d'une entrée, dont le champ `alt`.

*Une surface qu'aucun œil ne peut relire est celle où un contrôle vaut le
plus, pas le moins.*

### On vérifiait la copie sur le brouillon — 21 novembre

`controler-lecons.py` compare les 571 versets des 38 pages publiées au jeu de
données, caractère pour caractère. **Il ne vérifiait pas le jeu de données.**
Le seul témoin non circulaire était Al-Fatiha : sept versets relus à la main,
sept sur 571.

Deux fautes pouvaient passer, et **aucune ne se voit à l'œil** : un sens
affiché sous le mauvais verset si les deux fichiers numérotaient une sourate
différemment (les deux moitiés resteraient « conformes » à leur propre
fichier) ; et la basmala, dont le retrait du verset 1 — faux sur 112 sourates
si on s'y trompe — reposait sur un raisonnement écrit dans un commentaire.

Quatre choses à ne pas défaire :

1. **Les sources se confrontent AVANT les pages.** `confronter_les_sources`
   tourne en tête de `main()`. Les trois fichiers de `outils/coran/` portent
   les mêmes 6 236 versets dans les mêmes 114 sourates, chacune numérotée de
   1 à n sans trou.
2. **Le témoin est `morphologie.txt`, et il vaut pour la STRUCTURE.** Il vient
   d'une autre provenance ; il servait au lexique depuis des mois sans que
   personne s'en serve comme témoin. Il ne peut pas vérifier les lettres : les
   deux textes ne notent pas l'alef de la même façon.
3. **Le compte de mots par verset a été mesuré puis ÉCARTÉ.** 2 946 versets en
   désaccord sur 6 236, 465 encore après filtrage des marques de pause, parce
   que la morphologie écrit le vocatif en un mot et le texte publié en deux.
   La cause est mesurée, pas supposée. Ne pas le retenter.
4. **La basmala est pinée par deux critères qui se tiennent.** Le verset 1
   commence par elle partout sauf à la sourate 9 ; et le témoin compte le
   verset 1 comme le texte publié pour exactement les sourates 1 et 9. Aucun
   nombre magique : pas de « écart de 4 », que des ensembles.

**Et ce que ça ne vérifie pas est imprimé à chaque exécution** : que ces
comptes soient les bons. Deux fichiers qui s'accordent valent mieux qu'un
seul, et ce n'est pas une vérification contre le monde.

*Un contrôle qui ne doute que de ce qu'il relit, et jamais de ce avec quoi il
relit, mesure la ressemblance et pas la justesse.*

### Un sens montré s'attribue — 22 novembre

La ronde le dit : « un sens ou un commentaire s'ATTRIBUE, il ne s'affirme
jamais au nom du site ». Les leçons le tenaient, et un contrôle le vérifiait
verset par verset. **Les cartes, non.** Mesure : 2 340 des 2 616 nommaient le
traducteur ; **51 affichaient la traduction d'un verset sans nommer
personne** — « Sa traduction : « … » » avec, pour seule source, « Coran,
sourate 78, verset 15. »

Cinq choses à ne pas défaire :

1. **Les 51 traductions ont été confrontées à `fra-muhammadhamidul.json`
   AVANT qu'un nom soit écrit** — 51 conformes mot pour mot, et le script
   refusait d'écrire sur une seule divergence. Une attribution ne se pose
   jamais sur un texte non confronté.
2. **Le défaut était dans le générateur, pas seulement dans les données.**
   `faire-01-sourates.py` forme B oubliait ce que sa forme A écrivait vingt
   lignes plus haut. Corriger les cartes sans corriger le générateur aurait
   laissé le défaut revenir au prochain lot.
3. **Les cartes ont été corrigées À LA MAIN, et c'est voulu.** Le hasard de
   ces générateurs n'est pas semé : les relancer réécrirait tout le lot.
   L'écriture est donc chirurgicale — 51 lignes, toutes des champs `source`,
   vérifié au diff.
4. **Le nom du traducteur vit à UN seul endroit**
   (`outils/regles-editoriales.py`). Il était à la main dans six fichiers,
   dont `controler-lecons.py` qui RETAPAIT la valeur attendue — alors que ce
   même fichier lit `SEUIL_INDEX` chez le générateur en expliquant pourquoi.
   Changer la déclaration fait rougir les deux contrôles : c'est la preuve
   qu'elle est la seule source.
5. **Le critère n'est pas une tournure, c'est le texte.** On ne cherche pas le
   mot « traduction » : on regarde si une citation de la carte se retrouve
   dans la traduction du verset que la carte elle-même référence. Aucun seuil
   de longueur.

**Et ce sur quoi l'attribution repose est maintenant écrit** —
`outils/coran/LISEZMOI.md`. `fra-muhammadhamidul.json` ne porte **aucune
métadonnée** : le seul élément interne qui nomme Hamidullah est le nom du
fichier. Cohérent partout, **non vérifié** à la racine.

*Un sens exact et non attribué reste une faute : ce n'est pas le texte qui est
faux, c'est le site qui s'en donne l'autorité.*

### On explique un principe, on ne tranche pas un cas — 23 novembre

La règle de la ronde a quatre points ; trois avaient un contrôle. Le
quatrième — « **jamais de fatwa personnelle** » — n'en avait aucun, et c'est
celui dont les conséquences sont les plus lourdes.

Quatre choses à ne pas défaire :

1. **`TRANCHANTES` n'est PAS dans `FAMILLES`, et ce n'est pas un oubli.** Les
   trois premières familles sont des interdits **absolus**. Celle-ci est
   **conditionnelle** : le site peut rapporter un interdit s'il montre qui
   l'énonce et où. « Ce qui est interdit » avec le verset 2:173 cité dessous
   explique un principe ; la même phrase sans le verset tranche un cas. Mettre
   ces mots dans `FAMILLES` les ferait rougir là où ils sont légitimes.
2. **Le second critère n'est pas une tournure, c'est le texte** — on vérifie
   que la citation de la carte se retrouve dans la traduction du verset que la
   carte elle-même référence. Même instrument que la veille.
3. **Deux mots ont été écartés sur mesure, et l'exclusion est prouvée
   nécessaire.** `est nulle` attrape « n'est nullement fou » (Hamidullah),
   comme `vertu` attrapait « couverture » ; `on peut` et `tu peux` attrapent
   « tout ce qu'on peut travailler sur le site ». Remettre `est nulle` dans la
   liste fait rougir du contenu réel et publié : essayé, mesuré, retiré.
4. **La règle s'applique aux CARTES, pas à la prose des pages.** Les deux
   occurrences des pages sont des libellés de thème dont le verset vit dans la
   carte. Une phrase normative ajoutée demain dans la prose d'une page **ne
   serait pas attrapée** — non vérifié, et mesuré propre aujourd'hui.

**Mesure du 23 novembre** : 20 808 champs, 6 cartes emploient une tournure qui
tranche, **0 sans montrer le verset**. La règle était tenue par soin ; elle
l'est maintenant par contrôle.

*Un interdit rapporté avec sa source enseigne. Le même interdit sans sa source
fait du site une autorité qu'il n'est pas.*

### Cinq champs sur dix-sept, et deux pour les mérites — 24 novembre

La note du 18 novembre dit de ne jamais faire de liste blanche : « un champ
ajouté demain par un générateur serait muet le jour de son ajout ». **Elle
était dans ce fichier, et elle n'était pas appliquée aux cartes elles-mêmes.**

| | champs lus | après |
|---|---|---|
| recueils, attributions, tournures qui tranchent | 5 | **17** |
| **promesses de mérite** | **2** | **15** |

Quatre choses à ne pas défaire :

1. **`CHAMPS_MACHINE` est au niveau module, et c'est une liste de ce qu'on
   ÉCARTE.** `arabe`, `surligne`, `glyphe` portent du texte coranique ou des
   lettres isolées — les juger serait juger le Coran ; `id`, `section`, `type`
   sont des codes. Tout le reste est lu, y compris un champ ajouté demain.
2. **`reponses` reste écarté POUR LES MÉRITES, et seulement pour elles.**
   Mesure du 24 novembre : en l'incluant, ce contrôle rend **238 fautes,
   toutes fausses** — les quatre propositions d'une question « quelle est la
   traduction ? » SONT des traductions de Hamidullah, et « exauce ma prière »
   n'est pas le site qui promet. Les trois autres familles lisent `reponses` :
   un nom de recueil est une faute où qu'il soit. **Deux portées différentes
   parce que deux règles différentes** — ce n'est pas une incohérence.
3. **`textes_du_bloc` est au niveau module.** Écrit pour les blocs `ld+json`,
   il sert aux cartes depuis ce soir : une carte porte dix-sept champs, dont un
   dictionnaire. Deux copies d'un même parcours divergent.
4. **La prose des pages est couverte, et par les DONNÉES.** Une tournure qui
   tranche y est une faute sauf si le texte est, mot pour mot, un libellé que
   les banques portent — la carte derrière ce libellé étant déjà tenue. 132
   libellés, un seul tranche. Pas une liste d'exceptions : une jointure.

*Dénoncer une liste blanche dans un commentaire et en garder deux dans le même
fichier, c'est ce que fait un garde-fou posé sur un seul chemin.*

### Ce que cette loi fait au levier 2

Le levier 2 demande de multiplier les leçons de sourate, et le carnet en fait
sa priorité n° 4 : « le format marche, il manque du volume ». Le plan est
fermé depuis le 16 septembre, quand le juz Amma a été complet, et
`faire-lecon-sourate.py` exige un critère NEUF et écrit pour aller plus loin
— « il manque une sourate » n'en est pas un.

La loi de précision donne la forme de ce critère : **une leçon vaut d'être
faite quand la requête qu'elle vise est précise et pas déjà tenue.**

Elle ne donne pas le critère lui-même, parce qu'il faut un chiffre par
sourate — combien de gens tapent « sourate al-mulk » — et ce chiffre est
dans Search Console. Le carnet n'a **aucune table Requêtes** pour
islampasapas.fr : vérifié le 13 octobre, il n'y a que les quatre pages.

La propriété Search Console en « préfixe d'URL » ne bloque donc pas
seulement le levier 1. Elle bloque aussi le CRITÈRE du levier 2. C'est la
même demande, et elle compte double.

### La question que le carnet laisse ouverte

> « À vérifier au prochain relevé : Indexation → Pages sur les deux sites,
> pour distinguer « peu de pages au total » de « pages découvertes mais non
> indexées ». »

Écrite le 21 août, toujours sans réponse. De ce côté-ci, le site présente
53 adresses indexables, un `robots.txt` qui n'interdit rien, un sitemap à
jour et un `noindex` sur les seuls écrans de jeu — tout est vérifié par
`controler-sitemap.py` et `controler-sections.py`. La distinction que le
carnet demande se lit dans Search Console, pas ici.
