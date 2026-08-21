/* ==========================================================================
   LA GEOMETRIE — cahier des charges V2, section 3
   --------------------------------------------------------------------------
   Douze rosaces, une par section, qui ne different que par leur nombre de
   branches. Un paquet de cartes se reconnait alors au premier coup d'oeil,
   sans avoir a lire son nom.

   TOUT EST CALCULE, RIEN N'EST DESSINE A LA MAIN. C'est la condition pour
   que les douze motifs soient d'une meme famille : une main qui redessine
   douze fois la meme figure produit douze figures differentes.

   Les quatre fonctions ci-dessous sont celles de la section 3.1, reprises
   telles quelles. Aucune valeur n'a ete touchee.

   Rien ici ne connait le CSS : la couleur et l'opacite sont passees par
   l'appelant, parce que le meme motif sert en vert sur ivoire et en or sur
   vert fonce.
   ========================================================================== */

'use strict';

// Sommets d'une etoile a n branches : rayon alterne R / R*ratio
function starPoints(cx, cy, R, n, ratio, rot = 0) {
  const p = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = rot + (i * Math.PI) / n;
    const r = i % 2 === 0 ? R : R * ratio;
    p.push([cx + r * Math.sin(a), cy - r * Math.cos(a)]);
  }
  return p;
}

function polyPoints(cx, cy, R, n, rot = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n;
    return [cx + R * Math.sin(a), cy - R * Math.cos(a)];
  });
}

const toPath = (pts) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('') + 'Z';

// La rosace : cercle, etoile, contre-etoile decalee, polygone interieur, oeil
function rosette(size, n, ratio, color, sw = 1.2) {
  const c = size / 2, R = size / 2 - sw;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round">
      <circle cx="${c}" cy="${c}" r="${R}"/>
      <path d="${toPath(starPoints(c, c, R, n, ratio))}"/>
      <path d="${toPath(starPoints(c, c, R * 0.74, n, ratio, Math.PI / n))}" opacity="0.6"/>
      <path d="${toPath(polyPoints(c, c, R * 0.34, n, Math.PI / n))}"/>
      <circle cx="${c}" cy="${c}" r="${R * 0.11}"/>
    </g></svg>`;
}

/* --------------------------------------------------------------------------
   LE FOND CARRELE (section 3.4)

   Un semis d'etoiles a huit branches, repete sans couture. Le raccord est
   assure par construction : une etoile au centre de la tuile, et une a
   CHAQUE COIN — donc coupee en quatre, chaque quart retrouvant les trois
   autres chez les tuiles voisines. Il n'y a rien a ajuster a la main.
   -------------------------------------------------------------------------- */

function tilePattern(id, color, T = 64, R = 15, n = 8, ratio = 0.55, sw = 1) {
  const stars = [[0,0],[T,0],[0,T],[T,T],[T/2,T/2]]
    .map(([cx,cy]) => `<path d="${toPath(starPoints(cx, cy, R, n, ratio))}"/>`).join('');
  return `<pattern id="${id}" width="${T}" height="${T}" patternUnits="userSpaceOnUse">
    <g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round">
      ${stars}<path d="M0 0L${T} ${T} M${T} 0L0 ${T}" opacity="0.5"/>
    </g></pattern>`;
}

/* --------------------------------------------------------------------------
   LES DEUX POSES

   `calqueCarrele` produit le calque de fond decrit en 3.4 : absolu, sous le
   contenu, invisible aux lecteurs d'ecran et transparent au doigt. Il ne
   pose PAS `position: relative` sur le parent — c'est au CSS de le faire,
   et le controle du §10 le verifie.

   `poserMotifs` remplit tous les emplacements d'une page d'un coup, en
   lisant ce que chacun demande dans ses attributs. Ainsi aucune page n'a
   besoin de connaitre la geometrie : elle pose une marque, le motif arrive.
   -------------------------------------------------------------------------- */

var CPT_MOTIF = 0;   // les identifiants de <pattern> doivent etre uniques

function calqueCarrele(couleur, opacite, T, R) {
  var id = 'carrelage-' + (++CPT_MOTIF);
  return '<svg class="calque-motif" aria-hidden="true" focusable="false"'
    + ' width="100%" height="100%" style="opacity:' + opacite + '">'
    + '<defs>' + tilePattern(id, couleur, T, R) + '</defs>'
    + '<rect width="100%" height="100%" fill="url(#' + id + ')"/></svg>';
}

/* Les reglages des douze sections (3.2) vivent dans data/sections.json, sous
   les cles `branches` et `ratio`. On les lit de la, jamais d'une deuxieme
   liste tenue ici : deux listes finissent toujours par diverger. */
function rosaceDeSection(section, taille, couleur, epaisseur) {
  if (!section || !section.branches) { return ''; }
  return rosette(taille, section.branches, section.ratio, couleur,
                 epaisseur === undefined ? 1.2 : epaisseur);
}

/* Remplit d'un coup tous les emplacements marques dans la page.

     <div data-rosace="10" data-ratio="0.66" data-taille="190"
          data-couleur="#0F5132" data-trait="1.1"></div>
     <div data-carrelage="#0F5132" data-op="0.055" data-tuile="64" data-r="15"></div>

   Les opacites, elles, restent dans le CSS : ce sont des valeurs de design,
   pas de geometrie, et le §3.3 les fixe emplacement par emplacement. */
function poserMotifs(racine) {
  var ou = racine || document;

  var r = ou.querySelectorAll('[data-rosace]');
  for (var i = 0; i < r.length; i++) {
    if (r[i].firstChild) { continue; }   // deja pose
    r[i].innerHTML = rosette(
      parseFloat(r[i].getAttribute('data-taille')),
      parseInt(r[i].getAttribute('data-rosace'), 10),
      parseFloat(r[i].getAttribute('data-ratio')),
      r[i].getAttribute('data-couleur'),
      parseFloat(r[i].getAttribute('data-trait') || 1.2)
    );
  }

  var c = ou.querySelectorAll('[data-carrelage]');
  for (var k = 0; k < c.length; k++) {
    if (c[k].firstChild) { continue; }
    c[k].innerHTML = calqueCarrele(
      c[k].getAttribute('data-carrelage'),
      parseFloat(c[k].getAttribute('data-op')),
      parseFloat(c[k].getAttribute('data-tuile') || 64),
      parseFloat(c[k].getAttribute('data-r') || 15)
    );
  }
}

window.IPAP_GEO = {
  starPoints: starPoints,
  polyPoints: polyPoints,
  toPath: toPath,
  rosette: rosette,
  tilePattern: tilePattern,
  calqueCarrele: calqueCarrele,
  rosaceDeSection: rosaceDeSection,
  poserMotifs: poserMotifs,
};
