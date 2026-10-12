#!/usr/bin/env node
/* ============================================================
   test-puerta-arranque.js — one-off
   Comprueba que el recorrido de patterns / odd-one-out / stories en
   ui-smoke.js SIRVE para lo que se hizo: que la pantalla de inicio deje
   entrar al test. Vuelve a poner las dos formas en que se rompió —sin
   botón, y con el contenedor #levels vacío—, exige que la puerta salte en
   las dos, y deja los ficheros como estaban.

   Sin esto, el smoke recorrería las tres rutas con «0 controles, 0
   recorridos» y lo diría OK: una ruta donde no hay nada que pulsar no
   tiene nada que fallar.
   ============================================================ */
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DIR = __dirname;
const ROOT = path.join(DIR, '..', '..');
const HTML = path.join(ROOT, 'tools', 'patterns', 'index.html');
const SMOKE = path.join(ROOT, 'scripts', 'ui-smoke.js');
const ORIGINAL = fs.readFileSync(HTML, 'utf8');
const EOL = ORIGINAL.includes('\r\n') ? '\r\n' : '\n';

const BOTON = '<button type="button" class="btn" id="btnStart" data-i18n="startButton">Empezar a practicar →</button>';

function restore() { fs.writeFileSync(HTML, ORIGINAL, 'utf8'); }

const FAULTS = [
  {
    name: 'A. la pantalla de inicio se queda sin ningún botón',
    from: BOTON,
    to: '',
    expect: /sin un solo botón: no hay forma de empezar/
  },
  {
    name: 'B. vuelve el <div id="levels"> vacío',
    /* El botón se queda: si no, salta antes la aserción de "no hay
       forma de empezar" y esta segunda nunca llega a probarse. */
    from: BOTON,
    to: BOTON + EOL + '      <div class="stack" id="levels"></div>',
    expect: /vuelve el <div id="levels"> vacío/
  }
];

function runGate() {
  try {
    execFileSync(process.execPath, [SMOKE, 'patterns'],
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
    assert.ok(ORIGINAL.includes(from), 'No se ha encontrado el punto de inyeccion: ' + f.from);
    fs.writeFileSync(HTML, ORIGINAL.replace(from, f.to.replace(/\n/g, EOL)), 'utf8');
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
  console.log('\nOK: la puerta ve las dos formas de dejar la actividad sin salida y sigue pasando sin ellas.');
} finally {
  restore();
}