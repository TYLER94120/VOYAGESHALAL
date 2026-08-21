#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pose un repere de version dans la page « A propos ».

POURQUOI
--------
Le 21 aout, Mohamed regardait une page en se demandant si c'etait la nouvelle
ou l'ancienne — et personne ne pouvait repondre, ni lui ni moi. Il etait en
fait sur un AUTRE deploiement, fige depuis des jours, avec la meme marque et
les memes couleurs.

Une page qui ne dit pas de quand elle date oblige a deviner. Deux lignes en
bas de « A propos » suffisent a trancher en une seconde.

Le repere n'est pas decoratif : c'est la date et le commit du depot, jamais
une date recopiee a la main.
"""

import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DEPOT = RACINE.parent.parent
DEBUT = '<!-- repere de version : pose par outils/poser-version.py -->'
FIN_M = '<!-- fin du repere -->'


def git(*args):
    r = subprocess.run(['git'] + list(args), capture_output=True, text=True, cwd=str(DEPOT))
    return r.stdout.strip()


def main():
    court = git('rev-parse', '--short', 'HEAD')
    date = git('log', '-1', '--format=%ad', '--date=format:%d/%m/%Y a %Hh%M')
    if not court or not date:
        sys.exit('ARRET : impossible de lire le depot. On ne pose pas de date inventee.')

    bloc = (DEBUT + '\n'
            '    <p class="c-meta">Version du site&nbsp;: <strong>' + date + '</strong>'
            ' (' + court + ').<br>Si cette date est ancienne, c\'est que la page '
            'affichee ne vient pas du dernier deploiement.</p>\n'
            + FIN_M)

    page = RACINE / 'plus.html'
    t = page.read_text(encoding='utf-8')
    if DEBUT in t:
        t = re.sub(re.escape(DEBUT) + r'.*?' + re.escape(FIN_M), bloc, t, count=1, flags=re.S)
    else:
        marque = '    <div style="height:8px"></div>'
        if marque not in t:
            sys.exit('ARRET : point d\'insertion introuvable dans plus.html.')
        t = t.replace(marque, bloc + '\n' + marque, 1)
    page.write_text(t, encoding='utf-8')
    print('  repere pose : %s (%s)' % (date, court))


if __name__ == '__main__':
    main()
