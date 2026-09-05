/* ==========================================================================
   CONTROLE — les couvertures de section, avec et SANS JavaScript

   POURQUOI IL EXISTE
   ------------------
   `controler-sections.py` demande les douze adresses au serveur et lit le
   HTML : il sait que chaque page a son titre, son canonical et un corps qui
   n'est pas vide. Il ne sait rien de ce que ce corps DEVIENT une fois pose
   dans une page. Deux fautes trouvees le 5 septembre ne se voyaient que la :

   1. Les etiquettes de theme etaient enfermees dans un carre de 44 x 44 px
      pendant que leur texte debordait par-dessus la bordure. `base.css`
      definit `.pastille` comme le bouton rond des en-tetes ; `section.css`
      redefinissait le fond et le rembourrage mais jamais `width` ni
      `height`, qui restaient donc a --cible. « Reconnaitre une sourate »
      s'ecrivait a cheval sur son cadre, avec JavaScript comme sans, depuis
      que cet ecran existe. Aucun controle ne regardait ces boites.

   2. Le corps rendu doit etre VISIBLE sans JavaScript, pas seulement
      present dans le fichier : du texte pose dans un conteneur masque ne
      servirait ni au lecteur ni au robot.

   CE QU'IL VERIFIE, sur trois sections choisies pour leurs cas limites
   -------------------------------------------------------------------
   PLEINE   : la plus fournie, avec les liens vers les 23 lecons ;
   COURTE   : une section a peine remplie ;
   VIDE     : la seule sans question, qui ne doit offrir aucun bouton de QCM.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8899/section/';

const PLEINE = 'sens-des-sourates';
const COURTE = 'le-pelerinage';
const VIDE = 'vie-du-prophete';

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };

const navigateur = await chromium.launch({ executablePath: EXE });

for (const avecJS of [true, false]) {
  const c = await navigateur.newContext({
    viewport: { width: 360, height: 640 }, deviceScaleFactor: 2,
    javaScriptEnabled: avecJS });
  const quand = avecJS ? 'avec JS' : 'sans JS';

  for (const slug of [PLEINE, COURTE, VIDE]) {
    const p = await c.newPage();
    await p.goto(BASE + slug,
      { waitUntil: avecJS ? 'networkidle' : 'domcontentloaded' });

    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const past = [...document.querySelectorAll('.pastilles .pastille')];
      return {
        // Ce que le visiteur lit vraiment, pas ce que le fichier contient.
        texte: (document.body.innerText || '').trim().length,
        titre: (document.querySelector('h1, .couv-titre') || {}).textContent || '',
        pastilles: past.length,
        deborde: past.filter((e) => e.scrollWidth > e.clientWidth + 1
                                 || e.scrollHeight > e.clientHeight + 1)
                     .map((e) => e.textContent.trim().slice(0, 30)),
        horsCadre: past.filter((e) => e.getBoundingClientRect().right
                                    > de.clientWidth + 1).length,
        defileH: de.scrollWidth > de.clientWidth,
        boutonQcm: document.querySelectorAll('a[href*="/qcm"]').length,
      };
    });

    verifier(r.texte > 150,
      `${slug} ${quand} : la page n'affiche que ${r.texte} caracteres`);
    verifier(r.titre.trim().length > 0,
      `${slug} ${quand} : aucun titre visible`);
    verifier(r.deborde.length === 0,
      `${slug} ${quand} : ${r.deborde.length} etiquette(s) debordent de leur `
      + `cadre — ${r.deborde.join(' / ')}`);
    verifier(r.horsCadre === 0,
      `${slug} ${quand} : une etiquette sort du cadre a 360 px`);
    verifier(!r.defileH, `${slug} ${quand} : la page defile horizontalement`);

    // UNE SECTION VIDE N'OFFRE PAS DE QCM. Proposer un QCM qui s'ouvre sur
    // rien est pire que de dire qu'il n'est pas pret — c'est la regle du
    // cahier V2, et elle doit tenir dans les deux rendus.
    if (slug === VIDE) {
      verifier(r.boutonQcm === 0,
        `${slug} ${quand} : ${r.boutonQcm} lien(s) vers un QCM alors que la `
        + 'section n\'a aucune question');
    } else {
      verifier(r.boutonQcm > 0,
        `${slug} ${quand} : aucun lien vers le QCM de la section`);
    }

    if (slug === PLEINE) {
      const lecons = await p.evaluate(() =>
        document.querySelectorAll('a[href^="lecon-sourate-"]').length);
      if (!avecJS) {
        verifier(lecons >= 20,
          `${slug} sans JS : ${lecons} liens vers des lecons, attendu au `
          + 'moins 20 — c\'est le seul maillage que le robot voit');
      }
    }
    await p.close();
  }
  await c.close();
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Trois couvertures relues avec et sans JavaScript : du texte');
console.log('  visible dans les six cas, aucune etiquette qui deborde,');
console.log('  aucun defilement lateral, et pas de QCM promis sur du vide.');
