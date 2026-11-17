/* ============================================================
   Calculia — Divisores: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en el juego van entre llaves: {a}, {b}, {m}, {k}, {q}, {r}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Divisores',
    btnMenu: 'Volver al inicio',

    ui: {
      visualAria: 'Dibujo o divisiones que muestran los divisores.',
      divide: '{n} ÷ {k} = {q}',
      divideRest: '{n} ÷ {k} = {q}, sobra {r}',
      exactTag: 'división entera',
      restTag: 'no es entera: sobra {r}',
    },

    /* La explicación: una idea por diapositiva. Las divisiones están en data.js. */
    intro: {
      1: { title: 'Un divisor divide exacto', text: '12 ÷ 3 = 4: la división es entera, no sobra nada. Por eso 3 es divisor de 12. En cambio 12 ÷ 5 no es entera: sobra 2.' },
      2: { title: 'Divide el 12 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' },
      3: { title: 'Ejemplo: divide el 6 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' },
      4: { title: 'Ejemplo: divide el 8 entre 1, 2, 3…', text: 'Si la división sale exacta, es divisor. Si sobra, no lo es.' }
    },

    /* La práctica: un juego a la derecha de la explicación. */
    practice: {
      start: 'Yo elijo este número',
      pick: 'Ahora elige tú un número del 1 al 9. Es el divisor.',
      pickAria: 'Dividir {a} entre {b}',
      partner: 'Yo elijo {a} y tú eliges {b}. Dividimos {a} entre {b}:',
      listTitle: 'Las divisiones de {a}:',
      why: '{a} ÷ {b} es una división entera: no sobra nada. Por eso {b} es divisor de {a}.',
      whyNo: '{a} ÷ {b} no es entera: sobra {r}. Por eso {b} no es divisor de {a}.',
      other: 'Otro número de partida'
    }
  }, 'es');
})();
