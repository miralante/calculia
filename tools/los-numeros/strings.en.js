/* ============================================================
   Calculia — Numbers texts (EN)
   This activity has NO test. It is a presentation walk-through:
   4 type cards + 3 comparisons + 4 real-life examples.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Numbers',
    titleH1: '🔢 Numbers',

    /* ---- Screen 1: four types ---- */
    introIntro: 'Tap each card to see it in more detail.',
    introTitle: 'There are four kinds of numbers',
    introNaturalTitle: 'Natural',
    introNaturalBody: 'They count what there is. They start at 0 and go up: 0, 1, 2, 3, 4, 5…',
    introNaturalExamples: 'Examples: 0 · 1 · 5 · 12 · 100 · 1,000',
    introEnteroTitle: 'Integers',
    introEnteroBody: 'Like naturals, but they also go below 0: …−3, −2, −1, 0, 1, 2…',
    introEnteroExamples: 'Examples: −5 · −1 · 0 · 3 · −12',
    introDecimalTitle: 'Decimals',
    introDecimalBody: 'They have a small part after the dot: 0.5 is "zero and five tenths".',
    introDecimalExamples: 'Examples: 0.5 · 1.25 · 3.14 · 2.7',
    introFraccionTitle: 'Fractions',
    introFraccionBody: 'A part of a whole. They are written with a numerator and a denominator: 1/2 is "one of two parts".',
    introFraccionExamples: 'Examples: 1/2 · 3/4 · 2/5 · 7/8',
    introContinue: 'See the comparisons →',

    /* ---- Screen 2: comparisons (carousel) ---- */
    slidesIntro: 'See how each kind relates to the natural numbers.',
    slideNaturalesEnterosTitle: 'Natural and Integers',
    slideNaturalesEnterosBody: 'Naturals are what you use to count (0, 1, 2, 3, 4…). Integers add the negative ones, those below 0 (−1, −2, −3…). Every natural is also an integer, but not the other way around.',
    slideNaturalesDecimalesTitle: 'Natural and Decimals',
    slideNaturalesDecimalesBody: 'Naturals go up one at a time: 1, 2, 3… Decimals add a small part: 1.5 is "one and a half". You use them for measures, weights and prices.',
    slideNaturalesFraccionesTitle: 'Natural and Fractions',
    slideNaturalesFraccionesBody: 'Naturals count whole units: 1, 2, 3 pizzas. Fractions count parts of a unit: 1/4 of a pizza, 1/2 a loaf of bread.',
    slidesContinue: 'See them in real life →',

    /* Visual legends */
    legendNaturales: 'Naturals',
    legendEnteros: 'Integers (the ones below 0)',
    legendDecimales: 'Decimals (between two naturals)',
    legendFracciones: 'Fractions (1 part of 4)',
    pizzaEntero: '1 pizza',
    pizzaCuarto: '1/4 of a pizza',

    /* ---- Screen 3: real life ---- */
    realIntro: 'Each kind shows up in daily life. Look at the examples.',
    realContinue: 'Finish →',
    realNaturalTitle: 'Naturals in real life',
    realNaturalIcon: 'Things you count whole: apples, fingers, books, years.',
    realNaturalExamples: '3 apples · 5 fingers · 10 classmates · 100 years',
    realEnteroTitle: 'Integers in real life',
    realEnteroIcon: 'Things that go up and down from 0: the thermometer, the elevator, the bills.',
    realEnteroExamples: '−5 °C below zero · basement −1 · 3 floors up · −20 € debt',
    realDecimalTitle: 'Decimals in real life',
    realDecimalIcon: 'Prices, measures and weights: almost everything you measure has decimals.',
    realDecimalExamples: '$1.99 · 1.5 m tall · 0.75 kg of fruit · 3.14 (Pi)',
    realFraccionTitle: 'Fractions in real life',
    realFraccionIcon: 'Parts of something: pizza, recipes, hours.',
    realFraccionExamples: '1/2 pizza · 1/4 hour (15 min) · 3/4 of a cup · 1/3 of a chocolate bar',

    /* ---- End screen ---- */
    endTitle: 'You are done!',
    endSummary: 'You have looked at the four kinds of numbers. You now have {stars} stars.',
    btnRepeat: 'See it again',
    btnMenu: 'Back to start',
    transfer: 'This will help you know what kind of number you have in front of you: in a bill, in a price, in a recipe or in a thermometer.'
  }, 'en');
})();
