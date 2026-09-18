#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Un petit index des sections, pour ne plus telecharger les banques entieres.

CE QU'ON A MESURE
-----------------
Ouvert dans un navigateur, le 18 septembre :

  index.html      23 fichiers, 2 584 Ko, dont 12 banques = 2 490 Ko
  sections.html   21 fichiers, 2 567 Ko, dont 12 banques = 2 490 Ko
  progres.html    20 fichiers, 2 552 Ko, dont 12 banques = 2 490 Ko
  /section/vocabulaire-arabe   1 109 Ko, dont une banque de 1 031 Ko

L'ACCUEIL TELECHARGEAIT DEUX MEGAOCTETS ET DEMI POUR AFFICHER DOUZE NOMBRES.
Servi compresse, cela reste 286 Ko — et surtout deux mega-octets et demi de
JSON a analyser sur un telephone, avant que la moindre tuile s'affiche.

La methode maison sur les conditions degradees dit la chose importante : le
reseau n'est presque jamais absent, il est LENT, et une requete qui traine est
pire qu'un echec immediat, parce que pendant ce temps le produit n'a rien
affiche. La meilleure facon de tenir dans un reseau lent, c'est de ne pas
demander ce dont on n'a pas besoin.

CE QUE CES PAGES ONT VRAIMENT BESOIN DE SAVOIR
----------------------------------------------
Le nombre de questions, les themes, la repartition par niveau — et les
IDENTIFIANTS, parce que le pourcentage de maitrise se calcule en croisant les
identifiants d'une section avec ce que la memoire du telephone a retenu. Rien
d'autre : ni les enonces, ni les reponses, ni les explications, ni les
references, qui font tout le poids.

  index avec les identifiants :   53,2 Ko brut,  17,1 Ko compresse
  les onze banques entieres    : 2 490,0 Ko brut, 286,3 Ko compresse

Quarante-sept fois plus leger.

CE QU'IL NE FAIT PAS
--------------------
Il ne remplace pas les banques : `reglages.js` et `qcm.js` chargent toujours
la banque de LA section qu'on joue, et c'est normal — il leur faut les
questions. Seules les pages qui ne font que COMPTER passent par l'index.

Tout est recopie depuis les banques a la fabrication. `controler-index.py`
reconfronte ensuite chaque nombre, chaque theme et chaque identifiant : un
index qui derive de ses banques serait pire que pas d'index du tout, puisque
les pages afficheraient des chiffres faux en croyant les avoir comptes.
"""

import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'data' / 'index-sections.json'


def construire():
    secs = json.loads((RACINE / 'data' / 'sections.json').read_text(encoding='utf-8'))
    index = {}
    for s in secs:
        f = RACINE / 'data' / 'questions' / ('%s.json' % s['slug'])
        banque = json.loads(f.read_text(encoding='utf-8')) if f.is_file() else []

        # Les memes comptages que les scripts faisaient eux-memes, faits une
        # fois ici plutot qu'a chaque ouverture de page sur chaque telephone.
        themes, vus = [], set()
        niveaux = {'1': 0, '2': 0, '3': 0}
        for q in banque:
            t = q.get('theme')
            if t and t not in vus:
                vus.add(t)
                themes.append(t)
            n = str(q.get('niveau') or 2)
            niveaux[n] = niveaux.get(n, 0) + 1

        index[s['slug']] = {
            'n': len(banque),
            'themes': themes,
            'niveaux': niveaux,
            'ids': [q['id'] for q in banque],
        }
    return index


def main():
    index = construire()
    if not index:
        sys.exit('ARRET : aucune section.')

    # Separateurs serres : c'est un fichier que des telephones telechargent,
    # pas un fichier qu'on relit a la main.
    texte = json.dumps(index, ensure_ascii=False, separators=(',', ':'))
    SORTIE.write_text(texte, encoding='utf-8')

    total = sum(v['n'] for v in index.values())
    pleines = sum(1 for v in index.values() if v['n'])
    print('  data/index-sections.json : %d sections, %d pleines, %d questions.'
          % (len(index), pleines, total))
    print('  %.1f Ko — contre 2 490 Ko de banques entieres avant.'
          % (len(texte.encode('utf-8')) / 1024))
    print('  Nombres, themes, niveaux et identifiants recopies des banques.')


if __name__ == '__main__':
    main()
