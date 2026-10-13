/* ============================================================
   Calculia — Numbers texts (ES)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧮 Los Números',
    instructionMenu: 'Matemáticas para el día a día. Elige una actividad.',
    contexto: 'Estás en una tienda o en casa. Ves precios, números de pisos, cambios de dinero, medidas y edades. Los números te sirven para decidir.',
    explicacion: '✅ Los números no son solo para clase: con ellos calculas el cambio, sabes cuánto pesa la fruta, entiendes una talla o mides el tiempo.',
    notaTablas: '🔢 Para contar, sumar y multiplicar, ve a {link}.',
    noteTables: '🔢 Para contar, sumar y multiplicar, ve a {link}.',
    notaTablasLink: 'Tablas',
    noteTablesLink: 'Tablas',
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
    grupoEtq: { 0: '', 1: 'miles', 2: 'millones', 3: 'millardos', 4: 'billones' },
    groupLabel: { 0: '', 1: 'miles', 2: 'millones', 3: 'millardos', 4: 'billones' },
    leyendaUnidadesTxt: 'unidades',
    legendUnitsTxt: 'unidades',
    leyendaDecenasTxt: 'decenas',
    legendTensTxt: 'decenas',
    leyendaCentenasTxt: 'centenas',
    legendHundredsTxt: 'centenas',
    hundredSingular: 'centena',
    hundredPlural: 'centenas',
    tenSingular: 'decena',
    tenPlural: 'decenas',
    unitSingular: 'unidad',
    unitPlural: 'unidades',
    activity: {
      'positivos-y-negativos': { name: 'Positivos y negativos', detail: 'Comprende los signos y practica con el termómetro y el ascensor.', instruction: 'Los números pueden estar por encima o por debajo de cero. Mira los ejemplos y practica con el termómetro y el ascensor.' },
      unidades: { name: 'Unidades y decenas', detail: '¿Qué número es?', instruction: 'Cada color ayuda a leer el número. Azul: unidades. Verde: decenas. Morado: centenas.' },
      placevalue: { name: 'Cambiar de posición', detail: '10 pequeños se cambian por 1 grande.', instruction: 'Cuando juntas 10 iguales, forman 1 del grupo siguiente. La cifra se mueve una posición a la izquierda.' },
      ordinales: { name: 'El lugar en la fila', detail: 'Primero, segundo, tercero…', instruction: 'Los números ordinales dicen qué lugar ocupa cada uno. La fila empieza en la bandera 🏁. El de al lado de la bandera es el primero.' },
      recta: { name: 'La recta de los números', detail: '¿Qué número señala la flecha?', instruction: 'Los números van en fila y en orden. La recta los coloca de menor a mayor. Cuenta desde la marca más cercana para saber cuál señala la flecha.' },
      comparar: { name: 'Mayor, menor o igual', detail: 'Los signos <, > y =.', instruction: 'Mira los dos números. El signo se abre hacia el número más grande. Si los dos son iguales, el signo es =.' }
    },
    signed: {
      introInstruction: 'Primero veremos qué significan los números positivos y negativos.',
      theoryTitle: 'Números positivos y negativos',
      theoryIntro: 'Los números pueden estar por encima o por debajo del cero.',
      rulePositive: 'Los positivos son mayores que 0: +1, +2, +3…',
      ruleNegative: 'Los negativos van por debajo del 0: −1, −2, −3…',
      ruleZero: 'El 0 no es positivo ni negativo. Es el punto de partida.',
      numberlineAria: 'Recta numérica desde menos tres hasta más tres. El cero está en el centro.',
      introNext: 'Ver ejemplos de la vida real →',
      realIntro: 'Ahora veremos los números con signo en situaciones cotidianas.',
      realTitle: 'Números con signo en el día a día',
      realBack: '← Volver a la explicación',
      realNext: '👉 Practicar con el termómetro →',
      real: {
        termometro: {
          title: 'El termómetro',
          text: 'Por debajo de 0 °C hace frío. −5 °C son cinco grados bajo cero. A 0 °C el agua empieza a congelarse.'
        },
        ascensor: {
          title: 'El ascensor',
          text: 'El sótano puede ser la planta −1. La planta baja es el 0. Las plantas de arriba pueden ser +1, +2…'
        },
        cuentas: {
          title: 'Las cuentas',
          text: 'Una deuda puede escribirse con un número negativo: −20 €. Un saldo a favor puede escribirse con uno positivo: +20 €.'
        }
      },
      tempHint: 'Pulsa +1 o −1 para mover el termómetro. Mira si la temperatura está por encima o por debajo de 0.',
      tempStepDown: 'Bajar un grado',
      tempStepUp: 'Subir un grado',
      tempReset: 'Empezar otra vez',
      tempGoals: {
        negative: 'Baja de 0 °C.',
        positive: 'Sube por encima de 0 °C.',
        zero: 'Llega justo a 0 °C.'
      },
      tempReadout: 'Temperatura: {value} grados Celsius',
      sign: {
        positive: 'Número positivo',
        negative: 'Número negativo',
        zero: 'Cero'
      },
      tempSuccess: '✅ ¡Objetivo conseguido!',
      tempNext: 'Siguiente reto →',
      endSummary: 'Has practicado los números positivos y negativos. Ahora tienes {stars} estrellas.'
    },
    ordinal: { 1: 'primero', 2: 'segundo', 3: 'tercero', 4: 'cuarto', 5: 'quinto' },
    /* Exposition + real-life screens for the 5 sub-activities that don't
       have their own custom lesson (positivos-y-negativos uses the
       dedicated signed.* flow). Each activity gets a brief theoretical
       slide (expo.*) followed by everyday examples (real.*), with a
       "Siguiente" button linking them and from there to the practice. */
    expo: {
      ordinales: {
        title: 'El lugar en la fila',
        intro: 'Los números ordinales indican el orden. Sirven para decir quién va primero, segundo, tercero…',
        bullets: [
          '1.º = primero',
          '2.º = segundo',
          '3.º = tercero',
          '4.º = cuarto',
          '5.º = quinto'
        ],
        note: 'La bandera 🏁 marca el principio. El de al lado es el primero.'
      },
      comparar: {
        title: 'Mayor, menor o igual',
        intro: 'Para saber qué número es mayor, miramos las cifras de izquierda a derecha.',
        bullets: [
          'Si la primera cifra ya es mayor, ese número es mayor.',
          'Si son iguales en esa cifra, miramos la siguiente.',
          'Si todas las cifras son iguales, los dos números son iguales.'
        ],
        note: 'El signo se abre hacia el número más grande: el lado abierto es el mayor.'
      },
      recta: {
        title: 'La recta de los números',
        intro: 'Una recta numérica es una línea con números en orden. Van de menor (izquierda) a mayor (derecha).',
        bullets: [
          'Los números están separados a la misma distancia.',
          'Cada muesca vale lo mismo: 1, 5, 10, 50…',
          'La flecha señala el número que tienes que decir.'
        ],
        note: 'Cuenta desde el número escrito más cercano para saber qué número señala la flecha.'
      },
      unidades: {
        title: 'Unidades, decenas y centenas',
        intro: 'Cada cifra tiene un valor según su lugar. La cifra de la derecha son unidades; la siguiente, decenas; la siguiente, centenas.',
        bullets: [
          'Unidades: 1, 2, 3…',
          'Decenas: 10, 20, 30…',
          'Centenas: 100, 200, 300…',
          'En el número 345: 3 centenas + 4 decenas + 5 unidades.'
        ],
        note: 'Cada color señala un valor: azul (unidades), verde (decenas), morado (centenas).'
      },
      placevalue: {
        title: 'Cambiar de posición',
        intro: '10 unidades forman 1 decena. 10 decenas forman 1 centena. 10 centenas forman 1 millar. Y así sigue.',
        bullets: [
          '10 × 1 = 1 decena (10)',
          '10 × 10 = 1 centena (100)',
          '10 × 100 = 1 millar (1.000)'
        ],
        note: 'Multiplicar por 10 mueve la cifra un lugar a la izquierda y añade un cero.'
      }
    },
    real: {
      ordinales: {
        title: 'Los ordinales en tu día a día',
        items: [
          { icon: '🚶', text: 'En la cola del comedor: «yo soy el tercero».' },
          { icon: '🏆', text: 'El podio de una carrera: primero, segundo, tercero.' },
          { icon: '🏢', text: 'La planta de un edificio: primera planta, segunda planta…' },
          { icon: '🎂', text: '«Es mi quinto cumpleaños» = 5.º.' }
        ]
      },
      comparar: {
        title: 'Comparar está en todas partes',
        items: [
          { icon: '🎒', text: '¿Quién tiene más cromos en la mochila?' },
          { icon: '🍎', text: '¿Qué bolsa pesa más en la compra?' },
          { icon: '📅', text: '¿Quién nació antes y quién después?' },
          { icon: '💰', text: '¿Quién tiene más dinero en la hucha?' }
        ]
      },
      recta: {
        title: 'La recta en tu día a día',
        items: [
          { icon: '📏', text: 'Una regla para medir cosas en centímetros.' },
          { icon: '🌡️', text: 'Un termómetro señala una temperatura.' },
          { icon: '🗺️', text: 'La escala de un plano indica las distancias.' },
          { icon: '⏱️', text: 'Una cinta métrica muestra posiciones en una línea.' }
        ]
      },
      unidades: {
        title: 'Unidades, decenas y centenas en tu día',
        items: [
          { icon: '🥚', text: 'Una caja de huevos tiene 12 unidades (= 1 docena).' },
          { icon: '👟', text: 'Las tallas de zapatos son números de unidades.' },
          { icon: '💶', text: '100 céntimos = 1 €. 10 céntimos = 1 décima de euro.' },
          { icon: '⏱️', text: '60 minutos = 1 hora. 60 segundos = 1 minuto.' }
        ]
      },
      placevalue: {
        title: 'Los cambios de 10 en tu día',
        items: [
          { icon: '🥚', text: '10 huevos sueltos forman 1 docena.' },
          { icon: '✏️', text: '10 lápices sueltos forman 1 paquete.' },
          { icon: '💶', text: '10 monedas de 10 céntimos = 1 euro.' },
          { icon: '⏱️', text: '10 años = 1 década. 10 décadas = 1 siglo (100 años).' }
        ]
      }
    },
    expoNext: 'Ver ejemplos de la vida real →',
    expoBack: '← Volver al menú',
    realBack: '← Volver a la explicación',
    realNext: 'Empezar a practicar →',
    ordinalPlace: { 1: 'el primer lugar', 2: 'el segundo lugar', 3: 'el tercer lugar', 4: 'el cuarto lugar', 5: 'el quinto lugar' },
    level: { n1: 'Hasta 10', n2: 'Hasta 20', n3: 'Hasta 100', n4: 'Hasta 100, con menos marcas', c1: 'Hasta 9, con bloques', c2: 'Hasta 99, con bloques', c3: 'Hasta 99, sin bloques', c4: 'Hasta 999', c5: 'Hasta 9.999', o1: 'Fila de 3', o2: 'Fila de 5', o3: 'Buscar un lugar', libre: '🏢 Ascensor libre', meta: '🎯 Llegar a un piso', u99: 'Hasta 99', u999: 'Hasta 999', umiles: 'Los miles', umillones: 'Millones y billón', udictado: 'Escucha y elige', counter: 'Contador libre', pv1: 'De unidades a decenas', pv2: 'De decenas a centenas', pv3: 'De centenas a miles', pv4: 'Escalera del 10: hasta el millón', pv5: 'Escalera del 10: hasta el billón' },
    gen: {
      numberLinePrompt: '¿Qué número señala la flecha?',
      numberLineHint: 'Cuenta desde el número escrito más cercano.',
      numberLineAria: 'Recta numérica de {min} a {max}.',
      compararEnunciado: '¿Qué signo falta?',
      compararPista: 'El signo se abre hacia el número más grande.',
      compararAria: 'Compara {a} y {b}.',
      signLess: 'es más pequeño que',
      signGreater: 'es más grande que',
      signEqual: 'es igual a',
      ordinalPositionPrompt: '¿Qué lugar señala la flecha?',
      ordinalMemberPrompt: '¿Quién está en {place}?',
      ordinalHint: 'Cuenta desde la bandera 🏁.',
      ordinalVisualAria: 'Fila de {n}. La flecha señala el lugar {pos}.',
      bloquesEnunciado: '¿Qué número forman los bloques?',
      bloquesVisualAria: 'Bloques: {texto}',
      blocksPrompt: '¿Qué número forman los bloques?',
      blocksVisualAria: 'Bloques: {texto}',
      lecturaEnunciadoNumASim: '¿Cómo se lee este número?',
      lecturaEnunciadoSimANum: '¿Qué número es?',
      readingNumToWordPrompt: '¿Cómo se lee este número?',
      readingWordToNumPrompt: '¿Qué número es?',
      canjeDirecto0: 'Con {n} unidades, ¿cuántas decenas formas?',
      canjeDirecto1: 'Con {n} decenas, ¿cuántas centenas formas?',
      canjeDirecto2: 'Con {n} centenas, ¿cuántos miles formas?',
      canjePista0: '10 unidades forman 1 decena.',
      canjePista1: '10 decenas forman 1 centena.',
      canjePista2: '10 centenas forman 1 millar: 1.000.',
      canjeAriaDirecto: '{k} grupos de 10 bloques',
      canjeInverso0: '{k} decenas. ¿Cuántas unidades son?',
      canjeInverso1: '{k} centenas. ¿Cuántas decenas son?',
      canjeInverso2: '{k} miles. ¿Cuántas centenas son?',
      canjeAriaInverso: '{k} bloques grandes',
      carryDirect0: 'Con {n} unidades, ¿cuántas decenas formas?',
      carryDirect1: 'Con {n} decenas, ¿cuántas centenas formas?',
      carryDirect2: 'Con {n} centenas, ¿cuántos miles formas?',
      carryReverse0: '{k} decenas. ¿Cuántas unidades son?',
      carryReverse1: '{k} centenas. ¿Cuántas decenas son?',
      carryReverse2: '{k} miles. ¿Cuántas centenas son?',
      carryHint0: '10 unidades forman 1 decena.',
      carryHint1: '10 decenas forman 1 centena.',
      carryHint2: '10 centenas forman 1 millar: 1.000.',
      carryAriaDirect: '{k} grupos de 10 bloques',
      carryAriaReverse: '{k} bloques grandes',
      escaleraEnunciado: '¿Cuánto es 10 × este número?',
      escaleraPista: 'Por 10: cada cifra se mueve un sitio a la izquierda y se añade un cero.',
      ladderPrompt: '¿Cuánto es 10 × este número?',
      ladderHint: 'Por 10: cada cifra se mueve un sitio a la izquierda y se añade un cero.',
      dictadoEnunciado: 'Lee el número. Después, tócalo.',
      dictationPrompt: 'Lee el número. Después, tócalo.',
      counterHint: 'Pulsa para sumar o restar. Mira cómo cambian las cifras y los grupos (unidades, decenas, centenas, miles…).',
      counterAudioAria: 'Leer el número en voz alta',
      counterResetLabel: '🔄 Empezar en 0',
      counterExitLabel: '✅ Salir',
      counterSepOn: '·1.234',
      counterSepOff: '1234',
      counterGroupsLabel: '🎨 Colorear grupos',
      counterGroupsOn: '🎨 Colorear grupos: sí',
      counterGroupsOff: '🎨 Colorear grupos: no',
      counterGroupsAria: 'Colorear cada grupo de 3 cifras',
      counterWordsOn: '✍️ Ocultar cómo se escribe',
      counterWordsOff: '✍️ Mostrar cómo se escribe',
      counterWordsAria: 'Mostrar el número escrito con palabras',
      counterResumenFinal: 'Has explorado el contador libre. Ahora tienes {stars} estrellas.',
      elevatorHint: 'Pulsa + o − para mover el ascensor. Mira cómo cambia el piso y si sube o baja.',
      elevatorHintLibre: 'Pulsa + o − para mover el ascensor. Mira cómo cambia el piso y si sube o baja.',
      elevatorHintMeta: 'Pulsa + o − hasta llegar al piso objetivo. Tienes que acertar el piso exacto.',
      elevatorSuggestionUp: '💡 Sugerencia: sube hasta el piso {piso}.',
      elevatorSuggestionDown: '💡 Sugerencia: baja hasta el piso {piso}.',
      elevatorReadoutAria: 'El ascensor está en el piso {piso}',
      elevatorStateAbove: 'Piso de arriba (número positivo)',
      elevatorStateBelow: 'Piso de abajo (número negativo)',
      elevatorStateGround: 'Planta baja (cero)',
      elevatorGoalMeta: 'Objetivo: llegar al piso {piso}.',
      elevatorSuccess: '🏢 ¡Has llegado al piso {piso}!',
      elevatorBtnReset: '🔄 Empezar en 0',
      elevatorBtnAudio: 'Escuchar el piso',
      elevatorBtnExit: '✅ Salir',
      elevatorTtsFloor: 'Piso {piso}',
      elevatorTtsAbove: 'Piso de arriba.',
      elevatorTtsBelow: 'Piso de abajo.',
      elevatorTtsGround: 'Planta baja.',
      elevatorResumenFinal: 'Has explorado el ascensor. Ahora tienes {stars} estrellas.',
      /* La pista que sale al fallar. Una por tipo de pregunta, y cada una
         dice qué mirar en el dibujo o en el número de delante: la frase
         única de antes («Prueba otra vez. Piensa con calma») era la misma
         para todas. No dan la respuesta, dan la estrategia. */
      socraticOrdinalPlace: '🤔 Empieza en la bandera y cuenta hasta la flecha, uno por uno.',
      socraticOrdinalMember: '🤔 Empieza en la bandera y cuenta hasta el lugar que te piden.',
      socraticNumberLine: '🤔 Cuenta las muescas desde el número escrito más cercano hasta la flecha.',
      socraticCompare: '🤔 Mira las cifras de los dos números y compara primero las de más sitio.',
      socraticBlocks: '🤔 Cuenta los bloques de cada grupo y después junta los resultados.',
      socraticSayNumber: '🤔 Mira el número pintado y léelo por partes, de izquierda a derecha.',
      socraticWriteNumber: '🤔 Mira cómo está escrito y fíjate en qué grupos de diez está dividido.',
      socraticTradeUp: '🤔 Mira los bloques y agrúpalos de diez en diez: cuenta los grupos.',
      socraticTradeDown: '🤔 Mira cada bloque grande y cuenta cuántos pequeños entran dentro.',
      socraticLadder: '🤔 Mira el número: es un uno seguido de ceros, cuenta cuántos hay.',
      socraticDictation: '🤔 Lee el número pintado despacio y compáralo con las opciones.'
    },
    transfer: 'Esto te servirá para leer números grandes, entender el ascensor de un edificio o saber qué cifra cambia al sumar 100.'
  }, 'es');
})();
