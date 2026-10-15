/* ============================================================
   Calculia — Decimal point: texts (EN)
   Locale-specific file. Loaded from index.html.

   Mirrors strings.es.js key for key (scripts/check.js enforces the
   parity). In English the decimal separator is the point, so the
   game places a point.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Put the decimal point',
    instruction: 'Put the point in its place.',
    menuTitle: 'Put the decimal point in its place.',
    menuDetail: 'You start with numbers that have one decimal digit. Each round goes up a little.',
    btnStart: 'Start',
    btnMenu: 'Back to the start',
    check: 'Check',

    /* {count} = decimal digits of the number. */
    promptDecimal: 'Put the decimal point in this number. It has {count} decimal digits.',
    promptDecimalOne: 'Put the decimal point in this number. It has 1 decimal digit.',
    detailDecimal: 'Tap a gap to put the point. Tap another gap to move it, or the point to remove it.',

    boardAria: 'Number to place the decimal point in',
    gapEmptyAria: 'Empty gap: tap to put the decimal point.',
    gapFilledAria: 'Decimal point: tap to remove it or move it to another gap.',

    missing: 'You have not placed the decimal point yet.',
    /* {k} = digits left to the right of the point placed. */
    wrongMarked: 'Check the point marked with ✗.',
    wrongHint: 'There are {k} digits to the right of this point. Count how many decimal digits the number has.',

    roundComplete: 'Round finished!',
    roundSummary: 'You solved {count} exercises. Now you have {stars} stars.',
    roundProgress: '{current} of {total}',
    correctFormat: 'It is written: {n}',

    /* Reinforcement: after the round, the missed exercises are
       replayed in a mini-round. Stars already earned are kept. */
    reinforceTitle: 'Extra practice',
    reinforceIntro: 'Let us repeat the {n} exercises you got wrong until you get them all right.',

    /* Transfer: what this is for outside the screen. */
    contexto: 'The decimal point shows up in prices, measures and money: $1.50 or 2.5 kg.',
    explicacion: '✅ The decimal point separates the whole part from the decimals. If you count the digits from the right, you always know where it goes.',
    transfer: 'This will help you read prices, measures and money in daily life.'
  }, 'en');
})();
