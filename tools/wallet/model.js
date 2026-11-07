/* ============================================================
   Calculia — Wallet: the product bank, the pairs of amounts and the distractors.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  function localeData() { return DATA[App.i18n.locale()] || DATA.es; }
  var pick = App.utils.pick;

  /* ---- Screens ---- */
  var SCREENS = ['screenMenu', 'screenQuizGame',
    'screenPayGame', 'screenEnd'];
  function show(id) {
    SCREENS.forEach(function (p) { $('#' + p).classList.add('hidden'); });
    $('#' + id).classList.remove('hidden');
  }

  /* ============================================================
     Money: shared module App.dinero (assets/js/dinero.js)
     ============================================================ */
  var format = App.dinero.format;
  var spoken = App.dinero.spoken;
  var ariaMoney = App.dinero.aria;
  var createToken = App.dinero.createToken;
  var breakdown = App.dinero.breakdown;
  var breakdownText = App.dinero.breakdownText;

  /* Paints decorative tokens on the table (hidden if empty). */
  function paintTable(pieces) {
    var tableEl = $('#moneyTable');
    App.dinero.paintTokens(tableEl, pieces);
    tableEl.classList.toggle('hidden', !pieces || !pieces.length);
  }

  /* ============================================================
     Case generators (infinite variety, zero authoring)
     ============================================================ */

  /* All products from the bank, in the active locale. */
  function allProducts() {
    return localeData().pay.levels.reduce(function (list, n) {
      return list.concat(n.products);
    }, []);
  }

  /* Is the amount in the step's "bucket"? (a level's amounts
     don't fall into the previous level, like in Pay exactly). */
  function inBucket(cent, step) {
    if (step === 100) return cent % 100 === 0;
    if (step === 50) return cent % 50 === 0 && cent % 100 !== 0;
    return cent % 10 === 0 && cent % 50 !== 0;
  }

  /* Amounts in the bucket strictly between min and max. */
  function gapAmounts(min, max, step) {
    var list = [];
    for (var v = step; v < max; v += step) {
      if (v > min && inBucket(v, step)) list.push(v);
    }
    return list;
  }

  /* Pair (price, paid): paid is the only amount that's enough and
     the change is never zero. Shared by payWith and change. */
  function generatePair(step) {
    var pairs = [[200, 100], [500, 200], [1000, 500]];   /* [paid, lower] */
    var candidates = [];
    pairs.forEach(function (pair) {
      var prices = gapAmounts(pair[1], pair[0], step);
      if (prices.length) candidates.push({ paid: pair[0], lower: pair[1], prices: prices });
    });
    var c = pick(candidates);
    return { paid: c.paid, lower: c.lower, price: pick(c.prices) };
  }

  /* Amount distractors: close, distinct, positive. */
  function amountDistractors(correct, step) {
    var list = [];
    App.utils.shuffle([step, 100, step * 2]).forEach(function (d) {
      [correct + d, correct - d].forEach(function (x) {
        if (x > 0 && x !== correct && list.indexOf(x) === -1 && list.length < 2) list.push(x);
      });
    });
    while (list.length < 2) list.push(correct + (list.length + 1) * step);
    return list;
  }

  App.WalletModel = {
    localeData: localeData,
    show: show,
    format: format,
    spoken: spoken,
    ariaMoney: ariaMoney,
    createToken: createToken,
    paintTable: paintTable,
    pick: pick,
    breakdownText: breakdownText,
    generatePair: generatePair,
    allProducts: allProducts,
    breakdown: breakdown,
    amountDistractors: amountDistractors
  };
})();
