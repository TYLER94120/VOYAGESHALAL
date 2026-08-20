import Link from 'next/link'

// 🌍 LE SOCLE DE L'ACCUEIL ANGLAIS — écrit en anglais NATIF, pas traduit.
//
// Le feed vertical de GoHalalTravel passe déjà le test « JavaScript
// désactivé » : ses 354 panneaux sont rendus par le serveur, chacun avec
// son lien vers une vraie page. Ce qui manquait : un <h1>, du texte suivi,
// et un maillage vers les pages qui comptent. Un feed n'est pas une page
// de contenu — sans ce socle, Google voit une liste de noms de villes.
//
// Aucun chiffre en dur : le nombre de villes et de lieux de prière est
// compté par la page qui rend ce socle.

export default function SocleWorld({ nbVilles, nbLieuxPriere, villes, aeroports }: {
  nbVilles: number
  nbLieuxPriere: number
  villes: { slug: string; nom: string }[]
  aeroports: { slug: string; nom: string }[]
}) {
  return (
    <section className="sv" aria-label="About GoHalalTravel">
      <div className="sv-in">
        <h1 className="sv-h1">Where to pray and eat halal in {nbVilles.toLocaleString('en-GB')} cities</h1>

        <p className="sv-p">
          GoHalalTravel maps the two questions a Muslim traveler asks in an unfamiliar
          city: where can I pray, and where can I eat. Our records cover{' '}
          {nbLieuxPriere.toLocaleString('en-GB')} prayer places and halal addresses across{' '}
          {nbVilles.toLocaleString('en-GB')} cities, with prayer times computed in each
          city&apos;s own time zone and the Qibla read from your position.
        </p>
        <p className="sv-p">
          Every listing carries its source. Halal status is shown as verified when we
          checked it ourselves, reported when it is a claim to confirm on the spot, and
          left out entirely when we do not know. We issue no certification, and we never
          describe a place as certified — nobody should claim a guarantee they cannot prove.
        </p>
        <p className="sv-p">
          Prayer places come from OpenStreetMap, cross-checked against our own records;
          restaurants and hotels are ranked on real ratings and review counts, never on
          paid placement. Nothing here is sponsored.
        </p>

        <h2 className="sv-h2">Praying during a layover</h2>
        <p className="sv-p">
          A layover is where the question gets urgent. These pages give the prayer places
          recorded at and around the airport, today&apos;s prayer times computed for its
          coordinates, and the Qibla — with the source shown, and a blank where the map
          data is blank.
        </p>
        <ul className="sv-liens">
          {aeroports.map((a) => (
            <li key={a.slug}><Link href={`/prayer-room/${a.slug}`}>Where to pray at {a.nom}</Link></li>
          ))}
        </ul>

        <h2 className="sv-h2">Halal city guides</h2>
        <ul className="sv-liens">
          {villes.map((v) => (
            <li key={v.slug}><Link href={`/destinations/${v.slug}`}>Where to pray in {v.nom}</Link></li>
          ))}
          <li><Link href="/destinations">All {nbVilles.toLocaleString('en-GB')} cities</Link></li>
        </ul>

        <h2 className="sv-h2">Tools</h2>
        <ul className="sv-liens">
          <li><Link href="/prayer-times">Prayer times anywhere</Link></li>
          <li><Link href="/qibla">Qibla direction</Link></li>
          <li><Link href="/autour-de-moi">Prayer places and halal food around me</Link></li>
          <li><Link href="/saves">My saves</Link></li>
        </ul>

        <p className="sv-source">Prayer places: data © OpenStreetMap contributors (ODbL).</p>
      </div>
    </section>
  )
}
