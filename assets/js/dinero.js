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
  var CATALOG = [
    { cent: 5, type: 'coin', css: 'm5c' },
    { cent: 10, type: 'coin', css: 'm10c' },
    { cent: 20, type: 'coin', css: 'm20c' },
    { cent: 50, type: 'coin', css: 'm50c' },
    { cent: 100, type: 'coin', css: 'm1e' },
    { cent: 200, type: 'coin', css: 'm2e' },
    { cent: 500, type: 'banknote', css: 'b5e' },
    { cent: 1000, type: 'banknote', css: 'b10e' },
    { cent: 2000, type: 'banknote', css: 'b20e' },
    { cent: 5000, type: 'banknote', css: 'b50e' }
  ];

  function info(cent) {
    return CATALOG.filter(function (d) { return d.cent === cent; })[0];
  }

  /* Number printed ON the token (inside the coin/banknote), so users
     can sum the money on the table by eye. The spoken label
     (aria-label, hint, breakdown) is `spoken()` — it stays verbose
     ("50 céntimos", "dos euros"). Keep this short: just the number,
     and only the unit when it adds clarity at a glance. */
  function label(cent) {
    if (cent >= 100) return (cent / 100) + ' €';
    return String(cent);
  }

  /* Decimal separators per locale. Add a new entry here when adding a
     language — see doc/I18N.md §4 for the recipe and the conventions to
     follow (Spanish uses ',', English uses '.', French uses ',' but with
     a thin-space thousands separator). */
  var DECIMAL_SEP = { es: ',', en: '.' };

  /* "1,50 €" — amount with the active language's decimal separator. */
  function format(cent) {
    var sep = DECIMAL_SEP[App.i18n.locale()] || DECIMAL_SEP[App.i18n.DEFAULT];
    return (cent / 100).toFixed(2).replace('.', sep) + ' €';
  }

  /* "2 euros y 50 céntimos" — for speech and for hints. */
  function spoken(cent) {
    var e = Math.floor(cent / 100);
    var c = cent % 100;
    var euroText = e === 1 ? '1 ' + App.i18n.t('dinero.euro') : e + ' ' + App.i18n.t('dinero.euros');
    var centText = c + ' ' + App.i18n.t('dinero.centimos');
    if (e && c) return euroText + ' ' + App.i18n.t('dinero.y') + ' ' + centText;
    if (e) return euroText;
    return centText;
  }

  /* "Coin of 2 euros" / "Banknote of 5 euros" (aria label). */
  function aria(cent) {
    var key = info(cent).type === 'banknote' ? 'dinero.billeteDe' : 'dinero.monedaDe';
    return App.i18n.t(key).replace('{v}', spoken(cent));
  }

  /* Creates the visual token (decorative span or interactive button). */
  function createToken(cent, interactive) {
    var d = info(cent);
    var el = document.createElement(interactive ? 'button' : 'span');
    if (interactive) el.type = 'button';
    el.className = 'dinero ' + d.type + ' ' + d.css;
    el.textContent = label(cent);
    return el;
  }

  /* Breaks an amount into tokens, largest to smallest (greedy). */
  function breakdown(cent) {
    var pieces = [];
    var remaining = cent;
    CATALOG.slice().sort(function (a, b) { return b.cent - a.cent; }).forEach(function (d) {
      while (remaining >= d.cent) {
        pieces.push(d.cent);
        remaining -= d.cent;
      }
    });
    return pieces;
  }

  /* "2 coins of 1 euro and 1 banknote of 5 euros" — breakdown for
     explanations (rule 11), generated from the case itself. */
  function breakdownText(pieces) {
    var groups = [];
    pieces.forEach(function (cent) {
      var g = groups.filter(function (x) { return x.cent === cent; })[0];
      if (g) g.n += 1;
      else groups.push({ cent: cent, n: 1 });
    });
    var parts = groups.map(function (g) {
      var banknote = info(g.cent).type === 'banknote';
      var key = g.n === 1 ? (banknote ? 'dinero.unBilleteDe' : 'dinero.unaMonedaDe')
        : (banknote ? 'dinero.variosBilletesDe' : 'dinero.variasMonedasDe');
      return App.i18n.t(key).replace('{n}', g.n).replace('{v}', spoken(g.cent));
    });
    if (parts.length === 1) return parts[0];
    return parts.slice(0, -1).join(', ') + ' ' + App.i18n.t('dinero.y') + ' ' + parts[parts.length - 1];
  }

  /* Paints decorative tokens inside a container (clears it first). */
  function paintTokens(container, pieces) {
    container.innerHTML = '';
    (pieces || []).forEach(function (cent) {
      var token = createToken(cent, false);
      token.setAttribute('role', 'img');
      token.setAttribute('aria-label', aria(cent));
      container.appendChild(token);
    });
  }

  window.App.dinero = {
    CATALOG: CATALOG,
    info: info,
    label: label,
    format: format,
    spoken: spoken,
    aria: aria,
    createToken: createToken,
    breakdown: breakdown,
    breakdownText: breakdownText,
    paintTokens: paintTokens
  };
})();
