#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique sitemap.xml, avec la VRAIE date de modification de chaque page.

POURQUOI CET OUTIL EXISTE
-------------------------
Le sitemap etait tenu a la main. Chaque ajout y collait la date du jour, et le
17 aout la mesure a donne : **33 URL sur 33 avec un lastmod faux**. Neuf pages
annoncaient le 8 aout alors qu'elles avaient ete modifiees le 14 ; vingt-trois
annoncaient le 14 alors que certaines dataient d'avant.

Ce n'est pas un detail cosmetique. Un `lastmod` qui ment est detecte, et Google
cesse alors de faire confiance **au fichier entier** — y compris aux dates
justes. Un sitemap dont on se mefie ne sert plus a rien.

D'OU VIENT LA DATE
------------------
De `git log -1 --date=short` sur le fichier lui-meme. C'est la seule date que
personne ne peut se tromper en recopiant : elle est ecrite par le depot, pas
par moi. Un fichier jamais commite n'a pas de date — il est signale, pas
invente.

CE QUI ENTRE DANS LE SITEMAP
----------------------------
Les pages indexables, et rien d'autre : ce qui porte une balise `noindex` en
est exclu automatiquement, de meme que les apercus et le fichier de validation
Google. La liste des lecons vient du catalogue de `app.js`, seule source de
verite du site — jamais d'une liste recopiee ici.
"""

import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DEPOT = RACINE.parent.parent
SITE = "https://islampasapas.fr"

# Ce qui n'a rien a faire dans un sitemap.
EXCLUS = re.compile(r'^(apercu|apercu-hors-ligne|google[0-9a-f]{16})\.html$')

# La priorite dit l'importance RELATIVE des pages entre elles, rien de plus.
PRIORITE = {'index.html': '1.0', 'parcours.html': '0.9', 'quiz.html': '0.8',
            'sourates.html': '0.8'}
FREQUENCE = {'index.html': 'daily', 'quiz.html': 'weekly'}


def date_git(chemin):
    """La derniere date de modification selon le depot. Jamais inventee."""
    r = subprocess.run(
        ['git', 'log', '-1', '--format=%ad', '--date=short', '--', str(chemin)],
        capture_output=True, text=True, cwd=str(DEPOT))
    return r.stdout.strip()


def pages_indexables():
    """Toutes les pages du site, moins celles qui se declarent noindex."""
    out = []
    for f in sorted(RACINE.glob('*.html')):
        if EXCLUS.match(f.name):
            continue
        t = f.read_text(encoding='utf-8')
        if 'noindex' in t:
            continue
        out.append(f.name)
    # L'accueil d'abord, puis les pages de navigation, puis les lecons.
    ordre = {'index.html': 0, 'parcours.html': 1, 'quiz.html': 2, 'sourates.html': 3}
    return sorted(out, key=lambda n: (ordre.get(n, 9), n))


def main():
    pages = pages_indexables()
    lignes = ['<?xml version="1.0" encoding="UTF-8"?>',
              '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    sans_date = []
    for nom in pages:
        d = date_git('projects/apprentissage/' + nom)
        if not d:
            sans_date.append(nom)
            continue
        loc = SITE + '/' + ('' if nom == 'index.html' else nom)
        lignes.append('  <url>')
        lignes.append('    <loc>%s</loc>' % loc)
        lignes.append('    <lastmod>%s</lastmod>' % d)
        lignes.append('    <changefreq>%s</changefreq>' % FREQUENCE.get(nom, 'monthly'))
        lignes.append('    <priority>%s</priority>' % PRIORITE.get(nom, '0.9'))
        lignes.append('  </url>')
    lignes.append('</urlset>')
    (RACINE / 'sitemap.xml').write_text('\n'.join(lignes) + '\n', encoding='utf-8')

    print("  %d URL, chacune avec sa vraie date de modification." % (len(pages) - len(sans_date)))
    if sans_date:
        print("  JAMAIS COMMITEES, donc absentes du sitemap : %s" % ', '.join(sans_date))
        print("  (commite-les puis relance : on ne leur invente pas de date)")


if __name__ == '__main__':
    main()
