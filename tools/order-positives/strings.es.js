/* ============================================================
   Calculia — Ordenar números (positivos): textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Ordenar positivos',
    instructionIntro: 'Mira cómo se comparan los números.',
    realTitle: 'Estos números están en la vida real.',
    transfer: 'Lo usas cada vez que buscas el precio más bajo o la puntuación más alta de una lista.',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      conceptCount: '{i} de {n}',
      introContinue: 'Ver ejemplos reales →',
      realContinue: 'Empezar a practicar →',
      check: 'Comprobar',
      newRound: 'Otra ronda →',
    },

    /* Questions. {a}, {b}, {v}, {list}, {row} are filled in by the engine. */
    q: {
      promptSmallest: '¿Cuál es el número más pequeño?',
      promptLargest: '¿Cuál es el número más grande?',
      promptOrder: '¿Qué fila va de menor a mayor?',
      promptBetween: '¿Cuál de estos números va entre {a} y {b}?',
      promptMissing: '¿Qué número falta en la fila?',
      promptCompare: '¿Qué signo va entre los dos números?',
      relLess: 'más pequeño que',
      relGreater: 'más grande que',
      relEqual: 'igual a',
      compareAria: 'Dos números: {a} y {b}. ¿Qué signo va entre ellos?',
      explainCompare: '{a} es {rel} {b}.',
      hintCompare: '🤔 Mira cuál de los dos está más a la derecha en la recta de números. Con negativos, el que está más cerca del cero es el mayor.',
      rowAria: 'Fila de números: {row}. Falta el número del hueco.',
      hintSmallest: 'Mira cuántas cifras tiene cada número. El que tiene menos cifras suele ser el más pequeño. Si empatan, compara la primera cifra.',
      hintLargest: 'Mira cuántas cifras tiene cada número. El que tiene más cifras suele ser el más grande. Si empatan, compara la primera cifra.',
      hintOrder: 'Busca primero el número más pequeño de la lista. ¿Qué fila lo pone al principio?',
      hintBetween: 'Busca el número que es más grande que {a} y más pequeño que {b}.',
      hintMissing: 'Mira el número de la izquierda y el de la derecha del hueco. ¿Cuál cabe entre los dos?',
      explainSmallest: '{v} es el más pequeño.',
      explainLargest: '{v} es el más grande.',
      explainOrder: 'De menor a mayor: {list}.',
      explainBetween: '{v} está entre {a} y {b}.',
      explainMissing: 'Va {v}. La fila, de menor a mayor: {list}.'
    },

    level: {
      simple: { name: 'Cifras sencillas', detail: 'Del 1 al 9.' },
      round: { name: 'Números redondos', detail: '10, 30, 200, 500, 1000…' },
      lessRound: { name: 'Menos redondos', detail: '110, 120, 220, 1100, 1200…' },
      all: { name: 'Todos los números', detail: 'Cualquier número, con cualquier cantidad de cifras.' }
    },

    concept: {
      1: { title: 'Más cifras, más grande', text: 'Un número con más cifras es más grande. 9 es más pequeño que 10, y 10 es más pequeño que 100.' },
      2: { title: 'Mira la primera cifra', text: 'Si tienen las mismas cifras, mira la primera. 213 es más pequeño que 301, porque 2 es más pequeño que 3.' },
      3: { title: 'Si empatan, sigue', text: 'Si la primera cifra es igual, mira la segunda. 245 es más pequeño que 263.' },
      4: { title: 'El signo <', text: 'El signo < es como un pico que siempre apunta al número más pequeño. En 2 < 5, el pico apunta al 2.' },
      5: { title: 'De menor a mayor', text: 'Ordenar es poner primero el más pequeño y al final el más grande. En la recta, lo que está a la izquierda es más pequeño.' }
    },

    real: {
      price: 'Precios: el más barato es el número más pequeño.',
      score: 'Campeonato: el que tiene más puntos está más arriba.',
      pages: 'Páginas de un libro: la página 150 va después de la 99.'
    }
  }, 'es');
})();
