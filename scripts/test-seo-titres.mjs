// 🔎 LES RÈGLES DE TITRE, VÉRIFIÉES À CHAQUE CONSTRUCTION.
//
// Chantier SEO du 20 août. Trois règles écrites par Mohamed, trois
// vérifications ici — parce qu'une règle qui n'est pas vérifiée revient
// toujours par la porte de derrière, six mois plus tard, sur une page que
// personne ne relit.
//
//  1. Aucun mot creux dans un titre servi : « guide complet »,
//     « découvrez », « tout savoir », « complete guide », « ultimate
//     guide », « everything you need to know ». La page Marrakech en
//     portait trois et a fait ZÉRO clic sur 109 affichages en PREMIÈRE
//     page.
//  2. Le contenu de la page ville existe dans le HTML rendu par le
//     SERVEUR (socle) : le feed seul laissait 354 pages vides pour Google.
//  3. Les hreflang ne déclarent plus les pages qui ont divergé entre les
//     deux sites — un hreflang qui ment fait déclasser l'une des deux.
import { readFileSync } from 'node:fs'
import { fichierRoute } from './_routes.mjs'

/** Le code SANS ses commentaires : un commentaire qui explique « le <h1>
 *  vit ailleurs » ne doit pas être compté comme un <h1>. */
const codeSeul = (f) => readFileSync(f, 'utf8')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. mots interdits dans les titres servis ──
const INTERDITS = /guide complet|complete guide|ultimate guide|découvrez|tout savoir|everything you need to know/i
const FICHIERS_TITRES = ['lib/data.ts', 'lib/guidesEn.ts', 'lib/countriesData.ts', fichierRoute('omra/page.tsx'), fichierRoute('destinations/pays/[pays]/page.tsx')]
for (const f of FICHIERS_TITRES) {
  const lignes = readFileSync(f, 'utf8').split('\n')
  lignes.forEach((l, i) => {
    // On ne juge que les TITRES (title:), pas le corps des articles.
    // 29 août : la règle ne portait que sur les TITRES. Mesuré sur les
    // 1 641 pages servies, douze DESCRIPTIONS ouvraient encore sur
    // « Découvrez », « Tout savoir », « Guide complet » — et la description
    // est la deuxième ligne que Google affiche.
    if (/^\s*(meta)?[Tt]itle:|^\s*description:/.test(l) && INTERDITS.test(l)) {
      casse(`${f}:${i + 1} — mot creux dans ce que Google affiche : ${l.trim().slice(0, 90)}`)
    }
  })
}

// ── 2. le socle SSR des pages ville est bien branché ──
// Le rendu vit dans components/villes/DestinationRoute depuis le chantier
// cache du 22 août : les deux routes (FR et EN) l'appellent, le socle doit
// donc y être — c'est le seul endroit où il peut disparaître pour les deux
// langues d'un coup.
const pageVille = readFileSync('components/villes/DestinationRoute.tsx', 'utf8')
if (!/<SocleVille/.test(pageVille)) casse('le socle SSR a disparu de la page ville — les 354 pages redeviendraient vides pour Google')
const socle = codeSeul('components/villes/SocleVille.tsx')
if (!/<h1/.test(socle)) casse('le socle ville n\'a plus de <h1>')
if (/'use client'/.test(socle)) casse('le socle ville est devenu un composant client — il ne serait plus rendu par le serveur')
const socleWorld = codeSeul('components/flux/SocleWorld.tsx')
if (!/<h1/.test(socleWorld)) casse('le socle de l\'accueil anglais n\'a plus de <h1>')
if (/'use client'/.test(socleWorld)) casse('le socle anglais est devenu client — invisible pour un robot')
if (!/OpenStreetMap contributors/.test(socleWorld) || !/contributeurs OpenStreetMap/.test(socle)) casse('le crédit ODbL a disparu d\'un socle')

// Un seul <h1> par page : le nom de ville du flux et celui de la couche
// pratique doivent rester des titres visuels.
const imm = codeSeul('components/villes/Immersion.tsx')
if (/<h1/.test(imm)) casse('Immersion a repris un <h1> — la page ville en aurait deux')
const bloc = readFileSync('components/accueil/BlocSeo.tsx', 'utf8')
if (!/<h1>/.test(bloc)) casse('l\'accueil français a perdu son <h1> orienté besoin')
const hero = codeSeul('components/accueil/HeroDepart.tsx')
if (/<h1/.test(hero)) casse('le hero de l\'accueil a repris un <h1> — deux h1 sur la page la plus affichée du site')

// ── 3. hreflang : les pages divergentes n'en déclarent plus ──
const hre = readFileSync('lib/hreflang.ts', 'utf8')
if (!/aDiverge/.test(hre)) casse('la liste des pages divergentes a disparu de lib/hreflang.ts')
for (const [f, motif] of [
  [fichierRoute('page.tsx'), /languages: \{ fr: FR_URL/],
  [fichierRoute('destinations/[city]/page.tsx'), /languages: \{/],
  [fichierRoute('layout.tsx'), /languages: \{\s*\n\s*fr:/],
]) {
  if (motif.test(readFileSync(f, 'utf8'))) casse(`${f} redéclare un hreflang sur une page qui a divergé`)
}

// ── 4. les pages aéroport ne s'inventent rien ──
const aero = readFileSync(fichierRoute('prayer-room/[airport]/page.tsx'), 'utf8')
if (!/generateStaticParams/.test(aero) || !/lireBase\(\)\.map/.test(aero)) casse('les pages aéroport ne sont plus générées depuis le relevé — une page pourrait exister sans données')
if (!/not recorded/.test(aero)) casse('la mention « non relevé » a disparu des pages aéroport : un terminal pourrait être présenté comme connu')
if (!/OpenStreetMap contributors/.test(aero)) casse('le crédit ODbL a disparu des pages aéroport')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ SEO : titres sans mot creux, socles SSR en place, hreflang honnêtes, pages aéroport sourcées.')
