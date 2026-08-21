/* ==========================================================================
   LE MOTEUR DU QCM — ecrans 4 a 7 du cahier des charges
   --------------------------------------------------------------------------
   Le QCM n'est plus une annexe des lecons. Le QCM EST le produit (section 1).

   Ce fichier tient la session : le paquet de cartes, la carte courante, la
   serie, la correction, et le passage au resultat. Le geste vit dans
   geste.js, la memoire dans memoire.js. Ici, on orchestre.
   ========================================================================== */

'use strict';

var M = window.IPAP_MEMOIRE;
var G = window.IPAP_GESTE;

var LETTRES = ['A', 'B', 'C', 'D'];

function $(id) { return document.getElementById(id); }

function echapper(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function melanger(l, rng) {
  var a = l.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor((rng ? rng() : Math.random()) * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ==========================================================================
   LA SESSION
   ========================================================================== */

function Session(questions, reglages, section) {
  this.reglages = reglages;
  this.section = section;
  this.paquet = questions.slice();   // ce qui reste a jouer, dans l'ordre
  this.pos = 0;
  this.total = questions.length;     // le nombre ANNONCE, celui de la barre
  this.reponses = [];                // { id, choix, juste, passee }
  this.serie = 0;
  this.record = M.charger().recordSerie || 0;
  this.debut = Date.now();
  this.vues = {};                    // id -> nombre de passages dans CETTE session
}

/* Une question ratee revient 8 cartes plus loin ; une question passee, 4
   (section 9). Si le paquet est plus court que ca, elle revient a la fin :
   la promesse « cette question reviendra » doit rester vraie, sinon on ment
   a l'ecran de correction. */
Session.prototype.remettre = function (q, dans) {
  var cible = Math.min(this.pos + dans, this.paquet.length);
  this.paquet.splice(cible, 0, q);
};

Session.prototype.courante = function () { return this.paquet[this.pos] || null; };
Session.prototype.suivante = function () { return this.paquet[this.pos + 1] || null; };

Session.prototype.finie = function () { return this.pos >= this.paquet.length; };

/* ==========================================================================
   L'AFFICHAGE D'UNE CARTE
   ========================================================================== */

function carteHTML(q, avecTampons) {
  if (!q) { return ''; }
  var h = '';
  h += '<div class="carte-tete">';
  h += '<span class="carte-surtitre">' + echapper(q.surtitre || q.theme || '') + '</span>';
  h += icone('signet', 18, 'signet-or');
  h += '</div>';
  if (q.arabe) {
    h += '<div class="carte-arabe" lang="ar" dir="rtl">' + echapper(q.arabe) + '</div>';
  }
  h += '<div class="t-question">' + echapper(q.question) + '</div>';
  h += '<div class="pousse"></div>';
  h += '<div class="reponses" role="group" aria-label="Les quatre reponses">';
  for (var i = 0; i < q.reponses.length; i++) {
    h += '<button type="button" class="reponse" data-i="' + i + '" aria-pressed="false">'
      + '<span class="lettre" aria-hidden="true">' + LETTRES[i] + '</span>'
      + '<span class="texte">' + echapper(q.reponses[i]) + '</span>'
      + '</button>';
  }
  h += '</div>';
  if (avecTampons) {
    h += '<div class="tampon" data-t="valider">VALIDER</div>';
    h += '<div class="tampon" data-t="passer">PASSER</div>';
  }
  return h;
}

/* ==========================================================================
   LE JEU
   ========================================================================== */

function Jeu(racine, session) {
  this.r = racine;
  this.s = session;
  this.choix = null;      // index choisi sur la carte courante
  this.geste = null;
  this.verrou = false;    // vrai pendant une correction : plus rien ne bouge
}

Jeu.prototype.demarrer = function () {
  var self = this;
  document.body.setAttribute('data-mode', 'qcm');
  this.dessinerSegments();
  this.dessinerCarte();
  this.clavier();
  $('qcm-sortir').addEventListener('click', function () { self.sortir(); });

  // Les deux cotes du pied sont des boutons : ils font ce que font la
  // fleche droite et la fleche gauche. Le geste reste le chemin principal,
  // ils sont le chemin evident.
  $('cote-droite').addEventListener('click', function () {
    if (self.verrou) { return; }
    self.geste.valider();
  });
  $('cote-gauche').addEventListener('click', function () {
    if (self.verrou) { return; }
    self.geste.passer();
  });
};

/* --- La barre segmentee (ecran 4) ------------------------------------- */
Jeu.prototype.dessinerSegments = function () {
  var zone = $('qcm-progres');
  var n = this.s.total;
  // Au-dela de 60 questions, on passe a une barre continue avec le compteur
  // chiffre : soixante segments de 4 px ne se lisent plus, ils se devinent.
  if (n > 60) {
    zone.innerHTML = '<div class="jauge"><i style="width:' +
      Math.round(this.s.pos * 100 / n) + '%"></i></div>';
    return;
  }
  var h = '<div class="segments"' + (n > 30 ? ' data-dense="oui"' : '') + '>';
  for (var i = 0; i < n; i++) { h += '<i></i>'; }
  zone.innerHTML = h + '</div>';
  this.majSegments();
};

Jeu.prototype.majSegments = function () {
  var n = this.s.total;
  if (n > 60) {
    var b = this.r.querySelector('.jauge i');
    if (b) { b.style.width = Math.round(this.s.pos * 100 / n) + '%'; }
    return;
  }
  var seg = this.r.querySelectorAll('.segments i');
  for (var i = 0; i < seg.length; i++) {
    var rep = this.s.reponses[i];
    if (rep && rep.juste === true) { seg[i].setAttribute('data-e', 'juste'); }
    else if (rep && rep.juste === false) { seg[i].setAttribute('data-e', 'rate'); }
    else if (i === this.s.reponses.length) { seg[i].setAttribute('data-e', 'encours'); }
    else { seg[i].removeAttribute('data-e'); }
  }
};

/* --- La serie (section 8) ---------------------------------------------- */
Jeu.prototype.majSerie = function (etat, anime) {
  var p = $('qcm-serie');
  if (!this.s.reglages.serie) { p.hidden = true; return; }
  p.hidden = false;
  p.querySelector('span').textContent = this.s.serie + " d'affilée";
  if (etat) { p.setAttribute('data-etat', etat); } else { p.removeAttribute('data-etat'); }
  if (anime) {
    p.setAttribute('data-anime', 'oui');
    window.setTimeout(function () { p.removeAttribute('data-anime'); }, 220);
  }
};

/* --- Poser la carte courante ------------------------------------------- */
Jeu.prototype.dessinerCarte = function () {
  var self = this;
  var q = this.s.courante();
  if (!q) { this.terminer(); return; }

  this.choix = null;
  this.verrou = false;

  $('qcm-compte').textContent = (this.s.reponses.length + 1) + ' / ' + this.s.total;
  this.majSerie(null, false);

  // La carte SUIVANTE est deja montee dans le DOM (section 7.7) : aucun
  // chargement, aucun scintillement entre deux questions.
  $('carte-arriere').innerHTML = '';

  var carte = $('carte');
  carte.style.transform = '';
  carte.style.opacity = '';
  carte.removeAttribute('data-anime');
  carte.removeAttribute('data-vise');
  carte.innerHTML = carteHTML(q, true);

  var boutons = carte.querySelectorAll('.reponse');
  for (var i = 0; i < boutons.length; i++) {
    boutons[i].addEventListener('click', function () {
      if (self.verrou) { return; }
      self.choisir(parseInt(this.getAttribute('data-i'), 10));
    });
  }

  if (this.geste) { this.geste.detruire(); }
  this.geste = G.poser(carte, {
    peutValider: function () { return self.choix !== null; },
    onValider: function () { self.valider(); },
    onPasser: function () { self.passer(); },
    onRefus: function () { self.dire('Choisis une réponse avant de valider.'); },
    onViser: function (v) { self.viser(v); }
  });

  this.majSegments();
};

Jeu.prototype.viser = function (v) {
  var g = $('cote-gauche'), d = $('cote-droite');
  if (!v) { g.removeAttribute('data-actif'); d.removeAttribute('data-actif'); return; }
  g.setAttribute('data-actif', v === 'gauche' ? 'oui' : 'non');
  d.setAttribute('data-actif', v === 'droite' ? 'oui' : 'non');
};

Jeu.prototype.choisir = function (i) {
  this.choix = i;
  var b = this.r.querySelectorAll('.reponse');
  for (var k = 0; k < b.length; k++) {
    b[k].setAttribute('aria-pressed', k === i ? 'true' : 'false');
  }
};

/* --- Valider, passer ---------------------------------------------------- */

Jeu.prototype.valider = function () {
  var q = this.s.courante();
  var juste = this.choix === q.bonne;
  this.s.reponses.push({ id: q.id, choix: this.choix, juste: juste, passee: false });

  if (juste) {
    this.s.serie += 1;
    if (this.s.serie > this.s.record) { this.s.record = this.s.serie; }
    G.vibrer(G.VIBRE_JUSTE);
  } else {
    this.s.serie = 0;
    // Une question ratee revient 8 cartes plus loin, dans CETTE session.
    this.s.remettre(q, M.RETOUR_RATE);
  }

  var d = M.charger();
  M.noter(d, q.id, juste);
  if (this.s.record > (d.recordSerie || 0)) { d.recordSerie = this.s.record; }
  M.ranger(d);

  this.s.pos += 1;
  this.majSegments();

  // Mode examen : aucun indice, tout le corrige a la fin (ecran 3).
  if (this.s.reglages.mode === 'examen') {
    this.majSerie(juste ? 'or' : 'gris', juste);
    this.dessinerCarte();
    return;
  }
  this.corriger(q, juste);
};

Jeu.prototype.passer = function () {
  var q = this.s.courante();
  // Passer n'est ni juste ni faux, et ne casse pas la serie (section 7.6).
  this.s.remettre(q, M.RETOUR_PASSE);
  this.s.pos += 1;
  this.dessinerCarte();
};

/* --- La feuille de correction (ecrans 6 et 7) --------------------------- */

Jeu.prototype.corriger = function (q, juste) {
  var self = this;
  this.verrou = true;
  this.majSerie(juste ? 'or' : 'gris', juste);

  // La grille est corrigee SUR PLACE (ecran 7).
  var b = this.r.querySelectorAll('.reponse');
  for (var k = 0; k < b.length; k++) {
    if (k === q.bonne) {
      b[k].setAttribute('data-corrige', 'bonne');
      if (!juste) { b[k].insertAdjacentHTML('beforeend', '<span class="etiquette" data-t="bonne">la bonne</span>'); }
    } else if (k === this.choix) {
      b[k].setAttribute('data-corrige', 'choix');
      b[k].insertAdjacentHTML('beforeend', '<span class="etiquette" data-t="choix">ton choix</span>');
    } else {
      b[k].setAttribute('data-corrige', 'autre');
    }
  }

  var f = $('feuille');
  var h = '';
  h += '<div class="rang" style="gap:10px">';
  h += juste ? icone('coche', 22, 'coche-or') : '';
  h += '<span class="f-titre">' + (juste ? 'Bonne réponse' : 'Pas tout à fait') + '</span>';
  h += '</div>';
  if (juste && this.s.reglages.serie && this.s.record > 0) {
    h += '<div class="f-note">Ta meilleure série est de ' + this.s.record + '.</div>';
  }
  h += '<div class="f-texte">' + echapper(q.explication) + '</div>';
  if (q.divergence) {
    // On affiche la phrase telle quelle. On n'arbitre pas (section 5).
    h += '<div class="f-divergence">Les savants divergent : ' + echapper(q.divergence) + '</div>';
  }
  h += '<div class="f-source">' + echapper(q.source) + '</div>';
  if (!juste) {
    // Cette phrase doit etre VRAIE : la question a bien ete remise dans le
    // paquet, huit cartes plus loin (section 9).
    h += '<div class="f-note">Cette question reviendra plus tard dans le QCM.</div>';
  }
  h += '<button type="button" class="bouton ' + (juste ? 'bouton-or' : 'bouton-vert')
    + '" id="f-suite">Continuer</button>';

  f.setAttribute('data-t', juste ? 'juste' : 'rate');
  f.innerHTML = h;
  f.setAttribute('data-ouverte', 'oui');
  this.dire(juste ? 'Bonne réponse. ' + q.explication : 'Réponse fausse. ' + q.explication);

  $('f-suite').addEventListener('click', function () { self.continuer(); });
  $('f-suite').focus();
};

Jeu.prototype.continuer = function () {
  var f = $('feuille');
  f.removeAttribute('data-ouverte');
  this.dessinerCarte();
};

/* --- Fin de partie ------------------------------------------------------ */

Jeu.prototype.terminer = function () {
  var d = M.charger();
  var joues = [];
  for (var i = 0; i < this.s.reponses.length; i++) { joues.push(this.s.reponses[i].id); }
  M.vieillirLesPriorites(d, joues);
  M.marquerLeJour(d, this.s.reponses.length);
  d.reprise = null;
  var id = 's' + Date.now();
  d.sessions.push({
    id: id,
    section: this.s.section,
    jour: M.jourDeAujourdhui(),
    total: this.s.reponses.length,
    justes: this.s.reponses.filter(function (r) { return r.juste; }).length,
    duree: Math.round((Date.now() - this.s.debut) / 1000),
    detail: this.s.reponses
  });
  M.ranger(d);
  window.location.href = 'resultat.html?s=' + id;
};

Jeu.prototype.sortir = function () {
  // Un QCM interrompu est repris a la question exacte (section 9).
  var d = M.charger();
  d.reprise = {
    section: this.s.section,
    ids: this.s.paquet.map(function (q) { return q.id; }),
    pos: this.s.pos,
    total: this.s.total,
    reponses: this.s.reponses,
    reglages: this.s.reglages,
    debut: this.s.debut
  };
  M.ranger(d);
  window.location.href = 'index.html';
};

/* --- Clavier et annonces (section 7.9) ---------------------------------- */

Jeu.prototype.dire = function (texte) {
  var z = $('qcm-annonce');
  if (z) { z.textContent = texte; }
};

Jeu.prototype.clavier = function () {
  var self = this;
  document.addEventListener('keydown', function (e) {
    if (self.verrou) {
      if (e.key === 'Enter') { e.preventDefault(); self.continuer(); }
      return;
    }
    if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      self.choisir(parseInt(e.key, 10) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      self.geste.valider();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      self.geste.passer();
    }
  });
};

window.IPAP_QCM = { Session: Session, Jeu: Jeu, melanger: melanger, carteHTML: carteHTML };
