/* ============================================================
   Calculia — Fractions and measures: the introduction slides of each fraction topic.
   ============================================================ */
(function () {
  'use strict';

  var H = App.FractionsHelpers;
  var fracOption = H.fracOption, htmlFraccion = H.htmlFraccion, leyendaFrac = H.leyendaFrac,
      decimalSeparator = H.decimalSeparator, svgFraccion = H.svgFraccion, decimalText = H.decimalText;

  var INTRO = {
    fracciones: {
      slides: [
        { key: 'parts', visual: function () { return fracOption([3, 4]); } },
        { key: 'notation', visual: function () {
          return '<div class="intro-notation">' + htmlFraccion([3, 4]) + leyendaFrac() + '</div>';
        } },
        { key: 'size', visual: function () {
          return '<div class="intro-compare">' + fracOption([1, 2]) + fracOption([1, 4]) + '</div>';
        } }
      ],
      real: [
        { key: 'pizza', picto: '🍕' },
        { key: 'clock', picto: '⏰' },
        { key: 'money', picto: '💶' },
        { key: 'bottle', picto: '🥤' }
      ]
    },
    decimales: {
      slides: [
        { key: 'whole', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">' +
            '<span class="digit-u">3</span>' + decimalSeparator() + '47</span></div>';
        } },
        { key: 'decimal', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">3' + decimalSeparator() +
            '<span class="digit-d">47</span></span></div>';
        } },
        { key: 'tenths', visual: function () {
          return '<div class="intro-notation">' + svgFraccion(3, 10, 170) +
            '<span class="decimal-value">' + decimalText([3, 10]) + '</span></div>';
        } },
        { key: 'point', visual: function () {
          return '<div class="intro-notation"><span class="decimal-value">' +
            '<span class="digit-u">0</span>' + decimalSeparator() +
            '<span class="digit-d">3</span></span></div>';
        } },
        { key: 'half', visual: function () {
          return '<div class="intro-compare">' +
            '<span class="op-frac">' + svgFraccion(1, 2, 120) +
              '<span class="decimal-value">' + decimalText([1, 2]) + '</span></span>' +
            '<span class="op-frac">' + svgFraccion(1, 4, 120) +
              '<span class="decimal-value">' + decimalText([1, 4]) + '</span></span>' +
          '</div>';
        } }
      ],
      real: [
        { key: 'height', picto: '🧍' },
        { key: 'coins', picto: '💰' },
        { key: 'price', picto: '💶' },
        { key: 'milk', picto: '🥛' },
        { key: 'ribbon', picto: '📏' },
        { key: 'candy', picto: '🍬' }
      ]
    }
  };

  App.FractionsIntro = {
    INTRO: INTRO
  };
})();
