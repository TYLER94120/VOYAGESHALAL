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
       `role="status"`) annonce le verdict, et pas une chaine vide ;
    7. cette annonce DIT LA SOURCE que la feuille affiche — sans quoi un sens
       est annonce sans son traducteur a qui ne voit pas l'ecran. Ajoute le
       26 novembre ; le detail est a l'endroit du controle.

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
import { EXE as NAVIGATEUR } from './navigateur.mjs';

const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec += 1; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const sm = fs.readFileSync(new URL('../../sitemap.xml', import.meta.url), 'utf8');
const PAGES = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace('https://islampasapas.fr/', ''))
  .concat(['progres.html', 'section/sens-des-sourates/qcm',
    'qcm.html?section=lire-l-arabe&n=20',
    'qcm.html?section=vocabulaire-arabe&n=20',
    // Hors sitemap par construction — on n'indexe pas sa page d'erreur —
    // et pourtant servie aux visiteurs. Mesure du 10 novembre : aucun des
    // trente controles ne l'ouvrait.
    '404.html']);

const nav = await chromium.launch({
  executablePath: NAVIGATEUR,
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

/* 7. L'ANNONCE DIT-ELLE LA SOURCE QUE L'ECRAN MONTRE ? — 26 NOVEMBRE

   `js/qcm.js` ecrivait, au-dessus de son annonce : « Ce qui est annonce a
   une synthese vocale dit la meme chose, et dans le meme ordre, que ce qui
   est ecrit sur la feuille. » C'etait faux. La feuille ecrit l'explication,
   la divergence, PUIS la source ; l'annonce s'arretait a l'explication.

   Or 121 des 1 769 cartes qui montrent la traduction de leur verset portent
   « Traduction du sens : « … » » dans leur explication SANS nommer personne :
   le nom vit dans `q.source`. Qui regardait l'ecran le lisait ; qui ecoutait
   la page entendait un sens sans son traducteur. La regle de la ronde — « un
   sens s'attribue » — tenait pour l'oeil et pas pour l'oreille.

   ON NE RECOPIE RIEN ICI. Le controle compare deux choses de la MEME page :
   ce que l'annonce dit, et ce que les blocs de la feuille affichent. Pas de
   constante a tenir d'accord, donc rien qui puisse deriver — la lecon du
   19 novembre sur les deux copies d'une meme regle.

   TROIS BLOCS, PAS UN — ELARGI LE 27 NOVEMBRE. La premiere version ne
   comparait que `.f-source`. Or la feuille porte aussi `.f-divergence`,
   « Les savants divergent : … », et c'est le bloc qui servira exactement
   quand les enjeux seront les plus hauts. Il est vide sur les 2 616 cartes,
   donc ce controle ne pouvait pas le voir : en nommant les blocs au lieu d'un
   seul, il le couvre le jour ou une carte en portera un, sans que personne y
   repense. Repetition generale du 27 novembre, divergence plantee a la main
   dans une carte : l'ecran l'affiche, l'annonce la dit, et la retirer de
   l'annonce fait bien rougir ce controle. */
const blocs = await p.evaluate(() => {
  const lire = (s) => {
    const e = document.querySelector(s);
    return e ? (e.textContent || '').trim() : null;
  };
  return { '.f-texte': lire('.f-texte'),
    '.f-divergence': lire('.f-divergence'),
    '.f-source': lire('.f-source') };
});
const aplatir = (s) => s.replace(/\s+/g, ' ').replace(/ /g, ' ').trim();
if (!blocs['.f-source']) {
  rate('la feuille n\'affiche aucune source apres validation');
} else {
  const vus = Object.entries(blocs).filter(([, v]) => v);
  const manquants = vus
    .filter(([, v]) => !aplatir(annonce).includes(aplatir(v)))
    .map(([k]) => k);
  if (manquants.length) {
    rate('l\'annonce ne dit pas tout ce que l\'ecran montre ('
      + manquants.join(', ') + ') : un sens annonce sans ce qui l\'encadre',
    aplatir(blocs[manquants[0]]).slice(0, 52));
  } else {
    ok('l\'annonce porte chaque bloc affiche',
      vus.map(([k]) => k).join(' '));
  }
}

await nav.close();
console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
