/* ============================================================
   Calculia — Exact groups texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'rule.*' holds the divisibility rules as they are actually used:
   app.js looks them up by the criterion id in data.js.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✖️ Exact groups',
    instructionMenu: 'Choose an activity.',
    contexto: 'Some numbers share out exactly and some always leave something over. Knowing which is which saves a lot of work.',
    explicacion: '✅ Everything can be checked by putting the dots in rows and seeing whether the last row comes out full.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at whether the last row comes out full.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    /* Each rule, written the way it is really used. */
    rule: {
      by2: 'By 2 it works if it ends in 0, 2, 4, 6 or 8.',
      by5: 'By 5 it works if it ends in 0 or 5.',
      by10: 'By 10 it works if it ends in 0.',
      by3: 'By 3 it works if adding up its digits gives a number from the 3 times table.'
    },
    activity: {
      grandes: { name: 'Big numbers', detail: 'Written short.', instruction: 'A million is a 1 with six zeros. So as not to write all those zeros, you write 10 with a small number above it saying how many zeros it carries. Count them and you have it.' },
      noExactos: { name: 'It does not come out exact', detail: 'Numbers that do not fit.', instruction: 'The side of a square is a whole number of little squares. But its diagonal, the line from corner to corner, never lands on a line: there is no exact number that measures it. Some numbers are like that.' },
      multiplos: { name: 'Multiples', detail: 'Does it come out even?', instruction: 'A number is a multiple of another if it can be shared into full rows with none left over. Put the dots in rows and look at the last one: if it is full, it is a multiple.' },
      criterios: { name: 'Quick rules', detail: 'Without doing the division.', instruction: 'There are rules that tell you whether a division comes out exactly without doing it. For 2, 5 and 10 you only look at the last digit. For 3 you add up all the digits.' },
      primos: { name: 'Prime numbers', detail: 'The ones that do not share.', instruction: 'A prime number cannot be shared into full rows any way at all, except rows of one. Here it is tried with 2, 3 and 5: if none comes out full, it is prime.' },
      coinciden: { name: 'When they meet', detail: 'And the common chunk.', instruction: 'If one thing happens every 4 and another every 6, there are moments when they meet. You can also look for the biggest chunk that fits exactly into two different lengths.' },
      cuadrados: { name: 'Squares', detail: 'Squaring and back again.', instruction: 'A number squared is a real square: 5 squared is 5 rows of 5. The square root is the other way round: you are given the little squares and you look for the side.' }
    },
    level: {
      s3: 'The root of a cube',
      s4: 'Multiplying negatives',
      s5: 'How many times?',
      z1: 'How many zeros?',
      z2: 'Written short',
      i1: 'Does it come out exact?',
      m1: 'Is it a multiple?',
      m2: 'Find the multiple',
      d1: 'By 2 and by 5',
      d2: 'By 10 and by 3',
      p1: 'Is it prime?',
      c1: 'When they meet',
      c2: 'The biggest chunk',
      s1: 'Squared',
      s2: 'The root'
    },
    big: {
      '2': 'a hundred',
      '3': 'a thousand',
      '4': 'ten thousand',
      '6': 'a million',
      '9': 'a billion'
    },
    gen: {
      cubeRoot: 'A cube has {n} little cubes. How long is its side?',
      cubeHint: 'Count the little cubes along one side of one layer only.',
      cubeAria: 'A cube {side} on each side, with {n} little cubes.',
      howManyZeros: 'How many zeros does {name} carry?',
      zerosHint: 'They are all written out. Count them.',
      zerosAria: 'A one followed by {n} zeros.',
      shortForm: 'How is this number written short?',
      shortHint: 'The small number above says how many zeros it carries.',
      powerAria: 'ten to the {n}',
      exactSide: 'The side of the square. Is it a whole number of little squares?',
      exactDiagonal: 'The line from corner to corner. Is it a whole number of little squares?',
      exactHint: 'Look at whether the line ends exactly on a corner of the grid.',
      sideAria: 'The side of a square of {n} little squares.',
      diagonalAria: 'The diagonal of a square of {n} little squares.',
      isMultiple: 'Is {n} a multiple of {base}?',
      whichMultiple: 'Which of these numbers is a multiple of {base}?',
      multipleHint: 'If the last row comes out full, it works exactly.',
      rowsAria: '{n} dots put in rows of {base}.',
      divides: 'Can {n} be divided by {d} with nothing left over?',
      isPrime: 'Is {n} a prime number?',
      inRowsOf: 'In rows of {t}:',
      primeHint: 'If none of the three comes out full, the number is prime.',
      triesAria: 'The number {n} tried in rows of 2, of 3 and of 5.',
      meetEvery: 'One thing happens every {a} and another every {b}. How often do they meet?',
      meetHint: 'The star marks the first time they meet.',
      cyclesAria: 'Two timelines: one marks every {a} and the other every {b}.',
      biggestChunk: 'You have two lengths: {a} and {b}. What is the biggest chunk that fits exactly into both?',
      chunkHint: 'It has to fit exactly into both, and be the biggest one that does.',
      barsAria: 'Two bars: one of {a} and one of {b}.',
      squareOf: 'How many little squares are in a square {n} on each side?',
      squareHint: 'It is {n} rows of {n}.',
      squareAria: 'A square of {n} rows of {n}.',
      rootOf: 'A square has {n} little squares. How long is its side?',
      rootHint: 'Count the little squares along one side only.',
      negativePower: 'You multiply the number minus {base} by itself {times} times. What do you get?',
      negativeHint: 'The minus signs go away two at a time. If one is left over, the answer ends up on the other side of zero.',
      negativeAria: 'Minus {base} multiplied {times} times, with its minus signs paired up.',
      rootIndex: 'You start at 1 and multiply by {base} until you reach {n}. How many times did you multiply?',
      chainHint: 'Count the ×{base} arrows, not the boxes.',
      chainAria: 'A chain that multiplies by {base} {times} times.'
    },
    transfer: 'This will help you share things out with none left over, know when two repeating things come round together again, and understand the numbers on labels and measurements.'
  }, 'en');
})();
