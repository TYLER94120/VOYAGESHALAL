#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Outils communs a tous les generateurs de questions.

CE QUI REND UNE MAUVAISE REPONSE ACCEPTABLE
-------------------------------------------
Le cahier des charges, section 5 : « Les trois mauvaises reponses doivent etre
plausibles — pas de remplissage absurde. Longueur comparable entre les
quatre. » Et section 10.4 : « jamais moqueuses, ni absurdes, ni caricaturales.
Ce sont des confusions plausibles, du niveau d'un debutant sincere. »

C'est la contrainte la plus difficile a tenir quand on fabrique en nombre. La
reponse retenue ici : **on ne redige jamais une mauvaise reponse**. On va la
chercher dans le corpus lui-meme — une autre traduction de Hamidullah, un autre
nom de sourate, un autre rapporteur. Elle est donc, par construction :

  * du bon registre (c'est la meme langue, le meme traducteur) ;
  * jamais moqueuse ni absurde (c'est du texte reel) ;
  * jamais fabriquee de toutes pieces, donc jamais une invention.

On y ajoute deux filtres : une longueur comparable, et l'unicite (une mauvaise
reponse ne doit jamais etre, elle aussi, une bonne reponse).

CE QUI ARRETE LA FABRICATION
----------------------------
Une question sans source ne sort pas (section 2.5). Un lot qui contient une
seule question sans source est refuse en entier : mieux vaut un lot plus petit
qu'un lot dont on doit verifier chaque ligne a la main.
"""

import hashlib
import json
import pathlib
import re
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
DONNEES = RACINE / 'data' / 'questions'
CORAN = RACINE / 'outils' / 'coran'

# Longueur d'une mauvaise reponse, en proportion de la bonne. Au-dela, la bonne
# reponse se repere a l'oeil sans rien connaitre : c'est un cadeau, pas une
# question.
BANDE_BASSE = 0.6
BANDE_HAUTE = 1.6


def charger_coran():
    """Le texte arabe et la traduction du sens, indexes par (sourate, verset)."""
    ar = json.loads((CORAN / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']
    fr = json.loads((CORAN / 'fra-muhammadhamidul.json').read_text(encoding='utf-8'))['quran']
    arabe, francais = {}, {}
    for v in ar:
        arabe[(v['chapter'], v['verse'])] = v['text']
    for v in fr:
        francais[(v['chapter'], v['verse'])] = v['text']
    return arabe, francais


def noms_sourates():
    """Les 114 noms, verifies au moment ou ils ont ete publies."""
    f = CORAN / 'noms-sourates.json'
    return {x['n']: x for x in json.loads(f.read_text(encoding='utf-8'))}


def sans_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn').lower()


def normaliser(s):
    """Pour comparer deux reponses : espaces, accents et ponctuation ignores."""
    return re.sub(r'[^a-z0-9]+', ' ', sans_accents(s)).strip()


def identifiant(prefixe, graine):
    """Un identifiant stable : la meme question garde le meme id d'un lot a
    l'autre, sinon la progression des gens se perd a chaque regeneration."""
    h = hashlib.sha1(graine.encode('utf-8')).hexdigest()[:8]
    return '%s-%s' % (prefixe, h)


def choisir_leurres(bonne, vivier, combien, rng, exclure=()):
    """Prend `combien` mauvaises reponses PLAUSIBLES dans le vivier.

    Le vivier est du texte reel. On garde celles dont la longueur est
    comparable a la bonne reponse, on ecarte tout ce qui lui ressemble trop
    (au point d'etre juste aussi), et on tire au sort parmi le reste.
    """
    n = len(bonne)
    interdits = {normaliser(bonne)} | {normaliser(x) for x in exclure}
    ok = []
    for t in vivier:
        if not t:
            continue
        cle = normaliser(t)
        if cle in interdits:
            continue
        if not (BANDE_BASSE * n <= len(t) <= BANDE_HAUTE * n):
            continue
        interdits.add(cle)          # jamais deux leurres identiques
        ok.append(t)
    if len(ok) < combien:
        return None                 # pas assez de matiere : la question ne sort pas
    return rng.sample(ok, combien)


def question(qid, section, theme, question_texte, bonne, leurres, explication,
             source, rng, surtitre=None, arabe=None, translitteration=None,
             difficulte=2, divergence=None):
    """Construit une question au format de la section 5, et la controle.

    `bonne` est le TEXTE de la bonne reponse. L'ordre est melange ici, et
    `bonne` devient un index — le cahier des charges interdit de figer la
    position de la bonne reponse dans le fichier.
    """
    if not source or not str(source).strip():
        raise ValueError('question %s sans source : refusee' % qid)
    if len(leurres) != 3:
        raise ValueError('question %s : %d leurres, 3 attendus' % (qid, len(leurres)))

    reponses = [bonne] + list(leurres)
    vus = {normaliser(r) for r in reponses}
    if len(vus) != 4:
        raise ValueError('question %s : deux reponses identiques' % qid)

    rng.shuffle(reponses)
    q = {
        'id': qid,
        'section': section,
        'theme': theme,
        'type': 'qcm4',
        'difficulte': difficulte,
        'question': question_texte,
        'reponses': reponses,
        'bonne': reponses.index(bonne),
        'explication': explication,
        'source': source,
        'divergence': divergence,
    }
    if surtitre:
        q['surtitre'] = surtitre
    if arabe:
        q['arabe'] = arabe
    if translitteration:
        q['translitteration'] = translitteration
    return q


def ecrire(section_slug, questions):
    """Ecrit un lot, apres l'avoir controle en entier.

    Un lot livre sans ses sources est refuse (section 4.1). On verifie donc
    tout AVANT d'ecrire, et on n'ecrit rien si une seule question cloche.
    """
    if not questions:
        raise SystemExit('ARRET : lot vide pour %s.' % section_slug)

    vus = set()
    for q in questions:
        if q['id'] in vus:
            raise SystemExit('ARRET : identifiant en double : %s' % q['id'])
        vus.add(q['id'])
        if not q.get('source'):
            raise SystemExit('ARRET : %s sans source.' % q['id'])
        if len(q['reponses']) != 4:
            raise SystemExit('ARRET : %s n a pas 4 reponses.' % q['id'])
        if not (0 <= q['bonne'] < 4):
            raise SystemExit('ARRET : %s a un index de bonne reponse hors bornes.' % q['id'])
        if len({normaliser(r) for r in q['reponses']}) != 4:
            raise SystemExit('ARRET : %s a deux reponses identiques.' % q['id'])
        if not q.get('explication'):
            raise SystemExit('ARRET : %s sans explication.' % q['id'])

    DONNEES.mkdir(parents=True, exist_ok=True)
    f = DONNEES / ('%s.json' % section_slug)
    f.write_text(json.dumps(questions, ensure_ascii=False, indent=1), encoding='utf-8')
    return f
