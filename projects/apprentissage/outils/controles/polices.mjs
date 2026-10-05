/* ==========================================================================
   LES VRAIES POLICES, SERVIES AU NAVIGATEUR DE CONTROLE

   CE QU'ON A DECOUVERT, LE 5 OCTOBRE
   ----------------------------------
   Tous les controles de navigateur coupent le reseau exterieur :

       ctx.route('**', (r) => url.startsWith(B) ? r.continue() : r.abort())

   C'est la bonne regle — un controle ne doit pas dependre de Google. Mais
   les trois polices du site viennent de Google. Chromium ne les a donc
   JAMAIS eues, et mesurait depuis le debut avec les polices de secours :
   Georgia pour les titres (absente ici aussi, donc un serif quelconque),
   system-ui pour le corps (DejaVu Sans dans un conteneur sans bureau).

   Toute mesure de mise en page etait prise sur de mauvaises largeurs de
   caracteres : debordements, cibles de 44 px, retours a la ligne,
   ponctuation orpheline. Rien de tout cela ne se verifie avec la police
   d'un autre.

   CE QUE FAIT CE FICHIER
   ----------------------
   Il repond lui-meme a la place de Google, depuis outils/polices/. Le
   navigateur reste coupe du reseau : il ne sort pas, c'est le controle qui
   lui tend les fichiers. La feuille de style est celle que Google sert,
   mot pour mot, avec ses unicode-range intacts.

   POURQUOI IL VERIFIE QU'ELLES SONT ARRIVEES
   ------------------------------------------
   Une police qui n'arrive pas ne fait pas d'erreur : la page s'affiche avec
   celle de secours, et la mesure est fausse sans rien dire. C'est exactement
   comme cela que des semaines de mesures sont passees. attendrePolices()
   refuse donc de rendre la main si Marcellus, Source Sans 3 ou Amiri
   manquent — et il ne se contente pas de document.fonts.check(), qui
   repondrait oui pour une police seulement declaree : il mesure la largeur
   d'un mot avec la police, puis sans, et exige que les deux diffèrent.
   ========================================================================== */

import fs from 'fs';

const DOSSIER = new URL('../polices/', import.meta.url);
const CARTE = JSON.parse(fs.readFileSync(new URL('carte.json', DOSSIER), 'utf8'));
const FEUILLE = fs.readFileSync(new URL('google.css', DOSSIER), 'utf8');
/* Chaque police avec un mot de SON ecriture. Un sous-ensemble ne se
   telecharge que si un caractere de son unicode-range est demande : tester
   Amiri avec un mot latin ne declenche rien et le ferait passer pour absent. */
const FAMILLES = [
  { nom: 'Marcellus', mot: 'Hamidullah' },
  { nom: 'Source Sans 3', mot: 'Hamidullah' },
  { nom: 'Amiri', mot: 'بسم' },   // « bism », les trois lettres de la basmala

];

/* Les requetes de police, servies depuis le disque.
   A appeler APRES la route generale du controle : dans Playwright le dernier
   gestionnaire pose passe en tete, donc le pousser en premier le ferait
   couper par le ctx.route('**') qui suit. Mesure faite, pas devinee. */
export async function brancherPolices(ctx) {
  await ctx.route('https://fonts.googleapis.com/css2*', (r) =>
    r.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', body: FEUILLE }));
  await ctx.route('https://fonts.gstatic.com/**', (r) => {
    const nom = CARTE[r.request().url()];
    // Sous-ensemble non telecharge (cyrillique, grec, vietnamien...) : son
    // unicode-range ne couvre aucun caractere du site, le couper ne change
    // aucune largeur.
    if (!nom) { return r.abort(); }
    return r.fulfill({
      status: 200,
      contentType: 'font/woff2',
      body: fs.readFileSync(new URL(nom, DOSSIER)),
    });
  });
}

/* Rend la main quand les trois polices sont VRAIMENT en place. Jette sinon :
   mieux vaut un controle qui s'arrete qu'un controle qui mesure a cote.

   On demande les trois a charger meme si la page n'en affiche pas (progres.html
   n'a pas un mot d'arabe) : ce qu'on verifie ici, c'est que le branchement
   fonctionne, pas ce que la page contient. Charger une police ne change rien
   la ou le CSS ne l'appelle pas. */
export async function attendrePolices(page) {
  const absentes = await page.evaluate(async (familles) => {
    await Promise.all(familles.map(
      (f) => document.fonts.load(`400 32px "${f.nom}"`, f.mot).catch(() => null)));
    await document.fonts.ready;
    const t = document.createElement('canvas').getContext('2d');
    const large = (police, mot) => { t.font = `32px ${police}`; return t.measureText(mot).width; };
    return familles.filter((f) => {
      if (!document.fonts.check(`32px "${f.nom}"`, f.mot)) { return true; }
      // Declaree ne veut pas dire arrivee : si la largeur est exactement celle
      // du temoin, c'est le temoin qui dessine, donc la police manque.
      return Math.abs(large(`"${f.nom}", monospace`, f.mot)
        - large('monospace', f.mot)) < 0.5;
    }).map((f) => f.nom);
  }, FAMILLES);
  if (absentes.length) {
    throw new Error('POLICES ABSENTES : ' + absentes.join(', ')
      + '. La mesure serait prise avec une police de secours. '
      + 'Relancer outils/polices/preparer.py.');
  }
}
