/* ============================================================
   Calculia — Read dates: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📅 Read dates',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    prev: '←',
    nextArrow: '→',

    explain: {
      read: { name: 'How a date is written', text: 'A date has three parts, in this order: day, month and year. Slashes separate them: 10/01/2025.' },
      day: { name: 'First: the day', text: 'The first number is the day. In 10/01/2025 the day is 10.' },
      month: { name: 'Then: the month', text: 'The second number is the month. In 10/01/2025 the month is 01, January.' },
      year: { name: 'Last: the year', text: 'The last number is the year. In 10/01/2025 the year is 2025.' },
      months: { name: 'The months', text: '01 January, 02 February, 03 March, 04 April, 05 May, 06 June, 07 July, 08 August, 09 September, 10 October, 11 November, 12 December.' },
      example: { name: 'Example', text: '10/01/2025 is read: 10 January 2025.' }
    },

    month: {
      m01: 'January', m02: 'February', m03: 'March', m04: 'April', m05: 'May', m06: 'June',
      m07: 'July', m08: 'August', m09: 'September', m10: 'October', m11: 'November', m12: 'December'
    },
    longDate: '{d} {m} {y}',

    q: {
      day: 'In {date}, which number is the day?',
      month: 'Which month is {date} in?',
      year: 'Which year is {date}?',
      written: 'The date is {long}. How is it written with slashes?'
    },

    check: 'Check',
    newRound: 'Another round →',
    gen: {
      hint: '🤔 Remember the order: day, month and year. The slashes separate each part.'
    }
  }, 'en');
})();
