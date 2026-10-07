/* Contrast audit of posneg vs a reference activity across all three themes.
   Catches hardcoded light colours that survive a theme switch because they
   are not tokens. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

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
  return Math.round((l1 > l2 ? l1 / l2 : l2 / l1) * 100) / 100;
}

const auditFn = () => {
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
  const shown = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    let n = el;
    while (n && n !== document.body) {
      if (getComputedStyle(n).display === 'none') return false;
      n = n.parentElement;
    }
    return true;
  };
  const nodes = Array.from(document.querySelectorAll('p, h1, h2, span, a, button, li, div'))
    .filter((el) => shown(el) && (el.textContent || '').trim().length > 0
      && !Array.from(el.children).some((c) => (c.textContent || '').trim().length > 0));
  return nodes.map((el) => {
    const cs = getComputedStyle(el);
    const own = cs.backgroundColor;
    const m = own.match(/rgba?\(([^)]+)\)/);
    const transparent = m && (() => { const p = m[1].split(',').map(Number); return p[3] !== undefined && p[3] === 0; })();
    return {
      text: (el.textContent || '').trim().slice(0, 30),
      cls: el.className || el.tagName,
      color: cs.color,
      bg: transparent ? opaqueBehind(el) : own,
      size: Math.round(parseFloat(cs.fontSize)),
      weight: cs.fontWeight,
    };
  });
};

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

  const THEMES = ['', 'dark', 'contrast'];
  const report = [];

  /* Each entry: tool + the clicks needed to reach the screen. posneg's
     hardcoded light card colours (sign-positive / sign-negative) only
     exist on the thermometer and elevator screens, so auditing only the
     intro would miss them. */
  const FLOWS = [
    { tool: 'posneg', name: 'intro', clicks: [] },
    { tool: 'posneg', name: 'vidareal', clicks: ['#btnIntroNext'] },
    { tool: 'posneg', name: 'termometro', clicks: ['#btnIntroNext', '#btnRealNext'] },
    { tool: 'posneg', name: 'ascensor', clicks: ['#btnIntroNext', '#btnRealNext', '#btnTempNext'] },
    { tool: 'roman-numerals', name: 'intro', clicks: [] },
  ];

  for (const theme of THEMES) {
    for (const flow of FLOWS) {
      await page.goto(`${base}/tools/${flow.tool}/index.html`, { waitUntil: 'load' });
      for (const c of flow.clicks) {
        await page.locator(c).click();
        await page.waitForTimeout(200);
      }
      await page.evaluate((t) => {
        if (t) document.documentElement.setAttribute('data-theme', t);
        else document.documentElement.removeAttribute('data-theme');
      }, theme);
      await page.waitForTimeout(250);
      const nodes = await page.evaluate(auditFn);
      for (const n of nodes) {
        const fg = parseRGB(n.color);
        const bg = parseRGB(n.bg);
        if (!fg || !bg) continue;
        const r = ratio(fg, bg);
        // WCAG: 3:1 for large text (>=24px, or >=18.66px bold), else 4.5:1.
        const large = n.size >= 24 || (n.size >= 18.66 && Number(n.weight) >= 700);
        const min = large ? 3 : 4.5;
        if (r < min) {
          report.push({
            theme: theme || 'light', tool: `${flow.tool}/${flow.name}`,
            text: n.text, cls: String(n.cls).slice(0, 28),
            color: n.color, bg: n.bg,
            size: n.size, weight: n.weight,
            ratio: r, required: min,
          });
        }
      }
      await page.screenshot({
        path: path.join(__dirname, 'capturas', `tema-${theme || 'light'}-${flow.tool}-${flow.name}.png`),
      });
    }
  }

  await browser.close();
  server.close();

  if (!report.length) {
    console.log('OK — ningun texto por debajo del minimo WCAG en los tres temas.');
  } else {
    console.log(`FALLOS de contraste: ${report.length}\n`);
    console.table(report);
  }
})();