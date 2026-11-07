/* ============================================================
   Calculia — Algebra: the generators: one per kind of question.
   ============================================================ */
(function () {
  'use strict';

  var M = App.AlgebraModel;
  var tileText = M.tileText, tileAria = M.tileAria, tilePile = M.tilePile, threeWritten = M.threeWritten,
      sidePlus = M.sidePlus, tileRect = M.tileRect, balance = M.balance, bags = M.bags, boxes = M.boxes,
      weights = M.weights, threeOf = M.threeOf, isSteady = M.isSteady, growthGraph = M.growthGraph,
      bagWeight = M.bagWeight, graph = M.graph;

  var GENERATORS = {

    /* A pile of pieces, written down. That writing is a polynomial, and
       it says nothing the pile does not already show. */
    readTiles: function (nv) {
      var t = App.utils.drawRound(nv.id, DATA.tiles);
      var right = { html: tileText(t), aria: tileAria(t) };
      /* Swapping the strips for the little ones, and losing the square,
         are the two mistakes the writing actually invites. */
      var swapped = { sq: t.sq, str: t.one, one: t.str };
      var noSquare = { sq: 0, str: t.str, one: t.one };
      var oneMore = { sq: t.sq, str: t.str + 1, one: t.one };
      var wrong = [swapped, noSquare, oneMore, { sq: t.sq + 1, str: t.str, one: t.one }]
        .filter(function (w) { return w.sq || w.str || w.one; })
        .map(function (w) { return { html: tileText(w), aria: tileAria(w) }; });
      return {
        prompt: App.i18n.t('gen.readTiles'),
        visual: '<div class="tile-stage">' + tilePile(t) + '</div>',
        visualAria: tileAria(t),
        legend: App.i18n.t('gen.tilesHint'),
        hint: App.i18n.t('gen.socraticReadTiles'),
        options: threeWritten(right, wrong),
        inline: true
      };
    },

    /* The same pieces put together into a square. Its side is x plus the
       little ones along one edge — which is the identity, seen whole
       instead of remembered. */
    squareSide: function (nv) {
      var a = App.utils.drawRound(nv.id, DATA.tileSquares);
      var right = sidePlus(a);
      return {
        prompt: App.i18n.t('gen.squareSide'),
        visual: '<div class="tile-stage">' + tileRect(a, a) + '</div>',
        /* What the picture is made of, so it is not the answer read out. */
        visualAria: tileAria({ sq: 1, str: 2 * a, one: a * a }),
        legend: App.i18n.t('gen.squareSideHint'),
        hint: App.i18n.t('gen.socraticSquareSide'),
        options: threeWritten(right, [
          { html: '2x', aria: App.i18n.t('gen.ariaTwoX') },
          sidePlus(a + 1),
          sidePlus(a + 2)
        ]),
        inline: true
      };
    },

    /* A rectangle whose height is x. Finding the other side out of the
       pieces is what dividing one of these by x, or factorising it,
       comes down to. */
    otherSide: function (nv) {
      var a = App.utils.drawRound(nv.id, DATA.tileRects);
      var right = sidePlus(a);
      return {
        prompt: App.i18n.t('gen.otherSide'),
        visual: '<div class="tile-stage tile-sided">' +
          '<span class="side-label">x</span>' + tileRect(a, 0) + '</div>',
        visualAria: tileAria({ sq: 1, str: a, one: 0 }),
        legend: App.i18n.t('gen.otherSideHint'),
        hint: App.i18n.t('gen.socraticOtherSide'),
        /* Reading the strips as a multiplier is the mistake: `a` of them
           along the side means x plus a, not a times x. */
        options: threeWritten(right, [
          { html: a + 'x', aria: App.i18n.t('gen.ariaTimesX').replace(/\{n\}/g, a) },
          sidePlus(a + 1),
          sidePlus(a - 1)
        ]),
        inline: true
      };
    },

    /* Two balances at once: that is what a system is. One says what the two
       together weigh, the other how much heavier one is. Both are on screen,
       so the pair that fits them both can be tried out by looking. */
    system: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.systems);
      var bag = (item.total + item.diff) / 2;
      var box = item.total - bag;
      var label = function (a, b) {
        return App.i18n.t('gen.pairLabel')
          .replace(/\{bag\}/g, a).replace(/\{box\}/g, b);
      };
      /* The near-miss pairs are the ones that satisfy ONE of the two
         balances but not the other, which is exactly the mistake a system
         produces. */
      var wrong = [[bag + 1, box - 1], [bag - 1, box + 1], [bag, box + 1]]
        .filter(function (p) {
          return p[0] > 0 && p[1] > 0 &&
            !(p[0] + p[1] === item.total && p[0] - p[1] === item.diff);
        });
      return {
        prompt: App.i18n.t('gen.system'),
        visual: '<div class="two-balances">' +
          balance(bags(1) + boxes(1), weights(item.total)) +
          '<span class="and-also">' + App.i18n.t('gen.andAlso') + '</span>' +
          balance(bags(1), boxes(1) + weights(item.diff)) +
          '</div>',
        visualAria: App.i18n.t('gen.systemAria')
          .replace(/\{total\}/g, item.total).replace(/\{diff\}/g, item.diff),
        legend: App.i18n.t('gen.systemHint'),
        hint: App.i18n.t('gen.socraticSystem'),
        options: App.utils.shuffle(
          [{ html: '<span class="pair-name">' + label(bag, box) + '</span>',
             aria: label(bag, box), correct: true }].concat(
            wrong.slice(0, 2).map(function (p) {
              return {
                html: '<span class="pair-name">' + label(p[0], p[1]) + '</span>',
                aria: label(p[0], p[1]), correct: false
              };
            })
          )),
        inline: true
      };
    },

    /* A balance that does NOT stay level: one side weighs more. That is a
       "greater than", and it is read off the tilt and the weights. */
    tilted: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.tilts);
      var leftHeavier = item.left > item.right;
      var first = App.i18n.t('gen.sideLeft');
      var second = App.i18n.t('gen.sideRight');
      return {
        prompt: App.i18n.t('gen.whichHeavier'),
        visual: '<div class="balance is-tilted-' + (leftHeavier ? 'left' : 'right') + '">' +
          '<div class="pan">' + weights(item.left) + '</div>' +
          '<div class="beam" aria-hidden="true">' + (leftHeavier ? '>' : '<') + '</div>' +
          '<div class="pan">' + weights(item.right) + '</div>' +
          '</div>',
        visualAria: App.i18n.t('gen.tiltAria')
          .replace(/\{left\}/g, item.left).replace(/\{right\}/g, item.right),
        legend: App.i18n.t('gen.tiltHint'),
        hint: App.i18n.t('gen.socraticTilted'),
        options: App.utils.shuffle([
          { html: '<span class="answer-name">' + first + '</span>', aria: first,
            correct: leftHeavier },
          { html: '<span class="answer-name">' + second + '</span>', aria: second,
            correct: !leftHeavier }
        ]),
        inline: true
      };
    },

    /* If x times x makes this many squares, how much is x? That is an
       equation of the second degree, asked as what it is. */
    squareEquation: function (nv) {
      var side = App.utils.drawRound(nv.id, DATA.squareSides);
      var total = side * side;
      var html = '<div class="square-stage"><span class="sq-of-x">';
      for (var r = 0; r < side; r++) {
        html += '<span class="sq-row">';
        for (var c = 0; c < side; c++) html += '<span class="sq-cell"></span>';
        html += '</span>';
      }
      return {
        prompt: App.i18n.t('gen.squareEquation').replace(/\{n\}/g, total),
        visual: html + '</span><span class="letter-expr">x × x = ' + total +
          '</span></div>',
        visualAria: App.i18n.t('gen.squareEqAria')
          .replace(/\{n\}/g, total).replace(/\{side\}/g, side),
        legend: App.i18n.t('gen.squareEqHint'),
        hint: App.i18n.t('gen.socraticSquareEquation'),
        /* Answering with the total, or with half of it, are the two real
           confusions. */
        options: threeOf(side, [total, Math.round(total / 2)])
      };
    },

    /* Does it grow by the same each step, or by more each time? The jumps
       are written between the bars, so the answer is read off the picture
       and not recalled. This is the difference between a straight line and
       a curve, without either word. */
    howItGrows: function (nv) {
      var g = App.utils.drawRound(nv.id, DATA.growths);
      var steady = isSteady(g.values);
      return {
        prompt: App.i18n.t('gen.howItGrows'),
        visual: growthGraph(g.values),
        visualAria: App.i18n.t('gen.growthAria').replace(/\{n\}/g, g.values.length),
        legend: App.i18n.t('gen.growthHint'),
        hint: App.i18n.t('gen.socraticHowItGrows'),
        options: App.utils.shuffle([true, false].map(function (v) {
          return {
            html: '<span class="trend-name">' +
              App.i18n.t(v ? 'grow.same' : 'grow.faster') + '</span>',
            aria: App.i18n.t(v ? 'grow.same' : 'grow.faster'),
            correct: v === steady
          };
        })),
        inline: true
      };
    },

    /* The other way round: which of the three climbs by the same each
       time. That one is the straight line. */
    pickStraight: function (nv) {
      var good = App.utils.drawRound(nv.id + 'yes', DATA.growths.filter(function (g) {
        return isSteady(g.values);
      }));
      var bad = App.utils.shuffle(DATA.growths.filter(function (g) {
        return !isSteady(g.values);
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.pickStraight'),
        legend: App.i18n.t('gen.growthHint'),
        hint: App.i18n.t('gen.socraticPickStraight'),
        options: App.utils.shuffle([good].concat(bad).map(function (g) {
          return {
            html: growthGraph(g.values, true),
            aria: App.i18n.t(isSteady(g.values) ? 'grow.same' : 'grow.faster'),
            correct: g === good
          };
        })),
        inline: true
      };
    },

    /* One bag and some weights on one side, weights on the other. What the
       bag weighs is what is missing. */
    onePlusWeights: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.simple);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchBag'),
        visual: balance(bags(1) + weights(item.add), weights(item.total)),
        visualAria: App.i18n.t('gen.balanceAria')
          .replace(/\{left\}/g, item.add).replace(/\{right\}/g, item.total),
        legend: App.i18n.t('gen.simpleHint'),
        hint: App.i18n.t('gen.socraticOnePlusWeights'),
        /* Answering with the whole side, or with the weights that are
           already there, are the two real confusions. */
        options: threeOf(answer, [item.total, item.add], App.i18n.t('gen.kilo'))
      };
    },

    /* Several bags, all the same. What one of them weighs is the total
       shared out between them. */
    manyBags: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.groups);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchEachBag').replace(/\{bags\}/g, item.bags),
        visual: balance(bags(item.bags), weights(item.total)),
        visualAria: App.i18n.t('gen.manyAria')
          .replace(/\{bags\}/g, item.bags).replace(/\{total\}/g, item.total),
        legend: App.i18n.t('gen.manyHint').replace(/\{bags\}/g, item.bags),
        hint: App.i18n.t('gen.socraticManyBags'),
        options: threeOf(answer, [item.total, item.bags], App.i18n.t('gen.kilo'))
      };
    },

    /* Weights on both sides: take the same off each and the bag is left
       alone. That is what solving an equation is, without the word. */
    bothSides: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.both);
      var answer = bagWeight(item);
      return {
        prompt: App.i18n.t('gen.howMuchBag'),
        visual: balance(bags(1) + weights(item.left), weights(item.right)),
        visualAria: App.i18n.t('gen.balanceAria')
          .replace(/\{left\}/g, item.left).replace(/\{right\}/g, item.right),
        legend: App.i18n.t('gen.bothHint'),
        hint: App.i18n.t('gen.socraticBothSides'),
        options: threeOf(answer, [item.right, item.left], App.i18n.t('gen.kilo'))
      };
    },

    /* A letter is the name of a number you do not know yet. Give it a
       value and everything else follows. */
    substitute: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.values);
      var answer = item.x * item.times;
      return {
        prompt: App.i18n.t('gen.substitute')
          .replace(/\{x\}/g, item.x).replace(/\{times\}/g, item.times),
        visual: '<div class="letter-stage">' +
          '<span class="letter-key">x = ' + item.x + '</span>' +
          '<span class="letter-expr">' + item.times + 'x</span></div>',
        visualAria: App.i18n.t('gen.substituteAria')
          .replace(/\{times\}/g, item.times).replace(/\{x\}/g, item.x),
        legend: App.i18n.t('gen.substituteHint').replace(/\{times\}/g, item.times),
        hint: App.i18n.t('gen.socraticSubstitute'),
        /* Adding instead of multiplying, and answering with the letter's
           own value, are the two real confusions. */
        options: threeOf(answer, [item.x + item.times, item.x])
      };
    },

    /* And how it is written down. The notation is the only new thing. */
    writeIt: function (nv) {
      /* Only how many bags there are is shown here, and several rows of
         DATA.values share that number: drawing the rows would hand out
         the very same question twice in a row. */
      var times = App.utils.drawRound(nv.id, DATA.values.map(function (v) {
        return v.times;
      }).filter(function (t, i, all) { return all.indexOf(t) === i; }));
      var right = times + 'x';
      var wrong = ['x' + times, 'x + ' + times];
      return {
        prompt: App.i18n.t('gen.writeIt').replace(/\{times\}/g, times),
        visual: '<div class="letter-stage"><span class="letter-expr">' +
          bags(times) + '</span></div>',
        visualAria: App.i18n.t('gen.writeItAria').replace(/\{times\}/g, times),
        legend: App.i18n.t('gen.writeItHint'),
        hint: App.i18n.t('gen.socraticWriteIt'),
        options: App.utils.shuffle([right].concat(wrong).map(function (s) {
          return {
            html: '<span class="letter-expr">' + s + '</span>',
            aria: s,
            correct: s === right
          };
        })),
        inline: true
      };
    },

    /* Reading a real graph: between these two hours, does it go up, down,
       or stay the same? */
    upOrDown: function (nv) {
      var series = App.utils.drawRound(nv.id, DATA.series);
      var i = App.utils.drawRound(nv.id + series.id, (function () {
        var list = [];
        for (var k = 1; k < series.values.length; k++) list.push(k);
        return list;
      }()));
      var before = series.values[i - 1];
      var after = series.values[i];
      var trend = after > before ? 'up' : (after < before ? 'down' : 'same');
      return {
        prompt: App.i18n.t('gen.upOrDown')
          .replace(/\{a\}/g, series.from + i - 1).replace(/\{b\}/g, series.from + i)
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        visual: graph(series, series.from + i - 1, series.from + i),
        visualAria: App.i18n.t('gen.graphAria')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        legend: App.i18n.t('gen.trendHint'),
        hint: App.i18n.t('gen.socraticUpOrDown'),
        options: App.utils.shuffle(['up', 'down', 'same'].map(function (k) {
          return {
            html: '<span class="trend-name">' + App.i18n.t('trend.' + k) + '</span>',
            aria: App.i18n.t('trend.' + k),
            correct: k === trend
          };
        })),
        inline: true
      };
    },

    /* And where the highest point is. */
    highestPoint: function (nv) {
      var series = App.utils.drawRound(nv.id, DATA.series);
      var top = Math.max.apply(Math, series.values);
      var at = series.from + series.values.indexOf(top);
      var others = App.utils.shuffle(series.values.map(function (v, i) {
        return series.from + i;
      }).filter(function (h) { return h !== at; })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.whenHighest')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        visual: graph(series, null, null),
        visualAria: App.i18n.t('gen.graphAria')
          .replace(/\{what\}/g, App.i18n.t('series.' + series.id)),
        legend: App.i18n.t('gen.highestHint'),
        hint: App.i18n.t('gen.socraticHighestPoint'),
        options: App.utils.shuffle([at].concat(others).map(function (h) {
          return {
            html: App.i18n.t('gen.hour').replace(/\{h\}/g, h),
            aria: App.i18n.t('gen.hour').replace(/\{h\}/g, h),
            correct: h === at
          };
        }))
      };
    }
  };

  App.AlgebraQuestions = {
    GENERATORS: GENERATORS
  };
})();
