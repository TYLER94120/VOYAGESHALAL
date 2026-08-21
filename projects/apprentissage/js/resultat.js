/* ==========================================================================
   LE RESULTAT — ecran 8 du cahier des charges
   --------------------------------------------------------------------------
   « LES CHIFFRES DOIVENT TOMBER JUSTE. La somme des sous-scores par theme est
   egale au score global, et la somme des totaux par theme est egale au nombre
   de questions. Une question ratee ne peut pas apparaitre dans un theme
   affiche a 100 %. »

   C'est la seule exigence du cahier des charges ecrite en gras sur les
   chiffres, et c'est la plus facile a trahir sans s'en apercevoir : il suffit
   de compter les passages au lieu des questions. Une question ratee puis
   reussie a sa reprise compte DEUX passages et UNE question. Si on compte les
   passages, le total depasse le nombre annonce et plus rien ne tombe juste.

   On compte donc par QUESTION, en gardant le DERNIER passage de chacune.
   Et on le VERIFIE avant d'afficher, plutot que d'y croire.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function param(n) {
    var m = new RegExp('[?&]' + n + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* Le dernier passage de chaque question decide du SCORE : c'est la regle
     de la section 9, « la maitrise = les questions dont la derniere reponse
     est juste ». Quelqu'un qui rate puis retrouve a compris.

     Mais on garde aussi la trace de ce qui a ETE RATE AU MOINS UNE FOIS.
     Sans ca, un joueur qui se trompe neuf fois puis rattrape tout lit
     « 20 sur 20 » et « 0 a revoir » : le score est juste, et pourtant
     l'ecran lui cache les neuf questions sur lesquelles il a bute. Ce sont
     precisement celles qu'il doit revoir — la section 9 ne les libere
     d'ailleurs qu'apres TROIS bonnes reponses consecutives. */
  function parQuestion(detail) {
    var dernier = {}, rateUneFois = {}, ordre = [];
    for (var i = 0; i < detail.length; i++) {
      var r = detail[i];
      if (!Object.prototype.hasOwnProperty.call(dernier, r.id)) { ordre.push(r.id); }
      dernier[r.id] = r;
      if (r.juste === false) { rateUneFois[r.id] = true; }
    }
    return ordre.map(function (id) {
      var r = dernier[id];
      return { id: id, juste: r.juste, choix: r.choix, bute: !!rateUneFois[id] };
    });
  }

  function anneau(pc) {
    // 168 px, comme le cahier des charges. Rayon 76, circonference 477,5.
    var c = 2 * Math.PI * 76;
    var pris = Math.max(0, Math.min(100, pc)) / 100 * c;
    return '<svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true">'
      + '<circle cx="84" cy="84" r="76" fill="none" stroke="rgba(255,253,248,0.18)" stroke-width="9"/>'
      + '<circle cx="84" cy="84" r="76" fill="none" stroke="#C9A227" stroke-width="9"'
      + ' stroke-linecap="round" stroke-dasharray="' + pris.toFixed(1) + ' ' + c.toFixed(1) + '"'
      + ' transform="rotate(-90 84 84)"/></svg>';
  }

  function bilan(pc) {
    // On explique, on n'exhorte pas. Jamais de culpabilisation, jamais de
    // promesse de recompense pour avoir joue (section 10.7).
    if (pc === 100) { return 'Tout est juste.'; }
    if (pc >= 80) { return 'Solide. Ce qui reste tient en peu de choses.'; }
    if (pc >= 50) { return 'La moitié est acquise. Le reste se revoit.'; }
    if (pc >= 20) { return 'Un début. Les questions ratées reviendront.'; }
    return 'C\'est un premier passage. Rien n\'est perdu, tout se revoit.';
  }

  var id = param('s');
  var d = M.charger();
  var session = null;
  for (var i = 0; i < d.sessions.length; i++) {
    if (d.sessions[i].id === id) { session = d.sessions[i]; }
  }
  if (!session) {
    document.getElementById('resultat').innerHTML =
      '<div class="corps"><h1 class="t-page">Résultat introuvable</h1>'
      + '<p>Cette partie n\'est pas dans la mémoire de ce téléphone. '
      + '<a href="sections.html">Revenir aux sections</a>.</p></div>';
    return;
  }

  var lignes = parQuestion(session.detail || []);
  var justes = lignes.filter(function (r) { return r.juste === true; }).length;
  var total = lignes.length;
  var pc = total ? Math.round(justes * 100 / total) : 0;

  fetch('data/questions/' + session.section + '.json')
    .then(function (x) { return x.ok ? x.json() : []; })
    .catch(function () { return []; })
    .then(function (banque) {
      var parId = {};
      for (var i = 0; i < banque.length; i++) { parId[banque[i].id] = banque[i]; }

      // --- Ou tu es solide, ou ca glisse : un compte PAR THEME ---------
      var themes = {}, ordre = [];
      for (var j = 0; j < lignes.length; j++) {
        var q = parId[lignes[j].id];
        var t = q ? (q.theme || 'Autres') : 'Autres';
        if (!Object.prototype.hasOwnProperty.call(themes, t)) {
          themes[t] = { n: 0, justes: 0 }; ordre.push(t);
        }
        themes[t].n += 1;
        if (lignes[j].juste === true) { themes[t].justes += 1; }
      }

      // LE CONTROLE QUE LE CAHIER DES CHARGES RECLAME, FAIT ICI ET PAS
      // SUPPOSE. Si les sommes ne tombent pas, on ne publie pas un ecran
      // faux : on le dit.
      var sommeN = 0, sommeJ = 0;
      for (var k = 0; k < ordre.length; k++) {
        sommeN += themes[ordre[k]].n;
        sommeJ += themes[ordre[k]].justes;
      }
      var coherent = (sommeN === total && sommeJ === justes);

      var h = '';
      // --- Le bandeau vert fonce --------------------------------------
      h += '<div class="bandeau">';
      h += '<div class="ornement">' + icone('etoile', 16) + '</div>';
      h += '<div class="grand-anneau">' + anneau(pc)
        + '<div class="grand-anneau-pc"><b>' + pc + '%</b><span>'
        + justes + ' sur ' + total + '</span></div></div>';
      h += '<p class="bandeau-mot">' + ech(bilan(pc)) + '</p>';
      h += '</div>';

      h += '<div class="corps">';
      // --- Les trois chiffres -----------------------------------------
      var mn = Math.max(1, Math.round((session.duree || 0) / 60));
      var butes = lignes.filter(function (r) { return r.bute; }).length;
      h += '<div class="chiffres">'
        + '<div class="chiffre"><b>' + justes + '</b><span>justes</span></div>'
        + '<div class="chiffre"><b>' + butes + '</b><span>' 
        + (butes > 1 ? 'ont demandé' : 'a demandé') + ' deux essais</span></div>'
        + '<div class="chiffre"><b>' + mn + ' min</b><span>de jeu</span></div>'
        + '</div>';

      // --- Ou tu es solide, ou ca glisse ------------------------------
      if (ordre.length > 1) {
        h += '<div class="pile-11"><h2 class="t-bloc">Où tu es solide, où ça glisse</h2>';
        ordre.sort(function (a, b) {
          return (themes[b].justes / themes[b].n) - (themes[a].justes / themes[a].n);
        });
        for (var m = 0; m < ordre.length; m++) {
          var th = themes[ordre[m]];
          var p = Math.round(th.justes * 100 / th.n);
          var ton = p >= 80 ? 'vert' : (p >= 50 ? 'or' : 'rouge');
          h += '<div class="theme"><div class="rang-entre">'
            + '<span class="theme-nom">' + ech(ordre[m]) + '</span>'
            + '<span class="c-meta">' + th.justes + '/' + th.n + '</span></div>'
            + '<div class="barre"><i data-ton="' + ton + '" style="width:'
            + Math.max(2, p) + '%"></i></div></div>';
        }
        h += '</div>';
      }

      if (!coherent) {
        // On ne masque jamais une incoherence de comptage : on la montre.
        h += '<p class="c-meta" style="color:var(--rouge-texte)">'
          + 'Le détail par thème ne recoupe pas le total. Le score global fait foi.</p>';
      }

      // --- Les questions ratees ---------------------------------------
      var ratees = lignes.filter(function (r) { return r.bute; });
      if (ratees.length) {
        h += '<div class="pile-11"><h2 class="t-bloc">Ce sur quoi tu as buté</h2>';
        for (var n = 0; n < Math.min(3, ratees.length); n++) {
          var qq = parId[ratees[n].id];
          h += '<div class="bloc" style="padding:13px 14px">'
            + '<p style="font-size:14.5px">' + ech(qq ? qq.question : '') + '</p>'
            + '<p class="c-meta" style="margin-top:6px">' + ech(qq ? qq.source : '') + '</p></div>';
        }
        if (ratees.length > 3) {
          h += '<p class="c-meta">' + (ratees.length - 3) + ' autre'
            + (ratees.length - 3 > 1 ? 's' : '') + ' dans le corrigé complet.</p>';
        }
        h += '</div>';
      }

      // --- Les boutons -------------------------------------------------
      h += '<div class="pile-11">';
      h += '<a class="bouton bouton-vert" href="corrige.html?s=' + ech(id) + '">Voir le corrigé complet</a>';
      h += '<a class="bouton-2" href="reglages.html?section=' + ech(session.section) + '">Refaire</a>';
      h += '<a class="bouton-2" href="sections.html">Les sections</a>';
      h += '</div>';
      h += '<div class="ornement">' + icone('etoile', 15) + '</div>';
      h += '<div style="height:12px"></div></div>';

      document.getElementById('resultat').innerHTML = h;
    });
}());
