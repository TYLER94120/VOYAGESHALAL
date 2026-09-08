#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ecrit dans l'accueil et la grille des sections ce que le JavaScript y
mettait tout seul.

CE QUI ETAIT CASSE
------------------
Les deux pages par lesquelles on entre sur le site rendaient, dans leur HTML,
une liste VIDE de sections. Mesure faite en les demandant au serveur :

  * `sections.html` — la page qui doit mener aux douze, en priorite 0,9 dans
    le sitemap — rendait ZERO lien vers une section et 269 caracteres de
    texte, dont « Chargement… » comme seule phrase descriptive. La grille
    `#tuiles` est un div que `sections.js` remplit au chargement.
  * `index.html` — l'accueil, la page LA MIEUX PLACEE du site (position 6,5
    au releve) — rendait 417 caracteres et, la aussi, aucun lien vers une
    section : le chemin `#chemin` est un div que `chemin.js` remplit.

Le seul trajet par lequel un robot atteignait les couvertures de section
passait donc par les lecons de sourate et par `sourates.html`. Les deux pages
faites pour y mener n'y menaient pas. Et l'accueil est justement l'endroit
d'ou un lien transmet le plus.

Les deux annoncaient en plus « Vingt d'entre elles, expliquees verset par
verset » alors qu'il y en a vingt-trois : nombre ecrit a la main, comme celui
de `sourates.html` corrige le 2 septembre. Meme faute, trois fichiers.

CE QU'IL FAIT, ET CE QU'IL NE FAIT PAS
--------------------------------------
Il ne regenere pas les pages : elles restent ecrites a la main, avec leur
navigation, leur fond et leurs commentaires. Il remplace le contenu de zones
bornees par des marques HTML — la grille, le chemin, le total, la ligne des
sourates — et refuse de travailler si une marque manque. Recopier soixante
lignes de balisage dans un gabarit Python pour en changer trois aurait cree
une deuxieme version a tenir a jour.

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
GRILLE = RACINE / 'sections.html'
ACCUEIL = RACINE / 'index.html'


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


def titre_grille(total, nb_sections):
    """Le titre de la grille — sans la marque, avec les nombres comptes.

    IL DISAIT « Les 12 sections — Islam pas a pas », et les deux moities
    etaient mauvaises. « Les 12 sections » ne dit rien a qui ne connait pas
    encore le site : douze sections de quoi ? Et la marque mangeait dix-huit
    caracteres sur trente-trois, a l'endroit meme — le debut du titre — que
    Google met en gras quand il correspond a la requete. La methode maison
    est explicite : la marque n'est pas dans le titre.

    Le titre pose ici dit ce que la page contient, avec deux nombres reels :
    le nombre de sections et le nombre de questions, tous deux comptes a la
    fabrication. Un nombre promet un contenu qui existe.

    Plusieurs formulations, toutes vraies, parce que le total grossit et que
    la limite est de soixante caracteres : on garde la premiere qui tient.
    Corrige le 8 septembre 2026 — Google met sept a dix jours a rafraichir
    ses affichages, ne pas rejuger ce titre avant le 18.
    """
    n = espacer(total)
    essais = [
        "QCM d'islam : %d sections, %s questions sourcées" % (nb_sections, n),
        "QCM d'islam : %s questions sourcées, en %d sections" % (n, nb_sections),
        "QCM pour apprendre l'islam : %s questions sourcées" % n,
        "QCM d'islam : %s questions sourcées" % n,
        "QCM d'islam, %s questions" % n,
    ]
    for x in essais:
        if len(x) <= 60:
            return x
    sys.exit('ARRET : aucun titre de grille sous 60 caracteres (%s).'
             % ', '.join(str(len(x)) for x in essais))


def remplacer(t, marque, neuf, ou):
    """Remplace ce qui est entre <!-- X:DEBUT --> et <!-- X:FIN -->."""
    motif = re.compile(r'(<!-- %s:DEBUT -->)(.*?)(<!-- %s:FIN -->)'
                       % (marque, marque), re.S)
    if not motif.search(t):
        sys.exit('ARRET : la marque %s est absente de %s.\n'
                 '        Sans elle, on ne sait pas quoi remplacer, et on ne '
                 'devine pas.' % (marque, ou))
    return motif.sub(lambda m: m.group(1) + neuf + m.group(3), t)


def main():
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    if len(secs) != 12:
        sys.exit('ARRET : %d sections au lieu de 12.' % len(secs))

    total, ouvertes, tuiles, etapes = 0, 0, '', ''
    for s in secs:
        f = RACINE / 'data' / 'questions' / ('%s.json' % s['slug'])
        n = len(json.loads(f.read_text(encoding='utf-8'))) if f.is_file() else 0
        total += n
        if n:
            ouvertes += 1
        combien = ('%s question%s' % (espacer(n), 's' if n > 1 else '')
                   if n else 'bientôt')

        dedans = ('<span class="nom">%s</span><span class="nb">%s</span>'
                  % (echapper(s['nom']), combien))
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

        # L'ETAPE DU CHEMIN, sur l'accueil. Meme balisage que `chemin.js`,
        # moins la rosace et le pourcentage de maitrise : la premiere est
        # calculee par la geometrie, le second lu dans le telephone. Ni l'une
        # ni l'autre n'existe avant que les scripts tournent, et aucune des
        # deux n'est vraie pour tout le monde.
        quoi = ('<span class="etape-bande"><span class="etape-rond"></span></span>'
                '<span class="etape-quoi"><span class="etape-nom">%s</span>'
                '<span class="etape-nb">%s</span></span>'
                % (echapper(s['nom']), combien))
        if n:
            etapes += ('\n      <a class="etape" href="section/%s" '
                       'data-etat="ouvert">%s</a>'
                       % (echapper(s['slug']), quoi))
        else:
            etapes += ('\n      <div class="etape" data-etat="bientot">%s</div>'
                       % quoi)

    # Les lecons REELLEMENT sur le disque, comme partout ailleurs.
    noms = json.loads((RACINE / 'outils' / 'coran' / 'noms-sourates.json')
                      .read_text(encoding='utf-8'))
    lecons = sum(1 for s in noms
                 if (RACINE / ('lecon-sourate-%s.html' % ardoise(s['tr']))).is_file())

    ligne_lecons = ('<span class="quoi">%s d\'entre elles, expliquées verset '
                    'par verset.</span>' % en_lettres(lecons))
    titre = titre_grille(total, len(secs))

    t = GRILLE.read_text(encoding='utf-8')
    t = remplacer(t, 'TUILES',
                  '\n    <div class="tuiles" id="tuiles">%s\n    </div>\n    '
                  % tuiles, GRILLE.name)
    t = remplacer(t, 'TOTAL',
                  '<p class="c-meta" id="total">%s questions, dans %d sections '
                  'sur %d</p>' % (espacer(total), ouvertes, len(secs)),
                  GRILLE.name)
    t = remplacer(t, 'LECONS', ligne_lecons, GRILLE.name)
    t = remplacer(t, 'TITRE', '<title>%s</title>' % echapper(titre), GRILLE.name)
    t = remplacer(t, 'OGTITRE',
                  '<meta property="og:title" content="%s">' % echapper(titre),
                  GRILLE.name)
    GRILLE.write_text(t, encoding='utf-8')

    a = ACCUEIL.read_text(encoding='utf-8')
    a = remplacer(a, 'CHEMIN',
                  '\n    <div class="chemin" id="chemin">%s\n    </div>\n    '
                  % etapes, ACCUEIL.name)
    a = remplacer(a, 'LECONS', ligne_lecons, ACCUEIL.name)
    ACCUEIL.write_text(a, encoding='utf-8')

    print('  sections.html : %d tuiles ecrites, %d menent quelque part.'
          % (len(secs), ouvertes))
    print('  index.html    : %d etapes de chemin ecrites, %d cliquables.'
          % (len(secs), ouvertes))
    print('  %s questions comptees, %d lecons de sourate comptees.'
          % (espacer(total).replace(' ', ' '), lecons))


if __name__ == '__main__':
    main()
