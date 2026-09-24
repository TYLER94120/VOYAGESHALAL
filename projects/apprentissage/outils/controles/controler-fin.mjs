/* ==========================================================================
   CONTROLE — une partie annoncee a 20 questions doit FINIR

   CE QU'ON A MESURE, LE 24 SEPTEMBRE
   ----------------------------------
   En repondant faux a chaque carte d'un QCM regle sur 20 questions, dans un
   vrai navigateur : au bout de 70 reponses le jeu tournait toujours, et le
   compteur du haut affichait « 71 / 20 ».

   Le mecanisme : une question ratee est remise dans le paquet huit cartes
   plus loin (section 9). Rien ne comptait combien de fois. Chaque rate
   rajoutait donc une carte pour chaque carte consommee, et le paquet ne se
   vidait jamais. Le champ `vues` — « id -> nombre de passages dans CETTE
   session » — etait declare depuis le debut et n'avait jamais servi.

   Cela ne touche que ceux qui se trompent beaucoup, c'est-a-dire ceux pour
   qui le site existe. L'ecran de reglages leur promet « Commencer les 20
   questions » et « Environ 3 minutes ».

   Et tout l'affichage supposait le contraire : la barre segmentee ne
   dessinait que 20 segments, donc elle se figeait a la vingtieme carte
   pendant que le jeu continuait.

   CE QU'IL VERIFIE
   ----------------
   1. Tout rater : la partie finit, et en 2 x 20 cartes au plus.
   2. Tout passer : la partie finit aussi — passer remet la carte 4 plus
      loin, meme piege.
   3. En mode examen, ou aucune feuille n'interrompt : idem.
   4. Le compteur ne dit jamais un numero plus grand que son total. « 40 / 20 »
      est impossible a lire autrement que comme une faute.
   5. La phrase sous une mauvaise reponse est VRAIE : « cette question
      reviendra plus tard dans le QCM » seulement si elle est encore dans le
      paquet ; sinon elle doit dire ou la question revient vraiment.
   6. Une partie sans faute fait exactement 20 cartes et affiche 20 sur 20 :
      la borne ne doit pas avoir raccourci le cas normal.
   7. ET UNE QUESTION RATEE REVIENT VRAIMENT. Borner, ce n'est pas supprimer.
      La premiere version de ce controle ne verifiait que la fin : en mettant
      la borne a zero — plus aucun retour, contre la section 9 du cahier — il
      restait au vert. C'est le sabotage qui l'a montre. On exige donc aussi
      de revoir au moins une carte ratee dans la meme partie.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
const N = 20;
// Large exprès : on ne veut pas mesurer la borne exacte, on veut attraper
// une partie qui ne finit pas. Au-dela, c'est que quelque chose boucle.
const PLAFOND = 120;

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

async function jouer(mode, quoi) {
  const c = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
  await c.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
  const p = await c.newPage();
  const err = [];
  p.on('pageerror', (e) => err.push(e.message));
  await p.goto(`${B}/qcm.html?section=sens-des-sourates&n=${N}&mode=${mode}&niveau=1`,
    { waitUntil: 'networkidle' });
  await p.waitForSelector('.reponse');
  await p.waitForTimeout(400);

  let tours = 0;
  let compteurFaux = null;
  const notesMenteuses = [];
  const vues = {};
  let revues = 0;
  for (; tours < PLAFOND; tours += 1) {
    if (!(await p.$('.reponse'))) { break; }
    const c1 = await p.evaluate((q) => {
      const j = window.__jeu;
      const carte = j.s.courante();
      if (q !== 'passer') {
        const i = (q === 'juste') ? carte.bonne : (carte.bonne + 1) % 4;
        document.querySelectorAll('.reponse')[i].click();
      }
      const t = document.getElementById('qcm-compte').innerText;
      const m = /(\d+)\s*\/\s*(\d+)/.exec(t);
      return { texte: t, num: m ? +m[1] : 0, den: m ? +m[2] : 0, id: carte.id };
    }, quoi);
    if (c1.num > c1.den && compteurFaux === null) { compteurFaux = c1.texte; }
    // Combien de cartes on revoit : borner n'est pas supprimer.
    if (vues[c1.id]) { revues += 1; }
    vues[c1.id] = true;

    await p.waitForTimeout(90);
    await p.evaluate((q) => {
      document.getElementById(q === 'passer' ? 'cote-gauche' : 'cote-droite').click();
    }, quoi);
    await p.waitForTimeout(380);

    // LA PHRASE DOIT ETRE VRAIE : on la confronte au paquet reel.
    const note = await p.evaluate((id) => {
      const x = document.querySelector('#feuille .f-note');
      if (!x) { return null; }
      const j = window.__jeu;
      const reste = j.s.paquet.slice(j.s.pos).some((q) => q.id === id);
      return { texte: x.innerText.replace(/\s+/g, ' ').trim(), reste: reste };
    }, c1.id);
    if (note && /reviendra plus tard dans le QCM/i.test(note.texte) && !note.reste) {
      notesMenteuses.push(note.texte);
    }
    const suite = await p.$('#f-suite');
    if (suite) { await suite.click(); await p.waitForTimeout(280); }
  }
  await p.waitForTimeout(800);
  const fin = await p.evaluate(() => ({
    finie: !document.querySelector('.reponse'),
    texte: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
  }));
  await c.close();
  return { tours, fin, err, compteurFaux, notesMenteuses, revues };
}

for (const [mode, quoi] of [['apprentissage', 'faux'], ['examen', 'faux'],
  ['apprentissage', 'passer']]) {
  const r = await jouer(mode, quoi);
  const ou = `${mode}, tout « ${quoi} »`;
  verifier(r.fin.finie,
    `${ou} : la partie ne finit pas — ${r.tours} cartes jouees sur un QCM `
    + `annonce a ${N} questions, et elle continuait`);
  verifier(r.tours <= 2 * N,
    `${ou} : ${r.tours} cartes jouees, ${2 * N} au plus attendues`);
  verifier(r.compteurFaux === null,
    `${ou} : le compteur a affiche « ${r.compteurFaux} » — un numero plus `
    + 'grand que son total');
  verifier(r.notesMenteuses.length === 0,
    `${ou} : ${r.notesMenteuses.length} fois « cette question reviendra plus `
    + 'tard dans le QCM » alors qu\'elle n\'est plus dans le paquet');
  verifier(r.revues > 0,
    `${ou} : aucune carte revue dans la partie — une question ratee ou `
    + 'passee doit revenir (section 9). Borner les retours ne veut pas '
    + 'dire les supprimer.');
  verifier(r.err.length === 0, `${ou} : erreur JavaScript — ${r.err[0]}`);
  console.log(`  ${ou.padEnd(32)} ${String(r.tours).padStart(3)} cartes, `
    + `${r.revues} revue(s), finie=${r.fin.finie}`);
}

// 6. Le cas normal n'a pas bouge.
{
  const r = await jouer('apprentissage', 'juste');
  verifier(r.tours === N,
    `sans faute : ${r.tours} cartes jouees, ${N} attendues — la borne ne doit `
    + 'pas toucher au cas normal');
  verifier(/20 sur 20/.test(r.fin.texte),
    `sans faute : l'ecran de fin ne dit pas « 20 sur 20 » — ${r.fin.texte.slice(0, 90)}`);
  console.log(`  sans faute                       ${String(r.tours).padStart(3)} cartes, `
    + `ecran « ${(/(\d+ sur \d+)/.exec(r.fin.texte) || ['?'])[0]} »`);
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Une partie annoncee a 20 questions finit, meme si on rate tout,');
console.log('  meme si on passe tout, en examen comme en apprentissage ; le');
console.log('  compteur reste lisible et la phrase du retour reste vraie.');
