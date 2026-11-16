from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'V52_PREVIEW_AUTONOME.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(1360,860),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='domcontentloaded')
        page.evaluate("changePage('rogue')")
        assert page.locator('.rogue-intro').count()==1
        ids=page.evaluate("Object.keys(profile.owned).slice(0,5)")
        assert len(ids)==5, 'insufficient starter cards'
        page.evaluate("ids => { profile.rogue=createRun(ids,'audit-e2e-'+innerWidth);render();}",ids)
        assert page.locator('.route-choice').count()==3
        page.locator('.route-choice').first.click()
        assert page.locator('.rogue-main').count()==1 or page.locator('.fight-field').count()==1
        assert not errors,errors
        page.screenshot(path=str(root/f'audit_rogue_{width}.png'),full_page=True)
        print(f'PASS browser width={width} interactions=3 choices and node entry; js errors={len(errors)}')
        page.close()
    browser.close()
