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
  var progress = App.storage.get(CONFIG.toolId);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.rondas !== 'number') progress.rondas = 0;

  /* Current round state */
  var items = [];
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  /* Reinforce: failed items are replayed at the end. inReinforce
     prevents the mini-round from chaining with another mini-round.
     Original items of the normal round are NOT modified (they are
     reused as fallback if the reinforce ends). */
  var inReinforce = false;
  var reinforceIndex = 0;
  /* currentItem is what render() paints. In a normal round it equals
     items[index]; in a mini-round it equals reinforceList[reinforceIndex].
     Keeping a single read point simplifies the code and avoids
     passing item through every call. */
  var currentItem = null;
  /* Reinforce list and total (needed to close). */
  var reinforceList = [];
  var reinforceTotal = 0;

  function save() {
    App.storage.set(CONFIG.toolId, progress);
  }

  function paintStars() {
    starsEl.textContent = '⭐ ' + progress.stars;
  }

  function paintProgress() {
    progressFill.style.width = ((index / CONFIG.perRound) * 100) + '%';
    progressText.textContent = index + ' / ' + CONFIG.perRound;
  }

  function startRound() {
    var bank = DATA[App.i18n.locale()] || DATA.es;
    items = App.utils.shuffle(bank).slice(0, CONFIG.perRound);
    index = 0;
    roundCorrect = 0;
    inReinforce = false;
    reinforceIndex = 0;
    currentItem = null;
    App.reinforce.banner.hide();
    /* Reinforce: the callback is called with the failed items when
       the normal round ends. startReinforce mounts the mini-round. */
    App.reinforce.start(function (fallos) { startReinforce(fallos); });
    screenEnd.classList.add('hidden');
    screenGame.classList.remove('hidden');
    render();
  }

  /* Launches the mini-round with the failed items. The progress
     bar and banner show the advance inside the reinforcement.
     roundCorrect is NOT incremented here (it is the normal round
     counter); stars ARE added when each reinforce item is answered
     correctly (see answer). */
  function startReinforce(fallos) {
    reinforceList = fallos.map(function (f) { return f.payload; });
    reinforceTotal = reinforceList.length;
    reinforceIndex = 0;
    inReinforce = true;
    App.reinforce.banner.set(
      App.i18n.t('refuerzoTitulo') + ' — ' +
      App.i18n.t('refuerzoIntro').replace('{n}', reinforceTotal)
    );
    currentItem = reinforceList[0];
    paintReinforceProgress();
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforceIndex + 1) / reinforceTotal) * 100) + '%';
    progressText.textContent = (reinforceIndex + 1) + ' / ' + reinforceTotal;
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
  function showHint(item) {
    explanationEl.textContent = App.i18n.t('pista') + '"' + item.text + '"';
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, optionText, isCorrect, item) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(optionText, isCorrect, item);
      resolved = true;
      btn.classList.add('correcta');
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
      if (attempts === 1) {
        showHint(item);
      } else {
        showExplanation(optionText, isCorrect, item);
      }
      btn.classList.add('animo');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function goNext() {
    /* Mini-round: go to the next item or close. */
    if (inReinforce) {
      reinforceIndex += 1;
      if (reinforceIndex >= reinforceTotal) {
        inReinforce = false;
        currentItem = null;
        App.reinforce.clear();
        App.reinforce.banner.hide();
        endRound();
        return;
      }
      currentItem = reinforceList[reinforceIndex];
      paintReinforceProgress();
      render();
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
    progress.rondas += 1;
    save();
    paintProgress();
    screenGame.classList.add('hidden');
    screenEnd.classList.remove('hidden');
    endSummary.textContent = App.i18n.t('resumenFinal')
      .replace('{n}', roundCorrect)
      .replace('{total}', progress.stars);
$('#transfer').textContent = App.i18n.t('transferencia');
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* Events */
  $('#btnRepetir').addEventListener('click', startRound);
})();

