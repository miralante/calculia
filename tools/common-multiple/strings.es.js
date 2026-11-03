/* ============================================================
   Calculia — Mínimo común múltiplo: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian van entre llaves: {a}, {b}, {m}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Mínimo común múltiplo',
    btnMenu: 'Volver al inicio',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      count: '{i} de {n}',
      visualAria: 'Dibujo con números u objetos que muestra los múltiplos.',
      seeReal: 'Ver ejemplos reales →',
      realLabel: 'Ejemplos de la vida real',
      startTest: 'Empezar a practicar →',
      review: '← Repasar la explicación',
      multiplesOf: 'Múltiplos de {n}:',
      packs: '{c} paquetes de {s} = {m}',
      right: '✅ ¡Muy bien!',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.'
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'El mínimo común múltiplo (mcm)', text: 'Es el menor número que sale en las dos listas de múltiplos. Es el primero en el que coinciden.' },
      2: { title: 'Paquetes completos de los dos tamaños', text: '12 lápices se pueden repartir en paquetes de 4 y en paquetes de 6, sin que sobre ninguno. Por eso el mínimo común múltiplo (mcm) de 4 y 6 es 12.' },
      3: { title: 'Busca el primero que se repite', text: 'Los múltiplos de 6 son 6, 12, 18 y 24. Los de 8 son 8, 16 y 24. El primero en las dos listas es el 24.' },
      4: { title: 'Si uno es múltiplo del otro, el mínimo común múltiplo (mcm) es el mayor', text: '6 es múltiplo de 3. Por eso el mínimo común múltiplo (mcm) de 3 y 6 es 6.' }
    },

    /* Ejemplos de la vida real: una situación por pantalla. */
    real: {
      1: 'Un autobús pasa cada 4 minutos y otro cada 6. Los dos pasan a la vez a los 12 minutos. Después, vuelven a coincidir cada 12 minutos.',
      2: 'Tienes cajas de 6 huevos y cajas de 8 huevos. Quieres un número de huevos que llene cajas completas de los dos tipos. Son 24: 4 cajas de 6 o 3 cajas de 8.',
      3: 'Una luz roja se enciende cada 6 segundos y una azul cada 9. Las dos se encienden a la vez a los 18 segundos.'
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      lcm: {
        prompt: '¿Cuál es el mínimo común múltiplo de {a} y {b}?',
        hint: '🤔 Escribe los primeros múltiplos de {a} y de {b}. Busca el primero que esté en las dos listas.',
        explain: 'Múltiplos de {a}: {la}. Múltiplos de {b}: {lb}. El primero en las dos listas es {m}.'
      },
      story: {
        prompt: 'Tienes paquetes de {a} caramelos y paquetes de {b} caramelos. ¿Cuál es el menor número de caramelos que forma paquetes completos de los dos tipos?',
        hint: '🤔 Busca el primer número que sale al contar de {a} en {a} y de {b} en {b}.'
      },
      common: {
        prompt: '¿Cuál de estos números es múltiplo de {a} y de {b}?',
        hint: '🤔 Mira si el número sale al contar de {a} en {a}, y también de {b} en {b}.',
        explain: '{m} es múltiplo de {a} y de {b}. Es el primero que sale en las dos listas.'
      }
    }
  }, 'es');
})();
