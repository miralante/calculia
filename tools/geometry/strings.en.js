/* ============================================================
   Calculia — Geometry texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'angle.*' holds the three kinds of angle; app.js looks them up by the
   kind it works out from the degrees, not by a stored id.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📐 Geometry',
    instructionMenu: 'Choose an activity.',
    contexto: 'Corners, edges and halves are in every door, every floor tile and any piece of paper you fold.',
    explicacion: '✅ Everything here can be counted or seen. There is no formula to learn.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 «{elegida}» is not the answer. Think calmly and look at the question again.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    /* The real name, with its everyday-words gloss beside it: the word is
       taught, not hidden. */
    angle: {
      right: { name: 'right', gloss: 'like a corner' },
      acute: { name: 'acute', gloss: 'more closed' },
      obtuse: { name: 'obtuse', gloss: 'more open' }
    },
    activity: {
      clasificar: { name: 'Equal sides', detail: 'Count them and name it.', instruction: 'Sides that are equal carry the same mark. Count the matching marks and you will know how many sides are the same length. Then you will name the figure.' },
      angulos: { name: 'Angles', detail: 'Right, acute or obtuse.', instruction: 'An angle is how open a corner is. A right angle is like the corner of a sheet of paper: in the picture it is marked with a grey line. If the line reaches exactly the grey line, the angle is right. If it stops before, it is acute: more closed. If it goes past, it is obtuse: more open.' },
    },
    level: {
      q1: 'How many equal sides?',
      q2: 'The name of the triangle',
      q3: 'The name of the 4-sided figure',
      n1: 'Right or acute',
      n2: 'Right or obtuse',
      n3: 'All three together',
      n4: 'How many degrees?',
      n5: 'The degrees on a clock'
    },
    figure: {
      equilateral: { name: 'equilateral', gloss: 'all three sides equal' },
      isosceles: { name: 'isosceles', gloss: 'two sides equal' },
      scalene: { name: 'scalene', gloss: 'all three sides different' },
      square: { name: 'square', gloss: 'four equal sides and right corners' },
      rectangle: { name: 'rectangle', gloss: 'two long and two short' },
      rhombus: { name: 'rhombus', gloss: 'four equal sides, but leaning' }
    },
    gen: {
      degrees: '{n} degrees',
      measureAngle: 'How many degrees is this angle?',
      protractorHint: 'Follow the arm out to the edge and read the number. Each little tick is {step} degrees.',
      protractorAria: 'An angle of {n} degrees on a protractor.',
      clockAngle: 'The two hands are on the {a} and on the {b}. What angle do they make?',
      clockHint: 'A whole turn is {turn} degrees and there are {marks} marks, so from one mark to the next is {each} degrees. Count the marks the short way round.',
      clockAria: 'A clock with its hands on the {a} and on the {b}.',
      howManyEqual: 'How many sides are the same length?',
      equalHint: 'Sides with the same mark are the same length.',
      equalAria: 'A figure with {n} equal sides marked.',
      whichFigure: 'What is this figure called?',
      whichAngle: 'What is this angle like?',
      angleHint: 'The grey line marks where a right angle is.',
      /* The hint that comes out when an answer is wrong. One per kind of
         question, and each one says what to look at or do with what is on
         screen: the single sentence it replaced ("Try again...") was the
         same for every question, so it said nothing. These never give the
         answer away - they give the strategy, which is what separates a
         Socratic hint from a spoiler. */
      socraticProtractor: '🤔 «{elegida}» is not the measure of the arm: look at which number on the protractor the moving arm reaches.',
      socraticClock: '🤔 «{elegida}» is not the short way round: count the marks along the short way round the clock, one by one.',
      socraticAngleKind: '🤔 «{elegida}» is not the kind of angle: compare the angle with the grey line marking the right corner.',
      socraticEqualSides: '🤔 «{elegida}» does not count the equal sides correctly: look at the matching marks and count the sides that carry them.',
      socraticFigureName: '🤔 «{elegida}» is not the name of the figure: count the equal sides first, then choose the name.'
    },
    transfer: 'This will help you see the corners of a door and find a square on a map.'
  }, 'en');
})();
