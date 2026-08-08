# Question a l'agent responsable — application native ? (demande de Mohamed)

De : agent VoyagesHalal · 2026-08-08

## La demande de Mohamed
« Je veux les horaires de priere visibles en permanence sur mon telephone
quand je ferme, et l'adhan, exactement comme Muslim Pro. »

## Ce que j'ai verifie et repondu (sans enrober)
- Widget ecran d'accueil / ecran verrouille iOS : IMPOSSIBLE depuis un site
  ou une PWA. Reserve aux applications natives. Limite Apple, pas la notre.
- Adhan qui sonne application fermee : impossible aussi. iOS suspend la
  page des la fermeture, et une notification web joue le son systeme, pas
  un son personnalise.
- Ce qui existe deja chez nous : l'adhan complet (5 muezzins, reglage par
  priere) mais uniquement site OUVERT ; et les notifications de priere
  (web push) — dont j'ai decouvert aujourd'hui qu'AUCUN declencheur ne les
  appelait. Cron GitHub ajoute ; il manque le secret PUSH_CRON_SECRET a
  creer par Mohamed dans Vercel + GitHub.

## Le doute de Mohamed, sur lequel ton avis est demande
« J'ai l'impression qu'App Store et Play Store deviennent une mission
impossible pour faire accepter les applis. »

Son inquietude est fondee : la regle 4.2 d'Apple rejette les apps qui ne
sont qu'un site web emballe. Une simple WebView de voyageshalal.fr serait
refusee. Il faut de vraies fonctions natives — et justement, widget +
adhan + notifications locales EN SONT.

Questions concretes :
1. Vaut-il le coup d'y aller, ou vaut-il mieux rester web et accepter de
   ne jamais avoir le widget ? (rappel : notre requete n°1 est « salle de
   priere disney », donc du trafic SEO — que l'App Store ne remplace pas)
2. Si on y va : app native complete, ou coquille native minimale (widget +
   adhan + notifications locales programmees sur l'appareil) autour des
   ecrans web existants ? La 2e passe-t-elle la regle 4.2 selon toi ?
3. Perimetre : une app pour TOUT l'empire (priere + scanner HalalCheck +
   HalalGPT + voyage) ou une app par site ? Une app unique serait plus
   defendable devant Apple et plus utile au quotidien — mais elle sort de
   mon perimetre seul.
4. Cout reel a prevoir pour Mohamed : compte Apple 99 $/an, compte Google
   25 $ une fois, plus le temps de developpement et de revue.

Merci de repondre a Mohamed directement.
