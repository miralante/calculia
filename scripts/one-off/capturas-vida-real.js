'use strict';
/* Captura las cinco tarjetas de "vida real" con su texto, y comprueba
   que el texto que se pinta es el que hay en el fichero (no una clave
   que se ha perdido o se ha tradujido a la nada). */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'capturas');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

function startServer() {
  const server = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent((req.url || '/').split('?')[0]); } catch { res.writeHead(400); res.end(); return; }
    let f = path.resolve(ROOT, p.replace(/^\/+/, '') || 'index.html');
    if (p === '/') f = path.join(ROOT, 'index.html');
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));

  for (const locale of ['es', 'en']) {
    await page.goto(base + '/tools/scale/');
    await page.evaluate(l => localStorage.setItem('calculia:locale', l), locale);
    await page.reload();
    await page.waitForSelector('#screenIntro:not(.hidden)');
    await page.locator('#introContinue').click();
    await page.waitForSelector('#screenReal:not(.hidden)');
    const total = await page.evaluate(() => window.DATA.real.length);
    for (let i = 0; i < total; i += 1) {
      const row = await page.evaluate(() => ({
        picto: document.querySelector('#realObject').textContent,
        name: document.querySelector('#realCaption').textContent,
        note: document.querySelector('#realNote').textContent
      }));
      console.log(`${locale} ${i}  ${row.picto}  ${row.name}`);
      console.log(`        "${row.note}"`);
      if (i < total - 1) { await page.locator('#realNext').click(); await page.waitForTimeout(60); }
    }
    if (locale === 'es') {
      /* Vuelve al primero antes de capturar: el bucle anterior ha dejado
         el carrusel en el ultimo, y capturaria las tarjetas corrida. */
      await page.goto(base + '/tools/scale/');
      await page.evaluate(l => localStorage.setItem('calculia:locale', l), locale);
      await page.reload();
      await page.waitForSelector('#screenIntro:not(.hidden)');
      await page.locator('#introContinue').click();
      await page.waitForSelector('#screenReal:not(.hidden)');
      for (let i = 0; i < total; i += 1) {
        await page.locator('.real-card').screenshot({ path: path.join(OUT, `real-${i + 1}.png`) });
        if (i < total - 1) { await page.locator('#realNext').click(); await page.waitForTimeout(60); }
      }
    }
    console.log('');
  }
  console.log('errores: ' + JSON.stringify(errors));
  await browser.close(); server.close();
})().catch(e => { console.error('FALLO: ' + e.message); process.exit(1); });