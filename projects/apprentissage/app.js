/* =========================================================
   Islam pas a pas - logique commune
   Aucune dependance, aucun build. La progression reste sur
   l'appareil de l'utilisateur (localStorage), rien n'est envoye.
   ========================================================= */

(function (global) {
  'use strict';

  var CLE = 'ipp.progression.v1';

  /* ---------- catalogue ---------------------------------------------------
     publiee:false = la lecon n'existe pas encore. On l'affiche honnetement
     comme "bientot" plutot que de faire croire a du contenu.
     ---------------------------------------------------------------------- */

  var PARCOURS = [
    { id: 'sourates',    nom: 'Le sens des sourates' },
    { id: 'priere',      nom: 'La priere pas a pas' },
    { id: 'foi',         nom: 'Les bases de la foi' },
    { id: 'invocations', nom: 'Les invocations du jour' },
    { id: 'memoriser',   nom: 'Memoriser le Coran' }
  ];

  var CATALOGUE = [
    {
      id: 'al-fatiha',
      titre: 'Sourate Al-Fatiha, verset par verset',
      url: 'lecon-al-fatiha.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 10,
      acquis: 7,
      publiee: true
    },
    {
      id: 'invocations-matin',
      titre: 'Trois invocations pour commencer ta journee',
      url: 'lecon-invocations-matin.html',
      parcours: 'invocations',
      minutes: 5,
      cartes: 8,
      acquis: 3,
      publiee: true
    }
  ];

  function nomParcours(idParcours) {
    for (var i = 0; i < PARCOURS.length; i++) {
      if (PARCOURS[i].id === idParcours) { return PARCOURS[i].nom; }
    }
    return '';
  }

  /* ---------- dates ------------------------------------------------------ */

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function enCle(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function aujourdhui() { return enCle(new Date()); }

  function depuisCle(s) {
    var p = s.split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function plusDeJours(s, n) {
    var d = depuisCle(s);
    d.setDate(d.getDate() + n);
    return enCle(d);
  }

  var JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS_FR = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
                 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];

  function dateLongue(d) {
    return JOURS_FR[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS_FR[d.getMonth()];
  }

  /* ---------- stockage --------------------------------------------------- */

  function vide() { return { v: 1, lecons: {}, jours: [] }; }

  function charger() {
    try {
      var brut = global.localStorage.getItem(CLE);
      if (!brut) { return vide(); }
      var d = JSON.parse(brut);
      if (!d || typeof d !== 'object') { return vide(); }
      if (!d.lecons || typeof d.lecons !== 'object') { d.lecons = {}; }
      if (Object.prototype.toString.call(d.jours) !== '[object Array]') { d.jours = []; }
      return d;
    } catch (e) {
      // Navigation privee ou stockage refuse : on continue sans memoire.
      return vide();
    }
  }

  function sauver(d) {
    try {
      global.localStorage.setItem(CLE, JSON.stringify(d));
    } catch (e) { /* on n'empeche jamais la lecture d'une lecon */ }
  }

  /* ---------- progression ------------------------------------------------ */

  // Espacement des revisions, en jours, tour apres tour.
  var ESPACEMENT = [2, 7, 21, 60];

  function fiche(id) { return charger().lecons[id] || null; }

  function estFaite(id) { return !!fiche(id); }

  function terminer(id) {
    var d = charger();
    var jour = aujourdhui();
    var f = d.lecons[id] || { tours: 0 };
    f.tours = (f.tours || 0) + 1;
    f.faitLe = jour;
    var pas = ESPACEMENT[Math.min(f.tours - 1, ESPACEMENT.length - 1)];
    f.revoirLe = plusDeJours(jour, pas);
    d.lecons[id] = f;
    if (d.jours.indexOf(jour) === -1) { d.jours.push(jour); }
    sauver(d);
    return { pas: pas };
  }

  function jours() { return charger().jours.slice().sort(); }

  function serie() {
    var faits = {};
    var liste = charger().jours;
    for (var i = 0; i < liste.length; i++) { faits[liste[i]] = true; }

    var curseur = aujourdhui();
    // La serie tient encore si l'on a travaille hier mais pas encore aujourd'hui.
    if (!faits[curseur]) {
      curseur = plusDeJours(curseur, -1);
      if (!faits[curseur]) { return 0; }
    }
    var n = 0;
    while (faits[curseur]) {
      n++;
      curseur = plusDeJours(curseur, -1);
    }
    return n;
  }

  function aRevoir() {
    var d = charger();
    var jour = aujourdhui();
    var sortie = [];
    for (var i = 0; i < CATALOGUE.length; i++) {
      var l = CATALOGUE[i];
      var f = d.lecons[l.id];
      if (f && f.revoirLe && f.revoirLe <= jour) { sortie.push(l); }
    }
    return sortie;
  }

  function acquis() {
    var d = charger();
    var n = 0;
    for (var i = 0; i < CATALOGUE.length; i++) {
      if (d.lecons[CATALOGUE[i].id]) { n += CATALOGUE[i].acquis; }
    }
    return n;
  }

  function publiees() {
    return CATALOGUE.filter(function (l) { return l.publiee; });
  }

  // La lecon proposee aujourd'hui : la premiere non faite, sinon la premiere a revoir.
  function leconDuJour() {
    var libres = publiees();
    for (var i = 0; i < libres.length; i++) {
      if (!estFaite(libres[i].id)) { return { lecon: libres[i], mode: 'neuve' }; }
    }
    var r = aRevoir();
    if (r.length) { return { lecon: r[0], mode: 'revision' }; }
    return null;
  }

  function parcoursAvecEtat() {
    var d = charger();
    return PARCOURS.map(function (p) {
      var dedans = CATALOGUE.filter(function (l) { return l.parcours === p.id && l.publiee; });
      var faites = dedans.filter(function (l) { return !!d.lecons[l.id]; });
      return {
        id: p.id,
        nom: p.nom,
        total: dedans.length,
        faites: faites.length,
        pret: dedans.length > 0
      };
    });
  }

  global.IPP = {
    PARCOURS: PARCOURS,
    CATALOGUE: CATALOGUE,
    nomParcours: nomParcours,
    aujourdhui: aujourdhui,
    dateLongue: dateLongue,
    depuisCle: depuisCle,
    plusDeJours: plusDeJours,
    enCle: enCle,
    fiche: fiche,
    estFaite: estFaite,
    terminer: terminer,
    jours: jours,
    serie: serie,
    aRevoir: aRevoir,
    acquis: acquis,
    publiees: publiees,
    leconDuJour: leconDuJour,
    parcoursAvecEtat: parcoursAvecEtat
  };
}(window));


/* =========================================================
   Petites aides d'affichage partagees
   ========================================================= */

function ippEtoile(taille, couleur) {
  return '<svg class="etoile" width="' + taille + '" height="' + taille + '" viewBox="0 0 24 24" '
       + 'fill="' + (couleur || 'currentColor') + '" aria-hidden="true">'
       + '<path d="M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z"/></svg>';
}

function ippEchappe(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* =========================================================
   Lecteur de lecon, commun a toutes les lecons.

   La page contient toutes ses cartes en clair dans le HTML :
   sans JavaScript, la lecon se lit d'un seul tenant (c'est ce
   que Google indexe). Avec JavaScript, on la pilote carte par
   carte. La derniere carte est l'ecran de fin.
   ========================================================= */

function ippDemarrerLecon(id) {
  'use strict';

  var zone = document.getElementById('etapes');
  if (!zone) { return; }

  var etapes = zone.querySelectorAll('.etape');
  var TOTAL = etapes.length;
  var CONTENU = TOTAL - 1;
  var courante = 1;
  var enregistree = false;

  zone.classList.add('pilote');

  var bas = document.getElementById('basLecon');
  var bouton = document.getElementById('btnSuivant');
  bas.hidden = false;

  var points = document.getElementById('points');
  var html = '';
  for (var i = 0; i < CONTENU; i++) { html += '<span class="pt"></span>'; }
  points.innerHTML = html;
  var segments = points.querySelectorAll('.pt');

  function afficher() {
    for (var a = 0; a < etapes.length; a++) {
      etapes[a].classList.toggle('actif',
        Number(etapes[a].getAttribute('data-etape')) === courante);
    }
    for (var b = 0; b < segments.length; b++) {
      segments[b].classList.toggle('faite', b < Math.min(courante, CONTENU));
    }

    if (courante === TOTAL) {
      bas.hidden = true;
    } else {
      bouton.textContent = (courante === CONTENU) ? 'Terminer' : 'Suivant';
    }

    // Sans cela on resterait au milieu du texte precedent.
    if (courante > 1) {
      var haut = zone.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo(0, Math.max(0, haut));
    }
  }

  function cloturer() {
    if (enregistree) { return; }
    enregistree = true;

    var r = IPP.terminer(id);
    var serie = IPP.serie();
    var total = IPP.acquis();
    var reste = IPP.publiees().filter(function (l) { return !IPP.estFaite(l.id); }).length;

    var phrase = 'Tu connais maintenant ' + total + ' enseignements, chacun avec sa source. ';
    phrase += 'Cette lecon reviendra dans ' + r.pas + (r.pas > 1 ? ' jours.' : ' jour.');
    if (serie > 1) { phrase += ' ' + serie + ' jours d\'affilee.'; }

    var cible = document.getElementById('finTexte');
    if (cible) { cible.textContent = phrase; }

    var suite = document.getElementById('finSuite');
    if (suite) {
      suite.textContent = reste
        ? (reste === 1 ? 'Une autre lecon t\'attend deja.'
                       : reste + ' autres lecons t\'attendent deja.')
        : 'C\'est la derniere lecon disponible. La prochaine arrive bientot.';
    }
  }

  bouton.addEventListener('click', function () {
    if (courante >= TOTAL) { return; }
    courante++;
    if (courante === TOTAL) { cloturer(); }
    afficher();
  });

  afficher();
}
