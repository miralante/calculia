/* ============================================================
   Calculia — Problems texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   Each problem has two keys, looked up by the id in data.js:
   - 'problem.<id>': the wording, with {a} and {b} in the gaps.
   - 'ask.<id>': the closing question, naming what is counted.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🤔 Problems',
    instructionMenu: 'Choose an activity.',
    contexto: 'A problem is a situation told in words. First you understand what happens. Then you work it out.',
    explicacion: '✅ The important part of a problem is not the sum: it is noticing what needs doing.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Read the problem slowly and look at the picture.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    op: {
      add: 'add',
      sub: 'take away'
    },
    activity: {
      operacion: { name: 'What needs doing?', detail: 'Add or take away.', instruction: 'Read the problem and decide what needs doing. If things come together, you add. If things leave or are taken away, you take away. Here you do not have to work anything out.' },
      dosPasos: { name: 'Two steps', detail: 'Two things happen in a row.', instruction: 'Here two things happen, one after the other. Do it in parts: first what happens at the start, then the second thing. The easy mistake is forgetting the second step and answering halfway through.' },
      resultado: { name: 'How many?', detail: 'Solve the problem.', instruction: 'Read the problem and say how many there are. You have the picture in front of you: you can count. What is crossed out has already gone.' }
    },
    level: {
      o1: 'With a clue word',
      o2: 'Without a clue word',
      t1: 'Both the same way',
      t2: 'One each way',
      r1: 'Adding problems',
      r2: 'Taking-away problems',
      r3: 'Adding and taking away'
    },
    gen: {
      whatToDo: 'What needs doing?',
      twoStepHint: 'There are two steps. What is crossed out is gone.',
      ariaTwoStep: 'A group of {total} things with {gone} crossed out.',
      countHint: 'You can count the pictures. What is crossed out is gone.',
      ariaAdd: 'A group of {a} and another group of {b}.',
      ariaSub: 'A group of {a} things with {b} crossed out.'
    },
    problem: {
      garden: 'There are {a} flowers in the garden. You plant {b} more flowers. Then you plant {c} more.',
      stickers2: 'You have {a} stickers. You win {b} stickers. Then you win {c} more.',
      socks: 'There are {a} socks in the drawer. You take out {b} socks. Then you take out {c} more.',
      basket: 'There are {a} apples in the basket. You take {b} apples. Then you take {c} more.',
      bus: 'There are {a} people on the bus. {b} people get on. Then {c} people get off.',
      plate: 'There are {a} biscuits on the plate. You put {b} more biscuits on it. Then you eat {c}.',
      shelf: 'There are {a} books on the shelf. You put {b} more books on it. Then you lend {c}.',
      pond: 'There are {a} fish in the pond. You add {b} more fish. Then {c} are taken away.',
      purse: 'You have {a} coins in your purse. You put in {b} more coins. Then you pay with {c}.',
      case: 'There are {a} pencils in the case. You take out {b} pencils. Then you put {c} pencils in.',
      apples: 'You have {a} apples. You are given {b} more apples.',
      stickers: 'You have {a} stickers. You win {b} more stickers.',
      chairs: 'There are {a} chairs at the table. You bring {b} more chairs.',
      coins: 'You have {a} coins. You find {b} more coins.',
      books: 'There are {a} books on the shelf. You put {b} more books on it.',
      birds: 'There are {a} birds in the tree. {b} birds fly away.',
      cookies: 'There are {a} biscuits on the plate. You eat {b} biscuits.',
      balloons: 'You have {a} balloons. {b} balloons float away.',
      pencils: 'You have {a} pencils. You lend {b} pencils.',
      oranges: 'There are {a} oranges in the bag. You take out {b} oranges.',
      busStop: 'At one stop {a} people are waiting. At the other stop {b} people are waiting.',
      twoPlates: 'On one plate there are {a} eggs. On the other plate there are {b} eggs.',
      bothBoxes: 'In one box there are {a} socks. In the other box there are {b} socks.',
      howManyLeft: 'You buy {a} sweets. You hand out {b} sweets.',
      howManyMore: 'Ana has {a} fish. Luis has {b} fish.',
      missing: 'The puzzle has {a} pieces. You have already put in {b} pieces.'
    },
    ask: {
      garden: 'How many flowers are there now?',
      stickers2: 'How many stickers do you have now?',
      socks: 'How many socks are left in the drawer?',
      basket: 'How many apples are left in the basket?',
      bus: 'How many people are on the bus now?',
      plate: 'How many biscuits are left on the plate?',
      shelf: 'How many books are left on the shelf?',
      pond: 'How many fish are in the pond now?',
      purse: 'How many coins are left in your purse?',
      case: 'How many pencils are in the case now?',
      apples: 'How many apples do you have now?',
      stickers: 'How many stickers do you have now?',
      chairs: 'How many chairs are there now?',
      coins: 'How many coins do you have now?',
      books: 'How many books are there now?',
      birds: 'How many birds are left in the tree?',
      cookies: 'How many biscuits are left on the plate?',
      balloons: 'How many balloons do you have left?',
      pencils: 'How many pencils do you have left?',
      oranges: 'How many oranges are left in the bag?',
      busStop: 'How many people are waiting at the two stops together?',
      twoPlates: 'How many eggs are there on the two plates together?',
      bothBoxes: 'How many socks are there in the two boxes together?',
      howManyLeft: 'How many sweets do you have left?',
      howManyMore: 'How many more fish does Ana have than Luis?',
      missing: 'How many pieces do you still have to put in?'
    },
    transfer: 'This will help you understand what you are told before doing the sum: when shopping, when sharing something out, or when checking how much you have left.'
  }, 'en');
})();
