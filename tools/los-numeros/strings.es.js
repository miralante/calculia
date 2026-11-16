/* ============================================================
   Calculia — Los Números textos (ES)
   Galería de 10 slides (5 tipos + 2 comparaciones). Texto
   mínimo: solo el título y, en los slides de tipo, una sola
   línea de "vida real". El visual es la lección.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    slideNaturalesTitle: 'Naturales',
    slideNaturalesReal: '3 manzanas · 5 dedos · 10 años',
    slideEnterosTitle: 'Enteros',
    slideEnterosReal: '−5 °C · sótano −1 · 3 plantas',
    slideFraccionesTitle: 'Fracciones',
    slideFraccionesReal: '1/2 pizza · 1/4 de hora',
    slideDecimalesTitle: 'Decimales',
    slideDecimalesReal: '1,99 € · 1,5 m · 3,14',

    /* Características de cada tipo: se muestran en la card de
       exposición, debajo del dibujo. Cada rasgo va separado por « · ». */
    slideNaturalesTraits: 'Nunca son negativos · No tienen decimales',
    slideEnterosTraits: 'Pueden ser negativos · El 0 separa los negativos de los positivos · No tienen decimales',
    slideFraccionesTraits: 'Son una parte de algo dividido en partes iguales · Se escriben así: 3/4 · Arriba: las partes que tienes · Abajo: en cuántas partes iguales se divide el todo',
    slideDecimalesTraits: 'Tienen una coma (,) · Lo que va después de la coma vale menos de 1',
    traitsEyebrow: 'Sus características:',
    slideVsEnterosTitle: 'Naturales y Enteros',
    slideVsDecimalesTitle: 'Naturales y Decimales',
    title: 'Tipos de Números',
    titleH1: '🔢 Tipos de Números',

    galleryIntro: 'Mira y pasa las tarjetas.',
    slideCount: '{i} de {n}',

    /* ---- Slides de tipo: título + vida real ----
       Cada tipo de número se enseña en dos cards consecutivas:
       una de exposición (visual) y otra de vida real (los ejemplos
       cotidianos). La frase de vida real puede tener varios
       ejemplos separados por « · »; el JS los rompe en una lista. */
    /* Etiquetas dentro del SVG de la pizza de fracciones. */
    fraccionOneHalf: '1/2',

    /* Eyebrow que aparece sobre la lista de ejemplos de vida real. */
    realEyebrow: 'En la vida real:',

    /* ---- Slides de comparación: solo título ---- */

    /* ---- Cierre ---- */
    finish: 'Terminar →',
    endTitle: '¡Has terminado!',
    endSummary: 'Has repasado los cuatro tipos de números. Ahora tienes {stars} {starsWord}.',
    btnMenu: 'Volver al inicio',
    transfer: 'Esto te servirá para saber qué tipo de número tienes delante: en una cuenta, en un precio, en una receta o en un termómetro.'
  }, 'es');
})();
