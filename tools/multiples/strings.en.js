/* ============================================================
   Calculia — Multiples: texts (EN)
   Language file, loaded from index.html.
   Short sentences, one idea per sentence. The numbers that change in
   the questions are in braces: {n}, {d}, {k}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Multiples',
    btnMenu: 'Back to the start',

    ui: {
      visualAria: 'Drawing of groups that show the multiples.',
      product: '{k} × {d} = {m}',
      division: '{T} ÷ {d} = {q}',
      remainder: '{r} left over',
      yes: 'Yes',
      no: 'No',
    },

    /* The explanation: one idea per slide. The drawing is in data.js. */
    intro: {
      1: { title: 'A multiple comes from multiplying', text: '3 × 4 = 12. So 12 is a multiple of 3 and also of 4.' },
      2: { title: 'Multiples of 2: 2, 4, 6, 8, 10…', text: 'They come from multiplying 2 by 1, 2, 3, 4, 5… These are the even numbers.' },
      3: { title: 'Multiples of 3: 3, 6, 9, 12…', text: 'They come from multiplying 3 by 1, 2, 3, 4… Each one goes up by 3.' },
      4: { title: 'Multiples of 4: 4, 8, 12, 16…', text: 'They come from multiplying 4 by 1, 2, 3, 4… Each one goes up by 4.' },
      5: { title: 'Multiples of 5: 5, 10, 15, 20…', text: 'They come from multiplying 5 by 1, 2, 3, 4… All of them end in 0 or 5.' },
      6: { title: 'Every number is a multiple of itself', text: '7 = 1 × 7. So 7 is a multiple of 7.' },
      7: { title: 'If it does not come out exactly, it is not a multiple', text: '13 is not a multiple of 4. There is no other multiple of 4 between 12 and 16.' }
    },

    /* The test: the question, a hint (without the answer) and the explanation when right. */
    q: {
      pick: {
        prompt: 'Choose the number that is a multiple of {d}.',
        hint: '🤔 The multiples of {d} come from multiplying {d} by 1, 2, 3…',
        explain: '{n} = {k} × {d}: {n} is a multiple of {d}.'
      },
      first: {
        prompt: 'What is multiple number {k} of {d}?',
        hint: '🤔 Count up by {d}, step by step, until step {k}.',
        explain: '{d} × {k} = {n}: multiple number {k} of {d} is {n}.'
      },
      yesno: {
        prompt: 'Is {n} a multiple of {d}?',
        hint: '🤔 Check whether {n} comes out from multiplying {d} by a whole number.',
        yes: '{n} = {k} × {d}: yes, it is a multiple.',
        no: '{a} and {b} are multiples of {d}. {n} is between them: it is not a multiple.'
      },
      next: {
        prompt: '{a}, {b}, {c}… What comes next?',
        hint: '🤔 See how much it goes up each time, and add that to the last one.',
        explain: '{c} + {d} = {n}: the next multiple of {d}.'
      }
    }
  }, 'en');
})();
