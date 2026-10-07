#!/usr/bin/env node
/* ============================================================
   test-puerta-panal.js — one-off
   Comprueba que las puertas nuevas de ui-smoke.js sobre el panal SIRVEN,
   y no solo que pasan. Vuelve a meter los fallos uno por uno, exige que
   la puerta los salte, y deja el fichero como estaba. Una puerta que no
   se ha visto fallar nunca es indistinguible de una puerta rota.

   Los cuatro fallos, todos en el dibujo del hexágono:
     A. la celda suelta se coloca donde iría una octava celda del panal
     B. la celda suelta se acerca hasta rozar el panal
     C. la celda pierde un lado y deja de ser un hexágono
     D. la celda suelta desaparece
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

/* Las posiciones no son al azar: A cae dentro del panal y lo convierte en
   ocho celdas; B se queda fuera del panal pero a 14 px, o sea por debajo
   de los 24 que pide la holgura y por encima de los 10 que deciden qué
   celdas son del panal — la única forma de que esa aserción falle sola y
   no detrás del recuento. */
const FAULTS = [
  {
    name: 'A. la celda suelta cae donde va una octava celda del panal',
    from: 'cellPoints(118, 116)',
    to: 'cellPoints(92, 58)',
    expect: /seguir siendo de siete celdas|estar sola y separada/
  },
  {
    name: 'B. la celda suelta se acerca hasta rozar el panal',
    from: 'cellPoints(118, 116)',
    to: 'cellPoints(102, 100)',
    expect: /se ha pegado al panal/
  },
  {
    name: 'C. la celda pierde un lado y deja de ser un hexágono',
    from: 'var CELL_OFFSETS = [[16, 0], [8, 14], [-8, 14], [-16, 0], [-8, -14], [8, -14]];',
    to: 'var CELL_OFFSETS = [[16, 0], [8, 14], [-8, 14], [-16, 0], [-8, -14]];',
    expect: /ha dejado de tener seis/
  },
  {
    name: 'D. la celda suelta desaparece',
    from: 'cellsSvg + looseSvg +',
    to: 'cellsSvg +',
    /* Sin la celda suelta el dibujo tiene 7 polígonos y salta antes el
       recuento genérico de la ilustración, no el bloque del panal. */
    expect: /no muestra con claridad la forma esperada|enseñar siete celdas y la suelta/
  }
];

/* La puerta real: el smoke acotado a la ruta de Formas. */
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
    const line = (r.out.match(f.expect) || [])[0];
    console.log('              salto en: ' + line);
    restore();
  }

  const after = runGate();
  console.log('restaurado -> ' + (after.ok ? 'PASA (bien)' : 'FALLA (la restauracion dejo algo roto)'));
  assert.ok(after.ok, 'La puerta falla tras restaurar:\n' + after.out);
  console.log('\nOK: la puerta detecta los cuatro fallos y sigue pasando sin ellos.');
} finally {
  restore();
}