import {createRunV19,generateMap,markRareNodes} from '../v20/engine.js';
import {freshId,rollFinish} from './random.js';
import {collectionState} from '../v20/collection-rewards.js';
export function createRun22(worlds,opts={}){const id=freshId(),r=createRunV19(worlds,id,'raw',opts);r.contentVersion='22.0.0';r.combatVersion='22.0.0';r.randomMode='live';r.randomDraws=0;r.relics=[];r.rewardClaimed=false;r.collectionIds=opts.useCollection?collectionState().cards.map(x=>x.id):[];r.nodes=generateMap(id,0,r);markRareNodes(r);return r;}
