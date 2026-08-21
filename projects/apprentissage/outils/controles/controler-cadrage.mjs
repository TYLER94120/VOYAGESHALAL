/* AUCUNE CARTE NE DOIT DEBORDER. LES 1 252, A QUATRE LARGEURS.
 *
 * « Le texte sort du cadre » — Mohamed, 21 aout. Ce controle passe la banque
 * entiere en revue, question par question, et verifie trois choses :
 *
 *   1. la carte contient tout son contenu (rien ne passe sous le bord) ;
 *   2. les QUATRE reponses sont entierement dans la carte ;
 *   3. les cibles tactiles font toujours 44 px, meme a l'echelle la plus basse.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });

const SECTIONS = ['sens-des-sourates','histoire-des-prophetes','la-priere',
                  'les-invocations','piliers-de-la-foi','zakat-et-aumone'];
// Le plus petit telephone encore courant, celui de reference, un grand, une tablette.
const ECRANS = [[360,640,'petit'],[390,844,'reference'],[430,932,'grand'],[820,1180,'tablette']];

for (const [w,h,nom] of ECRANS) {
  const ctx = await nav.newContext({ viewport:{width:w,height:h}, isMobile:w<800, hasTouch:w<800 });
  // ICI, ET ICI SEULEMENT, on laisse passer les polices : mesurer le cadrage
  // avec une police de remplacement ne mesure pas ce que les gens voient.
  // Amiri ne fait pas la meme hauteur que la police par defaut.
  await ctx.route('**', (r) => {
    const u = r.request().url();
    if (u.startsWith(B) || /fonts\.(googleapis|gstatic)\.com/.test(u)) return r.continue();
    return r.abort();
  });
  const p = await ctx.newPage();
  const err=[]; p.on('pageerror',(e)=>err.push(e.message));
  await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20', { waitUntil:'domcontentloaded' });
  await p.waitForSelector('.reponse');
  await p.evaluate(() => document.fonts.ready);
  const amiri = await p.evaluate(() => document.fonts.check('16px Amiri'));
  if (!amiri) rate('Amiri n est pas chargee : la mesure ne vaudrait rien');
  else ok('Amiri chargee, on mesure sur la vraie police');

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
