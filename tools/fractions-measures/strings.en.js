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
      decimales: { name: 'Decimals', detail: 'Numbers with a point.', instruction: 'A decimal number has a point. Before the point are the whole units. After the point are the parts. If the pie has 10 parts, each part is 0.1. Half a pie is 0.5. You see this on prices (1.50 €) and on measures (0.5 litres).' },
      coma: { name: 'Put the decimal point', detail: 'Place the decimal point between the whole part and the decimals.', instruction: 'Tap a gap to put the point. Count the digits from the right: the point goes after the whole part.' }
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
      decimalHintParts: 'Look at how much is painted: half, a quarter or three quarters.',
      /* The hint that comes out when an answer is wrong. One per kind of
         question, and each one says what to look at or do with what is on
         screen: the single sentence it replaced ("Try again…") was the
         same for every question, so it said nothing. These never give the
         answer away — they give the strategy, which is what separates a
         Socratic hint from a spoiler. */
      socraticMixFrac: '🤔 Look at the two circles and keep only the slices of the same size.',
      socraticFracOf: '🤔 Look at the marked group and count only the pictures inside it.',
      socraticMixedOp: '🤔 Both numbers are in tenths: look at the pies.',
      socraticFracVsDecimal: '🤔 Count the painted slices in each pie, not the numbers.',
      socraticDecimalOp: '🤔 Count the slices in each pie and see how much they make.',
      socraticFracciones: '🤔 Count how many parts are painted and how many parts the pie has in total. The top number is the painted part; the bottom one is the total.',
      socraticComparaFrac: '🤔 Compare the two pies and see which one has more painted.',
      socraticEquivalentes: '🤔 Compare how much is painted in the two figures, part by part.',
      socraticSumaFrac: '🤔 Both pies are cut into the same number of slices.',
      socraticDecimalToPicture: '🤔 Look for the pie with exactly that amount painted.',
      socraticDecimalToNumber: '🤔 Look at how much of the pie is painted and give it its number.'
    },
    intro: {
      fracciones: {
        instruction: 'Before you play, look at how a fraction is read.',
        title: 'What a fraction is',
        text: 'A fraction tells you which part of something you take. It is written with two numbers, one above the other.',
        parts: 'This pie has 4 equal parts. Three are painted: that is three quarters.',
        notation: 'The top number counts the painted parts. The bottom number counts all the parts.',
        size: 'The more parts there are, the smaller each one is. A half is bigger than a quarter.',
        toReal: 'See it in real life →',
        prev: 'Previous',
        next: 'Next'
      },
      decimales: {
        instruction: 'Before you play, look at how a decimal is written.',
        title: 'What a decimal number is',
        text: 'A decimal is another way of writing a part. It has a point: what comes before it are whole units, and what comes after are parts.',
        whole: 'The whole part is what comes before the point: whole units. In 3.47 it is the 3.',
        decimal: 'The decimal part is what comes after the point: parts of one unit. In 3.47 it is 4 tenths and 7 hundredths.',
        tenths: 'A pie has 10 equal parts. Each part is 0.1. Three parts are 0.3.',
        point: 'The point separates the whole units from the parts. The 0 is the whole units and the 3 is tenths.',
        half: '0.5 is half of the pie. 0.25 is a quarter.',
        toReal: 'See it in real life →',
        prev: 'Previous',
        next: 'Next'
      }
    },
    real: {
      fracciones: {
        title: 'Fractions are all around us.',
        pizza: 'A pizza has 4 slices. If you eat 1, you eat a quarter: 1/4.',
        clock: 'A quarter of an hour is 15 minutes. Half an hour is 30 minutes.',
        money: 'Half of 10 € is 5 €.',
        bottle: 'A one-litre bottle filled to half has half a litre: 1/2.',
        continue: 'Start practising →',
        prev: 'Previous',
        next: 'Next'
      },
      decimales: {
        title: 'Decimals are all around us.',
        height: 'A person is 1.75 m tall: 1 whole metre and 0.75 m of the decimal part.',
        coins: 'A jar holds 3.47 €: 3 whole euros and 47 cents, which is 0.47 €.',
        price: 'A loaf of bread costs 1.50 €. That is one euro and fifty cents.',
        milk: 'Half a litre of milk is 0.5 litres.',
        ribbon: 'A ribbon of 2.5 metres is two and a half metres.',
        candy: 'A sweet costs 0.20 €. That is twenty cents.',
        continue: 'Start practising →',
        prev: 'Previous',
        next: 'Next'
      }
    },
    /* Put the decimal point (activity 'coma'). {count} = decimal digits of
       the number; {k} = digits to the right of the point placed. */
    coma: {
      boardAria: 'Number to place the decimal point in',
      gapEmptyAria: 'Empty gap: drag the decimal point here or tap the gap.',
      gapFilledAria: 'Decimal point: drag it to another gap. Tap to remove it.',
      check: 'Check',
      promptDecimal: 'Put the decimal point in this number. It has {count} decimal digits.',
      promptDecimalOne: 'Put the decimal point in this number. It has 1 decimal digit.',
      detailDecimal: 'Drag the point to the gap where it goes. Tap the point to remove it.',
      missing: 'You have not placed the decimal point yet.',
      wrongHint: 'Move the point {moves} {direction}.',
      oneGap: 'one gap',
      manyGaps: '{n} gaps',
      moveLeft: 'to the left',
      moveRight: 'to the right',
      correctFormat: 'It is written: {n}',
      roundProgress: '{current} of {total}',
      reinforceTitle: 'Extra practice',
      reinforceIntro: 'Let us repeat the {n} exercises you got wrong until you get them all right.'
    },
    transfer: 'This will help you share something in equal parts, understand half an hour or read a price with a point.'
  }, 'en');
})();
