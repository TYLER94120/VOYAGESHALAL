/* AUCUNE CARTE NE DOIT DEBORDER. LES 1 252, A QUATRE LARGEURS.
 *
 * « Le texte sort du cadre » — Mohamed, 21 aout. Ce controle passe la banque
 * entiere en revue, question par question, et verifie trois choses :
 *
 *   1. la carte contient tout son contenu (rien ne passe sous le bord) ;
 *   2. les QUATRE reponses sont entierement dans la carte ;
 *   3. les cibles tactiles font toujours 44 px, meme a l'echelle la plus basse.
 *
 * CE CONTROLE A MENTI PENDANT DES SEMAINES — corrige le 5 octobre
 * ---------------------------------------------------------------
 * Il laissait sortir les requetes de police vers Google, expres, et annoncait
 * a chaque execution « Amiri chargee, on mesure sur la vraie police ». Les
 * requetes echouaient toutes sur ERR_CERT_AUTHORITY_INVALID, et
 *
 *     document.fonts.check('16px Amiri')
 *
 * repondait VRAI avec ZERO regle @font-face : sans declaration, le navigateur
 * repond pour la police de secours, qui sait toujours dessiner le texte.
 * L'assertion ne pouvait pas echouer. Toutes les hauteurs mesurees ici
 * l'etaient avec une police 19 % plus large que Source Sans 3.
 *
 * Les polices viennent maintenant du disque (outils/polices/) et
 * attendrePolices() compare une largeur mesuree : lui, il echoue.
 * Resultat : les conclusions n'ont pas bouge — aucune carte ne deborde,
 * les cibles font 44 px — mais elles sont enfin mesurees sur ce que les
 * gens voient.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

// La liste des sections n'est PAS ecrite ici : elle est lue dans la page, au
// meme endroit que le site. Une liste figee vieillit en silence, et le jour
// ou une section arrive, le controle ne la voit pas.
let SECTIONS = null;
/* 320 AJOUTE LE 5 OCTOBRE, parce qu'il manquait.
 * La ponctuation orpheline du 4 octobre ne se voyait qu'a 320 px, et ce
 * controle commencait a 360 : la largeur ou le defaut vivait n'etait pas
 * regardee. Elle est propre — rien ne deborde, les quatre reponses sont
 * atteignables, les cibles tiennent leurs 44 px — mais elle dit une chose
 * que les autres largeurs cachaient :
 *
 *     320 x 568   2 596 cartes sur 2 701 demandent de faire glisser   96 %
 *     360 x 640   2 124                                              79 %
 *     390 x 844     264                                              10 %
 *     430 x 932     142                                               5 %
 *     820 x 1180      0                                               0 %
 *
 * Sur le plus petit telephone encore en service, presque aucune carte ne
 * tient a l'ecran, et 2 651 sur 2 701 sont deja a la plus petite echelle :
 * il n'y a plus de marge a prendre. Ce n'est pas une faute au sens de ce
 * controle — le signe « il y en a plus » est bien la — c'est un fait de
 * conception, et il se decide en haut, pas ici. SIGNALE, PAS TOUCHE. */
const ECRANS = [[320,568,'minuscule'],[360,640,'petit'],[390,844,'reference'],[430,932,'grand'],[820,1180,'tablette']];

for (const [w,h,nom] of ECRANS) {
  const ctx = await nav.newContext({ viewport:{width:w,height:h}, isMobile:w<800, hasTouch:w<800 });
  // Mesurer le cadrage avec une police de remplacement ne mesure pas ce que
  // les gens voient : Amiri ne fait pas la meme hauteur que la police par
  // defaut. Ce controle laissait donc sortir les requetes vers Google — et
  // elles echouaient toutes, ici, sur ERR_CERT_AUTHORITY_INVALID. Les vraies
  // polices arrivent maintenant du disque, sans sortir du conteneur.
  await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
  await brancherPolices(ctx);
  const p = await ctx.newPage();
  const err=[]; p.on('pageerror',(e)=>err.push(e.message));
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');
  // document.fonts.check('16px Amiri') repondait VRAI avec ZERO regle
  // @font-face chargee : sans declaration, le navigateur repond pour la police
  // de secours, qui sait toujours dessiner le texte. Cette ligne a donc affiche
  // « on mesure sur la vraie police » a chaque execution pendant des semaines,
  // sans qu'elle puisse echouer une seule fois. attendrePolices compare une
  // largeur mesuree : elle, elle peut echouer.
  try { await attendrePolices(p); ok('les trois polices du site sont en place'); }
  catch (e) { rate(e.message); }

  if (!SECTIONS) {
    // Les sections qui ont vraiment une banque : une section vide n'a rien
    // a cadrer, et signaler son absence serait un faux positif.
    SECTIONS = await p.evaluate(async () => {
      const s = await fetch('data/sections.json').then((r) => r.json());
      const out = [];
      for (const x of s) {
        const b = await fetch('data/questions/' + x.slug + '.json')
          .then((r) => (r.ok ? r.json() : [])).catch(() => []);
        if (b.length) out.push(x.slug);
      }
      return out;
    });
    console.log('  sections a cadrer : ' + SECTIONS.join(', '));
  }

  const bilan = await p.evaluate(async (sections) => {
    const carte = document.getElementById('carte');
    const out = { total:0, deborde:[], inatteignable:[], sansSigne:[],
                  petitesCibles:[], echelles:{}, defilent:0 };
    for (const s of sections) {
      const banque = await fetch('data/questions/' + s + '.json').then((x) => x.json());
      for (const q of banque) {
        carte.innerHTML = window.IPAP_QCM.carteHTML(q, true);
        const e = window.IPAP_QCM.ajusterEchelle(carte);
        out.total++;
        out.echelles[e] = (out.echelles[e] || 0) + 1;
        const d = carte.querySelector('.carte-dedans');

        // 1. La CARTE, elle, ne deborde jamais de la zone.
        if (carte.scrollHeight > carte.clientHeight + 1) {
          out.deborde.push(s + '/' + q.id + ' ' + carte.scrollHeight + '>' + carte.clientHeight);
        }

        const reps = carte.querySelectorAll('.reponse');
        if (reps.length !== 4) { out.inatteignable.push(s + '/' + q.id + ' ' + reps.length + ' reponses'); continue; }

        // 2. Le contenu deborde-t-il ? Alors le signe doit etre la.
        const long = d.scrollHeight > d.clientHeight + 1;
        if (long) {
          out.defilent++;
          if (carte.getAttribute('data-defile') !== 'oui') out.sansSigne.push(s + '/' + q.id);
        }

        // 3. CHAQUE reponse doit etre atteignable : on defile jusqu'a elle
        //    et on verifie qu'elle est alors entierement visible.
        for (const r of reps) {
          const b0 = r.getBoundingClientRect();
          if (b0.height < 44) { out.petitesCibles.push(s + '/' + q.id + ' ' + Math.round(b0.height) + 'px'); break; }
          r.scrollIntoView({ block: 'nearest' });
          const bd = d.getBoundingClientRect(), b = r.getBoundingClientRect();
          if (b.bottom > bd.bottom + 1 || b.top < bd.top - 1) {
            out.inatteignable.push(s + '/' + q.id + ' reponse hors d atteinte meme en defilant');
            break;
          }
        }
        d.scrollTop = 0;
      }
    }
    return out;
  }, SECTIONS);

  console.log('--- ' + nom + ' ' + w + 'x' + h + ' : ' + bilan.total + ' questions ---');
  const ech = Object.entries(bilan.echelles).sort((a,b)=>b[0]-a[0])
    .map(([k,v]) => k + ' : ' + v).join('   ');
  console.log('  echelles   ' + ech);
  console.log('  ' + bilan.defilent + ' carte(s) demandent de faire glisser ('
    + Math.round(100*bilan.defilent/bilan.total) + ' %)');
  if (bilan.deborde.length) rate(bilan.deborde.length + ' carte(s) debordent', bilan.deborde.slice(0,3).join(' | '));
  else ok('aucune carte ne deborde de la zone');
  if (bilan.inatteignable.length) rate(bilan.inatteignable.length + ' reponse(s) hors d atteinte', bilan.inatteignable.slice(0,3).join(' | '));
  else ok('les quatre reponses sont atteignables partout');
  if (bilan.sansSigne.length) rate(bilan.sansSigne.length + ' carte(s) longue(s) sans signe de defilement', bilan.sansSigne.slice(0,3).join(' | '));
  else ok('toute carte longue affiche le signe « il y en a plus »');
  if (bilan.petitesCibles.length) rate(bilan.petitesCibles.length + ' cible(s) sous 44 px', bilan.petitesCibles.slice(0,3).join(' | '));
  else ok('toutes les cibles font 44 px ou plus');
  if (err.length) rate('erreurs JavaScript', err.join(' | '));
  await ctx.close();
}
await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
