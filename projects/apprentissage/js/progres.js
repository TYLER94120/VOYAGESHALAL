/* ==========================================================================
   TES PROGRES
   --------------------------------------------------------------------------
   La maitrise d'une section = pourcentage de SES questions dont la derniere
   reponse est juste (section 9). Le denominateur est le nombre total de
   questions de la section, pas le nombre de questions vues : sans ca,
   quelqu'un qui a repondu juste a une seule question sur quatre cents
   afficherait cent pour cent.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;
  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var d = M.charger();
  fetch('data/sections.json').then(function (r) { return r.json(); })
    .then(function (sections) {
      return Promise.all(sections.map(function (s) {
        return fetch('data/questions/' + s.slug + '.json')
          .then(function (x) { return x.ok ? x.json() : []; })
          .catch(function () { return []; })
          .then(function (b) { return { s: s, ids: b.map(function (q) { return q.id; }) }; });
      }));
    })
    .then(function (lots) {
      var vues = 0, acquises = 0, total = 0;
      for (var i = 0; i < lots.length; i++) {
        total += lots[i].ids.length;
        for (var k = 0; k < lots[i].ids.length; k++) {
          var f = M.fiche(d, lots[i].ids[k]);
          if (f.vues > 0) { vues += 1; }
          if (f.derniere === true) { acquises += 1; }
        }
      }
      var h = '';
      h += '<div class="chiffres">'
        + '<div class="chiffre"><b>' + M.serieDeJours(d, M.jourDeAujourdhui()) + '</b><span>jours de suite</span></div>'
        + '<div class="chiffre"><b>' + vues + '</b><span>questions vues</span></div>'
        + '<div class="chiffre"><b>' + acquises + '</b><span>acquises</span></div>'
        + '</div>';

      if (!vues) {
        h += '<p class="c-meta">Tu n\'as pas encore joué. Il n\'y a donc rien à montrer ici — '
          + '<a href="sections.html">commence une section</a>.</p>';
        document.getElementById('progres').innerHTML = h;
        return;
      }

      h += '<div class="pile-11"><h2 class="t-bloc">Section par section</h2>';
      for (var j = 0; j < lots.length; j++) {
        var l = lots[j];
        if (!l.ids.length) { continue; }   // une section vide n'a pas de progres
        var pc = M.maitrise(d, l.ids);
        h += '<div class="ligne"><span class="rond">' + icone(l.s.icone, 20) + '</span>'
          + '<span class="milieu"><span class="nom">' + ech(l.s.nom) + '</span>'
          + '<div class="barre"><i style="width:' + Math.max(2, pc) + '%"'
          + (pc < 10 ? ' data-faible="oui"' : '') + '></i></div></span>'
          + '<span class="pc">' + pc + '%</span></div>';
      }
      h += '</div>';
      h += '<p class="c-meta">La maîtrise compte les questions dont ta dernière réponse '
        + 'est juste, sur le total de la section.</p>';
      document.getElementById('progres').innerHTML = h;
    })
    .catch(function () {
      document.getElementById('progres').innerHTML =
        '<p class="c-meta">Les sections n\'ont pas pu être chargées.</p>';
    });
}());
