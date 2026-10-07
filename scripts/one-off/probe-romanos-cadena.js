'use strict';
/* ¿Encadena Números Romanos sus sub-niveles?

   El bug: startLevel() limpiaba `currentGroup` también cuando lo
   llamaban desde finish() para pasar al siguiente sub-nivel. La
   cadena se rompía en silencio — tras el PRIMER sub-nivel saltaba a
   la pantalla final, sin error ninguno, y los pasos 2 y 3 nunca se
   jugaban.

   Por eso la comprobación no es "llegó a la pantalla final" (eso
   ocurría igual de roto): es "quedó guardado más de un sub-nivel en
   localStorage". */
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

/* Avanza como una persona: si no queda ninguna opción libre, la pista
   está pidiendo su "Entendido" antes del siguiente intento. */
async function advance(page) {
  const visible = (s) => page.locator(s).isVisible();
  for (let i = 0; i < 200; i++) {
    if (await visible('#endScreen')) return 'fin';
    if (!(await visible('#quizScreen'))) return 'salido';
    if (await visible('#nextBtn')) { await page.locator('#nextBtn').click({ timeout: 4000 }); continue; }
    const free = page.locator('#options .option-btn:not([disabled])');
    if (await free.count() > 0) { await free.first().click({ timeout: 4000 }); continue; }
    const ack = page.locator('#explanationWrap .btn-understood');
    if (await ack.isVisible()) { await ack.click({ timeout: 4000 }); continue; }
    return 'inesperado';
  }
  return 'límite';
}

(async () => {
  const fail = [];
  const pushFail = fail.push.bind(fail);
  fail.push = (m) => { pushFail(m); process.stderr.write('  X ' + m + '\n'); };

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.setDefaultTimeout(6000);

  await page.goto('http://127.0.0.1:' + server.address().port + '/tools/roman-numerals/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // intro → ejemplos → recordatorio → jugar
  await page.locator('#introNext').click();
  await page.locator('#famousNextBtn').click();
  await page.locator('#referenceNext').click();

  const startLabel = (await page.locator('#difficulty').innerText()).trim();
  process.stderr.write('  · arrancando en: ' + (startLabel || '(sin etiqueta)') + '\n');

  const outcome = await advance(page);
  process.stderr.write('  · salida de advance(): ' + outcome + '\n');

  const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('calculia:roman-numerals'))) || '{}');
  const done = Object.keys(stored.completed || {});
  process.stderr.write('  · sub-niveles completados: ' + JSON.stringify(done) + '\n');

  if (outcome !== 'fin') fail.push('la ronda no llegó a la pantalla final (' + outcome + ')');
  if (done.length < 2) {
    fail.push('la cadena no encadenó: sólo se completó ' + JSON.stringify(done) +
      ' (el grupo "read" tiene 2 sub-niveles, level1 y level2)');
  }
  if (done.length && done.indexOf('level1') === -1) fail.push('no se completó level1, el primer sub-nivel: ' + JSON.stringify(done));

  await page.screenshot({ path: path.join(__dirname, 'capturas', 'romanos-cadena.png'), fullPage: true });

  errors.forEach((e) => fail.push('error de consola: ' + e));
  await browser.close();
  server.close();

  if (fail.length) {
    console.log('\nFALLOS (' + fail.length + '):');
    fail.forEach((f) => console.log('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log('\nOK — Romanos encadena los sub-niveles (' + done.join(', ') + ').');
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });