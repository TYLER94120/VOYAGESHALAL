#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Une page par section, avec son titre, son adresse canonique et son contenu.

CE QUI ETAIT CASSE, ET COMMENT ON L'A VU
----------------------------------------
Le site declare douze adresses `/section/<slug>`, dont ONZE dans sitemap.xml.
En les demandant au serveur local — pas en lisant le code — on obtient douze
fois le meme fichier `section.html`, c'est-a-dire :

  * le meme <title> pour les douze : « Section — Islam pas a pas » ;
  * la meme meta description pour les douze ;
  * AUCUN <link rel="canonical"> ;
  * un corps VIDE : `<div class="ecran" id="couverture"></div>`, que le
    JavaScript remplit au chargement, et un <noscript> qui dit « cette page
    a besoin de JavaScript ».

Autrement dit, le site demandait a Google de parcourir onze adresses qui lui
rendent la meme page vide. `section.js` corrige bien le titre a l'execution
(`document.title = ...`), mais le HTML servi, lui, ne le sait pas, et rien
n'y designe l'adresse canonique.

CE QUE CE GENERATEUR FAIT
-------------------------
Il ecrit un fichier par section, `section-<slug>.html`, qui porte :
  * son titre, sa description et son canonical vers `/section/<slug>` ;
  * un CORPS DEJA ECRIT, dans le meme `#couverture` que le JavaScript
    remplira. La page a donc du texte avant que le moindre script tourne,
    et l'application reste exactement celle d'aujourd'hui par-dessus.

TOUS LES CHIFFRES SONT COMPTES, AUCUN N'EST ANNONCE. Le nombre de questions,
celui des themes et la repartition par niveau sont lus dans les banques, au
moment de la fabrication, avec le meme code de comptage que `section.js`
applique au chargement. Une section vide le DIT et n'offre pas de bouton.

CE QU'IL N'ECRIT PAS
--------------------
Rien qui ne soit deja dans `data/sections.json` ou dans les banques. Les noms
et les phrases de presentation sont ceux qui existent depuis le cahier V2 ;
ce generateur ne redige aucune definition, n'explique aucun point de
religion, ne resume aucun contenu. Il met en page ce qui est deja ecrit.

UNE SECTION SANS QUESTION PORTE noindex. Elle garde son adresse — un lien
depose ailleurs doit continuer de mener quelque part — mais on ne demande pas
a Google d'indexer une page qui annonce du vide.
"""

import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://islampasapas.fr'

NIVEAUX = {1: 'Début', 2: 'Intermédiaire', 3: 'Expert'}


def echapper(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def espacer(n):
    """1259 -> « 1 259 », avec une espace insecable."""
    s = str(n)
    out = ''
    for i, c in enumerate(reversed(s)):
        if i and i % 3 == 0:
            out = ' ' + out
        out = c + out
    return out


def sans_point(s):
    return str(s or '').strip().rstrip('.')


def minuscule(s):
    """« Comprendre ce qu'on recite » -> « comprendre ce qu'on recite »."""
    s = sans_point(s)
    return (s[:1].lower() + s[1:]) if s else s


def titre_de(sec):
    """Le nom de la section, puis ce qu'elle couvre — les deux deja ecrits.

    ON NE REDIGE PAS UN TITRE ICI, on assemble deux champs releves depuis le
    cahier V2 : `nom` et `quoi`. Ecrire douze titres a la main serait ecrire
    douze fois ce que le site dit deja ailleurs, et prendre le risque que les
    deux divergent. La regle de la ronde veut les mots de la requete EN DEBUT
    et moins de 60 caracteres marque comprise ; le nom de la section est
    justement ce qu'on tape, il vient donc en premier.

    QUAND L'ASSEMBLAGE DEPASSE, on retombe sur la forme que `section.js` pose
    deja au chargement — « <nom> — Islam pas a pas » — plutot que de tronquer
    `quoi`. Couper « la parole, la colere, les parents, les voisins » apres
    deux elements donnerait un titre qui annonce moins que la section ne
    contient : plus court, mais faux.

    Deux sections y tombent aujourd'hui, « Le comportement » et « Vocabulaire
    arabe », a trois et quatre caracteres pres. Leur titre gagnerait a etre
    plus precis, mais cela se joue dans `data/sections.json`, en raccourcissant
    leur champ `quoi` — c'est une decision de redaction, pas de generateur.
    """
    # DEUX-POINTS UNE SEULE FOIS PAR TITRE. « La zakat et l'aumone » a pour
    # phrase « Donner : a qui, combien, quand » : le joint habituel donnait
    # « La zakat et l'aumone : donner : a qui, combien, quand », qu'on lit
    # deux fois avant de comprendre. Quand la phrase porte deja son
    # deux-points, on joint au tiret.
    quoi = minuscule(sec.get('quoi'))
    joint = ' — ' if ':' in quoi else ' : '
    long = sec['nom'] + joint + quoi
    if len(long) <= 60:
        return long
    return '%s — Islam pas à pas' % sec['nom']


def description_de(sec, n, t):
    """Entre 150 et 160 caracteres, et rien qui ne soit vrai.

    La longueur depend du nom de la section, de sa phrase de presentation et
    de son nombre de questions : « La zakat et l'aumone » et « Le jeune et le
    Ramadan » ne laissent pas la meme place. Une seule formulation ne peut
    donc pas tenir pour les douze.

    On assemble alors une phrase en trois morceaux — un debut, un milieu
    facultatif, une fin — et on essaie les combinaisons dans l'ordre jusqu'a
    en trouver une qui tombe dans la fenetre. Les morceaux sont ecrits pour
    que TOUTES les combinaisons soient vraies : aucune ne promet un theme,
    une source ou une gratuite que la section n'aurait pas. C'est ce qui
    permet de laisser la longueur choisir ; sinon il faudrait relire douze
    phrases a chaque fois qu'une banque grossit.
    """
    quoi = minuscule(sec.get('quoi'))
    # Meme regle que pour le titre : pas deux deux-points dans une phrase.
    joints = ['%s — %s. '] if ':' in quoi else ['%s : %s. ', '%s — %s. ']
    if not n:
        debuts = [j % (sec['nom'], quoi) for j in joints] + ['%s. ' % sec['nom']]
        fins = ["Cette section du QCM « Islam pas à pas » n'a pas encore de "
                "questions ; rien n'y sera publié sans avoir été vérifié et sourcé.",
                "Cette section du QCM « Islam pas à pas » n'a pas encore de "
                "questions ; rien n'y paraîtra sans être vérifié et sourcé.",
                "Cette section du QCM « Islam pas à pas » n'a pas encore de "
                "questions : rien n'y paraîtra sans source.",
                "Section du QCM « Islam pas à pas » encore sans questions : "
                "rien n'y paraîtra sans avoir été vérifié.",
                "Section du QCM « Islam pas à pas » encore sans questions.",
                "Section du QCM « Islam pas à pas », encore vide."]
        essais = [d + f for d in debuts for f in fins]
    else:
        debuts = [j % (sec['nom'], quoi) for j in joints]
        milieux = ['%s questions à choix multiples réparties en %d thèmes'
                   % (espacer(n), t),
                   '%s questions à choix multiples en %d thèmes' % (espacer(n), t),
                   '%s questions à choix multiples' % espacer(n)]
        fins = [', chacune accompagnée de la source de sa réponse. Gratuit, '
                'sans compte, sur téléphone.',
                ', chacune accompagnée de la source de sa réponse. Gratuit et '
                'sans compte.',
                ', chacune avec la source de sa réponse. Gratuit, sans compte, '
                'sur téléphone.',
                ', chacune avec la source de sa réponse. Gratuit, sans compte.',
                ', chacune avec sa source. Gratuit, sans compte.',
                '. Chacune donne sa source. Gratuit, sans compte.',
                '. Gratuit, sans compte.']
        essais = [d + m + f for d in debuts for m in milieux for f in fins]

    for x in essais:
        if 150 <= len(x) <= 160:
            return x
    sys.exit('ARRET : aucune description entre 150 et 160 pour « %s » '
             '(%d essais, de %d a %d caracteres).'
             % (sec['slug'], len(essais),
                min(len(x) for x in essais), max(len(x) for x in essais)))


def lecons_de_sourate():
    """Les lecons presentes sur le disque, dans l'ordre du Coran.

    Elles ne servent qu'a la section « sens des sourates », qui porte
    justement ces versets : la couverture devient alors une vraie entree vers
    les vingt-trois pages, au lieu d'un cul-de-sac vers un bouton.
    """
    noms = json.loads((RACINE / 'outils' / 'coran' / 'noms-sourates.json')
                      .read_text(encoding='utf-8'))
    import re
    import unicodedata

    def ardoise(nom):
        s = unicodedata.normalize('NFD', nom.lower())
        s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
        s = s.replace("'", '-').replace(' ', '-')
        return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')

    out = []
    for s in noms:
        f = 'lecon-sourate-%s.html' % ardoise(s['tr'])
        if (RACINE / f).is_file():
            out.append((s['n'], s['tr'], f))
    return out


TETE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<base href="/">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(titre)s</title>
<meta name="description" content="%(desc)s">
%(robots)s<meta name="theme-color" content="#FAF7F0">
<link rel="canonical" href="%(canon)s">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all';this.onload=null"
      href="https://fonts.googleapis.com/css2?family=Marcellus&family=Source+Sans+3:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap">
<noscript><link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Marcellus&family=Source+Sans+3:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap"></noscript>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/pages.css">
<link rel="stylesheet" href="css/section.css">
<meta property="og:site_name" content="Islam pas à pas">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="website">
<meta property="og:url" content="%(canon)s">
<meta property="og:title" content="%(titre)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="%(site)s/partage.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%%3Csvg xmlns=%%27http://www.w3.org/2000/svg%%27 viewBox=%%270 0 24 24%%27%%3E%%3Crect width=%%2724%%27 height=%%2724%%27 rx=%%274%%27 fill=%%27%%230B3D26%%27/%%3E%%3Cpath d=%%27M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z%%27 fill=%%27none%%27 stroke=%%27%%23C9A227%%27 stroke-width=%%271.4%%27/%%3E%%3C/svg%%3E">
<script type="application/ld+json">
%(jsonld)s
</script>
</head>
<body>

<a class="saut-contenu" href="#principal">Aller au contenu</a>

<!-- CE BLOC EST DEJA ECRIT, ET C'EST TOUT L'INTERET DE CETTE PAGE.
     `section.js` le remplace au chargement par la couverture interactive
     (photo, maitrise, rosace). Mais qui arrive ici sans JavaScript — un
     robot d'indexation, un navigateur en panne de reseau — lit deja de quoi
     parle la section, combien elle contient, et par ou entrer. Avant, il ne
     lisait rien du tout. -->
<div class="ecran" id="couverture">
%(corps)s</div>

<script src="js/icones.js"></script>
<script src="js/geometrie.js"></script>
<script src="js/photo.js"></script>
<script src="js/memoire.js"></script>
<script src="js/section.js"></script>
</body>
</html>
"""


def corps_de(sec, total, banque, themes, par_niveau, lecons):
    h = '  <div class="corps couv-corps" id="principal">\n'
    h += ('    <p class="lecon-sur">Section %d sur 12</p>\n'
          % sec['num'])
    h += '    <h1 class="t-page">%s</h1>\n' % echapper(sec['nom'])
    h += '    <p class="couv-quoi">%s</p>\n' % echapper(sans_point(sec.get('quoi')) + '.')

    if total:
        h += '    <div class="chiffres">\n'
        h += ('      <div class="chiffre"><b>%s</b><span>question%s</span></div>\n'
              % (espacer(total), 's' if total > 1 else ''))
        h += ('      <div class="chiffre"><b>%d</b><span>thème%s</span></div>\n'
              % (len(themes), 's' if len(themes) > 1 else ''))
        h += '    </div>\n'

        h += '    <div class="pile-11"><h2 class="t-bloc">Les trois niveaux</h2>\n'
        h += '      <div class="couv-niveaux">\n'
        for v in (1, 2, 3):
            h += ('        <div class="couv-niveau"><b>%d</b><span>%s</span></div>\n'
                  % (par_niveau.get(v, 0), NIVEAUX[v]))
        h += '      </div>\n    </div>\n'

        if themes:
            h += '    <div class="pile-11"><h2 class="t-bloc">Les thèmes</h2>\n'
            h += '      <div class="pastilles">\n'
            for t in themes:
                h += '        <span class="pastille">%s</span>\n' % echapper(t)
            h += '      </div>\n    </div>\n'

        # LA SECTION DES SOURATES MENE AUX LECONS. Elle porte les memes
        # versets ; sans ce bloc, la couverture est un cul-de-sac vers un
        # bouton, et les vingt-trois lecons n'ont qu'une seule page qui y
        # mene. Aucune autre section n'a d'equivalent a proposer.
        if lecons:
            h += ('    <div class="pile-11"><h2 class="t-bloc">Les sourates '
                  'expliquées verset par verset</h2>\n')
            h += '      <div class="pastilles">\n'
            for num, tr, f in lecons:
                h += ('        <a class="pastille" href="%s">%s</a>\n'
                      % (f, echapper(tr)))
            h += '      </div>\n'
            h += ('      <p class="c-meta">Chacune donne le texte arabe, la '
                  'traduction du sens par Muhammad Hamidullah, et la référence '
                  'de chaque verset.</p>\n')
            h += '    </div>\n'

        h += '    <div class="pile-11"><h2 class="t-bloc">Continuer</h2>\n'
        h += ('      <a class="ligne" href="section/%s/qcm"><span class="milieu">'
              '<span class="nom">Préparer un QCM</span><span class="quoi">De 20 '
              'à 100 questions, comme tu veux.</span></span>'
              '<span class="pc" aria-hidden="true">&rarr;</span></a>\n'
              % echapper(sec['slug']))
        h += ('      <a class="ligne" href="sections.html"><span class="milieu">'
              '<span class="nom">Les 12 sections</span><span class="quoi">Tout '
              'ce qu\'on peut travailler sur le site.</span></span>'
              '<span class="pc" aria-hidden="true">&rarr;</span></a>\n')
        h += '    </div>\n'
    else:
        h += ('    <p class="c-meta">Cette section n\'a pas encore de questions. '
              'Rien n\'y sera publié avant d\'avoir été vérifié et sourcé.</p>\n')
        h += ('    <a class="ligne" href="sections.html"><span class="milieu">'
              '<span class="nom">Les 12 sections</span><span class="quoi">Celles '
              'qui sont prêtes.</span></span>'
              '<span class="pc" aria-hidden="true">&rarr;</span></a>\n')

    h += '  </div>\n'
    return h


def poser_les_routes(slugs):
    """Ecrit dans vercel.json une reecriture par section, nommee en toutes
    lettres.

    POURQUOI PAS `/section/:slug` -> `/section-:slug.html`, QUI TIENDRAIT EN
    UNE LIGNE : parce que dans la destination, `:slug.html` est ambigu. Les
    bibliotheques de la famille path-to-regexp lisent le nom du parametre
    jusqu'au prochain caractere qui ne peut pas en faire partie, et le point
    n'en fait pas toujours partie selon la version — le parametre peut donc
    etre compris comme `slug` ou comme `slug.html`. Dans le second cas, la
    substitution n'a pas lieu, le fichier « section-:slug.html » n'existe pas,
    et les douze adresses rendent 404.

    Or ces adresses sont dans le sitemap, et je ne peux pas les essayer contre
    Vercel depuis ici : islampasapas.fr n'est pas joignable dans cet
    environnement. Une regle qu'on ne peut pas verifier ne se pose pas. Douze
    lignes sans parametre ne peuvent etre lues que d'une facon.

    Elles sont ECRITES PAR CE GENERATEUR, au moment ou il ecrit les pages :
    une liste tenue a la main a cote d'un dossier de fichiers finit toujours
    par ne plus lui correspondre.
    """
    conf_f = RACINE / 'vercel.json'
    conf = json.loads(conf_f.read_text(encoding='utf-8'))

    # On garde telles quelles les regles qui ne parlent pas des sections.
    gardees = [r for r in conf.get('rewrites', [])
               if not r.get('source', '').startswith('/section/')
               or r.get('source', '').endswith('/qcm')]
    routes = [r for r in gardees if r.get('source', '').endswith('/qcm')]
    autres = [r for r in gardees if not r.get('source', '').endswith('/qcm')]

    # `/section/<slug>/qcm` d'abord : la plus specifique passe en premier.
    conf['rewrites'] = routes + [
        {'source': '/section/%s' % s, 'destination': '/section-%s.html' % s}
        for s in slugs] + autres

    conf_f.write_text(json.dumps(conf, ensure_ascii=False, indent=2) + '\n',
                      encoding='utf-8')
    return len(slugs)


def main():
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    if len(secs) != 12:
        sys.exit('ARRET : %d sections au lieu de 12.' % len(secs))

    lecons = lecons_de_sourate()
    ecrites, indexables = 0, 0

    for sec in secs:
        f = RACINE / 'data' / 'questions' / ('%s.json' % sec['slug'])
        banque = json.loads(f.read_text(encoding='utf-8')) if f.is_file() else []
        total = len(banque)

        # Les memes comptages que `section.js`, faits sur les memes donnees.
        themes, vus = [], set()
        par_niveau = {1: 0, 2: 0, 3: 0}
        for q in banque:
            t = q.get('theme')
            if t and t not in vus:
                vus.add(t)
                themes.append(t)
            nv = q.get('niveau') or 2
            par_niveau[nv] = par_niveau.get(nv, 0) + 1

        titre = titre_de(sec)
        if len(titre) > 60:
            sys.exit('ARRET : titre de %d caracteres pour « %s ».'
                     % (len(titre), sec['slug']))
        desc = description_de(sec, total, len(themes))
        canon = '%s/section/%s' % (SITE, sec['slug'])

        jsonld = json.dumps({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            'name': sec['nom'],
            'url': canon,
            'inLanguage': 'fr',
            'description': desc,
            'learningResourceType': 'qcm',
            'educationalLevel': 'debutant',
            'isAccessibleForFree': True,
        }, ensure_ascii=False, indent=1)

        page = TETE % {
            'titre': echapper(titre),
            'desc': echapper(desc),
            'canon': canon,
            'site': SITE,
            'jsonld': jsonld,
            'robots': '' if total else '<meta name="robots" content="noindex, follow">\n',
            'corps': corps_de(sec, total, banque, themes, par_niveau,
                              lecons if sec['slug'] == 'sens-des-sourates' else []),
        }
        (RACINE / ('section-%s.html' % sec['slug'])).write_text(page, encoding='utf-8')
        ecrites += 1
        if total:
            indexables += 1
        print('  %-24s %5d question(s), %2d theme(s)  titre %2d  desc %d%s'
              % (sec['slug'], total, len(themes), len(titre), len(desc),
                 '' if total else '   noindex'))

    n = poser_les_routes([s['slug'] for s in secs])

    print()
    print('  %d pages de section ecrites, %d indexables.' % (ecrites, indexables))
    print('  %d reecritures posees dans vercel.json, une par section.' % n)
    print('  Chiffres comptes dans les banques, jamais annonces.')


if __name__ == '__main__':
    main()
