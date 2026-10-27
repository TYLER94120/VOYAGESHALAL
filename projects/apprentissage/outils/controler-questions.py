#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verifie que CHAQUE question dit vrai, contre le texte source.

CE QUE CE CONTROLE FAIT, ET POURQUOI IL EXISTE
----------------------------------------------
Les generateurs se controlent chacun a leur maniere. Celui-ci controle le
RESULTAT, toutes sections confondues, et il ne fait confiance a aucun d'eux :

  * chaque question qui cite « Coran, sourate S, verset V » doit avoir une
    bonne reponse qui se retrouve DANS ce verset — pas dans un autre ;
  * chaque question qui affirme un COMPTE sur le Coran entier est recomptee
    dans le texte ;
  * aucune mauvaise reponse ne doit etre, elle aussi, juste ;
  * aucune question ne doit exister sans source, sans explication, ou avec
    deux reponses identiques ;
  * un identifiant ne doit jamais servir deux fois : deux questions de meme
    identifiant se remplacent l'une l'autre dans la progression des gens ;
  * et une question que rien ici ne sait confronter est une FAUTE.

AJOUTE LE 12 OCTOBRE — deux choses qu'il ne regardait pas

  * un meme verset pose dans PLUSIEURS sections. 65 aujourd'hui, 138 cartes,
    5,1 % du paquet : des versets qui parlent de la priere et de l'aumone a
    la fois. Ce n'est pas une faute — un verset a deux sujets appartient aux
    deux sections — mais le nombre est plafonne, pour qu'un generateur qui se
    met a recopier une section dans une autre se voie avant la publication.
    A savoir : « 2 701 questions », le nombre que l'accueil annonce, compte
    ces versets deux ou trois fois. En les comptant une fois, 2 628.

  * la LONGUEUR de la bonne reponse. Un QCM dont la bonne reponse est
    toujours la plus longue se joue a l'oeil et n'apprend rien. Le controle
    pose une fourchette de 12 a 40 % par section, pas le chiffre du jour :
    un chiffre exact echouerait a chaque regeneration pour du bruit.

LE TROU QU'IL AVAIT, ET QUE LA MESURE DU 22 SEPTEMBRE A MONTRE
--------------------------------------------------------------
Cet en-tete promettait « CHAQUE question » depuis le premier jour. C'etait
faux pour 69 d'entre elles sur 2 701.

Elles ne citent aucun verset — elles affirment un compte sur le Coran
entier : « Combien de versets compte la sourate Al-Fajr ? », « Dans combien
de versets le nom de Moussa apparait-il ? », « Dans quelle sourate le nom de
Adam revient-il le plus souvent ? ». Elles arrivaient au test « la source
cite-t-elle sourate S verset V ? », ne le passaient pas, et un `continue` nu
les laissait sortir sans qu'aucun controle ne les ait regardees.

Ce sont pourtant les plus exposees du site. Un chiffre faux la-dedans se
publie au nom de Mohamed et ne se voit nulle part : il n'y a pas de verset a
cote pour le dementir, et personne ne compte les versets d'une sourate pour
verifier. Recomptees depuis le texte le 22 septembre, les 69 disent vrai —
mais elles le disaient sans que rien ne l'ait etabli, et c'est cela qui
n'allait pas.

Le `continue` silencieux est donc devenu une faute. Une question qu'aucun
controle ne sait confronter n'est pas une question verifiee : c'est une
question dont personne ne repond.

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

# « de » devant une voyelle : il faut elider. On ne retient que A, E, I, O,
# U et leurs accentuees — ni le Y, qui sonne consonne, ni le H, que l'usage
# garde plein dans « de Haroun ».
ELISION = re.compile(r'\bde ([AEIOU\u00c0\u00c2\u00c9\u00c8\u00ca\u00ce\u00d4\u00db][^\s,.;:!?)]*)')

# Les graphies francaises retenues par le generateur des prophetes. Lues chez
# lui pour ne pas en tenir une deuxieme liste : deux listes divergent toujours.
def _prophetes():
    """La liste (arabe, nom francais, graphies) du generateur des prophetes.

    Lue chez lui plutot que recopiee : deux listes finissent toujours par
    diverger, et c'est precisement ce genre d'ecart qui fait passer une
    question juste pour fausse.

    On lui prend ses DECLARATIONS — quel nom arabe, quelles graphies chez
    Hamidullah — et rien d'autre. Le comptage, lui, est refait ici (voir
    `squelette` plus bas) : s'il etait emprunte au generateur, une erreur
    dans sa regle passerait ce controle sans broncher.
    """
    src = (pathlib.Path(__file__).resolve().parent / 'faire-05-prophetes.py')
    if not src.exists():
        return []
    t = src.read_text(encoding='utf-8')
    d = t.index('PROPHETES = [')
    f = t.index(']\n', d) + 1
    return list(eval(t[d:f].split('=', 1)[1]))


PROPHETES = _prophetes()
FORMES = {nom: formes for _, nom, formes in PROPHETES}

# Les signes de vocalisation varient d'une graphie a l'autre : on cherche sur
# les consonnes seules, sinon un nom present passe pour absent. Ecrit ici
# d'apres la regle ENONCEE par le generateur, pas importe de lui.
_DIACRITIQUES = re.compile(r'[ً-ِّ-ْٓ-ٰٕ'
                           r'ۖ-ۭـ]')


def squelette(s):
    """Le mot sans ses voyelles ni ses signes, alifs et ya unifies."""
    s = _DIACRITIQUES.sub('', s)
    return (s.replace('أ', 'ا').replace('إ', 'ا')
             .replace('آ', 'ا')
             .replace('ى', 'ي').replace('ة', 'ه'))


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


def _table_pratique():
    """La table des questions de pratique, lue chez son generateur.

    Comme pour les prophetes et l'alphabet : on relit la table a la source
    plutot que d'en tenir une copie. Ce qu'on verifie ici, c'est que les
    MOTS-CLES annonces se lisent vraiment dans le verset cite — autrement
    dit, que je n'ai pas attribue au Coran une chose qu'il ne dit pas.
    """
    src = (pathlib.Path(__file__).resolve().parent / 'faire-pratique.py')
    if not src.exists():
        return {}
    t = src.read_text(encoding='utf-8')
    d = t.index('\nQ = [')
    f = t.index('\n]\n', d) + 3
    table = {}
    for sec, theme, texte, bonne, leurres, (s, v), cles in eval(t[d:f].split('=', 1)[1]):
        table[(texte, s, v)] = (bonne, list(leurres), list(cles))
    return table


PRATIQUE = _table_pratique()


def _lexique_et_morphologie():
    """Le lexique publie, et les lemmes presents dans chaque verset.

    On ne demande pas au generateur s'il a bien travaille : on relit le
    corpus morphologique et le lexique ecrit a cote des questions, et on
    verifie que le sens annonce appartient bien a un mot PRESENT dans le
    verset cite. Une question de vocabulaire qui donne le sens d'un mot
    absent du verset serait invisible a tout autre controle.
    """
    # LE 19 OCTOBRE, CE CHEMIN EST DEVENU FAUX, ET CE CONTROLE S'EST TU.
    #
    # Le lexique etait dans `data/`. Il n'y avait aucune raison : aucune page
    # ne le telecharge, il est lu par les generateurs. Il est donc passe dans
    # `outils/`, que publier.py n'emporte pas — 19 Ko de moins en production.
    #
    # Ce chemin-ci n'a pas suivi. `lex.exists()` est devenu faux, la fonction
    # a renvoye (None, None), et la verification du vocabulaire s'est
    # DESACTIVEE D'ELLE-MEME pendant cinq nuits : 1 246 cartes de vocabulaire
    # ont cesse d'etre confrontees au corpus morphologique.
    #
    # Le controle ne mentait pas pour autant — il comptait ces cartes comme
    # NON VERIFIEES et l'imprimait chaque soir : « 687 designent un mot du
    # verset, 0 confrontees au corpus morphologique ». La ligne etait juste.
    # Personne ne l'a lue. C'est l'argument meme pour lequel ces lignes de
    # bilan impriment un CHIFFRE et pas un verdict — a condition de le lire.
    #
    # D'OU LE CONTROLE AJOUTE PLUS BAS : un zero a cet endroit est desormais
    # une FAUTE, pas une information. Un corpus introuvable arrete le lot.
    lex = RACINE / 'outils' / 'lexique.json'
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


# On reutilise le generateur plutot que de recopier sa logique : deux copies
# d'une meme regle divergent, et c'est alors le controle qui a tort sans
# qu'on s'en apercoive.
import importlib.util as _iu
_spec = _iu.spec_from_file_location(
    'claude_q', pathlib.Path(__file__).resolve().parent / 'faire-questions-claude.py')
CLAUDE = _iu.module_from_spec(_spec)
_spec.loader.exec_module(CLAUDE)
FICHE = CLAUDE.fiche()


def _nombre(x):
    m = re.search(r'\d+', str(x))
    return int(m.group()) if m else None


# Les trois formes de question qui affirment un compte sur le Coran entier.
VERSETS_DE = re.compile(r'Combien de versets compte la sourate ([^?]+)\?')
# « le nom de Moussa » ou « le nom d'Adam » : depuis le 3 octobre les enonces
# elident devant une voyelle, comme le francais l'exige. Le controle doit lire
# les deux formes — sinon il ne reconnaitrait plus douze questions et les
# refuserait comme « inclassables », ce qui serait sa facon a lui de ne pas
# suivre une correction de langue.
VERSETS_DU_NOM = re.compile(r"Dans combien de versets le nom (?:d'|de )([^\s?]+)")
SOURATE_DU_NOM = re.compile(r"Dans quelle sourate le nom (?:d'|de )([^\s?]+)")


def _famille_de_compte(question):
    if VERSETS_DE.search(question):
        return 'versets d\'une sourate'
    if VERSETS_DU_NOM.search(question):
        return 'versets qui nomment un prophete'
    if SOURATE_DU_NOM.search(question):
        return 'sourate ou un prophete revient le plus'
    return None


def _versets_du_prophete(nom, arabe, francais):
    """Les versets ou l'arabe ET le francais nomment ce prophete.

    La regle est celle du cahier : un seul des deux ne suffit pas. C'est elle
    qui avait revele, le 21 aout, quarante-trois attributions fausses — le
    mot « صالح » ramenait aussi les versets sur les bonnes oeuvres.
    Recomptee ici, depuis le texte, sans rien demander au generateur.
    """
    trouve = next(((c, f) for c, n, f in PROPHETES if n == nom), None)
    if not trouve:
        return None
    cle, formes = trouve
    k = squelette(cle)
    return [(s, v) for (s, v) in sorted(arabe)
            if k in squelette(arabe[(s, v)])
            and any(x in francais.get((s, v), '') for x in formes)]


def _verifier_compte(fam, q, arabe, francais, noms):
    """Recompte ce que la question affirme. Rend la liste de ses fautes."""
    dits = []
    bonne = q['reponses'][q['bonne']]
    autres = [r for i, r in enumerate(q['reponses']) if i != q['bonne']]

    if fam == 'versets d\'une sourate':
        nom = VERSETS_DE.search(q['question']).group(1).strip()
        num = next((n for n, x in noms.items() if x.get('tr') == nom), None)
        if num is None:
            return ['« %s » n\'est le nom d\'aucune sourate' % nom]
        vrai = sum(1 for (s, _) in arabe if s == num)
        if _nombre(bonne) != vrai:
            dits.append('annonce %s versets pour %s, le texte en compte %d'
                        % (_nombre(bonne), nom, vrai))
        for r in autres:
            if _nombre(r) == vrai:
                dits.append('le leurre « %s » est juste lui aussi' % r)
        ref = re.search(r'\((\d+)\)', q['source'] or '')
        if not ref or int(ref.group(1)) != num:
            dits.append('la source ne renvoie pas a la sourate %d' % num)
        return dits

    nom = (VERSETS_DU_NOM if fam.startswith('versets qui') else SOURATE_DU_NOM) \
        .search(q['question']).group(1).strip(' ,?')
    vs = _versets_du_prophete(nom, arabe, francais)
    if vs is None:
        return ['« %s » n\'est dans la liste d\'aucun prophete' % nom]
    if not vs:
        return ['« %s » ne se trouve dans aucun verset' % nom]

    if fam == 'versets qui nomment un prophete':
        if _nombre(bonne) != len(vs):
            dits.append('annonce %s versets pour %s, le texte en donne %d'
                        % (_nombre(bonne), nom, len(vs)))
        for r in autres:
            if _nombre(r) == len(vs):
                dits.append('le leurre « %s » est juste lui aussi' % r)
        return dits

    # « Dans quelle sourate revient-il le plus souvent » : on accepte toute
    # sourate qui atteint le maximum. Trancher entre deux ex aequo serait
    # une invention, et le generateur ne doit pas en produire.
    par_sourate = {}
    for s, _ in vs:
        par_sourate[s] = par_sourate.get(s, 0) + 1
    haut = max(par_sourate.values())
    gagnantes = {noms[s]['tr'] for s, n in par_sourate.items() if n == haut}
    if str(bonne).strip() not in gagnantes:
        dits.append('annonce « %s » pour %s, le texte donne %s (%d versets)'
                    % (bonne, nom, ' ou '.join(sorted(gagnantes)), haut))
    for r in autres:
        if str(r).strip() in gagnantes:
            dits.append('le leurre « %s » est juste lui aussi' % r)
    return dits


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
    pratiques = 0
    faits_vus = 0
    nonVerifies = 0
    comptes = {}

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
            # L'ELISION. « de Adam », « de Issa », « de Ibrahim » se lisent
            # comme une faute d'ecolier, et sur un site qui enseigne — dont
            # les enonces sont lus par des gens qui apprennent le francais
            # autant que l'arabe — c'est la derniere chose a laisser passer.
            # Mesure du 3 octobre : douze enonces de la section des prophetes.
            # Le Y ne s'elide pas (« de Yahya », comme « de Yann »), le H non
            # plus par l'usage (« de Haroun ») : ma premiere mesure les
            # comptait a tort et annoncait dix-neuf fautes au lieu de douze.
            for champ in ('question', 'explication', 'source'):
                for mot in ELISION.findall(str(q.get(champ) or '')):
                    fautes.append('%s : « de %s » dans %s — le francais elide '
                                  'devant une voyelle, il faut « d\'%s »'
                                  % (ou, mot, champ, mot))
            for r in q.get('reponses') or []:
                for mot in ELISION.findall(str(r)):
                    fautes.append('%s : « de %s » dans une reponse — il faut '
                                  '« d\'%s »' % (ou, mot, mot))

            if q.get('niveau') not in (1, 2, 3):
                fautes.append('%s : niveau %r, attendu 1, 2 ou 3 — relancer '
                              'classer-niveaux.py' % (ou, q.get('niveau')))

            # LES QUESTIONS DE FAIT SE REVERIFIENT DEPUIS LE CORPUS.
            # Elles ne citent aucun verset : ce qu'elles affirment, ce sont des
            # comptages — combien de fois un mot revient, combien de versets
            # compte une sourate. On recalcule la fiche et on refait la MEME
            # verification que le generateur, mais sur ce qui est publie.
            # Sans ca, ce type de question serait le seul du site que personne
            # ne confronte a rien.
            if q.get('type') == 'fait':
                faits_vus += 1
                meta = q.get('faits') or {}
                if not meta.get('bonne'):
                    fautes.append('%s : question de fait sans ses cles — elle ne '
                                  'peut pas etre reverifiee' % ou)
                    continue
                mauvais = CLAUDE.valider([{
                    'question': q['question'], 'forme': meta.get('forme'),
                    'bonne': meta['bonne'], 'leurres': meta.get('leurres') or [],
                    'racine': meta.get('racine'),
                }], FICHE)
                for m in mauvais:
                    fautes.append('%s : %s' % (ou, m.split(' : ', 1)[-1]))
                # Et ce qui s'AFFICHE doit etre ce que la cle designe : une
                # bonne reponse juste dans les donnees mais mal recopiee a
                # l'ecran serait invisible autrement.
                attendu = CLAUDE.etiquette(FICHE[meta['bonne']]) \
                    if meta['bonne'] in FICHE else None
                if attendu and q['reponses'][q['bonne']] != attendu:
                    fautes.append('%s : la bonne reponse affichee est « %s », le '
                                  'fait dit « %s »'
                                  % (ou, q['reponses'][q['bonne']], attendu))
                continue


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

            # --- LES QUESTIONS QUI COMPTENT, ET QUE PERSONNE NE COMPTAIT
            #
            # Mesure du 22 septembre : sur 2 701 questions, 69 ne citaient
            # aucun verset et n'etaient d'aucun des types reverifies plus
            # haut. Elles arrivaient ici, ne trouvaient pas de « sourate S,
            # verset V » dans leur source, et le `continue` ci-dessous les
            # laissait partir sans qu'AUCUN controle ne les ait regardees.
            #
            # Ce sont pourtant les plus exposees. Elles n'affirment pas un
            # verset, elles affirment un COMPTE sur le Coran entier :
            # « Combien de versets compte la sourate Al-Fajr ? », « Dans
            # combien de versets le nom de Moussa apparait-il ? », « Dans
            # quelle sourate le nom de Adam revient-il le plus souvent ? ».
            # Un chiffre faux la-dedans se publie au nom de Mohamed et ne se
            # voit nulle part — il n'y a pas de verset a cote pour le
            # dementir.
            #
            # Le generateur, lui, verifiait ses comptes a la fabrication.
            # Mais ce controle-ci relit ce qui est PUBLIE, et l'en-tete de ce
            # fichier promet « CHAQUE question » : pour ces 69, ce n'etait
            # pas vrai. On les recompte donc ici, depuis le texte.
            fam = _famille_de_compte(q['question'])
            if fam:
                comptes[fam] = comptes.get(fam, 0) + 1
                for m2 in _verifier_compte(fam, q, arabe, francais, noms):
                    fautes.append('%s : %s' % (ou, m2))
                continue

            # --- l'arabe montre doit etre CELUI de la source -----------
            m = SOURCE_CORAN.search(q['source'])
            if not m:
                # PLUS DE SORTIE SILENCIEUSE. C'est ce `continue` nu qui
                # cachait les 69. Une question que rien ne sait confronter
                # n'est pas une question verifiee : elle est une question
                # dont personne ne repond, et elle doit le dire.
                fautes.append('%s : aucun controle ne sait la confronter a '
                              'quoi que ce soit — source « %s »'
                              % (ou, q['source'][:70]))
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

            # --- pratique : ce que j'affirme doit se lire dans le verset
            # La reponse n'est pas une traduction du verset entier mais une
            # phrase courte en francais ; on ne peut donc pas la chercher
            # telle quelle. Ce sont les MOTS-CLES declares par le generateur
            # qu'on confronte au texte — et aucune mauvaise reponse ne doit
            # s'y lire non plus.
            if q.get('type') == 'pratique':
                pratiques += 1
                cle = (q['question'], s, v)
                if cle not in PRATIQUE:
                    fautes.append('%s : question de pratique absente de la table '
                                  'du generateur — elle n\'est donc pas verifiee' % ou)
                    continue
                bonneT, leurres, cles = PRATIQUE[cle]
                verset = nu(francais[(s, v)])
                if q['reponses'][q['bonne']] != bonneT:
                    fautes.append('%s : la bonne reponse publiee ne suit plus la '
                                  'table (« %s » au lieu de « %s »)'
                                  % (ou, q['reponses'][q['bonne']], bonneT))
                for c in cles:
                    if nu(c) not in verset:
                        fautes.append('%s : « %s » ne se lit pas dans sourate %d '
                                      'verset %d' % (ou, c, s, v))
                for l in leurres:
                    n = nu(l)
                    if len(n) > 5 and n in verset:
                        fautes.append('%s : le leurre « %s » se lit dans le verset — '
                                      'il est defendable' % (ou, l))
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

    # ================================================================
    # UN CORPUS INTROUVABLE EST UNE FAUTE, PLUS UNE INFORMATION
    # AJOUTE LE 24 OCTOBRE
    # ================================================================
    #
    # Ce controle se desactivait proprement quand le lexique ou le corpus
    # morphologique manquait : les cartes de vocabulaire passaient en NON
    # VERIFIE, et il l'imprimait. C'est le bon reflexe — mieux vaut dire « je
    # n'ai pas verifie » que laisser croire le contraire.
    #
    # Mais le 19 octobre le lexique a change de dossier et ce chemin n'a pas
    # suivi. La verification s'est donc eteinte TOUTE SEULE, et elle est
    # restee eteinte CINQ NUITS. Chaque soir la ligne de bilan affichait
    # « 687 designent un mot du verset, 0 confrontees au corpus
    # morphologique » — exact, honnete, et lu par personne.
    #
    # Une degradation silencieuse se remarque quand elle fait rougir le lot,
    # pas quand elle imprime un zero. Donc : s'il y a des cartes de
    # vocabulaire et que le corpus manque, LE LOT EST REFUSE. On ne perd pas
    # l'honnetete du message — on la rend impossible a ignorer.
    #
    # Ce que la reparation a mesure, et c'est la vraie nouvelle : 1 246
    # cartes confrontees, ZERO faute. Les cinq nuits aveugles n'ont rien
    # laisse passer. Le trou etait dans la verification, pas dans le site.
    #
    # LES DEUX MANQUES NE SE SIGNALENT PAS PAREIL, ET IL FAUT LE SAVOIR.
    # Sabotage du 24 octobre, les deux refusent le lot :
    #
    #   lexique introuvable (le defaut reel du 19 octobre)
    #       la fonction renvoie (None, None), la ligne de bilan affiche son
    #       zero, et c'est CE controle-ci qui nomme la faute.
    #   morphologie.txt introuvable
    #       `faire-questions-claude.py` le lit DES SON IMPORT, ligne 149,
    #       sans garde. Le controle s'arrete donc sur une pile d'appels avant
    #       d'avoir rien mesure. Le lot est refuse — bruyamment, mais par un
    #       plantage et non par une phrase. Repare la ligne 149 si tu veux un
    #       message ; ce n'est pas un trou, c'est un message laid.
    # Toute carte de vocabulaire passe par l'un des deux compteurs : celui
    # des confrontees, ou celui des non verifiees. Leur somme est donc le
    # nombre de cartes de vocabulaire, sans relire les banques.
    # ================================================================
    # AUCUN LEMME NE PUBLIE LE SENS DE SON VOISIN — 26 OCTOBRE
    # ================================================================
    #
    # CE QUI ETAIT EN LIGNE. Cinq cartes surlignaient إِنس — « les hommes »,
    # le mot que le Coran met EN FACE des djinns — et donnaient « djinns »
    # pour bonne reponse. Sourate 51 verset 56 : « Je n'ai cree les djinns et
    # les hommes que pour qu'ils M'adorent », le mot en vert etant « les
    # hommes ». Et une explication de « sens des sourates » disait de
    # ٱلْفَسَادَ — la corruption — qu'Hamidullah « le rend par terre ».
    #
    # LE MECANISME, MESURE. Hamidullah alterne « hommes » et « humains ». Le
    # radical de sept lettres en fait deux mots : le bon sens est coupe en
    # deux (10 versets et 7), chaque moitie perd, et « djinns » — jamais
    # divise — gagne a 15. Les quatre garde-fous du generateur ont tous
    # fonctionne ; c'est leur interaction qui retourne le resultat.
    #
    # `faire-11-vocabulaire.py` refuse desormais ces entrees. CE CONTROLE-CI
    # EST LA PARCE QUE LE LEXIQUE EST UN FICHIER : il se modifie a la main,
    # et le generateur ne tourne pas a chaque publication.
    #
    # LA REGLE NE CHOISIT AUCUN SENS, ELLE REFUSE. Un lemme est en faute si
    # un AUTRE lemme du lexique porte le meme sens, figure dans au moins
    # 75 % de ses versets, et tient sur plus de versets que lui. Celui qui ne
    # se montre presque jamais seul est celui qui a pris le mot du voisin.
    # Mesure du 26 octobre, apres reparation : 140 entrees, zero en faute.
    # ================================================================
    # LE SENS PUBLIE EST UN MOT QUE LE TRADUCTEUR ECRIT POUR CE MOT-LA
    # AJOUTE LE 27 OCTOBRE
    # ================================================================
    #
    # CE QUE LA MESURE A TROUVE. L'attestation d'un mot se mesurait bien sur
    # SES versets, mais la forme AFFICHEE etait prise dans un comptage fait
    # sur le Coran entier. Le lexique publiait donc des formes qu'Hamidullah
    # n'ecrit jamais pour ce mot :
    #
    #   شَفِيع  « intercession »  -> intercesseurs 6, intercesseur 5, et
    #                               « intercession » ZERO fois
    #   ذُرِّيَّة « descendre »   -> descendance 17, descendants 11, et
    #                               « descendre » ZERO fois
    #   صاحِب   « compagnie »     -> compagnon 7, et « compagnie » ZERO fois
    #   مُحْسِن  « bienfaits »    -> bienfaisants 32, et « bienfaits » ZERO
    #   رَحْمَة  « misericordieux » -> misericorde 108 contre 9
    #
    # « descendre » et « descendance » partagent le radical de sept lettres,
    # « intercession » et « intercesseur » aussi : le radical sert a COMPTER,
    # il ne doit pas servir a CHOISIR. 20 entrees sur 140 etaient dans ce cas.
    #
    # CE CONTROLE NE JUGE AUCUNE TRADUCTION. Il verifie une chose factuelle :
    # le mot francais publie se trouve-t-il dans les versets de ce lemme ?
    # Un sens absent a 100 % de ses propres versets n'est pas atteste, quelle
    # que soit sa justesse par ailleurs.
    sens_absents = 0
    if SENS_DU_LEMME and LEMMES_DU_VERSET:
        v_du_lemme = {}
        for k, lems in LEMMES_DU_VERSET.items():
            for l in lems:
                v_du_lemme.setdefault(l, set()).add(k)
        for l, s in sorted(SENS_DU_LEMME.items()):
            vs = v_du_lemme.get(l, set())
            if not vs:
                continue
            plat = nu(s)
            vus = sum(1 for k in vs if plat in nu(francais.get(k, '')))
            if vus == 0:
                sens_absents += 1
                fautes.append(
                    'lexique : %s publie « %s », mot qui n\'apparait dans '
                    'AUCUN de ses %d versets chez Hamidullah. Le radical de '
                    'sept lettres sert a compter, pas a choisir la forme.'
                    % (l, s, len(vs)))

    voisins_fautifs = 0
    if SENS_DU_LEMME and LEMMES_DU_VERSET:
        versets_du_lemme = {}
        for k, lems in LEMMES_DU_VERSET.items():
            for l in lems:
                versets_du_lemme.setdefault(l, set()).add(k)
        par_sens = {}
        for l, s in SENS_DU_LEMME.items():
            par_sens.setdefault(s, []).append(l)
        for l, s in sorted(SENS_DU_LEMME.items()):
            va = versets_du_lemme.get(l, set())
            if not va:
                continue
            for autre in par_sens[s]:
                if autre == l:
                    continue
                vb = versets_du_lemme.get(autre, set())
                if len(vb) <= len(va):
                    continue
                part = len(va & vb) / len(va)
                if part >= 0.75:
                    fautes.append(
                        'lexique : %s publie « %s », mais %s porte le meme '
                        'sens et figure dans %.0f %% de ses %d versets — '
                        'c\'est le mot du voisin, pas le sien. Le projet ne '
                        'publie pas une source douteuse ; on retire l\'entree, '
                        'on ne corrige pas la traduction.'
                        % (l, s, autre, 100 * part, len(va)))
                    voisins_fautifs += 1
                    break

    cartes_vocab = verifiesVocab + nonVerifies
    if cartes_vocab and SENS_DU_LEMME is None:
        fautes.append(
            '%d cartes de vocabulaire et AUCUN corpus charge : outils/'
            'lexique.json ou outils/coran/morphologie.txt est introuvable. '
            'Le sens annonce par ces cartes n\'est alors confronte a rien. '
            'C\'est exactement ce qui est arrive du 19 au 24 octobre.'
            % cartes_vocab)
    elif cartes_vocab and verifiesVocab == 0:
        fautes.append(
            '%d cartes de vocabulaire et zero confrontee au corpus : le '
            'corpus est charge mais plus personne ne s\'en sert.'
            % cartes_vocab)

    print('  %d questions dans %d sections.' % (total, len(fichiers)))
    print('  %d citent un verset precis et ont ete confrontees au texte.' % verifiables)
    print('  %d montrent un glyphe et ont ete confrontees a Unicode.' % calligraphies)
    print('  %d designent un mot du verset, %d confrontees au corpus '
          'morphologique.' % (surlignes, verifiesVocab))
    # Le chiffre, pas un verdict : la premiere version de cette ligne disait
    # « aucune ne publie le sens d'un lemme voisin » — elle l'aurait dit
    # aussi avec trois en faute.
    print('  %d entrees du lexique relues, %d publient le sens d\'un lemme '
          'voisin, %d un mot absent de leurs versets.'
          % (len(SENS_DU_LEMME) if SENS_DU_LEMME else 0,
             voisins_fautifs, sens_absents))
    print('  %d questions de pratique, confrontees mot-cle par mot-cle.' % pratiques)
    print('  %d questions de fait, recalculees depuis le corpus '
          '(%d faits).' % (faits_vus, len(FICHE)))
    for fam in sorted(comptes):
        print('  %d questions « %s », recomptees dans le texte.'
              % (comptes[fam], fam))
    # ================================================================
    # LE SITE NE PROMET AUCUN MERITE — AJOUTE LE 15 OCTOBRE
    # ================================================================
    #
    # Regle du carnet de l'empire, section « LES ARTICLES » du 25 aout :
    # quatre titres de voyageshalal promettaient une salle de priere que
    # l'article declarait inexistante. « Les descriptions, elles, etaient
    # honnetes. Seul le titre mentait — c'est-a-dire la seule ligne que Google
    # affiche et la seule sur laquelle on clique. » Ils l'ont reparee, puis
    # tenue par un test.
    #
    # Ici, la promesse qu'on ne peut pas tenir n'est pas une salle de priere,
    # c'est un MERITE attache a une sourate : « celui qui la recite… »,
    # « elle protege de… », « les vertus de… ». Ces mots-la sont tres
    # cherches, et ils viennent de hadiths dont ce projet n'a AUCUNE
    # traduction francaise sourcee. Les promettre ferait venir des gens sur
    # une page qui ne repond pas, et engagerait Mohamed sur un contenu qui
    # n'existe pas. faire-lecon-sourate.py le dit depuis septembre — dans un
    # commentaire. Un commentaire n'arrete personne.
    #
    # LE PIEGE, ET POURQUOI UNE VERSION NAIVE DE CE CONTROLE SERAIT JETEE.
    # « recompense », « bienfait », « protection » sont des mots du CORAN :
    # Hamidullah les emploie 375 fois dans les versets que le site cite. Un
    # controle qui les cherche partout trouve 375 fautes, toutes fausses, et
    # finit desactive. On ne regarde donc que LA VOIX DU SITE : l'enonce, et
    # l'explication hors citation. Les reponses d'une question « continuer un
    # verset » sont du texte coranique, pas la voix du site.
    #
    # Le depouillement des citations est fait large, et c'est voulu :
    # Hamidullah emboite les guillemets — « … lorsqu'il dit: «Le Diable…» » —
    # et un depouillement naif laisse ressortir le texte cite comme s'il
    # etait de nous. C'est l'erreur exacte qui a fausse la premiere mesure de
    # typographie, le 4 octobre.
    #
    # Mesure du 15 octobre : 5 014 champs de la voix du site, ZERO promesse.
    # La regle etait tenue. Elle est maintenant tenue par un controle.
    # On relit les banques depuis le disque : le corps de ce controle n'en
    # garde pas la liste complete, et la relecture coute une fraction de
    # seconde. Elle sert aussi aux deux mesures du 12 octobre, plus bas.
    par_section = {}
    for chemin in fichiers:
        par_section[chemin.stem] = json.loads(chemin.read_text(encoding='utf-8'))

    MERITES = ('bienfait', 'merite', 'vertu', 'recompense', 'protege',
               'protection', 'guerit', 'guerison', 'exauce', 'benediction',
               'baraka', 'efface les peches', 'equivaut',
               'celui qui la recite', 'celui qui le recite')

    def voix_du_site(v):
        """Ce que le site dit EN SON NOM : tout le reste est cite."""
        v = str(v or '')
        v = re.sub(r'«.*?»', ' ', v, flags=re.S)
        v = re.sub(r'«.*', ' ', v, flags=re.S)        # guillemet jamais ferme
        v = re.sub(r'Traduction du sens\s*:.*', ' ', v, flags=re.S)
        v = re.sub(r'Le verset entier\s*:.*', ' ', v, flags=re.S)
        return v

    champs_voix = 0
    for sec in sorted(par_section):
        for q in par_section[sec]:
            for champ in ('question', 'explication'):
                v = voix_du_site(q.get(champ))
                if not v.strip():
                    continue
                champs_voix += 1
                plat = nu(v)
                for mot in MERITES:
                    if mot in plat:
                        fautes.append(
                            '%s/%s : le site promet « %s » en son nom (%s) — '
                            'aucun hadith source ne le porte ici : « %s »'
                            % (sec, q['id'], mot, champ,
                               re.sub(r'\s+', ' ', v).strip()[:70]))

    # Comme la ligne du 12 octobre : on dit le MESURE, pas un verdict. Une
    # ligne de bilan s'imprime avant le bloc des fautes ; si elle affirme
    # « aucune promesse », elle l'affirmera aussi quand il y en a une.
    promesses = sum(1 for x in fautes if 'en son nom' in x)
    print('  %d champs de la voix du site examines, %d promesse(s) de merite.'
          % (champs_voix, promesses))

    # ================================================================
    # DEUX MESURES AJOUTEES LE 12 OCTOBRE
    # ================================================================

    # A. UN MEME VERSET POSE DANS PLUSIEURS SECTIONS.
    #
    # L'identifiant d'une question se termine par un hachage du verset. Un
    # verset qui parle de la priere ET de l'aumone — le Coran les associe sans
    # cesse — produit donc une carte dans « La priere » et une dans « Zakat et
    # aumone », avec le meme enonce et la meme bonne reponse, seuls les leurres
    # changeant.
    #
    # Mesure du 12 octobre : 65 versets, 138 cartes, 5,1 % du paquet. Dans 61
    # cas sur 65, l'enonce ET la bonne reponse sont identiques. Huit versets
    # sont dans TROIS sections.
    #
    # CE N'EST PAS DECLARE COMME UNE FAUTE, et c'est un choix qu'il faut dire :
    # un verset qui traite de deux sujets appartient aux deux sections, les
    # deux cartes ont des identifiants distincts, et la progression les suit
    # separement. Mais « 2 701 questions » — le nombre que l'accueil annonce —
    # compte ces versets deux ou trois fois. En les comptant une seule fois,
    # le site aurait 2 628 questions distinctes.
    #
    # On SURVEILLE donc le nombre au lieu de l'interdire : si un generateur se
    # met a reposer des centaines de versets d'une section a l'autre, cela doit
    # se voir avant la publication, pas apres.
    PLAFOND_CROISES = 90
    croises = {}
    for sec in sorted(par_section):
        for q in par_section[sec]:
            croises.setdefault(q['id'].rsplit('-', 1)[-1], set()).add(sec)
    croises = {h: s for h, s in croises.items() if len(s) > 1}
    cartes_croisees = sum(len(s) for s in croises.values())
    if len(croises) > PLAFOND_CROISES:
        fautes.append('%d versets sont poses dans plusieurs sections (%d cartes) '
                      '; le plafond est %d. Un generateur recopie-t-il une '
                      'section dans une autre ?'
                      % (len(croises), cartes_croisees, PLAFOND_CROISES))

    # B. LA LONGUEUR DE LA BONNE REPONSE NE DOIT PAS LA DESIGNER.
    #
    # Un QCM dont la bonne reponse est toujours la plus longue n'apprend rien :
    # il se joue a l'oeil. Mesure du 12 octobre, par section, sur les quatre
    # reponses de chaque carte :
    #
    #                          la + longue   la + courte     (hasard : 25 %)
    #     vocabulaire-arabe       30,1 %        17,6 %
    #     histoire-des-prophetes  27,6 %        26,4 %
    #     sens-des-sourates       26,7 %        15,7 %
    #     lire-l-arabe            25,0 %        25,7 %
    #     zakat-et-aumone         20,7 %        22,4 %
    #     la-priere               17,6 %        14,4 %
    #     piliers-de-la-foi       14,6 %        15,7 %
    #     les-invocations         14,8 %        14,2 %
    #
    # L'ecart existe et il est FAIBLE : la bonne reponse mesure en moyenne
    # 1,1 caractere de plus que les autres. Le plus net est « sens des
    # sourates », ou elle n'est la plus courte que dans 15,7 % des cas au lieu
    # de 25 — « ne prends jamais la plus courte » y gagnerait neuf points.
    # Ce n'est pas exploitable a l'oeil nu, et corriger cela voudrait dire
    # choisir les leurres par longueur sur 1 246 cartes de vocabulaire : une
    # refonte du tirage pour une finesse statistique. SIGNALE, PAS TOUCHE.
    #
    # Le controle pose une FOURCHETTE, pas le chiffre du jour : un chiffre
    # exact echouerait a chaque regeneration pour du bruit. Entre 12 et 40 %,
    # on est dans le bruit ; au-dela, un generateur designe ses reponses.
    BAS, HAUT = 12.0, 40.0
    pire, ecart_max = None, 0.0
    for sec in sorted(par_section):
        rangs = {1: 0, 4: 0}
        total_rangs = 0
        for q in par_section[sec]:
            reps = q.get('reponses') or []
            if len(reps) != 4:
                continue
            longueurs = [len(str(r)) for r in reps]
            rang = sorted(range(4), key=lambda i: -longueurs[i]).index(q['bonne']) + 1
            total_rangs += 1
            if rang in rangs:
                rangs[rang] += 1
        # Sous cent cartes, le bruit depasse le signal : on ne juge pas.
        if total_rangs < 100:
            continue
        for rang, quoi in ((1, 'la plus longue'), (4, 'la plus courte')):
            part = 100.0 * rangs[rang] / total_rangs
            if abs(part - 25.0) > ecart_max:
                ecart_max = abs(part - 25.0)
                pire = '%s, %s dans %.1f %% des cas' % (sec, quoi, part)
            if not BAS <= part <= HAUT:
                fautes.append('%s : la bonne reponse est %s dans %.1f %% des '
                              '%d cartes (fourchette %.0f-%.0f %%) — la longueur '
                              'la designe' % (sec, quoi, part, total_rangs, BAS, HAUT))

    # ================================================================
    # AUCUNE QUESTION NE CITE UN HADITH — AJOUTE LE 21 OCTOBRE
    # ================================================================
    #
    # LA REGLE DU SITE : un hadith se cite avec son recueil, ou ne se cite
    # pas. Le projet n'a aucune traduction francaise de hadith qui soit
    # SOURCEE — et c'est mesure, pas repete. `outils/coran/` en contient
    # trois : Boukhari 7 589, Mouslim 7 563, Abou Dawoud 5 274, soit 20 426
    # hadiths en francais. Aucune ne nomme son traducteur : leurs
    # metadonnees n'ont que `name`, `sections`, `section_details`. Et leurs
    # titres de chapitres sont encore EN ANGLAIS, mot pour mot ceux du
    # fichier anglais — « Revelation », « Belief », « Knowledge ». C'est la
    # preuve mesurable d'une traduction de traduction, sans traducteur
    # nomme. faire-05-prophetes.py l'ecrivait des le 21 aout. Un commentaire
    # n'arrete personne : d'ou ce controle.
    #
    # LA TENTATION EST DATEE ET LOCALISEE. Quatre sections sont sous le
    # plancher de cent questions du cahier — piliers 89, comportement 11,
    # jeune 8, pelerinage 7 — et ce sont precisement celles qui devaient
    # reposer sur des hadiths. 20 426 hadiths dorment dans le depot, a un
    # import de distance. Il suffit d'un generateur presse pour que « Sahih
    # al-Boukhari n° 1 » apparaisse sous une carte : le site donnerait alors
    # pour sure une parole du Prophete deux fois eloignee de l'arabe.
    #
    # LE PIEGE D'UNE VERSION NAIVE, ET IL EST GROS. « prophete » est dans la
    # VOIX DU SITE 153 fois : la section des prophetes demande « de quel
    # prophete parle ce verset ». « messager » apparait 180 fois dans les
    # textes et ZERO fois dans la voix du site — c'est un mot de Hamidullah.
    # Un controle qui cherche ces deux mots leve 153 fautes, toutes fausses,
    # et finit desactive comme tout controle qui crie. On ne cherche donc pas
    # des mots du domaine : on cherche l'ATTRIBUTION d'une parole et les NOMS
    # DE RECUEILS. « recueil » tout court est d'ailleurs ecarte — Hamidullah
    # ecrit « afin que quelque caravane le recueille » : on cherche
    # « recueil de ».
    #
    # Mesure du 21 octobre : 2 701 sources, 2 545 nomment le Coran, 156
    # nomment l'alphabet arabe ou le texte coranique. Les 21 motifs cherches
    # sont a ZERO dans les six champs des 2 701 cartes.
    RECUEILS = ('boukhari', 'bukhari', 'mouslim', 'sahih muslim', 'abou dawoud',
                'abu dawud', 'tirmidhi', 'ibn maja', 'nasai', 'ahmad ibn hanbal',
                'sahih al', 'sunan', 'muwatta')
    ATTRIBUTIONS = ('le prophete a dit', 'le messager a dit',
                    'messager d\'allah a dit', 'rapporte par', 'hadith',
                    'sunna', 'recueil de', 'd\'apres abou')
    # Ce qu'une source EST autorisee a nommer. Les quatre formes mesurees le
    # 21 octobre : le Coran, le texte coranique, l'alphabet arabe, les signes
    # de l'ecriture arabe. Une cinquieme forme fera echouer ce controle, et
    # c'est voulu : une source neuve se regarde avant de se publier.
    SOURCES_PERMISES = ('coran', 'alphabet arabe', 'ecriture arabe')

    CHAMPS_TOUS = ('question', 'explication', 'source', 'divergence', 'surtitre')
    motifs_vus, champs_lus, sources_lues = 0, 0, 0
    for sec in sorted(par_section):
        for q in par_section[sec]:
            src = nu(q.get('source'))
            sources_lues += 1
            if not any(p in src for p in SOURCES_PERMISES):
                fautes.append('%s/%s : la source ne nomme ni le Coran ni '
                              'l\'alphabet arabe — « %s »'
                              % (sec, q['id'], str(q.get('source'))[:70]))
            for champ in CHAMPS_TOUS:
                valeurs = [q.get(champ)]
                if champ == 'question':
                    valeurs += list(q.get('reponses') or [])
                for val in valeurs:
                    if val is None or not str(val).strip():
                        continue
                    champs_lus += 1
                    # Un nom de recueil est une faute OU QU'IL SOIT, meme
                    # entre guillemets : rien dans le Coran ne le porte.
                    plat = nu(val)
                    for mot in RECUEILS:
                        if mot in plat:
                            motifs_vus += 1
                            fautes.append(
                                '%s/%s : un recueil de hadith est cite (%s, '
                                'champ %s) — le projet n\'a aucune traduction '
                                'francaise sourcee de ces recueils : « %s »'
                                % (sec, q['id'], mot, champ,
                                   re.sub(r'\s+', ' ', str(val)).strip()[:70]))
                    # Une attribution, elle, ne se juge que sur la voix du
                    # site : « Dis: » et « Prophete » sont du texte cite.
                    plat_voix = nu(voix_du_site(val))
                    for mot in ATTRIBUTIONS:
                        if mot in plat_voix:
                            motifs_vus += 1
                            fautes.append(
                                '%s/%s : le site attribue une parole en son '
                                'nom (%s, champ %s) — « %s »'
                                % (sec, q['id'], mot, champ,
                                   re.sub(r'\s+', ' ', str(val)).strip()[:70]))

    # CES TROIS LIGNES DISENT CE QUI A ETE MESURE, PAS UN VERDICT.
    # Premier jet : « Dans aucune section la longueur de la bonne reponse ne
    # la designe. » Elle s'affichait AUSSI quand le controle venait d'en
    # trouver une — le sabotage du 12 octobre l'a montre. Une ligne de bilan
    # qui ne peut pas se taire est une ligne qui ne dit rien.
    print('  %d versets poses dans plusieurs sections (%d cartes, plafond %d).'
          % (len(croises), cartes_croisees, PLAFOND_CROISES))
    print('  Longueur de la bonne reponse, l\'ecart le plus net : %s '
          '(fourchette %.0f-%.0f %%).'
          % (pire or 'aucun', BAS, HAUT))
    print('  %d sources lues, %d champs relus : %d motif(s) de hadith '
          '(%d recueils, %d attributions cherches).'
          % (sources_lues, champs_lus, motifs_vus,
             len(RECUEILS), len(ATTRIBUTIONS)))

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
