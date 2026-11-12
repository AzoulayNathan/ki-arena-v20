from playwright.sync_api import sync_playwright
from pathlib import Path
url='file:///mnt/data/ki_v8_polish/KI_ARENA_ROGUEONE_V8_JOUER.html'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(1360,900),(768,900),(390,844)]:
  page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(Path('/mnt/data/ki_v8_polish/KI_ARENA_ROGUEONE_V8_JOUER.html').read_text(),wait_until='load')
  page.locator('[data-action="nav"][data-page="rogue"]').first.click()
  # determine cards
  available=page.locator('.rogue-select .ki-card[data-action="roguePick"]')
  print(width,'available',available.count())
  for i in range(min(5,available.count())): available.nth(i).click()
  start=page.locator('[data-action="rogueStart"]')
  print('start disabled?',start.get_attribute('disabled'))
  if start.get_attribute('disabled') is None:start.click()
  page.wait_for_timeout(2300)
  print('v8 journey',page.locator('.v8-journey').count(),'choice',page.locator('.v8-choice').count(),'enabled',page.locator('.v8-choice:not([disabled])').count(),'drawer',page.locator('.v8-base-drawer').count())
  print('overflow',page.evaluate('document.documentElement.scrollWidth > innerWidth'), 'body width',page.evaluate('document.body.scrollWidth'))
  print('errors',errors[:5])
  page.screenshot(path=f'/mnt/data/ki_v8_polish/v8_exploration_{width}.png',full_page=True)
  drawer=page.locator('.v8-base-drawer>summary')
  if drawer.count():
   drawer.click();page.wait_for_timeout(250)
   print('drawer open',page.locator('.v8-base-drawer').get_attribute('open'))
   page.screenshot(path=f'/mnt/data/ki_v8_polish/v8_inventory_{width}.png',full_page=True)
  choices=page.locator('.v8-choice:not([disabled])')
  if choices.count():
   choices.first.click()
   page.wait_for_timeout(500)
   print('after choice: buttons',page.locator('[data-action="rogueFight"]').count(),'errors',errors[:5])
   page.screenshot(path=f'/mnt/data/ki_v8_polish/v8_encounter_{width}.png',full_page=True)
  page.close()
 browser.close()
