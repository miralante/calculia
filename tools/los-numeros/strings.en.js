/* ============================================================
   Calculia — Numbers texts (EN)
   Gallery of 7 slides (4 types + 3 comparisons). Minimum
   text: just the title and, on the type slides, a single
   line of "real life". The visual is the lesson.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Numbers',
    titleH1: '🔢 Numbers',

    galleryIntro: 'Look and flip the cards.',

    /* ---- Type slides: title + real life ---- */
    slideNaturalesTitle: 'Natural',
    slideNaturalesReal: '🧮 3 apples · 5 fingers · 10 years',
    slideEnterosTitle: 'Integers',
    slideEnterosReal: '🌡️ −5 °C · basement −1 · 3 floors',
    slideDecimalesTitle: 'Decimals',
    slideDecimalesReal: '💰 $1.99 · 1.5 m · 3.14',
    slideFraccionesTitle: 'Fractions',
    slideFraccionesReal: '🍕 1/2 pizza · 1/4 hour',

    /* ---- Comparison slides: title only ---- */
    slideVsEnterosTitle: 'Natural and Integers',
    slideVsDecimalesTitle: 'Natural and Decimals',
    slideVsFraccionesTitle: 'Natural and Fractions',

    /* Label inside the pizza SVG. */
    fraccionOneHalf: '1/2',
    fraccionOneFourth: '1/4',

    /* ---- End ---- */
    finish: 'Finish →',
    endTitle: 'You are done!',
    endSummary: 'You have looked at the four kinds of numbers. You now have {stars} stars.',
    btnRepeat: 'See it again',
    btnMenu: 'Back to start',
    transfer: 'This will help you know what kind of number you have in front of you: in a bill, in a price, in a recipe or in a thermometer.'
  }, 'en');
})();
