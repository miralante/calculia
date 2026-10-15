/* ============================================================
   Calculia — Quantities: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces
   the parity). In English the thousands separator is the comma,
   so the points game places commas. The "groups" practice moved
   to Mental Math in 2026-10; the "parity" practice moved to
   tools/parity/ on the same date.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Read and Write Numbers',
    instruction: 'Read and write big numbers.',
    choosePractice: 'Choose what you want to practise.',
    btnMenu: 'Back to the start',

    /* ---------- Practice menu ----------
       Keys '<id>Name' / '<id>Detail': one entry per entry in
       DATA.practices. */
    readName: 'Read numbers',
    readDetail: 'Look at the number and write it.',
    writeName: 'Write numbers',
    writeDetail: 'Listen to the number and write it.',
    pointsName: 'Put the commas',
    pointsDetail: 'Place the commas. From thousands to billions.',

    /* ---------- Reading and writing practices ----------
       {n} = formatted number. */
    promptRead: 'Write this number: {n}',
    promptWrite: 'Write the number you hear.',

    detailRead: 'Copy the digits. Add the comma every three, if needed.',
    detailWrite: 'Press 🔊 if you need to hear it again.',

    /* ---------- Commas game ----------
       {count} = commas still to place in this number.
       {n} = how many commas are left in the tray. */
    promptPoints: 'Put {count} commas in this number.',
    promptPointsOne: 'Put 1 comma in this number.',
    detailPoints: 'Tap a gap to put a comma. Tap a comma to remove it.',
    pointsLeft: 'Commas left to place: {n}',
    pointsMissing: 'Some commas are still to be placed.',
    pointsNoneLeft: 'There are no commas left. Tap a placed comma to remove it.',
    pointsWrongMarked: 'Check the commas marked with ✗.',
    gapEmptyAria: 'Empty gap: tap to put a comma.',
    gapFilledAria: 'Comma: tap to remove it.',
    pointsBoardAria: 'Number to place the commas in',

    /* Socratic hints: they teach the mechanic, they never give the
       answer away (see SPEC: full socratic anatomy). */
    hintRead: 'Count the digits. If there are four or more, group them in threes from the right.',
    hintWrite: 'Press 🔊 and write what you hear.',
    hintPoints: 'Count the digits in threes, from the right. Between one group and the next there is a comma.',

    /* Reinforcement: after the round, the missed exercises are
       replayed in a mini-round. Stars already earned are kept. */
    reinforceTitle: 'Extra practice',
    reinforceIntro: 'Let us repeat the {n} exercises you got wrong until you get them all right.',

    check: 'Check',
    chooseAnother: 'Choose another practice',
    roundComplete: 'Round finished!',
    roundSummary: 'You solved {count} exercises. Now you have {stars} stars.',
    progress: '{current} of {stars}',
    correctFormat: 'It is written: {n}',

    answerInputAria: 'Write the number',

    /* Transfer: what this is for outside the screen. */
    contexto: 'You read numbers in the shop, in the lift, on money and in the news. Reading and writing big numbers is something you use every day.',
    explicacion: '✅ Reading and writing big numbers comes with practice: each digit sits in its place and the separator groups the thousands. You know the groups and you no longer have to count one by one.',
    transfer: 'This will help you read prices, news or any big number in daily life.'
  }, 'en');
})();
