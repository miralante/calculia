/* ============================================================
   Calculia — Ordinal numbers: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces the
   parity), and the KEY SHAPE matters as much as the parity: app.js
   builds the series keys by concatenation — `t('ord.' + n + 'Name')`
   with a numeric n — so the dictionary registers them FLAT under the
   prefix (`'1Name'`, `'1Place'`…), never nested
   (`ord: { 1: { Name: … } }`), which would resolve to `ord.1.Name`.
   The es/en validator cannot see this: it only reads literal t()
   calls, so a mismatch passes every gate and fails in the browser,
   where t() hands back the key itself. Same pattern as
   `centuryContext.<n>` in Roman Numerals.

   Numeric keys are quoted because `1Name` is not a valid JavaScript
   identifier.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🥇 Ordinal Numbers',
    instruction: 'Learn which place each one takes.',

    /* ---------- Screen 1: the series ---------- */
    introTitle: 'Ordinals say the place',
    introText: 'Numbers say how many. Ordinals say which place each one takes.',
    /* Medals card: the concept presentation. It is the first real
       contact with the ordinals — first, second, third are the ones
       people already recognise without having to learn them. That is
       why the card is fixed and goes BEFORE the carousel: the series
       that follows adds to, not introduces. The card carries no h2
       and no lead-in: the three medals 🥇🥈🥉 with their abbreviated
       figure (1st, 2nd, 3rd) and their name (first, second, third)
       already say it all. The general intro card above ("Ordinals
       say the place") titles the screen. */
    introNext: 'See in real life →',
    prev: '←',
    nextArrow: '→',

    /* ---------- Screen 2: real life ----------
       Two direct slides: the queue (the first one is at the front)
       and the building (floors counted from the bottom up, with
       up/down arrows to point at the current floor). The explicit
       lists (1-9 and the round ones) were removed: the reminder on
       screen 3 already shows the whole series, repeating them here
       was just re-loading the same content. */
    famousTitle: 'In real life',
    famousSubtitle: 'Two places where ordinals make sense:',
    /* The 'back: ← Back' for screen 2 used to live here: back
       navigation between screens (1→2→3→4→5) no longer exists. Only
       the header's '← Volver' is left, which goes to the Calculia
       home page. The keys back/backToReminder/backToLevels/
       backToExamples were removed. */
    continue: 'Remember →',

    /* ---------- Screen 3: the reminder ----------
       Used to be 'Remember the whole series'. 'The whole series' was
       dropped — the screen is not a series, it is a reference table
       with all the taught ordinals. The button on screen 2 that
       takes you here is now 'Remember' so it matches the name of the
       screen it leads to. */
    reminderTitle: 'Remember',
    reminderText: 'Each ordinal goes with its number.',
    ruleMatchTitle: 'Each ordinal goes with its number:',
    start: 'Start practising →',

    /* ---------- Screen 4: the steps ---------- */
    chooseLevel: 'Choose a step.',
    chooseAnother: 'Choose another step',
    btnHome: 'Back to the start',

    /* ---------- The series ----------
       Three forms per ordinal — the figure, the word, and the place —
       because the usual mistake is using one where another belongs.
       The four "round" ordinals (11, 12, 20, 30) have a more
       explicit caption because their words do not ring a bell at
       first glance and need a sentence that places them.

       There is deliberately no degree-sign abbreviation ("1st" with
       the raised letters): check.js (6.1) forbids those by substring
       in everything served to the browser, because they are
       indistinguishable from a school-grade marker. The figure does
       the same job without fighting that gate. */
    ord: {
      /* The names and places stay here because the reminder, the
         list slides, and the quiz questions use them. The old caption
         block (captionInRow, number.N, numberUsage.N, the "N. Nth
         in a row." template built by captionFor in app.js) was
         removed: the carousel carries the figure and the name in the
         visual itself, and repeating the ordinal's word in a caption
         ("Sixth. six in a row.") did not help. The reminder chip's
         third piece is the natural number (1, 2, 3…) — NPlace ("sixth
         place") would just repeat "sixth". NPlace is still used by
         the quiz prompt ("Who's in sixth place?"), where "place" is
         informative. */
      '1Name': 'first', '1Place': 'first place',
      '2Name': 'second', '2Place': 'second place',
      '3Name': 'third', '3Place': 'third place',
      '4Name': 'fourth', '4Place': 'fourth place',
      '5Name': 'fifth', '5Place': 'fifth place',
      '6Name': 'sixth', '6Place': 'sixth place',
      '7Name': 'seventh', '7Place': 'seventh place',
      '8Name': 'eighth', '8Place': 'eighth place',
      '9Name': 'ninth', '9Place': 'ninth place',
      '10Name': 'tenth', '10Place': 'tenth place',
      /* The five "round" ordinals that are actually taught. The bare
         word is the one the learner memorises; the real-life usage
         lives in the screen-2 scenarios (building: eleventh floor;
         months: twelfth month; birthdays: twentieth, thirtieth,
         fortieth). */
      '11Name': 'eleventh', '11Place': 'eleventh place',
      '12Name': 'twelfth', '12Place': 'twelfth place',
      '20Name': 'twentieth', '20Place': 'twentieth place',
      '30Name': 'thirtieth', '30Place': 'thirtieth place',
      '40Name': 'fortieth', '40Place': 'fortieth place'
    },

    /* ---------- Real-life examples ----------
       Only TWO: the building and the queue. The sentences end with
       ':' because each scenario is rendered as a whole (the stack of
       floors or the row of people), not as "1 = first ... = third"
       one piece at a time; the sentence is the lead-in and the
       ordinals are read inside. */
    famous: {
      /* "In real life" slides: each one is just a title (label, painted
         by #famousLabel) and the visual. No explanatory text below —
         the long clarification lives in the reminder table (screen 3),
         which is where the figures, words, and places get consolidated.
         Same criterion as the Shapes gallery: the figure is shown with
         its name and nothing else.

         The lista1a9 / listaRedondos keys were removed: there are no
         more explicit-list slides here, just building and queue. The
         "text" entries are kept empty so es/en parity does not
         complain about orphan keys. */
      edificio: '',
      cola: ''
    },

    /* ---------- Support situations ----------
       So the ordinal names something instead of being a bare word.
       After the redesign of screen 2, the in-game support scenarios
       are split between floors (1st–5th) and queue (1st–5th) — the
       two contexts screen 2 has just introduced. */
    scene: {
      piso: 'It is the floor they live on.',
      piso2: 'It is the floor they live on.',
      piso3: 'It is the floor they live on.',
      piso4: 'It is the floor they live on.',
      piso5: 'It is the floor they live on.',
      cola: 'It is the place in the queue.',
      cola2: 'It is the place in the queue.',
      cola3: 'It is the place in the queue.',
      cola4: 'It is the place in the queue.',
      cola5: 'It is the place in the queue.'
    },

    /* ---------- The steps ---------- */
    level: {
      learnName: 'Learn the places',
      learnDetail: 'Look at a queue and say which place each one takes.',
      applyName: 'Use the ordinals',
      applyDetail: 'The common ones: from first to tenth, and the round ones.',
      testName: 'Everything',
      testDetail: 'A bit of everything, in no fixed order.'
    },
    levelDone: 'Done',
    starsCount: 'Difficulty {n}',
    stepLabel: 'Step {n} of {total} · {name}',
    chainNext: 'Next step: {name}',

    /* ---------- The queue ---------- */
    queueHint: 'Count from the flag 🏁.',
    queueAria: 'Queue of {n}. The arrow points at place {pos}.',

    /* ---------- The building and the queue (screen 2) ---------- */
    /* Label that appears above the scenario on screen 2. */
    buildingLabel: 'The building',
    /* The aria mentions the current floor ({current}) on top of the
       range: a screen reader hears "you are on floor N", which is
       exactly what the person sees in the visual via the floor
       highlight. */
    buildingAria: 'Building with {n} floors. You are on floor {current}; the ground floor is floor 1 and you climb up to floor {top}.',
    buildingFloor: 'floor {n}',
    /* Accessible labels for the up/down arrows. Not visible — only
       heard by screen readers. */
    buildingArrowUp: 'Go up one floor',
    buildingArrowDown: 'Go down one floor',
    queueLabel: 'The queue',
    queuePosition: '{n}th',
    queueAriaLabel: 'Queue of {n} people. The first one is at the front; the last one, at the back.',

    /* ---------- The game ---------- */
    qPosition: 'Which place does the arrow point at?',
    qMember: 'Who is in {place}?',
    qOrdinalToDigit: 'Which number is this ordinal?',
    qDigitToOrdinal: 'Which ordinal is this number?',

    correct: '✅ That is how you say it.',
    hintPrefix: '💡 ',
    wrongPrefix: 'The answer is: ',

    /* Socratic hints: they say where to look, never what the answer
       was. */
    hintPosition: 'Count from the flag. The first one is right next to it.',
    hintMember: 'Count from the flag up to that place.',
    hintOrdinalToDigit: 'Look at the number written next to the word.',
    hintDigitToOrdinal: 'Think which place that number takes in the queue.',

    finalSummary: 'You got {n} of {total} right. Now you have {stars} stars.',
    transfer: 'Ordinals are used for turns, floors, dates and lists. Knowing which place each one takes helps in daily life.'
  }, 'en');
})();