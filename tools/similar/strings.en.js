/* ============================================================
   Calculia — Same shapes texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   The numbers are NOT here: they live once in data.js, and what is
   compared is worked out in app.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔍 Same shapes',
    instructionMenu: 'Choose an activity.',
    contexto: 'An enlarged photo, a plan or a map are the same shape at another size. And a ramp can be more or less steep.',
    explicacion: '✅ There are no formulas here. Everything is counted in little squares and compared by looking.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Count the little squares calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    activity: {
      semejanza: { name: 'The same shape', detail: 'The same but bigger.', instruction: 'Two figures are the same shape when one is the other made bigger, without stretching or squashing it. If one is twice as wide, it also has to be twice as tall.' },
      pitagoras: { name: 'The three squares', detail: 'One is worth the other two.', instruction: 'If you draw a square on each side of a triangle with a right corner, the square on the long side has as many little squares as the other two put together. You can count it.' },
      rampas: { name: 'Ramps', detail: 'Which one climbs faster.', instruction: 'A ramp is steeper when it climbs more for every step it goes along. Two ramps of different sizes can be just as steep as each other.' }
    },
    level: {
      p1: 'Are they the same shape?',
      p2: 'Find the same shape',
      t1: 'How many little squares?',
      r1: 'Which climbs more?',
      r2: 'Do they climb the same?'
    },
    gen: {
      sameShape: 'Are these two the same shape?',
      pickSameShape: 'Which one is the same shape, at another size?',
      shapeHint: 'If one is twice as wide, it has to be twice as tall.',
      pairAria: 'A rectangle {aw} by {ah} and another {bw} by {bh}.',
      oneAria: 'A rectangle {w} by {h}.',
      squaresOnSides: 'How many little squares does the missing square have?',
      triHint: 'The missing one has as many as the other two put together.',
      triAria: 'Two squares of {a} and {b} little squares, and one to work out.',
      whichSteeper: 'Which of the two ramps climbs more?',
      rampHint: 'Look at how much each one climbs for how far it goes along.',
      rampKey: 'goes {run}, climbs {rise}',
      rampA: 'The first one',
      rampB: 'The second one',
      rampsAria: 'Two ramps drawn in little squares.',
      sameSlope: 'Are the two just as steep as each other?',
      slopeHint: 'They can be different sizes and still climb the same.'
    },
    transfer: 'This will help you understand a plan or a map, tell whether a photo has been stretched, and notice what is harder to climb.'
  }, 'en');
})();
