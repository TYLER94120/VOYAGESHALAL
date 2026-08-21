#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble une version JOUABLE du QCM en un seul fichier.

POURQUOI
--------
Le site se deploie mal, et des captures d'ecran ne se jouent pas. Cette page
permet de tenir le produit dans la main tout de suite, sur un telephone, en
attendant que le deploiement soit regle.

CE QU'ELLE EST, ET CE QU'ELLE N'EST PAS
---------------------------------------
Elle assemble LE VRAI CODE : le meme CSS, le meme geste, le meme moteur, la
meme banque de questions. Rien n'est reecrit pour la demonstration — sinon
elle prouverait l'existence d'une imitation, pas celle du produit.

La seule difference est technique : les fichiers sont recopies les uns a la
suite des autres au lieu d'etre charges separement, et la banque de questions
est posee dans une variable au lieu d'etre demandee au serveur. Une page
autonome ne peut rien demander a personne.

L'ecran de resultat est inclus, mais pas les pages de navigation : ce qu'on
veut faire sentir, c'est la carte et le geste.
"""

import json
import pathlib
import re
import sys

RACINE = pathlib.Path(__file__).resolve().parent.parent
SORTIE = RACINE / 'outils' / 'demo-qcm.html'

# Combien de questions on emporte. La banque en compte plus de six cents ;
# les recopier toutes ferait une page de plusieurs centaines de kilo-octets
# pour une demonstration qu'on joue vingt questions a la fois.
COMBIEN = 150


def lire(chemin):
    p = RACINE / chemin
    if not p.exists():
        sys.exit('ARRET : %s introuvable.' % chemin)
    return p.read_text(encoding='utf-8')


def main():
    banque = json.loads(lire('data/questions/sens-des-sourates.json'))
    if len(banque) < COMBIEN:
        sys.exit('ARRET : la banque ne contient que %d questions.' % len(banque))

    # On prend un echantillon qui couvre les TROIS formes de question, sinon la
    # demonstration ne montre qu'un tiers du travail.
    par_theme = {}
    for q in banque:
        par_theme.setdefault(q['theme'], []).append(q)
    choisies, i = [], 0
    themes = sorted(par_theme, key=lambda t: -len(par_theme[t]))
    while len(choisies) < COMBIEN:
        pris = 0
        for t in themes:
            if i < len(par_theme[t]) and len(choisies) < COMBIEN:
                choisies.append(par_theme[t][i]); pris += 1
        if not pris:
            break
        i += 1
    if len({q['theme'] for q in choisies}) < 3:
        sys.exit('ARRET : l\'echantillon ne couvre pas les trois formes de question.')

    # Le moteur demande la banque au serveur. Ici il n'y a pas de serveur : on
    # remplace l'appel par la variable, sans toucher au reste du moteur.
    lancement = """
(function () {
  var M = window.IPAP_MEMOIRE, Q = window.IPAP_QCM;
  var reglages = { nombre: 20, mode: 'apprentissage', melanger: true,
                   erreurs: true, serie: true, minuteur: false };
  function demarrer() {
    var d = M.charger();
    var revoir = [], reste = [];
    for (var i = 0; i < IPAP_BANQUE.length; i++) {
      (M.fiche(d, IPAP_BANQUE[i].id).aRevoir ? revoir : reste).push(IPAP_BANQUE[i]);
    }
    var paquet = Q.melanger(revoir).concat(Q.melanger(reste)).slice(0, reglages.nombre);
    var jeu = new Q.Jeu(document, new Q.Session(paquet, reglages, 'sens-des-sourates'));
    // Dans la demonstration, la fin de partie ne change pas de page : il n'y
    // en a qu'une. On pose le resultat par-dessus, et on peut rejouer.
    jeu.terminer = function () {
      var s = this.s;
      var dernier = {}, bute = {}, ordre = [];
      for (var i = 0; i < s.reponses.length; i++) {
        var r = s.reponses[i];
        if (!Object.prototype.hasOwnProperty.call(dernier, r.id)) { ordre.push(r.id); }
        dernier[r.id] = r;
        if (r.juste === false) { bute[r.id] = true; }
      }
      var justes = 0;
      for (var k = 0; k < ordre.length; k++) { if (dernier[ordre[k]].juste) { justes += 1; } }
      var n = ordre.length, pc = n ? Math.round(justes * 100 / n) : 0;
      var butes = 0;
      for (var b in bute) { if (Object.prototype.hasOwnProperty.call(bute, b)) { butes += 1; } }
      var c = 2 * Math.PI * 76, pris = pc / 100 * c;
      document.getElementById('fin').innerHTML =
        '<div class="bandeau"><div class="ornement">' + icone('etoile', 16) + '</div>'
        + '<div class="grand-anneau"><svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">'
        + '<circle cx="84" cy="84" r="76" fill="none" stroke="rgba(255,253,248,0.18)" stroke-width="9"/>'
        + '<circle cx="84" cy="84" r="76" fill="none" stroke="#C9A227" stroke-width="9" stroke-linecap="round"'
        + ' stroke-dasharray="' + pris.toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 84 84)"/></svg>'
        + '<div class="grand-anneau-pc"><b>' + pc + '%</b><span>' + justes + ' sur ' + n + '</span></div></div></div>'
        + '<div class="corps"><div class="chiffres">'
        + '<div class="chiffre"><b>' + justes + '</b><span>justes</span></div>'
        + '<div class="chiffre"><b>' + butes + '</b><span>' + (butes > 1 ? 'ont' : 'a')
        + ' demandé deux essais</span></div>'
        + '<div class="chiffre"><b>' + n + '</b><span>questions</span></div></div>'
        + '<button type="button" class="bouton bouton-vert" id="rejouer">Rejouer vingt questions</button>'
        + '<div class="ornement">' + icone('etoile', 15) + '</div></div>';
      document.getElementById('fin').hidden = false;
      document.getElementById('ecran-qcm').hidden = true;
      document.getElementById('rejouer').addEventListener('click', function () {
        document.getElementById('fin').hidden = true;
        document.getElementById('ecran-qcm').hidden = false;
        demarrer();
      });
    };
    jeu.sortir = function () { jeu.terminer(); };
    jeu.demarrer();
  }
  demarrer();
}());
"""

    page = []
    page.append('<title>Islam pas à pas</title>')
    page.append('<link rel="preconnect" href="https://fonts.googleapis.com">')
    page.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    page.append('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
                'family=Marcellus&family=Source+Sans+3:wght@400;500;600;700&'
                'family=Amiri:wght@400;700&display=swap">')
    page.append('<style>')
    page.append(lire('css/base.css'))
    page.append(lire('css/qcm.css'))
    page.append(lire('css/pages.css'))
    page.append(lire('css/resultat.css'))
    # La demonstration se joue en une page : on centre, on borne, et le fond
    # reste celui du QCM quel que soit le theme du lecteur. Le cahier des
    # charges impose ces couleurs — la page ne suit pas le theme du lecteur,
    # elle garde les siennes.
    page.append("""
    body { background: var(--fond-qcm); }
    .ecran { max-width: 430px; margin: 0 auto; min-height: 100dvh; }
    #fin[hidden], #ecran-qcm[hidden] { display: none; }
    #fin .corps { gap: 18px; padding-bottom: 26px; }
    """)
    page.append('</style>')

    # Le corps de l'ecran de QCM, repris tel quel de qcm.html.
    corps = lire('qcm.html')
    debut = corps.index('<div class="ecran" id="ecran-qcm">')
    fin = corps.index('<script src="js/icones.js">')
    page.append(corps[debut:fin].replace('<noscript>', '<noscript hidden>'))
    page.append('<div class="ecran" id="fin" hidden></div>')

    page.append('<script>')
    page.append('var IPAP_BANQUE = %s;' % json.dumps(choisies, ensure_ascii=False))
    page.append(lire('js/icones.js'))
    page.append(lire('js/memoire.js'))
    page.append(lire('js/geste.js'))
    page.append(lire('js/qcm.js'))
    page.append(lancement)
    page.append('</script>')

    texte = '\n'.join(page)
    SORTIE.write_text(texte, encoding='utf-8')

    # Aucune requete vers l'exterieur n'est toleree, sauf les polices Google :
    # une page autonome qui appelle un serveur ne fonctionne pas chez le
    # lecteur, et la faute est invisible tant qu'on la teste chez soi.
    for appel in re.finditer(r'\bfetch\s*\(', texte):
        sys.exit('ARRET : la page appelle encore fetch(), elle n\'est pas autonome.')
    if 'src="js/' in texte or 'href="css/' in texte:
        sys.exit('ARRET : il reste un fichier lie au lieu d\'etre recopie.')

    print('  %s : %d Ko, %d questions, %d themes'
          % (SORTIE.name, len(texte.encode('utf-8')) // 1024, len(choisies),
             len({q['theme'] for q in choisies})))


if __name__ == '__main__':
    main()
