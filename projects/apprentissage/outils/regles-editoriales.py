# -*- coding: utf-8 -*-
"""LA REGLE QUI COMPTE LE PLUS SUR CE SITE, A UN SEUL ENDROIT — 19 NOVEMBRE

Ce site enseigne le Coran, et Mohamed en est l'editeur : ce qui s'y affirme
s'affirme en son nom. Trois familles de mots disent qu'une phrase a franchi la
ligne — elle promet un merite, elle nomme un recueil de hadith, elle attribue
une parole — et une seule chose compte : qu'elles soient LES MEMES partout, et
appariees DE LA MEME FACON partout.

POURQUOI CE FICHIER EXISTE

Le 14 novembre, `MERITES` est passe au niveau module de `controler-questions`,
avec ce motif ecrit noir sur blanc : « les pages s'en servent aussi, et deux
copies d'une regle derivent toujours. » La copie de `controler-sitemap.py` est
restee en place. Mesure du 19 novembre — elle avait derive, DANS LES DEUX
SENS :

    dans controler-questions seul   « efface les peches »
    dans controler-sitemap seul     « celle qui la recite »
                                    « quiconque la recite »
    communs                         14

Autrement dit : un titre pouvait promettre d'effacer les peches, et une
question pouvait dire « quiconque la recite », chacun passant devant le
controle qui ne portait pas le mot. `MERITES` est ici l'UNION EXACTE des deux
listes : 17 mots, aucun invente, aucun retire. Mesure avant adoption : sur les
5 754 morceaux de surface que les controles lisent, l'union ne fait rougir
RIEN de plus que chacune des deux listes seules.

`RECUEILS` et `ATTRIBUTIONS` n'existaient qu'en un exemplaire, dans
`controler-questions.py`. Ils sont recopies ici sans changement — a une
addition pres, dite plus bas et pour une raison mesuree.

ET POURQUOI L'APPARIEMENT EST ICI AUSSI

Les listes etaient partagees, l'APPARIEMENT ne l'etait pas : six `if mot in
plat` recopies dans deux fichiers. Or une sous-chaine ne sait pas ou commence
un mot, et la mesure du 19 novembre a trouve le piege en place :

    « vertu »   40 touches dans tout le texte du site
                dont 35 dans « COUVERTURE » et « couvertures »

C'est le mot le plus souvent touche de toute la regle, et c'est un faux. Il
n'avait encore rougi nulle part par chance : « couverture » n'apparait dans
aucune des surfaces deja lues. Il apparait QUATRE FOIS dans `js/section.js`,
qui n'etait lu par personne jusqu'a ce soir — deux fois dans un selecteur CSS,
une fois dans « l'image de couverture », une fois dans un libelle.

Un faux rouge est pire qu'un trou : il apprend a ne plus lire les rouges.

LA FRONTIERE RETENUE : DEBUT DE MOT, SUFFIXES ADMIS

On exige que le mot COMMENCE un mot, et on n'exige rien de sa fin. C'est ce
qui garde les pluriels et les conjugaisons — « vertus », « vertueux »,
« recompensera », « protegent », « benedictions », « meritent », tous mesures
presents sur le site — tout en refusant « couverture ». Une frontiere des deux
cotes aurait perdu les six.

CE QUE CETTE FRONTIERE PERD, ET C'EST DIT

« ahadith » ne touche plus « hadith », parce que le mot commence ailleurs.
Mesure : « ahadith » n'apparait nulle part sur le site aujourd'hui. Le mot est
donc inscrit tel quel dans ATTRIBUTIONS, plutot que laisse a une sous-chaine
qui le rattrapait par accident. Ce qu'une regle attrape par accident, elle le
lache sans prevenir.

TROIS ETATS, JAMAIS DEUX. Ce fichier dit ce qui est VERIFIE. Ce qu'il ne
couvre pas n'est pas « propre » : il est NON VERIFIE, et ca s'ecrit.
"""
import re

# LE NOM DU TRADUCTEUR — AJOUTE LE 22 NOVEMBRE
#
# C'est la chaine la plus engageante du site. Elle s'affiche 728 fois sur
# 40 pages et accompagne 2 391 des 2 616 cartes : chaque fois qu'un sens est
# montre, il est ATTRIBUE a cette personne. La regle de la ronde le demande —
# « un sens s'attribue, il ne s'affirme jamais au nom du site ».
#
# POURQUOI ELLE ARRIVE ICI. Mesure du 22 novembre : elle etait ECRITE A LA
# MAIN dans six fichiers — `faire-lecon-sourate.py` (une constante),
# `faire-01-sourates.py`, `faire-05-prophetes.py`, `faire-pratique.py`,
# `faire-themes.py` (des litteraux dans le champ `source` des cartes qu'ils
# fabriquent) et `controler-lecons.py`, qui RETAPAIT la valeur attendue au
# lieu de la lire. Ce dernier point est le plus parlant : ce meme fichier lit
# `SEUIL_INDEX` chez le generateur en expliquant que « deux fois le meme
# nombre dans deux fichiers, c'est deux nombres ». Le principe etait applique
# au seuil d'un index et pas au nom d'un traducteur.
#
# Les cartes l'ecrivaient toutes de la meme facon, mesure faite avant d'y
# toucher : la regle est posee avant la divergence, pas apres.
#
# CE QUE CETTE ATTRIBUTION NE REPOSE PAS SUR — ET IL FAUT LE SAVOIR
#
# `fra-muhammadhamidul.json` ne contient AUCUNE metadonnee : ni traducteur,
# ni edition, ni source, ni licence. Rien que `chapter`, `verse`, `text`. Le
# seul element interne qui porte ce nom est LE NOM DU FICHIER. Voir
# `outils/coran/LISEZMOI.md` : verifie / ecarte / NON VERIFIE, et celui-ci
# est non verifie.
TRADUCTEUR = 'Muhammad Hamidullah'

# L'UNION des deux listes du 19 novembre. Un mot ne se retire pas d'ici sans
# une mesure ecrite : chacun est la parce qu'une phrase qui le porte engage
# Mohamed sur un contenu que ce projet ne peut pas sourcer.
MERITES = ('bienfait', 'merite', 'vertu', 'recompense', 'protege',
           'protection', 'guerit', 'guerison', 'exauce', 'benediction',
           'baraka', 'efface les peches', 'equivaut',
           'celui qui la recite', 'celui qui le recite',
           'celle qui la recite', 'quiconque la recite')

RECUEILS = ('boukhari', 'bukhari', 'mouslim', 'sahih muslim', 'abou dawoud',
            'abu dawud', 'tirmidhi', 'ibn maja', 'nasai', 'ahmad ibn hanbal',
            'sahih al', 'sunan', 'muwatta')

# « ahadith » est explicite depuis le 19 novembre : la sous-chaine le
# rattrapait, la frontiere de mot ne le rattrape plus.
ATTRIBUTIONS = ('le prophete a dit', 'le messager a dit',
                "messager d'allah a dit", 'rapporte par', 'hadith', 'ahadith',
                'sunna', 'recueil de', "d'apres abou")

FAMILLES = (('promet un merite', MERITES),
            ('nomme un recueil de hadith', RECUEILS),
            ('attribue une parole', ATTRIBUTIONS))

# `(?:^| )` et pas `\b` : le texte arrive DEJA aplati — accents retires,
# ponctuation remplacee par des espaces — donc un debut de mot y est toujours
# le debut de la chaine ou un espace. `\b` serait vrai apres un chiffre, et
# « 10vertu » n'est pas un mot francais.
_DEBUTS = {mot: re.compile(r'(?:^| )' + re.escape(mot))
           for _, mots in FAMILLES for mot in mots}


def porte(plat, mot):
    """`mot` commence-t-il un mot de `plat` ? `plat` est deja aplati.

    Aplati veut dire : minuscules, accents retires, tout ce qui n'est ni
    lettre ni chiffre remplace par une espace. Chaque appelant a son propre
    aplatisseur — celui des questions garde l'arabe, celui du sitemap non —
    et c'est voulu : ce qui doit etre partage, c'est la FRONTIERE, pas
    l'alphabet.
    """
    return _DEBUTS[mot].search(plat) is not None


def touches(plat):
    """Chaque (famille, mot) que `plat` porte. La boucle des trois familles
    est ici pour qu'elle ne soit pas recopiee non plus.
    """
    for famille, mots in FAMILLES:
        for mot in mots:
            if porte(plat, mot):
                yield famille, mot
