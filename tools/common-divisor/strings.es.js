/* ============================================================
   Calculia — Textos de Máximo común divisor (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔗 Máximo común divisor',
    instructionIntro: 'Lee la explicación.',
    introContinue: 'Empezar a practicar →',
    intro: {
      title: 'Máximo común divisor',
      text: 'Es el mayor número que divide a dos números a la vez, sin que sobre nada. Por ejemplo, para el 12 y el 18: los divisores del 12 son 1, 2, 3, 4, 6 y 12. Los del 18 son 1, 2, 3, 6, 9 y 18. Los que están en las dos listas son 1, 2, 3 y 6. El mayor es el 6.'
    },
    check: 'Comprobar',
    newRound: 'Otra ronda →',
    btnMenu: 'Volver al inicio',
    hint: '🤔 Prueba otra vez. Piensa en los divisores.',
    gen: {
      prompt: '¿Cuál es el máximo común divisor de {a} y {b}?',
      hint: '🤔 Escribe los divisores de {a} y de {b}. Busca el mayor que aparezca en las dos listas.'
    }
  }, 'es');
})();
