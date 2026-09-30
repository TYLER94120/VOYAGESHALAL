#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ce qui est SERVI est-il encore le code qu'on a ecrit et controle ?

POURQUOI CE CONTROLE MANQUAIT, ET CE QUE CA VOULAIT DIRE
--------------------------------------------------------
`alleger.py` retire les commentaires du JavaScript et du CSS avant publication.
Ce n'est pas un detail de taille : sur `js/qcm.js`, mesure du 30 septembre,
35 074 octets deviennent 19 220 — 45 % du fichier, 257 lignes, disparaissent
entre ce qu'on relit et ce que les gens telechargent.

Or les trente-deux controles du projet tournent tous contre la SOURCE. Le
serveur local sert `projects/apprentissage/`, pas la copie allegee. Personne
n'avait jamais ouvert le site tel qu'il est reellement servi.

Et l'en-tete d'`alleger.py` affirmait, mot pour mot :

    « Et on ne se contente pas de le croire : `controler-allege.mjs` relit
      chaque fichier allege avec `node --check`, et la recette complete
      tourne contre la copie allegee avant publication. »

Ni l'un ni l'autre n'existait. Le fichier nomme n'etait pas dans le depot, et
`publier.py` ne lance aucun controle. La phrase la plus rassurante du projet
etait posee sur le seul endroit que rien ne regardait.

Le 30 septembre, les vingt-quatre controles navigateur ont ete lances une
fois contre la copie allegee servie sur le port habituel : tous au vert.
L'allegement ne cassait donc rien ce jour-la. Mais une verification faite une
fois n'est pas une garantie, et c'est justement ce que la phrase promettait.

CE QU'IL VERIFIE, POUR CHAQUE .js ET CHAQUE .css
------------------------------------------------
 1. CHAQUE LIGNE GARDEE EST IDENTIQUE, ET DANS L'ORDRE. `alleger.py` promet
    de ne rien renommer, de ne rien recoller, de ne toucher a aucune
    instruction. On le verifie : la sortie doit etre une sous-suite exacte des
    lignes de la source.
 2. CHAQUE LIGNE RETIREE EST BIEN UN COMMENTAIRE, ou une ligne vide. C'est le
    risque reel : une ligne de code qui commence par `/*` dans une chaine, une
    expression reguliere qui se termine par `*/`, et une instruction part avec
    le commentaire sans que personne ne s'en apercoive avant la mise en ligne.
 3. LE JAVASCRIPT ALLEGE S'ANALYSE ENCORE, par `node --check`. Un bloc de
    commentaire mal referme emporterait la suite du fichier : le controle
    d'apres, en navigateur, verrait une page morte sans savoir pourquoi.
 4. CE QUI EST DANS LE DEPOT DE PUBLICATION, quand il est la, est exactement
    ce qu'`alleger.py` produit aujourd'hui. Un fichier retouche a la main de
    ce cote-la ne reviendrait jamais dans la source.
"""

import pathlib
import re
import subprocess
import sys
import tempfile

RACINE = pathlib.Path(__file__).resolve().parent.parent
PUBLICATION = pathlib.Path('/home/user/islampasapas')

sys.path.insert(0, str(RACINE / 'outils'))
import alleger  # noqa: E402  (apres sys.path, volontairement)

# Les memes formes que celles qu'`alleger.py` declare retirer. Ecrites ici
# d'apres sa REGLE, pas importees de lui : s'il se mettait a retirer autre
# chose, c'est precisement ce qu'on veut voir.
COMMENTAIRE = re.compile(r'^[ \t]*(//|/\*)')
FIN_BLOC = re.compile(r'\*/[ \t]*$')


def lignes_retirees(source, allege):
    """Les lignes de la source absentes de la sortie, dans l'ordre.

    On avance en parallele : si la ligne courante de la sortie est la meme
    que celle de la source, les deux avancent ; sinon la source seule avance
    et la ligne compte comme retiree. Si la sortie ne se retrouve pas ainsi
    jusqu'au bout, c'est qu'elle n'est PAS une sous-suite — une ligne a ete
    modifiee, deplacee ou ajoutee.
    """
    a = source.split('\n')
    b = allege.split('\n')
    i = j = 0
    retirees = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            i += 1
            j += 1
        else:
            retirees.append((i + 1, a[i]))
            i += 1
    while i < len(a):
        retirees.append((i + 1, a[i]))
        i += 1
    return retirees, (j == len(b))


def main():
    fichiers = sorted(
        [p for p in RACINE.rglob('*.js') if 'node_modules' not in p.parts
         and 'outils' not in p.parts]
        + [p for p in RACINE.rglob('*.css') if 'node_modules' not in p.parts])
    if not fichiers:
        sys.exit('ARRET : aucun fichier js ou css a controler.')

    fautes = []
    octets_source = octets_servi = 0
    verifies_node = 0

    for f in fichiers:
        rel = f.relative_to(RACINE)
        source = f.read_text(encoding='utf-8')
        servi = alleger.alleger(f.name, f.read_bytes()).decode('utf-8')
        octets_source += len(source.encode('utf-8'))
        octets_servi += len(servi.encode('utf-8'))

        retirees, sous_suite = lignes_retirees(source, servi)
        if not sous_suite:
            fautes.append('%s : le fichier servi n\'est pas la source moins des '
                          'lignes — une ligne a ete modifiee ou ajoutee' % rel)
            continue

        # 2. Chaque ligne retiree doit etre un commentaire ou du vide.
        dans_bloc = False
        for num, l in retirees:
            if dans_bloc:
                if FIN_BLOC.search(l):
                    dans_bloc = False
                continue
            if not l.strip():
                continue
            if COMMENTAIRE.match(l):
                if l.strip().startswith('/*') and not FIN_BLOC.search(l):
                    dans_bloc = True
                continue
            fautes.append('%s ligne %d : retiree du fichier servi alors que ce '
                          'n\'est pas un commentaire — « %s »'
                          % (rel, num, l.strip()[:60]))

        # 3. Le JavaScript allege doit encore s'analyser.
        if f.suffix.lower() == '.js':
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False,
                                             encoding='utf-8') as t:
                t.write(servi)
                chemin = t.name
            r = subprocess.run(['node', '--check', chemin],
                               capture_output=True, text=True)
            pathlib.Path(chemin).unlink()
            verifies_node += 1
            if r.returncode != 0:
                fautes.append('%s : le fichier ALLEGE ne s\'analyse plus — %s'
                              % (rel, (r.stderr or '').strip().split('\n')[-1][:90]))

        # 4. Ce qui est publie est-il bien ce qu'on produit ?
        if PUBLICATION.is_dir():
            cible = PUBLICATION / rel
            if cible.is_file() and cible.read_bytes() != servi.encode('utf-8'):
                fautes.append('%s : la copie publiee differe de ce qu\'alleger.py '
                              'produit aujourd\'hui — elle a ete retouchee a la '
                              'main, ou elle est en retard' % rel)

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes[:25]:
            print('    ' + x)
        if len(fautes) > 25:
            print('    … et %d autres.' % (len(fautes) - 25))
        sys.exit(1)

    print('  %d fichiers js et css : %.1f Ko de source, %.1f Ko servis.'
          % (len(fichiers), octets_source / 1024, octets_servi / 1024))
    print('  Chaque ligne gardee est identique et dans l\'ordre ; chaque ligne')
    print('  retiree est un commentaire ou du vide.')
    print('  %d fichiers JavaScript alleges relus par node --check.' % verifies_node)
    if PUBLICATION.is_dir():
        print('  La copie publiee est exactement ce qu\'alleger.py produit.')


if __name__ == '__main__':
    main()
