/* Compare touch targets of the custom mission controls between posneg and
   the tool it was copied from (temperature), at a real mobile viewport —
   because @media (min-height: 720px) legitimately compacts .btn on desktop
   and would otherwise mask a genuine 64px violation. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, url);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* Smallest gap between the bounding boxes of adjacent visible controls. */
const measureFn = (cls) => {
  const visible = (el) => {
    let n = el;
    while (n && n !== document.body) {
      if (getComputedStyle(n).display === 'none') return false;
      n = n.parentElement;
    }
    return true;
  };
  const els = Array.from(document.querySelectorAll(cls)).filter(visible)
    .map((e) => ({ e, r: e.getBoundingClientRect() }))
    .filter((o) => o.r.width > 0);
  const gaps = [];
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i].r; const b = els[j].r;
      const dx = Math.max(0, Math.max(a.left - b.right, b.left - a.right));
      const dy = Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
      const overlapX = a.left < b.right && b.left < a.right;
      const overlapY = a.top < b.bottom && b.top < a.bottom;
      if (overlapX && overlapY) continue; // stacked/overlapping, not side by side
      gaps.push({ gap: dx || dy, a: els[i].e.textContent.trim().slice(0, 10), b: els[j].e.textContent.trim().slice(0, 10) });
    }
  }
  return {
    sizes: els.map((o) => ({
      label: o.e.textContent.trim().slice(0, 14),
      w: Math.round(o.r.width), h: Math.round(o.r.height),
      ok: o.r.width >= 64 && o.r.height >= 64,
    })),
    minGap: gaps.length ? Math.min(...gaps.map((g) => g.gap)) : null,
    below16: gaps.filter((g) => g.gap > 0 && g.gap < 16).slice(0, 4),
  };
};

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } }); // real mobile

  console.log('=== posneg · termómetro (375x667) ===');
  await page.goto(`${base}/tools/posneg/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await page.locator('#btnIntroNext').click();
  await page.waitForTimeout(250);
  console.log(JSON.stringify(await page.evaluate(measureFn, '.btn-temp'), null, 2));
  await page.screenshot({ path: path.join(__dirname, 'capturas', 'movil-posneg-termometro.png') });

  console.log('\n=== posneg · ascensor (375x667) ===');
  await page.locator('#btnTempNext').click();
  await page.waitForTimeout(250);
  console.log(JSON.stringify(await page.evaluate(measureFn, '.btn-elev'), null, 2));
  await page.screenshot({ path: path.join(__dirname, 'capturas', 'movil-posneg-ascensor.png') });

  console.log('\n=== temperature (referencia) ===');
  await page.goto(`${base}/tools/temperature/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const flow = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /btn-thermo/.test(x.className));
    if (b) b.click();
    return !!b;
  });
  await page.waitForTimeout(350);
  console.log('entrada a btn-thermo:', flow);
  console.log(JSON.stringify(await page.evaluate(measureFn, '.btn-thermo'), null, 2));

  console.log('\n=== roman-numerals · quiz (referencia) ===');
  await page.goto(`${base}/tools/roman-numerals/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  console.log(JSON.stringify(await page.evaluate(measureFn, '.btn'), null, 2));

  await browser.close();
  server.close();
})();