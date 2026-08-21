/* ==========================================================================
   LES ICONES — section 2.4 du cahier des charges
   --------------------------------------------------------------------------
   AUCUN emoji dans l'interface. Toutes les icones sont des SVG au trait,
   dessines sur une grille de 24, dans un style unique.

   Les traces viennent de l'annexe A : ils ne sont pas redessines « a peu
   pres ». Aucune couleur n'est ecrite ici — elle vient du CSS, pour qu'une
   meme icone serve sur ivoire comme sur vert fonce.

   NE PAS EDITER A LA MAIN : produit par outils/faire-icones.py.
   ========================================================================== */

'use strict';

var IPAP_ICONES = {
 "coche": [
  {
   "t": "path",
   "d": "M4.5 12.5l5 5 10-11",
   "w": "2",
   "c": "round",
   "j": "round"
  }
 ],
 "signet": [
  {
   "t": "path",
   "d": "M6.5 3.5h11v17l-5.5-4-5.5 4z",
   "w": "1.5",
   "c": "",
   "j": "round"
  }
 ]
};

/* Rend une icone. aria-hidden : une icone ne dit jamais rien qu'un texte a
   cote ne dise deja. */
function icone(nom, taille, classe) {
  var parts = IPAP_ICONES[nom];
  if (!parts) { return ''; }
  var d = '';
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (p.t === 'circle') {
      d += '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="' + p.r + '"'
        + ' stroke="currentColor" stroke-width="' + p.w + '" fill="none"/>';
    } else {
      d += '<path d="' + p.d + '" stroke="currentColor" stroke-width="' + p.w + '"'
        + (p.c ? ' stroke-linecap="' + p.c + '"' : '')
        + (p.j ? ' stroke-linejoin="' + p.j + '"' : '') + '/>';
    }
  }
  return '<svg width="' + taille + '" height="' + taille + '" viewBox="0 0 24 24"'
    + ' fill="none" aria-hidden="true"' + (classe ? ' class="' + classe + '"' : '')
    + '>' + d + '</svg>';
}
