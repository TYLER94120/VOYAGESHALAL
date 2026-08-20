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
      quoi: 'Au reveil, en mangeant, en sortant, avant de dormir.' },
    { id: 'comportement', nom: 'Le comportement',
      quoi: 'La parole, la colere, les parents, les voisins.' }
  ];

  var CATALOGUE = [
    {
      id: 'al-fatiha',
      titre: 'Sourate Al-Fatiha, verset par verset',
      url: 'lecon-al-fatiha.html',
      parcours: 'sourates',
      minutes: 8,
      cartes: 13,
      acquis: 7,
      unite: 'verset d\'Al-Fatiha',
      unites: 'versets d\'Al-Fatiha',
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
      cartes: 9,
      acquis: 3,
      unite: 'invocation du matin',
      unites: 'invocations du matin',
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
      cartes: 13,
      acquis: 6,
      unite: 'pilier de la foi',
      unites: 'piliers de la foi',
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
      cartes: 14,
      acquis: 7,
      unite: 'geste de la priere',
      unites: 'gestes de la priere',
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
      cartes: 15,
      acquis: 28,
      unite: 'lettre de l\'alphabet',
      unites: 'lettres de l\'alphabet',
      publiee: true,
      resume: 'Bonne nouvelle : ce ne sont pas 28 dessins a retenir, mais 18 — '
            + 'affiches un par un pour que tu les comptes. Les points font le reste.'
    },
    {
      // Placee juste apres l'alphabet, et pas ailleurs : elle suppose de
      // reconnaitre les lettres. L'ordre du catalogue est l'ordre propose.
      id: 'lire-arabe-voyelles',
      titre: 'Lire l\'arabe : les signes au-dessus et en dessous',
      url: 'lecon-lire-arabe-voyelles.html',
      parcours: 'alphabet',
      minutes: 7,
      cartes: 12,
      acquis: 8,
      unite: 'signe de lecture',
      unites: 'signes de lecture',
      publiee: true,
      resume: 'Tu connais les lettres, et tu ne lis pas encore : il manque huit '
            + 'petits signes. Sur les mots d\'Al-Fatiha, que tu connais deja.'
    },
    {
      // Elle suppose les 28 lettres ET les huit signes : elle vient donc apres
      // « Lire l'arabe ». Les deux lecons precedentes l'annoncent deja.
      id: 'lire-arabe-formes',
      titre: 'Les lettres changent de forme selon leur place',
      url: 'lecon-lire-arabe-formes.html',
      parcours: 'alphabet',
      minutes: 6,
      cartes: 9,
      acquis: 4,
      unite: 'forme de la lettre',
      unites: 'formes de la lettre',
      publiee: true,
      resume: 'Une lettre ne change pas : elle se raccourcit. Quatre places, '
            + 'quatre formes — et deux pour celles qui ne s\'attachent jamais.'
    },
    {
      id: 'prophetes-coran',
      titre: 'Les 25 prophetes nommes dans le Coran',
      url: 'lecon-prophetes-coran.html',
      parcours: 'prophetes',
      minutes: 8,
      cartes: 11,
      acquis: 25,
      unite: 'prophete du Coran',
      unites: 'prophetes du Coran',
      publiee: true,
      resume: 'Dix-sept d\'entre eux sont cites d\'affilee dans un seul passage. '
            + 'Tu les apprends par paquets, pas un par un.'
    },
    {
      id: 'comportement',
      titre: 'Six phrases du Prophete sur le comportement',
      url: 'lecon-comportement.html',
      parcours: 'comportement',
      minutes: 6,
      cartes: 12,
      acquis: 6,
      unite: 'phrase du Prophete',
      unites: 'phrases du Prophete',
      publiee: true,
      resume: 'Six hadiths qui tiennent chacun en une phrase, tous dans Sahih '
            + 'al-Boukhari, avec leur numero. Prends-en une seule pour aujourd\'hui.'
    },
    {
      id: 'sourate-al-ikhlas',
      titre: 'Sourate Al-Ikhlas, verset par verset',
      url: 'lecon-sourate-al-ikhlas.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 9,
      acquis: 4,
      unite: 'verset de Al-Ikhlas',
      unites: 'versets de Al-Ikhlas',
      publiee: true,
      resume: 'La 112e sourate du Coran, quatre versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-falaq',
      titre: 'Sourate Al-Falaq, verset par verset',
      url: 'lecon-sourate-al-falaq.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 10,
      acquis: 5,
      unite: 'verset de Al-Falaq',
      unites: 'versets de Al-Falaq',
      publiee: true,
      resume: 'La 113e sourate du Coran, cinq versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-an-nas',
      titre: 'Sourate An-Nas, verset par verset',
      url: 'lecon-sourate-an-nas.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 11,
      acquis: 6,
      unite: 'verset de An-Nas',
      unites: 'versets de An-Nas',
      publiee: true,
      resume: 'La 114e sourate du Coran, six versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-kawthar',
      titre: 'Sourate Al-Kawthar, verset par verset',
      url: 'lecon-sourate-al-kawthar.html',
      parcours: 'sourates',
      minutes: 4,
      cartes: 7,
      acquis: 3,
      unite: 'verset de Al-Kawthar',
      unites: 'versets de Al-Kawthar',
      publiee: true,
      resume: 'La 108e sourate du Coran, trois versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-asr',
      titre: 'Sourate Al-Asr, verset par verset',
      url: 'lecon-sourate-al-asr.html',
      parcours: 'sourates',
      minutes: 4,
      cartes: 7,
      acquis: 3,
      unite: 'verset de Al-Asr',
      unites: 'versets de Al-Asr',
      publiee: true,
      resume: 'La 103e sourate du Coran, trois versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-an-nasr',
      titre: 'Sourate An-Nasr, verset par verset',
      url: 'lecon-sourate-an-nasr.html',
      parcours: 'sourates',
      minutes: 4,
      cartes: 7,
      acquis: 3,
      unite: 'verset de An-Nasr',
      unites: 'versets de An-Nasr',
      publiee: true,
      resume: 'La 110e sourate du Coran, trois versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-ma-un',
      titre: 'Sourate Al-Ma\'un, verset par verset',
      url: 'lecon-sourate-al-ma-un.html',
      parcours: 'sourates',
      minutes: 6,
      cartes: 12,
      acquis: 7,
      unite: 'verset de Al-Ma\'un',
      unites: 'versets de Al-Ma\'un',
      publiee: true,
      resume: 'La 107e sourate du Coran, sept versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-kafirun',
      titre: 'Sourate Al-Kafirun, verset par verset',
      url: 'lecon-sourate-al-kafirun.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 11,
      acquis: 6,
      unite: 'verset de Al-Kafirun',
      unites: 'versets de Al-Kafirun',
      publiee: true,
      resume: 'La 109e sourate du Coran, six versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-quraysh',
      titre: 'Sourate Quraysh, verset par verset',
      url: 'lecon-sourate-quraysh.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 9,
      acquis: 4,
      unite: 'verset de Quraysh',
      unites: 'versets de Quraysh',
      publiee: true,
      resume: 'La 106e sourate du Coran, quatre versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-fil',
      titre: 'Sourate Al-Fil, verset par verset',
      url: 'lecon-sourate-al-fil.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 10,
      acquis: 5,
      unite: 'verset de Al-Fil',
      unites: 'versets de Al-Fil',
      publiee: true,
      resume: 'La 105e sourate du Coran, cinq versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-masad',
      titre: 'Sourate Al-Masad, verset par verset',
      url: 'lecon-sourate-al-masad.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 10,
      acquis: 5,
      unite: 'verset de Al-Masad',
      unites: 'versets de Al-Masad',
      publiee: true,
      resume: 'La 111e sourate du Coran, cinq versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-humaza',
      titre: 'Sourate Al-Humaza, verset par verset',
      url: 'lecon-sourate-al-humaza.html',
      parcours: 'sourates',
      minutes: 7,
      cartes: 14,
      acquis: 9,
      unite: 'verset de Al-Humaza',
      unites: 'versets de Al-Humaza',
      publiee: true,
      resume: 'La 104e sourate du Coran, neuf versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-at-takathur',
      titre: 'Sourate At-Takathur, verset par verset',
      url: 'lecon-sourate-at-takathur.html',
      parcours: 'sourates',
      minutes: 6,
      cartes: 13,
      acquis: 8,
      unite: 'verset de At-Takathur',
      unites: 'versets de At-Takathur',
      publiee: true,
      resume: 'La 102e sourate du Coran, huit versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-qari-a',
      titre: 'Sourate Al-Qari\'a, verset par verset',
      url: 'lecon-sourate-al-qari-a.html',
      parcours: 'sourates',
      minutes: 8,
      cartes: 16,
      acquis: 11,
      unite: 'verset de Al-Qari\'a',
      unites: 'versets de Al-Qari\'a',
      publiee: true,
      resume: 'La 101e sourate du Coran, onze versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-adiyat',
      titre: 'Sourate Al-Adiyat, verset par verset',
      url: 'lecon-sourate-al-adiyat.html',
      parcours: 'sourates',
      minutes: 8,
      cartes: 16,
      acquis: 11,
      unite: 'verset de Al-Adiyat',
      unites: 'versets de Al-Adiyat',
      publiee: true,
      resume: 'La 100e sourate du Coran, onze versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-az-zalzala',
      titre: 'Sourate Az-Zalzala, verset par verset',
      url: 'lecon-sourate-az-zalzala.html',
      parcours: 'sourates',
      minutes: 6,
      cartes: 13,
      acquis: 8,
      unite: 'verset de Az-Zalzala',
      unites: 'versets de Az-Zalzala',
      publiee: true,
      resume: 'La 99e sourate du Coran, huit versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-al-qadr',
      titre: 'Sourate Al-Qadr, verset par verset',
      url: 'lecon-sourate-al-qadr.html',
      parcours: 'sourates',
      minutes: 5,
      cartes: 10,
      acquis: 5,
      unite: 'verset de Al-Qadr',
      unites: 'versets de Al-Qadr',
      publiee: true,
      resume: 'La 97e sourate du Coran, cinq versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-at-tin',
      titre: 'Sourate At-Tin, verset par verset',
      url: 'lecon-sourate-at-tin.html',
      parcours: 'sourates',
      minutes: 6,
      cartes: 13,
      acquis: 8,
      unite: 'verset de At-Tin',
      unites: 'versets de At-Tin',
      publiee: true,
      resume: 'La 95e sourate du Coran, huit versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-ash-sharh',
      titre: 'Sourate Ash-Sharh, verset par verset',
      url: 'lecon-sourate-ash-sharh.html',
      parcours: 'sourates',
      minutes: 6,
      cartes: 13,
      acquis: 8,
      unite: 'verset de Ash-Sharh',
      unites: 'versets de Ash-Sharh',
      publiee: true,
      resume: 'La 94e sourate du Coran, huit versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
    },
    {
      id: 'sourate-ad-duha',
      titre: 'Sourate Ad-Duha, verset par verset',
      url: 'lecon-sourate-ad-duha.html',
      parcours: 'sourates',
      minutes: 8,
      cartes: 16,
      acquis: 11,
      unite: 'verset de Ad-Duha',
      unites: 'versets de Ad-Duha',
      publiee: true,
      resume: 'La 93e sourate du Coran, onze versets. Le texte arabe, le sens de '
            + 'chaque verset, et la reference a chaque fois.'
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

  function vide() { return { v: 1, lecons: {}, jours: [], vides: [] }; }

  /* ---------- une date lue du telephone n'est jamais sure -----------------
     `charger()` verifiait la forme du CONTENANT — un tableau, un objet — sans
     regarder ce qu'il y avait dedans. Mesure du cycle 37 : un nombre glisse dans
     la liste des jours faisait lever `s.split is not a function`, et la personne
     perdait d'un coup **l'anneau, sa serie, son objectif et son chemin**. Le
     site lui reproposait alors Al-Fatiha, une lecon qu'elle avait deja finie,
     comme si elle n'avait jamais rien fait.

     Le pire n'est pas le plantage, c'est qu'il est **definitif** : la valeur
     reste sur son telephone, elle revient a chaque visite, et rien a l'ecran ne
     lui dit pourquoi. Elle ne peut pas la reparer.

     On ne garde donc que ce qui est vraiment une date. Le controle de forme ne
     suffit pas : « 2026-13-45 » a la bonne forme et n'existe pas. On relit donc
     ce que la date rend, et on exige que ca redonne le meme texte.            */
  var FORME_JOUR = /^\d{4}-\d{2}-\d{2}$/;

  function estUnJour(s) {
    if (typeof s !== 'string' || !FORME_JOUR.test(s)) { return false; }
    var d = depuisCle(s);
    return !isNaN(d.getTime()) && enCle(d) === s;
  }

  /* Un jour ecrit deux fois n'est pas deux jours.

     `terminer()` se garde deja d'ajouter deux fois la meme date, donc le site
     n'en fabrique pas. Mais la memoire peut en contenir — une restauration, une
     copie, un futur bout de code — et le calcul de la serie, lui, comptait
     chaque ligne : mesure du cycle 37, **un seul jour ecrit cinq fois affichait
     « 5 jours d'affilee — c'est ton record »**. Le compteur inventait quatre
     jours de pratique.

     C'est la faute la plus grave qu'un compteur puisse commettre ici, et elle ne
     se voit pas : le chiffre a l'air normal. On dedoublonne a la lecture, une
     bonne fois, plutot que de faire confiance a chaque endroit qui compte.     */
  function sansDoublon(liste) {
    var vus = {};
    var sortie = [];
    for (var i = 0; i < liste.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(vus, liste[i])) {
        vus[liste[i]] = true;
        sortie.push(liste[i]);
      }
    }
    return sortie;
  }

  function charger() {
    try {
      var brut = global.localStorage.getItem(CLE);
      if (!brut) { return vide(); }
      var d = JSON.parse(brut);
      if (!d || typeof d !== 'object') { return vide(); }
      if (!d.lecons || typeof d.lecons !== 'object') { d.lecons = {}; }
      if (Object.prototype.toString.call(d.jours) !== '[object Array]') { d.jours = []; }
      // Ajoute apres coup : un etat ecrit avant n'en a pas, et c'est normal.
      if (Object.prototype.toString.call(d.vides) !== '[object Array]') { d.vides = []; }
      // Et le contenu, pas seulement le contenant : voir estUnJour().
      d.jours = sansDoublon(d.jours.filter(estUnJour));
      d.vides = sansDoublon(d.vides.filter(estUnJour));
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

  /* Le stockage marche-t-il vraiment ?

     Tout le site continue de fonctionner quand il est refuse — chaque acces est
     dans un try/catch. Mais continuer ne suffit pas : sans cette question, la
     fin de lecon annoncait « tu as maintenant appris 0 choses » juste apres un
     sans-faute, et promettait une revision qui n'arriverait jamais. Un compteur
     qui ment est pire qu'un compteur absent.

     On teste en ecrivant pour de vrai : sur iPhone en navigation privee, LIRE
     peut reussir et ECRIRE lever. La cle d'essai est effacee aussitot. */
  var _memoire = null;
  function memoire() {
    if (_memoire !== null) { return _memoire; }
    try {
      global.localStorage.setItem('ipp.essai', '1');
      global.localStorage.removeItem('ipp.essai');
      _memoire = true;
    } catch (e) {
      _memoire = false;
    }
    return _memoire;
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

  /* UN NON EST UNE REPONSE, ET IL S'ENREGISTRE.

     Mesure du cycle 29, sept lecons enchainees le meme jour : quelqu'un qui tape
     « Pas d'heure fixe » se voit reposer la question **7 fois sur 7**. Le bouton
     n'ecrivait rien — il affichait « Comme tu veux » et repartait —, donc
     `moment()` restait vide et la question se representait a chaque ecran de fin.
     Celle qui CHOISIT un repere, elle, ne la voit qu'une fois : le cas etait deja
     traite. Le seul non gere etait le refus.

     Un mecanisme qui redemande six fois dans l'heure ce qu'on vient de refuser
     est exactement ce que ma competence interdit. On garde donc le refus.

     Il est definitif, et c'est volontaire : **la porte reste ouverte du cote de
     la personne** — « Mon chemin » propose toujours le choix, sur une page
     qu'elle a ouverte elle-meme. Redemander apres un delai serait peut-etre
     mieux, mais je n'ai aucune mesure qui dise lequel : inventer « au bout de
     deux semaines » serait inventer une regle. */
  function refuserMoment() {
    try {
      global.localStorage.setItem(CLE_MOMENT, JSON.stringify({ refuse: true, faitLe: aujourdhui() }));
    } catch (e) { /* sans memoire, la question reviendra : on ne peut pas mieux */ }
  }

  function momentRefuse() {
    try {
      var brut = global.localStorage.getItem(CLE_MOMENT);
      if (!brut) { return false; }
      var d = JSON.parse(brut);
      return !!(d && d.refuse && !d.id);
    } catch (e) {
      return false;
    }
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

    /* Un tour ne compte qu'une fois par jour.

       Sans cette condition, refaire une lecon dans la minute faisait passer son
       echeance de 2 jours a 7 : le calcul comptait les tours sans regarder QUAND
       le tour precedent avait eu lieu. Or refaire une carte trente secondes plus
       tard n'est pas un souvenir retrouve apres un delai, c'est une relecture —
       et l'espacement ne se merite qu'avec le delai.

       Consequence : quelqu'un qui repassait une lecon pour s'entrainer voyait sa
       vraie revision s'eloigner, en silence. Il etait puni de s'entrainer.

       Ce qui compte quand meme, comme avant : la journee est enregistree, donc
       la serie et l'objectif du jour avancent normalement. */
    var refait = (f.faitLe === jour);
    if (!refait) { f.tours = (f.tours || 0) + 1; }
    f.faitLe = jour;

    var pas = ESPACEMENT[Math.min(Math.max(f.tours, 1) - 1, ESPACEMENT.length - 1)];
    // Une reprise du meme jour ne repousse pas l'echeance deja fixee.
    if (!refait || !f.revoirLe) { f.revoirLe = plusDeJours(jour, pas); }

    d.lecons[id] = f;
    if (d.jours.indexOf(jour) === -1) { d.jours.push(jour); }
    sauver(d);
    // `pas` sert la phrase de fin de lecon : on annonce les jours qui restent
    // reellement avant l'echeance, pas l'espacement theorique.
    return { pas: Math.max(1, ecartJours(jour, f.revoirLe)) };
  }

  function jours() { return charger().jours.slice().sort(); }

  /* ---------- les jours ou le site n'avait rien a proposer -----------------
     Mesure du 12 aout, seize jours parcourus a la suite en faisant chaque jour
     tout ce que le site demande : les jours 9 a 13, il n'y avait plus une seule
     lecon neuve ni une seule revision due. La personne est venue quand meme. Le
     dixieme jour, son jour de grace a ete depense pour couvrir ce trou ; le
     onzieme, la ligne affichait « Ta serie commence aujourd'hui. » Elle etait a
     huit.

     C'est le seul cas ou le compteur devenait un jugement : il punissait
     quelqu'un pour une absence qui etait la NOTRE. Le jour de grace existe pour
     une personne qui s'absente, pas pour excuser un catalogue trop court.

     Ce qu'on enregistre donc : le jour ou la personne est venue et ou le site
     n'avait rien. Ce jour-la ne compte PAS comme un jour de serie — on
     n'inventerait pas un apprentissage qui n'a pas eu lieu — mais il ne casse
     plus la chaine. Il devient neutre : le compteur reste ou il est.

     Un plafond, parce qu'une liste sans plafond finit par occuper la place
     d'autre chose : les 120 derniers jours suffisent largement, la plus longue
     serie imaginable tient dedans.
     ---------------------------------------------------------------------- */

  var VIDES_MAX = 120;

  function joursVides() { return charger().vides.slice().sort(); }

  /* Appele par l'accueil quand il affiche « Tu es a jour ». */
  function noterJourVide() {
    var d = charger();
    var jour = aujourdhui();
    // Si la journee est deja enregistree comme faite, elle n'est pas vide.
    if (d.jours.indexOf(jour) !== -1) { return false; }
    if (d.vides.indexOf(jour) !== -1) { return false; }
    d.vides.push(jour);
    d.vides.sort();
    if (d.vides.length > VIDES_MAX) { d.vides = d.vides.slice(-VIDES_MAX); }
    sauver(d);
    return true;
  }

  /* Combien de jours vides STRICTEMENT entre deux dates. Sert a enjamber un
     trou sans le compter ni comme presence ni comme absence. */
  function videsEntre(liste, a, b) {
    var n = 0;
    for (var i = 0; i < liste.length; i++) {
      if (liste[i] > a && liste[i] < b) { n++; }
    }
    return n;
  }

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
      return { serie: 0, record: 0, grace: 0, sauvee: false, jamais: true, enjambes: 0 };
    }

    var vides = joursVides();
    var serie = 0;
    var grace = 0;
    var record = 0;
    var sauvee = false;      // la serie en cours a-t-elle ete sauvee par une grace ?
    var enjambes = 0;        // jours ou le site n'avait rien, et qui n'ont rien casse

    function compter() {
      serie++;
      if (serie % GRACE_TOUS_LES === 0) { grace = Math.min(GRACE_MAX, grace + 1); }
      if (serie > record) { record = serie; }
    }

    /* Les jours ou le site n'avait rien a proposer sortent du calcul avant tout
       le reste : ni presence, ni absence. Sans ca, c'est notre catalogue trop
       court qui casse la serie de la personne. */
    function trous(a, b) {
      var vus = videsEntre(vides, a, b);
      enjambes += vus;
      return Math.max(0, ecartJours(a, b) - 1 - vus);
    }

    compter();               // le premier jour de l'historique
    for (var i = 1; i < liste.length; i++) {
      var manques = trous(liste[i - 1], liste[i]);
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
        enjambes = 0;
        compter();
      }
    }

    // De la derniere visite a aujourd'hui. Aujourd'hui ne compte pas comme
    // manque : la journee n'est pas finie.
    var restant = trous(liste[liste.length - 1], aujourdhui());
    if (restant > 0) {
      if (restant <= grace) {
        grace -= restant;
        sauvee = true;
      } else {
        serie = 0;
        grace = 0;
        sauvee = false;
        enjambes = 0;
      }
    }

    return { serie: serie, record: record, grace: grace, sauvee: sauvee,
             jamais: false, enjambes: enjambes };
  }

  function serie() { return serieDetaillee().serie; }

  /* ---------- l'objectif du jour -------------------------------------------
     Minuscule et toujours atteignable. Un objectif qu'on peut rater les jours de
     fatigue est un objectif qui fait fermer le site — justement les jours ou la
     serie a besoin de nous.

     CE CHIFFRE VALAIT 3, ET C'ETAIT UNE SUPPOSITION, PAS UNE DECISION.

     « Trois revisions valent une lecon neuve » ne tient que si une revision
     coute moins cher. Mesure du 12 aout, les sept lecons traversees deux fois
     de suite dans la meme session :

         premier passage   12 cartes, 15 tapes en moyenne
         revision          12 cartes, 15 tapes en moyenne
         rapport           cartes x1.00   tapes x1.00   temps x0.96

     Une revision rejoue TOUTES les cartes : le site ne raccourcit rien. Donc a 3,
     l'objectif du jour demandait **37 cartes un jour de revision contre 12 un
     jour de lecon neuve — trois fois plus lourd**, et c'est exactement ce que la
     regle ecrite juste au-dessus interdit. Ce n'etait pas un arbitrage de
     produit : c'etait un chiffre jamais confronte a ce qu'il mesurait.

     A 1, une journee vaut une journee, quel que soit son contenu. La personne
     reste libre d'en faire trois — la carte continue de proposer la suivante —
     mais on ne le lui DEMANDE plus.
     ---------------------------------------------------------------------- */

  /* ---------- l'etagere ----------------------------------------------------
     La memorisation est une collection par nature, et c'est un avantage que ce
     site a et que les autres n'ont pas : « 7 versets d'Al-Fatiha, 28 lettres,
     25 prophetes » se regarde comme une etagere qui se remplit.

     UNE REGLE D'HONNETETE QUI NE SE DISCUTE PAS : on n'ecrit JAMAIS « par
     coeur ». Le site ne verifie a aucun moment qu'une sourate est memorisee ; il
     montre, explique et fait repeter. Annoncer « 3 sourates par coeur » serait
     un compliment invente, et le premier mensonge d'un site dont tout l'interet
     est de ne pas mentir. On dit donc ce qui est vrai : ce qui a ete appris.

     Ne comptent que les lecons TERMINEES : une etagere se remplit, elle ne
     s'affiche pas pleine d'avance.
     ---------------------------------------------------------------------- */

  var CLE_REPET = 'ipp.repetitions.v1';

  function repetitions() {
    try {
      var n = parseInt(global.localStorage.getItem(CLE_REPET), 10);
      return isNaN(n) || n < 0 ? 0 : n;
    } catch (e) {
      return 0;
    }
  }

  function compterRepetition() {
    var n = repetitions() + 1;
    try { global.localStorage.setItem(CLE_REPET, String(n)); } catch (e) { /* sans memoire, on continue */ }
    return n;
  }

  function collection() {
    var d = charger();
    var rangees = [];
    for (var i = 0; i < CATALOGUE.length; i++) {
      var l = CATALOGUE[i];
      if (!l.publiee || !d.lecons[l.id] || !l.unite) { continue; }
      rangees.push({
        id: l.id,
        n: l.acquis,
        libelle: l.acquis === 1 ? l.unite : l.unites
      });
    }
    return rangees;
  }

  var OBJ_REVISIONS = 1;

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

    /* Le jour ou le site n'a plus rien a proposer.

       Mesure du 12 aout : six jours sur seize, la ligne affichait « Objectif du
       jour : une lecon. Cinq minutes suffisent. » a trois centimetres de sa
       propre carte qui disait « aucune revision n'est prevue aujourd'hui ».
       L'anneau restait ouvert a zero. Le site reclamait une chose qu'il venait
       d'annoncer impossible — un compteur qu'on ne peut pas fermer n'est plus un
       compteur, c'est un jugement.

       Deux situations, et elles ne se traitent pas pareil :

       - il ne reste rien ET rien n'a ete fait : il n'y a PAS d'objectif
         aujourd'hui. On le dit, et on ne felicite personne pour une journee
         vide — ce serait un compliment invente.

       - il ne reste rien MAIS quelque chose a ete fait : l'objectif du jour
         etait de faire ce que le site avait, et c'est fait. Une seule revision
         due, faite, ne doit pas afficher « ou 2 revisions de plus » : elles
         n'existent pas. */
    var rien = !leconDuJour();
    var fait = (neuves + revisions) > 0;
    if (rien && fait) { part = 1; }

    return {
      neuves: neuves,
      revisions: revisions,
      atteint: part >= 1,
      part: Math.min(1, part),
      // Aucun objectif possible aujourd'hui : ni a atteindre, ni a rater.
      rien: rien && !fait
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

  /* ---------- la prochaine echeance ---------------------------------------
     Pour remplacer une promesse par un fait.

     Le site disait « Reviens demain : la prochaine lecon arrive bientot » les
     jours ou il n'avait rien — quatre jours sur seize. Or `CATALOGUE` ne
     contient que les lecons publiees : aucune lecon n'est programmee, ni demain
     ni le jour d'apres. « Bientot » n'etait verifiable par personne, et
     `NOTES-lecons-a-venir.md` pose exactement la regle inverse : on n'affiche
     que ce qui existe.

     Ce qui EST verifiable, c'est la date de la prochaine revision : elle est
     ecrite dans la progression, calculee par l'espacement. On la dit. Un rendez-
     vous vrai fait revenir mieux qu'une promesse vague, et il ne coute pas la
     confiance quand il n'est pas tenu.

     Renvoie le nombre de jours d'ici la (1 = demain), ou null si rien n'est
     prevu — auquel cas on se taira.
     ---------------------------------------------------------------------- */
  function prochaineEcheance() {
    var d = charger();
    var jour = aujourdhui();
    var plus = null;
    for (var i = 0; i < CATALOGUE.length; i++) {
      var f = d.lecons[CATALOGUE[i].id];
      if (!f || !f.revoirLe || f.revoirLe <= jour) { continue; }
      if (plus === null || f.revoirLe < plus) { plus = f.revoirLe; }
    }
    if (plus === null) { return null; }
    return { cle: plus, dans: ecartJours(jour, plus) };
  }

  /* « demain », « jeudi », ou « dans 12 jours » : la formulation la plus courte
     qui reste exacte. Au-dela d'une semaine, un nom de jour serait ambigu. */
  function ditEcheance(e) {
    if (!e) { return ''; }
    if (e.dans <= 1) { return 'demain'; }
    if (e.dans <= 6) { return JOURS_FR[depuisCle(e.cle).getDay()]; }
    return 'dans ' + e.dans + ' jours';
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
    memoire: memoire,
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
    joursVides: joursVides,
    noterJourVide: noterJourVide,
    serie: serie,
    serieDetaillee: serieDetaillee,
    OBJ_REVISIONS: OBJ_REVISIONS,
    objectifDuJour: objectifDuJour,
    collection: collection,
    repetitions: repetitions,
    compterRepetition: compterRepetition,
    aRevoir: aRevoir,
    prochaineEcheance: prochaineEcheance,
    ditEcheance: ditEcheance,
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
    refuserMoment: refuserMoment,
    momentRefuse: momentRefuse,
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

  // On n'impose les trois questions qu'a quelqu'un qui n'a RIEN fait encore.
  //
  // Pourquoi ce garde-fou : on arrive aussi ici par une passerelle depuis un
  // autre site de la famille, directement sur une lecon. Cette personne a
  // travaille six minutes, puis ouvre l'accueil — et sans cette condition, le
  // site lui demandait « ou en es-tu avec la priere ? » comme a une inconnue,
  // en masquant au passage sa serie et son anneau du jour. Le pire accueil
  // possible pour quelqu'un qui vient de faire l'effort.
  //
  // Les questions restent proposees, jamais perdues : « Mon chemin » porte le
  // bouton « Repondre aux 3 questions ».
  // LES TROIS QUESTIONS NE BARRENT PLUS L'ENTREE  (14 aout, sur decision de
  // Mohamed apres avoir ouvert le site sur son telephone).
  //
  // Elles s'affichaient AVANT tout le reste. Mesure faite ce jour-la, sur un
  // telephone de 414 x 690 et une memoire vide : il fallait **cinq appuis**
  // pour apprendre le premier mot, et lire 115 mots avant meme la premiere
  // question. Un peage paye avant d'avoir rien recu — et la premiere chose
  // demandee a un inconnu etait ou il en est avec la priere.
  //
  // Desormais : la carte du jour d'abord, jouable tout de suite. Les questions
  // se proposent SOUS la carte, et depuis « Mon chemin ». Elles ne sont pas
  // perdues, elles ne sont plus un passage oblige.
  //
  // Ce que ca coute, et il faut le dire : sans reponse, tout le monde commence
  // par Al-Fatiha. C'etait deja le cas de qui touchait « Passer », et pour un
  // debutant comme pour un pratiquant, c'est un bon premier pas — c'est la
  // sourate de chaque priere.
  var dejaVenu = IPP.jours().length > 0;
  if (corps) { corps.hidden = false; }
  if (q('diag')) { q('diag').hidden = true; }

  /* Les chiffres de l'accueil viennent du catalogue, jamais recopies : le jour
     ou une lecon s'ajoute, la phrase se met a jour toute seule. Le HTML porte
     un repli en toutes lettres, pour Google et pour qui n'execute rien. */
  var chiffres = q('offre-chiffres');
  if (chiffres) {
    var o = IPP.chiffresOffre();
    chiffres.textContent = o.lecons + ' lecons, ' + o.minutes + ' minutes, '
      + o.acquis + ' choses a apprendre. Tout est gratuit, sans compte.';
  }

  var ouvrir = q('diag-ouvrir');
  if (ouvrir) {
    var aRepondu = !!IPP.niveau();
    ouvrir.hidden = aRepondu || !q('diag');
    if (!ouvrir.hidden && !ouvrir.getAttribute('data-branche')) {
      ouvrir.setAttribute('data-branche', '1');
      ouvrir.addEventListener('click', function () {
        if (corps) { corps.hidden = true; }
        ippDemarrerDiagnostic(racine, function () {
          if (corps) { corps.hidden = false; }
          ippRendreAccueil(racine);
        });
      });
    }
  }

  // --- le jour ou le site n'a rien a proposer ---
  // Il faut l'enregistrer AVANT de dessiner l'anneau et la serie, sinon
  // l'affichage a un jour de retard sur l'etat. Ce jour-la ne compte pas comme
  // un jour de serie, mais il ne la casse plus : voir noterJourVide().
  if (dejaVenu && !IPP.leconDuJour()) { IPP.noterJourVide(); }

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
    // Tout est fait et rien n'est a revoir : on le dit franchement, et on donne
    // la seule chose qu'on sache vraiment — la date de la prochaine revision.
    // Pas de « la prochaine lecon arrive bientot » : rien ne l'adosse.
    var ech = IPP.prochaineEcheance();
    carte.innerHTML =
      '<span class="eyebrow">C\'est fait pour aujourd\'hui</span>'
      + '<h2>Tu es a jour</h2>'
      + '<p class="clair">Toutes les lecons disponibles sont terminees, et aucune revision '
      + 'n\'est prevue aujourd\'hui.'
      + (ech ? ' Ta prochaine revision\u00a0: <strong>' + IPP.ditEcheance(ech) + '</strong>.' : '')
      + '</p>'
      + '<a class="btn fantome" href="chemin.html">Voir mon chemin</a>';
  } else {
    var l = choix.lecon;
    var revision = (choix.mode === 'revision');
    // « du jour » n'est vrai que la premiere fois de la journee.
    q('carte-eyebrow').textContent =
      ippEtiquette(revision, IPP.faitAujourdhui(), true);
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
  // aujourd'hui et qu'une lecon NEUVE passe devant, on ne l'efface pas pour
  // autant : elle tient sur une ligne, sous le bouton.
  //
  // Cette ligne n'existe que pour cette raison-la. Quand la carte du jour est
  // deja une revision, il n'y a plus rien a rattraper : la ligne se tait. Sinon
  // l'accueil nommait DEUX lecons differentes — mesure du 11 aout, carte
  // « Al-Fatiha, Revoir → » et juste dessous « Trois invocations revient
  // aujourd'hui » — sur un ecran dont toute la regle est une carte, un bouton.
  var rappel = q('rappel');
  if (rappel) {
    var dues = (choix && choix.mode === 'revision') ? [] : IPP.aRevoir();
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

  // L'anneau existe pour etre ferme. Le jour ou il n'y a rien a faire, il n'y a
  // rien a fermer : un cercle vide a cote de « rien a faire » se lit comme un
  // trou, et c'est nous qui l'avons creuse. On le retire ce jour-la.
  var anneau = q('anneau');
  if (anneau) {
    anneau.hidden = o.rien;
    anneau.innerHTML = o.rien ? '' : ippAnneau(o.part, o.atteint);
  }

  // L'objectif : ce qu'il reste a faire, dit en une ligne et sans reproche.
  var txt = q('objectif-txt');
  if (txt) {
    if (o.rien) {
      // On nomme celui qui manque a l'appel, et ce n'est pas la personne.
      txt.textContent = 'Pas d\'objectif aujourd\'hui : le site n\'a rien de neuf pour toi.';
    } else if (o.atteint) {
      txt.textContent = 'Objectif du jour atteint.';
    } else if (o.revisions > 0) {
      // Le chiffre venait d'etre recopie a la main a cote de la constante : il
      // aurait menti des qu'elle bougeait. Il se calcule.
      var reste = IPP.OBJ_REVISIONS - o.revisions;
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

  // Meme regle qu'a l'accueil, parce qu'on arrive aussi ici directement : venir
  // un jour ou le site n'a rien a proposer ne doit pas casser la serie. Avant
  // toute lecture de la serie, sinon l'affichage a un jour de retard.
  if (IPP.jours().length > 0 && !IPP.leconDuJour()) { IPP.noterJourVide(); }

  // --- compteur ---
  var n = IPP.acquis();
  q('compteur-n').textContent = String(n);
  q('compteur-txt').innerHTML = (n === 0)
    ? 'Rien encore.<br>Ta premiere lecon t\'attend.'
    : (n === 1 ? 'chose apprise.<br>Continue demain.'
               : 'choses apprises,<br>lecon apres lecon.');

  // --- l'etagere : ce qu'on a accumule, nomme par ce que c'est ---
  var etag = q('etagere');
  if (etag) {
    var rangees = IPP.collection();
    var rep = IPP.repetitions();
    if (!rangees.length && !rep) {
      etag.hidden = true;
    } else {
      var h = '';
      for (var e = 0; e < rangees.length; e++) {
        h += '<div class="rangee"><span class="rn">' + rangees[e].n + '</span>'
           + '<span class="rl">' + ippEchappe(rangees[e].libelle) + '</span></div>';
      }
      if (rep > 0) {
        h += '<div class="rangee voix"><span class="rn">' + rep + '</span>'
           + '<span class="rl">' + (rep === 1 ? 'verset repete a voix haute'
                                              : 'versets repetes a voix haute') + '</span></div>';
      }
      etag.innerHTML = h;
      etag.hidden = false;
    }
  }

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
      + '<a href="https://voyageshalal.fr/horaires-priere?utm_source=islampasapas&utm_medium=contenu&utm_campaign=rendez-vous">voyageshalal.fr</a>.</p>'
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

   Et elle revient : une carte manquee est remise en fin de seance (voir
   ippDemarrerLecon). Tant qu'elle ne revenait pas, une erreur restait une
   erreur au lieu de devenir un apprentissage — la seance n'etait pas
   gagnable. Elle ne revient qu'UNE fois : une carte qui reviendrait sans
   fin serait une cage, et une cage est une pression.
   ========================================================= */

// Nombre de passages maximum pour une meme question dans une seance : le
// premier, puis la reprise. Au-dela on ne rejoue pas — la lecon reviendra
// d'elle-meme dans deux jours par la repetition espacee.
var IPP_PASSAGES_MAX = 2;

function ippMelanger(choix, opts) {
  'use strict';
  // Sinon la bonne reponse finit toujours a la meme place et on apprend la
  // position au lieu du contenu. Remelange aussi a la reprise : retrouver un
  // bouton la ou il etait ne prouve rien.
  for (var i = opts.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp;
  }
  for (var k = 0; k < opts.length; k++) { choix.appendChild(opts[k]); }
}

// Remet une carte de question dans son etat d'avant reponse. L'ecouteur de
// clic n'est pas rebranche : il est pose une seule fois, et c'est __passages
// qui lui dit s'il s'agit d'une reprise.
function ippRearmerQuiz(etape) {
  'use strict';
  var choix = etape.querySelector('.q-choix');
  var retour = etape.querySelector('[data-r-retour]');
  if (!choix) { return; }

  etape.__repondu = false;
  var opts = [].slice.call(etape.querySelectorAll('.q-opt'));
  for (var i = 0; i < opts.length; i++) {
    opts[i].disabled = false;
    opts[i].classList.remove('juste', 'faux');
  }
  // On remet l'explication telle qu'elle est ecrite dans la page, et on retire
  // "repondu" : la carte redevient une question posee.
  if (retour) {
    retour.className = 'q-retour';
    retour.textContent = etape.__explique || '';
  }
  ippMelanger(choix, opts);

  // On dit pourquoi elle revient. "On la revoit" est une invitation ; ce
  // n'est ni un reproche ni un constat d'echec.
  var oeil = etape.querySelector('.eyebrow');
  if (oeil) { oeil.textContent = 'On la revoit'; }
  etape.classList.add('reprise');
}

function ippPreparerQuiz(etape, bouton, score, sonner, surFaux, dire) {
  'use strict';
  if (etape.__quizPret) { return; }
  etape.__quizPret = true;
  if (!sonner) { sonner = function () {}; }

  var choix = etape.querySelector('.q-choix');
  var retour = etape.querySelector('[data-r-retour]');
  if (!choix) { return; }

  // L'explication est ECRITE dans la page, pas rangee dans un attribut : sans
  // JavaScript elle se lit, et la carte reste un document au lieu d'etre trois
  // boutons muets. On la retient ici ; le CSS la remasque tant qu'on n'a pas
  // repondu, donc avec JavaScript la carte redevient un test.
  if (retour && etape.__explique === undefined) {
    etape.__explique = retour.textContent.trim();
  }

  var opts = [].slice.call(etape.querySelectorAll('.q-opt'));
  ippMelanger(choix, opts);

  choix.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.q-opt') : null;
    if (!b || etape.__repondu) { return; }
    etape.__repondu = true;

    var reprise = etape.__passages > 1;
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

    // La carte ne revient que si elle n'a pas deja servi sa reprise.
    var reviendra = !juste && etape.__passages < IPP_PASSAGES_MAX;

    if (retour) {
      // "repondu" est ce qui rend le retour visible en mode pilote.
      retour.className = 'q-retour repondu ' + (juste ? 'ok' : 'non');
      var explique = etape.__explique || '';
      var tete;
      if (juste && reprise) { tete = 'Voila — tu l\'as. '; }
      else if (juste) { tete = 'Oui. '; }
      else {
        /* On disait « la bonne reponse est en dore ». Une couleur ne se lit pas
           a voix haute, et elle ne se voit pas non plus quand on distingue mal
           les teintes. On NOMME la bonne reponse : c'est vrai pour tout le
           monde, et plus utile meme pour qui voit l'ecran. */
        var bonneRep = etape.querySelector('.q-opt[data-bonne]');
        var nomBonne = bonneRep ? bonneRep.textContent.trim() : '';
        tete = nomBonne
          ? 'Pas tout a fait — c\'etait «\u00a0' + nomBonne + '\u00a0». '
          : 'Pas tout a fait. ';
      }
      retour.textContent = tete + explique
        + (reviendra ? ' On la revoit avant la fin.' : '');
      // Le meme texte que celui affiche : on n'annonce pas autre chose que ce
      // qui est a l'ecran.
      if (dire) { dire(retour.textContent); }
    }

    // Le compte des questions est fait au premier passage : une reprise ne
    // rajoute pas une question, elle change son issue.
    if (!reprise) {
      score.total++;
      if (juste) { score.justes++; }
    } else if (juste) {
      score.rattrapees++;
    }

    if (reviendra && surFaux) { surFaux(etape); }
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

  // Le bouton est cache dans la page : sans JavaScript il promettrait un son
  // qui n'arriverait jamais. Il n'apparait que si audio-coran.js est la.
  if (typeof ippCoran === 'undefined') { b.hidden = true; return; }
  b.hidden = false;

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
    // On retire la barre de boutons ET la ligne « a toi » : brancher() les
    // repose avec la nouvelle voix. Ne retirer que .ecouter laisserait une
    // barre vide, et le garde-fou de brancher() empecherait la reconstruction.
    var vieux = document.querySelectorAll('[data-coran] .sons-verset, [data-coran] .a-toi');
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

  /* L'etiquette de la premiere carte est ecrite en dur dans le fichier — « La
     lecon du jour » — ce qui est le bon repli sans JavaScript, mais faux des
     qu'on ouvre une revision ou une deuxieme lecon dans la meme journee. On la
     corrige ici, avec le meme vocabulaire que la carte de l'accueil. */
  var etiq = q('lecon-etiquette');
  if (etiq) {
    etiq.textContent = ippEtiquette(!!IPP.fiche(id), IPP.faitAujourdhui(), false);
  }

  // La lecon se joue comme une LISTE de cartes, pas comme un compteur qui
  // monte. C'est ce qui permet a une carte manquee d'etre remise a la fin :
  // on ajoute au bout de la liste, on n'a jamais a reculer. La barre de
  // progression suit la position dans cette liste, donc elle ne redescend
  // jamais non plus — voir une barre reculer, c'est perdre quelque chose.
  var ordre = [];
  for (var d = 0; d < CONTENU; d++) { ordre.push(etapes[d]); }
  var finale = etapes[TOTAL - 1];
  var pos = 0;                      // index dans ordre ; ordre.length = la fin

  var enregistree = false;
  var score = { justes: 0, total: 0, rattrapees: 0 };

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

  // Une carte remise a la fin ajoute son point : la barre s'allonge un peu,
  // elle ne recule pas.
  function remettreALaFin(etape) {
    if (ordre.indexOf(etape, pos + 1) !== -1) { return; }
    ordre.push(etape);
    var pt = document.createElement('span');
    pt.className = 'pt';
    q('points').appendChild(pt);
    segments = q('points').querySelectorAll('.pt');
    nommerBouton();
  }

  function nommerBouton() {
    if (pos >= ordre.length) { return; }
    bouton.textContent = (pos === ordre.length - 1) ? 'Terminer' : 'Suivant';
  }

  /* ---------- ce qu'entend quelqu'un qui ne voit pas l'ecran ---------------
     Mesure du cycle 35 : le site changeait de carte, affichait une explication,
     annoncait un score — **en silence**. Zero region vivante sur tout le site,
     et le focus qui ne bougeait jamais. Un lecteur d'ecran n'apprend un
     changement que par l'un des deux ; il n'y avait ni l'un ni l'autre.

     Deux mecaniques, et chacune pour ce qu'elle sait faire :

     - **le focus** deplace sur la nouvelle carte. C'est le seul moyen fiable de
       POSER la personne dans le nouveau contenu : une region vivante lui lirait
       le texte mais la laisserait sur la carte precedente, a chercher.
     - **une region vivante** pour la reponse a une question, parce que la, il ne
       faut surtout pas deplacer le focus : elle vient d'appuyer sur un bouton,
       on ne le lui arrache pas.

     La region est invisible mais jamais `display:none` — masquer ainsi la
     retirerait de l'arbre d'accessibilite, et elle ne servirait plus a rien.  */
  var annonce = q('annonce');
  if (!annonce) {
    annonce = document.createElement('p');
    annonce.className = 'visuellement-cache';
    annonce.setAttribute('data-r', 'annonce');
    annonce.setAttribute('role', 'status');
    annonce.setAttribute('aria-live', 'polite');
    zone.parentNode.insertBefore(annonce, zone);
  }

  /* Un lecteur d'ecran n'annonce que ce qui CHANGE : reecrire deux fois le meme
     texte ne changerait rien. On vide d'abord. */
  function dire(texte) {
    if (!annonce || !texte) { return; }
    annonce.textContent = '';
    setTimeout(function () { annonce.textContent = texte; }, 60);
  }

  function afficher(defiler) {
    var ici = (pos < ordre.length) ? ordre[pos] : finale;
    for (var a = 0; a < etapes.length; a++) {
      etapes[a].classList.toggle('actif', etapes[a] === ici);
    }
    for (var b = 0; b < segments.length; b++) {
      segments[b].classList.toggle('faite', b < pos);
    }

    if (ici === finale) {
      bas.hidden = true;
    } else {
      nommerBouton();

      // Sur une carte de test, on ne peut pas passer sans repondre : c'est
      // justement l'effort qui fait retenir.
      if (ici.hasAttribute('data-quiz')) {
        ici.__passages = (ici.__passages || 0) + 1;
        if (ici.__passages > 1) { ippRearmerQuiz(ici); }
        bouton.disabled = !ici.__repondu;
        ippPreparerQuiz(ici, bouton, score, sonner, remettreALaFin, dire);
      } else {
        bouton.disabled = false;
      }
    }

    // Sans cela on resterait au milieu du texte de la carte precedente.
    if (defiler) {
      var haut = zone.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo(0, Math.max(0, haut));

      /* Et sans cela, quelqu'un qui n'a que la voix resterait sur le bouton
         « Suivant » sans savoir que l'ecran a change. On le pose au debut de la
         carte : il lit alors l'etiquette, le titre, puis le contenu, dans
         l'ordre. `preventScroll` parce qu'on vient de choisir ou defiler.
         Seulement quand la personne a AGI : on ne vole jamais le focus au
         chargement de la page. */
      ici.setAttribute('tabindex', '-1');
      try { ici.focus({ preventScroll: true }); } catch (e) { ici.focus(); }
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
    // On exclut la lecon qu'on vient de finir explicitement, et pas seulement
    // via estFaite : sans stockage, estFaite reste faux et le site annoncait
    // "6 autres lecons t'attendent" alors qu'il en reste 5.
    var reste = IPP.publiees().filter(function (l) {
      return l.id !== id && !IPP.estFaite(l.id);
    }).length;

    var phrase = '';
    if (score.total) {
      // Le chiffre annonce l'etat FINAL : une carte rattrapee a la reprise
      // compte. C'est ce qui rend la seance gagnable. Mais "sans faute" reste
      // reserve au premier essai, et la reprise est dite — un compteur enonce
      // le fait exact, il n'embellit pas.
      phrase += (score.justes + score.rattrapees) + ' sur ' + score.total;
      if (score.justes === score.total) {
        phrase += ' — sans faute. ';
      } else if (score.rattrapees) {
        phrase += ', dont ' + score.rattrapees
                + (score.rattrapees > 1 ? ' rattrapees' : ' rattrapee')
                + ' a la reprise. ';
      } else {
        phrase += '. ';
      }
    }
    if (IPP.memoire()) {
      phrase += 'Tu as maintenant appris ' + total + ' choses sur ce site. '
              + 'Cette lecon reviendra dans ' + r.pas + (r.pas > 1 ? ' jours.' : ' jour.');
      if (serie > 1) { phrase += ' ' + serie + ' jours d\'affilee.'; }
    } else {
      // Sans stockage, le total vaut 0 et la revision n'aura pas lieu. On ne
      // dit donc ni l'un ni l'autre : on dit le fait, sans reproche et sans
      // faire porter a la personne un probleme qui vient du navigateur.
      phrase += 'Ce telephone n\'enregistre rien — souvent, c\'est la navigation '
              + 'privee. Ce que tu viens d\'apprendre est a toi, mais le site ne '
              + 's\'en souviendra pas. Pour garder ta progression, ouvre-le dans '
              + 'une fenetre normale.';
    }

    var cible = q('fin-texte');
    if (cible) { cible.textContent = phrase; }

    // C'est ici qu'on demande le rendez-vous quotidien : juste apres l'effort.
    // Mais on ne demande pas un rendez-vous qu'on serait incapable de retenir.
    // On ne pousse pas la question a qui l'a deja refusee. « Mon chemin » la
    // propose toujours : c'est a elle d'y revenir, pas a nous d'insister.
    if (IPP.memoire() && !IPP.momentRefuse()) { ippProposerMoment(q); }

    var suite = q('fin-suite');
    if (suite) {
      suite.textContent = reste
        ? (reste === 1 ? 'Une autre lecon t\'attend deja.'
                       : reste + ' autres lecons t\'attendent deja.')
        : ippSuiteSansLecon();
    }
  }

  /* ---------- le bouton Retour du telephone --------------------------------
     Mesure du cycle 38 : six tapes dans une lecon, Retour, et en la rouvrant on
     repart de la carte 1. Jusqu'a **14 tapes perdues** sur la plus longue. Le
     site ne posait aucune entree d'historique : une lecon etait UNE page, donc
     Retour la quittait entierement.

     Sur un telephone, le geste de retour au bord de l'ecran part tout seul. Le
     punir en effacant quinze minutes de travail est la meilleure facon de ne pas
     faire reprendre la lecon.

     On pose donc une entree par carte : **Retour recule d'une carte**, ce que le
     geste veut dire. Deux fois de suite depuis la premiere carte, on quitte la
     lecon — c'est aussi ce qu'on attend.

     La barre de progression recule alors d'un point, et c'est voulu : la regle du
     cycle 3 dit qu'elle ne recule pas TOUTE SEULE, quand une carte manquee est
     remise a la fin. Ici c'est la personne qui a demande a revenir ; lui montrer
     le contraire serait lui mentir sur ou elle est.

     `history` peut manquer ou etre refuse : on retombe alors sur l'ancien
     comportement, sans rien casser.                                           */
  var histoire = !!(window.history && window.history.pushState);

  function noterPosition() {
    if (!histoire) { return; }
    try { window.history.pushState({ ippPos: pos }, '', window.location.href); }
    catch (e) { histoire = false; }
  }

  if (histoire) {
    // L'entree d'origine porte la carte 0 : sans elle, un retour depuis la
    // premiere carte n'aurait rien a lire.
    try { window.history.replaceState({ ippPos: 0 }, '', window.location.href); }
    catch (e) { histoire = false; }

    window.addEventListener('popstate', function (e) {
      var ou = (e.state && typeof e.state.ippPos === 'number') ? e.state.ippPos : null;
      // Pas d'etat a nous : on sort de la lecon, on laisse le navigateur faire.
      if (ou === null) { return; }
      pos = Math.max(0, Math.min(ou, ordre.length));
      afficher(true);
    });
  }

  bouton.addEventListener('click', function () {
    if (pos >= ordre.length) { return; }
    pos++;
    noterPosition();
    // "tap" s'entend quatorze fois par lecon : il doit rester presque
    // invisible, et "fin" seul doit se remarquer.
    if (pos === ordre.length) {
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

/* La derniere ligne de l'ecran de fin, quand il ne reste plus une seule lecon
   a decouvrir.

   Elle disait « C'est la derniere lecon disponible. La prochaine arrive
   bientot. » — au moment le plus fort de la seance, juste apres l'effort, une
   promesse que rien n'adosse : le catalogue ne contient que les lecons deja
   publiees. On la remplace par le seul fait qu'on connaisse, la date de la
   prochaine revision. Et si meme celle-la n'existe pas, on se tait plutot que
   d'inventer une suite. */
function ippSuiteSansLecon() {
  'use strict';
  var ech = IPP.prochaineEcheance();
  if (!ech) { return 'C\'est la derniere lecon disponible aujourd\'hui.'; }
  return 'C\'est la derniere lecon disponible. Ta prochaine revision\u00a0: '
       + IPP.ditEcheance(ech) + '.';
}


/* L'ETIQUETTE, ET POURQUOI ELLE DOIT SE CALCULER.
 *
 * Elle disait « Ta lecon du jour ». Mesure du cycle 29, sept lecons enchainees
 * le meme jour : **7 cartes sur 7** portaient cette etiquette — six fois de trop.
 * Des la deuxieme, ce n'est plus la lecon du jour, c'est une lecon de plus. Et
 * la meme phrase etait ecrite en dur dans les sept fichiers de lecon, donc
 * fausse aussi sur chaque revision.
 *
 * La doctrine de l'accueil est « une seule chose : la lecon du jour, et un
 * bouton ». Tant que sept lecons tiennent dans une journee, l'etiquette doit
 * dire laquelle on ouvre — pas repeter une phrase qui a cesse d'etre vraie.
 *
 * Deux questions, quatre reponses, aucune qui felicite ni qui compte les points :
 *   deja vue ?  deja quelque chose aujourd'hui ?
 *   non   non  -> La lecon du jour
 *   non   oui  -> Une lecon de plus
 *   oui   non  -> La revision du jour
 *   oui   oui  -> Une revision de plus
 *
 * On ne numerote pas (« ta 5e lecon ») : un rang s'installe comme un score, et
 * un score sur une pratique religieuse est exactement ce qu'on s'interdit.
 */
function ippEtiquette(revision, enPlus, possessif) {
  'use strict';
  var quoi = revision ? 'revision' : 'lecon';
  if (enPlus) { return 'Une ' + quoi + ' de plus'; }
  return (possessif ? 'Ta ' : 'La ') + quoi + ' du jour';
}


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
    + '<a href="https://voyageshalal.fr/horaires-priere?utm_source=islampasapas&utm_medium=contenu&utm_campaign=rendez-vous">voyageshalal.fr</a>.</p>'
    + '</div>';
  zone.hidden = false;

  zone.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-m]') : null;
    if (!b || !zone.contains(b)) { return; }
    var id = b.getAttribute('data-m');
    var choisi = id ? IPP.enregistrerMoment(id) : null;
    if (!id) { IPP.refuserMoment(); }
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

  // « Commencer : Les six piliers de la foi » DOIT commencer cette lecon.
  // Avant le 14 aout, ce bouton se contentait de reveler la carte du jour, qui
  // portait un SECOND bouton « Commencer → » : deux « Commencer » d'affilee, et
  // le premier mentait un peu. L'appui de trop a ete trouve en chronometrant,
  // pas en relisant le code.
  q('diag-go').addEventListener('click', function () {
    var suite = IPP.leconDuJour();
    if (suite && suite.lecon && suite.lecon.url) {
      window.location.href = suite.lecon.url;
      return;
    }
    // Rien a proposer aujourd'hui : le bouton dit « Voir mon chemin », il y va.
    zone.hidden = true;
    if (typeof quandFini === 'function') { quandFini(); }
  });

  afficher();
}

/* ------------------------------------------------------------------------
   LE QCM — dix questions tirees des lecons, et rien d'autre

   Les questions existaient deja : trois par lecon, ecrites, relues, sourcees,
   et ENFERMEES — on ne pouvait en rencontrer une qu'en refaisant la lecon
   entiere. `questions.js` les rassemble (genere par outils/faire-questions.py,
   jamais ecrit a la main). Ici, on ne fait que les rejouer.

   LA REGLE QUI NE BOUGE PAS : un score est un COMPTEUR, pas un jugement.
   Pas de « rate », pas de pourcentage, pas de rouge. On dit ce qui est
   retrouve, et on dit que le reste reviendra — c'est tout ce qu'un compteur
   a le droit de dire sur un sujet religieux.

   D'abord les lecons deja faites : interroger quelqu'un sur ce qu'il n'a
   jamais lu, ce n'est pas une revision, c'est un piege.
   ------------------------------------------------------------------------ */

var IPP_QUIZ_PAR_TOUR = 10;

/* LE TIRAGE D'UN TOUR : IL DOIT RESSEMBLER AU SITE.
   -------------------------------------------------
   MESURE DU 20 AOUT. 60 des 83 questions portent sur les sourates, parce que
   21 des 29 lecons sont des sourates. Un melange au hasard donnait donc, sur
   200 tours simules : 7,1 questions du meme theme en moyenne, 3,3 themes par
   tour, et des tours entiers ou LES DIX questions sortaient d'un seul theme.
   Quelqu'un venu apprendre la priere pouvait jouer dix questions de sourate
   d'affilee, et ne rien reconnaitre de ce qu'il etait venu chercher.

   On tire donc A TOUR DE ROLE : une question dans chaque parcours, puis on
   recommence. Meme mesure apres : 7 themes par tour, jamais plus de 2 du
   meme.

   CE QU'ON NE CASSE PAS AU PASSAGE : les lecons deja faites restent
   prioritaires. Le tour de role s'applique d'abord a elles, ensuite au reste.
   Quelqu'un qui n'a fait que des sourates continue donc d'etre interroge sur
   les sourates — c'est ce qu'il a appris. L'equilibrage ne sert que quand le
   site choisit a la place de la personne. */

function ippMelangerListe(l) {
  'use strict';
  var a = l.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function ippParcoursDe(id) {
  'use strict';
  var c = (typeof IPP !== 'undefined' && IPP.CATALOGUE) ? IPP.CATALOGUE : [];
  for (var i = 0; i < c.length; i++) {
    if (c[i].id === id) { return c[i].parcours || '?'; }
  }
  return '?';
}

function ippPuiserATourDeRole(liste, out, combien) {
  'use strict';
  var seaux = {}, ordre = [], i, t;
  for (i = 0; i < liste.length; i++) {
    t = ippParcoursDe(liste[i].lecon);
    // hasOwnProperty et pas `!seaux[t]` : un parcours qui s'appellerait
    // « constructor » trouverait une fonction la ou on attend un tableau.
    if (!Object.prototype.hasOwnProperty.call(seaux, t)) { seaux[t] = []; ordre.push(t); }
    seaux[t].push(liste[i]);
  }
  while (out.length < combien) {
    var pris = 0;
    for (i = 0; i < ordre.length && out.length < combien; i++) {
      if (seaux[ordre[i]].length) { out.push(seaux[ordre[i]].shift()); pris++; }
    }
    if (!pris) { break; }   // plus rien a puiser : on sort, jamais de boucle infinie
  }
}

function ippTirerQuiz(banque, combien) {
  'use strict';
  var faites = [], reste = [], i, f;
  for (i = 0; i < banque.length; i++) {
    f = false;
    try { f = IPP.estFaite(banque[i].lecon); } catch (e) { f = false; }
    (f ? faites : reste).push(banque[i]);
  }
  var out = [];
  ippPuiserATourDeRole(ippMelangerListe(faites), out, combien);
  ippPuiserATourDeRole(ippMelangerListe(reste), out, combien);
  return out;
}


function ippDemarrerQuiz(racine) {
  'use strict';
  var q = ippViseur(racine);
  var banque = (typeof IPP_QUESTIONS !== 'undefined' && IPP_QUESTIONS) ? IPP_QUESTIONS : [];
  if (!q('quiz-carte') || !banque.length) { return; }

  var intro = q('quiz-intro');
  var carte = q('quiz-carte');
  var bas = q('quiz-bas');
  var fin = q('quiz-fin');
  var sansjs = q('quiz-sansjs');
  if (sansjs) { sansjs.hidden = true; }

  /* UNE SEANCE DOIT POUVOIR SE TERMINER GAGNEE.
     Avant : une reponse fausse etait expliquee, puis on passait. Ca a l'air
     bienveillant et ca ne l'est pas — tant que la question ne revient pas,
     l'erreur reste une erreur, et la personne finit a 2 sur 10 sans aucun
     moyen d'y changer quoi que ce soit. Ce n'est pas une punition, c'est pire :
     c'est un plafond.
     Desormais la question manquee REVIENT a la fin du tour, UNE SEULE FOIS.
     Deux passages au maximum : une question qui revient sans fin est une cage.
     Et on joue une LISTE ou l'on ajoute au bout, pas un compteur : la barre
     s'allonge, elle ne recule jamais. Voir une barre reculer, c'est perdre
     quelque chose, et on ne fait rien perdre a personne. */
  var tirage = [], pos = 0, justes = 0, rattrapees = 0, manquees = [], distinctes = 0;

  function melanger(l) {
    var a = l.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Les questions des lecons faites d'abord, les autres ensuite. Si rien n'a
     ete fait, tout le site est eligible : la page ne reste jamais vide.
     Le partage et l'equilibrage vivent dans ippTirerQuiz, hors de cette
     fonction, pour qu'on puisse les MESURER sans jouer un tour entier. */
  function tirer() {
    return ippTirerQuiz(banque, IPP_QUIZ_PAR_TOUR);
  }

  function afficher() {
    var item = tirage[pos];
    q('quiz-rang').textContent = 'Question ' + (pos + 1) + ' sur ' + tirage.length
      + (item.reprise ? ' \u2014 on la revoit' : '');
    q('quiz-titre').innerHTML = item.q;
    var choix = q('quiz-choix');
    choix.innerHTML = '';
    var options = melanger([item.bonne].concat(item.autres));
    for (var i = 0; i < options.length; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'q-opt';
      b.innerHTML = options[i];
      b.setAttribute('data-val', options[i]);
      choix.appendChild(b);
    }
    q('quiz-retour').hidden = true;
    var src = q('quiz-source');
    if (src) { src.hidden = true; }
    bas.hidden = true;
  }

  function repondre(bouton) {
    var item = tirage[pos];
    var choisie = bouton.getAttribute('data-val');
    var bonne = choisie === item.bonne;
    if (bonne) {
      if (item.reprise) { rattrapees++; } else { justes++; }
    } else if (!item.reprise) {
      // Plus loin, jamais juste apres : une question reposee dans la foulee de
      // son explication ne fait rien retenir. Elle part au bout de la liste.
      var encore = {};
      for (var k in item) { if (Object.prototype.hasOwnProperty.call(item, k)) { encore[k] = item[k]; } }
      encore.reprise = true;
      tirage.push(encore);
    } else {
      manquees.push(item);
    }

    var tous = q('quiz-choix').querySelectorAll('.q-opt');
    for (var i = 0; i < tous.length; i++) {
      tous[i].disabled = true;
      if (tous[i].getAttribute('data-val') === item.bonne) {
        tous[i].classList.add('juste');
      } else if (tous[i] === bouton) {
        tous[i].classList.add('faux');
      }
    }

    var r = q('quiz-retour');
    r.innerHTML = (bonne ? '' : 'La reponse etait&nbsp;: <strong>' + item.bonne + '</strong>. ')
                + (item.quoi || '');
    r.hidden = false;

    var src = q('quiz-source');
    if (src) {
      src.href = item.url;
      src.textContent = 'Revoir : ' + item.titreLecon;
      src.hidden = false;
    }

    if (typeof ippSonner === 'function') { ippSonner(bonne ? 'bon' : 'presque'); }
    bas.hidden = false;
    q('quiz-suivant').textContent = (pos + 1 < tirage.length) ? 'Suivant' : 'Voir le total';
    q('quiz-suivant').focus({ preventScroll: true });
  }

  function terminer() {
    carte.hidden = true;
    bas.hidden = true;
    fin.hidden = false;
    /* Le compte final enonce le FAIT EXACT : ce qui est su a la fin, sur le
       nombre de questions distinctes — pas sur la longueur de la liste, qui a
       grandi avec les reprises. Et « sans faute » reste reserve au premier
       essai : un score gonfle en silence est un compliment invente. */
    var sus = justes + rattrapees;
    q('quiz-score').textContent = sus + ' sur ' + distinctes;

    /* Ce que le site a le droit de dire : ce qui est su, et ce qui revient.
       Jamais un jugement, jamais un reproche, quel que soit le chiffre. */
    var mot;
    if (sus === distinctes && rattrapees === 0) {
      mot = 'Sans faute, du premier coup. Reviens demain, les questions changeront.';
    } else if (sus === distinctes) {
      mot = 'Tout est retrouve, dont ' + rattrapees
          + (rattrapees > 1 ? ' a la reprise.' : ' a la reprise.')
          + ' La reprise compte autant que le premier coup.';
    } else if (sus === 0) {
      mot = 'Ces questions viennent des lecons. Ouvre-en une, et elles '
          + 'deviendront faciles — c\'est fait pour.';
    } else {
      mot = 'Tu as retrouve ' + sus + ' reponse' + (sus > 1 ? 's' : '')
          + (rattrapees ? ', dont ' + rattrapees + ' a la reprise' : '')
          + '. Les autres sont dans leurs lecons, elles reviendront.';
    }
    q('quiz-mot').textContent = mot;

    var zone = q('quiz-revoir');
    zone.innerHTML = '';
    var vus = {};
    for (var i = 0; i < manquees.length; i++) {
      var m = manquees[i];
      if (vus[m.lecon]) { continue; }
      vus[m.lecon] = true;
      var a = document.createElement('a');
      a.className = 'lien-discret lien-bas';
      a.href = m.url;
      a.textContent = 'Revoir : ' + m.titreLecon;
      zone.appendChild(a);
    }
  }

  q('quiz-choix').addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.q-opt') : null;
    if (!b || b.disabled) { return; }
    repondre(b);
  });

  q('quiz-suivant').addEventListener('click', function () {
    pos++;
    if (pos >= tirage.length) { terminer(); return; }
    afficher();
    carte.setAttribute('tabindex', '-1');
    carte.focus({ preventScroll: true });
  });

  function lancer() {
    tirage = tirer();
    distinctes = tirage.length;
    pos = 0; justes = 0; rattrapees = 0; manquees = [];
    if (intro) { intro.hidden = true; }
    fin.hidden = true;
    carte.hidden = false;
    afficher();
  }

  q('quiz-rejouer').addEventListener('click', lancer);

  // Le bouton d'entree : il remplace « Voir les lecons » des que JS tourne.
  var go = q('quiz-go');
  if (go) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn';
    b.textContent = 'Commencer les dix questions';
    b.addEventListener('click', lancer);
    go.parentNode.replaceChild(b, go);
  }
}
