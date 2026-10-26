/* ============================================================
   Calculia — Primos y compuestos — datos
   Formato:
   - DATA.concepts y DATA.real: las diapositivas de concepto y los
     ejemplos de la vida real, en orden. Cada uno corresponde a una
     clave de `concept.*` o `real.*` en strings.<locale>.js.
   - DATA.numbers: números que se preguntan si son primos, compuestos
     o ninguna de las dos cosas (el 1).
   - DATA.pickSets: cuatro números, uno primo y tres compuestos. El
     primo nunca va solo en el dibujo: app.js comprueba al arrancar
     que cada conjunto tiene exactamente un primo.
   - DATA.factorNumbers: compuestos cuya descomposición en primos se
     pregunta. Los primos no entran: su descomposición es el propio
     número.
   Los textos NO están aquí: viven en strings.<locale>.js.
   ============================================================ */
var DATA = {
  perRound: 6,

  /* Las cuatro diapositivas de conceptos, en orden. */
  concepts: [
    { id: 'prime' },
    { id: 'composite' },
    { id: 'one' },
    { id: 'factors' }
  ],

  /* Ejemplos de la vida real. El objeto es el emoji que se ve en grande. */
  real: [
    { id: 'candies', object: '🍬' },
    { id: 'tiles', object: '🧱' },
    { id: 'clock', object: '⏰' }
  ],

  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 35, 36, 39, 42,
    45, 48, 49, 50, 51, 60],

  pickSets: [
    { prime: 2, others: [9, 15, 21] },
    { prime: 3, others: [4, 8, 10] },
    { prime: 5, others: [12, 14, 16] },
    { prime: 13, others: [15, 20, 25] },
    { prime: 17, others: [18, 21, 27] },
    { prime: 23, others: [24, 26, 28] },
    { prime: 29, others: [30, 33, 35] },
    { prime: 31, others: [32, 34, 36] },
    { prime: 37, others: [38, 39, 40] },
    { prime: 43, others: [44, 46, 48] },
    { prime: 47, others: [45, 49, 51] }
  ],

  factorNumbers: [6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30, 36, 45, 60]
};
