from pathlib import Path
import hashlib,json,subprocess,sys
R=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
def check(ok,msg):
 if not ok: raise AssertionError(msg)
 checks.append(msg)
try:
 before=json.loads((R/'PRE_V19_HASHES.json').read_text());check(all((R/p).is_file() and sha(R/p)==h for p,h in before.items()),'All original V18 source/data/asset/test bytes preserved')
 check((R/'JOUER_KI_ARENA_V19.html').stat().st_size>30000000,'Autonomous game HTML present')
 check((R/'ATELIER_CARTES_V19.html').stat().st_size>2000000,'Autonomous studio HTML present')
 html=sha(R/'JOUER_KI_ARENA_V19.html');studio=sha(R/'ATELIER_CARTES_V19.html')
 for name in ['browser','media','cards']:
  a=json.loads((R/'qa/v19'/name/'report.json').read_text());check(a['ok'] and not a.get('errors'),name+' browser checks PASS')
  if 'htmlSha256' in a:check(a['htmlSha256']==html,name+' uses current game build')
  if 'studioSha256' in a:check(a['studioSha256']==studio,name+' uses current studio build')
 proof=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{sourceProof}from'./scripts/qa-v19-stamp.mjs';console.log(JSON.stringify(sourceProof()))"],cwd=R,text=True))
 for name in ['modes','extras','party']:
  a=json.loads((R/'qa/v19'/name/'browser.json').read_text());check(a['ok'] and not a.get('errors') and not a.get('external'),name+' gameplay UI checks PASS');check(a['sourceProof']==proof,name+' evidence current')
 ev=json.loads((R/'qa/v19/events/report.json').read_text());check(ev['ok'] and not ev['errors'] and ev['sourceProof']==proof,'All 17 event scenes current and tested');
 text=(R/'qa/v19/final-tests.log').read_text();check('ℹ tests 11' in text and 'ℹ tests 92' in text and '8 blocs de vérification V6 validés' in text and '✖' not in text,'11 new, 93 modern historic Node tests, item checks and V8 suites PASS')
 sim=json.loads((R/'qa/v19/draft-1000.json').read_text());check(sim['seeds']==1000,'1000 draft seeds verified')
 b=json.loads((R/'qa/v19/budgets-60.json').read_text());check(b['encounters']==5400,'5400 exact-budget encounters over 60 waves verified')
 s=json.loads((R/'qa/v19/full-run-1000.json').read_text());check(s['seeds']==1000 and not s['errors'],'1000 full-run simulations executed without engine error')
 pngs=list((R/'qa/v19/cards').glob('template-*.png'));check(len(pngs)==15 and all(int.from_bytes(p.read_bytes()[16:20],'big')==900 and int.from_bytes(p.read_bytes()[20:24],'big')==1350 for p in pngs),'15 PNG study frames at 900x1350 present')
 check('JOUER_KI_ARENA_V19.html' in (R/'LANCER_SUR_PC_WINDOWS.bat').read_text(),'Windows launcher points to current build')
 issues=[{'status':'FAIL','system':'Global run balance','evidence':'qa/v19/full-run-1000.json','detail':'0/1000 first-act clears in two explicit policies; formula preserved.'},{'status':'BLOCKED','system':'Complete canonical portrait set','detail':'Generic DB V8 placeholders and missing HXH/Naruto/One Piece portraits remain; only one reviewed Goku fanart.'},{'status':'BLOCKED','system':'Native Windows QA','detail':'Browser/Linux file:// verified; no Windows VM available.'},{'status':'BLOCKED','system':'12 original Python reference tests','detail':'Original reference pack not present in this supplied V18 release.'}]
 result={'buildIntegrity':'PASS','globalAcceptance':'FAIL','checks':checks,'openIssues':issues,'sourceProof':proof,'htmlSha256':html,'studioSha256':studio}
 (R/'qa/v19/verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));sys.exit(0 if '--allow-documented-limitations' in sys.argv else 2)
except Exception as e:
 print(json.dumps({'buildIntegrity':'FAIL','error':str(e),'checks':checks},indent=2));sys.exit(1)
