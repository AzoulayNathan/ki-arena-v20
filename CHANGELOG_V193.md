# V19.3 — présentation des combats et équipement

- Directeur de présentation isolé : un impact et un KO restent deux moments distincts, ordre du moteur préservé.
- Conservation des cartes dans le DOM entre les coups ; rafraîchissement des PV, boucliers et valeurs modifiées.
- Correction d’affichage : les instantanés moteur utilisent atk, pas attack.
- Six familles / 23 variantes procédurales Canvas : corps à corps, armes, énergie, soutien, contrôle, KO.
- Effets de capacité, soin, esquive, bouclier, interruption et dégâts persistants ; son synchronisé sur l’impact.
- Carte réelle au centre pour les capacités et les KO, issue du même renderer que la collection.
- Terrain gauche/droite, noms/PV lisibles sous les cartes, ruban d’action et indicateur d’initiative par vitesse.
- Sélecteurs CSS corrigés pour éviter les dimensions héritées, les barres de défilement des équipes et les boucliers étirés.
- Sac visuel compact au-dessus de l’équipe, filtres, comparaison réelle, clic ou glisser, aperçu avec retour au sac.
- Guide contextuel du départ à la première issue, commandes ciblées, fermeture et relance dans Réglages.
- Galerie visuelle de démonstration ; aucune récompense, aucune mutation de run.
- Build autonome : références d’assets runtime converties en URL Blob locales pour éviter de répéter de longues chaînes base64 dans le DOM.
- Aucun changement de difficulté, moteur, catalogue, assets historiques, chances de drop, rareté ou sauvegarde.
