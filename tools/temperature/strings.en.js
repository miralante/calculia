/* ============================================================
   Calculia — Up and down — texts (EN)
   Locale-specific file. Loaded from index.html.
   Keys mirror strings.es.js one to one.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🛗 Up and down',

    menu: {
      intro: 'Some numbers are below zero: they are under the 0. Pick a game, go up and down to reach the 🎯 and see what happens.'
    },

    /* Shared by both games. */
    game: {
      levelLine:    'Level {n} of {total}: {level}',
      targetText:   'Target: {target}',
      hint:         'Use the buttons or the arrow keys until you reach the 🎯.',

      /* The order: "Order 2 of 6", then "Go up 4 degrees" with its arrow. */
      orderCount:   'Order {i} of {total}',
      orderUp:      'Go up {n} {unit}',
      orderDown:    'Go down {n} {unit}',

      /* Names of the step buttons, read by screen readers. */
      stepUp:       'Go up {n} {unit}',
      stepDown:     'Go down {n} {unit}',

      /* Live line while moving. It says where to go, never how far. */
      liveUp:       'Go up to the 🎯.',
      liveDown:     'Go down to the 🎯.',
      liveOverUp:   'You went too far. Now go up.',
      liveOverDown: 'You went too far. Now go down.',

      /* Result, shown when the marker reaches the target. */
      resultTitle:  '✅ Target reached!',
      nextOrder:    '👉 Next order →',
      finishRound:  '🏁 Finish the round',

      btnReset:     '↺ Start this order again',
      btnExit:      '✅ Exit to the menu'
    },

    /* Game 1: the elevator. */
    elev: {
      name:    'Elevator',
      detail:  'Floors below ground and above ground.',
      unitOne: 'floor',
      unitMany: 'floors',

      /* Floor names: 0 is the ground floor; negative floors are the basement. */
      groundLabel:   'ground floor',
      basementLabel: 'basement {n}',
      floorLabel:    'floor {n}',

      level: {
        cerca:  'Near the ground floor',
        cruzar: 'Crossing the ground floor',
        todo:   'The whole building'
      },

      resultCrossUp:   'You went up and passed the ground floor.',
      resultCrossDown: 'You went down and passed the ground floor.',
      resultGround:    'You are on the ground floor.',
      resultBasement:  'You are below ground, in the basement.',
      resultUpper:     'You are above ground.'
    },

    /* Game 2: the water thermometer. */
    water: {
      name:    'Water thermometer',
      detail:  'Degrees below zero, ice, water and steam.',
      unitOne: 'degree',
      unitMany: 'degrees',

      level: {
        cerca:   'Near 0',
        cruzar:  'Crossing 0',
        estados: 'Ice and steam'
      },

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
