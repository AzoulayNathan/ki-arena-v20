from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json,csv,hashlib,math,random,html
root=Path(__file__).resolve().parent.parent
items=json.loads((root/'data/catalog.v2.json').read_text())['cards']
sty=root/'assets/stylized';sty.mkdir(parents=True,exist_ok=True)
pals={'common':('#bdc6d9','#50627d'),'uncommon':('#77ecc3','#21665d'),'rare':('#92dcff','#2059a1'),'epic':('#d4aaff','#6939a8'),'legendary':('#ffe8a8','#a65b29')}
for c in items:
 seed=int(hashlib.md5(c['id'].encode()).hexdigest()[:8],16)
 rng=random.Random(seed);light,dark=pals[c['rarity']]
 skin='#8ec18c' if c['kit']=='regen' else '#d6c4ea' if c['kit']=='god' else rng.choice(['#e8bc9c','#b58571','#f2c9a7','#c89b83']);hair='#f2dc81' if c['rarity']=='legendary' else rng.choice(['#1b2234','#f8d67d','#28213b','#ab8fa5'])
 shirt=rng.choice(['#e87949','#465e9d','#435987','#604590','#47675b'])
 spikes=' '.join(f'{x},{y}' for x,y in [(75,200),(50,104),(100,135),(90,30),(134,96),(155,0),(176,91),(231,28),(216,136),(260,89),(232,202)])
 # SVG entièrement original de démonstration ; pas d'images sous droits redistribuées.
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 420"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="{light}"/><stop offset="1" stop-color="{dark}"/></linearGradient><radialGradient id="a"><stop stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="300" height="420" fill="url(#g)"/><circle cx="155" cy="188" r="181" fill="url(#a)" opacity=".58"/><g stroke="#fff" stroke-opacity=".19" fill="none"><circle cx="152" cy="193" r="122" stroke-width="2"/><circle cx="152" cy="193" r="160" stroke-width="1"/><path d="M-10 310L310 90M-10 345L310 125M-10 380L310 160" stroke-width="6"/></g><path d="M23 420Q28 310 118 277L192 275Q271 308 282 420" fill="{shirt}" stroke="#0b172d" stroke-opacity=".35" stroke-width="5"/><path d="M130 249v45l25 26 26-33v-41" fill="{skin}"/><ellipse cx="154" cy="181" rx="67" ry="94" fill="{skin}"/><polygon points="{spikes}" fill="{hair}" stroke="#22263c" stroke-width="4"/><path d="M112 183l27-7m31 1l24 6" stroke="#272a3b" stroke-width="7" stroke-linecap="round"/><path d="M123 201l16 1m30 0l16-1" stroke="#fff" stroke-width="4"/><path d="M153 218l-8 22h14m-24 18q20 9 39-1" fill="none" stroke="#95645d" stroke-width="3"/><path d="M51 360L261 291" stroke="#fff" stroke-opacity=".12" stroke-width="26"/><text x="148" y="383" fill="#fff" fill-opacity=".16" font-size="45" text-anchor="middle" font-family="Arial" font-weight="900">{html.escape(c['name'].split()[0][:7].upper())}</text></svg>'''
 (sty/(c['id']+'.svg')).write_text(svg)
# PWA brand icons, not copyrighted franchise marks
for n in [192,512]:
 im=Image.new('RGB',(n,n),'#23213f');d=ImageDraw.Draw(im)
 d.ellipse([n*.1,n*.1,n*.9,n*.9],fill='#ff713e');d.ellipse([n*.22,n*.22,n*.78,n*.78],outline='#ffd28d',width=round(n*.035))
 d.line([(n*.31,n*.72),(n*.5,n*.23),(n*.65,n*.48)],fill='#fff6d5',width=round(n*.07),joint='curve')
 im.save(root/f'assets/icon-{n}.png')
print('Illustrations SVG originales créées :',len(items),'icônes PWA : 2')
