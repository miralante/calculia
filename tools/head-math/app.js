/* ============================================================
   Calculia — Head Math
   Three modes practice mental arithmetic with dots: count in
   your head (adding/subtracting a step), break a number apart
   to make 10 first, and divide by 10 by counting full rows.
   decompose and divide have no level picker; "count in your
   head" picks the step size (1/2/3/5/10) first.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'head-math';
  var $ = App.utils.$;
  var progress = App.storage.get(TOOL_ID);
  var mode = null;    // 'steps' | 'decompose' | 'divide'
  var step = null;    // chosen step size (steps mode only)
  var round = [];     // items: { a, b, sym } with sym '+' or '−' (steps),
                      // '+' (decompose) or '÷' (divide)
  var index = 0;
  var attempts = 0;

  if (typeof progress.stars !== 'number') progress.stars = 0;

  function saveProgress() { App.storage.set(TOOL_ID, progress); }
  function show(element) { element.classList.remove('hidden'); }
  function hide(element) { element.classList.add('hidden'); }
  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function fill(key, values) {
    var text = App.i18n.t(key);
    Object.keys(values).forEach(function (name) {
      text = text.split('{' + name + '}').join(values[name]);
    });
    return text;
  }

  function itemResult(item) {
    if (item.sym === '÷') return item.a / item.b;
    if (item.sym === '−') return item.a - item.b;
    return item.a + item.b;
  }

  /* Steps of 5 and 10 are drawn and counted in rows instead of one by one. */
  function stepsInRows(item) { return mode === 'steps' && item.b >= 5; }

  /* i18n key suffix for the hint/explanation of the current question. */
  function keySuffix(item) {
    if (mode === 'steps') {
      var base = item.sym === '+' ? 'StepsAdd' : 'StepsSubtract';
      return stepsInRows(item) ? base + 'Row' : base;
    }
    if (mode === 'decompose') return 'Decompose';
    if (mode === 'divide') return 'Divide';
    return '';
  }

  function itemValues(item) {
    var toTen = 10 - item.a;
    return {
      a: item.a,
      b: item.b,
      result: itemResult(item),
      toTen: toTen,
      rest: item.b - toTen
    };
  }

  /* ---- Dots visuals ---- */

  function dotRow(count, color, removed) {
    var row = document.createElement('div');
    row.className = 'dot-row';
    for (var i = 0; i < count; i += 1) {
      var dot = document.createElement('span');
      dot.className = removed ? 'dot dot-removed' : 'dot';
      dot.style.backgroundColor = color;
      row.appendChild(dot);
    }
    return row;
  }

  function sign(character) {
    var span = document.createElement('span');
    span.className = 'visual-sign';
    span.textContent = character;
    return span;
  }

  /* Subtraction: the removed dots stay visible but crossed out, so the
     remaining ones can be counted. */
  function renderSubtractVisual(container, item) {
    var line = document.createElement('div');
    line.className = 'visual-line';
    var row = document.createElement('div');
    row.className = 'dot-row';
    row.appendChild(dotRow(item.a - item.b, DATA.dotColors[0]));
    row.appendChild(dotRow(item.b, DATA.dotColors[1], true));
    line.appendChild(row);
    container.appendChild(line);
  }

  /* Addition: first addend in color 0, second in color 1. */
  function renderAddVisual(container, item, showTotal) {
    var operands = document.createElement('div');
    operands.className = 'visual-line';
    operands.appendChild(dotRow(item.a, DATA.dotColors[0]));
    operands.appendChild(sign('+'));
    operands.appendChild(dotRow(item.b, DATA.dotColors[1]));
    container.appendChild(operands);
    if (!showTotal) return;
    var total = document.createElement('div');
    total.className = 'visual-line';
    total.appendChild(sign('='));
    var combined = document.createElement('div');
    combined.className = 'dot-row';
    combined.appendChild(dotRow(item.a, DATA.dotColors[0]));
    combined.appendChild(dotRow(item.b, DATA.dotColors[1]));
    total.appendChild(combined);
    container.appendChild(total);
  }

  /* Division by 10: the dots are laid out in rows of 10, one color per row,
     so the quotient is simply the number of rows. */
  function renderDivideVisual(container, item) {
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    var rows = item.a / item.b;
    for (var i = 0; i < rows; i += 1) {
      groups.appendChild(dotRow(item.b, DATA.dotColors[i % DATA.dotColors.length]));
    }
    container.appendChild(groups);
  }

  function fullRows(count, chunk, color) {
    var stack = document.createElement('div');
    stack.className = 'group-stack';
    for (var i = 0; i < count / chunk; i += 1) {
      stack.appendChild(dotRow(chunk, color));
    }
    return stack;
  }

  /* Steps of 5/10 (bases are multiples of the step): the base is drawn as
     full rows of the step size, and the added or removed amount is exactly
     one more row in the second color, so counting goes in fives or tens. */
  function renderStepsRowVisual(container, item, showTotal) {
    var line = document.createElement('div');
    line.className = 'visual-line';
    if (item.sym === '−') {
      var stack = fullRows(item.a - item.b, item.b, DATA.dotColors[0]);
      stack.appendChild(dotRow(item.b, DATA.dotColors[1], true));
      line.appendChild(stack);
      container.appendChild(line);
      return;
    }
    line.appendChild(fullRows(item.a, item.b, DATA.dotColors[0]));
    line.appendChild(sign('+'));
    line.appendChild(dotRow(item.b, DATA.dotColors[1]));
    container.appendChild(line);
    if (!showTotal) return;
    var total = document.createElement('div');
    total.className = 'visual-line';
    total.appendChild(sign('='));
    var combined = fullRows(item.a, item.b, DATA.dotColors[0]);
    combined.appendChild(dotRow(item.b, DATA.dotColors[1]));
    total.appendChild(combined);
    container.appendChild(total);
  }

  /* Decompose (make ten first): the second addend is split from the start —
     the part that completes ten in color 1, the rest in color 2. When the
     total is revealed, the ten regroups into a framed row of 10. */
  function renderDecomposeVisual(container, item, showTotal) {
    var values = itemValues(item);
    var line = document.createElement('div');
    line.className = 'visual-line';
    if (showTotal) {
      var ten = document.createElement('div');
      ten.className = 'dot-row ten-frame';
      ten.appendChild(dotRow(item.a, DATA.dotColors[0]));
      ten.appendChild(dotRow(values.toTen, DATA.dotColors[1]));
      line.appendChild(ten);
      line.appendChild(sign('+'));
      line.appendChild(dotRow(values.rest, DATA.dotColors[2]));
    } else {
      line.appendChild(dotRow(item.a, DATA.dotColors[0]));
      line.appendChild(sign('+'));
      line.appendChild(dotRow(values.toTen, DATA.dotColors[1]));
      line.appendChild(dotRow(values.rest, DATA.dotColors[2]));
    }
    container.appendChild(line);
  }

  function renderVisual(container, item, showTotal) {
    container.innerHTML = '';
    container.setAttribute('aria-label', fill('visual' + keySuffix(item), itemValues(item)));
    if (mode === 'divide') renderDivideVisual(container, item);
    else if (mode === 'decompose') renderDecomposeVisual(container, item, showTotal);
    else if (stepsInRows(item)) renderStepsRowVisual(container, item, showTotal);
    else if (item.sym === '−') renderSubtractVisual(container, item);
    else renderAddVisual(container, item, showTotal);
  }

  /* ---- Round generation ---- */

  function stepsRound() {
    var items = [];
    var inRows = step >= 5;
    for (var i = 0; i < DATA.perRound; i += 1) {
      var subtract = i % 2 === 1;
      var base;
      if (inRows) base = step * randInt(1, DATA.stepMultipleMax);
      else base = subtract ? randInt(step, DATA.stepBaseMax) : randInt(1, DATA.stepBaseMax);
      items.push({ a: base, b: step, sym: subtract ? '−' : '+' });
    }
    return App.utils.shuffle(items);
  }

  function divideRound() {
    var items = [];
    for (var n = 1; n <= DATA.divide.maxQuotient; n += 1) {
      items.push({ a: n * DATA.divide.divisor, b: DATA.divide.divisor, sym: '÷' });
    }
    return App.utils.shuffle(items).slice(0, DATA.perRound);
  }

  function decomposeRound() {
    var pairs = [];
    for (var a = DATA.decompose.aMin; a <= DATA.decompose.aMax; a += 1) {
      for (var b = DATA.decompose.minSum - a; b <= DATA.decompose.bMax; b += 1) {
        pairs.push({ a: a, b: b, sym: '+' });
      }
    }
    return App.utils.shuffle(pairs).slice(0, DATA.perRound);
  }

  /* ---- Quiz screen ---- */

  function answerOptions(item) {
    var correct = itemResult(item);
    var stepSize = 1;
    if (mode === 'divide') stepSize = DATA.divide.divisor;
    else if (stepsInRows(item)) stepSize = item.b;
    var candidates = [correct - stepSize, correct + stepSize, correct - 1, correct + 1, correct - 2, correct + 2];
    var options = [correct];
    candidates.forEach(function (value) {
      if (options.length < 3 && value >= 0 && options.indexOf(value) === -1) options.push(value);
    });
    return App.utils.shuffle(options);
  }

  function renderQuiz() {
    var item = round[index];
    attempts = 0;
    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = '';
    $('#quizPrompt').textContent = '';
    renderVisual($('#quizVisual'), item, false);
    $('#feedback').textContent = '';
    $('#explanation').textContent = '';
    hide($('#explanation'));
    hide($('#nextFact'));
    var options = $('#options');
    options.innerHTML = '';
    var choices = answerOptions(item).map(function (v) { return { value: v, label: String(v) }; });
    choices.forEach(function (choice) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn option-btn';
      button.textContent = choice.label;
      button.addEventListener('click', function () { checkAnswer(item, choice.value, button); });
      options.appendChild(button);
    });
  }

  function checkAnswer(item, value, button) {
    var feedback = $('#feedback');
    var correct = itemResult(item);
    if (value !== correct) {
      attempts += 1;
      button.disabled = true;
      App.feedback.encourage(feedback);
      feedback.textContent += ' ' + fill('hint' + keySuffix(item), itemValues(item));
      App.feedback.lockUntilAck($('#options').querySelectorAll('button'), feedback);
      return;
    }
    progress.stars += 1;
    saveProgress();
    $('#stars').textContent = '';
    App.feedback.success(feedback);
    renderVisual($('#quizVisual'), item, true);
    $('#explanation').textContent = fill('explain' + keySuffix(item), itemValues(item));
    show($('#explanation'));
    $('#options').querySelectorAll('button').forEach(function (option) { option.disabled = true; });
    show($('#nextFact'));
    $('#nextFact').focus();
  }

  function nextFact() {
    index += 1;
    if (index < round.length) {
      renderQuiz();
      return;
    }
    hide($('#screenQuiz'));
    show($('#screenFinish'));
    $('#finishText').textContent = App.i18n.t('roundSummary')
      .replace('{count}', round.length)
      .replace('{stars}', progress.stars);
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ---- Navigation ---- */

  function showOnly(id) {
    ['#screenMenu', '#screenLevels', '#screenQuiz', '#screenFinish'].forEach(function (screen) {
      if (screen === id) show($(screen));
      else hide($(screen));
    });
  }

  function startRound() {
    if (mode === 'steps') round = stepsRound();
    else if (mode === 'decompose') round = decomposeRound();
    else round = divideRound();
    index = 0;
    showOnly('#screenQuiz');
    renderQuiz();
  }

  /* The level picker screen holds the step-size buttons for "count in
     your head". decompose and divide have no picker and call startRound
     straight from the menu. */
  function openStepPicker() {
    var grid = $('#levelGrid');
    grid.innerHTML = '';
    DATA.stepLevels.forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn operation-btn';
      button.innerHTML = '<span class="operation-icon" aria-hidden="true">🔢</span><span>' +
        App.i18n.t('stepLevel').replace('{n}', value) + '</span>';
      button.addEventListener('click', function () {
        step = value;
        startRound();
      });
      grid.appendChild(button);
    });
    showOnly('#screenLevels');
  }

  function renderModeMenu() {
    var grid = $('#operationGrid');
    grid.innerHTML = '';
    DATA.modes.forEach(function (entry) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn operation-btn';
      button.innerHTML = '<span class="operation-icon" aria-hidden="true">' + entry.icon + '</span><span>' +
        App.i18n.t(entry.id + 'Name') + '</span><small>' + App.i18n.t(entry.id + 'Detail') + '</small>';
      button.addEventListener('click', function () {
        mode = entry.id;
        if (entry.id === 'steps') openStepPicker();
        else startRound();
      });
      grid.appendChild(button);
    });
  }

  function init() {
    App.i18n.apply();
    $('#stars').textContent = '';
    renderModeMenu();
    $('#nextFact').addEventListener('click', nextFact);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
