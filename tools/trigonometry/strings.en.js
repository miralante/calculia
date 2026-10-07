/* ============================================================
   Calculia — Trigonometry texts (EN)
   Language-specific file. Same keys as strings.es.js.
   'side.*' are the three sides of the right triangle, named after the
   job they do; app.js looks them up by the side it reads off the
   drawing, not by a stored id. Each name carries its plain-words gloss
   beside it: the word is taught, not hidden.
   The numbers are NOT here: they live once in data.js.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '⛰️ Trigonometry',
    instructionMenu: 'Choose an activity.',
    contexto: 'Ladders, ramps and sloping roofs are on every street. Trigonometry measures those slopes.',
    explicacion: '✅ There is not one formula here. Everything is counted and looked at.',
    btnBackToMenu: '← Other activities',
    btnMenu: 'Back to the start',
    otherLevel: 'Choose another level',
    endSummary: 'You answered {n} questions of {activity}. Now you have {stars} stars.',
    btnHarder: 'Do you want to try «{name}»?',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the drawing calmly.',
    reinforceTitle: 'Practice again',
    reinforceIntro: 'We are going to repeat the {n} questions you got wrong until you get them all right.',
    reinforceDone: 'Practice finished! You have them all now.',
    answer: {
      yes: 'Yes',
      no: 'No'
    },
    side: {
      up: { name: 'The one that goes up', gloss: 'next to the wall' },
      along: { name: 'The one that goes along', gloss: 'next to the floor' },
      hyp: { name: 'The hypotenuse', gloss: 'the longest one: it is the slanted side' }
    },
    activity: {
      lados: {
        name: 'The three sides',
        detail: 'The three sides of the triangle.',
        instruction: 'A right triangle has three sides. One is next to the wall, one is next to the floor, and the third is slanted. The slanted one is the longest of all: that is called the hypotenuse.'
      },
      razon: {
        name: 'The ratio',
        detail: 'How much it rises for how much it goes.',
        instruction: 'The ratio says how many squares the triangle rises for every square it goes along. You count it in the drawing. It does not matter whether the triangle is big or small: if it is leaning the same way, the ratio is the same.'
      },
      medir: {
        name: 'The ladder',
        detail: 'Measuring a real slope.',
        instruction: 'A ladder leaning against a wall makes a triangle. The three sides are the ladder, the wall and the floor. The ladder is the only slanted side, so that is the hypotenuse.'
      }
    },
    level: {
      l1: 'The longest one',
      l2: 'The one across',
      l3: 'The one next to it',
      y1: 'Count the ratio',
      y2: 'The same ratio?',
      y3: 'Find the same ratio',
      u1: 'The ladder and the wall',
      u2: 'How high it reaches'
    },
    ladderPart: {
      ladder: { name: 'The ladder', gloss: 'the slanted one' },
      wall: { name: 'The wall', gloss: 'the straight one going up' },
      floor: { name: 'The floor', gloss: 'the one at the bottom' }
    },
    gen: {
      triAria: 'A right triangle. One side rises {up} and the other goes along {along}.',
      whichHypotenuse: 'This triangle has three sides. Which one is the hypotenuse?',
      hypHint: 'The hypotenuse is the slanted side. It is the longest of the three.',
      sideMarked: 'The marked side is {side}.',
      cornerB: 'at the bottom, in the floor corner',
      cornerC: 'at the top, in the wall corner',
      whichOpposite: 'Look at the angle in the corner {where}. Which side is across from that angle?',
      whichAdjacent: 'Look at the angle in the corner {where}. The hypotenuse does not count, because it touches that angle too. Which of the other two sides touches it?',
      oppositeHint: 'The side across is the one that does not touch the marked angle.',
      adjacentHint: 'Each straight side touches one corner. Look at which one touches the marked angle. The slanted one stays out of it.',
      reason: '{up} for every {along}',
      countReason: 'How many squares does it rise for every square it goes along?',
      reasonHint: 'Count the squares on the side that rises and the one that goes along.',
      sameReason: 'Do these two triangles rise with the same ratio?',
      sameReasonHint: 'One is bigger than the other. Count both sides of each one.',
      twoAria: 'Two triangles: one rises {a} and goes {b}; the other rises {c} and goes {d}.',
      whichSameReason: 'This triangle rises {up} for every {along}. Which of the three does the same?',
      whichSameReasonHint: 'One is the same triangle, but twice as big.',
      reasonOf: 'It rises {up} and goes {along}.',
      ladderSide: 'This ladder is leaning against the wall. Which of the three sides is the hypotenuse?',
      ladderSideHint: 'Look for the slanted side. The other two are straight.',
      ladderAria: 'A ladder leaning against a wall, with the floor below.',
      ladderLetters: 'ABC',
      ladderOption: 'The ladder {x}',
      ladderOptionHint: 'look at the letter it carries',
      ladderTaller: 'The three ladders are the same length. Which one reaches highest up the wall?',
      ladderTallerHint: 'Look how high each one reaches on the wall.',
      ladderAllAria: 'Three ladders of the same length leaning on one wall, each one more or less upright. The one with the letter {a} is flat against the wall, the one with {b} is a little away from it, and the one with {c} is further out still.'
    },
    transfer: 'This helps you know how far a ladder reaches, whether a ramp is too steep, and whether a roof needs supports.'
  }, 'en');
})();