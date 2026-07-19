import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'
import AjouterClient from '@/components/community/AjouterClient'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN } = await getDomainSEO()
  return {
    title: isEN ? 'Add a spot — 30 seconds' : 'Ajouter un spot — 30 secondes',
    robots: { index: false, follow: true },
  }
}

export default async function AjouterPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section style={{ background: 'var(--nuit)', padding: '1.4rem 1.25rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, color: 'white', margin: 0 }}>
          ➕ {en ? 'Add a spot' : 'Ajouter un spot'}
        </h1>
      </section>
      <AjouterClient />
    </main>
  )
}
