#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SECTION 1 — LE SENS DES SOURATES. Cible : 400 questions.

CE QUE CETTE SECTION APPREND
----------------------------
A comprendre ce qu'on recite. Quelqu'un qui prie recite Al-Fatiha dix-sept fois
par jour ; savoir ce que veulent dire les mots change ce moment.

TROIS FORMES DE QUESTION
------------------------
  A. On montre un verset en arabe : quelle est la traduction de son sens ?
  B. On montre un verset en arabe : de quelle sourate vient-il ?
  C. Combien de versets compte telle sourate ?

D'OU VIENNENT LES MAUVAISES REPONSES
------------------------------------
Du Coran lui-meme. Pour la forme A, ce sont d'AUTRES traductions de Hamidullah,
de longueur comparable. Le debutant qui hesite hesite donc entre quatre phrases
qui sonnent toutes juste — c'est exactement le niveau de difficulte voulu, et
aucune n'est une invention.

UNE PRECAUTION QUI N'EST PAS UN DETAIL
--------------------------------------
Le mot « traduction » est employe partout, jamais « le Coran dit » (section
10.3). Ce qu'on lit en francais est une traduction du sens, pas le Coran.

LA BASMALA
----------
Dans ce jeu de donnees, le premier verset de 112 sourates sur 114 commence par
la basmala collee au texte. On la retire — sinon on publierait un faux verset 1
sur 112 pages, defaut deja rencontre et corrige une fois sur ce site.
"""

import random
import sys

import fabrique as F

BASMALA = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
SECTION = 'sens-des-sourates'

# Les sourates du dernier trentieme, celles qu'on apprend en premier et qu'on
# recite le plus. On y puise en priorite.
COURTES = list(range(78, 115)) + [1]


def nettoyer_arabe(num, verset, texte):
    """Retire la basmala collee au premier verset. Al-Fatiha (1) et
    At-Tawba (9) sont les deux exceptions : la basmala y est un vrai verset 1
    pour la premiere, et absente pour la seconde."""
    if verset != 1 or num == 1:
        return texte
    t = texte
    if t.startswith(BASMALA):
        t = t[len(BASMALA):].strip()
    return t


def main():
    rng = random.Random(20260821)   # graine fixe : deux passages donnent le meme lot
    arabe, francais = F.charger_coran()
    noms = F.noms_sourates()

    # Combien de versets par sourate, compte dans le texte.
    compte = {}
    for (s, v) in arabe:
        compte[s] = max(compte.get(s, 0), v)

    # Controle de securite : le total doit tomber sur 6236, et Al-Fatiha sur 7.
    if sum(compte.values()) != 6236 or compte.get(1) != 7:
        sys.exit('ARRET : le jeu de donnees ne se recoupe pas (total %d, Al-Fatiha %s).'
                 % (sum(compte.values()), compte.get(1)))

    # Le vivier de leurres : toutes les traductions du dernier trentieme, la
    # ou le registre de langue est homogene.
    vivier = [francais[(s, v)] for s in COURTES for v in range(1, compte[s] + 1)
              if (s, v) in francais]

    questions = []

    # ---- Forme A : la traduction du sens -------------------------------
    for s in COURTES:
        nom = noms[s]['tr']
        for v in range(1, compte[s] + 1):
            fr = francais.get((s, v))
            ar = nettoyer_arabe(s, v, arabe.get((s, v), ''))
            if not fr or not ar or len(fr) < 25:
                continue        # un verset tres court ne se distingue pas assez
            leurres = F.choisir_leurres(fr, vivier, 3, rng)
            if not leurres:
                continue
            questions.append(F.question(
                qid=F.identifiant('sourates', 'A-%d-%d' % (s, v)),
                section=SECTION,
                theme='Sourate %s' % nom,
                surtitre='Sourate %s' % nom,
                arabe=ar,
                question_texte='Ce verset se traduit par :',
                bonne=fr,
                leurres=leurres,
                explication='C\'est le verset %d de la sourate %s (n° %d). '
                            'Les trois autres propositions sont des traductions '
                            'd\'autres versets.' % (v, nom, s),
                source='Coran, sourate %d, verset %d. Traduction du sens : '
                       'Muhammad Hamidullah.' % (s, v),
                difficulte=2 if s >= 100 else 3,
                rng=rng,
            ))

    # ---- Forme B : de quelle sourate ? ---------------------------------
    tous_noms = [noms[s]['tr'] for s in range(1, 115)]
    for s in COURTES:
        nom = noms[s]['tr']
        # Un verset au hasard dans la sourate, mais jamais le premier : il
        # commence souvent pareil d'une sourate a l'autre.
        choix = [v for v in range(2, compte[s] + 1) if (s, v) in arabe]
        if not choix:
            continue
        for v in rng.sample(choix, min(2, len(choix))):
            ar = nettoyer_arabe(s, v, arabe[(s, v)])
            fr = francais.get((s, v), '')
            if len(ar) < 30:
                continue
            leurres = F.choisir_leurres(nom, [n for n in tous_noms if n != nom], 3, rng)
            if not leurres:
                continue
            questions.append(F.question(
                qid=F.identifiant('sourates', 'B-%d-%d' % (s, v)),
                section=SECTION,
                theme='Reconnaitre une sourate',
                arabe=ar,
                question_texte='De quelle sourate vient ce verset ?',
                bonne=nom,
                leurres=leurres,
                explication='C\'est le verset %d de la sourate %s. Sa traduction : '
                            '« %s »' % (v, nom, fr),
                source='Coran, sourate %d, verset %d.' % (s, v),
                difficulte=3,
                rng=rng,
            ))

    # ---- Forme C : combien de versets ? --------------------------------
    for s in COURTES:
        nom = noms[s]['tr']
        n = compte[s]
        # Les leurres sont de VRAIS nombres de versets d'autres sourates
        # proches : un debutant hesite alors vraiment.
        proches = sorted({compte[x] for x in range(1, 115) if compte[x] != n
                          and abs(compte[x] - n) <= max(4, n // 3)})
        if len(proches) < 3:
            continue
        leurres = ['%d versets' % x for x in rng.sample(proches, 3)]
        questions.append(F.question(
            qid=F.identifiant('sourates', 'C-%d' % s),
            section=SECTION,
            theme='Reperes',
            question_texte='Combien de versets compte la sourate %s ?' % nom,
            bonne='%d versets' % n,
            leurres=leurres,
            explication='La sourate %s porte le numero %d dans l\'ordre du Coran.'
                        % (nom, s),
            source='Coran, sourate %s (%d).' % (nom, s),
            difficulte=1,
            rng=rng,
        ))

    f = F.ecrire(SECTION, questions)
    formes = {}
    for q in questions:
        formes[q['theme'].split(' ')[0]] = formes.get(q['theme'].split(' ')[0], 0) + 1
    print('  %d questions ecrites dans %s' % (len(questions), f.name))
    for k in sorted(formes):
        print('     %-24s %3d' % (k, formes[k]))


if __name__ == '__main__':
    main()
