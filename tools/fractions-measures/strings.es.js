/* ============================================================
   Calculia — Fractions texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🍕 Fracciones',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Repartes una pizza, cortas una tarta o divides algo entre varios. Las partes están en todas partes.',
    explicacion: '✅ Las fracciones y los decimales te ayudan a repartir de forma justa y a entender medias, cuartos y precios.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
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
    leyendaPartesPintadasTxt: 'partes pintadas',
    legendPaintedPartsTxt: 'partes pintadas',
    leyendaPartesTotalTxt: 'partes en total',
    legendTotalPartsTxt: 'partes en total',
    activity: {
      fracciones: { name: 'Fracciones', detail: 'Las partes de algo.', instruction: 'Una fracción es una parte de algo. Mira las partes pintadas de la figura.' },
      decimales: { name: 'Decimales', detail: 'Los números con coma.', instruction: 'Un número decimal lleva una coma. Antes de la coma van las unidades enteras. Después de la coma van las partes. Si la tarta tiene 10 partes, cada parte es 0,1. Media tarta es 0,5. Lo ves en los precios (1,50 €) y en las medidas (0,5 litros).' }
    },
    level: { f1: 'Mitades y cuartos', f2: 'Tercios y sextos', f3: '¿Cuál es más grande?', f4: 'Valen lo mismo', f5: 'Sumar fracciones', f6: 'Restar fracciones', d1: 'De la tarta al número', d2: 'Del número a la tarta', d3: 'La mitad y los cuartos' ,       f7: 'Sumar trozos distintos',
      f8: 'Restar trozos distintos',
      f9: 'La parte de una cantidad',
      d4: 'Sumar decimales',
      d5: 'Restar decimales',
      d6: 'Fracción más decimal',
      d7: 'Fracción menos decimal',
      d8: '¿Qué es más?'
},
    part: {
      '2': 'la mitad',
      '3': 'un tercio',
      '4': 'un cuarto'
    },
    thing: {
      sweets: 'caramelos',
      apples: 'manzanas',
      coins: 'monedas',
      pencils: 'lápices'
    },
    gen: {
      mixFracAdd: '¿Cuánto sale al sumar? Los trozos no son del mismo tamaño.',
      mixFracSub: '¿Cuánto queda al restar? Los trozos no son del mismo tamaño.',
      mixFracHint: 'Parte los trozos grandes para que todos sean de {den}.',
      mixFracAria: '{na} de {da} y {nb} de {db}.',
      fracOfPrompt: 'Tienes {total} {thing}. Coges {part}. ¿Cuántos coges?',
      fracOfHint: 'Están repartidos en {den} montones iguales. Cuenta uno.',
      fracOfAria: '{den} montones de {each} cosas, con uno marcado.',
      decimalAdd: '¿Cuánto es {a} más {b}?',
      decimalSub: '¿Cuánto es {a} menos {b}?',
      decimalOpHint: 'Cada trozo de la tarta es 0,1. Cuenta los trozos.',
      decimalOpAria: '{a} y {b} dibujados en tartas de diez trozos.',
      mixedAdd: '¿Cuánto es {a} más {b}?',
      mixedSub: '¿Cuánto es {a} menos {b}?',
      mixedOpHint: 'Una está escrita como fracción y la otra como decimal, pero las dos son trozos de tarta. Cuenta los trozos.',
      mixedOpAria: 'Una tarta con {a} y otra con {b}.',
      whichIsMore: '¿Qué es más?',
      mixedCompareHint: 'Una está escrita como fracción y la otra como decimal. Mira cuánta tarta hay pintada en cada una.',
      fraccionesEnunciado: '¿Qué parte está pintada?',
      fractionsPrompt: '¿Qué parte está pintada?',
      fraccionesVisualAria: 'Figura con {den} partes. {num} están pintadas.',
      fractionVisualAria: 'Figura con {den} partes. {num} están pintadas.',
      fraccionAria: '{num} de {den} partes',
      fractionAria: '{num} de {den} partes',
      comparaFracEnunciado: '¿Dónde está pintada la parte más grande?',
      compareFractionPrompt: '¿Dónde está pintada la parte más grande?',
      equivalentesEnunciado: '¿Cuál vale lo mismo?',
      equivalentesPista: 'Busca la figura que tiene pintada la misma cantidad.',
      sumaFracEnunciado: '¿Cuánto suman las dos partes?',
      restaFracEnunciado: '¿Cuánto queda al quitar?',
      sumaFracPista: 'Las partes son del mismo tamaño. El número de abajo no cambia.',
      sumaFracAria: '{x} de {den} más {y} de {den}.',
      restaFracAria: '{x} de {den} menos {y} de {den}.',
      decimalToNumberPrompt: '¿Qué número decimal está pintado?',
      decimalToPicturePrompt: '¿Qué tarta vale este número?',
      decimalHintTenths: 'La tarta tiene 10 partes. Cada parte es 0,1.',
      decimalHintParts: 'Mira cuánta tarta está pintada: la mitad, un cuarto o tres cuartos.'
    },
    transfer: 'Esto te servirá para repartir algo en partes iguales, entender media hora o leer un precio con coma.'
  }, 'es');
})();
