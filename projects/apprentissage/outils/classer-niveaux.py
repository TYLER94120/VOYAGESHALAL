#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Range chaque question en debutant, intermediaire ou expert.

POURQUOI CE N'ETAIT PAS DEJA FAIT
---------------------------------
Les generateurs ecrivaient bien un champ `difficulte`, mais AU JUGE : 2 ici,
3 la, selon une intuition au moment d'ecrire la boucle. Personne ne le lisait,
donc personne ne s'en apercevait. Le resultat, mesure le 21 aout : 66 questions
en 1, 477 en 2, 845 en 3 — et cinq sections sur sept sans une seule question de
niveau 1. Un mode « debutant » construit dessus aurait ouvert sur du vide.

CE QU'ON MESURE, ET POURQUOI CA VEUT DIRE QUELQUE CHOSE
-------------------------------------------------------
On ne decrete pas qu'une question est difficile : on mesure ce qui la rend
difficile, et rien qu'avec des choses observables.

  1. LA CHARGE DE LECTURE. Quatre traductions de cent trente caracteres
     demandent plus d'effort que quatre noms de sourates. On compte les
     caracteres a lire — l'arabe compte double, parce qu'un debutant le
     dechiffre lettre a lettre.

  2. LA PROXIMITE DES REPONSES. Si les trois mauvaises reponses ressemblent
     beaucoup a la bonne, il faut savoir precisement ; si elles en sont
     eloignees, on elimine de tete. C'est LA variable qui separe une question
     de reconnaissance d'une question de connaissance.

  3. LA FAMILIARITE DE LA SOURCE. Le dernier trentieme du Coran et Al-Fatiha
     sont ce qu'on apprend en premier, partout et depuis toujours. Un verset
     d'Al-Baqara ne se reconnait pas au meme stade.

  4. LA PLACE DU VERSET. Le premier verset d'une sourate se retient avant les
     suivants.

  5. POUR L'ALPHABET, la forme montree. Une lettre isolee se reconnait avant
     la meme lettre attachee au milieu d'un mot — et c'est bien pour ca que le
     generateur produit les deux.

COMMENT ON COUPE
----------------
En TIERS, DANS CHAQUE SECTION. Pas sur un seuil absolu : un seuil absolu
laisserait « Le sens des sourates » sans debutants et « Lire l'arabe » sans
experts, ce qui est exactement le defaut qu'on repare. Debutant veut donc dire
« le tiers le plus abordable de cette section », et c'est la seule promesse
qu'on peut tenir sans mentir.

Ce fichier se relance apres les generateurs, autant de fois qu'on veut : il
recalcule tout depuis les questions elles-memes.
"""

import difflib
import json
import pathlib
import re
import sys
import unicodedata

RACINE = pathlib.Path(__file__).resolve().parent.parent
DONNEES = RACINE / 'data' / 'questions'

SOURCE_CORAN = re.compile(r'Coran, sourate (\d+), verset (\d+)')

NOMS = {1: 'debutant', 2: 'intermediaire', 3: 'expert'}


def nu(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


def charge(q):
    """Ce qu'il y a a lire. L'arabe compte double."""
    a = len(q.get('arabe') or '') + len(q.get('glyphe') or '')
    f = sum(len(r) for r in q['reponses']) + len(q.get('question', ''))
    return 2 * a + f


def proximite(q):
    """A quel point les mauvaises reponses ressemblent a la bonne, de 0 a 1."""
    bonne = nu(q['reponses'][q['bonne']])
    if not bonne:
        return 0.0
    pires = []
    for i, r in enumerate(q['reponses']):
        if i == q['bonne']:
            continue
        pires.append(difflib.SequenceMatcher(None, bonne, nu(r)).ratio())
    return max(pires) if pires else 0.0


def familiarite(q):
    """1 quand la source est de celles qu'on apprend en premier, 0 sinon."""
    m = SOURCE_CORAN.search(q.get('source') or '')
    if not m:
        return 0.5          # ni connu ni inconnu : on ne penalise pas
    s, v = int(m.group(1)), int(m.group(2))
    proche = 1.0 if (s >= 78 or s == 1) else 0.0
    debut = 1.0 if v <= 3 else (0.5 if v <= 7 else 0.0)
    return 0.7 * proche + 0.3 * debut


def forme_arabe(q):
    """Pour l'alphabet : 0 si la lettre est montree seule, 1 si attachee."""
    g = q.get('glyphe') or ''
    if not g:
        return None
    c = g[0]
    d = unicodedata.decomposition(c)
    if d.startswith('<'):
        pos = d[1:].split('>', 1)[0]
        return 0.0 if pos == 'isolated' else 1.0
    return 0.0


def rangs(valeurs):
    """Chaque valeur remplacee par sa place dans la serie, entre 0 et 1.

    PAS UNE NORMALISATION MIN-MAX. Une section contient quelques reponses de
    quatre cent quarante caracteres ; rapportee a ce maximum, la charge de
    toutes les autres questions s'ecrase entre 0 et 0,2 et le facteur cesse de
    peser. Avec le rang, chaque facteur travaille sur la meme echelle et les
    poids ci-dessous veulent enfin dire ce qu'ils disent.
    """
    ordre = sorted(range(len(valeurs)), key=lambda i: valeurs[i])
    out = [0.0] * len(valeurs)
    n = max(1, len(valeurs) - 1)
    for place, i in enumerate(ordre):
        out[i] = place / n
    return out


def note(q, rCharge, rProximite):
    """Le score de difficulte, entre 0 et 1. Plus haut = plus dur.

    Les poids : ce qu'on connait deja pese le plus, parce que c'est ce qui
    decide vraiment si une question est abordable quand on demarre. Vient
    ensuite la finesse a avoir entre les reponses, puis ce qu'il y a a lire.
    """
    n = 0.0
    n += 0.35 * (1.0 - familiarite(q))   # l'eloignement de ce qu'on apprend en premier
    n += 0.30 * rProximite               # la finesse a avoir entre les reponses
    n += 0.25 * rCharge                  # ce qu'il y a a lire

    f = forme_arabe(q)
    n += 0.10 * (f if f is not None else rCharge)
    return n


def traduction(q):
    """Cette question demande-t-elle de traduire ?

    Decision de Mohamed, le 22 aout : « arrete avec les traductions, trop
    complique ». Traduire un verset entier, ou reconnaitre un mot au milieu
    d'un verset, demande de LIRE l'arabe couramment. C'est une competence
    d'arrivee, pas de depart. Ces questions restent — elles ne sont pas
    fausses, elles sont difficiles — mais au niveau expert seulement, ou
    personne ne les rencontre par accident.
    """
    if q.get('type') == 'vocabulaire':
        return True
    t = q.get('question', '')
    return (t.startswith('Ce verset se traduit par')
            or 'comment ce verset continue-t-il' in t)


def classer(questions):
    """Range les questions d'UNE section en trois tiers.

    Les questions de traduction sont mises d'office en expert ; les autres se
    repartissent entre les trois niveaux selon leur score. Une section peut
    donc n'avoir aucun debutant : c'est le cas du « sens des sourates », qui
    n'est fait que de traductions. Mieux vaut le dire que de faire passer une
    traduction de verset pour une question de depart.
    """
    if not questions:
        return {}
    # LES QUESTIONS DE PRATIQUE SONT DES QUESTIONS DE DEPART, TOUTES.
    # Les repartir en trois les eparpillerait : six questions deviendraient
    # deux par niveau, et aucun niveau ne serait jouable. Elles sont simples
    # par construction — francais court, aucun arabe a lire — et c'est
    # exactement ce qu'on cherchait en debutant.
    niveaux = {}
    simples = []
    for q in questions:
        if q.get('type') == 'pratique':
            niveaux[q['id']] = 1
        elif traduction(q):
            niveaux[q['id']] = 3
        else:
            simples.append(q)

    if not simples:
        return niveaux, (0, 0), 0, 0

    rc = rangs([charge(q) for q in simples])
    rp = rangs([proximite(q) for q in simples])
    notes = sorted((note(q, rc[i], rp[i]), q['id']) for i, q in enumerate(simples))

    n = len(notes)
    seuils = (notes[n // 3][0], notes[2 * n // 3][0])
    for score, qid in notes:
        niveaux[qid] = 1 if score < seuils[0] else (2 if score < seuils[1] else 3)
    return niveaux, seuils, notes[0][0], notes[-1][0]


def main():
    fichiers = sorted(DONNEES.glob('*.json'))
    if not fichiers:
        sys.exit('ARRET : aucune banque de questions.')

    print('%-24s %6s   %s' % ('section', 'total', 'debutant / intermediaire / expert'))
    total = 0
    for f in fichiers:
        qs = json.loads(f.read_text(encoding='utf-8'))
        if not qs:
            continue
        niveaux, seuils, bas, haut = classer(qs)
        compte = {1: 0, 2: 0, 3: 0}
        for q in qs:
            q['niveau'] = niveaux[q['id']]
            compte[q['niveau']] += 1
        f.write_text(json.dumps(qs, ensure_ascii=False, indent=1), encoding='utf-8')
        total += len(qs)
        print('%-24s %6d   %4d / %4d / %4d      (scores %.2f a %.2f)'
              % (f.stem, len(qs), compte[1], compte[2], compte[3], bas, haut))

    # CE QUI DOIT ETRE VRAI APRES COUP. Un mode qui ouvre sur rien est pire
    # que pas de mode du tout : on refuse le lot plutot que de le livrer.
    # CE QU'ON EXIGE, ET CE QU'ON SE CONTENTE DE DIRE.
    # Une section peut legitimement n'avoir aucun debutant : « Le sens des
    # sourates » n'est fait que de traductions, et les mettre en debutant
    # serait mentir sur leur difficulte. On le SIGNALE — l'ecran de reglages
    # grise les niveaux vides — mais on ne refuse plus le lot pour ca.
    # En revanche, une section sans AUCUN niveau jouable est une section
    # cassee, et celle-la on la refuse.
    fautes, maigres = [], []
    for f in fichiers:
        qs = json.loads(f.read_text(encoding='utf-8'))
        if not qs:
            continue
        pleins = 0
        for n in (1, 2, 3):
            combien = sum(1 for q in qs if q.get('niveau') == n)
            if combien >= 20:
                pleins += 1
            elif combien:
                maigres.append('%s : %d question(s) en %s' % (f.stem, combien, NOMS[n]))
        if not any(sum(1 for q in qs if q.get('niveau') == n) for n in (1, 2, 3)):
            fautes.append('%s n\'a aucune question rangee' % f.stem)
    if maigres:
        print('\n  Niveaux trop maigres pour un QCM de 20 (ils seront grises) :')
        for x in maigres:
            print('    ' + x)
    if fautes:
        print('')
        for x in fautes:
            print('  FAUTE : ' + x)
        sys.exit(1)
    print('\n  %d questions rangees. Chaque section tient les trois niveaux.' % total)


if __name__ == '__main__':
    main()
