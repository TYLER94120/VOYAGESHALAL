# Recette V2 — cahier des charges de la couche visuelle, section 10

Chaque case est cochée par un **contrôle qui tourne**, pas par une lecture.
Pour les relancer toutes :

    python3 outils/servir.py &
    for c in outils/controles/controler-*.mjs; do node "$c" || echo "ROUGE : $c"; done
    python3 outils/controler-questions.py
    python3 outils/peser.py

Le verdict est le code de sortie. Jamais le texte, jamais un `grep`.

---

## Les cases du §10

- [x] **Les douze rosaces viennent de la fonction du §3.1, avec les réglages
      exacts du §3.2** — aucun SVG dessiné à la main, aucun fichier image.
      `controler-geometrie.mjs` confronte les douze couples (branches, ratio)
      à `data/sections.json` et compte les sommets : une étoile à *n* branches
      en a exactement 2*n*.
- [x] **Les opacités du §3.3 sont respectées à la valeur près** — mesurées sur
      ce que le navigateur calcule, pas sur ce que la feuille de style dit.
- [x] **Le fond carrelé se répète sans raccord visible** — vérifié par
      construction plutôt qu'à l'œil : les cinq étoiles de la tuile sont aux
      quatre coins et au centre, ce qui fait que chaque quart coupé retrouve
      les trois autres chez les tuiles voisines. `controler-geometrie.mjs`
      recalcule les cinq centres à partir des tracés produits.
- [x] **Le bandeau enluminé garde ses 40 px de rembourrage latéral.**
- [x] **Le bloc du verset est en `flex-grow`, aucune carte n'a de vide en bas.**
- [x] **Aucune image générée par une machine, nulle part** — il n'y a aucune
      image sur le site : les trois emplacements sont vides et le disent.
- [x] **Aucun être vivant sur aucune image** — même raison.
- [x] **Chaque photo a son `alt`, son crédit et sa licence** —
      `data/images.json` est vide, et `photo.js` traite comme absente toute
      entrée à laquelle il manque l'un des quatre champs.
      `controler-photo.mjs` le prouve dans les deux sens.
- [ ] **Chaque photo pèse moins de 120 Ko en 2×, en AVIF avec repli WebP** —
      rien à peser. Le rendu produit bien `<source type="image/avif">` puis
      WebP, en 1× et 2×, ce qui est vérifié ; le poids ne pourra l'être qu'une
      fois de vraies photos fournies.
- [x] **Le voile dégradé est appliqué à toutes les photos** — il est dans le
      bloc lui-même, pas dans l'appelant : on ne peut pas l'oublier.
- [x] **Le type `calligraphie` existe et compte au moins 120 questions** — 136,
      dans « Lire l'arabe ». Chaque glyphe est confronté à Unicode.
- [ ] **Le type `photo` existe et compte environ 80 questions** — le type
      existe et fonctionne, les questions n'existent pas. Voir plus bas.
- [x] **L'image de la carte suivante est préchargée.**
- [x] **Une question dont l'image manque est écartée du tirage.**
- [x] **La couverture de section existe à `/section/<slug>`.**
- [x] **Les motifs sont `aria-hidden` et hors tabulation** — vérifié sur les
      trois écrans qui en portent.
- [x] **Les treize points du §9 fonctionnent toujours à l'identique** —
      `controler-recette.mjs`, point par point.
- [x] **Le budget JavaScript n'a pas augmenté de plus de 8 Ko compressés** —
      +7,6 Ko sur `qcm.html`, la page qui grossit le plus. Mesuré PAR PAGE, ce
      qui est la seule mesure qui veuille dire quelque chose : personne ne
      charge les quinze fichiers.
- [x] **Rendu conforme aux maquettes de l'annexe C, en 390 px** — à une
      exception près, signalée ci-dessous.

---

## Ce que je n'ai pas fait, et pourquoi

### La grille 2 × 2 des réponses (§5.5)

**Signalé, pas appliqué.** Les réponses restent en une colonne quand elles sont
longues, et retrouvent la grille 2 × 2 quand elles sont courtes — c'est la
LONGUEUR qui décide, pas le type de question.

Mesure : en 2 × 2 sur un téléphone de 360 px, chaque réponse a 134 px de large.
Les traductions de versets de ce site font de 130 à 446 caractères. C'est
exactement ce que Mohamed a signalé le 21 août — « le texte sort du cadre ».
Revenir à la grille pour toutes les questions rouvrirait ce qu'il vient de
faire fermer.

La grille est bien là pour « Sâd / Dâd / Tâ' / Zâ' », où elle est juste.

### La translittération du verset (§5.2)

La place est prête dans la carte, le champ existe dans le modèle de données, et
il est vide. Je n'ai pas de translittération sourcée des versets, et je n'en
fabrique pas : une translittération fausse sur un verset coranique n'est pas un
détail de mise en page.

### Le nom arabe des sections (§8)

Même chose. `nomArabe` est lu dans `data/sections.json` et affiché s'il y est.
Il n'y est pour aucune des douze : traduire douze titres français en arabe
serait une invention de ma part. Une ligne par section suffira le jour où
quelqu'un les fournit.

### Les 80 questions de type `photo` (§7.2)

Le moteur est complet et vérifié. Les questions demandent des photos sous
licence tracée — architecture, manuscrits, calligraphie, zellige, objets — et
je ne peux pas les sourcer depuis ici. Tant qu'elles manquent, aucune question
de ce type n'est publiée et personne ne rencontre le cadre pointillé en jouant.

### Une valeur du cahier qui ne passe pas le contraste

Le §4 fixe le nom français du cartouche à `#9A7A12` sur `#FCF8EC`. Ce couple
donne **3,83:1**, sous les 4,5:1 de WCAG AA. Le cahier interdit de changer ses
valeurs et demande de signaler celles qu'on croit mauvaises : c'est signalé, et
`controler-contraste.mjs` le répète à chaque passage plutôt que de le taire.

Assombrir jusqu'à `#8A6D10` suffirait à passer le seuil. C'est la décision de
Mohamed, pas la mienne.

---

## Trois défauts trouvés en passant la recette

1. **Cinq tuiles de section et deux réglages étaient voilés à l'opacité.** Leur
   texte tombait à `rgb(130,135,129)` et `rgb(176,180,173)` — plus clair que le
   plancher `#5F6D66`, et sous le seuil WCAG. Une opacité s'applique aussi aux
   lettres. Ils se distinguent maintenant par leur fond et leur cadre.

2. **Le bouton « Commencer les 20 questions » ne recevait plus les clics.** En
   posant le fond carrelé j'avais donné `z-index: 1` au corps des pages, ce qui
   le faisait passer au-dessus du pied fixe : un interrupteur invisible
   recevait le clic à la place du bouton. Exactement le défaut signalé la
   veille avec « Valider » et « Passer », réintroduit par une autre porte.

3. **Le cartouche descendait à 9,2 px** sur les cartes longues, parce que mon
   échelle s'appliquait aussi à lui. Le cahier fixe 21 px et 10,5 px : c'est le
   bloc du verset qui cède, pas le titre.
