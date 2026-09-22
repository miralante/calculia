/* ============================================================
   Calculia — Fractions texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🍕 Fractions',
    instructionMenu: 'Choose an activity.',
    contexto: 'You share a pizza, cut a cake or split something between several people. Parts are everywhere.',
    explicacion: '✅ Fractions and decimals help you share fairly and understand halves, quarters and prices.',
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
    leyendaPartesPintadasTxt: 'painted parts',
    legendPaintedPartsTxt: 'painted parts',
    leyendaPartesTotalTxt: 'parts in total',
    legendTotalPartsTxt: 'parts in total',
    activity: {
      fracciones: { name: 'Fractions', detail: 'Parts of something.', instruction: 'A fraction is a part of something. Look at the painted parts of the figure.' },
      decimales: { name: 'Decimals', detail: 'Numbers with a point.', instruction: 'A decimal number has a point. Before the point are the whole units. After the point are the parts. If the pie has 10 parts, each part is 0.1. Half a pie is 0.5. You see this on prices (1.50 €) and on measures (0.5 litres).' }
    },
    level: { f1: 'Halves and quarters', f2: 'Thirds and sixths', f3: 'Which is bigger?', f4: 'Worth the same', f5: 'Add fractions', f6: 'Subtract fractions', d1: 'From pie to number', d2: 'From number to pie', d3: 'Halves and quarters' ,       f7: 'Adding different slices',
      f8: 'Taking away different slices',
      f9: 'A part of an amount',
      d4: 'Adding decimals',
      d5: 'Taking away decimals',
      d6: 'Fraction plus decimal',
      d7: 'Fraction minus decimal',
      d8: 'Which is more?'
},
    part: {
      '2': 'half',
      '3': 'a third',
      '4': 'a quarter'
    },
    thing: {
      sweets: 'sweets',
      apples: 'apples',
      coins: 'coins',
      pencils: 'pencils'
    },
    gen: {
      mixFracAdd: 'How much do they come to? The slices are not the same size.',
      mixFracSub: 'How much is left? The slices are not the same size.',
      mixFracHint: 'Cut the big slices so they are all {den}ths.',
      mixFracAria: '{na} out of {da} and {nb} out of {db}.',
      fracOfPrompt: 'You have {total} {thing}. You take {part}. How many do you take?',
      fracOfHint: 'They are shared into {den} equal piles. Count one.',
      fracOfAria: '{den} piles of {each} things, with one marked.',
      decimalAdd: 'How much is {a} plus {b}?',
      decimalSub: 'How much is {a} minus {b}?',
      decimalOpHint: 'Each slice of the pie is 0.1. Count the slices.',
      decimalOpAria: '{a} and {b} drawn on pies of ten slices.',
      mixedAdd: 'How much is {a} plus {b}?',
      mixedSub: 'How much is {a} minus {b}?',
      mixedOpHint: 'One is written as a fraction and the other as a decimal, but both are slices of pie. Count the slices.',
      mixedOpAria: 'One pie with {a} and another with {b}.',
      whichIsMore: 'Which is more?',
      mixedCompareHint: 'One is written as a fraction and the other as a decimal. Look at how much pie is coloured in each one.',
      fraccionesEnunciado: 'Which part is painted?',
      fractionsPrompt: 'Which part is painted?',
      fraccionesVisualAria: 'Figure with {den} parts. {num} are painted.',
      fractionVisualAria: 'Figure with {den} parts. {num} are painted.',
      fraccionAria: '{num} of {den} parts',
      fractionAria: '{num} of {den} parts',
      comparaFracEnunciado: 'Where is the bigger part painted?',
      compareFractionPrompt: 'Where is the bigger part painted?',
      equivalentesEnunciado: 'Which one is worth the same?',
      equivalentesPista: 'Look for the figure with the same amount painted.',
      sumaFracEnunciado: 'How much do the two parts add up to?',
      restaFracEnunciado: 'How much is left after taking away?',
      sumaFracPista: 'The parts are the same size. The bottom number does not change.',
      sumaFracAria: '{x} of {den} plus {y} of {den}.',
      restaFracAria: '{x} of {den} minus {y} of {den}.',
      decimalToNumberPrompt: 'Which decimal number is painted?',
      decimalToPicturePrompt: 'Which pie is this number worth?',
      decimalHintTenths: 'The pie has 10 parts. Each part is 0.1.',
      decimalHintParts: 'Look at how much is painted: half, a quarter or three quarters.'
    },
    transfer: 'This will help you share something in equal parts, understand half an hour or read a price with a point.'
  }, 'en');
})();
