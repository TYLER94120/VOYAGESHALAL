/* ==========================================================================
   CONTROLE — DEUX parties d'affilee, et ce qui se passe ENTRE elles

   POURQUOI IL FALLAIT UN DEUXIEME CONTROLE DE PARTIE
   --------------------------------------------------
   `controler-boucle.mjs` joue UNE partie entiere jusqu'au resultat et verifie
   que les sommes tombent juste. Ce qu'il ne peut pas voir, c'est ce qui se
   passe D'UNE PARTIE A L'AUTRE — et c'est la que vit la promesse faite au
   lecteur qui se trompe :

       « Tu la reverras dans un prochain QCM de cette section. »

   Avec sa borne : `QCM_PRIORITAIRES = 3`, la question est prioritaire trois
   QCM durant, puis relachee. Le compteur qui la porte, `depuis`, n'avance
   qu'a la FIN d'une partie — `vieillirLesPriorites` est appele dans
   `Jeu.prototype.terminer`. Une seule partie ne peut donc rien en dire.

   CE QU'IL VERIFIE
   ----------------
    1. une partie de trois cartes se termine et mene a `resultat.html` ;
    2. elle est enregistree dans `sessions` ;
    3. elle NE MARQUE PAS le jour : `MINI_POUR_LE_JOUR = 10`, et trois cartes
       ne font pas une journee de travail. Le contraire gonflerait la serie ;
    4. une question ratee a la premiere partie est marquee `aRevoir`, et son
       compteur `depuis` passe de 0 a 1 quand la DEUXIEME partie se termine ;
    5. elle est dans le paquet de la deuxieme partie, et EN PREMIER.

   CE QUE J'AI MIS DEUX NUITS A TROUVER, ET QUI ETAIT DEJA ECRIT
   -------------------------------------------------------------
   Pour avancer d'une carte a l'autre, il ne faut PAS cliquer « Valider » :
   ce bouton est desactive entre deux cartes. On valide AU CLAVIER
   (`ArrowRight`), puis on avance par `#f-suite` quand la feuille de
   correction l'affiche. Et la fin ne se lit pas a un libelle de bouton :
   `qcm.js` part sur `resultat.html?s=<id>`.

   Les 16 et 17 octobre j'ai echoue a conduire une partie, et j'ai ecrit dans
   controler-rattrapage.mjs que la chaine entiere n'etait « pas verifiee d'un
   seul tenant ». C'ETAIT FAUX : controler-boucle.mjs le fait depuis des
   semaines, et sa premiere ligne le dit — « UNE PARTIE ENTIERE, JOUEE
   JUSQU'AU RESULTAT ». La recette etait dans ce fichier-la. J'ai declare un
   trou dans la suite au lieu de lire la suite.
   ========================================================================== */

import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';

const B = 'http://127.0.0.1:8899';
const SEC = 'sens-des-sourates';
let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec += 1; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'] });
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
await brancherPolices(ctx);
const p = await ctx.newPage();
const erreurs = [];
p.on('pageerror', (e) => erreurs.push(e.message));

const CARTES = 3;
async function ouvrir() {
  await p.goto(`${B}/qcm.html?section=${SEC}&n=${CARTES}&niveau=3`,
    { waitUntil: 'domcontentloaded' });
  await attendrePolices(p);
  await p.waitForSelector('.reponse');
  await p.waitForTimeout(400);
}
const memoire = () => p.evaluate(() =>
  JSON.parse(localStorage.getItem('ipap.v1') || '{}'));

/* Joue jusqu'au resultat. `rater` est l'identifiant qu'on ratera expres. */
async function jouer(rater) {
  const paquet = await p.evaluate(() =>
    window.__jeu.s.paquet.map((q) => q.id));
  for (let garde = 0; garde < 60; garde += 1) {
    if (/resultat\.html/.test(p.url())) { break; }
    if (!(await p.locator('.reponse').first().isVisible().catch(() => false))) { break; }
    const q = await p.evaluate(() => {
      const c = window.__jeu.s.paquet[window.__jeu.s.pos];
      return c ? { id: c.id, bonne: c.bonne } : null;
    });
    if (!q) { break; }
    const i = (q.id === rater) ? (q.bonne + 1) % 4 : q.bonne;
    await p.locator('.reponse').nth(i).click();
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(320);
    if (await p.locator('#f-suite').count()) {
      await p.locator('#f-suite').click();
      await p.waitForTimeout(280);
    }
  }
  await p.waitForTimeout(700);
  return paquet;
}

/* --- Premiere partie : on rate la premiere carte expres ----------------- */
await ouvrir();
await p.evaluate(() => localStorage.clear());
await ouvrir();
const premier = await p.evaluate(() => window.__jeu.s.paquet[0].id);
const paquet1 = await jouer(premier);

if (!/resultat\.html/.test(p.url())) {
  rate('la premiere partie ne mene pas au resultat', p.url().replace(B, ''));
} else { ok('une partie de trois cartes se termine et mene au resultat'); }

let d = await memoire();
if ((d.sessions || []).length !== 1) {
  rate('la partie n\'est pas enregistree', `${(d.sessions || []).length} session(s)`);
} else { ok('la partie est enregistree', `${d.sessions[0].total} cartes`); }

// MINI_POUR_LE_JOUR = 10 : trois cartes ne font pas une journee.
if ((d.jours || []).length) {
  rate('trois cartes ont marque le jour : la serie se gonflerait',
    JSON.stringify(d.jours));
} else { ok('trois cartes ne marquent pas le jour (le seuil est de dix)'); }

const f1 = (d.questions || {})[premier];
if (!f1 || f1.aRevoir !== true) {
  rate('la question ratee n\'est pas marquee a revoir', JSON.stringify(f1));
} else if (f1.depuis !== 1) {
  rate('apres UNE partie terminee, depuis devrait valoir 1',
    `depuis=${f1.depuis}`);
} else { ok('la question ratee est a revoir, et depuis vaut 1 apres une partie'); }

/* --- Deuxieme partie : elle doit etre la, et en premier ----------------- */
await ouvrir();
const paquet2 = await p.evaluate(() => window.__jeu.s.paquet.map((q) => q.id));
if (paquet2[0] !== premier) {
  rate('la question ratee n\'ouvre pas la partie suivante',
    `rang ${paquet2.indexOf(premier)} sur ${paquet2.length}`);
} else { ok('la question ratee ouvre la partie suivante', 'rang 0'); }

await jouer(null);              // tout juste, cette fois
d = await memoire();
const f2 = (d.questions || {})[premier];
if ((d.sessions || []).length !== 2) {
  rate('la deuxieme partie n\'est pas enregistree',
    `${(d.sessions || []).length} session(s)`);
} else { ok('deux parties enregistrees'); }
if (!f2 || f2.depuis !== 2) {
  rate('apres DEUX parties terminees, depuis devrait valoir 2',
    `depuis=${(f2 || {}).depuis}`);
} else { ok('le compteur avance d\'une partie a l\'autre', 'depuis=2'); }

if (erreurs.length) { rate('erreurs JavaScript', erreurs.join(' | ').slice(0, 120)); }
else { ok('aucune erreur JavaScript'); }

await nav.close();
console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
