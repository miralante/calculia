/* ============================================================
   Calculia — Measures texts (EN)
   Locale-specific file. Same keys as strings.es.js.
   Loaded conditionally from index.html according to App.i18n.locale().
   The questions for each measure (length, weight, capacity) are NOT
   here: they live in data.js, because each one carries its own correct
   answer and its two hand-written wrong answers.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '📏 Measures',
    instructionMenu: 'Choose an activity.',
    contexto: 'You measure a room, weigh fruit on the scales or fill a bottle. Measures are everywhere.',
    explicacion: '✅ Knowing measures helps you buy just what you need and understand how much something takes up or weighs.',
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
    pista: '🤔 Try again. Think calmly.',
    hint: '🤔 Try again. Think calmly.',
    refuerzoTitulo: 'Reinforcement',
    reinforceTitle: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    /* The name of each rung of the ladder. The key is the symbol,
       which is notation and lives in data.js */
    unit: {
      'km': 'kilometer',
      'hm': 'hectometer',
      'dam': 'decameter',
      'm': 'meter',
      'dm': 'decimeter',
      'cm': 'centimeter',
      'mm': 'millimeter',
      'kg': 'kilogram',
      'hg': 'hectogram',
      'dag': 'decagram',
      'g': 'gram',
      'dg': 'decigram',
      'cg': 'centigram',
      'mg': 'milligram',
      'kl': 'kiloliter',
      'hl': 'hectoliter',
      'dal': 'decaliter',
      'l': 'liter',
      'dl': 'deciliter',
      'cl': 'centiliter',
      'ml': 'milliliter'
    },
    /* In the plural, for when the question talks about several. Spelled out
       rather than built in code, so another language can differ */
    unitPlural: {
      'km': 'kilometers',
      'hm': 'hectometers',
      'dam': 'decameters',
      'm': 'meters',
      'dm': 'decimeters',
      'cm': 'centimeters',
      'mm': 'millimeters',
      'kg': 'kilograms',
      'hg': 'hectograms',
      'dag': 'decagrams',
      'g': 'grams',
      'dg': 'decigrams',
      'cg': 'centigrams',
      'mg': 'milligrams',
      'kl': 'kiloliters',
      'hl': 'hectoliters',
      'dal': 'decaliters',
      'l': 'liters',
      'dl': 'deciliters',
      'cl': 'centiliters',
      'ml': 'milliliters'
    },
    activity: {
      medidas: { name: 'Measures', detail: 'Metres, kilos and litres.', instruction: 'Think how long, how heavy or how much it holds. Tap the answer.' },
      escalera: { name: 'The ladder', detail: 'Each step, times 10.', instruction: 'The units sit on a ladder. The top rung is the biggest one. Every time you go down a rung, it is multiplied by 10. That 10 is written between each rung and the next: count them.' }
    },
    level: {
      me1: 'Length: metres',
      me2: 'Weight: kilos',
      me3: 'Capacity: litres',
      es1: 'How many rungs?',
      es2: 'Times what?',
      es3: 'Change the unit'
    },
    gen: {
      timesTen: '×10',
      stepsApart: 'From the {big} down to the {small}, how many rungs is it?',
      stepsHint: 'Count the jumps between one rung and the next, not the rungs.',
      ladderAria: 'A ladder of units, with the {big} and the {small} marked.',
      stepFactor: 'How many {small} fit in 1 {big}?',
      factorHint: 'Every rung you go down is one more ×10.',
      ladderConvert: '{n} {big}, how many {small} is that?',
      convertHint: 'Go down the rungs one at a time, multiplying by 10 each time.'
    },
    transfer: 'This will help you buy things by weight, follow a recipe, work out whether something fits where you want it, and change from one unit to another without getting lost.'
  }, 'en');
})();
