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

- *aucune ligne recente* : Vercel n'ecoute pas la bonne branche. Settings →
  Git → **Production Branch** doit valoir `claude/islamic-learning-platform-l7o7to`.
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

## L'etat du site

Au 21 aout, apres la refonte : le QCM est le produit. Une section remplie sur
douze (`Le sens des sourates`, 604 questions sourcees), les onze autres
affichent « bientot » et ne sont pas cliquables.

Le cahier des charges demande **cent questions minimum par section** avant la
mise en ligne complete, soit mille deux cents. C'est le chantier en cours.
