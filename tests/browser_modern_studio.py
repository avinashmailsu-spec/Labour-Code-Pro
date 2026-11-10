"""Render the complete static site in a self-contained Chromium page.
This bypasses sandbox restrictions on localhost navigation; not an HTTP deployment test.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,json,sys
site=Path(__file__).resolve().parents[1]/'site'
shots=Path(__file__).resolve().parents[1]/'screenshots'
shots.mkdir(exist_ok=True)
html=(site/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
    html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(site/path).read_text()+'</style>')
js=[]
for path in re.findall(r'<script defer src="([^"]+)"></script>',html):
    html=html.replace(f'<script defer src="{path}"></script>','')
    js.append('<script>'+(site/path).read_text().replace('</script>','<\\/script>')+'</script>')
html=html.replace('</body>',''.join(js)+'</body>')
images={}
for img in (site/'assets').glob('*'):
    if img.suffix in ('.webp','.png'):
        data='data:image/'+('png' if img.suffix=='.png' else 'webp')+';base64,'+base64.b64encode(img.read_bytes()).decode()
        html=html.replace('assets/'+img.name,data)
        images['assets/'+img.name]=data
legal={k:json.loads((site/f'assets/legal/{k}.json').read_text()) for k in ['wages','industrial','security','osh']}
mock='window.__mockLegal='+json.dumps(legal,separators=(',',':'))+';'
mock+="window.fetch=async url=>{let m=String(url).match(/assets\\/legal\\/(wages|industrial|security|osh)\\.json/);if(m)return {ok:true,json:async()=>window.__mockLegal[m[1]]};return {ok:false,status:404}};"
html=html.replace('<head>','<head><script>'+mock+'</script>')
all_results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(320,760),(360,800),(390,844),(768,1000),(1280,900),(1440,900)]:
        page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,accept_downloads=True)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content(html,wait_until='domcontentloaded',timeout=90000)
        page.wait_for_timeout(900)
        fix_images=lambda:page.evaluate('(images)=>document.querySelectorAll("img").forEach(i=>{const src=i.getAttribute("src");if(images[src])i.src=images[src]})',images)
        fix_images()
        assert page.locator('.ms-home .ms-hero').count()==1,('Home not mounted',errors,page.locator('body').inner_text()[:250])
        dimensions=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,vw:innerWidth,header:document.querySelector('.topbar')?.getBoundingClientRect().toJSON(),bottom:document.querySelector('#android-bottom-nav')?.getBoundingClientRect().toJSON()})''')
        assert dimensions['scroll']<=w+3,('Overflow',w,dimensions)
        assert not errors,('JS errors',w,errors)
        if w in (390,1280,1440):page.screenshot(path=str(shots/f'modern-{w}-home.png'),full_page=False)
        answer=page.locator('.ms-answer-list [data-ms-answer]')
        assert answer.count()>=2
        answer.first.click()
        assert page.locator('.ms-feedback').count()==1
        page.locator('[data-ms-next]').click()
        assert page.locator('.ms-feedback').count()==0
        # Test theme and search toolbar
        pre=page.evaluate("document.documentElement.classList.contains('light')")
        page.locator('.v8-theme-tool').click()
        now=page.evaluate("document.documentElement.classList.contains('light')")
        assert now!=pre,('Theme did not switch',w)
        if w==390:page.screenshot(path=str(shots/'modern-390-night.png'),full_page=False)
        page.locator('.v8-theme-tool').click()
        page.locator('.v8-search-tool').click()
        assert page.locator('#lcp1-query').count()==1,('Search not opened',w)
        page.locator('#lcp1-query').fill('gratuity')
        page.wait_for_timeout(850)
        assert page.locator('.lcp1-result-head').count()==1,('No search result',w,errors)
        if w in (390,1280):page.screenshot(path=str(shots/f'modern-{w}-search.png'),full_page=False)
        page.evaluate("go('fullacts')")
        assert page.locator('.law-tile').count()==4
        fix_images()
        if w==390:
            page.evaluate('window.scrollTo(0,350)')
            page.wait_for_timeout(250)
        if w in (390,1280):page.screenshot(path=str(shots/f'modern-{w}-acts.png'),full_page=False)
        page.evaluate("go('visual-studio')")
        assert page.locator('.vl11-topic-card').count()==8
        fix_images()
        if w==390:
            page.evaluate('window.scrollTo(0,530)')
            page.wait_for_timeout(250)
        if w in (390,1280):page.screenshot(path=str(shots/f'modern-{w}-visuals.png'),full_page=False)
        assert not errors,('JS errors after interactions',w,errors)
        overflow=page.evaluate('document.documentElement.scrollWidth-innerWidth')
        assert overflow<=3,('route overflow',w,overflow)
        all_results.append({'width':w,'height':h,'horizontalOverflowPx':overflow,'jsErrors':len(errors),'bottomNavPresent':dimensions['bottom'] is not None,'search':'passed','challenge':'passed','theme':'passed','acts':'4/4','visualGuides':8})
        page.close()
    browser.close()
(shots/'UI_TEST_RESULTS.json').write_text(json.dumps(all_results,indent=2)+'\n')
print(json.dumps(all_results,indent=2))
