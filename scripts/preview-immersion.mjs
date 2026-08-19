// 🎬 ÉTAPE 0 DU CHANTIER IMMERSION — la prévisualisation statique
// d'Istanbul, construite DEPUIS la maquette (contrat visuel), avec les
// vraies photos des vrais lieux via Wikimedia Commons (images libres).
//
// ⚠️ Sandbox sans accès aux hôtes photos : les URL Commons sont posées
// pour être chargées par le NAVIGATEUR du lecteur (Special:FilePath est
// stable) ; si une photo manque, le panneau retombe sur le dégradé de
// secours de la maquette — jamais un écran noir — et un badge « photo à
// vérifier » le dit. Les textes sont les placeholders de FORMAT de la
// maquette (bannière MAQUETTE visible). RIEN ici n'entre dans le site :
// c'est public/preview-immersion.html, montré pour validation.
import { readFileSync, writeFileSync } from 'node:fs'

const wm = (f, w = 1000) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=${w}`

// Le pool de départ dicté par le brief (lieux RÉELS et célèbres — les
// notes/prix/conseils restent des placeholders de format).
const POOL = [
  { cat: 'monument', et: 'et-type', ete: 'LIEU CULTE', nom: 'La Mosquée Bleue', ia: "20 000 carreaux d'Iznik — vas-y au Fajr, tu seras presque seul", meta: 'Sultanahmet · gratuit · espace femmes', fond: '#1B3A5C',
    photos: ['Sultan Ahmed Mosque Istanbul Turkey retouched.jpg', 'Blue Mosque at dawn.jpg'] },
  { cat: 'monument', et: 'et-type', ete: 'INCONTOURNABLE', nom: 'Sainte-Sophie', ia: '1 500 ans d’histoire sous une seule coupole — entre tôt, avant les groupes', meta: 'Sultanahmet · redevenue mosquée', fond: '#3A2A18',
    photos: ['Hagia Sophia Mars 2013.jpg', 'Hagia Sophia 2022.jpg'] },
  { cat: 'monument', et: 'et-type', ete: 'LIEU CULTE', nom: 'Mosquée de Süleymaniye', ia: 'Le chef-d’œuvre de Sinan — la terrasse regarde toute la Corne d’Or', meta: 'Süleymaniye · gratuit · vue panoramique', fond: '#14263B',
    photos: ['Süleymaniye Mosque, Istanbul, Turkey.jpg', 'Suleymaniye Mosque.jpg'] },
  { cat: 'lieu', et: 'et-type', ete: 'LE PLUS VISITÉ', nom: 'Le Grand Bazar', ia: '4 000 boutiques sous les voûtes — négocie tout, commence à moitié prix', meta: 'Beyazıt · entrée libre · fermé dimanche', fond: '#33200D',
    photos: ['Grand Bazaar, Istanbul (36132073072).jpg', 'Grand-Bazaar Shop.jpg'] },
  { cat: 'lieu', et: 'et-type', ete: 'SENS EN ÉVEIL', nom: 'Le Bazar égyptien', ia: 'Les pyramides d’épices depuis 1664 — goûte avant d’acheter, c’est la règle', meta: 'Eminönü · entrée libre', fond: '#2E1A08',
    photos: ['Spice Bazaar, Istanbul, Turkey (37176373095).jpg', 'Egyptian Bazaar Spices.jpg'] },
  { cat: 'monument', et: 'et-type', ete: 'INCONTOURNABLE', nom: 'La Citerne Basilique', ia: 'Un palais sous la ville, 336 colonnes dans la pénombre — magique et frais', meta: 'Sultanahmet · mieux le matin', fond: '#2E1F3E',
    photos: ['Basilica Cistern after restoration 2022 (2).jpg', 'Istanbul - Bazilika Sarnıcı.jpg'] },
  { cat: 'monument', et: 'et-type', ete: 'INCONTOURNABLE', nom: 'Le Palais de Topkapı', ia: 'Quatre siècles de sultans — vise l’ouverture, le harem d’abord', meta: 'Sultanahmet · fermé mardi', fond: '#1E2B1A',
    photos: ['Topkapi Palace Istanbul 2013.jpg', 'Gate of Salutation Topkapi Istanbul 2007.JPG'] },
  { cat: 'experience', et: 'et-type', ete: 'EXPÉRIENCE', nom: 'Le Bosphore au coucher', ia: 'Deux continents en 2 h — vise le départ de 17 h, lumière d’or garantie', meta: 'Eminönü · en famille', fond: '#2C1A3E',
    photos: ['Bosphorus sunset from Üsküdar.jpg', 'Istanbul Bosphorus Sunset (232066769).jpeg'] },
  { cat: 'monument', et: 'et-type', ete: 'POINT DE VUE', nom: 'La Tour de Galata', ia: 'Istanbul à 360° — monte 30 min avant le coucher, redescends de nuit', meta: 'Galata · file plus courte le matin', fond: '#231A2E',
    photos: ['Galata Tower 2020.jpg', 'Galata Tower in Istanbul.jpg'] },
  { cat: 'monument', et: 'et-type', ete: 'LIEU CULTE', nom: 'Mosquée Ortaköy', ia: 'Posée sur l’eau, le pont en toile de fond — le cliché le plus célèbre de la ville', meta: 'Ortaköy · gratuit', fond: '#0E2A3F',
    photos: ['Ortaköy Mosque and Bosphorus Bridge.jpg', 'Ortakoy Mosque Istanbul.jpg'] },
  { cat: 'table', et: 'et-halal', ete: '✓ HALAL VÉRIFIÉ', nom: 'Hamdi Restaurant', ia: 'LE kebab d’agneau d’Istanbul — demande la terrasse, Bosphore en contrebas', meta: 'Turc · Eminönü', fond: '#3A1F0E',
    photos: ['Eminönü, Istanbul, Turkey - panoramio (36).jpg'] },
  { cat: 'table', et: 'et-halal', ete: '✓ HALAL VÉRIFIÉ', nom: 'Sultanahmet Köftecisi', ia: 'Les köfte d’Istanbul depuis 1920 — la file avance vite, prends l’ayran', meta: 'Turc · Sultanahmet', fond: '#5C2E12',
    photos: ['Sultanahmet Köftecisi.jpg'] },
  { cat: 'table', et: 'et-halal', ete: '✓ HALAL', nom: 'Hafız Mustafa 1864', ia: 'Çay et baklava à la pistache — l’étage, fenêtre sur la rue, en fin d’après-midi', meta: 'Salon de thé · Sirkeci', fond: '#1E2B1A',
    photos: ['Hafız Mustafa 1864, Istanbul.jpg', 'Baklava - Turkish special dessert (2).jpg'] },
  { cat: 'hotel', et: 'et-halal', ete: 'SANS ALCOOL', nom: 'Hôtel remarquable (exemple de format)', ia: 'Dormir à 100 m de Sainte-Sophie, hammam privé, petit-déj halal', meta: 'Sultanahmet · dès — € / nuit', fond: '#231A2E',
    photos: ['Sultanahmet district, Istanbul.jpg'] },
]

const maquette = readFileSync('maquette-immersion.html', 'utf8')
const tete = maquette.slice(0, maquette.indexOf('</style>'))
const script = maquette.slice(maquette.indexOf('<script>'), maquette.indexOf('</body>'))

const panneau = (p, i) => `
<section class="panneau" data-cat="${p.cat}">
  <div class="scene" style="background:linear-gradient(180deg,${p.fond},#060E08)"></div>
  <img class="photo" src="${wm(p.photos[0])}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}"${p.photos[1] ? ` data-secours="${wm(p.photos[1])}"` : ''}>
  <span class="note-photo" id="badge${i}">Photo : Wikimedia Commons</span>
  <div class="contenu">
    <span class="etiquette ${p.et}">${p.ete}</span>
    <h2>${p.nom}</h2>
    <p class="ia">${p.ia}</p>
    <p class="meta">${p.meta} · ★ —, prix — <em style="opacity:.6">(format)</em></p>
    <div class="actions"><button class="b-or">📍 Y aller</button><button class="b-verre" onclick="garder(this)">♡</button></div>
  </div>
</section>`

// Photos empilées : la 1re qui charge gagne ; si TOUTES échouent, le
// dégradé de secours reste et le badge le dit.
const CSS_PHOTO = `
.photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;}
.panneau::after{z-index:2;}
.note-photo{z-index:3;}
.contenu{z-index:4 !important;}
.demo{left:auto;right:14px;}
`

const verdict = maquette.slice(maquette.indexOf('<!-- ===== FIXE EN PREMIER'), maquette.indexOf('<!-- ===== POOL'))
const fin = maquette.slice(maquette.indexOf('<!-- ===== FIXE EN DERNIER'), maquette.indexOf('</div>\n\n<!-- ===== FEUILLE'))
const feuille = maquette.slice(maquette.indexOf('<!-- ===== FEUILLE'), maquette.indexOf('<script>'))

const page = `${tete}${CSS_PHOTO}</style>
</head>
<body>
<div class="demo">MAQUETTE · PRÉVISUALISATION — textes = format, photos réelles Wikimedia</div>
<button class="pratique" onclick="document.getElementById('vp').classList.add('on')">☰ Pratique</button>
<div class="fil-prog" id="fil"></div>
<div class="flux" id="flux">
${verdict}
${POOL.map(panneau).join('\n')}
${fin}
</div>
${feuille}
<script>
// Photo en échec → 2e candidate si elle existe, sinon dégradé de secours
// de la maquette + badge franc (jamais un écran noir).
document.querySelectorAll('.photo').forEach((im) => {
  im.addEventListener('error', () => {
    if (im.dataset.secours) { im.src = im.dataset.secours; delete im.dataset.secours; return }
    const badge = im.parentElement.querySelector('.note-photo')
    if (badge) badge.textContent = 'Photo indisponible — à me signaler'
    im.remove()
  })
})
</${'script'}>
${script}</body>
</html>`

writeFileSync('public/preview-immersion.html', page)
console.log(`public/preview-immersion.html écrit — ${POOL.length} panneaux de pool + verdict + final`)
