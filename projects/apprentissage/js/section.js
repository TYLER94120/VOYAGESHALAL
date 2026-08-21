/* ==========================================================================
   LA COUVERTURE DE SECTION — cahier des charges V2, section 8
   --------------------------------------------------------------------------
   Elle s'intercale entre la grille des douze et l'ecran de reglages : on
   voit d'abord CE QU'IL Y A dans une section, on decide ensuite d'en faire
   un QCM. La grille ne dit qu'un nom et un nombre ; ici on dit les themes,
   la maitrise, et de quoi la section parle.

   D'OU VIENNENT LES CHIFFRES
   --------------------------
   Tous de la banque et de la memoire du telephone, aucun n'est annonce.
   Une section vide le dit et n'offre pas de bouton : proposer un QCM qui
   s'ouvre sur rien est pire que de dire qu'il n'est pas pret.

   LE NOM ARABE
   ------------
   `nomArabe` est lu dans data/sections.json et affiche seulement s'il y est.
   Il n'y est pour aucune section : traduire douze titres francais en arabe
   serait une invention de ma part, et ce site ne publie pas d'arabe non
   verifie. Le jour ou quelqu'un les fournit, une ligne par section suffit.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;
  var GEO = window.IPAP_GEO;
  var P = window.IPAP_PHOTO;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function espacer(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* Le slug vient soit de /section/<slug>, soit de ?section=<slug>. Les deux
     doivent marcher : la premiere est l'adresse du cahier V2, la seconde
     reste valable pour tout lien deja pose ailleurs. */
  function slugDemande() {
    var m = /\/section\/([^/?#]+)/.exec(window.location.pathname);
    if (m) { return decodeURIComponent(m[1]); }
    var q = /[?&]section=([^&]+)/.exec(window.location.search);
    return q ? decodeURIComponent(q[1]) : '';
  }

  function echouer(message) {
    document.getElementById('couverture').innerHTML =
      '<div class="corps"><h1 class="t-page">Section introuvable</h1>'
      + '<p style="margin-top:12px">' + message
      + ' <a href="sections.html">Voir les sections</a>.</p></div>';
  }

  var slug = slugDemande();
  if (!slug) { echouer('Aucune section n\'est demandée.'); return; }

  Promise.all([
    fetch('data/sections.json').then(function (r) { return r.json(); }),
    fetch('data/questions/' + slug + '.json')
      .then(function (r) { return r.ok ? r.json() : []; })
      ['catch'](function () { return []; }),
    P ? P.charger() : Promise.resolve({})
  ]).then(function (tout) {
    var sections = tout[0], banque = tout[1];
    var sec = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].slug === slug) { sec = sections[i]; }
    }
    if (!sec) { return echouer('Cette section n\'existe pas.'); }

    document.title = sec.nom + ' — Islam pas à pas';

    var d = M.charger();
    var ids = banque.map(function (q) { return q.id; });
    var pc = M.maitrise(d, ids);

    // Les themes, dans l'ordre ou ils apparaissent dans la banque.
    var themes = [], vus = {};
    for (var k = 0; k < banque.length; k++) {
      var t = banque[k].theme;
      if (t && !Object.prototype.hasOwnProperty.call(vus, t)) { vus[t] = 1; themes.push(t); }
    }

    var h = '';

    // --- La couverture : photo, retour, titre ------------------------
    var dessus =
      '<a class="couv-retour" href="sections.html" aria-label="Revenir aux sections">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M14.5 5.5L8 12l6.5 6.5" stroke="#F2E7C8" stroke-width="2" '
      + 'stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
      + '<div class="couv-pied">'
      + '<div class="couv-sur">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
      + '<path d="M12 1.6l2.7 5 5.6-2.5-2.5 5.6 5 2.7-5 2.7 2.5 5.6-5.6-2.5-2.7 5-2.7-5-5.6 2.5'
      + '2.5-5.6-5-2.7 5-2.7-2.5-5.6 5.6 2.5z" stroke="#E3C97A" stroke-width="1.3" '
      + 'stroke-linejoin="round"/></svg>'
      + '<span>Section ' + sec.num + ' sur ' + sections.length + '</span></div>'
      + '<h1 class="couv-titre">' + ech(sec.nom) + '</h1>'
      + (sec.nomArabe ? '<div class="couv-arabe" lang="ar" dir="rtl">'
          + ech(sec.nomArabe) + '</div>' : '')
      + '</div>';

    h += P ? P.bloc({
      cle: 'couverture/' + slug, hauteur: 328, rayon: 0, premiere: true,
      legende: 'Couverture : ' + sec.nom, dessus: dessus
    }) : '';

    // --- Le corps ----------------------------------------------------
    h += '<div class="corps couv-corps" id="principal">';
    h += '<p class="couv-quoi">' + ech(sec.quoi || '') + '</p>';

    h += '<div class="chiffres">'
      + '<div class="chiffre"><b>' + (banque.length ? espacer(banque.length) : '—')
      + '</b><span>question' + (banque.length > 1 ? 's' : '') + '</span></div>'
      + '<div class="chiffre"><b>' + (themes.length || '—') + '</b><span>thème'
      + (themes.length > 1 ? 's' : '') + '</span></div>'
      + '<div class="chiffre"><b' + (pc ? ' data-ton="or"' : '') + '>'
      + (banque.length ? pc + '%' : '—') + '</b><span>maîtrisé</span></div>'
      + '</div>';

    // Les trois niveaux, avec ce qu'ils contiennent reellement. On le dit ici
    // plutot que de laisser la personne le decouvrir a l'ecran suivant.
    if (banque.length) {
      var parNiveau = { 1: 0, 2: 0, 3: 0 };
      for (var m = 0; m < banque.length; m++) {
        var nv = banque[m].niveau || 2;
        parNiveau[nv] = (parNiveau[nv] || 0) + 1;
      }
      var LIB = { 1: 'Début', 2: 'Intermédiaire', 3: 'Expert' };
      h += '<div class="pile-11"><h2 class="t-bloc">Les trois niveaux</h2>'
        + '<div class="couv-niveaux">';
      for (var v = 1; v <= 3; v++) {
        h += '<div class="couv-niveau"><b>' + parNiveau[v] + '</b><span>'
          + LIB[v] + '</span></div>';
      }
      h += '</div><p class="c-meta">Le niveau vient de ce qui rend une question '
        + 'difficile et qui se mesure&nbsp;: ce qu\'il y a à lire, à quel point '
        + 'les réponses se ressemblent, et si la source est de celles qu\'on '
        + 'apprend en premier.</p></div>';
    }

    if (themes.length) {
      h += '<div class="pile-11"><h2 class="t-bloc">Les thèmes</h2><div class="pastilles">';
      for (var j = 0; j < themes.length; j++) {
        h += '<span class="pastille">' + ech(themes[j]) + '</span>';
      }
      h += '</div></div>';
    }

    // La rosace de la section, en grand et en clair : la meme que sur la
    // tuile et derriere les versets de ses cartes.
    if (GEO && sec.branches) {
      h += '<div class="couv-signature" aria-hidden="true">'
        + GEO.rosette(96, sec.branches, sec.ratio, '#0F5132', 1.1) + '</div>';
    }

    h += '</div>';

    // --- Le pied fixe ------------------------------------------------
    if (banque.length) {
      h += '<div class="couv-fixe">'
        + '<a class="bouton bouton-vert" href="section/' + ech(slug) + '/qcm">'
        + 'Préparer un QCM</a>'
        + '<p class="c-meta" style="text-align:center">De 20 à 100 questions, comme tu veux</p>'
        + '</div>';
    } else {
      h += '<div class="couv-fixe">'
        + '<p class="c-meta" style="text-align:center">Cette section n\'a pas '
        + 'encore de questions. Elle arrivera.</p></div>';
    }

    document.getElementById('couverture').innerHTML = h;
    if (GEO) { GEO.poserMotifs(document); }
  })['catch'](function () {
    echouer('Les sections n\'ont pas pu être chargées.');
  });
}());
