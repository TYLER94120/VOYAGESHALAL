#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Le poids du site, compresse, contre les budgets du cahier des charges.

DEUX BUDGETS, DEUX CAHIERS
--------------------------
  * cahier initial, section 12 : moins de 150 Ko de JavaScript compresse ;
  * cahier V2, section 10 : la refonte visuelle ne doit pas ajouter plus de
    8 Ko compresses a ce qui existait avant elle.

Le second se mesure contre un point de comparaison, pas dans l'absolu : on
prend le poids du JavaScript au commit qui precede la refonte, et on regarde
l'ecart. Sans ce point de comparaison, « +8 Ko » ne veut rien dire.

Les donnees (les banques de questions) ne comptent pas dans le budget
JavaScript : elles sont chargees a la demande, une section a la fois.
"""

import gzip
import pathlib
import re
import subprocess
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
# Le dernier commit d'avant la couche visuelle V2.
AVANT_V2 = '90e27be'

BUDGET_TOTAL = 150 * 1024
BUDGET_AJOUT = 8 * 1024


def comprime(octets):
    return len(gzip.compress(octets, 9))


def poids_js_actuel():
    total, detail = 0, []
    for f in sorted((RACINE / 'js').glob('*.js')):
        n = comprime(f.read_bytes())
        total += n
        detail.append((f.name, n))
    return total, detail


SCRIPT = re.compile(r'<script src="([^"]+)"')


def scripts_de(page_html):
    return SCRIPT.findall(page_html)


def poids_par_page(lire):
    """Ce qu'une PAGE fait telecharger, page par page.

    C'est la seule mesure qui veuille dire quelque chose : personne ne charge
    les quinze fichiers. `section.js` ne sert qu'a la couverture, `photo.js`
    n'est pas sur la grille. Additionner tout le dossier `js` mesure le poids
    du DEPOT, pas celui d'une visite.

    `lire(chemin)` rend les octets d'un fichier, ou None. On passe soit une
    lecture du disque, soit une lecture dans un commit passe : le calcul est
    le meme des deux cotes, ce qui rend la comparaison honnete.
    """
    out = {}
    for nom in sorted(x.name for x in RACINE.glob('*.html')):
        b = lire(nom)
        if b is None:
            continue
        total = 0
        for src in scripts_de(b.decode('utf-8', 'replace')):
            o = lire(src)
            if o is not None:
                total += comprime(o)
        out[nom] = total
    return out


def main():
    total, detail = poids_js_actuel()
    print('  JavaScript du depot, compresse :')
    for nom, n in detail:
        print('    %-18s %6.1f Ko' % (nom, n / 1024))
    print('    %-18s %6.1f Ko' % ('tout le dossier', total / 1024))

    fautes = []

    def duDisque(chemin):
        f = RACINE / chemin
        return f.read_bytes() if f.is_file() else None

    def duCommit(commit):
        rel = RACINE.relative_to(pathlib.Path(
            subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True,
                           text=True, cwd=str(RACINE)).stdout.strip()))
        def lire(chemin):
            r = subprocess.run(['git', 'show', '%s:%s/%s' % (commit, rel, chemin)],
                               capture_output=True, cwd=str(RACINE))
            return r.stdout if r.returncode == 0 else None
        return lire

    print('\n  Ce qu\'une PAGE fait telecharger (JavaScript compresse) :')
    apres = poids_par_page(duDisque)
    avant = poids_par_page(duCommit(AVANT_V2))
    pire = 0
    for nom in sorted(apres):
        a = avant.get(nom)
        ecart = (' %+6.1f' % ((apres[nom] - a) / 1024)) if a is not None else '  neuve'
        print('    %-18s %6.1f Ko %s Ko' % (nom, apres[nom] / 1024, ecart))
        if apres[nom] > BUDGET_TOTAL:
            fautes.append('%s depasse les %d Ko de JavaScript' % (nom, BUDGET_TOTAL // 1024))
        if a is not None:
            pire = max(pire, apres[nom] - a)

    print('    la page qui grossit le plus : %+.1f Ko  (budget +%d Ko)'
          % (pire / 1024, BUDGET_AJOUT // 1024))
    if pire > BUDGET_AJOUT:
        fautes.append('une page prend %.1f Ko de plus, au-dela des %d autorises'
                      % (pire / 1024, BUDGET_AJOUT // 1024))

    # Le CSS et les pages, pour information : ils n'ont pas de budget chiffre,
    # mais un site qui gonfle en silence finit par le payer.
    for dossier, motif in (('css', '*.css'), ('.', '*.html')):
        n = sum(comprime(f.read_bytes())
                for f in sorted((RACINE / dossier).glob(motif)))
        print('  %-22s %6.1f Ko compresse' % (dossier if dossier != '.' else 'pages html', n / 1024))

    if fautes:
        print('')
        for f in fautes:
            print('  FAUTE : ' + f)
        sys.exit(1)
    print('  Les deux budgets sont tenus.')


if __name__ == '__main__':
    main()
