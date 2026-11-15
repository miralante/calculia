/* ============================================================
   Calculia — Primos y compuestos
   Three stages (assets/js/activity-flow.js, test 'options'):
   1. the explanation: composites first, then primes. The slides are
      interactive: the user arranges dots in rows, and taps the numbers
      that are composite (or prime) on a grid of 1 to 20;
   2. real life: one everyday example at a time;
   3. the test: one question per slide, with a hint and the explanation.
   This file has the drawings, the taps and the questions. The data is in
   data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var fill = App.utils.fill;
  var shuffled = App.utils.shuffle;

  /* The three kinds of question of the test, one of each in every three. */
  var KINDS = ['classify', 'pick', 'factors'];

  /* ---- Numbers ----
     Nothing that can be worked out is stored: whether a number is prime
     comes out of trying its divisors, so the answer and the number cannot
     disagree. */
  function isPrime(n) {
    if (n < 2) return false;
    for (var d = 2; d * d <= n; d += 1) {
      if (n % d === 0) return false;
    }
    return true;
  }

  /* Prime factors in ascending order: 12 → [2, 2, 3]. */
  function factorize(n) {
    var parts = [];
    var rest = n;
    for (var d = 2; d * d <= rest; d += 1) {
      while (rest % d === 0) {
        parts.push(d);
        rest /= d;
      }
    }
    if (rest > 1) parts.push(rest);
    return parts;
  }

  /* The smallest factor of a composite above 1: 12 → 2 (and 12 = 2 × 6). */
  function smallestFactor(n) {
    for (var d = 2; d <= n; d += 1) {
      if (n % d === 0) return d;
    }
    return n;
  }

  function nextPrime(n) {
    var m = n + 1;
    while (!isPrime(m)) m += 1;
    return m;
  }

  /* A composite (more than 1, not prime). */
  function isComposite(n) { return n > 1 && !isPrime(n); }

  /* Checked at start-up, so bad data fails loudly instead of teaching a lie. */
  DATA.pickSets.forEach(function (set) {
    var primes = [set.prime].concat(set.others).filter(isPrime);
    if (primes.length !== 1 || primes[0] !== set.prime) {
      throw new Error('primes: set with ' + set.prime + ' does not have exactly one prime');
    }
  });
  DATA.factorNumbers.forEach(function (n) {
    if (!isComposite(n)) throw new Error('primes: "' + n + '" is not composite');
  });

  /* ---- Drawings ----
     Dots are the picture of a number. A row of dots is one line of the
     array; a composite can also be a block of rows and columns. */
  function dot(cls) { return '<span class="pz-dot ' + (cls || '') + '" aria-hidden="true"></span>'; }
  function dots(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += dot(cls);
    return html;
  }

  /* `rows` rows of `cols` dots; `left` dots that do not fit, drawn apart. */
  function arrayHtml(rows, cols, left) {
    var html = '<div class="pz-figure"><div class="pz-array">';
    for (var r = 0; r < rows; r += 1) html += '<div class="pz-row">' + dots(cols) + '</div>';
    html += '</div>';
    if (left > 0) html += '<div class="pz-left" aria-hidden="true">' + dots(left, 'pz-dot-left') + '</div>';
    return html + '</div>';
  }

  /* The n dots on a circle: a picture with no rows, before the user arranges them. */
  function ringSvg(n) {
    var R = 72;
    var size = n <= 12 ? 9 : (n <= 24 ? 7 : 5);
    var body = '';
    for (var i = 0; i < n; i += 1) {
      var angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      var x = (100 + R * Math.cos(angle)).toFixed(1);
      var y = (100 + R * Math.sin(angle)).toFixed(1);
      body += '<circle cx="' + x + '" cy="' + y + '" r="' + size + '" class="pz-svg-dot"/>';
    }
    return '<svg class="pz-ring" viewBox="0 0 200 200" aria-hidden="true">' + body + '</svg>';
  }

  /* The factor tree of 12: 12 splits into 2 and 6, and 6 into 2 and 3.
     The primes get a thicker ring, so they are told apart without colour. */
  function treeSvg() {
    var nodes = [
      { x: 60, y: 24, n: 12, prime: false, from: null },
      { x: 34, y: 66, n: 2, prime: true, from: 0 },
      { x: 86, y: 66, n: 6, prime: false, from: 0 },
      { x: 70, y: 106, n: 2, prime: true, from: 2 },
      { x: 102, y: 106, n: 3, prime: true, from: 2 }
    ];
    var body = nodes.map(function (node) {
      if (node.from === null) return '';
      var parent = nodes[node.from];
      return '<line x1="' + parent.x + '" y1="' + (parent.y + 12) + '" x2="' +
        node.x + '" y2="' + (node.y - 12) + '" class="tree-line"/>';
    }).join('');
    body += nodes.map(function (node) {
      return '<circle cx="' + node.x + '" cy="' + node.y + '" r="12" class="tree-node' +
        (node.prime ? ' is-prime' : '') + '"/>' +
        '<text x="' + node.x + '" y="' + (node.y + 5) + '" class="tree-num">' + node.n + '</text>';
    }).join('');
    return '<svg class="pz-tree-svg" viewBox="0 0 120 120" aria-hidden="true">' + body + '</svg>';
  }

  /* ---- The interactive rows: the user chooses how many rows ----
     Rows of n dots: the user taps a number of rows, and the dots are
     arranged in that many rows. A right arrangement has no dot left over. */
  function rowsWidget(n) {
    var buttons = '';
    for (var r = 1; r <= n; r += 1) {
      buttons += '<button type="button" class="btn btn-secondary pz-rows-btn" data-rows="' + r + '" aria-pressed="false" aria-label="' +
        fill(t('rows.aria'), { r: r }) + '">' + r + '</button>';
    }
    return '<div class="pz-rows" data-n="' + n + '">' +
      '<div class="pz-stage">' + ringSvg(n) + '</div>' +
      '<p class="pz-question">' + t('rows.ask') + '</p>' +
      '<div class="pz-picks">' + buttons + '</div>' +
      '<p class="pz-msg" aria-live="polite"></p>' +
      '</div>';
  }

  /* ---- The interactive grid: the user taps the numbers of one kind ----
     mode 'composite' asks for the composites, mode 'prime' for the primes. */
  function gridTotal(mode, max) {
    var count = 0;
    for (var n = 1; n <= max; n += 1) {
      if (mode === 'composite' ? isComposite(n) : isPrime(n)) count += 1;
    }
    return count;
  }
  function gridWidget(mode, max) {
    var total = gridTotal(mode, max);
    var cells = '';
    for (var n = 1; n <= max; n += 1) {
      cells += '<button type="button" class="pz-cell" data-n="' + n + '" aria-label="' + n + '" aria-pressed="false">' + n + '</button>';
    }
    return '<div class="pz-grid" data-mode="' + mode + '" data-total="' + total + '">' +
      '<p class="pz-count" aria-live="polite">' + fill(t('grid.found'), { i: 0, total: total }) + '</p>' +
      '<div class="pz-cells">' + cells + '</div>' +
      '<p class="pz-msg" aria-live="polite">' + t(mode === 'composite' ? 'grid.startComposite' : 'grid.startPrime') + '</p>' +
      '</div>';
  }

  /* The drawing of an explanation slide. */
  function visualHtml(spec) {
    if (spec.kind === 'rows') return rowsWidget(spec.n);
    if (spec.kind === 'arrays') {
      var html = '<div class="pz-compare">';
      spec.list.forEach(function (pair) {
        html += '<div class="pz-compare-side">' + arrayHtml(pair[0], pair[1], 0) +
          '<p class="pz-expr">' + fill(t('ui.product'), { k: pair[0], d: pair[1], m: pair[0] * pair[1] }) + '</p></div>';
      });
      return html + '</div>';
    }
    if (spec.kind === 'tree') {
      return '<div class="pz-tree">' + treeSvg() + '<p class="pz-expr">12 = ' + factorize(12).join(' × ') + '</p></div>';
    }
    if (spec.kind === 'grid') return gridWidget(spec.mode, spec.max);
    return arrayHtml(1, 1, 0);
  }

  /* ---- The taps ----
     One listener for the whole page: the drawings are painted again on
     every slide, so the taps are read from the document. */
  function pickRows(button) {
    var box = button.closest('.pz-rows');
    var n = parseInt(box.getAttribute('data-n'), 10);
    var r = parseInt(button.getAttribute('data-rows'), 10);
    var c = Math.floor(n / r);
    var left = n - r * c;
    box.querySelector('.pz-stage').innerHTML = arrayHtml(r, c, left);
    box.querySelectorAll('.pz-rows-btn').forEach(function (b) {
      var on = b === button;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var msg;
    if (left === 0) msg = fill(t('rows.exact'), { n: n, r: r, c: c });
    else if (left === 1) msg = fill(t('rows.leftOne'), { r: r });
    else msg = fill(t('rows.left'), { r: r, left: left });
    box.querySelector('.pz-msg').textContent = msg;
  }

  function tapCell(cell) {
    var grid = cell.closest('.pz-grid');
    if (!grid || cell.classList.contains('is-ok')) return;
    var mode = grid.getAttribute('data-mode');
    var total = parseInt(grid.getAttribute('data-total'), 10);
    var n = parseInt(cell.getAttribute('data-n'), 10);
    var composite = isComposite(n);
    var right = mode === 'composite' ? composite : isPrime(n);
    var a = composite ? smallestFactor(n) : 0;
    var b = composite ? n / a : 0;
    var msg;
    if (right) {
      cell.classList.add('is-ok');
      cell.setAttribute('aria-pressed', 'true');
      msg = mode === 'composite' ? fill(t('grid.yesComposite'), { n: n, a: a, b: b }) : fill(t('grid.yesPrime'), { n: n });
    } else {
      cell.classList.add('is-no');
      if (n === 1) msg = t('grid.noOne');
      else if (mode === 'composite') msg = fill(t('grid.noPrime'), { n: n });
      else msg = fill(t('grid.noComposite'), { n: n, a: a, b: b });
    }
    var found = grid.querySelectorAll('.pz-cell.is-ok').length;
    grid.querySelector('.pz-count').textContent = fill(t('grid.found'), { i: found, total: total });
    if (right && found === total) msg = t('grid.done');
    grid.querySelector('.pz-msg').textContent = msg;
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var rowsButton = target.closest('.pz-rows-btn');
    if (rowsButton) { pickRows(rowsButton); return; }
    var cell = target.closest('.pz-cell');
    if (cell) tapCell(cell);
  });

  /* ---- Test: the questions ---- */
  /* The dots of a number, drawn as a ring, with no rows: the user works out the shape. */
  function classifyQuestion(n) {
    var answer = n === 1 ? 'neither' : (isPrime(n) ? 'prime' : 'composite');
    var a = smallestFactor(n);
    var values = { n: n, a: a, b: n / a };
    return {
      prompt: fill(t('q.classify.prompt'), values),
      hint: t('q.classify.hint'),
      visual: '<div class="pz-test">' + ringSvg(n) + '</div>',
      visualAria: fill(t('q.classify.visualAria'), values),
      options: shuffled(['prime', 'composite', 'neither'].map(function (k) {
        return {
          html: '<span class="answer-name">' + t('answer.' + k) + '</span>',
          aria: t('answer.' + k),
          correct: k === answer
        };
      })),
      explanation: fill(t('q.classify.' + answer), values)
    };
  }

  /* The prime among four numbers: the other three are composites. */
  function pickQuestion(set) {
    return {
      prompt: t('q.pick.prompt'),
      hint: t('q.pick.hint'),
      visual: '',
      options: shuffled([set.prime].concat(set.others).map(function (n) {
        return {
          html: '<span class="answer-num">' + n + '</span>',
          aria: String(n),
          correct: n === set.prime
        };
      })),
      explanation: fill(t('q.pick.explain'), { p: set.prime })
    };
  }

  /* The right decomposition is the only list where every factor is prime and
     they multiply back to the number. The wrong ones are common mistakes: a
     factor that is not prime (the first two merged), a product that is not
     the number (the last factor changed), and the 1 that is not prime. */
  function factorsQuestion(n) {
    var parts = factorize(n);
    var merged = parts.slice(2).concat([parts[0] * parts[1]]).sort(function (x, y) { return x - y; });
    var changed = parts.slice(0, -1).concat([nextPrime(parts[parts.length - 1])]);
    var texts = [
      parts.join(' × '),
      merged.length === 1 ? merged[0] + ' × 1' : merged.join(' × '),
      changed.join(' × '),
      ['1'].concat(parts).join(' × ')
    ];
    return {
      prompt: fill(t('q.factors.prompt'), { n: n }),
      hint: fill(t('q.factors.hint'), { n: n }),
      visual: '<div class="pz-big" aria-hidden="true">' + n + '</div>',
      options: shuffled(texts.map(function (text, i) {
        return {
          html: '<span class="answer-name">' + text + '</span>',
          aria: text,
          correct: i === 0
        };
      })),
      explanation: fill(t('q.factors.explain'), { n: n, f: parts.join(' × ') })
    };
  }

  function makeQuestion(kind) {
    if (kind === 'classify') return classifyQuestion(App.utils.drawRound('primes-classify', DATA.classifyNumbers));
    if (kind === 'pick') return pickQuestion(App.utils.drawRound('primes-pick', DATA.pickSets));
    return factorsQuestion(App.utils.drawRound('primes-factors', DATA.factorNumbers));
  }

  App.activityFlow.setup({
    toolId: 'primes',
    pairedTest: true,
    test: 'options',
    socratic: true,
    testVisuals: true,
    testVisualClass: 'pz-test-visual',
    slideProgress: false,
    intro: DATA.concepts.map(function (concept) { return { visual: concept }; }),
    real: DATA.real.map(function (item) { return { visual: item }; }),
    introHeading: function () { return t('instructionIntro'); },
    introCopy: function (i) {
      var id = DATA.concepts[i].id;
      return { title: t('concept.' + id + '.title'), text: t('concept.' + id + '.text') };
    },
    realText: function (i) { return t('real.' + DATA.real[i].id); },
    visualHtml: visualHtml,
    /* The objects are drawn one by one, so the count can be seen: 7 sweets, 12 tiles. */
    realVisualHtml: function (item) {
      var html = '';
      for (var i = 0; i < item.count; i += 1) html += '<span class="real-item">' + item.object + '</span>';
      return '<div class="real-object" aria-hidden="true">' + html + '</div>';
    },
    /* The round is a shuffled list of question kinds, one kind per question. */
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(KINDS[i % KINDS.length]);
      return shuffled(list);
    },
    makeQuestion: makeQuestion
  });
})();
