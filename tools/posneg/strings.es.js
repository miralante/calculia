/* ============================================================
   Calculia — Positivos y negativos (textos ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().
   Claves agrupadas por responsabilidad:
   - title / contexto / transfer: cabecera y copy global
     (mismo patrón que tools/temperature).
   - instructionIntro: subtítulo de la pantalla 1.
   - introNext / tempNext / elevFinish: textos de los
     botones de transición. NO dicen "Siguiente" genérico;
     cada uno nombra la siguiente acción concreta, igual que
     tools/roman-numerals/referenceNext ("Empezar a
     practicar →"). Esta es la parte clave del patrón de
     "transición natural" entre pantallas.
   - level.<id>: etiquetas reservadas (la actividad lineal
     no las usa para navegación, pero las conservo por si
     se añaden niveles visibles).
   - theory.*: textos de la pantalla teórica.
   - gen.*: textos compartidos entre el termómetro y el
     ascensor (goal lines, hints, éxito, celebraciones).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Positivos y negativos',
    instructionIntro: 'Primero la teoría. Después lo verás con un termómetro y con un ascensor.',
    contexto: 'En la vida real hay números por encima y por debajo de cero: grados bajo cero, plantas de un sótano o dinero que debes.',
    explicacion: '✅ Entender los números positivos y negativos te ayuda a leer un termómetro, un ascensor o las cuentas, no en una operación.',
    transfer: 'Esto te servirá para leer el tiempo, moverte entre plantas y saber cuánto debes o te queda.',
    btnMenu: 'Volver al inicio',
    btnOtherActivity: 'Otra actividad',

    /* Transition buttons. Each names the NEXT action the user
     * will take, in plain imperative form — no generic
     * "Siguiente". The arrow glyph mirrors the rest of the
     * suite so the visual rhythm stays familiar. */
    introNext:   '👉 Mueve el termómetro →',
    tempNext:    '👉 Sube al ascensor →',
    elevFinish:  '✅ Terminar',

    level: {
      subzero:  '❄️ Por debajo de cero',
      positive: '☀️ Por encima de cero',
      target:   '🎯 Llegar a un número exacto',
      libre:    '🛗 Ascensor libre',
      down:     '▼ Bajar al sótano',
      up:       '▲ Subir a una planta alta',
      random:   '🎲 Cualquier piso'
    },

    theory: {
      title: 'Positivos y negativos',
      intro: 'Un número entero puede ser positivo, negativo o cero.',
      rules: [
        'Los números positivos son mayores que cero: van hacia la derecha (+1, +2, +3…).',
        'Los números negativos son más bajos que cero: van hacia la izquierda (−1, −2, −3…).',
        'El cero (0) no es positivo ni negativo: es el punto de partida.',
        'Cuanto más a la derecha, más grande es el número. Cuanto más a la izquierda, más pequeño.'
      ],
      examples: 'En la vida real: −5 °C (cinco bajo cero) hace frío. +5 °C hace fresco. 0 °C es cuando el agua se congela.'
    },

    gen: {
      hint: 'Pulsa los botones para cambiar el número. Mira el signo a su lado.',
      endSummary: 'Has completado el reto. Ahora tienes {stars} estrellas.',
      btnExit: '✅ Salir',
      btnReset: '↺ Volver a 0',
      btnAudio: '🔊 Escuchar el número',

      /* Cross-zero celebration. Long form goes in the visible
         'crossed-zero' line; short form goes through the brief
         feedback.celebrate() toast (same pattern as core
         round-completion). */
      crossedZero: '🎉 ¡Has cruzado el cero! Has pasado de un número positivo a uno negativo, o al revés.',
      crossedZeroShort: '¡Has cruzado el cero!',

      /* Temperature mission goal lines (reused for subzero /
       * positive / target missions). */
      goalNegativo: 'Objetivo: bajar de 0 °C (número negativo).',
      goalPositivo: 'Objetivo: subir por encima de 0 °C (número positivo).',
      goalCero:     'Objetivo: llegar a 0 °C (± {tol}).',
      successLine:  '✅ ¡Objetivo conseguido!',

      /* Temperature sign chip under the big number. */
      signNegative: 'Número negativo',
      signPositive: 'Número positivo',
      signZero:     'Cero',

      /* Random suggestion for temperature missions. */
      tempSuggestionDown: '💡 Sugerencia: baja hasta {temp}.',
      tempSuggestionUp:   '💡 Sugerencia: sube hasta {temp}.',

      /* Accessibility label for the temperature readout. */
      tempReadoutAria: 'Termómetro en {temp} grados',
      tempTtsReadout: 'El termómetro marca {temp} grados',

      /* Elevator goal lines, one per direction. */
      elevGoalDown:   'Objetivo: bajar al piso {target}.',
      elevGoalUp:     'Objetivo: subir al piso {target}.',
      elevGoalRandom: 'Objetivo: llegar al piso {target}.',
      elevFloorAria:  'Ascensor en la planta {floor}',
      elevSuccess:    '🛗 ¡Piso alcanzado!',
      elevSuggestionUp:   '💡 Sugerencia: sube hasta el piso {piso}.',
      elevSuggestionDown: '💡 Sugerencia: baja hasta el piso {piso}.',
      elevTtsFloor: 'Planta {piso}',
      floorLabel:     'Planta actual',
      btnDown:        '▼ Bajar una planta',
      btnUp:          '▲ Subir una planta'
    }
  }, 'es');
})();