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
    instructionIntro: 'Mira las formas.',
    introFlatTitle: 'Forma plana',
    introFlatText: 'Es lisa, como un dibujo en el papel.',
    introSideTitle: 'Lado',
    introSideText: 'Es una línea recta del borde.',
    introCornerTitle: 'Esquina',
    introCornerText: 'Es donde se juntan dos lados.',
    introSolidTitle: 'Cuerpo',
    introSolidText: 'No es plana. Es como una pelota que puedes coger.',
    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Ver en la vida real →',
    realTitle: 'Las formas están a nuestro alrededor',
    realSide: 'Cada línea recta del borde de una forma plana es un lado.',
    realBack: '← Volver a las formas',
    realContinue: 'Hacer el test →',
    instructionMenu: 'Haz una prueba con todos los contenidos.',
    testTitle: 'Una prueba completa',
    testText: 'Una ronda con formas, cuerpos y desarrollos.',
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
      hexagon: 'hexágono',
      octagon: 'octágono'
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
        hexagon: '{name}',
        octagon: '{name}'
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
        square: 'Una ventana pequeña puede tener forma de cuadrado.',
        rectangle: 'La puerta tiene forma de rectángulo.',
        rhombus: 'La cometa tiene forma de rombo.',
        trapezoid: 'El cubo de playa, visto de lado, parece un trapecio.',
        pentagon: 'El escudo tiene forma de pentágono.',
        hexagon: 'Las celdas del panal tienen forma de hexágono.',
        octagon: 'La señal de stop tiene forma de octágono.',
        cube: 'El dado tiene forma de cubo.',
        rectangularPrism: 'La caja de cereales tiene forma de prisma rectangular.',
        triangularPrism: 'La tienda tiene forma de prisma triangular.',
        pyramid: 'Una pirámide egipcia.',
        sphere: 'La pelota tiene forma de esfera.',
        cylinder: 'La lata tiene forma de cilindro.',
        cone: 'El cucurucho tiene forma de cono.'
      }
    },
    activity: {
      formas: { name: 'Formas', detail: 'Una prueba con todas las formas y cuerpos.' }
    },
    level: {
      test: 'Prueba completa'
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
