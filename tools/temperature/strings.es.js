/* ============================================================
   Calculia — Water Temperature — texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌡️ Temperatura del agua',
    contexto: 'En la vida real, el agua se congela, se calienta o hierve según los grados. Aquí lo ves y lo tocas.',
    transfer: 'Esto te servirá para leer el termómetro del tiempo, entender una receta o saber cuándo algo está caliente sin tocarlo.',
    btnMenu: 'Volver al inicio',

    activity: {
      'water-temperature': {
      }
    },

    level: {
    },

    gen: {
      tempReadoutAria: 'Termómetro a {temp} grados Celsius',
      stateIce: 'hielo',
      stateLiquid: 'agua líquida',
      stateSteam: 'vapor',
      btnReset:   '↺ Volver a 0 °C',
      btnAudio:   'Escuchar la temperatura',
      btnExit:    '✅ Salir',
      goalFreeze:  'Objetivo: congelar el agua (≤ 0 °C).',
      goalSteam:   'Objetivo: hervir el agua (≥ 100 °C).',
      goalBalance: 'Objetivo: llegar a 20 °C (± 2).',
      successIce:     '🧊 ¡Se ha congelado! El agua está en estado sólido.',
      successSteam:   '♨️ ¡Ha hervido! El agua se ha vuelto vapor.',
      successBalance: '🌡️ ¡20 °C exactos! Temperatura ambiente.',
      hint: 'Pulsa + o − para cambiar la temperatura. Mira cómo se transforma el agua.',
      temperatureSuggestionUp: '💡 Sugerencia: sube hasta {temp} °C.',
      temperatureSuggestionDown: '💡 Sugerencia: baja hasta {temp} °C.',
      endSummary: 'Has completado el reto. Ahora tienes {stars} estrellas.',
      ttsTemp:   '{temp} grados',
      ttsIce:    'El agua está congelada. Hielo.',
      ttsLiquid: 'El agua está líquida.',
      ttsSteam:  'El agua hierve. Vapor.'
    }
  }, 'es');
})();
