/* ==========================================================================
   A PROPOS — la methode, les sources, l'export
   --------------------------------------------------------------------------
   L'export/import est la SEULE sauvegarde possible sans compte (section 9).
   On le dit clairement, une fois, sans alarmer.
   ========================================================================== */

'use strict';

(function () {
  var M = window.IPAP_MEMOIRE;

  // LE TEXTE DE LA PAGE N'EST PLUS ICI. Il est ecrit dans `plus.html`, ou
  // un robot d'indexation et un navigateur sans JavaScript le lisent : c'est
  // la page qui dit d'ou vient ce que le site affirme, et elle ne rendait que
  // 216 caracteres. Ce fichier ne pose plus que ce qui a besoin de lui.
  //
  // LES DEUX BOUTONS SONT CREES ICI, PAS ECRITS DANS LA PAGE. Sans JavaScript
  // ils ne feraient rien ; un bouton qui ne fait rien est pire que pas de
  // bouton. Les deux paragraphes qui les expliquent, eux, restent vrais dans
  // tous les cas et sont donc dans le HTML.
  var zone = document.getElementById('sauvegarde');
  if (!zone) { return; }
  zone.innerHTML =
    '<button type="button" class="bouton-2" id="exporter">Enregistrer ma progression</button>'
    + '<label class="bouton-2" for="fichier" style="cursor:pointer">Recharger une progression</label>'
    + '<input type="file" id="fichier" accept="application/json" class="invisible">'
    + '<p class="c-meta" id="dit"></p>';

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
