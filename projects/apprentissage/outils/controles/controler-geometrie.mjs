/* LA GEOMETRIE DIT-ELLE CE QUE LE CAHIER V2 DEMANDE ?
 *
 * On ne regarde pas si « ca fait joli » : on compte les sommets, on relit les
 * centres, on compare les opacites a la valeur pres. Ce sont les seules
 * choses qu'un dessin a la main ne tiendrait pas, et c'est pour ca que le
 * cahier interdit le dessin a la main.
 *
 *   1. les douze rosaces portent les (branches, ratio) du §3.2, et une etoile
 *      a n branches a bien 2n sommets ;
 *   2. la tuile du fond porte ses cinq etoiles AUX CINQ BONS CENTRES — c'est
 *      cet arrangement, et lui seul, qui fait que le carrelage se raccorde :
 *      une etoile a chaque coin, donc coupee en quatre, chaque quart
 *      retrouvant les trois autres chez les voisines ;
 *   3. les opacites du §3.3 sont celles qui arrivent a l'ecran.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));

// Le tableau du §3.2, recopie ici pour etre CONFRONTE aux donnees du site.
// C'est le seul endroit ou il est legitime de le recopier : un controle qui
// lit la meme source que ce qu'il controle ne controle rien.
const REGLAGES = [
  ['sens-des-sourates', 10, 0.66], ['lire-l-arabe', 8, 0.58],
  ['piliers-de-la-foi', 5, 0.60],  ['la-priere', 8, 0.68],
  ['histoire-des-prophetes', 7, 0.56], ['vie-du-prophete', 16, 0.78],
  ['le-comportement', 6, 0.56],    ['jeune-et-ramadan', 9, 0.62],
  ['zakat-et-aumone', 13, 0.72],   ['le-pelerinage', 12, 0.70],
  ['vocabulaire-arabe', 14, 0.74], ['les-invocations', 11, 0.68],
];

const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:390,height:900} });
await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
const p = await ctx.newPage();
const err=[]; p.on('pageerror',(e)=>err.push(e.message));
await p.goto(B+'/motifs.html', { waitUntil:'domcontentloaded' });
await p.waitForSelector('.jeton svg');

// --- 1. Les douze reglages, tels qu'ils arrivent a l'ecran ---------------
const sections = await p.evaluate(() => fetch('data/sections.json').then(r=>r.json()));
sections.sort((a,b)=>a.num-b.num);
if (sections.length !== 12) rate('il n y a pas douze sections', sections.length);
for (const [slug, n, ratio] of REGLAGES) {
  const s = sections.find((x) => x.slug === slug);
  if (!s) { rate('section absente de data/sections.json', slug); continue; }
  if (s.branches !== n || Math.abs(s.ratio - ratio) > 1e-9) {
    rate('reglage faux pour ' + slug, `n=${s.branches} ratio=${s.ratio}, attendu n=${n} ratio=${ratio}`);
  }
}
if (!ec) ok('les douze reglages du §3.2 sont ceux du site');

// --- 2. Une etoile a n branches a 2n sommets -----------------------------
const sommets = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.jeton').forEach((j) => {
    const d = j.querySelectorAll('svg g > path')[0].getAttribute('d');
    out.push((d.match(/[ML]/g) || []).length);
  });
  return out;
});
const attendus = sections.map((s) => 2 * s.branches);
if (JSON.stringify(sommets) !== JSON.stringify(attendus)) {
  rate('les etoiles n ont pas 2n sommets', sommets.join(',') + ' vs ' + attendus.join(','));
} else ok('chaque etoile a bien 2n sommets', sommets.join(' '));

// --- 3. La tuile porte ses cinq etoiles aux cinq bons centres ------------
// Le centre d'une etoile est la moyenne de ses sommets : c'est vrai pour
// toute figure a rayons alternes reguliers, et ca ne demande pas de faire
// confiance au generateur pour le verifier.
const centres = await p.evaluate(() => {
  const s = window.IPAP_GEO.tilePattern('t', '#000', 64, 15);
  const box = document.createElement('div');
  box.innerHTML = '<svg>' + s + '</svg>';
  const out = [];
  box.querySelectorAll('path').forEach((el) => {
    const d = el.getAttribute('d');
    // La croix diagonale n'est pas une etoile : elle ne se referme pas.
    if (!/Z$/.test(d)) return;
    const pts = d.slice(1, -1).split('L').map((x) => x.trim().split(' ').map(Number));
    const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length;
    const cy = pts.reduce((a, q) => a + q[1], 0) / pts.length;
    out.push([Math.round(cx * 100) / 100, Math.round(cy * 100) / 100]);
  });
  return out;
});
const T = 64;
const voulus = [[0,0],[T,0],[0,T],[T,T],[T/2,T/2]];
const memeJeu = centres.length === 5 && voulus.every(([x,y]) =>
  centres.some(([a,b]) => Math.abs(a-x) < 0.02 && Math.abs(b-y) < 0.02));
if (!memeJeu) rate('les etoiles de la tuile ne sont pas aux coins et au centre', JSON.stringify(centres));
else ok('la tuile se raccorde : une etoile a chaque coin, une au centre');

// --- 4. Les opacites du §3.3 et du §3.4 arrivent bien a l ecran ----------
const op = await p.evaluate(() => [...document.querySelectorAll('.essai .calque-motif')]
  .map((e) => parseFloat(getComputedStyle(e).opacity)));
const opVoulues = [0.055, 0.13, 0.13, 0.20];
const dérive = op.map((v, i) => Math.abs(v - opVoulues[i])).filter((d) => d > 0.0005);
if (op.length !== 4 || dérive.length) rate('opacites de carrelage fausses', op.join(', '));
else ok('les quatre opacites de carrelage sont exactes', op.join(' · '));

// --- 5. Les motifs sont muets pour les lecteurs d ecran ------------------
const parlants = await p.evaluate(() => {
  const out = [];
  document.querySelectorAll('.calque-motif, .jeton-cadre svg, .carte-rosace svg').forEach((e) => {
    if (e.getAttribute('aria-hidden') !== 'true') out.push(e.className.baseVal || e.tagName);
  });
  return out;
});
if (parlants.length) rate(parlants.length + ' motif(s) sans aria-hidden', parlants.join(' | '));
else ok('tous les motifs sont aria-hidden');

/* --- 6. Et sur la carte de QCM : la rosace a la bonne opacite ------------
   ON FIGE LE TIRAGE. La rosace vit DANS le bloc du verset ; une carte sans
   verset n'en a pas, et c'est normal — les questions « combien de versets
   compte la sourate X ? » et celles de pratique n'en montrent aucun. Tant que
   la premiere carte etait tiree au hasard, ce controle repondait a la carte du
   jour et non au rendu. */
await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem('ipap.v1', JSON.stringify({ reglages: { melanger: false } }));
});
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForSelector('.reponse');
const carte = await p.evaluate(() => {
  const r = document.querySelector('.carte-rosace');
  const f = document.querySelector('.fond-motif .calque-motif');
  const svg = r && r.querySelector('svg');
  return {
    rosace: r ? parseFloat(getComputedStyle(r).opacity) : null,
    taille: svg ? svg.getAttribute('width') : null,
    fond: f ? parseFloat(getComputedStyle(f).opacity) : null,
  };
});
if (carte.rosace === null) rate('pas de rosace derriere le verset');
else if (Math.abs(carte.rosace - 0.09) > 0.0005) rate('la rosace de carte n est pas a 9 %', carte.rosace);
else if (carte.taille !== '190') rate('la rosace de carte ne fait pas 190 px', carte.taille);
else ok('rosace de carte : 190 px a 9 %');
if (carte.fond === null) rate('pas de fond carrele sur l ecran de QCM');
else if (Math.abs(carte.fond - 0.055) > 0.0005) rate('le fond de QCM n est pas a 5,5 %', carte.fond);
else ok('fond de QCM : 5,5 %');

/* LE CARTOUCHE, SUR LES 2 681 QUESTIONS, ET SURTOUT : IL NE REPOND JAMAIS.
   Deux choses a la fois, parce qu'elles se contredisent et que c'est
   justement la qu'on se trompe :

     1. une question tiree d'une sourate porte son cartouche complet — les
        sources s'ecrivent de deux facons, et la forme « sourate Al-Asr (103) »
        a passe des semaines a retomber sur le surtitre simple ;
     2. SAUF quand le cartouche donnerait la reponse. « De quelle sourate
        vient ce verset ? » avec SOURATE AT-TAKATHUR ecrit au-dessus et
        At-Takathur en reponse D : 51 questions etaient dans ce cas, et c'est
        Mohamed qui l'a vu, pas moi.

   Le point 2 prime. Un cartouche manquant est un decor en moins ; un
   cartouche qui repond est une question en moins. */
const bandeaux = await p.evaluate(async () => {
  const carte = document.getElementById('carte');
  const secs = await fetch('data/sections.json').then((r) => r.json());
  const out = { total: 0, avec: 0, sans: [], fuites: [] };
  for (const s of secs) {
    const b = await fetch('data/questions/' + s.slug + '.json')
      .then((r) => (r.ok ? r.json() : [])).catch(() => []);
    for (const q of b) {
      carte.innerHTML = window.IPAP_QCM.carteHTML(q, true);
      const c = carte.querySelector('.cartouche');

      // 2. AUCUN cartouche affiche ne contient le texte d'une reponse.
      //    On enleve l'article des noms de sourate (Al-, An-, At-…) : c'est
      //    « Takathur » qui trahit, meme sans son article.
      if (c) {
        const t = (c.textContent || '').toLowerCase();
        for (const r of q.reponses || []) {
          const rr = String(r).toLowerCase().replace(/^(al|an|at|as|ash|az)[- ]/, '');
          if (rr.length >= 4 && t.indexOf(rr) >= 0) {
            out.fuites.push(s.slug + '/' + q.id + ' : « ' + c.textContent.trim()
              + ' » donne la reponse « ' + r + ' »');
          }
        }
      }

      // 1. La couverture du cartouche, la ou il n'y a rien a trahir.
      if (!/Coran,\s*sourate/.test(q.source || '')) continue;
      out.total++;
      const ar = c && c.querySelector('.cartouche-ar');
      const fr = c && c.querySelector('.cartouche-fr');
      if (c && /^سورة .+/.test((ar || {}).textContent || '')
            && /^Sourate .+/.test((fr || {}).textContent || '')) { out.avec++; }
      else if (c) { out.sans.push(s.slug + '/' + q.id + ' — cartouche incomplet'); }
    }
  }
  return out;
});
if (bandeaux.fuites.length) {
  rate(bandeaux.fuites.length + ' cartouche(s) donnent la reponse',
       bandeaux.fuites.slice(0, 3).join(' | '));
} else ok('aucun cartouche ne donne la reponse', bandeaux.total + ' questions de sourate passees');
if (bandeaux.sans.length) {
  rate(bandeaux.sans.length + ' cartouche(s) affiche(s) mais incomplet(s)',
       bandeaux.sans.slice(0, 5).join(' | '));
} else ok('tout cartouche affiche porte ses deux noms', bandeaux.avec + ' cartouches');

if (err.length) rate('erreurs JavaScript', err.join(' | ')); else ok('aucune erreur JavaScript');
await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
