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
js=(root/'vendor/pixi-8.22.0.min.js').read_text()+';\n'+'globalThis.KI_EMBEDDED_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n(()=>{const modules={'+',\n'.join(modules)+'};const cache={};function __require(id){if(cache[id])return cache[id];if(!modules[id])throw Error("Module absent "+id);return cache[id]=modules[id](__require);}globalThis.KI_OPEN_LEGACY=()=>{document.body.className="";__require("src/app.js");const back=document.createElement("button");back.textContent="← Revenir à KI ARENA V19";back.style.cssText="position:fixed;bottom:12px;right:16px;z-index:99999;background:#fff9e9;color:#182832;border:1px solid #849b83;border-radius:7px;padding:12px 16px;min-height:44px;cursor:pointer";back.onclick=()=>location.reload();document.body.append(back);};__require("src/v19/ui.js");})();'
# Runtime image references are short local Blob URLs, avoiding megabytes of repeated DOM attributes.
blob_runtime="""for(const [path,uri] of Object.entries(globalThis.KI_EMBEDDED_ASSETS)){try{const comma=uri.indexOf(','),mime=uri.slice(5,uri.indexOf(';')),raw=atob(uri.slice(comma+1)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);globalThis.KI_EMBEDDED_ASSETS[path]=URL.createObjectURL(new Blob([bytes],{type:mime}))+'#'+path;}catch{}};"""
js=js.replace('(()=>{const modules={',blob_runtime+'\n(()=>{const modules={',1)
css=''
for f in ['styles-local.css','v3.css','v5.css','v51.css','v52.css','rogue-v6.css','rogue-v7.css','rogue-v8.css','survival/survival.css','adventure.css','viewport.css','arena/arena.css','arena/impact.css','party/party.css','v14/game.css','v15/visual.css','v15/arcade.css','v16/ui.css','v17/ui.css','v18/polish.css','v19/polish.css','v192/polish.css','v193/game.css','v20/visual.css']:
 p=root/'src'/f;s=p.read_text(encoding='utf-8');s=re.sub(r'@import\s+url\([^)]*\)\s*;','',s,flags=re.S)
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
html=html.replace('<script type="module" src="./src/v19/ui.js"></script>','<script>'+js.replace('</script>','<\\/script>')+'</script>')
# Direct V8 image paths in JS templates are also embedded, keeping rendering offline.
html=html.replace('src="assets/theme/hero-goku.webp"','src="'+assets['assets/theme/hero-goku.webp']+'"')
out=root/'JOUER_KI_ARENA_V19.html';out.write_text(html,encoding='utf-8')
print(f'{out.name}: {out.stat().st_size/1048576:.2f} MiB, {len(assets)} assets, {len(files)} modules, sans réseau')
