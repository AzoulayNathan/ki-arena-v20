export const ACTS=[
 {id:'act-01-vallees',name:'Les vallées éveillées',line:'Au-delà des crêtes, une première épreuve rassemble ton équipe.',color:'#28775d',art:'arena-valley',sky:'Matin clair',style:'valley'},
 {id:'act-02-desert',name:'Le canyon des épreuves',line:'Le vent efface les traces. Chaque détour a désormais son prix.',color:'#b46032',art:'arena-desert',sky:'Soleil cuivré',style:'canyon'},
 {id:'act-03-archipel',name:'Les îles de l’horizon',line:'Les routes se séparent au-dessus des eaux. Choisis ceux qui avanceront avec toi.',color:'#187d93',art:'arena-alien',sky:'Brise marine',style:'islands'},
 {id:'act-04-monde-alien',name:'Les rives des deux lunes',line:'Sous un ciel inconnu, les alliances sont ta seule boussole.',color:'#7c5ca5',art:'arena-alien',sky:'Crépuscule jade',style:'lakes'},
 {id:'act-05-citadelle-celeste',name:'Les terrasses célestes',line:'Au-dessus des nuages, le silence précède les plus grands affrontements.',color:'#9b7131',art:'arena-sky',sky:'Lumière d’altitude',style:'clouds'},
 {id:'act-06-ruines-orages',name:'Les portes de l’orage',line:'La tempête éprouve les survivants. Le voyage ne s’arrête pas à ces ruines.',color:'#8d6b9e',art:'arena-ruins',sky:'Orage lointain',style:'ruins'}
];
export function actTheme(act=0){const x=ACTS[((act%6)+6)%6];return {...x,cycle:Math.floor(act/6),background:'assets/v14/maps/'+x.id+'.webp'};}
export function mapPoint(n,from,to,act=0){const t=actTheme(act),variation={valley:12,canyon:23,islands:29,lakes:18,clouds:8,ruins:25}[t.style],phase=act*.8+n.row*.85;return {x:[68,180,292][n.lane]+Math.sin(phase+n.lane*.9)*variation,y:(to-n.row)*64+40};}
export const NODE_ICONS={normal:'combat',elite:'elite',boss:'boss',rest:'rest',shop:'shop',treasure:'treasure',event:'event-mystery'};
