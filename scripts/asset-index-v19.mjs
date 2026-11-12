import {readdirSync,statSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));

function files(dir){
  return readdirSync(join(root,dir),{withFileTypes:true}).flatMap(entry=>{
    const rel=dir+'/'+entry.name;
    const abs=join(root,rel);
    let isDir=entry.isDirectory();
    if(!isDir){
      try{isDir=statSync(abs).isDirectory();}catch{isDir=false;}
    }
    if(isDir)return files(rel);
    return [rel];
  });
}

const list=files('assets').filter(p=>!/[.](tmp|part|pyc)$/.test(p)).sort();
writeFileSync(join(root,'src/v19/asset-index.js'),'export const LOCAL_ASSETS=new Set('+JSON.stringify(list)+');\n');
console.log('LOCAL_ASSETS',list.length);
