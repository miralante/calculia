/* ============================================================
   Calculia — Sheet test: the whole round on one sheet.

   Every question of the round is on one screen. The person picks one
   option per question and «Comprobar» checks them all at once: a right
   answer locks in green, a missed one shows its hint (never the answer)
   and stays open. The first check of a round scores; later checks only
   walk through what is still wrong.

   The activity keeps its own screens and its own question generator. It
   gives the sheet the questions and the elements, and the sheet paints
   and checks them:

     var sheetTest = App.sheetTest.create({
       sheetEl:      #testSheet element
       checkBtn:     #btnCheck element
       newRoundBtn:  #btnNewRound element
       progressFill: #progressFill element
       progressText: #progressText element
       onScored:     function (rightFirstTry) { ... } (optional)
       showExplanation: true to show the explanation after a right answer (optional)
       hintFallback: text shown when a question has no hint (optional)
       onAllRight:   function () called when every question is right (optional)
     });
     sheetTest.set(questions);  // questions: [{ prompt, hint, explanation, visual, visualAria,
                                //   visualDecorative, legend, inline, options: [{ html, aria, correct }] }]
     sheetTest.render();        // paints the sheet
     sheetTest.check;           // the «Comprobar» handler

   Used by the five time activities (time-units, time-convert,
   time-durations, time-compare and date-format) and by the three-stage
   flow of activity-flow-sheet.js, which passes the explanation, the
   picture and the hook options. The sheet has no closing screen.

   Exposes window.App.sheetTest. Needs feedback.js (App.feedback.encourage).
   ============================================================ */
(function () {
  'use strict';

  function create(config) {
    var sheetEl = config.sheetEl;
    var btnCheck = config.checkBtn;
    var btnNewRound = config.newRoundBtn;
    var progressFill = config.progressFill;
    var progressText = config.progressText;
    var onScored = config.onScored || function () {};
    var onAllRight = config.onAllRight || function () {};
    var showExplanation = !!config.showExplanation;
    var hintFallback = config.hintFallback || '';

    /* One entry per question: { question, selected, correct }.
       selected is the index of the option picked, or null; correct is
       null until «Comprobar», then true or false. */
    var roundSheets = [];

    /* The questions of a round, without any state yet. */
    function set(questions) {
      roundSheets = questions.map(function (q) {
        return { question: q, selected: null, correct: null };
      });
    }

    /* Paints the whole round at once. */
    function render() {
      sheetEl.innerHTML = '';
      roundSheets.forEach(function (sheet, i) {
        var card = document.createElement('article');
        card.className = 'card stack test-sheet-card';

        var promptEl = document.createElement('p');
        promptEl.className = 'prompt';
        promptEl.textContent = sheet.question.prompt;
        card.appendChild(promptEl);

        if (sheet.question.visual) {
          var visualEl = document.createElement('div');
          visualEl.className = 'visual';
          visualEl.innerHTML = sheet.question.visual;
          /* A picture gets a label when it needs one; a purely decorative one is
             hidden from the screen reader. */
          if (sheet.question.visualAria) {
            visualEl.setAttribute('role', 'img');
            visualEl.setAttribute('aria-label', sheet.question.visualAria);
          } else if (sheet.question.visualDecorative) {
            visualEl.setAttribute('aria-hidden', 'true');
          }
          card.appendChild(visualEl);
        }

        if (sheet.question.legend) {
          var legendEl = document.createElement('p');
          legendEl.className = 'legend';
          legendEl.innerHTML = sheet.question.legend;
          card.appendChild(legendEl);
        }

        var optionsEl = document.createElement('div');
        optionsEl.className = 'stack options';
        if (sheet.question.inline) optionsEl.classList.add('options-row');
        sheet.question.options.forEach(function (op, j) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'option-btn';
          btn.innerHTML = op.html;
          if (op.aria) btn.setAttribute('aria-label', op.aria);
          btn.addEventListener('click', function () { selectOption(i, j); });
          optionsEl.appendChild(btn);
        });
        card.appendChild(optionsEl);

        var feedbackEl = document.createElement('p');
        feedbackEl.className = 'feedback hidden';
        feedbackEl.setAttribute('aria-live', 'polite');
        card.appendChild(feedbackEl);

        sheetEl.appendChild(card);
      });

      btnCheck.classList.remove('hidden');
      btnCheck.disabled = false;
      btnNewRound.classList.add('hidden');
      paintProgress();
    }

    /* Picks an option on one question. A right answer is locked. */
    function selectOption(sheetIdx, optionIdx) {
      var sheet = roundSheets[sheetIdx];
      if (sheet.correct === true) return;
      sheet.selected = optionIdx;
      var card = sheetEl.querySelectorAll('.test-sheet-card')[sheetIdx];
      card.querySelectorAll('.option-btn').forEach(function (b, j) {
        b.classList.toggle('selected', j === optionIdx);
        b.classList.remove('incorrect');
      });
      paintProgress();
    }

    /* «Comprobar»: checks every answered question. */
    function check() {
      var firstUnanswered = -1;
      for (var i = 0; i < roundSheets.length; i += 1) {
        if (roundSheets[i].correct !== true && roundSheets[i].selected === null) {
          firstUnanswered = i;
          break;
        }
      }
      if (firstUnanswered !== -1) {
        /* Not checked half-way: scroll to the first unanswered card and shake
           it so it is noticed. The round does not count yet. */
        var target = sheetEl.querySelectorAll('.test-sheet-card')[firstUnanswered];
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('shake');
        setTimeout(function () { target.classList.remove('shake'); }, 500);
        return;
      }

      /* Only the first check of the round scores. Later checks walk through
         the questions still wrong and add no stars. */
      var firstCheck = roundSheets.every(function (sheet) { return sheet.correct === null; });
      var rightFirstTry = 0;
      var cards = sheetEl.querySelectorAll('.test-sheet-card');
      roundSheets.forEach(function (sheet, i) {
        if (sheet.correct === true) return;
        var card = cards[i];
        var options = card.querySelectorAll('.option-btn');
        var selected = sheet.question.options[sheet.selected];
        sheet.correct = selected.correct;
        if (selected.correct && firstCheck) rightFirstTry += 1;

        options.forEach(function (b) { b.classList.remove('selected'); });
        var feedbackEl = card.querySelector('.feedback');
        feedbackEl.classList.remove('hidden', 'success', 'error', 'encourage');
        if (selected.correct) {
          options.forEach(function (b) { b.disabled = true; });
          options[sheet.selected].classList.add('correct');
          feedbackEl.textContent = showExplanation && sheet.question.explanation
            ? '✅ ' + sheet.question.explanation : '✅';
          feedbackEl.classList.add('success');
        } else {
          /* Wrong: the hint shows, the answer does not. The card stays open. */
          options[sheet.selected].classList.add('incorrect');
          App.feedback.encourage(feedbackEl);
          feedbackEl.textContent = ' ' + (sheet.question.hint || hintFallback);
          feedbackEl.classList.add('error');
        }
      });

      if (firstCheck) onScored(rightFirstTry);

      var allRight = roundSheets.every(function (sheet) { return sheet.correct === true; });
      btnCheck.classList.toggle('hidden', allRight);
      btnNewRound.classList.remove('hidden');
      if (allRight) {
        onAllRight();
        btnNewRound.focus();
      }
      paintProgress();
    }

    /* Before «Comprobar» the bar counts the questions with an option picked;
       after it, the ones already right. The figure is always "x / total". */
    function paintProgress() {
      var total = roundSheets.length;
      var checked = roundSheets[0].correct !== null;
      var numerator = checked
        ? roundSheets.filter(function (s) { return s.correct === true; }).length
        : roundSheets.filter(function (s) { return s.selected !== null; }).length;
      progressFill.style.width = (numerator / total * 100) + '%';
      progressText.textContent = numerator + ' / ' + total;
    }

    return {
      set: set,
      render: render,
      check: check
    };
  }

  window.App.sheetTest = { create: create };
})();
