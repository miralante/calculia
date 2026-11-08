/* ============================================================
   Calculia — Three-stage activity flow: the 'options' test mode.

   One question at a time. A right answer is a star (at the first try, for the
   round count). A wrong one is answered in one of two ways, by config.socratic:
     false: the hint shows and the option stays off; nothing is punished.
     true:  the first miss shows the hint, the second the explanation, and the
            other options stay locked until «Entendido» (needs feedback.js).
   The round ends with a closing screen and one button.

   Options of the activity, besides the core ones (see activity-flow.js):
     socratic        true for the socratic feedback above
     review          'back' (default) puts «← Repasar la explicación» in the
                     test; 'rule' puts «Repasar la regla» under the question and
                     reopens the slides from it; 'none' puts no review button
     reinforce       true: the questions missed in the round are replayed, in a
                     mini-round, until they are all right (needs feedback.js)
     menuPlacement   'afterReal': the menu of activities comes after the
                     examples, and the slides are shared by all of them. Without
                     it (default) the menu comes first and each activity has its
                     own slides (activities[i].intro and .real)
     endSummaryKey   i18n key of the closing summary, with {n}, {total}, {stars}
                     and {activity} (optional; default ui.roundDone). With it,
                     {n} counts every right answer, replays included; by default
                     it counts the right answers at the first try
     endNotes        [{ key, cls }] i18n texts shown on the closing screen
                     before its button (optional)
     endEmoji        { text, cls } for the closing screen (optional; default
                     🎉 with cls emoji-large)
     typedAnswers    true: a question may ask for a typed number instead of
                     options (needs socratic): question.input = { answer }
     audio           true: a question may be read aloud (question.speak), with a
                     «Escuchar otra vez» button to hear it again
     introContinueKey i18n key of the button after the slides when skipReal
                     (optional; default ui.startTest)
   A question is { prompt, hint, options, explanation } and may carry visual
   (the HTML of a picture, shown when socratic or testVisuals; no picture hides
   its box), visualAria, legend (a line under the picture). options is
   [{ html, aria, correct }]. Instead of options: input { answer } (typedAnswers),
   and speak (the text read aloud, audio). explanationVisual is the picture of
   the explanation after a right answer (socratic).
   buildRound(def, level) receives the menu entry and its level (if any).
   The mode can also be 'gallery' (activity-flow-gallery.js): slides only, no test.

   Texts: ui.right, ui.roundDone, btnMenu, core.roundComplete, ui.review
   (review 'back'), ui.reviewRule and ui.backToPractice (review 'rule'),
   ui.hintPrefix, ui.wrongPrefix and ui.rightPrefix (socratic), ui.reinforceTitle
   and ui.reinforceIntro (reinforce), ui.newRound and the menu back key.

   Exposes window.App.activityFlow.modes.options.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;
  var fill = App.utils.fill;

  function t(key) { return App.i18n.t(key); }

  function hasMenu(config) { return App.activityFlow.hasMenu(config); }
  /* The menu comes first (each activity has its own slides), or after the examples. */
  function menuFirst(config) { return hasMenu(config) && config.menuPlacement !== 'afterReal'; }
  function isRule(config) { return config.review === 'rule'; }

  /* The test stage of this mode, built from the config: the activities differ in
     their review button, in the picture of the question and in the closing screen. */
  function testOptionsHtml(config) {
    var rule = isRule(config);
    var visual = config.socratic || config.testVisuals;
    var html = [
      '<section id="screenGame" class="hidden stack">'
    ];
    /* With the menu first, the test goes back to it and can deal another round. */
    if (menuFirst(config)) {
      html.push(
        '  <button type="button" class="btn btn-secondary" id="testBack" data-i18n="' + (config.menuBackKey || 'ui.menuBack') + '"></button>',
        '  <button type="button" class="btn btn-secondary" id="newRound" data-i18n="ui.newRound">Otra ronda →</button>'
      );
    } else if (!rule && config.review !== 'none') {
      html.push('  <button type="button" class="btn btn-secondary" id="testBack" data-i18n="ui.review">← Repasar la explicación</button>');
    }
    html.push(
      '  <p class="round-header hidden" id="chainBanner" aria-live="polite"></p>',
      '  <p class="difficulty hidden" id="difficulty"></p>',
      '  <div class="progress-bar">',
      '    <div class="progress-fill" id="progressFill"></div>',
      '    <span class="progress-text" id="progressText">0 / 0</span>',
      '  </div>',
      '  <article class="card centered stack task-card">',
      '    <h2 class="prompt" id="testPrompt"></h2>'
    );
    if (visual) html.push('    <div class="' + (config.testVisualClass || 'fac-visual') + '" id="testVisual"></div>');
    html.push('    <p class="legend hidden" id="testLegend"></p>');
    if (config.audio) html.push('    <button type="button" class="btn btn-secondary hidden" id="testReplay" data-i18n="ui.replay"></button>');
    html.push('    <p class="step-label hidden" id="stepLabel" aria-live="polite"></p>');
    html.push('    <div class="options-row" id="testOptions"></div>');
    if (config.typedAnswers) {
      html.push(
        '    <div class="input-row hidden" id="testInputRow">',
        '      <label class="visually-hidden" for="testInput" data-i18n="ui.typeLabel"></label>',
        '      <input type="number" id="testInput" min="0" inputmode="numeric" autocomplete="off">',
        '      <button type="button" class="btn" id="testCheck" data-i18n="ui.check"></button>',
        '    </div>'
      );
    }
    html.push('    <p class="feedback" id="feedback" aria-live="polite"></p>');
    if (config.socratic) {
      html.push('    <div class="explanation hidden" id="explanationWrap">',
        '      <p id="explanation" aria-live="polite"></p>',
      '      <div class="explanation-visual" id="explanationVisual"></div>',
        '    </div>');
    }
    html.push('  </article>');
    if (rule) {
      html.push('  <button type="button" class="btn btn-secondary" id="reviewRule" data-i18n="ui.reviewRule">Repasar la regla</button>');
    }
    html.push(
      '  <button type="button" class="btn hidden" id="btnNext" data-i18n="ui.next">Siguiente →</button>',
      '</section>',
      /* Closing screen: a summary, the texts the activity asks for, and one button. */
      '<section id="screenEnd" class="hidden stack centered" aria-live="polite">',
      '  <div class="' + ((config.endEmoji && config.endEmoji.cls) || 'emoji-large') + '" aria-hidden="true">' +
        ((config.endEmoji && config.endEmoji.text) || '🎉') + '</div>',
      '  <h2 data-i18n="core.roundComplete">¡Ronda completada!</h2>',
      '  <p id="endSummary"></p>'
    );
    if (config.transferKey) html.push('  <p class="transfer hidden" id="endTransfer" data-i18n="' + config.transferKey + '"></p>');
    (config.endNotes || []).forEach(function (note) {
      html.push('  <p class="' + note.cls + '" data-i18n="' + note.key + '"></p>');
    });
    html.push(
      '  <button type="button" class="btn hidden" id="endNextStep" data-i18n="ui.nextStep">Siguiente paso →</button>',
      '  <button type="button" class="btn" id="endBackToStart" data-i18n="btnMenu">Volver al inicio</button>',
      '</section>'
    );
    return html.join('\n');
  }

  /* With the rule review, the button under the slides goes back to the test when
     the slides were opened from it. Only then is it the primary one. */
  function paintIntroContinue(ctx) {
    if (!isRule(ctx.config)) return;
    var button = $('#introContinue');
    var reviewing = ctx.mode_state.reviewing;
    button.textContent = t(reviewing ? 'ui.backToPractice' : 'ui.seeReal');
    button.className = reviewing ? 'btn' : 'btn btn-secondary';
  }

  function optionButtons() { return document.querySelectorAll('#testOptions .option-btn'); }

  /* The round is built for the activity picked from the menu (or for the activity
     itself), at the level its progress has reached. */
  /* A menu entry can be a chain of steps (the sub-levels of one group): the round goes from one step to
     the next without the menu, and the banner says where the person is. */
  function paintChainBanner(ctx) {
    var c = ctx.mode_state.chain;
    var banner = $('#chainBanner');
    if (!c) {
      banner.classList.add('hidden');
      banner.textContent = '';
      return;
    }
    banner.textContent = fill(t('ui.chainStep'), { n: c.index + 1, total: c.steps.length, name: ctx.current.name() });
    banner.classList.remove('hidden');
  }

  function hasNextStep(ctx) {
    var c = ctx.mode_state.chain;
    return !!c && c.index < c.steps.length - 1;
  }

  function nextStep(ctx) {
    var c = ctx.mode_state.chain;
    c.index += 1;
    ctx.current = c.steps[c.index];
    startRound(ctx);
  }

  function startRound(ctx) {
    var s = ctx.mode_state;
    var config = ctx.config;
    var def = ctx.current || config;
    var level = ctx.current ? App.activityFlow.levelOf(ctx, ctx.current) : null;
    paintChainBanner(ctx);
    /* The level badge (levelName) and the closing sentence (transferKey) of an activity with levels. */
    if (config.levelName) {
      var badge = $('#difficulty');
      badge.textContent = level ? config.levelName(level) : '';
      badge.classList.toggle('hidden', !level);
    }
    if (config.transferKey) $('#endTransfer').classList.add('hidden');
    App.utils.drawRoundReset();
    s.round = config.buildRound(def, level).map(function (type, i) { return config.makeQuestion(type, i, def); });
    s.qIndex = 0;
    s.roundRight = 0;
    s.solved = 0;
    s.reviewing = false;
    s.inReinforce = false;
    s.replay = [];
    s.replayIndex = 0;
    if (config.reinforce) {
      App.reinforce.banner.hide();
      App.reinforce.start(function (fallos) { startReinforce(ctx, fallos); });
    }
    ctx.show('#screenGame');
    renderQuestion(ctx, null);
  }

  /* The questions missed in the round, replayed until they are all right. */
  function startReinforce(ctx, fallos) {
    var s = ctx.mode_state;
    s.replay = fallos.map(function (f) { return f.payload; });
    s.replayIndex = 0;
    s.inReinforce = true;
    App.reinforce.banner.set(t('ui.reinforceTitle') + ' — ' + fill(t('ui.reinforceIntro'), { n: s.replay.length }));
    renderQuestion(ctx, s.replay[0]);
  }

  function reviewIntro(ctx) {
    ctx.state.intro = 0;
    ctx.paintIntro();
    ctx.show('#screenIntro');
  }

  /* The rule reopened from the test: the same slides, and the test is kept as it is. */
  function openRule(ctx) {
    ctx.mode_state.reviewing = true;
    ctx.state.intro = 0;
    ctx.paintIntro();
    paintIntroContinue(ctx);
    ctx.show('#screenIntro');
  }

  /* The step on screen: a question of several steps (steps) has one at a time; any other has itself. */
  function viewOf(s) { return s.question.steps ? s.question.steps[s.stepIndex] : s.question; }
  function isLastStep(s) { return !s.question.steps || s.stepIndex === s.question.steps.length - 1; }

  /* Paints a question: the one given (a replayed one) or the next of the round. */
  function renderQuestion(ctx, fixed) {
    var s = ctx.mode_state;
    var config = ctx.config;
    var socratic = config.socratic === true;
    s.question = fixed || s.round[s.qIndex];
    s.stepIndex = 0;
    s.firstTry = true;
    var position = s.inReinforce ? s.replayIndex : s.qIndex;
    var total = s.inReinforce ? s.replay.length : s.round.length;
    $('#progressFill').style.width = ((position / total) * 100) + '%';
    $('#progressText').textContent = (position + 1) + ' / ' + total;
    if (config.audio) {
      /* A spoken question is heard as it comes up, and can be heard again. */
      $('#testReplay').classList.toggle('hidden', !s.question.speak);
      speak(s.question.speak);
    }
    if (socratic || config.testVisuals) {
      var visualEl = $('#testVisual');
      visualEl.innerHTML = s.question.visual || '';
      visualEl.classList.toggle('hidden', !s.question.visual);
      if (s.question.visualAria) {
        visualEl.setAttribute('role', 'img');
        visualEl.setAttribute('aria-label', s.question.visualAria);
      } else {
        visualEl.removeAttribute('role');
        visualEl.removeAttribute('aria-label');
      }
    }
    renderStep(ctx);
  }

  /* Reads a text aloud, when the device can (App.tts). */
  function speak(text) {
    if (text && App.tts) App.tts.speak(text);
  }

  /* The typed answer box: shown for a question that asks for a number, cleared for the next one. */
  function paintTyped(on) {
    var input = $('#testInput');
    $('#testInputRow').classList.toggle('hidden', !on);
    input.value = '';
    input.disabled = false;
    $('#testCheck').disabled = false;
    if (on) input.focus();
  }

  /* The step on screen: its prompt, its options and the step label (a question of one step has none). */
  function renderStep(ctx) {
    var s = ctx.mode_state;
    var socratic = ctx.config.socratic === true;
    var view = viewOf(s);
    var steps = s.question.steps;
    var typed = !!ctx.config.typedAnswers && !!view.input;
    s.answered = false;
    s.attempts = 0;
    $('#testPrompt').textContent = view.prompt;
    var legend = $('#testLegend');
    legend.textContent = view.legend || s.question.legend || '';
    legend.classList.toggle('hidden', !legend.textContent);
    var label = $('#stepLabel');
    label.textContent = steps ? fill(t('ui.stepOf'), { i: s.stepIndex + 1, n: steps.length }) : '';
    label.classList.toggle('hidden', !steps || steps.length < 2);
    if (socratic) {
      $('#explanation').textContent = '';
      $('#explanationVisual').innerHTML = '';
      $('#explanationWrap').classList.add('hidden');
    }
    $('#feedback').textContent = '';
    $('#feedback').className = 'feedback';
    var box = $('#testOptions');
    box.innerHTML = '';
    box.classList.toggle('hidden', typed);
    if (ctx.config.typedAnswers) paintTyped(typed);
    if (!typed) view.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn option-btn';
      button.innerHTML = option.html;
      button.setAttribute('aria-label', option.aria);
      button.addEventListener('click', function () {
        if (socratic) answerSocratic(ctx, option, button); else answer(ctx, option, button);
      });
      box.appendChild(button);
    });
    $('#btnNext').classList.add('hidden');
  }

  function answer(ctx, option, button) {
    var s = ctx.mode_state;
    if (s.answered) return;
    var feedback = $('#feedback');
    if (option.correct) {
      s.answered = true;
      button.classList.add('correct');
      feedback.textContent = t('ui.right') + ' ' + viewOf(s).explanation;
      feedback.className = 'feedback success';
      /* A question scores once, at its last step, and only if no step was missed. */
      if (isLastStep(s)) {
        s.solved += 1;
        if (s.firstTry) {
          s.roundRight += 1;
          ctx.progress.stars += 1;
          ctx.save();
          ctx.paintStars();
        }
      }
      $('#testOptions').querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      if (s.question.steps) $('#btnNext').textContent = isLastStep(s) ? t('ui.next') : t('ui.nextStep');
      $('#btnNext').classList.remove('hidden');
      return;
    }
    /* A wrong answer: the hint, and the option stays off. Nothing is punished. */
    s.firstTry = false;
    if (ctx.config.reinforce && !s.inReinforce) App.reinforce.add('q' + s.qIndex, s.question);
    button.classList.add('incorrect');
    button.disabled = true;
    feedback.textContent = viewOf(s).hint;
    feedback.className = 'feedback error';
  }

  /* Socratic order: the first miss shows a hint that does not give the answer;
     the second shows the explanation; a right answer shows the explanation at
     once. Every right answer is a star; only the first try counts for the round. */
  function answerSocratic(ctx, option, button) {
    judgeSocratic(ctx, option.correct, option.aria || '', button, optionButtons(), null);
  }

  /* The typed number: checked like a choice. An empty box asks for a number first. */
  function checkTyped(ctx) {
    var s = ctx.mode_state;
    if (s.answered) return;
    var input = $('#testInput');
    var raw = input.value.trim();
    var value = parseInt(raw, 10);
    if (raw === '' || isNaN(value) || value < 0) {
      $('#feedback').textContent = t('ui.typeFirst');
      $('#feedback').className = 'feedback';
      return;
    }
    judgeSocratic(ctx, value === viewOf(s).input.answer, String(value), null, [input, $('#testCheck')], function () {
      input.value = '';
      input.focus();
    });
  }

  /* The judgement of one try, for a choice and for a typed number alike. A right try is a star and
     shows the explanation at once. A wrong one shows the hint, then the explanation, and locks the
     controls until «Entendido» (which runs onAck). marker is the button picked, or null when typed. */
  function judgeSocratic(ctx, correct, chosen, marker, lockables, onAck) {
    var s = ctx.mode_state;
    if (s.answered) return;
    var feedback = $('#feedback');
    var explanation = $('#explanation');
    var wrap = $('#explanationWrap');
    if (correct) {
      s.answered = true;
      if (marker) marker.classList.add('correct');
      lockables.forEach(function (el) { el.disabled = true; });
      App.feedback.success(feedback);
      ctx.progress.stars += 1;
      s.solved += 1;
      if (s.attempts === 0) s.roundRight += 1;
      ctx.save();
      ctx.paintStars();
      explanation.textContent = t('ui.rightPrefix') + s.question.explanation;
      $('#explanationVisual').innerHTML = s.question.explanationVisual || '';
      wrap.classList.remove('hidden');
      $('#btnNext').classList.remove('hidden');
      $('#btnNext').focus();
      return;
    }
    s.attempts += 1;
    if (ctx.config.reinforce && !s.inReinforce) App.reinforce.add('q' + s.qIndex, s.question);
    if (marker) {
      marker.classList.add('encourage');
      marker.disabled = true;
    }
    App.feedback.encourage(feedback);
    explanation.textContent = s.attempts === 1
      ? t('ui.hintPrefix') + App.feedback.hintText(s.question.hint, chosen)
      : t('ui.wrongPrefix') + s.question.explanation;
    $('#explanationVisual').innerHTML = s.question.explanationVisual || '';
    wrap.classList.remove('hidden');
    /* Locks the controls until «Entendido», so the hint is read before the next try. */
    App.feedback.lockUntilAck(lockables, wrap, onAck);
  }

  function nextQuestion(ctx) {
    var s = ctx.mode_state;
    if (!isLastStep(s)) {
      s.stepIndex += 1;
      renderStep(ctx);
      return;
    }
    if (s.inReinforce) {
      s.replayIndex += 1;
      if (s.replayIndex < s.replay.length) {
        renderQuestion(ctx, s.replay[s.replayIndex]);
        return;
      }
      s.inReinforce = false;
      App.reinforce.clear();
      App.reinforce.banner.hide();
      endRound(ctx);
      return;
    }
    s.qIndex += 1;
    if (s.qIndex < s.round.length) {
      renderQuestion(ctx, null);
      return;
    }
    /* With reinforcement, consume() replays the misses first: it starts the mini-round
       and returns the list, or returns [] when there is nothing to replay. */
    if (ctx.config.reinforce && App.reinforce.consume().length > 0) return;
    endRound(ctx);
  }

  function endRound(ctx) {
    var s = ctx.mode_state;
    var progress = ctx.progress;
    progress.completedRounds = (progress.completedRounds || 0) + 1;
    if (ctx.current) {
      progress.roundsByActivity[ctx.current.id] = (progress.roundsByActivity[ctx.current.id] || 0) + 1;
    }
    ctx.save();
    /* With a next step in the chain, the closing screen leads to it; otherwise back to the start. */
    var more = hasNextStep(ctx);
    $('#endNextStep').classList.toggle('hidden', !more);
    $('#endBackToStart').classList.toggle('hidden', more);
    /* A round's own summary counts every right answer, the replays included; the default counts the first tries. */
    $('#endSummary').textContent = fill(t(ctx.config.endSummaryKey || 'ui.roundDone'), {
      n: ctx.config.endSummaryKey ? s.solved : s.roundRight, total: s.round.length, stars: progress.stars,
      starsWord: App.i18n.starsWord(progress.stars),
      nWord: App.i18n.starsWord(ctx.config.endSummaryKey ? s.solved : s.roundRight),
      activity: ctx.current ? ctx.current.name() : ''
    });
    if (ctx.config.transferKey) $('#endTransfer').classList.remove('hidden');
    ctx.show('#screenEnd');
    if (App.feedback && App.feedback.celebrate) App.feedback.celebrate(t('core.roundComplete'));
  }

  App.activityFlow.modes.options = {
    screens: function (config) {
      var menu = hasMenu(config);
      return ['#screenIntro', '#screenReal', '#screenGame', '#screenEnd'].concat(menu ? ['#screenMenu'] : []);
    },

    markup: function (ctx) {
      var menu = hasMenu(ctx.config);
      return (menu ? App.activityFlow.menuHtml + '\n' : '') + testOptionsHtml(ctx.config);
    },

    /* Wires the test stage. The stages before it are wired by the core. */
    /* The test starts here: the menu of activities, or the first round. */
    startTest: function (ctx) {
      if (hasMenu(ctx.config) && !menuFirst(ctx.config)) ctx.openMenu(); else startRound(ctx);
    },

    bind: function (ctx) {
      var config = ctx.config;
      if (menuFirst(config)) {
        $('#testBack').addEventListener('click', function () { ctx.openMenu(); });
        $('#newRound').addEventListener('click', function () { startRound(ctx); });
        /* The slides have the same way back to the menu. */
        var back = $('#introBack');
        back.textContent = t(config.menuBackKey || 'ui.menuBack');
        back.classList.remove('hidden');
        back.addEventListener('click', function () { ctx.openMenu(); });
      } else if (isRule(config)) {
        $('#reviewRule').addEventListener('click', function () { openRule(ctx); });
      } else if (config.review !== 'none') {
        $('#testBack').addEventListener('click', function () { reviewIntro(ctx); });
      }
      if (config.typedAnswers) {
        $('#testCheck').addEventListener('click', function () { checkTyped(ctx); });
        $('#testInput').addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); checkTyped(ctx); }
        });
      }
      if (config.audio) {
        $('#testReplay').addEventListener('click', function () { speak(ctx.mode_state.question.speak); });
      }
      $('#btnNext').addEventListener('click', function () { nextQuestion(ctx); });
      $('#endNextStep').addEventListener('click', function () { nextStep(ctx); });
      $('#endBackToStart').addEventListener('click', function () {
        location.href = config.backHref || '../../';
      });
    },

    init: function (ctx) {
      paintIntroContinue(ctx);
      /* Without real-life examples the slides lead straight to the test. */
      if (ctx.config.skipReal) {
        var start = $('#introContinue');
        start.textContent = t(ctx.config.introContinueKey || 'ui.startTest');
        start.className = 'btn';
      }
    },

    /* With the menu first the activity starts there; otherwise at its slides. */
    start: function (ctx) {
      if (menuFirst(ctx.config)) {
        ctx.openMenu();
      } else {
        ctx.paintIntro();
        ctx.show('#screenIntro');
      }
    },

    /* A pick of the menu. With the menu first it shows the slides of that activity;
       after the examples it starts the test at once. */
    pick: function (ctx, def) {
      /* An entry with its own flow (open) takes over the menu: the activity starts its own screens. */
      if (def.open) { def.open(ctx); return; }
      ctx.mode_state.chain = def.steps ? { steps: def.steps, index: 0 } : null;
      ctx.current = def.steps ? def.steps[0] : def;
      /* No slides of its own (no intro): the round starts at once, as after the examples. */
      if (!menuFirst(ctx.config) || !def.intro) {
        startRound(ctx);
        return;
      }
      ctx.state.intro = 0;
      ctx.state.real = 0;
      var title = $('#introActivityTitle');
      title.textContent = def.picto + ' ' + def.name();
      title.classList.remove('hidden');
      ctx.paintIntro();
      ctx.show('#screenIntro');
    },

    /* Returns true when the click was taken here: the rule reopened from the test
       goes back to the same question, and not to the next stage. */
    introContinue: function (ctx) {
      var s = ctx.mode_state;
      /* An activity can send the slides somewhere else (a screen of its own) once they are read. */
      if (s.afterIntro) {
        var go = s.afterIntro;
        s.afterIntro = null;
        go();
        return true;
      }
      if (ctx.config.skipReal) { startRound(ctx); return true; }
      if (!(isRule(ctx.config) && s.reviewing)) return false;
      s.reviewing = false;
      paintIntroContinue(ctx);
      ctx.show('#screenGame');
      return true;
    }
  };
})();
