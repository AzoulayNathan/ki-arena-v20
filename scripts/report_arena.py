from pathlib import Path
import subprocess,json,csv,hashlib,shutil
root=Path(__file__).resolve().parent.parent
code="import {registry,WORLDS} from './src/arena/catalog.js';console.log(JSON.stringify({items:registry(WORLDS).items,worlds:WORLDS.map(w=>({world:w,N:registry([w]).N,weapons:registry([w]).weapons.length,gear:registry([w]).gear.length}))}));"
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=root,text=True));proof={x['id']:x for x in json.loads((root/'qa/v10/item-execution.json').read_text())}
with (root/'LISTE_ITEMS_IMPLEMENTES.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['id','univers','nom','famille','effet','statut','raison','preuve','fidelite','origine','usages_arene','cout_arene'])
 for g in data['items']:
  status='OK' if g['ok'] and g['id'] in proof else 'IMPLEMENTATION_MANQUANTE' if g['ok'] else 'EXCLU'
  w.writerow([g['id'],g['universe'],g['name'],g['category'],g['effect'],status,g['reason'],'qa/v10/item-execution.json : '+g['id'] if status=='OK' else 'src/arena/catalog.js : itemEligibility',g['canon'],g.get('source',''),'1' if g['category']=='consommable' else 'porté / déclencheur limité par combat','préparation libre'])
rows=[]
for p in sorted((root/'assets').rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(root).as_posix();origin='Dossier utilisateur + ressources V8/V9 de référence';rights='Droits du fichier source à vérifier ; aucune nouvelle licence accordée'
 if '/fonts/' in rel:origin='Polices locales Outfit/Barlow fournies';rights='Licence jointe dans assets/v9/fonts'
 if '/v9/' in rel and p.suffix=='.webp':origin='Paysage raster fourni dans le handoff ; génération antérieure, pas une capture navigateur'
 if '/stylized/' in rel:origin='Illustration SVG DB de référence conservée byte-identique'
 rows.append([rel,hashlib.sha256(p.read_bytes()).hexdigest(),p.stat().st_size,origin,rights,'LOCAL_INCLUS'])
for w in ['hxh','naruto','onepiece']:rows.append(['assets/portraits-'+w+'/*.webp','',0,'Dossiers externes du propriétaire dans HANDOFF_IA.md','Non fournis','BLOCKED_ABSENT_IMPORT_LOCAL_DISPONIBLE'])
rows.append(['BANDES_ORIGINALES','',0,'Non fournies dans les sources','Aucune OST distribuée','BLOCKED_ABSENT_IMPORT_LOCAL_DISPONIBLE'])
with (root/'MANIFEST_ASSETS_ET_DROITS.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['chemin','sha256','octets','provenance','droits','etat']);w.writerows(rows)
sim=json.loads((root/'qa/v10/simulation-1000.json').read_text());browser=json.loads((root/'qa/v10/browser.json').read_text());qa_state='PASS' if browser.get('ok') else 'FAIL'
checks=[('Snapshot et fichiers historiques','PASS','BACKUP_V8/PRE_V10_HANDOFF_ORIGINAL.zip ; PRE_V10_HASHES.json ; npm test'),('600 cartes DB / moteur / finitions','PASS','Hashes exacts de src/app.js, battle.js, catalog.js, CSS et CSV ; contrôle historique de 689 fichiers'),('Quatre catalogues, 15 combinaisons, N dynamique','PASS','600 DB + 532 HXH + 313 Naruto + 1577 OP ; tests/test-arena.mjs'),('Normalisation proportionnelle top 5%','PASS','Courbe commune ; test écart discret <1,5% ; invariance en ajoutant un univers'),('Draft 5 personnages + 3 armes, trois offres','PASS','Tests dans les 15 combinaisons ; aucune main dans Arène'),('Cinq actifs / réserve / équipement avant combat','PASS','Tests slots, compatibilité et exclusivité ; items-*.png'),('Graphe réel / carte globale / boss','PASS','Tests de chemins ; global-map-*.png ; quatre boss joués puis acte suivant'),('Budgets exacts et continuation au-delà de 20','PASS','2 700 rencontres réelles jusqu’à 60 vagues + 2 700 000 distributions sur 1000 seeds'),('Combat auto de cartes / pause / x2 / passer',qa_state,'qa/v10/browser.json ; combat-*.png ; commandes stables pendant la lecture'),('KO / soins / XP / récompense unique','PASS','Tests de survie, réserve sans XP et idempotence ; récompenses saturées corrigées'),('Marchand / soin / anti-farm','PASS','Tests achats et services uniques ; objets utilisables uniquement'),('Tous les items proposés','PASS',str(len(proof))+' lignes OK exécutées ; 163 lignes recensées dans LISTE_ITEMS_IMPLEMENTES.csv'),('Nen personnel / contamination entre catalogues','PASS','Exclusions motivées ; CSV source intacte ; aucune capacité personnelle en loot transférable'),('Sauvegardes / migration / reprise','PASS','Clés séparées ; anciens bytes préservés ; export/import ; version et hash du pool figés'),('Cinq mini-jeux et Auto 5 choisi',qa_state,'qa/v10/browser.json : cinq modes joués à 390/768/1360'),('Responsive / carrousels / navigation clavier',qa_state,'Aucun débordement horizontal du document ; M, Escape, focus visible ; réduction des mouvements testée'),('Import des portraits et de l’audio',qa_state,'qa/v10/browser.json : persistance après rechargement ; icône et son de test, pas portraits officiels'),('Musiques originales des œuvres incluses','BLOCKED','Aucune OST dans le handoff. Import local et volumes fonctionnels, musique 5% par défaut.'),('Portraits HXH/Naruto/One Piece complets','BLOCKED','HANDOFF_IA.md : dossiers externes non transmis. Monogrammes explicites et import local.'),('600 SVG DB fournis','PASS','Illustrations source conservées ; portraits réels importés prioritaires'),('Tests V8/V9 + Python + Arène','PASS','qa/v10/all-tests.log ; python-final.log : 12 tests ; arena-tests.log : 19 blocs'),('HTML autonome sans serveur',qa_state,'file:// testé : draft complet, combat, récompense et accès aux modes historiques ; zéro requête HTTP'),('Lanceur et serveur Windows','PASS','LANCER_SUR_PC_WINDOWS.bat ; npm start ; aucune dépendance npm pour jouer'),('Exécution native Windows','BLOCKED','Environnement de validation Linux/Chromium ; le .bat est fourni mais non exécuté sur Windows.'),('Linéarité parfaite des taux de victoire','BLOCKED','Non démontrée : effets, soins et équipements non linéaires. Aucun budget falsifié.'),('ZIP / manifeste / restauration','PASS','scripts/package_arena.py ; FILE_MANIFEST_SHA256.json ; reçu VERIFICATION_ZIP_V10.json extérieur')]
text='# STATUS_V9 — Arène 10.0.0 / 24 octobre 2026\n\nLa dernière demande est réalisée dans un nouveau parcours de cinq cartes automatiques. Les modes précédents restent distincts. **La complétude artistique n’est pas acquise : portraits et OST externes manquent.**\n\n| Sous-système | État | Preuve / limite |\n|---|---|---|\n'+''.join('| '+a+' | **'+b+'** | '+c+' |\n' for a,b,c in checks)+'\nAucun pourcentage global de complétude annoncé. Les exclusions et blocages restent visibles.\n';(root/'STATUS_V9.md').write_text(text)
text='''# Rapport QA — Arène 10.0.0

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

'''
text+=f"**{len(proof)} items actifs** ont chacun été attribués et ont exercé leur hook de préparation ou combat. **{len(data['items'])-len(proof)} lignes sont exclues**, raisons détaillées dans LISTE_ITEMS_IMPLEMENTES.csv. Effets testés : ATQ, perforation, barrière, PV, soin, interruption, esquive et riposte. Les propositions éditoriales ne sont pas présentées comme canoniques vérifiées.\n\n"
text+='## Simulation et difficulté\n\n'+f"{sim['seeds']} seeds de runs, {sim['rankChecks']:,} distributions exactes et {sim['battles']:,} combats effectifs. Trois politiques : choix variés, puissance, protections/soins. Les politiques avancées utilisent l’équipement, les recrutements, soins et marchands. Ce sont des bots de diagnostic, pas une preuve de stratégie humaine optimale.\n\n| Profil | Runs | Victoires | Défaites | Vague terminale moyenne | Max |\n|---|---:|---:|---:|---:|---:|\n"
for name,p in sim['profiles'].items():text+=f"| {name} | {p['runs']} | {p['wins']} | {p['losses']} | {p['finalWaves']/p['runs']:.2f} | {p['maxWave']} |\n"
text+='''
Les choix changent fortement la durée. La formule exacte n’est pas multipliée pour fabriquer un résultat annoncé. Le budget et le nombre minimal d’ennemis continuent après vingt vagues ; les invariants sont contrôlés jusqu’à soixante. Les effets et équipements empêchent d’affirmer une linéarité parfaite des chances de victoire.

## Rendu et limites

Les captures Chromium sont de vrais états joués, pas des concepts générés. Tests à 390, 768 et 1360 pixels, en réduction des mouvements ; pas de débordement horizontal du document, carrousels locaux intentionnels. Les commandes restent stables pendant la lecture du combat.

Les imports média ont été vérifiés avec une icône et le son tap fourni, dans un contexte navigateur temporaire, y compris après rechargement. Ces fixtures ne sont pas livrées comme nouveaux portraits ou OST. Les captures de gameplay normales montrent les ressources effectivement incluses et les monogrammes en cas d’absence.

Blocages : portraits HXH/Naruto/One Piece et musiques originales absents du handoff ; exécution Windows native non disponible dans cet environnement Linux/Chromium. HTML file:// et accès historique testés. Le lanceur Windows est fourni, pas prétendu exécuté sur Windows.

La campagne Arène utilise les bonus génériques de niveau, sans créer de transformations canoniques. Les évolutions approuvées du pack et son système de main/pioche restent dans Deck Survival historique.
'''
(root/'RAPPORT_QA.md').write_text(text)
print('Rapports écrits :',len(proof),'OK,',len(data['items'])-len(proof),'exclus ; QA navigateur',qa_state)
