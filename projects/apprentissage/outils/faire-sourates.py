#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""La page des 114 sourates — l'index, et le pivot du maillage interne.

POURQUOI ELLE REVIENT
---------------------
`/sourates.html` etait la page la plus vue du site au releve du 21 aout : sept
impressions sur douze. La refonte du meme jour l'a supprimee. C'est aussi la
seule page qui peut relier entre elles les vingt lecons de sourate : sans
elle, chaque lecon est une impasse que rien n'annonce.

CE QU'ELLE CONTIENT, ET RIEN D'AUTRE
------------------------------------
Le numero, le nom arabe, le nom en francais, et le nombre de versets.

LE NOMBRE DE VERSETS A LONGTEMPS MANQUE, et pour une bonne raison : il aurait
fallu le recopier d'ailleurs, et un chiffre affiche sans etre verifie est
exactement ce que ce site s'interdit. Il est desormais COMPTE dans
`ara-quransimple.json`, la meme edition que celle des lecons, et
`controler-lecons.py` recompte deja ces memes nombres sur les vingt lecons
publiees. La raison de l'omettre a disparu ; la colonne arrive.

Elle sert aussi a quelque chose de precis : « combien de versets dans la
sourate X » est une question que les gens posent vraiment, et cette page n'y
repondait pas alors qu'elle en avait les moyens.

Les sourates qui ont une lecon deviennent des LIENS ; les 94 autres restent
des lignes. On ne promet pas une page qui n'existe pas.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran'


def echapper(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;')
            .replace('>', '&gt;').replace('"', '&quot;'))


def ardoise(nom):
    s = unicodedata.normalize('NFD', nom.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = s.replace("'", '-').replace(' ', '-')
    return re.sub(r'-{2,}', '-', re.sub(r'[^a-z0-9-]', '', s)).strip('-')


TITRE = 'Les 114 sourates du Coran : noms et nombre de versets'

# LA DESCRIPTION COMPTE LES LECONS, ELLE NE LES ANNONCE PLUS DE MEMOIRE.
#
# Elle a dit « Vingt d'entre elles sont expliquees » pendant deux jours alors
# qu'il y en avait vingt et une : le nombre etait ecrit a la main dans une
# constante, le corps de la page le calculait, et l'ajout d'Al-Fatiha n'a
# touche que le second. La page affichait donc deux nombres differents pour
# la meme chose, dont un faux, sur celle qui recoit le plus d'impressions du
# site — et une affirmation fausse sur le Coran, publique, au nom de
# l'editeur, est precisement ce que ce projet s'interdit.
#
# La faute n'etait pas d'avoir mal recopie : c'etait d'avoir recopie. Le
# nombre se COMPTE maintenant, au meme endroit et au meme moment que celui du
# corps de la page, et `controler-lecons.py` verifie que les deux se
# recoupent et qu'ils correspondent aux fichiers reellement sur le disque.
#
# Les variantes existent parce que la description doit tenir entre 150 et 160
# caracteres : selon que le nombre s'ecrit sur un ou trois chiffres, la phrase
# gagne ou perd deux caracteres et peut sortir de la fenetre. On en propose
# donc plusieurs, toutes vraies, et on garde la premiere qui tient.
def description(n):
    variantes = [
        "Les 114 sourates du Coran dans l'ordre : nom en arabe, nom en français,"
        " numéro et nombre de versets. %d d'entre elles sont expliquées verset"
        " par verset." % n,
        "Les 114 sourates du Coran dans l'ordre : nom en arabe, nom en français,"
        " numéro et nombre de versets. %d sont expliquées verset par verset." % n,
        "Les 114 sourates du Coran dans l'ordre, avec leur nom en arabe, leur nom"
        " en français, leur numéro et leur nombre de versets. %d ont une leçon."
        % n,
    ]
    for v in variantes:
        if 150 <= len(v) <= 160:
            return v
    sys.exit('ARRET : aucune description entre 150 et 160 caracteres pour '
             '%d lecons (longueurs : %s).'
             % (n, ', '.join(str(len(v)) for v in variantes)))


def main():
    noms = json.loads((CORAN / 'noms-sourates.json').read_text(encoding='utf-8'))
    if len(noms) != 114:
        sys.exit('ARRET : %d sourates au lieu de 114.' % len(noms))

    # Les versets, COMPTES et non recopies.
    from collections import Counter
    ar = json.loads((CORAN / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']
    versets = Counter(v['chapter'] for v in ar)
    if len(versets) != 114 or sum(versets.values()) != len(ar):
        sys.exit('ARRET : le comptage des versets ne couvre pas les 114 sourates.')

    # Les lecons REELLEMENT presentes sur le disque. On ne lit pas une liste
    # ecrite a la main : elle vieillirait des la premiere lecon ajoutee ou
    # retiree, et la page promettrait des pages absentes.
    avec = {}
    for s in noms:
        f = 'lecon-sourate-%s.html' % ardoise(s['tr'])
        if (RACINE / f).is_file():
            avec[s['n']] = f
    if len(TITRE) > 60:
        sys.exit('ARRET : titre de %d caracteres.' % len(TITRE))
    DESC = description(len(avec))

    jsonld = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Les 114 sourates du Coran',
        'url': 'https://islampasapas.fr/sourates.html',
        'inLanguage': 'fr',
        'numberOfItems': 114,
        'description': DESC,
    }, ensure_ascii=False, indent=1)

    h = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(titre)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="#FAF7F0">
<link rel="canonical" href="https://islampasapas.fr/sourates.html">
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
<meta property="og:type" content="website">
<meta property="og:url" content="https://islampasapas.fr/sourates.html">
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

  <div class="corps lecon-corps" id="principal">

    <div class="tete">
      <a class="marque" href="index.html">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5 2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>
        <b>Islam pas à pas</b>
      </a>
    </div>

    <div class="lecon-tete">
      <h1 class="t-page">%(titre)s</h1>
      <p class="lecon-quoi">Les 114 sourates dans l'ordre du Coran, avec leur
        nom en arabe, en français, et leur nombre de versets.
        <strong>%(n)d d'entre elles</strong> sont expliquées verset par
        verset&nbsp;: leur nom est en vert.</p>
    </div>

    <ol class="srows">
""" % {'titre': echapper(TITRE), 'desc': echapper(DESC), 'jsonld': jsonld,
       'n': len(avec)}

    for s in noms:
        dedans = ('<span class="s-num">%d</span>'
                  '<span class="s-ar" lang="ar" dir="rtl">%s</span>'
                  '<span class="s-tr">%s</span>'
                  '<span class="s-nb">%d&nbsp;v.</span>'
                  % (s['n'], echapper(s['ar']), echapper(s['tr']), versets[s['n']]))
        if s['n'] in avec:
            h += ('      <li><a class="srow" href="%s">%s'
                  '<span class="s-fl" aria-hidden="true">&rsaquo;</span></a></li>\n'
                  % (avec[s['n']], dedans))
        else:
            h += '      <li class="srow">%s</li>\n' % dedans

    h += """    </ol>

    <div class="lecon-suite">
      <h2 class="t-bloc">Continuer</h2>
      <a class="ligne" href="section/sens-des-sourates">
        <span class="rond"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.5h14v15H5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8.5 9h7M8.5 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span>
        <span class="milieu"><span class="nom">Le sens des sourates</span>
          <span class="quoi">Le QCM : reconnaître un verset, retrouver son sens.</span></span>
        <span class="pc" aria-hidden="true">&rarr;</span>
      </a>
      <a class="ligne" href="sections.html">
        <span class="rond"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4.5h6.5V11H4zM13.5 4.5H20V11h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span>
        <span class="milieu"><span class="nom">Les 12 sections</span>
          <span class="quoi">Tout ce qu'on peut travailler sur le site.</span></span>
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
    (RACINE / 'sourates.html').write_text(h, encoding='utf-8')
    print('  sourates.html : 114 sourates, %d avec une lecon.' % len(avec))
    print('  titre %d caracteres, description %d.' % (len(TITRE), len(DESC)))
    print('  le nombre de lecons annonce est compte, pas recopie.')


if __name__ == '__main__':
    main()
