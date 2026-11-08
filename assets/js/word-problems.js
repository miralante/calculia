/* ============================================================
   Calculia — Word problems and short quizzes. Used by the four «Resuelve problemas»
   activities (adding, subtracting, multiplying, dividing) and by the three
   «Divisores y múltiplos» activities (factorization, multiples, divisibility).
   Each activity passes its problems from data.js; the statements,
   explanations and hints are in strings.<locale>.js. A correct answer
   at the first try is a star. A wrong one shows a hint and can be tried
   again. The round ends with one button: «Volver al inicio».
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
      var endSummary = $('#endSummary');
      var problems = [];
      var current = 0;
      var correctFirstTry = 0;

      function t(key) { return App.i18n.t(key); }
      function save() { App.storage.set(config.toolId, progress); }
      function paintStars() { starsEl.textContent = '⭐ ' + progress.stars; }
      function showScreen(id) {
        $('#screenGame').classList.toggle('hidden', id !== 'screenGame');
        $('#screenEnd').classList.toggle('hidden', id !== 'screenEnd');
      }
      /* How far through the round: `done` problems answered out of the total. */
      function paintBar(done) {
        fillEl.style.width = (problems.length ? done / problems.length * 100 : 0) + '%';
        barEl.setAttribute('aria-valuemax', String(problems.length));
        barEl.setAttribute('aria-valuenow', String(done));
      }

      function render() {
        var p = problems[current];
        iconEl.textContent = p.icon;
        statementEl.textContent = fill(t('problems.' + p.id), p);
        feedbackEl.className = 'feedback hidden';
        feedbackEl.textContent = '';
        btnNext.classList.add('hidden');
        optionsEl.innerHTML = '';
        p.options.forEach(function (value) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn btn-secondary problem-option';
          button.textContent = String(value);
          button.addEventListener('click', function () { choose(p, value, button); });
          optionsEl.appendChild(button);
        });
        paintBar(current);
      }

      function choose(p, value, button) {
        if (p.answered) return;
        if (value !== p.answer) {
          p.missed = true;
          button.classList.add('incorrect');
          button.disabled = true;
          App.feedback.encourage(feedbackEl);
          feedbackEl.classList.remove('hidden');
          feedbackEl.textContent += ' ' + t('hint');
          return;
        }
        p.answered = true;
        optionsEl.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        button.classList.add('correct');
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
        endSummary.textContent = fill(t('endSummary'), {
          n: correctFirstTry, total: problems.length, stars: progress.stars,
          starsWord: App.i18n.starsWord(progress.stars), nWord: App.i18n.starsWord(correctFirstTry)
        });
        showScreen('screenEnd');
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
      $('#endBackToStart').addEventListener('click', function () { location.href = '../../'; });

      App.i18n.apply();
      paintStars();
      startRound();
    }
  };
})();
