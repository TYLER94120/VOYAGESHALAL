// Dates du Ramadan 2026 et 2027 (approximations fixes)
const RAMADAN_PERIODS = [
  { start: new Date('2026-02-17'), end: new Date('2026-03-19'), year: 1447 },
  { start: new Date('2027-02-06'), end: new Date('2027-03-07'), year: 1448 },
]

export function isRamadan(): boolean {
  const now = new Date()
  return RAMADAN_PERIODS.some((r) => now >= r.start && now <= r.end)
}

export function getRamadanInfo(): { isActive: boolean; daysRemaining?: number; year?: number } {
  const now = new Date()
  for (const r of RAMADAN_PERIODS) {
    if (now >= r.start && now <= r.end) {
      const daysRemaining = Math.ceil((r.end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { isActive: true, daysRemaining, year: r.year }
    }
  }
  return { isActive: false }
}

export function getDaysUntilRamadan(): number {
  const now = new Date()
  for (const r of RAMADAN_PERIODS) {
    if (now < r.start) {
      return Math.ceil((r.start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }
  }
  return 0
}
