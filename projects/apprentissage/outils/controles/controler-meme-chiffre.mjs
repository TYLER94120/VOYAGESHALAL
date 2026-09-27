/* ==========================================================================
   CONTROLE — un seul chiffre pour une seule chose, sur tous les ecrans

   CE QU'ON A MESURE, LE 27 SEPTEMBRE
   ----------------------------------
   Memoire fabriquee : sept jours de visite d'affilee, puis un trou hier,
   puis aujourd'hui.

     accueil       « 7 jours d'affilée »
     progres.html  « 1 jour de suite »

   Avec douze jours et deux trous : 11 contre 1.

   Il existait DEUX comptages de la serie. `serieComplete` tient compte du
   JOUR DE GRACE — le filet qui rattrape un jour manque, un gagne tous les
   cinq jours, deux au maximum. `serieDeJours` ne le connaissait pas : il
   remontait jusqu'au premier trou et s'arretait la. L'accueil appelait le
   premier, la page des progres le second.

   POURQUOI C'EST GRAVE ICI. Le filet existe pour une raison ecrite noir sur
   blanc dans la methode maison sur le retour quotidien : une serie nue est
   un piege. Un jour manque, le compteur tombe a zero, « j'ai perdu mes
   40 jours, j'arrete » — et le mecanisme cense faire revenir devient la
   raison de partir. Le rattrapage marchait. Mais la page qu'on ouvre
   justement pour regarder ses progres annoncait quand meme la cassure :
   elle defaisait le filet a elle seule, sur le seul chiffre auquel la
   personne fait confiance.

   `serieDeJours` a ete retiree : deux facons de compter la meme chose, c'est
   une de trop, et c'est toujours la mauvaise qui finit par etre appelee.

   CE QU'IL VERIFIE
   ----------------
   1. LA SERIE. Sur plusieurs calendriers — avec et sans trous, avec et sans
      jour de grace disponible — l'accueil et la page des progres annoncent
      le MEME nombre.
   2. LE NOMBRE DE QUESTIONS D'UNE SECTION, qui s'ecrit a trois endroits : la
      grille des douze, la couverture de la section, l'ecran de reglages.
      Trois lectures du meme index ; elles doivent tomber d'accord. C'est la
      faute du 20 septembre — « 1 259 » ici et « 1251 » huit lignes plus bas
      — vue sous l'autre angle : non plus la typographie, mais le chiffre.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
const p = await ctx.newPage();

await p.goto(`${B}/`, { waitUntil: 'networkidle' });
const ids = await p.evaluate(async () => {
  const b = await (await fetch('data/questions/sens-des-sourates.json')).json();
  return b.slice(0, 12).map((q) => q.id);
});

/* `creux` : les jours SAUTES, comptes en jours avant aujourd'hui. */
function memoire(depuis, creux) {
  const cle = (n) => {
    const x = new Date();
    x.setDate(x.getDate() - n);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`
      + `-${String(x.getDate()).padStart(2, '0')}`;
  };
  const jours = [];
  for (let i = depuis; i >= 0; i -= 1) { if (creux.indexOf(i) < 0) { jours.push(cle(i)); } }
  const questions = {};
  ids.forEach((id) => {
    questions[id] = { vues: 1, justes: 1, suite: 1, derniere: true, aRevoir: false, depuis: 0 };
  });
  const parJour = {}; parJour[cle(0)] = 10;
  return { v: 1, questions, jours, parJour, sessions: [], recordSerie: 0,
    reglages: null, reprise: null };
}

const lire = async (u, m, motif) => {
  await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' });
  await p.evaluate((x) => localStorage.setItem('ipap.v1', JSON.stringify(x)), m);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(600);
  const t = await p.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim());
  const x = motif.exec(t);
  return x ? x[1] : null;
};

// --- 1. la serie ---------------------------------------------------------
const CALENDRIERS = [
  ['sept jours pleins', 6, []],
  ['sept jours, un trou hier', 7, [1]],
  ['douze jours, deux trous', 12, [1, 5]],
  ['trois jours, un trou hier', 3, [1]],
  ['aujourd\'hui seulement', 0, []],
];
for (const [nom, depuis, creux] of CALENDRIERS) {
  const m = memoire(depuis, creux);
  const a = await lire('', m, /(\d+)\s+jours?\s+d'affilée/i);
  const b = await lire('progres.html', m, /(\d+)\s+jours?\s+de suite/i);
  verifier(a !== null && b !== null,
    `${nom} : la serie ne s'affiche pas sur l'un des deux ecrans `
    + `(accueil ${a}, progres ${b})`);
  verifier(a === b,
    `${nom} : l'accueil annonce ${a} jours et la page des progres ${b} — `
    + 'deux comptages pour la seule serie, et c\'est le chiffre auquel la '
    + 'personne fait le plus confiance');
  console.log(`  ${nom.padEnd(28)} accueil ${a}, progres ${b}`);
}

// --- 2. le nombre de questions d'une section -----------------------------
{
  const m = memoire(2, []);
  const nu = (s) => (s || '').replace(/[  \s]/g, '');
  const grille = await lire('sections.html', m, /Vocabulaire arabe\s+([\d   ]+)\s+questions/i);
  const couv = await lire('section/vocabulaire-arabe', m, /([\d   ]+)\s+questions/i);
  const regl = await lire('section/vocabulaire-arabe/qcm', m, /([\d   ]+)\s+questions dans cette section/i);
  verifier(grille && couv && regl,
    `le nombre de questions ne se lit pas partout — grille ${grille}, `
    + `couverture ${couv}, reglages ${regl}`);
  verifier(nu(grille) === nu(couv) && nu(couv) === nu(regl),
    `« Vocabulaire arabe » : ${nu(grille)} questions sur la grille, `
    + `${nu(couv)} sur la couverture, ${nu(regl)} sur l'ecran de reglages`);
  console.log(`  vocabulaire-arabe            grille ${nu(grille)}, couverture `
    + `${nu(couv)}, reglages ${nu(regl)}`);
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  La serie dit la meme chose sur l\'accueil et sur les progres,');
console.log('  jour de grace compris ; et le nombre de questions d\'une section');
console.log('  est le meme sur la grille, la couverture et les reglages.');
