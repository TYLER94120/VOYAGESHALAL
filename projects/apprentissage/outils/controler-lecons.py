#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Relit les lecons PUBLIEES et les confronte au Coran, ligne par ligne.

POURQUOI UN CONTROLE SEPARE DU GENERATEUR
-----------------------------------------
Le generateur peut avoir raison sur ses donnees et tort sur son gabarit : une
accolade mal placee, un `%s` qui prend la valeur d'a cote, et une lecon
affiche le verset 3 sous l'etiquette « verset 2 ». Le generateur ne le verra
jamais — il relit ce qu'il croit avoir ecrit.

Cet outil-ci ne lui fait aucune confiance. Il OUVRE les fichiers HTML tels
qu'ils sont sur le disque, en extrait chaque verset arabe, chaque traduction
et chaque reference, et compare le tout au jeu de donnees. Un seul ecart, et
le lot entier est refuse : sur du texte coranique, une faute n'est jamais
isolee, elle est le signe qu'on s'est relu trop vite.

CE QU'IL VERIFIE
----------------
 1. le texte arabe de chaque verset, caractere pour caractere ;
 2. la traduction, mot pour mot (la reparation typographique des guillemets
    de Hamidullah est la seule difference toleree) ;
 3. le numero de sourate et de verset annonces dans chaque reference ;
 4. le compte de versets, et qu'il n'en manque aucun ;
 5. qu'aucune basmala ne traine dans un verset 1 ;
 6. que le traducteur est nomme a chaque verset ;
 7. le titre : moins de 60 caracteres ; la description : entre 150 et 160 ;
 8. le canonical, qui doit designer la page elle-meme ;
 9. que chaque lecon est annoncee dans sitemap.xml ;
10. qu'aucune lecon n'est orpheline : quelque chose du site doit y mener.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran'
SITE = 'https://islampasapas.fr'

AR = re.compile(r'<p class="verset-ar" lang="ar" dir="rtl">(.*?)</p>', re.S)
FR = re.compile(r'<p class="verset-fr">(.*?)</p>', re.S)
SRC = re.compile(r'<p class="verset-source">Coran, sourate ([^(]+) \((\d+)\), '
                 r'verset (\d+)\.\s*Traduction&nbsp;: ([^<.]+)\.', re.S)
TITRE = re.compile(r'<title>(.*?)</title>', re.S)
DESC = re.compile(r'<meta name="description" content="(.*?)">', re.S)
CANON = re.compile(r'<link rel="canonical" href="([^"]+)">')


def desechapper(s):
    return (s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
            .replace('&quot;', '"').replace('&nbsp;', ' '))


def guillemets(s):
    """La meme reparation typographique que le generateur, pour comparer."""
    s = s.strip()
    if s.count('«') > s.count('»'):
        s += '»'
    elif s.count('»') > s.count('«'):
        s = '«' + s
    return s


def main():
    ar = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']}
    fr = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'fra-muhammadhamidul.json').read_text(encoding='utf-8'))['quran']}
    noms = {s['n']: s['tr'] for s in
            json.loads((CORAN / 'noms-sourates.json').read_text(encoding='utf-8'))}
    basmala = unicodedata.normalize('NFC', ar[(1, 1)])

    pages = sorted(RACINE.glob('lecon-sourate-*.html'))
    if not pages:
        sys.exit('ARRET : aucune lecon a controler.')

    sitemap = (RACINE / 'sitemap.xml').read_text(encoding='utf-8') \
        if (RACINE / 'sitemap.xml').is_file() else ''

    # Qui mene aux lecons ? On lit les liens de TOUTES les pages du site.
    entrants = {}
    for p in RACINE.glob('*.html'):
        for cible in re.findall(r'href="(lecon-sourate-[^"]+)"', p.read_text(encoding='utf-8')):
            entrants.setdefault(cible, set()).add(p.name)

    fautes, versets_lus = [], 0
    for p in pages:
        t = p.read_text(encoding='utf-8')
        nom_page = p.name

        srcs = SRC.findall(t)
        aras = AR.findall(t)
        frs = FR.findall(t)
        if not (len(srcs) == len(aras) == len(frs)) or not srcs:
            fautes.append('%s : %d versets arabes, %d traductions, %d references — '
                          'les trois doivent aller ensemble'
                          % (nom_page, len(aras), len(frs), len(srcs)))
            continue

        num = int(srcs[0][1])
        attendu = max(v for (c, v) in ar if c == num)
        if len(srcs) != attendu:
            fautes.append('%s : %d versets publies, la sourate %d en compte %d'
                          % (nom_page, len(srcs), num, attendu))

        for i, ((s_nom, s_num, s_v, s_trad), a, f) in enumerate(zip(srcs, aras, frs), 1):
            s_num, s_v = int(s_num), int(s_v)
            ref = '%s v.%d' % (nom_page, i)
            if s_num != num:
                fautes.append('%s : la reference change de sourate (%d puis %d)'
                              % (ref, num, s_num))
                continue
            if s_v != i:
                fautes.append('%s : reference « verset %d » sur le %de bloc' % (ref, s_v, i))
            if s_nom.strip() != noms.get(num, ''):
                fautes.append('%s : nom « %s », attendu « %s »'
                              % (ref, s_nom.strip(), noms.get(num, '?')))
            if s_trad.strip() != 'Muhammad Hamidullah':
                fautes.append('%s : traducteur « %s » — la traduction doit etre '
                              'attribuee' % (ref, s_trad.strip()))

            # 1. L'arabe, caractere pour caractere.
            # DANS AL-FATIHA, LE VERSET 1 EST LA BASMALA.
            # Partout ailleurs elle est collee en tete du verset 1 par
            # l'edition et doit etre retiree ; ici elle EST le verset. Sans
            # cette exception, le controle retirait la basmala de 1:1, se
            # retrouvait avec une chaine vide, et refusait la sourate la plus
            # recitee de toutes. On nomme le cas, on ne desarme pas la regle.
            attendu_ar = unicodedata.normalize('NFC', ar.get((num, i), ''))
            if i == 1 and num != 1 and attendu_ar.startswith(basmala):
                attendu_ar = attendu_ar[len(basmala):].strip()
            lu = unicodedata.normalize('NFC', desechapper(a).strip())
            if lu != attendu_ar:
                fautes.append('%s : le texte arabe ne correspond pas au Coran' % ref)
            if basmala and basmala in lu and not (num == 1 and i == 1):
                fautes.append('%s : basmala restee dans le verset' % ref)
            versets_lus += 1

            # 2. La traduction, mot pour mot.
            attendu_fr = guillemets(fr.get((num, i), '').strip())
            if desechapper(f).strip() != attendu_fr:
                fautes.append('%s : la traduction ne correspond pas a Hamidullah' % ref)

        # 7-8. Les balises qui decident du referencement.
        m = TITRE.search(t)
        if not m:
            fautes.append('%s : pas de <title>' % nom_page)
        elif len(desechapper(m.group(1))) > 60:
            fautes.append('%s : titre de %d caracteres (60 au plus)'
                          % (nom_page, len(desechapper(m.group(1)))))
        d = DESC.search(t)
        if not d:
            fautes.append('%s : pas de meta description' % nom_page)
        elif not 150 <= len(desechapper(d.group(1))) <= 160:
            fautes.append('%s : description de %d caracteres (150 a 160)'
                          % (nom_page, len(desechapper(d.group(1)))))
        c = CANON.search(t)
        if not c or c.group(1) != '%s/%s' % (SITE, nom_page):
            fautes.append('%s : canonical absent ou faux (%s)'
                          % (nom_page, c.group(1) if c else '—'))

        # 9. Annoncee dans le sitemap.
        if '%s/%s' % (SITE, nom_page) not in sitemap:
            fautes.append('%s : absente de sitemap.xml' % nom_page)

        # 10. Pas orpheline.
        if not entrants.get(nom_page):
            fautes.append('%s : aucune page du site n\'y mene' % nom_page)

    # LES 114 NOMBRES DE VERSETS DE sourates.html SE RECOMPTENT.
    # Ils sont affiches sur une page indexee ; un chiffre faux y serait une
    # affirmation fausse sur le Coran, sur une page publique, au nom de
    # l'editeur. On ne fait donc pas confiance au generateur : on relit la
    # page telle qu'elle est ecrite et on recompte depuis le corpus.
    index = RACINE / 'sourates.html'
    if index.is_file():
        t = index.read_text(encoding='utf-8')
        lignes = re.findall(
            r'<span class="s-num">(\d+)</span>.*?<span class="s-nb">(\d+)&nbsp;v\.</span>',
            t, re.S)
        if len(lignes) != 114:
            fautes.append('sourates.html : %d lignes avec un nombre de versets, '
                          'attendu 114' % len(lignes))
        for num, dit in lignes:
            vrai = max((v for (c, v) in ar if c == int(num)), default=0)
            if int(dit) != vrai:
                fautes.append('sourates.html : sourate %s annoncee a %s versets, '
                              'le corpus en compte %d' % (num, dit, vrai))

        # LE NOMBRE DE LECONS ANNONCE DOIT ETRE LE NOMBRE DE LECONS.
        #
        # La description de cette page a annonce « Vingt » pendant deux jours
        # alors que le corps de la MEME page annoncait vingt et un. Le second
        # etait compte, le premier ecrit a la main dans une constante, et
        # l'ajout d'Al-Fatiha n'avait touche que ce qui se compte. Rien ne
        # l'a signale : les deux nombres vivaient a dix lignes l'un de
        # l'autre sans que quoi que ce soit les confronte.
        #
        # On ne verifie donc pas une formulation, qui changera : on releve
        # TOUS les nombres annonces dans la description et dans le chapeau,
        # on met 114 de cote — c'est le nombre de sourates, pas de lecons —
        # et on exige que tout le reste soit egal au nombre de fichiers de
        # lecon reellement poses sur le disque. Une phrase reecrite passe ;
        # un nombre faux, non.
        vrai_lecons = len(pages)
        annonces = []
        d = DESC.search(t)
        if d:
            annonces += [(int(x), 'la description')
                         for x in re.findall(r'\d+', desechapper(d.group(1)))]
        chapeau = re.search(r'<p class="lecon-quoi">(.*?)</p>', t, re.S)
        if chapeau:
            annonces += [(int(x), 'le chapeau')
                         for x in re.findall(r'\d+', desechapper(chapeau.group(1)))]
        if not annonces:
            fautes.append('sourates.html : ni description ni chapeau lisibles')
        for n, ou in annonces:
            if n == 114:
                continue
            if n != vrai_lecons:
                fautes.append('sourates.html : %s annonce %d lecons, il y en a %d'
                              % (ou, n, vrai_lecons))

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    print('  %d lecons de sourate, %d versets relus dans les pages publiees.'
          % (len(pages), versets_lus))
    print('  Texte arabe, traduction, reference et compte : conformes au Coran.')
    print('  Titres, descriptions, canonical, sitemap et maillage : conformes.')
    print('  Les 114 nombres de versets de sourates.html ont ete recomptes.')


if __name__ == '__main__':
    main()
