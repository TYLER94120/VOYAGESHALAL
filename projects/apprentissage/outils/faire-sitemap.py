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

UNE DATE PAR PAGE, DEPUIS LE 8 OCTOBRE
--------------------------------------
Jusqu'ici ce generateur posait LA MEME date sur les 53 adresses : celle du
jour ou on le lancait. Le 7 octobre, 39 pages avaient change et 14 non ; les
53 ont ete annoncees comme modifiees ce jour-la. C'est faux pour quatorze
d'entre elles, et un sitemap qui annonce faux use la confiance que Google lui
accorde — c'est exactement ce que ce fichier reproche au sitemap ecrit a la
main qu'il a remplace.

La date de chaque page est maintenant celle du DERNIER COMMIT QUI A CHANGE
SON FICHIER. C'est la seule source qui dise la verite : la date du systeme de
fichiers bouge a chaque regeneration, meme quand le generateur reecrit des
octets identiques, et elle annoncerait donc 38 lecons modifiees chaque nuit.

Une page dont le contenu differe de HEAD — modifiee mais pas encore commise —
prend la date du jour : elle vient de changer, le commit suivra.

CE QUE CETTE DATE NE SUIT PAS : le CSS et le JavaScript communs. Retoucher
une feuille de style change l'allure de 53 pages sans changer ce qu'elles
disent, et `lastmod` parle du contenu. Un fichier par page, donc, et rien
d'autre.

L'argument de ligne de commande force encore une date unique pour les 53 :
il sert a refabriquer un sitemap identique a l'octet pres.
"""

import datetime
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://islampasapas.fr'

# Ce qui ne s'indexe pas, et pourquoi c'est une liste courte et explicite.
HORS = {'qcm.html', 'corrige.html', 'resultat.html', 'reglages.html',
        'motifs.html', 'section.html',
        # La progression est celle d'une personne, lue sur son telephone :
        # pour tout autre visiteur la page est vide. Meme raison que les
        # ecrans de jeu ci-dessus.
        'progres.html',
        # La page d'erreur porte noindex : l'annoncer serait demander a
        # Google d'indexer le message qui dit qu'il n'y a rien.
        '404.html'}


def ardoise(nom):
    s = unicodedata.normalize('NFD', nom.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace("'", '-').replace(' ', '-')
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')


def git(args):
    """Sort la sortie de git, ou None si git ne repond pas."""
    try:
        r = subprocess.run(['git'] + args, cwd=str(RACINE),
                           capture_output=True, text=True)
    except OSError:
        return None
    return r.stdout if r.returncode == 0 else None


def dates_des_fichiers():
    """{nom de fichier: date}, celle du dernier commit qui l'a change.

    Un seul appel a git pour tout l'historique du dossier : 53 appels
    separes donneraient le meme resultat en cinquante fois plus de temps.

    Un fichier dont le contenu differe de HEAD prend la date du jour. C'est
    le cas normal quand ce generateur tourne : les pages viennent d'etre
    refabriquees et le commit n'est pas encore fait.
    """
    aujourdhui = datetime.date.today().isoformat()
    prefixe = (git(['rev-parse', '--show-prefix']) or '').strip()
    sortie = git(['log', '--format=%cs', '--name-only', '--', '.'])
    if sortie is None:
        return {}, aujourdhui, False

    dates, jour = {}, None
    for ligne in sortie.split('\n'):
        ligne = ligne.rstrip()
        if not ligne:
            continue
        if re.fullmatch(r'\d{4}-\d{2}-\d{2}', ligne):
            jour = ligne
        elif jour and ligne.startswith(prefixe):
            nom = ligne[len(prefixe):]
            # git log va du plus recent au plus ancien : la premiere date
            # rencontree pour un fichier est la bonne, les suivantes sont
            # son passe.
            dates.setdefault(nom, jour)

    # Ce qui a change depuis HEAD, y compris ce qui n'a jamais ete commis.
    etat = git(['status', '--porcelain', '--', '.']) or ''
    for ligne in etat.split('\n'):
        if len(ligne) > 3:
            nom = ligne[3:].split(' -> ')[-1].strip().strip('"')
            if nom.startswith(prefixe):
                dates[nom[len(prefixe):]] = aujourdhui
    return dates, aujourdhui, True


def main():
    # Une date imposee en argument s'applique aux 53 adresses : c'est ce qui
    # permet de refabriquer un sitemap identique a l'octet pres.
    impose = sys.argv[1] if len(sys.argv) > 1 else None
    dates, aujourdhui, git_la = dates_des_fichiers()

    def jour_de(fichier):
        if impose:
            return impose
        return dates.get(fichier, aujourdhui)

    urls = []

    # 1. L'accueil et les pages de contenu.
    urls.append(('/', '1.0', 'index.html'))
    for nom in ('sections.html', 'sourates.html'):
        if (RACINE / nom).is_file():
            urls.append(('/' + nom, '0.9', nom))

    # 2. Les couvertures de section — celles qui ont VRAIMENT des questions.
    #    Une section vide envoie sur « pas encore de questions » : l'annoncer
    #    a Google, c'est lui donner une page a ignorer, et nous faire perdre
    #    la confiance qu'il accorde au sitemap.
    # L'adresse d'une section est une REECRITURE : /section/<slug> sert le
    # fichier que vercel.json designe. C'est lui qu'il faut dater, pas une
    # page du meme nom qui n'existe pas.
    conf = json.loads((RACINE / 'vercel.json').read_text(encoding='utf-8'))
    cibles = {r['source']: r['destination'].lstrip('/')
              for r in conf.get('rewrites', [])}
    sections = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    vides = []
    for s in sections:
        f = RACINE / 'data' / 'questions' / ('%s.json' % s['slug'])
        if f.is_file() and json.loads(f.read_text(encoding='utf-8')):
            urls.append(('/section/' + s['slug'], '0.8',
                         cibles.get('/section/' + s['slug'],
                                    'section-%s.html' % s['slug'])))
        else:
            vides.append(s['slug'])

    # 3. Les lecons de sourate, dans l'ordre du Coran.
    noms = json.loads((RACINE / 'outils' / 'coran' / 'noms-sourates.json')
                      .read_text(encoding='utf-8'))
    lecons = 0
    for s in noms:
        f = 'lecon-sourate-%s.html' % ardoise(s['tr'])
        if (RACINE / f).is_file():
            urls.append(('/' + f, '0.8', f))
            lecons += 1

    # 4. Le reste des pages du dossier, si elles ne sont pas deja la.
    #
    #    LES FICHIERS `section-<slug>.html` N'EN SONT PAS. Ce sont les CIBLES
    #    des reecritures, pas des adresses : l'adresse d'une section est
    #    `/section/<slug>`, deja annoncee au point 2, et c'est elle que chaque
    #    page designe comme canonique. Les ajouter ici mettait la meme page
    #    deux fois dans le sitemap, sous deux adresses — exactement le doublon
    #    que ces pages viennent de supprimer. Le balayage du dossier les a
    #    ramassees des leur premiere fabrication : 40 adresses sont devenues
    #    52, dont douze doublons.
    # L'ACCUEIL EST DEJA ANNONCE, SOUS L'ADRESSE `/`.
    #
    # Le balayage qui suit ajoutait `/index.html` par-dessus : la meme page,
    # sous deux adresses, dans le meme sitemap — et celle des deux que la page
    # designe comme canonique est `/`. C'est le doublon qu'on a retire pour les
    # fichiers `section-<slug>.html` le 5 septembre ; celui-ci etait la depuis
    # le premier jour, et il touchait l'accueil, la page la mieux placee du
    # site. On declare donc `/index.html` comme deja vu.
    deja = {u for u, _, _ in urls} | {'/index.html'}
    for p in sorted(RACINE.glob('*.html')):
        if (p.name in HORS or p.name.startswith('google')
                or p.name.startswith('lecon-') or p.name.startswith('section-')):
            continue
        if '/' + p.name not in deja:
            urls.append(('/' + p.name, '0.5', p.name))

    x = ['<?xml version="1.0" encoding="UTF-8"?>',
         '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u, pr, fichier in urls:
        x += ['  <url>', '    <loc>%s%s</loc>' % (SITE, u),
              '    <lastmod>%s</lastmod>' % jour_de(fichier),
              '    <priority>%s</priority>' % pr, '  </url>']
    x.append('</urlset>')
    (RACINE / 'sitemap.xml').write_text('\n'.join(x) + '\n', encoding='utf-8')

    print('  sitemap.xml : %d adresses (%d lecons de sourate).'
          % (len(urls), lecons))
    if impose:
        print('  lastmod force a %s pour les %d, par argument.'
              % (impose, len(urls)))
    elif not git_la:
        print('  ATTENTION : git n\'a pas repondu — les %d adresses prennent'
              ' la date du jour.' % len(urls))
    else:
        par_jour = {}
        for _, _, f in urls:
            par_jour[jour_de(f)] = par_jour.get(jour_de(f), 0) + 1
        print('  une date par page, prise sur le dernier commit du fichier :')
        for j in sorted(par_jour, reverse=True):
            marque = '  (aujourd\'hui)' if j == aujourdhui else ''
            print('    %s  %2d page(s)%s' % (j, par_jour[j], marque))
    if vides:
        print('  sections sans questions, non annoncees : %s' % ', '.join(vides))


if __name__ == '__main__':
    main()
