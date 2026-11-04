/* ============================================================
   Calculia — Máximo común divisor: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian van entre llaves: {a}, {b}, {g}… Se dice "caben exacto" en
   vez de "divisor" cuando se puede.
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
      divisorsOf: 'Números que caben exacto en {n}:',
      right: '✅ ¡Muy bien!',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.'
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'El máximo común divisor (MCD)', text: 'Tienes 12 manzanas y 18 naranjas. Puedes hacer 6 cestas iguales, sin que sobre nada. El MCD de 12 y 18 es 6.' },
      2: { title: 'Números que caben exacto', text: 'El 12 cabe exacto en 1, 2, 3, 4, 6 y 12. El 18 cabe exacto en 1, 2, 3, 6, 9 y 18. Los que caben en los dos están marcados.' },
      3: { title: 'Elige el mayor de los marcados', text: 'El 8 y el 20 tienen en común el 1, el 2 y el 4. El mayor es el 4. Por eso el MCD de 8 y 20 es 4.' },
      4: { title: 'Si uno cabe exacto en el otro, el MCD es el menor', text: 'El 4 cabe exacto en el 12. Por eso el MCD de 4 y 12 es 4.' }
    },

    /* Ejemplos de la vida real: una situación por pantalla. */
    real: {
      1: 'Tienes 8 caramelos de fresa y 20 de limón. Haces bolsas iguales, sin que sobre ninguno. Salen 4 bolsas: en cada una hay 2 de fresa y 5 de limón.',
      2: 'Quieres cubrir un suelo de 12 × 18 cm con baldosas cuadradas iguales, lo más grandes posible. Cada baldosa mide 6 × 6 cm y no sobra ningún trozo.',
      3: 'Tienes 12 libros y 18 cuadernos. Haces lotes iguales, sin que sobre nada. Salen 6 lotes: en cada uno hay 2 libros y 3 cuadernos.'
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      gcd: {
        prompt: '¿Cuál es el MCD de {a} y {b}?',
        hint: '🤔 Busca el mayor número que cabe exacto en los dos.',
        explain: 'El mayor número que cabe exacto en {a} y en {b} es {g}.'
      },
      story: {
        prompt: 'Tienes {a} manzanas y {b} naranjas. ¿Cuál es el mayor número de cestas iguales, sin que sobre nada?',
        hint: '🤔 Prueba cuántas cestas salen con las dos cantidades a la vez.'
      },
      common: {
        prompt: '¿Cuál de estos números cabe exacto en {a} y en {b}?',
        hint: '🤔 Mira si cada número cabe exacto en {a} y también en {b}.',
        explain: '{g} cabe exacto en {a} y en {b}. Es el mayor que lo consigue.'
      }
    }
  }, 'es');
})();
