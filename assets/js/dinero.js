/* ==========================================================================
   Calculia — Shared visual money (euros drawn with CSS)
   Exposes window.App.dinero: the coin/banknote catalog and the
   format/speech helpers used by the money tools (El Monedero, La
   Tienda). CSS classes (.dinero, .m5c … .b50e, .mesa-dinero) live in
   assets/css/components.css.
   Amounts are ALWAYS in cents (integers): avoids floating-point
   errors. Requires i18n.js (load after feedback.js, before the
   tool's strings.js).
   ========================================================================== */
(function () {
  'use strict';

  window.App = window.App || {};

  /* Module-specific texts (dinero.* namespace), the same way
     i18n.js does with core.* and feedback.*. */
  App.i18n.register({
    es: {
      dinero: {
        euro: 'euro',
        euros: 'euros',
        centimos: 'céntimos',
        y: 'y',
        cts: 'cts',
        monedaDe: 'Moneda de {v}',
        billeteDe: 'Billete de {v}',
        unaMonedaDe: '1 moneda de {v}',
        variasMonedasDe: '{n} monedas de {v}',
        unBilleteDe: '1 billete de {v}',
        variosBilletesDe: '{n} billetes de {v}'
      }
    },
    en: {
      dinero: {
        euro: 'euro',
        euros: 'euros',
        centimos: 'cents',
        y: 'and',
        cts: 'cts',
        monedaDe: '{v} coin',
        billeteDe: '{v} banknote',
        unaMonedaDe: '1 coin of {v}',
        variasMonedasDe: '{n} coins of {v}',
        unBilleteDe: '1 banknote of {v}',
        variosBilletesDe: '{n} banknotes of {v}'
      }
    }
  });

  /* Catalog: one entry per denomination (no 1 and 2 cent coins:
     cognitive load; amounts go in multiples of 5, like real-world
     rounding). The css class draws it via components.css. */
  var CATALOGO = [
    { cent: 5, tipo: 'moneda', css: 'm5c' },
    { cent: 10, tipo: 'moneda', css: 'm10c' },
    { cent: 20, tipo: 'moneda', css: 'm20c' },
    { cent: 50, tipo: 'moneda', css: 'm50c' },
    { cent: 100, tipo: 'moneda', css: 'm1e' },
    { cent: 200, tipo: 'moneda', css: 'm2e' },
    { cent: 500, tipo: 'billete', css: 'b5e' },
    { cent: 1000, tipo: 'billete', css: 'b10e' },
    { cent: 2000, tipo: 'billete', css: 'b20e' },
    { cent: 5000, tipo: 'billete', css: 'b50e' }
  ];

  function info(cent) {
    return CATALOGO.filter(function (d) { return d.cent === cent; })[0];
  }

  /* Number printed ON the token (inside the coin/banknote), so users
     can sum the money on the table by eye. The spoken label
     (aria-label, hint, breakdown) is `hablado()` — it stays verbose
     ("50 céntimos", "dos euros"). Keep this short: just the number,
     and only the unit when it adds clarity at a glance. */
  function etiqueta(cent) {
    if (cent >= 100) return (cent / 100) + ' €';
    return String(cent);
  }

  /* "1,50 €" — amount with the active language's decimal separator. */
  function formatear(cent) {
    var sep = App.i18n.locale() === 'en' ? '.' : ',';
    return (cent / 100).toFixed(2).replace('.', sep) + ' €';
  }

  /* "2 euros y 50 céntimos" — for speech and for hints. */
  function hablado(cent) {
    var e = Math.floor(cent / 100);
    var c = cent % 100;
    var textoE = e === 1 ? '1 ' + App.i18n.t('dinero.euro') : e + ' ' + App.i18n.t('dinero.euros');
    var textoC = c + ' ' + App.i18n.t('dinero.centimos');
    if (e && c) return textoE + ' ' + App.i18n.t('dinero.y') + ' ' + textoC;
    if (e) return textoE;
    return textoC;
  }

  /* "Moneda de 2 euros" / "Billete de 5 euros" (aria label). */
  function aria(cent) {
    var clave = info(cent).tipo === 'billete' ? 'dinero.billeteDe' : 'dinero.monedaDe';
    return App.i18n.t(clave).replace('{v}', hablado(cent));
  }

  /* Creates the visual token (decorative span or interactive button). */
  function crearFicha(cent, interactiva) {
    var d = info(cent);
    var el = document.createElement(interactiva ? 'button' : 'span');
    if (interactiva) el.type = 'button';
    el.className = 'dinero ' + d.tipo + ' ' + d.css;
    el.textContent = etiqueta(cent);
    return el;
  }

  /* Breaks an amount into tokens, largest to smallest (greedy). */
  function descomponer(cent) {
    var piezas = [];
    var restante = cent;
    CATALOGO.slice().sort(function (a, b) { return b.cent - a.cent; }).forEach(function (d) {
      while (restante >= d.cent) {
        piezas.push(d.cent);
        restante -= d.cent;
      }
    });
    return piezas;
  }

  /* "2 monedas de 1 euro y 1 billete de 5 euros" — breakdown for
     explanations (rule 11), generated from the case itself. */
  function desglose(piezas) {
    var grupos = [];
    piezas.forEach(function (cent) {
      var g = grupos.filter(function (x) { return x.cent === cent; })[0];
      if (g) g.n += 1;
      else grupos.push({ cent: cent, n: 1 });
    });
    var partes = grupos.map(function (g) {
      var billete = info(g.cent).tipo === 'billete';
      var clave = g.n === 1 ? (billete ? 'dinero.unBilleteDe' : 'dinero.unaMonedaDe')
        : (billete ? 'dinero.variosBilletesDe' : 'dinero.variasMonedasDe');
      return App.i18n.t(clave).replace('{n}', g.n).replace('{v}', hablado(g.cent));
    });
    if (partes.length === 1) return partes[0];
    return partes.slice(0, -1).join(', ') + ' ' + App.i18n.t('dinero.y') + ' ' + partes[partes.length - 1];
  }

  /* Paints decorative tokens inside a container (clears it first). */
  function pintarFichas(contenedor, piezas) {
    contenedor.innerHTML = '';
    (piezas || []).forEach(function (cent) {
      var ficha = crearFicha(cent, false);
      ficha.setAttribute('role', 'img');
      ficha.setAttribute('aria-label', aria(cent));
      contenedor.appendChild(ficha);
    });
  }

  window.App.dinero = {
    CATALOGO: CATALOGO,
    info: info,
    etiqueta: etiqueta,
    formatear: formatear,
    hablado: hablado,
    aria: aria,
    crearFicha: crearFicha,
    descomponer: descomponer,
    desglose: desglose,
    pintarFichas: pintarFichas
  };
})();
