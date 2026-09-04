/* ==========================================================================
   CONTROLE — l'index des versets mene vraiment au bon verset

   POURQUOI CE CONTROLE EXISTE EN PLUS DE `controler-lecons.py`
   ------------------------------------------------------------
   Le controle en Python relit le HTML : il sait que le cinquieme bloc porte
   `id="verset-5"` et que l'index pointe vers `#verset-5`. C'est necessaire,
   ce n'est pas suffisant. Rien dans le HTML ne dit ou le navigateur ATTERRIT
   quand on clique : un `overflow` mal place sur un ancetre, un `position`
   qui cree un contexte de defilement, une hauteur nulle, et le clic ne bouge
   plus rien ou s'arrete au mauvais endroit. La page a l'air d'obeir.

   Ce n'est pas une crainte de principe : la veille, `position: sticky` sur
   le champ de recherche des 114 sourates n'a rien colle pour exactement
   cette raison — `.ecran` porte `overflow-y: auto`. Aucune lecture du HTML
   ne l'aurait dit ; il a fallu regarder.

   CE QU'IL VERIFIE
   ----------------
   1. Sur les lecons qui ont un index, un clic sur le numero i amene bien le
      verset i en haut de l'ecran — verifie sur le premier, un du milieu et
      le dernier, la ou un decalage d'un rang se verrait.
   2. Le verset vise n'est pas colle au bord haut : `scroll-margin-top` lui
      laisse de l'air, sinon on croit etre tombe au milieu du bloc precedent.
   3. Les pastilles de l'index se visent au pouce et ne debordent pas du
      cadre a 360 px.
   4. Une lecon courte n'a pas d'index : trois versets tiennent dans un
      ecran, un index y serait un controle qui ne sert a rien.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8899/';

// Une longue, une moyenne, une courte. La courte ne doit PAS avoir d'index.
const LONGUE = 'lecon-sourate-al-alaq.html';     // 19 versets
const MOYENNE = 'lecon-sourate-al-humaza.html';  //  9 versets
const COURTE = 'lecon-sourate-al-asr.html';      //  3 versets

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };

const navigateur = await chromium.launch({ executablePath: EXE });
const contexte = await navigateur.newContext({
  viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
const p = await contexte.newPage();

for (const page of [LONGUE, MOYENNE]) {
  await p.goto(BASE + page, { waitUntil: 'networkidle' });

  const k = await p.evaluate(() => document.querySelectorAll('.verset').length);
  const index = p.locator('.vindex a');
  verifier(await index.count() === k,
    `${page} : ${await index.count()} pastilles pour ${k} versets`);

  for (const i of [1, Math.ceil(k / 2), k]) {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.locator(`.vindex a[href="#verset-${i}"]`).click();
    await p.waitForTimeout(120);

    const r = await p.evaluate((n) => {
      const e = document.getElementById('verset-' + n);
      const b = e.getBoundingClientRect();
      // Quel bloc occupe reellement le haut de l'ecran ?
      const enHaut = [...document.querySelectorAll('.verset')]
        .filter((x) => x.getBoundingClientRect().bottom > 4)
        .map((x) => x.id)[0];
      return { haut: Math.round(b.top), enHaut,
               marge: parseFloat(getComputedStyle(e).scrollMarginTop) || 0 };
    }, i);

    verifier(r.enHaut === `verset-${i}`,
      `${page} : clic sur ${i} — c'est ${r.enHaut} qui arrive en haut`);
    verifier(r.haut >= 0 && r.haut <= 60,
      `${page} : clic sur ${i} — le verset se pose a ${r.haut} px du bord, `
      + 'attendu entre 0 et 60');
    verifier(r.marge > 0,
      `${page} : le verset ${i} n'a pas de scroll-margin-top, il se collera `
      + 'au bord de l\'ecran');
  }

  // 3. Les pastilles au pouce, et rien qui deborde.
  const past = await p.evaluate(() => {
    const de = document.documentElement;
    const cible = parseFloat(getComputedStyle(de).getPropertyValue('--cible')) || 44;
    const b = [...document.querySelectorAll('.vindex a')]
      .map((a) => a.getBoundingClientRect());
    return { cible,
             petite: Math.min(...b.map((x) => Math.min(x.width, x.height))),
             debord: b.some((x) => x.right > de.clientWidth + 1),
             defileH: de.scrollWidth > de.clientWidth };
  });
  verifier(past.petite >= past.cible - 0.5,
    `${page} : la plus petite pastille fait ${Math.round(past.petite)} px, `
    + `la cible tactile du site est ${past.cible} px`);
  verifier(!past.debord, `${page} : une pastille deborde du cadre a 360 px`);
  verifier(!past.defileH, `${page} : la page defile horizontalement a 360 px`);
}

// 4. La lecon courte n'a pas d'index.
await p.goto(BASE + COURTE, { waitUntil: 'networkidle' });
const court = await p.evaluate(() => ({
  k: document.querySelectorAll('.verset').length,
  index: document.querySelectorAll('.vindex').length,
  ancres: document.querySelectorAll('.verset[id]').length,
}));
verifier(court.index === 0,
  `${COURTE} : ${court.k} versets et un index quand meme`);
verifier(court.ancres === court.k,
  `${COURTE} : ${court.ancres} ancres pour ${court.k} versets — les ancres `
  + 'servent aussi a partager un verset, elles ne dependent pas de l\'index');

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Index de 19 et de 9 versets : premier, milieu et dernier');
console.log('  atterrissent sur le bon verset, avec de l\'air au-dessus.');
console.log('  Pastilles au pouce, aucun debord. La lecon de 3 versets n\'a');
console.log('  pas d\'index mais garde ses ancres.');
