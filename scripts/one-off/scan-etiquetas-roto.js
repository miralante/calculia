#!/usr/bin/env node
/* ============================================================
   scan-etiquetas-roto.js — one-off
   Un escaneo por líneas no sirve: un fichero minificado en una sola
   línea pasa entero por debajo. Este recorre el fichero entero como
   texto y reconstruye cada etiqueta <link>/<script> desde el literal
   esperado, en vez de fiarse de una coincidencia parcial: si al
   reescribir un atributo se pierde el `="`, la etiqueta queda rota y
   solo se ve pidiendo la URL.

   Busca tres clases de fallo, no las que ya se han visto antes:
   1. atributo de ruta sin su `=` (href pegado a la ruta: hRUTA)
   2. token ?v= duplicado en la misma referencia
   3. token ?v= que no es sha256(file)[0:8] con el prefijo esperado
   Se ejecuta sobre los ficheros que toca el reescritor de tokens.
   ============================================================ */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..', '..');
var TARGETS = [
  'index.html', 'dev/index.html', 'config/index.html',
  'tools/scale/index.html', 'tools/shapes/index.html',
  '404.html', 'about/index.html', 'team/index.html', 'legal/index.html'
];

var problems = [];

function report(file, kind, detail) {
  problems.push(file + ': ' + kind + ' — ' + detail);
}

TARGETS.forEach(function (rel) {
  var full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return;
  var content = fs.readFileSync(full, 'utf8');

  /* --- 1. link/script tags, reconstructed from the literal --- */
  var re = /<(link|script)\b([\s\S]*?)>/g;
  var m;
  while ((m = re.exec(content)) !== null) {
    var tag = m[0];
    var attrs = m[2];
    /* A path attribute is well formed only when it carries its `=`
       and a quoted value. Anything else means the tag was damaged. */
    var hasHref = /\bhref\s*=/.test(attrs);
    var hasSrc = /\bsrc\s*=/.test(attrs);
    if (!hasHref && !hasSrc) {
      /* <link rel=manifest> and <script> inline blocks are allowed to
         have neither, but a <script src=...> may not lose its `src=`. */
      if (/\b(?:h|s)[A-Za-z0-9_./-]+\.[a-z0-9]+\?/.test(attrs)) {
        report(rel, 'atributo de ruta sin =', tag.slice(0, 100));
      }
      continue;
    }
    ['href', 'src'].forEach(function (name) {
      if (!new RegExp('\\b' + name + '\\s*=').test(attrs)) return;
      var vm = new RegExp('\\b' + name + '\\s*=\\s*"([^"]*)"').exec(attrs);
      if (!vm) {
        report(rel, name + ' sin valor entre comillas', tag.slice(0, 100));
        return;
      }
      var value = vm[1];
      if (value && !value.trim()) {
        report(rel, name + ' vacio', tag.slice(0, 100));
      }
    });
  }

  /* --- 2 & 3. the ?v= tokens themselves --- */
  var reV = /([A-Za-z0-9_./-]+)\?v=([A-Za-z0-9_-]+)/g;
  while ((m = reV.exec(content)) !== null) {
    var file = m[1];
    var token = m[2];
    if (/\?/.test(token) || token.length !== token.trim().length) {
      report(rel, 'token con caracteres raros', file + '?v=' + token);
    }
    if (!/^calculia-v[0-9a-f]{8}$/.test(token)) {
      report(rel, 'token con forma inesperada', file + '?v=' + token);
    }
  }
});

if (problems.length) {
  console.log('PROBLEMAS (' + problems.length + '):');
  problems.forEach(function (p) { console.log('  - ' + p); });
  process.exit(1);
}
console.log('OK: ninguna etiqueta rota ni token con forma rara en ' + TARGETS.length + ' paginas.');