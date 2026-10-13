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
    btnReference: 'Ver el ejemplo',
    btnStartLesson: 'Empezar a practicar →',
    btnReturnQuestion: 'Volver a la pregunta →',
    btnMenu: 'Ver el ejemplo',
    otherLevel: 'Elegir otro nivel',
    endSummary: 'Has resuelto {n} preguntas de {activity}. Ahora tienes {stars} estrellas.',
    btnHarder: '¿Quieres probar «{name}»?',
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
      trigonometria: {
        name: 'Trigonometría',
        instruction: 'La escalera, la pared y el suelo forman un triángulo. La escalera es el lado inclinado: la hipotenusa.',
        lessonRule: 'La pared muestra cuánto sube la escalera; el suelo, cuánto avanza. La esquina entre pared y suelo forma un ángulo recto. Compara cuánto sube y cuánto avanza para ver la inclinación: con la misma escalera, cuanto más sube, más recta está.'
      }
    },
    level: {
      test: 'Prueba completa'
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
      reason: 'Sube {up} y avanza {along}',
      countReason: 'Cuenta cuánto sube y cuánto avanza la rampa.',
      reasonHint: 'Cuenta los cuadraditos del lado que sube y los del que avanza.',
      sameReason: '¿Estas dos rampas tienen la misma inclinación?',
      sameReasonHint: 'Uno es más grande que el otro. Cuenta los dos lados de cada uno.',
      twoAria: 'Dos triángulos: uno sube {a} y avanza {b}; el otro sube {c} y avanza {d}.',
      whichSameReason: 'Esta rampa sube {up} y avanza {along}. ¿Cuál tiene la misma inclinación?',
      whichSameReasonHint: 'Uno es el mismo triángulo, pero el doble de grande.',
      reasonOf: 'Sube {up} y avanza {along}.',
      ladderSide: 'Esta escalera está apoyada en la pared. ¿Cuál de los tres lados es la hipotenusa?',
      compareLadders: '¿Cuál de estas escaleras está más inclinada?',
      ladderCompareExplanation: 'Está más vertical y llega más alto.',
      twoLaddersAria: 'Dos escaleras del mismo largo. La {a} sube {b} y avanza {c}. La {d} sube {e} y avanza {f}.',
      ladderSideHint: 'Busca el lado que está inclinado. Los otros dos están rectos.',
      ladderAria: 'Una escalera apoyada en la pared, con el suelo debajo.',
      ladderLetters: 'ABC',
      ladderOption: 'La escalera {x}',
      ladderOptionHint: 'mira la letra que lleva',
      ladderTaller: 'Las tres escaleras miden lo mismo. ¿Cuál llega más alto por la pared?',
      ladderTallerHint: 'Mira hasta dónde llega cada una en la pared.',
      ladderAllAria: 'Tres escaleras de la misma longitud apoyadas en una pared, cada una más o menos derecha. La de la letra {a} está pegada a la pared, la de la {b} un poco apartada y la de la {c} más lejos todavía.',
      /* La pista que sale al fallar. Una por tipo de pregunta, y todas
         dicen qué mirar o qué hacer con lo que hay en pantalla: la frase
         única que había antes («Prueba otra vez…») era la misma para
         todas las preguntas, así que no decía nada. Estas no dan la
         respuesta —dan la estrategia—, que es lo que distingue una
         pista socrática de un spoiler. */
      socraticHypotenuse: '🤔 Compara los tres lados y busca el más largo.',
      socraticSideByAngle: '🤔 Mira si el lado que buscas está enfrente del ángulo o junto a él.',
      socraticReason: '🤔 Cuenta primero los cuadritos de un lado y luego los del otro.',
      socraticSameReason: '🤔 Compara los dos triángulos y mira si los números se repiten igual.',
      socraticWhichSameReason: '🤔 Busca el triángulo que sube y avanza en la misma proporción que el primero.',
      socraticLadderSide: '🤔 Mira cuál de los tres lados es el único que está inclinado.',
      socraticLadderCompare: '🤔 Compara cuánto sube cada escalera por la pared.',
      socraticLadderTaller: '🤔 Mira hasta dónde sube cada escalera en la pared.'
    },
    transfer: 'Esto te sirve para saber hasta dónde llega una escalera, si una rampa es muy empinada y si un tejado necesita puntales.'
  }, 'es');
})();
