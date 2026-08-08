/* =========================================================
   Islam pas a pas - logique commune
   Aucune dependance, aucun build. La progression reste sur
   l'appareil de l'utilisateur (localStorage), rien n'est envoye.
   ========================================================= */

(function (global) {
  'use strict';

  var CLE = 'ipp.progression.v1';

  /* ---------- les themes ---------------------------------------------------
     REGLE : on n'affiche que ce qui existe.

     Ce tableau ne contient que les themes qui ont deja au moins une lecon
     ecrite et verifiee. Il sert d'etiquette a la lecon ("Le sens des
     sourates" sous le titre), pas de vitrine.

     Le site a longtemps annonce dix-huit themes dont douze etaient vides.
     C'etait une promesse a credit. Les douze themes retires attendent dans
     NOTES-lecons-a-venir.md : ils reviennent ici le jour ou leur premiere
     lecon est ecrite, pas avant. Une case en moins ne coute rien ; une case
     vide coute la confiance.

     Absent volontairement : la zakat et tout ce qui touche a l'argent.
     Decision de Mohamed, sa responsabilite est en jeu. Ne pas l'ajouter sans
     son accord explicite.
     ---------------------------------------------------------------------- */

  var PARCOURS = [
    { id: 'foi', nom: 'Les bases de la foi',
      quoi: 'Les six piliers de la foi, un par un, avec leur source.' },
    { id: 'prophetes', nom: 'Les prophetes',
      quoi: 'Ceux que le Coran nomme, et ce qu\'il raconte d\'eux.' },
    { id: 'priere', nom: 'La priere pas a pas',
      quoi: 'Les gestes et les paroles, unite par unite.' },
    { id: 'sourates', nom: 'Le sens des sourates',
      quoi: 'Verset par verset, en commencant par les plus recitees.' },
    { id: 'alphabet', nom: 'L\'alphabet arabe',
      quoi: 'Les 28 lettres, leur son et leurs formes selon la place.' },
    { id: 'invocations', nom: 'Les invocations du jour',
      quoi: 'Au reveil, en mangeant, en sortant, avant de dormir.' }
  ];

  var CATALOGUE = [
    {
      id: 'al-fatiha',
      titre: 'Sourate Al-Fatiha, verset par verset',
      url: 'lecon-al-fatiha.html',
      parcours: 'sourates',
      minutes: 8,
      cartes: 14,
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
    },
    {
      id: 'alphabet-arabe',
      titre: 'L\'alphabet arabe : les 28 lettres',
      url: 'lecon-alphabet-arabe.html',
      parcours: 'alphabet',
      minutes: 7,
      cartes: 12,
      acquis: 28,
      publiee: true,
      resume: 'Bonne nouvelle : ce ne sont pas 28 dessins a retenir, mais 18. '
            + 'Ce sont les points qui font le reste.'
    },
    {
      id: 'prophetes-coran',
      titre: 'Les 25 prophetes nommes dans le Coran',
      url: 'lecon-prophetes-coran.html',
      parcours: 'prophetes',
      minutes: 8,
      cartes: 12,
      acquis: 25,
      publiee: true,
      resume: 'Dix-sept d\'entre eux sont cites d\'affilee dans un seul passage. '
            + 'Tu les apprends par paquets, pas un par un.'
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

  /* ---------- la serie, et son filet ---------------------------------------
     Une serie nue est un piege : le premier jour manque et tout s'effondre
     (« j'ai perdu mes quarante jours, j'arrete »). D'ou le JOUR DE GRACE : on
     en gagne un tous les cinq jours de serie, deux en stock au maximum, et il
     se consomme tout seul quand un jour manque.

     Rien de tout cela n'est stocke : la serie, le stock de grace et le record
     sont RECALCULES a chaque fois depuis la liste des jours. Un compteur
     ecrit quelque part finit toujours par mentir ; une valeur recalculee ne
     peut pas deriver.

     Regle de ton, non negociable : ce compteur ne juge personne. Une serie
     cassee repart a 1 sans un mot de reproche, et jamais de pression
     religieuse — on ne melange pas un mecanisme de produit avec la crainte
     d'Allah.
     ---------------------------------------------------------------------- */

  var GRACE_TOUS_LES = 5;
  var GRACE_MAX = 2;

  function ecartJours(a, b) {
    return Math.round((depuisCle(b) - depuisCle(a)) / 86400000);
  }

  function serieDetaillee() {
    var liste = jours();
    if (!liste.length) {
      return { serie: 0, record: 0, grace: 0, sauvee: false, jamais: true };
    }

    var serie = 0;
    var grace = 0;
    var record = 0;
    var sauvee = false;      // la serie en cours a-t-elle ete sauvee par une grace ?

    function compter() {
      serie++;
      if (serie % GRACE_TOUS_LES === 0) { grace = Math.min(GRACE_MAX, grace + 1); }
      if (serie > record) { record = serie; }
    }

    compter();               // le premier jour de l'historique
    for (var i = 1; i < liste.length; i++) {
      var manques = ecartJours(liste[i - 1], liste[i]) - 1;
      if (manques === 0) {
        compter();
      } else if (manques <= grace) {
        grace -= manques;    // le filet a joue
        sauvee = true;
        compter();
      } else {
        serie = 0;           // la chaine casse : on repart, sans commentaire
        grace = 0;
        sauvee = false;
        compter();
      }
    }

    // De la derniere visite a aujourd'hui. Aujourd'hui ne compte pas comme
    // manque : la journee n'est pas finie.
    var restant = ecartJours(liste[liste.length - 1], aujourdhui()) - 1;
    if (restant > 0) {
      if (restant <= grace) {
        grace -= restant;
        sauvee = true;
      } else {
        serie = 0;
        grace = 0;
        sauvee = false;
      }
    }

    return { serie: serie, record: record, grace: grace, sauvee: sauvee, jamais: false };
  }

  function serie() { return serieDetaillee().serie; }

  /* ---------- l'objectif du jour -------------------------------------------
     Minuscule et toujours atteignable : une lecon OU trois revisions. Un
     objectif qu'on peut rater les jours de fatigue est un objectif qui fait
     fermer le site — justement les jours ou la serie a besoin de nous.
     ---------------------------------------------------------------------- */

  var OBJ_REVISIONS = 3;

  function objectifDuJour() {
    var d = charger();
    var jour = aujourdhui();
    var neuves = 0;
    var revisions = 0;

    for (var id in d.lecons) {
      if (!Object.prototype.hasOwnProperty.call(d.lecons, id)) { continue; }
      var f = d.lecons[id];
      if (!f || f.faitLe !== jour) { continue; }
      if ((f.tours || 1) > 1) { revisions++; } else { neuves++; }
    }

    var part = Math.max(neuves, revisions / OBJ_REVISIONS);
    return {
      neuves: neuves,
      revisions: revisions,
      atteint: part >= 1,
      part: Math.min(1, part)
    };
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

  // Le compte honnete de ce qui existe. Calcule depuis le catalogue, jamais
  // ecrit a la main : un chiffre ecrit a la main devient faux a la lecon
  // suivante, et c'est deja arrive deux fois sur ce site.
  function chiffresOffre() {
    var pubs = publiees();
    var minutes = 0;
    var choses = 0;
    for (var i = 0; i < pubs.length; i++) {
      minutes += pubs[i].minutes;
      choses += pubs[i].acquis;
    }
    return { lecons: pubs.length, minutes: minutes, acquis: choses };
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
    serieDetaillee: serieDetaillee,
    objectifDuJour: objectifDuJour,
    aRevoir: aRevoir,
    acquis: acquis,
    publiees: publiees,
    ordreLecons: ordreLecons,
    leconDuJour: leconDuJour,
    chiffresOffre: chiffresOffre,
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

  // --- l'anneau du jour et la serie ---
  ippRendreJourEtat(q);

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
  // Une seule note, et seulement quand elle apprend quelque chose. Dire
  // "choisie d'apres tes reponses" a un debutant n'apporte rien : c'est du
  // texte de plus autour du seul bouton qui compte.
  var note = q('niveau-note');
  if (note) {
    if (IPP.profil() === 'avance') {
      note.textContent = 'D\'apres tes reponses, Al-Fatiha passe apres : tu la connais deja par coeur.';
      note.hidden = false;
    } else {
      note.hidden = true;
    }
  }

  // --- une revision due : une ligne, pas un bloc ---
  // L'accueil ne propose qu'un seul geste. Mais si une lecon deja vue revient
  // aujourd'hui et qu'une lecon neuve passe devant, on ne l'efface pas pour
  // autant : elle tient sur une ligne, sous le bouton.
  var rappel = q('rappel');
  if (rappel) {
    var dues = IPP.aRevoir();
    var autre = null;
    for (var i = 0; i < dues.length; i++) {
      if (!choix || dues[i].id !== choix.lecon.id) { autre = dues[i]; break; }
    }
    if (autre) {
      rappel.innerHTML = ippEchappe(autre.titre) + ' revient aujourd\'hui&nbsp;: '
                       + '<a href="' + autre.url + '">la revoir en '
                       + autre.minutes + ' min</a>';
      rappel.hidden = false;
    } else {
      rappel.hidden = true;
    }
  }
}


/* =========================================================
   L'anneau du jour, la serie et son record

   Trois informations sur une seule ligne, en haut de l'accueil : ou j'en suis
   aujourd'hui, depuis combien de jours je viens, et mon record. L'anneau est
   visible avant d'avoir commence — c'est ce qui donne envie de le fermer.

   Ton : jamais un reproche, jamais une pression religieuse. Une serie cassee
   repart a 1 et on n'en parle pas.
   ========================================================= */

function ippAnneau(part, ferme) {
  'use strict';
  // Un cercle de perimetre connu : on decouvre le trait a la proportion voulue.
  var RAYON = 26;
  var TOUR = 2 * Math.PI * RAYON;
  var fait = Math.max(0, Math.min(1, part)) * TOUR;

  // A zero, on ne dessine pas l'arc du tout : un bout de trait arrondi de
  // longueur nulle laisse quand meme un point dore, et ce point ressemble a
  // une salissure plutot qu'a un debut.
  var arc = (fait > 0.5)
    ? '<circle cx="32" cy="32" r="' + RAYON + '" fill="none" stroke="#c9a84c" '
      + 'stroke-width="5" stroke-linecap="round" '
      + 'stroke-dasharray="' + fait.toFixed(1) + ' ' + TOUR.toFixed(1) + '" '
      + 'transform="rotate(-90 32 32)"/>'
    : '';

  return '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">'
       + '<circle cx="32" cy="32" r="' + RAYON + '" fill="none" '
       + 'stroke="rgba(253,250,243,0.10)" stroke-width="5"/>'
       + arc
       + '<path d="M32 20 L44 32 L32 44 L20 32 Z M25 25 H39 V39 H25 Z" '
       + 'fill="' + (ferme ? '#c9a84c' : 'rgba(253,250,243,0.16)') + '" '
       + 'transform="scale(0.62) translate(19.6 19.6)"/>'
       + '</svg>';
}

function ippRendreJourEtat(q) {
  'use strict';
  var bloc = q('jour-etat');
  if (!bloc) { return; }

  var s = IPP.serieDetaillee();
  var o = IPP.objectifDuJour();

  bloc.hidden = false;
  bloc.classList.toggle('ferme', o.atteint);

  var anneau = q('anneau');
  if (anneau) { anneau.innerHTML = ippAnneau(o.part, o.atteint); }

  // L'objectif : ce qu'il reste a faire, dit en une ligne et sans reproche.
  var txt = q('objectif-txt');
  if (txt) {
    if (o.atteint) {
      txt.textContent = 'Objectif du jour atteint.';
    } else if (o.revisions > 0) {
      var reste = 3 - o.revisions;
      txt.textContent = 'Objectif du jour : une lecon, ou '
                      + (reste === 1 ? 'une revision de plus' : reste + ' revisions de plus') + '.';
    } else {
      txt.textContent = 'Objectif du jour : une lecon. Cinq minutes suffisent.';
    }
  }

  // La serie. A 0, on n'ecrit pas "0" : on invite, on ne constate pas un vide.
  var st = q('serie-txt');
  if (st) {
    if (s.serie === 0) {
      st.textContent = 'Ta serie commence aujourd\'hui.';
    } else {
      var mot = s.serie === 1 ? '1 jour' : s.serie + ' jours d\'affilee';
      // Le record ne s'affiche que s'il apprend quelque chose : l'egaler ou le
      // depasser, c'est deja l'information portee par la serie elle-meme.
      st.textContent = (s.record > s.serie)
        ? mot + ' — ton record est de ' + s.record + '.'
        : mot + (s.serie >= 2 ? ' — c\'est ton record.' : '.');
    }
  }

  var jeton = q('jeton');
  if (jeton) {
    if (s.serie > 0) {
      jeton.hidden = false;
      jeton.innerHTML = ippEtoile(14, '#c9a84c') + '<span>' + s.serie + '</span>';
      jeton.setAttribute('title', s.serie + (s.serie === 1 ? ' jour' : ' jours') + ' d\'affilee');
    } else {
      jeton.hidden = true;
    }
  }

  // La grace : annoncee seulement apres avoir servi.
  var g = q('grace-mot');
  if (g) {
    if (s.sauvee && s.serie > 0) {
      g.textContent = 'Ton jour de grace a sauve ta serie. Il en faut cinq jours pour en regagner un.';
      g.hidden = false;
    } else {
      g.hidden = true;
    }
  }
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
    : (n === 1 ? 'chose apprise.<br>Continue demain.'
               : 'choses apprises,<br>lecon apres lecon.');

  // --- la serie, son record, et le filet ---
  var rec = q('record');
  if (rec) {
    var s = IPP.serieDetaillee();
    if (s.jamais) {
      rec.textContent = 'Ta serie commencera a ta premiere lecon.';
    } else {
      var bouts = [];
      bouts.push(s.serie === 0 ? 'Serie interrompue — elle repartira a 1 des ta prochaine lecon'
                               : 'Serie en cours : ' + s.serie + (s.serie === 1 ? ' jour' : ' jours'));
      bouts.push('record : ' + s.record + (s.record === 1 ? ' jour' : ' jours'));
      if (s.grace > 0) {
        bouts.push(s.grace === 1 ? '1 jour de grace en reserve'
                                 : s.grace + ' jours de grace en reserve');
      }
      rec.textContent = bouts.join(' &middot; ').replace(/&middot;/g, '·') + '.';
    }
  }

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

  // --- le chemin : toutes les lecons, et ou l'on en est ---
  q('lecons').innerHTML = ippListeLecons();
  ippTracerChemin(q('lecons').parentNode);

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

// Toutes les lecons qui existent, avec leur etat. Sert a "Mon chemin".
// Il n'y a rien d'autre a lister : ce que cette fonction renvoie est
// exactement ce que le site sait enseigner aujourd'hui.
function ippListeLecons() {
  var pubs = IPP.publiees();
  var out = '';
  for (var i = 0; i < pubs.length; i++) {
    var l = pubs[i];
    var faite = IPP.estFaite(l.id);
    out += '<article class="pcarte ouvert" data-lecon="' + l.id + '">'
         + '<span class="etiq-p ok" data-r-etat>' + (faite ? 'Deja faite' : l.minutes + ' min')
         + '</span>'
         + '<h3>' + ippEchappe(l.titre) + '</h3>'
         + '<p class="pquoi">' + ippEchappe(l.resume || '') + '</p>'
         + '<div class="pliens"><a class="ligne" href="' + l.url + '">'
         + ippEtoile(15, '#c9a84c')
         + '<span><span class="t">Ouvrir la lecon</span>'
         + '<span class="s">' + l.cartes + ' cartes &middot; '
         + ippEchappe(IPP.nomParcours(l.parcours)) + '</span></span>'
         + '<span class="fl" aria-hidden="true">&rsaquo;</span></a></div>'
         + '</article>';
  }
  return out;
}


/* =========================================================
   Le chemin : six lecons sur un trajet, pas dans une liste

   Meme contenu, effet inverse. Une liste de six lignes dit « il n'y en a que
   six ». Un trajet qui serpente dit « voila ou tu en es », et l'etape suivante
   se voit avant d'etre lue.

   Comment c'est construit, et pourquoi : les cartes sont deja dans le HTML de
   parcours.html (donc lisibles par Google et sans JavaScript). Cette fonction
   ne fait que POSER le trajet par-dessus — medaillons, segments, etat. Sans
   JavaScript, il reste une suite de cartes propres : on ne perd que la
   decoration.

   Le zigzag ne depend jamais de la hauteur des cartes : les courbes vivent
   dans des elements de hauteur FIXE intercales entre les etapes. Une carte qui
   grandit ne casse donc pas le trace.
   ========================================================= */

// Les deux abscisses du serpent. Le medaillon le plus large (34px, l'etape en
// cours) doit rester dans la gouttiere : 36 + 17 = 53, sous les 54px de retrait
// des cartes. Si l'une de ces valeurs change, verifier l'autre.
var IPP_CHEMIN_X = [18, 36];

function ippTracerChemin(racine) {
  'use strict';
  var r = racine || document;
  var zone = r.querySelector('.chemin-vertical');
  if (!zone) { return; }

  var etapes = [].slice.call(zone.querySelectorAll('[data-lecon]'));
  if (!etapes.length) { return; }

  // Un appel precedent a pu laisser ses courbes : on repart propre, sinon
  // elles s'empilent (l'apercu en un seul fichier retrace a chaque visite).
  var vieuxPonts = zone.querySelectorAll('.pont');
  for (var v = 0; v < vieuxPonts.length; v++) {
    vieuxPonts[v].parentNode.removeChild(vieuxPonts[v]);
  }

  // Les etapes sont remises dans l'ordre CONSEILLE, celui qui depend des trois
  // reponses du depart et qui decide aussi de la lecon du jour. Sans cela le
  // trajet montrait une etape faite apres deux etapes a venir : un chemin
  // troue, alors que rien n'etait faux — c'etait juste l'ordre d'affichage.
  var rang = {};
  var conseil = IPP.ordreLecons();
  for (var k = 0; k < conseil.length; k++) { rang[conseil[k].id] = k; }
  etapes.sort(function (a, b) {
    var ra = rang[a.getAttribute('data-lecon')];
    var rb = rang[b.getAttribute('data-lecon')];
    if (ra === undefined) { ra = 999; }
    if (rb === undefined) { rb = 999; }
    return ra - rb;
  });
  for (var m = 0; m < etapes.length; m++) { zone.appendChild(etapes[m]); }

  // L'etape en cours est celle que l'accueil propose : les deux ecrans doivent
  // raconter la meme chose, sinon on ne sait plus lequel croire.
  var choix = IPP.leconDuJour();
  var enCours = choix ? choix.lecon.id : null;

  zone.classList.add('trace');
  var precedent = null;

  for (var i = 0; i < etapes.length; i++) {
    var el = etapes[i];
    var id = el.getAttribute('data-lecon');
    var faite = IPP.estFaite(id);
    var etat = faite ? 'faite' : (id === enCours ? 'encours' : 'avenir');

    el.classList.remove('faite', 'encours', 'avenir');
    el.classList.add('etape-chemin', etat);

    // Le retrait des cartes est CONSTANT (pose en CSS) : seul le trace serpente,
    // dans la gouttiere. Faire varier le retrait des cartes donnait un bord
    // gauche en dents de scie qui ressemblait a un defaut, pas a un chemin.
    el.style.setProperty('--x', IPP_CHEMIN_X[i % 2] + 'px');

    // Le medaillon, pose sur le trait, a l'abscisse de cette etape.
    var vieux = el.querySelector('.medaillon');
    if (vieux) { vieux.parentNode.removeChild(vieux); }
    var med = document.createElement('span');
    med.className = 'medaillon';
    med.setAttribute('aria-hidden', 'true');
    med.innerHTML = ippEtoile(15, (faite || etat === 'encours') ? '#0b1a0f' : '#6c8271');
    el.insertBefore(med, el.firstChild);

    // La courbe qui relie l'etape precedente a celle-ci. Hauteur fixe : elle ne
    // depend d'aucun contenu.
    if (precedent !== null) {
      var de = IPP_CHEMIN_X[(i - 1) % 2];
      var vers = IPP_CHEMIN_X[i % 2];
      var franchi = IPP.estFaite(precedent);   // dore si l'etape d'avant est faite
      var pont = document.createElement('div');
      pont.className = 'pont' + (franchi ? ' franchi' : '');
      pont.setAttribute('aria-hidden', 'true');
      // Largeur FIXE, jamais 100% : etiree sur la largeur de l'ecran, la courbe
      // devenait un grand ruban au lieu d'un trait qui serpente.
      pont.innerHTML =
          '<svg width="60" height="34" viewBox="0 0 60 34" focusable="false">'
        + '<path d="M' + de + ' 0 C' + de + ' 17 ' + vers + ' 17 ' + vers + ' 34" '
        + 'fill="none" stroke-width="2" stroke-linecap="round"/>'
        + '</svg>';
      el.parentNode.insertBefore(pont, el);
    }
    precedent = id;
  }
}


/* =========================================================
   Vue : "Toutes les lecons"

   Les six lecons sont ecrites en dur dans parcours.html (donc lisibles par
   Google et sans JavaScript). Cette fonction ne fait que l'enrichir : elle
   compte, et elle marque ce qui est deja fait.
   ========================================================= */

function ippRendreOffre(racine) {
  'use strict';
  var r = racine || document;
  var q = ippViseur(racine);

  // --- le compte, calcule depuis le catalogue ---
  var c = IPP.chiffresOffre();
  var zone = q('compte');
  if (zone) {
    zone.innerHTML =
        '<div class="chiffres">'
      + '<div class="ch"><span class="n">' + c.lecons + '</span>'
      + '<span class="l">' + (c.lecons === 1 ? 'lecon prete' : 'lecons pretes') + '</span></div>'
      + '<div class="ch"><span class="n">' + c.minutes + '</span>'
      + '<span class="l">minutes en tout</span></div>'
      + '<div class="ch"><span class="n">' + c.acquis + '</span>'
      + '<span class="l">choses a apprendre</span></div>'
      + '</div>';
  }

  // --- marquer les lecons deja faites ---
  // Sans JavaScript, l'etiquette montre la duree : c'est deja une information
  // juste. Avec, elle devient "Deja faite" pour ce qui est derriere soi.
  var cartes = r.querySelectorAll('[data-lecon]');
  for (var j = 0; j < cartes.length; j++) {
    var el = cartes[j];
    if (!IPP.estFaite(el.getAttribute('data-lecon'))) { continue; }
    var etiq = el.querySelector('[data-r-etat]');
    if (etiq) { etiq.textContent = 'Deja faite'; }
  }

  // --- puis poser le trajet par-dessus les cartes ---
  ippTracerChemin(r);
}


/* =========================================================
   Le test de fin de lecon

   Pourquoi : lire onze cartes en appuyant sur "Suivant" ne demande aucun
   effort, donc ne laisse aucune trace. Trois questions a la fin obligent a
   se souvenir, et c'est le rappel actif qui fait tenir.

   Regle de ton : jamais punitif. Une mauvaise reponse montre la bonne et
   explique. Pas de vies perdues, pas de score qui humilie.
   ========================================================= */

function ippPreparerQuiz(etape, bouton, score, sonner) {
  'use strict';
  if (etape.__quizPret) { return; }
  etape.__quizPret = true;
  if (!sonner) { sonner = function () {}; }

  var choix = etape.querySelector('.q-choix');
  var retour = etape.querySelector('[data-r-retour]');
  if (!choix) { return; }

  // On melange les reponses : sinon la bonne finit toujours a la meme place et
  // on apprend la position au lieu du contenu.
  var opts = [].slice.call(etape.querySelectorAll('.q-opt'));
  for (var i = opts.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp;
  }
  for (var k = 0; k < opts.length; k++) { choix.appendChild(opts[k]); }

  choix.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.q-opt') : null;
    if (!b || etape.__repondu) { return; }
    etape.__repondu = true;

    var juste = b.hasAttribute('data-bonne');
    // "presque" et non un buzzer : le son de l'erreur decide si la personne
    // recommence ou ferme l'onglet.
    sonner(juste ? 'bon' : 'presque');
    b.classList.add(juste ? 'juste' : 'faux');
    if (!juste) {
      var bonne = etape.querySelector('.q-opt[data-bonne]');
      if (bonne) { bonne.classList.add('juste'); }
    }
    for (var m = 0; m < opts.length; m++) { opts[m].disabled = true; }

    if (retour) {
      retour.hidden = false;
      retour.className = 'q-retour ' + (juste ? 'ok' : 'non');
      var explique = etape.getAttribute('data-explique') || '';
      retour.textContent = (juste ? 'Oui. ' : 'Pas tout a fait — la bonne reponse est en dore. ') + explique;
    }

    score.total++;
    if (juste) { score.justes++; }
    bouton.disabled = false;
  });
}


/* =========================================================
   Le son : branche automatiquement s'il existe

   Aucun fichier audio n'est livre avec le site. La regle de l'empire est
   qu'aucune recitation ne soit publiee sans licence ecrite : une chaine qui
   se declare "sans copyright" n'a aucun droit de liberer la recitation d'un
   autre. Le jour ou Mohamed depose un fichier legitime dans audio/, le
   bouton apparait tout seul. Tant qu'il n'y en a pas, rien ne s'affiche et
   rien ne ment.
   ========================================================= */

function ippBrancherAudio(racine) {
  'use strict';
  var r = racine || document;
  var blocs = r.querySelectorAll('[data-audio]');
  if (!blocs.length || !window.fetch) { return; }

  for (var i = 0; i < blocs.length; i++) {
    (function (bloc) {
      var src = 'audio/' + bloc.getAttribute('data-audio') + '.mp3';
      // Sur un fichier ouvert en local, fetch peut lever tout de suite selon
      // le navigateur : le try protege le reste de la lecon.
      try {
      fetch(src, { method: 'HEAD' }).then(function (rep) {
        if (!rep.ok) { return; }          // pas de fichier : on n'affiche rien
        var son = new Audio(src);
        var bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'ecouter';
        bouton.innerHTML = '<span aria-hidden="true">&#9654;</span> Ecouter';
        bouton.addEventListener('click', function () {
          son.currentTime = 0;
          son.play();
        });
        bloc.appendChild(bouton);
      }).catch(function () { /* hors ligne ou refuse : on n'affiche rien */ });
      } catch (e) { /* acces refuse : pas de bouton, et la lecon continue */ }
    }(blocs[i]));
  }
}


/* =========================================================
   La voix lente : celle des ecoles coraniques

   Husary Mujawwad articule lentement. C'est la voix avec laquelle on apprend
   a reciter ; une recitation rapide est belle mais on ne peut pas la suivre.
   Le choix est garde d'une visite a l'autre par audio-coran.js.
   ========================================================= */

function ippBrancherVoixLente(q) {
  'use strict';
  var b = q('voix-lente');
  if (!b) { return; }

  // Sans audio-coran.js, le bouton ne promet rien : il disparait.
  if (typeof ippCoran === 'undefined') { b.hidden = true; return; }

  var note = q('voix-note');

  function peindre() {
    var lent = ippCoran.veutLent();
    b.textContent = lent ? 'Voix normale' : 'Voix lente';
    b.setAttribute('aria-pressed', lent ? 'true' : 'false');
    if (note) {
      note.textContent = lent
        ? 'Voix lente : Al-Husary, la recitation articulee des ecoles coraniques.'
        : 'Pour apprendre a reciter, la voix lente est plus facile a suivre.';
    }
  }

  b.addEventListener('click', function () {
    ippCoran.basculerLenteur();
    // Les boutons deja poses pointent vers l'ancienne voix : on les retire pour
    // que brancher() les repose avec la nouvelle source.
    var vieux = document.querySelectorAll('[data-coran] .ecouter');
    for (var i = 0; i < vieux.length; i++) { vieux[i].parentNode.removeChild(vieux[i]); }
    // Le credit nomme l'ancien recitateur : on l'efface, sinon brancher() le
    // laisse tel quel et la page cite quelqu'un qu'on n'entend plus.
    var credit = q('credit-audio') || document.querySelector('[data-r="credit-audio"]');
    if (credit) { credit.textContent = ''; }
    ippCoran.arreter();
    ippCoran.brancher(document);
    peindre();
  });

  peindre();
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
  var score = { justes: 0, total: 0 };

  zone.classList.add('pilote');
  ippBrancherAudio(zone);

  // La recitation et les sons d'interface sont dans des fichiers separes : une
  // page qui ne les charge pas doit continuer a fonctionner exactement pareil.
  if (typeof ippCoran !== 'undefined') { ippCoran.brancher(zone); }
  if (typeof ippSons !== 'undefined') { ippSons.brancherInterrupteur(racine); }
  function sonner(nom) {
    if (typeof ippSons !== 'undefined') { ippSons.jouer(nom); }
  }
  ippBrancherVoixLente(q);

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

      // Sur une carte de test, on ne peut pas passer sans repondre : c'est
      // justement l'effort qui fait retenir.
      var ici = zone.querySelector('.etape.actif');
      if (ici && ici.hasAttribute('data-quiz')) {
        bouton.disabled = !ici.__repondu;
        ippPreparerQuiz(ici, bouton, score, sonner);
      } else {
        bouton.disabled = false;
      }
    }

    // Sans cela on resterait au milieu du texte de la carte precedente.
    if (defiler) {
      var haut = zone.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo(0, Math.max(0, haut));
    }
  }

  // Vrai si la lecon qui vient de se terminer est la premiere du jour : c'est
  // le seul cas ou la serie augmente, donc le seul ou son son se justifie.
  var serieMonte = false;
  // Vrai si l'anneau du jour vient de se fermer. On ne le sonne QUE si la serie
  // n'a pas monte en meme temps : trois sons a la suite n'en font plus qu'un, et
  // c'est celui de la serie qui doit rester le plus fort.
  var objectifFerme = false;

  function cloturer() {
    if (enregistree) { return; }
    enregistree = true;

    serieMonte = !IPP.faitAujourdhui();
    var avant = IPP.objectifDuJour().atteint;
    var r = IPP.terminer(id);
    objectifFerme = !avant && IPP.objectifDuJour().atteint;
    var serie = IPP.serie();
    var total = IPP.acquis();
    var reste = IPP.publiees().filter(function (l) { return !IPP.estFaite(l.id); }).length;

    var phrase = '';
    if (score.total) {
      phrase += score.justes + ' sur ' + score.total
              + (score.justes === score.total ? ' — sans faute. ' : '. ');
    }
    phrase += 'Tu as maintenant appris ' + total + ' choses sur ce site. '
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
    // "tap" s'entend quatorze fois par lecon : il doit rester presque
    // invisible, et "fin" seul doit se remarquer.
    if (courante === TOTAL) {
      cloturer();
      sonner('fin');
      // Puis un seul des deux, jamais les deux : la serie si elle a monte,
      // sinon l'anneau s'il vient de se fermer (le chemin des trois revisions).
      if (serieMonte) {
        setTimeout(function () { sonner('serie'); }, 900);
      } else if (objectifFerme) {
        setTimeout(function () { sonner('objectif'); }, 900);
      }
    } else {
      sonner('tap');
    }
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
