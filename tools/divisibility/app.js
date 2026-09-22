/* ============================================================
   Calculia — Grupos exactos
   Data and levels in data.js. Shared modules in assets/js/.
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'divisibility';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');

  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var pools = {};
  /* Reinforcement: see core in assets/js/feedback.js (App.reinforce). */
  var inReinforce = false;
  var reinforceList = [];
  var reinforceIndex = 0;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }

  /* ---- Everything is worked out, nothing is stored ---- */
  var PRIME_TESTS = [2, 3, 5];

  function isPrime(n) {
    if (n < 2) return false;
    for (var i = 0; i < PRIME_TESTS.length; i++) {
      var t = PRIME_TESTS[i];
      if (n !== t && n % t === 0) return false;
    }
    return true;
  }
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function lcm(a, b) { return (a * b) / gcd(a, b); }
  function digitSum(n) {
    return String(n).split('').reduce(function (s, d) { return s + Number(d); }, 0);
  }

  /* ---- Data invariants, loud at start-up ---- */
  DATA.primeCandidates.forEach(function (n) {
    /* Above 25 the 2-3-5 test stops being enough, and the activity would
       call a composite number prime. */
    if (n > 25) {
      throw new Error('divisibility: ' + n + ' is past what testing 2, 3 and 5 can decide');
    }
  });
  if (!DATA.primeCandidates.some(isPrime) ||
      !DATA.primeCandidates.some(function (n) { return !isPrime(n); })) {
    throw new Error('divisibility: the prime list needs both primes and composites');
  }
  DATA.cyclePairs.forEach(function (p) {
    if (lcm(p.a, p.b) > DATA.timeline) {
      throw new Error('divisibility: ' + p.a + ' and ' + p.b + ' meet past the timeline');
    }
  });
  DATA.commonPairs.forEach(function (p) {
    if (gcd(p.a, p.b) < 2) {
      throw new Error('divisibility: ' + p.a + ' and ' + p.b + ' share nothing but 1');
    }
  });
  DATA.negPowers.forEach(function (i) {
    if (i.n < 2) {
      throw new Error('divisibility: ' + i.base + ' to the ' + i.n + ' is not a power');
    }
    /* Past three figures the number stops being something to hold on to,
       and the sign — which is what this level is for — gets lost in it. */
    if (Math.pow(i.base, i.n) > 999) {
      throw new Error('divisibility: ' + i.base + ' to the ' + i.n + ' is too big to read');
    }
  });
  /* Both sides of zero have to turn up, or the level would teach one
     answer rather than the rule that decides it. */
  [true, false].forEach(function (wantEven) {
    if (!DATA.negPowers.some(function (i) { return (i.n % 2 === 0) === wantEven; })) {
      throw new Error('divisibility: no negative power with an ' +
        (wantEven ? 'even' : 'odd') + ' number of minus signs');
    }
  });
  DATA.powerChains.forEach(function (i) {
    if (i.n < 2 || i.base < 2) {
      throw new Error('divisibility: a chain of ' + i.base + ' taken ' + i.n +
        ' times has nothing to count');
    }
    if (Math.pow(i.base, i.n) > 999) {
      throw new Error('divisibility: the chain of ' + i.base + ' to the ' + i.n +
        ' runs off the screen');
    }
  });

  /* ---- Utilities ---- */

  /* Takes elements from a list without repeating within the round. */
  function draw(key, list) {
    var p = pools[key];
    if (!p || p.i >= p.orden.length) {
      var fresh = App.utils.shuffle(list);
      /* When the bag is refilled, its first item must not be the one just
         handed out: two identical questions in a row read as a "Siguiente"
         button that does nothing. */
      if (p && fresh.length > 1 && fresh[0] === p.last) {
        var swap = fresh[1];
        fresh[1] = fresh[0];
        fresh[0] = swap;
      }
      p = pools[key] = { orden: fresh, i: 0, last: p ? p.last : null };
    }
    p.last = p.orden[p.i];
    return p.orden[p.i++];
  }

  function yesNoOptions(isYes) {
    return App.utils.shuffle([true, false].map(function (v) {
      return {
        html: '<span class="answer-name">' + App.i18n.t(v ? 'answer.yes' : 'answer.no') + '</span>',
        aria: App.i18n.t(v ? 'answer.yes' : 'answer.no'),
        correct: v === isYes
      };
    }));
  }

  /* Options from candidates, keeping them distinct and positive. */
  function pickOptions(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.forEach(function (v) {
      if (v > 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    var extra = correct + 1;
    while (list.length < 3) {
      if (!seen[extra]) { seen[extra] = true; list.push(extra); }
      extra += 1;
    }
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), correct: v === correct };
    });
  }

  /* ---- The pictures ----
     A number in rows of another number: if the last row comes out short,
     it is not a multiple, and that can be seen without dividing. */
  function rowsOf(n, per, tone) {
    var html = '<span class="row-stack' + (tone ? ' tone-' + tone : '') + '">';
    var left = n;
    while (left > 0) {
      var take = Math.min(per, left);
      html += '<span class="dot-row' + (take < per ? ' is-short' : '') + '">';
      for (var i = 0; i < take; i++) html += '<span class="dot"></span>';
      html += '</span>';
      left -= take;
    }
    return html + '</span>';
  }

  function numberCard(n, markLast) {
    var s = String(n);
    if (!markLast) return '<span class="big-number">' + s + '</span>';
    return '<span class="big-number">' + s.slice(0, -1) +
      '<span class="last-digit">' + s.slice(-1) + '</span></span>';
  }

  /* A square drawn square: the power and its root are both countable. */
  /* ---- A negative number multiplied by itself ----
     Nothing about the sign is stored: the minus signs are drawn one per
     factor and paired off two by two, and whether one is left over is what
     decides the side of zero. Pairs are boxed as well as tinted, so the
     pairing is visible without any colour (WCAG 1.4.1). */
  function minusPairs(n) {
    var html = '<span class="minus-row">';
    var pairs = Math.floor(n / 2);
    for (var i = 0; i < pairs; i++) {
      html += '<span class="minus-pair"><span class="minus">−</span>' +
        '<span class="minus">−</span></span>';
    }
    if (n % 2) html += '<span class="minus-pair is-lonely"><span class="minus">−</span></span>';
    return html + '</span>';
  }

  function negativePowerOf(base, n) {
    var size = Math.pow(base, n);
    return n % 2 === 0 ? size : -size;
  }

  /* ---- A chain of multiplying ----
     Start at one and multiply by the same number again and again. How many
     times you did it is exactly what the index of a root says, and it can
     be counted for any number of times, not just two or three. */
  function powerChain(base, n) {
    var html = '<span class="chain">';
    var value = 1;
    for (var i = 0; i <= n; i++) {
      if (i > 0) {
        html += '<span class="chain-step" aria-hidden="true">×' + base + '</span>';
        value *= base;
      }
      html += '<span class="chain-box">' + value + '</span>';
    }
    return html + '</span>';
  }

  /* Options that may be negative, so the side of zero is a real choice. */
  function signedOptions(correct, candidates) {
    var seen = {};
    var list = [correct];
    seen[correct] = true;
    candidates.forEach(function (v) {
      if (v !== 0 && !seen[v] && list.length < 3) { seen[v] = true; list.push(v); }
    });
    var extra = Math.abs(correct) + 1;
    while (list.length < 3) {
      if (!seen[extra]) { seen[extra] = true; list.push(extra); }
      extra += 1;
    }
    return App.utils.shuffle(list).map(function (v) {
      return { html: String(v), aria: String(v), correct: v === correct };
    });
  }

  function squareGrid(side) {
    var html = '<span class="square-grid">';
    for (var r = 0; r < side; r++) {
      html += '<span class="dot-row">';
      for (var c = 0; c < side; c++) html += '<span class="cell"></span>';
      html += '</span>';
    }
    return html + '</span>';
  }

  /* Two things that repeat, on the same timeline. The first column where
     both land is marked, so "every how often do they meet" is read off the
     picture. */
  function cycles(a, b, meetAt) {
    function line(step, tone) {
      var html = '<span class="cycle-line tone-' + tone + '">';
      for (var t = 1; t <= DATA.timeline; t++) {
        var on = t % step === 0;
        html += '<span class="tick' + (on ? ' is-on' : '') +
          (on && t === meetAt ? ' is-meet' : '') + '">' +
          (t === meetAt ? '<span class="meet-mark" aria-hidden="true">★</span>' : '') +
          '</span>';
      }
      return html + '</span>';
    }
    return '<div class="cycle-stage">' + line(a, 1) + line(b, 2) + '</div>';
  }

  /* Two lengths side by side, each with its units marked so the chunk that
     fits in both can be counted rather than recalled. */
  function bars(a, b) {
    function bar(len, tone) {
      var html = '<span class="length-bar tone-' + tone + '">';
      for (var i = 0; i < len; i++) html += '<span class="unit"></span>';
      return html + '<span class="bar-len">' + len + '</span></span>';
    }
    return '<div class="bar-stage">' + bar(a, 1) + bar(b, 2) + '</div>';
  }

  /* A power written small, the way it is written everywhere else. Only the
     digits that actually turn up here are mapped, and a missing one would
     be loud rather than silently printing nothing. */
  var SUPER = { 0: '\u2070', 1: '\u00b9', 2: '\u00b2', 3: '\u00b3', 4: '\u2074',
    5: '\u2075', 6: '\u2076', 7: '\u2077', 8: '\u2078', 9: '\u2079' };

  function superscript(n) {
    return String(n).split('').map(function (d) {
      if (!SUPER[d]) throw new Error('divisibility: no small digit for "' + d + '"');
      return SUPER[d];
    }).join('');
  }

  /* Cubes are drawn layer by layer, so anything past what fits on screen
     would stop being countable. */
  DATA.cubeSides.forEach(function (side) {
    if (side * side * side > 64) {
      throw new Error('divisibility: a cube of ' + side + ' cannot be counted on screen');
    }
  });

  var GENERATORS = {

    /* The cube root: the same idea as the square root in one more
       direction. The layers are drawn, so the side is counted. */
    cubeRoot: function (nv) {
      var side = draw(nv.id, DATA.cubeSides);
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
        /* Answering with the layers' own size, or with the whole count, are
           the two real confusions. */
        options: pickOptions(side, [side * side, cubes])
      };
    },

    /* How many zeros a big round number carries. Nothing is calculated:
       the zeros are written out and counted. */
    howManyZeros: function (nv) {
      var big = draw(nv.id, DATA.bigNumbers);
      var written = '1' + new Array(big.zeros + 1).join('0');
      return {
        prompt: App.i18n.t('gen.howManyZeros')
          .replace(/\{name\}/g, App.i18n.t('big.' + big.zeros)),
        visual: '<div class="calc-stage"><span class="long-number">' +
          written + '</span></div>',
        visualAria: App.i18n.t('gen.zerosAria').replace(/\{n\}/g, big.zeros),
        legend: App.i18n.t('gen.zerosHint'),
        options: pickOptions(big.zeros, DATA.bigNumbers.map(function (b) {
          return b.zeros;
        }))
      };
    },

    /* And the short way of writing it. A power of ten is just "one and
       that many zeros", so the short form can be matched to the long one
       by counting. */
    shortForm: function (nv) {
      var big = draw(nv.id, DATA.bigNumbers);
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
      var side = draw(nv.id, DATA.exacts);
      var askDiagonal = draw(nv.id + 'which', [true, false]);
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
        /* The side is exactly `side` squares; the diagonal falls between
           two marks and never lands on one. */
        options: yesNoOptions(!askDiagonal)
      };
    },


    /* Is it a multiple? The rows tell you: a short last row means no. */
    isMultiple: function (nv) {
      var base = draw(nv.id + 'b', nv.bases);
      var n = draw(nv.id + 'n', DATA.numbers);
      var yes = n % base === 0;
      return {
        prompt: App.i18n.t('gen.isMultiple')
          .replace(/\{n\}/g, n).replace(/\{base\}/g, base),
        visual: '<div class="calc-stage">' + rowsOf(n, base, 1) + '</div>',
        visualAria: App.i18n.t('gen.rowsAria')
          .replace(/\{n\}/g, n).replace(/\{base\}/g, base),
        legend: App.i18n.t('gen.multipleHint'),
        options: yesNoOptions(yes)
      };
    },

    /* The other way round: which of these three is a multiple. */
    pickMultiple: function (nv) {
      var base = draw(nv.id + 'b', nv.bases);
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
        options: App.utils.shuffle([good].concat(bad).map(function (n) {
          return { html: String(n), correct: n === good };
        }))
      };
    },

    /* The shortcuts. Each rule is spelled out in the hint, and what the
       rule looks at is highlighted in the number. */
    criterion: function (nv) {
      var rule = draw(nv.id + 'r', DATA.criteria.filter(function (c) {
        return nv.which.indexOf(c.id) !== -1;
      }));
      var n = draw(nv.id + 'n', DATA.criteriaNumbers);
      var yes = n % rule.divisor === 0;
      var digits = rule.id === 'by3';
      return {
        prompt: App.i18n.t('gen.divides')
          .replace(/\{n\}/g, n).replace(/\{d\}/g, rule.divisor),
        visual: '<div class="calc-stage">' + numberCard(n, !digits) +
          (digits ? '<span class="digit-sum">' + String(n).split('').join(' + ') +
            ' = ' + digitSum(n) + '</span>' : '') + '</div>',
        visualAria: String(n),
        legend: App.i18n.t('rule.' + rule.id),
        options: yesNoOptions(yes)
      };
    },

    /* Prime or not, decided by trying to build the rows. Every attempt is
       on screen, so the answer is "none of them came out even". */
    isPrime: function (nv) {
      var n = draw(nv.id, DATA.primeCandidates);
      var tries = PRIME_TESTS.filter(function (t) { return t < n; });
      var html = '<div class="try-stage">';
      tries.forEach(function (t) {
        var fits = n % t === 0;
        html += '<span class="try' + (fits ? ' is-fit' : '') + '">' +
          '<span class="try-label">' + App.i18n.t('gen.inRowsOf').replace(/\{t\}/g, t) +
          ' <span class="try-verdict" aria-hidden="true">' + (fits ? '✔' : '✖') + '</span></span>' +
          rowsOf(n, t, fits ? 1 : 2) + '</span>';
      });
      return {
        prompt: App.i18n.t('gen.isPrime').replace(/\{n\}/g, n),
        visual: html + '</div>',
        visualAria: App.i18n.t('gen.triesAria').replace(/\{n\}/g, n),
        legend: App.i18n.t('gen.primeHint'),
        options: yesNoOptions(isPrime(n))
      };
    },

    /* Every how often do the two meet. The star marks the first time. */
    lcm: function (nv) {
      var pair = draw(nv.id, DATA.cyclePairs);
      var meet = lcm(pair.a, pair.b);
      return {
        prompt: App.i18n.t('gen.meetEvery')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        visual: cycles(pair.a, pair.b, meet),
        visualAria: App.i18n.t('gen.cyclesAria')
          .replace(/\{a\}/g, pair.a).replace(/\{b\}/g, pair.b),
        legend: App.i18n.t('gen.meetHint'),
        /* Adding the two is the mistake this teaches about, and it is only
           a wrong answer when it is not the real meeting point. */
        options: pickOptions(meet, [pair.a + pair.b, meet + pair.a, meet - pair.a])
      };
    },

    /* The biggest chunk that fits exactly in both. */
    gcd: function (nv) {
      var pair = draw(nv.id, DATA.commonPairs);
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
        options: pickOptions(best, [smaller, misfit, best + 1])
      };
    },

    /* The power as a square you can count. */
    square: function (nv) {
      var side = draw(nv.id, DATA.squareSides);
      return {
        prompt: App.i18n.t('gen.squareOf').replace(/\{n\}/g, side),
        visual: '<div class="calc-stage">' + squareGrid(side) + '</div>',
        visualAria: App.i18n.t('gen.squareAria').replace(/\{n\}/g, side),
        legend: App.i18n.t('gen.squareHint').replace(/\{n\}/g, side),
        options: pickOptions(side * side, [side + side, side * side - side, side * side + side])
      };
    },

    /* A negative number multiplied by itself. Every factor puts one minus
       on the table; they cancel two at a time, and if one is left over the
       answer ends up on the other side of zero. */
    negativePower: function (nv) {
      var item = draw(nv.id, DATA.negPowers);
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
      var item = draw(nv.id, DATA.powerChains);
      var result = Math.pow(item.base, item.n);
      return {
        prompt: App.i18n.t('gen.rootIndex')
          .replace(/\{base\}/g, item.base).replace(/\{n\}/g, result),
        visual: '<div class="calc-stage">' + powerChain(item.base, item.n) + '</div>',
        visualAria: App.i18n.t('gen.chainAria')
          .replace(/\{base\}/g, item.base).replace(/\{times\}/g, item.n),
        legend: App.i18n.t('gen.chainHint').replace(/\{base\}/g, item.base),
        /* Counting the boxes instead of the arrows between them gives one
           too many, which is what a chain actually produces. */
        options: pickOptions(item.n, [item.n + 1, item.n - 1, item.base])
      };
    },

    /* And the root as its side. */
    root: function (nv) {
      var side = draw(nv.id, DATA.squareSides);
      return {
        prompt: App.i18n.t('gen.rootOf').replace(/\{n\}/g, side * side),
        visual: '<div class="calc-stage">' + squareGrid(side) + '</div>',
        visualAria: App.i18n.t('gen.squareAria').replace(/\{n\}/g, side),
        legend: App.i18n.t('gen.rootHint'),
        options: pickOptions(side, [side - 1, side + 1, side * 2])
      };
    }
  };

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    return levels[Math.min(progress.completedRounds || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    startRound(levelFromProgress());
  }

  /* ---- Game ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    pools = {};
    reinforceList = [];
    reinforceIndex = 0;
    inReinforce = false;
    App.reinforce.banner.hide();
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    show(screenGame);
    render();
  }

  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceIndex = 0;
    inReinforce = true;
    attempts = 0;
    App.reinforce.banner.set(
      App.i18n.t('reinforceTitle') + ' — ' +
      App.i18n.t('reinforceIntro').replace('{n}', reinforceList.length)
    );
    showReinforceQuestion(reinforceList[0]);
  }

  /* Paints one question. `fixed` replays a question from the reinforce
     queue; without it a new one is generated for the current level. */
  function paintQuestion(fixed) {
    question = fixed || GENERATORS[level.tipo](level, index);
    answered = false;
    attempts = 0;

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    visualEl.classList.toggle('hidden', !question.visual);
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.textContent = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = (inReinforce
      ? ((reinforceIndex + 1) / reinforceList.length)
      : (index / DATA.perRound)) * 100 + '%';
    progressText.textContent = '';
    paintStars();
  }

  function showReinforceQuestion(p) { paintQuestion(p); }

  function render() { paintQuestion(null); }

  /* Visible text of an option (its html may wrap spans). */
  function plainText(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent;
  }

  function showExplanation(isCorrect) {
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var said = plainText(correct.html).replace(/\s+/g, ' ').trim();
    explanationEl.textContent =
      (isCorrect ? App.i18n.t('correctExplanation') : App.i18n.t('incorrectExplanationA')) +
      (said || correct.aria || '') + '.';
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: the first mistake does not give the answer away,
     it invites another look. Only the second one explains it. */
  function showHint() {
    explanationEl.textContent = App.i18n.t('hint');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (answered) return;
    if (op.correct) {
      showExplanation(true);
      answered = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      App.reinforce.add(level.id + ':' + index, question);
      if (attempts === 1) showHint();
      else showExplanation(false);
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceList.length) {
        inReinforce = false;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
      } else {
        showReinforceQuestion(reinforceList[reinforceIndex]);
      }
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      /* consume() returns [] when nothing was failed; otherwise it fires
         the callback that mounts the mini-round, which ends the round
         itself, so endRound must not also run here. */
      if (App.reinforce.consume().length === 0) endRound();
    } else {
      render();
    }
  }

  function endRound() {
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));

    var idxN = activity.levels.indexOf(level);
    var nextLevel = (roundCorrect === DATA.perRound && idxN !== -1 && idxN + 1 < activity.levels.length)
      ? activity.levels[idxN + 1] : null;
    var btnHarder = $('#btnHarder');
    if (nextLevel) {
      btnHarder.textContent = App.i18n.t('btnHarder').replace('{name}', App.i18n.t('level.' + nextLevel.id));
      btnHarder.classList.remove('hidden');
      btnHarder.onclick = function () { startRound(nextLevel); };
    } else {
      btnHarder.classList.add('hidden');
    }
  }

  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  $('#btnRepeat').addEventListener('click', function () { startRound(levelFromProgress()); });
  $('#btnMenu').addEventListener('click', function () { show(screenMenu); });
  $('#btnOtherActivity').addEventListener('click', function () { show(screenMenu); });

  paintMenu();
  paintStars();
})();
