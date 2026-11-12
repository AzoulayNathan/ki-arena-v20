from playwright.sync_api import sync_playwright
from pathlib import Path
import json
HTML=Path('/mnt/data/ki_v8_polish/KI_ARENA_ROGUEONE_V8_JOUER.html').read_text()
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for w in [390,768]:
  page=b.new_page(viewport={'width':w,'height':844});page.set_default_timeout(3000)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(HTML,wait_until='domcontentloaded',timeout=15000)
  try:
   page.locator('[data-action="nav"][data-page="rogue"]').first.click(timeout=3000)
   for i in range(5):page.locator('.rogue-select [data-action="roguePick"]').nth(i).click(timeout=3000)
   page.locator('[data-action="rogueStart"]').click(timeout=3000)
   page.wait_for_timeout(1800)
   print(w,'choices:',page.locator('.v8-choice').count(),'scroll',page.evaluate('document.documentElement.scrollWidth'), 'inner',page.evaluate('innerWidth'),'errs:',errs[:1],flush=True)
   page.screenshot(path=f'/mnt/data/ki_v8_polish/v8_exploration_{w}.png',full_page=True,animations='disabled')
  except Exception as ex: print(w,'ERROR',str(ex)[:400],flush=True)
  page.close()
 b.close()
