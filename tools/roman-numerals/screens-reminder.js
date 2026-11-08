/* Calculia — Roman numerals, screen 3: the reminder of the I/V/X table
   and the subtract and add examples. Built by screens.js. */
(function () {
  'use strict';

  var M = App.romanNumeralsModel;
  var t = M.t, CAROUSEL_ORDER = M.CAROUSEL_ORDER, wrapRomanLetters = M.wrapRomanLetters, wrapTrailingRoman = M.wrapTrailingRoman;
  var coloredCaption = M.coloredCaption, paintFamousPhrase = M.paintFamousPhrase, famousFor = M.famousFor, totalColorClass = M.totalColorClass;
  var letterClass = M.letterClass, cardinalFor = M.cardinalFor, ordinalFor = M.ordinalFor;
  var $ = App.utils.$;

  App.romanNumeralsReminder = function (host) {

    /* ---------- Screen 3: reminder ---------- */
    var symbolsRow = $('#symbolsRow');
    var exampleSubtractRoman = $('#exampleSubtractRoman');
    var exampleSubtractEquals = $('#exampleSubtractEquals');
    /* Second example of the subtract rule (IX = 9), so the rule is
       shown with both bigger letters (V in IV and X in IX), not
       only with one. Wired to the second .rule-example under
       ruleSubtract in index.html. */
    var exampleSubtractRoman2 = $('#exampleSubtractRoman2');
    var exampleSubtractEquals2 = $('#exampleSubtractEquals2');
    var exampleAddRoman = $('#exampleAddRoman');
    var exampleAddEquals = $('#exampleAddEquals');
    /* Second example of the add rule (XI = 11), parallel to the
       second subtract example: the sum side is shown both with V
       (VI = 6) and with X (XI = 11). */
    var exampleAddRoman2 = $('#exampleAddRoman2');
    var exampleAddEquals2 = $('#exampleAddEquals2');

    /* ---------- Screen 3: reminder ---------- */

    /* Paints a Roman numeral letter by letter with colours inside a
       .roman-join (used in the two examples of the reminder) and
       returns its decomposition to fill the "= {total}". */
    function paintRomanJoin(el, roman) {
      el.innerHTML = '';
      var deco = DATA.decompose(roman);
      deco.tokens.forEach(function (tok) {
        var span = document.createElement('span');
        span.className = 'ltr ltr-' + tok.letter + (tok.sign === '-' ? ' letter-subtract' : '');
        span.textContent = tok.letter;
        el.appendChild(span);
      });
      return deco;
    }

    function paintSymbols() {
      symbolsRow.innerHTML = '';
      DATA.symbols.forEach(function (s) {
        var pill = document.createElement('div');
        pill.className = 'symbol-pill';
        /* pill-value carries the colour class of the letter (letter-i /
           letter-v / letter-x) so the decimal value (1, 5, 10) reads
           in the same colour as the symbol it belongs to. That way
           the I/V/X table is consistent with the rest of the
           activity. */
        pill.innerHTML =
          '<span aria-hidden="true" class="pill-letter ' + letterClass(s.roman) + '">' + s.roman + '</span>' +
          '<span aria-hidden="true" class="pill-value ' + letterClass(s.roman) + '">' + s.value + '</span>' +
          '<span class="pill-caption">' + t('symbol{' + s.roman + '}') + '</span>';
        symbolsRow.appendChild(pill);
      });
    }

    /* Text of the final equality of an example: a single
       subtract-add pair (e.g. IV) shows its subtraction
       "5 − 1 = 4"; more than one chunk (e.g. VI = V + I) shows
       the full sum "5 + 1 = 6". */
    /* Returns the equality as HTML with each number in the same
       colour as its letter in the roman-join above, so value and
       colour are read together just like the letters themselves. */
    function formatEquals(deco) {
      if (deco.mode === 'subtract') {
        var big = deco.chunks[0].letters[1];
        var small = deco.chunks[0].letters[0];
        /* The total (4 in IV) is originated by the I that subtracts,
           so it goes in red with class letter-subtract. */
        return ' = <span aria-hidden="true" class="letter-' + big.toLowerCase() + '">' + ROMAN_VALUES[big] + '</span>' +
          ' − <span aria-hidden="true" class="letter-' + small.toLowerCase() + ' letter-subtract">' + ROMAN_VALUES[small] + '</span>' +
          ' = <span aria-hidden="true" class="letter-' + small.toLowerCase() + ' letter-subtract">' + deco.total + '</span>';
      }
      if (deco.chunks.length > 1) {
        var parts = deco.chunks.map(function (chunk) {
          return '<span aria-hidden="true" class="letter-' + chunk.letters[0].toLowerCase() + '">' + chunk.value + '</span>';
        });
        /* The total colour is decided by the first chunk of the sum
           (the one that contributes the most weight): X if it
           starts with X, V if it starts with V. Matches the
           deco-total logic in paintQuizDecomposition. */
        var totalLetter = deco.chunks[0].letters[0];
        return ' = ' + parts.join(' + ') +
          ' = <span aria-hidden="true" class="letter-' + totalLetter.toLowerCase() + '">' + deco.total + '</span>';
      }
      /* A single chunk: the total colour is the colour of that letter
         (X→orange for X=10, V→green for V=5, I→blue for I=1).
         For isolated IV (deco.mode === 'subtract' above) we never
         reach here. */
      var singleLetter = deco.tokens[0].letter;
      return ' = <span aria-hidden="true" class="letter-' + singleLetter.toLowerCase() + '">' + deco.total + '</span>';
    }

    function paintRuleExamples() {
      /* Subtract rule: two examples so it covers both bigger
         letters (V via IV, X via IX). The second example (IX)
         uses the same paintRomanJoin/formatEquals pair as the
         first, so the colour coding of the subtract I (red) is
         identical and the reader sees the rule once with each
         possible "bigger" letter. */
      var subtractDeco = paintRomanJoin(exampleSubtractRoman, 'IV');
      exampleSubtractEquals.innerHTML = formatEquals(subtractDeco);
      var subtractDeco2 = paintRomanJoin(exampleSubtractRoman2, 'IX');
      exampleSubtractEquals2.innerHTML = formatEquals(subtractDeco2);
      /* Add rule: two examples for symmetry (VI with V, XI with X).
         XI is naturally a sum (X + I) — no I-before-X here — so the
         I keeps its blue colour and no subtract highlighting is
         applied. */
      var addDeco = paintRomanJoin(exampleAddRoman, 'VI');
      exampleAddEquals.innerHTML = formatEquals(addDeco);
      var addDeco2 = paintRomanJoin(exampleAddRoman2, 'XI');
      exampleAddEquals2.innerHTML = formatEquals(addDeco2);
    }

    return { paint: function () { paintSymbols(); paintRuleExamples(); } };
  };
})();
