/* ============================================================
   Calculia — Numbers texts (EN)
   Gallery of 10 slides (5 types + 2 comparisons). Minimum
   text: just the title and, on the type slides, a single
   line of "real life". The visual is the lesson.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Number Types',
    titleH1: '🔢 Number Types',

    galleryIntro: 'Look and flip the cards.',

    /* ---- Type slides: title + real life ----
       Each number type is taught in two consecutive cards:
       one for exposition (visual) and one for real life
       (everyday examples). The real-life string can hold several
       examples split by « · »; the JS splits them into a list. */
    slideNaturalesTitle: 'Natural',
    slideNaturalesReal: '🧮 3 apples · 5 fingers · 10 years',
    slideEnterosTitle: 'Integers',
    slideEnterosReal: '🌡️ −5 °C · basement −1 · 3 floors',
    slideFraccionesTitle: 'Fractions',
    slideFraccionesReal: '🍕 1/2 pizza · 1/4 hour',
    slideDecimalesTitle: 'Decimals',
    slideDecimalesReal: '💰 $1.99 · 1.5 m · 3.14',
    /* Labels inside the fractions pizza SVG. */
    fraccionOneHalf: '1/2',
    fraccionOneFourth: '1/4',

    /* Eyebrow shown above the list of real-life examples. */
    realEyebrow: 'In real life:',

    /* ---- Comparison slides: title only ---- */
    slideVsEnterosTitle: 'Natural and Integers',
    slideVsDecimalesTitle: 'Natural and Decimals',

    /* ---- End ---- */
    finish: 'Finish →',
    endTitle: 'You are done!',
    endSummary: 'You have looked at the four kinds of numbers. You now have {stars} stars.',
    btnRepeat: 'See it again',
    btnMenu: 'Back to start',
    transfer: 'This will help you know what kind of number you have in front of you: in a bill, in a price, in a recipe or in a thermometer.'
  }, 'en');
})();
