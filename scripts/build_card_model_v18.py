from pathlib import Path
import base64,json,subprocess
r=Path(__file__).resolve().parents[1]
def uri(name):
 p=r/name;return 'data:'+({'svg':'image/svg+xml','webp':'image/webp'}[p.suffix[1:]])+';base64,'+base64.b64encode(p.read_bytes()).decode()
h=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{registry}from'./src/arena/catalog.js';console.log(JSON.stringify(registry(['DB']).heroes.find(h=>h.name==='Goku')))"],cwd=r))
s=(r/'modeles/MODELE_CARTE_V18.source.html').read_text()
s=s.replace('@@PORTRAIT@@',uri('modeles/illustration-goku-etude.webp')).replace('@@SCENE@@',uri('assets/v16/db-recruit.webp')).replace('@@CREST@@',uri('assets/v15/crests/db.svg')) if (r/'assets/v15/crests/db.svg').exists() else s.replace('@@PORTRAIT@@',uri('modeles/illustration-goku-etude.webp')).replace('@@SCENE@@',uri('assets/v16/db-recruit.webp')).replace('@@CREST@@',uri('assets/v14/icons/combat.svg'))
(r/'MODELE_CARTE_V18.html').write_text(s)
print('MODELE_CARTE_V18.html',len(s),'carte source',h['id'])
