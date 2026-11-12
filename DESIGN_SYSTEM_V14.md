# Direction visuelle V14 · Chroniques

La scène conduit l’attention : paysage de chapitre, route possible, choix principal, équipe et sac. Ivoire chaud pour les surfaces, encre verte pour le texte, orange pour l’action, or discret pour l’inconnu. Pas de glow continu sur les commandes. Les polices et médias restent locaux.

## Composition

- Accueil : une invitation à jouer, accès clair à l’aventure, collection, arcade et jeux entre amis.
- Monde : panorama 1536 × 1024 optimisé WebP ; voile local derrière le texte ; trois propositions réelles au maximum, carte globale secondaire.
- Six chapitres : vallées, canyon, archipel, rives extraterrestres, terrasses célestes, ruines d’orage. Textes éditoriaux, aucun lieu canonique revendiqué.
- Carte : géométrie et palette par chapitre ; pas de route décorative trompeuse. Six thèmes cycliques, pas de promesse d’images uniques à l’infini.
- Draft : deux faces observables et une silhouette mystère ; CTA distinct du toucher exploratoire ; noms et capacités en dehors de la face collectionnable.
- Sac : catégories puis objets puis cibles ; comparatif de remplacement textuel ; poignée de drag distincte pour préserver le scroll.
- Événements : panneaux parallèles, risques et contreparties réelles ; aperçu sans conséquence, confirmation qui engage.
- Combat : cartes conservées, acteur et cible lisibles, technique puis K.O. de la victime, aucun résultat inventé pour l’animation.
- Bilan : groupe réellement joué, trois contributeurs par onglet ; détails chiffrés facultatifs. Panthéon comme souvenir illustré.

## Interaction

Transitions brèves, arrivées décalées des routes, absence de translation sous le bouton de recrutement. Rotation tactile limitée et annulable. Le réglage système de mouvement réduit désactive les mouvements décoratifs. Pause, accélération et passage au résultat restent disponibles.

Les commandes principales visent 44 px de hauteur. Les cartes de rencontre et d’offre utilisent un défilement horizontal sur mobile ; le document n’a pas de débordement horizontal parasite. Le focus clavier reste visible et revient sur une décision valide après enchère.

## Limites et protection

Le code et les styles additionnels sont isolés dans src/v14 ; la fonction fighter et les finitions existantes sont comparées à leur référence V13. Les assets originaux et CSV restent identiques.

Les nouvelles cartes géographiques sont des images générées fournies dans le pack V14, transformées en WebP. Les objets utilisent des dessins éditoriaux identifiés ou des pictogrammes lorsque leur vraie image n’est pas validée. Les portraits manquants restent des substituts honnêtes. Voir MANIFEST_ASSETS_ET_DROITS.csv pour chaque fichier.
