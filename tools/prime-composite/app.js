/* ============================================================
   Calculia — Primo o compuesto
   Two stages, the flow of Múltiplos: 1. explanation (slides with a
   drawing: dots in rows that show a prime (one row only) and a composite
   (rows that make a rectangle), the numbers 1 to 20 with the primes marked,
   and why 1 is neither), 2. test (one question at a time). There is no
   real-life stage: the test is the practice.
   Texts are in strings.<locale>.js, the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'prime-composite';
  var $ = App.utils.$;
  function t(key) { return App.i18n.t(key); }

  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

  var SCREENS = ['#screenIntro', '#screenGame', '#screenEnd'];
  var DOT = '🔴';
  var introIndex = 0;
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
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffled(list) { return App.utils.shuffle(list.slice()); }

  /* ---- Numbers -----------------------------------------------------------
     The divisors of n, from 1 to n, in order. A prime has exactly two:
     1 and itself. 1 has only one. */
  function divisorsOf(n) {
    var list = [];
    for (var i = 1; i <= n; i += 1) if (n % i === 0) list.push(i);
    return list;
  }
  function isPrime(n) { return n > 1 && divisorsOf(n).length === 2; }
  /* The smallest divisor of n above 1, and the number it is multiplied by. */
  function firstFactor(n) { return divisorsOf(n)[1]; }

  /* ---- Drawing ----------------------------------------------------------
     Dots in rows: a row is one line of the array. The product is written
     under it, so the rows and columns can be counted. */
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function arrayHtml(rows, cols) {
    var html = '<div class="ops-group-stack">';
    for (var r = 0; r < rows; r += 1) html += '<div class="ops-row">' + items(cols, 'ops-item') + '</div>';
    return html + '</div>';
  }
  function productText(rows, cols) {
    return fill(t('ui.product'), { k: rows, d: cols, m: rows * cols });
  }
  /* The numbers 1 … max: primes have a thick border, 1 a dashed one. */
  function sieveHtml(max) {
    var html = '<div class="pc-numbers">';
    for (var n = 1; n <= max; n += 1) {
      var cls = 'pc-num';
      if (n === 1) cls += ' pc-one';
      else if (isPrime(n)) cls += ' pc-prime';
      html += '<span class="' + cls + '">' + n + '</span>';
    }
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'array') return arrayHtml(spec.rows, spec.cols) + '<p class="ops-expr">' + productText(spec.rows, spec.cols) + '</p>';
    if (spec.kind === 'arrays') {
      var html = '<div class="ops-compare">';
      spec.list.forEach(function (pair) {
        html += '<div class="ops-compare-side">' + arrayHtml(pair[0], pair[1]) + '<p class="ops-expr">' + productText(pair[0], pair[1]) + '</p></div>';
      });
      return html + '</div>';
    }
    return sieveHtml(spec.max);
  }

  /* ---- 1. Explanation: slides with a drawing ------------------------------ */
  function paintIntro() {
    var n = introIndex + 1;
    $('#introTitle').textContent = t('intro.' + n + '.title');
    $('#introVisual').innerHTML = visualHtml(DATA.intro[introIndex].visual);
    $('#introVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#introText').textContent = t('intro.' + n + '.text');
    var bar = $('#introProgress');
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: n, n: DATA.intro.length }));
    bar.setAttribute('aria-valuemax', String(DATA.intro.length));
    bar.setAttribute('aria-valuenow', String(n));
    $('#introProgressFill').style.width = (n / DATA.intro.length * 100) + '%';
  }

  /* ---- 2. Test -------------------------------------------------------------- */
  function startRound() {
    var list = [];
    for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
    round = shuffled(list).map(makeQuestion);
    qIndex = 0;
    roundRight = 0;
    show('#screenGame');
    renderQuestion();
  }

  function reviewIntro() {
    introIndex = 0;
    paintIntro();
    show('#screenIntro');
  }

  /* Numbers as answers: the right one and up to two others, all different and not
     below zero, in a shuffled order. */
  function numericOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && v >= 0 && values.indexOf(v) === -1) values.push(v);
    });
    return App.utils.shuffle(values).map(function (v) {
      return { html: String(v), aria: String(v), correct: v === correct };
    });
  }

  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Is it prime? One number from the primes or from the composites; now and then the 1. */
  function makeYesNo() {
    var yes = Math.random() < 0.5;
    var n = yes ? pick(DATA.primes) : pick(DATA.composites);
    if (!yes && Math.random() < 0.2) n = 1;
    var values = { n: n, a: firstFactor(n), b: n / firstFactor(n) };
    var type = n === 1 ? 'one' : (yes ? 'prime' : 'composite');
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: fill(t('q.yesno.hint'), values),
      options: yesNoOptions(yes),
      explanation: fill(t('q.yesno.' + type), values)
    };
  }

  /* The prime among three numbers: the other two are composites. */
  function makePick() {
    var p = pick(DATA.primes);
    var others = shuffled(DATA.composites).slice(0, 2);
    return {
      prompt: t('q.pick.prompt'),
      hint: t('q.pick.hint'),
      options: numericOptions(p, others),
      explanation: fill(t('q.pick.explain'), { p: p })
    };
  }

  /* How many numbers divide it exactly: 2 for a prime, more for a composite. */
  function makeDivisors() {
    var n = pick(DATA.primes.concat(DATA.composites));
    var list = divisorsOf(n);
    var count = list.length;
    var values = { n: n, list: list.join(', '), count: count };
    return {
      prompt: fill(t('q.divisors.prompt'), values),
      hint: fill(t('q.divisors.hint'), values),
      options: numericOptions(count, [count + 1, count - 1, count + 2]),
      explanation: fill(t(isPrime(n) ? 'q.divisors.prime' : 'q.divisors.composite'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'yesno') return makeYesNo();
    if (type === 'pick') return makePick();
    return makeDivisors();
  }

  function renderQuestion() {
    question = round[qIndex];
    answered = false;
    firstTry = true;
    $('#progressFill').style.width = ((qIndex / round.length) * 100) + '%';
    $('#progressText').textContent = (qIndex + 1) + ' / ' + round.length;
    $('#testPrompt').textContent = question.prompt;
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
    /* Slides wrap around: the last one leads back to the first, and the first back to the last. */
    $('#introPrev').addEventListener('click', function () { introIndex = (introIndex + DATA.intro.length - 1) % DATA.intro.length; paintIntro(); });
    $('#introNext').addEventListener('click', function () { introIndex = (introIndex + 1) % DATA.intro.length; paintIntro(); });
    $('#introContinue').addEventListener('click', startRound);
    $('#testBack').addEventListener('click', reviewIntro);
    $('#btnNext').addEventListener('click', nextQuestion);
    $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });
    paintIntro();
    show('#screenIntro');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
