# 📱 VoyagesHalal / GoHalalTravel — Application mobile (Expo / React Native)

Document d'architecture & plan de construction. À utiliser comme brief dans le repo de l'app.

---

## 0. Vision
La meilleure app de voyage halal au monde. Elle réutilise **les données et le backend du site** (single source of truth) et exploite ce que le web ne peut **pas** faire : **adhan audio app fermée**, **notifications de prière locales**, **boussole Qibla native (magnétomètre)**, **GPS natif**, widget, mode hors-ligne.

Deux marques, un seul binaire (white-label par config) :
- 🇫🇷 **VoyagesHalal** (français)
- 🇬🇧 **GoHalalTravel** (anglais)

---

## 1. Stack technique
- **Expo (SDK récent) + React Native + TypeScript**
- **expo-router** (navigation par fichiers, comme Next)
- **NativeWind** (Tailwind en RN) OU StyleSheet — palette ci-dessous
- Données : **fetch sur l'API du site** (voir §3), cache local **AsyncStorage** / **expo-file-system** (offline)
- Prière : lib **`adhan`** (calcul local, déjà utilisée côté web)
- Boussole : **expo-sensors** (Magnetometer) + correction déclinaison **`geomagnetism`** (WMM, déjà utilisée côté web)
- Carte : **react-native-maps** (mosquées via Overpass OSM)
- Notifications + adhan : **expo-notifications** (notifications locales programmées, son personnalisé) + **expo-av** (lecture audio)
- Localisation : **expo-location**
- PDF : **expo-print** (génère le guide ville)
- i18n : **i18n-js** ou **expo-localization** + dictionnaire (réutiliser `lib/i18n/translations.ts` du web)

---

## 2. Réutilisation depuis le site (NE PAS redévelopper)
| Brique | Source | Réutilisation app |
|---|---|---|
| Données 157 villes | `GET /api/villes` et `/api/villes/{slug}` | fetch direct (CORS ouvert) |
| Calcul horaires de prière | lib `adhan` + `lib/prayer.ts` (méthodes/écoles) | copier la logique de mapping méthode→params |
| Qibla + déclinaison | formule grand cercle + `geomagnetism` | copier `lib/ebook`? non : `lib/declination.ts` logique |
| Notifications Push (app fermée serveur) | `/api/push/*` + Upstash + VAPID | optionnel ; en natif, préférer notifications LOCALES programmées |
| Coordonnées villes | `lib/cityCoords.json` (ou via /api/villes) | embarquer en local pour l'offline |
| Design tokens | §4 | copier |

URL de base : `https://www.voyageshalal.fr` (FR) / `https://www.gohalaltravel.com` (EN). Mettre dans un fichier `config.ts`.

---

## 3. Contrat d'API (déjà en ligne)
```
GET /api/villes
→ { count, villes: [{ slug, nom, pays, continent, region, score_halal, halalScore, image, coordonnees:{lat,lng}, statistiques:{restaurants_halal,mosquees,hotels} }] }

GET /api/villes/{slug}
→ ville complète : { nom, pays, description, image, halalScore, coordonnees,
     restaurants:[{nom,type,score,specialite,priceRange,mapsUrl,...}],
     hotels:[...], mosqueesPrincipales:[...], activites:[...], infoPratique:{...} }
```
Prière en temps réel (si besoin réseau) : AlAdhan `https://api.aladhan.com/v1/timings/{ts}?latitude=&longitude=&method=&school=`.
Mosquées proches : Overpass `https://overpass-api.de/api/interpreter` (requête `amenity=place_of_worship` `religion=muslim`).

---

## 4. Design system
```
nuit    #0b1a0f   (fond sombre, barres)
forêt   #1b4332   (primaire, boutons)
or      #c9a84c   (accent, actif, étoiles)
crème   #fdfaf3   (fond clair)
texte   #1a1a1a / muted #6b7280
halal   bg #E7F4EA / tx #1B7A47
```
Typo : titres **Playfair Display** (serif), corps **DM Sans**. Coins arrondis 14-20. Bandeau « prochaine prière » sticky en haut sur tous les écrans (comme le web).

---

## 5. Navigation (expo-router)
```
app/
  _layout.tsx              → providers (Location, Lang, Adhan) + bandeau prière + tabs
  (tabs)/
    index.tsx              → Accueil (Localise-moi + recherche)
    destinations.tsx       → Liste villes + recherche + filtres continents
    priere.tsx             → Horaires (méthode/école + position GPS)
    mosquee.tsx            → Mosquée la plus proche (carte)
    qibla.tsx              → Boussole Qibla
  ville/[slug].tsx         → Détail ville (onglets Restaurants/Mosquées/Hôtels/À faire/Pratique)
  reglages.tsx             → Langue, méthode prière, adhan (muezzin/discret), notifications
```
Tab bar (bas) : Accueil · Ville · Mosquée · Prière · Qibla (mêmes icônes que le web).

---

## 6. Écrans (spécifications)
1. **Accueil** : bouton « Localise-moi » (expo-location → ville la plus proche via haversine sur la liste), barre de recherche, destinations populaires, classement Halal Score.
2. **Destinations** : `/api/villes`, recherche (nom/pays/alias), filtres par continent, cartes avec image + score.
3. **Ville** : `/api/villes/{slug}`. En-tête image + score. Onglets : Mosquées (→ mosquée proche), Restaurants, Hôtels, À faire, Pratique. Bouton « Guide PDF » (expo-print).
4. **Horaires de prière** : position GPS précise, sélecteur méthode + école, prochaine prière + compte à rebours, activation adhan.
5. **Mosquée proche** : carte react-native-maps, GPS, Overpass, liste triée par distance, itinéraire.
6. **Qibla** : Magnetometer + GPS → angle vers La Mecque, **corrigé de la déclinaison (WMM)**, mode boussole (cadran live, Kaaba qui se déplace) + mode direction (angle fixe).
7. **Réglages** : langue (FR/EN/…), méthode/école prière, **Adhan** (activer, muezzin OU sonnerie discrète, par prière, volume), **Notifications** locales.

---

## 7. Atouts natifs (le cœur de la valeur vs web)
- **Adhan app fermée** : `expo-notifications` programme une notification locale à chaque heure de prière, avec **son d'adhan personnalisé** (fichier mp3 bundlé). Recalculer/replanifier chaque jour (et au boot via `expo-task-manager` / `expo-background-fetch`).
- **Compte à rebours / widget** : widget iOS/Android (à packager natif) affichant la prochaine prière.
- **Boussole Qibla** fluide (magnétomètre natif, pas de permission web bancale).
- **Offline** : au premier lancement, télécharger `/api/villes` + détails des villes consultées, stocker localement → consultable sans réseau (essentiel en voyage).

---

## 8. Plan par étapes (milestones)
1. **M0 — Socle** : init Expo + expo-router + tabs + design tokens + config marque.
2. **M1 — Données** : écran Destinations (fetch `/api/villes`), recherche, filtres ; écran Ville (fetch détail) avec onglets.
3. **M2 — Prière & Qibla** : calcul `adhan` (méthode/école), GPS, compte à rebours ; boussole Qibla + déclinaison.
4. **M3 — Mosquée proche** : carte + Overpass + itinéraire.
5. **M4 — Adhan & notifications** (la pièce maîtresse native) : notifications locales programmées + audio adhan/sonnerie discrète, app fermée.
6. **M5 — Offline + i18n + Réglages** + Guide PDF.
7. **M6 — Polish + stores** : icônes/splash (réutiliser le motif géométrique or), comptes Apple Developer (99$/an) + Google Play (25$ unique), build EAS, soumission.

---

## 9. À NE PAS oublier (cohérence avec le web)
- **Zéro alcool, zéro porc** dans toute donnée affichée.
- **Aucune image de personnes/visages** non pudiques.
- Mentions : « Informations à titre indicatif, vérifiez localement le statut halal ».
- Même Halal Trust Score, mêmes méthodes de prière, même Qibla (déclinaison WMM).

---

## 10. Premier message à coller dans la fenêtre « app »
> Initialise une app **Expo + TypeScript + expo-router** nommée VoyagesHalal/GoHalalTravel.
> Configure la palette (nuit #0b1a0f, forêt #1b4332, or #c9a84c, crème #fdfaf3), une tab bar (Accueil, Destinations, Prière, Mosquée, Qibla) et un `config.ts` (API base = https://www.voyageshalal.fr).
> Puis construis l'écran **Destinations** qui charge `GET /api/villes`, avec recherche et filtres par continent, en cartes (image + Halal Score).
> Suis le document `APP_ARCHITECTURE.md` pour la suite.
