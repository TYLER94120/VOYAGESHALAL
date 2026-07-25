// Section Audio / Spirituel — données des pistes.
// AUDIO : uniquement des sources LIBRES ET LÉGALES — API alquran.cloud
// (CDN cdn.islamic.network, récitation Mishary Rashid Alafasy, API gratuite
// et publique). Aucune récitation copyrightée intégrée sans droits.
// TEXTES des dou'as : Hisn al-Muslim (« La citadelle du musulman »), avec la
// référence du hadith — les dou'as sont affichées en texte (arabe +
// phonétique + traduction), sans audio tant qu'une source libre n'existe pas.

export interface Track {
  id: string
  titre: string
  titreEn: string
  sousTitre?: string
  sousTitreEn?: string
  // Audio (sourates) — URL CDN libre ; absent pour les dou'as (texte seul)
  audio?: string
  duree?: string
  arabe?: string
  phonetique?: string
  fr?: string
  en?: string
  source?: string
}

// Sourates du voyage & de la protection — audio complet (128 kbps)
const CDN = 'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy'
export const SOURATES: Track[] = [
  { id: 'fatiha', titre: 'Al-Fâtiha', titreEn: 'Al-Fatiha', sousTitre: 'L\'Ouverture · sourate 1', sousTitreEn: 'The Opening · surah 1', audio: `${CDN}/1.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'ayat-kursi', titre: 'Âyat al-Kursî', titreEn: 'Ayat al-Kursi', sousTitre: 'Le Verset du Trône · 2:255', sousTitreEn: 'The Throne Verse · 2:255', audio: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3', source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'yasin', titre: 'Yâ-Sîn', titreEn: 'Ya-Sin', sousTitre: 'Sourate 36', sousTitreEn: 'Surah 36', audio: `${CDN}/36.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'mulk', titre: 'Al-Mulk', titreEn: 'Al-Mulk', sousTitre: 'La Royauté · sourate 67', sousTitreEn: 'The Sovereignty · surah 67', audio: `${CDN}/67.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'ikhlas', titre: 'Al-Ikhlâs', titreEn: 'Al-Ikhlas', sousTitre: 'Le Monothéisme pur · sourate 112', sousTitreEn: 'Sincerity · surah 112', audio: `${CDN}/112.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'falaq', titre: 'Al-Falaq', titreEn: 'Al-Falaq', sousTitre: 'L\'Aube naissante · sourate 113', sousTitreEn: 'The Daybreak · surah 113', audio: `${CDN}/113.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
  { id: 'nas', titre: 'An-Nâs', titreEn: 'An-Nas', sousTitre: 'Les Hommes · sourate 114', sousTitreEn: 'Mankind · surah 114', audio: `${CDN}/114.mp3`, source: 'Récitation M. R. Alafasy · API alquran.cloud (libre)' },
]

// Dou'as du voyageur — texte intégral (arabe + phonétique + traduction), sourcé
export const DOUAS: Track[] = [
  {
    id: 'dua-voyage',
    titre: 'Dou\'a du voyageur',
    titreEn: 'Traveler\'s dua',
    sousTitre: 'Au départ en voyage',
    sousTitreEn: 'When setting out on a journey',
    arabe: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى. اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ. اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ',
    phonetique: 'Allāhu akbar, Allāhu akbar, Allāhu akbar. Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā la-munqalibūn. Allāhumma innā nas\'aluka fī safarinā hādhā-l-birra wa-t-taqwā, wa mina-l-\'amali mā tarḍā. Allāhumma hawwin \'alaynā safaranā hādhā wa-ṭwi \'annā bu\'dah. Allāhumma anta-ṣ-ṣāḥibu fī-s-safar, wa-l-khalīfatu fī-l-ahl.',
    fr: 'Allah est le plus Grand (×3). Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer. C\'est vers notre Seigneur que nous retournerons. Ô Allah, nous Te demandons dans ce voyage la bonté et la piété, et des œuvres qui Te satisfont. Ô Allah, facilite-nous ce voyage et raccourcis-en la distance. Ô Allah, Tu es le Compagnon du voyage et le Protecteur de la famille.',
    en: 'Allah is the Greatest (×3). Glory to Him who has subjected this to us, and we could never have it by our own efforts. Surely, to our Lord we are returning. O Allah, we ask You on this journey for righteousness and piety, and for deeds that please You. O Allah, make this journey easy for us and fold up its distance. O Allah, You are the Companion on the journey and the Guardian of the family.',
    source: 'Muslim 1342 · Hisn al-Muslim',
  },
  {
    id: 'dua-vehicule',
    titre: 'En montant dans un véhicule',
    titreEn: 'When boarding a vehicle',
    sousTitre: 'Voiture, avion, train, bateau',
    sousTitreEn: 'Car, plane, train, boat',
    arabe: 'بِسْمِ اللَّهِ، وَالْحَمْدُ لِلَّهِ. سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. الْحَمْدُ لِلَّهِ، الْحَمْدُ لِلَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ',
    phonetique: 'Bismillāh, wa-l-ḥamdu lillāh. Subḥāna-lladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn, wa innā ilā rabbinā la-munqalibūn. Al-ḥamdu lillāh (×3), Allāhu akbar (×3).',
    fr: 'Au nom d\'Allah, et louange à Allah. Gloire à Celui qui a mis ceci à notre service alors que nous n\'étions pas capables de le dominer. C\'est vers notre Seigneur que nous retournerons. Louange à Allah (×3), Allah est le plus Grand (×3).',
    en: 'In the name of Allah, and praise be to Allah. Glory to Him who has subjected this to us, and we could never have it by our own efforts. Surely, to our Lord we are returning. Praise be to Allah (×3), Allah is the Greatest (×3).',
    source: 'Abû Dâwud 2602 · Tirmidhî 3446 · Hisn al-Muslim',
  },
  {
    id: 'dua-ville',
    titre: 'En entrant dans une ville',
    titreEn: 'When entering a town',
    sousTitre: 'À l\'arrivée à destination',
    sousTitreEn: 'On arriving at your destination',
    arabe: 'اللَّهُمَّ رَبَّ السَّمَوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ، وَرَبَّ الْأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ، وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ، وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ، أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَخَيْرَ مَا فِيهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا',
    phonetique: 'Allāhumma rabba-s-samāwāti-s-sab\'i wa mā aẓlaln, wa rabba-l-araḍīna-s-sab\'i wa mā aqlaln, wa rabba-sh-shayāṭīni wa mā aḍlaln, wa rabba-r-riyāḥi wa mā dharayn. As\'aluka khayra hādhihi-l-qaryati wa khayra ahlihā wa khayra mā fīhā, wa a\'ūdhu bika min sharrihā wa sharri ahlihā wa sharri mā fīhā.',
    fr: 'Ô Allah, Seigneur des sept cieux et de ce qu\'ils couvrent, Seigneur des sept terres et de ce qu\'elles portent, Seigneur des démons et de ceux qu\'ils égarent, Seigneur des vents et de ce qu\'ils dispersent : je Te demande le bien de cette ville, le bien de ses habitants et le bien de ce qu\'elle contient ; et je me réfugie auprès de Toi contre son mal, le mal de ses habitants et le mal de ce qu\'elle contient.',
    en: 'O Allah, Lord of the seven heavens and all they shade, Lord of the seven earths and all they carry, Lord of the devils and all they lead astray, Lord of the winds and all they scatter: I ask You for the good of this town, the good of its people and the good within it; and I seek refuge in You from its evil, the evil of its people and the evil within it.',
    source: 'Al-Hâkim 1/446 · Hisn al-Muslim',
  },
  {
    id: 'dua-protection',
    titre: 'Protection lors d\'une halte',
    titreEn: 'Protection when stopping',
    sousTitre: 'Hôtel, campement, étape',
    sousTitreEn: 'Hotel, camp, stopover',
    arabe: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    phonetique: 'A\'ūdhu bi-kalimāti-llāhi-t-tāmmāti min sharri mā khalaq.',
    fr: 'Je me réfugie dans les paroles parfaites d\'Allah contre le mal de ce qu\'Il a créé. (Celui qui la prononce en s\'arrêtant quelque part, rien ne lui nuira jusqu\'à son départ.)',
    en: 'I seek refuge in the perfect words of Allah from the evil of what He has created. (Whoever says this when stopping somewhere, nothing will harm them until they depart.)',
    source: 'Muslim 2708 · Hisn al-Muslim',
  },
]

// Adhkâr essentiels du matin et du soir (texte)
export const ADHKAR: Track[] = [
  {
    id: 'adhkar-protection',
    titre: 'Adhkâr matin & soir — protection',
    titreEn: 'Morning & evening adhkar — protection',
    sousTitre: 'À dire 3 fois',
    sousTitreEn: 'Say 3 times',
    arabe: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    phonetique: 'Bismillāhi-lladhī lā yaḍurru ma\'a-smihi shay\'un fī-l-arḍi wa lā fī-s-samā\'i wa huwa-s-samī\'u-l-\'alīm. (×3)',
    fr: 'Au nom d\'Allah, tel qu\'avec Son nom rien ne peut nuire, ni sur terre ni au ciel ; Il est l\'Audient, l\'Omniscient. (3 fois matin et soir)',
    en: 'In the name of Allah, with whose name nothing can harm on earth or in heaven; He is the All-Hearing, the All-Knowing. (3 times morning and evening)',
    source: 'Abû Dâwud 5088 · Tirmidhî 3388 · Hisn al-Muslim',
  },
  {
    id: 'adhkar-rida',
    titre: 'Adhkâr matin & soir — satisfaction',
    titreEn: 'Morning & evening adhkar — contentment',
    sousTitre: 'À dire 3 fois',
    sousTitreEn: 'Say 3 times',
    arabe: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    phonetique: 'Raḍītu billāhi rabban, wa bil-islāmi dīnan, wa bi-Muḥammadin ṣallā-llāhu \'alayhi wa sallama nabiyyan. (×3)',
    fr: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion et Muhammad ﷺ comme Prophète. (3 fois matin et soir)',
    en: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet. (3 times morning and evening)',
    source: 'Abû Dâwud 5072 · Hisn al-Muslim',
  },
]
