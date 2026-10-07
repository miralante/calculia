/* ============================================================
   One-off: screenshot every question of tools/trigonometry/.

   The drawings are the whole activity, and a drawing can be wrong in a
   way no assertion catches: the ladder drawn on the wrong axis, the grid
   off by one, the arc in the wrong corner. This renders one real
   question per level and writes it to test-results/trigonometria/, so
   the pictures can be looked at.

   Run: node scripts/one-off/capturas-trigonometria.js
   ============================================================ */
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'test-results', 'trigonometria');
const PORT = 3182;
const BASE = 'http://127.0.0.1:' + PORT;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let pathname;
      try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
      catch { res.writeHead(400); res.end('Bad request'); return; }
      let filePath = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
      if (pathname === '/') filePath = path.join(ROOT, 'index.html');
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><p>404');
        return;
      }
      const ext = path.extname(filePath);
      const type = ext === '.js' ? 'text/javascript; charset=utf-8'
        : ext === '.css' ? 'text/css; charset=utf-8'
        : ext === '.html' ? 'text/html; charset=utf-8'
        : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

const ACTIVITIES = ['lados', 'razon', 'medir'];
const LEVELS_PER = { lados: 3, razon: 3, medir: 2 };

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const written = [];

  for (const width of [1280, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1400 } });
    await page.goto(BASE + '/tools/trigonometry/', { waitUntil: 'networkidle' });

    for (let a = 0; a < ACTIVITIES.length; a++) {
      for (let lv = 0; lv < LEVELS_PER[ACTIVITIES[a]]; lv++) {
        /* The level rises one step per finished round, so seeding the
           counter is how a person would reach this one. */
        await page.evaluate(function (n) {
          localStorage.setItem('calculia:trigonometry',
            JSON.stringify({ stars: 0, completedRounds: n }));
        }, lv);
        await page.reload({ waitUntil: 'networkidle' });
        await page.locator('.btn-actividad').nth(a).click();
        await page.waitForSelector('#screenGame:not(.hidden)');
        await page.waitForTimeout(150);

        const id = ACTIVITIES[a] + '-' + (lv + 1) + (width === 375 ? '-movil' : '');
        const file = path.join(OUT, id + '.png');
        await page.locator('#screenGame').screenshot({ path: file });
        written.push(path.relative(ROOT, file));
      }
    }
    await page.close();
  }

  await browser.close();
  server.close();
  console.log(written.join('\n'));
}

main().catch(function (e) { console.error(e); process.exitCode = 1; });