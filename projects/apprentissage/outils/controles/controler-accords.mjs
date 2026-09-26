/* ==========================================================================
   CONTROLE — « 1 jours de suite »

   CE QU'ON A MESURE, LE 26 SEPTEMBRE
   ----------------------------------
   En fabriquant une memoire a 0, puis 1, puis 2, et en relisant ce que les
   ecrans ecrivent vraiment :

     n=0   /progres.html    « 0 jours »   « 0 questions »
     n=1   /progres.html    « 1 jours »   « 1 questions »
     n=1   /                « 1 jour d'affilée »      correct
     n=1   /sections.html   « 1 section »             correct

   La page des progres etait la SEULE a se tromper, et elle le faisait deux
   fois. Onze endroits du site font l'accord ; celle-la ecrivait ses libelles
   en dur, sous les nombres.

   C'est la page ou ca se voit le plus. Elle n'existe que pour montrer ces
   trois nombres, et ils sont petits au debut : quelqu'un qui vient de faire
   son premier QCM lit « 1 jours de suite » a son tout premier passage — le
   moment ou l'on decide si un site est serieux ou bacle. Sur un site qui
   enseigne, et qui demande qu'on lui fasse confiance sur des versets, une
   faute d'accord sous un chiffre coute plus cher qu'ailleurs.

   CE QU'IL VERIFIE
   ----------------
   Il force la memoire a 0, 1 et 2, ouvre les quatre ecrans qui affichent des
   comptes, et relit CE QUI EST ECRIT. Tout « <nombre> <mot> » doit s'accorder
   avec son nombre : pluriel au-dela de un, singulier a un et a zero — en
   francais zero prend le singulier, et c'est la regle que suivent deja les
   dix autres endroits.

   Il ne lit pas le code : deux libelles peuvent etre ecrits a deux endroits
   et un seul etre corrige. Il lit la page.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
const PAGES = ['progres.html', '', 'sections.html', 'section/sens-des-sourates'];

// Les mots comptables du site. « fois » est invariable, on l'ecarte.
const MOTS = /(\d+)\s+(jours?|questions?|minutes?|sections?|essais?|themes?|thèmes?)\b/gi;

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
const p = await ctx.newPage();

// De vrais identifiants : sans eux les pourcentages restent a zero et
// plusieurs libelles ne s'affichent pas du tout.
await p.goto(`${B}/`, { waitUntil: 'networkidle' });
const ids = await p.evaluate(async () => {
  const b = await (await fetch('data/questions/sens-des-sourates.json')).json();
  return b.slice(0, 3).map((q) => q.id);
});

function memoire(n, ids) {
  const jour = (d) => {
    const x = new Date();
    x.setDate(x.getDate() - d);
    return x.toISOString().slice(0, 10);
  };
  const questions = {};
  ids.slice(0, n).forEach((id) => {
    questions[id] = { vues: 1, justes: 1, suite: 1, derniere: true, aRevoir: false, depuis: 0 };
  });
  const jours = [];
  for (let i = 0; i < n; i += 1) { jours.push(jour(i)); }
  const parJour = {};
  if (n) { parJour[jour(0)] = n; }
  return { v: 1, questions, jours, parJour, sessions: [], recordSerie: n,
    reglages: null, reprise: null };
}

for (const n of [0, 1, 2]) {
  const m = memoire(n, ids);
  for (const u of PAGES) {
    await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' });
    await p.evaluate((x) => localStorage.setItem('ipap.v1', JSON.stringify(x)), m);
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForTimeout(550);
    const t = await p.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim());
    const mauvais = [...t.matchAll(MOTS)].map((x) => x[0]).filter((x) => {
      const [, nb, mot] = /(\d+)\s+(\S+)/.exec(x);
      const pluriel = /s$/i.test(mot);
      return (+nb > 1) !== pluriel;
    });
    if (mauvais.length) {
      fautes.push(`/${u || ''} avec ${n} : ${[...new Set(mauvais)].join(', ')} — `
        + 'le mot ne s\'accorde pas avec son nombre');
    }
  }
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log(`  ${PAGES.length} ecrans relus avec 0, 1 et 2 : tout nombre affiche`);
console.log('  s\'accorde avec le mot qui le suit.');
