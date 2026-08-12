import type { Metadata } from 'next'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO } from '@/lib/domain'

// 🔐 POLITIQUE DE CONFIDENTIALITÉ — servie sur les DEUX domaines.
//
// ⚠️ DÉFAUT TROUVÉ EN MESURANT (scripts/audit-langue.mjs, 11 août) :
// gohalaltravel.com/privacy renvoyait un titre anglais… et 579 mots de
// texte français (51 mots outils français contre 11 anglais). Seules les
// métadonnées avaient été traduites ; la page, elle, ne l'avait jamais été.
// C'est le défaut décrit par la compétence servir-deux-domaines, et sur la
// pire page possible : celle qu'un utilisateur lit précisément parce qu'il
// se méfie, et celle que réclament les magasins d'applications.
//
// Elle passait sous le radar parce qu'aucun lien de navigation ne la met en
// avant : on n'y va que délibérément, ou depuis Google.
//
// Rien n'a été inventé au passage : l'adresse de contact reste celle qui
// existe réellement (contact@voyageshalal.fr), et les services tiers cités
// sont ceux que le code appelle vraiment.

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'Privacy policy' : 'Politique de confidentialité',
    description: isEN
      ? 'GoHalalTravel privacy policy: no personal data collected, location never stored, favorites and settings kept only on your device.'
      : "Aucune donnée personnelle collectée, position jamais enregistrée : vos favoris et réglages restent sur votre appareil. La politique de confidentialité en clair.",
    alternates: {
      canonical: `${siteUrl}${isEN ? '/privacy' : '/confidentialite'}`,
      languages: {
        fr: 'https://www.voyageshalal.fr/confidentialite',
        en: 'https://www.gohalaltravel.com/privacy',
        'x-default': 'https://www.gohalaltravel.com/privacy',
      },
    },
    robots: { index: true, follow: true },
    openGraph: { url: `${siteUrl}${isEN ? '/privacy' : '/confidentialite'}` },
  }
}

const MAJ_FR = '30 juin 2026'
const MAJ_EN = '30 June 2026'

export default async function ConfidentialitePage() {
  const { isEN } = await getDomainSEO()
  const marque = isEN ? 'GoHalalTravel' : 'VoyagesHalal'

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      {/* Hero sombre */}
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '4rem 1.5rem 3rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>✦ {isEN ? 'Legal' : 'Légal'}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
            {isEN ? <>Privacy <em style={{ color: 'var(--or)' }}>policy</em></> : <>Politique de <em style={{ color: 'var(--or)' }}>confidentialité</em></>}
          </h1>
          <p style={{ color: 'var(--or-clair)', opacity: 0.85, marginTop: '0.75rem' }}>
            {isEN ? `Last updated: ${MAJ_EN}` : `Dernière mise à jour : ${MAJ_FR}`}
          </p>
        </div>
      </section>

      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }} className="legal-prose">
        <p>
          {isEN
            ? `${marque} (“the app”) helps Muslim travelers find mosques, halal restaurants and well-located hotels, along with prayer times and the Qibla direction. We take your privacy seriously.`
            : `${marque} (« l'application ») aide les voyageurs musulmans à trouver des mosquées, des restaurants halal et des hôtels bien situés, ainsi que les horaires de prière et la direction de la Qibla. Nous attachons une grande importance à votre vie privée.`}
        </p>

        <div className="legal-box">
          <h2>{isEN ? 'In short' : 'En résumé'}</h2>
          <ul>
            {(isEN
              ? [
                'No account required — no sign-up, no identity.',
                'No personal data collected on a server — no user database.',
                'Favorites and settings stay on your phone (local storage).',
                'Your location is never recorded or sent to our servers.',
              ]
              : [
                "Aucun compte requis — pas d'inscription, pas d'identité.",
                "Aucune donnée personnelle collectée sur un serveur — pas de base d'utilisateurs.",
                'Favoris et réglages restent sur votre téléphone (stockage local).',
                "Votre position n'est jamais enregistrée ni envoyée à nos serveurs.",
              ]
            ).map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>

        <h2>{isEN ? '1. Location data' : '1. Données de localisation'}</h2>
        <p>
          {isEN
            ? 'With your permission, the app accesses your location only while you are using it, to show nearby halal places and to calculate prayer times and the Qibla. Your location is used in real time on your device; it is neither stored nor sent to us. To search for mosques around you, approximate coordinates may be sent to the OpenStreetMap (Overpass) mapping service, without any data that could identify you. You can refuse or revoke this permission at any time; the app remains usable by choosing a city manually.'
            : "Avec votre autorisation, l'application accède à votre position uniquement pendant son utilisation, pour afficher les lieux halal proches et calculer les horaires de prière et la Qibla. Votre position est utilisée en temps réel sur votre appareil ; elle n'est ni stockée ni transmise à VoyagesHalal. Pour rechercher les mosquées autour de vous, des coordonnées approximatives peuvent être envoyées au service cartographique OpenStreetMap (Overpass), sans aucune donnée permettant de vous identifier. Vous pouvez refuser ou révoquer cette autorisation à tout moment ; l'application reste utilisable en choisissant une ville manuellement."}
        </p>

        <h2>{isEN ? '2. Notifications' : '2. Notifications'}</h2>
        <p>
          {isEN
            ? 'If you turn them on, the app schedules local notifications to remind you of prayer times. They are generated on your device; no notification is sent from a server and no data is collected.'
            : "Si vous l'activez, l'application programme des notifications locales pour vous rappeler les heures de prière. Elles sont générées sur votre appareil ; aucune notification n'est envoyée depuis un serveur et aucune donnée n'est collectée."}
        </p>

        <h2>{isEN ? '3. Data stored on your device' : '3. Données stockées sur votre appareil'}</h2>
        <p>
          {isEN
            ? 'Stored locally and never leaving the device: your favorites, your settings (prayer calculation method, notifications) and an offline copy of the cities you have viewed. You can erase everything by uninstalling the app.'
            : "Sont enregistrés localement et ne quittent jamais l'appareil : vos favoris, vos réglages (méthode de calcul des prières, notifications) et une copie hors-ligne des villes consultées. Vous pouvez tout supprimer en désinstallant l'application."}
        </p>

        <h2>{isEN ? '4. Third-party services' : '4. Services tiers'}</h2>
        <ul>
          {isEN ? (
            <>
              <li><strong>VoyagesHalal API (voyageshalal.fr)</strong> — the same service also powers gohalaltravel.com: list of cities, restaurants, hotels, activities. Requests carry no personal data.</li>
              <li><strong>OpenStreetMap / Overpass</strong> — nearby mosques (see §1).</li>
              <li><strong>Maps &amp; directions / booking</strong> — “Directions” or “Book” opens an external app (Google Maps, Booking…), governed by its own privacy policy.</li>
            </>
          ) : (
            <>
              <li><strong>API VoyagesHalal (voyageshalal.fr)</strong> : liste des villes, restaurants, hôtels, activités. Requêtes sans données personnelles.</li>
              <li><strong>OpenStreetMap / Overpass</strong> : mosquées à proximité (voir §1).</li>
              <li><strong>Cartes &amp; itinéraires / réservation</strong> : « Itinéraire » ou « Réserver » ouvre une app externe (Google Maps, Booking…), régie par sa propre politique de confidentialité.</li>
            </>
          )}
        </ul>

        <h2>{isEN ? '5. No advertising, no tracking' : '5. Aucune publicité, aucun traçage'}</h2>
        <p>
          {isEN
            ? 'The app contains no advertising, does not track your behavior and shares no data for commercial purposes.'
            : "L'application ne contient pas de publicité, ne suit pas votre comportement et ne partage aucune donnée à des fins commerciales."}
        </p>

        <h2>{isEN ? '6. Children' : '6. Enfants'}</h2>
        <p>
          {isEN
            ? 'The app is not specifically aimed at children and does not knowingly collect any data concerning them.'
            : "L'application ne s'adresse pas spécifiquement aux enfants et ne collecte sciemment aucune donnée les concernant."}
        </p>

        <h2>{isEN ? '7. Your rights (GDPR)' : '7. Vos droits (RGPD)'}</h2>
        <p>
          {isEN
            ? 'As no personal data is kept on our servers, these rights are exercised essentially by uninstalling the app, which erases all local data.'
            : "Aucune donnée personnelle n'étant conservée sur nos serveurs, ces droits s'exercent essentiellement en désinstallant l'application (ce qui efface toutes les données locales)."}
        </p>

        <h2>{isEN ? '8. Changes' : '8. Modifications'}</h2>
        <p>
          {isEN
            ? 'This policy may be updated; the date at the top indicates the latest version.'
            : 'Cette politique peut être mise à jour ; la date en haut indique la dernière version.'}
        </p>

        <h2>{isEN ? '9. Contact' : '9. Contact'}</h2>
        <p>
          {isEN ? 'For any question: ' : 'Pour toute question : '}
          <a href="mailto:contact@voyageshalal.fr">contact@voyageshalal.fr</a>
        </p>
      </article>

      <style>{`
        .legal-prose { color: #28332b; font-size: 16px; line-height: 1.75; }
        .legal-prose h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--nuit); margin: 2rem 0 0.6rem; }
        .legal-prose p { margin: 0 0 1rem; }
        .legal-prose ul { margin: 0 0 1rem; padding-left: 1.25rem; }
        .legal-prose li { margin: 0.3rem 0; }
        .legal-prose a { color: var(--foret); font-weight: 700; }
        .legal-box { background: #fff; border: 1px solid rgba(27,67,50,0.12); border-radius: 16px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .legal-box h2 { margin-top: 0; }
      `}</style>
    </main>
  )
}
