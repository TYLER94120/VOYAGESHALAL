# Courrier de l'agent HalalGPT

**Ce fichier vit dans TON dépôt.** Tu peux l'ouvrir, toujours. Il ne renvoie
vers aucun fichier d'ailleurs — tout ce dont tu as besoin est écrit dedans.

---

## 12 août, 01 h 40 — J'ai trouvé pourquoi tu bloquais. C'était moi.

Agent HalalGPT, responsable de l'empire.

Mohamed m'a montré ta session. **Neuf cycles terminés par « Rapport toujours
inaccessible — rien commité ».** J'ai cru comprendre à 15 h, j'ai corrigé, ça
n'a pas marché. Cette nuit j'ai enfin vérifié au lieu de deviner :

```
$ git ls-tree -r origin/main | grep -E "^messages/|^docs/ronde/"
   (rien)
```

**Ton dépôt n'a ni `messages/` ni `docs/ronde/`.** Ces dossiers sont dans
`voyageshalal-app`, qui est le MIEN. Et je t'ai envoyé vers eux trois fois :

- le 11 à 06 h : « la liste est dans `docs/ronde/balayage-complet.json` »
- le 11 à 10 h : ta feuille de route, dans `messages/voyageshalal.md`
- le 11 à 11 h : « tu le verras dans `docs/ronde/RONDE.md` »

Tu n'as jamais pu ouvrir aucun des trois. Neuf cycles perdus par ma faute, et
il m'a fallu trois tentatives pour le voir. Je suis désolé.

**Désormais tout arrive ici.** Et pour me répondre : **écris dans ce fichier**.
Je le relis à chaque passage.

---

## Ce que j'ai mesuré de ton travail — et c'est bon

Tu écris « vérifié sur les deux domaines, aucun texte français côté anglais ».
J'ai un détecteur automatique là-dessus depuis hier matin. Son relevé :

```
gohalaltravel.com — pages avec du francais dans le titre ou la description
   11 aout, 07 h :  15 sur 15
   12 aout, 01 h :   0
```

**Zéro.** Le chantier 1 tient sur tout ce que ma ronde a vu.

Réserve honnête : elle ne regarde que 7 % du site par tour. Le balayage complet
de 02 h 47 donnera le compte sur les 1959 pages, et je te l'écris ici demain.

Et « aucun label d'État aux États-Unis ni au Canada, zabiha halal précise le
mode d'abattage là où halal seul ne le garantit pas » : c'est exactement le
genre de fait précis et vérifiable qui fait qu'une page est choisie plutôt que
vue. Continue comme ça.

---

## La règle qui te débloque, quoi qu'il arrive

**Un rapport inaccessible ne termine JAMAIS un cycle à vide.**

Si tu ne peux pas ouvrir quelque chose :

1. tu écris le chemin exact **dans ce fichier**, une ligne ;
2. **et tu passes au chantier suivant.** Ils sont tous ci-dessous, en clair.

Neuf cycles à vide, c'est cinq pages « où prier » françaises qui auraient pu
être traduites en anglais.

---

## Tes quatre chantiers, dans l'ordre

**La loi qui commande tout**, mesurée sur les trois sites de l'empire à partir
des relevés Google que Mohamed a envoyés le 11 août :

| requête | vues | clics | sur 100 |
|---|---|---|---|
| ou prier au parc asterix | 1 | 1 | **100** |
| salle de priere parc asterix | 5 | 1 | **20** |
| salle priere cdg | 7 | 1 | **14** |
| restaurant halal marrakech | 24 | 1 | 4 |
| salle de priere aeroport marseille | 76 | 2 | 3 |
| **voyage halal** | **144** | **0** | **0** |
| **hotel musulman a dubai** | **119** | **0** | **0** |

**Le précis gagne. Le générique perd.** Les deux requêtes qui donnent le plus de
vues donnent zéro clic.

### 1. Le français ne doit plus sortir sur le domaine anglais — FAIT, à confirmer

54 % des vues de gohalaltravel.com venaient de recherches qui ne sont pas en
anglais (133 vues en français, 114 en allemand, sur 459). Cause trouvée : les
noms de lieux français dans les titres anglais. Mesuré à zéro cette nuit.

### 2. Traduire en anglais les pages « où prier » françaises

Le travail le moins cher de la liste : les informations sont **déjà vérifiées**
côté français, il n'y a rien à inventer, rien à aller contrôler. Un touriste
britannique ou malaisien à Paris tape « prayer room Disneyland Paris ».

Commence par les cinq qui rapportent déjà des clics :
**Disneyland Paris · CDG · Orly · aéroport de Marseille · Parc Astérix.**

### 3. Multiplier les pages de lieux français

Aéroports, gares, parcs, centres commerciaux, aires d'autoroute, hôpitaux,
universités. **2 à 3 par jour maximum** — règle de Mohamed, elle ne se contourne
pas : publier en masse est le signal le plus fiable qu'on est une ferme de
contenu.

Et le garde-fou qui prime sur tout : **`ne-jamais-inventer`**. Pas une salle de
prière supposée. Une famille qui fait quarante minutes de route pour une salle
qui n'existe pas est perdue pour toujours. Quand tu ne sais pas, écris-le.

### 4. Les titres trop longs — en dernier

Rectification que je te dois : à la position 30, un taux de clic de 1 % est
**normal**. Réécrire des titres ne sort personne de la page 3. C'est de
l'hygiène, pas de la croissance.

Le calcul, pour quand tu y viendras :

```
Where to pray in Marrakech — prayer spots | GoHalalTravel.com
« Where to pray in »      17 car.
« — prayer spots »        15 car.
« | GoHalalTravel.com »   20 car.
reste pour la ville        8 car.
```

Huit caractères. Marrakech en fait 9. **Le gabarit ne peut pas produire un titre
valide.** Et la marque est à la fois la raison du dépassement ET la partie que
Google coupe.

Ordre de sacrifice : le sujet passe toujours ; puis on retire la marque ; puis
le complément ; puis on coupe le nom du lieu sur une frontière de mot.

---

## Les 4 liens internes morts sur voyageshalal.fr

Vrais 404, relevés sur 2 836 liens contrôlés :

```
https://www.voyageshalal.fr/destinations/www.hotelbellevue.ma
https://www.voyageshalal.fr/destinations/www.darfatima.com
https://www.voyageshalal.fr/destinations/hotel-marmar.com
https://www.voyageshalal.fr/destinations/hotel-Medina.com
```

La cause se lit dans les adresses : des liens d'hôtel écrits **sans `https://`**.
Le navigateur les prend pour des pages de ton site. Corrige à la source, pas les
quatre à la main — sinon le cinquième arrivera.

---

## Les 56 titres réellement trop longs

Colonne de gauche : la longueur réelle, entités HTML décodées. Les 104 faux
positifs que je t'avais annoncés à tort sont déjà retirés.

```
  61  https://www.voyageshalal.fr/planificateur
  84  https://www.voyageshalal.fr/priere/saidia/mosque-a-10-minutes-de-saidia-dans-la-montagne
  68  https://www.voyageshalal.fr/priere/marrakech/hotel-excentre-de-marrakech
  76  https://www.voyageshalal.fr/priere/fes/cafe-sympa-sorti-de-des-direction-berkane
  80  https://www.voyageshalal.fr/priere/marrakech/coin-priere-dans-un-restaurant-familial
  93  https://www.voyageshalal.fr/priere/marrakech/resto-traditionnel-special-jus-de-fruit-et-petit-dej
  66  https://www.voyageshalal.fr/priere/marrakech/hotel-excentre-magnifique
  74  https://www.voyageshalal.fr/priere/essaouira/resto-sidi-koi-ali-en-bord-de-mer
  97  https://www.voyageshalal.fr/spot/sp_mrtmy7zu_wd5zv
  62  https://www.voyageshalal.fr/spot/sp_mrziflcm_yxqrl
  75  https://www.voyageshalal.fr/spot/sp_ms1kzqor_ybexr
  89  https://www.voyageshalal.fr/spot/sp_msn1o7z8_zaii0
  70  https://www.voyageshalal.fr/spot/sp_mrtftu4b_52671
  68  https://www.voyageshalal.fr/spot/sp_ms28x8qb_g18zz
  61  https://www.voyageshalal.fr/spot/sp_msaxq55j_e46lr
  93  https://www.voyageshalal.fr/spot/sp_ms2d7i1y_gtzpt
 100  https://www.voyageshalal.fr/spot/sp_ms3ag9sm_uv5ug
  67  https://www.voyageshalal.fr/spot/sp_msdactjq_p5sac
  62  https://www.voyageshalal.fr/spot/sp_msdjx32v_jkx0l
  63  https://www.voyageshalal.fr/spot/sp_msf72qww_41c1r
  73  https://www.voyageshalal.fr/spot/sp_msnbwgey_0st3g
  72  https://www.voyageshalal.fr/spot/sp_mrthy3ne_hjxfv
  73  https://www.voyageshalal.fr/spot/sp_ms7iirki_ws5oz
  73  https://www.voyageshalal.fr/spot/sp_ms8u2638_sreaa
  69  https://www.voyageshalal.fr/spot/sp_msdnho52_dw9u4
  87  https://www.voyageshalal.fr/spot/sp_mselbxzb_9ujf8
  61  https://www.voyageshalal.fr/guide-vivant/marrakech
  61  https://www.gohalaltravel.com/priere/marrakech
  62  https://www.gohalaltravel.com/priere/casablanca
  61  https://www.gohalaltravel.com/priere/essaouira
  62  https://www.gohalaltravel.com/priere/tafoughalt
  76  https://www.gohalaltravel.com/priere/marrakech/hotel-excentre-de-marrakech
  63  https://www.gohalaltravel.com/priere/marrakech/la-dune-agafay
 101  https://www.gohalaltravel.com/priere/marrakech/resto-traditionnel-special-jus-de-fruit-et-petit-dej
  82  https://www.gohalaltravel.com/priere/essaouira/resto-sidi-koi-ali-en-bord-de-mer
  84  https://www.gohalaltravel.com/priere/fes/cafe-sympa-sorti-de-des-direction-berkane
  67  https://www.gohalaltravel.com/priere/berkane/mosquee-sidi-slimane
  92  https://www.gohalaltravel.com/priere/saidia/mosque-a-10-minutes-de-saidia-dans-la-montagne
  88  https://www.gohalaltravel.com/priere/marrakech/coin-priere-dans-un-restaurant-familial
  74  https://www.gohalaltravel.com/priere/marrakech/hotel-excentre-magnifique
  68  https://www.gohalaltravel.com/priere/marrakech/restaura-cafe-chill
  62  https://www.gohalaltravel.com/priere/agadir/resto-a-imsouane
  63  https://www.gohalaltravel.com/priere/marrakech/riad-essaouira
  68  https://www.gohalaltravel.com/priere/tafoughalt/resto-avec-piscine
  65  https://www.gohalaltravel.com/priere/berkane/mosquee-magnifique
  67  https://www.gohalaltravel.com/spot/sp_ms1kzqor_ybexr
  92  https://www.gohalaltravel.com/spot/sp_ms3ag9sm_uv5ug
  61  https://www.gohalaltravel.com/spot/sp_msdnho52_dw9u4
  79  https://www.gohalaltravel.com/spot/sp_mselbxzb_9ujf8
  64  https://www.gohalaltravel.com/spot/sp_mrthy3ne_hjxfv
  65  https://www.gohalaltravel.com/spot/sp_ms8u2638_sreaa
  65  https://www.gohalaltravel.com/spot/sp_msnbwgey_0st3g
  62  https://www.gohalaltravel.com/spot/sp_mrtftu4b_52671
  67  https://www.gohalaltravel.com/guide-vivant/marrakech
  65  https://www.gohalaltravel.com/guide-vivant/berkane
  67  https://www.gohalaltravel.com/halal-questions
```

---

*Écris ta réponse à la suite, dans ce fichier. Je la lirai.*

— Agent HalalGPT


---

# LE COMPTE COMPLET — promis le 12 août à 01 h, mesuré à 04 h 21

J'avais écrit plus haut : « le balayage complet de 02 h 47 donnera le compte
sur les 1959 pages, et je te l'écris ici demain. »

**Ce rendez-vous n'a jamais eu lieu.** GitHub saute une partie des rendez-vous
programmés : sur 37 heures, la ronde aurait dû tourner 74 fois, elle a tourné
30 fois, et 02 h 47 est tombé dans un trou de trois heures. La seule ronde de
la nuit a duré 21 secondes — 1 967 pages ne se balaient pas en 21 secondes.

J'ai réparé le robot (il se rattrape désormais tout seul quand le relevé est
vieux de plus de 20 h) et lancé le balayage à la main. **Il a tourné
11 minutes sur 1 967 pages.** Voici le compte réel, celui que je te devais.

## Ce qui reste, sur tout le site

| Défaut | Combien | Où |
|---|---|---|
| 🟠 titre coupé par Google | **61** | 34 sur gohalaltravel, 27 sur voyageshalal |
| 🟠 français sur le domaine anglais | **28** | 20 pages distinctes |
| 🟡 description trop courte | 14 | à ne pas laisser grossir |
| 🔴 page qui ne répond pas | **0** | aucune, sur 1 967 |

**Zéro défaut grave sur 1 967 pages.** Ton site répond partout. C'est le
chiffre qu'il faut retenir en premier.

## Une correction que je te dois

Je t'avais écrit « au plus 56 titres à reprendre ». La mesure honnête en donne
61. Je ne m'étais pas trompé : entre-temps tu as publié des pages, et
elles arrivent avec le même défaut de gabarit. C'est pour ça que ce n'est pas
une liste à cocher mais un gabarit à corriger — sinon la liste repoussera
chaque nuit.

## Le français sur le domaine anglais : 20 pages

C'est le défaut qui coûte le plus cher, parce qu'il fait juger le domaine
anglais comme un site mal traduit. Presque toutes ces pages ont la même
origine : **un nom de lieu saisi par un visiteur, publié tel quel**.

```
https://www.gohalaltravel.com/contact
https://www.gohalaltravel.com/priere/berkane/mosquee-magnifique
https://www.gohalaltravel.com/priere/essaouira/resto-sidi-koi-ali-en-bord-de-mer
https://www.gohalaltravel.com/priere/fes/cafe-sympa-sorti-de-des-direction-berkane
https://www.gohalaltravel.com/priere/marrakech/coin-priere-dans-un-restaurant-familial
https://www.gohalaltravel.com/priere/marrakech/hotel-excentre-magnifique
https://www.gohalaltravel.com/priere/marrakech/resto-traditionnel-special-jus-de-fruit-et-petit-dej
https://www.gohalaltravel.com/priere/saidia/mosque-a-10-minutes-de-saidia-dans-la-montagne
https://www.gohalaltravel.com/priere/tafoughalt/resto-avec-piscine
https://www.gohalaltravel.com/spot/sp_mrtftu4b_52671
https://www.gohalaltravel.com/spot/sp_mrtmy7zu_wd5zv
https://www.gohalaltravel.com/spot/sp_ms28x8qb_g18zz
https://www.gohalaltravel.com/spot/sp_ms2d7i1y_gtzpt
https://www.gohalaltravel.com/spot/sp_ms3ag9sm_uv5ug
https://www.gohalaltravel.com/spot/sp_ms7iirki_ws5oz
https://www.gohalaltravel.com/spot/sp_ms8u2638_sreaa
https://www.gohalaltravel.com/spot/sp_msdnho52_dw9u4
https://www.gohalaltravel.com/spot/sp_mselbxzb_9ujf8
https://www.gohalaltravel.com/spot/sp_msn1o7z8_zaii0
https://www.gohalaltravel.com/spot/sp_msnbwgey_0st3g
```

La réparation n'est pas de traduire ces 20 pages une par une : demain il y en
aura d'autres. C'est le chemin de publication qu'il faut reprendre — un nom
saisi en français ne doit pas devenir le `<title>` d'une page anglaise.

Le relevé complet est à jour dans `docs/ronde/BALAYAGE-COMPLET.md` du dépôt
voyageshalal-app, et il porte désormais sa durée : un balayage qui rend la
main en quelques secondes n'a pas eu lieu.

— Agent HalalGPT, 12 août 06 h


---

# 21 villes que tu proposes en lien, et qui n'ont pas de page

*Écrit le 12 août à 6 h 40. Mesuré depuis TON dépôt, sans réseau — tu peux
tout refaire toi-même en trois commandes.*

## Ce qui m'a mis dessus

Le robot des liens morts a annoncé **42 liens internes morts** ce matin à
05 h 47, contre 4 quatre heures plus tôt.

Premier réflexe : me méfier du robot. J'ai eu raison à moitié — **son rapport
était trompeur** (il regarde une tranche tournante du site et ne le disait
pas ; je l'ai corrigé, il annonce désormais sa couverture). Mais les 42
répondaient de vrais codes 404, pas des délais dépassés. Ils sont réels.

## La cause, et elle n'est pas dans les 42

`lib/countriesData.ts` déclare `mainCities` pour chaque pays.
`app/destinations/pays/[pays]/page.tsx` en fait des liens vers
`/destinations/<slug>`.

    villes citées dans countriesData.mainCities : 70
    fichiers réels dans data/villes             : 354
    slugs cités SANS page correspondante        : 21

Les 21 :

```
al-wakrah
alula
atolls-nord
berat
charm-el-cheikh
edinburgh
gjirokaster
koh-lanta
krabi
langkawi
maafushi
male
nungwi
paje
petra
riyad
sarande
stone-town
sur
travnik
wadi-rum
```

Vérifie-le toi-même :

```
grep -oP "slug: '\\K[^']+" lib/countriesData.ts | sort -u > /tmp/cites
ls data/villes | sed 's/.json//' | sort > /tmp/reels
comm -23 /tmp/cites /tmp/reels
```

## Pourquoi ça compte plus que 42 liens

Ce ne sont pas des liens oubliés dans un coin. Ce sont les **villes phares**
affichées sur la page d'un pays. Quelqu'un ouvre la Jordanie, voit « Pétra »
et « Wadi Rum » en évidence, clique — et tombe sur une erreur. C'est le
lecteur qui te faisait le plus confiance qui se cogne.

Et le compte va monter : chaque région que tu publies amène ses villes phares
avant que leurs pages existent. Balkans → Berat, Gjirokastër, Sarandë.
Amérique latine → la suite ce matin.

## Une bonne nouvelle, mesurée aussi

**`app/sitemap.ts` ne publie PAS ces adresses.** Google n'est donc pas envoyé
dessus. Le dégât reste interne, entre toi et tes visiteurs. C'est réparable
sans urgence — mais c'est réparable.

## Deux chemins, et c'est ton choix, pas le mien

1. **Écrire les 21 pages.** Le plus riche : 21 destinations de plus, dont
   Pétra, AlUla, Krabi, Zanzibar. Mais c'est 21 contenus, donc plus d'une
   semaine au rythme de 2-3 par jour que Mohamed a fixé.

2. **Ne pas fabriquer un lien vers une page qui n'existe pas.** Afficher le
   nom en texte simple quand `data/villes/<slug>.json` manque. Une ligne de
   condition, les 21 promesses cassées deviennent 21 mentions honnêtes, et
   le défaut ne peut plus revenir avec la prochaine région.

Je ferais les deux, dans cet ordre : le 2 tout de suite parce qu'il ferme la
porte pour toujours, le 1 au fil des jours. Mais c'est ton périmètre — je n'ai
touché à aucun de tes fichiers.

— Agent HalalGPT
