/* ============================================================
   Calculia — Clock texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🕐 The Clock',
    instruction: 'Look at the clock. Choose the right time.',
    contexto: 'It is a moment of the day: breakfast, school, lunch or dinner. On the big kitchen clock you can see what time it is.',
    explicacion: '✅ Well done. Telling the time helps you arrive at school on time, not miss snack time and manage your own time.',
    levelsTitle: 'Choose an activity',
    modesTitle: 'Choose an activity',
    otherMode: 'Choose another mechanic',
    whatTime: 'What time is it?',
    clockAria: 'Clock: {texto}',
    endSummary: 'You won {n} stars. Now you have {stars} stars.',
    otherLevel: 'Choose another activity',
    oClock: "{h} o'clock",
    quarterPast: 'quarter past {h}',
    halfPast: 'half past {h}',
    quarterTo: 'quarter to {h}',
    correctExplanation: "✅ Correct! It's ",
    incorrectExplanationA: "❌ That is not the time. It's ",
    readHint: '🤔 Try again. Look calmly at the clock.',
    associateHint: '🤔 Try again. Think about that time of day.',
    setHint: '🤔 Try again. Adjust the time with the buttons.',
    convertHint: '🤔 Try again. Compare the clock face with the numbers.',
    convertAnalogToDigital: 'What time does this clock show?',
    convertDigitalToAnalog: 'Tap the clock that matches this time.',
    setLabel: 'Set the clock to:',
    setHour: 'Hour',
    setMinute: 'Minutes',
    setIncrement: 'Increment',
    setDecrement: 'Decrement',
    setConfirm: 'Check',
    mode: {
      read: {
        name: 'Read the clock',
        description: 'Look at the clock and pick the right time.',
        question: 'What time is it?'
      },
      set: {
        name: 'Set the clock',
        description: 'Read the time and move the hands with the buttons.',
        question: 'Move the hands to the right time.'
      },
      convert: {
        name: 'Analog ↔ Digital',
        description: 'Match the analog clock with its digital twin.',
        question: 'Match the clock with its digital time.'
      },
      situations: {
        name: 'Moments of the day',
        description: 'Pick the clock that matches each moment of the day.',
        question: 'What time is this?'
      }
    },
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    levelDescription: { 1: "O'clock", 2: 'Half past', 3: 'Quarter past, quarter to' },
    moment: {
      desayuno: { name: 'breakfast', question: 'What time is breakfast?' },
      colegio: { name: 'going to school', question: 'What time do you go to school?' },
      comida: { name: 'lunch', question: 'What time is lunch?' },
      merienda: { name: 'snack time', question: 'What time is snack time?' },
      cena: { name: 'dinner', question: 'What time is dinner?' },
      dormir: { name: 'bedtime', question: 'What time do you go to bed?' }
    },
    transfer: 'This will help you read the time on the kitchen clock, at school or on your own watch, without having to keep asking.',
    transferencia: 'This will help you read the time on the kitchen clock, at school or on your own watch, without having to keep asking.'
  }, 'en');
})();
