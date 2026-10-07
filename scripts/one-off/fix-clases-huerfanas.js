/* One-off: give the remaining orphaned classes a rule in the activity
   that emits them.

   Each of these classes exists in sibling activities and was lost when
   the activity was forked. Same shape as the `.options-row` fix:

     .answer-name   charts, geometry   (exists in algebra, divisibility,
                                      percent, similar)
     .layer-row     divisibility       (exists in geometry, next to an
                                      identical .cube-layer block)
     .hint          shapes             (exists in money, mental-math,
                                      measures, fractions-measures, numbers)
     .intro-buttons ordinals, quantities, shapes
                                    (exists in roman-numerals and scale)

   `.digital-live` in clock is NOT in this list: it is a marker class,
   read back with `questionZoneEl.querySelector('.digital-live')` to
   find the running clock and stop it. It carries no styling on purpose. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/* slug -> { selector, lines } */
const FIXES = {
  divisibility: {
    '.layer-row': [
      '/* A cube is drawn as a row of layers; without this the layers stack',
      '   vertically and the cube reads as a flat wall. Same rule as geometry. */',
      '.layer-row { display: flex; gap: 2px; }',
    ],
  },
  charts: {
    '.answer-name': [
      '/* The answer name sits under its figure, not beside it. */',
      '.answer-name { display: block; }',
    ],
  },
  geometry: {
    '.answer-name': [
      '/* The answer name sits under its figure, not beside it. */',
      '.answer-name { display: block; }',
    ],
  },
  shapes: {
    '.hint': [
      '/* The soft line under the figure. Same rule as money/numbers/measures. */',
      '.hint { color: var(--color-texto-suave); font-size: var(--texto-base); }',
    ],
    '.intro-buttons': [
      '/* Centred instead of left-hugging the screen edge. A lone button',
      '   lands centred; back/next stay side by side. Same as scale. */',
      '.intro-buttons { justify-content: center; gap: var(--espacio); }',
    ],
  },
  ordinals: {
    '.intro-buttons': [
      '/* Centred instead of left-hugging the screen edge. A lone button',
      '   lands centred; back/next stay side by side. Same as scale. */',
      '.intro-buttons { justify-content: center; gap: var(--espacio); }',
    ],
  },
  quantities: {
    '.intro-buttons': [
      '/* Centred instead of left-hugging the screen edge. A lone button',
      '   lands centred; back/next stay side by side. Same as scale. */',
      '.intro-buttons { justify-content: center; gap: var(--espacio); }',
    ],
  },
};

/* Same two rules also exist in money, which styles them for the end
   screen. Eleven activities carry the markup and not the rule, so their
   🎉 renders at body size and the closing line runs the full width. */
const END_SCREEN = {
  '.emoji-large': '.emoji-large { font-size: 96px; }',
  '.transfer': '.transfer { margin: 8px auto 24px; font-size: 1.1rem; color: var(--color-texto-suave, #555); max-width: 480px; }',
};
const END_SCREEN_SLUGS = [
  'algebra', 'calendar', 'charts', 'divisibility', 'geometry', 'math-tables',
  'operations', 'percent', 'places', 'problems', 'similar',
];

function dominantEol(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const lf = (text.match(/(?<!\r)\n/g) || []).length;
  return crlf > lf ? '\r\n' : '\n';
}

for (const [slug, selectors] of Object.entries(FIXES)) {
  const file = path.join(ROOT, 'tools', slug, 'styles.css');
  const text = fs.readFileSync(file, 'utf8');
  const eol = dominantEol(text);
  const label = eol === '\r\n' ? 'CRLF' : 'LF';
  let out = text;
  const added = [];
  const skipped = [];
  for (const [selector, lines] of Object.entries(selectors)) {
    /* A compound like `.options.options-row` must be matched on its
       first class only, otherwise `sel` is never literally present. */
    if (out.includes(selector)) { skipped.push(selector); continue; }
    const block = ['', ...lines, ''].join(eol);
    out = out.endsWith(eol) ? out + block.slice(eol.length) : out + eol + block.slice(eol.length);
    added.push(selector);
  }
  if (added.length) fs.writeFileSync(file, out, 'utf8');
  console.log('  ' + slug.padEnd(13) + label +
    (added.length ? '  + ' + added.join(', ') : '') +
    (skipped.length ? '  = ya estaba: ' + skipped.join(', ') : ''));
}
console.log('\nListo.');

/* Second pass: the end-screen pair, in a fixed order so re-running is
   a no-op once the rules are in place. */
console.log('\nPantalla final:');
for (const slug of END_SCREEN_SLUGS) {
  const file = path.join(ROOT, 'tools', slug, 'styles.css');
  const text = fs.readFileSync(file, 'utf8');
  const eol = dominantEol(text);
  const label = eol === '\r\n' ? 'CRLF' : 'LF  ';
  let out = text;
  const added = [];
  const skipped = [];
  for (const [selector, rule] of Object.entries(END_SCREEN)) {
    if (out.includes(selector)) { skipped.push(selector); continue; }
    out = out.endsWith(eol) ? out + eol + rule : out + eol + rule;
    added.push(selector);
  }
  if (added.length) fs.writeFileSync(file, out, 'utf8');
  console.log('  ' + slug.padEnd(13) + label +
    (added.length ? '  + ' + added.join(', ') : '') +
    (skipped.length ? '  = ya estaba: ' + skipped.join(', ') : ''));
}