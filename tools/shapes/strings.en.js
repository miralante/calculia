/* ============================================================
   Calculia — Shapes texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   Shape and solid names live in 'shape.*' and 'solid.*': app.js looks
   them up by the id data.js uses, so adding a shape means adding its id
   here and in both languages.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔷 Shapes',
    instructionIntro: 'Look at these two shapes.',
    introFlatTitle: 'Flat shape',
    introFlatText: 'It is smooth, like a drawing on paper.',
    introSideText: 'Side: a straight line on the edge.',
    introCornerText: 'Corner: where two sides meet.',
    introSolidTitle: 'Solid',
    introSolidText: 'It is not flat. You can hold it, like a ball.',
    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    introContinue: 'See them in real life →',
    instructionReal: 'Now let us see where these shapes appear.',
    realTitle: 'Shapes are all around us',
    realShape: 'This object is shaped like a {name}.',
    realSide: 'Each straight line around a flat shape is a side.',
    realBack: '← Back to the shapes',
    realContinue: 'Take the test →',
    instructionMenu: 'Choose what you want to practise.',
    testTitle: 'Which shapes can you recognise?',
    testText: 'Take a test on flat shapes, solids, or solid nets.',
    menuBack: '← Back to the examples',
    contexto: 'A road sign, a window, a ball, a tin. Shapes are in everything you touch and see.',
    explicacion: '✅ Recognising shapes helps you describe things and understand signs, plans and drawings.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    explicacionCorrecta: '✅ Correct! The answer is: ',
    correctExplanation: '✅ Correct! The answer is: ',
    explicacionIncorrectaA: '❌ Look: the correct answer is ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    pista: '🤔 Try again. Look at the picture calmly.',
    hint: '🤔 Try again. Look at the picture calmly.',
    refuerzoTitulo: 'Reinforcement',
    reinforceTitle: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    shape: {
      circle: 'circle',
      square: 'square',
      triangle: 'triangle',
      rectangle: 'rectangle',
      rhombus: 'rhombus',
      trapezoid: 'trapezoid',
      pentagon: 'pentagon',
      hexagon: 'hexagon'
    },
    solid: {
      cube: 'cube',
      sphere: 'sphere',
      cylinder: 'cylinder',
      rectangularPrism: 'rectangular prism',
      triangularPrism: 'triangular prism',
      pyramid: 'pyramid',
      cone: 'cone'
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
        circle: 'A clock is shaped like a circle.',
        triangle: 'A warning sign is shaped like a triangle.',
        square: 'A tile can be shaped like a square.',
        rectangle: 'A door is often shaped like a rectangle.',
        rhombus: 'A kite can be shaped like a rhombus.',
        trapezoid: 'Some plant pots are shaped like a trapezoid.',
        pentagon: 'Some panels on a football are shaped like a pentagon.',
        hexagon: 'The cells in a honeycomb are shaped like a hexagon.',
        cube: 'A die is shaped like a cube.',
        rectangularPrism: 'A cereal box is shaped like a rectangular prism.',
        triangularPrism: 'A tent can be shaped like a triangular prism.',
        pyramid: 'The pyramids of Egypt are shaped like pyramids.',
        sphere: 'A ball is shaped like a sphere.',
        cylinder: 'A tin can is shaped like a cylinder.',
        cone: 'An ice-cream cone is shaped like a cone.'
      }
    },
    activity: {
      desarrollos: { name: 'Solid nets', detail: 'Prisms and pyramids.', instruction: 'If you open a box out flat, you see all its faces. That is called the net. Count the faces and look at their shapes.' },
      planas: { name: 'Flat shapes', detail: 'Polygons and circles.', instruction: 'Look at the picture and say which shape it is. Later you will count its sides and corners.' },
      cuerpos: { name: 'Solids', detail: 'Prisms, pyramids, and round solids.', instruction: 'Solids take up space. You can recognise them by their flat and curved faces.' }
    },
    level: {
      p1: 'How many faces?',
      p2: 'What does it fold into?',
      g1: 'Three shapes',
      g2: 'Four shapes',
      g3: 'Six shapes',
      g4: 'Eight shapes',
      g5: '3 to 5 sides',
      g6: '3 to 5 corners',
      b1: 'From object to name',
      b2: 'More solids',
      b3: 'From name to object'
    },
    net: {
      cube: { name: 'cube', gloss: '6 squares' },
      prism: { name: 'prism', gloss: '2 triangles and 3 rectangles' },
      pyramid: { name: 'pyramid', gloss: '1 square and 4 triangles' }
    },
    gen: {
      howManyFaces: 'This is a {name} opened up. How many faces has it got?',
      facesHint: 'Count the pieces in the drawing: each one is a face.',
      netAria: 'A {name} opened up, with its {n} faces.',
      fromNet: 'If you fold this drawing, which solid do you get?',
      netHint: 'Look at the shape of each piece and how many there are.',
      netPiecesAria: 'A solid opened up, with {n} pieces.',
      shapeNamePrompt: 'Which shape is it?',
      sidesPrompt: 'How many sides does it have?',
      sidesHint: 'Count the straight lines around the edge.',
      cornersPrompt: 'How many corners does it have?',
      cornersHint: 'Count the marked dots.',
      solidToNamePrompt: 'What shape is this object?',
      solidToObjectPrompt: 'Which of these objects is a {name}?',
      solidHint: 'Think about the shape of the object, not what it is for.'
    },
    transfer: 'This will help you understand signs and drawings, and describe what something is like when you need to explain it.'
  }, 'en');
})();
