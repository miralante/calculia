/* ============================================================
   Calculia — Ordenar decimales: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '🔹 Ordenar decimales',
    instructionIntro: 'Mira cómo se comparan los decimales.',
    realTitle: 'Los decimales están en la vida real.',
    transfer: 'Lo usas para comparar tiempos, precios y pesos con céntimos y décimas.',

    ui: {
      prev: 'Anterior',
      next: 'Siguiente',
      conceptCount: '{i} de {n}',
      introContinue: 'Ver ejemplos reales →',
      realContinue: 'Empezar a practicar →',
      check: 'Comprobar',
      newRound: 'Otra ronda →',
    },

    /* Questions. {a}, {b}, {v}, {list}, {row} are filled in by the engine. */
    q: {
      promptSmallest: '¿Cuál es el número más pequeño?',
      promptLargest: '¿Cuál es el número más grande?',
      promptOrder: '¿Qué fila va de menor a mayor?',
      promptBetween: '¿Cuál de estos números va entre {a} y {b}?',
      promptMissing: '¿Qué número falta en la fila?',
      rowAria: 'Fila de números: {row}. Falta el número del hueco.',
      hintSmallest: 'Mira primero la parte entera, lo que va antes de la coma. Si es igual, compara las décimas, y después las centésimas.',
      hintSmallestNeg: 'Todos son negativos. El que está más lejos del cero es el más pequeño.',
      hintLargest: 'Mira primero la parte entera, lo que va antes de la coma. El que tiene la parte entera mayor es el más grande. Si empatan, compara las décimas.',
      hintLargestNeg: 'Todos son negativos. El que está más cerca del cero es el más grande.',
      hintOrder: 'Busca primero el número con la parte entera más pequeña. Si empatan, mira las décimas.',
      hintOrderNeg: 'Todos son negativos. El que está más lejos del cero va primero.',
      hintBetween: 'Busca el número que es más grande que {a} y más pequeño que {b}.',
      hintMissing: 'Mira el número de la izquierda y el de la derecha del hueco. ¿Cuál cabe entre los dos?',
      explainSmallest: '{v} es el más pequeño.',
      explainSmallestNeg: '{v} es el más pequeño: está más lejos del cero.',
      explainLargest: '{v} es el más grande.',
      explainLargestNeg: '{v} es el más grande: está más cerca del cero.',
      explainOrder: 'De menor a mayor: {list}.',
      explainBetween: '{v} está entre {a} y {b}.',
      explainMissing: 'Va {v}. La fila, de menor a mayor: {list}.'
    },

    level: {
      halves: { name: 'Decimales redondos', detail: '1,0 · 1,5 · 2,0 · 2,5…' },
      tenths: { name: 'Décimas', detail: '1,3 · 0,7 · 2,6…' },
      roundHundredths: { name: 'Centésimas redondas', detail: '1,25 · 0,75 · 2,05…' },
      all: { name: 'Todos los decimales', detail: 'Cualquier decimal con dos cifras.' }
    },

    concept: {
      1: { title: 'La coma separa', text: 'La coma separa la parte entera de la parte decimal. 2,5 está en medio, entre el 2 y el 3.' },
      2: { title: 'Primero la parte entera', text: 'Mira primero lo que hay antes de la coma. 3,9 es más pequeño que 4,1, aunque tenga más décimas.' },
      3: { title: 'Si empatan, las décimas', text: 'Si la parte entera es igual, mira las décimas. 3,4 es más pequeño que 3,7.' },
      4: { title: 'Si empatan, las centésimas', text: 'Si también empatan las décimas, mira las centésimas. 2,46 es más pequeño que 2,49.' }
    },

    real: {
      race: 'Carrera: 9,85 segundos gana a 9,92 segundos.',
      price: 'Precios: 1,25 € es menos que 1,5 €.',
      weight: 'Pesos: 2,75 kg pesa menos que 2,8 kg.',
      milk: 'Litros: 0,5 litros es menos que 0,75 litros.'
    }
  }, 'es');
})();
