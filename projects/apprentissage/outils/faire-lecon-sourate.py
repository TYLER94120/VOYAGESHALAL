#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les lecons « une sourate, verset par verset » — pages a lire, pas a jouer.

POURQUOI CE FICHIER REVIENT
---------------------------
Vingt lecons de ce type existaient. La refonte du 21 aout (« le QCM devient le
produit ») les a toutes supprimees, avec `sourates.html`, en une fois.

Or le releve Search Console du 21 aout dit exactement l'inverse de ce que
cette suppression supposait : sur les QUATRE pages du site que Google voyait,
TROIS etaient des pages supprimees ce jour-la — /sourates.html (7 impressions,
position 49), /lecon-sourate-al-falaq.html (2, position 49,5) et surtout
/lecon-sourate-al-ikhlas.html, en POSITION 11. Le site n'a pas seulement
change de forme : il a efface le seul contenu qui se referencait, et les URL
que Google connait rendent 404 depuis.

Le QCM reste le produit. Ces pages sont autre chose et ne lui font pas
concurrence : on ne cherche pas « quiz sourate al-ikhlas » sur Google, on
cherche « sourate al ikhlas traduction ». Une page qui se lit repond a ca ;
un jeu, non. Et chaque lecon renvoie vers le QCM de sa section.

D'OU VIENT CHAQUE MOT, ET POURQUOI ON PEUT LE CROIRE
----------------------------------------------------
Rien n'est saisi a la main. Trois sources, chacune verifiee :

1. LE TEXTE ARABE vient de `outils/coran/ara-quransimple.json`. Il n'est pas
   cru sur parole : il est confronte a `outils/temoins/al-fatiha-relue.txt` —
   les sept versets d'Al-Fatiha tels qu'ils ont ete ecrits et RELUS A LA MAIN
   pour la premiere lecon du site, avant l'existence du moindre script. Ce
   temoin a ete extrait de la page publiee avant sa suppression ; c'est la
   seule ancre non circulaire dont on dispose, puisque tout le reste du site
   descend du meme jeu de donnees. Le controle tourne a chaque execution et
   ARRETE TOUT s'il echoue.

2. LA TRADUCTION DU SENS est celle de Muhammad Hamidullah, citee a son nom sur
   chaque verset. On ne paraphrase pas, on ne resume pas : traduire soi-meme
   un verset serait exactement ce que ce site s'interdit.

3. LES NOMS DE SOURATES viennent de `outils/coran/noms-sourates.json`, les 114
   deja utilises par le QCM.

LE PIEGE QUI AURAIT TOUT FAUSSE
-------------------------------
Dans cette edition, 112 sourates sur 114 ont la basmala collee au verset 1.
Publier tel quel donnerait un « verset 1 » faux sur 112 sourates. Elle est
donc retiree, et un controle verifie qu'il n'en reste aucune trace.

CE QU'ON N'ECRIT PAS
--------------------
- Pas de phonetique. La fabriquer mecaniquement pour vingt sourates produirait
  des prononciations fausses a l'echelle. La page le DIT au lieu de le cacher.
- Pas de commentaire, pas d'exegese, pas une explication de ma main. Le
  verset, sa traduction attribuee, sa reference. Rien entre les deux. Un sens
  s'attribue ; il ne s'affirme pas au nom du site.
- Aucune circonstance de revelation, aucun merite rapporte : cela vient de
  hadiths et de l'exegese, et le projet n'a aucune traduction francaise
  sourcee de ces textes. Absent, pas approxime.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran'
TEMOIN = RACINE / 'outils' / 'temoins' / 'al-fatiha-relue.txt'

TRADUCTEUR = 'Muhammad Hamidullah'

# Les vingt sourates qui avaient une lecon avant le 21 aout. On rend EXACTEMENT
# les memes adresses : ce sont celles que Google connait, et une adresse qui
# revient vaut mieux qu'une adresse neuve.
LOT = [93, 94, 95, 97, 99, 100, 101, 102, 103, 104,
       105, 106, 107, 108, 109, 110, 111, 112, 113, 114]

# La section de QCM vers laquelle chaque lecon renvoie. Le sens des sourates
# est la seule section qui porte ces versets.
SECTION = ('sens-des-sourates', 'Le sens des sourates')


# ---------------------------------------------------------------- les sources

def charger():
    ar = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']}
    fr = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'fra-muhammadhamidul.json').read_text(encoding='utf-8'))['quran']}
    noms = {s['n']: (s['ar'], s['tr'])
            for s in json.loads((CORAN / 'noms-sourates.json').read_text(encoding='utf-8'))}
    if len(noms) != 114:
        sys.exit('ARRET : %d noms de sourates au lieu de 114.' % len(noms))
    return ar, fr, noms


def controler(ar):
    """Le jeu de donnees dit-il la meme chose que la page relue a la main ?"""
    if not TEMOIN.exists():
        sys.exit('ARRET : le temoin %s manque. Sans lui, le texte arabe n\'est '
                 'confronte a rien.' % TEMOIN)
    publie = [l.strip() for l in TEMOIN.read_text(encoding='utf-8').split('\n') if l.strip()]
    if len(publie) != 7:
        sys.exit('ARRET : %d versets dans le temoin au lieu de 7.' % len(publie))
    n = unicodedata.normalize
    egaux = sum(1 for i in range(7) if n('NFC', ar[(1, i + 1)]) == n('NFC', publie[i]))
    if egaux != 7:
        sys.exit('ARRET : le jeu de donnees ne reproduit que %d/7 versets '
                 'd\'Al-Fatiha. On ne publie pas un texte coranique qui ne '
                 'passe pas son temoin.' % egaux)
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
            sys.exit('ARRET : basmala encore presente dans %d:%d.' % (n, i))
        if (n, i) not in fr:
            sys.exit('ARRET : pas de traduction pour %d:%d.' % (n, i))
        out.append((a, fr[(n, i)].strip()))
    return out


# ---------------------------------------------------------------- le francais

def echapper(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def citation(s):
    """La traduction est rendue MOT POUR MOT, sans un caractere ajoute.

    Reparation TYPOGRAPHIQUE, jamais lexicale : Hamidullah ouvre parfois un
    guillemet sur un verset et le ferme sur le suivant. Lu verset par verset,
    le guillemet reste beant. On le referme — ou on l'ouvre — sans toucher a
    un seul mot.
    """
    s = s.strip()
    if s.count('«') > s.count('»'):
        s += '»'
    elif s.count('»') > s.count('«'):
        s = '«' + s
    return echapper(s)


def ardoise(nom):
    """L'identifiant d'adresse, celui d'avant le 21 aout, a la lettre."""
    s = unicodedata.normalize('NFD', nom.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace("'", '-').replace(' ', '-')
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')


MOTS = {1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six',
        7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix', 11: 'onze', 12: 'douze',
        13: 'treize', 14: 'quatorze', 15: 'quinze', 16: 'seize',
        17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt'}


def en_lettres(n):
    return MOTS.get(n, str(n))


# ------------------------------------------------------------------- la page

def entete(titre, description, url, nom, num, k):
    """Le <head>. LE TITRE FAIT MOINS DE 60 CARACTERES, les mots de la requete
    en tete, sans la marque : c'est ce format qui a place al-ikhlas en
    position 11, on n'y touche pas."""
    if len(titre) > 60:
        sys.exit('ARRET : titre de %d caracteres pour %s — la limite est 60.'
                 % (len(titre), nom))
    if not 150 <= len(description) <= 160:
        sys.exit('ARRET : description de %d caracteres pour %s — il en faut '
                 'entre 150 et 160.' % (len(description), nom))
    jsonld = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        'name': 'Sourate %s, verset par verset' % nom,
        'url': url,
        'inLanguage': 'fr',
        'description': description,
        'learningResourceType': 'lecon',
        'educationalLevel': 'debutant',
        'teaches': '%d versets de %s' % (k, nom),
        'isAccessibleForFree': True,
    }, ensure_ascii=False, indent=1)
    return """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(titre)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#FAF7F0">
<link rel="canonical" href="%(url)s">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" media="print" onload="this.media='all';this.onload=null"
      href="https://fonts.googleapis.com/css2?family=Marcellus&family=Source+Sans+3:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap">
<noscript><link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Marcellus&family=Source+Sans+3:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap"></noscript>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/pages.css">
<link rel="stylesheet" href="css/lecon.css">
<meta property="og:site_name" content="Islam pas à pas">
<meta property="og:locale" content="fr_FR">
<meta property="og:type" content="article">
<meta property="og:url" content="%(url)s">
<meta property="og:title" content="%(titre)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:image" content="https://islampasapas.fr/partage.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%%3Csvg xmlns=%%27http://www.w3.org/2000/svg%%27 viewBox=%%270 0 24 24%%27%%3E%%3Crect width=%%2724%%27 height=%%2724%%27 rx=%%274%%27 fill=%%27%%230B3D26%%27/%%3E%%3Cpath d=%%27M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z%%27 fill=%%27none%%27 stroke=%%27%%23C9A227%%27 stroke-width=%%271.4%%27/%%3E%%3C/svg%%3E">
<script type="application/ld+json">
%(jsonld)s
</script>
</head>
<body>

<a class="saut-contenu" href="#principal">Aller au contenu</a>

<div class="ecran">

  <div class="fond-motif" data-carrelage="#0F5132" data-op="0.035"
       data-tuile="64" data-r="15" aria-hidden="true"></div>
""" % {'titre': echapper(titre), 'desc': echapper(description),
       'url': url, 'jsonld': jsonld}


def description(num, nom, k):
    """La meta description, entre 150 et 160 caracteres.

    Le nom de sourate va de trois lettres (« At-Tin ») a treize, et le nombre
    de versets d'un mot a trois : un gabarit unique ne peut pas tomber dans une
    fenetre de onze caracteres pour les vingt. On ecrit donc plusieurs
    formulations, TOUTES VRAIES et disant la meme chose, et on retient la
    premiere qui tient dans la fenetre.

    On n'allonge jamais avec du remplissage ni avec une affirmation qu'on ne
    peut pas tenir : chaque variante ne parle que de ce que la page contient
    reellement — le texte arabe, la traduction attribuee, la reference.
    """
    v, s = en_lettres(k), nom
    essais = [
        'Le sens des %s versets de la sourate %s, verset par verset : texte '
        'arabe, traduction de Muhammad Hamidullah et référence de chacun.' % (v, s),

        'Le sens des %s versets de la sourate %s (%de du Coran), verset par '
        'verset : texte arabe, traduction de Muhammad Hamidullah et référence.'
        % (v, s, num),

        'Les %s versets de la sourate %s, un par un : le texte arabe, la '
        'traduction du sens par Muhammad Hamidullah, et la référence de chaque '
        'verset.' % (v, s),

        'Sourate %s, %de du Coran : ses %s versets un par un, avec le texte '
        'arabe, la traduction du sens de Muhammad Hamidullah et la référence '
        'de chacun.' % (s, num, v),

        'Sourate %s (%de du Coran), ses %s versets un par un : texte arabe et '
        'traduction du sens par Muhammad Hamidullah, avec la référence de '
        'chaque verset cité.' % (s, num, v),
    ]
    for d in essais:
        if 150 <= len(d) <= 160:
            return d
    sys.exit('ARRET : aucune description entre 150 et 160 pour %s (%d versets). '
             'Longueurs obtenues : %s. Ecrire une variante de plus plutot que '
             'd\'etirer une phrase avec du vide.'
             % (nom, k, ', '.join(str(len(d)) for d in essais)))


def page(num, nom, nom_ar, vs, voisins):
    k = len(vs)
    slug = 'lecon-sourate-%s.html' % ardoise(nom)
    url = 'https://islampasapas.fr/' + slug
    titre = 'Sourate %s : les %d versets expliqués' % (nom, k)
    if k == 1:
        titre = 'Sourate %s : le verset expliqué' % nom
    desc = description(num, nom, k)

    h = entete(titre, desc, url, nom, num, k)
    h += """
  <div class="corps lecon-corps" id="principal">

    <div class="tete">
      <a class="marque" href="index.html">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
        <b>Islam pas à pas</b>
      </a>
      <a class="pastille" href="sourates.html" aria-label="Les 114 sourates">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h16M4 12h16M4 18.5h16" stroke="#55635B" stroke-width="1.5" stroke-linecap="round"/></svg>
      </a>
    </div>

    <div class="lecon-tete">
      <span class="lecon-sur">Sourate %(num)d sur 114</span>
      <h1 class="t-page">%(titre)s</h1>
      <p class="lecon-ar" lang="ar" dir="rtl">%(nom_ar)s</p>
      <p class="lecon-quoi">La <strong>%(num)de sourate</strong> du Coran,
        <strong>%(k)s versets</strong>. Chaque verset est donné en arabe, puis
        dans la traduction de son sens, avec sa référence.</p>
    </div>

    <p class="lecon-prudence">La traduction est une <strong>traduction du
      sens</strong>, celle de <strong>Muhammad Hamidullah</strong>. Le Coran,
      c'est l'arabe : une traduction en approche, elle ne le remplace pas.
      Cette page ne donne <strong>ni prononciation ni commentaire</strong> —
      pour l'un comme pour l'autre, adresse-toi à quelqu'un qui enseigne.</p>
""" % {'num': num, 'titre': echapper(titre), 'nom_ar': echapper(nom_ar),
       'k': en_lettres(k)}

    h += '\n    <ol class="versets">\n'
    for i, (a, f) in enumerate(vs, 1):
        h += """      <li class="verset">
        <span class="verset-n">Verset %d sur %d</span>
        <p class="verset-ar" lang="ar" dir="rtl">%s</p>
        <span class="verset-etiq">Traduction du sens</span>
        <p class="verset-fr">%s</p>
        <p class="verset-source">Coran, sourate %s (%d), verset %d.
          Traduction&nbsp;: %s.</p>
      </li>
""" % (i, k, echapper(a), citation(f), echapper(nom), num, i, TRADUCTEUR)
    h += '    </ol>\n'

    # LE MAILLAGE. Une page seule ne se transmet pas : elle renvoie vers le
    # QCM de sa section, vers l'index des 114, et vers les deux lecons
    # voisines dans l'ordre du Coran.
    h += """
    <div class="lecon-suite">
      <h2 class="t-bloc">Continuer</h2>
      <a class="ligne" href="section/%(sec)s">
        <span class="rond"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h14v15H5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 9h7M8.5 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>
        <span class="milieu"><span class="nom">%(secnom)s</span>
          <span class="quoi">Le QCM : reconnaître un verset, retrouver son sens.</span></span>
        <span class="pc" aria-hidden="true">&rarr;</span>
      </a>
""" % {'sec': SECTION[0], 'secnom': SECTION[1]}
    for v_num, v_nom in voisins:
        h += """      <a class="ligne" href="lecon-sourate-%s.html">
        <span class="rond"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span>
        <span class="milieu"><span class="nom">Sourate %s</span>
          <span class="quoi">La %de sourate, verset par verset.</span></span>
        <span class="pc" aria-hidden="true">&rarr;</span>
      </a>
""" % (ardoise(v_nom), echapper(v_nom), v_num)
    h += """      <a class="ligne" href="sourates.html">
        <span class="rond"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h16M4 12h16M4 18.5h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>
        <span class="milieu"><span class="nom">Les 114 sourates</span>
          <span class="quoi">Le nom de chacune, en arabe et en français.</span></span>
        <span class="pc" aria-hidden="true">&rarr;</span>
      </a>
    </div>

  </div>

  <nav class="nav" aria-label="Navigation principale">
    <a href="index.html"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10.5L12 4l8.5 6.5V20h-17z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg><span>Accueil</span></a>
    <a href="sections.html"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg><span>Sections</span></a>
    <a href="progres.html"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5V13m5 6.5V8m5 11.5v-9m5 9V5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>Progrès</span></a>
    <a href="plus.html"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>Plus</span></a>
  </nav>

</div>

<script src="js/geometrie.js"></script>
</body>
</html>
"""
    return slug, titre, desc, h


def main():
    ar, fr, noms = charger()
    controler(ar)
    print('  temoin Al-Fatiha : 7/7 versets identiques a la page relue.')

    lot = [int(x) for x in sys.argv[1:]] or LOT
    ordre = sorted(lot)
    fait = []
    for n in ordre:
        nom_ar, nom = noms[n]
        vs = versets(ar, fr, n)
        i = ordre.index(n)
        voisins = []
        for j in (i - 1, i + 1):
            if 0 <= j < len(ordre) and ordre[j] != n:
                voisins.append((ordre[j], noms[ordre[j]][1]))
        slug, titre, desc, html = page(n, nom, nom_ar, vs, voisins)
        (RACINE / slug).write_text(html, encoding='utf-8')
        fait.append((n, nom, len(vs), slug, len(titre), len(desc)))
        print('  %3d  %-12s %2d versets  titre %2d car.  desc %d car.  %s'
              % (n, nom, len(vs), len(titre), len(desc), slug))
    print('\n  %d lecon(s) ecrite(s).' % len(fait))
    return fait


if __name__ == '__main__':
    main()
