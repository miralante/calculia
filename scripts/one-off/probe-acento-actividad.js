/* One-off probe: does each activity's primary button actually show its
   accent colour, and is the label readable on it?
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g> node scripts/one-off/probe-acento-actividad.js
   Reports, per tool, the computed background/color of its main .btn and
   the ratio between them, plus whether --mod-* resolves. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');

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
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function parseRGB(str) {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a] = m[1].split(',').map((s) => parseFloat(s));
  return { r, g, b, a: a === undefined ? 1 : a };
}

function relLum({ r, g, b }) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(fg, bg) {
  const a = relLum(fg) + 0.05;
  const b = relLum(bg) + 0.05;
  return (Math.max(a, b) / Math.min(a, b)).toFixed(2);
}

/* Walk up to find the first non-transparent background behind the label. */
async function pageBackgroundOf(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    let node = el;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      const m = bg.match(/rgba?\(([^)]+)\)/);
      if (m) {
        const parts = m[1].split(',').map(Number);
        if (!(parts[3] !== undefined && parts[3] === 0)) return bg;
      }
      node = node.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }, selector);
}

const TOOLS = [
  ['posneg', '#btnIntroNext'],
  ['roman-numerals', '#introNext'],
  ['shapes', '.btn'],
];

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 800 } });
  const out = [];

  for (const [tool, sel] of TOOLS) {
    await page.goto(`${base}/tools/${tool}/index.html`, { waitUntil: 'load' });
    const res = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return { missing: true };
      const cs = getComputedStyle(el);
      const root = getComputedStyle(document.documentElement);
      const mods = {};
      ['--mod-coordinacion', '--mod-razonamiento', '--mod-secuencia', '--mod-memoria',
       '--mod-emocional', '--mod-lenguaje', '--mod-cuerpo', '--mod-mates'].forEach((k) => {
        mods[k] = root.getPropertyValue(k).trim() || '(UNDEFINED)';
      });
      return {
        label: (el.textContent || '').trim().slice(0, 30),
        background: cs.backgroundColor,
        color: cs.color,
        cursor: cs.cursor,
        minHeight: cs.minHeight,
        tag: el.tagName,
        mods,
      };
    }, sel);

    if (res.missing) { out.push({ tool, error: `selector ${sel} not found` }); continue; }

    const bgBehind = await pageBackgroundOf(page, sel);
    const fg = parseRGB(res.color);
    const bg = parseRGB(res.background);
    const behind = parseRGB(bgBehind);
    // If the button's own background is transparent, the label really is
    // painted on whatever is behind it.
    const effectiveBg = bg && bg.a > 0 ? bg : behind;

    out.push({
      tool,
      selector: sel,
      tag: res.tag,
      label: res.label,
      background: res.background,
      color: res.color,
      behind: bgBehind,
      contrastOnOwnBg: bg && bg.a > 0 ? ratio(fg, bg) : 'n/a (transparent)',
      contrastEffective: ratio(fg, effectiveBg),
      cursor: res.cursor,
      minHeight: res.minHeight,
      undefinedMods: Object.entries(res.mods).filter(([, v]) => v === '(UNDEFINED)').map(([k]) => k),
    });

    await page.screenshot({ path: path.join(__dirname, `probe-${tool}.png`), fullPage: false });
  }

  await browser.close();
  server.close();

  console.log(JSON.stringify(out, null, 2));
  console.log('\nScreenshots written next to this script.');
})();