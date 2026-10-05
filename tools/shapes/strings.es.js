/* ============================================================
   Calculia — Textos de Formas (ES)
   Archivo específico del idioma. Mismas claves que strings.en.js.
   Se carga condicionalmente desde index.html según App.i18n.locale().
   Los nombres de formas y cuerpos van en 'shape.*' y 'solid.*': app.js
   los busca por el id que usa data.js, así que añadir una forma es
   añadir su id aquí y en los dos idiomas.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔷 Formas',
    instructionIntro: 'Mira estas dos formas.',
    introFlatTitle: 'Forma plana',
    introFlatText: 'Es lisa, como un dibujo en el papel.',
    introSideText: 'Lado: línea recta del borde.',
    introCornerText: 'Esquina: donde se juntan dos lados.',
    introSolidTitle: 'Cuerpo',
    introSolidText: 'No es plana. Es como una pelota que puedes coger.',
    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Verlas en la vida real →',
    instructionReal: 'Ahora veremos dónde aparecen estas formas.',
    realTitle: 'Las formas están a nuestro alrededor',
    realShape: 'Este objeto tiene forma de {name}.',
    realBack: '← Volver a las formas',
    realContinue: 'Hacer el test →',
    instructionMenu: 'Elige qué quieres practicar.',
    testTitle: '¿Qué formas reconoces?',
    testText: 'Haz un test de formas planas, cuerpos o desarrollos.',
    menuBack: '← Volver a los ejemplos',
    contexto: 'Una señal de tráfico, una ventana, una pelota, una lata. Las formas están en todo lo que tocas y ves.',
    explicacion: '✅ Reconocer las formas te ayuda a describir las cosas y a entender señales, planos y dibujos.',
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
    pista: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    hint: '🤔 Prueba otra vez. Mira el dibujo con calma.',
    refuerzoTitulo: 'Refuerzo',
    reinforceTitle: 'Refuerzo',
    refuerzoIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceIntro: 'Vamos a repetir las {n} preguntas que has fallado hasta acertarlas todas.',
    reinforceDone: '¡Refuerzo terminado! Ya las tienes todas.',
    shape: {
      circle: 'círculo',
      square: 'cuadrado',
      triangle: 'triángulo',
      rectangle: 'rectángulo',
      rhombus: 'rombo',
      trapezoid: 'trapecio',
      pentagon: 'pentágono',
      hexagon: 'hexágono'
    },
    solid: {
      cube: 'cubo',
      sphere: 'esfera',
      cylinder: 'cilindro',
      rectangularPrism: 'prisma rectangular',
      triangularPrism: 'prisma triangular',
      pyramid: 'pirámide',
      cone: 'cono'
    },
    gallery: {
      flat: {
        circle: '{name}',
        triangle: '{name}',
        square: '{name}',
        rectangle: '{name}',
        rhombus: '{name}',
        trapezoid: '{name}',
        pentagon: '{name}',
        hexagon: '{name}'
      },
      solid: {
        cube: '{name}',
        rectangularPrism: '{name}',
        triangularPrism: '{name}',
        pyramid: '{name}',
        sphere: '{name}',
        cylinder: '{name}',
        cone: '{name}'
      },
      real: {
        circle: 'El reloj tiene forma de círculo.',
        triangle: 'La señal de peligro tiene forma de triángulo.',
        square: 'Una baldosa puede tener forma de cuadrado.',
        rectangle: 'Una puerta suele tener forma de rectángulo.',
        rhombus: 'Una cometa puede tener forma de rombo.',
        trapezoid: 'Algunas macetas tienen forma de trapecio.',
        pentagon: 'Algunos paneles de un balón tienen forma de pentágono.',
        hexagon: 'Las celdas de un panal tienen forma de hexágono.',
        cube: 'Un dado tiene forma de cubo.',
        rectangularPrism: 'Una caja de cereales tiene forma de prisma rectangular.',
        triangularPrism: 'Una tienda de campaña puede tener forma de prisma triangular.',
        pyramid: 'Las pirámides de Egipto tienen forma de pirámide.',
        sphere: 'Una pelota tiene forma de esfera.',
        cylinder: 'Una lata tiene forma de cilindro.',
        cone: 'Un cucurucho tiene forma de cono.'
      }
    },
    activity: {
      desarrollos: { name: 'Cuerpos abiertos', detail: 'Prismas y pirámides.', instruction: 'Si abres una caja y la dejas plana, ves todas sus caras. A eso se le llama el desarrollo. Cuenta las caras y mira sus formas.' },
      planas: { name: 'Formas planas', detail: 'Polígonos y círculo.', instruction: 'Mira el dibujo y di qué forma es. Después contarás sus lados y sus esquinas.' },
      cuerpos: { name: 'Cuerpos', detail: 'Prismas, pirámides y cuerpos redondos.', instruction: 'Los cuerpos ocupan espacio. Puedes reconocerlos por sus caras planas y curvas.' }
    },
    level: {
      p1: '¿Cuántas caras tiene?',
      p2: '¿Qué sale al doblarlo?',
      g1: 'Tres formas',
      g2: 'Cuatro formas',
      g3: 'Seis formas',
      g4: 'Ocho formas',
      g5: 'Contar los lados',
      g6: 'Contar las esquinas',
      b1: 'Del objeto al nombre',
      b2: 'Más cuerpos',
      b3: 'Del nombre al objeto'
    },
    net: {
      cube: { name: 'cubo', gloss: '6 cuadrados' },
      prism: { name: 'prisma', gloss: '2 triángulos y 3 rectángulos' },
      pyramid: { name: 'pirámide', gloss: '1 cuadrado y 4 triángulos' }
    },
    gen: {
      howManyFaces: 'Este es un {name} abierto. ¿Cuántas caras tiene?',
      facesHint: 'Cuenta las piezas del dibujo: cada una es una cara.',
      netAria: 'Un {name} abierto, con sus {n} caras.',
      fromNet: 'Si doblas este dibujo, ¿qué cuerpo sale?',
      netHint: 'Mira qué forma tiene cada pieza y cuántas hay.',
      netPiecesAria: 'Un cuerpo abierto, con {n} piezas.',
      shapeNamePrompt: '¿Qué forma es?',
      sidesPrompt: '¿Cuántos lados tiene?',
      sidesHint: 'Cuenta las rayas rectas del borde.',
      cornersPrompt: '¿Cuántas esquinas tiene?',
      cornersHint: 'Cuenta los puntos marcados.',
      solidToNamePrompt: '¿Qué forma tiene este objeto?',
      solidToObjectPrompt: '¿Cuál de estos objetos es un {name}?',
      solidHint: 'Piensa en la forma del objeto, no en para qué sirve.'
    },
    transfer: 'Esto te servirá para entender señales y dibujos, y para decir cómo es algo cuando lo tengas que explicar.'
  }, 'es');
})();
