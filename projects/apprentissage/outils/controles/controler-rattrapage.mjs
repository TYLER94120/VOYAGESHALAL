/* ==========================================================================
   CONTROLE — ce que l'ecran de reglages promet, et ce que le paquet contient

   CE QU'ON A MESURE, LE 2 OCTOBRE
   -------------------------------
   Memoire d'une personne qui a joue en expert, s'est trompee quarante fois,
   puis revient et choisit « Début » :

     l'ecran promettait   « Début · 32 »
                          « Les questions les plus abordables de cette section. »
                          « Commencer les 20 questions »
     le paquet contenait  20 questions, TOUTES de niveau expert.

   Zero sur vingt au niveau demande. Et c'est le debutant exact — celui qui a
   trouve ca trop dur et qui revient au plus facile — qui recevait les vingt
   questions les plus dures, celles-la memes qu'il venait de rater.

   LA REGLE EST BONNE, C'EST LA PHRASE QUI MENTAIT
   -----------------------------------------------
   Une question ratee revient parce qu'on l'a ratee, pas parce qu'elle est du
   bon niveau : l'ecarter du rattrapage sous pretexte qu'elle est « experte »
   viderait de son sens la promesse « cette question reviendra ». C'est ecrit
   dans `lancer-qcm.js` et c'est juste. On n'y touche pas.

   Ce qui n'allait pas, c'est que l'ecran n'en disait rien. L'option annonce
   « Elles passent devant dans le tirage » — elle ne disait pas qu'elles
   passent AUSSI devant le niveau, ni qu'elles peuvent remplir le paquet
   entier.

   CE QU'IL VERIFIE, SUR TROIS MEMOIRES FABRIQUEES
   -----------------------------------------------
   1. RIEN A REVOIR : la phrase ne parle pas de rattrapage, et les vingt
      cartes sont au niveau demande. C'est le cas du premier jour.
   2. QUELQUES-UNES A REVOIR : la phrase annonce un nombre, et le paquet en
      contient exactement autant ; le reste est au niveau demande.
   3. PLUS QU'IL N'EN FAUT : la phrase annonce la taille du paquet entier —
      « dont 20 a revoir » se lit alors tout seul comme « le niveau ne
      s'appliquera pas » — et le paquet est bien entierement du rattrapage.

   Le nombre annonce doit EGALER le nombre tire. C'est tout l'objet : on ne
   verifie pas que la regle est bonne, on verifie que la phrase dit ce qui va
   se passer.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';
const SECTION = 'sens-des-sourates';
const NIVEAU = 1;      // « Début » : le niveau le plus etroit, 32 questions
const COMBIEN = 20;

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
const p = await ctx.newPage();

await p.goto(`${B}/`, { waitUntil: 'networkidle' });
const banque = await p.evaluate(async (s) =>
  (await (await fetch(`data/questions/${s}.json`)).json())
    .map((q) => ({ id: q.id, niveau: q.niveau })), SECTION);

// On marque des questions EXPERTES : c'est le cas qui fait la difference,
// puisqu'elles ne peuvent pas entrer dans le paquet par le niveau choisi.
const experts = banque.filter((q) => q.niveau === 3).map((q) => q.id);

async function essai(nom, combienARevoir) {
  await p.goto(`${B}/section/${SECTION}/qcm`, { waitUntil: 'networkidle' });
  await p.evaluate((ids) => {
    const q = {};
    ids.forEach((id) => {
      q[id] = { vues: 1, justes: 0, suite: 0, derniere: false, aRevoir: true, depuis: 0 };
    });
    localStorage.setItem('ipap.v1', JSON.stringify({
      v: 1, questions: q, jours: [], parJour: {}, sessions: [],
      recordSerie: 0, reglages: null, reprise: null }));
  }, experts.slice(0, combienARevoir));
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForSelector('.niveau');
  await p.waitForTimeout(600);

  const phrase = await p.evaluate((n) => {
    const b = [...document.querySelectorAll('.niveau')]
      .find((x) => x.getAttribute('data-niveau') === String(n));
    if (b) { b.click(); }
    return (document.getElementById('dit-nombre') || {}).innerText || '';
  }, NIVEAU);
  await p.waitForTimeout(300);
  const annonce = /dont (\d+) à revoir/.exec(phrase);
  const dit = annonce ? +annonce[1] : 0;

  await p.evaluate(() => document.getElementById('commencer').click());
  await p.waitForTimeout(1600);
  const paquet = await p.evaluate((ids) => {
    const j = window.__jeu;
    const aRevoir = new Set(ids);
    const c = {};
    j.s.paquet.forEach((q) => { c[q.niveau] = (c[q.niveau] || 0) + 1; });
    return {
      n: j.s.paquet.length,
      rattrapages: j.s.paquet.filter((q) => aRevoir.has(q.id)).length,
      parNiveau: c,
    };
  }, experts.slice(0, combienARevoir));

  console.log(`  ${nom.padEnd(26)} phrase « ${(annonce ? annonce[0] : 'rien sur le rattrapage')} », `
    + `paquet ${paquet.rattrapages}/${paquet.n} a revoir, niveaux ${JSON.stringify(paquet.parNiveau)}`);

  verifier(dit === paquet.rattrapages,
    `${nom} : l'ecran annonce ${dit} question(s) a revoir et le paquet en `
    + `contient ${paquet.rattrapages} — la phrase ne dit pas ce qui se passe`);

  // Ce qui n'est PAS du rattrapage doit etre au niveau demande : c'est
  // l'autre moitie de la promesse, et elle, elle doit tenir sans reserve.
  const horsNiveau = Object.entries(paquet.parNiveau)
    .filter(([n]) => +n !== NIVEAU)
    .reduce((s, [, v]) => s + v, 0);
  verifier(horsNiveau <= paquet.rattrapages,
    `${nom} : ${horsNiveau} carte(s) hors du niveau demande pour seulement `
    + `${paquet.rattrapages} rattrapage(s) — des questions d'un autre niveau `
    + 'entrent sans raison');
  return paquet;
}

console.log(`  banque : ${banque.length} questions, ${experts.length} expertes`);
const a = await essai('rien a revoir', 0);
verifier(a.rattrapages === 0 && (a.parNiveau[NIVEAU] || 0) === a.n,
  `rien a revoir : le paquet devrait etre entierement de niveau ${NIVEAU}, `
  + `il contient ${JSON.stringify(a.parNiveau)}`);

const b = await essai('quelques-unes a revoir', 6);
verifier(b.rattrapages === 6,
  `quelques-unes a revoir : 6 attendues dans le paquet, ${b.rattrapages} trouvees`);

const c = await essai('plus que le paquet', 40);
verifier(c.rattrapages === COMBIEN,
  `plus que le paquet : les ${COMBIEN} cartes devraient toutes etre du `
  + `rattrapage, ${c.rattrapages} le sont`);

/* ==========================================================================
   LES DEUX SORTIES DU RATTRAPAGE — ajoutees le 17 octobre

   Le site promet au lecteur qui se trompe : « Tu la reverras dans un prochain
   QCM de cette section. » memoire.js borne cette promesse :

       QCM_PRIORITAIRES = 3    prioritaire trois QCM durant
       JUSTES_POUR_SORTIR = 3  trois bonnes reponses d'affilee et elle sort

   Ce qui precede verifie la COMPOSITION du paquet sur des memoires
   fabriquees. Personne ne verifiait les deux sorties, c'est-a-dire ce qui
   fait qu'une question ratee finit par ne plus revenir. Sans elles, les vieux
   echecs rempliraient le paquet pour toujours et le lecteur ne verrait plus
   de questions neuves.

   POURQUOI PAR APPEL ET PAS AU NAVIGATEUR. Conduire une partie entiere depuis
   un controle s'est revele fragile, et pour deux raisons qui valent d'etre
   ecrites : rater une carte la REINSERE dans le paquet (RETOURS_MAX = 1),
   donc une partie d'une carte en compte deux ; et il n'y a pas de bouton
   « Suivante » — la carte suivante arrive d'elle-meme, et « Valider » est
   desactive entre les deux. J'ai conclu trois fois de travers avant de
   mesurer au bon endroit : que la fonction etait morte (mon grep l'avait
   manquee), que le compteur etait bloque (je n'avais jamais TERMINE une
   partie — vieillirLesPriorites est appele dans Jeu.prototype.terminer), et
   que la question revenait pour toujours (elle ne revient pas).

   On verifie donc la REGLE par appel, comme controler-recette.mjs le fait
   pour l'export. Le cablage, lui, se lit dans qcm.js : terminer() appelle
   vieillirLesPriorites avec les identifiants joues.
   ========================================================================== */
{
  const q = await navigateur.newPage();
  await q.goto(`${B}/plus.html`, { waitUntil: 'networkidle' });
  const r = await q.evaluate(() => {
    const M = window.IPAP_MEMOIRE;
    const ID = 'q-temoin';
    const copie = (d) => JSON.parse(JSON.stringify(d.questions[ID]));

    let d = M.vide();
    M.noter(d, ID, false);
    const parQCM = [copie(d)];
    for (let n = 0; n < 4; n += 1) {
      M.vieillirLesPriorites(d, [ID]);
      parQCM.push(copie(d));
    }

    d = M.vide();
    M.noter(d, ID, false);
    const parJustes = [copie(d)];
    for (let n = 0; n < 3; n += 1) { M.noter(d, ID, true); parJustes.push(copie(d)); }

    d = M.vide();
    M.noter(d, ID, false);
    M.noter(d, ID, true);
    M.noter(d, ID, true);
    M.noter(d, ID, false);
    return { parQCM, parJustes, coupee: copie(d), borne: M.QCM_PRIORITAIRES };
  });
  await q.close();

  // la borne : prioritaire aux QCM 1 et 2, relachee au troisieme
  verifier(r.borne === 3, `QCM_PRIORITAIRES vaut ${r.borne}, attendu 3`);
  verifier(r.parQCM[0].aRevoir === true && r.parQCM[0].depuis === 0,
    'une question ratee doit etre marquee a revoir');
  verifier(r.parQCM[1].depuis === 1 && r.parQCM[1].aRevoir === true,
    `apres une partie, depuis=${r.parQCM[1].depuis} aRevoir=${r.parQCM[1].aRevoir}`);
  verifier(r.parQCM[2].depuis === 2 && r.parQCM[2].aRevoir === true,
    `apres deux parties, depuis=${r.parQCM[2].depuis}`);
  verifier(r.parQCM[3].aRevoir === false,
    'apres trois parties, la question doit cesser d\'etre prioritaire '
    + `(aRevoir=${r.parQCM[3].aRevoir})`);

  // l'autre sortie : trois bonnes reponses d'affilee
  verifier(r.parJustes[1].suite === 1 && r.parJustes[1].aRevoir === true,
    'une bonne reponse ne suffit pas a la sortir');
  verifier(r.parJustes[2].suite === 2 && r.parJustes[2].aRevoir === true,
    'deux bonnes reponses ne suffisent pas non plus');
  verifier(r.parJustes[3].suite === 3 && r.parJustes[3].aRevoir === false,
    `a la troisieme bonne reponse elle doit sortir (aRevoir=${r.parJustes[3].aRevoir})`);

  // et une mauvaise au milieu remet le compteur a zero
  verifier(r.coupee.suite === 0 && r.coupee.aRevoir === true,
    `une mauvaise reponse doit relancer la serie (suite=${r.coupee.suite})`);
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Le nombre de questions a revoir annonce par l\'ecran est celui');
console.log('  que le paquet contient, dans les trois cas ; et rien d\'un autre');
console.log('  niveau n\'entre en dehors du rattrapage.');
console.log('  Et les deux sorties du rattrapage tiennent : prioritaire trois');
console.log('  parties durant, ou trois bonnes reponses d\'affilee, la mauvaise');
console.log('  reponse relancant la serie.');
