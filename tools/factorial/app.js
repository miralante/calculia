/* ============================================================
   Calculia — Números factoriales
   Socratic anatomy (SPEC §3.6 and §3.8): 1. what it is for and the rule
   (explanation slides with a drawing), 2. real life, 3. practice where
   the first miss shows a hint, not the answer, 4. a closing with the
   round summary, what was practised and a transfer sentence.
   The rule can be reopened during the round without losing the question.
   n! is the product 1 × 2 × … × n. It comes before divisibility because
   n! is divided exactly by every number from 1 to n: the last slide says so.
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
  var resolved = false;    // the current question is answered right
  var attempts = 0;        // wrong tries on the current question
  var reviewing = false;   // the rule was opened from the test: «Volver a la práctica» goes back to the same question

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

  /* ---- 1. What it is for, and the rule: slides with a drawing ------------ */
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

  /* The button under the slides: from the start it leads to the real-life examples. Opened from the test
     it goes back to the same question. Only the second one is the start of a test, so only it is primary. */
  function paintIntroContinue() {
    var button = $('#introContinue');
    button.textContent = t(reviewing ? 'ui.backToPractice' : 'ui.seeReal');
    button.className = reviewing ? 'btn' : 'btn btn-secondary';
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

  /* ---- 3. Practice ------------------------------------------------------------ */
  function startRound() {
    round = [];
    /* Each question draws its type at random, so a round does not repeat the same mix of problems. */
    for (var i = 0; i < DATA.perRound; i += 1) round.push(makeQuestion(DATA.types[rint(0, DATA.types.length - 1)]));
    qIndex = 0;
    roundRight = 0;
    reviewing = false;
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

  function optionButtons() { return App.utils.$$('#testOptions .option-btn'); }

  function renderQuestion() {
    question = round[qIndex];
    resolved = false;
    attempts = 0;
    $('#progressFill').style.width = ((qIndex / round.length) * 100) + '%';
    $('#progressText').textContent = (qIndex + 1) + ' / ' + round.length;
    $('#testPrompt').textContent = question.prompt;
    $('#testVisual').innerHTML = question.visual;
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    $('#explanation').textContent = '';
    $('#explanationWrap').classList.add('hidden');
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

  /* Socratic order (SPEC §3.8): the first miss shows a hint that does not give the answer; the second miss shows
     the explanation; a right answer shows the explanation at once. A miss never costs a star. */
  function answer(option, button) {
    if (resolved) return;
    var feedback = $('#feedback');
    var explanation = $('#explanation');
    var wrap = $('#explanationWrap');
    if (option.correct) {
      resolved = true;
      button.classList.add('correct');
      optionButtons().forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedback);
      progress.stars += 1;
      if (attempts === 0) roundRight += 1;
      save();
      paintStars();
      explanation.textContent = question.explanation;
      wrap.classList.remove('hidden');
      $('#btnNext').classList.remove('hidden');
      $('#btnNext').focus();
      return;
    }
    attempts += 1;
    button.classList.add('encourage');
    button.disabled = true;
    App.feedback.encourage(feedback);
    explanation.textContent = attempts === 1
      ? t('ui.hintPrefix') + question.hint
      : t('ui.wrongPrefix') + question.explanation;
    wrap.classList.remove('hidden');
    /* Locks the other options until «Entendido», so the hint is read before the next try. */
    App.feedback.lockUntilAck(optionButtons(), wrap);
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
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* The rule opened from the test: the same slides, and the test is kept as it is. */
  function openRule() {
    reviewing = true;
    introIndex = 0;
    paintIntro();
    paintIntroContinue();
    show('#screenIntro');
  }

  /* ---- Wiring ----------------------------------------------------------- */
  function init() {
    App.i18n.apply();
    paintStars();
    introIndex = 0;
    paintIntro();
    paintIntroContinue();
    show('#screenIntro');
    /* Slides wrap around: the last one leads back to the first, and the first back to the last. */
    $('#introPrev').addEventListener('click', function () { introIndex = (introIndex + DATA.intro.length - 1) % DATA.intro.length; paintIntro(); });
    $('#introNext').addEventListener('click', function () { introIndex = (introIndex + 1) % DATA.intro.length; paintIntro(); });
    $('#introContinue').addEventListener('click', function () {
      if (reviewing) {
        reviewing = false;
        paintIntroContinue();
        show('#screenGame');
        return;
      }
      realIndex = 0;
      paintReal();
      show('#screenReal');
    });
    $('#realPrev').addEventListener('click', function () { realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length; paintReal(); });
    $('#realNext').addEventListener('click', function () { realIndex = (realIndex + 1) % DATA.real.length; paintReal(); });
    $('#realContinue').addEventListener('click', startRound);
    $('#reviewRule').addEventListener('click', openRule);
    $('#btnNext').addEventListener('click', nextQuestion);
    $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
