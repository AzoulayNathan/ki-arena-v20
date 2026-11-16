import {cosmeticHash} from '../v19/card-spec.js';
import {isSpecialEdition} from '../arena/rules.js';
export const plainFinish=(seed,id)=>cosmeticHash(seed+'|BW|'+id)%2?'white':'black';
export const dropFinish=(seed,id)=>isSpecialEdition(seed,id)?'gold':plainFinish(seed,id);
export const storedFinish=v=>v==='white'?'white':v==='gold'||v==='special'?'gold':'black';

