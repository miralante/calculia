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
    prev: '←',
    nextArrow: '→',
    explain: {
      hours: { name: 'Hours to minutes', text: 'An hour is 60 minutes.' },
      multiply: { name: 'Multiply by 60', text: 'To change hours into minutes, multiply the hours by 60.' },
      example: { name: 'Example', text: '3 hours × 60 = 180 minutes.' },
      back: { name: 'Minutes to hours', text: 'To change minutes into hours, divide by 60. 120 minutes ÷ 60 = 2 hours.' },
      real: { name: 'In real life', text: 'A film lasts 2 hours. That is 120 minutes.' }
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
