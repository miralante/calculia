/* ============================================================
   Calculia — Máximo común divisor: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian van entre llaves: {a}, {b}, {g}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔗 Máximo común divisor',
    btnMenu: 'Volver al inicio',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      count: '{i} de {n}',
      visualAria: 'Dibujo con objetos que muestra el reparto.',
      seeReal: 'Ver ejemplos reales →',
      realLabel: 'Ejemplos de la vida real',
      startTest: 'Empezar a practicar →',
      review: '← Repasar la explicación',
      share: 'Caben {g} grupos iguales. En cada grupo hay {x} y {y}.',
      tiles: 'Suelo de {a} × {b} cm, cubierto con baldosas de {g} × {g} cm.',
      divisorsOf: 'Divisores de {n}:',
      right: '✅ ¡Muy bien!',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.'
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'El máximo común divisor (mcd)', text: 'Con 12 manzanas y 18 naranjas hacemos 6 cestas iguales. Nada sobra. Por eso el máximo común divisor (mcd) de 12 y 18 es 6.' },
      2: { title: 'Los divisores son los números que dividen exacto', text: 'Los divisores de 12 son 1, 2, 3, 4, 6 y 12. Los de 18 son 1, 2, 3, 6, 9 y 18. Los que están en las dos listas están marcados.' },
      3: { title: 'El mayor de los que están en las dos listas', text: 'Los que están en las dos listas de 8 y 20 son 1, 2 y 4. El mayor es el 4. Por eso el máximo común divisor (mcd) de 8 y 20 es 4.' },
      4: { title: 'Si uno divide al otro, el máximo común divisor (mcd) es el menor', text: 'El 4 divide al 12. Por eso el máximo común divisor (mcd) de 4 y 12 es 4.' }
    },

    /* Ejemplos de la vida real: una situación por pantalla. */
    real: {
      1: 'Tienes 8 caramelos de fresa y 20 de limón. Haces bolsas iguales, sin que sobre ninguno. Salen 4 bolsas, con 2 de fresa y 5 de limón en cada una.',
      2: 'Quieres cubrir un suelo de 12 × 18 cm con baldosas cuadradas iguales, lo más grandes posible. Cada baldosa mide 6 × 6 cm y no sobra ningún trozo.',
      3: 'Tienes 12 libros y 18 cuadernos. Haces lotes iguales, sin que sobre nada. Salen 6 lotes, con 2 libros y 3 cuadernos en cada uno.'
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      gcd: {
        prompt: '¿Cuál es el máximo común divisor de {a} y {b}?',
        hint: '🤔 Escribe los divisores de {a} y de {b}. Busca el mayor que esté en las dos listas.',
        explain: 'Divisores de {a}: {la}. Divisores de {b}: {lb}. El mayor en las dos listas es {g}.'
      },
      story: {
        prompt: 'Tienes {a} manzanas y {b} naranjas. ¿Cuál es el mayor número de cestas iguales, sin que sobre nada?',
        hint: '🤔 Piensa en cuántas cestas caben con las dos cantidades a la vez, sin que sobre nada.'
      },
      common: {
        prompt: '¿Cuál de estos números divide a {a} y a {b} sin que sobre nada?',
        hint: '🤔 Prueba cada número: ¿sale exacto con {a} y también con {b}?',
        explain: '{g} divide a {a} y a {b}. Es el mayor que lo consigue.'
      }
    }
  }, 'es');
})();
