import {writeFile,mkdir} from 'node:fs/promises';
import {CARDS,RARITIES} from '../src/catalog.js';
import {PACKS} from '../src/games.js';
await mkdir(new URL('../data/',import.meta.url),{recursive:true});
await writeFile(new URL('../data/catalog.v1.json',import.meta.url),JSON.stringify({version:'0.1',type:'prototype',rarities:RARITIES,packs:PACKS,cards:CARDS},null,2)+'\n');
console.log('Exported',CARDS.length,'cards');
