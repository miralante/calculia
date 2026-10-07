'use strict';
/* One-off probe: DECISIVE TEST, isolated.
   Each case gets its own browser context, so a failed navigation cannot
   poison the next one. Compares the redirecting URL against the canonical
   trailing-slash URL, both with the service worker controlling.

   Run: node scripts/one-off/probe-redirect-isolated.js */

const { chromium, devices } = require('playwright');
const BASE = 'https://calculia.apptonomia.uk';

const CASES = [
  { label: 'canonical   /tools/roman-numerals/',        url: `${BASE}/tools/roman-numerals/` },
  { label: 'canonical   /tools/shapes/',                 url: `${BASE}/tools/shapes/` },
  { label: 'canonical   /',                              url: `${BASE}/` },
  { label: 'redirecting /tools/roman-numerals/index.html', url: `${BASE}/tools/roman-numerals/index.html` },
  { label: 'redirecting /tools/shapes/index.html',      url: `${BASE}/tools/shapes/index.html` },
  { label: 'redirecting /index.html',                   url: `${BASE}/index.html` },
];

async function run(withSW) {
  console.log(`\n############ service worker ${withSW ? 'ENABLED (real visitor)' : 'BLOCKED (control)'} ############`);
  const browser = await chromium.launch();
  for (const c of CASES) {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      serviceWorkers: withSW ? 'allow' : 'block',
    });
    const page = await context.newPage();
    // Give the SW time to install and claim on the warm-up navigation.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    if (withSW) {
      await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 }).catch(() => {});
    }
    try {
      const resp = await page.goto(c.url, { waitUntil: 'domcontentloaded', timeout: 40000 });
      const title = await page.title();
      console.log(`  OK    ${c.label}  status=${resp && resp.status()}  title="${title}"`);
    } catch (err) {
      console.log(`  FAIL  ${c.label}  ${err.message.split('\n')[0]}`);
    }
    await context.close();
  }
  await browser.close();
}

(async () => {
  await run(true);
  await run(false);
})();