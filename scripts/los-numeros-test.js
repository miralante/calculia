'use strict';

/* Final static test for tools/los-numeros ("Tipos de Números").
   No browser: it reads the activity's own files (data, strings, app, page,
   service worker, hub) and checks the content of the lesson and its wiring.
   The page itself is checked in a real browser by los-numeros-ui-test.js.
   Run with: npm run test:los-numeros */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const TOOL = path.join(ROOT, 'tools', 'los-numeros');

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
}

/* data.js and the strings files run in a sandbox with a stub of App.i18n,
   so they are evaluated exactly as the browser evaluates them. */
function loadContent() {
  const bundles = { es: {}, en: {} };
  const sandbox = {
    App: {
      i18n: {
        register(dict, locale) {
          if (typeof locale === 'string') Object.assign(bundles[locale], dict);
        },
      },
    },
  };
  vm.createContext(sandbox);
  for (const file of ['data.js', 'strings.es.js', 'strings.en.js']) {
    vm.runInContext(read(path.join(TOOL, file)), sandbox, { filename: file });
  }
  return { DATA: sandbox.DATA, es: bundles.es, en: bundles.en };
}

const { DATA, es, en } = loadContent();
const appSource = read(path.join(TOOL, 'app.js'));

/* The lesson, in order: type, then its real-life card; comparisons last. */
const LESSON = [
  { id: 'Naturales',   kind: 'expo',    visual: 'typeNatural' },
  { id: 'Naturales',   kind: 'real',    examples: 3 },
  { id: 'Enteros',     kind: 'expo',    visual: 'typeEntero' },
  { id: 'Enteros',     kind: 'real',    examples: 3 },
  { id: 'Fracciones',  kind: 'expo',    visual: 'typeFraccion' },
  { id: 'Fracciones',  kind: 'real',    examples: 2 },
  { id: 'Decimales',   kind: 'expo',    visual: 'typeDecimal' },
  { id: 'Decimales',   kind: 'real',    examples: 3 },
  { id: 'VsEnteros',   kind: 'compare', visual: 'compNE' },
  { id: 'VsDecimales', kind: 'compare', visual: 'compND' },
];
const TYPE_IDS = ['Naturales', 'Enteros', 'Fracciones', 'Decimales'];
const SEP = ' · ';

const keysOf = bundle => Object.keys(bundle).sort();
const splitExamples = text => String(text || '').split(/\s*·\s*/).filter(Boolean);

const TESTS = [
  ['ten slides, in the order of the lesson', () => {
    assert.equal(DATA.slides.length, LESSON.length, 'slide count');
    DATA.slides.forEach((slide, i) => {
      const want = LESSON[i];
      assert.equal(slide.id, want.id, `slide ${i + 1} id`);
      assert.equal(slide.kind, want.kind, `slide ${i + 1} kind`);
      if (want.visual) assert.equal(slide.visual, want.visual, `slide ${i + 1} visual`);
    });
  }],

  ['the lesson names four types, as the end message does', () => {
    const types = [...new Set(DATA.slides.map(s => s.id))].filter(id => TYPE_IDS.includes(id));
    assert.equal(types.length, 4, 'distinct types');
    assert.match(es.endSummary, /cuatro tipos/, 'Spanish end message says four types');
    assert.match(en.endSummary, /four kinds/, 'English end message says four kinds');
  }],

  ['every slide has its title in both languages', () => {
    for (const slide of DATA.slides) {
      const key = 'slide' + slide.id + 'Title';
      assert.ok(es[key], `es is missing ${key}`);
      assert.ok(en[key], `en is missing ${key}`);
    }
  }],

  ['every type has its traits in both languages', () => {
    for (const slide of DATA.slides.filter(s => s.kind === 'expo' && s.visual.startsWith('type'))) {
      const key = 'slide' + slide.id + 'Traits';
      for (const [name, bundle] of [['es', es], ['en', en]]) {
        assert.ok(bundle[key], `${name} is missing ${key}`);
        const traits = bundle[key].split(/\s*·\s*/).filter(Boolean);
        assert.ok(traits.length >= 1, `${name} ${key} should give at least one trait`);
      }
    }
  }],

  ['each real-life card has one example per picture, in both languages', () => {
    for (const slide of DATA.slides.filter(s => s.kind === 'real')) {
      const key = 'slide' + slide.id + 'Real';
      const expected = LESSON.find(l => l.id === slide.id && l.kind === 'real').examples;
      assert.equal(slide.pics.length, expected, `${slide.id} pictures`);
      assert.equal(splitExamples(es[key]).length, expected, `es ${key} examples`);
      assert.equal(splitExamples(en[key]).length, expected, `en ${key} examples`);
      assert.equal(String(es[key]).split(SEP).length, expected, `es ${key} separator is ${JSON.stringify(SEP)}`);
    }
  }],

  ['every picture is a drawn SVG and every drawing is used', () => {
    const used = new Set(DATA.slides.flatMap(s => s.pics || []));
    for (const key of Object.keys(DATA.pictures)) {
      const svg = DATA.pictures[key];
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${key} is not an SVG`);
      assert.ok(used.has(key), `picture "${key}" is not on any slide`);
    }
    for (const key of used) {
      assert.ok(DATA.pictures[key], `slide asks for missing picture "${key}"`);
    }
  }],

  ['every visual on a slide is drawn by app.js', () => {
    const drawn = new Set([...appSource.matchAll(/kind === '([A-Za-z]+)'/g)].map(m => m[1]));
    for (const slide of DATA.slides.filter(s => s.visual)) {
      assert.ok(drawn.has(slide.visual), `app.js has no renderer for "${slide.visual}"`);
    }
  }],

  ['both languages have the same keys', () => {
    assert.deepEqual(keysOf(en), keysOf(es));
  }],

  ['numbers follow each language: comma in Spanish, point in English', () => {
    assert.match(es.slideDecimalesReal, /\d,\d/, 'es decimal example uses a comma');
    assert.match(en.slideDecimalesReal, /\d\.\d/, 'en decimal example uses a point');
    assert.match(es.slideDecimalesTraits, /coma/, 'es decimal trait mentions la coma');
    assert.match(en.slideDecimalesTraits, /point/, 'en decimal trait mentions the point');
    assert.match(es.slideEnterosReal, /−/, 'es negative examples use the minus sign');
    assert.match(en.slideEnterosReal, /−/, 'en negative examples use the minus sign');
  }],

  ['the activity is wired: page, service worker and hub', () => {
    const page = read(path.join(TOOL, 'index.html'));
    for (const ref of ['data.js', 'strings.es.js', 'strings.en.js', 'app.js', 'styles.css']) {
      assert.ok(page.includes(ref), `index.html does not load ${ref}`);
    }
    const sw = read(path.join(ROOT, 'sw.js'));
    for (const file of ['', 'app.js', 'data.js', 'strings.es.js', 'strings.en.js', 'styles.css']) {
      assert.ok(sw.includes(`'./tools/los-numeros/${file}'`), `sw.js is missing ./tools/los-numeros/${file}`);
    }
    const hub = read(path.join(ROOT, 'tools', 'numbers-group', 'data.js'));
    assert.ok(hub.includes("slug: 'los-numeros'"), 'the numbers hub does not list los-numeros');
  }],

  ['every local file the page references exists', () => {
    const page = read(path.join(TOOL, 'index.html'));
    const refs = [...page.matchAll(/(?:src|href)="([^"?#]+)/g)].map(m => m[1])
      .filter(ref => !/^(https?:|data:|#)/.test(ref));
    assert.ok(refs.length > 0, 'the page references no local files');
    for (const ref of refs) {
      assert.ok(fs.existsSync(path.resolve(TOOL, ref)), `missing file: ${ref}`);
    }
  }],
];

function main() {
  let failed = 0;
  for (const [name, run] of TESTS) {
    try {
      run();
      console.log(`ok   ${name}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`);
    }
  }
  console.log(`\n${TESTS.length - failed} of ${TESTS.length} passed`);
  if (failed > 0) process.exitCode = 1;
}

main();
