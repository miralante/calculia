/* ============================================================
   Calculia — Positives and negatives — texts (ES)
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

    /* Shared by both games. */
    game: {
      btnReset:   '↺ Empezar de nuevo',
      btnExit:    '✅ Salir',

      /* Order on screen: "Orden 2 de 6", "Sube 4 grados", "Baja 2 plantas". */
      orderCount: 'Orden {i} de {total}',
      orderUp:    'Sube {n} {unit}',
      orderDown:  'Baja {n} {unit}',

      /* Live line while moving: how far off the target, and which way. */
      liveUp:       'Te faltan {n} {unit}: sube.',
      liveDown:     'Te faltan {n} {unit}: baja.',
      liveOverUp:   'Te has pasado {n} {unit}. Ahora sube.',
      liveOverDown: 'Te has pasado {n} {unit}. Ahora baja.',
      targetText:   'Objetivo: {target}',

      /* Result, highlighted when the target is reached. */
      resultTitle: '✅ ¡Objetivo conseguido!',
      resultEq:    '{from} {op} {n} = {to}',
      nextOrder:   '👉 Siguiente orden →',
      finishRound: '🏁 Terminar la ronda',

      endSummary: 'Has completado {n} órdenes. Ahora tienes {stars} {starsWord}.'
    },

    /* Game 1: the elevator. */
    elev: {
      gameTitle:   '🛗 Juego 1: el ascensor',
      unitOne:     'planta',
      unitMany:    'plantas',
      hint:        'Usa ▼ y ▲ (o las flechas del teclado) hasta llegar a la planta que pide la orden. 🛗 es tu ascensor; 🎯, la planta a la que quieres ir.',
      btnUp:       '▲ Subir',
      btnDown:     '▼ Bajar',
      readoutAria: 'Ascensor en {floor}',

      /* Floor names: 0 is the ground floor; negative floors are the basement. */
      groundLabel:   'planta baja',
      basementLabel: 'sótano {n}',
      floorLabel:    'planta {n}',

      resultCrossUp:   'Has subido y has pasado la planta baja.',
      resultCrossDown: 'Has bajado y has pasado la planta baja.',
      resultGround:    'Estás en la planta baja.',
      resultBasement:  'Estás bajo el suelo, en el sótano.',
      resultUpper:     'Estás sobre el suelo.',

      toWater: '🌡️ Siguiente juego: temperatura del agua →'
    },

    /* Game 2: water temperature. */
    water: {
      gameTitle:   '🌡️ Juego 2: la temperatura del agua',
      unitOne:     'grado',
      unitMany:    'grados',
      hint:        'Usa −1 y +1 (o las flechas del teclado) hasta llegar al objetivo. El marcador ▲ es tu temperatura; el 🎯, el objetivo.',
      readoutAria: 'Termómetro a {temp} grados Celsius',

      stateIce:    'hielo',
      stateLiquid: 'agua líquida',
      stateSteam:  'vapor',

      resultCrossUp:     'Has cruzado el 0 hacia arriba.',
      resultCrossDown:   'Has cruzado el 0 hacia abajo.',
      resultNoCross:     'No has cruzado el 0.',
      resultStateIce:    'El agua está congelada: hielo.',
      resultStateLiquid: 'El agua está líquida.',
      resultStateSteam:  'El agua está en forma de vapor.'
    }
  }, 'es');
})();
