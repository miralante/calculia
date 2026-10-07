/* Walk the new posneg screen chain (intro → real life → thermometer →
   elevator → end) and confirm the transition buttons say what they
   promise. Also checks the same three buttons in roman-numerals and
   shapes, in ES and EN.
   Run:
     PLAYWRIGHT_MODULE_PATH=<npm root -g>\playwright node scripts/one-off/probe-transiciones.js */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const SHOTS = path.join(__dirname, 'capturas');
fs.mkdirSync(SHOTS, { recursive: true });

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

/* Switches the app to `locale` the way the user does, by writing the
   same localStorage key the locale picker uses. */
async function setLocale(page, locale) {
  await page.evaluate((l) => {
    try { localStorage.setItem('calculia:locale', l); } catch (e) { /* private mode */ }
  }, locale);
}

const label = (page, sel) => page.evaluate(
  (s) => {
    const el = document.querySelector(s);
    return el ? el.textContent.trim() : '(NO EXISTE)';
  },
  sel,
);

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  const problems = [];

  for (const locale of ['es', 'en']) {
    await page.goto(base, { waitUntil: 'load' });
    await setLocale(page, locale);

    /* ---- posneg: walk the whole chain ---- */
    await page.goto(`${base}/tools/posneg/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(300);

    const chain = [
      { name: 'intro', sel: '#btnIntroNext' },
      { name: 'real', sel: '#btnRealNext' },
      { name: 'termometro', sel: '#btnTempNext' },
      { name: 'ascensor', sel: '#btnElevFinish' },
    ];

    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      const visible = await page.evaluate((n) => {
        const map = {
          intro: '#introScreen', real: '#realScreen', temp: '#tempScreen',
          elev: '#elevScreen', end: '#endScreen',
        };
        return { [n]: !!document.querySelector(map[n]) && !document.querySelector(map[n]).classList.contains('hidden') };
      }, i === 0 ? 'intro' : chain[i - 1].name === 'real' ? 'real'
        : chain[i - 1].name === 'termometro' ? 'temp' : 'elev');

      if (visible.intro) {
        console.log(`\n[${locale}] posneg · pantalla ${step.name}`);
      }

      if (step.name === 'real') {
        /* The real-life screen must actually show real life, or the
           button that promised it is lying. */
        const items = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#realScreen .real-item'));
          return {
            count: rows.length,
            titles: rows.map((r) => {
              const h = r.querySelector('.real-item-title');
              const p = r.querySelector('.real-item-body');
              return { icon: (r.querySelector('.real-object') || {}).textContent,
                       title: h && h.textContent.trim(), text: p && p.textContent.trim() };
            }),
          };
        });
        console.log('  filas:', items.count);
        items.titles.forEach((t) => console.log(`    ${t.icon} ${t.title} — ${(t.text || '').slice(0, 60)}…`));
        if (items.count === 0) problems.push(`[${locale}] posneg: la pantalla de vida real no pintó ninguna fila`);
        items.titles.forEach((t) => {
          if (!t.title || t.title === 'real.termometro.title') {
            problems.push(`[${locale}] posneg: clave de traducción sin resolver -> ${t.title}`);
          }
        });
        await page.screenshot({ path: path.join(SHOTS, `transicion-${locale}-posneg-real.png`) });
      }

      const txt = await label(page, step.sel);
      console.log(`  botón -> "${txt}"`);
      if (txt === '(NO EXISTE)') problems.push(`[${locale}] posneg: falta el botón ${step.sel}`);

      /* The intro button must announce real life. */
      if (step.name === 'intro') {
        const real = /vida real|real life/i.test(txt);
        console.log(`  ¿anuncia vida real? ${real ? 'sí' : 'NO'}`);
        if (!real) problems.push(`[${locale}] posneg: el botón de intro no nombra la vida real -> "${txt}"`);
        await page.screenshot({ path: path.join(SHOTS, `transicion-${locale}-posneg-intro.png`) });
      }

      if (i < chain.length - 1) {
        await page.locator(step.sel).click();
        await page.waitForTimeout(280);
      }
    }
    await page.screenshot({ path: path.join(SHOTS, `transicion-${locale}-posneg-final.png`) });

    /* ---- roman-numerals ---- */
    await page.goto(`${base}/tools/roman-numerals/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const rn = await label(page, '#introNext');
    console.log(`\n[${locale}] roman-numerals  introNext -> "${rn}"`);
    if (!/vida real|real life/i.test(rn)) problems.push(`[${locale}] roman-numerals: introNext no nombra la vida real -> "${rn}"`);
    await page.screenshot({ path: path.join(SHOTS, `transicion-${locale}-roman.png`) });

    /* ---- shapes ---- */
    await page.goto(`${base}/tools/shapes/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const sh = await label(page, '#introContinue');
    console.log(`[${locale}] shapes  introContinue -> "${sh}"`);
    if (!/vida real|real life/i.test(sh)) problems.push(`[${locale}] shapes: introContinue no nombra la vida real -> "${sh}"`);
    if (/Verlas|See them/i.test(sh)) problems.push(`[${locale}] shapes: sigue el texto antiguo "${sh}"`);
    await page.screenshot({ path: path.join(SHOTS, `transicion-${locale}-shapes.png`) });
  }

  await browser.close();
  server.close();

  console.log('\n' + '='.repeat(52));
  if (problems.length) {
    console.log(`PROBLEMAS (${problems.length}):`);
    problems.forEach((p) => console.log('  - ' + p));
    process.exitCode = 1;
  } else {
    console.log('OK — cadena intro → vida real → práctica correcta en ES y EN.');
  }
})();