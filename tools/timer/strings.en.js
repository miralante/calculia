/* ============================================================
   Calculia — Timer: texts (EN)
   Same keys as strings.es.js. Loaded from index.html according to
   App.i18n.locale().
   Short sentences, one idea per sentence (easy read).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⏲️ Timer',
    instruction: 'Choose how long you want to measure. The count goes up from zero.',
    choice: {
      second: '1 second',
      minute: '1 minute',
      fiveMinutes: '5 minutes',
      tenMinutes: '10 minutes',
      fifteenMinutes: '15 minutes',
      halfHour: 'Half an hour',
      hour: '1 hour'
    },
    goal: 'Total time: {t}',
    elapsedLabel: 'Time passed',
    start: 'Start',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    alarmTitle: 'Time is up!',
    alarmText: 'You measured {t}.',
    silence: 'Stop the alert',
    again: 'Measure another time'
  }, 'en');
})();
