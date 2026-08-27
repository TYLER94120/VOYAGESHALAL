/* ==========================================================================
   LE CHEMIN — les douze sections sur un trajet, pas dans une liste
   --------------------------------------------------------------------------
   A CONTENU IDENTIQUE, LE CHEMIN BAT LA LISTE. Douze sections dans une grille
   disent « il n'y en a que douze ». Les MEMES douze sur un trajet vertical qui
   serpente disent « voila ou tu en es ». C'est la forme qu'ont prise toutes
   les applications d'apprentissage, et ce n'est pas une mode : une liste se
   parcourt du regard, un trajet se remonte.

   TROIS DEFAUTS CONNUS, ET COMMENT ILS SONT EVITES ICI
   ---------------------------------------------------
   1. LA DECORATION NE DOIT JAMAIS DEPENDRE DE LA TAILLE DU CONTENU. Un `<svg>`
      en `width: 100%` avec `preserveAspectRatio="none"` s'etire sur tout
      l'ecran : le trait devient un ruban. Le trace est donc construit APRES
      la mise en page, a partir des positions reelles des medaillons, et le
      `<svg>` recoit une hauteur ET une largeur en pixels.

   2. ON NE FAIT PAS SERPENTER LES CARTES, seulement le trait et les
      medaillons. Un retrait variable applique aux blocs de texte donne un
      bord gauche en dents de scie qui se lit comme un defaut d'affichage.
      Ici le medaillon se decale ; le nom, lui, reste dans sa colonne.

   3. L'ORDRE AFFICHE EST L'ORDRE CONSEILLE. C'est `num` dans
      data/sections.json, du plus general au plus precis, et pas l'ordre
      d'arrivee des fichiers.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;
  var GEO = window.IPAP_GEO;

  /* Le decalage horizontal des medaillons, en pixels. Un motif court qui se
     repete : on descend, on va a droite, on revient. TOUS POSITIFS, et tous
     dans une BANDE de largeur fixe reservee au medaillon.

     Deux fautes evitees ici, vues a l'ecran le 25 aout :
     — un decalage negatif sortait le medaillon hors de l'ecran a gauche ;
     — surtout, `transform: translateX` deplace le dessin SANS deplacer la
       mise en page : le medaillon glissait PAR-DESSUS le nom de section, et
       on lisait « iliers de la foi ». Le decalage est donc une marge dans une
       bande, et le nom commence toujours apres la bande. */
  var DECALAGES = [0, 20, 40, 58, 40, 20];

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function espacer(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* L'etat d'une etape. Trois seulement, et aucun n'est un reproche :
     `ouverte` (il y a des questions), `commencee` (on y a deja repondu juste
     au moins une fois), `bientot` (la section n'a pas encore de questions). */
  function etat(sec, pc, nb) {
    if (!nb) { return 'bientot'; }
    return pc > 0 ? 'commencee' : 'ouverte';
  }

  /* LE TRACE, construit sur les positions REELLES. On lit le centre de chaque
     medaillon apres la mise en page, et on relie les centres par des courbes.
     Le `<svg>` recoit ses deux dimensions en pixels : il ne peut donc pas
     s'etirer, quel que soit le nombre d'etapes ou la largeur de l'ecran. */
  function tracer(zone) {
    var vieux = zone.querySelector('.chemin-trait');
    if (vieux) { vieux.parentNode.removeChild(vieux); }

    var ronds = zone.querySelectorAll('.etape-rond');
    if (ronds.length < 2) { return; }
    var base = zone.getBoundingClientRect();
    var pts = [];
    for (var i = 0; i < ronds.length; i++) {
      var b = ronds[i].getBoundingClientRect();
      pts.push([b.left - base.left + b.width / 2, b.top - base.top + b.height / 2]);
    }

    var L = Math.round(base.width), H = Math.round(base.height);
    if (!L || !H) { return; }
    var d = '';
    for (var k = 0; k < pts.length - 1; k++) {
      var a = pts[k], c = pts[k + 1];
      var my = (a[1] + c[1]) / 2;
      d += 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1)
        + ' C' + a[0].toFixed(1) + ' ' + my.toFixed(1)
        + ' ' + c[0].toFixed(1) + ' ' + my.toFixed(1)
        + ' ' + c[0].toFixed(1) + ' ' + c[1].toFixed(1) + ' ';
    }
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'chemin-trait');
    svg.setAttribute('width', L);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + L + ' ' + H);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path d="' + d.trim() + '" fill="none" stroke="#D6CEBC" '
      + 'stroke-width="3" stroke-linecap="round" stroke-dasharray="1 11"/>';
    zone.insertBefore(svg, zone.firstChild);
  }

  function poser(zone, sections, lots, d) {
    var h = '';
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i], l = lots[i];
      var pc = l.ids.length ? M.maitrise(d, l.ids) : 0;
      var e = etat(s, pc, l.ids.length);
      var dec = DECALAGES[i % DECALAGES.length];
      var marque = GEO && s.branches
        ? GEO.rosette(30, s.branches, s.ratio, e === 'bientot' ? '#8E9A93' : '#E3C97A', 1)
        : '';

      // Une section sans questions n'est PAS un lien : elle ouvrirait sur
      // « rien a jouer ». Elle reste sur le chemin — on voit qu'elle existe et
      // qu'elle vient — mais elle ne promet pas une page.
      var ouvrant = e === 'bientot' ? '<div class="etape"' : '<a class="etape" href="section/' + ech(s.slug) + '"';
      var fermant = e === 'bientot' ? '</div>' : '</a>';

      h += ouvrant + ' data-etat="' + e + '">'
        + '<span class="etape-bande">'
        + '<span class="etape-rond" style="margin-left:' + dec + 'px">'
        + marque
        + (pc > 0 ? '<span class="etape-pc">' + pc + '%</span>' : '')
        + '</span></span>'
        + '<span class="etape-quoi">'
        + '<span class="etape-nom">' + ech(s.nom) + '</span>'
        + '<span class="etape-nb">'
        + (l.ids.length ? espacer(l.ids.length) + ' questions' : 'bientôt')
        + '</span></span>'
        + fermant;
    }
    zone.innerHTML = h;
    tracer(zone);
    // La largeur change avec l'orientation du telephone : le trace se refait,
    // il n'est jamais etire.
    if (!zone.__suivi) {
      zone.__suivi = true;
      window.addEventListener('resize', function () { tracer(zone); });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { tracer(zone); });
      }
    }
  }

  window.IPAP_CHEMIN = { poser: poser };
}());
