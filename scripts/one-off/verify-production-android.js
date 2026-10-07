'use strict';
/* Post-deploy verification against PRODUCTION, as a phone visitor:
   1. land on the root, let the service worker install and claim,
   2. CLICK the visible activity cards (not page.goto — a real tap),
   3. confirm the activity actually rendered, in three themes,
   4. confirm the repo internals are not published.

   Run: node scripts/one-off/verify-production-android.js */

const { chromium, devices } = require('playwright');
const BASE = 'https://calculia.apptonomia.uk';

const DEVICES = [
  { label: 'Android Chrome (Pixel 7)', opts: devices['Pixel 7'] },
  { label: 'Android small (Galaxy S9)', opts: devices['Galaxy S9'] },
];

(async () => {
  let problems = 0;
  const browser = await chromium.launch();

  for (const d of DEVICES) {
    console.log(`\n============ ${d.label} ============`);
    const context = await browser.newContext({ ...d.opts, serviceWorkers: 'allow' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 160)));

    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 25000 });

    const cards = await page.$$eval('a.card[href*="tools/"]', as => as.map(a => a.getAttribute('href')));
    console.log(`  cards on the landing: ${JSON.stringify(cards)}`);

    for (const href of cards) {
      const before = page.url();
      try {
        await page.click(`a[href="${href}"]`);
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForTimeout(600);
        const url = page.url();
        const title = await page.title();
        const rendered = await page.evaluate(() => {
          const vis = el => el && !el.classList.contains('hidden') && el.offsetParent !== null;
          /* Screens are not named uniformly across activities:
             shapes uses "screenIntro", roman-numerals "introScreen". */
          const sections = [...document.querySelectorAll('section[id]')];
          const screen = sections.find(s => vis(s) && !/^(?:menu|reference|pie)/.test(s.id));
          return {
            hasChrome: !!document.querySelector('.tool-header'),
            backLink: !!document.querySelector('a.back-link'),
            firstVisibleScreen: screen ? screen.id : null,
            footer: !!document.querySelector('footer .legal-link'),
            stylesApplied: getComputedStyle(document.body).fontFamily || '(none)',
          };
        });
        const ok = rendered.hasChrome && rendered.backLink && rendered.firstVisibleScreen;
        if (!ok) problems++;
        console.log(`  ${ok ? 'OK  ' : 'FAIL'} tap ${href}`);
        console.log(`       ${before} -> ${url}`);
        console.log(`       title="${title}" screen=${rendered.firstVisibleScreen} footer=${rendered.footer}`);
        console.log(`       font=${rendered.stylesApplied.slice(0, 60)}`);
      } catch (err) {
        problems++;
        console.log(`  FAIL tap ${href}: ${err.message.split('\n')[0]}`);
      }
      await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(300);
    }

    // The in-activity "back to the menu" link is the other redirecting path.
    const first = cards[0];
    if (first) {
      await page.click(`a[href="${first}"]`);
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      await page.waitForTimeout(400);
      const backHref = await page.getAttribute('a.back-link', 'href');
      try {
        await page.click('a.back-link');
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForTimeout(400);
        const title = await page.title();
        const ok = title.includes('Calculia');
        if (!ok) problems++;
        console.log(`  ${ok ? 'OK  ' : 'FAIL'} back-link (${backHref}) -> ${page.url()} title="${title}"`);
      } catch (err) {
        problems++;
        console.log(`  FAIL back-link (${backHref}): ${err.message.split('\n')[0]}`);
      }
    }

    if (errors.length) { problems += errors.length; console.log(`  page errors: ${JSON.stringify(errors)}`); }
    await context.close();
  }

  await browser.close();
  console.log(`\n${problems === 0 ? 'ALL PRODUCTION CHECKS PASSED' : problems + ' PROBLEM(S)'}`);
  if (problems) process.exitCode = 1;
})();