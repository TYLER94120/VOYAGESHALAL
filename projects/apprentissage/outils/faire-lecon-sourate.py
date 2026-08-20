#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fabrique une lecon « le sens d'une sourate, verset par verset ».

D'OU VIENT CHAQUE MOT, ET POURQUOI ON PEUT LE CROIRE
----------------------------------------------------
Rien ici n'est saisi a la main. Trois sources, chacune verifiee :

1. **Le texte arabe** vient de l'edition `ara-quransimple`
   (depot public `fawazahmed0/quran-api`). Elle n'est pas crue sur parole :
   elle est **confrontee a la sourate Al-Fatiha deja publiee sur ce site**,
   ecrite et relue avant l'existence de ce script. Les **sept versets sur
   sept** sont identiques, caractere pour caractere, apres normalisation
   Unicode. Ce controle tourne a chaque execution et **arrete tout** s'il
   echoue.

2. **La traduction du sens** est celle de **Muhammad Hamidullah**, citee a son
   nom sur chaque lecon. On ne paraphrase pas : traduire soi-meme un verset
   serait exactement ce que ce site s'interdit.

3. **Les noms de sourates** sont lus dans `sourates.html`, la page de ce site,
   verifiee au cycle 6 : 114 lignes, sans trou ni doublon.

LE PIEGE QUI AURAIT TOUT FAUSSE
-------------------------------
Dans cette edition, **112 sourates sur 114 ont la basmala collee au verset 1**.
Publier tel quel aurait donne un « verset 1 » faux sur 112 sourates. Elle est
donc retiree, et un controle verifie qu'il n'en reste aucune trace.

CE QU'ON N'ECRIT PAS
--------------------
- **Pas de phonetique.** Al-Fatiha en a une, ecrite a la main et relue. La
  fabriquer mecaniquement pour vingt sourates produirait des prononciations
  fausses a l'echelle. La lecon le dit au lecteur au lieu de le cacher.
- **Pas de commentaire, pas d'explication de ma main.** Le verset, sa
  traduction attribuee, sa reference. Rien entre les deux.
- Les questions ne portent que sur des **faits verifiables** — un numero, un
  compte de versets, un mot du texte affiche — jamais sur un jugement.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
DONNEES = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else RACINE / 'outils' / 'coran'

TRADUCTEUR = "Muhammad Hamidullah"


# ---------------------------------------------------------------- les sources

def charger():
    ar = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((DONNEES / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']}
    fr = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((DONNEES / 'fra-muhammadhamidul.json').read_text(encoding='utf-8'))['quran']}
    return ar, fr


def noms_des_sourates():
    """Les 114 noms, lus dans la page du site. Un nom manquant arrete tout."""
    page = (RACINE / 'sourates.html').read_text(encoding='utf-8')
    noms = {}
    for bloc in re.findall(r'<li class="srow"[^>]*>(.*?)</li>', page, re.S):
        num = re.search(r'<span class="s-num">(\d+)</span>', bloc)
        ar = re.search(r'<span class="s-ar"[^>]*>(.*?)</span>', bloc, re.S)
        tr = re.search(r'<span class="s-tr">(.*?)</span>', bloc, re.S)
        if not (num and ar and tr):
            continue
        net = lambda x: re.sub(r'<[^>]+>', '', x).replace('&nbsp;', ' ').strip()
        nom = net(tr.group(1))
        autre = ''
        # « Al-Masad aussi : Al-Lahab » : le nom alternatif est colle au nom.
        m = re.match(r'^(.*?)\s*aussi\s*:\s*(.*)$', nom)
        if m:
            nom, autre = m.group(1).strip(), m.group(2).strip()
        noms[int(num.group(1))] = (net(ar.group(1)), nom, autre)
    if len(noms) != 114:
        sys.exit("ARRET : %d noms lus au lieu de 114." % len(noms))
    return noms


def controler(ar):
    """Le jeu de donnees dit-il la meme chose que la page deja publiee ?"""
    page = (RACINE / 'lecon-al-fatiha.html').read_text(encoding='utf-8')
    publie = [s.strip() for s in
              re.findall(r'<p class="ar" lang="ar" dir="rtl">([^<]+)</p>', page)][1:8]
    if len(publie) != 7:
        sys.exit("ARRET : %d versets lus dans lecon-al-fatiha.html au lieu de 7." % len(publie))
    n = unicodedata.normalize
    egaux = sum(1 for i in range(7) if n('NFC', ar[(1, i + 1)]) == n('NFC', publie[i]))
    if egaux != 7:
        sys.exit("ARRET : le jeu de donnees ne reproduit que %d/7 versets d'Al-Fatiha." % egaux)
    return egaux


def versets(ar, fr, n):
    """Les versets d'une sourate, basmala retiree du premier."""
    bas = unicodedata.normalize('NFC', ar[(1, 1)])
    dernier = max(v for (c, v) in ar if c == n)
    out = []
    for i in range(1, dernier + 1):
        a = unicodedata.normalize('NFC', ar[(n, i)])
        if i == 1 and n != 1 and a.startswith(bas):
            a = a[len(bas):].strip()
        if bas in a:
            sys.exit("ARRET : basmala encore presente dans %d:%d." % (n, i))
        out.append((a, fr[(n, i)].strip()))
    return out


# ---------------------------------------------------------------- le francais

def sans_accents(s):
    """Le site s'ecrit sans accents dans les commentaires et les identifiants."""
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')


def echapper(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
             .replace('"', '&quot;'))


def citation(s):
    """La traduction est rendue MOT POUR MOT, sans un caractere ajoute.

    On n'encadre pas de guillemets francais : la traduction de Hamidullah en
    contient deja, et parfois ouverts sur un verset et fermes sur le suivant
    (« Dis: «Il est Allah, Unique » ... « Et nul n'est egal a Lui» »). Ajouter
    les notres produisait un emboitement faux. L'etiquette « Traduction du
    sens » dit deja ce que c'est ; le texte, lui, n'est pas touche.
    """
    s = s.strip()
    # Reparation TYPOGRAPHIQUE, jamais lexicale : Hamidullah ouvre parfois un
    # guillemet sur un verset et le ferme sur le suivant. Lu carte par carte,
    # le guillemet reste beant. On le referme — ou on l'ouvre — sans toucher a
    # un seul mot.
    if s.count('\u00ab') > s.count('\u00bb'):
        s += '\u00bb'
    elif s.count('\u00bb') > s.count('\u00ab'):
        s = '\u00ab' + s
    return echapper(s)


LETTRES = "0123456789"
CHIFFRES_MOTS = {1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six',
                 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 11: 'onze', 12: 'douze',
                 13: 'treize', 14: 'quatorze', 15: 'quinze', 16: 'seize',
                 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt'}


def en_lettres(n):
    return CHIFFRES_MOTS.get(n, str(n))


# ------------------------------------------------------------- les questions

def questions(num, nom, vs):
    """Trois questions, uniquement sur des faits verifiables dans la page.

    Jamais de question de jugement, jamais de piege : les mauvaises reponses
    sont clairement fausses et ne peuvent pas etre confondues avec une opinion
    religieuse. Un compte, un numero, un renvoi au texte affiche.
    """
    k = len(vs)
    q = []

    # 1. Le nombre de versets — lu dans le texte, pas ailleurs.
    faux = [x for x in (k + 2, k - 1, k + 5, k + 1) if x > 0][:2]
    q.append({
        'titre': 'Combien de versets compte la sourate ' + nom + '&nbsp;?',
        'bonne': str(k),
        'autres': [str(x) for x in faux],
        'retour': en_lettres(k).capitalize() + '. La lecon les a montres un par un.',
    })

    # 2. Son numero dans le Coran.
    fx = [x for x in (num + 3, num - 4, num + 7, num - 2) if 1 <= x <= 114][:2]
    # Le nom est REPETE dans chaque libelle : ces questions sont rejouees dans
    # le QCM, loin de leur lecon, ou « son numero » ne renvoie a rien.
    q.append({
        'titre': 'Quel est le numero de la sourate ' + nom + ' dans le Coran&nbsp;?',
        'bonne': 'La ' + str(num) + 'e',
        'autres': ['La ' + str(x) + 'e' for x in fx],
        'retour': nom + ' est la ' + str(num) + 'e sourate du Coran, sur 114.',
    })

    # 3. Retrouver un verset a partir de son sens.
    cible = min(2, k)
    extrait = vs[cible - 1][1].strip()
    if len(extrait) > 90:
        extrait = extrait[:88].rsplit(' ', 1)[0] + '&hellip;'
    fx = [x for x in (1, 3, k) if x != cible][:2]
    q.append({
        'titre': ('Dans la sourate ' + nom + ', quel verset dit&nbsp;: &laquo;&nbsp;'
                  + echapper(extrait) + '&nbsp;&raquo;&nbsp;?'),
        'bonne': 'Le verset ' + str(cible),
        'autres': ['Le verset ' + str(x) for x in fx],
        'retour': 'Le verset ' + str(cible) + '. Tu peux revenir en arriere pour le relire.',
    })
    return q[:2] if k <= 3 else q


def carte_question(rang, total, q, etape):
    opts = ['        <button class="q-opt" type="button" data-bonne>' + q['bonne'] + '</button>']
    for a in q['autres']:
        opts.append('        <button class="q-opt" type="button">' + a + '</button>')
    return """      <section class="etape carte-quiz" data-etape="%d" data-quiz>
        <span class="eyebrow">Question %d sur %d</span>
        <h2>%s</h2>
        <div class="q-choix">
%s
        </div>
        <p class="q-retour" data-r-retour>%s</p>
      </section>
""" % (etape, rang, total, q['titre'], '\n'.join(opts), q['retour'])


# ------------------------------------------------------------------ la lecon

def description(nom, num, k):
    """Entre 150 et 160 caracteres, et rien qui ne soit vrai."""
    # Plusieurs bases, de la plus riche a la plus courte : les noms longs
    # (« At-Takathur », « Az-Zalzala ») faisaient deborder la seule base
    # d'origine au-dela de 155 caracteres, la ou Google coupe.
    bases = [
        "Le sens des %s versets de la sourate %s, verset par verset : texte "
        "arabe, traduction de Muhammad Hamidullah, et la reference de chacun."
        % (en_lettres(k), nom),
        "Le sens de la sourate %s verset par verset : texte arabe, traduction "
        "de Muhammad Hamidullah, et la reference de chacun des %s versets."
        % (nom, en_lettres(k)),
        "Sourate %s expliquee verset par verset : texte arabe, traduction de "
        "Muhammad Hamidullah, reference de chacun des %s versets."
        % (nom, en_lettres(k)),
    ]
    base = bases[0]
    suites = ['', ' La %de sourate du Coran.' % num,
              ' Sourate %d du Coran, %d versets.' % (num, k),
              ' Une lecon courte, chaque verset avec sa source.',
              ' La %de sourate du Coran, lue et expliquee.' % num]
    # 155 et non 160 : au-dela, Google coupe la description dans les resultats
    # (regle du 17 aout). On vise 140-155 pour garder de la marge.
    for b in bases:
        for s in suites:
            if 140 <= len(b + s) <= 155:
                return b + s
    # Aucun assemblage ne tombe dans la fenetre : on le dit au lieu de tricher.
    return None


def lecon(num, nom, nom_ar, autre, vs):
    k = len(vs)
    ident = 'sourate-' + re.sub(r'[^a-z0-9]+', '-', sans_accents(nom).lower()).strip('-')
    url = 'lecon-%s.html' % ident
    # LE TITRE PORTE UN CHIFFRE. Regle du 17 aout : le besoin en premier, un
    # chiffre verifiable compte dans nos donnees, moins de 60 caracteres.
    # Elle vit ICI et nulle part ailleurs : le 18 aout, elle avait ete appliquee
    # par un script separe, et la premiere regeneration a REVERT LES VINGT
    # TITRES en silence. Une regle appliquee a cote du generateur ne tient pas.
    titre = 'Sourate %s : les %d versets expliques' % (nom, k)
    if len(titre) > 60:
        titre = 'Sourate %s : %d versets' % (nom, k)
    desc = description(nom, num, k)
    if desc is None:
        return None
    qs = questions(num, nom, vs)

    cartes = []
    e = 1
    cartes.append("""      <section class="etape" data-etape="%d">
        <span class="eyebrow" data-r="lecon-etiquette">La lecon du jour</span>
        <h2 style="font-size:29px">Sourate %s</h2>
        <p class="ar" lang="ar" dir="rtl">%s</p>
        <p class="clair">
          La <strong>%de sourate</strong> du Coran, <strong>%s versets</strong>.%s
          Tu vas la lire verset par verset, avec le sens de chacun.
        </p>
        <p class="prudence">
          La traduction est une <strong>traduction du sens</strong>, celle de
          <strong>%s</strong>. Le Coran, c'est l'arabe&nbsp;: une traduction
          approche, elle ne remplace pas.
        </p>
        <div class="source">
          <span class="lab">Source</span>
          <span class="val">Coran, sourate %s (%d), %s versets.</span>
        </div>
      </section>
""" % (e, nom, nom_ar, num, en_lettres(k),
       (' Aussi appelee <strong>%s</strong>.' % autre) if autre else '',
       TRADUCTEUR, nom, num, en_lettres(k)))
    e += 1

    # Ou placer les questions : jamais deux d'affilee, jamais en derniere carte.
    # Une question ne tombe jamais avant le DEUXIEME verset : interroger
    # quelqu'un qui n'a lu qu'une ligne n'apprend rien a personne.
    if len(qs) == 2:
        rangs = [max(2, (k + 1) // 2), k]
    else:
        rangs = [max(2, k // 3), max(3, (2 * k) // 3), k]
    vus, apres = set(), {}
    for j, r in enumerate(rangs):
        while r in vus and r < k:
            r += 1
        vus.add(r)
        apres[r] = j

    for i, (a, f) in enumerate(vs, 1):
        cartes.append("""      <section class="etape" data-etape="%d">
        <span class="eyebrow">Verset %d sur %d</span>
        <p class="ar" lang="ar" dir="rtl">%s</p>
        <div>
          <span class="etiquette">Traduction du sens</span>
          <p class="sens">%s</p>
        </div>
        <div class="source">
          <span class="lab">Source</span>
          <span class="val">Coran, sourate %s (%d), verset %d. Traduction&nbsp;: %s.</span>
        </div>
      </section>
""" % (e, i, k, a, citation(f), nom, num, i, TRADUCTEUR))
        e += 1
        if i in apres:
            j = apres[i]
            cartes.append(carte_question(j + 1, len(qs), qs[j], e))
            e += 1

    cartes.append("""      <section class="etape" data-etape="%d">
        <div class="retenir">
          <span class="eyebrow">Ce que tu retiens</span>
          <p class="q">Sourate %s<br>la %de du Coran<br>%s versets</p>
          <p class="r">Cette carte te reviendra dans deux jours.</p>
        </div>
        <p class="clair">
          Relis le premier verset sans regarder la traduction. C'est la
          meilleure facon de voir ce qui est deja entre.
        </p>
      </section>
""" % (e, nom, num, en_lettres(k)))
    e += 1
    total_cartes = e - 1

    cartes.append("""      <section class="etape fin" data-etape="%d">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#c9a84c" aria-hidden="true">
          <path d="M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z"/>
        </svg>
        <h2>Lecon terminee</h2>
        <p data-r="fin-texte">Tu connais maintenant le sens des %s versets de la sourate %s.</p>
        <p data-r="fin-suite" class="suite"></p>
        <div class="moment-zone" data-r="moment-choix" hidden></div>
        <a class="btn" href="index.html">Continuer</a>
        <a class="btn fantome" href="chemin.html">Voir mon chemin</a>
        <p class="apres-lecon">
          Cette lecon t'a laisse une question personnelle&nbsp;?
          <a href="https://halalgpt.fr?utm_source=islampasapas&utm_medium=contenu&utm_campaign=fin-%s">Pose-la sur halalgpt.fr</a>
          <span class="al-note">Et pour un cas qui t'engage&nbsp;: demande a un savant, pas a un site.</span>
        </p>
      </section>
""" % (e, en_lettres(k), nom, ident))

    return {
        'num': num, 'nom': nom, 'id': ident, 'url': url, 'titre': titre,
        'desc': desc, 'versets': k, 'cartes': total_cartes,
        'minutes': max(4, round((total_cartes + 1) / 2.2)),
        'html': ''.join(cartes),
    }


# ------------------------------------------------------------------ la page

TETE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(titre)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#0b1a0f">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
<link rel="canonical" href="https://islampasapas.fr/%(url)s">
<meta property="og:site_name" content="Islam pas a pas">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="article">
<meta property="og:url" content="https://islampasapas.fr/%(url)s">
<meta property="og:title" content="%(titre)s">
<meta property="og:description" content="Le sens de la sourate %(nom)s verset par verset, avec le texte arabe et la reference de chacun.">
<meta property="og:image" content="https://islampasapas.fr/partage.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%%3Csvg xmlns=%%27http://www.w3.org/2000/svg%%27 viewBox=%%270 0 24 24%%27%%3E%%3Crect width=%%2724%%27 height=%%2724%%27 rx=%%274%%27 fill=%%27%%230b1a0f%%27/%%3E%%3Cpath d=%%27M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z%%27 fill=%%27%%23c9a84c%%27/%%3E%%3C/svg%%3E">
<link rel="stylesheet" href="style.css">
</head>
<body>

<a class="saut-contenu" href="#principal">Aller au contenu</a>

<div class="page">

  <header class="lecon-haut">
    <a class="quitter" href="index.html" aria-label="Quitter la lecon">&times;</a>
    <div class="points" data-r="points" aria-hidden="true"></div>
  </header>

  <main id="principal">

    <h1 class="visuellement-cache">%(titre)s</h1>

    <div class="etapes" data-r="etapes">

"""

PIED = """
    </div>

    <div class="bas-lecon" data-r="bas" hidden>
      <button class="btn" data-r="suivant" type="button">Suivant</button>
    </div>

  </main>

  <footer class="pied">
    <p class="note-pied">
      Les traductions sont des traductions du <em>sens</em>&nbsp;: le Coran, c'est l'arabe.
      Celle-ci est de %(trad)s.
      Une question personnelle&nbsp;? <a href="https://halalgpt.fr?utm_source=islampasapas&utm_medium=pied&utm_campaign=%(id)s">Pose-la sur halalgpt.fr</a>,
      et pour un cas qui t'engage, demande a un savant.
    </p>
    <div class="reglages">
      <button class="lien-discret" type="button" data-r="son-bascule"></button>
    </div>
    <span class="t">Les autres sites de la famille</span>
    <nav class="freres" aria-label="Sites partenaires">
      <a href="https://halalgpt.fr?utm_source=islampasapas&utm_medium=pied&utm_campaign=%(id)s"><span class="d">halalgpt.fr</span><span class="q">L'IA musulmane, pour poser une question</span></a>
      <a href="https://halalcheck.fr?utm_source=islampasapas&utm_medium=pied&utm_campaign=%(id)s"><span class="d">halalcheck.fr</span><span class="q">Scanner un produit en magasin</span></a>
      <a href="https://voyageshalal.fr?utm_source=islampasapas&utm_medium=pied&utm_campaign=%(id)s"><span class="d">voyageshalal.fr</span><span class="q">Voyager halal</span></a>
      <a href="https://gohalaltravel.com?utm_source=islampasapas&utm_medium=pied&utm_campaign=%(id)s"><span class="d">gohalaltravel.com</span><span class="q">Halal travel guide (EN)</span></a>
    </nav>
  </footer>

</div>

<script src="sons.js"></script>
<script src="audio-coran.js"></script>
<script src="app.js"></script>
<script>ippDemarrerLecon('%(id)s');</script>
</body>
</html>
"""


def ecrire_page(l):
    (RACINE / l['url']).write_text(
        (TETE % l) + l['html'] + (PIED % {'id': l['id'], 'trad': TRADUCTEUR}),
        encoding='utf-8')


def dans_catalogue(l):
    """Ajoute l'entree au catalogue de app.js, sans jamais en doubler une."""
    p = RACINE / 'app.js'
    src = p.read_text(encoding='utf-8')
    if "id: '%s'" % l['id'] in src:
        return False
    # Al-Ma'un, Al-Qari'a : une apostrophe dans un nom casse la chaine
    # JavaScript, et app.js devient illisible — donc TOUT le site s'arrete.
    # Attrape par le controle de syntaxe, jamais a l'oeil.
    js = lambda s: s.replace("\\", "\\\\").replace("'", "\\'")
    nom_js = js(l['nom'])
    entree = """    {
      id: '%s',
      titre: 'Sourate %s, verset par verset',
      url: '%s',
      parcours: 'sourates',
      minutes: %d,
      cartes: %d,
      acquis: %d,
      unite: 'verset de %s',
      unites: 'versets de %s',
      publiee: true,
      resume: 'La %de sourate du Coran, %s versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    }
  ];""" % (l['id'], nom_js, l['url'], l['minutes'], l['cartes'], l['versets'],
           nom_js, nom_js, l['num'], en_lettres(l['versets']))
    marque = "\n  ];\n\n  function nomParcours"
    if marque not in src:
        sys.exit("ARRET : fin du catalogue introuvable dans app.js.")
    src = src.replace(marque, ",\n" + entree + "\n\n  function nomParcours", 1)
    p.write_text(src, encoding='utf-8')
    return True


def dans_sitemap(l, date):
    p = RACINE / 'sitemap.xml'
    t = p.read_text(encoding='utf-8')
    if l['url'] in t:
        return False
    bloc = ("  <url>\n    <loc>https://islampasapas.fr/%s</loc>\n"
            "    <lastmod>%s</lastmod>\n    <changefreq>monthly</changefreq>\n"
            "    <priority>0.9</priority>\n  </url>\n</urlset>" % (l['url'], date))
    p.write_text(t.replace("</urlset>", bloc, 1), encoding='utf-8')
    return True


def dans_parcours(l):
    """Le repli sans JavaScript de parcours.html doit lister la lecon aussi."""
    p = RACINE / 'parcours.html'
    t = p.read_text(encoding='utf-8')
    if 'data-lecon="%s"' % l['id'] in t:
        return False
    bloc = """
      <article class="pcarte ouvert" data-lecon="%s">
        <span class="etiq-p ok" data-r-etat>%d min</span>
        <h3>Sourate %s, verset par verset</h3>
        <p class="pquoi">
          La %de sourate du Coran, %s versets. Le texte arabe, le sens de chaque
          verset, et la reference a chaque fois.
        </p>
        <div class="pliens">
          <a class="ligne" href="%s">
            <svg class="etoile" width="15" height="15" viewBox="0 0 24 24" fill="#c9a84c" aria-hidden="true"><path d="M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z"/></svg>
            <span><span class="t">Ouvrir la lecon</span><span class="s">%d cartes &middot; Le sens des sourates</span></span>
            <span class="fl" aria-hidden="true">&rsaquo;</span>
          </a>
        </div>
      </article>
      </div><!-- /chemin-vertical -->""" % (
        l['id'], l['minutes'], l['nom'], l['num'], en_lettres(l['versets']),
        l['url'], l['cartes'])
    marque = '      </div><!-- /chemin-vertical -->'
    if marque not in t:
        sys.exit("ARRET : repli de parcours.html introuvable.")
    p.write_text(t.replace(marque, bloc, 1), encoding='utf-8')
    return True


def main():
    cibles = [int(x) for x in sys.argv[2:]] if len(sys.argv) > 2 else []
    if not cibles:
        sys.exit("Usage : faire-lecon-sourate.py <dossier-donnees> <numeros...>")
    ar, fr = charger()
    controler(ar)
    print("  controle Al-Fatiha : 7/7 versets identiques a la page publiee.")
    noms = noms_des_sourates()
    print("  114 noms lus dans sourates.html.\n")
    date = '2026-08-14'
    faits = 0
    for n in cibles:
        nom_ar, nom, autre = noms[n]
        vs = versets(ar, fr, n)
        l = lecon(n, nom, nom_ar, autre, vs)
        if l is None:
            print("  %3d %-14s IGNOREE : aucune description entre 150 et 160." % (n, nom))
            continue
        ecrire_page(l)
        c = dans_catalogue(l); s = dans_sitemap(l, date); q = dans_parcours(l)
        print("  %3d %-14s %2d versets, %2d cartes, %d min  %s" % (
            n, nom, l['versets'], l['cartes'], l['minutes'],
            ('catalogue+' if c else '') + ('sitemap+' if s else '') + ('parcours+' if q else '')))
        faits += 1
    print("\n  %d lecon(s) ecrite(s)." % faits)
    if faits:
        print("  A FAIRE MAINTENANT : python3 outils/poser-json-ld.py")
        print("  (generer une page EFFACE son bloc JSON-LD : il se repose apres,")
        print("   jamais avant. Oublie une fois le 14 aout, vu par la suite.)")


if __name__ == '__main__':
    main()
