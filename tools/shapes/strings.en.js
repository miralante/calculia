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
    instructionIntro: 'Look at the shapes.',
    introFlatTitle: 'Flat shape',
    introFlatText: 'It is smooth, like a drawing on paper.',
    introSideTitle: 'Side',
    introSideText: 'It is a straight line around the edge.',
    introCornerTitle: 'Corner',
    introCornerText: 'It is where two sides meet.',
    introSolidTitle: 'Solid',
    introSolidText: 'It is not flat. You can hold it, like a ball.',
    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    introContinue: 'See it in real life →',
    realTitle: 'Shapes are all around us',
    realSide: 'Each straight line around a flat shape is a side.',
    realBack: '← Back to the shapes',
    realContinue: 'Take the test →',
    instructionMenu: 'Take one test with all the content.',
    testTitle: 'One complete test',
    testText: 'One round with shapes, solids, and nets.',
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
      hexagon: 'hexagon',
      octagon: 'octagon'
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
        circle: 'The clock is shaped like a circle.',
        triangle: 'The warning sign is shaped like a triangle.',
        square: 'A small window can be shaped like a square.',
        rectangle: 'The door is shaped like a rectangle.',
        rhombus: 'The kite is shaped like a rhombus.',
        trapezoid: 'Seen from the side, a beach bucket looks like a trapezoid.',
        pentagon: 'The shield is shaped like a pentagon.',
        hexagon: 'The cells in a honeycomb are hexagons.',
        octagon: 'The stop sign is shaped like an octagon.',
        cube: 'The die is shaped like a cube.',
        rectangularPrism: 'The cereal box is shaped like a rectangular prism.',
        triangularPrism: 'The tent is shaped like a triangular prism.',
        pyramid: 'An Egyptian pyramid.',
        sphere: 'The ball is shaped like a sphere.',
        cylinder: 'The tin can is shaped like a cylinder.',
        cone: 'The ice-cream cone is shaped like a cone.'
      }
    },
    activity: {
      formas: { name: 'Shapes', detail: 'One test with all shapes and solids.' }
    },
    level: {
      test: 'Complete test'
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
