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

   Les pages couvrent les gabarits du site : l'accueil et sa liste, une page
   qui se lit, une couverture de section, et un ecran de reglages.

   CE QUI MANQUAIT, ET CE QUE CA A COUTE
   -------------------------------------
   La couverture visitee etait `section/la-priere` — une section SANS lecons.
   Or le 20 septembre, 38 pastilles de lecons ont ete posees sur
   `section/sens-des-sourates`, la seule couverture qui en porte. Mesure du
   28 septembre : 34 px de haut, 8 px d'ecart, sur une cible de 44. Trente-
   huit liens sous la regle du site, pendant huit jours, sans qu'aucun
   controle ne bronche — parce que le seul ecran concerne n'etait pas dans
   cette liste.

   La lecon : une liste de pages choisies « par gabarit » vieillit mal. Une
   page qui gagne un bloc neuf sort du gabarit qu'elle representait.
   `sens-des-sourates` y est desormais, et le controle refuse aussi les zones
   qui SE CHEVAUCHENT : etendre une zone tactile trop loin ne repare rien, ca
   deplace la faute. On ne rate plus la cible, on en touche une autre.
   ========================================================================== */

import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PAGES = ['index.html', 'sections.html', 'sourates.html',
               'lecon-sourate-al-ikhlas.html', 'section/la-priere', 'plus.html',
               // La seule couverture qui porte les 38 pastilles de lecons.
               'section/sens-des-sourates', 'progres.html',
               // LA PAGE 404, enfin joignable : `servir.py` la sert depuis
               // le 1er octobre, comme le fait la production. Personne ne
               // l'avait jamais vue s'afficher — c'est pourtant la page sur
               // laquelle tombe quelqu'un qui s'est perdu.
               'une-adresse-qui-n-existe-pas'];

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE });
const contexte = await navigateur.newContext({ viewport: { width: 360, height: 640 } });
await brancherPolices(contexte);
const p = await contexte.newPage();

let cible = 0;
for (const u of PAGES) {
  await p.goto(`http://127.0.0.1:8899/${u}`, { waitUntil: 'networkidle' });
  await attendrePolices(p);
  const r = await p.evaluate(() => {
    const de = document.documentElement;
    const c = parseFloat(getComputedStyle(de).getPropertyValue('--cible')) || 0;
    const petits = [];
    const zones = [];
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
      zones.push({ nom: (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 18),
        g: b.left, d: b.right, ht: b.top + b.height / 2 - h / 2, hb: b.top + b.height / 2 + h / 2 });
    }

    // DEUX ZONES NE DOIVENT PAS SE MORDRE. Etendre une zone tactile au-dela
    // de ce que l'ecart permet ne repare pas la cible trop petite : ca la
    // deplace sur la voisine. On ne rate plus, on se trompe — et c'est pire.
    const chevauchent = [];
    for (let i = 0; i < zones.length && chevauchent.length < 4; i += 1) {
      for (let j = i + 1; j < zones.length && chevauchent.length < 4; j += 1) {
        const a = zones[i], b = zones[j];
        const dx = Math.min(a.d, b.d) - Math.max(a.g, b.g);
        const dy = Math.min(a.hb, b.hb) - Math.max(a.ht, b.ht);
        if (dx > 0.5 && dy > 0.5) {
          chevauchent.push(`« ${a.nom} » et « ${b.nom} » sur ${Math.round(dy)} px`);
        }
      }
    }
    return { cible: c, petits, chevauchent };
  });
  cible = r.cible;
  if (!r.cible) {
    fautes.push(`${u} : --cible n'est pas defini`);
  }
  for (const x of r.petits) {
    fautes.push(`${u} : ${x} — sous la cible de ${r.cible} px`);
  }
  for (const x of r.chevauchent || []) {
    fautes.push(`${u} : deux zones tactiles se chevauchent — ${x}. `
      + 'Une zone etendue trop loin deplace la faute au lieu de la reparer.');
  }
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
// Compte, pas annonce : la liste a grossi de six a huit pages ce soir, et
// la phrase disait toujours « six ».
console.log(`  ${PAGES.length} pages a 360 px : tout ce qui se touche atteint ${cible} px,`);
console.log('  zones etendues comprises, et aucune ne mord sur sa voisine.');
