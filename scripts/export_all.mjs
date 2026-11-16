import {CARDS,RARITIES,EFFECT_LIBRARY} from '../src/catalog.js';
import {PACKS} from '../src/games.js';
import {writeFile,mkdir} from 'node:fs/promises';
const data={generatedAt:'2026-10-17',roster_status:'Catalogue de travail : toutes les entrées restent à vérifier avant publication',totalCards:CARDS.length,rarities:RARITIES,packs:PACKS,cards:CARDS,effectLibrary:EFFECT_LIBRARY};
await mkdir('data',{recursive:true});await writeFile('data/catalog.v2.json',JSON.stringify(data,null,2));
console.log(`Catalogue JSON : ${CARDS.length} cartes`);
