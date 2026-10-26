/* ============================================================
   Calculia — Textos de Funciones lineales y afines (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   'real.*' y 'activity.*' se buscan por el id que usa data.js.
   Todo el texto sigue UNE 153101: frases cortas, una idea por
   frase, palabras de cada día. "Regla" y "recta" valen más que
   "función" y "pendiente" en la primera pantalla; la palabra técnica
   aparece después, cuando ya se ha visto lo que nombra.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📈 Funciones',
    instructionIntro: 'Mira cómo una regla convierte un número en otro.',

    /* ---- Las cuatro ideas, antes de preguntar ---- */
    concept: {
      casilla: {
        title: 'Una casilla, dos números',
        text: 'Cada punto se dice con dos números. Primero x: el número de abajo. Después y: el número de la izquierda.'
      },
      regla: {
        title: 'La regla es una máquina',
        text: 'Entra un número. La regla lo cambia. Sale otro número. Con cada número que entra se hace una tabla.'
      },
      pendiente: {
        title: 'Cuánto sube',
        text: 'Une los puntos y salen en línea recta. Cada vez que avanzas una casilla, la recta sube lo mismo. Ese cuánto es la m.'
      },
      origen: {
        title: 'Dónde empieza',
        text: 'Si la recta pasa por el cero, es lineal: y = m · x. Si empieza en otro número, es afín: y = m · x + n. La n es ese número.'
      }
    },

    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Verlo en la vida real →',
    realTitle: 'Las funciones están a tu alrededor',
    realContinue: 'Empezar a practicar →',
    instructionMenu: 'Elige qué quieres practicar.',

    /* ---- Ejemplos de la vida real ---- */
    real: {
      taxi: {
        name: 'Un taxi',
        text: 'Cobra 3 € al empezar y 1 € por cada kilómetro. Aunque no te muevas, ya pagas 3 €.'
      },
      hucha: {
        name: 'Una hucha',
        text: 'Tienes 10 € guardados. Cada semana ahorras 2 €. Empiezas en 10 y cada semana sube 2.'
      },
      galletas: {
        name: 'Un paquete de galletas',
        text: 'Cada paquete trae 4 galletas. Si no compras ninguno, no tienes galletas: empieza en cero.'
      }
    },

    activity: {
      casilla: { name: 'Las casillas', detail: 'Un punto, dos números.' },
      tabla: { name: 'La regla y la tabla', detail: 'Entra un número, sale otro.' },
      recta: { name: 'La recta', detail: '¿Cuál se sale? ¿Pasa por el cero?' },
      pendiente: { name: 'Cuánto sube y dónde empieza', detail: 'Cuánto sube cada vez y dónde empieza.' },
      test: { name: '¡Vamos a practicar!', detail: 'Una ronda con preguntas de todo.' }
    },

    kind: {
      lineal: 'Lineal: pasa por el cero',
      afin: 'Afín: empieza en otro número'
    },

    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnMenu: 'Volver al inicio',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    transfer: 'Te servirá para saber cuánto pagas en un taxi o cuánto tendrás ahorrado cada semana.',

    gen: {
      /* --- las casillas --- */
      readCoord: '¿En qué casilla está el punto?',
      gridAria: 'Una cuadrícula con números en los bordes.',
      coordAria: 'x {x}, y {y}',
      coordHint: 'Primero x, el número de abajo. Después y, el de la izquierda.',
      socraticCoord: '🤔 Baja desde el punto hasta el número de abajo. Después sube hasta el de la izquierda.',
      findPoint: '¿En qué dibujo está el punto en la casilla {where}?',
      socraticFindPoint: '🤔 Busca el número de abajo y el de la izquierda. El punto está donde se cruzan.',

      /* --- la regla y la tabla --- */
      tablePrompt: 'Cuando x vale {x}, ¿cuánto vale y?',
      tableAria: 'Una tabla de x e y. Falta el valor de y cuando x vale {x}.',
      tableHint: 'Mira cuánto sube y de una fila a la siguiente.',
      socraticTable: '🤔 Mira cuánto cambia y de una fila a la otra. ¿En qué número empieza?',
      explainLinear: 'Cada vez que x sube 1, y sube {m}. Con x = {x}: {m} · {x} = {y}.',
      explainAffine: 'Empieza en {n}. Cada vez que x sube 1, y sube {m}. Con x = {x}: {m} · {x} + {n} = {y}.',

      /* --- la recta --- */
      offTheLine: 'Tres puntos están en línea recta. ¿Cuál se sale?',
      pointsAria: '{n} puntos en una cuadrícula.',
      dotLetters: 'ABCD',
      lineUpHint: 'Imagina una regla apoyada en los puntos: uno se queda fuera.',
      socraticOffLine: '🤔 Fíjate en qué punto no sigue la recta que forman los otros.',
      explainOffLine: 'Los otros tres sí están en la misma recta.',
      kindPrompt: 'Mira la recta. ¿Es lineal o afín?',
      kindHint: 'Lineal: pasa por el cero. Afín: no pasa por el cero.',
      socraticKind: '🤔 Mira la esquina de abajo a la izquierda. ¿La recta pasa por ahí?',

      /* --- cuánto sube y dónde empieza --- */
      slopePrompt: 'Cada vez que avanzas una casilla a la derecha, ¿cuánto sube la recta?',
      slopeHint: 'Mira dos puntos seguidos. ¿Cuánto sube de uno al otro?',
      socraticSlope: '🤔 Cuenta cuántas casillas sube la recta cuando avanza una.',
      explainSlope: 'Entre dos puntos seguidos, la recta sube {m}.',
      startPrompt: '¿En qué número empieza la recta?',
      startHint: 'Mira dónde toca la recta la línea de la izquierda.',
      socraticStart: '🤔 Busca el punto de la recta que está sobre la línea de la izquierda y lee su número.',
      explainStart: 'La recta empieza en {n}: ahí toca la línea de la izquierda.',

      machineIn: 'entra',
      machineOut: 'sale'
    }
  }, 'es');
})();
