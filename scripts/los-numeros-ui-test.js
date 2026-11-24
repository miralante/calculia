'use strict';

/* Browser test for tools/los-numeros ("Tipos de Números"), the gallery of ten
   slides. Drives the real page with Chromium through Playwright: walks every
   slide with the arrows, checks what each card shows in Spanish and in English,
   finishes the activity once, and checks the layout at phone and desktop widths.
   Run with: npm run test:los-numeros-ui
   The content and wiring are checked without a browser by los-numeros-test.js. */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const PAGE = '/tools/los-numeros/index.html';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
};
const WIDTHS = [320, 375, 768, 1280];

/* The lesson as a person reads it. Real-life cards list their examples;
   type cards list their traits and a drawing; comparisons have a drawing only. */
const LESSON = [
  { kind: 'expo', title: ['Naturales', 'Natural'],
    traits: [['Nunca son negativos', 'No tienen decimales'], ['Never negative', 'No decimals']] },
  { kind: 'real', title: ['Naturales', 'Natural'],
    examples: [['3 manzanas', '5 dedos', '10 años'], ['3 apples', '5 fingers', '10 years']] },
  { kind: 'expo', title: ['Enteros', 'Integers'],
    traits: [['Pueden ser negativos', 'El 0 separa los negativos de los positivos', 'No tienen decimales'],
      ['They can be negative', 'Zero separates negative from positive numbers', 'No decimals']] },
  { kind: 'real', title: ['Enteros', 'Integers'],
    examples: [['−5 °C', 'sótano −1', '3 plantas'], ['−5 °C', 'basement −1', '3 floors']] },
  { kind: 'expo', title: ['Fracciones', 'Fractions'],
    traits: [['Las partes que tienes sobre cuántas partes iguales se divide'],
      ['The parts you have over how many equal parts it is divided into']] },
  { kind: 'real', title: ['Fracciones', 'Fractions'],
    examples: [['1/4 pizza', '1/4 de hora'], ['1/4 pizza', '1/4 hour']] },
  { kind: 'expo', title: ['Decimales', 'Decimals'],
    traits: [['Tienen una coma (,)', 'Lo que va después de la coma vale menos de 1'],
      ['They have a decimal point (.)', 'What comes after the point is less than 1']] },
  { kind: 'real', title: ['Decimales', 'Decimals'],
    examples: [['1,99 €', '1,5 m', '3,14'], ['$1.99', '1.5 m', '3.14']] },
  { kind: 'compare', title: ['Naturales y Enteros', 'Natural and Integers'] },
  { kind: 'compare', title: ['Naturales y Decimales', 'Natural and Decimals'] },
];
const TOTAL = LESSON.length;
/* Numbers on the drawings follow the language: a comma in Spanish, a point in English. */
const DRAWN_NUMBERS = {
  es: { integers: '−3', decimals: '0,5' },
  en: { integers: '−3', decimals: '0.5' },
};
const INTEGERS_DRAWING = 2;
const DECIMALS_DRAWING = 6;
const LOCALE_INDEX = { es: 0, en: 1 };
const CLOCK_LOCALE = { es: 'es-ES', en: 'en-US' };

function startServer() {
  const server = http.createServer((request, response) => {
    const urlPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.join(ROOT, urlPath.endsWith('/') ? urlPath + 'index.html' : urlPath);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/* A fresh browser context in one language. The language is stored the way the
   suite stores it, so the page starts in it. */
async function openGallery(browser, base, locale) {
  const context = await browser.newContext({ locale: CLOCK_LOCALE[locale] });
  await context.addInitScript(lang => {
    try { localStorage.setItem('calculia:locale', lang); } catch (e) { /* private window */ }
  }, locale);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + PAGE);
  await page.waitForSelector('#slideTitle:not(:empty)');
  return { context, page, errors };
}

/* What the card shows right now: texts, pictures and which parts are visible. */
async function readCard(page) {
  const visible = id => page.locator(id).isVisible();
  return {
    title: await page.textContent('#slideTitle'),
    progress: await page.getAttribute('#slideProgress', 'aria-label'),
    eyebrow: await visible('#slideEyebrow'),
    visual: await visible('#slideVisual'),
    visualText: await page.textContent('#slideVisual'),
    visualHasDrawing: await page.locator('#slideVisual svg').count() > 0,
    traits: await visible('#slideTraits') ? await page.$$eval('#slideTraits li', els => els.map(e => e.textContent)) : [],
    examples: await visible('#slideReal') ? await page.$$eval('#slideReal li .ex-text', els => els.map(e => e.textContent)) : [],
    examplePictures: await page.$$eval('#slideReal li .ex-pic svg', els => els.length),
    arrows: await visible('#slideControls'),
    finish: await visible('#slideFinish'),
    restart: await visible('#slideRestart'),
  };
}

/* Checks one card against the lesson. `index` is the 0-based slide. */
async function checkCard(page, index, locale) {
  const want = LESSON[index];
  const got = await readCard(page);
  const at = `slide ${index + 1} (${locale})`;
  assert.equal(got.title, want.title[LOCALE_INDEX[locale]], `${at}: title`);
  assert.equal(got.progress, `${index + 1} ${locale === 'es' ? 'de' : 'of'} ${TOTAL}`, `${at}: progress label`);

  if (want.kind === 'real') {
    assert.equal(got.eyebrow, true, `${at}: the "in real life" line is shown`);
    assert.equal(got.visual, false, `${at}: no drawing on a real-life card`);
    assert.deepEqual(got.examples, want.examples[LOCALE_INDEX[locale]], `${at}: examples`);
    assert.equal(got.examplePictures, want.examples[0].length, `${at}: one picture per example`);
    assert.equal(got.traits.length, 0, `${at}: no traits on a real-life card`);
  } else {
    assert.equal(got.eyebrow, false, `${at}: no "in real life" line`);
    assert.equal(got.visual, true, `${at}: drawing is shown`);
    assert.equal(got.visualHasDrawing, true, `${at}: the drawing is an SVG`);
    assert.equal(got.examples.length, 0, `${at}: no real-life examples`);
    if (want.kind === 'expo') {
      assert.deepEqual(got.traits, want.traits[LOCALE_INDEX[locale]], `${at}: traits`);
    } else {
      assert.equal(got.traits.length, 0, `${at}: comparisons have no traits`);
    }
  }

  const isLast = index === TOTAL - 1;
  assert.equal(got.arrows, !isLast, `${at}: arrows are shown except on the last slide`);
  assert.equal(got.finish, isLast, `${at}: "Terminar" only on the last slide`);
  assert.equal(got.restart, isLast, `${at}: "Empezar otra vez" only on the last slide`);
  return got;
}

async function walk(page, locale, onSlide) {
  for (let i = 0; i < TOTAL; i++) {
    if (onSlide) await onSlide(i);
    await checkCard(page, i, locale);
    if (i < TOTAL - 1) await page.locator('#slideNext').click();
  }
}

/* ---------- Tests ---------- */

async function testWalksAllSlidesInSpanish(browser, base) {
  const { context, page, errors } = await openGallery(browser, base, 'es');
  try {
    assert.equal(await page.textContent('#stars'), '0 ⭐', 'the star count starts at 0');
    await walk(page, 'es');
    assert.deepEqual(errors, [], 'no page errors while walking the gallery');
  } finally {
    await context.close();
  }
}

async function testDrawingsFollowTheLanguage(browser, base) {
  for (const locale of ['es', 'en']) {
    const { context, page } = await openGallery(browser, base, locale);
    try {
      for (let i = 0; i < DECIMALS_DRAWING; i++) await page.locator('#slideNext').click();
      const decimals = await page.textContent('#slideVisual');
      assert.ok(decimals.includes(DRAWN_NUMBERS[locale].decimals),
        `${locale}: decimals drawing should read ${DRAWN_NUMBERS[locale].decimals}, got "${decimals}"`);
      for (let i = DECIMALS_DRAWING; i > INTEGERS_DRAWING; i--) await page.locator('#slidePrev').click();
      const integers = await page.textContent('#slideVisual');
      assert.ok(integers.includes(DRAWN_NUMBERS[locale].integers),
        `${locale}: integers drawing should read ${DRAWN_NUMBERS[locale].integers}, got "${integers}"`);
    } finally {
      await context.close();
    }
  }
}

async function testEnglishCards(browser, base) {
  const { context, page, errors } = await openGallery(browser, base, 'en');
  try {
    await walk(page, 'en');
    assert.deepEqual(errors, [], 'no page errors in English');
  } finally {
    await context.close();
  }
}

async function testFinishGivesOneStarAndKeepsIt(browser, base) {
  const { context, page, errors } = await openGallery(browser, base, 'es');
  try {
    for (let i = 0; i < TOTAL - 1; i++) await page.locator('#slideNext').click();
    await page.locator('#slideFinish').click();
    await page.waitForSelector('#app-celebration:not(.hidden)');
    assert.equal(await page.textContent('#stars'), '1 ⭐', 'finishing gives one star');
    /* The star is kept after a reload. */
    await page.reload();
    await page.waitForSelector('#slideTitle:not(:empty)');
    assert.equal(await page.textContent('#stars'), '1 ⭐', 'the star is still there after a reload');
    assert.deepEqual(errors, [], 'no page errors while finishing');
  } finally {
    await context.close();
  }
}

async function testStartOverFromTheLastSlide(browser, base) {
  const { context, page } = await openGallery(browser, base, 'es');
  try {
    for (let i = 0; i < TOTAL - 1; i++) await page.locator('#slideNext').click();
    await page.locator('#slideRestart').click();
    await checkCard(page, 0, 'es');
  } finally {
    await context.close();
  }
}

async function testBackFromTheFirstSlideWrapsToTheLast(browser, base) {
  /* The arrows wrap, as app.js documents: ← on the first slide shows the last one.
     On the last slide the arrows leave, so the way forward is «Terminar» or «Empezar otra vez». */
  const { context, page } = await openGallery(browser, base, 'es');
  try {
    await page.locator('#slidePrev').click();
    await checkCard(page, TOTAL - 1, 'es');
  } finally {
    await context.close();
  }
}

async function testNoHorizontalScrollOnAnyWidth(browser, base) {
  const { context, page, errors } = await openGallery(browser, base, 'es');
  try {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      for (let i = 0; i < TOTAL; i++) {
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return doc.scrollWidth - doc.clientWidth;
        });
        assert.ok(overflow <= 0, `${width}px, slide ${i + 1}: the page scrolls sideways by ${overflow}px`);
        if (i < TOTAL - 1) await page.locator('#slideNext').click();
      }
      /* Back to the first slide for the next width. */
      await page.locator('#slideRestart').click();
    }
    assert.deepEqual(errors, [], 'no page errors while resizing');
  } finally {
    await context.close();
  }
}

const TESTS = [
  ['walks the ten slides in Spanish, with the right parts on each card', testWalksAllSlidesInSpanish],
  ['drawings show the decimal comma in Spanish and the point in English', testDrawingsFollowTheLanguage],
  ['walks the ten slides in English', testEnglishCards],
  ['finishing gives one star, kept after a reload', testFinishGivesOneStarAndKeepsIt],
  ['"Empezar otra vez" goes back to the first slide', testStartOverFromTheLastSlide],
  ['← on the first slide goes to the last one', testBackFromTheFirstSlideWrapsToTheLast],
  ['no sideways scroll at 320, 375, 768 or 1280 px', testNoHorizontalScrollOnAnyWidth],
];

async function main() {
  const server = await startServer();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  let failed = 0;
  try {
    for (const [name, run] of TESTS) {
      try {
        await run(browser, base);
        console.log(`ok   ${name}`);
      } catch (error) {
        failed += 1;
        console.log(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`);
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`\n${TESTS.length - failed} of ${TESTS.length} passed`);
  if (failed > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
