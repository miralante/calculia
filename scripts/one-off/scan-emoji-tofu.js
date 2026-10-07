'use strict';
/* Detecta que emoji se pintan como CAJA VACIA (tofu) con las fuentes que
   usa de verdad la app.

   Truco: se pinta el candidato junto a un caracter que no existe en
   ninguna fuente (U+10FFFF). Si el dibujo sale IDENTICO pixel a pixel,
   lo que se ha pintado no es el emoji: es el glifo de "no tengo esto".
   Comparar contra una referencia que ya sabemos que es tofu es lo unico
   fiable: `document.fonts.check()` no sabe de fuentes de color y no
   sirve, y el codepoint ser valido no significa que exista el dibujo.

   Uso: node scripts/one-off/scan-emoji-tofu.js [carpeta ...]
   ============================================================ */
'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png' };

function startServer() {
  const server = http.createServer((req, res) => {
    let p; try { p = decodeURIComponent((req.url || '/').split('?')[0]); } catch { res.writeHead(400); res.end(); return; }
    let f = path.resolve(ROOT, p.replace(/^\/+/, '') || 'index.html');
    if (p === '/') f = path.join(ROOT, 'index.html');
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

/* Recoge los emoji de los ficheros del proyecto.

     Los COMENTARIOS se quitan antes. Sin esto, escribir "aquí 🫗 se
     pinta como caja vacía" en un comentario hace que el escáner dé un
     falso positivo sobre un emoji que NUNCA se ve en pantalla —que es
     justo lo contrario de lo que se quiere. Lo mismo vale para un
     ejemplo de codigo dentro de un comentario. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:\\])\/\/[^\n]*/g, '$1 ');
}

function harvest(dirs) {
  const found = new Map();
  const add = (ch, file) => {
    if (!found.has(ch)) found.set(ch, new Set());
    found.get(ch).add(file);
  };
  const walk = d => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git' || e.name === 'capturas') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(js|html)$/.test(e.name)) continue;
      const file = path.relative(ROOT, p).replace(/\\/g, '/');
      /* El proyecto vive dentro de OneDrive y el recorrido coincide con
         sincronizaciones: un fichero puede no estar legible en el
         instante de leerlo. Un escáner que se muere por eso no se
         puede usar; se salta y sigue. */
      let s;
      try { s = stripComments(fs.readFileSync(p, 'utf8')); }
      catch { continue; }
      for (const ch of s) {
        const c = ch.codePointAt(0);
        /* Emoji y simbolos: por encima de U+1F000, o el bloque de
           simbolos-generales de U+2600 a U+27BF. */
        if ((c >= 0x1F000 && c <= 0x1FAFF) || (c >= 0x2600 && c <= 0x27BF)) add(ch, file);
      }
    }
  };
  dirs.forEach(walk);
  return found;
}

(async () => {
  const dirs = process.argv.slice(2);
  const server = await startServer();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(base + '/index.html');

  const chars = [...harvest(dirs.length ? dirs : [ROOT]).keys()];
  const verdicts = await page.evaluate(list => {
    /* El estilo REAL de la tarjeta de "vida real", no uno inventado:
       si el tofu sale con otra fuente, aqui no sale con esta. */
    const css = getComputedStyle(document.body).fontFamily + ';font-size:80px';
    const measure = ch => {
      const c = document.createElement('canvas');
      c.width = 120; c.height = 120;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, 120, 120);
      x.font = css; x.textBaseline = 'middle'; x.textAlign = 'center';
      x.fillStyle = '#000';
      x.fillText(ch, 60, 60);
      return c.toDataURL('image/png');
    };
    /* U+10FFFF no esta asignado: SIEMPRE es tofu. Esa es la referencia. */
    const tofu = measure(String.fromCodePoint(0x10FFFF));
    return list.map(ch => {
      const d = measure(ch);
      return { ch, cp: 'U+' + ch.codePointAt(0).toString(16).toUpperCase(), tofu: d === tofu, blank: /^data:image\/png;base64,iVBOR/.test(d) };
    });
  }, chars);

  const rotos = verdicts.filter(v => v.tofu);
  const bien = verdicts.filter(v => !v.tofu);
  console.log('emoji que SÍ se pintan (' + bien.length + '):');
  console.log('  ' + bien.map(v => v.ch).join(' '));
  console.log('\nCAJA VACÍA (' + rotos.length + '):');
  for (const v of rotos) {
    const files = [...harvest(dirs.length ? dirs : [ROOT]).get(v.ch)];
    console.log('  ' + v.ch + '  ' + v.cp + '   ' + files.slice(0, 4).join(', ') + (files.length > 4 ? ' …+' + (files.length - 4) : ''));
  }

  await browser.close(); server.close();
  process.exit(rotos.length ? 1 : 0);
})().catch(e => { console.error('FALLO: ' + e.message); process.exit(2); });