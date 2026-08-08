# Mettre le site en ligne — la marche a suivre

Pour Mohamed. Aucune connaissance technique demandee, et rien a installer.

Le site est un site **statique** : des fichiers, rien d'autre. Pas de base de
donnees, pas de serveur a regler, aucune cle a saisir. On le depose, il marche.

---

## 1. GitHub — creer le depot

1. Sur github.com : **New repository**.
2. Nom : `islampasapas`.
3. **Coche « Private ».** C'est important : ce dossier contient des notes de
   travail internes (`POUR-LE-RESPONSABLE.md`). En depot public, tout le monde
   pourrait les lire. Si tu preferes un depot public, dis-le-moi et je sors ces
   notes du dossier avant.
4. **Create repository**.
5. Puis **Add file → Upload files**, et depose **le contenu** du dossier
   `projects/apprentissage/`.

**Le point a ne pas rater :** c'est le *contenu* qu'on depose, pas le dossier.
`index.html` doit se trouver **tout en haut** du depot. S'il finit dans un
sous-dossier, le site s'affichera a la mauvaise adresse.

---

## 2. Vercel — publier

1. Sur vercel.com : **Add New → Project**.
2. **Import** le depot `islampasapas`.
3. Vercel demande un « Framework Preset » : choisis **Other**.
4. Ne remplis **ni** « Build Command » **ni** « Output Directory ». Laisse vide.
   Il n'y a rien a construire.
5. **Deploy**.

Une minute plus tard, le site est en ligne a une adresse en `.vercel.app`.
Ouvre-la : tout doit marcher, y compris la recitation.

A partir de la, chaque modification poussee sur GitHub se remet en ligne toute
seule. Il n'y a plus rien a refaire.

---

## 3. OVH — brancher islampasapas.fr

1. Dans Vercel : **le projet → Settings → Domains**.
2. Ajoute `islampasapas.fr`, puis `www.islampasapas.fr`.
3. Vercel affiche alors **les valeurs exactes a recopier**. Il y en a deux :
   - un enregistrement **A** pour `islampasapas.fr`,
   - un enregistrement **CNAME** pour `www`.
4. Chez OVH : **ton domaine → Zone DNS**, et recopie ces deux valeurs
   telles quelles.

**Recopie ce que Vercel affiche, ne recopie rien d'autre.** Ces adresses
changent avec le temps, et une valeur inventee casse le domaine. Je ne les
ecris donc pas ici.

Compte de trente minutes a quelques heures avant que l'adresse reponde : c'est
le temps que le changement se propage sur internet, personne n'y peut rien.

---

## Une fois en ligne, ce qu'il faut verifier

Ouvre `islampasapas.fr` sur ton telephone :

- l'accueil affiche **une carte et un bouton** ;
- sur Al-Fatiha, avance de deux cartes : les boutons **Ecouter** et **Repeter**
  doivent apparaitre sous le verset ;
- si tu n'entends rien, ouvre
  `islampasapas.fr/lecon-al-fatiha.html?son=diag` : un petit cadre en bas de la
  lecon dit quel recitateur repond, et envoie-moi la photo.

---

## Deux remarques

**Si tu preferes heberger chez OVH** plutot que chez Vercel, c'est possible
aussi : un hebergement web OVH suffit, on envoie les fichiers par FTP dans le
dossier `www`. Ca marche, mais il faudra renvoyer les fichiers a la main a
chaque modification — Vercel le fait tout seul. C'est la seule difference.

**Ce qui ne part pas en ligne :** le fichier `.vercelignore` retire du site les
notes de travail, la documentation et les fichiers d'apercu. Le visiteur ne voit
que les pages du site.
