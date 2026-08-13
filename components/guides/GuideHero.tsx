import Image from 'next/image'

// 📸 LA COUVERTURE DU GUIDE.
//
// POURQUOI CE COMPOSANT EXISTE. Mohamed, 12 août : « J'aimerais de beaux
// guides avec de belles photos, pas un truc donné à la va-vite. » Mesuré le
// jour même sur les pages servies : **zéro image sur les 24 guides**. La
// photo de couverture existait pourtant dans les données depuis le début —
// elle servait aux vignettes et aux partages, mais la page du guide, elle,
// n'affichait qu'un mur de texte. C'est la première raison pour laquelle nos
// guides paraissent bâclés.
//
// Le dégradé sombre en bas n'est pas décoratif : il garantit que le titre
// posé dessus reste lisible quelle que soit la photo.

export default function GuideHero({
  src,
  alt,
  categorie,
  titre,
  chapeau,
  meta,
}: {
  src: string
  alt: string
  categorie: string
  titre: string
  chapeau: string
  meta: React.ReactNode
}) {
  return (
    <figure className="relative -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-3xl overflow-hidden mb-10">
      <div className="relative aspect-[16/10] sm:aspect-[2/1]">
        <Image
          src={src}
          alt={alt}
          fill
          // La couverture est l'image la plus haute de la page : elle est
          // prioritaire, sinon le visiteur voit un rectangle vide au chargement.
          priority
          sizes="(max-width: 1024px) 100vw, 768px"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          // Assez sombre en bas pour que le titre reste lisible sur n'importe
          // quelle photo, assez transparent en haut pour qu'on voie le lieu :
          // la photo est là pour être vue, pas pour servir de fond.
          style={{ background: 'linear-gradient(to top, rgba(10,28,19,0.88) 0%, rgba(10,28,19,0.45) 42%, rgba(10,28,19,0) 78%)' }}
        />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <span className="inline-block bg-white/15 backdrop-blur text-white text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-4 border border-white/25">
            {categorie}
          </span>
          <h1
            className="text-white text-3xl sm:text-5xl font-extrabold leading-tight mb-3"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', textWrap: 'balance' }}
          >
            {titre}
          </h1>
          <p className="text-white/85 text-base sm:text-xl max-w-2xl leading-relaxed">{chapeau}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-sm mt-5">{meta}</div>
        </div>
      </div>
    </figure>
  )
}
