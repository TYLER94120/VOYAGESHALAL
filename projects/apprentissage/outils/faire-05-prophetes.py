#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""SECTION 5 — HISTOIRE DES PROPHETES. Cible : 300 questions.

POURQUOI CETTE SECTION ET PAS UNE AUTRE MAINTENANT
--------------------------------------------------
Huit des douze sections reposaient sur des hadiths. Le seul jeu de donnees
francais atteignable s'est revele etre une traduction AUTOMATIQUE de l'anglais,
sans traducteur nomme — les titres de chapitres n'y sont meme pas traduits.
Publier cela comme « Sahih al-Boukhari n° X » reviendrait a donner pour sure
une parole du Prophete deux fois eloignee de l'arabe. La regle du site est
claire : en cas de doute sur une source, on ne publie pas.

Cette section-ci ne depend d'aucun hadith. Elle se construit entierement sur
le texte arabe du Coran et sur la traduction du sens de Muhammad Hamidullah,
tous deux deja verifies.

CE QU'ON DEMANDE, ET CE QU'ON NE DEMANDE PAS
--------------------------------------------
On demande de RECONNAITRE : de quel prophete parle ce verset, dans quelle
sourate son nom revient le plus. Ce sont des faits qui se comptent dans le
texte.

On ne demande jamais ce qu'il faut FAIRE, ni ce qu'un recit signifie. On
transmet, on ne tranche pas.

LES NOMS NE SONT PAS RECOPIES DE MEMOIRE
----------------------------------------
Chaque nom est CHERCHE dans le texte arabe. Un prophete dont le nom ne se
trouve pas dans le corpus ne donne aucune question — plutot une section plus
courte qu'une affirmation invérifiable.
"""

import random
import re
import sys

import fabrique as F

SECTION = 'histoire-des-prophetes'

# Chaque prophete : la clef ARABE cherchee dans le texte, le nom employe sur
# le site, et les formes FRANCAISES qu'emploie Hamidullah.
#
# POURQUOI DEUX LANGUES, ET PAS UNE.
# La premiere version ne cherchait que l'arabe, sur les consonnes seules. Elle
# a produit des attributions systematiquement FAUSSES :
#
#   * « يحيى » a ramene tous les versets sur le verbe « il vit » — 35 versets
#     au lieu des 5 du prophete Yahya ;
#   * « صالح » a ramene les versets sur les « bonnes oeuvres » ;
#   * « هود » a ramene les versets sur les JUIFS.
#
# Un debutant aurait lu qu'un verset sur les bonnes oeuvres « parle du
# prophete Salih ». On exige donc que l'arabe ET le francais nomment le
# prophete. Les deux jeux de donnees se controlent l'un l'autre, et les
# comptes obtenus retombent alors sur les reperes connus.
#
# Les formes francaises ne sont pas devinees : elles ont ete COMPTEES dans la
# traduction de Hamidullah.
PROPHETES = [
    ('آدَم', 'Adam', ['Adam']),
    ('نُوح', 'Nouh', ['Noé']),
    ('إِبْرَاهِيم', 'Ibrahim', ['Abraham']),
    ('إِسْمَاعِيل', 'Ismail', ['Ismaël', 'Ismaïl']),
    ('إِسْحَاق', 'Ishaq', ['Isaac']),
    ('يَعْقُوب', 'Yaqoub', ['Jacob']),
    ('يُوسُف', 'Yousouf', ['Joseph']),
    ('مُوسَى', 'Moussa', ['Moïse']),
    ('هَارُون', 'Haroun', ['Aaron', 'Hârûn']),
    ('دَاوُود', 'Daoud', ['David']),
    ('سُلَيْمَان', 'Souleyman', ['Salomon']),
    ('أَيُّوب', 'Ayyoub', ['Job']),
    ('يُونُس', 'Younous', ['Jonas', 'Yûnus']),
    ('زَكَرِيَّا', 'Zakariya', ['Zacharie']),
    ('يَحْيَى', 'Yahya', ['Yahya', 'Jean']),
    ('عِيسَى', 'Issa', ['Jésus']),
    ('لُوط', 'Lout', ['Lot']),
    ('هُود', 'Houd', ['Hûd', 'Houd']),
    ('صَالِح', 'Salih', ['Sâlih']),
    ('شُعَيْب', 'Chouayb', ['Chuayb', 'Chu\'ayb', 'Shuayb']),
    ('إِدْرِيس', 'Idriss', ['Idris', 'Idrîs']),
    ('إِلْيَاس', 'Ilyas', ['Elie', 'Élie', 'Ilyâs']),
    ('مُحَمَّد', 'Mouhammad', ['Muhammad', 'Mahomet']),
]

# Les signes de vocalisation varient d'une graphie a l'autre : on cherche sur
# les consonnes seules, sinon un nom present passe pour absent.
DIACRITIQUES = re.compile(r'[ً-ٰٟۖ-ۭـ]')


def squelette(s):
    """Le mot sans ses voyelles ni ses signes : la forme qui se cherche."""
    s = DIACRITIQUES.sub('', s)
    # L'alif porte plusieurs formes (ا أ إ آ) pour un meme son : on les unifie,
    # sinon « إبراهيم » ne se trouve pas dans un verset qui ecrit « ابراهيم ».
    return (s.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
             .replace('ى', 'ي').replace('ة', 'ه'))


def main():
    rng = random.Random(20260821)
    arabe, francais = F.charger_coran()
    noms = F.noms_sourates()

    # Un verset ne compte que si l'ARABE et le FRANCAIS nomment tous deux le
    # prophete. Un seul des deux ne suffit pas : c'est ce qui avait produit
    # les fausses attributions.
    trouve, etiquette = {}, {}
    for cle, nom, formes in PROPHETES:
        k = squelette(cle)
        versets = []
        for (s, v) in sorted(arabe):
            if k not in squelette(arabe[(s, v)]):
                continue
            f = francais.get((s, v), '')
            if not any(x in f for x in formes):
                continue
            versets.append((s, v))
        if versets:
            trouve[nom] = versets
            # On montre les deux noms quand le francais en emploie un autre :
            # « Moussa (Moïse) ». C'est utile, et c'est vrai.
            etiquette[nom] = ('%s (%s)' % (nom, formes[0])) if formes[0] != nom else nom

    # CONTROLE CONTRE DES REPERES EXTERIEURS AU JEU DE DONNEES.
    # Ces comptes se verifient dans n'importe quel index du Coran. C'est ce
    # controle qui a revele les fausses attributions : Yahya sortait a 35 au
    # lieu de 5. Sans lui, quarante questions fausses seraient parties en
    # ligne sans que rien ne sonne.
    REPERES = {'Adam': 25, 'Nouh': 43, 'Haroun': 20, 'Issa': 25, 'Lout': 27,
               'Yousouf': 27, 'Salih': 9, 'Yahya': 5, 'Houd': 7}
    faux = []
    for nom, attendu in REPERES.items():
        n = len(trouve.get(nom, []))
        # On tolere un ecart : le repere compte les MENTIONS, on compte les
        # VERSETS, et un verset peut nommer deux fois le meme prophete.
        if abs(n - attendu) > max(3, attendu * 0.15):
            faux.append('%s : %d versets, repere connu %d' % (nom, n, attendu))
    if faux:
        raise SystemExit('ARRET : les comptes ne retombent pas sur les reperes '
                         'connus. Ne rien publier.\n  ' + '\n  '.join(faux))
    print('  controle : %d comptes retombent sur les reperes connus.' % len(REPERES))

    absents = [n for _, n, _ in PROPHETES if n not in trouve]
    if absents:
        print('  ecartes, nom introuvable dans le texte : %s' % ', '.join(absents))
    if len(trouve) < 12:
        sys.exit('ARRET : seulement %d prophetes retrouves, c\'est trop peu.' % len(trouve))

    tous = sorted(trouve)
    questions = []

    # ---- Forme A : de quel prophete parle ce verset ? -------------------
    # On ne garde que les versets ou UN SEUL nom apparait : un verset qui en
    # cite deux n'a pas de reponse unique, et la question serait injuste.
    for nom in tous:
        candidats = []
        for (s, v) in trouve[nom]:
            dedans = [n for n in tous if (s, v) in trouve[n]]
            if len(dedans) != 1:
                continue
            fr = francais.get((s, v), '')
            if len(fr) < 40 or len(fr) > 320:
                continue
            candidats.append((s, v))
        if not candidats:
            continue
        for (s, v) in rng.sample(candidats, min(14, len(candidats))):
            leurres = F.choisir_leurres(etiquette[nom],
                                        [etiquette[n] for n in tous if n != nom], 3, rng)
            if not leurres:
                continue
            questions.append(F.question(
                qid=F.identifiant('prophetes', 'A-%d-%d' % (s, v)),
                section=SECTION,
                theme='Reconnaitre un prophete',
                surtitre='Sourate %s' % noms[s]['tr'],
                arabe=arabe[(s, v)],
                question_texte='Quel prophète ce verset mentionne-t-il ?',
                bonne=etiquette[nom],
                leurres=leurres,
                explication='Traduction du sens : « %s »' % francais[(s, v)],
                source='Coran, sourate %d, verset %d. Traduction du sens : '
                       'Muhammad Hamidullah.' % (s, v),
                difficulte=2,
                rng=rng,
            ))

    # ---- Forme B : dans quelle sourate son nom revient-il le plus ? -----
    for nom in tous:
        par_sourate = {}
        for (s, v) in trouve[nom]:
            par_sourate[s] = par_sourate.get(s, 0) + 1
        if len(par_sourate) < 4:
            continue
        classe = sorted(par_sourate, key=lambda s: -par_sourate[s])
        gagnante, n = classe[0], par_sourate[classe[0]]
        # Si deux sourates sont a egalite, la question n'a pas de reponse
        # unique : on ne la pose pas.
        if len(classe) > 1 and par_sourate[classe[1]] == n:
            continue
        autres = [noms[s]['tr'] for s in classe[1:8]]
        leurres = F.choisir_leurres(noms[gagnante]['tr'], autres, 3, rng)
        if not leurres:
            continue
        questions.append(F.question(
            qid=F.identifiant('prophetes', 'B-%s' % nom),
            section=SECTION,
            theme='Ou les trouver',
            question_texte='Dans quelle sourate le nom de %s revient-il le plus souvent ?' % nom,
            bonne=noms[gagnante]['tr'],
            leurres=leurres,
            explication='Son nom y apparaît dans %d versets, plus que dans '
                        'toute autre sourate.' % n,
            source='Compté dans le texte du Coran, sourate %s (%d).'
                   % (noms[gagnante]['tr'], gagnante),
            difficulte=3,
            rng=rng,
        ))

    # ---- Forme C : combien de fois ce nom apparait-il ? -----------------
    comptes = sorted({len(trouve[n]) for n in tous})
    for nom in tous:
        n = len(trouve[nom])
        proches = [c for c in comptes if c != n and abs(c - n) <= max(6, n // 2)]
        if len(proches) < 3:
            continue
        leurres = ['%d versets' % c for c in rng.sample(proches, 3)]
        questions.append(F.question(
            qid=F.identifiant('prophetes', 'C-%s' % nom),
            section=SECTION,
            theme='Reperes',
            question_texte='Dans combien de versets le nom de %s apparaît-il ?' % nom,
            bonne='%d versets' % n,
            leurres=leurres,
            explication='Compté sur les 6 236 versets du Coran. Les autres '
                        'propositions sont les comptes d\'autres prophètes.',
            source='Compté dans le texte du Coran.',
            difficulte=3,
            rng=rng,
        ))

    f = F.ecrire(SECTION, questions)
    par_theme = {}
    for q in questions:
        par_theme[q['theme']] = par_theme.get(q['theme'], 0) + 1
    print('  %d questions ecrites dans %s (%d prophetes retrouves)'
          % (len(questions), f.name, len(tous)))
    for k in sorted(par_theme):
        print('     %-26s %3d' % (k, par_theme[k]))


if __name__ == '__main__':
    main()
