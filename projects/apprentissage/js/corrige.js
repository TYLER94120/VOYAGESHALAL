/* ==========================================================================
   LE CORRIGE COMPLET — ecran 9 du cahier des charges
   --------------------------------------------------------------------------
   Trois filtres en pastilles, « A revoir » actif par defaut. Le premier bloc
   ouvert, les suivants replies. Les questions justes sont la aussi, a 75 %
   d'opacite : on ne cache pas ce qui a ete reussi, on le met en retrait.

   CHAQUE QUESTION AFFICHE SA SOURCE. C'est la recette, point 11.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function param(n) {
    var m = new RegExp('[?&]' + n + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  var id = param('s');
  var d = M.charger();
  var session = null;
  for (var i = 0; i < d.sessions.length; i++) {
    if (d.sessions[i].id === id) { session = d.sessions[i]; }
  }
  if (!session) {
    document.getElementById('corps').innerHTML =
      '<h1 class="t-page">Corrigé introuvable</h1><p style="margin-top:12px">'
      + 'Cette partie n\'est pas dans la mémoire de ce téléphone. '
      + '<a href="sections.html">Revenir aux sections</a>.</p>';
    return;
  }

  // Le dernier passage decide, mais on retient ce qui a ete rate au moins
  // une fois : c'est ce qu'il faut revoir.
  var dernier = {}, bute = {}, ordre = [];
  var detail = session.detail || [];
  for (var j = 0; j < detail.length; j++) {
    var r = detail[j];
    if (!Object.prototype.hasOwnProperty.call(dernier, r.id)) { ordre.push(r.id); }
    dernier[r.id] = r;
    if (r.juste === false) { bute[r.id] = true; }
  }

  var filtre = 'revoir';

  fetch('data/questions/' + session.section + '.json')
    .then(function (x) { return x.ok ? x.json() : []; })
    .catch(function () { return []; })
    .then(function (banque) {
      var parId = {};
      for (var i = 0; i < banque.length; i++) { parId[banque[i].id] = banque[i]; }

      function visibles() {
        return ordre.filter(function (qid) {
          if (filtre === 'toutes') { return true; }
          if (filtre === 'revoir') { return bute[qid]; }
          return !bute[qid];
        });
      }

      function bloc(qid, ouvert) {
        var q = parId[qid];
        if (!q) { return ''; }
        var r = dernier[qid];
        var rate = !!bute[qid];
        var h = '<div class="rev" data-ouvert="' + (ouvert ? 'oui' : 'non') + '"'
          + (rate ? '' : ' data-juste="oui"') + '>';
        h += '<button type="button" class="rev-tete" aria-expanded="' + (ouvert ? 'true' : 'false')
          + '" data-q="' + ech(qid) + '">'
          + '<span class="rev-etat" data-t="' + (rate ? 'rate' : 'juste') + '">'
          + (rate ? 'Réponse fausse' : 'Juste') + '</span>'
          + '<span class="rev-q">' + ech(q.question) + '</span></button>';
        h += '<div class="rev-corps">';
        if (q.arabe) {
          // Le mot vise doit rester visible dans le corrige : sans lui, on
          // relit une question de vocabulaire sans savoir de quel mot elle
          // parlait.
          var av = ech(q.arabe);
          if (q.surligne) {
            var sm = ech(q.surligne), si = av.indexOf(sm);
            if (si >= 0) {
              av = av.slice(0, si) + '<mark class="mot-vise">' + sm + '</mark>'
                + av.slice(si + sm.length);
            }
          }
          h += '<div class="carte-arabe" lang="ar" dir="rtl">' + av + '</div>';
        }
        // Le glyphe d'une question de calligraphie : la revoir sans lui ne
        // veut rien dire, on ne saurait pas de quelle lettre on parle.
        if (q.type === 'calligraphie' && q.glyphe) {
          h += '<div class="rev-glyphe" lang="ar" dir="rtl">' + ech(q.glyphe) + '</div>';
        }
        // Une carte-photo se revoit en VIGNETTE de 64 px (V2 7.3), pas en
        // pleine image : le corrige est une liste qu'on parcourt, pas une
        // galerie.
        if (q.type === 'photo' && window.IPAP_PHOTO) {
          var fp = window.IPAP_PHOTO.fiche(q.image || '');
          if (fp) {
            h += '<div class="rev-vignette">' + window.IPAP_PHOTO.bloc({
              cle: q.image, hauteur: 64, rayon: 10
            }) + '</div>';
          }
        }
        if (rate && r && typeof r.choix === 'number' && r.choix !== q.bonne) {
          h += '<p class="rev-ligne" data-t="choix"><b>Ta réponse :</b> ' + ech(q.reponses[r.choix]) + '</p>';
        }
        h += '<p class="rev-ligne" data-t="bonne"><b>La bonne :</b> ' + ech(q.reponses[q.bonne]) + '</p>';
        h += '<p class="rev-expl">' + ech(q.explication) + '</p>';
        if (q.divergence) {
          h += '<p class="f-divergence">Les savants divergent : ' + ech(q.divergence) + '</p>';
        }
        h += '<p class="rev-source">' + ech(q.source) + '</p>';
        h += '</div></div>';
        return h;
      }

      function dessiner() {
        var liste = visibles();
        var h = '';
        if (!liste.length) {
          h = '<p class="c-meta">'
            + (filtre === 'revoir' ? 'Rien à revoir dans cette partie.' : 'Aucune question ici.')
            + '</p>';
        } else {
          for (var i = 0; i < liste.length; i++) { h += bloc(liste[i], i === 0); }
        }
        document.getElementById('liste').innerHTML = h;
        var n = ordre.filter(function (q) { return bute[q]; }).length;
        var b = document.getElementById('rejouer');
        b.textContent = 'Rejouer ces ' + n + ' questions';
        b.hidden = n === 0;
      }

      document.getElementById('filtres').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b) { return; }
        filtre = b.getAttribute('data-f');
        var t = document.querySelectorAll('#filtres button');
        for (var i = 0; i < t.length; i++) {
          t[i].setAttribute('aria-pressed', t[i] === b ? 'true' : 'false');
        }
        dessiner();
      });

      document.getElementById('liste').addEventListener('click', function (e) {
        var t = e.target.closest('.rev-tete');
        if (!t) { return; }
        var bloc = t.parentNode;
        var ouvert = bloc.getAttribute('data-ouvert') === 'oui';
        bloc.setAttribute('data-ouvert', ouvert ? 'non' : 'oui');
        t.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      });

      document.getElementById('rejouer').addEventListener('click', function () {
        window.location.href = 'qcm.html?section=' + encodeURIComponent(session.section)
          + '&n=20&mode=apprentissage';
      });

      dessiner();
    });
}());
