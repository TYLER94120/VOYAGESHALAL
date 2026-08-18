export declare function osrmMinutes(
  origine: { lat: number; lng: number },
  dests: { lat: number; lng: number }[],
  mode: 'marche' | 'voiture',
  delaiMs?: number,
): Promise<({ min: number; metres: number } | null)[]>
