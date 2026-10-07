/* One-off probe: the everyday-object drawings of Formas use fixed inks
   (a yellow sign, a red stop sign) while their outlines follow
   --color-texto. A drawing that only works on the cream theme is the
   invisible-button bug in a different costume, so this renders the four
   redrawn slides in all three themes side by side.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g> node scripts/one-off/probe-formas-temas.js
   Writes one contact sheet per theme under test-results/formas-vida-real/. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'test-results', 'formas-vida-real');
const THEMES = ['light', 'dark', 'contrast'];
/* Only the slides that changed: emoji fallback replaced by a drawing. */
const SLUGS = ['triangle', 'pentagon', 'hexagon', 'octagon', 'rectangularPrism',
  'triangularPrism', 'pyramid', 'cone'];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

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

async function run() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const theme of THEMES) {
    const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
    await page.goto('http://127.0.0.1:' + port + '/tools/shapes/index.html');
    await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.reload();
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.locator('#introContinue').click();
    await page.waitForSelector('#screenReal:not(.hidden)');

    const ids = await page.evaluate(() => window.DATA.gallery.map(item => item.id));
    const shots = [];
    for (let i = 0; i < ids.length; i += 1) {
      if (SLUGS.indexOf(ids[i]) !== -1) {
        const buffer = await page.locator('#screenReal .real-card').screenshot();
        shots.push({ id: ids[i], data: buffer.toString('base64') });
      }
      if (i < ids.length - 1) await page.locator('#realNext').click();
    }

    const sheet = await browser.newPage({ viewport: { width: 1500, height: 700 } });
    const cells = shots.map(s =>
      '<figure style="margin:0;display:flex;flex-direction:column;gap:6px;align-items:center">' +
      '<img src="data:image/png;base64,' + s.data + '" style="width:270px;border:1px solid #888">' +
      '<figcaption style="font:600 14px system-ui">' + s.id + '</figcaption></figure>'
    ).join('');
    await sheet.setContent(
      '<body style="margin:0;padding:14px">' +
      '<div style="display:grid;grid-template-columns:repeat(5,max-content);gap:16px">' + cells + '</div></body>'
    );
    const file = path.join(OUT, 'tema-' + theme + '.png');
    await sheet.screenshot({ path: file, fullPage: true });
    console.log(theme + ' -> ' + file);
    await sheet.close();
    await page.close();
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

run().catch(error => { console.error(error); process.exitCode = 1; });
