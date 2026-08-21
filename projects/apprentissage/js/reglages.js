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

  var slug = param('section') || 'sens-des-sourates';
  var d = M.charger();
  var r = { nombre: 20, mode: 'apprentissage' };
  for (var i = 0; i < OPTIONS.length; i++) { r[OPTIONS[i].cle] = OPTIONS[i].defaut; }
  if (d.reglages) {
    for (var k in r) {
      if (Object.prototype.hasOwnProperty.call(d.reglages, k)) { r[k] = d.reglages[k]; }
    }
  }

  var plafond = MAXI;   // ajuste des que la banque est connue

  function dire() {
    document.getElementById('dit-nombre').textContent =
      r.nombre + ' question' + (r.nombre > 1 ? 's' : '')
      + (plafond < MAXI ? ' · cette section en compte ' + plafond : '');
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
      b[i].style.opacity = n > plafond ? '0.4' : '';
    }
    var c = document.getElementById('curseur');
    c.value = r.nombre;
    c.max = plafond;
    var m = document.querySelectorAll('.mode');
    for (var j = 0; j < m.length; j++) {
      m[j].setAttribute('aria-checked', m[j].getAttribute('data-mode') === r.mode ? 'true' : 'false');
    }
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
      + (x.bientot ? ' disabled style="opacity:.45"' : '') + '>'
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
      + '&n=' + r.nombre + '&mode=' + r.mode + (r.serie ? '' : '&serie=0');
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
    plafond = Math.max(MINI, Math.min(MAXI, banque.length));
    if (r.nombre > plafond) { r.nombre = plafond; }
    document.getElementById('sous').textContent =
      banque.length + ' questions dans cette section, toutes sourcées.';
    dire();
  }).catch(function () {
    document.getElementById('sous').textContent = 'La section n\'a pas pu être chargée.';
    document.getElementById('commencer').disabled = true;
  });

  dire();
}());
