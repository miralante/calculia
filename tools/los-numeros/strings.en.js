/* ============================================================
   Calculia — Numbers texts (EN)
   Gallery of 10 slides (5 types + 2 comparisons). Minimum
   text: just the title and, on the type slides, a single
   line of "real life". The visual is the lesson.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    slideNaturalesTitle: 'Natural',
    slideNaturalesReal: '3 apples · 5 fingers · 10 years',
    slideEnterosTitle: 'Integers',
    slideEnterosReal: '−5 °C · basement −1 · 3 floors',
    slideFraccionesTitle: 'Fractions',
    slideFraccionesReal: '1/2 pizza · 1/4 hour',
    slideDecimalesTitle: 'Decimals',
    slideDecimalesReal: '$1.99 · 1.5 m · 3.14',

    /* Characteristics of each type: shown on the exposition card,
       under the drawing. Each trait is separated by « · ». */
    slideNaturalesTraits: 'Never negative · No decimals',
    slideEnterosTraits: 'They can be negative · Zero separates negative from positive numbers · No decimals',
    slideFraccionesTraits: 'They are a part of something divided into equal parts · Written like this: 3/4 · Top: the parts you have · Bottom: how many equal parts the whole is divided into',
    slideDecimalesTraits: 'They have a decimal point (.) · What comes after the point is less than 1',
    traitsEyebrow: 'Its characteristics:',
    slideVsEnterosTitle: 'Natural and Integers',
    slideVsDecimalesTitle: 'Natural and Decimals',
    title: 'Number Types',
    titleH1: '🔢 Number Types',

    galleryIntro: 'Look and flip the cards.',
    slideCount: '{i} of {n}',

    /* ---- Type slides: title + real life ----
       Each number type is taught in two consecutive cards:
       one for exposition (visual) and one for real life
       (everyday examples). The real-life string can hold several
       examples split by « · »; the JS splits them into a list. */
    /* Labels inside the fractions pizza SVG. */
    fraccionOneHalf: '1/2',

    /* Eyebrow shown above the list of real-life examples. */
    realEyebrow: 'In real life:',

    /* ---- Comparison slides: title only ---- */

    /* ---- End ---- */
    finish: 'Finish →',
    endTitle: 'You are done!',
    endSummary: 'You have looked at the four kinds of numbers. You now have {stars} {starsWord}.',
    btnMenu: 'Back to start',
    transfer: 'This will help you know what kind of number you have in front of you: in a bill, in a price, in a recipe or in a thermometer.'
  }, 'en');
})();
