/* ==========================================================================
   CONTROLE — les couvertures de section, avec et SANS JavaScript

   POURQUOI IL EXISTE
   ------------------
   `controler-sections.py` demande les douze adresses au serveur et lit le
   HTML : il sait que chaque page a son titre, son canonical et un corps qui
   n'est pas vide. Il ne sait rien de ce que ce corps DEVIENT une fois pose
   dans une page. Deux fautes trouvees le 5 septembre ne se voyaient que la :

   1. Les etiquettes de theme etaient enfermees dans un carre de 44 x 44 px
      pendant que leur texte debordait par-dessus la bordure. `base.css`
      definit `.pastille` comme le bouton rond des en-tetes ; `section.css`
      redefinissait le fond et le rembourrage mais jamais `width` ni
      `height`, qui restaient donc a --cible. « Reconnaitre une sourate »
      s'ecrivait a cheval sur son cadre, avec JavaScript comme sans, depuis
      que cet ecran existe. Aucun controle ne regardait ces boites.

   2. Le corps rendu doit etre VISIBLE sans JavaScript, pas seulement
      present dans le fichier : du texte pose dans un conteneur masque ne
      servirait ni au lecteur ni au robot.

   Une troisieme, le 20 septembre, ne se voyait qu'en comparant les deux
   rendus l'un a l'autre :

   3. Le bloc « Les sourates expliquées verset par verset » — 38 liens vers
      les lecons — etait servi dans le HTML et EFFACE par `section.js`, qui
      reconstruit toute la couverture. Sans JavaScript, 38 liens ; avec, il
      en restait trois, dont le logo et le bouton de QCM. Le controle
      d'alors exigeait ces liens UNIQUEMENT sans JavaScript : il constatait
      donc la faute sans la voir. Ce qu'on montre au robot et ce qu'on
      montre au visiteur doivent etre la meme chose ; c'est desormais exige
      dans les deux rendus.

   CE QU'IL VERIFIE, sur trois sections choisies pour leurs cas limites
   -------------------------------------------------------------------
   PLEINE   : la plus fournie, avec les liens vers les lecons de sourates ;
   COURTE   : une section a peine remplie ;
   VIDE     : la seule sans question, qui ne doit offrir aucun bouton de QCM.

   Et sur la plus grosse section, que TOUT nombre affiche a quatre chiffres
   porte son separateur : « Vocabulaire arabe » ecrivait « 1 259 » en haut
   de sa couverture et « 1251 » huit lignes plus bas.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://127.0.0.1:8899/section/';

const PLEINE = 'sens-des-sourates';
const COURTE = 'le-pelerinage';
const VIDE = 'vie-du-prophete';
// La seule section qui depasse mille questions : c'est la seule ou un
// separateur manquant se voit.
const GROSSE = 'vocabulaire-arabe';

const fautes = [];
const verifier = (ok, quoi) => { if (!ok) fautes.push(quoi); };
const lecoParRendu = {};

const navigateur = await chromium.launch({ executablePath: EXE });

for (const avecJS of [true, false]) {
  const c = await navigateur.newContext({
    viewport: { width: 360, height: 640 }, deviceScaleFactor: 2,
    javaScriptEnabled: avecJS });
  const quand = avecJS ? 'avec JS' : 'sans JS';

  for (const slug of [PLEINE, COURTE, VIDE, GROSSE]) {
    const p = await c.newPage();
    await p.goto(BASE + slug,
      { waitUntil: avecJS ? 'networkidle' : 'domcontentloaded' });

    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const past = [...document.querySelectorAll('.pastilles .pastille')];
      return {
        // Ce que le visiteur lit vraiment, pas ce que le fichier contient.
        texte: (document.body.innerText || '').trim().length,
        titre: (document.querySelector('h1, .couv-titre') || {}).textContent || '',
        pastilles: past.length,
        deborde: past.filter((e) => e.scrollWidth > e.clientWidth + 1
                                 || e.scrollHeight > e.clientHeight + 1)
                     .map((e) => e.textContent.trim().slice(0, 30)),
        horsCadre: past.filter((e) => e.getBoundingClientRect().right
                                    > de.clientWidth + 1).length,
        defileH: de.scrollWidth > de.clientWidth,
        boutonQcm: document.querySelectorAll('a[href*="/qcm"]').length,
      };
    });

    verifier(r.texte > 150,
      `${slug} ${quand} : la page n'affiche que ${r.texte} caracteres`);
    verifier(r.titre.trim().length > 0,
      `${slug} ${quand} : aucun titre visible`);
    verifier(r.deborde.length === 0,
      `${slug} ${quand} : ${r.deborde.length} etiquette(s) debordent de leur `
      + `cadre — ${r.deborde.join(' / ')}`);
    verifier(r.horsCadre === 0,
      `${slug} ${quand} : une etiquette sort du cadre a 360 px`);
    verifier(!r.defileH, `${slug} ${quand} : la page defile horizontalement`);

    // UNE SECTION VIDE N'OFFRE PAS DE QCM. Proposer un QCM qui s'ouvre sur
    // rien est pire que de dire qu'il n'est pas pret — c'est la regle du
    // cahier V2, et elle doit tenir dans les deux rendus.
    if (slug === VIDE) {
      verifier(r.boutonQcm === 0,
        `${slug} ${quand} : ${r.boutonQcm} lien(s) vers un QCM alors que la `
        + 'section n\'a aucune question');
    } else {
      verifier(r.boutonQcm > 0,
        `${slug} ${quand} : aucun lien vers le QCM de la section`);
    }

    // LES LECONS, DANS LES DEUX RENDUS, ET LES MEMES.
    // Exiger ces liens seulement sans JavaScript revenait a accepter que le
    // visiteur voie moins que le robot. On compte les deux et on compare.
    if (slug === PLEINE) {
      const lecons = await p.evaluate(() =>
        [...document.querySelectorAll('a[href^="lecon-sourate-"]')]
          .map((a) => a.getAttribute('href')));
      verifier(lecons.length >= 20,
        `${slug} ${quand} : ${lecons.length} liens vers des lecons, attendu au `
        + 'moins 20 — la couverture de la section qui parle des sourates '
        + 'expliquees doit y mener');
      lecoParRendu[quand] = lecons;
    }

    // TOUT NOMBRE AFFICHE A QUATRE CHIFFRES PORTE SON SEPARATEUR.
    // On ne regarde pas le texte de la page au hasard — une date en
    // porterait un a tort — mais les cases qui affichent un COMPTE.
    if (slug === GROSSE) {
      const bruts = await p.evaluate(() =>
        [...document.querySelectorAll('.chiffre b, .couv-niveau b')]
          .map((e) => e.textContent.trim())
          .filter((t) => /^\d{4,}$/.test(t)));
      verifier(bruts.length === 0,
        `${slug} ${quand} : ${bruts.length} nombre(s) affiche(s) sans `
        + `separateur — ${bruts.join(', ')} — alors que la meme page ecrit `
        + 'les autres avec');
    }
    await p.close();
  }
  await c.close();
}

// LES MEMES TROIS NOMBRES, UN ECRAN PLUS LOIN.
// La couverture annonce « 4 · 4 · 1 251 » et l'ecran de reglages reaffiche
// exactement ces trois nombres sur ses trois boutons de niveau. Ils sont
// lus dans le meme index ; ils doivent s'ecrire pareil.
{
  const c = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto(`http://127.0.0.1:8899/section/${GROSSE}/qcm`, { waitUntil: 'networkidle' });
  await p.waitForSelector('.niveau');
  await p.waitForTimeout(400);
  const bruts = await p.evaluate(() =>
    [...document.querySelectorAll('.choix-nb')]
      .map((e) => e.textContent.trim()).filter((t) => /^\d{4,}$/.test(t)));
  verifier(bruts.length === 0,
    `${GROSSE}/qcm : ${bruts.length} nombre(s) affiche(s) sans separateur `
    + `— ${bruts.join(', ')} — sous une phrase qui dit « 1 259 questions »`);
  await c.close();
}

await navigateur.close();

// LA MEME LISTE, DANS LE MEME ORDRE. Un nombre egal de liens ne suffirait
// pas : c'est de montrer au robot autre chose qu'au visiteur qui serait
// fautif, pas d'en montrer autant.
const a = lecoParRendu['avec JS'] || [];
const s = lecoParRendu['sans JS'] || [];
if (a.join('|') !== s.join('|')) {
  const manque = s.filter((x) => a.indexOf(x) < 0);
  const enTrop = a.filter((x) => s.indexOf(x) < 0);
  fautes.push(`${PLEINE} : la liste des lecons differe entre les deux rendus `
    + `— ${manque.length} absente(s) avec JavaScript (${manque.slice(0, 4).join(', ')}), `
    + `${enTrop.length} en trop`);
}

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Quatre couvertures relues avec et sans JavaScript : du texte');
console.log('  visible dans les huit cas, aucune etiquette qui deborde,');
console.log('  aucun defilement lateral, et pas de QCM promis sur du vide.');
console.log(`  Les ${a.length} lecons de sourates sont proposees dans les deux`);
console.log('  rendus, les memes et dans le meme ordre ; et les nombres a');
console.log('  quatre chiffres portent leur separateur sur la couverture');
console.log('  comme sur l\'ecran de reglages qui les reaffiche.');
