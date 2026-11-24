/* ============================================================
   Calculia — Operations: texts (EN).
   Language file, loaded from index.html. Same keys as strings.es.js.
   Short sentences, one idea per sentence (easy-read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Operations',
    btnMenu: 'Back to start',

    ui: {
      menuInstruction: 'Choose what you want to practise',
      hintPrefix: '',
      wrongPrefix: '❌ Look: ',
      rightPrefix: '✅ Correct! ',
      menuTitle: 'What do you want to practice?',
      menuText: 'Here you understand what each one means, without long sums.',
      coin: '$',
      deal: 'Share',
      dealReset: 'Start again',
      packInstruction: 'Make {g} groups of {e}.',
      packOne: 'Group',
      packGroup: 'Group {n}',
      packResult: '{T} ÷ {e} = {g}',
      packResultLeft: '{T} ÷ {e} = {g}, left over {r}',
      repeatInstruction: 'Make {g} groups of {e} batteries.',
      repeatOne: 'Repeat',
      repeatSum: '{sum} = {T}',
      repeatSay: 'That is multiplying: {g} times {e} batteries.',
      repeatProduct: '{g} × {e} = {T}',
      calcValue: '{T} ÷ {e} = {v}',
      relationLine: '{g} × {e} = {T}',
      calcWhole: 'Before the decimal point: {q} full packs.',
      calcDecimal: 'After the decimal point: {dec}, that is {r} of {e} parts of a pack.',
      decimalSep: '.',
      fillInstructionAdd: 'Add apples until there are {n}.',
      fillInstructionSub: 'Put coins in until there are {n}.',
      fillLeftAdd: '{m} more to add.',
      fillLeftSub: 'You are missing {m}.',
      fillResultAdd: '{h} + {m} = {n}',
      fillResultSub: '{n} − {h} = {m}',
      fillOneAdd: 'Add an apple',
      fillOneSub: 'Put a coin',
      swapInstruction: 'Change the order of the groups.',
      swapOne: 'Change the order',
      swapResult: '{a} + {b} = {b} + {a} = {T}',
      joinInstruction: 'Put the two groups together.',
      joinOne: 'Join',
      joinResult: '{a} + {b} = {T}',
      takeInstruction: 'Take away {t} coins.',
      takeOne: 'Take away',
      takeResult: '{n} − {t} = {r}',
      namesPick: 'Tap a name, then the place it goes.',
      namesPlace: 'Now tap the place it goes.',
      namesRight: 'That is it!',
      namesWrong: 'That name goes in another place. Try again.',
      checkRight: '✅ Correct!',
      checkWrong: '✗ Not that one. Look at the drawing and try another.',
      checkYes: 'Yes',
      checkNo: 'No',
      checkDealQ: 'How many balls does each friend get?',
      checkPackQ: 'How many full packs are there?',
      checkJoinQ: 'How much is {a} + {b}?',
      checkTakeQ: 'If you take away {t} from {n}, how many are left?',
      checkFillAddQ: 'How many apples are missing to reach {n}?',
      checkFillSubQ: 'How many coins are missing to reach {n}?',
      checkSwapQ: 'Does the total change if you swap the order?',
      namesDone: 'Well done! Every part of the division has its name.',
      factNamesDone: 'Well done! Every part of the factorial has its name.',
      dealResult: '{T} ÷ {g} = {e}',
      friend: 'Friend {n}',
      pack: 'Package {n}',
      shelf: 'Shelf {n}',
      box: 'Box {n}',
      roundDone: 'You finished the round: {n} of {total} right the first time. You now have {stars} {starsWord}.',
      otherOps: '← Other operations',
      realTitle: 'It is used in real life:',
      introTitle: 'This is how it works',
      realLabel: 'Real-life examples',
      visualAria: 'A drawing with dots or shapes that shows the operation.',
      groupsOf: '{g} groups of {e}',
      remainder: 'remainder {r}',
      noRest: 'All the divisions come out exact: nothing is left over.'
    },

    ops: {
      add: {
        name: 'Add', symbolName: 'Add', detail: 'Put things together and count the total.',
        intro: {
          1: { title: 'Adding is putting together', text: 'You put together 3 red apples and 2 green ones. Now you have 5 in total.' },
          2: { title: 'Adding is also adding more', text: 'You have 3 red apples and someone adds 2 green ones. That makes 5.' },
          3: { title: 'You can put them together in any order', text: '3 + 2 = 2 + 3 = 5' }
        },
        real: {
          1: 'You have 3 biscuits and you buy 2 more: now you have 5.',
          2: '2 people get on at one stop and 2 at the next: 4 people on the bus.',
          3: 'You have 2 dollars in one hand and 5 in the other: you have 7 dollars.'
        }
      },
      sub: {
        name: 'Subtract', symbolName: 'Subtract', detail: 'Take things away, or see how many are missing.',
        intro: {
          1: { title: 'Subtracting is taking away', text: 'You had 5 dollars and you spend 2. You have 3 dollars left.' },
          2: { title: 'Subtracting also shows how many are missing', text: 'You want to buy something that costs 5 dollars and you have 3 dollars. You are missing 2 dollars.' }
        },
        real: {
          1: 'You had 6 juice boxes and you drink 2: you have 4 left.',
          2: 'There are 6 bikes and 2 are taken: 4 are left.',
          3: 'You need 8 balloons for the party and you have 5: 3 are missing.'
        }
      },
      mul: {
        name: 'Multiply', symbolName: 'Multiply', detail: 'Repeat the same group many times.',
        intro: {
          1: { title: 'Multiplying is repeating a group', text: 'This is a group of 4 batteries. Repeat it 3 times.' },
          2: { title: 'It is adding the same thing many times', text: '3 × 4 is read as «3 times 4»: the 4 repeats 3 times.' },
          3: { title: 'Changing the order of the groups', text: '4 groups of 3 are also 12: 3 + 3 + 3 + 3 = 12.' },
          4: { title: 'The order does not change the total', text: '3 × 4 = 4 × 3. The total is 12 both ways.' }
        },
        real: {
          1: 'One box has 6 eggs. With 2 boxes, there are 12 eggs.',
          2: 'There are 4 rows of 5 chairs: 20 chairs.',
          3: '3 pizzas, each cut into 4 slices: 12 slices.'
        }
      },
      div: {
        name: 'Divide', symbolName: 'Divide', detail: 'Share into equal parts, or count how many groups fit.',
        names: { dividend: 'dividend', divisor: 'divisor', quotient: 'quotient', rest: 'remainder', leftOver: 'left over' },
        intro: {
          1: { title: 'Each part of a division has a name', text: '7 is the dividend: what is shared. 3 is the divisor. 2 is the quotient: the result. 1 is the remainder: what is left over.' },
          2: { title: 'Dividing is sharing into equal parts', text: 'Share 6 balls between 2 friends: each friend gets 3.' },
          3: { title: 'Dividing also means grouping and counting how many groups come out', text: '6 balls in packs of 2: 3 packs.' },
          4: { title: 'Some can be left over', text: '7 balls in packs of 3: 2 full packs and 1 is left over. This is division with a remainder.' },
          5: { title: 'Dividing is the opposite of multiplying', text: 'Multiply: 4 × 2 = 8. Divide: 8 ÷ 2 = 4. If you know one, you know the other.' },
          6: { title: 'The whole part: the full packs', text: '7 balls in packs of 3: 2 packs are full. Those 2 are the whole part.' },
          7: { title: 'The calculator: what is before the point', text: 'The calculator shows 2.333… The part before the decimal point is the whole part: 2 full packs.' },
          8: { title: 'After the point: the decimal part', text: '13 ÷ 5 = 2.6. The 2 are full packs. The 0.6 is what is left over: 3 of 5 parts of a pack.' }
        },
        real: {
          1: 'You share 8 dollars among 4 friends: each friend gets 2 dollars.',
          2: 'You have 6 books and put 2 on each shelf: you need 3 shelves.',
          3: 'You have 8 biscuits and put them in boxes of 3: 2 boxes are full and 2 are left over.'
        }
      },
      fac: {
        name: 'Factorial', detail: 'What the sign "!" means, and what it is for.',
        intro: {
          1: { title: 'What is a factorial?', text: '4! is read «4 factorial». It means 4 × 3 × 2 × 1. The result is 24.' },
          2: { title: 'It grows very fast', text: '1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120. Each step multiplies by one more number. By agreement, 0! = 1.' },
          3: { title: 'It helps with divisibility', text: '5! = 120. 120 divides exactly by 1, 2, 3, 4 and 5: nothing is left over. That is why factorials help us understand divisibility.' },
          4: { title: 'The game', text: 'Put each name in its place.' }
        },
        names: { number: 'Number', result: 'Result' },
        real: {
          1: '3 friends line up for a photo. There are 6 different ways to stand.',
          2: 'You have 4 books for a shelf. You can place them in 24 different ways.',
          3: '5 friends sit on a bench. There are 120 different ways to sit.'
        }
      },
      pow: {
        name: 'Powers', detail: 'Multiply the same number many times.',
        intro: {
          1: { title: 'A power is multiplying the same thing', text: '2³ is read «2 to the power of 3».' },
          2: { title: 'The small number counts the repetitions', text: 'It is called the exponent.' },
          3: { title: 'The three parts', text: '' },
          4: { title: 'The game', text: 'Put each name in its place.' }
        }
      }
    },

    picks: {
      prompt: 'Which operation would you use?',
      hint: '🤔 Think about what happens: are things put together, taken away, repeated or shared?',
      add1: 'There are 12 people on the bus and 3 more get on.',
      add2: 'You have 2 dollars and someone gives you 5.',
      add3: 'There are 9 people in the shop and 6 more come in.',
      add4: 'You have 6 stickers and your friend gives you 7.',
      add5: 'Yesterday you read 8 pages and today you read 5.',
      sub1: 'You had 9 sweets and you eat 4.',
      sub2: 'You need 10 chairs and you have 6.',
      sub3: 'You had 12 dollars and you spend 5 dollars.',
      sub4: 'There were 15 birds and 6 fly away.',
      sub5: 'You have 11 pencils and you lend 4 to a friend.',
      mul1: 'There are 4 boxes and each box has 6 pencils.',
      mul2: 'You have 5 bags with 2 marbles in each one.',
      mul3: 'There are 3 rows of 5 chairs.',
      mul4: 'Each person has 4 marbles. There are 6 people.',
      mul5: 'One pizza has 8 slices and you buy 2 pizzas.',
      div1: 'You have 6 pizza slices and share them among 2 friends, all the same.',
      div2: 'You have 8 stickers and put 2 on each sheet.',
      div3: 'You have 12 cookies and share them equally among 4 friends.',
      div4: 'You have 15 sweets and put them into bags of 3, all the same.',
      div5: 'You have 10 tokens and put 5 in each box.'
    },

    q: {
      integer: {
        prompt: 'You put {T} balls into packs of {e}. The calculator shows {v}. How many full packs are there?',
        hint: '🤔 Look at the number before the decimal point. What does not fill a pack does not count.',
        explain: 'Before the decimal point is {q}, so {q} packs are full. What comes after the point is what is left over.'
      },
      decimal: {
        prompt: 'You put {T} balls into packs of {e}. The calculator shows {v}. What is the decimal part?',
        hint: '🤔 The decimal part comes after the point. What part of a pack is left over?',
        explain: 'The decimal part is {dec}. It is {r} of {e} parts of a pack.'
      },
      join: {
        prompt: 'You put the two groups together. How many are there in total?',
        hint: '🤔 Count all the drawings one by one, without counting any twice.',
        explain: 'We put {a} and {b} together: {T} in total.'
      },
      more: {
        prompt: 'There are {a} and {b} more are added. How many are there now?',
        hint: '🤔 Start with what you had, then count what is added.',
        explain: 'We add {b} to the {a} you had: {T} in total.'
      },
      swap: {
        prompt: 'Which sum gives the same as {a} + {b}?',
        hint: '🤔 Change the order of the numbers: does the total change?',
        explain: '{a} + {b} is the same as {b} + {a}: the total is {T}.'
      },
      swapTimes: {
        prompt: 'Which multiplication gives the same as {g} × {e}?',
        hint: '🤔 Turn the groups around: does the total change?',
        explain: '{g} × {e} is the same as {e} × {g}: the order does not change the total.'
      },
      take: {
        prompt: 'You had {n} and you take away {t}. How many are left?',
        hint: '🤔 Cross out what goes away and count what is left without a cross.',
        explain: 'We take away {t} from {n}: {r} are left.'
      },
      gap: {
        prompt: 'You need {n} and you have {h}. How many are missing?',
        hint: '🤔 Count how many empty spaces are left.',
        explain: '{m} are missing, because {n} − {h} = {m}.'
      },
      times: {
        prompt: 'There are {g} groups with {e} in each one. How many are there in total?',
        hint: '🤔 Count how many groups there are and how many are in each group.',
        explain: '{g} groups of {e} make {T}.'
      },
      repeat: {
        prompt: 'Which sum is the same as {g} × {e}?',
        hint: '🤔 Write the group as many times as there are groups, and add it up.',
        explain: '{g} × {e} is the same as adding {e} each time, {g} times.'
      },
      share: {
        prompt: 'You have {T} and share them among {g} friends, all the same. How many does each friend get?',
        hint: '🤔 Share them one by one, into each group of friends.',
        explain: 'Each friend gets {each}, because {T} ÷ {g} = {each}.'
      },
      rest: {
        prompt: 'You have {T} and put them in groups of {e}. How many full groups are there?',
        hint: '🤔 Count the groups that are full. What does not fill a group is left over.',
        explain: '{q} groups are full and {r} are left over.',
        explainOne: '{q} groups are full and 1 is left over.'
      },
      leftover: {
        prompt: 'You have {T} and put them in groups of {e}. How many are left over?',
        hint: '🤔 First count the full groups. What is outside them is left over.',
        explain: '{q} groups are full and {r} are left over.',
        explainOne: '{q} groups are full and 1 is left over.'
      },
      relation: {
        prompt: 'You share {T} into groups of {e}. Which division is it?',
        hint: '🤔 Think about groups of {e}: how many groups are there?',
        explain: '{T} ÷ {e} = {g}: {g} groups of {e} fit.'
      }
    },

    /* The Factorial practice (no test), as the Powers one: a number is typed and its working shows. */
    factorial: {
      practiceTitle: 'Start practising',
      practiceN: 'Type a number from 2 to 5. See how its factorial is worked out.',
      practiceValue: 'This is the factorial of a number. Type that number.',
      practiceSlots: 'Type a number from 2 to 5. See in how many ways its friends can line up.',
      numberAria: 'Number',
      right: 'That is it!',
      wrong: 'That number gives {r}, not {v}. Try again.',
      empty: 'Type a number',
      range: 'Type a number from 2 to 5.',
      calc: 'Work it out',
      again: 'Again',
      prev: 'Previous',
      next: 'Next'
    },

    /* The Powers practice (no test): few words, the pictures count. */
    power: {
      /* The name of each part of the power. */
      parts: { base: 'Base', exp: 'Exponent', pow: 'Power' },
      /* The empty place of the game: the name that goes in it. */
      partsAria: { base: 'Place for the base', exp: 'Place for the exponent', pow: 'Place for the power' },
      namesPick: 'Drag a name to its place, or tap it and then the place.',
      namesPlace: 'Now tap or drag the name to its place.',
      namesRight: 'That is it!',
      namesWrong: 'That name goes somewhere else. Try again.',
      namesDone: 'Well done! Every part of the power has its name.',
      /* The practice: the two ways of practising a power. */
      practiceTitle: 'Start practising',
      practiceExp: 'Put a number between 2 and 5 for the exponent.',
      practiceBase: 'Put a number in the base between 2 and 5.',
      practiceBoth: 'Put the base and the exponent, between 2 and 5.',
      prev: 'Previous',
      next: 'Next',
      calc: 'Calculate',
      empty: 'Type a number',
      range: 'Put a number between 2 and 5.',
      again: 'Again'
    },

    answerName: { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' },

    pickExplain: 'This situation is about «{op}».'
  }, 'en');
})();
