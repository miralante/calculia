/* ============================================================
   Calculia — The balance texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'series.*' names what each graph measures and 'trend.*' the three
   things a line can do: app.js looks them up by the id data.js uses.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⚖️ The balance',
    instructionMenu: 'Choose an activity.',
    contexto: 'A balance has to stay level. A letter is the name of a number you do not know yet. And a graph tells you whether something is going up or down.',
    explicacion: '✅ There is nothing to rearrange here and no rules to learn. Only look at what is missing so both pans weigh the same.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the picture calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    trend: {
      up: 'It goes up',
      down: 'It goes down',
      same: 'It stays the same'
    },
    series: {
      temperature: 'the temperature',
      people: 'the people coming in',
      battery: 'the phone battery',
      rain: 'the rain'
    },
    activity: {
      dosBalanzas: { name: 'Two balances', detail: 'Two things at once.', instruction: 'When there are two things you do not know, you need two balances: one is not enough. Look for the pair of weights that makes both come out right. And if a balance is tilted, the side that goes down is the heavier one.' },
      cuadrado: { name: 'The square', detail: 'If x times x is this much...', instruction: 'If you multiply a number by itself you get a square of little squares. We give you the little squares and you look for the side: that is undoing the square.' },
      crecer: { name: 'How it grows', detail: 'The same or more each time.', instruction: 'Something can grow by the same each time (in twos, in fives) or faster and faster. Above the bars is written how much it climbs each time: if all the jumps are the same, it grows by the same each time.' },
      balanza: { name: 'The balance', detail: 'How much does the bag weigh?', instruction: 'Both pans of the balance weigh the same. Each weight is 1 kilo. The bag weighs something you do not know: look at what is missing on its side so both weigh the same.' },
      letras: { name: 'Letters', detail: 'A number you do not know.', instruction: 'When you do not know a number, it gets a letter, almost always x. If they later tell you what x is worth, you can work the rest out. And 3x means three times x.' },
      piezas: { name: 'The pieces', detail: 'Writing and building.', instruction: 'There are three pieces. The big one is a square and its side is x long. The strip is x long and 1 wide. The little one is a 1. A pile of pieces can be written down, and the pieces can be built into squares and rectangles.' },
      graficas: { name: 'Graphs', detail: 'Whether it goes up or down.', instruction: 'A graph draws how something changes through the hours. If the bars grow, it goes up. If they shrink, it goes down. If they are the same, it stays the same.' }
    },
    level: {
      s1: 'The pair that fits',
      s2: 'Which side is heavier?',
      q1: 'If x times x is this much',
      c1: 'How does it grow?',
      c2: 'Find the one that climbs the same',
      b1: 'One bag and weights',
      b2: 'Several equal bags',
      b3: 'Weights on both sides',
      l1: 'If x is worth...',
      l2: 'How it is written',
      g1: 'Up or down?',
      t1: 'How is the pile written?',
      t2: 'The side of the square',
      t3: 'The missing side',
      g2: 'When is it highest?'
    },
    grow: {
      same: 'The same each time',
      faster: 'More each time'
    },
    gen: {
      system: 'How much does each one weigh?',
      systemHint: 'The pair has to come out right on both balances, not just one.',
      systemAria: 'Two balances: together they weigh {total}, and one weighs {diff} more than the other.',
      andAlso: 'and also',
      pairLabel: 'the bag {bag} and the box {box}',
      whichHeavier: 'This balance is tilted. Which side is heavier?',
      tiltHint: 'The side that goes down is the heavier one.',
      tiltAria: 'A balance with {left} weights on one side and {right} on the other.',
      sideLeft: 'The left one',
      sideRight: 'The right one',
      squareEquation: 'A number times itself makes {n}. Which number is it?',
      squareEqHint: 'Count the little squares along one side of the square only.',
      squareEqAria: 'A square of {n} little squares, {side} on each side.',
      howItGrows: 'How does it grow?',
      growthHint: 'Look at the jumps written above. If they are all the same, it grows by the same each time.',
      growthAria: 'A graph of {n} bars with the jump written between each two.',
      pickStraight: 'Which of the three climbs by the same each time?',
      howMuchBag: 'How much does the bag weigh?',
      howMuchEachBag: 'The {bags} bags all weigh the same. How much does each one weigh?',
      simpleHint: 'Take off the right side the weights that are already on the left.',
      manyHint: 'Share the weights between the {bags} bags.',
      bothHint: 'Take the same weights off both sides. The bag is left on its own.',
      balanceAria: 'A balance with a bag and {left} weights on one side, and {right} weights on the other.',
      manyAria: 'A balance with {bags} bags on one side and {total} weights on the other.',
      kilo: ' kg',
      substitute: 'If x is worth {x}, how much is {times}x?',
      substituteHint: '{times}x means {times} times x.',
      substituteAria: 'The expression {times}x, with x worth {x}.',
      writeIt: 'How do you write "{times} times x"?',
      writeItHint: 'The number goes in front of the letter, with no sign between them.',
      writeItAria: '{times} equal bags.',
      upOrDown: 'Between {a} and {b}, what does {what} do?',
      trendHint: 'Compare the two bars that are marked.',
      graphAria: 'A bar graph of {what} hour by hour.',
      whenHighest: 'At what time is {what} highest?',
      highestHint: 'Find the tallest bar and look at its hour.',
      readTiles: 'How is this pile of pieces written down?',
      tilesHint: 'Count each kind of piece on its own. The big one is x squared, the strip is x and the little one is 1.',
      squareSide: 'A square has been built out of these pieces. How long is its side?',
      squareSideHint: 'Look along one whole side: first the big piece, which is x long, then the little ones after it.',
      otherSide: 'This rectangle is x tall. How long is it?',
      otherSideHint: 'Go along the length: the big piece is x long, and each strip after it adds 1.',
      ariaSq: '{n} big squares with side x',
      ariaStr: '{n} strips x long',
      ariaOne: '{n} little squares of 1',
      ariaSide: 'x plus {n}',
      ariaTwoX: 'two times x',
      ariaTimesX: '{n} times x',
      hour: 'at {h}'
    },
    transfer: 'This will help you understand a graph in the newspaper or on your phone, and realise that a letter in a sum is just a number nobody has told you yet, and see that those sums with letters are pieces that can be built up and taken apart.'
  }, 'en');
})();
