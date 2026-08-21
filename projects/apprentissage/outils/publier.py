#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Publie le site vers le depot qui sert islampasapas.fr.

LE PIEGE QUE CET OUTIL FERME
----------------------------
Le site vit maintenant a deux endroits :

  * `VOYAGESHALAL/projects/apprentissage/` — la SOURCE, avec les generateurs
    de questions, les donnees brutes du Coran, et l'historique du travail ;
  * `TYLER94120/Islampasapas` — ce qui est SERVI, et rien d'autre.

Le 21 aout, ces deux copies avaient sept jours d'ecart sans que personne le
sache : tout le travail partait dans la premiere, et le site servait la
seconde, figee. On a cherche le probleme du cote de Vercel pendant une heure.

Deux copies qui se recopient a la main derivent toujours. Celle-ci se recopie
donc par une commande, jamais a la main, et l'outil REFUSE de publier si les
deux ne se recoupent pas apres coup.

CE QUI NE PART PAS
------------------
`outils/` : les generateurs et les cinq megaoctets de donnees brutes du Coran
ne servent qu'a FABRIQUER les questions. Le site n'en a pas besoin.
Les `.md` : ce sont des notes de travail.
"""

import filecmp
import pathlib
import shutil
import subprocess
import sys

SOURCE = pathlib.Path(__file__).resolve().parent.parent
CLONE = pathlib.Path('/home/user/islampasapas')

# Ce qui ne traverse pas.
EXCLUS = {'outils', '.git', '.gitignore', '__pycache__'}


def git(dossier, *args, **kw):
    r = subprocess.run(['git'] + list(args), capture_output=True, text=True,
                       cwd=str(dossier))
    if kw.get('exigeant') and r.returncode != 0:
        sys.exit('ARRET : git %s a echoue.\n%s' % (' '.join(args), r.stderr.strip()))
    return r.stdout.strip()


def a_publier():
    """Les fichiers du site, chemins relatifs, dans l'ordre."""
    out = []
    for p in sorted(SOURCE.rglob('*')):
        rel = p.relative_to(SOURCE)
        if any(part in EXCLUS for part in rel.parts):
            continue
        if p.is_file():
            out.append(rel)
    return out


def main():
    if not (CLONE / '.git').is_dir():
        sys.exit('ARRET : %s n\'est pas un clone git.\n'
                 'Cloner d\'abord : git clone https://github.com/TYLER94120/islampasapas %s'
                 % (CLONE, CLONE))

    fichiers = a_publier()
    if not fichiers:
        sys.exit('ARRET : rien a publier.')
    if not any(f.name == 'index.html' for f in fichiers):
        sys.exit('ARRET : pas d\'index.html. On ne publie pas un site sans accueil.')

    # On vide le clone de tout ce qui n'est pas .git, puis on recopie. Une
    # simple copie par-dessus laisserait vivre eternellement les fichiers
    # supprimes depuis — c'est exactement comme ca qu'un ancien site survit.
    for p in CLONE.iterdir():
        if p.name == '.git':
            continue
        shutil.rmtree(p) if p.is_dir() else p.unlink()

    for rel in fichiers:
        cible = CLONE / rel
        cible.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SOURCE / rel, cible)

    # CONTROLE APRES COUP, PAS AVANT : les deux copies doivent se recouper
    # fichier par fichier. Sans ca, l'outil promet une synchronisation qu'il
    # ne verifie pas.
    manquants, differents = [], []
    for rel in fichiers:
        cible = CLONE / rel
        if not cible.exists():
            manquants.append(str(rel))
        elif not filecmp.cmp(SOURCE / rel, cible, shallow=False):
            differents.append(str(rel))
    en_trop = []
    for p in sorted(CLONE.rglob('*')):
        rel = p.relative_to(CLONE)
        if rel.parts and rel.parts[0] == '.git':
            continue
        if p.is_file() and rel not in fichiers:
            en_trop.append(str(rel))

    if manquants or differents or en_trop:
        print('ARRET : les deux copies ne se recoupent pas.')
        for nom, liste in (('manquants', manquants), ('differents', differents),
                           ('en trop', en_trop)):
            if liste:
                print('  %s : %s' % (nom, ', '.join(liste[:6])))
        sys.exit(1)

    print('  %d fichiers recopies, les deux copies se recoupent.' % len(fichiers))

    etat = git(CLONE, 'status', '--porcelain')
    if not etat:
        print('  rien de neuf : le site publie est deja a jour.')
        return

    ajoutes = len([l for l in etat.split('\n') if l.startswith('?') or l.startswith('A')])
    print('  %d ligne(s) de changement.' % len(etat.split('\n')))
    print('\n  Pour publier :')
    print('    cd %s' % CLONE)
    print('    git add -A && git commit -m "..." && git push origin HEAD:main')


if __name__ == '__main__':
    main()
