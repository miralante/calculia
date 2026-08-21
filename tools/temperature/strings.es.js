/* ============================================================
   Calculia — Water Temperature — texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🌡️ Temperatura del agua',
    instructionMenu: 'Aprende qué pasa con el agua cuando cambia la temperatura.',
    contexto: 'En la vida real, el agua se congela, se calienta o hierve según los grados. Aquí lo ves y lo tocas.',
    explicacion: '✅ Entender la temperatura y los números negativos te sirve para cocinar, para el tiempo del día y para cualquier cosa que se enfría o se calienta.',
    btnBackToMenu: '← Otras actividades',
    otherLevel: 'Elegir otro reto',
    btnOtherActivity: 'Otra actividad',

    activity: {
      'water-temperature': {
        name: 'Temperatura del agua',
        detail: 'Sube y baja la temperatura con los botones.',
        instruction: 'Tienes un termómetro. Empieza en 0 °C. Pulsa + y − para cambiar la temperatura. Cada cambio se ve en el agua: se congela (hielo), sigue líquida o hierve (vapor). Llega al objetivo de cada reto.'
      }
    },

    level: {
      freeze:  '🧊 Congelar el agua',
      heat:    '♨️ Hervir el agua',
      balance: '🌡️ Equilibrio: 20 °C'
    },

    gen: {
      tempReadoutAria: 'Termómetro a {temp} grados Celsius',
      stateIce: 'hielo',
      stateLiquid: 'agua líquida',
      stateSteam: 'vapor',
      btnMinus10: '−10',
      btnMinus1:  '−1',
      btnPlus1:   '+1',
      btnPlus10:  '+10',
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
      resumenFinal: 'Has completado el reto. Ahora tienes {estrellas} estrellas.',
      endSummary: 'Has completado el reto. Ahora tienes {estrellas} estrellas.',
      ttsTemp:   '{temp} grados',
      ttsIce:    'El agua está congelada. Hielo.',
      ttsLiquid: 'El agua está líquida.',
      ttsSteam:  'El agua hierve. Vapor.'
    }
  }, 'es');
})();
