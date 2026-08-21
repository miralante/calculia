/* ============================================================
   Calculia — Water Temperature — texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌡️ Water Temperature',
    instructionMenu: 'See what happens to water as the temperature changes.',
    contexto: 'In real life, water freezes, warms up or boils depending on the degrees. Here you see it and play with it.',
    explicacion: '✅ Understanding temperature and negative numbers helps you cook, read the weather, and handle anything that cools down or heats up.',
    btnBackToMenu: '← Other activities',
    otherLevel: 'Choose another mission',
    btnOtherActivity: 'Another activity',

    activity: {
      'water-temperature': {
        name: 'Water Temperature',
        detail: 'Use + and − to change the temperature.',
        instruction: 'You have a thermometer. Start at 0 °C. Press + and − to change the temperature. Watch the water: it freezes (ice), stays liquid or boils (steam). Reach the goal of each mission.'
      }
    },

    level: {
      freeze:  '🧊 Freeze the water',
      heat:    '♨️ Boil the water',
      balance: '🌡️ Balance: 20 °C'
    },

    gen: {
      tempReadoutAria: 'Thermometer at {temp} degrees Celsius',
      stateIce: 'ice',
      stateLiquid: 'liquid water',
      stateSteam: 'steam',
      btnMinus10: '−10',
      btnMinus1:  '−1',
      btnPlus1:   '+1',
      btnPlus10:  '+10',
      btnReset:   '↺ Back to 0 °C',
      btnAudio:   'Hear the temperature',
      btnExit:    '✅ Exit',
      goalFreeze:  'Goal: freeze the water (≤ 0 °C).',
      goalSteam:   'Goal: boil the water (≥ 100 °C).',
      goalBalance: 'Goal: reach 20 °C (± 2).',
      successIce:     '🧊 It froze! The water is solid.',
      successSteam:   '♨️ It boiled! The water became steam.',
      successBalance: '🌡️ Exactly 20 °C! Room temperature.',
      hint: 'Press + or − to change the temperature. Watch the water transform.',
      resumenFinal: 'Mission complete. You now have {estrellas} stars.',
      endSummary: 'Mission complete. You now have {estrellas} stars.',
      ttsTemp:   '{temp} degrees',
      ttsIce:    'The water is frozen. Ice.',
      ttsLiquid: 'The water is liquid.',
      ttsSteam:  'The water is boiling. Steam.'
    }
  }, 'en');
})();
