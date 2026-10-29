/* ============================================================
   Calculia — Operations: texts (EN).
   Language file, loaded from index.html. Same keys as strings.es.js.
   Short sentences, one idea per sentence (easy-read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Operations',
    instruction: 'Choose an operation. Here you understand what each one means, without long sums.',
    pickTitle: 'Choose an operation.',

    ui: {
      coin: '$',
      prev: 'Previous',
      next: 'Next',
      count: '{i} of {n}',
      seeReal: 'See real examples →',
      startTest: 'Start practising →',
      right: '✅ Well done!',
      roundDone: 'You finished the round: {n} of {total} right the first time. You now have {stars} stars.',
      newRound: 'Another round →',
      otherOps: '← Other operations',
      realTitle: 'It is used in real life:',
      introTitle: 'This is how it works',
      realLabel: 'Real-life examples',
      visualAria: 'A drawing with dots or shapes that shows the operation.',
      groupsOf: '{g} groups of {e}'
    },

    ops: {
      add: {
        name: 'Add', symbolName: 'Add', detail: 'Put things together and count the total.',
        intro: {
          1: { title: 'Adding is putting together', text: 'You put together 3 red apples and 2 green ones. Now you have 5 in total.' },
          2: { title: 'Adding is also adding more', text: 'You have 3 red apples and someone adds 2 green ones. The green ones are added to the red ones: 5.' },
          3: { title: 'You can put them together in any order', text: '3 + 2 = 2 + 3 = 5' }
        },
        real: {
          1: '🍪 You have 3 biscuits and you buy 2 more: now you have 5.',
          2: '🚌 2 people get on at one stop and 2 at the next: 4 people on the bus.',
          3: '🪙 You have 2 dollars in one hand and 5 in the other: you have 7 dollars.'
        }
      },
      sub: {
        name: 'Subtract', symbolName: 'Subtract', detail: 'Take things away, or see how many are missing.',
        intro: {
          1: { title: 'Subtracting is taking away', text: 'You had 5 biscuits and you eat 2. You have 3 left.' },
          2: { title: 'Subtracting also shows how many are missing', text: 'You need 5 dollars and you have 3. You are missing 2 dollars.' }
        },
        real: {
          1: '🧃 You had 6 juice boxes and you drink 2: you have 4 left.',
          2: '🚲 There are 6 bikes and 2 are taken: 4 are left.',
          3: '🎈 You need 8 balloons for the party and you have 5: 3 are missing.'
        }
      },
      mul: {
        name: 'Multiply', symbolName: 'Multiply', detail: 'Repeat the same group many times.',
        intro: {
          1: { title: 'Multiplying is repeating a group', text: 'There are 3 packs and each pack has 4 batteries. That is 4 + 4 + 4 = 12.' },
          2: { title: 'It is adding the same thing many times', text: '3 × 4 is read as «3 times 4»: the 4 repeats 3 times.' },
          3: { title: 'Changing the order of the groups', text: '4 groups of 3 are also 12: 3 + 3 + 3 + 3 = 12.' },
          4: { title: 'The order does not change the total', text: '3 × 4 = 4 × 3. The total is 12 both ways.' }
        },
        real: {
          1: '🥚 One box has 6 eggs. With 2 boxes, there are 12 eggs.',
          2: '🪑 There are 4 rows of 5 chairs: 20 chairs.',
          3: '🍕 3 pizzas, each cut into 4 slices: 12 slices.'
        }
      },
      div: {
        name: 'Divide', symbolName: 'Divide', detail: 'Share into equal parts, or count how many groups fit.',
        intro: {
          1: { title: 'Dividing is sharing into equal parts', text: '12 socks for 3 friends: each friend gets 4.' },
          2: { title: 'Dividing also counts how many groups fit', text: '12 socks in packs of 4: 3 packs.' },
          3: { title: 'Some can be left over', text: '13 socks in packs of 4: 3 full packs and 1 is left over. This is division with a remainder.' },
          4: { title: 'Dividing and multiplying go together', text: '12 ÷ 4 = 3, because 3 × 4 = 12.' }
        },
        real: {
          1: '🧦 You share 12 socks among 4 friends: each friend gets 3.',
          2: '📦 You have 15 books and put 5 on each shelf: you need 3 shelves.',
          3: '🍪 You have 7 biscuits and put them in boxes of 3: 2 boxes are full and 1 is left over.'
        }
      }
    },

    picks: {
      prompt: 'Which operation would you use?',
      hint: '🤔 Think about the story: are things put together, taken away, repeated or shared?',
      add1: 'There are 12 people on the bus and 3 more get on.',
      add2: 'You have 2 dollars and someone gives you 5.',
      sub1: 'You had 9 sweets and you eat 4.',
      sub2: 'You need 10 chairs and there are 6.',
      mul1: 'There are 4 boxes and each box has 6 pencils.',
      mul2: 'You have 5 bags with 2 marbles in each one.',
      div1: 'You have 12 socks and share them among 3 friends, all the same.',
      div2: 'You have 15 stickers and put them on sheets of 5.'
    },

    q: {
      join: {
        prompt: 'How many are there in total?',
        hint: '🤔 Count all the drawings one by one, without counting any twice.',
        explain: 'We put {a} and {b} together: {T} in total.'
      },
      more: {
        prompt: 'You have {a} red apples and someone adds {b} green ones. How many are there now?',
        hint: '🤔 Start with the red ones you had, then count the green ones that are added.',
        explain: 'We add {b} green to the {a} red: {T} in total.'
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
        prompt: 'How many are left?',
        hint: '🤔 Cross out what goes away and count what is left without a cross.',
        explain: 'We take away {t} from {n}: {r} are left.'
      },
      gap: {
        prompt: 'How many are missing?',
        hint: '🤔 Count how many empty spaces are left.',
        explain: '{m} are missing, because {n} − {h} = {m}.'
      },
      times: {
        prompt: 'How many are there in total?',
        hint: '🤔 Count how many groups there are and how many are in each group.',
        explain: '{g} groups of {e} make {T}.'
      },
      repeat: {
        prompt: 'Which sum is the same as {g} × {e}?',
        hint: '🤔 Write the group as many times as there are groups, and add it up.',
        explain: '{g} × {e} is the same as adding {e} each time, {g} times.'
      },
      share: {
        prompt: 'How many socks does each friend get?',
        hint: '🤔 Share the drawings one by one among the friends.',
        explain: 'Each friend gets {each}, because {T} ÷ {g} = {each}.'
      },
      rest: {
        prompt: 'How many full packs are there?',
        hint: '🤔 Count the packs that are full. What does not fill a pack is left over.',
        explain: '{q} packs are full and {r} are left over.'
      },
      relation: {
        prompt: 'You share {T} into groups of {e}. Which division is it?',
        hint: '🤔 Think about groups of {e}: how many groups are there?',
        explain: '{T} ÷ {e} = {g}: {g} groups of {e} fit.'
      }
    },

    answerName: { add: 'Add', sub: 'Subtract', mul: 'Multiply', div: 'Divide' },

    pickExplain: 'This situation is about «{op}».'
  }, 'en');
})();
