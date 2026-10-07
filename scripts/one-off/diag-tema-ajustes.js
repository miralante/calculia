/* Isolated reproduction of the ui-smoke theme assertion:
   does clicking light -> dark in the settings drawer actually change
   the visible palette? */
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

const readPalette = (page) => page.evaluate(() => ({
  attr: document.documentElement.getAttribute('data-theme'),
  bodyBg: getComputedStyle(document.body).backgroundColor,
  tokens: Object.fromEntries(['--color-fondo', '--color-texto', '--color-superficie']
    .map((n) => [n, getComputedStyle(document.documentElement).getPropertyValue(n).trim()])),
}));

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on('pageerror', (e) => console.log('PAGE EXCEPTION:', e.message));

  for (const route of ['/', '/config/']) {
    await page.goto(base + route, { waitUntil: 'load' });
    await page.waitForTimeout(600);

    const stylesheets = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel=stylesheet]')).map((l) => l.getAttribute('href')));
    console.log(`\n=== ${route} ===`);
    console.log('  hojas:', JSON.stringify(stylesheets));

    const drawer = page.locator('#accessibility-settings');
    await page.locator('.locale-settings-trigger').click();
    await drawer.waitFor({ state: 'visible', timeout: 10000 });

    const tap = (v) => drawer.locator(`[data-settings-theme="${v}"]`).click();

    await tap('light');
    const lightNow = await paletteOf();
    await tap('dark');
    const darkNow = await paletteOf();
    console.log('  [sin espera] light ->', JSON.stringify(lightNow));
    console.log('  [sin espera] dark  ->', JSON.stringify(darkNow));
    console.log('  ¿difieren?', JSON.stringify(lightNow.tokens) !== JSON.stringify(darkNow.tokens));

    await drawer.locator('[data-settings-close]').click();
    await page.waitForTimeout(250);
  }

  await browser.close();
  server.close();
})();