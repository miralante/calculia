/* ============================================================
   Calculia — Numbers (read, order and place numbers)
   Data and levels in data.js. Shared modules in assets/js/.
   Each digit is painted according to its place: blue units,
   green tens, purple hundreds. The decimal separator, cents and
   signs use orange. Large numbers carry group labels (thousands,
   millions⬦ up to billions).
   Questions are generated on the fly based on the level type.
   ============================================================ */
(function () {
  'use strict';

  var M = App.numbersModel;
  var randInt = M.randInt, pickRandomInt = M.pickRandomInt, POS_CLASS = M.POS_CLASS, thousandsSeparator = M.thousandsSeparator, legendPos = M.legendPos, digits = M.digits;
  var paintNumber = M.paintNumber, paintSign = M.paintSign, buildOptions = M.buildOptions, repeat = M.repeat, numberAsBlocks = M.numberAsBlocks, GENERATORS = M.GENERATORS;
  var counterSay = M.counterSay, DIGIT_NAMES_ES = M.DIGIT_NAMES_ES, DIGIT_NAMES_EN = M.DIGIT_NAMES_EN, numberNameEs = M.numberNameEs, numberNameEn = M.numberNameEn, SMALL_ES = M.SMALL_ES;
  var TENS_ES = M.TENS_ES, HUNDREDS_ES = M.HUNDREDS_ES, SMALL_EN = M.SMALL_EN, TENS_EN = M.TENS_EN, under100Es = M.under100Es, under1000Es = M.under1000Es;
  var numberToWordsEs = M.numberToWordsEs, under100En = M.under100En, under1000En = M.under1000En, numberToWordsEn = M.numberToWordsEn, numberToWords = M.numberToWords;

  var TOOL_ID = 'numbers';
  var $ = App.utils.$;

  var screenMenu = $('#screenMenu');
  var screenLevels = $('#screenLevels');
  var screenGame = $('#screenGame');
  var screenEnd = $('#screenEnd');
  var signedIntroScreen = $('#signedIntroScreen');
  var signedRealScreen = $('#signedRealScreen');
  var signedTempScreen = $('#signedTempScreen');
  /* Generic exposition + real-life screens, reused by the 5 sub-activities
     that flag DATA.<act>.hasExpoReal = true. Content painted from strings
     keyed by the current sub-activity id. */
  var screenExpo = $('#expoScreen');
  var screenReal = $('#realScreen');
  var promptEl = $('#prompt');
  var visualEl = $('#visual');
  var legendEl = $('#legend');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var btnNext = $('#btnNext');
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var starsEl = $('#stars');
  var progressBar = $('#progressBar');
  var quizCard = $('#quizCard');
  /* Free-exploration counter level (see data.js: 'counter'). These
     refs are populated for every level; render() hides the whole
     #counterUI block when the level isn't a counter. */
  var counterUI = $('#counterUI');
  /* Free-exploration elevator level (see data.js: 'ascensorLibre' /
     'ascensorMeta'). Same mechanic as the water-temperature tool:
     ——10/——1/+1/+10 buttons, the visual reacts on every step. */
  var elevatorUI = $('#elevatorUI');
  /* Interactive "leer números" level (see data.js: 'lecturaInput').
     The flow is: a "Generate" button reveals a number in words;
     the user types the numeric form; "Comprobar" validates, "Ver
     resultado" fills the input with the correct answer (so the
     user can study it or correct from there). Same round shape as
     the other quiz levels: 6 questions, +1 star per correct
     "Comprobar" answer. */
  var lecturaUI = $('#lecturaUI');
  var lecturaWords = $('#lecturaWords');
  var lecturaInput = $('#lecturaInput');
  var lecturaGenerate = $('#lecturaGenerate');
  var lecturaCheck = $('#lecturaCheck');
  var lecturaReveal = $('#lecturaReveal');
  var lecturaNext = $('#lecturaNext');
  var lecturaHint = $('#lecturaHint');
  /* Interactive "escribir números" level (see data.js: 'escribirInput').
     Sibling of #lecturaUI with the same shape: a "Generar" button,
     a wide input, "Comprobar" / "Ver resultado" / "Siguiente". The
     difference is that "Generar" plays the number aloud via Web
     Speech (no visual representation), and a "🔊 Reproducir" button
     replays the audio so the user can hear it again before
     answering. */
  var escribirUI = $('#escribirUI');
  var escribirNumber = $('#escribirNumber');
  var escribirInput = $('#escribirInput');
  var escribirGenerate = $('#escribirGenerate');
  var escribirReplay = $('#escribirReplay');
  var escribirCheck = $('#escribirCheck');
  var escribirReveal = $('#escribirReveal');
  var escribirNext = $('#escribirNext');
  var escribirHint = $('#escribirHint');
  /* Random exploration suggestion. Painted by paintElevatorSuggestion
     on every render (entry, reset, "play again"). Same pattern as
     the temperature tool's #thermoSuggestion. */
  /* Persistent progress */
  var progress = App.storage.get(TOOL_ID);
  if (typeof progress.stars !== 'number') progress.stars = 0;
  if (typeof progress.completedRounds !== 'number') progress.completedRounds = 0;
  if (typeof progress.signedRounds !== 'number') progress.signedRounds = 0;
  var legacySignedProgress = App.storage.get('posneg');
  if (!progress.signedLegacyMigrated &&
      (typeof legacySignedProgress.stars === 'number' ||
       typeof legacySignedProgress.completedRounds === 'number')) {
    var migratedProgress = Object.assign({}, progress);
    migratedProgress.stars += legacySignedProgress.stars || 0;
    migratedProgress.signedRounds = Math.max(
      migratedProgress.signedRounds,
      legacySignedProgress.completedRounds || 0
    );
    migratedProgress.signedLegacyMigrated = true;
    if (App.storage.set(TOOL_ID, migratedProgress)) {
      progress = migratedProgress;
      App.storage.remove('posneg');
    }
  }

  /* Reinforce: see core in assets/js/feedback.js (App.reinforce).
     fixedQuestion allows reusing render() with an external question
     (the reinforcement one); if null, render() generates a new one
     as before. reinforcement.active() controls the mini-round flow. */
  var fixedQuestion = null;
  var reinforcement = App.reinforce.session({
    titleKey: 'refuerzoTitulo',
    introKey: 'refuerzoIntro',
    show: function (p) { showReinforceQuestion(p); paintReinforceProgress(); }
  });
  /* Round state */
  var activity = null;
  var level = null;
  var index = 0;
  var roundCorrect = 0;
  var answered = false;
  var attempts = 0;
  var question = null;
  var resolved = false;
  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;

  /* ---- Utilidades ---- */

  /* Pick a random integer in [min, max] inclusive, avoiding
     `avoid`. Used by paintElevatorSuggestion to pick a starting
     floor that is not where the elevator already is. Up to 8
     attempts so a near-full range still finds a different value. */
  /* The round takes elements from the pool without repeating: the
     activity passes a unique key per round (e.g. '<slug>:<level>:<slot>')
     and App.utils.drawRound refills the bag when it runs out. */

  /* ---- Color-coded digits by place value ---- */

  /* Thousands separator ('.' is / ',' in) and decimal (',' is / '.' in).
     Not only styling: switching the separator between locales is
     mandatory so the paintNumber reads correctly (see I18N.md §2). */
  /* html for the digits of n. highlight: place (0=units, 1=tens⬦)
     that gets underlined. labels: group labels (thousands, millions⬦). */
  /* ---- Numeric options (3, unique, shuffled) ---- */

  /* n drawn with this tool's own place-value blocks (hundred squares, ten
     bars, single units), so two quantities can be compared by looking
     before they are compared as digits. */
  /* ============================================================
     Question generators (one per level type)
     Return: prompt, visual (html), legend,
     options[{html, correct, aria?}], hint?, enFila?, visualAria?
     ============================================================ */

  /* ============================================================
     Screens and flow
     ============================================================ */

  function show(screen) {
    [screenMenu, screenGame, screenEnd, signedIntroScreen, signedRealScreen, signedTempScreen,
     screenExpo, screenReal].forEach(function (p) {
      p.classList.toggle('hidden', p !== screen);
    });
  }

  /* ---- Activity menu (flat grid, one button per DATA.activities entry) ---- */
  function paintMenu() {
    var cont = $('#activitiesMenu');
    cont.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'menu-grid';
    Object.keys(DATA.activities).forEach(function (id) {
      var act = DATA.activities[id];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-actividad';
      btn.innerHTML = '<span class="picto" aria-hidden="true">' + act.picto + '</span>' +
        '<span>' + App.i18n.t('activity.' + id + '.name') + '</span>' +
        '<span class="detail-card">' + App.i18n.t('activity.' + id + '.detail') + '</span>';
      btn.addEventListener('click', function () { openActivity(id); });
      grid.appendChild(btn);
    });
    cont.appendChild(grid);
  }

  /* ---- Levels of an activity (now automatic via levelFromProgress) ---- */

  /* ---- Game ---- */
  /* The level rises one step per completed round, capped at the last
     one, so a person who comes back continues where they were. */
  function levelFromProgress() {
    var levels = activity.levels;
    var completed = activity.id === 'positivos-y-negativos'
      ? progress.signedRounds
      : progress.completedRounds;
    return levels[Math.min(completed || 0, levels.length - 1)];
  }

  function openActivity(id) {
    activity = DATA.activities[id];
    activity.id = id;
    if (id === 'positivos-y-negativos') {
      startSignedIntro();
      return;
    }
    if (activity.hasExpoReal) {
      startExpoScreen(id);
      return;
    }
    startRound(levelFromProgress());
  }

  /* ---- Exposition + real-life screens for hasExpoReal activities ---- */

  function startRound(nv) {
    level = nv;
    index = 0;
    roundCorrect = 0;
    App.utils.drawRoundReset();
    fixedQuestion = null;
    reinforcement.begin();
    show(screenGame);
    render();
  }

  function showReinforceQuestion(p) {
    fixedQuestion = p;
    render();
  }

  function paintReinforceProgress() {
    progressFill.style.width = (((reinforcement.position() + 1) / reinforcement.total()) * 100) + '%';
    progressText.textContent = '';
  }

  function render() {
    resolved = false;
    attempts = 0;
    question = fixedQuestion || GENERATORS[level.tipo](level, index);
    fixedQuestion = null;

    /* The 'counter' level isn't a quiz: it returns a marker, not a
       question, and render() hands off to renderCounter() which
       hides everything else and shows the free-exploration UI. */
    if (question.tipo === 'counter') {
      renderCounter(question);
      return;
    }

    /* The 'elevator' missions ('ascensorLibre', 'ascensorMeta') are
       also not a quiz: the generator returns a marker, and
       render() hands off to renderElevator() which hides the quiz
       parts and shows the free-exploration UI. */
    if (question.tipo === 'elevator') {
      renderElevator(question);
      return;
    }

    /* The interactive "leer números" level: also a quiz, but with
       a typed input + "Comprobar" / "Ver resultado" instead of
       multiple-choice options. Hands off to renderLecturaInput
       which owns its own UI. */
    if (question.tipo === 'lecturaInput') {
      renderLecturaInput(question);
      return;
    }

    /* The interactive "escribir números" level: same shape as
       lecturaInput (typed input + "Comprobar" / "Ver resultado")
       but the number is played as AUDIO when "Generar" is
       clicked, with no visual representation. Hands off to
       renderEscribirInput. */
    if (question.tipo === 'escribirInput') {
      renderEscribirInput(question);
      return;
    }

    /* Quiz mode: show the standard parts, hide the counter UI. */
    progressBar.classList.remove('hidden');
    quizCard.classList.remove('hidden');
    optionsEl.classList.remove('hidden');
    counterUI.classList.add('hidden');
    elevatorUI.classList.add('hidden');
    lecturaUI.classList.add('hidden');
    escribirUI.classList.add('hidden');

    promptEl.textContent = question.prompt;
    visualEl.innerHTML = question.visual || '';
    if (question.visualAria) {
      visualEl.setAttribute('role', 'img');
      visualEl.setAttribute('aria-label', question.visualAria);
    } else {
      visualEl.removeAttribute('role');
      visualEl.removeAttribute('aria-label');
    }
    legendEl.innerHTML = question.legend || '';
    legendEl.classList.toggle('hidden', !question.legend);

    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    btnNext.classList.add('hidden');

    optionsEl.innerHTML = '';
    optionsEl.classList.toggle('options-row', !!question.inline);
    question.options.forEach(function (op) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = op.html;
      if (op.aria) btn.setAttribute('aria-label', op.aria);
      btn.addEventListener('click', function () { answer(op, btn); });
      optionsEl.appendChild(btn);
    });

    progressFill.style.width = ((index / DATA.perRound) * 100) + '%';
    progressText.textContent = '';
    paintStars();
  }

  /* Extracts the visible text from an option.html (may contain inner <span> elements) */
  var plainText = App.utils.plainText;


  function showExplanation(isCorrect) {
    if (isCorrect && reinforcement.active()) {
      explanationEl.textContent = '';
      explanationWrap.classList.add('hidden');
      return;
    }
    var correct = question.options.filter(function (o) { return o.correct; })[0];
    var text = (isCorrect ? App.i18n.t('explicacionCorrecta') : App.i18n.t('explicacionIncorrectaA')) +
      plainText(correct.html) + '.';
    explanationEl.textContent = text;
    explanationWrap.classList.remove('hidden');
  }

  /* Socratic method: on the first mistake the answer isn't given,
     the person is encouraged to look at the question/visual again.
     Only on the second mistake is the correct answer explained
     (showExplanation). The invitation is the one written for THIS
     question —which is what to do with the figure in front of you— and
     not the same sentence for every question. The generic line is only
     the fallback, for a question that forgot to bring its own. */
  function showHint(op) {
    /* The hint names the answer just tried («{elegida}») and says why it
       does not fit and where to look, never the right answer. */
    explanationEl.textContent = App.feedback.hintText(
      (question && question.hint) || App.i18n.t('hint'),
      op ? plainText(op.html) : '');
    explanationWrap.classList.remove('hidden');
  }

  function answer(op, btn) {
    if (resolved) return;
    if (op.correct) {
      showExplanation(op.correct);
      resolved = true;
      btn.classList.add('correct');
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      btnNext.classList.remove('hidden');
      btnNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) App.reinforce.add(level.id + ':' + index, question);
      var respuestaTrasPista = attempts > 1;
      showHint(op);
      /* Reveal the explanation only after the hint is acknowledged. */
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap, function () { if (respuestaTrasPista) showExplanation(op.correct); });
    }
  }

  function next() {
    if (reinforcement.active()) {
      if (!reinforcement.nextItem()) {
        endRound();
      }
      return;
    }
    index += 1;
    if (index >= DATA.perRound) {
      var consume = App.reinforce.consume();
      if (consume.length === 0) endRound();
      return;
    }
    render();
  }

  function endRound() {
    if (activity.id === 'positivos-y-negativos') {
      progress.signedRounds += 1;
    } else {
      progress.completedRounds = (progress.completedRounds || 0) + 1;
    }
    save();
    show(screenEnd);
    var summaryEl = $('#endSummary');
    if (level.tipo === 'counter') {
    var summaryEl = $('#endSummary');
    if (summaryEl) {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    } else if (activity.id === 'positivos-y-negativos') {
      summaryEl.textContent = App.i18n.t('signed.endSummary')
        .replace('{stars}', progress.stars);
    } else if (level.tipo === 'ascensorLibre' || level.tipo === 'ascensorMeta') {
      /* Free-exploration elevator: no question count, only a star
         tally. Different from the counter summary to keep each
         tool's closing line distinct. */
      summaryEl.textContent = '';
    } else {
      summaryEl.textContent = App.i18n.t('endSummary')
        .replace('{n}', roundCorrect)
        .replace('{activity}', App.i18n.t('activity.' + activity.id + '.name'))
        .replace('{stars}', progress.stars);
    }
    App.feedback.celebrate(App.i18n.t('core.roundComplete'));
  }

  /* ============================================================
     Free-exploration counter (no quiz)
     ============================================================ */

  /* Reads the current number aloud using App.tts. For exact powers
     of ten we use the words already registered in DATA.potencias
     (same source as the escalera generator); for any other value we
     fall back to the formatted decimal so the browser's TTS reads
     it digit-by-digit (e.g. "one million, two hundred thirty four
     thousand, five hundred sixty seven"). For non-power-of-ten
     numbers the formatted-with-separator string reads naturally
     with the thousands separator as a pause marker. */
  /* Digit names for the fallback TTS path above. Kept local because
     they're only used by counterSay; the rest of the app uses
     DATA.potencias + DATA.readings for full number-to-words. */
  /* Per-level state for the counter. Held in a closure so re-entering
     the level (via Exit —  Play again) starts fresh. */
  /* When the thousands separator is hidden, this paints each 3-digit
     group in a distinct background tint, simulating the visual cue of
     the separator dot. Only meaningful when counterShowSep is false. */
  /* ============================================================
     Interactive "leer números" - typed input + "Comprobar" / "Ver
     resultado" / "Generar" buttons. The number is shown in words;
     the user types the numeric form in a wide input. The round is
     6 questions; +1 star per "Comprobar" answer that matches.
     "Ver resultado" fills the input with the canonical answer and
     ends the question (no star) - it is the "I do not know, show me"
     button the user requested.
     ============================================================ */

  /* Tracks whether the current lecturaInput question has already
     been answered (either via "Comprobar" or "Ver resultado"). Held
     in a closure so re-entering the level (next round) starts
     fresh. */
  var lecturaAnswered = false;

  /* Wrong typed answer (lecturaInput and escribirInput). A hint does
     not help with a number, so the solution is shown instead: the
     digits and how they are read in words. The input and the answer
     buttons are locked until "Entendido" is pressed
     (App.feedback.lockUntilAck). Then the solution is hidden and the
     input opens again so the user writes the number. */
  function showTypedSolution(input, buttons) {
    /* Show what was typed next to the solution, so the person can
       compare the two numbers. With nothing typed, the plain message. */
    var typed = (input.value || "").trim();
    if (typed) {
      explanationEl.textContent = App.i18n.t("typedSolutionMine")
        .replace("{typed}", function () { return typed; })
        .replace("{n}", question.correct)
        .replace("{words}", question.words);
    } else {
      explanationEl.textContent = App.i18n.t("typedSolution")
        .replace("{n}", question.correct)
        .replace("{words}", question.words);
    }
    explanationWrap.classList.remove("hidden");
    App.feedback.lockUntilAck([input].concat(buttons), explanationWrap, function () {
      explanationWrap.classList.add("hidden");
      explanationEl.textContent = "";
      input.focus();
    });
  }

  function renderLecturaInput(q) {
    /* Standard quiz parts are hidden - this level owns its own
       panel. progressBar stays visible so the user can see how
       many questions remain in the round. */
    progressBar.classList.remove("hidden");
    quizCard.classList.add("hidden");
    optionsEl.classList.add("hidden");
    counterUI.classList.add("hidden");
    elevatorUI.classList.add("hidden");
    lecturaUI.classList.remove("hidden");
    btnNext.classList.add("hidden");

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    explanationWrap.classList.add("hidden");
    explanationEl.textContent = "";
    /* Reset local state. */
    lecturaAnswered = false;
    lecturaInput.value = "";
    lecturaInput.disabled = false;
    /* The number is hidden until the user clicks "Generar". Until
       then, the prompt + Generate button are the only affordance -
       the user controls when a number appears. */
    lecturaWords.textContent = "";
    lecturaWords.classList.add("hidden");
    lecturaGenerate.classList.remove("hidden");
    lecturaCheck.classList.add("hidden");
    lecturaReveal.classList.add("hidden");
    lecturaNext.classList.add("hidden");
    lecturaInput.classList.add("hidden");
    /* Localized labels. */
    lecturaGenerate.textContent = App.i18n.t("gen.lecturaInputGenerate");
    lecturaCheck.textContent = App.i18n.t("gen.lecturaInputCheck");
    lecturaReveal.textContent = App.i18n.t("gen.lecturaInputReveal");
    lecturaNext.textContent = App.i18n.t("core.next");
    /* Default prompt and a faint hint telling the user to click
       "Generate" first. */
    promptEl.textContent = question.prompt;
    lecturaHint.textContent = App.i18n.t("gen.lecturaInputIdleHint");
    lecturaHint.classList.remove("hidden");
    progressFill.style.width = ((index / DATA.perRound) * 100) + "%";
    progressText.textContent = "";
    paintStars();
  }

  /* Called when the user clicks "Generar número" - reveals the
     current question's number in words and shows the input. The
     number itself was decided up front by the generator (so the
     correct answer is stable across "Comprobar" attempts);
     "Generar" only changes what the user SEES. If the user wants a
     brand-new number before answering, they have to use the
     "Siguiente" path (which advances to the next question and a
     fresh random pick). */
  function showLecturaInput() {
    lecturaWords.textContent = question.words;
    lecturaWords.classList.remove("hidden");
    lecturaInput.value = "";
    lecturaInput.disabled = false;
    lecturaInput.classList.remove("hidden");
    lecturaGenerate.classList.add("hidden");
    lecturaCheck.classList.remove("hidden");
    lecturaReveal.classList.remove("hidden");
    lecturaNext.classList.add("hidden");
    lecturaHint.classList.add("hidden");
    /* Focus the input so the keyboard is ready. */
    lecturaInput.focus();
  }

  /* Validate the user's input against the canonical answer. The
     user can correct the input between attempts and press
     "Comprobar" again; this mirrors the typed-input practice in
     tools/quantities, where the input is not locked after a miss
     so the user can edit and retry. */
  function checkLecturaInput() {
    if (lecturaAnswered) return;
    if (!question || question.tipo !== "lecturaInput") return;
    var raw = lecturaInput.value || "";
    /* Normalise: strip whitespace. The canonical answer is digits
       only (the number is read aloud without separators), so the
       only validation needed is a digit-string compare. */
    var clean = raw.trim().replace(/\s+/g, "");
    if (clean === question.correct) {
      lecturaAnswered = true;
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent += " " +
        App.i18n.t("lecturaInputCorrect").replace("{n}", question.correct);
      lecturaInput.disabled = true;
      lecturaCheck.classList.add("hidden");
      lecturaReveal.classList.add("hidden");
      lecturaNext.classList.remove("hidden");
      lecturaNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        App.reinforce.add(level.id + ":" + index, question);
      }
      App.feedback.encourage(feedbackEl);
      /* No hint here: the solution is shown and the user writes the
         number again after pressing "Entendido". */
      showTypedSolution(lecturaInput, [lecturaCheck, lecturaReveal]);
    }
  }

  /* Fill the input with the canonical answer and advance the
     state machine to "answered" so the next "Comprobar" is a
     no-op. No star is awarded - the user has seen the answer, so
     it does not count as a correct attempt. The user can still
     edit the input (e.g. to copy the answer character by
     character) before pressing "Siguiente". */
  function revealLecturaInput() {
    if (lecturaAnswered) return;
    if (!question || question.tipo !== "lecturaInput") return;
    lecturaAnswered = true;
    lecturaInput.value = question.correct;
    lecturaInput.disabled = false;
    lecturaCheck.classList.add("hidden");
    lecturaReveal.classList.add("hidden");
    /* "Siguiente" is the only forward path after a reveal. */
    lecturaNext.classList.remove("hidden");
    feedbackEl.textContent = App.i18n.t("lecturaInputRevealed")
      .replace("{n}", question.correct);
    feedbackEl.className = "feedback";
    feedbackEl.classList.add("success");
    lecturaNext.focus();
  }

  /* Wire up the lecturaInput controls once (the elements persist
     across questions). Same pattern as the counter and elevator
     wire-ups: a single addEventListener for each button, with the
     current question read from the closure each click. */
  if (lecturaGenerate) {
    lecturaGenerate.addEventListener("click", showLecturaInput);
  }
  if (lecturaCheck) {
    lecturaCheck.addEventListener("click", checkLecturaInput);
  }
  if (lecturaReveal) {
    lecturaReveal.addEventListener("click", revealLecturaInput);
  }
  if (lecturaInput) {
    /* Enter key on the input triggers "Comprobar" so the user
       does not have to mouse back to the button. */
    lecturaInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkLecturaInput();
      }
    });
  }
  if (lecturaNext) {
    /* "Siguiente" runs the same flow as the standard #btnNext:
       advance the round. Falls through to next() which already
       understands the index/round boundary. */
    lecturaNext.addEventListener("click", function () { next(); });
  }

  /* ============================================================
  /* ============================================================
     Interactive "escribir números" - typed input + audio.
     Sibling of renderLecturaInput/show/check/reveal above. The
     key difference: "Generar" plays the number aloud via
     App.tts.speak(numberToWords(n)) instead of painting the
     number in words. A "🔊 Reproducir" button is added so the
     user can hear the number again before answering. "Ver
     resultado" reveals the digits in the input (the same
     "answer in the input" affordance as lecturaInput).
     ============================================================ */

  /* Local state for the current escribirInput question. Held in
     a closure so re-entering the level starts fresh. */
  var escribirAnswered = false;

  /* Speak the current number aloud via App.tts. The audio is
     the same numberToWords(n) used by the lecturaInput flow -
     the only difference is the channel (audio vs visual). Safe
     when App.tts is missing (some test environments) - the
     function is a no-op then. */
  function speakQuestion() {
    if (!question || question.tipo !== "escribirInput") return;
    if (App.tts && App.tts.speak) {
      App.tts.speak(question.words);
    }
  }

  function renderEscribirInput(q) {
    /* Same panel setup as renderLecturaInput: progress bar
       visible, all other quiz parts hidden. */
    progressBar.classList.remove("hidden");
    quizCard.classList.add("hidden");
    optionsEl.classList.add("hidden");
    counterUI.classList.add("hidden");
    elevatorUI.classList.add("hidden");
    lecturaUI.classList.add("hidden");
    escribirUI.classList.remove("hidden");
    btnNext.classList.add("hidden");

    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
    explanationWrap.classList.add("hidden");
    explanationEl.textContent = "";
    /* Reset local state. */
    escribirAnswered = false;
    escribirInput.value = "";
    escribirInput.disabled = false;
    /* No number visible yet - the user must click "Generar"
       to hear the audio. */
    escribirNumber.textContent = "";
    escribirNumber.classList.add("hidden");
    escribirGenerate.classList.remove("hidden");
    escribirReplay.classList.add("hidden");
    escribirCheck.classList.add("hidden");
    escribirReveal.classList.add("hidden");
    escribirNext.classList.add("hidden");
    escribirInput.classList.add("hidden");
    /* Localized labels. */
    escribirGenerate.textContent = App.i18n.t("gen.escribirInputGenerate");
    escribirReplay.textContent = App.i18n.t("gen.escribirInputReplay");
    escribirCheck.textContent = App.i18n.t("gen.escribirInputCheck");
    escribirReveal.textContent = App.i18n.t("gen.escribirInputReveal");
    escribirNext.textContent = App.i18n.t("core.next");
    promptEl.textContent = question.prompt;
    /* Idle hint: tell the user the next click will play audio. */
    if (App.tts && App.tts.speak) {
      escribirHint.textContent = App.i18n.t("gen.escribirInputIdleHint");
    } else {
      escribirHint.textContent = App.i18n.t("gen.escribirInputNoAudio");
    }
    escribirHint.classList.remove("hidden");
    progressFill.style.width = ((index / DATA.perRound) * 100) + "%";
    progressText.textContent = "";
    paintStars();
  }

  /* Click on "Generar número": play the audio, reveal the
     input + Check + Replay + Reveal. Same shape as the lectura
     flow but the trigger is audio (App.tts.speak) instead of
     painting the number in words. */
  function showEscribirInput() {
    escribirNumber.textContent = "";
    escribirNumber.classList.add("hidden");
    escribirInput.value = "";
    escribirInput.disabled = false;
    escribirInput.classList.remove("hidden");
    escribirGenerate.classList.add("hidden");
    escribirReplay.classList.remove("hidden");
    escribirCheck.classList.remove("hidden");
    escribirReveal.classList.remove("hidden");
    escribirNext.classList.add("hidden");
    escribirHint.classList.add("hidden");
    /* Speak the number aloud (the whole point of this level). */
    speakQuestion();
    escribirInput.focus();
  }

  /* Click on "🔊 Reproducir": re-speak the current number. The
     number is the one decided up front by the generator; this
     button never picks a new value - it only re-says the same
     one. */
  function replayEscribir() {
    if (escribirAnswered) return;
    speakQuestion();
  }

  /* Click on "Comprobar": validate against the canonical answer.
     Same logic as checkLecturaInput - whitespace-tolerant digit
     compare, +1 star on success, encourage + retry on miss. */
  function checkEscribirInput() {
    if (escribirAnswered) return;
    if (!question || question.tipo !== "escribirInput") return;
    var raw = escribirInput.value || "";
    var clean = raw.trim().replace(/\s+/g, "");
    if (clean === question.correct) {
      escribirAnswered = true;
      progress.stars += 1;
      roundCorrect += 1;
      save();
      paintStars();
      App.feedback.success(feedbackEl);
      feedbackEl.textContent += " " +
        App.i18n.t("escribirInputCorrect").replace("{n}", question.correct);
      escribirInput.disabled = true;
      escribirCheck.classList.add("hidden");
      escribirReveal.classList.add("hidden");
      escribirReplay.classList.add("hidden");
      escribirNext.classList.remove("hidden");
      escribirNext.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        App.reinforce.add(level.id + ":" + index, question);
      }
      App.feedback.encourage(feedbackEl);
      /* No hint here: the solution is shown and the user writes the
         number again after pressing "Entendido". */
      showTypedSolution(escribirInput, [escribirCheck, escribirReveal]);
    }
  }

  /* Click on "Ver resultado": fill the input with the canonical
     answer and show "Siguiente". Same shape as revealLecturaInput. */
  function revealEscribirInput() {
    if (escribirAnswered) return;
    if (!question || question.tipo !== "escribirInput") return;
    escribirAnswered = true;
    escribirInput.value = question.correct;
    escribirInput.disabled = false;
    escribirCheck.classList.add("hidden");
    escribirReveal.classList.add("hidden");
    escribirReplay.classList.add("hidden");
    escribirNext.classList.remove("hidden");
    feedbackEl.textContent = App.i18n.t("escribirInputRevealed")
      .replace("{n}", question.correct);
    feedbackEl.className = "feedback";
    feedbackEl.classList.add("success");
    escribirNext.focus();
  }

  /* Wire up the escribirInput controls (elements persist across
     questions). Same pattern as the lecturaInput wire-up: one
     addEventListener per button, the current question is read
     from the closure each click. */
  if (escribirGenerate) {
    escribirGenerate.addEventListener("click", showEscribirInput);
  }
  if (escribirReplay) {
    escribirReplay.addEventListener("click", replayEscribir);
  }
  if (escribirCheck) {
    escribirCheck.addEventListener("click", checkEscribirInput);
  }
  if (escribirReveal) {
    escribirReveal.addEventListener("click", revealEscribirInput);
  }
  if (escribirInput) {
    /* Enter triggers "Comprobar" so the user does not have to
       mouse back to the button. */
    escribirInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkEscribirInput();
      }
    });
  }
  if (escribirNext) {
    escribirNext.addEventListener("click", function () { next(); });
  }

  /* ============================================================

     Free-exploration elevator (no quiz)
     Sibling of the water-temperature tool: ——10/——1/+1/+10 buttons,
     the visual reacts on every step. The big number reads with a
     sign; the shaft shows the elevator emoji on the current floor,
     with the ground floor (0) always highlighted as the boundary
     between positive and negative. Same storage shape as the
     counter — progress.stars increments on exit.
     ============================================================ */

  /* Per-mission state. Held in closures so re-entering the level
     (Exit —  Play again) starts fresh. */
  /* Set to the celebration key once a 'meta' mission lands on the
     target, so we don't replay the same celebration on every
     subsequent step. Reset on exit/re-enter. */
  /* Show the goal line. For 'libre' missions the goal is empty
     (no target, just explore). For 'meta' missions the goal reads
     the target floor with its sign. */
  /* Pick a random floor in [elevatorMin, elevatorMax] inclusive,
     avoiding the level's starting floor and 0. Same helper used
     by the temperature tool; kept local because both tools share
     the exact same mechanic. Avoids 0 because 0 is the ground
     floor — saying "go to floor 0" while the elevator is already
     there adds noise rather than direction. */
  /* Paint the suggestion line. For 'ascensorMeta' the goal line
     already names the target floor, so showing ANOTHER random
     floor would conflict — hide the suggestion. For 'ascensorLibre'
     the goal line is empty, so the suggestion adds a concrete
     starting floor to the open-ended mission. */
  /* Main render: number, state label, accessibility text, button
     enable/disable, live shaft. Called on every value change. */
  /* Render the shaft. Same shape as the old quiz-style
     shaftHTML(min, max, markers) but with a single marker — the
     elevator emoji on the current floor — and the ground floor
     always tinted with the project reasoning colour. Floors are
     listed top-to-bottom (max first) so floor +10 sits at the top
     and floor ——10 at the bottom, matching the building
     convention. */
  /* For 'meta' missions, when the user lands on the target floor
     (within DATA.elevador.tolerancia), show the celebration once.
     'libre' missions have no target, so no celebration fires. */
  /* Three paint variants for the displayed number, chosen from the
     current toggle state:
       - showSep              —  digit groups with . separator + label
       - !showSep && colorGroups —  digit groups with a coloured background
                                   per 3-digit chunk (no separator glyph)
       - !showSep && !colorGroups —  one continuous digit string */
  /* Elevator step handler: clamps the new value within the mission
     range and redraws. Same pattern as counterAddStep — the
     button enable/disable state is recomputed inside paintElevator
     so the next click will reflect the updated bounds. */
  /* Reads the current floor aloud with the matching above/on/
     below-ground line. Same wording as the state label so the
     audio and the visible label stay in sync. */
  /* The counter and the elevator (free-exploration levels) live in counter.js; the page gives them what they need. */
  var freeLevels = App.numbersCounter({
    progress: progress,
    save: save,
    paintStars: paintStars,
    endRound: endRound,
    show: show,
    screenMenu: screenMenu,
    level: function () { return level; },
    el: { feedbackEl: feedbackEl, progressBar: progressBar, quizCard: quizCard, optionsEl: optionsEl,
      btnNext: btnNext, progressFill: progressFill, progressText: progressText, counterUI: counterUI, elevatorUI: elevatorUI }
  });
  var renderCounter = freeLevels.renderCounter, renderElevator = freeLevels.renderElevator;


  /* ---- Events ---- */

  var elBtnBackToMenu = $('#btnBackToMenu');
  if (elBtnBackToMenu) elBtnBackToMenu.addEventListener('click', function () { show(screenMenu); });
  $('#btnNext').addEventListener('click', next);
  /* btnRepeat was removed during the 25-activity batch cleanup (memory
     entry on 2026-10-13); the screenEnd section no longer has the
     button, so its handler is gone too. If a future batch re-adds the
     button, wire this up again with the hasExpoReal/positivos-y-negativos
     branches restored. */
  var elBtnRepeat = $('#btnRepeat');
  if (elBtnRepeat) elBtnRepeat.addEventListener('click', function () {
    if (activity.id === 'positivos-y-negativos') startSignedIntro();
    else if (activity.hasExpoReal) startExpoScreen(activity.id);
    else startRound(levelFromProgress());
  });

  /* The exposition, the real-life screens and the signed-temperature mission live in screens.js. */
  var expositions = App.numbersScreens({
    show: show,
    paintStars: paintStars,
    current: function () { return activity; },
    startCurrentRound: function () { startRound(levelFromProgress()); },
    startPositivosNegativos: startPositivosNegativos,
    screens: { menu: screenMenu, expo: screenExpo, real: screenReal, signedIntro: signedIntroScreen,
      signedReal: signedRealScreen, signedTemp: signedTempScreen }
  });
  var startSignedIntro = expositions.startSignedIntro, startExpoScreen = expositions.startExpoScreen, startRealScreen = expositions.startRealScreen;

  /* After the last signed-temperature mission the activity is positivos y negativos: its round starts here. */
  function startPositivosNegativos() {
    activity = DATA.activities['positivos-y-negativos'];
    activity.id = 'positivos-y-negativos';
    startRound(levelFromProgress());
  }


  $('#noteExtra').innerHTML = App.i18n.t('notaTablas')
    .replace('{link}', '<a href="../math-tables/">' + App.i18n.t('notaTablasLink') + '</a>');

  paintMenu();
  paintStars();
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  var endBackToStart = $('#endBackToStart');
  if (endBackToStart) endBackToStart.addEventListener('click', function () { location.href = '../../'; });

})();
