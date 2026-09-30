#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Retire les commentaires du JavaScript et du CSS avant de les servir.

POURQUOI
--------
Ce code est commente comme un cahier de bord : chaque decision porte la raison
qui l'a fait prendre, et souvent la faute qui l'a precedee. C'est voulu, c'est
ce qui rend le projet reprenable, et je n'y touche pas.

Mais ces commentaires partaient dans le navigateur de chaque visiteur. Sur la
page de QCM ils pesaient DOUZE kilo-octets compresses — plus du tiers de ce
que la page telecharge — pour un texte que personne d'autre qu'un
developpeur ne lira jamais. Le budget du cahier (+8 Ko de JavaScript par page
depuis la V1) a fini par sauter a cause de ca, et la mauvaise reponse aurait
ete de couper les commentaires ou de relever le budget.

La source garde donc tout. Ce qui est SERVI est allege. Et le budget se
mesure sur ce qui est servi, puisque c'est ce que les gens telechargent.

CE QU'ON NE FAIT PAS
--------------------
Pas de minification : on ne renomme rien, on ne recolle pas les lignes, on ne
touche pas a une seule instruction. Un fichier servi reste lisible et se
deboggue tel quel dans le navigateur. On enleve des commentaires, c'est tout.

COMMENT ON EVITE DE CASSER DU CODE
----------------------------------
On ne retire QUE les commentaires qui occupent leur ligne entiere. Une barre
oblique au milieu d'une ligne peut etre dans une chaine (« https:// ») ou dans
une expression reguliere ; en debut de ligne, non. C'est volontairement
prudent : on economise un peu moins, et on ne peut pas se tromper.

CE QUI LE VERIFIE — ET CE QUI NE LE VERIFIAIT PAS
-------------------------------------------------
Cet en-tete a longtemps affirme : « on ne se contente pas de le croire :
`controler-allege.mjs` relit chaque fichier allege avec `node --check`, et la
recette complete tourne contre la copie allegee avant publication. »

C'etait faux des deux cotes. `controler-allege.mjs` n'existait pas, et
`publier.py` ne lance aucun controle. Constate le 30 septembre. La phrase la
plus rassurante du projet etait posee sur le seul endroit que rien ne
regardait — et elle a tenu pendant des semaines precisement parce qu'elle
rassurait.

Ce qui existe maintenant, et qui est vrai :

  `outils/controler-allege.py` verifie, pour chaque .js et chaque .css, que
  la sortie est la source MOINS des lignes de commentaire — chaque ligne
  gardee identique et dans l'ordre, chaque ligne retiree reellement un
  commentaire ou du vide — relit chaque .js allege par `node --check`, et
  compare la copie publiee a ce qu'on produit aujourd'hui.

Et une fois, le 30 septembre, les vingt-quatre controles navigateur ont ete
lances contre la copie allegee servie sur le port habituel : tous au vert.
C'est une mesure, pas une garantie ; elle est refaite a la main quand
l'allegement change, et le controle ci-dessus tourne, lui, a chaque ronde.
"""

import re

# Une ligne qui n'est QUE du commentaire ligne : « // ... »
LIGNE_SLASH = re.compile(r'^[ \t]*//.*$')

# Un bloc /* ... */ qui commence et finit sur des lignes a lui.
DEBUT_BLOC = re.compile(r'^[ \t]*/\*')
FIN_BLOC = re.compile(r'\*/[ \t]*$')


def alleger_texte(texte):
    lignes = texte.split('\n')
    out = []
    dans_bloc = False
    for l in lignes:
        if dans_bloc:
            if FIN_BLOC.search(l):
                dans_bloc = False
            continue
        if DEBUT_BLOC.match(l):
            # Un bloc ouvert et referme sur la meme ligne compte aussi, a
            # condition qu'il ne reste rien apres : « /* mot */ » se retire,
            # « /* mot */ var x = 1; » reste, sinon on emporterait du code.
            if FIN_BLOC.search(l):
                continue
            # sinon il court sur plusieurs lignes
            dans_bloc = True
            continue
        if LIGNE_SLASH.match(l):
            continue
        out.append(l)

    # Les lignes vides laissees par les blocs retires : on n'en garde jamais
    # plus d'une d'affilee, pour que le fichier servi reste aere sans etre
    # troue.
    net = []
    vide = False
    for l in out:
        if l.strip() == '':
            if vide:
                continue
            vide = True
        else:
            vide = False
        net.append(l)
    return '\n'.join(net)


def alleger(nom, octets):
    """Les octets a servir pour ce fichier. Tout sauf .js et .css passe tel quel."""
    if not nom.lower().endswith(('.js', '.css')):
        return octets
    return alleger_texte(octets.decode('utf-8')).encode('utf-8')
