/* LE PARCOURS COMPLET D'UN QCM.
 * Verifie les points de la recette (section 13) qui concernent le jeu.
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';

const B = 'http://127.0.0.1:8899';
let echecs = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); echecs++; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
});
await ctx.route('**', (r) => {
  const u = r.request().url();
  if (u.startsWith(B)) return r.continue();
  return r.abort();   // pas de polices distantes : le test ne depend pas du reseau
});
const p = await ctx.newPage();
const erreurs = [];
p.on('pageerror', (e) => erreurs.push(e.message));

/* LE TIRAGE EST FIGE, SINON CE QUI SUIT EST UN COUP DE DE.
   Le paquet est melange par defaut. Les assertions ci-dessous portent sur la
   PREMIERE carte : tant qu'elle est tiree au hasard, le controle passe ou
   echoue selon la carte du jour. Il est passe au vert le 22 aout, puis au
   rouge une heure plus tard sans qu'une ligne du rendu ait bouge — il etait
   simplement tombe sur l'une des trois questions « combien de versets compte
   la sourate X ? », qui n'ont pas de verset et donc pas de rosace. On coupe
   donc le melange : la premiere carte est toujours la meme, et un rouge veut
   enfin dire qu'une chose a casse. */
await p.goto(B + '/qcm.html?section=sens-des-sourates&n=20', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('ipap.v1', JSON.stringify({ reglages: { melanger: false } }));
});
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForSelector('.reponse', { timeout: 8000 });

// --- 1. La carte est complete -------------------------------------------
const carte = await p.evaluate(() => {
  const c = document.getElementById('carte');
  const b = c.querySelector('.cartouche');
  return {
    reponses: c.querySelectorAll('.reponse').length,
    // Une question tiree d'une sourate porte le bandeau enlumine (V2 §4) ;
    // les autres gardent le surtitre simple. L'une des deux, jamais rien.
    cartouche: !!b,
    bandeauAr: b ? (b.querySelector('.cartouche-ar') || {}).textContent || '' : '',
    bandeauFr: b ? (b.querySelector('.cartouche-fr') || {}).textContent || '' : '',
    surtitre: !!c.querySelector('.carte-surtitre'),
    question: !!c.querySelector('.t-question'),
    tampons: c.querySelectorAll('.tampon').length,
    rosace: !!c.querySelector('.carte-rosace svg'),
  };
});
if (carte.reponses !== 4) rate('la carte porte 4 reponses', carte.reponses);
else ok('4 reponses en colonne');
if (!carte.question || !(carte.cartouche || carte.surtitre)) rate('en-tete et question presents');
else ok('en-tete et question presents');
/* Le CARTOUCHE ne se verifie plus ici : depuis le 22 aout il se tait quand il
   donnerait la reponse, et la premiere carte de cette section est justement
   de celles-la (« De quelle sourate vient ce verset ? »). Il a son propre
   bloc en fin de fichier, sur une page a lui — chercher une carte a cartouche
   en avancant dans CE paquet fausserait tout ce qui suit, qui compte les
   cartes. */
if (!carte.rosace) rate('la rosace de section manque derriere le verset');
else ok('la rosace de section est derriere le verset');
if (carte.tampons !== 2) rate('les deux tampons sont montes', carte.tampons);
else ok('les deux tampons sont montes');

// --- 2. Droite SANS reponse choisie : la carte refuse de partir (7.5) ----
const avant = await p.evaluate(() => document.getElementById('qcm-compte').textContent);
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(400);
const apres = await p.evaluate(() => document.getElementById('qcm-compte').textContent);
if (avant !== apres) rate('sans reponse choisie, la carte ne doit pas partir', avant + ' -> ' + apres);
else ok('sans reponse choisie, la carte reste');
const annonce = await p.evaluate(() => document.getElementById('qcm-annonce').textContent);
if (!/choisis une réponse/i.test(annonce)) rate('le refus est annonce', annonce);
else ok('le refus est annonce a voix haute');

// --- 3. Toutes les cibles tactiles font 44 px (section 2.6) --------------
const petits = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('button').forEach((b) => {
    if (b.offsetParent === null) return;
    const r = b.getBoundingClientRect();
    if (r.height < 44 || r.width < 44) out.push(b.className + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
  });
  return out;
});
if (petits.length) rate('cibles tactiles sous 44 px', petits.join(' | '));
else ok('toutes les cibles font 44 px ou plus');

// --- 4. On repond JUSTE : la feuille verte, la serie monte --------------
const bonne = await p.evaluate(() => window.__b);
await p.evaluate(() => {
  // On lit la bonne reponse dans la banque, via la carte affichee.
  return null;
});
// On clique la reponse marquee bonne par le moteur : on la retrouve en
// comparant au texte de la banque chargee.
const idxBonne = await p.evaluate(async () => {
  const r = await fetch('data/questions/sens-des-sourates.json').then((x) => x.json());
  const question = document.querySelector('.t-question').textContent;
  const textes = [...document.querySelectorAll('.reponse .texte')].map((e) => e.textContent);
  const q = r.find((x) => x.question === question
    && x.reponses.every((rep, i) => rep === textes[i]));
  return q ? q.bonne : -1;
});
if (idxBonne < 0) { rate('impossible de retrouver la question dans la banque'); }
else {
  await p.locator('.reponse').nth(idxBonne).click();
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(600);
  const f = await p.evaluate(() => {
    const e = document.getElementById('feuille');
    return {
      ouverte: e.getAttribute('data-ouverte'),
      type: e.getAttribute('data-t'),
      titre: (e.querySelector('.f-titre') || {}).textContent || '',
      source: (e.querySelector('.f-source') || {}).textContent || '',
      notes: e.querySelectorAll('.f-note').length,
      serie: document.getElementById('qcm-serie').textContent.trim(),
      etat: document.getElementById('qcm-serie').getAttribute('data-etat'),
    };
  });
  if (f.ouverte !== 'oui' || f.type !== 'juste') rate('feuille de bonne reponse ouverte', JSON.stringify(f));
  else ok('bonne reponse : feuille verte ouverte', f.titre);
  if (!f.source) rate('la source est affichee dans la correction');
  else ok('la source est affichee', f.source.slice(0, 46));
  if (f.etat !== 'or') rate('la pastille de serie passe en or plein', f.etat);
  else ok('la serie passe en or plein', f.serie);
}

// --- 5. On continue, puis on repond FAUX -------------------------------
await p.locator('#f-suite').click();
await p.waitForTimeout(400);
const idx2 = await p.evaluate(async () => {
  const r = await fetch('data/questions/sens-des-sourates.json').then((x) => x.json());
  const question = document.querySelector('.t-question').textContent;
  const textes = [...document.querySelectorAll('.reponse .texte')].map((e) => e.textContent);
  const q = r.find((x) => x.question === question && x.reponses.every((rep, i) => rep === textes[i]));
  return q ? (q.bonne + 1) % 4 : -1;   // volontairement la mauvaise
});
await p.locator('.reponse').nth(idx2).click();
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(600);
const g = await p.evaluate(() => {
  const e = document.getElementById('feuille');
  return {
    type: e.getAttribute('data-t'),
    titre: (e.querySelector('.f-titre') || {}).textContent || '',
    texte: e.textContent,
    etat: document.getElementById('qcm-serie').getAttribute('data-etat'),
    bonne: document.querySelectorAll('.reponse[data-corrige="bonne"]').length,
    choix: document.querySelectorAll('.reponse[data-corrige="choix"]').length,
    autres: document.querySelectorAll('.reponse[data-corrige="autre"]').length,
  };
});
if (g.type !== 'rate') rate('feuille de mauvaise reponse', g.type);
else ok('mauvaise reponse : feuille ivoire', g.titre);
if (g.bonne !== 1 || g.choix !== 1 || g.autres !== 2) {
  rate('la grille est corrigee sur place', `bonne ${g.bonne}, choix ${g.choix}, autres ${g.autres}`);
} else ok('grille corrigee sur place : 1 bonne, 1 choix, 2 estompees');
if (g.etat !== 'gris') rate('la serie retombe en gris', g.etat);
else ok('la serie retombe en gris');
if (!/reviendra plus tard/.test(g.texte)) rate('la promesse de retour est affichee');
else ok('la promesse « cette question reviendra » est affichee');

// --- 6. La promesse de retour doit etre VRAIE (section 9) --------------
const revient = await p.evaluate(() => {
  // La question ratee doit se retrouver plus loin dans le paquet.
  const j = window.__jeu;
  if (!j) return null;
  const ids = j.s.paquet.map((q) => q.id);
  const ratee = j.s.reponses.filter((r) => r.juste === false).pop();
  if (!ratee) return null;
  const apres = ids.slice(j.s.pos).indexOf(ratee.id);
  return { id: ratee.id, dans: apres };
});
if (!revient) rate('impossible de verifier le retour de la question ratee');
else if (revient.dans < 0) rate('la question ratee n a PAS ete remise dans le paquet', revient.id);
else ok('la question ratee revient bien', revient.dans + ' cartes plus loin');

/* --- 7. Le bandeau enlumine, la ou il a le droit d'exister ---------------
   Sur une page neuve, pour ne pas deranger le comptage de cartes ci-dessus.
   On avance jusqu'a la premiere carte qui porte un cartouche et on verifie
   qu'il est complet. Aucune en vingt cartes voudrait dire que le cartouche a
   disparu du site — et c'est bien un echec, pas un detail. */
{
  /* AU NIVEAU EXPERT, ET C'EST LA QU'IL FAUT REGARDER. Le niveau 1 de cette
     section est fait a 26/29 de « De quelle sourate vient ce verset ? » : des
     questions dont le cartouche DOIT se taire. Le niveau 3, lui, n'est que
     traductions de versets — le cartouche y est chez lui, et son absence
     serait un vrai defaut. */
  const q = await ctx.newPage();
  await q.goto(B + '/qcm.html?section=sens-des-sourates&n=20&niveau=3', { waitUntil: 'domcontentloaded' });
  await q.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('ipap.v1', JSON.stringify({ reglages: { melanger: false } }));
  });
  await q.reload({ waitUntil: 'domcontentloaded' });
  await q.waitForSelector('.reponse', { timeout: 8000 });
  const lire = () => q.evaluate(() => {
    const b = document.getElementById('carte').querySelector('.cartouche');
    return {
      cartouche: !!b,
      ar: b ? (b.querySelector('.cartouche-ar') || {}).textContent || '' : '',
      fr: b ? (b.querySelector('.cartouche-fr') || {}).textContent || '' : '',
    };
  });
  let b = await lire(), sauts = 0;
  while (!b.cartouche && sauts < 19) {
    await q.locator('#cote-gauche').click();
    await q.waitForTimeout(420);
    b = await lire(); sauts++;
  }
  if (!b.cartouche) rate('aucune carte ne porte le bandeau enlumine en 20 cartes');
  else if (!/^سورة .+/.test(b.ar.trim()) || !/^Sourate .+/.test(b.fr.trim())) {
    rate('le cartouche ne porte pas les deux noms', b.ar + ' | ' + b.fr);
  } else ok('bandeau enlumine complet', b.fr + ' (carte ' + (sauts + 1) + ')');
  await q.close();
}

if (erreurs.length) rate('erreurs JavaScript', erreurs.join(' | '));
else ok('aucune erreur JavaScript');

await nav.close();
console.log(echecs === 0 ? '\nVERT' : `\nROUGE (${echecs})`);
process.exit(echecs === 0 ? 0 : 1);
