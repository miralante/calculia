/* One-off probe: los conceptos de Formas y los dibujos que los enseñan.
   Ni check.js ni el smoke miran el aspecto, y aquí hay cuatro marcas
   nuevas dibujadas a medida (el rayado del área, la caja del volumen, el
   eje de simetría y las mini-figuras de las opciones). Tres cosas que solo
   se ven midiendo el estilo COMPUTADO:
   1. Las marcas son objetos gráficos, así que les vale el 3:1 de WCAG
      1.4.11, no el 7:1 del texto. Cada marca se compara contra lo que
      tiene DEBAJO, que no siempre es lo mismo: el eje de simetría cruza
      la figura y sale de ella, o sea que se lee sobre dos fondos.
   2. La nota de la vida real es texto pequeño: 7:1.
   3. Cuatro diapositivas de tarjetas en una rejilla de dos columnas: una
      aclaración larga abre scroll horizontal en 320px.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g> node scripts/one-off/probe-forma-conceptos.js
   Imprime una tabla por tema y deja capturas en
   test-results/forma-conceptos/. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'test-results', 'forma-conceptos');
const THEMES = ['light', 'dark', 'contrast'];
const WIDTHS = [320, 375, 768, 1280];
const NON_TEXT = 3;
const AAA = 7;

/* What each concept slide has to show, and what it has to be read against.
   `onShape` is the fill of the first polygon of the mark's own svg, which
   is the figure the mark is drawn on; `onCard` is the page behind it. A
   mark that only ever sits on the card has no onShape worth checking. */
const SLIDES = [
  { titles: ['Forma plana', 'Cuerpo'], kind: 'compare' },
  { titles: ['Lado', 'Vértice', 'Perímetro'], kind: 'parts', wide: 1,
    marks: { '.intro-perimeter-mark': 'onShape' } },
  { titles: ['Área', 'Volumen'], kind: 'parts',
    marks: { '.area-hatch line': 'onShape', '.intro-space-mark': 'onCard' } },
  { titles: ['Simetría', 'Semejanza'], kind: 'parts',
    marks: { '.intro-axis-mark': 'onShape' } },
];

const MARK_SELECTORS = SLIDES.reduce((all, slide) =>
  all.concat(Object.keys(slide.marks || {})), []);

const QUESTIONS = [
  { id: 'area-inside', distinctSizes: false },
  { id: 'volume-cube', distinctSizes: true },
  { id: 'symmetry-pentagon', distinctSizes: false },
  { id: 'similar-pentagon', distinctSizes: false },
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, url);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* Runs inside the page. The selectors come in as an argument: this function
   is serialised and evaluated in the browser, where anything defined out
   here in Node simply does not exist. Referencing a constant of this file
   from in here fails as a bare ReferenceError, which reads like the page is
   broken when it is the probe. */
function measure(markSelectors) {
  const channel = value => {
    const match = String(value).match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(',').map(part => parseFloat(part));
    return parts.length < 4 || parts[3] > 0 ? parts : null;
  };
  const luminance = rgb => {
    const [r, g, b] = rgb.map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (fg, bg) => {
    const a = luminance(fg);
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const background = node => {
    for (let el = node; el; el = el.parentElement) {
      const bg = channel(getComputedStyle(el).backgroundColor);
      if (bg) return bg;
    }
    return [255, 255, 255];
  };
  const read = selector => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const ink = channel(getComputedStyle(node).stroke) ||
      channel(getComputedStyle(node).fill);
    if (!ink) return null;
    const svg = node.closest('svg');
    /* Not the first polygon of the svg: the area card opens with the
       polygon of its clipPath, which is never painted, so measuring
       against it reported the hatch as 1:1 on a black fill when it was
       really reading the body of the figure. */
    const polygon = svg && Array.from(svg.querySelectorAll('polygon'))
      .find(p => !p.closest('clipPath'));
    const fill = polygon ? channel(getComputedStyle(polygon).fill) : null;
    const out = { onCard: +contrast(ink, background(node.parentElement)).toFixed(2) };
    if (fill) out.onShape = +contrast(ink, fill).toFixed(2);
    return out;
  };
  const cards = Array.from(document.querySelectorAll('#galleryVisual .shape-part-item'));
  /* Eager, not a getter: page.evaluate serialises what the function
     returns, and a getter is not one of its own properties — it came back
     as undefined and took the whole probe down. Only the marks of the slide
     on screen exist in the DOM, so the rest simply do not resolve. */
  const marks = {};
  markSelectors.forEach(selector => {
    const measured = read(selector);
    if (measured) marks[selector] = measured;
  });
  return {
    compare: Array.from(
      document.querySelectorAll('#galleryVisual .shape-compare-item h2')
    ).map(n => n.textContent.trim()),
    titles: cards.map(card => card.querySelector('h2').textContent.trim()),
    wide: cards.filter(card => card.classList.contains('shape-part-wide')).length,
    noteRatio: (() => {
      const node = document.querySelector('#realNote');
      if (!node) return null;
      const color = channel(getComputedStyle(node).color);
      return color ? +contrast(color, background(node)).toFixed(2) : null;
    })(),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    marks: marks,
  };
}

async function run() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(OUT, { recursive: true });
  let failures = 0;
  const shots = [];

  const check = (label, value, min) => {
    const bad = value === null || value < min;
    if (bad) failures += 1;
    console.log('  ' + (bad ? '!! ' : '   ') + label + ': ' +
      (value === null ? 'no se mide' : value + ':1') + ' (mínimo ' + min + ':1)');
  };

  for (const theme of THEMES) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const open = async () => {
      await page.goto('http://127.0.0.1:' + port + '/tools/shapes/index.html');
      await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
      await page.reload();
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      await page.waitForSelector('#screenIntro:not(.hidden)');
    };
    await open();
    console.log('\n== ' + theme + ' ==');

    for (let slide = 0; slide < SLIDES.length; slide += 1) {
      const row = await page.evaluate(measure, MARK_SELECTORS);
      const expected = SLIDES[slide];
      console.log('  ' + (slide + 1) + '. ' +
        (expected.kind === 'compare' ? row.compare.join(' | ') : row.titles.join(' | ')));
      const shown = expected.kind === 'compare' ? row.compare : row.titles;
      if (shown.join('|') !== expected.titles.join('|')) {
        failures += 1;
        console.log('  !! la diapositiva no presenta lo que debe');
      }
      if (expected.wide && row.wide !== expected.wide) {
        failures += 1;
        console.log('  !! la tarjeta que debe ocupar la fila entera no la ocupa (' +
          row.wide + ' de ' + expected.wide + ')');
      }
      Object.keys(expected.marks || {}).forEach(selector => {
        const where = expected.marks[selector];
        const measured = row.marks[selector];
        if (!measured) {
          failures += 1;
          console.log('  !! falta la marca ' + selector);
          return;
        }
        if (where === 'onCard') check(selector + ' sobre la tarjeta', measured.onCard, NON_TEXT);
        if (where === 'onShape') check(selector + ' sobre la figura', measured.onShape, NON_TEXT);
        if (where === 'both') {
          check(selector + ' sobre la figura', measured.onShape, NON_TEXT);
          check(selector + ' fuera de la figura', measured.onCard, NON_TEXT);
        }
      });
      const overflows = [];
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        const over = await page.evaluate(() =>
          document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (over > 0) { overflows.push(width + 'px=' + over); failures += 1; }
      }
      console.log('   desbordamiento: ' + (overflows.length ? '!! ' + overflows.join(', ') : 'ninguno'));
      await page.setViewportSize({ width: 1280, height: 900 });
      shots.push({
        label: theme + ' · ' + expected.titles.join(' + '),
        data: (await page.locator('#screenIntro .gallery-card').screenshot()).toString('base64')
      });
      await page.locator('#galleryNext').click();
    }

    /* The everyday carousel: the note now says something different on a
       flat shape and on a solid, and both have to reach 7:1. */
    await page.locator('#introContinue').click();
    await page.locator('#realNext').click();
    let row = await page.evaluate(measure, MARK_SELECTORS);
    check('nota de la vida real (figura)', row.noteRatio, AAA);
    shots.push({
      label: theme + ' · vida real (figura)',
      data: (await page.locator('#screenReal .real-card').screenshot()).toString('base64')
    });
    const solidIndex = await page.evaluate(() =>
      window.DATA.gallery.findIndex(item => item.type === 'solid'));
    for (let step = 1; step < solidIndex; step += 1) await page.locator('#realNext').click();
    row = await page.evaluate(measure, MARK_SELECTORS);
    check('nota de la vida real (cuerpo)', row.noteRatio, AAA);
    shots.push({
      label: theme + ' · vida real (cuerpo)',
      data: (await page.locator('#screenReal .real-card').screenshot()).toString('base64')
    });

    /* One new question at a time. The round is cut down to that single
       question so the probe lands on it without walking all fifty — and
       the cut has to survive the reload, so it is made after the last one
       and not before it. */
    for (const question of QUESTIONS) {
      await open();
      await page.evaluate(qid => {
        const level = window.DATA.activities.formas.levels[0];
        level.questions = level.questions.filter(q => q.id === qid);
      }, question.id);
      await page.locator('#introContinue').click();
      await page.locator('#realContinue').click();
      await page.locator('#activitiesMenu .btn-actividad').click();
      await page.waitForSelector('#options .option-btn');
      const q = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('#options .option-btn'));
        return {
          prompt: document.querySelector('#prompt').textContent.trim(),
          options: buttons.length,
          sizes: buttons.map(b => {
            const svg = b.querySelector('svg');
            return svg ? Math.round(svg.getBoundingClientRect().width) : null;
          }),
          heights: buttons.map(b => Math.round(b.getBoundingClientRect().height)),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      const drawn = q.sizes.filter(s => s !== null);
      console.log('  ' + question.id + ': ' + q.options + ' opciones [' +
        q.sizes.join(', ') + '], botones ' + q.heights.join('/') + 'px');
      if (q.options !== 3) {
        failures += 1;
        console.log('  !! la pregunta no ofrece tres opciones');
      }
      if (q.overflow > 0) {
        failures += 1;
        console.log('  !! la pregunta desborda ' + q.overflow + 'px');
      }
      if (q.heights.some(h => h < 44)) {
        failures += 1;
        console.log('  !! alguna opción se queda por debajo del mínimo táctil');
      }
      /* The volume question has to show exactly one body clearly bigger and
         the similarity question all three the same size. Otherwise the
         answer could be told by size, and it would be a different question
         from the one being asked. The area question has text options and no
         drawings at all, so sizes do not apply to it. */
      if (question.id === 'area-inside') {
        if (drawn.length) {
          failures += 1;
          console.log('  !! las opciones del área deberían ser texto, no dibujos');
        }
      } else if (question.distinctSizes && new Set(drawn).size !== 2) {
        failures += 1;
        console.log('  !! la pregunta de volumen no separa un cuerpo grande de los otros');
      } else if (!question.distinctSizes && new Set(drawn).size !== 1) {
        failures += 1;
        console.log('  !! las opciones no son todas del mismo tamaño');
      }
      shots.push({
        label: theme + ' · ' + question.id,
        data: (await page.locator('#screenGame').screenshot()).toString('base64')
      });
    }
    await page.close();
  }

  const sheet = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const cells = shots.map(shot =>
    '<figure style="margin:0;display:flex;flex-direction:column;gap:6px;align-items:center">' +
    '<img src="data:image/png;base64,' + shot.data + '" style="width:330px;border:1px solid #888">' +
    '<figcaption style="font:600 13px system-ui">' + shot.label + '</figcaption></figure>'
  ).join('');
  await sheet.setContent(
    '<body style="margin:0;padding:14px;background:#fff">' +
    '<div style="display:grid;grid-template-columns:repeat(2,max-content);gap:16px">' +
    cells + '</div></body>'
  );
  const file = path.join(OUT, 'conceptos.png');
  await sheet.screenshot({ path: file, fullPage: true });
  console.log('\n  -> ' + file);

  await browser.close();
  /* closeAllConnections and unref, because a server that answered a dozen
     pages keeps the sockets alive and server.close() would wait for them
     forever: the probe looks hung after it has already finished and written
     its screenshots. */
  if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
  server.unref();
  console.log(failures ? '\nFALLOS: ' + failures : '\nTodo correcto');
  if (failures) process.exitCode = 1;
}

run().catch(error => { console.error(error); process.exitCode = 1; });