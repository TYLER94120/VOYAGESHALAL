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
              erreurs: true, serie: true, minuteur: false, niveau: 1 };
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

  /* LE NIVEAU FILTRE LE PAQUET, mais PAS les erreurs a revoir.
     Une question ratee revient parce qu'on l'a ratee, pas parce qu'elle est
     du bon niveau : l'ecarter du rattrapage sous pretexte qu'elle est
     « experte » viderait de son sens la promesse « cette question
     reviendra ». */
  function auNiveau(q, niveau) {
    if (!niveau) { return true; }
    // UNE QUESTION SANS NIVEAU SE JOUE PARTOUT, elle ne disparait pas.
    // Toutes en portent un — outils/classer-niveaux.py en pose un a chacune,
    // et le controle des questions refuse un lot ou il en manque. Mais si un
    // jour il en manque un quand meme, mieux vaut voir la question trois fois
    // trop souvent que ne plus jamais la voir.
    if (!q.niveau) { return true; }
    return q.niveau === niveau;
  }

  function composer(banque, d, reglages, combien) {
    var revoir = [], reste = [];
    for (var i = 0; i < banque.length; i++) {
      if (!jouable(banque[i])) { continue; }
      var f = M.fiche(d, banque[i].id);
      if (reglages.erreurs && f.aRevoir) { revoir.push(banque[i]); continue; }
      if (!auNiveau(banque[i], reglages.niveau)) { continue; }
      reste.push(banque[i]);
    }
    if (reglages.melanger) {
      revoir = Q.melanger(revoir);
      reste = Q.melanger(reste);
    }
    return revoir.concat(reste).slice(0, Math.min(combien, banque.length));
  }

  /* REPRENDRE UN QCM INTERROMPU.
     -----------------------------
     Mesure du 25 septembre. En quittant un QCM a la quinzieme question,
     l'accueil proposait bien une carte :

       75 %  TU EN ETAIS LA  ·  Le sens des sourates
       question 16 sur 20 · reprendre

     Elle menait a `qcm.html?section=...&reprise=1`. Ce fichier ne lisait
     NI le parametre `reprise`, NI `d.reprise` : il composait un paquet neuf
     et la partie rouvrait a « 1 / 20 ». Le mot « reprendre » etait faux, et
     le « question 16 sur 20 » juste au-dessus le rendait pire — on croyait
     revenir a sa place, on recommencait a zero.

     Tout ce qu'il faut etait pourtant range par `sortir()` : les
     identifiants du paquet DANS L'ORDRE, la position, les reponses deja
     donnees, les reglages et l'heure de depart.

     Ce qui est recompose ici, et pourquoi :
      · le paquet, en relisant les identifiants dans la banque d'aujourd'hui.
        Une question supprimee entre-temps est sautee, et la position recule
        d'autant — sinon on rouvrirait sur la mauvaise carte ;
      · `vues`, le compteur des retours pose le 24 septembre : un identifiant
        qui figure deux fois dans le paquet est deja revenu une fois. Sans
        ca, une reprise redonnerait droit a un retour de plus et la borne
        fuirait a chaque interruption ;
      · `total`, le nombre ANNONCE au depart. Le constructeur le deduit de la
        longueur du paquet, qui a grandi avec les retours : on le repose. */
  function reprendre(d, banque, slug) {
    var r = d.reprise;
    if (!r || r.section !== slug || !r.ids || !r.ids.length) { return null; }
    var parId = {};
    for (var i = 0; i < banque.length; i++) { parId[banque[i].id] = banque[i]; }

    var paquet = [], vues = {}, pos = 0;
    for (var k = 0; k < r.ids.length; k++) {
      var q = parId[r.ids[k]];
      if (!q) { continue; }   // question retiree de la banque depuis
      if (k < r.pos) { pos += 1; }
      // Deuxieme apparition et suivantes : c'est un retour deja accorde.
      vues[q.id] = paquet.filter(function (x) { return x.id === q.id; }).length;
      paquet.push(q);
    }
    if (!paquet.length) { return null; }
    return { paquet: paquet, pos: Math.min(pos, paquet.length), vues: vues,
             reglages: r.reglages || reglagesParDefaut(d),
             reponses: r.reponses || [], total: r.total || paquet.length,
             debut: r.debut || Date.now() };
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
    // Le bas de la fourchette suit le contenu : un niveau de huit questions
    // se joue en huit, et c'est l'ecran de reglages qui a deja plafonne.
    if (n >= 1 && n <= 100) { reglages.nombre = n; }
  }
  if (p.mode === 'examen' || p.mode === 'apprentissage') { reglages.mode = p.mode; }
  if (p.niveau === '1' || p.niveau === '2' || p.niveau === '3') {
    reglages.niveau = parseInt(p.niveau, 10);
  }
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

      // La reprise passe AVANT la composition d'un paquet neuf : c'est tout
      // l'objet du parametre. Si elle n'aboutit pas — partie d'une autre
      // section, questions disparues — on compose normalement plutot que de
      // laisser la personne devant un ecran vide.
      var repris = (p.reprise === '1') ? reprendre(d, banque, slug) : null;
      var paquet = repris ? repris.paquet : composer(banque, d, reglages, reglages.nombre);
      if (!paquet.length) { return echouer('Cette section n\'a pas encore de questions.'); }

      var session = new Q.Session(paquet, repris ? repris.reglages : reglages, slug);
      if (repris) {
        session.pos = repris.pos;
        session.reponses = repris.reponses;
        session.total = repris.total;
        session.vues = repris.vues;
        session.debut = repris.debut;
        // La partie est reprise : elle n'est plus « en attente ». La laisser
        // dans la memoire ferait proposer a l'accueil de reprendre celle
        // qu'on est en train de jouer.
        d.reprise = null;
        M.ranger(d);
      }
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
