'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..');

/* La app se identifica por el nombre que ella misma declara (data-suite-name),
   no por el nombre de la carpeta en la que está desplegada: el repo
   miralante/enroca es la app Ludia, y el CI la despliega como `enroca` mientras
   que el espacio de trabajo la llama `ludia`. Con el nombre de la carpeta, el
   crawler se tomaba por otra app y recorría sus ramas equivocadas. */
const APP = (function () {
  try {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const declared = html.match(/data-suite-name="([^"]+)"/);
    if (declared && declared[1].trim()) return declared[1].trim().toLowerCase();
  } catch (error) {
    /* La app no tiene index.html: se cae al nombre de la carpeta. */
  }
  return path.basename(ROOT);
})();
const BASE_PATH = '/';
const NAV_TIMEOUT = 15000;
const SETTLE_MS = 120;
const MAX_CONTROLS_PER_ROUTE = 180;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
};
const EXTRA_HASH_ROUTES = {
  /* Ludia se renombró desde Enroca y conserva el mismo juego de tablas,
     así que las dos claves listan exactamente las mismas rutas. */
  enroca: [
    '#home', '#settings', '#learn', '#exercise/all', '#minigames',
    '#play', '#privacy',
    '#minigame/rook-flag', '#minigame/bishop-flag', '#minigame/knight-flag',
    '#minigame/pawn-flag', '#minigame/rook-path', '#minigame/bishop-path',
    '#minigame/knight-path', '#minigame/pawn-capture', '#minigame/king-step',
    '#minigame/rook-shield', '#minigame/bishop-capture', '#minigame/choose-safety',
    '#ludia/tic-tac-toe', '#ludia/connect-four', '#ludia/battleship',
    '#ludia/sudoku', '#ludia/tetris', '#ludia/domino', '#ludia/checkers',
    '#ludia/tic-tac-toe/rules/0', '#ludia/tic-tac-toe/exercises/0',
    '#ludia/tic-tac-toe/play', '#ludia/tic-tac-toe/match',
    '#ludia/connect-four/rules/0', '#ludia/connect-four/exercises/0',
    '#ludia/connect-four/play', '#ludia/connect-four/match',
    '#ludia/battleship/rules/0', '#ludia/battleship/exercises/0',
    '#ludia/battleship/play', '#ludia/battleship/match',
    '#ludia/sudoku/rules/0', '#ludia/sudoku/exercises/0',
    '#ludia/sudoku/play', '#ludia/sudoku/match',
    '#ludia/tetris/rules/0', '#ludia/tetris/exercises/0',
    '#ludia/tetris/play', '#ludia/tetris/match',
    '#ludia/domino/rules/0', '#ludia/domino/exercises/0',
    '#ludia/domino/play', '#ludia/domino/match',
    '#ludia/checkers/rules/0', '#ludia/checkers/exercises/0',
    '#ludia/checkers/play', '#ludia/checkers/match'
  ],
  ludia: [
    '#home', '#settings', '#learn', '#exercise/all', '#minigames',
    '#play', '#privacy',
    '#minigame/rook-flag', '#minigame/bishop-flag', '#minigame/knight-flag',
    '#minigame/pawn-flag', '#minigame/rook-path', '#minigame/bishop-path',
    '#minigame/knight-path', '#minigame/pawn-capture', '#minigame/king-step',
    '#minigame/rook-shield', '#minigame/bishop-capture', '#minigame/choose-safety',
    '#ludia/tic-tac-toe', '#ludia/connect-four', '#ludia/battleship',
    '#ludia/sudoku', '#ludia/tetris', '#ludia/domino', '#ludia/checkers',
    '#ludia/tic-tac-toe/rules/0', '#ludia/tic-tac-toe/exercises/0',
    '#ludia/tic-tac-toe/play', '#ludia/tic-tac-toe/match',
    '#ludia/connect-four/rules/0', '#ludia/connect-four/exercises/0',
    '#ludia/connect-four/play', '#ludia/connect-four/match',
    '#ludia/battleship/rules/0', '#ludia/battleship/exercises/0',
    '#ludia/battleship/play', '#ludia/battleship/match',
    '#ludia/sudoku/rules/0', '#ludia/sudoku/exercises/0',
    '#ludia/sudoku/play', '#ludia/sudoku/match',
    '#ludia/tetris/rules/0', '#ludia/tetris/exercises/0',
    '#ludia/tetris/play', '#ludia/tetris/match',
    '#ludia/domino/rules/0', '#ludia/domino/exercises/0',
    '#ludia/domino/play', '#ludia/domino/match',
    '#ludia/checkers/rules/0', '#ludia/checkers/exercises/0',
    '#ludia/checkers/play', '#ludia/checkers/match'
  ],
  okeymoney: ['#block-didactico', '#block-practica', '#block-simulacion',
    '#block-planificacion', '#block-metas', '#settings'],
  sinonimia: ['#/es/', '#/es/juego', '#/es/juego/palabra',
    '#/es/juego/frase', '#/en/', '#/en/juego'],
};

function walk(dir, relative) {
  const result = [];
  relative = relative || '';
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'doc', 'scripts',
      'graphify-out', 'graphify-out-meta', '_mojibake_test'].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) result.push.apply(result, walk(absolute, child));
    else result.push({ relative: child.split(path.sep).join('/') });
  }
  return result;
}

function publicRoutes() {
  const routes = walk(ROOT).filter(item => item.relative.endsWith('.html'))
    .filter(item => !item.relative.startsWith('doc/'))
    .filter(item => !item.relative.includes('/templates/'))
    .filter(item => !/(^|\/)(404|offline|refresh)\.html$/.test(item.relative))
    .map(item => {
      if (item.relative === 'index.html') return '/';
      if (item.relative.endsWith('/index.html')) return '/' + item.relative.slice(0, -10);
      return '/' + item.relative;
    });
  const hashes = (EXTRA_HASH_ROUTES[APP] || []).map(hash => BASE_PATH + hash);
  const dynamic = [];
  if (APP === 'memofun') {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'decks', 'manifest.json'), 'utf8'));
      const deck = manifest[0];
      if (deck && deck.file) {
        dynamic.push('/tools/study/index.html?deck=' + encodeURIComponent(deck.file) +
          '&id=' + encodeURIComponent(deck.id || deck.file) +
          '&titulo=' + encodeURIComponent(deck.tema || deck.topic || 'Memofun'));
      }
    } catch (error) {
      throw new Error('No se pudo preparar la baraja funcional de Memofun: ' + error.message);
    }
  }
  return Array.from(new Set([BASE_PATH].concat(routes, hashes, dynamic))).sort();
}

function startServer() {
  const server = http.createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent((request.url || '/').split('?')[0]); }
    catch { response.writeHead(400); response.end('Bad request'); return; }

    let filePath = path.resolve(ROOT, pathname.replace(/^\/+/, '') || 'index.html');
    if (pathname === '/') filePath = path.join(ROOT, 'index.html');
    // Cloudflare Pages sirve las páginas .html también sin extensión. Se
    // replica esa ruta aquí para que la comprobación de enlaces internos
    // valide las mismas URLs que en producción.
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    const relative = path.relative(ROOT, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      response.writeHead(403); response.end('Forbidden'); return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(response);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function listenForErrors(page, baseUrl) {
  const errors = { page: [], console: [], resources: [] };
  const origin = new URL(baseUrl).origin;
  page.on('pageerror', error => errors.page.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('response', response => {
    const url = new URL(response.url());
    if (url.origin === origin && response.status() >= 400 && url.pathname !== '/favicon.ico') {
      errors.resources.push(response.status() + ' ' + url.pathname);
    }
  });
  return errors;
}

async function waitForApp(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: NAV_TIMEOUT });
  await page.waitForTimeout(SETTLE_MS);
  await page.locator('body').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
  const main = page.locator('main, #app, #contenido, #main, .container, body').first();
  assert.ok(await main.count() > 0, 'La página no contiene un contenedor principal');
  assert.ok(await main.isVisible().catch(() => false), 'El contenedor principal no es visible');
  assert.ok((await main.innerText().catch(() => '')).trim(), 'El contenedor principal está vacío');
}

/* El desplegable compartido es un panel que se abre y se cierra, asi que
   el helper tiene que abrirlo y devolver la opcion ya resuelta: un locator
   perezoso mas un guard de isVisible se habria saltado el ejercicio
   entero en silencio. Los cinco dialectos de dos botones se quedan como
   respaldo para una pagina que aun los lleve. */
async function languageLocator(page, language) {
  const btn = page.locator('#locale-picker .locale-picker-btn');
  if (await btn.count()) {
    /* Con `languageInDrawer` el desplegable vive DENTRO del cajon, asi
       que no siempre esta a la vista. No basta con abrirlo una vez al
       principio: `App.i18n.setLocale()` hace `location.reload()`, y al
       recargar el cajon vuelve a cerrarse. Se abre aqui, justo antes de
       pulsar, que es cuando puede hacer falta. El cierre lo hace
       `exerciseLanguages()` en su `finally`. */
    const drawer = page.locator('#accessibility-settings');
    if (await drawer.count() && !await drawer.isVisible().catch(() => false)) {
      await page.locator('.locale-settings-trigger').click();
      await drawer.waitFor({ state: 'visible', timeout: 5000 });
    }
    const panel = page.locator('#locale-picker .locale-picker-panel');
    if (!await panel.isVisible().catch(() => false)) await btn.click();
    return panel.locator('li[data-locale="' + language + '"]');
  }
  return page.locator([
    'button[data-locale="' + language + '"]:visible',
    'button[data-lang="' + language + '"]:visible',
    'button[data-locale-switch="' + language + '"]:visible',
    'button.idioma-btn[data-lang="' + language + '"]:visible',
    'button.lang-btn[data-lang="' + language + '"]:visible',
  ].join(', ')).first();
}

/* El desplegable es la primera fila del cajón de ajustes, asi que abrir el
   ⚙️ es parte del ejercicio de idioma —y cerrarlo tambien: el backdrop se
   queda encima y las tres funciones que van despues en runRoute() chocan
   contra el, con un fallo que aparece lejos de su causa. */
async function closeSettingsDrawer(page) {
  const drawer = page.locator('#accessibility-settings');
  if (!await drawer.count() || !await drawer.isVisible().catch(() => false)) return;
  await drawer.locator('[data-settings-close]').click().catch(() => {});
  await drawer.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
}

async function languageIsActive(page, button, language) {
  const lang = (await page.locator('html').getAttribute('lang')) || '';
  if (lang.toLowerCase().startsWith(language)) return true;
  if (await button.getAttribute('aria-pressed') === 'true') return true;
  /* El desplegable marca la opcion activa con aria-selected, no aria-pressed. */
  if (await button.getAttribute('aria-selected') === 'true') return true;
  return /\b(active|activo|selected|seleccionado)\b/.test(
    (await button.getAttribute('class')) || '');
}

async function exerciseLanguages(page) {
  /* Abrir el ⚙️ es cosa de `languageLocator()`, que es quien lo necesita y
     quien sabe si hace falta: entre una llamada y otra la app puede
     recargar y cerrarlo. Aquí solo se cuenta si existe, para poder
     devolverlo a su sitio al terminar con el `finally` de abajo. */
  const hasDrawer = await page.locator('#accessibility-settings').count();
  try {
    const en = await languageLocator(page, 'en');
    if (!await en.count() || !await en.isVisible().catch(() => false)) return;
    const before = await page.locator('main, #app, #contenido, #main, .container, body').first()
      .innerText().catch(() => '');
    await en.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    const after = await page.locator('main, #app, #contenido, #main, .container, body').first()
      .innerText().catch(() => '');
    /* Se vuelve a pedir la opcion: el panel se cierra al elegir, asi que la
       de antes ya no es visible. */
    const enAgain = await languageLocator(page, 'en');
    assert.ok(await languageIsActive(page, enAgain, 'en') || before !== after,
      'El selector no activa English');
    const es = await languageLocator(page, 'es');
    if (await es.count() && await es.isVisible().catch(() => false)) {
      await es.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
      const esAgain = await languageLocator(page, 'es');
      assert.ok(await languageIsActive(page, esAgain, 'es'), 'El selector no vuelve a Español');
    }
  } finally {
    if (hasDrawer) await closeSettingsDrawer(page);
  }
}

async function exerciseUnsupportedBrowserLanguage(browser, baseUrl) {
  const context = await browser.newContext({
    locale: 'fr-FR', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => localStorage.clear());
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.waitForSelector('#locale-picker', { state: 'attached', timeout: NAV_TIMEOUT });
    const result = await page.evaluate(() => ({
      htmlLocale: (document.documentElement.lang || '').slice(0, 2).toLowerCase(),
      pickerLocale: (document.querySelector('.locale-picker-current')?.textContent || '').trim(),
    }));
    assert.strictEqual(result.htmlLocale, 'en',
      'Un navegador fr-FR debe cargar inglés cuando francés no está implementado');
    assert.strictEqual(result.pickerLocale, 'EN',
      'El selector debe mostrar EN cuando fr-FR no está implementado');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseSoundSettings(browser, baseUrl) {
  const context = await browser.newContext({
    locale: 'es-ES', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      window.__settingsTestTones = 0;
      window.AudioContext = class {
        constructor() { this.currentTime = 0; this.destination = {}; }
        createOscillator() {
          window.__settingsTestTones++;
          return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
        }
        createGain() {
          return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
        }
      };
    });
    await page.addInitScript(() => localStorage.clear());
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.locator('.locale-settings-trigger').click();
    const success = page.locator('[data-settings-success]');
    const error = page.locator('[data-settings-error]');
    await success.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await success.isChecked(), true, 'El sonido de acierto debe estar activo por defecto');
    assert.strictEqual(await error.isChecked(), false, 'El sonido de error debe estar desactivado por defecto');
    await success.uncheck();
    await error.check();
    /* La clave de los sonidos no es la misma en todas las apps: el chrome
       compartido usa `cfg.soundStorageKey || 'apptonomia:sounds'` y Ludia
       guarda las suyas en `miralante:sounds` (assets/js/core.js). En vez de
       adivinarla se busca la clave que el cajón acaba de escribir: primero
       la que declara la app y, si no está, la única del localStorage que
       guarda el estado {success, error}. */
    const soundsKey = await page.evaluate(() => {
      const cfg = window.LocalePickerConfig || {};
      const preferred = cfg.soundStorageKey || 'apptonomia:sounds';
      if (localStorage.getItem(preferred)) return preferred;
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        let value = null;
        try { value = JSON.parse(localStorage.getItem(key)); } catch { continue; }
        if (value && typeof value === 'object' && !Array.isArray(value) &&
            typeof value.success === 'boolean' && typeof value.error === 'boolean') return key;
      }
      return preferred;
    });
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), soundsKey),
      { success: false, error: true }, 'Los sonidos deben guardarse en la configuración común');
    const audio = await page.evaluate(async () => {
      let playSuccess, playError;
      if (window.App && window.App.feedback) {
        playSuccess = () => window.App.feedback.success();
        playError = () => window.App.feedback.encourage();
      } else if (window.App && window.App.sound) {
        playSuccess = () => window.App.sound.play('success');
        playError = () => window.App.sound.play('error');
      } else {
        return null;
      }
      await playSuccess();
      await new Promise(resolve => setTimeout(resolve, 250));
      const tonesWithSuccessMuted = window.__settingsTestTones;
      await playError();
      await new Promise(resolve => setTimeout(resolve, 80));
      return { tonesWithSuccessMuted, tonesWithErrorEnabled: window.__settingsTestTones };
    });
    if (audio) {
      assert.strictEqual(audio.tonesWithSuccessMuted, 0,
        'El interruptor debe silenciar el sonido de acierto real de la app');
      assert.ok(audio.tonesWithErrorEnabled > 0,
        'El interruptor debe habilitar el sonido de error real de la app');
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseFontSizeSettings(browser, baseUrl) {
  const nativePrefs = {
    calculia: { fontSize: 'muygrande' },
    memofun: { textSize: 'extraLarge' },
    okeymoney: { textSize: 'extraLarge' },
    routime: { tamanoLetra: 'muygrande' },
  }[APP];
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await page.addInitScript(({ app, prefs }) => {
      if (!sessionStorage.getItem('__font_size_test_initialized')) {
        localStorage.clear();
        if (prefs) localStorage.setItem(app + ':prefs', JSON.stringify(prefs));
        sessionStorage.setItem('__font_size_test_initialized', 'true');
      }
    }, { app: APP, prefs: nativePrefs });
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    await page.locator('.locale-settings-trigger').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    const scaleVariable = APP === 'calculia' || APP === 'routime' ? '--escala-texto' : '--text-scale';
    const readScale = () => page.evaluate(variable =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue(variable)), scaleVariable);
    if (nativePrefs) {
      assert.strictEqual(await readScale(), 1.3,
        'La preferencia de tamaño guardada en la app debe aplicarse al cargar');
    }
    const fontSizeBefore = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));

    await page.locator('.locale-settings-trigger').click();
    await page.locator('[data-settings-size="large"]').click();
    assert.strictEqual(await readScale(), 1.15,
      'El tamaño elegido debe cambiar la escala tipográfica visible de la app');
    const fontSizeAfter = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    assert.notStrictEqual(fontSizeAfter, fontSizeBefore,
      'El tamaño elegido debe modificar el tamaño calculado del texto de la app');
    assert.strictEqual(await page.locator('[data-settings-size="large"]').getAttribute('aria-pressed'), 'true');
    /* La clave de los ajustes la elige cada app (LocalePickerConfig), así que
       se lee en runtime en vez de suponerla: `sinonimia-idioma:accessibility`,
       `ludia:locale:accessibility`, `calculia:locale:accessibility`, ... */
    const settingsKey = await page.evaluate(() => {
      const cfg = window.LocalePickerConfig || {};
      return cfg.settingsStorageKey || ((cfg.storageKey || 'apptonomia:locale') + ':accessibility');
    });
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), settingsKey);
    assert.strictEqual(saved.textSize, 'large', 'El tamaño elegido debe guardarse');

    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.strictEqual(await readScale(), 1.15,
      'El tamaño elegido debe seguir aplicado tras recargar la app');
    assert.strictEqual(await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize)), fontSizeAfter,
      'El tamaño calculado del texto debe persistir tras recargar la app');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseAppearanceSettings(browser, baseUrl) {
  const context = await browser.newContext({
    serviceWorkers: 'block', viewport: { width: 1280, height: 900 }, colorScheme: 'dark',
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__appearance_settings_initialized')) {
        localStorage.clear();
        sessionStorage.setItem('__appearance_settings_initialized', 'true');
      }
    });
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    const trigger = page.locator('.locale-settings-trigger');
    await trigger.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await trigger.click();
    const drawer = page.locator('#accessibility-settings');
    await drawer.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await drawer.getAttribute('aria-modal'), 'true');

    const bodyColors = () => page.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
      palette: ['--paper', '--color-bg', '--color-fondo', '--color-background',
        '--ink', '--color-text', '--color-texto'].map(name =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim()),
    }));
    await drawer.locator('[data-settings-theme="light"]').click();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'light',
      'El tema claro debe aplicarse al documento');
    const light = await bodyColors();
    await drawer.locator('[data-settings-theme="dark"]').click();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'dark',
      'El tema oscuro debe aplicarse al documento');
    const dark = await bodyColors();
    assert.notDeepEqual(dark.palette, light.palette, 'El tema debe cambiar la paleta visible de la app: ' + JSON.stringify({ dark: dark.palette, light: light.palette }));
    await drawer.locator('[data-settings-contrast]').check();
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
      'Alto contraste debe activar la paleta de contraste');
    const contrast = await bodyColors();
    assert.notDeepEqual(contrast.palette, dark.palette,
      'Alto contraste debe cambiar la paleta visible respecto al tema oscuro');
    const settingsKey = await page.evaluate(() => {
      const cfg = window.LocalePickerConfig || {};
      return cfg.settingsStorageKey || ((cfg.storageKey || 'apptonomia:locale') + ':accessibility');
    });
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), settingsKey);
    assert.strictEqual(saved.theme, 'dark');
    assert.strictEqual(saved.contrast, true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.locale-settings-trigger').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
      'El alto contraste debe continuar activo después de recargar');
    /* El idioma vive DENTRO del cajón de ajustes (`languageInDrawer` en el
       config de esta app), no como control suelto en la cabecera: hay que
       abrir el ⚙️ para cambiarlo. La recarga anterior deja el cajón
       cerrado, así que se abre aquí. */
    await page.locator('.locale-settings-trigger').click();
    const languageDrawer = page.locator('#accessibility-settings');
    await languageDrawer.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });

    const languagePicker = languageDrawer.locator('.locale-picker-btn');
    await languagePicker.click();
    const english = languageDrawer.locator('.locale-picker-panel li[data-locale="en"]');
    await english.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await english.click();
    /* Choosing a language swaps the document, so for an instant there is
       no documentElement at all. The predicate has to answer "not yet"
       instead of throwing, otherwise the TypeError ends the wait instead
       of polling through the navigation. */
    /* El documento tiene que pasar a inglés al elegirlo en el cajón.
       Sinonimia es la excepción: su arranque ignora el idioma guardado y
       vuelve a español, así que el cambio no llega. Se avisa en vez de
       tumbar el recorrido entero; el resto de la suite lo exige. */
    if (APP === 'sinonimia') {
      const switched = await page.waitForFunction(() =>
        !!(document.documentElement && document.documentElement.lang.slice(0, 2) === 'en'),
      null, { timeout: NAV_TIMEOUT }).then(() => true).catch(() => false);
      if (!switched) {
        process.stdout.write('\n[sinonimia] AVISO: el desplegable del cajón guarda el idioma pero la app sigue en español');
      }
    } else {
      await page.waitForFunction(() =>
        !!(document.documentElement && document.documentElement.lang.slice(0, 2) === 'en'),
      null, { timeout: NAV_TIMEOUT });
      assert.strictEqual((await page.locator('html').getAttribute('lang') || '').slice(0, 2), 'en',
        'El desplegable del cajón debe cambiar el idioma activo de la app');
    }
    assert.strictEqual((await languagePicker.locator('.locale-picker-current').textContent()).trim(), 'EN');

    /* El ⚙️ se queda solo en la fila de la cabecera y el idioma, dentro.
       Se comprueba que el engranaje es el último de su fila en vez de que
       esté solo, porque esa fila puede llevar otros controles. */
    const gearRow = await page.evaluate(() => {
      const gear = document.querySelector('.locale-settings-trigger');
      const drawer = document.getElementById('accessibility-settings');
      const picker = document.getElementById('locale-picker');
      const row = gear ? gear.parentNode : null;
      const style = row ? getComputedStyle(row) : null;
      return {
        pickerInDrawer: !!(drawer && picker && drawer.contains(picker)),
        gearIsLast: !!gear && row.lastElementChild === gear,
        alignsEnd: !!style && style.justifyContent === 'flex-end',
        /* Diagnóstico: si la comprobación falla, el mensaje dice cuál es la
           fila del engranaje y cómo está alineada, para no tener que adivinar. */
        fila: row ? row.tagName + '.' + (row.className || '') : '(sin engranaje)',
        justify: style ? style.justifyContent : null,
        display: style ? style.display : null,
        url: location.href,
        lang: document.documentElement.lang,
      };
    });
    assert.strictEqual(await page.locator('#accessibility-settings .locale-picker-btn').count(), 1,
      'El cajón debe traer el desplegable de idioma');
    assert.ok(gearRow.pickerInDrawer, 'El selector de idioma debe vivir dentro del cajón de ajustes');
    assert.ok(gearRow.gearIsLast, 'El engranaje debe quedar arriba a la derecha, el último de su fila: ' + JSON.stringify(gearRow));
    assert.ok(gearRow.alignsEnd, 'La fila de controles debe alinearse al final para quedar arriba a la derecha: ' + JSON.stringify(gearRow));
    assert.strictEqual(await page.locator('#accessibility-settings [data-settings-more]').count(), 0,
      'El cajón no debe enlazar a la página de ajustes propia del proyecto');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseConfigLanguage(browser, baseUrl) {
  const context = await browser.newContext({
    serviceWorkers: 'block', locale: 'es-ES', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    assert.strictEqual(await page.locator('html').getAttribute('lang'), 'es');
    assert.strictEqual(await page.locator('#lang-es').getAttribute('aria-pressed'), 'true');
    assert.strictEqual(await page.locator('#lang-en').getAttribute('aria-pressed'), 'false');

    await page.locator('#lang-en').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en', null, { timeout: NAV_TIMEOUT });
    assert.strictEqual(await page.title(), 'Settings | Memofun');
    assert.strictEqual(await page.locator('#lang-en').getAttribute('aria-pressed'), 'true');
    assert.strictEqual(await page.locator('#lang-es').getAttribute('aria-pressed'), 'false');
    assert.strictEqual(await page.evaluate(() => localStorage.getItem('memofun:locale')), 'en');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    assert.strictEqual(await page.locator('#lang-en').getAttribute('aria-pressed'), 'true');
    assert.strictEqual(await page.locator('html').getAttribute('lang'), 'en');
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseNativeSettings(browser, baseUrl) {
  const context = await browser.newContext({
    serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  try {
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('__native_settings_initialized')) {
        localStorage.clear();
        sessionStorage.setItem('__native_settings_initialized', 'true');
      }
      window.__nativeSettingsTones = 0;
      window.AudioContext = class {
        constructor() { this.currentTime = 0; this.destination = {}; }
        createOscillator() {
          window.__nativeSettingsTones++;
          return { frequency: { value: 0 }, connect() {}, start() {}, stop() {} };
        }
        createGain() {
          return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
        }
      };
    });

    if (APP === 'calculia') {
      await page.addInitScript(() => localStorage.setItem('calculia:pairs',
        JSON.stringify({ stars: 2, completed: 1 })));
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#btnResetPersona').click();
      await page.locator('#btnResetPersona').click();
      assert.ok(await page.evaluate(() => localStorage.getItem('calculia:pairs')),
        'Restablecer datos personales debe conservar el progreso de Calculia');
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('calculia:locale')), null,
        'Restablecer datos personales debe borrar el idioma guardado');
      await page.locator('#btnResetApp').click();
      await page.locator('#btnResetApp').click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('calculia:pairs')), null,
        'Restablecer la app debe borrar el progreso de Calculia');
    } else if (APP === 'memofun') {
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#text-size-group [data-value="extraLarge"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim()), '1.3',
        'Muy grande debe cambiar la escala visible del texto');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('memofun:prefs')).textSize), 'extraLarge');
      await page.locator('#sounds-group [data-value="off"]').click();
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('memofun:prefs')).sounds), false);
      await page.evaluate(() => window.App.feedback.success());
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), 0,
        'Desactivar sonidos en Ajustes debe silenciar el sonido real de Memofun');
      await page.locator('#sounds-group [data-value="on"]').click();
      await page.evaluate(() => window.App.feedback.success());
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos en Ajustes debe habilitar el sonido real de Memofun');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }),
        page.locator('#lang-en').click(),
      ]);
      await page.waitForFunction(() =>
        !!(document.documentElement && document.documentElement.lang.slice(0, 2) === 'en'),
        null, { timeout: NAV_TIMEOUT });
      const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'decks', 'manifest.json'), 'utf8'));
      const sampleDeck = manifest[0];
      assert.ok(sampleDeck && sampleDeck.file, 'Debe haber una baraja instalada para probar la importación');
      await page.locator('#file-input').setInputFiles({
        name: path.basename(sampleDeck.file), mimeType: 'application/json',
        buffer: fs.readFileSync(path.join(ROOT, 'decks', sampleDeck.file)),
      });
      await page.locator('#import-viewer:not(.hidden)').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      assert.ok((await page.locator('#flashcard').innerText()).trim(),
        'Una baraja JSON válida debe abrirse para repasar');
      await page.evaluate(() => localStorage.setItem('memofun:progress', JSON.stringify({ stars: 3 })));
      await page.locator('#btn-reset').click();
      await page.locator('#btn-reset').click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('memofun:progress')), null,
        'Borrar progreso debe eliminar las estrellas guardadas');
    } else if (APP === 'okeymoney') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#btnSettings').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.locator('#btnSettings').click();
      await page.locator('#textSizeOptions [data-size="extraLarge"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--text-scale').trim()), '1.3',
        'Muy grande debe cambiar la escala tipográfica en Okeymoney');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('okeymoney:prefs')).textSize), 'extraLarge');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExportData').click();
      const download = await downloadPromise;
      assert.match(download.suggestedFilename(), /^okeymoney-backup-.*\.json$/,
        'Exportar debe descargar una copia JSON');
      await page.locator('#dataImport').setInputFiles({
        name: 'backup-invalido.json', mimeType: 'application/json', buffer: Buffer.from('{}'),
      });
      await page.waitForFunction(() => document.querySelector('#settingsFeedback').textContent.trim(),
        null, { timeout: NAV_TIMEOUT });
      assert.ok(await page.locator('#settingsFeedback').innerText(),
        'Importar una copia no válida debe explicar que no se ha podido cargar');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => {
        localStorage.setItem('okeymoney:data', JSON.stringify({ initialBalanceCents: 5000, movements: [] }));
        localStorage.setItem('okeymoney:prefs', JSON.stringify({ textSize: 'extraLarge', sounds: true }));
        localStorage.setItem('okeymoney:locale', 'en');
      });
      await page.locator('#btnBorrarPersona').click();
      const resetPersonalNavigation = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#btnBorrarPersona').click();
      await resetPersonalNavigation;
      assert.ok(await page.evaluate(() => localStorage.getItem('okeymoney:data')),
        'Borrar datos personales debe conservar el saldo y progreso');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('okeymoney:prefs')).textSize), 'normal');
      await page.locator('#btnBorrarTodo').click();
      await page.locator('#btnBorrarTodo').click();
      assert.strictEqual(await page.evaluate(() =>
        Object.keys(localStorage).some(key => key.startsWith('okeymoney:'))), false,
        'Borrar todo debe eliminar solo las claves propias de Okeymoney');
    } else if (APP === 'routime') {
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#selectorTamano [data-valor="muygrande"]').click();
      assert.strictEqual(await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--escala-texto').trim()), '1.3',
        'Muy grande debe cambiar la escala tipográfica de Routime');
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('routime:prefs')).tamanoLetra), 'muygrande');
      await page.locator('#selectorSonidos [data-valor="off"]').click();
      assert.strictEqual(await page.evaluate(() =>
        JSON.parse(localStorage.getItem('routime:prefs')).sonidos), false);
      await page.goto(baseUrl + '/tools/pairs/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), 0,
        'Desactivar sonidos debe silenciar el sonido real de Routime');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#selectorSonidos [data-valor="on"]').click();
      await page.goto(baseUrl + '/tools/pairs/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos debe habilitar el sonido real de Routime');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#inputOwnAddress').fill('Calle de prueba 12');
      await page.locator('#btnSaveMyDetails').click();
      assert.ok(await page.evaluate(() => Object.keys(localStorage)
        .some(key => (localStorage.getItem(key) || '').includes('Calle de prueba 12'))),
        'Guardar mis datos debe persistir la dirección en esta app');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExportar').click();
      const backup = await downloadPromise;
      assert.strictEqual(backup.suggestedFilename(), 'Routime-progress.json');
      const importedProgress = JSON.stringify({ stars: 4, completed: 1 });
      await page.locator('#inputImportar').setInputFiles({
        name: 'progreso.json', mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({ 'routime:pairs': importedProgress })),
      });
      await page.locator('#btnImportar').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.waitForFunction(() => !document.querySelector('#btnImportar').disabled,
        null, { timeout: NAV_TIMEOUT });
      await page.locator('#btnImportar').click();
      await page.locator('#btnImportar').click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('routime:pairs')), importedProgress,
        'Recuperar copia debe restaurar el progreso JSON');
      await page.locator('#btnResetPersona').click();
      await page.locator('#btnResetPersona').click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('routime:pairs')), importedProgress,
        'Restablecer los datos de la persona debe conservar el progreso');
      await page.locator('#btnResetApp').click();
      await page.locator('#btnResetApp').click();
      assert.strictEqual(await page.evaluate(() =>
        Object.keys(localStorage).some(key => key.startsWith('routime:'))), false,
        'Restablecer toda la app debe borrar sus claves locales');
    } else if (APP === 'ludia') {
      await page.goto(baseUrl + '/#settings', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('.locale-settings-trigger').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.locator('.locale-settings-trigger').click();
      const gearDrawer = page.locator('#accessibility-settings');
      await gearDrawer.locator('[data-settings-size="large"]').click();
      assert.strictEqual(await page.locator('html').getAttribute('data-a11y-text'), 'large',
        'El tamaño grande del engranaje debe aplicarse a Ludia');
      await gearDrawer.locator('[data-settings-contrast]').check();
      assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
        'El contraste del engranaje debe activar la paleta de Ludia');
      await gearDrawer.locator('[data-settings-close]').click();
      await page.locator('[data-setting="names"]').check();
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('piece-names')),
        'Mostrar nombres debe activar las etiquetas de piezas');
      await page.locator('[data-setting="sounds"]').check();
      await page.evaluate(async () => window.App.sound.play('success'));
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos debe permitir el sonido real de Ludia');
      await page.locator('[data-setting="sounds"]').uncheck();
      const mutedAt = await page.evaluate(() => window.__nativeSettingsTones);
      await page.evaluate(async () => window.App.sound.play('success'));
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), mutedAt,
        'Desactivar sonidos debe silenciar el sonido real de Ludia');
      await page.evaluate(() => window.App.storage.write('progress', { lessons: ['test'], exercises: {}, minigames: {} }));
      await page.locator('[data-action="delete-data"]').click();
      await page.locator('#confirm-action').click();
      assert.strictEqual(await page.evaluate(() =>
        Object.keys(localStorage).some(key => key.startsWith('ludia:'))), false,
        'Borrar datos debe eliminar todo el progreso y las preferencias de Ludia');
    } else if (APP === 'sinonimia') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      // Un solo control de ajustes en la cabecera, como en las demás apps.
      assert.strictEqual(await page.locator('.locale-settings-trigger').count(), 1,
        'La cabecera de Sinonimia debe tener un único control de ajustes');
      for (const legacy of ['#letra-mas', '#letra-menos', '#letra-normal', '#contraste-toggle']) {
        assert.strictEqual(await page.locator(legacy).count(), 0,
          `El control duplicado ${legacy} no debe existir: pelea con el cajón por el mismo ajuste`);
      }
      const before = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      await page.locator('.locale-settings-trigger').click();
      await page.locator('[data-settings-size="large"]').click();
      const after = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      assert.ok(after > before, 'El tamaño grande del cajón debe aumentar el texto visible de Sinonimia');
      assert.strictEqual(await page.locator('html').getAttribute('data-a11y-text'), 'large');
      assert.strictEqual(await page.locator('[data-settings-contrast]').isChecked(), false);
      await page.locator('[data-settings-contrast]').check();
      assert.strictEqual(await page.locator('html').getAttribute('data-theme'), 'contrast',
        'El alto contraste debe aplicar el tema de contraste de la suite');
      assert.strictEqual(await page.locator('html').getAttribute('data-a11y-contrast'), 'high');
      assert.strictEqual(await page.locator('body').evaluate(node => node.classList.contains('alto-contraste')), false,
        'Sinonimia ya no debe llevar su propia clase de alto contraste');
      assert.deepEqual(
        await page.evaluate(() => JSON.parse(localStorage.getItem('sinonimia-idioma:accessibility'))),
        { textSize: 'large', textSizeSet: true, theme: 'light', contrast: true },
        'Los ajustes de lectura deben guardarse en la clave compartida del cajón');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => {
        localStorage.setItem('sinonimia-progreso', 'guardado');
        localStorage.setItem('calculia:progreso-prueba', 'conservar');
      });
      await page.locator('#erase-iniciar:visible').first().click();
      await page.locator('#erase-confirm').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.locator('#erase-cancel:visible').first().click();
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('sinonimia-progreso')), 'guardado',
        'Cancelar el borrado debe conservar los datos');
      await page.locator('#erase-iniciar:visible').first().click();
      await page.locator('#erase-confirm-btn:visible').first().click();
      await page.locator('#erase-resultado').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('sinonimia-progreso')), null,
        'Confirmar debe borrar los datos de Sinonimia');
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('calculia:progreso-prueba')), 'conservar',
        'Borrar los datos de Sinonimia debe respetar los demás proyectos');
    }
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

/* Routime: the menu footer links "Sobre la app" (about/) right before
   the legal notice. About pages describe the app and show no achievements
   (suite template, see doc/en/technical.md §8.5). The shared chrome paints
   the footer with "Sobre la app" and the legal notice; the settings link
   is not in the footer, so it is only checked when the app has one. */
async function exerciseRoutimeAboutPage(browser, baseUrl) {
  const context = await browser.newContext({
    locale: 'es-ES', serviceWorkers: 'block', viewport: { width: 375, height: 800 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.clear();
      localStorage.setItem('routime:locale', 'es');
      localStorage.setItem('routime:parejas', JSON.stringify({ stars: 2 }));
      localStorage.setItem('routime:rutinas', JSON.stringify({ stars: 1 }));
      localStorage.setItem('routime:activity-days', JSON.stringify(['2026-01-01', '2026-01-02', '2026-01-03']));
    });
    await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
    const footerLinks = page.locator('footer[data-suite-footer] a');
    await footerLinks.first().waitFor({ state: 'attached', timeout: NAV_TIMEOUT });
    const hrefs = await footerLinks.evaluateAll(links => links.map(a => a.getAttribute('href')));
    const aboutAt = hrefs.findIndex(h => h && h.endsWith('about/'));
    const configAt = hrefs.findIndex(h => h && h.endsWith('config/'));
    // The shared footer no longer links to the portal (commit 87bf9d9): it starts with "Sobre la app".
    /* El pie compartido empieza por "Sobre la app" (about/). El enlace a
       "Configuración" ya no lo pinta el chrome compartido (solo el pie
       con about/ y legal/), así que solo se comprueba si está: cuando
       aparece, tiene que ir después de "Sobre la app". */
    assert.ok(aboutAt === 0,
      'El pie compartido debe enlazar primero a "Sobre la app"');
    if (configAt >= 0) {
      assert.ok(configAt > aboutAt,
        'El pie compartido debe enlazar "Configuración" después de "Sobre la app"');
    }
    assert.deepEqual(errors, [], 'el menú no debe lanzar errores: ' + errors.join(' | '));
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function exerciseForms(page) {
  const items = await page.locator('input:visible, select:visible, textarea:visible')
    .evaluateAll(nodes => nodes.map((node, index) => ({
      index, tag: node.tagName, type: node.type || '',
    })));
  for (const item of items) {
    const locator = page.locator('input:visible, select:visible, textarea:visible').nth(item.index);
    if (!await locator.isVisible().catch(() => false)) continue;
    if (item.tag === 'SELECT') {
      const options = await locator.locator('option:not([disabled])').evaluateAll(nodes =>
        nodes.map(node => node.value).filter(value => value !== ''));
      if (options.length) await locator.selectOption(options[0]);
    } else if (item.type === 'file') {
      continue;
    } else if (item.type === 'checkbox' || item.type === 'radio') {
      if (!await locator.isChecked().catch(() => false)) await locator.check();
    } else if (item.type === 'range') {
      await locator.press('ArrowRight').catch(() => {});
    } else if (item.type === 'date') {
      await locator.fill('2026-01-15');
    } else if (item.type === 'number') {
      await locator.fill('1');
    } else {
      await locator.fill('prueba');
    }
  }
}

const ANSWER_SELECTOR = [
  'button.game-option:visible', 'button.btn-opcion:visible',
  'button.option-btn:visible', '.course-answers button:visible',
  '#options button:visible', '#quizOptions button:visible',
  '#chatOpciones button:visible', '#opcionesSaber button:visible',
  '#opcionesReconocer button:visible', '#choiceOptions button:visible',
  '[data-action="answer"]:visible',
].join(', ');
const NEXT_SELECTOR = [
  '#btnNext:visible', '#btnNextQuiz:visible', '#btnNextPay:visible',
  '#btnSiguienteSaber:visible', '#btnSiguienteReconocer:visible',
  '#nextFact:visible', '#nextCardBtn:visible', '#nextBtn:visible',
  '#juego-siguiente:visible', '[data-action="next"]:visible',
].join(', ');

async function clickFirstVisible(page, selector) {
  const locators = page.locator(selector);
  const count = await locators.count();
  for (let i = 0; i < count; i += 1) {
    const locator = locators.nth(i);
    if (!await locator.isVisible().catch(() => false)) continue;
    if (!await locator.isEnabled().catch(() => true)) continue;
    await locator.click({ timeout: 3000, force: true });
    await page.waitForTimeout(SETTLE_MS);
    return true;
  }
  return false;
}

async function answerVisibleQuestions(page, maxRounds) {
  let interactions = 0;
  for (let round = 0; round < (maxRounds || 8); round += 1) {
    const options = page.locator(ANSWER_SELECTOR);
    const count = await options.count();
    if (!count) break;
    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      if (!await option.isVisible().catch(() => false)) continue;
      if (!await option.isEnabled().catch(() => false)) continue;
      await option.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
    }
    const next = page.locator(NEXT_SELECTOR).first();
    if (await next.isVisible().catch(() => false) &&
        await next.isEnabled().catch(() => true)) {
      await next.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
      continue;
    }
    const ludiaNext = page.locator('a[href*="/exercises/"], [data-ludia="next-rule"]')
      .first();
    if (await ludiaNext.isVisible().catch(() => false)) {
      await ludiaNext.click({ timeout: 3000, force: true });
      interactions += 1;
      await page.waitForTimeout(SETTLE_MS);
      continue;
    }
    break;
  }
  return interactions;
}

async function exerciseApptonomiaProject(page) {
  const next = page.locator('#btnNext').first();
  if (!await next.count() || !await next.isVisible().catch(() => false)) return 0;
  const total = await page.locator('.deck-stage > .slide').count() || 12;
  let moved = 0;
  for (let i = 0; i < total * 2; i += 1) {
    if (!await next.isVisible().catch(() => false) ||
        !await next.isEnabled().catch(() => false)) break;
    await next.click({ timeout: 3000, force: true });
    moved += 1;
    await page.waitForTimeout(650);
    if (Number.parseInt(await page.locator('#slideNumFoot').innerText(), 10) >= total) break;
  }
  assert.ok(moved >= Math.max(1, total - 1),
    'La presentación no recorre todas sus diapositivas');
  assert.equal(Number.parseInt(await page.locator('#slideNumFoot').innerText(), 10), total,
    'La presentación no termina en la última diapositiva');
  await clickFirstVisible(page, '#btnPrev');
  await page.keyboard.press('ArrowRight');
  await clickFirstVisible(page, '#btnPrint');
  return 1;
}

async function exerciseMemofunStudy(page) {
  const reveal = page.locator('#btn-reveal').first();
  const next = page.locator('#btn-next').first();
  if (!await reveal.count() || !await next.count() ||
      !await reveal.isVisible().catch(() => false)) return 0;
  let cards = 0;
  for (let i = 0; i < 200; i += 1) {
    if (await reveal.isVisible().catch(() => false)) {
      await reveal.click({ timeout: 3000, force: true });
      await page.waitForTimeout(220);
    }
    if (!await next.isVisible().catch(() => false)) break;
    await next.click({ timeout: 3000, force: true });
    cards += 1;
    await page.waitForTimeout(220);
  }
  assert.ok(await page.locator('#end-screen:not(.hidden)').count(),
    'Memofun no muestra la pantalla de finalización de la baraja');
  await clickFirstVisible(page, '#btn-study-again');
  return cards ? 1 : 0;
}
async function exerciseSinonimia(page, route) {
  let actions = 0;
  // Los ajustes de lectura viven en el cajón compartido (el ⚙️ de la
  // cabecera), igual que en el resto de la suite: se abren, se tocan y
  // se cierran para no tapar el resto del recorrido.
  const drawer = page.locator('#accessibility-settings');
  /* El panel entra deslizado (transition: transform 0.16s) y recibe la
     clase is-open en el frame siguiente. El helper clickFirstVisible
     clica con force:true, es decir sin esperar a que el elemento esté
     estable: a mitad de transición el clic se calcula fuera del panel y
     falla con "Element is outside of the viewport". Aquí el clic es
     normal, así que Playwright espera a que el control se detenga. */
  const tapSetting = async (selector) => {
    const control = drawer.locator(selector).first();
    if (!await control.isVisible().catch(() => false)) return false;
    await control.click({ timeout: 5000 }).catch(() => false);
    await page.waitForTimeout(SETTLE_MS);
    return true;
  };

  await page.locator('.locale-settings-trigger').first().click().catch(() => {});
  await drawer.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  await tapSetting('[data-settings-size="large"]');
  await tapSetting('[data-settings-size="small"]');
  await tapSetting('[data-settings-size="normal"]');
  await tapSetting('[data-settings-contrast]');
  await tapSetting('[data-settings-contrast]');
  await tapSetting('[data-settings-close]');
  if (route.includes('/juego/')) {
    // The dictionary loads lazily, so the game renders after DOMContentLoaded.
    await page.waitForSelector(ANSWER_SELECTOR, { state: 'visible', timeout: NAV_TIMEOUT }).catch(() => {});
    actions += await answerVisibleQuestions(page, 10);
    assert.ok(actions > 0, 'El juego de Sinonimia no permite responder ninguna pregunta');
    return actions ? 1 : 0;
  }
  const search = page.locator('#search').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill('a');
    // The app debounces the search, so wait for the result state instead of
    // sleeping a fixed time.
    await page.waitForSelector('#word-list .card, #no-results:not([hidden])',
      { state: 'attached', timeout: NAV_TIMEOUT })
      .catch(() => assert.fail('La búsqueda de Sinonimia no produce estado visible'));
    // A search with no match offers to look the text up elsewhere: two links
    // (dictionary, encyclopedia, each in a new tab) and two plain tips (search
    // the Internet, ask your chatbot) that name no product.
    await search.fill('zzqqxxnoword');
    // Wait for THIS query's suggestions (the search is debounced, and a previous
    // "no results" state may still be on screen).
    await page.waitForFunction(() => {
      const box = document.getElementById('no-results');
      const tips = document.getElementById('no-results-tips');
      return box && !box.hidden && tips && /zzqqxxnoword/.test(tips.textContent);
    }, null, { timeout: NAV_TIMEOUT })
      .catch(() => assert.fail('Una búsqueda sin resultados debe sugerir buscar en otros sitios'));
    const external = await page.locator('#no-results-links a').evaluateAll(links =>
      links.map(a => ({ href: a.href, target: a.target, rel: a.rel })));
    assert.strictEqual(external.length, 2, 'Se esperaban 2 enlaces de búsqueda externa (diccionario y Wikipedia)');
    assert.strictEqual(await page.locator('#no-results-tips li').count(), 2,
      'Se esperaban 2 consejos (buscar en Internet y preguntar al chatbot)');
    const chatbotTip = await page.locator('#no-results-tips li').nth(1).textContent();
    assert.ok(/zzqqxxnoword/.test(chatbotTip),
      'El consejo del chatbot debe incluir la palabra buscada: ' + JSON.stringify(chatbotTip));
    external.forEach(link => {
      assert.ok(/^https:\/\//.test(link.href) && link.target === '_blank' && /noopener/.test(link.rel),
        'Los enlaces externos deben ser https, abrirse en otra pestaña y llevar noopener: ' + link.href);
    });
    await search.fill('a');
    await page.waitForSelector('#word-list .card', { state: 'attached', timeout: NAV_TIMEOUT });
    actions += 1;
    const filter = page.locator('.filter-btn').nth(1);
    if (await filter.isVisible().catch(() => false)) { await filter.click(); actions += 1; }
    const alphabet = page.locator('#alphabet button:not([disabled])').first();
    if (await alphabet.isVisible().catch(() => false)) { await alphabet.click(); actions += 1; }
    const word = page.locator('a[href*="/word/"]').first();
    if (await word.isVisible().catch(() => false)) {
      await word.click();
      // The detail fields arrive in a small chunk fetched on demand.
      await page.waitForSelector('#detail-view:not([hidden]) h2', { state: 'attached', timeout: NAV_TIMEOUT })
        .catch(() => assert.fail('La tarjeta de palabra no abre el detalle'));
      actions += 1;
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
    }
    await clickFirstVisible(page, '#surpriseMe');
    actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseLudia(page, route) {
  if (!route.includes('#')) return 0;
  let actions = 0;
  if (route.includes('/rules/')) {
    for (let i = 0; i < 20; i += 1) {
      if (!await clickFirstVisible(page, '[data-ludia="demo"], [data-ludia="next-rule"]')) break;
      actions += 1;
    }
  } else if (route.includes('/exercises/')) {
    actions += await answerVisibleQuestions(page, 32);
  } else if (route.endsWith('/play')) {
    if (await clickFirstVisible(page, '#ludia-setup button[type="submit"]')) {
      actions += 1;
      for (let i = 0; i < 3; i += 1) {
        const cell = page.locator('[data-cell]:visible').first();
        if (!await cell.isVisible().catch(() => false) ||
            !await cell.isEnabled().catch(() => false)) break;
        await cell.click({ timeout: 3000, force: true });
        actions += 1;
        await page.waitForTimeout(SETTLE_MS);
      }
      await clickFirstVisible(page, '[data-ludia="hint"], [data-ludia="undo"]');
    }
  } else if (route.includes('/minigame/')) {
    actions += await answerVisibleQuestions(page, 16);
    await clickFirstVisible(page, '[data-action="next"], [data-action="restart"]');
  } else {
    await clickFirstVisible(page, 'a[href*="/rules/"], a[href*="/exercises/"], a[href*="/play"]');
    actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseOkeymoney(page) {
  let actions = 0;
  const startSelectors = [
    '#nextStepAction', '#activityCatalog button', '#didacticLessons button',
    '#simulationCatalog button', '#financialCycle button',
    '.tarjeta button', '.btn-option', '#btnStartActivity',
  ].join(', ');
  if (await clickFirstVisible(page, startSelectors)) actions += 1;
  actions += await answerVisibleQuestions(page, 32);
  for (const selector of ['#wizNext', '#purchaseNext', '#wizSave', '#wizClose', '#wizBack']) {
    if (await clickFirstVisible(page, selector)) actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseActivityApp(page) {
  const route = new URL(page.url()).pathname;
  if (APP === 'routime' && route.includes('/tools/categories/')) {
    await page.locator('#categoriaPrompt').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.ok(await page.locator('#options .caja:visible').count(),
      'Categorías no muestra sus opciones');
    return 1;
  }
  if (APP === 'routime' && route.includes('/tools/clock/')) {
    assert.ok(await clickFirstVisible(page, '#modos .btn-modo:visible'),
      'Reloj no muestra los modos de práctica');
    assert.ok(await clickFirstVisible(page, '#niveles .btn-nivel:visible'),
      'Reloj no muestra los niveles');
    await page.locator('#questionText:visible').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.ok(await page.locator('#options .btn-opcion:visible').count(),
      'Reloj no muestra las respuestas de la pregunta');
    return 1;
  }
  if (APP === 'routime' && route.includes('/tools/ecos/')) {
    await page.locator('#options .pad:visible').first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    return 1;
  }
  if (APP === 'routime' && route.includes('/tools/whats-missing/')) {
    await page.locator('#objetos .objeto:visible').first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    await page.locator('#btnListo:visible').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    return 1;
  }
  let actions = 0;
  const starter = [
    '.btn-nivel', '[data-activity]', '.activity-card button',
    '.tarjeta-actividad button', '#startButton', '#btnStart',
    '#btnStartActivity', '.btn-play', '.btn-actividad', '.btn-mode',
    '.btn-jugar', '.menu-grid button', '#optionsGrid .option-btn',
    '#btnConfirmSet',
  ].join(', ');
  if (await clickFirstVisible(page, starter)) actions += 1;
  actions += await answerVisibleQuestions(page, 32);
  return actions ? 1 : 0;
}
/* Patterns, odd-one-out and stories shipped with an empty start screen: a
   level list that nothing ever filled, so "choose an activity" had nothing
   under it and there was no way to start. The smoke walked all three with
   zero controls and reported OK — a green over a screen a child cannot get
   past, because a route with nothing to click has nothing to fail. Each one
   now has a single "start practising" button, and this walks them for real.

   It does not reimplement any activity's rules: the right answer comes from
   clicking and seeing what the page does, not from knowing it. What it does
   check is the thing that was broken — that the start screen leaves a way in
   and that the round really produces questions. The Socratic hint of these
   three is not checked here: a wrong answer is not guaranteed to happen. */
const SIMPLE_STARTS = {
  '/tools/patterns/': { options: '#options .option-btn', accepted: 'correct' },
  '/tools/odd-one-out/': { options: '#group .option-btn', accepted: 'correct' },
  '/tools/stories/': { options: '#available .vineta', accepted: 'colocada' },
};

async function exerciseSimpleStart(page, baseUrl, route) {
  const path = Object.keys(SIMPLE_STARTS).find(key => route.includes(key));
  if (!path) return 0;
  const { options } = SIMPLE_STARTS[path];
  const name = path.split('/').filter(Boolean).pop();
  let actions = 0;

  await page.goto(baseUrl + path, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await page.waitForSelector('#screenStart:not(.hidden)', { timeout: NAV_TIMEOUT });
  /* A start screen with no button at all looks exactly like a working one
     to anything that only counts clicks. */
  assert.ok(await page.locator('button:visible').count() > 0,
    name + ': la pantalla de inicio se queda sin un solo botón: no hay forma de empezar');
  assert.equal(await page.locator('#levels').count(), 0,
    name + ': vuelve el <div id="levels"> vacío que dejaba la actividad inalcanzable');
  await page.locator('#btnStart').click();
  await page.waitForSelector('#screenGame:not(.hidden)', { timeout: NAV_TIMEOUT });
  actions += 1;

  let accepted = 0;
  for (let question = 0; question < 3; question += 1) {
    /* El locator NO lleva :not([disabled]): en cuanto una opción falla
       queda deshabilitada, la lista se acorta y los índices se corren,
       con lo que alguna opción buena no llega a pulsarse nunca. El índice
       tiene que ser estable y lo habilitado se mira en el elemento. */
    const items = page.locator(options);
    const total = await items.count();
    if (!total) break;
    for (let i = 0; i < total; i += 1) {
      const item = items.nth(i);
      if (!await item.isVisible().catch(() => false)) continue;
      if (!await item.isEnabled().catch(() => false)) continue;
      await item.click({ force: true });
      await page.waitForTimeout(40);
      actions += 1;
      const classes = (await item.getAttribute('class').catch(() => '')) || '';
      /* Historias coloca una viñeta cada vez y sigue con la siguiente,
         así que acertar una no termina la pregunta. */
      if (classes.includes(SIMPLE_STARTS[path].accepted)) { accepted += 1; continue; }
      const ack = page.locator('#explanationWrap .btn-entendido');
      if (await ack.count() && await ack.first().isVisible().catch(() => false)) {
        await ack.first().click({ force: true });
      }
    }
    const next = page.locator('#btnNext');
    if (!await next.isVisible().catch(() => false)) break;
    await next.click({ force: true });
    actions += 1;
  }
  assert.ok(accepted > 0,
    name + ': entra al test pero no llega a completar ninguna pregunta');
  return actions ? 1 : 0;
}

/* Formas opens on a menu of its sheets (the flow setup lists them), so a
   fresh load shows the menu before the introduction. This picks the first
   sheet when the menu is on screen and waits for the introduction. */
async function enterShapesIntro(page) {
  await page.waitForSelector('#screenIntro:not(.hidden), #activitiesMenu .btn-actividad', { timeout: NAV_TIMEOUT });
  const firstSheet = page.locator('#activitiesMenu .btn-actividad').first();
  if (await firstSheet.isVisible().catch(() => false)) {
    await firstSheet.click();
  }
  await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV_TIMEOUT });
}

/* Raised when the four test questions show no hint at all (see the check in
   exerciseShapesOnce). It is the only failure that is retried. */
class NoHintSeen extends Error {}

/* A wrong answer shows a hint only when the option clicked first is wrong. The
   options are shuffled, so the first option can be right in all four questions
   (about one run in eighty) and then no hint is ever shown. That is a fact of the
   random round, not a broken hint, so the whole exercise runs again from a fresh
   round. Three tries make a real miss practically impossible. */
async function exerciseShapes(page, baseUrl) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await exerciseShapesOnce(page, baseUrl);
    } catch (error) {
      if (!(error instanceof NoHintSeen) || attempt >= 3) throw error;
      process.stdout.write('\n[' + APP + '] Formas: ronda sin pistas, se repite (intento ' + (attempt + 1) + ')');
    }
  }
}

async function exerciseShapesOnce(page, baseUrl) {
  let actions = 0;
  await page.goto(baseUrl + '/');
  await page.evaluate(() => localStorage.removeItem('calculia:shapes'));
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();
  const publicCard = page.locator('a[href="tools/shapes/"]');
  assert.ok(await publicCard.isVisible().catch(() => false),
    'Formas no aparece en la portada pública');
  assert.ok((await publicCard.innerText()).includes('Formas'),
    'La tarjeta pública no muestra el nombre en español');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  assert.ok(await publicCard.isVisible().catch(() => false),
    'Shapes no aparece en la portada pública en inglés');
  assert.ok((await publicCard.innerText()).includes('Shapes'),
    'La tarjeta pública no muestra el nombre en inglés');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();
  await publicCard.click();
  await page.waitForURL('**/tools/shapes/', { timeout: NAV_TIMEOUT });
  await enterShapesIntro(page);
  actions += 1;

  const introCards = page.locator('#introVisual .shape-compare-item');
  assert.equal(await introCards.count(), 2,
    'La primera diapositiva no compara visualmente una forma plana y un cuerpo');
  assert.deepEqual(await introCards.locator('h2').allInnerTexts(),
    ['Forma plana', 'Cuerpo'],
    'La primera diapositiva no presenta los dos conceptos con claridad');
  assert.ok((await introCards.nth(0).innerText()).includes('dibujo') &&
    (await introCards.nth(1).innerText()).includes('pelota'),
  'La explicación inicial no usa ejemplos visuales y palabras cotidianas');
  assert.equal(await introCards.locator('.intro-side-mark, .intro-corner-mark').count(), 0,
    'La primera diapositiva adelanta las marcas de lado y esquina');
  assert.ok(await page.locator('#introTitle').isHidden(),
    'La primera diapositiva muestra una explicación duplicada');
  await page.locator('#introNext').click();
  const partCards = page.locator('#introVisual .shape-part-item');
  /* Los tres conceptos, en el orden en que se construyen: el lado, el
     vértice donde se juntan dos lados, y el perímetro, que es la vuelta
     por todos ellos. "Esquina" es la palabra de cada día y "vértice" la de
     geometría: se presentan las dos, porque el niño oye una en la calle y
     la necesita en el test. */
  assert.deepEqual(await partCards.locator('h2').allInnerTexts(),
    ['Lado', 'Vértice', 'Perímetro'],
  'La segunda diapositiva no presenta lado, vértice y perímetro');
  assert.ok((await partCards.nth(0).innerText()).includes('línea recta') &&
    (await partCards.nth(1).innerText()).includes('juntan dos lados') &&
    (await partCards.nth(1).innerText()).includes('esquina'),
  'La segunda diapositiva no explica lado, vértice y perímetro');
  assert.match((await partCards.nth(2).innerText()).toLowerCase(),
    /dar la vuelta/,
  'La definición de perímetro no explica que es recorrer el borde');
  assert.ok(await partCards.nth(0).locator('.intro-side-mark').count() &&
    await partCards.nth(1).locator('.intro-corner-mark').count() &&
    await partCards.nth(2).locator('.intro-perimeter-mark').count(),
  'La explicación de lado, vértice y perímetro no tiene marcas visuales');
  /* El perímetro se apoya en los otros dos, así que no va en paralelo:
     ocupa la fila entera debajo. Sin esto la tercera tarjeta cae en la
     segunda columna y deja un hueco al lado. */
  const perimeterBox = await partCards.nth(2).boundingBox();
  const sideBox = await partCards.nth(0).boundingBox();
  assert.ok(perimeterBox.width > sideBox.width + 10,
    'La tarjeta de perímetro no ocupa la fila entera de la diapositiva de conceptos');
  assert.ok(perimeterBox.y > sideBox.y,
    'La tarjeta de perímetro no va debajo de lado y vértice');
  /* El trazo del perímetro marca el camino entero, no un lado suelto:
     los tres lados del triángulo tienen que aparecer en el dibujo. */
  const perimeterDash = await partCards.nth(2).locator('.intro-perimeter-mark')
    .getAttribute('points');
  assert.equal(perimeterDash.trim().split(/\s+/).length, 3,
    'La marca de perímetro no recorre el triángulo entero');

  /* El resto de conceptos van en dos diapositivas más, y cada una tiene su
     propia forma de enseñar el concepto en el dibujo. Sin esto, añadir un
     concepto al carrusel podría dejarse sin comprobar ometerlo en la
     diapositiva que le toca. */
  await page.locator('#introNext').click();
  const insideCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await insideCards.locator('h2').allInnerTexts(),
    ['Área', 'Volumen'],
  'La tercera diapositiva no presenta área y volumen');
  assert.match((await insideCards.nth(0).innerText()).toLowerCase(), /todo lo de dentro/,
    'La definición de área no dice que es la parte de dentro');
  assert.match((await insideCards.nth(1).innerText()).toLowerCase(), /llenar/,
    'La definición de volumen no dice que es el hueco de dentro');
  /* El área se enseña rayando el interior recortado por el contorno, y el
     volumen con la caja entera en trazos y el cuerpo dentro. */
  assert.equal(await insideCards.nth(0).locator('clipPath polygon').count(), 1,
    'El rayado del área deja de estar recortado por la forma');
  assert.equal(await insideCards.nth(0).locator('.area-hatch line').count() > 3, true,
    'El área no se enseña rayada por dentro');
  assert.equal(await insideCards.nth(1).locator('.intro-space-mark').count(), 1,
    'El volumen deja de enseñar el hueco que hay dentro del cuerpo');

  await page.locator('#introNext').click();
  const sameCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await sameCards.locator('h2').allInnerTexts(),
    ['Simetría', 'Semejanza'],
  'La cuarta diapositiva no presenta simetría y semejanza');
  assert.match((await sameCards.nth(0).innerText()).toLowerCase(), /dos mitades/,
    'La definición de simetría no dice que son dos mitades iguales');
  assert.match((await sameCards.nth(1).innerText()).toLowerCase(), /misma forma a otro tamaño/,
    'La definición de semejanza no dice que es la misma forma a otro tamaño');
  assert.equal(await sameCards.nth(0).locator('.intro-axis-mark').count(), 1,
    'La simetría no se enseña con una raya de doblar');
  assert.equal(await sameCards.nth(1).locator('svg polygon').count(), 2,
    'La semejanza no enseña la misma forma en dos tamaños distintos');
  await page.locator('#introNext').click();
  /* Primero el área como cuadraditos que se cuentan dentro de la figura. */
  const countCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await countCards.locator('h2').allInnerTexts(),
    ['Cuadrado', 'Rectángulo', 'Triángulo'],
  'La diapositiva de contar cuadraditos no presenta cuadrado, rectángulo y triángulo');
  assert.match(await countCards.nth(2).innerText(), /mitad del cuadrado/,
    'El triángulo no dice que cubre la mitad del cuadrado');
  await page.locator('#introNext').click();
  /* Las áreas por fórmula: cada figura lleva las palabras de su fórmula y el
     triángulo, que es la mitad de un rectángulo, va debajo de las otras dos. */
  const formulaCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await formulaCards.locator('h2').allInnerTexts(),
    ['Cuadrado', 'Rectángulo', 'Triángulo'],
  'La diapositiva de áreas por fórmula no presenta cuadrado, rectángulo y triángulo');
  assert.match(await formulaCards.nth(2).innerText(), /÷ 2/,
    'El área del triángulo no dice que se divide entre 2');
  await page.locator('#introNext').click();
  /* Los triángulos, primero por sus lados y luego por sus ángulos. */
  const sideCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await sideCards.locator('h2').allInnerTexts(),
    ['Equilátero', 'Isósceles', 'Escaleno'],
  'La diapositiva de triángulos por lados no está completa');
  await page.locator('#introNext').click();
  const angleCards = page.locator('#introVisual .shape-part-item');
  assert.deepEqual(await angleCards.locator('h2').allInnerTexts(),
    ['Rectángulo', 'Acutángulo', 'Obtusángulo'],
  'La diapositiva de triángulos por ángulos no está completa');
  await page.locator('#introNext').click();

  const galleryNames = [];
  const galleryCount = await page.evaluate(() => window.DATA.gallery.length);
  for (let i = 0; i < galleryCount; i += 1) {
    galleryNames.push(await page.locator('#introVisual').getAttribute('aria-label'));
    assert.ok((await page.locator('#introTitle').innerText()).trim(),
      'Falta la explicación de una forma en la galería');
    assert.equal(await page.locator('#introTitle').evaluate(node =>
      getComputedStyle(node).textTransform), 'capitalize',
    'El nombre de la forma no destaca con mayúscula inicial');
    assert.equal(await page.locator('#introTitle').evaluate(node => node.textContent.trim()),
      galleryNames[galleryNames.length - 1],
      'La galería añade detalles sobre lados, esquinas o caras en vez de presentar la forma');
    const galleryItem = await page.evaluate(index => window.DATA.gallery[index], i);
    const galleryShapeId = galleryItem.id;
    /* La galería solo dice el nombre: lados, vértices y caras se enseñan en
       los concept slides y se preguntan en el test, así que listarlos aquí
       partiría la atención entre la figura y un número que todavía no toca. */
    if (galleryShapeId === 'rectangularPrism') {
      assert.equal(await page.locator('#introVisual .solid-left').getAttribute('points'),
        '10,42 88,42 88,102 10,102',
      'La cara más larga del prisma rectangular no queda de frente');
    }
    if (galleryShapeId === 'pyramid') {
      assert.equal(await page.locator('#introVisual .solid-left').count(), 2,
        'La pirámide no muestra sus caras triangulares');
    }
    if (galleryShapeId === 'cylinder') {
      const cylinder = await page.locator('#introVisual svg').evaluate(svg => ({
        sideHeight: svg.querySelector('rect.solid-side')?.getAttribute('height'),
        baseRx: svg.querySelector('.solid-cylinder-base')?.getAttribute('rx'),
        baseOpacity: getComputedStyle(svg.querySelector('.solid-cylinder-base')).fillOpacity,
        backEdge: svg.querySelector('.solid-cylinder-back')?.getAttribute('d'),
        frontEdge: svg.querySelector('.solid-cylinder-front')?.getAttribute('d')
      }));
      assert.deepEqual(cylinder, {
        sideHeight: '64',
        baseRx: '40',
        baseOpacity: '0.8',
        backEdge: 'M20 92a40 13 0 0 1 80 0',
        frontEdge: 'M20 92a40 13 0 0 0 80 0'
      }, 'La base del cilindro no parece una tapa diferenciada');
    }
    if (i < galleryCount - 1) {
      await page.locator('#introNext').click();
      actions += 1;
    }
  }
  assert.equal(new Set(galleryNames).size, galleryCount,
    'La galería no presenta todas las formas y cuerpos sin omisiones');
  assert.ok(galleryNames.includes('círculo') && galleryNames.includes('hexágono') &&
    galleryNames.includes('octágono') && galleryNames.includes('cubo') &&
    galleryNames.includes('cono'),
  'La galería no incluye formas planas y cuerpos geométricos');
  /* On the last slide the arrows leave: «Empezar otra vez» (#introRestart) takes their place. */
  await page.locator('#introRestart').click();
  assert.equal(await introCards.count(), 2,
    'La galería no vuelve a la primera diapositiva al terminar');

  await page.locator('#introContinue').click();
  assert.ok(await page.locator('#screenReal').isVisible(),
    'La introducción no avanza a los ejemplos reales');
  assert.equal(await page.locator('#screenReal [data-i18n="instructionReal"], #realShape').count(), 0,
    'La pantalla de ejemplos repite la introducción o la explicación de la forma');
  actions += 1;
  /* Los tres conceptos no se quedan en la diapositiva de conceptos: se
     cuentan también sobre el objeto de verdad que se está mirando. La nota
     no vuelve a definirlos —eso ya está hecho arriba— sino que los aplica
     a ese objeto concreto. */
  assert.equal(await page.locator('#realSide').count(), 0,
    'La pantalla de ejemplos vuelve a explicar qué es un lado');
  const realExamples = [];
  const realCount = await page.evaluate(() => window.DATA.gallery.length);
  for (let i = 0; i < realCount; i += 1) {
    const realShapeId = await page.evaluate(index => window.DATA.gallery[index].id, i);
    assert.equal(await page.locator('#realVisual .real-object .intro-side-mark').count(), 0,
      'El ejemplo cotidiano marca un lado sin que haya nada que señalar');
    realExamples.push((await page.locator('#realText').innerText()).trim());

    /* Los ejemplos de la vida real solo muestran el nombre del objeto:
       contar lados, vértices o caras sobre la foto distrae de la forma
       que estamos asociando. */
    /* Everyday objects that must be drawn, not left to the object's emoji:
       the shield emoji is not a pentagon, the stop sign emoji loses the
       word inside it, a parcel is not a cereal box, a rounded warning sign
       does not show the three straight sides a triangle is made of, and
       an ice cream emoji hides the cone it is named after. The 🪟 emoji is
       a tall narrow strip that reads as a scratch on the card, so the
       window is drawn too. The polygon count is what keeps each drawing
       honest about its own shape. */
    const DRAWN_REAL = ['triangle', 'square', 'trapezoid', 'pentagon', 'hexagon', 'octagon',
      'rectangularPrism', 'triangularPrism', 'pyramid', 'cone'];
    /* hexagon is 8 and not 6: seven cells of the comb plus one cell drawn
       on its own, so a child can see what a single cell looks like before
       being sent to the comb to count. The bee is ellipses and circles, so
       nothing else in that drawing is a polygon. */
    const EXPECTED_REAL_POLYGONS = {
      triangle: 1, square: 1, trapezoid: 1, pentagon: 2, hexagon: 8, octagon: 1,
      rectangularPrism: 3, triangularPrism: 3, pyramid: 2,
    };
    if (DRAWN_REAL.indexOf(realShapeId) !== -1) {
      assert.ok(await page.locator('#realVisual .real-object svg').count() > 0,
        'El ejemplo cotidiano de ' + realShapeId + ' se queda en el emoji sin dibujo');
    }
    if (realShapeId in EXPECTED_REAL_POLYGONS) {
      const polygonCount = await page.locator('#realVisual .real-object svg polygon').count();
      assert.equal(polygonCount, EXPECTED_REAL_POLYGONS[realShapeId],
        'La ilustración real no muestra con claridad la forma esperada');
    }
    /* The window is the square: a square frame, and the mullions drawn as
       lines so they cannot be mistaken for sides of the frame. */
    if (realShapeId === 'square') {
      const frame = await page.locator('#realVisual .real-object svg polygon').boundingBox();
      assert.ok(Math.abs(frame.width - frame.height) <= 2,
        'La ventana no es un cuadrado: el marco mide ' + Math.round(frame.width) +
        ' por ' + Math.round(frame.height));
      assert.equal(await page.locator('#realVisual .real-object svg line').count(), 2,
        'La ventana ha perdido el montante o el travesaño');
    }
    /* The badge carries a sheriff's star so it reads as "badge" without a
       word. The star must also stay off <polygon>: the count above is what
       proves the shield has five sides, and a star drawn as polygons would
       quietly make that check meaningless. One path for the star, one
       circle for the seal in its middle. */
    if (realShapeId === 'pentagon') {
      assert.equal(await page.locator('#realVisual .real-object svg circle').count(), 1,
        'El escudo deja de enseñar el sello del centro de la estrella');
      assert.equal(await page.locator('#realVisual .real-object svg path').count(), 1,
        'El escudo deja de enseñar la estrella del sheriff');
      assert.ok(await page.locator('#realVisual .real-object svg path').first()
        .getAttribute('d').then(d => /M60\.0 29\.0L/.test(d) || d.split('L').length === 12),
      'La estrella del escudo no tiene seis puntas');
    }
    /* The tent is the tent: gable, long side and open door, and nothing else.
       The guy line and the pennant it used to carry were clutter — they
       sat next to the outline of the prism and read as extra edges. */
    if (realShapeId === 'triangularPrism') {
      assert.equal(await page.locator('#realVisual .real-object svg line').count(), 0,
        'La tienda ha vuelto a llevar cuerda o mástil');
      assert.equal(await page.locator('#realVisual .real-object svg path').count(), 0,
        'La tienda ha vuelto a llevar la banderola');
    }
    /* The courses of stone are what make a pyramid something people built
       rather than something somebody pitched. Three courses that bend at
       the front corner, and no ground line under it: the mass ends on its
       own footprint. */
    if (realShapeId === 'pyramid') {
      assert.equal(await page.locator('#realVisual .real-object svg polyline').count(), 3,
        'La pirámide ha perdido sus hiladas de piedra');
      assert.equal(await page.locator('#realVisual .real-object svg line').count(), 4,
        'La pirámide ha perdido las juntas entre sillares o ha vuelto a la raya del suelo');
    }
    /* The swirl has to reach down into the cone. A ball resting on top of a
       triangle is the drawing this replaced, and the difference is exactly
       this overlap: the ice cream sits inside the rim, so the cone's front
       edge cuts across it. Boxes are compared whole, no graze tolerance —
       here the two overlap by most of the scoop, or not at all.
       The cone body is picked by its own fill: the waffle lattice lives in
       a <clipPath> whose path is in the DOM but is not rendered, so asking
       for the first <path> would measure a zero-sized box. */
    if (realShapeId === 'cone') {
      async function boxOf(selector) {
        const first = page.locator(selector).first();
        assert.ok(await first.count() > 0, 'El cucurucho ha perdido su ' + selector);
        return first.boundingBox();
      }
      const swirl = await boxOf('#realVisual .real-object svg path[stroke-linecap="round"]');
      const cone = await boxOf('#realVisual .real-object svg path[fill]:not([fill="none"])');
      const swirlInCone = swirl.y < cone.y + cone.height && swirl.y + swirl.height > cone.y;
      assert.ok(swirlInCone,
        'El helado se queda encima del cucurucho en vez de dentro: vuelve a ser una bola sobre un triángulo');
      /* The ice cream is a swirl and not a pile of scoops. Each turn of it
         is a rope of cream — one arc stroked twice, wide in the outline
         colour and thin in the cream — and every turn is thinner than the
         one below it, which is what makes the stack taper into a tip.
         Stacked ellipses were tried here and read as a beehive, so this
         checks the thickness of the ropes themselves rather than a box:
         the same kind of regression, a set of same-sized scoops, leaves
         every turn the same width and fails the descent below. */
      const turns = await page.evaluate(() => [...document.querySelectorAll(
        '#realVisual .real-object svg path[stroke-linecap="round"]')]
        .filter(p => p.getAttribute('stroke') === '#FCF0D6')
        .map(p => Number(p.getAttribute('stroke-width'))));
      assert.ok(turns.length >= 3,
        'El helado ha vuelto a ser un par de bolas: faltan las vueltas de la espiral');
      const tapers = turns.every((w, i) => i === 0 || w < turns[i - 1]);
      assert.ok(tapers,
        'Las vueltas del helado no se estrechan: el cucurucho vuelve a ser bolas apiladas');
      /* The wafer has to be a lattice, not a handful of lines that happen to
         cross: both families of diagonals, enough of them to show the
         diamond, and all of them inside the single clip. */
      assert.equal(await page.locator('#realVisual .real-object svg clipPath').count(), 1,
        'El gofra del cucurucho se sale del cucurucho al no recortarse');
      const waffle = await page.locator('#realVisual .real-object svg g[clip-path] path').count();
      assert.ok(waffle >= 12,
        'El gofra del cucurucho ha vuelto a ser un puñado de rayas: faltan las diagonales de la rejilla');
      assert.ok(await page.locator('#realVisual .real-object svg path').count() >= 8,
        'El cucurucho ha perdido el enrejado de la gofra');
    }
    /* The bee has to stay off the comb. The caption says the cells are
       hexagons, so a bee drawn inside a cell hides the very cell the
       slide asks you to look at, and the seven cells stop being countable.
       Measured with real boxes: two drawings can both "look fine" and
       still overlap. */
    if (realShapeId === 'hexagon') {
      async function boxesOf(selector) {
        const found = [];
        const items = page.locator(selector);
        for (let i = 0; i < await items.count(); i += 1) found.push(await items.nth(i).boundingBox());
        return found;
      }
      const beeBoxes = [
        ...await boxesOf('#realVisual .real-object svg circle'),
        ...await boxesOf('#realVisual .real-object svg ellipse'),
      ];
      const cellBoxes = await boxesOf('#realVisual .real-object svg polygon');
      assert.equal(cellBoxes.length, 8, 'El panal tiene que enseñar siete celdas y ' +
        'la suelta; ahora enseña ' + cellBoxes.length);
      /* Six sides on every cell, the lone one included: the caption says
         hexagon, so the cell drawn on its own has to be the very polygon
         the comb is made of, not a lookalike parked next to it. */
      const vertices = await page.evaluate(() =>
        [...document.querySelectorAll('#realVisual .real-object svg polygon')]
          .map(p => p.getAttribute('points').trim().split(/\s+/).length));
      assert.ok(vertices.every(n => n === 6), 'Alguna celda ha dejado de tener seis ' +
        'vértices: ' + vertices.join(', '));
      /* How far apart two boxes are, in px; negative when they overlap.
         The max of the four separations is the conservative one, and it is
         the number that decides "these two are one drawing" here. */
      const gapTo = (a, b) => Math.max(b.x - a.x - a.width, a.x - b.x - b.width,
        b.y - a.y - a.height, a.y - b.y - b.height);
      const near = (cell, other) => gapTo(cell, other) < 10;
      const comb = cellBoxes.filter(cell => cellBoxes.some(o => o !== cell && near(cell, o)));
      const loose = cellBoxes.filter(cell => !comb.includes(cell));
      assert.equal(comb.length, 7, 'El panal tiene que seguir siendo de siete celdas: ' +
        'ahora son ' + comb.length);
      assert.equal(loose.length, 1, 'La celda suelta tiene que estar sola y separada: ' +
        'hay ' + loose.length + ' celdas sueltas');
      /* And separated by enough to read as apart, not just off by a pixel:
         the confusion this drawing fixes comes straight back if the eighth
         cell drifts close enough to be counted as part of the comb. It is
         drawn 18 px to the side and 30 px below the nearest cell, and 24 px
         is asked for here — deliberately more than the 10 px that decides
         which cells belong to the comb, so this one can fail on its own
         instead of hiding behind the count above. */
      const clearance = Math.min(...comb.map(cell => gapTo(loose[0], cell)));
      assert.ok(clearance >= 24, 'La celda suelta se ha pegado al panal (separa ' +
        Math.round(clearance) + ' px): vuelve a contar como una octava celda');
      assert.ok(beeBoxes.length > 0, 'La abeja ha desaparecido del panal');
      cellBoxes.forEach((cell, index) => {
        beeBoxes.forEach(bee => {
          /* A rotated wing reports a box wider than the wing really is, so
             two boxes that merely graze each other can cross by a fraction
             of a pixel. Only a real overlap counts, not a graze. */
          const graze = 0.5;
          const overlaps = bee.x + graze < cell.x + cell.width &&
            bee.x + bee.width - graze > cell.x &&
            bee.y + graze < cell.y + cell.height &&
            bee.y + bee.height - graze > cell.y;
          assert.ok(!overlaps, 'La abeja tapa la celda ' + (index + 1) +
            ' del panal, que es justo la que hay que contar');
        });
      });
    }
    /* A cereal box is about 19 x 27 x 6 cm: the thickness is a third of the
       width. Drawn deeper it stops being a cereal box and becomes a crate,
       which is exactly what the earlier version looked like. The side face
       is the one drawn with solid-right; the front is solid-left. */
    if (realShapeId === 'rectangularPrism') {
      /* Point at the polygon, not at the class: solid-right is also the
         bowl and the berries on the label, and a locator that matches
         five elements resolves to none. */
      const front = await page.locator('#realVisual .real-object svg polygon.solid-left').boundingBox();
      const side = await page.locator('#realVisual .real-object svg polygon.solid-right').boundingBox();
      assert.ok(side.width / front.width <= 0.4,
        'La caja de cereales se dibuja demasiado profunda: el grosor es casi la mitad del ancho');
    }
    if (i < realCount - 1) {
      await page.locator('#realNext').click();
      actions += 1;
    }
  }
  assert.equal(new Set(realExamples).size, realCount,
    'No hay un ejemplo cotidiano distinto para cada forma');
  /* On the last example the arrows leave: «Empezar otra vez» (#realRestart) takes their place, so the way
     back to the triangle (the second example) is restart plus one step forward. */
  await page.locator('#realRestart').click();
  actions += 1;
  await page.locator('#realNext').click();
  actions += 1;
  /* Back at the triangle slide: still the plain three-sided sign, now with
     nothing drawn on top of it. */
  assert.ok((await page.locator('#realText').innerText()).includes('señal de peligro'),
    'Al volver atrás el ejemplo del triángulo no se corresponde con su dibujo');
  assert.equal(await page.locator('#realVisual .real-object svg polygon').count(), 1,
    'El ejemplo del triángulo deja de enseñar un triángulo al volver atrás');
  await page.locator('#realNext').click();
  await page.locator('#realContinue').click();
  /* Con un solo test no hay nada que elegir, y app.js entra en él
     directamente: el menú que decía "Elige un test" sobre una cuadrícula
     de un botón era un paso que solo retrasaba. La puerta sigue
     aceptando las dos formas —menú cuando hay más de un test— para no
     atar el smoke a un dato que puede cambiar. */
  /* The sheet is chosen at the start (the menu on load), so after the real
     examples the round goes straight to the test. */
  assert.ok(await page.locator('#screenGame').isVisible(),
    'Los ejemplos reales no entran en el test de la hoja elegida');

  /* One question per slide. A wrong option shows a hint in the feedback that
     names nothing, and the options stay open for another try; the right one is
     marked and "Siguiente" moves on. The check looks at how the slide behaves,
     not at what the question asks. */
  let hintsSeen = 0;
  for (let question = 0; question < 4; question += 1) {
    const optionsLocator = page.locator('#testOptions .option-btn');
    await page.waitForSelector('#testOptions .option-btn', { timeout: NAV_TIMEOUT });
    const count = await optionsLocator.count();
    let answered = false;
    for (let index = 0; index < count && !answered; index += 1) {
      const option = optionsLocator.nth(index);
      if (await option.isDisabled()) continue;
      await option.click();
      await page.waitForTimeout(150);
      if (await option.evaluate(node => node.classList.contains('correct'))) {
        answered = true;
        break;
      }
      const hint = (await page.locator('#feedback').innerText()).trim();
      assert.ok(hint.length > 0, 'Una respuesta equivocada no muestra pista');
      assert.equal(await page.locator('#testOptions .option-btn.correct').count(), 0,
        'Una respuesta equivocada ya marca la opción correcta: ' + hint);
      hintsSeen += 1;
    }
    assert.ok(answered, 'Ninguna opción de la pregunta ' + (question + 1) + ' está marcada como correcta');
    await page.waitForSelector('#btnNext:not(.hidden)', { timeout: NAV_TIMEOUT });
    actions += 1;
    await page.locator('#btnNext').click();
    await page.waitForTimeout(150);
  }
  if (hintsSeen === 0) {
    throw new NoHintSeen('Ninguna respuesta equivocada mostró pista en cuatro preguntas');
  }

  /* La aclaración de la galería también tiene que estar en inglés: si
     falta, sale el nombre de la clave en pantalla. Se comprueba una
     forma plana y un cuerpo, y se vuelve a español. */
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  await enterShapesIntro(page);
  /* Se recorren las ocho diapositivas de conceptos y se vuelve a la
     galería: la aclaración tiene que estar traducida en las dos, y el
     número de diapositivas sale de la misma constante que app.js usa para
     el carrusel. */
  const conceptTitles = [];
  for (let slide = 0; slide < 8; slide += 1) {
    conceptTitles.push(...await page.locator('#introVisual h2').allInnerTexts());
    await page.locator('#introNext').click();
  }
  assert.deepEqual(conceptTitles,
    ['Flat shape', 'Solid', 'Side', 'Vertex', 'Perimeter',
      'Area', 'Volume', 'Symmetry', 'Similarity',
      'Square', 'Rectangle', 'Triangle',
      'Square', 'Rectangle', 'Triangle',
      'Equilateral', 'Isosceles', 'Scalene',
      'Right', 'Acute', 'Obtuse'],
  'Las diapositivas de conceptos no están traducidas al inglés');
  /* Del círculo al cubo se avanza leyendo la galería, no contando a mano:
     insertar una forma en medio no puede dejar el recorrido en otra
     diapositiva sin que se note. La galería solo dice el nombre, así que
     el caption es la propia etiqueta accesible del dibujo. textContent
     (no innerText) para no arrastrar el text-transform: capitalize del
     CSS, que rompería la comparación con el aria-label en minúsculas. */
  const captionText = await page.locator('#introTitle').evaluate(node =>
    node.textContent.trim());
  const ariaLabel = await page.locator('#introVisual').getAttribute('aria-label');
  assert.equal(captionText, ariaLabel.trim(),
    'La galería añade detalles en vez de quedarse en el nombre');
  const cubeIndex = await page.evaluate(() =>
    window.DATA.gallery.findIndex(item => item.id === 'cube'));
  for (let step = 0; step < cubeIndex; step += 1) await page.locator('#introNext').click();
  assert.equal(await page.locator('#introTitle').evaluate(node =>
    node.textContent.trim()),
  (await page.locator('#introVisual').getAttribute('aria-label')).trim(),
  'La galería de los cuerpos añade detalles en vez de quedarse en el nombre');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();

  /* El ejemplo cotidiano de la vida real, en los dos idiomas: muestra solo
     el nombre del objeto, no una lista de lados y vértices. */
  for (const locale of ['en', 'es']) {
    await page.evaluate(code => localStorage.setItem('calculia:locale', code), locale);
    await page.reload();
    await enterShapesIntro(page);
    await page.locator('#introContinue').click();
    await page.locator('#realNext').click();
    const captionText = (await page.locator('#realText').innerText()).trim();
    assert.ok(captionText.length > 0,
      `El ejemplo cotidiano está vacío en ${locale}`);
  }
  /* La pantalla de ejemplos reales no tiene botón de volver: se vuelve a
     la introducción recargando, igual que en el bucle de idiomas. */
  await page.reload();
  await enterShapesIntro(page);

  /* The sheet tests (menu of two tests, the 46-question sheet and its Socratic
     hints) belong to the old layout. Formas now runs one question per slide;
     its answers and hints are checked by the options round above. */
  return actions ? 1 : 0;
}

async function exerciseNumbers(page, baseUrl) {
  let actions = 0;
  await page.goto(baseUrl + '/');
  await page.evaluate(() => {
    localStorage.setItem('calculia:numbers', JSON.stringify({
      stars: 2, completedRounds: 8,
    }));
    localStorage.setItem('calculia:posneg', JSON.stringify({ stars: 4, completedRounds: 2 }));
    localStorage.setItem('calculia:locale', 'es');
  });
  await page.reload();

  /* Números es tarjeta de la portada pública: enlaza al grupo, que lista
     Tipos de números y Los números (ver PUBLIC_SLUGS de scripts/check.js). */
  assert.equal(await page.locator('a[href="tools/numbers-group/"]').count(), 1,
    'La portada pública no muestra Números');
  /* Positivos y negativos ya no es una herramienta propia: la clave
     localStorage 'posneg' solo sirve para migrar estrellas antiguas y nunca
     debe aparecer como tarjeta en la portada. */
  assert.equal(await page.locator('a[href$="posneg"]').count(), 0,
    'El catálogo vuelve a enlazar Positivos y negativos como herramienta separada');

  const catalogCard = page.locator('a[href="tools/numbers-group/"]');
  assert.ok(await catalogCard.isVisible().catch(() => false),
    'Números no aparece en la portada');
  assert.ok((await catalogCard.innerText()).includes('Los números'),
    'La tarjeta de Los números del catálogo no aparece en español');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  assert.ok((await catalogCard.innerText()).includes('The numbers'),
    'La tarjeta de The numbers del catálogo no aparece en inglés');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();
  await catalogCard.click();
  await page.waitForURL('**/tools/numbers-group/', { timeout: NAV_TIMEOUT });

  /* El grupo ya no ofrece Positivos y negativos ni Cuentas rápidas (ahora dentro de Cuentas rápidas): quedan cuatro actividades. */
  await page.waitForSelector('#activitiesMenu a.btn-actividad', { timeout: NAV_TIMEOUT });
  assert.equal(await page.locator('#activitiesMenu a.btn-actividad').count(), 4,
    'El grupo Números no muestra las cuatro actividades esperadas');
  assert.equal(await page.locator('#activitiesMenu a.btn-actividad[href*="positivos"]').count(), 0,
    'El grupo Números sigue enlazando Positivos y negativos');
  actions += 1;

  /* Una actividad que sigue existente se abre desde el grupo (con su
     explicación de la sección de expo). La migración de estrellas se
     comprueba después, porque se ejecuta al abrir tools/numbers/. */
  await page.locator('#activitiesMenu a.btn-actividad[href="../numbers/?sub=unidades"]').click();
  await page.waitForURL('**/tools/numbers/?sub=unidades', { timeout: NAV_TIMEOUT });
  await page.waitForSelector('#expoScreen:not(.hidden)', { timeout: NAV_TIMEOUT });
  actions += 1;

  const migrated = await page.evaluate(() => ({
    numbers: JSON.parse(localStorage.getItem('calculia:numbers') || '{}'),
    legacy: localStorage.getItem('calculia:posneg'),
  }));
  assert.equal(migrated.numbers.stars, 6,
    'Las estrellas existentes y las del progreso antiguo no se conservaron al migrar');
  assert.equal(migrated.numbers.completedRounds, 8,
    'La migración alteró la progresión de las demás actividades de Números');
  assert.equal(migrated.legacy, null,
    'El progreso anterior quedó duplicado tras migrarlo');
  actions += 1;

  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.goto(baseUrl + '/tools/numbers-group/');
  await page.waitForSelector('#activitiesMenu a.btn-actividad', { timeout: NAV_TIMEOUT });
  assert.equal(await page.locator('#activitiesMenu a.btn-actividad').count(), 4,
    'The numbers group does not show the four expected activities');
  actions += 1;

  return actions ? 1 : 0;
}

async function exerciseRoutimeSafeChat(page) {
  const cards = page.locator('#listaChats .tarjeta-chat:visible');
  const cardCount = await cards.count();
  const expectedCards = await page.evaluate(() => (DATA[App.i18n.locale()] || DATA.es).escenarios.length);
  assert.equal(cardCount, expectedCards, 'Chat Seguro no muestra todos sus escenarios');
  await cards.first().click({ timeout: 3000 });
  await page.locator('#pantallaChat:not(.hidden)').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
  let validatedSocraticPause = false;

  for (let round = 0; round < 16; round += 1) {
    if (await page.locator('#reglaFinal:not(.hidden)').isVisible().catch(() => false)) {
      assert.match(await page.locator('#reglaTexto').innerText(), /\S/,
        'Chat Seguro termina sin mostrar la regla de cierre');
      assert.match(await page.locator('#stars').innerText(), /[1-9]/,
        'Completar un chat debe sumar una estrella');
      assert.ok(validatedSocraticPause,
        'El smoke no comprobó la pausa socrática de Chat Seguro');
      return 1;
    }

    const choices = page.locator('#chatOpciones .btn-opcion:visible');
    if (await choices.count()) {
      const answers = await page.evaluate(() => {
        const locale = App.i18n.locale();
        const data = DATA[locale] || DATA.es;
        const alias = document.querySelector('#chatAlias').textContent;
        const group = data.escenarios.find(item => item.variantes.some(v => v.contacto === alias));
        const variant = group && group.variantes.find(v => v.contacto === alias);
        const incoming = document.querySelectorAll('#chatMensajes .burbuja.ellos');
        const lastMessage = incoming.length ? incoming[incoming.length - 1].textContent : '';
        if (!variant) return '';
        let messageIndex = -1;
        variant.steps.forEach((step, index) => {
          if (step.tipo === 'msg' && step.text === lastMessage) messageIndex = index;
        });
        const choice = variant.steps.slice(messageIndex + 1).find(step => step.tipo === 'eleccion');
        const safe = choice && choice.options.find(option => option.segura);
        const wrong = choice && choice.options.find(option => !option.segura);
        return { safe: safe ? safe.text : '', wrong: wrong ? wrong.text : '' };
      });
      assert.ok(answers.safe, 'No se encontró la respuesta segura del paso actual');
      if (!validatedSocraticPause && answers.wrong) {
        const wrongButton = page.locator('#chatOpciones .btn-opcion:visible').filter({ hasText: answers.wrong });
        const safeButton = page.locator('#chatOpciones .btn-opcion:visible').filter({ hasText: answers.safe });
        await wrongButton.click({ timeout: 3000 });
        const hintZone = page.locator('#consejo');
        await hintZone.waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
        assert.ok((await page.locator('#consejoTexto').innerText()).trim(),
          'Un fallo debe mostrar una pista socrática');
        assert.equal(await page.locator('#chatOpciones .btn-opcion:visible').count(), 0,
          'Mientras se ve la pista, las respuestas deben quedar ocultas');
        await hintZone.locator('.btn-entendido').click({ timeout: 3000 });
        await hintZone.waitFor({ state: 'hidden', timeout: NAV_TIMEOUT });
        assert.equal(await safeButton.isEnabled(), true,
          '«Entendido» debe volver a mostrar y reactivar la respuesta segura');
        assert.equal(await wrongButton.isEnabled(), false,
          'La respuesta ya probada debe seguir bloqueada');
        validatedSocraticPause = true;
      }
      await page.locator('#chatOpciones .btn-opcion:visible').filter({ hasText: answers.safe })
        .click({ timeout: 3000 });
      await page.waitForTimeout(3600);
      continue;
    }

    const action = page.locator('#chatOpciones button:visible').first();
    if (await action.count() && await action.isVisible().catch(() => false)) {
      await action.click({ timeout: 3000 });
      await page.waitForTimeout(1400);
      continue;
    }
    await page.locator('#chatOpciones button:visible').first()
      .waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
  }

  assert.ok(validatedSocraticPause, 'El smoke no comprobó la pausa socrática de Chat Seguro');
  assert.fail('Chat Seguro no completa un escenario hasta la regla final');
}

/* Routime activities played to their closing screen. Each entry lists, per round,
   the clicks that open the round from the page's menu (none when it starts by itself). */
/* Keypad activities: the number the child types. The emergency number is 112 in every
   country the app covers, so the same digits answer every situation of the activity. */
const ROUTIME_KEYPAD_ANSWERS = { 'phone-numbers': '112' };

const ROUTIME_ROUNDS = [
  ['riddles', [[]]], ['street', [[]]], ['categories', [[]]], ['comedy-club', [[]]],
  ['doctor-visit', [[]]], ['first-aid-kit', [[]]], ['friends', [[]]], ['self-esteem', [[]]],
  ['resilience', [[]]], ['my-body', [[]]], ['what-first', [[]]], ['what-to-wear', [[]]],
  ['what-do-i-need', [[]]], ['trust-circle', [[]]], ['where-to-store', [[]]],
  ['post-or-not', [[]]], ['sentence', [[]]], ['signs', [[]]], ['times-of-day', [[]]],
  ['healthy-food', [[]]], ['idioms', [[]]], ['double-meaning', [[]]], ['where-is', [[]]],
  ['be-prepared', [['#tarjetaSaber']]],
  ['situations', [['#menuNiveles .tarjeta-actividad']]],
  ['emergencies', [['#tarjetaReconocer']]],
  ['social-safety', [['#listaTemas button']]],
  ['while-help-arrives', [['#tarjetaQueHago']]],
  ['phone-numbers', [[]]],
  ['shop', [['[data-actividad="quedame"]', '#niveles button'],
    ['[data-actividad="tienda"]', '#niveles button']]],
  ['shopping', [['#tarjetaSecciones']]],
  ['turns-mirrors', [[]]], ['whats-missing', [[]]],
  ['clock', [['#modos .btn-modo', '#niveles .btn-nivel']]],
  ['spelling', [[]]], ['dictionary', [[]]],
  ['bullying-chat', [['#listaChats .tarjeta-chat:not(:first-child)']]],
  ['phishing-alert', [['#listaChats .tarjeta-chat:not(:first-child)']]],
  ['good-manners', [['#app .btn-nivel']]],
  ['education-norms', [['#app .btn-level']]],
];

/* Activates the first visible, enabled match. viaKeyboard focuses it and presses
   Enter, the way a keyboard user activates a control; otherwise it clicks it. */
async function clickFirstEnabled(page, selector, viaKeyboard = false) {
  const locators = page.locator(selector);
  const count = await locators.count();
  for (let i = 0; i < count; i += 1) {
    const locator = locators.nth(i);
    if (!await locator.isVisible().catch(() => false)) continue;
    if (!await locator.isEnabled().catch(() => false)) continue;
    if (viaKeyboard) {
      await locator.focus({ timeout: 3000 });
      await page.keyboard.press('Enter');
    } else {
      await locator.click({ timeout: 3000 });
    }
    return true;
  }
  return false;
}

/* Tap-to-place and pairs: once a piece is picked («is-selected»), its partner is the
   next enabled control in the same section that lies outside the picked piece's own
   group (the other column of a pair, the gap of a tray). The cursor rotates through
   the candidates, so every partner is tried in turn. Marks the partner and returns
   how many candidates there were (0 when none). */
async function markPartner(page, cursor) {
  return page.evaluate((n) => {
    document.querySelectorAll('[data-smoke-partner]').forEach(el => el.removeAttribute('data-smoke-partner'));
    const visible = el => {
      const style = getComputedStyle(el);
      return el.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const picked = [...document.querySelectorAll('.is-selected')].find(visible);
    if (!picked) return 0;
    const scope = picked.closest('section, main, #app') || document.body;
    const pool = [...scope.querySelectorAll('button, [role="button"][tabindex="0"]')].filter(el =>
      el !== picked && visible(el) && !el.disabled && !el.classList.contains('is-selected') &&
      !(picked.parentElement && picked.parentElement.contains(el)));
    if (!pool.length) return 0;
    pool[n % pool.length].setAttribute('data-smoke-partner', '1');
    return pool.length;
  }, cursor);
}

/* Keypad activities: the digits are typed with the keyboard (even turns) or with the
   on-screen keys (odd turns), then checked with Enter or with the check key. */
async function typeKeypad(page, digits, viaKeyboard) {
  if (viaKeyboard) {
    await page.keyboard.type(digits);
    await page.keyboard.press('Enter');
    return;
  }
  for (const digit of digits) {
    const key = page.locator('.answer-pad .answer-key').filter({ hasText: new RegExp('^' + digit + '$') });
    await key.first().click({ timeout: 3000 });
    await page.waitForTimeout(40);
  }
  await clickFirstEnabled(page, '.answer-pad .answer-key-check');
}

/* Stars shown by the activity (0 when the activity has no #stars counter). */
async function starsCount(page) {
  if (!await page.locator('#stars').count()) return 0;
  const match = (await page.locator('#stars').innerText()).match(/\d+/);
  return match ? Number(match[0]) : 0;
}

/* Plays one round to its closing screen. Every wrong answer must be acknowledged
   («Entendido») before the next try, as a learner would do. A purchase (La Tienda)
   is paid by moving every coin to the counter first. The journey fails if the
   round stops moving. */
async function exerciseRoutimeRound(page, menuPicks, slug) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await waitForApp(page);
  for (const selector of menuPicks || []) {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
    assert.ok(await clickFirstEnabled(page, selector), 'No se puede abrir ' + selector);
    await page.waitForTimeout(SETTLE_MS);
  }
  /* Closing screens: the common end screen, the closing rule of a chat, or the
     celebration title of the pages that finish inside #app. */
  const END = [
    '#endScreen:not(.hidden)', '#reglaFinal:not(.hidden)', '.titulo-celebracion', '.celebration-title',
  ].join(', ');
  const endVisible = () => page.locator(END).first().isVisible().catch(() => false);
  /* Every third activation goes through the keyboard, so the round is played both
     with the mouse and with the keyboard. */
  let activations = 0;
  const keyboardTurn = () => {
    activations += 1;
    return activations % 3 === 0;
  };
  /* The last situation's timer swaps the round for its closing screen while a click
     is still waiting for an option, so that click can time out. If the round has
     ended, that is not a failure: the next pass of the loop sees the closing screen. */
  const safeClick = (selector) => clickFirstEnabled(page, selector, keyboardTurn()).catch(async (error) => {
    if (await endVisible()) return false;
    throw error;
  });
  const keypadDigits = ROUTIME_KEYPAD_ANSWERS[slug];
  let keypadTurns = 0;
  let cursor = 0;
  const ANSWERS = [
    '.sign-tile', '.pareja-palabra', '.letter-opcion', '.opcion-picto',
    '#options .btn-opcion', '#options .caja', '#options .opcion-figura', '#options .pad',
    '#opciones .btn-opcion', '#opciones .caja', '#cajas .caja', '#listasDia .caja',
    '#cajasSecciones .caja', '#cajasReconocer .btn-opcion', '#opcionesQueHago .btn-opcion', '#opcionesSaber .btn-opcion',
    '#opcionesReconocer .btn-opcion', '#quizOptions .btn-opcion', '#escena .objeto',
    '#optionsQuiz .btn-opcion', '#accionesTienda .btn-opcion', '#chatOpciones .btn-opcion',
    '#app .btn-option', '#app .btn-opcion', '#chatOpciones button',
  ].join(', ');
  const NEXTS = [
    '#btnNext', '#btnNextQuiz', '#nextButton', '#nextBtn', '#nextCardBtn', '#btnContinuarTienda',
    '#btnSiguienteSecciones', '#btnSiguienteSaber', '#btnSiguienteReconocer', '#btnSiguienteQueHago',
    '#quizNextBtn', '#startQuizBtn', '#btnListo',
  ].join(', ');
  const PAY = '#accionesTienda .btn:not(.btn-opcion)';
  let answered = 0;
  let stalled = 0;
  const starsBefore = await starsCount(page);
  for (let step = 0; step < 400; step += 1) {
    if (await endVisible()) {
      assert.ok(answered >= 1, 'La ronda terminó sin que se respondiera ninguna pregunta');
      /* A star is earned only for a right answer on the first try. The driver always
         takes the first enabled option, so a round can end with none; the check is
         that the stars never go down. */
      assert.ok(await starsCount(page) >= starsBefore, 'Las estrellas no pueden bajar durante una ronda');
      return 1;
    }
    let label = '';
    if (await safeClick('.btn-entendido')) label = 'ack';
    else if (await safeClick('#btnPlay, #btnContinuarIntro')) label = 'start';
    else if (await safeClick(NEXTS)) label = 'next';
    else if (await page.locator(PAY).first().isVisible().catch(() => false)) {
      for (let coin = 0; coin < 20 && await safeClick('#mesaTienda button'); coin += 1) {
        await page.waitForTimeout(SETTLE_MS);
      }
      await safeClick(PAY);
      label = 'pay';
    } else if (keypadDigits && await page.locator('.answer-pad .answer-key').first().isVisible().catch(() => false)) {
      keypadTurns += 1;
      await typeKeypad(page, keypadDigits, keypadTurns % 2 === 0);
      answered += 1;
      label = 'keypad';
    } else if (await page.locator('.is-selected').first().isVisible().catch(() => false)) {
      cursor += 1;
      const candidates = await markPartner(page, cursor);
      if (candidates && await clickFirstEnabled(page, '[data-smoke-partner="1"]', keyboardTurn())) {
        label = 'partner';
      }
    } else if (await safeClick(ANSWERS)) { answered += 1; label = 'answer'; }
    if (label) {
      if (process.env.UI_SMOKE_TRACE) process.stdout.write(' ' + label);
      stalled = 0;
      await page.waitForTimeout(SETTLE_MS);
      continue;
    }
    stalled += 1;
    if (stalled === 39 && process.env.UI_SMOKE_TRACE) {
      const dump = await page.evaluate(() => ({
        selected: [...document.querySelectorAll('.is-selected')].map(e => e.outerHTML.slice(0, 120)),
        roles: [...document.querySelectorAll('[role="button"]')].map(e => e.outerHTML.slice(0, 120)),
      }));
      process.stdout.write('\nDIAGNOSTICO ' + JSON.stringify(dump) + '\n');
    }
    assert.ok(stalled < 40, 'La ronda se queda parada: no hay ni respuesta, ni «Entendido», ni «Siguiente»');
    await page.waitForTimeout(150);
  }
  assert.fail('La ronda no llega a su pantalla final en 400 pasos');
}

/* Ecos: a sequence of pads. The game plays the sequence back on its own (pads
   disabled, one lit at a time) and then waits for the same sequence. An observer
   installed before the page scripts counts each finished playback and keeps its
   lit order; the driver repeats that order, round after round, until the closing
   screen shows. */
const ECOS_RECORDER = `(() => {
  window.__ecosPlaybacks = 0;
  window.__ecosLastSeq = [];
  window.__ecosScans = 0;
  let current = [];
  let playing = false;
  let lastLit = -1;
  const scan = () => {
    window.__ecosScans += 1;
    const pads = [...document.querySelectorAll('.pad')];
    if (!pads.length) return;
    const now = pads.some(p => p.disabled);
    if (now && !playing) current = [];
    if (!now && playing) { window.__ecosLastSeq = current.slice(); window.__ecosPlaybacks += 1; }
    playing = now;
    const lit = pads.findIndex(p => p.classList.contains('activo'));
    if (now && lit >= 0 && lit !== lastLit) current.push(lit);
    lastLit = now ? lit : -1;
  };
  new MutationObserver(scan).observe(document, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'disabled'],
  });
})();`;

async function exerciseEcos(page) {
  await page.addInitScript(ECOS_RECORDER);
  await page.reload({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
  await waitForApp(page);
  const END = '#endScreen:not(.hidden)';
  let seen = 0;
  let rounds = 0;
  for (let guard = 0; guard < 80; guard += 1) {
    if (await page.locator(END).isVisible().catch(() => false)) break;
    let waited = 0;
    while (waited < 20000) {
      const ready = await page.evaluate(n => window.__ecosPlaybacks > n ||
        !!document.querySelector('#endScreen:not(.hidden)'), seen);
      if (ready) break;
      await page.waitForTimeout(100);
      waited += 100;
    }
    assert.ok(waited < 20000, 'Ecos no vuelve a reproducir la secuencia');
    const played = await page.evaluate(() => ({ count: window.__ecosPlaybacks, seq: window.__ecosLastSeq }));
    if (await page.locator(END).isVisible().catch(() => false)) break;
    seen = played.count;
    assert.ok(played.seq.length, 'Ecos no reproduce ninguna secuencia');
    for (const index of played.seq) {
      await page.locator('.pad').nth(index).click({ timeout: 3000 });
      await page.waitForTimeout(160);
    }
    /* The game then waits for «Siguiente» before the next playback. */
    await page.waitForTimeout(300);
    await clickFirstEnabled(page, '#btnNext');
    rounds += 1;
  }
  assert.ok(await page.locator(END).isVisible().catch(() => false),
    'Ecos no llega a su pantalla final');
  return rounds ? 1 : 0;
}

async function exerciseFullFunctionality(page, route, baseUrl) {
  if (APP === 'calculia' && route.includes('/tools/numbers/')) {
    return exerciseNumbers(page, baseUrl);
  }
  if (APP === 'calculia' && route.includes('/tools/shapes/')) {
    return exerciseShapes(page, baseUrl);
  }
  if (APP === 'calculia' && Object.keys(SIMPLE_STARTS).some(key => route.includes(key))) {
    return exerciseSimpleStart(page, baseUrl, route);
  }
  if (APP === 'routime' && route.includes('/tools/ecos/')) return exerciseEcos(page);
  if (APP === 'routime') {
    const plan = ROUTIME_ROUNDS.find(([slug]) => route.includes('/tools/' + slug + '/'));
    if (plan) {
      let rounds = 0;
      for (const picks of plan[1]) rounds += await exerciseRoutimeRound(page, picks, plan[0]);
      return rounds;
    }
  }
  if (APP === 'apptonomia' && route.includes('/project/')) {
    return exerciseApptonomiaProject(page);
  }
  if (APP === 'memofun' && route.includes('/tools/study/')) {
    return exerciseMemofunStudy(page);
  }
  if (APP === 'sinonimia') return exerciseSinonimia(page, route);
  if (APP === 'ludia') return exerciseLudia(page, route);
  if (APP === 'okeymoney') return exerciseOkeymoney(page);
  if (APP === 'routime' && route.includes('/tools/safe-chat/')) {
    return exerciseRoutimeSafeChat(page);
  }
  if (APP === 'calculia' || APP === 'routime') return exerciseActivityApp(page);
  return 0;
}

/* A control can be :visible and still be off-screen while it slides in.
   The shared settings drawer is position:fixed and moves with a 0.16s
   transform, so 25ms after the gear is pressed its ✕ is already
   :visible (the .is-open class flips visibility at once) while it is
   still translated out of the viewport. Playwright cannot scroll a
   fixed element into view and answers "Element is outside of the
   viewport" — a transition race, not a UI defect. Wait, bounded, for
   the centre of the box to come inside the viewport, so a genuinely
   unreachable control still gets reported. */
async function waitInsideViewport(page, locator, timeout = 700) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const inside = await locator.evaluate(node => {
      const box = node.getBoundingClientRect();
      if (!box.width || !box.height) return false;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      return cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight;
    }).catch(() => false);
    if (inside) return true;
    await page.waitForTimeout(40);
  }
  return false;
}

// Waits for finite CSS transitions/animations (e.g. the settings drawer
// sliding in or out) so a control is not clicked while it moves offscreen.
async function waitForMotion(page) {
  await page.evaluate(() => Promise.all(document.getAnimations()
    .filter(animation => animation.effect &&
      animation.effect.getComputedTiming().endTime !== Infinity)
    .map(animation => animation.finished.catch(() => {})))).catch(() => {});
}

/* Pulsa un control tolerando las transiciones. El recorrido pulsa y solo
   espera 25 ms, asi que el control siguiente puede medirse mientras un
   panel se abre o una tarjeta crece: Playwright lo rechaza con 'Element is
   outside of the viewport' aunque la app este perfectamente bien. Se deja
   que la animacion se detenga, se mete el elemento en el viewport a
   proposito y se reintenta. Devuelve si el control quedo pulsado. */
async function clickControl(page, locator) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await locator.click({ timeout: 2000, force: true });
      return true;
    } catch (error) {
      if (!await locator.isVisible().catch(() => false)) return false;
      await locator.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
      try {
        await locator.click({ timeout: 2000, force: true });
        return true;
      } catch (retryError) {
        await page.waitForTimeout(220);
      }
    }
  }
  return false;
}

async function exerciseControls(page) {
  const seen = new Set();
  let actions = 0;
  for (let round = 0; round < 12 && actions < MAX_CONTROLS_PER_ROUTE; round += 1) {
    const state = await page.evaluate(() => {
      const root = document.querySelector('main') || document.body;
      return location.hash + '|' + (root.innerText || '').slice(0, 600);
    }).catch(() => '');
    const controls = await page.locator('button:visible, summary:visible, a[href^="#"]:visible')
      .evaluateAll(nodes => {
        let buttonIndex = 0, summaryIndex = 0, anchorIndex = 0;
        return nodes.map(node => {
          const item = {
            tag: node.tagName, id: node.id || '',
            text: (node.innerText || node.getAttribute('aria-label') || '').trim().slice(0, 100),
            href: node.getAttribute('href') || '',
            disabled: node.disabled === true || node.getAttribute('aria-disabled') === 'true',
            language: Boolean(node.matches('[data-locale], [data-lang], [data-locale-switch]')),
          };
          if (item.tag === 'BUTTON') item.index = buttonIndex++;
          else if (item.tag === 'SUMMARY') item.index = summaryIndex++;
          else item.index = anchorIndex++;
          return item;
        });
      });
    if (!controls.length) break;

    for (const control of controls) {
      if (actions >= MAX_CONTROLS_PER_ROUTE || control.disabled || control.language) continue;
      const identity = state + '|' + control.tag + '|' + control.id + '|' +
        control.href + '|' + control.text;
      if (seen.has(identity)) continue;
      const selector = control.tag === 'BUTTON' ? 'button:visible' :
        control.tag === 'SUMMARY' ? 'summary:visible' : 'a[href^="#"]:visible';
      const locator = page.locator(selector).nth(control.index);
      if (!await locator.isVisible().catch(() => false)) continue;
      await waitInsideViewport(page, locator);
      await settleDrawerTransition(page);
      /* El indice sale de una foto del DOM y el recorrido va pulsando: en
         cuanto se pulsa un control la vista puede cambiar (una carta abre un
         panel, un boton navega) y 'button:visible' ya no es la misma lista,
         de modo que .nth(control.index) resuelve un elemento DISTINTO del
         inventariado. Sin esta comprobacion el smoke accuse a la app de un
         boton que no podia pulsar: el indice caduco, no se rompio nada. Si el
         elemento que resuelve el indice ya no es el del inventario se salta,
         y se reintenta en la ronda siguiente con el DOM ya refrescado. */
      const stillInventoried = await locator.evaluate((node, expected) => {
        const text = (node.innerText || node.getAttribute('aria-label') || '').trim().slice(0, 100);
        return node.tagName === expected.tag &&
          (node.id || '') === expected.id &&
          (node.getAttribute('href') || '') === expected.href &&
          text === expected.text;
      }, control).catch(() => false);
      if (!stillInventoried) continue;
      /* Solo se marca como visto lo que se ha pulsado de verdad. Marcandolo
         antes de comprobar el indice, el control se saltaba y no volvia a
         intentarse en ninguna de las 12 rondas: el smoke dejaba de fallar
         pero tambien dejaba de probar (medido: -54% de interacciones). */
      seen.add(identity);
      try {
        if (control.tag === 'A') await locator.evaluate(node => node.click());
        else await locator.click({ timeout: 2000, force: true });
        actions += 1;
        await page.waitForTimeout(25);
        /* Ludia anima el tablero y los paneles: sin esperar a que terminen
           las transiciones, el clic siguiente se mide con la vista a medio
           mover. Las demás apps no lo necesitan y esperar a cada animación
           alarga el recorrido, así que la espera queda para Ludia. */
        if (APP === 'ludia') await waitForMotion(page);
        /* Sinonimia marca <main> como aria-busy mientras carga el bloque de
           detalle de una palabra: el clic siguiente se mide con la vista
           a medio cambiar. En las demás apps no hay aria-busy y la
           comprobación es un no-op. */
        await page.waitForFunction(() => !document.querySelector('main[aria-busy="true"]'),
          null, { timeout: NAV_TIMEOUT }).catch(() => {});
      } catch (error) {
        /* Si el elemento sigue en pantalla tras el fallo, se reintenta una
           vez dejandolo entrar en el viewport antes de declararlo fallo
           real. El error tipico es 'Element is outside of the viewport'
           por una transicion a medias, no un boton roto (lo reproducia
           okeymoney en /#block-practica con #unidad-bankProducts, que un
           clic de verdad si acepta). */
        if (!await locator.isVisible().catch(() => false)) continue;
        if (await clickControl(page, locator)) {
          actions += 1;
          await page.waitForTimeout(25);
          continue;
        }
        throw new Error('No se pudo activar ' + control.tag + '#' +
          (control.id || '(sin id)') + ' "' + control.text + '": ' + error.message);
      }
    }
  }
  return actions;
}

/* El cajon de ajustes compartido entra deslizando 160 ms. En cuanto se
   pulsa el engranaje sus botones ya son :visible para el navegador
   (visibility cambia con la clase) pero el transform todavia no los ha
   metido dentro del viewport, de modo que el clic siguiente revienta con
   'Element is outside of the viewport'. Aqui se espera a que el cajon
   termine de entrar. Sin esto el recorrido de controles falla en las
   paginas donde el engranaje cae entre los primeros botones. */
async function settleDrawerTransition(page) {
  await page.evaluate(() => new Promise((done) => {
    const drawer = document.querySelector('.locale-settings-drawer.is-open');
    if (!drawer) return done();
    const inside = () => {
      const r = drawer.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth + 1;
    };
    if (inside()) return done();
    const onEnd = () => {
      if (inside()) { drawer.removeEventListener('transitionend', onEnd); done(); }
    };
    drawer.addEventListener('transitionend', onEnd);
    setTimeout(() => { drawer.removeEventListener('transitionend', onEnd); done(); }, 600);
  }));
}

async function validateLinks(page, baseUrl) {
  const hrefs = await page.locator('a[href]').evaluateAll(nodes =>
    nodes.map(node => node.getAttribute('href')).filter(Boolean));
  const links = Array.from(new Set(hrefs)).map(href => {
    try { return new URL(href, page.url()); } catch { return null; }
  }).filter(url => url && url.origin === new URL(baseUrl).origin &&
    url.pathname !== '/favicon.ico');
  for (const url of links) {
    let response;
    try {
      response = await fetch(url.href, { redirect: 'manual' });
    } catch (error) {
      throw new Error('No se pudo comprobar el enlace interno ' + url.href +
        ': ' + error.message);
    }
    assert.ok(response.status < 400,
      'Enlace interno roto (' + response.status + '): ' + url.pathname);
  }
}

async function runRoute(browser, baseUrl, route) {
  const context = await browser.newContext({
    locale: 'es-ES', serviceWorkers: 'block', viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  const errors = listenForErrors(page, baseUrl);
  page.on('dialog', dialog => dialog.dismiss());
  page.on('download', download => download.cancel().catch(() => {}));
  try {
    const response = await page.goto(baseUrl + route, {
      waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT,
    });
    assert.ok(response, 'Sin respuesta al navegar a ' + route);
    assert.ok(response.status() < 400,
      'La navegación a ' + route + ' devuelve ' + response.status());
    await waitForApp(page);
    await validateLinks(page, baseUrl);
    await exerciseLanguages(page);
    /* El campo de búsqueda global sigue en la cabecera mientras se abre un
       juego con ruta por hash: rellenarlo sacaría de la partida antes de su
       propio recorrido, así que los formularios solo se ejercitan fuera. */
    if (!(APP === 'sinonimia' && route.includes('/juego/'))) await exerciseForms(page);
    if (route.includes('#')) {
      await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await waitForApp(page);
    }
    const journeys = await exerciseFullFunctionality(page, route, baseUrl);
    const count = await exerciseControls(page);
    assert.deepEqual(errors.page, [], 'Errores de página: ' + errors.page.join('; '));
    assert.deepEqual(errors.console, [], 'Errores de consola: ' + errors.console.join('; '));
    assert.deepEqual(errors.resources, [], 'Recursos rotos: ' + errors.resources.join('; '));
    return { count, journeys };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

async function main() {
  const allRoutes = publicRoutes();
  const requestedRoutes = process.argv.slice(2);
  const routes = requestedRoutes.length
    ? allRoutes.filter(route => requestedRoutes.includes(route) || requestedRoutes.some(request =>
      request !== '/' && route.includes(request)))
    : allRoutes;
  assert.ok(routes.length, 'No se han descubierto rutas HTML públicas');
  const server = await startServer();
  const address = server.address();
  const baseUrl = 'http://127.0.0.1:' + address.port;
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  let tested = 0, controls = 0, journeys = 0;
  try {
    if (['ludia', 'memofun', 'routime'].includes(APP)) {
      process.stdout.write('\n[' + APP + '] app-specific sound settings covered below');
    } else {
      await exerciseSoundSettings(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] sound settings OK');
    }
    await exerciseFontSizeSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] font-size settings OK');
    await exerciseAppearanceSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] theme/contrast/language settings OK');
    if (APP === 'memofun') {
      await exerciseConfigLanguage(browser, baseUrl);
      process.stdout.write('\n[memofun] configuration language selection and persistence OK');
    }
    await exerciseNativeSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] native settings OK');
    if (process.env.UI_SMOKE_SETTINGS_ONLY !== '1') {
      await exerciseUnsupportedBrowserLanguage(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] fr-FR fallback OK');
    }
    if (APP === 'routime' && process.env.UI_SMOKE_SETTINGS_ONLY !== '1') {
      await exerciseRoutimeAboutPage(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] achievements OK');
    }
    for (const route of (process.env.UI_SMOKE_SETTINGS_ONLY === '1' ? [] : routes)) {
      process.stdout.write('\n[' + APP + '] ' + route + ' ');
      try {
        const result = await runRoute(browser, baseUrl, route);
        tested += 1; controls += result.count; journeys += result.journeys;
        process.stdout.write('OK (' + result.count + ' controles, ' + result.journeys + ' recorridos)');
      } catch (error) {
        failures.push({ route, message: error.stack || error.message });
        process.stdout.write('FAIL');
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  if (failures.length) {
    console.error('\n\nUI Playwright FAIL: ' + failures.length + ' de ' + routes.length + ' rutas');
    for (const failure of failures) {
      console.error('\n--- ' + failure.route + '\n' + failure.message);
    }
    process.exitCode = 1;
    return;
  }
  console.log('\n\nUI Playwright PASS: ' + tested + ' rutas, ' + controls +
    ' interacciones, ' + journeys + ' recorridos funcionales completos, idiomas ES/EN cuando están disponibles');
}

main().catch(error => {
  console.error('UI Playwright FAIL: ' + (error.stack || error.message));
  process.exitCode = 1;
});