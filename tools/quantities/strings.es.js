/* ============================================================
   Calculia — Quantities texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '👀 Cantidades',
    instruction: 'Lee y escribe números hasta mil millones.',
    choosePractice: 'Elige qué quieres practicar.',

    /* Names and descriptions of the menu (one entry per practice).
       Keys follow the '<id>Name' / '<id>Detail' pattern so the
       menu API does not change. */
    readName: 'Leer números',
    readDetail: 'Mira el número y escríbelo.',
    writeName: 'Escribir números',
    writeDetail: 'Escucha el número y escríbelo.',
    pointsName: 'Poner los puntos',
    pointsDetail: 'Separa los millares con puntos.',
    decomposeName: 'Descomponer',
    decomposeDetail: 'Mira el color de cada cifra.',

    /* Prompts (main text of the exercise).
       {n} = number already formatted to display. {nRaw} = number
       without separator. {placeLabel} = label of the position
       being asked. */
    promptRead: 'Escribe este número: {n}',
    promptWrite: 'Escribe el número que oyes.',
    promptPoints: 'Escribe este número con sus puntos: {nRaw}',
    promptDecompose: '¿Qué cifra es la de {placeLabel} en {n}?',

    /* Short hints below the prompt. They reinforce the goal of
       each mode. */
    detailRead: 'Copia las cifras. Añade el punto cada tres, si toca.',
    detailWrite: 'Pulsa 🔊 si necesitas escucharlo otra vez.',
    detailPoints: 'Cuenta tres cifras desde la derecha y pon el punto.',
    detailDecompose: 'Mira el color de cada cifra.',

    /* Failure reinforcement: after the round, failed exercises are
       replayed in a mini-round until every one is answered right.
       Stars already earned stay (rule 5: mistakes are never punished). */
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir los {n} ejercicios que has fallado hasta acertarlos todos.',
    reinforceDone: '¡Refuerzo terminado! Ya los tienes todos.',

    /* Hints (Socratic) after a miss. */
    hintRead: 'Cuenta las cifras. Si hay cuatro o más, agrúpalas de tres desde la derecha.',
    hintWrite: 'Pulsa 🔊 y escribe lo que oigas.',
    hintPoints: 'El punto va cada tres cifras, empezando por la derecha.',
    hintDecompose: 'Fíjate en el color de la cifra preguntada.',

    /* Position labels for decompose. */
    posU: 'unidades',
    posD: 'decenas',
    posC: 'centenas',
    posUM: 'unidades de millar',
    posDM: 'decenas de millar',
    posCM: 'centenas de millar',
    posUMM: 'unidades de millón',
    posDMM: 'decenas de millón',
    posCMM: 'centenas de millón',
    posUMMM: 'unidades de mil millones',

    /* Label for the legend. */
    legendTitle: 'Color por posición:',

    /* Common buttons */
    check: 'Comprobar',
    chooseAnother: 'Elegir otra práctica',
    roundComplete: '¡Ronda terminada!',
    roundSummary: 'Has resuelto {count} ejercicios. Ahora tienes {stars} estrellas.',
    progress: '{current} de {total}',

    /* Aria-labels */
    audioAria: 'Escuchar el número',
    answerInputAria: 'Escribe el número',
    answerOptionsAria: 'Opciones de respuesta',

    /* Reinforcement after a correct answer in typing mode */
    correctFormat: 'Se escribe: {n}',

    /* Pedagogical transfer */
    transfer: 'Esto te servirá para leer precios, noticias o cualquier número grande del día a día.',

    /* Residual hint (used by round-end fallback) */
    hint: '🤔 Lee el número en voz alta y luego escríbelo.',
    transferencia: 'Esto te servirá para leer precios, noticias o cualquier número grande del día a día.'
  }, 'es');
})();
