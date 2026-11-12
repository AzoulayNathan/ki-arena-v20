# Rapport QA — Arène 10.0.0

## Entrée et préservation

Source : KI_ARENA_V9_HANDOFF_IA_LEGER.zip, SHA-256 8650855da8737af244a44a9699213f84986517fb02eb5c318e6350146192d8a8. Les chemins Windows du ZIP ont été normalisés à l’extraction. Le dossier fourni ne contenait ni index.html ni portraits externes. Le shell et les assets historiques manquants ont été repris de la livraison locale précédente.

Le snapshot original est joint dans BACKUP_V8. Les hashes protègent le moteur, le catalogue, les CSV, les templates et finitions CSS du handoff. Les corrections historiques sont isolées aux tables de boss Naruto/One Piece et à la migration de la lignée DB/HXH. Le vérificateur de template normalise les fins de ligne à la comparaison, sans réécrire la fonction card.

## Commandes et preuves

| Commande | Résultat | Trace |
|---|---|---|
| npm test baseline | PASS des moteurs précédents | qa/v10/baseline.log |
| npm test final | PASS V8, Survival, V9.2/V9.3, livraison, protection et Arène | qa/v10/all-tests.log |
| python scripts/test_reference.py | PASS : 12 tests | qa/v10/python-final.log |
| node --test tests/test-arena.mjs | PASS : 19 blocs, dont 2700 rencontres réelles | qa/v10/arena-tests.log |
| node tests/simulate-arena.mjs 1000 | Invariants PASS, 15 pools, 60 vagues, trois tiers | qa/v10/simulation-1000.json |
| python build_preview.py | HTML autonome, assets embarqués | qa/v10/build.log |
| npm run qa:arena | Desktop/tablette/mobile, cinq mini-jeux, quatre boss, médias et file:// | qa/v10/browser.json |
| python scripts/verify_arena.py | Contrôle bloquant de présence et preuves | qa/v10/verify-package.log |
| python scripts/package_arena.py | CRC, hashes extraits, rebuild identique et npm test après extraction | VERIFICATION_ZIP_V10.json extérieur |

Les scripts échouent avec un code non nul sur erreur. Les golden fixtures précédentes viennent de la livraison précédente et n’ont pas été recalculées à partir du moteur modifié.

## Gameplay vérifié

Trois offres distinctes, cinq identités différentes, trois armes physiques utilisables par l’équipe, aucun mana ni main. Équipement unique, compatible avec l’univers, remplaçable avant combat. Le pool est figé par combinaison, N, version, hash et seed.

Le graphe sauvegardé contrôle réellement l’accès aux rencontres. Les boss sont privilégiés parmi des adversaires nommés quand le budget exact l’autorise, sans enfreindre la somme des rangs ni les rangs distincts. Le premier acte et son boss ont été joués dans les quatre mangas, avec passage au suivant.

Le combat utilise un adaptateur isolé du moteur historique. Sans équipement spécifique, il produit les mêmes événements et le même résultat que le moteur inchangé. Ajouts : perforation d’équipement, support de plus de 64 ennemis et conservation du snapshot final même si le journal est abrégé. Les personnages attaquent une fois par round ; leurs techniques ponctuelles gardent leurs déclencheurs. Trente rounds maximum, départage aux ratios de PV.

Chaque décision est sauvegardée avant affichage. Un échec de stockage conserve l’état précédent et signale l’erreur. Le résultat et le curseur de combat sont persistés ; une récompense ne peut pas être appliquée deux fois. Les KO quittent les vivants, ne sont jamais soignés et les réserves ne reçoivent pas d’XP. La saturation du loot conserve trois récompenses applicables avec des bonus de run éditoriaux.

## Items

Les 43 lignes DB et 55 HXH sources restent intactes. Le handoff ajoute un item DB éditorial et 64 lignes Naruto/One Piece : 163 lignes au total. Il ne s’agit pas de 163 armes. Les capacités personnelles, les effets de pioche du mode Deck Survival et les contaminations HXH dans les catalogues éditoriaux Naruto/One Piece sont exclus du pool Arène.

**95 items actifs** ont chacun été attribués et ont exercé leur hook de préparation ou combat. **68 lignes sont exclues**, raisons détaillées dans LISTE_ITEMS_IMPLEMENTES.csv. Effets testés : ATQ, perforation, barrière, PV, soin, interruption, esquive et riposte. Les propositions éditoriales ne sont pas présentées comme canoniques vérifiées.

## Simulation et difficulté

1000 seeds de runs, 2,700,000 distributions exactes et 18,837 combats effectifs. Trois politiques : choix variés, puissance, protections/soins. Les politiques avancées utilisent l’équipement, les recrutements, soins et marchands. Ce sont des bots de diagnostic, pas une preuve de stratégie humaine optimale.

| Profil | Runs | Victoires | Défaites | Vague terminale moyenne | Max |
|---|---:|---:|---:|---:|---:|
| random | 334 | 4021 | 334 | 8.18 | 13 |
| strong | 333 | 6923 | 333 | 13.68 | 35 |
| balanced | 333 | 6893 | 333 | 13.56 | 35 |

Les choix changent fortement la durée. La formule exacte n’est pas multipliée pour fabriquer un résultat annoncé. Le budget et le nombre minimal d’ennemis continuent après vingt vagues ; les invariants sont contrôlés jusqu’à soixante. Les effets et équipements empêchent d’affirmer une linéarité parfaite des chances de victoire.

## Rendu et limites

Les captures Chromium sont de vrais états joués, pas des concepts générés. Tests à 390, 768 et 1360 pixels, en réduction des mouvements ; pas de débordement horizontal du document, carrousels locaux intentionnels. Les commandes restent stables pendant la lecture du combat.

Les imports média ont été vérifiés avec une icône et le son tap fourni, dans un contexte navigateur temporaire, y compris après rechargement. Ces fixtures ne sont pas livrées comme nouveaux portraits ou OST. Les captures de gameplay normales montrent les ressources effectivement incluses et les monogrammes en cas d’absence.

Blocages : portraits HXH/Naruto/One Piece et musiques originales absents du handoff ; exécution Windows native non disponible dans cet environnement Linux/Chromium. HTML file:// et accès historique testés. Le lanceur Windows est fourni, pas prétendu exécuté sur Windows.

La campagne Arène utilise les bonus génériques de niveau, sans créer de transformations canoniques. Les évolutions approuvées du pack et son système de main/pioche restent dans Deck Survival historique.
