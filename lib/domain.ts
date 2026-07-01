import { headers } from 'next/headers'

export interface DomainSEO {
  isEN: boolean
  brand: string
  siteUrl: string
}

// Détecte le domaine côté serveur (header host) pour servir les métadonnées
// dans la bonne langue : gohalaltravel.com → anglais, voyageshalal.fr → français.
export async function getDomainSEO(): Promise<DomainSEO> {
  let host = ''
  try { host = (await headers()).get('host') || '' } catch { /* contexte statique */ }
  const isEN = host.includes('gohalaltravel')
  return {
    isEN,
    brand: isEN ? 'GoHalalTravel.com' : 'VoyagesHalal.fr',
    siteUrl: isEN ? 'https://www.gohalaltravel.com' : 'https://www.voyageshalal.fr',
  }
}

export const FR_URL = 'https://www.voyageshalal.fr'
export const EN_URL = 'https://www.gohalaltravel.com'
