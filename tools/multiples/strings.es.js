/* ============================================================
   Calculia — Múltiplos: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en el juego van entre llaves: {d}, {k}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Múltiplos',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Dibujo o multiplicaciones que muestran los múltiplos.',
      product: '{k} × {d} = {m}',
      times: '{d} × {k} = {m}',
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'Un múltiplo sale al multiplicar', text: '3 × 4 = 12. Por eso 12 es múltiplo de 3 y también de 4.' },
      2: { title: 'Multiplica el 5 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 5.' },
      3: { title: 'Ejemplo: multiplica el 2 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 2.' },
      4: { title: 'Ejemplo: multiplica el 3 por 1, 2, 3…', text: 'Cada línea es una multiplicación. El resultado es un múltiplo de 3.' }
    },

    /* La práctica: un juego. Elige un número y toca cada tarjeta para ver el resultado. */
    practice: {
      pick: 'Elige un número.',
      pickAria: 'Múltiplos de {d}',
      title: 'Múltiplos de {d}. Toca cada tarjeta para ver el resultado.',
      card: '{d} × {k} = ?',
      cardAria: '{d} por {k}. Toca para ver el resultado.',
      shown: '{d} × {k} = {m}',
      done: '¡Ya tienes los múltiplos de {d} hasta 10!',
      other: 'Otro número'
    }
  }, 'es');
})();
