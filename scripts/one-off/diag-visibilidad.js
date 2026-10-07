/* Why does #btnIntroNext report as not visible? */
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

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
  page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

  await page.goto(`${base}/tools/posneg/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  const dump = await page.evaluate(() => {
    const btn = document.querySelector('#btnIntroNext');
    const intro = document.querySelector('#introScreen');
    const r = btn.getBoundingClientRect();
    const cs = getComputedStyle(btn);
    const ics = getComputedStyle(intro);
    return {
      btnRect: { w: r.width, h: r.height, x: r.x, y: r.y },
      btnDisplay: cs.display,
      btnVisibility: cs.visibility,
      btnOpacity: cs.opacity,
      btnBackground: cs.backgroundColor,
      btnColor: cs.color,
      introClass: intro.className,
      introDisplay: ics.display,
      sections: Array.from(document.querySelectorAll('section')).map((s) => ({
        id: s.id, cls: s.className, display: getComputedStyle(s).display,
      })),
    };
  });

  console.log(JSON.stringify(dump, null, 2));
  console.log('isVisible #btnIntroNext:', await page.locator('#btnIntroNext').isVisible());

  await browser.close();
  server.close();
})();