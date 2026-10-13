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
    btnReference: 'See the example',
    btnStartLesson: 'Start practising →',
    btnReturnQuestion: 'Back to the question →',
    btnMenu: 'See the example',
    otherLevel: 'Choose another level',
    endSummary: 'You answered {n} questions of {activity}. Now you have {stars} stars.',
    btnHarder: 'Do you want to try «{name}»?',
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
      trigonometria: {
        name: 'Trigonometry',
        instruction: 'Compare two ladders of the same length.',
        lessonRule: 'The straighter one reaches higher.'
      }
    },
    level: {
      test: 'Full test'
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
      reason: 'Rises {up} and goes {along}',
      countReason: 'Count how far the ramp rises and how far it goes.',
      reasonHint: 'Count the squares on the side that rises and the one that goes along.',
      sameReason: 'Do these two ramps have the same slope?',
      sameReasonHint: 'One is bigger than the other. Count both sides of each one.',
      twoAria: 'Two triangles: one rises {a} and goes {b}; the other rises {c} and goes {d}.',
      whichSameReason: 'This ramp rises {up} and goes {along}. Which one has the same slope?',
      whichSameReasonHint: 'One is the same triangle, but twice as big.',
      reasonOf: 'It rises {up} and goes {along}.',
      ladderSide: 'This ladder is leaning against the wall. Which of the three sides is the hypotenuse?',
      compareLadders: 'Which of these ladders is steeper?',
      ladderCompareExplanation: 'It is more upright and reaches higher.',
      twoLaddersAria: 'Two ladders of the same length. {a} rises {b} and goes {c}. {d} rises {e} and goes {f}.',
      ladderSideHint: 'Look for the slanted side. The other two are straight.',
      ladderAria: 'A ladder leaning against a wall, with the floor below.',
      ladderLetters: 'ABC',
      ladderOption: 'The ladder {x}',
      ladderOptionHint: 'look at the letter it carries',
      ladderTaller: 'The three ladders are the same length. Which one reaches highest up the wall?',
      ladderTallerHint: 'Look how high each one reaches on the wall.',
      ladderAllAria: 'Three ladders of the same length leaning on one wall, each one more or less upright. The one with the letter {a} is flat against the wall, the one with {b} is a little away from it, and the one with {c} is further out still.',
      /* The hint that comes out when an answer is wrong. One per kind of
         question, and each one says what to look at or do with what is on
         screen: the single sentence it replaced ("Try again…") was the
         same for every question, so it said nothing. These never give the
         answer away — they give the strategy, which is what separates a
         Socratic hint from a spoiler. */
      socraticHypotenuse: '🤔 Compare the three sides and look for the longest one.',
      socraticSideByAngle: '🤔 Check whether the side you want sits across from the angle or next to it.',
      socraticReason: '🤔 Count the squares on one side first, then the squares on the other.',
      socraticSameReason: '🤔 Compare the two triangles and see if the numbers repeat the same way.',
      socraticWhichSameReason: '🤔 Look for the triangle that rises and goes in the same proportion as the first.',
      socraticLadderSide: '🤔 Look for the only one of the three sides that leans.',
      socraticLadderCompare: '🤔 Compare how high each ladder reaches on the wall.',
      socraticLadderTaller: '🤔 Look how far each ladder climbs up the wall.'
    },
    transfer: 'This helps you know how far a ladder reaches, whether a ramp is too steep, and whether a roof needs supports.'
  }, 'en');
})();
