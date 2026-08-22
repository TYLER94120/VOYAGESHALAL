# Les controles du jeu

Ils se lancent contre un serveur local, a la racine du site :

    python3 outils/servir.py 8899
    node outils/controles/controler-geste.mjs

C'est bien `servir.py`, PAS `python3 -m http.server`. Le serveur simple ne
connait pas les reecritures de `vercel.json` : `/section/<slug>` y repond 404,
et `controler-chaine.mjs` echoue pour une raison qui n'a rien a voir avec le
site.

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
| `controler-niveaux.mjs` | les trois niveaux existent, sont choisissables, et FILTRENT vraiment le paquet — un mode qui n'existe qu'a l'ecran ne sert a rien |
| `controler-photo.mjs` | le type photo dans les deux sens : avec un catalogue complet la question se joue, avec un catalogue incomplet elle est ecartee du tirage |
| `controler-chaine.mjs` | grille, couverture, reglages, QCM par les vraies adresses — et l'ancienne adresse qui doit continuer de marcher |
| `controler-recette.mjs` | les treize points du §9 qui ne doivent pas avoir bouge |
| `controler-contraste.mjs` | le plancher #5F6D66 et le seuil WCAG AA, mesures sur ce que le navigateur calcule |
| `controler-parcours.mjs` | une partie de bout en bout : la carte, la correction, la source, la serie, le retour d'une question ratee |
| `controler-boucle.mjs` | la boucle du jeu sur une longue partie |

`controler-cadrage.mjs` laisse passer les polices distantes, exprès :
mesurer une hauteur de texte arabe avec une police de remplacement ne
mesure pas ce que les gens voient.

## Comment savoir qu'un controle controle quelque chose

En le sabotant. On casse volontairement ce qu'il surveille, on verifie
qu'il passe au rouge, puis on restaure. Un controle qu'on n'a jamais vu
echouer n'est pas un controle, c'est une decoration — j'en ai ecrit
trois comme ca dans ce projet avant de m'en apercevoir.

## Un controle ne doit jamais dependre du tirage

Le paquet est melange par defaut. Un controle qui regarde LA PREMIERE CARTE
regarde donc une carte au hasard, et il repond a la carte du jour au lieu de
repondre au site. `controler-parcours` et `controler-geometrie` sont passes du
vert au rouge le 22 aout sans qu'une ligne de rendu ait bouge : ils etaient
tombes sur une question « combien de versets compte la sourate X ? », qui n'a
pas de verset et donc pas de rosace.

Quand un controle porte sur une carte precise, on coupe le melange avant de
charger :

    localStorage.setItem('ipap.v1', JSON.stringify({ reglages: { melanger: false } }))

Et quand il porte sur une propriete de TOUTES les cartes, on passe la banque
entiere plutot qu'un echantillon — c'est ce que font `controler-cadrage` et le
controle des cartouches dans `controler-geometrie`.

Meme piege avec les niveaux : depuis le 22 aout le niveau 1 de « La priere »
n'est fait que de questions de pratique, courtes et sans arabe. Un controle du
DEFILEMENT lance sans `&niveau=3` ne trouve plus une seule carte longue.
