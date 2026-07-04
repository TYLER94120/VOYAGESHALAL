// Auth admin minimale (Phase 1) : un seul secret partagé via ADMIN_TOKEN.
// Sert à protéger la lecture des leads et l'ajout de spots de prière (seed).
// Le propriétaire entre ce token une fois ; il est envoyé en en-tête Bearer.

export function checkAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_TOKEN
  if (!expected) return false // pas de token configuré = accès refusé (sécurité par défaut)
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : (new URL(req.url).searchParams.get('token') || '')
  return token === expected
}
