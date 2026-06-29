/* eslint-disable @typescript-eslint/no-explicit-any */
// Ebook PDF premium par ville — guide de voyage halal haut de gamme, genere depuis les donnees.

const NUIT: [number, number, number] = [11, 26, 15]
const FORET: [number, number, number] = [27, 67, 50]
const OR: [number, number, number] = [201, 168, 76]
const CREME: [number, number, number] = [250, 246, 237]
const TXT: [number, number, number] = [40, 40, 40]
const MUTE: [number, number, number] = [125, 125, 125]

const clean = (s: any): string => String(s ?? '').replace(/[^\x00-\xFF]/g, '').replace(/\s+/g, ' ').trim()
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const PROFILS = [
  { titre: 'En famille', jours: 3, intro: 'Rythme doux, sites accessibles et activites adaptees aux enfants.', kw: ['plage', 'parc', 'marche', 'souk', 'jardin', 'detente', 'famille', 'nature', 'musee', 'culture', 'loisir', 'piscine', 'lac'] },
  { titre: 'Entre amis', jours: 2, intro: 'Aventure, nature et experiences a sensations.', kw: ['sport', 'rando', 'kayak', 'jet', 'surf', 'aventure', 'vtt', 'velo', 'plong', 'golf', 'montagne', 'dune', 'bivouac', 'desert'] },
  { titre: 'En solo', jours: 3, intro: 'Immersion spirituelle, culturelle et historique, a ton rythme.', kw: ['spirituel', 'histoire', 'culture', 'musee', 'mosquee', 'medina', 'monument', 'patrimoine', 'sanctuaire'] },
]
const HALAL_TIPS: [string, string][] = [
  ['Trouver du halal', 'Au Maghreb, en Turquie, dans le Golfe et en Asie du Sud-Est musulmane, la quasi-totalite de la viande est halal par defaut. Ailleurs, reperez la mention "Halal", les restaurants tenus par des musulmans, ou demandez simplement : la communaute oriente toujours avec bienveillance.'],
  ['Horaires de priere', 'Telechargez les horaires du jour avant de sortir. Les mosquees, mais aussi de nombreux centres commerciaux et aeroports, disposent de salles de priere. Notre application affiche la mosquee la plus proche et la direction de la Qibla en temps reel.'],
  ['Voyager pendant le Ramadan', 'Atmosphere unique : journees calmes, soirees animees apres la rupture du jeune. Prevoyez vos visites le matin, et reservez pour le ftour (rupture) dans les bonnes adresses, souvent completes.'],
  ['Tenue et pudeur', 'Une tenue modeste est appreciee, surtout pour visiter les mosquees : epaules et genoux couverts, foulard pour les femmes a l entree des lieux de culte. Emportez une echarpe legere, toujours utile.'],
  ['Etiquette en mosquee', 'Retirez vos chaussures, evitez les heures de priere pour les visites touristiques, parlez a voix basse. Certaines mosquees sont fermees aux non-musulmans : respectez la signaletique.'],
]
const DOS = ['Saluer par "As-salamu alaykum" ouvre les portes', 'Gouter la street food halal locale, souvent la meilleure', 'Negocier avec le sourire dans les souks', 'Boire de l eau en bouteille en cas de doute']
const DONTS = ['Photographier les gens sans demander', 'Visiter une mosquee pendant la priere', 'Sous-estimer la chaleur en ete (Golfe, Sahara)', 'Oublier de reserver le ftour en Ramadan']

function pickActs(activites: any[], kw: string[], n: number): any[] {
  const m = activites.filter((a) => { const t = norm(`${a.nom} ${a.categorie}`); return kw.some((k) => t.includes(k)) })
  return (m.length ? m : activites).slice(0, n)
}

export async function generateEbook(ville: any, brand = 'VoyagesHalal.fr', siteUrl = 'https://www.voyageshalal.fr') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight()
  const M = 56
  let y = M, page = 0

  const nom = clean(ville.nom) || 'Destination'
  const pays = clean(ville.pays)
  const halal = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const note5 = ville.score_halal ?? (halal ? halal / 2 : 0)
  const host = siteUrl.replace('https://', '')
  const restos = ville.restaurants ?? [], hotels = ville.hotels ?? [], activites = ville.activites ?? [], mosq = ville.mosqueesPrincipales ?? []

  const setG = (o: number) => { try { doc.setGState(new (doc as any).GState({ opacity: o })) } catch {} }
  const caps = (t: string, x: number, yy: number, size: number, c: [number, number, number], align: 'left' | 'center' | 'right' = 'left', cs = 2.2) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(...c); doc.text(clean(t).toUpperCase(), x, yy, { align, charSpace: cs } as any)
  }
  const motif = (cx: number, cy: number, r: number, wdt = 0.8) => {
    doc.setDrawColor(...OR); doc.setLineWidth(wdt)
    for (const off of [0, Math.PI / 4]) {
      const p = [0, 1, 2, 3].map((i) => { const a = off + i * Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] })
      doc.lines([[p[1][0] - p[0][0], p[1][1] - p[0][1]], [p[2][0] - p[1][0], p[2][1] - p[1][1]], [p[3][0] - p[2][0], p[3][1] - p[2][1]], [p[0][0] - p[3][0], p[0][1] - p[3][1]]], p[0][0], p[0][1])
    }
    doc.circle(cx, cy, r * 0.42)
  }
  const star = (cx: number, cy: number, r: number, fill: boolean) => {
    const pts: number[][] = []
    for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.42 : r; const a = -Math.PI / 2 + i * Math.PI / 5; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]) }
    const segs = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]); segs.push([pts[0][0] - pts[9][0], pts[0][1] - pts[9][1]])
    doc.setFillColor(...OR); doc.setDrawColor(...OR); doc.setLineWidth(0.4)
    doc.lines(segs, pts[0][0], pts[0][1], [1, 1], fill ? 'F' : 'S', true)
  }
  const rating = (x: number, yy: number, val: number) => { const v = Math.round(val); for (let i = 0; i < 5; i++) star(x + i * 13, yy, 5, i < v) }

  // ============ COUVERTURE ============
  doc.setFillColor(...NUIT); doc.rect(0, 0, W, H, 'F')
  setG(0.16); motif(W / 2, 210, 130, 1); motif(W / 2, 210, 84, 0.6); setG(1)
  doc.setDrawColor(...OR); doc.setLineWidth(1.4); doc.line(M, 372, W - M, 372); doc.setLineWidth(0.5); doc.line(M, 378, W - M, 378)
  caps(brand, W / 2, 420, 11, OR, 'center')
  caps('Le guide de voyage halal', W / 2, 452, 11, [210, 200, 175], 'center')
  doc.setFont('times', 'bold'); doc.setFontSize(60); doc.setTextColor(255, 255, 255); doc.text(nom, W / 2, 516, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(15); doc.setTextColor(200, 192, 168); doc.text(`${pays}   .   Edition 2026`, W / 2, 548, { align: 'center' })
  if (halal != null) { doc.setDrawColor(...OR); doc.setLineWidth(1); doc.roundedRect(W / 2 - 98, 578, 196, 38, 19, 19, 'S'); caps(`Halal Score  ${halal} / 10`, W / 2, 602, 11, OR, 'center') }
  doc.setLineWidth(0.5); doc.line(M, H - 108, W - M, H - 108)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(170, 165, 150); doc.text('Restaurants halal   .   Mosquees   .   Horaires de priere   .   Itineraires', W / 2, H - 84, { align: 'center' })
  caps(host, W / 2, H - 60, 10, OR, 'center')

  // ============ furniture ============
  const head = () => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTE)
    doc.text(`GUIDE HALAL ${nom.toUpperCase()}`, M, 40, { charSpace: 1.4 } as any); doc.text('EDITION 2026', W - M, 40, { align: 'right', charSpace: 1.4 } as any)
    doc.setDrawColor(...OR); doc.setLineWidth(0.5); doc.line(M, 48, W - M, 48)
    doc.setFontSize(8); doc.setTextColor(...MUTE); doc.text(`${brand}  .  ${host}`, M, H - 30); doc.text(String(page), W - M, H - 30, { align: 'right' })
  }
  const np = () => { doc.addPage(); page++; y = 78; head() }
  const need = (h: number) => { if (y + h > H - 56) np() }
  const section = (num: string, titre: string) => {
    need(72); doc.setFont('times', 'bold'); doc.setFontSize(42); doc.setTextColor(233, 227, 212); doc.text(num, M, y + 8)
    doc.setFont('times', 'bold'); doc.setFontSize(22); doc.setTextColor(...FORET); doc.text(clean(titre), M + 60, y)
    doc.setDrawColor(...OR); doc.setLineWidth(1.2); doc.line(M + 60, y + 11, W - M, y + 11); y += 44
  }
  const para = (txt: string, size = 10.5, c = TXT, lead = 5) => {
    const t = clean(txt); if (!t) return
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...c)
    for (const ln of doc.splitTextToSize(t, W - 2 * M)) { need(size + lead); doc.text(ln, M, y); y += size + lead }
    y += 5
  }
  const fiche = (titre: string, meta?: string, desc?: string, note?: number) => {
    const lines = desc ? doc.splitTextToSize(clean(desc), W - 2 * M - 24) : []
    const h = 18 + (meta ? 12 : 0) + (note ? 10 : 0) + lines.length * 11.5 + 14
    need(h)
    doc.setFillColor(...CREME); doc.roundedRect(M, y - 12, W - 2 * M, h, 4, 4, 'F'); doc.setFillColor(...OR); doc.rect(M, y - 12, 3, h, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(18, 18, 18); doc.text(clean(titre), M + 14, y)
    if (note && note > 0) rating(W - M - 78, y - 3, note)
    y += 14
    if (meta) { doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...FORET); doc.text(clean(meta).toUpperCase(), M + 14, y, { charSpace: 0.6 } as any); y += 12 }
    if (lines.length) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...TXT); for (const ln of lines) { doc.text(ln, M + 14, y); y += 11.5 } }
    y += 16
  }
  const callout = (titre: string, txt: string) => {
    const lines = doc.splitTextToSize(clean(txt), W - 2 * M - 28); const h = 30 + lines.length * 12
    need(h); doc.setFillColor(238, 232, 216); doc.roundedRect(M, y - 12, W - 2 * M, h, 5, 5, 'F')
    doc.setFillColor(...OR); doc.circle(M + 16, y + 1, 7, 'F'); doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(...NUIT); doc.text('i', M + 14, y + 5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...FORET); doc.text(clean(titre).toUpperCase(), M + 30, y + 4, { charSpace: 0.8 } as any); y += 22
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9.7); doc.setTextColor(...TXT); for (const ln of lines) { doc.text(ln, M + 30, y); y += 12 } y += 16
  }

  // ============ PAGE : COMMENT UTILISER ============
  np(); section('', 'Comment utiliser ce guide')
  para(`Ce guide reunit l essentiel pour vivre ${nom} en voyageur musulman serein : ou manger halal, ou prier, ou dormir, que voir, et trois itineraires prets a suivre. Toutes les adresses sont selectionnees selon notre Halal Trust Score.`, 11)
  para('Astuce : gardez ce PDF hors-ligne sur votre telephone. Pour les horaires de priere en direct, la mosquee la plus proche et la boussole Qibla, ouvrez notre application a tout moment.', 10, MUTE)
  callout('Le Halal Trust Score', `Note unique de 0 a 10 evaluant chaque destination sur la disponibilite du halal, la presence de mosquees et l experience globale du voyageur musulman. ${nom} : ${halal ?? '-'} / 10.`)

  // ============ SOMMAIRE ============
  np(); section('', 'Sommaire')
  const toc = [['01', 'Bienvenue a ' + nom], ['02', 'En un coup d oeil'], ['03', 'Informations pratiques'], ['04', 'Voyager halal a ' + nom], ['05', 'Foi & spiritualite'],
    restos.length ? ['06', `Ou manger  (${restos.length} adresses)`] : null, hotels.length ? ['07', `Ou dormir  (${hotels.length})`] : null,
    activites.length ? ['08', `A voir & a faire  (${activites.length})`] : null, activites.length ? ['09', 'Itineraires sur mesure'] : null].filter(Boolean) as string[][]
  for (const [n, t] of toc) { need(28); doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...OR); doc.text(n, M, y); doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(...TXT); doc.text(clean(t), M + 42, y); doc.setDrawColor(226, 221, 209); doc.setLineWidth(0.4); doc.line(M, y + 9, W - M, y + 9); y += 28 }

  // ============ 01 BIENVENUE (lettrine) ============
  np(); section('01', 'Bienvenue a ' + nom)
  const desc = clean(typeof ville.description === 'string' ? ville.description : (ville.description?.long ?? ville.description?.court ?? ''))
  if (desc) {
    const initial = desc[0]; const rest = desc.slice(1)
    doc.setFont('times', 'bold'); doc.setFontSize(46); doc.setTextColor(...OR); doc.text(initial, M, y + 30)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...TXT)
    const indent = 40, all = doc.splitTextToSize(rest, W - 2 * M - indent), full = doc.splitTextToSize(rest, W - 2 * M)
    let li = 0
    for (; li < 3 && li < all.length; li++) { need(16); doc.text(all[li], M + indent, y + li * 16); }
    y += Math.min(3, all.length) * 16 + 4
    // reprise pleine largeur a partir du texte restant
    const consumed = all.slice(0, li).join(' ').length
    const remaining = rest.slice(consumed)
    for (const ln of doc.splitTextToSize(clean(remaining), W - 2 * M)) { need(15); doc.text(ln, M, y); y += 15 }
    y += 6
    void full
  }

  // ============ 02 EN UN COUP D OEIL (bandeau stats) ============
  section('02', 'En un coup d oeil')
  const stats: [string, string][] = [[String(restos.length || '-'), 'Restaurants'], [String(hotels.length || '-'), 'Hebergements'], [String(ville.statistiques?.mosquees ?? mosq.length ?? '-'), 'Mosquees'], [String(halal ?? '-') + '/10', 'Halal Score']]
  const bw = (W - 2 * M - 3 * 12) / 4
  need(80)
  stats.forEach((s, i) => { const x = M + i * (bw + 12); doc.setFillColor(...NUIT); doc.roundedRect(x, y, bw, 64, 6, 6, 'F'); doc.setFont('times', 'bold'); doc.setFontSize(22); doc.setTextColor(...OR); doc.text(s[0], x + bw / 2, y + 30, { align: 'center' }); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(220, 215, 200); doc.text(s[1].toUpperCase(), x + bw / 2, y + 48, { align: 'center', charSpace: 0.8 } as any) })
  y += 84

  // ============ 03 INFOS PRATIQUES ============
  section('03', 'Informations pratiques')
  const ip = ville.infoPratique ?? {}
  const facts: [string, any][] = [['Pays', pays], ['Monnaie', ip.monnaie || ville.monnaie], ['Langue', ip.langue || ville.langue], ['Meilleure periode', ip.meilleureEpoque || ville.meilleureEpoque], ['Transport', ip.transport || ville.transport], ['Budget', ip.budget], ['A ne pas manquer', ip.incontournable]]
  for (const [k, v] of facts) { const val = clean(v); if (!val) continue; const lines = doc.splitTextToSize(val, W - 2 * M - 132); const h = Math.max(20, lines.length * 12 + 8); need(h); doc.setFillColor(...CREME); doc.roundedRect(M, y - 12, W - 2 * M, h, 3, 3, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...OR); doc.text(k.toUpperCase(), M + 12, y, { charSpace: 0.6 } as any); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...TXT); let yy = y; for (const ln of lines) { doc.text(ln, M + 132, yy); yy += 12 } y += h + 6 }

  // ============ 04 VOYAGER HALAL (editorial) ============
  section('04', 'Voyager halal a ' + nom)
  para('Nos conseils pour un sejour serein, respectueux et 100% halal.', 10.5, MUTE)
  for (const [t, d] of HALAL_TIPS) callout(t, d)
  // Do / Don't
  need(140)
  const colw = (W - 2 * M - 16) / 2
  doc.setFillColor(232, 242, 234); doc.roundedRect(M, y, colw, 124, 6, 6, 'F'); doc.setFillColor(248, 236, 236); doc.roundedRect(M + colw + 16, y, colw, 124, 6, 6, 'F')
  caps('A faire', M + 14, y + 22, 11, FORET); caps('A eviter', M + colw + 30, y + 22, 11, [160, 60, 60])
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(...TXT)
  DOS.forEach((s, i) => { doc.setFillColor(...FORET); doc.circle(M + 16, y + 38 + i * 18 - 3, 1.6, 'F'); for (const ln of doc.splitTextToSize(clean(s), colw - 30)) { doc.text(ln, M + 24, y + 38 + i * 18); } })
  DONTS.forEach((s, i) => { doc.setFillColor(160, 60, 60); doc.circle(M + colw + 32, y + 38 + i * 18 - 3, 1.6, 'F'); for (const ln of doc.splitTextToSize(clean(s), colw - 30)) { doc.text(ln, M + colw + 40, y + 38 + i * 18); } })
  y += 140

  // ============ 05 FOI ============
  section('05', 'Foi & spiritualite')
  para(`Horaires de priere en temps reel (Fajr, Dhuhr, Asr, Maghrib, Isha) et boussole Qibla sur ${host}. La mosquee la plus proche se trouve en un clic dans l application.`, 10.5)
  for (const m of mosq.slice(0, 6)) fiche(m.nom, clean(m.adresse), m.description)

  // ============ 06/07/08 ============
  if (restos.length) { section('06', 'Ou manger - halal certifie'); for (const r of restos.slice(0, 18)) fiche(clean(r.nom), [clean(r.type), clean(r.priceRange ?? r.fourchette_prix), clean(r.adresse)].filter(Boolean).join('  .  '), r.specialite, r.score ?? r.note) }
  if (hotels.length) { section('07', 'Ou dormir - halal-friendly'); for (const h of hotels.slice(0, 12)) fiche(clean(h.nom), [clean(h.categorie), clean(h.priceRange), (h.sansAlcool ? 'Sans alcool' : '')].filter(Boolean).join('  .  '), h.description, h.score ?? h.note) }
  if (activites.length) { section('08', 'A voir & a faire'); for (const a of activites) fiche(`${clean(a.nom)}   ${clean(a.prix) ? '[' + clean(a.prix) + ']' : ''}`, clean(a.categorie), a.description) }

  // ============ 09 ITINERAIRES ============
  if (activites.length) {
    section('09', 'Itineraires sur mesure')
    for (const p of PROFILS) {
      need(64); doc.setFont('times', 'bold'); doc.setFontSize(17); doc.setTextColor(...FORET); doc.text(p.titre, M, y); caps(`${p.jours} jours`, W - M, y, 9, OR, 'right', 1); y += 15
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9.5); doc.setTextColor(...MUTE); doc.text(clean(p.intro), M, y); y += 18
      pickActs(activites, p.kw, p.jours + 2).forEach((a, i) => fiche(`Jour ${Math.min(i + 1, p.jours)}   .   ${clean(a.nom)}`, undefined, a.description?.slice(0, 150)))
      y += 8
    }
  }
  void note5

  // ============ 4e DE COUVERTURE ============
  doc.addPage(); page++
  doc.setFillColor(...NUIT); doc.rect(0, 0, W, H, 'F')
  setG(0.14); motif(W / 2, H / 2 - 40, 150, 1); setG(1)
  doc.setDrawColor(...OR); doc.setLineWidth(1); doc.line(M, 150, W - M, 150)
  doc.setFont('times', 'bold'); doc.setFontSize(30); doc.setTextColor(255, 255, 255); doc.text('L Islam guide', W / 2, 220, { align: 'center' }); doc.setTextColor(...OR); doc.text('votre voyage', W / 2, 256, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(210, 205, 190)
  doc.text('Horaires de priere en direct  .  Mosquee la plus proche', W / 2, 320, { align: 'center' })
  doc.text('Boussole Qibla  .  ' + (restos.length ? restos.length + ' restaurants halal a ' + nom : 'guides halal du monde entier'), W / 2, 340, { align: 'center' })
  caps('Continuez sur', W / 2, 420, 10, [180, 175, 160], 'center')
  doc.setFont('times', 'bold'); doc.setFontSize(18); doc.setTextColor(...OR); doc.text(host + '/destinations/' + clean(ville.slug), W / 2, 448, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(140, 135, 122)
  doc.text(`(c) ${new Date().getFullYear()} ${brand} - Guide gratuit. Informations fournies a titre indicatif, verifiez localement le statut halal.`, W / 2, H - 70, { align: 'center' })

  doc.save(`Guide-Halal-${nom.replace(/[^a-z0-9]/gi, '-')}-2026.pdf`)
}
