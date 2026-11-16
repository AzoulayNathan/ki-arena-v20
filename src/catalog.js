import {canonStats} from './canon.js';
/* KI ARENA — catalogue pilote. Les entrées sont des propositions de game design, pas des statistiques officielles. */
export const RARITIES = Object.freeze({
  common:    {label:'Commune',       color:'#dce1e9', rate:33, effects:1, sort:0},
  uncommon:  {label:'Peu commune',   color:'#65dc9a', rate:27, effects:2, sort:1},
  rare:      {label:'Rare',          color:'#6bb6ff', rate:21, effects:3, sort:2},
  epic:      {label:'Épique',        color:'#c28aff', rate:15, effects:4, sort:3},
  legendary: {label:'Légendaire',    color:'#f3c966', rate:4,  effects:5, sort:4}
});

/* Nom | série | forme/édition | archétype | signature / effet 1 | basePower (relative) */
const RAW = {
  common: `
Bulma|DB|Aventurière|support|Gadget Capsule|21
Oolong|DB|Métamorphe|trickster|Transformation improvisée|22
Plume|DB|Métamorphe|trickster|Évasion féline|22
Pilaf|DB|Empereur autoproclamé|tech|Piège du Pilaf Gang|20
Shu|DB|Ninja du Pilaf Gang|speed|Attaque furtive|24
Mai|DB|Pilaf Gang|sniper|Tir précis|23
Tortue de mer|DB|Compagnon de Roshi|guardian|Carapace protectrice|21
Chichi|DB|Enfant combattante|martial|Lame du casque|29
Bora|DB|Protecteur de Karin|guardian|Défense de la tour|32
Upa|DB|Jeune allié|support|Courage d’Upa|20
Suno|DB|Village Jingle|support|Secours de Suno|20
Nam|DB|Tournoi mondial|martial|Attaque aérienne|38
Ranfan|DB|Tournoi mondial|trickster|Feinte de Ranfan|25
Bactérien|DB|Tournoi mondial|poison|Odeur insoutenable|25
Giran|DB|Tournoi mondial|guardian|Résistance de Giran|31
Roi Chappa|DB|Artiste martial|martial|Huit bras|34
Colonel Silver|DB|Ruban Rouge|sniper|Tir du colonel|26
Général White|DB|Ruban Rouge|guardian|Forteresse du Muscle Tower|28
Ninja Murasaki|DB|Ruban Rouge|trickster|Technique de dissimulation|30
Commandant Red|DB|Ruban Rouge|tech|Ordre du commandant|21
Conseiller Black|DB|Ruban Rouge|sniper|Arsenal secret|30
Docteur Flappe|DB|Scientifique|support|Réparation urgente|22
Lance|DB|Forme gentille|support|Soutien de Lance|22
Lance|DB|Forme agressive|sniper|Tir de Lance|28
Roi Gyumao|DB|Guerrier du mont Fry-Pan|guardian|Hache du roi|29
Grand-père Gohan|DB|Maître martial|martial|Dernier enseignement|35
Yajirobé|DBZ|Guerrier solitaire|assassin|Lame opportuniste|33
Mister Satan|DBZ|Champion du monde|trickster|Chance du champion|24
Spopovitch|DBZ|Serviteur de Babidi|berserker|Endurance anormale|33
Yamu|DBZ|Serviteur de Babidi|poison|Absorption d'énergie|31
Bubbles|DBZ|Planète de Kaio|speed|Agilité de Bubbles|23
Gregory|DBZ|Planète de Kaio|speed|Marteau éclair|25
Monaka|DBS|Livreur intergalactique|trickster|Bluff cosmique|21
Chichi|DBZ|Vie de famille|martial|Détermination de Chichi|29
Marron|DBZ|Fille de Krilin|support|Soutien familial|20
Erasa|DBZ|Orange Star|support|Encouragement d'Erasa|20
Sharpner|DBZ|Orange Star|martial|Défi sportif|24
Dr Brief|DBZ|Capsule Corporation|tech|Génie des capsules|20
Panchy|DBZ|Capsule Corporation|support|Hospitalité|20
Roi Furry|DB|Roi de la Terre|support|Rassemblement royal|21
Colonel Violet|DB|Ruban Rouge|assassin|Opération clandestine|26
Colonel Yellow|DB|Ruban Rouge|sniper|Menace aérienne|26
Sergent Metallic|DB|Muscle Tower|android|Fusée mécanique|34
Pamput|DB|22e Tournoi|martial|Champion arrogant|29
Loup-garou|DB|22e Tournoi|martial|Griffes lunaires|27
Piano|DB|Clan du Roi Démon|demon|Conseiller démoniaque|26
Idasa|DBZ|Tournoi junior|martial|Frappe insolente|23
Ikose|DBZ|Tournoi junior|martial|Frappe junior|23
Bee|DBZ|Compagnon de Boo|support|Courage de Bee|20
Bibidi|DBZ|Sorcier originel|tech|Magie obscure|27
Jewel|DBZ|25e Tournoi|martial|Frappe vaniteuse|30
Killa|DBZ|25e Tournoi|martial|Attaque de Killa|31
Nink|DBS|Univers 4|guardian|Prise d'étau|32
Napapa|DBS|Univers 10|guardian|Charge de Napapa|33
Jirasen|DBS|Univers 10|martial|Tactique prudente|26
Rylibeu|DBS|Univers 10|speed|Envolée fulgurante|28
Shantza|DBS|Univers 4|trickster|Illusions de Shantza|30
Dercori|DBS|Univers 4|trickster|Talismans illusoires|28
Rozie|DBS|Univers 2|sniper|Poings de lumière|34
Kakunsa|DBS|Univers 2|speed|Griffes flamboyantes|36
Comfrey|DBS|Univers 9|berserker|Corps à corps sauvage|31
Catopesra|DBS|Univers 3|tech|Changement de mode|35
Ganos|DBS|Univers 4|speed|Plumage foudroyant|34
Zuno|DBS|Sage intergalactique|support|Réponse absolue|22
Zarbuto|DBS|Univers 2|martial|Amour intrépide|30
Zirloin|DBS|Univers 2|martial|Détermination cosmique|30
Akkuman|DB|Combattant du palais d'Enma|demon|Rayon diabolique|28
Draculaman|DB|Guerrier de Baba|speed|Crocs nocturnes|26
Suke-san|DB|Homme invisible de Baba|trickster|Invisibilité|26
Mummy|DB|Combattant momie|guardian|Prise de la momie|30
Grand-père Gohan|DB|Masqué chez Baba|martial|Masque du maître|34
Baba la voyante|DB|Tour des prédictions|support|Prédiction de Baba|24
Roi Enma|DBZ|Bureau des âmes|guardian|Jugement des âmes|29
Shenron|DB|Dragon des sept boules|god|Vœu du dragon|31
Tsuru Sennin|DB|Maître de la grue|trickster|Ordre de l'école|27
Pilaf|DB|Pilote de robot|tech|Mécha du château|28
Shu|DB|Combinaison robot|tech|Gadget surprise|27
Mai|DB|Arsenal de Pilaf|sniper|Tir du château|28
Roi Piccolo|DB|Vieillard affaibli|demon|Souffle du démon|39
Tambourine|DB|Chasseur des combattants|assassin|Traque des champions|39
Cymbal|DB|Collecteur des Dragon Balls|demon|Griffes du démon|36
Tambourine|DB|Première apparition|speed|Vitesse démoniaque|37
Mutaito|DB|Maître du Mafuba|ki|Sceau du maître|42
Pan|DBZ|Bébé|support|Soutien familial|21
Bra|DBZ|Enfant de Vegeta|support|Fierté familiale|20
Kibito|DBZ|Observateur du tournoi|support|Protection divine|39
Dendé|DBZ|Gardien de la Terre|healer|Soin du gardien|40
Mister Satan|DBZ|Sauveur de la Terre|trickster|Discours du héros|28
Babidi|DBZ|Lecture du combat|tech|Mauvais sort|38
Goten|DBZ|Avant l'entraînement|martial|Esprit joueur|37
Trunks|DBZ|Enfant avant tournoi|martial|Frappe espiègle|36
Kaioshin de l'Est|DBZ|Observateur du tournoi|support|Surveillance divine|36
Vegeta|DBZ|Vie de famille|martial|Entraînement discret|40
Goku|DBZ|Vie quotidienne|martial|Fausse maladresse|42
Krilin|DBZ|Police et famille|martial|Réflexes du policier|38
C-18|DBZ|Vie de famille|android|Réflexes cyborg|40
Bulma|DBS|Laboratoire Capsule Corp|tech|Scanner de capsule|30
Beerus|DBS|En visite sur Terre|trickster|Appétit divin|40
Whis|DBS|Guide céleste|support|Conseil d'ange|39
Angela|DBZ|Lycéenne de Satan City|support|Popularité étudiante|21
Maron|DBZ|Ancienne compagne de Krilin|support|Charme embarrassant|22
Haru|DBS|Enfant de la résistance du futur|support|Courage de Haru|24
Maki|DBS|Enfant de la résistance du futur|support|Courage de Maki|24
Cargo|DBZ|Enfant de Namek|support|Appel au secours|24
Lapin Carotte|DB|Chef du gang des lapins|trickster|Toucher carotte|24
Nok|DBZ|28e Tenkaichi Budokai|martial|Élan du novice|24
Konkichi|DB|Voyageur renard|trickster|Voleur agile|25
Capitaine Chicken|DBZ|28e tournoi mondial|martial|Cri du combattant|25
Barry Kahn|DBS|Acteur de télévision|trickster|Masque du héros|26
Tights|DBS|Grande sœur de Bulma|support|Recherche spatiale|26
Oni Guide|DBZ|Guide du Bureau d'Enma|support|Orientation des âmes|27
InoShikaCho|DB|Chimère du tournoi|guardian|Charge composite|28
Mez|DBZ|Ogre de l'Autre Monde|speed|Course des enfers|28
Princesse Serpent|DBZ|Gardienne de la route du Serpent|trickster|Illusion du palais|29
Puntar|DBZ|25e tournoi mondial|guardian|Prise du colosse|30
Goz|DBZ|Ogre de l'Autre Monde|guardian|Massue des enfers|31
Oregano|DBS|Guerrier univers 9|martial|Charge d'Oregano|31
Roselle|DBS|Guerrier volant univers 9|speed|Fuite par les airs|31
Roi galactique|DBS|Roi de la Patrouille galactique|god|Commandement galactique|32
Hasky|DB|Chasseuse de primes|assassin|Piège de la chasseuse|32
Sorrel|DBS|Rapide combattante|speed|Esquive du lapin|32
Pintar|DBZ|25e Tenkaichi Budokai|guardian|Poids du géant|33
Buyon|DB|Gardien de Muscle Tower|guardian|Corps élastique|33
Chappil|DBS|Armure du dragon|guardian|Écailles d'acier|34
Bulma du futur|DBS|Scientifique de la résistance|tech|Machine temporelle|35
Potage|DBS|Gardien de l'eau miraculeuse|support|Gardien de la jarre|35
Yajirobé du futur|DBS|Résistance du futur|assassin|Survie du futur|35
Dyrasem|DBS|Danseur combattant|speed|Danse de combat|35
Hop|DBS|Lame féline|assassin|Griffes de Hop|35
Hyssop|DBS|Glace univers 9|ki|Gel polaire|35
Rabanra|DBS|Univers 2|martial|Poing de l'amour|35
Zircor|DBS|Yogi univers 10|guardian|Position du yogi|35
Aragné|DBS|Guerrier de l'univers 11|martial|Attaque arachnide|36
Tsuno|DBZ|Ancien du village namek|guardian|Protection namek|36
Bikal|DBS|Guerrière ailée|speed|Ailes rapides|36
Methiop|DBS|Boxeur univers 10|martial|Enchaînement boxe|36
Yurin|DBS|Élève renégate de la grue|trickster|Talismans de contrôle|37
Moori|DBZ|Ancien namek|healer|Soin ancestral|37
Ginger|DBZ|Serviteur Garlic Jr.|assassin|Frappe des ténèbres|37
Nikky|DBZ|Serviteur Garlic Jr.|speed|Assaut sournois|37
Yamcha|DB|Désert — allié d'Oolong|martial|Loup du désert|37
Brianne de Château|DBS|Avant métamorphose|support|Coeur ardent|37
Dium|DBS|Guerrier ailé univers 10|speed|Plongeon aérien|37
Murisam|DBS|Combattant univers 10|martial|Prise musclée|37
Xiangca|DBS|Illusionniste de l'univers 4|trickster|Images fantômes|37
Rubalt|DBS|Agent univers 10|martial|Neutralisation|38
Sanka Coo|DBS|Avant Kakunsa|speed|Grâce féline|38
Shosa|DBS|Guerrier furtif|trickster|Feinte invisible|38
Zarbuto|DBS|Combat de l'amour|martial|Courage enchanté|38
Salt|DBZ|Gang du Makyo|martial|Coup piquant|39
Gohan|DBZ|Enfant — fuite dans les montagnes|saiyan|Instinct de survie|39
Karin|DBZ|Haricots Senzu|support|Récolte miraculeuse|39
Caway|DBS|Combattante de l'univers 4|martial|Arme énergétique|39
Paparoni|DBS|Docteur des machines|tech|Synchronisation robotique|39
Prum|DBS|Tireur invisible|sniper|Tir dissimulé|39
Sû Roas|DBS|Avant Rozie|sniper|Assaut romantique|39
Mustard|DBZ|Gang du Makyo|speed|Frappe des épices|40
Tapikar|DBZ|Tournoi de l'Autre Monde|speed|Course céleste|40
Annin|DB|Gardienne du fourneau magique|god|Feu du fourneau|40
Harmira|DBS|Tireur de l'univers 2|sniper|Canon de sniper|40
Za Priccio|DBS|Univers 3|martial|Attaque rapide|40
Caterpy|DBZ|Tournoi de l'Autre Monde|trickster|Mue du combattant|41
Arqua|DBZ|Tournoi de l'Autre Monde|time|Monde aquatique|41
Vinegar|DBZ|Gang du Makyo|berserker|Poing maléfique|41
Grand Doyen Guru|DBZ|Ancien de Namek|support|Révélation du potentiel|42
Kiwi|DBZ|Soldat de Freezer — Namek|ki|Rayon de Kiwi|42
Dr Rota|DBS|Guerrier magique|trickster|Mystère du docteur|42
Kettle|DBS|Pride Troopers|ki|Rayon de justice|42
Majora|DBS|Guerrier aveugle|trickster|Odorat infaillible|42
Murichim|DBS|Chef des guerriers univers 10|martial|Poing du chef|42
Narirama|DBS|Robot multi-bras|android|Armes multiples|42
Tupper|DBS|Pride Troopers|guardian|Poids écrasant|42
Zirloin|DBS|Amas d'énergie amoureuse|ki|Rayon d'amour|42
Chapuchai|DBZ|Tournoi de l'Autre Monde|speed|Déplacement furtif|43
Spice|DBZ|Gang du Makyo|ki|Rayon destructeur|43
Damom|DBS|Petite créature redoutable|speed|Impact invisible|43
Koitsukai|DBS|Robot de l'univers 3|android|Frappe motorisée|43
Maître Kaio de l'Est|DBZ|Divinité de l'est|god|Tournoi cosmique|44
Maître Kaio du Sud|DBZ|Divinité du sud|god|Entrainement du sud|44
Biarra|DBS|Robot cuirassé|guardian|Coque renforcée|44
Borareta|DBS|Robot de l'univers 3|android|Surcharge magnétique|44
Cocotte|DBS|Pride Troopers|guardian|Dôme de Cocotte|44
Gamisalas|DBS|Camouflage parfait|trickster|Invisibilité totale|44
K'nsi|DBS|Pride Troopers|martial|Attaque coordonnée|44
Pancéa|DBS|Robot de l'univers 3|android|Plasma concentré|44
Zoire|DBS|Pride Troopers|speed|Tourbillon de justice|44
Maître Kaio de l'Ouest|DBZ|Divinité de l'ouest|god|Épreuve de vitesse|45
Tortue Géniale|DBZ|Face aux Saiyans — soutien|ki|Vague ancestrale|45
Vewon|DBS|Pride Troopers|guardian|Fouet de justice|45
Maraikoh|DBZ|Tournoi de l'Autre Monde|guardian|Puissance du géant|46
Mighty Mask|DBZ|Déguisement de Goten et Trunks|trickster|Supercherie du tournoi|46
Goku|DB|Enfant — attaque Kamehameha|ki|Première vague déferlante|46
Yamcha|DBZ|Cell Games — combattant terrien|martial|Poing du loup|46
Gotenks|DBZ|Base — première fusion ratée|trickster|Fusion imparfaite|46
Dendé|DBS|Gardien du sanctuaire|healer|Guérison sacrée|47
Nigrissi|DBS|Chef des guerriers de l'univers 3|android|Analyse robotique|47
Piccolo|DB|Enfant du Roi Démon|demon|Héritage de Piccolo|48
Jimizu|DBS|Guerrier de l'univers 2|speed|Téléportation express|48
`,
  uncommon: `
Goku|DB|Enfant — début d'aventure|saiyan|Bâton magique|42
Krilin|DB|22e Tenkaichi Budokai|martial|Technique de la tortue|42
Yamcha|DB|Désert|martial|Roga Fufu Ken|40
Tenshinhan|DB|22e Tenkaichi Budokai|martial|Shiyoken|46
Chaozu|DB|École de la grue|time|Télékinésie|38
Tortue Géniale|DB|22e Tenkaichi Budokai|ki|Kamehameha originel|47
C-8|DB|Cyborg pacifique|guardian|Force du cœur|41
Général Blue|DB|Ruban Rouge|time|Paralysie psychique|40
Tao Pai Pai|DB|Assassin|assassin|Dodonpa|48
Tambourine|DB|Démon de Piccolo|demon|Assaut démoniaque|43
Cymbal|DB|Démon de Piccolo|demon|Griffes démoniaques|38
Goku|DBZ|Saga Saiyans|saiyan|Kaioken contrôlé|53
Krilin|DBZ|Saga Saiyans|ki|Kienzan|48
Yamcha|DBZ|Saga Saiyans|martial|Roga Fufu Ken perfectionné|45
Tenshinhan|DBZ|Saga Saiyans|ki|Kikoho|49
Chaozu|DBZ|Saga Saiyans|time|Sacrifice de Chaozu|41
Dendé|DBZ|Guérisseur de Namek|healer|Guérison namek|38
Videl|DBZ|Championne en herbe|martial|Vol de Videl|44
Kibito|DBZ|Assistant du Kaioshin|healer|Soin divin|43
Jaco|DBS|Patrouille galactique|sniper|Rayon du patrouilleur|45
Sorbet|DBS|Armée de Freezer|sniper|Tir sournois|41
Tagoma|DBS|Armée de Freezer|guardian|Armure de combat|46
Shisami|DBS|Armée de Freezer|berserker|Charge brutale|43
Botamo|DBS|Univers 6|guardian|Corps élastique|51
Magetta|DBS|Univers 6|guardian|Métal brûlant|51
Cabba|DBS|Saiyan — base|saiyan|Fierté de Sadala|53
Caulifla|DBS|Saiyan — base|saiyan|Instinct du combat|52
Goku|DB|Enfant — 21e Tenkaichi|saiyan|Kamehameha débutant|40
Krilin|DB|21e Tenkaichi|martial|Discipline de Roshi|37
Yamcha|DB|23e Tenkaichi|martial|Roga Fufu Ken|44
Tortue Géniale|DB|Jackie Chun|ki|L'école du champion|46
Chichi|DB|23e Tenkaichi|martial|Artiste martiale|41
Mister Popo|DB|Gardien du palais|guardian|Calme de Popo|47
Karin|DB|Maître de la tour|support|Haricot magique|41
Tao Pai Pai|DB|Cyborg|android|Arsenal caché|47
Puipui|DBZ|Serviteur de Babidi|martial|Gravité extrême|44
Yakon|DBZ|Mangeur de lumière|demon|Absorption de lumière|44
Babidi|DBZ|Sorcier|trickster|Contrôle mental|42
Kaio du Nord|DBZ|Mentor Saiyan|support|Entraînement de Kaio|43
Roi Vegeta|DBZ|Roi des Saiyans|saiyan|Ordre du roi|49
Goten|DBZ|Enfant|saiyan|Courage juvénile|44
Trunks|DBZ|Enfant|saiyan|Fierté du fils|45
Vieux Kaioshin|DBZ|Ancien dieu|healer|Éveil du potentiel|44
Grand Kaio|DBZ|Maître des Kaios|support|Enseignement céleste|45
Apule|DBZ|Soldat de Freezer|sniper|Canon de base|39
Lavender|DBS|Trio du danger|poison|Brume toxique|52
Basil|DBS|Trio du danger|martial|Kick destructeur|52
Obni|DBS|Univers 10|martial|Dédoublement spirituel|48
Cabba|DBS|Super Saiyan|saiyan|Éveil de Sadala|60
Caulifla|DBS|Super Saiyan|saiyan|Énergie de combat|60
Kale|DBS|Saiyan — base|saiyan|Tension contenue|52
Mai|DBS|Résistance du futur|sniper|Tir de résistance|40
Goku|DBS|Base — Tournoi du Pouvoir|saiyan|Instinct de combattant|60
Vegeta|DBS|Base — Tournoi du Pouvoir|saiyan|Fierté de Vegeta|60
Goku|DB|Entraînement chez Karin|saiyan|Eau sacrée|50
Goku|DB|Combat contre Tao Pai Pai|martial|Revanche du héros|53
Goku|DB|Entraînement final de Kami|saiyan|Poing météore|57
Krilin|DB|23e Tenkaichi Budokai|martial|Combat du tournoi|47
Tenshinhan|DB|Entraînement avant 23e Tenkaichi|ki|Kikoho du tournoi|52
Yamcha|DB|21e Tenkaichi Budokai|martial|Griffes du loup|42
Tortue Géniale|DB|Kamehameha pleine puissance|ki|Vague déferlante|54
Yajirobé|DB|Garde de Karin|assassin|Coup de sabre|42
Shen|DB|23e Tenkaichi Budokai|god|Énergie du gardien|53
Piccolo Junior|DB|23e Tenkaichi Budokai|demon|Coup du démon|55
Chaozu|DB|23e Tenkaichi Budokai|time|Télékinésie contrôlée|42
Gohan|DBZ|Enfant — saga Saiyan|saiyan|Explosion de colère|52
Raditz|DBZ|Invasion de la Terre|saiyan|Double Sunday|57
Nappa|DBZ|Arrivée sur Terre|berserker|Impact destructeur|55
Saibaiman|DBZ|Combat de l'invasion|poison|Explosion Saibai|40
Krilin|DBZ|Sur Namek|ki|Kienzan stratégique|55
Gohan|DBZ|Sur Namek|saiyan|Potentiel de Gohan|55
Vegeta|DBZ|Combat contre Zarbon|saiyan|Zenkai violent|58
Recoome|DBZ|Duel contre Vegeta|berserker|Recoome Kick|59
Guldo|DBZ|Arrêt du temps|time|Souffle retenu|50
Jeice|DBZ|Duel contre Goku|sniper|Crusher Ball|57
Burter|DBZ|Duel contre Goku|speed|Foudre bleue|60
Nail|DBZ|Gardien du Grand Chef|regen|Force namek|62
Goku|DBS|Entraînement de Whis|saiyan|Discipline du ki|60
Vegeta|DBS|Entraînement de Whis|saiyan|Mental du prince|61
Gohan|DBS|Retour à l'entraînement|saiyan|Potentiel restauré|57
Monna|DBS|Combattante bouclier|guardian|Boule compressée|48
Watagash|DBS|Parasite de l'espace|trickster|Possession parasitaire|49
Roasie|DBS|Forme d'amour|ki|Poings amoureux|49
Kakunsa|DBS|Transformation féline|speed|Griffes frénétiques|49
Docteur Gero|DBZ|Créateur des cyborgs|android|Absorption d'énergie|51
Krilin|DBZ|Après Namek — préparation cyborgs|ki|Entraînement poussé|51
Maji-Kayo|DBS|Guerrier malléable|trickster|Corps liquide|51
C-19|DBZ|Cyborg absorbeur|android|Prise absorbante|52
Drum|DB|Démon du Roi Piccolo|berserker|Charge du démon|52
Ganos|DBS|Métamorphose en oiseau géant|berserker|Métamorphose de Ganos|52
Krilin|DBZ|Cell Games — soutien|ki|Taiyoken surprise|53
Tao Pai Pai|DB|Mercenaire — affrontement Goku|assassin|Dodonpa meurtrier|53
Goku|DB|Enfant — transformation géante contre Pilaf|berserker|Queue de Saiyan|53
Renso|DBS|Ancien capitaine saiyan|saiyan|Honneur de Sadala|54
Olibu|DBZ|Tournoi de l'Autre Monde|martial|Coup d'Hercule|55
Agu|DBS|Kaioshin univers 12|god|Equilibre de l'univers|55
Anato|DBS|Kaioshin univers 1|god|Soutien universel|55
Eyre|DBS|Kaioshin univers 3|god|Protection du créateur|55
Goku|DB|Adolescent — confrontation Roi Piccolo|saiyan|Détermination du héros|55
Iru|DBS|Kaioshin univers 8|god|Soutien mystique|55
Khai|DBS|Kaioshin univers 11|god|Soutien des justes|55
Kuru|DBS|Kaioshin univers 4|god|Barrière divine|55
Ogma|DBS|Kaioshin univers 5|god|Equilibre sacré|55
Pell|DBS|Kaioshin univers 2|god|Bénédiction du dieu|55
Roh|DBS|Kaioshin univers 9|god|Rugissement sacré|55
Tenshinhan|DBS|Entraîneur d'arts martiaux|martial|Conseils des trois yeux|55
Goten|DBZ|Super Saiyan — entraînement Chichi|saiyan|Première transformation|55
Kaioshin du Nord|DBZ|Gardien de l'univers|god|Scellement divin|56
Kami|DB|Gardien de la Terre|god|Bénédiction du gardien|56
Goku|DB|Grand singe — première transformation|berserker|Rage du singe géant|56
Oob|DBZ|Réincarnation de Majin Buu|martial|Potentiel caché|56
Ribrianne|DBS|Transformation géante|berserker|Explosion d'amour|56
Kaioshin de l'Ouest|DBZ|Gardienne de l'univers|god|Protection céleste|57
Buu|DBZ|Boo gentil — vit avec Mister Satan|healer|Magie affectueuse|57
Goten|DBZ|Super Saiyan — tournoi junior|saiyan|Énergie juvénile|57
Gohan|DBZ|Grand singe — saga Saiyans|berserker|Rage incontrôlée|57
Cabba|DBS|Base — tournoi du Pouvoir|saiyan|Honneur de Cabba|58
C-18|DBZ|Cell Games — protégée par Krilin|guardian|Cœur de combattante|58
Goku|DB|23e Tenkaichi — technique météore|martial|Poing météore|58
Kahseral|DBS|Officier Pride Troopers|ki|Lames de justice|58
Lavender|DBS|Poison — Zeno Expo|poison|Brume d'empoisonnement|58
Kami|DBZ|Fusion définitive avec Piccolo|god|Sagesse intégrée|58
Buu|DBZ|Boo bon — après séparation|healer|Bonheur du Majin|59
Krilin|DBS|Policier — retour au combat|martial|Reflexes retrouvés|59
Zamasu|DBS|Apprenti Kaioshin univers 10|god|Jugement des mortels|59
Saonel|DBS|Namek univers 6|guardian|Endurance namek|59
Kaioshin du Sud|DBZ|Gardien de l'univers|god|Puissance du sud|60
Garlic Jr.|DBZ|Règne du Makyo|demon|Énergie du Makyo|60
Gohan|DBZ|Enfant — potentiel libéré par Guru|saiyan|Rage de Namek|60
Fuwa|DBS|Kaioshin univers 6|god|Sceau du Kaioshin|60
Gowasu|DBS|Maître de Zamasu|god|Sagesse du maître|60
Pilina|DBS|Namek univers 6|guardian|Fusion namek|60
Cell|DBZ|Forme imparfaite — absorption humains|demon|Drain biologique|60
Goku|DBZ|Kaioken ×2 — saga Saiyans|saiyan|Fulgurance Kaioken|60
C-18|DBZ|Futur — règne des cyborgs|android|Duo de destruction|61
Cell Jr.|DBZ|Création de Cell parfait|berserker|Rage miniature|61
Gohan|DBZ|Great Saiyaman — costume héroïque|martial|Justice du Great Saiyaman|61
Vegeta|DBZ|Saga Freezer — récupération sur Namek|saiyan|Zenkai du prince|61
Basil|DBS|Super stimulant — Zeno Expo|martial|Coup de pied maximal|61
Ganos|DBS|Oiseau géant — Tournoi du Pouvoir|berserker|Transformation aviaire|61
Trunks|DBZ|Super Saiyan — fusion avec Goten|saiyan|Énergie du duo|61
C-17|DBZ|Futur — traque des humains|android|Traque du futur|62
C-18|DBS|Protection de Krilin|guardian|Frappe protectrice|62
Frost|DBS|Première forme — Univers 6|trickster|Poison dissimulé|62
Ribrianne|DBS|Géante — Tournoi du Pouvoir|berserker|Amour colossal|62
Gotenks|DBZ|Base — fusion réussie|saiyan|Nouvelle fusion|62
Caulifla|DBS|Base — tournoi du Pouvoir|saiyan|Audace de Caulifla|63
C-16|DBZ|Héritage pacifique — Cell Games|android|Paroles du gardien|63
Goku|DBZ|Kaioken ×3 — contre Vegeta|saiyan|Surcharge Kaioken|63
Gotenks|DBZ|Fusion normale — entraînement|saiyan|Poing du fantôme|63
Bergamo|DBS|Croissance géante — Zeno Expo|guardian|Absorption de puissance|63
Cell Jr.|DBZ|Cell Games — essaim des sept|berserker|Assaut groupé|65
Gowasu|DBS|Kaioshin univers 10|god|Thé de la sagesse|65
Piccolo|DBZ|Défenseur de Goten et Trunks|guardian|Formation tactique|65
Roi Piccolo|DB|Jeunesse restaurée|demon|Jeunesse du Roi Démon|65
Koicéareta|DBS|Fusion des trois robots|android|Arsenal fusionné|65
Aralé Norimaki|DB|Génie mécanique de Penguin Village|berserker|Super force d'Aralé|66
Bardock|DBZ|Guerrier saiyan|saiyan|Résistance au destin|66
Goku|DBZ|Kaioken ×4 — Kamehameha|ki|Kamehameha quadruple|66
Kibito Shin|DBZ|Fusion divine|god|Lumière Potara|66
Piccolo|DBZ|Fusion avec Nail — seconde forme|guardian|Puissance namek|66
Frost|DBS|Forme d'assaut — tournoi univers 6|trickster|Transformation de Frost|67
`,
  rare: `
Goku|DB|23e Tenkaichi Budokai|saiyan|Vague déferlante|63
Muri|DBZ|Ancien du village namek|support|Soutien namek|43
Tenshinhan|DB|23e Tenkaichi Budokai|ki|Kikoho déterminé|57
Piccolo|DBZ|Saga Saiyans|guardian|Sacrifice du mentor|61
Gohan|DBZ|Enfant — Namek|saiyan|Colère latente|57
Vegeta|DBZ|Saga Saiyans|saiyan|Galick Gun|69
Nappa|DBZ|Saiyan d'élite|berserker|Explosive Wave|59
Raditz|DBZ|Guerrier Saiyan|sniper|Double Sunday|55
Ginyu|DBZ|Capitaine|time|Body Change|67
Recoome|DBZ|Commando Ginyu|berserker|Recoome Eraser Gun|60
Jeice|DBZ|Commando Ginyu|ki|Crusher Ball|58
Burter|DBZ|Commando Ginyu|speed|Vitesse bleue|60
Guldo|DBZ|Commando Ginyu|time|Arrêt du temps|57
C-17|DBZ|Saga Androids|android|Barrière énergétique|72
C-18|DBZ|Saga Androids|android|Énergie infinie|71
C-16|DBZ|Saga Androids|guardian|Rocket Punch|70
Dabra|DBZ|Roi des démons|demon|Crachat pétrifiant|70
Kaioshin|DBZ|Dieu de l'Est|time|Entrave divine|65
Frost|DBS|Univers 6|poison|Aiguille toxique|72
Hit|DBS|Saut temporel|time|Time Skip|80
Ribrianne|DBS|Univers 2|guardian|Amour protecteur|71
Goku|DBZ|Kaioken ×20|saiyan|Kaioken maximal|73
Gohan|DBZ|Adolescent — Super Saiyan|saiyan|Puissance cachée|72
Goten|DBZ|Super Saiyan|saiyan|Super Saiyan précoce|66
Trunks|DBZ|Super Saiyan — enfant|saiyan|Énergie juvénile|67
Vegeta|DBZ|Saga Namek|saiyan|Zenkai de Namek|67
Zarbon|DBZ|Forme monstrueuse|berserker|Mutation du guerrier|64
Dodoria|DBZ|Garde de Freezer|berserker|Boule de feu de Dodoria|61
Freezer|DBZ|Première forme|demon|Domination galactique|66
Freezer|DBZ|Deuxième forme|demon|Puissance colossale|71
Freezer|DBZ|Troisième forme|demon|Vitesse terrifiante|74
Cell|DBZ|Forme imparfaite|regen|Absorption de Cell|72
Cell|DBZ|Forme semi-parfaite|regen|Évolution imparfaite|76
Piccolo|DBZ|Saga Namek|regen|Fusion namek|68
Buu|DBZ|Boo maléfique|demon|Chaos noir|74
Trunks|DBZ|Guerrier du futur — base|saiyan|Épée du futur|71
Kale|DBS|Super Saiyan|saiyan|Éveil de Kale|77
Cabba|DBS|Super Saiyan 2|saiyan|Fierté de Sadala|79
Bergamo|DBS|Trio du danger|guardian|Grandissement de Bergamo|74
Goku Black|DBS|Forme de base|demon|Vol de puissance|75
Gohan|DBS|Potentiel libéré|saiyan|Guerrier revenu|80
Jiren|DBS|Puissance contenue|powerhouse|Pression silencieuse|83
Goku|DBZ|Super Saiyan — duel final contre Freezer|saiyan|Éveil de Namek|83
Vegeta|DBZ|Super Saiyan — Androids|saiyan|Big Bang Attack|81
Gohan|DBZ|Super Saiyan — Salle du temps|saiyan|Puissance retrouvée|75
Trunks|DBZ|Super Saiyan — arrivée du futur|saiyan|Lame de justice|77
Piccolo|DBZ|Fusion avec Kami — duel contre C-17|regen|Namek réunifié|77
C-16|DBZ|Face à Cell|guardian|Poing-fusée|74
Ginyu|DBZ|Technique du changement de corps|trickster|Body Change|68
Goku|DBZ|Retour sur Terre après Namek|saiyan|Transmission instantanée|78
Freezer|DBZ|Retour cyborg|android|Machine vengeresse|76
Gohan|DBZ|Super Saiyan 2 — Cell Games|saiyan|Colère libérée|89
Goku|DBZ|Super Saiyan 2 — tournoi|saiyan|Énergie accrue|84
Buu|DBZ|Innocent face à Babidi|regen|Danse magique|77
Goku|DBS|Super Saiyan Blue — Univers 6|god|Kamehameha Blue|85
Vegeta|DBS|Super Saiyan Blue — Univers 6|god|Final Flash Blue|85
Hit|DBS|Univers 6 — tournoi|time|Saut temporel|82
Trunks|DBS|Futur — résistance|saiyan|Lame de résistance|79
Goku Black|DBS|Faux Goku révélé|demon|Énergie maléfique|79
Vegeta|DBZ|Grand singe — invasion Terre|berserker|Rayon de lune artificielle|67
Magetta|DBS|Métalman — tournoi du pouvoir|guardian|Vapeur brûlante|68
Roi Cold|DBZ|Empereur de l'armée de Freezer|guardian|Aura impériale|68
Goku|DBZ|Super Saiyan — face à C-19|saiyan|Ferveur saiyan|68
Buu|DBZ|Boo maléfique — transformation|demon|Mélange destructeur|68
Goku|DBZ|Kaioken — intervention sur Namek|saiyan|Éclair de Kaioken|68
C-17|DBS|Ranger de l'île|guardian|Protection de la faune|69
Roi Cold|DBZ|Après Namek — invasion Terre|guardian|Domination familiale|69
Goku|DBZ|Kaioken ×10 — contre Freezer|saiyan|Énergie Kaioken|69
Piccolo|DBZ|Fusion avec Nail — bataille Freezer|ki|Makankosappo renouvelé|69
Pikkon|DBZ|Champion de l'Autre Monde|martial|Tonnerre du guerrier|70
Dyspo|DBS|Patrouilleur de la justice|speed|Super vitesse|70
Gohan|DBZ|Super Saiyan — duel d'entraînement Goku|saiyan|Vigueur familiale|70
Vegeta copie|DBS|Clone de l'eau miraculeuse|android|Mimétisme du guerrier|71
Trunks|DBZ|Futur — retour chez C-17 et C-18|saiyan|Vengeance du futur|71
Dyspo|DBS|Pride Troopers — première course|speed|Sur-vitesse|71
Vegeta|DBZ|Super Saiyan — contre C-18|saiyan|Colère contre cyborg|71
Cell|DBZ|Forme semi-parfaite — absorption C-17|berserker|Adaptation cellulaire|72
Trunks|DBS|Futur — épée de la résistance|martial|Épée de l'espoir|72
Trunks|DBS|Futur — sauveur avec Mai|saiyan|Espoir des survivants|72
Goku|DBZ|Super Saiyan — entraînement salle du temps|saiyan|Maîtrise du Super Saiyan|72
Trunks|DBZ|Super Saiyan grade 2 — entraînement|saiyan|Dépassement de Trunks|72
Vegeta|DBZ|Super Saiyan — affrontement C-19|saiyan|Big Bang Attack|72
Freezer|DBZ|Retour cyborg — arrivée sur Terre|android|Vengeance mécanique|73
Gohan|DBZ|Super Saiyan 2 — tournoi de Babidi|saiyan|Sursaut de Gohan|73
Freezer|DBS|Forme finale — première renaissance|ki|Rayon de vengeance|73
Freezer|DBZ|Forme finale — réduit son énergie|ki|Rayon mortel|73
Gohan|DBZ|Super Saiyan — sortie salle du temps|saiyan|Pouvoir du fils|73
Piccolo|DBZ|Fusion avec Kami — Cell Games|guardian|Unité parfaite|73
Trunks|DBZ|Futur — maîtrise salle du temps|saiyan|Entraînement contre Cell|74
Grand Kaioshin|DBZ|Guide des Kaioshin|god|Pureté suprême|75
Kefla|DBS|Forme de base|saiyan|Fusion explosive|75
Toppo|DBS|Fierté des Pride Troopers|martial|Poing de la justice|75
Toppo|DBS|Pride Troopers — chef|guardian|Poing de justice|75
Cabba|DBS|Super Saiyan 2 — face à Freezer|saiyan|Sursaut de Sadala|75
Goku|DBZ|Super Saiyan — transmission instantanée|saiyan|Kamehameha instantané|75
Frost|DBS|Forme finale — alliance Freezer|trickster|Poison de la trahison|75
Trunks|DBS|Futur — confrontation Goku Black|saiyan|Colère de la résistance|76
Hit|DBS|Assassinat — univers 6|time|Temps suspendu|76
Trunks|DBZ|Super Saiyan grade 3 — contre Cell|saiyan|Puissance trop lourde|76
Vegeta|DBS|Super Saiyan — tournoi du pouvoir|saiyan|Assaut du prince|76
Frost|DBS|Forme finale — tournoi du pouvoir|trickster|Aiguille empoisonnée|76
Jiren|DBS|Première rencontre — retenue de puissance|guardian|Calme absolu|77
Porunga|DBZ|Dragon de Namek|god|Vœu namek|77
Goku|DBS|Super Saiyan 2 — tournoi du pouvoir|saiyan|Rage contrôlée|77
Hit|DBS|Assassin — jauge temporelle|time|Glissement temporel|78
Vegeta|DBZ|Super Saiyan 2 — contre Kid Buu|saiyan|Fierté indomptable|78
Freezer|DBZ|Forme finale — combat Goku SSJ|ki|Déferlement impérial|78
Goku|DBZ|Super Saiyan 2 — Majin Vegeta|saiyan|Transcendance de Goku|78
Freezer|DBS|Forme finale — Tournoi du Pouvoir|ki|Rayon de précision|79
Caulifla|DBS|Super Saiyan 2 — duel Goku|saiyan|Sauvagerie du génie|79
Super Buu|DBZ|Absorption de Piccolo|demon|Intelligence absorbée|80
Zamasu|DBS|Futur — corps immortel|god|Régénération divine|80
Dyspo|DBS|Super vitesse — Light Bullet|speed|Vitesse lumineuse|80
Vegeta|DBZ|Super Saiyan 2 — sacrifice contre Buu|saiyan|Ultime expiation|80
C-17|DBS|Tournoi du Pouvoir — dernière résistance|guardian|Bouclier final|81
Zamasu|DBS|Immortel — première rencontre|god|Immortalité du Kaioshin|81
Goku Black|DBS|Faux Goku — lame de ki|ki|Lame de lumière|81
Freezer|DBS|Forme finale — alliance provisoire|ki|Calcul impérial|81
Hit|DBS|Saut temporel — tournoi du pouvoir|time|Saut temporel final|82
Trunks|DBS|Super Saiyan 2 — retour du futur|saiyan|Espoir du futur|82
Agnilasa|DBS|Fusion ultime de l'univers 3|berserker|Cataclysme de la fusion|82
Gohan|DBZ|Super Saiyan 2 — attaque contre Cell Jr.|saiyan|Fureur protectrice|83
Gotenks|DBZ|Super Saiyan 3 — combat contre Super Buu|saiyan|Explosion galactique|83
Vegito|DBZ|Forme de base — fusion Potara|saiyan|Fusion Potara|83
Kale|DBS|Super Saiyan Berserker contrôlé|berserker|Puissance domptée|83
C-17|DBS|Barrière ultime — Tournoi du Pouvoir|android|Barrière protectrice|84
`,
  epic: `
Goku|DBZ|Super Saiyan — Namek|saiyan|Premier éveil doré|80
Vegeta|DBZ|Super Saiyan — Cell|saiyan|Final Flash|81
Trunks|DBZ|Super Saiyan — futur|saiyan|Burning Attack|79
Freezer|DBZ|Forme finale|demon|Death Beam|84
Cell|DBZ|Forme parfaite|regen|Perfection cellulaire|87
Buu|DBZ|Majin Buu|regen|Corps magique|84
Vegeta|DBZ|Majin|berserker|Final Explosion|86
Goku|DBZ|Super Saiyan 3|saiyan|Kamehameha ultime|89
Goku|DBS|Super Saiyan Blue|saiyan|Ki divin maîtrisé|91
Vegeta|DBS|Super Saiyan Blue|saiyan|Prince divin|90
Black Goku|DBS|Super Saiyan Rosé|demon|Lame de ki rosée|91
Kefla|DBS|Super Saiyan 2|fusion|Puissance fusionnée|91
Toppo|DBS|Mode destruction|god|Énergie de destruction|91
Vegito|DBZ|Super Saiyan|fusion|Puissance fusionnée|92
Gotenks|DBZ|Super Saiyan 3|fusion|Attaque fantôme|88
Super Buu|DBZ|Forme maléfique|regen|Régénération de Boo|85
Buu|DBZ|Absorption Gotenks|regen|Absorption du prodige|89
Buu|DBZ|Absorption Gohan|regen|Absorption ultime|93
Kid Buu|DBZ|Forme originelle|demon|Explosion chaotique|91
Vegeta|DBZ|Super Saiyan 2 — Buu|saiyan|Fureur du Saiyan|86
Gohan|DBZ|Potentiel ultime — Buu|saiyan|Éveil ultime|92
Freezer|DBS|Golden Freezer|demon|Éclat de la tyrannie|92
Goku|DBS|Super Saiyan God|god|Pouvoir du rituel|91
Trunks|DBS|Super Saiyan Rage|saiyan|Colère de l'espoir|91
Zamasu|DBS|Fusionné|god|Justice immortelle|93
C-17|DBS|Tournoi du Pouvoir|android|Barrière parfaite|90
Hit|DBS|Saut temporel amélioré|time|Saut temporel perfectionné|90
Kale|DBS|Berserk|berserker|Fureur sans limites|91
Vegito|DBZ|Base — Buu|fusion|Assaut fusionné|91
Gotenks|DBZ|Super Saiyan — Buu|fusion|Ghost Kamikaze|84
Piccolo|DBZ|Fusion avec Nail et Kami|regen|Fusion parfaite|83
Freezer|DBZ|Forme finale — 100 %|demon|Pleine puissance du tyran|84
Zamasu|DBS|Immortel — futur|god|Justice éternelle|90
Vegeta|DBS|Super Saiyan Blue — contre Toppo|god|Volonté du prince|95
Toppo|DBS|Dieu de la destruction candidat|god|Hakai des justiciers|94
Gohan|DBS|Potentiel ultime — contre Goku|saiyan|Défi du fils|84
Cell|DBZ|Forme parfaite — jeux de Cell|berserker|Orgueil parfait|84
Kid Buu|DBZ|Fin du combat — Terre sacrée|berserker|Furie absolue|84
Mosco|DBS|Dieu de destruction univers 3|god|Armure divine|84
Sidra|DBS|Dieu de destruction univers 9|god|Orbe de Sidra|84
Goku|DBS|Super Saiyan God — tournoi Univers 6|saiyan|Aura du dieu rouge|84
Trunks|DBS|Futur — Super Saiyan 2 contre Zamasu|saiyan|Assaut de la résistance|84
Gotenks|DBZ|Super Saiyan 3 — kamikaze fantôme|saiyan|Attaque des fantômes|84
Vegeta|DBS|Super Saiyan Blue — combat contre Black|saiyan|Coup du prince|85
Goku|DBS|Super Saiyan Blue — Épreuve de Whis|saiyan|Contrôle du ki divin|85
Heles|DBS|Déesse de destruction univers 2|god|Flèche divine|86
Liquiir|DBS|Dieu de destruction univers 8|god|Canon divin|86
Goku|DBS|Super Saiyan Blue — visite au futur|saiyan|Adaptation aux dieux|86
Gohan|DBS|Potentiel ultime — Tournoi du Pouvoir|saiyan|Chef de l'univers 7|87
Arak|DBS|Dieu de destruction univers 5|god|Énergie dévastatrice|87
Beerus|DBS|Arbitrage de l'univers 7|god|Autorité du destructeur|87
Gin|DBS|Dieu de destruction univers 12|god|Puissance silencieuse|87
Iwan|DBS|Dieu de destruction univers 1|god|Justice divine|87
Rumsshi|DBS|Dieu de destruction univers 10|god|Cri divin|87
Goku|DBS|Super Saiyan God — tournoi du pouvoir|saiyan|God Bind|87
Vegeta|DBS|Super Saiyan Blue — Tournoi du Pouvoir|saiyan|Final Flash divin|87
Vegito|DBZ|Super Saiyan — protection de Gohan|saiyan|Barrière fusionnée|87
Gohan|DBZ|Ultime — contre Super Buu|saiyan|Puissance mystique|88
Cell|DBZ|Cell parfait — Kamehameha père-fils|ki|Kamehameha solaire|88
Freezer|DBS|Golden Freezer — résurrection|ki|Renaissance du tyran|88
Quitela|DBS|Dieu de destruction univers 4|god|Ruse destructrice|88
Goku|DBS|Super Saiyan Blue — contre Hit|saiyan|Kamehameha décalé|88
Goku Black|DBS|Rosé — lame de ki|ki|Lame du dieu noir|89
Vegeta|DBS|Super Saiyan Blue — contre Jiren|saiyan|Fierté guerrière|89
Goku|DBS|Super Saiyan Blue Kaioken ×10|saiyan|Kaioken divin|89
Kefla|DBS|Super Saiyan — fusion|saiyan|Fulgurance de Kefla|89
Awamo|DBS|Ange univers 1|god|Protection de l'ange|90
Camparri|DBS|Ange univers 3|god|Ondes angéliques|90
Cell|DBZ|Super Perfect Cell — résurrection|berserker|Zenkaï parfait|90
Cognac|DBS|Ange univers 4|god|Sceptre de Cognac|90
Corn|DBS|Ange univers 8|god|Équilibre divin|90
Cukatail|DBS|Ange univers 5|god|Discipline céleste|90
Kusu|DBS|Ange univers 10|god|Soin céleste|90
Marcarita|DBS|Ange univers 11|god|Prémonition d'ange|90
Martinu|DBS|Ange univers 12|god|Pouvoir ancestral|90
Mohito|DBS|Ange univers 9|god|Ordre angélique|90
Sour|DBS|Ange univers 2|god|Calme cosmique|90
Goku Black|DBS|Super Saiyan Rosé — faux Saiyan|saiyan|Faux rosé|90
Jiren|DBS|Barrière énergétique — face à Goku|guardian|Mur de volonté|91
Beerus|DBS|Début de Super — menace sur Terre|god|Colère de Beerus|91
Champa|DBS|Choc avec Beerus|god|Rivalité des destructeurs|91
Toppo|DBS|Dieu de destruction — Hakai|god|Hakai du candidat|91
Zamasu|DBS|Fusionné — corps stable|god|Lames du jugement|91
Belmod|DBS|Dieu de destruction univers 11|god|Cartes du destructeur|92
Goku Black|DBS|Rosé — faux clone démultiplié|trickster|Copies de ki|92
Whis|DBS|Ange — bâton de divination|god|Retour dans le temps|92
Champa|DBS|Dieu de la destruction univers 6|god|Orbe destructrice|92
Vados|DBS|Ange univers 6|god|Bâton de l'ange|92
Goku|DBS|Super Saiyan Blue Kaioken ×20|saiyan|Surcharge divine|92
Grand Prêtre|DBS|Arbitre — Tournoi du Pouvoir|god|Ordre cosmique|93
`,
  legendary: `
Goku|DBS|Ultra Instinct maîtrisé|ultra|Perfection instinctive|99
Jiren|DBS|Pleine puissance|powerhouse|Puissance absolue|99
Beerus|DBS|Dieu de la destruction|god|Hakai|99
Vegeta|DBS|Super Saiyan Blue Evolution|royal|Évolution du prince|97
Vegito|DBS|Super Saiyan Blue|fusion|Fusion divine|99
Zamasu|DBS|Fusionné corrompu|god|Divinité en ruines|99
Goku|DBS|Ultra Instinct — Sign|ultra|Instinct qui s'éveille|96
Zen'ô|DBS|Roi des univers|god|Effacement cosmique|99
Beerus|DBS|Pouvoir de destruction libéré|god|Énergie Hakai|99
Zalama|DBS|Créateur des Super Dragon Balls (mentionné)|god|Pouvoir du créateur|93
Zamasu|DBS|Fusionné — halo de justice|god|Halo de Zamasu|93
Freezer|DBS|Golden Freezer — affrontement Jiren|ki|Cage dorée|94
Zen'ô du futur|DBS|Roi des univers futur|god|Effacement intemporel|94
Jiren|DBS|Jiren — choc contre Ultra Instinct|berserker|Éruption de volonté|94
Trunks|DBS|Super Saiyan Rage — épée de l'espoir|saiyan|Genki Dama tranchant|95
Whis|DBS|Entraînement de Goku et Vegeta|god|Leçon angélique|96
Vegeta|DBS|Super Saiyan Blue Evolution — contre Jiren|saiyan|Volonté des Saiyans|96
Kefla|DBS|Super Saiyan 2 — face à Ultra Instinct|saiyan|Rafale maximale|96
Beerus|DBS|Hakai — affrontement Zamasu|god|Hakai absolu|97
Grand Prêtre|DBS|Père des anges|god|Maîtrise céleste|99
Jiren|DBS|Puissance libérée — au bord du ring|berserker|Contre ultime|99
Zen'ô|DBS|Tournoi du Pouvoir — effacement|god|Effacement universel|100
Super Shenron|DBS|Dragon des Super Dragon Balls|god|Voeu cosmique|100
Goku|DBS|Ultra Instinct Sign — premier éveil|ultra|Instinct incomplet|102
`
};

/* EXTRA 100 EDITIONS — inventaire de travail, validation source à approfondir. */
const BASE_EFFECTS = {
  support: ['heal','shield','ally_buff','revive','team_guard'],
  trickster:['evasion','counter','weaken','extra_strike','last_stand'],
  tech: ['shield','weaken','counter','aoe','last_stand'],
  speed:['evasion','counter','extra_strike','stun','finisher'],
  guardian:['shield','guard','counter','healing','last_stand'],
  martial:['extra_strike','evasion','counter','stun','finisher'],
  sniper:['critical','bleed','weaken','finisher','aoe'],
  poison:['poison','weaken','evasion','finisher','aoe'],
  assassin:['execute','critical','evasion','counter','extra_strike'],
  berserker:['rage','extra_strike','bleed','aoe','sacrifice'],
  saiyan:['rage','extra_strike','counter','transform','finisher'],
  ki:['critical','extra_strike','shield','aoe','finisher'],
  time:['stun','evasion','counter','extra_strike','finisher'],
  demon:['bleed','poison','weaken','aoe','finisher'],
  regen:['healing','lifesteal','shield','aoe','revive'],
  android:['shield','counter','lifesteal','aoe','last_stand'],
  healer:['heal','shield','ally_buff','guard','revive'],
  fusion:['extra_strike','rage','critical','aoe','finisher'],
  god:['shield','weaken','evasion','aoe','finisher'],
  ultra:['evasion','counter','extra_strike','rage','finisher'],
  powerhouse:['rage','shield','counter','aoe','finisher'],
  royal:['rage','extra_strike','guard','transform','finisher']
};

export const EFFECT_LIBRARY = {
  rage:         {icon:'✦', name:'Puissance montante', timing:'Début du combat', description:'ATQ +12 % au début du combat.', trigger:'BATTLE_START', type:'atk_buff', amount:.12},
  shield:       {icon:'⬡', name:'Barrière', timing:'Début du combat', description:'Gagne un bouclier égal à 18 % des PV max.', trigger:'BATTLE_START', type:'shield', amount:.18},
  heal:         {icon:'✚', name:'Soin d’équipe', timing:'Toutes les 3 actions', description:'Soigne l’allié le plus blessé de 16 % de ses PV max, à chaque 3e action.', trigger:'ACTION_START', type:'heal_ally', every:3, amount:.16},
  healing:      {icon:'✚', name:'Régénération', timing:'Début de chaque round', description:'Récupère 5 % des PV max au début de chaque round.', trigger:'ROUND_START', type:'regen', amount:.05},
  evasion:      {icon:'◈', name:'Esquive', timing:'Avant de subir un coup', description:'18 % de chances d’éviter le coup, 1 fois maximum par round.', trigger:'BEFORE_HIT', type:'dodge', chance:.18, perRound:1},
  counter:      {icon:'↶', name:'Riposte', timing:'Après une esquive', description:'Après une esquive, contre-attaque à 65 % ATQ, 1 fois maximum par round.', trigger:'AFTER_HIT_OR_DODGE', type:'counter', multiplier:.65, perRound:1},
  extra_strike: {icon:'⚔', name:'Technique enchaînée', timing:'Chaque 3e action', description:'Chaque 3e action : +1 coup à 65 % ATQ.', trigger:'ACTION_ATTACK', type:'extra_strike', every:3, multiplier:.65},
  critical:     {icon:'✧', name:'Précision redoutable', timing:'Chaque attaque', description:'20 % de chances d’augmenter les dégâts de l’attaque de 45 %.', trigger:'BEFORE_ATTACK', type:'critical', chance:.20, multiplier:1.45},
  bleed:        {icon:'◆', name:'Entaille persistante', timing:'Après une attaque', description:'25 % de chances d’infliger 5 dégâts sur 2 débuts de round.', trigger:'AFTER_HIT', type:'dot', chance:.25, damage:5, duration:2},
  poison:       {icon:'☣', name:'Toxine', timing:'Après une attaque', description:'30 % de chances d’infliger 7 dégâts sur 2 débuts de round.', trigger:'AFTER_HIT', type:'dot', chance:.30, damage:7, duration:2},
  weaken:       {icon:'⌁', name:'Affaiblissement', timing:'Après un coup', description:'Une fois par 3 actions : réduit l’ATQ de la cible de 10 % pendant 2 rounds.', trigger:'AFTER_HIT', type:'weaken', every:3, amount:.10, duration:2},
  stun:         {icon:'⚡', name:'Interruption', timing:'Chaque 4e action', description:'Chaque 4e action : fait perdre sa prochaine action à la cible.', trigger:'AFTER_HIT', type:'stun', every:4},
  guard:        {icon:'⛨', name:'Interposition', timing:'Avant un coup fatal sur un allié', description:'Une fois par combat, absorbe une frappe fatale destinée à un allié avec son propre bouclier.', trigger:'BEFORE_HIT', type:'intercept', once:true},
  lifesteal:    {icon:'◇', name:'Drain de vie', timing:'Après chaque coup', description:'Récupère 15 % des dégâts infligés, jusqu’aux PV max.', trigger:'AFTER_HIT', type:'lifesteal', amount:.15},
  ally_buff:    {icon:'↑', name:'Inspiration', timing:'Début du combat', description:'Tous les alliés gagnent +6 % d’ATQ au début du combat.', trigger:'BATTLE_START', type:'team_buff', amount:.06},
  team_guard:   {icon:'⬡', name:'Refuge collectif', timing:'Début du combat', description:'Tous les alliés gagnent un bouclier de 8 % de leurs PV max.', trigger:'BATTLE_START', type:'team_shield', amount:.08},
  aoe:          {icon:'✺', name:'Déferlement', timing:'Chaque 4e action', description:'Chaque 4e action : touche tous les ennemis à 42 % ATQ.', trigger:'ACTION_ATTACK', type:'aoe', every:4, multiplier:.42},
  transform:    {icon:'☄', name:'Second souffle', timing:'Une fois sous 45 % PV', description:'Au premier passage sous 45 % PV, +20 % ATQ et +12 VIT.', trigger:'HP_THRESHOLD', type:'transform', threshold:.45, atkBuff:.20, speedBuff:12, once:true},
  execute:      {icon:'✕', name:'Frappe d’exécution', timing:'Après avoir blessé un ennemi affaibli', description:'Une fois par combat, si la cible a moins de 35 % PV, frappe supplémentaire à 80 % ATQ.', trigger:'AFTER_HIT', type:'execute', threshold:.35, multiplier:.8, once:true},
  finisher:     {icon:'★', name:'Technique ultime', timing:'Une fois sous 30 % PV', description:'Au premier passage sous 30 % PV, frappe la cible la plus faible à 165 % ATQ.', trigger:'HP_THRESHOLD', type:'finisher', threshold:.30, multiplier:1.65, once:true},
  last_stand:   {icon:'◉', name:'Dernière chance', timing:'Avant un KO', description:'Une fois par combat, survit à un coup fatal avec 1 PV.', trigger:'BEFORE_KO', type:'last_stand', once:true},
  revive:       {icon:'✚', name:'Retour miraculeux', timing:'Au premier KO', description:'Une fois par combat, se relève à 24 % des PV max après un KO.', trigger:'ON_KO', type:'revive', amount:.24, once:true},
  sacrifice:    {icon:'☀', name:'Explosion finale', timing:'Une fois sous 30 % PV', description:'Frappe tous les ennemis à 100 % ATQ et tombe KO.', trigger:'HP_THRESHOLD', type:'sacrifice', threshold:.30, multiplier:1, once:true}
};

// Quelques déclenchements iconiques remplacent la mécanique standard du slot correspondant.
const OVERRIDES = {
 'goku-dbs-ultra-instinct-maitrise':[
   {key:'evasion',name:'Corps autonome',chance:.42,perRound:1},
   {key:'counter',name:'Riposte imperceptible',multiplier:.75},
   {key:'extra_strike',name:'Danse des images résiduelles',every:3,multiplier:.78},
   {key:'transform',name:'Instinct sans limite',threshold:.35,atkBuff:.25,speedBuff:17},
   {key:'finisher',name:'Instant de perfection',threshold:.25,multiplier:2.1}
 ],
 'vegeta-dbz-majin':[
   {key:'rage',name:'Orgueil Saiyan',amount:.16},
   {key:'extra_strike',name:'Double déferlement',every:3,multiplier:.75},
   {key:'bleed',name:'Fureur du prince',chance:.37,damage:9,duration:2},
   {key:'sacrifice',name:'Final Explosion',threshold:.28,multiplier:1.1}
 ],
 'piccolo-dbz-saga-saiyans':[
   {key:'shield',name:'Défense du mentor',amount:.22},
   {key:'guard',name:'Sacrifice pour Gohan',protectName:'Gohan'},
   {key:'counter',name:'Makankosappo',multiplier:1.15}
 ],
 'dende-dbz-guerisseur-de-namek':[
   {key:'heal',name:'Guérison namek',every:2,amount:.18},
   {key:'shield',name:'Dernier rempart',amount:.2}
 ],
 'hit-dbs-saut-temporel':[
   {key:'stun',name:'Saut temporel',every:3},
   {key:'evasion',name:'Déphasage',chance:.25},
   {key:'counter',name:'Frappe dans l’angle mort',multiplier:.85}
 ],
 'cell-dbz-forme-parfaite':[
   {key:'healing',name:'Régénération parfaite',amount:.075},
   {key:'lifesteal',name:'Absorption cellulaire',amount:.21},
   {key:'shield',name:'Cellule protectrice',amount:.2},
   {key:'aoe',name:'Kamehameha solaire',multiplier:.58}
 ],
 'beerus-dbs-dieu-de-la-destruction':[
   {key:'shield',name:'Aura divine',amount:.2},
   {key:'weaken',name:'Pression du dieu',amount:.14},
   {key:'evasion',name:'Esquive divine',chance:.26},
   {key:'aoe',name:'Orbes de destruction',every:3,multiplier:.6},
   {key:'finisher',name:'Hakai',threshold:.35,multiplier:2.25}
 ],
 'jiren-dbs-pleine-puissance':[
   {key:'rage',name:'Puissance écrasante',amount:.22},
   {key:'shield',name:'Mur d’énergie',amount:.21},
   {key:'counter',name:'Riposte immobile',multiplier:.9},
   {key:'aoe',name:'Déferlante de puissance',every:3,multiplier:.6},
   {key:'finisher',name:'Volonté absolue',threshold:.35,multiplier:2.05}
 ],
 'vegito-dbs-super-saiyan-blue':[
   {key:'rage',name:'Fusion divine : ki démultiplié',amount:.24},
   {key:'shield',name:'Corps fusionné invincible',amount:.18},
   {key:'extra_strike',name:'Rafale spirituelle',multiplier:.95},
   {key:'aoe',name:'Final Kamehameha',multiplier:.83},
   {key:'finisher',name:'Lame de ki transcendantale',threshold:.28,multiplier:2.15}
 ],
 'zamasu-dbs-fusionne-corrompu':[
   {key:'shield',name:'Immortalité imparfaite',amount:.27},
   {key:'weaken',name:'Jugement de la création',amount:.19,duration:3},
   {key:'revive',name:'Divinité qui refuse la mort',amount:.18},
   {key:'aoe',name:'Lames du ciel pourpre',multiplier:.64},
   {key:'finisher',name:'Colère du dieu déchu',threshold:.31,multiplier:2.18}
 ],
 'goku-dbs-ultra-instinct-sign':[
   {key:'evasion',name:'Premier mouvement instinctif',chance:.46},
   {key:'counter',name:'Contre sans pensée',multiplier:.86},
   {key:'extra_strike',name:'Danse des coups invisibles',multiplier:.83},
   {key:'transform',name:'Le corps transcende l’esprit',threshold:.44,atkBuff:.26,speedBuff:14},
   {key:'finisher',name:'Kamehameha du silence',threshold:.27,multiplier:2.15}
 ],
 'zen-o-dbs-roi-des-univers':[
   {key:'team_guard',name:'Sous la protection du Roi',amount:.24},
   {key:'weaken',name:'Présence cosmique écrasante',amount:.2,duration:3},
   {key:'evasion',name:'Hors des lois du combat',chance:.45},
   {key:'aoe',name:'Geste d’effacement',multiplier:.8},
   {key:'finisher',name:'Effacement absolu',threshold:.45,multiplier:2.5}
 ],
 'vegeta-dbs-super-saiyan-blue-evolution':[
   {key:'rage',name:'Fierté du prince',amount:.20},
   {key:'extra_strike',name:'Assaut Blue Evolution',every:3,multiplier:.8},
   {key:'guard',name:'Promesse à Cabba'},
   {key:'transform',name:'Briser ses limites',threshold:.4,atkBuff:.25,speedBuff:10},
   {key:'finisher',name:'Explosion finale maîtrisée',threshold:.28,multiplier:2.1}
 ]
};

function slugify(s) {return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function makeEffect(key, label, override={}) {
  const base=EFFECT_LIBRARY[key];
  const e={key, ...base, ...override};
  if(!override.name && label) e.name=label;
  // Les descriptions sont calculées sur les vrais paramètres, jamais une chaîne incohérente après override.
  const percent=n=>Math.round(n*100);
  const fmt={
    atk_buff:()=>`Début du combat (unique) : ATQ +${percent(e.amount)} %.`,
    shield:()=>`Début du combat (unique) : bouclier de ${percent(e.amount)} % des PV max.`,
    heal_ally:()=>`Une fois, au début d'une action si un allié est blessé : soigne l’allié le plus blessé de ${percent(e.amount)} % de ses PV max.`,
    regen:()=>`Une fois, au début d'un round après avoir été blessé : récupère ${percent(e.amount)} % des PV max.`,
    dodge:()=>`Sur la première attaque subie : ${percent(e.chance)} % de chances d'esquiver. Une tentative unique.`,
    counter:()=>`Une fois, après la première attaque reçue ou esquivée : riposte à ${percent(e.multiplier)} % ATQ.`,
    extra_strike:()=>`Une fois, après une attaque normale du round 2 ou après : frappe additionnelle à ${percent(e.multiplier)} % ATQ.`,
    critical:()=>`Sur sa première attaque : ${percent(e.chance)} % de chance de multiplier les dégâts par ${e.multiplier}. Une seule tentative.`,
    dot:()=>`Une fois au premier impact : ${percent(e.chance)} % de chance d'infliger ${e.damage} dégâts pendant ${e.duration} rounds.`,
    weaken:()=>`Une fois au premier impact : réduit l’ATQ de la cible de ${percent(e.amount)} % pendant ${e.duration} rounds.`,
    stun:()=>`Une fois au premier impact : la cible perd sa prochaine action.`,
    intercept:()=>`Une fois : protège de l'attaque fatale ${e.protectName?`destinée à ${e.protectName}`:'visant un allié'}.`,
    lifesteal:()=>`Une fois après la première attaque : récupère ${percent(e.amount)} % des dégâts infligés.`,
    team_buff:()=>`Début du combat (unique) : +${percent(e.amount)} % ATQ pour toute l’équipe.`,
    team_shield:()=>`Début du combat (unique) : +${percent(e.amount)} % PV max en bouclier pour les alliés.`,
    aoe:()=>`Une fois, à partir du round 3 : touche tous les adversaires à ${percent(e.multiplier)} % ATQ.`,
    transform:()=>`Une fois sous ${percent(e.threshold)} % PV : ATQ +${percent(e.atkBuff)} %, VIT +${e.speedBuff}.`,
    execute:()=>`Une fois, lorsqu'une cible tombe sous ${percent(e.threshold)} % PV : frappe à ${percent(e.multiplier)} % ATQ.`,
    finisher:()=>`Une fois sous ${percent(e.threshold)} % PV : attaque la cible la plus faible à ${percent(e.multiplier)} % ATQ.`,
    last_stand:()=>`Une fois : résiste à une attaque mortelle et reste avec 1 PV.`,
    revive:()=>`Une fois : au coup fatal, revient avec ${percent(e.amount)} % de ses PV max.`,
    sacrifice:()=>`Une fois sous ${percent(e.threshold)} % PV : ${percent(e.multiplier)} % ATQ à tous les ennemis, puis sacrifice.`
  };
  e.description=fmt[e.type]();
  return e;
}

function makeCard(line,rarity,i){
 const [name,series,form,kit,signature,rawPower]=line.split('|').map(x=>x.trim());
 const power=Number(rawPower);
 const id=slugify(`${name}-${series}-${form}`);
 const idx=RARITIES[rarity].sort;
 const bonus=series==='DBS'?3:series==='DBZ'?1:0;
 const {attack,maxHp,speed,price,canonTier}=canonStats({name,series,form,power,kit});
 const raw=(OVERRIDES[id]||BASE_EFFECTS[kit].slice(0,idx+1).map(key=>({key})));
 if(raw.length!==idx+1) throw Error(`Incorrect effects for ${id} ${raw.length}/${idx+1}`);
 const effects=raw.map((v,j)=>makeEffect(v.key,j===0?signature:null,v));
 return {id,name,series,form,kit,rarity,attack,maxHp,speed,power,canonTier,price,effects,portrait:`assets/portraits/${id}.webp`,source:'À documenter : première apparition / source officielle',isPrototype:true};
}
export const CARDS=Object.entries(RAW).flatMap(([rarity,lines])=>lines.trim().split('\n').map((line,i)=>makeCard(line,rarity,i)));
// V5.2 : rareté liée au rang narratif, jamais à un ancien emplacement arbitraire.
// Les seuils de quotas sont fixes, tri déterministe (canonTier, ATQ, ID).
// Les avatars divins ou de soutien restent des cartes jouables mais leur puissance
// représente une estimation éditoriale : voir AUDIT_CATALOGUE_V52.csv.
const ORDERED_RARITIES=['common','uncommon','rare','epic','legendary'];
const buckets=[198,162,126,90,24];
const ascending=[...CARDS].sort((a,b)=>a.canonTier-b.canonTier||a.attack-b.attack||a.id.localeCompare(b.id));
let cursor=0;
for(let r=0;r<buckets.length;r++){
 for(const c of ascending.slice(cursor,cursor+buckets[r])){
  const newRarity=ORDERED_RARITIES[r];
  const originalEffects=c.effects;
  const originalRaw=OVERRIDES[c.id] || [];
  const fillers=BASE_EFFECTS[c.kit] || BASE_EFFECTS.martial;
  const picks=[];
  // Préserve les effets signature uniques, puis complète la nouvelle rareté.
  for(const e of originalRaw){if(picks.length<r+1&&!picks.some(v=>v.key===e.key))picks.push(e);}
  for(const key of fillers){if(picks.length<r+1&&!picks.some(v=>v.key===key))picks.push({key});}
  // Certains overrides recouvrent les effets génériques : pas de doublons.
  for(const key of Object.keys(EFFECT_LIBRARY)){if(picks.length>=r+1)break;if(!picks.some(v=>v.key===key))picks.push({key});}
  const signature=originalEffects[0]?.name || c.name;
  c.rarity=newRarity;
  c.effects=picks.slice(0,r+1).map((v,j)=>makeEffect(v.key,j===0?signature:null,v));
 }
 cursor+=buckets[r];
}
export const CARD_MAP=new Map(CARDS.map(c=>[c.id,c]));
export const COLLECTION_TARGETS=Object.fromEntries(Object.entries(RARITIES).map(([key,r])=>[key,r.rate]));
if(CARDS.length!==600) throw new Error(`Le catalogue pilote doit avoir 600 cartes : ${CARDS.length}`);
for(const [rarity,target] of Object.entries(COLLECTION_TARGETS)) {
 const got=CARDS.filter(c=>c.rarity===rarity).length;
 if(got!==target*6) throw new Error(`Répartition incorrecte ${rarity}: ${got} au lieu de ${target}`);
}
if(new Set(CARDS.map(c=>c.id)).size!==CARDS.length) throw new Error('IDs en doublon');
