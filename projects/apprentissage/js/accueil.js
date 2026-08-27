/* ==========================================================================
   L'ACCUEIL — ecran 1 du cahier des charges
   --------------------------------------------------------------------------
   DEUX MESURES QUI NE SONT PAS LA MEME, ET QU'IL NE FAUT PAS CONFONDRE :

     l'ANNEAU de la carte de reprise = ou en est le QCM en cours
                                        (question 12 sur 50 = 24 %)
     la BARRE de la liste « Continuer » = la maitrise de la section (64 %)

   Le cahier des charges le dit explicitement. Les melanger donnerait a
   quelqu'un l'impression d'avoir appris une section alors qu'il vient
   seulement d'avancer dans une partie.

   RIEN N'EST AFFICHE QUI N'EXISTE PAS
   -----------------------------------
   Pas de carte de reprise s'il n'y a pas de QCM en cours. Pas de liste
   « Continuer » si rien n'a ete commence. On ne remplit pas un ecran avec
   des promesses ou des zeros : on montre moins, et vrai.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function anneau(pourcent) {
    // Rayon 28, circonference 2*PI*28 = 175,9. Le cahier des charges donne
    // « 42 176 » pour 24 % : 175,9 * 0,24 = 42,2. La formule retrouve donc
    // exactement la maquette.
    var c = 2 * Math.PI * 28;
    var pris = Math.max(0, Math.min(100, pourcent)) / 100 * c;
    return '<svg width="66" height="66" viewBox="0 0 66 66" aria-hidden="true">'
      + '<circle cx="33" cy="33" r="28" fill="none" stroke="rgba(255,253,248,0.22)" stroke-width="5"/>'
      + '<circle cx="33" cy="33" r="28" fill="none" stroke="#E3C97A" stroke-width="5"'
      + ' stroke-linecap="round" stroke-dasharray="' + pris.toFixed(1) + ' ' + c.toFixed(1) + '"'
      + ' transform="rotate(-90 33 33)"/></svg>';
  }

  /* L'ANNEAU DU JOUR.
     A ZERO, ON NE DESSINE PAS L'ARC DU TOUT. Un trait arrondi de longueur
     nulle laisse un point dore au sommet du cercle, qui ressemble a une
     salissure et non a un depart. */
  function anneauDuJour(fait, but) {
    var c = 2 * Math.PI * 26;
    var pris = but ? Math.max(0, Math.min(1, fait / but)) * c : 0;
    var h = '<svg width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">'
      + '<circle cx="31" cy="31" r="26" fill="none" stroke="#E6DFD1" stroke-width="5"/>';
    if (pris > 0.5) {
      h += '<circle cx="31" cy="31" r="26" fill="none" stroke="'
        + (fait >= but ? '#C9A227' : '#2F7A52') + '" stroke-width="5"'
        + ' stroke-linecap="round" stroke-dasharray="' + pris.toFixed(1) + ' '
        + c.toFixed(1) + '" transform="rotate(-90 31 31)"/>';
    }
    return h + '</svg>';
  }

  /* CE QU'ON ECRIT AUTOUR DU COMPTEUR.
     Un compteur est un compteur, pas un jugement : il compte des questions
     repondues, il ne dit rien de la pratique de personne. On enonce donc le
     FAIT, sec et exact, et jamais un merite. */
  function noteDuJour(fait, but) {
    if (fait >= but) { return 'Tu peux continuer autant que tu veux.'; }
    if (fait === 0) { return but + ' questions, environ trois minutes.'; }
    return 'Encore ' + (but - fait) + ' question' + (but - fait > 1 ? 's' : '') + '.';
  }

  /* LA SERIE, ET LE FILET.
     Une serie qui repart de zero repart SANS UN MOT : le message est une
     invitation, jamais un constat de perte. Et le jour de grace ne s'annonce
     qu'APRES avoir servi — afficher un stock disponible en ferait une
     permission, et la permission un calcul. */
  function phraseDeSerie(s) {
    var h = '';
    if (s.sauvee) {
      h += '<span class="jour-grace">Ton jour de grâce a gardé ta série.</span>';
    }
    var mot = s.serie > 0
      ? s.serie + ' jour' + (s.serie > 1 ? 's' : '') + " d'affilée"
      : 'Ta série commence aujourd\'hui';
    if (s.serie > 0 && s.serie === s.record && s.record > 1) {
      mot += ' — c\'est ton record';
    } else if (s.serie === 0 && s.record > 1) {
      mot = 'Ton record est de ' + s.record + ' jours';
    }
    return h + '<span class="jour-serie" data-vive="' + (s.serie > 0 ? 'oui' : 'non') + '">'
      + '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5'
      + '2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z" stroke="currentColor" stroke-width="1.4" '
      + 'stroke-linejoin="round"/></svg>' + mot + '</span>';
  }

  function barre(pc) {
    // Sous 10 %, un trait vert de trois pixels ne se voit pas. On le passe en
    // or : afficher « 8 % » a cote d'une barre invisible revient a dire zero.
    return '<div class="barre"><i style="width:' + Math.max(2, pc) + '%"'
      + (pc < 10 ? ' data-faible="oui"' : '') + '></i></div>';
  }

  Promise.all([
    fetch('data/sections.json').then(function (r) { return r.json(); }),
    Promise.resolve(M.charger())
  ]).then(function (res) {
    var sections = res[0];
    var d = res[1];

    // --- L'ANNEAU DU JOUR ----------------------------------------------
    // L'objectif vaut DIX QUESTIONS, juste ou non. On mesure le travail fait,
    // pas la reussite : un objectif qu'on peut echouer est un objectif qu'on
    // n'affronte plus, et les jours de fatigue sont exactement ceux ou la
    // serie a besoin qu'on ouvre le site.
    var jour = M.jourDeAujourdhui();
    var fait = Math.min(M.MINI_POUR_LE_JOUR, (d.parJour && d.parJour[jour]) || 0);
    var but = M.MINI_POUR_LE_JOUR;
    var serie = M.serieComplete(d, jour);

    document.getElementById('zone-jour').innerHTML =
      '<div class="jour">'
      + '<div class="jour-anneau">' + anneauDuJour(fait, but)
      + '<div class="jour-anneau-txt">' + fait + '/' + but + '</div></div>'
      + '<div class="jour-quoi">'
      + '<span class="jour-titre">' + (fait >= but ? 'Objectif du jour atteint'
                                                   : "L'objectif du jour") + '</span>'
      + '<span class="jour-note">' + noteDuJour(fait, but) + '</span>'
      + phraseDeSerie(serie)
      + '</div></div>';

    // --- La carte de reprise, seulement si un QCM est vraiment en cours -
    if (d.reprise && d.reprise.ids && d.reprise.ids.length) {
      var r = d.reprise;
      var sec = null;
      for (var k = 0; k < sections.length; k++) {
        if (sections[k].slug === r.section) { sec = sections[k]; }
      }
      var fait = (r.reponses || []).length;
      var pc = r.total ? Math.round(fait * 100 / r.total) : 0;
      document.getElementById('zone-reprise').innerHTML =
        '<a class="reprise" href="qcm.html?section=' + ech(r.section) + '&reprise=1">'
        + '<div class="anneau">' + anneau(pc) + '<div class="anneau-pc">' + pc + '%</div></div>'
        + '<div class="quoi"><span class="sur">Tu en étais là</span>'
        + '<span class="nom">' + ech(sec ? sec.nom : r.section) + '</span>'
        + '<span class="ou">question ' + (fait + 1) + ' sur ' + r.total + ' · reprendre</span>'
        + '</div></a>';
    }

    // --- LE CHEMIN ------------------------------------------------------
    // Les douze sections dans l'ordre CONSEILLE — celui de data/sections.json,
    // du plus general au plus precis. Une page qui montrerait une etape faite
    // apres deux etapes a venir donnerait un chemin troue : rien ne serait
    // faux, et ca suffirait a detruire la lecture du trajet.
    var ordre = sections.slice().sort(function (a, b) { return (a.num || 99) - (b.num || 99); });
    Promise.all(ordre.map(function (sec) {
      return fetch('data/questions/' + sec.slug + '.json')
        .then(function (x) { return x.ok ? x.json() : []; })
        .then(function (b) { return { ids: b.map(function (q) { return q.id; }) }; })
        ['catch'](function () { return { ids: [] }; });
    })).then(function (lots) {
      if (window.IPAP_CHEMIN) {
        window.IPAP_CHEMIN.poser(document.getElementById('chemin'), ordre, lots, d);
      }
    });
  }).catch(function () {
    document.getElementById('chemin').innerHTML =
      '<p style="font-size:14px;color:var(--texte-2)">Les sections n\'ont pas pu être chargées.</p>';
  });
}());
