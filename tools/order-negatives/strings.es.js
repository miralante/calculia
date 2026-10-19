/* ============================================================
   Calculia — Ordenar negativos: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➖ Ordenar negativos',
    instructionIntro: 'Mira cómo se ordenan los números bajo cero.',
    realTitle: 'Los números negativos están en la vida real.',
    transfer: 'Lo usas para leer un termómetro, los pisos de un parking o la profundidad del mar.',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      conceptCount: '{i} de {n}',
      introContinue: 'Ver ejemplos reales →',
      realContinue: 'Empezar a practicar →',
      instructionMenu: 'Elige un nivel.',
      levelLocked: 'Termina el nivel anterior para abrirlo.',
      levelDone: 'Rondas hechas: {n}',
      check: 'Comprobar',
      newRound: 'Otra ronda →',
      chooseLevel: 'Cambiar de nivel'
    },

    /* Questions. {a}, {b}, {v}, {list}, {row} are filled in by the engine. */
    q: {
      promptSmallest: '¿Cuál es el número más pequeño?',
      promptLargest: '¿Cuál es el número más grande?',
      promptOrder: '¿Qué fila va de menor a mayor?',
      promptBetween: '¿Cuál de estos números va entre {a} y {b}?',
      promptMissing: '¿Qué número falta en la fila?',
      rowAria: 'Fila de números: {row}. Falta el número del hueco.',
      hintSmallest: 'Mira cuántas cifras tiene cada número. El que tiene menos cifras suele ser el más pequeño.',
      hintSmallestNeg: 'Todos son negativos. El que está más lejos del cero es el más pequeño.',
      hintLargest: 'Mira cuántas cifras tiene cada número. El que tiene más cifras suele ser el más grande.',
      hintLargestNeg: 'Todos son negativos. El que está más cerca del cero es el más grande.',
      hintOrder: 'Busca primero el número más pequeño de la lista. ¿Qué fila lo pone al principio?',
      hintOrderNeg: 'Todos son negativos. El que está más lejos del cero va primero.',
      hintBetween: 'Busca el número que es más grande que {a} y más pequeño que {b}.',
      hintMissing: 'Mira el número de la izquierda y el de la derecha del hueco. ¿Cuál cabe entre los dos?',
      explainSmallest: '{v} es el más pequeño.',
      explainSmallestNeg: '{v} es el más pequeño: está más lejos del cero.',
      explainLargest: '{v} es el más grande.',
      explainLargestNeg: '{v} es el más grande: está más cerca del cero.',
      explainOrder: 'De menor a mayor: {list}.',
      explainBetween: '{v} está entre {a} y {b}.',
      explainMissing: 'Va {v}. La fila, de menor a mayor: {list}.'
    },

    level: {
      simple: { name: 'Negativos sencillos', detail: 'Del −1 al −9.' },
      round: { name: 'Negativos redondos', detail: '−10, −30, −200, −500…' },
      lessRound: { name: 'Negativos menos redondos', detail: '−110, −120, −220, −1100…' },
      all: { name: 'Todos los negativos', detail: 'Cualquier número negativo.' }
    },

    concept: {
      1: { title: 'Bajo cero', text: 'Los números negativos están a la izquierda del cero. Son más pequeños que cero.' },
      2: { title: 'Más lejos, más pequeño', text: 'Entre negativos, el que está más lejos del cero es el más pequeño. −9 es más pequeño que −2.' },
      3: { title: 'Más cifras, más lejos', text: 'Si un negativo tiene más cifras, está más lejos del cero. Por eso −100 es más pequeño que −20.' },
      4: { title: 'El cero separa', text: 'Cualquier negativo es más pequeño que cero, y cero es más pequeño que cualquier número positivo.' }
    },

    real: {
      thermometer: 'Termómetro: −10 °C hace más frío que −2 °C.',
      parking: 'Parking: el sótano −3 está más abajo que el −1.',
      dive: 'Buceo: −30 metros está más profundo que −5 metros.',
      freezer: 'Congelador: −18 °C está más frío que −5 °C.'
    }
  }, 'es');
})();
