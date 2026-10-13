/* ============================================================
   Calculia — Los Números — datos
   Esta actividad NO tiene test. Su contenido son tres slides
   de comparación (naturales vs cada uno de los otros tipos) y
   cuatro tarjetas de "vida real" (una por tipo).
   Las comparaciones y ejemplos de vida real son contenido
   textual que vive en strings.<locale>.js, no aquí. Aquí solo
   queda la ESTRUCTURA: el orden de los slides, el tipo de cada
   visual (recta numérica, pizza, etc.) y el orden de las
   tarjetas de vida real. El texto se lee con App.i18n.t() en
   app.js a partir del id.

   Los visuales se generan en app.js: las rectas numéricas son
   SVG calculado y la pizza es SVG con un par de `<path>`.
   ============================================================ */
var DATA = {
  /* Orden de los slides. Cada uno tiene:
       - id: clave estable para resolver el texto en i18n
       - visual: qué dibujo pintar (recta, zoomDecimal, pizza)
     El título y el cuerpo se leen como
     'slide<id>.title' y 'slide<id>.body'. */
  slides: [
    { id: 'NaturalesEnteros',  visual: 'rectaNE' },
    { id: 'NaturalesDecimales', visual: 'rectaND' },
    { id: 'NaturalesFracciones', visual: 'pizza' }
  ],

  /* Orden de las tarjetas de vida real. Cada una tiene:
       - id: 'natural' | 'entero' | 'decimal' | 'fraccion'
       - emoji: pictograma para la cabecera de la tarjeta
       - iconKey: clave i18n de la línea corta (ej. "Manzanas")
       - examplesKey: clave i18n de los ejemplos */
  real: [
    { id: 'natural',  emoji: '🧮', iconKey: 'realNaturalIcon',   examplesKey: 'realNaturalExamples' },
    { id: 'entero',   emoji: '🌡️', iconKey: 'realEnteroIcon',    examplesKey: 'realEnteroExamples' },
    { id: 'decimal',  emoji: '💰', iconKey: 'realDecimalIcon',   examplesKey: 'realDecimalExamples' },
    { id: 'fraccion', emoji: '🍕', iconKey: 'realFraccionIcon',  examplesKey: 'realFraccionExamples' }
  ]
};
