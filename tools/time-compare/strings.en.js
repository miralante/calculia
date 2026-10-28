/* ============================================================
   Calculia — Which lasts longer?: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🏁 Which lasts longer?',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    intro: {
      title: 'Which lasts longer?',
      text: 'To compare, change everything to the same unit. For example: 2 hours are 120 minutes. That is more than 90 minutes.'
    },
    check: 'Check',
    newRound: 'Another round →',

    q: {
      longest: 'Which lasts longer?',
      shortest: 'Which lasts less?'
    },

    units: {
      second: { one: 'second', many: 'seconds' },
      minute: { one: 'minute', many: 'minutes' },
      hour: { one: 'hour', many: 'hours' },
      day: { one: 'day', many: 'days' },
      week: { one: 'week', many: 'weeks' },
      year: { one: 'year', many: 'years' }
    },

    gen: {
      hint: '🤔 Change the times to the same unit. How many minutes or hours does each one have?'
    }
  }, 'en');
})();
