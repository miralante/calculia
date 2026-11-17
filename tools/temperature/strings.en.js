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
      intro: 'Pick a game and go up and down to the arrow.'
    },

    /* Shared by both games. */
    game: {
      targetText:   'Target: {target}',

      /* The order: "Order 2 of 6", then "Go up 4 degrees" with its arrow. */
      orderUp:      'Go up {n} {unit}',
      orderDown:    'Go down {n} {unit}',

      /* Names of the step buttons, read by screen readers. */
      stepUp:       'Go up {n} {unit}',
      stepDown:     'Go down {n} {unit}',

      /* Live line, only when the player goes past the target. */
      liveOverUp:   'You went too far. Go up.',
      liveOverDown: 'You went too far. Go down.',

      /* Result, shown when the marker reaches the target. */
      resultTitle:  '✅ Target reached!',
      nextOrder:    '👉 Next order →',
      finishRound:  '🏁 Finish the round',

      btnReset:     '↺ Try again',
      btnExit:      '🏠 Menu'
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
