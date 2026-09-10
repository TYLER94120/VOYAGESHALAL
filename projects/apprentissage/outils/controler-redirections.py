#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Relit les redirections de vercel.json et la page d'erreur.

POURQUOI CE CONTROLE EST SEPARE DES AUTRES
------------------------------------------
Une redirection ne se voit nulle part sur le site : aucune page n'y mene,
aucun lien interne ne la traverse. `controler-liens.py` verifie le maillage
entre les pages qui existent ; il ne peut rien dire d'une adresse morte que
seul Google detient encore. C'est pourtant la que la faute est la plus
silencieuse : une redirection cassee ne derange personne d'ici, et perd un
visiteur venu de la recherche.

Le serveur local n'aide pas non plus — `servir.py` applique les reecritures,
pas les redirections. On relit donc la configuration elle-meme, et on la
confronte aux fichiers presents.

CE QU'IL VERIFIE
----------------
 1. chaque destination existe vraiment, reecritures suivies ;
 2. chaque ancienne adresse a bien disparu du dossier — sinon le fichier
    l'emporte et la redirection ne s'applique jamais ;
 3. aucune adresse n'est redirigee deux fois ;
 4. AUCUNE CHAINE : une destination ne doit pas etre elle-meme redirigee.
    Deux sauts au lieu d'un, c'est du budget de parcours gaspille, et trois
    redirections qui se pointent l'une l'autre font une boucle ;
 5. la page d'erreur existe, porte noindex, et n'est pas dans le sitemap.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = 'https://islampasapas.fr'


def main():
    conf = json.loads((RACINE / 'vercel.json').read_text(encoding='utf-8'))
    reecritures = {r['source']: r['destination'] for r in conf.get('rewrites', [])}
    redirections = conf.get('redirects', [])
    fautes = []

    def fichier_de(adresse):
        """Le fichier reellement servi pour une adresse, reecritures suivies."""
        if adresse in reecritures:
            return RACINE / reecritures[adresse].lstrip('/')
        if adresse in ('/', ''):
            return RACINE / 'index.html'
        return RACINE / adresse.lstrip('/')

    sources = [r['source'] for r in redirections]
    for r in redirections:
        v, n = r['source'], r['destination']

        if not fichier_de(n).is_file():
            fautes.append('%s mene a %s, qui ne correspond a aucun fichier'
                          % (v, n))
        if (RACINE / v.lstrip('/')).is_file():
            fautes.append('%s existe encore comme fichier : le fichier gagne '
                          'et la redirection ne sert jamais' % v)
        if not r.get('permanent'):
            fautes.append('%s n\'est pas permanente : une adresse supprimee '
                          'pour de bon merite un 301, pas un 302' % v)
        # 4. Pas de chaine.
        if n in sources:
            fautes.append('%s mene a %s, qui est elle-meme redirigee — deux '
                          'sauts au lieu d\'un' % (v, n))

    vus = [s for s in sources if sources.count(s) > 1]
    for s in sorted(set(vus)):
        fautes.append('%s est redirigee %d fois' % (s, sources.count(s)))

    # 5. La page d'erreur.
    p404 = RACINE / '404.html'
    if not p404.is_file():
        fautes.append('404.html est absente : une adresse inconnue tombe sur '
                      'la page d\'erreur de l\'hebergeur')
    else:
        t = p404.read_text(encoding='utf-8')
        m = re.search(r'<meta name="robots" content="([^"]+)">', t)
        if not m or 'noindex' not in m.group(1):
            fautes.append('404.html ne porte pas noindex')
        liens = re.findall(r'href="(/[^"#]*)"', t)
        vivants = [l for l in liens if fichier_de(l).is_file()]
        if len(vivants) < 3:
            fautes.append('404.html ne propose que %d sortie(s) vivante(s) ; '
                          'une page d\'erreur qui ne mene nulle part est une '
                          'impasse de plus' % len(vivants))
        sitemap = (RACINE / 'sitemap.xml').read_text(encoding='utf-8') \
            if (RACINE / 'sitemap.xml').is_file() else ''
        if '%s/404.html' % SITE in sitemap:
            fautes.append('404.html est annoncee dans sitemap.xml')

    if fautes:
        print('  %d FAUTE(S) — le lot est refuse :' % len(fautes))
        for x in fautes:
            print('    ' + x)
        sys.exit(1)

    print('  %d redirections permanentes, toutes vers un fichier existant.'
          % len(redirections))
    print('  Aucune ancienne adresse ne subsiste, aucune chaine, aucun doublon.')
    print('  404.html : noindex, absente du sitemap, et elle propose des sorties.')


if __name__ == '__main__':
    main()
