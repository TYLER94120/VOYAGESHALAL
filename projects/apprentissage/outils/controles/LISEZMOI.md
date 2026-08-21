# Les controles du jeu

Ils se lancent contre un serveur local, a la racine du site :

    python3 -m http.server 8899 --bind 127.0.0.1 --directory .
    node outils/controles/controler-geste.mjs
    node outils/controles/controler-defilement.mjs
    node outils/controles/controler-cadrage.mjs

Le verdict est le CODE DE SORTIE, jamais le texte affiche : `0` tout va
bien, autre chose une faute. Ne jamais les passer dans `tail` ni dans un
`grep` — le code de sortie disparait et le controle ne controle plus rien.

| controle | ce qu'il verifie |
|---|---|
| `controler-geste.mjs` | le geste vertical : haut valide, bas passe, le lateral ne fait rien, on attrape la carte depuis une reponse sans la choisir, les deux boutons du pied, le clavier |
| `controler-defilement.mjs` | sur une carte longue : le glissement lit d'abord et ne lance qu'une fois en bas ; le signe « il y en a plus » apparait et disparait au bon moment |
| `controler-cadrage.mjs` | les 1 252 questions, a quatre largeurs d'ecran : aucune carte ne deborde, chaque reponse est atteignable, les cibles font 44 px |

`controler-cadrage.mjs` laisse passer les polices distantes, exprès :
mesurer une hauteur de texte arabe avec une police de remplacement ne
mesure pas ce que les gens voient.
