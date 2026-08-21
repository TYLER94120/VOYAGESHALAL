/* ==========================================================================
   LES ICONES — section 2.4 du cahier des charges
   --------------------------------------------------------------------------
   AUCUN emoji dans l'interface. Toutes les icones sont des SVG au trait,
   dessines sur une grille de 24, epaisseur 1,1 a 2 px, style unique.

   Les traces viennent de l'annexe A : ils ne sont pas redessines « a peu
   pres », ils sont repris tels quels. Aucune couleur n'est ecrite ici — elle
   vient du CSS (`currentColor`), pour qu'une meme icone serve sur ivoire
   comme sur vert fonce sans etre dupliquee.

   NE PAS EDITER A LA MAIN : ce fichier est produit par outils/faire-icones.py.
   ========================================================================== */

'use strict';

var IPAP_ICONES = {
 "livre": [
  {
   "d": "M20 12a8 8 0 11-2.3-5.6M20 3.5V8h-4.5",
   "w": "1.6",
   "c": "round",
   "j": "round"
  }
 ],
 "calame": [
  {
   "d": "M17.5 3.6l3 3-10.4 10.4-4 1 1-4z",
   "w": "1.4",
   "c": "",
   "j": "round"
  },
  {
   "d": "M4 20.4h13",
   "w": "1.4",
   "c": "round",
   "j": ""
  }
 ],
 "colonnes": [
  {
   "d": "M4 8.5h16M5.5 8.5V20M10 8.5V20M14 8.5V20M18.5 8.5V20M3.5 20h17",
   "w": "1.4",
   "c": "round",
   "j": ""
  }
 ],
 "mihrab": [
  {
   "d": "M6 20V11a6 6 0 0112 0v9",
   "w": "1.4",
   "c": "",
   "j": "round"
  },
  {
   "d": "M3.5 20h17",
   "w": "1.4",
   "c": "round",
   "j": ""
  }
 ],
 "montagnes": [
  {
   "d": "M3 18.5l5.5-8 3.5 5 3-4 6 7z",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "boussole": [
  {
   "d": "M15.5 8.5l-2 5-5 2 2-5z",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "coeur": [
  {
   "d": "M12 20s-7-4.3-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.7-7 9-7 9z",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "croissant": [
  {
   "d": "M15.8 3.4A9 9 0 1015.8 20.6 7.3 7.3 0 0115.8 3.4z",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "main-piece": [
  {
   "d": "M5 19.8c1.5-3.2 4-4.8 7-4.8s5.5 1.6 7 4.8",
   "w": "1.4",
   "c": "round",
   "j": ""
  }
 ],
 "cube": [
  {
   "d": "M4.5 8L12 4.5 19.5 8v9L12 20.5 4.5 17z",
   "w": "1.4",
   "c": "",
   "j": "round"
  },
  {
   "d": "M4.5 8l7.5 3.5L19.5 8M12 11.5v9",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "bulles": [
  {
   "d": "M4 5.5h10v7H8l-4 3z",
   "w": "1.4",
   "c": "",
   "j": "round"
  },
  {
   "d": "M11.5 10h8.5v6h-3.5l-3 2.5V16h-2",
   "w": "1.4",
   "c": "",
   "j": "round"
  }
 ],
 "mains": [
  {
   "d": "M6 9.5c0 5 2.7 8.5 6 8.5s6-3.5 6-8.5",
   "w": "1.4",
   "c": "round",
   "j": ""
  },
  {
   "d": "M6 9.5V6M18 9.5V6M9.6 9.5V4.6M14.4 9.5V4.6",
   "w": "1.4",
   "c": "round",
   "j": ""
  }
 ],
 "etoile": [
  {
   "d": "M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z",
   "w": "1.1",
   "c": "",
   "j": "round"
  }
 ],
 "profil": [
  {
   "d": "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0",
   "w": "1.5",
   "c": "round",
   "j": ""
  }
 ],
 "croix": [
  {
   "d": "M6 6l12 12M18 6L6 18",
   "w": "1.8",
   "c": "round",
   "j": ""
  }
 ],
 "lecture": [
  {
   "d": "M5 4.5l13 7.5-13 7.5z",
   "w": "1.6",
   "c": "",
   "j": "round"
  }
 ],
 "signet": [
  {
   "d": "M6.5 3.5h11v17l-5.5-4-5.5 4z",
   "w": "1.5",
   "c": "",
   "j": "round"
  }
 ],
 "gauche": [
  {
   "d": "M14.5 5.5L8 12l6.5 6.5",
   "w": "2",
   "c": "round",
   "j": "round"
  }
 ],
 "droite": [
  {
   "d": "M9.5 5.5L16 12l-6.5 6.5",
   "w": "2",
   "c": "round",
   "j": "round"
  }
 ],
 "accueil": [
  {
   "d": "M3.5 10.5L12 4l8.5 6.5V20h-17z",
   "w": "1.6",
   "c": "",
   "j": "round"
  }
 ],
 "grille": [
  {
   "d": "M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z",
   "w": "1.5",
   "c": "",
   "j": "round"
  }
 ],
 "progres": [
  {
   "d": "M4 19.5V13m5 6.5V8m5 11.5v-9m5 9V5",
   "w": "1.7",
   "c": "round",
   "j": ""
  }
 ],
 "plus": [
  {
   "d": "M4 7h16M4 12h16M4 17h16",
   "w": "1.7",
   "c": "round",
   "j": ""
  }
 ],
 "coche": [
  {
   "d": "M4.5 12.5l5 5 10-11",
   "w": "2",
   "c": "round",
   "j": "round"
  }
 ]
};

/* Rend une icone. `taille` en pixels, `classe` optionnelle.
   aria-hidden : l'icone ne dit jamais rien qu'un texte a cote ne dise deja. */
function icone(nom, taille, classe) {
  var parts = IPAP_ICONES[nom];
  if (!parts) { return ''; }
  var d = '';
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    d += '<path d="' + p.d + '" stroke="currentColor" stroke-width="' + p.w + '"'
      + (p.c ? ' stroke-linecap="' + p.c + '"' : '')
      + (p.j ? ' stroke-linejoin="' + p.j + '"' : '') + '/>';
  }
  return '<svg width="' + taille + '" height="' + taille + '" viewBox="0 0 24 24"'
    + ' fill="none" aria-hidden="true"' + (classe ? ' class="' + classe + '"' : '')
    + '>' + d + '</svg>';
}
