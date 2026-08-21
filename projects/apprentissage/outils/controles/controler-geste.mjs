/* LE GESTE EST VERTICAL, ET LES DEUX BOUTONS DU PIED SONT CLIQUABLES.
 *
 * HAUT = je valide.  BAS = je passe.  Un geste franchement horizontal ne
 * doit RIEN faire : sinon on lance une carte en voulant faire defiler.
 *
 * Teste au doigt (390) ET a la souris (1280). Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

for (const [w,h,mob,nom] of [[390,844,true,'telephone'],[1280,900,false,'bureau']]) {
  const ctx = await nav.newContext({ viewport:{width:w,height:h}, isMobile:mob, hasTouch:mob });
  await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
  const p = await ctx.newPage();
  const err=[]; p.on('pageerror',(e)=>err.push(e.message));
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.evaluate(() => localStorage.clear());
  await p.reload({ waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');
  console.log('--- ' + nom + ' (' + w + 'px) ---');

  const carte = () => p.evaluate(() => [...document.querySelectorAll('.reponse .texte')]
    .map((e) => e.textContent).join('|'));

  /* Glisser la carte a la souris, de (0,0) vers (dx,dy) depuis son centre. */
  async function glisser(dx, dy) {
    const b = await p.locator('#carte').boundingBox();
    const x = b.x + b.width/2, y = b.y + b.height/2;
    await p.mouse.move(x, y);
    await p.mouse.down();
    await p.mouse.move(x+dx, y+dy, { steps: 14 });
    await p.mouse.up();
    await p.waitForTimeout(700);
  }

  // --- Les deux cotes sont-ils de vrais boutons, assez grands ? ----------
  const b = await p.evaluate(() => ['cote-gauche','cote-droite'].map((id) => {
    const e = document.getElementById(id);
    const r = e.getBoundingClientRect();
    return { id, tag: e.tagName, h: Math.round(r.height), w: Math.round(r.width) };
  }));
  for (const x of b) {
    if (x.tag !== 'BUTTON') rate(x.id + ' n est pas un bouton', x.tag);
    else if (x.h < 44) rate(x.id + ' fait moins de 44 px de haut', x.h);
    else ok(x.id + ' est un bouton de ' + x.w + 'x' + x.h);
  }

  // --- Les chevrons montrent-ils le bon sens ? ---------------------------
  // Le bouton Passer descend, le bouton Valider monte. Un chevron a l envers
  // enseigne le geste inverse : c est une faute d interface, pas un detail.
  const sens = await p.evaluate(() => {
    const d = (id) => document.getElementById(id).querySelector('path').getAttribute('d');
    return { passer: d('cote-gauche'), valider: d('cote-droite') };
  });
  // « M5.5 9.5L12 16 » : on part en haut, on descend au point bas -> chevron bas.
  if (!/L12 16/.test(sens.passer)) rate('le chevron de Passer ne pointe pas vers le bas', sens.passer);
  else ok('le chevron de Passer pointe vers le bas');
  if (!/L12 8/.test(sens.valider)) rate('le chevron de Valider ne pointe pas vers le haut', sens.valider);
  else ok('le chevron de Valider pointe vers le haut');

  // --- CLIC sur Valider SANS reponse : la carte doit refuser -------------
  const avant = await p.evaluate(() => document.getElementById('qcm-compte').textContent);
  await p.locator('#cote-droite').click();
  await p.waitForTimeout(400);
  const apres = await p.evaluate(() => document.getElementById('qcm-compte').textContent);
  if (avant !== apres) rate('clic Valider sans reponse : la carte est partie', avant+' -> '+apres);
  else ok('clic Valider sans reponse : la carte reste');

  // --- CLIC sur Valider AVEC une reponse : la correction s ouvre ---------
  await p.locator('.reponse').first().click();
  await p.locator('#cote-droite').click();
  await p.waitForTimeout(700);
  const ouverte = await p.evaluate(() => document.getElementById('feuille').getAttribute('data-ouverte'));
  if (ouverte !== 'oui') rate('clic Valider avec reponse : pas de correction', ouverte);
  else ok('clic Valider avec reponse : la correction s ouvre');
  await p.locator('#f-suite').click();
  await p.waitForTimeout(400);

  // --- CLIC sur Passer : on avance sans correction -----------------------
  const c1 = await carte();
  await p.locator('#cote-gauche').click();
  await p.waitForTimeout(600);
  const c2 = await carte();
  if (c1 === c2) rate('clic Passer : la carte n a pas change');
  else ok('clic Passer : on passe a la carte suivante');

  // --- ON ATTRAPE LA CARTE DEPUIS UNE REPONSE ---------------------------
  // Le milieu de la carte EST un bouton depuis que les reponses sont en
  // colonne. Deux choses doivent tenir ensemble : un appui court choisit la
  // reponse, un glissement depuis cette meme reponse deplace la carte SANS
  // la choisir.
  const choisie = () => p.evaluate(() =>
    [...document.querySelectorAll('.reponse')].findIndex((e) => e.getAttribute('aria-pressed') === 'true'));

  // On part du MILIEU DE LA TROISIEME REPONSE. Pas du centre de la carte :
  // selon la longueur du verset, ce centre tombe parfois dans un interstice,
  // et le test ne prouverait alors rien du tout — c'est exactement ce qui
  // m'est arrive avec une version « si le centre est un bouton » qui se
  // laissait sauter en silence.
  const surTroisieme = await p.evaluate(() => {
    const b = document.querySelectorAll('.reponse')[2].getBoundingClientRect();
    const x = b.x + b.width/2, y = b.y + b.height/2;
    const e = document.elementFromPoint(x, y);
    return { x, y, bouton: !!(e && e.closest && e.closest('button')) };
  });
  if (!surTroisieme.bouton) rate('le point de depart choisi n est pas sur une reponse');
  else {
    // Glissement de 40 px : au-dela de la prise (8), en deca du seuil (60).
    // La carte bouge et revient, et AUCUNE reponse ne doit avoir ete choisie.
    const avantD = await choisie();
    await p.mouse.move(surTroisieme.x, surTroisieme.y);
    await p.mouse.down();
    await p.mouse.move(surTroisieme.x, surTroisieme.y + 40, { steps: 10 });
    const bougee = await p.evaluate(() => /translateY\(/.test(document.getElementById('carte').style.transform));
    await p.mouse.up();
    await p.waitForTimeout(400);
    const apresD = await choisie();
    if (!bougee) rate('la carte ne se laisse pas attraper depuis une reponse');
    else ok('la carte s attrape depuis une reponse');
    if (apresD !== avantD) rate('le glissement a choisi une reponse au passage', avantD + ' -> ' + apresD);
    else ok('le glissement ne choisit pas la reponse survolee');

    // ET l appui court, lui, choisit toujours.
    await p.locator('.reponse').nth(2).click();
    const c = await choisie();
    if (c !== 2) rate('un appui court ne choisit plus la reponse', c);
    else ok('un appui court choisit toujours la reponse');
  }

  // --- GESTE HORIZONTAL : il ne doit RIEN se passer ----------------------
  // Le seul moyen de prouver que le garde-fou sert : on glisse fort de cote
  // et la carte doit rester en place, sans correction ouverte.
  const c3 = await carte();
  await glisser(200, 0);
  const apresLateral = await p.evaluate(() => ({
    feuille: document.getElementById('feuille').getAttribute('data-ouverte'),
    transforme: document.getElementById('carte').style.transform,
  }));
  const c4 = await carte();
  if (apresLateral.feuille === 'oui' || c3 !== c4) {
    rate('un glissement lateral a lance la carte', JSON.stringify(apresLateral));
  } else ok('un glissement lateral ne lance rien');

  // --- GESTE VERS LE BAS : on passe --------------------------------------
  const c5 = await carte();
  await glisser(0, 190);
  const c6 = await carte();
  const feuilleBas = await p.evaluate(() => document.getElementById('feuille').getAttribute('data-ouverte'));
  if (c5 === c6) rate('glisser vers le bas ne passe pas a la carte suivante');
  else if (feuilleBas === 'oui') rate('glisser vers le bas a ouvert une correction');
  else ok('glisser vers le bas : on passe a la suivante');

  // --- GESTE VERS LE HAUT : on valide ------------------------------------
  await p.locator('.reponse').first().click();
  await glisser(0, -190);
  const feuilleHaut = await p.evaluate(() => document.getElementById('feuille').getAttribute('data-ouverte'));
  if (feuilleHaut !== 'oui') rate('glisser vers le haut ne valide pas', feuilleHaut);
  else ok('glisser vers le haut : la correction s ouvre');
  await p.locator('#f-suite').click();
  await p.waitForTimeout(400);

  // --- CLAVIER : Haut valide, Bas passe ---------------------------------
  const c7 = await carte();
  await p.keyboard.press('ArrowDown');
  await p.waitForTimeout(600);
  const c8 = await carte();
  if (c7 === c8) rate('la fleche du bas ne passe pas la carte');
  else ok('fleche du bas : on passe');

  await p.locator('.reponse').first().click();
  await p.keyboard.press('ArrowUp');
  await p.waitForTimeout(700);
  const fh = await p.evaluate(() => document.getElementById('feuille').getAttribute('data-ouverte'));
  if (fh !== 'oui') rate('la fleche du haut ne valide pas', fh);
  else ok('fleche du haut : on valide');

  if (err.length) rate('erreurs JavaScript', err.join(' | ')); else ok('aucune erreur JavaScript');
  await ctx.close();
}
await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
