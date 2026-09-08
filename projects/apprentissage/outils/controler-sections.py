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

    # LES PAGES QUI MENENT AUX DOUZE DOIVENT Y MENER SANS JAVASCRIPT.
    #
    # `sections.html` (priorite 0,9 dans le sitemap) et `index.html` (la page
    # la mieux placee du site) n'avaient, dans le HTML servi, aucun lien vers
    # une section : la grille et le chemin sont des div vides remplis au
    # chargement. Le robot atteignait les couvertures par les lecons de
    # sourate, jamais par les deux pages faites pour ca.
    lecons = len(list(RACINE.glob('lecon-sourate-*.html')))
    mots = {20: 'Vingt', 21: 'Vingt et une', 22: 'Vingt-deux',
            23: 'Vingt-trois', 24: 'Vingt-quatre', 25: 'Vingt-cinq'}
    attendu_l = mots.get(lecons, str(lecons))

    for page in ('index.html', 'sections.html'):
        code, t = prendre('%s/%s' % (BASE, page))
        if code != 200:
            fautes.append('%s : le serveur repond %s' % (page, code))
            continue
        corps = t[t.find('<body>'):]
        vises = set(re.findall(r'href="section/([^"]+)"', corps))
        for sec in secs:
            f = RACINE / 'data' / 'questions' / ('%s.json' % sec['slug'])
            plein = bool(f.is_file() and json.loads(f.read_text(encoding='utf-8')))
            if plein and sec['slug'] not in vises:
                fautes.append('%s : aucun lien vers /section/%s dans le HTML '
                              'servi' % (page, sec['slug']))
            if not plein and sec['slug'] in vises:
                fautes.append('%s : lien vers /section/%s, qui n\'a aucune '
                              'question' % (page, sec['slug']))

        # Le nombre de lecons annonce se recompte sur les deux pages. Elles
        # ont annonce « Vingt d\'entre elles » pendant que vingt-trois lecons
        # existaient — la meme faute que sourates.html le 2 septembre, dans
        # deux fichiers de plus.
        m = re.search(r'LECONS:DEBUT -->(.*?)<!--', corps, re.S)
        if not m:
            fautes.append('%s : la marque LECONS a disparu' % page)
        elif attendu_l not in m.group(1):
            fautes.append('%s : la ligne des sourates annonce « %s », il y a '
                          '%d lecons sur le disque'
                          % (page, sans_balises(m.group(1))[:40], lecons))

    # LA MARQUE N'EST PAS DANS LE TITRE.
    #
    # Regle de la methode maison, et elle a une raison chiffree : la marque
    # mange des caracteres sur une limite d'environ soixante, a l'endroit
    # meme — le debut du titre — que Google met en gras quand il correspond a
    # la requete, et elle n'apporte rien a quelqu'un qui ne connait pas encore
    # le site. Ailleurs dans l'empire, un suffixe de marque faisait couper 383
    # titres sur 809.
    #
    # Le generateur des pages de section retombait sur « <nom> — Islam pas a
    # pas » quand le titre long depassait, et la grille s'appelait « Les 12
    # sections — Islam pas a pas » : dix-huit caracteres sur trente-trois pour
    # ne rien dire de la page. Corrige le 8 septembre 2026.
    #
    # L'ACCUEIL EST L'EXCEPTION, ET ELLE EST NOMMEE. C'est la seule page dont
    # la requete EST la marque, et la seule bien placee du site (position 6,5
    # au releve du 21 aout, sur douze impressions). Lui retirer son nom, c'est
    # risquer la seule chose qui marche pour appliquer une regle ecrite pour
    # les pages profondes.
    MARQUE = 'Islam pas à pas'
    for page in ['sections.html'] + ['section/%s' % s['slug'] for s in secs]:
        code, t = prendre('%s/%s' % (BASE, page))
        if code != 200:
            continue
        m = TITRE.search(t)
        if m and MARQUE in desechapper(m.group(1)):
            fautes.append('%s : la marque est dans le titre « %s » — elle mange '
                          '%d caracteres pour rien'
                          % (page, desechapper(m.group(1)), len(MARQUE) + 3))

    # Le total de questions n'est annonce que sur la grille.
    total = 0
    for sec in secs:
        f = RACINE / 'data' / 'questions' / ('%s.json' % sec['slug'])
        total += len(json.loads(f.read_text(encoding='utf-8'))) if f.is_file() else 0
    attendu_t = re.sub(r'\B(?=(\d{3})+(?!\d))', ' ', str(total))
    code, t = prendre('%s/sections.html' % BASE)

    # Le titre de la grille porte lui aussi le total : il doit se recompter,
    # sinon il vieillira comme « Vingt d'entre elles » l'a fait trois fois.
    mt = TITRE.search(t)
    titre_grille = desechapper(mt.group(1)) if mt else ''
    if attendu_t not in titre_grille.replace('\u00a0', ' '):
        fautes.append('sections.html : le titre « %s » n\'annonce pas les %s '
                      'questions comptees' % (titre_grille, attendu_t))
    if len(titre_grille) > 60:
        fautes.append('sections.html : titre de %d caracteres (60 au plus)'
                      % len(titre_grille))

    d = re.search(r'id="total">(.*?)</p>', t, re.S)
    if not d:
        fautes.append('sections.html : le total a disparu')
    elif attendu_t not in sans_balises(d.group(1)).replace('\u00a0', ' '):
        fautes.append('sections.html : total annonce « %s », %s questions '
                      'comptees' % (sans_balises(d.group(1)), attendu_t))

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
    print('  index.html et sections.html menent aux 11 sections pleines sans')
    print('  JavaScript, et leurs nombres — questions et lecons — sont recomptes.')


if __name__ == '__main__':
    main()
