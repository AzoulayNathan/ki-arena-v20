export function seedState(seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h;}
export function random(run){run.rng=(run.rng+0x6D2B79F5)>>>0;let t=run.rng;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
export function int(run,a,b){if(a>b)throw Error('Intervalle impossible');return a+Math.floor(random(run)*(b-a+1));}
export function pick(run,list){if(!list.length)throw Error('Pool vide');return list[int(run,0,list.length-1)];}
export function shuffle(run,list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=int(run,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
