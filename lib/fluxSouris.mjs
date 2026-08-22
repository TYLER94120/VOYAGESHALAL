// 🖱 « LE SWIPE NE MARCHE PAS SUR PC » — Mohamed, 22 août.
//
// Le pourquoi est mesuré dans lib/flux.mjs : sur un ordinateur, un cran de
// molette (~100 px) est plus court que la moitié d'un panneau, et le
// collage « scroll-snap: mandatory » ramenait à chaque fois au panneau
// courant. Le flux ne bougeait donc JAMAIS à la molette, et les flèches
// faisaient défiler la PAGE derrière lui.
//
// Ce fichier donne au flux les deux gestes qu'un ordinateur possède :
// la molette (un cran = un panneau, comme un coup de pouce) et le clavier
// (↑ ↓, Page haut / Page bas, Espace).
//
// ⚠️ Pourquoi du .mjs sans React : pour que le banc d'essai du navigateur
// charge EXACTEMENT le code livré (scripts/test-swipe-pc.mjs). Un test qui
// rejoue une copie de la logique ne prouve rien sur la logique livrée.
//
// Deux règles de politesse :
//   1. arrivé au dernier panneau, on rend la main : la page continue vers
//      le socle sous le flux. Un flux qui retient le défilement est un
//      cul-de-sac.
//   2. le clavier ne prend la main que si le flux est à l'écran et qu'on
//      n'écrit pas dans un champ.
// Le tactile n'est pas touché : « wheel » n'existe pas au doigt.
import { panneauVise, panneauCourant } from './flux.mjs'

const CLASSES = ['imm-panneau', 'flux-slide']
const DUREE_ANIM = 520

/**
 * Branche molette et clavier sur un flux à panneaux.
 * @param {HTMLElement} el le conteneur qui défile
 * @returns {() => void} la fonction qui débranche tout
 */
export function brancherFluxSouris(el) {
  if (!el) return () => {}
  let jusqua = 0 // fin de l'animation : on ignore l'élan du pavé tactile

  const panneaux = () => [...el.children].filter((c) => CLASSES.some((k) => c.classList.contains(k)))

  /** @returns {boolean} vrai si le flux a pris le geste en charge. */
  const aller = (sens) => {
    const ps = panneaux()
    if (ps.length < 2) return false
    const i = panneauCourant(el.scrollTop, el.clientHeight)
    const j = panneauVise(i, sens, ps.length)
    if (j == null) return false
    jusqua = Date.now() + DUREE_ANIM
    el.scrollTo({ top: ps[j].offsetTop - ps[0].offsetTop, behavior: 'smooth' })
    return true
  }

  const molette = (e) => {
    if (e.ctrlKey || Math.abs(e.deltaY) < 4) return // zoom, ou tremblement
    if (Date.now() < jusqua) { e.preventDefault(); return } // élan du pavé tactile
    if (aller(e.deltaY > 0 ? 1 : -1)) e.preventDefault()
  }

  const clavier = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const a = document.activeElement
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable)) return
    const sens = e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ' ? 1
      : e.key === 'ArrowUp' || e.key === 'PageUp' ? -1
      : 0
    if (!sens) return
    // Le flux doit être devant les yeux : plus bas dans la page, les
    // flèches redeviennent celles du navigateur.
    const r = el.getBoundingClientRect()
    if (r.bottom < 120 || r.top > window.innerHeight - 120) return
    if (aller(sens)) e.preventDefault()
  }

  el.addEventListener('wheel', molette, { passive: false })
  window.addEventListener('keydown', clavier)
  return () => {
    el.removeEventListener('wheel', molette)
    window.removeEventListener('keydown', clavier)
  }
}
