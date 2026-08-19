// 🌍 PHASE 0 DU CHANTIER GOHALALTRAVEL — prévisualisations statiques,
// RIEN dans le site, montrées pour validation visuelle :
//   public/preview-world.html   — le World feed : on swipe les 10 villes
//                                 de lancement (scores HalalScore RÉELS de
//                                 la base ; accroches = format, marquées).
//   public/preview-city-en.html — le City feed Istanbul en anglais,
//                                 dérivé de la préviz Immersion validée.
// Photos réelles cherchées par le NAVIGATEUR via l'API Wikipédia (aucun
// nom de fichier à la main — la leçon du 19 août) ; en échec, dégradé de
// secours + badge franc. Interface en anglais (libellés du brief §5).
import { readFileSync, writeFileSync } from 'node:fs'

const VILLES = ['istanbul', 'marrakech', 'kuala-lumpur', 'dubai', 'doha', 'le-caire', 'sarajevo', 'londres', 'paris', 'bangkok']
const FONDS = ['#0E2A3F', '#8C3A1E', '#0E3F35', '#231A2E', '#1B3A5C', '#33200D', '#1E2B1A', '#2E1F3E', '#14263B', '#2C1A3E']

const maquette = readFileSync('maquette-moteur-universel.html', 'utf8')
const css = maquette.slice(maquette.indexOf('<style>') + 7, maquette.indexOf('</style>'))

const PAYS_EN = { 'Turquie': 'Turkey', 'Maroc': 'Morocco', 'Malaisie': 'Malaysia', 'Émirats Arabes Unis': 'United Arab Emirates', 'Qatar': 'Qatar', 'Égypte': 'Egypt', 'Bosnie': 'Bosnia', 'Royaume-Uni': 'United Kingdom', 'France': 'France', 'Thaïlande': 'Thailand' }
const donnees = VILLES.map((slug, i) => {
  const v = JSON.parse(readFileSync(`data/villes/${slug}.json`, 'utf8'))
  return { slug, nom: v.nom_en ?? v.nom, pays: PAYS_EN[v.pays] ?? v.pays, score: v.halalScore, fond: FONDS[i] }
})

const tonScore = (s) => (s >= 9 ? '#1F7A4A' : s >= 8 ? '#6FD79C;color:#0A1509' : s >= 7 ? '#E8B45A;color:#160E03' : 'rgba(253,250,243,.25)')

const panneau = (v, i) => `
<section class="panneau">
  <div class="scene" style="background:linear-gradient(180deg,${v.fond},#060E08)"></div>
  <img class="photo" alt="" data-requete="${v.nom}" ${i < 2 ? '' : 'loading="lazy"'}>
  <span class="note-photo" style="top:70px">Photo: Wikimedia — Google Places in prod</span>
  <div class="contenu">
    <span class="etiquette et-type">DESTINATION</span>
    <h1>${v.nom}</h1>
    ${typeof v.score === 'number' ? `<div style="margin-top:10px"><span class="score-pill" style="background:${tonScore(v.score)}">✦ ${String(v.score).replace('.', ',')}</span></div>` : ''}
    <p class="ia">Insider hook — AI-cached in prod <em style="opacity:.55">(format)</em></p>
    <p class="meta">${v.pays}</p>
    <div class="actions">
      ${v.slug === 'istanbul' ? '<a class="b-or" href="/preview-city-en.html" style="text-decoration:none">Explore Istanbul</a>' : `<button class="b-or">Explore ${v.nom}</button>`}
      <button class="b-verre" onclick="coeur(event)">♡</button>
    </div>
  </div>
</section>`

const world = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>GoHalalTravel — World feed (phase 0 preview)</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>${css}
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;}
.panneau::after{z-index:2;}
.note-photo{z-index:3;}
.contenu{z-index:4;}
</style>
</head>
<body>
<div class="demo">PREVIEW · WORLD FEED — real HalalScores, hooks = format</div>
<nav class="selecteur">
  <button class="sel on">World</button><button class="sel">Eat</button><button class="sel">Sleep</button><button class="sel">Do</button>
</nav>
<div class="flux on" id="f-monde">
${donnees.map(panneau).join('\n')}
</div>
<div class="toast" id="toast">♡ Saved to your list</div>
<script>
let tm;
function coeur(e){e.stopPropagation();const b=e.currentTarget;b.textContent='♥';b.style.color='#E9D9A6';
  const t=document.getElementById('toast');t.classList.add('on');clearTimeout(tm);tm=setTimeout(()=>t.classList.remove('on'),1300);}
async function chargerPhoto(im){
  const echec=()=>{const b=im.parentElement.querySelector('.note-photo');if(b)b.textContent='Photo unavailable — tell me';im.remove();}
  im.addEventListener('error',echec)
  const q=encodeURIComponent(im.dataset.requete)
  for(const wiki of ['en.wikipedia.org','fr.wikipedia.org']){
    try{
      const r=await fetch('https://'+wiki+'/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=1&gsrsearch='+q+'&prop=pageimages&piprop=thumbnail&pithumbsize=1100')
      const j=await r.json();const pages=Object.values((j.query||{}).pages||{})
      const src=pages[0]&&pages[0].thumbnail&&pages[0].thumbnail.source
      if(src){im.src=src;return}
    }catch(e){}
  }
  echec()
}
document.querySelectorAll('.photo').forEach(chargerPhoto)
</${'script'}>
</body>
</html>`
writeFileSync('public/preview-world.html', world)

// ── City feed Istanbul EN : la préviz validée, libellés anglais ──
let city = readFileSync('public/preview-immersion.html', 'utf8')
const TR = [
  ['<html lang="fr">', '<html lang="en">'],
  ['MAQUETTE · PRÉVISUALISATION — textes = format, photos réelles Wikimedia', 'PREVIEW · CITY FEED — texts = format, real Wikimedia photos'],
  ['☰ Pratique', '☰ Essentials'],
  ['GUIDE HALAL', 'HALAL GUIDE'],
  ['Acceptable — voyage possible,<br>un peu de préparation', 'Very good — everything is easy'],
  ['Swipe pour découvrir · double-tap = ♡', 'Swipe to explore · double-tap = ♡'],
  ['📍 Y aller', '📍 Go'],
  ['Réserver', 'Book'],
  ['✨ Construire mes journées', '✨ Build my days'],
  ['↺ Me montrer d’autres pépites', '↺ Show me more gems'],
  ["↺ Me montrer d'autres pépites", '↺ Show me more gems'],
  ['Istanbul te plaît ?', 'Falling for Istanbul?'],
  ['Tes coups de cœur sont gardés.', 'Your saves are kept.'],
  ['On peut maintenant construire tes journées,', 'Now we can build your days,'],
  ['rythmées par les 5 prières.', 'shaped around the 5 prayers.'],
  ['♡ 0 lieu gardé', '♡ 0 place saved'],
  ['Istanbul pratique', 'Istanbul essentials'],
  ['Tous les hôtels sans alcool', 'All alcohol-free hotels'],
  ['Toutes les tables halal', 'All halal tables'],
  ['Mosquées &amp; horaires de prière', 'Mosques &amp; prayer times'],
  ['À savoir avant de partir', 'Good to know before you land'],
  ['♡ Gardé dans tes coups de cœur', '♡ Saved to your list'],
  ['✓ HALAL VÉRIFIÉ', '✓ HALAL VERIFIED'],
  ['Photo indisponible — à me signaler', 'Photo unavailable — tell me'],
]
for (const [a, b] of TR) city = city.split(a).join(b)
writeFileSync('public/preview-city-en.html', city)
console.log('preview-world.html (10 villes, scores réels) + preview-city-en.html écrits')
