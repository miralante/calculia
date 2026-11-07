/* ============================================================
   Calculia — Divisibility: the data checks, the helpers and the pictures.
   ============================================================ */
(function () {
  'use strict';

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
  var gcd = App.commonFactors.gcd;
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

  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

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

  /* The number of points a dot drawing stands for, written above it. */
  function dotsCount(n) {
    return '<span class="dots-count">' + App.i18n.t('gen.dotsCount').replace(/\{n\}/g, n) + '</span>';
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

  App.DivisibilityModel = {
    pickOptions: pickOptions,
    superscript: superscript,
    yesNoOptions: yesNoOptions,
    dotsCount: dotsCount,
    rowsOf: rowsOf,
    numberCard: numberCard,
    digitSum: digitSum,
    PRIME_TESTS: PRIME_TESTS,
    isPrime: isPrime,
    lcm: lcm,
    cycles: cycles,
    gcd: gcd,
    bars: bars,
    squareGrid: squareGrid,
    negativePowerOf: negativePowerOf,
    minusPairs: minusPairs,
    signedOptions: signedOptions,
    powerChain: powerChain
  };
})();
