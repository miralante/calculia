/* ============================================================
   Calculia — Even and odd: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces
   the parity). Same four steps: intro, real life, levels, and
   practice.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🟦 Even and odd',
    instruction: 'Look at the dots: one left alone or all paired up?',
    btnMenu: 'Back to the start',
    backLevels: '← Levels',
    ruleTitle: 'Remember the rule',

    /* Root-menu key: the "Pares e impares" / "Even and odd"
       word used on the landing card and dev/. */
    parityName: 'Even and odd',
    parityDetail: 'Look at the dots: one left alone or all paired up?',

    /* ---------- Screen 1: what is even and what is odd ---------- */
    introTitle: 'What is even and what is odd?',
    introText: 'A number is even if its dots go two by two and none is left over. If one is left over, it is odd.',
    introEvenCaption: 'Even: 4 dots, two pairs',
    introOddCaption: 'Odd: 5 dots, one left over',
    introNext: 'See it in real life →',

    /* ---------- Screen 2: real life ---------- */
    realTitle: 'In real life',
    realText: 'Look: even things go in pairs, and odd things leave one alone.',
    realNext: 'Choose a level →',
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
        title: 'Dancing in pairs',
        text: 'If the group is even, everyone has a partner. If it is odd, one person is always left without one.'
      },
      3: {
        title: 'A die',
        text: 'On a die, the even numbers are 2, 4 and 6. The odd numbers are 1, 3 and 5.'
      }
    },

    /* ---------- Screen 3: levels ---------- */
    levelsTitle: 'Choose a level',
    levelsText: 'Start with 1 and go in order.',
    levelsBack: '← Back',
    levelDone: '✔ Done',
    levels: {
      dots: {
        name: 'Dots',
        detail: 'Count the dots two by two.',
        rule: 'The dots go two by two. If none is left over, it is even. If one is left over, it is odd.',
        hint: 'Pair the dots two by two. If one is left alone, it is odd.'
      },
      numbers: {
        name: 'Numbers from 0 to 99',
        detail: 'Picture the dots and decide.',
        rule: 'A number is even if it can be split into pairs with none left over. If one is left over, it is odd.',
        hint: 'Picture the dots two by two. Is one left over?'
      },
      big: {
        name: 'Big numbers',
        detail: 'No need to count: look at the last digit.',
        rule: 'Look at the last digit: 0, 2, 4, 6 or 8 → even. 1, 3, 5, 7 or 9 → odd.',
        hint: 'Look only at the last digit.'
      },
      shapes: {
        name: 'Shapes',
        detail: 'Count the sides of each shape.',
        rule: 'Count the sides one by one. If they go in pairs and one is left over, it is odd.',
        hint: 'Count the sides one by one, slowly.'
      },
      romans: {
        name: 'Roman numerals',
        detail: 'Turn them into digits and decide.',
        rule: 'Turn the Roman numeral into normal digits (XIV = 14) and look at the last digit.',
        hint: 'Turn it into normal digits (XIV = 14) and look at the last digit.'
      }
    },

    /* ---------- Screen 4: practice ---------- */
    parityPrompt: 'Is {a} even or odd?',
    shapePrompt: 'This shape: does it have an even or odd number of sides?',
    shapeAria: 'Polygon shape',
    evenLabel: 'Even',
    oddLabel: 'Odd',
    wordEven: 'even',
    wordOdd: 'odd',
    pairsWord: 'pairs',
    oneLeftWord: 'one left over',

    /* Explanations: shown on a right answer. Each level's hint is
       in levels.<id>.hint. */
    explainParity: 'The {a} dots go two by two. If none is left, it is even; if one is left, it is odd.',
    explainPairsEven: '{a} is even: two by two, none is left over.',
    explainPairsOdd: '{a} is odd: two by two, one is left over.',
    explainLast: 'The last digit of {a} is {d}. So {a} is {p}.',
    explainShape: 'It is {name}: it has {n} sides. {n} is {p}.',
    explainRoman: '{roman} is {n}. {n} is {p}.',
    shapeName: {
      3: 'a triangle',
      4: 'a square',
      5: 'a pentagon',
      6: 'a hexagon',
      7: 'a heptagon',
      8: 'an octagon'
    },

    /* ---------- Closing ---------- */
    parityFinalSummary: 'Level "{level}" done: {count} questions. You have {stars} stars now.',
    parityTransfer: 'Knowing which numbers are even and which are odd helps split into two teams, alternate turns, or cut a list in half.'
  }, 'en');
})();
