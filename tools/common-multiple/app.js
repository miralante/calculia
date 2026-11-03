/* ============================================================
   Calculia — Mínimo común múltiplo
   Three stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: the multiples of two numbers, the first one they share, the same
   total in packs), 2. real life (one example at a time: buses, eggs, lights),
   3. test (one question at a time). The numbers and the drawings are built
   here; the texts are in strings.<locale>.js and the slides in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'common-multiple';
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
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  /* ---- Numbers ----------------------------------------------------------- */
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  /* The least common multiple: the first number that is a multiple of both. */
  function lcm(a, b) { return a * b / gcd(a, b); }
  /* The multiples of n, from n up to `limit`, in order. */
  function multiplesOf(n, limit) {
    var list = [];
    for (var m = n; m <= limit; m += n) list.push(m);
    return list;
  }

  /* ---- Drawing ----------------------------------------------------------
     Numbers as chips and objects as small icons. A caption under each
     drawing says what was counted. */
  function items(count, icon, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + icon + '</span>';
    return html;
  }
  /* One row of numbers: the ones in both lists marked, the first common one filled. */
  function chipRow(label, values, common, best) {
    var html = '<div class="cm-list"><span class="cm-label">' + label + '</span><div class="cm-chips">';
    values.forEach(function (v) {
      var cls = 'cm-chip';
      if (common.indexOf(v) !== -1) cls += ' cm-common';
      if (v === best) cls += ' cm-best';
      html += '<span class="' + cls + '">' + v + '</span>';
    });
    return html + '</div></div>';
  }
  /* The multiples of a and of b, up to their least common multiple. */
  function listsHtml(a, b) {
    var best = lcm(a, b);
    var la = multiplesOf(a, best);
    var lb = multiplesOf(b, best);
    var common = la.filter(function (v) { return lb.indexOf(v) !== -1; });
    return '<div class="cm-lists">' +
      chipRow(fill(t('ui.multiplesOf'), { n: a }), la, common, best) +
      chipRow(fill(t('ui.multiplesOf'), { n: b }), lb, common, best) +
      '</div>';
  }
  /* The same total in packs of a and in packs of b, side by side. */
  function packsHtml(a, b, icon) {
    var total = lcm(a, b);
    var html = '<div class="ops-compare">';
    [a, b].forEach(function (size) {
      var count = total / size;
      var boxes = '<div class="cm-baskets">';
      for (var k = 0; k < count; k += 1) {
        boxes += '<div class="ops-group-box"><div class="ops-row cm-pack">' + items(size, icon, 'ops-item') + '</div></div>';
      }
      html += '<div class="ops-compare-side">' + boxes + '</div>' +
        '<p class="ops-expr">' + fill(t('ui.packs'), { c: count, s: size, m: total }) + '</p>';
    });
    return html + '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'packs') return packsHtml(spec.a, spec.b, spec.icon);
    return listsHtml(spec.a, spec.b);
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

  /* ---- 2. Real life: one example at a time ------------------------------- */
  function paintReal() {
    var n = realIndex + 1;
    $('#realVisual').innerHTML = visualHtml(DATA.real[realIndex].visual);
    $('#realVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#realText').textContent = t('real.' + n);
    var bar = $('#realProgress');
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: n, n: DATA.real.length }));
    bar.setAttribute('aria-valuemax', String(DATA.real.length));
    bar.setAttribute('aria-valuenow', String(n));
    $('#realProgressFill').style.width = (n / DATA.real.length * 100) + '%';
  }

  /* ---- 3. Test -------------------------------------------------------------- */
  function startRound() {
    var list = [];
    for (var i = 0; i < DATA.perRound; i += 1) list.push(DATA.questions[i % DATA.questions.length]);
    round = App.utils.shuffle(list).map(makeQuestion);
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

  function pair() {
    var p = pick(DATA.pairs);
    return { a: p[0], b: p[1], m: lcm(p[0], p[1]) };
  }
  function explanation(p) {
    return fill(t('q.lcm.explain'), {
      a: p.a, b: p.b, m: p.m,
      la: multiplesOf(p.a, p.m).join(', '), lb: multiplesOf(p.b, p.m).join(', ')
    });
  }

  /* The least common multiple, asked as a number. The wrong answers are common
     multiples that are not the first one (the product, twice the answer), and
     numbers that are not multiples of both. */
  function makeLcm() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.lcm.prompt'), values),
      hint: fill(t('q.lcm.hint'), values),
      options: numericOptions(p.m, [p.a * p.b, p.m + 1, p.m * 2]),
      explanation: explanation(p)
    };
  }

  /* The same question as a story: the smallest number of items that fills packs of both sizes. */
  function makeStory() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.story.prompt'), values),
      hint: fill(t('q.story.hint'), values),
      options: numericOptions(p.m, [p.a * p.b, p.m + 1, p.m * 2]),
      explanation: explanation(p)
    };
  }

  /* Which number is a multiple of both: the right one is the least common
     multiple; the others are numbers that are not multiples of both. */
  function makeCommon() {
    var p = pair();
    var values = { a: p.a, b: p.b, m: p.m };
    var wrongs = [p.m + p.a, p.m + p.b, p.m + 1].filter(function (x) {
      return !(x % p.a === 0 && x % p.b === 0);
    });
    return {
      prompt: fill(t('q.common.prompt'), values),
      hint: fill(t('q.common.hint'), values),
      options: numericOptions(p.m, wrongs),
      explanation: fill(t('q.common.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'lcm') return makeLcm();
    if (type === 'story') return makeStory();
    return makeCommon();
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
    $('#introContinue').addEventListener('click', function () { realIndex = 0; paintReal(); show('#screenReal'); });
    $('#realPrev').addEventListener('click', function () { realIndex = (realIndex + DATA.real.length - 1) % DATA.real.length; paintReal(); });
    $('#realNext').addEventListener('click', function () { realIndex = (realIndex + 1) % DATA.real.length; paintReal(); });
    $('#realContinue').addEventListener('click', startRound);
    $('#testBack').addEventListener('click', reviewIntro);
    $('#btnNext').addEventListener('click', nextQuestion);
    $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });
    paintIntro();
    show('#screenIntro');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
