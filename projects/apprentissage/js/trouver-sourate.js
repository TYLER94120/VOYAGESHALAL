/* ==========================================================================
   TROUVER UNE SOURATE DANS LA LISTE DES 114
   --------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE — une mesure, pas une intuition.

   `sourates.html` est la page la plus vue du site : sept impressions sur les
   douze du releve. Mesuree dans un navigateur a 360 px de large, elle fait
   6 973 px de haut — ONZE ECRANS a faire defiler — et n'offrait aucun moyen
   de chercher. An-Nas, la 114e, l'une des sourates les plus recitees,
   commencait a 6 588 px du haut. Quelqu'un qui arrive de Google en cherchant
   une sourate precise devait la trouver a l'oeil dans une colonne de 114
   rangs de 49 px.

   Ce fichier ne change rien a ce que la page DIT. Il ne masque aucune
   information par defaut, n'en ajoute aucune, et ne touche ni aux noms, ni
   aux numeros, ni aux nombres de versets — qui restent comptes dans le
   corpus et recomptes par `controler-lecons.py`. Il ne fait qu'une chose :
   filtrer des rangs deja ecrits dans le HTML.

   LE CHAMP EST CREE ICI, PAS DANS LE HTML, et c'est la seule facon correcte.
   Ecrit dans la page, il resterait affiche sans JavaScript : un champ de
   recherche qui ne cherche pas est pire que pas de champ du tout. Absent du
   HTML, la page sans JavaScript reste exactement celle d'aujourd'hui — les
   114 rangs, tous visibles, tous lisibles, tous indexables. Google, lui,
   voit la liste entiere dans les deux cas.

   CE QU'ON COMPARE
   ----------------
   Le numero, le nom arabe et le nom en francais, tous trois deja presents
   dans le rang. Les accents, les traits d'union et les apostrophes sont
   retires des deux cotes : « al-qari'a », « Al Qaria » et « qaria » doivent
   mener au meme rang, parce que personne ne tape un nom translittere comme
   il est ecrit. Le numero se compare par son DEBUT et non par inclusion :
   sinon « 1 » sortirait cent sourates et ne serait plus un filtre.
   ========================================================================== */

'use strict';

(function () {
  var liste = document.querySelector('.srows');
  if (!liste) { return; }

  var rangs = [].slice.call(liste.children);
  if (!rangs.length) { return; }

  // « Al-Qari'a » -> « alqaria ». Meme traitement des deux cotes, sans quoi
  // la comparaison depend de la facon dont l'utilisateur tape les accents.
  function nu(s) {
    return String(s || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, '');
  }

  // On lit une fois ce qu'il y a dans chaque rang, au lieu de relire le DOM
  // a chaque frappe : 114 rangs x une frappe, c'est deja trop.
  var index = rangs.map(function (li) {
    var lire = function (sel) {
      var e = li.querySelector(sel);
      return e ? e.textContent : '';
    };
    return {
      li: li,
      num: lire('.s-num').replace(/\D/g, ''),
      texte: nu(lire('.s-tr')) + ' ' + nu(lire('.s-ar'))
    };
  });

  function correspond(e, q) {
    // Le numero par son debut, le nom par inclusion. Voir l'en-tete.
    return (q.chiffres && e.num.indexOf(q.chiffres) === 0)
      || (q.mots && e.texte.indexOf(q.mots) >= 0);
  }

  // ----------------------------------------------------------------- le champ

  var bloc = document.createElement('div');
  bloc.className = 'strouve';

  var etiquette = document.createElement('label');
  etiquette.className = 'strouve-etiq';
  etiquette.setAttribute('for', 'chercher-sourate');
  etiquette.textContent = 'Trouver une sourate';

  var champ = document.createElement('input');
  champ.type = 'search';
  champ.id = 'chercher-sourate';
  champ.className = 'strouve-champ';
  champ.setAttribute('placeholder', 'Son nom ou son numéro…');
  champ.setAttribute('autocomplete', 'off');
  champ.setAttribute('autocorrect', 'off');
  champ.setAttribute('spellcheck', 'false');
  champ.setAttribute('enterkeyhint', 'search');

  // Le compte se dit a voix haute pour les lecteurs d'ecran : sans lui, le
  // filtre est une modification silencieuse d'une liste de 114 elements.
  var compte = document.createElement('p');
  compte.className = 'strouve-compte';
  compte.setAttribute('role', 'status');
  compte.setAttribute('aria-live', 'polite');

  bloc.appendChild(etiquette);
  bloc.appendChild(champ);
  bloc.appendChild(compte);
  liste.parentNode.insertBefore(bloc, liste);

  // Le message de liste vide. Il propose une sortie : un filtre qui ne rend
  // rien et ne dit pas quoi faire laisse l'utilisateur devant une page vide.
  var vide = document.createElement('p');
  vide.className = 'strouve-vide';
  vide.hidden = true;
  liste.parentNode.insertBefore(vide, liste.nextSibling);

  function filtrer() {
    var brut = champ.value.trim();
    var q = { mots: nu(brut), chiffres: brut.replace(/\D/g, '') };
    var n = 0;

    // Champ vide : on rend la page telle qu'elle arrive de Google, les 114
    // rangs visibles, et on se tait — annoncer « 114 sur 114 » a chaque
    // effacement ferait parler le lecteur d'ecran pour ne rien dire.
    if (!q.mots && !q.chiffres) {
      index.forEach(function (e) { e.li.hidden = false; });
      compte.textContent = '';
      vide.hidden = true;
      return;
    }

    index.forEach(function (e) {
      var ok = correspond(e, q);
      e.li.hidden = !ok;
      if (ok) { n++; }
    });

    if (n === 0) {
      compte.textContent = '';
      vide.textContent = 'Aucune sourate ne correspond à « ' + brut + ' ». '
        + 'Essayez son numéro, de 1 à 114.';
      vide.hidden = false;
    } else {
      compte.textContent = n === 1 ? '1 sourate sur 114'
        : n + ' sourates sur 114';
      vide.hidden = true;
    }
  }

  champ.addEventListener('input', filtrer);
  champ.addEventListener('search', filtrer);   // la croix native du type=search
  champ.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && champ.value) {
      ev.preventDefault();
      champ.value = '';
      filtrer();
    }
  });
}());
