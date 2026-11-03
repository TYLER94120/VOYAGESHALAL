/* ==========================================================================
   OU EST CHROMIUM — resolu, pas ecrit en dur

   CE QUI S'EST PASSE LE 3 NOVEMBRE
   --------------------------------
   Les trente controles portaient chacun la meme chaine :

       executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

   Le conteneur a ete reconstruit. Chromium y est maintenant en 1243, et son
   dossier s'appelle « chrome-linux64 » et non « chrome-linux ». Le chemin
   ecrit en dur n'existait plus.

       29 controles sur 30 au ROUGE, d'un seul coup.

   Aucun ne portait sur le site : tous echouaient a lancer le navigateur. Et
   29 rouges simultanes ressemblent a une catastrophe — c'est le meme piege
   que les trois rouges du 25 octobre, en dix fois plus gros.

   CE QUE CE MODULE FAIT
   ---------------------
   Il cherche le navigateur dans cet ordre, et dit lequel il a pris :

     1. $CHROMIUM            — pour qu'on puisse imposer un binaire ;
     2. /opt/pw-browsers/chromium  — le lien que l'environnement tient a jour
                                     et qui suit les reconstructions ;
     3. le plus recent des dossiers « chromium-NNNN », sous
        $PLAYWRIGHT_BROWSERS_PATH, dans « chrome-linux64 » ou « chrome-linux ».

   S'il ne trouve rien, il S'ARRETE EN DISANT OU IL A CHERCHE. Un controle
   qui echoue parce qu'il manque un navigateur doit le dire ; sinon on
   cherche le defaut dans le site pendant une heure.

   POURQUOI PAS `chromium.launch()` TOUT COURT
   ------------------------------------------
   playwright-core est epingle a 1.63.0 par le depot, et chaque version
   attend SA revision de navigateur. Sans `executablePath`, elle reclamerait
   la 1194, absente du conteneur. On prend donc le binaire que
   l'environnement fournit, quel que soit son numero.
   ========================================================================== */

import fs from 'fs';
import path from 'path';

function trouver() {
  if (process.env.CHROMIUM && fs.existsSync(process.env.CHROMIUM)) {
    return { exe: process.env.CHROMIUM, via: '$CHROMIUM' };
  }

  const racine = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';

  const lien = path.join(racine, 'chromium');
  if (fs.existsSync(lien) && fs.statSync(lien).isFile()) {
    return { exe: lien, via: 'le lien ' + lien };
  }

  // Les dossiers versionnes, du plus recent au plus ancien. Le dossier
  // interne a change de nom entre deux versions : on essaie les deux.
  let dossiers = [];
  try {
    dossiers = fs.readdirSync(racine).filter((d) => /^chromium-\d+$/.test(d));
  } catch (e) { dossiers = []; }
  dossiers.sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dossiers) {
    for (const sous of ['chrome-linux64', 'chrome-linux']) {
      const p = path.join(racine, d, sous, 'chrome');
      if (fs.existsSync(p)) { return { exe: p, via: d + '/' + sous }; }
    }
  }

  console.error(
    'ARRET : aucun Chromium trouve.\n'
    + '        cherche dans $CHROMIUM, puis ' + lien + ',\n'
    + '        puis ' + racine + '/chromium-*/chrome-linux*/chrome.\n'
    + '        Ce controle ne mesure donc RIEN — ce n\'est pas une faute du site.');
  process.exit(2);
}

const trouve = trouver();

/** Le binaire a lancer. */
export const EXE = trouve.exe;

/** D'ou il vient, pour qu'un controle puisse le dire. */
export const VIA = trouve.via;
