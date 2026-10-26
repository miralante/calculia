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
    introSymmetryText: 'Es que la forma se dobla en dos mitades iguales.',
    introSimilarityTitle: 'Semejanza',
    introSimilarityText: 'Es la misma forma a otro tamaño: más grande o más pequeña.',
    introAreaSquareTitle: 'Cuadrado',
    introAreaSquareText: 'Su área es lado × lado.',
    introAreaRectangleTitle: 'Rectángulo',
    introAreaRectangleText: 'Su área es base × altura.',
    introAreaTriangleTitle: 'Triángulo',
    introAreaTriangleText: 'Su área es (base × altura) ÷ 2. Es la mitad de un rectángulo con la misma base y altura.',
    introEquilateralTitle: 'Equilátero',
    introEquilateralText: 'Sus 3 lados miden lo mismo.',
    introIsoscelesTitle: 'Isósceles',
    introIsoscelesText: 'Tiene 2 lados iguales.',
    introScaleneTitle: 'Escaleno',
    introScaleneText: 'Sus 3 lados son distintos.',
    introRightTitle: 'Rectángulo',
    introRightText: 'Tiene una esquina recta, como la de una hoja de papel.',
    introAcuteTitle: 'Acutángulo',
    introAcuteText: 'Sus 3 esquinas son más cerradas que la de una hoja de papel.',
    introObtuseTitle: 'Obtusángulo',
    introObtuseText: 'Tiene una esquina más abierta que la de una hoja de papel.',
    introCountSquareTitle: 'Cuadrado',
    introCountSquareText: 'Cuenta los cuadraditos de dentro, fila a fila.',
    introCountRectangleTitle: 'Rectángulo',
    introCountRectangleText: 'Cuenta sus cuadraditos de dentro: cuántos hay en cada fila y cuántas filas hay.',
    introCountTriangleTitle: 'Triángulo',
    introCountTriangleText: 'Los cuadraditos cortados por la diagonal son medios. Dos medios forman uno entero, así que el triángulo cubre la mitad del cuadrado.',
    introSolidTitle: 'Cuerpo',
    introSolidText: 'No es plana. Es como una pelota que puedes coger.',
    galleryPrevious: 'Anterior',
    galleryNext: 'Siguiente',
    introContinue: 'Ver en la vida real →',
    realTitle: 'Las formas están a nuestro alrededor',
    realBack: '← Volver a las formas',
    realContinue: 'Empezar a practicar →',
    instructionMenu: 'Haz una prueba con todos los contenidos.',
    testTitle: 'Una prueba completa',
    testText: 'Una ronda con formas, cuerpos y desarrollos.',
    /* La hoja de prueba muestra todas las preguntas a la vez. La persona
       va eligiendo una opción por pregunta y al final pulsa "Comprobar"
       para que se verifique todo. "Otra ronda" re-baraja y vuelve a
       empezar sin pasar por la pantalla de fin. */
    check: 'Comprobar',
    newRound: 'Otra ronda →',
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
    /* La genérica se queda solo como respaldo de showHint(), para una
       pregunta que se olvide de traer la suya: la clave `pista` que había
       aquí era esta misma frase duplicada y nadie la leía. */
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
    /* Los nombres de los tipos de triángulo. Van completos ("triángulo
       equilátero") porque son la respuesta de la pregunta, no un título. */
    triKind: {
      equilateral: 'triángulo equilátero',
      isosceles: 'triángulo isósceles',
      scalene: 'triángulo escaleno',
      right: 'triángulo rectángulo',
      acute: 'triángulo acutángulo',
      obtuse: 'triángulo obtusángulo'
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
      formas: { name: 'Formas', detail: 'Una prueba con todas las formas y cuerpos.' },
      mitad: { name: 'Doblar por la mitad', detail: 'Si coincide o no, y si una figura está movida o girada.' }
    },
    level: {
      test: 'Prueba completa',
      mitad: 'Doblar por la mitad'
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
      cornersPrompt: '¿Cuántos vértices tiene?',
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
      similarPrompt: '¿Cuál es la figura semejante?',
      similarHint: 'Tiene que ser la misma forma, no hace falta que sea igual de grande.',
      solidToNamePrompt: '¿Qué forma tiene este objeto?',
      solidToObjectPrompt: '¿Cuál de estos objetos es un {name}?',
      solidHint: 'Piensa en la forma del objeto, no en para qué sirve.',
      triangleAria: 'Un triángulo.',
      triangleSidesPrompt: '¿Qué tipo de triángulo es según sus lados?',
      triangleAnglesPrompt: '¿Qué tipo de triángulo es según sus ángulos?',
      areaCalcPrompt: '¿Cuánto mide el área de este {name}? Responde en cm².',
      cmValue: '{n} cm',
      sideLabel: 'lado',
      baseLabel: 'base',
      heightLabel: 'altura',
      /* La pista que sale al fallar. Una por tipo de pregunta, y todas
         dicen qué hacer con la figura que se está mirando: la frase
         única que había antes («Prueba otra vez. Mira el dibujo con
         calma») era la misma para las 50 preguntas, así que no decía
         nada. Estas no dan la respuesta —dan la estrategia concreta—,
         que es lo que distingue una pista socrática de un spoiler. */
      socraticSides: '🤔 Cuenta los lados uno por uno, sin saltarte ninguno.',
      socraticCorners: '🤔 Cuenta los puntos marcados uno por uno, sin saltarte ninguno.',
      socraticName: '🤔 Cuenta los lados de la figura uno por uno. El número que te salga es el nombre de la forma.',
      socraticPerimeter: '🤔 El perímetro es la suma de todos los lados. Si cada lado mide lo mismo, multiplica lado por lados.',
      socraticArea: '🤔 El área es todo lo que está dentro del borde, no el borde de fuera ni los vértices.',
      socraticVolume: '🤔 Mira el tamaño de los tres cuerpos: el más grande es el que más sitio ocupa.',
      socraticSymmetry: '🤔 Dobla por cada raya y mira en cuál quedan las dos mitades exactamente iguales.',
      socraticSimilar: '🤔 La figura semejante tiene la misma forma, no hace falta que sea del mismo tamaño.',
      socraticFaces: '🤔 Cuenta las piezas del dibujo una por una: cada pieza es una cara del cuerpo.',
      socraticNet: '🤔 Dobla cada pieza en la cabeza: ¿qué cuerpo sale cuando se cierra?',
      socraticSolid: '🤔 Fíjate en la forma del objeto, no en para qué se usa ni en su color.',
      socraticTriangleSides: '🤔 Mira las marcas de los lados: los que tienen la misma marca miden lo mismo. Si un lado no tiene marca, es distinto de los demás.',
      socraticTriangleAngles: '🤔 Mira la esquina más abierta. Si es como la de una hoja de papel, es rectángulo; si es más abierta, es obtusángulo; si las tres son más cerradas, es acutángulo.',
      socraticAreaCalc: '🤔 Multiplica las dos medidas. Si es un triángulo, divide el resultado entre 2.',
      foldPrompt: 'Si doblas por la raya, ¿coinciden los dos lados?',
      foldPickPrompt: '¿Cuál de las dos coincide al doblarla por la raya?',
      foldHint: 'Mira un lado de la raya y luego el otro.',
      foldAria: 'Una figura dibujada en una cuadrícula, con su raya de doblar.',
      foldOption: 'Una de las dos figuras.',
      foldYes: 'Sí',
      foldNo: 'No',
      socraticFold: '🤔 Dobla el dibujo por la raya y mira si sobra algo en un lado.',
      socraticFoldPick: '🤔 Imagina que doblas cada dibujo por su raya y compáralos.',
      whichMoved: '¿Cuál es la misma figura, solo movida de sitio?',
      movedHint: 'Movida sigue mirando igual. Girada mira hacia otro lado.',
      movedAria: 'Una figura dibujada en una cuadrícula.',
      ariaMoved: 'La misma figura movida de sitio.',
      ariaTurned: 'La figura girada.',
      ariaFlipped: 'La figura del revés, como en un espejo.',
      socraticMoved: '🤔 Busca el dibujo que mira hacia el mismo lado que el primero.'
    },
    transfer: 'Esto te servirá para entender señales y dibujos, y para decir cómo es algo cuando lo tengas que explicar.'
  }, 'es');
})();
