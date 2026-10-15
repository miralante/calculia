/* ============================================================
   Calculia — Coma decimal: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.

   Se escribe la coma decimal en el número, que aparece sin
   separadores. En inglés el mismo juego pone el punto decimal
   (ver strings.en.js).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔢 Poner la coma decimal',
    instruction: 'Pon la coma en su sitio.',
    menuTitle: 'Pon la coma decimal en su sitio.',
    menuDetail: 'Empiezas con números de un decimal. Cada ronda sube un poco.',
    btnStart: 'Empezar',
    btnMenu: 'Volver al inicio',
    check: 'Comprobar',

    /* {count} = cifras decimales del número. */
    promptDecimal: 'Pon la coma decimal: este número tiene {count} cifras decimales.',
    promptDecimalOne: 'Pon la coma decimal: este número tiene 1 cifra decimal.',
    detailDecimal: 'Toca un hueco para poner la coma. Toca otro hueco para moverla, o la coma para quitarla.',

    boardAria: 'Número para colocar la coma decimal',
    gapEmptyAria: 'Hueco vacío: toca para poner la coma.',
    gapFilledAria: 'Coma: toca para quitarla o moverla a otro hueco.',

    missing: 'Todavía no has puesto la coma.',
    /* {k} = cifras que quedan a la derecha de la coma puesta. */
    wrongMarked: 'Revisa la coma marcada con ✗.',
    wrongHint: 'A la derecha de esta coma hay {k} cifras. Cuenta cuántas cifras decimales tiene el número.',

    roundComplete: '¡Ronda terminada!',
    roundSummary: 'Has resuelto {count} ejercicios. Ahora tienes {stars} estrellas.',
    roundProgress: '{current} de {total}',
    correctFormat: 'Se escribe: {n}',

    /* Refuerzo: al terminar la ronda, los fallos se repiten en una
       mini-ronda. Las estrellas ya ganadas no se quitan. */
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir los {n} ejercicios que has fallado hasta acertarlos todos.',

    /* Transferencia: para qué sirve esto fuera de la pantalla. */
    contexto: 'La coma decimal aparece en los precios, en las medidas y en el dinero: 1,50 € o 2,5 kg.',
    explicacion: '✅ La coma separa la parte entera de los decimales. Si cuentas las cifras desde la derecha, siempre sabes dónde va.',
    transfer: 'Esto te servirá para leer precios, medidas y el dinero del día a día.'
  }, 'es');
})();
