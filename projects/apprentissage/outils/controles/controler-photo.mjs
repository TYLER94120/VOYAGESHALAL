/* LE TYPE « PHOTO » : LE MOTEUR, AVEC ET SANS CATALOGUE.
 *
 * Le site n'a encore aucune photo sous licence verifiee, donc aucune question
 * de ce type n'est publiee. Le moteur, lui, existe, et il doit tenir deux
 * promesses opposees du cahier V2 (7.3) :
 *
 *   1. avec une entree de catalogue COMPLETE, la question est tiree et la
 *      photo s'affiche avec son alt, en AVIF puis WebP, deux densites ;
 *   2. avec une entree INCOMPLETE — ou aucune — la question est ECARTEE DU
 *      TIRAGE, jamais affichee cassee, jamais affichee avec son cadre
 *      « photo a sourcer ».
 *
 * On ne pose rien sur le disque : la banque et le catalogue sont fournis par
 * interception, ce qui permet aussi de verifier le cas ou tout est en place
 * sans avoir a inventer une photo.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));

const QUESTION = {
  id: 'essai-photo-1', section: 'le-pelerinage', type: 'photo',
  image: 'img/questions/essai', difficulte: 2,
  theme: 'Les lieux', surtitre: 'Le pèlerinage · les lieux',
  question: 'Quel lieu est-ce ?',
  reponses: ['Un', 'Deux', 'Trois', 'Quatre'], bonne: 1,
  explication: 'Question d\'essai, jamais publiee.',
  source: 'Essai de moteur.',
};
const COMPLET = { 'img/questions/essai': {
  fichier: 'img/questions/essai', alt: 'Une cour de mosquée, vide',
  credit: 'Essai', licence: 'Essai', source: 'essai' } };
const INCOMPLET = { 'img/questions/essai': {
  fichier: 'img/questions/essai', alt: 'Une cour de mosquée, vide' } };  // ni credit ni licence

const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

async function jouer(catalogue) {
  const ctx = await nav.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
  await ctx.route('**', (r) => {
    const u = r.request().url();
    if (!u.startsWith(B)) return r.abort();
    if (u.includes('data/images.json')) {
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify(catalogue) });
    }
    if (u.includes('data/questions/le-pelerinage.json')) {
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify([QUESTION]) });
    }
    // Aucune image reelle n'existe : on renvoie un corps vide plutot que 404,
    // pour que l'absence d'image ne fasse pas de bruit dans la console.
    if (/\.(avif|webp)$/.test(u)) return r.fulfill({ status: 200, body: '' });
    return r.continue();
  });
  const p = await ctx.newPage();
  const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto(B+'/qcm.html?section=le-pelerinage&n=20', { waitUntil:'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil:'domcontentloaded' });
  await p.waitForTimeout(900);
  const etat = await p.evaluate(() => ({
    joue: !!document.querySelector('.reponse'),
    photo: !!document.querySelector('.carte .photo'),
    picture: !!document.querySelector('.carte .photo picture'),
    alt: (document.querySelector('.carte .photo img') || {}).alt || null,
    sources: [...document.querySelectorAll('.carte .photo source')].map((s) => s.type + ' ' + s.srcset),
    voile: !!document.querySelector('.carte .photo-voile'),
    manque: !!document.querySelector('.carte .photo-manque'),
    vide: (document.getElementById('zone').textContent || '').indexOf('Rien à jouer') >= 0,
  }));
  await ctx.close();
  return { etat, err };
}

// --- 1. Catalogue complet : la question se joue --------------------------
{
  const { etat, err } = await jouer(COMPLET);
  if (!etat.joue) rate('avec un catalogue complet, la question n est pas tiree');
  else ok('avec un catalogue complet, la question se joue');
  if (!etat.photo || !etat.picture) rate('la photo n est pas montee sur la carte', JSON.stringify(etat));
  else ok('la photo est montee sur la carte');
  if (etat.alt !== 'Une cour de mosquée, vide') rate('l alt n est pas celui du catalogue', etat.alt);
  else ok('l alt vient du catalogue', etat.alt);
  const t = etat.sources.join(' | ');
  if (!/image\/avif/.test(t) || !/image\/webp/.test(t)) rate('AVIF et WebP ne sont pas tous deux proposes', t);
  else if (!/2x/.test(t)) rate('la densite 2x manque', t);
  else ok('AVIF puis WebP, en deux densites');
  if (!etat.voile) rate('le voile degrade manque : le texte pose dessus serait illisible');
  else ok('le voile degrade est applique');
  if (etat.manque) rate('le cadre « photo a sourcer » s affiche alors que la photo existe');
  else ok('pas de cadre « photo a sourcer » quand la photo existe');
  if (err.length) rate('erreurs JavaScript', err.join(' | '));
}

// --- 2. Catalogue incomplet : la question est ecartee --------------------
{
  const { etat, err } = await jouer(INCOMPLET);
  if (etat.joue) rate('une question sans licence tracee a quand meme ete tiree');
  else ok('sans credit ni licence, la question est ecartee du tirage');
  if (etat.manque) rate('le cadre « photo a sourcer » est tombe sur quelqu un en pleine partie');
  else ok('personne ne rencontre le cadre « photo a sourcer » en jouant');
  if (!etat.vide) rate('on n annonce pas que la section n a rien a jouer');
  else ok('la section annonce qu elle n a rien a jouer');
  if (err.length) rate('erreurs JavaScript', err.join(' | '));
}

await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
