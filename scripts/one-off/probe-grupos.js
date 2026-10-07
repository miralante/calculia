'use strict';
/* Sonda de una pasada para la práctica "grupos" de Cantidades.

   check.js valida estructura y paridad de claves; no abre el
   navegador. Esta sonda recorre el flujo real (menú → intro →
   ejemplos → recordatorio → pasos → juego), comprueba que un acierto
   suma estrella, que un fallo muestra la pista socrática y bloquea
   las opciones, y mide el contraste COMPUTADO de cada grupo en los
   tres temas. Un color literal o un var() sin resolver no da error
   en check.js: solo se ve midiendo el estilo final. */

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

/* Contraste WCAG sobre el estilo computado. */
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
             weight: getComputedStyle(el).fontWeight,
             color: getComputedStyle(el).color };
  };
  return true;
})()`;

/* Avanza la ronda hasta que se cierre o hasta que el sub-nivel se
   encadene. Devuelve true si terminó en la pantalla final.
   Un clic que falla (elemento ya sustituido, opción bloqueada por
   lockUntilAck) NO debe abortar la sonda: se cuenta como "no
   avanzado" y se sale. Cada acción va envuelta porque un bloqueo de
   Playwright esperando un elemento no visible debe verse como un
   paso fallido, nunca como cuatro minutos de silencio. */
async function advanceRound(page) {
  const visible = (sel) => page.locator(sel).isVisible();
  for (let i = 0; i < 80; i++) {
    if (await visible('#screenGroupsEnd')) return true;
    if (!(await visible('#screenGroupsQuiz'))) return false;
    if (await visible('#groupsNext')) {
      try {
        await page.locator('#groupsNext').click({ timeout: 4000 });
      } catch (e) {
        process.stderr.write('  · no se pudo pulsar Siguiente: ' + e.message.split('\n')[0] + '\n');
        return false;
      }
      continue;
    }
    /* La ronda siguiente. Se responde con la primera opción libre; si
       no queda ninguna, la pista está pidiendo su "Entendido" antes
       del siguiente intento (así funciona en Números Romanos). */
    const free = page.locator('#groupsOptions .option-btn:not([disabled])');
    if (await free.count() > 0) {
      try {
        await free.first().click({ timeout: 4000 });
      } catch (e) { return false; }
      continue;
    }
    const ack = page.locator('#groupsExplanationWrap .btn-understood');
    if (await ack.isVisible()) {
      try { await ack.click({ timeout: 4000 }); } catch (e) { return false; }
      continue;
    }
    /* Sin Siguiente, sin libres y sin "Entendido": el estado no se
       explica. Cortar aquí y decirlo es mejor que quedarse esperando. */
    process.stderr.write('  · estado inesperado: ni "Siguiente", ni opciones libres, ni "Entendido"\n');
    return false;
  }
  return await visible('#screenGroupsEnd');
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const { server, port } = await serve();
  const browser = await chromium.launch();
  const errors = [];
  const fail = [];
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  const shot = (name) => page.screenshot({ path: path.join(OUT, 'grupos-' + name + '.png'), fullPage: true });
  const visible = (sel) => page.locator(sel).isVisible();
  /* Traza por paso a stderr: si un click se queda esperando, hay que
     poder ver DÓNDE, y stdout bufferizado no ayuda. */
  const step = (m) => process.stderr.write('  · ' + m + '\n');
  /* Timeouts cortos: una espera de 30 s por acción convierte un bucle
     de ocho pasos en cuatro minutos de silencio. */
  page.setDefaultTimeout(6000);

  step('abriendo la actividad');
  await page.goto(`http://127.0.0.1:${port}/tools/quantities/`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#practiceGrid .btn-practice', { timeout: 8000 });

  // --- Menú: cuatro prácticas, la cuarta es la nueva ---
  const practices = await page.locator('#practiceGrid .btn-practice').allInnerTexts();
  if (practices.length !== 4) fail.push(`el menú debería ofrecer 4 prácticas, hay ${practices.length}`);
  if (!practices.some((p) => /grupo/i.test(p))) fail.push('el menú no ofrece la práctica de grupos');
  await shot('01-menu');

  // --- Entrar en grupos ---
  await page.locator('#practiceGrid .btn-practice', { hasText: 'Contar en grupos' }).click();
  if (!(await visible('#screenIntro'))) fail.push('no se abre la pantalla de intro');
  await shot('02-intro');

  // El carrusel debe recorrer los 6 grupos y mostrar nombre + valor.
  const seen = [];
  for (let i = 0; i < 6; i++) {
    seen.push((await page.locator('#carouselDisplay').innerText()).replace(/\s+/g, ' ').trim());
    await page.locator('#carouselNext').click();
  }
  if (new Set(seen).size !== 6) fail.push(`el carrusel repitió grupo: ${JSON.stringify(seen)}`);
  const cap = await page.locator('#carouselCaption').innerText();
  if (!cap || cap === seen[0]) fail.push('el carrusel no cambia de pie de foto');

  // --- Ejemplos reales ---
  await page.locator('#introNext').click();
  if (!(await visible('#screenFamous'))) fail.push('no se abre la pantalla de ejemplos');
  const facts = [];
  for (let i = 0; i < 5; i++) {
    facts.push(await page.locator('#famousText').innerText());
    await page.locator('#famousNext2').click();
  }
  if (facts.some((f) => !f.trim())) fail.push('algún ejemplo real se quedó sin texto');
  if (facts.some((f) => !f.trim().endsWith(':'))) fail.push('una frase de ejemplo no termina en ":" (rompería la fórmula)');
  await shot('03-ejemplos');

  // --- Recordatorio: tabla de color + dos reglas con ejemplos ---
  await page.locator('#famousNextBtn').click();
  if (!(await visible('#screenReminder'))) fail.push('no se abre el recordatorio');
  const chips = await page.locator('#groupsRow .group-chip').allInnerTexts();
  if (chips.length !== 6) fail.push(`la tabla de recordatorio debería tener 6 grupos, tiene ${chips.length}`);
  const mult = (await page.locator('#ruleMultiply .rule-example').allInnerTexts()).map((s) => s.replace(/\s+/g, ''));
  const dz = (await page.locator('#ruleDozen .rule-example').allInnerTexts()).map((s) => s.replace(/\s+/g, ''));
  if (mult.length < 2 || dz.length < 2) fail.push('las reglas necesitan al menos dos ejemplos cada una');
  // "3 decenas = 3 × 10 = 30"
  if (!mult.some((s) => s === '3decenas=3×10=30')) fail.push(`la regla de multiplicar no cuadra: ${JSON.stringify(mult)}`);
  if (!dz.some((s) => s === '2docenas=2×12=24')) fail.push(`la regla de la docena no cuadra: ${JSON.stringify(dz)}`);
  await shot('04-recordatorio');

  // --- Contraste computado de cada grupo, en los tres temas ---
  await page.addScriptTag({ content: CONTRAST_FN });
  /* El atributo del tercer tema es data-theme="contrast" (no
     "high-contrast"): con el valor equivocado la sonda medía el
     tema claro dos veces y daba un falso verde. */
  const themes = { light: 'light', dark: 'dark', contrast: 'contrast' };
  const contrast = {};
  for (const [label, value] of Object.entries(themes)) {
    await page.evaluate((v) => document.documentElement.setAttribute('data-theme', v), value);
    await page.waitForTimeout(120);
    const rows = await page.$$eval('#groupsRow .group-chip', (els) =>
      els.map((el) => {
        const name = el.querySelector('.group-chip-name');
        const size = el.querySelector('.group-chip-size');
        return {
          name: name.textContent.trim(),
          nameRatio: window.__contrast(name).ratio,
          nameSize: window.__contrast(name).size,
          nameWeight: window.__contrast(name).weight,
          sizeRatio: window.__contrast(size).ratio,
        };
      }));
    contrast[label] = rows;
    rows.forEach((r) => {
      if (r.sizeRatio < 4.5) fail.push(`tema ${label}: valor de "${r.name}" a ${r.sizeRatio}:1 (mínimo AA 4.5)`);
      // AAA para texto grande: ≥24px, o ≥18.66px en negrita.
      const large = r.nameSize >= 24 || (r.nameSize >= 18.66 && Number(r.nameWeight) >= 700);
      const min = large ? 4.5 : 7;
      if (r.nameRatio < min) fail.push(`tema ${label}: nombre "${r.name}" a ${r.nameRatio}:1 (esperaba ${min}:1, ${r.nameSize}px/${r.nameWeight})`);
    });
  }
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  await page.waitForTimeout(120);

  // --- Pasos ---
  await page.locator('#referenceNext').click();
  if (!(await visible('#screenLevels'))) fail.push('no se abre la pantalla de pasos');
  const levels = await page.locator('#levelsGrid .btn-practice').count();
  if (levels !== 3) fail.push(`deberían offered 3 grupos de pasos, hay ${levels}`);
  await shot('05-pasos');

  // --- Juego: nivel "learn", primer paso ---
  await page.locator('#levelsGrid .btn-practice', { hasText: 'Aprender los grupos' }).click();
  if (!(await visible('#screenGroupsQuiz'))) fail.push('no se abre la pantalla de juego');
  const options = await page.locator('#groupsOptions .option-btn').count();
  if (options !== 3) fail.push(`deben ofrecerse 3 opciones, hay ${options}`);
  if (!(await visible('#groupsQuestion'))) fail.push('falta la pregunta');
  await shot('06-juego');

  // Alturas táctiles: el mínimo es 64px (--boton-min).
  const small = await page.$$eval('#groupsOptions .option-btn', (els) =>
    els.map((e) => Math.round(e.getBoundingClientRect().height)).filter((h) => h < 64));
  if (small.length) fail.push(`opciones por debajo del mínimo táctil de 64px: ${small.join(', ')}`);

  /* Ninguna opción puede salirse de su botón. Con una frase
     ("4 decenas") y el tamaño de titular a 375px se salía un poco
     por el borde, y a simple vista el resto del round parecía
     normal. */
  const clipped = await page.$$eval('#groupsOptions .option-btn', (els) =>
    els.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
      .map((e) => e.textContent.trim()));
  if (clipped.length) fail.push(`opciones que se salen de su botón: ${JSON.stringify(clipped)}`);

  // Un fallo debe mostrar la pista y bloquear el resto hasta que la
  // persona pulse "Entendido" (lockUntilAck). No se sabe de antemano
  // qué opción es la buena, así que se hace lo que haría la persona:
  // probar. Si la primera acierta, el camino del fallo se omite.
  step('respondiendo');
  const starsBefore = await page.locator('#stars').innerText();
  await page.locator('#groupsOptions .option-btn').first().click();
  const hitFirstTry = await visible('#groupsNext');

  if (!hitFirstTry) {
    const locked = await page.$$eval('#groupsOptions .option-btn', (els) => els.filter((e) => e.disabled).length);
    const hintShown = await page.locator('#groupsExplanationWrap').isVisible();
    const hintText = (await page.locator('#groupsExplanation').innerText()).trim();
    if (!hintShown) fail.push('un fallo no mostró la explicación');
    if (!hintText) fail.push('la pista socrática está vacía');
    if (locked < 2) fail.push(`un fallo no bloqueó las opciones (solo ${locked} deshabilitadas de 3)`);
    const ack = page.locator('#groupsExplanationWrap .btn-understood');
    if (!(await ack.isVisible())) fail.push('un fallo no ofreció el botón "Entendido"');
    await shot('07-pista');
    step('pulsando Entendido');
    await ack.click();
    /* La opción que se falló sigue fuera a propósito — es el mismo
       comportamiento que Números Romanos: se retira la opción
       equivocada, no se penaliza a la persona. */
    const leftOut = await page.$$eval('#groupsOptions .option-btn', (els) => els.filter((e) => e.disabled).length);
    process.stderr.write(`  · tras "Entendido" quedan ${leftOut} opcion(es) retirada(s)\n`);
    /* Ahora se prueba lo que quede, como haría una persona: si no
       queda ninguna libre, se vuelve a pulsar "Entendido" (la pista
       se lee antes de cada nuevo intento) y se sigue. */
    for (let i = 0; i < 8 && !(await visible('#groupsNext')); i++) {
      const free = page.locator('#groupsOptions .option-btn:not([disabled])');
      if (await free.count() === 0) {
        const ackAgain = page.locator('#groupsExplanationWrap .btn-understood');
        if (!(await ackAgain.isVisible())) break;
        await ackAgain.click();
        continue;
      }
      const label = (await free.first().innerText()).trim();
      await free.first().click();
      const after = await page.$$eval('#groupsOptions .option-btn',
        (els) => els.map((e) => (e.disabled ? '[' + e.textContent.trim() + ']' : e.textContent.trim())).join(' '));
      process.stderr.write(`  · probado "${label}" → opciones: ${after} · siguiente=${await visible('#groupsNext')}\n`);
    }
  }

  // Acierto: debe revelar "Siguiente" y sumar una estrella.
  const nextVisible = await visible('#groupsNext');
  const starsAfter = await page.locator('#stars').innerText();
  if (!nextVisible) fail.push('no se pudo acertar la pregunta tras el bloqueo');
  const n = (s) => parseInt(s.replace(/\D/g, ''), 10);
  if (!(n(starsAfter) > n(starsBefore))) fail.push(`el acierto no sumó estrella: ${starsBefore} → ${starsAfter}`);
  await shot('08-acierto');

  // Al terminar la ronda debe aparecer la pantalla final, o encadenar
  // el siguiente sub-nivel sin pasar por el menú.
  step('terminando la ronda');
  const endedAtEnd = await advanceRound(page);
  const chained = await visible('#screenGroupsQuiz');
  if (!endedAtEnd && !chained) fail.push('la ronda no llegó ni a la pantalla final ni al siguiente paso');

  // --- Volver al menú y comprobar que las prácticas de escribir siguen vivas ---
  /* La cadena de sub-niveles tiene que encadenar de verdad. Es un
     fallo silencioso: si startGroupsLevel limpia el grupo al entrar en
     un sub-nivel, finishGroups() ya no lo encuentra y salta a la
     pantalla final tras el PRIMER sub-paso. Nada falla, la ronda
     simplemente se acaba antes de tiempo. Por eso se mira lo
     guardado, no sólo que la pantalla final aparezca. */
  const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('calculia:quantities'))) || '{}');
  const doneLevels = Object.keys(stored.groupsCompleted || {});
  if (doneLevels.length < 2) {
    fail.push(`la cadena no encadenó: sólo se completó ${JSON.stringify(doneLevels)} (deberían ser varios sub-niveles del grupo)`);
  }

  // Desde la pantalla final se sale al menú; desde un paso
  // encadenado se vuelve primero a los pasos, y de ahí al menú.
  // Saltarse el nivel intermedio no es un atajo: es el camino real.
  if (endedAtEnd) await page.locator('#groupsEndMenu').click();
  else await page.locator('#groupsBackLevels').click();
  if (await visible('#screenLevels')) await page.locator('#levelsBackToMenu').click();
  if (!(await visible('#screenMenu'))) fail.push('no se vuelve al menú');
  step('comprobando que "leer números" sigue viva');
  await page.locator('#practiceGrid .btn-practice', { hasText: 'Leer números' }).click();
  if (!(await visible('#answerInput'))) fail.push('la práctica de leer dejó de funcionar');
  if (!(await visible('#numberShown'))) fail.push('la práctica de leer no muestra el número');
  await shot('09-leer');

  await browser.close();
  server.close();

  console.log('\n--- CONTRASTE COMPUTADO (grupo → ratio) ---');
  for (const [label, rows] of Object.entries(contrast)) {
    console.log(`  ${label.padEnd(6)} ` + rows.map((r) => `${r.name}:${r.nameRatio}/${r.sizeRatio}`).join('  '));
  }
  console.log('\n--- CARRUSEL ---');
  seen.forEach((s) => console.log('  ' + s));
  console.log('\n--- EJEMPLOS REALES ---');
  facts.forEach((f) => console.log('  ' + f));
  console.log('\n--- REGLAS ---');
  mult.forEach((s) => console.log('  ' + s));
  dz.forEach((s) => console.log('  ' + s));

  if (errors.length) {
    console.log('\nERRORES DE CONSOLA:');
    errors.forEach((e) => console.log('  ! ' + e));
  }
  if (fail.length || errors.length) {
    console.log('\nFALLOS (' + (fail.length + errors.length) + '):');
    fail.forEach((f) => console.log('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log('\nOK — recorrido de grupos completo.');
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });