/* ============================================================
   Calculia — Ordenar números: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Ordenar números',
    instruction: 'Pon los números de menor a mayor.',
    btnStart: 'Empezar',
    menuTitle: 'Pon cada número en su sitio.',
    menuDetail: 'Empiezas con pocos números. Cada ronda sube un poco.',
    btnMenu: 'Volver al inicio',

    /* ---------- Ronda ----------
       {count} = cuántos números hay en esta tanda. */
    promptOrder: 'Ordena estos {count} números. Empieza por el menor.',
    detailOrder: 'Arrastra cada número a su hueco. Si no puedes arrastrar, toca el número y luego el hueco.',
    boardAria: 'Huecos para ordenar los números',
    trayAria: 'Números para colocar',
    pieceAria: 'Número {n}. Tócalo y luego el hueco donde va.',
    slotEmptyAria: 'Hueco {n} de {total}, vacío.',
    slotLockedAria: 'Hueco {n}: {v}, bien colocado.',
    slotWrongAria: 'Hueco {n}: {v}, posición incorrecta.',
    orderSelected: 'Has elegido {n}. Toca el hueco donde va.',
    orderLocked: 'Ese hueco ya tiene su número.',

    /* ---------- Posición incorrecta ----------
       Pistas socráticas: preguntan por el vecino, nunca dan la
       respuesta. */
    orderWrongPlace: 'Posición incorrecta.',
    orderHintLeft: 'Este número es más pequeño que el de tu izquierda.',
    orderHintRight: 'Este número es más grande que el de tu derecha.',
    orderHintCount: 'Cuenta los huecos libres. ¿Cuál de los números que faltan va justo aquí?',
    orderHintDigits: 'Mira las cifras. Un número con más cifras es más grande.',
    orderHintFirst: 'Todos tienen las mismas cifras. Mira la primera cifra de cada número.',

    /* {list} = los números ya en orden, de menor a mayor. */
    orderCorrect: 'Están en orden: {list}.',

    /* Refuerzo: al terminar la ronda, las tandas falladas se repiten. */
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} tandas que has fallado hasta acertarlas todas.',

    roundComplete: '¡Ronda terminada!',
    roundSummary: 'Has ordenado {count} tandas de números. Ahora tienes {stars} estrellas.',
    progress: '{current} de {stars}',

    /* Transferencia: para qué sirve esto fuera de la pantalla. */
    contexto: 'Ordenar números sirve para comparar precios, edades o distancias y saber cuál es el mayor.',
    explicacion: '✅ Para ordenar, mira primero las cifras. El número con más cifras suele ser el mayor.',
    transfer: 'Lo usas cada vez que buscas el precio más bajo o el número más grande de una lista.'
  }, 'es');
})();
