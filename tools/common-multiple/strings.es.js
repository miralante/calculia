/* ============================================================
   Calculia — Mínimo común múltiplo: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian van entre llaves: {a}, {b}, {m}… Se dice "contar de 4 en 4"
   en vez de "múltiplos" cuando se puede.
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
      visualAria: 'Dibujo con números u objetos que muestra los saltos al contar.',
      seeReal: 'Ver ejemplos reales →',
      realLabel: 'Ejemplos de la vida real',
      startTest: 'Empezar a practicar →',
      review: '← Repasar la explicación',
      multiplesOf: 'Al contar de {n} en {n}:',
      packs: '{c} paquetes de {s} = {m}',
      right: '✅ ¡Muy bien!',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Ahora tienes {stars} estrellas.'
    },

    /* La explicación: una idea por diapositiva. El dibujo está en data.js. */
    intro: {
      1: { title: 'El mínimo común múltiplo (MCM)', text: 'Es el primer número que sale al contar de 4 en 4 y también al contar de 6 en 6.' },
      2: { title: 'Paquetes completos de los dos tamaños', text: '12 lápices caben en paquetes de 4 y en paquetes de 6, sin que sobre ninguno. El MCM de 4 y 6 es 12.' },
      3: { title: 'Cuenta hasta el primero que coincide', text: 'Al contar de 6 en 6: 6, 12, 18, 24. Al contar de 8 en 8: 8, 16, 24. El primero que sale en los dos es el 24.' },
      4: { title: 'Si uno sale al contar del otro, el MCM es el mayor', text: '6 sale al contar de 3 en 3. Por eso el MCM de 3 y 6 es 6.' }
    },

    /* Ejemplos de la vida real: una situación por pantalla. */
    real: {
      1: 'Un autobús pasa cada 4 minutos y otro cada 6. Los dos pasan a la vez a los 12 minutos. Después vuelven a coincidir cada 12 minutos.',
      2: 'Tienes cajas de 6 huevos y cajas de 8 huevos. Quieres un número de huevos que llene cajas completas de los dos tipos. Son 24: 4 cajas de 6 o 3 cajas de 8.',
      3: 'Una luz roja se enciende cada 6 segundos y una azul cada 9. Las dos se encienden a la vez a los 18 segundos.'
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      lcm: {
        prompt: '¿Cuál es el MCM de {a} y {b}?',
        hint: '🤔 Cuenta de {a} en {a} y de {b} en {b}. ¿Qué número sale en los dos?',
        explain: 'El primer número que sale al contar de {a} en {a} y de {b} en {b} es {m}.'
      },
      story: {
        prompt: 'Tienes paquetes de {a} caramelos y paquetes de {b} caramelos. ¿Cuál es el menor número de caramelos que forma paquetes completos de los dos tipos?',
        hint: '🤔 Cuenta de {a} en {a} y de {b} en {b}. ¿Cuál es el primero que coincide?'
      },
      common: {
        prompt: '¿Cuál de estos números sale al contar de {a} en {a} y también de {b} en {b}?',
        hint: '🤔 Mira si el número sale al contar de {a} en {a}, y también de {b} en {b}.',
        explain: '{m} sale al contar de {a} en {a} y de {b} en {b}. Es el primero que coincide.'
      }
    }
  }, 'es');
})();
