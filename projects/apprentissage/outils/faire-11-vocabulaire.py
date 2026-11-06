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

Quatre garde-fous CHIFFRES, et un mot qui en rate un seul n'est pas publie :

  au moins 10 versets   sous ce seuil, une coincidence suffit ;
  p >= 0,75             le mot francais doit revenir dans les trois quarts
                        des versets, pas dans la moitie ;
  lift >= 10            il doit etre dix fois plus frequent la qu'ailleurs,
                        sinon on a trouve « dieu » ou « ceux », pas un sens ;
  marge >= 0,25         le premier mot doit se detacher nettement du second,
                        sinon on a capture une CO-OCCURRENCE : « Isaac »
                        passait avec « Jacob » parce que les deux noms
                        voyagent ensemble.

Ces quatre-la ne mesurent qu'une chose : la CONSTANCE du traducteur. Deux
garde-fous de plus disent ce qu'ils ne peuvent pas voir — le cinquieme
refuse le sens pris au lemme voisin, le sixieme refuse une glose qui est un
mot-outil du francais. Le second a trouve, le 4 novembre, deux entrees a
l'accord parfait dont la glose etait « plus ».

C'est peu de mots qui passent, et c'est voulu : ceux-la sont surs, et
l'explication de chaque question montre le comptage qui les fonde.

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

# ==========================================================================
# LE SIXIEME GARDE-FOU — AJOUTE LE 4 NOVEMBRE
#
# CE QUE LA MESURE A TROUVE, ET C'ETAIT EN LIGNE DEPUIS LE 22 AOUT
# ----------------------------------------------------------------
# Dix-neuf cartes de cette section enseignaient que أَشَدّ et أَقْرَب signifient
# « plus ». Ce sont deux elatifs : « plus fort », « plus proche ». Une carte
# surlignait الْأَقْرَبِينَ — les proches parents — et attendait « plus ».
#
# POURQUOI LES QUATRE PREMIERS GARDE-FOUS LAISSENT PASSER CELA
# -----------------------------------------------------------
# أَشَدّ a un accord de 1,000 : Hamidullah ecrit « plus » dans TOUS ses
# versets. L'alignement est parfait et la glose est vide. Seuil, lift et
# marge mesurent la constance du traducteur ; aucun ne demande si le mot
# francais porte un sens a lui seul.
#
# En francais le comparatif se fabrique avec « plus » devant un adjectif ;
# l'arabe le porte dans la forme du mot. L'alignement ne pouvait donc capter
# que le marqueur. Et le plancher de quatre lettres du releve laisse passer
# « plus » tout juste — « et », « de », « la » n'y arrivent pas.
#
# POURQUOI LA LISTE EST COURTE
# ----------------------------
# Mesure faite AVANT de l'ecrire : أَجْمَع publie « tous », une entree
# legitime qu'une liste de determinants aurait detruite ; بَيْن « entre » et
# بَعْد « apres » sont des NOMS dans le corpus, et une glose prepositionnelle
# serait pour eux un vrai sens. On ne retient donc que les mots qui ne
# portent aucun sens lexical seuls. Sur 140 entrees, cette liste en refuse
# DEUX.
#
# ON REFUSE LE LEMME, ON NE CHERCHE PAS SON DEUXIEME MOT. Le deuxieme mot
# francais le plus frequent dans les versets de أَشَدّ serait un choix de
# traduction, et ce projet n'en fait aucun — meme regle que le cinquieme
# garde-fou.
# ==========================================================================
MOTS_OUTILS = {
    'plus', 'moins', 'tres', 'trop', 'assez', 'autant', 'davantage',
    'tellement', 'aussi', 'encore', 'ainsi', 'alors', 'donc', 'puis',
    'cela', 'ceux', 'celui', 'celle', 'celles', 'cette', 'quoi',
    'dont', 'lequel', 'laquelle', 'pourquoi', 'comment', 'lorsque',
    'puisque', 'parce', 'quand', 'meme', 'memes',
}

# ==========================================================================
# LE SEPTIEME GARDE-FOU — AJOUTE LE 5 NOVEMBRE
#
# CE QUE LA RONDE DU 4 NOVEMBRE AVAIT LAISSE OUVERT
# -------------------------------------------------
# Le sixieme garde-fou a retire أَشَدّ et أَقْرَب, dont la glose etait « plus ».
# La meme mesure avait mis en evidence أَدْرَى, glose « dira » : 6 cartes et
# 17 explications en ligne. Ce n'est pas un mot-outil, et son accord de 0,765
# passe le seuil. Le compte rendu de ce soir-la disait qu'une regle « une
# glose attestee surtout par une formule repetee n'est pas un sens » devrait
# d'abord etre MESUREE contre les 138 entrees. C'est fait.
#
# L'EPISTEMOLOGIE, EN UNE PHRASE
# ------------------------------
# Si un mot n'apparait que dans une seule tournure, on ne peut pas distinguer
# « ce mot veut dire X » de « cette tournure se traduit comme ca ». Les
# versets de أَدْرَى sont tous « et qui te DIRA ce qu'est... » : on apprend
# comment Hamidullah rend la formule, pas ce que porte le mot.
#
# LA MESURE, ET LE TROU QUI DONNE LE SEUIL
# ----------------------------------------
# Pour chaque entree : les versets ou le mot francais de la glose apparait,
# puis les TROIS MOTS QUI LE PRECEDENT. Si un meme contexte revient dans la
# plupart de ces versets, l'attestation tient a une formule.
#
#   أَعْلَن   « divulguent »  6/6  apres « ce qu ils »    100 %
#   أَدْرَى   « dira »       12/13 apres « et qui te »     92 %
#   ------------------------------------------------ le trou -----
#   وِزْر     « fardeau »     4/7  apres « ne portera le »  57 %
#   صادِق     « veridiques » 26/51 apres « si vous etes »   51 %
#   قَمَر     « lune »       13/26 apres « soleil et la »   50 %
#
# Entre 92 % et 57 % il n'y a RIEN. Tout seuil pose dans ce trou refuse les
# deux memes entrees — mesure faite a 60, 75, 80 et 90 %. A 50 % on perdrait
# « lune » et « veridiques », deux gloses manifestement justes : c'est la
# preuve que le seuil ne doit pas descendre.
#
# 0,75 est pris parce qu'il est au milieu du trou, et parce que c'est deja le
# chiffre de MINI_P et de DEPENDANCE_MAXI — un seuil de plus, pas une
# troisieme valeur a retenir.
#
# CE QUE CETTE REGLE NE DIT PAS
# -----------------------------
# Elle ne dit pas que la glose est FAUSSE. « divulguent » pour أَعْلَن est
# probablement juste. Elle dit que la MESURE n'etablit pas un sens de mot :
# c'est le troisieme etat, « non verifie », et le projet ne publie pas ce
# qu'il n'a pas verifie. On refuse l'entree, on ne la corrige pas.
#
# L'APOSTROPHE SEPARE LES MOTS, ET C'EST UNE MESURE FAUSSE DE PLUS
# ---------------------------------------------------------------
# Ma premiere sonde gardait l'apostrophe dans le mot : « l'enfer » ne
# correspondait donc pas a « enfer », et DEUX entrees sur 138 comptaient zero
# verset attestant alors qu'elles en ont 77 et 9 (جَهَنَّم « enfer »,
# طِين « argile »). Corrige : 137 entrees sur 138 sont mesurables.
# ==========================================================================
CONCENTRATION_MAXI = 0.75
MINI_ATTESTANTS = 5


def mots_entiers(t):
    """Les mots d'une traduction, entiers. L'APOSTROPHE SEPARE."""
    return [m for m in re.split(r'[^a-z0-9]+', nu_fr(t or '')) if m]


def concentration(sens, versets, fr):
    """(part du contexte le plus frequent, nombre de versets attestants).

    Le contexte est les trois mots qui precedent la glose. Une part elevee
    veut dire que la glose ne s'atteste que dans une tournure.
    """
    cible = mots_entiers(sens)
    cible = cible[-1] if cible else ''
    contextes = collections.Counter()
    attestants = 0
    for k in sorted(versets):
        ms = mots_entiers(fr.get(k, ''))
        ou = [i for i, m in enumerate(ms) if m == cible]
        if not ou:
            continue
        attestants += 1
        i = ou[0]
        contextes[' '.join(ms[max(0, i - 3):i])] += 1
    if attestants < MINI_ATTESTANTS:
        return None, attestants
    return contextes.most_common(1)[0][1] / attestants, attestants

# ==========================================================================
# LE CINQUIEME GARDE-FOU — AJOUTE LE 26 OCTOBRE
#
# CE QUE LA MESURE A TROUVE, ET C'ETAIT EN LIGNE
# ----------------------------------------------
# Cinq cartes de cette section surlignaient إِنس — « les hommes », le mot
# que le Coran met en face des djinns — et donnaient pour bonne reponse
# « djinns ». Sourate 51 verset 56 : « Je n'ai cree les djinns et les hommes
# que pour qu'ils M'adorent. » Le mot en vert etait « les hommes ».
#
# LE MECANISME, MESURE, SANS AUCUN JUGEMENT DE TRADUCTION
# ------------------------------------------------------
# إِنس est dans 17 versets. Les candidats francais, comptes sur radical de
# sept lettres :
#
#     djinns   n=15  p=0,882  lift=203,8
#     hommes   n=10  p=0,588  lift= 34,3
#     marge retenue : (15-10)/17 = 0,294  >  0,25  ->  ACCEPTE
#
# Or « homme ou humain » est dans 17 versets sur 17. Hamidullah alterne
# « hommes » et « humains », et le radical de sept lettres en fait DEUX mots
# differents : le bon sens est coupe en deux, chaque moitie perd, et le mot
# du lemme voisin — « djinns », jamais divise, jamais banal — gagne.
#
# Les quatre garde-fous ont tous fonctionne comme ecrit. C'est leur
# interaction qui retourne le resultat : le vote du bon sens est divise, et
# MINI_MARGE compare alors le gagnant a une moitie. Si les deux formes
# etaient comptees ensemble, la marge tomberait a (17-15)/17 = 0,118 et
# MINI_MARGE aurait REFUSE l'entree — ce qui est le bon resultat : ce lemme
# n'est pas attestable par cette methode.
#
# CE QUE CE GARDE-FOU FAIT, ET CE QU'IL NE FAIT PAS
# -------------------------------------------------
# Il REFUSE. Il ne corrige aucun sens, il n'en choisit aucun : choisir la
# traduction francaise d'un mot du Coran n'est pas le travail d'un outil.
# La regle du projet dit « en cas de doute sur une source : ne pas la
# publier ». C'est exactement cela, applique.
#
# La regle : un lemme est refuse si un AUTRE lemme du lexique porte le MEME
# sens, apparait dans au moins 75 % de ses versets, et tient sur plus de
# versets que lui. Celui qui ne se montre presque jamais seul est celui qui
# a pris le mot de son voisin.
#
# LE SEUIL EST POSE DANS UN ECART MESURE, ET IL FAUT LE DIRE. Les
# dependances observees le 26 octobre sont 87 %, 82 %, 82 %, 71 %, 64 %. La
# ligne tombe entre 82 et 71. Elle ecarte إِنس (82 %), أَفْسَدُ (87 %) et
# فَساد (82 %, « terre » pris a أَرْض dans « corruption sur la terre ») et
# laisse جِنّ (64 %) et مُؤْمِنَة (71 %). Un seuil pose dans un ecart de
# onze points sur cinq cas n'est pas une loi : c'est une borne prudente.
DEPENDANCE_MAXI = 0.75

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
    # ET SA CASSE. Le `.lower()` ci-dessous ecrasait les majuscules, et le
    # lexique publiait « moïse », « abraham », « coran ». Mesure du 3 octobre :
    # 371 occurrences dans le site, dont 214 sur des BOUTONS DE REPONSE — on
    # appuyait sur « moïse » pour repondre juste. Sur un site qui enseigne le
    # Coran, au nom de Mohamed.
    #
    # On ne decide pas nous-memes ce qui est un nom propre : on suit le
    # traducteur. Pour chaque mot, on compte comment Hamidullah l'ecrit AU
    # MILIEU d'une phrase — une majuscule en debut de phrase ne prouve rien.
    #
    # Et on n'applique la majuscule que s'il ne l'omet JAMAIS, sur au moins
    # cinq occurrences. La mesure dit pourquoi cette severite :
    #
    #   Moïse 151 / 0   Coran 153 / 0   Pharaon 79 / 0   Abraham 45 / 0
    #   Diable 63 / 8          <- il hesite, on laisse « diable »
    #   Jardins 42 / 39        <- « jardins » est un nom commun, on y touche pas
    #   Enfer   1 / 0          <- une seule occurrence ne prouve rien
    #
    # Une regle « la majorite l'emporte » aurait capitalise « Jardins ». Le
    # corpus marque pourtant son lemme comme nom propre : c'est la preuve que
    # ce drapeau-la ne suffit pas, et qu'il fallait aller voir le francais.
    casse = collections.defaultdict(collections.Counter)
    for t in fr.values():
        for m in re.finditer(r"[A-Za-zÀ-ÿ']{4,}", t):
            w = m.group(0)
            entier[nu_fr(w)[:7]][w.lower()] += 1
            avant = t[:m.start()].rstrip()
            if avant and avant[-1] not in '.!?»:':
                casse[w.lower()][w] += 1

    def forme_affichee(mot):
        """Le mot tel que Hamidullah l'ecrit, quand il est categorique."""
        vues = casse.get(mot)
        if not vues or sum(vues.values()) < 5:
            return mot
        majuscules = {w: n for w, n in vues.items() if w[:1].isupper()}
        if not majuscules or sum(n for w, n in vues.items() if w[:1].islower()):
            return mot
        return max(majuscules, key=majuscules.get)

    lexique, ecartes = [], collections.Counter()
    # Les entrees GARDEES que la mesure n'a pas pu juger. Un compte separe :
    # ce ne sont pas des rejets, c'est le troisieme etat rendu visible.
    ecartes_mous = collections.Counter()
    for lem, vs in versetsDuLemme.items():
        if len(vs) < MINI_VERSETS:
            ecartes['moins de %d versets' % MINI_VERSETS] += 1
            continue
        c = collections.Counter()
        for k in vs:
            c.update(motsDuVerset.get(k, ()))
        # A EGALITE, `most_common` suit l'ordre d'insertion — donc l'ordre
        # d'un `set`, donc le hachage du processus. Mesure du 27 octobre :
        # quatre passages donnaient le MEME lexique et la MEME banque, mais
        # des motifs de rejet qui bougeaient (106, 108, 107, 109
        # « co-occurrence » contre 66, 64, 65, 63 « trop banal »). Aucun
        # lemme ne passait d'accepte a refuse — seule la RAISON changeait.
        # Un diagnostic qui bouge sans raison fait douter du reste : le tri
        # departage maintenant par le mot lui-meme.
        top = sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))[:2]
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

        # LA FORME AFFICHEE SE PREND DANS LES VERSETS DU MOT, PAS AILLEURS
        # MESURE DU 27 OCTOBRE
        #
        # L'attestation se mesure sur les versets du lemme — c'est tout
        # l'interet de la methode. Mais la FORME ENTIERE affichee etait prise
        # dans `entier`, un comptage fait sur LE CORAN TOUT ENTIER. Le mot
        # publie pouvait donc etre une forme qu'Hamidullah n'ecrit JAMAIS
        # pour ce mot-la.
        #
        # 21 entrees sur 140 etaient dans ce cas, et cinq publiaient un mot
        # absent a 100 % de leurs propres versets :
        #
        #   مُحْسِن    « bienfaits »    -> localement : bienfaisants 32, zero « bienfaits »
        #   ذُرِّيَّة  « descendre »    -> descendance 17, descendants 11, zero « descendre »
        #   شَفِيع     « intercession » -> intercesseurs 6, intercesseur 5, zero « intercession »
        #   صاحِب      « compagnie »    -> compagnon 7, compagnons 2, zero « compagnie »
        #   رَحْمَة    « misericordieux »-> misericorde 108 contre misericordieux 9
        #
        # « descendre » et « descendance » partagent le radical de sept
        # lettres ; « intercession » et « intercesseur » aussi. Le radical
        # sert a COMPTER, il ne doit pas servir a CHOISIR.
        #
        # Ce n'est pas choisir une traduction : c'est restreindre le choix
        # aux mots que le traducteur a ecrits POUR CE MOT. La capitalisation
        # reste decidee par `forme_affichee`, sur tout le corpus — la lecon
        # du 3 octobre sur « moise » n'est pas touchee.
        #
        # Le tri departage a egalite par ordre alphabetique : sans cela
        # l'ordre d'un `set` reviendrait, et avec lui la banque qui change a
        # chaque passage (mesure du 26 octobre).
        local = collections.Counter()
        for k in sorted(vs):
            for mm in re.finditer(r"[A-Za-zÀ-ÿ']{4,}", fr[k]):
                w = mm.group(0)
                if nu_fr(w)[:7] == radical:
                    local[w.lower()] += 1
        choix = max(sorted(local.items()), key=lambda kv: kv[1])[0] if local \
            else entier[radical].most_common(1)[0][0]

        # SIXIEME GARDE-FOU : un mot-outil n'est pas un sens. Voir l'en-tete
        # de MOTS_OUTILS. On teste la forme AFFICHEE, celle que la carte
        # montrera, et non le radical qui a servi a compter.
        if nu_fr(forme_affichee(choix)) in MOTS_OUTILS:
            ecartes['mot-outil, pas un sens'] += 1; continue

        # SEPTIEME GARDE-FOU : la glose attestee par une seule tournure.
        # Voir l'en-tete de CONCENTRATION_MAXI.
        part, attestants = concentration(forme_affichee(choix), vs, fr)
        if part is not None and part >= CONCENTRATION_MAXI:
            ecartes['glose attestee par une formule'] += 1; continue
        if part is None:
            ecartes_mous['forme affichee attestee par moins de %d versets'
                         % MINI_ATTESTANTS] += 1

        lexique.append({
            'lemme': lem,
            'sens': forme_affichee(choix),
            'occurrences': occurrences[lem],
            'versets': len(vs),
            'accord': round(p, 3),
            'nomPropre': lem in estPN,
        })
    # Cinquieme garde-fou : le sens pris au lemme voisin. Voir l'en-tete de
    # DEPENDANCE_MAXI — on refuse, on ne corrige pas.
    parSens = collections.defaultdict(list)
    for x in lexique:
        parSens[x['sens']].append(x)
    refuses = set()
    for x in lexique:
        va = versetsDuLemme[x['lemme']]
        for autre in parSens[x['sens']]:
            if autre['lemme'] == x['lemme']:
                continue
            vb = versetsDuLemme[autre['lemme']]
            if len(vb) <= len(va):
                continue
            if len(va & vb) / len(va) >= DEPENDANCE_MAXI:
                refuses.add(x['lemme'])
                ecartes['sens pris au lemme voisin'] += 1
                print('    REFUSE : %s -> « %s ». %s porte le meme sens et '
                      'figure dans %.0f %% de ses %d versets.'
                      % (x['lemme'], x['sens'], autre['lemme'],
                         100 * len(va & vb) / len(va), len(va)))
                break
    lexique = [x for x in lexique if x['lemme'] not in refuses]
    lexique.sort(key=lambda x: -x['occurrences'])
    return lexique, ecartes, ecartes_mous


def main():
    rng = random.Random(20260822)
    ar, fr = charger()
    morpho = lire_morphologie()
    lexique, ecartes, ecartes_mous = batir_lexique(ar, fr, morpho)

    print('  %d mots attestes sur %d lemmes examines.'
          % (len(lexique), len(lexique) + sum(ecartes.values())))
    for k, v in ecartes.most_common():
        print('    ecartes : %-32s %5d' % (k, v))
    # GARDEES mais non jugees : le chiffre est imprime, pas tu.
    for k, v in ecartes_mous.most_common():
        print('    gardees, non mesurables : %-20s %5d' % (k, v))

    parLemme = {x['lemme']: x for x in lexique}
    sensConnus = [x['sens'] for x in lexique]

    # Ou chaque mot apparait, et a quelle place dans son verset.
    # Et AUSSI : quels lemmes porte chaque place. Sans cela, un leurre de la
    # forme B peut etre une autre forme du mot demande — voir plus bas.
    apparitions = collections.defaultdict(list)
    lemmesALaPlace = collections.defaultdict(lambda: collections.defaultdict(set))
    for (s, v), parMot in morpho.items():
        if (s, v) not in ar:
            continue
        motsTexte = ar[(s, v)].split()
        entiers = {m: ''.join(g['forme'] for g in segs) for m, segs in parMot.items()}
        place = situer(motsTexte, entiers)
        for m, segs in parMot.items():
            if m in place:
                for g in segs:
                    if g['lem']:
                        lemmesALaPlace[(s, v)][place[m]].add(g['lem'])
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
        # LE TRI DOIT ETRE TOTAL, ET IL NE L'ETAIT PAS — MESURE DU 26 OCTOBRE
        #
        # Trier un ENSEMBLE sur la seule longueur du verset laisse les
        # ex aequo dans l'ordre du `set`, et cet ordre depend du hachage des
        # chaines, qui change A CHAQUE PROCESSUS. Trois lancements du
        # generateur sans rien changer donnaient trois banques differentes :
        #
        #     passage 1  0b5038c4…      passage 2  8444b272…
        #     passage 3  aeec5d91…      et le compte variait : 1 217, 1 216
        #
        # Le lexique, lui, etait stable aux trois passages. Le hasard etait
        # dans le CHOIX DES VERSETS : on en garde cinq par mot, et les cinq
        # n'etaient pas les memes. Consequence serieuse : le nombre de
        # questions que l'accueil annonce bougeait a chaque regeneration,
        # sans qu'aucune donnee ait change.
        #
        # Le numero de sourate et de verset rendent le tri total. Ce n'est
        # pas une regle nouvelle — c'est la meme regle, appliquee de facon
        # reproductible. `faire-sitemap.py` a ete rendu idempotent le
        # 8 octobre pour exactement cette raison.
        ou = sorted({(s, v, i, w) for s, v, i, w in ou},
                    key=lambda t: (len(ar[(t[0], t[1])]), t[0], t[1], t[2]))
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
            # LE GARDE-FOU DE LA FORME DE SURFACE NE SUFFIT PAS.
            # MESURE DU 28 OCTOBRE
            #
            # On ecartait les mots dont la forme NORMALISEE egale la bonne
            # reponse. Mais un verset reprend souvent le MEME MOT sous une
            # autre flexion, et la flexion change la forme :
            #
            #   54:46  « quel mot signifie heure ? »  bonne السَّاعَةُ
            #          leurre وَالسَّاعَةُ — le meme mot, avec le « et »
            #   21:92  « communaute »  bonne أُمَّتُكُمْ  leurre أُمَّةً
            #   61:8   « lumiere »     bonne نُورَ        leurre نُورِهِ
            #   4:49   « purifie »     bonne يُزَكُّونَ   leurre يُزَكِّي
            #
            # Quatre cartes sur 544 : la personne repondait JUSTE et le jeu
            # lui disait non. Le controle appelle cela « le defaut le plus
            # injuste possible », et il avait raison.
            #
            # La bonne unite n'est pas la forme, c'est LE LEMME : toute forme
            # du mot demande signifie ce qu'on demande. On ecarte donc toute
            # place du verset qui porte ce lemme.
            vusMots = {F.normaliser(mot)}
            voisins = []
            for j, w in enumerate(ar[(s, v)].split()):
                n = F.normaliser(w)
                if j == i or len(nu_ar(w)) < 3 or n in vusMots:
                    continue
                if lem in lemmesALaPlace[(s, v)].get(j, ()):
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
    # LE LEXIQUE N'EST PAS UNE DONNEE DU SITE, C'EST UNE DONNEE D'OUTIL.
    # Mesure du 19 octobre : sur les 53 pages et tous les ecrans de jeu,
    # AUCUNE page ne telecharge ce fichier. Il est lu par deux generateurs —
    # enrichir-explications.py et faire-questions-claude.py — au moment de la
    # fabrication, jamais par un navigateur. Pose dans data/, il partait donc
    # en production : 19 Ko publies pour personne, et surtout un fichier qui
    # avait l'air d'etre une donnee du site sans en etre une.
    # data/ veut dire « ce que le site telecharge ». Celui-ci va dans outils/.
    (RACINE / 'outils' / 'lexique.json').write_text(
        json.dumps(lexique, ensure_ascii=False, indent=1), encoding='utf-8')

    f = F.ecrire(SECTION, questions)
    parTheme = collections.Counter(q['theme'] for q in questions)
    print('  %d questions ecrites dans %s' % (len(questions), f.name))
    for t, n in parTheme.most_common():
        print('    %-28s %4d' % (t, n))
    print('  lexique : outils/lexique.json (%d mots)' % len(lexique))


if __name__ == '__main__':
    main()
