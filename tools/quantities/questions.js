/* ============================================================
   Calculia — Quantities: the generators: reading and writing, and the points game.
   ============================================================ */
(function () {
  'use strict';

  var W = App.QuantitiesWords;
  var readNumber = W.readNumber, format = W.format, t = W.t;
  var rint = App.utils.rint;

  /* ----------- Generators ----------- */

  /* Read and write share one generator. The digit count comes from the
     round (see DATA.writeDigits): thousands first, up to 9 digits. The
     answer is always the number spelled out in words.
       read : the number is shown in digits, coloured by group.
       write: the number is only spoken (🔊); nothing is shown. */
  function genWords(mode, item) {
    var digits = item.digits;
    var n = rint(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var words = readNumber(n, App.i18n.locale());
    var reading = mode === 'read';
    return {
      n: n,
      tipo: 'typing',
      show: reading ? format(n) : '',
      correct: words,
      prompt: t(reading ? 'promptRead' : 'promptWrite'),
      detail: t(reading ? 'detailRead' : 'detailWrite'),
      audio: words
    };
  }

  /* ----------- The points game -----------
     Each round entry gives the digit count of its number (see
     DATA.pointsDigits), so the points go up one at a time: first
     one point, then two, then three. The digits are random. */

  /* Gap i (after digit i, counted from the left) is a place for a
     point when the digits to its right come in full groups of three. */
  function correctGaps(n) {
    var digits = String(n);
    var gaps = [];
    for (var i = 0; i < digits.length - 1; i++) {
      if ((digits.length - 1 - i) % 3 === 0) gaps.push(i);
    }
    return gaps;
  }

  function genPoints(mode, item) {
    var digits = item.digits;
    var n = rint(Math.pow(10, digits - 1), Math.pow(10, digits) - 1);
    var gaps = correctGaps(n);
    return {
      n: n,
      tipo: 'points',
      gaps: gaps,
      correct: format(n),
      prompt: gaps.length === 1 ? t('promptPointsOne') : t('promptPoints').replace('{count}', gaps.length),
      detail: t('detailPoints'),
      audio: readNumber(n, App.i18n.locale())
    };
  }

  var GENERATORS = {
    read: genWords,
    write: genWords,
    points: genPoints
  };

  App.QuantitiesQuestions = {
    GENERATORS: GENERATORS
  };
})();
