#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SECTIONS THEMATIQUES tirees du Coran seul.

POURQUOI CE GENERATEUR EXISTE
-----------------------------
Huit sections sur douze devaient reposer sur des hadiths. Le seul jeu de
donnees francais atteignable s'est revele etre une traduction automatique de
l'anglais, sans traducteur nomme. On ne publie pas cela comme parole du
Prophete. Ces sections se construisent donc sur le Coran, dont la traduction
du sens est nommee (Muhammad Hamidullah) et deja verifiee.

CE QUI EST MESURE AVANT D'ETRE ECRIT
------------------------------------
Chaque theme est defini par des mots ARABES et des mots FRANCAIS. Un verset
n'entre dans un theme que si les DEUX le designent. C'est la lecon de la
section des prophetes : cherchee sur le seul arabe, « صالح » ramenait les
versets sur les bonnes oeuvres, et « هود » ceux sur les Juifs. Les deux jeux
de donnees se controlent l'un l'autre.

Le generateur affiche ce que chaque theme a REELLEMENT rendu, et signale les
sections qui n'atteignent pas les cent questions du palier 1. Il ne comble
jamais un manque en inventant.

DEUX FORMES DE QUESTION, AUCUNE INTERPRETATION
----------------------------------------------
  A. On montre le verset en arabe : quelle est la traduction de son sens ?
  B. On montre le debut de la traduction : quelle en est la suite ?

On ne demande jamais ce qu'il faut FAIRE. On transmet, on ne tranche pas.
"""

import random
import re
import sys

import fabrique as F

DIACRITIQUES = re.compile(r'[ً-ٰٟۖ-ۭـ]')

# Chaque theme : le fichier de section, le nom lisible, les mots arabes et les
# mots francais. Les listes ont ete MESUREES avant d'etre retenues — une liste
# trop etroite laissait la prière a 61 versets, une liste trop large ramenait
# n'importe quoi.
#
# ==========================================================================
# CE QUE « MESUREE » DOIT VOULOIR DIRE — 12 NOVEMBRE
#
# Mesurer le NOMBRE DE CORRESPONDANCES ne suffit pas. Il faut lire les
# versets et mesurer la PERTINENCE, et les deux chiffres n'ont rien a voir.
#
# Le 9 novembre j'ai propose un theme « le comportement » pour les quatre
# sujets du cahier — la parole, la colere, les parents, les voisins — en
# annoncant 80 VERSETS, quatre fois le seuil de 20. Le 12 novembre, lecture
# faite verset par verset :
#
#   la colere   15 correspondances, dont TREIZE parlent de la colere
#       D'ALLAH (2:90, 7:71, 7:152, 42:16, 3:112, 4:93, 5:60, 8:16,
#       16:106, 20:81, 20:86, 24:9, 42:16). DEUX parlent de la colere d'un
#       homme : 7:154, celle de Moise qui se calme, et 42:37, « qui
#       pardonnent apres s'etre mis en colere ».
#   la parole   37 correspondances, dont la plupart sont « dites » ou
#       « parole » dans un contexte theologique ou juridique : un mot
#       substitue (2:59), une proposition de mariage (2:235), l'heritage
#       (4:9), la parole ferme d'Allah (14:27).
#   les parents 31 correspondances, et l'arabe seul en ramenait SEPT CENT
#       ONZE — « ام » est une sous-chaine de dizaines de mots. Huit parlent
#       de bonte ou d'obeissance ; les autres de parts d'heritage et de
#       mariages interdits.
#   les voisins  1 correspondance, 4:36, et celle-la est juste.
#
# Le total pertinent est de l'ordre de QUINZE versets, sous le seuil de 20.
#
# ET LE RISQUE N'ETAIT PAS UN CHIFFRE FAUX. Si ce theme avait ete ecrit, le
# site aurait enseigne « la colere » par treize versets sur le courroux
# divin, dans une section de comportement, au nom de l'editeur. C'est
# exactement ce que la regle editoriale interdit.
#
# Le vocabulaire coranique de ces sujets NE SEPARE PAS le comportement
# humain des attributs divins. Aucune liste de mots-cles ne fait cette
# distinction : il faut un lecteur. C'est pour cela que ce theme n'existe
# pas, et pour cela que les quatre themes ci-dessous ont ete relus un par
# un avant d'etre retenus.
# ==========================================================================
THEMES = [
    ('piliers-de-la-foi', 'Les piliers de la foi',
     ['الملائكة', 'اليوم الاخر', 'رسله', 'كتبه', 'بالغيب'],
     ['anges', 'Jour dernier', 'messagers', 'Livres', 'invisible']),

    ('la-priere', 'La prière',
     ['الصلاة', 'صلاة', 'اركعوا', 'السجود', 'يسجد'],
     ['Salât', 'prière', 'Priè', 'prosterne', 'inclinez']),

    ('zakat-et-aumone', "La zakât et l'aumône",
     ['الزكاة', 'زكاة', 'صدقات', 'الصدقات', 'انفقوا', 'ينفقون'],
     ['Zakât', 'aumône', 'dépens', 'Sadaqa']),

    ('les-invocations', 'Les invocations',
     ['ربنا', 'رب اغفر', 'رب هب'],
     ['Seigneur']),
]

MINI_PALIER_1 = 100   # section 4.1 du cahier des charges


def squelette(s):
    s = DIACRITIQUES.sub('', s)
    return (s.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
             .replace('ى', 'ي').replace('ة', 'ه'))


def couper(texte):
    """Coupe une traduction en deux a un endroit naturel.

    On coupe sur une virgule ou un point-virgule au milieu du texte : couper
    au hasard produirait des moities qui ne veulent rien dire, et la question
    ne serait plus une question mais une devinette.
    """
    marques = [m.start() for m in re.finditer(r'[,;:]\s', texte)]
    if not marques:
        return None
    milieu = len(texte) / 2
    coupe = min(marques, key=lambda i: abs(i - milieu))
    debut, suite = texte[:coupe + 1].strip(), texte[coupe + 2:].strip()
    if len(debut) < 25 or len(suite) < 25:
        return None
    return debut, suite


def versets_du_theme(arabe, francais, ar_cles, fr_cles):
    """Les versets que l'arabe ET le francais designent."""
    out = []
    for (s, v) in sorted(arabe):
        if not any(squelette(c) in squelette(arabe[(s, v)]) for c in ar_cles):
            continue
        fr = francais.get((s, v), '')
        if not any(c in fr for c in fr_cles):
            continue
        out.append((s, v))
    return out


def main():
    rng = random.Random(20260821)
    arabe, francais = F.charger_coran()
    noms = F.noms_sourates()

    bilan = []
    for slug, titre, ar_cles, fr_cles in THEMES:
        versets = versets_du_theme(arabe, francais, ar_cles, fr_cles)
        if len(versets) < 20:
            print('  %-22s %3d versets : trop peu, section non ecrite.' % (slug, len(versets)))
            bilan.append((slug, 0, len(versets)))
            continue

        # Le vivier de leurres : les traductions des versets du MEME theme.
        # Un debutant hesite alors entre quatre phrases qui parlent toutes du
        # meme sujet — c'est la difficulte voulue, et rien n'est invente.
        vivier = [francais[(s, v)] for (s, v) in versets]
        # LE CORAN REPETE DES VERSETS. Deux versets au meme arabe parlent
        # forcement du meme sujet : ils tombent donc dans le MEME vivier, et
        # la traduction de l'un est une reponse JUSTE a la question posee sur
        # l'autre. Voir l'en-tete de `traductions_jumelles` dans fabrique.py.
        jumeaux = F.traductions_jumelles(arabe, francais)
        questions = []

        # ---- Forme A : la traduction du sens --------------------------
        for (s, v) in versets:
            fr = francais[(s, v)]
            if not (45 <= len(fr) <= 300):
                continue
            leurres = F.choisir_leurres(fr, vivier, 3, rng,
                                        exclure=jumeaux.get((s, v), ()))
            if not leurres:
                continue
            questions.append(F.question(
                qid=F.identifiant(slug, 'A-%d-%d' % (s, v)),
                section=slug,
                theme='Le sens des versets',
                surtitre='Sourate %s' % noms[s]['tr'],
                arabe=arabe[(s, v)],
                question_texte='Ce verset se traduit par :',
                bonne=fr,
                leurres=leurres,
                explication='C\'est le verset %d de la sourate %s. Les trois '
                            'autres propositions sont des traductions d\'autres '
                            'versets sur le même sujet.' % (v, noms[s]['tr']),
                source='Coran, sourate %d, verset %d. Traduction du sens : '
                       'Muhammad Hamidullah.' % (s, v),
                difficulte=2,
                rng=rng,
            ))

        # ---- Forme B : la suite du verset -----------------------------
        suites = []
        for (s, v) in versets:
            c = couper(francais[(s, v)])
            if c:
                suites.append((s, v, c[0], c[1]))
        vivier_suites = [x[3] for x in suites]
        for (s, v, debut, suite) in suites:
            # La MEME cause sur la forme B : la seconde moitie de la
            # traduction d'un verset jumeau continue aussi bien le
            # debut montre. Mesure du 7 novembre : une carte de
            # « la-priere » proposait la suite de 27:3 pour 31:4.
            jum_suites = []
            for tj in jumeaux.get((s, v), ()):
                cj = couper(tj)
                if cj:
                    jum_suites.append(cj[1])
            leurres = F.choisir_leurres(suite, vivier_suites, 3, rng,
                                        exclure=jum_suites)
            if not leurres:
                continue
            questions.append(F.question(
                qid=F.identifiant(slug, 'B-%d-%d' % (s, v)),
                section=slug,
                theme='Continuer un verset',
                surtitre='Sourate %s' % noms[s]['tr'],
                question_texte='« %s » — comment ce verset continue-t-il ?' % debut,
                bonne=suite,
                leurres=leurres,
                explication='Le verset entier : « %s »' % francais[(s, v)],
                source='Coran, sourate %d, verset %d. Traduction du sens : '
                       'Muhammad Hamidullah.' % (s, v),
                difficulte=3,
                rng=rng,
            ))

        if not questions:
            print('  %-22s aucune question retenue.' % slug)
            bilan.append((slug, 0, len(versets)))
            continue

        F.ecrire(slug, questions)
        bilan.append((slug, len(questions), len(versets)))
        print('  %-22s %3d versets  ->  %3d questions' % (slug, len(versets), len(questions)))

    # Le palier 1 demande cent questions par section avant toute mise en
    # ligne. On DIT lesquelles n'y sont pas, on ne les comble pas.
    print()
    manque = [(s, n) for (s, n, _) in bilan if n < MINI_PALIER_1]
    if manque:
        print('  Sous le palier 1 (%d questions) :' % MINI_PALIER_1)
        for s, n in manque:
            print('    %-22s %3d' % (s, n))
    else:
        print('  Toutes les sections ecrites atteignent le palier 1.')


if __name__ == '__main__':
    main()
