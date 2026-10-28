/* ============================================================
   Calculia — Change the unit: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Change the unit',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    intro: {
      title: 'Change the unit',
      text: 'An hour is 60 minutes. To find how many minutes are in 3 hours, multiply: 3 × 60 = 180.'
    },
    check: 'Check',
    newRound: 'Another round →',
    q: {
      'hour-minute': 'How many minutes are there in {n} hours?',
      'minute-second': 'How many seconds are there in {n} minutes?',
      'day-hour': 'How many hours are there in {n} days?',
      'week-day': 'How many days are there in {n} weeks?',
      'year-month': 'How many months are there in {n} years?',
      'decade-year': 'How many years are there in {n} decades?',
      'century-year': 'How many years are there in {n} centuries?',
      'hour-second': 'How many seconds are there in {n} hours?'
    },
    gen: {
      hint: '🤔 Each big unit has many small ones. Multiply the amount by how many each one has.'
    }
  }, 'en');
})();
