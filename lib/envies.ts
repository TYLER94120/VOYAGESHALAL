// 🍔 « J'AI ENVIE DE… » — point d'entrée TypeScript.
//
// La table et les fonctions vivent dans lib/envies.mjs pour que la chaîne
// de tests puisse les importer sans drapeau expérimental (voir l'en-tête
// de ce fichier). Ici, on ne fait que republier, avec les types.
export type { Envie } from '@/lib/envies.mjs'
export { ENVIES, forceEnvie, forceEnvieGoogle, correspondEnvie, envieById, niveauHalal } from '@/lib/envies.mjs'
