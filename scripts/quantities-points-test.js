'use strict';

/* Browser test for the points game of tools/quantities ("Poner los puntos").
   Drives the real page with Chromium through Playwright, using real mouse
   events for the drags, so the pointer code is exercised as a person would
   use it. Runs in Spanish (es-ES). Run with: npm run test:quantities */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const PAGE = '/tools/quantities/index.html';
const LOCALE = 'es-ES';
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};
/* The round goes up one digit at a time: 1 point, 1, 1, 2, 2, 2, 3, 3, 3. */
const EXPECTED_POINTS = [1, 1, 1, 2, 2, 2, 3, 3, 3];

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

/* Gap i sits after digit i, counted from the left. A gap is right when the
   digits to its right come in full groups of three. */
function correctGaps(digits) {
  const gaps = [];
  for (let i = 0; i < digits.length - 1; i++) {
    if ((digits.length - 1 - i) % 3 === 0) gaps.push(i);
  }
  return gaps;
}

async function openPointsGame(page, base) {
  await page.goto(base + PAGE);
  await page.locator('#practiceGrid button', { hasText: 'Poner los puntos' }).click();
  await page.waitForSelector('#pointsBoard .pt-digit');
}

async function readDigits(page) {
  return page.$$eval('#pointsBoard .pt-digit', els => els.map(e => e.textContent).join(''));
}

/* One character per gap: P = placed, W = placed in a wrong place, . = empty. */
async function boardState(page) {
  return page.$$eval('#pointsBoard .pt-gap', gaps => gaps.map(g => {
    if (g.classList.contains('is-wrong')) return 'W';
    return g.classList.contains('is-placed') ? 'P' : '.';
  }).join(''));
}

function boardStateFor(gapsCount, placedGaps, wrongGaps) {
  let state = '';
  for (let i = 0; i < gapsCount; i++) {
    if (wrongGaps.includes(i)) state += 'W';
    else state += placedGaps.includes(i) ? 'P' : '.';
  }
  return state;
}

async function gapCenter(page, i) {
  const box = await page.locator(`#pointsBoard [data-gap="${i}"]`).boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/* A small area at the left edge of a gap: it is part of the gap button, not
   the dot, so grabbing here must pick up a placed point too. */
async function gapEdge(page, i) {
  const box = await page.locator(`#pointsBoard [data-gap="${i}"]`).boundingBox();
  return { x: box.x + 2, y: box.y + 2 };
}

async function trayChipCenter(page) {
  const box = await page.locator('#pointsTray .tray-chip').last().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function dragWithMouse(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  /* The point glides for ~190 ms before it settles in its gap. */
  await page.waitForTimeout(300);
}

async function placeCorrectly(page, digits) {
  for (const gap of correctGaps(digits)) {
    await page.locator(`#pointsBoard [data-gap="${gap}"]`).click();
  }
}

/* ---------- Tests ---------- */

async function testProgressionAndAudio(browser, base) {
  const context = await browser.newContext({ locale: LOCALE });
  const page = await context.newPage();
  try {
    await openPointsGame(page, base);
    for (let i = 0; i < EXPECTED_POINTS.length; i++) {
      const digits = await readDigits(page);
      assert.equal(digits.length, 4 + i, `item ${i + 1}: ${digits} should have ${4 + i} digits`);
      assert.equal(correctGaps(digits).length, EXPECTED_POINTS[i],
        `item ${i + 1}: ${digits} should need ${EXPECTED_POINTS[i]} points`);
      await placeCorrectly(page, digits);
      await page.locator('#checkAnswer').click();
      const feedback = await page.textContent('#feedback');
      assert.match(feedback, /Se escribe:/, `item ${i + 1}: correct answer should be confirmed`);
      assert.equal(await page.locator('#hearNumber').isVisible(), true,
        `item ${i + 1}: the 🔊 button should show after a right answer`);
      /* Right answer: the gaps are gone and every digit wears its group colour. */
      assert.equal(await page.locator('#pointsBoard .pt-gap').count(), 0,
        `item ${i + 1}: the gaps should be replaced by the coloured number`);
      const coloured = await page.$$eval('#pointsBoard span[class^="dot-group-"]', els => els.length);
      assert.equal(coloured, digits.length, `item ${i + 1}: every digit should have a group colour`);
      await page.locator('#nextTask').click();
    }
    await page.waitForSelector('#screenFinish:not(.hidden)');
    const finishText = await page.textContent('#finishText');
    assert.match(finishText, /Has resuelto 9 ejercicios/, 'the round should end after 9 numbers');
  } finally {
    await context.close();
  }
}

async function testWrongDropShowsSocraticHint(browser, base) {
  const context = await browser.newContext({ locale: LOCALE });
  const page = await context.newPage();
  try {
    await openPointsGame(page, base);
    const digits = await readDigits(page);
    const wrongGap = [...Array(digits.length - 1).keys()].find(i => !correctGaps(digits).includes(i));
    await dragWithMouse(page, await trayChipCenter(page), await gapCenter(page, wrongGap));
    assert.equal(await boardState(page), boardStateFor(digits.length - 1, [wrongGap], [wrongGap]),
      'the point should stay in the wrong gap, marked as wrong');
    const feedback = await page.textContent('#feedback');
    assert.match(feedback, /Posición incorrecta\./, 'the wrong place should be said in text');
    assert.match(feedback, /Tiene que haber un punto después de tres cifras/,
      'the hint should say where the point goes, without naming the gap');
  } finally {
    await context.close();
  }
}

async function testMoveWrongPointToRightGap(browser, base) {
  const context = await browser.newContext({ locale: LOCALE });
  const page = await context.newPage();
  try {
    await openPointsGame(page, base);
    const digits = await readDigits(page);
    const right = correctGaps(digits)[0];
    const wrongGap = [...Array(digits.length - 1).keys()].find(i => !correctGaps(digits).includes(i));
    await dragWithMouse(page, await trayChipCenter(page), await gapCenter(page, wrongGap));
    /* Grab the wrong point by the edge of its gap, not by the dot. */
    await dragWithMouse(page, await gapEdge(page, wrongGap), await gapCenter(page, right));
    assert.equal(await boardState(page), boardStateFor(digits.length - 1, [right], []),
      'the point should move to the right gap, with no wrong mark');
    assert.equal((await page.textContent('#feedback')).trim(), '', 'the wrong-place text should clear');
  } finally {
    await context.close();
  }
}

async function testDropOnOccupiedGapReturnsPoint(browser, base) {
  const context = await browser.newContext({ locale: LOCALE });
  const page = await context.newPage();
  try {
    await openPointsGame(page, base);
    /* Advance to the first two-point number (item 4 of 9). */
    for (let i = 0; i < 3; i++) {
      const digits = await readDigits(page);
      await placeCorrectly(page, digits);
      await page.locator('#checkAnswer').click();
      await page.locator('#nextTask').click();
    }
    const digits = await readDigits(page);
    const [first, second] = correctGaps(digits);
    assert.equal(correctGaps(digits).length, 2, `${digits} should need two points`);
    await dragWithMouse(page, await trayChipCenter(page), await gapCenter(page, first));
    await dragWithMouse(page, await trayChipCenter(page), await gapCenter(page, second));
    const before = await boardState(page);
    /* Drop the point from `first` onto `second`, which already holds one. */
    await dragWithMouse(page, await gapEdge(page, first), await gapCenter(page, second));
    assert.equal(await boardState(page), before, 'the point should go back where it was');
  } finally {
    await context.close();
  }
}

async function testCheckWithPointsMissing(browser, base) {
  const context = await browser.newContext({ locale: LOCALE });
  const page = await context.newPage();
  try {
    await openPointsGame(page, base);
    await page.locator('#checkAnswer').click();
    const feedback = await page.textContent('#feedback');
    assert.match(feedback, /Todavía quedan puntos por colocar\./,
      'checking with no points placed should say that points are missing');
  } finally {
    await context.close();
  }
}

const TESTS = [
  ['progression and 🔊 after a right answer', testProgressionAndAudio],
  ['wrong drop shows the Socratic hint', testWrongDropShowsSocraticHint],
  ['a wrong point moves to the right gap by grabbing the gap', testMoveWrongPointToRightGap],
  ['dropping on an occupied gap returns the point', testDropOnOccupiedGapReturnsPoint],
  ['checking with points missing says so', testCheckWithPointsMissing],
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
