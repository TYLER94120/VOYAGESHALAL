/* ==========================================================================
   MEMOIRE ET REVISION — section 9 du cahier des charges
   --------------------------------------------------------------------------
   Tout vit dans le navigateur, sous une cle unique : `ipap.v1`.
   Pas de compte, pas d'inscription, pas d'e-mail (section 2.2).

   REGLE DE FOND : on ne stocke que des FAITS, jamais un calcul.
   La serie de jours, la maitrise d'une section, le record : tout cela se
   recalcule a la lecture. Un chiffre range dans le stockage est un chiffre
   qui devient faux le jour ou la regle change, sans que personne le voie.
   ========================================================================== */

'use strict';

var CLE = 'ipap.v1';

/* Nombre de cartes apres lesquelles une question revient dans la session. */
var RETOUR_RATE = 8;    // section 9 : une question ratee revient 8 cartes plus loin
var RETOUR_PASSE = 4;   // une question passee, 4 cartes plus loin
var QCM_PRIORITAIRES = 3;   // une question `aRevoir` est prioritaire 3 QCM durant
var JUSTES_POUR_SORTIR = 3; // trois bonnes reponses consecutives et elle sort
var MINI_POUR_LE_JOUR = 10; // un QCM d'au moins 10 questions compte pour la serie

function vide() {
  return {
    v: 1,
    questions: {},   // id -> { vues, justes, suite, derniere, aRevoir, depuis }
    sessions: [],    // { id, section, jour, total, justes, duree }
    jours: [],       // 'AAAA-MM-JJ' des jours ou un QCM de 10+ a ete termine
    reprise: null,   // { section, paquet, pos, reponses, reglages, debut }
    reglages: null,  // les derniers reglages choisis
    recordSerie: 0
  };
}

function charger() {
  try {
    var brut = window.localStorage.getItem(CLE);
    if (!brut) { return vide(); }
    var d = JSON.parse(brut);
    if (!d || typeof d !== 'object') { return vide(); }
    var v = vide();
    // On repose chaque champ sur un socle sain : un stockage a moitie ecrit
    // (onglet ferme au mauvais moment) ne doit pas casser l'application.
    if (d.questions && typeof d.questions === 'object') { v.questions = d.questions; }
    if (Array.isArray(d.sessions)) { v.sessions = d.sessions; }
    if (Array.isArray(d.jours)) { v.jours = d.jours.filter(estUnJour); }
    if (d.reprise && typeof d.reprise === 'object') { v.reprise = d.reprise; }
    if (d.reglages && typeof d.reglages === 'object') { v.reglages = d.reglages; }
    if (typeof d.recordSerie === 'number' && d.recordSerie >= 0) { v.recordSerie = d.recordSerie; }
    return v;
  } catch (e) {
    // Navigation privee, stockage plein, JSON abime : on repart propre plutot
    // que de planter. La personne perd sa progression, pas l'application.
    return vide();
  }
}

function ranger(d) {
  try {
    window.localStorage.setItem(CLE, JSON.stringify(d));
    return true;
  } catch (e) {
    return false;
  }
}

function estUnJour(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); }

function jourDeAujourdhui() {
  var d = new Date();
  var m = String(d.getMonth() + 1);
  var j = String(d.getDate());
  return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (j.length < 2 ? '0' + j : j);
}

/* --------------------------------------------------------------------------
   Ce qu'on sait d'une question
   -------------------------------------------------------------------------- */

function fiche(d, id) {
  return d.questions[id] || { vues: 0, justes: 0, suite: 0, derniere: null, aRevoir: false, depuis: 0 };
}

/* Enregistre une reponse. `juste` vaut true, false, ou null si la question a
   ete PASSEE — passer n'est ni juste ni faux, et ne casse pas la serie. */
function noter(d, id, juste) {
  var f = fiche(d, id);
  if (juste === null) {
    // Une question passee ne compte pas comme vue : elle n'a pas ete jugee.
    d.questions[id] = f;
    return d;
  }
  f.vues += 1;
  f.derniere = juste;
  if (juste) {
    f.justes += 1;
    f.suite += 1;
    // Trois bonnes reponses consecutives : elle sort du paquet prioritaire.
    if (f.suite >= JUSTES_POUR_SORTIR) { f.aRevoir = false; f.depuis = 0; }
  } else {
    f.suite = 0;
    f.aRevoir = true;
    f.depuis = 0;   // le compteur de QCM prioritaires repart
  }
  d.questions[id] = f;
  return d;
}

/* --------------------------------------------------------------------------
   La maitrise d'une section
   --------------------------------------------------------------------------
   Pourcentage de ses questions dont la DERNIERE reponse est juste (section 9).
   Attention : le denominateur est le nombre TOTAL de questions de la section,
   pas le nombre de questions vues. Sinon quelqu'un qui a repondu juste a une
   seule question sur quatre cents afficherait 100 % de maitrise.
   -------------------------------------------------------------------------- */
function maitrise(d, idsDeLaSection) {
  if (!idsDeLaSection.length) { return 0; }
  var n = 0;
  for (var i = 0; i < idsDeLaSection.length; i++) {
    if (fiche(d, idsDeLaSection[i]).derniere === true) { n += 1; }
  }
  return Math.round(n * 100 / idsDeLaSection.length);
}

/* --------------------------------------------------------------------------
   La serie de jours
   --------------------------------------------------------------------------
   Elle s'incremente des qu'un QCM d'au moins 10 questions est termine dans la
   journee. On la RECALCULE a partir de la liste des jours : jamais stockee.
   -------------------------------------------------------------------------- */
function serieDeJours(d, aujourdhui) {
  var jours = {};
  for (var i = 0; i < d.jours.length; i++) { jours[d.jours[i]] = true; }
  var n = 0;
  var curseur = new Date(aujourdhui + 'T12:00:00');
  // Si rien aujourd'hui, la serie peut quand meme courir jusqu'a hier.
  if (!jours[aujourdhui]) { curseur.setDate(curseur.getDate() - 1); }
  for (;;) {
    var m = String(curseur.getMonth() + 1), j = String(curseur.getDate());
    var cle = curseur.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-'
      + (j.length < 2 ? '0' + j : j);
    if (!jours[cle]) { break; }
    n += 1;
    curseur.setDate(curseur.getDate() - 1);
  }
  return n;
}

function marquerLeJour(d, total) {
  if (total < MINI_POUR_LE_JOUR) { return d; }
  var j = jourDeAujourdhui();
  if (d.jours.indexOf(j) < 0) { d.jours.push(j); }
  return d;
}

/* --------------------------------------------------------------------------
   Les questions a revoir, toutes sections confondues
   -------------------------------------------------------------------------- */
function aRevoir(d) {
  var out = [];
  for (var id in d.questions) {
    if (Object.prototype.hasOwnProperty.call(d.questions, id) && d.questions[id].aRevoir) {
      out.push(id);
    }
  }
  return out;
}

/* Une question `aRevoir` est prioritaire dans les TROIS QCM suivants de sa
   section. On compte ces QCM ici, a la fin de chaque session. */
function vieillirLesPriorites(d, idsJoues) {
  for (var i = 0; i < idsJoues.length; i++) {
    var f = d.questions[idsJoues[i]];
    if (f && f.aRevoir) {
      f.depuis = (f.depuis || 0) + 1;
      if (f.depuis >= QCM_PRIORITAIRES) { f.aRevoir = false; f.depuis = 0; }
    }
  }
  return d;
}

/* --------------------------------------------------------------------------
   Export / import — la seule sauvegarde possible sans compte (section 9)
   -------------------------------------------------------------------------- */
function exporter(d) {
  return JSON.stringify(d, null, 2);
}

function importer(texte) {
  var d = JSON.parse(texte);            // laisse remonter l'erreur : l'appelant previent
  if (!d || typeof d !== 'object') { throw new Error('fichier illisible'); }
  if (!d.questions || typeof d.questions !== 'object') { throw new Error('ce fichier ne contient pas de progression'); }
  return d;
}

window.IPAP_MEMOIRE = {
  CLE: CLE,
  RETOUR_RATE: RETOUR_RATE,
  RETOUR_PASSE: RETOUR_PASSE,
  MINI_POUR_LE_JOUR: MINI_POUR_LE_JOUR,
  vide: vide,
  charger: charger,
  ranger: ranger,
  fiche: fiche,
  noter: noter,
  maitrise: maitrise,
  serieDeJours: serieDeJours,
  marquerLeJour: marquerLeJour,
  jourDeAujourdhui: jourDeAujourdhui,
  aRevoir: aRevoir,
  vieillirLesPriorites: vieillirLesPriorites,
  exporter: exporter,
  importer: importer
};
