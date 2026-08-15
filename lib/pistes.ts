import type { Categorie, Criteres } from '@/lib/criteres'

// ✨ L'AIDE AU CHOIX — « que l'IA m'aide à choisir ».
//
// Ordre de Mohamed, 16 août : « Aujourd'hui, soit je sais exactement ce
// que je veux et j'écris, soit je suis bloqué. » Trois catégories, puis
// des pistes concrètes et cliquables, générées à partir du CONTEXTE RÉEL
// du moment : l'heure, la prochaine prière, le jour de la semaine.
//
// ════════ 🔴 UNE PISTE DOIT CHANGER CE QU'ON DEMANDE À GOOGLE ════════
//
// Défaut de Mohamed, 15 août : « "Petit prix", "tout près", "en famille",
// "pour s'asseoir" : quatre intentions différentes, quatre fois la même
// liste. Les boutons sont décoratifs. »
//
// LA CAUSE : chaque piste ne remplissait que des critères de FILTRAGE
// (budget, famille, mode). Or ces critères n'entrent pas dans la requête
// envoyée à Google — ils ne servent qu'à trier ce qu'il a déjà rendu. Les
// quatre boutons partaient donc sur la même recherche géographique, et
// filtraient les mêmes quinze adresses de quatre façons voisines.
//
// Chaque piste porte désormais des MOTS. Ces mots partent tels quels chez
// Google (via `requeteGoogle`), donc les quatre boutons interrogent
// réellement quatre choses différentes. Les critères de filtrage restent :
// ils affinent APRÈS, ils ne remplacent pas la demande.
//
// ════════ POURQUOI LES PISTES SONT ÉCRITES ICI, ET NON PAR LE MODÈLE ═══
//
// C'est la leçon directe de l'alerte rouge du 16 août. Une piste est du
// contenu comme un autre : si un modèle les inventait librement, il
// finirait par proposer « une terrasse pour l'apéro » ou « une brasserie
// sympa ». Ici, la liste des formulations possibles est FERMÉE : aucune
// piste ne peut mener à un lieu de boisson, parce qu'aucune n'existe.
//
// Ce qui est intelligent n'est pas la génération du texte — c'est le
// CHOIX de la piste selon le moment. À 23 h, on ne propose pas « déjeuner
// en famille » ; 20 minutes avant Maghrib, on propose ce qui est
// atteignable à pied.
//
// ════════ CE QU'UNE PISTE N'A PAS LE DROIT DE PROMETTRE ════════
//
// Jamais « certifié halal », jamais « garanti sans alcool ». On dit
// vérifié, signalé ou inconnu — jamais autre chose. Et jamais un
// équipement qu'on n'a pas : « espace femmes » est proposé avec « si
// renseigné », parce que c'est exactement ce que nous savons en dire.

export interface Piste {
  /** Identifiant stable — sert à la mesure. */
  id: string
  fr: string
  en: string
  /** Ce que la piste remplit toute seule dans les critères. */
  patch: Partial<Criteres>
}

export interface Contexte {
  /** Heure locale, 0-23. */
  heure: number
  /** Jour de la semaine, 0 = dimanche. */
  jour: number
  /** Nom de la prochaine prière et minutes restantes, quand on les sait. */
  priere?: { nom: string; minutes: number } | null
}

/**
 * LE CROISEMENT AVEC LA PRIÈRE — notre signature.
 * « Isha dans 56 min : 3 adresses où tu peux manger et prier avant. »
 * Une piste qui envoie quelqu'un rater sa prière est une mauvaise piste.
 */
const PRIERE_PROCHE_MIN = 75
const PRIERE_URGENTE_MIN = 30

export function pistes(cat: Categorie, ctx: Contexte, en: boolean): Piste[] {
  const p = ctx.priere
  const proche = p && p.minutes <= PRIERE_PROCHE_MIN
  const urgent = p && p.minutes <= PRIERE_URGENTE_MIN
  const tard = ctx.heure >= 21 || ctx.heure < 5
  const midi = ctx.heure >= 11 && ctx.heure < 14
  const L: Piste[] = []

  if (cat === 'mosquee') {
    if (urgent && p) {
      L.push({
        id: 'priere-urgente',
        fr: `${p.nom} dans ${p.minutes} min — atteignable à pied`,
        en: `${p.nom} in ${p.minutes} min — reachable on foot`,
        patch: { categorie: 'mosquee', mode: 'pied', moment: 'maintenant', ouvertMaintenant: true },
      })
    }
    L.push({
      id: 'plus-proche-pied',
      fr: 'La plus proche à pied, maintenant',
      en: 'The closest one on foot, right now',
      patch: { categorie: 'mosquee', mode: 'pied', moment: 'maintenant' },
    })
    L.push({
      id: 'en-voiture',
      fr: 'En voiture, un peu plus loin',
      en: 'By car, a bit further out',
      patch: { categorie: 'mosquee', mode: 'voiture', moment: 'maintenant' },
    })
    // « si renseigné » : on ne promet pas un équipement qu'on n'a pas.
    L.push({
      id: 'espace-femmes',
      fr: 'Avec un espace pour les femmes (si renseigné)',
      en: "With a women's area (if documented)",
      patch: { categorie: 'mosquee', famille: true, mode: 'pied', moment: 'maintenant' },
    })
    if (tard) {
      L.push({
        id: 'fajr-demain',
        fr: 'Pour Fajr demain, près d’ici',
        en: 'For Fajr tomorrow, near here',
        patch: { categorie: 'mosquee', mode: 'pied', moment: 'ce-soir' },
      })
    }
    return L.slice(0, 5)
  }

  if (cat === 'activite') {
    L.push({ id: 'enfants', fr: 'Avec des enfants', en: 'With kids', patch: { categorie: 'activite', famille: true, mode: 'voiture' } })
    L.push({ id: 'deux-heures', fr: 'En deux heures, à pied', en: 'Two hours, on foot', patch: { categorie: 'activite', mode: 'pied' } })
    L.push({ id: 'gratuit', fr: 'Sans rien dépenser', en: 'Without spending', patch: { categorie: 'activite', budget: 'petit', mode: 'pied' } })
    L.push({ id: 'abri', fr: 'À l’abri s’il pleut', en: 'Indoors if it rains', patch: { categorie: 'activite', mode: 'voiture' } })
    if (proche && p) {
      L.push({
        id: 'avant-priere',
        fr: `Court, avant ${p.nom} (${p.minutes} min)`,
        en: `Short, before ${p.nom} (${p.minutes} min)`,
        patch: { categorie: 'activite', mode: 'pied', ouvertMaintenant: true },
      })
    }
    return L.slice(0, 5)
  }

  // ── MANGER : c'est ici que l'heure change tout ──────────────────────
  if (proche && p) {
    L.push({
      id: 'manger-et-prier',
      fr: `${p.nom} dans ${p.minutes} min : manger et prier avant`,
      en: `${p.nom} in ${p.minutes} min: eat and pray before`,
      patch: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true, moment: 'maintenant', motsCles: 'rapide' },
    })
  }
  if (tard) {
    // À 23 h, la plupart ferment : on le dit dans le libellé même.
    L.push({ id: 'encore-ouvert', fr: 'Encore ouvert maintenant', en: 'Still open right now', patch: { categorie: 'manger', ouvertMaintenant: true, moment: 'maintenant', motsCles: 'ouvert tard' } })
    L.push({ id: 'a-emporter', fr: 'À emporter, rapide', en: 'Takeaway, quick', patch: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true, motsCles: 'à emporter rapide' } })
    L.push({ id: 'patisserie-ramener', fr: 'Une pâtisserie pour ramener', en: 'A pastry to take home', patch: { categorie: 'manger', quoi: 'patisserie', ouvertMaintenant: true, motsCles: 'pâtisserie' } })
  } else if (midi) {
    L.push({ id: 'dejeuner-rapide', fr: 'Déjeuner rapide, tout près', en: 'Quick lunch, very close', patch: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true, motsCles: 'rapide midi' } })
    L.push({ id: 'en-famille', fr: 'En famille, pour s’asseoir', en: 'With family, sit-down', patch: { categorie: 'manger', famille: true, compagnie: 'famille', motsCles: 'familial enfants salle' } })
    L.push({ id: 'petit-prix', fr: 'Petit prix', en: 'Cheap', patch: { categorie: 'manger', budget: 'petit', mode: 'pied', motsCles: 'pas cher petit prix' } })
  } else {
    L.push({ id: 'pas-cher-pres', fr: 'Pas cher, tout près', en: 'Cheap, very close', patch: { categorie: 'manger', budget: 'petit', mode: 'pied', motsCles: 'pas cher petit prix' } })
    L.push({ id: 'en-famille', fr: 'En famille, pour s’asseoir', en: 'With family, sit-down', patch: { categorie: 'manger', famille: true, compagnie: 'famille', motsCles: 'familial enfants salle' } })
    L.push({ id: 'a-emporter', fr: 'À emporter, rapide', en: 'Takeaway, quick', patch: { categorie: 'manger', mode: 'pied', motsCles: 'à emporter rapide' } })
    L.push({ id: 'cafe-patisserie', fr: 'Un café, une pâtisserie', en: 'Coffee and pastry', patch: { categorie: 'manger', quoi: 'patisserie', mode: 'pied', motsCles: 'pâtisserie café' } })
  }
  return L.slice(0, 5)
}

/**
 * ✨ « JE NE SAIS PAS — CHOISIS POUR MOI ».
 *
 * 🔴🔴 DÉFAUT LE PLUS GRAVE DU SITE, corrigé le 15 août.
 *
 * Mohamed : « J'ai sélectionné PRIER. J'ai cliqué "Je ne sais pas — choisis
 * pour moi". Le site m'a répondu AL AMIR, traiteur, spécialités libanaises,
 * avec des photos de houmous. Je cherchais un lieu de prière. On m'a servi
 * un restaurant. C'est le site qui se moque de lui. »
 *
 * LA CAUSE ÉTAIT ICI, et elle est nette : cette fonction décidait ELLE-MÊME
 * de la catégorie. Elle renvoyait `categorie: 'manger'` selon l'heure, et
 * l'appelant faisait `{ ...crit, ...d.criteres }` — donc « manger » écrasait
 * le « mosquée » que le visiteur venait de choisir d'un appui.
 *
 * LA RÈGLE, désormais sans exception : le raccourci RESPECTE L'ONGLET ACTIF.
 * Il choisit le MOMENT, le MODE, l'OUVERTURE — jamais la catégorie. Ce n'est
 * pas au site de décider qu'on cherchait autre chose que ce qu'on a demandé.
 *
 * Un appui, aucune question. La phrase renvoyée explique le RAISONNEMENT —
 * c'est ce qui distingue « on a deviné » de « on a choisi pour toi ».
 */
export function choisirPourMoi(cat: Categorie, ctx: Contexte, en: boolean): { criteres: Partial<Criteres>; raison: string } {
  const p = ctx.priere
  const tard = ctx.heure >= 21 || ctx.heure < 5
  const urgent = p && p.minutes <= PRIERE_URGENTE_MIN

  // 🕌 L'ONGLET PRIER : on choisit parmi des MOSQUÉES, point.
  if (cat === 'mosquee') {
    if (urgent && p) {
      return {
        criteres: { categorie: 'mosquee', mode: 'pied', moment: 'maintenant', ouvertMaintenant: true },
        raison: en
          ? `${p.nom} is in ${p.minutes} minutes — I am looking for a prayer place you can reach on foot in time.`
          : `${p.nom} est dans ${p.minutes} minutes — je cherche un lieu de prière que tu peux atteindre à pied à temps.`,
      }
    }
    return {
      criteres: { categorie: 'mosquee', mode: 'pied', moment: 'maintenant' },
      raison: p
        ? (en
          ? `${p.nom} is in ${p.minutes} minutes — here are the closest prayer places.`
          : `${p.nom} est dans ${p.minutes} minutes — voici les lieux de prière les plus proches.`)
        : (en ? 'Here are the closest prayer places.' : 'Voici les lieux de prière les plus proches.'),
    }
  }

  // 🎯 L'ONGLET QUE FAIRE : des activités, jamais un restaurant déguisé.
  if (cat === 'activite') {
    return {
      criteres: { categorie: 'activite', mode: 'voiture' },
      raison: tard
        ? (en ? 'It is late — here is what is still open.' : "Il est tard — voici ce qui est encore ouvert.")
        : (en ? 'Here is what is worth seeing around you right now.' : "Voici ce qui vaut le détour autour de toi, maintenant."),
    }
  }

  // 🍽️ L'ONGLET MANGER : c'est ici, et seulement ici, que l'heure décide.
  if (urgent && p) {
    return {
      criteres: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true, moment: 'maintenant' },
      raison: en
        ? `${p.nom} is in ${p.minutes} minutes — I am looking for somewhere close enough to eat and still pray on time.`
        : `${p.nom} est dans ${p.minutes} minutes — je cherche assez près pour manger et prier à l'heure.`,
    }
  }
  if (tard) {
    return {
      criteres: { categorie: 'manger', ouvertMaintenant: true, moment: 'maintenant', mode: 'pied' },
      raison: en
        ? 'It is late and most places are closed — here are the ones still open, closest first.'
        : "Il est tard et la plupart sont fermées — voici celles encore ouvertes, la plus proche d'abord.",
    }
  }
  if (p && p.minutes <= PRIERE_PROCHE_MIN) {
    return {
      criteres: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true, moment: 'maintenant' },
      raison: en
        ? `${p.nom} is in ${p.minutes} minutes — I am looking for somewhere close enough to eat and still pray on time.`
        : `${p.nom} est dans ${p.minutes} minutes — je cherche assez près pour manger et prier à l'heure.`,
    }
  }
  return {
    criteres: { categorie: 'manger', mode: 'pied', ouvertMaintenant: true },
    raison: en
      ? 'Nothing urgent right now — here is what is open and closest to you.'
      : "Rien d'urgent pour l'instant — voici ce qui est ouvert et le plus proche de toi.",
  }
}
