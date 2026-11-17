/* ============================================================
   Calculia — Numbers texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧮 Numbers',
    instructionMenu: 'Choose what you want to practise.',
    notaTablasLink: 'Math Tables',
    notaTablas: '🔢 To count, add and multiply, go to {link}.',
    btnMenu: 'Back to start',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} {starsWord}.',
    explicacionCorrecta: '✅ Correct! The answer is: ',
    explicacionIncorrectaA: '❌ Look: the correct answer is ',
    hint: '🤔 «{elegida}» is not the answer. Think calmly and look at the question again.',
    refuerzoTitulo: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    grupoEtq: { 0: '', 1: 'thousands', 2: 'millions', 3: 'billions', 4: 'trillions' },
    groupLabel: { 0: '', 1: 'thousands', 2: 'millions', 3: 'billions', 4: 'trillions' },
    leyendaUnidadesTxt: 'ones',
    leyendaDecenasTxt: 'tens',
    leyendaCentenasTxt: 'hundreds',
    /* Place names read by the 'bloques' question (aria label of the blocks). */
    unidadSingular: 'one',
    unidadPlural: 'ones',
    decenaSingular: 'ten',
    decenaPlural: 'tens',
    centenaSingular: 'hundred',
    centenaPlural: 'hundreds',

    activity: {
      unidades: { name: 'Ones, tens, hundreds', detail: 'What number is it?', instruction: 'Each colour helps read the number. Blue: ones. Green: tens. Purple: hundreds.' },
      comparar: { name: 'Greater, smaller or equal', detail: 'The signs <, > and =.', instruction: 'Look at the two numbers. The sign opens towards the bigger number. If both are the same, the sign is =.' }
    },
    /* Exposition + real-life screens for the sub-activities that don't
       have their own custom lesson. Each activity gets a brief theoretical
       slide (expo.*) followed by everyday examples (real.*), with a
       "Next" button linking them and from there to the practice. */
    expo: {
      comparar: {
        title: 'Greater, smaller or equal',
        intro: 'To know which number is greater, look at the digits. Start from the left.',
        bullets: [
          'If the first digit is already greater, that number is greater.',
          'If the digits are the same, look at the next one.',
          'If all digits are the same, the two numbers are equal.'
        ],
        note: 'The sign opens towards the greater number: the open side is greater.'
      },
      unidades: {
        slides: [
          {
            title: 'Ones',
            intro: 'Ones are the digit furthest to the right. They count single things.',
            bullets: [
              'Ones: 1, 2, 3… up to 9.',
              'In the number 7 there are 7 ones.'
            ],
            note: 'Blue: ones.'
          },
          {
            title: 'Tens',
            intro: 'Tens are to the left of the ones. One ten is 10 ones put together.',
            bullets: [
              '1 ten = 10 ones.',
              'In the number 40 there are 4 tens and 0 ones.'
            ],
            note: 'Green: tens.'
          },
          {
            title: 'Hundreds',
            intro: 'Hundreds are to the left of the tens. One hundred is 10 tens: 100.',
            bullets: [
              '1 hundred = 10 tens = 100.',
              'In the number 300 there are 3 hundreds.'
            ],
            note: 'Purple: hundreds.'
          },
          {
            title: 'Thousands',
            intro: 'The fourth digit from the right is the thousands. One thousand is 10 hundreds: 1,000.',
            bullets: [
              '1 thousand = 10 hundreds = 1,000.',
              'In the number 4,000 there are 4 thousands.'
            ],
            note: 'Large numbers are split into groups of three digits with a comma.'
          },
          {
            title: 'Ten thousands',
            intro: 'One ten thousand is 10 thousands: 10,000. It is to the left of the thousands.',
            bullets: [
              '1 ten thousand = 10 thousands = 10,000.',
              'In the number 50,000 there are 5 ten thousands.'
            ]
          },
          {
            title: 'Hundred thousands',
            intro: 'One hundred thousand is 10 ten thousands: 100,000. It is to the left of the ten thousands.',
            bullets: [
              '1 hundred thousand = 10 ten thousands = 100,000.',
              'In the number 300,000 there are 3 hundred thousands.'
            ]
          },
          {
            title: 'All the places',
            intro: 'Each digit is worth something depending on its place. This is how to read 345,678.',
            bullets: [
              '3 hundred thousands = 300,000',
              '4 ten thousands = 40,000',
              '5 thousands = 5,000',
              '6 hundreds = 600',
              '7 tens = 70',
              '8 ones = 8'
            ],
            note: 'Each place is worth 10 times less than the place on its left.'
          }
        ]
      },
    },
    real: {
      comparar: {
        title: 'Comparing is everywhere',
        items: [
          { icon: '🎒', text: 'Who has more cards in their backpack?' },
          { icon: '🍎', text: 'Which bag is heavier at the shop?' },
          { icon: '📅', text: 'Who was born first and who was born later?' },
          { icon: '💰', text: 'Who has more money in the piggy bank?' }
        ]
      },
      unidades: {
        title: 'Place values in your day',
        items: [
          { icon: '🥚', text: 'A box of eggs has 12 ones (= 1 dozen).' },
          { icon: '👟', text: 'Shoe sizes are numbers of ones.' },
          { icon: '💶', text: '100 cents = 1 €. 10 cents = one tenth of a euro.' },
          { icon: '⏱️', text: '60 minutes = 1 hour. 60 seconds = 1 minute.' },
          { icon: '🏘️', text: 'A village of 4,000 people has 4 thousands.' },
          { icon: '🚗', text: 'A new car costs €12,000: 1 ten thousand and 2 thousands.' },
          { icon: '🏟️', text: 'A stadium with 50,000 seats has 5 ten thousands.' },
          { icon: '🏠', text: 'A house that costs €150,000: 1 hundred thousand and 5 ten thousands.' }
        ]
      },
    },
    expoNext: 'See real-life examples →',
    expoSlideNext: 'Next →',
    expoBack: '← Previous',
    expoProgress: '{n} / {total}',
    realBack: '← Back to the explanation',
    realNext: 'Start practising →',
    level: {          
      n1: 'Up to 10',
      n2: 'Up to 20',
      n3: 'Up to 100',
      n4: 'Up to 100, fewer marks',
      c1: 'Up to 9, with blocks',
      c2: 'Up to 99, with blocks',
      c3: 'Up to 99, no blocks',
      c4: 'Up to 999',
      c5: 'Up to 9,999',
      o1: 'Queue of 3',
      o2: 'Queue of 5',
      o3: 'Find a place',
      u99: 'Up to 99',
      u999: 'Up to 999',
      umiles: 'Thousands',
      umillones: 'Millions and trillion',
      udictado: 'Listen and choose',
      counter: 'Free counter',

           },
    gen: {
      compareYou: 'You wrote',
      compareRight: 'Correct',
      compareEmpty: '(nothing)',
      compararEnunciado: 'Which sign is missing?',
      compararPista: 'The sign opens towards the bigger number.',
      compararAria: 'Compare {a} and {b}.',
      signLess: 'is smaller than',
      signGreater: 'is bigger than',
      signEqual: 'is equal to',
      bloquesEnunciado: 'What number do the blocks make?',
      bloquesVisualAria: 'Blocks: {texto}',
      counterHint: 'Tap to add or subtract. Watch how the digits and the groups (ones, tens, hundreds, thousands…) change.',
      counterAudioAria: 'Read the number aloud',
      counterResetLabel: '🔄 Start at 0',
      counterExitLabel: '✅ Exit',
      counterSepOn: ',1,234',
      counterSepOff: '1234',
      counterGroupsOn: '🎨 Colour groups: on',
      counterGroupsOff: '🎨 Colour groups: off',
      counterGroupsAria: 'Colour every 3-digit group',
      counterWordsOn: '✍️ Hide number in words',
      counterWordsOff: '✍️ Show number in words',
      counterWordsAria: 'Show the number written in words',
      /* The line that shows up when an answer is wrong. One per question
         type, and each one says what to look at in the picture or the
         number in front of you: the single old sentence ("Try again.
         Think calmly.") was the same for all of them. They give the
         strategy, never the answer. */
      socraticCompare: '🤔 «{elegida}» is not the sign. Compare the biggest places of both numbers first: they decide which way the sign opens.',
      socraticBlocks: '🤔 «{elegida}» does not match the blocks. Count the blocks in each group, then put the totals together.',
      /* Interactive "escribir números" — typed-input practice with
         audio. "Generar" plays the number aloud, "Reproducir"
         replays it, "Comprobar" validates, "Ver resultado" reveals. */
      escribirInputPrompt: 'Listen to the number and write it down.',
      escribirInputGenerate: '🎲 Generate number',
      escribirInputReplay: '🔊 Replay',
      escribirInputCheck: '✅ Check',
      escribirInputReveal: '👁 Show result',
      escribirInputIdleHint: 'Press «Generate» to hear the number.',
      escribirInputNoAudio: 'Audio is not available in this browser — the number will be revealed when you tap «Show result».',
      /* Interactive "leer números" — typed-input practice. The number
         is generated on demand, shown in words; the user types the
         numeric form. "Comprobar" validates, "Ver resultado" reveals. */
      lecturaInputPrompt: 'Read the number and write it down.',
      lecturaInputGenerate: '🎲 Generate number',
      lecturaInputCheck: '✅ Check',
      lecturaInputReveal: '👁 Show result',
      lecturaInputIdleHint: 'Press «Generate» to start.'
    },
    transfer: 'This will help you read large numbers or know which digit changes when you add 100.',

    /* Feedback for the interactive "leer números" practice. The
       success / reveal messages live at the root so app.js can
       look them up the same way it does for explicacionCorrecta. */
    lecturaInputCorrect: '✅ Correct! The number is {n}.',
    lecturaInputRevealed: '👁 The answer is {n}. You can correct it in the box.',

    /* Feedback for the interactive "escribir números" practice.
       Same shape as lecturaInputCorrect / lecturaInputRevealed. */
    escribirInputCorrect: '✅ Correct! The number is {n}.',
    escribirInputRevealed: '👁 The answer is {n}. You can correct it in the box.',

    /* Solution shown on a wrong answer in "read" and "write numbers".
       A number is not solved with a hint: it shows how it is written
       and the person writes it again after pressing "Got it". */
    /* Same message, with what the person wrote shown before the
       solution so they can compare the two numbers. With nothing
       written, typedSolution is used. */
    typedSolutionMine: '👀 You wrote: {typed}. This is how it is written: {n}. It is read: {words}. Write it yourself in the box.',
    typedSolution: '👀 This is how it is written: {n}. It is read: {words}. Write it yourself in the box.'
}, 'en');
})();
