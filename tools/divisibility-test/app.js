/* ============================================================
   Calculia — Divisibilidad
   Two stages, the flow of Operaciones: 1. explanation (slides with a
   drawing: when a number divides exactly and when it does not, the rules
   for 2, 5, 10 and 3, then the whole part and the decimal part of a
   division that does not come out exact), 2. test (one question at a
   time). There is no real-life stage: the test is the practice.
   Texts are in strings.<locale>.js, the slides and the test settings in data.js.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'divisibility-test';
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
  var stepIndex = 0;
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
  function digitSum(n) {
    return String(n).split('').reduce(function (sum, digit) { return sum + Number(digit); }, 0);
  }
  /* The digits after the decimal separator of r ÷ d, three at most: 1 ÷ 2 gives 5,
     1 ÷ 3 gives 333… (the dots mean the digits go on). r is never 0 here. */
  function digitsOf(r, d) {
    var out = '';
    var rest = r;
    for (var i = 0; i < 3 && rest; i += 1) {
      rest *= 10;
      out += Math.floor(rest / d);
      rest %= d;
    }
    return rest ? out + '…' : out;
  }
  /* What a calculator shows for n ÷ d, with the locale's separator: 7 ÷ 3 gives 2,333… */
  function valueText(n, d) {
    var r = n % d;
    return r ? Math.floor(n / d) + t('ui.decimalSep') + digitsOf(r, d) : String(n / d);
  }
  /* The decimal part on its own: what is left over, as a part of one pack. 1 ÷ 3 gives 0,333… */
  function decimalPart(r, d) { return '0' + t('ui.decimalSep') + digitsOf(r, d); }
  /* A number that does not divide exactly by d, with at least two full packs. */
  function notExact(d) {
    var n;
    do { n = rint(2 * d + 1, 49); } while (n % d === 0);
    return n;
  }

  /* ---- Drawing ----------------------------------------------------------
     `total` items shared in rows of `size`: each full row is a framed group,
     and what is left over sits apart, so «sobra» reads at a glance. */
  function items(count, cls) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="' + cls + '" aria-hidden="true">' + DOT + '</span>';
    return html;
  }
  function divisionText(total, size) {
    var text = fill(t('ui.division'), { T: total, d: size, q: Math.floor(total / size) });
    if (total % size) text += ', ' + fill(t('ui.remainder'), { r: total % size });
    return text;
  }
  function packHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-row ops-left-row">' + items(rest, 'ops-item ops-left') + '</div>';
    html += '</div>';
    return html + '<p class="ops-expr">' + divisionText(total, size) + '</p>';
  }
  /* The same packs as packHtml, but the leftover fills only part of a pack: the empty
     places are dashed, so the decimal part reads as a part of one pack. The caption is
     the calculator's answer, with its comma. */
  function missing(count) {
    var html = '';
    for (var i = 0; i < count; i += 1) html += '<span class="ops-missing" aria-hidden="true"></span>';
    return html;
  }
  function decimalHtml(total, size) {
    var full = Math.floor(total / size);
    var rest = total % size;
    var html = '<div class="ops-group-stack">';
    for (var g = 0; g < full; g += 1) html += '<div class="ops-group-box"><div class="ops-row">' + items(size, 'ops-item') + '</div></div>';
    if (rest) html += '<div class="ops-group-box ops-part-box"><div class="ops-row">' + items(rest, 'ops-item') + missing(size - rest) + '</div></div>';
    html += '</div>';
    return html + '<p class="ops-expr">' + fill(t('ui.calc'), { T: total, d: size, v: valueText(total, size) }) + '</p>';
  }

  /* ---- Menu-less explanation ----------------------------------------------- */
  function paintIntro() {
    var n = introIndex + 1;
    var slide = DATA.intro[introIndex].visual;
    $('#introTitle').textContent = t('intro.' + n + '.title');
    $('#introVisual').innerHTML = slide.calc ? decimalHtml(slide.total, slide.size) : packHtml(slide.total, slide.size);
    $('#introVisual').setAttribute('aria-label', t('ui.visualAria'));
    $('#introText').textContent = t('intro.' + n + '.text');
    var bar = $('#introProgress');
    bar.setAttribute('aria-label', fill(t('ui.count'), { i: n, n: DATA.intro.length }));
    bar.setAttribute('aria-valuemax', String(DATA.intro.length));
    bar.setAttribute('aria-valuenow', String(n));
    $('#introProgressFill').style.width = (n / DATA.intro.length * 100) + '%';
  }

  /* ---- Test -------------------------------------------------------------- */
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

  /* Answers as text: the right one and up to two others, all different, in a shuffled order. */
  function textOptions(correct, wrongs) {
    var values = [correct];
    wrongs.forEach(function (v) {
      if (values.length < 3 && values.indexOf(v) === -1) values.push(v);
    });
    return App.utils.shuffle(values).map(function (v) {
      return { html: v, aria: v, correct: v === correct };
    });
  }

  /* Numbers as answers: the right one and up to two others, all different and not
     below zero, in a shuffled order. */
  function numericOptions(correct, wrongs) {
    return textOptions(String(correct), wrongs.filter(function (v) { return v >= 0; }).map(String));
  }

  /* «Sí» and «No», in a shuffled order. */
  function yesNoOptions(yes) {
    return App.utils.shuffle([
      { html: t('ui.yes'), aria: t('ui.yes'), correct: yes },
      { html: t('ui.no'), aria: t('ui.no'), correct: !yes }
    ]);
  }

  /* Which number divides exactly: the right one is a multiple of `d`; the others are not. */
  function makePick() {
    var d = pick(DATA.divisors);
    var n = d * rint(6, Math.floor(99 / d));
    return {
      prompt: fill(t('q.pick.prompt'), { d: d }),
      hint: fill(t('q.pick.hint'), { d: d }),
      options: numericOptions(n, [n + 1, n - 1, n + d - 1]),
      explanation: fill(t('q.pick.explain'), { n: n, d: d })
    };
  }

  /* Does this number divide exactly? The answer is yes or no, by dividing. */
  function makeYesNo() {
    var d = pick(DATA.divisors);
    var yes = Math.random() < 0.5;
    var n = d * rint(6, Math.floor(99 / d));
    if (!yes) n += rint(1, d - 1);
    var values = { n: n, d: d, q: Math.floor(n / d), r: n % d };
    return {
      prompt: fill(t('q.yesno.prompt'), values),
      hint: t('q.yesno.hint'),
      options: yesNoOptions(yes),
      explanation: fill(t(yes ? 'q.yesno.yes' : 'q.yesno.no'), values)
    };
  }

  /* One step of a rule: a question with numbers as answers. */
  function numberStep(prompt, hint, correct, wrongs, explanation) {
    return { prompt: prompt, hint: hint, options: numericOptions(correct, wrongs), explanation: explanation };
  }
  /* One step of a rule: a yes-or-no question. */
  function yesNoStep(prompt, hint, yes, yesExplanation, noExplanation) {
    return { prompt: prompt, hint: hint, options: yesNoOptions(yes), explanation: yes ? yesExplanation : noExplanation };
  }

  /* The rules, one step at a time. The person works out the last digit
     (or the sum of the digits for 3), decides about that, and only then
     answers the question. Every step is a choice, so the question is
     answered at the last step, and the steps are practised, not skipped. */
  function makeRule(d) {
    var yes = Math.random() < 0.5;
    var n;
    do { n = rint(10, 98); } while ((n % d === 0) !== yes);
    var a = Math.floor(n / 10);
    var b = n % 10;
    var steps = [];
    if (d === 3) {
      var s = digitSum(n);
      var sumValues = { n: n, a: a, b: b, s: s, q3: Math.floor(s / 3), r: s % 3 };
      steps.push(numberStep(fill(t('q.rule.sumPrompt'), sumValues), t('q.rule.sumHint'), s,
        [s + 1, s + 2, s - 1], fill(t('q.rule.sumExplain'), sumValues)));
      steps.push(yesNoStep(fill(t('q.rule.div3Prompt'), sumValues), t('q.rule.div3Hint'), s % 3 === 0,
        fill(t('q.rule.div3Yes'), sumValues), fill(t('q.rule.div3No'), sumValues)));
    } else {
      var c = b;
      var values = { n: n, d: d, c: c };
      steps.push(numberStep(fill(t('q.rule.lastPrompt'), values), t('q.rule.lastHint'), c,
        [(c + 1) % 10, (c + 3) % 10, (c + 5) % 10], fill(t('q.rule.lastExplain'), values)));
      var digitOk = d === 2 ? c % 2 === 0 : (d === 5 ? c === 0 || c === 5 : c === 0);
      steps.push(yesNoStep(fill(t('q.rule.check.' + d + '.prompt'), values), t('q.rule.check.' + d + '.hint'), digitOk,
        fill(t('q.rule.check.' + d + '.yes'), values), fill(t('q.rule.check.' + d + '.no'), values)));
    }
    var finalValues = { n: n, d: d };
    steps.push(yesNoStep(fill(t('q.rule.finalPrompt'), finalValues), t('q.rule.finalHint'), yes,
      fill(t('q.rule.finalYes'), finalValues), fill(t('q.rule.finalNo'), finalValues)));
    return steps;
  }


  /* The whole part: how many full packs come out when the calculator shows a decimal.
     The wrong answers are the usual slips: one pack more, or the number of items. */
  function makeInteger() {
    var d = pick(DATA.divisors);
    var n = notExact(d);
    var q = Math.floor(n / d);
    var values = { n: n, d: d, q: q, v: valueText(n, d) };
    return {
      prompt: fill(t('q.integer.prompt'), values),
      hint: t('q.integer.hint'),
      options: numericOptions(q, [q + 1, n]),
      explanation: fill(t('q.integer.explain'), values)
    };
  }

  /* The decimal part: what is left over, as a part of one pack. The wrong answers are the
     leftover count (one ball, not one part of a pack) and the whole part. */
  function makeDecimal() {
    var d = pick(DATA.divisors);
    var n = notExact(d);
    var r = n % d;
    var values = { n: n, d: d, q: Math.floor(n / d), r: r, v: valueText(n, d), dec: decimalPart(r, d) };
    return {
      prompt: fill(t('q.decimal.prompt'), values),
      hint: t('q.decimal.hint'),
      options: textOptions(values.dec, [String(r), String(values.q)]),
      explanation: fill(t('q.decimal.explain'), values)
    };
  }

  /* A question is a list of steps: one step for most types, three for a rule. */
  function makeQuestion(type) {
    if (type.indexOf('rule') === 0) return { steps: makeRule(+type.slice(4)) };
    if (type === 'pick') return { steps: [makePick()] };
    if (type === 'yesno') return { steps: [makeYesNo()] };
    if (type === 'integer') return { steps: [makeInteger()] };
    return { steps: [makeDecimal()] };
  }

  /* The current step: its question, its options and the step label (Paso 1 de 3). */
  function renderQuestion() {
    question = round[qIndex];
    stepIndex = 0;
    firstTry = true;
    $('#progressFill').style.width = ((qIndex / round.length) * 100) + '%';
    $('#progressText').textContent = (qIndex + 1) + ' / ' + round.length;
    renderStep();
  }

  function renderStep() {
    var step = question.steps[stepIndex];
    answered = false;
    var steps = question.steps.length;
    var label = $('#stepLabel');
    label.textContent = fill(t('ui.stepOf'), { i: stepIndex + 1, n: steps });
    label.classList.toggle('hidden', steps < 2);
    $('#testPrompt').textContent = step.prompt;
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    var box = $('#testOptions');
    box.innerHTML = '';
    step.options.forEach(function (option) {
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

  function isLastStep() { return stepIndex === question.steps.length - 1; }

  function answer(option, button) {
    if (answered) return;
    var step = question.steps[stepIndex];
    var feedback = $('#feedback');
    if (option.correct) {
      answered = true;
      button.classList.add('correct');
      feedback.textContent = t('ui.right') + ' ' + step.explanation;
      feedback.className = 'feedback success';
      /* The question scores once, at its last step, and only if no step was missed. */
      if (isLastStep() && firstTry) {
        roundRight += 1;
        progress.stars += 1;
        save();
        paintStars();
      }
      $('#testOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      $('#btnNext').textContent = isLastStep() ? t('ui.next') : t('ui.nextStep');
      $('#btnNext').classList.remove('hidden');
      return;
    }
    /* A wrong answer: the hint, and the option stays off. Nothing is punished. */
    firstTry = false;
    button.classList.add('incorrect');
    button.disabled = true;
    feedback.textContent = step.hint;
    feedback.className = 'feedback error';
  }

  function nextQuestion() {
    if (!isLastStep()) {
      stepIndex += 1;
      renderStep();
      return;
    }
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
