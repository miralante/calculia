/* One-off probe: la aclaración de la galería de Formas (cuántos lados
   tiene la forma plana, cuántas caras tiene el cuerpo) se añadió como
   nota pequeña bajo el nombre. Dos cosas no se ven leyendo el CSS: si el
   color por tema baja del 7:1 que pide el AAA del proyecto, y si la nota
   de verdad es menor que el nombre en pantalla. Aquí se mide el estilo
   COMPUTADO de cada diapositiva en los tres temas y en móvil (375x667),
   que es donde una aclaración larga se convierte en scroll horizontal.
   Además comprueba que la nota no aparece en las dos diapositivas de
   introducción, donde aún no se ha presentado ninguna forma.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g> node scripts/one-off/probe-formas-galeria-nota.js
   Imprime una tabla por tema y deja capturas de contacto en
   test-results/formas-galeria-nota/. */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'test-results', 'formas-galeria-nota');
const THEMES = ['light', 'dark', 'contrast'];
const AAA = 7;
const SHOTS = ['triangle', 'octagon', 'cube', 'cone'];

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
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/* Runs inside the page: computed colours of the note and of the name,
   the first opaque background above each of them, and whether the mobile
   viewport overflows horizontally. */
function measure() {
  const channel = value => {
    const match = String(value).match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const parts = match[1].split(',').map(part => parseFloat(part));
    return parts.length < 4 || parts[3] > 0 ? parts : null;
  };
  const luminance = rgb => {
    const [r, g, b] = rgb.map(v => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const background = node => {
    for (let el = node; el; el = el.parentElement) {
      const bg = channel(getComputedStyle(el).backgroundColor);
      if (bg) return bg;
    }
    return [255, 255, 255];
  };
  const contrast = (fg, bg) => {
    const a = luminance(fg);
    const b = luminance(bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  };
  const read = selector => {
    const node = document.querySelector(selector);
    const style = getComputedStyle(node);
    return {
      text: node.textContent.trim(),
      size: parseFloat(style.fontSize),
      weight: style.fontWeight,
      transform: style.textTransform,
      ratio: contrast(channel(style.color), background(node)).toFixed(2)
    };
  };
  return {
    name: read('#galleryCaption'),
    note: read('#galleryNote'),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    noteVisible: getComputedStyle(document.querySelector('#galleryNote')).display !== 'none'
  };
}

async function run() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(OUT, { recursive: true });
  let failures = 0;

  for (const theme of THEMES) {
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto('http://127.0.0.1:' + port + '/tools/shapes/index.html');
    await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.reload();
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.waitForSelector('#screenIntro:not(.hidden)');

    /* The concept slides come before the shapes, and there are now four of
       them; no note on any of them, because no shape has been shown yet. */
    for (const slide of ['flat vs solid', 'lado, vértice y perímetro',
      'área y volumen', 'simetría y semejanza']) {
      const intro = await page.evaluate(measure);
      if (intro.noteVisible || intro.overflow > 0) {
        failures += 1;
        console.log('  !! ' + slide + ': note visible=' + intro.noteVisible +
          ' overflow=' + intro.overflow);
      }
      await page.locator('#galleryNext').click();
    }

    const ids = await page.evaluate(() => window.DATA.gallery.map(item => item.id));
    const rows = [];
    const shots = [];
    for (let i = 0; i < ids.length; i += 1) {
      const row = await page.evaluate(measure);
      rows.push(Object.assign({ id: ids[i] }, row));
      if (SHOTS.indexOf(ids[i]) !== -1) {
        const buffer = await page.locator('#screenIntro .gallery-card').screenshot();
        shots.push({ id: ids[i], data: buffer.toString('base64') });
      }
      if (i < ids.length - 1) await page.locator('#galleryNext').click();
    }

    console.log('\n== ' + theme + ' (375x667) ==');
    rows.forEach(row => {
      const bad = [];
      if (parseFloat(row.note.ratio) < AAA) bad.push('contraste ' + row.note.ratio + ':1 < 7:1');
      if (!(row.note.size < row.name.size)) {
        bad.push('la nota (' + row.note.size + 'px) no es menor que el nombre (' + row.name.size + 'px)');
      }
      if (row.note.transform !== 'none') bad.push('transform ' + row.note.transform);
      if (row.overflow > 0) bad.push('desbordamiento horizontal ' + row.overflow + 'px');
      if (!row.note.text) bad.push('sin texto');
      failures += bad.length;
      console.log('  ' + (bad.length ? '!! ' : '   ') + row.id.padEnd(17) +
        row.note.ratio.padStart(6) + ':1  ' + row.note.size + 'px  ' +
        (bad.length ? bad.join('; ') + '  |  ' : '') + row.note.text);
    });

    const sheet = await browser.newPage({ viewport: { width: 1500, height: 760 } });
    const cells = shots.map(shot =>
      '<figure style="margin:0;display:flex;flex-direction:column;gap:6px;align-items:center">' +
      '<img src="data:image/png;base64,' + shot.data + '" style="width:300px;border:1px solid #888">' +
      '<figcaption style="font:600 14px system-ui">' + theme + ' · ' + shot.id + '</figcaption></figure>'
    ).join('');
    await sheet.setContent(
      '<body style="margin:0;padding:14px">' +
      '<div style="display:grid;grid-template-columns:repeat(4,max-content);gap:16px">' + cells + '</div></body>'
    );
    const file = path.join(OUT, 'galeria-' + theme + '.png');
    await sheet.screenshot({ path: file, fullPage: true });
    console.log('  -> ' + file);
    await sheet.close();
    await page.close();
  }

  await browser.close();
  await new Promise(resolve => server.close(resolve));
  console.log(failures ? '\nFALLOS: ' + failures : '\nTodo correcto');
  if (failures) process.exitCode = 1;
}

run().catch(error => { console.error(error); process.exitCode = 1; });