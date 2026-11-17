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
    title: '➗ Quick sums',
    instructionMenu: 'Choose what you want to practise.',
    btnMenu: 'Back to start',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} {starsWord}.',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 «{elegida}» is not the answer. Think calmly and look at the question again.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    activity: {
      consigno: { name: 'With a sign', detail: 'When negatives turn up.', instruction: 'When there are negative numbers there is no rule to learn. Find on the line where you start and walk the steps you are told: to the right if you go up and to the left if you go down. Where you land is the answer.' },
      voltear: { name: 'Turn it round', detail: 'The order changes nothing.', instruction: 'In a multiplication the order does not matter: 3 times 4 and 4 times 3 are the same number of dots, arranged another way. If you know one, you already know the other.' },
      partir: { name: 'Cut the sum', detail: 'Two easy parts.', instruction: 'A hard multiplication is cut into two easy ones. 6 times 7 is 6 times 5 and 6 times 2. You do the two parts and put them together.' },
      repartir: { name: 'Share out', detail: 'How many each, how many groups.', instruction: 'Dividing is said in two ways. One: share between several and see how many each one gets. The other: make groups of a size and see how many groups come out.' },
      orden: { name: 'What comes first', detail: 'Times and brackets.', instruction: 'When there are two operations, the multiplication is done before the addition. But if there are brackets, what is inside the brackets goes first. Brackets are in charge.' },
      placevalue: { name: 'Quick sums', detail: '10 small ones become 1 big one.', instruction: 'When you put 10 of the same together, they form 1 of the next group. The digit moves one position to the left.' }
    },
    /* Explanation and real-life screen of «placevalue» (hasExpoReal). */
    expo: {
      placevalue: {
        title: 'Quick sums',
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
    expoSlideNext: 'Next →',
    expoBack: '← Previous',
    expoProgress: '{n} / {total}',
    realBack: '← Back to the explanation',
    realNext: 'Start practising →',
    /* Colour legend of the digits (ones, tens, hundreds) and the names of the
       thousand groups, for «Quick sums». */
    leyendaUnidadesTxt: 'ones',
    leyendaDecenasTxt: 'tens',
    leyendaCentenasTxt: 'hundreds',
    grupoEtq: { 0: '', 1: 'thousands', 2: 'millions', 3: 'billions', 4: 'trillions' },
    level: {
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
      parensHint: 'What is inside the brackets goes first.',
      /* Socratic hint: one per question type. The generic line
         ("Try again. Look at the picture and count calmly") was the same
         for all of them, so it said nothing. These give the strategy
         —what to look at in this question's picture— and never the answer. */
      socraticWalk: '🤔 «{elegida}» does not come from counting the steps correctly: start at the pin, not at zero, and count the steps.',
      socraticCommute: '🤔 «{elegida}» is not the same total: count the dots in the blank rectangle, they are the same ones.',
      socraticSplit: '🤔 «{elegida}» does not join the two parts correctly: they are already worked out, look at their numbers and add them.',
      socraticSplitTens: '🤔 «{elegida}» does not respect how the number was cut up: look at the tens and the units it was split into.',
      socraticShare: '🤔 «{elegida}» is not what each pile has: look at just one pile and count the dots it has.',
      socraticGroups: '🤔 «{elegida}» counts dots instead of piles: the question asks how many piles there are, count those.',
      socraticWhatFirst: '🤔 «{elegida}» does not start in the right place: look first for brackets, and if there are any, they come first.',
      socraticOrderResult: '🤔 «{elegida}» works the steps in another order: do what is inside the brackets, or the multiplication, first; then add.',
      /* «Quick sums» of the numbers: trading and the ×10 ladder texts. */
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
      escaleraEnunciado: 'How much is 10 × this number?',
      escaleraPista: 'Times 10: each digit moves one place to the left and a zero is added.',
      socraticTradeUp: '🤔 «{elegida}» is not the number of groups. Look at the blocks and group them in tens: count the groups.',
      socraticTradeDown: '🤔 «{elegida}» is not how many small blocks fit. Look at each big block and count how many small ones fit inside.',
      socraticLadder: '🤔 «{elegida}» does not have the right number of zeros. Look at the number: it is a one followed by zeros, count how many.'
    },
    transfer: 'This will help you do big sums in your head by cutting them into parts, and share things out between several people with none left over and none missing.'
  }, 'en');
})();
