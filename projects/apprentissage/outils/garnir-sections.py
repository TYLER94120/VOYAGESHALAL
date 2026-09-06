#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ecrit dans sections.html ce que le JavaScript y mettait tout seul.

CE QUI ETAIT CASSE
------------------
`sections.html` est la page qui doit mener aux douze sections. Elle est dans
le sitemap, en priorite 0,9. Demandee au serveur, elle rendait :

  * ZERO lien vers une section — la grille `#tuiles` est un div vide que
    `sections.js` remplit au chargement ;
  * 269 caracteres de texte, dont « Chargement… » comme seule phrase
    descriptive.

Le seul chemin par lequel un robot atteignait les couvertures de section
passait donc par les vingt-trois lecons de sourate et par `sourates.html`.
La page faite pour y mener n'y menait pas.

Elle annoncait en plus « Vingt d'entre elles, expliquees verset par verset »
alors qu'il y en a vingt-trois : le nombre etait ecrit a la main, comme
celui de `sourates.html` corrige le 2 septembre. Meme faute, autre fichier.

CE QU'IL FAIT, ET CE QU'IL NE FAIT PAS
--------------------------------------
Il ne regenere pas la page : elle reste ecrite a la main, avec sa navigation,
son fond et ses commentaires. Il remplace le contenu de TROIS zones bornees
par des marques HTML — la grille, le total, et la ligne des sourates — et
refuse de travailler si une marque manque. Recopier les soixante lignes de
cette page dans un gabarit Python pour en changer trois aurait cree une
deuxieme version a tenir a jour.

TOUS LES NOMBRES SONT COMPTES dans les banques et sur le disque au moment de
l'execution. Aucun n'est ecrit ici.

La grille posee est volontairement plus simple que celle du script : ni
rosace ni barre de maitrise, qui dependent l'une de la geometrie calculee,
l'autre de la memoire du telephone. Elle porte ce qui est vrai pour tout le
monde : le nom, le nombre de questions, et le lien.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
PAGE = RACINE / 'sections.html'


def echapper(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def espacer(n):
    s, out = str(n), ''
    for i, c in enumerate(reversed(s)):
        if i and i % 3 == 0:
            out = ' ' + out
        out = c + out
    return out


def en_lettres(n):
    mots = {20: 'Vingt', 21: 'Vingt et une', 22: 'Vingt-deux',
            23: 'Vingt-trois', 24: 'Vingt-quatre', 25: 'Vingt-cinq'}
    return mots.get(n, str(n))


def ardoise(nom):
    s = unicodedata.normalize('NFD', nom.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace("'", '-').replace(' ', '-')
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')


def remplacer(t, marque, neuf):
    """Remplace ce qui est entre <!-- X:DEBUT --> et <!-- X:FIN -->."""
    motif = re.compile(r'(<!-- %s:DEBUT -->)(.*?)(<!-- %s:FIN -->)'
                       % (marque, marque), re.S)
    if not motif.search(t):
        sys.exit('ARRET : la marque %s est absente de sections.html.\n'
                 '        Sans elle, on ne sait pas quoi remplacer, et on ne '
                 'devine pas.' % marque)
    return motif.sub(lambda m: m.group(1) + neuf + m.group(3), t)


def main():
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    if len(secs) != 12:
        sys.exit('ARRET : %d sections au lieu de 12.' % len(secs))

    total, ouvertes, tuiles = 0, 0, ''
    for s in secs:
        f = RACINE / 'data' / 'questions' / ('%s.json' % s['slug'])
        n = len(json.loads(f.read_text(encoding='utf-8'))) if f.is_file() else 0
        total += n
        if n:
            ouvertes += 1

        dedans = ('<span class="nom">%s</span>'
                  '<span class="nb">%s</span>'
                  % (echapper(s['nom']),
                     ('%s question%s' % (espacer(n), 's' if n > 1 else ''))
                     if n else 'bientôt'))
        if n:
            # Vers la COUVERTURE, comme le fait le script : on voit ce qu'il y
            # a dans la section avant d'en regler un QCM.
            tuiles += ('\n      <a class="tuile" href="section/%s">%s</a>'
                       % (echapper(s['slug']), dedans))
        else:
            # Pas de lien : une section sans question n'a rien a montrer, et
            # sa page porte deja noindex.
            tuiles += ('\n      <div class="tuile" data-vide="oui">%s</div>'
                       % dedans)

    # Les lecons REELLEMENT sur le disque, comme partout ailleurs.
    noms = json.loads((RACINE / 'outils' / 'coran' / 'noms-sourates.json')
                      .read_text(encoding='utf-8'))
    lecons = sum(1 for s in noms
                 if (RACINE / ('lecon-sourate-%s.html' % ardoise(s['tr']))).is_file())

    t = PAGE.read_text(encoding='utf-8')
    t = remplacer(t, 'TUILES',
                  '\n    <div class="tuiles" id="tuiles">%s\n    </div>\n    '
                  % tuiles)
    t = remplacer(t, 'TOTAL',
                  '<p class="c-meta" id="total">%s questions, dans %d sections '
                  'sur %d</p>' % (espacer(total), ouvertes, len(secs)))
    t = remplacer(t, 'LECONS',
                  '<span class="quoi">%s d\'entre elles, expliquées verset par '
                  'verset.</span>' % en_lettres(lecons))
    PAGE.write_text(t, encoding='utf-8')

    print('  sections.html : %d tuiles ecrites, %d menent quelque part.'
          % (len(secs), ouvertes))
    print('  %s questions comptees, %d lecons de sourate comptees.'
          % (espacer(total).replace(' ', ' '), lecons))


if __name__ == '__main__':
    main()
