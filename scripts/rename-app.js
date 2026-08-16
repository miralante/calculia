#!/usr/bin/env node
/* Bulk-rename Spanish identifiers to English in a tools/<slug>/app.js
   using word-boundary regex per token. Whitelist-only.
   Usage: node scripts/rename-app.js <path>
*/
'use strict';
var fs = require('fs');
var path = process.argv[2];
if (!path) { console.error('usage: rename-app.js <file>'); process.exit(2); }
var src = fs.readFileSync(path, 'utf8');
var words = {
  // function/method names — full word boundary
  'paintMenu': 'paintMenu',
  'openActivity': 'openActivity',
  'startRound': 'startRound',
  'startReinforce': 'startReinforce',
  'showReinforceQuestion': 'showReinforceQuestion',
  'render': 'render',
  'showExplanation': 'showExplanation',
  'showHint': 'showHint',
  'paintProgress': 'paintProgress',
  'paintReinforceProgress': 'paintReinforceProgress',
  'paintStars': 'paintStars',
  'plainText': 'plainText',
  'floorPlain': 'floorPlain',
  'floorHTML': 'floorHTML',
  'thousandsSeparator': 'thousandsSeparator',
  'separadorMiles': 'thousandsSeparator',
  'legendPos': 'legendPos',
  'leyendaPos': 'legendPos',
  'legendElevator': 'legendElevator',
  'leyendaAscensor': 'legendElevator',
  'shaftHTML': 'shaftHTML',
  'pozoHTML': 'shaftHTML',
  'buildOptions': 'buildOptions',
  'opcionesNumericas': 'buildOptions',
  'repeat': 'repeat',
  'repetir': 'repeat',
  'digits': 'digits',
  'cifras': 'digits',
  'number': 'paintNumber',
  'numero': 'paintNumber',
  'sign': 'paintSign',
  'signo': 'paintSign',
  'ri': 'randInt',
  'draw': 'draw',
  'sacar': 'draw',
  'save': 'save',
  'guardar': 'save',
  'answer': 'answer',
  'responder': 'answer',
  'next': 'next',
  'siguiente': 'next',
  'restart': 'restart',
  'reiniciar': 'restart',
  'show': 'show',
  'mostrar': 'show',
  // variable names
  'fixedQuestion': 'fixedQuestion',
  'preguntaFija': 'fixedQuestion',
  'inReinforce': 'inReinforce',
  'enRefuerzo': 'inReinforce',
  'reinforceList': 'reinforceList',
  'listaRefuerzo': 'reinforceList',
  'reinforceIndex': 'reinforceIndex',
  'indiceRefuerzo': 'reinforceIndex',
  'reinforceTotal': 'reinforceTotal',
  'totalRefuerzo': 'reinforceTotal',
  'roundCorrect': 'roundCorrect',
  'aciertosRonda': 'roundCorrect',
  'answered': 'answered',
  'respondida': 'answered',
  'attempts': 'attempts',
  'intentos': 'attempts',
  'question': 'question',
  'pregunta': 'question',
  'pools': 'pools',
  'grupos': 'pools',
  'POS_CLASS': 'POS_CLASS',
  'clasePos': 'POS_CLASS',
  'clasePosicion': 'POS_CLASS',
  'screenMenu': 'screenMenu',
  'pantallaMenu': 'screenMenu',
  'screenLevels': 'screenLevels',
  'pantallaNiveles': 'screenLevels',
  'screenGame': 'screenGame',
  'pantallaJuego': 'screenGame',
  'screenEnd': 'screenEnd',
  'pantallaFinal': 'screenEnd',
};
var replacements = 0;
Object.keys(words).sort(function (a, b) { return b.length - a.length; }).forEach(function (k) {
  var v = words[k];
  if (k === v) return;
  var re = new RegExp('\\b' + k + '\\b', 'g');
  var n = (src.match(re) || []).length;
  if (n) {
    src = src.replace(re, v);
    replacements += n;
    console.log('  ' + k + ' -> ' + v + ' (' + n + ')');
  }
});
fs.writeFileSync(path, src);
console.log('OK ' + path + ' (' + replacements + ' replacements)');
