#!/usr/bin/env node
/* ============================================================
   probe-formas-flujo.js — one-off
   Recorre Formas de punta a punta y deja una captura de cada paso:
   introducción, ejemplos reales, menú de test, primera pregunta, la
   misma pregunta después de fallar, y el final de la ronda. Con esto se
   ve lo que ningún "$('#x').click()" enseña: cuántos pasos hay hasta el
   test, qué pone el pie de la figura, y qué dice la pista socrática.

   Usage: node scripts/one-off/probe-formas-flujo.js
   ============================================================ */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'capturas');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png'
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

async function shot(page, name) {
  await page.locator('#screenIntro:not(.hidden), #screenReal:not(.hidden), #screenMenu:not(.hidden), #screenGame:not(.hidden), #screenEnd:not(.hidden)')
    .first().screenshot({ path: path.join(OUT, 'flujo-' + name + '.png') });
  console.log('  flujo-' + name + '.png');
}

/* Which screen is on top right now. */
const visibleScreen = page => page.evaluate(() =>
  ['screenIntro', 'screenReal', 'screenMenu', 'screenGame', 'screenEnd']
    .find(id => !document.getElementById(id).classList.contains('hidden')));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(base + '/');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.goto(base + '/tools/shapes/');
  await page.waitForSelector('#screenIntro:not(.hidden)');

  console.log('\n== recorrido hasta el test ==');
  console.log('  1. al abrir la actividad -> ' + await visibleScreen(page));
  await shot(page, '1-intro');

  await page.locator('#introContinue').click();
  console.log('  2. "Verlas en la vida real" -> ' + await visibleScreen(page));
  await shot(page, '2-real');

  const realSlides = await page.evaluate(() => window.DATA.gallery.length);
  const menu = await page.evaluate(() =>
    [...document.querySelectorAll('#activitiesMenu button')].map(b => b.innerText.trim().split('\n')[0]));
  await page.locator('#realContinue').click();
  console.log('  3. "Hacer el test" -> ' + await visibleScreen(page));
  console.log('     ' + realSlides + ' ejemplos reales antes; el menú de test tendría ' +
    menu.length + ': ' + menu.join(' | '));
  await shot(page, '3-destino');
  if (await page.locator('#screenMenu:not(.hidden)').count()) {
    await page.locator('#activitiesMenu button').first().click();
    console.log('     (había que elegir: se pulsó el primer botón)');
  }
  await page.waitForSelector('#screenGame:not(.hidden)');
  console.log('  4. dentro del test -> ' + await visibleScreen(page));

  /* Answers the current question trying every option until one is
     accepted, acknowledging the hint each time it is not. That is the
     route a person takes, and it is the only way this probe can walk the
     round without reimplementing the rules for the twelve question types. */
  async function answerWhatever() {
    const options = page.locator('#options .option-btn');
    for (let i = 0; i < await options.count(); i += 1) {
      await options.nth(i).click();
      if (await page.locator('#btnNext:not(.hidden)').count()) return true;
      const ack = page.locator('#explanationWrap .btn-understood');
      if (await ack.count()) await ack.click();
    }
    return false;
  }

  /* Which counting question is on screen, read from the prompt and from
     DATA the same way a child reads it off the figure. */
  const countingNow = () => page.evaluate(() => {
    const t = key => window.App.i18n.t(key);
    const prompt = document.querySelector('#prompt').textContent.trim();
    const isSides = prompt === t('gen.sidesPrompt');
    const isCorners = prompt === t('gen.cornersPrompt');
    if (!isSides && !isCorners) return null;
    const name = document.querySelector('#visual').getAttribute('aria-label');
    const shape = Object.keys(window.DATA.sides).find(id => t('shape.' + id) === name);
    return { shape, count: isSides ? 'sides' : 'corners', prompt };
  });

  /* Walk the round to the counting question the user named — "cuenta el
     número de lados" — and fail it there on purpose. The round is shuffled
     and that question can be anywhere in the 50. */
  let counting = null;
  for (let step = 0; step < 14 && !counting; step += 1) {
    counting = await countingNow();
    if (counting) break;
    if (!await answerWhatever()) break;
    await page.locator('#btnNext').click();
  }

  const before = await page.evaluate(() => ({
    prompt: document.querySelector('#prompt').textContent.trim(),
    figureNote: document.querySelector('#visual .hint')?.textContent.trim() || null,
    legend: document.querySelector('#legend').textContent.trim(),
    options: [...document.querySelectorAll('#options .option-btn')].map(b => b.innerText.trim())
  }));
  console.log('\n== la pregunta de contar ==');
  console.log('  pregunta : ' + before.prompt);
  console.log('  bajo la figura : ' + (before.figureNote || '(nada)'));
  console.log('  leyenda         : ' + (before.legend || '(nada)'));
  console.log('  opciones        : ' + before.options.join(' | '));
  await shot(page, '4-pregunta');

  /* The right answer comes from DATA.sides, and the wrong one is picked
     deliberately so the hint actually appears. */
  if (counting) {
    const correct = await page.evaluate(c => String(window.DATA.sides[c.shape][c.count]), counting);
    /* Las opciones de contar son el número escrito, sin aria-label. */
    const labels = await page.evaluate(() =>
      [...document.querySelectorAll('#options .option-btn')]
        .map(b => (b.getAttribute('aria-label') || b.innerText).trim()));
    const wrongIndex = labels.findIndex(label => label !== correct);
    if (wrongIndex < 0) {
      throw new Error('La pregunta de contar solo ofrecía la respuesta buena: ' + labels.join(' | '));
    }
    console.log('  se elige a propósito ' + labels[wrongIndex] + ' en vez de ' + correct);
    await page.locator('#options .option-btn').nth(wrongIndex).click();
  } else {
    console.log('  (no salió una pregunta de contar: se falla la que hay)');
    await page.locator('#options .option-btn').first().click();
  }
  await page.waitForSelector('#explanationWrap:not(.hidden)');
  const after = await page.evaluate(() => ({
    pista: document.querySelector('#explanation').textContent.trim(),
    generica: window.App.i18n.t('hint'),
    bajoLaFigura: document.querySelector('#visual .hint')?.textContent.trim() || null
  }));
  console.log('\n== después de fallar ==');
  console.log('  pregunta        : ' + before.prompt);
  console.log('  pista socrática : ' + after.pista);
  console.log('  (la genérica)   : ' + after.generica);
  console.log('  bajo la figura  : ' + (after.bajoLaFigura || '(nada)'));
  await shot(page, '5-fallo');

  await browser.close();
  server.close();
})().catch(error => { console.error(error); process.exit(1); });