#!/usr/bin/env node
/* Rename Spanish classes/ids in tools/<slug>/{index.html,styles.css,app.js}.
   Generic across activities with the shared shape.
   Usage: node scripts/rename-html-css.js <slug>
*/
'use strict';
var fs = require('fs');
var path = require('path');
var slug = process.argv[2];
if (!slug) { console.error('usage: rename-html-css.js <slug>'); process.exit(2); }
var dir = path.join('tools', slug);
var htmlPath = path.join(dir, 'index.html');
var cssPath = path.join(dir, 'styles.css');
var appPath = path.join(dir, 'app.js');
// [find, replace] pairs (word-boundary regex applied). Order matters.
var pairs = [
  ['class="instruccion"', 'class="instruction"'],
  ['class="centrado-fila"', 'class="center-row"'],
  ['class="enunciado"', 'class="prompt"'],
  ['class="leyenda"', 'class="legend"'],
  ['class="pista"', 'class="hint"'],
  ['class="pista-flecha"', 'class="hint-arrow"'],
  ['class="visual-num"', 'class="visual-number"'],
  ['class="palabras-num"', 'class="words-number"'],
  ['class="dictado-espera"', 'class="dictation-pending"'],
  ['class="emoji-grande"', 'class="emoji-large"'],
  ['class="nota-extra"', 'class="extra-note"'],
  ['class="transferencia"', 'class="transfer"'],
  ['class="opciones"', 'class="options"'],
  ['class="opciones-fila"', 'class="options-row"'],
  ['class="bloques"', 'class="blocks"'],
  ['class="bloques-grupo"', 'class="blocks-group"'],
  ['class="bloque-1000"', 'class="block-1000"'],
  ['class="bloque-100"', 'class="block-100"'],
  ['class="bloque-10"', 'class="block-10"'],
  ['class="bloque-1"', 'class="block-1"'],
  ['class="canje-grupo"', 'class="trade-group"'],
  ['class="ascensor-shaft"', 'class="elevator-shaft"'],
  ['class="piso-fila"', 'class="floor-row"'],
  ['class="piso-suelo"', 'class="ground-floor"'],
  ['class="piso-actual"', 'class="current-floor"'],
  ['class="piso-marca"', 'class="target-floor"'],
  ['class="piso-opcion"', 'class="option-floor"'],
  ['class="piso-icono"', 'class="floor-icon"'],
  ['class="cifra-u"', 'class="digit-u"'],
  ['class="cifra-d"', 'class="digit-d"'],
  ['class="cifra-c"', 'class="digit-c"'],
  ['class="cifra-sep"', 'class="digit-sep"'],
  ['class="cifra-pos"', 'class="digit-pos"'],
  ['class="cifra-coma"', 'class="digit-comma"'],
  ['class="cifra-dec"', 'class="digit-dec"'],
  ['class="num-color"', 'class="num-color"'],
  ['class="signo"', 'class="sign"'],
  ['class="destacada destacada"', 'class="highlight highlight"'],
  ['class="destacada"', 'class="highlight"'],
  ['class="grupo-etq"', 'class="group-label"'],
  ['class="grupo"', 'class="group"'],
  ['class="expresion"', 'class="expression"'],
  ['class="caja-num"', 'class="num-box"'],
  ['class="caja-num hueco"', 'class="num-box empty"'],
  ['id="pantallaMenu"', 'id="screenMenu"'],
  ['id="pantallaNiveles"', 'id="screenLevels"'],
  ['id="pantallaJuego"', 'id="screenGame"'],
  ['id="pantallaFinal"', 'id="screenEnd"'],
  ['id="explicacion"', 'id="explanation"'],
  ['id="btnSiguiente"', 'id="btnNext"'],
  ['id="btnVolverMenu"', 'id="btnBackToMenu"'],
  ['id="btnVolverMenuNiveles"', 'id="btnBackToMenuLevels"'],
  ['id="pregunta"', 'id="prompt"'],
  ['id="opciones"', 'id="options"'],
];
function apply(p) {
  if (!fs.existsSync(p)) return 0;
  var src = fs.readFileSync(p, 'utf8');
  var n = 0;
  pairs.forEach(function (pr) {
    var re = new RegExp(pr[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    var m = (src.match(re) || []).length;
    if (m) { src = src.replace(re, pr[1]); n += m; }
  });
  // CSS: rename selectors .foo / #foo
  var cssPairs = [
    ['.instruccion', '.instruction'],
    ['.centrado-fila', '.center-row'],
    ['.enunciado', '.prompt'],
    ['.leyenda', '.legend'],
    ['.pista-flecha', '.hint-arrow'],
    ['.pista ', '.hint '],
    ['.pista\\.', '.hint.'],
    ['.pista,', '.hint,'],
    ['.pista\\)', '.hint)'],
    ['.pista\\{', '.hint{'],
    ['.visual-num', '.visual-number'],
    ['.palabras-num', '.words-number'],
    ['.dictado-espera', '.dictation-pending'],
    ['.emoji-grande', '.emoji-large'],
    ['.nota-extra', '.extra-note'],
    ['.transferencia', '.transfer'],
    ['.opciones-fila', '.options-row'],
    ['.bloques-grupo', '.blocks-group'],
    ['.bloque-1000', '.block-1000'],
    ['.bloque-100', '.block-100'],
    ['.bloque-10', '.block-10'],
    ['.bloque-1', '.block-1'],
    ['.bloques ', '.blocks '],
    ['.bloques{', '.blocks{'],
    ['.bloques,', '.blocks,'],
    ['.bloques\\.', '.blocks.'],
    ['.canje-grupo', '.trade-group'],
    ['.ascensor-shaft', '.elevator-shaft'],
    ['.piso-fila', '.floor-row'],
    ['.piso-suelo', '.ground-floor'],
    ['.piso-actual', '.current-floor'],
    ['.piso-marca', '.target-floor'],
    ['.piso-opcion', '.option-floor'],
    ['.piso-icono', '.floor-icon'],
    ['.cifra-u', '.digit-u'],
    ['.cifra-d', '.digit-d'],
    ['.cifra-c', '.digit-c'],
    ['.cifra-sep', '.digit-sep'],
    ['.cifra-pos', '.digit-pos'],
    ['.cifra-coma', '.digit-comma'],
    ['.cifra-dec', '.digit-dec'],
    ['.num-color', '.num-color'],
    ['.signo', '.sign'],
    ['.grupo-etq', '.group-label'],
    ['.grupo ', '.group '],
    ['.grupo{', '.group{'],
    ['.grupo,', '.group,'],
    ['.destacada', '.highlight'],
    ['.expresion', '.expression'],
    ['.caja-num', '.num-box'],
    ['.hueco', '.empty'],
    ['#pantallaMenu', '#screenMenu'],
    ['#pantallaNiveles', '#screenLevels'],
    ['#pantallaJuego', '#screenGame'],
    ['#pantallaFinal', '#screenEnd'],
    ['#explicacionWrap', '#explanationWrap'],
    ['#explicacion', '#explanation'],
    ['#btnVolverMenu', '#btnBackToMenu'],
    ['#pregunta', '#prompt'],
    ['#opciones', '#options'],
  ];
  // special: .pista preceded by space or { or , or . — keep generic
  cssPairs.forEach(function (pr) {
    var re = new RegExp(pr[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    var m = (src.match(re) || []).length;
    if (m) { src = src.replace(re, pr[1]); n += m; }
  });
  fs.writeFileSync(p, src);
  return n;
}
function applyApp(p) {
  if (!fs.existsSync(p)) return 0;
  var src = fs.readFileSync(p, 'utf8');
  // Apply same renames inside JS strings (classList.toggle, .className = '...')
  var n = 0;
  pairs.forEach(function (pr) {
    var re = new RegExp(pr[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    var m = (src.match(re) || []).length;
    if (m) { src = src.replace(re, pr[1]); n += m; }
  });
  fs.writeFileSync(p, src);
  return n;
}
var total = apply(htmlPath) + apply(cssPath) + applyApp(appPath);
console.log('OK ' + slug + ' (' + total + ' replacements)');
