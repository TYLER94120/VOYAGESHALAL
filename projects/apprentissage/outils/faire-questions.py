#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rassemble toutes les questions des lecons dans un seul fichier, `questions.js`.

POURQUOI EXTRAIRE PLUTOT QUE RECOPIER
-------------------------------------
Les questions existent deja : trois par lecon, ecrites, relues, sourcees — et
**enfermees**. On ne peut en rencontrer une qu'en refaisant la lecon entiere qui
la contient. Ce script les libere sans en ecrire une seule de plus : il lit les
pages du site et rend ce qu'il trouve.

Recopier a la main aurait cree une deuxieme verite, qui devient fausse au
premier changement de lecon. Ici, `questions.js` se **regenere** ; il ne
s'edite jamais.

CE QU'ON NE FAIT PAS
--------------------
- On n'invente aucune question, aucune bonne reponse, aucune mauvaise reponse.
- On ne touche pas au texte : le libelle affiche est celui de la lecon.
- Une question sans bonne reponse marquee, ou avec deux, **arrete le script** —
  c'est le genre d'erreur qui se voit mal a l'oeil et se corrige mal apres coup.
"""

import glob
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

DEBUT = ("/* Questions du site, rassemblees par outils/faire-questions.py.\n"
         "   NE PAS EDITER A LA MAIN : ce fichier se regenere depuis les lecons. */\n")


def catalogue():
    """id -> titre, lu dans app.js, seule source de verite du catalogue."""
    src = (RACINE / 'app.js').read_text(encoding='utf-8')
    bloc = src[src.index('var CATALOGUE = ['):src.index('function nomParcours')]
    out = {}
    for morceau in bloc.split('\n    {')[1:]:
        ident = re.search(r"id: '([^']+)'", morceau)
        titre = re.search(r"titre: '((?:[^'\\]|\\.)*)'", morceau)
        url = re.search(r"url: '([^']+)'", morceau)
        if ident and titre and url and 'publiee: true' in morceau:
            out[ident.group(1)] = (titre.group(1).replace("\\'", "'"), url.group(1))
    return out


def texte(html):
    """Le libelle tel qu'il s'affiche : les balises tombent, les entites restent."""
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', html)).strip()


def questions_de(page):
    src = (RACINE / page).read_text(encoding='utf-8')
    trouvees = []
    for bloc in re.findall(r'<section class="etape carte-quiz"[^>]*>(.*?)</section>', src, re.S):
        h2 = re.search(r'<h2[^>]*>(.*?)</h2>', bloc, re.S)
        opts = re.findall(r'<button class="q-opt" type="button"([^>]*)>(.*?)</button>', bloc, re.S)
        ret = re.search(r'<p class="q-retour"[^>]*>(.*?)</p>', bloc, re.S)
        if not h2 or len(opts) < 2:
            sys.exit("ARRET : question incomplete dans %s." % page)
        bonnes = [texte(t) for a, t in opts if 'data-bonne' in a]
        autres = [texte(t) for a, t in opts if 'data-bonne' not in a]
        if len(bonnes) != 1:
            sys.exit("ARRET : %d bonne(s) reponse(s) dans %s — il en faut exactement une."
                     % (len(bonnes), page))
        trouvees.append({
            'q': texte(h2.group(1)),
            'bonne': bonnes[0],
            'autres': autres,
            'quoi': texte(ret.group(1)) if ret else '',
        })
    return trouvees


def main():
    cat = catalogue()
    tout = []
    for ident, (titre, url) in cat.items():
        if not (RACINE / url).exists():
            continue
        for q in questions_de(url):
            q['lecon'] = ident
            q['titreLecon'] = titre
            q['url'] = url
            tout.append(q)

    # Deux questions au libelle identique dans deux lecons differentes ne sont
    # pas un doublon : on garde les deux, mais on le signale.
    vus = {}
    for q in tout:
        vus.setdefault(q['q'], []).append(q['lecon'])
    doubles = {k: v for k, v in vus.items() if len(v) > 1}

    (RACINE / 'questions.js').write_text(
        DEBUT + 'var IPP_QUESTIONS = ' + json.dumps(tout, ensure_ascii=False, indent=1) + ';\n',
        encoding='utf-8')

    print("  %d questions rassemblees, sur %d lecons." % (len(tout), len(cat)))
    print("  libelles repetes d'une lecon a l'autre : %d" % len(doubles))
    for k, v in list(doubles.items())[:5]:
        print("     « %s »  ->  %s" % (k[:60], ', '.join(v)))


if __name__ == '__main__':
    main()
