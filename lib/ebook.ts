/* eslint-disable @typescript-eslint/no-explicit-any */
// Ebook PDF par ville, façon guide de voyage (Lonely Planet) — généré depuis les données.

const NUIT: [number, number, number] = [11, 26, 15]
const FORET: [number, number, number] = [27, 67, 50]
const OR: [number, number, number] = [201, 168, 76]
const GRIS: [number, number, number] = [70, 70, 70]
const GRIS_CLAIR: [number, number, number] = [130, 130, 130]

// Supprime emojis et tout caractère hors Latin-1 (cause du « charabia » dans jsPDF).
const clean = (s: any): string => String(s ?? '').replace(/[^\x00-\xFF]/g, '').replace(/\s+/g, ' ').trim()

const PROFILS = [
  { titre: 'En famille', jours: '3 jours', intro: 'Rythme doux, sites accessibles et activités adaptées aux enfants.', kw: ['plage', 'parc', 'marche', 'souk', 'jardin', 'detente', 'famille', 'nature', 'musee', 'culture', 'loisir', 'piscine', 'lac'] },
  { titre: 'Entre amis', jours: '2 jours', intro: 'Aventure, nature et expériences à sensations.', kw: ['sport', 'rando', 'kayak', 'jet', 'surf', 'aventure', 'vtt', 'velo', 'plong', 'golf', 'montagne', 'dune', 'bivouac', 'desert'] },
  { titre: 'En solo', jours: '2-3 jours', intro: 'Immersion spirituelle, culturelle et historique, à ton rythme.', kw: ['spirituel', 'histoire', 'culture', 'musee', 'mosquee', 'medina', 'monument', 'patrimoine', 'sanctuaire'] },
]

function normalize(s: string) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') }
function pickActs(activites: any[], kw: string[]): any[] {
  const m = activites.filter((a) => { const t = normalize(`${a.nom} ${a.categorie}`); return kw.some((k) => t.includes(k)) })
  return (m.length ? m : activites).slice(0, 5)
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    if (!url) return res(null)
    const img = new Image(); img.crossOrigin = 'anonymous'
    img.onload = () => res(img); img.onerror = () => res(null)
    img.src = url
  })
}

export async function generateEbook(ville: any, brand = 'VoyagesHalal.fr', siteUrl = 'https://www.voyageshalal.fr') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 50
  let y = M
  let page = 0

  const nom = clean(ville.nom) || 'Destination'
  const pays = clean(ville.pays)
  const halal = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const host = siteUrl.replace('https://', '')

  // ---------- COUVERTURE ----------
  doc.setFillColor(...NUIT); doc.rect(0, 0, W, H, 'F')
  const cover = await loadImage(ville.image || ville.image_hero || '')
  if (cover) {
    try {
      doc.addImage(cover, 'JPEG', 0, 0, W, 360)
      doc.setFillColor(11, 26, 15); doc.setGState(new (doc as any).GState({ opacity: 0.45 })); doc.rect(0, 0, W, 360, 'F'); doc.setGState(new (doc as any).GState({ opacity: 1 }))
    } catch { /* image indisponible */ }
  }
  doc.setFillColor(...OR); doc.rect(0, 360, W, 5, 'F')
  doc.setTextColor(...OR); doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
  doc.text(brand.toUpperCase(), M, 320)
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.text('GUIDE DE VOYAGE HALAL', M, 420)
  doc.setFont('times', 'bold'); doc.setFontSize(54); doc.text(nom, M, 470)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(17); doc.setTextColor(220, 210, 180)
  doc.text(`${pays}  |  Edition 2026`, M, 505)
  if (halal != null) {
    doc.setFillColor(...OR); doc.roundedRect(M, 535, 200, 40, 20, 20, 'F')
    doc.setTextColor(...NUIT); doc.setFont('helvetica', 'bold'); doc.setFontSize(16)
    doc.text(`Halal Score : ${halal}/10`, M + 18, 561)
  }
  doc.setTextColor(180, 180, 170); doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('Restaurants halal - Mosquees - Horaires de priere - Itineraires', M, H - 80)
  doc.setTextColor(...OR); doc.setFontSize(12); doc.text(host, M, H - 56)

  // ---------- helpers ----------
  const footer = () => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRIS_CLAIR)
    doc.text(`${brand}  -  Guide Halal ${nom} 2026`, M, H - 26)
    doc.text(String(page), W - M, H - 26, { align: 'right' })
  }
  const newPage = () => { doc.addPage(); page++; y = M; footer() }
  const need = (h: number) => { if (y + h > H - 50) newPage() }
  const section = (num: string, titre: string) => {
    need(56)
    doc.setFillColor(...FORET); doc.roundedRect(M, y, W - 2 * M, 34, 5, 5, 'F')
    doc.setTextColor(...OR); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text(num, M + 12, y + 23)
    doc.setTextColor(255, 255, 255); doc.text(clean(titre), M + 44, y + 23)
    y += 50
  }
  const para = (txt: string, size = 10.5, color: [number, number, number] = GRIS) => {
    const t = clean(txt); if (!t) return
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color)
    for (const ln of doc.splitTextToSize(t, W - 2 * M)) { need(size + 4); doc.text(ln, M, y); y += size + 4 }
    y += 4
  }
  const entry = (titre: string, meta?: string, desc?: string) => {
    need(30)
    doc.setFillColor(...OR); doc.rect(M, y - 8, 3, 14, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(20, 20, 20)
    doc.text(clean(titre), M + 12, y); y += 14
    if (meta) { doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...FORET); doc.text(clean(meta), M + 12, y); y += 12 }
    if (desc) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...GRIS)
      for (const ln of doc.splitTextToSize(clean(desc), W - 2 * M - 12)) { need(12); doc.text(ln, M + 12, y); y += 12 } }
    y += 8
  }

  // ---------- SOMMAIRE ----------
  newPage()
  section('', 'Sommaire')
  const restos = (ville.restaurants ?? []); const hotels = (ville.hotels ?? []); const activites = (ville.activites ?? [])
  const toc = [
    ['01', 'Bienvenue a ' + nom],
    ['02', 'Informations pratiques'],
    ['03', 'Foi & spiritualite'],
    restos.length ? ['04', `Ou manger (${restos.length} adresses halal)`] : null,
    hotels.length ? ['05', `Ou dormir (${hotels.length} hebergements)`] : null,
    activites.length ? ['06', `A voir & a faire (${activites.length})`] : null,
    activites.length ? ['07', 'Itineraires : famille, amis, solo'] : null,
  ].filter(Boolean) as string[][]
  doc.setFontSize(12)
  for (const [n, t] of toc) { need(22); doc.setFont('helvetica', 'bold'); doc.setTextColor(...OR); doc.text(n, M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(40, 40, 40); doc.text(clean(t), M + 36, y); y += 22 }

  // ---------- 01 BIENVENUE ----------
  newPage()
  section('01', 'Bienvenue a ' + nom)
  const desc = typeof ville.description === 'string' ? ville.description : (ville.description?.long ?? ville.description?.court ?? '')
  para(desc, 11)
  if (halal != null) { y += 4; para(`Halal Trust Score : ${halal}/10 - destination evaluee sur la disponibilite du halal, les mosquees et l'experience du voyageur musulman.`, 10, FORET) }

  // ---------- 02 INFOS PRATIQUES ----------
  section('02', 'Informations pratiques')
  const ip = ville.infoPratique ?? {}
  const infos: [string, any][] = [
    ['Pays', pays], ['Monnaie', ip.monnaie || ville.monnaie], ['Langue', ip.langue || ville.langue],
    ['Meilleure periode', ip.meilleureEpoque || ville.meilleureEpoque], ['Transport', ip.transport || ville.transport],
    ['Budget indicatif', ip.budget], ['A ne pas manquer', ip.incontournable],
  ]
  for (const [k, v] of infos) { const val = clean(v); if (val) entry(k, undefined, val) }

  // ---------- 03 FOI & SPIRITUALITE ----------
  section('03', 'Foi & spiritualite')
  const mosq = ville.mosqueesPrincipales ?? []
  para(`Horaires de priere en temps reel (Fajr, Dhuhr, Asr, Maghrib, Isha) et boussole Qibla disponibles sur ${host}.`, 10.5)
  if (mosq.length) { y += 2; doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...FORET); need(16); doc.text('Mosquees principales :', M, y); y += 16
    for (const m of mosq.slice(0, 6)) entry(m.nom, clean(m.adresse), m.description) }

  // ---------- 04 OU MANGER ----------
  if (restos.length) {
    section('04', 'Ou manger - halal certifie')
    for (const r of restos.slice(0, 16)) entry(`${clean(r.nom)}   ${r.score ?? r.note ? '(' + (r.score ?? r.note) + '/5)' : ''}`, [clean(r.type), clean(r.priceRange ?? r.fourchette_prix), clean(r.adresse)].filter(Boolean).join('  -  '), r.specialite)
  }

  // ---------- 05 OU DORMIR ----------
  if (hotels.length) {
    section('05', 'Ou dormir - halal-friendly')
    for (const h of hotels.slice(0, 10)) entry(`${clean(h.nom)}   ${h.score ?? h.note ? '(' + (h.score ?? h.note) + '/5)' : ''}`, [clean(h.categorie), clean(h.priceRange), (h.sansAlcool ? 'Sans alcool' : '')].filter(Boolean).join('  -  '), h.description)
  }

  // ---------- 06 A VOIR ----------
  if (activites.length) {
    section('06', 'A voir & a faire')
    for (const a of activites) entry(`${clean(a.nom)}   ${clean(a.prix) ? '[' + clean(a.prix) + ']' : ''}`, clean(a.categorie), a.description)
  }

  // ---------- 07 ITINERAIRES ----------
  if (activites.length) {
    section('07', 'Itineraires sur mesure')
    for (const p of PROFILS) {
      need(50)
      doc.setFont('times', 'bold'); doc.setFontSize(16); doc.setTextColor(...FORET)
      doc.text(`${p.titre}  -  ${p.jours}`, M, y); y += 16
      doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...GRIS_CLAIR)
      doc.text(clean(p.intro), M, y); y += 16
      let day = 1
      const acts = pickActs(activites, p.kw)
      for (const a of acts) { entry(`Jour ${day}  -  ${clean(a.nom)}`, undefined, a.description?.slice(0, 130)); day = Math.min(day + 1, Number(p.jours[0]) || 3) }
      y += 10
    }
  }

  // ---------- CTA ----------
  need(120); y = Math.max(y, H - 150)
  doc.setFillColor(...NUIT); doc.roundedRect(M, y, W - 2 * M, 92, 10, 10, 'F')
  doc.setTextColor(...OR); doc.setFont('times', 'bold'); doc.setFontSize(16)
  doc.text(`Vis ton voyage halal a ${nom}`, W / 2, y + 34, { align: 'center' })
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('Horaires de priere en direct - Mosquee la plus proche - Boussole Qibla', W / 2, y + 56, { align: 'center' })
  doc.setTextColor(...OR); doc.setFontSize(12.5)
  doc.text(host + '/destinations/' + clean(ville.slug), W / 2, y + 78, { align: 'center' })

  doc.save(`Guide-Halal-${nom.replace(/[^a-z0-9]/gi, '-')}-2026.pdf`)
}
