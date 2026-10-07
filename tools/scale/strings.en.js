/* ============================================================
   Calculia — Scale text (EN)
   Locale-specific file. Same keys as strings.es.js.
   It is loaded conditionally from index.html depending on
   App.i18n.locale().
   Instrument names live in 'real.*' and app.js looks them up by the
   id data.js uses, so adding an instrument means adding its id here
   and in both languages.
   All the copy follows UNE 153101: short sentences, one idea per
   sentence, everyday words.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📏 Scale',
    instructionIntro: 'Look at how a scale is read.',

    /* ---- The four ideas, before any question ---- */
    concept: {
      escala: {
        title: 'The scale',
        text: 'It is the list of measures on a tool. Each mark has its number.'
      },
      rayita: {
        title: 'The mark',
        text: 'Each mark is worth the same. That is what a step is.'
      },
      llegar: {
        title: 'Reaching the mark',
        text: 'The object reaches a mark. That mark is its measure.'
      },
      dibujo: {
        title: 'The scale of a drawing',
        text: 'A plan is smaller than real life. The scale says how much smaller.'
      }
    },

    galleryPrevious: 'Previous',
    galleryNext: 'Next',
    introContinue: 'See them in real life →',
    realTitle: 'Scales are all around you',
    realBack: '← Back to the ideas',
    realContinue: 'Start the test →',
    instructionMenu: 'Choose what you want to practise.',
    menuBack: '← Back to the tools',

    real: {
      regla: {
        name: 'A ruler',
        text: 'It measures in centimetres. The shorter marks are millimetres.'
      },
      termo: {
        name: 'A thermometer',
        text: 'It measures temperature. Each mark is one degree.'
      },
      jarra: {
        name: 'A jug in the kitchen',
        text: 'It measures millilitres. Each mark is a hundred.'
      },
      mapa: {
        name: 'A map',
        text: 'A whole city fits on one sheet of paper. The scale makes it possible.'
      },
      agua: {
        name: 'The water meter',
        text: 'Its numbers go up one by one. It is a list of measures, like the ruler.'
      }
    },

    activity: {
      leer: { name: 'Read the measure', detail: 'See how far it reaches.' },
      paso: { name: 'The step', detail: 'What one mark is worth.' },
      instrumento: { name: 'Other tools', detail: 'The same idea, another shape.' },
      plano: { name: 'The scale of a plan', detail: 'From the drawing to real life.' }
    },
    level: {
      l1: 'Marks with numbers',
      l2: 'A number every two marks',
      l3: 'A number every five marks',
      p1: 'What one mark is worth',
      p2: 'How many marks there are',
      t1: 'The thermometer',
      t2: 'The jug',
      d1: 'From the plan to reality',
      d2: 'From reality to the plan'
    },

    endSummary: 'You answered {n} questions in {activity}. You now have {stars} stars.',
    btnHarder: 'Do you want to try "{name}"?',
    btnMenu: 'Back to the start',
    btnOtherActivity: 'Another activity',
    correctExplanation: '✅ Correct! The answer is: ',
    incorrectExplanationA: '❌ Look: the correct answer is ',
    hint: '🤔 Try again. Look at the drawing calmly.',
    reinforceTitle: 'Extra practice',
    reinforceIntro: 'Let us repeat the {n} questions you got wrong until you get them all right.',
    reinforceDone: 'Extra practice finished. You have them all.',

    gen: {
      /* --- reading and the tools: the same reading, three vessels --- */
      readPromptRuler: 'The pencil reaches here. How long is it?',
      readPromptTermo: 'The thermometer points here. What temperature is it?',
      readPromptJar: 'The water reaches here. How much water is there?',
      readAria: 'The pencil reaches the {value} mark.',
      readHint: 'Start at the lowest number and count the marks upwards.',
      levelAria: 'The level reaches {value} degrees.',
      jarAria: 'The water reaches {value} millilitres.',

      /* --- the step --- */
      stepPrompt: 'Each mark is worth the same. What is one mark worth?',
      stepAria: 'On the ruler there are {gaps} marks between {from} and {to}.',
      stepHint: 'Look at how many numbers there are and how many marks separate them.',
      stepsPrompt: 'The pencil starts here and reaches here. How many marks does it go through?',
      stepsAria: 'The pencil goes from {from} to {to}.',
      stepsHint: 'Count the marks it passes, without counting the one it starts at.',

      /* --- the plan --- */
      planKey: 'On the plan, each centimetre is {key} {unit}.',
      planPrompt: 'On the plan it is {cm} cm. How many {unit} is that in real life?',
      planAria: 'On the plan, each centimetre is {key} {unit}. The stretch of plan is {cm} centimetres.',
      planHint: 'Count the centimetres of the road and multiply.',
      planBackPrompt: 'In real life it is {real} {unit}. How many centimetres is that on the plan?',
      planBackAria: 'On the plan, each centimetre is {key} {unit}. In real life it is {real} {unit}.',
      planBackHint: 'Share the {real} {unit} into pieces of {key}.',
      planBackWrong: 'On the plan it is {real} cm in real life.',
      planLabel: 'Plan',
      planPath: 'The road',
      planReal: 'Real life',
      unitCentimetre: 'centimetres',
      unitMetre: 'metres',
      unitKm: 'kilometres'
    },

    transfer: 'It will help you read a recipe, a metro plan or the water meter without fear.'
  }, 'en');
})();