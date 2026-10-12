#!/usr/bin/env node
/* ============================================================
   capturas-inicio.js — one-off
   Las tres actividades que tenían la pantalla de inicio vacía. Nada
   estructural dice si un botón solo queda centrado, legible y del mismo
   tamaño que el resto de botones de la app; eso solo se ve aquí.

   Uso: node scripts/one-off/capturas-inicio.js
   ============================================================ */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'capturas');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};
const SLUGS = ['patterns', 'odd-one-out', 'stories'];

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
    catch { res.writeHead(400); res.end('bad'); return; }
    let file = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
    if (pathname === '/') file = path.join(ROOT, 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  for (const slug of SLUGS) {
    for (const scheme of ['light', 'dark']) {
      const ctx = await browser.newContext({
        viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, colorScheme: scheme
      });
      const page = await ctx.newPage();
      await page.goto(base + '/');
      await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
      await page.goto(base + '/tools/' + slug + '/');
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), scheme);
      await page.waitForSelector('#screenStart:not(.hidden)');
      await page.waitForTimeout(150);
      const sufijo = scheme === 'dark' ? '-oscuro' : '-claro';
      await page.locator('#screenStart').screenshot({ path: path.join(OUT, 'inicio-' + slug + sufijo + '.png') });
      if (scheme === 'light') {
        await page.locator('#btnStart').click();
        await page.waitForSelector('#screenGame:not(.hidden)');
        await page.waitForTimeout(150);
        await page.locator('#screenGame').screenshot({ path: path.join(OUT, 'inicio-' + slug + '-pregunta.png') });
      }
      await ctx.close();
    }
    console.log('  ' + slug + ': inicio-*.png');
  }
  await browser.close();
  server.close();
  console.log('\ncapturas en ' + OUT);
})().catch(error => { console.error(error); process.exit(1); });