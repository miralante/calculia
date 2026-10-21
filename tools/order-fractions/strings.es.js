/* ============================================================
   Calculia — Ordenar fracciones: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Las fracciones se escriben como 1/2, 3/4… El engine las
   compara en su valor, nunca por la forma de escribirlas.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🍰 Ordenar fracciones',
    instructionIntro: 'Mira cómo se comparan las fracciones.',
    realTitle: 'Las fracciones están en la vida real.',
    transfer: 'Lo usas para saber qué parte de una pizza, una tarta o una hora es más grande.',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      conceptCount: '{i} de {n}',
      introContinue: 'Ver ejemplos reales →',
      realContinue: 'Empezar a practicar →',
      check: 'Comprobar',
      newRound: 'Otra ronda →',
    },

    /* Questions. {a}, {b}, {rel} are filled in by the engine. The
       comparison is the only question type of this activity. */
    q: {
      promptCompare: '¿Qué signo va entre las dos fracciones?',
      relLess: 'más pequeño que',
      relGreater: 'más grande que',
      relEqual: 'igual a',
      compareAria: 'Dos fracciones: {a} y {b}. ¿Qué signo va entre ellas?',
      explainCompare: '{a} es {rel} {b}.',
      hintCompare: '🤔 Mira qué fracción tiene una parte más grande del entero. Con el mismo denominador, gana la que tiene más partes.',
    },

    level: {
      halves: { name: 'Mitades y cuartos', detail: '1/2 · 1/4 · 3/4…' },
      thirds: { name: 'Tercios y sextos', detail: '1/3 · 2/6 · 5/6…' },
      eighths: { name: 'Octavos y quintos', detail: '1/8 · 2/5 · 7/10…' },
      all: { name: 'Todas las fracciones', detail: 'Cualquier fracción más pequeña que un entero.' }
    },

    concept: {
      1: { title: 'El denominador', text: 'En 1/4, el 4 dice en cuántas partes iguales se parte el entero. Cuantas más partes, más pequeña es cada una: 1/2 es más grande que 1/4, y 1/4 es más grande que 1/8.' },
      2: { title: 'Mismo numerador', text: 'Si las dos tienen el mismo numerador, gana la que tiene partes más grandes. 2/3 es más grande que 2/5, porque un tercio es más grande que un quinto.' },
      3: { title: 'Mismo denominador', text: 'Si las dos tienen el mismo denominador, compara los numeradores. 1/4 es más pequeño que 3/4, porque tiene menos partes.' },
      4: { title: 'Fracciones iguales', text: '1/2 y 2/4 son la misma cantidad. Dos cuartos juntos forman una mitad, así que 1/2 = 2/4.' }
    },

    real: {
      pizza: 'Pizza: 1/3 de pizza es menos que 1/2 de pizza.',
      cake: 'Tarta: 3/4 de tarta es más que 1/2 de tarta.',
      hour: 'Tiempo: 1/4 de hora son 15 minutos; 1/2 hora son 30 minutos.',
      bottle: 'Botellas: 5/6 de botella es más que 1/2 botella.'
    }
  }, 'es');
})();
