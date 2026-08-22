#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajoute un mot appris a l'explication des questions sur un verset.

CE QU'ON REPARE
---------------
744 questions sur 1 388 posaient « Ce verset se traduit par : », et leur
explication disait :

    C'est le verset 8 de la sourate An-Naba (n° 78). Les trois autres
    propositions sont des traductions d'autres versets.

C'est vrai, et ca n'apprend rien. On sort de la question exactement comme on
y est entre. Une explication doit laisser quelque chose qui SERVE AILLEURS.

CE QU'ON AJOUTE
---------------
Un mot du verset, avec son sens, pris dans le lexique atteste que fabrique
outils/faire-11-vocabulaire.py — jamais invente, toujours mesure sur la
traduction de Hamidullah lui-meme :

    C'est le verset 8 de la sourate An-Naba (n° 78). Dans ce verset,
    أَزْوَاجًا vient d'un mot qui revient 22 fois dans le Coran : Hamidullah
    le rend par « couples ».

On choisit le mot le PLUS FREQUENT du verset qui figure au lexique : c'est
celui qui resservira le plus souvent.

CE QU'ON NE FAIT PAS
--------------------
On ne touche pas aux questions dont l'explication porte deja un enseignement
— celles du vocabulaire, de l'alphabet, des prophetes. Et on n'ajoute rien
quand le verset ne contient aucun mot du lexique : mieux vaut une explication
courte qu'une phrase creuse.

Cet outil se relance sans risque : il reconnait sa propre phrase et la
remplace au lieu de l'empiler.
"""

import collections
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran'
DONNEES = RACINE / 'data' / 'questions'

SOURCE_CORAN = re.compile(r'Coran, sourate (\d+), verset (\d+)')
MARQUE = ' Dans ce verset, '   # sert a reconnaitre ce qu'on a deja ajoute

# Une phrase qui ne dit rien qu'on ne sache deja. Elle occupait la moitie de
# l'explication de 744 questions, et c'est exactement ce qui donnait
# l'impression que la correction n'apprenait rien : elle n'apprenait rien.
CREUX = re.compile(r'\s*Les trois autres propositions sont des traductions '
                   r'd\'autres versets\.')


def charger():
    lex = RACINE / 'data' / 'lexique.json'
    morpho = CORAN / 'morphologie.txt'
    if not lex.exists():
        sys.exit('ARRET : data/lexique.json manquant. Lancer d\'abord '
                 'faire-11-vocabulaire.py — c\'est lui qui atteste les sens.')
    if not morpho.exists():
        sys.exit('ARRET : le corpus morphologique manque.')

    mots = {x['lemme']: x for x in json.loads(lex.read_text(encoding='utf-8'))}

    # Pour chaque verset : les mots du lexique qu'il contient, avec la forme
    # exacte sous laquelle ils y apparaissent.
    parVerset = collections.defaultdict(dict)
    formes = collections.defaultdict(lambda: collections.defaultdict(str))
    lemmeDuMot = {}
    for ligne in morpho.read_text(encoding='utf-8').splitlines():
        if not ligne.strip():
            continue
        ref, forme, pos, tags = ligne.split('\t')
        s, v, m, _ = (int(x) for x in ref.split(':'))
        formes[(s, v)][m] += forme
        for t in tags.split('|'):
            if t.startswith('LEM:') and t[4:] in mots:
                lemmeDuMot[(s, v, m)] = t[4:]
    for (s, v, m), lem in lemmeDuMot.items():
        parVerset[(s, v)][lem] = formes[(s, v)][m]
    return mots, parVerset


def main():
    mots, parVerset = charger()
    fichiers = sorted(DONNEES.glob('*.json'))
    ajoutes = remplaces = sansMot = ignores = 0

    for f in fichiers:
        qs = json.loads(f.read_text(encoding='utf-8'))
        change = False
        for q in qs:
            # Les questions qui apprennent deja quelque chose ne sont pas
            # touchees : le vocabulaire, l'alphabet.
            if q.get('type') in ('vocabulaire', 'calligraphie'):
                ignores += 1
                continue
            expl = q.get('explication') or ''
            base = CREUX.sub('', expl.split(MARQUE)[0]).rstrip()
            m = SOURCE_CORAN.search(q.get('source') or '')
            if not m:
                ignores += 1
                continue
            s, v = int(m.group(1)), int(m.group(2))
            dispo = parVerset.get((s, v), {})
            if not dispo:
                sansMot += 1
                if expl != base:
                    q['explication'] = base; change = True
                continue

            # Le mot le plus frequent du verset : c'est celui qui resservira
            # le plus souvent ailleurs.
            lem = max(dispo, key=lambda l: mots[l]['occurrences'])
            x = mots[lem]
            phrase = ('%s%s vient d\'un mot qui revient %d fois dans le Coran : '
                      'Hamidullah le rend par « %s ».'
                      % (MARQUE, dispo[lem], x['occurrences'], x['sens']))
            neuf = base + phrase
            if neuf != expl:
                if MARQUE in expl:
                    remplaces += 1
                else:
                    ajoutes += 1
                q['explication'] = neuf
                change = True
        if change:
            f.write_text(json.dumps(qs, ensure_ascii=False, indent=1), encoding='utf-8')

    print('  %d explications enrichies, %d mises a jour.' % (ajoutes, remplaces))
    print('  %d versets sans mot du lexique : explication laissee courte.' % sansMot)
    print('  %d questions non concernees (vocabulaire, alphabet, sans verset).' % ignores)


if __name__ == '__main__':
    main()
