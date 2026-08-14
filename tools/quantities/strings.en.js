/* ============================================================
   Calculia — Quantities texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Quantities',
    instruction: 'Read and write numbers up to one billion.',
    choosePractice: 'Choose what you want to practise.',

    readName: 'Read numbers',
    readDetail: 'Look at the number and type it.',
    writeName: 'Write numbers',
    writeDetail: 'Listen to the number and type it.',
    pointsName: 'Add the commas',
    pointsDetail: 'Separate thousands with commas.',
    decomposeName: 'Break apart',
    decomposeDetail: 'Look at the colour of each digit.',

    /* {n} formatted, {nRaw} no separator, {placeLabel} digit position */
    promptRead: 'Type this number: {n}',
    promptWrite: 'Type the number you hear.',
    promptPoints: 'Type this number with commas: {nRaw}',
    promptDecompose: 'What is the {placeLabel} digit in {n}?',

    detailRead: 'Copy the digits. Add the comma every three, if needed.',
    detailWrite: 'Press 🔊 if you need to hear it again.',
    detailPoints: 'Count three digits from the right and add the comma.',
    detailDecompose: 'Look at the colour of each digit.',

    /* Failure reinforcement: after the round, failed exercises are
       replayed in a mini-round until every one is answered right.
       Stars already earned stay (rule 5: mistakes are never punished). */
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} exercises you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",

    hintRead: 'Count the digits. If there are four or more, group them in threes from the right.',
    hintWrite: 'Press � and write what you hear.',
    hintPoints: 'The comma goes every three digits, starting from the right.',
    hintDecompose: 'Look at the colour of the digit being asked.',

    /* Position labels (used in decompose) */
    posU: 'ones',
    posD: 'tens',
    posC: 'hundreds',
    posUM: 'thousands ones',
    posDM: 'thousands tens',
    posCM: 'thousands hundreds',
    posUMM: 'millions ones',
    posDMM: 'millions tens',
    posCMM: 'millions hundreds',
    posUMMM: 'billions ones',

    legendTitle: 'Colour by position:',

    check: 'Check',
    chooseAnother: 'Choose another practice',
    roundComplete: 'Round complete!',
    roundSummary: 'You solved {count} exercises. Now you have {stars} stars.',
    progress: '{current} of {total}',

    audioAria: 'Listen to the number',
    answerInputAria: 'Type the number',
    answerOptionsAria: 'Answer options',

    correctFormat: 'It is written: {n}',

    transfer: 'This will help you read prices, news headlines or any large number in daily life.',

    hint: '🤔 Read the number aloud and then write it.',
    transferencia: 'This will help you read prices, news headlines or any large number in daily life.'
  }, 'en');
})();
