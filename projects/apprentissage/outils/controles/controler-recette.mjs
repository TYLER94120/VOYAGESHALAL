/* LA RECETTE : CE QUI NE DOIT PAS AVOIR BOUGE.
 *
 * Le cahier V2 est une couche VISUELLE. Sa section 9 liste treize choses qui
 * doivent fonctionner exactement comme avant la refonte, et son §10 demande
 * qu'on le verifie apres coup — pas qu'on l'affirme.
 *
 * C'est ce que fait ce controle. Il ne regarde pas si le site est joli : il
 * regarde si le geste garde ses seuils, si la serie monte et retombe, si le
 * curseur va toujours de 20 a 100, si une question ratee revient, si la
 * progression s'exporte et se reimporte, et si les motifs restent muets.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

async function page(opts) {
  const ctx = await nav.newContext(Object.assign({
    viewport:{width:390,height:844}, isMobile:true, hasTouch:true }, opts || {}));
  await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  p.__err = []; p.on('pageerror', (e) => p.__err.push(e.message));
  return p;
}

/* --- 1. Les seuils du geste (section 9, premier point) ------------------ */
{
  const p = await page();
  await p.goto(B+'/js/geste.js', { waitUntil:'domcontentloaded' });
  const src = await p.evaluate(() => document.body.textContent);
  const val = (n) => {
    const m = new RegExp('var ' + n + ' = ([0-9.]+)').exec(src);
    return m ? parseFloat(m[1]) : null;
  };
  const voulu = { SEUIL_INDICE: 60, SEUIL_VALIDE: 100, VITESSE_VALIDE: 0.4,
                  INCLINAISON_DIV: 18, INCLINAISON_MAX: 8, VIBRE_SEUIL: 10, VIBRE_JUSTE: 25 };
  const faux = Object.keys(voulu).filter((k) => val(k) !== voulu[k])
    .map((k) => k + '=' + val(k) + ' au lieu de ' + voulu[k]);
  if (faux.length) rate('les seuils du geste ont bouge', faux.join(', '));
  else ok('les seuils du geste sont ceux de la section 7', '60 / 100 / 0,4 / 18 / 8');

  await p.goto(B+'/css/qcm.css', { waitUntil:'domcontentloaded' });
  const css = await p.evaluate(() => document.body.textContent);
  const duree = [['envol', /data-anime="envol"\][^}]*transform (\d+)ms/, 220],
                 ['retour', /data-anime="retour"\][^}]*transform (\d+)ms/, 180],
                 ['secousse', /data-anime="secousse"\][^}]*secousse (\d+)ms/, 150]];
  const mauvais = duree.filter(([, re, v]) => {
    const m = re.exec(css); return !m || parseInt(m[1], 10) !== v;
  }).map(([n]) => n);
  if (mauvais.length) rate('des durees d animation ont bouge', mauvais.join(', '));
  else ok('envol 220 ms, retour 180 ms, secousse 150 ms');
  await p.context().close();
}

/* --- 2. La serie : monte, se souvient, retombe, se coupe --------------- */
{
  const p = await page();
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');

  async function repondre(juste) {
    const i = await p.evaluate((j) => {
      const q = window.__jeu.s.courante();
      return j ? q.bonne : (q.bonne + 1) % 4;
    }, juste);
    await p.locator('.reponse').nth(i).click();
    await p.locator('#cote-droite').click();
    await p.waitForTimeout(600);
    const etat = await p.evaluate(() => ({
      serie: document.getElementById('qcm-serie').textContent.trim(),
      ton: document.getElementById('qcm-serie').getAttribute('data-etat'),
      record: window.__jeu.s.record,
    }));
    if (await p.locator('#f-suite').count()) { await p.locator('#f-suite').click(); await p.waitForTimeout(400); }
    return etat;
  }

  const a = await repondre(true);
  const b = await repondre(true);
  if (!/1 d/.test(a.serie) || !/2 d/.test(b.serie)) rate('la serie ne monte pas', a.serie + ' puis ' + b.serie);
  else ok('la serie monte', a.serie + ' puis ' + b.serie);
  if (b.ton !== 'or') rate('la pastille ne passe pas en or', b.ton);
  else ok('la pastille passe en or plein');

  const c = await repondre(false);
  if (!/0 d/.test(c.serie)) rate('la serie ne retombe pas a zero', c.serie);
  else ok('la serie retombe a zero, sans drame');
  if (c.ton !== 'gris') rate('la pastille ne retombe pas en gris', c.ton);
  else ok('la pastille retombe en gris');

  // Le record survit a la partie.
  const record = await p.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('ipap.v1') || '{}');
    return d.recordSerie;
  });
  if (record !== 2) rate('le record de serie n est pas garde', record);
  else ok('le record de serie est garde', record);

  // Et elle se coupe.
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20&serie=0', { waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');
  const cachee = await p.evaluate(() => document.getElementById('qcm-serie').hasAttribute('hidden'));
  if (!cachee) rate('la serie ne se coupe pas');
  else ok('la serie se coupe, et rien d autre ne change');
  if (p.__err.length) rate('erreurs JavaScript (serie)', p.__err.join(' | '));
  await p.context().close();
}

/* --- 3. Le curseur 20-100, les cinq raccourcis, les deux modes --------- */
{
  const p = await page();
  await p.goto(B+'/section/sens-des-sourates/qcm', { waitUntil:'domcontentloaded' });
  await p.waitForSelector('#curseur');
  const r = await p.evaluate(() => {
    const c = document.getElementById('curseur');
    return {
      min: c.min, max: c.max,
      raccourcis: [...document.querySelectorAll('#raccourcis button')].map((b) => b.textContent.trim()),
      modes: [...document.querySelectorAll('.mode')].map((m) => m.getAttribute('data-mode')),
    };
  });
  if (r.min !== '20' || r.max !== '100') rate('le curseur ne va plus de 20 a 100', r.min + '-' + r.max);
  else ok('le curseur va de 20 a 100');
  if (r.raccourcis.length !== 5) rate('il n y a pas cinq raccourcis', r.raccourcis.join(', '));
  else ok('cinq raccourcis', r.raccourcis.join(' · '));
  if (r.modes.length !== 2 || r.modes.indexOf('apprentissage') < 0 || r.modes.indexOf('examen') < 0) {
    rate('les deux modes de correction ne sont pas la', r.modes.join(', '));
  } else ok('les deux modes de correction sont la', r.modes.join(' · '));
  if (p.__err.length) rate('erreurs JavaScript (reglages)', p.__err.join(' | '));
  await p.context().close();
}

/* --- 4. Une question ratee revient, une question passee aussi ---------- */
{
  const p = await page();
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');

  const idRate = await p.evaluate(() => window.__jeu.s.courante().id);
  const faux = await p.evaluate(() => (window.__jeu.s.courante().bonne + 1) % 4);
  await p.locator('.reponse').nth(faux).click();
  await p.locator('#cote-droite').click();
  await p.waitForTimeout(600);
  if (await p.locator('#f-suite').count()) { await p.locator('#f-suite').click(); await p.waitForTimeout(400); }
  const dansRate = await p.evaluate((id) => {
    const j = window.__jeu;
    return j.s.paquet.slice(j.s.pos).map((q) => q.id).indexOf(id);
  }, idRate);
  if (dansRate < 0) rate('une question ratee ne revient pas', idRate);
  else ok('une question ratee revient', dansRate + ' cartes plus loin');

  const idPasse = await p.evaluate(() => window.__jeu.s.courante().id);
  await p.locator('#cote-gauche').click();
  await p.waitForTimeout(600);
  const dansPasse = await p.evaluate((id) => {
    const j = window.__jeu;
    return j.s.paquet.slice(j.s.pos).map((q) => q.id).indexOf(id);
  }, idPasse);
  if (dansPasse < 0) rate('une question passee ne revient pas', idPasse);
  else ok('une question passee revient', dansPasse + ' cartes plus loin');
  if (p.__err.length) rate('erreurs JavaScript (retour)', p.__err.join(' | '));
  await p.context().close();
}

/* --- 5. L export et l import de la progression -------------------------- */
{
  const p = await page();
  await p.goto(B+'/plus.html', { waitUntil:'domcontentloaded' });
  const bilan = await p.evaluate(() => {
    const M = window.IPAP_MEMOIRE;
    localStorage.clear();
    const d = M.charger();
    d.recordSerie = 7;
    d.questions['essai-1'] = { vues: 3, justes: 2, aRevoir: true };
    M.ranger(d);

    const texte = M.exporter(M.charger());
    localStorage.clear();                       // on efface tout
    const relu = M.importer(texte);
    M.ranger(relu);
    const apres = M.charger();

    // Deux facons d'abimer un fichier : illisible, et lisible mais vide de
    // progression. Les deux doivent etre refusees, pas ignorees en silence.
    function refuse(t) {
      try { M.importer(t); return false; } catch (e) { return true; }
    }
    return {
      ok: apres.recordSerie === 7
          && apres.questions['essai-1'] && apres.questions['essai-1'].vues === 3,
      record: apres.recordSerie,
      illisible: refuse('{ceci n est pas du json'),
      sansProgression: refuse('{"v":1}'),
    };
  });
  if (!bilan.ok) rate('l export/import ne rend pas la progression', JSON.stringify(bilan));
  else ok('la progression s exporte et se reimporte', 'record ' + bilan.record);
  if (!bilan.illisible) rate('un fichier illisible a ete accepte a l import');
  else if (!bilan.sansProgression) rate('un fichier sans progression a ete accepte');
  else ok('un fichier abime est refuse, dans les deux cas');
  if (p.__err.length) rate('erreurs JavaScript (export)', p.__err.join(' | '));
  await p.context().close();
}

/* --- 6. prefers-reduced-motion : la carte ne vole plus, mais elle part -- */
{
  const p = await page({ reducedMotion: 'reduce' });
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');
  const q1 = await p.evaluate(() => document.querySelector('.t-question').textContent
    + '|' + [...document.querySelectorAll('.reponse .texte')].map((e) => e.textContent).join('|'));
  await p.locator('#cote-gauche').click();
  await p.waitForTimeout(120);
  const bouge = await p.evaluate(() => document.getElementById('carte').style.transform);
  await p.waitForTimeout(500);
  const q2 = await p.evaluate(() => document.querySelector('.t-question').textContent
    + '|' + [...document.querySelectorAll('.reponse .texte')].map((e) => e.textContent).join('|'));
  if (bouge && /translate/.test(bouge)) rate('la carte se deplace malgre prefers-reduced-motion', bouge);
  else ok('sans animation, la carte ne se deplace pas');
  if (q1 === q2) rate('sans animation, on ne passe plus a la carte suivante');
  else ok('sans animation, on passe quand meme a la suivante');
  if (p.__err.length) rate('erreurs JavaScript (sans animation)', p.__err.join(' | '));
  await p.context().close();
}

/* --- 7. Les motifs sont muets et hors du chemin ------------------------- */
{
  const p = await page();
  for (const url of ['/qcm.html?section=sens-des-sourates&n=20', '/sections.html',
                     '/section/sens-des-sourates']) {
    await p.goto(B+url, { waitUntil:'domcontentloaded' });
    await p.waitForTimeout(800);
    const mauvais = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.calque-motif, .fond-motif, .filigrane, .carte-rosace, '
        + '.calli-rosace, .rosace-score, .couv-signature').forEach((e) => {
        if (e.getAttribute('aria-hidden') !== 'true' && !e.closest('[aria-hidden="true"]')) {
          out.push('sans aria-hidden : ' + (e.className.baseVal || e.className));
        }
        if (e.tabIndex > 0 || e.querySelector('[tabindex]:not([tabindex="-1"]), a, button')) {
          out.push('dans le chemin du clavier : ' + (e.className.baseVal || e.className));
        }
      });
      return out;
    });
    if (mauvais.length) rate('motifs mal poses sur ' + url, mauvais.slice(0, 3).join(' | '));
  }
  if (!ec) { /* rien */ }
  ok('les motifs sont muets et hors du chemin du clavier, sur les trois ecrans');
  if (p.__err.length) rate('erreurs JavaScript (motifs)', p.__err.join(' | '));
  await p.context().close();
}

await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
