from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src/app.js'
s=p.read_text()
s=s.replace('<div class="app-shell"><header class="masthead">','<div class="app-shell ${S.page===\'rogue\'?\'is-rogue-page\':\'\'}"><header class="masthead">',1)
s=s.replace('KI ARENA · ROGUELIKE V6','KI ARENA · ROGUELIKE V7',1)
# Map position (fix marker near the active path)
s=s.replace('style="top:8px;left:${run.lane===null?50:16.7+33.3*run.lane}%"','style="top:${run.step===0?18:78+(run.step-1)*112}px;left:${run.lane===null?50:16.7+33.3*run.lane}%"')
s=s.replace('<h2>LA ROUTE DES COMBATTANTS</h2><p>Chaque chemin est relié au suivant. Observe les risques et choisis ton itinéraire.</p>', '<h2>Choisis ton chemin</h2><p>Chaque choix écrit la suite de ton aventure.</p>')
s=s.replace('<div class="ki-world-landscape" role="img" aria-label="Paysage du biome ${esc(biome.name)}"><div class="ki-landscape-orb"></div><span>✦</span></div>', '<div class="ki-world-landscape" role="img" aria-label="Paysage du biome ${esc(biome.name)}"><span class="v7-sunflare" aria-hidden="true"></span><span class="v7-fog" aria-hidden="true"></span><span class="v7-landscape-caption">✦ LE VOYAGE CONTINUE</span></div>')
s=s.replace('<div class="ki-mapboard" style="--map-height:${sceneSize}px;min-height:${sceneSize}px">','<div class="ki-mapboard" aria-label="Carte et itinéraires" style="--map-height:${sceneSize}px;min-height:${sceneSize}px">')
s=s.replace('const past=node.id===completed.findLast?.(x=>x.id===node.id)?.id;', 'const past=completed.some(x=>(typeof x===\'string\'?x:x?.id)===node.id);')
s=s.replace('<span class="ki-mapnode-icon">${MAP_TYPES[node.type]?.icon||\'✦\'}</span><strong>${esc(title)}</strong>', '<span class="ki-mapnode-icon" aria-hidden="true">${MAP_TYPES[node.type]?.icon||\'✦\'}</span><strong>${esc(title)}</strong>')
s=s.replace('<div class="ki-map-legend"><span>● Parcours accessible</span><span>◌ Destinations futures</span><span>♛ Boss annoncé</span></div>', '<div class="ki-map-legend"><span><i class="legend-dot is-open"></i> Accessibles</span><span><i class="legend-dot is-later"></i> À venir</span><span><i class="legend-dot is-boss"></i> Boss</span></div>')
# Add real card portraits to enemy intel cards; no card template changes
s=s.replace('<div><b>${esc(c.name)}</b><small>${esc(c.form||\'\')} · ${esc(c.rarity)}</small></div>`).join(\'\')}', '<div class="v7-enemy-portrait">${art(c)}</div><b>${esc(c.name)}</b><small>${esc(c.form||\'\')} · ${esc(c.rarity)}</small></div>`).join(\'\')}')
# Top HUD replacement
start=s.index(' const top=`${heading(\'rogue\')}<div class="rogue-dashboard')
end=s.index(';\n const myTeam=',start)
new=''' const activeAlive=run.teamIds.filter((id,i)=>(run.hpRatios[i]??0)>0).length;
 const top=`<div class="v7-hud" role="region" aria-label="État de votre aventure">
   <div class="v7-hud-brand"><span class="v7-hud-crest">✦</span><div><small>ROGUE ONE · SURVIE INFINIE</small><strong>${esc(biome.name)}</strong><span>Zone ${run.zone} · Étape ${Math.min(run.step+1,run.nodes.length)}/${run.nodes.length}</span></div></div>
   <div class="v7-hud-right">
     <div class="v7-hud-stat zeni" aria-label="${run.gold} zénis"><i>◉</i><strong>${run.gold}</strong><small>Zénis</small></div>
     <div class="v7-hud-stat" aria-label="${collected} packs"><i>▣</i><strong>${collected}</strong><small>Packs</small></div>
     <div class="v7-hud-stat ball" aria-label="${run.dragonBalls||0} Dragon Balls sur 7"><i>✷</i><strong>${run.dragonBalls||0}<small>/7</small></strong><small>Dragon Balls</small></div>
     <div class="v7-hud-stat alive" aria-label="${activeAlive} personnages vivants"><i>✚</i><strong>${activeAlive}<small>/5</small></strong><small>Survivants</small></div>
   </div>
   <div class="v7-hud-path" aria-label="Progression de la zone">${run.nodes.map((row,i)=>`<div class="v7-hud-step ${i<run.step?'done':i===run.step?'now':''}" title="${i===run.nodes.length-1?'Boss':`Étape ${i+1}`}" aria-label="${i===run.nodes.length-1?'Boss':`Étape ${i+1}`}"><span>${i<run.step?'✓':i===run.nodes.length-1?'♛':i===run.step?'◆':''}</span></div>`).join('')}</div>
 </div>`'''
s=s[:start]+new+s[end:]
# team header without duplicated full team in sidebar
needle=' const inventory=`<details class="inventory-panel"'
s=s.replace(needle, ''' const previewTeam=`<div class="v7-team-preview"><div class="v7-panel-title"><span>⚔ TON ESCOUADE</span><small>${activeAlive} SURVIVANTS</small></div><div class="v7-mini-team">${run.teamIds.map((id,i)=>{const c=cId(id);return c?`<div class="v7-mini-fighter ${run.hpRatios[i]<=0?'is-ko':''}" title="${esc(c.name)} · ${Math.round(run.hpRatios[i]*100)}% PV"><div class="v7-mini-art">${art(c)}</div><div class="v7-mini-data"><b>${esc(c.name)}</b><div class="v7-hpbar"><span style="width:${Math.round(run.hpRatios[i]*100)}%"></span></div><small>${Math.round(run.hpRatios[i]*100)}% PV</small></div></div>`:''}).join('')}</div><div class="v7-item-preview"><span>✦ ${run.relics.length} RELIQUES</span><span>▣ ${run.inventory.reduce((n,i)=>n+i.quantity,0)} OBJETS</span></div></div>`;
 const inventory=`<details class="inventory-panel"''',1)
# add v7 event/art direction in context templates
s=s.replace('<section class="ki-event-choice"><span class="ki-overline">✦ UNE RENCONTRE INATTENDUE</span>', '<section class="ki-event-choice v7-scene-event"><span class="ki-overline">✦ UNE RENCONTRE INATTENDUE</span>')
s=s.replace('<section class="ki-reward"><div class="ki-reward-header">', '<section class="ki-reward v7-scene-reward"><div class="ki-reward-header">')
s=s.replace('<section class="ki-encounter"><div class="ki-overline">', '<section class="ki-encounter v7-scene-combat ${boss?\'v7-scene-boss\':\'\'}"><div class="ki-overline">')
s=s.replace('<div class="event-feature"><span>✚</span><div><h2>HALTE', '<div class="event-feature v7-scene-rest"><span>✚</span><div><h2>HALTE')
s=s.replace('<div class="event-feature"><span>✷</span><div><h2>CAPSULE', '<div class="event-feature v7-scene-treasure"><span>✷</span><div><h2>CAPSULE')
s=s.replace('<div class="event-feature"><span>⚑</span><div><h2>DÉFI', '<div class="event-feature v7-scene-quest"><span>⚑</span><div><h2>DÉFI')
# footer layout scoped roguelike
start=s.index(' return `${top}<div class="rogue-main">')
end=s.index('`;\n}',start)+2
new=''' return `<div class="rogue-v7">${top}<div class="rogue-main v7-game-layout"><div class="v7-game-screen">${interaction}</div><aside class="v7-sidebar" aria-label="Équipe et équipement">${previewTeam}<details class="v5-team-drawer"><summary>⚔ GÉRER L'ÉQUIPE <span>OUVRIR ↓</span></summary>${myTeam}</details>${inventory}<div class="v7-retreat">${act('↩ Abandonner la run','rogueStop','outline')}</div></aside></div></div>`;'''
s=s[:start]+new+s[end:]

p.write_text(s)
print('patched', len(s))
