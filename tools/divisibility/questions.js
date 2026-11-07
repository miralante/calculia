/* ============================================================
   Calculia — Divisibility: the generators: one per kind of question.
   ============================================================ */
(function () {
  'use strict';

  var M = App.DivisibilityModel;
  var pickOptions = M.pickOptions, superscript = M.superscript, yesNoOptions = M.yesNoOptions, dotsCount = M.dotsCount,
      rowsOf = M.rowsOf, numberCard = M.numberCard, digitSum = M.digitSum, PRIME_TESTS = M.PRIME_TESTS,
      isPrime = M.isPrime, lcm = M.lcm, cycles = M.cycles, gcd = M.gcd, bars = M.bars, squareGrid = M.squareGrid,
      negativePowerOf = M.negativePowerOf, minusPairs = M.minusPairs, signedOptions = M.signedOptions,
      powerChain = M.powerChain;

  var GENERATORS = {

    /* The cube root: the same idea as the square root in one more
       direction. The layers are drawn, so the side is counted. */
    cubeRoot: function (nv) {
      var side = App.utils.drawRound(nv.id, DATA.cubeSides);
      var cubes = side * side * side;
      var html = '<div class="layer-row">';
      for (var layer = 0; layer < side; layer++) {
        html += '<span class="cube-layer">';
        for (var r = 0; r < side; r++) {
          html += '<span class="dot-row">';
          for (var c = 0; c < side; c++) html += '<span class="cube-cell"></span>';
          html += '</span>';
        }
        html += '</span>';
      }
      return {
        prompt: App.i18n.t('gen.cubeRoot').replace(/\{n\}/g, cubes),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.cubeAria')
          .replace(/\{side\}/g, side).replace(/\{n\}/g, cubes),
        legend: App.i18n.t('gen.cubeHint'),
        hint: App.i18n.t('gen.socraticCubeRoot'),
        /* Answering with the layers' own size, or with the whole count, are
           the two real confusions. */
        options: pickOptions(side, [side * side, cubes])
      };
    },

    /* How many zeros a big round number carries. Nothing is calculated:
       the zeros are written out and counted. */
    howManyZeros: function (nv) {
      var big = App.utils.drawRound(nv.id, DATA.bigNumbers);
      var written = '1' + new Array(big.zeros + 1).join('0');
      return {
        prompt: App.i18n.t('gen.howManyZeros')
          .replace(/\{name\}/g, App.i18n.t('big.' + big.zeros)),
        visual: '<div class="calc-stage"><span class="long-number">' +
          written + '</span></div>',
        visualAria: App.i18n.t('gen.zerosAria').replace(/\{n\}/g, big.zeros),
        legend: App.i18n.t('gen.zerosHint'),
        hint: App.i18n.t('gen.socraticZeros'),
        options: pickOptions(big.zeros, DATA.bigNumbers.map(function (b) {
          return b.zeros;
        }))
      };
    },

    /* And the short way of writing it. A power of ten is just "one and
       that many zeros", so the short form can be matched to the long one
       by counting. */
    shortForm: function (nv) {
      var big = App.utils.drawRound(nv.id, DATA.bigNumbers);
      var written = '1' + new Array(big.zeros + 1).join('0');
      var others = App.utils.shuffle(DATA.bigNumbers.filter(function (b) {
        return b.zeros !== big.zeros;
      })).slice(0, 2);
      var shortOf = function (z) { return '10' + superscript(z); };
      return {
        prompt: App.i18n.t('gen.shortForm'),
        visual: '<div class="calc-stage"><span class="long-number">' +
          written + '</span></div>',
        visualAria: App.i18n.t('gen.zerosAria').replace(/\{n\}/g, big.zeros),
        legend: App.i18n.t('gen.shortHint'),
        hint: App.i18n.t('gen.socraticShortForm'),
        options: App.utils.shuffle([big].concat(others).map(function (b) {
          return {
            html: '<span class="short-number">' + shortOf(b.zeros) + '</span>',
            aria: App.i18n.t('gen.powerAria').replace(/\{n\}/g, b.zeros),
            correct: b.zeros === big.zeros
          };
        })),
        inline: true
      };
    },

    /* Does this length come out as a whole number of squares? The side of
       a square does; its diagonal never does. That is the first number
       that is not a fraction, shown rather than asserted. */
    exactOrNot: function (nv) {
      var side = App.utils.drawRound(nv.id, DATA.exacts);
      var askDiagonal = App.utils.drawRound(nv.id + 'which', [true, false]);
      var cells = '';
      for (var r = 0; r < side; r++) {
        cells += '<span class="dot-row">';
        for (var c = 0; c < side; c++) cells += '<span class="exact-cell"></span>';
        cells += '</span>';
      }
      var size = side * 26;
      var line = askDiagonal
        ? '<line x1="0" y1="' + size + '" x2="' + size + '" y2="0" class="measure-line"/>'
        : '<line x1="0" y1="' + size + '" x2="' + size + '" y2="' + size +
          '" class="measure-line"/>';
      return {
        prompt: App.i18n.t(askDiagonal ? 'gen.exactDiagonal' : 'gen.exactSide')
          .replace(/\{n\}/g, side),
        visual: '<div class="exact-stage"><span class="exact-grid">' + cells + '</span>' +
          '<svg viewBox="-2 -2 ' + (size + 4) + ' ' + (size + 4) + '" width="' + (size + 4) +
          '" height="' + (size + 4) + '" class="measure-svg" aria-hidden="true">' +
          line + '</svg></div>',
        visualAria: App.i18n.t(askDiagonal ? 'gen.diagonalAria' : 'gen.sideAria')
          .replace(/\{n\}/g, side),
        legend: App.i18n.t('gen.exactHint'),
        hint: App.i18n.t(askDiagonal ? 'gen.socraticExactDiagonal' : 'gen.socraticExactSide'),
        /* The side is exactly `side` squares; the diagonal falls between
           two marks and never lands on one. */
        options: yesNoOptions(!askDiagonal)
      };
    },

    /* Is it a multiple? The rows tell you: a short last row means no. */
    isMultiple: function (nv) {
      var base = App.utils.drawRound(nv.id + 'b', nv.bases);
      var n = App.utils.drawRound(nv.id + 'n', DATA.numbers);
      var yes = n % base === 0;
      return {
        prompt: App.i18n.t('gen.isMultiple')
          .replace(/\{n\}/g, n).replace(/\{base\}/g, base),
        visual: '<div class="calc-stage">' + dotsCount(n) + rowsOf(n, base, 1) + '</div>',
        visualAria: App.i18n.t('gen.rowsAria')
          .replace(/\{n\}/g, n).replace(/\{base\}/g, base),
        legend: App.i18n.t('gen.multipleHint'),
        hint: App.i18n.t('gen.socraticIsMultiple'),
        options: yesNoOptions(yes)
      };
    },

    /* The other way round: which of these three is a multiple. */
    pickMultiple: function (nv) {
      var base = App.utils.drawRound(nv.id + 'b', nv.bases);
      var good = App.utils.shuffle(DATA.numbers.filter(function (n) {
        return n % base === 0;
      }))[0];
      var bad = App.utils.shuffle(DATA.numbers.filter(function (n) {
        return n % base !== 0;
      })).slice(0, 2);
      return {
        prompt: App.i18n.t('gen.whichMultiple').replace(/\{base\}/g, base),
        visual: '<div class="calc-stage">' + numberCard(base, false) + '</div>',
        visualAria: String(base),
        legend: App.i18n.t('gen.multipleHint'),
        hint: App.i18n.t('gen.socraticPickMultiple'),
        options: App.utils.shuffle([good].concat(bad).map(function (n) {
          return { html: String(n), correct: n === good };
        }))
      };
    },

    /* The shortcuts. Each rule is spelled out in the hint, and what the
       rule looks at is highlighted in the number. */
    criterion: function (nv) {
      var rule = App.utils.drawRound(nv.id + 'r', DATA.criteria.filter(function (c) {
        return nv.which.indexOf(c.id) !== -1;
      }));
      var n = App.utils.drawRound(nv.id + 'n', DATA.criteriaNumbers);
      var yes = n % rule.divisor === 0;
      var digits = rule.id === 'by3';
      return {
        /* The rule is the title; the question and the number it is about come below. */
        title: App.i18n.t('rule.' + rule.id),
        prompt: App.i18n.t('gen.divides')
          .replace(/\{n\}/g, n).replace(/\{d\}/g, rule.divisor),
        visual: '<div class="calc-stage">' + numberCard(n, !digits) +
          (digits ? '<span class="digit-sum">' + String(n).split('').join(' + ') +
            ' = ' + digitSum(n) + '</span>' : '') + '</div>',
        visualAria: String(n),
        hint: App.i18n.t('gen.socraticCriterion'),
        options: yesNoOptions(yes)
      };
    },

    /* Integer division: the full rows are the groups, and the short last
       row, if there is one, is what is left over. The wrong answers are
       the mistakes people make: swapping the two numbers, counting one
       group too many, or leaving a remainder bigger than the group. */
    intDivision: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.divisionPairs);
      var n = pair.n;
      var d = pair.d;
      var q = Math.floor(n / d);
      var r = n % d;
      var seen = {};
      seen[q + ' ' + r] = true;
      var wrong = [[r, q], [q + 1, 0], [q, r + d], [q - 1, r + d]].filter(function (c) {
        var key = c[0] + ' ' + c[1];
        if (c[0] < 0 || c[1] < 0 || seen[key]) return false;
        seen[key] = true;
        return true;
      }).slice(0, 3);
      return {
        prompt: App.i18n.t('gen.intDivision').replace(/\{n\}/g, n).replace(/\{d\}/g, d),
        visual: '<div class="calc-stage">' + dotsCount(n) + rowsOf(n, d, 1) + '</div>',
        visualAria: App.i18n.t('gen.intDivisionAria').replace(/\{n\}/g, n).replace(/\{d\}/g, d),
        legend: App.i18n.t('gen.intDivisionLegend'),
        hint: App.i18n.t('gen.socraticIntDivision').replace(/\{n\}/g, n).replace(/\{d\}/g, d),
        options: App.utils.shuffle([[q, r]].concat(wrong).map(function (c) {
          return {
            html: '<span class="answer-name">' + App.i18n.t('gen.quotRem')
              .replace('{q}', c[0]).replace('{r}', c[1]) + '</span>',
            correct: c[0] === q && c[1] === r
          };
        }))
      };
    },

    /* Prime or not, decided by trying to build the rows. Every attempt is
       on screen, so the answer is "none of them came out even". */
    isPrime: function (nv) {
      var n = App.utils.drawRound(nv.id, DATA.primeCandidates);
      var tries = PRIME_TESTS.filter(function (t) { return t < n; });
      var html = '<div class="try-stage">';
      tries.forEach(function (t) {
        var fits = n % t === 0;
        html += '<span class="try' + (fits ? ' is-fit' : '') + '">' +
          '<span class="try-label">' + App.i18n.t('gen.inRowsOf').replace(/\{n\}/g, n).replace(/\{t\}/g, t) +
          ' <span class="try-verdict" aria-hidden="true">' + (fits ? '✔' : '✖') + '</span></span>' +
          rowsOf(n, t, fits ? 1 : 2) + '</span>';
      });
      return {
        prompt: App.i18n.t('gen.isPrime').replace(/\{n\}/g, n),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.triesAria').replace(/\{n\}/g, n),
        legend: App.i18n.t('gen.primeHint'),
        hint: App.i18n.t('gen.socraticIsPrime'),
        options: yesNoOptions(isPrime(n))
      };
    },

    /* Every how often do the two meet. The star marks the first time. */
    lcm: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.cyclePairs);
      var meet = lcm(pair.a, pair.b);
      return {
        prompt: App.i18n.t('gen.meetEvery')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        visual: cycles(pair.a, pair.b, meet),
        visualAria: App.i18n.t('gen.cyclesAria')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        legend: App.i18n.t('gen.meetHint'),
        hint: App.i18n.t('gen.socraticLcm'),
        /* Adding the two is the mistake this teaches about, and it is only
           a wrong answer when it is not the real meeting point. */
        options: pickOptions(meet, [pair.a + pair.b, meet + pair.a, meet - pair.a])
      };
    },

    /* The biggest chunk that fits exactly in both. */
    gcd: function (nv) {
      var pair = App.utils.drawRound(nv.id, DATA.commonPairs);
      var best = gcd(pair.a, pair.b);
      /* A smaller chunk that also fits, and one that does not fit either:
         both are the real confusions here. */
      var smaller = 0;
      for (var d = best - 1; d > 1; d--) {
        if (pair.a % d === 0 && pair.b % d === 0) { smaller = d; break; }
      }
      var misfit = 0;
      for (var m = 2; m <= Math.min(pair.a, pair.b); m++) {
        if (pair.a % m !== 0 || pair.b % m !== 0) { misfit = m; break; }
      }
      return {
        prompt: App.i18n.t('gen.biggestChunk')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        visual: bars(pair.a, pair.b),
        visualAria: App.i18n.t('gen.barsAria')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        legend: App.i18n.t('gen.chunkHint'),
        hint: App.i18n.t('gen.socraticGcd'),
        options: pickOptions(best, [smaller, misfit, best + 1])
      };
    },

    /* The power as a square you can count. */
    square: function (nv) {
      var side = App.utils.drawRound(nv.id, DATA.squareSides);
      return {
        prompt: App.i18n.t('gen.squareOf').replace(/\{n\}/g, side),
        visual: '<div class="calc-stage">' + squareGrid(side) + '</div>',
        visualAria: App.i18n.t('gen.squareAria').replace(/\{n\}/g, side),
        legend: App.i18n.t('gen.squareHint').replace(/\{n\}/g, side),
        hint: App.i18n.t('gen.socraticSquare'),
        options: pickOptions(side * side, [side + side, side * side - side, side * side + side])
      };
    },

    /* A negative number multiplied by itself. Every factor puts one minus
       on the table; they cancel two at a time, and if one is left over the
       answer ends up on the other side of zero. */
    negativePower: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.negPowers);
      var answer = negativePowerOf(item.base, item.n);
      var written = [];
      for (var i = 0; i < item.n; i++) written.push('(−' + item.base + ')');
      return {
        prompt: App.i18n.t('gen.negativePower')
          .replace(/\{times\}/g, item.n).replace(/\{base\}/g, item.base),
        visual: '<div class="calc-stage"><p class="long-number">' +
          written.join(' × ') + '</p>' + minusPairs(item.n) + '</div>',
        visualAria: App.i18n.t('gen.negativeAria')
          .replace(/\{base\}/g, item.base).replace(/\{times\}/g, item.n),
        legend: App.i18n.t('gen.negativeHint'),
        hint: App.i18n.t('gen.socraticNegativePower'),
        /* Getting the size right and the side of zero wrong is the whole
           mistake here, so the same number with the other sign is offered.
           Multiplying the base by the count instead is the other one. */
        options: signedOptions(answer,
          [-answer, item.base * item.n, -item.base * item.n])
      };
    },

    /* How many times a number was multiplied by itself to get here. That
       count is what the index of a root says, and it is counted off the
       chain — which works for four times or six, not only two or three. */
    rootIndex: function (nv) {
      var item = App.utils.drawRound(nv.id, DATA.powerChains);
      var result = Math.pow(item.base, item.n);
      return {
        prompt: App.i18n.t('gen.rootIndex')
          .replace(/\{base\}/g, item.base).replace(/\{n\}/g, result),
        visual: '<div class="calc-stage">' + powerChain(item.base, item.n) + '</div>',
        visualAria: App.i18n.t('gen.chainAria')
          .replace(/\{base\}/g, item.base).replace(/\{times\}/g, item.n),
        legend: App.i18n.t('gen.chainHint').replace(/\{base\}/g, item.base),
        hint: App.i18n.t('gen.socraticRootIndex'),
        /* Counting the boxes instead of the arrows between them gives one
           too many, which is what a chain actually produces. */
        options: pickOptions(item.n, [item.n + 1, item.n - 1, item.base])
      };
    },

    /* And the root as its side. */
    root: function (nv) {
      var side = App.utils.drawRound(nv.id, DATA.squareSides);
      return {
        prompt: App.i18n.t('gen.rootOf').replace(/\{n\}/g, side * side),
        visual: '<div class="calc-stage">' + squareGrid(side) + '</div>',
        visualAria: App.i18n.t('gen.squareAria').replace(/\{n\}/g, side),
        legend: App.i18n.t('gen.rootHint'),
        hint: App.i18n.t('gen.socraticRoot'),
        options: pickOptions(side, [side - 1, side + 1, side * 2])
      };
    }
  };

  App.DivisibilityQuestions = {
    GENERATORS: GENERATORS
  };
})();
