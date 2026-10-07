#!/usr/bin/env node
/* ============================================================
   test-puerta-pistas.js — one-off
   Comprueba que las dos puertas nuevas de ui-smoke.js sobre el test de
   Formas SIRVEN, y no solo que pasan: la del salto directo al test y la
   de la pista socrática. Vuelve a meter los fallos uno por uno, exige que
   la puerta los salte, y deja el fichero como estaba.

   Los tres fallos, todos en tools/shapes/app.js:
     A. la pista vuelve a ser la misma frase para todas las preguntas
     B. todas las preguntas muestran la pista de un único tipo
     C. el botón "Hacer el test" vuelve a abrir el menú de un solo test
   ============================================================ */
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DIR = __dirname;
const ROOT = path.join(DIR, '..', '..');
const APP = path.join(ROOT, 'tools', 'shapes', 'app.js');
const SMOKE = path.join(ROOT, 'scripts', 'ui-smoke.js');
const ORIGINAL = fs.readFileSync(APP, 'utf8');
/* El fichero usa CRLF y las needles de abajo están escritas con \n: sin
   esto none se encuentra y el "fallo" inyectado no es el que se cree. */
const EOL = ORIGINAL.includes('\r\n') ? '\r\n' : '\n';

/* Devuelve app.js a su estado bueno pase lo que pase. */
function restore() { fs.writeFileSync(APP, ORIGINAL, 'utf8'); }

const PISTA = "explanationEl.textContent = (question && question.hint) || App.i18n.t('hint');";
const FAULTS = [
  {
    name: 'A. la pista vuelve a ser la misma frase para todas',
    from: PISTA,
    to: "explanationEl.textContent = App.i18n.t('hint');",
    expect: /vuelve a ser la misma frase/
  },
  {
    name: 'B. todas las preguntas muestran la pista de un solo tipo',
    from: PISTA,
    to: "explanationEl.textContent = App.i18n.t('gen.socraticFaces');",
    expect: /no es la de esta pregunta/
  },
  {
    name: 'C. "Hacer el test" vuelve a abrir el menú de un solo test',
    from: '    if (ids.length === 1) { openActivity(ids[0]); return; }',
    to: '    if (ids.length === 2) { openActivity(ids[0]); return; }',
    expect: /no entran en el test cuando solo hay uno/
  }
];

function runGate() {
  try {
    execFileSync(process.execPath, [SMOKE, 'shapes'],
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', timeout: 300000 });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String((e.stdout || '') + (e.stderr || '')) };
  }
}

try {
  const before = runGate();
  console.log('sin fallo inyectado -> ' + (before.ok ? 'PASA (bien)' : 'FALLA (algo ya esta roto)'));
  assert.ok(before.ok, 'La puerta ya falla antes de inyectar nada:\n' + before.out);

  for (const f of FAULTS) {
    const from = f.from.replace(/\n/g, EOL);
    const to = f.to.replace(/\n/g, EOL);
    assert.ok(ORIGINAL.includes(from), 'No se ha encontrado el punto de inyeccion: ' + f.from);
    fs.writeFileSync(APP, ORIGINAL.replace(from, to), 'utf8');
    const r = runGate();
    const caught = !r.ok && f.expect.test(r.out);
    console.log((caught ? 'DETECTADO    ' : 'NO DETECTADO  ') + f.name);
    if (!caught) {
      console.log('--- salida de la puerta ---');
      console.log(r.out.slice(-1200));
      throw new Error('La puerta no salto con: ' + f.name);
    }
    console.log('              salto en: ' + (r.out.match(f.expect) || [])[0]);
    restore();
  }

  const after = runGate();
  console.log('restaurado -> ' + (after.ok ? 'PASA (bien)' : 'FALLA (la restauracion dejo algo roto)'));
  assert.ok(after.ok, 'La puerta falla tras restaurar:\n' + after.out);
  console.log('\nOK: las puertas detectan los tres fallos y siguen pasando sin ellos.');
} finally {
  restore();
}