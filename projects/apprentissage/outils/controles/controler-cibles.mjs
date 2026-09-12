/* ==========================================================================
   CONTROLE — tout ce qui se touche fait au moins `--cible`

   LA REGLE EST CELLE DU SITE, PAS UNE PREFERENCE IMPORTEE
   -------------------------------------------------------
   `--cible` vaut 44 px dans `base.css`. Le jeton existe depuis le cahier V2 :
   c'est la taille minimale d'une zone qu'on vise au pouce, et il est deja
   applique aux reponses du QCM, aux rangs des 114 sourates, aux pastilles de
   l'index des versets et au champ de recherche. Il n'etait verifie nulle part.

   Mesure du 12 septembre, a 360 px, sur six pages : deux elements passaient au
   travers — le lien de marque de l'en-tete (147 x 29) sur quatre pages, et le
   lien « Tout voir » de l'accueil (83 x 21). Les deux sont repares en etendant
   la ZONE TOUCHEE sans rien deplacer a l'ecran.

   CE QU'IL MESURE, ET POURQUOI C'EST SUBTIL
   -----------------------------------------
   Pas la taille du texte : la taille de ce qui RECOIT LE TOUCHER. Un lien de
   29 px de haut dont un pseudo-element etend la zone a 44 est conforme, et sa
   boite visible ne changera jamais. Le controle lit donc aussi `::after` quand
   il est absolu, exactement comme le navigateur le compte.

   Les six pages couvrent les quatre gabarits du site : l'accueil et sa liste,
   une page qui se lit, une couverture de section, et un ecran de reglages.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = ['index.html', 'sections.html', 'sourates.html',
               'lecon-sourate-al-ikhlas.html', 'section/la-priere', 'plus.html'];

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE });
const contexte = await navigateur.newContext({ viewport: { width: 360, height: 640 } });
const p = await contexte.newPage();

let cible = 0;
for (const u of PAGES) {
  await p.goto(`http://127.0.0.1:8899/${u}`, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const de = document.documentElement;
    const c = parseFloat(getComputedStyle(de).getPropertyValue('--cible')) || 0;
    const petits = [];
    for (const a of document.querySelectorAll('a, button')) {
      const b = a.getBoundingClientRect();
      if (b.width === 0 && b.height === 0) continue;   // cache : rien a viser
      let h = b.height;
      const ap = getComputedStyle(a, '::after');
      if (ap.content !== 'none' && ap.position === 'absolute'
          && parseFloat(ap.height) > h) {
        h = parseFloat(ap.height);
      }
      if (h < c - 0.5 || b.width < c - 0.5) {
        petits.push(`${(a.className || a.tagName).toString().split(' ')[0]} `
                  + `${Math.round(b.width)}x${Math.round(h)}`);
      }
    }
    return { cible: c, petits };
  });
  cible = r.cible;
  if (!r.cible) {
    fautes.push(`${u} : --cible n'est pas defini`);
  }
  for (const x of r.petits) {
    fautes.push(`${u} : ${x} — sous la cible de ${r.cible} px`);
  }
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log(`  Six pages a 360 px : tout ce qui se touche atteint ${cible} px,`);
console.log('  zones etendues comprises.');
