/* eslint-disable @typescript-eslint/no-explicit-any */
// Ebook PDF par ville — design soigné « magazine de voyage », généré depuis les données.

const NUIT: [number, number, number] = [11, 26, 15]
const FORET: [number, number, number] = [27, 67, 50]
const OR: [number, number, number] = [201, 168, 76]
const CREME: [number, number, number] = [253, 250, 243]
const TXT: [number, number, number] = [45, 45, 45]
const MUTE: [number, number, number] = [120, 120, 120]

// Retire emojis / caractères non Latin-1 (cause du charabia jsPDF) et normalise les espaces.
const clean = (s: any): string => String(s ?? '').replace(/[^\x00-\xFF]/g, '').replace(/\s+/g, ' ').trim()
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const PROFILS = [
  { titre: 'En famille', jours: 3, intro: 'Rythme doux, sites accessibles et activites adaptees aux enfants.', kw: ['plage', 'parc', 'marche', 'souk', 'jardin', 'detente', 'famille', 'nature', 'musee', 'culture', 'loisir', 'piscine', 'lac'] },
  { titre: 'Entre amis', jours: 2, intro: 'Aventure, nature et experiences a sensations.', kw: ['sport', 'rando', 'kayak', 'jet', 'surf', 'aventure', 'vtt', 'velo', 'plong', 'golf', 'montagne', 'dune', 'bivouac', 'desert'] },
  { titre: 'En solo', jours: 3, intro: 'Immersion spirituelle, culturelle et historique, a ton rythme.', kw: ['spirituel', 'histoire', 'culture', 'musee', 'mosquee', 'medina', 'monument', 'patrimoine', 'sanctuaire'] },
]
function pickActs(activites: any[], kw: string[], n: number): any[] {
  const m = activites.filter((a) => { const t = norm(`${a.nom} ${a.categorie}`); return kw.some((k) => t.includes(k)) })
  return (m.length ? m : activites).slice(0, n)
}

export async function generateEbook(ville: any, brand = 'VoyagesHalal.fr', siteUrl = 'https://www.voyageshalal.fr') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 56
  let y = M, page = 0

  const nom = clean(ville.nom) || 'Destination'
  const pays = clean(ville.pays)
  const halal = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const host = siteUrl.replace('https://', '')

  // caps espacées (eyebrow élégant)
  const caps = (t: string, x: number, yy: number, size: number, color: [number, number, number], align: 'left' | 'center' = 'left') => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.setTextColor(...color)
    doc.text(clean(t).toUpperCase(), x, yy, { align, charSpace: 2.2 } as any)
  }
  // motif : étoile à 8 branches (2 carrés croisés) en or fin
  const motif = (cx: number, cy: number, r: number, color: [number, number, number], wdt = 0.8) => {
    doc.setDrawColor(...color); doc.setLineWidth(wdt)
    for (const off of [0, Math.PI / 4]) {
      const p = [0, 1, 2, 3].map((i) => { const a = off + i * Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] })
      doc.lines([[p[1][0] - p[0][0], p[1][1] - p[0][1]], [p[2][0] - p[1][0], p[2][1] - p[1][1]], [p[3][0] - p[2][0], p[3][1] - p[2][1]], [p[0][0] - p[3][0], p[0][1] - p[3][1]]], p[0][0], p[0][1])
    }
    doc.circle(cx, cy, r * 0.42)
  }

  // ---------- COUVERTURE (design, sans photo) ----------
  doc.setFillColor(...NUIT); doc.rect(0, 0, W, H, 'F')
  try { doc.setGState(new (doc as any).GState({ opacity: 0.18 })) } catch {}
  motif(W / 2, 200, 120, OR, 1)
  motif(W / 2, 200, 78, OR, 0.6)
  try { doc.setGState(new (doc as any).GState({ opacity: 1 })) } catch {}
  // double filet or
  doc.setDrawColor(...OR); doc.setLineWidth(1.4); doc.line(M, 360, W - M, 360); doc.setLineWidth(0.5); doc.line(M, 366, W - M, 366)
  caps(brand, W / 2, 410, 11, OR, 'center')
  caps('Guide de voyage halal', W / 2, 446, 12, [220, 210, 180], 'center')
  doc.setFont('times', 'bold'); doc.setFontSize(58); doc.setTextColor(255, 255, 255)
  doc.text(nom, W / 2, 510, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(15); doc.setTextColor(200, 192, 168)
  doc.text(`${pays}   .   Edition 2026`, W / 2, 542, { align: 'center' })
  if (halal != null) {
    doc.setDrawColor(...OR); doc.setLineWidth(1); doc.roundedRect(W / 2 - 96, 575, 192, 38, 19, 19, 'S')
    caps(`Halal Score  ${halal} / 10`, W / 2, 599, 11, OR, 'center')
  }
  doc.setLineWidth(0.5); doc.line(M, H - 110, W - M, H - 110)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(170, 165, 150)
  doc.text('Restaurants halal   .   Mosquees   .   Horaires de priere   .   Itineraires', W / 2, H - 86, { align: 'center' })
  caps(host, W / 2, H - 62, 10, OR, 'center')

  // ---------- helpers contenu ----------
  const runningHead = () => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTE)
    doc.text(`GUIDE HALAL ${nom.toUpperCase()}`, M, 40, { charSpace: 1.5 } as any)
    doc.text('2026', W - M, 40, { align: 'right' })
    doc.setDrawColor(...OR); doc.setLineWidth(0.5); doc.line(M, 48, W - M, 48)
    doc.setFontSize(8); doc.setTextColor(...MUTE)
    doc.text(`${brand}  .  ${host}`, M, H - 30)
    doc.text(String(page), W - M, H - 30, { align: 'right' })
  }
  const newPage = () => { doc.addPage(); page++; y = 78; runningHead() }
  const need = (h: number) => { if (y + h > H - 56) newPage() }
  const section = (num: string, titre: string) => {
    need(70)
    doc.setFont('times', 'bold'); doc.setFontSize(40); doc.setTextColor(232, 226, 210)
    doc.text(num, M, y + 6)
    doc.setFont('times', 'bold'); doc.setFontSize(22); doc.setTextColor(...FORET)
    doc.text(clean(titre), M + 56, y)
    doc.setDrawColor(...OR); doc.setLineWidth(1.2); doc.line(M + 56, y + 10, W - M, y + 10)
    y += 40
  }
  const para = (txt: string, size = 10.5, color = TXT) => {
    const t = clean(txt); if (!t) return
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color)
    for (const ln of doc.splitTextToSize(t, W - 2 * M)) { need(size + 5); doc.text(ln, M, y); y += size + 5 }
    y += 5
  }
  // fiche : carte légère avec filet or à gauche
  const fiche = (titre: string, meta?: string, desc?: string) => {
    const lines = desc ? doc.splitTextToSize(clean(desc), W - 2 * M - 22) : []
    const h = 20 + (meta ? 12 : 0) + lines.length * 11.5 + 10
    need(h)
    doc.setFillColor(...CREME); doc.roundedRect(M, y - 12, W - 2 * M, h, 4, 4, 'F')
    doc.setFillColor(...OR); doc.rect(M, y - 12, 3, h, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(20, 20, 20)
    doc.text(clean(titre), M + 14, y); y += 14
    if (meta) { doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...FORET); doc.text(clean(meta).toUpperCase(), M + 14, y, { charSpace: 0.6 } as any); y += 12 }
    if (lines.length) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...TXT); for (const ln of lines) { doc.text(ln, M + 14, y); y += 11.5 } }
    y += 16
  }

  const restos = (ville.restaurants ?? []); const hotels = (ville.hotels ?? []); const activites = (ville.activites ?? [])

  // ---------- SOMMAIRE ----------
  newPage()
  section('', 'Sommaire')
  const toc = [
    ['01', 'Bienvenue a ' + nom],
    ['02', 'Informations pratiques'],
    ['03', 'Foi & spiritualite'],
    restos.length ? ['04', `Ou manger  (${restos.length} adresses halal)`] : null,
    hotels.length ? ['05', `Ou dormir  (${hotels.length} hebergements)`] : null,
    activites.length ? ['06', `A voir & a faire  (${activites.length})`] : null,
    activites.length ? ['07', 'Itineraires : famille, amis, solo'] : null,
  ].filter(Boolean) as string[][]
  for (const [n, t] of toc) {
    need(28)
    doc.setFont('times', 'bold'); doc.setFontSize(15); doc.setTextColor(...OR); doc.text(n, M, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(...TXT); doc.text(clean(t), M + 40, y)
    doc.setDrawColor(225, 220, 208); doc.setLineWidth(0.4); doc.line(M, y + 9, W - M, y + 9)
    y += 28
  }

  // ---------- 01 ----------
  newPage(); section('01', 'Bienvenue a ' + nom)
  const desc = typeof ville.description === 'string' ? ville.description : (ville.description?.long ?? ville.description?.court ?? '')
  para(desc, 11)
  if (halal != null) para(`Halal Trust Score : ${halal}/10 - destination evaluee sur la disponibilite du halal, les mosquees et l'experience du voyageur musulman.`, 10, FORET)

  // ---------- 02 fact-sheet 2 colonnes ----------
  section('02', 'Informations pratiques')
  const ip = ville.infoPratique ?? {}
  const facts: [string, any][] = [['Pays', pays], ['Monnaie', ip.monnaie || ville.monnaie], ['Langue', ip.langue || ville.langue], ['Meilleure periode', ip.meilleureEpoque || ville.meilleureEpoque], ['Transport', ip.transport || ville.transport], ['Budget', ip.budget], ['A ne pas manquer', ip.incontournable]]
  for (const [k, v] of facts) {
    const val = clean(v); if (!val) continue
    const lines = doc.splitTextToSize(val, W - 2 * M - 130)
    const h = Math.max(20, lines.length * 12 + 8); need(h)
    doc.setFillColor(...CREME); doc.roundedRect(M, y - 12, W - 2 * M, h, 3, 3, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...OR); doc.text(k.toUpperCase(), M + 12, y, { charSpace: 0.6 } as any)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...TXT)
    let yy = y; for (const ln of lines) { doc.text(ln, M + 130, yy); yy += 12 }
    y += h + 6
  }

  // ---------- 03 ----------
  section('03', 'Foi & spiritualite')
  para(`Horaires de priere en temps reel (Fajr, Dhuhr, Asr, Maghrib, Isha) et boussole Qibla sur ${host}.`, 10.5)
  for (const m of (ville.mosqueesPrincipales ?? []).slice(0, 6)) fiche(m.nom, clean(m.adresse), m.description)

  // ---------- 04 / 05 / 06 ----------
  if (restos.length) { section('04', 'Ou manger - halal certifie'); for (const r of restos.slice(0, 16)) fiche(`${clean(r.nom)}   ${(r.score ?? r.note) ? (r.score ?? r.note) + '/5' : ''}`, [clean(r.type), clean(r.priceRange ?? r.fourchette_prix), clean(r.adresse)].filter(Boolean).join('  .  '), r.specialite) }
  if (hotels.length) { section('05', 'Ou dormir - halal-friendly'); for (const h of hotels.slice(0, 10)) fiche(`${clean(h.nom)}   ${(h.score ?? h.note) ? (h.score ?? h.note) + '/5' : ''}`, [clean(h.categorie), clean(h.priceRange), (h.sansAlcool ? 'Sans alcool' : '')].filter(Boolean).join('  .  '), h.description) }
  if (activites.length) { section('06', 'A voir & a faire'); for (const a of activites) fiche(`${clean(a.nom)}   ${clean(a.prix) ? '[' + clean(a.prix) + ']' : ''}`, clean(a.categorie), a.description) }

  // ---------- 07 itineraires ----------
  if (activites.length) {
    section('07', 'Itineraires sur mesure')
    for (const p of PROFILS) {
      need(60)
      doc.setFont('times', 'bold'); doc.setFontSize(17); doc.setTextColor(...FORET); doc.text(`${p.titre}`, M, y)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...OR); doc.text(`${p.jours} JOURS`, W - M, y, { align: 'right', charSpace: 1 } as any)
      y += 14
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9.5); doc.setTextColor(...MUTE); doc.text(clean(p.intro), M, y); y += 18
      const acts = pickActs(activites, p.kw, p.jours + 2)
      acts.forEach((a, i) => { fiche(`Jour ${Math.min(i + 1, p.jours)}   .   ${clean(a.nom)}`, undefined, a.description?.slice(0, 140)) })
      y += 8
    }
  }

  // ---------- CTA ----------
  need(130); y = Math.max(y, H - 160)
  doc.setFillColor(...NUIT); doc.roundedRect(M, y, W - 2 * M, 100, 8, 8, 'F')
  try { doc.setGState(new (doc as any).GState({ opacity: 0.15 })) } catch {}
  motif(W - M - 50, y + 50, 34, OR, 0.7)
  try { doc.setGState(new (doc as any).GState({ opacity: 1 })) } catch {}
  doc.setFont('times', 'bold'); doc.setFontSize(17); doc.setTextColor(...OR); doc.text(`Vis ton voyage halal a ${nom}`, M + 24, y + 38)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(235, 232, 222)
  doc.text('Horaires de priere en direct  .  Mosquee la plus proche  .  Boussole Qibla', M + 24, y + 60)
  caps(host + '/destinations/' + clean(ville.slug), M + 24, y + 82, 10, OR)

  doc.save(`Guide-Halal-${nom.replace(/[^a-z0-9]/gi, '-')}-2026.pdf`)
}
