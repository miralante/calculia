/* ============================================================
   Calculia — Divisores: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en el juego van entre llaves: {n}, {k}, {q}, {r}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Divisores',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Dibujo o divisiones que muestran los divisores.',
      product: '{k} × {d} = {m}',
      divide: '{n} ÷ {k} = {q}',
      divideRest: '{n} ÷ {k} = {q}, sobra {r}',
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'Un divisor divide exacto', text: '12 se reparte en 3 grupos de 4, sin sobrar. Por eso 3 es divisor de 12.' },
      2: { title: 'Divide el 12 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' },
      3: { title: 'Ejemplo: divide el 6 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' },
      4: { title: 'Ejemplo: divide el 8 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' }
    },

    /* La práctica: un juego. Elige un número y toca cada tarjeta para ver la división. */
    practice: {
      pick: 'Elige un número.',
      pickAria: 'Divisores de {n}',
      title: 'Divisores de {n}. Toca cada tarjeta para ver el resultado.',
      card: '{n} ÷ {k} = ?',
      cardAria: '{n} entre {k}. Toca para ver el resultado.',
      done: '¡Listo! Los divisores de {n} hasta 10 son: {list}.',
      other: 'Otro número'
    }
  }, 'es');
})();
