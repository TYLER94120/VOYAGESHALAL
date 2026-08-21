# Les controles du jeu

Ils se lancent contre un serveur local, a la racine du site :

    python3 -m http.server 8899 --bind 127.0.0.1 --directory .
    node outils/controles/controler-geste.mjs

Le verdict est le CODE DE SORTIE, jamais le texte affiche : `0` tout va
bien, autre chose une faute. Ne jamais les passer dans `tail` ni dans un
`grep` — le code de sortie disparait et le controle ne controle plus rien.

Il leur faut `playwright-core`. Il n'est pas versionne : `npm i
playwright-core` dans ce dossier, ou un lien `node_modules` vers une
installation existante. Le navigateur est celui du poste
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` ici).

| controle | ce qu'il verifie |
|---|---|
| `controler-geste.mjs` | le geste vertical : haut valide, bas passe, le lateral ne fait rien, on attrape la carte depuis une reponse sans la choisir, les deux boutons du pied, le clavier |
| `controler-defilement.mjs` | sur une carte longue : le glissement lit d'abord et ne lance qu'une fois en bas ; le signe « il y en a plus » apparait et disparait au bon moment |
| `controler-cadrage.mjs` | les questions de toutes les sections, a quatre largeurs d'ecran : aucune carte ne deborde, chaque reponse est atteignable, les cibles font 44 px |
| `controler-geometrie.mjs` | cahier V2 §3 : les douze rosaces portent leurs (branches, ratio), une etoile a n branches a 2n sommets, la tuile se raccorde par construction, et les opacites arrivent a l'ecran a la valeur pres |

`controler-cadrage.mjs` laisse passer les polices distantes, exprès :
mesurer une hauteur de texte arabe avec une police de remplacement ne
mesure pas ce que les gens voient.

## Comment savoir qu'un controle controle quelque chose

En le sabotant. On casse volontairement ce qu'il surveille, on verifie
qu'il passe au rouge, puis on restaure. Un controle qu'on n'a jamais vu
echouer n'est pas un controle, c'est une decoration — j'en ai ecrit
trois comme ca dans ce projet avant de m'en apercevoir.
