# Mettre le site en ligne — la marche a suivre

Pour Mohamed. Le site est **statique** : des fichiers, rien d'autre. Pas de
base de donnees, pas de serveur a regler, aucune cle a saisir.

> Ce fichier avait ete supprime lors de la refonte du 21 aout. C'etait une
> erreur : le cahier des charges demandait de repartir de zero sur
> l'arborescence, le HTML, le CSS et le JS — pas de jeter le mode d'emploi du
> deploiement. Il est remis ici, mis a jour.
>
> Il ne part pas en ligne : `.vercelignore` exclut tous les `.md`.

---

## Le reglage, en une ligne

| | |
|---|---|
| depot SERVI | **`TYLER94120/Islampasapas`**, branche `main` |
| depot SOURCE | `TYLER94120/VOYAGESHALAL`, `projects/apprentissage/` |
| adresse | **https://islampasapas.fr** |
| deploiement | automatique quand on pousse sur **Islampasapas** |

### Ce que je croyais, et qui etait faux

J'ai ecrit ici, le 21 aout au matin, que le projet Vercel ecoutait la branche
`claude/islamic-learning-platform-l7o7to` du depot `VOYAGESHALAL`. C'etait une
phrase recopiee d'une ancienne note, que je n'avais pas verifiee.

La verite, constatee en clonant le depot : **`islampasapas.fr` sert
`Islampasapas`**, qui etait fige au 14 aout avec neuf lecons. Tout le travail
d'une semaine partait dans `VOYAGESHALAL` et n'arrivait jamais en ligne. On a
cherche du cote de Vercel pendant une heure, alors que le probleme etait qu'on
poussait au mauvais endroit.

### Deux copies, une seule commande

Le site vit donc a deux endroits :

- `VOYAGESHALAL/projects/apprentissage/` — la SOURCE : les pages, mais aussi
  les generateurs de questions et les donnees brutes du Coran ;
- `Islampasapas` — ce qui est SERVI, et rien d'autre.

Deux copies recopiees a la main derivent toujours. On ne les recopie donc
jamais a la main :

```
python3 outils/publier.py
```

Il vide le clone, recopie, puis **verifie fichier par fichier** que les deux
copies se recoupent — et refuse de continuer sinon. Il n'envoie rien tout
seul : il affiche la commande de publication a lancer.

`outils/` et les `.md` ne traversent pas : ils ne servent qu'a fabriquer.

---

## Si le site ne change pas apres un push

A verifier dans cet ordre, du plus frequent au plus rare.

**1. Le navigateur montre l'ancienne page.**
C'est la cause la plus courante et la plus trompeuse : le site est a jour, le
telephone montre ce qu'il a garde. Ouvre une fenetre privee, ou vide le cache
du site. Si la fenetre privee montre la nouvelle page, il n'y a rien d'autre
a faire.

**2. Le deploiement n'a pas eu lieu.**
Sur vercel.com, projet du site, onglet **Deployments**. Il doit y avoir une
ligne recente avec le numero du dernier commit. Trois cas :

- *aucune ligne recente* : Vercel n'ecoute pas la bonne branche.
  ⚠️ **ATTENTION, CE DOCUMENT SE CONTREDIT ICI.** Le haut de la page dit —
  et dit l'avoir CONSTATE en clonant — que `islampasapas.fr` sert le depot
  **`Islampasapas`**, branche `main`, et que « le deploiement est automatique
  quand on pousse sur Islampasapas ». Cette ligne-ci disait l'inverse :
  qu'il faut regler la Production Branch sur
  `claude/islamic-learning-platform-l7o7to`, une branche de l'AUTRE depot.
  C'est exactement la croyance que la section « Ce que je croyais, et qui
  etait faux » raconte avoir coute une heure de recherche.
  Le reglage Vercel reel n'est pas verifiable depuis l'environnement des
  rondes : **non verifie**. Si le site ne se met pas a jour, regarde d'abord
  le projet qui ecoute `Islampasapas`.
- *ligne en rouge (Error)* : ouvre-la, le journal dit ce qui a echoue.
- *ligne « Skipped »* : le reglage **Ignored Build Step** annule la
  construction. Il doit etre vide, ou rendre `exit 1` pour construire.

**3. Le domaine ne pointe plus sur Vercel.**
Rare, mais deja arrive : `islampasapas.fr` doit resoudre vers Vercel
(`216.198.79.1`), pas vers la page vide d'OVH (`213.186.33.5`).

---

## Ce qu'il ne faut jamais supprimer

- `google460d2c815736f50e.html` — la cle de Search Console. Sans elle, la
  propriete se devalide et on perd les mesures.
- `vercel.json` — sans lui, Vercel construit le mauvais projet.
- `.vercelignore` — sans lui, les cinq megaoctets de donnees brutes du Coran
  dans `outils/` partent en ligne pour rien.

---

## L'etat du site — au 20 octobre 2026

> Ce qui suit remplace un paragraphe du 21 aout qui disait « une section
> remplie sur douze, 604 questions ». Il avait deux mois et il etait faux.

Compte dans les banques ce soir :

| | |
|---|---|
| sections remplies | **11 sur 12** (`La vie du Prophete` est encore vide) |
| questions sourcees | **2 701** |
| lecons de sourate | **38** — Al-Fatiha, et le juz Amma complet (78 a 114) |
| adresses au sitemap | 53 |

**L'objectif des mille deux cents questions est depasse** : il y en a 2 701.

### Mais le plancher par section ne l'est pas

Le cahier demande **cent questions minimum par section**. Quatre sections
sont en dessous, et elles sont EN LIGNE, cliquables :

| section | questions |
|---|---|
| Les piliers de la foi | 89 |
| Le comportement | **11** |
| Le jeune et le Ramadan | **8** |
| Le pelerinage | **7** |

Rien ne ment : la couverture de chaque section annonce son nombre exact, et
l'ecran de reglages plafonne la partie a ce qu'elle contient. Mais une
section de sept questions ouverte au public n'est pas ce que le cahier
prevoyait. **C'est une decision d'editeur** : les ouvrir quand meme, ou les
refermer jusqu'a cent. Je ne la prends pas.

---

## Ce qui attend d'etre publie — au 20 octobre 2026

**Derniere publication : le 29 septembre** (repere de version `386566f`,
commit `59e67ae`). Vingt rondes depuis, aucune publiee : la consigne est que
tu promeus toi-meme.

Ce qu'un `publier.py` enverrait, compte entre `59e67ae` et la branche :

| | fichiers |
|---|---|
| pages (`.html` a la racine) | 52 |
| donnees (`data/`) | 12 |
| JavaScript | 4 |
| CSS | 2 |
| **total en ligne** | **70** |
| restent au depot (`outils/`, `.md`) | 49 |

Les 39 controles sont verts. Le detail de ce que chaque ronde a change est
dans les messages de commit, et le resume dans `docs/POUR-LE-CARNET.md`.

`data/lexique.json` a ete retire de `data/` le 19 octobre : il ne servait
qu'aux generateurs. Il disparaitra bien de la production, parce que
`publier.py` VIDE le clone avant de recopier — il ne se contente pas
d'ecraser.
