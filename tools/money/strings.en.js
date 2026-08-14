/* ============================================================
   Calculia — Money texts (EN)
   Locale-specific file. Loaded conditionally from index.html
   according to App.i18n.locale().
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '💰 Money',
    instructionMenu: 'Choose an activity.',
    contexto: 'You are at a shop. You have some money, you see a price and pay with a banknote. Is it enough? How much change?',
    explicacion: '✅ With these calculations you can tell whether your money is enough and check the change you get back.',
    noteWallet: '💶 To pay with real coins, open {link}.',
    notaMonederoLink: 'The Wallet',
    notaMonedero: '💶 To pay with real coins, go to {link}.',
    noteWallet: '💶 To pay with real coins, go to {link}.',
    noteWalletLink: 'The Wallet',
    btnBackToMenu: '← Other activities',
    otherLevel: 'Choose another level',
    resumenFinal: 'You solved {n} questions of {actividad}. You now have {stars} stars.',
    endSummary: 'You solved {n} questions of {actividad}. You now have {stars} stars.',
    btnHarder: 'Want to try «{nombre}»?',
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
    leyendaEurosTxt: 'euros',
    legendEurosTxt: 'euros',
    leyendaComaTxt: 'the comma and the cents',
    legendCommaTxt: 'the comma and the cents',
    euroUno: '1 euro',
    oneEuro: '1 euro',
    euroVarios: '{e} euros',
    manyEuros: '{e} euros',
    precioConCentimos: '{euros} and {c} cents',
    priceWithCents: '{euros} and {c} cents',
    activity: {
      llega: { name: 'Is it enough?', detail: 'Do you have enough money?', instruction: 'See how much money you have. See how much it costs. Decide if it is enough or not.' },
      cambio: { name: 'The Change', detail: 'How much change?', instruction: 'You pay with a banknote. You get back what is left. Calculate the change.' },
      decimales: { name: 'Prices', detail: 'Euros and the comma.', instruction: 'The comma separates euros and cents. Euros come first, cents after.' }
    },
    level: { ll1: 'One item', ll2: 'Two items', ca1: 'Easy change', ca2: 'Change with cents', d1: 'Read prices', d2: 'Which costs more?' },
    producto: { pan: 'bread', leche: 'milk', zumo: 'juice', manzanas: 'apples', queso: 'cheese', galletas: 'biscuits', lapiz: 'pencil', cuaderno: 'notebook' },
    product: { pan: 'bread', leche: 'milk', zumo: 'juice', manzanas: 'apples', queso: 'cheese', galletas: 'biscuits', lapiz: 'pencil', cuaderno: 'notebook' },
    gen: {
      preciosEnunciado: 'How do you say this price?',
      pricesPrompt: 'How do you say this price?',
      comparaPreciosEnunciado: 'Which costs more?',
      comparePrompt: 'Which costs more?',
      llegaUnoEnunciado: 'Do you have enough money to buy this?',
      oneEnoughPrompt: 'Do you have enough money to buy this?',
      llegaDosEnunciado: 'Do you have enough money to buy both?',
      twoEnoughPrompt: 'Do you have enough money to buy both?',
      etqTienes: 'You have:',
      youHave: 'You have:',
      opcionSi: 'Yes, it is enough',
      optionYes: 'Yes, it is enough',
      opcionNo: 'No, not enough money',
      optionNo: 'No, not enough money',
      cambioEnunciado: 'How much change do you get?',
      changePrompt: 'How much change do you get?',
      etqPagas: 'You pay with:',
      youPayWith: 'You pay with:',
      etqCuesta: 'It costs:',
      itCosts: 'It costs:'
    },
    transferencia: 'This will help you handle money in daily life: knowing if you have enough, counting change or reading a price.',
    transfer: 'This will help you handle money in daily life: knowing if you have enough, counting change or reading a price.'
  }, 'en');
})();
