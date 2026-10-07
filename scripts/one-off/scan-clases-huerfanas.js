/* Sweeper: classes emitted by an activity that its OWN loaded CSS never
   defines.
   ------------------------------------------------------------------
   scripts/check.js already cross-checks tools/<slug>/app.js against
   every .css file in the repo. That pooling is deliberate (shared
   tokens.css / base.css / components.css legitimately satisfy a
   class) but it hides a real failure: a class that only happens to
   exist in ANOTHER activity's styles.css passes the gate while the
   page renders unstyled, because that sheet is never loaded here.

   This script tightens the scope to the CSS the page actually loads,
   resolved from the <link> tags in tools/<slug>/index.html instead of
   assuming a fixed list.

   Usage: node scripts/one-off/scan-clases-huerfanas.js [--verbose]
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TOOLS = path.join(ROOT, 'tools');
const VERBOSE = process.argv.includes('--verbose');

/* Only tokens matching the CSS-class shape are considered; anything
   else (emoji, punctuation, numbers, template noise) is ignored. */
const CLASS_SHAPE = /^[A-Za-z][\w-]*$/;

/* Strip block and line comments first.
   Every regex here scans raw text, and these files carry long
   explanatory comments that mention class names on purpose — the
   comments describing a fix would otherwise be reported as if the
   code emitted them. */
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

/* Every class name appearing in any selector across the given files.
   Every dot-segment is a class, so `.foo.bar` registers both. A name
   stops before `:`, `[` or any other selector syntax, so
   `.foo:hover` and `.foo[disabled]` do not leak a suffix. */
function indexCssClasses(files) {
  const classes = new Set();
  const prefixes = new Set();
  const re = /\.([A-Za-z][\w-]*)(?=[^\w-]|$)/g;
  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const css = fs.readFileSync(f, 'utf8');
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(css)) !== null) {
      classes.add(m[1]);
      if (m[1].includes('-')) prefixes.add(m[1]);
    }
  }
  return { classes, prefixes };
}

/* Classes the page actually loads: every <link rel=stylesheet> plus any
   <style> block. Resolved relative to the HTML file, with the `?v=`
   token stripped. */
function loadedCssFor(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dir = path.dirname(htmlPath);
  const files = new Set();
  const reLink = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let m;
  while ((m = reLink.exec(html)) !== null) {
    const href = /href=["']([^"']+)["']/i.exec(m[0]);
    if (!href) continue;
    files.add(path.resolve(dir, href[1].split('?')[0].split('#')[0]));
  }
  const reStyle = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = reStyle.exec(html)) !== null) files.add('inline:' + m.index);
  return [...files];
}

/* Inline <style> blocks are not files, so index them separately.
   Only the block contents are scanned — running the selector regex
   over the whole document would register `css` (out of `styles.css`)
   and every class named in a class="…" attribute as if the page had
   defined it, which is exactly the blind spot this script exists to
   close. */
function indexInlineCss(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const classes = new Set();
  const prefixes = new Set();
  const reStyle = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const reSel = /\.([A-Za-z][\w-]*)(?=[^\w-]|$)/g;
  let block;
  while ((block = reStyle.exec(html)) !== null) {
    let m;
    reSel.lastIndex = 0;
    while ((m = reSel.exec(block[1])) !== null) {
      classes.add(m[1]);
      if (m[1].includes('-')) prefixes.add(m[1]);
    }
  }
  return { classes, prefixes };
}

/* What the activity emits:
     - literal tokens inside class="…" / className='…'
     - appended literals, `className += ' answered'`
     - the static head of a template literal, `class="foo-${i}"`
     - classList.add('foo') / classList.toggle('foo', …) literals
     - 'foo-' literals used in a + concatenation (dynamic suffix)   */
function extractEmitted(js) {
  const literals = new Set();
  const prefixes = new Set();

  const add = (t) => { if (CLASS_SHAPE.test(t)) literals.add(t); };

  /* class="…" / className='…' — full tokens. */
  const reClass = /\b(?:class|className)\s*=\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = reClass.exec(js)) !== null) m[1].split(/\s+/).forEach(add);

  /* className += ' foo' / classes += ' foo' — the appended literal
     is a complete token list, so split it the same way. */
  const reAppend = /\b(?:class|className|[A-Za-z_$][\w$]*class(?:es|List)?)\s*\+=\s*['"]([^'"]+)['"]/g;
  while ((m = reAppend.exec(js)) !== null) m[1].split(/\s+/).forEach(add);

  /* `class="foo-${i}"` — only the static head counts; the interpolated
     part is a prefix, already covered by the 'foo-' rule below. */
  const reTemplate = /\b(?:class|className)\s*=\s*`([^`]*)`/g;
  while ((m = reTemplate.exec(js)) !== null) {
    const head = m[1].split('${')[0];
    head.split(/\s+/).forEach(add);
  }

  /* classList.add('foo') and friends. */
  const reList = /\bclassList\.(?:add|remove|toggle|replace)\s*\(\s*['"]([A-Za-z][\w-]*)['"]/g;
  while ((m = reList.exec(js)) !== null) literals.add(m[1]);

  /* 'foo-' + i — a dynamic suffix. The trailing dash keeps this from
     swallowing complete literals. */
  const rePrefix = /'([A-Za-z][\w-]*-)'\s*\+/g;
  while ((m = rePrefix.exec(js)) !== null) prefixes.add(m[1]);

  return { literals, prefixes };
}

/* Classes emitted with no selector that are nevertheless correct: a
   marker read back with querySelector rather than styled. Adding a rule
   for these would be wrong, so they are listed with the reason instead
   of being silently dropped. */
const MARKERS = {
  'digital-live': "clock/app.js lo lee con querySelector('.digital-live') para parar el reloj en marcha",
};

function main() {
  const slugs = fs.readdirSync(TOOLS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = [];
  let totalOrphans = 0;

  for (const slug of slugs) {
    const dir = path.join(TOOLS, slug);
    const htmlPath = path.join(dir, 'index.html');
    const appPath = path.join(dir, 'app.js');
    if (!fs.existsSync(htmlPath)) continue;

    const cssFiles = loadedCssFor(htmlPath).filter((f) => !f.startsWith('inline:'));
    const css = indexCssClasses(cssFiles);
    const inline = indexInlineCss(htmlPath);
    const has = (name) => css.classes.has(name) || inline.classes.has(name);
    const hasPrefix = (p) => {
      for (const name of css.prefixes) if (name.startsWith(p)) return true;
      for (const name of inline.prefixes) if (name.startsWith(p)) return true;
      return false;
    };

    const appJs = stripComments(fs.readFileSync(appPath, 'utf8'));
    const fromJs = extractEmitted(appJs);
    /* The static HTML of the page emits classes too. Kept separate:
       a leftover decorative class in index.html is cosmetically inert,
       whereas a class built at runtime with no selector is the
       btn-practice bug — the markup renders unstyled. */
    const fromHtml = extractEmitted(stripComments(fs.readFileSync(htmlPath, 'utf8')));

    const orphansFor = (emitted) => {
      const orphans = [];
      for (const cls of emitted.literals) {
        if (cls.endsWith('-')) {
          if (!hasPrefix(cls)) orphans.push(cls + ' (prefijo)');
        } else if (!has(cls)) {
          orphans.push(cls);
        }
      }
      for (const p of emitted.prefixes) if (!hasPrefix(p)) orphans.push(p + ' (prefijo)');
      return [...new Set(orphans)].sort();
    };

    const jsOrphans = orphansFor(fromJs).filter((o) => !MARKERS[o]);
    const markers = orphansFor(fromJs).filter((o) => MARKERS[o]);
    const htmlOrphans = orphansFor(fromHtml).filter((o) => !jsOrphans.includes(o) && !MARKERS[o]);

    if (jsOrphans.length || htmlOrphans.length || markers.length) {
      totalOrphans += jsOrphans.length;
      rows.push({ slug, js: jsOrphans, html: htmlOrphans, markers, sheets: cssFiles.length });
    }
  }

  if (!rows.length) {
    console.log('OK — toda clase emitida por tools/* tiene selector en el CSS que esa pagina carga.');
    return;
  }

  const dyn = rows.filter((r) => r.js.length);
  const stat = rows.filter((r) => r.html.length);

  console.log('=== A. Emitidas por app.js en tiempo de ejecucion (sin estilo) ===');
  if (!dyn.length) console.log('  (ninguna)');
  for (const r of dyn) {
    console.log('\n  tools/' + r.slug + '/app.js');
    for (const o of r.js) console.log('    · ' + o);
  }

  const marked = rows.filter((r) => r.markers.length);
  if (marked.length) {
    console.log('\n\n=== Marcadores sin estilo a proposito (correcto) ===');
    for (const r of marked) {
      for (const o of r.markers) console.log('  · tools/' + r.slug + '/app.js  ' + o + ' — ' + MARKERS[o]);
    }
  }

  console.log('\n\n=== B. Estaticas en index.html sin selector (inertes) ===');
  if (!stat.length) console.log('  (ninguna)');
  for (const r of stat) {
    console.log('\n  tools/' + r.slug + '/index.html');
    for (const o of r.html) console.log('    · ' + o);
  }

  console.log('\n\n' + dyn.length + ' actividad(es) con clases dinamicas sin estilo; '
    + totalOrphans + ' clase(s) dinamica(s).');
  if (VERBOSE) process.exitCode = 1;
}

main();