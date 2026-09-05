import Link from 'next/link'

// 🕸 L'INDEX QUI RATTACHE LES PAGES ORPHELINES.
//
// Mesure du 30 août (scratchpad/maillage.mjs, les deux domaines, 1 633 pages
// demandées au serveur de production) :
//
//   voyageshalal.fr    281 pages orphelines · 581 inatteignables depuis /
//   gohalaltravel.com  280 pages orphelines · 344 inatteignables depuis /
//
// Une page ORPHELINE ne reçoit aucun lien d'une autre page du site. Une page
// INATTEIGNABLE n'est reliée à l'accueil par aucun chemin de liens. Un robot
// arrive par les liens : ces pages sont dans le sitemap, servies en 200, et
// pourtant explorées à peine — ce qui explique qu'environ 30 pages sur 810
// seulement obtiennent un affichage.
//
// Deux familles concentraient presque tout :
//   · /hotels/*      333 villes hôtel — le hub /hotels ne liait AUCUNE d'elles,
//                    tous ses liens sortants partaient chez HalalBooking.
//   · /destinations  248 villes — la grille est rendue par le client et n'en
//                    posait que 111 dans le HTML servi.
//
// 🔴 CE COMPOSANT EST RENDU PAR LE SERVEUR, sans 'use client'. C'est toute sa
// raison d'être : un lien que seul le navigateur écrit ne raccroche rien.
// Il n'invente aucune page — il ne reçoit que des chemins qui existent déjà.
export type LienIndex = { href: string; nom: string; groupe?: string }

export default function IndexLiens({ titre, intro, liens }: { titre: string; intro: string; liens: LienIndex[] }) {
  if (liens.length === 0) return null

  // Groupés par pays quand on le connaît : une liste de 333 noms à plat ne se
  // lit pas, et le regroupement porte lui-même une information vraie.
  const groupes = new Map<string, LienIndex[]>()
  for (const l of liens) {
    const g = l.groupe?.trim() || ''
    if (!groupes.has(g)) groupes.set(g, [])
    groupes.get(g)!.push(l)
  }
  const ordonnes = [...groupes.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr'))

  return (
    <nav aria-label={titre} style={{ marginTop: 34, borderTop: '1px solid rgba(201,168,76,0.28)', paddingTop: 22 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: 'inherit' }}>
        {titre}
      </h2>
      <p style={{ fontSize: 13, opacity: 0.6, margin: '0 0 16px', lineHeight: 1.6 }}>{intro}</p>
      <div style={{ display: 'grid', gap: 18 }}>
        {ordonnes.map(([groupe, items]) => (
          <div key={groupe || '_'}>
            {groupe && (
              <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, margin: '0 0 8px' }}>
                {groupe}
              </h3>
            )}
            <ul style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: '8px 10px', margin: 0, padding: 0 }}>
              {items.map((l) => (
                <li key={l.href}>
                  {/* 56 px de haut : la règle de la maison sur la cible tactile
                      vaut aussi pour un index — c'est une liste qu'on parcourt
                      au pouce, pas un pied de page décoratif. */}
                  <Link
                    href={l.href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 14px',
                      borderRadius: 999, border: '1px solid rgba(201,168,76,0.32)',
                      fontSize: 14, fontWeight: 600, textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    {l.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
