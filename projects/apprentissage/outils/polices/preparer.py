# -*- coding: utf-8 -*-
"""Les vraies polices du site, en local, pour que les controles mesurent juste.

POURQUOI CE DOSSIER EXISTE
--------------------------
Tous les controles de navigateur coupent les requetes externes :

    ctx.route('**', (r) => url.startsWith(B) ? r.continue() : r.abort())

C'est voulu — un controle ne doit pas dependre du reseau. Mais la consequence
etait passee inapercue pendant des semaines : les trois polices du site
arrivent de Google, donc Chromium ne les a JAMAIS eues. Il mesurait avec les
polices de secours declarees dans base.css :

    --titre:  'Marcellus', Georgia, serif
    --corps:  'Source Sans 3', system-ui, ...
    --arabe:  'Amiri', 'Scheherazade New', serif

Georgia n'est pas installee ici non plus, et system-ui dans un conteneur sans
bureau tombe sur DejaVu Sans. Chaque largeur de caractere etait donc fausse,
et avec elle tout ce qui depend de la mise en page : debordements, cibles de
44 px, retours a la ligne, ponctuation orpheline.

CE QUE FAIT CE FICHIER
----------------------
Il garde la feuille de style de Google telle qu'elle est servie et remplace
seulement les adresses des .woff2 par des fichiers poses ici. Le navigateur
reste coupe du reseau : c'est le controle qui lui repond.

On ne telecharge que les sous-ensembles qui servent au site, latin et arabe.
Les autres (cyrillique, grec, vietnamien, latin etendu) ont un unicode-range
qui ne couvre aucun caractere de nos pages : les demander ne changerait rien
a la mesure. Le francais, lui, tient entier dans « latin » — les lettres
accentuees, les guillemets, l'espace insecable et jusqu'au oe de « coeur ».

Les fichiers portent le nom que Google leur donne. Source Sans 3 est une
police variable : les quatre graisses du site (400 500 600 700) pointent vers
le MEME fichier. Nommer d'apres la graisse avait produit quatre copies
identiques, et un total de 369 Ko qui n'existait pas. Le vrai total est plus
bas, et le nom d'origine ne peut pas mentir.

CE QU'IL NE FAIT PAS
--------------------
Rien n'est publie : publier.py exclut outils/. Ces fichiers ne pesent que
sur le depot, jamais sur une page.

A RELANCER si Google change de version (v30, v20...) : les anciennes adresses
cessent d'etre servies, et un controle qui ne trouve plus sa police le dit.
"""
import json
import pathlib
import re
import subprocess
import sys

ICI = pathlib.Path(__file__).resolve().parent
CSS = ICI / 'google.css'
ADRESSE = ('https://fonts.googleapis.com/css2?family=Marcellus'
           '&family=Source+Sans+3:wght@400;500;600;700'
           '&family=Amiri:wght@400;700&display=swap')
# Les seuls sous-ensembles que le site peut afficher.
GARDES = ('latin', 'arabic')
BLOC = re.compile(r"/\* (?P<sous>[a-z-]+) \*/\s*@font-face \{(?P<corps>.*?)\}", re.S)


def telecharger(url, vers):
    r = subprocess.run(['curl', '-sS', '-o', str(vers), url])
    return r.returncode == 0 and vers.exists() and vers.stat().st_size > 0


def main():
    if not CSS.exists() or '--css' in sys.argv:
        if not telecharger(ADRESSE, CSS):
            print('ECHEC : la feuille de style de Google n\'est pas arrivee.')
            return 1
        print('feuille de style telechargee')

    texte = CSS.read_text(encoding='utf-8')
    carte, blocs = {}, 0
    for m in BLOC.finditer(texte):
        if m.group('sous') not in GARDES:
            continue
        blocs += 1
        url = re.search(r"url\((https://[^)]+)\)", m.group('corps')).group(1)
        # Le nom que Google donne au fichier : une adresse, un fichier. Les
        # quatre graisses de Source Sans 3 partagent le meme, c'est normal.
        carte[url] = url.rsplit('/', 1)[1]

    if not carte:
        print('ECHEC : aucun bloc latin ou arabe dans la feuille de style.')
        return 1

    for url, nom in sorted(carte.items()):
        if (ICI / nom).exists():
            continue
        if not telecharger(url, ICI / nom):
            print('ECHEC telechargement %s' % nom)
            return 1
        print('telecharge %s' % nom)

    (ICI / 'carte.json').write_text(
        json.dumps(carte, indent=1, sort_keys=True) + '\n', encoding='utf-8')
    fichiers = sorted(set(carte.values()))
    total = sum((ICI / n).stat().st_size for n in fichiers)
    print('%d blocs latin ou arabe, %d fichiers distincts, %.1f Ko'
          % (blocs, len(fichiers), total / 1024.0))
    for n in fichiers:
        print('   %-44s %7d octets' % (n, (ICI / n).stat().st_size))
    return 0


if __name__ == '__main__':
    sys.exit(main())
