// ─── HalalGPT (EN) — knowledge base for gohalaltravel.com ─────────────────────
//
// Each entry becomes a static SEO page at /halal-questions/[slug] (EN domain
// only — the FR audience has halalgpt.fr). Same editorial rules as the FR base:
// present mainstream views with their divergences, recommend certification in
// case of doubt, never issue personal fatwas.

export interface HalalQA {
  slug: string
  question: string
  verdict: string
  short: string
  answer: string[]
  category: 'Additives' | 'Products' | 'Food' | 'Practice'
  related: string[]
}

export const HALAL_QA_EN: HalalQA[] = [
  // ─── ADDITIVES ──────────────────────────────────────────────────────────────
  {
    slug: 'is-e120-carmine-halal',
    question: 'Is E120 (carmine) halal?',
    verdict: '⚠️ Divergent views — usually avoided',
    short:
      'E120 is a red dye extracted from the cochineal insect. Most halal certification bodies reject it.',
    answer: [
      'E120 — carmine or cochineal red — is a colouring made from dried, crushed cochineal insects. You will find it in some sweets, red-coloured drinks, strawberry yoghurts and cosmetics.',
      'Eating insects is considered impermissible by the majority of scholars (notably the Hanafi school), which is why most halal certifiers exclude E120. A minority view tolerates it because of the processing involved, but it remains marginal.',
      'In practice, most Muslim consumers avoid it. Look for plant-based alternatives instead: E162 (beetroot red) and E163 (anthocyanins) are perfectly halal.',
    ],
    category: 'Additives',
    related: ['is-gelatine-halal', 'is-e471-halal', 'is-shellac-e904-halal'],
  },
  {
    slug: 'is-gelatine-halal',
    question: 'Is gelatine halal?',
    verdict: '⚠️ Depends on the source',
    short:
      'Pork gelatine is haram. Beef gelatine is only halal if the animal was slaughtered Islamically. Fish gelatine is halal.',
    answer: [
      'Gelatine (E441) is everywhere: gummy sweets, marshmallows, mousses, capsules, some yoghurts. It is extracted from animal skin and bones — most often pork, the cheapest source, or beef.',
      'The rule: pork gelatine is unanimously haram. Beef gelatine is halal only if the animal was slaughtered according to Islamic rites — which standard industrial gelatine is not. Fish gelatine is halal without condition. Some scholars argue the chemical transformation (istihala) purifies gelatine, but the majority of certification bodies require a halal source.',
      'Halal-friendly alternatives to look for on labels: pectin (E440), agar-agar (E406), carrageenan (E407) — all plant-based — and explicitly labelled “fish gelatine” or certified halal gelatine.',
    ],
    category: 'Additives',
    related: ['are-haribo-halal', 'is-fish-gelatine-halal', 'are-marshmallows-halal'],
  },
  {
    slug: 'is-e471-halal',
    question: 'Is E471 halal?',
    verdict: '⚠️ Depends on the origin',
    short:
      'E471 (mono- and diglycerides) can be plant-based (halal) or animal-derived (doubtful). Labels almost never say which.',
    answer: [
      'E471 is one of the most common emulsifiers — in sliced bread, biscuits, ice cream, margarine and pastries. It is made from fats that can be vegetable (palm, soy, sunflower) or animal.',
      'Plant-based E471 is halal. Animal-derived E471 may come from pork or from cattle not slaughtered Islamically, making it problematic — and regulations do not require the origin to be stated on the packaging.',
      'In practice: if the label says “vegetable origin” or the product carries a halal logo, you are fine. Otherwise, contact the brand (most reply quickly on social media) or choose a certified alternative.',
    ],
    category: 'Additives',
    related: ['is-e422-glycerine-halal', 'is-gelatine-halal', 'is-e120-carmine-halal'],
  },
  {
    slug: 'is-e422-glycerine-halal',
    question: 'Is E422 (glycerine) halal?',
    verdict: '⚠️ Depends on the origin',
    short:
      'Glycerine (E422) is halal when vegetable or synthetic, doubtful when animal-derived and unlabelled.',
    answer: [
      'E422 — glycerol or glycerine — is a humectant found in cakes, chewing gum, toothpaste, syrups and e-liquids. Like E471, it can be produced from plants (the most common today), synthetically, or from animal fats.',
      'Vegetable or synthetic glycerine is halal. Animal glycerine raises the same issue as gelatine: if it comes from pork or non-ritually slaughtered animals, it should be avoided.',
      'The good news: most glycerine used in Europe and North America today is plant-based (rapeseed, palm). For a product you consume daily, one quick message to the brand settles the question.',
    ],
    category: 'Additives',
    related: ['is-e471-halal', 'is-gelatine-halal'],
  },
  {
    slug: 'is-shellac-e904-halal',
    question: 'Is shellac (E904) halal?',
    verdict: '⚠️ Tolerated by many, debated',
    short:
      'Shellac is a resin secreted by an insect, used to glaze sweets and fruit. Many scholars tolerate it; some avoid it.',
    answer: [
      'E904 — shellac — is the glazing agent that makes sweets, chocolate dragées, supermarket apples and some tablets shiny. It is a resin secreted by the lac insect.',
      'The nuance versus E120: the insect is not crushed into the product — its secretion is harvested, much like honey from bees. That is why many scholars tolerate shellac. Others avoid it as a precaution, particularly within the Hanafi school.',
      'It is a known “grey zone” additive. If you follow a strict view, avoid it; otherwise the tolerant position is widespread and well argued. Certified halal products settle the question for you.',
    ],
    category: 'Additives',
    related: ['is-e120-carmine-halal', 'is-gelatine-halal'],
  },
  {
    slug: 'are-e631-e627-halal',
    question: 'Are E631 and E627 halal?',
    verdict: '⚠️ Depends on the source',
    short:
      'Flavour enhancers E631 and E627 can come from fish or yeast (halal), but sometimes from meat — including pork.',
    answer: [
      'E631 (disodium inosinate) and E627 (disodium guanylate) are flavour enhancers that usually accompany MSG in crisps, instant noodles and savoury snacks.',
      'Their source varies: fish (sardines) or yeast extracts — halal — but they can also be produced from meat, including pork in some Asian supply chains. The label never tells you which.',
      'In practice: on a certified halal product, no issue. Without certification, this is the classic case where checking with the brand — or choosing plain flavours — is simplest. Non-certified instant noodles are the most frequently concerned products.',
    ],
    category: 'Additives',
    related: ['is-e471-halal', 'is-mcdonalds-halal'],
  },
  {
    slug: 'is-vanilla-extract-halal',
    question: 'Is vanilla extract halal?',
    verdict: '⚠️ Vanillin yes — alcohol extract debated',
    short:
      'Synthetic vanillin is halal. Liquid vanilla extract is macerated in alcohol — scholars differ on such traces.',
    answer: [
      'Two different products hide behind vanilla flavour. Vanillin — the synthetic aroma used in most industrial products — is made without significant residual alcohol and is considered halal.',
      'Natural liquid vanilla extract, however, is traditionally obtained by macerating vanilla pods in an alcohol solution (often 35%). Used in tiny amounts in a cake, the alcohol becomes undetectable — many scholars tolerate these non-intoxicating technical traces, while stricter views avoid them.',
      'Debate-free alternatives: whole vanilla pods, vanilla powder, or alcohol-free extracts based on vegetable glycerine, easily found in health-food shops.',
    ],
    category: 'Additives',
    related: ['can-muslims-eat-food-cooked-with-alcohol', 'is-soy-sauce-halal'],
  },

  // ─── PRODUCTS ───────────────────────────────────────────────────────────────
  {
    slug: 'are-haribo-halal',
    question: 'Are Haribo sweets halal?',
    verdict: '⚠️ Depends on the range',
    short:
      'Most Haribo sold in the UK and Europe contain pork gelatine — but Haribo also makes certified halal ranges in Turkey.',
    answer: [
      'The bad news first: classic Haribo sweets sold in the UK, France and most of Europe (Goldbears, Starmix, Tangfastics…) contain pork gelatine. They are not halal.',
      'The good news: Haribo operates a factory in Turkey producing fully halal ranges made with certified beef gelatine. You will find them in Muslim grocery stores and online, with the halal logo printed on the packet.',
      'The reflex: check the packet. “Made in Turkey” plus a halal logo means you are fine. Plain “gelatine” on a European packet almost always means pork. Plenty of dedicated halal sweet brands offer the same classics too.',
    ],
    category: 'Products',
    related: ['is-gelatine-halal', 'are-marshmallows-halal', 'are-mms-halal'],
  },
  {
    slug: 'are-mms-halal',
    question: 'Are M&M’s halal?',
    verdict: '⚠️ Not certified',
    short:
      'M&M’s contain no gelatine in Europe, but Mars does not certify them halal and does not guarantee their status.',
    answer: [
      'Classic M&M’s (chocolate, peanut) sold in Europe list no gelatine among their ingredients. On paper, the composition looks acceptable.',
      'However, Mars does not certify M&M’s halal and has publicly stated they are not suitable for halal diets as production lines are not audited. Some editions in other countries have contained debated additives or colourings.',
      'In practice: many Muslims consume them based on the ingredient list; stricter consumers choose certified chocolate instead. Always check the exact edition in your hands — recipes vary by country.',
    ],
    category: 'Products',
    related: ['are-haribo-halal', 'are-oreos-halal', 'is-nutella-halal'],
  },
  {
    slug: 'are-oreos-halal',
    question: 'Are Oreos halal?',
    verdict: '⚠️ Not certified (no gelatine)',
    short:
      'European Oreos contain no gelatine or animal ingredients, but Mondelez does not certify them halal.',
    answer: [
      'The recipe of European Oreos is simple: flour, sugar, vegetable oils, cocoa, starch, raising agents, emulsifiers (lecithins). No gelatine, no animal fat — Mondelez has confirmed this publicly for the European market.',
      'The brand adds that Oreos are “not halal certified”: no certification body audits the production lines. It is the same situation as Nutella or KitKat — acceptable to most based on composition, avoided by the strictest.',
      'When travelling in Muslim countries you will find locally produced, halal-certified Oreos. Same biscuit, extra stamp.',
    ],
    category: 'Products',
    related: ['is-nutella-halal', 'are-mms-halal', 'is-coca-cola-halal'],
  },
  {
    slug: 'is-nutella-halal',
    question: 'Is Nutella halal?',
    verdict: '⚠️ Not certified (clean composition)',
    short:
      'Nutella contains no gelatine, alcohol or problematic animal ingredient — but is not halal certified in Europe.',
    answer: [
      'Nutella’s ingredient list is short: sugar, palm oil, hazelnuts, cocoa, skimmed milk powder, lecithins, vanillin. No gelatine, no alcohol, no meat-derived ingredient.',
      'Ferrero does not certify Nutella halal in Europe, so it is a question of personal standard: the vast majority of Muslim consumers eat it based on its composition, while the strictest prefer a certified spread.',
      'Worth knowing: in Turkey, the Gulf and several Muslim countries, locally produced Nutella carries an official halal certification.',
    ],
    category: 'Products',
    related: ['are-oreos-halal', 'are-mms-halal', 'is-vanilla-extract-halal'],
  },
  {
    slug: 'is-mcdonalds-halal',
    question: 'Is McDonald’s halal in the UK and US?',
    verdict: '❌ Not in the UK/US/Europe',
    short:
      'McDonald’s serves no halal meat in the UK, US or Europe. In Muslim countries, however, McDonald’s is fully halal.',
    answer: [
      'McDonald’s position in the UK, the US and Europe is official: no halal meat is served. Beef and chicken come from standard supply chains, and the brand states it has no plans to change this.',
      'What remains possible depending on your standard: the Filet-O-Fish and fries (in the UK fries are vegetarian-friendly; in the US check local practices) — with the usual questions about shared fryers for the strictest.',
      'Abroad, everything changes: in Morocco, Turkey, the UAE, Malaysia, Indonesia and across the Muslim world, McDonald’s is fully halal certified. The Big Mac in Marrakech is halal; the one in London is not.',
    ],
    category: 'Products',
    related: ['is-kfc-halal', 'are-prawns-and-seafood-halal', 'is-supermarket-meat-halal'],
  },
  {
    slug: 'is-kfc-halal',
    question: 'Is KFC halal in the UK?',
    verdict: '⚠️ Around 130 UK branches are — check the list',
    short:
      'KFC runs an official list of halal-approved branches in the UK (about 130). All other branches serve standard chicken.',
    answer: [
      'KFC is a special case in the UK: the chain operates a set of officially halal-approved restaurants — around 130 branches, mostly in areas with large Muslim communities — supplied with halal chicken and listed on KFC’s own website.',
      'Everywhere else, KFC serves standard chicken. So “is KFC halal?” has no single answer: it depends entirely on YOUR branch. Check the official halal branch list, and note that certification details (stunning methods) matter to some consumers — HMC does not endorse KFC, which follows its own scheme.',
      'In Muslim countries, KFC is fully halal. And if your local branch is not on the list, the independent halal fried chicken scene in the UK is second to none.',
    ],
    category: 'Products',
    related: ['is-mcdonalds-halal', 'is-supermarket-meat-halal'],
  },
  {
    slug: 'is-coca-cola-halal',
    question: 'Is Coca-Cola halal?',
    verdict: '✅ Generally considered halal',
    short:
      'Coca-Cola contains no alcohol or animal ingredients and is certified halal in several Muslim countries.',
    answer: [
      'Coca-Cola is a regular target of rumours, but its recipe contains no added alcohol and no animal-derived ingredient: carbonated water, sugar, caramel colour (E150d), phosphoric acid, natural flavourings, caffeine.',
      'The question of infinitesimal alcohol traces in some flavourings — present in countless everyday products, fruit juices included — is considered negligible by virtually all certification bodies: they do not come from an intoxicating drink and are undetectable.',
      'Coca-Cola is officially certified halal in several Muslim countries (Saudi Arabia, UAE, Malaysia…) where it is produced locally. The overwhelming majority of scholars and consumers consider it permissible.',
    ],
    category: 'Products',
    related: ['is-red-bull-halal', 'are-energy-drinks-halal'],
  },
  {
    slug: 'is-red-bull-halal',
    question: 'Is Red Bull halal?',
    verdict: '✅ Generally considered halal',
    short:
      'Red Bull contains no alcohol, and its taurine is 100% synthetic — not animal-derived. It is generally considered halal.',
    answer: [
      'Two myths follow Red Bull around: that it contains alcohol (false — it is a soft drink) and that its taurine comes from bulls (false — the taurine used is entirely synthetic, made in laboratories).',
      'Its composition (carbonated water, sugar, synthetic taurine, caffeine, B vitamins) raises no halal issue, and the drink is sold freely across the Gulf, often with local certification.',
      'What remains is the health debate — energy drinks are not recommended for children or in large quantities — but that is a health matter, not a question of permissibility.',
    ],
    category: 'Products',
    related: ['are-energy-drinks-halal', 'is-coca-cola-halal'],
  },
  {
    slug: 'are-energy-drinks-halal',
    question: 'Are energy drinks (Monster, etc.) halal?',
    verdict: '✅ Generally — with exceptions to check',
    short:
      'Most energy drinks (Monster, Red Bull…) are alcohol-free with synthetic taurine: generally halal. Check niche brands.',
    answer: [
      'The big names — Monster, Red Bull, Rockstar — are alcohol-free and use synthetic taurine and caffeine: nothing in their standard recipes poses a halal problem, and they are widely sold in Muslim countries.',
      'Two things to check on niche or imported brands: unusual additives (carmine E120 in some red drinks) and “flavoured with” mentions that may involve alcohol-based flavour carriers — the same trace debate as elsewhere.',
      'The main conversation around energy drinks is health, not halal: very high caffeine and sugar content. Moderation applies to every consumer.',
    ],
    category: 'Products',
    related: ['is-red-bull-halal', 'is-e120-carmine-halal', 'is-coca-cola-halal'],
  },
  {
    slug: 'are-marshmallows-halal',
    question: 'Are marshmallows halal?',
    verdict: '⚠️ Usually not — halal versions exist',
    short:
      'Standard marshmallows are made with pork gelatine. Halal marshmallows use fish or halal beef gelatine.',
    answer: [
      'Classic marshmallows owe their texture to gelatine — almost always pork gelatine in mainstream brands. Standard marshmallows, and the mallow toppings on hot chocolates and cakes, are therefore not halal.',
      'The alternatives are excellent: halal marshmallows made with fish gelatine or certified beef gelatine are widely available in Muslim stores and online, and vegan marshmallows (made without any gelatine) are another safe option — just check for alcohol-based flavourings.',
      'Reflex when eating out: ask what tops your hot chocolate or dessert. And at the supermarket, “fish gelatine” or a halal logo on the packet is what you are looking for.',
    ],
    category: 'Products',
    related: ['is-gelatine-halal', 'is-fish-gelatine-halal', 'are-haribo-halal'],
  },

  // ─── FOOD ───────────────────────────────────────────────────────────────────
  {
    slug: 'is-supermarket-meat-halal',
    question: 'Is supermarket meat halal?',
    verdict: '❌ Not unless certified',
    short:
      'Standard supermarket meat does not meet the conditions of Islamic slaughter. Only certified halal ranges do.',
    answer: [
      'For meat to be halal, the animal must be slaughtered under precise conditions: a permissible animal, complete bleeding, and the invocation of Allah’s name at slaughter. Standard Western supply chains do not meet these requirements.',
      'Some cite the permission of the “food of the People of the Book” (Qur’an 5:5), but the great majority of contemporary scholars consider that modern industrial methods (stunning that may kill before bleeding, no invocation, incomplete bleeding) do not constitute valid slaughter — so standard supermarket meat is not considered halal.',
      'In practice: use halal butchers and certified ranges — in the UK, look for HMC (stricter) or HFA certification and know the difference; supermarket halal ranges exist in most chains. Fish needs no certification at all.',
    ],
    category: 'Food',
    related: ['is-kfc-halal', 'are-prawns-and-seafood-halal', 'is-cheese-halal-rennet'],
  },
  {
    slug: 'are-prawns-and-seafood-halal',
    question: 'Are prawns and seafood halal?',
    verdict: '✅ Fish: yes · ⚠️ Shellfish: school-dependent',
    short:
      'Fish is unanimously halal with no ritual slaughter needed. Prawns and shellfish are halal for the majority, debated in the Hanafi school.',
    answer: [
      'Fish is halal by unanimity and requires no ritual slaughter: “Lawful to you is the game of the sea and its food” (Qur’an 5:96). You can order fish anywhere — just watch the cooking (wine-based sauces, shared fryers with non-halal products).',
      'For seafood — prawns, crab, mussels, squid — three schools out of four (Maliki, Shafi‘i, Hanbali) consider everything that lives exclusively in the sea permissible. The Hanafi school permits only “samak” (fish), so crustaceans and molluscs are discouraged or impermissible depending on the opinion followed.',
      'Practically: if you follow the Hanafi school, skip the prawns; otherwise they are permissible for the majority. Tuna, salmon, cod and sardines are a safe bet for everyone.',
    ],
    category: 'Food',
    related: ['is-supermarket-meat-halal', 'is-fish-gelatine-halal', 'can-muslims-eat-food-cooked-with-alcohol'],
  },
  {
    slug: 'can-muslims-eat-food-cooked-with-alcohol',
    question: 'Can Muslims eat food cooked with alcohol?',
    verdict: '❌ Not for the majority',
    short:
      'Alcohol never fully evaporates in cooking, and deliberately cooking with wine or spirits is impermissible for most scholars.',
    answer: [
      'Coq au vin, beer-battered fish, tiramisu, wine sauces… The claim that “alcohol burns off in cooking” is scientifically false: measurements show alcohol remains even after hours of simmering (up to 5% after two and a half hours).',
      'More importantly, for the majority of scholars the issue is not only the residual amount: deliberately using an intoxicating drink (khamr) in food is impermissible whatever the dose. Dishes cooked with alcohol are therefore to be avoided.',
      'Distinguish this from involuntary technical traces (flavour carriers, natural fruit fermentation), which most certification bodies deem negligible. In restaurants, always ask whether sauces contain wine — routine in French and Italian cooking.',
    ],
    category: 'Food',
    related: ['is-vanilla-extract-halal', 'is-soy-sauce-halal', 'is-supermarket-meat-halal'],
  },
  {
    slug: 'is-cheese-halal-rennet',
    question: 'Is cheese halal? (the rennet question)',
    verdict: '✅ Tolerated by the majority',
    short:
      'Most scholars tolerate cheese made with animal rennet. Stricter consumers choose microbial-rennet or certified cheeses.',
    answer: [
      'Rennet is the enzyme that curdles milk. It can be animal (from calf stomachs), microbial or vegetable. Many traditional cheeses use animal rennet.',
      'Historically, a large body of scholars permitted cheese without investigating the rennet’s origin — the quantity used is minute and transformed. This remains the most widespread view today: cheese made with animal rennet is tolerated.',
      'Stricter consumers prefer microbial rennet — the case for most industrial cheeses (look for “microbial coagulant” or the vegetarian label, which excludes animal rennet by definition) — or certified halal cheese. Both approaches are respectable.',
    ],
    category: 'Food',
    related: ['is-supermarket-meat-halal', 'is-gelatine-halal'],
  },
  {
    slug: 'is-soy-sauce-halal',
    question: 'Is soy sauce halal?',
    verdict: '⚠️ Depends on the type',
    short:
      'Naturally fermented soy sauce contains 1–3% residual alcohol — views differ. Alcohol-free and certified versions exist.',
    answer: [
      'A surprise for many: traditional soy sauce (Japanese shoyu) contains 1–3% alcohol, naturally produced during fermentation of the soy and wheat. It is not an additive — it is the process itself.',
      'Views differ: some scholars prohibit it (measurable alcohol), others tolerate it since this fermentation alcohol is not khamr made to intoxicate and the sauce cannot make you drunk. Asian certification bodies (Malaysia’s JAKIM among others) certify soy sauces produced without alcoholic fermentation or treated to remove it.',
      'In practice: to skip the debate, pick a certified halal soy sauce (Asian and Muslim groceries stock them) or chemically hydrolysed versions without fermentation. At the Japanese restaurant, it is the same conversation as mirin — ask.',
    ],
    category: 'Food',
    related: ['can-muslims-eat-food-cooked-with-alcohol', 'is-vanilla-extract-halal'],
  },
  {
    slug: 'is-fish-gelatine-halal',
    question: 'Is fish gelatine halal?',
    verdict: '✅ Halal',
    short:
      'Fish gelatine is halal with no slaughter conditions — the ideal alternative for gummies and desserts.',
    answer: [
      'Fish gelatine is extracted from fish skin and bones. Since fish is halal without ritual slaughter, its gelatine is too — the unanimous view across all schools, including the Hanafi school (fish being permissible for everyone).',
      'You will find it in halal marshmallows, certified gummies and supplements. On labels, look for “fish gelatine” spelled out: plain “gelatine” almost always means pork or beef.',
      'It is one of the three great halal alternatives to standard gelatine, alongside pectin (E440) and carrageenan (E407) — no one has to give up gummy bears.',
    ],
    category: 'Food',
    related: ['is-gelatine-halal', 'are-marshmallows-halal', 'are-prawns-and-seafood-halal'],
  },

  // ─── PRACTICE ───────────────────────────────────────────────────────────────
  {
    slug: 'halal-meal-on-plane-moml',
    question: 'How do I get a halal meal on a plane?',
    verdict: '✈️ Guide',
    short:
      'Request the “MOML” (Moslem Meal) at least 48 hours before your flight. Some airlines serve halal to everyone by default.',
    answer: [
      'Most major airlines offer a Muslim meal on request: the code is MOML (Moslem Meal), selectable when booking or at the latest 48 hours before departure, via the website, app or customer service.',
      'Some airlines serve halal to all passengers with nothing to request: Emirates, Qatar Airways, Etihad, Turkish Airlines, Saudia, Royal Air Maroc, Malaysia Airlines… On European and American carriers, the MOML must be pre-ordered — there is none on board otherwise.',
      'Tips: on low-cost flights without meals, bring your own (on-board sandwiches are rarely halal); check snacks for gelatine; and if in doubt about a served dish, the vegetarian option (VLML) is the classic plan B.',
    ],
    category: 'Practice',
    related: ['how-to-pray-on-a-plane', 'fasting-ramadan-while-travelling'],
  },
  {
    slug: 'how-to-pray-on-a-plane',
    question: 'How do I pray on a plane?',
    verdict: '🕌 Practical guide',
    short:
      'On a plane: stand facing the qibla if possible, otherwise pray seated out of necessity — or combine prayers on arrival.',
    answer: [
      'First option, best when possible: pray standing in a free area of the cabin (near the galleys, with crew approval), facing the qibla at the start. On Gulf carriers and Saudia this is common — some aircraft even have a prayer area.',
      'If impossible (turbulence, full flight, crew instructions): praying seated at your place is permitted out of necessity, bowing the torso for rukū‘ and slightly more for sujūd. Many scholars recommend repeating the prayer on arrival as a precaution; others consider it valid as is.',
      'Third route, often simplest: use the traveller’s facilities and combine prayers (dhuhr+asr, maghrib+isha) before take-off or after landing when the time window allows. Prayer apps give in-flight times — you follow the time of the region you are flying over, and for breaking the fast, the sunset seen from the plane.',
    ],
    category: 'Practice',
    related: ['halal-meal-on-plane-moml', 'fasting-ramadan-while-travelling'],
  },
  {
    slug: 'fasting-ramadan-while-travelling',
    question: 'Do I have to fast during Ramadan while travelling?',
    verdict: '🌙 You may postpone and make up',
    short:
      'The Qur’an grants travellers the concession of postponing fasting days and making them up later (Qur’an 2:185).',
    answer: [
      '“Whoever is ill or on a journey — then an equal number of other days” (Qur’an 2:185). The traveller enjoys an explicit concession: not fasting during the journey and making up the missed days after Ramadan.',
      'The usual conditions retained by scholars: a journey of significant distance (often estimated around 80 km and more, with divergences). Fasting while travelling remains valid — and preferable for those who find no hardship in it; taking the concession is better when the journey is demanding.',
      'Practical tips if you do fast on the road: follow the times of wherever you are (not your departure city), keep dates and water in your bag for iftar on the move, and on long flights break your fast when you see the sun set from the plane.',
    ],
    category: 'Practice',
    related: ['halal-meal-on-plane-moml', 'how-to-pray-on-a-plane'],
  },
]

export function getHalalQA(slug: string): HalalQA | undefined {
  return HALAL_QA_EN.find((q) => q.slug === slug)
}

export const HALAL_QA_CATEGORIES: HalalQA['category'][] = ['Additives', 'Products', 'Food', 'Practice']
