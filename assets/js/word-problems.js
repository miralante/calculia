/* ============================================================
   Calculia — Word problems and short quizzes. Used by the four «Resuelve problemas»
   activities (adding, subtracting, multiplying, dividing) and by the
   «Divisores y múltiplos» activity (factorization).
   Each activity passes its problems from data.js; the statements,
   explanations and hints are in strings.<locale>.js. A correct answer
   at the first try is a star. A wrong one shows a hint and can be tried
   again. The round ends with the achievement screen: «A por más» plays another round.

   Two ways to answer, set by config.answer:
     'options' (default)  the child picks one of the answers shown.
     'keypad'             the child writes the number with a keypad and
                          checks it: the answer is built, not picked.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  function fill(text, vars) {
    return String(text).replace(/\{(\w+)\}/g, function (match, key) {
      return vars[key] !== undefined ? String(vars[key]) : match;
    });
  }

  App.wordProblems = {
    setup: function (config) {
      var progress = App.storage.get(config.toolId);
      if (typeof progress.stars !== 'number') progress.stars = 0;
      if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;

      var starsEl = $('#stars');
      var barEl = $('#progressBar');
      var fillEl = $('#progressFill');
      var iconEl = $('#problemIcon');
      var statementEl = $('#statement');
      var optionsEl = $('#options');
      var feedbackEl = $('#feedback');
      var btnNext = $('#btnNext');
      var problems = [];
      var current = 0;
      var correctFirstTry = 0;

      function t(key) { return App.i18n.t(key); }
      function save() { App.storage.set(config.toolId, progress); }
      function paintStars() { App.chrome.paintStars(progress.stars, starsEl); }
      function showScreen(id) {
        $('#screenGame').classList.toggle('hidden', id !== 'screenGame');
      }
      /* How far through the round: `done` problems answered out of the total. */
      function paintBar(done) {
        fillEl.style.width = (problems.length ? done / problems.length * 100 : 0) + '%';
        barEl.setAttribute('aria-valuemax', String(problems.length));
        barEl.setAttribute('aria-valuenow', String(done));
      }

      var keypadMode = config.answer === 'keypad';
      var KEYPAD_MAX_DIGITS = 3;
      var keypadActive = false;

      function render() {
        var p = problems[current];
        iconEl.textContent = p.icon;
        statementEl.textContent = fill(t('problems.' + p.id), p);
        feedbackEl.className = 'feedback hidden';
        feedbackEl.textContent = '';
        btnNext.classList.add('hidden');
        optionsEl.innerHTML = '';
        keypadActive = keypadMode && !p.answered;
        if (keypadMode) renderKeypad(p);
        else renderOptions(p);
        paintBar(current);
      }

      function renderOptions(p) {
        p.options.forEach(function (value) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-secondary problem-option';
          button.textContent = String(value);
          button.addEventListener('click', function () { choose(p, value, button); });
          optionsEl.appendChild(button);
        });
      }

      /* The keypad: the digits typed so far, the keys 0–9, erase and check. */
      function renderKeypad(p) {
        p.typed = p.typed || '';
        var display = document.createElement('p');
        display.className = 'answer-display';
        display.id = 'answerDisplay';
        display.setAttribute('aria-live', 'polite');
        display.textContent = p.typed;
        optionsEl.appendChild(display);

        var pad = document.createElement('div');
        pad.className = 'answer-pad';
        var keys = [];
        function addKey(label, aria, action, extraClass) {
          var key = document.createElement('button');
          key.type = 'button';
          key.className = 'btn btn-secondary answer-key' + (extraClass ? ' ' + extraClass : '');
          key.textContent = label;
          if (aria) key.setAttribute('aria-label', aria);
          key.addEventListener('click', action);
          pad.appendChild(key);
          keys.push(key);
          return key;
        }
        ['1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (d) {
          addKey(d, null, function () { press(p, d); });
        });
        addKey('⌫', t('eraseDigit'), function () { erase(p); }, 'answer-key-erase');
        addKey('0', null, function () { press(p, '0'); });
        var checkKey = addKey('✓', t('checkAnswer'), function () { check(p); }, 'answer-key-check');
        optionsEl.appendChild(pad);
        if (p.answered) {
          Array.prototype.forEach.call(pad.querySelectorAll('button'), function (b) { b.disabled = true; });
        }
        p.keypad = { display: display, keys: keys, check: checkKey };
      }

      function paintTyped(p) {
        if (p.keypad) p.keypad.display.textContent = p.typed;
      }

      function press(p, digit) {
        if (p.answered || p.typed.length >= KEYPAD_MAX_DIGITS) return;
        if (p.typed === '0') p.typed = '';
        p.typed += digit;
        paintTyped(p);
      }

      function erase(p) {
        if (p.answered) return;
        p.typed = p.typed.slice(0, -1);
        paintTyped(p);
      }

      /* Keyboard support: the digits, Backspace to erase and Enter to check. */
      document.addEventListener('keydown', function (event) {
        if (!keypadActive || problems[current] === undefined) return;
        var p = problems[current];
        if (p.answered) return;
        if (/^[0-9]$/.test(event.key)) { press(p, event.key); event.preventDefault(); }
        else if (event.key === 'Backspace') { erase(p); event.preventDefault(); }
        else if (event.key === 'Enter') { check(p); event.preventDefault(); }
      });

      function choose(p, value, button) {
        if (p.answered) return;
        if (value !== p.answer) {
          p.missed = true;
          button.classList.add('incorrect');
          button.disabled = true;
          wrongTry();
          return;
        }
        p.answered = true;
        App.feedback.markCorrect(button, optionsEl.querySelectorAll('button'));
        button.classList.add('correct');
        rightTry(p);
      }

      /* keypad mode: the typed number is checked, a wrong one clears the display. */
      function check(p) {
        if (p.answered) return;
        if (p.typed === '') {
          feedbackEl.className = 'feedback';
          feedbackEl.textContent = t('typeAnswer');
          return;
        }
        if (Number(p.typed) !== p.answer) {
          p.missed = true;
          p.typed = '';
          paintTyped(p);
          wrongTry();
          return;
        }
        p.answered = true;
        keypadActive = false;
        if (p.keypad) {
          /* The keys stay on screen (disabled): markCorrect would hide them as the other answers. */
          p.keypad.display.classList.add('correct');
          p.keypad.check.classList.add('correct');
          p.keypad.keys.forEach(function (key) { key.disabled = true; });
        }
        rightTry(p);
      }

      /* A wrong try: encouragement and the hint; the child may try again. */
      function wrongTry() {
        App.feedback.encourage(feedbackEl);
        feedbackEl.classList.remove('hidden');
        feedbackEl.textContent += ' ' + t('hint');
      }

      /* A right try: a star if it was the first try, the explanation, then Next or the end. */
      function rightTry(p) {
        if (!p.missed) {
          correctFirstTry += 1;
          progress.stars += 1;
          save();
          paintStars();
        }
        App.feedback.success(feedbackEl);
        feedbackEl.textContent = '✅ ' + fill(t('explain'), { a: p.a, b: p.b, r: p.answer });
        paintBar(current + 1);
        if (current === problems.length - 1) finish();
        else {
          btnNext.classList.remove('hidden');
          btnNext.focus();
        }
      }

      function finish() {
        progress.completedRounds += 1;
        save();
        App.feedback.celebrate(t('endTitle'), null, App.feedback.starsGoal(progress.stars));
      }

      function startRound() {
        problems = config.buildRound().map(function (p) {
          return {
            id: p.id, icon: p.icon, a: p.a, b: p.b, answer: p.answer,
            options: App.utils.shuffle([p.answer].concat(p.wrong)),
            answered: false, missed: false
          };
        });
        current = 0;
        correctFirstTry = 0;
        showScreen('screenGame');
        render();
      }

      btnNext.addEventListener('click', function () {
        current += 1;
        render();
      });

      App.i18n.apply();
      paintStars();
      startRound();
    }
  };
})();
