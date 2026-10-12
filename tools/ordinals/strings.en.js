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

    /* ---------- Screen 2: real life ---------- */
    famousTitle: 'In real life',
    famousSubtitle: 'Two places where ordinals are used:',
    back: '← Back',
    continue: 'Next →',

    /* ---------- Screen 3: the reminder ---------- */
    backToExamples: '← Back to the examples',
    reminderTitle: 'Remember the whole series',
    reminderText: 'Each ordinal goes with its number.',
    ruleMatchTitle: 'Each ordinal goes with its number:',
    ruleStartTitle: 'And counting starts at first. There is no zeroth place:',
    start: 'Start practising →',
    backToReminder: '← Back to the reminder',

    /* ---------- Screen 4: the steps ---------- */
    chooseLevel: 'Choose a step.',
    backToLevels: '← Back to the steps',
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
      '1Name': 'first', '1Place': 'first place',
      '1Caption': 'It goes in front of everyone. The first in the queue.',
      '2Name': 'second', '2Place': 'second place',
      '2Caption': 'It goes after the first. The second in the queue.',
      '3Name': 'third', '3Place': 'third place',
      '3Caption': 'It goes third. In a queue, the third takes the third place.',
      '4Name': 'fourth', '4Place': 'fourth place',
      '4Caption': 'Fourth. From here on, the ordinal looks like its number: 4.',
      '5Name': 'fifth', '5Place': 'fifth place',
      '5Caption': 'Fifth. The fifth takes the fifth place.',
      '6Name': 'sixth', '6Place': 'sixth place',
      '6Caption': 'Sixth. Six in a queue: the sixth is the sixth place.',
      '7Name': 'seventh', '7Place': 'seventh place',
      '7Caption': 'Seventh. Seven in a queue.',
      '8Name': 'eighth', '8Place': 'eighth place',
      '8Caption': 'Eighth. Eight in a queue.',
      '9Name': 'ninth', '9Place': 'ninth place',
      '9Caption': 'Ninth. Nine in a queue.',
      '10Name': 'tenth', '10Place': 'tenth place',
      '10Caption': 'Tenth. Ten in a queue: the tenth is the last one.',
      /* The four "round" ordinals that are actually taught. The
         caption puts them in real life — the 11th floor, the 12th
         month, age 20, age 30 — because the bare word does not ring
         a bell. */
      '11Name': 'eleventh', '11Place': 'eleventh place',
      '11Caption': 'Eleventh. Eleven in a queue. Used for floors: "lives on the eleventh floor".',
      '12Name': 'twelfth', '12Place': 'twelfth place',
      '12Caption': 'Twelfth. Twelve in a queue. Also used for months: "the twelfth month".',
      '20Name': 'twentieth', '20Place': 'twentieth place',
      '20Caption': 'Twentieth. Twenty in a queue. Used for birthdays: "the twentieth".',
      '30Name': 'thirtieth', '30Place': 'thirtieth place',
      '30Caption': 'Thirtieth. Thirty in a queue. Also for birthdays: "the thirtieth".'
    },

    /* ---------- Real-life examples ----------
       Only TWO: the building and the queue. The sentences end with
       ':' because each scenario is rendered as a whole (the stack of
       floors or the row of people), not as "1 = first ... = third"
       one piece at a time; the sentence is the lead-in and the
       ordinals are read inside. */
    famous: {
      edificio: 'In a building, floors are counted from the bottom. The first floor is the lowest, and you go up:',
      cola: 'In a queue, the first one is at the front. You count from the first:'
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
    buildingAria: 'Building with {n} floors. The ground floor is floor 1; you climb up to floor {top}.',
    buildingFloor: 'floor {n}',
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