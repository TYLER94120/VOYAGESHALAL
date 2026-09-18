#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reconfronte `data/index-sections.json` aux banques, ligne par ligne.

POURQUOI CE CONTROLE EST LE PLUS IMPORTANT DU LOT
-------------------------------------------------
Depuis le 18 septembre, l'accueil, la grille des sections, la page des
progres et les douze couvertures ne lisent plus les banques : elles lisent un
index de 53 Ko qui les resume. C'est quarante-sept fois plus leger — et c'est
aussi une COPIE. Or la regle de ce projet est qu'aucun chiffre affiche n'est
annonce : il est compte.

Un index qui derive de ses banques serait donc pire que pas d'index du tout.
Les pages afficheraient des nombres faux en donnant toutes les apparences de
les avoir comptes, et rien ne le signalerait — le cahier des sections dirait
« 611 questions » quand la banque en contiendrait 640, et personne ne le
saurait avant qu'un visiteur ne compte lui-meme.

CE QU'IL VERIFIE, POUR CHAQUE SECTION
-------------------------------------
 1. le nombre de questions ;
 2. les identifiants, UN A UN ET DANS L'ORDRE — ce sont eux qui servent au
    pourcentage de maitrise ; un seul manquant, et le pourcentage ment ;
 3. les themes, dans l'ordre ou la banque les presente ;
 4. la repartition par niveau ;
 5. qu'aucune section de `sections.json` ne manque a l'index, et qu'aucune
    section inconnue ne s'y trouve.
"""

import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
INDEX = RACINE / 'data' / 'index-sections.json'


def main():
    if not INDEX.is_file():
        sys.exit('ARRET : %s est absent. Lancer outils/faire-index-sections.py'
                 % INDEX.name)
    index = json.loads(INDEX.read_text(encoding='utf-8'))
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))

    fautes = []
    attendus = {s['slug'] for s in secs}
    for x in sorted(set(index) - attendus):
        fautes.append('%s : dans l\'index, mais pas dans sections.json' % x)
    for x in sorted(attendus - set(index)):
        fautes.append('%s : absente de l\'index' % x)

    total = 0
    for s in secs:
        slug = s['slug']
        if slug not in index:
            continue
        e = index[slug]
        f = RACINE / 'data' / 'questions' / ('%s.json' % slug)
        banque = json.loads(f.read_text(encoding='utf-8')) if f.is_file() else []
        total += len(banque)

        if e.get('n') != len(banque):
            fautes.append('%s : l\'index annonce %s questions, la banque en a %d'
                          % (slug, e.get('n'), len(banque)))

        # 2. LES IDENTIFIANTS, UN A UN. C'est sur eux que repose le
        #    pourcentage de maitrise ; on ne se contente pas de leur nombre.
        ids = [q['id'] for q in banque]
        if e.get('ids') != ids:
            manquants = set(ids) - set(e.get('ids') or [])
            etrangers = set(e.get('ids') or []) - set(ids)
            if manquants or etrangers:
                fautes.append('%s : %d identifiant(s) manquant(s), %d en trop'
                              % (slug, len(manquants), len(etrangers)))
            else:
                fautes.append('%s : les identifiants ne sont pas dans l\'ordre '
                              'de la banque' % slug)

        themes, vus = [], set()
        for q in banque:
            t = q.get('theme')
            if t and t not in vus:
                vus.add(t)
                themes.append(t)
        if e.get('themes') != themes:
            fautes.append('%s : themes %s, la banque donne %s'
                          % (slug, e.get('themes'), themes))

        niveaux = {'1': 0, '2': 0, '3': 0}
        for q in banque:
            n = str(q.get('niveau') or 2)
            niveaux[n] = niveaux.get(n, 0) + 1
        if e.get('niveaux') != niveaux:
            fautes.append('%s : niveaux %s, la banque donne %s'
                          % (slug, e.get('niveaux'), niveaux))

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    poids = len(INDEX.read_bytes()) / 1024
    print('  %d sections, %d questions : nombres, identifiants, themes et'
          % (len(index), total))
    print('  niveaux reconfrontes aux banques, un par un.')
    print('  index-sections.json : %.1f Ko, contre 2 490 Ko de banques.' % poids)


if __name__ == '__main__':
    main()
