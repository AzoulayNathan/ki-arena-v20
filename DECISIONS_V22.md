# Décisions explicites

La dernière demande verrouille le reste du produit. Le draft courant 5 personnages + 3 armes et ses bandes initiales 50–70, 35–85, 15–100 sur 600 sont donc conservés ; l’ancien brief 25–35/60 n’est pas réintroduit. Les valeurs restent internes. Les armes suivent les mêmes fractions sur leur pool compatible trié ; un petit pool bénéficie d’un minimum de trois rangs voisins pour ne pas bloquer le draft. Une arme physique déjà possédée peut revenir dans une étape ultérieure, sans doublon dans la même offre.

Difficulté SOLO actuelle conservée : budget de base round(N/4 × (v+t) × 0,5625), puis prestige existant ; t=0/1/2. La référence Survie indépendante N/4 × (v+t) reste inchangée. Les sommes des rangs sont exactes ; la puissance perçue dépend aussi des effets et des stats brutes. Un légendaire est exclu du draft initial V22 ; la rareté ne remplace pas le rang dans le calcul des ennemis ultérieurs.

Après combat, le centre des offres dépend du budget réel par ennemi / N. Multiplicateurs de fenêtres : visible .8–1.1, deuxième .65–1.2, mystère .5–1.5 ; bornage et quantification discrète. Les armes utilisent leur propre taille de pool. Pour fournir quatre armes au marchand si la fenêtre ne contient pas quatre modèles, la quatrième est le voisin compatible le plus proche et porte quantizedShelf dans l’état. Les pools vides sont désactivés avec une raison, jamais remplacés par un objet inutilisable.

Le soin optionnel de 25 % s’ajoute au soin de victoire historique de 25 % des survivants : ce dernier est protégé. L’offre est une seule décision parmi cinq ; zénis de victoire automatiques. Vente à 35 % de la cote, exclusivement marchand, jamais du dernier vivant. Prix spéciaux or ×1,2 ; remise relique plafonnée.

Les reliques sont EDITORIAL_PROPOSE, pas des objets canoniques affirmés. Les effets d’armes sont également des interprétations de gameplay. L’or est une finition spéciale indépendante de la rareté : 10 % ; noir et blanc 45 % chacun. Les ennemis gardent leurs statistiques de rang exactes, sans bonus or caché.

La nouvelle partie utilise crypto.getRandomValues, sans seed joueur. Les partitions d’ennemis emploient le solveur déterministe existant avec une entropie fraîche ; le combat utilise une graine interne fraîche, puis son résultat est figé avant animation. Cela préserve un replay exact tout en renouvelant les nouvelles parties.

Les nouvelles sauvegardes ont leur clé V22 distincte. Une ancienne partie continue sur son ancien moteur. Les assets et quatre modules historiques protégés gardent leurs empreintes. Les nouveaux pictogrammes d’armes sont des silhouettes de catégorie originales et non des illustrations exactes des objets de manga.
