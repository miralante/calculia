/* ============================================================
   Calculia — Textos de Mínimo común múltiplo (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga desde index.html según App.i18n.locale().
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔁 Mínimo común múltiplo',
    instructionIntro: 'Lee la explicación.',
    introContinue: 'Empezar a practicar →',
    intro: {
      title: 'Mínimo común múltiplo',
      text: 'Es el menor número que es múltiplo de los dos a la vez. Por ejemplo, para el 4 y el 6: los múltiplos del 4 son 4, 8, 12, 16... Los del 6 son 6, 12, 18... El primero que aparece en las dos listas es el 12.'
    },
    check: 'Comprobar',
    newRound: 'Otra ronda →',
    btnMenu: 'Volver al inicio',
    hint: '🤔 Prueba otra vez. Piensa en los múltiplos.',
    gen: {
      prompt: '¿Cuál es el mínimo común múltiplo de {a} y {b}?',
      hint: '🤔 Escribe los primeros múltiplos de {a} y de {b}. Busca el primero que aparezca en las dos listas.'
    }
  }, 'es');
})();
