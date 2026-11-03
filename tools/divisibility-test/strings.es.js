/* ============================================================
   Calculia — Divisibilidad: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {d}, {q}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✅ Divisibilidad',
    btnMenu: 'Volver al inicio',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      count: '{i} de {n}',
      visualAria: 'Dibujo con puntos que muestra el reparto en grupos.',
      division: '{T} ÷ {d} = {q}',
      remainder: 'sobra {r}',
      yes: 'Sí',
      no: 'No',
      right: '✅ ¡Muy bien!',
      review: '← Repasar la explicación',
      startTest: 'Empezar a practicar →',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.'
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'Divisible: no sobra nada', text: '12 entre 3: salen 4 grupos y no sobra nada. Por eso 12 es divisible entre 3.' },
      2: { title: 'No divisible: sobra algo', text: '13 entre 3: salen 4 grupos y sobra 1. Por eso 13 no es divisible entre 3.' },
      3: { title: 'Divisible entre 2: termina en cifra par', text: 'Las cifras pares son 0, 2, 4, 6 y 8. 14 termina en 4: se divide exacto entre 2.' },
      4: { title: 'Divisible entre 5: termina en 0 o en 5', text: '15 termina en 5: se divide exacto entre 5. Si termina en otra cifra, no.' },
      5: { title: 'Divisible entre 10: termina en 0', text: '30 termina en 0: se divide exacto entre 10. Si termina en otra cifra, no.' },
      6: { title: 'Divisible entre 3: suma las cifras', text: 'Suma las cifras de 12: 1 + 2 = 3. Como 3 se divide entre 3, 12 también.' },
      7: { title: 'Si la suma no se divide entre 3, tampoco', text: 'Suma las cifras de 14: 1 + 4 = 5. Como 5 no se divide entre 3, 14 no es divisible entre 3.' }
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      pick: {
        prompt: 'Elige el número que se divide exacto entre {d}.',
        hint: '🤔 Usa la regla de {d} o haz la división: ¿sobra algo?',
        explain: '{n} se divide exacto entre {d}: no sobra nada.'
      },
      yesno: {
        prompt: '¿Se divide exacto {n} entre {d}?',
        hint: '🤔 Haz la división y mira si sobra algo.',
        yes: '{n} ÷ {d} = {q}: no sobra nada. Sí se divide.',
        no: '{n} ÷ {d} = {q} y sobra {r}. No se divide exacto.'
      },
      sum: {
        prompt: 'Suma las cifras de {n}. ¿Se divide exacto entre 3?',
        hint: '🤔 Suma las cifras una a una. ¿Ese total se divide entre 3?',
        yes: 'Las cifras suman {s}. {s} se divide entre 3, así que {n} sí se divide entre 3.',
        no: 'Las cifras suman {s}. {s} no se divide entre 3, así que {n} no se divide entre 3.'
      },
      rest: {
        prompt: '¿Cuánto sobra al dividir {n} entre {d}?',
        hint: '🤔 Busca el múltiplo de {d} que está antes de {n}, sin pasarte.',
        explain: '{n} ÷ {d} = {q}, y sobra {r}.',
        none: '{n} ÷ {d} = {q}: no sobra nada.'
      }
    }
  }, 'es');
})();
