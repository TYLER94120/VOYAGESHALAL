/* =========================================================
   La recitation : entendre avant de repeter

   Ce fichier leve le blocage qui arretait le site. Il faut dire d'ou venait
   l'erreur, parce qu'elle etait dans le raisonnement, pas dans le code.

   L'atelier ou travaillent les agents a une sortie reseau filtree : toutes
   les adresses de recitation y repondent 403. On en a conclu que la
   recitation etait impossible. C'est faux. Le site ne telecharge rien : c'est
   le NAVIGATEUR DU VISITEUR qui va chercher le fichier, et ce navigateur-la
   n'a aucun filtre. Ce qui est injoignable depuis l'atelier est parfaitement
   joignable depuis un telephone. Le blocage n'a jamais concerne le produit.

   Les regles qui, elles, restent entieres :
     · on n'heberge AUCUN fichier. On pointe vers la source, c'est tout.
     · le recitateur et la source sont nommes sur la page, en clair.
     · JAMAIS de voix de synthese sur le Coran. Ce sont de vrais recitateurs,
       ou rien du tout. Cette regle-la ne se discute pas.
     · si aucune source ne repond, aucun bouton n'apparait. Le site ne promet
       jamais un son qu'il ne peut pas rendre.

   Emploi dans une lecon :
     <span data-coran="1:1">…</span>          un verset
     <span data-coran="1:1-7">…</span>        une suite de versets
   Le bouton « Ecouter » se pose tout seul.
   ========================================================= */

var ippCoran = (function () {
  'use strict';

  var CLE_SOURCE = 'ipp.audio.source';
  var CLE_LENTEUR = 'ipp.audio.lent';

  /* Les sources, par ordre de preference. La premiere qui repond gagne, et on
     retient laquelle : les visites suivantes demarrent sans re-tester.
     `nom` est affiche au visiteur — une source anonyme serait malhonnete. */
  var SOURCES = [
    {
      cle: 'islamic-network',
      nom: 'Islamic Network',
      recitateur: 'Mishary Rashid Alafasy',
      lent: false,
      url: function (s, v) {
        return 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/' + globalVerset(s, v) + '.mp3';
      }
    },
    {
      cle: 'everyayah',
      nom: 'EveryAyah',
      recitateur: 'Mishary Rashid Alafasy',
      lent: false,
      url: function (s, v) {
        return 'https://everyayah.com/data/Alafasy_128kbps/' + pad(s, 3) + pad(v, 3) + '.mp3';
      }
    },
    {
      cle: 'quran-com',
      nom: 'Quran.com',
      recitateur: 'Mishary Rashid Alafasy',
      lent: false,
      url: function (s, v) {
        return 'https://verses.quran.com/Alafasy/mp3/' + pad(s, 3) + pad(v, 3) + '.mp3';
      }
    },
    {
      cle: 'everyayah-husary',
      nom: 'EveryAyah',
      recitateur: 'Mahmoud Khalil Al-Husary',
      lent: true,          // la voix des ecoles : lente, articulee, faite pour apprendre
      url: function (s, v) {
        return 'https://everyayah.com/data/Husary_128kbps_Mujawwad/' + pad(s, 3) + pad(v, 3) + '.mp3';
      }
    }
  ];

  /* Le nombre de versets de chaque sourate : il faut la table pour convertir
     « sourate 2, verset 5 » en numero global, que certaines sources utilisent. */
  var VERSETS = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
    11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
  ];

  function pad(n, taille) {
    var s = String(n);
    while (s.length < taille) { s = '0' + s; }
    return s;
  }

  /** « sourate 2, verset 5 » → son rang parmi les 6236 versets du Coran. */
  function globalVerset(sourate, verset) {
    var n = 0;
    for (var i = 0; i < sourate - 1; i++) { n += VERSETS[i]; }
    return n + verset;
  }

  function lireMemoire(cle) {
    try { return window.localStorage.getItem(cle); } catch (e) { return null; }
  }

  function ecrireMemoire(cle, valeur) {
    try { window.localStorage.setItem(cle, valeur); } catch (e) { /* sans memoire, on continue */ }
  }

  function veutLent() {
    return lireMemoire(CLE_LENTEUR) === 'oui';
  }

  /** Teste une source en essayant de charger un fichier reel.
      On n'utilise pas fetch : ces hebergeurs n'envoient pas d'en-tete CORS, et
      un fetch echouerait meme quand le fichier est parfaitement lisible. Un
      element <audio> n'est pas soumis a cette regle pour la lecture. */
  function tester(source) {
    return new Promise(function (resolve) {
      var audio = new Audio();
      var fini = false;
      var depart = null;
      try { depart = performance.now(); } catch (e) { depart = null; }
      audio.preload = 'metadata';

      function conclure(ok, pourquoi) {
        if (fini) { return; }
        fini = true;
        var ms = null;
        try { if (depart !== null) { ms = Math.round(performance.now() - depart); } }
        catch (e) { ms = null; }
        journal.push({
          nom: source.nom,
          recitateur: source.recitateur,
          lent: source.lent,
          repond: ok,
          ms: ms,
          motif: pourquoi || (ok ? 'repond' : 'pas de reponse')
        });
        audio.src = '';
        resolve(ok ? source : null);
      }

      audio.addEventListener('loadedmetadata', function () { conclure(true, 'metadonnees lues'); });
      audio.addEventListener('canplay', function () { conclure(true, 'lecture possible'); });
      audio.addEventListener('error', function () { conclure(false, 'erreur de chargement'); });
      setTimeout(function () { conclure(false, 'delai depasse (9 s)'); }, 9000);

      audio.src = source.url(1, 1);   // Al-Fatiha, premier verset : present partout
      audio.load();
    });
  }

  var promesseSource = null;

  /* Le journal du sondage. Il existe pour une raison precise : l'atelier des
     agents ne peut joindre AUCUN hebergeur de recitation, donc personne ne peut
     verifier d'ici quelle source repond ni en combien de temps. Avec
     « ?son=diag » dans l'adresse, la page le raconte elle-meme, et un telephone
     avec du vrai reseau devient l'instrument de mesure. */
  var journal = [];

  function modeDiagnostic() {
    try {
      return /[?&]son=diag\b/.test(window.location.search);
    } catch (e) {
      return false;
    }
  }

  /** Renvoie la source utilisable, ou null. Testee une seule fois par visite. */
  function choisirSource() {
    if (promesseSource) { return promesseSource; }

    var candidates = SOURCES.filter(function (s) { return s.lent === veutLent(); });
    if (!candidates.length) { candidates = SOURCES; }
    // Le mode diagnostic ne change RIEN au sondage : il ne fait que raconter ce
    // qui s'est passe. Une mesure qui modifie ce qu'elle mesure ne sert a rien.

    // Une source deja validee lors d'une visite precedente passe en tete.
    var retenue = lireMemoire(CLE_SOURCE);
    if (retenue) {
      candidates.sort(function (a, b) {
        return (b.cle === retenue ? 1 : 0) - (a.cle === retenue ? 1 : 0);
      });
    }

    promesseSource = (function suivante(i) {
      if (i >= candidates.length) { return Promise.resolve(null); }
      return tester(candidates[i]).then(function (ok) {
        if (ok) {
          ecrireMemoire(CLE_SOURCE, ok.cle);
          return ok;
        }
        return suivante(i + 1);
      });
    }(0));

    return promesseSource;
  }

  /** « 1:1 » ou « 1:1-7 » → { sourate: 1, debut: 1, fin: 7 } */
  function lireReference(texte) {
    var m = /^(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$/.exec(String(texte).trim());
    if (!m) { return null; }
    var sourate = parseInt(m[1], 10);
    var debut = parseInt(m[2], 10);
    var fin = m[3] ? parseInt(m[3], 10) : debut;
    if (sourate < 1 || sourate > 114 || debut < 1 || fin < debut) { return null; }
    if (fin > VERSETS[sourate - 1]) { return null; }
    return { sourate: sourate, debut: debut, fin: fin };
  }

  var enCours = null;

  /** Joue un verset, ou une suite de versets a la file. */
  function jouer(source, ref, surChangement, surFin) {
    arreter();
    var v = ref.debut;

    function suivant() {
      if (v > ref.fin) { arreter(); if (surFin) { surFin(); } return; }
      var audio = new Audio(source.url(ref.sourate, v));
      enCours = audio;
      if (surChangement) { surChangement(v); }
      audio.addEventListener('ended', function () { v++; suivant(); });
      audio.addEventListener('error', function () { arreter(); if (surFin) { surFin(); } });
      audio.play().catch(function () { arreter(); if (surFin) { surFin(); } });
    }

    suivant();
  }

  var minuterie = null;

  function arreter() {
    if (minuterie) { clearTimeout(minuterie); minuterie = null; }
    if (enCours) {
      enCours.pause();
      enCours = null;
    }
  }

  /* ---------- ecouter, repeter, reecouter ---------------------------------
     C'est la boucle qui fait passer de « j'ai entendu » a « je sais reciter ».
     Le verset se joue, puis on laisse un silence de la MEME duree — le temps
     de le repeter a voix haute — puis il se rejoue.

     La duree du silence est mesuree sur la lecture reelle, pas prise dans
     audio.duration : sur une suite de versets, et quand le reseau hesite, le
     temps ecoule est la seule mesure juste.

     surPhase(phase, tour) est appele avec 'ecoute', 'silence' ou 'fini' : la
     lecon peut ainsi dire a l'eleve quand c'est a lui de parler.
     ---------------------------------------------------------------------- */

  function jouerBoucle(source, ref, tours, surPhase) {
    arreter();
    var tour = 0;

    function cycle() {
      tour++;
      if (tour > tours) { if (surPhase) { surPhase('fini', tours); } return; }
      if (surPhase) { surPhase('ecoute', tour); }

      var debut = null;
      try { debut = performance.now(); } catch (e) { debut = null; }

      jouer(source, ref, null, function () {
        var ecoule = 1500;
        try {
          if (debut !== null) { ecoule = Math.max(900, performance.now() - debut); }
        } catch (e) { /* sans horloge fine, on garde le repli */ }
        // Repeter demande un peu plus de temps que d'ecouter : on n'est pas
        // encore a l'aise avec les mots. Un silence trop court fait abandonner.
        var silence = Math.min(12000, ecoule * 1.15);
        if (tour >= tours) { if (surPhase) { surPhase('fini', tour); } return; }
        if (surPhase) { surPhase('silence', tour); }
        minuterie = setTimeout(function () { minuterie = null; cycle(); }, silence);
      });
    }

    cycle();
  }

  /* Le compte rendu du sondage, affiche seulement avec « ?son=diag ».
     Un visiteur ordinaire ne le voit jamais. Il sert a repondre a une question
     qu'on ne peut pas trancher depuis l'atelier : quelle source repond, et en
     combien de temps. Une capture d'ecran de ce bloc suffit. */
  function ecrireDiagnostic(pres) {
    if (!modeDiagnostic() || !pres || !pres.parentNode) { return; }
    if (document.querySelector('.diag-son')) { return; }

    var lignes = '';
    for (var i = 0; i < journal.length; i++) {
      var e = journal[i];
      lignes += '<li>' + (e.repond ? '&#10003; ' : '&#10007; ')
              + '<strong>' + e.nom + '</strong> — ' + e.recitateur
              + (e.lent ? ' (voix lente)' : '')
              + '<br>' + e.motif + (e.ms === null ? '' : ' en ' + e.ms + ' ms')
              + '</li>';
    }
    if (!lignes) { lignes = '<li>Aucun hebergeur sonde.</li>'; }

    var bloc = document.createElement('div');
    bloc.className = 'diag-son';
    bloc.innerHTML = '<p class="diag-titre">Diagnostic du son</p><ul>' + lignes + '</ul>'
      + '<p class="diag-note">Bloc visible uniquement avec <code>?son=diag</code> '
      + 'dans l\'adresse. Retire-le pour revenir a la page normale.</p>';
    pres.parentNode.insertBefore(bloc, pres.nextSibling);
  }

  /** Pose les boutons « Ecouter » sur tous les [data-coran] d'une zone. */
  function brancher(racine) {
    var r = racine || document;
    var blocs = r.querySelectorAll('[data-coran]');
    if (!blocs.length || !window.Promise) { return; }

    choisirSource().then(function (source) {
      if (!source) {
        // Rien ne repond : aucun bouton, et rien ne mente. Mais on ecrit tout de
        // meme le diagnostic — c'est justement le cas ou il faut savoir pourquoi.
        ecrireDiagnostic(r.querySelector('[data-r="credit-audio"]')
                      || document.querySelector('[data-r="credit-audio"]'));
        return;
      }

      for (var i = 0; i < blocs.length; i++) {
        (function (bloc) {
          if (bloc.querySelector('.sons-verset')) { return; }
          var ref = lireReference(bloc.getAttribute('data-coran'));
          if (!ref) { return; }

          var barre = document.createElement('div');
          barre.className = 'sons-verset';

          var ecoute = document.createElement('button');
          ecoute.type = 'button';
          ecoute.className = 'ecouter';
          ecoute.setAttribute('aria-label', 'Ecouter la recitation');

          var repete = document.createElement('button');
          repete.type = 'button';
          repete.className = 'ecouter repeter';
          repete.setAttribute('aria-label', 'Ecouter puis repeter, trois fois');

          var phrase = document.createElement('p');
          phrase.className = 'a-toi';
          phrase.hidden = true;

          var LIRE = '<span aria-hidden="true">&#9654;</span> Ecouter';
          var STOP = '<span aria-hidden="true">&#9632;</span> Arreter';
          var BOUCLE = '<span aria-hidden="true">&#8635;</span> Repeter';

          function repos() {
            ecoute.innerHTML = LIRE;
            repete.innerHTML = BOUCLE;
            ecoute.classList.remove('joue');
            repete.classList.remove('joue');
            phrase.hidden = true;
            actif = null;
          }

          var actif = null;   // null | 'ecoute' | 'boucle'

          ecoute.addEventListener('click', function () {
            // On retient l'etat AVANT de remettre a zero : repos() efface
            // `actif`, donc le tester apres ne dit plus rien.
            var avant = actif;
            if (avant) { arreter(); repos(); }
            if (avant === 'ecoute') { return; }   // second appui : on arrete
            actif = 'ecoute';
            ecoute.classList.add('joue');
            ecoute.innerHTML = STOP;
            jouer(source, ref, null, repos);
          });

          // Trois tours : ecoute, a toi, ecoute, a toi, ecoute. Assez pour que
          // ca rentre, assez court pour ne pas lasser, et ca s'arrete tout seul.
          repete.addEventListener('click', function () {
            var avant = actif;
            if (avant) { arreter(); repos(); }
            if (avant === 'boucle') { return; }
            actif = 'boucle';
            repete.classList.add('joue');
            repete.innerHTML = STOP;
            phrase.hidden = false;
            jouerBoucle(source, ref, 3, function (phase, tour) {
              if (phase === 'fini') { repos(); return; }
              if (phase === 'ecoute') {
                phrase.className = 'a-toi ecoute';
                phrase.textContent = 'Ecoute bien (' + tour + ' sur 3)';
              } else {
                phrase.className = 'a-toi parle';
                phrase.textContent = 'A toi — repete a voix haute';
              }
            });
          });

          repos();
          barre.appendChild(ecoute);
          barre.appendChild(repete);
          bloc.appendChild(barre);
          bloc.appendChild(phrase);
        }(blocs[i]));
      }

      // Le credit, une fois par page, en clair : c'est la contrepartie de
      // l'emploi d'une source qu'on n'heberge pas.
      var hote = r.querySelector('[data-r="credit-audio"]') || document.querySelector('[data-r="credit-audio"]');
      if (hote && !hote.textContent.trim()) {
        hote.textContent = 'Recitation : ' + source.recitateur + ' — source : ' + source.nom
          + '. Les fichiers ne sont pas heberges par ce site.';
      }

      ecrireDiagnostic(hote);
    });
  }

  /** Bascule « voix lente » : Husary, la voix des ecoles coraniques. */
  function basculerLenteur() {
    ecrireMemoire(CLE_LENTEUR, veutLent() ? 'non' : 'oui');
    promesseSource = null;      // la source sera re-choisie
  }

  return {
    brancher: brancher,
    jouer: jouer,
    jouerBoucle: jouerBoucle,
    arreter: arreter,
    journal: function () { return journal.slice(); },
    choisirSource: choisirSource,
    basculerLenteur: basculerLenteur,
    veutLent: veutLent,
    lireReference: lireReference,
    globalVerset: globalVerset
  };
}());

if (typeof module !== 'undefined' && module.exports) { module.exports = ippCoran; }
