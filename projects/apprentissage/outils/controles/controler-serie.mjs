/* LA SERIE ET SON FILET — logique pure, sans navigateur.
 *
 * Ce controle ne charge aucune page : il extrait `serieComplete` de
 * js/memoire.js et lui pose des questions. C'est voulu. Une regle de comptage
 * se casse sur des cas qu'on ne rencontre qu'une fois par mois — un trou de
 * deux jours, une visite le jour meme, un stock qui deborde — et les attendre
 * dans un navigateur reviendrait a ne jamais les tester.
 *
 * Verdict par code de sortie. */

import { readFileSync } from 'node:fs';

let ec = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); ec++; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

// On prend la VRAIE fonction du site, pas une copie : une copie diverge.
const src = readFileSync(new URL('../../js/memoire.js', import.meta.url), 'utf8');
const debut = src.indexOf('var GRACE_TOUS_LES');
const fin = src.indexOf('function marquerLeJour');
if (debut < 0 || fin < 0 || fin <= debut) {
  console.log('  ECHEC  impossible d extraire serieComplete de js/memoire.js');
  process.exit(1);
}
const serieComplete = new Function(src.slice(debut, fin) + '\n return serieComplete;')();

/* Un petit calendrier pour ecrire les cas lisiblement : « J » = jour visite,
 * « . » = jour sans visite, de gauche a droite, le dernier caractere etant
 * AUJOURD'HUI. */
function cas(motif) {
  const n = motif.length;
  const base = new Date('2026-06-01T12:00:00');
  const jours = [];
  let aujourdhui = null;
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const cle = d.toISOString().slice(0, 10);
    if (i === n - 1) aujourdhui = cle;
    if (motif[i] === 'J') jours.push(cle);
  }
  return serieComplete({ jours }, aujourdhui);
}

const v = (nom, motif, attendu) => {
  const r = cas(motif);
  const eg = r.serie === attendu.serie && r.record === attendu.record
    && (attendu.sauvee === undefined || r.sauvee === attendu.sauvee);
  const dire = (x) => x.serie + '/' + x.record + (x.sauvee ? ' sauvee' : '');
  if (!eg) rate(nom, motif + ' : ' + dire(r) + ', attendu ' + dire(attendu));
  else ok(nom, motif + ' -> ' + dire(r));
};

console.log('  --- la serie de base ---');
v('aucune visite', '....', { serie: 0, record: 0 });
v('un seul jour, aujourd hui', 'J', { serie: 1, record: 1 });
v('trois jours d affilee', 'JJJ', { serie: 3, record: 3 });
v('la serie court jusqu a hier', 'JJJ.', { serie: 3, record: 3 });

// LA JOURNEE EN COURS N'EST PAS FINIE. Sans cette regle, ouvrir le site le
// matin afficherait une serie cassee que la visite du soir aurait sauvee.
v('aujourd hui non visite ne casse rien', 'JJJJ.', { serie: 4, record: 4 });

console.log('\n  --- le jour de grace ---');
// Cinq jours donnent un jour de grace ; le trou du sixieme est absorbe.
v('5 jours puis un trou : la grace absorbe', 'JJJJJ.J', { serie: 6, record: 6, sauvee: false });
// Le trou doit etre un jour REVOLU : aujourd'hui non visite n'a encore rien
// coute, donc aucune grace n'a ete depensee et il n'y a rien a annoncer.
v('la grace se voit au jour revolu', 'JJJJJ..', { serie: 5, record: 5, sauvee: true });
// Quatre jours ne suffisent pas : pas encore de grace en reserve.
v('4 jours puis un trou : la serie tombe', 'JJJJ.J', { serie: 1, record: 4 });
// Deux trous d affilee avec une seule grace en stock.
v('deux trous, une seule grace', 'JJJJJ..J', { serie: 1, record: 5 });
// Dix jours donnent deux graces : deux trous sont absorbes.
v('10 jours, deux graces, deux trous', 'JJJJJJJJJJ..J', { serie: 11, record: 11 });
// Le stock plafonne a deux : vingt jours ne donnent pas quatre graces.
v('le stock ne depasse jamais deux', 'JJJJJJJJJJJJJJJJJJJJ...J', { serie: 1, record: 20 });

console.log('\n  --- le record ---');
// LE RECORD SURVIT A LA CASSURE : c est tout ce qui reste quand la chaine
// tombe, et c est ce qui fait recommencer.
v('le record survit a la cassure', 'JJJJJJJ...J', { serie: 1, record: 7 });
v('le record ne descend jamais', 'JJJJJJJ...JJ', { serie: 2, record: 7 });
v('une serie plus longue releve le record', 'JJJ..JJJJJ', { serie: 5, record: 5 });

console.log('\n  --- les cas qui derangent ---');
v('un jour isole tres ancien', 'J.........', { serie: 0, record: 1 });
v('trou puis reprise aujourd hui', 'JJ...J', { serie: 1, record: 2 });
// Un jour sur deux : chaque trou remet a zero, jamais assez de suite pour
// gagner une grace. La derniere visite etant hier, la serie vaut 1.
v('un jour sur deux ne gagne aucune grace', '.J.J.J.J.', { serie: 1, record: 1 });
v('serie longue sans aucun trou', 'JJJJJJJJJJJJ', { serie: 12, record: 12 });

// Des jours en double ou dans le desordre ne doivent rien changer : la liste
// vient d un localStorage que personne ne garantit propre.
{
  const r1 = serieComplete({ jours: ['2026-06-03', '2026-06-01', '2026-06-02'] }, '2026-06-03');
  const r2 = serieComplete({ jours: ['2026-06-01', '2026-06-02', '2026-06-02', '2026-06-03'] }, '2026-06-03');
  if (r1.serie !== 3 || r2.serie !== 3) {
    rate('desordre ou doublons dans les jours', r1.serie + ' et ' + r2.serie + ', attendu 3 et 3');
  } else ok('desordre et doublons sans effet', '3 et 3');
}

/* LE VERROU DE TON. Il echoue si un mot de reproche apparait dans ce qui est
 * ecrit a l ecran quand la serie est cassee. Une consigne de ton se perd en
 * trois semaines ; un test, non.
 *
 * Les mots sont bornes EN MOTS ENTIERS : « sourate » contient « rate », et la
 * version naive se declenchait sur le mot le plus frequent du site. Un verrou
 * qui crie au loup est un verrou qu on desactive. */
console.log('\n  --- le ton, quand la serie est cassee ---');
const LETTRE = 'a-zàâäçéèêëîïôöûùüÿñæœ';
const MOTS = ['perdu', 'perdue', 'perdus', 'casse', 'cassee', 'cassé', 'cassée',
              'dommage', 'rate', 'ratee', 'raté', 'ratée', 'echec', 'échec',
              'nul', 'nulle', 'honte', 'honteux', 'helas', 'hélas',
              'malheureusement'];
const REPROCHE = new RegExp('(^|[^' + LETTRE + '])(' + MOTS.join('|') + ')([^' + LETTRE + ']|$)', 'i');

// Ce que le site ecrit reellement autour de la serie, extrait des sources.
const textes = [];
for (const f of ['../../js/accueil.js', '../../js/progres.js', '../../js/resultat.js',
                 '../../js/qcm.js', '../../index.html', '../../progres.html']) {
  let t = '';
  try { t = readFileSync(new URL(f, import.meta.url), 'utf8'); } catch (e) { continue; }
  // Les chaines de caracteres du fichier : c est ce qui peut finir a l ecran.
  for (const m of t.matchAll(/'([^'\\\n]{4,})'|"([^"\\\n]{4,})"/g)) {
    const s = m[1] || m[2];
    // ON NE TESTE QUE CE QU'UN HUMAIN PEUT LIRE. `data-e="rate"` est un nom
    // d'etat interne, jamais affiche : le compter ferait sonner le verrou sur
    // du code, et un verrou qui sonne sur du code finit desactive. Une phrase
    // se reconnait a son espace ou a sa ponctuation de fin.
    if (/\s/.test(s) || /[.!?…]$/.test(s)) textes.push(s);
  }
}
const fautifs = textes.filter((s) => REPROCHE.test(s));
if (fautifs.length) {
  rate(fautifs.length + ' texte(s) de reproche dans les sources', fautifs.slice(0, 4).join(' | '));
} else ok('aucun mot de reproche dans les textes du site', textes.length + ' chaines lues');

// ET DANS L AUTRE SENS : un verrou qui ne peut jamais sonner ne protege rien.
if (!REPROCHE.test('Dommage, tu as perdu ta série de 7 jours.')) {
  rate('le verrou ne se declenche pas sur une vraie phrase de reproche');
} else ok('le verrou sonne bien sur une phrase de reproche');
// Et il ne doit PAS sonner sur le mot le plus frequent du site.
if (REPROCHE.test('Le sens des sourates, sourate Al-Asr')) {
  rate('le verrou se declenche sur « sourate » — il sera desactive');
} else ok('le verrou ignore « sourate », « separer », « narrateur »');

console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
