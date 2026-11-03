/* ============================================================
   Calculia — Múltiplos: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {d}, {k}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Múltiplos',
    btnMenu: 'Volver al inicio',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      count: '{i} de {n}',
      visualAria: 'Dibujo con grupos que muestran los múltiplos.',
      product: '{k} × {d} = {m}',
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
      1: { title: 'Un múltiplo sale al multiplicar', text: '3 × 4 = 12. Por eso 12 es múltiplo de 3 y también de 4.' },
      2: { title: 'Múltiplos de 2: 2, 4, 6, 8, 10…', text: 'Salen al multiplicar 2 por 1, 2, 3, 4, 5… Son los números pares.' },
      3: { title: 'Múltiplos de 3: 3, 6, 9, 12…', text: 'Salen al multiplicar 3 por 1, 2, 3, 4… Cada uno sube de 3 en 3.' },
      4: { title: 'Múltiplos de 4: 4, 8, 12, 16…', text: 'Salen al multiplicar 4 por 1, 2, 3, 4… Cada uno sube de 4 en 4.' },
      5: { title: 'Múltiplos de 5: 5, 10, 15, 20…', text: 'Salen al multiplicar 5 por 1, 2, 3, 4… Todos terminan en 0 o en 5.' },
      6: { title: 'Todo número es múltiplo de sí mismo', text: '7 = 1 × 7. Por eso 7 es múltiplo de 7.' },
      7: { title: 'Si no sale exacto, no es múltiplo', text: '13 no es múltiplo de 4. Entre 12 y 16 no hay otro múltiplo de 4.' }
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      pick: {
        prompt: 'Elige el número que es múltiplo de {d}.',
        hint: '🤔 Los múltiplos de {d} salen al multiplicar {d} por 1, 2, 3…',
        explain: '{n} = {k} × {d}: {n} es múltiplo de {d}.'
      },
      first: {
        prompt: '¿Qué número es el múltiplo número {k} de {d}?',
        hint: '🤔 Cuenta de {d} en {d}, paso a paso, hasta el paso {k}.',
        explain: '{d} × {k} = {n}: el múltiplo número {k} de {d} es {n}.'
      },
      yesno: {
        prompt: '¿{n} es múltiplo de {d}?',
        hint: '🤔 Mira si {n} sale al multiplicar {d} por un número entero.',
        yes: '{n} = {k} × {d}: sí es múltiplo.',
        no: '{a} y {b} son múltiplos de {d}. {n} queda entre los dos: no es múltiplo.'
      },
      next: {
        prompt: '{a}, {b}, {c}… ¿Qué número sigue?',
        hint: '🤔 Mira cuánto sube cada vez y súmalo al último.',
        explain: '{c} + {d} = {n}: el siguiente múltiplo de {d}.'
      }
    }
  }, 'es');
})();
