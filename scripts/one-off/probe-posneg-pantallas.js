/* Verify the posneg accent fix across all four screens, plus the
   touch-target audit of the mission controls.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g>\playwright node scripts/one-off/probe-posneg-pantallas.js */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const SHOTS = path.join(__dirname, 'capturas');
fs.mkdirSync(SHOTS, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, url);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('nope'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function parseRGB(str) {
  const m = str && str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a] = m[1].split(',').map((s) => parseFloat(s));
  return { r, g, b, a: a === undefined ? 1 : a };
}
function relLum({ r, g, b }) {
  const f = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(fg, bg) {
  const l1 = relLum(fg) + 0.05;
  const l2 = relLum(bg) + 0.05;
  return (l1 > l2 ? l1 / l2 : l2 / l1).toFixed(2);
}

/* Every .btn on the visible screen, with the opaque background it really
   sits on (walking up when its own background is transparent). */
const collectFn = () => {
  const opaqueBehind = (el) => {
    let n = el;
    while (n) {
      const bg = getComputedStyle(n).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const p = m[1].split(',').map(Number);
        if (!(p[3] !== undefined && p[3] === 0)) return bg;
      }
      n = n.parentElement;
    }
    return 'rgb(255, 255, 255)';
  };
  const visible = (el) => {
    let n = el;
    while (n && n !== document.body) {
      if (getComputedStyle(n).display === 'none') return false;
      n = n.parentElement;
    }
    return true;
  };
  return Array.from(document.querySelectorAll('button.btn, .btn-temp, .btn-elev'))
    .filter(visible)
    .map((b) => {
      const cs = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      const own = cs.backgroundColor;
      const m = own.match(/rgba?\(([^)]+)\)/);
      const isTransparent = m && (() => { const p = m[1].split(',').map(Number); return p[3] !== undefined && p[3] === 0; })();
      return {
        label: (b.textContent || '').trim().slice(0, 26),
        cls: b.className,
        bg: own,
        effectiveBg: isTransparent ? opaqueBehind(b) : own,
        color: cs.color,
        w: Math.round(r.width),
        h: Math.round(r.height),
        transparent: !!isTransparent,
      };
    });
};

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

  const STEPS = [
    { name: '1-intro', clicks: [] },
    { name: '2-vida-real', clicks: ['#btnIntroNext'] },
    { name: '3-termometro', clicks: ['#btnIntroNext', '#btnRealNext'] },
    { name: '4-ascensor', clicks: ['#btnIntroNext', '#btnRealNext', '#btnTempNext'] },
  ];

  const rows = [];
  for (const step of STEPS) {
    await page.goto(`${base}/tools/posneg/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    for (const c of step.clicks) {
      await page.locator(c).click();
      await page.waitForTimeout(200);
    }
    const btns = await page.evaluate(collectFn);
    rows.push(...btns.map((b) => ({
      screen: step.name,
      label: b.label,
      cls: b.cls,
      size: `${b.w}x${b.h}`,
      target64: b.w >= 64 && b.h >= 64 ? 'ok' : 'BAJO 64',
      bg: b.bg,
      contrast: ratio(parseRGB(b.color), parseRGB(b.effectiveBg)),
      transparentBg: b.transparent ? 'SI' : '',
    })));
    await page.screenshot({ path: path.join(SHOTS, `posneg-${step.name}.png`) });
  }

  /* End screen. */
  await page.goto(`${base}/tools/posneg/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await page.locator('#btnIntroNext').click();
  await page.waitForTimeout(200);
  await page.locator('#btnRealNext').click();
  await page.waitForTimeout(200);
  await page.locator('#btnTempNext').click();
  await page.waitForTimeout(200);
  await page.locator('#btnElevFinish').click();
  await page.waitForTimeout(250);
  const endBtns = await page.evaluate(collectFn);
  rows.push(...endBtns.map((b) => ({
    screen: '5-final',
    label: b.label,
    cls: b.cls,
    size: `${b.w}x${b.h}`,
    target64: b.w >= 64 && b.h >= 64 ? 'ok' : 'BAJO 64',
    bg: b.bg,
    contrast: ratio(parseRGB(b.color), parseRGB(b.effectiveBg)),
    transparentBg: b.transparent ? 'SI' : '',
  })));
  await page.screenshot({ path: path.join(SHOTS, 'posneg-5-final.png') });

  await browser.close();
  server.close();

  console.table(rows);
  const bad = rows.filter((r) => Number(r.contrast) < 4.5);
  console.log(`\nContraste < 4.5:1 -> ${bad.length}`);
  if (bad.length) console.log(bad);
  const small = rows.filter((r) => r.target64 !== 'ok');
  console.log(`Objetivo tactil < 64px -> ${small.length}`);
  if (small.length) console.table(small);
  console.log(`\nCapturas en: ${SHOTS}`);
})();