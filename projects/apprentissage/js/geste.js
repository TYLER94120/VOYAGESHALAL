/* ==========================================================================
   LE GESTE — le coeur du produit
   --------------------------------------------------------------------------
   IL EST VERTICAL. Demande de Mohamed le 21 aout, apres avoir tenu le site
   en main : « j'aimerais qu'il soit de haut en bas, beaucoup plus intuitif ».

   Il a raison, et pas seulement par habitude. Le geste horizontal demande de
   retenir une convention arbitraire — pourquoi la droite plutot que la
   gauche ? Le geste vertical n'en demande aucune : on POUSSE la carte finie
   vers le haut, et la suivante monte. C'est le meme geste que tourner une
   page, et tout le monde le fait sans y penser.

   Le cahier des charges decrivait un geste horizontal (section 7). Les
   VALEURS y restent justes et sont conservees telles quelles — seuls les axes
   changent :

     inclinaison   delta / 18, plafonnee a 8 degres
     indice        au-dela de 60 px
     validation    100 px, OU une vitesse de plus de 0,4 px/ms
     envol         220 ms, cubic-bezier(.22,.61,.36,1)
     retour        180 ms
     secousse      6 px, 150 ms
     vibration     10 ms au seuil, 25 ms sur une bonne reponse

   HAUT = je valide ma reponse. BAS = je passe.
   ========================================================================== */

'use strict';

var SEUIL_INDICE = 60;      // px : a partir d'ou le tampon apparait
var SEUIL_VALIDE = 100;     // px : a partir d'ou la carte part
var VITESSE_VALIDE = 0.4;   // px/ms : un geste rapide suffit, meme court
var INCLINAISON_DIV = 18;   // delta / 18 degres
var INCLINAISON_MAX = 8;    // plafond, en degres
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
   options.onValider()    -> appelee quand la carte part vers le HAUT
   options.onPasser()     -> appelee quand la carte part vers le BAS
   options.onRefus()      -> appelee quand on tente de valider sans reponse
   options.onViser(sens)  -> 'haut', 'bas' ou null, pendant le geste
   -------------------------------------------------------------------------- */
function poserGeste(carte, options) {
  var enCours = false, departX = 0, departY = 0, dy = 0, t0 = 0, parti = false;
  var pointeur = null;
  var pris = false;      // le glissement a-t-il pris la main ?
  var aGlisse = false;   // vient-on de glisser ? (pour annuler le clic qui suit)

  function dessiner(y) {
    if (moinsDAnimation()) { return; }   // ni inclinaison ni deplacement
    // Une legere inclinaison donne du poids a la carte. Elle vient du
    // deplacement vertical, comme la rotation venait du deplacement
    // horizontal : le geste garde sa matiere.
    var deg = Math.max(-INCLINAISON_MAX, Math.min(INCLINAISON_MAX, y / INCLINAISON_DIV));
    carte.style.transform = 'translateY(' + y + 'px) rotate(' + (deg * 0.35) + 'deg)';
  }

  function viser(y) {
    var avant = carte.getAttribute('data-vise');
    var vise = null;
    if (y < -SEUIL_INDICE) { vise = 'haut'; }
    else if (y > SEUIL_INDICE) { vise = 'bas'; }

    if (vise) { carte.setAttribute('data-vise', vise); }
    else { carte.removeAttribute('data-vise'); }

    // Vibration au FRANCHISSEMENT du seuil, pas pendant tout le glissement.
    if (vise && vise !== avant) { vibrer(VIBRE_SEUIL); }

    var bas = carte.querySelector('.tampon[data-t="passer"]');
    var haut = carte.querySelector('.tampon[data-t="valider"]');
    if (bas) { bas.style.opacity = vise === 'bas' ? '1' : '0'; }
    if (haut) { haut.style.opacity = vise === 'haut' ? '1' : '0'; }

    if (options.onViser) { options.onViser(vise); }
  }

  function relacher() {
    carte.removeAttribute('data-vise');
    var t = carte.querySelectorAll('.tampon');
    for (var i = 0; i < t.length; i++) { t[i].style.opacity = '0'; }
    if (options.onViser) { options.onViser(null); }
  }

  function revenir() {
    carte.setAttribute('data-anime', 'retour');
    carte.style.transform = '';
    relacher();
    window.setTimeout(function () { carte.removeAttribute('data-anime'); }, 180);
  }

  function refuser() {
    // Vers le haut sans reponse choisie : la carte ne part pas.
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
      var loin = vers === 'haut' ? -(window.innerHeight + 200) : (window.innerHeight + 200);
      carte.style.transform = 'translateY(' + loin + 'px)';
    }
    carte.style.opacity = '0';
    window.setTimeout(function () {
      if (vers === 'haut') { options.onValider(); } else { options.onPasser(); }
    }, moinsDAnimation() ? 120 : 220);
  }

  /* --- Les pointeurs : doigt, souris, stylet, tous par la meme porte ------
     ON ATTRAPE LA CARTE N'IMPORTE OU, Y COMPRIS SUR UNE REPONSE.

     La premiere version refusait de demarrer depuis un bouton, pour qu'on
     puisse toucher une reponse sans lancer la carte. En grille 2x2 ca
     passait ; en colonne, les quatre reponses occupent le milieu de la carte
     et j'ai mesure le resultat : le CENTRE de la carte est un bouton, et il
     ne reste que des interstices de huit pixels pour l'attraper. Autant dire
     qu'on ne l'attrape pas.

     La regle est donc renversee : le glissement peut naitre partout, et c'est
     la DISTANCE qui tranche. Sous huit pixels, c'est un appui — le bouton
     recoit son clic normalement. Au-dela, le geste prend la main et le clic
     qui suivra sera annule. C'est ainsi que se comporte toute liste
     defilante : on n'y reflechit pas, et c'est bien le but.
     ---------------------------------------------------------------------- */

  var PRISE = 8;   // px : en deca, c'est un appui, pas un glissement
  var dernierY = 0;

  /* LE TEXTE PASSE AVANT LE GESTE.
     Certains versets sont longs, et quatre traductions de cent trente
     caracteres ne tiennent pas sur un ecran de 360 px, quelle que soit la
     taille de police : mesure faite, six cents cartes sur mille deux cent
     cinquante debordent a cette largeur. Une reponse qu'on ne peut pas lire
     est une reponse qu'on ne peut pas choisir.

     Alors le glissement DEFILE d'abord, et ne lance la carte qu'une fois le
     bout atteint. C'est le comportement de toute liste imbriquee : on lit
     jusqu'en bas, et le geste suivant emporte la carte. Sur les cartes qui
     tiennent — la grande majorite — rien de tout ceci ne se declenche. */
  function dedans() { return carte.querySelector('.carte-dedans'); }

  function peutDefiler(sens) {
    var d = dedans();
    if (!d) { return false; }
    var reste = d.scrollHeight - d.clientHeight;
    if (reste <= 1) { return false; }
    // sens > 0 : le doigt descend, le contenu redescend -> il faut du
    // contenu cache au-dessus.
    return sens > 0 ? d.scrollTop > 0.5 : d.scrollTop < reste - 0.5;
  }

  function debut(e) {
    if (parti) { return; }
    enCours = true;
    pris = false;
    pointeur = e.pointerId;
    departX = e.clientX;
    departY = e.clientY;
    dernierY = e.clientY;
    dy = 0;
    t0 = e.timeStamp;
    carte.removeAttribute('data-anime');
  }

  function bouge(e) {
    if (!enCours || e.pointerId !== pointeur) { return; }
    var y = e.clientY - departY;
    var dx = e.clientX - departX;

    if (!pris) {
      if (Math.abs(y) < PRISE) { dernierY = e.clientY; return; }   // toujours un appui
      // Un geste nettement horizontal n'est pas le notre : on rend la main
      // plutot que de faire bouger la carte de travers.
      if (Math.abs(dx) > Math.abs(y) * 1.6) { enCours = false; return; }

      if (peutDefiler(y)) {
        // `touch-action: none` interdit au navigateur de defiler tout seul :
        // on le fait a la main, au pixel pres.
        dedans().scrollTop -= (e.clientY - dernierY);
        dernierY = e.clientY;
        departY = e.clientY;   // le seuil de prise repart d'ici
        aGlisse = true;        // ... et ce n'etait pas un appui sur une reponse
        return;
      }

      pris = true;
      // On repart d'ici : sans ca, la carte sauterait de huit pixels au
      // moment ou elle prend la main.
      departY = e.clientY;
      t0 = e.timeStamp;
      y = 0;
      try { carte.setPointerCapture(e.pointerId); } catch (err) { /* sans capture, ca marche quand meme */ }
    }

    dernierY = e.clientY;
    dy = y;
    dessiner(dy);
    viser(dy);
  }

  function fin(e) {
    if (!enCours || (e.pointerId !== undefined && e.pointerId !== pointeur)) { return; }
    enCours = false;
    if (!pris) { return; }   // c'etait un appui : on laisse le clic passer
    pris = false;
    aGlisse = true;          // ... et on annule le clic qui suit un glissement

    var duree = Math.max(1, e.timeStamp - t0);
    var vitesse = Math.abs(dy) / duree;
    var assez = Math.abs(dy) >= SEUIL_VALIDE || vitesse > VITESSE_VALIDE;

    // Un geste rapide mais minuscule n'est pas une intention : sous le seuil
    // de l'indice, on considere que la personne n'a pas voulu lancer la carte.
    if (assez && Math.abs(dy) >= SEUIL_INDICE) {
      if (dy < 0) {
        if (options.peutValider()) { envoler('haut'); } else { refuser(); }
      } else {
        envoler('bas');
      }
    } else {
      revenir();
    }
    dy = 0;
  }

  /* Le clic qui suit un glissement ne doit pas choisir la reponse survolee.
     En phase de CAPTURE, donc avant que le bouton ne l'entende. */
  function filtrerClic(e) {
    if (!aGlisse) { return; }
    aGlisse = false;
    e.stopPropagation();
    e.preventDefault();
  }

  carte.addEventListener('pointerdown', debut);
  carte.addEventListener('pointermove', bouge);
  carte.addEventListener('pointerup', fin);
  carte.addEventListener('click', filtrerClic, true);
  carte.addEventListener('pointercancel', function (e) {
    if (!enCours) { return; }
    enCours = false;
    if (pris) { pris = false; aGlisse = true; revenir(); }
    dy = 0;
  });

  /* --- Clavier et boutons ------------------------------------------------ */
  return {
    valider: function () {
      if (options.peutValider()) { envoler('haut'); } else { refuser(); }
    },
    passer: function () { envoler('bas'); },
    detruire: function () {
      carte.removeEventListener('pointerdown', debut);
      carte.removeEventListener('pointermove', bouge);
      carte.removeEventListener('pointerup', fin);
      carte.removeEventListener('click', filtrerClic, true);
    }
  };
}

window.IPAP_GESTE = { poser: poserGeste, vibrer: vibrer, VIBRE_JUSTE: VIBRE_JUSTE };
