#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le sitemap, lu sur le site reel plutot qu'ecrit a la main.

POURQUOI IL EST GENERE
----------------------
Le sitemap etait tenu a la main. Il annoncait donc, apres la refonte du
21 aout, une section `/section/vie-du-prophete` qui n'a aucune question — et
il ignorait les vingt lecons de sourate. Un sitemap ecrit a la main dit
toujours l'etat du site le jour ou quelqu'un a pense a le rouvrir.

Celui-ci enumere ce qui EXISTE : les pages du dossier, les sections qui ont
vraiment une banque, les lecons vraiment presentes sur le disque.

CE QU'ON N'Y MET PAS
--------------------
Les ecrans de jeu — `qcm.html`, `corrige.html`, `resultat.html`,
`reglages.html` — n'ont aucun contenu hors session : ouverts par un moteur de
recherche, ils affichent « Rien a jouer ». Les proposer serait promettre du
vide. La planche `motifs.html` est une page de controle interne.
"""

import datetime
import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://islampasapas.fr'

# Ce qui ne s'indexe pas, et pourquoi c'est une liste courte et explicite.
HORS = {'qcm.html', 'corrige.html', 'resultat.html', 'reglages.html',
        'motifs.html', 'section.html'}


def ardoise(nom):
    s = unicodedata.normalize('NFD', nom.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace("'", '-').replace(' ', '-')
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')


def main():
    jour = (sys.argv[1] if len(sys.argv) > 1
            else datetime.date.today().isoformat())
    urls = []

    # 1. L'accueil et les pages de contenu.
    urls.append(('/', '1.0'))
    for nom in ('sections.html', 'sourates.html'):
        if (RACINE / nom).is_file():
            urls.append(('/' + nom, '0.9'))

    # 2. Les couvertures de section — celles qui ont VRAIMENT des questions.
    #    Une section vide envoie sur « pas encore de questions » : l'annoncer
    #    a Google, c'est lui donner une page a ignorer, et nous faire perdre
    #    la confiance qu'il accorde au sitemap.
    sections = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    vides = []
    for s in sections:
        f = RACINE / 'data' / 'questions' / ('%s.json' % s['slug'])
        if f.is_file() and json.loads(f.read_text(encoding='utf-8')):
            urls.append(('/section/' + s['slug'], '0.8'))
        else:
            vides.append(s['slug'])

    # 3. Les lecons de sourate, dans l'ordre du Coran.
    noms = json.loads((RACINE / 'outils' / 'coran' / 'noms-sourates.json')
                      .read_text(encoding='utf-8'))
    lecons = 0
    for s in noms:
        f = 'lecon-sourate-%s.html' % ardoise(s['tr'])
        if (RACINE / f).is_file():
            urls.append(('/' + f, '0.8'))
            lecons += 1

    # 4. Le reste des pages du dossier, si elles ne sont pas deja la.
    deja = {u for u, _ in urls}
    for p in sorted(RACINE.glob('*.html')):
        if p.name in HORS or p.name.startswith('google') or p.name.startswith('lecon-'):
            continue
        if '/' + p.name not in deja:
            urls.append(('/' + p.name, '0.5'))

    x = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, pr in urls:
        x += ['  <url>', '    <loc>%s%s</loc>' % (SITE, u),
              '    <lastmod>%s</lastmod>' % jour,
              '    <priority>%s</priority>' % pr, '  </url>']
    x.append('</urlset>')
    (RACINE / 'sitemap.xml').write_text('\n'.join(x) + '\n', encoding='utf-8')

    print('  sitemap.xml : %d adresses (%d lecons de sourate).' % (len(urls), lecons))
    if vides:
        print('  sections sans questions, non annoncees : %s' % ', '.join(vides))


if __name__ == '__main__':
    main()
