/* ============================================================
   Calculia — Roman Numerals (reasoning: read Roman numerals and
   apply them to recognise centuries and real kings/queens).
   Data in data.js (DATA.symbols, DATA.numbers, DATA.monarchs,
   DATA.famousRomans, DATA.levels, DATA.decompose).

   Flow across 4 screens (rule 13, gradual progression):
   1) introScreen — standalone presentation: what Roman numerals
      are and a carousel to explore the 5 basic symbols/combinations
      (I, V, X, IV, VI) by tapping.
   2) famousScreen — real-world famous Roman numerals (century,
      king/queen, clock), always within I/V/X, for meaningful
      learning before moving on to the reminder.
   3) reminderScreen — the reminder: I/V/X table with colours and
      the subtract/add rule with two examples (IV, VI).
   4) quizScreen — the rounds themselves; the level is derived from
      the stored progress (levelFromProgress), not chosen on a
      separate levels screen.

   Quiz engine with 3 options where the correct answer is always
   evident: the two distractors are the components of the Roman
   numeral being taught (its unique letter values for
   number-answer modes, or two of its individual Roman letters for
   the numberToRoman mode). For VI the distractors are 5 and 1;
   for XI they are 10 and 1. When the numeral has only one unique
   letter (I, V, X, XX, …) the second slot is filled from the
   remaining letters/values that the activity teaches (1, 5, 10)
   so the round still has 3 distinct options. The base letters
   I, V, X (each one alone) take the full set {1, 5, 10} as
   distractors so the prompt teaches the symbol-to-value mapping
   rather than the components of the numeral. The previous
   format used "0" and "∞" as fixed distractors; the new format
   makes the distractors the actual pieces the answer is built
   from, so the user reads the prompt and recognises the
   components before picking the one that fits.

   Stepped (accumulated) formulas: instead of the one-line
   "10+10+1=21", the coloured formula walks the reader from the
   first chunk to the total one chunk at a time
   ("10+10=20, 20+1=21"), like school arithmetic. The
   DATA.decompose helper builds this chain in data.js; the
   formula on screen (famous screen and quiz) is rendered with
   each chunk in the colour of its letter, so the symbol →
   colour → value association is read together with the
   operation. Subtract pairs (IV/IX) stay atomic — there's
   nothing else to chain them with, and the subtract rule is the
   lesson.

   Levels 3-5 show, when available, a short real-world fact
   (century or reign). The Roman numeral shown is decomposed with
   colours (I→blue, V→green, X→orange, subtract→red) except in
   level 4 (numberToRoman), where the Roman numeral is the answer
   itself and is not previewed.
   Practice with repetition: each item from the practice levels
   (not the test) is presented exactly 2 times per round, in
   mixed order, to settle the mechanic without making the round
   too long. The test (level 'random') mixes the 4 base modes
   without repeating items, evaluating what was learned after
   practice.
   Errors are never punished: the first failure immediately shows
   the help with the coloured decomposition and the total (this
   is the "failure help" the activity applies); a second failure on
   the same item adds the correct answer as text to reinforce it.
   ============================================================ */
(function () {
  'use strict';

  var D = App.RomanDecomposition;
  var paintQuizDecomposition = D.paintQuizDecomposition;


  var M = App.romanNumeralsModel;
  var t = M.t, wrapTrailingRoman = M.wrapTrailingRoman, totalColorClass = M.totalColorClass,
      speakForQuiz = M.speakForQuiz, romanFor = M.romanFor, baseLevels = M.baseLevels,
      itemsForLevel = M.itemsForLevel;
  var realContext = M.realContext, pickHint = M.pickHint;

  var TOOL_ID = 'roman-numerals';
  var $ = App.utils.$;

  /* ---------- Screens ---------- */
  var introScreen = $('#introScreen');
  var famousScreen = $('#famousScreen');
  var reminderScreen = $('#reminderScreen');
  var quizScreen = $('#quizScreen');
  var endScreen = $('#endScreen');
  var SCREENS = [introScreen, famousScreen, reminderScreen, quizScreen, endScreen];

  var starsEl = $('#stars');
  var dificultadEl = $('#difficulty');

  var referenceNext = $('#referenceNext');

  /* ---------- Game screen ---------- */
  var progressFill = $('#progressFill');
  var progressText = $('#progressText');
  var quizShown = $('#quizShown');
  var btnListenPrompt = $('#btnListenPrompt');
  var contextText = $('#contextText');
  var decompositionEl = $('#decomposition');
  var questionText = $('#questionText');
  var optionsEl = $('#options');
  var feedbackEl = $('#feedback');
  var explanationWrap = $('#explanationWrap');
  var explanationEl = $('#explanation');
  var nextBtn = $('#nextBtn');

  /* Persistent progress */
  var progress = App.storage.progressWith(TOOL_ID, { stars: 0, completedRounds: 0, completed: {} });

  var glue = App.activityGlue({
    toolId: TOOL_ID,
    progress: function () { return progress; },
    starsEl: function () { return starsEl; },
    show: function (el) { show(el); }
  });
  var save = glue.save, paintStars = glue.paintStars;
  function show(screen) {
    resetAudioUI();
    SCREENS.forEach(function (s) { s.classList.toggle('hidden', s !== screen); });
  }

  /* ---------- Screen 4: levels ---------- */

  /* Returns true if a group (with sublevels) is complete: every
     one of its sub-levels has at least one progress mark. Used to
     decide whether the group's button is shown as "Done". */
  function groupCompleted(groupId) {
    var group = DATA.levels.filter(function (n) { return n.id === groupId; })[0];
    if (!group || !group.sublevels) return false;
    return group.sublevels.every(function (sn) { return progress.completed[sn.id]; });
  }

  /* Determina el nivel según el progress: cada ronda completada, sube un nivel. */
  function levelFromProgress() {
    var idxN = Math.min(progress.completedRounds || 0, DATA.levels.length - 1);
    return DATA.levels[idxN];
  }

  /* ---------- Quiz round ---------- */
  var currentLevel = null;
  var currentGroup = null;
  var currentSubIdx = 0;
  var currentEntry = null;
  var items = [];
  var idx = 0;
  var correctCount = 0;
  var resolved = false;
  var attempts = 0;

  /* Returns the flat list of "base" sub-levels (those that have their
     own mode, not the groups). Used by 'test' (mixed round) and by
     the chained sub-levels within a group.

     Filters out groups (pool === 'group') and "test" levels
     (pool/mode === 'random'): both are wrappers, not base modes.
     From a group takes its sublevels; a standalone level (not
     random) is included as-is. So baseLevels() returns exactly the
     5 practice modes (level1..level5) and the test can sample from
     them at random. */
  /* Returns the list of { item, mode } entries for a round. The
     'test' level (mixed round) picks for each round position a
     random base level among the 5 modes.
     Practice levels (not test) pick `perRound` unique items and
     repeat them exactly `DATA.repetitions` times, in mixed order,
     so each number is seen 2 times before moving on: enough to
     settle the mechanic without making the round too long. */
  /* Identity of a round entry: the same number (or monarch) asked in the
     same mode is the same question on screen. */
  /* Starts a round. If 'level' is a group (pool 'group'), starts
     with its first sub-level and stores currentGroup + currentSubIdx
     so the next sub-levels are chained automatically when each round
     ends (see finish()). */
  function startLevel(level, inChain) {
    if (level.pool === 'group') {
      currentGroup = level;
      currentSubIdx = 0;
      startLevel(level.sublevels[0], true);
      return;
    }
    /* `inChain` separa "entrada desde el menú" de "siguiente
       sub-nivel de la cadena". Sin esa distinción, la rama de
       no-cadena ponía currentGroup a null y la cadena se rompía en
       silencio: finish() ya no encontraba el grupo, así que tras el
       PRIMER sub-nivel saltaba a la pantalla final y los sub-niveles
       2 y 3 nunca se jugaban. Nada fallaba — la ronda se cerraba
       con normalidad y sólo se perdían los pasos intermedios.
       El salto dentro de finish() es el que pasa `true`. */
    if (!inChain) {
      currentGroup = null;
      currentSubIdx = 0;
    }
    currentLevel = level;
    items = itemsForLevel(level);
    idx = 0;
    correctCount = 0;
    show(quizScreen);
    render();
  }

  /* Clears the visual state of any "speaking" audio button and
     cancels the in-progress TTS. Used when changing round/screen
     so a button that was playing doesn't remain "stuck" in the
     pressed state after moving to another screen without its
     onend having been called. */
  function resetAudioUI() {
    document.querySelectorAll('.btn-audio.hablando').forEach(function (b) {
      b.removeAttribute('aria-pressed');
      b.classList.remove('hablando');
    });
  }

  function paintProgress() {
    var total = items.length;
    progressFill.style.width = ((idx / total) * 100) + '%';
    progressText.textContent = '';
  }

  /* Looks up a real-life support sentence (century fact or monarch
     reign) via i18n. t() falls back to returning the key itself when
     missing (see i18n.js), so that's the signal a given item has no
     real-life sentence attached. */
  /* Builds the 2 distractor options for a round from the components
     of the Roman numeral being taught.

     For number-answer modes (romanToNumber, centuryToNumber,
     monarchToNumber): the distractors are the decimal values of the
     unique letters that compose the Roman numeral. For VI that's
     {5, 1}; for XI it's {10, 1}; for IV it's {1, 5} (the same I
     and V — the subtraction rule is what makes IV special, but the
     two letters it uses are still 1 and 5). When the numeral has
     only one unique letter (I, V, X, XX, …) and that letter's value
     would equal the correct answer, both distractors are drawn from
     the {1, 5, 10} set the activity teaches, never repeating the
     answer, so the round still has 3 distinct options.

     For numberToRoman (Roman-answer mode): the distractors are two
     individual Roman letters drawn from the unique letters in the
     answer numeral. For XI → {X, I}; for VI → {V, I}. When the
     answer has only one unique letter (I, V, X, XX, …) and the
     answer itself is a single letter, the second slot is filled
     with another valid letter from {I, V, X} that isn't the answer
     itself.

     The previous variant used "0" and "∞" as fixed distractors on
     the rationale that "Roman numerals have no symbol for zero or
     infinity, so the correct answer is the only one with a real
     symbol". The new variant teaches the mechanic instead: the two
     distractors are the actual pieces the answer is built from, so
     the user reads the prompt and recognises the letters (or
     values) that compose it before picking the one that fits.

     The return is a 2-element array of { value, kind } objects
     with kind 'no' or 'inf' kept as generic "distractor" tags
     (the CSS no longer differentiates them — see styles.css). */
  function buildDistractors(roman, isRomanAnswer, correctValue) {
    var uniqueLetters = [];
    String(roman).toUpperCase().split('').forEach(function (ch) {
      if (/[IVX]/.test(ch) && uniqueLetters.indexOf(ch) === -1) uniqueLetters.push(ch);
    });
    if (isRomanAnswer) {
      /* Pick 2 distinct letters from the unique set, never the
         answer itself (so for answer "I" we skip I and pick V and X;
         for answer "XI" we keep X and I). When the unique set has
         only 1 letter, fill from {I, V, X} excluding the answer. */
      var pool = uniqueLetters.filter(function (ch) { return ch !== correctValue; });
      if (pool.length < 2) {
        ['V', 'X', 'I'].forEach(function (ch) {
          if (pool.length < 2 && ch !== correctValue && pool.indexOf(ch) === -1) pool.push(ch);
        });
      }
      return [
        { value: pool[0], kind: 'no' },
        { value: pool[1], kind: 'inf' }
      ];
    }
    /* Number-answer mode: distractors are the decimal values of the
       unique letters, excluding the correct answer. */
    var poolValues = uniqueLetters.map(function (ch) { return ROMAN_VALUES[ch]; })
      .filter(function (v) { return v !== correctValue; });
    if (poolValues.length < 2) {
      /* Either the numeral has only one unique letter (I, V, X,
         XX …) and its value equals the answer, or the answer
         happens to match one of the unique values. Fill from the
         remaining {1, 5, 10} values, excluding the answer. */
      [1, 5, 10].forEach(function (v) {
        if (poolValues.length < 2 && v !== correctValue && poolValues.indexOf(v) === -1) poolValues.push(v);
      });
    }
    return [
      { value: poolValues[0], kind: 'no' },
      { value: poolValues[1], kind: 'inf' }
    ];
  }

  /* Builds what's shown, the question, the 3 options (correct value
     plus 2 component-based distractors, see buildDistractors) and
     the real-life support sentence, based on the level's mode.
     hintRoman feeds the first-attempt Socratic hint; decoRoman is
     what's shown proactively in #decomposition (chips only — the
     total stays hidden until the round resolves, see
     paintQuizDecomposition) — blank for numberToRoman, since there
     the roman numeral IS the hidden answer and showing it upfront
     would give the round away. */
  function buildRound(entry) {
    var mode = entry.mode;
    var item = entry.item;
    var shown, question, correctValue, context = '';
    var hintRoman = item.roman || romanFor(item.n);
    var decoRoman = hintRoman;
    var isRomanAnswer = false;
    if (mode === 'romanToNumber') {
      shown = item.roman;
      question = t('whichNumber');
      correctValue = item.n;
    } else if (mode === 'centuryToNumber') {
      /* Centuries are written in Roman numerals in real life (20th
         century) — the reverse, a century labelled with its
         decimal number (Century 20), isn't real usage, so this
         mode never shows the decimal number for a century (see
         numberToRoman below, which practices decimal → Roman
         without the century framing instead). */
      shown = t('centuryRomanLabel').replace('{roman}', item.roman);
      question = t('whichCenturyNumber');
      correctValue = item.n;
      context = realContext('centuryContext.' + item.n);
    } else if (mode === 'numberToRoman') {
      shown = String(item.n);
      question = t('whichRoman');
      correctValue = item.roman;
      decoRoman = '';
      isRomanAnswer = true;
    } else {
      shown = item.name;
      question = t('whichMonarchNumber');
      correctValue = item.n;
      context = realContext('monarchContext.' + item.id);
    }
    /* The numeral whose components drive the distractors is the
       Roman string associated with the round: for number-answer
       modes that's the prompt itself (item.roman); for
       numberToRoman it's the answer itself (correctValue). */
    var romanForDistractors = isRomanAnswer ? correctValue : (item.roman || romanFor(item.n));
    var distractors = buildDistractors(romanForDistractors, isRomanAnswer, correctValue);
    var options = App.utils.shuffle([
      { value: correctValue, kind: 'correct' }
    ].concat(distractors));
    return {
      shown: shown, question: question, correctValue: correctValue,
      options: options, context: context,
      hintRoman: hintRoman, decoRoman: decoRoman
    };
  }

  /* Socratic hint letter by letter: prioritises the subtract pairs
     (IV, IX) over the standalone letters. IX wins over the simple
     X hint because in XIX the subtract pair (I in front of an X) is
     the trickier mechanic and worth surfacing first; XI bypasses
     the X check on purpose — its whole point is that an X can be
     read together with a following I as a plain sum, which the
     general X hint ("how much is an X worth?") wouldn't make
     obvious. */
  function render() {
    var entry = items[idx];
    currentEntry = entry;
    resolved = false;
    attempts = 0;
    /* Resets the "speaking" state of the quiz audio button: if the
       user resolved the previous round while the prompt utterance
       was still playing, its onend was never called and the button
       would have remained stuck. Every new round must start with
       the button in a neutral state. */
    resetAudioUI();
    var round = buildRound(entry);
    quizShown.innerHTML = wrapTrailingRoman(round.shown);
    /* aria-label carries the visible text so the screen reader
       announces the Roman letters that aria-hidden spans would
       otherwise swallow (e.g. "Carlos III" reads as three letters
       separated by the natural space, not as "Carlos "). */
    quizShown.setAttribute('aria-label', round.shown);
    contextText.textContent = round.context;
    contextText.classList.toggle('hidden', !round.context);
    paintQuizDecomposition(round.decoRoman, false);
    questionText.textContent = round.question;
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    explanationWrap.classList.add('hidden');
    explanationEl.textContent = '';
    nextBtn.classList.add('hidden');
    optionsEl.innerHTML = '';
    /* Audio is OFF in numberToRoman mode: the visible prompt is
       a decimal number ("9") and the audio would just read it
       back to the user, giving the round away (the answer is
       the Roman numeral IX, not the spoken number). In every
       other mode the prompt is the Roman numeral itself
       (romanToNumber) or a meaningful phrase (centuryToNumber,
       monarchToNumber), so reading it aloud helps without
       spoiling the answer. */
    if (btnListenPrompt) btnListenPrompt.classList.toggle('hidden', entry.mode === 'numberToRoman');

    round.options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn' + (opt.kind !== 'correct' ? ' distractor-' + opt.kind : '');
      btn.textContent = opt.value;
      btn.addEventListener('click', function () { answer(btn, opt.kind === 'correct', round); });
      optionsEl.appendChild(btn);
    });

    paintProgress();
    paintStars();
  }

  function showExplanation(round) {
    var roman = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
    if (roman) paintQuizDecomposition(roman, true);
    explanationEl.textContent = t('correctExplanation');
    explanationWrap.classList.remove('hidden');
  }

  function answer(btn, isCorrect, round) {
    if (resolved) return;
    if (isCorrect) {
      showExplanation(round);
      resolved = true;
      btn.classList.add('correct');
      App.utils.$$('#options .option-btn').forEach(function (b) { b.disabled = true; });
      App.feedback.success(feedbackEl);
      progress.stars += 1;
      correctCount += 1;
      save();
      paintStars();
      nextBtn.classList.remove('hidden');
      nextBtn.focus();
    } else {
      attempts += 1;
      if (attempts === 1) {
        /* Failure help: on the first failed attempt the Socratic hint
           and the coloured decomposition with the total are
           immediately shown, so the user can see how the number
           is read. Showing the total does not "give away" the
           next round (the round is already failed and only the
           "Got it" button is unlocked), but it does teach the
           mechanic — which is exactly what the user asks for when
           they ask for failure help. */
        explanationEl.textContent = t('hintHint') + App.feedback.hintText(pickHint(round.hintRoman), btn.textContent);
        var romanHint = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
        if (romanHint) paintQuizDecomposition(romanHint, true);
        explanationWrap.classList.remove('hidden');
      } else {
        explanationEl.textContent = t('wrongExplanationPrefix') + round.correctValue;
        var roman = round.decoRoman || (typeof round.correctValue === 'string' ? round.correctValue : '');
        if (roman) paintQuizDecomposition(roman, true);
        explanationWrap.classList.remove('hidden');
      }
      btn.classList.add('encourage');
      btn.disabled = true;
      App.feedback.encourage(feedbackEl);
      App.feedback.lockUntilAck(App.utils.$$('#options .option-btn'), explanationWrap);
    }
  }

  function next() {
    resetAudioUI();
    idx += 1;
    if (idx >= items.length) {
      finish();
    } else {
      render();
    }
  }

  function finish() {
    progress.completed[currentLevel.id] = (progress.completed[currentLevel.id] || 0) + 1;
    save();
    /* If the round was part of a chained group, jump to the next
       sub-level automatically (without going back to the menu)
       while sub-levels remain. When the group is exhausted, the
       group's end screen is shown. */
    if (currentGroup && currentSubIdx + 1 < currentGroup.sublevels.length) {
      currentSubIdx += 1;
      startLevel(currentGroup.sublevels[currentSubIdx], true);
      return;
    }
    show(endScreen);
    $('#finalSummary').textContent = t('finalSummary')
      .replace('{n}', correctCount)
      .replace('{nWord}', App.i18n.starsWord(correctCount))
      .replace('{stars}', progress.stars).replace('{starsWord}', App.i18n.starsWord(progress.stars));
    App.feedback.celebrate(t('core.roundComplete'));
  }

  /* ---------- Eventos ---------- */

  /* The screens before the quiz (carousel, famous numerals, reminder) live in
     screens.js. They get show() and the two screens they move to, and give
     back the paint, bind and speech helpers. */
  var screens = App.romanNumeralsScreens({
    show: show,
    resetAudioUI: resetAudioUI,
    screens: { famous: famousScreen, reminder: reminderScreen }
  });
  screens.bind();
  var speakWithButton = screens.speakWithButton;
  var coloredChunkValue = screens.coloredChunkValue;

    referenceNext.addEventListener('click', function () {
    startLevel(levelFromProgress());
  });

  $('#backLevelsBtn').addEventListener('click', function () {
    startLevel(levelFromProgress());
  });
  nextBtn.addEventListener('click', next);
  if (btnListenPrompt) {
    btnListenPrompt.addEventListener('click', function () {
      speakWithButton(btnListenPrompt, speakForQuiz(currentEntry));
    });
  }

  function init() {
    App.i18n.apply();
    paintStars();
    screens.paint();
    show(introScreen);
  }

  document.addEventListener('DOMContentLoaded', init);
  /* End screen: the only button is "Volver al inicio", which goes back
     to the Calculia landing. The end screen is a closing card, not a
     second menu: picking another activity is a tap away on the home
     page, so it does not need its own button here. */
  App.utils.bindEndBackToStart();

})();
