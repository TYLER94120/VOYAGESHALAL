#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vocabulaire arabe : apprendre les mots du Coran, un par un.

POURQUOI CETTE SECTION EXISTE
-----------------------------
Le 22 aout, Mohamed a dit du site : « tres decu ». Il avait raison, et le
compte le dit mieux que moi : 744 questions sur 1 388 — 54 % — posaient la
MEME question, « Ce verset se traduit par : », avec trois traductions
d'autres versets tirees au hasard comme mauvaises reponses. On reconnait ou
on devine. On ne comprend rien, on ne retient rien, et l'explication le
disait elle-meme : « Les trois autres propositions sont des traductions
d'autres versets. »

Une bonne question fait repartir avec quelque chose qui SERT AILLEURS. Pour
le Coran, cette chose est le MOT. Qui connait « يَوْم = jour » le reconnaitra
dans 475 endroits ; qui reconnait le verset 78:8 ne sait rien de plus qu'un
verset. Le vocabulaire est ce qui se cumule.

D'OU VIENT LE SENS DES MOTS, ET POURQUOI JE NE L'INVENTE PAS
-------------------------------------------------------------
La regle de ce projet interdit d'inventer une traduction. Je n'en invente
aucune : je MESURE celles que Hamidullah emploie deja.

Pour chaque lemme du corpus morphologique, on releve les versets ou il
apparait, puis les mots francais de leurs traductions. Quand un meme mot
francais revient dans l'immense majorite de ces versets, et presque nulle
part ailleurs, la correspondance est ATTESTEE par le texte lui-meme — ce
n'est pas mon avis, c'est un comptage sur l'oeuvre du traducteur.

Quatre garde-fous, et un mot qui en rate un seul n'est pas publie :

  au moins 10 versets   sous ce seuil, une coincidence suffit ;
  p >= 0,75             le mot francais doit revenir dans les trois quarts
                        des versets, pas dans la moitie ;
  lift >= 10            il doit etre dix fois plus frequent la qu'ailleurs,
                        sinon on a trouve « dieu » ou « ceux », pas un sens ;
  marge >= 0,25         le premier mot doit se detacher nettement du second,
                        sinon on a capture une CO-OCCURRENCE : « Isaac »
                        passait avec « Jacob » parce que les deux noms
                        voyagent ensemble.

Sur 4 728 lemmes, 143 passent. C'est peu, et c'est voulu : ces 143-la sont
surs, et l'explication de chaque question montre le comptage qui les fonde.

CE QUE LA CARTE DEMANDE
-----------------------
Deux formes, et les deux font travailler le VERSET, pas la memoire :

  A. le mot est surligne dans le verset, on demande ce qu'il signifie ;
  B. on donne le sens, on demande quel mot du verset le porte.

Les mauvaises reponses de la forme B sont les AUTRES MOTS DU MEME VERSET :
il faut donc lire le verset pour repondre, ce qui est exactement le but.
"""

import collections
import json
import pathlib
import random
import re
import sys
import unicodedata

import fabrique as F

SECTION = 'vocabulaire-arabe'
CORAN = pathlib.Path(__file__).resolve().parent / 'coran'
RACINE = pathlib.Path(__file__).resolve().parent.parent

MINI_VERSETS = 10
MINI_P = 0.75
MINI_LIFT = 10.0
MINI_MARGE = 0.25
PAR_MOT = 5          # questions par mot : assez pour varier, pas pour lasser

# Les deux textes ne notent pas l'alef de la meme facon : la morphologie ecrit
# l'alef wasla et l'alef suscrit, le texte simple les ecrit en toutes lettres.
TRAD = str.maketrans({'ٱ': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٰ': 'ا',
                      'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي', 'ة': 'ه'})


def nu_ar(s):
    return ''.join(c for c in s.translate(TRAD) if 'ء' <= c <= 'ي')


def nu_fr(s):
    s = unicodedata.normalize('NFD', s)
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()


def mots_fr(t):
    """Les mots d'une traduction, ramenes a un radical de 7 lettres.

    Sept lettres suffisent a reunir « misericordieux » et « misericorde »,
    qui traduisent la meme racine, sans confondre « jour » et « journee ».
    """
    return set(w[:7] for w in re.findall(r'[a-z]{4,}', nu_fr(t)))


def charger():
    ar = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'ara-quransimple.json')
                              .read_text(encoding='utf-8'))['quran']}
    fr = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'fra-muhammadhamidul.json')
                              .read_text(encoding='utf-8'))['quran']}
    return ar, fr


def lire_morphologie():
    """Les mots du Coran : leur forme, leur lemme, leur place.

    Le corpus donne des SEGMENTS (« bi » puis « sm ») ; on les recompose en
    mots entiers, seule unite qu'on puisse surligner dans un verset.
    """
    f = CORAN / 'morphologie.txt'
    if not f.exists():
        sys.exit('ARRET : %s manquant. Le corpus morphologique est la source '
                 'des lemmes ; sans lui on ne fabrique rien.' % f.name)
    versets = collections.defaultdict(lambda: collections.defaultdict(list))
    for ligne in f.read_text(encoding='utf-8').splitlines():
        if not ligne.strip():
            continue
        ref, forme, pos, tags = ligne.split('\t')
        s, v, m, _ = (int(x) for x in ref.split(':'))
        t = tags.split('|')
        lem = next((x[4:] for x in t if x.startswith('LEM:')), None)
        versets[(s, v)][m].append({'forme': forme, 'lem': lem, 'pos': pos,
                                   'pn': 'PN' in t})
    return versets


def situer(motsTexte, entiers):
    """Apparie les mots de la morphologie a ceux du texte affiche.

    En AVANCANT : deux mots identiques dans un meme verset ne se distinguent
    que par leur ordre. Un appariement position par position les separe, la
    ou une recherche par valeur rendait les deux et forcait a jeter le verset.
    """
    out, i = {}, 0
    for m in sorted(entiers):
        cible = nu_ar(entiers[m])
        j = i
        while j < len(motsTexte) and nu_ar(motsTexte[j]) != cible:
            j += 1
        if j < len(motsTexte):
            out[m] = j
            i = j + 1
    return out


def batir_lexique(ar, fr, morpho):
    """Le lexique atteste. Chaque entree porte la preuve qui la fonde."""
    versetsDuLemme = collections.defaultdict(set)
    occurrences = collections.Counter()
    estPN = set()
    for (s, v), parMot in morpho.items():
        for m, segs in parMot.items():
            for g in segs:
                if not g['lem'] or g['pos'] not in ('N', 'V'):
                    continue
                versetsDuLemme[g['lem']].add((s, v))
                occurrences[g['lem']] += 1
                if g['pn']:
                    estPN.add(g['lem'])

    motsDuVerset = {k: mots_fr(t) for k, t in fr.items()}
    frequence = collections.Counter()
    for m in motsDuVerset.values():
        frequence.update(m)
    total = len(fr)

    # Le mot francais ENTIER, avec ses accents : le radical de sept lettres
    # sert a compter, pas a afficher. « chatime » ne se montre pas.
    entier = collections.defaultdict(collections.Counter)
    for t in fr.values():
        for w in re.findall(r"[A-Za-zÀ-ÿ']{4,}", t):
            entier[nu_fr(w)[:7]][w.lower()] += 1

    lexique, ecartes = [], collections.Counter()
    for lem, vs in versetsDuLemme.items():
        if len(vs) < MINI_VERSETS:
            ecartes['moins de %d versets' % MINI_VERSETS] += 1
            continue
        c = collections.Counter()
        for k in vs:
            c.update(motsDuVerset.get(k, ()))
        top = c.most_common(2)
        if not top:
            continue
        radical, n = top[0]
        p = n / len(vs)
        lift = p / (frequence[radical] / total) if frequence[radical] else 0
        marge = (n - top[1][1]) / len(vs) if len(top) > 1 else 1.0
        if p < MINI_P:
            ecartes['pas assez constant'] += 1; continue
        if lift < MINI_LIFT:
            ecartes['mot francais trop banal'] += 1; continue
        if marge < MINI_MARGE:
            ecartes['co-occurrence, pas un sens'] += 1; continue
        if not entier[radical]:
            ecartes['mot francais introuvable en entier'] += 1; continue

        lexique.append({
            'lemme': lem,
            'sens': entier[radical].most_common(1)[0][0],
            'occurrences': occurrences[lem],
            'versets': len(vs),
            'accord': round(p, 3),
            'nomPropre': lem in estPN,
        })
    lexique.sort(key=lambda x: -x['occurrences'])
    return lexique, ecartes


def main():
    rng = random.Random(20260822)
    ar, fr = charger()
    morpho = lire_morphologie()
    lexique, ecartes = batir_lexique(ar, fr, morpho)

    print('  %d mots attestes sur %d lemmes examines.'
          % (len(lexique), len(lexique) + sum(ecartes.values())))
    for k, v in ecartes.most_common():
        print('    ecartes : %-32s %5d' % (k, v))

    parLemme = {x['lemme']: x for x in lexique}
    sensConnus = [x['sens'] for x in lexique]

    # Ou chaque mot apparait, et a quelle place dans son verset.
    apparitions = collections.defaultdict(list)
    for (s, v), parMot in morpho.items():
        if (s, v) not in ar:
            continue
        motsTexte = ar[(s, v)].split()
        entiers = {m: ''.join(g['forme'] for g in segs) for m, segs in parMot.items()}
        place = situer(motsTexte, entiers)
        for m, segs in parMot.items():
            for g in segs:
                if g['lem'] in parLemme and m in place:
                    apparitions[g['lem']].append((s, v, place[m], motsTexte[place[m]]))
                    break

    questions = []
    for x in lexique:
        lem, sens = x['lemme'], x['sens']
        ou = apparitions.get(lem, [])
        # Des versets courts d'abord : on apprend un mot, pas on dechiffre
        # une page. Et jamais deux fois le meme verset.
        ou = sorted({(s, v, i, w) for s, v, i, w in ou},
                    key=lambda t: len(ar[(t[0], t[1])]))
        vus = set()
        choisis = []
        for s, v, i, mot in ou:
            if (s, v) in vus or len(ar[(s, v)]) < 25:
                continue
            vus.add((s, v))
            choisis.append((s, v, i, mot))
            if len(choisis) >= PAR_MOT:
                break

        autre = ou[len(choisis) % max(1, len(ou))] if ou else None
        for s, v, i, mot in choisis:
            preuve = ('Ce mot revient %d fois dans le Coran. Hamidullah le rend '
                      'par « %s » dans %d des %d versets où il apparaît.'
                      % (x['occurrences'], sens, round(x['accord'] * x['versets']),
                         x['versets']))
            if autre and (autre[0], autre[1]) != (s, v):
                preuve += ' Tu le retrouves par exemple en sourate %d, verset %d.' % (autre[0], autre[1])

            # --- Forme A : le mot est surligne, on demande son sens -------
            leurres = F.choisir_leurres(sens, [m for m in sensConnus if m != sens], 3, rng)
            if leurres:
                questions.append(F.question(
                    qid=F.identifiant('vocab', 'A-%s-%d-%d' % (lem, s, v)),
                    section=SECTION,
                    type_='vocabulaire',
                    theme='Le sens des mots',
                    surtitre='Vocabulaire · le sens des mots',
                    arabe=ar[(s, v)],
                    question_texte='Que signifie le mot en vert ?',
                    bonne=sens,
                    leurres=leurres,
                    explication=preuve,
                    source='Coran, sourate %d, verset %d. Traduction du sens : '
                           'Muhammad Hamidullah.' % (s, v),
                    difficulte=1,
                    rng=rng,
                ))
                questions[-1]['surligne'] = mot

            # --- Forme B : on donne le sens, on cherche le mot ------------
            # Les leurres sont les AUTRES MOTS DU MEME VERSET : il faut donc
            # lire le verset pour repondre, ce qui est tout l'interet.
            # Un verset repete souvent un mot, et deux mots ne different
            # parfois que par une voyelle : on ecarte tout ce qui se confond
            # avec la bonne reponse ou avec un autre leurre, sinon la question
            # a deux reponses justes.
            vusMots = {F.normaliser(mot)}
            voisins = []
            for j, w in enumerate(ar[(s, v)].split()):
                n = F.normaliser(w)
                if j == i or len(nu_ar(w)) < 3 or n in vusMots:
                    continue
                vusMots.add(n)
                voisins.append(w)
            if len(voisins) >= 3:
                questions.append(F.question(
                    qid=F.identifiant('vocab', 'B-%s-%d-%d' % (lem, s, v)),
                    section=SECTION,
                    type_='vocabulaire',
                    theme='Retrouver un mot',
                    surtitre='Vocabulaire · retrouver un mot',
                    arabe=ar[(s, v)],
                    question_texte='Dans ce verset, quel mot signifie « %s » ?' % sens,
                    bonne=mot,
                    leurres=rng.sample(voisins, 3),
                    explication=preuve,
                    source='Coran, sourate %d, verset %d. Traduction du sens : '
                           'Muhammad Hamidullah.' % (s, v),
                    difficulte=2,
                    rng=rng,
                ))

    # Le lexique est ecrit a cote des questions : il se relit, se verifie, et
    # servira le jour ou on voudra montrer « les mots que tu connais ».
    (RACINE / 'data' / 'lexique.json').write_text(
        json.dumps(lexique, ensure_ascii=False, indent=1), encoding='utf-8')

    f = F.ecrire(SECTION, questions)
    parTheme = collections.Counter(q['theme'] for q in questions)
    print('  %d questions ecrites dans %s' % (len(questions), f.name))
    for t, n in parTheme.most_common():
        print('    %-28s %4d' % (t, n))
    print('  lexique : data/lexique.json (%d mots)' % len(lexique))


if __name__ == '__main__':
    main()
