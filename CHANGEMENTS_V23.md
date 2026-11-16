# Changements V23

- Correction du contrat : chaque combat gagné donne un personnage en draft, une arme en draft, puis soin25 OU relique. Les deux premiers gains ne sont plus sacrifiés au troisième.
- Deux cartes visibles + un mystère par draft. Le mystère est figé avant le clic ; la main, les budgets ennemis et les anciennes règles ne sont pas réinventés.
- Tirage de chaque draft au moment de son ouverture : l’arme tient compte du recrutement et d’un éventuel remplacement du dernier représentant d’un monde. Les offres affichées ne changent plus au reload.
- Trois étapes visibles, vrais visages/cadres, résumé compact des gains acquis, consultation des effets avant de choisir ; contrastes corrigés et carousel mobile plus lisible.
- Verrou de remplacement, jeton par gain, transaction atomique, contrôle de fenêtre obsolète avant mutation et sauvegarde protégée. Aucun retour sur un nœud déjà résolu pour redonner le butin.
- Migration V22 non destructive ; anciens tirages déjà engagés conservés jusqu’à leur résolution. Clé V23 distincte, anciennes clés gardées.
- Butin de progression préparant les deux prochains pas et tenant compte du rang le plus élevé réellement vaincu ; aucun changement aux stats brutes ou à la formule des ennemis. Le modèle initial5+3 et ses bandes courantes sont conservés.
- Auto : protège un actif très blessé lors du choix final, prend les trois gains et continue ; fonctions V22 de réserve/équipement/achats conservées.
- 38 illustrations officielles vérifiées ajoutées ; 132 portraits manquants remplacés par des références identifiées. Aucun faux dessin de personnage, aucune certification inventée des transformations. Tous les anciens assets gardent leurs octets.
- Collecteurs réels, manifestes de provenance, empreintes, examen visuel et journal des mauvaises correspondances. Un portrait de Piccolo Junior ne devient pas celui de son père.
- Recette courante npm test, conservation explicite de l’ancienne chaîne ; attentes V20 modernisées avec preuves de référence V22, originales sauvegardées.
- Rapport QA, statut, captures réelles, tests, sauvegardes de rollback, HTML autonome et ZIP complet reconstruits.

Les28 reliques,16 événements, marchand2+4, ventes, FX/sons par familles, finitions10/45/45, carte10étapes et replay fatal deV22 sont maintenus. Les autres mini-jeux et leurs règles ne sont pas réécrits dans cette passe.

Correction spécifique au HTML autonome : suppression des BOM lors de l’assemblage CSS, police de titre rétablie, boutons d’inspection contrastés et étiquettes de butin lisibles.
