/* ============================================================
   Calculia — Money texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '💰 Dinero',
    instructionMenu: 'Elige una actividad.',
    notaMonedero: '💶 Para pagar con monedas de verdad, entra en {link}.',
    notaMonederoLink: 'El Monedero',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} {starsWord}.',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 «{elegida}» no es la respuesta. Piensa con calma y mira otra vez la pregunta.',
    refuerzoTitulo: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    leyendaEurosTxt: 'euros',
    leyendaComaTxt: 'la coma y los céntimos',
    euroUno: '1 euro',
    euroVarios: '{e} euros',
    precioConCentimos: '{euros} y {c} céntimos',
    activity: {
      llega: { name: '¿Te llega?', detail: '¿Tienes bastante dinero?', instruction: 'Mira cuánto dinero tienes. Mira cuánto cuesta. Piensa si te llega o si te falta.' },
      cambio: { name: 'El Cambio', detail: '¿Cuánto te devuelven?', instruction: 'Pagas con un billete. Te devuelven lo que sobra. Calcula cuánto te devuelven.' },
      decimales: { name: 'Precios', detail: 'Los euros y la coma.', instruction: 'La coma separa los euros y los céntimos. Delante van los euros. Detrás van los céntimos.' }
    },
    level: {       },
      ll1: 'Un producto', ll2: 'Dos productos', ca1: 'Cambio fácil', ca2: 'Cambio con céntimos', d1: 'Leer precios', d2: '¿Qué cuesta más?',
    producto: { pan: 'el pan', leche: 'la leche', zumo: 'el zumo', manzanas: 'las manzanas', queso: 'el queso', galletas: 'las galletas', lapiz: 'el lápiz', cuaderno: 'el cuaderno' },
    product: {         },
    gen: {
      pricesPrompt: '¿Cómo se dice este precio?',
      comparePrompt: '¿Qué cuesta más?',
      oneEnoughPrompt: '¿Te llega el dinero para comprar esto?',
      twoEnoughPrompt: '¿Te llega el dinero para comprar los dos?',
      youHave: 'Tienes:',
      optionYes: 'Sí, me llega',
      optionNo: 'No, me falta dinero',
      changePrompt: '¿Cuánto te devuelven?',
      youPayWith: 'Pagas con:',
      itCosts: 'Cuesta:',
      preciosEnunciado: '¿Cómo se dice este precio?',
      comparaPreciosEnunciado: '¿Qué cuesta más?',
      llegaUnoEnunciado: '¿Te llega el dinero para comprar esto?',
      llegaDosEnunciado: '¿Te llega el dinero para comprar los dos?',
      etqTienes: 'Tienes:',
      opcionSi: 'Sí, me llega',
      opcionNo: 'No, me falta dinero',
      cambioEnunciado: '¿Cuánto te devuelven?',
      etqPagas: 'Pagas con:',
      etqCuesta: 'Cuesta:',
      /* La pista que sale al fallar. Una por tipo de pregunta, y cada una
         dice qué mirar en el dinero que hay en pantalla: la frase única de
         antes («Prueba otra vez. Piensa con calma») era la misma para
         todas. No dan la respuesta, dan la estrategia. */
      socraticPrice: '🤔 «{elegida}» no es el precio escrito: mira el precio escrito y léelo con euros y céntimos.',
      socraticComparePrices: '🤔 «{elegida}» no compara los dos precios: mira los dos precios y compáralos, porque el dibujo es igual para los dos.',
      socraticOneEnough: '🤔 «{elegida}» no compara bien el dinero: mira cuánto dinero tienes y cuánto cuesta, y compara los dos números.',
      socraticTwoEnough: '🤔 «{elegida}» no suma bien los dos precios: mira los dos precios juntos y compáralos con el dinero que tienes.',
      socraticChange: '🤔 «{elegida}» no es el cambio: mira qué billete pagas y cuánto cuesta, y piensa en la diferencia.'
    },
    transfer: 'Esto te servirá para manejarte con el dinero del día a día: saber si te llega, contar el cambio o leer un precio.'
  }, 'es');
})();
