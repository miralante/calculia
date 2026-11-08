'use strict';
/* Checks: the explanation carousel and the test sheet are defined once, in assets/css/components.css,
   and the carousel wiring once, in App.utils (assets/js/utils.js). Runs with the shared context of
   scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, ROOT = ctx.ROOT, failures = ctx.failures;
  var toolsDir = path.join(ROOT, 'tools');

  /* --- 18. The explanation carousel and the test sheet have one definition.
      Every activity that shows a card with ← and → (a picto or a drawing, its name, one sentence), and
      every activity that paints a test sheet (one card per question, checked all at once), uses the
      classes of components.css. When each activity carried its own copy, the arrows of Unidades de
      tiempo sat at the left edge while the others were centred, and the sheet rules drifted apart: a
      copy drifts without anybody noticing. What is specific to one card or one sheet (a month grid, a
      symbol, a row of balls, a smaller picture) gets its own class, not a new copy of these. The
      carousel wiring (← → and Enter on the card) is App.utils.bindCarousel; an activity keeps only its
      paint. --- */
  var SHARED_CAROUSEL_CLASSES = ['carousel-card', 'carousel-display', 'carousel-figure', 'carousel-name',
    'carousel-caption', 'carousel-controls', 'gallery-note', 'intro-buttons'];
  var SHEET_CLASSES = ['test-sheet', 'test-sheet-card', 'sheet-actions'];
  var SHARED_CSS_RE = new RegExp('\\.(' + SHARED_CAROUSEL_CLASSES.concat(SHEET_CLASSES).join('|') + ')(?![\\w-])|@keyframes test-sheet-shake');
  /* In the two sheets of assets/css that are not components.css, a rule that opens with one of these
     classes is a copy; a variant such as `.test-sheet-card .visual` is not. */
  var SHEET_OPENING_RE = new RegExp('(^|[}\\s,])\\.(' + SHEET_CLASSES.join('|') + ')\\s*[{,]|@keyframes test-sheet-shake|' +
    '(^|[}\\s,])\\.(' + SHARED_CAROUSEL_CLASSES.join('|') + ')(?![\\w-])');
  var SHARED_CAROUSEL_JS = ['onCardKey'];

  var NOT_SHARED_SHEETS = ['assets/css/activity-flow.css', 'assets/css/number-sort.css'];
  ctx.checks += 1;
  NOT_SHARED_SHEETS.forEach(function (file) {
    var css = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    var hit = SHEET_OPENING_RE.exec(css);
    if (hit) {
      failures.push(file + ': define «' + hit[0].trim() + '», que es de assets/css/components.css ' +
        '(el carrusel de explicación y la hoja de prueba tienen una sola definición).');
    }
  });

  fs.readdirSync(toolsDir).filter(function (slug) {
    return fs.statSync(path.join(toolsDir, slug)).isDirectory();
  }).forEach(function (slug) {
    var cssFile = path.join(toolsDir, slug, 'styles.css');
    if (fs.existsSync(cssFile)) {
      var css = fs.readFileSync(cssFile, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      var hit = SHARED_CSS_RE.exec(css);
      if (hit) {
        failures.push('tools/' + slug + '/styles.css: define «' + hit[0] + '», que es de assets/css/components.css ' +
          '(el carrusel de explicación y la hoja de prueba tienen una sola definición). Usa esa clase; si esta ' +
          'actividad necesita algo propio, una clase nueva para lo específico, no una copia de la regla.');
      }
    }
    fs.readdirSync(path.join(toolsDir, slug)).forEach(function (file) {
      if (!file.endsWith('.js')) return;
      var code = fs.readFileSync(path.join(toolsDir, slug, file), 'utf8');
      SHARED_CAROUSEL_JS.forEach(function (name) {
        if (new RegExp('\\bfunction\\s+' + name + '\\s*\\(').test(code)) {
          failures.push('tools/' + slug + '/' + file + ': define su propio `function ' + name + '(`. ' +
            'El cableado del carrusel está en App.utils.bindCarousel (assets/js/utils.js).');
        }
      });
    });
  });
};
