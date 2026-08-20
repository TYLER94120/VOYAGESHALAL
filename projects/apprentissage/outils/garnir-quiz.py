#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ecrit dans quiz.html le bloc STATIQUE que Google lit sans JavaScript.

LE DEFAUT MESURE
----------------
Le 18 aout, JavaScript desactive : `quiz.html` ne rendait que **77 mots**,
contre 547 pour la liste des sourates, 1 290 pour la page des lecons et 1 154
pour une lecon. C'etait la page la plus MINCE du site — et c'est la seule, avec
les 114 sourates, que Google ne peut pas remplacer par son propre encadre :
il ne peut pas jouer un QCM a la place du visiteur.

Une page de 77 mots ne se classe pas. Ce script lui donne un corps.

CE QU'ON MONTRE, ET CE QU'ON NE MONTRE SURTOUT PAS
--------------------------------------------------
On montre **de quoi sont faites les 83 questions** : combien par theme, de
quelles lecons elles sortent, et comment un tour se joue.

On ne montre **aucune reponse**, et pas meme le libelle des questions. Publier
les questions en clair transformerait la page en texte que Google resume en
haut de ses resultats — le visiteur aurait sa reponse sans venir, et le jeu
n'existerait plus. C'est exactement le piege que la mesure du 17 aout decrit :
les requetes d'explication perdent leur clic, celles d'action le gardent.

TOUS LES CHIFFRES SONT COMPTES, JAMAIS RECOPIES : ils viennent de
`questions.js` et du catalogue de `app.js`.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
DEBUT = "<!-- corps statique : genere par outils/garnir-quiz.py, ne pas editer a la main -->"
FIN = "<!-- fin du corps statique -->"

# Les parcours, dans l'ordre ou ils se presentent au visiteur.
NOMS = {
    'sourates': 'Le sens des sourates',
    'foi': 'Les bases de la foi',
    'priere': 'La priere pas a pas',
    'alphabet': "L'alphabet arabe",
    'invocations': 'Les invocations du jour',
    'prophetes': 'Les prophetes',
    'comportement': 'Le comportement',
}


def catalogue():
    src = (RACINE / 'app.js').read_text(encoding='utf-8')
    bloc = src[src.index('var CATALOGUE = ['):src.index('function nomParcours')]
    out = {}
    for m in bloc.split('\n    {')[1:]:
        if 'publiee: true' not in m:
            continue
        g = lambda p: (re.search(p, m) or [None, None])[1]
        out[g(r"id: '([^']+)'")] = {
            'titre': g(r"titre: '((?:[^'\\]|\\.)*)'").replace("\\'", "'"),
            'url': g(r"url: '([^']+)'"),
            'parcours': g(r"parcours: '([^']+)'"),
        }
    return out


def questions():
    t = (RACINE / 'questions.js').read_text(encoding='utf-8')
    return json.loads(t.split('=', 1)[1].strip().rstrip(';'))


def main():
    cat = catalogue()
    qs = questions()
    if not qs:
        sys.exit("ARRET : aucune question lue.")

    # Combien de questions par parcours, et combien de lecons derriere.
    par = {}
    for q in qs:
        p = cat.get(q['lecon'], {}).get('parcours')
        if not p:
            sys.exit("ARRET : la lecon %s n'est pas au catalogue." % q['lecon'])
        d = par.setdefault(p, {'n': 0, 'lecons': set()})
        d['n'] += 1
        d['lecons'].add(q['lecon'])

    lignes = [DEBUT, '    <section class="famille" data-r="quiz-fond">',
              '      <h2>De quoi sont faites ces %d questions</h2>' % len(qs),
              '      <p class="famille-quoi">',
              '        Chacune sort d\'une lecon du site et sa reponse y est expliquee,',
              '        avec sa source. Aucune question n\'a ete ecrite pour le jeu.',
              '      </p>', '      <div class="pliens">']

    for p in NOMS:
        if p not in par:
            continue
        d = par[p]
        lignes.append('        <a class="ligne" href="parcours.html">')
        lignes.append('          <svg class="etoile" width="15" height="15" viewBox="0 0 24 24" '
                      'fill="#c9a84c" aria-hidden="true"><path d="M12 2 L22 12 L12 22 L2 12 Z '
                      'M5 5 H19 V19 H5 Z"/></svg>')
        lignes.append('          <span><span class="t">%s</span><span class="s">%d questions, '
                      'tirees de %d lecon%s</span></span>'
                      % (NOMS[p], d['n'], len(d['lecons']), 's' if len(d['lecons']) > 1 else ''))
        lignes.append('          <span class="fl" aria-hidden="true">&rsaquo;</span>')
        lignes.append('        </a>')
    lignes.append('      </div>')

    lignes += [
        '      <h2>Comment se joue un tour</h2>',
        '      <p class="famille-quoi">',
        '        Dix questions, tirees d\'abord des lecons que tu as deja faites.',
        '        Une question manquee <strong>revient a la fin du tour</strong>, une',
        '        seule fois : une seance doit pouvoir se terminer gagnee. Le compte',
        '        final dit ce qui est su et ce qui a ete rattrape — c\'est un',
        '        compteur, pas une note.',
        '      </p>',
        '      <p class="famille-quoi">',
        '        Gratuit, sans compte, sans inscription. Rien n\'est envoye nulle',
        '        part&nbsp;: ce que tu fais reste sur ton telephone.',
        '      </p>',
        '      <h2>Les lecons d\'ou viennent les questions</h2>',
        '      <div class="pliens">',
    ]
    # Chaque lecon citee et LIEE : le visiteur va lire, et chaque lecon gagne
    # un lien interne de plus depuis une page a forte intention.
    vus = set()
    for q in qs:
        if q['lecon'] in vus:
            continue
        vus.add(q['lecon'])
        l = cat[q['lecon']]
        n = sum(1 for x in qs if x['lecon'] == q['lecon'])
        lignes.append('        <a class="ligne" href="%s">' % l['url'])
        lignes.append('          <svg class="etoile" width="15" height="15" viewBox="0 0 24 24" '
                      'fill="#c9a84c" aria-hidden="true"><path d="M12 2 L22 12 L12 22 L2 12 Z '
                      'M5 5 H19 V19 H5 Z"/></svg>')
        lignes.append('          <span><span class="t">%s</span><span class="s">%d question%s</span></span>'
                      % (l['titre'], n, 's' if n > 1 else ''))
        lignes.append('          <span class="fl" aria-hidden="true">&rsaquo;</span>')
        lignes.append('        </a>')
    lignes += ['      </div>', '    </section>', FIN]
    bloc = '\n'.join(lignes) + '\n'

    page = RACINE / 'quiz.html'
    t = page.read_text(encoding='utf-8')
    if DEBUT in t:
        t = re.sub(re.escape(DEBUT) + r".*?" + re.escape(FIN) + r"\n?", bloc, t, count=1, flags=re.S)
    else:
        marque = '    <a class="lien-discret lien-bas" href="parcours.html">'
        if marque not in t:
            sys.exit("ARRET : point d'insertion introuvable dans quiz.html.")
        t = t.replace(marque, bloc + marque, 1)
    page.write_text(t, encoding='utf-8')

    print("  %d questions, %d lecons citees et liees." % (len(qs), len(vus)))
    for p in NOMS:
        if p in par:
            print("     %-24s %2d questions, %2d lecons" % (NOMS[p], par[p]['n'], len(par[p]['lecons'])))
    # CE QUI CONSTITUE UNE FUITE, ET CE QUI N'EN EST PAS UNE.
    # Une reponse SEULE n'identifie rien : « 3 » ou « Six » apparaissent
    # naturellement dans « 3 questions » et dans le titre « Six phrases du
    # Prophete ». Ma premiere version signalait 18 fuites, toutes fausses —
    # meme famille d'erreur que « sou-RATE » au cycle 22.
    # Le vrai risque est le LIBELLE d'une question publie en clair : le
    # visiteur aurait alors la question ET, juste a cote, de quoi la resoudre
    # sans venir. On verifie donc les libelles, et l'absence de tout marqueur
    # de bonne reponse dans le bloc.
    libelles = [q for q in qs if q['q'][:40] and q['q'][:40] in bloc]
    marqueurs = bloc.count('data-bonne')
    print("  libelles de question publies en clair : %d (doit etre 0)" % len(libelles))
    print("  marqueurs de bonne reponse dans le bloc : %d (doit etre 0)" % marqueurs)
    if libelles or marqueurs:
        sys.exit("ARRET : le bloc statique divulgue le jeu.")


if __name__ == '__main__':
    main()
