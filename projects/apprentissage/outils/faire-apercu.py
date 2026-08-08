#!/usr/bin/env python3
"""
Fabrique un apercu du site en UN SEUL fichier, a partir des vrais fichiers.

A quoi ca sert : le site est un site classique a plusieurs pages, et c'est
tres bien comme ca. Mais pour le faire relire ou valider par quelqu'un, il
faut parfois un seul fichier autonome, sans serveur. Ce script le genere.

IMPORTANT : le site N'A PAS BESOIN de ce script pour fonctionner ni pour
etre mis en ligne. On depose le dossier tel quel sur Vercel ou Netlify.
Ce script ne sert qu'a produire un apercu jetable. Il ne modifie aucun
fichier du site, il ecrit seulement apercu.html.

Usage :
    python3 outils/faire-apercu.py
"""

import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent

# Nom de fichier de la page -> nom court de la vue dans l'apercu.
VUES = [
    ("index.html", "accueil"),
    ("lecon-al-fatiha.html", "al-fatiha"),
    ("lecon-invocations-matin.html", "invocations-matin"),
    ("lecon-six-piliers-foi.html", "six-piliers-foi"),
    ("lecon-priere-gestes.html", "priere-gestes"),
    ("lecon-alphabet-arabe.html", "alphabet-arabe"),
    ("parcours.html", "programme"),
    ("sourates.html", "sourates"),
    ("chemin.html", "chemin"),
]


def corps_de_page(chemin: pathlib.Path) -> str:
    """Recupere le bloc <div class="page">...</div> d'une page."""
    texte = chemin.read_text(encoding="utf-8")
    avant_script = texte.split('<script src="app.js">')[0]
    debut = avant_script.find('<div class="page">')
    if debut == -1:
        raise SystemExit(f'{chemin.name} : bloc <div class="page"> introuvable')
    return avant_script[debut:].strip()


def main() -> int:
    style = (RACINE / "style.css").read_text(encoding="utf-8")
    logique = (RACINE / "app.js").read_text(encoding="utf-8")

    gabarits = []
    for fichier, vue in VUES:
        corps = corps_de_page(RACINE / fichier)
        gabarits.append(f'<template data-vue="{vue}">\n{corps}\n</template>')

    # Correspondance lien -> vue, pour intercepter la navigation.
    liens = {"index.html": "accueil", "chemin.html": "chemin"}
    for fichier, vue in VUES:
        liens[fichier] = vue
    table = ",\n      ".join(f'"{k}": "{v}"' for k, v in liens.items())

    routeur = """
  var CIBLES = {
      %s
  };

  var hote = document.getElementById('vue');

  function aller(vue) {
    var gabarit = document.querySelector('template[data-vue="' + vue + '"]');
    if (!gabarit) { return; }

    // On repart du gabarit d'origine a chaque fois : etat propre, et aucun
    // ecouteur de clic qui s'empilerait a la reouverture d'une lecon.
    hote.innerHTML = '';
    hote.appendChild(gabarit.content.cloneNode(true));

    if (vue === 'accueil')       { ippRendreAccueil(hote); }
    else if (vue === 'programme'){ ippRendreOffre(hote); }
    else if (vue === 'sourates') { /* page de repere, rien a piloter */ }
    else if (vue === 'chemin')  { ippRendreChemin(hote); }
    else                        { ippDemarrerLecon(vue, hote); }

    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var lien = e.target.closest ? e.target.closest('a[href]') : null;
    if (!lien) { return; }
    var vue = CIBLES[lien.getAttribute('href')];
    if (vue) { e.preventDefault(); aller(vue); }
  });

  aller('accueil');
""" % table

    note = (
        '<p class="note-pied" style="max-width:680px;margin:0 auto;padding:0 20px 34px;'
        'text-align:center">Apercu du site en un seul fichier. Deux differences avec la '
        'version en ligne&nbsp;: la police des titres (Playfair Display) ne se charge pas '
        'ici, et les pages sont assemblees ensemble au lieu d\'etre des adresses separees. '
        'Tout le reste est le vrai site.</p>'
    )

    sortie = "\n".join([
        # Ce fichier recopie tout le contenu du site. Indexe, il ferait du
        # contenu duplique. robots.txt le bloque deja ; cette balise est une
        # seconde barriere pour le cas ou il serait servi autrement.
        '<meta name="robots" content="noindex,nofollow">',
        "<!-- FICHIER GENERE - NE PAS MODIFIER A LA MAIN.",
        "     Produit par outils/faire-apercu.py a partir de index.html, chemin.html,",
        "     des lecons, de style.css et de app.js. Pour le mettre a jour :",
        "         python3 outils/faire-apercu.py",
        "     Le site lui-meme n'a pas besoin de ce fichier. -->",
        "<title>Islam pas a pas — apercu du site</title>",
        "",
        "<style>",
        style,
        "</style>",
        "",
        '<div id="vue"></div>',
        note,
        "",
        "\n\n".join(gabarits),
        "",
        "<script>",
        logique,
        "</script>",
        "<script>",
        "(function () {",
        "  'use strict';",
        routeur,
        "}());",
        "</script>",
        "",
    ])

    cible = RACINE / "apercu.html"
    cible.write_text(sortie, encoding="utf-8")
    print(f"apercu.html ecrit : {len(sortie)} caracteres, {len(VUES)} vues")
    return 0


if __name__ == "__main__":
    sys.exit(main())
