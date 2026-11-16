from pathlib import Path
import csv,json,unicodedata,re,collections
ROOT=Path(__file__).resolve().parent
DB_WEAPONS='https://dragonball.fandom.com/wiki/Category:Weapons'
DB_GEAR='https://dragonball.fandom.com/wiki/Category:Equipment'
HXH_WEAPONS='https://hunterxhunter.fandom.com/wiki/Melee_Weapons'
HXH_NEN='https://hunterxhunter.fandom.com/wiki/Nen'
HXH_GI='https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists'
# Format: name|owner|category|rarity|effect|canonicity|source|context
# CANON_NOMME: canonical specific prop (not game stats), CANON_CATEGORIE: generic canon tool, NEN_PERSONNEL: canonical ability manifestation, EDITORIAL: gameplay variety inspired but no named canonical device.
DB='''
Bâton magique Nyoi-bō|Son Goku|arme|rare|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Power_Pole|Bâton extensible, arme emblématique de Goku
Épée Z|Son Gohan|arme|legendary|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Z_Sword|Lourde épée des Kaiōshins, légende de pouvoir à ne pas interpréter littéralement
Épée de Trunks du futur|Trunks du futur|arme|epic|pierce|CANON_NOMME|https://dragonball.fandom.com/wiki/Future_Trunks%27_Sword|Épée maniée contre Freezer
Épée d'entraînement de Gohan|Son Gohan enfant|arme|uncommon|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Gohan%27s_Sword|Entraînement sous Piccolo
Katana de Yajirobé|Yajirobé|arme|rare|pierce|CANON_NOMME|https://dragonball.fandom.com/wiki/Yajirobe%27s_Katana|Lame de Yajirobé
Hache du Roi Démon Taureau|Gyūmaō|arme|uncommon|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/The_Ox-King%27s_Axe|Arme du père de Chi-Chi
Éventail Bashō-sen|Tortue Géniale / Son Goku|arme|legendary|shield|CANON_NOMME|https://dragonball.fandom.com/wiki/Bansho_Fan|Contrôle du vent, mécanisme limité à un écran tactique en jeu
Épée de Tao Pai Pai|Tao Pai Pai|arme|rare|pierce|CANON_NOMME|https://dragonball.fandom.com/wiki/Tao%27s_Sword|Arme à vérifier selon continuité manga
Étoiles de ninja de Murasaki|Ninja Murasaki|arme|common|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Ninja_Murasaki|Shuriken du ninja de l'armée du Ruban Rouge
Sabre du ninja Murasaki|Ninja Murasaki|arme|uncommon|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Ninja_Murasaki|Sabre et armes de ninja, détail du modèle à contrôler
Épée de Shu|Shu|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Shu|Arme de garde du gang Pilaf, représentation exacte à confirmer
Casque-lame de Chi-Chi|Chi-Chi enfant|arme|uncommon|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Chi-Chi|Casque à lame intégré de sa tenue d'enfance
Ray gun de Jaco|Jaco|arme|rare|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Jaco|Arme technologique de la Patrouille galactique
Fusil de l'armée de Freezer|Soldats de Freezer|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Ray_Gun|Armes de tir technologiques de soldats
Pistolet laser de garde|Soldats intergalactiques|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Ray_Gun|Arme standard non liée à un personnage unique
Fusil d'assaut Ruban Rouge|Soldats Ruban Rouge|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Red_Ribbon_Army|Armement militaire classique
Lance-roquettes Ruban Rouge|Soldats Ruban Rouge|arme|uncommon|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Rocket_Launcher|Armement militaire classique
Mitraillette de Lunch|Lunch|arme|uncommon|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Launch|Arme à feu dans ses scènes de combat
Fusil de Lunch|Lunch|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Launch|Différentes armes à feu visibles dans l'œuvre
Fusil de Mai du futur|Mai du futur|arme|rare|atk|CANON_NOMME|https://dragonball.fandom.com/wiki/Future_Mai|Arme moderne utilisée face à Goku Black
Pistolet de Mai|Mai|arme|common|atk|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Mai|Équipement Pilaf
Pot de scellement Mafūba|Tortue Géniale|consommable|epic|shield|CANON_NOMME|https://dragonball.fandom.com/wiki/Evil_Containment_Wave|Réceptacle de scellement, non pas arme permanente
Sceau papier du Mafūba|Tortue Géniale|consommable|rare|stun|CANON_NOMME|https://dragonball.fandom.com/wiki/Evil_Containment_Wave|Objet lié à une technique, effets limités pour gameplay
Armure de combat Saiyan|Vegeta / Nappa|armure|rare|shield|CANON_NOMME|https://dragonball.fandom.com/wiki/Battle_Armor|Protection des guerriers Saiyans
Armure de Freezer Force|Soldats de Freezer|armure|uncommon|shield|CANON_NOMME|https://dragonball.fandom.com/wiki/Battle_Armor|Modèle standard de protection
Armure d'élite Ginyu|Commando Ginyu|armure|epic|shield|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Battle_Armor|Variante visuelle d'armure de l'armée de Freezer
Armure capsule de Gohan (Namek)|Gohan enfant|armure|uncommon|shield|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Battle_Armor|Tenue protectrice prêtée pendant l'arc Namek
Cape lestée de Piccolo|Piccolo|armure|rare|hp|CANON_NOMME|https://dragonball.fandom.com/wiki/Weighted_Clothing|Vêtement d'entraînement lourd, effets de jeu extrapolés
Turban lesté de Piccolo|Piccolo|outil|uncommon|hp|CANON_NOMME|https://dragonball.fandom.com/wiki/Weighted_Clothing|Composant de la tenue lestée
Tenue lestée de Goku|Son Goku|armure|uncommon|hp|CANON_NOMME|https://dragonball.fandom.com/wiki/Weighted_Clothing|Vêtements lourds retirés avant combat
Carapace d'entraînement de Kamé Sennin|Tortue Géniale|armure|common|hp|CANON_NOMME|https://dragonball.fandom.com/wiki/Master_Roshi|Carapace portée pendant l'entraînement de Goku et Krilin
Scouter standard|Raditz / Soldats|outil|uncommon|scout|CANON_NOMME|https://dragonball.fandom.com/wiki/Scouter|Mesure et localisation, effet de pioche scénarisé
Scouter d'élite|Commando Ginyu|outil|rare|draw|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Scouter|Meilleure plage de mesure, pas de valeur officielle de stats
Dragon Radar|Bulma / Son Goku|outil|epic|draw|CANON_NOMME|https://dragonball.fandom.com/wiki/Dragon_Radar|Repérage des Dragon Balls, transformé en bonus de pioche de gameplay
Capsule Hoï-Poï|Capsule Corporation|outil|common|draw|CANON_NOMME|https://dragonball.fandom.com/wiki/Capsule_Corporation|Miniaturisation d'équipement, effet de pioche éditorial
Haricot Senzu|Karin|consommable|epic|heal|CANON_NOMME|https://dragonball.fandom.com/wiki/Senzu_Bean|Soins, aucun retour automatique d'un personnage mort en jeu
Machine de soins Namek|Armée de Freezer|consommable|rare|heal|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Medical_Machine|Référence à la cuve médicale, convertie en objet utilisable
Télécommande des cyborgs|Dr Gero / Krilin|outil|rare|stun|CANON_NOMME|https://dragonball.fandom.com/wiki/Shut_Down_Remote|Télécommande de désactivation, pas de contrôle total en jeu
Nuage magique Kinto-un|Son Goku|outil|rare|evade|CANON_NOMME|https://dragonball.fandom.com/wiki/Flying_Nimbus|Monture et non arme ; effet d'esquive uniquement
Tenue de patrouille galactique|Jaco|armure|uncommon|shield|CANON_CATEGORIE|https://dragonball.fandom.com/wiki/Galactic_Patrol|Tenue d'intervention
Queue de singe Saiyan|Saiyans|intrinseque|rare|atk|HORS_EQUIPEMENT|https://dragonball.fandom.com/wiki/Saiyan_Tail|Partie du corps, exclure du pool d'objets équipables
Lame d'énergie de Goku Black|Goku Black|nen|epic|pierce|HORS_EQUIPEMENT|https://dragonball.fandom.com/wiki/Violent_Fierce_God_Slicer|Attaque de ki et non épée physique transmissible
Arme à absorption de C-19|C-19|intrinseque|epic|shield|HORS_EQUIPEMENT|https://dragonball.fandom.com/wiki/Android_19|Dispositif anatomique, à garder dans les capacités
'''
HXH='''
Canne à pêche de Gon|Gon Freecss|arme|common|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Gon_Freecss|Arme-outil de Gon avant la maîtrise du Nen
Yo-yos de Killua|Killua Zoldyck|arme|rare|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Deux yoyos de 50 kg ; matériau métallique spécial
Cartes de Hisoka|Hisoka Morow|arme|rare|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Cartes de jeu renforcées au Nen par Hisoka
Aiguilles d'Illumi|Illumi Zoldyck|arme|epic|stun|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Illumi_Zoldyck|Aiguilles utilisées pour l'assassinat et la manipulation
Pièces de Gotoh|Gotoh|arme|uncommon|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Gotoh|Pièces lancées comme projectiles
Sabre de Nobunaga|Nobunaga Hazama|arme|epic|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Katana du membre de la Brigade Fantôme
Parapluie-épée de Feitan|Feitan Portor|arme|epic|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Feitan_Portor|Arme cachée multifonctions avec projectile
Tachi de Kite|Kite|arme|rare|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Kite|Sabre utilisé lors de sa rencontre avec Gon
Faux Crazy Slots n°2|Kite|nen|legendary|atk|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kite|Arme matérialisée, uniquement utilisable via le pouvoir de Kite
Bâton Crazy Slots n°3|Kite|nen|epic|shield|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kite|Fonction inconnue dans l'œuvre, effet de jeu purement éditorial
Carabine Crazy Slots n°4|Kite|nen|epic|atk|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kite|Fusil conjuré par Crazy Slots
Chaînes de radiesthésie|Kurapika|nen|rare|scout|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kurapika|Dowsing Chain, matérialisation propre à Kurapika
Chaîne du Jugement|Kurapika|nen|legendary|stun|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kurapika|Judgment Chain, capacités très conditionnelles
Chaîne Prison|Kurapika|nen|legendary|stun|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kurapika|Chain Jail réservée dans l'œuvre à la Brigade Fantôme
Chaîne de guérison|Kurapika|nen|epic|heal|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kurapika|Holy Chain du pouce
Chaîne de vol|Kurapika|nen|legendary|draw|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kurapika|Steal Chain, interdit de décrire l'effet comme universel
Doubles sabres de bois|Kurapika|arme|common|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Avant le Nen ; deux lames en bois reliées
Grand calumet de Morel|Morel Mackernasey|arme|rare|shield|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Support de la fumée du pouvoir Deep Purple, peut aussi frapper
Aspirateur Deme-chan (Blinky)|Shizuku|nen|epic|draw|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Nen|Objet matérialisé personnel, absorbe objets non vivants
Livre Skill Hunter|Chrollo Lucilfer|nen|legendary|draw|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Chrollo_Lucilfer|Objet de spécialisation, ne donne pas vol réel des capacités dans ce système
Marque-page Double Face|Chrollo Lucilfer|nen|legendary|draw|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Chrollo_Lucilfer|Accessoire d'une capacité et non objet générique
Tissus Fun Fun Cloth|Owl|nen|epic|stun|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Owl|Tissu matérialisé de stockage / capture
Téléphone Black Voice|Shalnark|outil|rare|draw|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Shalnark|Contrôleur de manipulation, objet identifiable
Antennes Black Voice|Shalnark|outil|epic|stun|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Shalnark|Accessoire des cibles, effets de jeu limités
Aiguilles de Machi|Machi Komacine|arme|uncommon|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Machi_Komacine|Support physique des fils ; précisions à confirmer
Fils Nen de Machi|Machi Komacine|nen|epic|shield|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Machi_Komacine|Fils produits par aura, pas objet stockable en dehors de la capacité
Éventail de Kalluto|Kalluto Zoldyck|arme|rare|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Kalluto_Zoldyck|Éventail de manipulation de papier
Confettis de Kalluto|Kalluto Zoldyck|nen|rare|atk|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Kalluto_Zoldyck|Fragments papier guidés par Nen
Toupies de Gido|Gido|arme|uncommon|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Toupies métalliques lancées au combat
Fouets électriques de Riehlvelt|Riehlvelt|arme|rare|stun|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Deux fouets électriques reliés à son fauteuil
Lance de Goz|Goz|arme|common|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Arme de l'examen Hunter
Lames de Ben|Ben|arme|rare|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Couteaux réputés, nom Ben's Knives
Couteau du candidat Hunter|Candidats à l'examen|arme|common|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Melee_Weapons|Catégorie générique visible dans l'examen
Pistolet de Pakunoda|Pakunoda|arme|rare|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Pakunoda|Utilise Memory Bomb, l'arme physique est distincte des balles de Nen
Balles Memory Bomb|Pakunoda|nen|epic|draw|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Pakunoda|Transmission mémorielle et non balles de dégât, adapté comme pioche
Arc arc-en-ciel de Pokkle|Pokkle|nen|rare|atk|NEN_PERSONNEL|https://hunterxhunter.fandom.com/wiki/Pokkle|Flèches d'aura issues d'une capacité
Ballon de dodgeball de Razor|Razor|arme|uncommon|atk|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Razor|Objet de jeu utilisé comme projectile de Nen
Ciseaux de Binolt|Binolt|arme|uncommon|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Binolt|Ciseaux de meurtrier / coiffeur
Flûte de Melody|Melody|outil|rare|heal|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Melody|Instrument musical ; soutien par mélodie plutôt que véritable arme
Sabre du garde royal|Gardes de Kakin|arme|common|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Succession_Contest_arc|Équipement courant de garde, modèle exact non confirmé
Pistolet des gardes Kakin|Gardes de Kakin|arme|common|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Succession_Contest_arc|Armes à feu de sécurité lors de la Guerre de succession
Fusil des mafieux du Black Whale|Familles mafieuses|arme|uncommon|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Succession_Contest_arc|Armes à feu, modèle précis non nommé
Fusil de Yorknew|Mafia de Yorknew|arme|common|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Yorknew_City_arc|Armes courantes des gardes mafieux
Grenade de garde|Militaires Kakin|consommable|uncommon|atk|CANON_CATEGORIE|https://hunterxhunter.fandom.com/wiki/Succession_Contest_arc|Grenades militaires génériques, présence exacte à vérifier
Collier du Paladin|Greed Island|outil|epic|shield|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Paladin%27s_Necklace|Protège contre certains sorts de Greed Island, bonus bouclier éditorial
Épée de Vérité|Greed Island|arme|legendary|pierce|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Sword_of_Truth|Épée de Greed Island, effet original contextuel
Souffle de l'Ange|Greed Island|consommable|legendary|heal|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists|Carte de guérison majeure ; rareté gameplay distincte rang SS du GI
Livre du joueur Greed Island|Greed Island|outil|rare|draw|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island|Classeur de cartes, effet de pioche éditorial
Sort Accompany|Greed Island|consommable|rare|draw|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists|Carte de déplacement ; effet de jeu simplifié
Sort Return|Greed Island|consommable|uncommon|evade|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists|Carte de retour / déplacement
Sort Trace|Greed Island|consommable|uncommon|scout|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists|Carte de suivi de joueur
Pierre Blue Planet|Greed Island|outil|epic|draw|CANON_NOMME|https://hunterxhunter.fandom.com/wiki/Greed_Island_Card_Lists|Pierre de collection, pas arme ; effet de pioche de gameplay
Fusil de la Brigade de surveillance|Équipe de sécurité Kakin|arme|common|atk|EDITORIAL|https://hunterxhunter.fandom.com/wiki/Succession_Contest_arc|Variante générique de gameplay non confirmée comme objet nommé
Grande protection d'aura|Utilisateurs Nen|nen|rare|shield|EDITORIAL|https://hunterxhunter.fandom.com/wiki/Nen|Nom inventé de carte inspirée du Ten/Ken, pas équipement canonique
Rose miniature de Netero|Isaac Netero|consommable|legendary|atk|HORS_EQUIPEMENT|https://hunterxhunter.fandom.com/wiki/Poor_Man%27s_Rose|Arme narrative exceptionnelle non distribuée en draft standard
'''
RMAP={'common':1,'uncommon':2,'rare':3,'epic':4,'legendary':5}
EFFECTS={'atk','hp','vit','shield','draw','heal','counter','pierce','stun','scout','revive','weaken','regen','evade'}
def slugify(s):
 s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
 return re.sub(r'-+','-',re.sub(r'[^a-z0-9]+','-',s)).strip('-')

def make_rows(text,uni):
 out=[]
 for line in text.splitlines():
  line=line.strip()
  if not line: continue
  parts=line.split('|')
  assert len(parts)==8,(line,len(parts))
  name,owner,cat,rar,effect,canon,source,notes=parts
  n=RMAP[rar]
  # gameplay proposals only, NOT canon stats
  atkb=round((n*4 + (3 if effect in ['atk','pierce'] else 0))/2)*2 if effect in ('atk','pierce') else 0
  shield=n*8 if effect in ('shield','hp') else 0
  draw=1 if effect in ('draw','scout') else 0
  heal=n*5 if effect=='heal' else 0
  tempo=0 if n<=2 or effect in ('draw','scout','evade') else 1
  out.append(dict(id=f'{uni.lower()}-eq-{slugify(name)}',univers=uni,nom=name,porteur_original=owner,classe=cat,rarete=rar,rang_rarete=n,effet_principal=effect,attaque_bonus_pct=atkb,armure_bouclier_pct=shield,soin_pct=heal,pioche_supplementaire=draw,cout_action_equipement=tempo,utilisations_par_combat=1,statut_canon=canon,compatible_draft='non' if canon in ('HORS_EQUIPEMENT','NEN_PERSONNEL') or cat=='intrinseque' else 'oui',source=source,notes=notes,statut_equilibrage='PROPOSITION_A_TESTER'))
 return out
all_rows=[]
for label,text in [('DB',DB),('HXH',HXH)]:
 rows=make_rows(text,label)
 ids=[r['id'] for r in rows]
 assert len(ids)==len(set(ids)),[x for x,n in collections.Counter(ids).items() if n>1]
 assert all(r['effet_principal'] in EFFECTS for r in rows)
 all_rows+=rows
 file=ROOT/'catalogues'/f'EQUIPEMENTS_{label}.csv'
 with file.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),delimiter=';');w.writeheader();w.writerows(rows)
 print(label,len(rows),'dont draft',sum(r['compatible_draft']=='oui' for r in rows))
(ROOT/'catalogues'/'EQUIPEMENTS_UNIFIES.json').write_text(json.dumps(all_rows,ensure_ascii=False,indent=2),encoding='utf-8')
