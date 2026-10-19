/* ============================================================
   Calculia — Ordering numbers: shared engine.

   order-numbers (positives), order-negatives, order-decimals and
   number-challenge share the question kinds and the three stages of
   the Formas flow:
     1. explanation: concept slides with ← → (the rule, with a picture),
     2. real life: everyday examples of the same comparison,
     3. test: the round as a sheet of questions, checked all at once.

   Each activity brings its data (levels, slides, examples) in data.js
   and its texts in strings.<locale>.js. Numbers are whole units of a
   scale (hundredths for decimals), so every comparison is exact and
   never depends on floating-point rounding.

   Exposes window.App.numberSort.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  function rint(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
  function pow10(k) { return Math.pow(10, k); }
  function t(key) { return App.i18n.t(key); }
  function fill(text, values) {
    var out = text;
    Object.keys(values).forEach(function (k) {
      out = out.split('{' + k + '}').join(values[k]);
    });
    return out;
  }

  /* ---- Kinds of value -------------------------------------------------
     Each kind draws a whole number of units. `scale` says how many units
     make one; `decimals` how many digits are written. A level picks one
     kind, so the same level always looks the same on screen. The order of
     the kinds is the graduation: from the simplest to any number. */
  var KINDS = {
    /* Whole numbers */
    single: { scale: 1, decimals: 0, draw: function () { return rint(1, 9); } },
    round: { scale: 1, decimals: 0, draw: function () {
      return rint(1, 9) * pow10(rint(1, 3));                    /* 10 … 9000 */
    } },
    lessRound: { scale: 1, decimals: 0, draw: function () {
      var m;
      do { m = rint(11, 99); } while (m % 10 === 0);            /* two significant digits */
      return m * pow10(rint(1, 2));                             /* 110 … 9900 */
    } },
    any: { scale: 1, decimals: 0, draw: function () { return rint(1, 9999); } },
    /* Decimals, in hundredths: 50 is 0,5 */
    halves: { scale: 100, decimals: 1, draw: function () { return rint(1, 19) * 50; } },
    tenths: { scale: 100, decimals: 1, draw: function () { return rint(1, 99) * 10; } },
    roundHundredths: { scale: 100, decimals: 2, draw: function () {
      var k;
      do { k = rint(1, 999); } while (k % 10 !== 5);            /* 0,05 · 0,25 · 1,75 */
      return k;
    } },
    hundredths: { scale: 100, decimals: 2, draw: function () {
      var k;
      do { k = rint(1, 999); } while (k % 10 === 0);            /* any two digits */
      return k;
    } }
  };

  /* ---- Formatting -----------------------------------------------------
     Project rule: below 10.000 there is no thousands separator; from
     10.000 up there is. Negatives get a real minus sign. */
  function isEnglish() { return App.i18n.locale() === 'en'; }

  function groupThousands(whole) {
    var s = whole;
    var parts = [];
    while (s.length > 3) {
      parts.unshift(s.slice(s.length - 3));
      s = s.slice(0, s.length - 3);
    }
    parts.unshift(s);
    return parts.join(isEnglish() ? ',' : '.');
  }

  function fmtPlain(x, decimals) {
    var abs = Math.abs(x).toFixed(decimals);
    var parts = abs.split('.');
    var whole = Number(parts[0]) >= 10000 ? groupThousands(parts[0]) : parts[0];
    var text = parts[1] ? whole + (isEnglish() ? '.' : ',') + parts[1] : whole;
    return (x < 0 && Number(abs) !== 0 ? '−' : '') + text;
  }

  /* Formats a stored value (units) of the given kind. */
  function show(units, kind) {
    var k = KINDS[kind];
    return fmtPlain(units / k.scale, k.decimals);
  }

  /* ---- Drawing values ------------------------------------------------- */
  /* pool = { kind, sign }. sign 1 = positive, -1 = negative, 0 = mixed. */
  function drawDistinct(pool, count) {
    var out = [];
    var guard = 0;
    while (out.length < count) {
      guard += 1;
      if (guard > 5000) throw new Error('number-sort: pool "' + pool.kind + '" is too small for ' + count + ' values');
      var sign = pool.sign === 0 ? (Math.random() < 0.5 ? -1 : 1) : pool.sign;
      var v = sign * KINDS[pool.kind].draw();
      if (out.indexOf(v) === -1) out.push(v);
    }
    return out;
  }

  function ascending(list) { return list.slice().sort(function (a, b) { return a - b; }); }
  function sameList(a, b) {
    return a.length === b.length && a.every(function (v, i) { return v === b[i]; });
  }
  function allNegative(values) { return values.every(function (v) { return v < 0; }); }

  /* ---- Question kinds -------------------------------------------------
     Every question has: prompt, optional visual, options (the first
     correct one is found by `correct`), a socratic hint that never gives
     the answer, and the explanation shown after a right answer. */
  function optionsFrom(values, kind, answer) {
    return App.utils.shuffle(values.map(function (v) {
      return { html: show(v, kind), aria: show(v, kind), correct: v === answer };
    }));
  }

  function makeExtreme(pool, type) {
    var values = drawDistinct(pool, 4);
    var sorted = ascending(values);
    var answer = type === 'smallest' ? sorted[0] : sorted[sorted.length - 1];
    var neg = allNegative(values);
    var suffix = neg ? 'Neg' : '';
    return {
      type: type,
      prompt: t(type === 'smallest' ? 'q.promptSmallest' : 'q.promptLargest'),
      visual: null,
      inline: true,
      options: optionsFrom(values, pool.kind, answer),
      hint: t('q.hint' + (type === 'smallest' ? 'Smallest' : 'Largest') + suffix),
      explanation: fill(t('q.explain' + (type === 'smallest' ? 'Smallest' : 'Largest') + suffix),
        { v: show(answer, pool.kind) })
    };
  }

  function makeOrder(pool) {
    var values = drawDistinct(pool, 3);
    var sorted = ascending(values);
    var rows = [{ list: sorted, correct: true }];
    var guard = 0;
    while (rows.length < 3 && guard < 200) {
      guard += 1;
      var candidate = App.utils.shuffle(values);
      var seen = rows.some(function (r) { return sameList(r.list, candidate); });
      if (!seen) rows.push({ list: candidate, correct: false });
    }
    var rowText = function (list) { return list.map(function (v) { return show(v, pool.kind); }).join(' · '); };
    var neg = allNegative(values);
    return {
      type: 'order',
      prompt: t('q.promptOrder'),
      visual: null,
      options: App.utils.shuffle(rows).map(function (r) {
        return { html: rowText(r.list), aria: rowText(r.list), correct: r.correct };
      }),
      hint: t(neg ? 'q.hintOrderNeg' : 'q.hintOrder'),
      explanation: fill(t('q.explainOrder'), { list: rowText(sorted) })
    };
  }

  function makeBetween(pool) {
    /* Six values in order. The one in the middle of three is the answer;
       its two neighbours are the limits. The other three sit outside the
       limits, so exactly one option fits. */
    var six = ascending(drawDistinct(pool, 6));
    var i = rint(1, 4);
    var a = six[i - 1];
    var answer = six[i];
    var b = six[i + 1];
    var outside = six.filter(function (v, k) { return k < i - 1 || k > i + 1; });
    var options = [answer].concat(outside);
    var values = { a: show(a, pool.kind), b: show(b, pool.kind) };
    return {
      type: 'between',
      prompt: fill(t('q.promptBetween'), values),
      visual: null,
      options: App.utils.shuffle(options.map(function (v) {
        return { html: show(v, pool.kind), aria: show(v, pool.kind), correct: v === answer };
      })),
      hint: fill(t('q.hintBetween'), values),
      explanation: fill(t('q.explainBetween'), {
        v: show(answer, pool.kind), a: values.a, b: values.b
      })
    };
  }

  function makeMissing(pool) {
    for (var attempt = 0; attempt < 200; attempt += 1) {
      var four = ascending(drawDistinct(pool, 4));
      var gap = rint(1, 2);
      var answer = four[gap];
      var left = four[gap - 1];
      var right = four[gap + 1];
      var shown = four.filter(function (v, k) { return k !== gap; });
      /* Distractors: values outside the gap, so only the answer fits. */
      var extra = [];
      var guard = 0;
      while (extra.length < 3 && guard < 300) {
        guard += 1;
        var cand = drawDistinct(pool, 1)[0];
        if (cand > left && cand < right) continue;
        if (shown.indexOf(cand) !== -1 || extra.indexOf(cand) !== -1) continue;
        extra.push(cand);
      }
      if (extra.length < 3) continue;
      var cells = four.map(function (v, k) {
        return k === gap
          ? '<span class="ns-chip ns-gap">?</span>'
          : '<span class="ns-chip">' + show(v, pool.kind) + '</span>';
      });
      var row = cells.join('<span class="ns-sep" aria-hidden="true">·</span>');
      var rowLabel = four.map(function (v, k) { return k === gap ? '?' : show(v, pool.kind); }).join(', ');
      return {
        type: 'missing',
        prompt: t('q.promptMissing'),
        visual: '<div class="ns-row">' + row + '</div>',
        visualAria: fill(t('q.rowAria'), { row: rowLabel }),
        options: optionsFrom([answer].concat(extra), pool.kind, answer),
        hint: t('q.hintMissing'),
        explanation: fill(t('q.explainMissing'), {
          v: show(answer, pool.kind), list: ascending(four).map(function (v) { return show(v, pool.kind); }).join(' · ')
        })
      };
    }
    throw new Error('number-sort: no missing-number question for pool "' + pool.kind + '"');
  }

  var TYPES = ['smallest', 'largest', 'order', 'between', 'missing'];

  /* One question of the given type from a pool. */
  function makeQuestion(pool, type) {
    if (type === 'smallest' || type === 'largest') return makeExtreme(pool, type);
    if (type === 'order') return makeOrder(pool);
    if (type === 'between') return makeBetween(pool);
    return makeMissing(pool);
  }

  /* A round: `count` questions cycling through the level's types. The
     caller shuffles the order, so the types are never grouped. */
  function makeRound(level, count) {
    var types = level.types || TYPES;
    var out = [];
    for (var i = 0; i < count; i += 1) {
      out.push(makeQuestion(level.pool, types[i % types.length]));
    }
    return out;
  }

  /* ---- Question cards (shared by the test sheet and the challenge) ----- */
  function questionCard(question, index) {
    var card = document.createElement('article');
    card.className = 'card stack test-sheet-card';
    card.dataset.sheet = String(index);

    var promptEl = document.createElement('p');
    promptEl.className = 'prompt';
    promptEl.textContent = question.prompt;
    card.appendChild(promptEl);

    if (question.visual) {
      var visualEl = document.createElement('div');
      visualEl.className = 'visual';
      visualEl.innerHTML = question.visual;
      if (question.visualAria) {
        visualEl.setAttribute('role', 'img');
        visualEl.setAttribute('aria-label', question.visualAria);
      } else {
        visualEl.setAttribute('aria-hidden', 'true');
      }
      card.appendChild(visualEl);
    }

    var optionsEl = document.createElement('div');
    optionsEl.className = 'stack options';
    if (question.inline) optionsEl.classList.add('options-row');
    question.options.forEach(function (op, j) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      optionsEl.appendChild(btn);
    });
    card.appendChild(optionsEl);

    var feedbackEl = document.createElement('p');
    feedbackEl.className = 'feedback hidden';
    feedbackEl.setAttribute('aria-live', 'polite');
    card.appendChild(feedbackEl);
    return card;
  }

  /* Marks the chosen option. Right: it locks in green with the explanation.
     Wrong: it is marked and the socratic hint shows; the card stays open. */
  function paintAnswer(card, question, selected) {
    var options = card.querySelectorAll('.option-btn');
    var feedbackEl = card.querySelector('.feedback');
    var op = question.options[selected];
    options.forEach(function (b) { b.classList.remove('selected'); });
    feedbackEl.classList.remove('hidden', 'success', 'error', 'encourage');
    if (op.correct) {
      options.forEach(function (b) { b.disabled = true; });
      options[selected].classList.add('correct');
      feedbackEl.textContent = '✅ ' + question.explanation;
      feedbackEl.classList.add('success');
    } else {
      options[selected].classList.add('incorrect');
      App.feedback.encourage(feedbackEl);
      feedbackEl.textContent += ' ' + question.hint;
      feedbackEl.classList.add('error');
    }
    return op.correct;
  }

  /* ---- Visuals for the concept slides --------------------------------- */
  function lineSvg(spec) {
    var W = 320;
    var H = 96;
    var x0 = 24;
    var x1 = W - 24;
    var y = 60;
    var span = spec.to - spec.from;
    var x = function (v) { return x0 + (v - spec.from) / span * (x1 - x0); };
    var parts = ['<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" class="ns-axis"/>'];
    for (var v = spec.from; v <= spec.to + 1e-9; v += spec.step) {
      parts.push('<line x1="' + x(v) + '" y1="' + (y - 6) + '" x2="' + x(v) + '" y2="' + (y + 6) + '" class="ns-tick"/>');
      parts.push('<text x="' + x(v) + '" y="' + (y + 24) + '" class="ns-tick-label" text-anchor="middle">' + fmtPlain(v, spec.dec) + '</text>');
    }
    (spec.marks || []).forEach(function (m) {
      parts.push('<circle cx="' + x(m) + '" cy="' + y + '" r="6" class="ns-mark"/>');
      parts.push('<text x="' + x(m) + '" y="' + (y - 14) + '" class="ns-mark-label" text-anchor="middle">' + fmtPlain(m, spec.dec) + '</text>');
    });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="ns-line" aria-hidden="true">' + parts.join('') + '</svg>';
  }

  function chipsHtml(spec) {
    return '<div class="ns-row">' + spec.values.map(function (v, k) {
      var chip = '<span class="ns-chip">' + fmtPlain(v, spec.dec) + '</span>';
      return k === 0 ? chip : '<span class="ns-sep" aria-hidden="true">&lt;</span>' + chip;
    }).join('') + '</div>';
  }

  function visualHtml(spec) {
    if (!spec) return '';
    return spec.kind === 'line' ? lineSvg(spec) : chipsHtml(spec);
  }

  /* ---- Setup: the three stages of one activity ------------------------ */
  /* config = {
       toolId, perRound, levels: [{ id, name, detail, pool, types }],
       concepts: [{ title, text, visual }], examples: [{ emoji, caption }],
       buildRound(level) -> questions (the activity shuffles them)
     } */
  function setup(config) {
    var progress = App.storage.get(config.toolId);
    if (typeof progress.stars !== 'number') progress.stars = 0;
    if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
    if (!progress.roundsByLevel || typeof progress.roundsByLevel !== 'object') progress.roundsByLevel = {};

    var levels = config.levels;
    var concepts = config.concepts;
    var examples = config.examples;

    var screenIntro = $('#screenIntro');
    var screenReal = $('#screenReal');
    var screenMenu = $('#screenMenu');
    var screenGame = $('#screenGame');
    var levelsMenu = $('#levelsMenu');
    var testSheet = $('#testSheet');
    var btnCheck = $('#btnCheck');
    var btnNewRound = $('#btnNewRound');
    var progressFill = $('#progressFill');
    var progressText = $('#progressText');
    var difficulty = $('#difficulty');
    var transfer = $('#transfer');
    var starsEl = $('#stars');

    var level = null;
    var sheets = [];
    var conceptIndex = 0;
    var exampleIndex = 0;

    function save() { App.storage.set(config.toolId, progress); }
    function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }
    function showScreen(screen) {
      [screenIntro, screenReal, screenMenu, screenGame].forEach(function (p) {
        p.classList.toggle('hidden', p !== screen);
      });
    }

    /* Levels open one after another: the next one unlocks once the one
       before it has a round completed. The menu is the way to choose any
       open level, so nobody is held on a level they want to leave. */
    function unlocked(i) {
      if (i === 0) return true;
      return (progress.roundsByLevel[levels[i - 1].id] || 0) >= 1;
    }

    function paintLevels() {
      levelsMenu.innerHTML = '';
      var grid = document.createElement('div');
      grid.className = 'menu-grid';
      levels.forEach(function (lv, i) {
        var open = unlocked(i);
        var done = progress.roundsByLevel[lv.id] || 0;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-actividad';
        btn.disabled = !open;
        var detail = open
          ? t(lv.detail) + (done > 0 ? ' · ' + fill(t('ui.levelDone'), { n: String(done) }) : '')
          : t('ui.levelLocked');
        btn.innerHTML = '<span class="picto" aria-hidden="true">' + (i + 1) + '</span>' +
          '<span>' + t(lv.name) + '</span>' +
          '<span class="detail-card">' + detail + '</span>';
        btn.addEventListener('click', function () { openLevel(i); });
        grid.appendChild(btn);
      });
      levelsMenu.appendChild(grid);
    }

    function openLevel(i) {
      level = levels[i];
      startRound();
    }

    function startRound() {
      sheets = config.buildRound(level).map(function (q) {
        return { question: q, selected: null, correct: null };
      });
      difficulty.textContent = t(level.name);
      transfer.classList.add('hidden');
      btnCheck.classList.remove('hidden');
      btnCheck.disabled = false;
      btnNewRound.classList.add('hidden');
      showScreen(screenGame);
      renderSheet();
    }

    /* The whole round on one screen: one card per question. */
    function renderSheet() {
      testSheet.innerHTML = '';
      sheets.forEach(function (sheet, i) {
        testSheet.appendChild(questionCard(sheet.question, i));
      });
      var cards = testSheet.querySelectorAll('.test-sheet-card');
      cards.forEach(function (card, i) {
        card.querySelectorAll('.option-btn').forEach(function (btn, j) {
          btn.addEventListener('click', function () { selectOption(i, j); });
        });
      });
      paintSheetProgress();
    }

    function selectOption(sheetIdx, optionIdx) {
      var sheet = sheets[sheetIdx];
      if (sheet.correct === true) return;
      sheet.selected = optionIdx;
      var card = testSheet.querySelectorAll('.test-sheet-card')[sheetIdx];
      card.querySelectorAll('.option-btn').forEach(function (b, j) {
        b.classList.toggle('selected', j === optionIdx);
        b.classList.remove('incorrect');
      });
      paintSheetProgress();
    }

    function checkAnswers() {
      var firstUnanswered = -1;
      for (var i = 0; i < sheets.length; i += 1) {
        if (sheets[i].correct !== true && sheets[i].selected === null) { firstUnanswered = i; break; }
      }
      if (firstUnanswered !== -1) {
        var target = testSheet.querySelectorAll('.test-sheet-card')[firstUnanswered];
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('shake');
        setTimeout(function () { target.classList.remove('shake'); }, 500);
        return;
      }

      /* Only the first check of a round scores; later checks just walk
         through the questions still open. */
      var firstCheck = sheets.every(function (sheet) { return sheet.correct === null; });
      var rightFirstTry = 0;
      var cards = testSheet.querySelectorAll('.test-sheet-card');
      sheets.forEach(function (sheet, i) {
        if (sheet.correct === true) return;
        var ok = paintAnswer(cards[i], sheet.question, sheet.selected);
        sheet.correct = ok;
        if (ok && firstCheck) rightFirstTry += 1;
      });

      if (firstCheck) {
        progress.stars += rightFirstTry;
        progress.completedRounds = (progress.completedRounds || 0) + 1;
        progress.roundsByLevel[level.id] = (progress.roundsByLevel[level.id] || 0) + 1;
        save();
        paintStars();
      }

      var allRight = sheets.every(function (sheet) { return sheet.correct === true; });
      btnCheck.classList.toggle('hidden', allRight);
      btnNewRound.classList.remove('hidden');
      transfer.classList.toggle('hidden', !allRight);
      if (allRight) btnNewRound.focus();
      paintSheetProgress();
    }

    /* Before the check: how many questions have an option picked. After it:
       how many are right. The number is always "x / total". */
    function paintSheetProgress() {
      var total = sheets.length;
      var checked = sheets.length > 0 && sheets[0].correct !== null;
      var numerator = checked
        ? sheets.filter(function (s) { return s.correct === true; }).length
        : sheets.filter(function (s) { return s.selected !== null; }).length;
      progressFill.style.width = (total ? numerator / total * 100 : 0) + '%';
      progressText.textContent = numerator + ' / ' + total;
    }

    /* Concept slides */
    function paintConcept() {
      var slide = concepts[conceptIndex];
      $('#conceptTitle').textContent = t(slide.title);
      $('#conceptText').textContent = t(slide.text);
      $('#conceptVisual').innerHTML = visualHtml(slide.visual);
      $('#conceptCount').textContent = fill(t('ui.conceptCount'), {
        i: String(conceptIndex + 1), n: String(concepts.length)
      });
      $('#conceptPrev').disabled = conceptIndex === 0;
      $('#conceptNext').disabled = conceptIndex === concepts.length - 1;
    }

    function paintExample() {
      var ex = examples[exampleIndex];
      $('#realObject').textContent = ex.emoji;
      $('#realCaption').textContent = t(ex.caption);
    }

    /* Events */
    $('#conceptPrev').addEventListener('click', function () {
      if (conceptIndex > 0) { conceptIndex -= 1; paintConcept(); }
    });
    $('#conceptNext').addEventListener('click', function () {
      if (conceptIndex < concepts.length - 1) { conceptIndex += 1; paintConcept(); }
    });
    $('#introContinue').addEventListener('click', function () { showScreen(screenReal); });
    $('#realPrev').addEventListener('click', function () {
      exampleIndex = (exampleIndex + examples.length - 1) % examples.length;
      paintExample();
    });
    $('#realNext').addEventListener('click', function () {
      exampleIndex = (exampleIndex + 1) % examples.length;
      paintExample();
    });
    $('#realContinue').addEventListener('click', function () { paintLevels(); showScreen(screenMenu); });
    $('#btnLevels').addEventListener('click', function () { paintLevels(); showScreen(screenMenu); });
    btnCheck.addEventListener('click', checkAnswers);
    btnNewRound.addEventListener('click', startRound);

    paintConcept();
    paintExample();
    paintStars();
    showScreen($('#screenIntro'));
  }

  window.App.numberSort = {
    KINDS: KINDS,
    show: show,
    makeQuestion: makeQuestion,
    makeRound: makeRound,
    questionCard: questionCard,
    paintAnswer: paintAnswer,
    setup: setup
  };
})();
