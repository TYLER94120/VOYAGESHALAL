/* ==========================================================================
   A PROPOS — la methode, les sources, l'export
   --------------------------------------------------------------------------
   L'export/import est la SEULE sauvegarde possible sans compte (section 9).
   On le dit clairement, une fois, sans alarmer.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  var h = '';
  h += '<div class="pile-11"><h2 class="t-bloc">Comment c\'est fait</h2>'
    + '<p>Chaque question sort d\'une source vérifiable : un verset avec sa sourate '
    + 'et son numéro, ou un hadith avec son recueil, son rapporteur et son numéro. '
    + 'Sans source, la question ne sort pas.</p>'
    + '<p>Les traductions en français sont des <strong>traductions du sens</strong>, '
    + 'pas le Coran lui-même. Celle utilisée ici est celle de Muhammad Hamidullah.</p>'
    + '<p>Quand les savants divergent, la question le dit et ne tranche pas. '
    + 'Pour un cas personnel, adresse-toi à un savant.</p></div>';

  h += '<div class="pile-11"><h2 class="t-bloc">Ta progression</h2>'
    + '<p>Elle reste sur ce téléphone, dans ce navigateur. Il n\'y a pas de compte, '
    + 'pas d\'inscription, pas d\'adresse e-mail, et rien n\'est envoyé nulle part.</p>'
    + '<p>C\'est pratique, et ça a une conséquence : si tu changes de téléphone ou '
    + 'que tu effaces les données du navigateur, ta progression part avec. '
    + 'Le fichier ci-dessous est la seule façon de la garder.</p>'
    + '<button type="button" class="bouton-2" id="exporter">Enregistrer ma progression</button>'
    + '<label class="bouton-2" for="fichier" style="cursor:pointer">Recharger une progression</label>'
    + '<input type="file" id="fichier" accept="application/json" class="invisible">'
    + '<p class="c-meta" id="dit"></p></div>';

  h += '<div class="pile-11"><h2 class="t-bloc">Ce qu\'on ne fait pas</h2>'
    + '<p>Aucune publicité, aucun traceur, aucun cookie de mesure. '
    + 'Aucun classement entre utilisateurs, aucune notification de rappel.</p></div>';

  document.getElementById('plus').innerHTML = h;

  document.getElementById('exporter').addEventListener('click', function () {
    var texte = M.exporter(M.charger());
    var lien = document.createElement('a');
    lien.href = URL.createObjectURL(new Blob([texte], { type: 'application/json' }));
    lien.download = 'islampasapas-progression.json';
    lien.click();
    URL.revokeObjectURL(lien.href);
    document.getElementById('dit').textContent = 'Fichier enregistré.';
  });

  document.getElementById('fichier').addEventListener('change', function () {
    var f = this.files && this.files[0];
    if (!f) { return; }
    var lecteur = new FileReader();
    lecteur.onload = function () {
      try {
        var d = M.importer(String(lecteur.result));
        M.ranger(d);
        document.getElementById('dit').textContent = 'Progression rechargée.';
      } catch (e) {
        // On dit ce qui ne va pas, on n'ecrase surtout pas ce qui est en place.
        document.getElementById('dit').textContent =
          'Ce fichier n\'a pas pu être lu. Ta progression actuelle n\'a pas été touchée.';
      }
    };
    lecteur.readAsText(f);
  });
}());
