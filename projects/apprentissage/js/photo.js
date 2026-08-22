/* ==========================================================================
   LES EMPLACEMENTS PHOTO — cahier des charges V2, section 6
   --------------------------------------------------------------------------
   TROIS ENDROITS, PAS UN DE PLUS : la couverture de section, la carte-photo,
   le bandeau du resultat. Pas de photo en fond d'ecran, pas de photo dans les
   tuiles, pas de photo dans le corrige.

   CE QUI N'Y ENTRE JAMAIS (section 2) : aucun etre vivant, aucune
   representation de prophete, de compagnon ou d'ange, aucune image produite
   par une machine. Une seule image fausse — une Kaaba de travers, une
   calligraphie illisible — detruit la credibilite d'un site qui cite
   al-Bukhari avec son numero.

   TANT QU'UNE PHOTO N'EST PAS OBTENUE, ON GARDE SON EMPLACEMENT (6.4) : meme
   fond, meme carrelage, meme voile, meme hauteur. On y pose la rosace de la
   section en attendant. Ce qui reste a sourcer se lit dans /motifs.html.

   Une image n'entre ici QUE si son origine, sa licence et son auteur sont
   ecrits dans data/images.json. Pas de licence tracee, pas d'image.
   ========================================================================== */

'use strict';

(function () {
  var CATALOGUE = null;   // pose par charger(), lu de data/images.json

  function ech(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function charger() {
    if (CATALOGUE) { return Promise.resolve(CATALOGUE); }
    return fetch('data/images.json')
      .then(function (r) { return r.ok ? r.json() : {}; })
      ['catch'](function () { return {}; })
      .then(function (j) { CATALOGUE = j || {}; return CATALOGUE; });
  }

  /* Une entree complete, ou rien. Une image sans alt, sans credit ou sans
     licence est traitee comme absente : mieux vaut un emplacement vide
     qu'une image dont on ne sait pas d'ou elle vient. */
  function fiche(cle) {
    var f = CATALOGUE && CATALOGUE[cle];
    if (!f || !f.fichier || !f.alt || !f.licence || !f.credit) { return null; }
    return f;
  }

  /* L'image elle-meme : AVIF d'abord, WebP en repli, deux densites (6.3).
     Le nom de base est donne sans extension dans le catalogue. */
  function image(f, lazy) {
    var b = ech(f.fichier);
    return '<picture>'
      + '<source type="image/avif" srcset="' + b + '.avif 1x, ' + b + '@2x.avif 2x">'
      + '<source type="image/webp" srcset="' + b + '.webp 1x, ' + b + '@2x.webp 2x">'
      + '<img src="' + b + '.webp" alt="' + ech(f.alt) + '"'
      + (lazy === false ? '' : ' loading="lazy"') + ' decoding="async">'
      + '</picture>';
  }

  /* UN PANNEAU ENLUMINE PLUTOT QU'UN PENSE-BETE.
     Le cahier (6.4) veut qu'on montre l'emplacement tant qu'il n'y a pas de
     photo : on ne fait pas croire qu'une page est finie. Mais « PHOTO A
     SOURCER » en pointille est une note de chantier, et elle s'affichait en
     haut des douze couvertures, pour tout le monde.
     L'emplacement reste entier — meme fond, meme carrelage, meme voile, meme
     hauteur : une photo s'y posera sans que rien ne bouge. En attendant, on y
     met la rosace de la section. L'inventaire de ce qui manque est dans
     /motifs.html, la ou il sert. */
  function ornement(motif) {
    if (!motif || !window.IPAP_GEO) { return ''; }
    return '<div class="photo-ornement" aria-hidden="true">'
      + '<span data-rosace="' + motif.branches + '" data-ratio="' + motif.ratio
      + '" data-taille="300" data-couleur="#E3C97A" data-trait="1.1"></span>'
      + '</div>';
  }

  /* o.cle       clef dans data/images.json
     o.hauteur   en px ; 328 couverture, 244 carte-photo, 148 resultat
     o.rayon     rayon des coins, en px
     o.dessus    HTML pose PAR-DESSUS le voile (titre, verset, bouton retour)
     o.premiere  vrai si c'est la premiere image visible : pas de `lazy`
     o.motif     { branches, ratio } de la section : la rosace posee en
                 attendant la photo. Sans lui, l'emplacement reste nu. */
  function bloc(o) {
    var f = fiche(o.cle);
    var st = 'height:' + (o.hauteur || 244) + 'px'
      + (o.rayon !== undefined ? ';border-radius:' + o.rayon + 'px' : '');
    return '<div class="photo"' + (o.dessus ? ' data-dessus="oui"' : '') + ' style="' + st + '">'
      + '<div class="fond-motif" data-carrelage="#E3C97A" data-op="0.20"'
      + ' data-tuile="72" data-r="17" aria-hidden="true"></div>'
      + (f ? image(f, !o.premiere) : ornement(o.motif))
      + '<div class="photo-voile" aria-hidden="true"></div>'
      + (o.dessus ? '<div class="photo-dessus">' + o.dessus + '</div>' : '')
      + '</div>';
  }

  /* CE QUI MANQUE ENCORE, pour /motifs.html : les emplacements attendus par
     le site et qui n'ont pas de photo complete dans le catalogue. C'est la
     que le proprietaire du site va voir ce qu'il reste a sourcer, plutot que
     sur chaque couverture. */
  function manquants(cles) {
    var out = [];
    for (var i = 0; i < cles.length; i++) {
      if (!fiche(cles[i])) { out.push(cles[i]); }
    }
    return out;
  }

  /* Ce qu'il faut afficher dans /plus : crédit et licence de chaque image
     réellement utilisée (6.3). */
  function credits() {
    var out = [];
    for (var k in CATALOGUE) {
      if (!Object.prototype.hasOwnProperty.call(CATALOGUE, k)) { continue; }
      var f = fiche(k);
      if (f) { out.push({ cle: k, credit: f.credit, licence: f.licence, source: f.source || '' }); }
    }
    return out;
  }

  /* PRECHARGER L'IMAGE DE LA CARTE SUIVANTE (cahier V2, 7.3).
     Le premier atout du produit est qu'il n'y a aucun temps mort au geste :
     la carte suivante est deja montee dans le DOM. Une image qui commence a
     se charger au moment ou la carte arrive ruinerait cela. */
  var DEJA = {};

  function precharger(q) {
    if (!q || q.type !== 'photo') { return; }
    var f = fiche(q.image || '');
    if (!f || DEJA[f.fichier]) { return; }
    DEJA[f.fichier] = true;
    var i = new Image();
    i.decoding = 'async';
    i.src = f.fichier + '.webp';
  }

  window.IPAP_PHOTO = { charger: charger, bloc: bloc, fiche: fiche,
                        credits: credits, precharger: precharger,
                        manquants: manquants };
}());
