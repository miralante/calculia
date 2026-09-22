/* ============================================================
   Calculia — Places and sizes texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   - 'pos.*' is the bare word (the one chosen as an answer).
   - 'phrase.*' is the position with its reference ("inside the box"),
     which is what you say when naming it in full.
   - 'object.*' are the things placed in the scene; 'thing.*' the ones
     compared. app.js looks them up by the id in data.js.
   - 'dim.*' includes the verb, because "holds more" and "is longer" do
     not fit the same template.
   Short sentences, one idea per sentence (UNE 153101).
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🧭 Places and sizes',
    instructionMenu: 'Choose an activity.',
    contexto: 'Saying where something is and which one is bigger is used every day: looking for something at home, or picking which bag weighs less.',
    explicacion: '✅ There is nothing to count or work out here. Just look and say what you see.',
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
    pos: {
      inside: 'inside',
      outside: 'outside',
      above: 'on top',
      below: 'underneath',
      left: 'on the left',
      right: 'on the right'
    },
    phrase: {
      inside: 'inside the box',
      outside: 'outside the box',
      above: 'on top of the chair',
      below: 'underneath the chair',
      left: 'on the left of the tree',
      right: 'on the right of the tree'
    },
    object: {
      ball: 'the ball',
      cat: 'the cat',
      apple: 'the apple',
      balloon: 'the balloon'
    },
    thing: {
      bus: 'the bus',
      bike: 'the bike',
      train: 'the train',
      car: 'the car',
      tree: 'the tree',
      flower: 'the flower',
      snake: 'the snake',
      worm: 'the worm',
      elephant: 'the elephant',
      feather: 'the feather',
      teddy: 'the teddy',
      house: 'the house',
      apple: 'the apple',
      chair: 'the chair',
      clip: 'the paper clip',
      bathtub: 'the bath',
      cup: 'the cup',
      bucket: 'the bucket',
      spoon: 'the spoon',
      barrel: 'the barrel',
      bottle: 'the baby bottle'
    },
    dim: {
      length: { more: 'is longer', less: 'is shorter' },
      weight: { more: 'weighs more', less: 'weighs less' },
      capacity: { more: 'holds more', less: 'holds less' }
    },
    activity: {
      posicion: { name: 'Where is it', detail: 'Inside, outside, on top, underneath.', instruction: 'Look at the picture and say where the thing is. Inside means in the inner part. Outside means in the outer part. On top means above and underneath means below.' },
      comparar: { name: 'Which one is more', detail: 'Longer, weighs more, holds more.', instruction: 'Look at the two things and think what they are really like, not how they are drawn. Both are drawn the same size on purpose.' }
    },
    level: {
      s1: 'Inside or outside',
      s2: 'On top or underneath',
      s3: 'Left or right',
      s4: 'Find the picture',
      c1: 'Longer or shorter',
      c2: 'Weighs more or less',
      c3: 'Holds more or less'
    },
    gen: {
      where: {
        inOut: 'Is {thing} inside or outside the box?',
        upDown: 'Is {thing} on top of the chair or underneath it?',
        leftRight: 'Is {thing} on the left or on the right of the tree?'
      },
      findWhere: 'In which picture is {thing} {phrase}?',
      whichIs: 'Which one {word}?',
      sceneAria: '{thing} is {phrase}.',
      compareAria: '{a} and {b}, drawn the same size.'
    },
    transfer: 'This will help you understand when someone tells you where something is, and choose what to carry in each hand when one bag weighs more than the other.'
  }, 'en');
})();
