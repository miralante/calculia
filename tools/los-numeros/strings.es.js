/* ============================================================
   Calculia — Los Números textos (ES)
   Galería de 7 slides (4 tipos + 3 comparaciones). Texto
   mínimo: solo el título y, en los slides de tipo, una sola
   línea de "vida real". El visual es la lección.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Tipos de Números',
    titleH1: '🔢 Tipos de Números',

    galleryIntro: 'Mira y pasa las tarjetas.',

    /* ---- Slides de tipo: título + vida real ----
       Cada tipo de número se enseña en dos cards consecutivas:
       una de exposición (visual) y otra de vida real (los ejemplos
       cotidianos). La frase de vida real puede tener varios
       ejemplos separados por « · »; el JS los rompe en una lista. */
    slideNaturalesTitle: 'Naturales',
    slideNaturalesReal: '🧮 3 manzanas · 5 dedos · 10 años',
    slideEnterosTitle: 'Enteros',
    slideEnterosReal: '🌡️ −5 °C · sótano −1 · 3 plantas',
    slideDecimalesTitle: 'Decimales',
    slideDecimalesReal: '💰 1,99 € · 1,5 m · 3,14',
    /* Eyebrow que aparece sobre la lista de ejemplos de vida real. */
    realEyebrow: 'En la vida real:',

    /* ---- Slides de comparación: solo título ---- */
    slideVsEnterosTitle: 'Naturales y Enteros',
    slideVsDecimalesTitle: 'Naturales y Decimales',

    /* ---- Cierre ---- */
    finish: 'Terminar →',
    endTitle: '¡Has terminado!',
    endSummary: 'Has repasado los cuatro tipos de números. Ahora tienes {stars} estrellas.',
    btnRepeat: 'Ver otra vez',
    btnMenu: 'Volver al inicio',
    transfer: 'Esto te servirá para saber qué tipo de número tienes delante: en una cuenta, en un precio, en una receta o en un termómetro.'
  }, 'es');
})();
