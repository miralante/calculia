'use strict';
/* Checks: public/private catalog split, the round shuffle contract and the shared helpers. Runs with the shared context of scripts/check.js. */
module.exports = function (ctx) {
  var fs = ctx.fs, path = ctx.path, vm = ctx.vm, ROOT = ctx.ROOT;
  var failures = ctx.failures, largeFileWarnings = ctx.largeFileWarnings;
  var rel = ctx.rel, listJs = ctx.listJs, landingFiles = ctx.landingFiles, landingFilesByExt = ctx.landingFilesByExt;
  var LANDING_FILES = ctx.LANDING_FILES, execFileSync = ctx.execFileSync, execFile = ctx.execFile;
  var slugs = ctx.shared.slugs, toolsDir = ctx.shared.toolsDir, slugCode = ctx.shared.slugCode, EXTRA_MODULES = ctx.shared.EXTRA_MODULES, CANONICAL_BASE = ctx.shared.CANONICAL_BASE, STRING_LOCALES = ctx.shared.STRING_LOCALES, swContent = ctx.shared.swContent;

  /* --- 5. Catálogo único ---
     La portada (index.html) enlaza todas las actividades de tools/ salvo las
     que ya cuelgan de un hub de grupo (numbers-group, common-group,
     time-group): esas se llegan desde su hub, y repetirlas en la portada
     está prohibido. Ya no hay partición pública/oculta, y dev/ no debe
     existir.
  */
  var GROUP_HUBS = ['numbers-group', 'common-group', 'time-group'];
  var groupChildren = new Set();
  GROUP_HUBS.forEach(function (hub) {
    var dataJs = fs.readFileSync(path.join(toolsDir, hub, 'data.js'), 'utf8');
    var reSlug = /slug:\s*'([^']+)'/g;
    var m;
    while ((m = reSlug.exec(dataJs)) !== null) groupChildren.add(m[1]);
  });
  groupChildren.forEach(function (slug) {
    if (slugs.indexOf(slug) === -1) failures.push('catálogo: hub de grupo lista slug inexistente "' + slug + '"');
  });
  ctx.checks += 1;
  var siteHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
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
  function assertExactCatalog(label, actual, expected) {
    expected.forEach(function (slug) {
      if (!actual.has(slug)) failures.push('catálogo: ' + label + ' no contiene el slug "' + slug + '"');
    });
    actual.forEach(function (slug) {
      if (!expected.has(slug)) failures.push('catálogo: ' + label + ' contiene slug inesperado "' + slug + '"');
    });
  }
  var expectedSlugs = new Set(slugs.filter(function (slug) { return !groupChildren.has(slug); }));
  assertExactCatalog('portada', publicSlugs, expectedSlugs);
  if (fs.existsSync(path.join(ROOT, 'dev'))) {
    failures.push('dev/ no debe existir: la portada muestra todo el catálogo');
  }

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
