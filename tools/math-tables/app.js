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
  var channel = 'written';   // 'written' | 'audio': how the question reaches the user
  var order = 'random';      // 'sequential' | 'random': the order of the facts in a round

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

  /* ---- Audio module ----
     The written module shows the equation and the dots. The audio module
     shows neither: the question is only spoken, as in escribir números.
     The equation is written again once the answer is right. */
  function isAudio() { return channel === 'audio'; }

  /* The operation word that is read aloud between the two numbers. */
  function spokenOperation() {
    if (mode === 'add') return App.i18n.t('spokenAdd');
    if (mode === 'multiply') return App.i18n.t('spokenMultiply');
    if (mode === 'subtract') return App.i18n.t('spokenSubtract');
    return App.i18n.t('spokenDivide');
  }

  /* Reads the question aloud, e.g. "3 por 4". */
  function speakItem(item) {
    if (!App.tts) return;
    App.tts.speak(item.a + ' ' + spokenOperation() + ' ' + item.b);
  }

  /* ---- Dots visuals ---- */

  /* One dot. `removed` crosses it out (it is not counted any more). When
     `label` is given the dot carries that number: inside the dot, or under
     it when `below` is set (subtraction). The quiz never passes a label. */
  function dotCell(color, opts) {
    var cell = document.createElement('span');
    cell.className = 'dot-cell' + (opts.label !== undefined ? ' dot-cell-num' : '') +
      (opts.below ? ' dot-cell-below' : '');
    var dot = document.createElement('span');
    dot.className = opts.removed ? 'dot dot-removed' : 'dot';
    dot.style.backgroundColor = color;
    cell.appendChild(dot);
    if (opts.label !== undefined) {
      var label = document.createElement('span');
      label.className = 'dot-label';
      label.textContent = String(opts.label);
      cell.appendChild(label);
    }
    if (opts.removed) {
      var cross = document.createElement('span');
      cross.className = 'dot-cross';
      cross.setAttribute('aria-hidden', 'true');
      cross.textContent = '✕';
      cell.appendChild(cross);
    }
    return cell;
  }

  /* A row of `count` dots. opts.from is the number the first dot carries
     (the rest count on from it); leave it out and the dots carry no number. */
  function dotRow(count, color, opts) {
    var o = opts || {};
    var row = document.createElement('div');
    row.className = 'dot-row';
    for (var i = 0; i < count; i += 1) {
      row.appendChild(dotCell(color, {
        removed: o.removed,
        below: o.below,
        label: o.from === undefined ? undefined : o.from + i
      }));
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
  function renderAddVisual(container, item, showTotal, numbered) {
    var operands = document.createElement('div');
    operands.className = 'visual-line';
    /* Each addend is counted from 1 on its own. The result counts on from 1
       to the total: the first addend's dots, then the second's go on after. */
    operands.appendChild(dotRow(item.a, DATA.dotColors[0], { from: numbered ? 1 : undefined }));
    operands.appendChild(sign('+'));
    operands.appendChild(dotRow(item.b, DATA.dotColors[1], { from: numbered ? 1 : undefined }));
    container.appendChild(operands);
    if (!showTotal) return;
    var total = document.createElement('div');
    total.className = 'visual-line';
    total.appendChild(sign('='));
    var combined = document.createElement('div');
    combined.className = 'dot-row';
    combined.appendChild(dotRow(item.a, DATA.dotColors[0], { from: numbered ? 1 : undefined }));
    combined.appendChild(dotRow(item.b, DATA.dotColors[1], { from: numbered ? item.a + 1 : undefined }));
    total.appendChild(combined);
    container.appendChild(total);
  }

  /* A factor label: the number that sits on the top or on the left of the
     dots, so the array reads as "a × b". */
  function factor(value, className) {
    var span = document.createElement('span');
    span.className = 'mult-factor ' + className;
    span.textContent = String(value);
    return span;
  }

  /* Multiplication: b groups of a dots, one color per group, so the
     repetition can be seen and counted group by group. The factors frame
     the dots: a on the top (dots per group), b on the left (number of
     groups), and the × sign in the corner where they meet. */
  function renderMultiplyVisual(container, item, numbered) {
    var grid = document.createElement('div');
    grid.className = 'mult-grid';
    grid.appendChild(sign('×'));
    grid.appendChild(factor(item.a, 'mult-top'));
    grid.appendChild(factor(item.b, 'mult-left'));
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    for (var i = 0; i < item.b; i += 1) {
      groups.appendChild(dotRow(item.a, DATA.dotColors[i % DATA.dotColors.length],
        { from: numbered ? i * item.a + 1 : undefined }));
    }
    grid.appendChild(groups);
    container.appendChild(grid);
  }

  /* Subtraction: the minuend's dots stay visible while the subtrahend's
     are crossed out in a second color, so the remaining dots (color 0)
     can be counted by the user. The crossed-out dots use a 'dot-removed'
     span so the answer is "the dots that survived". */
  function renderSubtractVisual(container, item, numbered) {
    var line = document.createElement('div');
    line.className = 'visual-line';
    var row = document.createElement('div');
    row.className = 'dot-row';
    /* The numbers of this table sit under each dot, so the crossed-out
       ones are counted on from the ones that stay. */
    var below = !!numbered;
    row.appendChild(dotRow(item.a - item.b, DATA.dotColors[0], { from: numbered ? 1 : undefined, below: below }));
    row.appendChild(dotRow(item.b, DATA.dotColors[1], { removed: true, from: numbered ? item.a - item.b + 1 : undefined, below: below }));
    line.appendChild(row);
    container.appendChild(line);
  }

  /* Division: as many full rows of `b` dots as fit, one color per row
     (same trick as multiply), plus a leftover row for the remainder if
     any. The leftover row uses the next slot in dotColors, distinct
     from a "full row", so the answer is literally "the number of full
     rows of dots". */
  function renderDivideVisual(container, item, numbered) {
    var groups = document.createElement('div');
    groups.className = 'group-stack';
    var quotient = Math.floor(item.a / item.b);
    var remainder = item.a % item.b;
    for (var i = 0; i < quotient; i += 1) {
      groups.appendChild(dotRow(item.b, DATA.dotColors[i % DATA.dotColors.length],
        { from: numbered ? i * item.b + 1 : undefined }));
    }
    if (remainder > 0) {
      groups.appendChild(dotRow(remainder, DATA.dotColors[quotient % DATA.dotColors.length],
        { removed: true, from: numbered ? quotient * item.b + 1 : undefined }));
    }
    container.appendChild(groups);
  }

  /* `numbered` is set only by the demonstration, never by the quiz: the
     quiz asks the user to count, so the dots carry no numbers there. */
  function renderVisual(container, item, showTotal, numbered) {
    container.innerHTML = '';
    container.setAttribute('aria-label', fill('visual' + keySuffix(), itemValues(item)));
    if (mode === 'multiply') renderMultiplyVisual(container, item, numbered);
    else if (mode === 'subtract') renderSubtractVisual(container, item, numbered);
    else if (mode === 'divide') renderDivideVisual(container, item, numbered);
    else renderAddVisual(container, item, showTotal, numbered);
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
  /* The n-th operation of the current table (n from 1 to factsPerTable). */
  function factAt(n) {
    if (mode === 'add') return { a: table, b: n, sym: '+' };
    if (mode === 'multiply') return { a: table, b: n, sym: '×' };
    if (mode === 'subtract') return { a: table + n, b: table, sym: '−' };
    return { a: n, b: table, sym: '÷' };
  }

  /* Sequential keeps the table in order (1, 2, … 10). Random shuffles it. */
  function tablesRound() {
    var facts = [];
    for (var n = 1; n <= DATA.factsPerTable; n += 1) facts.push(factAt(n));
    return order === 'sequential' ? facts : App.utils.shuffle(facts);
  }

  /* ---- Learn screen (all four operations) ----
     Two states. The list shows every operation of the table WITHOUT its
     answer. Tapping one opens its demonstration: the dots are counted out
     with a number on each, the answer is written under the equation, and
     the arrows move to the previous or next operation of the table. */

  var demoIndex = 0;

  function renderLearn() {
    var list = $('#factList');
    list.innerHTML = '';
    for (var n = 1; n <= DATA.factsPerTable; n += 1) {
      (function (index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secondary fact-row';
        button.textContent = equationText(factAt(index + 1), false) + ' = ?';
        button.addEventListener('click', function () { showDemo(index); });
        list.appendChild(button);
      })(n - 1);
    }
    showLearnList();
  }

  function showLearnList() {
    show($('#factList'));
    hide($('#learnDemo'));
    show($('#practiceModes'));
    show($('#learnBack'));
  }

  function showDemo(index) {
    demoIndex = index;
    var item = factAt(index + 1);
    $('#demoEquation').textContent = equationText(item, true);
    renderVisual($('#learnVisual'), item, true, true);
    $('#demoCounter').textContent = fill('demoCounter', { i: index + 1, n: DATA.factsPerTable });
    $('#demoPrev').disabled = index === 0;
    $('#demoNext').disabled = index === DATA.factsPerTable - 1;
    hide($('#factList'));
    show($('#learnDemo'));
    hide($('#practiceModes'));
    hide($('#learnBack'));
  }

  function demoStep(delta) {
    var next = demoIndex + delta;
    if (next < 0 || next >= DATA.factsPerTable) return;
    showDemo(next);
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
    if (isAudio()) {
      $('#quizPrompt').textContent = App.i18n.t('audioPrompt');
      $('#quizVisual').classList.add('hidden');
      $('#quizReplay').classList.remove('hidden');
      speakItem(item);
    } else {
      $('#quizPrompt').textContent = equationText(item, false) + ' = ?';
      $('#quizVisual').classList.remove('hidden');
      $('#quizReplay').classList.add('hidden');
      renderVisual($('#quizVisual'), item, false);
    }
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
      feedback.textContent += ' ' + App.feedback.hintText(
        fill(isAudio() ? 'hintAudio' : ('hint' + keySuffix()), itemValues(item)),
        button ? button.textContent : String(value));
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
    if (isAudio()) {
      $('#quizPrompt').textContent = equationText(item, true);
    } else {
      renderVisual($('#quizVisual'), item, true);
    }
    /* For division, the explanation text reflects the remainder; for
       the other three the explain* key alone covers it. The audio module
       has no dots to point at, so it explains with the equation itself. */
    var explanation = isAudio()
      ? fill(itemRemainder(item) > 0 ? 'explainSpokenRest' : 'explainSpoken',
          Object.assign({ op: spokenOperation() }, itemValues(item)))
      : fill('explain' + keySuffix(), itemValues(item));
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
    if (App.tts) App.tts.stop();
    ['#screenTables', '#screenLearn', '#screenQuiz', '#screenFinish'].forEach(function (screen) {
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

  /* The four practice modules of the learn screen (written or audio, in
     order or random). The button carries both choices in data attributes. */
  function startPractice(button) {
    channel = button.getAttribute('data-channel');
    order = button.getAttribute('data-order');
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

  /* Each operation has its own card on the landing page: ?op=add, multiply,
     subtract or divide. Without a valid one there is nothing to practise,
     so the page goes back to the landing. */
  function operationFromUrl() {
    var op = new URLSearchParams(window.location.search).get('op');
    for (var i = 0; i < DATA.modes.length; i += 1) {
      if (DATA.modes[i].id === op) return op;
    }
    return null;
  }

  function init() {
    App.i18n.apply();
    $('#stars').textContent = '';
    mode = operationFromUrl();
    if (!mode) {
      window.location.replace('../../');
      return;
    }
    $('#tablesBack').addEventListener('click', function () { window.location.href = '../../'; });
    $('#learnBack').addEventListener('click', function () { showOnly('#screenTables'); });
    $('#quizBack').addEventListener('click', function () { showOnly('#screenTables'); });
    App.utils.$$('#practiceModes [data-channel]').forEach(function (button) {
      button.addEventListener('click', function () { startPractice(button); });
    });
    $('#quizReplay').addEventListener('click', function () { speakItem(round[index]); });
    $('#demoPrev').addEventListener('click', function () { demoStep(-1); });
    $('#demoNext').addEventListener('click', function () { demoStep(1); });
    $('#demoBack').addEventListener('click', showLearnList);
    $('#nextFact').addEventListener('click', nextFact);

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
    openPicker();
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
