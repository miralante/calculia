/* ============================================================
   Calculia — Quantities: texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().

   Mirrors strings.es.js key for key (scripts/check.js enforces the
   parity). The 'group.*', 'famous.*' and 'scene.*' keys are the real
   content of the activity: the number itself lives in data.js and
   only the word around it is translated, never the figure.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Quantities',
    instruction: 'Read big numbers and count in groups.',
    choosePractice: 'Choose what you want to practise.',
    btnMenu: 'Back to the start',

    /* ---------- Practice menu ----------
       Keys '<id>Name' / '<id>Detail': one entry per entry in
       DATA.practices. */
    readName: 'Read numbers',
    readDetail: 'Look at the number and write it.',
    writeName: 'Write numbers',
    writeDetail: 'Listen to the number and write it.',
    pointsName: 'Put the points',
    pointsDetail: 'Separate the thousands with points.',
    groupsName: 'Count in groups',
    groupsDetail: 'Tens, hundreds, thousands and dozens.',

    /* ---------- Typing practices ----------
       {n} = formatted number. {nRaw} = number without separator. */
    promptRead: 'Write this number: {n}',
    promptWrite: 'Write the number you hear.',
    promptPoints: 'Write this number with its points: {nRaw}',

    detailRead: 'Copy the digits. Add the point every three, if needed.',
    detailWrite: 'Press 🔊 if you need to hear it again.',
    detailPoints: 'Count three digits from the right and put the point.',

    /* Socratic hints: they teach the mechanic, they never give the
       answer away (see SPEC: full socratic anatomy). */
    hintRead: 'Count the digits. If there are four or more, group them in threes from the right.',
    hintWrite: 'Press 🔊 and write what you hear.',
    hintPoints: 'The point goes every three digits, starting from the right.',

    /* Reinforcement: after the round, the missed exercises are
       replayed in a mini-round. Stars already earned are kept. */
    reinforceTitle: 'Extra practice',
    reinforceIntro: 'Let us repeat the {n} exercises you got wrong until you get them all right.',

    check: 'Check',
    chooseAnother: 'Choose another practice',
    roundComplete: 'Round finished!',
    roundSummary: 'You solved {count} exercises. Now you have {stars} stars.',
    progress: '{current} of {stars}',
    correctFormat: 'It is written: {n}',

    answerInputAria: 'Write the number',

    /* Transfer: what this is for outside the screen. */
    contexto: 'You read numbers in the shop, in the lift, on money and in the news. Reading and writing big numbers is something you use every day.',
    explicacion: '✅ Numbers are counted in groups. Each group always means the same: a ten is ten, a hundred is a hundred. If you know the groups, you do not need to count one by one.',
    transfer: 'This will help you read prices, news or any big number in daily life.',

    /* ============================================================
       The "groups" practice — the learning walkthrough
       ============================================================ */

    /* Screen 1: what counting in groups is. */
    groupsIntroTitle: 'We count in groups',
    groupsIntroText: 'Counting one by one is very slow. So people count in groups.',
    groupsIntroNext: 'Next →',
    groupsPrev: '←',
    groupsNext: '→',

    /* Screen 2: groups in real life. */
    groupsFamousTitle: 'A group from real life',
    groupsFamousSubtitle: 'Look at this example:',
    groupsBack: '← Back',
    groupsBackToExamples: '← Back to the examples',
    groupsContinue: 'Next →',

    /* Screen 3: the reminder. */
    groupsReminderTitle: 'Remember what each group is worth',
    groupsReminderText: 'Each group is always worth the same.',
    ruleMultiplyTitle: 'To know how many there are: count the groups and multiply.',
    ruleDozenTitle: 'Careful: a dozen is twelve, not ten.',
    groupsStart: 'Start practising →',

    /* Screen 4: the steps. */
    groupsChooseLevel: 'Choose a step.',
    groupsBackReminder: '← Back to the reminder',
    groupsBackLevels: '← Back to the steps',
    groupsChooseAnother: 'Choose another step',

    /* ---------- The groups ----------
       FLAT keys inside 'group': app.js builds them as
       'group.' + id + 'Name', so one more level of nesting
       ('group.unit.Name') would break resolution at runtime without
       check.js noticing — the validator only sees literal t() calls,
       never the concatenated ones. Per group:
       Name = singular ("a dozen"), Label = carries its {n}
       ("2 dozens"), Plural = bare plural ("dozens"), and
       Caption = one easy sentence about that group.
       Colour never travels alone: the name is always written. */
    group: {
      unitName: 'unit',
      unitLabel: '{n} units',
      unitPlural: 'units',
      unitCaption: 'One single thing. It is the smallest group.',

      tenName: 'ten',
      tenLabel: '{n} tens',
      tenPlural: 'tens',
      tenCaption: 'Ten things together. A ten is ten.',

      hundredName: 'hundred',
      hundredLabel: '{n} hundreds',
      hundredPlural: 'hundreds',
      hundredCaption: 'A hundred things. A hundred is one hundred.',

      thousandName: 'thousand',
      thousandLabel: '{n} thousands',
      thousandPlural: 'thousands',
      thousandCaption: 'A thousand things. A thousand is one thousand.',

      halfDozenName: 'half dozen',
      halfDozenLabel: '{n} half dozens',
      halfDozenPlural: 'half dozens',
      halfDozenCaption: 'Six things. It is half of a dozen.',

      dozenName: 'dozen',
      dozenLabel: '{n} dozens',
      dozenPlural: 'dozens',
      dozenCaption: 'Twelve things. Careful: a dozen is not ten.'
    },

    /* ---------- Real-life examples ----------
       Every sentence ends with ':' because app.js appends the
       coloured count after it ("dozen = 12"). If the sentence
       brought its own full stop, the two halves would fight over
       the punctuation. */
    famous: {
      huevos: 'At the market, eggs are sold by the dozen. A small box holds one:',
      medioHuevos: 'Half a box is six eggs. That is a half dozen:',
      dedos: 'Both hands together have ten fingers. That is a ten:',
      siglo: 'A century lasts one hundred years. A hundred is a hundred:',
      concierto: 'A big concert brings together a thousand people. A thousand is a thousand:'
    },

    /* ---------- Situations ----------
       Shown under the question as support, so the round is not
       abstract: "2 dozens" is a box of eggs, not a loose
       exercise. */
    scene: {
      huevos: 'It is a box of eggs from the market.',
      cajaMedia: 'It is half a box of eggs.',
      manos: 'They are the fingers of both hands.',
      siglo: 'It is the number of years a century lasts.',
      gradas: 'It is the number of people at a big concert.'
    },

    /* ---------- The steps ----------
       Flat too: app.js asks for 'level.' + id + 'Name' / 'Detail'. */
    level: {
      learnName: 'Learn the groups',
      learnDetail: 'Look at a group and say how many there are.',
      applyName: 'Use the groups',
      applyDetail: 'Read a big number and count in dozens.',
      testName: 'Everything',
      testDetail: 'A bit of everything, in no fixed order.'
    },
    levelDone: 'Done',
    starsCount: 'Difficulty {n}',
    stepLabel: 'Step {n} of {total} · {name}',
    chainNext: 'Next step: {name}',

    /* ---------- The game ---------- */
    qHowMany: 'How many things are there?',
    qWhichGroup: 'Which group is it counted in?',
    qDigitValue: 'What is the {digit} in the {plural} worth?',

    groupsCorrect: '✅ That is how you count it.',
    groupsFinal: 'You got {n} of {total} right. Now you have {stars} stars.',
    groupsHintPrefix: '💡 ',
    groupsWrongPrefix: 'The answer is: ',

    hintDigitValue: 'Look at the colour of the digit. Each colour is a group.',
    hintWhichGroup: 'Think about how many groups fit in that number. Look at the colours.',
    hintDozen: 'Remember: a dozen is twelve.',
    hintHowMany: 'Count the groups. Then multiply by what each group is worth.',

    groupsTransfer: 'Counting in groups helps you with eggs, boxes, money and big numbers.'
  }, 'en');
})();