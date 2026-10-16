/* ==========================================================================
   CONTROLE — ce qu'un lecteur d'ecran recoit du site

   POURQUOI CE CONTROLE EXISTE
   ---------------------------
   Rien de ce qu'il verifie ne SE VOIT. Un `lang="ar"` oublie, un bouton sans
   nom, une zone d'annonce debranchee : l'ecran reste identique au pixel pres,
   et le site devient inutilisable pour qui l'ecoute. Il n'y a pas de symptome
   visuel, donc pas de rappel — c'est exactement le genre de propriete qui se
   perd a la premiere refonte.

   SUR CE SITE, LA PREMIERE DES SIX COMPTE PLUS QUE LES CINQ AUTRES. Un
   lecteur d'ecran francais qui tombe sur de l'arabe sans `lang="ar"` le
   prononce avec les regles du francais. Sur un site qui publie le Coran, ce
   n'est pas une gene d'ergonomie.

   CE QU'IL VERIFIE
   ----------------
    1. tout passage d'arabe affiche est sous un `lang` qui commence par `ar` ;
    2. aucune image affichee sans attribut `alt` ;
    3. aucun `svg` visible qui ne soit ni `aria-hidden`, ni porteur d'un
       `<title>` ou d'un `aria-label` — un dessin muet et non masque est
       annonce comme « graphique », sans plus ;
    4. aucun lien ni bouton sans nom accessible ;
    5. dans le QCM, les quatre reponses sont des boutons a etat : celle qu'on
       choisit porte `aria-pressed="true"`, les autres `false`. C'est ce qui
       dit a qui ecoute CE QU'IL VIENT DE CHOISIR, avant de valider ;
    6. apres validation, la zone `#qcm-annonce` (`aria-live="polite"`,
       `role="status"`) annonce le verdict, et pas une chaine vide.

   CE QU'IL A TROUVE, LE 16 OCTOBRE
   --------------------------------
   Rien. Un peu plus de sept cents passages d'arabe, tous annonces comme de
   l'arabe — le nombre exact varie d'une execution a l'autre parce que le
   paquet du QCM est melange, et un chiffre fixe dans cet en-tete serait faux
   une fois sur deux ;
   aucune image (le site est en SVG en ligne et en CSS) ; aucun svg muet ;
   aucun bouton anonyme ; `aria-pressed` en place ; et l'annonce dit
   « Bonne reponse. C'est le verset 2 de la sourate Al-Ma'un. Sa traduction :
   … ». C'etait tenu partout. Personne ne l'avait verifie.

   LE PIEGE OU JE SUIS TOMBE EN LE MESURANT
   ----------------------------------------
   Premiere mesure : j'ai clique une reponse, regarde la zone d'annonce, vu
   une chaine vide, et failli ecrire « le QCM n'annonce rien ». Faux :
   CHOISIR N'EST PAS VALIDER. Le pied porte « Passer » et « Valider », et
   c'est le second geste qui tranche. Je mesurais le mauvais moment. Ce
   controle fait donc les deux gestes, dans l'ordre, et verifie l'etat apres
   chacun.
   ========================================================================== */

import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';
import fs from 'fs';

const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec += 1; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const sm = fs.readFileSync(new URL('../../sitemap.xml', import.meta.url), 'utf8');
const PAGES = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace('https://islampasapas.fr/', ''))
  .concat(['progres.html', 'section/sens-des-sourates/qcm',
    'qcm.html?section=lire-l-arabe&n=20',
    'qcm.html?section=vocabulaire-arabe&n=20']);

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'] });
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
await brancherPolices(ctx);
const p = await ctx.newPage();

/* --- 1 a 4, sur toutes les pages ---------------------------------------- */
let arabeVu = 0;
const fautes = { arabe: [], alt: [], svg: [], nom: [] };
for (const u of PAGES) {
  await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' });
  await attendrePolices(p);
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const ARABE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
    const vu = (e) => e.offsetParent !== null;
    const arabe = [];
    let vus = 0;
    const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = marche.nextNode())) {
      const t = (n.nodeValue || '').trim();
      if (!t || !ARABE.test(t)) { continue; }
      const e = n.parentElement;
      if (!e || !vu(e)) { continue; }
      vus += 1;
      let lang = null, ou = e;
      while (ou && !lang) {
        if (ou.getAttribute && ou.getAttribute('lang')) { lang = ou.getAttribute('lang'); }
        ou = ou.parentElement;
      }
      if (!lang || !/^ar/i.test(lang)) {
        arabe.push(`« ${t.slice(0, 20)} » dans <${e.tagName.toLowerCase()}`
          + `${e.className ? ' class="' + e.className + '"' : ''}>, lang=${lang || 'aucun'}`);
      }
    }
    const nom = (e) => (e.textContent || '').trim() || e.getAttribute('aria-label')
      || e.getAttribute('title') || (e.querySelector('img') || {}).alt;
    return {
      vus,
      arabe,
      alt: [...document.querySelectorAll('img')].filter(vu)
        .filter((e) => !e.hasAttribute('alt')).map((e) => e.getAttribute('src') || '?'),
      svg: [...document.querySelectorAll('svg')]
        .filter((e) => e.getBoundingClientRect().width > 0)
        .filter((e) => !e.hasAttribute('aria-hidden') && !e.querySelector('title')
          && !e.getAttribute('aria-label')).length,
      nom: [...document.querySelectorAll('a,button')].filter(vu).filter((e) => !nom(e))
        .map((e) => `<${e.tagName.toLowerCase()} class="${e.className}">`),
    };
  });
  arabeVu += r.vus;
  r.arabe.forEach((x) => fautes.arabe.push(`${u || '/'} : ${x}`));
  r.alt.forEach((x) => fautes.alt.push(`${u || '/'} : ${x}`));
  if (r.svg) { fautes.svg.push(`${u || '/'} : ${r.svg} svg muet(s)`); }
  r.nom.forEach((x) => fautes.nom.push(`${u || '/'} : ${x}`));
}

const dire = (nom, liste, bon) => {
  if (liste.length) {
    rate(nom, liste.slice(0, 4).join(' | ')
      + (liste.length > 4 ? ` … et ${liste.length - 4} autres` : ''));
  } else { ok(bon); }
};
dire('de l\'arabe sans lang="ar"', fautes.arabe,
  `${arabeVu} passages d'arabe, tous annonces comme de l'arabe`);
dire('une image sans alt', fautes.alt, 'aucune image sans alt');
dire('un svg visible, muet et non masque', fautes.svg,
  'tout svg visible est masque ou nomme');
dire('un lien ou bouton sans nom accessible', fautes.nom,
  'tout lien et tout bouton a un nom');

/* --- 5 et 6 : choisir, puis valider ------------------------------------- */
await p.goto(`${B}/qcm.html?section=sens-des-sourates&n=20`, { waitUntil: 'domcontentloaded' });
await attendrePolices(p);
await p.waitForSelector('.reponse');
await p.waitForTimeout(600);

const zone = await p.evaluate(() => {
  const z = document.getElementById('qcm-annonce');
  return z && { live: z.getAttribute('aria-live'), role: z.getAttribute('role') };
});
if (!zone) { rate('#qcm-annonce n\'existe pas : rien ne sera annonce'); }
else if (zone.live !== 'polite' || zone.role !== 'status') {
  rate('#qcm-annonce n\'est pas une zone annoncee',
    `aria-live=${zone.live} role=${zone.role}`);
} else { ok('la zone d\'annonce du QCM est en place', 'aria-live=polite role=status'); }

await p.click('.reponse');
await p.waitForTimeout(400);
const etats = await p.evaluate(() => [...document.querySelectorAll('.reponse')]
  .map((e) => e.getAttribute('aria-pressed')));
if (etats.filter((x) => x === 'true').length !== 1
    || etats.filter((x) => x === 'false').length !== etats.length - 1) {
  rate('la reponse choisie ne se dit pas : qui ecoute valide sans savoir '
    + 'ce qu\'il a choisi', JSON.stringify(etats));
} else { ok('la reponse choisie porte aria-pressed="true", les autres "false"'); }

// CHOISIR N'EST PAS VALIDER : le second geste est celui qui tranche.
const valider = p.locator('.cote', { hasText: 'Valider' }).first();
if (await valider.count()) { await valider.click(); }
else { await p.locator('button:has-text("Valider")').first().click(); }
await p.waitForTimeout(1100);
const annonce = (await p.evaluate(() =>
  ((document.getElementById('qcm-annonce') || {}).textContent || '').trim()) || '');
if (!annonce) {
  rate('apres validation, la zone d\'annonce reste vide : le resultat n\'est '
    + 'annonce a personne');
} else if (!/bonne réponse|réponse fausse/i.test(annonce)) {
  rate('l\'annonce ne dit pas si la reponse etait juste', annonce.slice(0, 70));
} else { ok('le verdict est annonce', annonce.slice(0, 58) + '…'); }

await nav.close();
console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
