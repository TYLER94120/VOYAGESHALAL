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
python3 outils/faire-11-vocabulaire.py   # écrit aussi data/lexique.json
python3 outils/faire-pratique.py         # les bases de la pratique

python3 outils/enrichir-explications.py  # ← a besoin du lexique ci-dessus
python3 outils/classer-niveaux.py        # ← APRÈS eux, jamais avant

python3 outils/faire-lecon-sourate.py    # les 20 leçons de sourate
python3 outils/faire-sourates.py         # l'index des 114 (après les leçons)
python3 outils/faire-sitemap.py          # ← EN DERNIER : il lit ce qui existe
python3 outils/controler-questions.py    # ← et le contrôle en dernier
```

`classer-niveaux.py` relit les banques et recalcule tout : on peut le
relancer autant de fois qu'on veut, il ne dépend pas de son propre passage
précédent.

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
