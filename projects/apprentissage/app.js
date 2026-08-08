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
      minutes: 6,
      cartes: 11,
      acquis: 7,
      publiee: true,
      resume: 'Tu la recites dans chaque priere. Aujourd\'hui, tu vas comprendre '
            + 'chacun de ses sept versets.'
    },
    {
      id: 'invocations-matin',
      titre: 'Trois invocations pour commencer ta journee',
      url: 'lecon-invocations-matin.html',
      parcours: 'invocations',
      minutes: 5,
      cartes: 8,
      acquis: 3,
      publiee: true,
      resume: 'Trois phrases courtes, toutes rapportees par al-Boukhari et Mouslim. '
            + 'Apprends-en une seule si tu veux : c\'est deja beaucoup.'
    },
    {
      id: 'six-piliers-foi',
      titre: 'Les six piliers de la foi',
      url: 'lecon-six-piliers-foi.html',
      parcours: 'foi',
      minutes: 5,
      cartes: 11,
      acquis: 6,
      publiee: true,
      resume: 'Un ange vient interroger le Prophete sur la foi. La reponse tient '
            + 'en une phrase, et elle contient six choses.'
    },
    {
      id: 'priere-gestes',
      titre: 'Les gestes de la priere, dans l\'ordre',
      url: 'lecon-priere-gestes.html',
      parcours: 'priere',
      minutes: 6,
      cartes: 12,
      acquis: 7,
      publiee: true,
      resume: 'Sept gestes, dans l\'ordre, tires d\'un seul hadith. Et les points '
            + 'ou les ecoles ne disent pas la meme chose.'
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

  /* ---------- niveau de depart --------------------------------------------
     Trois questions, une seule fois, sans compte et sans inscription.
     But : ne pas faire apprendre a quelqu'un ce qu'il sait deja.
     Aucune reponse n'est "mauvaise" : ces valeurs servent a choisir par ou
     commencer et sur quel ton accueillir, jamais a noter la personne.
     ---------------------------------------------------------------------- */

  var CLE_NIVEAU = 'ipp.niveau.v1';

  function niveau() {
    try {
      var brut = global.localStorage.getItem(CLE_NIVEAU);
      if (!brut) { return null; }
      var d = JSON.parse(brut);
      return (d && typeof d === 'object' && d.priere) ? d : null;
    } catch (e) {
      return null;
    }
  }

  function enregistrerNiveau(reponses) {
    var d = {
      priere:  reponses.priere  || 'inconnu',   // non | parfois | oui
      fatiha:  reponses.fatiha  || 'inconnu',   // non | incertain | oui
      memoire: reponses.memoire || 'inconnu',   // aucune | quelques | beaucoup
      faitLe:  aujourdhui()
    };
    try { global.localStorage.setItem(CLE_NIVEAU, JSON.stringify(d)); } catch (e) { /* sans memoire, on continue */ }
    return d;
  }

  function oublierNiveau() {
    try { global.localStorage.removeItem(CLE_NIVEAU); } catch (e) { /* rien a faire */ }
  }

  // Sert uniquement au ton de l'accueil et a l'ordre des lecons.
  function profil() {
    var n = niveau();
    if (!n) { return 'inconnu'; }
    // Questions passees : on ne suppose rien et on garde un ton neutre.
    if (n.priere === 'inconnu' && n.fatiha === 'inconnu') { return 'inconnu'; }
    if (n.fatiha === 'oui' && n.memoire === 'beaucoup') { return 'avance'; }
    if (n.fatiha === 'oui' || n.priere === 'oui' || n.memoire === 'quelques') { return 'intermediaire'; }
    return 'debutant';
  }

  /* ---------- le rendez-vous quotidien ------------------------------------
     Une lecon "quand tu veux" est une lecon jamais faite. On demande donc un
     repere dans la journee, et l'accueil parle en fonction.

     ATTENTION, point d'honnetete : ce site ne calcule PAS les horaires de
     priere. Ils dependent du lieu et de la date, et les inventer serait une
     faute. L'utilisateur choisit un repere ("apres le Fajr"), et les plages
     d'heures ci-dessous ne servent qu'a adapter le ton du message. Aucune
     heure de priere n'est jamais affichee. Pour les horaires reels, on
     renvoie vers voyageshalal.fr/horaires-priere.
     ---------------------------------------------------------------------- */

  var CLE_MOMENT = 'ipp.moment.v1';

  var MOMENTS = [
    { id: 'fajr',    nom: 'Apres la priere du Fajr', dit: 'apres le Fajr',    de: 4,  a: 9 },
    { id: 'matin',   nom: 'Dans la matinee',         dit: 'dans la matinee',  de: 8,  a: 12 },
    { id: 'dhuhr',   nom: 'Apres le Dhuhr',          dit: 'apres le Dhuhr',   de: 12, a: 16 },
    { id: 'maghreb', nom: 'Apres le Maghreb',        dit: 'apres le Maghreb', de: 18, a: 22 },
    { id: 'nuit',    nom: 'Avant de dormir',         dit: 'avant de dormir',  de: 21, a: 2 }
  ];

  function momentParId(id) {
    for (var i = 0; i < MOMENTS.length; i++) {
      if (MOMENTS[i].id === id) { return MOMENTS[i]; }
    }
    return null;
  }

  function moment() {
    try {
      var brut = global.localStorage.getItem(CLE_MOMENT);
      if (!brut) { return null; }
      var d = JSON.parse(brut);
      return (d && d.id) ? momentParId(d.id) : null;
    } catch (e) {
      return null;
    }
  }

  function enregistrerMoment(id) {
    try {
      global.localStorage.setItem(CLE_MOMENT, JSON.stringify({ id: id, faitLe: aujourdhui() }));
    } catch (e) { /* sans memoire, on continue */ }
    return momentParId(id);
  }

  function oublierMoment() {
    try { global.localStorage.removeItem(CLE_MOMENT); } catch (e) { /* rien a faire */ }
  }

  // 'dedans' | 'avant' | 'apres' — sert uniquement au ton du message.
  function positionMoment(heure) {
    var m = moment();
    if (!m) { return null; }
    if (typeof heure !== 'number') { heure = new Date().getHours(); }

    var dedans = (m.de <= m.a)
      ? (heure >= m.de && heure < m.a)
      : (heure >= m.de || heure < m.a);   // plage qui passe minuit

    if (dedans) { return 'dedans'; }
    return (heure < m.de) ? 'avant' : 'apres';
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

  // Ordre des lecons, adapte au niveau declare.
  // Concretement : celui qui connait deja Al-Fatiha par coeur ne la recoit pas
  // en premiere lecon. C'est tout l'interet des trois questions d'accueil.
  function ordreLecons() {
    var libres = publiees().slice();
    var n = niveau();
    if (!n) { return libres; }

    // Un poids par lecon : negatif = servie plus tot, positif = plus tard.
    var poids = {};

    // Qui ne prie pas encore : les bases de la foi, puis les gestes de la
    // priere. Lui servir une sourate d'abord, c'est commencer par le milieu.
    if (n.priere === 'non') {
      poids['six-piliers-foi'] = -2;
      poids['priere-gestes'] = -1;
    }

    // Qui connait deja Al-Fatiha par coeur ne la recoit pas en premiere lecon.
    if (n.fatiha === 'oui') { poids['al-fatiha'] = 2; }

    return libres.sort(function (a, b) {
      return (poids[a.id] || 0) - (poids[b.id] || 0);
    });
  }

  // La lecon proposee aujourd'hui : la premiere non faite, sinon la premiere a revoir.
  function leconDuJour() {
    var libres = ordreLecons();
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
    ordreLecons: ordreLecons,
    leconDuJour: leconDuJour,
    parcoursAvecEtat: parcoursAvecEtat,
    niveau: niveau,
    enregistrerNiveau: enregistrerNiveau,
    oublierNiveau: oublierNiveau,
    profil: profil,
    MOMENTS: MOMENTS,
    moment: moment,
    enregistrerMoment: enregistrerMoment,
    oublierMoment: oublierMoment,
    positionMoment: positionMoment,
    faitAujourdhui: function () { return charger().jours.indexOf(aujourdhui()) !== -1; }
  };
}(window));


/* =========================================================
   Aides d'affichage partagees
   ========================================================= */

function ippEtoile(taille, couleur) {
  return '<svg class="etoile" width="' + taille + '" height="' + taille + '" viewBox="0 0 24 24" '
       + 'fill="' + (couleur || 'currentColor') + '" aria-hidden="true">'
       + '<path d="M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z"/></svg>';
}

function ippEchappe(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Les elements sont vises par [data-r="..."] et non par id : la meme vue peut
// ainsi exister plusieurs fois dans un document (utile pour l'apercu d'un seul
// fichier) sans collision d'identifiants.
function ippViseur(racine) {
  var r = racine || document;
  return function (nom) { return r.querySelector('[data-r="' + nom + '"]'); };
}

var IPP_MOIS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];


/* =========================================================
   Vue 1 : l'accueil, "Aujourd'hui"
   ========================================================= */

function ippRendreAccueil(racine) {
  'use strict';
  var q = ippViseur(racine);
  if (!q('carte')) { return; }

  // Premiere visite : les trois questions passent avant tout le reste, pour
  // demarrer au bon endroit. Le corps de l'accueil reste dans le HTML (donc
  // lisible par Google et sans JavaScript), on le masque seulement le temps
  // des questions.
  var corps = q('accueil-corps');
  if (!IPP.niveau() && q('diag')) {
    if (corps) { corps.hidden = true; }
    ippDemarrerDiagnostic(racine, function () {
      if (corps) { corps.hidden = false; }
      ippRendreAccueil(racine);
    });
    return;
  }
  if (corps) { corps.hidden = false; }
  if (q('diag')) { q('diag').hidden = true; }

  // --- date et salutation ---
  var maintenant = new Date();
  var heure = maintenant.getHours();
  q('date').textContent = IPP.dateLongue(maintenant);
  q('salut').textContent = (heure < 5) ? 'Bonne nuit' : (heure < 18 ? 'Bonjour' : 'Bonsoir');

  // --- serie de jours ---
  var n = IPP.serie();
  var bloc = q('serie');
  var jeton = q('jeton');
  if (n > 0) {
    bloc.hidden = false;
    q('serie-n').textContent = String(n);
    q('serie-txt').innerHTML = (n === 1)
      ? 'premier jour.<br>Reviens demain, c\'est la que tout se joue.'
      : 'jours d\'affilee.<br>Ne casse pas la chaine.';
    jeton.hidden = false;
    jeton.innerHTML = ippEtoile(14, '#c9a84c') + '<span>' + n + '</span>';
    jeton.setAttribute('title', n + (n === 1 ? ' jour' : ' jours') + ' d\'affilee');
  } else {
    bloc.hidden = true;
    jeton.hidden = true;
  }

  // --- le rendez-vous du jour ---
  // Jamais culpabilisant : un moment manque n'est pas un echec, la journee
  // n'est pas finie.
  var rdv = q('rdv');
  if (rdv) {
    var m = IPP.moment();
    if (!m) {
      rdv.hidden = true;
    } else {
      rdv.hidden = false;
      rdv.classList.remove('cest-maintenant');
      if (IPP.faitAujourdhui()) {
        rdv.textContent = 'Tu es venu aujourd\'hui. Prochain rendez-vous : demain '
                        + m.dit + '.';
      } else {
        var ou = IPP.positionMoment();
        if (ou === 'dedans') {
          rdv.textContent = 'C\'est ton moment.';
          rdv.classList.add('cest-maintenant');
        } else if (ou === 'avant') {
          rdv.textContent = 'Ton rendez-vous : ' + m.dit + '.';
        } else {
          rdv.textContent = 'Le moment est passe, mais la journee n\'est pas finie.';
        }
      }
    }
  }

  // --- la lecon du jour ---
  var choix = IPP.leconDuJour();
  var carte = q('carte');

  if (!choix) {
    // Tout est fait et rien n'est a revoir : on le dit franchement.
    carte.innerHTML =
      '<span class="eyebrow">C\'est fait pour aujourd\'hui</span>'
      + '<h2>Tu es a jour</h2>'
      + '<p class="clair">Toutes les lecons disponibles sont terminees, et aucune revision '
      + 'n\'est prevue aujourd\'hui. Reviens demain : la prochaine lecon arrive bientot.</p>'
      + '<a class="btn fantome" href="chemin.html">Voir mon chemin</a>';
  } else {
    var l = choix.lecon;
    var revision = (choix.mode === 'revision');
    q('carte-eyebrow').textContent = revision ? 'Ta revision du jour' : 'Ta lecon du jour';
    q('carte-titre').textContent = l.titre;
    q('carte-meta').innerHTML =
      '<span>' + l.minutes + ' min</span><span class="puce"></span>'
      + '<span>' + l.cartes + ' cartes</span><span class="puce"></span>'
      + '<span>' + ippEchappe(IPP.nomParcours(l.parcours)) + '</span>';
    // Toujours reecrit : sinon le resume de la premiere lecon resterait affiche
    // sous le titre d'une autre lecon.
    q('carte-pitch').textContent = revision
      ? 'Tu l\'as deja vue. On la repasse vite pour qu\'elle tienne dans la duree.'
      : (l.resume || '');
    var b = q('carte-btn');
    b.setAttribute('href', l.url);
    b.textContent = revision ? 'Revoir →' : 'Commencer →';
  }

  // --- rendre visible le fait que l'accueil suit le niveau declare ---
  var note = q('niveau-note');
  if (note) {
    var p = IPP.profil();
    if (p === 'avance') {
      note.textContent = 'D\'apres tes reponses, Al-Fatiha passe apres : tu la connais deja par coeur.';
      note.hidden = false;
    } else if (p === 'debutant' || p === 'intermediaire') {
      note.textContent = 'Choisie d\'apres tes trois reponses du depart.';
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }

  // --- revisions dues aujourd'hui ---
  var dues = IPP.aRevoir();
  if (dues.length) {
    var html = '';
    for (var i = 0; i < dues.length; i++) {
      var f = IPP.fiche(dues[i].id);
      html += '<a class="ligne" href="' + dues[i].url + '">'
            + ippEtoile(17, '#c9a84c')
            + '<span><span class="t">' + ippEchappe(dues[i].titre) + '</span>'
            + '<span class="s">Vue le ' + IPP.dateLongue(IPP.depuisCle(f.faitLe)) + '</span></span>'
            + '<span class="fl" aria-hidden="true">&rsaquo;</span></a>';
    }
    q('revisions').innerHTML = html;
  }

  // --- parcours ---
  q('parcours').innerHTML = ippListeParcours('chemin.html');
}


/* =========================================================
   Vue 2 : le chemin
   ========================================================= */

function ippRendreChemin(racine) {
  'use strict';
  var q = ippViseur(racine);
  if (!q('mois')) { return; }

  // --- compteur ---
  var n = IPP.acquis();
  q('compteur-n').textContent = String(n);
  q('compteur-txt').innerHTML = (n === 0)
    ? 'Rien encore.<br>Ta premiere lecon t\'attend.'
    : (n === 1 ? 'enseignement appris.<br>Avec sa source verifiee.'
               : 'enseignements appris.<br>Chacun avec sa source verifiee.');

  // --- calendrier du mois en cours ---
  var maintenant = new Date();
  var annee = maintenant.getFullYear();
  var mois = maintenant.getMonth();
  q('titre-mois').textContent = IPP_MOIS[mois] + ' ' + annee;

  var faits = {};
  var liste = IPP.jours();
  for (var i = 0; i < liste.length; i++) { faits[liste[i]] = true; }

  // getDay() : 0 = dimanche. Les semaines commencent le lundi.
  var decalage = (new Date(annee, mois, 1).getDay() + 6) % 7;
  var nbJours = new Date(annee, mois + 1, 0).getDate();
  var ceJour = maintenant.getDate();

  var html = '';
  for (var v = 0; v < decalage; v++) {
    html += '<div class="jour vide-case" aria-hidden="true"></div>';
  }
  for (var d = 1; d <= nbJours; d++) {
    var fait = !!faits[IPP.enCle(new Date(annee, mois, d))];
    var couleur = fait ? '#c9a84c' : 'rgba(253,250,243,0.10)';
    var titre = d + ' ' + IPP_MOIS[mois].toLowerCase() + (fait ? ' : lecon faite' : '');
    var contour = (d === ceJour && !fait)
      ? ' stroke="rgba(201,168,76,0.55)" stroke-width="1.5"' : '';
    html += '<div class="jour" title="' + titre + '">'
          + '<svg width="100%" height="100%" viewBox="0 0 24 24" role="img" aria-label="' + titre + '">'
          + '<path d="M12 2 L22 12 L12 22 L2 12 Z M5 5 H19 V19 H5 Z" fill="' + couleur + '"' + contour + '/>'
          + '</svg></div>';
  }
  q('mois').innerHTML = html;

  if (!liste.length) {
    q('legende-mois').textContent =
      'Aucun jour rempli pour l\'instant. Chaque etoile doree sera un jour ou tu es venu apprendre.';
  }

  // --- le rendez-vous quotidien ---
  ippRendreMoment(q);

  // --- rappel du point de depart, et possibilite de le refaire ---
  ippRendrePointDepart(q);

  // --- parcours (sans lien : on est deja sur la page) ---
  q('parcours').innerHTML = ippListeParcours(null);

  // --- revisions a venir ---
  var prevues = [];
  var pubs = IPP.publiees();
  for (var k = 0; k < pubs.length; k++) {
    var f = IPP.fiche(pubs[k].id);
    if (f && f.revoirLe) { prevues.push({ lecon: pubs[k], quand: f.revoirLe }); }
  }
  prevues.sort(function (a, b) { return a.quand < b.quand ? -1 : 1; });

  if (!prevues.length) {
    q('revisions').innerHTML = '<p class="vide">Aucune revision programmee. Elles apparaissent '
                             + 'automatiquement des que tu termines une lecon.</p>';
  } else {
    var jour = IPP.aujourdhui();
    var h = '';
    for (var m = 0; m < prevues.length; m++) {
      var due = prevues[m].quand <= jour;
      h += '<a class="ligne" href="' + prevues[m].lecon.url + '">'
         + ippEtoile(17, due ? '#c9a84c' : '#6c8271')
         + '<span><span class="t">' + ippEchappe(prevues[m].lecon.titre) + '</span>'
         + '<span class="s">' + (due ? 'A revoir aujourd\'hui'
             : 'Le ' + IPP.dateLongue(IPP.depuisCle(prevues[m].quand))) + '</span></span>'
         + '<span class="fl" aria-hidden="true">&rsaquo;</span></a>';
    }
    q('revisions').innerHTML = h;
  }
}

// Le rendez-vous quotidien, sur "Mon chemin" : on l'affiche et on peut le changer.
function ippRendreMoment(q) {
  var zone = q('moment-bloc');
  if (!zone) { return; }

  function proposer() {
    zone.innerHTML = '<div class="moment-zone" data-r="moment-choix"></div>';
    ippProposerMoment(ippViseur(zone), function () { montrer(); });
  }

  function montrer() {
    var m = IPP.moment();
    if (!m) { proposer(); return; }
    zone.innerHTML =
        '<div class="niveau-carte">'
      + '<p class="rdv cest-maintenant">' + ippEchappe(m.nom) + '</p>'
      + '<p class="note-pied">Le site ne calcule pas les horaires de priere. '
      + 'Pour ceux de ta ville&nbsp;: '
      + '<a href="https://voyageshalal.fr/horaires-priere">voyageshalal.fr</a>.</p>'
      + '<button class="btn fantome" type="button" data-r="moment-changer">Changer de moment</button>'
      + '</div>';
    var b = zone.querySelector('[data-r="moment-changer"]');
    if (b) {
      b.addEventListener('click', function () {
        IPP.oublierMoment();
        proposer();
      });
    }
  }

  montrer();
}

// Rappel de ce que la personne a declare au depart, et moyen de le corriger.
// On affiche ses reponses telles quelles, sans note ni jugement.
function ippRendrePointDepart(q) {
  var zone = q('niveau-bloc');
  if (!zone) { return; }

  var MOTS = {
    priere:  { non: 'Pas encore', parfois: 'Pas les cinq', oui: 'Les cinq' },
    fatiha:  { non: 'Pas encore', incertain: 'Sans etre sur', oui: 'Par coeur' },
    memoire: { aucune: 'Aucune', quelques: 'Quelques courtes', beaucoup: 'Plus de dix' }
  };
  function mot(champ, valeur) { return MOTS[champ][valeur] || 'Non precise'; }

  var n = IPP.niveau();

  // Le lien pointe vers l'accueil : on efface le niveau, et les trois
  // questions reapparaissent d'elles-memes a l'arrivee.
  var lien = '<a class="btn fantome" href="index.html" data-r="niveau-refaire">'
           + (n ? 'Mon niveau a change' : 'Repondre aux 3 questions') + '</a>';

  if (!n) {
    zone.innerHTML = '<div class="niveau-carte">'
      + '<p class="note-pied">Tu n\'as pas encore repondu aux trois questions d\'accueil. '
      + 'Elles servent seulement a ne pas te faire apprendre ce que tu sais deja.</p>'
      + lien + '</div>';
  } else {
    zone.innerHTML = '<div class="niveau-carte"><dl>'
      + '<div class="ligne-n"><dt>La priere</dt><dd>' + mot('priere', n.priere) + '</dd></div>'
      + '<div class="ligne-n"><dt>Al-Fatiha</dt><dd>' + mot('fatiha', n.fatiha) + '</dd></div>'
      + '<div class="ligne-n"><dt>Sourates par coeur</dt><dd>' + mot('memoire', n.memoire) + '</dd></div>'
      + '</dl>' + lien + '</div>';
  }

  var refaire = q('niveau-refaire');
  if (refaire) {
    // On n'empeche pas la navigation : on efface juste avant qu'elle ait lieu.
    refaire.addEventListener('click', function () { IPP.oublierNiveau(); });
  }
}

// Liste des parcours. Les parcours sans lecon publiee sont annonces "Bientot"
// plutot que d'afficher un faux compteur.
function ippListeParcours(lien) {
  var etats = IPP.parcoursAvecEtat();
  var out = '';
  for (var j = 0; j < etats.length; j++) {
    var p = etats[j];
    if (p.pret) {
      var pct = p.total ? Math.round((p.faites / p.total) * 100) : 0;
      var ouvre = lien ? '<a class="pc" href="' + lien + '">' : '<div class="pc">';
      var ferme = lien ? '</a>' : '</div>';
      out += ouvre
           + '<span class="haut"><span class="nom">' + ippEchappe(p.nom) + '</span>'
           + '<span class="cpt">' + p.faites + ' / ' + p.total + '</span></span>'
           + '<span class="barre-p"><span style="width:' + pct + '%"></span></span>'
           + ferme;
    } else {
      out += '<div class="ligne inerte">' + ippEtoile(17)
           + '<span><span class="t">' + ippEchappe(p.nom) + '</span>'
           + '<span class="s">Bientot</span></span></div>';
    }
  }
  return out;
}


/* =========================================================
   Vue 3 : le lecteur de lecon, commun a toutes les lecons

   La page contient toutes ses cartes en clair dans le HTML : sans
   JavaScript, la lecon se lit d'un seul tenant, et c'est ce que Google
   indexe. Avec JavaScript, on la pilote carte par carte. La derniere
   carte est l'ecran de fin.
   ========================================================= */

function ippDemarrerLecon(id, racine) {
  'use strict';
  var q = ippViseur(racine);
  var zone = q('etapes');
  if (!zone) { return; }

  var etapes = zone.querySelectorAll('.etape');
  var TOTAL = etapes.length;
  var CONTENU = TOTAL - 1;
  var courante = 1;
  var enregistree = false;

  zone.classList.add('pilote');

  var bas = q('bas');
  var bouton = q('suivant');
  bas.hidden = false;

  var html = '';
  for (var i = 0; i < CONTENU; i++) { html += '<span class="pt"></span>'; }
  q('points').innerHTML = html;
  var segments = q('points').querySelectorAll('.pt');

  function afficher(defiler) {
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

    // Sans cela on resterait au milieu du texte de la carte precedente.
    if (defiler) {
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

    var phrase = 'Tu connais maintenant ' + total + ' enseignements, chacun avec sa source. '
               + 'Cette lecon reviendra dans ' + r.pas + (r.pas > 1 ? ' jours.' : ' jour.');
    if (serie > 1) { phrase += ' ' + serie + ' jours d\'affilee.'; }

    var cible = q('fin-texte');
    if (cible) { cible.textContent = phrase; }

    // C'est ici qu'on demande le rendez-vous quotidien : juste apres l'effort.
    ippProposerMoment(q);

    var suite = q('fin-suite');
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
    afficher(true);
  });

  afficher(false);
}


/* =========================================================
   Le rendez-vous : propose a la fin d'une lecon

   C'est le bon moment pour le demander : la personne vient de finir, elle
   sent l'interet, c'est la qu'une intention se prend. On ne le demande donc
   pas a l'inscription (il n'y en a pas) ni dans les trois questions
   d'accueil, qui restent a trois.
   ========================================================= */

function ippProposerMoment(q, quandChoisi) {
  'use strict';
  var zone = q('moment-choix');
  if (!zone) { return; }

  var m = IPP.moment();

  if (m) {
    // Deja choisi : on rappelle simplement le rendez-vous.
    zone.innerHTML = '<p class="rdv cest-maintenant" style="text-align:center">'
                   + 'On se retrouve ' + ippEchappe(m.dit) + '.</p>';
    zone.hidden = false;
    return;
  }

  var options = '';
  for (var i = 0; i < IPP.MOMENTS.length; i++) {
    options += '<button class="opt" type="button" data-m="' + IPP.MOMENTS[i].id + '">'
             + ippEchappe(IPP.MOMENTS[i].nom) + '</button>';
  }

  zone.innerHTML =
      '<div class="rdv-choix">'
    + '<span class="eyebrow">Pour revenir demain</span>'
    + '<h3>A quel moment veux-tu apprendre ?</h3>'
    + '<p class="clair">Une lecon &laquo;&nbsp;quand j\'aurai le temps&nbsp;&raquo; est une '
    + 'lecon jamais faite. Choisis un repere dans ta journee.</p>'
    + '<div class="choix">' + options + '</div>'
    + '<button class="lien-discret" type="button" data-m="">Pas d\'heure fixe</button>'
    + '<p class="prudence">Ce site <strong>ne calcule pas</strong> les horaires de priere&nbsp;: '
    + 'tu choisis seulement un repere dans ta journee, et rien d\'autre n\'est affiche. '
    + 'Pour les horaires exacts de ta ville, va sur '
    + '<a href="https://voyageshalal.fr/horaires-priere">voyageshalal.fr</a>.</p>'
    + '</div>';
  zone.hidden = false;

  zone.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-m]') : null;
    if (!b || !zone.contains(b)) { return; }
    var id = b.getAttribute('data-m');
    var choisi = id ? IPP.enregistrerMoment(id) : null;
    zone.innerHTML = '<p class="rdv cest-maintenant" style="text-align:center">'
      + (choisi ? 'On se retrouve ' + ippEchappe(choisi.dit) + '.'
                : 'Comme tu veux. Reviens quand tu peux.')
      + '</p>';
    if (typeof quandChoisi === 'function') { quandChoisi(choisi); }
  });
}


/* =========================================================
   Vue 0 : les trois questions d'accueil

   Objectif : ne pas faire apprendre a quelqu'un ce qu'il sait deja.
   Trois questions, quinze secondes, aucun compte, et la possibilite de
   passer a tout moment.

   Regle de ton, non negociable : aucune reponse n'est mauvaise. Celui qui
   repond "non" partout doit se sentir accueilli. C'est peut-etre un converti
   d'hier, et c'est exactement pour lui que ce site existe.
   ========================================================= */

var IPP_BILANS = {
  debutant: {
    titre: 'On commence par le debut.',
    message: 'C\'est exactement pour cela que ce site existe. Cinq minutes par jour, '
           + 'et chaque mot avec sa source. Rien a rattraper, rien a prouver.'
  },
  intermediaire: {
    titre: 'Tu as deja des bases.',
    message: 'On ne va pas te refaire ce que tu sais. On va surtout rendre plus clair '
           + 'ce que tu recites deja.'
  },
  // {n} est remplace par le nombre reel de lecons publiees, pour que ce
  // message ne devienne jamais faux quand le catalogue grandit.
  avance: {
    titre: 'Tu es en avance sur le site.',
    message: 'Autant te le dire franchement : il n\'y a que {n} lecons ici aujourd\'hui, '
           + 'et tu connais deja une bonne partie de l\'une d\'elles. On commence donc '
           + 'par ce que tu ne sais pas, et j\'ecris la suite.'
  },
  inconnu: {
    titre: 'Comme tu veux.',
    message: 'Tu pourras repondre a ces questions plus tard depuis "Mon chemin". '
           + 'En attendant, on commence par le commencement.'
  }
};

function ippDemarrerDiagnostic(racine, quandFini) {
  'use strict';
  var q = ippViseur(racine);
  var zone = q('diag');
  if (!zone) { return; }

  var questions = zone.querySelectorAll('.q-etape');
  var TOTAL = questions.length;
  var courante = 1;
  var reponses = {};

  zone.hidden = false;

  // Points de progression
  var html = '';
  for (var i = 0; i < TOTAL; i++) { html += '<span class="pt"></span>'; }
  q('diag-points').innerHTML = html;
  var segments = q('diag-points').querySelectorAll('.pt');

  function afficher() {
    for (var a = 0; a < questions.length; a++) {
      questions[a].classList.toggle('actif',
        Number(questions[a].getAttribute('data-q')) === courante);
    }
    for (var b = 0; b < segments.length; b++) {
      segments[b].classList.toggle('faite', b < courante);
    }
  }

  function conclure(passe) {
    var enregistre = IPP.enregistrerNiveau(passe ? {} : reponses);
    var bilan = IPP_BILANS[IPP.profil()] || IPP_BILANS.inconnu;

    q('diag-questions').hidden = true;
    q('diag-passer').hidden = true;
    q('diag-points').innerHTML = '';
    q('diag-titre').textContent = bilan.titre;
    q('diag-message').textContent =
      bilan.message.replace('{n}', String(IPP.publiees().length));

    var suite = IPP.leconDuJour();
    var bouton = q('diag-go');
    bouton.textContent = suite ? 'Commencer : ' + suite.lecon.titre : 'Voir mon chemin';

    q('diag-fin').hidden = false;
    return enregistre;
  }

  // Un clic sur une reponse enregistre et passe a la suite.
  zone.addEventListener('click', function (e) {
    var opt = e.target.closest ? e.target.closest('.opt') : null;
    if (!opt || !zone.contains(opt)) { return; }
    var etape = opt.closest('.q-etape');
    reponses[etape.getAttribute('data-cle')] = opt.getAttribute('data-val');

    if (courante >= TOTAL) { conclure(false); return; }
    courante++;
    afficher();
  });

  q('diag-passer').addEventListener('click', function () { conclure(true); });

  q('diag-go').addEventListener('click', function () {
    zone.hidden = true;
    if (typeof quandFini === 'function') { quandFini(); }
  });

  afficher();
}
