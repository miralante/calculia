/* ============================================================
   Calculia — Factoriales
   One activity, three parts: 1. explanation (slides with a drawing),
   2. real life (short everyday examples), 3. test (one question at a time).
   n! is the product 1 × 2 × … × n. It comes before divisibility because
   n! is divided exactly by every number from 1 to n: the last slide says so.
   The numbers are small on purpose: this activity is about what «!» means.
   Texts are in strings.<locale>.js, the structure in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'factorial';
  var $ = App.utils.$;
  function t(key) { return App.i18n.t(key); }

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  var SCREENS = ['#screenIntro', '#screenReal', '#screenGame', '#screenEnd'];
  var introIndex = 0;
  var realIndex = 0;
  var round = [];
  var qIndex = 0;
  var roundRight = 0;
  var question = null;
  var answered = false;
  var firstTry = true;

  function save() { App.storage.set(TOOL_ID, progress); }
  function paintStars() { $('#stars').textContent = '⭐ ' + progress.stars; }
  function show(screen) {
    SCREENS.forEach(function (id) { $(id).classList.toggle('hidden', id !== screen); });
  }
  function fill(text, values) {
    var out = text;
    Object.keys(values).forEach(function (k) { out = out.split('{' + k + '}').join(values[k]); });
    return out;
  }
  function rint(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  /* ---- Factorials ---------------------------------------------------------
     n! = n × (n−1) × … × 1. `factors(n, low)` lists the numbers from n down to `low`. */
  function factorial(n) {
    var value = 1;
    for (var k = 2; k <= n; k += 1) value *= k;
    return value;
  }
  function factors(n, low) {
    var list = [];
    for (var k = n; k >= low; k -= 1) list.push(k);
    return list;
  }
  /* The product written out, for example 4 × 3 × 2 × 1. */
  function chainText(n) { return factors(n, 1).join(' × '); }

  /* ---- Drawings -------------------------------------------------------------- */
  /* n, n−1 … 1 as chips with a × between them, then = and the result. */
  function chainHtml(n) {
    var html = '';
    factors(n, 1).forEach(function (k, i) {
      if (i) html += '<span class="fac-sign" aria-hidden="true">×</span>';
      html += '<span class="fac-chip">' + k + '</span>';
    });
    return '<div class="fac-line">' + html +
      '<span class="fac-sign" aria-hidden="true">=</span>' +
      '<span class="fac-chip fac-result">' + factorial(n) + '</span></div>';
  }
  /* The first few factorials, one card each: the value grows fast. */
  function growthHtml(max) {
    var html = '<div class="fac-growth">';
    for (var n = 1; n <= max; n += 1) {
      html += '<div class="fac-card"><span class="fac-name">' + n + '!</span><span class="fac-value">' + factorial(n) + '</span></div>';
    }
    return html + '</div>';
  }
  /* n! as a big number, and below it each small number that divides it with nothing left over. */
  function chipsHtml(n) {
    var value = factorial(n);
    var html = '<p class="fac-big">' + n + '! = ' + value + '</p><div class="fac-chips">';
    for (var k = 1; k <= n; k += 1) {
      html += '<span class="fac-chip">' + value + ' ÷ ' + k + ' = ' + (value / k) + '</span>';
    }
    return html + '</div><p class="fac-note">' + t('ui.noRest') + '</p>';
  }
  /* n places in a row, one box each. `counts` writes over each box how many choices that place has (n, n−1 … 1). `result` writes the product under them. */
  function slotsHtml(n, counts, result) {
    var html = '<div class="fac-slots">';
    for (var i = 0; i < n; i += 1) {
      html += '<div class="fac-slot">' + (counts ? '<span class="fac-slot-count">' + (n - i) + '</span>' : '') +
        '<span class="fac-box"></span></div>';
    }
    html += '</div>';
    if (result) html += '<p class="fac-expr">' + chainText(n) + ' = ' + factorial(n) + '</p>';
    return html;
  }
  function drawingHtml(spec) {
    if (spec.kind === 'chain') return chainHtml(spec.n);
    if (spec.kind === 'growth') return growthHtml(spec.max);
    if (spec.kind === 'chips') return chipsHtml(spec.n);
    if (spec.kind === 'slots') return slotsHtml(spec.n, spec.counts, spec.result);
    return '';
  }

  /* ---- 1. Explanation: slides with a drawing ------------------------------- */
  function paintIntro() {
    var slide = DATA.intro[introIndex];
    $('#introTitle').textContent = t('intro.' + (introIndex + 1) + '.title');
    $('#introVisual').innerHTML = drawingHtml(slide.visual);
    $('#introVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#introText').textContent = t('intro.' + (introIndex + 1) + '.text');
    var bar = $('#introProgress');
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: introIndex + 1, n: DATA.intro.length }));
    bar.setAttribute('aria-valuemax', String(DATA.intro.length));
    bar.setAttribute('aria-valuenow', String(introIndex + 1));
    $('#introProgressFill').style.width = ((introIndex + 1) / DATA.intro.length * 100) + '%';
  }

  /* ---- 2. Real life: short examples ---------------------------------------- */
  function paintReal() {
    $('#realVisual').innerHTML = drawingHtml(DATA.real[realIndex].visual);
    $('#realVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#realText').textContent = t('real.' + (realIndex + 1));
    var bar = $('#realProgress');
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: realIndex + 1, n: DATA.real.length }));
    bar.setAttribute('aria-valuemax', String(DATA.real.length));
    bar.setAttribute('aria-valuenow', String(realIndex + 1));
    $('#realProgressFill').style.width = ((realIndex + 1) / DATA.real.length * 100) + '%';
  }

  /* ---- 3. Test -------------------------------------------------------------- */
  function startRound() {
    round = [];
    /* Each question draws its type at random, so a round does not repeat the same mix of problems. */
    for (var i = 0; i < DATA.perRound; i += 1) round.push(makeQuestion(DATA.types[rint(0, DATA.types.length - 1)]));
    qIndex = 0;
    roundRight = 0;
    show('#screenGame');
    renderQuestion();
  }

  /* Numbers as answers: the right one and up to two others, all different and not below zero, in a shuffled order. */
  function numericOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && v >= 0 && values.indexOf(v) === -1) values.push(v);
    });
    return App.utils.shuffle(values).map(function (v) {
      return { html: String(v), aria: String(v), correct: v === correct };
    });
  }

  function textOptions(correctText, wrongTexts) {
    var texts = [correctText];
    wrongTexts.forEach(function (s) { if (texts.indexOf(s) === -1 && texts.length < 3) texts.push(s); });
    return App.utils.shuffle(texts).map(function (s) {
      return { html: s, aria: s, correct: s === correctText };
    });
  }

  function makeQuestion(type) {
    var key = 'q.' + type + '.';
    if (type === 'value') {
      var n = rint(2, 5), value = factorial(n);
      return {
        prompt: fill(t(key + 'prompt'), { n: n }),
        visual: '<p class="fac-expr">' + chainText(n) + ' = ?</p>',
        hint: t(key + 'hint'),
        /* The wrong answers are the usual mix-ups: adding instead of multiplying, or leaving out the n. */
        options: numericOptions(value, [n * (n + 1) / 2, factorial(n - 1), n * n]),
        explanation: fill(t(key + 'explain'), { chain: chainText(n), T: value })
      };
    }
    if (type === 'meaning') {
      var m = rint(3, 5);
      var correct = chainText(m);
      return {
        prompt: fill(t(key + 'prompt'), { n: m }),
        visual: '',
        hint: t(key + 'hint'),
        options: textOptions(correct, [factors(m, 1).join(' + '), factors(m, 2).join(' × ')]),
        explanation: fill(t(key + 'explain'), { n: m, chain: correct, T: factorial(m) })
      };
    }
    if (type === 'slots') {
      var s = rint(3, 5), total = factorial(s);
      return {
        prompt: fill(t(key + 'prompt'), { n: s }),
        visual: slotsHtml(s, false, false),
        hint: fill(t(key + 'hint'), { n: s }),
        options: numericOptions(total, [factorial(s - 1), s * s, s * (s - 1)]),
        explanation: fill(t(key + 'explain'), { chain: chainText(s), T: total })
      };
    }
    /* divides: the answer divides n! with nothing left over. The wrong ones are numbers just above n that do not. */
    var d = rint(3, 5), whole = factorial(d), fits = rint(2, d);
    var misses = [];
    for (var c = d + 1; misses.length < 2 && c <= d + 8; c += 1) if (whole % c) misses.push(c);
    return {
      prompt: fill(t(key + 'prompt'), { n: d }),
      visual: '<p class="fac-expr">' + d + '! = ' + whole + '</p>',
      hint: fill(t(key + 'hint'), { T: whole }),
      options: numericOptions(fits, misses),
      explanation: fill(t(key + 'explain'), { T: whole, k: fits, g: whole / fits })
    };
  }

  function renderQuestion() {
    question = round[qIndex];
    answered = false;
    firstTry = true;
    $('#progressFill').style.width = ((qIndex / round.length) * 100) + '%';
    $('#progressText').textContent = (qIndex + 1) + ' / ' + round.length;
    $('#testPrompt').textContent = question.prompt;
    $('#testVisual').innerHTML = question.visual;
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    var box = $('#testOptions');
    box.innerHTML = '';
    question.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn option-btn';
      button.innerHTML = option.html;
      button.setAttribute('aria-label', option.aria);
      button.addEventListener('click', function () { answer(option, button); });
      box.appendChild(button);
    });
    $('#btnNext').classList.add('hidden');
  }

  function answer(option, button) {
    if (answered) return;
    var feedback = $('#feedback');
    if (option.correct) {
      answered = true;
      button.classList.add('correct');
      feedback.textContent = t('ui.right') + ' ' + question.explanation;
      feedback.className = 'feedback success';
      if (firstTry) {
        roundRight += 1;
        progress.stars += 1;
        save();
        paintStars();
      }
      $('#testOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      $('#btnNext').classList.remove('hidden');
      return;
    }
    /* A wrong answer: the hint, and the option stays off. Nothing is punished. */
    firstTry = false;
    button.classList.add('incorrect');
    button.disabled = true;
    feedback.textContent = question.hint;
    feedback.className = 'feedback error';
  }

  function nextQuestion() {
    qIndex += 1;
    if (qIndex < round.length) {
      renderQuestion();
      return;
    }
    progress.completedRounds += 1;
    save();
    $('#endSummary').textContent = fill(t('ui.roundDone'), {
      n: roundRight, total: round.length, stars: progress.stars
    });
    show('#screenEnd');
  }

  /* ---- Wiring ----------------------------------------------------------- */
  function init() {
    App.i18n.apply();
    paintStars();
    introIndex = 0;
    paintIntro();
    show('#screenIntro');
    /* Slides wrap around: the last one leads back to the first, and the first back to the last. */
    $('#introPrev').addEventListener('click', function () { introIndex = (introIndex + DATA.intro.length - 1) % DATA.intro.length; paintIntro(); });
    $('#introNext').addEventListener('click', function () { introIndex = (introIndex + 1) % DATA.intro.length; paintIntro(); });
    $('#introContinue').addEventListener('click', function () { realIndex = 0; paintReal(); show('#screenReal'); });
    $('#realPrev').addEventListener('click', function () { realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length; paintReal(); });
    $('#realNext').addEventListener('click', function () { realIndex = (realIndex + 1) % DATA.real.length; paintReal(); });
    $('#realContinue').addEventListener('click', startRound);
    $('#btnNext').addEventListener('click', nextQuestion);
    $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
