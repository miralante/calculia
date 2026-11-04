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
      year: { name: 'Year', text: 'A year is 12 months. A year has 365 days. Leap years have 366 days.' },
      yearMonths: { name: 'The months of the year', text: 'January is the first month. December is the last one.' },
      semester: { name: 'Semester', text: 'A semester is 6 months. A year has two semesters.' },
      quadrimester: { name: 'Quadrimester', text: 'A quadrimester is 4 months. A year has three quadrimesters.' },
      trimester: { name: 'Trimester', text: 'A trimester is 3 months. A year has four trimesters.' },
      bimester: { name: 'Bimester', text: 'A bimester is 2 months.' },
      month: { name: 'Month', text: 'A month has between 28 and 31 days.' },
      fortnight: { name: 'Fortnight', text: 'A fortnight is 15 days. It is half a month.' },
      week: { name: 'Week', text: 'A week is 7 days. They are Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday.' },
      day: { name: 'Day', text: 'A day is 24 hours.' },
      hour: { name: 'Hour', text: 'An hour is 60 minutes.' },
      halfHour: { name: 'Half an hour', text: 'Half an hour is 30 minutes.' },
      quarterHour: { name: 'Quarter of an hour', text: 'A quarter of an hour is 15 minutes.' },
      minute: { name: 'Minute', text: 'A minute is 60 seconds.' },
      second: { name: 'Second', text: 'The second is the smallest unit in this list.' }
    },

    example: {
      century: 'The 20th century ran from 1901 to 2000. In 1969 a person walked on the Moon. The 21st century started in 2001.',
      decade: 'From 1990 to 2000 is one decade. In 1992 the Summer Olympics were held in Barcelona.',
      lustro: 'From your 10th birthday to your 15th birthday is one lustrum.',
      year: 'Your birthday comes once a year.',
      yearMonths: 'December, January and February are the winter months.',
      semester: 'From January to June is one semester.',
      quadrimester: 'Many Spanish universities have two quadrimesters in one year.',
      trimester: 'From January to March is one trimester.',
      bimester: 'Some bills are paid every bimester.',
      month: 'February has 28 days. In a leap year it has 29.',
      fortnight: 'Some people are paid every fortnight.',
      week: 'From Monday to Sunday is one week.',
      day: 'A day has morning, afternoon and night.',
      hour: 'A film usually lasts about 2 hours.',
      halfHour: 'A cartoon show usually lasts half an hour.',
      quarterHour: 'Waiting for the bus can take a quarter of an hour.',
      minute: 'Brushing your teeth takes about 2 minutes.',
      second: 'Each heartbeat lasts almost one second.'
    },

    q: {
      century: 'How many years are there in a century?',
      decade: 'How many years are there in a decade?',
      lustro: 'How many years are there in a lustrum?',
      year: 'How many months are there in a year?',
      semester: 'How many months are there in a semester?',
      quadrimester: 'How many months are there in a quadrimester?',
      trimester: 'How many months are there in a trimester?',
      bimester: 'How many months are there in a bimester?',
      fortnight: 'How many days are there in a fortnight?',
      week: 'How many days are there in a week?',
      day: 'How many hours are there in a day?',
      hour: 'How many minutes are there in an hour?',
      halfHour: 'How many minutes are there in half an hour?',
      quarterHour: 'How many minutes are there in a quarter of an hour?',
      minute: 'How many seconds are there in a minute?'
    },

    month: {
      m01: 'January', m02: 'February', m03: 'March', m04: 'April', m05: 'May', m06: 'June',
      m07: 'July', m08: 'August', m09: 'September', m10: 'October', m11: 'November', m12: 'December'
    },

    gen: {
      hint: '🤔 Look at the explanation again. Think which unit is smaller than the one in the question.'
    }
  }, 'en');
})();
