/* ============================================================
   Calculia — Patterns texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Patrones',
    titleH1: '🔵 Patrones',
    instruction: 'Mira la serie. Elige lo que sigue.',
    chooseLevel: 'Elige una actividad',
    whatNext: '¿Qué sigue?',
    queSigueAudio: '¿Qué sigue?',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has ganado {n} estrellas. Ahora tienes {stars} estrellas.',
    chooseOtherLevel: 'Elegir otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! Después de la serie viene: ',
    explicacionIncorrectaA: '❌ Eso no sigue el patrón. Lo que sigue es: ',
    pista: '🤔 Prueba otra vez. Mira la serie con calma.',

    /* ---- Pistas socráticas, una por tipo de serie ----
       `pista` se queda como respaldo de showHint(). Cada nivel
       construye la serie de otra manera, así que su pista dice qué
       mirar en esa fila de dibujos: los que se turnan, el grupo que
       se repite, la cuenta de los números o la letra que va con cada
       símbolo. Ninguna dice qué va después. */
    pistaParejas: '🤔 Mira qué dos dibujos se van turnando una y otra vez.',
    pistaGrupos: '🤔 Mira qué se repite: el grupo de dibujos o el tamaño del círculo.',
    pistaNumeros: '🤔 Mira cuánto suma o baja el número cada vez.',
    pistaCodigo: '🤔 Mira qué letra acompaña siempre a cada símbolo.',
    refuerzoTitulo: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    transfer: 'Esto te servirá para reconocer patrones del día a día: los días de la semana, el orden de la rutina, las rayas del pijama o los azulejos del baño.'
  }, 'es');
})();
