/* ============================================================
   Calculia — Múltiplos
   Two stages, the flow of Divisibilidad: 1. explanation (slides with a
   drawing: what a multiple is, the first multiples of 2, 3, 4 and 5, and
   when a number is not a multiple), 2. test (one question at a time).
   There is no real-life stage: the test is the practice.
   Texts are in strings.<locale>.js, the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'multiples';
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

  /* ---- Drawing ----------------------------------------------------------
     Every drawing is made of small dots. A row of dots is a group; the
     product of its groups is written under it («3 × 4 = 12»). */
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function productText(count, each) {
    return fill(t('ui.product'), { k: count, d: each, m: count * each });
  }
  /* `count` equal groups of `each` dots, one above the other, and their product. */
  function groupsHtml(count, each) {
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < count; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(each, 'ops-item') + '</div></div>';
    return html + '</div><p class="ops-expr">' + productText(count, each) + '</p>';
  }
  /* The first multiples of `each`: one row per step, each with its product beside it. */
  function ladderHtml(each, count) {
    var html = '<div class="mul-ladder">';
    for (var k = 1; k <= count; k += 1) {
      html += '<div class="mul-row"><div class="ops-group-box"><div class="ops-row">' + items(each, 'ops-item') + '</div></div>' +
        '<span class="mul-label">' + productText(k, each) + '</span></div>';
    }
    return html + '</div>';
  }
  /* `total` dots in rows of `size`: full rows are groups; what is left over sits apart. */
  function packHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-row ops-left-row">' + items(rest, 'ops-item ops-left') + '</div>';
    html += '</div>';
    var text = fill(t('ui.division'), { T: total, d: size, q: full });
    if (rest) text += ', ' + fill(t('ui.remainder'), { r: rest });
    return html + '<p class="ops-expr">' + text + '</p>';
  }
  function visualHtml(spec) {
    if (spec.kind === 'groups') return groupsHtml(spec.count, spec.each);
    if (spec.kind === 'ladder') return ladderHtml(spec.each, spec.count);
    return packHtml(spec.total, spec.size);
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

  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Which number is a multiple of d: the right one is d × k; the others are not. */
  function makePick() {
    var d = pick(DATA.numbers);
    var k = rint(2, 9);
    var n = d * k;
    return {
      prompt: fill(t('q.pick.prompt'), { d: d }),
      hint: fill(t('q.pick.hint'), { d: d }),
      options: numericOptions(n, [n + 1, n - 1, n + d + 1]),
      explanation: fill(t('q.pick.explain'), { n: n, d: d, k: k })
    };
  }

  /* Which multiple is number k of d: the right one is d × k; the wrong ones are the neighbours. */
  function makeFirst() {
    var d = pick(DATA.numbers);
    var k = rint(2, 9);
    var n = d * k;
    return {
      prompt: fill(t('q.first.prompt'), { d: d, k: k }),
      hint: fill(t('q.first.hint'), { d: d, k: k }),
      options: numericOptions(n, [n + d, n - d, n + 1]),
      explanation: fill(t('q.first.explain'), { n: n, d: d, k: k })
    };
  }

  /* Is this number a multiple? If not, it lies between two multiples of d. */
  function makeYesNo() {
    var d = pick(DATA.numbers);
    var yes = Math.random() < 0.5;
    var k = rint(2, 9);
    var n = yes ? d * k : d * k + rint(1, d - 1);
    var below = d * Math.floor(n / d);
    var values = { n: n, d: d, k: k, a: below, b: below + d };
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: fill(t('q.yesno.hint'), values),
      options: yesNoOptions(yes),
      explanation: fill(t(yes ? 'q.yesno.yes' : 'q.yesno.no'), values)
    };
  }

  /* Three multiples are shown; the next one is the last plus d. */
  function makeNext() {
    var d = pick(DATA.numbers);
    var k = rint(1, 5);
    var a = d * k;
    var b = d * (k + 1);
    var c = d * (k + 2);
    var next = d * (k + 3);
    var values = { a: a, b: b, c: c, d: d, n: next };
    return {
      prompt: fill(t('q.next.prompt'), values),
      hint: t('q.next.hint'),
      options: numericOptions(next, [next + 1, next - 1, c + 1]),
      explanation: fill(t('q.next.explain'), values)
    };
  }

  function makeQuestion(type) {
    if (type === 'pick') return makePick();
    if (type === 'first') return makeFirst();
    if (type === 'yesno') return makeYesNo();
    return makeNext();
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
