/* ============================================================
   Calculia — Odd-one-out texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔎 ¿Qué no encaja?',
    instruction: 'Mira los tres dibujos. Toca el que no va con los demás.',
    levelsTitle: 'Elige una actividad',
    question: '¿Cuál no encaja?',
    otherLevel: 'Elegir otra actividad',
    pictureAria: 'Dibujo',
    dibujoAria: 'Dibujo',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has ganado {n} estrellas. Ahora tienes {stars} estrellas.',
    level1Desc: 'Grupos muy distintos',
    level2Desc: 'Grupos parecidos',
    level3Desc: 'Grupos con relación fina',
    rondaCompletadaTitulo: '¡Ronda completada!',
    explicacionCorrecta: '✅ ¡Correcto! Ese es el que no encaja con los demás.',
    explicacionIncorrectaA: '❌ Ese sí encaja con los demás. El que no encaja es: ',
    pista: '🤔 Prueba otra vez. Mira los tres dibujos con calma.',
    /* ---- Pista socrática ----
       `pista` se queda como respaldo de showHint(): era la misma para
       todas las preguntas y no decía nada. Esta dice qué hacer con los
       tres dibujos de esta pregunta y nunca dice cuál es el
       intruso. */
    pistaIntruso: '🤔 Mira si dos de los tres van juntos y cuál se queda fuera.',
    refuerzoTitulo: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    transfer: 'Esto te servirá para encontrar parecidos y diferencias en la vida real: en la compra ("¿esto va con esto?"), al recoger la ropa o al ordenar los cubiertos.'
  }, 'es');
})();
