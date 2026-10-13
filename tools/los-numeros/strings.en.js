/* ============================================================
   Calculia — Numbers texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Numbers',
    titleH1: '🔢 Numbers',

    /* ---- Start screen ---- */
    instruction: 'Look at the number. Choose its type.',
    startButton: 'Start practising →',
    introTitle: 'There are four kinds of numbers',
    introIntro: 'Tap each card to see it in more detail.',
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
    introContinue: 'Start practising →',

    /* ---- Question and options ---- */
    askType: 'What kind of number is it?',
    btnMenu: 'Back to start',
    endSummary: 'You got {n} of {total} right. You now have {stars} stars.',

    /* ---- Hints and explanations (socratic) ----
       One hint per type of question. Each one says what to look at
       in the number on screen, not the answer. The generic hint
       stays as fallback. */
    pista: '🤔 Try again. Look calmly at the number.',
    pistaNatural: '🤔 Look at the number: is it whole, with no dot and no denominator? Does it sit in 0, 1, 2, 3…?',
    pistaEntero: '🤔 Look at the number: is it whole, with no dot, and a minus or plus sign?',
    pistaDecimal: '🤔 Look at the number: is there a dot separating a small part?',
    pistaFraccion: '🤔 Look at the number: is there a slash separating two quantities (numerator and denominator)?',

    explicacionCorrecta: '✅ Correct! It is a ',
    explicacionIncorrecta: '❌ Look: it is a ',

    /* ---- Names of each type (for the question and feedback) ---- */
    gen: {
      natural: 'natural number',
      entero: 'integer',
      decimal: 'decimal number',
      fraccion: 'fraction',
      naturalPlural: 'natural numbers',
      enteroPlural: 'integers',
      decimalPlural: 'decimal numbers',
      fraccionPlural: 'fractions',
      askType: 'What kind of number is it?',
      numberAria: 'Number {n}. Choose its type.',
      refuerzoTitulo: 'Reinforcement',
      refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right."
    },

    /* ---- Reinforcement and end ---- */
    refuerzoTitulo: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    transfer: 'This will help you recognise what kind of number you have in front of you in any operation: whether it is an integer, a decimal, a fraction…'
  }, 'en');
})();
