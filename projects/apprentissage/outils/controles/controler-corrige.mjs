/* ==========================================================================
   CONTROLE — la feuille de correction : ce qu'elle dit, et ce qu'elle laisse
   sous elle

   DEUX MESURES DU 23 SEPTEMBRE
   ----------------------------
   1. CE QU'ELLE NE DISAIT PAS. Sur les 2 701 questions du site, 1 418 — un
      peu plus de la moitie — ont une explication et une source qui ne
      redisent nulle part la bonne reponse. Exemple exact :

        Q  Dans combien de versets le nom de Adam apparait-il ?
        R  25 versets
        E  Compte sur les 6 236 versets du Coran. Les autres propositions
           sont les comptes d'autres prophetes.

      Qui repondait 30 lisait « Pas tout a fait », puis cette explication, et
      repartait sans savoir que c'etait 25.

      La grille EST pourtant corrigee sur place, avec une etiquette « la
      bonne » sur le bon bouton. Mais la carte s'envole a la validation :
      chronometree toutes les 80 ms, elle est a opacite 0 et 958 px au-dessus
      de l'ecran 257 ms apres le geste — et les etiquettes sont posees
      APRES. Personne ne les avait jamais vues, pas une image.

   2. CE QU'ELLE LAISSAIT VIVANT DESSOUS. La feuille recouvre « Passer » et
      « Valider », qui restaient focalisables et annonces comme des boutons
      ordinaires alors qu'ils ne faisaient plus rien — mesure : presses apres
      la correction, ni la question, ni l'ecran, ni le score ne bougeaient.
      Le clavier s'en tirait (le focus va sur « Continuer »), mais un lecteur
      d'ecran de telephone BALAIE tous les elements : il annoncait
      « Valider, bouton » sur un bouton mort et couvert.

   CE QU'IL VERIFIE
   ----------------
   1. Repondre faux : la feuille nomme la bonne reponse, et c'est bien celle
      que le paquet declare.
   2. Ce qui est annonce a une synthese vocale la nomme aussi.
   3. Repondre juste : pas de ligne « la bonne reponse » — la personne l'a
      sous les yeux, la redire serait du bruit.
   4. Feuille ouverte : plus rien de couvert n'est focalisable. Il ne reste
      que « Quitter le QCM » — qui, lui, n'est pas couvert — et
      « Continuer ».
   5. Apres « Continuer » : tout redevient actif et le QCM avance. Les deux
      boutons du pied servent toute la partie ; les laisser morts serait pire
      que le defaut d'origine.
   6. Sur le plus petit ecran du cahier, 360 x 640, la feuille tient et
      « Continuer » reste visible.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
const URL = `${B}/qcm.html?section=sens-des-sourates&n=20&mode=apprentissage&niveau=1`;

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

async function jouer(w, h, juste) {
  const c = await navigateur.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await c.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
  const p = await c.newPage();
  const err = [];
  p.on('pageerror', (e) => err.push(e.message));
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForSelector('.reponse');
  await p.waitForTimeout(400);
  // On choisit exprès juste ou faux : les deux feuilles n'ont pas le meme
  // contenu, et c'est justement la difference qu'on controle.
  const attendu = await p.evaluate((ok) => {
    const q = window.__jeu.s.courante();
    const i = ok ? q.bonne : (q.bonne + 1) % 4;
    document.querySelectorAll('.reponse')[i].click();
    return q.reponses[q.bonne];
  }, juste);
  await p.waitForTimeout(200);
  await p.evaluate(() => document.getElementById('cote-droite').click());
  await p.waitForTimeout(1000);
  return { c, p, err, attendu };
}

// --- 1, 2 et 6 : une reponse fausse, sur le plus petit ecran --------------
for (const [w, h] of [[360, 640], [390, 844]]) {
  const { c, p, err, attendu } = await jouer(w, h, false);
  const m = await p.evaluate(() => {
    const f = document.getElementById('feuille');
    const b = document.getElementById('f-suite').getBoundingClientRect();
    const fr = f.getBoundingClientRect();
    return {
      bonne: (f.querySelector('.f-bonne') || {}).innerText || '',
      annonce: (document.getElementById('qcm-annonce') || {}).innerText || '',
      boutonDansLEcran: b.bottom <= window.innerHeight + 1 && b.top >= 0,
      feuilleDansLEcran: fr.bottom <= window.innerHeight + 1,
    };
  });
  verifier(m.bonne.indexOf(attendu) >= 0,
    `${w}x${h} : la feuille ne nomme pas la bonne reponse « ${attendu} » — `
    + `elle dit « ${m.bonne.replace(/\s+/g, ' ').trim() || '(rien)'} ». `
    + 'Une explication sur deux ne la redit pas.');
  // ON CHERCHE LA PHRASE, PAS LE MOT. Premiere version de ce controle : elle
  // se contentait de trouver « Al-Kawthar » quelque part dans l'annonce. Or
  // l'explication cite souvent le nom de la sourate d'elle-meme — « C'est le
  // verset 3 de la sourate Al-Kawthar ». En retirant la phrase de qcm.js,
  // le controle restait donc au vert : il lisait la coincidence, pas la
  // promesse. C'est le sabotage qui l'a montre.
  verifier(m.annonce.indexOf('La bonne réponse : ' + attendu) >= 0,
    `${w}x${h} : ce qui est annonce a une synthese vocale ne dit pas « La `
    + `bonne réponse : ${attendu} » — annonce « ${m.annonce.replace(/\s+/g, ' ').trim().slice(0, 70)} »`);
  verifier(m.boutonDansLEcran,
    `${w}x${h} : « Continuer » n'est pas entierement dans l'ecran`);
  verifier(err.length === 0, `${w}x${h} : erreur JavaScript — ${err[0]}`);
  console.log(`  ${w}x${h} faux : « ${m.bonne.replace(/\s+/g, ' ').trim()} », `
    + `Continuer visible=${m.boutonDansLEcran}`);
  await c.close();
}

// --- 3 : une reponse juste ne redit pas la reponse ------------------------
{
  const { c, p } = await jouer(390, 844, true);
  const m = await p.evaluate(() => ({
    bonne: !!document.querySelector('#feuille .f-bonne'),
    titre: (document.querySelector('#feuille .f-titre') || {}).innerText || '',
  }));
  verifier(/bonne réponse/i.test(m.titre),
    `reponse juste : la feuille titre « ${m.titre} »`);
  verifier(!m.bonne,
    'reponse juste : la feuille redit la bonne reponse alors que la personne '
    + 'vient de la choisir — c\'est du bruit');
  console.log(`  reponse juste : titre « ${m.titre.trim()} », pas de rappel`);
  await c.close();
}

// --- 4 et 5 : ce qui reste joignable sous la feuille ----------------------
{
  const { c, p, err } = await jouer(390, 844, false);
  const sousLaFeuille = await p.evaluate(() => {
    const f = document.getElementById('feuille').getBoundingClientRect();
    return [...document.querySelectorAll('button')]
      .filter((b) => !document.getElementById('feuille').contains(b))
      .filter((b) => !b.disabled && b.offsetParent !== null)
      .map((b) => ({
        quoi: (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24),
        couvert: b.getBoundingClientRect().bottom > f.top,
      }));
  });
  const morts = sousLaFeuille.filter((b) => b.couvert);
  verifier(morts.length === 0,
    `feuille ouverte : ${morts.length} bouton(s) couvert(s) restent actifs et `
    + `annonces — ${morts.map((b) => b.quoi).join(', ')}`);

  const focalisables = [];
  await p.evaluate(() => document.body.focus());
  for (let i = 0; i < 8; i += 1) {
    await p.keyboard.press('Tab');
    const f = await p.evaluate(() => {
      const a = document.activeElement;
      return (!a || a === document.body) ? null
        : (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24);
    });
    if (f && focalisables.indexOf(f) < 0) { focalisables.push(f); }
  }
  verifier(focalisables.length <= 2,
    `feuille ouverte : ${focalisables.length} elements dans l'ordre de `
    + `tabulation — ${focalisables.join(' / ')} — attendu « Quitter le QCM » `
    + 'et « Continuer », rien d\'autre');

  const avance = await p.evaluate(async () => {
    const avant = document.getElementById('qcm-compte').innerText;
    document.getElementById('f-suite').click();
    await new Promise((r) => setTimeout(r, 800));
    return {
      avant,
      apres: document.getElementById('qcm-compte').innerText,
      reponses: [...document.querySelectorAll('.reponse')].filter((b) => b.disabled).length,
      cotes: [...document.querySelectorAll('.cote')].filter((b) => b.disabled).length,
    };
  });
  verifier(avance.avant !== avance.apres,
    `« Continuer » ne fait pas avancer : ${avance.avant} puis ${avance.apres}`);
  verifier(avance.reponses === 0 && avance.cotes === 0,
    `apres « Continuer », ${avance.reponses} reponse(s) et ${avance.cotes} `
    + 'bouton(s) du pied restent inactifs — ils servent toute la partie');
  verifier(err.length === 0, `erreur JavaScript — ${err[0]}`);
  console.log(`  feuille ouverte : ${focalisables.length} element(s) joignable(s) `
    + `(${focalisables.join(' / ')}) ; ${avance.avant} -> ${avance.apres} apres Continuer`);
  await c.close();
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Qui se trompe apprend ce qui etait juste, a l\'ecran comme a la');
console.log('  voix ; qui a juste n\'a pas de rappel inutile ; et rien de ce que');
console.log('  la feuille recouvre ne reste joignable.');
