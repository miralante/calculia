/* ============================================================
   Calculia — Ordinal numbers: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces the
   parity). The KEY SHAPE matters as much as the parity: app.js and
   screens.js build the series keys by concatenation — `t('ord.' + n +
   'Name')` with a numeric n — so the dictionary registers them FLAT
   under the prefix (`'1Name'`, `'1Place'`…), never nested, which would
   resolve to `ord.1.Name`.

   Numeric keys are quoted because `1Name` is not a valid JavaScript
   identifier.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🥇 Ordinal Numbers',
    instruction: 'Learn which place each one takes.',

    /* ---------- Explanation ---------- */
    introTitle: 'Ordinals say the place',
    introText: 'Numbers say how many. Ordinals say which place each one takes.',

    /* ---------- Reminder ---------- */
    reminderTitle: 'Remember',
    reminderText: 'Each ordinal goes with its number.',
    ruleMatchTitle: 'Each ordinal goes with its number:',
    /* Reminder button: starts the test. */
    start: 'Start practising →',

    /* The natural number of an ordinal: "Position 3". */
    placePrefix: 'Position {n}',

    /* ---------- The series ----------
       Three forms per ordinal — the figure, the word, and the place —
       because the usual mistake is using one where another belongs.
       There is deliberately no degree-sign abbreviation: check.js (6.1)
       forbids those by substring in everything served to the browser. */
    ord: {
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
      /* The "round" ordinals that are taught. Real-life use appears in the
         examples (building: eleventh floor; birthdays: twentieth, thirtieth). */
      '11Name': 'eleventh', '11Place': 'eleventh place',
      '12Name': 'twelfth', '12Place': 'twelfth place',
      '20Name': 'twentieth', '20Place': 'twentieth place',
      '30Name': 'thirtieth', '30Place': 'thirtieth place',
      '40Name': 'fortieth', '40Place': 'fortieth place'
    },

    /* ---------- Real-life examples: the label of each one ---------- */
    podiumLabel: 'The podium',
    /* The podium by its medal (gold, silver, bronze) and its order. */
    podiumAria: 'Olympic podium. First place in the centre, with the gold medal; second to the left, with silver; third to the right, with bronze.',
    classificationLabel: 'The ranking',
    classificationAria: 'Ranking of {n} participants, from first to last.',
    queueLabel: 'The queue',
    queueAriaLabel: 'Queue of {n} people. The first one is at the front; the last one, at the back.',
    queueCounter: 'Counter',
    buildingLabel: 'The building',
    buildingAria: 'Building with {n} floors. You are on floor {current}; the ground floor is floor 1 and you climb up to floor {top}.',
    buildingFloor: 'floor {n}',
    /* Text tag on the current floor, so the highlight is not colour alone. */
    buildingHere: 'You are here',

    /* ---------- The test ---------- */
    queueGoal: 'Goal',
    queueHint: 'Count from the goal.',
    queueAria: 'Queue of {n}. The arrow points at place {pos}.',

    qPosition: 'Which place does the arrow point at?',
    qMember: 'Who is in {place}?',
    qOrdinalToDigit: 'Which number is this ordinal?',
    qDigitToOrdinal: 'Which ordinal is this number?',

    /* Explanation after a right answer (and after two misses): the rule of
       the question, in plain words. */
    explainPosition: 'Counting from the goal, the one the arrow points at is the {ord}.',
    explainMember: 'Counting from the goal, the {place} is {animal}.',
    explainOrdinalToDigit: 'The ordinal {ord} is written with the number {n}.',
    explainDigitToOrdinal: 'The number {n} is read as {ord}.',

    /* Socratic hints: they say where to look, never what the answer was. */
    hintPosition: '«{elegida}» is not the place: count from the goal. The first one is right next to it.',
    hintMember: '«{elegida}» is not that place: count from the goal up to that place.',
    hintOrdinalToDigit: '«{elegida}» is not the number: look at the number written next to the word.',
    hintDigitToOrdinal: '«{elegida}» is not the word for that place: think which place that number takes in the queue.'
  }, 'en');
})();
