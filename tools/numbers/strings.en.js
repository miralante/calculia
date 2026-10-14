/* ============================================================
   Calculia — Numbers texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧮 Numbers',
    instructionMenu: 'Maths for daily life. Choose an activity.',
    contexto: 'You are at a shop or at home. You see prices, floor numbers, change, measures and ages. Numbers help you decide.',
    explicacion: '✅ Numbers are not just for class: with them you can calculate change, know how much fruit weighs, understand a size or measure time.',
    noteTables: '🔢 For counting, adding and multiplying, open {link}.',
    notaTablasLink: 'Math Tables',
    noteTablesLink: 'Math Tables',
    notaTablas: '🔢 To count, add and multiply, go to {link}.',
    noteTables: '🔢 To count, add and multiply, go to {link}.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    explicacionCorrecta: '✅ Correct! The answer is: ',
    correctExplanation: '✅ Correct! The answer is: ',
    explicacionIncorrectaA: '❌ Look: the correct answer is ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    pista: '🤔 Try again. Think calmly.',
    hint: '🤔 Try again. Think calmly.',
    refuerzoTitulo: 'Reinforcement',
    reinforceTitle: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    grupoEtq: { 0: '', 1: 'thousands', 2: 'millions', 3: 'thousands of millions', 4: 'trillions' },
    groupLabel: { 0: '', 1: 'thousands', 2: 'millions', 3: 'thousands of millions', 4: 'trillions' },
    leyendaUnidadesTxt: 'ones',
    legendUnitsTxt: 'ones',
    leyendaDecenasTxt: 'tens',
    legendTensTxt: 'tens',
    leyendaCentenasTxt: 'hundreds',
    legendHundredsTxt: 'hundreds',

    hundredSingular: 'hundred',
    hundredPlural: 'hundreds',
    tenSingular: 'ten',
    tenPlural: 'tens',
    unitSingular: 'one',
    unitPlural: 'ones',
    activity: {
      'positivos-y-negativos': { name: 'Positives and negatives', detail: 'Learn the signs with a thermometer and an elevator.', instruction: 'Numbers can be above or below zero. Look at the examples and practise with the thermometer and the elevator.' },
      unidades: { name: 'Ones and tens', detail: 'What number is it?', instruction: 'Each colour helps read the number. Blue: ones. Green: tens. Purple: hundreds.' },
      placevalue: { name: 'Changing position', detail: '10 small ones become 1 big one.', instruction: 'When you put 10 of the same together, they form 1 of the next group. The digit moves one position to the left.' },
      comparar: { name: 'Greater, smaller or equal', detail: 'The signs <, > and =.', instruction: 'Look at the two numbers. The sign opens towards the bigger number. If both are the same, the sign is =.' }
    },
    signed: {
      introInstruction: 'First, we will learn what positive and negative numbers mean.',
      theoryTitle: 'Positive and negative numbers',
      theoryIntro: 'Numbers can be above or below zero.',
      rulePositive: 'Positive numbers are greater than 0: +1, +2, +3…',
      ruleNegative: 'Negative numbers are less than 0: −1, −2, −3…',
      ruleZero: '0 is not positive or negative. It is the starting point.',
      numberlineAria: 'Number line from minus three to plus three. Zero is in the middle.',
      introNext: 'See real-life examples →',
      realIntro: 'Now we will see signed numbers in everyday situations.',
      realTitle: 'Signed numbers in daily life',
      realBack: '← Back to the explanation',
      realNext: '👉 Practise with the thermometer →',
      real: {
        termometro: {
          title: 'The thermometer',
          text: 'Below 0 °C it is cold. −5 °C is five degrees below zero. At 0 °C, water starts to freeze.'
        },
        ascensor: {
          title: 'The elevator',
          text: 'The basement can be floor −1. The ground floor is 0. Floors above can be +1, +2…'
        },
        cuentas: {
          title: 'Money',
          text: 'A debt can be written as a negative number: −€20. A positive balance can be written as a positive number: +€20.'
        }
      },
      tempHint: 'Press +1 or −1 to move the thermometer. See whether the temperature is above or below 0.',
      tempStepDown: 'Go down one degree',
      tempStepUp: 'Go up one degree',
      tempReset: 'Start again',
      tempGoals: {
        negative: 'Go below 0 °C.',
        positive: 'Go above 0 °C.',
        zero: 'Land exactly on 0 °C.'
      },
      tempReadout: 'Temperature: {value} degrees Celsius',
      sign: {
        positive: 'Positive number',
        negative: 'Negative number',
        zero: 'Zero'
      },
      tempSuccess: '✅ Goal reached!',
      tempNext: 'Next challenge →',
      endSummary: 'You practised positive and negative numbers. You now have {stars} stars.'
    },
    /* Exposition + real-life screens for the 3 sub-activities that don't
       have their own custom lesson (positivos-y-negativos uses the
       dedicated signed.* flow). Each activity gets a brief theoretical
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
        title: 'Ones, tens and hundreds',
        intro: 'Each digit has a value based on its place. The rightmost digit is ones; the next is tens; the next is hundreds.',
        bullets: [
          'Ones: 1, 2, 3…',
          'Tens: 10, 20, 30…',
          'Hundreds: 100, 200, 300…',
          'In the number 345: 3 hundreds + 4 tens + 5 ones.'
        ],
        note: 'Each colour signals a value: blue (ones), green (tens), purple (hundreds).'
      },
      placevalue: {
        title: 'Trading places',
        intro: '10 ones make 1 ten. 10 tens make 1 hundred. 10 hundreds make 1 thousand. And so on.',
        bullets: [
          '10 × 1 = 1 ten (10)',
          '10 × 10 = 1 hundred (100)',
          '10 × 100 = 1 thousand (1,000)'
        ],
        note: 'Multiplying by 10 moves the digit one place to the left and adds a zero.'
      }
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
        title: 'Ones, tens and hundreds in your day',
        items: [
          { icon: '🥚', text: 'A box of eggs has 12 ones (= 1 dozen).' },
          { icon: '👟', text: 'Shoe sizes are numbers of ones.' },
          { icon: '💶', text: '100 cents = 1 €. 10 cents = one tenth of a euro.' },
          { icon: '⏱️', text: '60 minutes = 1 hour. 60 seconds = 1 minute.' }
        ]
      },
      placevalue: {
        title: 'Trading 10s in your daily life',
        items: [
          { icon: '🥚', text: '10 loose eggs make 1 dozen.' },
          { icon: '✏️', text: '10 loose pencils make 1 pack.' },
          { icon: '💶', text: '10 coins of 10 cents = 1 euro.' },
          { icon: '⏱️', text: '10 years = 1 decade. 10 decades = 1 century (100 years).' }
        ]
      }
    },
    expoNext: 'See real-life examples →',
    expoBack: '← Back to menu',
    realBack: '← Back to the explanation',
    realNext: 'Start practising →',
    level: { c1: 'Up to 9, with blocks', c2: 'Up to 99, with blocks', c3: 'Up to 99, no blocks', c4: 'Up to 999', c5: 'Up to 9,999', libre: '🏢 Free elevator', meta: '🎯 Reach a floor', u99: 'Up to 99', u999: 'Up to 999', umiles: 'Thousands', umillones: 'Millions and trillion', udictado: 'Listen and choose', counter: 'Free counter', pv1: 'Ones to tens', pv2: 'Tens to hundreds', pv3: 'Hundreds to thousands', pv4: 'Ladder of 10: up to one million', pv5: 'Ladder of 10: up to one trillion' },
    gen: {
      compararEnunciado: 'Which sign is missing?',
      compararPista: 'The sign opens towards the bigger number.',
      compararAria: 'Compare {a} and {b}.',
      signLess: 'is smaller than',
      signGreater: 'is bigger than',
      signEqual: 'is equal to',
      bloquesEnunciado: 'What number do the blocks make?',
      bloquesVisualAria: 'Blocks: {texto}',
      blocksPrompt: 'What number do the blocks make?',
      blocksVisualAria: 'Blocks: {texto}',
      lecturaEnunciadoNumASim: 'How do you read this number?',
      lecturaEnunciadoSimANum: 'What number is it?',
      readingNumToWordPrompt: 'How do you read this number?',
      readingWordToNumPrompt: 'What number is it?',
      canjeDirecto0: 'With {n} ones, how many tens do you make?',
      canjeDirecto1: 'With {n} tens, how many hundreds do you make?',
      canjeDirecto2: 'With {n} hundreds, how many thousands do you make?',
      canjePista0: '10 ones make 1 ten.',
      canjePista1: '10 tens make 1 hundred.',
      canjePista2: '10 hundreds make 1 thousand: 1,000.',
      canjeAriaDirecto: '{k} groups of 10 blocks',
      canjeInverso0: '{k} tens. How many ones is that?',
      canjeInverso1: '{k} hundreds. How many tens is that?',
      canjeInverso2: '{k} thousands. How many hundreds is that?',
      canjeAriaInverso: '{k} big blocks',
      carryDirect0: 'With {n} ones, how many tens do you make?',
      carryDirect1: 'With {n} tens, how many hundreds do you make?',
      carryDirect2: 'With {n} hundreds, how many thousands do you make?',
      carryReverse0: '{k} tens. How many ones is that?',
      carryReverse1: '{k} hundreds. How many tens is that?',
      carryReverse2: '{k} thousands. How many hundreds is that?',
      carryHint0: '10 ones make 1 ten.',
      carryHint1: '10 tens make 1 hundred.',
      carryHint2: '10 hundreds make 1 thousand: 1,000.',
      carryAriaDirect: '{k} groups of 10 blocks',
      carryAriaReverse: '{k} big blocks',
      escaleraEnunciado: 'How much is 10 × this number?',
      escaleraPista: 'Times 10: each digit moves one place to the left and a zero is added.',
      ladderPrompt: 'How much is 10 × this number?',
      ladderHint: 'Times 10: each digit moves one place to the left and a zero is added.',
      dictadoEnunciado: 'Read the number. Then, tap it.',
      dictationPrompt: 'Read the number. Then, tap it.',
      counterHint: 'Tap to add or subtract. Watch how the digits and the groups (ones, tens, hundreds, thousands…) change.',
      counterAudioAria: 'Read the number aloud',
      counterResetLabel: '🔄 Start at 0',
      counterExitLabel: '✅ Exit',
      counterSepOn: ',1,234',
      counterSepOff: '1234',
      counterGroupsLabel: '🎨 Colour groups',
      counterGroupsOn: '🎨 Colour groups: on',
      counterGroupsOff: '🎨 Colour groups: off',
      counterGroupsAria: 'Colour every 3-digit group',
      counterWordsOn: '✍️ Hide number in words',
      counterWordsOff: '✍️ Show number in words',
      counterWordsAria: 'Show the number written in words',
      counterResumenFinal: 'You explored the free counter. You now have {stars} stars.',
      elevatorHint: 'Press + or − to move the elevator. Watch the floor change and whether it goes up or down.',
      elevatorHintLibre: 'Press + or − to move the elevator. Watch the floor change and whether it goes up or down.',
      elevatorHintMeta: 'Press + or − until you reach the target floor. You must land on the exact floor.',
      elevatorSuggestionUp: '💡 Suggestion: go up to floor {piso}.',
      elevatorSuggestionDown: '💡 Suggestion: go down to floor {piso}.',
      elevatorReadoutAria: 'The elevator is on floor {piso}',
      elevatorStateAbove: 'Upper floor (positive number)',
      elevatorStateBelow: 'Lower floor (negative number)',
      elevatorStateGround: 'Ground floor (zero)',
      elevatorGoalMeta: 'Goal: reach floor {piso}.',
      elevatorSuccess: '🏢 You reached floor {piso}!',
      elevatorBtnReset: '🔄 Start at 0',
      elevatorBtnAudio: 'Hear the floor',
      elevatorBtnExit: '✅ Exit',
      elevatorTtsFloor: 'Floor {piso}',
      elevatorTtsAbove: 'Upper floor.',
      elevatorTtsBelow: 'Lower floor.',
      elevatorTtsGround: 'Ground floor.',
      elevatorResumenFinal: 'You explored the elevator. You now have {stars} stars.',
      /* The line that shows up when an answer is wrong. One per question
         type, and each one says what to look at in the picture or the
         number in front of you: the single old sentence ("Try again.
         Think calmly.") was the same for all of them. They give the
         strategy, never the answer. */
      socraticCompare: '🤔 Look at the digits of both numbers and compare the biggest places first.',
      socraticBlocks: '🤔 Count the blocks in each group, then put the totals together.',
      socraticSayNumber: '🤔 Look at the number drawn and read it in parts, from left to right.',
      socraticWriteNumber: '🤔 Look at how it is written and see which groups of ten it is split into.',
      socraticTradeUp: '🤔 Look at the blocks and group them in tens: count the groups.',
      socraticTradeDown: '🤔 Look at each big block and count how many small ones fit inside.',
      socraticLadder: '🤔 Look at the number: it is a one followed by zeros, count how many.',
      socraticDictation: '🤔 Read the number drawn slowly and compare it with the options.'
    },
    transfer: 'This will help you read large numbers, understand the elevator of a building, or know which digit changes when you add 100.'
  }, 'en');
})();
