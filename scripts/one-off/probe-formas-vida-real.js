/* One-off probe: render the "vida real" carousel of Formas and capture
   every slide, so the illustrations can be judged by eye instead of by
   reading the code.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g> node scripts/one-off/probe-formas-vida-real.js
   Writes one contact sheet (all slides side by side) plus a text report
   of what each slide actually rendered: an <svg> illustration or just
   the object's emoji, and any mark drawn on top of it. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'test-results', 'formas-vida-real');

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

async function run() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const locale = process.argv[2] === 'en' ? 'en' : 'es';
  /* Optional: slide width, then a list of slugs to keep — handy for looking
     at one drawing closely instead of the whole carousel. */
  const width = Number(process.argv[3]) || 420;
  const only = process.argv.slice(4);
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    /* PROBE_DSF=3 renders the 160x140 drawing large enough to judge. */
    deviceScaleFactor: Number(process.env.PROBE_DSF) || 1,
  });
  await page.goto('http://127.0.0.1:' + port + '/tools/shapes/index.html');
  await page.evaluate(l => localStorage.setItem('calculia:locale', l), locale);
  await page.reload();
  await page.locator('#introContinue').click();
  await page.waitForSelector('#screenReal:not(.hidden)');

  fs.mkdirSync(OUT, { recursive: true });
  const ids = await page.evaluate(() => window.DATA.gallery.map(item => item.id));
  const report = [];
  const shots = [];

  for (let i = 0; i < ids.length; i += 1) {
    const keep = only.length === 0 || only.indexOf(ids[i]) !== -1;
    if (keep) {
      const card = page.locator('#screenReal .real-card');
      const shot = await card.screenshot();
      shots.push({ id: ids[i], data: shot.toString('base64') });
      report.push(await page.evaluate(id => {
        const object = document.getElementById('realObject');
        const box = object.getBoundingClientRect();
        return {
          id,
          tieneSvg: !!object.querySelector('svg'),
          poligonos: object.querySelectorAll('svg polygon').length,
          marcas: object.querySelectorAll('.intro-side-mark, .intro-corner-mark').length,
          texto: object.textContent.trim(),
          altoPx: Math.round(box.height),
          anchoPx: Math.round(box.width),
          pie: document.getElementById('realCaption').textContent.trim(),
        };
      }, ids[i]));
    }
    if (i < ids.length - 1) await page.locator('#realNext').click();
  }

  /* One contact sheet: every slide at the same size, labelled with its id,
     so the whole carousel can be compared in a single look. */
  const sheet = await browser.newPage({
    viewport: { width: Number(process.env.PROBE_SHEET_W) || 1400, height: 900 }
  });
  /* PROBE_CELL_W enlarges the cells: at the default size a 160x140
     drawing is hard to judge, and this probe exists to judge it by eye. */
  const cellW = Number(process.env.PROBE_CELL_W) || 280;
  const cells = shots.map(s =>
    '<figure style="margin:0;display:flex;flex-direction:column;gap:6px;align-items:center">' +
    '<img src="data:image/png;base64,' + s.data + '" style="width:' + cellW + 'px;border:1px solid #999">' +
    '<figcaption style="font:600 14px system-ui">' + s.id + '</figcaption></figure>'
  ).join('');
  await sheet.setContent(
    '<body style="margin:0;padding:16px;background:#fff">' +
    '<div style="display:grid;grid-template-columns:repeat(4,max-content);gap:20px">' + cells + '</div></body>'
  );
  const sheetPath = path.join(OUT, 'contacto-' + locale + '.png');
  await sheet.screenshot({ path: sheetPath, fullPage: true });

  console.log('\n' + locale.toUpperCase() + ' — pantalla "vida real" de Formas');
  console.log('svg | polígonos | marcas | alto | id');
  report.forEach(r => {
    console.log(
      (r.tieneSvg ? ' sí ' : ' NO ') + ' |    ' + String(r.poligonos).padStart(2) +
      '     |   ' + String(r.marcas).padStart(2) +
      '    | ' + String(r.altoPx).padStart(3) + ' | ' + r.id + (r.texto ? '  (' + r.texto + ')' : '')
    );
  });
  console.log('\nContacto visual: ' + sheetPath);

  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

run().catch(error => { console.error(error); process.exitCode = 1; });
