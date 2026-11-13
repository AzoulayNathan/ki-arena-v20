const KEY='kiarena:v20:prestigeDiff';
export const PRESTIGE_MAX=5;

export function getPrestigeDiff(){
  try{
    const n=Number(localStorage.getItem(KEY)||0);
    if(!Number.isFinite(n)||n<0)return 0;
    return Math.min(PRESTIGE_MAX,Math.floor(n));
  }catch{return 0;}
}

export function setPrestigeDiff(level){
  const n=Math.max(0,Math.min(PRESTIGE_MAX,Math.floor(Number(level)||0)));
  try{localStorage.setItem(KEY,String(n));}catch{}
  return n;
}

/** Multiplier applied to encounter budgets and reward coins. */
export function prestigeMul(level=getPrestigeDiff()){
  return 1+0.2*Math.max(0,Math.min(PRESTIGE_MAX,level|0));
}

export function scaleBudget(base,level){
  return Math.max(1,Math.round(base*prestigeMul(level)));
}
