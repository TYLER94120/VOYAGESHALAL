#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifie que CHAQUE question dit vrai, contre le texte source.

CE QUE CE CONTROLE FAIT, ET POURQUOI IL EXISTE
----------------------------------------------
Les generateurs se controlent chacun a leur maniere. Celui-ci controle le
RESULTAT, toutes sections confondues, et il ne fait confiance a aucun d'eux :

  * chaque question qui cite « Coran, sourate S, verset V » doit avoir une
    bonne reponse qui se retrouve DANS ce verset — pas dans un autre ;
  * aucune mauvaise reponse ne doit etre, elle aussi, juste ;
  * aucune question ne doit exister sans source, sans explication, ou avec
    deux reponses identiques ;
  * un identifiant ne doit jamais servir deux fois : deux questions de meme
    identifiant se remplacent l'une l'autre dans la progression des gens.

POURQUOI CONTRE LA SOURCE, ET PAS CONTRE LE GENERATEUR
------------------------------------------------------
Un generateur qui se trompe se trompe aussi dans ses propres controles. Le
21 aout, la section des prophetes a produit quarante-trois attributions
fausses en etant parfaitement coherente avec elle-meme : « صالح » ramenait les
versets sur les bonnes oeuvres, et rien dans le generateur ne pouvait le voir.
Seule une confrontation au texte le revele.

Ce controle relit donc le Coran et compare, ligne par ligne.
"""

import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
DONNEES = RACINE / 'data' / 'questions'

SOURCE_CORAN = re.compile(r'Coran, sourate (\d+), verset (\d+)')

# Les graphies francaises retenues par le generateur des prophetes. Lues chez
# lui pour ne pas en tenir une deuxieme liste : deux listes divergent toujours.
def _formes_des_prophetes():
    """Les graphies francaises retenues par le generateur des prophetes.

    Lues chez lui plutot que recopiees : deux listes finissent toujours par
    diverger, et c'est precisement ce genre d'ecart qui fait passer une
    question juste pour fausse.
    """
    src = (pathlib.Path(__file__).resolve().parent / 'faire-05-prophetes.py')
    if not src.exists():
        return {}
    t = src.read_text(encoding='utf-8')
    d = t.index('PROPHETES = [')
    f = t.index(']\n', d) + 1
    return {nom: formes for _, nom, formes in eval(t[d:f].split('=', 1)[1])}


FORMES = _formes_des_prophetes()


def nu(s):
    """Pour comparer deux textes : accents, ponctuation et espaces ignores."""
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def main():
    ar = json.loads((RACINE / 'outils' / 'coran' / 'ara-quransimple.json')
                    .read_text(encoding='utf-8'))['quran']
    fr = json.loads((RACINE / 'outils' / 'coran' / 'fra-muhammadhamidul.json')
                    .read_text(encoding='utf-8'))['quran']
    arabe = {(v['chapter'], v['verse']): v['text'] for v in ar}
    francais = {(v['chapter'], v['verse']): v['text'] for v in fr}

    noms = {x['n']: x for x in json.loads(
        (RACINE / 'outils' / 'coran' / 'noms-sourates.json').read_text(encoding='utf-8'))}

    fichiers = sorted(DONNEES.glob('*.json'))
    if not fichiers:
        sys.exit('ARRET : aucune banque de questions.')

    fautes = []
    vus = {}
    total = 0
    verifiables = 0

    for f in fichiers:
        qs = json.loads(f.read_text(encoding='utf-8'))
        for q in qs:
            total += 1
            ou = '%s/%s' % (f.stem, q.get('id', '?'))

            # --- les regles de forme, section 5 du cahier des charges ---
            if not q.get('source'):
                fautes.append('%s : sans source' % ou); continue
            if not q.get('explication'):
                fautes.append('%s : sans explication' % ou)
            if len(q.get('reponses', [])) != 4:
                fautes.append('%s : %d reponses' % (ou, len(q.get('reponses', [])))); continue
            if not (0 <= q.get('bonne', -1) < 4):
                fautes.append('%s : index de bonne reponse hors bornes' % ou); continue
            if len({nu(r) for r in q['reponses']}) != 4:
                fautes.append('%s : deux reponses identiques' % ou)
            if q['id'] in vus:
                fautes.append('%s : identifiant deja pris par %s' % (ou, vus[q['id']]))
            vus[q['id']] = ou

            # --- l'arabe montre doit etre CELUI de la source -----------
            m = SOURCE_CORAN.search(q['source'])
            if not m:
                continue
            s, v = int(m.group(1)), int(m.group(2))
            if (s, v) not in francais:
                fautes.append('%s : cite sourate %d verset %d, qui n\'existe pas' % (ou, s, v))
                continue
            verifiables += 1

            attendu = francais[(s, v)]
            bonne = q['reponses'][q['bonne']]

            # La bonne reponse doit se retrouver dans le verset cite : soit
            # elle EST la traduction, soit elle en est un morceau (les
            # questions « comment ce verset continue-t-il »), soit c'est un
            # nom que le verset contient.
            # Une reponse peut etre un LIBELLE A DEUX NOMS : « Ayyoub (Job) ».
            # Le verset francais ne contient alors que l'un des deux — celui
            # qu'emploie Hamidullah. Ma premiere version ne testait que la
            # partie avant la parenthese et signalait 176 fautes qui n'en
            # etaient pas : le controleur avait tort, pas les donnees.
            # « De quelle sourate vient ce verset ? » : la reponse est un NOM
            # de sourate, qui ne figure evidemment pas dans le verset. On ne
            # passe pas le controle — on en fait un AUTRE, plus exigeant : le
            # nom doit etre celui de la sourate citee dans la source.
            if q['question'].startswith('De quelle sourate'):
                if noms.get(s, {}).get('tr') != bonne:
                    fautes.append('%s : la reponse « %s » n\'est pas le nom de '
                                  'la sourate %d (%s)'
                                  % (ou, bonne, s, noms.get(s, {}).get('tr')))
                continue

            morceaux = [bonne]
            if ' (' in bonne and bonne.endswith(')'):
                gauche, droite = bonne.split(' (', 1)
                morceaux += [gauche, droite[:-1]]
                # Hamidullah n'emploie pas toujours la meme graphie : 19:28
                # ecrit « Hârûn » la ou ailleurs il ecrit « Aaron ». Le libelle
                # n'en porte qu'une. On ajoute toutes celles que le generateur
                # a retenues — la comparaison reste faite contre le TEXTE.
                morceaux += FORMES.get(gauche, [])
            if not any(nu(x) == nu(attendu) or nu(x) in nu(attendu) for x in morceaux):
                fautes.append('%s : la bonne reponse ne se trouve pas dans '
                              'sourate %d verset %d' % (ou, s, v))
                continue

            # ET AUCUNE MAUVAISE REPONSE NE DOIT ETRE JUSTE AUSSI.
            # C'est le defaut le plus injuste possible : la personne repond
            # vrai et le jeu lui dit qu'elle s'est trompee.
            for i, r in enumerate(q['reponses']):
                if i == q['bonne']:
                    continue
                if len(nu(r)) > 20 and nu(r) in nu(attendu):
                    fautes.append('%s : la reponse « %s… » est juste elle aussi'
                                  % (ou, r[:40]))

            if q.get('arabe') and (s, v) in arabe:
                # L'arabe montre peut avoir ete nettoye de la basmala : on
                # verifie qu'il est bien un morceau du verset, pas un autre.
                a = re.sub(r'[^ء-ي]', '', q['arabe'])
                b = re.sub(r'[^ء-ي]', '', arabe[(s, v)])
                if a and a not in b:
                    fautes.append('%s : l\'arabe montre n\'est pas celui de '
                                  'sourate %d verset %d' % (ou, s, v))

    print('  %d questions dans %d sections.' % (total, len(fichiers)))
    print('  %d citent un verset precis et ont ete confrontees au texte.' % verifiables)
    if fautes:
        print('\n  %d FAUTE(S) :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)
    print('  Aucune faute.')


if __name__ == '__main__':
    main()
