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
        questions = []

        # ---- Forme A : la traduction du sens --------------------------
        for (s, v) in versets:
            fr = francais[(s, v)]
            if not (45 <= len(fr) <= 300):
                continue
            leurres = F.choisir_leurres(fr, vivier, 3, rng)
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
            leurres = F.choisir_leurres(suite, vivier_suites, 3, rng)
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
