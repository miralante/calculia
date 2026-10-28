/* ============================================================
   Calculia — Units of time: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⌛ Units of time',
    instructionIntro: 'Read the explanation.',
    instructionExamples: 'See how it appears in real life.',
    introNext: 'See it in real life →',
    examplesNext: 'Start practising →',
    prev: '←',
    nextArrow: '→',
    check: 'Check',
    newRound: 'Another round →',

    unit: {
      century: { name: 'Century', text: 'A century is 100 years.' },
      decade: { name: 'Decade', text: 'A decade is 10 years.' },
      lustro: { name: 'Lustrum', text: 'A lustrum is 5 years.' },
      year: { name: 'Year', text: 'A year is 12 months and about 365 days.' },
      month: { name: 'Month', text: 'A month has between 28 and 31 days.' },
      week: { name: 'Week', text: 'A week is 7 days.' },
      day: { name: 'Day', text: 'A day is 24 hours.' },
      hour: { name: 'Hour', text: 'An hour is 60 minutes.' },
      minute: { name: 'Minute', text: 'A minute is 60 seconds.' },
      second: { name: 'Second', text: 'The second is the smallest unit in this list.' }
    },

    example: {
      century: 'The 21st century started in the year 2001.',
      decade: 'From 2020 to 2030 is one decade.',
      lustro: 'From your 10th birthday to your 15th birthday is one lustrum.',
      year: 'Your birthday comes once a year.',
      month: 'February has 28 days. In a leap year it has 29.',
      week: 'From Monday to Sunday is one week.',
      day: 'A day has morning, afternoon and night.',
      hour: 'A film usually lasts about 2 hours.',
      minute: 'Brushing your teeth takes about 2 minutes.',
      second: 'Each heartbeat lasts almost one second.'
    },

    q: {
      century: 'How many years are there in a century?',
      decade: 'How many years are there in a decade?',
      lustro: 'How many years are there in a lustrum?',
      year: 'How many months are there in a year?',
      week: 'How many days are there in a week?',
      day: 'How many hours are there in a day?',
      hour: 'How many minutes are there in an hour?',
      minute: 'How many seconds are there in a minute?'
    },

    gen: {
      hint: '🤔 Look at the explanation again. Think which unit is smaller than the one in the question.'
    }
  }, 'en');
})();
