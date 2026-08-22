#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le site en local, AVEC les reecritures de vercel.json.

POURQUOI CE FICHIER EXISTE
--------------------------
`python3 -m http.server` sert les fichiers tels quels. Il ne connait pas
/section/<slug>, qui n'est pas un fichier mais une reecriture declaree dans
vercel.json. Tester avec lui, c'est tester un autre site que celui qui est en
ligne — et decouvrir la difference en production, ce qui est arrive une fois
de trop sur ce projet.

Les regles ne sont pas recopiees ici : elles sont LUES dans vercel.json. Une
deuxieme liste divergerait, et c'est exactement le genre d'ecart qui fait
passer un site casse pour un site qui marche.

    python3 outils/servir.py [port]
"""

import http.server
import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent


def regles():
    """Les reecritures de vercel.json, en expressions regulieres."""
    conf = json.loads((RACINE / 'vercel.json').read_text(encoding='utf-8'))
    out = []
    for r in conf.get('rewrites', []):
        motif = '^' + re.sub(r':([A-Za-z_]+)', r'(?P<\1>[^/]+)', r['source']) + '$'
        out.append((re.compile(motif), r['destination']))
    return out


REGLES = regles()


class Serveur(http.server.SimpleHTTPRequestHandler):
    # LA RACINE SE POSE ICI, PAS SUR LA CLASSE DE BASE.
    # `SimpleHTTPRequestHandler.__init__` ecrit `self.directory` a chaque
    # requete — depuis son argument `directory`, ou a defaut depuis le dossier
    # COURANT. L'attribut de classe qu'on posait plus bas etait donc ecrase
    # aussitot, et le serveur servait le repertoire d'ou on l'avait lance.
    # Tant qu'on le lancait depuis la racine du site, ca ne se voyait pas ;
    # lance d'ailleurs, il servait sans rien dire une AUTRE copie du site.
    def __init__(self, *a, **kw):
        kw['directory'] = str(RACINE)
        super().__init__(*a, **kw)

    def translate_path(self, path):
        chemin = path.split('?', 1)[0].split('#', 1)[0]
        for motif, cible in REGLES:
            if motif.match(chemin):
                return str(RACINE / cible.lstrip('/'))
        return super().translate_path(path)

    def log_message(self, *a):
        pass   # un serveur d'essai n'a pas a bavarder


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), Serveur)
    print('  le site est sur http://127.0.0.1:%d/  (%d reecriture(s) actives)'
          % (port, len(REGLES)))
    srv.serve_forever()


if __name__ == '__main__':
    main()
