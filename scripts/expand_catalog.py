from pathlib import Path
import re
f=Path(__file__).resolve().parent.parent/'src/catalog.js'
s=f.read_text()
more={
'common':'''Chichi|DBZ|Vie de famille|martial|Détermination de Chichi|29
Marron|DBZ|Fille de Krilin|support|Soutien familial|20
Erasa|DBZ|Orange Star|support|Encouragement d'Erasa|20
Sharpner|DBZ|Orange Star|martial|Défi sportif|24
Dr Brief|DBZ|Capsule Corporation|tech|Génie des capsules|20
Panchy|DBZ|Capsule Corporation|support|Hospitalité|20
Roi Furry|DB|Roi de la Terre|support|Rassemblement royal|21
Colonel Violet|DB|Ruban Rouge|assassin|Opération clandestine|26
Colonel Yellow|DB|Ruban Rouge|sniper|Menace aérienne|26
Sergent Metallic|DB|Muscle Tower|android|Fusée mécanique|34
Pamput|DB|22e Tournoi|martial|Champion arrogant|29
Loup-garou|DB|22e Tournoi|martial|Griffes lunaires|27
Piano|DB|Clan du Roi Démon|demon|Conseiller démoniaque|26
Idasa|DBZ|Tournoi junior|martial|Frappe insolente|23
Ikose|DBZ|Tournoi junior|martial|Frappe junior|23
Bee|DBZ|Compagnon de Boo|support|Courage de Bee|20
Bibidi|DBZ|Sorcier originel|tech|Magie obscure|27
Jewel|DBZ|25e Tournoi|martial|Frappe vaniteuse|30
Killa|DBZ|25e Tournoi|martial|Attaque de Killa|31
Nink|DBS|Univers 4|guardian|Prise d'étau|32
Napapa|DBS|Univers 10|guardian|Charge de Napapa|33
Jirasen|DBS|Univers 10|martial|Tactique prudente|26
Rylibeu|DBS|Univers 10|speed|Envolée fulgurante|28
Shantza|DBS|Univers 4|trickster|Illusions de Shantza|30
Dercori|DBS|Univers 4|trickster|Talismans illusoires|28
Rozie|DBS|Univers 2|sniper|Poings de lumière|34
Kakunsa|DBS|Univers 2|speed|Griffes flamboyantes|36
Comfrey|DBS|Univers 9|berserker|Corps à corps sauvage|31
Catopesra|DBS|Univers 3|tech|Changement de mode|35
Ganos|DBS|Univers 4|speed|Plumage foudroyant|34
Zuno|DBS|Sage intergalactique|support|Réponse absolue|22
Zarbuto|DBS|Univers 2|martial|Amour intrépide|30
Zirloin|DBS|Univers 2|martial|Détermination cosmique|30''',
'uncommon':'''Goku|DB|Enfant — 21e Tenkaichi|saiyan|Kamehameha débutant|40
Krilin|DB|21e Tenkaichi|martial|Discipline de Roshi|37
Yamcha|DB|23e Tenkaichi|martial|Roga Fufu Ken|44
Tortue Géniale|DB|Jackie Chun|ki|L'école du champion|46
Chichi|DB|23e Tenkaichi|martial|Artiste martiale|41
Mister Popo|DB|Gardien du palais|guardian|Calme de Popo|47
Karin|DB|Maître de la tour|support|Haricot magique|41
Tao Pai Pai|DB|Cyborg|android|Arsenal caché|47
Puipui|DBZ|Serviteur de Babidi|martial|Gravité extrême|44
Yakon|DBZ|Mangeur de lumière|demon|Absorption de lumière|44
Babidi|DBZ|Sorcier|trickster|Contrôle mental|42
Kaio du Nord|DBZ|Mentor Saiyan|support|Entraînement de Kaio|43
Roi Vegeta|DBZ|Roi des Saiyans|saiyan|Ordre du roi|49
Goten|DBZ|Enfant|saiyan|Courage juvénile|44
Trunks|DBZ|Enfant|saiyan|Fierté du fils|45
Vieux Kaioshin|DBZ|Ancien dieu|healer|Éveil du potentiel|44
Grand Kaio|DBZ|Maître des Kaios|support|Enseignement céleste|45
Apule|DBZ|Soldat de Freezer|sniper|Canon de base|39
Lavender|DBS|Trio du danger|poison|Brume toxique|52
Basil|DBS|Trio du danger|martial|Kick destructeur|52
Obni|DBS|Univers 10|martial|Dédoublement spirituel|48
Cabba|DBS|Super Saiyan|saiyan|Éveil de Sadala|60
Caulifla|DBS|Super Saiyan|saiyan|Énergie de combat|60
Kale|DBS|Saiyan — base|saiyan|Tension contenue|52
Mai|DBS|Résistance du futur|sniper|Tir de résistance|40
Goku|DBS|Base — Tournoi du Pouvoir|saiyan|Instinct de combattant|60
Vegeta|DBS|Base — Tournoi du Pouvoir|saiyan|Fierté de Vegeta|60''',
'rare':'''Goku|DBZ|Kaioken ×20|saiyan|Kaioken maximal|73
Gohan|DBZ|Adolescent — Super Saiyan|saiyan|Puissance cachée|72
Goten|DBZ|Super Saiyan|saiyan|Super Saiyan précoce|66
Trunks|DBZ|Super Saiyan — enfant|saiyan|Énergie juvénile|67
Vegeta|DBZ|Saga Namek|saiyan|Zenkai de Namek|67
Zarbon|DBZ|Forme monstrueuse|berserker|Mutation du guerrier|64
Dodoria|DBZ|Garde de Freezer|berserker|Boule de feu de Dodoria|61
Freezer|DBZ|Première forme|demon|Domination galactique|66
Freezer|DBZ|Deuxième forme|demon|Puissance colossale|71
Freezer|DBZ|Troisième forme|demon|Vitesse terrifiante|74
Cell|DBZ|Forme imparfaite|regen|Absorption de Cell|72
Cell|DBZ|Forme semi-parfaite|regen|Évolution imparfaite|76
Piccolo|DBZ|Saga Namek|regen|Fusion namek|68
Buu|DBZ|Boo maléfique|demon|Chaos noir|74
Trunks|DBZ|Guerrier du futur — base|saiyan|Épée du futur|71
Kale|DBS|Super Saiyan|saiyan|Éveil de Kale|77
Cabba|DBS|Super Saiyan 2|saiyan|Fierté de Sadala|79
Bergamo|DBS|Trio du danger|guardian|Grandissement de Bergamo|74
Goku Black|DBS|Forme de base|demon|Vol de puissance|75
Gohan|DBS|Potentiel libéré|saiyan|Guerrier revenu|80
Jiren|DBS|Puissance contenue|powerhouse|Pression silencieuse|83''',
'epic':'''Vegito|DBZ|Super Saiyan|fusion|Puissance fusionnée|92
Gotenks|DBZ|Super Saiyan 3|fusion|Attaque fantôme|88
Super Buu|DBZ|Forme maléfique|regen|Régénération de Boo|85
Buu|DBZ|Absorption Gotenks|regen|Absorption du prodige|89
Buu|DBZ|Absorption Gohan|regen|Absorption ultime|93
Kid Buu|DBZ|Forme originelle|demon|Explosion chaotique|91
Vegeta|DBZ|Super Saiyan 2 — Buu|saiyan|Fureur du Saiyan|86
Gohan|DBZ|Potentiel ultime — Buu|saiyan|Éveil ultime|92
Freezer|DBS|Golden Freezer|demon|Éclat de la tyrannie|92
Goku|DBS|Super Saiyan God|god|Pouvoir du rituel|91
Trunks|DBS|Super Saiyan Rage|saiyan|Colère de l'espoir|91
Zamasu|DBS|Fusionné|god|Justice immortelle|93
C-17|DBS|Tournoi du Pouvoir|android|Barrière parfaite|90
Hit|DBS|Saut temporel amélioré|time|Saut temporel perfectionné|90
Kale|DBS|Berserk|berserker|Fureur sans limites|91''',
'legendary':'''Vegito|DBS|Super Saiyan Blue|fusion|Fusion divine|99
Zamasu|DBS|Fusionné corrompu|god|Divinité en ruines|99
Goku|DBS|Ultra Instinct — Sign|ultra|Instinct qui s'éveille|96
Zen'ô|DBS|Roi des univers|god|Effacement cosmique|99'''
}
if '/* EXTRA 100 EDITIONS' not in s:
 for rar,text in more.items():
  rows=text.splitlines()
  target={'common':33,'uncommon':27,'rare':21,'epic':15,'legendary':4}[rar]
  assert len(rows)==target,(rar,len(rows),target)
  # match first raw block rarity, inject before multiline template closing
  pattern=rf'(  {rar}: `\n)(.*?)(\n`(?:,|\n))'
  match=re.search(pattern,s,re.S)
  if not match:raise ValueError(rar)
  old=match.group(2)
  s=s[:match.start(2)]+old+'\n'+text+s[match.end(2):]
 s=s.replace('const BASE_EFFECTS = {','/* EXTRA 100 EDITIONS — inventaire de travail, validation source à approfondir. */\nconst BASE_EFFECTS = {')
 s=s.replace('if(CARDS.length!==100) throw new Error(`Le catalogue pilote doit avoir 100 cartes : ${CARDS.length}`);','if(CARDS.length!==200) throw new Error(`Le catalogue pilote doit avoir 200 cartes : ${CARDS.length}`);')
 s=s.replace('if(got!==target) throw new Error', 'if(got!==target*2) throw new Error')
 f.write_text(s)
 print('Expanded', {k:len(v.splitlines()) for k,v in more.items()})
else:print('already expanded')
