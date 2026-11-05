import asyncio, json
from playwright.async_api import async_playwright

BASE = 'http://127.0.0.1:8765'
PATHS = ['index.html', 'blog.html', 'refer.html', 'partners.html']
async def open_check(browser, path, width, height):
    page = await browser.new_page(viewport={'width':width,'height':height})
    err=[]
    page.on('pageerror',lambda e:err.append(str(e)[:200]))
    response=await page.goto(BASE+'/'+path,wait_until='domcontentloaded',timeout=30000)
    await page.wait_for_timeout(1200)
    info=await page.evaluate("""() => {
      const head=document.querySelector('header.rafsan-navbar-shell');
      const h1=document.querySelector('h1');
      const r=h1?.getBoundingClientRect(),n=head?.getBoundingClientRect();
      const grid=Array.from(document.querySelectorAll('.grid')).find(el=>el.textContent.includes('Standard Website / Shop'));
      const card=document.querySelector('#expertise .milestone-card');
      const reveal=document.querySelector('#story-section .reveal-word');
      return {url:location.pathname,headerBottom:n?.bottom,h1Top:r?.top,h1Bottom:r?.bottom,
        heading:h1?.innerText?.slice(0,90),css:!!document.querySelector('link[href="/styles/tailwind.generated.css"]'),
        cdn:!!document.querySelector('script[src*="cdn.tailwindcss.com"]'),
        grid:grid?getComputedStyle(grid).display:null,card:card?getComputedStyle(card).position:null,
        reveal:reveal?getComputedStyle(reveal).color:null,
        width:document.documentElement.scrollWidth,viewport:innerWidth};
    }""")
    print('PAGE',json.dumps({'path':path,'viewport':width,'status':response.status if response else 0,'data':info,'errors':err[:3]}),flush=True)
    assert response and response.status==200
    assert not err, f'{path} JavaScript errors {err}'
    assert info['width'] <= width+8, f'{path}: horizontal overflow {info}'
    if path in ('refer.html','partners.html'):
        assert info['css'] and not info['cdn'], f'{path}: duplicate or missing CSS {info}'
        assert info['h1Top']>=info['headerBottom']-3, f'{path}: heading overlaps nav {info}'
    if path=='refer.html':
        assert info['grid']=='grid', f'Referral commission grid broken {info}'
        if width>=1024: assert info['card']=='absolute', f'Desktop milestone card wrong {info}'
    await page.close()

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
    for width,height in [(1440,900),(390,844)]:
      for path in PATHS: await open_check(browser,path,width,height)
    page=await browser.new_page(viewport={'width':1440,'height':900})
    await page.goto(BASE+'/blog.html',wait_until='domcontentloaded')
    link=page.locator('a[href*="refer.html"]')
    assert await link.count(), 'Blog lacks referral navigation link'
    await link.first.click()
    await page.wait_for_load_state('domcontentloaded')
    assert page.url.endswith('/refer.html'),f'Blog->Refer navigation failed {page.url}'
    assert await page.locator('link[href="/styles/tailwind.generated.css"]').count()
    await page.go_back(wait_until='domcontentloaded')
    link=page.locator('a[href*="partners.html"]')
    assert await link.count(), 'Blog lacks partnership navigation link'
    await link.first.click()
    await page.wait_for_load_state('domcontentloaded')
    assert page.url.endswith('/partners.html'),f'Blog->Partners navigation failed {page.url}'
    print('CROSS_PAGE_NAV_OK',flush=True)
    await browser.close()
asyncio.run(main())
