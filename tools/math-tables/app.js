/* ============================================================
   Calculia — Math Tables
   Add and multiplication tables, practiced with colored dots:
   a "Learn" screen for each table shows every row with its
   dots, the quiz round tests the chosen table with three
   shuffled options, near-miss distractors included.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'math-tables';
  var $ = App.utils.$;
  var progress = App.storage.get(TOOL_ID);
  var mode = null;    // 'add' | 'multiply'
  var table = null;   // chosen table number
  var round = [];     // items: { a, b, sym } with sym '+' or '×'
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
    return mode === 'add' ? item.a + item.b : item.a * item.b;
  }

  /* i18n key suffix for the hint/explanation of the current question. */
  function keySuffix() {
    return mode === 'add' ? 'Add' : 'Multiply';
  }

  function itemValues(item) {
    return {
      a: item.a,
      b: item.b,
      result: itemResult(item)
    };
  }

  /* ---- Dots visuals ---- */

  function dotRow(count, color) {
    var row = document.createElement('div');
    row.className = 'dot-row';
    for (var i = 0; i < count; i += 1) {
      var dot = document.createElement('span');
      dot.className = 'dot';
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

  function renderVisual(container, item, showTotal) {
    container.innerHTML = '';
    container.setAttribute('aria-label', fill('visual' + keySuffix(), itemValues(item)));
    if (mode === 'multiply') renderMultiplyVisual(container, item);
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

  /* ---- Learn screen (add/multiply tables only) ---- */

  function renderLearn() {
    $('#learnTitle').textContent = '';
    var list = $('#factList');
    list.innerHTML = '';
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      (function (value) {
        var item = { a: table, b: value, sym: mode === 'add' ? '+' : '×' };
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secondary fact-row';
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
    var step = mode === 'multiply' ? item.a : 1;
    var candidates = [correct - step, correct + step, correct - 1, correct + 1, correct - 2, correct + 2];
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
      feedback.textContent += ' ' + fill('hint' + keySuffix(), itemValues(item));
      App.feedback.lockUntilAck($('#options').querySelectorAll('button'), feedback);
      return;
    }
    progress.stars += 1;
    saveProgress();
    $('#stars').textContent = '';
    App.feedback.success(feedback);
    renderVisual($('#quizVisual'), item, true);
    $('#explanation').textContent = '';
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
    ['#screenMenu', '#screenTables', '#screenLearn', '#screenQuiz', '#screenFinish'].forEach(function (screen) {
      if (screen === id) show($(screen));
      else hide($(screen));
    });
  }

  function startPractice() {
    round = tablesRound();
    index = 0;
    showOnly('#screenQuiz');
    renderQuiz();
  }

  /* The picker screen holds the table buttons for the chosen mode
     (add or multiply). Both modes share the same shape: pick a
     table number, then see it in the learn screen before the quiz. */
  function openPicker() {
    var grid = $('#tableGrid');
    grid.innerHTML = '';
    $('#tablesTitle').textContent = '';
    DATA.tables.forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn table-btn';
      button.textContent = fill('tableButton', { n: value });
      button.addEventListener('click', function () {
        table = value;
        showOnly('#screenLearn');
        renderLearn();
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
        openPicker();
      });
      grid.appendChild(button);
    });
  }

  function init() {
    App.i18n.apply();
    $('#stars').textContent = '';
    renderModeMenu();
    $('#tablesBack').addEventListener('click', function () { showOnly('#screenMenu'); });
    $('#learnBack').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#quizBack').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#startPractice').addEventListener('click', startPractice);
    $('#nextFact').addEventListener('click', nextFact);
    $('#playAgain').addEventListener('click', startPractice);
    $('#anotherTable').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#anotherOperation').addEventListener('click', function () { showOnly('#screenMenu'); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
