from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'V52_PREVIEW_AUTONOME.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1360,'height':860},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content(html,wait_until='domcontentloaded',timeout=30000)
 page.wait_for_timeout(200)
 page.screenshot(path=str(root/'screenshot_home_v52.png'))
 page.locator('[data-action="nav"][data-page="collection"]').first.click()
 page.screenshot(path=str(root/'screenshot_collection_v52.png'))
 page.select_option('#rarityFilter','legendary')
 assert page.locator('[data-action="viewCard"]').count()>=10
 page.locator('[data-action="viewCard"]').first.click();page.wait_for_timeout(100)
 assert page.locator('.v51-gold-open').count()==1
 page.screenshot(path=str(root/'screenshot_legendaire_v52.png'))
 page.locator('[data-action="closeModal"]').last.click(force=True)
 # free battles are local, still include fully automatic simulation
 page.evaluate("changePage('free')")
 btn=page.locator('[data-action="freeFight"]');assert btn.count()>0
 btn.first.click();page.wait_for_timeout(150)
 assert page.locator('.fight-field').count()==1
 assert page.locator('.v51-live-event').count()==1
 page.evaluate("(()=>{const k=S.battle.result.events.findIndex(e=>e.type==='ko');if(k>=0){S.battle.index=k+1;pause();updateBattleFrame();}})()")
 page.wait_for_timeout(100)
 page.screenshot(path=str(root/'screenshot_battle_v52.png'))
 print('battle KO cut-in',page.locator('.v52-ko-cinematic').count())
 # profile local controls
 page.evaluate("changePage('profile')")
 assert page.locator('[data-action="exportSave"]').count()==1
 assert page.locator('[data-action="importSave"]').count()==1
 page.screenshot(path=str(root/'screenshot_profil_v52.png'))
 mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 mobile_errors=[];mobile.on('pageerror',lambda e:mobile_errors.append(str(e)))
 mobile.set_content(html,wait_until='domcontentloaded');mobile.screenshot(path=str(root/'screenshot_mobile_v52.png'))
 mobile.evaluate("changePage('collection')");mobile.screenshot(path=str(root/'screenshot_mobile_collection_v52.png'))
 print('browser errors',errors,'mobile errors',mobile_errors)
 assert not errors and not mobile_errors
 browser.close()
