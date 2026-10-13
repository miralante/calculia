/* ============================================================
   Calculia — Math Tables
   The four arithmetic tables practiced with colored dots:
     - addition  (a + b): operands in two colors.
     - multiply  (a × b): b groups of a dots, one color per group.
     - subtract  (a - b): minuend in one color, subtrahend crossed
                       out in another — the remaining dots are the
                       answer.
     - divide    (a ÷ b): floor(a/b) full groups of b dots, one color
                       per group, with the leftover dot (if any) in
                       its own colour so the visual reads as the
                       answer is "the number of full groups".
   The first three operations use a 3-option shuffle (the same
   shape as before); divide uses a free-text input because the
   answer is a single number that the user must compute mentally,
   and the leftover is shown only as feedback. A "Learn" screen
   for every table shows every row with its dots, then the quiz
   round tests the chosen table.
   ============================================================ */
(function () {
  'use strict';

  var TOOL_ID = 'math-tables';
  var $ = App.utils.$;
  var progress = App.storage.get(TOOL_ID);
  var mode = null;    // 'add' | 'multiply' | 'subtract' | 'divide'
  var table = null;   // chosen table number
  var round = [];     // items: { a, b, sym } with sym '+' or '×' or '−' or '÷'
  var index = 0;
  var attempts = 0;

  if (typeof progress.stars !== 'number') progress.stars = 0;

  function saveProgress() { App.storage.set(TOOL_ID, progress); }
  function show(element) { element.classList.remove('hidden'); }
  function hide(element) { element.classList.add('hidden'); }

  function fill(key, values) {
    var text = App.i18n.t(key);
    Object.keys(values).forEach(function (name) {
      text = text.split('{' + name + '}').join(values[name]);
    });
    return text;
  }

  function itemResult(item) {
    if (mode === 'add') return item.a + item.b;
    if (mode === 'multiply') return item.a * item.b;
    if (mode === 'subtract') return item.a - item.b;
    if (mode === 'divide') return Math.floor(item.a / item.b);
    return 0;
  }

  function itemRemainder(item) {
    if (mode === 'divide') return item.a % item.b;
    return 0;
  }

  /* i18n key suffix for the hint/explanation/visual of the current
     question. PascalCased so it slots into 'Add' / 'Multiply' /
     'Subtract' / 'Divide' cleanly. */
  function keySuffix() {
    if (mode === 'add') return 'Add';
    if (mode === 'multiply') return 'Multiply';
    if (mode === 'subtract') return 'Subtract';
    if (mode === 'divide') return 'Divide';
    return '';
  }

  function itemValues(item) {
    return {
      a: item.a,
      b: item.b,
      result: itemResult(item),
      rest: itemRemainder(item)
    };
  }

  /* divide is "compute the quotient, the rest is feedback". Other
     three are "compute the result directly". */
  function usesInput() { return mode === 'divide'; }

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

  /* Subtraction: the minuend's dots stay visible while the subtrahend's
     are crossed out in a second color, so the remaining dots (color 0)
     can be counted by the user. The crossed-out dots use a 'dot-removed'
     span so the answer is "the dots that survived". */
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

  /* Division: as many full rows of `b` dots as fit, one color per row
     (same trick as multiply), plus a leftover row for the remainder if
     any. The leftover row uses the next slot in dotColors, distinct
     from a "full row", so the answer is literally "the number of full
     rows of dots". */
  function renderDivideVisual(container, item) {
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    var quotient = Math.floor(item.a / item.b);
    var remainder = item.a % item.b;
    for (var i = 0; i < quotient; i += 1) {
      groups.appendChild(dotRow(item.b, DATA.dotColors[i % DATA.dotColors.length]));
    }
    if (remainder > 0) {
      groups.appendChild(dotRow(remainder, DATA.dotColors[quotient % DATA.dotColors.length], true));
    }
    container.appendChild(groups);
  }

  function renderVisual(container, item, showTotal) {
    container.innerHTML = '';
    container.setAttribute('aria-label', fill('visual' + keySuffix(), itemValues(item)));
    if (mode === 'multiply') renderMultiplyVisual(container, item);
    else if (mode === 'subtract') renderSubtractVisual(container, item);
    else if (mode === 'divide') renderDivideVisual(container, item);
    else renderAddVisual(container, item, showTotal);
  }

  function equationText(item, withResult) {
    return item.a + ' ' + item.sym + ' ' + item.b + (withResult ? ' = ' + itemResult(item) : '');
  }

  /* ---- Round generation ---- */

  /* Per-mode row construction:
       add        : table + 1, table + 2, …, table + factsPerTable
       multiply   : table × 1, table × 2, …, table × factsPerTable
       subtract   : (table+1) − table, (table+2) − table, …, (table+factsPerTable) − table
                    → results 1..factsPerTable, no negatives.
       divide     : 1 ÷ table, 2 ÷ table, …, factsPerTable ÷ table
                    → dividends correlativos. Most tables have some
                      dividends that don't divide evenly (this is the
                      pedagogy the user asked for: real-world division
                      with remainder). */
  function tablesRound() {
    var facts = [];
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      var fact;
      if (mode === 'add') fact = { a: table, b: n, sym: '+' };
      else if (mode === 'multiply') fact = { a: table, b: n, sym: '×' };
      else if (mode === 'subtract') fact = { a: table + n, b: table, sym: '−' };
      else if (mode === 'divide') fact = { a: n, b: table, sym: '÷' };
      facts.push(fact);
    }
    return App.utils.shuffle(facts);
  }

  /* ---- Learn screen (all four operations) ---- */

  function renderLearn() {
    var list = $('#factList');
    list.innerHTML = '';
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      (function (value) {
        var item;
        if (mode === 'add') item = { a: table, b: value, sym: '+' };
        else if (mode === 'multiply') item = { a: table, b: value, sym: '×' };
        else if (mode === 'subtract') item = { a: table + value, b: table, sym: '−' };
        else if (mode === 'divide') item = { a: value, b: table, sym: '÷' };
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
    /* Open on the first row with the result revealed so the picture is
       right there, not just the line of text. */
    var firstItem;
    if (mode === 'subtract') firstItem = { a: table + 1, b: table, sym: '−' };
    else if (mode === 'divide') firstItem = { a: 1, b: table, sym: '÷' };
    else firstItem = { a: table, b: 1, sym: mode === 'add' ? '+' : '×' };
    renderVisual($('#learnVisual'), firstItem, true);
  }

  /* ---- Quiz screen ---- */

  /* Three-option shuffle for the four operations EXCEPT divide (which
     uses a free-text input). The stepSize for the candidate generation
     follows the operation: multiply and divide use the table number
     as the "right unit of mistake"; add/subtract use 1. */
  function answerOptions(item) {
    var correct = itemResult(item);
    var step;
    if (mode === 'multiply') step = item.a;
    else if (mode === 'divide') step = Math.max(1, item.b);
    else step = 1;
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
    /* Equation prompt: always "a sym b = ?" so the same layout serves
       every operation regardless of which input the user uses. */
    $('#quizPrompt').textContent = equationText(item, false) + ' = ?';
    renderVisual($('#quizVisual'), item, false);
    $('#feedback').textContent = '';
    $('#explanation').textContent = '';
    hide($('#explanation'));
    hide($('#nextFact'));
    $('#restLine').classList.add('hidden');

    if (usesInput()) {
      renderInputAnswer(item);
    } else {
      renderButtonOptions(item);
    }
  }

  /* Three-option shuffle — the path used by add/multiply/subtract. */
  function renderButtonOptions(item) {
    hide($('#inputOption'));
    var options = $('#options');
    options.innerHTML = '';
    options.classList.remove('hidden');
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

  /* Free-text input — only used by division. The input clears and
     re-focuses on every new question, because most users will leave
     the previous answer in place if we don't reset it. Enter in the
     input clicks "check" for keyboard-only users. */
  function renderInputAnswer(item) {
    var options = $('#options');
    options.innerHTML = '';
    options.classList.add('hidden');
    var inputOpt = $('#inputOption');
    show(inputOpt);
    var input = $('#divideInput');
    input.value = '';
    inputOpt.classList.remove('hidden');
    input.focus();
  }

  /* Used by both paths (button options and the input's "check" button).
     The "button" argument is optional — for the button path it is the
     button the user clicked; for the input path we don't have a button
     (the check is what we are about to do), but we still want to
     disable the input afterwards. */
  function checkAnswer(item, value, button) {
    var feedback = $('#feedback');
    var correct = itemResult(item);
    if (value !== correct) {
      attempts += 1;
      if (button) button.disabled = true;
      App.feedback.encourage(feedback);
      feedback.textContent += ' ' + fill('hint' + keySuffix(), itemValues(item));
      if (usesInput()) {
        App.feedback.lockUntilAck([$('#divideInput'), $('#checkDivide')], feedback);
      } else {
        App.feedback.lockUntilAck($('#options').querySelectorAll('button'), feedback);
      }
      return;
    }
    progress.stars += 1;
    saveProgress();
    $('#stars').textContent = '';
    App.feedback.success(feedback);
    renderVisual($('#quizVisual'), item, true);
    /* For division, the explanation text reflects the remainder; for
       the other three the explain* key alone covers it. */
    var explanation = fill('explain' + keySuffix(), itemValues(item));
    $('#explanation').textContent = explanation;
    show($('#explanation'));
    if (usesInput()) {
      $('#divideInput').disabled = true;
      $('#checkDivide').disabled = true;
      /* Show the remainder on its own line so the user sees both the
         success feedback and the spare dot visually explained. */
      var rest = itemRemainder(item);
      if (rest > 0) {
        $('#restLine').textContent = '';
        var restEl = $('#restLine');
        restEl.appendChild(document.createTextNode(App.i18n.t('restLine') + ' '));
        var num = document.createElement('strong');
        num.textContent = String(rest);
        restEl.appendChild(num);
        restEl.classList.remove('hidden');
      }
    } else {
      $('#options').querySelectorAll('button').forEach(function (option) { option.disabled = true; });
    }
    show($('#nextFact'));
    $('#nextFact').focus();
  }

  function checkDivideAnswer() {
    var item = round[index];
    var raw = $('#divideInput').value;
    var value = parseInt(raw, 10);
    if (isNaN(value) || value < 0) {
      var feedback = $('#feedback');
      App.feedback.encourage(feedback);
      feedback.textContent = App.i18n.t('checkFirst');
      App.feedback.lockUntilAck([$('#divideInput'), $('#checkDivide')], feedback);
      return;
    }
    checkAnswer(item, value, null);
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

  /* Between rounds the input becomes disabled (see checkAnswer). Reset
     it back to enabled for the next round so it accepts input again. */
  function resetInputControls() {
    var input = $('#divideInput');
    if (input) input.disabled = false;
    var btn = $('#checkDivide');
    if (btn) btn.disabled = false;
  }

  function startPractice() {
    round = tablesRound();
    index = 0;
    resetInputControls();
    showOnly('#screenQuiz');
    renderQuiz();
  }

  /* The picker screen holds the table buttons for the chosen mode.
     All four modes share the same shape: pick a table number, then
     see it in the learn screen before the quiz. */
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

    /* Division input-row wiring. The input's "Enter" key counts as a
       click on the check button so keyboard-only users are not stuck
       reaching for the mouse. */
    var checkDivideBtn = $('#checkDivide');
    if (checkDivideBtn) checkDivideBtn.addEventListener('click', checkDivideAnswer);
    var divideInput = $('#divideInput');
    if (divideInput) {
      divideInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkDivideAnswer();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
