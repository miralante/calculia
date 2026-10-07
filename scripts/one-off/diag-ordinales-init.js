'use strict';
/* Diagnóstico del arranque de Números ordinales.

   Un throw dentro de init() deja la pantalla a medio pintar y no se
   ve: el carrusel sale lleno (pintado antes del fallo) y todo lo
   posterior en blanco. Esta sonda imprime el error de consola y
   cuenta lo que hay en cada zona, para localizar en qué línea se
   rompe sin tener que leer el código entero.

   Vive en scripts/one-off/ y no en TEMP a propósito: el módulo
   `playwright` se resuelve desde los node_modules del proyecto, y un
   script fuera del árbol no lo encuentra. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
  res.end(fs.readFileSync(file));
});

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  page.on('console', (m) => console.log('CONSOLE[' + m.type() + ']:', m.text()));
  await page.goto('http://127.0.0.1:' + server.address().port + '/tools/ordinals/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  const probe = async (label, sel) => {
    try {
      if (sel.includes('@')) {
        console.log(label, ':', (await page.locator(sel.split('@')[0]).innerText()).replace(/\s+/g, ' ').trim());
      } else {
        console.log(label, ':', await page.locator(sel).count());
      }
    } catch (e) {
      console.log(label, ': ERROR', e.message.split('\n')[0]);
    }
  };
  await probe('carousel', '#carouselDisplay@');
  await probe('famousTxt', '#famousText@');
  await probe('ordChips', '#ordinalsRow .ord-chip');
  await probe('ruleMatch', '#ruleMatch .rule-example');
  await probe('strip', '#ruleStart .strip-member');
  await probe('levels', '#levelsGrid .btn-practice');

  await browser.close();
  server.close();
})();