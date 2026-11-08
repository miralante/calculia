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
    s.sheet.set(sheetDef.buildRound(level).map(function (type, i) {
      return config.makeQuestion(type, i);
    }));
    s.roundCorrect = 0;
    ctx.show('#screenGame');
    s.sheet.render();
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

    /* Without real-life examples (skipReal) the slides lead straight to the sheet, and the
       button under them says so. */
    init: function (ctx) {
      if (ctx.config.skipReal) {
        var start = $('#introContinue');
        start.textContent = t('ui.startTest');
        start.className = 'btn';
      }
    },

    /* Returns true when the click was taken here. */
    introContinue: function (ctx) {
      if (!ctx.config.skipReal) return false;
      ctx.afterReal();
      return true;
    },

    /* A pick of the menu starts that sheet. */
    pick: function (ctx, sheetDef) {
      startSheet(ctx, sheetDef, levelOf(ctx, sheetDef));
    },

    /* The test starts here: the menu of sheets, or the first one. */
    startTest: function (ctx) {
      if (App.activityFlow.hasMenu(ctx.config)) {
        ctx.openMenu();
      } else {
        var sheets = sheetsOf(ctx.config);
        startSheet(ctx, sheets[0], levelOf(ctx, sheets[0]));
      }
    },

    bind: function (ctx) {
      var sheets = sheetsOf(ctx.config);
      var menu = App.activityFlow.hasMenu(ctx.config);
      var s = ctx.mode_state;
      s.sheet = App.sheetTest.create({
        sheetEl: $('#testSheet'),
        checkBtn: $('#btnCheck'),
        newRoundBtn: $('#btnNewRound'),
        progressFill: $('#progressFill'),
        progressText: $('#progressText'),
        showExplanation: !!ctx.config.showExplanation,
        hintFallback: t('ui.hint'),
        onAllRight: function () {
          if (ctx.config.transferKey) $('#transfer').classList.remove('hidden');
        },
        onScored: function (rightFirstTry) {
          s.roundCorrect = rightFirstTry;
          ctx.progress.stars += s.roundCorrect;
          ctx.progress.completedRounds = (ctx.progress.completedRounds || 0) + 1;
          var id = s.currentSheet.id;
          ctx.progress.roundsByActivity[id] = (ctx.progress.roundsByActivity[id] || 0) + 1;
          ctx.save();
          ctx.paintStars();
        }
      });
      $('#btnCheck').addEventListener('click', function () { s.sheet.check(); });
      $('#btnNewRound').addEventListener('click', function () {
        startSheet(ctx, ctx.mode_state.currentSheet, ctx.mode_state.currentLevel);
      });
    }
  };
})();
