/* ============================================================
   Calculia — Money texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '� Dinero',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Estás en una tienda. Tienes un dinero, ves un precio y pagas con un billete. ¿Te llega? ¿Cuánto te devuelven?',
    explicacion: '✅ Con estas cuentas sabes si te llega el dinero y controlas el cambio que te devuelven.',
    notaMonedero: '💶 Para pagar con monedas de verdad, entra en {link}.',
    noteWallet: '💶 Para pagar con monedas de verdad, entra en {link}.',
    notaMonederoLink: 'El Monedero',
    noteWalletLink: 'El Monedero',
    btnBackToMenu: '← Otras actividades',
    otherLevel: 'Elegir otro nivel',
    resumenFinal: 'Has resuelto {n} preguntas de {actividad}. Ahora tienes {stars} estrellas.',
    endSummary: 'Has resuelto {n} preguntas de {actividad}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{nombre}»?',
    btnOtherActivity: 'Otra actividad',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    pista: '🤔 Prueba otra vez. Piensa con calma.',
    hint: '🤔 Prueba otra vez. Piensa con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    leyendaEurosTxt: 'euros',
    legendEurosTxt: 'euros',
    leyendaComaTxt: 'la coma y los céntimos',
    legendCommaTxt: 'la coma y los céntimos',
    euroUno: '1 euro',
    oneEuro: '1 euro',
    euroVarios: '{e} euros',
    manyEuros: '{e} euros',
    precioConCentimos: '{euros} y {c} céntimos',
    priceWithCents: '{euros} y {c} céntimos',
    activity: {
      llega: { name: '¿Te llega?', detail: '¿Tienes bastante dinero?', instruction: 'Mira cuánto dinero tienes. Mira cuánto cuesta. Piensa si te llega o si te falta.' },
      cambio: { name: 'El Cambio', detail: '¿Cuánto te devuelven?', instruction: 'Pagas con un billete. Te devuelven lo que sobra. Calcula cuánto te devuelven.' },
      decimales: { name: 'Precios', detail: 'Los euros y la coma.', instruction: 'La coma separa los euros y los céntimos. Delante van los euros. Detrás van los céntimos.' }
    },
    level: { ll1: 'Un producto', ll2: 'Dos productos', ca1: 'Cambio fácil', ca2: 'Cambio con céntimos', d1: 'Leer precios', d2: '¿Qué cuesta más?' },
    producto: { pan: 'el pan', leche: 'la leche', zumo: 'el zumo', manzanas: 'las manzanas', queso: 'el queso', galletas: 'las galletas', lapiz: 'el lápiz', cuaderno: 'el cuaderno' },
    product: { pan: 'el pan', leche: 'la leche', zumo: 'el zumo', manzanas: 'las manzanas', queso: 'el queso', galletas: 'las galletas', lapiz: 'el lápiz', cuaderno: 'el cuaderno' },
    gen: {
      preciosEnunciado: '¿Cómo se dice este precio?',
      pricesPrompt: '¿Cómo se dice este precio?',
      comparaPreciosEnunciado: '¿Qué cuesta más?',
      comparePrompt: '¿Qué cuesta más?',
      llegaUnoEnunciado: '¿Te llega el dinero para comprar esto?',
      oneEnoughPrompt: '¿Te llega el dinero para comprar esto?',
      llegaDosEnunciado: '¿Te llega el dinero para comprar los dos?',
      twoEnoughPrompt: '¿Te llega el dinero para comprar los dos?',
      etqTienes: 'Tienes:',
      youHave: 'Tienes:',
      opcionSi: 'Sí, me llega',
      optionYes: 'Sí, me llega',
      opcionNo: 'No, me falta dinero',
      optionNo: 'No, me falta dinero',
      cambioEnunciado: '¿Cuánto te devuelven?',
      changePrompt: '¿Cuánto te devuelven?',
      etqPagas: 'Pagas con:',
      youPayWith: 'Pagas con:',
      etqCuesta: 'Cuesta:',
      itCosts: 'Cuesta:'
    },
    transferencia: 'Esto te servirá para manejarte con el dinero del día a día: saber si te llega, contar el cambio o leer un precio.',
    transfer: 'Esto te servirá para manejarte con el dinero del día a día: saber si te llega, contar el cambio o leer un precio.'
  }, 'es');
})();
