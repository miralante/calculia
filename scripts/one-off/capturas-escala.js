#!/usr/bin/env node
/* ============================================================
   capturas-escala.js — one-off
   Screenshots of the scale activity on a real mobile viewport, so
   the drawings can be looked at. Nothing structural reports a ruler
   whose numbers collide with its marks or a jug whose handle sits on
   top of its scale: those are only visible here.
   Usage: node scripts/one-off/capturas-escala.js
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

/* Fixes the level of an activity so the capture shows the one asked
   for, instead of whatever the level ramp would pick. */
async function pinLevel(page, actId, rounds) {
  await page.evaluate(({ actId, rounds }) => {
    localStorage.setItem('calculia:scale', JSON.stringify({
      stars: 12, completedRounds: rounds, roundsByActivity: { [actId]: rounds }
    }));
  }, { actId, rounds });
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true });
  console.log('  ' + name + '.png');
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
    await page.goto(base + '/');
    await page.evaluate(t => localStorage.setItem('calculia:locale', 'es'), theme);
    /* The theme is whatever the visitor picked; force it through the
       attribute the tokens read. */
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.reload();

    if (theme === 'claro') await shot(page, 'portada');

    await page.goto(base + '/tools/scale/');
    await page.reload();
    if (theme === 'oscuro') {
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    }
    await page.waitForSelector('#screenIntro:not(.hidden)');
    await shot(page, theme + '-1-concepto');

    const levels = [
      /* l1 va el primero a proposito: es el nivel en el que todas las
         rayitas llevan numero, y por tanto el nivel donde la marca
         alcanzada se quedaba SIN el suyo. Una captura de l2 no lo
         enseña: alli el valor nunca cae en un numero escrito. */
      { act: 0, id: 'leer', rounds: 0, name: 'leer-l1' },
      { act: 0, id: 'leer', rounds: 1, name: 'leer-l2' },
      { act: 1, id: 'paso', rounds: 0, name: 'paso-p1' },
      { act: 2, id: 'instrumento', rounds: 1, name: 'jarra-t2' },
      { act: 3, id: 'plano', rounds: 0, name: 'plano-d1' }
    ];
    for (const l of levels) {
      await pinLevel(page, l.id, l.rounds);
      await page.reload();
      await page.locator('#introContinue').click();
      await page.locator('#realContinue').click();
      await page.locator('#activitiesMenu .btn-actividad').nth(l.act).click();
      await page.waitForSelector('#screenGame:not(.hidden)');
      await page.waitForSelector('#options .option-btn');
      if (theme === 'claro') await shot(page, l.name);
      await page.locator('#btnMenu').count();
    }
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log('\ncapturas en ' + OUT);
})().catch(e => { console.error('FALLO: ' + e.message); process.exit(1); });