# KI ARENA V18 — état de livraison

Refonte de présentation depuis la V17. Les règles, catalogues, sauvegardes et cartes ne sont pas remaniés. Les résultats ci-dessous sont validés par le script `scripts/verify_v18.py`, qui exige les rapports navigateur de la même empreinte du code et du HTML livrés.

| Sous-système | État | Preuve |
|---|---|---|
| Cartes, données, assets, moteurs et sauvegardes protégés | PASS | `npm test`, `tests/test-v18.mjs`, `PRE_V18_HASHES.json` : tous les octets antérieurs conservés ; seule l’insertion du hook visuel est autorisée dans UI |
| Accueil, roulette, Solo fixe, clavier, reprise, six choix | PASS | `qa/v18/base/browser.json`, captures aux trois largeurs |
| Boutons, champs, curseurs, onglets, sélections, désactivés, focus | PASS | feuille `src/v18/polish.css`, recettes components/games/party/encounters |
| Audio, réglages, import/export local | PASS | components et media : imports normaux/spéciaux séparés, persistance, audio jouer/arrêter |
| Collection, favoris, pagination, filtre mobile | PASS | components : filtres, vide, favoris, inspection ; party : persistance après rechargement |
| Inventaire, équipement, porteurs, réserve, effets/pertes | PASS | components : assignation effective ; games : remplacement de réserve conserve les PV |
| Carte globale, six décors d’acte, événements, décisions uniques | PASS | games : carte et événements ; actes 2–6 par sauvegardes QA déclarées |
| Marchand, repos, trésor | PASS | encounters : soins, achat débité une fois, bouton acheté désactivé, un seul trésor |
| Cinq mini-jeux existants | PASS | games : duel, rank, draft budget, auto5, tournament jusqu’au résultat sur 390/768/1360 |
| Trois jeux de mémoire | PASS | extras : paires/intrus/relais jusqu’au résultat, reprise et double clic |
| Entre amis, enchères, équipes, tournoi, finales | PASS | party : reprise enchères, 3 matchs en coupe à 4, garder/tenter, 5 dilemmes |
| Panthéon vide/rempli/favoris et bilan | PASS | components + encounters, captures réelles |
| Modèle de carte séparé | PASS | model : HTML autonome, variantes, effets temporaires, pas de réseau ; aucun remplacement dans le jeu |
| HTML autonome et combats sans saut | PASS | base/games/party en `file://`, navigateur hors ligne ; lecture automatique jusqu’au résultat |
| Intégrité ZIP et reconstruction après extraction | PASS | `VERIFICATION_ZIP_V18.json` livré à côté du ZIP |
| Exécution native sur un PC Windows réel | BLOCKED | OS Windows non disponible ; lanceurs CRLF et HTML file:// vérifiés sous Chromium Linux |
| Refonte des menus du moteur historique V8 | BLOCKED | Délibérément exclus du nouvel habillage pour conserver la référence historique ; lancement et retour vérifiés |
| Équilibrage global de l’aventure | FAIL | Limite héritée V17 : aucun acte I terminé dans les deux échantillons automatiques de 1000 seeds ; les formules ne sont pas changées par cette version visuelle |
| Portraits manquants / bandes originales | BLOCKED | Non présents dans les sources ; import local disponible, aucune fausse illustration exacte ni OST annoncée |
| Pack original des 12 tests Python | BLOCKED | Pack absent de la livraison V17 récupérée ; aucun nouveau succès Python revendiqué |

Les visuels d’objets reprennent les illustrations exactes approuvées, les adaptations existantes, des images de catégorie explicitement décrites ou des pictogrammes. Une image unique par objet n’est pas revendiquée. Le menu ouvert des listes natives garde l’apparence du système. Les zones de combat et les cartes gardent leur rendu historique, avec le nouvel habillage des commandes.
