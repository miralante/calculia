/* ============================================================
   Calculia — Moments of the day: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌅 Moments of the day',
    instructionIntro: 'Read the explanation.',
    btnMenu: 'Back to start',

    ui: { realLabel: 'Real-life examples' },

    /* Explanation in slides with a drawing: one per part of the day. */
    intro: {
      1: { title: 'In the morning', text: 'It is from when you get up until lunch. Breakfast and school are in the morning.' },
      2: { title: 'In the afternoon', text: 'It is from lunch until the evening gets dark. Lunch and snack time are in the afternoon.' },
      3: { title: 'At night', text: 'It is when the evening gets dark, until you go to bed. Dinner and bedtime are at night.' }
    },

    /* Real-life examples: one moment at a time. */
    example: {
      desayuno: 'Breakfast is in the morning, when the day starts.',
      colegio: 'Going to school is in the morning.',
      comida: 'Lunch is in the afternoon, after the morning.',
      merienda: 'Snack time is in the afternoon, before it gets dark.',
      cena: 'Dinner is at night.',
      dormir: 'Bedtime is at night.'
    },

    part: {
      manana: 'In the morning',
      tarde: 'In the afternoon',
      noche: 'At night'
    },

    q: {
      desayuno: 'When is breakfast?',
      colegio: 'When do you go to school?',
      comida: 'When is lunch?',
      merienda: 'When is snack time?',
      cena: 'When is dinner?',
      dormir: 'When do you go to bed?'
    },

    explain: {
      desayuno: 'Breakfast is in the morning.',
      colegio: 'Going to school is in the morning.',
      comida: 'Lunch is in the afternoon.',
      merienda: 'Snack time is in the afternoon.',
      cena: 'Dinner is at night.',
      dormir: 'Bedtime is at night.'
    },

    gen: {
      hint: '🤔 Think: does it happen before lunch, after lunch, or when it is already dark?'
    }
  }, 'en');
})();
