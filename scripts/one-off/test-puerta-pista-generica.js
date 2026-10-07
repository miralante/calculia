#!/usr/bin/env node
/* ============================================================
   test-puerta-pista-generica.js — one-off
   Comprueba que el punto 17 de check.js SIRVE, y no solo que pasa: vuelve
   a poner la frase genérica en una actividad, exige que la puerta la
   salte, y deja el fichero como estaba. Una puerta que no se ha visto
   fallar nunca es indistinguible de una puerta rota.

   El fallo: showHint() vuelve a escribir la frase del diccionario sin
   mirar la pregunta.
   ============================================================ */
'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const DIR = __dirname;
const ROOT = path.join(DIR, '..', '..');
/* Una de las veinte que tenía la frase genérica, y de las que ya no la
   tiene: money es de las que hizo el primer grupo. */
const APP = path.join(ROOT, 'tools', 'money', 'app.js');
const CHECK = path.join(ROOT, 'scripts', 'check.js');
const ORIGINAL = fs.readFileSync(APP, 'utf8');
const EOL = ORIGINAL.includes('\r\n') ? '\r\n' : '\n';

const GENERIC = 'explanationEl.textContent = App.i18n.t(\'hint\');';
const OWN = "explanationEl.textContent = (question && question.hint) || App.i18n.t('hint');";

function restore() { fs.writeFileSync(APP, ORIGINAL, 'utf8'); }

function runCheck() {
  try {
    execFileSync(process.execPath, [CHECK], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe', timeout: 300000 });
    return { ok: true, out: '' };
  } catch (e) {
    return { ok: false, out: String((e.stdout || '') + (e.stderr || '')) };
  }
}

try {
  const before = runCheck();
  console.log('sin fallo inyectado -> ' + (before.ok ? 'PASA (bien)' : 'FALLA (algo ya esta roto)'));
  assert.ok(before.ok, 'La puerta ya falla antes de inyectar nada:\n' + before.out);

  assert.ok(ORIGINAL.includes(OWN), 'No se ha encontrado el punto de inyeccion en money/app.js');
  fs.writeFileSync(APP, ORIGINAL.replace(OWN, GENERIC), 'utf8');
  const during = runCheck();
  const caught = !during.ok && /tools\/money\/app\.js/.test(during.out);
  console.log((caught ? 'DETECTADO    ' : 'NO DETECTADO  ') +
    'la pista genérica vuelve a una actividad');
  if (!caught) {
    console.log('--- salida de check.js ---');
    console.log(during.out.slice(-1200));
    throw new Error('La puerta no salto con la frase genérica de vuelta');
  }
  console.log('              salto en: ' +
    (during.out.match(/tools\/money\/app\.js.*/) || [])[0].trim());
  restore();

  const after = runCheck();
  console.log('restaurado -> ' + (after.ok ? 'PASA (bien)' : 'FALLA (la restauracion dejo algo roto)'));
  assert.ok(after.ok, 'La puerta falla tras restaurar:\n' + after.out);
  console.log('\nOK: la puerta ve la frase genérica y sigue pasando sin ella.');
} finally {
  restore();
}