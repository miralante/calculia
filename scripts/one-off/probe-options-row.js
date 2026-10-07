/* ¿`options-row` cambia algo en la página que lo emite?
   ---------------------------------------------------------------
   app.js hace `optionsEl.classList.toggle('options-row', !!question.inline)`
   para poner las opciones en fila cuando la pregunta es "inline".
   El CSS de esa variante está copiado en algunas actividades
   (money, measures, mental-math, numbers, fractions-measures, shapes)
   y falta en otras que también lo emiten.

   No basta con contar clases: hay que medir el estilo computado antes
   y después de ponerla. Si los dos valores coinciden, la clase es
   inerte en esa página y las preguntas inline salen apiladas.

   Control: money (sí define la regla). Caso: algebra (no la define).
   Si el control cambia y el caso no, la diferencia es la regla.  */
'use strict';
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

const CONTROL = 'money';   /* sí define .options.options-row */
const CASES = ['algebra', 'calendar', 'charts', 'divisibility', 'geometry', 'operations', 'percent', 'places', 'problems', 'similar'];

async function measure(page, slug) {
  await page.goto('http://127.0.0.1:' + port + '/tools/' + slug + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  return page.evaluate(() => {
    const el = document.getElementById('options');
    if (!el) return { error: 'no existe #options' };
    /* Options vacías, pero el flex-direction de un contenedor flex
       vacío es el mismo que con hijos: lo decide la regla, no el
       contenido. Se pone uno para que la medición sea sobre algo real. */
    const b = document.createElement('button');
    b.className = 'option-btn';
    b.textContent = 'x';
    el.appendChild(b);
    const before = getComputedStyle(el).flexDirection;
    el.classList.add('options-row');
    const after = getComputedStyle(el).flexDirection;
    const wrap = getComputedStyle(el).flexWrap;
    el.classList.remove('options-row');
    el.innerHTML = '';
    return { before, after, wrap };
  });
}

let port;

(async () => {
  const fail = [];
  await new Promise((r) => server.listen(0, '127.0.0.1', (r2) => r(r2)));
  port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });

  const ctl = await measure(page, CONTROL);
  process.stderr.write('  control ' + CONTROL + ': ' + ctl.before + ' -> ' + ctl.after + '\n');
  if (ctl.before === ctl.after) {
    fail.push('el control ' + CONTROL + ' tampoco cambia: la sonda no mide lo que dice medir');
  }

  const inert = [];
  for (const slug of CASES) {
    const m = await measure(page, slug);
    if (m.error) { process.stderr.write('  ' + slug + ': ' + m.error + '\n'); continue; }
    const changes = m.before !== m.after;
    process.stderr.write('  ' + (changes ? '· ' : 'X ') + slug.padEnd(13) + m.before + ' -> ' + m.after + '\n');
    if (!changes) inert.push(slug);
  }

  await browser.close();
  server.close();

  if (inert.length) {
    console.log('\nLa clase `options-row` NO cambia nada en: ' + inert.join(', '));
    console.log('Preguntas con inline:true salen apiladas en columna en esas actividades.');
  }
  if (fail.length) {
    console.log('\nFALLOS DE LA SONDA:');
    fail.forEach((f) => console.log('  - ' + f));
    process.exitCode = 1;
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });