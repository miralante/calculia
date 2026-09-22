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
    instructionMenu: 'Choose an activity.',
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
      pentagon: 'pentagon',
      hexagon: 'hexagon'
    },
    solid: {
      cube: 'cube',
      sphere: 'sphere',
      cylinder: 'cylinder'
    },
    activity: {
      desarrollos: { name: 'Solids opened up', detail: 'Prisms and pyramids.', instruction: 'If you open a box out flat, you see all its faces. That is called the net. Count them: a cube has 6 square faces, a prism has 2 triangles and 3 rectangles, and a pyramid has 1 square and 4 triangles.' },
      planas: { name: 'Flat shapes', detail: 'Circle, square, triangle…', instruction: 'Look at the picture and say which shape it is. Later you will count its sides and its corners. A side is a straight line. A corner is where two sides meet.' },
      cuerpos: { name: 'Solids', detail: 'Cube, sphere and cylinder.', instruction: 'Solids are shapes that take up space: you can pick them up. A die is a cube. A ball is a sphere. A tin is a cylinder.' }
    },
    level: {
      p1: 'How many faces?',
      p2: 'What does it fold into?',
      g1: 'Three shapes',
      g2: 'Four shapes',
      g3: 'Count the sides',
      g4: 'Count the corners',
      b1: 'From object to name',
      b2: 'From name to object'
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
