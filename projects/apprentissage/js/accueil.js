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

    // --- Les trois chiffres --------------------------------------------
    var justes = 0;
    for (var id in d.questions) {
      if (Object.prototype.hasOwnProperty.call(d.questions, id)) {
        justes += d.questions[id].justes || 0;
      }
    }
    var ouvertes = {};
    for (var i = 0; i < d.sessions.length; i++) { ouvertes[d.sessions[i].section] = true; }
    var nbOuvertes = 0;
    for (var s in ouvertes) { if (Object.prototype.hasOwnProperty.call(ouvertes, s)) { nbOuvertes += 1; } }

    var c = document.getElementById('chiffres');
    c.innerHTML =
      '<div class="chiffre"><b>' + M.serieDeJours(d, M.jourDeAujourdhui()) + '</b><span>jours de suite</span></div>'
      + '<div class="chiffre"><b>' + justes + '</b><span>bonnes réponses</span></div>'
      + '<div class="chiffre"><b>' + nbOuvertes + '/' + sections.length + '</b><span>sections ouvertes</span></div>';

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

    // --- « Continuer » : les 3 dernieres sections jouees ----------------
    var vues = [], dedans = {};
    for (var j = d.sessions.length - 1; j >= 0 && vues.length < 3; j--) {
      var sl = d.sessions[j].section;
      if (dedans[sl]) { continue; }
      dedans[sl] = true;
      for (var m = 0; m < sections.length; m++) {
        if (sections[m].slug === sl) { vues.push(sections[m]); }
      }
    }
    var zone = document.getElementById('continuer');
    if (!vues.length) {
      /* PREMIERE VISITE : ON PROPOSE, ON NE LAISSE PAS DEVANT LE VIDE.
         Il y avait la une phrase grise — « Tu n'as pas encore joue » — et,
         dessous, sept cents pixels de rien jusqu'a la barre de navigation.
         C'est le premier ecran que voit quelqu'un qui arrive : il doit
         donner envie d'appuyer quelque part, pas ressembler a une page qui
         n'a pas fini de charger.

         Les trois sections proposees sont les trois PREMIERES du parcours,
         dans l'ordre du sommaire. Cet ordre n'est pas de moi : il est dans
         data/sections.json depuis le debut, et il va du plus general au plus
         precis. Autant s'en servir plutot que d'inventer un classement. */
      var debut = [];
      for (var t = 0; t < sections.length && debut.length < 3; t++) {
        if (sections[t].quoi) { debut.push(sections[t]); }
      }
      var hd = '<div class="depart">'
        + '<span class="depart-rosace" data-rosace="12" data-ratio="0.62"'
        + ' data-taille="180" data-couleur="#0F5132" data-trait="1" aria-hidden="true"></span>'
        + '<p class="depart-mot">Rien de commencé pour l\'instant.'
        + ' Voilà par où beaucoup démarrent&nbsp;:</p>'
        + '<div class="pile-9">';
      for (var u = 0; u < debut.length; u++) {
        hd += '<a class="ligne" href="section/' + ech(debut[u].slug) + '">'
          + '<span class="rond">' + icone(debut[u].icone, 20) + '</span>'
          + '<span class="milieu"><span class="nom">' + ech(debut[u].nom) + '</span>'
          + '<span class="quoi">' + ech(debut[u].quoi) + '</span></span>'
          + '<span class="pc" aria-hidden="true">&rarr;</span></a>';
      }
      zone.innerHTML = hd + '</div></div>';
      if (window.IPAP_GEO) { window.IPAP_GEO.poserMotifs(zone); }
      return;
    }
    // La maitrise a besoin des identifiants de chaque section : on ne la
    // devine pas, on charge la banque.
    Promise.all(vues.map(function (sec) {
      return fetch('data/questions/' + sec.slug + '.json')
        .then(function (x) { return x.ok ? x.json() : []; })
        .then(function (b) { return { sec: sec, ids: b.map(function (q) { return q.id; }) }; })
        .catch(function () { return { sec: sec, ids: [] }; });
    })).then(function (lots) {
      var h = '';
      for (var i = 0; i < lots.length; i++) {
        var pc = M.maitrise(d, lots[i].ids);
        h += '<a class="ligne" href="reglages.html?section=' + ech(lots[i].sec.slug) + '">'
          + '<span class="rond">' + icone(lots[i].sec.icone, 20) + '</span>'
          + '<span class="milieu"><span class="nom">' + ech(lots[i].sec.nom) + '</span>'
          + barre(pc) + '</span>'
          + '<span class="pc">' + pc + '%</span></a>';
      }
      zone.innerHTML = h;
    });
  }).catch(function () {
    document.getElementById('continuer').innerHTML =
      '<p style="font-size:14px;color:var(--texte-2)">Les sections n\'ont pas pu être chargées.</p>';
  });
}());
