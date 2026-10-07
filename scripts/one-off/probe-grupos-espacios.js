'use strict';
/* La sonda de grupos normaliza con replace(/\s+/g,'') antes de comparar,
   así que no distinguiría "3 decenas" de "3decenas". Esta lee el texto
   real que ve la persona, sin normalizar. */
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
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://127.0.0.1:' + server.address().port + '/tools/quantities/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#practiceGrid .btn-practice', { timeout: 8000 });
  /* La intro no es la primera pantalla: se entra desde el menú de prácticas. */
  await page.locator('#practiceGrid .btn-practice', { hasText: 'Contar en grupos' }).click();
  await page.locator('#introNext').click();
  await page.locator('#famousNextBtn').click();
  const texts = await page.locator('#ruleMultiply .rule-example').allInnerTexts();
  const dz = await page.locator('#ruleDozen .rule-example').allInnerTexts();
  console.log('--- texto real, sin normalizar ---');
  [...texts, ...dz].forEach((t) => console.log('  [' + t + ']'));
  const bad = [...texts, ...dz].filter((t) => /\d[a-záéíóúñ]/.test(t));
  await browser.close();
  server.close();
  if (bad.length) {
    console.log('\nX — hay texto pegado sin espacio: ' + JSON.stringify(bad));
    process.exitCode = 1;
  } else {
    console.log('\nOK — los ejemplos de las reglas se leen con espacios.');
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });