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
      cerca: 'Near zero',
      cruzar: 'Crossing zero',
      estados: 'Ice and steam'
    },

    gen: {
      tempReadoutAria: 'Thermometer at {temp} degrees Celsius',
      stateIce: 'ice',
      stateLiquid: 'liquid water',
      stateSteam: 'steam',
      btnReset:   '↺ Start again',
      btnExit:    '✅ Exit',
      hint: 'Use −1 and +1 (or the arrow keys) until you reach the target. The ▲ marker is your temperature; the 🎯, the target.',

      /* Order on screen: "Order 2 of 6" and "Go up 4 degrees". */
      orderCount: 'Order {i} of {total}',
      orderUp:    'Go up {n} {degrees}',
      orderDown:  'Go down {n} {degrees}',
      degreeOne:  'degree',
      degreeMany: 'degrees',

      /* Live line while moving: how far off the target, and which way. */
      liveUp:      'You need {n} more {degrees}: go up.',
      liveDown:    'You need {n} more {degrees}: go down.',
      liveOverUp:   'You went {n} {degrees} too far. Now go up.',
      liveOverDown: 'You went {n} {degrees} too far. Now go down.',
      targetText: 'Target: {target} °C',

      /* Result, highlighted when the target is reached. */
      resultTitle:     '✅ Target reached!',
      resultEq:        '{from} {op} {n} = {to}',
      resultCrossUp:   'You crossed 0 going up.',
      resultCrossDown: 'You crossed 0 going down.',
      resultNoCross:   'You did not cross 0.',
      resultStateIce:    'The water is frozen: ice.',
      resultStateLiquid: 'The water is liquid.',
      resultStateSteam:  'The water is steam.',
      nextOrder:   '👉 Next order →',
      finishRound: '🏁 Finish the round',

      endSummary: 'You completed {n} orders. You now have {stars} {starsWord}.'
    }
  }, 'en');
})();
