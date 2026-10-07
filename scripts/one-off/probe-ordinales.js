'use strict';
/* Sonda de una pasada para la actividad de Números ordinales.

   check.js valida estructura y paridad; no abre el navegador. Esta
   sonda recorre el flujo real (intro → ejemplos → recordatorio →
   pasos → juego), comprueba que un acierto suma estrella, que un
   fallo muestra la pista y bloquea, y mide el contraste COMPUTADO
   de los colores de la serie en los tres temas. Y busca texto
   humano en pantalla: si una clave i18n construida por concatenación
   no existe, t() devuelve la propia clave y el botón sale con
   "level.learnName" escrito dentro — cosa que ninguna puerta
   estructural ve. */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'capturas');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('nope'); return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const CONTRAST_FN = `(() => {
  const lum = (r, g, b) => {
    const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (s) => {
    const m = s.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map((n) => parseFloat(n));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  });
  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) return node === el ? c : over(c, bgOf(node.parentElement || document.body));
      node = node.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  window.__contrast = (el) => {
    const fg = parse(getComputedStyle(el).color);
    const bg = bgOf(el.parentElement);
    const o = fg.a < 1 ? over(fg, bg) : fg;
    const l1 = lum(o.r, o.g, o.b), l2 = lum(bg.r, bg.g, bg.b);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return { ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100,
             size: parseFloat(getComputedStyle(el).fontSize),
             weight: getComputedStyle(el).fontWeight };
  };
  return true;
})()`;

/* Avanza la ronda como una persona: si no queda ninguna opción
   libre, la pista está pidiendo su "Entendido" antes del siguiente
   intento (lockUntilAck retira la opción fallada y bloquea el
   resto). Sin esto el bucle se queda sin opciones y parece que la
   app está rota. */
async function advanceRound(page) {
  const visible = (sel) => page.locator(sel).isVisible();
  for (let i = 0; i < 80; i++) {
    if (await visible('#screenEnd')) return true;
    if (!(await visible('#screenQuiz'))) return false;
    if (await visible('#next')) {
      try { await page.locator('#next').click({ timeout: 4000 }); } catch (e) { return false; }
      continue;
    }
    const free = page.locator('#options .option-btn:not([disabled])');
    if (await free.count() > 0) {
      try { await free.first().click({ timeout: 4000 }); } catch (e) { return false; }
      continue;
    }
    const ack = page.locator('#explanationWrap .btn-understood');
    if (await ack.isVisible()) {
      try { await ack.click({ timeout: 4000 }); } catch (e) { return false; }
      continue;
    }
    process.stderr.write('  · estado inesperado: ni "Siguiente", ni libres, ni "Entendido"\n');
    return false;
  }
  return await visible('#screenEnd');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { server, port } = await serve();
  const browser = await chromium.launch();
  const errors = [];
  const fail = [];
  /* Los fallos se escriben en el momento de Detectarse, no sólo al
     final: si la sonda revienta a mitad, la lista acumulada se
     perdería con ella y no sabríamos qué había comprobado ya. */
  const pushFail = fail.push.bind(fail);
  fail.push = (m) => { pushFail(m); process.stderr.write('  X ' + m + '\n'); };
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  const shot = (n) => page.screenshot({ path: path.join(OUT, 'ord-' + n + '.png'), fullPage: true });
  const visible = (sel) => page.locator(sel).isVisible();
  const step = (m) => process.stderr.write('  · ' + m + '\n');
  page.setDefaultTimeout(6000);

  step('abriendo la actividad');
  await page.goto(`http://127.0.0.1:${port}/tools/ordinals/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#carouselDisplay', { timeout: 8000 });
  if (!(await visible('#screenIntro'))) fail.push('no arranca en la pantalla de intro');

  /* Una clave i18n que no existe se ve en pantalla tal cual. Esto es
     la comprobación que hace falta y que check.js no puede hacer:
     no busca claves construidas por concatenación. */
  async function screenText() {
    return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  }

  // --- Carrusel: los diez ordinales, sin repetir ---
  const seen = [];
  for (let i = 0; i < 10; i++) {
    seen.push((await page.locator('#carouselDisplay').innerText()).replace(/\s+/g, ' ').trim());
    await page.locator('#carouselNext').click();
  }
  if (new Set(seen).size !== 10) fail.push(`el carrusel repitió ordinal: ${JSON.stringify(seen)}`);
  if (/level\.|ord\.|scene\.|famous\./.test(await screenText())) {
    fail.push('se está viendo una clave i18n literal en pantalla: ' + (await screenText()).slice(0, 200));
  }
  await shot('01-intro');

  // --- Ejemplos reales ---
  step('ejemplos reales');
  await page.locator('#introNext').click();
  if (!(await visible('#screenFamous'))) fail.push('no se abre la pantalla de ejemplos');
  const facts = [];
  for (let i = 0; i < 5; i++) {
    facts.push((await page.locator('#famousText').innerText()).trim());
    await page.locator('#famousNext2').click();
  }
  if (facts.some((f) => !f)) fail.push('algún ejemplo se quedó sin texto');
  if (facts.some((f) => !f.endsWith(':'))) fail.push('una frase de ejemplo no termina en ":" (rompería la cuenta con color)');
  await shot('02-ejemplos');

  // --- Recordatorio ---
  step('recordatorio');
  await page.locator('#famousNextBtn').click();
  if (!(await visible('#screenReminder'))) fail.push('no se abre el recordatorio');
  const chips = await page.locator('#ordinalsRow .ord-chip').count();
  if (chips !== 10) fail.push(`la tabla debería tener los 10 ordinales, tiene ${chips}`);
  const ruleOne = (await page.locator('#ruleMatch .rule-example').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
  if (ruleOne.length < 2) fail.push('la regla 1 necesita al menos dos ejemplos');
  if (!ruleOne.some((s) => s === '1 · primero · primer lugar')) fail.push(`la regla 1 no cuadra: ${JSON.stringify(ruleOne)}`);
  /* La miniatura de la regla 2 son tres posiciones: bandera, perro y
     gato. Cada una con su número debajo, así que debe haber tres
     miembros y tres etiquetas — si sólo salieran dos etiquetas,
     estaría contando el "lugar cero" que la regla niega. */
  const stripMembers = await page.locator('#ruleStart .strip-member').count();
  const stripLabels = await page.locator('#ruleStart .strip-label').count();
  if (stripMembers !== 3 || stripLabels !== 3) {
    fail.push(`la regla 2 debería mostrar 3 posiciones con su número (bandera + 2), hay ${stripMembers} y ${stripLabels} etiquetas`);
  }
  await shot('03-recordatorio');

  // --- Contraste computado en los tres temas ---
  await page.addScriptTag({ content: CONTRAST_FN });
  const contrast = {};
  /* El tercer tema es data-theme="contrast" (no "high-contrast"): con
     el valor equivocado se mediría el claro dos veces. */
  for (const [label, value] of Object.entries({ light: 'light', dark: 'dark', contrast: 'contrast' })) {
    await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), value);
    await page.waitForTimeout(120);
    const rows = await page.$$eval('#ordinalsRow .ord-chip', (els) =>
      els.map((el) => {
        const n = el.querySelector('.ord-chip-figure');
        const w = el.querySelector('.ord-chip-name');
        const p = el.querySelector('.ord-chip-place');
        return {
          n: n.textContent.trim(),
          figRatio: window.__contrast(n).ratio,
          figSize: window.__contrast(n).size,
          figWeight: window.__contrast(n).weight,
          nameRatio: window.__contrast(w).ratio,
          placeRatio: window.__contrast(p).ratio,
          placeSize: window.__contrast(p).size,
        };
      }));
    contrast[label] = rows;
    rows.forEach((r) => {
      const large = r.figSize >= 24 || (r.figSize >= 18.66 && Number(r.figWeight) >= 700);
      if (r.figRatio < (large ? 4.5 : 7)) fail.push(`tema ${label}: la cifra "${r.n}" a ${r.figRatio}:1 (esperaba ${large ? 4.5 : 7})`);
      if (r.nameRatio < 4.5) fail.push(`tema ${label}: la palabra "${r.n}" a ${r.nameRatio}:1 (mínimo AA 4.5)`);
      if (r.placeRatio < 4.5) fail.push(`tema ${label}: el lugar "${r.n}" a ${r.placeRatio}:1 (mínimo AA 4.5)`);
    });
  }
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(120);

  // --- Pasos ---
  step('pasos');
  await page.locator('#referenceNext').click();
  if (!(await visible('#screenLevels'))) fail.push('no se abre la pantalla de pasos');
  const levels = await page.locator('#levelsGrid .btn-practice').count();
  if (levels !== 3) fail.push(`debería haber 3 grupos de pasos, hay ${levels}`);
  await shot('04-pasos');

  // --- Juego ---
  step('juego');
  await page.locator('#levelsGrid .btn-practice').first().click();
  if (!(await visible('#screenQuiz'))) fail.push('no se abre la pantalla de juego');
  const options = await page.locator('#options .option-btn').count();
  if (options !== 3) fail.push(`deben ofrecerse 3 opciones, hay ${options}`);
  const members = await page.locator('.queue-member').count();
  if (members < 1) fail.push('la fila no se dibujó');
  const arrows = await page.locator('.queue-pointer', { hasText: '⬇️' }).count();
  if (arrows !== 1) fail.push(`la flecha debe señalar exactamente un sitio, señala ${arrows}`);
  const small = await page.$$eval('#options .option-btn', (els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().height)).filter((h) => h < 64));
  if (small.length) fail.push(`opciones por debajo del mínimo táctil de 64px: ${small.join(', ')}`);

  /* Ninguna opción puede salirse de su botón. Es lo que pasaba con
     "segundo" a 375px con el tamaño de titular, y a simple vista
     cuesta verlo: la palabra se sale un poco por el borde y el resto
     del round parece normal. */
  const clipped = await page.$$eval('#options .option-btn', (els) =>
    els.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
      .map((e) => e.textContent.trim()));
  if (clipped.length) fail.push(`opciones que se salen de su botón: ${JSON.stringify(clipped)}`);

  /* La flecha tiene que caer sobre la columna del miembro que
     señala. El hueco de la bandera y la columna de la flecha
     comparten anchura a propósito; si un día dejan de compartirla,
     la flecha seguiría dibujándose y apuntaría a otro sitio. */
  const arrowCheck = await page.evaluate(() => {
    const arrow = Array.from(document.querySelectorAll('.queue-pointer')).find((e) => e.textContent.trim());
    if (!arrow) return { ok: true, reason: 'sin flecha en esta ronda' };
    const centre = (e) => { const r = e.getBoundingClientRect(); return r.left + r.width / 2; };
    const members = Array.from(document.querySelectorAll('.queue-member'));
    const start = document.querySelector('.queue-start');
    const best = members.reduce((acc, m) => {
      const d = Math.abs(centre(arrow) - centre(m));
      return d < acc.d ? { d, m } : acc;
    }, { d: Infinity, m: null });
    return {
      ok: best.d <= 2 && Math.abs(centre(arrow) - centre(start)) > 2,
      delta: Math.round(best.d),
      onStart: Math.abs(centre(arrow) - centre(start)) <= 2,
    };
  });
  if (!arrowCheck.ok) {
    fail.push(arrowCheck.reason ||
      `la flecha no cae sobre un miembro (desfase ${arrowCheck.delta}px${arrowCheck.onStart ? ', encima de la bandera' : ''})`);
  }
  if (/level\.|ord\.|scene\./.test(await screenText())) fail.push('una clave i18n literal llegó al juego');
  await shot('05-juego');

  // --- Fallo: pista + bloqueo + "Entendido" ---
  const starsBefore = await page.locator('#stars').innerText();
  await page.locator('#options .option-btn').first().click();
  const hitFirst = await visible('#next');
  if (!hitFirst) {
    const locked = await page.$$eval('#options .option-btn', (els) => els.filter((e) => e.disabled).length);
    const hint = (await page.locator('#explanation').innerText()).trim();
    if (locked < 2) fail.push(`un fallo no bloqueó las opciones (${locked} de 3)`);
    if (!hint) fail.push('la pista socrática está vacía');
    const ack = page.locator('#explanationWrap .btn-understood');
    if (!(await ack.isVisible())) fail.push('un fallo no ofreció "Entendido"');
    await shot('06-pista');
    await ack.click();
    const stillLocked = await page.$$eval('#options .option-btn', (els) => els.filter((e) => e.disabled).length);
    process.stderr.write(`  · tras "Entendido" quedan ${stillLocked} retirada(s)\n`);
    for (let i = 0; i < 6 && !(await visible('#next')); i++) {
      const free = page.locator('#options .option-btn:not([disabled])');
      if (await free.count() === 0) {
        const again = page.locator('#explanationWrap .btn-understood');
        if (!(await again.isVisible())) break;
        await again.click();
        continue;
      }
      await free.first().click();
    }
  }
  const starsAfter = await page.locator('#stars').innerText();
  const num = (s) => parseInt(s.replace(/\D/g, ''), 10);
  if (!(await visible('#next'))) fail.push('no se pudo acertar tras el bloqueo');
  if (!(num(starsAfter) > num(starsBefore))) fail.push(`el acierto no sumó estrella: ${starsBefore} → ${starsAfter}`);
  await shot('07-acierto');

  // --- Cerrar la ronda ---
  step('terminando la ronda');
  const endedAtEnd = await advanceRound(page);
  const chained = await visible('#screenQuiz');
  if (!endedAtEnd && !chained) fail.push('la ronda no llegó ni a la pantalla final ni al siguiente paso');

  /* La cadena tiene que encadenar de verdad. Es un fallo silencioso:
     si startLevel limpia el grupo al entrar en un sub-nivel,
     finish() ya no lo encuentra y salta a la pantalla final tras el
     PRIMER sub-paso. Nada falla, la ronda se acaba antes de tiempo.
     Por eso se mira lo guardado en localStorage y no sólo que
     aparezca la pantalla final. */
  const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('calculia:ordinals'))) || '{}');
  const doneLevels = Object.keys(stored.completed || {});
  if (doneLevels.length < 2) {
    fail.push(`la cadena no encadenó: sólo se completó ${JSON.stringify(doneLevels)} (deberían ser los 3 sub-pasos de "learn")`);
  }

  if (endedAtEnd) {
    const summary = (await page.locator('#finalSummary').innerText()).trim();
    if (!summary) fail.push('la pantalla final está vacía');
    await page.locator('#btnChooseLevel').click();
  } else {
    await page.locator('#backLevelsBtn').click();
  }
  if (await visible('#screenLevels')) await page.locator('#levelsBack').click();
  if (!(await visible('#screenReminder'))) fail.push('no se vuelve al recordatorio');
  await page.locator('#referenceNext').click();
  await shot('08-pasos-completados');

  // --- Los pasos completados se marcan ---
  const done = await page.locator('#levelsGrid .practice-done').count();
  if (done < 1) fail.push('ningún paso se marcó como hecho al terminarlo');
  await shot('09-pasos-hechos');

  await browser.close();
  server.close();

  console.log('\n--- CONTRASTE COMPUTADO (ordinal → cifra/palabra/lugar) ---');
  for (const [label, rows] of Object.entries(contrast)) {
    console.log(`  ${label.padEnd(8)} ` + rows.map((r) => `${r.n}:${r.figRatio}/${r.nameRatio}/${r.placeRatio}`).join('  '));
  }
  console.log('\n--- CARRUSEL ---');
  seen.forEach((s) => console.log('  ' + s));
  console.log('\n--- EJEMPLOS REALES ---');
  facts.forEach((f) => console.log('  ' + f));
  console.log('\n--- REGLA 1 ---');
  ruleOne.forEach((s) => console.log('  ' + s));

  if (errors.length) {
    console.log('\nERRORES DE CONSOLA:');
    errors.forEach((e) => console.log('  ! ' + e));
  }
  if (fail.length || errors.length) {
    console.log('\nFALLOS (' + (fail.length + errors.length) + '):');
    fail.forEach((f) => console.log('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log('\nOK — recorrido de ordinales completo.');
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });