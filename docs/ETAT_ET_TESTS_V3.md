# Validation V3

- 300 cartes avec IDs uniques et sans entrées strictement dupliquées `nom + série + version` ; 157 noms et 690 associations carte/effet.
- Raretés exactes : 99 communes, 81 peu communes, 63 rares, 45 épiques, 12 légendaires.
- Tests Node : `npm test` -> **29 contrôles réussis**, incluant déterminisme, statistiques, probabilités de packs, unicité d'effets, progression de zones, réserve, équipement, artefacts, PV persistants et bilan final.
- Tests de navigateur Chromium réalisés : interface desktop et mobile, écran de sélection roguelike, formation équipe, nœuds, plateau de combat, journal, résultats, recrutement, atelier de composition libre et galerie.
- **Limites :** catalogue non exhaustif/non validé comme source officielle ; images de personnages génériques en SVG ; aucune image Google téléchargée dans le build ; pas de serveur multi ni authentification, pas d'APK/IPA.
- Le champ de recherche d'images est préparé pour 300 entrées, la récupération optionnelle n'a pas été effectuée dans cet environnement sans sortie Internet.
