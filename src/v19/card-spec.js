/** Cosmetic only. Skins black/white/gold stay for packs; visual edition is normal|special. */
import {isSpecialEdition} from '../arena/rules.js';
export const SKIN_ODDS={black:45,white:45,gold:10};
export const RARITIES=['common','uncommon','rare','epic','legendary'];
export const RARITY_NAMES={common:'COMMUNE',uncommon:'PEU COMMUNE',rare:'RARE',epic:'ÉPIQUE',legendary:'LÉGENDAIRE'};
export const RARITY_COLORS={common:'#9aa8ad',uncommon:'#33df88',rare:'#29aaff',epic:'#bf7cff',legendary:'#ffd15a'};
/** Effets VISUELS cumulés par rareté (1→5). Spécial = +foil. */
export const RARITY_FX=[
  {id:'seal',label:'Sceaux d\'encre'},
  {id:'sparks',label:'Étincelles de ki'},
  {id:'split',label:'Tranchant bipolaire'},
  {id:'aurora',label:'Aurores runiques'},
  {id:'embers',label:'Braises couronne'},
];
export const SPECIAL_FX={id:'prism',label:'Cisaillement prisme'};
export const VISUAL_FX=[...RARITY_FX,SPECIAL_FX];
export const CARD_LAYOUTS={
 common:{artBottom:980,nameY:1000,nameH:120,statsY:1160,statsH:90,detail:true,level:1},
 uncommon:{artBottom:1020,nameY:1035,nameH:118,statsY:1180,statsH:90,detail:true,level:2},
 rare:{artBottom:1060,nameY:1070,nameH:110,statsY:1200,statsH:85,detail:false,level:3},
 epic:{artBottom:1100,nameY:1110,nameH:105,statsY:1220,statsH:80,detail:false,level:4},
 legendary:{artBottom:1140,nameY:1145,nameH:100,statsY:1240,statsH:75,detail:false,level:5},
};
export function cosmeticHash(text){let h=2166136261;for(const c of String(text))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);return (h^(h>>>16))>>>0;}
/** Packs / collection still use black|white|gold. */
export function skinFor(seed,id){const x=cosmeticHash('KI19|'+(seed||'ARENA')+'|'+id)%100;return x<45?'black':x<90?'white':'gold';}
/** Visual foil edition for canvas templates. */
export function editionFor(seed,id){return isSpecialEdition(seed||'ARENA',id)?'special':'normal';}
export function rarityLevel(rarity){return (CARD_LAYOUTS[rarity]||CARD_LAYOUTS.common).level;}
export function visualFxList(rarity,edition='normal'){
  const base=RARITY_FX.slice(0,rarityLevel(rarity));
  return normalizeEdition(edition)==='special'?[...base,SPECIAL_FX]:base;
}
export function visualFxCount(rarity,edition='normal'){return visualFxList(rarity,edition).length;}
export function normalizeEdition(value){
  const v=String(value||'').toLowerCase();
  if(v==='special'||v==='gold')return 'special';
  return 'normal';
}
export function cropRect(iw,ih,w,h,crop={}){const cover=Math.max(w/iw,h/ih),scale=cover*Math.max(1,Math.min(4,Number(crop.zoom)||1)),sw=w/scale,sh=h/scale;return {sx:Math.max(0,(iw-sw)*Math.max(0,Math.min(1,crop.x??.5))),sy:Math.max(0,(ih-sh)*Math.max(0,Math.min(1,crop.y??.35))),sw,sh};}
export function effectGlyph(e){return /heal|life|regen/.test(e?.type||'')?'+':/shield|intercept|barrier/.test(e?.type||'')?'⬡':/dodge|speed/.test(e?.type||'')?'↗':/counter/.test(e?.type||'')?'↶':/stun/.test(e?.type||'')?'!':/revive|last_stand/.test(e?.type||'')?'✦':'✧';}
