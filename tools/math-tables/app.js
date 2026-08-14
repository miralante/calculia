(function () {
  'use strict';

  var TOOL_ID = 'math-tables';
  var $ = App.utils.$;
  var progress = App.storage.get(TOOL_ID);
  var mode = null;    // 'steps' | 'add' | 'decompose' | 'multiply' | 'divide' | 'parity'
  var table = null;   // chosen table (add/multiply) or step size (steps)
  var round = [];     // items: { a, b, sym } with sym '+', '−', '×' or '÷'
  var index = 0;
  var attempts = 0;

  if (typeof progress.stars !== 'number') progress.stars = 0;

  function saveProgress() { App.storage.set(TOOL_ID, progress); }
  function show(element) { element.classList.remove('oculto'); }
  function hide(element) { element.classList.add('oculto'); }
  function randInt(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function fill(key, values) {
    var text = App.i18n.t(key);
    Object.keys(values).forEach(function (name) {
      text = text.split('{' + name + '}').join(values[name]);
    });
    return text;
  }

  function itemResult(item) {
    if (item.sym === '+') return item.a + item.b;
    if (item.sym === '−') return item.a - item.b;
    if (item.sym === '÷') return item.a / item.b;
    return item.a * item.b;
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
    if (mode === 'parity') return 'Parity';
    return mode === 'add' ? 'Add' : 'Multiply';
  }

  function isEven(item) { return item.a % 2 === 0; }

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

  /* Addition: first addend in color 0, second in color 1. With the total
     revealed, the combined row keeps both colors so the sum stays visible. */
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

  /* Multiplication: b groups of a dots, one color per group, so the
     repetition can be seen and counted group by group. */
  function renderMultiplyVisual(container, item) {
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    for (var i = 0; i < item.b; i += 1) {
      groups.appendChild(dotRow(item.a, DATA.dotColors[i % DATA.dotColors.length]));
    }
    container.appendChild(groups);
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

  /* Even/odd: dots paired two by two in the base color; a single leftover
     dot in the second color means the number is odd. */
  function renderParityVisual(container, item) {
    var stack = document.createElement('div');
    stack.className = 'group-stack';
    var pairs = Math.floor(item.a / 2);
    for (var i = 0; i < pairs; i += 1) {
      stack.appendChild(dotRow(2, DATA.dotColors[0]));
    }
    if (item.a % 2) stack.appendChild(dotRow(1, DATA.dotColors[1]));
    container.appendChild(stack);
  }

  function renderVisual(container, item, showTotal) {
    container.innerHTML = '';
    container.setAttribute('aria-label', fill('visual' + keySuffix(item), itemValues(item)));
    if (mode === 'multiply') renderMultiplyVisual(container, item);
    else if (mode === 'divide') renderDivideVisual(container, item);
    else if (mode === 'decompose') renderDecomposeVisual(container, item, showTotal);
    else if (mode === 'parity') renderParityVisual(container, item);
    else if (stepsInRows(item)) renderStepsRowVisual(container, item, showTotal);
    else if (item.sym === '−') renderSubtractVisual(container, item);
    else renderAddVisual(container, item, showTotal);
  }

  function equationText(item, withResult) {
    return item.a + ' ' + item.sym + ' ' + item.b + (withResult ? ' = ' + itemResult(item) : '');
  }

  /* ---- Round generation ---- */

  function tablesRound() {
    var facts = [];
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      facts.push({ a: table, b: n, sym: mode === 'add' ? '+' : '×' });
    }
    return App.utils.shuffle(facts);
  }

  function stepsRound() {
    var items = [];
    var inRows = table >= 5;
    for (var i = 0; i < DATA.perRound; i += 1) {
      var subtract = i % 2 === 1;
      var base;
      if (inRows) base = table * randInt(1, DATA.stepMultipleMax);
      else base = subtract ? randInt(table, DATA.stepBaseMax) : randInt(1, DATA.stepBaseMax);
      items.push({ a: base, b: table, sym: subtract ? '−' : '+' });
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

  function parityRound() {
    var items = [];
    for (var i = 0; i < DATA.perRound; i += 1) {
      items.push({ a: randInt(0, DATA.parity.max), sym: 'parity' });
    }
    return items;
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

  /* ---- Learn screen (add/multiply tables only) ---- */

  function renderLearn() {
    $('#learnTitle').textContent = fill(mode === 'add' ? 'tableTitleAdd' : 'tableTitleMultiply', { n: table });
    var list = $('#factList');
    list.innerHTML = '';
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      (function (value) {
        var item = { a: table, b: value, sym: mode === 'add' ? '+' : '×' };
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secundario fact-row';
        button.textContent = equationText(item, true);
        button.addEventListener('click', function () {
          list.querySelectorAll('.fact-row').forEach(function (row) { row.classList.remove('activa'); });
          button.classList.add('activa');
          renderVisual($('#learnVisual'), item, true);
        });
        list.appendChild(button);
      })(n);
    }
    renderVisual($('#learnVisual'), { a: table, b: 1, sym: mode === 'add' ? '+' : '×' }, true);
  }

  /* ---- Quiz screen ---- */

  function answerOptions(item) {
    var correct = itemResult(item);
    var step = 1;
    if (mode === 'multiply') step = item.a;
    else if (stepsInRows(item)) step = item.b;
    var candidates = [correct - step, correct + step, correct - 1, correct + 1, correct - 2, correct + 2];
    var options = [correct];
    candidates.forEach(function (value) {
      if (options.length < 3 && value >= 0 && options.indexOf(value) === -1) options.push(value);
    });
    return App.utils.shuffle(options);
  }

  function parityOptions() {
    return App.utils.shuffle([
      { value: true, label: App.i18n.t('evenLabel') },
      { value: false, label: App.i18n.t('oddLabel') }
    ]);
  }

  function renderQuiz() {
    var item = round[index];
    attempts = 0;
    $('#progressFill').style.width = ((index / round.length) * 100) + '%';
    $('#progressText').textContent = fill('progress', { current: index + 1, total: round.length });
    $('#quizPrompt').textContent = mode === 'parity' ? fill('parityPrompt', itemValues(item)) : equationText(item, false) + ' = ?';
    renderVisual($('#quizVisual'), item, false);
    $('#feedback').textContent = '';
    $('#explanation').textContent = '';
    hide($('#explanation'));
    hide($('#nextFact'));
    var options = $('#options');
    options.innerHTML = '';
    var choices = mode === 'parity' ? parityOptions() :
      answerOptions(item).map(function (v) { return { value: v, label: String(v) }; });
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
    var correct = mode === 'parity' ? isEven(item) : itemResult(item);
    if (value !== correct) {
      attempts += 1;
      button.disabled = true;
      App.feedback.encourage(feedback);
      if (attempts === 1) {
        feedback.textContent += ' ' + fill('hint' + keySuffix(item), itemValues(item));
      }
      return;
    }
    progress.stars += 1;
    saveProgress();
    $('#stars').textContent = '⭐ ' + progress.stars;
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
    var pickAnother = $('#anotherTable');
    if (mode === 'decompose' || mode === 'divide' || mode === 'parity') hide(pickAnother);
    else {
      show(pickAnother);
      pickAnother.textContent = App.i18n.t(mode === 'steps' ? 'chooseAnotherLevel' : 'chooseAnotherTable');
    }
    $('#finishText').textContent = fill('roundSummary', { count: round.length, stars: progress.stars });
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
$('#transfer').textContent = App.i18n.t('transferencia');
  }

  /* ---- Navigation ---- */

  function showOnly(id) {
    ['#screenMenu', '#screenTables', '#screenLearn', '#screenQuiz', '#screenFinish'].forEach(function (screen) {
      if (screen === id) show($(screen));
      else hide($(screen));
    });
  }

  function startPractice() {
    if (mode === 'steps') round = stepsRound();
    else if (mode === 'decompose') round = decomposeRound();
    else if (mode === 'divide') round = divideRound();
    else if (mode === 'parity') round = parityRound();
    else round = tablesRound();
    if (mode === 'decompose' || mode === 'divide' || mode === 'parity') {
      $('#quizBack').textContent = App.i18n.t('core.backToMenu');
    }
    index = 0;
    showOnly('#screenQuiz');
    renderQuiz();
  }

  function backFromQuiz() {
    var noPicker = mode === 'decompose' || mode === 'divide' || mode === 'parity';
    showOnly(noPicker ? '#screenMenu' : '#screenTables');
  }

  /* The picker screen holds the table buttons (add/multiply) or the
     step-size level buttons (steps). */
  function openPicker() {
    var grid = $('#tableGrid');
    grid.innerHTML = '';
    var steps = mode === 'steps';
    $('#tablesTitle').textContent = App.i18n.t(steps ? 'chooseLevel' : 'chooseTable');
    $('#quizBack').textContent = App.i18n.t(steps ? 'backToLevels' : 'backToTables');
    var values = steps ? DATA.stepLevels : DATA.tables;
    values.forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn table-btn';
      button.textContent = fill(steps ? 'stepLevel' : 'tableButton', { n: value });
      button.addEventListener('click', function () {
        table = value;
        if (steps) startPractice();
        else { showOnly('#screenLearn'); renderLearn(); }
      });
      grid.appendChild(button);
    });
    showOnly('#screenTables');
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
        if (entry.id === 'decompose' || entry.id === 'divide' || entry.id === 'parity') startPractice();
        else openPicker();
      });
      grid.appendChild(button);
    });
  }

  function init() {
    App.i18n.apply();
    $('#stars').textContent = '⭐ ' + progress.stars;
    renderModeMenu();
    $('#tablesBack').addEventListener('click', function () { showOnly('#screenMenu'); });
    $('#learnBack').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#quizBack').addEventListener('click', backFromQuiz);
    $('#startPractice').addEventListener('click', startPractice);
    $('#nextFact').addEventListener('click', nextFact);
    $('#playAgain').addEventListener('click', startPractice);
    $('#anotherTable').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#anotherOperation').addEventListener('click', function () { showOnly('#screenMenu'); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
