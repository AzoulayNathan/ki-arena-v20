import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export function sourceProof(){
 const paths=[];function scan(dir){for(const f of readdirSync(root+dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())scan(p);else paths.push(p);}}
 for(const d of ['src','data','assets','vendor'])scan(d);paths.push('index.html','build_preview.py');paths.sort();const h=createHash('sha256');for(const p of paths){h.update(p+'\0');h.update(readFileSync(root+p));h.update('\0');}
 return {runtimeSha256:h.digest('hex'),htmlSha256:createHash('sha256').update(readFileSync(root+'JOUER_KI_ARENA_V14.html')).digest('hex'),files:paths.length};
}
