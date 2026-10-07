/* ============================================================
   Calculia — Patterns texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: 'Patterns',
    titleH1: '🔵 Patterns',
    instruction: 'Look at the series. Choose what comes next.',
    chooseLevel: 'Choose an activity',
    whatNext: 'What comes next?',
    queSigueAudio: 'What comes next?',
    btnMenu: 'Back to start',
    endSummary: 'You won {n} stars. You now have {stars} stars.',
    chooseOtherLevel: 'Choose another activity',
    explicacionCorrecta: '✅ Correct! Next in the series comes: ',
    explicacionIncorrectaA: "❌ That doesn't follow the pattern. What comes next is: ",
    pista: '🤔 Try again. Look calmly at the series.',

    /* ---- One Socratic hint per kind of series ----
       `pista` stays as showHint()'s fallback. Each level builds its
       series in a different way, so its hint says what to look at in
       that row of pictures: the two that take turns, the group that
       repeats, the numbers counting up, the letter that goes with
       each symbol. None of them says what comes next. */
    pistaParejas: '🤔 Look at which two pictures keep taking turns.',
    pistaGrupos: '🤔 Look at what repeats: the group of pictures or the size of the circle.',
    pistaNumeros: '🤔 Look at how much the number goes up or down each time.',
    pistaCodigo: '🤔 Look at which letter always goes with each symbol.',
    refuerzoTitulo: 'Reinforcement',
    refuerzoIntro: "Let's repeat the {n} questions you missed until you get them all right.",
    reinforceDone: "Reinforcement done! You've got them all.",
    transfer: 'This will help you notice patterns in everyday life: the days of the week, the order of your routine, the stripes on your pyjamas or the tiles in the bathroom.'
  }, 'en');
})();
