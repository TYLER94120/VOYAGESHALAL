// 🧭 CE QUI TRANSFORME UN MUR DE TEXTE EN GUIDE LISIBLE.
//
// Deux traitements appliqués au HTML des guides au moment du rendu, sans
// toucher au contenu écrit — donc valables d'un coup pour les 24 guides,
// français comme anglais :
//
//   1. chaque <h2> reçoit un identifiant stable, pour que le sommaire
//      puisse y renvoyer et que les liens profonds fonctionnent ;
//   2. on en extrait la liste des sections, qui devient le sommaire.
//
// POURQUOI. Nos guides comptent de 8 à 14 sections. Sans sommaire, le
// lecteur qui cherche « où prier » doit faire défiler tout le texte, et
// conclut que la page est mal faite — il a raison.

export interface Section {
  id: string
  titre: string
}

/** Identifiant d'ancre lisible et stable, dérivé du titre de section. */
export function ancre(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/**
 * Ajoute les ancres aux <h2> et renvoie le sommaire.
 * Les identifiants déjà présents sont respectés.
 */
export function preparerGuide(html: string): { html: string; sections: Section[] } {
  const sections: Section[] = []
  const vus = new Set<string>()
  const sortie = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (tout, attrs: string, contenu: string) => {
    const titre = contenu.replace(/<[^>]+>/g, '').trim()
    if (!titre) return tout
    const dejaId = attrs.match(/id="([^"]+)"/)
    let id = dejaId ? dejaId[1] : ancre(titre)
    // Deux sections au même intitulé arrivent : on ne veut pas deux ancres
    // identiques, le navigateur sauterait toujours sur la première.
    let n = 2
    while (vus.has(id)) id = `${ancre(titre)}-${n++}`
    vus.add(id)
    sections.push({ id, titre })
    return dejaId ? tout : `<h2${attrs} id="${id}">${contenu}</h2>`
  })
  return { html: sortie, sections }
}
