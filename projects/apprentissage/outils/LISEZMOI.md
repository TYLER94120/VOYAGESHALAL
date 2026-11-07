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
