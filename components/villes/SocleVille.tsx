import Link from 'next/link'
import { compteurVille } from '@/lib/mosqueesOsm'
import { conforme } from '@/lib/conformite'
import { estLatinLisible } from '@/lib/latin.mjs'
import { countryEn } from '@/lib/poiI18n'
import { sansChiffreNonSource } from '@/lib/prose.mjs'

// 📜 LE SOCLE — LA PAGE VILLE TELLE QUE GOOGLE LA LIT.
//
// Mesure du 20 août, JavaScript désactivé sur /destinations/marrakech :
// 1 092 caractères, ZÉRO <h1>, ZÉRO <h2> — c'est-à-dire la barre de
// navigation et le pied de page. Tout le contenu de la ville n'existait
// que dans le flux Immersion, chargé après coup en JavaScript. 354 pages
// invisibles : le référencement se fait page par page, et ces pages
// n'avaient pas de page.
//
// Le socle rétablit ce que le 19 août avait fait supprimer (« ce qui est
// en dessous, soit on le supprime, soit on le refait — en attendant on
// supprime parce que c'est très mal fait ») : REFAIT, cette fois, dans le
// noir du design system, sous le flux, avec UNIQUEMENT des données de la
// base — compteurs comptés ici, noms réels, sections éditoriales quand
// elles existent. Aucune phrase inventée, aucun chiffre improvisé.
//
// Règle des titres (skill « ce-que-google-affiche ») : le BESOIN d'abord
// (« Où prier à… »), un CHIFFRE vérifiable, jamais la marque, jamais
// « guide complet » ni « tout savoir ».

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VilleData = any

/** Un champ « anglais » de la base contient parfois du français resté en
 *  place (« Available in certains hotels and bars touristiques »). Sur le
 *  domaine anglais, ce fait est ALORS ABSENT : mieux vaut un trou qu'une
 *  phrase bancale sur la page que Google lit. */
const MOTS_FR = /\b(certains?|certaines?|dans|les|des|touristiques?|hôtels?|quartiers?|toutes?|tous|selon|avec|pour|sur|très|plupart)\b/i
const anglaisPropre = (s?: string) => (typeof s === 'string' && s.trim() && !MOTS_FR.test(s) ? s.trim() : undefined)

// 27 août : ce nettoyage coupait à l'intérieur des phrases et produisait
// « with a 9/5 » sur 172 descriptions (voir lib/prose.mjs). Le retrait se
// fait maintenant phrase par phrase, avec le retrait des comptes non
// sourcés — une seule porte, une seule règle.
const nettoyer = (s?: string) => {
  const t = sansChiffreNonSource(s)
  return t || undefined
}

export default function SocleVille({ ville, slug, en }: { ville: VilleData; slug: string; en: boolean }) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const nom = String((en && ville.nom_en) || ville.nom || '')
  const pays = countryEn(String(ville.pays || ''), en)

  // ── Les chiffres : comptés ICI, sur la base, jamais recopiés d'un texte ──
  const restos = ((ville.restaurants as { nom?: string; type?: string; halalConfidence?: string; quartier?: string }[]) ?? [])
    .filter((r) => conforme(r.nom, r.type, r.halalConfidence))
  const nbRestos = (ville.restaurantsTotal as number | undefined) ?? restos.length
  // ⚠️ Le filtre d'écriture latine sert à AFFICHER des noms lisibles ; il
  // ne doit pas servir à COMPTER. Mesuré sur Tokyo : le titre annonçait
  // 12 lieux de prière et le <h1> 3, parce que neuf noms japonais étaient
  // écartés de l'affichage — et donc du compte. Le chiffre est le même
  // partout : celui de la base.
  const mosqueesTotal = ((ville.mosqueesPrincipales as { nom?: string }[]) ?? []).filter((m) => m.nom)
  const mosquees = mosqueesTotal.filter((m) => estLatinLisible(m.nom!))
  const nbOsm = compteurVille(slug)
  const nbMosquees = nbOsm ?? mosqueesTotal.length
  const hotels = ((ville.hotels as { nom?: string }[]) ?? []).filter((h) => h.nom)
  const activites = ((ville.activites as { nom?: string }[]) ?? []).filter((a) => a.nom && estLatinLisible(a.nom))

  // ── Le titre : le besoin, puis le chiffre qui prouve ──
  const h1 = nbMosquees > 0 && nbRestos > 0
    ? t(`Où prier à ${nom} : ${nbMosquees} lieux de prière et ${nbRestos} adresses halal`,
        `Where to pray in ${nom}: ${nbMosquees} prayer places and ${nbRestos} halal addresses`)
    : nbMosquees > 0
      ? t(`Où prier à ${nom} : ${nbMosquees} lieux de prière relevés`, `Where to pray in ${nom}: ${nbMosquees} prayer places listed`)
      : t(`Voyager halal à ${nom}`, `Halal travel in ${nom}`)

  const ip = (en ? (ville.infos_pratiques_en as Record<string, string>) : (ville.infos_pratiques as Record<string, string>)) ?? {}
  const champ = (c: string) => (en ? anglaisPropre(ip[c]) : (typeof ip[c] === 'string' && ip[c].trim() ? ip[c].trim() : undefined))
  const alcool = champ('alcool')
  const monnaie = champ('monnaie')
  const langue = champ('langue')
  const periode = champ('meilleure_periode')

  const ouPrier = nettoyer(en ? ville.sectionOuPrier_en : ville.sectionOuPrier)
  const ouManger = nettoyer(en ? ville.sectionMangerHalal_en : ville.sectionMangerHalal)
  // 27 août : ce chapeau portait des comptes que la fiche dément (347 sur
  // 354 villes). Les phrases qui avancent un chiffre de lieux sont retirées
  // — les vrais comptes sont juste en dessous, et ceux-là sont comptés.
  const chapeau = nettoyer(en ? ville.description_en : ville.description)

  const proches = ((ville.villes_proches as { slug?: string; nom?: string }[]) ?? [])
    .filter((p) => p.slug && p.nom).slice(0, 4)

  return (
    <section className="sv" aria-label={t('Informations sur la ville', 'City information')}>
      <div className="sv-in">
        <h1 className="sv-h1">{h1}</h1>
        {chapeau && <p className="sv-chapeau">{chapeau}</p>}

        <p className="sv-p">
          {t(
            `${nom}${pays ? `, ${pays}` : ''} : nos relevés comptent ${nbMosquees.toLocaleString('fr-FR')} lieux de prière${nbOsm != null ? ' dans toute la ville' : ''}, ${nbRestos.toLocaleString('fr-FR')} adresses où manger halal${hotels.length ? ` et ${hotels.length} hôtels` : ''}. Chaque adresse porte sa source : rien n'est affiché sans origine vérifiable, et une donnée douteuse n'est pas affichée du tout.`,
            `${nom}${pays ? `, ${pays}` : ''}: our records list ${nbMosquees.toLocaleString('en-GB')} prayer places${nbOsm != null ? ' across the city' : ''}, ${nbRestos.toLocaleString('en-GB')} places to eat halal${hotels.length ? ` and ${hotels.length} hotels` : ''}. Every listing carries its source: nothing is shown without a traceable origin, and a doubtful record is not shown at all.`,
          )}
        </p>

        <h2 className="sv-h2">{t(`Où prier à ${nom}`, `Where to pray in ${nom}`)}</h2>
        {ouPrier && <p className="sv-p">{ouPrier}</p>}
        <p className="sv-p">
          {t(
            `Les horaires de prière de ${nom} sont calculés au fuseau de la ville, et la direction de la Qibla se lit depuis votre position. Sur place, « Autour de moi » classe les lieux de prière du plus proche au plus loin.`,
            `Prayer times for ${nom} are computed in the city's own time zone, and the Qibla direction reads from your position. On the ground, “Around me” ranks prayer places from nearest to farthest.`,
          )}
        </p>
        {mosquees.length > 0 && (
          <ul className="sv-liste">
            {mosquees.slice(0, 12).map((m, i) => <li key={i}>{m.nom}</li>)}
          </ul>
        )}

        <h2 className="sv-h2">{t(`Où manger halal à ${nom}`, `Where to eat halal in ${nom}`)}</h2>
        {ouManger && <p className="sv-p">{ouManger}</p>}
        {restos.length > 0 && (
          <>
            <p className="sv-p">
              {t(
                `Voici des adresses relevées à ${nom}. Le statut halal est indiqué comme vérifié ou signalé selon la source — jamais annoncé comme certifié.`,
                `Here are addresses recorded in ${nom}. Halal status is shown as verified or reported depending on the source — never announced as certified.`,
              )}
            </p>
            <ul className="sv-liste">
              {restos.slice(0, 12).map((r, i) => (
                <li key={i}>{r.nom}{r.type ? <span className="sv-gris"> · {r.type}</span> : null}</li>
              ))}
            </ul>
          </>
        )}

        {activites.length > 0 && (
          <>
            <h2 className="sv-h2">{t(`À faire à ${nom}`, `Things to do in ${nom}`)}</h2>
            <ul className="sv-liste">
              {activites.slice(0, 8).map((a, i) => <li key={i}>{a.nom}</li>)}
            </ul>
          </>
        )}

        {(alcool || monnaie || langue || periode) && (
          <>
            <h2 className="sv-h2">{t('À savoir avant de partir', 'Before you go')}</h2>
            <dl className="sv-faits">
              {langue && <><dt>{t('Langues', 'Languages')}</dt><dd>{langue}</dd></>}
              {monnaie && <><dt>{t('Monnaie', 'Currency')}</dt><dd>{monnaie}</dd></>}
              {alcool && <><dt>{t('Alcool', 'Alcohol')}</dt><dd>{alcool}</dd></>}
              {periode && <><dt>{t('Meilleure période', 'Best season')}</dt><dd>{periode}</dd></>}
            </dl>
          </>
        )}

        <h2 className="sv-h2">{t('Continuer', 'Keep going')}</h2>
        <ul className="sv-liens">
          <li><Link href={`/priere/${slug}`}>{t(`Horaires de prière à ${nom}`, `Prayer times in ${nom}`)}</Link></li>
          <li><Link href="/qibla">{t('Trouver la Qibla', 'Find the Qibla')}</Link></li>
          <li><Link href="/autour-de-moi">{t('Lieux de prière et restaurants autour de moi', 'Prayer places and restaurants around me')}</Link></li>
          <li><Link href="/destinations">{t('Toutes les destinations', 'All destinations')}</Link></li>
          {proches.map((p) => (
            <li key={p.slug}><Link href={`/destinations/${p.slug}`}>{t(`Voyager halal à ${p.nom}`, `Halal travel in ${p.nom}`)}</Link></li>
          ))}
        </ul>

        {nbOsm != null && (
          <p className="sv-source">{t('Lieux de prière : données © les contributeurs OpenStreetMap (ODbL).', 'Prayer places: data © OpenStreetMap contributors (ODbL).')}</p>
        )}
      </div>
    </section>
  )
}
