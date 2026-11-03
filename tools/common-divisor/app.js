/* ============================================================
   Calculia — Máximo común divisor
   Three stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: the biggest number of equal groups, the divisors of two numbers,
   the common ones), 2. real life (one example at a time: bags, tiles,
   boxes), 3. test (one question at a time). The numbers and the drawings are
   built here; the texts are in strings.<locale>.js and the slides in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'common-divisor';
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
  function divisorsOf(n) {
    var list = [];
    for (var d = 1; d <= n; d += 1) if (n % d === 0) list.push(d);
    return list;
  }
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

  /* ---- Drawing ----------------------------------------------------------
     Every drawing shows the numbers as small icons, so the sharing can be
     counted. A caption under it says what was counted. */
  function items(count, icon, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + icon + '</span>';
    return html;
  }
  /* `g` baskets, each with its share of the two kinds of item. */
  function basketsHtml(a, b, g, iconA, iconB) {
    var html = '<div class="cm-baskets">';
    for (var k = 0; k < g; k += 1) {
      html += '<div class="ops-group-box"><div class="ops-row">' +
        items(a / g, iconA, 'ops-item') + items(b / g, iconB, 'ops-item') + '</div></div>';
    }
    return html + '</div><p class="ops-expr">' +
      fill(t('ui.share'), { g: g, x: a / g, y: b / g }) + '</p>';
  }
  /* A floor of a × b, covered with squares of g × g: a/g squares wide, b/g high. */
  function tilesHtml(a, b, g) {
    var html = '<div class="cm-tiles">';
    for (var r = 0; r < b / g; r += 1) {
      html += '<div class="ops-row">' + items(a / g, '', 'cm-tile') + '</div>';
    }
    return html + '</div><p class="ops-expr">' + fill(t('ui.tiles'), { a: a, b: b, g: g }) + '</p>';
  }
  /* One row of numbers, the ones that are in both lists marked, the greatest of them filled in. */
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
  /* The divisors of a and of b; the common ones marked, the greatest common one filled. */
  function divisorsHtml(a, b) {
    var la = divisorsOf(a);
    var lb = divisorsOf(b);
    var common = la.filter(function (v) { return lb.indexOf(v) !== -1; });
    var best = gcd(a, b);
    return '<div class="cm-lists">' +
      chipRow(fill(t('ui.divisorsOf'), { n: a }), la, common, best) +
      chipRow(fill(t('ui.divisorsOf'), { n: b }), lb, common, best) +
      '</div>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'baskets') return basketsHtml(spec.a, spec.b, spec.g, spec.iconA, spec.iconB);
    if (spec.kind === 'tiles') return tilesHtml(spec.a, spec.b, spec.g);
    return divisorsHtml(spec.a, spec.b);
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

  /* Two numbers from the pairs: the answer is their greatest common divisor. */
  function pair() {
    var g = pick(DATA.gcds);
    var p = pick(DATA.factorPairs);
    return { a: g * p[0], b: g * p[1], g: g };
  }
  function explanation(p) {
    return fill(t('q.gcd.explain'), {
      a: p.a, b: p.b, g: p.g,
      la: divisorsOf(p.a).join(', '), lb: divisorsOf(p.b).join(', ')
    });
  }

  /* The greatest common divisor, asked as a number. The wrong answers are other
     common divisors that are too small, and numbers that are too big. */
  function makeGcd() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.gcd.prompt'), values),
      hint: fill(t('q.gcd.hint'), values),
      options: numericOptions(p.g, [p.g * 2, p.g + 1, p.g - 1]),
      explanation: explanation(p)
    };
  }

  /* The same question as a story: how many equal baskets, with nothing left over. */
  function makeStory() {
    var p = pair();
    var values = { a: p.a, b: p.b };
    return {
      prompt: fill(t('q.story.prompt'), values),
      hint: t('q.story.hint'),
      options: numericOptions(p.g, [p.g * 2, p.g + 1, p.g - 1]),
      explanation: explanation(p)
    };
  }

  /* Which number divides both: the right one is the greatest common divisor; the
     others are numbers that do not divide both. */
  function makeCommon() {
    var p = pair();
    var values = { a: p.a, b: p.b, g: p.g };
    var wrongs = [p.a + 1, p.b + 1, p.a + p.b, p.g + 1].filter(function (x) {
      return !(p.a % x === 0 && p.b % x === 0);
    });
    return {
      prompt: fill(t('q.common.prompt'), values),
      hint: fill(t('q.common.hint'), values),
      options: numericOptions(p.g, wrongs),
      explanation: fill(t('q.common.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'gcd') return makeGcd();
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
