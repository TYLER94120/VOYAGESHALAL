# Mettre le site en ligne — la marche a suivre

Pour Mohamed, **sur ordinateur**. Le site est **statique** : des fichiers, rien
d'autre. Pas de base de donnees, pas de serveur a regler, aucune cle a saisir.

## Ou on en est (mis a jour le 14/08, apres la neuvieme lecon)

- **9 lecons**, 117 cartes, 58 minutes de contenu, 94 choses a apprendre.
  **21 fichiers, 549 Ko** — c'est tout le site.
- **LE SITE EST EN LIGNE depuis le 14 aout au soir.** Mohamed a rempli le depot
  `Islampasapas` a la main (glisser-deposer sur GitHub), et Vercel l'a deploye.
  Les huit premieres lecons y sont.
- Le site vit toujours dans le depot `VOYAGESHALAL`, dossier
  `projects/apprentissage/`, sur la branche
  `claude/islamic-learning-platform-l7o7to`. **C'est la que j'ecris.**
- **Le goulot d'etranglement est la, et il est le vrai sujet.** Je n'ai pas
  l'acces en ecriture au depot `Islampasapas` : la demande revient
  « cette action demande une approbation », et l'autorisation n'arrive pas
  jusqu'a Mohamed. **Chaque nouvelle lecon doit donc etre re-deposee a la
  main** — la neuvieme attend deja.
- La sortie propre : **rebrancher le projet Vercel sur `VOYAGESHALAL`**
  (Settings → Git → Connected Git Repository), avec Production Branch
  `claude/islamic-learning-platform-l7o7to` et Root Directory
  `projects/apprentissage`. Alors tout ce que je pousse part en ligne seul.
  Voir le chemin 2.

Les chemins ci-dessous restent valables pour toute remise a plat.

---

## Chemin 1 — remplir le depot islampasapas (recommande)

### Avec git, si tu l'as sur ton PC

```
git clone https://github.com/TYLER94120/VOYAGESHALAL.git
cd VOYAGESHALAL
git checkout claude/islamic-learning-platform-l7o7to
cd projects/apprentissage

git init
git add .
git commit -m "Islam pas a pas - premiere version"
git branch -M main
git remote add origin https://github.com/TYLER94120/islampasapas.git
git push -u origin main
```

La ligne qui compte est `cd projects/apprentissage` : on part **du contenu du
dossier**, pour que `index.html` se retrouve **a la racine** du nouveau depot.

### Sans git, par glisser-deposer

1. Recupere le dossier `projects/apprentissage/` sur ton PC.
2. Va sur `github.com/TYLER94120/islampasapas/upload/main`.
3. Glisse **le contenu** du dossier (pas le dossier lui-meme) dans la page.
4. **Commit changes**.

**Le point a ne pas rater :** c'est le *contenu* qu'on depose. `index.html` doit
etre **tout en haut** du depot. S'il finit dans un sous-dossier, le site
s'affichera a la mauvaise adresse.

---

## Chemin 2 — ne rien deposer du tout

Vercel sait aller chercher un sous-dossier dans un depot existant.

1. Vercel : **Add New → Project**, importe **`VOYAGESHALAL`**.
2. **Root Directory** : `projects/apprentissage`
3. Framework Preset : **Other**. Rien dans « Build Command » ni « Output Directory ».
4. **Deploy**.
5. Puis **Settings → Git → Production Branch** :
   `claude/islamic-learning-platform-l7o7to`, et redeploie.

C'est un **projet Vercel separe** : `voyageshalal.fr` n'est pas touche. Chaque
fois que je pousse, le site se met a jour tout seul.

L'inconvenient : le site reste loge dans le depot d'un autre projet. A ranger
un jour, mais ca marche des ce soir.

---

## Puis Vercel — publier (uniquement si tu as pris le chemin 1)

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

## Enfin OVH — brancher islampasapas.fr (dans les deux cas)

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

## Google : ce qui est deja pret, et les trois gestes qui restent

**Deja en place, rien a faire :**

- `sitemap.xml` — **12 pages** : l'accueil, les 9 lecons, la page des lecons,
  les 114 sourates. « Mon chemin » en est volontairement absent : c'est une page
  privee, elle porte une balise `noindex`.
- **12 titres uniques et 12 descriptions uniques.** Aucun doublon — c'est ce qui
  fait chuter un site dans les resultats.
- Une **adresse canonique** et une image de partage sur chaque page indexable.
- `robots.txt` bloque les deux apercus : publies, ils feraient du contenu
  duplique avec le site entier.
- **Donnees structurees (JSON-LD)** sur 11 des 12 pages indexables, generees depuis
  le catalogue par `outils/poser-json-ld.py`. Chaque lecon se declare comme une
  ressource d'apprentissage gratuite, en francais, avec ce qu'elle enseigne
  (« 7 versets d'Al-Fatiha ») et sa duree reelle. **On ne declare rien qu'on
  n'ait pas** : pas de type « cours » — pour Google un cours suppose des
  sessions et un formateur —, pas de fil d'Ariane, pas de note, pas d'avis,
  pas d'auteur, pas de logo.

**Les trois gestes qui restent, et ils sont pour toi :**

1. Google Search Console → **Ajouter une propriete** → `islampasapas.fr`.
2. **Verifier le domaine** : la methode DNS chez OVH est la plus simple, un
   enregistrement TXT a coller.
3. **Soumettre le sitemap** : dans « Sitemaps », taper `sitemap.xml`.

L'indexation prend quelques jours. Ne la force pas page par page : le sitemap
suffit, et une demande d'indexation manuelle n'accelere rien sur un site neuf.

**Apres chaque nouvelle lecon**, relance `python3 outils/poser-json-ld.py` :
les donnees structurees se regenerent depuis le catalogue, jamais a la main.

---

## Une fois en ligne, ce qu'il faut verifier

Ouvre `islampasapas.fr` sur ton telephone :

- l'accueil affiche **une carte et un bouton** ;
- sur Al-Fatiha, avance de deux cartes : les boutons **Ecouter** et **Repeter**
  doivent apparaitre sous le verset ;
- si tu n'entends rien, ouvre
  `islampasapas.fr/lecon-al-fatiha.html?son=diag` : un petit cadre en bas de la
  lecon dit quel recitateur repond, et envoie-moi la photo.

Et pour les donnees structurees, une verification en trente secondes :
**search.google.com/test/rich-results**, colle l'adresse d'une lecon. Il doit
lire un bloc `LearningResource` sans erreur. Il dira peut-etre « aucun element
enrichi detecte » : c'est normal et voulu — on n'a pas revendique de type qui
donne une carte enrichie, parce qu'on n'y a pas droit.

---

## Deux remarques

**Si tu preferes heberger chez OVH** plutot que chez Vercel, c'est possible
aussi : un hebergement web OVH suffit, on envoie les fichiers par FTP dans le
dossier `www`. Ca marche, mais il faudra renvoyer les fichiers a la main a
chaque modification — Vercel le fait tout seul. C'est la seule difference.

**Ce qui ne part pas en ligne :** le fichier `.vercelignore` retire du site les
notes de travail, la documentation et les fichiers d'apercu. Le visiteur ne voit
que les pages du site.
