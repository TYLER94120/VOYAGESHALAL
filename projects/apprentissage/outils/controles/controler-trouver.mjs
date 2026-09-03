/* ==========================================================================
   CONTROLE — le champ « trouver une sourate »

   CE QU'IL VERIFIE, ET POURQUOI CHAQUE POINT EST LA
   -------------------------------------------------
   1. SANS JAVASCRIPT, la page est exactement celle d'avant : 114 rangs
      visibles, aucun champ. C'est le point le plus important du lot. La
      page vit de Google ; si le filtre masquait des rangs avant d'etre
      pilote, ou si un champ inerte restait affiche quand le script ne
      s'execute pas, on aurait echange sept impressions contre un gadget.
   2. Le champ apparait quand le script tourne.
   3. Un nom trouve sa sourate, meme mal orthographie : « qaria » doit
      mener a Al-Qari'a, dont le nom s'ecrit avec une apostrophe que
      personne ne tape.
   4. Un numero se compare par son DEBUT : « 1 » rend 26 sourates (1, 10 a
      19, 100 a 114) et non 114. Le compte est calcule ici, pas recopie.
   5. Un rang filtre disparait VRAIMENT. `.srow` porte `display: flex`, qui
      bat le `display: none` que le navigateur attache a [hidden] : sans la
      regle CSS ajoutee pour ca, le filtre ne masquerait rien. Ce point
      tombe si quelqu'un retire cette regle.
   6. Zero resultat affiche une sortie, pas une page vide.
   7. Effacer rend les 114 rangs.
   8. Le champ tient dans un ecran de 360 px et reste atteignable au pouce.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = 'http://127.0.0.1:8899/sourates.html';

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };

const navigateur = await chromium.launch({ executablePath: EXE });

// --- 1. La page sans JavaScript -------------------------------------------
{
  const c = await navigateur.newContext({
    viewport: { width: 360, height: 640 }, javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  const r = await p.evaluate(() => ({
    rangs: document.querySelectorAll('.srow').length,
    visibles: [...document.querySelectorAll('.srows > li')]
      .filter((e) => e.getClientRects().length > 0).length,
    champ: document.querySelectorAll('.strouve-champ').length,
  }));
  verifier(r.rangs === 114, `sans JS : ${r.rangs} rangs dans le HTML, attendu 114`);
  verifier(r.visibles === 114,
    `sans JS : ${r.visibles} rangs visibles, attendu 114 — un filtre ne doit `
    + 'jamais masquer avant d\'etre pilote');
  verifier(r.champ === 0,
    'sans JS : un champ de recherche est affiche alors que rien ne le fait '
    + 'chercher');
  await c.close();
}

// --- 2 a 8. La page avec JavaScript ---------------------------------------
{
  const c = await navigateur.newContext({
    viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' });

  const champ = p.locator('.strouve-champ');
  verifier(await champ.count() === 1, 'avec JS : le champ n\'a pas ete cree');
  if (await champ.count() !== 1) {
    fautes.forEach((f) => console.log('    ' + f));
    await navigateur.close();
    process.exit(1);
  }

  // Ce que le navigateur montre vraiment, pas ce que l'attribut dit.
  const visibles = () => p.evaluate(() => [...document.querySelectorAll('.srows > li')]
    .filter((e) => e.getClientRects().length > 0)
    .map((e) => e.querySelector('.s-num').textContent.trim()));

  const taper = async (t) => {
    await champ.fill(t);
    await p.waitForTimeout(60);
    return visibles();
  };

  verifier((await visibles()).length === 114,
    'avec JS, champ vide : les 114 rangs ne sont pas tous visibles');

  // 3. Un nom mal orthographie, sans apostrophe ni accent.
  const qaria = await taper('qaria');
  verifier(qaria.length === 1 && qaria[0] === '101',
    `« qaria » rend [${qaria}], attendu la seule 101 (Al-Qari'a)`);

  const ikhlas = await taper('Al Ikhlass'.slice(0, 9));  // « Al Ikhla »
  verifier(ikhlas.length === 1 && ikhlas[0] === '112',
    `« Al Ikhla » rend [${ikhlas}], attendu la seule 112`);

  // 4. Le numero par son debut. Le compte attendu se CALCULE.
  const attendu1 = Array.from({ length: 114 }, (_, i) => String(i + 1))
    .filter((n) => n.startsWith('1'));
  const un = await taper('1');
  verifier(un.length === attendu1.length,
    `« 1 » rend ${un.length} sourates, attendu ${attendu1.length} `
    + '(celles dont le numero commence par 1)');
  verifier(un.every((n) => n.startsWith('1')),
    '« 1 » rend une sourate dont le numero ne commence pas par 1');

  const cent12 = await taper('112');
  verifier(cent12.length === 1 && cent12[0] === '112',
    `« 112 » rend [${cent12}], attendu la seule 112`);

  // 5. Un rang masque n'occupe plus de place. On mesure la hauteur de la
  //    page : si [hidden] etait sans effet, elle ne bougerait pas.
  const hauteurFiltree = await p.evaluate(() => document.documentElement.scrollHeight);

  // 6. Zero resultat.
  const rien = await taper('zzzz');
  verifier(rien.length === 0, `« zzzz » rend ${rien.length} rangs, attendu 0`);
  const sortie = await p.evaluate(() => {
    const e = document.querySelector('.strouve-vide');
    return e && e.getClientRects().length > 0 ? e.textContent.trim() : '';
  });
  verifier(sortie.length > 0,
    'zero resultat : rien n\'est propose, l\'utilisateur reste devant du vide');

  // 7. Effacer rend tout.
  const efface = await taper('');
  verifier(efface.length === 114,
    `apres effacement : ${efface.length} rangs visibles, attendu 114`);
  const hauteurPleine = await p.evaluate(() => document.documentElement.scrollHeight);
  verifier(hauteurPleine > hauteurFiltree,
    'la page filtree est aussi haute que la page pleine : les rangs masques '
    + 'occupent encore leur place, la regle CSS sur [hidden] a saute');

  // 8. Le champ tient dans le cadre et se vise au pouce.
  //
  //    Le point « visible des l'arrivee » remplace une promesse qui n'a pas
  //    tenu : le champ a d'abord ete ecrit `position: sticky`, et il ne
  //    collait pas — `.ecran` porte `overflow-y: auto`, capte le contexte de
  //    defilement et ne defile jamais. Rien ne l'avait signale, parce qu'on
  //    ne mesurait que sa hauteur. On mesure donc maintenant CE QUI EST
  //    PROMIS : qu'on le voie sans avoir a faire defiler quoi que ce soit.
  const cadre = await p.evaluate(() => {
    const e = document.querySelector('.strouve-champ');
    const r = e.getBoundingClientRect();
    const cible = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue('--cible')) || 44;
    return { haut: r.height, droite: r.right, bas: r.bottom,
             large: document.documentElement.clientWidth, cible,
             ecran: window.innerHeight,
             defileH: document.documentElement.scrollWidth
                      > document.documentElement.clientWidth };
  });
  verifier(cadre.bas > 0 && cadre.bas <= cadre.ecran,
    `en haut de page, le champ finit a ${Math.round(cadre.bas)} px alors que `
    + `l'ecran fait ${cadre.ecran} px : il faut defiler pour le voir`);

  // Une recherche doit ramener la page a un ecran ou deux. C'est tout
  // l'interet du filtre : sans ca, on aurait ajoute un champ a une page de
  // onze ecrans qui en ferait toujours onze.
  await taper('nas');
  const apres = await p.evaluate(() => document.documentElement.scrollHeight);
  verifier(apres <= cadre.ecran * 2,
    `apres une recherche, la page fait encore ${apres} px, soit plus de deux `
    + `ecrans de ${cadre.ecran} px`);
  await taper('');
  verifier(cadre.haut >= cadre.cible - 0.5,
    `le champ fait ${Math.round(cadre.haut)} px de haut, la cible tactile `
    + `du site est ${cadre.cible} px`);
  verifier(cadre.droite <= cadre.large + 1,
    'le champ deborde du cadre a 360 px');
  verifier(!cadre.defileH, 'la page defile horizontalement a 360 px');

  await c.close();
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Sans JavaScript : 114 rangs visibles, aucun champ inerte.');
console.log('  Avec : nom mal orthographie, numero par son debut, zero resultat,');
console.log('  effacement, hauteur reelle et cible tactile — tout repond.');
