/* ============================================================
   Calculia — Quantities: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces
   the parity). The "groups" practice moved to Mental Math in
   2026-10; the "parity" practice moved to tools/parity/ on the
   same date.
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
    pointsName: 'Put the points',
    pointsDetail: 'Separate the thousands with points.',

    /* ---------- Typing practices ----------
       {n} = formatted number. {nRaw} = number without separator. */
    promptRead: 'Write this number: {n}',
    promptWrite: 'Write the number you hear.',
    promptPoints: 'Write this number with its points: {nRaw}',

    detailRead: 'Copy the digits. Add the point every three, if needed.',
    detailWrite: 'Press 🔊 if you need to hear it again.',
    detailPoints: 'Count three digits from the right and put the point.',

    /* Socratic hints: they teach the mechanic, they never give the
       answer away (see SPEC: full socratic anatomy). */
    hintRead: 'Count the digits. If there are four or more, group them in threes from the right.',
    hintWrite: 'Press 🔊 and write what you hear.',
    hintPoints: 'The point goes every three digits, starting from the right.',

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
