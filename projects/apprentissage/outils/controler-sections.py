#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Demande au serveur les douze adresses de section, et lit ce qu'il rend.

POURQUOI CE CONTROLE PASSE PAR LE SERVEUR
-----------------------------------------
La faute qu'il existe pour empecher ne se voyait pas sur le disque. Les
fichiers etaient corrects ; c'est la REECRITURE qui rendait douze fois le
meme. `/section/<slug>` n'est pas un fichier : c'est une regle de
`vercel.json`. Lire le dossier ne dit rien de ce qu'un visiteur recoit.

On demande donc les adresses au serveur local — celui qui lit les memes
regles que Vercel — et on regarde le HTML rendu, avant tout JavaScript.
C'est ce que voit un robot d'indexation au premier passage.

CE QU'IL VERIFIE
----------------
 1. les douze adresses repondent ;
 2. les douze titres sont DIFFERENTS, et font 60 caracteres au plus ;
 3. chaque page designe sa propre adresse comme canonique ;
 4. chaque description tient entre 150 et 160 caracteres, et elles different ;
 5. le corps n'est pas vide AVANT JavaScript, et il nomme sa section ;
 6. le nombre de questions annonce est celui qu'on compte dans la banque ;
 7. une section sans question porte noindex, une section pleine ne l'a pas ;
 8. toute adresse de section annoncee dans sitemap.xml repond et est indexable ;
 9. `vercel.json` a une regle par section, et chaque regle vise un fichier
    qui existe.

    lancer d'abord :  python3 outils/servir.py 8899
"""

import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
BASE = 'http://127.0.0.1:8899'
SITE = 'https://islampasapas.fr'

TITRE = re.compile(r'<title>(.*?)</title>', re.S)
DESC = re.compile(r'<meta name="description" content="(.*?)">', re.S)
CANON = re.compile(r'<link rel="canonical" href="([^"]+)">')
ROBOTS = re.compile(r'<meta name="robots" content="([^"]+)">')
CORPS = re.compile(r'id="couverture">(.*?)\n</div>', re.S)


def desechapper(s):
    return (s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            .replace('&quot;', '"').replace('&nbsp;', ' '))


def sans_balises(s):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s)).strip()


def prendre(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return r.status, r.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, ''
    except Exception as e:
        sys.exit('ARRET : %s est injoignable (%s).\n'
                 '        Lancer d\'abord : python3 outils/servir.py 8899' % (url, e))


def main():
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    conf = json.loads((RACINE / 'vercel.json').read_text(encoding='utf-8'))
    sitemap = (RACINE / 'sitemap.xml').read_text(encoding='utf-8') \
        if (RACINE / 'sitemap.xml').is_file() else ''

    fautes = []
    titres, descs = {}, {}

    for sec in secs:
        slug = sec['slug']
        f = RACINE / 'data' / 'questions' / ('%s.json' % slug)
        vrai = len(json.loads(f.read_text(encoding='utf-8'))) if f.is_file() else 0

        code, t = prendre('%s/section/%s' % (BASE, slug))
        if code != 200 or not t:
            fautes.append('/section/%s : le serveur repond %s' % (slug, code))
            continue

        m = TITRE.search(t)
        titre = desechapper(m.group(1)) if m else ''
        if not titre:
            fautes.append('/section/%s : pas de <title>' % slug)
        elif len(titre) > 60:
            fautes.append('/section/%s : titre de %d caracteres (60 au plus)'
                          % (slug, len(titre)))
        titres.setdefault(titre, []).append(slug)

        d = DESC.search(t)
        desc = desechapper(d.group(1)) if d else ''
        if not desc:
            fautes.append('/section/%s : pas de meta description' % slug)
        elif not 150 <= len(desc) <= 160:
            fautes.append('/section/%s : description de %d caracteres (150 a 160)'
                          % (slug, len(desc)))
        descs.setdefault(desc, []).append(slug)

        c = CANON.search(t)
        attendu = '%s/section/%s' % (SITE, slug)
        if not c or c.group(1) != attendu:
            fautes.append('/section/%s : canonical « %s », attendu « %s »'
                          % (slug, c.group(1) if c else '—', attendu))

        # 5. LE CORPS AVANT JAVASCRIPT. C'est le point de tout ce lot :
        #    `#couverture` etait vide, et le robot ne lisait rien.
        b = CORPS.search(t)
        texte = sans_balises(desechapper(b.group(1))) if b else ''
        if len(texte) < 120:
            fautes.append('/section/%s : le corps rendu fait %d caracteres — '
                          'la page est vide avant JavaScript'
                          % (slug, len(texte)))
        if sec['nom'] not in texte:
            fautes.append('/section/%s : le corps ne nomme pas « %s »'
                          % (slug, sec['nom']))

        # 6. Le nombre annonce est le nombre compte.
        if vrai:
            attendu_txt = re.sub(r'\B(?=(\d{3})+(?!\d))', ' ', str(vrai))
            if attendu_txt not in texte:
                fautes.append('/section/%s : le corps n\'annonce pas les %s '
                              'questions comptees dans la banque'
                              % (slug, attendu_txt))

        # 7. noindex si et seulement si la section est vide.
        r = ROBOTS.search(t)
        noindex = bool(r and 'noindex' in r.group(1))
        if vrai and noindex:
            fautes.append('/section/%s : %d questions et pourtant noindex'
                          % (slug, vrai))
        if not vrai and not noindex:
            fautes.append('/section/%s : aucune question et pas de noindex — '
                          'on demande a Google d\'indexer du vide' % slug)

        # 8. Ce que le sitemap annonce doit repondre et etre indexable.
        if attendu in sitemap:
            if noindex:
                fautes.append('/section/%s : annoncee dans sitemap.xml et '
                              'marquee noindex' % slug)
            if not vrai:
                fautes.append('/section/%s : annoncee dans sitemap.xml sans '
                              'aucune question' % slug)

    # 2 et 4. Deux adresses ne doivent jamais porter le meme titre ni la meme
    # description : c'est exactement l'etat d'ou l'on vient.
    for t, sl in titres.items():
        if len(sl) > 1:
            fautes.append('%d adresses portent le titre « %s » : %s'
                          % (len(sl), t, ', '.join(sl)))
    for d, sl in descs.items():
        if len(sl) > 1:
            fautes.append('%d adresses portent la meme description : %s'
                          % (len(sl), ', '.join(sl)))

    # LE SITEMAP N'ANNONCE JAMAIS LE FICHIER, TOUJOURS L'ADRESSE.
    # `section-<slug>.html` est la cible d'une reecriture ; l'adresse d'une
    # section est `/section/<slug>`. Le balayage du dossier a ramasse les
    # douze fichiers des leur premiere fabrication et les a ajoutes au
    # sitemap a cote des adresses : 40 entrees etaient devenues 52, dont
    # douze fois la meme page sous deux adresses — le doublon meme que ces
    # pages viennent de supprimer.
    for f in sorted(RACINE.glob('section-*.html')):
        if '%s/%s' % (SITE, f.name) in sitemap:
            fautes.append('sitemap.xml annonce le fichier %s ; il doit '
                          'annoncer l\'adresse /section/<slug>' % f.name)

    # 9. Une regle par section, et chaque regle vise un fichier present.
    regles = {r['source']: r['destination'] for r in conf.get('rewrites', [])}
    for sec in secs:
        s = '/section/%s' % sec['slug']
        if s not in regles:
            fautes.append('vercel.json : aucune reecriture pour %s' % s)
        elif not (RACINE / regles[s].lstrip('/')).is_file():
            fautes.append('vercel.json : %s vise %s, qui n\'existe pas'
                          % (s, regles[s]))

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    print('  %d adresses de section demandees au serveur.' % len(secs))
    print('  %d titres distincts, %d descriptions distinctes, '
          'un canonical par page.' % (len(titres), len(descs)))
    print('  Corps rendu avant JavaScript, nombres de questions recomptes,')
    print('  noindex sur la seule section vide, et une reecriture par section.')


if __name__ == '__main__':
    main()
