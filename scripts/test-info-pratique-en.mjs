#!/usr/bin/env node
// 🚦 GARDE-FOU : aucune info pratique en français sur le domaine anglais.
//
// Défaut mesuré le 15 août : 189 fiches sur 354 servaient leur bloc
// « infos pratiques » en français sur gohalaltravel.com. La règle vit
// dans lib/infoPratiqueEn.mjs ; ce test l'éprouve sur TOUTES les valeurs
// réellement présentes dans data/villes, et mesure sa couverture.
//
// Deux choses le font échouer :
//   1. une valeur traduite qui contient encore du français (bug de règle) ;
//   2. une couverture qui retombe sous le seuil (une fiche nouvelle a
//      introduit une formulation inconnue — il faut l'ajouter au
//      dictionnaire, sinon la ligne disparaît des fiches anglaises).
//
// ⚠️ En .mjs, et c'est délibéré : un garde-fou branché sur le build ne
// doit jamais dépendre d'un drapeau expérimental de Node.
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const { infoPratiqueEn, contientDuFrancais } = await import('../lib/infoPratiqueEn.mjs')

const DOSSIER = path.join(process.cwd(), 'data', 'villes')
const CHAMPS = ['visa', 'vaccins', 'transport', 'priseElectrique', 'decalageHoraire']
const RACINE = ['monnaie', 'meilleureEpoque', 'langue']
const SEUIL = 92 // % des valeurs qui doivent être traduisibles

let total = 0, traduites = 0, restesFr = 0
const inconnues = new Map()

for (const f of readdirSync(DOSSIER).filter((x) => x.endsWith('.json'))) {
  let v
  try { v = JSON.parse(readFileSync(path.join(DOSSIER, f), 'utf-8')) } catch { continue }
  const valeurs = []
  const ip = v.infoPratique ?? {}
  for (const c of CHAMPS) if (typeof ip[c] === 'string') valeurs.push([c, ip[c]])
  for (const c of RACINE) if (typeof v[c] === 'string') valeurs.push([c, v[c]])

  for (const [champ, brut] of valeurs) {
    if (!brut.trim()) continue
    total++
    const en = infoPratiqueEn(brut)
    if (en == null) {
      inconnues.set(`${champ} — ${brut}`, (inconnues.get(`${champ} — ${brut}`) ?? 0) + 1)
      continue
    }
    traduites++
    if (contientDuFrancais(en)) {
      restesFr++
      console.error(`  ✗ traduit mais encore français — ${champ} : « ${brut} » → « ${en} »`)
    }
  }
}

const couverture = total ? Math.round((traduites / total) * 100) : 100
console.log(`\nInfos pratiques sur le domaine anglais — ${total} valeurs`)
console.log(`   couverture de la règle : ${couverture} % (${traduites}/${total})`)
if (inconnues.size) {
  console.log(`   non traduisibles (ligne masquée en anglais) : ${[...inconnues.values()].reduce((a, b) => a + b, 0)}`)
  ;[...inconnues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([k, n]) => console.log(`      ${String(n).padStart(3)}× ${k.slice(0, 90)}`))
}

if (restesFr) {
  console.error(`\n❌ ${restesFr} valeur(s) traduite(s) contiennent encore du français.\n`)
  process.exit(1)
}
if (couverture < SEUIL) {
  console.error(`\n❌ couverture ${couverture} % < ${SEUIL} % — ajoute les formulations ci-dessus à lib/infoPratiqueEn.ts (et .mjs).\n`)
  process.exit(1)
}
console.log('✅ aucune info pratique française ne part sur le domaine anglais.\n')
