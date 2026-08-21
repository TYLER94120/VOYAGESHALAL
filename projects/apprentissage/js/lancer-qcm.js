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

  /* UNE QUESTION DONT L'IMAGE MANQUE EST ECARTEE DU TIRAGE (cahier V2, 7.3).
     Jamais affichee cassee, jamais affichee avec son cadre « photo a
     sourcer » : ce cadre est fait pour les maquettes et pour dire au
     proprietaire du site ce qu'il reste a faire, pas pour tomber sur
     quelqu'un au milieu d'une partie. */
  function jouable(q) {
    if (q.type !== 'photo') { return true; }
    return !!(window.IPAP_PHOTO && window.IPAP_PHOTO.fiche(q.image || ''));
  }

  function composer(banque, d, reglages, combien) {
    var revoir = [], reste = [];
    for (var i = 0; i < banque.length; i++) {
      if (!jouable(banque[i])) { continue; }
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

  /* Le bandeau enlumine et la rosace de la section (cahier V2, sections 3 et
     4) demandent deux tables de plus. Elles sont demandees EN MEME TEMPS que
     la banque, pas apres : trois allers-retours en file d'attente
     retarderaient la premiere carte, et le cahier fixe le premier rendu utile
     a moins d'une seconde et demie.

     Si l'une des deux manque, on joue quand meme. Une carte sans cartouche
     reste une carte ; une carte qui ne s'affiche pas n'est rien. */
  function facultatif(url) {
    return fetch(url).then(function (r) { return r.ok ? r.json() : null; })
      ['catch'](function () { return null; });
  }

  Promise.all([
    fetch('data/questions/' + slug + '.json').then(function (r) {
      if (!r.ok) { throw new Error('banque introuvable'); }
      return r.json();
    }),
    facultatif('data/noms-sourates.json'),
    facultatif('data/sections.json'),
    window.IPAP_PHOTO ? window.IPAP_PHOTO.charger() : Promise.resolve({})
  ])
    .then(function (tout) {
      var banque = tout[0], noms = tout[1], sections = tout[2] || [];
      var section = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].slug === slug) { section = sections[i]; break; }
      }
      Q.poserTables(noms, section);

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
