/* ============================================================
   Calculia — Textos de Primos y compuestos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html. Primero los compuestos, luego los primos.
   'answer.*' son las tres respuestas de la pregunta de clasificar:
   app.js las compara con lo que sale de repartir el número en filas.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    btnMenu: 'Volver al inicio',
    title: '🔍 Primos y compuestos',
    instructionIntro: 'Toca los números y mira qué pasa.',

    /* Textos de la pantalla (los comparte el motor assets/js/activity-flow.js). */
    ui: {
      seeReal: 'Verlos en la vida real →',
      realLabel: 'Los primos y los compuestos están en la vida diaria',
      hint: '🤔 Prueba otra vez. ¿Se puede repartir sin que sobre nada?',
      product: '{k} × {d} = {m}',
      hintPrefix: '💡 ',
      wrongPrefix: '❌ Mira: ',
      rightPrefix: '✅ ¡Correcto! '
    },

    /* La explicación: una idea por diapositiva. Los compuestos van primero. */
    concept: {
      composite: {
        title: 'Número compuesto',
        text: 'Toca un número de filas. Si no sobra ningún punto, las filas salen iguales. El 6 sale en 2 filas de 3, así que es compuesto.'
      },
      compositeMult: {
        title: 'Se puede escribir como multiplicación',
        text: '4 = 2 × 2. 6 = 2 × 3. 8 = 2 × 4. 9 = 3 × 3. Todos son compuestos.'
      },
      factorTree: {
        title: 'Se descompone en primos',
        text: 'Un compuesto se puede escribir como multiplicación de primos. El 12 = 2 × 2 × 3.'
      },
      compositeGrid: {
        title: 'Encuentra los compuestos',
        text: 'Toca los números compuestos del 1 al 20. El 1 y los primos no son compuestos.'
      },
      prime: {
        title: 'Número primo',
        text: 'Toca un número de filas. El 7 solo sale en 1 fila de 7, o en 7 filas de 1. Por eso es primo.'
      },
      one: {
        title: 'El 1 no es primo ni compuesto',
        text: 'El 1 es un solo punto. No tiene dos formas de ponerse en filas, así que no es primo. Tampoco es compuesto.'
      },
      primeGrid: {
        title: 'Encuentra los primos',
        text: 'Toca los números primos del 1 al 20. Los compuestos y el 1 no son primos.'
      }
    },

    /* Los ejemplos de la vida real. */
    real: {
      candies: 'Tienes 7 caramelos. Solo los puedes repartir iguales entre 1 persona o entre 7. El 7 es primo.',
      tiles: 'Tienes 12 baldosas. Las puedes poner en filas de 2, de 3, de 4 o de 6. El 12 es compuesto.',
      clock: 'Un reloj tiene 60 minutos. Se puede partir en 2 mitades, 3 tercios, 4 cuartos o 5 quintos, sin que sobre nada.'
    },

    /* Las filas que el alumno elige en la diapositiva. */
    rows: {
      ask: '¿En cuántas filas lo pones?',
      aria: 'Poner en {r} filas',
      exact: '{n} = {r} × {c}. Sale exacto.',
      left: 'Con {r} filas sobran {left} puntos. No sale exacto.',
      leftOne: 'Con {r} filas sobra 1 punto. No sale exacto.'
    },

    /* Los números que el alumno toca en la cuadrícula del 1 al 20. */
    grid: {
      startComposite: 'Toca los números compuestos.',
      startPrime: 'Toca los números primos.',
      found: 'Encontrados: {i} de {total}.',
      yesComposite: 'Sí. {n} = {a} × {b}. Es compuesto.',
      yesPrime: 'Sí. {n} es primo: solo tiene dos formas de ponerse en filas.',
      noPrime: 'No. {n} es primo: solo tiene dos formas de ponerse en filas.',
      noComposite: 'No. {n} = {a} × {b}. Es compuesto.',
      noOne: 'No. El 1 no es primo ni compuesto.',
      done: '¡Muy bien! Los has encontrado todos.'
    },

    answer: {
      prime: 'Primo',
      composite: 'Compuesto',
      neither: 'Ni primo ni compuesto'
    },

    /* La prueba: enunciado, pista (sin dar la respuesta) y explicación al acertar. */
    q: {
      classify: {
        prompt: '¿El {n} es primo, compuesto o ninguno de los dos?',
        hint: 'Intenta ponerlos en filas iguales. ¿Salen de más de una forma?',
        visualAria: '{n} puntos.',
        prime: '{n} solo sale en 1 fila de {n}, o en {n} filas de 1. Es primo.',
        composite: '{n} = {a} × {b}: sale en filas iguales. Es compuesto.',
        neither: 'El 1 es un solo punto. No es primo ni compuesto.'
      },
      pick: {
        prompt: '¿Cuál de estos números es primo?',
        hint: 'Un primo solo tiene dos formas de ponerse en filas. Pruébalos uno a uno.',
        explain: '{p} es primo. Los otros son compuestos.'
      },
      factors: {
        prompt: '¿Cuál es la descomposición en primos de {n}?',
        hint: 'Mira si cada número de la multiplicación es primo. Multiplícalos: ¿sale {n}?',
        explain: '{n} = {f}. Todos son primos, y al multiplicarlos sale {n}.'
      }
    }
  }, 'es');
})();
