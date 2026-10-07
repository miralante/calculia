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
    /* "Vertex" is the geometry word and "corner" the everyday one. Both are
       said, because the child hears one of them out on the street and
       needs the other one for the test. */
    introCornerTitle: 'Vertex',
    introCornerText: 'It is the corner of the shape: where two sides meet.',
    introPerimeterTitle: 'Perimeter',
    introPerimeterText: 'It is going all the way round the shape along the edge: you add up all its sides.',
    introAreaTitle: 'Area',
    introAreaText: 'It is all of the inside: the surface you stand on.',
    introVolumeTitle: 'Volume',
    introVolumeText: 'It is the space inside, the part you can fill with things.',
    introSymmetryTitle: 'Symmetry',
    introSymmetryText: 'It is that the shape folds into two halves that match exactly.',
    introSimilarityTitle: 'Similarity',
    introSimilarityText: 'It is the same shape at another size: bigger or smaller.',
    introSolidTitle: 'Solid',
    introSolidText: 'It is not flat. You can hold it, like a ball.',
    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    introContinue: 'See it in real life →',
    realTitle: 'Shapes are all around us',
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
    /* Gallery clarification: how many sides a flat shape has, or how many
       faces a solid has and what they are shaped like. The side count
       comes from DATA.sides, the same source as the drawing and the
       questions; only the text lives here. The circle and the sphere
       have no straight sides and no flat faces, which is said with words
       and not with a 0 that looks like something there is to count. */
    note: {
      sides: '{n} sides and {corners} vertices',
      sidesNone: 'No straight sides and no vertices',
      solid: {
        cube: '6 faces: 6 squares.',
        rectangularPrism: '6 faces: 2 squares and 4 rectangles.',
        triangularPrism: '5 faces: 2 triangles and 3 rectangles.',
        pyramid: '5 faces: 1 square and 4 triangles.',
        sphere: 'No flat faces. The whole surface is curved.',
        cylinder: '2 flat faces: 2 circles. And 1 curved surface.',
        cone: '1 flat face: 1 circle. And 1 curved surface.'
      }
    },
    /* What the everyday example adds: the three concepts applied to the real
       object just looked at. It does not define them again — that is the
       concept slide's job — it counts them on that door, window or beach
       bucket. Only flat shapes get one: sides, vertices and perimeter are
       words for a figure, and a solid has faces. */
    realNote: {
      polygon: 'It has {sides} sides and {corners} vertices. The perimeter is the way round the edge, and the area is all of the inside.',
      circle: 'The edge is round: it has no straight sides and no vertices. The perimeter is measured along the curve and the area is the disc inside.',
      solid: 'It really takes up room: the volume is the space inside, and you can fill it.'
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
      cornersPrompt: 'How many vertices does it have?',
      cornersHint: 'Count the marked dots.',
      perimeterPrompt: 'Each side is {side} cm long. How long is the perimeter?',
      perimeterHint: 'Add up all the sides: the perimeter is the whole way round.',
      /* The area is not counted here yet: the question is which part of the
         shape it is, and the two wrong answers are exactly what it gets
         confused with — the edge just counted and the vertices. */
      areaPrompt: 'Which part of this shape is its area?',
      areaHint: 'Think of the part you stand on when you step on it.',
      areaAria: 'A flat shape with the inside hatched.',
      areaEdge: 'The outside edge',
      areaInside: 'All of the inside',
      areaCorners: 'The vertices',
      volumePrompt: 'Which of these solids takes up more room?',
      volumeHint: 'The one that takes up more room is the one with more volume.',
      volumeAria: 'Three solids of different sizes: a {name} and two smaller ones.',
      symmetryPrompt: 'Which way do you fold a {name} so the two halves match?',
      symmetryHint: 'The two halves have to come out exactly the same.',
      axis: {
        vertical: 'Folded on the vertical line',
        horizontal: 'Folded on the horizontal line',
        diagonal: 'Folded on the diagonal line'
      },
      similarPrompt: 'Which of these figures is a smaller {name}?',
      similarHint: 'It has to be the same shape; it does not have to be as big.',
      solidToNamePrompt: 'What shape is this object?',
      solidToObjectPrompt: 'Which of these objects is a {name}?',
      solidHint: 'Think about the shape of the object, not what it is for.'
    },
    transfer: 'This will help you understand signs and drawings, and describe what something is like when you need to explain it.'
  }, 'en');
})();
