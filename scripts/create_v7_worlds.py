from pathlib import Path
import math, random
root=Path(__file__).resolve().parents[1]/'assets'/'rogue'
root.mkdir(parents=True,exist_ok=True)
config={
 'wilderness':dict(top='#65c5ed',bottom='#ffe1ab',sun='#ffedc4',far='#4b95a8',mid='#2e7797',near='#183d69',accent='#55cca4',structure='temple'),
 'desert':dict(top='#7558b4',bottom='#ffba7e',sun='#ffdfa7',far='#d38784',mid='#9f5479',near='#513864',accent='#f7b05a',structure='mesa'),
 'namek':dict(top='#35abb6',bottom='#d6eac3',sun='#fff7bd',far='#46ad9b',mid='#237b7f',near='#194d69',accent='#88e4a7',structure='namek'),
 'ruins':dict(top='#6676b0',bottom='#ffc69a',sun='#ffeac3',far='#a88c94',mid='#555981',near='#282e52',accent='#ffcd8b',structure='ruins'),
 'sky':dict(top='#3e97df',bottom='#e4d7f4',sun='#ffffff',far='#89bfe5',mid='#6589c4',near='#325a95',accent='#ffdd92',structure='sky'),
 'void':dict(top='#120f38',bottom='#784a9a',sun='#e8c4ff',far='#6751aa',mid='#432d79',near='#1d1b4b',accent='#b996ff',structure='void'),
}
for biome,c in config.items():
 r=random.Random('KI-ARENA-V7-'+biome)
 lines=[f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 620" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="{c['top']}"/><stop offset="1" stop-color="{c['bottom']}"/></linearGradient><radialGradient id="sun"><stop stop-color="{c['sun']}" stop-opacity=".8"/><stop offset=".45" stop-color="{c['sun']}" stop-opacity=".25"/><stop offset="1" stop-color="{c['sun']}" stop-opacity="0"/></radialGradient><linearGradient id="water" x2="0" y2="1"><stop stop-color="{c['accent']}" stop-opacity=".45"/><stop offset="1" stop-color="{c['near']}"/></linearGradient><pattern id="grain" patternUnits="userSpaceOnUse" width="61" height="63"><circle cx="7" cy="12" r=".9" fill="#fff" opacity=".17"/><circle cx="43" cy="36" r="1" fill="#000" opacity=".08"/></pattern></defs>
<rect width="1440" height="620" fill="url(#sky)"/>
<circle cx="1110" cy="150" r="235" fill="url(#sun)"/><circle cx="1110" cy="150" r="49" fill="{c['sun']}" opacity=".94"/>''']
 if biome=='void':
  for i in range(90):
   x=r.randint(0,1440);y=r.randint(15,390);s=r.choice([1,1.5,2,3]);lines.append(f'<circle cx="{x}" cy="{y}" r="{s}" fill="#fff1fc" opacity="{r.uniform(.24,.85):.2f}"/>')
  lines.append('<path d="M-100 105C280 240 560 -10 880 142S1370 185 1540 65" stroke="#ffc2fd" stroke-opacity=".3" stroke-width="34" fill="none"/>')
 else:
  for _ in range(11):
   x=r.randint(-70,1450); y=r.randint(40,270);w=r.randint(65,190)
   lines.append(f'<g fill="#fff" opacity="{r.uniform(.12,.32):.2f}"><ellipse cx="{x}" cy="{y}" rx="{w}" ry="{r.randint(7,14)}"/><ellipse cx="{x+w//4}" cy="{y-13}" rx="{w//2}" ry="{r.randint(13,23)}"/></g>')
 # parallax mountains
 for color,baseline,amplitude,seed in [(c['far'],358,150,10),(c['mid'],455,145,17),(c['near'],530,110,31)]:
  rr=random.Random(seed+len(biome)*81)
  pts=[(-60,baseline)]
  for x in range(-40,1500,110): pts.append((x,baseline-rr.randint(20,amplitude)))
  points=' '.join(f'{x},{y}' for x,y in pts+[(1500,660),(-60,660)])
  lines.append(f'<polygon points="{points}" fill="{color}"/>')
 # valley and water
 lines.append(f'<path d="M-20 518Q235 480 454 536T897 521T1480 529V640H-20Z" fill="{c["near"]}" opacity=".88"/>')
 lines.append(f'<path d="M490 620Q636 545 785 530Q880 520 971 620Z" fill="url(#water)" opacity=".85"/>')
 # architectural landmarks
 if c['structure']=='temple':
  lines += [f'<g fill="#e9d9a7" opacity=".82"><path d="M210 441L282 391L358 441Z"/><rect x="228" y="439" width="112" height="52" rx="3"/><rect x="242" y="408" width="14" height="78"/><rect x="308" y="408" width="14" height="78"/></g>', '<path d="M268 490V449H303V490" fill="#274b65"/>']
 if c['structure']=='mesa':
  lines += ['<path d="M1120 474L1150 365L1223 365L1249 466Z" fill="#e5a16b" opacity=".72"/><path d="M1150 365L1170 348L1228 351L1223 367Z" fill="#f7cc91"/>','<path d="M170 528L195 430H245L272 520Z" fill="#e5a16b" opacity=".75"/>']
 if c['structure']=='namek':
  for x,y,k in [(203,510,.9),(1230,491,1.2),(940,505,.8)]:
   lines.append(f'<g transform="translate({x} {y}) scale({k})"><path d="M-9 0Q-6 -86 0 -145Q18 -107 16 0" fill="#266c6f"/><path d="M-88 -140Q-5 -233 86 -144Q5 -100 -88 -140Z" fill="#72d5aa"/><path d="M-50 -166Q5 -218 58 -169" stroke="#c1f4c0" stroke-opacity=".5" stroke-width="8" fill="none"/></g>')
 if c['structure']=='ruins':
  for x,y in [(220,501),(300,517),(1070,478)]:
   lines.append(f'<g fill="#c6adb0" opacity=".64"><rect x="{x}" y="{y-89}" width="22" height="96"/><path d="M{x-8} {y-91}h38v10h-38Z"/><path d="M{x-14} {y-109}h50v12h-50Z"/></g>')
 if c['structure']=='sky':
  for x,y,w in [(220,411,170),(1040,400,210),(682,484,110)]:
   lines.append(f'<path d="M{x-w/2} {y}Q{x} {y-35} {x+w/2} {y}Q{x} {y+70} {x-w/2} {y}Z" fill="#caeaff" opacity=".56"/><path d="M{x-40} {y-8}L{x} {y-70}L{x+38} {y-8}Z" fill="#fbe6ba" opacity=".65"/>')
 if c['structure']=='void':
  for x,y in [(170,520),(370,565),(1180,493)]:
   lines.append(f'<path d="M{x-37} {y}L{x-19} {y-100}L{x+13} {y-140}L{x+35} {y}Z" fill="#9874bb" opacity=".66"/><path d="M{x-20} {y-99}L{x+11} {y-137}" stroke="#fbcaff" stroke-opacity=".5" stroke-width="5"/>')
 # foreground grass/crystals
 for i in range(40):
  x=r.randint(0,1440); y=r.randint(531,619); sz=r.randint(7,32)
  if biome in ('void','ruins'):
   lines.append(f'<path d="M{x-sz//3} {y}L{x} {y-sz}L{x+sz//3} {y}Z" fill="{c["accent"]}" opacity="{r.uniform(.12,.3):.2f}"/>')
  else:
   lines.append(f'<path d="M{x} {y}l{-sz//3} {-sz}m{sz//3} {sz}l{sz//3} {-sz*0.8:.1f}" fill="none" stroke="{c["accent"]}" stroke-opacity=".24" stroke-width="3"/>')
 lines+=['<rect width="1440" height="620" fill="url(#grain)"/></svg>']
 (root/f'{biome}.svg').write_text('\n'.join(lines))
 print(biome,(root/f'{biome}.svg').stat().st_size)
