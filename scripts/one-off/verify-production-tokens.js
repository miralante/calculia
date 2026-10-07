'use strict';
/* Verify every page that now carries hashed ?v= tokens actually renders on
   a phone, with the service worker active. A stale or broken token shows up
   as an unstyled page (missing CSS) or a dead script (missing JS), which the
   per-activity ui-smoke cannot see because it runs against the local server.

   Run: node scripts/one-off/verify-production-tokens.js */

const { chromium, devices } = require('playwright');
const BASE = 'https://calculia.apptonomia.uk';

const PAGES = ['/', '/about/', '/team/', '/config/', '/legal/', '/dev/', '/404'];

(async () => {
  let problems = 0;
  const browser = await chromium.launch();

  for (const route of PAGES) {
    const context = await browser.newContext({ ...devices['Pixel 7'], serviceWorkers: 'allow' });
    const page = await context.newPage();
    const failed = [];
    page.on('requestfailed', r => failed.push(`${r.failure()?.errorText} ${r.url()}`));
    page.on('response', r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });

    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1200);
      const s = await page.evaluate(() => {
        const sheets = [...document.styleSheets].filter(x => (x.href || '').includes('/assets/'));
        let loaded = 0, blocked = 0;
        for (const sh of sheets) { try { sh.cssRules; loaded++; } catch { blocked++; } }
        return {
          title: document.title,
          sheetsTotal: sheets.length,
          sheetsReadable: loaded,
          sheetsBlocked: blocked,
          bodyFont: getComputedStyle(document.body).fontFamily,
          bg: getComputedStyle(document.body).backgroundColor,
          // The locale picker mounts from JS: if its token were broken the
          // mount would be empty. about/ team/ config/ legal/ carry a
          // hand-written footer by design (no data-pie-app marker), so the
          // footer is not a valid signal there.
          localeMounted: !!document.querySelector('#locale-picker')?.children.length,
          footerLinks: document.querySelectorAll('footer a').length,
          textLen: document.body.innerText.trim().length,
        };
      });
      const ok = s.sheetsReadable > 0 && s.sheetsBlocked === 0 && s.localeMounted && s.textLen > 40;
      if (!ok) problems++;
      console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${route}`);
      console.log(`       title="${s.title}" sheets=${s.sheetsReadable}/${s.sheetsTotal} blocked=${s.sheetsBlocked} footer=${s.footerLinks} locale=${s.hasLocaleMount} chars=${s.textLen}`);
      console.log(`       font=${s.bodyFont.slice(0, 44)} bg=${s.bg}`);
    } catch (err) {
      problems++;
      console.log(`  FAIL ${route}: ${err.message.split('\n')[0]}`);
    }
    if (failed.length) { console.log(`       network problems: ${JSON.stringify(failed.slice(0, 6))}`); problems++; }
    await context.close();
  }

  await browser.close();
  console.log(`\n${problems === 0 ? 'ALL PAGES RENDER WITH HASHED TOKENS' : problems + ' PROBLEM(S)'}`);
  if (problems) process.exitCode = 1;
})();