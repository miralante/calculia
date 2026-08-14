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
    otherLevel: 'Choose another level',
    resumenFinal: 'You solved {n} questions of {actividad}. You now have {stars} stars.',
    endSummary: 'You solved {n} questions of {actividad}. You now have {stars} stars.',
    btnHarder: 'Want to try «{nombre}»?',
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
      restar: { name: 'Subtract', detail: 'Take away and count what is left.', instruction: 'Subtracting is taking away. Count the dots that do not have a cross.' },
      cabeza: { name: 'Mental math', detail: 'Calculate without paper.', instruction: 'Think of the result in your head. Look at the digit that changes.' }
    },
    level: { r10: 'Subtract up to 10', r20: 'Subtract up to 20', k1: 'Doubles', k2: 'Add 10', k3: 'Add 100', k4: 'Add 1,000', k5: 'Subtract 10', k6: 'Subtract 100', k7: 'Subtract 1,000', k8: 'Multiply by 10', k9: 'Multiply by 100' },
    gen: {
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
      pistaCentenas: 'Only the purple digit changes: the hundreds.',
      hundredsHint: 'Only the purple digit changes: the hundreds.',
      pistaMiles: 'Only the thousands digit changes.',
      thousandsHint: 'Only the thousands digit changes.',
      sumaGrandeEnunciado: 'How much is {n} + {suma}?',
      bigAddPrompt: 'How much is {n} + {suma}?',
      restaGrandeEnunciado: 'How much is {n} − {resta}?',
      bigSubtractPrompt: 'How much is {n} − {resta}?',
      multiplicaGrandeEnunciado: 'How much is {n} × {factor}?',
      bigMultiplyPrompt: 'How much is {n} × {factor}?',
      multiplicaGrandePista: 'Add {ceros} at the end of {n}.',
      bigMultiplyHint: 'Add {ceros} at the end of {n}.',
      oneZero: 'one zero',
      twoZeros: 'two zeros'
    },
    transferencia: 'This helps you know how much you have left, how much is missing or calculate a large amount without a calculator.',
    transfer: 'This helps you know how much you have left, how much is missing or calculate a large amount without a calculator.'
  }, 'en');
})();
