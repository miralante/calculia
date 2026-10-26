/* ============================================================
   Calculia — Textos de Primos y compuestos (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'answer.*' son las tres respuestas de la pregunta de clasificar:
   app.js las compara con lo que sale de dividir el número.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔍 Primos y compuestos',
    instructionIntro: 'Mira los números.',
    introContinue: 'Verlos en la vida real →',
    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    concept: {
      prime: {
        title: 'Número primo',
        text: 'Un número primo solo se puede dividir entre 1 y entre sí mismo, sin que sobre nada. Por ejemplo, el 7 solo se puede poner en una fila de 7 puntos.'
      },
      upto10: {
        title: 'Los primos hasta el 10',
        text: 'Son cuatro: el 2, el 3, el 5 y el 7. El 1 no es primo. El 4, el 6, el 8, el 9 y el 10 sí se pueden dividir entre otros números.'
      },
      composite: {
        title: 'Número compuesto',
        text: 'Un número compuesto se puede dividir entre otros números, sin que sobre nada. Por ejemplo, el 6 se puede poner en 2 filas de 3 puntos.'
      },
      notPrime: {
        title: 'Ejemplos que no son primos',
        text: 'El 4 = 2 × 2. El 6 = 2 × 3. El 8 = 2 × 2 × 2. El 9 = 3 × 3. El 10 = 2 × 5. Todos se pueden escribir como multiplicación.'
      },
      one: {
        title: 'El 1',
        text: 'El 1 solo tiene un divisor: él mismo. Por eso no es primo ni compuesto.'
      },
      factors: {
        title: 'Factorizar',
        text: 'Es escribir un número como multiplicación de números primos. Por ejemplo: 12 = 2 × 2 × 3.'
      }
    },
    realTitle: 'Los primos y los compuestos están en la vida diaria',
    realContinue: 'Empezar a practicar →',
    real: {
      candies: 'Tienes 7 caramelos. Solo los puedes repartir iguales entre 1 o entre 7 personas. El 7 es primo.',
      tiles: 'Tienes 12 baldosas. Las puedes poner en filas de 2, de 3, de 4 o de 6. El 12 es compuesto.',
      clock: 'Un reloj tiene 60 minutos: 60 = 2 × 2 × 3 × 5. Por eso se parte en mitades, tercios, cuartos y quintos, y siempre sale exacto.'
    },
    answer: {
      prime: 'Primo',
      composite: 'Compuesto',
      neither: 'Ni primo ni compuesto'
    },
    check: 'Comprobar',
    newRound: 'Otra ronda →',
    btnMenu: 'Volver al inicio',
    hint: '🤔 Prueba otra vez. Piensa en los divisores.',
    transfer: 'Esto te servirá para repartir cosas en grupos iguales y para simplificar fracciones.',
    gen: {
      classifyPrompt: '¿Este número es primo, compuesto o ninguno de los dos?',
      pickPrompt: '¿Cuál de estos números es primo?',
      factorsPrompt: '¿Cuál es la descomposición en primos de este número?',
      hintClassify: '🤔 ¿Se puede dividir entre otro número, además de 1 y de sí mismo? Prueba con 2, 3 y 5.',
      hintPick: '🤔 Un número primo solo se divide entre 1 y entre sí mismo. Pruébalos uno a uno.',
      hintFactors: '🤔 Mira si cada número que multiplicas es primo. Multiplícalos para comprobar que dan el número.'
    }
  }, 'es');
})();
