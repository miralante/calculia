/* ============================================================
   Calculia — Geometry texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   'angle.*' holds the three kinds of angle; app.js looks them up by the
   kind it works out from the degrees, not by a stored id.
   The numbers are NOT here: they live once, in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📐 Geometry',
    instructionMenu: 'Choose an activity.',
    contexto: 'Corners, edges and halves are in every door, every floor tile and any piece of paper you fold.',
    explicacion: '✅ Everything here can be counted or seen. There is no formula to learn.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to start',
    otherLevel: 'Choose another level',
    endSummary: 'You solved {n} questions of {activity}. You now have {stars} stars.',
    btnHarder: 'Want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the picture calmly.',
    reinforceTitle: 'Reinforcement',
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    /* The real name, with its everyday-words gloss beside it: the word is
       taught, not hidden. */
    angle: {
      right: { name: 'right', gloss: 'like a corner' },
      acute: { name: 'acute', gloss: 'more closed' },
      obtuse: { name: 'obtuse', gloss: 'more open' }
    },
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    activity: {
      circulo: { name: 'The circle', detail: 'The border and the inside.', instruction: 'The border of a circle is a bit more than 3 times what the circle measures across. That is why the answer is an «about». For the inside you count the whole squares that fit.' },
      volumen: { name: 'Volume', detail: 'How many cubes fit.', instruction: 'Volume is how many cubes fit inside a box. The layers are drawn one below the other: count the cubes in one layer and then how many layers there are.' },
      clasificar: { name: 'Equal sides', detail: 'Count them and name it.', instruction: 'Sides that are equal carry the same mark. Count the matching marks and you will know how many sides are the same length. Then you will name the figure.' },
      coordenadas: { name: 'Squares on a grid', detail: 'One square, two numbers.', instruction: 'Each square is said with two numbers: first the column (the ones along the bottom) and then the row (the ones down the left). The numbers are written on the grid: there is nothing to count from memory.' },
      rectas: { name: 'Two lines', detail: 'Do they touch?', instruction: 'Two lines may never touch at all: they are parallel. Or they may cross. And if they make a square corner where they cross, they are perpendicular. Look at the drawing and decide.' },
      angulos: { name: 'Angles', detail: 'Right, acute or obtuse.', instruction: 'An angle is how open a corner is. A right angle is like the corner of a sheet of paper: in the picture it is marked with a grey line. If the line reaches exactly the grey line, the angle is right. If it stops before, it is acute: more closed. If it goes past, it is obtuse: more open.' },
      perimetro: { name: 'The edge', detail: 'How far round it is.', instruction: 'The edge is the path you walk going all the way round the outside of the figure. You count it square by square, without skipping the corners.' },
      area: { name: 'The inside', detail: 'How many squares fit.', instruction: 'Here you do not count the edge: you count the squares inside the figure.' },
      simetria: { name: 'Fold in half', detail: 'Does it match or not.', instruction: 'Imagine folding the picture along the middle line. If the two sides match exactly, the figure is symmetrical. If something is left over on one side, it is not.' }
    },
    level: {
      w1: 'The border of the circle',
      w2: 'What fits inside',
      v1: 'Count the cubes',
      m3: 'Moved or turned?',
      q1: 'How many equal sides?',
      q2: 'The name of the triangle',
      q3: 'The name of the 4-sided figure',
      k1: 'Which square is it on?',
      k2: 'Find the square',
      n1: 'Right or acute',
      n2: 'Right or obtuse',
      n3: 'All three together',
      p1: 'The edge of a square',
      p2: 'The edge of a rectangle',
      a1: 'The squares in a square',
      a2: 'The squares in a rectangle',
      m1: 'Does it match?',
      m2: 'Find the one that matches',
      n4: 'How many degrees?',
      n5: 'The degrees on a clock',
      a3: 'The squares in a triangle',
      v2: 'The squares on the outside',
      k3: 'Which one is off the line?',
      r1: 'Parallel or crossing?'
    },
    /* What each pair of lines is called. app.js looks them up by the name
       it works out from comparing the two slopes in the drawing. */
    lines: {
      parallel: 'Parallel: they never touch',
      perpendicular: 'Perpendicular: a square corner',
      crossing: 'They cross, but not square'
    },
    figure: {
      equilateral: { name: 'equilateral', gloss: 'all three sides equal' },
      isosceles: { name: 'isosceles', gloss: 'two sides equal' },
      scalene: { name: 'scalene', gloss: 'all three sides different' },
      square: { name: 'square', gloss: 'four equal sides and right corners' },
      rectangle: { name: 'rectangle', gloss: 'two long and two short' },
      rhombus: { name: 'rhombus', gloss: 'four equal sides, but leaning' }
    },
    gen: {
      circleEdge: 'A circle measures {d} centimetres across. How long is its border?',
      circleHint: 'The border is a bit more than 3 times those {d} centimetres.',
      circleAria: 'A circle with a line {d} centimetres across it.',
      about: 'about {n} cm',
      circleArea: 'How many whole squares fit inside the circle?',
      circleAreaHint: 'Count only the squares that are wholly inside.',
      circleGridAria: 'A circle on a grid, with {n} whole squares inside.',
      volume: 'How many cubes fit in the box?',
      volumeHint: 'Each layer has {per} cubes, and there are {layers} layers.',
      boxAria: 'A box of {layers} layers of {per} cubes.',
      degrees: '{n} degrees',
      measureAngle: 'How many degrees is this angle?',
      protractorHint: 'Follow the arm out to the edge and read the number. Each little tick is {step} degrees.',
      protractorAria: 'An angle of {n} degrees on a protractor.',
      clockAngle: 'The two hands are on the {a} and on the {b}. What angle do they make?',
      clockHint: 'A whole turn is {turn} degrees and there are {marks} marks, so from one mark to the next is {each} degrees. Count the marks the short way round.',
      clockAria: 'A clock with its hands on the {a} and on the {b}.',
      linePair: 'What are these two lines like?',
      linesHint: 'If they meet anywhere, they cross. And if they make a square corner where they cross, they are perpendicular.',
      linesAria: 'Two lines inside a box.',
      triangleArea: 'How many little squares are in the coloured triangle?',
      triangleHint: 'The triangle is exactly half of the dashed rectangle. Count the rectangle and halve it.',
      triangleAria: 'A triangle inside a rectangle of {w} by {h} little squares.',
      surface: 'The box is opened out. How many little squares does it have on the outside?',
      surfaceHint: 'Count the little squares on all six faces, one face at a time.',
      netAria: 'The six faces of a box {w} by {h} by {d}, opened out.',
      offTheLine: 'Three of the points are in a straight line. Which one is off it?',
      lineUpHint: 'Picture a ruler resting on the points: one of them stays outside.',
      pointsAria: '{n} points on a grid.',
      dotLetters: 'ABCD',
      whichMoved: 'Which is the same figure, only moved somewhere else?',
      movedHint: 'Moved, it still faces the same way. Turned, it faces another way.',
      movedAria: 'A figure drawn on a grid.',
      ariaMoved: 'The same figure moved somewhere else.',
      ariaTurned: 'The figure turned round.',
      ariaFlipped: 'The figure the other way round, as in a mirror.',
      howManyEqual: 'How many sides are the same length?',
      equalHint: 'Sides with the same mark are the same length.',
      equalAria: 'A figure with {n} equal sides marked.',
      whichFigure: 'What is this figure called?',
      whichSquare: 'Which square is the dot on?',
      findSquare: 'In which picture is the dot on square {where}?',
      coordHint: 'First the column along the bottom, then the row down the left.',
      coordLabel: 'column {col}, row {row}',
      whichAngle: 'What is this angle like?',
      angleHint: 'The grey line marks where a right angle is.',
      perimeter: 'How many squares long is the edge?',
      perimeterHint: 'Go all the way round the figure counting the squares along the edge.',
      area: 'How many squares are inside?',
      areaHint: 'Count the squares inside, row by row.',
      rectAria: 'A figure {w} squares wide and {h} squares tall.',
      isSymmetric: 'If you fold along the line, do the two sides match?',
      pickSymmetric: 'Which of the two matches when you fold it along the line?',
      symmetryHint: 'Look at one side of the line, then at the other.',
      ariaSymmetric: 'A figure that matches when folded.',
      ariaNotSymmetric: 'A figure that does not match when folded.'
    },
    transfer: 'This will help you work out how much tape you need to go round something, how many tiles fit on a floor, or where to fold a piece of paper so both halves are the same.'
  }, 'en');
})();
