import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = "https://appiex.com"
PATHS = ["/", "/refer", "/partners", "/blog", "/blog/how-we-reduced-website-load-time-5-2s-to-1-4s"]

async def check_page(browser, path, width, height):
    page = await browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda exc: errors.append(str(exc)[:180]))
    response = await page.goto(BASE + path, wait_until="domcontentloaded", timeout=45000)
    await page.wait_for_timeout(1800)
    result = await page.evaluate("""() => {
      const grid = Array.from(document.querySelectorAll('.grid')).find(el => el.textContent.includes('Standard Website / Shop'));
      const cards = Array.from(document.querySelectorAll('#expertise .milestone-card'));
      const first = cards.length ? getComputedStyle(cards[0]) : null;
      const h1 = document.querySelector('h1');
      return {
        title: document.title, h1: h1?.innerText?.trim().slice(0,130),
        cssLinked: !!document.querySelector('link[href="/styles/tailwind.generated.css"]'),
        gridDisplay: grid ? getComputedStyle(grid).display : null,
        milestonePosition: first?.position || null,
        milestones: cards.length, scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: innerWidth, bodyHeight: document.body.scrollHeight
      };
    }""")
    result.update(path=path, viewport=width, status=response.status if response else None, pageErrors=errors[:3])
    if response is None or response.status >= 400: raise AssertionError(f"HTTP bad {path}: {result}")
    if path == "/refer":
        if not result["cssLinked"]:
            probe = await page.goto(BASE + path + "?layout_audit=20261105_static_fallback_v2", wait_until="domcontentloaded", timeout=45000)
            probe_link = await page.evaluate("""() => !!document.querySelector('link[href="/styles/tailwind.generated.css"]')""")
            print("DEPLOY_PROBE", json.dumps({"status":probe.status if probe else None,
              "cssLinkedWithCacheBust":probe_link,
              "responseHeaders":dict(probe.headers) if probe else {}}),flush=True)
            raise AssertionError("Refer missing local CSS link on published website")
        if result["gridDisplay"] != "grid": raise AssertionError(f"Referral commission layout not grid: {result}")
        if width >= 1024 and result["milestonePosition"] != "absolute":
            raise AssertionError(f"Referral milestone desktop positioning missing: {result}")
    if path.endswith("5-2s-to-1-4s"):
        if not (result["h1"] and "5.2s" in result["h1"]):
            raise AssertionError(f"Blog article headline mismatch: {result}")
    print("PAGE", json.dumps(result), flush=True)
    await page.close()

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            for width,height in [(1440,900),(390,844)]:
                for path in PATHS:
                    await check_page(browser,path,width,height)
            page = await browser.new_page(viewport={"width":1440,"height":900})
            await page.goto(BASE + "/blog",wait_until="domcontentloaded",timeout=45000)
            link=page.locator('a[href*="how-we-reduced-website-load-time"]')
            if await link.count():
                await link.first.click()
                await page.wait_for_load_state("domcontentloaded")
                await page.go_back(wait_until="domcontentloaded")
                await page.wait_for_timeout(500)
                print("NAV_BACK",json.dumps({"url":page.url,"title":await page.title()}),flush=True)
                if not page.url.rstrip("/").endswith("/blog"):
                    raise AssertionError("Browser Back did not restore /blog")
            await page.close()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
