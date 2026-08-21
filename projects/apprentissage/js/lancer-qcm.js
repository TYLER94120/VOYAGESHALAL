/* ==========================================================================
   LANCER UN QCM
   --------------------------------------------------------------------------
   Lit la section et les reglages dans l'adresse, charge la banque de la
   section, compose le paquet, et demarre.

   L'ORDRE DU PAQUET N'EST PAS UN DETAIL
   -------------------------------------
   Section 9 : une question `aRevoir` est prioritaire dans les trois QCM
   suivants de sa section, si l'option est active. On met donc les questions a
   revoir devant, puis le reste. Sans quoi l'option « Inclure mes erreurs
   passees » ne serait qu'une case a cocher decorative.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;
  var Q = window.IPAP_QCM;

  function parametres() {
    var p = {};
    var s = window.location.search.replace(/^\?/, '');
    if (!s) { return p; }
    var m = s.split('&');
    for (var i = 0; i < m.length; i++) {
      var kv = m[i].split('=');
      p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    }
    return p;
  }

  function reglagesParDefaut(d) {
    // Les reglages de l'ecran 3, dans leur etat par defaut du cahier des
    // charges : melanger OUI, inclure les erreurs OUI, serie OUI, minuteur NON.
    var r = { nombre: 20, mode: 'apprentissage', melanger: true,
              erreurs: true, serie: true, minuteur: false };
    if (d.reglages) {
      for (var k in r) {
        if (Object.prototype.hasOwnProperty.call(d.reglages, k)) { r[k] = d.reglages[k]; }
      }
    }
    return r;
  }

  function composer(banque, d, reglages, combien) {
    var revoir = [], reste = [];
    for (var i = 0; i < banque.length; i++) {
      var f = M.fiche(d, banque[i].id);
      (reglages.erreurs && f.aRevoir ? revoir : reste).push(banque[i]);
    }
    if (reglages.melanger) {
      revoir = Q.melanger(revoir);
      reste = Q.melanger(reste);
    }
    return revoir.concat(reste).slice(0, Math.min(combien, banque.length));
  }

  function echouer(message) {
    document.getElementById('zone').innerHTML =
      '<div style="padding:0 20px"><p class="t-page">Rien à jouer</p>'
      + '<p style="margin-top:12px">' + message + ' '
      + '<a href="sections.html">Choisir une autre section</a>.</p></div>';
    document.querySelector('.qcm-pied').hidden = true;
  }

  var p = parametres();
  var slug = p.section || 'sens-des-sourates';
  var d = M.charger();
  var reglages = reglagesParDefaut(d);
  if (p.n) {
    var n = parseInt(p.n, 10);
    // Le curseur va de 20 a 100 (ecran 3) : on ne sort pas de ces bornes,
    // meme si quelqu'un bricole l'adresse.
    if (n >= 20 && n <= 100) { reglages.nombre = n; }
  }
  if (p.mode === 'examen' || p.mode === 'apprentissage') { reglages.mode = p.mode; }
  if (p.serie === '0') { reglages.serie = false; }

  fetch('data/questions/' + slug + '.json')
    .then(function (r) {
      if (!r.ok) { throw new Error('banque introuvable'); }
      return r.json();
    })
    .then(function (banque) {
      if (!banque.length) { return echouer('Cette section n\'a pas encore de questions.'); }
      var paquet = composer(banque, d, reglages, reglages.nombre);
      if (!paquet.length) { return echouer('Cette section n\'a pas encore de questions.'); }
      var session = new Q.Session(paquet, reglages, slug);
      var jeu = new Q.Jeu(document, session);
      jeu.demarrer();
      // Expose pour les controles automatiques : ils doivent pouvoir verifier
      // que la promesse « cette question reviendra » est tenue DANS LE PAQUET,
      // pas seulement affichee a l ecran.
      window.__jeu = jeu;
    })
    .catch(function () {
      echouer('Cette section n\'est pas encore ouverte.');
    });
}());
