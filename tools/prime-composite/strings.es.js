/* ============================================================
   Calculia — Primo o compuesto: textos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html. Primero los compuestos, luego los primos.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en el juego van entre llaves: {a}, {b}, {m}, {n}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔎 Primo o compuesto',
    btnMenu: 'Volver al inicio',

    ui: {
      product: '{k} × {d} = {m}'
    },

    /* La explicación: una idea por diapositiva. Los compuestos van primero. */
    concept: {
      composite: {
        title: 'Número compuesto',
        text: 'Toca un número de filas. Si no sobra ningún punto, las filas salen iguales. El 6 sale en 2 filas de 3, así que es compuesto.'
      },
      compositeMult: {
        title: 'Se puede escribir como multiplicación',
        text: '4 = 2 × 2. 6 = 2 × 3. 8 = 2 × 4. 9 = 3 × 3. Todos son compuestos.'
      },
      compositeOther: {
        title: 'Si sale de otra forma, es compuesto',
        text: 'Toca un número de filas. El 15 sale en 3 filas de 5, y también en 5 filas de 3. Por eso es compuesto.'
      },
      compositeGrid: {
        title: 'Encuentra los compuestos',
        text: 'Toca los números compuestos del 1 al 20. El 1 y los primos no son compuestos.'
      },
      prime: {
        title: 'Número primo',
        text: 'Toca un número de filas. El 7 solo sale en 1 fila de 7, o en 7 filas de 1. Por eso es primo.'
      },
      one: {
        title: 'El 1 no es primo ni compuesto',
        text: 'El 1 es un solo punto. No tiene dos formas de ponerse en filas, así que no es primo. Tampoco es compuesto.'
      },
      primeGrid: {
        title: 'Encuentra los primos',
        text: 'Toca los números primos del 1 al 20. Los compuestos y el 1 no son primos.'
      }
    },

    /* Las filas que el alumno elige en la diapositiva. */
    rows: {
      ask: '¿En cuántas filas lo pones?',
      aria: 'Poner en {r} filas',
      exact: '{n} = {r} × {c}. Sale exacto.',
      left: 'Con {r} filas sobran {left} puntos. No sale exacto.',
      leftOne: 'Con {r} filas sobra 1 punto. No sale exacto.'
    },

    /* Los números que el alumno toca en la cuadrícula del 1 al 20. */
    grid: {
      startComposite: 'Toca los números compuestos.',
      startPrime: 'Toca los números primos.',
      found: 'Encontrados: {i} de {total}.',
      yesComposite: 'Sí. {n} = {a} × {b}. Es compuesto.',
      yesPrime: 'Sí. {n} es primo: solo tiene dos formas de ponerse en filas.',
      noPrime: 'No. {n} es primo: solo tiene dos formas de ponerse en filas.',
      noComposite: 'No. {n} = {a} × {b}. Es compuesto.',
      noOne: 'No. El 1 no es primo ni compuesto.',
      done: '¡Muy bien! Los has encontrado todos.'
    },

    /* La práctica: un juego a la izquierda de la explicación. */
    practice: {
      start: 'Número de partida',
      pick: 'Elige otro número del 2 al 9.',
      pickAria: 'Multiplicar {a} por {b}',
      result: '{a} × {b} = {m}',
      why: '{m} es compuesto: sale al multiplicar {a} por {b}. Tiene más de dos divisores, así que no es primo.',
      other: 'Otro número de partida'
    }
  }, 'es');
})();
