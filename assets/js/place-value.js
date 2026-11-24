/* ============================================================
   Calculia — Place value: the shared drawing of digits.
   Every number is drawn with its digits coloured by place: units blue,
   tens green, hundreds purple. Thousands and bigger numbers get a
   separator and, when asked, a label under each group (thousands,
   millions…). The comma, cents and signs are not drawn here: each tool
   that needs them colours them itself.

   Used by tools/numbers/ (model.js) and tools/operations/ (app.js). The
   matching styles are in assets/css/place-value.css.
   ============================================================ */
(function () {
  'use strict';

  var PLACE_CLASS = ['pv-digit--u', 'pv-digit--d', 'pv-digit--c'];

  /* html of the digits of n. labels: a label under each group of three
     (App.i18n 'grupoEtq.<n>'). highlight: the place (0 = units, 1 = tens…)
     to underline. */
  function digits(n, labels, highlight) {
    var s = String(n);
    var groups = [];
    for (var i = s.length; i > 0; i -= 3) groups.unshift(s.slice(Math.max(0, i - 3), i));
    var html = '';
    for (var g = 0; g < groups.length; g++) {
      var body = '';
      for (var j = 0; j < groups[g].length; j++) {
        var pos = groups[g].length - 1 - j;
        var posAbs = (groups.length - 1 - g) * 3 + pos;
        var cls = PLACE_CLASS[pos];
        if (highlight === posAbs) cls += ' pv-digit--hl';
        body += '<span class="' + cls + '">' + groups[g][j] + '</span>';
      }
      if (g > 0) html += '<span class="pv-digit--sep">' + App.utils.thousandsSeparator() + '</span>';
      if (labels && groups.length > 1) {
        html += '<span class="place-group"><span>' + body + '</span>' +
          '<span class="group-label">' + (App.i18n.t('grupoEtq.' + (groups.length - 1 - g)) || '&nbsp;') + '</span></span>';
      } else {
        html += body;
      }
    }
    return html;
  }

  /* A number as a coloured span. opts: { labels, highlight }. */
  function paintNumber(n, opts) {
    opts = opts || {};
    return '<span class="pv-number">' + digits(n, opts.labels, opts.highlight) + '</span>';
  }

  function paintSign(s) { return '<span class="act-sign">' + s + '</span>'; }

  /* The colour legend as html (for an element set with innerHTML). */
  function legendHtml() {
    return '<span class="pv-digit--u">' + App.i18n.t('leyendaUnidadesTxt') + '</span> · ' +
      '<span class="pv-digit--d">' + App.i18n.t('leyendaDecenasTxt') + '</span> · ' +
      '<span class="pv-digit--c">' + App.i18n.t('leyendaCentenasTxt') + '</span>';
  }

  /* The same legend as plain text, for an element set with textContent. It
     names the places in words; the colours are the same on the digits. */
  function legendText() {
    return App.i18n.t('leyendaUnidadesTxt') + ' · ' +
      App.i18n.t('leyendaDecenasTxt') + ' · ' +
      App.i18n.t('leyendaCentenasTxt');
  }

  function repeat(html, times) {
    var s = '';
    for (var i = 0; i < times; i++) s += html;
    return s;
  }

  App.placeValue = {
    PLACE_CLASS: PLACE_CLASS,
    digits: digits,
    paintNumber: paintNumber,
    paintSign: paintSign,
    legendHtml: legendHtml,
    legendText: legendText,
    repeat: repeat
  };
})();
