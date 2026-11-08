/* ============================================================
   Calculia — Change the unit: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    btnMenu: 'Back to start',
    title: '🔁 Change the unit',
    instructionIntro: 'Read the explanation.',
    ui: { realLabel: 'Real-life examples' },
    explain: {
      hours: { name: 'Hours, half hours and quarters', text: 'One hour is 2 half hours. One hour is 4 quarters of an hour.' },
      minutes: { name: 'Minutes and seconds', text: 'One hour is 60 minutes. One minute is 60 seconds.' },
      multiply: { name: 'To change into a small unit, multiply', text: '3 hours × 2 = 6 half hours. 2 hours × 4 = 8 quarters of an hour.' },
      divide: { name: 'To change into a big unit, divide', text: '8 quarters of an hour ÷ 4 = 2 hours. 120 minutes ÷ 60 = 2 hours.' }
    },
    example: {
      film: 'A film lasts 2 hours. That is 4 half hours.',
      song: 'A song lasts 3 minutes. That is 180 seconds.',
      class: 'A class lasts half an hour. That is 30 minutes.',
      lunch: 'A lunch break lasts one hour. That is 4 quarters of an hour.',
      recipe: 'A recipe waits a quarter of an hour. That is 15 minutes.'
    },
    q: {
      'hour-half': 'How many half hours are there in {n} hours?',
      'hour-quarter': 'How many quarters of an hour are there in {n} hours?',
      'half-quarter': 'How many quarters of an hour are there in {n} half hours?',
      'hour-minute': 'How many minutes are there in {n} hours?',
      'half-minute': 'How many minutes are there in {n} half hours?',
      'quarter-minute': 'How many minutes are there in {n} quarters of an hour?',
      'minute-second': 'How many seconds are there in {n} minutes?',
      'hour-second': 'How many seconds are there in {n} hours?',
      'half-hour-back': 'How many hours are {n} half hours?',
      'quarter-hour-back': 'How many hours are {n} quarters of an hour?',
      'minute-hour-back': 'How many hours are {n} minutes?',
      'second-minute-back': 'How many minutes are {n} seconds?'
    },
    gen: {
      hint: '🤔 Think how many small units fit in a big one. To change into a small unit, multiply. To change into a big unit, divide.'
    }
  }, 'en');
})();
