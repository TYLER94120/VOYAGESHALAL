# Les controles du jeu

Ils se lancent contre un serveur local, a la racine du site :

    python3 outils/servir.py 8899
    node outils/controles/controler-geste.mjs

`servir.py` sert TOUJOURS le dossier du site, d'ou qu'on le lance.

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
| `controler-cadrage.mjs` | les questions de toutes les sections, a **cinq** largeurs d'ecran — 320 ajoute le 5 octobre : aucune carte ne deborde, chaque reponse est atteignable, les cibles font 44 px |
| `controler-geometrie.mjs` | cahier V2 §3 : les douze rosaces portent leurs (branches, ratio), une etoile a n branches a 2n sommets, la tuile se raccorde par construction, et les opacites arrivent a l'ecran a la valeur pres |
| `controler-niveaux.mjs` | les trois niveaux existent, sont choisissables, et FILTRENT vraiment le paquet — un mode qui n'existe qu'a l'ecran ne sert a rien |
| `controler-photo.mjs` | le type photo dans les deux sens : avec un catalogue complet la question se joue, avec un catalogue incomplet elle est ecartee du tirage |
| `controler-chaine.mjs` | grille, couverture, reglages, QCM par les vraies adresses — et l'ancienne adresse qui doit continuer de marcher |
| `controler-recette.mjs` | les treize points du §9 qui ne doivent pas avoir bouge |
| `controler-contraste.mjs` | le plancher #5F6D66 et le seuil WCAG AA, mesures sur ce que le navigateur calcule |
| `controler-parcours.mjs` | une partie de bout en bout : la carte, la correction, la source, la serie, le retour d'une question ratee |
| `controler-boucle.mjs` | la boucle du jeu sur une longue partie |
| `controler-serie.mjs` | **sans navigateur** : le comptage de la série et son jour de grâce, sur 18 calendriers écrits à la main — plus le verrou de ton, vérifié dans les deux sens |
| `controler-jour.mjs` | la chaîne complète : l'anneau part de zéro, se remplit en jouant, et la série démarre **avec lui** |

## Les polices : ce que le navigateur mesurait vraiment

Jusqu'au 5 octobre, **aucun contrôle n'a jamais vu les polices du site.**

La règle est bonne : un contrôle coupe le réseau extérieur, sinon il dépend
de Google pour dire si le site va bien. Mais les trois polices du site
viennent de Google. Chromium mesurait donc avec les polices de secours de
`base.css` — et dans ce conteneur sans bureau, Georgia n'existe pas non
plus : les trois familles tombaient sur **une seule et même police**, 19 %
plus large que Source Sans 3.

Deux contrôles, `cadrage` et `niveaux`, laissaient sortir les requêtes de
police exprès, avec un commentaire qui disait pourquoi. Elles échouaient
toutes sur `ERR_CERT_AUTHORITY_INVALID`. Et `cadrage` affirmait à chaque
exécution « Amiri chargée, on mesure sur la vraie police », sur la foi de

    document.fonts.check('16px Amiri')

qui répond **vrai avec zéro règle `@font-face` chargée** : sans
déclaration, le navigateur répond pour la police de secours, qui sait
toujours dessiner le texte. Cette assertion ne pouvait pas échouer. Elle a
rassuré pendant des semaines sans rien vérifier.

Ce que ça a coûté : la ronde du 4 octobre a annoncé 39 ponctuations
orphelines à 320 px. Avec les vraies polices, le site du 3 octobre en avait
**une**. Trente-huit cas sur trente-neuf étaient un artefact de ma police
de secours.

Depuis, `outils/polices/` garde la feuille de style de Google et ses six
`.woff2` (latin et arabe, 285 Ko, hors publication), et
`outils/controles/polices.mjs` les sert au navigateur :

    await ctx.route('**', ...);      // le réseau reste coupé
    await brancherPolices(ctx);      // APRÈS : le dernier posé passe en tête
    ...
    await attendrePolices(p);        // jette si une police manque

`attendrePolices` ne fait pas confiance à `document.fonts.check` seul : il
mesure la largeur d'un mot avec la police, puis sans, et exige que les deux
diffèrent. Lui, il peut échouer — vérifié en retirant Marcellus de
`carte.json` : `cibles` et `cadrage` passent au rouge.

Les douze contrôles qui mesurent une géométrie l'utilisent. Les quatorze
autres mesurent une logique, que la police ne change pas ; les y brancher
les ferait échouer pour une raison qui ne les regarde pas.

Si Google change de version (`amiri/v30` → `v31`), les anciennes adresses
cessent d'être servies : relancer `python3 outils/polices/preparer.py`.

## 320 px, la largeur qu'on ne regardait pas

`cadrage` commençait à 360. La ponctuation orpheline du 4 octobre ne se
voyait qu'à 320 : la largeur où le défaut vivait n'était pas mesurée. Elle
l'est depuis le 5, et elle est propre — rien ne déborde, les quatre
réponses sont atteignables, les cibles tiennent leurs 44 px. Mais elle dit
une chose que les autres largeurs cachaient :

| écran | cartes à faire glisser | sur 2 701 |
|---|---|---|
| 320 × 568 | 2 596 | **96 %** |
| 360 × 640 | 2 124 | 79 % |
| 390 × 844 | 264 | 10 % |
| 430 × 932 | 142 | 5 % |
| 820 × 1180 | 0 | 0 % |

Sur le plus petit téléphone encore en service, presque aucune carte ne tient
à l'écran, et 2 651 sur 2 701 sont déjà à la plus petite échelle : il n'y a
plus de marge à prendre. Ce n'est pas une faute au sens du contrôle — le
signe « il y en a plus » est bien là — c'est un fait de conception. Signalé,
pas touché.

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

## Verifier ce qui est SERVI, pas seulement ce qui est ecrit

Depuis le 22 aout, le JavaScript et le CSS partent sans leurs commentaires
(`outils/alleger.py`). La recette doit donc tourner au moins une fois contre
la copie allegee avant une publication qui touche au JS ou au CSS :

    python3 - <<'EOF'
    import pathlib, sys; sys.path.insert(0, 'outils'); import alleger
    SRC, DST = pathlib.Path('.').resolve(), pathlib.Path('/tmp/servi')
    for p in SRC.rglob('*'):
        rel = p.relative_to(SRC)
        if any(x in ('outils','.git','node_modules','__pycache__') for x in rel.parts): continue
        if p.suffix == '.md' or not p.is_file(): continue
        c = DST/rel; c.parent.mkdir(parents=True, exist_ok=True)
        c.write_bytes(alleger.alleger(rel.name, p.read_bytes()))
    EOF
    cp outils/servir.py vercel.json /tmp/servi/ && python3 /tmp/servi/servir.py 8900

puis les controles avec `8899` remplace par `8900`. Le 22 aout, les onze sont
passes au vert des deux cotes — c'est ce qui autorise a servir une copie qui
n'est pas identique a la source.

## Une promesse, un seul declencheur

L'anneau du jour comptait les questions repondues ; la serie, elle, attendait
qu'une PARTIE soit terminee. On pouvait donc lire « objectif du jour atteint »
juste a cote d'une serie qui n'avait pas demarre. Rien n'etait faux
separement, et l'ensemble mentait.

Quand deux affichages promettent la meme chose, ils doivent lire le MEME
compteur. `controler-jour.mjs` verifie exactement ce point, et le sabotage
correspondant — rendre son ancien declencheur a la serie — le fait passer au
rouge en deux lignes.
