// 🔗 UN HREFLANG EST UNE BIJECTION — et trois guides anglais avaient DEUX
// « versions françaises » déclarées.
//
// Trouvé le 3 octobre. `GUIDES_FR_TO_EN` contenait trois clés dont la page
// française n'existe nulle part dans le dépôt :
//
//   voyage-halal-istanbul-guide-2026   -> istanbul-halal-travel-guide
//   voyage-halal-dubai-guide-2026      -> dubai-halal-travel-guide-2026
//   voyage-halal-marrakech-guide-2026  -> marrakech-halal-travel-guide
//
// Chacune de ces trois cibles anglaises était DÉJÀ le jumeau d'une page
// française réelle. Résultat : Google s'entendait dire que deux pages
// françaises sont chacune « la version française » de la même page anglaise
// — exactement la concurrence interne que cette table sert à empêcher.
//
// Le même soir, une seconde faute de la même famille : la ligne
// 'restaurants-halal-paris' -> '/blog/halal-travel-france-2026' appairait un
// annuaire de restaurants parisiens (157 mots) avec un guide sur la France
// entière (843 mots). Vérifié SERVI des deux côtés avant de conclure : le
// hreflang partait bien sur les deux domaines. Le vrai pendant français
// existait et n'avait, lui, aucun jumeau.
//
// 🔴 CE QUE CE TEST TIENT. Trois propriétés, toutes vérifiables :
//   1. la cible existe   — sinon on annonce une URL qui n'est pas une page ;
//   2. la clé existe     — une clé morte ne fait rien, sauf fausser le compte
//                          et créer de faux doublons comme ce soir ;
//   3. c'est une bijection — jamais deux clés vers la même cible.
//
// Ce qu'il ne tient PAS, et qu'il faut dire : **il ne juge pas si les deux
// pages parlent du même sujet.** Ça, ça se lit. Les deux fautes de ce soir
// sont de nature différente : la première est mécanique et se garde ; la
// seconde demandait de comparer deux titres à la main.
//
// ⚠️ Détection de la langue : `lang` s'écrit dans ce dépôt avec des
// apostrophes ET des guillemets (`lang: 'en'` et `lang: "en"`). Une regex qui
// n'en connaît qu'une classe à tort quatre articles anglais comme français —
// c'est arrivé le 1er septembre, puis de nouveau le 3 octobre, sur MA mesure.
// D'où la classe de caractères ci-dessous, et ce commentaire.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ⚠️ Les articles ne vivent pas tous dans `lib/data.ts` : les guides anglais
// sont dans `lib/guidesEn.ts`. Ma première version de ce test ne lisait que
// data.ts et déclarait 21 cibles « inexistantes » — toutes bien réelles. Une
// mesure qui accuse tout un bloc d'un coup accuse d'abord son instrument.
const data = ['lib/data.ts', 'lib/guidesEn.ts'].map((f) => readFileSync(f, 'utf8')).join('\n')
const slugsSrc = readFileSync('lib/slugs.ts', 'utf8')

// Les slugs réellement présents, avec leur langue — guillemets OU apostrophes.
const reperes = [...data.matchAll(/slug: ['"]([a-z0-9-]+)['"]/g)].map((m) => ({ slug: m[1], i: m.index }))
const LANG = new Map()
reperes.forEach((a, k) => {
  const corps = data.slice(a.i, k + 1 < reperes.length ? reperes[k + 1].i : data.length)
  LANG.set(a.slug, /lang: ['"]en['"]/.test(corps) ? 'en' : 'fr')
})

const bloc = (nom) => {
  const i = slugsSrc.indexOf(`export const ${nom}`)
  if (i < 0) return ''
  return slugsSrc.slice(i, slugsSrc.indexOf('\n}', i))
}

for (const nom of ['BLOG_FR_TO_EN', 'GUIDES_FR_TO_EN']) {
  const src = bloc(nom)
  if (!src) { casse(`${nom} introuvable dans lib/slugs.ts`); continue }
  const paires = [...src.matchAll(/^\s*'([a-z0-9-]+)':\s*'([^']+)'/gm)].map((m) => [m[1], m[2]])
  if (!paires.length) casse(`${nom} ne déclare plus aucune paire`)

  // 3. bijection
  const parCible = new Map()
  for (const [fr, en] of paires) {
    if (!parCible.has(en)) parCible.set(en, [])
    parCible.get(en).push(fr)
  }
  for (const [en, frs] of parCible) {
    if (frs.length > 1) {
      casse(`${nom} : « ${en} » est déclarée la version anglaise de ${frs.length} pages françaises (${frs.join(', ')}).\n   Un hreflang est une bijection — là, deux de nos pages se concurrencent.`)
    }
  }

  for (const [fr, cible] of paires) {
    // 2. la clé française existe
    if (!LANG.has(fr)) {
      // les hubs (/hotels/istanbul…) ne sont pas des articles : on ne juge que
      // les clés qui prétendent désigner un article du dépôt.
      casse(`${nom} : la clé « ${fr} » ne correspond à aucun article (lib/data.ts, lib/guidesEn.ts).\n   Une clé morte ne sert rien et crée de faux doublons de cible.`)
    } else if (LANG.get(fr) !== 'fr') {
      casse(`${nom} : « ${fr} » est côté FRANÇAIS de la table mais l'article porte lang: 'en'.`)
    }

    // 1. la cible existe — sauf les routes non-article, qui sont légitimes
    const slugCible = cible.replace(/^\/(blog|guides)\//, '')
    const routeNonArticle = /^\/(hotels|destinations|guide-vivant|trouvailles)\//.test(cible)
    if (routeNonArticle) continue
    if (!LANG.has(slugCible)) {
      casse(`${nom} : la cible « ${cible} » ne correspond à aucun article (lib/data.ts, lib/guidesEn.ts).`)
    } else if (LANG.get(slugCible) !== 'en') {
      casse(`${nom} : la cible « ${slugCible} » ne porte pas lang: 'en' — le hreflang annoncerait une page française comme version anglaise.`)
    }
  }
}

if (fautes) {
  console.error(`\n${fautes} faute(s) — build arrêté.`)
  process.exit(1)
}
console.log(`✅ jumeaux : les paires FR↔EN existent des deux côtés, dans la bonne langue, et aucune cible n'a deux versions françaises.`)
