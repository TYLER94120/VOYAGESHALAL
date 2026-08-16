# 📊 CARNET DE MESURES DE L'EMPIRE

> **Pourquoi ce fichier existe.** Décision de Mohamed, 15 août 2026.
>
> Les captures d'écran s'effacent. La mémoire des conversations s'efface. Le
> dépôt, lui, n'oublie rien. Sans le passé d'un projet, on ne peut pas en
> suivre l'évolution — on avance à l'aveugle, on confond une bonne semaine
> avec une tendance, et on ne sait jamais si un changement a produit un effet.
>
> Ce carnet est la mémoire longue des cinq sites. Tout le monde y a accès :
> Mohamed, l'agent HalalGPT, l'agent VoyagesHalal, l'agent HalalCheck.

---

## 📏 LE PROTOCOLE

**Fréquence : une fois par mois.** Pas plus souvent — sept jours de données,
c'est du bruit ; trois mois, c'est une tendance. Le premier de chaque mois.

**Où relever :** Google Search Console → chaque propriété → Performances →
période **3 mois** → onglet Pages.

**Ce qu'on note, et rien d'autre :**
1. Le total impressions + clics du mois, par site
2. Les 5 à 10 pages qui rapportent le plus (clics ET impressions)
3. Les pages à fortes impressions et faibles clics — ce sont les réserves
   de trafic gratuit, celles où retravailler le titre paie immédiatement
4. **Ce qui a changé depuis le dernier relevé** — sans ça, on ne peut
   attribuer aucune variation à aucune cause

**Règle d'honnêteté :** si une donnée n'est pas relevée, on écrit
« inconnu ». On n'estime jamais dans ce fichier. Les estimations vont
ailleurs ; ici, seulement du mesuré.

---

## 📅 RELEVÉS

### 15 août 2026 — POINT ZÉRO

Premier relevé. Seul voyageshalal.fr a été mesuré ; les quatre autres sites
restent à relever.

**Google Search Console — voyageshalal.fr — 7 derniers jours**
(vue partielle : les 7 premières lignes du tableau, la traîne n'a pas été
capturée)

| Page | Clics | Impressions | Taux de clic |
|---|---|---|---|
| /blog/ou-prier-gares-paris | 4 | 23 | **17,4 %** |
| /blog/ou-prier-aeroport-orly | 3 | 139 | 2,2 % |
| /guides/ou-prier-aeroport-guide | 3 | 76 | 3,9 % |
| /blog/ou-prier-disneyland-paris | 3 | 74 | 4,1 % |
| /blog/ou-prier-parc-asterix | 3 | 11 | **27,3 %** |
| /blog/ou-prier-aeroport-cdg | 1 | 136 | **0,7 %** |
| /destinations/marrakech | 1 | 92 | 1,1 % |
| **TOTAL VISIBLE (7 j)** | **18** | **551** | **3,3 %** |

| Site | Impressions/mois | Clics/mois |
|---|---|---|
| voyageshalal.fr | ~2 400 (extrapolé de 7 j, vue partielle) | ~78 |
| halalgpt.fr | inconnu | inconnu |
| halalcheck.fr | inconnu | inconnu |
| gohalaltravel.com | inconnu | inconnu |
| plateforme apprentissage | inconnu | inconnu |

**🔍 CE QUE CE RELEVÉ RÉVÈLE**

1. **Six des sept meilleures pages sont des « où prier ».** Gares de Paris,
   Orly, CDG, guide aéroport, Disneyland, Parc Astérix. La demande réelle
   n'est pas le voyage lointain : c'est **« où prier pendant un déplacement
   ou une sortie en Île-de-France »**. Marrakech, la seule page destination,
   arrive en dernier.

2. **Deux réserves de trafic gratuit, immédiatement exploitables :**
   - `/blog/ou-prier-aeroport-cdg` — 136 impressions, **1 clic** (0,7 %)
   - `/blog/ou-prier-aeroport-orly` — 139 impressions, **3 clics** (2,2 %)
   Google les affiche déjà. Le titre et la description ne donnent pas envie
   de cliquer. À 8 % de taux de clic, ces deux pages rapporteraient
   ~22 clics/semaine au lieu de 4, **sans une seule impression de plus**.

3. **Le format gagnant est identifié :** « où prier à [lieu de transit ou de
   loisir] ». Gares, aéroports, parcs d'attractions, centres commerciaux,
   hôpitaux, universités, aires d'autoroute. Des milliers de lieux en France,
   aucun concurrent sérieux.

**🔧 CE QUI A CHANGÉ CE JOUR-LÀ** (à corréler avec le relevé de septembre)

- Géolocalisation réparée : le site plaçait les visiteurs à ~400 km de leur
  position réelle (Naaldwijk au lieu de Fontenay-sous-Bois). Horaires de
  prière, Qibla et distances étaient donc faux pour tout le monde.
- Moteur de recherche refondu : `searchNearby` pour les demandes de
  proximité, le mot tapé arrive intact chez Google, tri par distance réelle.
- « Prier » ne peut plus renvoyer un restaurant.
- Limiteur de requêtes corrigé : il bloquait les visiteurs (429) pendant que
  le site accusait Google à tort.
- Nouvelle direction artistique « L'heure fait l'écran » : la teinte de
  l'interface suit l'heure de prière.
- Accueil réduit à trois éléments : recherche, trois onglets, bande de prière.
- Cache versionné : un correctif n'est plus invisible pendant 24 h.

---

## 🎯 OBJECTIFS ET JALONS

| Échéance | Jalon | Atteint ? |
|---|---|---|
| Ramadan 2027 | 20 000 impressions/mois sur voyageshalal | — |
| 12 mois | Seuil de satisfaction de Mohamed : 8 000 impr. + 300 clics/mois, tous sites | — |

**Projection de référence, établie le 15 août 2026** (hypothèse basse, si le
rythme est tenu douze mois sans pénalité) : ~35 000 impressions et ~790 clics
par mois pour l'ensemble des cinq sites. À confronter aux relevés réels —
c'est l'écart qui sera instructif, pas le chiffre.

**Le repère à surveiller :** la courbe des impressions sur 3 mois. Si elle
monte régulièrement, même lentement, la trajectoire est bonne. Si elle stagne
trois mois d'affilée alors qu'on publie, c'est la méthode qu'il faut changer,
pas l'intensité.

---

## ⚠️ CE QUI PEUT TOUT CASSER

À vérifier à chaque relevé, parce que ça ne prévient pas :

- **Chute brutale de 50 % ou plus** → sanction Google pour contenu produit
  en masse. C'est le risque numéro un d'un empire qui publie plusieurs pages
  par nuit. La protection : des faits vérifiables et des sources affichées
  dans chaque page, jamais du texte qui se contente d'exister.
- **Impressions qui montent, clics qui stagnent** → problème de titres, pas
  de contenu. Réserve de trafic gratuit à récupérer.
- **Pages qui disparaissent de l'index** → vérifier Couverture dans Search
  Console, et que le contenu existe dans le HTML sans JavaScript.

---

## 📌 POUR LES AGENTS

Ce fichier est votre source de vérité sur ce qui marche. Avant de décider
quoi produire :

1. **Lisez le dernier relevé.** Les pages qui rapportent vous disent quel
   format fonctionne. Produisez-en davantage du même type.
2. **Regardez les fortes impressions / faibles clics.** Retravailler ces
   titres rapporte plus vite que d'écrire une page neuve.
3. **N'écrivez jamais d'estimation ici.** Seulement du mesuré, daté, sourcé.
4. **Notez vos changements majeurs** dans la section du mois : c'est la seule
   façon de savoir, le mois suivant, ce qui a produit quoi.
