import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata, buildFAQSchema, buildBreadcrumbSchema, SITE_URL } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import OmraLeadForm from '@/components/omra/OmraLeadForm'
import { getDomainSEO } from '@/lib/domain'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return buildMetadata({
    title: isEN ? 'Umrah 2026 — Complete Guide, Packages & Preparation' : 'Omra 2026 — Guide Complet, Forfaits & Préparation',
    description: isEN
      ? 'Everything to prepare your Umrah 2026: visa, packages, budget, rituals, best agencies and practical tips for a successful pilgrimage.'
      : "Tout ce qu'il faut savoir pour préparer votre Omra 2026 : visa, forfaits, budget, rituels, meilleures agences en France et conseils pratiques pour un pèlerinage réussi.",
    type: 'article',
    canonical: `${siteUrl}${isEN ? '/umrah' : '/omra'}`,
    languages: {
      fr: 'https://www.voyageshalal.fr/omra',
      en: 'https://www.gohalaltravel.com/umrah',
      'x-default': 'https://www.gohalaltravel.com/umrah',
    },
  })
}

const FAQS = [
  {
    question: 'Quelle est la différence entre l\'Omra et le Hajj ?',
    answer: 'L\'Omra est le "petit pèlerinage", réalisable à tout moment de l\'année. Le Hajj est le "grand pèlerinage", l\'un des 5 piliers de l\'islam, qui doit être accompli au moins une fois dans sa vie pour tout musulman en capacité, à une date précise du calendrier islamique (mois de Dhul Hijja). L\'Omra ne remplace pas le Hajj mais est très méritoire.'
  },
  {
    question: 'Quel est le coût d\'une Omra depuis la France en 2026 ?',
    answer: 'Le coût varie selon la période et le standing choisi. Un forfait Omra hors Ramadan depuis Paris comprend généralement : vol (350-600€), hébergement La Mecque + Médine (500-1500€/semaine selon standing), et transferts. Budget total : 1 200€ minimum en économique, 3 000-6 000€ en confort. Pendant le Ramadan, les prix peuvent tripler.'
  },
  {
    question: 'Comment obtenir un visa pour l\'Omra ?',
    answer: 'Le visa Omra s\'obtient soit via une agence agréée par le Ministère français des Affaires Religieuses (la plus courante), soit directement en ligne sur le portail officiel nusuk.sa (e-visa en 24-72h). Documents requis : passeport valide 6 mois min, photos d\'identité, preuve de mahram pour les femmes voyageant seules, vaccination méningocoque ACWY obligatoire.'
  },
  {
    question: 'Peut-on faire l\'Omra sans agence ?',
    answer: 'Techniquement oui depuis l\'ouverture du portail nusuk.sa, mais cela demande une bonne organisation : obtenir son visa soi-même, réserver les hôtels (difficile car la demande est immense), organiser les transferts. Pour une première Omra, une agence agréée est vivement recommandée — elle gère tout et s\'assure que les rituels sont correctement accomplis.'
  },
  {
    question: 'Quelle est la meilleure période pour faire l\'Omra ?',
    answer: 'Chaque période a ses avantages : Ramadan (expérience spirituelle maximale, mais prix élevés et foule immense), Chaabane (juste avant Ramadan, spiritualité proche mais plus calme), Muharram/Safar (basse saison, prix bas, idéal avec des enfants). Éviter : la période du Hajj (Dhul Hijja) — La Mecque est alors saturée et les hôtels indisponibles pour l\'Omra.'
  },
]

const PERIODS = [
  { label: 'Hors saison', months: 'Muharram – Rajab', crowd: 'Faible', price: '€€', spirit: '⭐⭐⭐', note: 'Idéal pour les familles et les seniors' },
  { label: 'Pré-Ramadan', months: 'Chaabane', crowd: 'Modérée', price: '€€€', spirit: '⭐⭐⭐⭐', note: 'Bon équilibre prix / spiritualité' },
  { label: 'Ramadan', months: 'Ramadan', crowd: 'Très élevée', price: '€€€€', spirit: '⭐⭐⭐⭐⭐', note: 'Expérience spirituelle unique — planifier tôt' },
  { label: 'Été', months: 'Dhul Qada', crowd: 'Élevée', price: '€€€', spirit: '⭐⭐⭐', note: 'Chaleur intense (45°C+) — prévoir hydratation' },
]

const STEPS = [
  { num: '01', title: 'L\'Ihram', desc: 'État de pureté rituel. Revêtir la tenue blanche (hommes) à la Miqat. Intention et talbyia : "Labbayk Allahoumma Omratan".' },
  { num: '02', title: 'Le Tawaf', desc: '7 circumambulations autour de la Kaaba dans le sens antihoraire, en commençant par la Hajr al-Aswad (Pierre Noire).' },
  { num: '03', title: 'La Prière', desc: 'Après le Tawaf, prier 2 rakaat derrière le Maqam Ibrahim, puis boire l\'eau de Zamzam.' },
  { num: '04', title: 'Le Sa\'y', desc: '7 allers-retours entre les collines de Safa et de Marwa, en souvenir de Hajar cherchant de l\'eau pour son fils Ismaïl.' },
  { num: '05', title: 'Le Taqsir / Halq', desc: 'Coupe ou rasage des cheveux symbolisant la sortie de l\'Ihram et la fin de l\'Omra.' },
]

export default function OmraPage() {
  const faqSchema = buildFAQSchema(FAQS)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Omra 2026', url: '/omra' },
  ])

  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Guide Omra 2026',
        description: 'Guide complet pour préparer votre Omra 2026 depuis la France',
        url: `${SITE_URL}/omra`,
        publisher: { '@type': 'Organization', name: 'VoyagesHalal.fr', url: SITE_URL },
      }} />

      <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
            <span>›</span>
            <span className="text-gray-700">Omra 2026</span>
          </nav>
        </div>

        {/* Hero */}
        <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#c9a870]" />
          </div>
          <div className="relative max-w-4xl">
            <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              Pèlerinage · Guide 2026
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Omra 2026 —<br />
              Préparez votre<br />
              <em style={{ color: '#c9a870', fontStyle: 'italic' }}>pèlerinage</em> sereinement
            </h1>
            <p className="text-white/60 text-base max-w-xl leading-relaxed mb-10">
              Visa, forfaits, rituels, budget, agences — tout ce qu&apos;il faut savoir pour vivre une Omra spirituellement intense et pratiquement parfaite.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/guides/omra-2026-guide-complet"
                style={{ backgroundColor: '#c9a870', color: '#1a3a2a' }}
                className="font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Lire le guide complet →
              </Link>
              <a
                href="#devis"
                style={{ backgroundColor: '#c9a870', color: '#1a3a2a' }}
                className="font-bold text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
              >
                🕋 Recevoir des devis gratuits
              </a>
              <Link
                href="/destinations/medine"
                className="border border-white/30 text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                Guide Médine
              </Link>
            </div>
          </div>
        </section>

        {/* Tunnel de leads Omra/Hajj — revenu n°2 */}
        <section id="devis" style={{ backgroundColor: '#fff' }} className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">Devis gratuit · sans engagement</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                Comparez les meilleures offres Omra &amp; Hajj
              </h2>
              <p className="text-gray-500 mt-3 max-w-lg mx-auto">
                Décrivez votre projet en 30 secondes : des agences partenaires vous envoient leurs propositions adaptées à votre budget.
              </p>
            </div>
            <OmraLeadForm />
          </div>
        </section>

        {/* 4 blocs navigateurs */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📋', title: 'Préparation', desc: 'Visa, documents, vaccins et check-list complète.', href: '/guides/omra-2026-guide-complet' },
              { icon: '💰', title: 'Forfaits & Budget', desc: 'Comparatif prix selon période et standing.', href: '/guides/omra-2026-guide-complet' },
              { icon: '🕌', title: 'Rituels', desc: 'Les 5 étapes de l\'Omra expliquées simplement.', href: '/guides/omra-2026-guide-complet' },
              { icon: '🧭', title: 'Guides pratiques', desc: 'Hébergement, transport, nourriture à La Mecque.', href: '/destinations/medine' },
            ].map((block) => (
              <Link
                key={block.title}
                href={block.href}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all text-center"
              >
                <div className="text-3xl mb-3">{block.icon}</div>
                <h2 className="font-bold text-gray-900 mb-2 group-hover:text-[#1a3a2a] transition-colors">{block.title}</h2>
                <p className="text-xs text-gray-500 leading-relaxed">{block.desc}</p>
                <span style={{ color: '#c9a870' }} className="text-xs font-medium mt-3 block">Voir →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Les 5 étapes */}
        <section style={{ backgroundColor: '#f5f0e8' }} className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">Rituels</p>
            <h2
              className="text-3xl font-bold text-center mb-12"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
            >
              Les 5 étapes de l&apos;Omra
            </h2>
            <div className="space-y-4">
              {STEPS.map((step) => (
                <div key={step.num} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-5">
                  <div
                    style={{ backgroundColor: '#1a3a2a', minWidth: 44, minHeight: 44 }}
                    className="rounded-full flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-sm">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tableau des périodes */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-14">
          <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">Planification</p>
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
          >
            Quelle période choisir pour votre Omra ?
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <thead>
                <tr style={{ backgroundColor: '#1a3a2a' }}>
                  <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">Période</th>
                  <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">Mois</th>
                  <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">Affluence</th>
                  <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">Prix</th>
                  <th className="text-left text-white text-xs font-semibold uppercase tracking-wide px-5 py-3.5">Spiritualité</th>
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p, i) => (
                  <tr key={p.label} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 text-sm">{p.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.note}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.months}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.crowd}</td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: '#1a3a2a' }}>{p.price}</td>
                    <td className="px-5 py-4 text-sm">{p.spirit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: '#f5f0e8' }} className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-2xl font-bold text-center mb-10"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
            >
              Questions fréquentes sur l&apos;Omra
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations liées */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-14">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
          >
            Destinations du pèlerinage
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/destinations/medine"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">🕌</span>
              <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-[#1a3a2a]">Médine — La ville du Prophète ﷺ</h3>
              <p className="text-sm text-gray-500">Masjid an-Nabawi, Masjid Quba, montagne Uhud — la dimension spirituelle du pèlerinage.</p>
              <span style={{ color: '#c9a870' }} className="text-xs font-medium mt-3 block">Guide Médine →</span>
            </Link>
            <Link
              href="/destinations/pays/arabie-saoudite"
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">🇸🇦</span>
              <h3 className="font-bold text-gray-900 mt-3 mb-2 group-hover:text-[#1a3a2a]">Arabie Saoudite — Guide complet</h3>
              <p className="text-sm text-gray-500">Visa, budget, hébergement, transport — tout pour préparer votre voyage en Arabie Saoudite.</p>
              <span style={{ color: '#c9a870' }} className="text-xs font-medium mt-3 block">Découvrir →</span>
            </Link>
          </div>
        </section>

        {/* Email capture */}
        <EmailCapture
          title="Recevez les offres Omra en avant-première"
          subtitle="Forfaits, réductions et conseils d'agences — directement dans votre boîte mail."
          source="omra-hub"
        />
      </main>
    </>
  )
}
