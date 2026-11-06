/* ============================================================
   Calculia — Three-stage activity flow: the 'sheet' test mode.

   The whole round is on one screen. Every question is shown at once, with its
   options; the person picks one per question and «Comprobar» checks them all.
   A right answer locks in green (and shows its explanation when the activity
   asks for it); a missed question shows its hint and stays open. The first
   «Comprobar» of a round scores; later ones only walk through what is still
   wrong. «Otra ronda» deals a new round. There is no closing screen.

   Options of the activity, besides the core ones (see activity-flow.js):
     activities      optional list of sheets, each
                     { id, picto, name(), detail(), levels, buildRound(level) }.
                     With more than one, a menu offers them. A level is
                     levels[min(rounds completed in that sheet, last)], and
                     buildRound receives it.
     levelName       function(level) -> text of the level, shown as a badge
                     (optional)
     transferKey     i18n key of the sentence shown when the round is complete
                     (optional)
     showExplanation true: a right answer also shows the question's explanation
     makeQuestion    here it receives the entry of buildRound and returns the
                     question; a question is { prompt, hint, visual, visualAria,
                     visualDecorative, legend, inline, options, explanation }.
                     visual is the HTML of the picture (may be ''); visualAria
                     labels it; visualDecorative hides it from the screen reader
                     when there is no label; legend is HTML under the picture;
                     inline puts the options in one row; options is
                     [{ html, aria, correct }].

   Texts: ui.check, ui.newRound, ui.hint, and for the menu ui.menuInstruction,
   ui.menuTitle, ui.menuText. The sheet needs feedback.js.

   Exposes window.App.activityFlow.modes.sheet.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  function t(key) { return App.i18n.t(key); }

  /* The test stage of this mode: the progress, the round, and the two buttons. */
  function sheetHtml(config) {
    var html = [
      '<section id="screenGame" class="hidden stack">',
      '  <div class="progress-bar">',
      '    <div class="progress-fill" id="progressFill"></div>',
      '    <span class="progress-text" id="progressText">0 / 0</span>' +
        (config.levelName ? '<span class="difficulty" id="difficulty"></span>' : ''),
      '  </div>',
      '  <div class="stack test-sheet" id="testSheet" aria-live="polite"></div>'
    ];
    /* The sentence that says what the round was for; it appears when the round is complete. */
    if (config.transferKey) html.push('  <p class="transfer hidden" id="transfer" data-i18n="' + config.transferKey + '"></p>');
    html.push(
      '  <div class="row sheet-actions">',
      '    <button type="button" class="btn" id="btnCheck" data-i18n="ui.check">Comprobar</button>',
      '    <button type="button" class="btn hidden" id="btnNewRound" data-i18n="ui.newRound">Otra ronda →</button>',
      '  </div>',
      '</section>'
    );
    return html.join('\n');
  }

  /* One sheet by default; several when the activity brings a list. */
  function sheetsOf(config) {
    return config.activities
      ? config.activities
      : [{ id: config.toolId, buildRound: config.buildRound, levels: null }];
  }

  /* The level of a sheet rises with the rounds completed in it (the core has the rule). */
  function levelOf(ctx, sheetDef) { return App.activityFlow.levelOf(ctx, sheetDef); }

  /* Every question is built when the round starts, and the options inside each one
     are shuffled too. */
  function startSheet(ctx, sheetDef, level) {
    var s = ctx.mode_state;
    var config = ctx.config;
    s.currentSheet = sheetDef;
    s.currentLevel = level;
    if (config.levelName && level) $('#difficulty').textContent = config.levelName(level);
    if (config.transferKey) $('#transfer').classList.add('hidden');
    App.utils.drawRoundReset();
    s.roundSheets = sheetDef.buildRound(level).map(function (type, i) {
      return { question: config.makeQuestion(type, i), selected: null, correct: null };
    });
    s.roundCorrect = 0;
    ctx.show('#screenGame');
    renderSheet(ctx);
  }

  /* Paints the whole round at once. The person can change a selection on any question
     until «Comprobar» is pressed. Right answers lock; a missed question shows its hint
     (never the answer) and stays open. */
  function renderSheet(ctx) {
    var s = ctx.mode_state;
    var sheetEl = $('#testSheet');
    sheetEl.innerHTML = '';
    s.roundSheets.forEach(function (entry, i) {
      var card = document.createElement('article');
      card.className = 'card stack test-sheet-card';

      var promptEl = document.createElement('p');
      promptEl.className = 'prompt';
      promptEl.textContent = entry.question.prompt;
      card.appendChild(promptEl);

      if (entry.question.visual) {
        var visualEl = document.createElement('div');
        visualEl.className = 'visual';
        visualEl.innerHTML = entry.question.visual;
        /* A picture gets a label when it needs one; a number is already text,
           and a purely decorative picture is hidden from the screen reader. */
        if (entry.question.visualAria) {
          visualEl.setAttribute('role', 'img');
          visualEl.setAttribute('aria-label', entry.question.visualAria);
        } else if (entry.question.visualDecorative) {
          visualEl.setAttribute('aria-hidden', 'true');
        }
        card.appendChild(visualEl);
      }

      if (entry.question.legend) {
        var legendEl = document.createElement('p');
        legendEl.className = 'legend';
        legendEl.innerHTML = entry.question.legend;
        card.appendChild(legendEl);
      }

      var optionsEl = document.createElement('div');
      optionsEl.className = 'stack options';
      if (entry.question.inline) optionsEl.classList.add('options-row');
      entry.question.options.forEach(function (op, j) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.innerHTML = op.html;
        if (op.aria) btn.setAttribute('aria-label', op.aria);
        btn.addEventListener('click', function () { selectOption(ctx, i, j); });
        optionsEl.appendChild(btn);
      });
      card.appendChild(optionsEl);

      var feedbackEl = document.createElement('p');
      feedbackEl.className = 'feedback hidden';
      feedbackEl.setAttribute('aria-live', 'polite');
      card.appendChild(feedbackEl);

      sheetEl.appendChild(card);
    });

    $('#btnCheck').classList.remove('hidden');
    $('#btnCheck').disabled = false;
    $('#btnNewRound').classList.add('hidden');
    paintSheetProgress(ctx);
  }

  function selectOption(ctx, sheetIdx, optionIdx) {
    var entry = ctx.mode_state.roundSheets[sheetIdx];
    if (entry.correct === true) return; /* already right: locked */
    entry.selected = optionIdx;
    var card = $('#testSheet').querySelectorAll('.test-sheet-card')[sheetIdx];
    card.querySelectorAll('.option-btn').forEach(function (b, j) {
      b.classList.toggle('selected', j === optionIdx);
      b.classList.remove('incorrect');
    });
    paintSheetProgress(ctx);
  }

  function checkAnswers(ctx) {
    var s = ctx.mode_state;
    var config = ctx.config;
    var roundSheets = s.roundSheets;
    var firstUnanswered = -1;
    for (var i = 0; i < roundSheets.length; i += 1) {
      if (roundSheets[i].correct !== true && roundSheets[i].selected === null) {
        firstUnanswered = i;
        break;
      }
    }
    if (firstUnanswered !== -1) {
      /* Not checked half-way: scroll to the first unanswered card and shake it so it
         is noticed. The round does not count yet. */
      var target = $('#testSheet').querySelectorAll('.test-sheet-card')[firstUnanswered];
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('shake');
      setTimeout(function () { target.classList.remove('shake'); }, 500);
      return;
    }

    /* Only the first check of the round scores. */
    var firstCheck = roundSheets.every(function (entry) { return entry.correct === null; });
    var rightFirstTry = 0;
    var cards = $('#testSheet').querySelectorAll('.test-sheet-card');
    roundSheets.forEach(function (entry, idx) {
      if (entry.correct === true) return; /* already right: stays locked */
      var card = cards[idx];
      var options = card.querySelectorAll('.option-btn');
      var selected = entry.question.options[entry.selected];
      entry.correct = selected.correct;
      if (selected.correct && firstCheck) rightFirstTry += 1;

      options.forEach(function (b) { b.classList.remove('selected'); });
      var feedbackEl = card.querySelector('.feedback');
      feedbackEl.classList.remove('hidden', 'success', 'error', 'encourage');
      if (selected.correct) {
        options.forEach(function (b) { b.disabled = true; });
        options[entry.selected].classList.add('correct');
        feedbackEl.textContent = config.showExplanation && entry.question.explanation
          ? '✅ ' + entry.question.explanation : '✅';
        feedbackEl.classList.add('success');
      } else {
        /* Wrong: the hint shows, the answer does not. The card stays open. */
        options[entry.selected].classList.add('incorrect');
        App.feedback.encourage(feedbackEl);
        feedbackEl.textContent = ' ' + (entry.question.hint || t('ui.hint'));
        feedbackEl.classList.add('error');
      }
    });

    if (firstCheck) {
      s.roundCorrect = rightFirstTry;
      ctx.progress.stars += s.roundCorrect;
      ctx.progress.completedRounds = (ctx.progress.completedRounds || 0) + 1;
      var id = s.currentSheet.id;
      ctx.progress.roundsByActivity[id] = (ctx.progress.roundsByActivity[id] || 0) + 1;
      ctx.save();
      ctx.paintStars();
    }

    var allRight = roundSheets.every(function (entry) { return entry.correct === true; });
    $('#btnCheck').classList.toggle('hidden', allRight);
    $('#btnNewRound').classList.remove('hidden');
    if (allRight && config.transferKey) $('#transfer').classList.remove('hidden');
    if (allRight) $('#btnNewRound').focus();
    paintSheetProgress(ctx);
  }

  /* Before «Comprobar» the bar counts the questions with an option picked; after it,
     the ones already right. The figure is always "x / total". */
  function paintSheetProgress(ctx) {
    var roundSheets = ctx.mode_state.roundSheets;
    var total = roundSheets.length;
    var checked = roundSheets[0].correct !== null;
    var numerator = checked
      ? roundSheets.filter(function (e) { return e.correct === true; }).length
      : roundSheets.filter(function (e) { return e.selected !== null; }).length;
    $('#progressFill').style.width = (numerator / total * 100) + '%';
    $('#progressText').textContent = numerator + ' / ' + total;
  }

  App.activityFlow.modes.sheet = {
    screens: function (config) {
      var menu = App.activityFlow.hasMenu(config);
      return ['#screenIntro', '#screenReal'].concat(menu ? ['#screenMenu'] : []).concat(['#screenGame']);
    },

    markup: function (ctx) {
      var menu = App.activityFlow.hasMenu(ctx.config);
      return (menu ? App.activityFlow.menuHtml + '\n' : '') + sheetHtml(ctx.config);
    },

    /* A pick of the menu starts that sheet. */
    pick: function (ctx, sheetDef) {
      startSheet(ctx, sheetDef, levelOf(ctx, sheetDef));
    },

    bind: function (ctx) {
      var sheets = sheetsOf(ctx.config);
      var menu = App.activityFlow.hasMenu(ctx.config);
      $('#realContinue').addEventListener('click', function () {
        if (menu) {
          ctx.openMenu();
        } else {
          startSheet(ctx, sheets[0], levelOf(ctx, sheets[0]));
        }
      });
      $('#btnCheck').addEventListener('click', function () { checkAnswers(ctx); });
      $('#btnNewRound').addEventListener('click', function () {
        startSheet(ctx, ctx.mode_state.currentSheet, ctx.mode_state.currentLevel);
      });
    }
  };
})();
