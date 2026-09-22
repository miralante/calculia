/* ============================================================
   Calculia — Big sums texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   The numbers are NOT here: they live once in data.js, and the results
   are worked out in app.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Big sums',
    instructionMenu: 'Choose an activity.',
    contexto: 'A big sum is not a hard sum: it is a small sum done twice.',
    explicacion: '✅ There is no new sum to learn here. Only how to cut one into parts you already know.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the picture and count calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    activity: {
      consigno: { name: 'With a sign', detail: 'When negatives turn up.', instruction: 'When there are negative numbers there is no rule to learn. Find on the line where you start and walk the steps you are told: to the right if you go up and to the left if you go down. Where you land is the answer.' },
      voltear: { name: 'Turn it round', detail: 'The order changes nothing.', instruction: 'In a multiplication the order does not matter: 3 times 4 and 4 times 3 are the same number of dots, arranged another way. If you know one, you already know the other.' },
      partir: { name: 'Cut the sum', detail: 'Two easy parts.', instruction: 'A hard multiplication is cut into two easy ones. 6 times 7 is 6 times 5 and 6 times 2. You do the two parts and put them together.' },
      repartir: { name: 'Share out', detail: 'How many each, how many groups.', instruction: 'Dividing is said in two ways. One: share between several and see how many each one gets. The other: make groups of a size and see how many groups come out.' },
      orden: { name: 'What comes first', detail: 'Times and brackets.', instruction: 'When there are two operations, the multiplication is done before the addition. But if there are brackets, what is inside the brackets goes first. Brackets are in charge.' }
    },
    level: {
      g1: 'Up from a negative',
      g2: 'Down into a negative',
      v1: 'Turn it round',
      d1: 'Cut at five',
      d2: 'Cut at the tens',
      r1: 'How many each one gets',
      r2: 'How many groups come out',
      o1: 'What is done first?',
      o2: 'How much is it?'
    },
    gen: {
      walkUp: 'You are at {from}. You go up {step}. Where do you land?',
      walkDown: 'You are at {from}. You go down {step}. Where do you land?',
      walkHint: 'Start where the pin is and count the steps along the line.',
      lineAria: 'A number line with {from} marked and a jump of {step}.',
      commute: 'If {first} = {total}, how much is {second}?',
      commuteHint: 'They are the same dots, turned round.',
      commuteAria: 'Two groups of dots: one of {a} rows of {b}, and one of {b} rows of {a}.',
      howMuch: 'How much is {op}?',
      splitHint: 'One part is {left} and the other is {right}. Put them together.',
      splitAria: 'A multiplication of {a} by {b}, cut into {a} by {cut} and {a} by {rest}.',
      splitTensAria: 'The number {a} cut into {tens} and {units}.',
      share: 'You share {total} between {groups}. How many does each one get?',
      shareHint: 'Count the dots in just one pile.',
      shareAria: '{groups} piles with {each} dots each.',
      groups: 'You have {total}. You make groups of {size}. How many groups come out?',
      groupsHint: 'Count the piles, not the dots.',
      groupsAria: '{count} piles of {size} dots.',
      whatFirst: 'What is done first?',
      timesFirstHint: 'With no brackets, the multiplication comes before the addition.',
      parensHint: 'What is inside the brackets goes first.'
    },
    transfer: 'This will help you do big sums in your head by cutting them into parts, and share things out between several people with none left over and none missing.'
  }, 'en');
})();
