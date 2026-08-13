import type { Section } from '@/lib/guideHtml'

// 🧭 LE SOMMAIRE.
//
// Nos guides comptent de 8 à 14 sections. Sans sommaire, quelqu'un qui
// cherche « où prier » doit faire défiler tout le texte — et referme la
// page. Le sommaire se construit tout seul à partir des titres : il ne peut
// donc pas se désynchroniser du contenu, et il n'y a rien à maintenir.
//
// En dessous de cinq sections, on ne l'affiche pas : un sommaire de trois
// lignes au-dessus d'un texte court est du décor, pas un service.

export default function Sommaire({ sections, en }: { sections: Section[]; en: boolean }) {
  if (sections.length < 5) return null
  return (
    <nav
      aria-label={en ? 'Contents' : 'Sommaire'}
      className="rounded-2xl border p-6 mb-12"
      style={{ borderColor: '#e8d5a3', backgroundColor: '#faf7f0' }}
    >
      <p
        className="text-xs font-bold tracking-widest uppercase mb-4"
        style={{ color: '#1a6b3c' }}
      >
        {en ? 'In this guide' : 'Dans ce guide'}
      </p>
      <ol className="space-y-2.5">
        {sections.map((s, i) => (
          <li key={s.id} className="flex gap-3 text-[15px] leading-snug">
            <span className="tabular-nums font-semibold shrink-0" style={{ color: '#b08d3f' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <a href={`#${s.id}`} className="text-gray-700 hover:text-emerald-700 hover:underline">
              {s.titre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
