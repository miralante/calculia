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
    notaTablas: '🔢 Para contar, sumar y multiplicar, ve a {link}.',
    notaTablasLink: 'Tablas',
    btnMenu: 'Volver al inicio',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} {starsWord}.',
    explicacionCorrecta: '✅ ¡Correcto! La respuesta es: ',
    explicacionIncorrectaA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 «{elegida}» no es la respuesta. Piensa con calma y mira otra vez la pregunta.',
    refuerzoTitulo: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    grupoEtq: { 0: '', 1: 'miles', 2: 'millones', 3: 'millardos', 4: 'billones' },
    groupLabel: { 0: '', 1: 'miles', 2: 'millones', 3: 'millardos', 4: 'billones' },
    leyendaUnidadesTxt: 'unidades',
    leyendaDecenasTxt: 'decenas',
    leyendaCentenasTxt: 'centenas',
    activity: {
      unidades: { name: 'Unidades, decenas, centenas', detail: '¿Qué número es?', instruction: 'Cada color ayuda a leer el número. Azul: unidades. Verde: decenas. Morado: centenas.' },
      placevalue: { name: 'Cuentas rápidas', detail: '10 pequeños se cambian por 1 grande.', instruction: 'Cuando juntas 10 iguales, forman 1 del grupo siguiente. La cifra se mueve una posición a la izquierda.' },
      comparar: { name: 'Mayor, menor o igual', detail: 'Los signos <, > y =.', instruction: 'Mira los dos números. El signo se abre hacia el número más grande. Si los dos son iguales, el signo es =.' }
    },
    /* Exposition + real-life screens for the sub-activities that don't
       have their own custom lesson. Each activity gets a brief theoretical
       slide (expo.*) followed by everyday examples (real.*), with a
       "Siguiente" button linking them and from there to the practice. */
    expo: {
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
      unidades: {
        slides: [
          {
            title: 'Las unidades',
            intro: 'Las unidades son la cifra de más a la derecha. Cuentan cosas sueltas.',
            bullets: [
              'Unidades: 1, 2, 3… hasta 9.',
              'En el número 7 hay 7 unidades.'
            ],
            note: 'Azul: unidades.'
          },
          {
            title: 'Las decenas',
            intro: 'Las decenas están a la izquierda de las unidades. Una decena son 10 unidades juntas.',
            bullets: [
              '1 decena = 10 unidades.',
              'En el número 40 hay 4 decenas y 0 unidades.'
            ],
            note: 'Verde: decenas.'
          },
          {
            title: 'Las centenas',
            intro: 'Las centenas están a la izquierda de las decenas. Una centena son 10 decenas juntas: 100.',
            bullets: [
              '1 centena = 10 decenas = 100.',
              'En el número 300 hay 3 centenas.'
            ],
            note: 'Morado: centenas.'
          },
          {
            title: 'Las unidades de millar',
            intro: 'La cuarta cifra, contando desde la derecha, son las unidades de millar. Una unidad de millar son 10 centenas: 1.000.',
            bullets: [
              '1 unidad de millar = 10 centenas = 1.000.',
              'En el número 4.000 hay 4 unidades de millar.'
            ],
            note: 'Los números grandes se separan en grupos de tres cifras con un punto.'
          },
          {
            title: 'Las decenas de millar',
            intro: 'Una decena de millar son 10 unidades de millar: 10.000. Está a la izquierda de las unidades de millar.',
            bullets: [
              '1 decena de millar = 10 unidades de millar = 10.000.',
              'En el número 50.000 hay 5 decenas de millar.'
            ]
          },
          {
            title: 'Las centenas de millar',
            intro: 'Una centena de millar son 10 decenas de millar: 100.000. Está a la izquierda de las decenas de millar.',
            bullets: [
              '1 centena de millar = 10 decenas de millar = 100.000.',
              'En el número 300.000 hay 3 centenas de millar.'
            ]
          },
          {
            title: 'Todas las posiciones',
            intro: 'Cada cifra vale según su lugar. Así se lee el número 345.678.',
            bullets: [
              '3 centenas de millar = 300.000',
              '4 decenas de millar = 40.000',
              '5 unidades de millar = 5.000',
              '6 centenas = 600',
              '7 decenas = 70',
              '8 unidades = 8'
            ],
            note: 'Cada lugar vale 10 veces menos que el de su izquierda.'
          }
        ]
      },
      placevalue: {
        title: 'Cuentas rápidas',
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
      comparar: {
        title: 'Comparar está en todas partes',
        items: [
          { icon: '🎒', text: '¿Quién tiene más cromos en la mochila?' },
          { icon: '🍎', text: '¿Qué bolsa pesa más en la compra?' },
          { icon: '📅', text: '¿Quién nació antes y quién después?' },
          { icon: '💰', text: '¿Quién tiene más dinero en la hucha?' }
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
    expoSlideNext: 'Siguiente →',
    expoBack: '← Anterior',
    expoProgress: '{n} / {total}',
    realBack: '← Volver a la explicación',
    realNext: 'Empezar a practicar →',
    level: {          
      n1: 'Hasta 10',
      n2: 'Hasta 20',
      n3: 'Hasta 100',
      n4: 'Hasta 100, con menos marcas',
      c1: 'Hasta 9, con bloques',
      c2: 'Hasta 99, con bloques',
      c3: 'Hasta 99, sin bloques',
      c4: 'Hasta 999',
      c5: 'Hasta 9.999',
      o1: 'Fila de 3',
      o2: 'Fila de 5',
      o3: 'Buscar un lugar',
      u99: 'Hasta 99',
      u999: 'Hasta 999',
      umiles: 'Los miles',
      umillones: 'Millones y billón',
      udictado: 'Escucha y elige',
      counter: 'Contador libre',
      pv1: 'De unidades a decenas',
      pv2: 'De decenas a centenas',
      pv3: 'De centenas a miles',
      pv4: 'Escalera del 10: hasta el millón',
      pv5: 'Escalera del 10: hasta el billón',

           },
    gen: {
      compareYou: 'Tú escribiste',
      compareRight: 'Correcto',
      compareEmpty: '(nada)',
      compararEnunciado: '¿Qué signo falta?',
      compararPista: 'El signo se abre hacia el número más grande.',
      compararAria: 'Compara {a} y {b}.',
      signLess: 'es más pequeño que',
      signGreater: 'es más grande que',
      signEqual: 'es igual a',
      bloquesEnunciado: '¿Qué número forman los bloques?',
      bloquesVisualAria: 'Bloques: {texto}',
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
      escaleraEnunciado: '¿Cuánto es 10 × este número?',
      escaleraPista: 'Por 10: cada cifra se mueve un sitio a la izquierda y se añade un cero.',
      counterHint: 'Pulsa para sumar o restar. Mira cómo cambian las cifras y los grupos (unidades, decenas, centenas, miles…).',
      counterAudioAria: 'Leer el número en voz alta',
      counterResetLabel: '🔄 Empezar en 0',
      counterExitLabel: '✅ Salir',
      counterSepOn: '·1.234',
      counterSepOff: '1234',
      counterGroupsOn: '🎨 Colorear grupos: sí',
      counterGroupsOff: '🎨 Colorear grupos: no',
      counterGroupsAria: 'Colorear cada grupo de 3 cifras',
      counterWordsOn: '✍️ Ocultar cómo se escribe',
      counterWordsOff: '✍️ Mostrar cómo se escribe',
      counterWordsAria: 'Mostrar el número escrito con palabras',
      /* La pista que sale al fallar. Una por tipo de pregunta, y cada una
         dice qué mirar en el dibujo o en el número de delante: la frase
         única de antes («Prueba otra vez. Piensa con calma») era la misma
         para todas. No dan la respuesta, dan la estrategia. */
      socraticCompare: '🤔 «{elegida}» no es el signo. Compara primero las cifras de más valor de los dos números: ellas dicen hacia dónde abre el signo.',
      socraticBlocks: '🤔 «{elegida}» no cuadra con los bloques. Cuenta los bloques de cada grupo y después junta los resultados.',
      socraticTradeUp: '🤔 «{elegida}» no es el número de grupos. Mira los bloques y agrúpalos de diez en diez: cuenta los grupos.',
      socraticTradeDown: '🤔 «{elegida}» no es cuántos bloques pequeños entran. Mira cada bloque grande y cuenta cuántos pequeños caben dentro.',
      socraticLadder: '🤔 «{elegida}» no tiene los ceros que toca. Mira el número: es un uno seguido de ceros, cuenta cuántos hay.',
      /* Práctica interactiva de "escribir números" — el número se
         genera y se reproduce en audio. "Generar" lo dice en voz
         alta, "Reproducir" lo repite, "Comprobar" valida, "Ver
         resultado" lo muestra. */
      escribirInputPrompt: 'Escucha el número y escríbelo.',
      escribirInputGenerate: '🎲 Generar número',
      escribirInputReplay: '🔊 Reproducir',
      escribirInputCheck: '✅ Comprobar',
      escribirInputReveal: '👁 Ver resultado',
      escribirInputIdleHint: 'Pulsa «Generar» para escuchar el número.',
      escribirInputNoAudio: 'El audio no está disponible en este navegador — el número se mostrará al pulsar «Ver resultado».',
      /* Práctica interactiva de "leer números" — el número se genera
         al pulsar un botón, se muestra en palabras; el usuario escribe
         la forma numérica. "Comprobar" valida, "Ver resultado" revela. */
      lecturaInputPrompt: 'Lee el número y escríbelo.',
      lecturaInputGenerate: '🎲 Generar número',
      lecturaInputCheck: '✅ Comprobar',
      lecturaInputReveal: '👁 Ver resultado',
      lecturaInputIdleHint: 'Pulsa «Generar» para empezar.'
    },
    transfer: 'Esto te servirá para leer números grandes o saber qué cifra cambia al sumar 100.',

    /* Mensajes para la práctica interactiva de "leer números". Los
       textos de acierto / revelación viven en la raíz para que app.js
       los busque igual que busca explicacionCorrecta. */
    lecturaInputCorrect: '✅ ¡Correcto! El número es {n}.',
    lecturaInputRevealed: '👁 La respuesta es {n}. Puedes corregirla en la casilla.',

    /* Mensajes para la práctica interactiva de "escribir números".
       Misma forma que lecturaInputCorrect / lecturaInputRevealed. */
    escribirInputCorrect: '✅ ¡Correcto! El número es {n}.',
    escribirInputRevealed: '👁 La respuesta es {n}. Puedes corregirla en la casilla.',

    /* Solución que se muestra al fallar en "leer" y "escribir números".
       Un número no se resuelve con una pista: se enseña cómo se escribe
       y la persona lo escribe otra vez tras pulsar «Entendido». */
    /* Mismo mensaje, pero con lo que la persona escribió delante de la
       solución, para que pueda comparar las dos cifras. Si no escribió
       nada, se usa typedSolution. */
    typedSolutionMine: '👀 Tú has escrito: {typed}. Así se escribe: {n}. Se lee: {words}. Escríbelo tú en la casilla.',
    typedSolution: '👀 Así se escribe: {n}. Se lee: {words}. Escríbelo tú en la casilla.'
}, 'es');
})();
