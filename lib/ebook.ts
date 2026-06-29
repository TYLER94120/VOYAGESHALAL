/* eslint-disable @typescript-eslint/no-explicit-any */
// Génère un ebook PDF gratuit par ville, à partir des données existantes.

const NUIT: [number, number, number] = [11, 26, 15]
const FORET: [number, number, number] = [27, 67, 50]
const OR: [number, number, number] = [201, 168, 76]
const GRIS: [number, number, number] = [90, 90, 90]

// Mots-clés pour répartir les activités en 3 profils de road trip
const PROFILS: { key: string; titre: string; emoji: string; jours: string; kw: string[] }[] = [
  { key: 'famille', titre: 'En famille', emoji: '👨‍👩‍👧', jours: '3 jours', kw: ['plage', 'parc', 'marché', 'souk', 'jardin', 'détente', 'famille', 'nature', 'musée', 'culture', 'loisir', 'piscine'] },
  { key: 'amis', titre: 'Entre amis', emoji: '👥', jours: '2 jours', kw: ['sport', 'rando', 'kayak', 'jet', 'surf', 'aventure', 'vtt', 'vélo', 'plong', 'golf', 'montagne', 'dune', 'bivouac', 'nuit'] },
  { key: 'solo', titre: 'En solo', emoji: '🧍', jours: '2-3 jours', kw: ['spirituel', 'histoire', 'culture', 'musée', 'mosquée', 'médina', 'monument', 'patrimoine'] },
]

function pickActs(activites: any[], kw: string[]): any[] {
  const match = activites.filter((a) => {
    const t = `${a.nom} ${a.categorie}`.toLowerCase()
    return kw.some((k) => t.includes(k))
  })
  return (match.length ? match : activites).slice(0, 5)
}

export async function generateEbook(ville: any, brand = 'VoyagesHalal.fr', siteUrl = 'https://www.voyageshalal.fr') {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48
  let y = M

  const nom = ville.nom ?? 'Destination'
  const pays = ville.pays ?? ''
  const halal = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)

  // ---------- COUVERTURE ----------
  doc.setFillColor(...NUIT); doc.rect(0, 0, W, H, 'F')
  doc.setFillColor(...OR); doc.rect(0, 250, W, 4, 'F')
  doc.setTextColor(...OR); doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  doc.text('✦ ' + brand.toUpperCase(), W / 2, 150, { align: 'center' })
  doc.setTextColor(255, 255, 255); doc.setFontSize(15)
  doc.text('GUIDE HALAL', W / 2, 205, { align: 'center' })
  doc.setFont('times', 'bold'); doc.setFontSize(46)
  doc.text(nom, W / 2, 235, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(16); doc.setTextColor(220, 210, 180)
  doc.text(`${pays} · 2026`, W / 2, 290, { align: 'center' })
  if (halal != null) {
    doc.setFillColor(...OR); doc.roundedRect(W / 2 - 90, 330, 180, 36, 18, 18, 'F')
    doc.setTextColor(...NUIT); doc.setFont('helvetica', 'bold'); doc.setFontSize(15)
    doc.text(`Halal Score  ${halal}/10`, W / 2, 353, { align: 'center' })
  }
  doc.setTextColor(180, 180, 170); doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('Restaurants halal · Mosquées · Horaires de prière · Road trips', W / 2, H - 90, { align: 'center' })
  doc.setTextColor(...OR); doc.setFontSize(12)
  doc.text(siteUrl.replace('https://', ''), W / 2, H - 64, { align: 'center' })

  // ---------- helpers pages de contenu ----------
  const newPage = () => { doc.addPage(); y = M }
  const need = (h: number) => { if (y + h > H - M) newPage() }
  const section = (titre: string) => {
    need(50)
    doc.setFillColor(...FORET); doc.roundedRect(M, y, W - 2 * M, 30, 6, 6, 'F')
    doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
    doc.text(titre, M + 14, y + 20)
    y += 44
  }
  const para = (txt: string, size = 10.5, color = GRIS) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.setTextColor(...color)
    const lines = doc.splitTextToSize(txt, W - 2 * M)
    for (const ln of lines) { need(size + 4); doc.text(ln, M, y); y += size + 4 }
  }
  const bullet = (titre: string, sous?: string) => {
    need(34)
    doc.setFillColor(...OR); doc.circle(M + 4, y - 3, 2.5, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(30, 30, 30)
    doc.text(titre, M + 14, y)
    y += 14
    if (sous) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...GRIS)
      const lines = doc.splitTextToSize(sous, W - 2 * M - 14)
      for (const ln of lines) { need(13); doc.text(ln, M + 14, y); y += 13 } }
    y += 6
  }

  newPage()

  // ---------- L'ESSENTIEL ----------
  section("L'essentiel à savoir")
  const desc = typeof ville.description === 'string' ? ville.description : (ville.description?.court ?? ville.description?.long ?? '')
  if (desc) para(desc)
  y += 6
  const ip = ville.infoPratique ?? {}
  const infos: [string, any][] = [
    ['🕌 Mosquée principale', (ville.mosqueesPrincipales?.[0]?.nom) || 'Voir la carte sur le site'],
    ['🧭 Prière & Qibla', 'Horaires en temps réel + boussole Qibla sur ' + siteUrl.replace('https://', '')],
    ['🚆 Transport', ip.transport || ville.transport || '—'],
    ['💱 Monnaie', ip.monnaie || ville.monnaie || '—'],
    ['🗣️ Langue', ip.langue || ville.langue || '—'],
    ['🌤️ Meilleure période', ip.meilleureEpoque || ville.meilleureEpoque || '—'],
  ]
  for (const [k, v] of infos) { if (v && v !== '—') bullet(k, String(v)) }

  // ---------- RESTAURANTS ----------
  const restos = (ville.restaurants ?? []).slice(0, 10)
  if (restos.length) {
    section('Top restaurants halal')
    for (const r of restos) bullet(`${r.nom}  ★${r.score ?? r.note ?? ''}  ${r.priceRange ?? r.fourchette_prix ?? ''}`, [r.type, r.specialite].filter(Boolean).join(' — '))
  }

  // ---------- HÔTELS ----------
  const hotels = (ville.hotels ?? []).slice(0, 6)
  if (hotels.length) {
    section('Où dormir (halal-friendly)')
    for (const h of hotels) bullet(`${h.nom}  ★${h.score ?? h.note ?? ''}  ${h.priceRange ?? ''}`, [h.categorie, h.sansAlcool ? 'Sans alcool' : ''].filter(Boolean).join(' — '))
  }

  // ---------- À VOIR ----------
  const activites = ville.activites ?? []
  if (activites.length) {
    section('À voir & à faire')
    for (const a of activites.slice(0, 12)) bullet(`${a.nom}  (${a.prix})`, a.description)
  }

  // ---------- ROAD TRIPS ----------
  if (activites.length) {
    section('Tes 3 road trips suggérés')
    for (const p of PROFILS) {
      need(40)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...FORET)
      doc.text(`${p.emoji}  ${p.titre} — ${p.jours}`, M, y); y += 18
      for (const a of pickActs(activites, p.kw)) bullet(a.nom, a.description?.slice(0, 110))
      y += 8
    }
  }

  // ---------- CTA FINAL ----------
  need(120)
  y = Math.max(y, H - 150)
  doc.setFillColor(...NUIT); doc.roundedRect(M, y, W - 2 * M, 90, 10, 10, 'F')
  doc.setTextColor(...OR); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.text(`Continue ton voyage halal à ${nom}`, W / 2, y + 32, { align: 'center' })
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(11)
  doc.text('Horaires de prière en direct · Mosquée la plus proche · Boussole Qibla', W / 2, y + 54, { align: 'center' })
  doc.setTextColor(...OR); doc.setFontSize(12)
  doc.text('👉  ' + siteUrl.replace('https://', '') + '/destinations/' + (ville.slug ?? ''), W / 2, y + 74, { align: 'center' })

  doc.save(`Guide-Halal-${nom.replace(/[^a-z0-9]/gi, '-')}-2026.pdf`)
}
