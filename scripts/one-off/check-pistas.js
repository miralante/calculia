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
  'operations', 'patterns', 'percent', 'problems', 'riddles',
  'scale', 'shapes', 'similar', 'stories', 'trigonometry'
];
/* Las tres que no llaman #options a las opciones y arrancan con un botón
   propio. Con el paseo a lo bruto no se llegaba a su test; aquí van
   directas, que además es como se llega en la app. */
const STARTS = {
  patterns: { button: '#btnStart', options: '#options .option-btn', accepted: 'correct' },
  'odd-one-out': { button: '#btnStart', options: '#group .option-btn', accepted: 'correct' },
  /* Historias coloca una viñeta cada vez y sigue con la siguiente: acertar
     una NO termina la pregunta, así que el recorrido no puede parar ahí. */
  stories: { button: '#btnStart', options: '#available .vineta', accepted: 'colocada', sigue: true },
};

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

/* Esperar a que haya texto, en vez de confiar en un plazo fijo. Con 40 ms
   de reloj la sonda falla a veces en la primera pregunta de riddles y
   reporta cero fallos en una actividad que sí los está dando: un plazo
   que a veces se queda corto no es una puerta, es una moneda. */
async function leerExplicacion(page) {
  for (let intento = 0; intento < 5; intento += 1) {
    const text = (await page.locator('#explanation').innerText().catch(() => '')).trim();
    if (text) return text;
    await page.waitForTimeout(60);
  }
  return '';
}

/* Lo mismo para el botón de avanzar: si la ronda se resuelve un poco
   después del clic, sin esta espera la sonda cierra la ronda antes de
   tiempo y cree que no se pudo jugar. */
async function esperarAvance(page) {
  for (let intento = 0; intento < 5; intento += 1) {
    if (await visible(page, '#btnNext:not(.hidden)')) return true;
    if (await visible(page, '#screenEnd:not(.hidden)')) return false;
    await page.waitForTimeout(60);
  }
  return visible(page, '#btnNext:not(.hidden)');
}

/* Con CHECK_PISTAS_DEBUG=1 se imprime por qué una actividad no dio fallos:
   si el recorrido no entra, no se ve, o si entra y no falla. Sin esto, "0
   fallos vistos" mezcla tres cosas distintas y no dice cuál. */
const DEBUG = process.env.CHECK_PISTAS_DEBUG === '1';
const dbg = (...args) => { if (DEBUG) console.log('    ·', ...args); };

async function tap(page, locator) {
  try {
    await locator.click({ timeout: 1500, force: true });
    return true;
  } catch { return false; }
}

/* Click through whatever screens come until the options are on screen.
   Brute force on purpose: this probe must work on activities whose
   navigation nobody has documented. The three that were unreachable get
   their documented way in instead of the blind walk, which is exactly
   the difference between "cannot start" and "this walk does not know
   how to start it". */
async function reachGame(page, base, slug) {
  const start = STARTS[slug];
  if (start) {
    dbg(slug + ': ¿' + start.button + '? ->', await visible(page, start.button));
    if (!await visible(page, start.button)) return false;
    if (!await tap(page, page.locator(start.button).first())) { dbg(slug + ': el botón no se pudo pulsar'); return false; }
    await page.waitForTimeout(200);
    const n = await page.locator(start.options).count();
    dbg(slug + ': dentro del test, ' + n + ' elemento(s) con ' + start.options);
    return Boolean(n);
  }
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

/* Play the round answering badly, and note every hint it shows.

   Lo que se lee es SI HA CAMBIADO EL TEXTO DE #explanation, no la clase
   del botón. Patterns rehace #options entero tras cada clic, así que la
   marca "encourage" que pone al fallar ya no existe cuando se la mira: una
   sonda que decide por la clase ve cero fallos en una actividad que sí los
   está dando. El texto no miente y además dice QUÉ está mostrando. */
async function collectHints(page, questions, opts) {
  const optionsSel = (opts && opts.options) || '#options .option-btn';
  const accepted = (opts && opts.accepted) || 'correct';
  const sigue = Boolean(opts && opts.sigue);
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
    const options = page.locator(optionsSel);
    const total = await options.count();
    dbg('pregunta ' + q + ': ' + total + ' en ' + optionsSel);
    if (!total) break;
    /* Una misma pista puede volver en la misma pregunta si se insiste; se
       cuenta una vez y el recuento dice "distintas". */
    const vistas = new Set();
    for (let i = 0; i < total; i += 1) {
      const button = options.nth(i);
      if (!(await button.isVisible().catch(() => false))) { dbg('  [' + i + '] no visible'); continue; }
      if (!(await tap(page, button))) { dbg('  [' + i + '] no se pudo pulsar'); continue; }
      const text = await leerExplicacion(page);
      dbg('  [' + i + '] explicación="' + text.slice(0, 60) + '"');
      if (text && !vistas.has(text)) {
        vistas.add(text);
        /* Con el segundo fallo la actividad ya enseña la respuesta
           ("❌ Mira: la respuesta correcta es…"). Eso es la explicación,
           no la pista, y aquí no se mide. */
        if (!/^[✅❌]/.test(text)) hints.push(text);
      }
      /* El «Entendido» es la señal de verdad de que la interfaz está
         bloqueada; la clase del botón no lo es, porque rehacerse la borra. */
      const ack = page.locator('#explanationWrap .btn-understood');
      if (await ack.count() && await ack.first().isVisible().catch(() => false)) await tap(page, ack.first());
      /* Un fallo no termina la pregunta: se sigue probando hasta dar con
         la buena, y así la ronda avanza y se ve más de un tipo de pista. */
      const clase = await button.evaluate((n, ok) => n.classList.contains(ok), accepted).catch(() => false);
      if (clase && !sigue) break;
    }
    const next = page.locator('#btnNext');
    if (await esperarAvance(page)) await tap(page, next);
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
        hints.push(...await collectHints(page, 6, STARTS[slug]));
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

    /* «hint» es la genérica y «pista» su nombre en estas tres; «explanation»
       es lo que sale en el segundo fallo, que ya no es una pista. */
    const genericas = await page.evaluate(() => ['hint', 'pista', 'explanation']
      .map(k => { try { return window.App.i18n.t(k); } catch { return null; } })
      .filter(Boolean)).catch(() => []);
    const propias = hints.filter(h => h && !genericas.includes(h));
    const iguales = genericas.filter(g => hints.includes(g));
    /* La misma pista puede volver cinco preguntas seguidas —en unas
       cuantas actividades da igual el tipo de pregunta—. Listarla cinco
       veces no informa de nada, así que se cuenta y se enseña una vez. */
    const distintas = [...new Set(propias)];
    const veces = new Map();
    hints.forEach(h => veces.set(h, (veces.get(h) || 0) + 1));

    console.log('\n' + slug + ': ' + hints.length + ' fallo(s) visto(s), ' +
      distintas.length + ' pista(s) propia(s)  [' + landed + ']');
    distintas.forEach(h => console.log('   · (' + (veces.get(h) || 1) + '×) ' + h));
    if (!hints.length) {
      problems.push(botones === 0
        ? slug + ': no se puede empezar. La pantalla de inicio (' + landed +
          ') no tiene ni un botón, así que no se llega nunca al test.'
        : slug + ': no se llegó a fallar ninguna pregunta (se quedó en ' + landed + ')');
    }
    iguales.forEach(g => problems.push(slug + ': vuelve la frase genérica "' + g + '"'));
    /* Una pista puede ser genérica sin ser la clave de reserva. Clock
       tenía readHint = "Prueba otra vez. Mira el reloj con calma", que no
       es el `hint` de nadie: comparar por clave no la cazaba. Aquí se
       huele el "prueba otra vez" de la frase, y sólo se perdona cuando el
       texto es literalmente la reserva de la actividad.
       Riddles es la excepción que no es una excusa: su pista pega la
       adivinanza entre comillas ("Vuelve a leer la pista: "…""), así que
       trae el "prueba otra vez" nombrando la pregunta, que es justo lo
       que la puerta exige. Las comillas son la señal, no una lista de
      (indultados a la que se pueda añadir sin que nadie lo mire. */
    hints.filter(h => h && !genericas.includes(h) && !/["“”«»]/.test(h) &&
      /prueba otra vez|try again/i.test(h))
      .forEach(h => problems.push(slug + ': pista genérica bajo OTRA clave — "' + h + '"'));
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
