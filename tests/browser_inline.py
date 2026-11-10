from pathlib import Path
import re, base64, json
from playwright.sync_api import sync_playwright
site=Path(__file__).resolve().parents[1] / 'site'
shots=Path(__file__).resolve().parents[1] / 'screenshots'
html=(site/'index.html').read_text()
for path in re.findall(r'<link rel="stylesheet" href="([^"]+)">',html):
 html=html.replace(f'<link rel="stylesheet" href="{path}">','<style>'+(site/path).read_text()+'</style>')
js=[]
for path in re.findall(r'<script defer src="([^"]+)"></script>',html):
 html=html.replace(f'<script defer src="{path}"></script>','')
 js.append('<script>'+(site/path).read_text().replace('</script>','<\\/script>')+'</script>')
html=html.replace('</body>',''.join(js)+'</body>')
images={}
for p in (site/'assets').glob('*'):
 if p.suffix in ('.webp','.png'):
  data='data:image/'+('png' if p.suffix=='.png' else 'webp')+';base64,'+base64.b64encode(p.read_bytes()).decode()
  html=html.replace('assets/'+p.name,data)
  images['assets/'+p.name]=data
legal={k:json.loads((site/f'assets/legal/{k}.json').read_text()) for k in ['wages','industrial','security','osh']}
mock='window.__mockLegal='+json.dumps(legal,separators=(',',':'))+';'
mock+="window.fetch=async url=>{let m=String(url).match(/assets\\/legal\\/(wages|industrial|security|osh)\\.json/);if(m)return {ok:true,json:async()=>window.__mockLegal[m[1]]};return {ok:false,status:404}};"
html=html.replace('<head>','<head><script>'+mock+'</script>')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in [360,390,768,1280]:
  page=browser.new_page(viewport={'width':width,'height':844 if width<500 else 900},device_scale_factor=1,accept_downloads=True)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded',timeout=90000)
  page.wait_for_timeout(600)
  fix_imgs=lambda:page.evaluate('(images)=>document.querySelectorAll("img").forEach(i=>{const s=i.getAttribute("src");if(images[s])i.src=images[s]})',images)
  fix_imgs()
  assert page.locator('.workspace').count()==1, ('app failed',errs,page.locator('body').inner_text()[:300])
  print('WIDTH',width,'body',page.locator('body').inner_text()[:65].replace('\n',' / '),'errors',errs[:3])
  if width in (390,1280):page.screenshot(path=str(shots/f'web-{width}-home.png'))
  page.evaluate("go('fullacts')")
  assert page.locator('.web-law-summary').count()==1,errs
  fix_imgs()
  if width in (390,1280):page.screenshot(path=str(shots/f'web-{width}-full-acts.png'))
  page.evaluate("go('actreader','wages')")
  assert page.locator('.web-pdf-inline iframe').count()==1
  page.evaluate("window.AndroidBridge.openActAtPage('wages',15)")
  assert page.locator('#lcp-web-pdf').count()==1
  page.locator('#lcp-web-pdf .lcp-pdf-close').click()
  assert page.locator('#lcp-web-pdf').count()==0
  if width==390:page.screenshot(path=str(shots/'web-390-reader.png'))
  page.evaluate("go('statute','wages')")
  page.wait_for_timeout(200)
  print(width,'text reader body characters',len(page.locator('#app').inner_text()))
  page.evaluate("go('search')")
  page.wait_for_timeout(200)
  page.locator('#lcp1-query').fill('gratuity')
  page.wait_for_timeout(900)
  assert page.locator('.lcp1-result-head').count()==1,errs
  if width in (390,1280):page.screenshot(path=str(shots/f'web-{width}-legal-search.png'))
  print(width,'search result matches',page.locator('.lcp1-result-head h2').inner_text())
  page.evaluate("go('visual-studio')")
  fix_imgs()
  assert page.locator('.vl11-topic-card').count()==8
  if width in (390,1280):page.screenshot(path=str(shots/f'web-{width}-visual-studio.png'))
  print(width,'overflow',page.evaluate('document.documentElement.scrollWidth-innerWidth'),'errors',errs[:4])
  assert not errs,errs
  assert page.evaluate('document.documentElement.scrollWidth-innerWidth')<=3
  if width==390:
   for file,code in [('test.xlsx',"window.LCPWeb.excelBlob({sheet:'Test',rows:[['Name','Pages'],['Wages',29]]})"),('test.docx',"window.LCPWeb.docxBlob({title:'Test Report',lines:['Hello world','Second line']})")]:
    b64=page.evaluate(f'async()=>{{const blob={code};return new Promise(r=>{{const fr=new FileReader;fr.onload=()=>r(String(fr.result).split(\",\")[1]);fr.readAsDataURL(blob)}})}}')
    (shots/file).write_bytes(base64.b64decode(b64))
  page.close()
 browser.close()
print('UI smoke tests complete')
