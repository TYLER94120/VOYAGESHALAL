/* ==========================================================================
   LES REGLAGES — ecran 3 du cahier des charges
   --------------------------------------------------------------------------
   LE NOMBRE DE QUESTIONS NE PEUT PAS DEPASSER CE QUI EXISTE.
   Le cahier des charges veut un curseur de 20 a 100 et cinq raccourcis. Mais
   proposer « 100 questions » dans une section qui en compte 60 est une
   promesse qu'on ne tient pas : le QCM s'arreterait a 60 sans rien dire. On
   plafonne donc au contenu reel, et on le DIT au lieu de le masquer.

   Les reglages sont memorises et valent pour les QCM suivants (section 8).
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;
  var MINI = 20, MAXI = 100;
  var SECONDES_PAR_QUESTION = 20;   // section 6, ecran 3

  var OPTIONS = [
    { cle: 'melanger', nom: 'Mélanger les questions', note: 'Sinon elles reviennent dans le même ordre.', defaut: true },
    { cle: 'erreurs', nom: 'Inclure mes erreurs passées', note: 'Elles passent devant dans le tirage.', defaut: true },
    { cle: 'serie', nom: 'Compteur de série', note: 'La pastille en haut de la carte.', defaut: true },
    { cle: 'minuteur', nom: 'Minuteur par question', note: 'Pas encore disponible.', defaut: false, bientot: true }
  ];

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function param(n) {
    var m = new RegExp('[?&]' + n + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* Deux adresses menent ici : /section/<slug>/qcm, celle du cahier V2, et
     reglages.html?section=<slug>, celle d'avant. La seconde reste valable —
     elle est dans des liens deja poses et peut-etre dans un marque-page. */
  function slugDemande() {
    var m = /\/section\/([^/?#]+)\/qcm/.exec(window.location.pathname);
    if (m) { return decodeURIComponent(m[1]); }
    return param('section') || 'sens-des-sourates';
  }

  /* LES TROIS NIVEAUX (demande de Mohamed, 21 aout).
     Le niveau d'une question n'est pas declare a la main : il est calcule par
     outils/classer-niveaux.py, a partir de ce qui rend une question difficile
     et qui se mesure — ce qu'il faut lire, a quel point les reponses se
     ressemblent, et si la source est de celles qu'on apprend en premier.
     « Debut » veut dire le tiers le plus abordable DE CETTE SECTION : c'est
     la seule promesse tenable, un seuil absolu laisserait des sections sans
     debutants et d'autres sans experts. */
  var NIVEAUX = {
    1: 'Les questions les plus abordables de cette section.',
    2: 'Le milieu du paquet : il faut connaître, pas seulement reconnaître.',
    3: 'Les plus exigeantes : longues, ou avec des réponses très proches.'
  };

  var MODES = {
    apprentissage: 'La correction tombe après chaque question, avec sa source.',
    examen: 'Aucun indice pendant le jeu. Tout le corrigé à la fin.'
  };

  var slug = slugDemande();
  var d = M.charger();
  var r = { nombre: 20, mode: 'apprentissage', niveau: 1 };
  for (var i = 0; i < OPTIONS.length; i++) { r[OPTIONS[i].cle] = OPTIONS[i].defaut; }
  if (d.reglages) {
    for (var k in r) {
      if (Object.prototype.hasOwnProperty.call(d.reglages, k)) { r[k] = d.reglages[k]; }
    }
  }

  var plafond = MAXI;   // ajuste des que la banque est connue
  var parNiveau = { 1: 0, 2: 0, 3: 0 };

  function dire() {
    // Le plafond depend du NIVEAU choisi, pas de la banque entiere :
    // proposer 100 questions quand le niveau choisi en compte 27 serait une
    // promesse qu'on ne tient pas.
    // UN NIVEAU DE HUIT QUESTIONS SE JOUE EN HUIT.
    // Le plancher etait de 20 : un niveau qui en comptait 8 se retrouvait
    // grise, donc inaccessible, alors que ses huit questions sont bonnes.
    // Mieux vaut un QCM court qu'un niveau qu'on ne peut pas ouvrir.
    var dispo = parNiveau[r.niveau] || 0;
    if (dispo) { plafond = Math.min(MAXI, dispo); }
    if (r.nombre > plafond) { r.nombre = plafond; }

    var bn = document.querySelectorAll('.niveau');
    for (var q = 0; q < bn.length; q++) {
      var nn = parseInt(bn[q].getAttribute('data-niveau'), 10);
      bn[q].setAttribute('aria-checked', nn === r.niveau ? 'true' : 'false');
    }
    document.getElementById('dit-niveau').textContent = NIVEAUX[r.niveau];

    document.getElementById('dit-nombre').textContent =
      r.nombre + ' question' + (r.nombre > 1 ? 's' : '')
      + (plafond < MAXI ? ' · ce niveau en compte ' + plafond : '');
    document.getElementById('commencer').textContent = 'Commencer les ' + r.nombre + ' questions';
    var min = Math.round(r.nombre * SECONDES_PAR_QUESTION / 60);
    document.getElementById('duree').textContent =
      'Environ ' + min + ' minute' + (min > 1 ? 's' : '') + '. Tu peux mettre en pause.';
    var b = document.querySelectorAll('#raccourcis button');
    for (var i = 0; i < b.length; i++) {
      var n = parseInt(b[i].getAttribute('data-n'), 10);
      b[i].setAttribute('aria-pressed', n === r.nombre ? 'true' : 'false');
      // Un raccourci au-dela du contenu reel n'est pas propose.
      b[i].disabled = n > plafond;
      if (n > plafond) { b[i].setAttribute('data-hors', 'oui'); }
      else { b[i].removeAttribute('data-hors'); }
    }
    var c = document.getElementById('curseur');
    c.value = r.nombre;
    c.max = plafond;
    var m = document.querySelectorAll('.mode');
    for (var j = 0; j < m.length; j++) {
      m[j].setAttribute('aria-checked', m[j].getAttribute('data-mode') === r.mode ? 'true' : 'false');
    }
    document.getElementById('dit-mode').textContent = MODES[r.mode] || '';
  }

  function ranger() {
    var d2 = M.charger();
    d2.reglages = r;
    M.ranger(d2);
  }

  // --- Les options ------------------------------------------------------
  var h = '';
  for (var o = 0; o < OPTIONS.length; o++) {
    var x = OPTIONS[o];
    h += '<button type="button" class="option" data-cle="' + x.cle + '"'
      + ' aria-pressed="' + (r[x.cle] ? 'true' : 'false') + '"'
      + (x.bientot ? ' disabled data-bientot="oui"' : '') + '>'
      + '<span class="quoi"><span class="nom">' + ech(x.nom) + '</span>'
      + '<span class="note">' + ech(x.note) + '</span></span>'
      + '<span class="bascule" aria-hidden="true"></span></button>';
  }
  document.getElementById('options').innerHTML = h;

  document.getElementById('options').addEventListener('click', function (e) {
    var b = e.target.closest('.option');
    if (!b || b.disabled) { return; }
    var cle = b.getAttribute('data-cle');
    r[cle] = !r[cle];
    b.setAttribute('aria-pressed', r[cle] ? 'true' : 'false');
    ranger();
  });

  document.getElementById('niveaux').addEventListener('click', function (e) {
    var b = e.target.closest('.niveau');
    if (!b || b.disabled) { return; }
    r.niveau = parseInt(b.getAttribute('data-niveau'), 10);
    dire(); ranger();
  });

  document.getElementById('raccourcis').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.disabled) { return; }
    r.nombre = parseInt(b.getAttribute('data-n'), 10);
    dire(); ranger();
  });

  document.getElementById('curseur').addEventListener('input', function () {
    r.nombre = parseInt(this.value, 10);
    dire();
  });
  document.getElementById('curseur').addEventListener('change', ranger);

  document.getElementById('modes').addEventListener('click', function (e) {
    var b = e.target.closest('.mode');
    if (!b) { return; }
    r.mode = b.getAttribute('data-mode');
    dire(); ranger();
  });

  document.getElementById('commencer').addEventListener('click', function () {
    ranger();
    window.location.href = 'qcm.html?section=' + encodeURIComponent(slug)
      + '&n=' + r.nombre + '&mode=' + r.mode + '&niveau=' + r.niveau
      + (r.serie ? '' : '&serie=0');
  });

  // --- La banque, pour connaitre le vrai plafond ------------------------
  Promise.all([
    fetch('data/sections.json').then(function (x) { return x.json(); }),
    fetch('data/questions/' + slug + '.json').then(function (x) { return x.ok ? x.json() : []; })
      .catch(function () { return []; })
  ]).then(function (res) {
    var sec = null;
    for (var i = 0; i < res[0].length; i++) { if (res[0][i].slug === slug) { sec = res[0][i]; } }
    var banque = res[1];
    document.getElementById('titre').textContent = sec ? sec.nom : 'Régler ton QCM';

    if (!banque.length) {
      document.getElementById('sous').textContent =
        "Cette section n'a pas encore de questions.";
      document.getElementById('commencer').disabled = true;
      return;
    }
    // Le compte par niveau, lu dans la banque : c'est lui qui s'affiche sur
    // les trois boutons et qui plafonne le curseur.
    parNiveau = { 1: 0, 2: 0, 3: 0 };
    for (var b = 0; b < banque.length; b++) {
      var n = banque[b].niveau || 2;
      parNiveau[n] = (parNiveau[n] || 0) + 1;
    }
    var bn = document.querySelectorAll('.niveau');
    for (var k = 0; k < bn.length; k++) {
      var nv = parseInt(bn[k].getAttribute('data-niveau'), 10);
      bn[k].querySelector('.choix-nb').textContent = parNiveau[nv] || 0;
      // Un niveau vide n'est pas propose : il ouvrirait sur rien.
      bn[k].disabled = !parNiveau[nv];
      if (!parNiveau[nv]) { bn[k].setAttribute('data-hors', 'oui'); }
    }
    if (!parNiveau[r.niveau]) {
      r.niveau = parNiveau[1] ? 1 : (parNiveau[2] ? 2 : 3);
    }
    // Le curseur ne descend jamais sous 20 dans le HTML : quand un niveau
    // en compte moins, on le laisse a son maximum et le curseur ne sert plus.
    document.getElementById('curseur').min = Math.min(MINI, plafond || MINI);

    document.getElementById('sous').textContent =
      banque.length + ' questions dans cette section, toutes sourcées.';
    dire();
  }).catch(function () {
    document.getElementById('sous').textContent = 'La section n\'a pas pu être chargée.';
    document.getElementById('commencer').disabled = true;
  });

  dire();
}());
