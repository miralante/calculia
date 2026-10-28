/* ============================================================
   Calculia — How long does it take?: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⏱️ How long does it take?',
    instructionIntro: 'Read the explanation.',
    introContinue: 'Start practising →',
    intro: {
      title: 'How long does it take?',
      text: 'Some things last seconds, others minutes, hours or days. Think about real life and choose the length that makes sense.'
    },
    check: 'Check',
    newRound: 'Another round →',

    task: {
      brush: 'How long does it take to brush your teeth?',
      count: 'How long does it take to count to ten?',
      omelette: 'How long does it take to cook an omelette?',
      movie: 'How long does a film last?',
      sleep: 'How long do you sleep on a normal night?',
      orbit: 'How long does the Earth take to go round the Sun?',
      olympics: 'How much time is there between one Summer Olympics and the next?',
      weekend: 'How long is a weekend?',
      shower: 'How long does a normal shower take?',
      walk: 'How long does a short walk last?',
      class: 'How long does a school class last?'
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
      hint: '🤔 Think: does it last seconds, minutes, hours or days? What makes sense in real life?'
    }
  }, 'en');
})();
