/* ==========================================================================
   CONTROLE — « reprendre » doit reprendre

   CE QU'ON A MESURE, LE 25 SEPTEMBRE
   ----------------------------------
   On quitte un QCM a la quinzieme question. L'accueil propose bien une
   carte :

     75 %   TU EN ETAIS LA  ·  Le sens des sourates
            question 16 sur 20 · reprendre

   Elle mene a `qcm.html?section=sens-des-sourates&reprise=1`. Mesure du
   compteur juste apres le clic : « 1 / 20 ». La partie recommencait a zero.

   `lancer-qcm.js` ne lisait ni le parametre `reprise`, ni `d.reprise`. Le
   drapeau etait pose dans l'adresse par l'accueil et lu par personne. Tout
   ce qu'il fallait etait pourtant range par `sortir()` depuis le debut : les
   identifiants du paquet dans l'ordre, la position, les reponses deja
   donnees, les reglages, l'heure de depart.

   C'est le genre de faute qui ne se voit pas en relisant le code — chaque
   moitie est juste, c'est la jointure qui manque — et qui ne se voit pas non
   plus en jouant vite : il faut quitter une partie AVANCEE pour que le « 1 »
   au lieu du « 16 » saute aux yeux.

   CE QU'IL VERIFIE
   ----------------
   1. Apres avoir quitte, l'accueil propose la reprise, et le numero qu'elle
      annonce est celui que le QCM affichera — pas un autre.
   2. Reprendre rouvre SUR LA MEME CARTE : meme identifiant, meme compteur,
      memes reponses deja donnees, meme paquet.
   3. La partie reprise se termine normalement et donne un resultat.
   4. Une fois reprise, la partie n'est plus « en attente » : l'accueil ne
      propose plus de reprendre celle qu'on est en train de jouer.
   5. Sans partie en cours, aucune carte de reprise — on ne propose pas de
      reprendre ce qui n'existe pas.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
const AVANT_DE_QUITTER = 15;

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
const p = await ctx.newPage();
const err = [];
p.on('pageerror', (e) => err.push(e.message));

const carteDeReprise = () => p.evaluate(() => {
  const e = [...document.querySelectorAll('a')].find((x) => /tu en étais là/i.test(x.innerText || ''));
  return e ? e.innerText.replace(/\s+/g, ' ').trim() : null;
});

const etatDuJeu = () => p.evaluate(() => (window.__jeu ? {
  compte: document.getElementById('qcm-compte').innerText,
  id: window.__jeu.s.courante() ? window.__jeu.s.courante().id : null,
  paquet: window.__jeu.s.paquet.length,
  reponses: window.__jeu.s.reponses.length,
  justes: window.__jeu.s.reponses.filter((x) => x.juste).length,
} : null));

const repondre = async (n, faussesTousLes) => {
  for (let t = 0; t < n; t += 1) {
    if (!(await p.$('.reponse'))) { return t; }
    await p.evaluate((a) => {
      const c = window.__jeu.s.courante();
      const faux = a.f && a.t % a.f === 0;
      document.querySelectorAll('.reponse')[faux ? (c.bonne + 1) % 4 : c.bonne].click();
    }, { t, f: faussesTousLes });
    await p.waitForTimeout(75);
    await p.evaluate(() => document.getElementById('cote-droite').click());
    await p.waitForTimeout(310);
    const s = await p.$('#f-suite');
    if (s) { await s.click(); await p.waitForTimeout(210); }
  }
  return n;
};

// --- 5. rien en cours, rien de propose -----------------------------------
await p.goto(`${B}/`, { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.removeItem('ipap.v1'));
await p.reload({ waitUntil: 'networkidle' });
await p.waitForTimeout(700);
verifier((await carteDeReprise()) === null,
  'l\'accueil propose de reprendre alors qu\'aucune partie n\'est en cours');

// --- on joue, puis on quitte ---------------------------------------------
await p.goto(`${B}/qcm.html?section=sens-des-sourates&n=20&mode=apprentissage&niveau=1`,
  { waitUntil: 'networkidle' });
await p.waitForSelector('.reponse');
await p.waitForTimeout(400);
await repondre(AVANT_DE_QUITTER, 3);
const avant = await etatDuJeu();
await p.evaluate(() => document.getElementById('qcm-sortir').click());
await p.waitForTimeout(1100);

// --- 1. la carte annonce le bon numero -----------------------------------
await p.goto(`${B}/`, { waitUntil: 'networkidle' });
await p.waitForTimeout(700);
const carte = await carteDeReprise();
verifier(carte !== null, 'aucune carte de reprise apres avoir quitte une partie en cours');
if (carte) {
  const m = /question (\d+) sur (\d+)/.exec(carte);
  const attendu = /(\d+)\s*\/\s*(\d+)/.exec(avant.compte);
  verifier(m && attendu && m[1] === attendu[1] && m[2] === attendu[2],
    `la carte annonce « ${m ? m[0] : '?'} » alors que le QCM affichait `
    + `« ${avant.compte} » — deux nombres pour la meme chose`);
  console.log(`  carte : « ${carte} » ; le QCM affichait ${avant.compte}`);
}

// --- 2. reprendre rouvre au meme endroit ---------------------------------
await p.evaluate(() => {
  const e = [...document.querySelectorAll('a')].find((x) => /tu en étais là/i.test(x.innerText || ''));
  if (e) { e.click(); }
});
await p.waitForTimeout(1700);
const apres = await etatDuJeu();
verifier(apres !== null, 'reprendre n\'ouvre pas de partie');
if (apres) {
  verifier(apres.id === avant.id,
    `reprendre ouvre sur une autre carte : ${apres.id} au lieu de ${avant.id}`);
  verifier(apres.compte === avant.compte,
    `reprendre affiche « ${apres.compte} » au lieu de « ${avant.compte} » — `
    + 'la partie a recommence au lieu de reprendre');
  verifier(apres.reponses === avant.reponses && apres.justes === avant.justes,
    `reprendre perd les reponses deja donnees : ${apres.reponses} au lieu de `
    + `${avant.reponses}`);
  verifier(apres.paquet === avant.paquet,
    `le paquet repris fait ${apres.paquet} cartes au lieu de ${avant.paquet}`);
  console.log(`  repris sur ${apres.compte}, ${apres.reponses} reponses, `
    + `paquet de ${apres.paquet}`);
}

// --- 4. la partie reprise n'est plus en attente --------------------------
const restante = await p.evaluate(() =>
  (JSON.parse(localStorage.getItem('ipap.v1') || '{}') || {}).reprise);
verifier(!restante,
  'la partie reste marquee « a reprendre » alors qu\'on est en train de la '
  + 'jouer — l\'accueil proposerait de reprendre la partie en cours');

// --- 3. elle se termine ---------------------------------------------------
const encore = await repondre(60, 0);
await p.waitForTimeout(900);
const fin = await p.evaluate(() => ({
  finie: !document.querySelector('.reponse'),
  texte: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
}));
verifier(fin.finie, `la partie reprise ne se termine pas — ${encore} cartes de plus`);
verifier(/sur \d+/.test(fin.texte),
  `l'ecran de fin d'une partie reprise n'affiche pas de score — ${fin.texte.slice(0, 80)}`);
verifier(err.length === 0, `erreur JavaScript — ${err[0]}`);
console.log(`  ${encore} cartes de plus, puis « ${(/(\d+ sur \d+)/.exec(fin.texte) || ['?'])[0]} »`);

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Quitter puis reprendre rouvre sur la meme carte, avec les memes');
console.log('  reponses et le meme paquet ; la carte de l\'accueil annonce le');
console.log('  numero que le QCM affiche ; et la partie reprise se termine.');
