/* ============================================================
   Calculia — Números factoriales: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   Frases cortas, una idea por frase (UNE 153101). Los números que
   cambian en las preguntas van entre llaves: {n}, {T}, {chain}…
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '❗ Números factoriales',
    instruction: 'Aprende qué significa el signo «!».',
    btnMenu: 'Volver al inicio',

    /* Para qué sirve fuera de la app (SPEC §3.6, clave contexto). */
    contextTitle: 'Para qué sirve',
    context: 'Los factoriales cuentan de cuántas formas se pueden ordenar las cosas.',

    ui: {
      reviewRule: 'Repasar la regla',
      backToPractice: 'Volver a la práctica →',
      realLabel: 'Ejemplos de la vida real',
      roundDone: 'Has terminado la ronda: {n} de {total} a la primera. Tienes {stars} ⭐.',
      visualAria: 'Dibujo que explica el factorial con números y cajas.',
      noRest: 'Todas las divisiones salen exactas: no sobra nada.',
      hintPrefix: '💡 ',
      wrongPrefix: 'Mira cómo se resuelve. '
    },

    /* Explicación en slides con dibujo. */
    intro: {
      1: { title: '¿Qué es un factorial?', text: '4! se lee «4 factorial». Es multiplicar 4 × 3 × 2 × 1. El resultado es 24.' },
      2: { title: 'Crece muy deprisa', text: '1! = 1, 2! = 2, 3! = 6, 4! = 24, 5! = 120. Cada paso multiplica por un número más. Por acuerdo, 0! = 1.' },
      3: { title: 'Sirve para la divisibilidad', text: '5! = 120. Entre 1, 2, 3, 4 y 5 se divide exacto: no sobra nada. Por eso los factoriales ayudan a entender la divisibilidad.' }
    },

    /* Ejemplos de la vida real. */
    real: {
      1: '3 amigos se ponen en fila para una foto. Hay 6 formas distintas de ponerse.',
      2: 'Tienes 4 libros para un estante. Los puedes colocar de 24 formas distintas.',
      3: '5 amigos se sientan en un banco. Hay 120 formas distintas de sentarse.'
    },

    /* La práctica: pregunta, pista (primer fallo), explicación. */
    q: {
      value: {
        prompt: '¿Cuánto vale {n}!?',
        hint: 'Multiplica, no sumes. Sigue bajando hasta el 1.',
        explain: '{chain} = {T}.'
      },
      meaning: {
        prompt: '¿Qué significa {n}!?',
        hint: 'El signo ! quiere decir: multiplica desde ese número hasta el 1.',
        explain: '{n}! = {chain}.'
      },
      slots: {
        prompt: '¿De cuántas formas se pueden poner {n} amigos en fila?',
        hint: 'Para el primer sitio hay {n} opciones. Para el segundo, una menos. Así hasta el último.',
        explain: '{chain} = {T} formas.'
      },
      divides: {
        prompt: '¿Entre cuál de estos números se divide exacto {n}!?',
        hint: 'Divide {T} entre cada número. El que no deja nada sobrando es la respuesta.',
        explain: '{T} ÷ {k} = {g}, sin nada sobrando.'
      }
    },

    /* Cierre: resumen, lo practicado y la frase de transferencia (SPEC §3.8). */
    recap: 'Recuerda: 4! = 4 × 3 × 2 × 1 = 24, y 0! = 1.',
    transfer: 'Los factoriales sirven para contar las formas de ordenar cosas: en una fila, en un estante o en un banco.'
  }, 'es');
})();
