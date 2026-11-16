# KI ARENA V19.2 — corrections Rogue et collection

## PASS — tests et intégrité
- Baseline avant modification : `npm test`, sortie conservée séparément dans `qa/v192/baseline.log`.
- Après modification : `npm test`, code 0, `qa/v192/tests-final.log`. Les anciens tests de packs V19.1 ont été adaptés à la règle V19.2 explicitement demandée (cinq cartes, plus de progression par étage, crédit à ouverture). Les autres tests n'ont pas été remplacés.
- V19 : 18 tests/entrées passent ; V18 protection passe ; suites V17/items/V8 passent. Les tests antérieurs de rangs couvrent 60 vagues, les 15 combinaisons d'univers et les deux modes de statistiques.
- 1 000 seeds supplémentaires contrôlent les six étapes et les trois offres du draft (deux visibles, un mystère), rangs dans les bornes N/600.
- 10 000 packs / 50 000 cartes : fréquences de rareté et finition à moins de 1,2 point des cibles. Les 100 valeurs de rouleau répartissent exactement 33/27/21/15/4 cases. Aucun tirage garanti par pack ; aucune modification par gamme.
- Tests de migration v1 vers v2 collection, reprise d'ouverture, double ouverture et stockage qui échoue. Un seul enregistrement atomique avant révélation.
- Données historiques, moteur, catalogues source et assets historiques conservés ; `scripts/verify_v192.py` + inventaire comparé au ZIP V19.1.

## PASS — parcours manuel dans le navigateur
Contrôle via navigateur Chrome distant du HTML autonome servi en HTTP, et non des images conceptuelles :
- Accueil → choix d'univers → six choix → map → préparation → premier combat réel → pause/reprise → résolution → récompense unique → rencontre suivante → repli → bilan.
- Guide et surlignage visibles à chaque étape de première partie. La fin du premier combat désactive le guide pour les passages suivants ; bouton de fermeture disponible à tout moment.
- Alliés à gauche, adversaires à droite. Ancien découpage en trois rangées explicitement supprimé après détection de cartes coupées.
- FX procéduraux sur les échanges réels, pause et interruption. La gamme d'effets est sélectionnée par type d'attaque et univers ; ni RNG ni résultat de combat ne sont changés.
- Pack réellement gagné, scellé illustré, cinq dos, révélation, agrandissement puis fermeture. La seconde ouverture propose de revoir le même résultat, sans crédit supplémentaire.
- Collection : 24 entrées non possédées grisées dans la page inspectée. Recherche et filtres existants conservés.
- Formats simulés par iframe de largeur 390/768/1360 : collection et packs sans débordement horizontal ; cinq cartes lisibles sur mobile avec scroll vertical. Ce contrôle n'est pas un test sur appareil tactile physique.

## BLOCKED / limites
- Classement manuel : aucun JSON validé de l'atelier n'a été fourni. L'ordre source reste actif. Aucun changement inventé aux statistiques ou effets canoniques. Les bandes sont 25–35, 15–45, 0–60, converties sur N/600 pour viser le bas du pool (DB : rangs jusqu'à 60 parmi 600). Le mystère est fixé avant clic. La rareté d'une fiche source ne prouve pas son rang ; les finitions dorées sont cosmétiques.
- Portraits : l'asset Goku enfant vérifié est conservé. De nombreux autres visuels restent des illustrations génériques héritées ou des portraits manquants. Le nouveau pack est fini, pas l'ensemble des portraits du catalogue. Aucune collecte externe ni licence nouvelle obtenue ici.
- Windows natif et ouverture `file://` de cette révision : non validés. Le navigateur distant refuse ce protocole. Le HTML autonome a été reconstruit et testé servi en HTTP, les ressources sont embarquées, mais cela ne remplace pas un double-clic Windows réel.
- Effets : contrôle du combat réel effectué ; pas de validation exhaustive de chaque capacité des 3022 fiches ni certification subjective « 9/10 ». Mouvement réduit prévu dans CSS/JS, pas testé sur appareil avec réglage système réel dans cette session.
- Nouveau solo Megabonk : propositions détaillées dans IDEES_EXPEDITION_V192.md ; pas présenté comme implémenté.
- Les anciens audits et captures restent dans le projet à titre d'archives. Ce rapport décrit uniquement V19.2.

## Règle de pack V19.2
Un pack de cinq après une run contenant au moins un combat résolu (victoire ou défaite). Aucun pack au simple abandon avant combat. Un pack par run, univers limités à ceux joués, pas de cumul par étage. Les anciens packs de trois déjà crédités restent acquis. Sans réseau, une personne qui édite volontairement son stockage local peut modifier sa collection : cette version n'est pas une économie serveur.
