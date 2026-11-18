/** Remap existing portraits onto V12 hero IDs. Never uses stylized. */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {SURVIVAL_DATA} from '../src/survival/data.js';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ASSETS=path.join(ROOT,'assets');
const FOLDERS={
 DB:path.join(ASSETS,'portraits-db'),
 HXH:path.join(ASSETS,'portraits-hxh'),
 NARUTO:path.join(ASSETS,'portraits-naruto'),
 ONEPIECE:path.join(ASSETS,'portraits-onepiece'),
 JOJO:path.join(ASSETS,'portraits-jojo'),
};
const EXTS=new Set(['.webp','.png','.jpg','.jpeg']);
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');

function indexFolder(dir){
 const out=new Map();
 if(!fs.existsSync(dir))return out;
 for(const name of fs.readdirSync(dir)){
  const ext=path.extname(name).toLowerCase();
  if(!EXTS.has(ext))continue;
  out.set(norm(path.basename(name,ext)),path.join(dir,name));
 }
 return out;
}
function bestMatch(hero,idx){
 const keys=[norm(hero.id),norm(hero.person),norm(hero.name),norm(`${hero.person}-${hero.name}`)];
 for(const k of keys)if(idx.has(k))return idx.get(k);
 const person=norm(hero.person);
 if(person.length>=4){
  const hits=[...idx.entries()].filter(([k])=>k.includes(person)).map(([,p])=>p);
  if(hits.length===1)return hits[0];
 }
 return null;
}

const report={copied:0,already:0,missing:[],byUniverse:{}};
for(const [u,folder] of Object.entries(FOLDERS)){
 fs.mkdirSync(folder,{recursive:true});
 const local=indexFolder(folder);
 const pooled=new Map(local);
 for(const [ou,of] of Object.entries(FOLDERS)){
  if(ou===u)continue;
  for(const [k,p] of indexFolder(of))if(!pooled.has(k))pooled.set(k,p);
 }
 const heroes=SURVIVAL_DATA[u]?.heroes||[];
 let matched=0,miss=[];
 for(const h of heroes){
  const existing=EXTS.values().find?null:null;
  const has=fs.existsSync(path.join(folder,h.id+'.webp'))||['.png','.jpg','.jpeg'].some(e=>fs.existsSync(path.join(folder,h.id+e)));
  if(has){report.already++;matched++;continue;}
  const src=bestMatch(h,pooled);
  if(!src){miss.push(h.id);continue;}
  const dest=path.join(folder,h.id+path.extname(src).toLowerCase());
  fs.copyFileSync(src,dest);
  report.copied++;matched++;
 }
 report.byUniverse[u]={heroes:heroes.length,matched,missing:miss.length};
 report.missing.push(...miss.map(id=>`${u}:${id}`));
}
const out=path.join(ROOT,'qa','v23','portrait-remap-v12.json');
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log(report.byUniverse);
console.log('copied',report.copied,'already',report.already,'missing',report.missing.length);
console.log('wrote',out);
