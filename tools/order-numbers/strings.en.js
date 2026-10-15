/* ============================================================
   Calculia — Order numbers: texts (EN)
   Language-specific file. Loaded from index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Order numbers',
    instruction: 'Put the numbers from smallest to biggest.',
    btnStart: 'Start',
    menuTitle: 'Put each number in its place.',
    menuDetail: 'You start with few numbers. Each round goes up a little.',
    btnMenu: 'Back to start',

    /* ---------- Round ----------
       {count} = how many numbers are in this set. */
    promptOrder: 'Put these {count} numbers in order. Start with the smallest.',
    detailOrder: 'Drag each number to its gap. If you cannot drag, tap the number and then the gap.',
    boardAria: 'Gaps to order the numbers',
    trayAria: 'Numbers to place',
    pieceAria: 'Number {n}. Tap it and then the gap where it goes.',
    slotEmptyAria: 'Gap {n} of {total}, empty.',
    slotLockedAria: 'Gap {n}: {v}, in the right place.',
    slotWrongAria: 'Gap {n}: {v}, wrong place.',
    orderSelected: 'You picked {n}. Tap the gap where it goes.',
    orderLocked: 'That gap already has its number.',

    /* ---------- Wrong place ----------
       Socratic hints: they ask about the neighbour, never give the
       answer. */
    orderWrongPlace: 'Wrong place.',
    orderHintLeft: 'This number is smaller than the one on your left.',
    orderHintRight: 'This number is bigger than the one on your right.',
    orderHintCount: 'Count the free gaps. Which of the numbers left goes right here?',
    orderHintDigits: 'Look at the digits. A number with more digits is bigger.',
    orderHintFirst: 'They all have the same number of digits. Look at the first digit of each number.',

    /* {list} = the numbers already in order, smallest to biggest. */
    orderCorrect: 'They are in order: {list}.',

    /* Reinforcement: at the end of the round, the failed sets are repeated. */
    reinforceTitle: 'Practice',
    reinforceIntro: 'We will repeat the {n} sets you missed until you get them all right.',

    roundComplete: 'Round finished!',
    roundSummary: 'You ordered {count} sets of numbers. You now have {stars} stars.',
    progress: '{current} of {stars}',

    /* Transfer: where this is used outside the screen. */
    contexto: 'Ordering numbers helps you compare prices, ages or distances and know which is the biggest.',
    explicacion: '✅ To order, look at the digits first. The number with more digits is usually the bigger one.',
    transfer: 'You use it every time you look for the lowest price or the biggest number in a list.'
  }, 'en');
})();
