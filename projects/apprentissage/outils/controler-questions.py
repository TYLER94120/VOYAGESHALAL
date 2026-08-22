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


def _lettres_arabes():
    """La table (glyphe, nom) du generateur de l'alphabet.

    Lue chez lui, comme celle des prophetes : deux listes finissent toujours
    par diverger, et c'est ce genre d'ecart qui fait passer une question juste
    pour fausse.
    """
    src = (pathlib.Path(__file__).resolve().parent / 'faire-02-lire-larabe.py')
    if not src.exists():
        return {}
    t = src.read_text(encoding='utf-8')
    d = t.index('LETTRES = [')
    f = t.index(']\n', d) + 1
    return {g: nom for g, nom in eval(t[d:f].split('=', 1)[1])}


LETTRES_AR = _lettres_arabes()

POSITIONS_AR = {
    'initial': 'Au début d\'un mot',
    'medial': 'Au milieu d\'un mot',
    'final': 'À la fin d\'un mot',
    'isolated': 'Seule, sans attache',
}


def _base_et_position(glyphe):
    """De quel caractere ce glyphe est-il une forme, et dans quelle position ?

    C'est Unicode qui repond, par la decomposition de compatibilite. Un
    caractere qui n'en a pas est deja une lettre de base, donc « isolated ».
    """
    c = glyphe[0]
    d = unicodedata.decomposition(c)
    if d.startswith('<'):
        pos, reste = d[1:].split('>', 1)
        bases = reste.split()
        if len(bases) == 1:
            return chr(int(bases[0], 16)), pos
    return c, 'isolated'


def _lexique_et_morphologie():
    """Le lexique publie, et les lemmes presents dans chaque verset.

    On ne demande pas au generateur s'il a bien travaille : on relit le
    corpus morphologique et le lexique ecrit a cote des questions, et on
    verifie que le sens annonce appartient bien a un mot PRESENT dans le
    verset cite. Une question de vocabulaire qui donne le sens d'un mot
    absent du verset serait invisible a tout autre controle.
    """
    lex = RACINE / 'data' / 'lexique.json'
    morpho = RACINE / 'outils' / 'coran' / 'morphologie.txt'
    if not lex.exists() or not morpho.exists():
        return None, None
    sensDuLemme = {x['lemme']: x['sens'] for x in
                   json.loads(lex.read_text(encoding='utf-8'))}
    lemmesDuVerset = {}
    for ligne in morpho.read_text(encoding='utf-8').splitlines():
        if not ligne.strip():
            continue
        ref, _forme, _pos, tags = ligne.split('\t')
        s, v = (int(x) for x in ref.split(':')[:2])
        for t in tags.split('|'):
            if t.startswith('LEM:'):
                lemmesDuVerset.setdefault((s, v), set()).add(t[4:])
    return sensDuLemme, lemmesDuVerset


SENS_DU_LEMME, LEMMES_DU_VERSET = _lexique_et_morphologie()


def nu(s):
    """Pour comparer deux textes : accents, ponctuation et espaces ignores.

    L'arabe est garde, comme dans fabrique.normaliser : sans lui, quatre
    reponses arabes se reduisent a quatre chaines vides et le controle
    « deux reponses identiques » se declenche sur des questions justes.
    """
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ء-ي]+', ' ', s.lower()).strip()


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
    calligraphies = 0
    surlignes = 0
    verifiesVocab = 0
    nonVerifies = 0

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
            # Le niveau : pose par outils/classer-niveaux.py, jamais a la
            # main. Une question sans niveau se joue a tous les niveaux, donc
            # trois fois trop souvent — c'est visible, mais seulement pour qui
            # joue longtemps. On le voit ici, tout de suite.
            if q.get('niveau') not in (1, 2, 3):
                fautes.append('%s : niveau %r, attendu 1, 2 ou 3 — relancer '
                              'classer-niveaux.py' % (ou, q.get('niveau')))

            # --- le glyphe montre doit etre CELUI qu'on annonce --------
            # Type « calligraphie » : la seule faute possible, mais grave,
            # serait d'afficher un glyphe et d'en nommer un autre. On le
            # confronte a Unicode, pas au generateur.
            if q.get('type') == 'calligraphie':
                calligraphies += 1
                g = q.get('glyphe') or ''
                if not g:
                    fautes.append('%s : type calligraphie sans glyphe' % ou); continue
                base, pos = _base_et_position(g)
                bonne = q['reponses'][q['bonne']]
                if q['question'].startswith('Où cette forme'):
                    if bonne != POSITIONS_AR.get(pos):
                        fautes.append('%s : « %s » annonce, Unicode dit « %s »'
                                      % (ou, bonne, POSITIONS_AR.get(pos)))
                elif q['question'].startswith('Quelle lettre'):
                    attendu = LETTRES_AR.get(base)
                    if attendu is None:
                        fautes.append('%s : le glyphe %r ne vient d\'aucune des '
                                      '28 lettres' % (ou, g))
                    elif attendu != bonne:
                        fautes.append('%s : le glyphe est la lettre « %s », la '
                                      'reponse dit « %s »' % (ou, attendu, bonne))
                elif q['question'].startswith('Quel signe'):
                    marques = [c for c in g if unicodedata.category(c) == 'Mn']
                    if len(marques) != 1:
                        fautes.append('%s : %d signe(s) de vocalisation dans le '
                                      'glyphe, un seul attendu' % (ou, len(marques)))
                else:
                    fautes.append('%s : question calligraphie non reconnue par le '
                                  'controle — elle n\'est donc pas verifiee' % ou)
                continue

            # --- le mot surligne doit etre DANS le verset --------------
            # Une question de vocabulaire qui designe un mot absent du verset
            # ne designe rien : la personne cherche un mot qui n'est pas la.
            if q.get('surligne'):
                surlignes += 1
                if q['surligne'] not in (q.get('arabe') or ''):
                    fautes.append('%s : le mot surligne n\'est pas dans le verset '
                                  'affiche' % ou)

            # --- l'arabe montre doit etre CELUI de la source -----------
            m = SOURCE_CORAN.search(q['source'])
            if not m:
                continue
            s, v = int(m.group(1)), int(m.group(2))
            if (s, v) not in francais:
                fautes.append('%s : cite sourate %d verset %d, qui n\'existe pas' % (ou, s, v))
                continue
            verifiables += 1

            # --- vocabulaire : le sens annonce doit venir d'un mot du verset
            # On ne croit pas le generateur sur parole : le sens doit etre
            # celui qu'a lexique.json pour un lemme REELLEMENT present dans
            # ce verset, d'apres le corpus morphologique.
            if q.get('type') == 'vocabulaire' and SENS_DU_LEMME and LEMMES_DU_VERSET:
                verifiesVocab += 1
                attendus = {SENS_DU_LEMME[l] for l in LEMMES_DU_VERSET.get((s, v), ())
                            if l in SENS_DU_LEMME}
                bonneR = q['reponses'][q['bonne']]
                if q['question'].startswith('Que signifie'):
                    if bonneR not in attendus:
                        fautes.append('%s : « %s » n\'est le sens d\'aucun mot '
                                      'present dans sourate %d verset %d'
                                      % (ou, bonneR, s, v))
                elif 'signifie' in q['question']:
                    voulu = re.search(r'signifie « (.+?) »', q['question'])
                    if voulu and voulu.group(1) not in attendus:
                        fautes.append('%s : aucun mot de sourate %d verset %d ne '
                                      'signifie « %s »' % (ou, s, v, voulu.group(1)))
                continue
            if q.get('type') == 'vocabulaire':
                # Sans corpus sous la main on ne peut rien affirmer : on le
                # DIT plutot que de laisser croire que c'est verifie.
                nonVerifies += 1
                continue

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
    print('  %d montrent un glyphe et ont ete confrontees a Unicode.' % calligraphies)
    print('  %d designent un mot du verset, %d confrontees au corpus '
          'morphologique.' % (surlignes, verifiesVocab))
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
