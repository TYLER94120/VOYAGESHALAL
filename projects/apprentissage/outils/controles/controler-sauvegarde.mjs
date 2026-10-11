/* ==========================================================================
   CONTROLE — la seule sauvegarde qui existe, par le chemin que le lecteur prend

   POURQUOI CE CONTROLE EXISTE
   ---------------------------
   Le site n'a pas de comptes. La progression vit dans le `localStorage` d'un
   telephone, et la SEULE facon de la garder en changeant d'appareil, ou de la
   retrouver apres un nettoyage du navigateur, ce sont les deux boutons de
   `plus.html` : « Enregistrer ma progression » et « Recharger une
   progression ». Si ce chemin casse, un lecteur perd des semaines sans que
   rien ne l'avertisse — et il ne le decouvre qu'au moment ou il en a besoin.

   `controler-recette.mjs` verifiait deja `M.exporter()` et `M.importer()`.
   Mais ce sont les FONCTIONS. Personne ne verifiait le chemin : le bouton,
   le telechargement, le fichier, le `<input type="file">`, le retour.

   C'est exactement l'ecart qui a produit la faute du 10 octobre : le pied du
   QCM portait bien `hidden = true` dans le code, et restait a l'ecran. Un
   code juste ne fait pas un chemin qui marche.

   CE QU'IL VERIFIE
   ----------------
    1. le clic sur « Enregistrer ma progression » declenche un vrai
       telechargement, et le fichier porte le nom annonce ;
    2. le fichier contient la progression posee — pas un objet vide ;
    3. memoire effacee, le fichier rechargé par le champ de fichier rend la
       progression A L'IDENTIQUE, questions et jours ;
    4. un fichier illisible le dit, et surtout N'ECRASE RIEN. C'est le point
       le plus important des quatre : perdre sa progression en essayant de la
       restaurer serait la pire facon de la perdre.

   CE QU'IL A TROUVE, LE 11 OCTOBRE
   --------------------------------
   Rien. Les quatre points passent. C'est un resultat, pas une perte de
   temps : ce chemin n'avait jamais ete parcouru en entier, et il porte tout
   ce qu'un lecteur peut perdre.

   UNE COURSE CONNUE, MESUREE ET LAISSEE EN PLACE. `plus.js` fait

       lien.click();
       URL.revokeObjectURL(lien.href);

   c'est-a-dire qu'il libere l'URL du blob dans la foulee du clic. Sur
   certains navigateurs cela suffit a annuler le telechargement. Mesure :
   dans ce Chromium, le telechargement part bel et bien. On ne retouche donc
   pas un code qui marche sur la foi d'une theorie — mais le point 1 de ce
   controle est precisement ce qui le dira si un navigateur, ou une refonte,
   fait mordre la course un jour.
   ========================================================================== */

import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';
import fs from 'fs';
import os from 'os';
import path from 'path';

const B = 'http://127.0.0.1:8899';
const ID = 'sourates-5d056af0';   // une question qui existe vraiment
let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec += 1; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'] });
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
  acceptDownloads: true });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
await brancherPolices(ctx);
const p = await ctx.newPage();
const err = [];
p.on('pageerror', (e) => err.push(e.message));

await p.goto(`${B}/plus.html`, { waitUntil: 'networkidle' });
await attendrePolices(p);

/* --- 1 et 2. Le bouton, le telechargement, le contenu ------------------- */
const POSEE = { vues: 7, justes: 5, suite: 2, derniere: '2026-10-11', aRevoir: false };
const JOURS = ['2026-10-09', '2026-10-10', '2026-10-11'];
await p.evaluate(({ id, q, jours }) => {
  const M = window.IPAP_MEMOIRE;
  const d = M.vide();
  d.questions[id] = q;
  d.jours = jours;
  M.ranger(d);
}, { id: ID, q: POSEE, jours: JOURS });

const attente = p.waitForEvent('download', { timeout: 10000 }).catch(() => null);
await p.click('#exporter');
const dl = await attente;
let fichier = null;
if (!dl) {
  rate('le clic sur « Enregistrer ma progression » ne telecharge rien',
    'URL.revokeObjectURL juste apres click() est le suspect');
} else {
  ok('le bouton declenche un telechargement', dl.suggestedFilename());
  if (!/\.json$/.test(dl.suggestedFilename())) {
    rate('le fichier propose ne porte pas .json', dl.suggestedFilename());
  }
  fichier = path.join(os.tmpdir(), 'controle-' + dl.suggestedFilename());
  await dl.saveAs(fichier);
  const brut = fs.readFileSync(fichier, 'utf8');
  if (!brut.includes(ID)) {
    rate('le fichier ne contient pas la progression', brut.slice(0, 80));
  } else {
    ok('le fichier contient la progression', `${brut.length} octets`);
  }
}

/* --- 3. Memoire effacee, progression rendue a l'identique ---------------- */
if (fichier) {
  await p.evaluate(() => localStorage.clear());
  if (await p.evaluate(() => localStorage.getItem('ipap.v1')) !== null) {
    rate('la memoire ne s\'est pas effacee : la suite ne prouverait rien');
  }
  await p.setInputFiles('#fichier', fichier);
  await p.waitForTimeout(700);
  const revenu = await p.evaluate((id) => {
    const t = localStorage.getItem('ipap.v1');
    if (!t) { return null; }
    const d = JSON.parse(t);
    return { q: d.questions[id], jours: d.jours };
  }, ID);
  if (!revenu || !revenu.q) {
    rate('la progression n\'est pas revenue', JSON.stringify(revenu));
  } else if (JSON.stringify(revenu.q) !== JSON.stringify(POSEE)) {
    rate('la question est revenue differente', JSON.stringify(revenu.q));
  } else if (JSON.stringify(revenu.jours) !== JSON.stringify(JOURS)) {
    rate('les jours de la serie ne sont pas revenus', JSON.stringify(revenu.jours));
  } else {
    ok('la progression revient a l\'identique, questions et jours');
  }
}

/* --- 4. Un fichier illisible n'ecrase rien ------------------------------- */
await p.evaluate(() => {
  const M = window.IPAP_MEMOIRE;
  const d = M.vide();
  d.questions.temoin = { vues: 1, justes: 1, suite: 1, derniere: '2026-10-11' };
  M.ranger(d);
});
const casse = path.join(os.tmpdir(), 'controle-progression-cassee.json');
fs.writeFileSync(casse, '{ ceci n est pas du JSON');
await p.setInputFiles('#fichier', casse);
await p.waitForTimeout(700);
const dit = (await p.textContent('#dit') || '').trim();
const temoin = await p.evaluate(() =>
  (JSON.parse(localStorage.getItem('ipap.v1') || '{}').questions || {}).temoin);
if (!temoin) {
  rate('un fichier illisible a EFFACE la progression en place', dit);
} else if (!/pas pu être lu|n'a pas été touchée/.test(dit)) {
  rate('un fichier illisible ne le dit pas', dit || '(rien)');
} else {
  ok('un fichier illisible le dit et ne touche a rien', dit.slice(0, 54));
}

if (err.length) { rate('erreurs JavaScript', err.join(' | ').slice(0, 120)); }
else { ok('aucune erreur JavaScript'); }

await nav.close();
console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
