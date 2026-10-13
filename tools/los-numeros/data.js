/* ============================================================
   Calculia — Los Números — datos
   Banco de preguntas: identificar el tipo de un número entre
   Naturales, Enteros, Decimales y Fracciones.
   El mismo banco sirve para los dos idiomas: los enunciados y
   las opciones se construyen en app.js a partir de los slugs
   'natural', 'entero', 'decimal', 'fraccion' y la lista de
   números/expresiones, y los nombres de cada tipo se traducen
   con App.i18n.t('gen.natural'), etc.
   ============================================================ */
var DATA = {
  perRound: 6,

  /* Banco de números/expresiones. Cada item lleva el id del tipo
     correcto. Para evitar una sola "trampa" repetida 6 veces, la
     baraja se construye de manera que las 4 categorías aparezcan
     mezcladas y, salvo en rondas muy cortas, todas salgan. */
  bank: [
    /* Naturales: 0, 1, 5, 12, 100, 1000 */
    { id: 'n0',    tipo: 'natural',  display: '0' },
    { id: 'n1',    tipo: 'natural',  display: '1' },
    { id: 'n5',    tipo: 'natural',  display: '5' },
    { id: 'n12',   tipo: 'natural',  display: '12' },
    { id: 'n100',  tipo: 'natural',  display: '100' },
    { id: 'n1000', tipo: 'natural',  display: '1.000' },

    /* Enteros: incluye negativos. -0 no existe como tal. */
    { id: 'z-1',   tipo: 'entero',   display: '−1' },
    { id: 'z-5',   tipo: 'entero',   display: '−5' },
    { id: 'z-12',  tipo: 'entero',   display: '−12' },
    { id: 'z-100', tipo: 'entero',   display: '−100' },
    { id: 'z3',    tipo: 'entero',   display: '+3' },

    /* Decimales: con coma en ES, con punto en EN. La traducción de
       el separador se hace en app.js a partir de la pista i18n
       'gen.decimalSep' (es -> ',', en -> '.'). El banco ES usa ya
       coma; el banco EN se construye a partir del mismo. */
    { id: 'd05',   tipo: 'decimal',  display: '0,5' },
    { id: 'd125',  tipo: 'decimal',  display: '1,25' },
    { id: 'd314',  tipo: 'decimal',  display: '3,14' },
    { id: 'd27',   tipo: 'decimal',  display: '2,7' },
    { id: 'd001',  tipo: 'decimal',  display: '0,01' },

    /* Fracciones: numerador y denominador enteros positivos, distintos
       y denominador != 1 (1/1 es un natural). */
    { id: 'f12',   tipo: 'fraccion', display: '1/2' },
    { id: 'f34',   tipo: 'fraccion', display: '3/4' },
    { id: 'f25',   tipo: 'fraccion', display: '2/5' },
    { id: 'f78',   tipo: 'fraccion', display: '7/8' },
    { id: 'f13',   tipo: 'fraccion', display: '1/3' },
    { id: 'f49',   tipo: 'fraccion', display: '4/9' }
  ]
};
