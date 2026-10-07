/* ============================================================
   Calculia — Textos de Trigonometría (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   'side.*' son los tres lados del triángulo, nombrados por la faena que
   hacen; app.js los busca por el lado que saca del dibujo, no por un id
   guardado. Al lado de cada nombre va su explicación en palabras de
   todos los días: se enseña la palabra, no se esconde.
   Los números NO están aquí: viven una sola vez en data.js.
   Frases cortas, una idea por frase (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⛰️ Trigonometría',
    instructionMenu: 'Elige una actividad.',
    contexto: 'Las escaleras, las rampas y los tejados inclinados están en todas las calles. La trigonometría mide esas inclinaciones.',
    explicacion: '✅ Aquí no hay ni una fórmula. Todo se cuenta y se mira.',
    btnBackToMenu: '← Otras actividades',
    btnMenu: 'Volver al inicio',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
    btnOtherActivity: 'Otra actividad',
    correctExplanation: '✅ ¡Correcto! La respuesta es: ',
    incorrectExplanationA: '❌ Mira: la respuesta correcta es ',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    reinforceTitle: 'Refuerzo',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    answer: {
      yes: 'Sí',
      no: 'No'
    },
    /* Los tres lados del triángulo rectángulo. El nombre va con su
       explicación al lado: la palabra se enseña, no se esconde. */
    side: {
      up: { name: 'La que sube', gloss: 'pegada a la pared' },
      along: { name: 'La que avanza', gloss: 'pegada al suelo' },
      hyp: { name: 'La hipotenusa', gloss: 'la más larga: es la que está inclinada' }
    },
    activity: {
      lados: {
        name: 'Los tres lados',
        detail: 'Los tres lados del triángulo.',
        instruction: 'Un triángulo rectángulo tiene tres lados. Uno está pegado a la pared, otro pegado al suelo, y el tercero está inclinado. El inclinado es el más largo de todos: ese se llama la hipotenusa.'
      },
      razon: {
        name: 'La razón',
        detail: 'Cuánto sube por cada cuanto avanza.',
        instruction: 'La razón dice cuántos cuadraditos sube el triángulo por cada cuadradito que avanza. Se cuenta en el dibujo. Y da igual que el triángulo sea grande o pequeño: si es igual de inclinado, la razón es la misma.'
      },
      medir: {
        name: 'La escalera',
        detail: 'Medir una inclinación de verdad.',
        instruction: 'Una escalera apoyada en la pared forma un triángulo. Los tres lados son la escalera, la pared y el suelo. La escalera es el único lado que está inclinado, y por eso es la hipotenusa.'
      }
    },
    level: {
      l1: 'La más larga',
      l2: 'La que está enfrente',
      l3: 'La que está al lado',
      y1: 'Contar la razón',
      y2: '¿La misma razón?',
      y3: 'Busca la misma razón',
      u1: 'La escalera y la pared',
      u2: 'Cuánto llega'
    },
    /* Qué parte de la escalera es cuál, para nombrar el lado inclinado
       con una palabra y no solo con un dibujo. */
    ladderPart: {
      ladder: { name: 'La escalera', gloss: 'la que está inclinada' },
      wall: { name: 'La pared', gloss: 'la que está recta arriba' },
      floor: { name: 'El suelo', gloss: 'el que está abajo' }
    },
    gen: {
      triAria: 'Un triángulo rectángulo. Un lado sube {up} y el otro avanza {along}.',
      whichHypotenuse: 'Este triángulo tiene tres lados. ¿Cuál es la hipotenusa?',
      hypHint: 'La hipotenusa es el lado inclinado. Es el más largo de los tres.',
      sideMarked: 'El lado marcado es {side}.',
      cornerB: 'abajo, en la esquina del suelo',
      cornerC: 'arriba, en la esquina de la pared',
      whichOpposite: 'Mira el ángulo de la esquina {where}. ¿Qué lado está enfrente de ese ángulo?',
      whichAdjacent: 'Mira el ángulo de la esquina {where}. La hipotenusa no cuenta, porque también toca ese ángulo. ¿Cuál de los otros dos lados lo toca?',
      oppositeHint: 'El lado que está enfrente es el que no toca el ángulo marcado.',
      adjacentHint: 'Los dos lados rectos tocan una esquina cada uno. Mira cuál toca el ángulo marcado. El inclinado se queda fuera.',
      reason: '{up} por cada {along}',
      countReason: '¿Cuántos cuadraditos sube por cada cuadradito que avanza?',
      reasonHint: 'Cuenta los cuadraditos del lado que sube y los del que avanza.',
      sameReason: '¿Estos dos triángulos suben con la misma razón?',
      sameReasonHint: 'Uno es más grande que el otro. Cuenta los dos lados de cada uno.',
      twoAria: 'Dos triángulos: uno sube {a} y avanza {b}; el otro sube {c} y avanza {d}.',
      whichSameReason: 'Este triángulo sube {up} por cada {along}. ¿Cuál de los tres hace lo mismo?',
      whichSameReasonHint: 'Uno es el mismo triángulo, pero el doble de grande.',
      reasonOf: 'Sube {up} y avanza {along}.',
      ladderSide: 'Esta escalera está apoyada en la pared. ¿Cuál de los tres lados es la hipotenusa?',
      ladderSideHint: 'Busca el lado que está inclinado. Los otros dos están rectos.',
      ladderAria: 'Una escalera apoyada en la pared, con el suelo debajo.',
      ladderLetters: 'ABC',
      ladderOption: 'La escalera {x}',
      ladderOptionHint: 'mira la letra que lleva',
      ladderTaller: 'Las tres escaleras miden lo mismo. ¿Cuál llega más alto por la pared?',
      ladderTallerHint: 'Mira hasta dónde llega cada una en la pared.',
      ladderAllAria: 'Tres escaleras de la misma longitud apoyadas en una pared, cada una más o menos derecha. La de la letra {a} está pegada a la pared, la de la {b} un poco apartada y la de la {c} más lejos todavía.'
    },
    transfer: 'Esto te sirve para saber hasta dónde llega una escalera, si una rampa es muy empinada y si un tejado necesita puntales.'
  }, 'es');
})();