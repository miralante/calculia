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
      product: '{k} × {d} = {m}',
      times: '{d} × {k} = {m}',
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'El múltiplo sale al multiplicar', text: 'El múltiplo de un número sale al multiplicarlo por otro. 3 × 4 = 12. Por eso 12 es múltiplo de 3 y también de 4.' },
      2: { title: 'Multiplica el 5 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 5.' },
      3: { title: 'Ejemplo: multiplica el 2 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 2.' },
      4: { title: 'Ejemplo: multiplica el 3 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 3.' }
    },

    /* La práctica: un juego a la izquierda de la explicación. */
    practice: {
      start: 'Número de partida',
      pick: 'Elige otro número del 1 al 9.',
      pickAria: 'Multiplicar {a} por {b}',
      result: '{a} × {b} = {m}',
      why: '{m} es múltiplo de {a} y de {b}. El múltiplo de {a} sale al multiplicarlo por {b}.',
      other: 'Otro número de partida'
    }
  }, 'es');
})();
