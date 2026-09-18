/* ==========================================================================
   CONTROLE — ce qu'une page telecharge vraiment pour s'afficher

   CE QU'ON A MESURE, ET CE QUI A CHANGE
   -------------------------------------
   Le 18 septembre, ouvertes dans un navigateur :

     index.html                 2 584 Ko, dont 12 banques = 2 490 Ko
     sections.html              2 567 Ko, dont 12 banques = 2 490 Ko
     progres.html               2 552 Ko, dont 12 banques = 2 490 Ko
     /section/vocabulaire-arabe 1 109 Ko, dont une banque de 1 031 Ko

   L'accueil telechargeait DEUX MEGAOCTETS ET DEMI pour afficher douze
   nombres : les enonces, les reponses, les explications et les references de
   2 701 questions, dont il ne tirait que des identifiants. Ces pages lisent
   desormais `data/index-sections.json`, 53 Ko, et sont tombees a 115-147 Ko.

   CE QU'IL VERIFIE
   ----------------
   1. AUCUNE de ces quatre pages ne telecharge une banque. C'est la regle
      qui compte : une page qui ne fait que COMPTER n'a pas besoin des
      questions. `reglages.html` et `qcm.html`, eux, en ont besoin — ils ne
      sont pas dans cette liste.
   2. Chacune reste sous un plafond de poids. Le plafond n'est pas serre :
      il est la pour attraper un retour en arriere, pas pour discuter
      quelques kilo-octets.
   3. Chacune affiche quand meme quelque chose — un allegement qui viderait
      la page ne serait pas un allegement.

   La methode maison sur les conditions degradees dit pourquoi ca compte : le
   reseau n'est presque jamais absent, il est LENT, et une requete qui traine
   est pire qu'un echec immediat parce que pendant ce temps rien ne s'affiche.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// Plafond en kilo-octets, mesure x 2 environ. On veut voir revenir une
// banque entiere, pas arbitrer 20 Ko.
const PAGES = [
  ['index.html', 400],
  ['sections.html', 400],
  ['progres.html', 400],
  ['section/vocabulaire-arabe', 400],
];

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE });

for (const [u, plafond] of PAGES) {
  const c = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  let octets = 0;
  const banques = [];
  p.on('response', async (r) => {
    try {
      const b = await r.body();
      octets += b.length;
      if (r.url().includes('/data/questions/')) {
        banques.push(r.url().split('/').pop() + ' (' + Math.round(b.length / 1024) + ' Ko)');
      }
    } catch (e) { /* une reponse sans corps ne pese rien */ }
  });
  await p.goto(`http://127.0.0.1:8899/${u}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);

  const texte = await p.evaluate(() => (document.body.innerText || '').trim().length);
  const ko = Math.round(octets / 1024);

  if (banques.length) {
    fautes.push(`${u} : telecharge ${banques.length} banque(s) entiere(s) — `
      + `${banques.slice(0, 3).join(', ')}. Cette page ne fait que compter : `
      + `l'index suffit.`);
  }
  if (ko > plafond) {
    fautes.push(`${u} : ${ko} Ko telecharges, plafond ${plafond} Ko`);
  }
  if (texte < 150) {
    fautes.push(`${u} : ${texte} caracteres affiches — la page s'est allegee `
      + `jusqu'a ne plus rien dire`);
  }
  console.log(`  ${u.padEnd(28)} ${String(ko).padStart(4)} Ko, `
    + `${banques.length} banque(s), ${texte} caracteres affiches`);
  await c.close();
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Aucune de ces pages ne telecharge de banque, et toutes affichent.');
