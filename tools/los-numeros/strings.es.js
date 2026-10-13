/* ============================================================
   Calculia — Los Números textos (ES)
   Archivo específico del idioma. Se carga condicionalmente
   desde index.html según App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Los Números',
    titleH1: '🔢 Los Números',

    /* ---- Pantalla de inicio ---- */
    instruction: 'Mira el número. Elige qué tipo es.',
    startButton: 'Empezar a practicar →',
    introTitle: 'Hay cuatro tipos de números',
    introIntro: 'Toca cada tarjeta para verla con más detalle.',
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
    introContinue: 'Empezar a practicar →',

    /* ---- Pregunta y opciones ---- */
    askType: '¿Qué tipo de número es?',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has acertado {n} de {total}. Ahora tienes {stars} estrellas.',

    /* ---- Pistas y explicaciones (socráticas) ----
       Una pista por tipo de pregunta. Cada una dice qué mirar en el
       número que se ve en pantalla, no la respuesta. La pista
       genérica se queda como respaldo. */
    pista: '🤔 Prueba otra vez. Mira el número con calma.',
    pistaNatural: '🤔 Mira el número: ¿es entero, sin coma y sin denominador? ¿Está en 0, 1, 2, 3…?',
    pistaEntero: '🤔 Mira el número: ¿es entero, sin coma, y tiene un signo menos o más?',
    pistaDecimal: '🤔 Mira el número: ¿tiene una coma separando una parte pequeña?',
    pistaFraccion: '🤔 Mira el número: ¿tiene una barra separando dos cantidades (numerador y denominador)?',

    explicacionCorrecta: '✅ ¡Correcto! Es un número ',
    explicacionIncorrecta: '❌ Mira: es un número ',

    /* ---- Nombres de cada tipo (para la pregunta y el feedback) ---- */
    gen: {
      natural: 'natural',
      entero: 'entero',
      decimal: 'decimal',
      fraccion: 'fracción',
      naturalPlural: 'naturales',
      enteroPlural: 'enteros',
      decimalPlural: 'decimales',
      fraccionPlural: 'fracciones',
      askType: '¿Qué tipo de número es?',
      numberAria: 'Número {n}. Elige su tipo.',
      refuerzoTitulo: 'Refuerzo',
      refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.'
    },

    /* ---- Refuerzo y fin ---- */
    refuerzoTitulo: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    transfer: 'Esto te servirá para saber qué tipo de número tienes delante en cualquier operación: si es entero, decimal, fracción…'
  }, 'es');
})();
