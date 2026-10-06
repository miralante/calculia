/* ============================================================
   Calculia — Positive and negative (texts EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   Key layout mirrors strings.es.js exactly so the script in
   scripts/check.js can diff the two trees. Any new key added
   to one file MUST be added to the other in the same place.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Positive and negative',
    instructionIntro: 'First the theory. Then you will see it with a thermometer and with an elevator.',
    contexto: 'In real life there are numbers above and below zero: degrees below zero, basement floors or money you owe.',
    explicacion: '✅ Understanding positive and negative numbers helps you read a thermometer, an elevator or your account, not only one operation.',
    transfer: 'This will help you read the weather, move between floors and know how much you owe or have left.',
    btnMenu: 'Back to start',
    btnOtherActivity: 'Another activity',

    /* Transition buttons: each names the NEXT concrete action,
     * not a generic "Next". Same pattern as
     * tools/roman-numerals/referenceNext ("Empezar a
     * practicar →" / its English mirror). */
    introNext:   '👉 Move the thermometer →',
    tempNext:    '👉 Get in the elevator →',
    elevFinish:  '✅ Finish',

    level: {
      subzero:  '❄️ Below zero',
      positive: '☀️ Above zero',
      target:   '🎯 Land on an exact number',
      libre:    '🛗 Free elevator',
      down:     '▼ Go down to the basement',
      up:       '▲ Go up to a high floor',
      random:   '🎲 Any floor'
    },

    theory: {
      title: 'Positive and negative',
            intro: 'Numbers you count one by one (1, 2, 3…) are called whole numbers. They are different from decimal numbers (1.5 · 2.75), which have a part after the dot. Here we look at whole numbers: they can be positive, negative, or zero.',
      rules: [
        'Positive numbers are greater than zero: they go to the right (+1, +2, +3…).',
        'Negative numbers are less than zero: they go to the left (−1, −2, −3…).',
        'Zero (0) is neither positive nor negative: it is the starting point.',
        'The further to the right, the bigger the number. The further to the left, the smaller.'
      ],
      examples: 'In real life: −5 °C (five below zero) is cold. +5 °C is cool. 0 °C is when water freezes.'
    },

    gen: {
      hint: 'Press the buttons to change the number. Look at the sign next to it.',
      endSummary: 'Mission complete. You now have {stars} stars.',
      btnExit: '✅ Exit',
      btnReset: '↺ Back to 0',
      btnAudio: '🔊 Hear the number',

      crossedZero: '🎉 You crossed zero! You moved from a positive to a negative number, or the other way.',
      crossedZeroShort: 'You crossed zero!',

      goalNegativo: 'Goal: go below 0 °C (negative number).',
      goalPositivo: 'Goal: go above 0 °C (positive number).',
      goalCero:     'Goal: reach 0 °C (± {tol}).',
      successLine:  '✅ Goal reached!',

      signNegative: 'Negative number',
      signPositive: 'Positive number',
      signZero:     'Zero',

      tempSuggestionDown: '💡 Suggestion: go down to {temp}.',
      tempSuggestionUp:   '💡 Suggestion: go up to {temp}.',

      tempReadoutAria: 'Thermometer at {temp} degrees',
      tempTtsReadout: 'The thermometer reads {temp} degrees',

      elevGoalDown:   'Goal: go down to floor {target}.',
      elevGoalUp:     'Goal: go up to floor {target}.',
      elevGoalRandom: 'Goal: reach floor {target}.',
      elevFloorAria:  'Elevator at floor {floor}',
      elevSuccess:    '🛗 Floor reached!',
      elevSuggestionUp:   '💡 Suggestion: go up to floor {piso}.',
      elevSuggestionDown: '💡 Suggestion: go down to floor {piso}.',
      elevTtsFloor: 'Floor {piso}',
      floorLabel:     'Current floor',
      btnDown:        '▼ Down one floor',
      btnUp:          '▲ Up one floor'
    }
  }, 'en');
})();