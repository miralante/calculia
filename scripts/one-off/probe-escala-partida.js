#!/usr/bin/env node
/* ============================================================
   probe-escala-partida.js — one-off
   ui-smoke recorre /tools/scale/ y lo da por bueno con 6 controles
   y CERO recorridos funcionales: comprueba que la pagina carga, no
   que se pueda jugar. Este probe juega de verdad las nueve rondas
   de los nueve niveles y mira tres cosas que un smoke de estructura
   no puede ver:

   1. Que la respuesta que se busca sale de la ETIQUETA de
      accesibilidad del dibujo, no de una cuenta hecha aparte. Si la
      etiqueta dijera una marca y el dibujo otra, la pregunta que se
      lee en voz alta no seria la que se responde.
   2. Que el dibujo corresponde a los numeros del nivel: una rayita
      por unidad, mas la rayita marcada que se dibuja aparte. Un
      dibujo que se sale del recuento es un dibujo que enseña otra
      escala.
   3. Que hay exactamente UNA opcion correcta por pregunta. Cuatro
      botones donde dos valen, o donde ninguno, no es una pregunta.

   Uso: node scripts/one-off/probe-escala-partida.js
   ============================================================ */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const NAV = 15000;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2'
};

/* Los nueve niveles, en el orden de DATA.activities y el orden de
   sus levels. `rounds` son las rondas ya completadas de esa
   actividad: es lo que decide el nivel (levelFromProgress), asi que
   fijandolo se prueban los nueve sin tener que ganar nueve veces. */
const LEVELS = [
  { act: 0, actId: 'leer', name: 'leer', rounds: 0, kind: 'ruler', ticks: 10, label: 'l1' },
  { act: 0, actId: 'leer', name: 'leer', rounds: 1, kind: 'ruler', ticks: 10, label: 'l2' },
  { act: 0, actId: 'leer', name: 'leer', rounds: 2, kind: 'ruler', ticks: 20, label: 'l3' },
  { act: 1, actId: 'paso', name: 'paso', rounds: 0, kind: 'span', label: 'p1' },
  { act: 1, actId: 'paso', name: 'paso', rounds: 1, kind: 'object', label: 'p2' },
  { act: 2, actId: 'instrumento', name: 'instrumento', rounds: 0, kind: 'gauge', ticks: 8, label: 't1' },
  { act: 2, actId: 'instrumento', name: 'instrumento', rounds: 1, kind: 'gauge', ticks: 10, label: 't2' },
  { act: 3, actId: 'plano', name: 'plano', rounds: 0, kind: 'plan', label: 'd1' },
  { act: 3, actId: 'plano', name: 'plano', rounds: 1, kind: 'plan', label: 'd2' }
];

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
    catch { res.writeHead(400); res.end('bad'); return; }
    let file = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
    if (pathname === '/') file = path.join(ROOT, 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('no'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* The number the round is asking for, read out of the accessibility
   label of the drawing. Returns null for a shape the probe does not
   know how to read, so an unknown question fails loudly instead of
   silently passing.

   `spec` decides how to interpret the plan label. Its two levels both
   put exactly two numbers in the label (the key, and then either the
   centimetres on the plan or the metres in real life), so the two
   have to be told apart by which level they are and not by the
   wording of the sentence: reading the wording would only work in one
   language, and the point here is the arithmetic, not the prose. */
function expectedFromAria(aria, spec) {
  const kind = spec.kind;
  const nums = (aria.match(/\d+/g) || []).map(Number);
  if (kind === 'ruler' || kind === 'gauge') return nums[0];          /* la marca alcanzada */
  if (kind === 'span') {
    assert.equal(nums.length, 3, 'La etiqueta de un tramo no lleva los tres numeros: ' + aria);
    const gaps = nums[0];
    const from = nums[1];
    const to = nums[2];
    return (to - from) / gaps;
  }
  if (kind === 'object') {
    assert.equal(nums.length, 2, 'La etiqueta de un recorrido no lleva los dos numeros: ' + aria);
    return nums[1] - nums[0];
  }
  if (kind === 'plan') {
    assert.equal(nums.length, 2, 'La etiqueta del plano no lleva key y medida: ' + aria);
    /* d1: key y centimetros del plano, y el producto son los metros. */
    if (spec.label === 'd1') return nums[0] * nums[1];
    /* d2: key y metros de verdad, y el cociente son los centimetros. */
    return nums[1] / nums[0];
  }
  return null;
}

async function playRound(page, spec, log) {
  /* Save the round, click through intro -> real -> menu, and choose the
     activity. Progress is written first so the level is the one asked
     for and not the one the level ramp would pick. */
  await page.evaluate(({ actId, rounds }) => {
    localStorage.setItem('calculia:scale', JSON.stringify({
      stars: 0, completedRounds: rounds,
      roundsByActivity: { [actId]: rounds }
    }));
  }, { actId: spec.actId, rounds: spec.rounds });
  await page.reload();

  await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV });
  /* The four ideas must be there before anything is asked, and each
     one must come with a drawing. */
  for (let i = 0; i < 4; i += 1) {
    assert.ok((await page.locator('#conceptTitle').innerText()).trim().length > 0,
      'Una diapositiva de concepto se queda sin titulo');
    assert.ok((await page.locator('#conceptText').innerText()).trim().length > 0,
      'Una diapositiva de concepto se queda sin explicacion');
    assert.ok(await page.locator('#conceptVisual svg').count() > 0,
      'Una diapositiva de concepto se queda sin dibujo');
    await page.locator('#conceptNext').click();
  }
  await page.locator('#introContinue').click();
  await page.waitForSelector('#screenReal:not(.hidden)', { timeout: NAV });
  assert.ok((await page.locator('#realObject').innerText()).trim().length > 0,
    'La pantalla de vida real se queda sin objeto');
  await page.locator('#realContinue').click();
  await page.waitForSelector('#screenMenu:not(.hidden)', { timeout: NAV });

  const btns = page.locator('#activitiesMenu .btn-actividad');
  assert.equal(await btns.count(), 4, 'El menu deberia tener una entrada por actividad');
  assert.ok((await btns.nth(spec.act).innerText()).toLowerCase().includes(spec.name.toLowerCase()),
    'El boton del menu no lleva el nombre de la actividad');
  await btns.nth(spec.act).click();
  await page.waitForSelector('#screenGame:not(.hidden)', { timeout: NAV });

  let answered = 0;
  /* Six questions per round, plus whatever the reinforcement mini-round
     replays. Capped so a bug cannot spin forever. */
  for (let q = 0; q < 24; q += 1) {
    if (await page.locator('#screenEnd:not(.hidden)').count()) break;

    const prompt = (await page.locator('#prompt').innerText()).trim();
    assert.ok(prompt.length > 0, 'Una pregunta se queda sin enunciado');

    const role = await page.locator('#visual').getAttribute('role');
    const aria = await page.locator('#visual').getAttribute('aria-label') || '';
    assert.equal(role, 'img', 'El dibujo deberia llevar role="img" para que se anuncie');
    assert.ok(aria.length > 0, 'El dibujo deberia llevar aria-label: sin el, no se puede leer');

    /* --- the drawing must match the level --- */
    const counts = await page.evaluate(() => {
      const n = s => document.querySelectorAll('#visual ' + s).length;
      return {
        rulerTick: n('.ruler-tick'), here: n('.ruler-tick-here'), face: n('.ruler-face'),
        pencil: n('.pencil-body'), gaugeTick: n('.gauge-tick'),
        gaugeHere: n('.gauge-tick-here'), tube: n('.gauge-tube'), level: n('.gauge-level'),
        handle: n('.gauge-handle'), spanTick: n('.span-tick'), spanEnd: n('.span-tick-end'),
        spanObject: n('.span-object'), guide: n('.span-guide'), bar: n('.plan-bar'),
        seg: n('.plan-seg'), route: n('.plan-route'), dot: n('.plan-dot')
      };
    });
    /* El "exactly one" solo aplica a los niveles que SI preguntan por una
   marca: leer e instrumento, donde la marca alcanzada se dibuja aparte
   para que resalte. En paso y plano no hay una marca preguntada —la
   pregunta es por el paso o por la conversion—, y exigirla sería
   inventar una expectativa que el nivel no tiene. */
    if (spec.kind === 'ruler') {
      assert.equal(counts.here, 1, 'La regla debe marcar una sola rayita, la que se pregunta');
      assert.equal(counts.face, 1, 'La regla debe dibujar su cuerpo una vez');
      assert.equal(counts.pencil, 1, 'La regla debe dibujar el lapiz una vez');
      assert.equal(counts.rulerTick + counts.here, spec.ticks + 1,
        'La regla no lleva una rayita por unidad del nivel');
    } else if (spec.kind === 'gauge') {
      assert.equal(counts.gaugeHere, 1, 'El instrumento debe marcar una sola rayita, la que se pregunta');
      assert.equal(counts.tube, 1, 'El instrumento debe dibujar su tubo una vez');
      assert.equal(counts.level, 1, 'El instrumento debe dibujar el nivel una vez');
      assert.equal(counts.gaugeTick + counts.gaugeHere, spec.ticks + 1,
        'El instrumento no lleva una rayita por unidad del nivel');
      /* Solo el segundo nivel es la jarra, y la jarra es la que lleva
         asa: si aparece en t1, los dos instrumentos son el mismo. */
      if (spec.label === 't1') assert.equal(counts.handle, 0, 'El termometro no deberia tener asa');
      else assert.equal(counts.handle, 1, 'La jarra deberia dibujarse con asa');
    } else if (spec.kind === 'span') {
      assert.ok(counts.spanTick >= 2 && counts.spanEnd === 2,
        'Un tramo debe dibujar sus rayitas y marcar los dos extremos');
    } else if (spec.kind === 'object') {
      assert.equal(counts.spanObject, 1, 'El recorrido debe dibujar el lapiz una vez');
      assert.equal(counts.guide, 2, 'El recorrido debe unir los dos numeros con guias');
    } else if (spec.kind === 'plan') {
      assert.equal(counts.bar, 1, 'El plano debe dibujar la barra de escala una vez');
      assert.equal(counts.seg, 4, 'La barra de escala debe llevar cuatro tramos de un centimetro');
      assert.equal(counts.route, 1, 'El plano debe dibujar el camino una vez');
      assert.equal(counts.dot, 2, 'El camino debe marcar sus dos extremos');
    }

    /* --- the answer, read out of the label --- */
    const expected = expectedFromAria(aria, spec);
    assert.ok(expected !== null && expected > 0,
      'No se ha podido leer la respuesta de la etiqueta: ' + aria);

    const opts = page.locator('#options .option-btn');
    const texts = (await opts.allInnerTexts()).map(t => t.trim());
    assert.equal(texts.length, 4, 'Cada pregunta deberia tener cuatro opciones');
    assert.equal(new Set(texts).size, 4,
      'Dos opciones dicen lo mismo: ' + JSON.stringify(texts));

    const wanted = texts.findIndex(t => parseInt(t, 10) === expected);
    assert.ok(wanted !== -1,
      'Ninguna de las cuatro opciones es la que dice el dibujo (' + expected + '): ' + JSON.stringify(texts));
    await opts.nth(wanted).click();

    if (!(await page.locator('#btnNext:not(.hidden)').count())) {
      /* The answer in the label is NOT the one the round accepts: the
         label and the question have drifted apart. */
      const got = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('#options .option-btn'))
          .find(x => x.classList.contains('correct'));
        return b ? b.textContent.trim() : null;
      });
      assert.fail('La etiqueta anuncia ' + expected + ' pero la ronda acepta ' + got +
        ' — etiqueta y dibujo no cuentan lo mismo (' + aria + ')');
    }
    answered += 1;
    await page.locator('#btnNext').click();
  }

  await page.waitForSelector('#screenEnd:not(.hidden)', { timeout: NAV });
  assert.equal(answered, 6, 'Una ronda completa deberian ser seis preguntas, no ' + answered);
  const summary = await page.locator('#endSummary').innerText();
  assert.ok(summary.includes(String(answered)),
    'El resumen no cuenta las preguntas acertadas: ' + summary);
  assert.ok(await page.locator('#btnRepeat').isVisible(), 'Falta el boton de repetir');
  log('  ' + spec.label.padEnd(3) + ' ' + spec.actId.padEnd(12) + ' OK (6/6, dibujo y etiqueta coinciden)');
}

/* data.js declares a bare `var DATA`, not a module export, so require()
   hands back an empty object. scripts/check.js already reads these
   files through a vm sandbox for the same reason; do the same here
   rather than change data.js to suit a probe. */
function readDataJs() {
  const vm = require('node:vm');
  const file = path.join(ROOT, 'tools', 'scale', 'data.js');
  const sandbox = { window: {} };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  assert.ok(sandbox.DATA, 'data.js no ha dejado ninguna DATA en el sandbox');
  return sandbox.DATA;
}

(async () => {
  /* The invariant data.js claims about itself: for every plan, each
     distance in real life is exactly the key times its centimetres, and
     both lists are the same length. This is the check that was missing
     when a real-life distance crossed over from one plan to another and
     came out as 0.08 cm — a value no plan can print. */
  const DATA = readDataJs();
  for (const plano of DATA.planos) {
    assert.equal(plano.real.length, plano.cm.length,
      'Las listas cm y real del plano ' + plano.key + plano.unit + ' no miden lo mismo');
    plano.real.forEach((real, i) => {
      assert.equal(real, plano.cm[i] * plano.key,
        'En el plano ' + plano.key + plano.unit + ', ' + plano.cm[i] +
        ' cm no son ' + real + ' ' + plano.unit);
      assert.equal(real % plano.key, 0,
        'En el plano ' + plano.key + plano.unit + ', ' + real +
        ' no sale en centímetros enteros: daría una fracción de centímetro');
    });
  }
  assert.ok(DATA.planos.every(p => p.cm.every(c => c > 0 && c <= 4)),
    'La barra de escala tiene cuatro tramos: un tramo de más de 4 cm no se pinta');

  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  const log = s => console.log(s);
  try {
    await page.goto(base + '/');
    await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));

    /* The card has to be reachable from the landing, right after
       Formas — that is the whole point of putting it there. */
    await page.reload();
    const cards = page.locator('.grid-cards a.card');
    assert.ok((await cards.count()) >= 3, 'La portada deberia llevar la tarjeta de Escala');
    assert.equal(await cards.nth(1).getAttribute('href'), 'tools/shapes/');
    assert.equal(await cards.nth(2).getAttribute('href'), 'tools/scale/',
      'La tarjeta de Escala deberia ir justo despues de Formas');
    assert.ok((await cards.nth(2).innerText()).includes('Escala'),
      'La tarjeta de Escala no muestra su nombre');

    /* And it has to still be in the full catalogue. */
    await page.goto(base + '/dev/');
    await page.waitForSelector('a[href="../tools/scale/"]', { timeout: NAV });
    log('  portada y dev/ enlazan a tools/scale/');

    console.log('\ntools/scale — las nueve rondas, en movil 375x667\n');
    for (const spec of LEVELS) {
      await page.goto(base + '/tools/scale/');
      await playRound(page, spec, log);
    }

    /* Same round in English: the question and the label have to exist
       in both languages, not just the menu. */
    await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
    await page.goto(base + '/tools/scale/');
    await page.reload();
    await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV });
    const enTitle = await page.locator('#conceptTitle').innerText();
    assert.ok(enTitle.includes('scale'), 'El titulo en ingles no se ha traducido: ' + enTitle);
    await page.locator('#introContinue').click();
    await page.locator('#realContinue').click();
    await page.locator('#activitiesMenu .btn-actividad').first().click();
    await page.waitForSelector('#screenGame:not(.hidden)', { timeout: NAV });
    const enPrompt = await page.locator('#prompt').innerText();
    assert.ok(enPrompt.length > 0, 'La pregunta no aparece en ingles');
    assert.ok(await page.locator('#visual svg').count() > 0, 'El dibujo no aparece en ingles');
    log('  en  las preguntas tambien se pintan');

    console.log('\nOK: 9 rondas jugadas, dibujo = etiqueta = respuesta, ES y EN.');
  } finally {
    await browser.close();
    server.close();
  }
})().catch(err => { console.error('\nFALLO: ' + err.message); process.exit(1); });