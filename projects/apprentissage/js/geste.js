/* ==========================================================================
   LE GESTE — section 7 du cahier des charges
   --------------------------------------------------------------------------
   C'est le coeur du produit. Chaque valeur ci-dessous vient du cahier des
   charges et n'est pas a « ajuster au feeling » :

     rotation      deltaX / 18, plafonnee a 8 degres
     indice        au-dela de 60 px
     validation    100 px, OU une vitesse de plus de 0,4 px/ms
     envol         220 ms, cubic-bezier(.22,.61,.36,1)
     retour        180 ms
     secousse      6 px, 150 ms
     vibration     10 ms au seuil, 25 ms sur une bonne reponse

   Droite = je valide ma reponse. Gauche = je passe.
   ========================================================================== */

'use strict';

var SEUIL_INDICE = 60;      // px : a partir d'ou le tampon apparait
var SEUIL_VALIDE = 100;     // px : a partir d'ou la carte part
var VITESSE_VALIDE = 0.4;   // px/ms : un geste rapide suffit, meme court
var ROTATION_DIV = 18;      // deltaX / 18 degres
var ROTATION_MAX = 8;       // plafond, en degres
var VIBRE_SEUIL = 10;       // ms
var VIBRE_JUSTE = 25;       // ms

/* La vibration ne doit JAMAIS faire planter la page : l'API n'existe pas
   partout, et sur iOS elle est absente. On l'appelle donc toujours ainsi. */
function vibrer(ms) {
  try {
    if (navigator && typeof navigator.vibrate === 'function') { navigator.vibrate(ms); }
  } catch (e) { /* silencieux : une vibration ratee n'est pas une erreur */ }
}

function moinsDAnimation() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { return false; }
}

/* --------------------------------------------------------------------------
   Attache le geste a une carte.

   options.peutValider()  -> vrai si une reponse est choisie
   options.onValider()    -> appelee quand la carte part a droite
   options.onPasser()     -> appelee quand la carte part a gauche
   options.onRefus()      -> appelee quand on tente de valider sans reponse
   -------------------------------------------------------------------------- */
function poserGeste(carte, options) {
  var enCours = false, depart = 0, departY = 0, dx = 0, t0 = 0, parti = false;
  var pointeur = null;

  function dessiner(x) {
    if (moinsDAnimation()) { return; }   // ni rotation ni deplacement
    var deg = Math.max(-ROTATION_MAX, Math.min(ROTATION_MAX, x / ROTATION_DIV));
    carte.style.transform = 'translateX(' + x + 'px) rotate(' + deg + 'deg)';
  }

  function viser(x) {
    var avant = carte.getAttribute('data-vise');
    var vise = null;
    if (x > SEUIL_INDICE) { vise = 'droite'; }
    else if (x < -SEUIL_INDICE) { vise = 'gauche'; }

    if (vise) { carte.setAttribute('data-vise', vise); }
    else { carte.removeAttribute('data-vise'); }

    // Vibration au FRANCHISSEMENT du seuil, pas pendant tout le glissement.
    if (vise && vise !== avant) { vibrer(VIBRE_SEUIL); }

    var g = carte.querySelector('.tampon[data-t="passer"]');
    var d = carte.querySelector('.tampon[data-t="valider"]');
    if (g) { g.style.opacity = vise === 'gauche' ? '1' : '0'; }
    if (d) { d.style.opacity = vise === 'droite' ? '1' : '0'; }

    if (options.onViser) { options.onViser(vise); }
  }

  function relacher() {
    carte.removeAttribute('data-vise');
    var g = carte.querySelector('.tampon[data-t="passer"]');
    var d = carte.querySelector('.tampon[data-t="valider"]');
    if (g) { g.style.opacity = '0'; }
    if (d) { d.style.opacity = '0'; }
    if (options.onViser) { options.onViser(null); }
  }

  function revenir() {
    carte.setAttribute('data-anime', 'retour');
    carte.style.transform = '';
    relacher();
    window.setTimeout(function () { carte.removeAttribute('data-anime'); }, 180);
  }

  function refuser() {
    // Droite sans reponse choisie : la carte ne part pas (section 7.5).
    carte.style.transform = '';
    relacher();
    carte.setAttribute('data-anime', 'secousse');
    window.setTimeout(function () { carte.removeAttribute('data-anime'); }, 150);
    if (options.onRefus) { options.onRefus(); }
  }

  function envoler(vers) {
    if (parti) { return; }
    parti = true;
    relacher();
    carte.setAttribute('data-anime', 'envol');
    if (!moinsDAnimation()) {
      var loin = vers === 'droite' ? window.innerWidth + 200 : -(window.innerWidth + 200);
      carte.style.transform = 'translateX(' + loin + 'px) rotate('
        + (vers === 'droite' ? ROTATION_MAX : -ROTATION_MAX) + 'deg)';
    }
    carte.style.opacity = '0';
    window.setTimeout(function () {
      if (vers === 'droite') { options.onValider(); } else { options.onPasser(); }
    }, moinsDAnimation() ? 120 : 220);
  }

  /* --- Les pointeurs : doigt, souris, stylet, tous par la meme porte ------ */

  function debut(e) {
    if (parti) { return; }
    // On ne demarre pas un glissement depuis un bouton de reponse : on doit
    // pouvoir toucher une reponse pour la choisir sans lancer la carte.
    if (e.target.closest && e.target.closest('button')) { return; }
    enCours = true;
    pointeur = e.pointerId;
    depart = e.clientX;
    departY = e.clientY;
    dx = 0;
    t0 = e.timeStamp;
    carte.removeAttribute('data-anime');
    try { carte.setPointerCapture(e.pointerId); } catch (err) { /* sans capture, ca marche quand meme */ }
  }

  function bouge(e) {
    if (!enCours || e.pointerId !== pointeur) { return; }
    dx = e.clientX - depart;
    var dy = e.clientY - departY;
    // Un geste nettement vertical, c'est un defilement : on rend la main.
    if (Math.abs(dy) > Math.abs(dx) * 1.6 && Math.abs(dx) < SEUIL_INDICE) { return; }
    dessiner(dx);
    viser(dx);
  }

  function fin(e) {
    if (!enCours || (e.pointerId !== undefined && e.pointerId !== pointeur)) { return; }
    enCours = false;
    var duree = Math.max(1, e.timeStamp - t0);
    var vitesse = Math.abs(dx) / duree;
    var assez = Math.abs(dx) >= SEUIL_VALIDE || vitesse > VITESSE_VALIDE;

    // Un geste rapide mais minuscule n'est pas une intention : sous le seuil
    // de l'indice, on considere que la personne n'a pas voulu lancer la carte.
    if (assez && Math.abs(dx) >= SEUIL_INDICE) {
      if (dx > 0) {
        if (options.peutValider()) { envoler('droite'); } else { refuser(); }
      } else {
        envoler('gauche');
      }
    } else {
      revenir();
    }
    dx = 0;
  }

  carte.addEventListener('pointerdown', debut);
  carte.addEventListener('pointermove', bouge);
  carte.addEventListener('pointerup', fin);
  carte.addEventListener('pointercancel', function (e) {
    if (!enCours) { return; }
    enCours = false; dx = 0; revenir();
  });

  /* --- Clavier (section 7.9) --------------------------------------------- */
  return {
    valider: function () {
      if (options.peutValider()) { envoler('droite'); } else { refuser(); }
    },
    passer: function () { envoler('gauche'); },
    detruire: function () {
      carte.removeEventListener('pointerdown', debut);
      carte.removeEventListener('pointermove', bouge);
      carte.removeEventListener('pointerup', fin);
    }
  };
}

window.IPAP_GESTE = { poser: poserGeste, vibrer: vibrer, VIBRE_JUSTE: VIBRE_JUSTE };
