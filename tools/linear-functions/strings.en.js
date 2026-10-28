/* ============================================================
   Calculia — Linear and affine functions text (EN)
   Locale-specific file. Same keys as strings.es.js.
   It is loaded conditionally from index.html depending on
   App.i18n.locale().
   'real.*' and 'activity.*' are looked up by the id data.js uses.
   All the copy follows the easy-read rules: short sentences, one idea
   per sentence, everyday words.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📈 Functions',
    instructionIntro: 'See how a rule turns one number into another.',

    /* ---- The four ideas, before any question ---- */
    concept: {
      casilla: {
        title: 'One square, two numbers',
        text: 'Each point is said with two numbers. First x: the number at the bottom. Then y: the number on the left.'
      },
      regla: {
        title: 'The rule is a machine',
        text: 'A number goes in. The rule changes it. Another number comes out. A table is made with every number that goes in.'
      },
      pendiente: {
        title: 'How much it goes up',
        text: 'Join the points and they make a straight line. Each time you move one square to the right, the line goes up the same. That amount is the m.'
      },
      origen: {
        title: 'Where it starts',
        text: 'If the line goes through zero, it is linear: y = m · x. If it starts at another number, it is affine: y = m · x + n. The n is that number.'
      }
    },

    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    introContinue: 'See them in real life →',
    realTitle: 'Functions are all around you',
    realContinue: 'Start practising →',
    instructionMenu: 'Choose what you want to practise.',

    /* ---- Real-life examples ---- */
    real: {
      taxi: {
        name: 'A taxi',
        text: 'It charges 3 € to start and 1 € for each kilometre. Even if you do not move, you already pay 3 €.'
      },
      hucha: {
        name: 'A piggy bank',
        text: 'You have 10 € saved. Each week you save 2 €. You start at 10 and each week it goes up 2.'
      },
      galletas: {
        name: 'A packet of biscuits',
        text: 'Each packet has 4 biscuits. If you buy none, you have no biscuits: it starts at zero.'
      }
    },

    activity: {
      casilla: { name: 'The squares', detail: 'One point, two numbers.' },
      tabla: { name: 'The rule and the table', detail: 'A number goes in, another comes out.' },
      recta: { name: 'The line', detail: 'Which one is off? Does it go through zero?' },
      pendiente: { name: 'How much it goes up and where it starts', detail: 'How much it goes up each time and where it starts.' },
      test: { name: 'Let\'s practise!', detail: 'A round with questions from everything.' }
    },

    kind: {
      lineal: 'Linear: it goes through zero',
      afin: 'Affine: it starts at another number'
    },

    endSummary: 'You have answered {n} questions of {activity}. Now you have {stars} stars.',
    btnHarder: 'Do you want to try "{name}"?',
    btnMenu: 'Back to the start',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the right answer is ',
    hint: '🤔 «{elegida}» is not the answer. Think calmly and look at the question again.',
    reinforceTitle: 'Practice',
    reinforceIntro: 'Let us repeat the {n} questions you got wrong until you get them all right.',
    reinforceDone: 'Extra practice finished. You have them all.',
    transfer: 'It will help you work out how much a taxi costs or how much you will have saved each week.',

    gen: {
      /* --- the squares --- */
      readCoord: 'Which square is the point in?',
      gridAria: 'A grid with numbers along its edges.',
      coordAria: 'x {x}, y {y}',
      coordHint: 'First x, the number at the bottom. Then y, the number on the left.',
      socraticCoord: '🤔 «{elegida}» is not the coordinate: go down from the point to the number at the bottom, then go up to the one on the left.',
      findPoint: 'Which drawing has the point in the square {where}?',
      socraticFindPoint: '🤔 «{elegida}» is not the point: find the number at the bottom and the one on the left, and the point is where they cross.',

      /* --- the rule and the table --- */
      tablePrompt: 'When x is {x}, how much is y?',
      tableAria: 'A table of x and y. The value of y is missing when x is {x}.',
      tableHint: 'Look at how much y goes up from one row to the next.',
      socraticTable: '🤔 «{elegida}» does not fit the table: look at how much y changes from one row to the next, and what number it starts at.',
      explainLinear: 'Each time x goes up 1, y goes up {m}. With x = {x}: {m} · {x} = {y}.',
      explainAffine: 'It starts at {n}. Each time x goes up 1, y goes up {m}. With x = {x}: {m} · {x} + {n} = {y}.',

      /* --- the line --- */
      offTheLine: 'Three points are in a straight line. Which one is off it?',
      pointsAria: '{n} points on a grid.',
      dotLetters: 'ABCD',
      lineUpHint: 'Imagine a ruler resting on the points: one stays outside.',
      socraticOffLine: '🤔 «{elegida}» is not the point that is off the line: look at which one does not follow the line the other points make.',
      explainOffLine: 'The other three are in the same straight line.',
      kindPrompt: 'Look at the line. Is it linear or affine?',
      kindHint: 'Linear: it goes through zero. Affine: it does not go through zero.',
      socraticKind: '🤔 «{elegida}» does not describe the line: look at the bottom left corner and see whether the line goes through there.',

      /* --- how much it goes up and where it starts --- */
      slopePrompt: 'Each time you move one square to the right, how much does the line go up?',
      slopeHint: 'Look at two points next to each other. How much does it go up from one to the other?',
      socraticSlope: '🤔 «{elegida}» is not how far the line rises: count how many squares it goes up when it moves one to the right.',
      explainSlope: 'Between two points next to each other, the line goes up {m}.',
      startPrompt: 'What number does the line start at?',
      startHint: 'Look where the line touches the line on the left.',
      socraticStart: '🤔 «{elegida}» is not the starting point: find the point of the line that sits on the line on the left and read its number.',
      explainStart: 'The line starts at {n}: that is where it touches the line on the left.',

      machineIn: 'in',
      machineOut: 'out'
    }
  }, 'en');
})();
