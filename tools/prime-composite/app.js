/* ============================================================
   Calculia — Primo o compuesto
   Two stages, the flow of Múltiplos (assets/js/activity-flow.js, test
   'options', no real-life stage):
   1. the explanation: composites first, then primes. The slides are
      interactive: the user arranges dots in rows, and taps the composite
      (or prime) numbers on a grid of 1 to 20;
   2. the test: one question at a time, with a hint and the explanation.
   This file has the drawings, the taps and the questions. The data is in
   data.js and the texts in strings.<locale>.js.
   ============================================================ */
(function () {
  'use strict';

  var t = App.i18n.t;
  var fill = App.utils.fill;
  var shuffled = App.utils.shuffle;

  /* ---- Numbers ----
     Nothing that can be worked out is stored: whether a number is prime
     comes out of its divisors, so the answer and the number cannot disagree. */
  function divisorsOf(n) {
    var list = [];
    for (var i = 1; i <= n; i += 1) if (n % i === 0) list.push(i);
    return list;
  }
  function isPrime(n) { return n > 1 && divisorsOf(n).length === 2; }
  function isComposite(n) { return n > 1 && !isPrime(n); }

  /* The smallest factor of a composite above 1: 12 → 2 (and 12 = 2 × 6). */
  function smallestFactor(n) { return divisorsOf(n)[1]; }

  /* Checked at start-up, so bad data fails loudly instead of teaching a lie. */
  DATA.primes.forEach(function (n) {
    if (!isPrime(n)) throw new Error('prime-composite: "' + n + '" is not prime');
  });
  DATA.composites.forEach(function (n) {
    if (!isComposite(n)) throw new Error('prime-composite: "' + n + '" is not composite');
  });

  /* ---- Drawings ----
     Dots are the picture of a number. A row of dots is one line of the
     array; a composite can also be a block of rows and columns. */
  function dot(cls) { return '<span class="pc-dot ' + (cls || '') + '" aria-hidden="true"></span>'; }
  function dots(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += dot(cls);
    return html;
  }

  /* `rows` rows of `cols` dots; `left` dots that do not fit, drawn apart. */
  function arrayHtml(rows, cols, left) {
    var html = '<div class="pc-figure"><div class="pc-array">';
    for (var r = 0; r < rows; r += 1) html += '<div class="pc-row">' + dots(cols) + '</div>';
    html += '</div>';
    if (left > 0) html += '<div class="pc-left" aria-hidden="true">' + dots(left, 'pc-dot-left') + '</div>';
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
      body += '<circle cx="' + x + '" cy="' + y + '" r="' + size + '" class="pc-svg-dot"/>';
    }
    return '<svg class="pc-ring" viewBox="0 0 200 200" aria-hidden="true">' + body + '</svg>';
  }

  /* ---- The interactive rows: the user chooses how many rows ----
     A right arrangement has no dot left over. */
  function rowsWidget(n) {
    var buttons = '';
    for (var r = 1; r <= n; r += 1) {
      buttons += '<button type="button" class="btn btn-secondary pc-rows-btn" data-rows="' + r + '" aria-pressed="false" aria-label="' +
        fill(t('rows.aria'), { r: r }) + '">' + r + '</button>';
    }
    return '<div class="pc-rows" data-n="' + n + '">' +
      '<div class="pc-stage">' + ringSvg(n) + '</div>' +
      '<p class="pc-question">' + t('rows.ask') + '</p>' +
      '<div class="pc-picks">' + buttons + '</div>' +
      '<p class="pc-msg" aria-live="polite"></p>' +
      '</div>';
  }

  /* ---- The interactive grid: the user taps the numbers of one kind ---- */
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
      cells += '<button type="button" class="pc-cell" data-n="' + n + '" aria-label="' + n + '">' + n + '</button>';
    }
    return '<div class="pc-grid" data-mode="' + mode + '" data-total="' + total + '">' +
      '<p class="pc-count" aria-live="polite">' + fill(t('grid.found'), { i: 0, total: total }) + '</p>' +
      '<div class="pc-cells">' + cells + '</div>' +
      '<p class="pc-msg" aria-live="polite">' + t(mode === 'composite' ? 'grid.startComposite' : 'grid.startPrime') + '</p>' +
      '</div>';
  }

  /* The drawing of an explanation slide. */
  function visualHtml(spec) {
    if (spec.kind === 'rows') return rowsWidget(spec.n);
    if (spec.kind === 'arrays') {
      var html = '<div class="pc-compare">';
      spec.list.forEach(function (pair) {
        html += '<div class="pc-compare-side">' + arrayHtml(pair[0], pair[1], 0) +
          '<p class="pc-expr">' + fill(t('ui.product'), { k: pair[0], d: pair[1], m: pair[0] * pair[1] }) + '</p></div>';
      });
      return html + '</div>';
    }
    if (spec.kind === 'grid') return gridWidget(spec.mode, spec.max);
    return arrayHtml(1, 1, 0);
  }

  /* ---- The taps ----
     One listener for the whole page: the drawings are painted again on every
     slide, so the taps are read from the document. */
  function pickRows(button) {
    var box = button.closest('.pc-rows');
    var n = parseInt(box.getAttribute('data-n'), 10);
    var r = parseInt(button.getAttribute('data-rows'), 10);
    var c = Math.floor(n / r);
    var left = n - r * c;
    box.querySelector('.pc-stage').innerHTML = arrayHtml(r, c, left);
    box.querySelectorAll('.pc-rows-btn').forEach(function (b) {
      var on = b === button;
      b.classList.toggle('is-selected', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var msg;
    if (left === 0) msg = fill(t('rows.exact'), { n: n, r: r, c: c });
    else if (left === 1) msg = fill(t('rows.leftOne'), { r: r });
    else msg = fill(t('rows.left'), { r: r, left: left });
    box.querySelector('.pc-msg').textContent = msg;
  }

  function tapCell(cell) {
    var grid = cell.closest('.pc-grid');
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
    var found = grid.querySelectorAll('.pc-cell.is-ok').length;
    grid.querySelector('.pc-count').textContent = fill(t('grid.found'), { i: found, total: total });
    if (right && found === total) msg = t('grid.done');
    grid.querySelector('.pc-msg').textContent = msg;
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var rowsButton = target.closest('.pc-rows-btn');
    if (rowsButton) { pickRows(rowsButton); return; }
    var cell = target.closest('.pc-cell');
    if (cell) tapCell(cell);
  });

  /* ---- Test: the questions ---- */
  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.answerOptions.yesNo(yes, { yes: t('ui.yes'), no: t('ui.no') });
  }

  /* Is it prime? One number from the primes or from the composites; now and then the 1. */
  function yesNoQuestion() {
    var yes = Math.random() < 0.5;
    var n = yes ? App.utils.pick(DATA.primes) : App.utils.pick(DATA.composites);
    if (!yes && Math.random() < 0.2) n = 1;
    var a = n > 1 ? smallestFactor(n) : 1;
    var values = { n: n, a: a, b: n / a };
    var type = n === 1 ? 'one' : (yes ? 'prime' : 'composite');
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: fill(t('q.yesno.hint'), values),
      visual: '<div class="pc-test">' + ringSvg(n) + '</div>',
      visualAria: fill(t('q.yesno.visualAria'), values),
      options: yesNoOptions(yes),
      explanation: fill(t('q.yesno.' + type), values)
    };
  }

  /* The prime among three numbers: the other two are composites. */
  function pickQuestion() {
    var p = App.utils.pick(DATA.primes);
    var others = shuffled(DATA.composites).slice(0, 2);
    return {
      prompt: t('q.pick.prompt'),
      hint: t('q.pick.hint'),
      visual: '',
      options: App.utils.numericOptions(p, others),
      explanation: fill(t('q.pick.explain'), { p: p })
    };
  }

  /* How many numbers divide it exactly: 2 for a prime, more for a composite. */
  function divisorsQuestion() {
    var n = App.utils.pick(DATA.primes.concat(DATA.composites));
    var list = divisorsOf(n);
    var count = list.length;
    var values = { n: n, list: list.join(', '), count: count };
    return {
      prompt: fill(t('q.divisors.prompt'), values),
      hint: fill(t('q.divisors.hint'), values),
      visual: '',
      options: App.utils.numericOptions(count, [count + 1, count - 1, count + 2]),
      explanation: fill(t(isPrime(n) ? 'q.divisors.prime' : 'q.divisors.composite'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'yesno') return yesNoQuestion();
    if (type === 'pick') return pickQuestion();
    return divisorsQuestion();
  }

  App.activityFlow.setup({
    toolId: 'prime-composite',
    pairedTest: true,
    socratic: true,
    testVisuals: true,
    testVisualClass: 'pc-test-visual',
    real: [],
    skipReal: true,
    intro: DATA.concepts.map(function (concept) { return { visual: concept }; }),
    introCopy: function (i) {
      var id = DATA.concepts[i].id;
      return { title: t('concept.' + id + '.title'), text: t('concept.' + id + '.text') };
    },
    visualHtml: visualHtml,
    buildRound: function () {
      var list = [];
      for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
      return shuffled(list);
    },
    makeQuestion: makeQuestion
  });
})();
