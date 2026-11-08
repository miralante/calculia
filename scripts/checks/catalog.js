'use strict';
/* Checks: public/private catalog split, the round shuffle contract and the shared helpers. Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;
  var slugs = ctx.shared.slugs, toolsDir = ctx.shared.toolsDir, slugCode = ctx.shared.slugCode, EXTRA_MODULES = ctx.shared.EXTRA_MODULES, CANONICAL_BASE = ctx.shared.CANONICAL_BASE, STRING_LOCALES = ctx.shared.STRING_LOCALES, swContent = ctx.shared.swContent;

  /* --- 5. Public/private catalog split ---
     The public landing carries TEN entries (Los Números, Quantities,
     Ordinal Numbers, Fractions, Parity, Roman Numerals, Shapes,
     Trigonometry, Scale, Math Tables);
     the hidden dev/ page carries every other activity, plus the public
     ones listed in BOTH_SLUGS. Together they cover the full tools/,
     config/, and sw.js activity set. Public activities are the
     longest-lived "front door" — they stay discoverable for any
     visitor even when the rest of the catalogue is moved behind dev/.
     The order in PUBLIC_SLUGS is the visible order in index.html.

     BOTH_SLUGS are the activities that are public AND still listed in
     dev/. Until now the two lists were a partition — every slug was in
     exactly one of them — so adding a public activity necessarily
     removed its dev/ card. A front-door activity that keeps working
     through the full catalogue should not lose its place in it, so the
     split is no longer a partition and BOTH_SLUGS names the overlap.
     A slug left in dev/ by accident still fails below, which is the
     property that made the partition worth having.
  */
  ctx.checks += 1;
  var siteHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  var devHtml = fs.readFileSync(path.join(ROOT, 'dev', 'index.html'), 'utf8');
  /* The public landing sits at the site root and links "tools/<slug>/";
     the hidden dev/ page is one level down and links "../tools/<slug>/".
     The trailing slash is mandatory, not cosmetic: the ".../index.html"
     form is answered by Cloudflare with a 307 to the directory, and the
     service worker cannot hand that redirected response to a navigation
     (net::ERR_FAILED). The alternation keeps an index.html link from
     silently passing this gate and re-breaking the site. */
  var reHref = /href="(?:\.\.\/)?tools\/([^/]+)\/(?:index\.html|\?op=[a-z]+)?"/g;
  function parseSlugsFromPage(html) {
    var result = [];
    var match;
    while ((match = reHref.exec(html)) !== null) result.push(match[1]);
    reHref.lastIndex = 0;
    return new Set(result);
  }
  var publicSlugs = parseSlugsFromPage(siteHtml);
  var devSlugs = parseSlugsFromPage(devHtml);
  function assertExactCatalog(label, actual, expected) {
    expected.forEach(function (slug) {
      if (!actual.has(slug)) failures.push('catálogo: ' + label + ' no contiene el slug "' + slug + '"');
    });
    actual.forEach(function (slug) {
      if (!expected.has(slug)) failures.push('catálogo: ' + label + ' contiene slug inesperado "' + slug + '"');
    });
  }
  var PUBLIC_SLUGS = ['numbers-group', 'operation-concepts', 'factorial', 'common-group', 'order-numbers', 'quantities', 'ordinals', 'fractions-measures', 'time-group', 'percent', 'parity', 'primes', 'roman-numerals', 'lines', 'shapes', 'scale', 'math-tables', 'word-add', 'word-subtract', 'word-multiply', 'word-divide'];
  /* Public AND in dev/. Every name here must also be in PUBLIC_SLUGS,
     otherwise dev/ would carry an activity the landing hides, which is
     the inverse mistake and just as wrong. */
  var BOTH_SLUGS = ['numbers-group', 'operation-concepts', 'common-group', 'order-numbers', 'quantities', 'ordinals', 'fractions-measures', 'time-group', 'percent', 'parity', 'primes', 'lines', 'shapes', 'scale', 'math-tables', 'word-add', 'word-subtract', 'word-multiply', 'word-divide'];
  var expectedPublicSlugs = new Set(PUBLIC_SLUGS);
  var expectedDevSlugs = new Set(slugs.filter(function (slug) {
    return PUBLIC_SLUGS.indexOf(slug) === -1 || BOTH_SLUGS.indexOf(slug) !== -1;
  }));
  assertExactCatalog('site público', publicSlugs, expectedPublicSlugs);
  assertExactCatalog('dev oculto', devSlugs, expectedDevSlugs);

  function parseSlugsFromSw() {
    var matches = swContent.match(/'\.\/tools\/([^/]+)\//g) || [];
    var set = new Set();
    matches.forEach(function (m) {
      var slug = m.replace(/'.\/tools\//, '').replace(/\//, '');
      set.add(slug);
    });
    return set;
  }
  function parseDataToolInConfig() {
    var html = fs.readFileSync(path.join(ROOT, 'config', 'index.html'), 'utf8');
    var re = /data-tool="([^"]+)"/g;
    var set = new Set();
    var m;
    while ((m = re.exec(html)) !== null) set.add(m[1]);
    return set;
  }
  var slugsSet = new Set(slugs);
  var targets = { config: parseDataToolInConfig(), sw: parseSlugsFromSw() };
  Object.keys(targets).forEach(function (f) {
    var targetSet = targets[f];
    slugs.forEach(function (slug) {
      if (!targetSet.has(slug)) failures.push('catálogo: ' + f + ' no contiene el slug "' + slug + '"');
    });
    targetSet.forEach(function (slug) {
      if (!slugsSet.has(slug)) failures.push('catálogo: ' + f + ' contiene slug inexistente "' + slug + '"');
    });
  });
  /* --- 5b. Round structure: shuffle contract ---
     Every tools/<slug>/app.js must call App.utils.shuffle at least once. The
     contract (see doc/<locale>/tecnico.md §2.2.1) is that every activity
     shuffles its questions and its options; temperature is out of scope
     because its round has no order to shuffle. Quantities is out of scope
     too: its read/write and points rounds go up one digit at a time, and
     that order is the teaching point. A regression here would
     mean a new (or rewritten) activity forgot the shuffle, and the round
     would teach button position instead of content.

     The helpers App.utils.drawRound (bag with no repeats) and
     App.utils.spreadRepeats (no adjacent repeats) live in
     assets/js/utils.js. An activity that still defines its own `function
     draw(` or `function spreadRepeats(` is duplicating that helper and
     going around the contract. */
  /* timer: it has no questions or options; the person picks a duration and
     the count goes up from zero, so there is nothing to shuffle. */
  var NO_SHUFFLE = ['temperature', 'los-numeros', 'quantities', 'order-numbers', 'numbers-group', 'common-group', 'time-group', 'timer'];
  slugs.forEach(function (slug) {
    if (NO_SHUFFLE.indexOf(slug) !== -1) return;
    ctx.checks += 1;
    var appJs = slugCode(path.join(toolsDir, slug));
    if (appJs.indexOf('App.utils.shuffle') === -1) {
      failures.push('tools/' + slug + '/app.js: la ronda no llama a App.utils.shuffle ' +
        '(contrato §2.2.1: barajar preguntas u opciones)');
    }
    ctx.checks += 1;
    /* Local `function draw(` instead of App.utils.drawRound: copy-pasted
       helper. The regex requires whitespace + name + paren so it does
       not match `drawRound(` (helper calls) or `draw(` (a method). */
    if (/\bfunction\s+draw\s*\(/.test(appJs)) {
      failures.push('tools/' + slug + '/app.js: define su propio `function draw(`. ' +
        'Usar App.utils.drawRound (assets/js/utils.js).');
    }
    ctx.checks += 1;
    if (/\bfunction\s+spreadRepeats\s*\(/.test(appJs)) {
      failures.push('tools/' + slug + '/app.js: define su propio `function spreadRepeats(`. ' +
        'Usar App.utils.spreadRepeats (assets/js/utils.js).');
    }
  });
  /* --- 5c. Shared helpers: an activity does not define its own copy of a helper App.utils already has.
     The copies drifted apart before (the same function, two bodies); the alias keeps one source. */
  var SHARED_HELPERS = ['plainText', 'pickRandomInt', 'thousandsSeparator', 'randInt', 'numericOptions'];
  slugs.forEach(function (slug) {
    ctx.checks += 1;
    var code = slugCode(path.join(toolsDir, slug));
    SHARED_HELPERS.forEach(function (name) {
      if (new RegExp('\\bfunction\\s+' + name + '\\s*\\(').test(code)) {
        failures.push('tools/' + slug + '/: define su propia `function ' + name + '(`. ' +
          'Usar App.utils (assets/js/utils.js) con un alias: var ' + name + ' = App.utils.' +
          (name === 'randInt' ? 'rint' : name) + ';');
      }
    });
  });

};
