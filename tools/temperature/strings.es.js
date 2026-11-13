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
      cerca: 'Cerca del 0',
      cruzar: 'Cruzar el 0',
      estados: 'Hielo y vapor'
    },

    gen: {
      tempReadoutAria: 'Termómetro a {temp} grados Celsius',
      stateIce: 'hielo',
      stateLiquid: 'agua líquida',
      stateSteam: 'vapor',
      btnReset:   '↺ Empezar de nuevo',
      btnExit:    '✅ Salir',
      hint: 'Usa −1 y +1 (o las flechas del teclado) hasta llegar al objetivo. El marcador ▲ es tu temperatura; el 🎯, el objetivo.',

      /* Order on screen: "Orden 2 de 6" and "Sube 4 grados". */
      orderCount: 'Orden {i} de {total}',
      orderUp:    'Sube {n} {degrees}',
      orderDown:  'Baja {n} {degrees}',
      degreeOne:  'grado',
      degreeMany: 'grados',

      /* Live line while moving: how far off the target, and which way. */
      liveUp:      'Te faltan {n} {degrees}: sube.',
      liveDown:    'Te faltan {n} {degrees}: baja.',
      liveOverUp:   'Te has pasado {n} {degrees}. Ahora sube.',
      liveOverDown: 'Te has pasado {n} {degrees}. Ahora baja.',
      targetText: 'Objetivo: {target} °C',

      /* Result, highlighted when the target is reached. */
      resultTitle:     '✅ ¡Objetivo conseguido!',
      resultEq:        '{from} {op} {n} = {to}',
      resultCrossUp:   'Has cruzado el 0 hacia arriba.',
      resultCrossDown: 'Has cruzado el 0 hacia abajo.',
      resultNoCross:   'No has cruzado el 0.',
      resultStateIce:    'El agua está congelada: hielo.',
      resultStateLiquid: 'El agua está líquida.',
      resultStateSteam:  'El agua está en forma de vapor.',
      nextOrder:   '👉 Siguiente orden →',
      finishRound: '🏁 Terminar la ronda',

      endSummary: 'Has completado {n} órdenes. Ahora tienes {stars} {starsWord}.'
    }
  }, 'es');
})();
