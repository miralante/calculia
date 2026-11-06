/* ============================================================
   Calculia — Textos de Primos y compuestos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'answer.*' son las tres respuestas de la pregunta de clasificar:
   app.js las compara con lo que sale de dividir el número.
   Frases cortas, una idea por frase (UNE 153101). Se dice "repartir" y
   "filas iguales" en vez de "divisor" o "múltiplo".
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔍 Primos y compuestos',
    instructionIntro: 'Mira los números.',

    /* Textos de la pantalla (los comparte el motor assets/js/activity-flow.js). */
    ui: {
      seeReal: 'Verlos en la vida real →',
      realLabel: 'Los primos y los compuestos están en la vida diaria',
      hint: '🤔 Prueba otra vez. ¿Se puede repartir sin que sobre nada?'
    },

    concept: {
      divide: {
        title: 'Repartir sin que sobre nada',
        text: '6 se puede repartir entre 2. Salen 3 cada uno y no sobra nada. El 7 no: entre 2 sobra 1.'
      },
      prime: {
        title: 'Número primo',
        text: 'El 7 es primo. Solo lo puedes poner en una fila de 7 puntos. Con filas iguales de otro tamaño no cuadra.'
      },
      upto10: {
        title: 'Los primos del 1 al 10',
        text: 'Son el 2, el 3, el 5 y el 7. Tienen un anillo para verlos mejor.'
      },
      composite: {
        title: 'Número compuesto',
        text: 'El 6 es compuesto. Lo puedes poner en 2 filas de 3 puntos. También en 3 filas de 2.'
      },
      notPrime: {
        title: 'Se puede escribir como multiplicación',
        text: 'El 4 = 2 × 2. El 6 = 2 × 3. El 9 = 3 × 3. Por eso son compuestos.'
      },
      one: {
        title: 'El 1 no es primo',
        text: 'El 1 es solo 1 punto. No es primo ni compuesto.'
      },
      factors: {
        title: 'Descomponer en primos',
        text: 'Es escribir un número como multiplicación de primos. El 12 = 2 × 2 × 3.'
      }
    },
    real: {
      candies: 'Tienes 7 caramelos. Solo los puedes repartir iguales entre 1 persona o entre 7. El 7 es primo.',
      tiles: 'Tienes 12 baldosas. Las puedes poner en filas de 2, de 3, de 4 o de 6. El 12 es compuesto.',
      clock: 'Un reloj tiene 60 minutos. Se puede partir en 2 mitades, 3 tercios, 4 cuartos o 5 quintos, sin que sobre nada.'
    },
    answer: {
      prime: 'Primo',
      composite: 'Compuesto',
      neither: 'Ni primo ni compuesto'
    },
    gen: {
      classifyPrompt: '¿Este número es primo, compuesto o ninguno de los dos?',
      pickPrompt: '¿Cuál de estos números es primo?',
      factorsPrompt: '¿Cuál es la descomposición en primos de este número?',
      hintClassify: '🤔 ¿Se puede repartir en grupos iguales de otra forma? Prueba con 2, 3 y 5.',
      hintPick: '🤔 Un primo solo se puede poner en una fila. Pruébalos uno a uno.',
      hintFactors: '🤔 Mira si cada número que multiplicas es primo. Multiplícalos y mira si dan el número.'
    }
  }, 'es');
})();
