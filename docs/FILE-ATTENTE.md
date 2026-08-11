# File d'attente — VoyagesHalal.fr et GoHalalTravel.com

Un élément entre ici **avec ce qui le justifie** : un chiffre, un défaut
constaté. Jamais une simple intention. On en prend un par cycle, on le
finit, on le descend dans « Fait » avec sa mesure d'arrivée.

Priorité permanente : **Istanbul et Dubaï** — 79 et 53 impressions sur les
requêtes d'hôtels, en quatre langues, sans que personne n'ait travaillé
dessus.

---

## Dates de référence (ne pas rejuger un travail sur des chiffres d'avant)

| Date | Correction | Remesurer à partir du |
|---|---|---|
| 9 août 2026, 12h32 | 383 titres tronqués, noms de villes en anglais, chiffres faux | **16-19 août** |
| 9 août 2026, soir | Pages hôtels Istanbul et Dubaï (filtres, distance mosquée) | 16-19 août |
| 10 août 2026 | Liens sortants balisés (19 liens, campagne par emplacement) | 24 août |
| 11 août 2026 | Vitesse (appels réseau bornés, images 1600 → 300 px) | 18-21 août |

Chiffres AVANT le 9 août, 7 jours : voyageshalal.fr 1 970 impressions /
29 clics / 1,5 % · gohalaltravel.com 441 / 3 / 0,7 %.

---

## À faire

### 1. Les sections « manger » et « prier » manquent sur 307 fiches villes
**Mesuré le 11 août, après les séries Asie et Amérique du Nord** :
**47 fiches sur 354** ont leurs quatre sections (manger et prier, FR et EN).
Les 307 autres n'ont que des listes d'adresses — donc peu de texte unique,
et rien qui réponde à « manger halal à X » en toutes lettres.
Prochaine série, par ordre de doute réel du voyageur : **l'Europe de l'Est
et les Balkans** (Sarajevo, Sofia, Bucarest, Varsovie, Prague), où la
question se pose autrement — communautés anciennes d'un côté, quasi rien
de l'autre.

### 2. Les hôtels d'Istanbul et Dubaï attendent le robot OSM
**Mesuré** : 41 mentions « information non vérifiée » par page, et
**0 hôtel avec une politique alcool connue**. Le script et le workflow
existent (`enrich-hotels-osm.mjs`, `.github/workflows/enrich-hotels.yml`)
mais n'ont jamais été lancés : le réseau externe est fermé depuis
l'environnement de l'agent. **Action pour Mohamed**, pas pour l'agent :
GitHub → Actions → « Enrichir les hôtels » → Run workflow.

### 3. L'accueil et le blog : 704 impressions, ZÉRO clic
**Mesuré** (7 jours avant le 9 août). Les titres ont été refaits le 9 août,
donc **ne rien conclure avant le 16**. Si le zéro persiste après cette
date, le problème n'est pas le titre : il faudra regarder sur quelles
requêtes ces pages sortent réellement.

---

## Fait

### Quatre villes d'Amérique du Nord ont leurs sections — 11 août
**Avant** : 43 fiches sur 354. **Après : 47.** **516 mots uniques en
français, 460 en anglais**, sur 8 pages (Toronto, Montréal, Chicago,
Los Angeles — New York avait déjà les siennes).

**La vérité nord-américaine que peu de guides écrivent**, et qui vaut plus
que dix adresses : **il n'existe aucun label d'État**, ni aux États-Unis ni
au Canada. La certification est privée et plusieurs organismes coexistent.
Et le vocabulaire courant y ajoute une nuance décisive : **« zabiha
halal » précise le mode d'abattage, « halal » seul ne le garantit pas**.
C'est écrit sur les trois villes concernées.

**La difficulté commune, dite franchement** : ce n'est pas de trouver une
mosquée ou un restaurant, c'est la DISTANCE. À Los Angeles une mosquée à
quinze kilomètres peut demander une heure ; à Toronto et Chicago les
quartiers concernés sont loin du centre. Montréal fait exception, et la
page le dit : ville compacte, métro suffisant.

**Aucun restaurant nommé** : quartiers, institutions publiques et
fonctionnement réel de la certification, rien d'autre.

**Vérifié** : les 4 fiches répondent en 200 sur les deux domaines, les
sections sortent dans la bonne langue, et aucun texte français n'apparaît
côté anglais.

### Cinq villes d'Asie non musulmane ont leurs sections — 11 août
**Avant** : 38 fiches sur 354 avec les quatre sections. **Après : 43.**
**671 mots uniques en français, 563 en anglais**, sur 10 pages
(5 villes × 2 domaines).

Villes traitées, choisies là où le voyageur doute vraiment : **Séoul,
Taipei, Hong Kong, Delhi, Colombo**. En pays musulman la réponse est « tout
est halal » et la page sert peu ; ici la question se pose à chaque repas.

**Aucun restaurant nommé.** Uniquement des institutions vérifiables par
n'importe qui — grandes mosquées, organismes de certification — et des
quartiers. Et les difficultés sont dites, pas gommées : à Séoul le porc et
l'alcool de cuisine sont partout et les bouillons contiennent souvent de
l'anchois ; à Hong Kong le saindoux est un ingrédient de base de la cuisine
cantonaise ; à Delhi beaucoup de cuisines mélangent halal et non-halal, le
végétarien restant le repli sûr ; à Colombo la vigilance porte sur les
hôtels de bord de mer.

**Ce qui distingue Taipei** : Taïwan a fait de l'accueil des voyageurs
musulmans une politique publique — c'est l'une des rares destinations
d'Asie de l'Est avec des espaces de prière hors des mosquées.

**Vérifié** : les 5 fiches répondent en 200 sur les deux domaines, les
sections sortent en français sur voyageshalal.fr et en anglais sur
gohalaltravel.com, et aucun texte français n'apparaît côté anglais.

### Les 11 pages « où prier » sont terminées : 2 853 → 10 270 mots — 11 août
**L'élément est clos.** Onzième et dernière page approfondie : **Nice**,
185 → 832 mots en français, 170 → 764 en anglais.

**Le total de la série** : 2 853 mots au départ, **10 270 aujourd'hui** en
français — moyenne **259 → 934 mots** par page. (Somme des onze corps
d'article ; les pages rendues, navigation et pied de page compris, pèsent
14 634 mots.) Trois versions anglaises ont été créées au passage — gares de Paris,
Marseille, Toulouse — sur un domaine presque vide.

**LE DÉFAUT DE FOND, trouvé en travaillant et corrigé sur huit pages** :
elles tranchaient une question religieuse (« la prière du voyageur
raccourcie et regroupée », « c'est prévu par la religion »), alors que le
site dit partout ailleurs qu'il ne tranche pas et renvoie à HalalGPT. Ce
n'était pas un accident isolé mais un réflexe de gabarit, présent dans le
guide-mère comme dans les fiches. Il a disparu de la série.

**Ce que chaque page dit maintenant qu'elle ne disait pas** : le côté des
contrôles (CDG), l'heure de fermeture (Orly), la salle côté ville (Lyon),
l'ouverture 24h/24 (Bruxelles), la pièce partagée (Genève), le 3ᵉ étage
(Toulouse), l'autre terminal (Nice), l'absence totale de salle (Marseille),
la règle des 45 minutes (gares de Paris).

**Aucun emplacement inventé.** Les emplacements existants ont reçu leur
provenance — informations publiques des aéroports et témoignages, jamais
une vérification de notre part — et les pages écrivent noir sur blanc ce
que nous ne savons pas : horaires, ablutions, et côté des contrôles.

**Vérifié sur les deux domaines pour les 11 paires** : bonne langue,
titres sous 60 caractères, descriptions sous 160, hreflang réciproque,
liens internes en 200.

### Toulouse : un espace au 3ᵉ étage, donc une question de temps — 11 août
Dixième page « où prier » approfondie, et **création de sa version
anglaise**, qui n'existait pas. **Avant** : 193 mots, aucun jumeau anglais.
**Après : 811 mots en français, 747 en anglais.**

**La contrainte que personne ne mentionne** : l'espace est au 3ᵉ étage du
Hall C. Il faut y monter, prier, et redescendre. La vraie question n'est
donc pas « où est-ce » mais « ai-je le temps ». La page donne la règle :
**plus de 40 minutes, on monte ; en dessous, un coin calme près de la
porte**, en rappelant que l'embarquement ferme 20 minutes avant le
décollage.

**Trois aveux au lieu de trois suppositions** : nous ne connaissons ni les
horaires, ni la présence d'un espace d'ablutions, **ni si l'espace est
avant ou après les contrôles** — et ce dernier point décide de tout. La
page dit de le demander au comptoir information, avec le mot qui obtient
une réponse (« espace de recueillement »).

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 54 et 50
caractères, descriptions à 146 et 144, hreflang réciproque, 11 liens
internes en 200 de chaque côté, page anglaise dans le sitemap EN et absente
du sitemap FR.

### Genève : ce n'est pas une salle de prière, c'est une pièce partagée — 11 août
Neuvième page « où prier » approfondie. **Avant** : 208 mots en français,
194 en anglais. **Après : 789 et 714.**

**Ce que la page ne disait pas franchement** : l'espace de Cointrin est un
**espace de recueillement multiconfessionnel**, pas une salle musulmane, et
il est **petit**. D'autres personnes peuvent l'occuper en silence pour tout
autre chose. La page le dit maintenant, avec les deux conséquences
pratiques : viser un moment creux, et prévoir un repli près de la porte
plutôt que d'attendre.

**Septième page de la série avec la même contradiction, réparée** : elle
tranchait une question religieuse (« Prière du voyageur raccourcie et
regroupée »). Le réflexe de gabarit est maintenant éliminé sur toute la
série.

**Provenance et prudence** : les tapis et le Coran viennent des
informations publiques de l'aéroport — c'est écrit — et la page conseille
de **garder son tapis de poche** plutôt que de compter dessus, une mise à
disposition pouvant disparaître sans annonce. Aucun horaire publié : nous
n'en avons pas de fiables.

**Vérifié sur les deux domaines** : 11 h2 de chaque côté, titres à 44
caractères, descriptions à 157 et 146, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Bruxelles : l'inverse exact de Lyon, et c'est une bonne nouvelle — 11 août
Huitième page « où prier » approfondie. **Avant** : 221 mots en français,
201 en anglais. **Après : 765 et 732.**

**Ce que la page ne disait pas, et qui la rend utile** : à Zaventem les
salles sont **après les contrôles** et **ouvertes 24h/24**. C'est l'exact
inverse de Lyon (salle côté ville) et la réponse au défaut n° 1 relevé à
Orly (fermeture vers 22h qui rend Fajr et Isha inaccessibles). Pour un vol
de nuit ou un premier vol du matin, c'est l'aéroport le plus simple de la
série — dit en tête, avec la conséquence : si tu es encore côté ville, tu
ne peux pas y aller, passe les contrôles d'abord.

**Sixième page de la série avec la même contradiction**, réparée : elle
tranchait une question religieuse (« Prière du voyageur raccourcie et
regroupée »).

**Ce que nous n'affirmons pas** : la présence d'un espace d'ablutions. Nous
n'en avons pas trace, donc nous ne l'écrivons pas — et c'est justement ce
que la page demande à la communauté.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 47 et 46
caractères, descriptions à 147 et 144, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Lyon : la salle existe, mais elle est côté ville — 11 août
Septième page « où prier » approfondie, la plus courte qui restait.
**Avant** : 224 mots en français, 207 en anglais. **Après : 850 et 759.**

**L'information qui manquait, et qui coûte cher** : le centre spirituel de
Saint-Exupéry est **entre les deux terminaux**, donc **côté ville**. Une
fois les contrôles passés, il est inaccessible — on ne repasse pas la
sécurité pour prier. Aucune page ne le disait, et c'est pourtant le seul
point qui décide de la journée du voyageur. Il est maintenant en tête, dans
le titre de section et dans la description.

**Cinquième page de la série où je trouve la même contradiction** : elle
tranchait une question religieuse (« prière du voyageur raccourcie et
regroupée »). C'était un réflexe de gabarit, pas un accident.

**Horaires** : nous ne les publions pas. Ils sont affichés sur place et
changent ; la page le dit au lieu d'inventer une plage.

**Vérifié sur les deux domaines** : 11 h2 de chaque côté, titres à 56
caractères, descriptions à 153 et 150, hreflang réciproque, 10 liens
internes en 200 de chaque côté.

### Marseille : la seule page où la réponse est NON — 11 août
Sixième page « où prier » approfondie. **Avant** : 250 mots, aucun jumeau
anglais. **Après : 814 mots en français, 759 en anglais.**

**Trois défauts, pas un seul.** La page tranchait une question religieuse
(« en profitant des facilités du voyageur », « le tayammoum reste une
option ») — même correction que le guide aéroports, Orly et les gares. Elle
affirmait aussi que « plusieurs mosquées existent autour de Marignane »
sans que nous en ayons vérifié une seule : remplacé par l'outil, qui
s'appuie sur des données à jour. Et elle n'avait pas de version anglaise.

**Ce qui fait sa valeur** : c'est la seule page de la série où la réponse
est non. Une page qui dit franchement « il n'y a rien, voilà comment
faire » vaut mieux que dix pages qui promettent une salle. La vraie réponse
est écrite en clair : prier AVANT d'arriver à l'aéroport.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 56 et 51
caractères, descriptions à 159 et 134, hreflang réciproque, 10 liens
internes en 200 de chaque côté, page anglaise dans le sitemap EN et absente
du sitemap FR.

### Les gares de Paris : 322 → 940 mots, et une version anglaise créée — 11 août
Cinquième page « où prier » approfondie. **Avant** : 322 mots, et **aucun
jumeau anglais**. **Après : 940 mots en français, 843 en anglais** — une
page de plus sur un domaine presque vide. Traduire n'est pas créer.

**Même défaut que le guide aéroports, réparé** : la page tranchait une
question religieuse (« les facilités du voyageur existent pour ça :
raccourcir, regrouper », « c'est prévu par la religion »). Elle décrit
maintenant la question et renvoie à HalalGPT.

**Ce qui a été ajouté** : la règle des 45 minutes (sortir, rester, ou ne
pas bouger), les endroits qui marchent dans une gare et ceux qui ne
marchent pas, l'avertissement du bagage laissé sans surveillance, les
toilettes payantes pour les ablutions, et Maghrib comme prière difficile en
gare — créneau court au pic des départs du soir.

**Rien d'inventé** : aucune salle de quartier n'est nommée, précisément
parce que ce sont celles que nous n'avons pas vérifiées, et la page le dit.
Le seul lieu cité est la Grande Mosquée de Paris, institution publique,
avec une distance donnée comme ordre de grandeur.

**Vérifié sur les deux domaines** : 10 h2 de chaque côté, titres à 49 et 44
caractères, descriptions à 134 et 141, hreflang réciproque dans les deux
sens, 11 liens internes en 200 de chaque côté, page anglaise présente dans
le sitemap EN et dans /blog EN, absente du sitemap FR.

### Le domaine anglais renvoyait vers des adresses françaises — 11 août
**Mesuré** avec un outil neuf, `scripts/audit-liens-internes.mjs` : sur 189
liens internes distincts du domaine anglais, **6 faisaient une 301** — dont
`/horaires-priere`, présent dans la barre de prière, donc **sur les 816
pages**. Un lien interne qui redirige coûte un aller-retour au visiteur et
du budget d'exploration à Google, et affiche une adresse française à un
public anglophone.

En suivant les trois derniers, un défaut plus visible est apparu :
**l'accueil anglais affichait trois titres de guides en français**
(« Voyage halal pour débutants », « Pratique »), parce que
`guides.slice(0, 3)` prenait les trois premiers guides du fichier sans
regarder la langue. Sur la page la plus importante du domaine anglais, et
sous le radar de l'audit de langue : trois titres pèsent peu face à une
page entière.

**Après** : 187 liens sur le domaine anglais, **0 redirigé** ; 208 côté
français, **0 redirigé**. L'accueil anglais annonce « Halal Travel for
Beginners ». Réparé dans les composants partagés avec `localizedHref`, pas
lien par lien.

### Le guide aéroports tranchait une question religieuse — 11 août
Quatrième page « où prier » approfondie. **Avant** : 453 mots en français,
305 en anglais. **Après : 1 134 et 914.** Total des onze pages :
5 919 → 7 296 mots.

**Le vrai défaut n'était pas la longueur.** La page écrivait « le voyageur
peut raccourcir les prières de 4 à 2 rakats, et regrouper dhuhr avec asr »
comme une règle établie, alors que partout ailleurs nous disons que nous ne
tranchons pas les questions religieuses et renvoyons à HalalGPT. La
contradiction était dans le guide-mère de la série.

**Vérifié sur les deux domaines** : 12 h2 de chaque côté, titres à 58 et 49
caractères, descriptions à 145 et 123, 26 et 18 liens internes tous en 200.

### Audit de langue passé de 7 % à 100 % des pages — 11 août
L'échantillon de 120 pages avait trouvé le défaut de `/privacy` ; restait à
savoir s'il en cachait d'autres. **Mesuré maintenant sur la totalité des
deux sitemaps : 813 pages sur voyageshalal.fr et 816 sur gohalaltravel.com,
soit 1 629 pages — zéro défaut.**

Aucune page servie dans la mauvaise langue, aucune page sans H1, aucune
description absente, aucune page quasi vide sur les deux domaines.

**Non branché sur le build, volontairement** : la passe complète prend
plusieurs minutes et exige un serveur de production démarré. Le mode
échantillon (60 pages par domaine, quelques secondes) reste l'outil de
tous les jours ; la passe complète se relance à la main après tout
changement de gabarit ou de traduction.

### La politique de confidentialité était en français sur le domaine anglais — 11 août
**Trouvé en mesurant, pas en supposant.** Nouvel outil :
`scripts/audit-langue.mjs`, qui interroge les deux domaines depuis
l'extérieur (en-tête Host, donc `http.request` et non `fetch`, qui supprime
cet en-tête) et compte les MOTS OUTILS exclusifs à chaque langue plutôt
qu'un mot isolé.

**Avant** : 120 pages échantillonnées sur les 1 629 des deux sitemaps,
**1 défaut** — `gohalaltravel.com/privacy` : titre et description anglais,
mais **579 mots de corps en français** (51 mots outils français contre 11
anglais), et l'application s'y présentait sous le nom « VoyagesHalal ».
Seules les métadonnées avaient été traduites.

C'est le défaut le plus grave d'un site bi-domaine, sur la pire page
possible : celle qu'on lit précisément parce qu'on se méfie, et celle que
réclament les magasins d'applications. Elle passait sous le radar parce
qu'aucun lien de navigation ne la met en avant.

**Après** : 120 pages, **0 défaut**. `/privacy` sort en anglais sous le nom
GoHalalTravel, `/confidentialite` est inchangée en français. Rien
d'inventé : l'adresse de contact reste celle qui existe réellement.

### Orly : 263 → 1 249 mots, et le vrai piège est l'HEURE — 11 août
Troisième page « où prier » approfondie, après Disneyland et CDG. **Avant** :
263 mots en français, 257 en anglais. **Après : 1 249 et 1 168.** Total des
onze pages : 4 685 → 5 919 mots.

**Ce qui manquait, et qui est propre à Orly** : la salle ferme vers 22h dans
un aéroport qui fait décoller à 6h et atterrir après minuit. Le défaut n° 1
n'est donc pas de trouver la salle, c'est de la trouver ouverte — et
**Fajr** est structurellement hors plage une grande partie de l'année,
Isha l'étant en hiver. La page le dit maintenant en tête, avant tout
emplacement.

**Deuxième piège écrit** : les terminaux ont été renumérotés (Orly Sud et
Ouest → Orly 1 à 4), donc la plupart des repères qui circulent en ligne
sont dans l'ancien vocabulaire.

**Provenance qualifiée**, comme pour CDG : les emplacements viennent des
informations publiques de l'aéroport et de témoignages, pas d'une
vérification sur place. Aucun nouvel emplacement ajouté, et deux aveux
francs : Orly 3 (aucun lieu de culte connu de nous) et Orly 1-2 (nous ne
savons pas s'il y a un espace musulman distinct).

**Vérifié sur les deux domaines** : FR en `lang=fr`, EN en `lang=en`, 15 h2
de chaque côté, titres à 54 et 55 caractères, descriptions à 158 et 137,
hreflang réciproque, liens internes en 200. Temps de lecture 4 → 7 min.

### CDG : 308 → 1 207 mots, et le vrai piège enfin écrit — 11 août
Deuxième page « où prier » approfondie après Disneyland. **Avant** : 308
mots en français, 272 en anglais. **Après : 1 207 et 1 114.** Total des
onze pages : 3 506 → 4 685 mots.

**Une affirmation a été qualifiée**, comme pour Disneyland. La page donnait
les emplacements (Terminal 1 niveau 2, 2E côté portes L, 2F aux arrivées)
comme des faits établis. Ils viennent des informations publiques de
l'aéroport et de témoignages de voyageurs — c'est écrit maintenant, avec
la raison : un aéroport de cette taille est en travaux permanents.

**Ce qui manquait vraiment, et qui n'était nulle part** : le piège du côté
des contrôles. Un espace après la sécurité ne sert à rien quand on vient
d'atterrir, et on ne repasse pas un contrôle pour aller prier. C'est la
question à se poser AVANT de traverser le terminal.

Ajouté sans rien inventer : le mot qui obtient une réponse au comptoir
(« lieu de culte », pas « salle de prière »), les ablutions dans des
toilettes à capteurs, **Fajr** pour les vols matinaux et **Maghrib** en
hiver, la fermeture de l'embarquement 20 minutes avant le décollage comme
vraie heure limite, et l'aveu franc pour les terminaux 2A à 2D et 3 :
**nous ne savons pas**, et nous n'inventerons pas.

**Vérifié sur les deux domaines** : FR en `lang=fr`, EN en `lang=en`,
14 h2 de chaque côté, titres à 51 et 54 caractères, descriptions à 152 et
141, hreflang réciproque FR ↔ EN, et les 8 liens internes des deux versions
répondent en 200 sur le bon domaine. Temps de lecture corrigé (4 → 7 min).

### `force-dynamic` réexaminé — et un vrai défaut trouvé au passage — 11 août
**La prémisse de l'élément était fausse**, et c'est la mesure qui l'a dit :
sur les 39 fichiers concernés, 31 sont des routes /api où le réglage n'a
aucun effet sur le rendu, et **les 8 pages restantes lisent toutes le
domaine** (`getDomainSEO`). Aucune ne peut donc être rendue en statique :
il n'y avait rien à retirer.

**Vérification qui comptait vraiment** : aucune page HTML n'est rendue en
statique sur les deux domaines — donc zéro risque de servir la mauvaise
langue par mise en cache. Seuls quatre fichiers l'étaient : l'icône, l'audio
de l'adhan… **et le manifeste**.

**LE DÉFAUT** : le manifeste PWA était identique sur les deux domaines.
Qui installait l'application depuis gohalaltravel.com obtenait sur son
écran d'accueil une icône nommée « VoyagesHalal.fr — Guide Voyage Halal »,
une description en français, `lang: fr`, et des raccourcis vers
/horaires-priere au lieu de /prayer-times. Tous les jours, sur son
téléphone.

Il passait sous le radar parce qu'un manifeste ne s'affiche nulle part :
il ne se voit qu'au moment de l'installation.

**Mesuré après** : `GoHalalTravel — Halal Travel Guide`, `lang: en`, et les
raccourcis pointent vers `/notebook` et `/prayer-times` sur le domaine
anglais ; le français est inchangé.

### Disneyland Paris, notre meilleure page, était la plus courte — 11 août
22 des 29 clics du site sur 7 jours viennent d'elle. Elle faisait **226
mots**, la plus courte des onze pages « où prier », derrière le guide
aéroports (453).

**Après : 879 mots en français, 799 en anglais.** Total des onze pages :
2 853 → 3 506 mots.

**Et une affirmation a été qualifiée.** La page annonçait « le parc met à
disposition un espace calme, accessible sur simple demande » comme un
fait. Nous ne l'avons jamais vérifié — l'information vient de témoignages.
C'est écrit noir sur blanc maintenant : « nous ne l'avons pas vérifié
nous-mêmes », avec ce qui est établi (le City Hall est le point d'accueil,
donc le bon endroit où demander) et ce qui ne l'est pas (qu'un espace soit
libre à cette heure-là). Vérifié sur les deux domaines.

Ce qui a été ajouté sans rien inventer : quoi faire si on te dit non
(quatre solutions), les ablutions dans des toilettes très fréquentées,
**Maghrib** comme la seule prière vraiment problématique (été comme
hiver), et le tapis de poche au contrôle des sacs. Aucune adresse, aucun
lieu précis que nous n'aurions pas vérifié.

### 14 villes d'Europe ont leurs sections « manger » et « prier » — 11 août
**Avant** : 24 fiches sur 354. **Après** : **38**, soit **2 634 mots
uniques** de plus sur 28 pages (14 villes × 2 domaines).

Berlin, Amsterdam, Bruxelles, Vienne, Rome, Madrid, Milan, Munich, Genève,
Lyon, Marseille, Birmingham, Manchester, Rotterdam.

**Pourquoi l'Europe et pas le Golfe** : en pays musulman la réponse est
« tout est halal », la page est vite écrite et sert peu. En Europe, c'est
là que le voyageur doute — donc là que nous avons quelque chose à dire.

Deux vérités européennes que peu de guides écrivent franchement, et qui
valent plus que dix adresses :
 · **aucun label d'État n'existe en Europe** — la certification est privée
   et diffère d'un organisme et d'un pays à l'autre ;
 · **« viande halal » ne veut pas dire « sans alcool »** — beaucoup de
   restaurants à viande halal servent du vin. Deux questions distinctes.

Et les difficultés sont dites, pas gommées : à Madrid le jambon est partout
y compris là où on ne l'attend pas, à Munich la cuisine bavaroise tourne
autour du porc, à Milan il n'y a pas de grande mosquée visible, à Marseille
il n'y a pas de mosquée centrale — le projet n'a jamais abouti.

Vérifié : les sections sortent en français sur voyageshalal.fr et en anglais
sur gohalaltravel.com, et les 1 629 pages restent à zéro titre coupé, zéro
description coupée, zéro H1 manquant, zéro page lente.

### 14 villes ont leurs sections « manger » et « prier » — 11 août
**Avant** : 10 fiches sur 354 (Istanbul et Dubaï en faisaient déjà partie).
**Après** : **24 fiches**, soit **2 485 mots uniques** ajoutés sur 28 pages
(14 villes × 2 domaines).

Villes traitées, choisies sur la demande halal réelle et non sur le volume
de données : Kuala Lumpur, La Mecque, Médine, Londres, Casablanca, Fès,
Singapour, Doha, Abu Dhabi, Sharjah, Amman, Le Caire, Tunis, Alger.

**Rien d'inventé** : aucun restaurant nommé, aucune salle de prière que
nous n'aurions pas vérifiée. Uniquement des quartiers, des mosquées
majeures et les organismes de certification officiels (JAKIM en Malaisie,
MUIS à Singapour, HMC et HFA au Royaume-Uni) — tout est vérifiable par
n'importe qui. Là où la nuance compte, elle est écrite : « no pork » n'est
pas « halal » à Kuala Lumpur ; à Singapour le stand voisin du stand
certifié ne l'est pas ; Sharjah est le seul émirat entièrement sans alcool.

Vérifié sur les deux domaines : les sections sortent bien en français sur
voyageshalal.fr et en anglais sur gohalaltravel.com, et les 1 627 pages
restent à zéro titre coupé et zéro description coupée.

### Les 6 guides pratiques ont leur version anglaise — 11 août
Ils n'existaient qu'en français : repas MOML en avion, ablutions, heure de
prière en vol, voile au contrôle, voyager voilée, toilettes sans douchette.
Traduire n'est pas créer — cela ne consomme pas la limite de 2-3 contenus
par jour.

**Mesuré après** : 23 articles anglais (17 avant), **25 paires FR/EN
déclarées** (19 avant). Les 6 pages répondent en 200 sur le domaine
anglais, apparaissent dans /blog et dans le sitemap EN, et l'ancienne URL
française y fait bien une 301 vers le slug anglais.

**Réciprocité hreflang vérifiée dans les deux sens** sur les 6 paires :
chaque page FR déclare sa jumelle EN, et chaque page EN déclare sa jumelle
FR — jamais vers une URL qui redirige.

Titres tous sous 62 caractères (37 à 49), descriptions sous 160 (135 à
156). Les 14 liens internes des articles anglais pointent vers des pages
anglaises qui existent (`/prayer-times`, `/mosque-near-me`,
`/guides/halal-travel-checklist`…) — vérifié un par un.

### La position, dite en clair sur tout le site — 11 août
**Reproché par Mohamed** : « il y a écrit ma position, mais ce n'est pas
clair, on ne sait pas si ça l'a pris en compte, s'il faut rappuyer ».

Le fond du problème n'était pas l'affichage : « Ma position » décrit la
MÉTHODE et non le LIEU. Rien à vérifier, donc aucune confiance possible.
Le GPS donne maintenant un nom (`/api/reverse`, notre propre liste de 354
villes, Nominatim seulement au-delà de 60 km) : **« Ma position » → « Rabat »**.

Un composant unique (`components/location/PositionBadge`) répond partout aux
trois mêmes questions dans le même ordre : où · quelle qualité · quoi faire.
Trois qualités, pas deux : exacte, ville choisie, approximative.
**Mesuré sur 6 pages × 2 états** (GPS refusé / accordé) : même lieu, même
horaire, même formulation, zéro erreur JavaScript.

Trois défauts trouvés en chemin :
 · la page horaires avait sa **propre copie** de la résolution de position ;
 · le bandeau du haut rappelait api.aladhan.com **chaque seconde** ;
 · la page horaires affichait « indisponibles » dès qu'aladhan ne répondait
   pas, pendant que le bandeau donnait l'heure (calcul local en repli).

Et « Je suis ici (ma position exacte) », sur l'ajout d'un spot, enregistrait
la position estimée depuis la connexion quand le GPS n'avait pas répondu :
**un lieu faux publié sous l'étiquette « exact »**. Le bouton demande
désormais le GPS d'abord.

### Deux villes différentes affichées en même temps — 11 août
**Constaté sur une capture de Mohamed** : le bandeau annonçait « Marrakech »
pendant qu'une tuile annonçait « spots à Fès ».

Ce n'était pas un bug de calcul : **deux notions différentes portaient la
même épingle 📍** — la position réelle, et la ville qu'on consulte (mémorisée
par le site). L'épingle est maintenant réservée à « où tu es » ; la ville
consultée porte la loupe 🔎 et le mot « Ville consultée ».

### Deux horaires de prière différents sur le même écran — 11 août
**Constaté sur une capture de Mohamed** : le bandeau du haut annonçait
Dhuhr à **13h37**, la tuile du tableau de bord **13h24**. Quatorze minutes
d'écart, sur un produit de prière.

Vérifié par un calcul solaire indépendant (équation du temps + longitude) :
Dhuhr à Marrakech le 11 août = **13h37**. Le bandeau avait raison, et la
bibliothèque de calcul est juste elle aussi (13h38 en méthode Ligue
islamique mondiale).

La cause n'était donc pas un mauvais calcul mais **deux sources** : le
bandeau partait de la ville mémorisée, le tableau de bord de la position
réelle, et le board forçait la méthode 3 en dur alors que le bandeau lit
le choix de l'utilisateur. Les deux lisent désormais la même position et
la même méthode.
**Mesure après correction** : une seule heure affichée, **13:38**.

### Vitesse de la page d'accueil — 11 août
Un appel réseau restait **13,7 s** sans jamais se terminer (le serveur
répond en 4 ms) : `fetch` n'a aucun délai maximum. Les 7 lectures du
tableau de bord abandonnent maintenant à 4 s.
**Mesure** : avec toutes les API retardées de 20 s, la fenêtre de prière
s'affiche en **369 ms** (334 ms en réseau normal).
Images : les vignettes de 168 px chargeaient du 1600 px → **300 px**.

### Lisibilité en plein jour — 11 août
**Avant** : 84 % des pixels du premier écran très sombres, luminosité
moyenne 38/255. **Après** : 60 % et 44/255.
Rupture de fond entre le tableau de bord (26,45,29) et le hero (15,30,18) :
**écart de couleur 37 → 5**.

### Ce que Google affiche — 9 août
**383 titres sur 809** dépassaient 62 caractères et étaient coupés → **10**.
34 fiches villes sortaient leur nom français sur le domaine anglais
(« Dubaï Halal Travel Guide ») → corrigé.
93 fiches sur 354 annonçaient un nombre de restaurants faux → calculé sur
les données réelles.

### Hreflang dans les pages — 9 août
**777 des 802 pages** déclarent leur jumeau (les 25 restantes n'en ont pas,
et c'est voulu). Pages orphelines : **1 sur 802**, rattachée.

### Distance à la mosquée sur 222 hôtels — 9 août
Istanbul : les 110 hôtels sont à **3 minutes de marche au plus** d'une
mosquée (médiane 2 min). Dubaï : médiane 14 min, 37 hôtels sur 112 sous
les 10 minutes.
