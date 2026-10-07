'use strict';
/* Estado final de una ronda de Números ordinales.

   Responde a dos preguntas que el resto de sondas no aíslan:
     1. ¿qué queda guardado en localStorage al terminar la cadena?
        (si `completed` no tiene los tres sub-pasos, la marca de
        "hecho" no aparece y no es un fallo de pintado)
     2. ¿la rejilla de pasos tiene estilos de verdad, o sale como
        botones pelados porque sus clases viven en el CSS de otra
        actividad?

   Se mide el estilo COMPUTADO, no la presencia de la clase: que la
   clase exista en el fichero no dice nada si ese fichero no está
   cargado en esta página. */
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

async function advance(page) {
  const visible = (s) => page.locator(s).isVisible();
  for (let i = 0; i < 80; i++) {
    if (await visible('#screenEnd')) return 'end';
    if (!(await visible('#screenQuiz'))) return 'salido';
    if (await visible('#next')) { await page.locator('#next').click({ timeout: 4000 }); continue; }
    const free = page.locator('#options .option-btn:not([disabled])');
    if (await free.count() > 0) { await free.first().click({ timeout: 4000 }); continue; }
    const ack = page.locator('#explanationWrap .btn-understood');
    if (await ack.isVisible()) { await ack.click({ timeout: 4000 }); continue; }
    return 'inesperado';
  }
  return 'límite';
}

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  await page.goto('http://127.0.0.1:' + server.address().port + '/tools/ordinals/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // intro → ejemplos → recordatorio → pasos. Cada botón sólo
  // existe visible en su propia pantalla, así que hay que Respectar
  // el orden del recorrido.
  await page.locator('#introNext').click();
  await page.locator('#famousNextBtn').click();
  await page.locator('#referenceNext').click();
  console.log('pantalla de pasos visible:', await page.locator('#screenLevels').isVisible());

  const style = await page.locator('#levelsGrid .btn-practice').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      flexDirection: cs.flexDirection,
      minHeight: cs.minHeight,
      background: cs.backgroundColor,
      color: cs.color,
      height: Math.round(el.getBoundingClientRect().height),
    };
  });
  console.log('estilo del botón de paso:', JSON.stringify(style));

  console.log('botones de paso:', await page.locator('#levelsGrid .btn-practice').count());
  console.log('marcas "hecho" antes de jugar:', await page.locator('#levelsGrid .practice-done').count());

  await page.locator('#levelsGrid .btn-practice').first().click();
  console.log('salida de advance():', await advance(page));

  const stored = await page.evaluate(() => localStorage.getItem('calculia:ordinals'));
  console.log('localStorage calculia:ordinals =', stored);

  await page.locator('#btnChooseLevel').click();
  await page.waitForTimeout(200);
  console.log('marcas "hecho" después:', await page.locator('#levelsGrid .practice-done').count());
  console.log('texto de la rejilla:', (await page.locator('#levelsGrid').innerText()).replace(/\s+/g, ' ').trim());

  await browser.close();
  server.close();
})();