/* ============================================================
   Calculia — Settings texts (EN)
   Language-specific file. Loaded conditionally from index.html
   based on App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⚙️ Calculia — Settings',
    routeNotice: 'Settings page. It does not appear in the app menu: it is only reached by typing this address.',
    intro: 'Here you can delete what is saved in this browser. Meant for whoever manages the device (family, teachers), not for the end user.',

    stateTitle: 'Current state of this browser',
    currentLanguage: 'Current language: {lang}',
    languageNameEs: 'Español',
    languageNameEn: 'English',
    activitiesWithProgress: 'Activities with saved progress: {n}',
    totalStars: 'Total stars: {n}',

    progressTitle: 'Progress by activity',
    progressIntro: 'Stars ⭐ saved in this browser, activity by activity. "Not started" means the person has not played that activity on this device yet.',
    notStarted: 'Not started',
    colActivity: 'Activity',
    colProgress: 'Progress',

    module1: '🧮 Math',
    module2: '🧩 Reasoning and logic',

    activity: {
      'los-numeros': 'Number Types', 'numbers-group': 'Numbers','lines': 'Lines', 'shapes': 'Shapes','trigonometry': 'Trigonometry', 'geometry': 'Geometry', 'numbers': 'Numbers', 'fractions-measures': 'Fractions', 'measures': 'Measures', 'scale': 'Scale', 'linear-functions': 'Functions',
      'mental-math': 'Subtraction and Mental Math', 'percent': 'Percentages', 'money': 'Money',
      'divisibility': 'Exact groups', 'operations': 'Quick sums', 'quantities': 'Read and Write Numbers', 'operation-concepts': 'Operations', 'order-numbers': 'Order numbers', 'order-positives': 'Order positives', 'order-negatives': 'Order negatives', 'order-fractions': 'Order fractions', 'order-decimals': 'Order decimals', 'ordinals': 'Ordinal Numbers', 'parity': 'Even and odd', 'primes': 'Primes and composites', 'common-group': 'Divisors and multiples', 'common-divisor': 'Greatest common divisor', 'common-multiple': 'Least common multiple', 'math-tables': 'Math Tables', 'head-math': 'Head Math',
      'roman-numerals': 'Roman Numerals', 'riddles': 'Riddles', 'patterns': 'Patterns',
      'problems': 'Problems', 'temperature': 'Water Temperature',
      'wallet': 'The Wallet', 'algebra': 'The balance', 'charts': 'Data and charts', 'calendar': 'The Calendar', 'clock': 'The Clock', 'stories': 'Stories',
      'odd-one-out': "What doesn't belong?", 'puzzle': 'Puzzle'
    },

    resetPersonTitle: "Reset the person's data",
    resetPersonIntro: 'Deletes the chosen language (it will be detected again, or default to Spanish, next time).',
    resetPersonNote1: 'Progress (stars and saved levels) in every activity ',
    resetPersonNoteStrong: 'is NOT deleted',
    resetPersonNote2: '.',
    btnResetPerson: "🧑 Reset the person's data",
    confirmResetPerson: 'Are you sure? Tap again to erase the language.',
    feedbackResetPersonDone: 'Done. Language erased. Progress was kept.',

    resetAppTitle: 'Reset the whole app',
    resetAppIntro1: 'Deletes ',
    resetAppIntroStrong: 'everything',
    resetAppIntro2: ' saved in this browser: language, stars and completed levels for every activity.',
    resetAppNoteStrong: 'This cannot be undone.',
    resetAppNote2: ' It is like opening the app for the first time.',
    btnResetApp: '🗑️ Reset the whole app',
    confirmResetApp: 'Are you sure? Tap again to erase EVERYTHING. This cannot be undone.',
    feedbackResetAppDone: 'Done. Everything was erased. The app is like freshly installed.',

    footerActivities: 'Go to the activities'
  }, 'en');
})();
