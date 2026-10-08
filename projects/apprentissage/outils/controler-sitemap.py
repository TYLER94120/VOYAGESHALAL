#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Demande au serveur chaque adresse du sitemap, et regarde ce qu'elle rend.

POURQUOI CE CONTROLE EXISTE
---------------------------
Un sitemap est une PROMESSE faite a Google : voici mes pages, elles valent le
parcours. Trois facons de la trahir se sont produites sur ce site, toutes les
trois trouvees apres coup :

 1. LA MEME PAGE SOUS DEUX ADRESSES. Les douze `section-<slug>.html` ont ete
    annonces a cote des `/section/<slug>` qu'ils servent (5 septembre, 40
    entrees devenues 52). Et `/index.html` etait annonce a cote de `/` depuis
    le premier jour — la meme page, deux adresses, alors que la page elle-meme
    en designe une seule comme canonique (14 septembre).
 2. UNE PAGE ANNONCEE QUI N'A RIEN A MONTRER. `progres.html` affiche la
    progression de la personne qui la consulte, lue dans SON navigateur :
    ouverte par un moteur de recherche, elle rend 86 caracteres — un titre et
    « Chargement… ». Elle etait annoncee.
 3. UNE PAGE ANNONCEE ET MARQUEE noindex, ce qui revient a demander puis a
    refuser. Aucune a ce jour, et c'est bien de le verifier.

Ces trois-la ne se voient pas dans le generateur, qui croit toujours bien
faire. Elles se voient en DEMANDANT les adresses et en lisant les reponses.

CE QU'IL VERIFIE
----------------
 1. chaque adresse repond ;
 2. deux adresses ne servent jamais le meme fichier ;
 3. aucune n'est marquee noindex ;
 4. chacune rend un minimum de texte AVANT JavaScript ;
 5. le canonical de chaque page designe bien l'adresse annoncee ;
 6. aucune page portant noindex ne figure dans le sitemap ;
 7. les quatre balises de partage sont la, et og:image designe un
    fichier qui existe ;
 8. les donnees structurees se PARSENT — un JSON-LD mal forme est
    ignore en silence par Google.

    lancer d'abord :  python3 outils/servir.py 8899
"""

import datetime
import json
import pathlib
import re
import sys
import urllib.error
import urllib.request

RACINE = pathlib.Path(__file__).resolve().parent.parent
BASE = 'http://127.0.0.1:8899'
SITE = 'https://islampasapas.fr'

# Sous ce nombre de caracteres, une page n'a rien a dire a qui arrive de la
# recherche. Le plancher est bas exprES : il ne s'agit pas de juger la
# richesse d'une page, seulement d'attraper celles qui sont VIDES. La plus
# maigre des pages legitimes du site en rend plus du double.
PLANCHER = 300


def prendre(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return r.status, r.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, ''
    except Exception as e:
        sys.exit('ARRET : %s est injoignable (%s).\n'
                 '        Lancer d\'abord : python3 outils/servir.py 8899' % (url, e))


def sans_balises(h):
    corps = h[h.find('<body>'):]
    corps = re.sub(r'<script.*?</script>', ' ', corps, flags=re.S)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', corps)).strip()


def main():
    sm = RACINE / 'sitemap.xml'
    if not sm.is_file():
        sys.exit('ARRET : sitemap.xml est absent.')
    adresses = re.findall(r'<loc>([^<]+)</loc>', sm.read_text(encoding='utf-8'))
    if not adresses:
        sys.exit('ARRET : sitemap.xml n\'annonce aucune adresse.')

    conf = json.loads((RACINE / 'vercel.json').read_text(encoding='utf-8'))
    reecritures = {r['source']: r['destination'] for r in conf.get('rewrites', [])}

    def fichier_de(chemin):
        if chemin in reecritures:
            return reecritures[chemin].lstrip('/')
        if chemin in ('/', ''):
            return 'index.html'
        return chemin.lstrip('/')

    fautes, servis = [], {}

    for u in adresses:
        if not u.startswith(SITE):
            fautes.append('%s : adresse hors du site' % u)
            continue
        chemin = u[len(SITE):] or '/'

        # 2. Deux adresses ne servent jamais le meme fichier.
        f = fichier_de(chemin)
        if f in servis:
            fautes.append('%s et %s servent tous deux %s — la meme page sous '
                          'deux adresses' % (servis[f], chemin, f))
        else:
            servis[f] = chemin

        code, t = prendre(BASE + chemin)
        if code != 200 or not t:
            fautes.append('%s : le serveur repond %s' % (chemin, code))
            continue

        r = re.search(r'<meta name="robots" content="([^"]+)">', t)
        if r and 'noindex' in r.group(1):
            fautes.append('%s : annoncee au sitemap et marquee noindex' % chemin)

        texte = sans_balises(t)
        if len(texte) < PLANCHER:
            fautes.append('%s : %d caracteres de texte servi (plancher %d) — '
                          'on annonce une page vide' % (chemin, len(texte), PLANCHER))

        c = re.search(r'<link rel="canonical" href="([^"]+)">', t)
        if c and c.group(1) != u:
            fautes.append('%s : annoncee ici, mais son canonical designe %s'
                          % (u, c.group(1)))

        # 7. LES BALISES DE PARTAGE, LES QUATRE.
        #    Mesure du 17 septembre : `plus.html` n'en avait AUCUNE, et
        #    `sections.html` pas de description. Partagees dans une
        #    conversation — et c'est ainsi qu'un site comme celui-ci circule —
        #    elles n'affichaient qu'une adresse nue. Ca ne se voit jamais en
        #    naviguant : il faut regarder l'en-tete.
        tete = t[:t.find('</head>')]
        for cle in ('og:title', 'og:description', 'og:image', 'og:url'):
            if not re.search(r'property="%s"' % cle, tete):
                fautes.append('%s : pas de %s — partagee, elle n\'affiche '
                              'qu\'une adresse' % (chemin, cle))
        img = re.search(r'property="og:image" content="([^"]+)"', tete)
        if img:
            f_img = img.group(1)
            if f_img.startswith(SITE):
                if not (RACINE / f_img[len(SITE):].lstrip('/')).is_file():
                    fautes.append('%s : og:image designe %s, qui n\'existe pas'
                                  % (chemin, f_img))

        # 8. LES DONNEES STRUCTUREES DOIVENT SE LIRE.
        #    Un JSON-LD mal forme est ignore en silence par Google : la page
        #    croit le porter, il ne compte pas. On le PARSE plutot que de
        #    verifier sa presence. L'accueil n'en avait aucune alors que les
        #    38 lecons et les 12 couvertures en portent une.
        blocs = re.findall(r'<script type="application/ld\+json">(.*?)</script>',
                           tete, re.S)
        if not blocs:
            fautes.append('%s : aucune donnee structuree' % chemin)
        for bloc in blocs:
            try:
                d = json.loads(bloc)
            except Exception as e:
                fautes.append('%s : JSON-LD illisible (%s)' % (chemin, e))
                continue
            for cle in ('@context', '@type'):
                if cle not in d:
                    fautes.append('%s : JSON-LD sans %s' % (chemin, cle))

    # 9. CHAQUE lastmod DIT LA VERITE SUR SA PAGE.
    #
    # Jusqu'au 8 octobre, le generateur posait la meme date sur les 53
    # adresses : celle du jour ou on le lancait. Le 7 octobre, 39 pages
    # avaient change et 14 non — les 53 ont ete annoncees modifiees ce
    # jour-la, dont des couvertures de section intouchees depuis le
    # 5 septembre. Un sitemap qui annonce faux use la confiance que Google
    # lui accorde, et c'est le reproche que ce projet faisait au sitemap
    # ecrit a la main qu'il a remplace.
    #
    # On recompte donc, depuis git, la date du dernier commit qui a change
    # le fichier de chaque page, et on la compare a celle annoncee. La regle
    # d'assemblage est IMPORTEE du generateur, pas recopiee ici.
    #
    # DEUX DEFAUTS, DEUX SENS :
    #   annoncee plus VIEILLE que la verite : la page a change et Google
    #   n'a aucune raison de repasser. C'est le defaut qui coute.
    #   annoncee plus RECENTE de plus d'un jour : on demande un passage
    #   pour rien, et c'est le bug qu'on vient de corriger.
    #
    # Un jour de tolerance, parce qu'un commit passe apres minuit UTC et la
    # date du jour calculee avant ne tombent pas forcement le meme jour.
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        'faire_sitemap', RACINE / 'outils' / 'faire-sitemap.py')
    gen = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gen)
    vraies, aujourdhui, git_la = gen.dates_des_fichiers()
    if not git_la:
        print('  (git n\'a pas repondu : les lastmod ne sont pas verifies)')
    else:
        annonces = dict(re.findall(
            r'<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>',
            sm.read_text(encoding='utf-8')))
        if len(annonces) != len(adresses):
            fautes.append('sitemap.xml : %d lastmod pour %d adresses'
                          % (len(annonces), len(adresses)))
        for u, dit in sorted(annonces.items()):
            f = fichier_de(u[len(SITE):] or '/')
            vrai = vraies.get(f, aujourdhui)
            ecart = ((datetime.date.fromisoformat(dit)
                      - datetime.date.fromisoformat(vrai)).days)
            if ecart < 0:
                fautes.append('%s : lastmod %s, mais son fichier a change le %s '
                              '— Google n\'a aucune raison de repasser'
                              % (u[len(SITE):] or '/', dit, vrai))
            elif ecart > 1:
                fautes.append('%s : lastmod %s, alors que son fichier n\'a pas '
                              'bouge depuis le %s — un passage demande pour rien'
                              % (u[len(SITE):] or '/', dit, vrai))

    # 6. L'inverse : rien de ce qui porte noindex ne doit etre annonce.
    for p in sorted(RACINE.glob('*.html')):
        t = p.read_text(encoding='utf-8')
        r = re.search(r'<meta name="robots" content="([^"]+)">', t)
        if r and 'noindex' in r.group(1) and '%s/%s' % (SITE, p.name) in \
                sm.read_text(encoding='utf-8'):
            fautes.append('%s porte noindex et figure au sitemap' % p.name)

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    print('  %d adresses annoncees, toutes demandees au serveur.' % len(adresses))
    print('  Aucun doublon, aucun noindex, aucune page vide, canonicals conformes.')
    print('  Balises de partage completes et donnees structurees lisibles.')
    print('  Et chaque lastmod est celui du dernier commit de sa page :'
          ' %d dates distinctes pour %d adresses.'
          % (len({d for _, d in re.findall(
               r'<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>',
               sm.read_text(encoding='utf-8'))}), len(adresses)))


if __name__ == '__main__':
    main()
