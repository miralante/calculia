/* ============================================================
   Calculia — Riddles (logic)
   Data in data.js (const DATA). Shared modules in assets/js/.
   Mechanic: round of 10 multiple-choice questions.
   Errors are never punished: the person is encouraged to retry.
   ============================================================ */
(function () {
  'use strict';

  var CONFIG = {
    toolId: 'riddles',
    perRound: 10
  };

  var $ = App.utils.$;

  /* Elements */
  var textEl = $('#textQuestion');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var endSummary = $('#endSummary');

  /* Persistent progress (kept across browser closes) */
  var progress = App.storage.progressWith(CONFIG.toolId, { stars: 0 });
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = progress.rondas || 0;

  /* Current round state */
  var items = [];
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var resolved = false;
  /* Reinforce: failed items are replayed at the end. The session in
     App.reinforce stops the mini-round from chaining with another one.
     Original items of the normal round are NOT modified (they are
     reused as fallback if the reinforce ends). */
  var reinforcement = App.reinforce.session({
    titleKey: 'refuerzoTitulo',
    introKey: 'refuerzoIntro',
    show: function (item) { currentItem = item; paintReinforceProgress(); render(); }
  });
  /* currentItem is what render() paints. In a normal round it equals
     items[index]; in a mini-round it is the item the session is on.
     Keeping a single read point simplifies the code and avoids
     passing item through every call. */
  var currentItem = null;

  function save() {
    App.storage.set(CONFIG.toolId, progress);
  }

  var glue = App.activityGlue({
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var paintStars = glue.paintStars;

  function paintProgress() {
    progressFill.style.width = ((index / CONFIG.perRound) * 100) + '%';
    progressText.textContent = '';
  }

  function startRound() {
    var bank = DATA[App.i18n.locale()] || DATA.es;
    items = App.utils.shuffle(bank).slice(0, CONFIG.perRound);
    index = 0;
    roundCorrect = 0;
    currentItem = null;
    /* Reinforce: the callback is called with the failed items when
       the normal round ends, and the session mounts the mini-round. */
    reinforcement.begin();
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  /* Launches the mini-round with the failed items. The progress
     bar and banner show the advance inside the reinforcement.
     roundCorrect is NOT incremented here (it is the normal round
     counter); stars ARE added when each reinforce item is answered
     correctly (see answer). */
  function paintReinforceProgress() {
    progressFill.style.width = (((reinforcement.position() + 1) / reinforcement.total()) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    var item = currentItem || items[index];
    resolved = false;
    attempts = 0;
    textEl.textContent = item.text;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');
    optionsEl.innerHTML = '';

    var options = App.utils.shuffle(item.options.map(function (opt, i) {
      return { text: opt, isCorrect: i === item.correct };
    }));

    options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.textContent = op.text;
      btn.addEventListener('click', function () {
        answer(btn, op.text, op.isCorrect, item);
      });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(optionText, isCorrect, item) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var text = isCorrect
      ? App.i18n.t('explicacionCorrecta') + item.answer + '.'
      : App.i18n.t('explicacionIncorrectaA') + optionText +
        App.i18n.t('explicacionIncorrectaB') + item.answer + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is pointed back to the hint already on screen. Only
     on the second mistake is the correct answer explained
     (showExplanation). */
  function showHint(item, optionText) {
    explanationEl.textContent = App.feedback.hintText(App.i18n.t('pista'), optionText) + '"' + item.text + '"';
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, optionText, isCorrect, item) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(optionText, isCorrect, item);
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#options .option-btn').forEach(function (b) {
        b.disabled = true;
      });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      /* Encouragement, never punishment: can try again */
      attempts += 1;
      /* Reinforce: registers the first failure of the item so it
         is replayed in the mini-round. We use item.text as the
         stable key (the item is passed whole to answer). */
      if (attempts === 1) App.reinforce.add(item.text, item);
      var respuestaTrasPista = attempts > 1;
      showHint(item, optionText);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(optionText, isCorrect, item); });
    }
  }

  function goNext() {
    /* Mini-round: go to the next item or close. */
    if (reinforcement.active()) {
      if (!reinforcement.nextItem()) {
        currentItem = null;
        endRound();
      }
      return;
    }
    /* Normal round: index++ and consume at the end. */
    index += 1;
    if (index >= CONFIG.perRound) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    currentItem = null;
    render();
  }

  function endRound() {
    progress.completedRounds += 1;
    save();
    paintProgress();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  var elRepeatBtn = $('#repeatBtn');
  if (elRepeatBtn) elRepeatBtn.addEventListener('click', startRound);
  btnNext.addEventListener('click', goNext);

  /* Start the game on load */
  startRound();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();

