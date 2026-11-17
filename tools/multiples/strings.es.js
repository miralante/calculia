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
      1: { title: 'Un múltiplo sale al multiplicar', text: 'Un múltiplo sale al multiplicar un número por otro. 3 × 4 = 12. Por eso 12 es múltiplo de 3 y también de 4.' },
      2: { title: 'Multiplica el 5 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 5.' },
      3: { title: 'Ejemplo: multiplica el 2 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 2.' },
      4: { title: 'Ejemplo: multiplica el 3 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado marcado es un múltiplo de 3.' }
    },

    /* La práctica: un juego a la derecha de la explicación. */
    practice: {
      start: 'Yo elijo este número',
      pick: 'Ahora elige tú otro número del 1 al 9.',
      pickAria: 'Multiplicar {a} por {b}',
      partner: 'Yo elijo {a} y tú eliges {b}. Multiplicamos {a} por {b}:',
      listTitle: 'Los múltiplos de {a}:',
      result: '{a} × {b} = {m}',
      why: '{m} es múltiplo de {a} y de {b}. El múltiplo de {a} sale al multiplicarlo por {b}.',
      other: 'Otro número de partida'
    }
  }, 'es');
})();
