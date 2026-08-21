#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique js/icones.js.

POURQUOI UN OUTIL, ET PAS DU SVG ECRIT A LA MAIN
------------------------------------------------
Section 2.4 du cahier des charges : aucun emoji, toutes les icones sont des
SVG au trait sur une grille de 24, dans un style unique. Les traces exacts
sont donnes par l'annexe A. Les recopier a la main, c'est se tromper une fois
sur six — ce qui est exactement arrive : « Le sens des sourates » s'est
retrouve avec une fleche circulaire, et « La vie du Prophete » avec un
fragment d'autre icone, parce qu'une expression trop gourmande attrapait le
SVG du bloc voisin.

Les traces sont donc APPARIES A LEUR NOM, un par un, et le fichier est
regenere plutot que retouche.

AUCUNE COULEUR N'EST ECRITE ICI
-------------------------------
Les icones sortent en `currentColor` : la meme icone sert sur ivoire et sur
vert fonce sans etre dupliquee, et une couleur ne peut pas se desynchroniser
de la palette.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SOURCE = RACINE / 'outils' / 'icones-source.json'

# Les icones d'interface, relevees dans l'annexe A, ecrans 1 et 4.
INTERFACE = {
    'etoile':  [{'t': 'path', 'd': 'M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z', 'w': '1.1', 'c': '', 'j': 'round'}],
    'profil':  [{'t': 'path', 'd': 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0', 'w': '1.5', 'c': 'round', 'j': ''}],
    'croix':   [{'t': 'path', 'd': 'M6 6l12 12M18 6L6 18', 'w': '1.8', 'c': 'round', 'j': ''}],
    'lecture': [{'t': 'path', 'd': 'M5 4.5l13 7.5-13 7.5z', 'w': '1.6', 'c': '', 'j': 'round'}],
    'signet':  [{'t': 'path', 'd': 'M6.5 3.5h11v17l-5.5-4-5.5 4z', 'w': '1.5', 'c': '', 'j': 'round'}],
    'gauche':  [{'t': 'path', 'd': 'M14.5 5.5L8 12l6.5 6.5', 'w': '2', 'c': 'round', 'j': 'round'}],
    'droite':  [{'t': 'path', 'd': 'M9.5 5.5L16 12l-6.5 6.5', 'w': '2', 'c': 'round', 'j': 'round'}],
    'accueil': [{'t': 'path', 'd': 'M3.5 10.5L12 4l8.5 6.5V20h-17z', 'w': '1.6', 'c': '', 'j': 'round'}],
    'grille':  [{'t': 'path', 'd': 'M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z', 'w': '1.5', 'c': '', 'j': 'round'}],
    'progres': [{'t': 'path', 'd': 'M4 19.5V13m5 6.5V8m5 11.5v-9m5 9V5', 'w': '1.7', 'c': 'round', 'j': ''}],
    'plus':    [{'t': 'path', 'd': 'M4 7h16M4 12h16M4 17h16', 'w': '1.7', 'c': 'round', 'j': ''}],
    'coche':   [{'t': 'path', 'd': 'M4.5 12.5l5 5 10-11', 'w': '2', 'c': 'round', 'j': 'round'}],
}

# Les douze icones de section doivent TOUTES etre la. Une section sans icone
# est une tuile muette : on s'arrete plutot que de la laisser vide.
SECTIONS = ['livre', 'calame', 'colonnes', 'mihrab', 'montagnes', 'boussole',
            'coeur', 'croissant', 'main-piece', 'cube', 'bulles', 'mains']

ENTETE = """/* ==========================================================================
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

var IPAP_ICONES = %s;

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
"""


def main():
    if not SOURCE.exists():
        sys.exit('ARRET : %s manquant (traces des sections extraits de l\'annexe).' % SOURCE.name)
    ic = json.loads(SOURCE.read_text(encoding='utf-8'))

    manque = [s for s in SECTIONS if s not in ic]
    if manque:
        sys.exit('ARRET : icones de section manquantes : %s' % ', '.join(manque))
    for cle, parts in ic.items():
        if not parts or not all(p.get('d') or p.get('r') for p in parts):
            sys.exit('ARRET : l\'icone %s n\'a aucun trace.' % cle)

    ic.update(INTERFACE)
    (RACINE / 'js' / 'icones.js').write_text(
        ENTETE % json.dumps(ic, ensure_ascii=False, indent=1), encoding='utf-8')
    print('  js/icones.js : %d icones (%d sections + %d interface)'
          % (len(ic), len(SECTIONS), len(INTERFACE)))

    # --- Le catalogue reduit de l'ecran de QCM --------------------------
    # L'ecran de QCM chargeait les vingt-quatre icones pour en utiliser deux.
    # C'est 1,6 Ko compresse sur la page la plus lourde du site, et sur celle
    # dont le cahier fixe le premier rendu utile a moins d'une seconde et
    # demie. On en tire donc un catalogue reduit — TIRE DE LA MEME SOURCE,
    # jamais recopie : deux listes finissent toujours par diverger.
    voulus = icones_du_qcm()
    absentes = [n for n in voulus if n not in ic]
    if absentes:
        sys.exit('ARRET : js/qcm.js demande des icones qui n\'existent pas : %s'
                 % ', '.join(absentes))
    petit = {n: ic[n] for n in sorted(voulus)}
    (RACINE / 'js' / 'icones-qcm.js').write_text(
        ENTETE % json.dumps(petit, ensure_ascii=False, indent=1), encoding='utf-8')
    print('  js/icones-qcm.js : %d icones (celles que qcm.js appelle)' % len(petit))


def icones_du_qcm():
    """Les icones que js/qcm.js appelle, relevees dans son code.

    On ne tient pas la liste a la main : le jour ou quelqu'un ajoute un
    `icone('coche')` dans le moteur, le catalogue reduit doit suivre tout
    seul, sinon l'icone disparait en silence a l'ecran.
    """
    src = (RACINE / 'js' / 'qcm.js').read_text(encoding='utf-8')
    return sorted(set(re.findall(r"icone\('([a-z-]+)'", src)))


if __name__ == '__main__':
    main()
