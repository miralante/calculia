#!/usr/bin/env node
/* ============================================================
   test-puerta-frase-generica.js — one-off
   Inyecta el defecto que caza la puerta de frase y exige que salte.

   La puerta de clave (comparar con App.i18n.t('hint'|'pista')) no puede
   ver una pista genérica escondida bajo OTRO nombre: clock tenía
   readHint = "Prueba otra vez. Mira el reloj con calma", que no era el
   `hint` de nadie. Aquí se vuelve a meter esa frase bajo setHint —que sí
   es una pista de tipo, no la reserva— y se comprueba que la sonda la
   delata.

   Uso: node scripts/one-off/test-puerta-frase-generica.js
   ============================================================ */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert');

const ROOT = path.resolve(__dirname, '..', '..');
const ES = path.join(ROOT, 'tools', 'clock', 'strings.es.js');
const EN = path.join(ROOT, 'tools', 'clock', 'strings.en.js');
const BUENO = '🤔 Empieza por la aguja corta: marca la hora. La larga, los minutos.';
const MALO_ES = '🤔 Prueba otra vez. Mira el reloj con calma.';
const MALO_EN = '🤔 Try again. Look calmly at the clock.';

/* UTF-8 explícito: un round-trip por el otro idioma deja el fichero con
   doble codificación y la puerta no lo ve. */
const backup = { es: fs.readFileSync(ES, 'utf8'), en: fs.readFileSync(EN, 'utf8') };

function poner(malo, bueno) {
  const base = fs.readFileSync(ES, 'utf8');
  if (!base.includes(bueno)) throw new Error('no se encuentra el texto bueno en strings.es.js');
  fs.writeFileSync(ES, base.replace(bueno, malo), 'utf8');
  const baseEn = fs.readFileSync(EN, 'utf8');
  const buenoEn = '🤔 Start with the short hand: that one is the hour. The long hand is the minutes.';
  if (!baseEn.includes(buenoEn)) throw new Error('no se encuentra el texto bueno en strings.en.js');
  fs.writeFileSync(EN, baseEn.replace(buenoEn, MALO_EN), 'utf8');
}

function sonda() {
  try {
    const salida = execFileSync(process.execPath,
      [path.join(ROOT, 'scripts', 'one-off', 'check-pistas.js'), 'clock'],
      { cwd: ROOT, encoding: 'utf8', timeout: 180000, env: { ...process.env, CHECK_PISTAS_DEBUG: '' } });
    return { codigo: 0, salida };
  } catch (error) {
    return { codigo: error.status === undefined ? -1 : error.status, salida: (error.stdout || '') + (error.stderr || '') };
  }
}

function restaurar() {
  fs.writeFileSync(ES, backup.es, 'utf8');
  fs.writeFileSync(EN, backup.en, 'utf8');
}

let fallo = 0;
try {
  // ---- A: con el texto bueno, la puerta calla -----------------------------
  poner(MALO_ES, BUENO);
  const antes = sonda();
  console.log('A) readHint devuelto a la frase genérica -> exit ' + antes.codigo);
  const detectada = /pista genérica bajo OTRA clave/.test(antes.salida);
  console.log('   la sonda lo dice: ' + (detectada ? 'sí' : 'NO'));
  if (!detectada) { console.log('   ✗ la puerta no ve una pista genérica bajo otra clave'); fallo = 1; }
  else console.log('   ✓');

  // ---- B: restaurado, la puerta vuelve a callar --------------------------
  restaurar();
  const despues = sonda();
  console.log('B) texto restaurado -> exit ' + despues.codigo + ', ' +
    (/pista genérica bajo OTRA clave/.test(despues.salida) ? 'sigue señalando' : 'silencio'));
  if (/pista genérica bajo OTRA clave/.test(despues.salida)) {
    console.log('   ✗ la puerta seguiría marcando algo que ya está arreglado'); fallo = 1;
  } else console.log('   ✓');
} finally {
  restaurar();
}

assert.strictEqual(fs.readFileSync(ES, 'utf8'), backup.es, 'strings.es.js no quedó restaurado');
assert.strictEqual(fs.readFileSync(EN, 'utf8'), backup.en, 'strings.en.js no quedó restaurado');
console.log('\n' + (fallo ? 'FALLO' : 'OK: la puerta de frase ve el defecto y se calla al arreglarlo'));
process.exit(fallo);