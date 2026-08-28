#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tous les liens internes menent-ils quelque part ?

POURQUOI CE CONTROLE
--------------------
Un lien mort ne casse rien de visible : la page s'affiche, le lien a l'air
normal, et c'est en cliquant qu'on tombe sur une erreur. Personne ne clique
sur les 114 lignes de `sourates.html` pour verifier.

C'est aussi une perte seche pour le referencement. Le 21 aout, une refonte a
supprime vingt pages d'un coup ; les liens qui menaient vers elles sont restes
en place quelque temps, et Google a suivi vingt liens vers du vide. Le maillage
interne est justement le levier qu'on est en train de reconstruire — le
mesurer coute une minute.

CE QU'IL VERIFIE
----------------
Chaque `href` de chaque page du site, resolu comme le ferait le serveur :
un fichier du dossier, une reecriture de `vercel.json`, une ancre de la page
elle-meme. Les liens externes ne sont PAS suivis — cette session n'a pas
d'acces reseau vers eux, et un controle qui dependrait du reseau serait rouge
un jour sur deux pour rien. Ils sont comptes et listes, pas juges.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

HREF = re.compile(r'(?:href|src)="([^"]+)"')


def regles():
    """Les reecritures de vercel.json, comme le serveur les applique."""
    f = RACINE / 'vercel.json'
    if not f.is_file():
        return []
    conf = json.loads(f.read_text(encoding='utf-8'))
    out = []
    for r in conf.get('rewrites', []):
        src = r.get('source', '')
        # « /section/:slug » devient une expression : on ne verifie pas le
        # slug ici, c'est le role de controler-chaine.
        #
        # ATTENTION AU DEUX-POINTS. `re.escape` ne l'echappe pas — depuis
        # Python 3.7 il ne touche qu'aux caracteres reellement speciaux. Je
        # cherchais donc `\:slug` dans une chaine qui contient `:slug`, le
        # remplacement ne trouvait rien, et les vingt-quatre liens vers
        # /section/... etaient annonces morts alors qu'ils repondent 200.
        # Un controle qui se trompe est pire qu'un controle absent : on
        # apprend a ignorer ce qu'il dit.
        motif = re.sub(r':\w+', '[^/]+', re.escape(src)).replace(r'\*', '.*')
        out.append((re.compile('^' + motif + '$'), r.get('destination', '')))
    return out


def main():
    R = regles()
    pages = sorted(RACINE.glob('*.html'))
    if not pages:
        sys.exit('ARRET : aucune page a controler.')

    morts, externes, verifies = [], set(), 0
    for p in pages:
        t = p.read_text(encoding='utf-8')
        ancres = set(re.findall(r'id="([^"]+)"', t))
        # UNE ANCRE PEUT ETRE POSEE PAR LE SCRIPT DE LA PAGE.
        # `section.html` est presque vide : c'est `section.js` qui ecrit
        # `id="principal"`. Le lien « Aller au contenu » est donc valide a
        # l'ecran et introuvable dans le HTML. On lit aussi les scripts que
        # la page charge, plutot que d'annoncer une faute qui n'en est pas.
        for src in re.findall(r'<script src="([^"]+)"', t):
            f = RACINE / src.lstrip('/')
            if f.is_file():
                ancres |= set(re.findall(r'id=\\?"([^"\\]+)', f.read_text(encoding='utf-8')))
        for lien in HREF.findall(t):
            if lien.startswith(('http://', 'https://', 'mailto:', 'data:', '//')):
                externes.add(lien.split('/')[2] if '//' in lien else lien)
                continue
            if lien.startswith('#'):
                if lien[1:] and lien[1:] not in ancres:
                    morts.append('%s : ancre %s introuvable dans la page' % (p.name, lien))
                verifies += 1
                continue
            chemin = lien.split('?', 1)[0].split('#', 1)[0]
            if not chemin:
                continue
            verifies += 1
            # 1. un fichier du dossier. « / » et « dossier/ » designent
            #    l'index, comme sur tout serveur : sans cette regle, le lien
            #    vers l'accueil etait compte mort.
            rel = chemin.lstrip('/')
            cible = RACINE / rel
            if not rel or chemin.endswith('/'):
                cible = RACINE / rel / 'index.html'
            if cible.is_file():
                continue
            # 2. une reecriture
            voulu = chemin if chemin.startswith('/') else '/' + chemin
            trouve = False
            for motif, dest in R:
                if motif.match(voulu):
                    if (RACINE / dest.lstrip('/')).is_file():
                        trouve = True
                    break
            if trouve:
                continue
            morts.append('%s -> %s' % (p.name, lien))

    if morts:
        print('  %d LIEN(S) MORT(S) :' % len(morts))
        for m in morts[:20]:
            print('    ' + m)
        if len(morts) > 20:
            print('    … et %d autres.' % (len(morts) - 20))
        sys.exit(1)

    print('  %d liens internes verifies dans %d pages, aucun mort.'
          % (verifies, len(pages)))
    if externes:
        print('  %d domaine(s) externe(s), non suivis : %s'
              % (len(externes), ', '.join(sorted(externes)[:6])))


if __name__ == '__main__':
    main()
