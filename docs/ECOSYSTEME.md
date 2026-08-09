# Ecosysteme — confirmation de l'agent VoyagesHalal

Agent VoyagesHalal : empire compris, perimetre accepte (2026-08-07).

## Perimetre de cet agent
- Repo TYLER94120/VOYAGESHALAL uniquement : voyageshalal.fr (FR) + gohalaltravel.com (EN), meme codebase bi-domaine.
- Ne touche jamais aux repos halalgpt (halalgpt.fr) ni voyageshalal-app (halalcheck.fr).

## Ponts sacres preserves dans toute refonte
- Footer : liens HalalGPT + HalalCheck (Outils musulmans).
- Bouton flottant HalalGPTFab (FR -> halalgpt.fr, EN -> /halalgpt).
- Pages EN /halalgpt et /halal-questions (lib/halalgpt-en.ts).
- API app/api/halalgpt/* : modele claude-opus-5, cache halalgpt:en:*, verrou finance.
- Bloc halalgpt du sitemap EN ; redirection FR /halalgpt -> halalgpt.fr.

## En attente : 5e site (apprentissage de l'islam)
Decide par Mohamed le 2026-08-08. Parcours d'apprentissage progressif
(lecons courtes, progression, revision) — different de HalalGPT (Q/R).
Nom, domaine et agent : pas encore definis.
Action prevue cote VoyagesHalal, UNIQUEMENT quand l'URL sera transmise
par l'agent responsable : ajouter un lien dans la colonne « Outils
musulmans » du pied de page FR, a cote de HalalGPT et HalalCheck.
Rien a faire avant. Perimetre inchange : cet agent ne touche pas au
repo du nouveau site.

## Regles editoriales
- Honnetete absolue : jamais inventer une salle de priere, un resto, une certification.
- Aucun avis de finance islamique sur aucun site.
- Palette famille : nuit #0b1a0f, foret #1b4332, or #c9a84c, creme #fdfaf3.

## Dates de référence pour mesurer le CTR

- **9 août 2026, 12h32** — correction des titres et descriptions
  (383 titres tronqués, noms de villes remis en anglais, chiffres faux).
  Chiffres AVANT cette correction, 7 jours :
  voyageshalal.fr 1 970 impressions / 29 clics / 1,5 % ·
  gohalaltravel.com 441 / 3 / 0,7 % · halalgpt.fr 88 / 3 / 3,4 %.
  → Remesurer entre le 16 et le 19 août. Ne rien conclure avant.

- **9 août 2026, soir** — pages hôtels d'Istanbul et Dubaï refaites
  (filtres, distance mosquée à pied, états « non vérifié »).
  Requêtes réelles à surveiller : « non alcoholic hotels dubai » (32),
  « islamische hotels in dubai » (21), « halal holidays istanbul » (20),
  « istanbul islami oteller » (16), « hotel musulman a istanbul » (18).

## À reprendre plus tard (noté, pas fait)

- **Allemand et turc** : 4 langues arrivent spontanément sur le domaine
  anglais (allemand 21 impressions, turc 26 sur deux requêtes). Signal
  réel mais faible. Décision prise : on ne traduit RIEN tant qu'Istanbul
  et Dubaï ne sont pas imprenables — deux versions mal faites abîmeraient
  les deux marchés. À rouvrir quand le CTR anglais sera remonté.
- Le premier pays du site anglais est le **Maroc** (69 visites), devant
  l'Allemagne et les États-Unis : le domaine « anglais » est en réalité
  mondial. À creuser avant toute décision de langue.
