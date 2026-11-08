/* ============================================================
   Calculia — fractions-measures: the model (no page in it).
   The questions, the numbers and the drawings as HTML text. Nothing here
   touches the page, so it can be checked on its own. The page and the flow
   are in app.js, which reads these names from App.fractionsMeasuresModel.
   ============================================================ */
(function () {
  'use strict';

  var H = App.FractionsHelpers;
  var leyendaFrac = H.leyendaFrac, svgFraccion = H.svgFraccion, htmlFraccion = H.htmlFraccion,
      fracOption = H.fracOption, fracAria = H.fracAria, sameAmount = H.sameAmount,
      decimalSeparator = H.decimalSeparator, decimalText = H.decimalText, threeOf = H.threeOf,
      tenthOptions = H.tenthOptions, pickWrong = H.pickWrong;
  var G = App.FractionsGenerators;
  var GENERATORS = G.GENERATORS;
  var I = App.FractionsIntro;
  var INTRO = I.INTRO;


  var resolved = false;
  var fixedQuestion = null;

  function comaT(key) { return App.i18n.t('coma.' + key); }

  /* Decimal separator of the locale: comma in Spanish, point in English. */
  function comaSeparator() { return App.i18n.locale() === 'en' ? '.' : ','; }

  var COMA_WORDS = {
    es: {
      units: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
      teens: ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
      twenties: ['veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'],
      tens: ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
      hundreds: ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']
    },
    en: {
      units: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
    }
  };

  function comaSpeakWhole(n, locale) {
    var w = locale === 'en' ? COMA_WORDS.en : COMA_WORDS.es;
    var parts = [];
    var h = Math.floor(n / 100);
    var rest = n % 100;
    if (h) {
      if (locale === 'en') parts.push(w.units[h] + ' hundred');
      else parts.push(h === 1 && rest === 0 ? 'cien' : w.hundreds[h]);
    }
    if (rest) {
      if (rest < 10) {
        parts.push(w.units[rest]);
      } else if (rest < 20) {
        parts.push(w.teens[rest - 10]);
      } else if (locale !== 'en' && rest < 30) {
        parts.push(w.twenties[rest - 20]);
      } else if (locale === 'en') {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? '-' + w.units[rest % 10] : ''));
      } else {
        parts.push(w.tens[Math.floor(rest / 10)] + (rest % 10 ? ' y ' + w.units[rest % 10] : ''));
      }
    }
    return parts.join(' ');
  }

  function comaRandomInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function genComma(step) {
    var total = step.enteras + step.decimales;
    var n;
    do {
      n = comaRandomInt(Math.pow(10, total - 1), Math.pow(10, total) - 1);
    } while (n % 10 === 0);
    var locale = App.i18n.locale();
    var digits = String(n);
    var whole = digits.slice(0, step.enteras);
    var fraction = digits.slice(step.enteras);
    var words = (locale === 'en' ? COMA_WORDS.en : COMA_WORDS.es).units;
    var spokenFraction = fraction.split('').map(function (d) { return words[Number(d)]; }).join(' ');
    /* Read before the comma is placed: the number itself, digit by digit.
       It never says where the comma goes. */
    var spokenDigits = digits.split('').map(function (d) { return words[Number(d)]; }).join(' ');
    var prompt = step.decimales === 1
      ? comaT('promptDecimalOne')
      : comaT('promptDecimal').replace('{count}', step.decimales);
    return {
      n: n,
      gap: step.enteras - 1,
      correct: whole + comaSeparator() + fraction,
      decimals: step.decimales,
      prompt: prompt,
      listen: spokenDigits,
      /* Read after a right answer: the whole number with its comma. */
      audio: comaSpeakWhole(Number(whole), locale) + (locale === 'en' ? ' point ' : ' coma ') + spokenFraction
    };
  }

  var COMA_DRAG_PX = 6;

  App.fractionsMeasuresModel = {
    resolved: resolved,
    fixedQuestion: fixedQuestion,
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
    pickWrong: pickWrong,
    GENERATORS: GENERATORS,
    INTRO: INTRO,
    comaT: comaT,
    comaSeparator: comaSeparator,
    COMA_WORDS: COMA_WORDS,
    comaSpeakWhole: comaSpeakWhole,
    comaRandomInt: comaRandomInt,
    genComma: genComma,
    COMA_DRAG_PX: COMA_DRAG_PX
  };
})();
