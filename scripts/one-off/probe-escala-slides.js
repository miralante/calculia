#!/usr/bin/env node
/* ============================================================
   probe-escala-slides.js — one-off
   Vuelca lo que realmente pinta cada slide del carrusel de
   introduction de tools/scale: cuantos <svg> anidados hay, que
   textos se crean y donde queda cada uno en pantalla. Un <svg>
   anidado no lo delata ningun check estructural: el elemento
   existe, el DOM es valido, y solo se ve mirando.

   Uso: node scripts/one-off/probe-escala-slides.js
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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, colorScheme: 'light'
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

  await page.goto(base + '/tools/scale/');
  await page.waitForSelector('#conceptVisual svg');

  const slides = [];
  for (let i = 0; i < 4; i += 1) {
    if (i > 0) {
      await page.click('#conceptNext');
      await page.waitForTimeout(120);
    }
    const info = await page.evaluate(() => {
      const host = document.querySelector('#conceptVisual');
      const svgs = [...host.querySelectorAll('svg')];
      const outer = host.querySelector('svg');
      const texts = [...host.querySelectorAll('text')].map(t => {
        const r = t.getBoundingClientRect();
        return {
          cls: t.getAttribute('class') || '',
          content: t.textContent,
          x: t.getAttribute('x'), y: t.getAttribute('y'),
          w: Math.round(r.width), h: Math.round(r.height),
          top: Math.round(r.top), left: Math.round(r.left),
          visible: r.width > 0 && r.height > 0
        };
      });
      const hostRect = host.getBoundingClientRect();
      return {
        title: (document.querySelector('#conceptTitle') || {}).textContent,
        svgCount: svgs.length,
        nestedSvg: svgs.filter(s => s.parentElement && s.parentElement.closest('svg')).length,
        viewBoxes: svgs.map(s => s.getAttribute('viewBox')),
        outerBox: outer
          ? { w: Math.round(outer.getBoundingClientRect().width), h: Math.round(outer.getBoundingClientRect().height) }
          : null,
        hostBox: { w: Math.round(hostRect.width), h: Math.round(hostRect.height), top: Math.round(hostRect.top) },
        faceCount: host.querySelectorAll('.ruler-face, .span-face, .plan-bar').length,
        texts
      };
    });
    slides.push(info);
    const el = await page.$('#conceptVisual');
    await el.screenshot({ path: path.join(OUT, 'slide-' + (i + 1) + '-' + (info.title || '').replace(/[^\w]+/g, '_').slice(0, 24) + '.png') });
  }

  fs.writeFileSync(path.join(__dirname, 'slides.json'), JSON.stringify({ slides, errors }, null, 1), 'utf8');
  for (const [i, s] of slides.entries()) {
    console.log('--- slide ' + (i + 1) + ' : ' + s.title);
    console.log('    svg=' + s.svgCount + ' anidados=' + s.nestedSvg + ' viewBox=' + JSON.stringify(s.viewBoxes) +
      ' outer=' + JSON.stringify(s.outerBox) + ' caras=' + s.faceCount);
    console.log('    textos=' + s.texts.length + ' visibles=' + s.texts.filter(t => t.visible).length);
    console.log('    ' + (s.texts.map(t => t.cls + '=' + JSON.stringify(t.content) + '@x' + t.x + ' w' + t.w + ' vis:' + t.visible).join(' | ') || '(ninguno)'));
  }
  console.log('--- errores: ' + JSON.stringify(errors));
  await browser.close();
  server.close();
})();