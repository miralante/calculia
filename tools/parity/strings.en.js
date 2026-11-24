/* ============================================================
   Calculia — Even and odd: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces
   the parity). Same three steps: intro, real life, and the test
   in three parts (dots, numbers, big numbers by their last digit).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Even and odd',
    instruction: 'Look at the dots: one left alone or all paired up?',
    btnMenu: 'Back to the start',
    /* Reminder before the test, and the "open here" help on the
       number questions that show no balls. */
    ruleOpen: 'Open here to see the rule',
    ruleLastDigit: 'If it ends in 0, 2, 4, 6 or 8: even. If it ends in 1, 3, 5, 7 or 9: odd.',
    reminderTitle: 'Remember the rule',
    reminderPairs: 'If its dots go two by two, it is even. If one is left alone, it is odd.',
    reminderLastDigit: 'Look at the last digit:',
    reminderExample: 'Example: 18 ends in 8, so it is even. 27 ends in 7, so it is odd.',
    reminderNext: 'Start practising →',

    /* Root-menu key: the "Pares e impares" / "Even and odd"
       word used on the landing card and dev/. */

    /* ---------- Screen 1: what is even and what is odd ---------- */
    introTitle: 'What is even and what is odd?',
    introText: 'It is even if its dots go two by two. If one is left over, it is odd.',
    /* Captions for the 0 to 9 slides. {p} = even or odd. */
    seqZero: 'No balls: it is {p}.',
    zeroLabel: '0 = even',
    seqEven: '{n} balls, all in pairs: it is {p}.',
    seqOne: 'One ball alone: it is {p}.',
    seqOdd: '{n} balls: one is left over: it is {p}.',
    /* Review slide, after the numbers 0 to 9: only the two lists. */
    reviewEven: 'Even: {list}',
    reviewOdd: 'Odd: {list}',
    introNext: 'See it in real life →',

    /* ---------- Screen 2: real life ---------- */
    realTitle: 'In real life',
    realText: 'Even things go in pairs; odd things leave one alone.',
    realNext: 'See the rule →',
    real: {
      0: {
        title: 'Shoes',
        text: 'One foot and the other: a pair. Even.'
      },
      1: {
        title: 'One slipper',
        text: 'There is only one slipper. Odd.'
      },
      2: {
        title: 'Half a dozen',
        text: 'Six eggs: exact pairs, none left over. Even.'
      },
      3: {
        title: 'Tricycle',
        text: 'Two back wheels as a pair and one front wheel alone. Odd.'
      },
      4: {
        title: 'Clover',
        text: 'Two leaves below as a pair and one on top alone. Odd.'
      }
    },

    /* ---------- Screen 3: the test, in three parts ----------
       Each part has its rule (rule, in the "Remember the rule" box)
       and its hint (hint). The test shows no part label. */
    blocks: {
      dots: {
        rule: 'If the dots go two by two, it is even. If one is left over, it is odd.',
        hint: '«{elegida}» is not the answer. Pair the dots: is one left over?'
      },
      numbers: {
        rule: 'It is even if it splits into pairs with none left over. If one is left, it is odd.',
        hint: '«{elegida}» is not the answer. Does one get left over in pairs?'
      },
      big: {
        rule: 'Look at the last digit: 0, 2, 4, 6 or 8 → even. 1, 3, 5, 7 or 9 → odd.',
        hint: '«{elegida}» is not the answer: look only at the last digit.'
      }
    },

    /* ---------- Screen 3: question texts ---------- */
    parityPrompt: 'Is {a} even or odd?',
    evenLabel: 'Even',
    oddLabel: 'Odd',
    wordEven: 'even',
    wordOdd: 'odd',
    pairsWord: 'pairs',
    oneLeftWord: 'one left over',

    /* Explanations: shown on a right answer. Each part's hint is
       in blocks.<id>.hint. */
    explainParity: 'The {a} dots: if they go two by two, it is even; if one is left, it is odd.',
    explainPairsEven: '{a} is even: its dots go in pairs. Its last digit, {d}, is even.',
    explainPairsOdd: '{a} is odd: one is left over. Its last digit, {d}, is odd.',
    explainLast: 'The last digit of {a} is {d}: {a} is {p}.',

    /* ---------- Closing ---------- */
    parityFinalSummary: 'You finished {count} questions. You have {stars} {starsWord} now.',
    parityTransfer: 'Knowing if a number is even or odd helps split into teams or take turns.'
  }, 'en');
})();
