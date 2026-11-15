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
1. Chaque `href` de chaque page du site, resolu comme le ferait le serveur :
   un fichier du dossier, une reecriture de `vercel.json`, une ancre de la page
   elle-meme. Les liens externes ne sont PAS suivis — cette session n'a pas
   d'acces reseau vers eux, et un controle qui dependrait du reseau serait rouge
   un jour sur deux pour rien. Ils sont comptes et listes, pas juges.

2. LE SENS INVERSE, ajoute le 15 novembre. Le point 1 demande « ce lien
   arrive-t-il quelque part ? ». Il ne demande jamais « un lien arrive-t-il
   SUR cette page ? ». Une page que personne ne lie a zero lien mort et reste
   invisible : le defaut est dans la fleche qui manque, pas dans celle qui
   tombe a cote. Les deux questions sont opposees, et seule la premiere etait
   posee.

   Ce controle portait pourtant deja, en tete de fichier, « le maillage
   interne est justement le levier qu'on est en train de reconstruire » — et
   il ne mesurait pas le maillage. Il mesurait les liens morts.

   On suit donc les balises `<a>` depuis l'accueil, et on verifie que chaque
   page que `sitemap.xml` DECLARE vouloir faire indexer est au bout d'un
   chemin. Dire a Google « indexe cette page » sans lui donner un seul lien
   interne vers elle, c'est envoyer deux signaux contraires.

   La profondeur, elle, est MESUREE ET DITE, jamais jugee. Deux clics
   aujourd'hui pour les 53 pages du sitemap. Une page a trois clics n'est pas
   un defaut, et un rouge qui se declenche sur ce qui n'en est pas un apprend
   a ignorer le controle — c'est ecrit vingt lignes plus bas, a propos du
   deux-points de `re.escape`.
"""

import collections
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


def servi(chemin, R):
    """Le fichier que le serveur rendrait pour ce chemin, ou None.

    UNE SEULE COPIE DE CETTE RESOLUTION. Le controle des liens morts et celui
    de l'atteignabilite doivent repondre exactement pareil : si l'un juge
    qu'un chemin mene a `section-la-priere.html` et que l'autre ne sait pas le
    resoudre, le second declare la page injoignable alors qu'elle repond 200.
    C'est la faute du 12 novembre — deux exemplaires d'une meme regle
    derivent toujours — et c'est pourquoi ce code a ete sorti de `main()`
    plutot que recopie a cote.
    """
    rel = chemin.lstrip('/')
    cible = RACINE / rel
    # « / » et « dossier/ » designent l'index, comme sur tout serveur : sans
    # cette regle, le lien vers l'accueil etait compte mort.
    if not rel or chemin.endswith('/'):
        cible = RACINE / rel / 'index.html'
    if cible.is_file():
        return cible
    # une reecriture de vercel.json. On s'arrete a la PREMIERE regle qui
    # correspond, comme le fait le serveur : si sa destination n'existe pas,
    # le chemin ne mene nulle part, et aucune regle suivante ne le sauve.
    voulu = chemin if chemin.startswith('/') else '/' + chemin
    for motif, dest in R:
        if motif.match(voulu):
            f = RACINE / dest.lstrip('/')
            return f if f.is_file() else None
    return None


# Un robot suit les `<a>`. Il ne « suit » pas un `<link rel="canonical">` ni
# une feuille de style : les compter comme des liens de navigation gonflerait
# le maillage d'aretes qui n'en sont pas.
ANCRE = re.compile(r'<a\b[^>]*?href="([^"]+)"', re.S)
SITE = re.compile(r'^https?://(?:www\.)?islampasapas\.fr')


def graphe(pages, R):
    """Qui mene a qui. Les pages sont nommees par leur fichier servi."""
    sortants = {}
    for p in pages:
        cibles = set()
        for lien in ANCRE.findall(p.read_text(encoding='utf-8')):
            # UN `<a>` ECRIT EN ABSOLU VERS LE SITE RESTE UN LIEN INTERNE.
            # Le point 1 le range dans les domaines externes et ne le suit
            # pas, ce qui est juste pour chercher un lien mort. Ici ce serait
            # faux : le robot, lui, arrive sur la page. Mesure du 15 novembre
            # — le site porte 55 href absolus vers lui-meme, et les 55 sont
            # des `<link rel="canonical">`, aucun n'est une navigation. Cette
            # branche ne change donc rien aujourd'hui ; elle est la pour que
            # le jour ou un `<a>` absolu apparait, sa cible ne soit pas
            # annoncee injoignable.
            if SITE.match(lien):
                lien = SITE.sub('', lien) or '/'
            if lien.startswith(('data:', 'mailto:', 'tel:',
                                'http://', 'https://', '//', '#')):
                continue
            chemin = lien.split('?', 1)[0].split('#', 1)[0]
            if not chemin:
                continue
            cible = servi(chemin, R)
            if cible is not None and cible.suffix == '.html' and cible.name != p.name:
                cibles.add(cible.name)
        sortants[p.name] = cibles
    return sortants


def declarees(R):
    """Les fichiers que `sitemap.xml` demande a Google d'indexer."""
    f = RACINE / 'sitemap.xml'
    if not f.is_file():
        return set()
    out = set()
    for u in re.findall(r'<loc>([^<]+)</loc>', f.read_text(encoding='utf-8')):
        chemin = re.sub(r'^https?://[^/]+', '', u.strip()) or '/'
        cible = servi(chemin, R)
        if cible is not None:
            out.add(cible.name)
    return out


def main():
    R = regles()
    pages = sorted(RACINE.glob('*.html'))
    if not pages:
        sys.exit('ARRET : aucune page a controler.')

    morts, externes, verifies = [], set(), 0
    embarques = 0        # data:, mailto:, tel: — ne sortent pas du site
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
            # UN « data: » N'EST PAS UN DOMAINE — CORRIGE LE 8 NOVEMBRE
            #
            # La ligne de bilan annoncait « 4 domaine(s) externe(s), non
            # suivis : , fonts.googleapis.com, fonts.gstatic.com,
            # islampasapas.fr ». Le premier etait VIDE.
            #
            # C'est le favicon, une image SVG posee en clair dans l'attribut :
            # `href='data:image/svg+xml,...xmlns=%27http://www.w3.org/2000/
            # svg%27...'`. Le `//` du xmlns tombait dans `split('/')[2]`, qui
            # rendait une chaine vide. Le compte etait donc faux de un, et le
            # bilan imprimait un nom de domaine qui n'existe pas.
            #
            # Un contenu embarque ne sort pas du site : il n'a pas de domaine
            # et n'a rien a faire dans ce compte. On les compte a part.
            if lien.startswith(('data:', 'mailto:', 'tel:')):
                embarques += 1
                continue
            if lien.startswith(('http://', 'https://', '//')):
                morceaux = lien.split('//', 1)[1].split('/')
                if morceaux and morceaux[0]:
                    externes.add(morceaux[0])
                else:
                    morts.append('%s : lien externe sans domaine, %r'
                                 % (p.name, lien[:60]))
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
            # un fichier du dossier, ou une reecriture : la meme resolution
            # que suit le maillage, pour que les deux ne divergent pas.
            if servi(chemin, R) is not None:
                continue
            morts.append('%s -> %s' % (p.name, lien))

    # ---------------------------------------------------------------- maillage
    sortants = graphe(pages, R)
    entrants = {}
    for depart, cibles in sortants.items():
        for arrivee in cibles:
            entrants.setdefault(arrivee, set()).add(depart)

    # on marche depuis l'accueil, comme un robot qui arrive sur le domaine.
    profondeur = {'index.html': 0}
    file = collections.deque(['index.html'])
    while file:
        ici = file.popleft()
        for suivante in sorted(sortants.get(ici, ())):
            if suivante not in profondeur:
                profondeur[suivante] = profondeur[ici] + 1
                file.append(suivante)

    sitemap = declarees(R)
    injoignables = sorted(n for n in sitemap if n not in profondeur)

    noindex = set()
    for p in pages:
        if re.search(r'<meta[^>]+name="robots"[^>]+noindex',
                     p.read_text(encoding='utf-8')):
            noindex.add(p.name)
    # Une page hors sitemap et sans lien entrant n'est PAS une faute. Les
    # ecrans internes portent `noindex`, et `google460d2c815736f50e.html` doit
    # rester sans lien : c'est un fichier de verification, pas une page du
    # site. Faire rouge sur eux serait un rouge permanent, et un rouge
    # permanent ne se lit plus.
    a_part = sorted(p.name for p in pages
                    if p.name not in sitemap and not entrants.get(p.name))

    if morts:
        print('  %d LIEN(S) MORT(S) :' % len(morts))
        for m in morts[:20]:
            print('    ' + m)
        if len(morts) > 20:
            print('    … et %d autres.' % (len(morts) - 20))
    if injoignables:
        print('  %d PAGE(S) DU SITEMAP QU AUCUN LIEN INTERNE N ATTEINT :'
              % len(injoignables))
        for n in injoignables:
            print('    %s — %d lien(s) entrant(s). Le sitemap demande a Google'
                  ' de l indexer et le site ne la lie pas : deux signaux'
                  ' contraires.' % (n, len(entrants.get(n, ()))))
    if morts or injoignables:
        sys.exit(1)

    print('  %d liens internes verifies dans %d pages, aucun mort.'
          % (verifies, len(pages)))
    print('  %d lien(s) embarque(s) (data:, mailto:, tel:) — pas un domaine.'
          % embarques)
    if externes:
        print('  %d domaine(s) externe(s), non suivis : %s'
              % (len(externes), ', '.join(sorted(externes)[:6])))

    liens = sum(len(c) for c in sortants.values())
    par_prof = collections.Counter(profondeur[n] for n in sitemap)
    print('  %d lien(s) <a> internes, %d page(s) du sitemap toutes atteintes'
          ' depuis l accueil : %s.'
          % (liens, len(sitemap),
             ', '.join('%d a %d clic(s)' % (par_prof[d], d)
                       for d in sorted(par_prof))))
    print('  %d page(s) hors sitemap sans lien entrant, dont %d en noindex'
          ' (ecrans internes) : %s.'
          % (len(a_part), sum(1 for n in a_part if n in noindex),
             ', '.join(n for n in a_part if n not in noindex) or 'aucune autre'))


if __name__ == '__main__':
    main()
