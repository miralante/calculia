/* ============================================================
   Calculia — Common factors and multiples: shared helpers.

   Máximo común divisor and Mínimo común múltiplo count and draw the same
   things: the greatest common divisor and a row of numbers with the common
   ones marked. Their drawings are styled by assets/css/common-factors.css
   (the cm-* classes).

   Exposes window.App.commonFactors.
   ============================================================ */
(function () {
  'use strict';

  /* The greatest common divisor (Euclid). */
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  /* One row of numbers: the ones in both lists marked, the best one filled in. */
  function chipRow(label, values, common, best) {
    var html = '<div class="cm-list"><span class="cm-label">' + label + '</span><div class="cm-chips">';
    values.forEach(function (v) {
      var cls = 'cm-chip';
      if (common.indexOf(v) !== -1) cls += ' cm-common';
      if (v === best) cls += ' cm-best';
      html += '<span class="' + cls + '">' + v + '</span>';
    });
    return html + '</div></div>';
  }

  window.App.commonFactors = {
    gcd: gcd,
    chipRow: chipRow
  };
})();
