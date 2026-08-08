/* =========================================================
   Les sons d'interface

   Six sons, fabriques de zero par synthese (dossier sons/). Aucune licence,
   aucun ayant droit, rien a demander a personne.

   Le parti pris : des TIMBRES, pas de la musique. Chaque son est une cloche
   courte. Sur un site religieux, la question des instruments divise ; une
   cloche d'interface de trois dixiemes de seconde n'ouvre pas ce debat. Et
   l'interrupteur est visible, pas cache dans un menu.

   La regle qui compte le plus : le son d'erreur ne punit jamais. Pas de
   buzzer, pas de dissonance — un ton grave et chaud. Quelqu'un qui apprend sa
   religion ne doit pas se sentir juge par une interface. C'est ce son-la qui
   decide si la personne recommence ou ferme l'onglet.

   Emploi : ippSons.jouer('bon') · ippSons.jouer('serie') · etc.
   ========================================================= */

var ippSons = (function () {
  'use strict';

  var CLE = 'ipp.sons';
  var NOMS = ['bon', 'presque', 'tap', 'serie', 'fin', 'objectif'];
  var cache = {};
  var prets = false;

  function actif() {
    try {
      return window.localStorage.getItem(CLE) !== 'non';   // actif par defaut
    } catch (e) {
      return true;
    }
  }

  function basculer() {
    var nouveau = actif() ? 'non' : 'oui';
    try { window.localStorage.setItem(CLE, nouveau); } catch (e) { /* sans memoire, on continue */ }
    if (nouveau === 'oui') { preparer(); jouer('tap'); }
    return nouveau === 'oui';
  }

  /* Les navigateurs mobiles refusent de charger un son avant le premier
     geste de l'utilisateur. On prepare donc les fichiers au premier contact
     avec la page, pas au chargement : sans cela le tout premier « bon »
     arriverait avec un temps de retard, et un retour en retard ne recompense
     plus rien. */
  /* Ou trouver les fichiers. Par defaut le dossier sons/ a cote des pages.
     Une page peut fournir sa propre fonction : c'est ce qui permet a l'apercu
     en un seul fichier d'embarquer les sons au lieu de pointer un dossier
     qu'il n'a pas. */
  function adresse(nom) {
    if (typeof window !== 'undefined' && typeof window.IPP_SONS_URL === 'function') {
      return window.IPP_SONS_URL(nom);
    }
    return 'sons/' + nom + '.mp3';
  }

  function preparer() {
    if (prets) { return; }
    prets = true;
    for (var i = 0; i < NOMS.length; i++) {
      var a = new Audio(adresse(NOMS[i]));
      a.preload = 'auto';
      a.volume = 0.55;
      cache[NOMS[i]] = a;
    }
  }

  function jouer(nom) {
    if (!actif() || !cache[nom]) { return; }
    try {
      // On clone : deux bonnes reponses rapprochees doivent pouvoir se
      // superposer, sinon la seconde coupe la premiere et le retour sonne faux.
      var a = cache[nom].cloneNode();
      a.volume = nom === 'tap' ? 0.30 : 0.55;
      a.play().catch(function () { /* refus du navigateur : on n'insiste pas */ });
    } catch (e) { /* pas de son : la lecon continue exactement pareil */ }
  }

  /** Pose l'interrupteur son sur un element [data-r="son-bascule"]. */
  function brancherInterrupteur(racine) {
    var r = racine || document;
    var b = r.querySelector('[data-r="son-bascule"]');
    if (!b) { return; }

    function peindre() {
      var on = actif();
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.innerHTML = (on ? '<span aria-hidden="true">&#128266;</span> Son actif'
                        : '<span aria-hidden="true">&#128263;</span> Son coupe');
    }

    b.addEventListener('click', function () { basculer(); peindre(); });
    peindre();
  }

  // Le premier geste, quel qu'il soit, debloque le son.
  if (typeof document !== 'undefined') {
    ['pointerdown', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, preparer, { once: true });
    });
  }

  return {
    jouer: jouer,
    actif: actif,
    basculer: basculer,
    preparer: preparer,
    brancherInterrupteur: brancherInterrupteur
  };
}());

if (typeof module !== 'undefined' && module.exports) { module.exports = ippSons; }
