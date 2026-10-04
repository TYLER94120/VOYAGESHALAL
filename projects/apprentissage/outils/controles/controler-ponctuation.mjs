/* ==========================================================================
   CONTROLE — une ponctuation double ne reste jamais seule en tete de ligne

   CE QU'ON A MESURE, LE 4 OCTOBRE
   -------------------------------
   Le francais demande une espace INSECABLE avant « : ; ? ! ». Dans ce que le
   site ecrit lui-meme — enonces et lignes de source — l'espace etait toujours
   la, mais toujours ordinaire : 4 435 fois, et pas une seule insecable.

   Une regle de typographie ne se repare pas pour elle-meme. On a donc mesure
   la seule chose qui se VOIE : la ponctuation passe-t-elle a la ligne toute
   seule ? Sur les 55 pages du site, 776 ponctuations doubles :

     360 x 640    0 orpheline
     320 x 568   39 orphelines

   Trente-neuf, toutes la meme, sur les 38 lecons de sourate :

       Le Coran, c'est l'arabe
       : une traduction en approche, elle ne le remplace pas.

   Un deux-points seul en haut d'une ligne, dans la phrase qui dit qu'une
   traduction ne remplace pas le Coran — celle qu'on a le moins envie de voir
   mal composee. Et seulement a 320 px : l'iPhone SE et les Android d'entree
   de gamme, l'ecran qu'on ne regarde jamais.

   La quarantieme, trouvee apres la premiere correction, etait le titre de la
   lecon la plus longue : « Sourate Al-Mutaffifin : traduction et texte
   arabe ».

   CE QU'IL VERIFIE
   ----------------
   Toutes les adresses du sitemap, plus les ecrans de jeu, a 320 px — la
   largeur ou le defaut apparait. Pour chaque « : ; ? ! » affiche, il compare
   la position du caractere qui precede : s'ils ne sont pas sur la meme ligne,
   la ponctuation est orpheline.

   IL NE REGARDE PAS LE CODE, IL REGARDE LA MISE EN PAGE. Compter les espaces
   insecables dans les fichiers ne dirait rien : une espace ordinaire au
   milieu d'une phrase courte ne derange personne, et c'est tres bien ainsi.
   Ce qu'on refuse, c'est le resultat visible.

   CE QU'IL NE TOUCHE PAS
   ----------------------
   Les traductions. Hamidullah a sa propre typographie — « Dis: «Il est Allah,
   Unique» » — et une traduction ne se retouche pas, meme pour une espace.
   Comme le controle mesure la MISE EN PAGE et non le texte, une citation mal
   composee par le traducteur ne peut de toute facon pas etre « corrigee »
   ici : seule la largeur de la colonne joue.
   ========================================================================== */

import { chromium } from 'playwright-core';
import fs from 'fs';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
// 320 px : le plus petit ecran encore en service, et le seul ou le defaut
// s'est montre. Mesurer a 390 n'aurait rien trouve.
const LARGEUR = 320;
const HAUTEUR = 568;

const sm = fs.readFileSync(new URL('../../sitemap.xml', import.meta.url), 'utf8');
const PAGES = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace('https://islampasapas.fr/', ''))
  .concat(['progres.html', 'section/sens-des-sourates/qcm']);

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await navigateur.newContext({
  viewport: { width: LARGEUR, height: HAUTEUR }, deviceScaleFactor: 2 });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
const p = await ctx.newPage();

let examinees = 0;
for (const u of PAGES) {
  await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const trouve = [];
    let vus = 0;
    const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = marche.nextNode())) {
      const t = n.nodeValue;
      if (!t || !/[:;?!]/.test(t)) { continue; }
      if (!n.parentElement || n.parentElement.offsetParent === null) { continue; }
      for (let i = 1; i < t.length; i += 1) {
        if (!':;?!'.includes(t[i])) { continue; }
        vus += 1;
        const r1 = document.createRange(); r1.setStart(n, i - 1); r1.setEnd(n, i);
        const r2 = document.createRange(); r2.setStart(n, i); r2.setEnd(n, i + 1);
        const a = r1.getBoundingClientRect();
        const b = r2.getBoundingClientRect();
        // Deux pixels de tolerance : un accent ou un exposant peut decaler
        // le haut d'un caractere sans qu'il ait change de ligne.
        if (a.height && b.height && b.top > a.top + 2) {
          trouve.push(`« …${t.slice(Math.max(0, i - 32), i + 1).replace(/\s+/g, ' ')} »`);
        }
      }
    }
    return { vus, trouve };
  });
  examinees += r.vus;
  for (const x of r.trouve) {
    fautes.push(`${u || '/'} : une ponctuation reste seule en tete de ligne — ${x}`);
  }
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) a ${LARGEUR} px :`);
  fautes.slice(0, 12).forEach((f) => console.log('    ' + f));
  if (fautes.length > 12) { console.log(`    … et ${fautes.length - 12} autres.`); }
  console.log('    Une espace insecable devant la ponctuation les retient.');
  process.exit(1);
}
console.log(`  ${PAGES.length} pages a ${LARGEUR} px, ${examinees} ponctuations doubles :`);
console.log('  aucune ne passe a la ligne toute seule.');
