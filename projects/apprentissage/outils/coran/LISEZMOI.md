# Les sources de ce dossier — ce qui est vérifié, et ce qui ne l'est pas

> Écrit le 22 novembre 2026, parce que tout le contenu religieux du site
> descend de ces fichiers et que **rien n'était écrit sur eux**. Ni d'où ils
> viennent, ni quelle édition, ni quelle licence.

Ce dossier ne part pas en ligne : `.vercelignore` écarte `outils/`.

## Ce que chaque fichier porte

| fichier | contenu | ce que le site en fait |
|---|---|---|
| `ara-quransimple.json` | 6 236 versets, `{chapter, verse, text}` | le texte arabe affiché sur les 38 leçons et dans les cartes |
| `fra-muhammadhamidul.json` | 6 236 versets, même forme | **la traduction du sens**, affichée et attribuée |
| `morphologie.txt` | une ligne par segment, `sourate:verset:mot:segment` | le lexique, et depuis le 21 novembre le **témoin** de la structure |
| `noms-sourates.json` | 114 entrées `{n, ar, tr}` | les noms de sourates partout sur le site |
| `h-fra-bukhari.json` | 7 589 hadiths | **rien** — voir plus bas |
| `h-fra-muslim.json` | 7 563 hadiths | **rien** |
| `h-fra-abudawud.json` | 5 274 hadiths | **rien** |
| `h-eng-bukhari.json` | en anglais | **rien** |

## ✅ VÉRIFIÉ

- **Les trois sources du Coran s'accordent sur la structure.** Mesuré le
  21 novembre : les mêmes 114 sourates et les mêmes 6 236 versets dans
  l'arabe, dans la traduction et dans la morphologie ; aucune clef en double,
  aucun trou, chaque sourate numérotée de 1 à n. `controler-lecons.py`
  l'exige à chaque exécution — sans quoi une leçon pourrait afficher le sens
  d'un verset sous le texte d'un autre.
- **La basmala est là où le générateur la croit.** Le verset 1 commence par
  elle dans 113 sourates sur 114, la seule exception étant la sourate 9 ; et
  la morphologie compte le verset 1 comme le texte publié pour exactement les
  sourates 1 et 9.
- **Sept versets, relus à la main.** `outils/temoins/al-fatiha-relue.txt` est
  la seule ancre **hors** du dépôt : Al-Fatiha, écrite et relue avant
  l'existence du moindre script, extraite de la page publiée. Le contrôle
  s'arrête si elle ne correspond plus. **Sept sur les 571 versets publiés.**
- **Les pages disent ce que les données disent.** 571 versets comparés
  caractère pour caractère, traduction mot pour mot, numéros et comptes.

## ❌ ÉCARTÉ, et pour une raison mesurée

- **Les quatre recueils de hadiths sont inutilisables.** Mesuré le 21 octobre
  (voir `DEPLOIEMENT.md`) : aucun champ ne nomme un traducteur, et leurs
  titres de chapitres sont **mot pour mot ceux du fichier anglais**. C'est la
  preuve mesurable d'une traduction de traduction. Les 20 426 hadiths restent
  au dépôt et **aucun n'est cité**. Ce qui lèverait ce blocage est un achat ou
  une autorisation — une traduction française avec un traducteur nommé — pas
  du travail de nuit.
- **Le compte de mots par verset ne peut pas servir de vérification.** Mesuré
  le 21 novembre : 2 946 versets sur 6 236 en désaccord entre la morphologie
  et le texte publié ; 465 encore après avoir filtré les marques de pause. La
  cause est mesurée — la morphologie écrit le vocatif en **un** mot là où le
  texte publié en écrit deux. **Ne pas retenter.**

## ⚠️ NON VÉRIFIÉ — ce qu'il faut savoir avant de s'y fier

- **Aucun de ces fichiers ne dit d'où il vient.** Ni édition, ni éditeur, ni
  date, ni licence, ni adresse d'origine. Ils sont entrés au dépôt le 14 août
  2026 dans un commit qui parle d'autre chose.
- **`fra-muhammadhamidul.json` ne contient AUCUNE métadonnée.** Pas de champ
  traducteur, pas de titre, rien que `chapter`, `verse`, `text`. **Le seul
  élément interne qui porte le nom de Muhammad Hamidullah est le nom du
  fichier.** Or le site écrit ce nom 728 fois sur 40 pages et sur 2 391
  cartes. L'attribution est donc **cohérente partout** — une seule
  déclaration, dans `outils/regles-editoriales.py`, lue par les générateurs
  et par les contrôles — mais son **fondement** n'est pas vérifié ici.
- **Que ces comptes soient les bons.** Deux fichiers qui s'accordent valent
  mieux qu'un seul ; ce n'est pas une vérification contre le monde.

### Ce que Mohamed peut faire, et que je ne peux pas

Écrire la provenance : d'où viennent ces fichiers, quelle édition du texte,
quelle édition de la traduction de Hamidullah, sous quelle licence. Une ligne
par fichier suffirait. **Je ne l'invente pas** — une source qu'on ne peut pas
citer exactement ne se cite pas, et ça vaut aussi pour la source d'une source.
