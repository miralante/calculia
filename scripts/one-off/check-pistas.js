#!/usr/bin/env node
/* ============================================================
   check-pistas.js — one-off
   Juega mal, a propósito, en cada actividad de la suite y anota lo que
   pone la pista socrática al fallar. Comprueba que NO es la frase
   genérica ("Prueba otra vez. Mira el dibujo con calma"), que es lo que
   salía antes en veinte actividades.

   No reimplementa las reglas de ningún test: recorre los botones a lo
   bruto hasta encontrar la pantalla de juego y, una vez dentro, va
   probando opciones hasta que una sea la buena. Por eso vale para
   cualquier actividad, sea cual sea su esqueleto de pantallas.

   Uso: node scripts/one-off/check-pistas.js [slug ...]
   ============================================================ */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};
/* Todas con test. clock y riddles yaaban bien y entran como control: si
   el recorrido los rompe a ellos también, el problema es del recorrido. */
const ALL = [
  'algebra', 'calendar', 'charts', 'clock', 'divisibility', 'fractions-measures',
  'geometry', 'measures', 'mental-math', 'money', 'numbers', 'odd-one-out',
  'operations', 'patterns', 'percent', 'places', 'problems', 'riddles',
  'scale', 'shapes', 'similar', 'stories', 'trigonometry'
];

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

const visible = (page, selector) => page.locator(selector).first().isVisible().catch(() => false);

async function tap(page, locator) {
  try {
    await locator.click({ timeout: 1500, force: true });
    return true;
  } catch { return false; }
}

/* Click through whatever screens come until the options are on screen.
   Brute force on purpose: this probe must work on activities whose
   navigation nobody has documented. */
async function reachGame(page, base, slug) {
  const seen = new Set();
  for (let step = 0; step < 60; step += 1) {
    if (await page.locator('#options .option-btn').count()) return true;
    const state = await page.evaluate(() => location.hash + '|' +
      ((document.querySelector('main') || document.body).innerText || '').slice(0, 300));
    const buttons = page.locator('button:visible');
    const total = await buttons.count();
    /* Las flechas del carrusel se pulsan una detrás de otra y cada clic
       cambia el texto de la pantalla, así que nunca repetidas: un paseo
       que fuera en orden de DOM se quedaría sixty vueltas dando vueltas
       sin llegar nunca al botón de avanzar. Se prueban primero los
       botones que llevan a la siguiente pantalla. */
    const order = [];
    for (let i = 0; i < total; i += 1) {
      const info = await buttons.nth(i).evaluate(node => ({
        label: ((node.innerText || node.getAttribute('aria-label') || '').trim() + '|' + node.id).slice(0, 80),
        isOption: Boolean(node.closest('#options')),
        advances: /continue|next|start|test|jugar|hacer|empezar|play|go/i.test(
          (node.id || '') + ' ' + (node.innerText || '')) &&
          !/^(←|→|<|>)$/.test((node.innerText || '').trim()),
      })).catch(() => null);
      if (info && !info.isOption) order.push({ index: i, ...info });
    }
    order.sort((a, b) => Number(b.advances) - Number(a.advances));
    let moved = false;
    for (const candidate of order) {
      if (seen.has(state + '|' + candidate.label)) continue;
      seen.add(state + '|' + candidate.label);
      if (await tap(page, buttons.nth(candidate.index))) { moved = true; break; }
    }
    if (!moved) {
      await page.goto(base + '/tools/' + slug + '/').catch(() => {});
    }
  }
  return false;
}

/* Play the round answering badly, and note every hint it shows. */
async function collectHints(page, questions) {
  const hints = [];
  for (let q = 0; q < questions; q += 1) {
    if (await visible(page, '#screenEnd:not(.hidden)')) break;
    /* Si la pregunta quedó a medias con un «Entendido» pendiente, se
       acusa antes de intentar nada: con las opciones bloqueadas los
       clics no hacen nada y se perdería el resto de la ronda. */
    const pending = page.locator('#explanationWrap .btn-understood');
    if (await pending.count() && await pending.first().isVisible().catch(() => false)) {
      await tap(page, pending.first());
    }
    const options = page.locator('#options .option-btn');
    const total = await options.count();
    if (!total) break;
    for (let i = 0; i < total; i += 1) {
      const button = options.nth(i);
      if (!(await button.isVisible().catch(() => false))) continue;
      if (!(await tap(page, button))) continue;
      await page.waitForTimeout(40);
      const outcome = await button.evaluate(node => ({
        correct: node.classList.contains('correct'),
        wrong: node.classList.contains('encourage'),
      }));
      if (outcome.wrong) {
        const text = await page.locator('#explanation').innerText().catch(() => '');
        /* Con el segundo fallo la actividad ya enseña la respuesta
           ("❌ Mira: la respuesta correcta es…"). Eso es la explicación,
           no la pista, y aquí no se mide. */
         if (!/^[✅❌]/.test(text.trim())) hints.push(text.trim());
        const ack = page.locator('#explanationWrap .btn-understood');
        if (await ack.count() && await ack.first().isVisible().catch(() => false)) await tap(page, ack.first());
      }
      /* Un fallo no termina la pregunta: se sigue probando hasta dar con
         la buena, y así la ronda avanza y se ve más de un tipo de pista. */
      if (outcome.correct) break;
    }
    const next = page.locator('#btnNext');
    if (await visible(page, '#btnNext:not(.hidden)')) await tap(page, next);
    else break;
  }
  return hints;
}

(async () => {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ALL;
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const problems = [];

  for (const slug of slugs) {
    const page = await ctx.newPage();
    const hints = [];
    let landed = '';
    let botones = 0;
    try {
      await page.goto(base + '/');
      await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
      await page.goto(base + '/tools/' + slug + '/');
      await page.waitForTimeout(300);
      if (await reachGame(page, base, slug)) {
        hints.push(...await collectHints(page, 6));
      }
      /* Dónde se quedó: sin esto, "no se llegó a fallar" no distingue entre
         un test que no se puede alcanzar y una ronda que se acabó. */
      landed = await page.evaluate(() =>
        [...document.querySelectorAll('section, main')]
          .filter(node => !node.classList.contains('hidden'))
          .map(node => '#' + node.id)
          .join(', ') || '(ninguna pantalla visible)');
      /* Una pantalla de inicio sin un solo botón no es un fallo de esta
         sonda: es que la actividad no se puede empezar. Y eso es un
         hallazgo distinto, y más grave, que no llegar a fallar nada. */
      botones = await page.locator('button:visible').count();
    } catch (error) {
      problems.push(slug + ': no se pudo jugar (' + error.message.split('\n')[0] + ')');
    }

    const genericas = await page.evaluate(() => ['hint', 'pista']
      .map(k => { try { return window.App.i18n.t(k); } catch { return null; } })
      .filter(Boolean)).catch(() => []);
    const propias = hints.filter(h => h && !genericas.includes(h));
    const iguales = genericas.filter(g => hints.includes(g));

    console.log('\n' + slug + ': ' + hints.length + ' fallo(s) visto(s), ' +
      propias.length + ' con pista propia  [' + landed + ']');
    hints.forEach(h => console.log('   · ' + h));
    if (!hints.length) {
      problems.push(botones === 0
        ? slug + ': no se puede empezar. La pantalla de inicio (' + landed +
          ') no tiene ni un botón, así que no se llega nunca al test.'
        : slug + ': no se llegó a fallar ninguna pregunta (se quedó en ' + landed + ')');
    }
    iguales.forEach(g => problems.push(slug + ': vuelve la frase genérica "' + g + '"'));
    await page.close();
  }

  await browser.close();
  server.close();
  console.log('\n' + (problems.length
    ? 'FALLOS (' + problems.length + ')'
    : 'OK: ninguna actividad muestra ya la frase genérica'));
  problems.forEach(p => console.log('  - ' + p));
  if (problems.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
