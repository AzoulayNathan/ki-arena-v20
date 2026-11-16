"""Dependency-free ES-module bundler + complete data-URI asset pack for file://.
Build needs Python 3.8+ only; playing requires only a browser.
"""
from pathlib import Path
import re,base64,json,mimetypes
root=Path(__file__).resolve().parent
assets={}
for path in sorted((root/'assets').rglob('*')):
 if path.is_file() and path.suffix.lower() not in {'.tmp','.part','.pyc'}:
  mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
  assets[path.relative_to(root).as_posix()]='data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
(root/'src/v19/asset-index.js').write_text('export const LOCAL_ASSETS=new Set('+json.dumps(sorted(assets))+');\n',encoding='utf-8')
files=sorted((root/'src').rglob('*.js'))
modules=[]
for f in files:
 source=f.read_text(encoding='utf-8');name=f.relative_to(root).as_posix()
 def imp(m):
  fields=m[1];target=(f.parent/m[2]).resolve().relative_to(root).as_posix()
  names=re.sub(r'\s+as\s+',':',fields)
  return 'const {'+names+'}=__require('+json.dumps(target)+');'
 source=re.sub(r"import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?",imp,source)
 exports=re.findall(r'\bexport\s+(?:const|let|(?:async\s+)?function|class)\s+(\w+)',source)
 source=re.sub(r'\bexport\s+(?=(?:const|let|(?:async\s+)?function|class)\b)','',source)
 def export_list(m):
  for field in m[1].split(','):
   bits=re.split(r'\s+as\s+',field.strip())
   if bits[0]: exports.append(bits[0] if len(bits)==1 else bits[1]+':'+bits[0])
  return ''
 source=re.sub(r'\bexport\s*\{([^}]+)\}\s*;?',export_list,source)

 if re.search(r'^import\s',source,re.M):raise RuntimeError('Unsupported import '+name)
 modules.append(json.dumps(name)+':function(__require){\n'+source+'\nreturn {'+','.join(exports)+'};\n}')
asset_data=list(dict.fromkeys(assets.values()))
asset_ids={value:i for i,value in enumerate(asset_data)}
asset_paths={path:asset_ids[value] for path,value in assets.items()}
# Payloads are inert HTML data, not enormous JavaScript literals.
asset_blocks=''.join('<script type="application/octet-stream" id="ki-payload-'+str(i)+'" data-mime="'+uri[5:uri.index(';')]+'">'+uri.split(',',1)[1]+'</script>' for i,uri in enumerate(asset_data))
runtime="""(()=>{const paths=JSON.parse(document.getElementById('ki-asset-index').textContent),cache=Object.create(null),urls=Object.create(null);for(const path of Object.keys(paths))Object.defineProperty(urls,path,{enumerable:true,get(){const id=paths[path];if(cache[id])return cache[id]+'#'+path;const el=document.getElementById('ki-payload-'+id);if(!el)throw Error('Asset local absent : '+path);const raw=atob(el.textContent),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const url=URL.createObjectURL(new Blob([bytes],{type:el.dataset.mime}));cache[id]=url;el.remove();return url+'#'+path;}});globalThis.KI_EMBEDDED_ASSETS=urls;globalThis.KI_OFFLINE_READY=true;})();"""
js=(root/'vendor/pixi-8.22.0.min.js').read_text()+';\n'+runtime+'\n(()=>{const modules={'+',\n'.join(modules)+'};const cache={};function __require(id){if(cache[id])return cache[id];if(!modules[id])throw Error("Module absent "+id);return cache[id]=modules[id](__require);}globalThis.KI_OPEN_LEGACY=()=>{document.body.className="";__require("src/app.js");const back=document.createElement("button");back.textContent="← Revenir à KI ARENA V23";back.style.cssText="position:fixed;bottom:12px;right:16px;z-index:99999;background:#fff9e9;color:#182832;border:1px solid #849b83;border-radius:7px;padding:12px 16px;min-height:44px;cursor:pointer";back.onclick=()=>location.reload();document.body.append(back);};__require("src/v19/ui.js");document.getElementById("ki-boot")?.remove();})();'
css=''
for f in ['styles-local.css','v3.css','v5.css','v51.css','v52.css','rogue-v6.css','rogue-v7.css','rogue-v8.css','survival/survival.css','adventure.css','viewport.css','arena/arena.css','arena/impact.css','party/party.css','v14/game.css','v15/visual.css','v15/arcade.css','v16/ui.css','v17/ui.css','v18/polish.css','v19/polish.css','v192/polish.css','v193/game.css','v20/visual.css','v21/arcade.css','v22/refonte.css','v23/polish.css']:
 p=root/'src'/f;s=p.read_text(encoding='utf-8-sig').replace('\ufeff','');s=re.sub(r'@import\s+url\([^)]*\)\s*;','',s,flags=re.S)
 def uri(m):
  url=m[1].strip('"\'')
  if url.startswith(('data:','#')):return m[0]
  target=(p.parent/url).resolve().relative_to(root).as_posix()
  if target not in assets:raise RuntimeError('Missing CSS asset '+target)
  return 'url("'+assets[target]+'")'
 s=re.sub(r'url\(([^)]+)\)',uri,s);css+='\n'+s
html=(root/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
html=html.replace('<script src="./vendor/pixi-8.22.0.min.js"></script>','')
html=html.replace('./assets/icon-192.png',assets['assets/icon-192.png'])
html=html.replace('</head>','<style>'+css+'</style></head>')
shell='<aside id="ki-boot" role="status" style="position:fixed;inset:0;z-index:99999;display:grid;place-content:center;gap:16px;background:#f6f2e8;color:#142f3c;text-align:center;font:700 18px system-ui"><strong style="font-size:52px">KI ARENA</strong><span>Préparation de ton arène…</span><small>Premier chargement : quelques secondes.</small></aside>'
html=html.replace('<div id="app"></div>','<div id="app"></div>'+shell)
bootstrap='<script id="ki-asset-index" type="application/json">'+json.dumps(asset_paths,separators=(',',':'))+'</script>'+asset_blocks+'<script>setTimeout(()=>{try{'+js.replace('</script>','<\\/script>')+'}catch(error){const boot=document.getElementById("ki-boot");if(boot){boot.replaceChildren();const title=document.createElement("strong"),message=document.createElement("p");title.textContent="Le chargement a été interrompu.";message.textContent=error.message+" · Utilise LANCER_SUR_PC_WINDOWS.bat pour le serveur local.";boot.append(title,message);}console.error(error);}},0);</script>'
html=html.replace('<script type="module" src="./src/v19/ui.js"></script>',bootstrap)
# Direct V8 image paths in JS templates are also embedded, keeping rendering offline.
html=html.replace('src="assets/theme/hero-goku.webp"','src="'+assets['assets/theme/hero-goku.webp']+'"')
out=root/'JOUER_KI_ARENA_V23.html';out.write_text(html,encoding='utf-8')
print(f'{out.name}: {out.stat().st_size/1048576:.2f} MiB, {len(assets)} assets, {len(files)} modules, sans réseau')

# Record the exact source inputs so verification detects stale standalone builds.
import hashlib
tracked=[root/'index.html',root/'build_preview.py',root/'vendor/pixi-8.22.0.min.js',*files,*sorted((root/'src').rglob('*.css'))]
record={'version':'23.0.0','htmlSha256':hashlib.sha256(out.read_bytes()).hexdigest(),'assets':len(assets),'sources':{p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in tracked}}
(root/'qa/v23').mkdir(parents=True,exist_ok=True)
(root/'qa/v23/build-manifest.json').write_text(json.dumps(record,indent=2),encoding='utf-8')
