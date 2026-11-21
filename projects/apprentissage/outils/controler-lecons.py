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

ET DEPUIS LE 21 NOVEMBRE, IL NE CROIT PLUS LES SOURCES NON PLUS
---------------------------------------------------------------
Confronter une page a un jeu de donnees qu'on n'a confronte a rien, c'est
relire la copie sur le brouillon. Les trois fichiers de `outils/coran/` sont
donc confrontes ENTRE EUX avant que la moindre page soit ouverte : voir
`confronter_les_sources`, qui dit ce qu'elle couvre, ce qui a ete mesure puis
ECARTE, et ce qui reste NON VERIFIE.

CE QU'IL VERIFIE
----------------
 0. que les sources s'accordent : memes versets dans l'arabe, dans la
    traduction et dans le temoin morphologique, chaque sourate numerotee de
    1 a n sans trou, et la basmala la ou le generateur la croit ;
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


def seuil_index():
    """Le seuil du generateur, lu chez lui — jamais recopie ici.

    Deux fois le meme nombre dans deux fichiers, c'est deux nombres : le jour
    ou l'un bouge, l'autre reste, et le controle valide le contraire de ce que
    la page fait. On lit donc la constante a la source.

    On la BORNE quand meme. La valeur est un choix editorial, mais elle ne
    peut pas etre n'importe quoi : la mettre a 999 desarmerait la regle « une
    longue lecon doit avoir un index » sans qu'aucun controle ne bronche, et
    la mettre a 1 collerait un index a une sourate de trois versets.
    """
    import importlib.util
    src = pathlib.Path(__file__).with_name('faire-lecon-sourate.py')
    spec = importlib.util.spec_from_file_location('faire_lecon_sourate', src)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    s = getattr(mod, 'SEUIL_INDEX', None)
    if not isinstance(s, int) or not 3 <= s <= 15:
        sys.exit('ARRET : SEUIL_INDEX vaut %r ; attendu un entier de 3 a 15.' % s)
    return s


SEUIL_INDEX = seuil_index()

AR = re.compile(r'<p class="verset-ar" lang="ar" dir="rtl">(.*?)</p>', re.S)
FR = re.compile(r'<p class="verset-fr">(.*?)</p>', re.S)
SRC = re.compile(r'<p class="verset-source">Coran, sourate ([^(]+) \((\d+)\), '
                 r'verset (\d+)\.\s*Traduction&nbsp;: ([^<.]+)\.', re.S)
TITRE = re.compile(r'<title>(.*?)</title>', re.S)
DESC = re.compile(r'<meta name="description" content="(.*?)">', re.S)
CANON = re.compile(r'<link rel="canonical" href="([^"]+)">')


LETTRE_AR = re.compile(r'[ؠ-يٱ-ۓ]')


def mots_lettres(texte):
    """Les mots du verset, sans les marques de pause.

    Le texte publie separe par des espaces des signes qui ne sont pas des
    mots — les marques de pause du mushaf. Les compter comme des mots fausse
    toute comparaison : voir la mesure dans `confronter_les_sources`.
    """
    return [m for m in texte.split() if LETTRE_AR.search(m)]


def confronter_les_sources(ar, fr):
    """LES SOURCES, CONFRONTEES ENTRE ELLES — 21 NOVEMBRE

    POURQUOI CE BLOC MANQUAIT, ET CE QU'IL COUVRE

    Tout ce fichier confronte les PAGES au jeu de donnees. Le jeu de donnees,
    lui, n'etait confronte qu'a un seul temoin non circulaire : les sept
    versets d'Al-Fatiha relus a la main. Sept sur les 571 publies.

    Deux fautes graves pouvaient donc passer sans qu'aucun controle bronche,
    et aucune ne se voit a l'oeil :

    1. UN SENS SOUS LE MAUVAIS VERSET. Une lecon apparie l'arabe et la
       traduction par la clef (sourate, verset). Si l'un des deux fichiers
       numerotait une sourate autrement que l'autre, la page afficherait le
       sens d'un verset sous le texte d'un autre — et les deux moities
       seraient « conformes » a leur propre fichier. C'est exactement ce que
       ce site s'interdit : attribuer un sens a la mauvaise parole. Le risque
       n'est pas theorique ; il suffit de remplacer une traduction.
    2. LA BASMALA. `faire-lecon-sourate.py` la retire du verset 1 de toutes
       les sourates sauf la premiere, et c'est la decision la plus delicate
       de la chaine — s'y tromper donne un « verset 1 » faux sur 112
       sourates. Elle reposait sur un RAISONNEMENT ecrit dans un commentaire.

    UN SECOND TEMOIN DORMAIT DANS LE DEPOT

    `outils/coran/morphologie.txt` vient d'une autre provenance et porte une
    reference `sourate:verset:mot:segment` sur chacune de ses lignes. Il ne
    peut pas servir a verifier les LETTRES — le depot a deja mesure que les
    deux textes ne notent pas l'alef de la meme facon
    (`faire-11-vocabulaire.py`). Mais la STRUCTURE ne depend d'aucune
    orthographe, et c'est elle qui portait les deux risques ci-dessus.

    CE QUI A ETE MESURE ET ECARTE, POUR QUE PERSONNE NE LE RETENTE

    Le compte de MOTS par verset. Brut : 2 946 versets sur 6 236 en
    desaccord, parce que le texte publie compte les marques de pause comme
    des mots. Marques filtrees : encore 465. La cause est mesuree et non
    supposee — la morphologie ecrit le vocatif en UN mot la ou le texte
    publie en ecrit deux, ce qui explique aussi les onze sourates ou l'ecart
    du verset 1 vaut 5 et non 4. Ce temoin vaut pour la structure, pas pour
    l'orthographe : aucun compte de mots n'est donc exige ici.

    CE QUI RESTE NON VERIFIE, ET LE RESTERA

    Que ces comptes soient les BONS. Deux fichiers qui s'accordent valent
    mieux qu'un seul, et ce n'est pas la meme chose qu'une verification
    contre le monde. La seule ancre non circulaire du depot reste Al-Fatiha,
    sept versets relus a la main. Verifie / ecarte / NON VERIFIE : le
    troisieme est une information, pas un echec.
    """
    # 1. les deux jeux de donnees publies portent-ils les memes versets ?
    if set(ar) != set(fr):
        manque_fr = sorted(set(ar) - set(fr))[:5]
        manque_ar = sorted(set(fr) - set(ar))[:5]
        sys.exit('ARRET : les deux jeux de donnees du Coran ne portent pas '
                 'les memes versets. Absents de la traduction : %s. Absents '
                 'de l arabe : %s. Une lecon apparie les deux par (sourate, '
                 'verset) : un seul ecart afficherait un sens sous le '
                 'mauvais verset.' % (manque_fr, manque_ar))

    # 2. chaque sourate numerote 1..n, sans trou ni doublon
    par_sourate = {}
    for s, v in ar:
        par_sourate.setdefault(s, []).append(v)
    for s in sorted(par_sourate):
        suite = sorted(par_sourate[s])
        if suite != list(range(1, len(suite) + 1)):
            sys.exit('ARRET : la sourate %d ne numerote pas ses versets de 1 '
                     'a %d sans trou : %s…' % (s, len(suite), suite[:6]))

    # 3. le temoin morphologique couvre-t-il les memes versets ?
    temoin = {}
    for ligne in (CORAN / 'morphologie.txt').read_text(
            encoding='utf-8').split('\n'):
        if not ligne.strip():
            continue
        bouts = ligne.split('\t', 1)[0].split(':')
        if len(bouts) != 4:
            continue
        s, v, m, _segment = (int(x) for x in bouts)
        temoin.setdefault((s, v), set()).add(m)

    if set(ar) != set(temoin):
        sys.exit('ARRET : le temoin morphologique et le jeu de donnees ne '
                 'portent pas les memes versets (%d contre %d). L un des '
                 'deux a change de decoupage.' % (len(temoin), len(ar)))

    # 4. la basmala, la ou le generateur croit qu'elle est, et nulle part
    #    ailleurs. Deux criteres qui se tiennent l'un l'autre : le texte
    #    publie commence par elle partout sauf a la sourate 9 ; et le temoin
    #    compte le MEME nombre de mots que le publie pour exactement deux
    #    sourates — la premiere, ou la basmala EST le verset 1, et la
    #    neuvieme, qui n'en a pas.
    basmala = mots_lettres(ar[(1, 1)])
    if len(basmala) != 4:
        sys.exit('ARRET : le verset 1:1 ne fait pas quatre mots (%d) — la '
                 'basmala du jeu de donnees a change de forme.'
                 % len(basmala))

    sans_basmala = [s for s in range(1, 115)
                    if mots_lettres(ar[(s, 1)])[:4] != basmala]
    if sans_basmala != [9]:
        sys.exit('ARRET : les sourates dont le verset 1 ne commence PAS par '
                 'la basmala devraient etre la seule sourate 9 ; mesure : %s.'
                 % sans_basmala)

    meme_etendue = [s for s in range(1, 115)
                    if len(mots_lettres(ar[(s, 1)])) == len(temoin[(s, 1)])]
    if meme_etendue != [1, 9]:
        sys.exit('ARRET : le temoin devrait compter le verset 1 comme le '
                 'texte publie pour les seules sourates 1 et 9 ; mesure : '
                 '%s. La regle de retrait de la basmala ne tient plus.'
                 % meme_etendue)

    return len(ar), len(temoin), len(par_sourate)


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

    # Les sources d'abord, les pages ensuite. Confronter une page a un jeu de
    # donnees qu'on n'a pas confronte a autre chose, c'est verifier la copie
    # sur le brouillon.
    n_versets, n_temoin, n_sourates = confronter_les_sources(ar, fr)

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
    avec_numero, longueurs_desc = 0, []
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

        # 11. LES ANCRES DE VERSET, ET L'INDEX QUI Y MENE.
        #
        # Une ancre fausse est pire que pas d'ancre : on clique « verset 5 »
        # et on atterrit sur le 4, sans que rien ne le signale — la page a
        # l'air d'avoir obei. On verifie donc les trois choses qui peuvent
        # se decaler independamment : que chaque bloc porte l'ancre de SON
        # numero, qu'aucune ne se repete, et que chaque numero de l'index
        # designe une ancre qui existe vraiment.
        ids = re.findall(r'<li class="verset" id="verset-(\d+)">', t)
        if len(ids) != len(srcs):
            fautes.append('%s : %d ancres de verset pour %d versets'
                          % (nom_page, len(ids), len(srcs)))
        for rang, got in enumerate(ids, 1):
            if int(got) != rang:
                fautes.append('%s : le %de bloc porte l\'ancre verset-%s'
                              % (nom_page, rang, got))
        if len(set(ids)) != len(ids):
            fautes.append('%s : deux versets portent la meme ancre' % nom_page)

        index = re.search(r'<nav class="vindex"[^>]*>(.*?)</nav>', t, re.S)
        vises = re.findall(r'href="#verset-(\d+)"', index.group(1)) if index else []
        if index:
            if [int(x) for x in vises] != list(range(1, len(srcs) + 1)):
                fautes.append('%s : l\'index vise %s, il faut 1 a %d dans '
                              'l\'ordre' % (nom_page, vises or '—', len(srcs)))
            manquantes = [x for x in vises if x not in ids]
            if manquantes:
                fautes.append('%s : l\'index mene a des ancres absentes (%s)'
                              % (nom_page, ', '.join(manquantes)))
        if index and len(srcs) < SEUIL_INDEX:
            fautes.append('%s : %d versets seulement, l\'index encombre'
                          % (nom_page, len(srcs)))
        if not index and len(srcs) >= SEUIL_INDEX:
            fautes.append('%s : %d versets et aucun index — a partir de %d, '
                          'la liste depasse deux ecrans'
                          % (nom_page, len(srcs), SEUIL_INDEX))

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
        # 8 bis. LA DESCRIPTION DIT LE NUMERO DE LA SOURATE — 22 OCTOBRE
        #
        # « sourate 112 » est exactement le genre de requete que la loi de la
        # precision designe comme le terrain de ce site. Une page qui n'ecrit
        # jamais « 112 » dans sa description ne peut pas y repondre, et la
        # description est la seule ligne que Google affiche sous le titre.
        #
        # Le titre ne peut pas prendre ce numero : celui d'Al-Mutaffifin fait
        # deja 59 caracteres et la regle est 60. Le corps de la page le dit
        # — « La 112e sourate du Coran » — mais pas la description.
        #
        # Mesure du 22 octobre, avant correction : 20 descriptions sur 38 ne
        # portaient pas le numero, dont celle d'AL-IKHLAS, la seule page du
        # site qui ressorte en position 11. `faire-lecon-sourate.py` ecrit
        # cinq formulations et retient la premiere qui tient dans la fenetre
        # de 150 a 160 ; deux d'entre elles ne disent pas le numero et elles
        # etaient en tete. Elles sont passees en secours, et les 38 portent
        # le numero.
        #
        # LE NUMERO EST CELUI QUE LA PAGE REVENDIQUE ELLE-MEME, lu dans la
        # reference de son premier verset : si la description annonce une
        # autre sourate que les versets publies, c'est cela qu'il faut voir.
        #
        # PAS D'AMBIGUITE POSSIBLE AVEC LE NOMBRE DE VERSETS, qui figure dans
        # la meme phrase : AUCUNE des 114 sourates du Coran n'a un nombre de
        # versets egal a son numero. Verifie sur les 114, pas suppose.
        if d:
            texte_desc = desechapper(d.group(1))
            longueurs_desc.append(len(texte_desc))
            if re.search(r'(?<![0-9])%d(?![0-9])' % num, texte_desc):
                avec_numero += 1
            else:
                fautes.append('%s : la description ne dit pas que c\'est la '
                              '%de sourate — « sourate %d » est une requete '
                              'precise, et cette ligne est la seule que '
                              'Google affiche sous le titre : « %s »'
                              % (nom_page, num, num, texte_desc[:70]))
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
    # LA LISTE DES NOMS SERVIE AUX TELEPHONES EST-ELLE CELLE QUI A FAIT LES
    # PAGES ?
    #
    # `data/noms-sourates.json` est servi au navigateur : `lancer-qcm.js` le
    # passe a `poserTables`, et c'est lui qui ecrit « SOURATE AT-TIN » sur le
    # cartouche de chaque carte de QCM. `outils/coran/noms-sourates.json`,
    # lui, a fabrique les 38 lecons, les questions, le sitemap et la liste des
    # LE BLOC DES VERSETS PORTE UN TITRE, ET C'EST LE PREMIER APRES LE <h1>.
    #
    # Mesure du 9 octobre : le seul <h2> d'une lecon etait « Continuer »,
    # celui du bloc de maillage. Les versets — jusqu'a 46, jusqu'a 1 518 mots,
    # toute la substance de la page — n'etaient sous aucun titre. Au lecteur
    # d'ecran qui parcourt par les titres, la page annoncait « Sourate
    # An-Nazi'at » puis « Continuer », et rien entre les deux.
    #
    # On verifie l'ORDRE, pas seulement la presence : un titre pose apres le
    # bloc de maillage ne labelliserait rien. Et on verifie qu'il arrive AVANT
    # le premier verset.
    for f in sorted(RACINE.glob('lecon-sourate-*.html')):
        h = f.read_text(encoding='utf-8')
        titres = re.findall(r'<h([12])[^>]*>(.*?)</h\1>', h, re.S)
        suite = [x[1] for x in titres if x[0] == '2']
        if not suite:
            fautes.append('%s : aucun <h2> — le texte n\'est sous aucun titre'
                          % f.name)
            continue
        if 'verset par verset' not in suite[0]:
            fautes.append('%s : le premier <h2> est « %s » ; le bloc des '
                          'versets n\'est donc sous aucun titre'
                          % (f.name, re.sub(r'<[^>]+>', '', suite[0]).strip()[:40]))
        ou_titre = h.find('verset par verset</h2>')
        ou_premier = h.find('<ol class="versets">')
        if ou_titre < 0 or ou_premier < 0 or ou_titre > ou_premier:
            fautes.append('%s : le titre du bloc n\'est pas pose avant les '
                          'versets' % f.name)

    # 114.
    #
    # Ils etaient identiques le 29 septembre — et maintenus par personne :
    # aucun outil n'ecrivait le second, aucun controle ne les comparait. Le
    # jour ou une translitteration est corrigee d'un cote, les pages suivent
    # et les cartes gardent l'ancienne. Deux orthographes pour une meme
    # sourate selon l'ecran, sur un site qui enseigne le Coran.
    #
    # `faire-sourates.py` refabrique desormais la copie servie. Ce controle
    # verifie qu'elle n'a pas ete touchee a la main depuis.
    servi = RACINE / 'data' / 'noms-sourates.json'
    source = CORAN / 'noms-sourates.json'
    if not servi.is_file():
        fautes.append('data/noms-sourates.json est absent : les cartes de QCM '
                      'n\'auront pas de nom de sourate. Lancer faire-sourates.py')
    elif servi.read_bytes() != source.read_bytes():
        a = json.loads(source.read_text(encoding='utf-8'))
        b = json.loads(servi.read_text(encoding='utf-8'))
        pa = {x['n']: x for x in a}
        pb = {x['n']: x for x in b}
        ecarts = [str(n) for n in sorted(set(pa) | set(pb)) if pa.get(n) != pb.get(n)]
        fautes.append('data/noms-sourates.json differe de outils/coran/ sur %d '
                      'sourate(s) (%s). Les pages sont faites avec l\'une et les '
                      'cartes de QCM affichent l\'autre. Lancer faire-sourates.py'
                      % (len(ecarts), ', '.join(ecarts[:8]) or 'mise en forme'))

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

    # CETTE LIGNE DIT LE MESURE, PAS UN VERDICT, et elle s'imprime que le
    # lot passe ou non : une ligne de bilan qui ne peut pas se taire est une
    # ligne qui ne dit rien.
    print('  %d/%d descriptions disent le numero de leur sourate (%d a %d '
          'caracteres).'
          % (avec_numero, len(pages),
             min(longueurs_desc) if longueurs_desc else 0,
             max(longueurs_desc) if longueurs_desc else 0))

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    print('  %d lecons de sourate, %d versets relus dans les pages publiees.'
          % (len(pages), versets_lus))
    print('  Les sources confrontees entre elles : %d sourates, %d versets, '
          'les memes dans l arabe, la traduction et le temoin morphologique '
          '(%d).' % (n_sourates, n_versets, n_temoin))
    print('  La basmala : debut du verset 1 partout sauf a la sourate 9 ; '
          'comptee DANS le verset 1 par le temoin aux seules sourates 1 et 9.')
    print('  NON VERIFIE, et ca se dit : que ces comptes soient les bons. '
          'La seule ancre hors du depot reste Al-Fatiha, 7 versets relus.')
    print('  Texte arabe, traduction, reference et compte : conformes au Coran.')
    print('  Titres, descriptions, canonical, sitemap et maillage : conformes.')
    print('  %d ancres de verset relues, et les index (des %d versets) y menent.'
          % (versets_lus, SEUIL_INDEX))
    print('  Les 114 nombres de versets de sourates.html ont ete recomptes.')
    print('  Chaque lecon titre son bloc de versets, avant le premier verset.')


if __name__ == '__main__':
    main()
