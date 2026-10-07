#!/usr/bin/env node
/* ============================================================
   probe-panal-celda.js — one-off
   Walks to the honeycomb in the "real examples" screen and prints what
   ui-smoke.js measures about it: how many cells, how many sides each
   one has, which of them belong to the comb, and how far the lone cell
   stands from it. The numbers are here because the drawing is meant to
   be looked at too — it saves a capture of the slide in both themes,
   since the bee's body is painted in the surface colour and that is the
   only way to see whether it still reads on a dark card.

   Usage: node scripts/one-off/probe-panal-celda.js
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

/* The real screen starts on the triangle, so walk forward to the
   honeycomb. It is found by its caption in either language — asking for
   the words keeps this probe from depending on the order of the gallery
   or on the state that remembers which slide was last shown. */
async function gotoComb(page) {
  await page.goto(page.baseUrl() + '/');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.goto(page.baseUrl() + '/tools/shapes/');
  await page.waitForSelector('#screenIntro:not(.hidden)');
  await page.locator('#introContinue').click();
  await page.waitForSelector('#screenReal:not(.hidden)');
  const captions = [];
  for (let i = 0; i < 12; i += 1) {
    const caption = await page.locator('#realCaption').innerText();
    captions.push(caption.trim());
    if (/panal|honeycomb/i.test(caption)) return { slides: i, captions };
    await page.locator('#realNext').click();
    await page.waitForTimeout(60);
  }
  throw new Error('El panal no aparece en los ejemplos reales: ' + captions.join(' | '));
}

/* The same geometry the smoke asks for, read in one go. */
async function measure(page) {
  return page.evaluate(() => {
    const box = el => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    const gapTo = (a, b) => Math.max(b.x - a.x - a.width, a.x - b.x - b.width,
      b.y - a.y - a.height, a.y - b.y - b.height);
    const cells = [...document.querySelectorAll('#realObject svg polygon')]
      .map(p => ({ ...box(p), sides: p.getAttribute('points').trim().split(/\s+/).length }));
    const comb = cells.filter(c => cells.some(o => o !== c && gapTo(c, o) < 10));
    const loose = cells.filter(c => !comb.includes(c));
    const bees = [...document.querySelectorAll('#realObject svg circle, #realObject svg ellipse')]
      .map(box);
    const svg = document.querySelector('#realObject svg');
    return {
      viewBox: svg.getAttribute('viewBox'),
      svgBox: box(svg),
      cells: cells.length,
      sides: cells.map(c => c.sides).join(','),
      comb: comb.length,
      loose: loose.length,
      clearance: loose.length ? Math.min(...comb.map(c => gapTo(loose[0], c))) : null,
      beeOverCell: bees.some(b => cells.some(c =>
        b.x < c.x + c.width && b.x + b.width > c.x &&
        b.y < c.y + c.height && b.y + b.height > c.y)),
      caption: document.querySelector('#realCaption').textContent.trim(),
      note: document.querySelector('#realNote').textContent.trim()
    };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  for (const [theme, scheme] of [['claro', 'light'], ['oscuro', 'dark']]) {
    const ctx = await browser.newContext({
      viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, colorScheme: scheme
    });
    const page = await ctx.newPage();
    page.baseUrl = () => base;
    const slides = await gotoComb(page);
    /* The tokens read the theme off the attribute on <html>, and the app
       writes it back from the saved setting on every load — so it is set
       here, once the slide is already on screen, exactly like
       probe-formas-temas.js does. colorScheme alone leaves the card light. */
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t),
      theme === 'oscuro' ? 'dark' : 'light');
    await page.waitForTimeout(150);
    const data = await measure(page);
    console.log('\n' + theme + ' (diapositiva ' + slides.slides + ')');
    console.log('  pie de foto : ' + data.caption);
    console.log('  nota        : ' + data.note);
    console.log('  viewBox     : ' + data.viewBox + '  ->  ' +
      Math.round(data.svgBox.width) + ' x ' + Math.round(data.svgBox.height) + ' px en pantalla');
    console.log('  celdas      : ' + data.cells + '  (panal ' + data.comb +
      ', suelta ' + data.loose + ')');
    console.log('  lados       : ' + data.sides);
    console.log('  separación  : ' + Math.round(data.clearance) + ' px con el panal');
    console.log('  abeja sobre celda: ' + data.beeOverCell);
    await page.locator('#screenReal').screenshot({
      path: path.join(OUT, 'p anal-' + theme + '.png')
    });
    console.log('  panal-' + theme + '.png');
    await ctx.close();
  }
  await browser.close();
  server.close();
})().catch(error => { console.error(error); process.exit(1); });