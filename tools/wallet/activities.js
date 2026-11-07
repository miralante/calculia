/* ============================================================
   Calculia — Wallet: the activities: their steps, levels and texts.
   ============================================================ */
(function () {
  'use strict';

  var M = App.WalletModel;
  var localeData = M.localeData, pick = M.pick, format = M.format, breakdownText = M.breakdownText,
      generatePair = M.generatePair, allProducts = M.allProducts, spoken = M.spoken, paintTable = M.paintTable,
      breakdown = M.breakdown, amountDistractors = M.amountDistractors;

  /* ============================================================
     Activity configuration (▶ add new ones here)
     ============================================================ */
  var ACTIVITIES = {

    /* --- How much is there? — count the money on the table ---
       Half the rounds are visual (table shown); the other half are
       audio-only (no table, the breakdown is read aloud). On the
       first failure of an audio round, the table is shown as a
       hint so the user is never left without a way to count. */
    count: {
      isQuiz: true,
      instruction: 'instructionCount',
      summary: 'countSummary',
      levels: function () { return localeData().count.levels; },
      generate: function (level) {
        var n = 2 + Math.floor(Math.random() * 3);
        var pieces = [];
        var total = 0;
        for (var k = 0; k < n; k++) {
          var v = pick(level.cents);
          pieces.push(v);
          total += v;
        }
        pieces.sort(function (a, b) { return b - a; });
        var distractors = [];
        App.utils.shuffle(level.cents).forEach(function (d) {
          [total + d, total - d].forEach(function (x) {
            if (x > 0 && x !== total && distractors.indexOf(x) === -1 && distractors.length < 2) {
              distractors.push(x);
            }
          });
        });
        while (distractors.length < 2) {
          distractors.push(total + (distractors.length + 1) * level.cents[0]);
        }
        return {
          pieces: pieces,
          total: total,
          amounts: App.utils.shuffle([total].concat(distractors)),
          noTable: false
        };
      },
      prompt: function () { return App.i18n.t('countPrompt'); },
      table: function (c) { return c.pieces; },
      options: function (c) {
        return c.amounts.map(function (cent) {
          return { text: format(cent), correct: cent === c.total };
        });
      },
      hint: function () { return App.i18n.t('countHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'correctExplanation' : 'almostExplanation')
          .replace('{d}', breakdownText(c.pieces))
          .replace('{total}', format(c.total));
      }
    },

    /* --- What do I pay with? — choose the money that's enough --- */
    payWith: {
      isQuiz: true,
      optionKind: 'token',
      instruction: 'instructionPayWith',
      summary: 'payWithSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        var pair = generatePair(level.step);
        var product = pick(allProducts());
        var lowers = [500, 200, 100, 50].filter(function (c) { return c < pair.lower; });
        var options = App.utils.shuffle([
          { cent: pair.paid, correct: true },
          { cent: pair.lower, correct: false },
          { cent: pick(lowers), correct: false }
        ]);
        return {
          picto: product.picto,
          name: product.name,
          price: pair.price,
          paid: pair.paid,
          change: pair.paid - pair.price,
          list: options
        };
      },
      prompt: function (c) {
        return c.picto + ' ' + App.i18n.t('payWithPrompt')
          .replace('{name}', c.name)
          .replace('{precio}', format(c.price));
      },
      table: function () { return null; },
      options: function (c) { return c.list; },
      hint: function () { return App.i18n.t('payWithHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'payCorrectExplanation' : 'payAlmostExplanation')
          .replace('{pagado}', spoken(c.paid))
          .replace('{cambio}', format(c.change));
      },
      /* When resolved, the change appears as tokens on the table:
         connects paying with the physical change. */
      onResolve: function (c) { paintTable(breakdown(c.change)); }
    },

    /* --- Is the change correct? — verify what's given back --- */
    change: {
      isQuiz: true,
      instruction: 'instructionCheckChange',
      summary: 'changeSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        var pair = generatePair(level.step);
        var right = pair.paid - pair.price;
        var isRight = Math.random() < 0.5;
        var shown = right;
        if (!isRight) {
          var deltas = App.utils.shuffle([level.step, -level.step, 100, -100]);
          for (var k = 0; k < deltas.length; k++) {
            var m = right + deltas[k];
            if (m > 0 && m !== right) { shown = m; break; }
          }
        }
        return { price: pair.price, paid: pair.paid, right: right, shown: shown, isRight: shown === right };
      },
      prompt: function (c) {
        return App.i18n.t('changePrompt')
          .replace('{precio}', format(c.price))
          .replace('{pagado}', spoken(c.paid));
      },
      table: function (c) { return breakdown(c.shown); },
      /* Yes/No in fixed (natural) order, not shuffled. */
      options: function (c) {
        return [
          { text: App.i18n.t('answerYes'), correct: c.isRight },
          { text: App.i18n.t('answerNo'), correct: !c.isRight }
        ];
      },
      hint: function () { return App.i18n.t('changeHint'); },
      explanation: function (c) {
        var key = c.isRight ? 'changeCorrectExplanation' :
          (c.shown < c.right ? 'changeShortExplanation' : 'changeOverExplanation');
        return App.i18n.t(key)
          .replace('{bueno}', format(c.right))
          .replace('{mostrado}', format(c.shown));
      }
    },

    /* --- The Piggy Bank — how much is left to buy it? --- */
    piggyBank: {
      isQuiz: true,
      instruction: 'instructionPiggyBank',
      summary: 'piggyBankSummary',
      levels: function () { return localeData().amount.levels; },
      generate: function (level) {
        /* Targets: the PRODUCTS bank for the level's bucket. */
        var bank = localeData().pay.levels.filter(function (n) { return n.id === level.id; })[0];
        var candidates = bank.products.filter(function (p) { return p.priceCent >= 2 * level.step; });
        var product = pick(candidates);
        var steps = product.priceCent / level.step;
        var have = level.step * (1 + Math.floor(Math.random() * (steps - 1)));
        var missing = product.priceCent - have;
        var options = App.utils.shuffle([missing].concat(amountDistractors(missing, level.step)));
        return {
          picto: product.picto,
          name: product.name,
          price: product.priceCent,
          have: have,
          missing: missing,
          amounts: options
        };
      },
      prompt: function (c) {
        var name = c.name.charAt(0).toLowerCase() + c.name.slice(1);
        return c.picto + ' ' + App.i18n.t('piggyBankPrompt')
          .replace('{name}', name)
          .replace('{precio}', format(c.price));
      },
      table: function (c) { return breakdown(c.have); },
      options: function (c) {
        return c.amounts.map(function (cent) {
          return { text: format(cent), correct: cent === c.missing };
        });
      },
      hint: function () { return App.i18n.t('piggyBankHint'); },
      explanation: function (c, right) {
        return App.i18n.t(right ? 'piggyBankCorrectExplanation' : 'piggyBankAlmostExplanation')
          .replace('{precio}', format(c.price))
          .replace('{tienes}', format(c.have))
          .replace('{falta}', format(c.missing));
      }
    },

    /* --- More or less — mental rounding ("costs about 3 €") --- */
    rounding: {
      isQuiz: true,
      instruction: 'instructionRounding',
      summary: 'roundingSummary',
      levels: function () { return localeData().rounding.levels; },
      generate: function (level) {
        var target = 2 + Math.floor(Math.random() * 8);   /* 2-9 € */
        var delta = pick(level.deltas);
        /* The ,50 always below the target: x,50 rounds UP to x+1. */
        var sign = delta === 50 ? -1 : pick([-1, 1]);
        var shown = target * 100 + sign * delta;
        /* Flavoured product with a nearby reference price. */
        var close = allProducts().filter(function (p) {
          return Math.abs(p.priceCent - shown) <= 150;
        });
        var product = pick(close.length ? close : allProducts());
        return {
          picto: product.picto,
          name: product.name,
          shown: shown,
          target: target,
          isHalf: delta === 50,
          candidates: [target - 1, target, target + 1]
        };
      },
      prompt: function (c) {
        return c.picto + ' ' + App.i18n.t('roundingPrompt')
          .replace('{name}', c.name)
          .replace('{precio}', format(c.shown));
      },
      table: function () { return null; },
      /* Three consecutive euros, in order (no shuffle: this is a
         number line, not a distraction quiz). */
      options: function (c) {
        return c.candidates.map(function (n) {
          return { text: App.i18n.t('aboutEuros').replace('{n}', n), correct: n === c.target };
        });
      },
      hint: function () { return App.i18n.t('roundingHint'); },
      explanation: function (c, right) {
        var key = c.isHalf ?
          (right ? 'roundingHalfCorrectExplanation' : 'roundingHalfAlmostExplanation') :
          (right ? 'roundingCorrectExplanation' : 'roundingAlmostExplanation');
        return App.i18n.t(key)
          .replace('{precio}', format(c.shown))
          .replace(/\{n\}/g, c.target);
      }
    },

    /* --- Pay exactly — interactive, outside the runner --- */
    pay: {
      isQuiz: false,
      instruction: 'payInstruction',
      summary: 'paySummary',
      levels: function () { return localeData().pay.levels; }
    }
  };

  App.WalletActivities = {
    ACTIVITIES: ACTIVITIES
  };
})();
