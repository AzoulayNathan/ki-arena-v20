from pathlib import Path
import zipfile,shutil,hashlib
r=Path(__file__).resolve().parents[1]
base=Path('/mnt/data')
links={
 'KI_ARENA_ROGUEONE_V7_JOUER.html':'KI_ARENA_ROGUEONE_V7_JOUER.html',
 'KI_ARENA_V7_APERCU_DESKTOP.png':'v7_exploration_1360.png',
 'KI_ARENA_V7_APERCU_MOBILE.png':'v7_exploration_390.png',
 'KI_ARENA_V7_COMBAT.png':'v7_combat_1360.png',
 'KI_ARENA_V7_BOSS.png':'v7_boss_1360.png',
 'KI_ARENA_V7_EVENT_MOBILE.png':'v7_event_390.png',
 'KI_ARENA_V7_AVANT_COMBAT.png':'v7_before_combat_1360.png',
 'KI_ARENA_V7_BILAN.png':'v7_bilan_1360.png',
 'KI_ARENA_V7_AUDIT.md':'QA_V7.md',
 'KI_ARENA_V7_DESIGN_SYSTEM.md':'DESIGN_SYSTEM_V7.md'
}
for dst,src in links.items():
 shutil.copyfile(r/src,base/dst)
 assert (base/dst).stat().st_size>0
output=base/'KI_ARENA_ROGUEONE_V7_ULTIME.zip'
with zipfile.ZipFile(output,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in r.rglob('*'):
  if not f.is_file():continue
  rel=f.relative_to(r)
  if any(x in ('__pycache__','.git','node_modules') for x in rel.parts):continue
  if f.name in ('KI_ARENA_ROGUELIKE_V6_JOUER.html','v6_world_390.png','v6_world_1360.png'):continue
  if f.name.startswith('v7_') and f.suffix=='.png':
   z.write(f,'KI_ARENA_ROGUEONE_V7'/'PREVISUALISATIONS'/f.name) if False else z.write(f,'KI_ARENA_ROGUEONE_V7/PREVISUALISATIONS/'+f.name)
  else:z.write(f,'KI_ARENA_ROGUEONE_V7/'+rel.as_posix())
print('ZIP',output,round(output.stat().st_size/1048576,2),'MiB',len(zipfile.ZipFile(output).namelist()),'entries')
for f in [output,*[base/x for x in links]]:
 print(f.name, round(f.stat().st_size/1024), 'KiB')
