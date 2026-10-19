/* ==========================================================================
   CONTROLE — `data/` ne contient que ce que le site telecharge

   POURQUOI
   --------
   `publier.py` copie tout sauf `outils/`. Un fichier pose dans `data/` part
   donc en production, qu'une page le lise ou non. Et un fichier qui s'y
   trouve a l'air d'etre une donnee du site : la prochaine personne le croira.

   CE QUE LA MESURE DU 19 OCTOBRE A TROUVE
   ---------------------------------------
   `data/lexique.json`, 19 Ko : les 143 mots arabes dont le sens francais est
   mesure sur la traduction de Hamidullah. AUCUNE page ne le telecharge — ni
   les 53 adresses du sitemap, ni un seul ecran de jeu. Il est lu par DEUX
   GENERATEURS, `enrichir-explications.py` et `faire-questions-claude.py`, au
   moment de la fabrication. C'est une donnee d'outil, pas une donnee de site.
   Deplace dans `outils/`, d'ou il ne sort pas.

   Les quatre autres fichiers de `data/` sont bien telecharges :

       data/sections.json          18 pages
       data/index-sections.json    15 pages
       data/images.json            14 pages
       data/noms-sourates.json      3 pages

   CE QU'IL VERIFIE
   ----------------
   Il ouvre les 53 adresses, les ecrans de jeu, et UN QCM PAR SECTION PLEINE
   — les onze — puis compare les requetes observees au contenu de `data/`.
   Tout fichier jamais demande est une faute.

   LE PIEGE DE LA PREMIERE VERSION. Ma sonde n'ouvrait que trois QCM, et elle
   a donc declare « jamais demandes » huit banques de questions qui ne sont
   simplement telechargees que quand on joue leur section. Un controle qui ne
   visite pas tout ne mesure pas l'absence, il mesure son propre parcours.
   ========================================================================== */

import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';
import fs from 'fs';

const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec += 1; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const RACINE = new URL('../../', import.meta.url);
const sm = fs.readFileSync(new URL('sitemap.xml', RACINE), 'utf8');
const sections = JSON.parse(fs.readFileSync(new URL('data/sections.json', RACINE), 'utf8'));

/* Les sections QUI ONT une banque : une section vide n'a rien a telecharger,
   et exiger sa banque serait exiger un fichier qui n'existe pas. */
const pleines = sections.filter((s) => {
  try {
    return JSON.parse(fs.readFileSync(
      new URL(`data/questions/${s.slug}.json`, RACINE), 'utf8')).length > 0;
  } catch (e) { return false; }
}).map((s) => s.slug);

const PAGES = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace('https://islampasapas.fr/', ''))
  .concat(['progres.html', 'corrige.html', 'resultat.html'])
  .concat(pleines.map((s) => `section/${s}/qcm`))
  .concat(pleines.map((s) => `qcm.html?section=${s}&n=3`));

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'] });
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
await brancherPolices(ctx);
const p = await ctx.newPage();
const demandes = new Map();
let page = '';
p.on('request', (r) => {
  const m = r.url().match(/\/(data\/[^?]+)/);
  if (!m) { return; }
  if (!demandes.has(m[1])) { demandes.set(m[1], new Set()); }
  demandes.get(m[1]).add(page);
});

for (const u of PAGES) {
  page = u || '/';
  await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' }).catch(() => null);
  await attendrePolices(p).catch(() => null);
  await p.waitForTimeout(600);
}
await nav.close();

const surDisque = [
  ...fs.readdirSync(new URL('data/', RACINE)).filter((f) => f.endsWith('.json'))
    .map((f) => 'data/' + f),
  ...fs.readdirSync(new URL('data/questions/', RACINE)).filter((f) => f.endsWith('.json'))
    .map((f) => 'data/questions/' + f),
];
const ko = (f) => Math.round(fs.statSync(new URL(f, RACINE)).size / 1024);

const jamais = surDisque.filter((f) => !demandes.has(f));
if (jamais.length) {
  rate(`${jamais.length} fichier(s) de data/ que le site ne telecharge jamais`,
    jamais.map((f) => `${f} (${ko(f)} Ko)`).join(', '));
  console.log('         data/ part en production : un fichier que personne ne');
  console.log('         demande se publie pour rien, et passe pour une donnee');
  console.log('         du site. Si c\'est une donnee d\'outil, sa place est');
  console.log('         dans outils/, que publier.py n\'emporte pas.');
} else {
  ok(`les ${surDisque.length} fichiers de data/ sont tous telecharges`,
    `${PAGES.length} pages visitees, dont un QCM par section pleine`);
}

// Et l'inverse : une page ne doit pas demander un fichier absent du disque.
const fantomes = [...demandes.keys()].filter((f) => !surDisque.includes(f));
if (fantomes.length) {
  rate('des pages demandent des fichiers qui ne sont pas sur le disque',
    fantomes.join(', '));
} else { ok('aucune page ne demande un fichier absent'); }

for (const [f, pages] of [...demandes].sort()) {
  console.log(`         ${String(ko(f)).padStart(5)} Ko  ${f}  — ${pages.size} page(s)`);
}

console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
