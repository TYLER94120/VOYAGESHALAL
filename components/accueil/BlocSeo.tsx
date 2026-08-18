import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { afficher, couleurBadge, valider } from '@/lib/halalScore.mjs'
import { FAQ_ACCUEIL } from '@/lib/faqAccueil'

// 📖 LE CONTENU QUE GOOGLE LIT — et qui n'est pas caché pour autant.
//
// Rendu par le SERVEUR : le texte est dans le HTML servi, pas injecté après
// coup. C'est l'exigence du brief, et c'est aussi la seule façon d'être
// indexé. Les liens vers les villes sont des <a href> natifs.
//
// ⚠️ AUCUN CHIFFRE ÉCRIT EN DUR. Le nombre de villes, les noms et les
// HalalScore sont lus dans data/villes/*.json à la construction. La
// maquette affichait « plus de 120 villes » et « La Mecque ✦ 9,4 » : nous
// en avons 354, et La Mecque est à 10. Une maquette illustre, elle ne
// renseigne pas.

interface VilleVedette { slug: string; nom: string; pays: string; score: number }

function lireVilles(): { vedettes: VilleVedette[]; total: number } {
  const dir = path.join(process.cwd(), 'data', 'villes')
  const out: VilleVedette[] = []
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue
    try {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
      const slug = f.replace('.json', '')
      // 🔴 La validation décide de l'affichage : une ville dont le score est
      // absent ou aberrant n'apparaît pas, plutôt que d'afficher un chiffre
      // auquel nous ne croyons pas nous-mêmes.
      if (!valider(slug, d.halalScore).ok) continue
      out.push({ slug, nom: d.nom ?? slug, pays: d.pays ?? '', score: d.halalScore })
    } catch { /* un fichier illisible ne fait pas tomber la page */ }
  }
  out.sort((a, b) => b.score - a.score || a.nom.localeCompare(b.nom, 'fr'))
  return { vedettes: out.slice(0, 7), total: out.length }
}

export default function BlocSeo() {
  const { vedettes, total } = lireVilles()

  return (
    <div className="v6-seo">
      <section>
        <h2>Le guide du voyage halal</h2>
        <p>
          <strong>VoyagesHalal</strong> recense les <strong>restaurants halal</strong>, les <strong>mosquées</strong>,
          les <strong>salles de prière</strong> et les <strong>hébergements sans alcool</strong> dans {total} villes
          du monde. Une escale à l&apos;aéroport, un week-end en famille ou un long séjour : vous savez où prier,
          où manger et où dormir.
        </p>
        <p>
          Chaque adresse porte son statut, et nous n&apos;en inventons aucun : <strong>vérifié</strong> quand nous
          l&apos;avons contrôlé nous-mêmes, <strong>signalé halal</strong> quand c&apos;est une déclaration à confirmer
          sur place, <strong>non confirmé</strong> quand nous ne savons pas. Nous ne délivrons aucune certification —
          personne ne devrait s&apos;en attribuer une qu&apos;il ne peut pas prouver.
        </p>
      </section>

      <section>
        <h2>Destinations halal</h2>
        <p>
          Nos guides ville par ville, classés par <strong>HalalScore</strong> — la note de 0 à 10 qui résume la
          facilité d&apos;un séjour pour un voyageur musulman.
        </p>
        <div className="v6-villes">
          {vedettes.map((v) => (
            <Link key={v.slug} className="v6-ville" href={`/destinations/${v.slug}`}>
              <span>{v.nom}{v.pays ? `, ${v.pays}` : ''}</span>
              <span className="v6-sc" style={{ color: couleurBadge(v.score) === '#6B7075' ? undefined : 'var(--or-clair)' }}>
                {afficher(v.score)}
              </span>
            </Link>
          ))}
          <Link className="v6-ville" href="/destinations">
            <span>Toutes les destinations</span>
            <span className="v6-sc">{total}</span>
          </Link>
        </div>
      </section>

      <section>
        <h2>Ce que vous trouvez sur VoyagesHalal</h2>
        <div className="v6-atouts">
          {[
            ['Mosquées et salles de prière', 'Mosquées, mais aussi salles de prière d\'aéroports, de gares, de centres commerciaux et d\'aires d\'autoroute. Les équipements — ablutions, espace pour les femmes — sont affichés quand ils sont renseignés, et seulement dans ce cas.'],
            ['Adresses halal', 'Statut, cuisine, budget et distance. Les établissements identifiés comme servant de l\'alcool sont écartés des propositions, et les adresses ouvertes passent devant les fermées.'],
            ['Hébergements sans alcool', 'Établissements sans bar, avec salle de prière ou services adaptés aux familles musulmanes — d\'après ce que l\'établissement déclare, jamais d\'après une supposition.'],
            ['Horaires de prière et Qibla', 'Les cinq prières calculées sur votre appareil, à partir de votre position exacte, et la direction de la Qibla où que vous soyez. Sans compte, et sans réseau.'],
          ].map(([titre, texte]) => (
            <div className="v6-atout" key={titre}>
              <h3>{titre}</h3>
              <p>{texte}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="v6-faq">
        <h2>Questions fréquentes</h2>
        {FAQ_ACCUEIL.map((f, i) => (
          <details key={f.q} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.r}</p>
          </details>
        ))}
      </section>
    </div>
  )
}
