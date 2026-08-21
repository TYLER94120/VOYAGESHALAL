#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lire l'arabe : les 28 lettres, leurs formes attachées, et la vocalisation.

POURQUOI CETTE SECTION EST DIFFERENTE DES AUTRES
------------------------------------------------
Toutes les autres sections posent des questions sur un TEXTE et se controlent
contre ce texte. Celle-ci porte sur l'ECRITURE, qui n'est pas une matiere
religieuse : c'est de la linguistique, et la regle editoriale y est plus facile
a tenir — il n'y a rien a trancher, seulement a transmettre.

Il reste une facon de se tromper, et elle est grave : afficher un glyphe et
dire qu'il est une autre lettre. D'ou le principe suivant.

RIEN N'EST RECOPIE DE MEMOIRE
-----------------------------
Les formes contextuelles — initiale, mediane, finale — ne sont pas
retranscrites a la main. Elles sont LUES DANS UNICODE : le bloc « Arabic
Presentation Forms-B » (U+FE70 a U+FEFC) donne, pour chaque forme, une
decomposition de compatibilite qui nomme sa position ET sa lettre de base.
C'est Unicode qui affirme que ﺿ est la forme initiale de ض, pas moi.

De la meme facon, les six lettres qui ne s'attachent pas a la lettre suivante
ne sont ecrites nulle part ici : Unicode ne leur donne ni forme initiale ni
forme mediane, et c'est de cette absence qu'on le deduit.

CE QUE J'AI RETIRE, ET POURQUOI
-------------------------------
Une premiere version comptait les points de chaque lettre — « combien de
points porte cette lettre ? » — et pretendait verifier ce compte contre le nom
Unicode. C'etait faux : les 28 lettres de base portent des noms atomiques
(BEH, THEH, JEEM) qui ne disent rien des points ; seules les lettres etendues
du persan ou de l'ourdou sont nommees « WITH THREE DOTS ABOVE ». Le controle
signalait donc quinze fautes qui n'en etaient pas.

Je connais ces nombres de points. Mais la regle de ce projet est de ne rien
publier qu'on ne puisse verifier autrement que par sa propre memoire, et je
n'ai ici aucune source mecanique pour eux. La forme a donc ete retiree, et
avec elle toute mention des points dans les explications.
"""

import random
import sys
import unicodedata

import fabrique as F

SECTION = 'lire-l-arabe'
SOURCE = 'Alphabet arabe : les 28 lettres et leurs formes.'

# (glyphe, nom francais)
# Trois paires se disent presque pareil en francais : ت / ط, ح / ه, ز / ظ. Deux
# reponses de meme nom rendraient la question injuste — on repondrait juste et
# le jeu dirait non. Elles portent donc leur qualificatif d'usage, et le
# controle refuse le lot si deux noms se confondent apres normalisation.
LETTRES = [
    ('ا', 'alif'),
    ('ب', "bâ'"),
    ('ت', "tâ'"),
    ('ث', "thâ'"),
    ('ج', 'jîm'),
    ('ح', "hâ' (h de gorge)"),
    ('خ', "khâ'"),
    ('د', 'dâl'),
    ('ذ', 'dhâl'),
    ('ر', "râ'"),
    ('ز', 'zây'),
    ('س', 'sîn'),
    ('ش', 'shîn'),
    ('ص', 'sâd'),
    ('ض', 'dâd'),
    ('ط', "tâ' emphatique"),
    ('ظ', "zâ' emphatique"),
    ('ع', "'ayn"),
    ('غ', 'ghayn'),
    ('ف', "fâ'"),
    ('ق', 'qâf'),
    ('ك', 'kâf'),
    ('ل', 'lâm'),
    ('م', 'mîm'),
    ('ن', 'nûn'),
    ('ه', "hâ' (h soufflé)"),
    ('و', 'wâw'),
    ('ي', "yâ'"),
]

POSITIONS = [
    ('initial', 'au début d\'un mot'),
    ('medial', 'au milieu d\'un mot'),
    ('final', 'à la fin d\'un mot'),
]
LIBELLE_POS = {
    'initial': 'Au début d\'un mot',
    'medial': 'Au milieu d\'un mot',
    'final': 'À la fin d\'un mot',
    'isolated': 'Seule, sans attache',
}

SIGNES = [
    ('َ', 'la fatha', 'Un trait oblique au-dessus de la lettre. Elle note le son « a ».'),
    ('ِ', 'la kasra', 'Un trait oblique au-dessous de la lettre. Elle note le son « i ».'),
    ('ُ', 'la damma', 'Une petite boucle au-dessus de la lettre. Elle note le son « ou ».'),
    ('ْ', 'le soukoun', 'Un petit cercle au-dessus de la lettre. Il marque l\'absence de voyelle.'),
    ('ّ', 'la chadda', 'Un signe au-dessus de la lettre. Il double la consonne.'),
    ('ً', 'le tanwin de fatha', 'Deux traits obliques au-dessus. Ils notent le son « an ».'),
    ('ٍ', 'le tanwin de kasra', 'Deux traits obliques au-dessous. Ils notent le son « in ».'),
    ('ٌ', 'le tanwin de damma', 'Deux boucles au-dessus. Elles notent le son « oun ».'),
]


def formes_unicode():
    """Pour chaque lettre : ses formes contextuelles, lues dans Unicode.

    Chaque caractere du bloc des formes de presentation porte une
    decomposition du type « <initial> 0636 » : elle nomme la position et la
    lettre de base. On ne fait confiance a aucune liste ecrite a la main.
    """
    out = {}
    for cp in range(0xFE70, 0xFEFD):
        c = chr(cp)
        d = unicodedata.decomposition(c)
        if not d.startswith('<'):
            continue
        pos, reste = d[1:].split('>', 1)
        bases = reste.split()
        if len(bases) != 1:          # les ligatures lam-alif portent deux bases
            continue
        out.setdefault(chr(int(bases[0], 16)), {})[pos] = c
    return out


def controler(formes):
    """Ce qui doit etre vrai AVANT de fabriquer quoi que ce soit."""
    fautes = []

    if len(LETTRES) != 28:
        fautes.append('il n\'y a pas 28 lettres mais %d' % len(LETTRES))

    vus = {}
    for g, nom in LETTRES:
        n = F.normaliser(nom)
        if n in vus:
            fautes.append('« %s » et « %s » portent le meme nom une fois normalise'
                          % (vus[n], nom))
        vus[n] = nom
        if not unicodedata.name(g, '').startswith('ARABIC LETTER'):
            fautes.append('%s n\'est pas une lettre arabe pour Unicode' % g)
        if g not in formes or 'isolated' not in formes[g]:
            fautes.append('%s (%s) n\'a pas de forme isolee dans Unicode' % (g, nom))

    # Une lettre a soit quatre formes, soit deux. Jamais autre chose : si
    # Unicode en annonce trois, c'est que la table du dessus est fausse.
    for g, nom in LETTRES:
        n = len(formes.get(g, {}))
        if n not in (2, 4):
            fautes.append('%s (%s) a %d forme(s), 2 ou 4 attendues' % (g, nom, n))

    for c, nom, _ in SIGNES:
        if unicodedata.category(c) != 'Mn':
            fautes.append('%s n\'est pas un signe de vocalisation' % nom)

    if fautes:
        for f in fautes:
            print('  ' + f)
        sys.exit('ARRET : la table des lettres ne se recoupe pas avec Unicode.')


def main():
    rng = random.Random(20260821)
    formes = formes_unicode()
    controler(formes)

    noms = [nom for _, nom in LETTRES]
    questions = []

    # ---- Forme A : la lettre isolee ------------------------------------
    for g, nom in LETTRES:
        # Elle s'attache a gauche si, et seulement si, Unicode lui donne une
        # forme initiale. On ne recopie pas la liste des six, on la deduit.
        attache = 'initial' in formes[g]
        questions.append(F.question(
            qid=F.identifiant('arabe', 'A-%04X' % ord(g)),
            section=SECTION,
            theme='Les 28 lettres',
            surtitre='Lire l\'arabe · les 28 lettres',
            type_='calligraphie',
            glyphe=formes[g]['isolated'],
            question_texte='Quelle lettre est-ce ?',
            bonne=nom,
            leurres=rng.sample([n for n in noms if n != nom], 3),
            explication='C\'est la lettre %s. %s' % (
                nom,
                'Elle s\'attache des deux côtés.' if attache
                else 'Elle ne s\'attache jamais à la lettre suivante : après '
                     'elle, le mot se coupe visuellement.'),
            source=SOURCE,
            difficulte=1,
            rng=rng,
        ))

    # ---- Forme B : la meme lettre, attachee ----------------------------
    for g, nom in LETTRES:
        for pos, ou in POSITIONS:
            c = formes[g].get(pos)
            if not c:
                continue
            questions.append(F.question(
                qid=F.identifiant('arabe', 'B-%04X-%s' % (ord(g), pos)),
                section=SECTION,
                theme='Les lettres attachées',
                surtitre='Lire l\'arabe · les formes attachées',
                type_='calligraphie',
                glyphe=c,
                question_texte='Quelle lettre reconnais-tu dans cette forme ?',
                bonne=nom,
                leurres=rng.sample([n for n in noms if n != nom], 3),
                explication='C\'est la lettre %s, écrite %s. Une lettre change '
                            'de forme selon sa place, mais reste la même lettre.'
                            % (nom, ou),
                source=SOURCE,
                difficulte=2 if pos == 'final' else 3,
                rng=rng,
            ))

    # ---- Forme C : ou la lettre est-elle placee ? ----------------------
    # Une position par lettre, prise a tour de role parmi celles qu'Unicode
    # lui donne : quatre questions identiques par lettre lasseraient, et on
    # apprend la meme chose avec une seule.
    for i, (g, nom) in enumerate(LETTRES):
        dispo = [p for p in ['initial', 'medial', 'final', 'isolated'] if p in formes[g]]
        pos = dispo[i % len(dispo)]
        bonne = LIBELLE_POS[pos]
        questions.append(F.question(
            qid=F.identifiant('arabe', 'C-%04X' % ord(g)),
            section=SECTION,
            theme='La place dans le mot',
            surtitre='Lire l\'arabe · la place dans le mot',
            type_='calligraphie',
            glyphe=formes[g][pos],
            question_texte='Où cette forme se place-t-elle ?',
            bonne=bonne,
            leurres=[LIBELLE_POS[p] for p in
                     ['initial', 'medial', 'final', 'isolated'] if p != pos][:3],
            explication='C\'est la lettre %s. %s' % (
                nom,
                'Cette lettre ne s\'attache pas à la suivante : elle n\'a que '
                'deux formes.' if len(formes[g]) == 2
                else 'Chaque lettre qui s\'attache des deux côtés a quatre formes.'),
            source=SOURCE,
            difficulte=3,
            rng=rng,
        ))

    # ---- Forme D : les signes de vocalisation --------------------------
    nomsSignes = [n for _, n, _ in SIGNES]
    for c, nom, expl in SIGNES:
        # Un signe seul ne s'affiche pas : on le pose sur la dâl, qui n'a pas
        # de point et ne changera pas de forme.
        questions.append(F.question(
            qid=F.identifiant('arabe', 'D-%04X' % ord(c)),
            section=SECTION,
            theme='Les signes de vocalisation',
            surtitre='Lire l\'arabe · les voyelles brèves',
            type_='calligraphie',
            glyphe='د' + c,
            question_texte='Quel signe est posé sur cette lettre ?',
            bonne=nom,
            leurres=rng.sample([n for n in nomsSignes if n != nom], 3),
            explication=expl,
            source='Signes de vocalisation de l\'écriture arabe.',
            difficulte=2,
            rng=rng,
        ))

    f = F.ecrire(SECTION, questions)
    parTheme = {}
    for q in questions:
        parTheme[q['theme']] = parTheme.get(q['theme'], 0) + 1
    print('  %d questions ecrites dans %s' % (len(questions), f.name))
    for t in sorted(parTheme):
        print('    %-30s %3d' % (t, parTheme[t]))


if __name__ == '__main__':
    main()
