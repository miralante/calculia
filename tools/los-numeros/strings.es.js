/* ============================================================
   Calculia — Los Números textos (ES)
   Esta actividad NO tiene test. Es un recorrido de
   presentación: 4 tarjetas de tipos + 3 comparaciones +
   4 ejemplos de vida real. Las claves siguen el patrón:
     - intro*: textos de la pantalla 1 (4 tipos)
     - slide<id>Title / slide<id>Body: cada comparación
     - real<id>*: cada tarjeta de vida real
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Los Números',
    titleH1: '🔢 Los Números',

    /* ---- Pantalla 1: cuatro tipos ---- */
    introIntro: 'Toca cada tarjeta para verla con más detalle.',
    introTitle: 'Hay cuatro tipos de números',
    introNaturalTitle: 'Naturales',
    introNaturalBody: 'Cuentan lo que hay. Empiezan en 0 y suben: 0, 1, 2, 3, 4, 5…',
    introNaturalExamples: 'Ejemplos: 0 · 1 · 5 · 12 · 100 · 1.000',
    introEnteroTitle: 'Enteros',
    introEnteroBody: 'Como los naturales, pero también bajan por debajo de 0: …−3, −2, −1, 0, 1, 2…',
    introEnteroExamples: 'Ejemplos: −5 · −1 · 0 · 3 · −12',
    introDecimalTitle: 'Decimales',
    introDecimalBody: 'Tienen una parte pequeña después de la coma: 0,5 es "cero y cinco décimas".',
    introDecimalExamples: 'Ejemplos: 0,5 · 1,25 · 3,14 · 2,7',
    introFraccionTitle: 'Fracciones',
    introFraccionBody: 'Una parte de un todo. Se escriben con un numerador y un denominador: 1/2 es "una de dos partes".',
    introFraccionExamples: 'Ejemplos: 1/2 · 3/4 · 2/5 · 7/8',
    introContinue: 'Ver las comparaciones →',

    /* ---- Pantalla 2: comparaciones (carrusel) ---- */
    slidesIntro: 'Mira cómo se relaciona cada tipo con los naturales.',
    slideNaturalesEnterosTitle: 'Naturales y Enteros',
    slideNaturalesEnterosBody: 'Los naturales son los que sirven para contar (0, 1, 2, 3, 4…). Los enteros añaden los negativos, los que están por debajo de 0 (−1, −2, −3…). Todo natural es también un entero, pero no al revés.',
    slideNaturalesDecimalesTitle: 'Naturales y Decimales',
    slideNaturalesDecimalesBody: 'Los naturales van de uno en uno: 1, 2, 3… Los decimales añaden una parte pequeña: 1,5 es "uno y medio". Sirven para medidas, pesos y precios.',
    slideNaturalesFraccionesTitle: 'Naturales y Fracciones',
    slideNaturalesFraccionesBody: 'Los naturales cuentan unidades enteras: 1, 2, 3 pizzas. Las fracciones cuentan partes de una unidad: 1/4 de pizza, 1/2 de barra de pan.',
    slidesContinue: 'Ver en la vida real →',

    /* Leyendas de los visuales */
    legendNaturales: 'Naturales',
    legendEnteros: 'Enteros (los de debajo de 0)',
    legendDecimales: 'Decimales (entre dos naturales)',
    legendFracciones: 'Fracciones (1 parte de 4)',
    pizzaEntero: '1 pizza',
    pizzaCuarto: '1/4 de pizza',

    /* ---- Pantalla 3: vida real ---- */
    realIntro: 'Cada tipo aparece en la vida diaria. Mira los ejemplos.',
    realContinue: 'Terminar →',
    realNaturalTitle: 'Naturales en la vida real',
    realNaturalIcon: 'Cosas que cuentas enteras: manzanas, dedos, libros, años.',
    realNaturalExamples: '3 manzanas · 5 dedos · 10 niños en clase · 100 años',
    realEnteroTitle: 'Enteros en la vida real',
    realEnteroIcon: 'Cosas que suben y bajan de 0: el termómetro, el ascensor, las cuentas.',
    realEnteroExamples: '−5 °C bajo cero · sótano −1 · 3 plantas arriba · −20 € de deuda',
    realDecimalTitle: 'Decimales en la vida real',
    realDecimalIcon: 'Precios, medidas y pesos: casi todo lo que se mide tiene decimales.',
    realDecimalExamples: '1,99 € · 1,5 m de altura · 0,75 kg de fruta · 3,14 (Pi)',
    realFraccionTitle: 'Fracciones en la vida real',
    realFraccionIcon: 'Partes de algo: pizza, recetas, horas.',
    realFraccionExamples: '1/2 pizza · 1/4 de hora (15 min) · 3/4 de taza · 1/3 de chocolate',

    /* ---- Pantalla final ---- */
    endTitle: '¡Has terminado!',
    endSummary: 'Has repasado los cuatro tipos de números. Ahora tienes {stars} estrellas.',
    btnRepeat: 'Ver otra vez',
    btnMenu: 'Volver al inicio',
    transfer: 'Esto te servirá para saber qué tipo de número tienes delante: en una cuenta, en un precio, en una receta o en un termómetro.'
  }, 'es');
})();
