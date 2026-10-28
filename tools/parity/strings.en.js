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
    reminderPairs: 'If its dots go two by two and none is left over, it is even. If one is left over, it is odd.',
    reminderLastDigit: 'Look at the last digit:',
    reminderExample: 'Example: 18 ends in 8, so it is even. 27 ends in 7, so it is odd.',
    reminderNext: 'Start practising →',

    /* Root-menu key: the "Pares e impares" / "Even and odd"
       word used on the landing card and dev/. */
    parityName: 'Even and odd',
    parityDetail: 'Look at the dots: one left alone or all paired up?',

    /* ---------- Screen 1: what is even and what is odd ---------- */
    introTitle: 'What is even and what is odd?',
    introText: 'A number is even if its dots go two by two and none is left over. If one is left over, it is odd.',
    /* Captions for the 0 to 10 slides. {p} = even or odd. */
    seqZero: 'No balls: it is {p}.',
    zeroLabel: '0 = even',
    seqEven: '{n} balls, all in pairs: it is {p}.',
    seqOne: 'One ball, left alone: it is {p}.',
    seqOdd: '{n} balls: one is left alone and the rest go in pairs: it is {p}.',
    introNext: 'See it in real life →',

    /* ---------- Screen 2: real life ---------- */
    realTitle: 'In real life',
    realText: 'Look: even things go in pairs, and odd things leave one alone.',
    realNext: 'See the rule →',
    real: {
      0: {
        title: 'Shoes',
        text: 'They go two by two: one foot and the other. If one shoe is alone, one is left over.'
      },
      1: {
        title: 'Eggs',
        text: 'A dozen has 12 eggs: 6 exact pairs. If there are 7, one is left on its own.'
      },
      2: {
        title: 'Tricycle',
        text: 'Two back wheels, as a pair, and one front wheel on its own. Three wheels: odd.'
      },
      3: {
        title: 'Clover',
        text: 'Two leaves below, as a pair, and one leaf on top on its own. Three leaves: odd.'
      }
    },

    /* ---------- Screen 3: the test, in three parts ----------
       Each part has its name (label), its rule (rule, in the
       "Remember the rule" box) and its hint (hint). */
    blocks: {
      dots: {
        label: 'Part 1: dots',
        rule: 'The dots go two by two. If none is left over, it is even. If one is left over, it is odd.',
        hint: '«{elegida}» is not the answer: pair the dots two by two. If one is left alone, it is odd.'
      },
      numbers: {
        label: 'Part 2: numbers from 0 to 99',
        rule: 'A number is even if it can be split into pairs with none left over. If one is left over, it is odd.',
        hint: '«{elegida}» is not the answer: picture the dots two by two. Is one left over?'
      },
      big: {
        label: 'Part 3: big numbers',
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
    explainParity: 'The {a} dots go two by two. If none is left, it is even; if one is left, it is odd.',
    explainPairsEven: '{a} is even: two by two, none is left over.',
    explainPairsOdd: '{a} is odd: two by two, one is left over.',
    explainLast: 'The last digit of {a} is {d}. So {a} is {p}.',

    /* ---------- Closing ---------- */
    parityFinalSummary: 'You finished {count} questions. You have {stars} stars now.',
    parityTransfer: 'Knowing which numbers are even and which are odd helps split into two teams, alternate turns, or cut a list in half.'
  }, 'en');
})();
