#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pose les donnees structurees (JSON-LD) dans les pages du site.

POURQUOI UN OUTIL ET PAS DU HTML ECRIT A LA MAIN
------------------------------------------------
Le bloc JSON-LD repete des chiffres qui vivent ailleurs : le nombre de choses
qu'une lecon apprend, sa duree, son titre. Recopies a la main, ils deviennent
faux le jour ou une lecon change — c'est arrive cinq fois dans ce projet, chaque
fois avec un nombre recopie d'une source qui bougeait. Tout est donc **lu dans
`app.js`**, la seule source de verite du catalogue.

CE QU'ON DECLARE, ET CE QU'ON NE DECLARE PAS
--------------------------------------------
On ne declare que ce que la page montre vraiment. En particulier :

- **pas de `Course`** : pour Google, un « cours » suppose des sessions, un
  formateur, souvent un diplome. Une lecon de six minutes n'en est pas un, et
  reclamer une carte enrichie qu'on ne merite pas est le genre de mensonge que
  ce site s'interdit. On declare `LearningResource`, qui dit exactement ce que
  c'est : une ressource d'apprentissage gratuite, en francais, qui enseigne N
  choses en N minutes ;
- **pas de fil d'Ariane** : les pages n'en affichent aucun, et Google interdit
  de baliser ce qui n'est pas visible ;
- **pas de note, pas d'avis, pas d'auteur nomme** : rien de tout cela n'existe ;
- **pas de logo** : `partage.png` est une image de partage, pas un logo. On ne
  la fait pas passer pour ce qu'elle n'est pas.

La description reprend mot pour mot la balise `description` de la page : deux
textes differents pour la meme page, c'est deja une contradiction.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://islampasapas.fr"
NOM = "Islam pas a pas"

DEBUT = "<!-- donnees structurees : generees par outils/poser-json-ld.py, ne pas editer a la main -->"
FIN = "<!-- fin des donnees structurees -->"


def catalogue():
    """Les lecons publiees, lues dans app.js."""
    src = (RACINE / "app.js").read_text(encoding="utf-8")
    bloc = src[src.index("var CATALOGUE = ["):src.index("function nomParcours")]
    lecons = []
    for morceau in bloc.split("\n    {")[1:]:
        ident = re.search(r"id: '([^']+)'", morceau)
        if not ident or "publiee: true" not in morceau:
            continue
        titre = re.search(r"titre: '((?:[^'\\]|\\.)*)'", morceau).group(1)
        lecons.append({
            "id": ident.group(1),
            "titre": titre.replace("\\'", "'"),
            "url": re.search(r"url: '([^']+)'", morceau).group(1),
            "minutes": int(re.search(r"minutes: (\d+)", morceau).group(1)),
            "acquis": int(re.search(r"acquis: (\d+)", morceau).group(1)),
            "unite": re.search(r"unite: '((?:[^'\\]|\\.)*)'", morceau).group(1).replace("\\'", "'"),
            "unites": re.search(r"unites: '((?:[^'\\]|\\.)*)'", morceau).group(1).replace("\\'", "'"),
        })
    return lecons


def sourates(page: pathlib.Path) -> list:
    """Les 114 sourates, LUES DANS LA PAGE elle-meme.

    Jamais une liste recopiee ici : une deuxieme copie des 114 noms, c'est
    la garantie qu'un jour les deux divergeront sans que personne le voie.
    On lit le numero, le nom transcrit, et le lien vers la lecon s'il existe.
    """
    t = page.read_text(encoding="utf-8")
    out = []
    # Le nom transcrit contient parfois des spans imbriques (nom alternatif,
    # nombre de versets) : on prend le texte AVANT le premier span interne.
    motif = re.compile(
        r'<span class="s-num">(\d+)</span>\s*'
        r'<span class="s-ar"[^>]*>[^<]*</span>\s*'
        r'<span class="s-tr">([^<]*)(?:<span[^>]*>[^<]*</span>)*</span>\s*'
        r'(?:<a class="s-lien" href="([^"]+)")?',
        re.S)
    for m in motif.finditer(t):
        nom = m.group(2).strip()
        if not nom:
            sys.exit("ARRET : sourate %s sans nom transcrit." % m.group(1))
        e = {"@type": "ListItem", "position": int(m.group(1)), "name": nom}
        if m.group(3):
            e["url"] = SITE + "/" + m.group(3)
        out.append(e)
    # Les positions doivent aller de 1 a 114 sans trou ni doublon.
    if [e["position"] for e in out] != list(range(1, len(out) + 1)):
        sys.exit("ARRET : les numeros de sourate ne se suivent pas.")
    return out


def description_de(page: pathlib.Path) -> str:
    """La description que la page affiche deja. On ne la reecrit pas."""
    m = re.search(r'<meta name="description" content="([^"]*)"', page.read_text(encoding="utf-8"))
    return m.group(1) if m else ""


def poser(page: pathlib.Path, donnees: dict) -> bool:
    """Insere ou remplace le bloc, juste avant </head>. Renvoie True si change."""
    texte = page.read_text(encoding="utf-8")
    bloc = (DEBUT + "\n<script type=\"application/ld+json\">\n"
            + json.dumps(donnees, ensure_ascii=False, indent=2)
            + "\n</script>\n" + FIN + "\n")

    if DEBUT in texte:
        avant = texte
        texte = re.sub(re.escape(DEBUT) + r".*?" + re.escape(FIN) + r"\n?",
                       bloc, texte, count=1, flags=re.S)
        if texte == avant:
            return False
    else:
        texte = texte.replace("</head>", bloc + "</head>", 1)

    page.write_text(texte, encoding="utf-8")
    return True


def main():
    lecons = catalogue()
    faits = 0

    # --- l'accueil : ce qu'est le site, et rien de plus -------------------
    accueil = RACINE / "index.html"
    faits += poser(accueil, {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": SITE + "/#site",
        "name": NOM,
        "url": SITE + "/",
        "inLanguage": "fr",
        "description": description_de(accueil),
        "isAccessibleForFree": True,
    })

    # --- chaque lecon : une ressource d'apprentissage ---------------------
    for l in lecons:
        page = RACINE / l["url"]
        if not page.exists():
            print("ABSENT : " + l["url"], file=sys.stderr)
            continue
        unite = l["unite"] if l["acquis"] == 1 else l["unites"]
        faits += poser(page, {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            "name": l["titre"],
            "url": SITE + "/" + l["url"],
            "inLanguage": "fr",
            "description": description_de(page),
            "learningResourceType": "lecon",
            "educationalLevel": "debutant",
            # `teaches` dit ce que la lecon apprend vraiment, avec son compte.
            # Le compte vient du catalogue, jamais recopie.
            "teaches": "%d %s" % (l["acquis"], unite),
            "timeRequired": "PT%dM" % l["minutes"],
            "isAccessibleForFree": True,
            "isPartOf": {"@id": SITE + "/#site"},
        })

    # --- la page des lecons : la liste, dans l'ordre du catalogue ---------
    parcours = RACINE / "parcours.html"
    faits += poser(parcours, {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Toutes les lecons",
        "url": SITE + "/parcours.html",
        "inLanguage": "fr",
        "description": description_de(parcours),
        "numberOfItems": len(lecons),
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1,
             "name": l["titre"], "url": SITE + "/" + l["url"]}
            for i, l in enumerate(lecons)
        ],
    })

    # --- les 114 sourates : une liste ordonnee, c'est exactement ce que c'est --
    #
    # On enumere, comme pour la page des lecons. L'objection etait le poids :
    # 114 entrees font 10 177 octets de texte, sur une page qui en fait 34 952.
    # Mais ce JSON est tres repetitif, donc il se compresse presque entierement.
    # MESURE, pas estimation : la page compressee passe de 4 615 a 5 671 octets.
    # Le cout reel pour le telephone est de 1 056 octets — un vingtieme de ce
    # que le texte brut laisse croire.
    #
    # Les noms et les numeros sont LUS DANS LA PAGE, jamais recopies ici : si
    # la liste change, la declaration change avec elle. Le lien n'est mis que
    # pour les sourates qui ont vraiment une lecon.
    sourates_page = RACINE / "sourates.html"
    entrees = sourates(sourates_page)
    if len(entrees) != 114:
        sys.exit("ARRET : %d sourates lues dans la page, 114 attendues." % len(entrees))
    faits += poser(sourates_page, {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Les 114 sourates du Coran",
        "url": SITE + "/sourates.html",
        "inLanguage": "fr",
        "description": description_de(sourates_page),
        "numberOfItems": len(entrees),
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": entrees,
    })

    # --- le QCM ------------------------------------------------------------
    #
    # `Quiz` est bien le type juste. Mais la carte enrichie de Google exige
    # que les QUESTIONS ET LEURS REPONSES soient dans le balisage — c'est
    # precisement ce qu'on refuse de publier : le visiteur lirait les reponses
    # dans les resultats de recherche et le jeu n'existerait plus.
    # On declare donc ce que la page est, sans les questions. Pas de carte
    # enrichie, mais rien de faux non plus. On ne reclame pas ce qu'on ne
    # merite pas, et on n'abime pas le jeu pour un encadre.
    quiz = RACINE / "quiz.html"
    faits += poser(quiz, {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": "Le QCM",
        "url": SITE + "/quiz.html",
        "inLanguage": "fr",
        "description": description_de(quiz),
        "learningResourceType": "quiz",
        "educationalLevel": "debutant",
        "isAccessibleForFree": True,
        "isPartOf": {"@id": SITE + "/#site"},
    })

    total = len(lecons) + 4  # accueil, parcours, sourates, quiz
    print("JSON-LD : %d page(s) modifiee(s) sur %d declarees" % (faits, total))
    print("  lecons declarees : %d, total enseigne : %d"
          % (len(lecons), sum(l["acquis"] for l in lecons)))
    print("  sourates declarees : %d, dont %d avec une lecon"
          % (len(entrees), sum(1 for e in entrees if "url" in e)))


if __name__ == "__main__":
    main()
