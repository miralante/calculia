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
      decimales: { name: 'Decimales', detail: 'Los números con coma.', instruction: 'Un número decimal lleva una coma. Antes de la coma van las unidades enteras. Después de la coma van las partes. Si la tarta tiene 10 partes, cada parte es 0,1. Media tarta es 0,5. Lo ves en los precios (1,50 €) y en las medidas (0,5 litros).' },
      coma: { name: 'Poner la coma decimal', detail: 'Coloca la coma entre la parte entera y los decimales.', instruction: 'Toca un hueco para poner la coma. Cuenta las cifras desde la derecha: la coma va dejando tantas cifras decimales como diga el número.' }
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
      decimalHintParts: 'Mira cuánta tarta está pintada: la mitad, un cuarto o tres cuartos.',
      /* La pista que sale al fallar. Una por tipo de pregunta, y todas
         dicen qué mirar o qué hacer con lo que hay en pantalla: la frase
         única que había antes («Prueba otra vez…») era la misma para
         todas las preguntas, así que no decía nada. Estas no dan la
         respuesta —dan la estrategia—, que es lo que distingue una
         pista socrática de un spoiler. */
      socraticMixFrac: '🤔 Mira los dos círculos y quédate con los trozos del mismo tamaño.',
      socraticFracOf: '🤔 Mira el grupo marcado y cuenta solo los dibujos que tiene.',
      socraticMixedOp: '🤔 Los dos números están en diez partes: mira las tartas.',
      socraticFracVsDecimal: '🤔 Cuenta los trozos pintados de cada tarta, no los números.',
      socraticDecimalOp: '🤔 Cuenta las partes de cada tarta y mira cuánto suman.',
      socraticFracciones: '🤔 Cuenta cuántas partes están pintadas y cuántas partes tiene la tarta en total. Arriba va lo pintado; abajo, el total.',
      socraticComparaFrac: '🤔 Compara las dos tartas y fíjate en cuál tiene más pintada.',
      socraticEquivalentes: '🤔 Compara cuánto se pinta en las dos figuras, parte por parte.',
      socraticSumaFrac: '🤔 Las dos tartas están cortadas en el mismo número de trozos.',
      socraticDecimalToPicture: '🤔 Busca la tarta que tenga pintada esa misma cantidad.',
      socraticDecimalToNumber: '🤔 Mira cuánta parte de la tarta está pintada y ponle su número.'
    },
    intro: {
      fracciones: {
        instruction: 'Antes de jugar, mira cómo se lee una fracción.',
        title: 'Qué es una fracción',
        text: 'Una fracción dice qué parte de algo tomas. Se escribe con dos números, uno encima del otro.',
        parts: 'Esta tarta tiene 4 partes iguales. Tres están pintadas: son tres cuartos.',
        notation: 'El número de arriba cuenta las partes pintadas. El de abajo cuenta todas las partes.',
        size: 'Cuantas más partes hay, más pequeña es cada una. Un medio es más grande que un cuarto.',
        toReal: 'Verlo en la vida real →',
        prev: 'Anterior',
        next: 'Siguiente'
      },
      decimales: {
        instruction: 'Antes de jugar, mira cómo se escribe un decimal.',
        title: 'Qué es un número decimal',
        text: 'Un decimal es otra forma de escribir una parte. Lleva una coma: lo que va antes son unidades enteras y lo que va después son partes.',
        tenths: 'Una tarta tiene 10 partes iguales. Cada parte es 0,1. Tres partes son 0,3.',
        point: 'La coma separa las unidades de las partes. El 0 son las unidades y el 3 son décimas.',
        half: '0,5 es la mitad de la tarta. 0,25 es un cuarto.',
        toReal: 'Verlo en la vida real →',
        prev: 'Anterior',
        next: 'Siguiente'
      }
    },
    real: {
      fracciones: {
        title: 'Las fracciones están en la vida real.',
        pizza: 'Una pizza tiene 4 trozos. Si te comes 1, te comes un cuarto: 1/4.',
        clock: 'Un cuarto de hora son 15 minutos. Media hora son 30 minutos.',
        money: 'La mitad de 10 € son 5 €.',
        bottle: 'Una botella de un litro llena hasta la mitad tiene medio litro: 1/2.',
        continue: 'Empezar a practicar →',
        prev: 'Anterior',
        next: 'Siguiente'
      },
      decimales: {
        title: 'Los decimales están en la vida real.',
        price: 'Un pan cuesta 1,50 €. Es un euro y cincuenta céntimos.',
        milk: 'Medio litro de leche son 0,5 litros.',
        ribbon: 'Una cinta de 2,5 metros mide dos metros y medio.',
        candy: 'Un caramelo cuesta 0,20 €. Son veinte céntimos.',
        continue: 'Empezar a practicar →',
        prev: 'Anterior',
        next: 'Siguiente'
      }
    },
    /* Poner la coma decimal (actividad 'coma'). {count} = cifras decimales
       del número; {k} = cifras a la derecha de la coma puesta. */
    coma: {
      boardAria: 'Número para colocar la coma decimal',
      gapEmptyAria: 'Hueco vacío: arrastra la coma aquí o toca el hueco.',
      gapFilledAria: 'Coma: arrástrala a otro hueco. Toca para quitarla.',
      check: 'Comprobar',
      promptDecimal: 'Pon la coma decimal: este número tiene {count} cifras decimales.',
      promptDecimalOne: 'Pon la coma decimal: este número tiene 1 cifra decimal.',
      detailDecimal: 'Arrastra la coma a un hueco. También puedes tocar un hueco. Toca la coma para quitarla.',
      missing: 'Todavía no has puesto la coma.',
      wrongMarked: 'Revisa la coma marcada con ✗.',
      wrongHint: 'Ahora hay {digits} a la derecha de la coma. Tienen que ser {d}. Mueve la coma {moves} {direction}.',
      oneDigit: 'una cifra',
      manyDigits: '{n} cifras',
      oneGap: 'un hueco',
      manyGaps: '{n} huecos',
      moveLeft: 'hacia la izquierda',
      moveRight: 'hacia la derecha',
      correctFormat: 'Se escribe: {n}',
      roundProgress: '{current} de {total}',
      reinforceTitle: 'Refuerzo',
      reinforceIntro: 'Vamos a repetir los {n} ejercicios que has fallado hasta acertarlos todos.'
    },
    transfer: 'Esto te servirá para repartir algo en partes iguales, entender media hora o leer un precio con coma.'
  }, 'es');
})();
