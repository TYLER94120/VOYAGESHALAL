/* ==========================================================================
   CONTROLE — ce que devient une page quand les donnees n'arrivent pas

   CE QU'ON A MESURE, LE 21 SEPTEMBRE
   ----------------------------------
   En coupant `data/sections.json` — 4 Ko — sur /section/sens-des-sourates :

     reseau sain     1 010 caracteres, 41 liens dont 38 lecons
     fichier coupe      96 caracteres,  2 liens

   La page etait pourtant DEJA ARRIVEE : son titre, ses comptes, ses themes
   et ses 38 liens vers les lecons sont ecrits dans le HTML servi, lus et
   affiches avant que le moindre `fetch` parte. Le `catch` de `section.js`
   les remplacait par « Section introuvable — Les sections n'ont pas pu etre
   chargees. »

   Deux fautes dans le meme geste :
     · on detruit un contenu complet pour l'echec d'un fichier de 4 Ko ;
     · on annonce que la section n'existe pas quand c'est le reseau qui n'a
       pas repondu. Le lecteur, lui, ne peut pas faire la difference — il
       comprend que la page est vide, et il s'en va.

   La methode maison sur les conditions degradees dit l'inverse : le reseau
   n'est presque jamais absent, il est LENT ou capricieux, et ce qui est deja
   affiche doit le rester. C'est d'autant plus vrai ici que ces pages ont ete
   ecrites exactement pour ca — le generateur pose leur corps en entier dans
   le HTML.

   CE QU'IL VERIFIE
   ----------------
   1. Une page de section dont le corps est servi garde ce corps quand les
      donnees ne repondent pas : meme titre, et presque tout son texte.
   2. Les 38 liens de lecons survivent a la panne sur la couverture qui les
      porte — c'est le maillage le plus utile du site.
   3. AUCUNE page ne dit « introuvable » a cause du reseau. Ce mot est
      reserve a ce qui est vraiment absent.
   4. `section.html`, la page generique, sert un `#couverture` VIDE : elle,
      doit afficher le message d'erreur, sinon on laisse un ecran blanc.
   5. Une section qui n'existe pas dit toujours qu'elle n'existe pas, reseau
      sain — la reparation ne doit pas avoir avale le vrai cas d'erreur.
   ========================================================================== */

import { chromium } from 'playwright-core';

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const B = 'http://127.0.0.1:8899';

// Les pages dont le corps est ECRIT dans le HTML : elles ne doivent
// pratiquement rien perdre. Le seuil est large a dessein — on attrape une
// page effacee, pas trois caracteres de difference.
const SERVIES = ['section/sens-des-sourates', 'section/le-pelerinage',
  'section/vocabulaire-arabe'];
// Les pages qui n'ont que leur coquille : elles ont le droit de perdre ce
// qui venait des donnees, mais pas de mentir sur la raison.
const AUTRES = ['', 'sections.html', 'progres.html', 'section/sens-des-sourates/qcm'];

const fautes = [];
const navigateur = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });

async function ouvrir(u, couper) {
  const c = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await c.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
  if (couper) await c.route('**/data/*.json', (r) => r.abort());
  const p = await c.newPage();
  await p.goto(`${B}/${u}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  const m = await p.evaluate(() => ({
    texte: (document.body.innerText || '').replace(/\s+/g, ' ').trim(),
    h1: ((document.querySelector('h1') || {}).textContent || '').trim(),
    liens: document.querySelectorAll('a[href]').length,
    lecons: document.querySelectorAll('a[href^="lecon-sourate-"]').length,
  }));
  await c.close();
  return m;
}

for (const u of SERVIES) {
  const sain = await ouvrir(u, false);
  const panne = await ouvrir(u, true);
  const garde = sain.texte.length ? Math.round((panne.texte.length / sain.texte.length) * 100) : 0;

  if (panne.h1 !== sain.h1) {
    fautes.push(`${u} : le titre devient « ${panne.h1} » quand les donnees ne `
      + `repondent pas, au lieu de « ${sain.h1} » — le corps de cette page est `
      + 'pourtant servi en entier dans le HTML');
  }
  if (garde < 90) {
    fautes.push(`${u} : ${garde} % du texte survit a la panne `
      + `(${panne.texte.length} caracteres sur ${sain.texte.length}) — une page `
      + 'deja affichee ne doit pas etre effacee par un fetch qui echoue');
  }
  if (panne.liens < sain.liens) {
    fautes.push(`${u} : ${sain.liens - panne.liens} lien(s) perdu(s) a la panne `
      + `(${panne.liens} contre ${sain.liens})`);
  }
  if (u.indexOf('sens-des-sourates') >= 0 && panne.lecons < 20) {
    fautes.push(`${u} : ${panne.lecons} liens de lecons apres la panne, attendu `
      + 'au moins 20 — ils sont dans le HTML servi, rien ne justifie de les perdre');
  }
  console.log(`  ${u.padEnd(30)} panne : ${String(garde).padStart(3)} % du texte, `
    + `${panne.liens} liens, ${panne.lecons} lecons`);
}

// « INTROUVABLE » NE SE DIT PAS D'UNE PANNE DE RESEAU.
for (const u of SERVIES.concat(AUTRES)) {
  const panne = await ouvrir(u, true);
  if (/introuvable/i.test(panne.texte)) {
    fautes.push(`${u || '/'} : dit « introuvable » alors que seul le reseau a `
      + 'echoue — le lecteur comprend que la page est vide');
  }
}

// LA PAGE GENERIQUE, ELLE, DOIT PARLER : son corps est vide dans le HTML,
// se taire laisserait un ecran blanc.
{
  const g = await ouvrir('section.html?section=sens-des-sourates', true);
  if (g.texte.length > 200 || !/pas pu|introuvable/i.test(g.texte)) {
    fautes.push('section.html (page generique) : ne dit pas ce qui se passe '
      + `quand les donnees manquent — ${g.texte.length} caracteres affiches. `
      + 'Son #couverture est vide dans le HTML, il n\'y a rien a garder.');
  }
  const inconnue = await ouvrir('section.html?section=nexiste-pas', false);
  if (!/introuvable/i.test(inconnue.texte)) {
    fautes.push('section.html?section=nexiste-pas : ne dit plus « introuvable » '
      + 'reseau sain — une section qui n\'existe vraiment pas doit le dire');
  }
}

await navigateur.close();

if (fautes.length) {
  console.log(`  ${fautes.length} FAUTE(S) :`);
  fautes.forEach((f) => console.log('    ' + f));
  process.exit(1);
}
console.log('  Donnees coupees : les pages de section gardent leur corps, leur');
console.log('  titre et leurs liens ; aucune ne parle d\'introuvable a cause du');
console.log('  reseau ; la page generique, elle, dit ce qui se passe.');
