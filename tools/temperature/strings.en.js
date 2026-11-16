/* ============================================================
   Calculia — Positives and negatives — texts (EN)
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

    /* Shared by both games. */
    game: {
      btnReset:   '↺ Start again',
      btnExit:    '✅ Exit',

      /* Order on screen: "Order 2 of 6", "Go up 4 degrees", "Go down 2 floors". */
      orderCount: 'Order {i} of {total}',
      orderUp:    'Go up {n} {unit}',
      orderDown:  'Go down {n} {unit}',

      /* Live line while moving: how far off the target, and which way. */
      liveUp:       'You need {n} more {unit}: go up.',
      liveDown:     'You need {n} more {unit}: go down.',
      liveOverUp:   'You went {n} {unit} too far. Now go up.',
      liveOverDown: 'You went {n} {unit} too far. Now go down.',
      targetText:   'Target: {target}',

      /* Result, highlighted when the target is reached. */
      resultTitle: '✅ Target reached!',
      resultEq:    '{from} {op} {n} = {to}',
      nextOrder:   '👉 Next order →',
      finishRound: '🏁 Finish the round',

      endSummary: 'You completed {n} orders. You now have {stars} {starsWord}.'
    },

    /* Game 1: the elevator. */
    elev: {
      gameTitle:   '🛗 Game 1: the elevator',
      unitOne:     'floor',
      unitMany:    'floors',
      hint:        'Use ▼ and ▲ (or the arrow keys) until you reach the floor in the order. 🛗 is your elevator; 🎯, the floor you want.',
      btnUp:       '▲ Go up',
      btnDown:     '▼ Go down',
      readoutAria: 'Elevator at {floor}',

      /* Floor names: 0 is the ground floor; negative floors are the basement. */
      groundLabel:   'ground floor',
      basementLabel: 'basement {n}',
      floorLabel:    'floor {n}',

      resultCrossUp:   'You went up and passed the ground floor.',
      resultCrossDown: 'You went down and passed the ground floor.',
      resultGround:    'You are on the ground floor.',
      resultBasement:  'You are below ground, in the basement.',
      resultUpper:     'You are above ground.',

      toWater: '🌡️ Next game: water temperature →'
    },

    /* Game 2: water temperature. */
    water: {
      gameTitle:   '🌡️ Game 2: water temperature',
      unitOne:     'degree',
      unitMany:    'degrees',
      hint:        'Use −1 and +1 (or the arrow keys) until you reach the target. The ▲ marker is your temperature; the 🎯, the target.',
      readoutAria: 'Thermometer at {temp} degrees Celsius',

      stateIce:    'ice',
      stateLiquid: 'liquid water',
      stateSteam:  'steam',

      resultCrossUp:     'You crossed 0 going up.',
      resultCrossDown:   'You crossed 0 going down.',
      resultNoCross:     'You did not cross 0.',
      resultStateIce:    'The water is frozen: ice.',
      resultStateLiquid: 'The water is liquid.',
      resultStateSteam:  'The water is steam.'
    }
  }, 'en');
})();
