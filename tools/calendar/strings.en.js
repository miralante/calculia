/* ============================================================
   Calculia — Calendar texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   Day, month and season names live in 'day.*', 'month.*' and
   'season.*': app.js looks them up by the id data.js uses, so adding
   one means adding its id here and in both languages.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📅 The Calendar',
    instructionMenu: 'Choose an activity.',
    contexto: 'Days, months and seasons always come round in the same order. Knowing it helps you find your place in time.',
    explicacion: '✅ Knowing the calendar helps you remember appointments, plan your week and know when something you are waiting for arrives.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the calendar calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    day: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    },
    month: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    season: {
      spring: 'spring',
      summer: 'summer',
      autumn: 'autumn',
      winter: 'winter'
    },
    activity: {
      unidades: { name: 'How long it lasts', detail: 'Days, weeks, months and years.', instruction: 'A week is 7 days. A year is 12 months and also 4 seasons. Count them on the strip: there is nothing to learn by heart.' },
      semana: { name: 'The days of the week', detail: 'Monday to Sunday.', instruction: 'The week has 7 days and they always come in the same order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday. Saturday and Sunday are the weekend. Look at the strip of days: the answer is there.' },
      meses: { name: 'The months of the year', detail: 'January to December.', instruction: 'The year has 12 months and they always come in the same order: it starts in January and ends in December. After December, January starts again. Look at the grid of months: the answer is there.' },
      estaciones: { name: 'The seasons', detail: 'Spring, summer, autumn and winter.', instruction: 'The year has 4 seasons. In winter it is cold (January, February). In spring the flowers come out (April, May). In summer it is hot (July, August). In autumn the leaves fall (October, November).' }
    },
    level: {
      u1: 'How many has it got?',
      u2: 'Which lasts longer?',
      w1: 'The next day',
      w2: 'The day before',
      w3: 'Which day is missing?',
      m1: 'The next month',
      m2: 'The month before',
      m3: 'Which month is missing?',
      s1: 'From month to season',
      s2: 'From season to month'
    },
    unit: {
      day: 'a day',
      week: 'a week',
      month: 'a month',
      year: 'a year'
    },
    gen: {
      howManyIn: {
        daysInWeek: 'How many days are there in a week?',
        monthsInYear: 'How many months are there in a year?',
        seasonsInYear: 'How many seasons are there in a year?'
      },
      unitName: {
        daysInWeek: 'days in a week',
        monthsInYear: 'months in a year',
        seasonsInYear: 'seasons in a year'
      },
      countThem: 'Count the boxes on the strip.',
      unitAria: 'A strip with {n} {what}.',
      whichLonger: 'Which lasts longer, {a} or {b}?',
      whichShorter: 'Which lasts less, {a} or {b}?',
      containsHint: 'The first one is marked: it is one of the pieces of the other.',
      pairAria: '{big} with {small} marked inside it.',
      dayAfter: 'Which day comes after {day}?',
      dayBefore: 'Which day comes before {day}?',
      dayGap: 'Which day is missing from the week?',
      weekAria: 'The week with {day} marked.',
      weekGapAria: 'The week with one day left blank.',
      monthAfter: 'Which month comes after {month}?',
      monthBefore: 'Which month comes before {month}?',
      monthGap: 'Which month is missing from the year?',
      yearAria: 'The months of the year with {month} marked.',
      yearGapAria: 'The months of the year with one month left blank.',
      seasonOf: 'Which season is {month} in?',
      monthOfSeason: 'Which of these months is in {season}?'
    },
    transfer: 'This will help you know what day it is, write an appointment in the calendar and count how long is left until something you are waiting for.'
  }, 'en');
})();
