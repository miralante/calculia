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
    modesTitle: 'Choose an activity',
    whatTime: 'What time is it?',
    clockAria: 'Clock: {texto}',
    endSummary: 'You won {n} {nWord}. Now you have {stars} {starsWord}.',
    btnMenu: 'Back to start',
    learnTitle: 'How to read the clock',
    learnIntro: 'The clock has two hands. Each hand tells you one thing.',
    learnHourHand: 'The short hand shows the hour.',
    learnMinuteHand: 'The long hand shows the minutes.',
    learnRuleOClock: "If the long hand is on the 12, the time is o'clock.",
    learnRuleHalf: 'If the long hand is on the 6, it is half past.',
    learnExample: 'This clock shows {t}.',
    learnStart: 'Start practising →',
    oClock: "{h} o'clock",
    quarterPast: 'quarter past {h}',
    halfPast: 'half past {h}',
    quarterTo: 'quarter to {h}',
    correctExplanation: "✅ Correct! It's ",
    incorrectExplanationA: "❌ That is not the time. It's ",
    setHint: '🤔 «{elegida}» is not the time asked for: adjust the time with the buttons.',
    convertHint: '🤔 «{elegida}» does not match the clock face: compare the clock face with the numbers.',
    convertAnalogToDigital: 'What time does this clock show?',
    convertDigitalToAnalog: 'Tap the clock that matches this time.',
    setLabel: 'Set the clock to:',
    setHour: 'Hour',
    setMinute: 'Minutes',
    setIncrement: 'Increment',
    setDecrement: 'Decrement',
    setConfirm: 'Check',
    elapsedFrom: 'Before',
    elapsedTo: 'After',
    elapsedNow: 'Now',
    elapsedStep: 'Let half an hour pass →',
    elapsedSteps: 'Steps of time',
    elapsedPassed: 'Time passed so far: {t}',
    elapsedArrived: 'We have arrived. How much time has passed?',
    elapsedHint: "🤔 «{elegida}» is not the time that has passed: count how many half hours you let pass.",
    explainElapsed: 'Time passed: {gap}.',
    correctLead: "✅ Correct! ",
    incorrectLead: "❌ That is not the answer. ",
    gap: {
      '30': 'half an hour',
      '60': '1 hour',
      '90': 'an hour and a half',
      '120': '2 hours',
      '150': 'two and a half hours',
      '180': '3 hours'
    },
    mode: {
      elapsed: {
        name: 'How long in between',
        description: 'Look at the two clocks and say how much time there is between them.',
        question: 'How much time passes between the two clocks?'
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
      }
    },
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    levelDescription: { 1: "O'clock", 2: 'Half past', 3: 'Quarter past, quarter to' },
    transfer: 'This will help you read the time on the kitchen clock, at school or on your own watch, without having to keep asking.',
  }, 'en');
})();
