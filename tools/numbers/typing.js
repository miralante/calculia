/* ============================================================
   Calculia — Numbers: the typed-answer modes. "Leer números" (read a number
   that is shown in digits and type it in words) and "escribir números" (hear a
   number and type its digits). Both are question types of the quiz engine in
   app.js: the engine passes them the current question, and this file reads the
   round through host.current() and reports right and wrong answers through host.
   ============================================================ */
(function () {
  'use strict';

  var $ = App.utils.$;

  /* host: { current(), roundCorrect(), wrong(), next(), save(), paintStars(), progress }
     current() returns { level, index, question }; wrong() returns the attempts so far.
     Returns { renderLecturaInput(q), renderEscribirInput(q) }. */
  App.numbersTyping = function (host) {
    var current = host.current;
    var progress = host.progress;
    var save = host.save;
    var paintStars = host.paintStars;
    var next = host.next;
    var promptEl = $('#prompt');
    var optionsEl = $('#options');
    var feedbackEl = $('#feedback');
    var explanationWrap = $('#explanationWrap');
    var explanationEl = $('#explanation');
    var btnNext = $('#btnNext');
    var progressFill = $('#progressFill');
    var progressText = $('#progressText');
    var progressBar = $('#progressBar');
    var quizCard = $('#quizCard');
    var counterUI = $('#counterUI');
    var elevatorUI = $('#elevatorUI');
    var lecturaUI = $('#lecturaUI');
    var lecturaWords = $('#lecturaWords');
    var lecturaInput = $('#lecturaInput');
    var lecturaGenerate = $('#lecturaGenerate');
    var lecturaCheck = $('#lecturaCheck');
    var lecturaReveal = $('#lecturaReveal');
    var lecturaNext = $('#lecturaNext');
    var lecturaHint = $('#lecturaHint');
    var escribirUI = $('#escribirUI');
    var escribirNumber = $('#escribirNumber');
    var escribirInput = $('#escribirInput');
    var escribirGenerate = $('#escribirGenerate');
    var escribirReplay = $('#escribirReplay');
    var escribirCheck = $('#escribirCheck');
    var escribirReveal = $('#escribirReveal');
    var escribirNext = $('#escribirNext');
    var escribirHint = $('#escribirHint');

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
          .replace("{n}", current().question.correct)
          .replace("{words}", current().question.words);
      } else {
        explanationEl.textContent = App.i18n.t("typedSolution")
          .replace("{n}", current().question.correct)
          .replace("{words}", current().question.words);
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
      promptEl.textContent = current().question.prompt;
      lecturaHint.textContent = App.i18n.t("gen.lecturaInputIdleHint");
      lecturaHint.classList.remove("hidden");
      progressFill.style.width = ((current().index / DATA.perRound) * 100) + "%";
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
      lecturaWords.textContent = current().question.words;
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
      if (!current().question || current().question.tipo !== "lecturaInput") return;
      var raw = lecturaInput.value || "";
      /* Normalise: strip whitespace. The canonical answer is digits
         only (the number is read aloud without separators), so the
         only validation needed is a digit-string compare. */
      var clean = raw.trim().replace(/\s+/g, "");
      if (clean === current().question.correct) {
        lecturaAnswered = true;
        progress.stars += 1;
        host.roundCorrect();
        save();
        paintStars();
        App.feedback.success(feedbackEl);
        feedbackEl.textContent += " " +
          App.i18n.t("lecturaInputCorrect").replace("{n}", current().question.correct);
        lecturaInput.disabled = true;
        lecturaCheck.classList.add("hidden");
        lecturaReveal.classList.add("hidden");
        lecturaNext.classList.remove("hidden");
        lecturaNext.focus();
      } else {
        var attemptNo = host.wrong();
        if (attemptNo === 1) {
          App.reinforce.add(current().level.id + ":" + current().index, current().question);
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
      if (!current().question || current().question.tipo !== "lecturaInput") return;
      lecturaAnswered = true;
      lecturaInput.value = current().question.correct;
      lecturaInput.disabled = false;
      lecturaCheck.classList.add("hidden");
      lecturaReveal.classList.add("hidden");
      /* "Siguiente" is the only forward path after a reveal. */
      lecturaNext.classList.remove("hidden");
      feedbackEl.textContent = App.i18n.t("lecturaInputRevealed")
        .replace("{n}", current().question.correct);
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
      if (!current().question || current().question.tipo !== "escribirInput") return;
      if (App.tts && App.tts.speak) {
        App.tts.speak(current().question.words);
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
      promptEl.textContent = current().question.prompt;
      /* Idle hint: tell the user the next click will play audio. */
      if (App.tts && App.tts.speak) {
        escribirHint.textContent = App.i18n.t("gen.escribirInputIdleHint");
      } else {
        escribirHint.textContent = App.i18n.t("gen.escribirInputNoAudio");
      }
      escribirHint.classList.remove("hidden");
      progressFill.style.width = ((current().index / DATA.perRound) * 100) + "%";
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
      if (!current().question || current().question.tipo !== "escribirInput") return;
      var raw = escribirInput.value || "";
      var clean = raw.trim().replace(/\s+/g, "");
      if (clean === current().question.correct) {
        escribirAnswered = true;
        progress.stars += 1;
        host.roundCorrect();
        save();
        paintStars();
        App.feedback.success(feedbackEl);
        feedbackEl.textContent += " " +
          App.i18n.t("escribirInputCorrect").replace("{n}", current().question.correct);
        escribirInput.disabled = true;
        escribirCheck.classList.add("hidden");
        escribirReveal.classList.add("hidden");
        escribirReplay.classList.add("hidden");
        escribirNext.classList.remove("hidden");
        escribirNext.focus();
      } else {
        var attemptNo = host.wrong();
        if (attemptNo === 1) {
          App.reinforce.add(current().level.id + ":" + current().index, current().question);
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
      if (!current().question || current().question.tipo !== "escribirInput") return;
      escribirAnswered = true;
      escribirInput.value = current().question.correct;
      escribirInput.disabled = false;
      escribirCheck.classList.add("hidden");
      escribirReveal.classList.add("hidden");
      escribirReplay.classList.add("hidden");
      escribirNext.classList.remove("hidden");
      feedbackEl.textContent = App.i18n.t("escribirInputRevealed")
        .replace("{n}", current().question.correct);
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

    return { renderLecturaInput: renderLecturaInput, renderEscribirInput: renderEscribirInput };
  };
})();
