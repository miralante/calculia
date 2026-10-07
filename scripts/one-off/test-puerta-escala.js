#!/usr/bin/env node
/* ============================================================
   test-puerta-escala.js — one-off
   Comprueba que la puerta de probe-escala-partida.js SIRVE, y no
   solo que pasa. Vuelve a meter los dos fallos uno por uno, exige que
   la puerta los salte, y deja el fichero como estaba. Una puerta que
   no se ha visto fallar nunca es indistinguishable de una puerta
   rota.

   Los dos fallos:
     A. el numero de la marca alcanzada deja de escribirse
     B. la diapositiva vuelve a anidar un <svg> dentro de otro
   ============================================================ */
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DIR = __dirname;
const APP = path.join(DIR, '..', '..', 'tools', 'scale', 'app.js');
const PROBE = path.join(DIR, 'probe-escala-partida.js');
const ORIGINAL = fs.readFileSync(APP, 'utf8');

/* Devuelve app.js a su estado bueno pase lo que pase. */
function restore() { fs.writeFileSync(APP, ORIGINAL, 'utf8'); }

const FAULTS = [
  {
    name: 'A. la marca alcanzada se queda sin su numero',
    /* El fallo original, literal: `continue` antes de la rayita, y con
       ella el numero. */
    from: "      if (here === undefined || v !== here) {\n        ticks +=",
    to: "      if (here !== undefined && v === here) continue;\n      if (true) {\n        ticks +=",
    expect: /La regla no lleva un numero en cada posicion etiquetada/
  },
  {
    name: 'B. la diapositiva vuelve a anidar un <svg>',
    from: "      return spanSvg({ from: 0, to: 5, gaps: 5 }, 'cm');",
    to: "      return svgWrap(RULE_BOX, rulerUnit('cm') +\n        spanSvg({ from: 0, to: 5, gaps: 5 }, 'cm'));",
    expect: /UN <svg>|anida un <svg>/
  }
];

function runProbe() {
  try {
    execFileSync(process.execPath, [PROBE], { cwd: path.join(DIR, '..', '..'), encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String((e.stdout || '') + (e.stderr || '')) };
  }
}

try {
  const before = runProbe();
  console.log('sin fallo inyectado -> ' + (before.ok ? 'PASA (bien)' : 'FALLA (algo ya esta roto)'));
  assert.ok(before.ok, 'La puerta ya falla antes de inyectar nada:\n' + before.out);

  for (const f of FAULTS) {
    assert.ok(ORIGINAL.includes(f.from), 'No se ha encontrado el punto de inyeccion: ' + f.from);
    fs.writeFileSync(APP, ORIGINAL.replace(f.from, f.to), 'utf8');
    const r = runProbe();
    const caught = !r.ok && f.expect.test(r.out);
    console.log((caught ? 'DETECTADO  ' : 'NO DETECTADO  ') + f.name);
    if (!caught) {
      console.log('--- salida de la puerta ---');
      console.log(r.out.slice(-1200));
      throw new Error('La puerta no salto con: ' + f.name);
    }
    const line = (r.out.match(new RegExp(f.expect.source, 'm')) || [])[0];
    console.log('            salto en: ' + line);
    restore();
  }

  const after = runProbe();
  console.log('restaurado -> ' + (after.ok ? 'PASA (bien)' : 'FALLA (la restauracion dejo algo roto)'));
  assert.ok(after.ok, 'La puerta falla tras restaurar:\n' + after.out);
  console.log('\nOK: la puerta detecta los dos fallos y sigue pasando sin ellos.');
} finally {
  restore();
}