/* ============================================================
   Calculia — Water Temperature — texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌡️ Water Temperature',
    contexto: 'In real life, water freezes, warms up or boils depending on the degrees. Here you see it and play with it.',
    transfer: 'This will help you read a weather thermometer, follow a recipe or know when something is hot without touching it.',
    btnMenu: 'Back to start',

    activity: {
      'water-temperature': {
      }
    },

    level: {
    },

    gen: {
      tempReadoutAria: 'Thermometer at {temp} degrees Celsius',
      stateIce: 'ice',
      stateLiquid: 'liquid water',
      stateSteam: 'steam',
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
      temperatureSuggestionUp: '💡 Suggestion: go up to {temp} °C.',
      temperatureSuggestionDown: '💡 Suggestion: go down to {temp} °C.',
      endSummary: 'Mission complete. You now have {stars} stars.',
      ttsTemp:   '{temp} degrees',
      ttsIce:    'The water is frozen. Ice.',
      ttsLiquid: 'The water is liquid.',
      ttsSteam:  'The water is boiling. Steam.'
    }
  }, 'en');
})();
