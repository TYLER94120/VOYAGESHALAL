#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lance les controles de navigateur contre LA COPIE ALLEGEE.

POURQUOI CET OUTIL EXISTE
-------------------------
`alleger.py` retire les commentaires du JavaScript et du CSS avant la mise en
ligne. Ce n'est pas un detail de taille : `js/qcm.js` passe de 35 189 octets a
19 237 — 45 % du fichier disparait entre ce qu'on relit et ce que les gens
telechargent.

Or les trente controles de navigateur interrogent `servir.py`, qui sert LA
SOURCE. Ils n'ont donc jamais ouvert le site tel qu'il est reellement servi,
a une exception pres : le 30 septembre, les vingt-quatre controles de
l'epoque ont ete lances une fois contre la copie allegee. L'en-tete de
`controler-allege.py` le dit, et ajoute la bonne objection : « une
verification faite une fois n'est pas une garantie ».

`controler-allege.py` couvre ce qu'on peut verifier sans navigateur : chaque
ligne gardee est identique et dans l'ordre, chaque ligne retiree est bien un
commentaire, et le JavaScript allege s'analyse encore. Ce qu'il ne peut pas
dire, c'est si le site FONCTIONNE une fois allege. Cet outil-la le dit.

CE QU'IL FAIT
-------------
  1. il fabrique la copie allegee dans un dossier temporaire, avec la MEME
     liste de fichiers et le MEME allegement que `publier.py` — importes,
     pas recopies, pour qu'ils ne derivent pas ;
  2. il sert cette copie sur le port 8899 ;
  3. il lance les trente controles de navigateur, qui visent ce port ;
  4. il arrete le serveur et rend le compte.

Le port 8899 est impose par les controles eux-memes. Si quelque chose y
repond deja, l'outil REFUSE au lieu de mesurer le mauvais site — c'est
exactement l'erreur qui a coute une heure le 25 octobre.

MESURE DU 30 OCTOBRE
--------------------
30 controles de navigateur et les 3 controles Python qui interrogent le
serveur, tous lances contre la copie allegee : TOUS VERTS. L'allegement ne
casse rien a cette date. Ce n'est pas une garantie pour demain — c'est
pourquoi cet outil est un outil et non une note.
"""

import pathlib
import shutil
import socket
import subprocess
import sys
import tempfile
import time

import alleger
import publier

ICI = pathlib.Path(__file__).resolve().parent
CONTROLES = ICI / 'controles'
PORT = 8899


def port_pris(port):
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0


def main():
    if port_pris(PORT):
        sys.exit('ARRET : quelque chose repond deja sur le port %d.\n'
                 '        Les controles visent ce port : on mesurerait l\'autre\n'
                 '        site sans le savoir. Arreter d\'abord ce serveur.' % PORT)

    fichiers = publier.a_publier()
    if not fichiers:
        sys.exit('ARRET : rien a servir.')

    dossier = pathlib.Path(tempfile.mkdtemp(prefix='allege-'))
    for rel in fichiers:
        cible = dossier / rel
        cible.parent.mkdir(parents=True, exist_ok=True)
        cible.write_bytes(alleger.alleger(
            rel.name, (publier.SOURCE / rel).read_bytes()))

    js = sum((publier.SOURCE / r).stat().st_size for r in fichiers
             if r.suffix.lower() in ('.js', '.css'))
    servi = sum((dossier / r).stat().st_size for r in fichiers
                if r.suffix.lower() in ('.js', '.css'))
    print('  %d fichiers servis depuis %s' % (len(fichiers), dossier))
    print('  js + css : %.1f Ko a la source, %.1f Ko servis (%.0f %% retires)'
          % (js / 1024, servi / 1024, 100 * (1 - servi / js)))

    serveur = subprocess.Popen(
        [sys.executable, str(ICI / 'servir.py'), str(PORT), str(dossier)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(20):
            if port_pris(PORT):
                break
            time.sleep(0.5)
        else:
            sys.exit('ARRET : le serveur n\'a pas demarre.')

        verts, rouges = [], []
        for f in sorted(CONTROLES.glob('controler-*.mjs')):
            r = subprocess.run(['node', f.name], capture_output=True,
                               text=True, cwd=str(CONTROLES), timeout=300)
            nom = f.stem[len('controler-'):]
            (verts if r.returncode == 0 else rouges).append(nom)
            print('    %-30s %s' % (nom, 'vert' if r.returncode == 0
                                    else 'ROUGE (%d)' % r.returncode))
            if r.returncode != 0:
                for l in (r.stdout + r.stderr).strip().split('\n')[-6:]:
                    print('        ' + l)
    finally:
        serveur.terminate()
        serveur.wait(timeout=10)
        shutil.rmtree(dossier, ignore_errors=True)

    print('\n  %d vert(s), %d rouge(s) contre la copie allegee.'
          % (len(verts), len(rouges)))
    if rouges:
        sys.exit('ROUGE sur la copie allegee : %s.\n'
                 'Le site fonctionne a la source et pas en ligne — c\'est le '
                 'pire cas, et c\'est pour cela que cet outil existe.'
                 % ', '.join(rouges))


if __name__ == '__main__':
    main()
