'use client'
import dynamic from 'next/dynamic'

const QiblaCalculator = dynamic(
  () => import('@/components/QiblaCalculator').then((m) => m.default),
  { ssr: false }
)

export default function QiblaClient() {
  return <QiblaCalculator />
}
