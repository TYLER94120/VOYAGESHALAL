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

  // 1259 -> « 1 259 », avec une espace INSECABLE. `sections.js` en posait
  // une, celle-ci une espace ordinaire : le meme nombre pouvait donc se
  // couper en fin de ligne sur la couverture et pas sur la grille. Un
  // nombre ne se coupe jamais.
  function espacer(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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

  /* UNE PANNE DE RESEAU N'EFFACE PAS UNE PAGE DEJA ARRIVEE.
     -------------------------------------------------------
     Mesure du 21 septembre, en coupant `data/sections.json` sur
     /section/sens-des-sourates : la page servie portait 940 caracteres, son
     titre, ses comptes, ses themes et ses 38 liens de lecons — tout etait
     deja la, lu, affiche. Le `catch` appelait `echouer()`, qui remplacait
     l'ensemble par 96 caracteres : « Section introuvable — Les sections
     n'ont pas pu etre chargees. »

     Deux fautes dans le meme geste. On detruit un contenu complet pour
     l'echec d'un fichier de 4 Ko ; et on annonce au lecteur que la section
     n'existe pas alors que c'est le reseau qui n'a pas repondu. La methode
     maison sur les conditions degradees dit l'inverse : le reseau est
     rarement absent, il est lent ou capricieux, et ce qui est deja affiche
     doit le rester.

     On ne garde ce qui est ecrit que si quelque chose est vraiment ecrit :
     `section.html`, la page generique, sert un `#couverture` VIDE et a
     besoin, elle, du message d'erreur. */
  function dejaLisible() {
    var t = document.querySelector('#couverture h1');
    return !!(t && t.textContent.trim());
  }

  function panneReseau(message) {
    if (!dejaLisible()) { return echouer(message); }
    var ou = document.querySelector('#couverture .couv-corps')
      || document.getElementById('couverture');
    var p = document.createElement('p');
    p.className = 'c-meta';
    p.setAttribute('role', 'status');
    p.textContent = "Le réseau n'a pas répondu : l'image de couverture et ton "
      + 'pourcentage de maîtrise manquent. Tout le reste de cette page est là.';
    ou.insertBefore(p, ou.firstChild);
  }

  var slug = slugDemande();
  if (!slug) { echouer('Aucune section n\'est demandée.'); return; }

  Promise.all([
    fetch('data/sections.json').then(function (r) { return r.json(); }),
    // L'INDEX PLUTOT QUE LA BANQUE. Cette couverture ne fait que COMPTER :
    // le nombre de questions, les themes, la repartition par niveau et le
    // pourcentage de maitrise. Elle telechargeait pourtant la banque entiere
    // — 1 031 Ko pour « Vocabulaire arabe », enonces et explications compris —
    // pour n'en tirer que ces quatre choses. L'index les porte toutes, en
    // 53 Ko pour les douze sections reunies.
    fetch('data/index-sections.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      ['catch'](function () { return {}; }),
    P ? P.charger() : Promise.resolve({})
  ]).then(function (tout) {
    var sections = tout[0], index = tout[1];
    var e = index[slug] || { n: 0, themes: [], niveaux: {}, ids: [] };

    // CE BLOC ETAIT DEJA ECRIT DANS LA PAGE, ET CE SCRIPT L'EFFACAIT.
    //
    // Mesure du 20 septembre, en ouvrant les deux rendus de
    // /section/sens-des-sourates : le HTML servi portait 38 liens vers les
    // lecons de sourates ; une fois le script passe, il en restait trois,
    // dont le logo et le bouton de QCM. La couverture de la section qui
    // PARLE des sourates expliquees verset par verset n'en proposait
    // aucune au visiteur. Elles restaient joignables par sourates.html,
    // mais pas depuis la page qui les annonce.
    //
    // On le releve tel quel plutot que de le reecrire ici : une prose
    // recopiee a deux endroits finit toujours par differer de l'autre, et
    // celle-ci porte 38 noms de sourates. Le generateur reste seul maitre
    // de la liste.
    var garde = document.getElementById('lecons-sourates');
    var dejaEcrit = garde ? garde.outerHTML : '';
    var sec = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].slug === slug) { sec = sections[i]; }
    }
    if (!sec) { return echouer('Cette section n\'existe pas.'); }

    document.title = sec.nom + ' — Islam pas à pas';

    var d = M.charger();
    var pc = M.maitrise(d, e.ids);

    // Les themes, dans l'ordre ou ils apparaissent dans la banque : l'index
    // les a releves dans cet ordre-la a la fabrication.
    var themes = e.themes || [];
    var combien = e.n;

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
      legende: 'Couverture : ' + sec.nom, dessus: dessus,
      motif: { branches: sec.branches, ratio: sec.ratio }
    }) : '';

    // --- Le corps ----------------------------------------------------
    h += '<div class="corps couv-corps" id="principal">';
    h += '<p class="couv-quoi">' + ech(sec.quoi || '') + '</p>';

    h += '<div class="chiffres">'
      + '<div class="chiffre"><b>' + (combien ? espacer(combien) : '—')
      + '</b><span>question' + (combien > 1 ? 's' : '') + '</span></div>'
      + '<div class="chiffre"><b>' + (themes.length || '—') + '</b><span>thème'
      + (themes.length > 1 ? 's' : '') + '</span></div>'
      + '<div class="chiffre"><b' + (pc ? ' data-ton="or"' : '') + '>'
      + (combien ? pc + '%' : '—') + '</b><span>maîtrisé</span></div>'
      + '</div>';

    // Les trois niveaux, avec ce qu'ils contiennent reellement. On le dit ici
    // plutot que de laisser la personne le decouvrir a l'ecran suivant.
    if (combien) {
      var parNiveau = {
        1: (e.niveaux && e.niveaux['1']) || 0,
        2: (e.niveaux && e.niveaux['2']) || 0,
        3: (e.niveaux && e.niveaux['3']) || 0
      };
      var LIB = { 1: 'Début', 2: 'Intermédiaire', 3: 'Expert' };
      h += '<div class="pile-11"><h2 class="t-bloc">Les trois niveaux</h2>'
        + '<div class="couv-niveaux">';
      // Espacer ici aussi : cette couverture ecrivait « 1 259 » en haut et
      // « 1251 » huit lignes plus bas, sur le meme ecran.
      for (var v = 1; v <= 3; v++) {
        h += '<div class="couv-niveau"><b>' + espacer(parNiveau[v]) + '</b><span>'
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

    // Les lecons, reposees a la place qu'elles avaient dans le HTML servi :
    // apres les themes, avant la rosace.
    h += dejaEcrit;

    // La rosace de la section, en grand et en clair : la meme que sur la
    // tuile et derriere les versets de ses cartes.
    if (GEO && sec.branches) {
      h += '<div class="couv-signature" aria-hidden="true">'
        + GEO.rosette(96, sec.branches, sec.ratio, '#0F5132', 1.1) + '</div>';
    }

    h += '</div>';

    // --- Le pied fixe ------------------------------------------------
    if (combien) {
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
    panneReseau('Les sections n\'ont pas pu être chargées.');
  });
}());
