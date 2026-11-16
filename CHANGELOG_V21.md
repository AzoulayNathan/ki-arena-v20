# Changements V21 réellement intégrés

- Couche Manga Arcade commune : contrastes navbar, boutons, cartes, draft, sac, collection, scènes et plateau.
- Un nouveau décor original de combat local, 1672 × 941, optimisé en WebP.
- Cartes HTML avec portrait lié par ID, reflets/rotation bornés, trois finitions, image plus ouverte avec la rareté. Remplacement des canvas HD par carte dans ces vues.
- Placement effectif : deux gardiens devant, trois soutiens ; les attaques ordinaires visent les gardiens vivants, le focus peut contourner.
- Adaptateur de capacités couvrant les 3 022 fiches : blast/support/heal/ultimate sont reliés à des effets exécutables. Profils éditoriaux identifiés, aucun nouvel état canonique.
- Cadences récurrentes pour plusieurs capacités, ripostes sans boucle, protection contre l’interruption en chaîne, bouclier plafonné et trois DOT simultanés maximum.
- Suppression du multiplicateur caché ×1,5 sur les bonus des nouvelles runs ; finitions cosmétiques V21 sans bonus statistique caché ×1,1. Anciennes runs conservées.
- Correctif DOT V20 : le nombre d’applications réel correspond à la durée annoncée. Moteur V8 non modifié.
- FX de combat par familles : énergie, projectiles, corps à corps, lames, soutien, contrôle, sortie ; onomatopées réelles, chiffres de dégâts et HP synchronisés.
- Bruitages Web Audio différenciés et bornés ; bruit mis en cache ; musique locale existante en repli à faible volume, réglages séparés.
- Cache de la file d’événements, copie superficielle pendant la lecture, sauvegarde aux frontières de round/KO plutôt qu’à chaque beat décoratif.
- Finitions 45 % noires / 45 % blanches / 10 % dorées ; filtrage cohérent avec les exemplaires et affichage des packs.
- Ouverture de pack atomique en une écriture ; pas de double attribution après reprise ou panne.
- Recherche collection préservant le focus ; Tout afficher désactive le filtre des cartes possédées ; contrôle blanc/noir/doré corrigé.
- Départ compact : quatre mondes visibles, panneau sans recouvrement ; trois offres centrées, carousel mobile.
- Récompense recrue affichée comme sa carte complète ; mini-portraits des meilleurs contributeurs en fin de combat.
- Import de run par JSON collé en complément du sélecteur de fichier. Correction du rendu du premier événement sans acteur lors d’une reprise.
- Audit visuel de 592 portraits DB présents ; 341 DB + 1 Naruto mis en quarantaine de rendu. Originaux conservés ; aucune identité visuelle remplacée arbitrairement.
- Générateur HTML reconstruit : 4 913 assets embarqués, contenus binaires dédupliqués, conversion Blob à la demande.
- Pack Python de référence restauré depuis le projet V11 local : 12 tests passent.
- Lanceur Windows et scripts d’intégrité/qualité distincts ; sauvegarde pré-V21 ; journaux et limites conservés.

Le système de boss, la progression V20, la formule de budget courante, les données des personnages et les règles des mini-jeux n’ont pas été réécrits. Les modes de normalisation historiques restent uniquement nécessaires à la compatibilité ; les nouveaux solos sont lancés en statistiques brutes.
