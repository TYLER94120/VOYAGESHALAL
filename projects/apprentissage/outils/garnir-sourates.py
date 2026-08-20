#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajoute a chaque ligne des 114 sourates son NOMBRE DE VERSETS.

POURQUOI CETTE DONNEE, ET PAS UNE AUTRE
---------------------------------------
La page `sourates.html` donnait le numero, le nom arabe et le nom transcrit.
C'est un repere, mais un repere pauvre : « combien de versets dans telle
sourate » est une des questions les plus posees, et la page ne repondait pas.

On a ecarte deux autres donnees pourtant disponibles dans le meme jeu :

  * mecquoise / medinoise — la classification est standard mais DISCUTEE sur
    une poignee de sourates. La publier sans nuance reviendrait a trancher.
  * les versets de prosternation — le compte lui-meme depend de l'ecole
    (14 ou 15). Publier un chiffre sec ici, c'est donner un avis.

Le nombre de versets n'a aucune de ces difficultes : il est le meme dans
toutes les ecoles, dans le mushaf de reference. C'est un FAIT, pas un avis.

TROIS CONTROLES AVANT D'ECRIRE UNE SEULE LIGNE
----------------------------------------------
Le jeu de donnees et `info.json` viennent du meme depot : les faire se
confirmer l'un l'autre ne prouve rien. On controle donc contre des choses
qui ne viennent PAS de ce depot :

  1. Des reperes universellement connus (Al-Fatiha 7, Al-Baqara 286,
     Al-Kawthar 3, 6236 versets au total).
  2. Les 20 lecons de sourate DEJA PUBLIEES, dont le compte avait ete
     verifie verset par verset au moment de les ecrire. Si le jeu de
     donnees contredit une seule d'entre elles, on s'arrete.
  3. Les 114 chapitres presents, numerotes 1 a 114, sans trou.

Au premier desaccord : arret, rien n'est ecrit. Mieux vaut une page pauvre
qu'une page fausse.

RELANCABLE
----------
L'outil se relance sans rien empiler ni casser : il enleve d'abord ce qu'il
avait pose, et il sait reecrire la phrase d'introduction qu'elle soit dans
son etat d'origine ou deja garnie.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
CORAN = RACINE / 'outils' / 'coran' / 'ara-quransimple.json'

# 1. Reperes connus de tous, verifiables dans n'importe quel Coran imprime.
REPERES = {
    1: 7,      # Al-Fatiha, l'ouverture
    2: 286,    # Al-Baqara, la plus longue
    18: 110,   # Al-Kahf
    36: 83,    # Ya-Sin
    55: 78,    # Ar-Rahman
    108: 3,    # Al-Kawthar
    112: 4,    # Al-Ikhlas
    114: 6,    # An-Nas
}
TOTAL_ATTENDU = 6236

MOTS = {'trois': 3, 'quatre': 4, 'cinq': 5, 'six': 6, 'sept': 7,
        'huit': 8, 'neuf': 9, 'dix': 10, 'onze': 11, 'douze': 12,
        'treize': 13, 'quatorze': 14, 'quinze': 15, 'seize': 16,
        'dix-sept': 17, 'dix-huit': 18, 'dix-neuf': 19, 'vingt': 20}


def compter():
    """Nombre de versets par sourate, compte dans le texte arabe lui-meme."""
    d = json.loads(CORAN.read_text(encoding='utf-8'))
    n = {}
    for v in d['quran']:
        n[v['chapter']] = n.get(v['chapter'], 0) + 1
    return n


def controle_reperes(n):
    somme = sum(n.values())
    if somme != TOTAL_ATTENDU:
        sys.exit("ARRET : %d versets au total, %d attendus." % (somme, TOTAL_ATTENDU))
    if sorted(n) != list(range(1, 115)):
        sys.exit("ARRET : les chapitres ne vont pas de 1 a 114 sans trou.")
    for num, attendu in REPERES.items():
        if n.get(num) != attendu:
            sys.exit("ARRET : sourate %d comptee %s, repere connu %d."
                     % (num, n.get(num), attendu))
    print("  controle 1 : %d versets au total, 114 sourates, %d reperes connus OK."
          % (somme, len(REPERES)))


def controle_lecons(n):
    """Le jeu de donnees doit confirmer les lecons deja en ligne."""
    vus = 0
    for page in sorted(RACINE.glob('lecon-*.html')):
        t = page.read_text(encoding='utf-8')
        m = re.search(r'Coran, sourate ([^(<]+) \((\d+)\), ([a-z\-]+) versets\.', t)
        if not m:
            continue
        num, mot = int(m.group(2)), m.group(3)
        if mot not in MOTS:
            sys.exit("ARRET : mot inconnu « %s » dans %s." % (mot, page.name))
        if n.get(num) != MOTS[mot]:
            sys.exit("ARRET : %s annonce %s versets pour la sourate %d, "
                     "le texte en compte %s." % (page.name, MOTS[mot], num, n.get(num)))
        vus += 1
    if vus < 15:
        sys.exit("ARRET : seulement %d lecons de sourate controlees, c'est trop peu "
                 "pour valider le jeu de donnees." % vus)
    print("  controle 2 : %d lecons publiees confirment le jeu de donnees." % vus)


def garnir_lignes(t, n):
    """Pose « N versets » dans chacune des 114 lignes."""
    # On enleve d'abord un eventuel compte deja pose, pour pouvoir relancer
    # sans empiler les mentions.
    t = re.sub(r'<span class="s-nb">[^<]*</span>', '', t)

    poses = [0]

    def poser(m):
        num = int(m.group(1))
        if num not in n:
            sys.exit("ARRET : la ligne %d n'a pas de compte." % num)
        poses[0] += 1
        # On pose le compte DANS le <span class="s-tr">, a cote du nom
        # transcrit, exactement comme le fait deja `s-alt` sur sept lignes.
        # C'est une boite flex qui passe a la ligne toute seule : rien a
        # inventer en CSS, et la ligne ne gagne pas une troisieme rangee.
        # Sur 114 lignes, une rangee de plus, c'est pres de deux mille
        # pixels de defilement en plus.
        return (m.group(0)[:-len('</span>')]
                + '<span class="s-nb">%d versets</span></span>' % n[num])

    # Sept lignes portent deja un <span class="s-alt"> IMBRIQUE dans s-tr.
    # Un `.*?</span>` s'arreterait sur la fermeture de s-alt et le compte
    # finirait a l'interieur. On decrit donc le contenu de s-tr pour ce
    # qu'il est : du texte, ou un span complet, repete.
    motif = re.compile(r'<span class="s-num">(\d+)</span>\s*'
                       r'<span class="s-ar"[^>]*>[^<]*</span>\s*'
                       r'<span class="s-tr">(?:[^<]|<span[^>]*>[^<]*</span>)*</span>', re.S)
    t = motif.sub(poser, t)
    if poses[0] != 114:
        sys.exit("ARRET : %d lignes garnies sur 114." % poses[0])
    return t


def garnir_intro(t, n):
    """La phrase d'introduction doit dire ce que la page contient VRAIMENT.

    Meme discipline que pour les descriptions : on ne promet rien qui ne soit
    sur la page. Le total est COMPTE, jamais recopie — la description annonce
    « 6236 versets en tout », il faut pouvoir le lire sur la page.
    """
    # Espace INSECABLE dans le millier : « 6 236 » ne doit jamais se couper
    # en fin de ligne sur un telephone etroit.
    mille = '%d&nbsp;%03d' % divmod(sum(n.values()), 1000)
    nouvelle = ("Voici la liste complete\n      dans l'ordre du Coran&nbsp;: le numero, "
                "le nom en arabe, le nom\n      transcrit en lettres francaises, et "
                "<strong>le nombre de versets</strong>\n      de chacune. En tout, "
                "<strong>" + mille + " versets</strong>.")
    # On reecrit la phrase quel que soit son etat : d'origine, ou deja garnie
    # par un passage precedent. Un outil qui ne sait traiter que l'etat initial
    # casse silencieusement des qu'on le relance — et c'est justement en le
    # relancant qu'on croit avoir mis la page a jour.
    motif = re.compile(
        r"Voici la liste complete\s+dans l'ordre du Coran&nbsp;:.*?"
        r"transcrit en lettres francaises[^.]*\."
        r"(?:\s*En tout,\s*<strong>[^<]*</strong>\.)?",
        re.S)
    t, nsub = motif.subn(lambda m: nouvelle, t, count=1)
    if nsub != 1:
        sys.exit("ARRET : phrase d'introduction introuvable, elle a change.")
    return t


def main():
    n = compter()
    controle_reperes(n)
    controle_lecons(n)

    page = RACINE / 'sourates.html'
    t = page.read_text(encoding='utf-8')
    t = garnir_lignes(t, n)
    t = garnir_intro(t, n)
    page.write_text(t, encoding='utf-8')

    # Attention : le minimum n'est PAS unique. Trois sourates tiennent en
    # 3 versets (103, 108, 110). Dire « la plus courte » ici serait faux —
    # Al-Kawthar est la plus courte en MOTS, pas en versets.
    mini, maxi = min(n.values()), max(n.values())
    exaequo = sorted(k for k in n if n[k] == mini)
    long_ = max(n, key=lambda k: n[k])
    print("  114 lignes garnies. %d versets au minimum, pour %d sourates (%s). "
          "Au maximum : sourate %d, %d versets."
          % (mini, len(exaequo), ', '.join(str(x) for x in exaequo), long_, maxi))
    print("  Rappel : relancer outils/faire-sitemap.py apres, la date change.")


if __name__ == '__main__':
    main()
