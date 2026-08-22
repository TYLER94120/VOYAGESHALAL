/* ==========================================================================
   LES 12 SECTIONS — ecran 2 du cahier des charges
   --------------------------------------------------------------------------
   LE COMPTEUR DE QUESTIONS EST REEL, JAMAIS ANNONCE.
   La maquette montre « 1 670 questions » : c'est un exemple, pas une cible a
   recopier. Ici on compte ce qui existe vraiment dans les banques. Une
   section vide affiche « bientot », elle ne ment pas sur son contenu et elle
   n'est pas cliquable — proposer un QCM qui s'ouvre sur rien est pire que de
   dire qu'il n'est pas pret.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function espacer(n) {
    // 1670 -> « 1 670 », avec une espace insecable : un nombre ne se coupe
    // jamais en fin de ligne.
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  fetch('data/sections.json').then(function (r) { return r.json(); })
    .then(function (sections) {
      var d = M.charger();
      return Promise.all(sections.map(function (sec) {
        return fetch('data/questions/' + sec.slug + '.json')
          .then(function (x) { return x.ok ? x.json() : []; })
          .catch(function () { return []; })
          .then(function (b) {
            return {
              sec: sec,
              n: b.length,
              pc: M.maitrise(d, b.map(function (q) { return q.id; }))
            };
          });
      })).then(function (lots) { return { lots: lots, d: d }; });
    })
    .then(function (res) {
      var lots = res.lots, d = res.d;
      var total = 0, ouvertes = 0;
      for (var i = 0; i < lots.length; i++) {
        total += lots[i].n;
        if (lots[i].n) { ouvertes += 1; }
      }
      document.getElementById('total').textContent =
        espacer(total) + (total > 1 ? ' questions' : ' question')
        + ', dans ' + ouvertes + ' section' + (ouvertes > 1 ? 's' : '') + ' sur ' + lots.length;

      // --- Mes erreurs a revoir ---------------------------------------
      var aRevoir = M.aRevoir(d).length;
      if (aRevoir > 0) {
        document.getElementById('zone-erreurs').innerHTML =
          '<a class="ligne" href="qcm.html?section=erreurs" style="border-color:var(--or-bordure);background:var(--or-voile)">'
          + '<span class="rond" style="background:#fff;color:var(--or-texte-2)">'
          + icone('etoile', 20) + '</span>'
          + '<span class="milieu"><span class="nom">Mes erreurs à revoir</span>'
          + '<span class="c-meta">' + aRevoir + ' question' + (aRevoir > 1 ? 's' : '')
          + ', toutes sections confondues</span></span>'
          + '<span class="pc">&rsaquo;</span></a>';
      }

      // --- La grille des 12 -------------------------------------------
      var h = '';
      var GEO = window.IPAP_GEO;
      for (var k = 0; k < lots.length; k++) {
        var l = lots[k], s = l.sec;
        // LA ROSACE REMPLACE L'ICONE (cahier V2, §3.3). Une section se
        // reconnait desormais a son nombre de branches, pas a un pictogramme :
        // le meme motif se retrouve derriere le verset de ses cartes, et le
        // paquet devient reconnaissable sans qu'on ait a lire.
        // La rosace du JETON est doree : depuis que le jeton est vert profond,
        // un trace vert dessus ne se voyait plus du tout — douze carres verts
        // pleins, et le signe de la section perdu. Le FILIGRANE, lui, reste
        // vert : il se pose sur l'ivoire de la tuile, pas sur le jeton.
        var marque = GEO && s.branches
          ? GEO.rosette(28, s.branches, s.ratio, '#E3C97A', 1)
          : icone(s.icone, 20);
        var filigrane = GEO && s.branches
          ? '<span class="filigrane" aria-hidden="true">'
            + GEO.rosette(118, s.branches, s.ratio, '#0F5132', 1.4) + '</span>'
          : '';
        var dedans = filigrane
          + '<span class="rond">' + marque + '</span>'
          + '<span class="nom">' + ech(s.nom) + '</span>'
          + '<span class="nb">' + (l.n ? espacer(l.n) + ' question' + (l.n > 1 ? 's' : '')
            : 'bientôt') + '</span>'
          + (l.n ? '<div class="barre"><i style="width:' + Math.max(2, l.pc) + '%"'
            + (l.pc < 10 ? ' data-faible="oui"' : '') + '></i></div>' : '');
        if (l.n) {
          // Vers la COUVERTURE (cahier V2, §8), pas directement vers les
          // reglages : on voit d'abord ce qu'il y a dans la section.
          h += '<a class="tuile" href="section/' + ech(s.slug) + '">' + dedans + '</a>';
        } else {
          // Pas de lien : une section sans question n'a rien a montrer.
          // PAS D'OPACITE. Elle voilait aussi le TEXTE, qui tombait a
          // rgb(130,135,129) — plus clair que le plancher #5F6D66 et sous le
          // seuil WCAG. Une section a venir se signale par son cadre, pas en
          // rendant son nom penible a lire.
          h += '<div class="tuile" data-vide="oui">' + dedans + '</div>';
        }
      }
      document.getElementById('tuiles').innerHTML = h;
      if (window.IPAP_GEO) { window.IPAP_GEO.poserMotifs(document); }
    })
    .catch(function () {
      document.getElementById('total').textContent = 'Les sections n\'ont pas pu être chargées.';
    });
}());
