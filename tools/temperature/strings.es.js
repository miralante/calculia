/* ============================================================
   Calculia — Sube y baja — texts (ES)
   Locale-specific file. Loaded from index.html.
   Keys mirror strings.en.js one to one.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🛗 Sube y baja',

    menu: {
      intro: 'Elige un juego y sube y baja hasta la flecha.'
    },

    /* Shared by both games. */
    game: {
      targetText:   'Objetivo: {target}',

      /* The order: "Orden 2 de 6", then "Sube 4 grados" with its arrow. */
      orderUp:      'Sube {n} {unit}',
      orderDown:    'Baja {n} {unit}',

      /* Names of the step buttons, read by screen readers. */
      stepUp:       'Subir {n} {unit}',
      stepDown:     'Bajar {n} {unit}',

      /* Live line, only when the player goes past the target. */
      liveOverUp:   'Te has pasado. Sube.',
      liveOverDown: 'Te has pasado. Baja.',

      /* Result, shown when the marker reaches the target. */
      resultTitle:  '✅ ¡Objetivo conseguido!',
      nextOrder:    '👉 Sigue así →',
      finishRound:  '🏁 Terminar la ronda',

      btnReset:     '↺ Repetir',
      btnExit:      '🏠 Menú'
    },

    /* Game 1: the elevator. */
    elev: {
      name:    'Ascensor',
      detail:  'Plantas bajo el suelo y sobre el suelo.',
      unitOne: 'planta',
      unitMany: 'plantas',

      /* Floor names: 0 is the ground floor; negative floors are the basement. */
      groundLabel:   'planta baja',
      basementLabel: 'sótano {n}',
      floorLabel:    'planta {n}',


      resultCrossUp:   'Has subido y has pasado la planta baja.',
      resultCrossDown: 'Has bajado y has pasado la planta baja.',
      resultGround:    'Estás en la planta baja.',
      resultBasement:  'Estás bajo el suelo, en el sótano.',
      resultUpper:     'Estás sobre el suelo.'
    },

    /* Game 2: the water thermometer. */
    water: {
      name:    'Termómetro del agua',
      detail:  'Grados bajo cero, hielo, agua y vapor.',
      unitOne: 'grado',
      unitMany: 'grados',


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
