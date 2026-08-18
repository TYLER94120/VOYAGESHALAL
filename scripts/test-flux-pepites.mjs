// 🧪 FLUX PÉPITES — les invariants du brief 2a, verrouillés dans le code.
//
// Ces tests lisent les SOURCES : ils empêchent qu'une retouche de forme
// réintroduise ce qu'on a retiré exprès (emoji, photo d'illustration,
// filtre pré-activé, ligne IA inventée).
import { readFileSync } from 'fs'

const brut = readFileSync('components/spots/FluxPepites.tsx', 'utf8')
// Les commentaires racontent l'histoire, le rendu suit les règles : on ne
// scanne que le code effectif.
const flux = brut.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const ia = readFileSync('app/api/spots/ia/route.ts', 'utf8')
const api = readFileSync('app/api/community/spots/route.ts', 'utf8')
let ko = 0
const check = (ok, msg) => { if (!ok) { console.error(`❌ ${msg}`); ko++ } }

// 1. Aucun emoji au rendu du flux (même règle que la nav et les tris).
const emojis = flux.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu) ?? []
check(emojis.length === 0, `emoji trouvés dans FluxPepites : ${emojis.join(' ')}`)

// 2. La ligne « Claude a lu le menu » n'existe que si s.ia est présent —
//    jamais un texte en dur, jamais une estimation.
check(flux.includes('s.ia?.texte &&'), 'la ligne IA doit être conditionnée à s.ia?.texte')
check(!/Claude a lu le menu[^{]*\d/.test(flux), 'aucun prix en dur ne doit accompagner « Claude a lu le menu »')

// 3. Pas de photo d'illustration de la ville dans le flux : un spot sans
//    média est une carte texte (fond forêt), pas une photo d'ambiance.
check(!flux.includes('villeImage'), 'villeImage ne doit pas réapparaître dans le flux')

// 4. À l'arrivée : TOUS les spots, aucun filtre pré-activé, pas de géoloc
//    silencieuse au chargement.
check(flux.includes("useState<string | null>(null) // null = Tous"), 'le chip par défaut doit être « Tous » (null)')
check(!flux.includes('permissions?.query'), 'plus de géoloc silencieuse au chargement du flux')

// 5. Un seul CTA par écran : Itinéraire (h 54, or plein).
check((flux.match(/Itinéraire/g) ?? []).length === 1, 'exactement un CTA « Itinéraire » dans le composant plein écran')

// 6. L'extraction IA : température 0, refus de tout ce qui n'est pas un
//    prix LU (chiffre + €), « RIEN » jamais enregistré.
check(ia.includes('temperature: 0'), 'extraction IA : température 0')
check(ia.includes("/^RIEN\\b/i.test(texte)") && ia.includes("texte.includes('€')") && ia.includes('/\\d/.test(texte)'), 'extraction IA : validation chiffre + € + RIEN')
check(ia.includes('jamais une estimation') || ia.includes('rien d’inventé') || ia.includes("rien d'inventé") || ia.includes('Jamais d’estimation') || ia.includes("Jamais d'estimation"), 'extraction IA : la règle « rien d\'inventé » doit rester écrite')

// 7. Le classement par récence est pondéré par l'usage, borné (jamais
//    d'enterrement des nouveaux spots).
check(api.includes('Math.min(7 * 24 * H'), 'pondération « utile » bornée à 7 jours dans le GET')

if (ko) { console.error(`${ko} invariant(s) du flux pépites cassé(s)`); process.exit(1) }
console.log('✅ flux pépites : plein écran sans emoji, ligne IA seulement si lue, jamais d\'écran vide ni de filtre imposé.')
