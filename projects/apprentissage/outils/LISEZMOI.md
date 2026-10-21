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
python3 outils/classer-niveaux.py        # ← APRÈS eux, jamais avant

python3 outils/faire-lecon-sourate.py    # les 20 leçons de sourate
python3 outils/faire-sourates.py         # l'index des 114 (après les leçons)
python3 outils/faire-questions-claude.py --lot outils/lots/lot-01-chiffres.json
python3 outils/faire-sitemap.py          # ← EN DERNIER : il lit ce qui existe
python3 outils/controler-questions.py    # ← et le contrôle en dernier
```

`classer-niveaux.py` relit les banques et recalcule tout : on peut le
relancer autant de fois qu'on veut, il ne dépend pas de son propre passage
précédent.

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

**Donc : relancer un générateur, c'est relancer les deux étapes d'après.**
Ou ne pas le relancer du tout, si on n'a touché qu'un commentaire.

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
