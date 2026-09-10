#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les redirections des adresses supprimees le 21 aout.

CE QU'ON A TROUVE, ET COMMENT
-----------------------------
Le site a ete indexe le 17 aout. La refonte du 21 aout a supprime neuf pages
de lecon a l'ancienne forme `lecon-<slug>.html`. UNE seule avait recu une
redirection, le 30 aout — les huit autres rendent 404 depuis.

Ces neuf noms ne sont pas devines : ils sont RELEVES dans l'historique git de
la branche, en cherchant les fichiers `lecon-*.html` ajoutes puis supprimes.
Et leur destination n'est pas devinee non plus : chaque ancienne page a ete
rouverte dans l'historique pour lire son titre et son h1, et c'est ce qu'elle
CONTENAIT qui decide ou elle mene.

CE QUE JE NE PEUX PAS VERIFIER, ET QUI EST DIT ICI PLUTOT QUE TU
----------------------------------------------------------------
Je ne peux pas savoir si Google detient encore ces adresses : la Search
Console n'est pas accessible depuis ici, et la propriete du site est de type
« prefixe d'URL », donc partielle. La fenetre d'indexation a ete courte —
quatre jours entre le 17 et le 21 aout. Ce lot est donc une ASSURANCE, pas un
gain mesure. Il coute neuf lignes, se defait en une, et transforme une
impasse en page vivante si l'adresse existe encore quelque part.

POURQUOI PAS TOUT VERS L'ACCUEIL
--------------------------------
Renvoyer neuf adresses vers l'accueil serait plus simple et plus mauvais :
Google appelle cela un « soft 404 » et le traite comme une page introuvable,
et le visiteur qui cherchait les formes des lettres arabes se retrouve devant
un bouton « Lancer un QCM ». Chaque redirection mene au sujet le plus proche
qui existe encore.

DEUX CAS QU'IL FAUT NOMMER
--------------------------
`lecon-comportement.html` etait « 6 hadiths sur le comportement, avec leur
numero » et `lecon-invocations-matin.html` « 3 invocations du matin, avec
leur source ». Le projet n'a AUCUNE traduction francaise sourcee de recueils
de hadiths — c'est probablement pour cela que ces pages ont disparu. Les
rediriger ne les republie pas et ne restaure aucune de leurs affirmations :
cela envoie seulement le visiteur vers la section vivante du meme sujet.
"""

import json
import pathlib
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

# (ancienne adresse, destination, ce que l'ancienne page contenait)
# La troisieme colonne n'est pas decorative : c'est elle qui justifie la
# deuxieme, et elle vient du <h1> relu dans l'historique git.
TABLE = [
    ('/lecon-al-fatiha.html', '/lecon-sourate-al-fatiha.html',
     'Sourate Al-Fatiha : les 7 versets expliques'),
    ('/lecon-alphabet-arabe.html', '/section/lire-l-arabe',
     'Alphabet arabe : les 28 lettres et leur son'),
    ('/lecon-lire-arabe-formes.html', '/section/lire-l-arabe',
     'Les 4 formes des lettres arabes selon leur place'),
    ('/lecon-lire-arabe-voyelles.html', '/section/lire-l-arabe',
     "Les 8 signes pour lire l'arabe : fatha, kasra, damma"),
    ('/lecon-priere-gestes.html', '/section/la-priere',
     "Les 7 gestes de la priere, dans l'ordre"),
    ('/lecon-prophetes-coran.html', '/section/histoire-des-prophetes',
     'Les 25 prophetes nommes dans le Coran'),
    ('/lecon-six-piliers-foi.html', '/section/piliers-de-la-foi',
     'Les 6 piliers de la foi en islam, avec leur source'),
    ('/lecon-comportement.html', '/section/le-comportement',
     '6 hadiths sur le comportement, avec leur numero'),
    ('/lecon-invocations-matin.html', '/section/les-invocations',
     '3 invocations du matin, avec leur source'),
]


def main():
    conf_f = RACINE / 'vercel.json'
    conf = json.loads(conf_f.read_text(encoding='utf-8'))
    reecritures = {r['source']: r['destination'] for r in conf.get('rewrites', [])}

    # UNE REDIRECTION QUI MENE AILLEURS QU'A UNE PAGE VIVANTE EST PIRE QUE LE
    # 404 QU'ELLE REMPLACE : on la suit, on attend, et on tombe quand meme.
    # On verifie donc chaque destination AVANT d'ecrire quoi que ce soit.
    for vieux, neuf, _ in TABLE:
        if neuf in reecritures:                 # /section/<slug>
            cible = RACINE / reecritures[neuf].lstrip('/')
        else:                                   # un fichier direct
            cible = RACINE / neuf.lstrip('/')
        if not cible.is_file():
            sys.exit('ARRET : %s mene a %s, qui n\'existe pas.' % (vieux, neuf))
        # L'ancienne adresse ne doit plus exister comme fichier, sinon le
        # fichier gagne et la redirection ne sert jamais.
        if (RACINE / vieux.lstrip('/')).is_file():
            sys.exit('ARRET : %s existe encore comme fichier ; la redirection '
                     'ne s\'appliquerait pas.' % vieux)

    conf['redirects'] = [{'source': v, 'destination': n, 'permanent': True}
                         for v, n, _ in TABLE]
    conf_f.write_text(json.dumps(conf, ensure_ascii=False, indent=2) + '\n',
                      encoding='utf-8')

    print('  %d redirections permanentes posees dans vercel.json.' % len(TABLE))
    print('  Chaque destination existe, chaque ancienne adresse a disparu.')
    for v, n, quoi in TABLE:
        print('    %-32s -> %-32s (%s)' % (v, n, quoi[:44]))


if __name__ == '__main__':
    main()
