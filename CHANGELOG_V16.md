# V16 · Horizons / 5 novembre 2026

Accueil : panorama et roulette d’univers conservés ; les trois tuiles fixes deviennent un carrousel de seize entrées vers leurs vrais modes. Trois grandes tuiles à 1360/768 px, une tuile avec aperçu de la suivante à 390 px. Défilement lent en boucle, arrêt au survol/focus, pause explicite, flèches et balayage natif. Les thèmes et illustrations suivent l’univers actif.

Pages : quatre décors de recrutement propres aux mangas, salon d’arcade et portail de tournoi. Nouvelle préparation solo, cases d’univers illustrées, fusion plus lisible, départ simplifié. Recrutement sur scène illustrée, arme et personnage distingués, sac de départ lisible. Arcade, enchères, tournois, préférences, Auto 5, collection, rencontres, inventaire, bilans et modales harmonisés. La position horizontale des cases d’univers est conservée lors d’un choix ; à l’entrée, l’univers actif est amené à l’écran.

Draft : six sélections mixtes sur les nouvelles runs ; chaque tour propose deux personnages et une arme. Les trois places conservent leurs bandes respectives 25–35 / 15–45 / 0–60. Le dernier choix reste caché et déterminé avant le clic. Pas de doublon d’identité, d’arme inutilisable ni d’élargissement discret des bandes. Garde-fous : trois alliés minimum, une arme compatible minimum, cinq alliés maximum. Composition finale possible : 3+3, 4+2 ou 5+1. Le ratio 10/20 concerne les offres, pas une composition finale imposée.

Compatibilité : `createRun` conserve les anciennes règles par défaut ; `createRunV16` initialise les nouvelles. `isCurrentRules` reconnaît V16 pour conserver la difficulté V14. Sauvegarde V16 séparée, pointeur de version active par combinaison de mangas, imports et replays respectant la version. Les runs V15 restent en 5 personnages puis 3 armes. Aucun changement de moteur de combat, de statistiques source, d’illustration de personnage ou de finition.

QA : audit pré-modification de 240 drafts V15 et 5 040 rencontres, reproduits exactement après intégration. 1 500 drafts mixtes, 270 000 rencontres sur 60 vagues et 1 000 runs d’acte I avec trois profils. Recette navigateur à 390/768/1360, onze rapports liés aux hashes du runtime et du HTML, cas `file://`, ancien draft importé, vrais effets et K.O. Les fixtures d’actes et événements sont identifiées séparément du parcours naturel.

Derniers détails : contraste du bandeau du salon corrigé, indication typographique pour les seuls portraits absents, cases de filtres sans hauteur parasite et espacement du titre mobile. Les images et finitions fournies restent intactes.
