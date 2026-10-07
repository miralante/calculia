#!/usr/bin/env node
/* ============================================================
   probe-escala-contraste.js — one-off
   Comprueba los pares de color que usa tools/scale/ en los tres
   temas, leyendo los tokens reales de assets/css/tokens.css en vez
   de suponerlos. Un token escrito en un SVG no se ve si el par que
   forma con el fondo no contrasta, y un SVG no lo delata ningún
   test de estructura: el elemento existe y es clicable, solo que no
   se ve. Por eso se mide aquí y no se da por bueno por pasar
   check.js.

   Cada fila es un par DIBUJADO EN tools/scale/styles.css. El mínimo
   que se pide a una línea de 2px sobre una superficie es 3:1
   (WCAG 1.4.11, no texto), y a un número impreso 4.5:1 (texto).

   Uso: node scripts/one-off/probe-escala-contraste.js
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..', '..');
var TOKENS = path.join(ROOT, 'assets', 'css', 'tokens.css');

/* Los pares que de verdad aparecen en los dibujos de la actividad,
   con el mínimo que le toca a cada uno.

   Nota sobre --color-borde: está fuera de la lista a propósito. Sobre
   --color-superficie mide 1.50:1 en claro y 1.55:1 en oscuro, así que
   una regla, una jarra o una barra de plano dibujadas con ese token
   son figuras sin borde. Todos los contornos que sostienen la lectura
   usan --color-texto. */
var PAIRS = [
  { name: 'rayita de la regla', fg: '--color-texto', bg: '--color-superficie', min: 3 },
  { name: 'rayita marcada (la que se pregunta)', fg: '--mod-razonamiento', bg: '--color-superficie', min: 3 },
  { name: 'numero impreso en la regla', fg: '--color-texto', bg: '--color-superficie', min: 4.5 },
  { name: 'unidad de la regla', fg: '--color-texto-suave', bg: '--color-superficie', min: 4.5 },
  { name: 'lapiz sobre el fondo', fg: '--mod-secuencia', bg: '--color-fondo', min: 3 },
  { name: 'punta del lapiz sobre la regla', fg: '--mod-razonamiento', bg: '--color-superficie', min: 3 },
  { name: 'columna del instrumento', fg: '--mod-secuencia', bg: '--color-superficie', min: 3 },
  { name: 'rayita del instrumento', fg: '--color-texto', bg: '--color-superficie', min: 3 },
  { name: 'rayita marcada del instrumento', fg: '--mod-razonamiento', bg: '--color-superficie', min: 3 },
  { name: 'borde de la barra del plano', fg: '--color-texto', bg: '--color-superficie', min: 3 },
  { name: 'carretera del plano', fg: '--color-texto', bg: '--color-superficie', min: 3 },
  { name: 'numero del plano', fg: '--color-texto', bg: '--color-superficie', min: 4.5 }
];

function hexToRgb(hex) {
  var h = hex.trim().replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255
  };
}

function channel(c) {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  var c = hexToRgb(hex);
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

function contrast(a, b) {
  var l1 = luminance(a);
  var l2 = luminance(b);
  if (l1 < l2) { var t = l1; l1 = l2; l2 = t; }
  return (l1 + 0.05) / (l2 + 0.05);
}

/* tokens.css esta organised en tres bloques: :root, [data-theme="dark"]
   y [data-theme="contrast"]. Se corta por el selector de cada uno y se
   leen solo las declaraciones de su bloque. */
function readThemes() {
  var css = fs.readFileSync(TOKENS, 'utf8');
  var wanted = ['light', 'dark', 'contrast'];
  var starts = [];
  var re = /(:root|\[data-theme="(dark|contrast)"\])\s*\{/g;
  var m;
  while ((m = re.exec(css)) !== null) {
    starts.push({ name: m[2] || 'light', at: m.index });
  }
  var themes = {};
  for (var i = 0; i < starts.length; i += 1) {
    var from = starts[i].at;
    /* El bloque acaba en la primera llave de cierre. */
    var end = css.indexOf('}', from);
    var block = css.slice(from, end);
    var vars = {};
    var reVar = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g;
    var mv;
    while ((mv = reVar.exec(block)) !== null) {
      vars[mv[1]] = mv[2].trim();
    }
    themes[starts[i].name] = vars;
  }
  return wanted.filter(function (n) { return themes[n]; })
    .map(function (n) { return { name: n, vars: themes[n] }; });
}

var themes = readThemes();
if (!themes.length) {
  console.error('No se ha podido leer ningun tema de ' + TOKENS);
  process.exit(2);
}

var failures = 0;
console.log('tools/scale — contraste de los dibujos por tema\n');

themes.forEach(function (theme) {
  console.log('  [' + theme.name + ']');
  PAIRS.forEach(function (pair) {
    var fg = theme.vars[pair.fg];
    var bg = theme.vars[pair.bg];
    if (!fg || !bg) {
      failures += 1;
      console.log('    FALTA  ' + pair.name + ': ' + pair.fg + ' o ' + pair.bg + ' no existe en el tema');
      return;
    }
    var ratio = contrast(fg, bg);
    var ok = ratio >= pair.min;
    if (!ok) failures += 1;
    console.log('    ' + (ok ? 'ok    ' : 'FALLA ') +
      ratio.toFixed(2).padStart(6) + ':1  (min ' + pair.min + ')  ' + pair.name);
  });
  console.log('');
});

if (failures) {
  console.log('FALLOS: ' + failures);
  process.exit(1);
}
console.log('Todos los pares cumplen el minimo en los tres temas.');