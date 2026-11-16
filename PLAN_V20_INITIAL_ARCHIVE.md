# KI ARENA V20 — Plan d’implémentation complet

Date : 12 novembre 2026. Document de réalisation destiné à Cursor.
Statut : PLAN À IMPLÉMENTER ; aucune des modifications ci-dessous n’est présentée comme déjà livrée.
Référence : audit des sources V19.3 et RAPPORT_QA_V193.md. Si le dépôt contient une version plus récente, établir les différences avant toute modification.

## 1. Résultat recherché

Un autobattler de cartes manga où préparer son équipe est intéressant, regarder le combat est agréable et comprendre sa défaite donne envie de recommencer.

Conserver les combats entièrement automatiques. Les décisions se prennent avant les combats et entre les rencontres. Ne pas réintroduire main, mana ou cartes à jouer pendant l’affrontement.

Inspirations de conception : préparation accessible de Super Auto Pets, décisions de parcours de Slay the Spire, combinaisons d’objets de Backpack Battles et The Bazaar. Adapter ces principes à KI ARENA sans copier leurs assets ni leurs interfaces.

Suspendre l’ajout de nouveaux mini-jeux pendant cette passe. Conserver et tester les modes existants.

## 2. Éléments protégés et architecture

- Conserver les CSV sources, IDs, illustrations validées, finitions, probabilités de rareté et collection acquise.
- Préserver les moteurs et sauvegardes des modes historiques. Les nouvelles règles de gameplay doivent appartenir à une version distincte.
- Conserver le renderer de cartes. Remplacer des portraits provisoires ne signifie pas modifier le gabarit des cartes.
- JavaScript ES modules ; aucun fichier TypeScript non compilé ; aucun nouveau framework sans nécessité démontrée.
- Aucun service réseau obligatoire pour jouer.

Créer des modules JS isolés, par exemple src/v20/ : rules, progression, draft, catalog-overlay, normalization, abilities, equipment, encounters, bosses, rewards, storage, ui, tutorial et diagnostics. Les noms sont indicatifs ; vérifier l’architecture réelle du dépôt.

Ne pas déplacer tout le projet. Réutiliser les modules V19.3 stables. Les nouveaux comportements reçoivent un rulesVersion et un hash de données. Le renderer d’animations consomme les événements du moteur ; il ne décide jamais des dégâts.

Les anciennes runs continuent avec leur moteur et catalogue d’origine. Ne pas appliquer les nouveaux effets ou statistiques en cours d’une ancienne run. Une migration explicite peut être proposée après export et validation ; jamais une réinitialisation silencieuse.

## 3. P0 — Référence, diagnostic et garde-fous

1. Vérifier la version réelle, lire les consignes du dépôt et retrouver les modules concernés.
2. Exécuter toutes les suites existantes et conserver commandes, sorties et codes de sortie.
3. Faire un snapshot pre-v20 ; calculer les hashes des données, du renderer, des moteurs historiques et des modules de collection.
4. Reproduire les écarts de l’audit : après-boss, packs, draft à un personnage, diversité des capacités, normalisation et branche de phases de boss.
5. Créer STATUS_V20.md avec PASS / FAIL / BLOCKED et preuve par tâche.

Le rapport V19.3 signalait 117 tests Node passants, un protocole file:// bloqué dans le navigateur de vérification et un dossier reference-survie absent. Vérifier ces éléments dans le dépôt actuel. Ne pas fabriquer les tests Python manquants pour annoncer leur réussite.

Acceptation : baseline conservée, restauration documentée et aucune perte de sauvegarde.

## 4. P1 — Parcours de dix étapes puis infini

Machine d’états :

    choix des mondes → draft → parcours 1…10
    boss 10 gagné → halte infinie → boss 11 → halte → boss 12 → …
    combat perdu → fin de run → bilan / Panthéon / packs

- Étapes 1 à 9 : carte connectée avec rencontres réellement accessibles.
- Étape 10 : boss obligatoire.
- Après la victoire : quitter le générateur d’actes complets ; créer une carte dédiée à la succession de boss.
- Après chaque boss infini gagné : appliquer une seule fois les gains de victoire, choisir une récompense, puis ouvrir une halte de préparation.
- Halte : équipement, remplacement par une réserve, inventaire, aperçu du prochain boss et possibilité d’arrêter la run.
- Soin de victoire existant de 25 % aux survivants conservé. Pas de soin total gratuit ajouté en plus ; les soins supplémentaires conservent leurs règles et coûts.
- Difficulté de base 11, 12, 13… sans doublement et sans reset.
- Défaite du groupe actif = fin immédiate, même s’il reste des réservistes.
- Enregistrer l’équipe finale avec son équipement et ses contributions avant de retirer les KO ; le Panthéon conserve cette photographie.

Sauvegarder la prochaine rencontre à sa création. Recharger la halte ne doit changer ni le boss ni les récompenses.

Tests : reprise avant/après boss 10, transitions 11/12/20/21/60, abandon, perte avec réserve vivante, absence de double récompense.

## 5. P1 — Difficulté exacte et compréhensible

Pour la nouvelle version, figer le pool des mangas cochés et le mode harmonisé/original à la création de la run.

- N = nombre réel de cartes personnages du pool ; ne pas compter les armes.
- Classer les personnages sur les statistiques effectivement utilisées : P = ATQ + PV + VIT, puis ID stable.
- Budget B = round((N/4) × (d+t)), avec d la difficulté de base et t = 0 normal, 1 élite, 2 boss.
- La somme des rangs doit être exactement B ; rangs compris entre 1 et N.
- Conserver le contrat de distribution existant et documenter les nombres d’ennemis ; rangs distincts dès que cela est faisable.
- Après l’étape 10, chaque rencontre est un boss : d augmente de 1 et le modificateur boss reste fixe. Ne pas ajouter un second bonus de profondeur.
- Aucun multiplicateur de statistiques caché. Les équipements constituent un axe séparé, annoncé dans l’aperçu adverse.
- Ne jamais contourner le budget pour forcer un personnage célèbre dans un boss. Choisir une rencontre compatible ou un repli explicite.

Distinguer puissance de base, puissance des capacités et équipement. Une somme de rangs exacte ne prouve pas une difficulté ressentie linéaire.

Console créateur : mondes, mode de stats, N, ordre du pool, d, t, B, rangs et somme, équipement, exceptions et version. Aucun rang technique dans l’interface immersive normale.

Acceptation : invariants sur 60 difficultés et toutes les 15 combinaisons non vides des quatre mangas, dans les deux modes de stats.

## 6. P1 — Draft sans piège involontaire

Conserver six sélections et trois offres par sélection : deux visibles et une mystère fixée avant le clic.

Personnages :

- Offre A : q entre 25 et 35.
- Offre B : q entre 15 et 45.
- Mystère : q entre 0 et 60.
- Conversion : rang = max(1, round(q × N / 600)), borné à N. Le 600 est la référence DB ; ne pas utiliser N/60 pour les personnages.
- Tirage dans le pool trié complet figé ; retirer les candidats déjà sélectionnés sans recalculer les bornes sur le sous-pool restant.
- Exclure les doublons d’identité et les propositions invalides. Le nom ou la rareté ne doivent pas servir de classement de puissance.
- Interdire les légendaires au départ conformément aux retours du joueur, par un filtre explicite ; ne pas modifier leur rareté dans le CSV.

Composition :

- Tirage de type brut : 70 % personnage, 30 % arme par offre, avant contraintes.
- Décision de conception proposée : garantir au moins trois personnages à la fin des six choix.
- À chaque étape, calculer la faisabilité. Quand les choix restants sont tous nécessaires pour atteindre ce minimum, proposer des personnages.
- Les probabilités effectives après filtrage diffèrent donc parfois de 70/30 : le documenter et le tester ; ne pas promettre un ratio exact dans chaque équipe.
- Afficher simplement « Équipe 2/5 · Sac 1 », sans rangs. Signaler les choix de sécurité avec une phrase courte.

Armes :

- Seulement armes physiques transférables, compatibles avec un porteur de la run et sans capacité personnelle détournée.
- Créer un starterPool explicite d’armes de faible palier ; ne pas réutiliser N personnages comme taille du pool d’armes.
- Décision éditoriale : trier ce starterPool par coût d’équilibrage, puis utiliser une référence virtuelle 0…60 sur sa taille M : max(1, round(q × M/60)).
- Documenter cette différence avec les personnages. Le classement des armes mesure leur utilité de jeu, pas une force canonique.
- Ne pas élargir silencieusement le pool jusqu’aux objets forts en cas de manque ; proposer une autre offre légale ou désactiver avec raison.

Tests : 1 000 seeds minimum, aucun draft bloqué, minimum de personnages garanti, offres et mystère reproductibles, doublons refusés, compatibilité et filtres de puissance respectés.

## 7. P1 — Packs progressifs et attribution atomique

Contrat proposé pour lever l’ambiguïté des anciennes formulations :

| Plus haute étape atteinte E | Récompense de fin |
|---|---|
| Aucun combat résolu | Aucun pack |
| Défaite à l’étape 1 | Un pack de 3 cartes |
| Étape 2 | Un pack de 5 cartes |
| Étape 3 | Deux packs de 5 |
| Étape 10 | Neuf packs de 5 |
| Boss 11 | Dix packs de 5 |
| E ≥ 2 | E−1 packs de 5 |

« Atteinte » ne signifie pas « vaincue » : un combat perdu compte. Mais ouvrir un aperçu ou entrer puis abandonner avant résolution ne valide pas une nouvelle étape. Persister highestResolvedEncounterDepth ; les rencontres non combattues comptent après leur résolution effective. Les primes sont attribuées à la fin, sans historique de packs envahissant.

- Mondes des cartes limités à ceux de la run.
- Conserver raretés 33/27/21/15/4 et finitions noire 45 %, blanche 45 %, dorée 10 %, indépendantes.
- Identifiants uniques de run, attribution et ouverture idempotentes.
- Une panne d’écriture ne doit pas révéler des cartes non créditées, ni créditer deux fois.
- Une nouvelle run légitime peut gagner son minimum : ne pas supprimer la récompense promise sous prétexte d’anti-farm.
- Sur longue run, traiter les gros lots sans boucle bloquant l’interface.
- Dupliquer une carte augmente son compteur ; aucun nouveau système de monnaie de doublons dans cette passe.

Avant migration : inventorier les anciennes versions de collection et le moment de crédit. Préserver les cartes déjà obtenues et ne jamais récompenser à nouveau rétroactivement une ancienne run.

## 8. P2 — Personnages distincts et normalisation

Les sources auditées avaient 68 profils d’effets DB, 69 HXH, mais seulement 5 Naruto et 5 One Piece après retrait des noms/descriptions. Ce constat est une base de travail, pas un quota à gonfler artificiellement.

Créer une couche de gameplay versionnée sans réécrire les CSV sources. Pour chaque entrée : identité, variante, rôle, capacités sources, traduction gameplay, déclencheur, cible, durée, limite, coût d’équilibrage et statut de validation.

Familles de départ : assaut immédiat, pression persistante, riposte, protection/interception, contrôle, soutien. Une proposition de 12 à 20 profils réellement distincts par manga est un objectif de contenu ; ne pas imposer une technique incompatible à un personnage pour atteindre ce chiffre.

Chaque nouvelle capacité doit :

- Refléter une caractéristique documentée ; sinon être marquée adaptation éditoriale.
- Produire un événement moteur exploité par le journal et les FX.
- Respecter limites, KO et impossibilité des chaînes infinies.
- Posséder au moins un contre-jeu, une limite ou un coût de composition.

Normalisation harmonisée :

1. Conserver la position percentile dans chaque manga.
2. Déterminer la puissance cible commune à ce percentile.
3. Répartir cette puissance selon le profil relatif de la carte source, au lieu de 18/72/10 identique pour tous.
4. Corriger les arrondis pour garder la somme cible.
5. Équilibrer les capacités séparément : même percentile n’implique pas même chance de victoire dans chaque affrontement.

Mode original : conserver les stats brutes, sans cacher leur asymétrie entre univers.

Si les données source sont insuffisantes ou génériques, marquer REVIEW et utiliser un profil éditorial explicite ; ne pas prétendre avoir établi un classement canonique. Prévoir l’import futur des classements manuels du créateur avec IDs et version.

Acceptation : égalité de puissance cible au même percentile, profils rapides/résistants/offensifs distincts, identités préservées et tests de tous les hooks ajoutés.

## 9. P2 — Préparation tactique simple et équipement

Tout reste automatique après le lancement.

Nouvelle mécanique proposée : deux places d’avant-garde et trois de soutien. Les attaques ordinaires ciblent prioritairement une avant-garde vivante ; les capacités de ciblage explicitement définies peuvent déroger à la règle. La cible entre candidats légaux reste déterministe à seed égale.

Afficher les conséquences avant de déplacer une carte. Une seule règle de formation au départ ; ne pas ajouter en même temps une grille, des distances et des commandes par personnage.

Inventaire :

- Objets en haut, porteurs juste dessous, une seule surface de travail.
- Clic objet → comparaison → clic porteur ; poignée de glisser en complément.
- Afficher l’objet remplacé, les gains/pertes de stats et les effets non statistiques.
- Une arme et une armure ; outils sur le slot arme sauf exception documentée.
- Objets déjà équipés identifiés, retrait et transfert explicites.
- Cibles incompatibles visibles avec raison courte. Zéro objet inutilisable dans le loot.
- Sur mobile, deux rangées horizontales bien séparées ; ne pas dépendre exclusivement du glisser.
- Aperçu d’un personnage et retour au même endroit du sac.

Enrichir d’abord les objets qui changent les interactions : brise-bouclier, protection, riposte, soin conditionnel, interruption. Revoir les copies de bonus ATQ sans intérêt distinctif. Aucune création automatique de capacité personnelle transférable.

## 10. P2 — Boss, récompenses et carte

Créer d’abord huit boss aboutis, deux par manga, plutôt qu’un grand catalogue de noms sans comportement. Étendre ensuite.

Fiche obligatoire : identité/source, compatibilité de budget, composition, signature mécanique, avertissement avant combat, éventuelle transition, contre-jeu et table de récompense.

La fonction bossPhases existante ajoute des bonus de stats : ne pas simplement l’activer. Concevoir les nouvelles phases dans le contrat de difficulté, sans multiplicateur caché. Une phase doit changer un comportement ou un état explicite, avec effet plafonné et annoncé.

Ne pas utiliser les réservistes comme seconde vie. Éviter qu’une transition annule arbitrairement un KO déjà résolu.

Carte :

- Boss annoncé assez tôt pour adapter la composition.
- Carte globale accessible en un clic ou M.
- Routes survolées/focalisées liées aux vraies rencontres.
- Carte infinie dédiée montrant boss actuel et prochains paliers, sans faux embranchements.
- Variations visuelles de difficulté : décor, lumière, traces du parcours et introduction du boss ; ne pas surcharger le HUD.

Récompenses :

- Un seul choix parmi trois options réellement applicables.
- Quand le pool le permet : une option de consolidation, une d’adaptation et une de risque.
- Éviter que l’or soit automatiquement la meilleure option ; simuler sa valeur face aux soins, recrues et objets.
- Montrer la vraie carte de recrue ou d’arme et ce qu’elle apporte à l’équipe.

## 11. P3 — Combat : spectaculaire et explicable

Conserver l’acteur/cible à leur place et la stabilité des cartes entre les événements. Priorité à la causalité : le joueur doit identifier l’effet, sa source et son résultat.

Trois intensités :

- Ordinaire : anticipation courte, déplacement ou projectile, impact localisé, valeur réelle et retour.
- Capacité : signe propre à sa famille, nom court, source clairement mise en avant.
- Décisif : carte centrale pour KO, ultime ou changement majeur ; limiter les grandes apparitions afin de garder leur force.

Conserver les six familles d’animations V19.3 et leurs sous-groupes ; enrichir leurs textures, silhouettes et sons avant de multiplier les familles.

Ajouter :

- Icônes persistantes d’état avec durée/charges ; toucher ou survol pour les détails.
- Équipement qui s’allume quand son vrai effet se déclenche.
- Chaîne source → effet → cible ; distinguer dégâts, absorption et soin effectif.
- Frise d’initiative indiquée comme information courante, sans prétendre prédire exactement les actions futures.
- Pause, ×2, passer, mouvement réduit et contrôle des sons.

Journal moteur enrichi si nécessaire : eventId, actor, target, sourceId, causeId, type, valeurs avant/après, montant absorbé/soigné et état. Ne jamais inférer un gain mécanique depuis une animation.

Audio local : sons d’impact originaux ou licenciés, niveaux homogènes, musiques séparées des effets. Aucun téléchargement réseau obligatoire.

## 12. P3 — Illustrations et tutoriel

Inventorier portraits et objets par ID : valide, provisoire, manquant, doublon suspect. Conserver le renderer et les finitions ; travailler sur l’image source et son recadrage.

Collecte réelle des images : sources autorisées, provenance et droits enregistrés, contrôle de résolution, cadrage, personnage/forme et doublons. Respecter les restrictions des sites ; une image récupérée n’est pas automatiquement réutilisable. Ne pas appliquer automatiquement un doublon suspect.

Priorité : cartes de départ réellement rencontrées, boss, armes, puis reste du catalogue. Utiliser un substitut explicitement provisoire quand une image manque. Générer des décors/FX originaux ne remplace pas les portraits de personnages absents.

Tutoriel en situation :

1. Choisir ses mondes.
2. Recruter et comprendre personnage/arme/mystère.
3. Choisir un vrai chemin.
4. Équiper et placer l’équipe.
5. Lire une attaque, un état et un KO.
6. Choisir une récompense et lire le résultat.

Une consigne utile à la fois, contrôle réel mis en évidence, pas de combat truqué présenté comme une partie normale. Guide passable, relançable et sauvegardé. Pas de longs paragraphes permanents.

## 13. P4 — Bilan, Panthéon et rejouabilité

- Conserver les trois contributions principales : dégâts infligés, dégâts subis, soins effectifs.
- En cas d’absence de soin, le signaler ; ne pas inventer de podium.
- Montrer équipement, survie/KO, réserve, étape et version de règles.
- Ajouter une explication factuelle de la défaite fondée sur le journal : source dominante de dégâts, protections absorbées, interruptions et premier KO. Pas de conseil causal affirmé sans preuve.
- Panthéon : filtres par mangas, profondeur, date, règles, stats harmonisées/originales et favoris.
- Partager une seed avec sa version et son pool ; « rejouer » crée une nouvelle run sans dupliquer les gains de l’ancienne.
- Après stabilisation seulement : défis à seed commune et objectifs de composition. Pas de nouveau mode majeur dans cette livraison.

## 14. P4 — Calibration et recette

Tests automatisés :

- Baselines historiques, nouveaux hooks, budgets exacts, draft, KO, migration et économie.
- Au moins 1 000 seeds de draft par combinaison de mangas ; vérifier les deux modes de stats.
- Invariants adverses sur 60 niveaux, y compris quand les rangs distincts deviennent impossibles.
- Campagne d’au moins 1 000 simulations de runs réparties entre politiques : novice, puissance brute, synergies et risques ; augmenter la couverture si une configuration est sous-représentée.
- Mesurer victoires par étape, nombre de personnages initial, objets choisis, soins, durée, cause de mort, taux d’offres invalides et influence des capacités.
- Distinguer invariants mathématiques et objectifs de balance. Définir les objectifs après la première mesure ; ne pas retoucher la formule pour afficher une jolie courbe.

Tests navigateur et matériel :

- 390/768/1360, clavier, clic, tactile physique, glisser et alternative au clic.
- Pause/reprise, passage d’onglet, rechargement à toutes les transitions, stockage plein et double activation.
- Toutes les familles de FX reliées à des événements de vrais combats, pas seulement à la galerie.
- Objectif de performance : animation fluide sur PC intégré de référence, mémoire stable pendant une run longue ; mesurer avant d’annoncer un nombre de FPS.
- HTML ouvert par double-clic sans serveur et réseau coupé sur Windows réel ; lanceur BAT et reconstruction testés.

Test humain proposé : cinq nouveaux joueurs, puis trois joueurs de stratégie. Observer sans guider. Critères d’acceptation : au moins quatre débutants sur cinq atteignent le premier combat sans aide, aucun blocage critique, les joueurs peuvent expliquer une décision de préparation et une cause de défaite. Ce sont des objectifs à vérifier, pas des résultats acquis.

## 15. Ordre de réalisation et portes de validation

| Lot | Travail | Porte de sortie |
|---|---|---|
| 0 | Baseline, snapshot, hashes, règles figées | Retour V19.3 possible |
| 1 | Progression 10 → infini et packs | Transitions et gains idempotents |
| 2 | Difficulté, draft et console | Budgets exacts ; départ toujours viable |
| 3 | Overlay de capacités et normalisation | Profils distincts et hooks testés |
| 4 | Formation, objets et sac | Décisions précombat lisibles et fonctionnelles |
| 5 | Boss, routes et récompenses | Huit rencontres complètes et compatibles |
| 6 | FX, audio, portraits prioritaires, tutoriel | Aucun effet fictif ; provenance des assets |
| 7 | Bilan, Panthéon et défis légers | Mémoire de run exacte |
| 8 | Simulation, tests humains, Windows et package | Preuves et limites publiées |

Ne pas commencer un autre lot pour masquer un blocage du précédent. Conserver les résultats fonctionnels intermédiaires ; ne pas inventer un pourcentage d’avancement global.

## 16. Livraison exigée

Un ZIP contenant HTML autonome, BAT, sources, assets nécessaires, données, tests, scripts et documentation. Exclure dépendances inutiles et caches.

Inclure : README_JOUER, STATUS_V20, RAPPORT_QA_V20, CHANGELOG, manifeste des images/droits, capacités et items OK/EXCLU/REVIEW, règles chiffrées et décisions éditoriales, captures réelles et procédure de restauration.

Tous les scripts de vérification doivent échouer avec un code non nul sur erreur. Ne déclarer « Windows validé », « équilibrage validé », « images finales » ou « terminé » que si la preuve correspondante existe.

## 17. Instruction de démarrage pour Cursor

Implémente ce plan lot par lot dans le vrai dépôt. Commence par vérifier la version et produire le contrat de règles/migration ; poursuis ensuite les corrections fonctionnelles, les profils d’équipe, les boss et la finition visuelle. Ne modifie pas les CSV, finitions, collections ou modes protégés. Résous les détails non bloquants en les documentant. À chaque lot, exécute les tests pertinents, corrige les échecs puis mets à jour STATUS_V20.md avec preuves. Ne t’arrête pas à une maquette, une galerie FX ou une liste de fichiers. Termine par une version locale reconstruite et testée, avec les blocages réels encore visibles.
