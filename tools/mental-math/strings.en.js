/* ============================================================
   Calculia — Mental Math texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧠 Subtraction and Mental Math',
    instructionMenu: 'Choose an activity.',
    contexto: 'Someone asks you how much is left or how much something is, without using paper. Learn to subtract and calculate in your head with simple tricks.',
    explicacion: '✅ Subtracting and calculating in your head helps you not depend on a calculator all the time.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    explicacionCorrecta: '✅ Correct! The answer is: ',
    correctExplanation: '✅ Correct! The answer is: ',
    explicacionIncorrectaA: '❌ Look: the correct answer is ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    pista: '🤔 Try again. Think calmly.',
    hint: '🤔 Try again. Think calmly.',
    refuerzoTitulo: 'Reinforcement',
    reinforceTitle: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    leyendaUnidadesTxt: 'ones',
    legendUnitsTxt: 'ones',
    leyendaDecenasTxt: 'tens',
    legendTensTxt: 'tens',
    leyendaCentenasTxt: 'hundreds',
    legendHundredsTxt: 'hundreds',
    activity: {
      anchors: { name: 'Add and take away 1, 5 and 10', detail: 'Start with the easiest.', instruction: 'Look at the picture. A bar is 10. A loose dot is 1.' },
      restar: { name: 'Subtract', detail: 'Take away and count what is left.', instruction: 'Subtracting is taking away. Count the dots that do not have a cross.' },
      cabeza: { name: 'Mental math', detail: 'Calculate without paper.', instruction: 'Think of the result in your head. Look at the digit that changes.' },
      groups: { name: 'Count in groups', detail: 'Tens, hundreds, thousands and dozens.', instruction: 'Look at the group and say how many there are.' }
    },

    /* ============================================================
       The "groups" practice — the learning walkthrough
       Used to live in Quantities. Follows the roman-numerals method:
       carousel, real-life examples, colour reminder, chained steps.
       ============================================================ */

    /* Screen 1: what counting in groups is. */
    groupsIntroTitle: 'We count in groups',
    groupsIntroText: 'Counting one by one is very slow. So people count in groups.',
    groupsIntroNext: 'In real life →',
    groupsPrev: '←',
    groupsNext: '→',

    /* Screen 2: groups in real life. */
    groupsFamousTitle: 'A group from real life',
    groupsFamousSubtitle: 'Look at this example:',
    groupsBack: '← Back',
    groupsBackToExamples: '← Back to the examples',
    groupsContinue: 'Next →',

    /* Screen 3: the reminder. */
    groupsReminderTitle: 'Remember what each group is worth',
    groupsReminderText: 'Each group is always worth the same.',
    ruleMultiplyTitle: 'To know how many there are: count the groups and multiply.',
    ruleDozenTitle: 'Careful: a dozen is twelve, not ten.',
    groupsStart: 'Start practising →',

    /* Screen 4: the steps. */
    groupsChooseLevel: 'Choose a step.',
    groupsBackReminder: '← Back to the reminder',
    groupsBackLevels: '← Back to the steps',
    groupsChooseAnother: 'Choose another step',

    /* ---------- The groups ----------
       FLAT keys inside 'group': app.js builds them as
       'group.' + id + 'Name', so one more level of nesting would
       break resolution at runtime without check.js noticing. Per group:
       Name = singular ("a dozen"), Label = carries its {n}
       ("2 dozens"), Plural = bare plural ("dozens"), and
       Caption = one easy sentence about that group.
       Colour never travels alone: the name is always written. */
    group: {
      unitName: 'unit',
      unitLabel: '{n} units',
      unitPlural: 'units',
      unitCaption: 'One single thing. It is the smallest group.',

      tenName: 'ten',
      tenLabel: '{n} tens',
      tenPlural: 'tens',
      tenCaption: 'Ten things together. A ten is ten.',

      hundredName: 'hundred',
      hundredLabel: '{n} hundreds',
      hundredPlural: 'hundreds',
      hundredCaption: 'A hundred things. A hundred is one hundred.',

      thousandName: 'thousand',
      thousandLabel: '{n} thousands',
      thousandPlural: 'thousands',
      thousandCaption: 'A thousand things. A thousand is one thousand.',

      halfDozenName: 'half dozen',
      halfDozenLabel: '{n} half dozens',
      halfDozenPlural: 'half dozens',
      halfDozenCaption: 'Six things. It is half of a dozen.',

      dozenName: 'dozen',
      dozenLabel: '{n} dozens',
      dozenPlural: 'dozens',
      dozenCaption: 'Twelve things. Careful: a dozen is not ten.'
    },

    /* ---------- Real-life examples ----------
       Every sentence ends with ':' because app.js appends the
       coloured count after it ("dozen = 12"). If the sentence
       brought its own full stop, the two halves would fight over
       the punctuation. */
    famous: {
      huevos: 'At the market, eggs are sold by the dozen. A small box holds one:',
      medioHuevos: 'Half a box is six eggs. That is a half dozen:',
      dedos: 'Both hands together have ten fingers. That is a ten:',
      siglo: 'A century lasts one hundred years. A hundred is a hundred:',
      concierto: 'A big concert brings together a thousand people. A thousand is a thousand:'
    },

    /* ---------- Situations ----------
       Shown under the question as support, so the round is not
       abstract: "2 dozens" is a box of eggs, not a loose
       exercise. */
    scene: {
      huevos: 'It is a box of eggs from the market.',
      cajaMedia: 'It is half a box of eggs.',
      manos: 'They are the fingers of both hands.',
      siglo: 'It is the number of years a century lasts.',
      gradas: 'It is the number of people at a big concert.'
    },

    /* ---------- The steps ----------
       Flat too: app.js asks for 'level.' + id + 'Name' / 'Detail'. */
    level: {
      learnName: 'Learn the groups',
      learnDetail: 'Look at a group and say how many there are.',
      applyName: 'Use the groups',
      applyDetail: 'Read a big number and count in dozens.',
      testName: 'Everything',
      testDetail: 'A bit of everything, in no fixed order.'
    },
    levelDone: 'Done',
    starsCount: 'Difficulty {n}',
    stepLabel: 'Step {n} of {total} · {name}',
    chainNext: 'Next step: {name}',

    /* ---------- The game ---------- */
    qHowMany: 'How many things are there?',
    qWhichGroup: 'Which group is it counted in?',
    qDigitValue: 'What is the {digit} in the {plural} worth?',

    groupsCorrect: '✅ That is how you count it.',
    groupsFinal: 'You got {n} of {total} right. Now you have {stars} stars.',
    groupsHintPrefix: '💡 ',
    groupsWrongPrefix: 'The answer is: ',

    hintDigitValue: 'Look at the colour of the digit. Each colour is a group.',
    hintWhichGroup: 'Think about how many groups fit in that number. Look at the colours.',
    hintDozen: 'Remember: a dozen is twelve.',
    hintHowMany: 'Count the groups. Then multiply by what each group is worth.',

    groupsTransfer: 'Counting in groups helps you with eggs, boxes, money and big numbers.',
    level: { a1: 'Add 1', a2: 'Take away 1', a3: 'Add 10', a4: 'Take away 10', a5: 'Add 5', a6: 'Take away 5', a7: 'Join tens and units', a8: 'Take the units off', a9: 'Add and make a new ten', a10: 'Subtract by breaking a ten', r10: 'Subtract up to 10', r20: 'Subtract up to 20', k1: 'Doubles', k2: 'Add 10', k3: 'Add 100', k4: 'Add 1,000', k5: 'Subtract 10', k6: 'Subtract 100', k7: 'Subtract 1,000', k8: 'Multiply by 10', k9: 'Multiply by 100' },
    gen: {
      anchorAddPrompt: 'How much is {a} + {step}?',
      anchorSubtractPrompt: 'How much is {a} − {step}?',
      anchorHintOne: 'Adding 1 is the next number. Taking away 1 is the one before.',
      anchorHintFive: '5 is half a bar. Count the dots in fives.',
      anchorHintTen: 'A whole bar is 10. Only the tens change.',
      placeValueAddPrompt: 'How much is {a} + {b}?',
      placeValueAddHint: 'Put the bars and the loose dots together. The tens do not change.',
      placeValueSubtractPrompt: 'How much is {a} − {b}?',
      placeValueSubtractHint: 'Take the loose dots away. Only the bars are left.',
      carryAddPrompt: 'How much is {a} + {b}?',
      carryAddHint: 'Count the loose dots. If they reach 10, they form a new bar.',
      borrowSubtractPrompt: 'How much is {a} − {b}?',
      borrowSubtractHint: "There aren't enough loose dots. Break a bar into 10 dots and take away {b}.",
      restarEnunciado: 'How much is {a} − {b}?',
      subtractPrompt: 'How much is {a} − {b}?',
      restarPista: 'Take {b} away. Count the dots that are left.',
      subtractHint: 'Take {b} away. Count the dots that are left.',
      doblesEnunciado: 'How much is {a} + {a}?',
      doublesPrompt: 'How much is {a} + {a}?',
      doblesPista: 'The two numbers are the same. It is a double.',
      doublesHint: 'The two numbers are the same. It is a double.',
      pistaDecenas: 'Only the green digit changes: the tens.',
      tensHint: 'Only the green digit changes: the tens.',
      hintDecenas: 'Only the green digit changes: the tens.',
      pistaCentenas: 'Only the purple digit changes: the hundreds.',
      hundredsHint: 'Only the purple digit changes: the hundreds.',
      hintCentenas: 'Only the purple digit changes: the hundreds.',
      pistaMiles: 'Only the thousands digit changes.',
      thousandsHint: 'Only the thousands digit changes.',
      hintMiles: 'Only the thousands digit changes.',
      sumaGrandeEnunciado: 'How much is {n} + {suma}?',
      bigAddPrompt: 'How much is {n} + {suma}?',
      restaGrandeEnunciado: 'How much is {n} − {resta}?',
      bigSubtractPrompt: 'How much is {n} − {resta}?',
      multiplicaGrandeEnunciado: 'How much is {n} × {factor}?',
      bigMultiplyPrompt: 'How much is {n} × {factor}?',
      multiplicaGrandePista: 'Add {ceros} at the end of {n}.',
      bigMultiplyHint: 'Add {ceros} at the end of {n}.',
      oneZero: 'one zero',
      twoZeros: 'two zeros',
      /* Socratic hint: one per question type. The generic line
         ("Try again…") was the same for all of them, so it said nothing.
         These say what to look at in the picture or the sum for this
         question and never give the answer away. */
      socraticAnchor: '🤔 Look at the bar of ten dots and count how many move.',
      socraticPlaceAdd: '🤔 Look at the bar of tens: the loose dots join it at the end.',
      socraticPlaceSub: '🤔 Look at the loose units that go: the dots left make the ten.',
      socraticCarry: '🤔 Count the loose dots: when they make ten, they become a new bar.',
      socraticBorrow: '🤔 Look at the bar broken into ten loose dots: that is where the rest comes from.',
      socraticRestar: '🤔 Look at the group crossed out: what is left is the answer.',
      socraticDoubles: '🤔 The two groups are the same: put them together and count both.',
      socraticSumLarge: '🤔 Look at the purple digit: it is the only one that changes when you add.',
      socraticSubtractLarge: '🤔 Look at the purple digit: it is the only one that drops when you subtract.',
      socraticMultiplyLarge: '🤔 Look at the purple digit: multiplying only changes it and the zeros.'
    },
    transfer: 'This helps you know how much you have left, how much is missing or calculate a large amount without a calculator.'
  }, 'en');
})();
