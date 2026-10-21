'use strict';
/* Asset-version token tool, calculia copy.
 *
 * Same rule as the suite tool (one copy per repo): the token is a hash of the
 * file's own bytes, and the immutable paths come from this project's _headers.
 * This copy lives in the calculia repo so CI can run it on its own.
 *
 * Shared tool for the Miralante suite.
 *
 * WHY
 * ---
 * Every project in the suite serves some assets as
 * `Cache-Control: public, max-age=31536000, immutable` (see each
 * project's `_headers`). A changed asset only reaches a returning visitor
 * if the URL referencing it changes, which is what the `?v=` token is for.
 *
 * The tokens used to be a hand-typed serial bumped by appending an "a",
 * applied per file instead of per deploy. Same asset, different token on
 * different pages (apptonomia's locale-picker.js was `apptonomia-v5aca`
 * while its locale-picker.css was `apptonomia-v5ab`), plus bare serials
 * ("1", "1ab", "74") and even a date scheme (ludia) mixed in. Nothing
 * failed when a reference was missed; pages silently served a year-old
 * asset.
 *
 * Deriving the token from the file's own bytes removes the whole class of
 * mistake: same file -> same token everywhere, edit -> new token
 * everywhere, and no serial left to forget.
 *
 * The set of tokenised paths is NOT assumed. Each project declares which
 * path patterns are immutable in its own `_headers`, and this tool reads
 * that file. That matters: memofun serves css/js with max-age=300 and only
 * fonts as immutable, and sinonimia exempts /js/app.js and /js/i18n.js
 * while making /js/data.* and /js/dict.* immutable. Hard-coding "all css
 * and js" would add pointless tokens there, and hard-coding a shared list
 * would silently miss a project's real rule.
 *
 * USAGE (from a project root)
 *   node scripts/asset-tokens.js calculia            write tokens
 *   node scripts/asset-tokens.js --check calculia    verify only, exit 1 on drift
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* Per-project configuration. `immutable` is derived from `_headers` at
   run time; this list only supplies the token prefix and the HTML entry
   points that actually ship. */
const CONFIG = {
  apptonomia: {
    prefix: 'apptonomia-v',
    stylesheets: ['css/styles.css'],
    entryPoints: ['index.html', '404.html', 'about/index.html', 'team/index.html',
      'legal/index.html', 'project/index.html', 'dev/index.html'],
  },
  calculia: {
    prefix: 'calculia-v',
    stylesheets: ['assets/css/base.css'],
    entryPoints: ['index.html', '404.html', 'about/index.html', 'team/index.html',
      'config/index.html', 'legal/index.html', 'dev/index.html'],
  },
  ludia: {
    prefix: 'ludia-v',
    stylesheets: ['assets/css/styles.css'],
    entryPoints: ['index.html', '404.html', 'offline.html', 'refresh.html'],
  },
  memofun: {
    prefix: 'memofun-v',
    stylesheets: ['assets/css/base.css'],
    entryPoints: ['index.html', '404.html', 'offline.html', 'about/index.html',
      'team/index.html', 'config/index.html', 'legal/index.html', 'dev/index.html'],
  },
  okeymoney: {
    prefix: 'okeymoney-v',
    stylesheets: ['assets/css/base.css'],
    entryPoints: ['index.html', '404.html', 'offline.html', 'about/index.html',
      'config/index.html', 'legal/index.html', 'site/index.html'],
  },
  routime: {
    prefix: 'routime-v',
    stylesheets: ['assets/css/base.css'],
    entryPoints: ['index.html', '404.html', 'about/index.html', 'team/index.html',
      'config/index.html', 'legal/index.html'],
  },
  sinonimia: {
    prefix: 'sinonimia-v',
    stylesheets: ['css/styles.css'],
    entryPoints: ['index.html', '404.html', 'offline.html', 'about/index.html',
      'team/index.html', 'config/index.html', 'legal/index.html', 'legal/privacidad.html'],
  },
  teclatlon: {
    prefix: 'teclatlon-v',
    stylesheets: ['assets/css/base.css'],
    entryPoints: ['index.html', '404.html', 'about/index.html', 'team/index.html',
      'config/index.html', 'legal/index.html'],
  },
};

/* In this repo the project root is the repo itself. */
const SUITE_ROOT = path.resolve(__dirname, '..');

/* ---- Read the project's own _headers: which paths are immutable? ----
   `_headers` is a list of blocks: a path pattern line, then header lines
   until the next path. A block whose Cache-Control contains `immutable`
   marks that path pattern as needing a version token. Comments (#) are
   prose and are skipped. */
function immutablePatterns(root) {
  const file = path.join(root, '_headers');
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

  const patterns = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    // A path line starts with "/" and contains no ":" (headers do).
    if (line.startsWith('/') && !line.includes(':')) {
      current = line;
      continue;
    }
    if (/^cache-control\s*:/i.test(line)) {
      if (current && /immutable/i.test(line)) patterns.push(current);
      current = null;
    } else if (/^[a-z0-9-]+\s*:/i.test(line)) {
      // Some other header in this block: keep `current` for the next rule.
      continue;
    }
  }
  return patterns;
}

/* Cloudflare `_headers` glob semantics.
 *
 * Verified against production rather than assumed: on okeymoney and
 * apptonomia a nested `/assets/js/x.js` and `/assets/css/x.css` both come
 * back `immutable` even though the pattern is written `/*.js` / `/*.css`,
 * i.e. a single `*` crosses "/" and matches recursively from the root.
 * Treating `*` as "one segment only" would skip every nested asset and
 * silently leave the whole project untokenised -- which is exactly the
 * bug this tool exists to remove.
 *
 * `*`  -> any run of characters, including "/"
 * `?`  -> a single non-"/" character
 * A pattern with no leading "/" is treated as relative to the root. */
function globToRegExp(glob) {
  let pattern = glob.startsWith('/') ? glob : '/' + glob;
  let re = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '[^/]';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$');
}

function isImmutable(relPath, patterns) {
  if (!patterns) return false;
  /* _headers patterns are site-root-absolute ("/*.js"); refs are
     repo-relative ("assets/css/x.css"). Compare on a leading slash. */
  const asUrl = relPath.startsWith('/') ? relPath : '/' + relPath;
  return patterns.some(p => globToRegExp(p).test(asUrl));
}

function tokenFor(root, relPath) {
  const abs = path.join(root, relPath);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
  return hash.slice(0, 8);
}

/* Resolve a reference as written in a page ("../assets/x.css?v=old") to a
   repo-relative path, ignoring any query/hash. */
function resolveRef(pageRel, ref) {
  const pageDir = path.dirname(path.join(root, pageRel));
  return path.relative(root, path.resolve(pageDir, ref.split('?')[0].split('#')[0])).replace(/\\/g, '/');
}

let root;

function processFile(pageRel, apply, cfg) {
  const abs = path.join(root, pageRel);
  const original = fs.readFileSync(abs, 'utf8');
  const patterns = immutablePatterns(root);
  const drift = [];

  const updated = original.replace(
    /(\b(?:href|src)=")([^"]+)(")/g,
    (whole, open, value, close) => {
      if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//') || value.startsWith('#')) return whole;
      const rel = resolveRef(pageRel, value);
      if (!isImmutable(rel, patterns)) return whole;
      if (!fs.existsSync(path.join(root, rel))) return whole;

      const wanted = cfg.prefix + tokenFor(root, rel);
      const current = /[?&]v=[^&"']+/.exec(value);
      if (current && current[0] === `?v=${wanted}`) return whole;

      drift.push({ page: pageRel, value, wanted, had: current ? current[0] : '(none)' });
      return open + value.replace(/[?&]v=[^&"']+/, '') + `?v=${wanted}` + close;
    }
  );

  if (apply && updated !== original) fs.writeFileSync(abs, updated, 'utf8');
  return drift;
}

/* Rewrites href/src in HTML, and url() in CSS.
 *
 * CSS matters because fonts are referenced from @font-face, never from
 * HTML: in ludia and memofun the ONLY immutable path is
 * /assets/fonts/*, so an HTML-only pass would report zero references and
 * silently leave the fonts unversioned. A font change there would then
 * stick for a year. */
function processCss(relCss, apply, cfg) {
  const abs = path.join(root, relCss);
  if (!fs.existsSync(abs)) return [];
  const patterns = immutablePatterns(root);
  const original = fs.readFileSync(abs, 'utf8');
  const drift = [];

  const updated = original.replace(
    /(url\(\s*["']?)([^"')]+)(["']?\s*\))/g,
    (whole, open, value, close) => {
      if (/^(?:data|https?):/i.test(value) || value.startsWith('//')) return whole;
      const rel = resolveRef(relCss, value);
      if (!isImmutable(rel, patterns)) return whole;
      if (!fs.existsSync(path.join(root, rel))) return whole;

      const wanted = cfg.prefix + tokenFor(root, rel);
      const current = /[?&]v=[^&"')]+/.exec(value);
      if (current && current[0] === `?v=${wanted}`) return whole;

      drift.push({ page: relCss + ' (url)', value, wanted, had: current ? current[0] : '(none)' });
      return open + value.replace(/[?&]v=[^&"')]+/, '') + `?v=${wanted}` + close;
    }
  );

  if (apply && updated !== original) fs.writeFileSync(abs, updated, 'utf8');
  return drift;
}

/* Every HTML page that actually ships. routime alone has 75 activity
   pages under tools/; a hand-listed set missed every one of them, which
   is how routime kept 200+ stale serial tokens. Discover them instead of
   maintaining a list: anything not in the exclusion sets below. */
function htmlEntryPoints(projectRoot) {
  const SKIP_DIRS = /(^|[\\/])(?:node_modules|\.git|\.wrangler|\.dev|graphify-out|test-results|doc|templates|scripts|playwright-report)([\\/]|$)/;
  const SKIP_FILES = /^(?:offline|refresh)\.html$/;
  const out = [];
  (function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (!SKIP_DIRS.test(path.relative(projectRoot, full))) walk(full); }
      else if (/\.html$/.test(e.name) && !SKIP_FILES.test(e.name)) {
        out.push(path.relative(projectRoot, full).replace(/\\/g, '/'));
      }
    }
  })(projectRoot);
  return out.sort();
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const only = args.find(a => CONFIG[a]);

  const names = only ? [only] : Object.keys(CONFIG);
  let total = 0, files = 0;

  for (const name of names) {
    const projectRoot = name === 'calculia' ? SUITE_ROOT : path.join(SUITE_ROOT, name);
    if (!fs.existsSync(projectRoot)) continue;
    root = projectRoot;
    const cfg = CONFIG[name];
    const patterns = immutablePatterns(projectRoot);
    if (!patterns) { console.log(`  ${name}: no _headers, skipped`); continue; }

    const all = [];
    /* Discovered, not listed: routime ships 75 tools/<slug>/index.html
       pages and a hand-maintained list silently skipped all of them. */
    const pages = htmlEntryPoints(projectRoot);
    for (const page of pages) {
      all.push(...processFile(page, !check, cfg));
    }
    /* Stylesheets the entry points pull in: their url() references
       (fonts, images) are immutable assets too. */
    for (const sheet of cfg.stylesheets || []) {
      all.push(...processCss(sheet, !check, cfg));
    }
    total += all.length; files++;

    const label = `${name.padEnd(11)} immutable=${patterns.join(' ')}`;
    if (check) {
      if (all.length) {
        console.log(`✗ ${label}`);
        for (const d of all) console.log(`    ${d.page}: ${d.had} -> expected ?v=${d.wanted}   (${d.value.split('?')[0]})`);
      } else {
        console.log(`✓ ${label}`);
      }
    } else {
      console.log(`${all.length ? 'updated' : 'clean '} ${label}${all.length ? ` (${all.length})` : ''}`);
      for (const d of all) console.log(`    ${d.page}: ${d.had} -> ?v=${d.wanted}`);
    }
  }

  if (check && total) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { CONFIG, immutablePatterns, globToRegExp, isImmutable, SUITE_ROOT };