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
            m = motif.match(chemin)
            if m:
                # LE PARAMETRE SE REPORTE DANS LA DESTINATION.
                # Vercel accepte `/section/:slug` -> `/section-:slug.html` et
                # remplace `:slug` par ce qu'il a capture. Ici, la destination
                # etait rendue telle quelle : `:slug` restait dans le nom de
                # fichier et le serveur local cherchait « section-:slug.html ».
                # Tant qu'aucune regle n'utilisait son parametre, ca ne se
                # voyait pas — et le jour ou l'une le fait, le serveur d'essai
                # dit « introuvable » sur une adresse qui marche en ligne,
                # c'est-a-dire exactement l'ecart que ce fichier existe pour
                # ne plus avoir.
                out = cible
                for nom, val in (m.groupdict() or {}).items():
                    if val is not None:
                        out = out.replace(':' + nom, val)
                return str(RACINE / out.lstrip('/'))
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        """UNE ADRESSE INCONNUE TOMBE SUR `404.html`, comme en ligne.

        Ce serveur existe pour que l'essai local ressemble a la production :
        il lit deja les reecritures et les redirections de `vercel.json`. Il
        divergeait pourtant a l'endroit exact ou arrive quelqu'un qui s'est
        perdu — une adresse morte rendait la page d'erreur de Python,
        « Error response », et pas `404.html`.

        Consequence mesurable, le 1er octobre : aucun controle navigateur
        n'avait jamais ouvert cette page. `controler-redirections.py` en
        relit le FICHIER — noindex, sorties vivantes, absente du sitemap —
        mais personne ne l'avait vue s'afficher. Une feuille de style
        oubliee, un lien casse, un debordement : rien ne l'aurait dit.

        On garde le code 404 : c'est lui qui compte pour un robot. Seul le
        corps change.

        NON VERIFIE D'ICI : que Vercel serve bien `404.html` pour une adresse
        inconnue. Le fichier est a la racine publiee et `vercel.json` ne
        configure rien d'autre, mais le site en ligne n'est pas joignable
        depuis cette machine. Ce qui est verifie, c'est le serveur local.
        """
        page = RACINE / '404.html'
        if code == 404 and page.is_file():
            corps = page.read_bytes()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(corps)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(corps)
            return
        super().send_error(code, message, explain)

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
