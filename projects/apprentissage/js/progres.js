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
  // L'INDEX PLUTOT QUE LES ONZE BANQUES.
  // Mesure du 18 septembre : cette page telechargeait 2 490 Ko de banques
  // entieres — tous les enonces, toutes les reponses, toutes les explications
  // — pour n'en tirer que des nombres et des identifiants. L'index en porte
  // 53 Ko. La methode maison sur les conditions degradees le dit : le reseau
  // n'est presque jamais absent, il est lent, et la meilleure facon de tenir
  // dans un reseau lent est de ne pas demander ce dont on n'a pas besoin.
  // `reglages.js` et `qcm.js` chargent toujours la banque de la section
  // qu'on joue : il leur faut les questions, pas seulement leur nombre.
  Promise.all([
    fetch('data/sections.json').then(function (r) { return r.json(); }),
    fetch('data/index-sections.json').then(function (r) { return r.json(); })
  ])
    .then(function (tout) {
      var sections = tout[0], index = tout[1];
      return sections.map(function (s) {
        return { s: s, ids: (index[s.slug] || { ids: [] }).ids };
      });
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
      // LES ACCORDS. Cette page ecrivait « 1 jours de suite » et
      // « 1 questions vues ». Mesure du 26 septembre en forcant la memoire a
      // 0, 1 puis 2 : c'etait la SEULE page du site a se tromper. L'accueil
      // ecrit bien « 1 jour d'affilée », la grille « 1 section », la
      // couverture « 1 question » — onze endroits font l'accord, celui-ci
      // ecrivait ses libelles en dur.
      //
      // Et c'est la page ou ca se voit le plus : elle n'existe que pour
      // montrer ces trois nombres, et ils sont petits au debut. Quelqu'un
      // qui vient de commencer lit « 1 jours de suite » a son premier
      // passage — le moment ou l'on decide si le site est serieux.
      //
      // En francais zero prend le singulier : « 0 jour », « 0 question ».
      // C'est la regle qu'appliquent deja les dix autres endroits.
      // LA MEME SERIE QUE L'ACCUEIL, calculee par la meme fonction.
      //
      // Mesure du 27 septembre, memoire fabriquee : sept jours de suite puis
      // un trou hier.
      //
      //   accueil        « 7 jours d'affilée »
      //   cette page     « 1 jour de suite »
      //
      // Et avec douze jours et deux trous : 11 contre 1.
      //
      // Il existait deux comptages. `serieComplete` tient compte du JOUR DE
      // GRACE — le filet qui rattrape un jour manque, un gagne tous les cinq
      // jours, deux au maximum. `serieDeJours` ne le connaissait pas : il
      // remontait bêtement jusqu'au premier trou.
      //
      // Le filet existe pour une raison ecrite noir sur blanc dans la methode
      // maison : une serie nue est un piege, « j'ai perdu mes 40 jours,
      // j'arrete », et le mecanisme cense faire revenir devient la raison de
      // partir. Le rattrapage marchait — et la page qu'on ouvre justement
      // pour regarder ses progres annoncait quand meme la cassure. Elle
      // defaisait le filet a elle seule.
      //
      // `serieDeJours` a ete retiree de memoire.js : deux facons de compter
      // la meme chose, c'est une de trop, et c'est toujours la mauvaise qui
      // finit par etre appelee.
      var serie = M.serieComplete(d, M.jourDeAujourdhui()).serie;
      var h = '';
      h += '<div class="chiffres">'
        + '<div class="chiffre"><b>' + serie + '</b><span>'
        + (serie > 1 ? 'jours de suite' : 'jour de suite') + '</span></div>'
        + '<div class="chiffre"><b>' + vues + '</b><span>'
        + (vues > 1 ? 'questions vues' : 'question vue') + '</span></div>'
        + '<div class="chiffre"><b>' + acquises + '</b><span>'
        + (acquises > 1 ? 'acquises' : 'acquise') + '</span></div>'
        + '</div>';

      if (!vues) {
        h += '<p class="c-meta">Tu n\'as pas encore joué. Il n\'y a donc rien à montrer ici — '
          + '<a class="cible-etendue" href="sections.html">commence une section</a>.</p>';
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
