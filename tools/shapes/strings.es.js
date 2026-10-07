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
    /* "Vértice" es el nombre de geometría y "esquina" el de cada día: los
       dos se dicen, porque el niño oye uno en la calle y lo necesita en el
       test. */
    introCornerTitle: 'Vértice',
    introCornerText: 'Es la esquina de la forma: donde se juntan dos lados.',
    introPerimeterTitle: 'Perímetro',
    introPerimeterText: 'Es dar la vuelta a la forma por el borde: se suman todos sus lados.',
    introAreaTitle: 'Área',
    introAreaText: 'Es todo lo de dentro: la superficie que pisas al ponerte encima.',
    introVolumeTitle: 'Volumen',
    introVolumeText: 'Es el hueco que hay dentro y que se puede llenar de cosas.',
    introSymmetryTitle: 'Simetría',
    introSymmetryText: 'Es que la forma se dobla en dos mitades que coinciden exactamente.',
    introSimilarityTitle: 'Semejanza',
    introSimilarityText: 'Es la misma forma a otro tamaño: más grande o más pequeña.',
    introSolidTitle: 'Cuerpo',
    introSolidText: 'No es plana. Es como una pelota que puedes coger.',
    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Ver en la vida real →',
    realTitle: 'Las formas están a nuestro alrededor',
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
    /* La aclaración de la galería: cuántos lados tiene la forma plana o
       cuántas caras tiene el cuerpo y de qué forma son. Los lados salen
       de DATA.sides, que es la misma fuente que el dibujo y las
       preguntas; aquí solo vive el texto. El círculo y la esfera no
       tienen lados rectos ni caras planas: decirlo con palabras y no
       con un 0, que parece algo que hay que contar. */
    note: {
      sides: '{n} lados y {corners} vértices',
      sidesNone: 'Sin lados rectos ni vértices',
      solid: {
        cube: '6 caras: 6 cuadrados.',
        rectangularPrism: '6 caras: 2 cuadrados y 4 rectángulos.',
        triangularPrism: '5 caras: 2 triángulos y 3 rectángulos.',
        pyramid: '5 caras: 1 cuadrado y 4 triángulos.',
        sphere: 'No tiene caras planas. Toda su superficie es curva.',
        cylinder: '2 caras planas: 2 círculos. Y 1 superficie curva.',
        cone: '1 cara plana: 1 círculo. Y 1 superficie curva.'
      }
    },
    /* Lo que aporta el ejemplo cotidiano: los tres conceptos sobre el
       objeto de verdad que se acaba de mirar. No vuelve a definirlos —
       eso ya está en la diapositiva de conceptos — sino que los cuenta
       sobre ese puerta, esa ventana o ese cubo de playa. Solo hay texto
       para las formas planas: lados, vértices y perímetro son palabras de
       una figura, y un cuerpo tiene caras. */
    realNote: {
      polygon: 'Tiene {sides} lados y {corners} vértices. El perímetro es la vuelta por el borde, y el área, todo lo de dentro.',
      circle: 'El borde es redondo: no tiene lados rectos ni vértices. El perímetro se mide por la curva y el área es el disco de dentro.',
      solid: 'Ocupa sitio de verdad: el volumen es el hueco que hay dentro y se puede llenar.'
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
      cornersPrompt: '¿Cuántos vértices tiene?',
      cornersHint: 'Cuenta los puntos marcados.',
      perimeterPrompt: 'Cada lado mide {side} cm. ¿Cuánto mide el perímetro?',
      perimeterHint: 'Suma todos los lados: el perímetro es la vuelta entera.',
      /* El área todavía no se cuenta aquí: se pregunta por la parte de la
         forma que es, y las dos opciones falsas son justo por lo que se
         confunde — el borde que se acaba de contar y los vértices. */
      areaPrompt: '¿Qué parte de esta forma es su área?',
      areaHint: 'Piensa en la parte que pisas cuando te pones encima.',
      areaAria: 'Una forma plana con la parte de dentro rayada.',
      areaEdge: 'El borde de fuera',
      areaInside: 'Todo lo de dentro',
      areaCorners: 'Los vértices',
      volumePrompt: '¿Cuál de estos cuerpos ocupa más sitio?',
      volumeHint: 'Lo que ocupa más sitio es el que tiene más volumen.',
      volumeAria: 'Tres cuerpos de distinto tamaño: un {name} y dos más pequeños.',
      symmetryPrompt: '¿Por dónde se dobla un {name} para que las dos mitades coincidan?',
      symmetryHint: 'Las dos mitades tienen que quedar exactamente iguales.',
      axis: {
        vertical: 'Doblada por la raya vertical',
        horizontal: 'Doblada por la raya horizontal',
        diagonal: 'Doblada por la raya diagonal'
      },
      similarPrompt: '¿Cuál de estas figuras es un {name} más pequeño?',
      similarHint: 'Tiene que ser la misma forma, no hace falta que sea igual de grande.',
      solidToNamePrompt: '¿Qué forma tiene este objeto?',
      solidToObjectPrompt: '¿Cuál de estos objetos es un {name}?',
      solidHint: 'Piensa en la forma del objeto, no en para qué sirve.'
    },
    transfer: 'Esto te servirá para entender señales y dibujos, y para decir cómo es algo cuando lo tengas que explicar.'
  }, 'es');
})();
