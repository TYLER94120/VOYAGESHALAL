// 🗄 OÙ VIT LE FICHIER D'UNE ROUTE — depuis le chantier cache du 25 août.
//
// Le site a trois layouts racine, donc des GROUPES de routes :
//   app/(dyn)/guides/page.tsx   sert  /guides
//   app/(fr)/destinations/…     sert  /destinations/…
// Les parenthèses n'apparaissent jamais dans l'URL. Un test qui écrit en
// dur « app/guides/page.tsx » casse au premier déplacement — et il casse
// en annonçant un faux défaut, ce qui est pire qu'un test absent.
import { existsSync, readdirSync } from 'node:fs'

const GROUPES = () => readdirSync('app', { withFileTypes: true })
  .filter((e) => e.isDirectory() && e.name.startsWith('(') && e.name.endsWith(')'))
  .map((e) => e.name)

/** Le chemin réel du fichier d'une route, groupes compris. */
export function fichierRoute(relatif) {
  const direct = `app/${relatif}`
  if (existsSync(direct)) return direct
  for (const g of GROUPES()) {
    const p = `app/${g}/${relatif}`
    if (existsSync(p)) return p
  }
  return direct // laisse l'appelant échouer avec un chemin lisible
}
