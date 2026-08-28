#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Des questions ecrites par Claude, sur des faits que Claude n'a pas le droit d'ecrire.

LE PROBLEME QU'ON REPARE
------------------------
Mesure du 28 aout : QUATRE gabarits font 83 % des 2 681 questions.
« Ce verset se traduit par : » revient 744 fois, « que signifie le mot en
vert » 687 fois. Le sens des sourates : 604 questions, trois gabarits. Le
vocabulaire : 1 246 questions, DEUX gabarits.

Ce n'etait pas un defaut de gout, c'etait un defaut de matiere. Le corpus n'a
de sens francais que pour 143 mots ; un generateur mecanique ne pouvait donc
demander qu'une chose — associer de l'arabe a une phrase francaise — et il l'a
demandee deux mille fois.

CE QUI CHANGE, ET LA REGLE QUI REND CA PUBLIABLE
------------------------------------------------
Claude ecrit maintenant les questions. Sur un site qui enseigne le Coran et
dont Mohamed est l'editeur, laisser un modele de langage ecrire du contenu
religieux serait exactement l'accident qu'on redoute. La regle est donc :

    CLAUDE CHOISIT ET FORMULE. IL N'ENONCE JAMAIS UN FAIT.

En pratique : on calcule d'abord une FICHE DE FAITS depuis le corpus — combien
de fois un mot apparait, combien de versets compte une sourate, quels mots
partagent une racine. Claude recoit cette fiche et doit rendre, pour chaque
question, les IDENTIFIANTS des faits qu'il utilise : celui de la bonne reponse
et ceux des trois leurres. Il ecrit l'enonce ; il ne fournit aucun nombre.

Le validateur relit ensuite chaque question et REFUSE :
  — une reponse ou un leurre qui n'est pas un fait de la fiche ;
  — un nombre dans l'enonce qui n'est pas celui du fait cite ;
  — une forme de question absente ou incoherente : « lequel revient le plus »
    exige quatre valeurs differentes, « lequel est l'intrus » exige au
    contraire que les trois autres se ressemblent ;
  — tout mot d'une liste noire : merite, vertu, bienfait, recompense,
    peche, interdit, obligatoire… Ces mots demandent une source juridique ou
    un hadith, et le projet n'en a aucun de sourcé.
Une seule faute et le LOT ENTIER est refuse.

Un nombre invente est donc structurellement impossible : il n'existe pas dans
la fiche, donc il ne passe pas.

POURQUOI DES FAITS CHIFFRES, ET PAS DES TRADUCTIONS
---------------------------------------------------
Une question devient interessante quand on peut la RAISONNER et que la reponse
surprend. « Lequel de ces mots revient le plus dans le Coran : jour, terre,
mer, nuit ? » se raisonne, et la reponse s'apprend. « Ce verset se traduit
par : » ne se raisonne pas — sans lire l'arabe, c'est un tirage au sort entre
quatre phrases. C'est toute la difference entre un jeu et un formulaire.

SANS CLE D'API
--------------
`--fiche` ecrit la fiche de faits et s'arrete : c'est ce qu'on donne a Claude.
`--lot <fichier.json>` valide et installe un lot deja ecrit, sans appeler
l'API. Le chemin de verification est le MEME dans les deux cas — c'est ce qui
permet de preparer un lot a la main et d'etre sur qu'il tiendra les memes
regles que ceux produits par l'API.
"""

import argparse
import json
import os
import pathlib
import re
import sys
import unicodedata
from collections import Counter, defaultdict

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran'

MODELE = 'claude-opus-5'
F_DONNEES = RACINE / 'data' / 'questions'

# Des mots qui demandent une source qu'on n'a pas. Un QCM qui les emploie
# engage l'editeur sur du droit ou sur un hadith ; on n'en a aucun de source.
NOIRE = ['merite', 'merites', 'vertu', 'vertus', 'bienfait', 'bienfaits',
         'recompense', 'recompenses', 'peche', 'peches', 'obligatoire',
         'interdit', 'licite', 'illicite', 'halal', 'haram', 'sunna',
         'hadith', 'savant', 'savants', 'ecole', 'fatwa', 'abroge']


def nu(s):
    s = unicodedata.normalize('NFD', str(s))
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


# ---------------------------------------------------------------- LA FICHE

def fiche():
    """Les faits, calcules depuis le corpus. Rien d'autre n'a le droit d'exister
    dans une question."""
    ar = json.loads((CORAN / 'ara-quransimple.json').read_text(encoding='utf-8'))['quran']
    noms = {s['n']: s['tr'] for s in
            json.loads((CORAN / 'noms-sourates.json').read_text(encoding='utf-8'))}
    lex = json.loads((RACINE / 'data' / 'lexique.json').read_text(encoding='utf-8'))

    faits = {}

    # 1. Combien de fois un mot apparait dans le Coran. Les 143 mots dont le
    #    sens francais est ATTESTE statistiquement — pas traduit a la main.
    for w in lex:
        faits['mot:' + w['lemme']] = {
            'type': 'occurrences', 'lemme': w['lemme'], 'sens': w['sens'],
            'valeur': w['occurrences'], 'versets': w['versets'],
            'nomPropre': bool(w.get('nomPropre')),
        }

    # 2. Combien de versets compte une sourate.
    par_s = Counter(v['chapter'] for v in ar)
    for n, k in par_s.items():
        faits['sourate:%d' % n] = {
            'type': 'versets', 'numero': n, 'nom': noms[n], 'valeur': k,
        }

    # 3. Les familles de racine, limitees aux mots dont on a le sens.
    lem_root = {}
    for l in (CORAN / 'morphologie.txt').read_text(encoding='utf-8').split('\n'):
        if 'ROOT:' not in l or 'LEM:' not in l:
            continue
        lem_root[re.search(r'LEM:([^|\t]+)', l).group(1)] = \
            re.search(r'ROOT:([^|\t]+)', l).group(1)
    par_racine = defaultdict(list)
    for w in lex:
        r = lem_root.get(w['lemme'])
        if r:
            par_racine[r].append(w)
    for r, ws in par_racine.items():
        if len(ws) >= 2:
            faits['racine:' + r] = {
                'type': 'racine', 'racine': r,
                'mots': [{'lemme': w['lemme'], 'sens': w['sens']} for w in ws],
                'valeur': r,
            }
    return faits


# ------------------------------------------------------------ LE VALIDATEUR

# Les racines, lues une fois : le validateur en a besoin pour la forme
# « racine », et rien d'autre ne doit pouvoir les redefinir.
RACINE_DE = {}
for _l in (CORAN / 'morphologie.txt').read_text(encoding='utf-8').split('\n'):
    if 'ROOT:' in _l and 'LEM:' in _l:
        RACINE_DE[re.search(r'LEM:([^|\t]+)', _l).group(1)] = \
            re.search(r'ROOT:([^|\t]+)', _l).group(1)


def etiquette(f):
    """Ce que la personne LIT pour ce fait. Une seule definition, utilisee par
    le validateur ET par la sortie : deux definitions divergeraient, et le
    validateur finirait par verifier autre chose que ce qui s'affiche."""
    if f['type'] == 'occurrences':
        # UN NOM PROPRE PORTE SA MAJUSCULE. Le lexique range les sens en
        # minuscules — c'est logique pour un dictionnaire, illisible sur une
        # carte : « moise », « abraham », « pharaon » alignes en bas d'ecran
        # donnaient l'air d'un site mal fini. Le lexique sait lesquels sont
        # des noms propres ; on s'en sert plutot que de deviner.
        return f['sens'][:1].upper() + f['sens'][1:] if f.get('nomPropre') else f['sens']
    if f['type'] == 'versets':
        return f['nom']
    return str(f['valeur'])


def valider(lot, faits):
    """Refuse tout ce qui ne se recoupe pas avec la fiche. Le lot est
    tout-ou-rien : une faute veut dire qu'on s'est relu trop vite."""
    fautes = []
    vus = set()
    for i, q in enumerate(lot):
        ref = 'question %d' % (i + 1)
        texte = q.get('question', '')
        bonne = q.get('bonne')
        leurres = q.get('leurres') or []

        if not texte or bonne is None or len(leurres) != 3:
            fautes.append('%s : il faut un enonce, une bonne reponse et TROIS leurres' % ref)
            continue

        # 1. Chaque proposition designe un fait de la fiche.
        cles = [bonne] + list(leurres)
        for c in cles:
            if c not in faits:
                fautes.append('%s : « %s » n\'est pas un fait de la fiche' % (ref, c))
        if any(c not in faits for c in cles):
            continue

        # 2. LA CONTRAINTE DEPEND DE LA FORME DE LA QUESTION.
        #    « Lequel revient le plus » exige quatre valeurs DIFFERENTES,
        #    sinon la question a deux bonnes reponses. « Laquelle fait
        #    exception » exige exactement l'inverse : les trois leurres
        #    doivent se ressembler, et c'est la bonne reponse qui differe.
        #    Une regle unique interdisait la seconde forme — et c'est
        #    justement la plus interessante a jouer.
        forme = q.get('forme')
        vals = [faits[c]['valeur'] for c in cles]
        if forme == 'extremum':
            if len(set(map(str, vals))) != 4:
                fautes.append('%s : « le plus / le moins » demande quatre valeurs '
                              'differentes (%s)' % (ref, ', '.join(map(str, vals))))
        elif forme == 'intrus':
            #    Les trois leurres partagent une valeur ; la bonne s'en ecarte.
            if len(set(map(str, vals[1:]))) != 1:
                fautes.append('%s : les trois leurres d\'un intrus doivent se '
                              'ressembler (%s)' % (ref, ', '.join(map(str, vals[1:]))))
            elif str(vals[0]) == str(vals[1]):
                fautes.append('%s : l\'intrus a la meme valeur que les autres' % ref)
        elif forme == 'racine':
            #    « Quel mot vient de la meme racine que X ? » : la BONNE partage
            #    la racine du mot cite dans l'enonce (donne par `racine`), et
            #    aucun leurre ne la partage.
            #
            #    LA FORME « INTRUS PARMI TROIS MOTS D'UNE RACINE » A ETE
            #    ECARTEE, faute de matiere : les trois mots de la racine ر ح م
            #    se traduisent tous par « misericordieux », et la carte aurait
            #    affiche trois reponses identiques. Le lexique ne contient
            #    aucune famille de trois mots aux sens distincts. On ne
            #    fabrique pas la question tant que la donnee ne la porte pas.
            voulue = q.get('racine')
            rs = [RACINE_DE.get(faits[c].get('lemme'), '?') for c in cles]
            if not voulue:
                fautes.append('%s : une question de racine doit dire LAQUELLE '
                              '(champ `racine`)' % ref)
            elif rs[0] != voulue:
                fautes.append('%s : la bonne reponse n\'est pas de la racine %s '
                              '(elle est de %s)' % (ref, voulue, rs[0]))
            elif voulue in rs[1:]:
                fautes.append('%s : un leurre partage la racine %s — il serait '
                              'juste lui aussi' % (ref, voulue))
        else:
            fautes.append('%s : forme manquante ou inconnue (%s) — il faut '
                          'extremum, intrus ou racine' % (ref, forme))

        # 2 bis. NI LE MEME LIBELLE. Le lexique attribue le meme sens francais
        # a plusieurs lemmes — « messager » vaut pour rasul et risala,
        # « misericordieux » pour trois mots. Leurs valeurs different, donc la
        # regle precedente les laissait passer ; a l'ecran, la personne aurait
        # lu deux reponses identiques et l'une des deux aurait ete comptee
        # fausse. C'est la faute la plus injuste possible.
        libs = [etiquette(faits[c]) for c in cles]
        if len(set(map(nu, libs))) != 4:
            fautes.append('%s : deux propositions s\'affichent pareil (%s)'
                          % (ref, ', '.join(libs)))

        # 3. TOUT NOMBRE DE L'ENONCE DOIT VENIR DE LA FICHE. C'est le verrou
        #    qui rend une hallucination impossible : Claude n'a pas le droit
        #    d'ecrire un chiffre que le corpus ne porte pas.
        connus = {str(f['valeur']) for f in faits.values()}
        connus |= {str(f.get('versets')) for f in faits.values() if f.get('versets')}
        connus |= {str(f.get('numero')) for f in faits.values() if f.get('numero')}
        for n in re.findall(r'\d+', texte):
            if n not in connus:
                fautes.append('%s : le nombre %s de l\'enonce n\'est dans aucun fait' % (ref, n))

        # 4. Aucun mot qui demanderait une source qu'on n'a pas.
        plat = nu(texte)
        for m in NOIRE:
            if re.search(r'(^| )' + re.escape(m) + r'( |$)', plat):
                fautes.append('%s : le mot « %s » demande une source dont le projet '
                              'ne dispose pas' % (ref, m))

        # 5. Pas deux fois la meme question.
        if nu(texte) in vus:
            fautes.append('%s : enonce en double' % ref)
        vus.add(nu(texte))

    return fautes


# --------------------------------------------------------------- L'API

def demander(faits, combien):
    """Appelle Claude. Sans cle, on le dit et on s'arrete — on ne fabrique
    jamais silencieusement un lot de remplacement."""
    cle = os.environ.get('ANTHROPIC_API_KEY')
    if not cle:
        sys.exit(
            'ARRET : ANTHROPIC_API_KEY absente de l\'environnement.\n'
            '  Poser la cle, puis relancer. En attendant :\n'
            '    python3 outils/faire-questions-claude.py --fiche > faits.json\n'
            '  donne la fiche a soumettre, et --lot <fichier> valide et installe\n'
            '  un lot ecrit sans l\'API. Le controle est le meme dans les deux cas.')
    try:
        import anthropic
    except ImportError:
        sys.exit('ARRET : le paquet `anthropic` n\'est pas installe (pip install anthropic).')

    # On n'envoie que la fiche. Claude ne voit AUCUN texte coranique ici : il
    # n'a pas a en produire, et ne pas le lui donner est la garantie la plus
    # simple qu'il n'en citera pas de memoire.
    resume = [{'cle': k, **{x: v[x] for x in ('type', 'sens', 'nom', 'valeur', 'mots')
                            if x in v}} for k, v in faits.items()]
    consigne = (
        "Tu ecris des questions de QCM pour un site francais qui enseigne l'islam.\n"
        "REGLE ABSOLUE : tu ne dois enoncer AUCUN fait. Tous les faits sont dans la\n"
        "fiche ci-dessous ; tu choisis parmi eux et tu ecris seulement la PHRASE de\n"
        "la question. N'ecris aucun chiffre qui ne soit pas la valeur d'un fait cite.\n"
        "N'emploie jamais : merite, vertu, bienfait, recompense, peche, obligatoire,\n"
        "interdit, halal, haram, hadith, savant, fatwa.\n\n"
        "Ce qui rend une question bonne : on doit pouvoir la RAISONNER, et la reponse\n"
        "doit surprendre un peu. Les trois leurres doivent etre plausibles.\n"
        "Varie les angles : ne repete pas deux fois la meme tournure.\n\n"
        "Rends UNIQUEMENT un tableau JSON de %d objets :\n"
        '  {"question": "...", "forme": "extremum|intrus|racine", "bonne": "<cle>",\n'
        '   "leurres": ["<cle>","<cle>","<cle>"], "explication": "...", "theme": "..."}\n\n'
        "FICHE DE FAITS :\n%s" % (combien, json.dumps(resume, ensure_ascii=False)))

    c = anthropic.Anthropic(api_key=cle)
    r = c.messages.create(model=MODELE, max_tokens=8000,
                          messages=[{'role': 'user', 'content': consigne}])
    brut = r.content[0].text
    m = re.search(r'\[.*\]', brut, re.S)
    if not m:
        sys.exit('ARRET : la reponse ne contient pas de tableau JSON.')
    return json.loads(m.group(0))


# ------------------------------------------------------------------- SORTIE

def poser(lot, faits, section):
    """Transforme un lot valide en questions du site.

    Le melange des quatre reponses est TIRE D'UNE GRAINE FIXE : relancer
    l'outil sur le meme lot doit redonner exactement le meme fichier, sinon
    chaque execution ferait un diff dans le depot sans que rien ait change.
    """
    import random
    import fabrique as F
    rng = random.Random(20260828)
    out = []
    for q in lot:
        cles = [q['bonne']] + list(q['leurres'])
        libelles = [etiquette(faits[c]) for c in cles]
        out.append(F.question(
            # L'IDENTIFIANT SE CALCULE SUR L'ENONCE ENTIER.
            # Tronque a 32 caracteres, « ...compte le plus de versets » et
            # « ...compte le moins de versets » donnaient le MEME identifiant :
            # deux questions opposees confondues en une.
            qid=F.identifiant('claude', nu(q['question']) + '|' + q['bonne']),
            section=q.get('section', section), type_='fait', theme=q.get('theme', 'Le Coran en chiffres'),
            surtitre=q.get('theme', 'Le Coran en chiffres'),
            question_texte=q['question'],
            bonne=libelles[0], leurres=libelles[1:],
            explication=q.get('explication', ''),
            source='Compté dans le texte coranique (édition ara-quransimple) '
                   'et dans le lexique attesté du site.',
            difficulte=1, rng=rng,
        ))
        # ON GARDE LES CLES DE FAITS SUR LA QUESTION PUBLIEE.
        # Sans elles, le controle ne pourrait que relire du francais libre et
        # deviner si l'enonce demande « le plus » ou « le moins ». Avec elles,
        # il recalcule la fiche depuis le corpus et refait EXACTEMENT la meme
        # verification que le generateur, sur ce qui est reellement en ligne.
        out[-1]['faits'] = {'forme': q.get('forme'), 'bonne': q['bonne'],
                            'leurres': list(q['leurres'])}
        if q.get('racine'):
            out[-1]['faits']['racine'] = q['racine']
    return out


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--fiche', action='store_true', help='ecrire la fiche de faits et s\'arreter')
    a.add_argument('--lot', help='valider et installer un lot JSON deja ecrit')
    a.add_argument('--combien', type=int, default=30)
    a.add_argument('--section', default='le-coran-en-chiffres')
    o = a.parse_args()

    f = fiche()
    if o.fiche:
        print(json.dumps(list(f.values()), ensure_ascii=False, indent=1))
        return

    lot = json.loads(pathlib.Path(o.lot).read_text(encoding='utf-8')) if o.lot \
        else demander(f, o.combien)

    fautes = valider(lot, f)
    if fautes:
        print('  %d FAUTE(S) — le lot entier est refuse :' % len(fautes))
        for x in fautes[:20]:
            print('    ' + x)
        sys.exit(1)
    print('  %d questions validees contre %d faits calcules.' % (len(lot), len(f)))

    # INSTALLATION. On AJOUTE aux banques, et on retire d'abord les questions
    # de type `fait` deja posees : l'identifiant se calcule sur l'enonce, donc
    # reformuler une question lui en donne un neuf et l'ancienne resterait
    # jouable a cote. On efface par TYPE, qui ne bouge pas.
    import json as _j
    neuves = poser(lot, f, o.section)
    par_sec = {}
    for q in neuves:
        par_sec.setdefault(q['section'], []).append(q)
    for sec, qs in sorted(par_sec.items()):
        fich = F_DONNEES / ('%s.json' % sec)
        avant = _j.loads(fich.read_text(encoding='utf-8')) if fich.exists() else []
        garde = [x for x in avant if x.get('type') != 'fait']
        fich.write_text(_j.dumps(garde + qs, ensure_ascii=False, indent=1), encoding='utf-8')
        print('  %-22s +%2d questions de fait (%d au total)'
              % (sec, len(qs), len(garde) + len(qs)))


if __name__ == '__main__':
    main()
