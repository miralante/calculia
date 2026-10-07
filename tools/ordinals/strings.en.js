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
    introNext: 'Next →',
    prev: '←',
    nextArrow: '→',

    /* ---------- Screen 2: real life ---------- */
    famousTitle: 'An ordinal from real life',
    famousSubtitle: 'Look at this example:',
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
       Two forms per ordinal — the figure and the word — plus the
       place, because the usual mistake is using one where another
       belongs. There is deliberately no degree-sign abbreviation
       ("1st" with the raised letters): check.js (6.1) forbids those
       by substring in everything served to the browser, because they
       are indistinguishable from a school-grade marker. The figure
       does the same job without fighting that gate. */
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
      '10Caption': 'Tenth. Ten in a queue: the tenth is the last one.'
    },

    /* ---------- Real-life examples ----------
       The sentences end with ':' because app.js appends the coloured
       count after them ("3rd = third"). If they brought their own
       full stop, the two halves would fight over the punctuation. */
    famous: {
      primeraCita: 'It is the first time they book an appointment. First is the one who goes in front:',
      segundaVez: 'They come back for the second time. The second time is no longer the first:',
      tercerPiso: 'They live on the third floor. Floors are counted from the bottom:',
      cuartoLugar: 'They came fourth in the race. You say fourth place:',
      quintoPiso: 'They live on the fifth floor. It is five floors above the first one:'
    },

    /* ---------- Support situations ----------
       So the ordinal names something instead of being a bare word. */
    scene: {
      cita: 'It is the first time they come.',
      repetir: 'It is the second time they do it.',
      piso: 'It is the floor they live on.',
      carrera: 'It is the place they got in the race.',
      turno: 'It is the turn they have.',
      entrega: 'It is the first delivery of the parcel.',
      visita: 'It is the second visit.',
      escalera: 'It is the floor they go up to.',
      clasificacion: 'It is the position in the list.',
      puesto: 'It is the place they have.'
    },

    /* ---------- The steps ---------- */
    level: {
      learnName: 'Learn the places',
      learnDetail: 'Look at a queue and say which place each one takes.',
      applyName: 'Use the ordinals',
      applyDetail: 'Written: 1st, 2nd, 3rd… up to the tenth.',
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