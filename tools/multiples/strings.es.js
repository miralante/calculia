/* ============================================================
   Calculia — Múltiplos: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en el juego van entre llaves: {a}, {b}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Múltiplos',
    btnMenu: 'Volver al inicio',

    ui: {
      division: '{T} ÷ {d} = {q}',
      remainder: 'sobra {r}',
      yes: 'Sí',
      no: 'No',
      visualAria: 'Dibujo o multiplicaciones que muestran los múltiplos.',
      multipleTag: 'múltiplo de {d}',
    },

    /* La explicación: una idea por diapositiva. Las líneas están en data.js. */
    intro: {
      1: { title: '¿Qué es un múltiplo?', text: 'Un múltiplo de 3 sale al multiplicar 3 por otro número. Por ejemplo, 3 × 2 = 6. Por eso 6 es múltiplo de 3.' },
      2: { title: 'Multiplica el 3 por 1, 2, 3, 4…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 3.' },
      3: { title: 'Multiplica el 5 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 5.' },
      4: { title: 'Ejemplo: multiplica el 2 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 2.' },
      5: { title: 'Ejemplo: multiplica el 3 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 3.' }
    },

    /* La práctica: un juego a la derecha de la explicación. */
    practice: {
      concept: 'Un múltiplo de {a} sale al multiplicar {a} por otro número.',
      ask: 'Toca un número. Lo multiplicamos por {a}.',
      pickAria: 'Multiplicar {a} por {b}',
      why: 'Por eso {m} es múltiplo de {a}.',
      trail: 'Los múltiplos de {a} que ya tienes:',
      other: 'Otro número de partida'
    }
  }, 'es');
})();
