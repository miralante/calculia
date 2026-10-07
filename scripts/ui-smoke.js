'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

const ROOT = path.resolve(__dirname, '..');
const APP = path.basename(ROOT);
const BASE_PATH = APP === 'routime' ? '/site/' : '/';
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
  enroca: ['#home', '#settings', '#learn', '#exercise/all', '#minigames',
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
    '#ludia/checkers/play', '#ludia/checkers/match'],
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
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('miralante:sounds'))),
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
    const settingsKey = APP === 'ludia' ? 'enroca:locale:accessibility' : APP + ':locale:accessibility';
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
    assert.notDeepEqual(dark.palette, light.palette, 'El tema debe cambiar la paleta visible de la app');
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
    await page.waitForFunction(() =>
      !!(document.documentElement && document.documentElement.lang.slice(0, 2) === 'en'),
    null, { timeout: NAV_TIMEOUT });
    assert.strictEqual((await page.locator('html').getAttribute('lang') || '').slice(0, 2), 'en',
      'El desplegable del cajón debe cambiar el idioma activo de la app');
    assert.strictEqual((await languagePicker.locator('.locale-picker-current').textContent()).trim(), 'EN');

    /* El ⚙️ se queda solo en la fila de la cabecera y el idioma, dentro.
       Se comprueba que el engranaje es el último de su fila en vez de que
       esté solo, porque esa fila puede llevar otros controles. */
    const gearRow = await page.evaluate(() => {
      const gear = document.querySelector('.locale-settings-trigger');
      const drawer = document.getElementById('accessibility-settings');
      const picker = document.getElementById('locale-picker');
      return {
        pickerInDrawer: drawer.contains(picker),
        gearIsLast: !!gear && gear.parentNode.lastElementChild === gear,
        alignsEnd: getComputedStyle(gear.parentNode).justifyContent === 'flex-end',
      };
    });
    assert.strictEqual(await page.locator('#accessibility-settings .locale-picker-btn').count(), 1,
      'El cajón debe traer el desplegable de idioma');
    assert.ok(gearRow.pickerInDrawer, 'El selector de idioma debe vivir dentro del cajón de ajustes');
    assert.ok(gearRow.gearIsLast, 'El engranaje debe quedar arriba a la derecha, el último de su fila');
    assert.ok(gearRow.alignsEnd, 'La fila de controles debe alinearse al final para quedar arriba a la derecha');
    assert.strictEqual(await page.locator('#accessibility-settings [data-settings-more]').count(), 0,
      'El cajón no debe enlazar a la página de ajustes propia del proyecto');
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
    } else if (APP === 'okeymoney') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
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
      await page.goto(baseUrl + '/site/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.strictEqual(await page.evaluate(() => window.__nativeSettingsTones), 0,
        'Desactivar sonidos debe silenciar el sonido real de Routime');
      await page.goto(baseUrl + '/config/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('#selectorSonidos [data-valor="on"]').click();
      await page.goto(baseUrl + '/site/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.evaluate(() => window.App.feedback.success());
      assert.ok(await page.evaluate(() => window.__nativeSettingsTones) > 0,
        'Activar sonidos debe habilitar el sonido real de Routime');
      await page.locator('#inputOwnAddress').fill('Calle de prueba 12');
      await page.locator('#btnSaveMyDetails').click();
      assert.ok(await page.evaluate(() => Object.keys(localStorage)
        .some(key => (localStorage.getItem(key) || '').includes('Calle de prueba 12'))),
        'Guardar mis datos debe persistir la dirección en esta app');
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#btnExportar').click();
      await downloadPromise;
    } else if (APP === 'ludia') {
      await page.goto(baseUrl + '/#settings', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.locator('[data-setting="size"]').waitFor({ state: 'visible', timeout: NAV_TIMEOUT });
      await page.locator('[data-setting="size"]').selectOption('large');
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('large-text')),
        'El tamaño grande debe activar la clase de tipografía de Ludia');
      await page.locator('[data-setting="contrast"]').check();
      assert.ok(await page.locator('html').evaluate(node => node.classList.contains('high-contrast')),
        'El contraste debe activar la paleta propia de Ludia');
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
    } else if (APP === 'sinonimia') {
      await page.goto(baseUrl + '/', { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      const before = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      await page.locator('#letra-mas').click();
      const after = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
      assert.ok(after > before, 'A+ debe aumentar el texto visible de Sinonimia');
      assert.strictEqual(await page.locator('#contraste-toggle').getAttribute('aria-pressed'), 'false');
      await page.locator('#contraste-toggle').click();
      assert.strictEqual(await page.locator('#contraste-toggle').getAttribute('aria-pressed'), 'true');
      assert.strictEqual(await page.locator('body').evaluate(node => node.classList.contains('alto-contraste')), true);
      assert.strictEqual(await page.evaluate(() => localStorage.getItem('sinonimia-contraste')), '1');
    }
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
  await clickFirstVisible(page, '#letra-mas');
  await clickFirstVisible(page, '#letra-menos');
  await clickFirstVisible(page, '#letra-normal');
  await clickFirstVisible(page, '#contraste-toggle');
  await clickFirstVisible(page, '#contraste-toggle');
  if (route.includes('/juego/')) {
    actions += await answerVisibleQuestions(page, 10);
    assert.ok(actions > 0, 'El juego de Sinonimia no permite responder ninguna pregunta');
    return actions ? 1 : 0;
  }
  const search = page.locator('#search').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill('a');
    await page.waitForTimeout(SETTLE_MS);
    assert.ok(await page.locator('#word-list .card').count() ||
      await page.locator('#no-results:not([hidden])').count(),
      'La búsqueda de Sinonimia no produce estado visible');
    const filter = page.locator('.filter-btn').nth(1);
    if (await filter.isVisible().catch(() => false)) { await filter.click(); actions += 1; }
    const alphabet = page.locator('#alphabet button:not([disabled])').first();
    if (await alphabet.isVisible().catch(() => false)) { await alphabet.click(); actions += 1; }
    const word = page.locator('a[href*="/word/"]').first();
    if (await word.isVisible().catch(() => false)) {
      await word.click();
      await page.waitForTimeout(SETTLE_MS);
      assert.ok(await page.locator('#detail-view:not([hidden])').count(),
        'La tarjeta de palabra no abre el detalle');
      actions += 1;
      await page.goBack({ waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
    }
    await clickFirstVisible(page, '#surpriseMe');
    actions += 1;
  }
  return actions ? 1 : 0;
}

async function exerciseEnroca(page, route) {
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

async function exerciseShapes(page, baseUrl) {
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
  await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV_TIMEOUT });
  actions += 1;

  const introCards = page.locator('#galleryVisual .shape-compare-item');
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
  assert.ok(await page.locator('#galleryCaption').isHidden(),
    'La primera diapositiva muestra una explicación duplicada');
  assert.ok(await page.locator('#galleryNote').isHidden(),
    'La primera diapositiva cuenta lados o caras antes de presentar la forma');
  await page.locator('#galleryNext').click();
  const partCards = page.locator('#galleryVisual .shape-part-item');
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
  assert.ok(await page.locator('#galleryNote').isHidden(),
    'La segunda diapositiva cuenta lados o caras sin haber visto la forma');

  /* El resto de conceptos van en dos diapositivas más, y cada una tiene su
     propia forma de enseñar el concepto en el dibujo. Sin esto, añadir un
     concepto al carrusel podría dejarse sin comprobar ometerlo en la
     diapositiva que le toca. */
  await page.locator('#galleryNext').click();
  const insideCards = page.locator('#galleryVisual .shape-part-item');
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

  await page.locator('#galleryNext').click();
  const sameCards = page.locator('#galleryVisual .shape-part-item');
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
  await page.locator('#galleryNext').click();

  const galleryNames = [];
  const galleryCount = await page.evaluate(() => window.DATA.gallery.length);
  for (let i = 0; i < galleryCount; i += 1) {
    galleryNames.push(await page.locator('#galleryVisual').getAttribute('aria-label'));
    assert.ok((await page.locator('#galleryCaption').innerText()).trim(),
      'Falta la explicación de una forma en la galería');
    assert.equal(await page.locator('#galleryCaption').evaluate(node =>
      getComputedStyle(node).textTransform), 'capitalize',
    'El nombre de la forma no destaca con mayúscula inicial');
    assert.equal(await page.locator('#galleryCaption').evaluate(node => node.textContent.trim()),
      galleryNames[galleryNames.length - 1],
      'La galería añade detalles sobre lados, esquinas o caras en vez de presentar la forma');
    const galleryItem = await page.evaluate(index => window.DATA.gallery[index], i);
    const galleryShapeId = galleryItem.id;
    /* El nombre se queda solo en el título; la aclaración de cuántos lados
       o caras tiene la forma va en su propia línea, debajo. */
    const note = (await page.locator('#galleryNote').innerText()).trim();
    assert.ok(note, 'Falta la aclaración de lados o caras bajo la forma');
    if (galleryItem.type === 'flat') {
      const sides = await page.evaluate(id => window.DATA.sides[id], galleryShapeId);
      assert.equal(note, sides ? `${sides.sides} lados y ${sides.corners} vértices`
        : 'Sin lados rectos ni vértices',
      'La aclaración no dice los lados y los vértices que tiene la forma');
    } else {
      assert.match(note, /caras|curva/,
        'La aclaración no dice cuántas caras tiene el cuerpo ni de qué forma son');
    }
    const [captionSize, noteSize] = await page.evaluate(() => [
      parseFloat(getComputedStyle(document.querySelector('#galleryCaption')).fontSize),
      parseFloat(getComputedStyle(document.querySelector('#galleryNote')).fontSize)
    ]);
    assert.ok(noteSize < captionSize,
      'La aclaración destaca más que el nombre de la forma');
    assert.notEqual(await page.locator('#galleryNote').evaluate(node =>
      getComputedStyle(node).textTransform), 'capitalize',
    'La aclaración se lee como un título y compite con el nombre de la forma');
    if (galleryShapeId === 'rectangularPrism') {
      assert.equal(await page.locator('#galleryVisual .solid-left').getAttribute('points'),
        '10,42 88,42 88,102 10,102',
      'La cara más larga del prisma rectangular no queda de frente');
    }
    if (galleryShapeId === 'pyramid') {
      assert.equal(await page.locator('#galleryVisual .solid-left').count(), 2,
        'La pirámide no muestra sus caras triangulares');
    }
    if (galleryShapeId === 'cylinder') {
      const cylinder = await page.locator('#galleryVisual svg').evaluate(svg => ({
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
      await page.locator('#galleryNext').click();
      actions += 1;
    }
  }
  assert.equal(new Set(galleryNames).size, galleryCount,
    'La galería no presenta todas las formas y cuerpos sin omisiones');
  assert.ok(galleryNames.includes('círculo') && galleryNames.includes('hexágono') &&
    galleryNames.includes('octágono') && galleryNames.includes('cubo') &&
    galleryNames.includes('cono'),
  'La galería no incluye formas planas y cuerpos geométricos');
  await page.locator('#galleryNext').click();
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
    assert.equal(await page.locator('#realObject .intro-side-mark').count(), 0,
      'El ejemplo cotidiano marca un lado sin que haya nada que señalar');
    realExamples.push((await page.locator('#realCaption').innerText()).trim());

    /* Los tres conceptos, en la vida real: lados, vértices y perímetro.
       Los números salen de DATA.sides, la misma fuente que el dibujo y el
       test, así que la nota no puede contradecir a ninguna de las dos
       cosas. Y los cuerpos se quedan sin nota: lados, vértices y
       perímetro son palabras de una figura, y un cubo tiene caras. */
    const realNoteText = (await page.locator('#realNote').innerText()).trim();
    const galleryType = await page.evaluate(index => window.DATA.gallery[index].type, i);
    if (galleryType === 'flat') {
      const flatSides = await page.evaluate(id => window.DATA.sides[id], realShapeId);
      assert.ok(realNoteText,
        'El ejemplo cotidiano de ' + realShapeId + ' no cuenta los tres conceptos');
      if (flatSides) {
        assert.ok(realNoteText.includes(`${flatSides.sides} lados`) &&
          realNoteText.includes(`${flatSides.corners} vértices`) &&
          /perímetro/i.test(realNoteText) &&
          /área/i.test(realNoteText),
        'La nota del ejemplo cotidiano no nombra lados, vértices, perímetro y área de ' +
          realShapeId + ': ' + realNoteText);
      } else {
        assert.match(realNoteText, /no tiene lados rectos ni vértices/i,
          'El ejemplo del círculo no dice que no tiene lados ni vértices');
        assert.match(realNoteText, /área/i,
          'El ejemplo del círculo no dice que tiene área');
      }
    } else {
      /* Los cuerpos no se cuentan en lados ni vértices: se cuentan en
         caras, y lo que se les aplica aquí es el volumen, que es el hueco
         que hay dentro. */
      assert.match(realNoteText, /volumen/i,
        'El ejemplo cotidiano de ' + realShapeId +
        ' no explica el volumen del cuerpo: ' + realNoteText);
    }
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
    const EXPECTED_REAL_POLYGONS = {
      triangle: 1, square: 1, trapezoid: 1, pentagon: 2, hexagon: 7, octagon: 1,
      rectangularPrism: 3, triangularPrism: 3, pyramid: 2,
    };
    if (DRAWN_REAL.indexOf(realShapeId) !== -1) {
      assert.ok(await page.locator('#realObject svg').count() > 0,
        'El ejemplo cotidiano de ' + realShapeId + ' se queda en el emoji sin dibujo');
    }
    if (realShapeId in EXPECTED_REAL_POLYGONS) {
      const polygonCount = await page.locator('#realObject svg polygon').count();
      assert.equal(polygonCount, EXPECTED_REAL_POLYGONS[realShapeId],
        'La ilustración real no muestra con claridad la forma esperada');
    }
    /* The window is the square: a square frame, and the mullions drawn as
       lines so they cannot be mistaken for sides of the frame. */
    if (realShapeId === 'square') {
      const frame = await page.locator('#realObject svg polygon').boundingBox();
      assert.ok(Math.abs(frame.width - frame.height) <= 2,
        'La ventana no es un cuadrado: el marco mide ' + Math.round(frame.width) +
        ' por ' + Math.round(frame.height));
      assert.equal(await page.locator('#realObject svg line').count(), 2,
        'La ventana ha perdido el montante o el travesaño');
    }
    /* The badge carries a sheriff's star so it reads as "badge" without a
       word. The star must also stay off <polygon>: the count above is what
       proves the shield has five sides, and a star drawn as polygons would
       quietly make that check meaningless. One path for the star, one
       circle for the seal in its middle. */
    if (realShapeId === 'pentagon') {
      assert.equal(await page.locator('#realObject svg circle').count(), 1,
        'El escudo deja de enseñar el sello del centro de la estrella');
      assert.equal(await page.locator('#realObject svg path').count(), 1,
        'El escudo deja de enseñar la estrella del sheriff');
      assert.ok(await page.locator('#realObject svg path').first()
        .getAttribute('d').then(d => /M60\.0 29\.0L/.test(d) || d.split('L').length === 12),
      'La estrella del escudo no tiene seis puntas');
    }
    /* The tent is the tent: gable, long side and open door, and nothing else.
       The guy line and the pennant it used to carry were clutter — they
       sat next to the outline of the prism and read as extra edges. */
    if (realShapeId === 'triangularPrism') {
      assert.equal(await page.locator('#realObject svg line').count(), 0,
        'La tienda ha vuelto a llevar cuerda o mástil');
      assert.equal(await page.locator('#realObject svg path').count(), 0,
        'La tienda ha vuelto a llevar la banderola');
    }
    /* The courses of stone are what make a pyramid something people built
       rather than something somebody pitched. Three courses that bend at
       the front corner, and no ground line under it: the mass ends on its
       own footprint. */
    if (realShapeId === 'pyramid') {
      assert.equal(await page.locator('#realObject svg polyline').count(), 3,
        'La pirámide ha perdido sus hiladas de piedra');
      assert.equal(await page.locator('#realObject svg line').count(), 4,
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
      const swirl = await boxOf('#realObject svg path[stroke-linecap="round"]');
      const cone = await boxOf('#realObject svg path[fill]:not([fill="none"])');
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
        '#realObject svg path[stroke-linecap="round"]')]
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
      assert.equal(await page.locator('#realObject svg clipPath').count(), 1,
        'El gofra del cucurucho se sale del cucurucho al no recortarse');
      const waffle = await page.locator('#realObject svg g[clip-path] path').count();
      assert.ok(waffle >= 12,
        'El gofra del cucurucho ha vuelto a ser un puñado de rayas: faltan las diagonales de la rejilla');
      assert.ok(await page.locator('#realObject svg path').count() >= 8,
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
        ...await boxesOf('#realObject svg circle'),
        ...await boxesOf('#realObject svg ellipse'),
      ];
      const cellBoxes = await boxesOf('#realObject svg polygon');
      assert.equal(cellBoxes.length, 7, 'El panal deja de enseñar siete celdas');
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
      const front = await page.locator('#realObject svg polygon.solid-left').boundingBox();
      const side = await page.locator('#realObject svg polygon.solid-right').boundingBox();
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
  for (let i = 0; i < realCount - 2; i += 1) {
    await page.locator('#realPrev').click();
    actions += 1;
  }
  /* Back at the triangle slide: still the plain three-sided sign, now with
     nothing drawn on top of it. */
  assert.ok((await page.locator('#realCaption').innerText()).includes('señal de peligro'),
    'Al volver atrás el ejemplo del triángulo no se corresponde con su dibujo');
  assert.equal(await page.locator('#realObject svg polygon').count(), 1,
    'El ejemplo del triángulo deja de enseñar un triángulo al volver atrás');
  await page.locator('#realNext').click();
  await page.locator('#realContinue').click();
  assert.ok(await page.locator('#screenMenu').isVisible(),
    'Los ejemplos reales no avanzan al menú de test');
  actions += 1;

  async function chooseCorrectAnswer(activityId, levelId) {
    const correctIndex = await page.evaluate(({ activityId, levelId }) => {
      const activity = window.DATA.activities[activityId];
      const level = activity.levels.find(item => item.id === levelId);
      const visual = document.querySelector('#visual');
      const visualName = visual.getAttribute('aria-label') || '';
      const prompt = document.querySelector('#prompt').textContent;
      const buttons = Array.from(document.querySelectorAll('#options .option-btn'));
      const t = key => window.App.i18n.t(key);
      let answer;
      if (prompt === t('gen.shapeNamePrompt')) {
        answer = visualName;
      } else if (prompt === t('gen.areaPrompt')) {
        answer = t('gen.areaInside');
      } else if (prompt.indexOf(t('gen.symmetryPrompt').split('{name}')[0]) === 0) {
        /* The correct fold is the one that leaves no stroke through the
           middle of the figure: the horizontal and the diagonal cut it in
           two visible pieces, the vertical one does not. Read off the
           option whose dashed line is vertical. */
        const vertical = buttons.filter(button => {
          const line = button.querySelector('.axis-mark');
          return line && line.getAttribute('x1') === line.getAttribute('x2');
        });
        if (vertical.length !== 1) {
          throw new Error('La pregunta de simetría no tiene un único eje vertical: ' +
            vertical.length);
        }
        answer = (vertical[0].getAttribute('aria-label') || vertical[0].innerText).trim();
      } else if (prompt.indexOf(t('gen.similarPrompt').split('{name}')[0]) === 0) {
        /* The correct option is the one drawn as the same figure as the one
           in the question, only smaller. Matched on the aria-label, which
           carries the name of the shape rather than its size. */
        answer = visualName;
      } else if (prompt === t('gen.volumePrompt')) {
        /* The only option drawn at the bigger size is the one with more
           volume, so the answer comes out of the picture and never out of
           the data: if the drawing and the answer ever disagreed, the big
           option would stop being the correct one and this would fail. */
        const big = buttons.filter(b => b.querySelector('.thumb-big'));
        if (big.length !== 1) throw new Error('La pregunta de volumen no tiene un único cuerpo grande');
        answer = (big[0].getAttribute('aria-label') || big[0].innerText).trim();
      } else if (prompt.indexOf(t('gen.perimeterPrompt').split('{side}')[0]) === 0) {
        /* The perimeter prompt carries the side length, so it is matched on
           its fixed opening rather than compared whole: the text on screen
           has {side} already filled in. The answer is worked out from
           DATA.sides and never read from the page, so this checks the same
           arithmetic a child would do. */
        const sideMatch = prompt.match(/(\d+)\s*cm/);
        if (!sideMatch) throw new Error('No se pudo leer el largo del lado: ' + prompt);
        const shapeId = Object.keys(window.DATA.sides).find(id =>
          window.App.i18n.t('shape.' + id) === visualName);
        if (!shapeId) throw new Error('Perímetro de una forma desconocida: ' + visualName);
        const side = Number(sideMatch[1]);
        const total = window.DATA.sides[shapeId].sides * side;
        /* The two wrong answers have to be exactly one side out in each
           direction. The mistake this question produces is leaving the
           last side out or counting one twice, not picking a wild number,
           so an option outside that would be a wrong shape of mistake. */
        const offered = buttons.map(b =>
          Number((b.getAttribute('aria-label') || b.innerText).trim()))
          .filter(v => !isNaN(v)).sort((a, b) => a - b);
        const expected = [total - side, total, total + side].sort((a, b) => a - b);
        if (JSON.stringify(offered) !== JSON.stringify(expected)) {
          throw new Error('Las opciones del perímetro de ' + shapeId + ' son ' +
            JSON.stringify(offered) + ' y tocaban ser ' + JSON.stringify(expected));
        }
        answer = String(total);
      } else if (prompt === t('gen.sidesPrompt') || prompt === t('gen.cornersPrompt')) {
        const shapeId = Object.keys(window.DATA.sides).find(id =>
          window.App.i18n.t('shape.' + id) === visualName);
        const count = prompt === t('gen.sidesPrompt') ? 'sides' : 'corners';
        answer = String(window.DATA.sides[shapeId][count]);
      } else if (prompt === t('gen.solidToNamePrompt')) {
        answer = visualName;
      } else if (visual.classList.contains('net-stage') ||
          visual.querySelector('.net-stage')) {
        const match = (prompt + ' ' + visualName).match(/(\d+)\s+(?:caras?|faces?)/i);
        if (/¿Cuántas caras|How many faces/i.test(prompt)) {
          if (!match) throw new Error('No se pudo leer el número de caras: ' + visualName);
          answer = match[1];
        } else {
          const counts = {
            T: visual.querySelectorAll('.net-tri').length,
            S: visual.querySelectorAll('.net-square').length,
            R: visual.querySelectorAll('.net-rect').length,
          };
          const net = window.DATA.nets.find(item => {
            const pieces = item.rows.join('').split('');
            return pieces.filter(ch => ch === 'T').length === counts.T &&
              pieces.filter(ch => ch === 'S').length === counts.S &&
              pieces.filter(ch => ch === 'R').length === counts.R;
          });
          if (!net) throw new Error('El desarrollo mostrado no coincide con ningún cuerpo');
          answer = window.App.i18n.t('net.' + net.id + '.name');
        }
      } else if (level.tipo === 'solidParts') {
        const match = visualName.match(/(\d+)\s+(?:caras?|faces?)/i);
        if (!match) throw new Error('No se pudo leer el número de caras: ' + visualName);
        answer = match[1];
      }
      return buttons.findIndex(button =>
        (button.getAttribute('aria-label') || button.innerText).trim() === answer);
    }, { activityId, levelId });
    assert.ok(correctIndex >= 0,
      'No se encontró respuesta correcta para ' + activityId + '/' + levelId +
      ': ' + JSON.stringify({
        prompt: await page.locator('#prompt').innerText(),
        visual: await page.locator('#visual').getAttribute('aria-label'),
        options: await page.locator('#options').innerText(),
      }));
    const options = page.locator('#options .option-btn');
    await options.nth(correctIndex).click();
    await page.waitForSelector('#btnNext:not(.hidden)', { timeout: NAV_TIMEOUT });
    assert.ok(await options.nth(correctIndex).evaluate(node => node.classList.contains('correct')),
      'La respuesta calculada no fue aceptada para ' + activityId + '/' + levelId);
    await page.locator('#btnNext').click();
  }

  const menuButtons = page.locator('#activitiesMenu .btn-actividad');
  assert.equal(await menuButtons.count(), 1,
    'El test de Formas está separado en más de una opción');
  assert.match(await menuButtons.innerText(), /Formas|Shapes/,
    'La opción única no está identificada como Formas');
  const testSpec = await page.evaluate(() => {
    const level = window.DATA.activities.formas.levels[0];
    const counts = level.questions.reduce((result, question) => {
      result[question.tipo] = (result[question.tipo] || 0) + 1;
      return result;
    }, {});
    return { id: level.id, length: level.questions.length, counts };
  });
  assert.equal(testSpec.id, 'test');
  assert.equal(testSpec.length, 50);
  assert.deepEqual(testSpec.counts, {
    shapeName: 9,
    shapeCount: 12,
    shapePerimeter: 6,
    shapeArea: 1,
    solidVolume: 3,
    shapeSymmetry: 3,
    shapeSimilar: 3,
    solidName: 7,
    solidParts: 3,
    fromNet: 3,
  }, 'La prueba única no incluye todos los tipos de contenido');
  await menuButtons.click();
  const firstPrompt = await page.locator('#prompt').innerText();
  assert.ok(firstPrompt.trim(),
    'La prueba única no presenta ninguna pregunta');
  actions += 1;
  for (let question = 0; question < testSpec.length; question += 1) {
    await chooseCorrectAnswer('formas', 'test');
    actions += 2;
  }
  await page.waitForSelector('#screenEnd:not(.hidden)', { timeout: NAV_TIMEOUT });
  assert.match(await page.locator('#endSummary').innerText(), /50 preguntas|50 questions/,
    'El resumen no incluye todas las preguntas de la ronda única');
  assert.ok(await page.locator('#btnHarder').isHidden(),
    'La prueba única ofrece niveles separados como otros tests');

  /* La aclaración de la galería también tiene que estar en inglés: si
     falta, sale el nombre de la clave en pantalla. Se comprueba una
     forma plana y un cuerpo, y se vuelve a español. */
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV_TIMEOUT });
  /* Se recorren las cuatro diapositivas de conceptos y se vuelve a la
     galería: la aclaración tiene que estar traducida en las dos, y el
     número de diapositivas sale de la misma constante que app.js usa para
     el carrusel. */
  const conceptTitles = [];
  for (let slide = 0; slide < 4; slide += 1) {
    conceptTitles.push(...await page.locator('#galleryVisual h2').allInnerTexts());
    await page.locator('#galleryNext').click();
  }
  assert.deepEqual(conceptTitles,
    ['Flat shape', 'Solid', 'Side', 'Vertex', 'Perimeter',
      'Area', 'Volume', 'Symmetry', 'Similarity'],
  'Las diapositivas de conceptos no están traducidas al inglés');
  assert.equal((await page.locator('#galleryNote').innerText()).trim(),
    'No straight sides and no vertices',
  'La aclaración de la galería no está traducida al inglés en las formas planas');
  /* Del círculo al cubo se avanza leyendo la galería, no contando a mano:
     insertar una forma en medio no puede dejar el recorrido en otra
     diapositiva sin que se note. */
  const cubeIndex = await page.evaluate(() =>
    window.DATA.gallery.findIndex(item => item.id === 'cube'));
  for (let step = 0; step < cubeIndex; step += 1) await page.locator('#galleryNext').click();
  assert.equal((await page.locator('#galleryNote').innerText()).trim(), '6 faces: 6 squares.',
    'La aclaración de la galería no está traducida al inglés en los cuerpos');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();

  /* Y la nota de los ejemplos de la vida real, en los dos idiomas: es la
     que junta los tres conceptos sobre el objeto de verdad. Se mira la
     misma forma en los dos (el triángulo, el segundo del carrusel) para
     que la comparación signifique algo. */
  const CONCEPTS = {
    es: [/lados/, /vértices/, /perímetro/, /área/],
    en: [/sides/, /vertices/, /perimeter/, /area/],
  };
  for (const locale of ['en', 'es']) {
    await page.evaluate(code => localStorage.setItem('calculia:locale', code), locale);
    await page.reload();
    await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV_TIMEOUT });
    await page.locator('#introContinue').click();
    await page.locator('#realNext').click();
    const noteText = (await page.locator('#realNote').innerText()).trim();
    /* El triángulo tiene 3 de cada: los números salen de DATA.sides, y el
       smoke los compara con lo que se está leyendo en pantalla. */
    const expected = await page.evaluate(() => window.DATA.sides.triangle);
    assert.ok(noteText.includes(`${expected.sides} lados`) ||
      noteText.includes(`${expected.sides} sides`),
    `La nota de los ejemplos en ${locale} no cuenta los lados del triángulo: ${noteText}`);
    CONCEPTS[locale].forEach(concept => {
      assert.match(noteText, concept,
        `La nota de los ejemplos en ${locale} no nombra ${concept} : ${noteText}`);
    });
  }
  await page.locator('#realBack').click();
  await page.waitForSelector('#screenIntro:not(.hidden)', { timeout: NAV_TIMEOUT });

  return actions ? 1 : 0;
}

async function exerciseNumbers(page, baseUrl) {
  let actions = 0;
  await page.goto(baseUrl + '/');
  await page.evaluate(() => {
    localStorage.setItem('calculia:numbers', JSON.stringify({
      stars: 2, completedRounds: 8, signedRounds: 1,
    }));
    localStorage.setItem('calculia:posneg', JSON.stringify({ stars: 4, completedRounds: 2 }));
    localStorage.setItem('calculia:locale', 'es');
  });
  await page.reload();

  /* Números ya no es una tarjeta de portada: el catálogo público solo
     muestra Números Romanos y Formas, y Números vive en la página oculta
     dev/. Se comprueba en las dos rutas, para que el reparto no vuelva a
     romperse en silencio por un lado o por otro. */
  assert.equal(await page.locator('a[href="tools/numbers/"]').count(), 0,
    'La portada pública vuelve a mostrar Números');
  /* Positivos y negativos dejó de ser una herramienta propia y se
     integró en Números (commit "feat(numbers): integrate positive and
     negative practice"), así que ya no existe tools/posneg/: ese
     catálogo solo debe seguir siendo una clave localStorage heredada,
     nunca una tarjeta. Comprobado sobre dev/, que es donde vive el
     catálogo completo. */
  await page.goto(baseUrl + '/dev/');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();
  assert.equal(await page.locator('a[href$="posneg"]').count(), 0,
    'El catálogo vuelve a enlazar Positivos y negativos como herramienta separada');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();

  const catalogCard = page.locator('a[href="../tools/numbers/"]');
  assert.ok(await catalogCard.isVisible().catch(() => false),
    'Números no aparece en el catálogo de dev/');
  assert.ok((await catalogCard.innerText()).includes('Los Números'),
    'La tarjeta de Números del catálogo no aparece en español');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  assert.ok((await catalogCard.innerText()).includes('Numbers'),
    'La tarjeta de Numbers del catálogo no aparece en inglés');
  await page.evaluate(() => localStorage.setItem('calculia:locale', 'es'));
  await page.reload();
  await catalogCard.click();
  await page.waitForURL('**/tools/numbers/', { timeout: NAV_TIMEOUT });
  await page.waitForSelector('#screenMenu:not(.hidden)', { timeout: NAV_TIMEOUT });
  actions += 1;

  const migrated = await page.evaluate(() => ({
    numbers: JSON.parse(localStorage.getItem('calculia:numbers') || '{}'),
    legacy: localStorage.getItem('calculia:posneg'),
  }));
  assert.equal(migrated.numbers.stars, 6,
    'Las estrellas existentes y las de Positivos y negativos no se conservaron al migrar');
  assert.equal(migrated.numbers.signedRounds, 2,
    'Las rondas previas no se conservaron para la progresión del ascensor');
  assert.equal(migrated.numbers.completedRounds, 8,
    'La migración alteró la progresión de las demás actividades de Números');
  assert.equal(migrated.legacy, null,
    'El progreso anterior quedó duplicado tras migrarlo');

  const signedActivity = page.locator('#activitiesMenu .btn-actividad')
    .filter({ hasText: 'Positivos y negativos' });
  assert.equal(await signedActivity.count(), 1,
    'Números no incluye la actividad de positivos y negativos');
  await signedActivity.click();
  await page.waitForSelector('#signedIntroScreen:not(.hidden)', { timeout: NAV_TIMEOUT });
  assert.equal(await page.locator('#signedNumberline .signed-numberline-tick').count(), 7,
    'La explicación no muestra una recta numérica visual');
  actions += 1;

  await page.locator('#signedIntroNext').click();
  await page.waitForSelector('#signedRealScreen:not(.hidden)', { timeout: NAV_TIMEOUT });
  assert.equal(await page.locator('#signedRealList .signed-real-item').count(), 3,
    'Faltan los ejemplos cotidianos de termómetro, ascensor o cuentas');
  assert.ok((await page.locator('#signedRealList').innerText()).includes('El termómetro') &&
    (await page.locator('#signedRealList').innerText()).includes('El ascensor'),
  'Los ejemplos cotidianos no se muestran en español');
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const documentWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(documentWidth.scroll <= documentWidth.client + 1,
      'La pantalla de ejemplos tiene desbordamiento horizontal a ' + width + 'px');
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  actions += 1;

  await page.locator('#signedRealNext').click();
  await page.waitForSelector('#signedTempScreen:not(.hidden)', { timeout: NAV_TIMEOUT });
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => {
      const controls = Array.from(document.querySelectorAll(
        '#signedTempScreen .btn-signed-temp'
      )).map(button => {
        const rect = button.getBoundingClientRect();
        return { left: rect.left, right: rect.right, height: rect.height };
      });
      return {
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        controls,
      };
    });
    assert.ok(dimensions.scroll <= dimensions.client + 1,
      'La pantalla del termómetro tiene desbordamiento horizontal a ' + width + 'px');
    assert.ok(dimensions.controls.every(control =>
      control.left >= 0 && control.right <= width && control.height >= 44),
    'Los controles del termómetro no caben o no tienen un tamaño táctil usable a ' + width + 'px');
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  for (let step = 0; step < 3; step += 1) {
    await page.locator('#signedTempScreen [data-step="-1"]').click();
  }
  assert.equal((await page.locator('#signedTempNumber').innerText()).trim(), '−1 °C',
    'El termómetro no cambia al cruzar el cero hacia los negativos');
  await page.locator('#signedTempNext').click();
  for (let step = 0; step < 3; step += 1) {
    await page.locator('#signedTempScreen [data-step="1"]').click();
  }
  assert.equal((await page.locator('#signedTempNumber').innerText()).trim(), '+1 °C',
    'El termómetro no cambia al cruzar el cero hacia los positivos');
  await page.locator('#signedTempNext').click();
  for (let step = 0; step < 2; step += 1) {
    await page.locator('#signedTempScreen [data-step="1"]').click();
  }
  assert.equal((await page.locator('#signedTempNumber').innerText()).trim(), '0 °C',
    'El último reto no llega exactamente a cero');
  await page.locator('#signedTempNext').click();
  await page.waitForSelector('#elevatorUI:not(.hidden)', { timeout: NAV_TIMEOUT });
  for (let step = 0; step < 3; step += 1) {
    await page.locator('#elevatorUI .btn-elevator[data-step="-1"]').click();
  }
  assert.ok((await page.locator('#feedback').innerText()).includes('¡Has llegado'),
    'El ascensor no confirma la llegada al piso negativo objetivo');
  await page.locator('#elevatorExit').click();
  await page.waitForSelector('#screenEnd:not(.hidden)', { timeout: NAV_TIMEOUT });
  assert.match(await page.locator('#endSummary').innerText(), /positivos y negativos/,
    'El resumen no corresponde a la práctica integrada');
  actions += 9;

  const completed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('calculia:numbers') || '{}'));
  assert.equal(completed.signedRounds, 3,
    'La actividad integrada no continúa la progresión guardada');
  assert.equal(completed.stars, 7,
    'El progreso de estrellas no se conserva ni se actualiza correctamente');
  assert.equal(completed.completedRounds, 8,
    'Completar el ascensor alteró el progreso de las demás actividades de Números');

  await page.evaluate(() => localStorage.setItem('calculia:locale', 'en'));
  await page.reload();
  await page.waitForSelector('#screenMenu:not(.hidden)', { timeout: NAV_TIMEOUT });
  await page.locator('#activitiesMenu .btn-actividad')
    .filter({ hasText: 'Positives and negatives' }).click();
  await page.waitForSelector('#signedIntroScreen:not(.hidden)', { timeout: NAV_TIMEOUT });
  assert.ok((await page.locator('#signedIntroScreen').innerText()).includes('Positive and negative numbers'),
    'La explicación de números con signo no está traducida al inglés');
  await page.locator('#signedIntroNext').click();
  assert.ok((await page.locator('#signedRealList').innerText()).includes('The thermometer'),
    'Los ejemplos cotidianos no están traducidos al inglés');
  actions += 2;
  await page.locator('#signedRealBack').click();

  return actions ? 1 : 0;
}

async function exerciseFullFunctionality(page, baseUrl, route) {
  if (APP === 'calculia' && route.includes('/tools/numbers/')) {
    return exerciseNumbers(page, baseUrl);
  }
  if (APP === 'calculia' && route.includes('/tools/shapes/')) {
    return exerciseShapes(page, baseUrl);
  }
  if (APP === 'apptonomia' && route.includes('/project/')) {
    return exerciseApptonomiaProject(page);
  }
  if (APP === 'memofun' && route.includes('/tools/study/')) {
    return exerciseMemofunStudy(page);
  }
  if (APP === 'sinonimia') return exerciseSinonimia(page, route);
  if (APP === 'enroca') return exerciseEnroca(page, route);
  if (APP === 'okeymoney') return exerciseOkeymoney(page);
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
      /* Let a sliding panel finish entering before clicking it. */
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
    await exerciseForms(page);
    if (route.includes('#')) {
      await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await waitForApp(page);
    }
    const journeys = await exerciseFullFunctionality(page, baseUrl, route);
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
    await exerciseNativeSettings(browser, baseUrl);
    process.stdout.write('\n[' + APP + '] native settings OK');
    if (process.env.UI_SMOKE_SETTINGS_ONLY !== '1') {
      await exerciseUnsupportedBrowserLanguage(browser, baseUrl);
      process.stdout.write('\n[' + APP + '] fr-FR fallback OK');
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
