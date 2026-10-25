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
import unicodedata
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


def desechapper(s):
    """Les entites HTML des titres : &nbsp; et &#39; surtout."""
    for avant, apres in (('&amp;', '&'), ('&nbsp;', ' '), ('&#39;', "'"),
                         ('&quot;', '"'), ('&lt;', '<'), ('&gt;', '>')):
        s = s.replace(avant, apres)
    return s.replace('\u00a0', ' ')


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

    # 10. AUCUN TITRE, AUCUNE DESCRIPTION NE PROMET UN MERITE.
    #
    # Le carnet de l'empire, 25 aout : quatre titres de voyageshalal
    # promettaient une salle de priere que l'article declarait inexistante.
    # « Les descriptions, elles, etaient honnetes. SEUL LE TITRE MENTAIT —
    # c'est-a-dire la seule ligne que Google affiche et la seule sur laquelle
    # on clique. »
    #
    # Ici la promesse intenable est le merite d'une sourate : « les vertus
    # de… », « celui qui la recite… », « elle protege de… ». Tres cherche, et
    # ce projet n'a aucune traduction francaise sourcee des hadiths qui le
    # portent. Un titre qui le promettrait engagerait Mohamed sur un contenu
    # qui n'existe pas.
    #
    # controler-questions.py tient la meme regle dans les 2 701 questions.
    # Celui-ci la tient sur les deux lignes que Google AFFICHE, et c'est la
    # qu'elle avait casse ailleurs.
    #
    # Pas de depouillement de citation ici : un titre ou une description ne
    # cite jamais un verset. Les 53 pages sont la voix du site, entiere.
    #
    # Mesure du 15 octobre : 53 titres, 53 descriptions, zero promesse.
    # « recite » TOUT SEUL NE VA PAS, et le premier jet de ce controle l'a
    # montre en refusant « Le sens des sourates : comprendre ce qu'on
    # recite ». Ce titre ne promet rien : il dit ce que la section enseigne.
    # Ce qui est intenable, c'est le MERITE attache a l'acte de reciter —
    # « celui qui la recite… » — pas le verbe. On garde donc la locution
    # entiere. Meme regle, deux surfaces, deux pieges differents : ici le mot
    # trop large, dans les questions le texte cite.
    MERITES = ('bienfait', 'merite', 'vertu', 'recompense', 'protege',
               'protection', 'guerit', 'guerison', 'exauce', 'benediction',
               'baraka', 'equivaut',
               'celui qui la recite', 'celui qui le recite',
               'celle qui la recite', 'quiconque la recite')

    def aplatir(s):
        s = unicodedata.normalize('NFD', desechapper(s))
        s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
        return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()

    for u in adresses:
        chemin = u[len(SITE):] or '/'
        code, page = prendre(BASE + chemin)
        if code != 200 or not page:
            continue
        for quoi, motif in (('titre', r'<title>(.*?)</title>'),
                            ('description',
                             r'<meta name="description" content="(.*?)"')):
            m = re.search(motif, page, re.S)
            if not m:
                continue
            plat = aplatir(m.group(1))
            for mot in MERITES:
                if mot in plat:
                    fautes.append(
                        '%s : le %s promet « %s » — aucun hadith source ne le '
                        'porte sur ce site : « %s »'
                        % (chemin, quoi, mot, desechapper(m.group(1))[:60]))

    # ================================================================
    # 11. AUCUNE PAGE N'ANNONCE UNE SORTE DE SOURCE QUE LES BANQUES
    #     NE PORTENT PAS — AJOUTE LE 23 OCTOBRE
    # ================================================================
    #
    # CE QUE LA MESURE DU 23 OCTOBRE A TROUVE. `plus.html` — la page « A
    # propos », celle ou un lecteur attentif va voir si le site est serieux —
    # annoncait : « Chaque question sort d'une source verifiable : un verset
    # avec sa sourate et son numero, OU UN HADITH AVEC SON RECUEIL, SON
    # RAPPORTEUR ET SON NUMERO. »
    #
    # Compte le meme soir : sur 2 701 questions, ZERO cite un hadith, un
    # recueil ou un rapporteur. Le projet n'a aucune traduction francaise de
    # hadith qui soit sourcee — mesure du 21 octobre — et depuis le 21 octobre
    # `controler-questions.py` INTERDIT d'en citer un. La page decrivait donc
    # une pratique que le projet a formellement ecartee.
    #
    # Ce n'est pas une phrase fausse sur les questions : toutes satisfont la
    # premiere branche. C'est une phrase qui annonce au lecteur qu'il va
    # rencontrer des hadiths sources, et il n'en rencontrera aucun. C'est le
    # meme defaut que les quatre titres de voyageshalal qui promettaient une
    # salle de priere que l'article declarait inexistante.
    #
    # LA REGLE SE LIE AUX BANQUES, PAS A UN MOT. On compte d'abord combien de
    # questions citent reellement un hadith. Si c'est zero, aucune page
    # indexable ne doit en parler. Si Mohamed obtient un jour une traduction
    # avec un traducteur nomme et que des questions en citent, ce controle se
    # taira de lui-meme : il interdit de promettre PLUS que ce que les banques
    # tiennent, pas de prononcer un mot.
    #
    # LE PIEGE, MESURE AVANT D'ECRIRE LA REGLE. « recueil » tout court est
    # dans DEUX pages : plus.html et lecon-sourate-an-nazi-at.html, ou
    # Hamidullah ecrit « Et par ceux qui recueillent avec douceur ». Un
    # controle sur « recueil » accuserait donc un verset du Coran. On cherche
    # « recueil de ». Meme famille de piege que le point 10 au-dessus.
    SOURCES_HADITH = re.compile(
        r'hadith|recueil de|rapporteur|sunna|boukhari|bukhari|mouslim'
        r'|sahih|abou dawoud|abu dawud|tirmidhi|ibn maja|sunan|muwatta')
    questions_hadith = 0
    for banque in sorted((RACINE / 'data' / 'questions').glob('*.json')):
        for q in json.loads(banque.read_text(encoding='utf-8')):
            if SOURCES_HADITH.search(aplatir(q.get('source') or '')):
                questions_hadith += 1

    pages_qui_annoncent = []
    if questions_hadith == 0:
        for u in adresses:
            chemin = u[len(SITE):] or '/'
            code, page = prendre(BASE + chemin)
            if code != 200 or not page:
                continue
            plat = aplatir(sans_balises(page))
            vus = sorted({m.group(0) for m in SOURCES_HADITH.finditer(plat)})
            if vus:
                pages_qui_annoncent.append(chemin)
                fautes.append(
                    '%s : la page parle de %s alors qu\'AUCUNE des %d questions '
                    'ne cite un hadith. Le projet n\'a pas de traduction '
                    'francaise sourcee de hadith, et controler-questions.py '
                    'interdit d\'en citer une : une page qui en annonce fait '
                    'attendre au lecteur ce qu\'il ne trouvera pas.'
                    % (chemin, ', '.join('« %s »' % v for v in vus),
                       sum(len(json.loads(b.read_text(encoding='utf-8')))
                           for b in sorted((RACINE / 'data' / 'questions')
                                           .glob('*.json')))))

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

    # ================================================================
    # 12. robots.txt — AJOUTE LE 25 OCTOBRE
    # ================================================================
    #
    # CE QUE L'AUDIT DU 25 OCTOBRE A TROUVE. En appliquant la regle de la
    # veille — « partout ou un controle peut se taire, son silence doit etre
    # une faute » — j'ai essaye d'ecarter onze fichiers un par un et de
    # relancer la suite entiere a chaque fois.
    #
    # Dix d'entre eux font rougir au moins un controle. `data/images.json`,
    # que douze contrôles Python ignorent, est rattrape par
    # `controler-donnees.mjs`. UN SEUL ne fait rougir PERSONNE :
    #
    #     robots.txt ecarte  ->  9 controles Python verts
    #                            30 controles de navigateur verts
    #
    # Les trente-neuf. C'est verifie en les lancant tous, pas en lisant leur
    # code : un audit qui ne visite pas tout mesure son propre parcours.
    #
    # ET C'EST LE PIRE ENDROIT POUR UN TROU. robots.txt est le seul fichier
    # du site dont UNE LIGNE peut faire disparaitre les 53 adresses de
    # Google : « Disallow: / » suffit. C'est aussi lui qui dit ou se trouve
    # le sitemap. Il est ecrit a la main — comme plus.html, qui portait
    # avant-hier la seule affirmation fausse du site. Les fichiers ecrits a
    # la main sont peu nombreux et ce sont eux qui portent les accidents.
    #
    # CE QUI EST VERIFIE, ET POURQUOI CHAQUE POINT
    #   a. il est SERVI, en 200, et non vide — l'absence est une faute ;
    #   b. aucune regle ne barre tout le site ;
    #   c. aucune regle ne barre une adresse que le sitemap annonce — la
    #      contradiction qui tue l'indexation sans rien casser de visible ;
    #   d. il declare le sitemap UNE fois, a l'adresse canonique absolue,
    #      et cette adresse-la repond.
    code_r, robots = prendre(BASE + '/robots.txt')
    if code_r != 200 or not robots.strip():
        fautes.append(
            'robots.txt : servi en %s%s. C\'est le seul fichier dont une '
            'ligne peut retirer les %d adresses de Google, et le seul que '
            'les 39 controles laissaient disparaitre sans broncher.'
            % (code_r, ' et vide' if code_r == 200 else '', len(adresses)))
    else:
        # Les regles, groupe par groupe : une regle ne vaut que pour le
        # `User-agent` qui la precede.
        agent, interdits, sitemaps = None, [], []
        for ligne in robots.splitlines():
            ligne = ligne.split('#')[0].strip()
            if not ligne or ':' not in ligne:
                continue
            cle, _, val = ligne.partition(':')
            cle, val = cle.strip().lower(), val.strip()
            if cle == 'user-agent':
                agent = val
            elif cle == 'disallow' and val:
                interdits.append((agent, val))
            elif cle == 'sitemap':
                sitemaps.append(val)

        for ag, val in interdits:
            if val == '/':
                fautes.append(
                    'robots.txt : « Disallow: / » pour « User-agent: %s » — '
                    'le site entier est retire de la recherche' % ag)
                continue
            # Une interdiction qui recouvre une adresse annoncee au sitemap :
            # on annonce la page a Google et on lui defend de la lire.
            touchees = [u[len(SITE):] or '/' for u in adresses
                        if (u[len(SITE):] or '/').startswith(val)]
            if touchees:
                fautes.append(
                    'robots.txt : « Disallow: %s » couvre %d adresse(s) que '
                    'le sitemap annonce (%s%s) — on les montre a Google et '
                    'on lui defend de les lire'
                    % (val, len(touchees), ', '.join(touchees[:3]),
                       ' …' if len(touchees) > 3 else ''))

        attendu = '%s/sitemap.xml' % SITE
        if sitemaps != [attendu]:
            fautes.append(
                'robots.txt : il faut une seule ligne « Sitemap: %s » ; '
                'trouve %s' % (attendu, sitemaps or 'aucune'))
        else:
            code_s, corps_s = prendre(BASE + '/sitemap.xml')
            if code_s != 200 or '<loc>' not in corps_s:
                fautes.append('robots.txt annonce %s, qui repond %s'
                              % (attendu, code_s))

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
    print('  %d titres et %d descriptions relus : aucune promesse de merite.'
          % (len(adresses), len(adresses)))
    print('  robots.txt : %d octets, %d regle(s) Disallow, sitemap declare '
          'une fois et il repond.'
          % (len(robots.encode('utf-8')), len(interdits)))
    # Le MESURE, pas un verdict : les deux nombres se lisent ensemble.
    print('  %d question(s) citent un hadith ; %d page(s) indexable(s) en '
          'parlent.' % (questions_hadith, len(pages_qui_annoncent)))
    print('  Et chaque lastmod est celui du dernier commit de sa page :'
          ' %d dates distinctes pour %d adresses.'
          % (len({d for _, d in re.findall(
               r'<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>',
               sm.read_text(encoding='utf-8'))}), len(adresses)))


if __name__ == '__main__':
    main()
