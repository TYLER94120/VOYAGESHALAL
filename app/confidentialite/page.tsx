import type { Metadata } from 'next'
import IslamicPattern from '@/components/ui/IslamicPattern'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    "Politique de confidentialité de VoyagesHalal : aucune donnée personnelle collectée, position jamais enregistrée, favoris et réglages stockés uniquement sur votre appareil.",
  alternates: { canonical: 'https://www.voyageshalal.fr/confidentialite' },
  robots: { index: true, follow: true },
}

const MAJ = '30 juin 2026'

export default function ConfidentialitePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      {/* Hero sombre */}
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '4rem 1.5rem 3rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>✦ Légal</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
            Politique de <em style={{ color: 'var(--or)' }}>confidentialité</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', opacity: 0.85, marginTop: '0.75rem' }}>Dernière mise à jour : {MAJ}</p>
        </div>
      </section>

      <article style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }} className="legal-prose">
        <p>
          VoyagesHalal (« l&apos;application ») aide les voyageurs musulmans à trouver des mosquées, des
          restaurants halal et des hôtels bien situés, ainsi que les horaires de prière et la direction de la
          Qibla. Nous attachons une grande importance à votre vie privée.
        </p>

        <div className="legal-box">
          <h2>En résumé</h2>
          <ul>
            <li>Aucun compte requis — pas d&apos;inscription, pas d&apos;identité.</li>
            <li>Aucune donnée personnelle collectée sur un serveur — pas de base d&apos;utilisateurs.</li>
            <li>Favoris et réglages restent sur votre téléphone (stockage local).</li>
            <li>Votre position n&apos;est jamais enregistrée ni envoyée à nos serveurs.</li>
          </ul>
        </div>

        <h2>1. Données de localisation</h2>
        <p>
          Avec votre autorisation, l&apos;application accède à votre position uniquement pendant son utilisation,
          pour afficher les lieux halal proches et calculer les horaires de prière et la Qibla. Votre position est
          utilisée en temps réel sur votre appareil ; elle n&apos;est ni stockée ni transmise à VoyagesHalal. Pour
          rechercher les mosquées autour de vous, des coordonnées approximatives peuvent être envoyées au service
          cartographique OpenStreetMap (Overpass), sans aucune donnée permettant de vous identifier. Vous pouvez
          refuser ou révoquer cette autorisation à tout moment ; l&apos;application reste utilisable en choisissant
          une ville manuellement.
        </p>

        <h2>2. Notifications</h2>
        <p>
          Si vous l&apos;activez, l&apos;application programme des notifications locales pour vous rappeler les
          heures de prière. Elles sont générées sur votre appareil ; aucune notification n&apos;est envoyée depuis
          un serveur et aucune donnée n&apos;est collectée.
        </p>

        <h2>3. Données stockées sur votre appareil</h2>
        <p>
          Sont enregistrés localement et ne quittent jamais l&apos;appareil : vos favoris, vos réglages (méthode de
          calcul des prières, notifications) et une copie hors-ligne des villes consultées. Vous pouvez tout
          supprimer en désinstallant l&apos;application.
        </p>

        <h2>4. Services tiers</h2>
        <ul>
          <li><strong>API VoyagesHalal (voyageshalal.fr)</strong> : liste des villes, restaurants, hôtels, activités. Requêtes sans données personnelles.</li>
          <li><strong>OpenStreetMap / Overpass</strong> : mosquées à proximité (voir §1).</li>
          <li><strong>Cartes &amp; itinéraires / réservation</strong> : « Itinéraire » ou « Réserver » ouvre une app externe (Google Maps, Booking…), régie par sa propre politique de confidentialité.</li>
        </ul>

        <h2>5. Aucune publicité, aucun traçage</h2>
        <p>
          L&apos;application ne contient pas de publicité, ne suit pas votre comportement et ne partage aucune
          donnée à des fins commerciales.
        </p>

        <h2>6. Enfants</h2>
        <p>
          L&apos;application ne s&apos;adresse pas spécifiquement aux enfants et ne collecte sciemment aucune donnée
          les concernant.
        </p>

        <h2>7. Vos droits (RGPD)</h2>
        <p>
          Aucune donnée personnelle n&apos;étant conservée sur nos serveurs, ces droits s&apos;exercent
          essentiellement en désinstallant l&apos;application (ce qui efface toutes les données locales).
        </p>

        <h2>8. Modifications</h2>
        <p>Cette politique peut être mise à jour ; la date en haut indique la dernière version.</p>

        <h2>9. Contact</h2>
        <p>
          Pour toute question : <a href="mailto:contact@voyageshalal.fr">contact@voyageshalal.fr</a>
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
