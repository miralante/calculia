/* ============================================================
   Calculia — Percentages and proportion texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'ingredient.<id>.a' and '.b' are the two ingredients of each recipe:
   app.js looks them up by the id data.js uses.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '💯 Percentages',
    instructionMenu: 'Choose an activity.',
    contexto: 'Per cent means "out of a hundred". Percentages are in the sales, on labels and in the news.',
    explicacion: '✅ A percentage can be counted: you just look at how many of the hundred little squares are coloured in.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Count calmly what is coloured in.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    ingredient: {
      flourSugar: { a: 'flour', b: 'sugar' },
      riceWater: { a: 'rice', b: 'water' },
      juiceWater: { a: 'oranges', b: 'water' },
      milkCocoa: { a: 'milk', b: 'cocoa' },
      paintWhite: { a: 'blue paint', b: 'white paint' }
    },
    /* The name of each thing that is bought and each job that is shared
       out: app.js looks them up by the id data.js uses. */
    item: {
      ticket: 'tickets',
      notebook: 'notebooks',
      sandwich: 'sandwiches',
      pencil: 'pencils',
      ball: 'balls',
      juice: 'juices',
      cap: 'caps',
      book: 'books'
    },
    job: {
      boxes: 'stacking the boxes',
      paint: 'painting the wall',
      clean: 'cleaning the place',
      garden: 'tidying the garden',
      load: 'loading the lorry',
      fold: 'folding the clothes'
    },
    activity: {
      porcentaje: { name: 'What percentage is it?', detail: 'Out of a hundred.', instruction: 'A percentage says how many there are out of every hundred. The grid has 100 little squares: count the coloured ones and you have the percentage. If 30 are coloured, it is 30 per cent.' },
      dinero: { name: 'Sales', detail: 'How much it is and what is left.', instruction: '50 per cent is half. 25 per cent is a quarter. 10 per cent is one coin out of every ten. With the coins in front of you it can be counted.' },
      proporcion: { name: 'For every so much', detail: 'Recipes that grow.', instruction: 'In a recipe, if you put in twice as much of one thing you have to put in twice as much of the other. If not, it does not taste the same. Look at the servings drawn. Some things go the other way: if there are more of you on the same job, it takes less time.' },
      limite: { name: 'What my money reaches', detail: 'How many I can buy.', instruction: 'You have some money and each thing has its price. Take the price of one off at a time. When what is left no longer reaches for another one, that is the number. And what is left is what you have over.' },
      escala: { name: 'Plans', detail: 'One square is worth metres.', instruction: 'On a plan everything is smaller than it really is. Each square of the plan is worth some real metres: if each one is 2 metres and there are 3 squares, that is 6 metres.' }
    },
    level: {
      p1: 'In tens',
      p2: 'In fives',
      p3: 'Find the grid',
      r1: 'How much is the discount?',
      r2: 'How much is left to pay?',
      r3: 'How much with the rise?',
      o1: 'Twice as much',
      o2: 'Three times as much',
      o3: 'The other way: more people, less time',
      l1: 'How many can I buy?',
      l2: 'How much have I got left?',
      e1: 'From the plan to the metres'
    },
    gen: {
      whatPercent: 'What percentage is coloured in?',
      percentHint: 'The grid has 100 little squares. Count the coloured ones.',
      gridAria: 'A grid of a hundred with {n} little squares coloured in.',
      whichGrid: 'In which grid is {n} per cent coloured in?',
      howMuchPart: 'Something costs {price} euros. You get {percent} per cent off. How much is the discount?',
      afterDiscount: 'Something costs {price} euros. You get {percent} per cent off. How much do you pay in the end?',
      afterRise: 'You have {price} euros saved. You are given {percent} per cent more. How much do you have in the end?',
      moneyHint: 'The marked coins are the part the percentage takes.',
      coinsAria: '{total} coins, {part} of them marked.',
      euro: ' €',
      ratioPrompt: 'For every {a} of {first} you put in {b} of {second}. If you put in {many} of {first}, how much {second} do you need?',
      ratioHint: 'Count the second thing across all the servings drawn.',
      servingsAria: '{times} servings of {a} and {b}.',
      inversePrompt: '{from} people take {hours} hours {job}. How many hours will {to} people take?',
      inverseHint: 'The job is the same: the same blocks, shared into {to} rows.',
      workAria: '{people} rows, one per person, of {hours} hours each.',
      howManyFit: 'You have {budget} euros. Each of those {thing} costs {price} euros. How many can you buy?',
      fitHint: 'Take the price of one off at a time, until it no longer reaches.',
      whatIsLeft: 'You have {budget} euros. Each of those {thing} costs {price} euros. You buy as many as you can. How much money have you got left?',
      leftHint: 'What is left is never enough for one more.',
      budgetAria: '{budget} euro coins, and below them the price of one: {price} coins.',
      scalePrompt: 'On the plan it takes up {n} squares. How long is it really?',
      scaleKey: 'Each square of the plan is {unit} real metres.',
      scaleHint: 'Count the squares and look at what each one is worth.',
      planAria: 'A plan of {n} squares, each one {unit} metres.',
      metre: ' m'
    },
    transfer: 'This will help you understand the sales in a shop, know how much you are really getting off, read a plan or a map, and know how many things the money you are carrying reaches for.'
  }, 'en');
})();
