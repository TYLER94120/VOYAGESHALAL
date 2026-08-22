#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les bases de la pratique, telles que le Coran les enonce.

POURQUOI CES QUESTIONS-LA
-------------------------
Mohamed, le 22 aout : « arrete avec les traductions, trop complique », puis,
au choix des types de question : « les bases de la pratique ». C'est ce qu'un
debutant veut vraiment savoir — ce qu'on lave avant de prier, quel mois on
jeune, a qui va l'aumone — et c'est ce que le site ne demandait nulle part.

Ces questions ne demandent PAS de lire l'arabe. La question est en francais,
les quatre reponses sont en francais, et elles sont courtes. Le verset
n'apparait que dans l'explication, comme preuve.

CE QUE JE PEUX SOURCER, ET CE QUE JE NE PEUX PAS
------------------------------------------------
Beaucoup de la pratique est DANS LE CORAN, et j'ai la traduction de
Hamidullah : les ablutions (5:6), le mois du jeune (2:185), la direction de
la priere (2:144), les destinataires de l'aumone (9:60), le pelerinage
(3:97, 2:196-197), les interdits alimentaires (2:173), le comportement
(49:11-12, 17:23). Tout cela se cite.

Ce qui n'y est PAS : le nombre de rakats par priere, les noms des cinq
prieres, la liste des cinq piliers telle qu'on l'enonce. Cela vient de
hadiths, et je n'ai aucune traduction francaise sourcee. Ces questions-la ne
sont pas ecrites — pas approximees, pas devinees : absentes, et signalees.

CE QUI EMPECHE DE ME TROMPER
----------------------------
Chaque question porte des MOTS-CLES, et l'outil verifie qu'ils figurent tous
dans la traduction du verset cite. Si j'attribue a un verset une chose qu'il
ne dit pas, le lot entier est refuse — pas la question seule, le lot entier,
parce qu'une erreur d'attribution veut dire que je me suis relu trop vite.

On verifie aussi qu'AUCUNE mauvaise reponse n'est, elle aussi, dans le
verset : ce serait la faute la plus injuste, repondre vrai et s'entendre dire
non.
"""

import json
import pathlib
import random
import re
import sys
import unicodedata

import fabrique as F

CORAN = pathlib.Path(__file__).resolve().parent / 'coran'

# (section, theme, question, bonne, leurres, (sourate, verset), mots-cles)
#
# Les mots-cles sont ce qui doit se lire DANS le verset. Ils sont la pour que
# la machine puisse me contredire.
Q = [
 # ---- La foi ---------------------------------------------------------
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Combien de mois compte l\'année, selon le Coran ?',
  'Douze', ['Dix', 'Quatorze', 'Sept'], (9, 36), ['douze']),
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Sur les douze mois de l\'année, combien sont sacrés ?',
  'Quatre', ['Deux', 'Trois', 'Six'], (9, 36), ['quatre', 'sacrés']),
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Dans la sourate Al-Ikhlas, comment Allah est-il nommé ?',
  'Unique', ['Éternel', 'Puissant', 'Créateur'], (112, 1), ['unique']),
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Selon le verset du Trône, qu\'est-ce qui ne saisit jamais Allah ?',
  'Ni somnolence ni sommeil', ['Ni la faim ni la soif', 'Ni l\'oubli ni l\'erreur',
   'Ni la fatigue ni la peine'], (2, 255), ['somnolence', 'sommeil']),
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Quel a été le premier mot révélé du Coran ?',
  'Lis', ['Crois', 'Prie', 'Écoute'], (96, 1), ['lis']),
 ('piliers-de-la-foi', 'Ce que dit le Coran',
  'Quelle charge Allah impose-t-il à une âme ?',
  'Rien au-delà de sa capacité', ['Toujours la même à tous',
   'Toujours plus qu\'elle ne peut', 'Aucune charge'], (2, 286), ['capacité']),

 # ---- La priere -------------------------------------------------------
 ('la-priere', 'Les ablutions',
  'Avant la Salât, que faut-il laver en premier ?',
  'Le visage', ['Les cheveux', 'La bouche', 'Les oreilles'], (5, 6), ['visages', 'lavez']),
 ('la-priere', 'Les ablutions',
  'Jusqu\'où lave-t-on les mains ?',
  'Jusqu\'aux coudes', ['Jusqu\'aux poignets', 'Jusqu\'aux épaules',
   'Jusqu\'au bout des doigts'], (5, 6), ['coudes']),
 ('la-priere', 'Les ablutions',
  'Jusqu\'où lave-t-on les pieds ?',
  'Jusqu\'aux chevilles', ['Jusqu\'aux genoux', 'Jusqu\'aux mollets',
   'Jusqu\'au bout des orteils'], (5, 6), ['chevilles']),
 ('la-priere', 'Les ablutions',
  'Sur quoi passe-t-on les mains mouillées ?',
  'Sur la tête', ['Sur la nuque', 'Sur les épaules', 'Sur les yeux'], (5, 6), ['têtes']),
 ('la-priere', 'Les ablutions',
  'Quand on ne trouve pas d\'eau, à quoi recourt-on ?',
  'À la terre pure', ['Au sable brûlant', 'À l\'eau de mer', 'À rien du tout'],
  (5, 6), ['terre pure']),
 ('la-priere', 'La direction et le moment',
  'Vers quoi tourne-t-on son visage pour prier ?',
  'Vers la Mosquée sacrée', ['Vers le levant', 'Vers Jérusalem', 'Vers le nord'],
  (2, 144), ['mosquée sacrée']),
 ('la-priere', 'La direction et le moment',
  'Quel jour le Coran mentionne-t-il un appel à la Salât ?',
  'Le vendredi', ['Le lundi', 'Le samedi', 'Le jeudi'], (62, 9), ['vendredi']),
 ('la-priere', 'La direction et le moment',
  'Quand on appelle à la Salât du vendredi, que faut-il laisser ?',
  'Tout négoce', ['Tout repas', 'Tout voyage', 'Toute parole'], (62, 9), ['négoce']),
 ('la-priere', 'La direction et le moment',
  'Quelle Salât le Coran distingue-t-il des autres ?',
  'La Salât médiane', ['La Salât de l\'aube', 'La Salât du soir',
   'La dernière Salât'], (2, 238), ['médiane']),
 ('la-priere', 'La direction et le moment',
  'Entre quels moments de la journée le Coran situe-t-il la Salât ?',
  'Du déclin du soleil à l\'obscurité de la nuit', ['De l\'aube à midi',
   'Du matin au soir', 'De minuit à l\'aube'], (17, 78), ['déclin', 'obscurité']),

 # ---- Le jeune --------------------------------------------------------
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'Pendant quel mois le jeûne est-il prescrit ?',
  'Le mois de Ramadân', ['Le mois de Rajab', 'Le mois de Chaabân',
   'Le mois de Mouharram'], (2, 185), ['ramadân']),
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'Qu\'est-il descendu pendant le mois de Ramadân ?',
  'Le Coran', ['La Thora', 'L\'Évangile', 'Les Psaumes'], (2, 185), ['coran']),
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'Selon le Coran, qui jeûne un nombre égal d\'autres jours ?',
  'Le malade et le voyageur', ['Le riche et le pauvre',
   'L\'enfant et le vieillard', 'Personne'], (2, 185), ['malade', 'voyage']),
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'Au sujet du jeûne, que veut Allah pour vous ?',
  # « La difficulte » figure dans le verset, niee : « Il ne veut pas la
  # difficulte pour vous ». Comme leurre elle se defend, et le controle l'a
  # refusee — a raison.
  'La facilité', ['La solitude', 'Le silence', 'La lenteur'], (2, 185), ['facilité']),
 ('jeune-et-ramadan', 'Le déroulement du jour',
  'Qu\'est-ce qui marque la fin du repas de nuit ?',
  'Le fil blanc de l\'aube', ['Le premier chant du coq', 'Le lever du soleil',
   'Le milieu de la nuit'], (2, 187), ['fil blanc']),
 ('jeune-et-ramadan', 'Le déroulement du jour',
  'Jusqu\'à quand le jeûne se poursuit-il ?',
  'Jusqu\'à la nuit', ['Jusqu\'à midi', 'Jusqu\'au matin suivant',
   'Jusqu\'au premier repas'], (2, 187), ['jusqu\'à la nuit']),
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'À qui le jeûne avait-il déjà été prescrit ?',
  'À ceux d\'avant vous', ['Aux seuls prophètes', 'Aux seuls hommes',
   'À personne avant'], (2, 183), ['avant vous']),
 ('jeune-et-ramadan', 'Le mois du jeûne',
  'Pendant quelle nuit le Coran est-il descendu ?',
  'La nuit d\'Al-Qadr', ['La nuit du départ', 'La nuit du doute',
   'La nuit du pardon'], (97, 1), ['al-qadr']),

 # ---- L'aumone --------------------------------------------------------
 ('zakat-et-aumone', 'À qui va l\'aumône',
  'À qui l\'aumône est-elle d\'abord destinée ?',
  'Aux pauvres et aux indigents', ['Aux savants', 'Aux commerçants',
   'Aux gouverneurs'], (9, 60), ['pauvres', 'indigents']),
 ('zakat-et-aumone', 'À qui va l\'aumône',
  'Parmi ceux qui reçoivent l\'aumône, qui le Coran cite-t-il ?',
  'Ceux qui sont lourdement endettés', ['Les propriétaires terriens',
   'Les héritiers', 'Les voisins'], (9, 60), ['endettés']),
 ('zakat-et-aumone', 'À qui va l\'aumône',
  # UNE QUESTION A QUATRE REPONSES NE SE POSE PAS PAR OUI OU NON.
  # Elle etait ecrite « Le Coran cite-t-il... ? », et les trois leurres
  # commencaient par « Non » ou « Seulement » : on repondait a la forme de la
  # phrase, pas au verset.
  'Quel autre usage de l\'aumône le Coran cite-t-il ?',
  'L\'affranchissement des jougs', ['La construction de mosquées',
   'L\'achat de terres', 'Le paiement des impôts'],
  (9, 60), ['affranchissement']),
 ('zakat-et-aumone', 'À qui dépenser',
  'Selon le Coran, à qui dépenser son bien en premier ?',
  'Aux père et mère', ['Aux amis', 'Aux voisins', 'Aux associés'],
  (2, 215), ['père et mère']),
 ('zakat-et-aumone', 'À qui dépenser',
  'Après les parents et les proches, qui le Coran cite-t-il ?',
  'Les orphelins', ['Les soldats', 'Les marchands', 'Les rois'],
  (2, 215), ['orphelins']),

 # ---- Le pelerinage ---------------------------------------------------
 ('le-pelerinage', 'Qui, quand, où',
  'À qui le pèlerinage est-il un devoir ?',
  'À ceux qui en ont les moyens', ['À tous sans exception',
   'Aux seuls hommes', 'Aux seuls habitants de La Mecque'], (3, 97), ['moyens']),
 ('le-pelerinage', 'Qui, quand, où',
  'Vers quel lieu se fait le pèlerinage, selon le Coran ?',
  'La Maison', ['La montagne', 'Le désert', 'La vallée'],
  (3, 97), ['pèlerinage de la maison']),
 ('le-pelerinage', 'Qui, quand, où',
  'Quel autre rite le Coran cite-t-il avec le pèlerinage ?',
  'L\'Umra', ['La retraite', 'Le sacrifice du mouton', 'Le jeûne'],
  (2, 196), ['umra']),
 ('le-pelerinage', 'Qui, quand, où',
  'Quand le pèlerinage a-t-il lieu ?',
  'Dans des mois connus', ['Un seul jour par an', 'Toute l\'année',
   'Au printemps'], (2, 197), ['mois connus']),
 ('le-pelerinage', 'Ce qui est interdit',
  'Qu\'est-il interdit pendant le pèlerinage ?',
  'La dispute', ['Le silence', 'La marche', 'Le repos'], (2, 197), ['dispute']),
 ('le-pelerinage', 'Ce qui est interdit',
  'Quelle est la meilleure provision, selon le Coran ?',
  'La piété', ['L\'eau', 'L\'argent', 'La nourriture'], (2, 197), ['piété']),
 ('le-pelerinage', 'Qui, quand, où',
  'Comment les gens viennent-ils au pèlerinage, selon le Coran ?',
  'À pied et sur toute monture', ['En caravane seulement', 'Par la mer',
   'Chacun de sa ville'], (22, 27), ['à pied', 'monture']),

 # ---- Le comportement -------------------------------------------------
 ('le-comportement', 'Entre nous',
  'Quel défaut de langage le Coran interdit-il entre croyants ?',
  'La médisance', ['Le silence', 'La réunion', 'Le conseil'], (49, 12), ['médisez']),
 ('le-comportement', 'Entre nous',
  'Quel comportement envers autrui le Coran interdit-il ?',
  'Se railler les uns des autres', ['S\'entraider', 'Se visiter', 'Se parler'],
  (49, 11), ['raille']),
 ('le-comportement', 'Entre nous',
  'Quels noms le Coran interdit-il de se donner entre soi ?',
  'Des sobriquets injurieux', ['Des pierres', 'Des regards', 'Des défis'],
  (49, 11), ['sobriquets']),
 ('le-comportement', 'Entre nous',
  'Que faut-il éviter au sujet des autres, selon le Coran ?',
  'De trop conjecturer', ['De trop parler', 'De trop donner', 'De trop attendre'],
  (49, 12), ['conjecturer']),
 ('le-comportement', 'Les parents',
  'Que ne faut-il pas dire à ses parents âgés ?',
  '« Fi ! »', ['« Attendez »', '« Plus tard »', '« Pourquoi ? »'],
  (17, 23), ['fi']),
 ('le-comportement', 'Les parents',
  'Quelles paroles faut-il adresser à ses parents ?',
  'Des paroles respectueuses', ['Des paroles brèves', 'Des paroles savantes',
   'Aucune parole'], (17, 23), ['respectueuses']),
 ('le-comportement', 'Les parents',
  'À quel âge le Coran situe-t-il le sevrage ?',
  'À deux ans', ['À un an', 'À trois ans', 'À six mois'], (31, 14), ['deux ans']),

 # ---- Ce qui est interdit ---------------------------------------------
 ('le-comportement', 'Ce qui est interdit',
  'Quelle viande le Coran interdit-il ?',
  'La viande de porc', ['La viande de mouton', 'La viande de bœuf',
   'La viande de chameau'], (2, 173), ['porc']),
 ('le-comportement', 'Ce qui est interdit',
  'Avec la viande de porc, quoi d\'autre le Coran interdit-il ?',
  'Le sang', ['Le miel', 'Le sel', 'L\'huile'], (2, 173), ['le sang']),
 ('le-comportement', 'Ce qui est interdit',
  'Comment le Coran qualifie-t-il le vin et le jeu de hasard ?',
  'Une abomination', ['Un bienfait', 'Un remède', 'Une nécessité'],
  (5, 90), ['abomination']),
 ('le-comportement', 'Ce qui est interdit',
  'De qui le vin est-il l\'œuvre, selon le Coran ?',
  'Du Diable', ['Des rois', 'Des marchands', 'Du hasard'], (5, 90), ['diable']),
]


def nu(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r"[^a-z0-9']+", ' ', s.lower()).strip()


def main():
    rng = random.Random(20260822)
    fr = {(v['chapter'], v['verse']): v['text']
          for v in json.loads((CORAN / 'fra-muhammadhamidul.json')
                              .read_text(encoding='utf-8'))['quran']}

    fautes = []
    par_section = {}
    for i, (sec, theme, texte, bonne, leurres, (s, v), cles) in enumerate(Q):
        if (s, v) not in fr:
            fautes.append('%d : sourate %d verset %d n\'existe pas' % (i, s, v))
            continue
        verset = nu(fr[(s, v)])

        # 1. CE QUE J'AFFIRME DOIT SE LIRE DANS LE VERSET.
        manquants = [c for c in cles if nu(c) not in verset]
        if manquants:
            fautes.append('%d (%s) : « %s » ne se lit pas dans %d:%d'
                          % (i, texte[:40], ', '.join(manquants), s, v))

        # 2. AUCUNE MAUVAISE REPONSE NE DOIT ETRE JUSTE ELLE AUSSI.
        #    C'est la faute la plus injuste : repondre vrai, s'entendre dire non.
        for l in leurres:
            n = nu(l)
            if len(n) > 5 and n in verset:
                fautes.append('%d : le leurre « %s » se lit dans %d:%d — il est '
                              'donc defendable' % (i, l, s, v))

    if fautes:
        print('  %d FAUTE(S) — rien n\'est ecrit :' % len(fautes))
        for x in fautes:
            print('    ' + x)
        sys.exit(1)

    for sec, theme, texte, bonne, leurres, (s, v), cles in Q:
        par_section.setdefault(sec, []).append(F.question(
            qid=F.identifiant('pratique', '%s-%d-%d' % (nu(texte)[:24], s, v)),
            section=sec,
            type_='pratique',
            theme=theme,
            surtitre=theme,
            question_texte=texte,
            bonne=bonne,
            leurres=list(leurres),
            explication='Le Coran le dit en sourate %d, verset %d : « %s »'
                        % (s, v, fr[(s, v)][:220].rstrip()
                           + ('…' if len(fr[(s, v)]) > 220 else '')),
            source='Coran, sourate %d, verset %d. Traduction du sens : '
                   'Muhammad Hamidullah.' % (s, v),
            difficulte=1,
            rng=rng,
        ))

    # On AJOUTE a ce qui existe, on ne remplace pas : les sections ont deja
    # leurs questions de traduction, qui restent au niveau expert.
    #
    # ON RETIRE TOUTES LES ANCIENNES QUESTIONS DE PRATIQUE, PAS SEULEMENT
    # CELLES QU'ON REECRIT. L'identifiant est calcule sur le texte de la
    # question ; reformuler un enonce lui donne donc un identifiant neuf, et
    # filtrer sur les seuls identifiants produits laissait l'ancienne version
    # en place — deux questions pour une, l'ancienne formulation toujours
    # jouable. On efface par TYPE, qui ne bouge pas.
    total = 0
    for sec, neuves in sorted(par_section.items()):
        f = F.DONNEES / ('%s.json' % sec)
        avant = json.loads(f.read_text(encoding='utf-8')) if f.exists() else []
        garde = [q for q in avant if q.get('type') != 'pratique']
        F.ecrire(sec, garde + neuves)
        total += len(neuves)
        print('  %-22s +%2d questions de pratique (%d au total)'
              % (sec, len(neuves), len(garde) + len(neuves)))
    print('  %d questions ecrites, toutes verifiees contre leur verset.' % total)


if __name__ == '__main__':
    main()
