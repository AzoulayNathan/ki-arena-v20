from pathlib import Path
from math import sin
root=Path(__file__).resolve().parents[1]/'assets/rogue';root.mkdir(exist_ok=True,parents=True)
settings=[('wilderness','#2e8bbf','#bfeef6','#5cb8a4','#277b85','#0e4569'),('desert','#965b6d','#ffca8d','#df9963','#a25d56','#593a68'),('namek','#108f9b','#b2eccb','#6bc79c','#348b83','#154e68'),('ruins','#37638d','#b3b9cc','#677fa0','#3b5e79','#23324e'),('sky','#659dcc','#f8e9c5','#96cbcc','#6489b1','#254d77'),('void','#1f2b61','#976abd','#6f5196','#49346d','#211b43')]
for theme,top,bottom,front,middle,dark in settings:
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 400" preserveAspectRatio="xMidYMid slice">
 <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="{top}"/><stop offset="1" stop-color="{bottom}"/></linearGradient><radialGradient id="light"><stop stop-color="#fff6ce"/><stop offset="1" stop-color="#fff6ce" stop-opacity="0"/></radialGradient></defs>
 <rect width="1400" height="400" fill="url(#sky)"/><circle cx="1080" cy="100" r="145" fill="url(#light)"/><circle cx="1080" cy="100" r="44" fill="#fff6d9" opacity=".83"/>
 <g fill="white" opacity=".45"><ellipse cx="220" cy="100" rx="126" ry="19"/><ellipse cx="270" cy="85" rx="85" ry="28"/><ellipse cx="1220" cy="160" rx="145" ry="15"/><ellipse cx="1160" cy="149" rx="66" ry="20"/></g>
 <g fill="{middle}"><path d="M0 310L124 175L230 277L400 135L537 290L700 150L890 292L1050 162L1224 281L1360 169L1400 213L1400 400H0Z"/></g>
 <g fill="{dark}" opacity=".72"><path d="M0 378L135 279L250 344L431 232L610 330L760 239L933 323L1103 246L1290 325L1400 270V400H0Z"/></g>
 <g fill="{front}"><path d="M0 360Q110 328 238 360T502 354T785 360T1100 345T1400 365V400H0Z"/></g>'''
 if theme in ('namek','wilderness','sky'):
  svg+='''<g fill="#164e62" opacity=".67"><path d="M80 365Q92 280 100 220L112 222Q125 280 129 368Z"/><path d="M44 232Q100 144 155 235Q90 265 44 232Z"/><path d="M1185 370Q1194 300 1218 240L1226 242Q1235 320 1248 375Z"/><path d="M1160 240Q1230 145 1306 243Q1230 279 1160 240Z"/></g>'''
 if theme=='ruins':
  svg+='''<g fill="#344960" opacity=".8"><path d="M92 365V239H162V366M188 365V190H236V365M255 367V251H340V367M1083 361V208H1148V361M1180 367V172H1213V367"/><g fill="#e6d9b5"><rect x="120" y="260" width="15" height="22"/><rect x="210" y="219" width="12" height="18"/><rect x="1108" y="237" width="12" height="22"/></g></g>'''
 if theme=='desert':
  svg+='''<g fill="#f5d39e" opacity=".5"><path d="M0 390Q130 300 390 395T790 380T1400 355V400H0Z"/></g>'''
 if theme=='void':
  svg+='''<g fill="#eef1ff"><circle cx="114" cy="44" r="3"/><circle cx="459" cy="68" r="2"/><circle cx="711" cy="24" r="4"/><circle cx="903" cy="43" r="3"/><circle cx="1305" cy="66" r="3"/></g>'''
 svg+='</svg>'
 (root/(theme+'.svg')).write_text(svg)
print('new landscape assets',len(list(root.glob('*.svg'))))
