/* ==========================================================================
   LES 12 SECTIONS — ecran 2 du cahier des charges
   --------------------------------------------------------------------------
   LE COMPTEUR DE QUESTIONS EST REEL, JAMAIS ANNONCE.
   La maquette montre « 1 670 questions » : c'est un exemple, pas une cible a
   recopier. Ici on compte ce qui existe vraiment dans les banques. Une
   section vide affiche « bientot », elle ne ment pas sur son contenu et elle
   n'est pas cliquable — proposer un QCM qui s'ouvre sur rien est pire que de
   dire qu'il n'est pas pret.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function espacer(n) {
    // 1670 -> « 1 670 », avec une espace insecable : un nombre ne se coupe
    // jamais en fin de ligne.
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  fetch('data/sections.json').then(function (r) { return r.json(); })
    .then(function (sections) {
      var d = M.charger();
      return Promise.all(sections.map(function (sec) {
        return fetch('data/questions/' + sec.slug + '.json')
          .then(function (x) { return x.ok ? x.json() : []; })
          .catch(function () { return []; })
          .then(function (b) {
            return {
              sec: sec,
              n: b.length,
              pc: M.maitrise(d, b.map(function (q) { return q.id; }))
            };
          });
      })).then(function (lots) { return { lots: lots, d: d }; });
    })
    .then(function (res) {
      var lots = res.lots, d = res.d;
      var total = 0, ouvertes = 0;
      for (var i = 0; i < lots.length; i++) {
        total += lots[i].n;
        if (lots[i].n) { ouvertes += 1; }
      }
      document.getElementById('total').textContent =
        espacer(total) + (total > 1 ? ' questions' : ' question')
        + ', dans ' + ouvertes + ' section' + (ouvertes > 1 ? 's' : '') + ' sur ' + lots.length;

      // --- Mes erreurs a revoir ---------------------------------------
      var aRevoir = M.aRevoir(d).length;
      if (aRevoir > 0) {
        document.getElementById('zone-erreurs').innerHTML =
          '<a class="ligne" href="qcm.html?section=erreurs" style="border-color:var(--or-bordure);background:var(--or-voile)">'
          + '<span class="rond" style="background:#fff;color:var(--or-texte-2)">'
          + icone('etoile', 20) + '</span>'
          + '<span class="milieu"><span class="nom">Mes erreurs à revoir</span>'
          + '<span class="c-meta">' + aRevoir + ' question' + (aRevoir > 1 ? 's' : '')
          + ', toutes sections confondues</span></span>'
          + '<span class="pc">&rsaquo;</span></a>';
      }

      // --- La grille des 12 -------------------------------------------
      var h = '';
      for (var k = 0; k < lots.length; k++) {
        var l = lots[k], s = l.sec;
        var dedans = '<span class="rond">' + icone(s.icone, 20) + '</span>'
          + '<span class="nom">' + ech(s.nom) + '</span>'
          + '<span class="nb">' + (l.n ? espacer(l.n) + ' question' + (l.n > 1 ? 's' : '')
            : 'bientôt') + '</span>'
          + (l.n ? '<div class="barre"><i style="width:' + Math.max(2, l.pc) + '%"'
            + (l.pc < 10 ? ' data-faible="oui"' : '') + '></i></div>' : '');
        if (l.n) {
          h += '<a class="tuile" href="reglages.html?section=' + ech(s.slug) + '">' + dedans + '</a>';
        } else {
          // Pas de lien : une section sans question n'a rien a montrer.
          h += '<div class="tuile" style="opacity:.55">' + dedans + '</div>';
        }
      }
      document.getElementById('tuiles').innerHTML = h;
    })
    .catch(function () {
      document.getElementById('total').textContent = 'Les sections n\'ont pas pu être chargées.';
    });
}());
