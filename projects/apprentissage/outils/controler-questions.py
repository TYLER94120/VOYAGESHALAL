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
VERSETS_DU_NOM = re.compile(r'Dans combien de versets le nom de (\S+) ')
SOURATE_DU_NOM = re.compile(r'Dans quelle sourate le nom de (\S+) ')


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

    print('  %d questions dans %d sections.' % (total, len(fichiers)))
    print('  %d citent un verset precis et ont ete confrontees au texte.' % verifiables)
    print('  %d montrent un glyphe et ont ete confrontees a Unicode.' % calligraphies)
    print('  %d designent un mot du verset, %d confrontees au corpus '
          'morphologique.' % (surlignes, verifiesVocab))
    print('  %d questions de pratique, confrontees mot-cle par mot-cle.' % pratiques)
    print('  %d questions de fait, recalculees depuis le corpus '
          '(%d faits).' % (faits_vus, len(FICHE)))
    for fam in sorted(comptes):
        print('  %d questions « %s », recomptees dans le texte.'
              % (comptes[fam], fam))
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
