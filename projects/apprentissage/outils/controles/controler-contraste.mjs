/* AUCUN GRIS PLUS CLAIR QUE #5F6D66 SUR IVOIRE.
 *
 * C'est la regle 2.4 du cahier initial, et elle n'a pas de nuance : au-dessus
 * de cette valeur, le texte devient penible a lire sur le fond du site, en
 * particulier dehors, sur un telephone, au soleil — c'est-a-dire dans les
 * conditions ou ce site sera vraiment utilise.
 *
 * On ne relit pas le CSS : on regarde ce que le NAVIGATEUR calcule, sur
 * chaque element de texte reellement affiche, opacite comprise. Un gris
 * conforme dans la feuille de style mais pose dans un bloc a 55 % d'opacite
 * n'est pas conforme a l'ecran, et c'est l'ecran qui compte.
 *
 * On verifie aussi le seuil WCAG AA (4.5:1, ou 3:1 pour le gros texte), qui
 * est la meme exigence dite autrement et qui attrape les textes clairs poses
 * sur du vert ou sur une photo.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));

const PAGES = [
  '/', '/sections.html', '/section/sens-des-sourates', '/section/sens-des-sourates/qcm',
  '/qcm.html?section=sens-des-sourates&n=20', '/qcm.html?section=lire-l-arabe&n=20',
  '/progres.html', '/plus.html', '/motifs.html',
];

const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
const p = await ctx.newPage();
const err = []; p.on('pageerror', (e) => err.push(e.message));

const MESURE = () => {
  /* Luminance relative WCAG, et fusion d'une couleur sur son fond. */
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const lire = (s) => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) { return null; }
    const n = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: n.slice(0, 3), a: n.length > 3 ? n[3] : 1 };
  };
  const poser = (av, ar, a) => av.map((v, i) => Math.round(v * a + ar[i] * (1 - a)));

  /* Le fond reellement derriere un element : on remonte jusqu'a trouver une
     couleur opaque. Un fond transparent ne dit rien. */
  const fondDe = (e) => {
    let n = e, f = [255, 255, 255];
    while (n && n !== document.documentElement.parentNode) {
      const c = lire(getComputedStyle(n).backgroundColor);
      if (c && c.a >= 0.999) { f = c.rgb; break; }
      n = n.parentElement;
    }
    return f;
  };

  /* L'opacite reelle : celle de l'element et de tous ses parents. */
  const opaciteDe = (e) => {
    let o = 1, n = e;
    while (n && n.nodeType === 1) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (!isNaN(v)) { o *= v; }
      n = n.parentElement;
    }
    return o;
  };

  const out = [];
  document.querySelectorAll('*').forEach((e) => {
    // Seulement le texte VISIBLE, et seulement celui que l'element porte
    // lui-meme : sinon on mesure douze fois la meme ligne.
    const propre = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!propre) { return; }
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) { return; }
    const st = getComputedStyle(e);
    if (st.visibility === 'hidden' || st.display === 'none') { return; }
    const o = opaciteDe(e);
    if (o < 0.05) { return; }

    const c = lire(st.color);
    if (!c) { return; }
    const fond = fondDe(e);
    const couleur = poser(c.rgb, fond, c.a * o);
    const taille = parseFloat(st.fontSize);
    const gras = parseInt(st.fontWeight, 10) >= 600;
    const gros = taille >= 24 || (taille >= 18.66 && gras);

    const l1 = lum(couleur), l2 = lum(fond);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    out.push({
      texte: (e.textContent || '').trim().slice(0, 34),
      couleur: 'rgb(' + couleur.join(',') + ')',
      lum: l1, fondLum: l2, ratio: Math.round(ratio * 100) / 100,
      seuil: gros ? 3 : 4.5, taille: Math.round(taille * 10) / 10,
      // « Plus clair que #5F6D66 » se mesure en luminance, pas en canaux :
      // c'est la clarte percue qui compte, et c'est elle que la regle vise.
      surIvoire: l2 > 0.7,
      // ... mais la regle dit « aucun GRIS plus clair ». L'or de la marque
      // n'est pas un gris : il est sature, il se distingue du fond autrement
      // que par sa clarte, et c'est le seuil WCAG qui le juge. Sans cette
      // distinction, le controle condamnait la palette du cahier lui-meme.
      saturation: (Math.max.apply(null, couleur) - Math.min.apply(null, couleur))
                  / (Math.max.apply(null, couleur) || 1),
    });
  });
  return out;
};

// La luminance de #5F6D66, calculee une fois : c'est le plancher.
const PLANCHER = (() => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(0x5F) + 0.7152 * f(0x6D) + 0.0722 * f(0x66);
})();

/* UNE SEULE EXCEPTION, DECLAREE, ET REPETEE A CHAQUE PASSAGE.
   Le cahier V2 fixe lui-meme la couleur du nom francais dans le cartouche
   (#9A7A12 sur #FCF8EC, section 4). Ce couple donne 3,83:1, sous les 4,5:1
   de WCAG AA. Le cahier interdit de changer ses valeurs et demande de
   signaler celles qu'on croit mauvaises : c'est donc signale ici, a chaque
   passage, plutot que corrige en douce ou passe sous silence.

   Elle n'est pas « toleree » : elle est VISIBLE. Le jour ou Mohamed tranche,
   une ligne disparait. */
const EXCEPTIONS = [{
  couleur: 'rgb(154,122,18)',
  quoi: 'nom francais du cartouche',
  pourquoi: '#9A7A12 sur #FCF8EC, valeur imposee par le cahier V2 section 4',
}];

let vus = 0;
const tropClair = [], sousSeuil = [], signales = [];

for (const url of PAGES) {
  await p.goto(B + url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const mesures = await p.evaluate(MESURE);
  vus += mesures.length;
  for (const m of mesures) {
    const exc = EXCEPTIONS.find((e) => e.couleur === m.couleur);
    // Le plancher #5F6D66 ne vise que les GRIS. Un or sature est juge par
    // le seuil WCAG, comme n'importe quelle couleur de marque.
    if (m.surIvoire && m.saturation < 0.20 && m.lum > PLANCHER + 0.002) {
      tropClair.push(url + ' « ' + m.texte + ' » ' + m.couleur);
    }
    if (m.ratio < m.seuil) {
      const ligne = url + ' « ' + m.texte + ' » ' + m.ratio + ' pour ' + m.seuil
        + ' (' + m.couleur + ', ' + m.taille + 'px)';
      if (exc) { signales.push(ligne + ' — ' + exc.pourquoi); }
      else { sousSeuil.push(ligne); }
    }
  }
}

console.log('  ' + vus + ' morceaux de texte mesures sur ' + PAGES.length + ' ecrans.');
if (tropClair.length) rate(tropClair.length + ' texte(s) plus clairs que #5F6D66 sur ivoire', '\n     ' + tropClair.join('\n     '));
else ok('aucun texte plus clair que #5F6D66 sur ivoire');
if (sousSeuil.length) rate(sousSeuil.length + ' texte(s) sous le seuil WCAG AA', '\n     ' + sousSeuil.join('\n     '));
else ok('tout le texte atteint le seuil WCAG AA');
if (signales.length) {
  console.log('\n  A SIGNALER — valeur du cahier, non modifiee :');
  for (const s of [...new Set(signales)]) { console.log('     ' + s); }
  console.log('');
}
if (err.length) rate('erreurs JavaScript', err.join(' | '));
else ok('aucune erreur JavaScript sur les neuf ecrans');

await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
