/* ============================================================
   Calculia — Fractions and measures: the fraction pictures, labels and answer helpers.
   ============================================================ */
(function () {
  'use strict';

  function leyendaFrac() {
    return '<span class="digit-u">' + App.i18n.t('leyendaPartesPintadasTxt') + '</span> · ' +
      '<span class="digit-d">' + App.i18n.t('leyendaPartesTotalTxt') + '</span>';
  }

  function svgFraccion(num, den, size) {
    var cx = 60, cy = 60, r = 54;
    var paths = '';
    for (var i = 0; i < den; i++) {
      var a0 = -Math.PI / 2 + (i * 2 * Math.PI) / den;
      var a1 = a0 + (2 * Math.PI) / den;
      var x0 = (cx + r * Math.cos(a0)).toFixed(1);
      var y0 = (cy + r * Math.sin(a0)).toFixed(1);
      var x1 = (cx + r * Math.cos(a1)).toFixed(1);
      var y1 = (cy + r * Math.sin(a1)).toFixed(1);
      var fill = i < num ? 'var(--mod-razonamiento)' : 'var(--color-superficie)';
      paths += '<path d="M' + cx + ' ' + cy + ' L' + x0 + ' ' + y0 +
        ' A' + r + ' ' + r + ' 0 0 1 ' + x1 + ' ' + y1 + ' Z" fill="' + fill +
        '" stroke="var(--color-texto)" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 120 120" width="' + size + '" height="' + size + '" aria-hidden="true">' + paths + '</svg>';
  }

  function htmlFraccion(f) {
    return '<span class="frac" aria-hidden="true"><span class="frac-num">' + f[0] +
      '</span><span class="frac-den">' + f[1] + '</span></span>';
  }

  function fracOption(f) {
    return '<span class="op-frac">' + svgFraccion(f[0], f[1], 120) + htmlFraccion(f) + '</span>';
  }

  function fracAria(f) {
    return App.i18n.t('gen.fraccionAria').replace('{num}', f[0]).replace('{den}', f[1]);
  }

  function sameAmount(a, b) {
    return a[0] * b[1] === b[0] * a[1];
  }

  function decimalSeparator() {
    return App.i18n.locale() === 'en' ? '.' : ',';
  }

  function decimalText(f) {
    var places = 1;
    while (places < 6 && (f[0] * Math.pow(10, places)) % f[1] !== 0) places++;
    var scaled = (f[0] * Math.pow(10, places)) / f[1];
    if (scaled % 1 !== 0) throw new Error('fractions: ' + f.join('/') + ' has no exact decimal');
    var digits = String(scaled);
    while (digits.length <= places) digits = '0' + digits;
    return digits.slice(0, digits.length - places) + decimalSeparator() +
      digits.slice(digits.length - places);
  }

  function threeOf(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.concat([correct + 1, correct - 1, correct + 2]).forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    return list.map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  function tenthOptions(resultTenths, candidates) {
    var seen = {};
    var list = [resultTenths];
    seen[resultTenths] = true;
    candidates.concat([resultTenths + 1, resultTenths - 1,
      resultTenths + 2, resultTenths - 2]).forEach(function (v) {
      if (v >= 1 && v <= 10 && !seen[v] && list.length < 3) {
        seen[v] = true;
        list.push(v);
      }
    });
    if (list.length < 3) {
      throw new Error('fractions: only ' + list.length + ' answers fit in one pie');
    }
    return App.utils.shuffle(list).map(function (v) {
      var text = decimalText([v, 10]);
      return {
        html: '<span class="decimal-value">' + text + '</span>',
        aria: text,
        correct: v === resultTenths
      };
    });
  }

  function pickWrong(result, candidates) {
    var picked = [];
    candidates.forEach(function (f) {
      var repeated = picked.some(function (p) { return sameAmount(p, f); });
      if (picked.length < 2 && f[0] > 0 && f[1] > 0 && f[0] <= f[1] &&
          !repeated && !sameAmount(f, result)) {
        picked.push(f);
      }
    });
    return picked;
  }

  App.FractionsHelpers = {
    leyendaFrac: leyendaFrac,
    svgFraccion: svgFraccion,
    htmlFraccion: htmlFraccion,
    fracOption: fracOption,
    fracAria: fracAria,
    sameAmount: sameAmount,
    decimalSeparator: decimalSeparator,
    decimalText: decimalText,
    threeOf: threeOf,
    tenthOptions: tenthOptions,
    pickWrong: pickWrong
  };
})();
