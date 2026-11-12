from pathlib import Path
import re
p=Path('src/catalog.js');s=p.read_text()
# Rows: named characters or identifiable appearances/forms, all provisional until expert review.
more={
'common':'''Akkuman|DB|Combattant du palais d'Enma|demon|Rayon diabolique|28
Draculaman|DB|Guerrier de Baba|speed|Crocs nocturnes|26
Suke-san|DB|Homme invisible de Baba|trickster|Invisibilité|26
Mummy|DB|Combattant momie|guardian|Prise de la momie|30
Grand-père Gohan|DB|Masqué chez Baba|martial|Masque du maître|34
Baba la voyante|DB|Tour des prédictions|support|Prédiction de Baba|24
Kinto-un|DB|Nuage magique|speed|Envol rapide|23
Shenron|DB|Dragon des sept boules|god|Vœu du dragon|31
Tsuru Sennin|DB|Maître de la grue|trickster|Ordre de l'école|27
Pilaf|DB|Pilote de robot|tech|Mécha du château|28
Shu|DB|Combinaison robot|tech|Gadget surprise|27
Mai|DB|Arsenal de Pilaf|sniper|Tir du château|28
Roi Piccolo|DB|Vieillard affaibli|demon|Souffle du démon|39
Tambourine|DB|Chasseur des combattants|assassin|Traque des champions|39
Cymbal|DB|Collecteur des Dragon Balls|demon|Griffes du démon|36
Tambourine|DB|Première apparition|speed|Vitesse démoniaque|37
Mutaito|DB|Maître du Mafuba|ki|Sceau du maître|42
Pan|DBZ|Bébé|support|Soutien familial|21
Bra|DBZ|Enfant de Vegeta|support|Fierté familiale|20
Kibito|DBZ|Observateur du tournoi|support|Protection divine|39
Dendé|DBZ|Gardien de la Terre|healer|Soin du gardien|40
Mister Satan|DBZ|Sauveur de la Terre|trickster|Discours du héros|28
Babidi|DBZ|Lecture du combat|tech|Mauvais sort|38
Goten|DBZ|Avant l'entraînement|martial|Esprit joueur|37
Trunks|DBZ|Enfant avant tournoi|martial|Frappe espiègle|36
Kaioshin de l'Est|DBZ|Observateur du tournoi|support|Surveillance divine|36
Vegeta|DBZ|Vie de famille|martial|Entraînement discret|40
Goku|DBZ|Vie quotidienne|martial|Fausse maladresse|42
Krilin|DBZ|Police et famille|martial|Réflexes du policier|38
C-18|DBZ|Vie de famille|android|Réflexes cyborg|40
Bulma|DBS|Laboratoire Capsule Corp|tech|Scanner de capsule|30
Beerus|DBS|En visite sur Terre|trickster|Appétit divin|40
Whis|DBS|Guide céleste|support|Conseil d'ange|39''',
'uncommon':'''Chichi|DB|Combat contre Goku|martial|Charge de Chichi|45
Goku|DB|Entraînement chez Karin|saiyan|Eau sacrée|50
Goku|DB|Combat contre Tao Pai Pai|martial|Revanche du héros|53
Goku|DB|23e Tenkaichi Budokai|saiyan|Poing météore|57
Krilin|DB|23e Tenkaichi Budokai|martial|Combat du tournoi|47
Tenshinhan|DB|23e Tenkaichi Budokai|ki|Kikoho du tournoi|52
Yamcha|DB|21e Tenkaichi Budokai|martial|Griffes du loup|42
Tortue Géniale|DB|Kamehameha pleine puissance|ki|Vague déferlante|54
Yajirobé|DB|Garde de Karin|assassin|Coup de sabre|42
Shen|DB|23e Tenkaichi Budokai|god|Énergie du gardien|53
Piccolo Junior|DB|23e Tenkaichi Budokai|demon|Coup du démon|55
Chaozu|DB|23e Tenkaichi Budokai|time|Télékinésie contrôlée|42
Gohan|DBZ|Enfant — saga Saiyan|saiyan|Explosion de colère|52
Raditz|DBZ|Invasion de la Terre|saiyan|Double Sunday|57
Nappa|DBZ|Arrivée sur Terre|berserker|Impact destructeur|55
Saibaiman|DBZ|Combat de l'invasion|poison|Explosion Saibai|40
Krilin|DBZ|Sur Namek|ki|Kienzan stratégique|55
Gohan|DBZ|Sur Namek|saiyan|Potentiel de Gohan|55
Vegeta|DBZ|Combat contre Zarbon|saiyan|Zenkai violent|58
Recoome|DBZ|Commando Ginyu|berserker|Recoome Kick|59
Guldo|DBZ|Arrêt du temps|time|Souffle retenu|50
Jeice|DBZ|Commando Ginyu|sniper|Crusher Ball|57
Burter|DBZ|Commando Ginyu|speed|Foudre bleue|60
Nail|DBZ|Gardien du Grand Chef|regen|Force namek|62
Goku|DBS|Entraînement de Whis|saiyan|Discipline du ki|60
Vegeta|DBS|Entraînement de Whis|saiyan|Mental du prince|61
Gohan|DBS|Retour à l'entraînement|saiyan|Potentiel restauré|57''',
'rare':'''Goku|DBZ|Super Saiyan — Namek|saiyan|Éveil de Namek|83
Vegeta|DBZ|Super Saiyan — Androids|saiyan|Big Bang Attack|81
Gohan|DBZ|Super Saiyan — Salle du temps|saiyan|Puissance retrouvée|75
Trunks|DBZ|Super Saiyan — arrivée du futur|saiyan|Lame de justice|77
Piccolo|DBZ|Fusion avec Kami|regen|Namek réunifié|77
C-16|DBZ|Face à Cell|guardian|Poing-fusée|74
C-17|DBZ|Contre Piccolo|android|Barrière d'énergie|76
C-18|DBZ|Contre Vegeta|android|Puissance inépuisable|77
Ginyu|DBZ|Technique du changement de corps|trickster|Body Change|68
Goku|DBZ|Retour sur Terre après Namek|saiyan|Transmission instantanée|78
Freezer|DBZ|Retour cyborg|android|Machine vengeresse|76
Cell|DBZ|Cell Games|regen|Régénération suprême|83
Gohan|DBZ|Super Saiyan 2 — Cell Games|saiyan|Colère libérée|89
Goku|DBZ|Super Saiyan 2 — tournoi|saiyan|Énergie accrue|84
Vegeta|DBZ|Super Saiyan — Cell Games|saiyan|Rafale Big Bang|80
Buu|DBZ|Innocent face à Babidi|regen|Danse magique|77
Goku|DBS|Super Saiyan Blue — Univers 6|god|Kamehameha Blue|85
Vegeta|DBS|Super Saiyan Blue — Univers 6|god|Final Flash Blue|85
Hit|DBS|Univers 6 — tournoi|time|Saut temporel|82
Trunks|DBS|Futur — résistance|saiyan|Lame de résistance|79
Goku Black|DBS|Faux Goku révélé|demon|Énergie maléfique|79''',
'epic':'''Goku|DBZ|Super Saiyan 3 — contre Buu|saiyan|Transformation épuisante|95
Vegeta|DBZ|Majin — duel Goku|saiyan|Explosion finale|93
Gohan|DBZ|Super Saiyan 2 — colère de Cell|saiyan|Kamehameha père et fils|95
Gogeta|DBZ|Fusion — autre monde|fusion|Fusion instantanée|92
Vegito|DBZ|Base — Buu|fusion|Assaut fusionné|91
Gotenks|DBZ|Super Saiyan — Buu|fusion|Ghost Kamikaze|84
Piccolo|DBZ|Fusion avec Nail et Kami|regen|Fusion parfaite|83
Freezer|DBZ|Forme finale — 100 %|demon|Pleine puissance du tyran|84
Goku|DBS|Super Saiyan Blue — contre Golden Freezer|god|Kamehameha ultime|94
Vegeta|DBS|Super Saiyan Blue — revanche contre Freezer|god|Final Flash divin|94
Goku Black|DBS|Super Saiyan Rosé — faux dieu|god|Faucille de Rosé|95
Zamasu|DBS|Immortel — futur|god|Justice éternelle|90
Vegeta|DBS|Super Saiyan Blue — contre Toppo|god|Volonté du prince|95
Goku|DBS|Super Saiyan God — contre Beerus|god|Puissance du rite|94
Toppo|DBS|Dieu de la destruction candidat|god|Hakai des justiciers|94''',
'legendary':'''Goku|DBS|Ultra Instinct maîtrisé — Tournoi du Pouvoir|ultra|Instinct véritable|99
Jiren|DBS|Pleine puissance — ultime combat|powerhouse|Force absolue|99
Beerus|DBS|Pouvoir de destruction libéré|god|Énergie Hakai|99
Vegito|DBS|Super Saiyan Blue — contre Zamasu|fusion|Final Kamehameha divin|99'''
}
for k,v in more.items():
 rows=v.strip().splitlines(); target={'common':33,'uncommon':27,'rare':21,'epic':15,'legendary':4}[k]
 assert len(rows)==target,(k,len(rows))
 pattern=rf'(  {k}: `\n)(.*?)(\n`(?:,|\n))'
 m=re.search(pattern,s,re.S);assert m,k
 existing={tuple(line.strip().split('|')[:3]) for line in m.group(2).strip().splitlines()}
 for r in rows:
  assert tuple(r.split('|')[:3]) not in existing,(k,r)
 s=s[:m.start(2)]+m.group(2)+'\n'+v+s[m.end(2):]
s=s.replace('CARDS.length!==200','CARDS.length!==300').replace('avoir 200 cartes','avoir 300 cartes')
s=s.replace('if(got!==target*2)', 'if(got!==target*3)')
p.write_text(s)
print('inserted 100 (33/27/21/15/4)')
