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
    ("lecon-prophetes-coran.html", "prophetes-coran"),
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
        gabarits.append(
            f'<section class="vue-doc" data-vue="{vue}">\n{corps}\n</section>')

    # Correspondance lien -> vue, pour intercepter la navigation.
    liens = {"index.html": "accueil", "chemin.html": "chemin"}
    for fichier, vue in VUES:
        liens[fichier] = vue
    table = ",\n      ".join(f'"{k}": "{v}"' for k, v in liens.items())

    routeur = """
  var CIBLES = {
      %s
  };

  var vues = {};
  var sections = document.querySelectorAll('.vue-doc');
  if (!sections.length) { return; }

  // Instantane pris avant toute modification : c'est lui qui sert de gabarit.
  for (var i = 0; i < sections.length; i++) {
    vues[sections[i].getAttribute('data-vue')] = sections[i].innerHTML;
  }

  // A partir d'ici seulement, on masque tout sauf la vue courante. Sans
  // JavaScript, cette classe n'est jamais posee et tout reste visible.
  document.body.className += ' pilote-vues';

  function aller(vue) {
    var el = document.querySelector('.vue-doc[data-vue="' + vue + '"]');
    if (!el) { return; }

    el.innerHTML = vues[vue];
    for (var j = 0; j < sections.length; j++) {
      if (sections[j] === el) { sections[j].className = 'vue-doc actif'; }
      else { sections[j].className = 'vue-doc'; }
    }

    if (vue === 'accueil')        { ippRendreAccueil(el); }
    else if (vue === 'programme') { ippRendreOffre(el); }
    else if (vue === 'sourates')  { /* page de repere, rien a piloter */ }
    else if (vue === 'chemin')    { ippRendreChemin(el); }
    else                          { ippDemarrerLecon(vue, el); }

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
        'text-align:center">Apercu du site en un seul fichier. Les pages sont assemblees '
        'ensemble au lieu d\'etre des adresses separees&nbsp;; tout le reste est le vrai '
        'site. Si ton lecteur n\'execute pas les scripts, les pages s\'affichent simplement '
        'les unes apres les autres&nbsp;: tu vois tout, mais les boutons ne repondent pas.</p>'
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
        # Sans JavaScript, .pilote-vues n'existe pas et toutes les vues restent
        # visibles : le fichier se lit comme un document.
        ".vue-doc { display: block; border-top: 1px solid rgba(201,168,76,0.16); }",
        ".pilote-vues .vue-doc { display: none; border-top: 0; }",
        ".pilote-vues .vue-doc.actif { display: block; }",
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

    # Deuxieme sortie : un fichier vraiment autonome, avec son en-tete HTML
    # complet. On l'ouvre depuis un telephone sans aucune connexion, ce qui
    # evite les pages "Page not found" quand on n'est pas identifie sur la
    # plateforme. Il charge en plus les vraies polices quand il y a du reseau.
    entete = (
        '<!doctype html>\n<html lang="fr">\n<head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        '<meta name="robots" content="noindex,nofollow">\n'
        '<meta name="theme-color" content="#0b1a0f">\n'
        '<title>Islam pas a pas — version a ouvrir directement</title>\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700'
        '&family=DM+Sans:wght@400;500;600;700&family=Scheherazade+New:wght@400;700'
        '&display=swap" rel="stylesheet">\n'
        '<style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0}'
        'img,svg{display:block}button{font:inherit}</style>\n'
        '</head>\n<body>\n'
    )
    autonome = entete + sortie + "\n</body>\n</html>\n"
    (RACINE / "apercu-hors-ligne.html").write_text(autonome, encoding="utf-8")
    print(f"apercu-hors-ligne.html ecrit : {len(autonome)} caracteres")
    return 0


if __name__ == "__main__":
    sys.exit(main())
